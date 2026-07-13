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


def reconcile(write=True):
    """Reconcile ROADMAP markers to the done set. Returns list of (id, old, new)."""
    from fct.swarm.pool import done_task_ids
    done = done_task_ids()

    lines = open(ROADMAP).read().split("\n")
    changes = []
    for i, line in enumerate(lines):
        m = ROW_RE.match(line)
        if not m:
            continue
        tid, sp1, status, sp2, rest = m.groups()
        if tid in done and status in ("TODO", "DOING", "BLOCKED"):
            # Proven done on origin, and the row is in a not-started/in-progress state.
            # (PARTIAL is intentionally excluded — see module docstring.)
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
