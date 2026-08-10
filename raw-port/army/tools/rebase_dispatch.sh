#!/bin/bash
# rebase_dispatch.sh — ⚠️ RETIRED (2026-08-10, Model B). This was the PUSH-dispatch tool: the
# coordinator ran it once per tick to find regression-stuck PRs and then SPAWNED a worker to rebase
# each. Model B removed all agent-spawning — workers now PULL rebase tasks themselves via
# `rebase_claim.sh claim` (atomic lease + the same per-PR attempt cap 3 + same auto-close-past-cap).
# Kept only for reference; not wired into any cron. Use rebase_claim.sh instead.
#
# rebase_dispatch.sh [--apply] — coordinator helper: find PRs stuck on a REGRESSION faithfulness-gate
# FAILURE and decide what to do, with a per-PR attempt cap so nothing loops forever.
#
# For each open PR whose latest faithfulness-gate status is `failure` with a "regression" description:
#   - increment its attempt counter (state: $FCT_STATE_DIR/rebase_attempts/<PR>, else ~/.fct-pool/rebase_attempts/)
#   - attempts <= CAP (default 3): print `REBASE <PR#> <branch>` — the coordinator dispatches ONE worker
#     in rebase-task mode (rebase_pr.sh <PR#>) to re-apply net-new methods onto current main.
#   - attempts >  CAP: `gh pr close <PR#>` with a comment (the append-only queue re-hands the symbol to a
#     fresh worker cut from current main — no staleness possible). Print `CLOSED <PR#>`.
# Read-only unless --apply (default: dry-run, just prints what it WOULD do).
#
# The coordinator runs this ONCE per tick, spawns at most 1-2 rebase workers from the REBASE lines,
# and lets reviewers handle everything else. Never rebases here itself (that's worker/author work).
set -uo pipefail
SLUG="vjeux/fcp-headless-transitions"; CANON="$HOME/random/final-cut-pro-transitions"; cd "$CANON"
APPLY=0; [ "${1:-}" = "--apply" ] && APPLY=1
CAP="${REBASE_ATTEMPT_CAP:-3}"
STATE="${FCT_STATE_DIR:-$HOME/.fct-pool}/rebase_attempts"; mkdir -p "$STATE"
git fetch -q origin main 2>/dev/null || true

# open PRs whose LATEST faithfulness-gate is a FAILURE. The GraphQL statusCheckRollup shape does NOT
# expose the status description, so we take the failing candidates from GraphQL (state==FAILURE) and
# confirm the "regression"/"rebase" reason via the REST commit-statuses API (which HAS description).
cand=$(gh pr list --repo "$SLUG" --state open --limit 100 --json number,headRefName,headRefOid,statusCheckRollup \
  --jq '.[] | select([.statusCheckRollup[]?|select(.context=="faithfulness-gate")]|last|.state=="FAILURE") | "\(.number) \(.headRefName) \(.headRefOid)"' 2>/dev/null)

prs=""
while read -r num br sha; do
  [ -z "$num" ] && continue
  desc=$(gh api "repos/$SLUG/commits/$sha/statuses" --jq '[.[]|select(.context=="faithfulness-gate")][0].description' 2>/dev/null)
  echo "$desc" | grep -qiE 'regression|rebase' && prs="$prs$num $br
"
done <<< "$cand"
prs=$(printf '%s' "$prs" | sed '/^$/d')

[ -z "$prs" ] && { echo "rebase_dispatch: no regression-stuck PRs"; exit 0; }

echo "$prs" | while read -r num br; do
  [ -z "$num" ] && continue
  af="$STATE/$num"; n=$(cat "$af" 2>/dev/null || echo 0); n=$((n+1))
  if [ "$n" -le "$CAP" ]; then
    [ "$APPLY" = 1 ] && echo "$n" > "$af"
    echo "REBASE $num $br   (attempt $n/$CAP — dispatch a worker: rebase_pr.sh $num)"
  else
    if [ "$APPLY" = 1 ]; then
      gh pr close "$num" --repo "$SLUG" --comment "Closed after $CAP failed rebase attempts (stale-base shared-class conflict that couldn't be auto-rebased). The append-only claim queue will re-hand this symbol to a fresh worker cut from current main — no manual action needed." >/dev/null 2>&1 && rm -f "$af"
    fi
    echo "CLOSED $num $br   (exceeded $CAP attempts — requeue from fresh main)"
  fi
done
