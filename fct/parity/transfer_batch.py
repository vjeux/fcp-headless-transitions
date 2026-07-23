#!/usr/bin/env python3
"""fct.parity.transfer_batch — WARM batched transfer probe (boots FCP ONCE).

The one-shot filter_probe.py cold-boots the FCP engine (~1.3s) per render, so a transfer
sweep of 100+ (uniform-input, params) combos took minutes. This boots ozengine ONCE and
renders every combo in the same process, then reports the center output colour of each —
cutting a transfer sweep ~10x. It builds the SAME synthetic single-filter .motr as
filter_probe (so it's the same isolation), just amortized.

Reads a JSON job on argv[1]:
  {"uuid","pluginName","jobs":[{"params":[{name,id,value}|{name,id,children:[...]}],
                                "in":"/abs/uniform.png","tag":"..."}]}
Writes JSON results to argv[2]:
  {"results":[{"tag","center":[r,g,b], "in_center":[r,g,b]}]}
Must run under venv python + DYLD (re-exec sentinel), like the driver.
"""
import os, sys, json, pathlib
REPO = pathlib.Path(__file__).resolve().parents[2]
_FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
_VENV_PY = str(REPO / "venv" / "bin" / "python3")
if not os.environ.get("_FCT_TRANSFER_REEXEC"):
    os.environ["DYLD_FRAMEWORK_PATH"] = _FW
    os.environ["FXPLUG_USE_PLUGINKIT"] = "1"
    os.environ["_FCT_TRANSFER_REEXEC"] = "1"
    os.environ["PYTHONPATH"] = str(REPO) + os.pathsep + os.environ.get("PYTHONPATH", "")
    os.chdir(str(REPO))
    os.execv(_VENV_PY, [_VENV_PY, "-u", str(REPO / "fct/parity/transfer_batch.py")] + sys.argv[1:])

import tempfile
import numpy as np
from PIL import Image
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "tools"))
import ozengine
from tools.re.filter_probe import make_probe_motr  # same synthetic .motr builder
from fct.config import IMG_B


def _center(path):
    a = np.asarray(Image.open(path).convert("RGBA"))
    H, W = a.shape[:2]
    patch = a[H // 2 - 20:H // 2 + 20, W // 2 - 20:W // 2 + 20, :3].reshape(-1, 3)
    return [round(float(x), 2) for x in patch.mean(0)]


def _center_alpha(path):
    a = np.asarray(Image.open(path).convert("RGBA"))
    H, W = a.shape[:2]
    patch = a[H // 2 - 20:H // 2 + 20, W // 2 - 20:W // 2 + 20, 3]
    return round(float(patch.mean()), 3)


def main():
    job = json.load(open(sys.argv[1]))
    out_path = sys.argv[2]
    uuid = job["uuid"]; name = job["pluginName"]
    ozengine.init_engine()
    tmp = tempfile.mkdtemp(prefix="tbatch_")
    results = []
    for i, j in enumerate(job["jobs"]):
        motr = make_probe_motr(uuid, name, j["params"])
        doc = ozengine.load_doc(motr)
        op = os.path.join(tmp, "o%d.png" % i)
        try:
            ozengine.render_frame(doc, j["in"], IMG_B, j.get("time", 0.0), op)
            center = _center(op)
        except Exception as e:
            results.append({"tag": j.get("tag"), "error": str(e)[:160]}); continue
        results.append({"tag": j.get("tag"), "center": center,
                        "center_alpha": _center_alpha(op),
                        "in_center": _center(j["in"])})
    json.dump({"results": results}, open(out_path, "w"))


if __name__ == "__main__":
    main()
