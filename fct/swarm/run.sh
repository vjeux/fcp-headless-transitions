#!/usr/bin/env bash
# Launch the full swarm: an 8-agent self-refilling pool + a 30-min reflection loop,
# each in its own tmux session. Idempotent-ish: kills prior swarm sessions first.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
TMUX="$(command -v tmux || echo /opt/homebrew/bin/tmux)"
# Default pool size 5, not 8: on this Mac, 8 concurrent Claude Code + node builds drove
# heavy memory pressure (13G compressor, <2.5G free) and OOM SIGKILL(137) killed ~27% of
# agent runs mid-work — infinite churn. 5 fits in RAM, kills stop, and each agent has room
# to finish. Combined with salvage-RESTORE in setup_worktree.sh, killed agents now resume.
SIZE="${1:-5}"
MAIN="$HOME/random/final-cut-pro-transitions"
cd "$MAIN"
mkdir -p "$HOME/fct-swarm/logs"

# Kill any prior swarm sessions (pool, reflect, and worker slots).
"$TMUX" ls 2>/dev/null | grep -oE '^fct-swarm[^:]*' | xargs -I{} "$TMUX" kill-session -t {} 2>/dev/null || true

VENV_PY="$(python3 -c 'import sys;print(sys.executable)')"

# Pool scheduler (loops, keeps SIZE agents alive).
# Pool scheduler (loops, keeps SIZE agents alive).
"$TMUX" new-session -d -s fct-swarm-pool \
  "export PATH=/opt/homebrew/bin:/usr/local/bin:\$PATH; cd $MAIN && python3 -m fct.swarm.pool run --size $SIZE 2>&1 | tee -a $HOME/fct-swarm/logs/pool.log"

# Reflection loop (every 30 min).
"$TMUX" new-session -d -s fct-swarm-reflectloop \
  "export PATH=/opt/homebrew/bin:/usr/local/bin:\$PATH; cd $MAIN && python3 -m fct.swarm.reflect loop 2>&1 | tee -a $HOME/fct-swarm/logs/reflectloop.log"

echo "swarm launched: pool (size $SIZE) + reflection loop."
echo "  status:  python3 -m fct.swarm.pool status"
echo "  sessions: $("$TMUX" ls 2>/dev/null | grep -c fct-swarm) swarm tmux sessions"
