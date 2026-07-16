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


def _now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def _new_id():
    return "T-q" + uuid.uuid4().hex[:8]


def add(goal, title=None, project="fct", slugs=None, after=None, by="orchestrator",
        notes=None, tid=None):
    """Append a new task to the queue. Returns its id. Writes a fresh per-item file
    (never edits a shared file) so concurrent producers never conflict."""
    os.makedirs(TODO_DIR, exist_ok=True)
    tid = tid or _new_id()
    item = {
        "id": tid,
        "title": title or (goal[:60] + ("…" if len(goal) > 60 else "")),
        "project": project,
        "goal": goal,
        "slugs": list(slugs) if slugs else [],
        "after": after,
        "status": "open",
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
            subprocess.run(["git", "-C", REPO, "fetch", "origin", "--quiet"], timeout=60)
            listing = subprocess.check_output(
                ["git", "-C", REPO, "ls-tree", "--name-only", "origin/main",
                 "fct/swarm/todo/"], text=True, timeout=30).splitlines()
            for p in listing:
                if not p.endswith(".json"):
                    continue
                try:
                    blob = subprocess.check_output(
                        ["git", "-C", REPO, "show", f"origin/main:{p}"], text=True, timeout=30)
                    it = json.loads(blob)
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
                        notes=args.notes, tid=args.id)
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
                print(f"  {i['id']:12s} {i.get('status','?'):7s} [{i.get('project','')}] "
                      f"{i.get('title','')}{dep}")
            print(f"  ({len(items)} item(s))")
    elif args.cmd == "done":
        print("updated", set_status(args.id, args.status))


if __name__ == "__main__":
    _main()
