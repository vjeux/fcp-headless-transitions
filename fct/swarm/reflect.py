#!/usr/bin/env python3
"""
fct.swarm.reflect — the swarm's meta-cognition loop.

Every 30 min this reads all agent logs, computes where the agents spend time and where
they get stuck, then dispatches a Claude Code "reflection" agent to (a) write a dated
findings note under docs/notes/swarm/ and (b) implement CONCRETE, SAFE efficiency
improvements to the swarm harness / agent brief / toolkit — gate-verified and pushed
like any other change.

It does NOT touch engine/src render code; its job is to make the OTHER agents faster
and more reliable (better brief, better tooling, better task scoping).

Usage:
    python3 -m fct.swarm.reflect once     # one reflection pass now
    python3 -m fct.swarm.reflect loop      # every 30 min (run under tmux)
"""
import os, re, sys, time, glob, json, subprocess, datetime, collections

HOME = os.path.expanduser("~")
MAIN = os.path.join(HOME, "random", "final-cut-pro-transitions")
ROOT = os.path.join(HOME, "fct-swarm")
LOGS = os.path.join(ROOT, "logs")

import shutil as _shutil
TMUX = (_shutil.which("tmux") or
        next((c for c in ("/opt/homebrew/bin/tmux", "/usr/local/bin/tmux",
                          "/usr/bin/tmux") if os.path.exists(c)), "tmux"))
BREW_PATH_EXPORT = 'export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"; '


def gather_metrics():
    """Summarize agent logs: per-task wall-time proxy, friction signals, gate outcomes."""
    metrics = {"tasks": {}, "signals": collections.Counter(), "wedged": []}
    now = time.time()
    for log in sorted(glob.glob(os.path.join(LOGS, "*.log"))):
        tid = os.path.basename(log).split(".")[0]
        try:
            txt = open(log, errors="ignore").read()
        except Exception:
            continue
        m = metrics["tasks"].setdefault(tid, {"bytes": 0, "runs": 0, "exit": None,
                                               "result": None, "gate_fail": 0, "rebase": 0})
        m["bytes"] += len(txt)
        m["runs"] += 1
        m["gate_fail"] += len(re.findall(r"FAIL:.*regression", txt))
        m["rebase"] += len(re.findall(r"non-fast-forward|REJECTED|rebase", txt))
        rr = re.search(r'SWARM_RESULT\s+\S+\s+(\w+)\s+(\S+)\s+"?([^"]*)', txt)
        if rr:
            m["result"] = rr.group(1)
        ex = re.search(r"SWARM_SLOT_EXIT\s+(\d+)", txt)
        if ex:
            m["exit"] = int(ex.group(1))
        for sig in ("LOCKED", "npm error", "Cannot find", "timeout", "ERR_",
                    "traceback", "Error:", "permission"):
            n = len(re.findall(re.escape(sig), txt, re.I))
            if n:
                metrics["signals"][sig] += n
        # Wedged-slot detection: the pool has a stall-reaper (pool.py _slot_stalled),
        # but surfacing wedged logs in metrics helps the reflection agent see the class
        # of failure at a glance instead of having to eyeball ps + tmux state.
        # A log is "wedged" if it's >=15 min old, still very small, and never emitted
        # a SWARM_RESULT or SWARM_SLOT_EXIT. Matches the T-B3/T-F1/T-E2 pattern from
        # 2026-07-13 04:07 where 3 of 3 slots wedged simultaneously with 3-line logs.
        try:
            stat = os.stat(log)
            age_min = (now - stat.st_mtime) / 60.0
            if (age_min >= 15 and len(txt) < 2048 and not rr and not ex):
                metrics["wedged"].append((tid, os.path.basename(log), int(age_min), len(txt)))
        except Exception:
            pass
    return metrics


