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
  local rows
  rows=$(gh pr list --repo "$SLUG" --state open --limit 100 \
      --json number,headRefOid,statusCheckRollup,reviewDecision \
      --jq '.[] | {n:.number, sha:.headRefOid, d:(.reviewDecision // ""), s:([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state // "NONE")} | select(.s=="NONE" or .s=="PENDING" or .s=="EXPECTED" or (.s=="SUCCESS" and .d!="APPROVED" and .d!="CHANGES_REQUESTED")) | "\(.n)\t\(.sha)"' 2>/dev/null)
  [ -z "$rows" ] && { echo "NONE"; return 1; }
  # randomize so parallel reviewers don't collide on the same first row
  rows=$(printf '%s\n' "$rows" | sort -R 2>/dev/null || printf '%s\n' "$rows")
  while IFS=$'\t' read -r num sha; do
    [ -z "$num" ] && continue
    # LEASE KEY IS THE PR NUMBER, NOT PR+SHA. Keying on the head SHA opened a race that merged an
    # already-rejected port: reviewer-06 held PR #221 @d8ce40e5 and was about to post
    # CHANGES_REQUESTED when main advanced, the PR acquired head @a7610679, a second reviewer slot
    # leased that DIFFERENT key, approved, and merged. The NaN-branch defect landed on main as
    # eb6f6086 (issue #224); the same race also merged #223/#225/#231 out from under that reviewer.
    # A PR under review is under review no matter how its head moves — one reviewer at a time. The
    # lease is released after each verdict, so a genuinely new head still gets re-reviewed next pass.
    local lk="$LEAS/pr-${num}"
    if mkdir "$lk" 2>/dev/null; then
      echo "$(date +%s) $sha" > "$lk/held"; echo "CLAIMED $num $sha"; return 0; fi
    if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
      echo "$(date +%s) $sha" > "$lk/held"; echo "CLAIMED $num $sha (reclaimed)"; return 0; fi
  done <<< "$rows"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim;;
  # release takes <PR> [sha]; the sha is accepted for call-site compatibility but ignored, since the
  # lease is now keyed by PR number alone (see the race note in pick_and_claim).
  release) rm -rf "$LEAS/pr-${2:?PR}" "$LEAS/${2}-${3:0:12}" 2>/dev/null; echo "released review lease $2";;
  status)  ls -1 "$LEAS" 2>/dev/null | while read -r p; do echo "  $p held $(cat "$LEAS/$p/held" 2>/dev/null)"; done; { [ -z "$(ls -A "$LEAS" 2>/dev/null)" ] && echo "  (no review leases)"; } ; true;;
  *) echo "usage: review_claim.sh {claim|release <PR> <sha>|status}" >&2; exit 2;;
esac
