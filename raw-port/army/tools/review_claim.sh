#!/bin/bash
# review_claim.sh — PULL-side of the REVIEW queue (Model B: reviewer slots pull, nobody dispatches).
#
# A reviewer slot calls `review_claim.sh claim`; it returns ONE open PR that needs gating and leases
# it (keyed by PR#+head-SHA) so two reviewer slots never gate the same head at once. It picks a PR
# whose latest faithfulness-gate status is NOT already fresh for its current head — i.e. no status at
# all, or the newest status predates the head commit / is a stale pending. Randomizes among eligible
# PRs so N reviewers spread out. Prints:  CLAIMED <PR#> <headSHA>   or   NONE (exit 1).
#
# Lease dir: $STATE/review_leases/<PR>-<sha12> (atomic mkdir, auto-reclaim after REVIEW_LEASE_MIN min).
# The lease key includes the head sha, so once a PR is re-pushed (new sha) it becomes claimable again.
#
#   review_claim.sh claim              -> lease + CLAIMED <PR#> <sha>, or NONE (exit 1)
#   review_claim.sh release <PR> <sha> -> drop the lease (after pr_gate/pr_land finishes)
#   review_claim.sh status             -> show review leases
set -uo pipefail
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
STATE="${FCT_STATE_DIR:-$HOME/.fct-pool}"; LEAS="$STATE/review_leases"; mkdir -p "$LEAS"
LEASE_MIN="${REVIEW_LEASE_MIN:-45}"

# THE LEASE IS THE ONLY THING STOPPING TWO REVIEWERS FROM GATING ONE HEAD, so freeing it is a
# privileged act and must be one only its holder can perform. This file's own header says the lease
# exists "so two reviewer slots never gate the same head at once"; an unguarded `rm -rf` in the
# release path hands that guarantee to whichever agent's cleanup happens to run — reviewer A's sweep
# frees the lease reviewer B is holding, the queue re-offers the PR, and two slots gate one head and
# both call pr_land. Merging is the least reversible thing this swarm does.
# Measured incident on the sibling queue (2026-08-11): a worker's end-of-run sweep ran
# `rework_claim.sh release 557` on a lease another agent had taken 39 seconds earlier.
# The three copies of this rule (here, rework_claim.sh, rebase_claim.sh) are deliberately identical
# to wt_pool.sh::stamp_holder, and are pinned to agree by test_guards case I and swarm_doctor's
# `lease-ownership` check.
LEASE_RECLAIMED=0
stamp_owner () { # <leasedir> : record the CLAIMANT — or REMOVE a name that is no longer the holder.
  # The `else rm -f` is the property, not tidiness. lease_take's STALE-RECLAIM branch reuses a
  # directory that already carries an owner file, so a reclaim by a caller with no FCT_AGENT_ID
  # would leave the DEAD agent's id on a lease it does not hold. This harness reuses slot ids by
  # design (HARNESS_LOOP invariant 2), so that agent comes back — and the release guard would then
  # authorise the returning `reviewer-3` to free someone else's lease while refusing every other
  # identified agent. A guard whose key names the wrong agent is worse than none, because the
  # refusals it does emit read as proof that it works.
  if [ -n "${FCT_AGENT_ID:-}" ]; then echo "$FCT_AGENT_ID" > "$1/owner"; else rm -f "$1/owner"; fi
}

lease_take () { # <PR> <sha> : 0 if we now hold the lease (fresh or reclaimed), else 1. Prints nothing.
  # Factored out of cmd_claim so the claim side is reachable OFFLINE: test_guards case I drives the
  # real stale-reclaim path here to prove the owner file names the CURRENT holder, and cmd_claim
  # itself cannot be called without gh. The two queues this was copied from expose exactly this
  # shape (`lease_free`), which is the point — the next queue will be written by copying one of
  # these files, so they should not differ in how they take and stamp a lease.
  local lk="$LEAS/pr-$1"
  LEASE_RECLAIMED=0
  if mkdir "$lk" 2>/dev/null; then
    echo "$(date +%s) $2" > "$lk/held"; stamp_owner "$lk"; return 0; fi
  if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "$(date +%s) $2" > "$lk/held"; stamp_owner "$lk"; LEASE_RECLAIMED=1; return 0; fi
  return 1
}

