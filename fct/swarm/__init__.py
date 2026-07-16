"""fct.swarm — navi sub-agent task pool for the FCP engine (see README.md).

Work items live in the appendable TODO queue (todo.py, todo/*.json). pool.py is the
read-only scheduling core (eligible/done). setup_worktree.sh isolates each sub-agent in
its own git worktree; push_helper.sh lands its work (rebase-retry + re-gate) on origin/main.
The orchestrator agent spawns navi sub-agents from the eligible queue — NO tmux, NO Claude
Code (that launcher was removed 2026-07-16)."""
