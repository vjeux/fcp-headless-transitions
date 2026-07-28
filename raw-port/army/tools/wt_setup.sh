#!/bin/bash
# wt_setup.sh <agentTag> — create an ISOLATED git worktree+branch for one port-agent.
# Overhead (measured on this repo): ~0.07s create, ~0.15s checkout, ~12M disk (raw-port only);
# the .git object store is SHARED (not copied) so N worktrees add N*12M, not N*3G.
# Agents work + commit + gate ENTIRELY inside their worktree. A serialized merge-queue (wt_merge.sh)
# fast-forwards green branches into main. No shared index, no push races, no peer clobbering.
set -euo pipefail
TAG="${1:?usage: wt_setup.sh <agentTag>}"
# C++ "::" is not a valid git ref/path component — sanitize to "__" so shader tags like
# "bm3dnr_buf::bm3dnr_buf_blend..." don't fatal on `git worktree add`/branch creation.
TAG="${TAG//::/__}"
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"          # main checkout
WT="$REPO/raw-port/army/worktrees/$TAG"
BR="port/$TAG"
cd "$REPO"
# SERIALIZE git-mutating setup: concurrent `git worktree add` / `git fetch` race .git/worktrees and
# .git/index.lock. Under a mass agent wave many setups fire at once, so take a global lock (mkdir is
# atomic + portable, no flock on macOS). Only the fetch + worktree-add are serialized; the symlink
# work below is per-worktree and safe to run unlocked.
SETUP_LOCK="$REPO/raw-port/army/worktrees/.setup.lock.d"
mkdir -p "$REPO/raw-port/army/worktrees"
for i in $(seq 1 600); do mkdir "$SETUP_LOCK" 2>/dev/null && break; sleep 0.5; done
trap 'rmdir "$SETUP_LOCK" 2>/dev/null || true' EXIT
git fetch -q origin 2>/dev/null || true
# fresh branch off the latest origin/main; reuse if it already exists (resume)
if git worktree list --porcelain | grep -qx "worktree $WT"; then
  echo "worktree exists: $WT (branch $BR) — resuming"
  # A leftover worktree's branch may be based off a STALE origin/main (many merges ago). If so, the
  # merge gate later sees files main ADDED as 'missing' and the worker burns cycles rebasing. Refresh
  # it now: if the worktree is CLEAN and has NO commits of its own (tip is an ancestor of origin/main),
  # hard-reset it to current origin/main. If it has un-merged local work, leave it (don't destroy work).
  if [ -z "$(git -C "$WT" status --porcelain)" ]; then
    TIP="$(git -C "$WT" rev-parse HEAD 2>/dev/null || echo none)"
    if [ "$TIP" != none ] && git merge-base --is-ancestor "$TIP" origin/main 2>/dev/null; then
      git -C "$WT" reset -q --hard origin/main
      echo "  (clean + fully-merged: reset $BR to current origin/main)"
    else
      echo "  (has local commits or dirty tree: left as-is — rebase manually if the merge gate complains)"
    fi
  fi
else
  git show-ref --verify -q "refs/heads/$BR" && git branch -q -D "$BR" 2>/dev/null || true
  git worktree add -q -b "$BR" "$WT" origin/main
fi
rmdir "$SETUP_LOCK" 2>/dev/null || true
trap - EXIT
# Symlink the gitignored heavy runtime deps so tsc + the oracle work WITHOUT copying 500M+:
#   engine/node_modules (tsc), raw-port/node_modules (tsx), venv (oracle python), fct/parity reports dir
ln -sfn "$REPO/engine/node_modules"   "$WT/engine/node_modules"   2>/dev/null || true
ln -sfn "$REPO/raw-port/node_modules" "$WT/raw-port/node_modules" 2>/dev/null || true
ln -sfn "$REPO/venv"                  "$WT/venv"                  2>/dev/null || true
echo "WORKTREE READY: $WT  (branch $BR, based on origin/main)"
echo "cd $WT && do all work here; commit to $BR; then: raw-port/army/tools/wt_merge.sh $TAG"
