#!/usr/bin/env python3
"""
fct.swarm.pool — a self-refilling pool of Claude Code worker agents.

Keeps N agents busy on the ROADMAP flat task list. Each agent runs in its OWN git
worktree + frames dir + render lock (full isolation; see setup_worktree.sh) and takes
one task to a pushed commit via the self-merge contract (agent_brief.md). When an agent
exits, the pool immediately launches the next eligible task, so the pool stays full.

Design decisions (from measured constraints on this 10-core / 32GB box):
  - Agents run under tmux (NOT nohup/background — those SIGKILL CC's process group;
    per the cc skill). One tmux session per agent slot: fct-swarm-<slot>.
  - Each agent renders ONLY its changed slugs (not --all) and is pinned to FCT_JOBS=2
    so 8 agents don't oversubscribe the render threadpool.
  - Tasks come from ROADMAP.md's flat task list (parsed live). `after:` deps gate a
    task until its parent is DONE (a pushed commit whose subject starts "swarm <id>:").
  - The pool never scores anything itself — the ONE TRUTH gate lives inside each agent.
    The pool only schedules, launches, and reaps.

Usage:
    python3 -m fct.swarm.pool run   [--size 8] [--once]
    python3 -m fct.swarm.pool status
    python3 -m fct.swarm.pool stop
"""
import os, re, sys, json, time, subprocess, argparse, datetime

HOME = os.path.expanduser("~")
MAIN = os.path.join(HOME, "random", "final-cut-pro-transitions")
ROOT = os.path.join(HOME, "fct-swarm")
LOGS = os.path.join(ROOT, "logs")
STATE = os.path.join(ROOT, "state.json")
ROADMAP = os.path.join(MAIN, "ROADMAP.md")
BRIEF = os.path.join(MAIN, "fct", "swarm", "agent_brief.md")
SETUP = os.path.join(MAIN, "fct", "swarm", "setup_worktree.sh")
PUSH_HELPER = os.path.join(MAIN, "fct", "swarm", "push_helper.sh")
SESSION_PREFIX = "fct-swarm-"

# Resolve tmux robustly: brew installs to /opt/homebrew/bin which is NOT on the
# non-interactive PATH. Prefer an absolute path; fall back to bare "tmux".
import shutil as _shutil
TMUX = (_shutil.which("tmux") or
        next((c for c in ("/opt/homebrew/bin/tmux", "/usr/local/bin/tmux",
                          "/usr/bin/tmux") if os.path.exists(c)), "tmux"))
# Ensure spawned login shells can see brew binaries (tmux, node, etc).
BREW_PATH_EXPORT = 'export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"; '


# ---------------------------------------------------------------------------
# Task list parsing (ROADMAP flat table is the single source of truth)
# ---------------------------------------------------------------------------
def parse_tasks():
    """Parse the ROADMAP flat task list into [{id, status, goal, slugs, after}].

    We read from `origin/main:ROADMAP.md` (not the local working tree) so a task
    marked DONE by an agent's push is visible to the scheduler on the very next
    cycle — even if nothing has pulled MAIN. Bug seen 2026-07-13: T-G1 landed and
    updated ROADMAP row to DONE, but the local MAIN's working tree hadn't been
    pulled, so parse_tasks still saw TODO and the pool re-launched T-G1 (013622
    NOCHANGE). Fetching + `git show origin/main:` closes that window.
    """
    try:
        subprocess.run(["git", "-C", MAIN, "fetch", "origin", "--quiet"], timeout=60)
        txt = subprocess.check_output(
            ["git", "-C", MAIN, "show", "origin/main:ROADMAP.md"],
            text=True, timeout=30)
    except Exception:
        txt = open(ROADMAP).read()  # fall back to local working tree
    # The block between the "ID    STATUS  TASK" header and the closing ``` fence.
    m = re.search(r"ID\s+STATUS\s+TASK.*?\n(.*?)\n```", txt, re.S)
    if not m:
        return []
    body = m.group(1)
    tasks, cur = [], None
    for line in body.splitlines():
        row = re.match(r"^(T-[A-Za-z0-9]+)\s+(\S+)\s+(.*)$", line)
        if row:
            if cur:
                tasks.append(cur)
            tid, status, rest = row.group(1), row.group(2), row.group(3)
            after = None
            am = re.search(r"after:\s*(T-[A-Za-z0-9]+)", rest)
            if am:
                after = am.group(1)
            # target slugs live in the right column / continuation lines; collect names
            cur = {"id": tid, "status": status.upper(), "desc": rest.strip(),
                   "after": after, "extra": ""}
        elif cur and line.strip() and not line.startswith("ID "):
            cur["extra"] += " " + line.strip()
            am = re.search(r"after:\s*(T-[A-Za-z0-9]+)", line)
            if am and not cur["after"]:
                cur["after"] = am.group(1)
    if cur:
        tasks.append(cur)
    return tasks

