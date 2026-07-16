#!/usr/bin/env python3
"""
fct.swarm.pool — task SCHEDULING core for the FCP-engine swarm.

HISTORY: this module used to also run a self-refilling pool of Claude Code worker agents
under tmux (launch/harvest/reap slots). That launcher was REMOVED (2026-07-16): the swarm
is now driven by **navi sub-agents spawned manually by the orchestrator agent** (this
session), NOT by tmux + Claude Code. Each sub-agent still works in its own isolated git
worktree (fct/swarm/setup_worktree.sh) and lands its work via fct/swarm/push_helper.sh —
the isolation model is unchanged; only the launcher changed.

What remains here is the PURE scheduling logic the orchestrator (and roadmap_sync) reads:
  - parse_tasks()    — legacy ROADMAP flat task table (kept for back-compat; normally empty
                       now that per-slug work lives in the TODO queue)
  - _queue_tasks()   — the appendable TODO queue (fct/swarm/todo/*.json), the real source
  - all_tasks()      — the two merged (queue wins on id collision)
  - done_task_ids()  — completion set (commit-subject scan on origin/main + terminal rows)
  - eligible_tasks() — TODO/DOING tasks whose `after:` dep is DONE — what to spawn next
  - slugs_for()      — best-effort target-slug extraction for a task

There is NO tmux, NO Claude Code, NO launch/harvest/reap here anymore. The orchestrator
calls eligible_tasks() to decide which todo items to spawn navi sub-agents for, and
done_task_ids() to know what has already landed.

Usage (read-only inspection):
    python3 -m fct.swarm.pool status
"""
import os, re, sys, json, subprocess, argparse

HOME = os.path.expanduser("~")
MAIN = os.path.join(HOME, "random", "final-cut-pro-transitions")
ROOT = os.path.join(HOME, "fct-swarm")
ROADMAP = os.path.join(MAIN, "ROADMAP.md")


# ---------------------------------------------------------------------------
# Fetch-once guard. A single `pool status` / eligible_tasks() call fans out to
# parse_tasks() + done_task_ids() + completed_task_ids() + the todo queue, and each USED to
# run its OWN `git fetch origin` (~2-4s over the network) — 4 fetches ≈ 19s per status call,
# which timed out the 5-min keep-8 tick and interactive checks (measured 2026-07-16). The
# refs don't change within a single process invocation, so fetch AT MOST ONCE and let every
# caller reuse it. Callers that need fresh refs across a long-lived process (none today) can
# reset _FETCHED. The env override FCT_SKIP_FETCH=1 skips entirely (offline / test).
# ---------------------------------------------------------------------------
_FETCHED = False


def _fetch_origin_once():
    global _FETCHED
    if _FETCHED or os.environ.get("FCT_SKIP_FETCH") == "1":
        return
    try:
        subprocess.run(["git", "-C", MAIN, "fetch", "origin", "--quiet"], timeout=60)
    except Exception as e:
        print(f"[pool] warn: git fetch failed: {e}", flush=True)
    _FETCHED = True
    # Signal the todo module (separate process-global guard) that origin is already fetched
    # this process, so its all_items() read skips the redundant second fetch of the same
    # remote (kept status at 2 fetches; now 1). todo honors FCT_SKIP_FETCH.
    os.environ["FCT_SKIP_FETCH"] = "1"


# ---------------------------------------------------------------------------
# Task list parsing + scheduling
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
        _fetch_origin_once()
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
        _fetch_origin_once()
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


def completed_task_ids():
    """Ids that genuinely LANDED a deliverable — DONE (or a bare `<id>:` change commit),
    NOT merely terminal. This is DELIBERATELY NARROWER than done_task_ids(): a BLOCKED or
    DROPPED task is terminal (don't relaunch it) but did NOT deliver, so it must NOT satisfy
    a downstream `after:` dependency. Bug it fixes (2026-07-16): a BLOCKED L2 lead
    (T-qpanellead1) counted as 'done', which UNBLOCKED its 4 dependents — they'd have been
    picked up and hit the exact same undecoded evaluator wall the lead deferred to a
    follow-up. Dependency gating must key on real completion, not terminality."""
    completed = set()
    for t in all_tasks():
        if t["status"] == "DONE":
            completed.add(t["id"])
    try:
        _fetch_origin_once()
        log = subprocess.check_output(
            ["git", "-C", MAIN, "log", "origin/main", "--pretty=%s", "-n", "400"],
            text=True, timeout=30)
        for line in log.splitlines():
            # A real landed change: "<id> DONE: ..." or a bare "<id>: ...". EXCLUDES
            # "<id> BLOCKED"/"<id> DROPPED"/"<id> NOOP" (space + keyword, no colon) — those
            # are terminal-without-deliverable and must NOT satisfy a dependency.
            m = re.match(r"^(?:swarm\s+)?(T-[A-Za-z0-9]+)(?::|\s+DONE\b)", line, re.I)
            if m:
                completed.add(m.group(1))
    except Exception as e:
        print(f"[pool] warn: completed scan failed: {e}", flush=True)
    return completed

