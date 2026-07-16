#!/usr/bin/env python3
"""
fct.swarm.todo — the APPENDABLE task queue the swarm pulls from.

The main/orchestrator agent does NO engineering: its only job is to keep the pool of
worker sub-agents full (see fct/swarm/pool.py). The WORK comes from this queue, and —
critically — worker sub-agents can APPEND new items to it as they discover follow-up
work (a decode that opens a new fix, a regressed-but-already-imperfect slug per ROADMAP
Rule 11, a subsystem too big for one task). Future agents then pick those up. This is
what lets the swarm run open-endedly without a human re-authoring the ROADMAP table.

STORAGE: a maildir of one JSON file per task under `fct/swarm/todo/<id>.json`. One file
per item is deliberate — 8 worker worktrees appending to ONE shared file would merge-
conflict on every push; a NEW unique file never conflicts, so concurrent producers are
safe. The queue is COMMITTED to git (origin/main), so the pool (which reads origin/main)
sees new items on its next cycle and any agent can add to it via a normal push.

ITEM SCHEMA (all fields optional except id/title/goal):
  { "id": "T-q<8hex>",        # task id; MUST start "T-" so the pool's worktree naming +
                              #   commit-subject completion detection work unchanged
    "title": "short label",
    "project": "fct",         # which project/area this belongs to (free-form tag)
    "goal": "what to do + why (the sub-agent's brief)",
    "slugs": ["Cat__Name"],  # optional target slugs
    "after": "T-xxxx",        # optional dependency: don't start until that id is DONE
    "status": "open",         # open | doing | done | dropped | blocked
    "created_by": "T-abcd",   # the agent (or 'human'/'orchestrator') that filed it
    "created_at": "ISO8601",
    "notes": "..." }

STATUS is advisory for humans; the pool detects COMPLETION the same way it always has —
a pushed commit on origin/main whose subject starts "<id> DONE|DROPPED|BLOCKED" (or
"<id>:"). An agent finishing an item should also flip its file's status in the same
commit (best-effort; the commit subject is the source of truth).

CLI:
    python3 -m fct.swarm.todo add  --goal "..." [--title ..] [--project ..]
                                    [--slugs A B] [--after T-xxxx] [--by T-abcd]
    python3 -m fct.swarm.todo list [--status open] [--json]
    python3 -m fct.swarm.todo done   <id> [--status done|dropped|blocked]
"""
import os, sys, json, time, uuid, argparse, datetime, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TODO_DIR = os.path.join(REPO, "fct", "swarm", "todo")

_VALID_STATUS = ("open", "doing", "done", "dropped", "blocked")

# Fetch-once guard (see all_items): fetch origin at most once per process so a status call
# that fans out to many todo reads doesn't re-fetch. Reset by re-importing the module.
_TODO_FETCHED = False


def _now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def _new_id():
    return "T-q" + uuid.uuid4().hex[:8]


def add(goal, title=None, project="fct", slugs=None, after=None, by="orchestrator",
        notes=None, tid=None, tier="isolated"):
    """Append a new task to the queue. Returns its id. Writes a fresh per-item file
    (never edits a shared file) so concurrent producers never conflict.

    tier: 'isolated' (a single-slug bug, ~one session) or 'subsystem' (needs building a
    whole new capability — z-buffer compositor, generator, etc.; expect multi-session WIP
    increments + a bigger token budget). The orchestrator reads this to size the sub-agent."""
    os.makedirs(TODO_DIR, exist_ok=True)
    tid = tid or _new_id()
    if tier not in ("isolated", "subsystem"):
        raise SystemExit("tier must be 'isolated' or 'subsystem'")
    item = {
        "id": tid,
        "title": title or (goal[:60] + ("…" if len(goal) > 60 else "")),
        "project": project,
        "goal": goal,
        "slugs": list(slugs) if slugs else [],
        "after": after,
        "status": "open",
        "tier": tier,
        "created_by": by,
        "created_at": _now(),
        "notes": notes or "",
    }
    path = os.path.join(TODO_DIR, f"{tid}.json")
    with open(path, "w") as f:
        json.dump(item, f, indent=2)
        f.write("\n")
    return tid, path


def _read_dir(d):
    items = []
    if not os.path.isdir(d):
        return items
    for fn in sorted(os.listdir(d)):
        if not fn.endswith(".json") or fn.startswith("."):
            continue  # skip .keep.json and any dotfile marker
        try:
            it = json.load(open(os.path.join(d, fn)))
            if isinstance(it, dict) and it.get("id"):
                items.append(it)
        except Exception:
            pass
    return items