def _queue_tasks():
    """Tasks from the APPENDABLE swarm TODO queue (fct/swarm/todo/*.json), read from
    origin/main so an item pushed by any worker is visible on the next pool cycle.
    Worker sub-agents append to this queue as they discover follow-up work, so the
    swarm keeps finding things to do without a human re-authoring the ROADMAP table.
    Returned in the same shape as parse_tasks() rows so the scheduler treats queue
    items and ROADMAP rows uniformly."""
    try:
        from fct.swarm import todo as _todo
    except Exception:
        import importlib.util as _ilu
        spec = _ilu.spec_from_file_location("_swarm_todo",
                                            os.path.join(MAIN, "fct", "swarm", "todo.py"))
        _todo = _ilu.module_from_spec(spec); spec.loader.exec_module(_todo)
    out = []
    for it in _todo.all_items(from_origin=True):
        status = (it.get("status") or "open").upper()
        # map queue status -> scheduler status vocabulary
        sched = {"OPEN": "TODO", "DOING": "DOING", "DONE": "DONE",
                 "DROPPED": "DROPPED", "BLOCKED": "TODO"}.get(status, "TODO")
        goal = it.get("goal", "") or it.get("title", "")
        out.append({
            "id": it["id"],
            "status": sched,
            "desc": (it.get("title", "") + ": " + goal).strip(": "),
            "after": it.get("after"),
            "extra": " " + " ".join(it.get("slugs", []) or []),
        })
    return out


def all_tasks():
    """ROADMAP flat-table tasks PLUS appendable TODO-queue items (queue items win on id
    collision). This is the single scheduling source the pool draws from."""
    by_id = {}
    for t in parse_tasks():
        by_id[t["id"]] = t
    for t in _queue_tasks():
        by_id[t["id"]] = t
    return list(by_id.values())


def slugs_for(task):
    """Best-effort extract target slug tokens (Category__Name) from a task's text."""
    blob = task["desc"] + " " + task["extra"]
    found = re.findall(r"[A-Z][A-Za-z0-9°]+__[A-Za-z0-9_]+", blob)
    if found:
        return list(dict.fromkeys(found))
    # Fall back to bare CamelCase names the ROADMAP uses (Panels_Across, Slide_In...).
    names = re.findall(r"\b([A-Z][A-Za-z0-9]+(?:_[A-Za-z0-9]+)+)\b", blob)
    return list(dict.fromkeys(names))

# ---------------------------------------------------------------------------
# Completion detection: a task is DONE when a pushed commit on origin/main has a
# subject starting "swarm <id>:" (the agent contract guarantees this), OR the
# ROADMAP row is already marked DONE.
# ---------------------------------------------------------------------------
def done_task_ids():
    done = set()
    for t in all_tasks():
        if t["status"] in ("DONE", "DROPPED"):
            done.add(t["id"])
    try:
        # parse_tasks already fetched, but keep a fetch here for safety when this
        # function is called without a preceding parse_tasks pass.
        subprocess.run(["git", "-C", MAIN, "fetch", "origin", "--quiet"], timeout=60)
        log = subprocess.check_output(
            ["git", "-C", MAIN, "log", "origin/main", "--pretty=%s", "-n", "400"],
            text=True, timeout=30)
        for line in log.splitlines():
            # An agent's completion commit. The brief asks for "<id> DONE: ..." but
            # agents in practice also write "<id> DROPPED: ...", "<id> BLOCKED: ...",
            # bare "<id>: <changed>" (T-G1 did this — commit 4e3c17a — and the pool
            # relaunched it because the old keyword-required regex missed it), or
            # "swarm <id>: ...". Accept any of these forms: a task id at subject start
            # followed by either a colon OR a DONE/DROPPED/BLOCKED/NOOP keyword.
            m = re.match(
                r"^(?:swarm\s+)?(T-[A-Za-z0-9]+)(?::|\s+(?:DONE|DROPPED|BLOCKED|NOOP)\b)",
                line, re.I)
            if m:
                done.add(m.group(1))

    except Exception as e:
        print(f"[pool] warn: completion scan failed: {e}", flush=True)
    return done

