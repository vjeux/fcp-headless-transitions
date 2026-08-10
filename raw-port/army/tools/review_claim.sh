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
  local rows
  rows=$(gh pr list --repo "$SLUG" --state open --limit 100 \
      --json number,headRefOid,statusCheckRollup \
      --jq '.[] | {n:.number, sha:.headRefOid, s:([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state // "NONE")} | select(.s=="NONE" or .s=="PENDING" or .s=="EXPECTED") | "\(.n)\t\(.sha)"' 2>/dev/null)
  [ -z "$rows" ] && { echo "NONE"; return 1; }
  # randomize so parallel reviewers don't collide on the same first row
  rows=$(printf '%s\n' "$rows" | sort -R 2>/dev/null || printf '%s\n' "$rows")
  while IFS=$'\t' read -r num sha; do
    [ -z "$num" ] && continue
    local lk="$LEAS/${num}-${sha:0:12}"
    if mkdir "$lk" 2>/dev/null; then
      echo "$(date +%s)" > "$lk/held"; echo "CLAIMED $num $sha"; return 0; fi
    if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
      echo "$(date +%s)" > "$lk/held"; echo "CLAIMED $num $sha (reclaimed)"; return 0; fi
  done <<< "$rows"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim;;
  release) rm -rf "$LEAS/${2:?PR}-${3:0:12}" 2>/dev/null; echo "released review lease $2";;
  status)  ls -1 "$LEAS" 2>/dev/null | while read -r p; do echo "  $p held $(cat "$LEAS/$p/held" 2>/dev/null)"; done; { [ -z "$(ls -A "$LEAS" 2>/dev/null)" ] && echo "  (no review leases)"; } ; true;;
  *) echo "usage: review_claim.sh {claim|release <PR> <sha>|status}" >&2; exit 2;;
esac