def all_items(from_origin=True):
    """All queued items. By default read the COMMITTED queue on origin/main (so the pool
    sees items the moment they're pushed, without a local pull) and overlay any local
    uncommitted files. Falls back to the working tree if git is unavailable."""
    items = {}
    if from_origin:
        try:
            # Fetch AT MOST ONCE per process (shared with pool's fetch-once guard via the
            # module global + FCT_SKIP_FETCH). A status call already fetched via pool, so
            # skip the redundant network round-trip here (was ~2-4s of the old 19s status).
            global _TODO_FETCHED
            if not _TODO_FETCHED and os.environ.get("FCT_SKIP_FETCH") != "1":
                subprocess.run(["git", "-C", REPO, "fetch", "origin", "--quiet"], timeout=60)
                _TODO_FETCHED = True
                # tell any sibling guard (pool._fetch_origin_once) origin is fetched this
                # process so it skips its own redundant fetch of the same remote.
                os.environ["FCT_SKIP_FETCH"] = "1"
            listing = subprocess.check_output(
                ["git", "-C", REPO, "ls-tree", "--name-only", "origin/main",
                 "fct/swarm/todo/"], text=True, timeout=30).splitlines()
            paths = [p for p in listing if p.endswith(".json")]
            # Batch-read ALL blobs in ONE `git cat-file --batch` process instead of a
            # `git show` per file (was 40+ subprocess spawns ≈ most of the status wall time).
            if paths:
                specs = "".join(f"origin/main:{p}\n" for p in paths)
                proc = subprocess.run(
                    ["git", "-C", REPO, "cat-file", "--batch"],
                    input=specs, capture_output=True, timeout=30)
                buf = proc.stdout
                off = 0
                # --batch output per object: "<sha> <type> <size>\n<size bytes>\n"
                while off < len(buf):
                    nl = buf.find(b"\n", off)
                    if nl < 0:
                        break
                    header = buf[off:nl].decode("utf-8", "replace")
                    parts = header.split(" ")
                    if len(parts) != 3 or parts[1] != "blob":
                        # "<oid> missing" line (no size) — skip just this header line.
                        off = nl + 1
                        continue
                    size = int(parts[2])
                    start = nl + 1
                    payload = buf[start:start + size]
                    off = start + size + 1  # skip trailing newline
                    try:
                        it = json.loads(payload)
                        if isinstance(it, dict) and it.get("id"):
                            items[it["id"]] = it
                    except Exception:
                        pass
        except Exception:
            pass
    # Overlay local working-tree files (newer than origin, e.g. just-added by this call).
    for it in _read_dir(TODO_DIR):
        items[it["id"]] = it
    return list(items.values())


def set_status(tid, status):
    if status not in _VALID_STATUS:
        raise SystemExit(f"status must be one of {_VALID_STATUS}")
    path = os.path.join(TODO_DIR, f"{tid}.json")
    if not os.path.exists(path):
        raise SystemExit(f"no such todo item: {tid}")
    it = json.load(open(path))
    it["status"] = status
    it["updated_at"] = _now()
    json.dump(it, open(path, "w"), indent=2)
    return path


def _main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("add")
    a.add_argument("--goal", required=True)
    a.add_argument("--title")
    a.add_argument("--project", default="fct")
    a.add_argument("--slugs", nargs="*")
    a.add_argument("--after")
    a.add_argument("--by", default="orchestrator")
    a.add_argument("--notes")
    a.add_argument("--id")
    a.add_argument("--tier", default="isolated", choices=("isolated", "subsystem"),
                   help="isolated = single-slug bug (~1 session); subsystem = build a whole "
                        "new capability (multi-session WIP + bigger budget)")
    li = sub.add_parser("list")
    li.add_argument("--status")
    li.add_argument("--json", action="store_true")
    li.add_argument("--local", action="store_true", help="read working tree only")
    d = sub.add_parser("done")
    d.add_argument("id")
    d.add_argument("--status", default="done")
    args = ap.parse_args()

    if args.cmd == "add":
        tid, path = add(args.goal, title=args.title, project=args.project,
                        slugs=args.slugs, after=args.after, by=args.by,
                        notes=args.notes, tid=args.id, tier=args.tier)
        print(f"added {tid} -> {path}")
        print("commit + push it so the pool + other agents see it:")
        print(f"  git add {path} && git commit -m '{tid}: queue task' && <push>")
    elif args.cmd == "list":
        items = all_items(from_origin=not args.local)
        if args.status:
            items = [i for i in items if i.get("status") == args.status]
        items.sort(key=lambda i: (i.get("status", ""), i.get("created_at", "")))
        if args.json:
            print(json.dumps(items, indent=2))
        else:
            for i in items:
                dep = f" after:{i['after']}" if i.get("after") else ""
                tier = i.get("tier", "isolated")
                tag = " «subsystem»" if tier == "subsystem" else ""
                print(f"  {i['id']:12s} {i.get('status','?'):7s} [{i.get('project','')}] "
                      f"{i.get('title','')}{dep}{tag}")
            print(f"  ({len(items)} item(s))")
    elif args.cmd == "done":
        print("updated", set_status(args.id, args.status))


if __name__ == "__main__":
    _main()
