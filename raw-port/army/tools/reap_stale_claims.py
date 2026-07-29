#!/usr/bin/env python3
"""
reap_stale_claims.py — release claims abandoned by dead/zombie workers.

A claim is STALE if:  age > MAX_AGE_MIN  AND  (no worktree on disk OR worktree
idle > IDLE_MIN).  A live worker touches its worktree files far more often than
IDLE_MIN, so this never steals work from an active worker.

Releases stale claims back to the queue (moves them out of `claimed`), so the
leaves become claimable again. Prints what it freed. Dry-run with --dry.
"""
import json, os, time, sys, glob

REPO = "/Users/vjeux/random/final-cut-pro-transitions"
CLAIMS = os.path.join(REPO, "raw-port/army/swarm/claims.json")
WT = os.path.join(REPO, "raw-port/army/worktrees")
MAX_AGE_MIN = 90
IDLE_MIN = 30
DRY = "--dry" in sys.argv

def wt_idle_min(cls, now):
    p = os.path.join(WT, cls)
    if not os.path.isdir(p):
        return None  # no worktree
    newest = 0
    for root, dirs, files in os.walk(p):
        if ".git" in root:
            continue
        for f in files:
            try:
                newest = max(newest, os.path.getmtime(os.path.join(root, f)))
            except OSError:
                pass
    return (now - newest) / 60.0 if newest else None

def main():
    with open(CLAIMS) as fh:
        d = json.load(fh)
    claimed = d.get("claimed", {})
    now = time.time()
    stale = []
    for k, v in list(claimed.items()):
        if not isinstance(v, dict):
            # malformed legacy entry (e.g. a bare float timestamp) — release it
            stale.append((k, -1, None))
            continue
        age = (now - v.get("t", 0)) / 60.0
        if age <= MAX_AGE_MIN:
            continue
        idle = wt_idle_min(v.get("cls", ""), now)
        if idle is None or idle > IDLE_MIN:
            stale.append((k, round(age), None if idle is None else round(idle)))
    print(f"claimed={len(claimed)}  stale={len(stale)}  (age>{MAX_AGE_MIN}m AND idle>{IDLE_MIN}m/missing)")
    for k, age, idle in stale[:20]:
        print(f"  release {k}  age={age}m idle={idle}")
    if len(stale) > 20:
        print(f"  ... +{len(stale)-20} more")
    if DRY:
        print("DRY RUN — nothing released")
        return
    for k, _, _ in stale:
        claimed.pop(k, None)
    with open(CLAIMS, "w") as fh:
        json.dump(d, fh, indent=1)
    print(f"released {len(stale)} stale claims -> back in queue")

if __name__ == "__main__":
    main()
