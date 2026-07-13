#!/usr/bin/env bash
# Launch the full swarm: an 8-agent self-refilling pool + a 30-min reflection loop,
# each in its own tmux session. Idempotent-ish: kills prior swarm sessions first.
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
TMUX="$(command -v tmux || echo /opt/homebrew/bin/tmux)"
SIZE="${1:-5}"   # 5, not 8: 8 concurrent Claude Code + node builds OOM'd this Mac (SIGKILL
                 # 137 killed ~27% of runs mid-work). 5 fits in RAM; see setup_worktree salvage-RESTORE.
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

# Reflection loop (every 30 min). SUPERVISED: the python `reflect loop` has a robust
# try/except so its LOOP never crashes — but the PROCESS gets OOM-killed (SIGKILL 137)
# under memory pressure, which ends the `python | tee` pipeline and kills the tmux
# session (observed: reflectloop DOWN for several ticks, needing manual restart each
# time). Wrap it in a bash restart-supervisor: if python dies for ANY reason, log it,
# sleep 60s (let memory recover), and relaunch. Now the session self-heals across OOM.
"$TMUX" new-session -d -s fct-swarm-reflectloop \
  "export PATH=/opt/homebrew/bin:/usr/local/bin:\$PATH; cd $MAIN; while true; do echo \"[supervisor] (re)starting reflect loop \$(date)\"; python3 -m fct.swarm.reflect loop; echo \"[supervisor] reflect loop exited rc=\$? — restart in 60s\"; sleep 60; done 2>&1 | tee -a $HOME/fct-swarm/logs/reflectloop.log"

echo "swarm launched: pool (size $SIZE) + reflection loop."
echo "  status:  python3 -m fct.swarm.pool status"
echo "  sessions: $("$TMUX" ls 2>/dev/null | grep -c fct-swarm) swarm tmux sessions"