cmd_claim () {
  git fetch -q origin main 2>/dev/null || true
  # all open PRs with head sha + whether the latest faithfulness-gate matches the head.
  # eligible = the newest faithfulness-gate status is missing OR is 'pending' (still needs a real gate).
  # A SUCCESS/FAILURE that is the LATEST status for the current head is 'fresh' -> skip (already gated;
  # merge/reject is handled by the same reviewer tick that gated it, or a human).
  # ALSO claim GREEN-BUT-UNREVIEWED PRs. The filter used to select only NONE/PENDING/EXPECTED, so a
  # PR whose faithfulness-gate had gone green — e.g. re-gated by pr_land, or gated by a reviewer that
  # died before signing — was NEVER handed to a reviewer again. It sat green, unreviewed, and
  # mergeable. That is exactly how #243 reached one merge from landing while its own TS diverged from
  # the live symbol on 8 of 106 cases (issue #285). A green mechanical gate is not a verdict; only a
  # reviewer's APPROVE is. PRs already APPROVED or CHANGES_REQUESTED on their head are left alone.
  # SELF-REVIEW GUARD — keyed on the AGENT, via a marker file, because neither identity works.
  #
  # Two wrong versions of this, both tried:
  #   * skip PRs authored by `vjeux` — STARVES the queue. That operator login is shared by every
  #     agent and by the swarm parent; a reviewer hit this live, skipping PRs that were not theirs.
  #   * skip PRs authored by the reviewer app — a NO-OP. Everything is opened through pr_submit.sh,
  #     which pushes as the WORKER app, so no PR is ever authored by the reviewer identity. Reviewer 1
  #     checked: of the 20 most recent PRs, 16 are app/vjeux-worker and 4 are vjeux, none reviewer.
  # GitHub simply does not record WHICH AGENT opened a PR. So the authoring agent records it itself:
  # pr_submit.sh writes $STATE/authored/<PR>, and a reviewer skips the PRs its own slot authored.
  # FCT_AGENT_ID names the slot — `<role>-<N>`, the value `slot_lock.sh acquire` prints an export
  # line for. THERE IS NO DERIVED DEFAULT, and this comment used to claim one ("the slot lock this
  # process holds, else hostname+pid"), which is worse than the gap itself: a reader who trusts it
  # concludes the guard is live when it is inert. Nothing in the OS links two short-lived `bash -c`
  # invocations of one agent, so the id has to travel in the environment. With it unset the skip
  # cannot fire, and the loop below SAYS SO once per run instead of failing silently. An absent
  # marker still means "not mine" and fails OPEN — a queue that stalls is worse than an occasional
  # self-review, which GitHub refuses harmlessly anyway.
  local mine_dir="${FCT_STATE_DIR:-$HOME/.fct-pool}/authored"
  local rows
  # NOTE: `gh ... --jq` accepts a PROGRAM ONLY — no jq flags. `gh --jq --arg me X '<prog>'` prints
  # "unknown arguments", exits 0, and writes nothing to stdout, so rows comes back EMPTY and every
  # reviewer polls NONE forever against a non-empty queue. Caught in review before it shipped; the
  # 2>/dev/null here would have hidden the message. Pipe to real jq when you need arguments.
  rows=$(gh pr list --repo "$SLUG" --state open --limit 100 \
      --json number,headRefOid,statusCheckRollup,reviewDecision \
      --jq '.[] | {n:.number, sha:.headRefOid, d:(.reviewDecision // ""), s:([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state // "NONE")} | select(.s=="NONE" or .s=="PENDING" or .s=="EXPECTED" or .s=="FAILURE" or (.s=="SUCCESS" and .d!="APPROVED" and .d!="CHANGES_REQUESTED")) | "\(.n)\t\(.sha)\t\(.s)"' 2>/dev/null)
  [ -z "$rows" ] && { echo "NONE"; return 1; }
  # randomize so parallel reviewers don't collide on the same first row
  rows=$(printf '%s\n' "$rows" | sort -R 2>/dev/null || printf '%s\n' "$rows")
  # The skip is OFF unless this process was told who it is. Say so, once, when there is something
  # it could have skipped — a dormant guard that is silent is how #38 reached review believing it
  # worked (reviewer 2 measured it: unset id -> CLAIMED a PR the slot had authored; id exported ->
  # the same run skipped it and printed why).
  if [ -z "${FCT_AGENT_ID:-}" ] && [ -n "$(ls -A "$mine_dir" 2>/dev/null)" ]; then
    echo "review_claim: FCT_AGENT_ID is unset — the self-review skip is INACTIVE for this run" >&2
    echo "              (run: export FCT_AGENT_ID=reviewer-<N>; slot_lock.sh acquire prints it)" >&2
  fi
  while IFS=$'\t' read -r num sha gate; do
    [ -z "$num" ] && continue
    # A GATE FAILURE IS USUALLY THE AUTHOR'S PROBLEM — EXCEPT WHEN THE GATE ASKS FOR A REVIEWER.
    #
    # G5 flags are NO-DISASM blind spots. The gate cannot clear them itself; it posts FAILURE saying
    # in so many words "reviewer must re-derive disasm, then rerun --reviewed", and REVIEWER_BRIEF
    # tells reviewers to do exactly that. But this queue excluded every FAILURE, and rebase_claim
    # only takes failures whose reason is regression/rebase, and rework_claim only takes
    # CHANGES_REQUESTED. So a PR the gate had explicitly handed BACK TO A REVIEWER fell into no
    # queue at all. Measured 2026-08-11 on #645 (`16 G5 flag(s)`, 15 minutes old, reviewDecision
    # empty): swarm_doctor's queue-coverage check reported it as claimable by nothing, which is the
    # only reason anyone noticed. The reviewer who ran the gate is supposed to carry straight on to
    # the re-derivation; when that slot dies mid-unit — and slots die — nothing re-offers the work.
    #
    # The reason lives ONLY in the REST status description; GraphQL's statusCheckRollup returns
    # description: null (verified on all six failing PRs), which is why the rollup query above
    # cannot make this distinction and rebase_claim does the same second call.
    if [ "$gate" = "FAILURE" ]; then
      local gdesc
      gdesc=$(gh api "repos/$SLUG/commits/$sha/statuses" \
                --jq '[.[] | select(.context=="faithfulness-gate")] | first | .description' 2>/dev/null)
      case "$gdesc" in
        *"G5 flag"*|*"re-derive disasm"*) : ;;   # the gate is asking for a reviewer -> ours
        ""|null)
          # `null` is the shape an ANSWERED-BUT-EMPTY query takes: gh --jq prints the four letters
          # for `[] | first | .description`, so a head with no gate status at all — or a call that
          # failed after gh had already written its output — arrives here as a string, not as "".
          # Reading it as a reason would drop the PR into the mechanical branch and skip it in
          # silence; the test that caught this asserts the diagnostic, not just the direction.
          # An unanswered query is not evidence — but here the safe direction is to SKIP, not to
          # offer. Offering on an unknown reason hands reviewers mechanically-failing PRs whose
          # re-gate produces the same FAILURE, i.e. every reviewer churns the same rows forever.
          # Skipping costs one poll, and an orphan left by a transport failure is exactly what
          # swarm_doctor's queue-coverage check is for.
          echo "review_claim: PR #$num — could not read why its gate failed; skipping this pass" >&2
          continue ;;
        *)
          continue ;;                            # a mechanical failure: the AUTHOR fixes it
      esac
    fi
    # Did THIS agent open this PR? (marker written by pr_submit.sh; absent => not mine => proceed)
    if [ -n "${FCT_AGENT_ID:-}" ] && [ -f "$mine_dir/$num" ] \
       && [ "$(cat "$mine_dir/$num" 2>/dev/null)" = "$FCT_AGENT_ID" ]; then
      echo "review_claim: skipping PR #$num — this slot ($FCT_AGENT_ID) authored it" >&2
      continue
    fi
    # LEASE KEY IS THE PR NUMBER, NOT PR+SHA. Keying on the head SHA opened a race that merged an
    # already-rejected port: reviewer-06 held PR #221 @d8ce40e5 and was about to post
    # CHANGES_REQUESTED when main advanced, the PR acquired head @a7610679, a second reviewer slot
    # leased that DIFFERENT key, approved, and merged. The NaN-branch defect landed on main as
    # eb6f6086 (issue #224); the same race also merged #223/#225/#231 out from under that reviewer.
    # A PR under review is under review no matter how its head moves — one reviewer at a time. The
    # lease is released after each verdict, so a genuinely new head still gets re-reviewed next pass.
    # WHOSE TURN IS IT? Use the SAME discriminator rework_claim uses, so the two queues cannot
    # disagree — the head SHA the rejection was recorded against.
    #
    # My first attempt at this (#602) filtered out every CHANGES_REQUESTED PR regardless of head, on
    # the reasoning that a rejected PR belongs to its author. Reviewer 3 measured it against the live
    # queue: all NINE PRs it removed had already been answered, rework_claim SKIPS exactly those, and
    # they would have fallen into NO queue at all — manufacturing the orphan condition swarm_doctor
    # exists to detect. `reviewDecision` stays CHANGES_REQUESTED until a reviewer re-reviews, so it
    # says nothing about whether the author has responded; only the head SHA does.
    #
    #   head moved past the rejection -> the author answered  -> REVIEWER's turn -> claim it
    #   head still AT the rejection   -> the author is mid-fix -> WORKER's turn  -> skip it
    #
    # An empty answer is a transport failure, never a verdict: offer the PR rather than starve.
    if [ "$(gh pr view "$num" --repo "$SLUG" --json reviewDecision --jq .reviewDecision 2>/dev/null)" = "CHANGES_REQUESTED" ]; then
      local rejsha
      rejsha=$(gh api "repos/$SLUG/pulls/$num/reviews" \
                 --jq '[.[] | select(.state=="CHANGES_REQUESTED")] | last | .commit_id' 2>/dev/null)
      if [ -n "$rejsha" ] && [ "$rejsha" != "null" ] && [ "$rejsha" = "$sha" ]; then
        echo "review_claim: PR #$num was rejected on this very head (${sha:0:8}) and the author has not" >&2
        echo "  answered yet — it belongs to the rework queue, skipping" >&2
        continue
      fi
    fi
    if lease_take "$num" "$sha"; then
      if [ "$LEASE_RECLAIMED" = 1 ]; then echo "CLAIMED $num $sha (reclaimed)"; else echo "CLAIMED $num $sha"; fi
      return 0; fi
  done <<< "$rows"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim;;
  # release takes <PR> [sha]; the sha is accepted for call-site compatibility but ignored, since the
  # lease is now keyed by PR number alone (see the race note in pick_and_claim).
  release)
  # OWNERSHIP: a release frees YOUR OWN lease and nobody else's — including the legacy sha-keyed
  # path below, which an unguarded sweep would delete just as effectively as the PR-keyed one.
  #
  # Fails OPEN on an unowned lease (taken before this landed, or by a caller with no FCT_AGENT_ID)
  # and on the literal `unknown`: a lease no one can free is worse than an occasional double-free,
  # and the stale reclaim in lease_take still bounds it. Exits 0 on a refusal for the same reason —
  # a cleanup sweep must not be hard-failed by a lease it does not own — so the observable is the
  # lease DIRECTORY, never the exit code.
    _pr="${2:?usage: review_claim.sh release <PR> [sha]}"; _lk="$LEAS/pr-$_pr"
    _own=$(cat "$_lk/owner" 2>/dev/null || echo "")
    if [ -n "$_own" ] && [ "$_own" != "unknown" ] && [ -n "${FCT_AGENT_ID:-}" ] && [ "$_own" != "$FCT_AGENT_ID" ]; then
      echo "review_claim: lease on PR #$_pr is held by $_own, not ${FCT_AGENT_ID}; NOT releasing another agents lease" >&2
      exit 0
    fi
    rm -rf "$_lk" "$LEAS/${_pr}-${3:0:12}" 2>/dev/null; echo "released review lease $_pr";;
  status)  ls -1 "$LEAS" 2>/dev/null | while read -r p; do echo "  $p held $(cat "$LEAS/$p/held" 2>/dev/null)"; done; { [ -z "$(ls -A "$LEAS" 2>/dev/null)" ] && echo "  (no review leases)"; } ; true;;
  *) echo "usage: review_claim.sh {claim|release <PR> <sha>|status}" >&2; exit 2;;
esac
