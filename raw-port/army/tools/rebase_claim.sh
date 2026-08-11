#!/bin/bash
# rebase_claim.sh — PULL-side of the rebase queue (Model B: workers pull, nobody dispatches).
#
# A worker slot calls `rebase_claim.sh claim`; it atomically LEASES exactly one open PR that is stuck
# on a regression/rebase faithfulness-gate FAILURE and is under the per-PR attempt cap, and prints
#   CLAIMED <PR#> <branch>
# The worker then runs rebase_pr.sh <PR#>. If no such PR is free, prints `NONE` (exit 1) and the
# worker falls through to normal port units. Leases live in $STATE/rebase_leases/<PR> (atomic mkdir,
# auto-reclaimed after REBASE_LEASE_MIN min). Attempt counter in $STATE/rebase_attempts/<PR>; past the
# cap the PR is closed (append-only queue re-hands the symbol to a fresh worker).
#
#   rebase_claim.sh claim        -> lease + print CLAIMED <PR#> <branch>, or NONE (exit 1)
#   rebase_claim.sh release <PR> -> drop the lease (call after rebase_pr finishes / on give-up)
#   rebase_claim.sh status       -> show leases + attempt counts
set -uo pipefail
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
STATE="${FCT_STATE_DIR:-$HOME/.fct-pool}"; LEAS="$STATE/rebase_leases"; ATT="$STATE/rebase_attempts"
mkdir -p "$LEAS" "$ATT"
CAP="${REBASE_ATTEMPT_CAP:-3}"; LEASE_MIN="${REBASE_LEASE_MIN:-90}"

stamp_owner () { # <leasedir> : record the CLAIMANT — or REMOVE a name that is no longer the holder.
  # The `else rm -f` is the whole point, and the first cut of this patch did not have it. The
  # STALE-RECLAIM branch below reuses a directory that already carries an owner file, so a reclaim
  # by a caller with no FCT_AGENT_ID would leave the DEAD agent's id sitting on a lease it does not
  # hold. This harness reuses slot ids by design (HARNESS_LOOP invariant 2: one fixed slot per
  # process, and the only thing that creates an agent is the harness restarting a dead slot), so
  # that agent comes back — and the release guard would then authorise the returning `worker-9` to
  # free a lease held by someone else while refusing every other identified agent. A guard whose key
  # names the wrong agent is worse than none, because the refusals it does emit read as proof that
  # it works. So the file always names the CURRENT holder, or nothing at all.
  # Identical rule to `wt_pool.sh::stamp_holder`; the three copies are pinned to agree by
  # test_guards case I (behaviour) and swarm_doctor's `lease-ownership` check (all three paths).
  if [ -n "${FCT_AGENT_ID:-}" ]; then echo "$FCT_AGENT_ID" > "$1/owner"; else rm -f "$1/owner"; fi
}

