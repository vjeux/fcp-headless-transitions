#!/bin/bash
# pr_land.sh <PR#> [--reviewed] — drive a gated PR to a server-side merge, handling the
# strict "branch must be up-to-date" dance in ONE command so reviewers don't orchestrate
# update-branch + re-gate by hand on every merge (the #1 PR-flow friction).
#
# LOOP (bounded): (1) if BEHIND, PUT .../update-branch and wait for the new head SHA;
# (2) run pr_gate.sh <PR#> [--reviewed] to post faithfulness-gate on the CURRENT head;
# (3) if MERGEABLE/clean, `gh pr merge --squash --delete-branch`; if it merged, DONE.
# Re-checks BEHIND after gating because main keeps advancing under the live swarm. Gives up
# after N rounds (prints REBASE-RACE so the caller can retry later). NEVER force-merges;
# only merges when the required status is green and GitHub reports it mergeable.
set -uo pipefail
PR="${1:?usage: pr_land.sh <PR#> [--reviewed] [--keep-status \"<why>\"]}"
# --keep-status "<why>": land WITHOUT re-gating, preserving the status already on the head.
#
# WHY: this script re-runs pr_gate on every round, which OVERWRITES whatever status is there. That is
# right when the gate is the authority, and wrong in the one case where a person out-ranks it: a
# reviewer who has DISPROVED a mechanical failure. It happened repeatedly today — regression_check
# reporting a dropped symbol that was really a regex artefact, and a conflicted non-src PR whose gate
# never ran regression at all. `--reviewed` does not help: it covers G5 flags only. The reviewer's
# sole recourse was to hand-post a status and race pr_land to the merge.
# The reason is REQUIRED and is echoed into the run, so "I skipped the gate" can never be silent.
#
# The options are parsed as a LOOP rather than off $2, because `pr_land.sh <PR> --reviewed
# --keep-status "why"` silently ignored the second flag when only $2 was inspected — a flag that
# does nothing is worse than one that errors (reviewer 1 on #557).
KEEP_STATUS=""
REVIEWED=""
shift
while [ $# -gt 0 ]; do
  case "$1" in
    --reviewed)    REVIEWED="--reviewed"; shift ;;
    --keep-status) KEEP_STATUS="${2:?--keep-status requires a reason: what did you verify that the gate got wrong?}"; shift 2 ;;
    "")            shift ;;
    *)             echo "pr_land: unknown option '$1' (expected --reviewed or --keep-status \"<why>\")" >&2; exit 2 ;;
  esac
done
if [ -n "$KEEP_STATUS" ]; then
  # --keep-status out-ranks --reviewed: it means "do not run the gate at all", so there is no flag
  # set for the gate to clear.
  REVIEWED=""
  echo "pr_land: --keep-status — NOT re-gating PR #$PR. Reviewer's stated reason:"
  echo "         $KEEP_STATUS"