def eligible_tasks():
    """TODO tasks that are (a) not themselves terminal, and (b) whose `after:` dep — if
    any — has genuinely LANDED a deliverable. Draws from BOTH the ROADMAP flat table AND
    the appendable swarm TODO queue (all_tasks).

    Two DIFFERENT completion sets are used deliberately:
      - done_task_ids()      = TERMINAL (DONE/DROPPED/BLOCKED/NOOP) → don't relaunch a task
                               that already reached a terminal state.
      - completed_task_ids() = genuinely DONE only → a dependency is satisfied ONLY when the
                               upstream task actually delivered. A BLOCKED/DROPPED lead must
                               NOT unblock its dependents (fixed 2026-07-16: a BLOCKED L2
                               lead was unblocking 4 dependents onto the same undecoded wall).
    """
    tasks = all_tasks()
    done = done_task_ids()            # terminal — for relaunch suppression
    completed = completed_task_ids()  # genuinely delivered — for dependency gating
    out = []
    for t in tasks:
        if t["status"] not in ("TODO", "DOING"):
            continue
        if t["id"] in done:
            continue
        if t["after"] and t["after"] not in completed:
            continue
        out.append(t)
    return out, done


# ---------------------------------------------------------------------------
# CLI — read-only inspection (no launcher; the orchestrator spawns navi sub-agents)
# ---------------------------------------------------------------------------
def cmd_status():
    """Print what is eligible and what is already done. Read-only — spawning is the
    orchestrator agent's job (navi sub-agents), not this module's."""
    elig, done = eligible_tasks()
    print("=== fct swarm scheduling status (navi-sub-agent model) ===")
    print(f"  done ({len(done)}): {sorted(done)}")
    print(f"  eligible now ({len(elig)}):")
    for t in elig:
        dep = f"  after:{t['after']}" if t.get("after") else ""
        slugs = " ".join(slugs_for(t)) or "-"
        print(f"    {t['id']:14s} [{slugs}]{dep}")
    if not elig:
        print("    (none - queue empty or all deps pending; nothing to spawn)")
    return 0


POOL_TARGET = 8  # RAM-safe concurrency on the 10-core box (see README "Why the isolation")


def _worktrees_on_disk():
    """Ids that currently have a swarm worktree under ~/fct-swarm/worktrees/<id>."""
    root = os.path.expanduser("~/fct-swarm/worktrees")
    if not os.path.isdir(root):
        return []
    return sorted(d for d in os.listdir(root)
                  if os.path.isdir(os.path.join(root, d)) and d.startswith("T-"))


def _live_ids():
    """Ids whose sub-agent is actually RUNNING right now, detected by a live process
    referencing the agent's private isolation id / worktree / frames dir. A navi
    sub-agent is one-shot: spawn -> run -> report -> exit. When it exits (finished,
    errored, or ran out of budget) WITHOUT a terminal SWARM_RESULT, no announcement
    reaches the orchestrator, so the slot silently empties. This is how we DETECT that
    (a worktree with no live process = a dead slot to reclaim/relaunch)."""
    try:
        ps = subprocess.check_output(["ps", "axww", "-o", "command"],
                                     text=True, timeout=15, stderr=subprocess.DEVNULL)
    except Exception:
        return set()
    live = set()
    for wt in _worktrees_on_disk():
        # A render/build/agent process is "live for <id>" if its command line mentions
        # any of the id's private paths or its isolation tag.
        needles = (f"swarm-{wt}", f"worktrees/{wt}", f"frames/{wt}", f"locks/{wt}")
        for line in ps.splitlines():
            if any(n in line for n in needles):
                live.add(wt)
                break
    return live


def _unlanded(wt_id):
    """(has_uncommitted_nonharness, unpushed_commits) for a worktree — used to decide
    whether a dead slot's worktree carries in-progress work worth resuming vs is a
    clean base to reclaim. Harness files (fct/swarm/*) are excluded from 'uncommitted'."""
    wt = os.path.expanduser(f"~/fct-swarm/worktrees/{wt_id}")
    if not os.path.isdir(wt):
        return (False, 0)
    def _git(*a):
        try:
            return subprocess.check_output(["git", "-C", wt, *a], text=True,
                                           timeout=20, stderr=subprocess.DEVNULL)
        except Exception:
            return ""
    dirty = [l for l in _git("status", "--porcelain").splitlines()
             if l[3:].strip() and not l[3:].strip().startswith("fct/swarm")
             and not l.startswith("??")]
    unpushed = len([l for l in _git("log", "--oneline", "origin/main..HEAD").splitlines() if l])
    return (len(dirty) > 0, unpushed)