def render_summary(metrics):
    lines = ["# Swarm metrics snapshot",
             f"Generated: {datetime.datetime.now().isoformat(timespec='seconds')}", "",
             "## Per-task signals (from agent logs)",
             "| task | runs | result | exit | gate_fails | rebases | log_KB |",
             "|------|------|--------|------|-----------|---------|--------|"]
    for tid, m in sorted(metrics["tasks"].items()):
        lines.append(f"| {tid} | {m['runs']} | {m['result']} | {m['exit']} "
                     f"| {m['gate_fail']} | {m['rebase']} | {m['bytes']//1024} |")
    lines += ["", "## Aggregate friction signals"]
    if not metrics["signals"]:
        lines.append("- (none)")
    for sig, n in metrics["signals"].most_common():
        lines.append(f"- {sig}: {n}")
    wedged = metrics.get("wedged") or []
    if wedged:
        lines += ["", "## Wedged agent logs (>=15m old, <2KB, no SWARM_RESULT/EXIT)"]
        lines.append("These are the 'started but never made progress' logs — usually the")
        lines.append("claude_code plugin-init + MCP orphan wedge. Pool.py auto-reaps them")
        lines.append("(see _slot_stalled), but a persistently growing list means the reaper")
        lines.append("isn't running or the wedge starts earlier than it thinks.")
        lines.append("| task | log | age_min | bytes |")
        lines.append("|------|-----|---------|-------|")
        for tid, name, age, sz in wedged[:20]:
            lines.append(f"| {tid} | {name} | {age} | {sz} |")
    return "\n".join(lines)


REFLECT_PROMPT = """You are the SWARM EFFICIENCY agent for the fct FCP-transition engine.

You are in an isolated git worktree on branch swarm/reflect off origin/main. Other
Claude Code agents are working ROADMAP engine tasks in parallel; your job is to make
THEM faster and more reliable. You do NOT work engine tasks yourself.

A metrics snapshot from the live agent logs (~/fct-swarm/logs) is below. Read it, then
read a few actual logs (ls ~/fct-swarm/logs) to see where agents spend time and get
stuck (repeated gate failures, rebase churn, slow renders, missing tooling, misread
brief steps, wasted census passes, etc.).

METRICS SNAPSHOT:
{{METRICS}}

Your job THIS pass:
1. Diagnose the TOP 1-3 concrete inefficiencies / failure modes visible in the logs.
2. Implement SAFE improvements. Allowed targets:
   - fct/swarm/agent_brief.md  (clarify or tighten the contract; add a step that avoids
     a repeated mistake you can cite from a log).
   - fct/swarm/pool.py / reflect.py / setup_worktree.sh (harness bugs, better
     scheduling, faster/cheaper worktree seeding, better isolation).
   - fct/ toolkit (add a helper that removes repeated manual work, e.g. a combined
     "render+score my slugs" one-liner) WITHOUT changing scoring semantics or the gate.
   - ROADMAP task text (tighten a task's slugs/premise if logs show confusion) but NEVER
     invent engine work.
   Do NOT touch engine/src render code — that is the workers' domain; changing it under
   them causes rebase chaos.
3. Write findings to docs/notes/swarm/reflection-{{DATE}}.md (create dir if needed):
   what you saw (cite logs), what you changed, what to watch next pass.
4. Gate: `./fct.sh regress engine` must stay green (0 regressions); tsc clean if you
   touched TS.
5. Rebase onto origin/main, commit ONE change set as `swarm reflect: <summary>`, push
   (retry on reject). Never force-push.
6. Print `SWARM_RESULT reflect DONE <sha> "<one-line summary>"`.

Be surgical and evidence-driven: a small correct improvement with a log citation beats a
big speculative refactor.
"""


def _free_mem_mb():
    """Approx reclaimable RAM (free + inactive pages) in MB, via vm_stat. -1 on failure."""
    try:
        out = subprocess.check_output(["vm_stat"], text=True, timeout=10)
        pages = {}
        psize = 4096
        for line in out.splitlines():
            m = re.match(r"Mach Virtual Memory Statistics.*page size of (\d+)", line)
            if m:
                psize = int(m.group(1))
            m2 = re.match(r"Pages (free|inactive):\s+(\d+)", line)
            if m2:
                pages[m2.group(1)] = int(m2.group(2))
        if "free" in pages:
            return int((pages.get("free", 0) + pages.get("inactive", 0)) * psize / (1024 * 1024))
    except Exception:
        pass
    return -1


