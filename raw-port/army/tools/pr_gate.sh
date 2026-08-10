#!/bin/bash
# pr_gate.sh <PR#> [--reviewed] — PR-flow faithfulness gate, run by the ADVERSARIAL REVIEWER on
# vjeux-mac (has Final Cut Pro; the dlsym oracle needs it). Replaces wt_merge.sh + sidecars.
#
# TWO-PHASE (mirrors the old gate=mechanical / reviewer=semantic split):
#   PHASE 1 (default): run gate.sh G0-G5 + regression_check + dup_check in an ISOLATED worktree
#     (gate TOOLS taken from origin/main so a PR can't ship its own gate). Post commit status:
#       - hard fail (G0-G5 reject / regression exit2 / dup exit5) -> status FAILURE.
#       - PASS but G5 raised FLAGs (NO-DISASM blind spots — the class where PCTimer_getSeconds's
#         fabricated steady_clock hides) -> status FAILURE with 'needs reviewer re-derivation'.
#         The mechanical gate does NOT clear flags; only a human/LLM adversarial reviewer does.
#       - clean PASS, 0 flags -> status SUCCESS (mergeable).
#   PHASE 2: after the reviewer INDEPENDENTLY re-derives disasm and confirms faithful, they re-run
#     `pr_gate.sh <PR#> --reviewed` which (only if phase-1 was PASS-modulo-flags) posts SUCCESS.
#
# A green 'faithfulness-gate' status therefore means: mechanical gate clean AND (no flags OR a
# reviewer explicitly signed off). Branch protection requires this status; reviewer then merges.
set -uo pipefail
PR="${1:?usage: pr_gate.sh <PR#> [--reviewed]}"
REVIEWED=0; [ "${2:-}" = "--reviewed" ] && REVIEWED=1
REPO_SLUG="vjeux/fcp-headless-transitions"
CANON="$HOME/random/final-cut-pro-transitions"
cd "$CANON"

HEAD_SHA=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefOid  --jq .headRefOid)
HEAD_REF=$(gh pr view "$PR" --repo "$REPO_SLUG" --json headRefName --jq .headRefName)
[ -z "$HEAD_SHA" ] && { echo "PR #$PR not found"; exit 3; }
echo "PR #$PR  head=$HEAD_REF @ ${HEAD_SHA:0:12}  reviewed=$REVIEWED"
post_status () { gh api -X POST "repos/$REPO_SLUG/statuses/$HEAD_SHA" -f state="$1" -f context="faithfulness-gate" -f description="$2" >/dev/null 2>&1 && echo "  status: $1 — $2" || echo "  WARN status post failed"; }
post_status pending "gate running on vjeux-mac"

git fetch -q origin main "+refs/pull/$PR/head:refs/prgate/$PR" 2>/dev/null || git fetch -q origin main "$HEAD_REF" 2>/dev/null
WT="/tmp/prgate_${PR}_$$_$(date +%s)"
git worktree add -q --detach "$WT" "$HEAD_SHA" 2>&1 | tail -1
cleanup () { cd "$CANON"; find "$WT" -maxdepth 4 -type l -delete 2>/dev/null; git worktree remove --force "$WT" 2>/dev/null; rm -rf "$WT" 2>/dev/null; git worktree prune 2>/dev/null; }
trap cleanup EXIT
cd "$WT"
for d in engine/node_modules raw-port/node_modules venv; do ln -sfn "$CANON/$d" "$d" 2>/dev/null || true; done
# TRUSTED gate tools from origin/main (never trust the PR's own gate)
T="/tmp/prgate_tools_$$"; rm -rf "$T"; mkdir -p "$T"
git --git-dir="$CANON/.git" archive origin/main raw-port/army/gate raw-port/army/tools | tar -x -C "$T" 2>/dev/null
cp -R "$T/raw-port/army/gate" raw-port/army/ 2>/dev/null; cp -R "$T/raw-port/army/tools" raw-port/army/ 2>/dev/null; rm -rf "$T"

git fetch -q origin main 2>&1 | tail -1
CHANGED=$(git diff --name-only origin/main...HEAD -- 'raw-port/src/**/*.ts' | tr '\n' ' ')
if [ -z "$CHANGED" ]; then post_status success "no raw-port/src ports to gate (infra/tooling PR)"; echo "PR_GATE: PASS (no src changes) (#$PR)"; exit 0; fi
echo "changed: $CHANGED"

FAIL=0; REASON=""
GLOG=/tmp/prgate_gatelog_$$
bash raw-port/army/gate/gate.sh $CHANGED 2>&1 | tee "$GLOG"
grep -q "GATE: PASS" "$GLOG" || { FAIL=1; REASON="G0-G5 gate reject"; }
# G5 flags (blind-spot: NO-DISASM / dispatch-only) — a green status is NOT allowed while flags stand,
# unless a reviewer has re-derived and passes --reviewed.
FLAGS=$(grep -cE '^  FLAG:' "$GLOG" 2>/dev/null || echo 0)
rm -f "$GLOG"

python3 raw-port/army/tools/regression_check.py origin/main HEAD $CHANGED; rc=$?
if [ "$rc" = "2" ]; then FAIL=1; REASON="regression (rebase needed)"; elif [ "$rc" != "0" ]; then FAIL=1; REASON="regression_check errored rc=$rc"; fi
python3 raw-port/army/tools/dup_check.py origin/main HEAD $CHANGED; rc=$?
if [ "$rc" = "5" ]; then FAIL=1; REASON="dup-ledger (already on main)"; elif [ "$rc" != "0" ]; then FAIL=1; REASON="dup_check errored rc=$rc"; fi

if [ "$FAIL" != 0 ]; then post_status failure "$REASON"; echo "PR_GATE: FAIL ❌ (#$PR) — $REASON"; exit 1; fi
if [ "$FLAGS" -gt 0 ] && [ "$REVIEWED" != 1 ]; then
  post_status failure "$FLAGS G5 flag(s): reviewer must re-derive disasm, then rerun --reviewed"
  echo "PR_GATE: NEEDS-REVIEW ⚠️ (#$PR) — $FLAGS G5 flag(s); mechanical gate clean but blind-spots need semantic review"
  exit 2
fi
if [ "$FLAGS" -gt 0 ]; then post_status success "reviewer-signed (had $FLAGS flag(s), re-derived OK)"; else post_status success "gate PASS (G0-G5 clean, 0 flags)"; fi
echo "PR_GATE: PASS ✅ (#$PR)"
