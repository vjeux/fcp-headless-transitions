#!/usr/bin/env bash
# Create a fully-isolated git worktree for one swarm agent.
#
# Isolation is mandatory: multiple agents sharing one working tree / frames dir / render
# lock corrupt each other (two builds' frames interleave under one baseline — observed live).
# Each navi sub-agent gets:
#   - own git worktree  (~/fct-swarm/worktrees/<id>) on branch swarm/<id> off main
#   - own frames dir      (~/fct-swarm/frames/<id>)      via $FCT_FRAMES_DIR
#   - own render lock      (~/fct-swarm/locks/<id>.lock)  via $FCT_LOCK
#   - node_modules symlinked from the main repo (61M; no 8x reinstall)
#   - GUI GT (~/fct-gui-gt) shared READ-ONLY
#
# Usage:
#   setup_worktree.sh [setup] <agent-id>   create the isolated worktree (prints path)
#   setup_worktree.sh cleanup  <agent-id>   tear it down (worktree + branch + frames +
#                                           locks) — a sub-agent MUST call this after its
#                                           work has LANDED on origin/main (push_helper
#                                           exit 0), so the swarm cleans up after itself
#                                           and worktrees never accumulate. SAFETY: cleanup
#                                           refuses if the worktree has uncommitted, not-yet-
#                                           landed engine/doc changes (salvages them first).
set -euo pipefail

# Subcommand dispatch. Back-compat: a bare id (no subcommand) means "setup".
MODE="setup"
case "${1:-}" in
  setup|cleanup) MODE="$1"; shift ;;
esac
ID="${1:?usage: setup_worktree.sh [setup|cleanup] <agent-id>}"
MAIN="$HOME/random/final-cut-pro-transitions"
ROOT="$HOME/fct-swarm"
WT="$ROOT/worktrees/$ID"
FRAMES="$ROOT/frames/$ID"

if [ "$MODE" = "cleanup" ]; then
  # Tear down this agent's worktree once its work is on origin/main. Do NOT destroy
  # unlanded work: if the worktree still has non-harness changes vs origin/main, salvage
  # a patch first (same exclude rules as setup) and refuse to delete silently.
  cd "$MAIN"
  if [ -d "$WT" ]; then
    git -C "$WT" fetch origin --quiet 2>/dev/null || true
    PENDING="$(cd "$WT" && git add -A -- . ':(exclude)fct/swarm/*' >/dev/null 2>&1; \
               git -C "$WT" diff --cached origin/main -- . ':(exclude)fct/swarm/*' 2>/dev/null; \
               git -C "$WT" reset -q >/dev/null 2>&1 || true)"
    if [ -n "$PENDING" ]; then
      mkdir -p "$ROOT/salvage"
      STAMP="$(date +%Y%m%d-%H%M%S)"
      PATCHF="$ROOT/salvage/CLEANUP-UNLANDED-$ID.$STAMP.patch"
      ( cd "$WT" && git add -A -- . ':(exclude)fct/swarm/*' >/dev/null 2>&1 && \
        git diff --cached origin/main -- . ':(exclude)fct/swarm/*' > "$PATCHF" 2>/dev/null; \
        git reset -q >/dev/null 2>&1 || true ) || true
      echo "cleanup: $ID has UNLANDED changes vs origin/main — SALVAGED to $PATCHF, NOT deleting." >&2
      echo "cleanup: push your work (bash fct/swarm/push_helper.sh $ID <msg>) before cleanup." >&2
      exit 3
    fi
    git worktree remove --force "$WT" 2>/dev/null || rm -rf "$WT"
  fi
  git worktree prune 2>/dev/null || true
  git branch -D "swarm/$ID" 2>/dev/null || true
  rm -rf "$FRAMES" "$ROOT/locks/$ID.lock" 2>/dev/null || true
  echo "cleanup: removed worktree + branch + frames + lock for $ID"
  exit 0
fi

