#!/usr/bin/env python3
"""
Probe rendered under lldb by tools/lldb_capture_curve.py. Renders a handful of
frames of a .motr through the real engine, at times chosen to land inside each
keyframe segment so every segment's control polygon gets captured.

Set MOTR / TIMES via env, or defaults to Push at times hitting all 4 segments.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ozengine

MOTR = os.environ.get("PROBE_MOTR", os.path.expanduser(
    "~/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/"
    "Movements.localized/Push.localized/Push.motr"))
TIMES = [float(x) for x in os.environ.get("PROBE_TIMES", "0.15,0.55,1.05,1.50").split(",")]

doc = ozengine.boot(MOTR)
for tsec in TIMES:
    ozengine.render_frame(doc, "/tmp/rulerA.png", "/tmp/rulerB.png", tsec, "/tmp/probe_frame.png")
os._exit(0)
