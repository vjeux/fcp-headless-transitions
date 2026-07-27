#!/bin/bash
# wt_merge.sh <agentTag> — SERIALIZED merge-queue step. Run in the MAIN checkout (or anywhere in repo).
# Takes ONE agent's branch port/<tag>, runs the faithfulness gate on ITS changed files, and if green
# fast-forwards/merges it into main and pushes. A global lock serializes merges so there's never a
# push race. This is the ONLY place that writes to main — agents never touch main directly.
set -uo pipefail
TAG="${1:?usage: wt_merge.sh <agentTag>}"
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
BR="port/$TAG"
LOCKDIR="$REPO/raw-port/army/worktrees/.merge.lock.d"
cd "$REPO"
# global merge lock (serialize — only one merge to main at a time). mkdir is atomic + portable (no flock on macOS).
for i in $(seq 1 300); do mkdir "$LOCKDIR" 2>/dev/null && break; sleep 1; done
trap 'rmdir "$LOCKDIR" 2>/dev/null || true' EXIT
git fetch -q origin
git show-ref --verify -q "refs/heads/$BR" || { echo "no branch $BR"; exit 1; }
# what did this branch change under raw-port/src vs origin/main?
CHANGED=$(git diff --name-only origin/main "$BR" -- 'raw-port/src/**/*.ts' | sed "s#^#$REPO/#")
echo "== gating $BR changed files: =="; echo "$CHANGED" | sed 's/^/  /'
if [ -n "$CHANGED" ]; then
  # gate runs against the BRANCH content: check it out into a temp gate-worktree so tsc sees its files
  GW="$REPO/raw-port/army/worktrees/.gate-$TAG"
  git worktree add -q --force "$GW" "$BR" 2>/dev/null || git -C "$GW" checkout -q "$BR"
  ln -sfn "$REPO/engine/node_modules" "$GW/engine/node_modules" 2>/dev/null || true
  ln -sfn "$REPO/raw-port/node_modules" "$GW/raw-port/node_modules" 2>/dev/null || true
  GCHANGED=$(echo "$CHANGED" | sed "s#$REPO/#$GW/#")
  ( cd "$GW" && bash raw-port/army/gate/gate.sh $GCHANGED ) ; RC=$?
  git worktree remove --force "$GW" 2>/dev/null
  [ "$RC" = 0 ] || { echo "GATE FAILED for $BR — NOT merging"; exit 2; }
fi
# merge (fast-forward if possible, else a clean merge) into main and push
git checkout -q main
git pull -q --no-edit origin main
git merge -q --no-edit "$BR" || { echo "MERGE CONFLICT on $BR — needs manual resolve"; exit 3; }
git push -q origin main && echo "MERGED + PUSHED $BR -> main"
git worktree remove --force "$REPO/raw-port/army/worktrees/$TAG" 2>/dev/null || true
git branch -q -d "$BR" 2>/dev/null || true
