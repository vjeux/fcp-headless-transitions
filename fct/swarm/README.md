# fct swarm — navi sub-agent task pool

The FCP-engine work is done by **navi sub-agents spawned manually by the orchestrator
agent** (the main navi session), each taking ONE task in its own isolated git worktree and
landing it as a pushed commit on origin/main. There is **no tmux and no Claude Code** — the
orchestrator uses `spawn_agent` to launch navi sub-agents from the eligible TODO queue and
keeps the pool full by spawning replacements as tasks complete.

> **History (2026-07-16):** this used to be a self-refilling pool of Claude Code workers
> launched under tmux by `run.sh`, with a `reflect.py` meta-agent every 30 min. Both were
> REMOVED. The worktree isolation (`setup_worktree.sh`) and the commit+push helper
> (`push_helper.sh`) are UNCHANGED — only the launcher changed from tmux+Claude to
> navi sub-agents driven by the orchestrator.

## The operating model
- **The orchestrator agent keeps the pool full.** Its job is to read the eligible queue
  (`python3 -m fct.swarm.pool status`), `spawn_agent` a navi sub-agent per open task (up to
  the RAM-safe concurrency below), and spawn a replacement when one finishes. It does NO
  engineering itself (no rendering/scoring/minimizing/engine edits — that fights the
  sub-agents for RAM and the render locks).
- **navi sub-agents do the actual work**, one task each, fully isolated in a worktree,
  taking the task all the way to a pushed commit via the self-merge contract
  (`agent_brief.md`), then printing `SWARM_RESULT`.
- **Work comes from the appendable TODO queue** (`fct/swarm/todo/*.json`, one JSON file
  per task) — the single source of per-slug work (one claimable item per transition below
  the 17 dB "good" bar, each with its diagnosis + next step + DoD). `parse_tasks()` also
  reads any legacy `ID  STATUS  TASK` fenced table in the ROADMAP for back-compat, but the
  ROADMAP no longer carries per-slug task rows: it holds the RULES, leverage ordering,
  methodology, done-map, and durable dead-ends (guardrails that survive a slug's
  completion). See the ROADMAP's "Work items (detail) -> now the swarm TODO queue" pointer.
- **Sub-agents FEED the queue.** When a sub-agent discovers follow-up work it is not doing
  in its own task (a decode that opens a new fix, a subsystem too big for one task, a
  regressed-but-already-imperfect slug per ROADMAP Rule 11, a capability worth unit-
  testing), it APPENDS a new item via `python3 -m fct.swarm.todo add ...` and pushes it.
  Future agents pick it up — the swarm runs open-endedly without a human re-authoring the
  plan. One file per item = concurrent producers never merge-conflict. A sub-agent that
  PROVES a fix net-negative records the dead-end in the ROADMAP's "Durable findings &
  dead-ends" section so no future agent re-attempts it.

## The scheduling core (`pool.py`)
`pool.py` is now READ-ONLY scheduling logic — no launcher. The orchestrator calls it to
decide what to spawn:
```bash
python3 -m fct.swarm.pool status     # eligible + done tasks (what to spawn next)
```
Key functions the orchestrator (and `roadmap_sync`) use: `eligible_tasks()` (TODO/DOING
tasks whose `after:` dep is DONE), `done_task_ids()` (commit-subject scan on origin/main +
terminal rows), `all_tasks()`/`_queue_tasks()` (the merged queue), `slugs_for()`.

## The TODO queue
```bash
# a sub-agent (or you) files follow-up work — writes fct/swarm/todo/<id>.json:
python3 -m fct.swarm.todo add --project fct --by <TASK_ID|human> \
  --title "short label" --slugs Category__Name \
  --goal "what to do + why; the next agent's brief (cite the decoded FCP fact)"

python3 -m fct.swarm.todo list                # queued items (reads origin/main)
python3 -m fct.swarm.todo done <id> [--status done|dropped|blocked]
```
The scheduler reads the queue from origin/main, so an item is eligible the moment its file
is pushed. Completion is detected by the commit subject (`<id> DONE: …`) — the queue is
just an appendable task SOURCE.

## Spawning a sub-agent (orchestrator)
For each eligible task the orchestrator spawns a navi sub-agent whose task brief tells it
to: (1) set up its worktree via `bash fct/swarm/setup_worktree.sh <id>`, (2) follow
`agent_brief.md` (decode-first census → build → gate green vs GUI GT → rebase → re-freeze
baseline), (3) land its work via `bash fct/swarm/push_helper.sh <id> <msgfile>` with a
commit subject `<id> DONE: …`, (4) CLEAN UP after itself once the work has landed via
`bash fct/swarm/setup_worktree.sh cleanup <id>` (removes worktree + branch + frames + lock;
refuses + salvages if unlanded work remains), and (5) print `SWARM_RESULT`. The orchestrator locks the
sub-agent to `cli:vjeux-mac` and passes `FCT_ISOLATION_ID=swarm-<id>`.

## Why the isolation
Multiple agents sharing one working tree / frames dir / render lock corrupt each other (two
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
- `node_modules` **symlinked** from the main repo (no N× install)
- **GUI GT** shared read-only
Worktrees live OUTSIDE `~/random` so a sub-agent's fs-security prompt (which blocks
non-interactive runs in that tree) never fires.

## Contract
Each agent follows `agent_brief.md`: decode-first (census), build, gate green (one truth
vs GUI GT), rebase onto main, re-freeze baseline, commit `<id> DONE: ...`, push via
`push_helper.sh` (retry on reject), CLEAN UP its worktree via `setup_worktree.sh cleanup
<id>` (only after the work has landed), and print `SWARM_RESULT`. Completion is detected by
that commit subject.

## Operational limits (verified 2026-07-15)
- **RAM is the hard ceiling, NOT CPU.** Each agent runs `gen engine --all` (65 slugs) +
  `regress` at `FCT_JOBS=2`; ~2 agents doing `gen --all` simultaneously pins swap. Observed
  with only 3 live agents: swap 24.5/25.6 GB (95%), load 151, ~26 concurrent `_fct_render`
  workers, `gen --all` **OOM-killed twice**. The box (25 GB swap) realistically sustains
  ~2–3 concurrent `gen --all` sub-agents, NOT 8. Above that, gate runs die and NOTHING can merge
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
  1. Cap concurrency to what RAM allows (≈3–4 heavy-gate sub-agents here, not 8), OR
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