def eligible_tasks():
    """TODO tasks whose `after:` dep (if any) is DONE. Draws from BOTH the ROADMAP flat
    table AND the appendable swarm TODO queue (all_tasks)."""
    tasks = all_tasks()
    done = done_task_ids()
    out = []
    for t in tasks:
        if t["status"] not in ("TODO", "DOING"):
            continue
        if t["id"] in done:
            continue
        if t["after"] and t["after"] not in done:
            continue
        out.append(t)
    return out, done

# ---------------------------------------------------------------------------
# tmux helpers
# ---------------------------------------------------------------------------
def tmux(*args, check=False, capture=False):
    cmd = [TMUX, *args]
    if capture:
        return subprocess.run(cmd, text=True, capture_output=True).stdout
    return subprocess.run(cmd, check=check).returncode

def session_name(slot):
    return f"{SESSION_PREFIX}{slot}"

def slot_running(slot):
    rc = subprocess.run([TMUX, "has-session", "-t", session_name(slot)],
                        capture_output=True).returncode
    return rc == 0

def running_slots():
    out = tmux("list-sessions", "-F", "#{session_name}", capture=True) or ""
    return [s for s in out.splitlines() if s.startswith(SESSION_PREFIX)]

# ---------------------------------------------------------------------------
# Launch one agent in a slot for a task
# ---------------------------------------------------------------------------
def launch(slot, task):
    agent_id = task["id"]
    ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    log = os.path.join(LOGS, f"{agent_id}.{ts}.log")
    slugs = " ".join(slugs_for(task))
    goal = (task["desc"] + " " + task["extra"]).strip()[:600]

    # 1. Build the isolated worktree.
    wt = subprocess.check_output(["bash", SETUP, agent_id], text=True).strip().splitlines()[-1]

    # 2. Materialize the brief with this task's values.
    brief = open(BRIEF).read()
    brief = (brief.replace("{{TASK_ID}}", agent_id)
                  .replace("{{TASK_GOAL}}", goal)
                  .replace("{{TASK_SLUGS}}", slugs or "(see ROADMAP row)"))
    brief_path = os.path.join(ROOT, "worktrees", agent_id, ".swarm_brief.md")
    open(brief_path, "w").write(brief)

    frames = os.path.join(ROOT, "frames", agent_id)
    lock = os.path.join(ROOT, "locks", f"{agent_id}.lock")

    # 3. Write a standalone runner SCRIPT (no nested shell quoting — passing the 3KB
    #    brief through tmux `bash -lc "...$(cat)..."` broke on the brief's own
    #    backticks/$/quotes and the agent died at startup). tmux runs this file
    #    directly. The brief is read from its file inside the script's own clean shell.
    runner = os.path.join(ROOT, "worktrees", agent_id, ".swarm_run.sh")
    with open(runner, "w") as f:
        f.write(
            "#!/usr/bin/env bash\n"
            'export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"\n'
            f"cd {wt}\n"
            f"export FCT_FRAMES_DIR={frames} FCT_LOCK={lock} FCT_JOBS=2\n"
            # Explicit per-agent isolation id so `fct gen`'s pre-batch kill-sweep only
            # reaps THIS agent's leftover render workers/driver, never a sibling's, even
            # if two agents ever share a worktree. (Each agent already has its own
            # worktree, so the default REPO-hash id would isolate too — this is belt +
            # suspenders and makes the scope legible in `ps`.)
            f"export FCT_ISOLATION_ID=swarm-{agent_id}\n"
            f"export _FCT_REEXEC=1\n"  # avoid the DYLD re-exec dance for non-headless
            "env -u META_AGENT_ROLE -u AGENT_ROLE -u CLAUDECODE \\\n"
            "  claude -p --model 'claude-opus-4-7' --dangerously-skip-permissions \\\n"
            f'  "$(cat {brief_path})" < /dev/null 2>&1 | tee {log}\n'
            f"echo SWARM_SLOT_EXIT ${{PIPESTATUS[0]}} >> {log}\n"
        )
    os.chmod(runner, 0o755)

    # Kill any stale session in this slot, then start fresh running the script file.
    subprocess.run([TMUX, "kill-session", "-t", session_name(slot)],
                   capture_output=True)
    subprocess.run([TMUX, "new-session", "-d", "-s", session_name(slot),
                    "bash", runner], check=True)
    save_slot(slot, agent_id, log, wt)
    print(f"[pool] slot {slot} -> {agent_id}  (log: {log})", flush=True)

# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------
def load_state():
    if os.path.exists(STATE):
        return json.load(open(STATE))
    return {"slots": {}}

def save_slot(slot, agent_id, log, wt):
    st = load_state()
    st["slots"][str(slot)] = {"task": agent_id, "log": log, "wt": wt,
                              "started": time.time()}
    json.dump(st, open(STATE, "w"), indent=2)

def clear_slot(slot):
    st = load_state()
    st["slots"].pop(str(slot), None)
    json.dump(st, open(STATE, "w"), indent=2)

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
def _log_has_result(log_path, task_id):
    """True if this log already contains a terminal SWARM_RESULT for the task."""
    try:
        txt = subprocess.check_output(["tail", "-n", "60", log_path], text=True)
    except Exception:
        return False
    return re.search(r"SWARM_RESULT\s+" + re.escape(task_id) + r"\b", txt) is not None


# --- Stuck-slot detection ------------------------------------------------------
# Symptom (observed live 2026-07-13 04:07 — 3 of 3 pool slots simultaneously wedged):
#   T-B3 slot 0 (30m), T-F1 slot 1 (60m), T-E2 slot 2 (22m) all had 3-line logs
#   ("Claude Code at Meta / Using AI Gateway / Warning: agent-market plugins ..."),
#   no SWARM_RESULT, no SWARM_SLOT_EXIT. `ps -o pgid` showed the `bash + tee` runner
#   still alive with ~30 MCP fast_mux orphans holding the pipe FDs open — the `claude`
#   process either wedged in plugin bringup or exited without closing the pipe (macOS
#   claude_code + parallel MCP servers). Result: slot burnt forever; pool capacity
#   silently shrinks tick after tick.
#
# Rule: if a slot has been running for STALL_MIN minutes AND its log has not grown
# for STALL_QUIET_MIN minutes AND no SWARM_RESULT was ever emitted, treat it as
# wedged. Kill the tmux session AND every process in its process group (to reap MCP
# orphans that would otherwise hold the pipe/FDs open across the tmux kill).
STALL_MIN = 20        # min age before we consider a slot "old enough to be suspect"
STALL_QUIET_MIN = 15  # min since last LOG growth AND worktree write to call it wedged

def _worktree_quiet_min(task_id):
    """Minutes since the agent's worktree SOURCE tree was last written, or None if it
    can't be determined. This is a buffering-immune progress signal: an agent that is
    editing engine/src, engine/test, or docs is working even when its stdout log is
    frozen by Claude Code's -p buffering. We scan only source-ish dirs (NOT node_modules/
    venv symlinks — those never change and would always look 'fresh' or 'stale' wrong).
    Returns the SMALLEST age (most-recent write) across the tree."""
    wt = os.path.join(ROOT, "worktrees", task_id)
    if not os.path.isdir(wt):
        return None
    newest = 0.0
    scanned = False
    for sub in ("engine/src", "engine/test", "docs"):
        d = os.path.join(wt, sub)
        if not os.path.isdir(d):
            continue
        for root, dirs, files in os.walk(d):
            # prune heavy/symlinked dirs defensively
            dirs[:] = [x for x in dirs if x not in ("node_modules", "venv", ".git")]
            for f in files:
                try:
                    m = os.stat(os.path.join(root, f)).st_mtime
                    scanned = True
                    if m > newest:
                        newest = m
                except Exception:
                    pass
    if not scanned:
        return None
    return (time.time() - newest) / 60.0


