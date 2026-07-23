"""Render a headless CloudsV2 solo frame at t=0 (generator scenenode) and dump its luma to disk.
Replicates the faithful driver's UNCONDITIONAL python->python re-exec so dyld honors DYLD_FRAMEWORK_PATH
(bash-launched python has DYLD_* stripped by SIP; only an execv from another python is honored)."""
import os, sys, pathlib
REPO = pathlib.Path(__file__).resolve().parents[1]
_FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
_VENV_PY = str(REPO / "venv" / "bin" / "python3")
if not os.environ.get("_CLOUDS_GT_REEXEC"):
    os.environ["DYLD_FRAMEWORK_PATH"] = _FW
    os.environ["FXPLUG_USE_PLUGINKIT"] = "1"
    os.environ["_CLOUDS_GT_REEXEC"] = "1"
    os.environ["PYTHONPATH"] = str(REPO) + os.pathsep + os.environ.get("PYTHONPATH", "")
    os.chdir(str(REPO))
    os.execv(_VENV_PY, [_VENV_PY, "-u", os.path.abspath(__file__)] + sys.argv[1:])

import json, tempfile, traceback
sys.path.insert(0, str(REPO)); sys.path.insert(0, str(REPO / "tools"))
import numpy as np
from PIL import Image
from fct.faithful import synth
from fct import config
import ozengine

def main():
    prims = json.load(open(REPO / "fct/faithful/catalog.json"))["primitives"]
    p = [e for e in prims if e["id"] == "PAECloudsV"][0]
    plugin = p.get("plugin_name", "PAECloudsV2"); host0 = p["host_slugs"][0]
    print("plugin", plugin, "host", host0, flush=True)
    sbase = synth.build(plugin, config.slug_motr(host0), is_generator=True)
    if sbase is None:
        print("synth.build None"); return
    tmp = tempfile.mkdtemp(prefix="cloudsgt_")
    mp = os.path.join(tmp, "clouds.motr"); open(mp, "w").write(sbase)
    op = "/tmp/clouds_headless_t0.png"
    ozengine.init_engine()
    doc = ozengine.load_doc(mp)
    print("doc loaded", flush=True)
    ozengine.render_frame(doc, config.IMG_A, config.IMG_B, 0.0, op)
    im = np.asarray(Image.open(op).convert("RGB")).astype(float)
    g = im[:, :, 1]
    ch = np.corrcoef(g[:, :-1].ravel(), g[:, 1:].ravel())[0, 1]
    cv = np.corrcoef(g[:-1, :].ravel(), g[1:, :].ravel())[0, 1]
    print("shape", im.shape, "mean", im.mean(axis=(0,1)).round(1),
          "lag1corr H=%.3f V=%.3f" % (ch, cv), flush=True)
    print("SMOOTH-Perlin" if ch > 0.5 else "not-smooth", flush=True)
    print("saved", op, flush=True)

if __name__ == "__main__":
    try: main()
    except Exception: traceback.print_exc()
