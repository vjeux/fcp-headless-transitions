#!/usr/bin/env bash
# Launch the full swarm: an 8-agent self-refilling pool + a 30-min reflection loop,
# each in its own tmux session. Idempotent-ish: kills prior swarm sessions first.
set -euo pipefail
SIZE="${1:-8}"
MAIN="$HOME/random/final-cut-pro-transitions"
cd "$MAIN"
mkdir -p "$HOME/fct-swarm/logs"

# Kill any prior swarm sessions (pool, reflect, and worker slots).
tmux ls 2>/dev/null | grep -oE '^fct-swarm[^:]*' | xargs -I{} tmux kill-session -t {} 2>/dev/null || true

VENV_PY="$(python3 -c 'import sys;print(sys.executable)')"

# Pool scheduler (loops, keeps SIZE agents alive).
tmux new-session -d -s fct-swarm-pool \
  "cd $MAIN && python3 -m fct.swarm.pool run --size $SIZE 2>&1 | tee -a $HOME/fct-swarm/logs/pool.log"

# Reflection loop (every 30 min).
tmux new-session -d -s fct-swarm-reflectloop \
  "cd $MAIN && python3 -m fct.swarm.reflect loop 2>&1 | tee -a $HOME/fct-swarm/logs/reflectloop.log"

echo "swarm launched: pool (size $SIZE) + reflection loop."
echo "  status:  python3 -m fct.swarm.pool status"
echo "  tmux ls: $(tmux ls 2>/dev/null | grep fct-swarm | wc -l | tr -d ' ') swarm sessions"