def _slot_stalled(slot_info, task_id, slot=None):
    """Return (stalled, reason) for a live slot that hasn't printed a SWARM_RESULT yet."""
    started = slot_info.get("started", time.time())
    age_min = (time.time() - started) / 60.0
    if age_min < STALL_MIN:
        return False, ""
    log = slot_info.get("log", "")
    if not log or not os.path.exists(log):
        return False, ""
    try:
        stat = os.stat(log)
    except Exception:
        return False, ""
    quiet_min = (time.time() - stat.st_mtime) / 60.0
    if quiet_min < STALL_QUIET_MIN:
        return False, ""
    # Never treat a session as stalled if it already reported a terminal result —
    # that's the reap-DONE path's job, not ours.
    if _log_has_result(log, task_id):
        return False, ""
    # LIVENESS GATE (fixes a FALSE-POSITIVE that was churning T-F1/T-E2 at 20m): Claude
    # Code's `-p` mode BUFFERS stdout heavily, so a hard-working agent's LOG can sit at
    # the 203-byte startup banner for many minutes while it burns CPU + writes files. The
    # log-quiet-only test then killed PRODUCTIVE agents and they never finished (T-F1
    # wedged 2x, ran 74m+20m+20m, 0 results). Before reaping, check whether the agent has
    # WRITTEN to its worktree recently — real progress is immune to stdout buffering. A
    # worktree touched within STALL_QUIET_MIN means it's working; only reap when BOTH the
    # log AND the worktree have been quiet (the true "silent + MCP orphans hold the pipe"
    # hang leaves both frozen). CPU-by-pgid was tried and rejected: Claude Code re-parents
    # its workers out of the pane's process group, so the pgid CPU reads ~0 even when busy.
    wt_quiet = _worktree_quiet_min(task_id)
    if wt_quiet is not None and wt_quiet < STALL_QUIET_MIN:
        return False, ""
    wt_note = f" wt_quiet={wt_quiet:.0f}m" if wt_quiet is not None else ""
    return True, f"age={age_min:.0f}m quiet={quiet_min:.0f}m log={stat.st_size}B{wt_note}"


def _kill_slot_pg(slot):
    """Kill the tmux session AND its process group so orphaned MCP fast_mux servers
    stop holding the runner's stdout/tee pipe open (that's what wedges the slot in
    the first place — see _slot_stalled). Best-effort: not all children are in the
    same PGID because Claude Code's native process may re-parent."""
    sess = session_name(slot)
    # Enumerate the runner's PIDs before we tear down tmux (once tmux is gone the
    # session_name -> pane -> shell chain is lost).
    pids = []
    try:
        pane_pid = subprocess.check_output(
            [TMUX, "list-panes", "-t", sess, "-F", "#{pane_pid}"],
            text=True, stderr=subprocess.DEVNULL).strip()
        if pane_pid:
            # `pgrep -g <pgid>` finds every process with that pgid, incl. MCP orphans.
            pgid_out = subprocess.check_output(
                ["ps", "-o", "pgid=", "-p", pane_pid], text=True).strip()
            if pgid_out:
                pgid = pgid_out.split()[0]
                pids = subprocess.check_output(
                    ["pgrep", "-g", pgid], text=True).split()
    except Exception:
        pass
    subprocess.run([TMUX, "kill-session", "-t", sess], capture_output=True)
    for pid in pids:
        subprocess.run(["kill", "-TERM", pid], capture_output=True)
    # After 2s, ensure any survivors get the hammer.
    if pids:
        time.sleep(2)
        for pid in pids:
            subprocess.run(["kill", "-KILL", pid], capture_output=True)


