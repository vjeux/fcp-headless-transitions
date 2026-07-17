#!/bin/bash
# Launcher for the faithful driver. The driver (fct/faithful/driver.py) re-execs ITSELF
# into the venv python with DYLD_FRAMEWORK_PATH set (gated by a private sentinel), and that
# python->python os.execv is what dyld actually honors — so DYLD works even under nohup /
# a scheduled clock (dyld strips DYLD_* only when bash launches the adhoc-signed python
# DIRECTLY; it preserves it across an execv from a running python). This wrapper just
# pre-seeds the env for good measure and invokes the driver; `bash run_tick.sh step` and
# `nohup bash run_tick.sh step &` both work. Compaction-proof: all state is on disk.
cd "$(dirname "$0")/../.."            # repo root
export DYLD_FRAMEWORK_PATH="/Applications/Final Cut Pro.app/Contents/Frameworks"
export FXPLUG_USE_PLUGINKIT=1
exec python3 -m fct.faithful.driver "${1:-step}" "${@:2}"
