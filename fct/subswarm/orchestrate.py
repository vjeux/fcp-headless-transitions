#!/usr/bin/env python3
"""fct/subswarm/orchestrate.py — orchestration helper for the subsystem swarm.

The swarm agents are NAVI SUB-AGENTS spawned via the navi `spawn_agent` tool by the
ORCHESTRATOR agent (the main navi session) — NOT Claude Code, NOT tmux (same model as
fct/swarm). This script does NOT spawn anything itself; it prepares + prints everything the
orchestrator needs so the launch is reproducible and compaction-proof:

  orchestrate.py setup           # create/refresh the 3 isolated worktrees (setup_worktree.sh)
  orchestrate.py briefs          # print the spawn_agent task string for each subsystem
  orchestrate.py status          # per-subsystem scoreboard (fct subswarm status) + worktree state

Each subsystem gets ONE agent, locked to cli:vjeux-mac, working in
~/fct-swarm/worktrees/subsw-<name> on branch swarm/subsw-<name>, editing only its owned files,
verifying with `fct subswarm test <name>` (caps + minimized repros vs headless FCP) — NEVER the
65-slug GUI-GT suite. Disjoint file ownership => no merge contention.
"""
import os, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
SUBS = json.load(open(os.path.join(HERE, "subsystems.json")))

def setup():
    for name in SUBS:
        print(f"=== setup subsw-{name} ===")
        subprocess.call(["bash", os.path.join(REPO, "fct/swarm/setup_worktree.sh"),
                         "setup", f"subsw-{name}"])

def briefs():
    from fct.subswarm import brief
    for name in SUBS:
        print(f"\n{'='*80}\n# spawn_agent task for subsystem: {name}\n{'='*80}")
        print(brief.render(name))

def status():
    subprocess.call([os.path.join(REPO, "fct.sh"), "subswarm", "status"])
    print("\nworktrees:")
    for name in SUBS:
        wt = os.path.expanduser(f"~/fct-swarm/worktrees/subsw-{name}")
        exists = "present" if os.path.isdir(wt) else "MISSING"
        print(f"  subsw-{name:12s} {exists}  {wt}")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    {"setup": setup, "briefs": briefs, "status": status}.get(cmd, status)()
