#!/bin/bash
# pr_gate.sh <PR_NUMBER> — PR-flow faithfulness gate, run by the ADVERSARIAL REVIEWER on vjeux-mac
# (the machine with Final Cut Pro; the dlsym oracle needs it). Replaces wt_merge.sh + sidecars.
#
#   1. checks out the PR head into an ISOLATED throwaway worktree (never dirties the canonical tree)
#   2. runs the gate LOCALLY: gate.sh (G0-G5) + regression_check (exit 2) + dup_check (exit 5)
#   3. posts the verdict to GitHub as commit status context "faithfulness-gate" (green/red)
#
# SECURITY (learned in e2e): the GATE TOOLS THEMSELVES are run from a TRUSTED checkout of origin/main,
# NOT from the PR branch — else a PR could ship a broken/hostile gate and self-pass (a stale PR shipped
# a truncated dup_check.py that crashed and was mis-read as pass). Only the PORTED .ts under
# raw-port/src comes from the PR; gate.sh/regression_check/dup_check/provenance/g5 come from main.
# Any unexpected (non-0, non-sentinel) exit from a checker is treated as FAILURE, never pass.
set -uo pipefail
PR="${1:?usage: pr_gate.sh <PR_NUMBER>}"
REPO_SLUG="vjeux/fcp-headless-transitions"
CANON="$HOME/random/final-cut-pro-transitions"
cd "$CANON"

HEAD_SHA=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefOid  --jq .headRefOid)
HEAD_REF=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefName --jq .headRefName)
[ -z "$HEAD_SHA" ] && { echo "PR #$PR not found"; exit 3; }
echo "PR #$PR  head=$HEAD_REF @ ${HEAD_SHA:0:12}"

post_status () { gh api -X POST "repos/$REPO_SLUG/statuses/$HEAD_SHA" -f state="$1" -f context="faithfulness-gate" -f description="$2" >/dev/null 2>&1 && echo "  status: $1 — $2" || echo "  WARN: status post failed"; }
post_status pending "gate running on vjeux-mac"

git fetch -q origin main "+refs/pull/$PR/head:refs/prgate/$PR" 2>/dev/null || git fetch -q origin main "$HEAD_REF" 2>/dev/null
WT="/tmp/prgate_${PR}_$$_$(date +%s)"
git worktree add -q --detach "$WT" "$HEAD_SHA" 2>&1 | tail -1
cleanup () { cd "$CANON"; find "$WT" -maxdepth 4 -type l -delete 2>/dev/null; git worktree remove --force "$WT" 2>/dev/null; rm -rf "$WT" 2>/dev/null; git worktree prune 2>/dev/null; }
trap cleanup EXIT
cd "$WT"
for d in engine/node_modules raw-port/node_modules venv; do ln -sfn "$CANON/$d" "$d" 2>/dev/null || true; done

# --- TRUSTED GATE TOOLS from origin/main (NOT from the PR branch) ---
TOOLS="/tmp/prgate_tools_$$"; rm -rf "$TOOLS"; mkdir -p "$TOOLS"
git --git-dir="$CANON/.git" archive origin/main raw-port/army/gate raw-port/army/tools | tar -x -C "$TOOLS" 2>/dev/null
# overlay trusted tools over the PR worktree's copies (so gate.sh etc. are main's version)
cp -R "$TOOLS/raw-port/army/gate"  raw-port/army/ 2>/dev/null
cp -R "$TOOLS/raw-port/army/tools" raw-port/army/ 2>/dev/null
rm -rf "$TOOLS"

git fetch -q origin main 2>&1 | tail -1
CHANGED=$(git diff --name-only origin/main...HEAD -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
if [ -z "$CHANGED" ]; then echo "no raw-port/src/*.ts changes"; post_status failure "no src changes to gate"; exit 1; fi
echo "changed: $CHANGED"

FAIL=0; REASON=""
echo "== gate.sh (G0-G5) =="
bash raw-port/army/gate/gate.sh $CHANGED || { FAIL=1; REASON="G0-G5 gate"; }

echo "== regression_check (stale-base) =="
python3 raw-port/army/tools/regression_check.py origin/main HEAD $CHANGED; rc=$?
if [ "$rc" = "2" ]; then FAIL=1; REASON="regression: drops a landed symbol (rebase needed)";
elif [ "$rc" != "0" ]; then FAIL=1; REASON="regression_check errored (rc=$rc)"; fi

echo "== dup_check (cross-file dup) =="
python3 raw-port/army/tools/dup_check.py origin/main HEAD $CHANGED; rc=$?
if [ "$rc" = "5" ]; then FAIL=1; REASON="dup-ledger: symbol already on main";
elif [ "$rc" != "0" ]; then FAIL=1; REASON="dup_check errored (rc=$rc)"; fi

if [ "$FAIL" = 0 ]; then post_status success "gate PASS (G0-G5 + regression + dup)"; echo "PR_GATE: PASS ✅ (#$PR)";
else post_status failure "$REASON"; echo "PR_GATE: FAIL ❌ (#$PR) — $REASON"; fi
exit $FAIL