def harvest_exited_slot(task_id, log_path):
    """When an agent's session exits, its work may be stranded in the worktree because
    Claude Code's sandbox/TCC blocked the in-worktree commit/push (writes to the parent
    .git are denied). If the worktree has uncommitted changes and ANY of this task's
    logs report a gate-green result, land the work via push_helper (which runs OUTSIDE
    the sandbox: /tmp clone -> re-gate -> commit -> push w/ retry).

    SAFETY MODEL: push_helper RE-RUNS the full `fct regress engine` in the clone and
    refuses to push if it is red. So harvesting is safe even if the agent's self-report
    is imperfect — a false/regressing change simply won't land. We therefore harvest on
    either an explicit `SWARM_RESULT <id> DONE` OR a BLOCKED result whose text asserts
    the work is complete + gate-green (the common old-brief case: 'work-complete-and-
    gate-green-... TCC blocks git writes'). We scan ALL of the task's logs, not just the
    current one, because the completing run's SWARM_RESULT may be in an earlier log."""
    wt = os.path.join(ROOT, "worktrees", task_id)
    if not os.path.isdir(wt):
        return
    dirty = subprocess.run(["git", "-C", wt, "status", "--porcelain"],
                           capture_output=True, text=True).stdout.strip()
    if not dirty:
        return
    # Scan ALL logs for this task for a completion signal.
    import glob as _glob
    logs = sorted(_glob.glob(os.path.join(LOGS, f"{task_id}.*.log")))
    if log_path and log_path not in logs and os.path.exists(log_path):
        logs.append(log_path)
    result, summary, gate_green = "", "", False
    for lg in logs:
        try:
            txt = open(lg, errors="ignore").read()
        except Exception:
            continue
        m = re.search(r"SWARM_RESULT\s+" + re.escape(task_id) + r"\s+(\w+)\s*(.*)", txt)
        if m:
            result = m.group(1).upper()
            summary = m.group(2).strip().strip("`").strip()[:200]
        if re.search(r"0 regressions|gate.?green|gate-verified", txt, re.I):
            gate_green = True
    # Harvest if the agent said DONE, or said BLOCKED but asserts complete+gate-green.
    complete = (result == "DONE") or (result == "BLOCKED" and gate_green) or \
               (result == "BLOCKED" and re.search(r"complete|gate.?green", summary, re.I))
    if not complete:
        print(f"[pool] {task_id} exited dirty; result={result or 'none'} gate_green={gate_green}"
              f" — NOT harvesting (push_helper would re-gate, but no completion signal)", flush=True)
        return
    msgfile = f"/tmp/swarm-{task_id}-harvest-msg.txt"
    with open(msgfile, "w") as f:
        f.write(f"{task_id} DONE: {summary or 'swarm agent result (auto-harvested)'}\n\n"
                f"Auto-harvested by the swarm pool: the agent gated green in-worktree but\n"
                f"macOS TCC/sandbox blocked its git write; push_helper re-ran the gate in a\n"
                f"/tmp clone (refuses to push red) and landed it.\n")
    print(f"[pool] harvesting {task_id} (result={result}, gate_green={gate_green}) via push_helper...", flush=True)
    rc = subprocess.run(["bash", PUSH_HELPER, task_id, msgfile]).returncode
    print(f"[pool] harvest {task_id} -> push_helper rc={rc}", flush=True)
    return

