#!/usr/bin/env python3
"""fct.parity.spatial_batch — WARM batched SPATIAL probe (boots FCP ONCE).

Sibling of transfer_batch.py, but for SPATIAL filters (Glow/Blur/etc.) whose output
depends on a neighbourhood, not a single pixel. Instead of reading one center colour it
writes the WHOLE output frame so the sweep side can score full-frame PSNR at the NODE
BOUNDARY (one isolated single-filter .motr through REAL headless FCP — the same isolation
that VERIFIED every pointwise colour transfer, extended to a structured spatial input).

CRITICAL: FCP renders at the PROJECT resolution (1920x1080) regardless of the input image
size, so the synthetic probe input MUST already be 1920x1080 — otherwise the output is a
LANCZOS-resized copy and the residual is dominated by resample error, not the filter.

Reads a JSON job on argv[1]:
  {"uuid","pluginName","in":"/abs/native1920x1080.png",
   "jobs":[{"params":[{name,id,value}|{...children}], "tag":"...", "time":0.0}]}
Writes JSON to argv[2]: {"results":[{"tag","out":"/abs/out.png"}]}  (full-frame PNG paths)
Must run under venv python + DYLD (re-exec sentinel), like transfer_batch/the driver.
"""
import os, sys, json, pathlib
REPO = pathlib.Path(__file__).resolve().parents[2]
_FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
if not os.environ.get("_FCT_SPATIAL_REEXEC"):
    os.environ["DYLD_FRAMEWORK_PATH"] = _FW
    os.environ["FXPLUG_USE_PLUGINKIT"] = "1"
    os.environ["_FCT_SPATIAL_REEXEC"] = "1"
    os.environ["PYTHONPATH"] = str(REPO) + os.pathsep + os.environ.get("PYTHONPATH", "")
    os.chdir(str(REPO))
    _VENV_PY = str(REPO / "venv" / "bin" / "python3")
    os.execv(_VENV_PY, [_VENV_PY, "-u", str(REPO / "fct/parity/spatial_batch.py")] + sys.argv[1:])

import tempfile
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "tools"))
import ozengine
from tools.re.filter_probe import make_probe_motr
from fct.config import IMG_B


def main():
    job = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    uuid = job["uuid"]; name = job["pluginName"]; in_png = job["in"]
    ozengine.init_engine()
    tmp = tempfile.mkdtemp(prefix="sbatch_")
    results = []
    for i, j in enumerate(job["jobs"]):
        motr = make_probe_motr(uuid, name, j["params"])
        doc = ozengine.load_doc(motr)
        op = os.path.join(tmp, "o%d.png" % i)
        try:
            ozengine.render_frame(doc, in_png, IMG_B, j.get("time", 0.0), op)
            results.append({"tag": j.get("tag"), "out": op})
        except Exception as e:
            results.append({"tag": j.get("tag"), "error": str(e)[:160]})
    json.dump({"results": results}, open(out_path, "w"))


if __name__ == "__main__":
    main()
