#!/usr/bin/env python3
"""swarm_maint_cron.py — SCRIPT-cron entrypoint for the queue-driven swarm (Model B).

A true script cron (no agent, no LLM, no spawn). It just subprocess-runs swarm_maint.sh (all the
headless plumbing: ledger guard, warm-pool init/gc, tree clean, depclaim seed, depgraph reconcile,
snapshot) and surfaces its one-line status + exit code. Kept as a tiny wrapper because the scheduler's
script mode is python-only while the plumbing is bash.
"""
import subprocess, sys, os
CANON = os.path.expanduser("~/random/final-cut-pro-transitions")
r = subprocess.run(["bash", os.path.join(CANON, "raw-port/army/tools/swarm_maint.sh")],
                   capture_output=True, text=True, timeout=220)
sys.stdout.write(r.stdout)
if r.stderr.strip():
    sys.stderr.write(r.stderr[-2000:])
# swarm_maint prints its snapshot on the last stdout line; exit 1 only on FATAL (ledger unrestorable)
sys.exit(r.returncode)
