#!/usr/bin/env bash
# Create a fully-isolated git worktree for one swarm agent.
#
# Isolation is mandatory: 8 agents sharing one working tree / frames dir / render lock
# corrupt each other (two builds' frames interleave under one baseline — observed live).
# Each agent gets:
#   - own git worktree  (~/fct-swarm/worktrees/<id>) on branch swarm/<id> off main
#   - own frames dir      (~/fct-swarm/frames/<id>)      via $FCT_FRAMES_DIR
#   - own render lock      (~/fct-swarm/locks/<id>.lock)  via $FCT_LOCK
#   - node_modules symlinked from the main repo (61M; no 8x reinstall)
#   - GUI GT (~/fct-gui-gt) shared READ-ONLY
#
# Usage: setup_worktree.sh <agent-id>
# Prints the worktree path on stdout (last line).
set -euo pipefail
ID="${1:?usage: setup_worktree.sh <agent-id>}"
MAIN="$HOME/random/final-cut-pro-transitions"
ROOT="$HOME/fct-swarm"
WT="$ROOT/worktrees/$ID"
FRAMES="$ROOT/frames/$ID"

mkdir -p "$ROOT/worktrees" "$ROOT/frames" "$ROOT/locks" "$ROOT/logs"

cd "$MAIN"
git fetch origin --quiet

# Remove any stale worktree/branch for this id, then recreate fresh off origin/main.
# SAFETY: if the existing worktree has UNCOMMITTED work (an agent finished but its
# in-worktree git write was TCC/sandbox-blocked, so nothing was committed), do NOT
# silently destroy it — save a patch to ~/fct-swarm/salvage/ first so a relaunch can
# never lose gate-verified work. (This bug ate T-B1's emitter parser once.)
if [ -d "$WT" ]; then
  PENDING="$(git -C "$WT" status --porcelain 2>/dev/null)"
  if [ -n "$PENDING" ]; then
    mkdir -p "$ROOT/salvage"
    STAMP="$(date +%Y%m%d-%H%M%S)"
    ( cd "$WT" && git add -A >/dev/null 2>&1 && \
      git diff --cached origin/main > "$ROOT/salvage/$ID.$STAMP.patch" 2>/dev/null ) || true
    echo "setup_worktree: SALVAGED uncommitted $ID work -> $ROOT/salvage/$ID.$STAMP.patch" >&2
  fi
  git worktree remove --force "$WT" 2>/dev/null || rm -rf "$WT"
fi
git worktree prune
git branch -D "swarm/$ID" 2>/dev/null || true
git worktree add --quiet -b "swarm/$ID" "$WT" origin/main

# RESTORE the most recent salvage patch for this id so an OOM-killed (SIGKILL 137) or
# TCC-blocked agent RESUMES its work instead of redoing 90+ min from scratch. Without
# this, salvage only PRESERVES the patch on disk; the relaunched agent never sees it and
# re-does everything, and under memory pressure it gets re-killed before landing -> infinite
# churn. We apply against a FRESH origin/main worktree; if the work already landed (DONE
# tasks aren't relaunched) or the patch no longer applies cleanly, --3way fails and we skip
# (agent starts fresh, no harm). Only non-empty patches are considered.
LATEST_SALVAGE="$(ls -t "$ROOT/salvage/$ID."*.patch 2>/dev/null | head -1 || true)"
if [ -n "$LATEST_SALVAGE" ] && [ -s "$LATEST_SALVAGE" ]; then
  if ( cd "$WT" && git apply --3way --whitespace=nowarn "$LATEST_SALVAGE" >/dev/null 2>&1 ); then
    echo "setup_worktree: RESTORED salvaged $ID work <- $LATEST_SALVAGE" >&2
  else
    # Clean up any partial 3way merge markers so the agent gets a pristine tree.
    ( cd "$WT" && git checkout -- . >/dev/null 2>&1; git reset --hard origin/main >/dev/null 2>&1 ) || true
    echo "setup_worktree: salvage $ID did not apply (likely already landed or diverged) — fresh start" >&2
  fi
fi

# Share node_modules (gitignored, 61M) read-only via symlink so tsx runs immediately.
if [ ! -e "$WT/engine/node_modules" ]; then
  ln -s "$MAIN/engine/node_modules" "$WT/engine/node_modules"
fi
# NOTE: node_modules/venv symlinks + swarm scratch (.swarm_*, .frames/) are covered by
# the repo's TRACKED .gitignore (symlink-safe entries added there), which every worktree
# inherits — so no per-worktree exclude is needed. (Git worktrees SHARE the common
# .git/info/exclude, so appending here would bloat one shared file, not isolate anything.)

# Share the Python venv (gitignored, 207M; numpy/etc + the DYLD-wrapped python the
# toolkit re-execs under). fct.sh calls venv/bin/python3 by path, so a symlink suffices.
if [ ! -e "$WT/venv" ]; then
  ln -s "$MAIN/venv" "$WT/venv"
fi

# Seed the private frames dir so the gate (which reads ALL 65 slugs off disk) is
# complete. A deep copy of the 481M store per agent is far too slow (>30s each), so we
# seed with PER-SLUG SYMLINKS into the shared baseline store. The agent re-renders only
# the slugs it changes; gen_engine() detects a symlinked slug dir and replaces it with a
# real dir before writing, so re-renders NEVER write back through the symlink. Unchanged
# slugs stay as symlinks (read-only reads by the gate are safe on the shared store).
mkdir -p "$FRAMES/engine"
if [ -d "$HOME/fct-frames/engine" ]; then
  for slugdir in "$HOME/fct-frames/engine"/*/; do
    name="$(basename "$slugdir")"
    [ -e "$FRAMES/engine/$name" ] || ln -s "$slugdir" "$FRAMES/engine/$name"
  done
fi

echo "$WT"