lease_free () { # <PR> : 0 if we can take it (free or stale), else 1
  local lk="$LEAS/$1"
  # THE OTHER WORKER QUEUE'S LEASE COUNTS TOO — see the long note in rework_claim.sh. A PR that is
  # CHANGES_REQUESTED *and* CONFLICTING is selected by BOTH worker queues, and #643 (which taught
  # this selector to see DIRTY branches) made that combination common. Measured on #656: two
  # workers held the two leases 66 seconds apart and both started reconciling the same 936-line
  # PR. Same staleness window as our own leases, so a dead peer cannot block the PR forever.
  local peer="$STATE/rework_leases/$1"
  if [ -d "$peer" ] && [ -z "$(find "$peer/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "rebase_claim: PR #$1 is already leased by the REWORK queue — skipping (a rejected PR that also conflicts is in both queues; one worker is enough)" >&2
    return 1
  fi
  mkdir "$lk" 2>/dev/null && { echo "$(date +%s)" > "$lk/held"; stamp_owner "$lk"; return 0; }
  if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "$(date +%s)" > "$lk/held"; stamp_owner "$lk"; return 0; fi
  return 1
}

reap_dead_counters () {
  # SELF-HEAL: an attempt counter must not outlive its PR.
  #
  # Counters are the authority to stop offering work, and they are never cleared when a PR merges or
  # closes — so they accumulate as dead state that reads exactly like stranded work. Measured today:
  # 64 counters for long-merged PRs, one of which (#387, MERGED) reported as "stranded at 3/3" and
  # cost a round of investigation. Worse, a counter inflated by a bug that has SINCE BEEN FIXED stays
  # at the cap and keeps real work invisible — the fix alone does not free the state it created
  # (OPS_LOG #28), which is why two PRs had to be un-stranded by hand this session.
  #
  # THE CAP FILTER WAS THE BUG. This used to check only counters already AT the cap, to bound the
  # number of API calls — one `gh pr view` each. But swarm_doctor's dead-counters check flags ANY
  # counter whose PR has merged or closed, so the tool that reports the fault and the tool that
  # fixes it disagreed by construction: #554 sat at 1/3, merged, and the doctor asked a human to
  # `rm` it on every run while this function was coded to skip it forever. Every dead counter I
  # cleared by hand today was under the cap. A counter for a merged PR is garbage at any value.
  #
  # Checking them all costs nothing extra because they now go in ONE aliased GraphQL query instead
  # of one call per counter: 6 counters, 0.575s, one round trip. That is cheaper than the old
  # capped-only loop was, so the bound the filter existed to provide is no longer needed.
  local f b nums="" q="" resp k st
  for f in "$ATT"/*; do
    [ -f "$f" ] || continue
    b="$(basename "$f")"; case "$b" in *.sha) continue;; esac
    case "$b" in ''|*[!0-9]*) continue;; esac
    nums="$nums $b"
  done
  [ -z "$nums" ] && return 0
  for b in $nums; do q="$q p$b: pullRequest(number: $b) { state }"; done
  resp=$(gh api graphql -f query="query { repository(owner: \"${SLUG%%/*}\", name: \"${SLUG##*/}\") { $q } }" \
           --jq '.data.repository | to_entries[] | "\(.key) \(.value.state)"' 2>/dev/null)
  # An unanswered query is not evidence. Reaping on silence would clear a LIVE counter and re-offer
  # work the cap is deliberately holding back, which is the failure the cap exists to prevent.
  [ -z "$resp" ] && return 0
  printf '%s\n' "$resp" | while read -r k st; do
    b="${k#p}"
    case "$st" in
      MERGED|CLOSED)
        rm -f "$ATT/$b" "$ATT/$b.sha" 2>/dev/null
        echo "rebase_claim: reaped a dead counter for PR #$b ($st) — it was masquerading as stranded work" >&2 ;;
    esac
  done
}

