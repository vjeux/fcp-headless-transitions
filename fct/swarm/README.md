# fct swarm — self-refilling Claude Code agent pool

Runs N (default 8) Claude Code worker sub-agents in parallel, each on ONE task in its own
isolated git worktree, and keeps the pool FULL: whenever a slot frees, the pool launches
the next eligible task. A reflection agent every 30 min makes the workers faster.

## The operating model (updated 2026-07-16)
- **The main / orchestrator agent does NO engineering.** Its ONLY job is to keep the
  worker pool running at capacity (default 8). It schedules, launches, reaps wedged
  slots, and refills — it never renders, scores, minimizes, or edits engine code itself
  (that would fight the workers for RAM and the render locks).
- **Worker sub-agents do the actual work**, one task each, fully isolated, taking their
  task all the way to a pushed commit on origin/main via the self-merge contract
  (`agent_brief.md`).
- **Work comes from the appendable TODO queue** (`fct/swarm/todo/*.json`, one JSON file
  per task) — the single source of per-slug work (one claimable item per transition below
  the 17 dB "good" bar, each with its diagnosis + next step + DoD). The scheduler ALSO
  reads any legacy `ID  STATUS  TASK` fenced table in the ROADMAP for backward compat, but
  the ROADMAP no longer carries per-slug task rows: it holds the RULES, leverage ordering,
  methodology, done-map, and durable dead-ends (guardrails that must survive a slug's
  completion). See the ROADMAP's "Work items (detail) -> now the swarm TODO queue" pointer.
- **Workers FEED the queue.** When a worker discovers follow-up work it is not doing in
  its own task (a decode that opens a new fix, a subsystem too big for one task, a
  regressed-but-already-imperfect slug per ROADMAP Rule 11, a capability worth unit-
  testing), it APPENDS a new item via `python3 -m fct.swarm.todo add ...` and pushes it.
  Future agents pick it up. This is what lets the swarm run open-endedly without a human
  re-authoring the plan each time. One file per item = concurrent producers never
  merge-conflict. A worker that PROVES a fix net-negative also records the dead-end in the
  ROADMAP's "Durable findings & dead-ends" section so no future agent re-attempts it.

## The TODO queue
```bash
# a worker (or you) files follow-up work — writes fct/swarm/todo/<id>.json:
python3 -m fct.swarm.todo add --project fct --by <TASK_ID|human> \
  --title "short label" --slugs Category__Name \
  --goal "what to do + why; the next agent's brief (cite the decoded FCP fact)"

python3 -m fct.swarm.todo list                # queued items (reads origin/main)
python3 -m fct.swarm.todo done <id> [--status done|dropped|blocked]
```
The pool reads the queue from origin/main each cycle, so an item is eligible the moment
its file is pushed. Completion is still detected by the commit subject (`<id> DONE: …`),
exactly like ROADMAP tasks — the queue is just an appendable task SOURCE.

## Why the isolation
8 agents sharing one working tree / frames dir / render lock corrupt each other (two
builds' frames interleave under one baseline — observed). So each agent gets:
- its own git **worktree** (`~/fct-swarm/worktrees/<id>`, branch `swarm/<id>` off main)
- its own **frames dir** (`$FCT_FRAMES_DIR=~/fct-swarm/frames/<id>`)
- its own **render lock** (`$FCT_LOCK=~/fct-swarm/locks/<id>.lock`)
- its own **isolation id** for the pre-batch process kill-sweep — `$FCT_ISOLATION_ID`
  (defaults to a hash of the worktree REPO path if unset). `fct gen` kills leftover
  render workers / gen drivers from a *previous* batch before starting, but ONLY those
  in its OWN isolation scope: every render worker carries `--fct-iso <id>` in its argv,
  and a gen/min-gen driver is matched by its cwd == this worktree. So Agent A's sweep
  can NEVER reap Agent B's live workers/driver. (See fct/config.py ISOLATION_ID and
  fct/gen.py sweep_orphaned_renderers.)
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

