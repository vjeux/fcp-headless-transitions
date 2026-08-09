#!/bin/bash
# wt_setup.sh <agentTag> — create an ISOLATED git worktree+branch for one port-agent.
# Overhead (measured on this repo): ~0.07s create, ~0.15s checkout, ~12M disk (raw-port only);
# the .git object store is SHARED (not copied) so N worktrees add N*12M, not N*3G.
# Agents work + commit + gate ENTIRELY inside their worktree. A serialized merge-queue (wt_merge.sh)
# fast-forwards green branches into main. No shared index, no push races, no peer clobbering.
set -euo pipefail
MODE="setup"
if [ "${1:-}" = "done" ]; then MODE="done"; shift; fi   # `wt_setup.sh done <tag>` = teardown after push
TAG="${1:?usage: wt_setup.sh [done] <agentTag>}"
# C++ "::" is not a valid git ref/path component — sanitize to "__" so shader tags like
# "bm3dnr_buf::bm3dnr_buf_blend..." don't fatal on `git worktree add`/branch creation.
TAG="${TAG//::/__}"
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"          # main checkout
WT="$REPO/raw-port/army/worktrees/$TAG"
BR="port/$TAG"
cd "$REPO"

# --- TEARDOWN MODE: `wt_setup.sh done <tag>` ------------------------------------------------------
# A worktree is DISPOSABLE SCRATCH; the durable artifact is the pushed commit on origin. A worker
# calls this the instant after its `git push` succeeds. Removing the worktree loses NOTHING: the
# branch ref + commit objects persist in the shared .git AND on origin, `git worktree add` recreates
# the checkout on demand, and wt_merge builds its OWN .gate-<tag> worktree from the branch ref (it
# never touches the agent's worktree). We remove ONLY when SAFE — clean tree AND tip already on
# origin. Dirty or unpushed => keep and say so (never destroy un-pushed work).
if [ "$MODE" = "done" ]; then
  git fetch -q origin 2>/dev/null || true
  if ! git worktree list --porcelain | grep -qx "worktree $WT"; then echo "no worktree $WT (already gone)"; exit 0; fi
  if [ -n "$(git -C "$WT" status --porcelain 2>/dev/null)" ]; then echo "KEEP $TAG: uncommitted changes — commit+push first"; exit 0; fi
  TIP="$(git -C "$WT" rev-parse HEAD 2>/dev/null || echo none)"
  OTIP="$(git rev-parse -q --verify "origin/$BR" 2>/dev/null || echo none)"
  if { [ "$OTIP" != none ] && [ "$TIP" = "$OTIP" ]; } || git merge-base --is-ancestor "$TIP" origin/main 2>/dev/null; then
    git worktree remove --force "$WT" 2>/dev/null && echo "REAPED $TAG (clean + on origin; commit is the durable artifact)"
    # `git worktree prune` (unscoped) scans the SHARED registry and reaps ANY worktree whose dir it
    # can't stat right now — under a mass wave that includes a PEER worktree still mid-`worktree add`
    # (dir exists but admin entry not fully written) or mid-commit, silently destroying its checkout
    # + un-pushed edits (observed: dep-worker-103/105 lost fully-decoded work incl. the OZAudioMixer
    # downmix matrix). `git worktree remove` above already cleaned THIS worker's own admin entry, so
    # the prune is only opportunistic housekeeping for genuinely-abandoned (crashed) worktrees.
    # Scope it with --expire so it can NEVER reap a worktree touched within the last hour — a live
    # peer's seconds-old worktree is safe; only truly-stale crash leftovers get collected.
    git worktree prune --expire=1.hour.ago 2>/dev/null || true
  else
    echo "KEEP $TAG: local commits not on origin — push, then rerun: wt_setup.sh done $TAG"
  fi
  exit 0
fi
SETUP_LOCK="$REPO/raw-port/army/worktrees/.setup.lock.d"
mkdir -p "$REPO/raw-port/army/worktrees"
# FETCH OUTSIDE THE LOCK, THROTTLED. `git worktree add origin/main` (L67) only needs origin/main to
# EXIST locally, not to be fresh: it's been fetched hundreds of times, and a slightly-stale base is
# already tolerated everywhere (resume-path reset L56-64, wt_merge's 3-way merge, and the `|| true`
# here). Concurrent fetches only collide on packed-refs.lock, which aborts cleanly (atomic lock+rename,
# no corruption) — safe unlocked. Throttle so that in a mass agent wave ONE worker fetches and the rest
# skip instantly, instead of all serializing a multi-second network round-trip inside the critical section.
STAMP="$REPO/raw-port/army/worktrees/.last_fetch"
if [ ! -f "$STAMP" ] || [ "$(( $(date +%s) - $(stat -f %m "$STAMP" 2>/dev/null || echo 0) ))" -gt 30 ]; then
  git fetch -q origin 2>/dev/null && touch "$STAMP" || true
fi
# SERIALIZE ONLY `git worktree add`: it mutates the shared .git/worktrees registry + index and truly
# races under a mass wave. mkdir is atomic + portable (no flock on macOS). With fetch moved out, the
# lock hold drops from a network RTT to ~0.07s. The symlink work below is per-worktree, safe unlocked.
for i in $(seq 1 600); do mkdir "$SETUP_LOCK" 2>/dev/null && break; sleep 0.5; done
trap 'rmdir "$SETUP_LOCK" 2>/dev/null || true' EXIT
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
