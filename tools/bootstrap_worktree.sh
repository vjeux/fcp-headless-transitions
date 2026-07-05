#!/bin/bash
# Prepare a git worktree so it can build+test the engine and render ground truth,
# WITHOUT duplicating the heavy shared artifacts. Run from the worktree dir.
#   usage: bash /path/to/main/tools/bootstrap_worktree.sh
set -e
MAIN="$HOME/random/final-cut-pro-transitions"
WT="$(pwd)"
[ "$WT" = "$MAIN" ] && { echo "refusing to bootstrap the main checkout"; exit 1; }
# Share read-only build artifacts (never rebuilt by feature agents):
ln -sfn "$MAIN/venv"              "$WT/venv"
ln -sfn "$MAIN/oz_render.dylib"   "$WT/oz_render.dylib"
ln -sfn "$MAIN/engine/node_modules" "$WT/engine/node_modules"
echo "bootstrapped $WT (venv, dylib, node_modules symlinked from main)"