cmd_claim () {
  reap_dead_counters
  git fetch -q origin main 2>/dev/null || true
  # candidate PRs whose LATEST faithfulness-gate is FAILURE
  local cand
  # TWO WAYS A PR NEEDS A REBASE; this queue could only see one of them.
  #
  #  (a) the gate said so — a regression/rebase FAILURE (handled below by description).
  #  (b) GITHUB SAYS THE BRANCH CONFLICTS (mergeStateStatus DIRTY). For a PR touching no
  #      raw-port/src, pr_gate short-circuits to SUCCESS without running regression_check at all —
  #      so a conflicted docs/tooling PR is GREEN, invisible here, and review_claim will not re-offer
  #      it either because it is already APPROVED. It then sits open forever.
  #
  # That is not hypothetical: swarm_doctor has been reporting APPROVED, green, DIRTY PRs as orphans
  # no queue can claim for most of today (#523, #554, #571, #600), and reviewers were unsticking them
  # by HAND-POSTING a fake `regression (rebase needed)` status just to make this filter see them.
  # Ask GitHub whether the branch conflicts instead of inferring it from a status nobody posted.
  # LAZY FIELD: `mergeStateStatus` is computed ON DEMAND. The first query after a change returns
  # UNKNOWN and merely TRIGGERS the computation; a later one returns the real answer. Measured by
  # reviewer 1, three `gh pr list` calls six seconds apart with nothing else changing:
  #     12:11:11  DIRTY [557,553,400]                         UNKNOWN [622,621,617,614,611,603,571,…]
  #     12:11:17  DIRTY [622,621,617,614,571,557,554,553,523]  UNKNOWN [400]
  #     12:11:22  DIRTY [ … ]                                  UNKNOWN []
  # cmd_claim makes ONE list call and a worker takes ONE claim, so on a cold query most of the
  # queue — including the conflicted PRs this branch exists to select — reports UNKNOWN and is
  # silently skipped. So ask once to start the computation, then ask for real. The warm-up is a
  # separate statement rather than a retry INSIDE the assignment on purpose: swarm_doctor lifts
  # this `cand=$(gh pr list …)` assignment verbatim to audit the queue, and it makes its own
  # `pr list` call (with mergeStateStatus) before doing so — so the selector it runs is warm for
  # exactly the same reason this one is, and the two cannot disagree about what is DIRTY.
  gh pr list --repo "$SLUG" --state open --limit 100 --json number,mergeStateStatus >/dev/null 2>&1
  sleep 1
  # `.baseRefName=="main"`: a rebase onto main is not the remedy for a PR that is not TARGETING main
  # — see the same clause in review_claim.sh. #656 was handed out here while based on #651's branch;
  # its DIRTY is a conflict with that peer branch, and "rebase it onto main" would either fail or
  # publish four stacked PRs' content under one number.
  cand=$(gh pr list --repo "$SLUG" --state open --limit 100 \
      --json number,headRefName,headRefOid,statusCheckRollup,mergeStateStatus,baseRefName \
      --jq '.[] | select(.baseRefName=="main") | select(([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state=="FAILURE") or .mergeStateStatus=="DIRTY") | "\(.number)\t\(.headRefName)\t\(.headRefOid)\t\(.mergeStateStatus)"' 2>/dev/null)
  [ -z "$cand" ] && { echo "NONE"; return 1; }
  while IFS=$'\t' read -r num br sha ms; do
    [ -z "$num" ] && continue
    # A DIRTY branch needs a rebase whatever the gate says — the conflict IS the evidence, so skip
    # the description check for it (the gate may even be green; see the note above).
    if [ "${ms:-}" = "DIRTY" ]; then
      af="$ATT/$num"; sf="$ATT/$num.sha"; n=$(cat "$af" 2>/dev/null || echo 0)
      last=$(cat "$sf" 2>/dev/null || echo "")
      if [ -n "$last" ] && [ "$last" != "$sha" ]; then
        n=0; echo 0 > "$af"
        echo "rebase_claim: PR #$num head moved ($last -> $sha) since its last attempt — counter reset (progress, not failure)" >&2
      fi
      if [ "${n:-0}" -ge "$CAP" ]; then
        approved=$(gh pr view "$num" --repo "$SLUG" --json reviewDecision --jq .reviewDecision 2>/dev/null)
        if [ "$approved" = "APPROVED" ]; then
          echo "rebase_claim: PR #$num is at the cap but is APPROVED — NOT closing verified work; it stays queued." >&2
          n=0; echo 0 > "$af"
        else
          # SAY SO. Not closing a conflicted PR is the right call — closing an author's work is a
          # human's decision (#28) — but the PR then lands back in "no queue can claim it", which
          # is this branch's own abstract, and it is worse than the state it replaces because a
          # COUNTER is hiding it rather than a filter: nothing about the PR looks wrong. The other
          # cap path prints its decisions; this one used to `continue` in silence.
          echo "rebase_claim: PR #$num conflicts with main and is at $n/$CAP attempts on head ${sha:0:8} — NOT offering it and NOT closing it; a human decides (swarm_doctor reports it as uncovered)." >&2
          continue
        fi
      fi
      if lease_free "$num"; then
        echo "$((n+1))" > "$af"; echo "$sha" > "$sf"
        echo "CLAIMED $num $br   (conflicts with main; attempt $((n+1))/$CAP on head ${sha:0:8})"
        return 0
      fi
      continue
    fi
    # confirm the failure reason is a regression/rebase (REST has the description; GraphQL doesn't)
    local desc; desc=$(gh api "repos/$SLUG/commits/$sha/statuses" \
      --jq '[.[]|select(.context=="faithfulness-gate")][0].description' 2>/dev/null)
    # A stale base caught by G6 (add-only) posts "G0-G5 gate reject", NOT "regression (rebase
    # needed)" — same condition, different words — so those PRs matched no filter and sat open
    # forever while a reviewer hand-wrote the status to get them queued. Accept both spellings.
    echo "$desc" | grep -qiE 'regression|rebase|add-only|G6|gate reject' || continue
    local af="$ATT/$num"; local n; n=$(cat "$af" 2>/dev/null || echo 0)

    # ── THE COUNTER MEASURES PROGRESS, NOT ATTENDANCE ────────────────────────────────────────
    # This counter is the authority to DESTROY a finished port, so what it counts matters. It was
    # written on every successful LEASE, before the rebase ran and regardless of the outcome, and
    # cleared only by the cap branch that closes the PR. So it counted "times this PR needed a
    # rebase" while the cap and its close comment both asserted "times rebasing FAILED".
    # Those diverge exactly when a rebase SUCCEEDS and a SIBLING then re-stales the branch — the
    # normal state of a contended class file, not a pathology. With K open PRs on one class the cap
    # is consumed in ~K sibling merges no matter how well the rebases work, so it retires the losers
    # of a race, fastest when the merge rate is healthiest, and most expensively where the work was
    # best (an oracle-verified, reviewer-approved body is the costliest thing to throw away).
    # Measured: #387 sat at 3/3 while GREEN and APPROVED; #390 was closed carrying a 1400/1400
    # differential and had to be reopened by hand; #389's symbol was left claimed-forever, on no
    # branch and in no PR.
    # Two changes, either of which alone would have prevented all three:
    #   1. A NEW HEAD IS PROGRESS. Record the head SHA the attempt was charged against; if the head
    #      has moved since, the branch produced a new gating head and the count resets.
    #   2. VERIFIED WORK IS EXEMPT. A PR that already holds an APPROVED review has been paid for by
    #      a reviewer's differential; a rebase is bookkeeping, not evidence of un-rebasability.
    local sf="$ATT/$num.sha"; local last; last=$(cat "$sf" 2>/dev/null || echo "")
    if [ -n "$last" ] && [ "$last" != "$sha" ]; then
      n=0; echo 0 > "$af"
      echo "rebase_claim: PR #$num head moved ($last -> $sha) since its last attempt — counter reset (progress, not failure)" >&2
    fi
    if [ "$n" -ge "$CAP" ]; then
      local approved; approved=$(gh pr view "$num" --repo "$SLUG" --json reviewDecision --jq .reviewDecision 2>/dev/null)
      if [ "$approved" = "APPROVED" ]; then
        echo "rebase_claim: PR #$num is at the cap but is APPROVED — NOT closing verified work; it stays queued." >&2
        n=0; echo 0 > "$af"
      else
        gh pr close "$num" --repo "$SLUG" --comment "Closed after $CAP rebase attempts on a stale-base shared-class conflict that could not be auto-rebased. The append-only claim queue re-hands this symbol to a fresh worker cut from current main. NOTE: if this PR carried verified evidence, it is in the comments above — carry it over rather than re-deriving it." >/dev/null 2>&1
        rm -rf "$LEAS/$num" 2>/dev/null; rm -f "$af" "$sf" 2>/dev/null
        continue
      fi
    fi
    # try to lease it
    if lease_free "$num"; then
      echo "$((n+1))" > "$af"; echo "$sha" > "$sf"
      echo "CLAIMED $num $br   (attempt $((n+1))/$CAP on head ${sha:0:8})"
      return 0
    fi
  done <<< "$cand"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim;;
  release)
  # OWNERSHIP: a release must only free YOUR OWN lease.
  #
  # `rm -rf` on a lease nobody checked ownership of means any agent can free any other's — and an
  # end-of-run cleanup sweep did exactly that today, deleting a peer's lease taken 39 seconds
  # earlier. It is the same hole `wt_pool.sh release` had and closed, arriving here through the
  # queues. The peer then works a PR it no longer holds, and a second agent can claim it
  # underneath — the duplicate-work race the leases exist to prevent.
  #
  # Fails OPEN on an unowned lease (one written before this landed, or by a caller with no
  # FCT_AGENT_ID): a stuck lease is worse than an occasional double-free, and the stale reclaim
  # still bounds it.
    _pr="${2:?usage: rebase_claim.sh release <PR>}"; _lk="$LEAS/$_pr"; _own=$(cat "$_lk/owner" 2>/dev/null || echo "")
    if [ -n "$_own" ] && [ "$_own" != "unknown" ] && [ -n "${FCT_AGENT_ID:-}" ] && [ "$_own" != "$FCT_AGENT_ID" ]; then
      echo "rebase_claim: lease on PR #$_pr is held by $_own, not ${FCT_AGENT_ID}; NOT releasing another agents lease" >&2
      exit 0
    fi
    rm -rf "$_lk" 2>/dev/null; echo "released lease $_pr" ;;
  status)
    echo "rebase leases:"; ls -1 "$LEAS" 2>/dev/null | while read -r p; do echo "  PR#$p held $(cat "$LEAS/$p/held" 2>/dev/null)"; done
    echo "attempt counts:"; ls -1 "$ATT" 2>/dev/null | while read -r p; do echo "  PR#$p = $(cat "$ATT/$p" 2>/dev/null)/$CAP"; done
    ;;
  *) echo "usage: rebase_claim.sh {claim|release <PR>|status}" >&2; exit 2;;
esac