fi
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
# Act as the REVIEWER GitHub App: it posts the gate status, signs the APPROVE, and merges. Distinct
# from the worker app that authored the PR, which is what makes a real review verdict possible.
GHAPP="$CANON/raw-port/army/tools/ghapp"
ghr () { bash "$GHAPP/gh_as.sh" reviewer "$@"; }
# carry_tree_identity <approved-sha> <head-sha>
# Prints the two tree hashes and exits 0 only when the head's tree is EXACTLY what merging the
# approved content into current origin/main produces. A missing object, an unreadable commit or a
# failed merge-tree all exit non-zero — this must never fail open, because failing open means
# merging on an approval nobody's evidence describes. Locked by
# raw-port/army/tools/test_pr_land_carry.sh, which drives THIS function.
carry_tree_identity () {
  local approved="$1" head="$2" t1 t2
  git cat-file -e "${approved}^{commit}" 2>/dev/null || {
    echo "  carry: the approved commit ${approved:0:8} is not readable here — NOT carrying"; return 1; }
  git cat-file -e "${head}^{commit}" 2>/dev/null || {
    echo "  carry: the head commit ${head:0:8} is not readable here — NOT carrying"; return 1; }
  # TREE IDENTITY, not a diff hash. `git diff origin/main...<sha>` computes each side against its
  # OWN merge base, so when main advances INSIDE THE SAME FILE the context differs and two identical
  # contributions hash differently — the normal case for OPS_LOG.md, which every agent appends to.
  # And a `git diff` that FAILS prints nothing, whose shasum is the stable da39a3ee… of empty input,
  # so two failures compare EQUAL and the carry fires on content nobody read. merge-tree prints
  # nothing and exits non-zero instead. (Both measured by reviewer 2 on #603.)
  local mt_rc
  t1=$(git merge-tree --write-tree origin/main "$approved" 2>/dev/null); mt_rc=$?
  # A CONFLICT EXITS NON-ZERO AND STILL PRINTS A TREE OID — and that tree holds conflict markers, so
  # carrying an approval onto it would be carrying it onto text nobody wrote, let alone reviewed.
  # `|| true` swallowed that status, which made the header comment above ("a failed merge-tree …
  # exits non-zero — this must never fail open") a promise the code did not keep. `update-branch`
  # cannot produce such a head, which is why it was not exploitable; the point of a predicate like
  # this one is that it must not depend on that staying true somewhere else. (reviewer 1 on #603.)
  [ "$mt_rc" = 0 ] || {
    echo "  carry: main and the approved commit ${approved:0:8} CONFLICT — NOT carrying"; return 1; }
  t2=$(git rev-parse "${head}^{tree}" 2>/dev/null || true)
  echo "    merge-tree(origin/main, ${approved:0:8}) = ${t1:0:12}"
  echo "    tree(${head:0:8})                        = ${t2:0:12}"
  [ -n "$t1" ] && [ -n "$t2" ] && [ "$t1" = "$t2" ]
}

# signed_head_of <sha> — the head a reviewer ACTUALLY signed, recovered from a rebound commit_id.
#
# GitHub re-points a review's commit_id forward onto each `Merge branch 'main' into <branch>` that
# `update-branch` creates — measured +3s to +39s AFTER submission on #599/#610/#585, two hops on the
# last — so the field is not a durable record of what was read. The FIRST-PARENT CHAIN is: GitHub
# makes those merges with the branch head as parent 1 and main as parent 2, so walking parent 1 back
# through them lands on the commit the reviewer had in front of them. The walk stops at anything
# that is not such a merge, which is the safety property: an author commit ends it.
# Bounded at 20 hops. Locked by test_pr_land_signed_head.sh (prove_all LAYER 2h).
signed_head_of () {
  local c="$1" hops=0 subj p1
  while [ "$hops" -lt 20 ]; do
    subj=$(git log -1 --format=%s "$c" 2>/dev/null) || break
    case "$subj" in "Merge branch 'main' into "*) ;; *) break ;; esac
    # exactly two parents: `rev-list --parents -n1` prints <commit> <p1> <p2> = 3 words
    [ "$(git rev-list --parents -n1 "$c" 2>/dev/null | wc -w | tr -d ' ')" = "3" ] || break
    p1=$(git rev-parse -q --verify "${c}^1" 2>/dev/null) || break
    [ -n "$p1" ] || break
    c="$p1"; hops=$((hops+1))
  done
  printf '%s' "$c"
}