def _live_worker_sessions():
    """Count live pool worker tmux sessions (fct-swarm-0..N)."""
    try:
        out = subprocess.check_output([TMUX, "ls"], text=True, stderr=subprocess.DEVNULL)
        return len(re.findall(r"^fct-swarm-\d+:", out, re.M))
    except Exception:
        return 0


# Only dispatch the (heavy Claude Code) reflection agent when there is RAM headroom.
# The reflection agent is a FULL extra CC process; launching it on top of a saturated
# size-5 pool on this Mac pushed memory over the edge and OOM-killed pool agents
# mid-work (SIGKILL 137). The reflection loop is a meta-optimiser — it must NEVER
# starve the primary task agents. Skip (and retry next cycle) when free+inactive RAM is
# below this floor. ~1.5 GB is roughly one CC agent's working set.
REFLECT_MIN_FREE_MB = 2500


def dispatch_reflection(metrics_md):
    free = _free_mem_mb()
    workers = _live_worker_sessions()
    if free != -1 and free < REFLECT_MIN_FREE_MB:
        print(f"[reflect] SKIP dispatch — only {free}MB free RAM (< {REFLECT_MIN_FREE_MB}MB floor), "
              f"{workers} pool workers live. Reflecting would risk OOM-killing a task agent. "
              f"Will retry next cycle.", flush=True)
        return
    os.makedirs(os.path.join(ROOT, "worktrees"), exist_ok=True)
    wt = subprocess.check_output(
        ["bash", os.path.join(MAIN, "fct", "swarm", "setup_worktree.sh"), "reflect"],
        text=True).strip().splitlines()[-1]
    date = datetime.datetime.now().strftime("%Y-%m-%d-%H%M")
    prompt = REFLECT_PROMPT.replace("{{METRICS}}", metrics_md).replace("{{DATE}}", date)
    ppath = os.path.join(wt, ".swarm_reflect_prompt.md")
    open(ppath, "w").write(prompt)
    log = os.path.join(LOGS, f"reflect.{date}.log")
    frames = os.path.join(ROOT, "frames", "reflect")
    lock = os.path.join(ROOT, "locks", "reflect.lock")
    inner = (
        f"{BREW_PATH_EXPORT}"
        f"cd {wt} && export FCT_FRAMES_DIR={frames} FCT_LOCK={lock} FCT_JOBS=2 && "
        f"env -u META_AGENT_ROLE -u AGENT_ROLE -u CLAUDECODE "
        f"claude -p --model 'claude-opus-4-7' --dangerously-skip-permissions "
        f'"$(cat {ppath})" < /dev/null 2>&1 | tee {log}; echo SWARM_SLOT_EXIT $? >> {log}'
    )
    subprocess.run([TMUX, "kill-session", "-t", "fct-swarm-reflect"], capture_output=True)
    subprocess.run([TMUX, "new-session", "-d", "-s", "fct-swarm-reflect", "bash", "-lc", inner],
                   check=True)
    print(f"[reflect] dispatched reflection agent (log: {log})", flush=True)


def once():
    os.makedirs(LOGS, exist_ok=True)
    metrics = gather_metrics()
    md = render_summary(metrics)
    open(os.path.join(ROOT, "last_metrics.md"), "w").write(md)
    print(md)
    if not metrics["tasks"]:
        print("[reflect] no agent logs yet — nothing to reflect on.", flush=True)
        return
    dispatch_reflection(md)


def loop():
    while True:
        try:
            once()
        except Exception as e:
            print(f"[reflect] error: {e}", flush=True)
        time.sleep(30 * 60)


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "once"
    (loop if mode == "loop" else once)()