def cmd_run(size, once):
    os.makedirs(LOGS, exist_ok=True)
    print(f"[pool] target size {size}; scheduling from {ROADMAP}", flush=True)
    while True:
        # Which tasks are already assigned to a live slot?
        st = load_state()
        active = {}
        for slot in range(size):
            if slot_running(slot):
                tid = st["slots"].get(str(slot), {}).get("task")
                lg = st["slots"].get(str(slot), {}).get("log")
                # A LIVE session that has ALREADY printed a terminal SWARM_RESULT in its
                # current log is DONE — Claude Code's -p mode often lingers after emitting
                # the result (esp. when its in-worktree git push was TCC-blocked), holding
                # the slot indefinitely. Reap it now (harvest first) instead of waiting for
                # the OS to exit the session, so the slot refills and stuck agents don't
                # churn. harvest_exited_slot() no-ops if there's nothing gate-green to land.
                if tid and lg and os.path.exists(lg) and _log_has_result(lg, tid):
                    print(f"[pool] slot {slot} ({tid}) already reported SWARM_RESULT while live"
                          f" — harvesting + reaping", flush=True)
                    harvest_exited_slot(tid, lg)
                    subprocess.run([TMUX, "kill-session", "-t", session_name(slot)], capture_output=True)
                    clear_slot(slot)
                    continue
                # Wedge check: log stopped growing and no result was ever produced.
                # See _slot_stalled — this reaps the "3-line log, alive forever" case
                # that was permanently burning pool capacity 2026-07-13.
                stalled, why = _slot_stalled(st["slots"].get(str(slot), {}), tid or "", slot)
                if stalled:
                    print(f"[pool] slot {slot} ({tid or '?'}) WEDGED ({why}) — killing session"
                          f" + MCP orphans", flush=True)
                    _kill_slot_pg(slot)
                    clear_slot(slot)
                    continue
                active[slot] = tid
            else:
                if str(slot) in st["slots"]:
                    tid = st["slots"][str(slot)]["task"]
                    print(f"[pool] slot {slot} ({tid}) exited", flush=True)
                    harvest_exited_slot(tid, st["slots"][str(slot)].get("log"))
                    clear_slot(slot)
        elig, done = eligible_tasks()
        # Reap live slots whose task is already DONE (merged to origin/main by another
        # agent or a prior run, or marked DONE/DROPPED in the ROADMAP). Continuing to
        # run a finished task just burns a slot — kill it so the slot refills with real
        # work. This closes the completion-detection RACE: a task can be relaunched in
        # the window between an agent finishing and its result landing on origin; once
        # the result lands, `done` catches it and we stop the redundant runner.
        for slot in list(active.keys()):
            tid = active.get(slot)
            if tid and tid in done:
                print(f"[pool] slot {slot} ({tid}) is DONE on origin — reaping redundant runner", flush=True)
                subprocess.run([TMUX, "kill-session", "-t", session_name(slot)], capture_output=True)
                clear_slot(slot)
                del active[slot]
        in_flight = set(v for v in active.values() if v)
        queue = [t for t in elig if t["id"] not in in_flight]

        free = [s for s in range(size) if s not in active]
        for slot in free:
            if not queue:
                break
            task = queue.pop(0)
            launch(slot, task)
            time.sleep(2)  # stagger worktree creation / git fetch

        remaining = [t["id"] for t in eligible_tasks()[0] if t["id"] not in in_flight]
        if not active and not remaining:
            print("[pool] no active agents and no eligible tasks — swarm complete.", flush=True)
            break
        if once:
            print(f"[pool] --once: {len(active)} active, {len(remaining)} queued; exiting scheduler.", flush=True)
            break
        time.sleep(20)

def cmd_status():
    st = load_state()
    print("=== swarm pool status ===")
    for slot in sorted(st.get("slots", {}), key=int):
        info = st["slots"][slot]
        live = slot_running(int(slot))
        age = int(time.time() - info.get("started", time.time()))
        tail = ""
        try:
            tail = subprocess.check_output(["tail", "-n", "1", info["log"]], text=True).strip()[:80]
        except Exception:
            pass
        print(f"  slot {slot}: {info['task']:8s} {'LIVE' if live else 'dead'} {age//60}m  | {tail}")
    elig, done = eligible_tasks()
    print(f"  done: {sorted(done)}")
    print(f"  eligible now: {[t['id'] for t in elig]}")

def cmd_stop():
    for s in running_slots():
        subprocess.run([TMUX, "kill-session", "-t", s], capture_output=True)
        print(f"[pool] killed {s}")

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run"); r.add_argument("--size", type=int, default=8); r.add_argument("--once", action="store_true")
    sub.add_parser("status")
    sub.add_parser("stop")
    a = ap.parse_args()
    if a.cmd == "run": cmd_run(a.size, a.once)
    elif a.cmd == "status": cmd_status()
    elif a.cmd == "stop": cmd_stop()

if __name__ == "__main__":
    main()
