#!/bin/bash
# pr_gate.sh <PR_NUMBER> — the PR-flow faithfulness gate. Run by the ADVERSARIAL REVIEWER agent
# on vjeux-mac (the machine with Final Cut Pro, required by the dlsym oracle). Replaces the old
# wt_merge.sh + sidecar mechanism. It:
#   1. checks out the PR head into an ISOLATED throwaway worktree (never dirties the canonical tree)
#   2. runs the EXISTING gate.sh (G0-G5) + regression_check (exit 2) + dup_check (exit 5) LOCALLY
#   3. posts the verdict to GitHub as commit status context "faithfulness-gate" (green/red)
#   4. prints a one-line verdict; the reviewer then does the semantic review + `gh pr review`
# It does NOT merge and does NOT approve — a human/LLM adversarial review + `gh pr merge --auto` do
# that. This script is the mechanical, un-gameable half; the reviewer is the semantic half.
#
# Exit: 0 = gate PASS (status posted success), non-zero = gate/regression/dup fail (status failure).
set -uo pipefail
PR="${1:?usage: pr_gate.sh <PR_NUMBER>}"
REPO_SLUG="vjeux/fcp-headless-transitions"
CANON="$HOME/random/final-cut-pro-transitions"
cd "$CANON"

# --- resolve PR head sha + branch ---
HEAD_SHA=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefOid  --jq .headRefOid)
HEAD_REF=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefName --jq .headRefName)
[ -z "$HEAD_SHA" ] && { echo "PR #$PR not found"; exit 3; }
echo "PR #$PR  head=$HEAD_REF @ ${HEAD_SHA:0:12}"

post_status () {  # <state> <desc>
  gh api -X POST "repos/$REPO_SLUG/statuses/$HEAD_SHA" \
    -f state="$1" -f context="faithfulness-gate" -f description="$2" >/dev/null 2>&1 \
    && echo "  status posted: $1 — $2" || echo "  WARN: status post failed"
}
post_status pending "gate running on vjeux-mac"

# --- isolated worktree at the PR head (fetch the PR ref) ---
WT="/tmp/prgate_${PR}_$$_$(date +%s)"
git fetch -q origin "pull/$PR/head:_prgate_$PR" 2>/dev/null || git fetch -q origin "$HEAD_REF" 2>/dev/null
git worktree add -q --detach "$WT" "$HEAD_SHA" 2>&1 | tail -1
cleanup () { cd "$CANON"; find "$WT" -maxdepth 4 -type l -delete 2>/dev/null; git worktree remove --force "$WT" 2>/dev/null; rm -rf "$WT" 2>/dev/null; git worktree prune 2>/dev/null; }
trap cleanup EXIT
cd "$WT"
# link heavy gitignored deps so tsgo + oracle work
for d in engine/node_modules raw-port/node_modules venv; do ln -sfn "$CANON/$d" "$d" 2>/dev/null || true; done

git fetch -q origin main 2>&1 | tail -1
CHANGED=$(git diff --name-only origin/main...HEAD -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
if [ -z "$CHANGED" ]; then echo "no raw-port/src/*.ts changes"; post_status failure "no src changes to gate"; exit 1; fi
echo "changed: $CHANGED"

FAIL=0; REASON=""
echo "== gate.sh (G0-G5) =="
bash raw-port/army/gate/gate.sh $CHANGED || { FAIL=1; REASON="G0-G5 gate"; }

echo "== regression_check (stale-base) =="
python3 raw-port/army/tools/regression_check.py origin/main HEAD $CHANGED; rc=$?
[ "$rc" = "2" ] && { FAIL=1; REASON="regression: drops a landed symbol (rebase needed)"; }

echo "== dup_check (cross-file dup) =="
python3 raw-port/army/tools/dup_check.py origin/main HEAD $CHANGED; rc=$?
[ "$rc" = "5" ] && { FAIL=1; REASON="dup-ledger: symbol already on main"; }

if [ "$FAIL" = 0 ]; then
  post_status success "gate PASS (G0-G5 + regression + dup)"
  echo "PR_GATE: PASS ✅ (#$PR)"
else
  post_status failure "$REASON"
  echo "PR_GATE: FAIL ❌ (#$PR) — $REASON"
fi
exit $FAIL