for round in 1 2 3 4 5 6; do
  st=$(ghr pr view "$PR" --repo "$SLUG" --json state --jq .state 2>/dev/null)
  [ "$st" = "MERGED" ] && { echo "pr_land: PR #$PR already MERGED"; exit 0; }
  [ "$st" = "CLOSED" ] && { echo "pr_land: PR #$PR CLOSED (not merged)"; exit 1; }
  ms=$(ghr pr view "$PR" --repo "$SLUG" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null)
  echo "pr_land round $round: state=$st mergeState=$ms"
  # THE KEEP-STATUS CHECK HAPPENS BEFORE `update-branch`, and that ORDER is the whole point.
  # `update-branch` mints a new commit and statuses are per-SHA, so checking afterwards reads a head
  # nobody verified: the reviewer's status is already gone, the check sees 'none', and the run
  # refuses — which is how the flag came to be inoperative on 4 of the 4 PRs it was written for
  # (all of them BEHIND; reviewer 1 measured it on #557). Checking first means the refusal is about
  # the status the reviewer actually verified.
  if [ -n "$KEEP_STATUS" ]; then
    cur=$(ghr api "repos/$SLUG/commits/$(ghr pr view "$PR" --repo "$SLUG" --json headRefOid --jq .headRefOid)/status" \
            --jq '[.statuses[]?|select(.context=="faithfulness-gate")]|last|.state // ""' 2>/dev/null)
    if [ "$cur" != "success" ]; then
      echo "pr_land: --keep-status but the head's faithfulness-gate is '${cur:-none}', not success — refusing."
      exit 1
    fi
    if [ "$ms" = "BEHIND" ]; then
      # Refusing rather than updating: the update would discard the very status being preserved, and
      # this flag preserves a verdict — it does not mint one on a head nobody has looked at.
      echo "pr_land: --keep-status but PR #$PR is BEHIND. Updating the branch would create a new head"
      echo "         and DISCARD the 'success' status you verified (statuses are per-SHA), leaving a"
      echo "         head nobody reviewed. Refusing. Bring the branch up to date, re-verify the new"
      echo "         head, and re-run — or land it without --keep-status."
      exit 1
    fi
  fi
  if [ "$ms" = "BEHIND" ]; then
    # REMEMBER WHAT WAS APPROVED BEFORE WE MOVE THE HEAD — as INSURANCE, not as the mechanism.
    #
    # THE PREMISE THIS BLOCK WAS FIRST WRITTEN ON IS FALSE, and it is worth writing down because it
    # is the obvious thing to assume: GitHub does NOT leave the approval pinned to the old SHA when
    # WE call update-branch. It re-points the review record onto the merge commit it creates.
    # Measured on two PRs that landed with the UNPATCHED tool (reviewer 2, corroborated on #609 by
    # its author): review id 4909626168, submitted 18:42:54Z against c72d57ed, now reports
    # commit_id 4a6c06ef — the "Merge branch 'main' into port/…" commit update-branch made at
    # 18:43:05Z, eleven seconds later. The approval check below therefore PASSED and the PR merged.
    #
    # What GitHub does NOT carry is an approval across a push the AUTHOR made — a rebase force-push
    # re-points nothing, which is correct and is the guard doing its job on a head nobody reviewed.
    # (#594's deadlock was that case, not this one.)
    #
    # So this block is a belt for an undocumented server-side behaviour that could change, and it is
    # deliberately narrower than GitHub's own rule: it carries only when the resulting TREE is
    # exactly what merging the approved content into current main produces.
    APPROVED_BEFORE=$(ghr api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null \
      | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
a=[r for r in rs if r.get('state')=='APPROVED']
print(a[-1]['commit_id'] if a else '')
" 2>/dev/null)
    ghr api -X PUT "repos/$SLUG/pulls/$PR/update-branch" >/dev/null 2>&1 || true
    # wait for head SHA to change / mergeState to leave BEHIND
    for _ in 1 2 3 4 5 6 7 8; do sleep 3; nms=$(ghr pr view "$PR" --repo "$SLUG" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null); [ "$nms" != "BEHIND" ] && break; done
  fi
  # (re)gate the current head, posting the required status
  if [ -n "$KEEP_STATUS" ]; then
    # Already validated above, before anything could move the head. Trust it; do not touch it.
    echo "pr_land: keeping existing 'success' status on the head (not re-gating)"
    echo "PR_GATE: PASS (status preserved by reviewer)" > /tmp/pr_land_gate_$PR.log
  else
    bash raw-port/army/tools/pr_gate.sh "$PR" $REVIEWED >/tmp/pr_land_gate_$PR.log 2>&1
  fi
  grep -qE 'PR_GATE: (PASS|FAIL|NEEDS-REVIEW)' /tmp/pr_land_gate_$PR.log; tail -1 /tmp/pr_land_gate_$PR.log
  if grep -q 'PR_GATE: FAIL' /tmp/pr_land_gate_$PR.log; then echo "pr_land: gate FAIL — not merging"; exit 1; fi
  if grep -q 'PR_GATE: NEEDS-REVIEW' /tmp/pr_land_gate_$PR.log; then echo "pr_land: needs reviewer --reviewed re-derivation"; exit 2; fi
  # DO NOT auto-approve here. This script used to POST a generic APPROVE ("reviewer re-derived the
  # disassembly...") on any green head just before merging — which reviewer-01 correctly called out:
  # #197 carried that APPROVE while actually being a duplicate. An approval minted by the merge tool
  # is a rubber stamp; it records nothing about whether anyone verified anything, and it quietly
  # devalues the very review trail the two GitHub Apps exist to create.
  #
  # Inverted: the reviewer must APPROVE *before* landing, with their own evidence line, via
  #   ghapp/pr_review.sh <PR#> approve "<what I re-derived and why it matches>"
  # and pr_land REQUIRES that approval to exist on the CURRENT head. This also enforces
  # "verify before merge" client-side: a stale approval on an older SHA does not count.
  if [ -f "${FCT_STATE_DIR:-$HOME/.fct-pool}/ghapp/reviewer.json" ]; then
    # DISTINGUISH "no approval" FROM "the lookup failed". During a burst of TLS errors this printed
    # "no APPROVED review on the current head ." — with an EMPTY SHA — seconds after an approval had
    # succeeded, and an unchanged retry merged fine. That message would convince a reviewer its
    # verdict had not registered and send it to re-review or abandon a correct PR. A transient API
    # failure must never render as a verdict. Retry, and refuse to speak if we still cannot see.
    HEAD_SHA=""; REVJSON=""
    for _try in 1 2 3; do
      HEAD_SHA=$(ghr pr view "$PR" --repo "$SLUG" --json headRefOid --jq .headRefOid 2>/dev/null)
      REVJSON=$(ghr api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null)
      [ -n "$HEAD_SHA" ] && [ -n "$REVJSON" ] && break
      sleep 3
    done
    if [ -z "$HEAD_SHA" ] || [ -z "$REVJSON" ]; then
      echo "pr_land: could not read PR #$PR review state after 3 tries (transient API failure)."
      echo "  NOT a verdict about the PR — retry when the API settles."
      exit 6
    fi
    # HARD STOP ON AN OUTSTANDING REJECTION. All reviewer slots share ONE bot identity, so GitHub's
    # per-user "latest review wins" does NOT protect us: slot B's APPROVE silently supersedes slot A's
    # CHANGES_REQUESTED. That is how a rejected port landed — reviewer-06 rejected #221, a peer
    # approved a newer head, and the NaN-branch defect went to main as eb6f6086 (issue #224).
    # Rule: ANY CHANGES_REQUESTED that has not been explicitly DISMISSED blocks the merge. Overriding
    # a peer's rejection must be a deliberate act (dismiss it with a reason), never an accident of
    # ordering.
    BLOCKED_BY=$(printf '%s' "$REVJSON" | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
out=[r for r in rs if r.get('state')=='CHANGES_REQUESTED']
if out:
    r=out[-1]
    print('%s @%s' % ((r.get('user') or {}).get('login','?'), (r.get('commit_id') or '')[:8]))
" 2>/dev/null)
    if [ -n "$BLOCKED_BY" ]; then
      echo "pr_land: REFUSING to merge PR #$PR — an un-dismissed CHANGES_REQUESTED stands ($BLOCKED_BY)."
      echo "  A rejection is not superseded by a later approval (all slots share one bot identity)."
      echo "  If it is genuinely resolved, dismiss it deliberately:"
      echo "    gh api -X PUT repos/$SLUG/pulls/$PR/reviews/<review_id>/dismissals -f message='<why>'"
      exit 5
    fi
    APPROVED=$(printf '%s' "$REVJSON" | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
print('yes' if any(r.get('state')=='APPROVED' and r.get('commit_id')=='$HEAD_SHA' for r in rs) else '')
" 2>/dev/null)
    if [ -z "$APPROVED" ]; then
    # CARRY THE APPROVAL ACROSS OUR OWN UPDATE — but only when the author's content is unchanged.
    # If update-branch moved the head, the difference between the approved SHA and the new head is
    # main being merged in, NOT anything the author wrote.
    # WHAT IS ACTUALLY TESTED IS CONTENT, NOT PROVENANCE, and the distinction matters enough to
    # write down because the previous wording ("it carries over a merge WE performed, and never over
    # a push the author made") describes a check this code does not make, and someone would later
    # "fix" the code to match the sentence. `carry_tree_identity` asserts that the head's TREE is
    # exactly `merge-tree(origin/main, approved-sha)`. An author push that happened to produce that
    # identical tree would also carry — which is harmless, because the content is then provably the
    # content the reviewer read, byte for byte. The property is "nothing unreviewed is in this tree",
    # which is stronger than "we made this commit" and is the one the verdict actually depends on.
    # (The earlier form compared `git diff origin/main...<sha>` hashes at both SHAs. It failed twice
    # over: a diff computes each side against its OWN merge base, so main advancing inside the same
    # file made identical contributions hash differently; and a FAILED diff hashes to the stable
    # da39a3ee… of empty input, so two unreadable commits compared EQUAL and it carried on content
    # nobody read.)
    if [ -n "${APPROVED_BEFORE:-}" ] && [ "$APPROVED_BEFORE" != "$HEAD_SHA" ]; then
      # The fetches are REPORTED, not swallowed: if the objects are not here the carry must not run.
      git fetch -q origin main "+refs/pull/$PR/head:refs/prland/$PR" >/dev/null 2>&1 \
        || echo "pr_land: could not fetch the PR head — the carry will refuse"
      git fetch -q origin "$APPROVED_BEFORE" >/dev/null 2>&1 \
        || echo "pr_land: could not fetch the approved commit — the carry will refuse"
      if carry_tree_identity "$APPROVED_BEFORE" "$HEAD_SHA"; then
        echo "pr_land: carrying the approval on ${APPROVED_BEFORE:0:8} forward to ${HEAD_SHA:0:8}"
        echo "  our own update-branch moved the head, and the head's tree is exactly what merging"
        echo "  the approved content into current main produces (hashes above)."
        APPROVED=1
      else
        echo "pr_land: NOT carrying the approval — see above."
      fi
    fi
    if [ "${APPROVED:-0}" = "1" ]; then :; else
      echo "pr_land: REFUSING to merge PR #$PR — no APPROVED review on the current head ${HEAD_SHA:0:8}."
      echo "  Verify it, then sign your verdict with your own evidence:"
      echo "    bash raw-port/army/tools/ghapp/pr_review.sh $PR approve \"<one-line evidence>\""
      echo "  (A merge tool minting its own approval is a rubber stamp — that is why this refuses.)"
      exit 4
    fi
    fi
  fi
  # try the merge (auto = waits for the just-posted status if still settling)
  # LAST GATE BEFORE AN IRREVERSIBLE MERGE: does the approval actually cover what we are merging?
  #
  # GitHub REBINDS a review to a later commit on its own. On #585 the review was submitted at
  # 18:41:58Z and is bound to a merge commit created at 18:42:37Z — thirty-nine seconds after the
  # verdict — and pr_land's own `update-branch` is what produced that commit. So "which commit is
  # the review on?" is not a fact the reviewer controls, and sending `commit_id` at POST time (#619)
  # cannot help: the rebinding happens afterwards.
  #
  # THREE CORRECTIONS from reviewer 2's review of the first version of this block, each measured:
  #  (1) NO `APPROVED_AT != HEAD` PRECONDITION. The rebinding is exactly what makes those two EQUAL:
  #      on four consecutive landings (#621, #625, #611, #608) the approval had already been dragged
  #      onto the merge commit by this point, so a guard gated on them differing skipped every one —
  #      and where they DO differ (an author push), the "no APPROVED review on the current head"
  #      check above has already refused. Inert on one path, dominated on the other.
  #  (2) RECOVER THE HEAD THAT WAS SIGNED, with `signed_head_of` above, rather than trusting the
  #      rebound field.
  #  (3) TREE IDENTITY, NOT A THREE-DOT DIFF HASH — and rather than write that comparison twice,
  #      this calls `carry_tree_identity`, which #603 added for the same question one step earlier.
  #      (A three-dot diff measures each side against its own merge base, so main touching the same
  #      file — the normal state of OPS_LOG.md — makes identical contributions differ and would
  #      REFUSE a legitimate landing; and a FAILED diff hashes to the stable da39a3ee… of empty
  #      input on both sides, so two unreadable objects compare equal and the guard switches itself
  #      off. merge-tree refuses instead, and #603's wrapper also refuses a conflicted tree.)
  APPROVED_AT=$(ghr api "repos/$SLUG/pulls/$PR/reviews" --paginate 2>/dev/null | python3 -c "
import json,sys
try: rs=json.load(sys.stdin)
except Exception: raise SystemExit
a=[r for r in rs if r.get('state')=='APPROVED']
print(a[-1]['commit_id'] if a else '')
" 2>/dev/null)
  MERGE_SHA=$(ghr pr view "$PR" --repo "$SLUG" --json headRefOid --jq .headRefOid 2>/dev/null)
  if [ -n "$APPROVED_AT" ] && [ -n "$MERGE_SHA" ]; then
    # SEPARATE FETCHES. `git fetch origin main "$A" "$B"` aborts the WHOLE fetch when any one
    # refspec fails (rc=128), so a single GC'd sha or transport blip left BOTH objects unfetched AND
    # origin/main un-refreshed, and the comparison ran against whatever was on disk.
    git fetch -q origin main >/dev/null 2>&1 \
      || echo "pr_land: could not refresh origin/main — the content check below may defer or refuse"
    git fetch -q origin "$APPROVED_AT" >/dev/null 2>&1 || true
    git fetch -q origin "+refs/pull/$PR/head:refs/prland/$PR" >/dev/null 2>&1 || true
    SIGNED=$(signed_head_of "$APPROVED_AT")
    [ "$SIGNED" = "$APPROVED_AT" ] \
      || echo "pr_land: the approval is recorded on ${APPROVED_AT:0:8}; walking the update-branch merge(s) back, the head that was SIGNED is ${SIGNED:0:8}"
    if ! carry_tree_identity "$SIGNED" "$MERGE_SHA"; then
      # MAIN MOVING UNDER THIS ROUND IS NOT A REJECTION, and must not be reported as one. The
      # comparison is against origin/main AS OF NOW, while the head was merged with main as of a
      # moment ago; on a swarm landing a PR every couple of minutes those differ routinely, and the
      # answer is another round of update-branch, not a message telling a reviewer their approval is
      # suspect. So ask GitHub: BEHIND (or not yet computed) means the ordinary race — loop.
      ms2=$(ghr pr view "$PR" --repo "$SLUG" --json mergeStateStatus --jq .mergeStateStatus 2>/dev/null)
      if [ "$ms2" = "BEHIND" ] || [ "$ms2" = "UNKNOWN" ] || [ -z "$ms2" ]; then
        echo "pr_land: content check deferred — main moved (mergeState=${ms2:-unknown}); re-updating and re-checking"
        continue
      fi
      echo "pr_land: REFUSING to merge PR #$PR — the approval does NOT cover the merged content."
      echo "  signed head ${SIGNED:0:8} (approval recorded on ${APPROVED_AT:0:8}), head ${MERGE_SHA:0:8}; hashes above."
      echo "  GitHub rebinds a review to later commits on its own, so an approval can walk onto code"
      echo "  nobody read. Re-review the current head, or dismiss and re-sign it deliberately."
      exit 6
    fi
  fi
  ghr pr merge "$PR" --repo "$SLUG" --squash --auto --delete-branch >/dev/null 2>&1 || true
  sleep 4
  st=$(ghr pr view "$PR" --repo "$SLUG" --json state --jq .state 2>/dev/null)
  [ "$st" = "MERGED" ] && { echo "pr_land: PR #$PR MERGED ✅"; exit 0; }
done
echo "pr_land: REBASE-RACE — PR #$PR still not merged after 6 rounds (main advancing under swarm); retry later"; exit 3