mkdir -p "$ROOT/worktrees" "$ROOT/frames" "$ROOT/locks" "$ROOT/logs"

cd "$MAIN"
git fetch origin --quiet

# Remove any stale worktree/branch for this id, then recreate fresh off origin/main.
# SAFETY: if the existing worktree has UNCOMMITTED work (an agent finished but its
# in-worktree git write was blocked — e.g. a sandboxed env denying .git/worktrees writes —
# so nothing was committed), do NOT
# silently destroy it — save a patch to ~/fct-swarm/salvage/ first so a relaunch can
# never lose gate-verified work. (This bug ate T-B1's emitter parser once.)
if [ -d "$WT" ]; then
  PENDING="$(git -C "$WT" status --porcelain 2>/dev/null)"
  if [ -n "$PENDING" ]; then
    mkdir -p "$ROOT/salvage"
    STAMP="$(date +%Y%m%d-%H%M%S)"
    # EXCLUDE the swarm harness itself (fct/swarm/**) from salvage. Agents work on the
    # ENGINE (engine/, parser, compositor), docs, and ROADMAP — never the harness. If a
    # stale salvage patch ever reverts a harness file, salvaging that revert and restoring
    # it into the next worktree creates a FEEDBACK LOOP that silently re-reverts harness
    # fixes (observed: T-E2's worktree carried a diff DELETING the salvage-RESTORE block,
    # which would have re-landed the reflect-agent regression). Scoping salvage to non-
    # harness paths breaks the loop — harness state lives only on origin/main.
    ( cd "$WT" && git add -A -- . ':(exclude)fct/swarm/*' >/dev/null 2>&1 && \
      git diff --cached origin/main -- . ':(exclude)fct/swarm/*' > "$ROOT/salvage/$ID.$STAMP.patch" 2>/dev/null ) || true
    echo "setup_worktree: SALVAGED uncommitted $ID work (excl. fct/swarm) -> $ROOT/salvage/$ID.$STAMP.patch" >&2
  fi
  git worktree remove --force "$WT" 2>/dev/null || rm -rf "$WT"
fi
git worktree prune
git branch -D "swarm/$ID" 2>/dev/null || true
git worktree add --quiet -b "swarm/$ID" "$WT" origin/main

# RESTORE the most recent salvage patch for this id so an OOM-killed / wedge-reaped /
# pool-restarted agent RESUMES its work instead of redoing 60+ min from scratch. Without
# this, salvage only PRESERVES the patch on disk; the relaunched agent never sees it and
# re-does everything (observed: a pool restart relaunched T-F1 after 60m/14 files and its
# work was NOT restored). Apply against a FRESH origin/main worktree; if the work already
# landed (DONE tasks aren't relaunched) or the patch no longer applies, --3way fails and we
# hard-reset to a pristine tree (fresh start, no harm). Only non-empty patches considered.
# NOTE: this block was reverted once by a stale-base swarm-reflect commit (1d7af7e) — keep it.
LATEST_SALVAGE="$(ls -t "$ROOT/salvage/$ID."*.patch 2>/dev/null | head -1 || true)"
if [ -n "$LATEST_SALVAGE" ] && [ -s "$LATEST_SALVAGE" ]; then
  if ( cd "$WT" && git apply --3way --whitespace=nowarn "$LATEST_SALVAGE" >/dev/null 2>&1 ); then
    echo "setup_worktree: RESTORED salvaged $ID work <- $LATEST_SALVAGE" >&2
  else
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

# Share the headless-FCP shim dylib (gitignored build artifact, oz_render.dylib). Without
# it ozengine.init_engine() dlopen()s a missing path and EVERY headless render fails, so a
# worktree could not run `fct subswarm`/`caps`/`min-score` (the per-node FCP oracle). Symlink.
if [ ! -e "$WT/oz_render.dylib" ] && [ -e "$MAIN/oz_render.dylib" ]; then
  ln -s "$MAIN/oz_render.dylib" "$WT/oz_render.dylib"
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
