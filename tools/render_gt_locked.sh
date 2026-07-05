#!/bin/bash
# Serialize FCP ground-truth renders across parallel agents via a global flock.
# The Ozone/Metal boot is in-process and can contend; renders are only seconds so
# serializing them is cheap insurance. All args are forwarded to tools/render_gt.py.
#   usage: bash tools/render_gt_locked.sh <motr> <imgA> <imgB> <outdir> [nframes]
#          bash tools/render_gt_locked.sh --push <outdir> [nframes]
MAIN="$HOME/random/final-cut-pro-transitions"
LOCK="/tmp/fct_render.lock"
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
# Use the caller's own render_gt.py (worktree copy) but the shared venv/dylib.
RENDER_PY="$(pwd)/tools/render_gt.py"; [ -f "$RENDER_PY" ] || RENDER_PY="$MAIN/tools/render_gt.py"
exec /usr/bin/env DYLD_FRAMEWORK_PATH="$FW" \
  "$MAIN/venv/bin/python" - "$LOCK" "$RENDER_PY" "$@" <<'PY'
import sys, os, fcntl, subprocess
lock_path, render_py = sys.argv[1], sys.argv[2]
args = sys.argv[3:]
lf = open(lock_path, "w")
fcntl.flock(lf, fcntl.LOCK_EX)   # blocks until we hold the global render lock
try:
    rc = subprocess.call([sys.executable, render_py, *args])
finally:
    fcntl.flock(lf, fcntl.LOCK_UN)
sys.exit(rc)
PY