## Operational limits (verified 2026-07-15)
- **RAM is the hard ceiling, NOT CPU.** Each agent runs `gen engine --all` (65 slugs) +
  `regress` at `FCT_JOBS=2`; ~2 agents doing `gen --all` simultaneously pins swap. Observed
  with only 3 live agents: swap 24.5/25.6 GB (95%), load 151, ~26 concurrent `_fct_render`
  workers, `gen --all` **OOM-killed twice**. The box (25 GB swap) realistically sustains
  ~2–3 concurrent `gen --all` agents, NOT 8. Above that, gate runs die and NOTHING can merge
  (wasted wall time). Stagger agents so their heavy `gen --all` phases don't all overlap, or
  cap concurrency. A change that fires on a provably-small slug subset can be verified on that
  subset instead of a full `gen --all` (M-LOWER did this soundly: its fix was provably
  Lower-only across all 65).
- **An agent reverting its own regressing fix LOOKS like an external "worktree reset."**
  Two agents reported their worktree `footage.ts`/`types.ts` "reset mid-session by something
  outside my edits." VERIFIED FALSE ALARM: each worktree's `engine/src/**` are REAL separate
  files (distinct mtimes per worktree); only `node_modules` is symlinked (read-only shared).
  The "reset" was the agent's own `git checkout`/revert restoring HEAD after its fix regressed
  the gate. Isolation is sound — do NOT chase a phantom contamination bug. If `git diff` looks
  stale for a few seconds it is the editor/fs cache, not another agent.
- **Agents may branch off an OLD base.** Long-lived worktrees (e.g. M-SMEAR/M-SQUARES) can sit
  several commits behind origin/main. That is fine for isolated work but they MUST
  `git fetch origin && git rebase origin/main` + re-gate before pushing (already in the
  contract via push-retry, but rebase early to avoid a stale-baseline gate).

## Operational gotchas (learned running the swarm 2026-07-15)

**RAM is the real ceiling, NOT CPU.** Each agent runs `gen engine --all` (65 slugs) +
`regress` with `FCT_JOBS=2`, so N agents = ~2N concurrent `tsx` render workers, each
~150–650 MB. On this box (25 GB swap) even 3 agents pin swap to ~98% (load 150+), and a
full `gen --all` gets **OOM-killed**. Symptoms: `gen --all` dies silently, agents fall
back to verifying only the provably-affected slug subset. Mitigations, in order:
  1. Cap concurrency to what RAM allows (≈3–4 heavy-gate agents here, not 8), OR
  2. give minimizer/`gen --all`-heavy tasks their own slot and run them **one at a time**
     (the ROADMAP's "run minimizers ONE AT A TIME" rule), OR
  3. lower `FCT_JOBS` per agent when many run at once.
The orchestrator must NOT add render load (its own `gen`/`minimize`) while agents hold the
locks — do read-only / doc / queue-staging work between merges.

**"Worktree reset mid-session" is almost always the agent's OWN revert, not
cross-contamination.** Isolation IS sound: each worktree has a REAL separate
`engine/src` checkout (verified — distinct mtimes, `git status` clean per worktree); only
`node_modules` is symlinked (read-only shared deps), and `tsx` runs from `src` (no shared
`dist` build artifact to race). When an agent abandons a regressing fix it runs
`git checkout -- .` / `reset --hard`, which restores files to HEAD and updates mtimes —
this looks like "something external reset my files" but is self-inflicted. Before blaming
isolation, check: does any OTHER worktree symlink into `engine/src`? (No.) Are the files
clean vs the worktree's own HEAD? (If yes → self-revert, not contamination.)

**Agents correctly push NOTHING when a fix regresses the ship gate.** Several deep bugs
(Slide_In 3-part subsystem, Lower visibility↔retime coupling, group-mask 3D-rotated
groups) are the "min-repro up / full-gate down" trap: the reduced repro improves but a
shared code path regresses shipped slugs. The agent reverting + reporting BLOCKED is the
CORRECT outcome — salvage its decode into ROADMAP/docs so the next attempt starts from the
root cause, don't re-dispatch the same one-shot.
