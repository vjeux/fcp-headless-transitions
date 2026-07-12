# fct swarm — self-refilling Claude Code agent pool

Runs N (default 8) Claude Code agents in parallel on the ROADMAP flat task list, keeps
the pool full (relaunches the next eligible task whenever a slot frees), and runs a
reflection agent every 30 min that makes the workers faster.

## Why the isolation
8 agents sharing one working tree / frames dir / render lock corrupt each other (two
builds' frames interleave under one baseline — observed). So each agent gets:
- its own git **worktree** (`~/fct-swarm/worktrees/<id>`, branch `swarm/<id>` off main)
- its own **frames dir** (`$FCT_FRAMES_DIR=~/fct-swarm/frames/<id>`)
- its own **render lock** (`$FCT_LOCK=~/fct-swarm/locks/<id>.lock`)
- `node_modules` **symlinked** from the main repo (no 8x install)
- **GUI GT** shared read-only
Worktrees live OUTSIDE `~/random` so Claude Code's internet-mode security prompt (which
blocks non-interactive runs in that tree) never fires.

## Run
```bash
# start the pool (8 agents) + reflection loop, all under tmux:
bash fct/swarm/run.sh 8

# check status
python3 -m fct.swarm.pool status
tmux ls | grep fct-swarm

# watch one agent
tmux attach -t fct-swarm-0        # ctrl-b d to detach

# stop everything
python3 -m fct.swarm.pool stop
tmux kill-session -t fct-swarm-pool
tmux kill-session -t fct-swarm-reflect
```

## Contract
Each agent follows `agent_brief.md`: decode-first (census), build, gate green (one truth
vs GUI GT), rebase onto main, re-freeze baseline, commit `swarm <id>: ...`, push (retry
on reject), print `SWARM_RESULT`. The pool detects completion by that commit subject.
