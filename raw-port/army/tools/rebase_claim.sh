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

lease_free () { # <PR> : 0 if we can take it (free or stale), else 1
  local lk="$LEAS/$1"
  mkdir "$lk" 2>/dev/null && { echo "$(date +%s)" > "$lk/held"; return 0; }
  if [ -n "$(find "$lk/held" -mmin +$LEASE_MIN 2>/dev/null)" ]; then
    echo "$(date +%s)" > "$lk/held"; return 0; fi
  return 1
}

cmd_claim () {
  git fetch -q origin main 2>/dev/null || true
  # candidate PRs whose LATEST faithfulness-gate is FAILURE
  local cand
  cand=$(gh pr list --repo "$SLUG" --state open --limit 100 \
      --json number,headRefName,headRefOid,statusCheckRollup \
      --jq '.[] | select([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state=="FAILURE") | "\(.number)\t\(.headRefName)\t\(.headRefOid)"' 2>/dev/null)
  [ -z "$cand" ] && { echo "NONE"; return 1; }
  while IFS=$'\t' read -r num br sha; do
    [ -z "$num" ] && continue
    # confirm the failure reason is a regression/rebase (REST has the description; GraphQL doesn't)
    local desc; desc=$(gh api "repos/$SLUG/commits/$sha/statuses" \
      --jq '[.[]|select(.context=="faithfulness-gate")][0].description' 2>/dev/null)
    echo "$desc" | grep -qiE 'regression|rebase' || continue
    # attempt cap: past cap => close it, re-queue via append-only claim queue, skip
    local af="$ATT/$num"; local n; n=$(cat "$af" 2>/dev/null || echo 0)
    if [ "$n" -ge "$CAP" ]; then
      gh pr close "$num" --repo "$SLUG" --comment "Closed after $CAP failed rebase attempts (stale-base shared-class conflict that couldn't be auto-rebased). The append-only claim queue re-hands this symbol to a fresh worker cut from current main." >/dev/null 2>&1
      rm -rf "$LEAS/$num" 2>/dev/null; rm -f "$af" 2>/dev/null
      continue
    fi
    # try to lease it
    if lease_free "$num"; then
      echo "$((n+1))" > "$af"
      echo "CLAIMED $num $br   (attempt $((n+1))/$CAP)"
      return 0
    fi
  done <<< "$cand"
  echo "NONE"; return 1
}

case "${1:-claim}" in
  claim)   cmd_claim;;
  release) rm -rf "$LEAS/${2:?usage: release <PR>}" 2>/dev/null; echo "released lease $2";;
  status)
    echo "rebase leases:"; ls -1 "$LEAS" 2>/dev/null | while read -r p; do echo "  PR#$p held $(cat "$LEAS/$p/held" 2>/dev/null)"; done
    echo "attempt counts:"; ls -1 "$ATT" 2>/dev/null | while read -r p; do echo "  PR#$p = $(cat "$ATT/$p" 2>/dev/null)/$CAP"; done
    ;;
  *) echo "usage: rebase_claim.sh {claim|release <PR>|status}" >&2; exit 2;;
esac