def cmd_reconcile():
    """Report pool health so the orchestrator can refill to POOL_TARGET deterministically.
    Classifies every worktree as RUNNING (live process) or DEAD (no process), flags dead
    slots that carry unlanded work (relaunch to resume) vs clean base (reclaim), and lists
    the top eligible tasks to spawn for empty slots. Read-only: prints a plan, spawns
    nothing (spawning is the orchestrator agent's job via spawn_agent)."""
    _fetch_origin_once()
    wts = _worktrees_on_disk()
    live = _live_ids()
    elig, done = eligible_tasks()
    live_wts = [w for w in wts if w in live]
    dead_wts = [w for w in wts if w not in live]
    print("=== fct swarm pool reconcile ===")
    print(f"  target concurrency: {POOL_TARGET}")
    print(f"  worktrees on disk : {len(wts)}")
    print(f"  RUNNING (live proc): {len(live_wts)}  {sorted(live_wts)}")
    print(f"  DEAD (no process)  : {len(dead_wts)}")
    resume, reclaim = [], []
    for w in dead_wts:
        dirty, unpushed = _unlanded(w)
        tag = "resume(unlanded)" if (dirty or unpushed) else "reclaim(clean-base)"
        (resume if (dirty or unpushed) else reclaim).append(w)
        print(f"      {w:16s} {tag}  dirty={dirty} unpushed={unpushed}")
    running_ct = len(live_wts)
    need = max(0, POOL_TARGET - running_ct)
    print(f"  --> running={running_ct}  need {need} more to reach {POOL_TARGET}")
    print(f"  DEAD-with-unlanded-work (RELAUNCH same id, worktree resumes): {sorted(resume)}")
    print(f"  DEAD-clean-base (reclaim slot; can spawn a NEW eligible task): {sorted(reclaim)}")
    # eligible tasks NOT already represented by a worktree (fresh work for empty slots)
    fresh = [t for t in elig if t["id"] not in wts]
    print(f"  fresh eligible (no worktree yet) — top {min(need+3,len(fresh))}:")
    for t in fresh[:need + 3]:
        slugs = " ".join(slugs_for(t)) or "-"
        dep = f"  after:{t['after']}" if t.get("after") else ""
        print(f"      {t['id']:14s} [{slugs}]{dep}")
    return 0


def _task_by_id(tid):
    """Return the full task dict for an id (queue item preferred), or None."""
    for t in all_tasks():
        if t["id"] == tid:
            return t
    return None


def _queue_item(tid):
    """Read the raw todo JSON item (authoritative goal + slugs) for an id, or None."""
    try:
        from fct.swarm import todo as _todo
    except Exception:
        import importlib.util as _ilu
        spec = _ilu.spec_from_file_location(
            "_swarm_todo", os.path.join(MAIN, "fct", "swarm", "todo.py"))
        _todo = _ilu.module_from_spec(spec); spec.loader.exec_module(_todo)
    for it in _todo.all_items(from_origin=True):
        if it.get("id") == tid:
            return it
    return None


def cmd_brief(tid):
    """Emit the fully-filled agent brief for one task id, ready to hand to a navi
    sub-agent via spawn_agent. Fills {{TASK_ID}}/{{AGENT_ID}}/{{TASK_GOAL}}/{{TASK_SLUGS}}
    in agent_brief.md from the authoritative TODO-queue JSON (goal + slugs), so the
    orchestrator never hand-assembles a brief. AGENT_ID == TASK_ID (branch swarm/<id>)."""
    tmpl_path = os.path.join(MAIN, "fct", "swarm", "agent_brief.md")
    tmpl = open(tmpl_path).read()
    item = _queue_item(tid)
    if item:
        goal = item.get("goal") or item.get("title") or ""
        slugs = " ".join(item.get("slugs") or []) or "(see goal)"
    else:
        t = _task_by_id(tid)
        if not t:
            print(f"pool brief: no such task id {tid} (not in queue or ROADMAP)",
                  file=sys.stderr)
            return 2
        goal = t.get("desc", "")
        slugs = " ".join(slugs_for(t)) or "(see goal)"
    filled = (tmpl.replace("{{TASK_ID}}", tid)
                  .replace("{{AGENT_ID}}", tid)
                  .replace("{{TASK_GOAL}}", goal)
                  .replace("{{TASK_SLUGS}}", slugs))
    sys.stdout.write(filled)
    return 0


def main():
    ap = argparse.ArgumentParser(description="FCP swarm scheduling core (read-only).")
    sub = ap.add_subparsers(dest="cmd")
    sub.add_parser("status", help="show eligible + done tasks")
    sub.add_parser("eligible", help="alias for status")
    sub.add_parser("reconcile", help="pool health: running vs dead worktrees + refill plan")
    b = sub.add_parser("brief", help="print the filled agent brief for a task id")
    b.add_argument("id")
    args = ap.parse_args()
    if args.cmd == "brief":
        return cmd_brief(args.id)
    if args.cmd == "reconcile":
        return cmd_reconcile()
    if args.cmd in (None, "status", "eligible"):
        return cmd_status()
    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
