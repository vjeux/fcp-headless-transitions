"""fct roadmap-sync — reconcile ROADMAP.md status markers against the authoritative
done set, so the flat task table never drifts from reality.

WHY: the ROADMAP flat task table (T-A1, T-B2, ...) is the single source of truth for the
swarm scheduler (fct/swarm/pool.py reads it from origin/main). But agents land their work
with a commit like "T-D2a DONE: ..." and the ROADMAP row is edited SEPARATELY — and gets
repeatedly clobbered by concurrent rebases / other agents' ROADMAP edits. Observed drift:
T-A2, T-D2a, T-D2c all sat as TODO on origin/main long after their DONE commits landed.
That drift is mostly harmless (pool.done_task_ids() ALSO scans the commit log, so a DONE
task is not relaunched) but it makes the ROADMAP lie to humans + agents reading it.

WHAT: flip a task's marker to DONE **only** when the authoritative done set (the same
commit-log + marker scan the pool uses) proves it done. This is monotonic and safe:
  * TODO/DOING/BLOCKED -> DONE   (only when proven done on origin)
  * NEVER the reverse (never un-mark a DONE, never touch DROPPED)
  * PARTIAL is left ALONE unless proven fully DONE — a PARTIAL row carries a human note
    about remaining work, so we don't silently upgrade it without evidence.
This never invents completion: it only mirrors what already landed on origin/main.
"""
import os, re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROADMAP = os.path.join(REPO, "ROADMAP.md")

# A flat task row: "T-D2a DONE    Brightness/Colorize into linear ..."
ROW_RE = re.compile(r"^(T-[A-Za-z0-9]+)(\s+)(TODO|DOING|PARTIAL|BLOCKED|DONE|DROPPED)(\s+)(.*)$")


def _done_only_ids():
    """Task ids that have a genuine 'T-X DONE' commit on origin/main OR are already
    marked DONE/DROPPED in the ROADMAP. This is DELIBERATELY NARROWER than
    pool.done_task_ids(): the pool treats BLOCKED/NOOP commits as 'done' too (so it
    won't RE-RUN a blocked task), but for ROADMAP *markers* a BLOCKED task must STAY
    BLOCKED — it's a documented ceiling, not a completed deliverable. Marking a blocked
    row DONE would silently erase that signal (bug observed 2026-07-13: T-E2 landed a
    'T-E2 BLOCKED' commit and roadmap-sync wrongly flipped its row TODO->DONE)."""
    import subprocess, os as _os
    from fct.swarm.pool import parse_tasks, MAIN
    ids = set()
    # Already-terminal ROADMAP states are authoritative.
    for t in parse_tasks():
        if t["status"] in ("DONE", "DROPPED"):
            ids.add(t["id"])
    # Commit-log scan: ONLY 'T-X DONE' subjects (not BLOCKED/DROPPED/NOOP/bare-colon).
    try:
        subprocess.run(["git", "-C", MAIN, "fetch", "origin", "--quiet"], timeout=60)
        log = subprocess.check_output(
            ["git", "-C", MAIN, "log", "origin/main", "--pretty=%s", "-n", "400"],
            text=True, timeout=30)
        for line in log.splitlines():
            m = re.match(r"^(?:swarm\s+)?(T-[A-Za-z0-9]+)\s+DONE\b", line, re.I)
            if m:
                ids.add(m.group(1))
    except Exception as e:
        print(f"roadmap-sync: warn: DONE-commit scan failed: {e}")
    return ids


def reconcile(write=True):
    """Reconcile ROADMAP markers to the DONE set. Returns list of (id, old, new)."""
    done = _done_only_ids()

    lines = open(ROADMAP).read().split("\n")
    changes = []
    for i, line in enumerate(lines):
        m = ROW_RE.match(line)
        if not m:
            continue
        tid, sp1, status, sp2, rest = m.groups()
        # Only flip a NOT-STARTED / IN-PROGRESS row to DONE. BLOCKED is EXCLUDED: a
        # BLOCKED marker is a deliberate ceiling decision (documented in the row), not
        # something to auto-upgrade — even if a 'T-X DONE' commit somehow also exists,
        # a human/agent set BLOCKED for a reason. PARTIAL is likewise left alone (its
        # note tracks remaining work). DROPPED/DONE are terminal, untouched.
        if tid in done and status in ("TODO", "DOING"):
            field_w = len(status) + len(sp2)
            new_sp2 = " " * max(1, field_w - len("DONE"))
            lines[i] = f"{tid}{sp1}DONE{new_sp2}{rest}"
            changes.append((tid, status, "DONE"))
    if write and changes:
        open(ROADMAP, "w").write("\n".join(lines))
    return changes


def run():
    changes = reconcile(write=True)
    if not changes:
        print("roadmap-sync: no drift — all markers match the done set")
        return 0
    for tid, old, new in changes:
        print(f"roadmap-sync: {tid} {old} -> {new}")
    print(f"roadmap-sync: reconciled {len(changes)} marker(s)")
    return 0
