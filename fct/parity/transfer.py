"""fct.parity.transfer — EXACT per-pixel transfer-function parity for pointwise color nodes.

THE INSIGHT (validated 2026-07-22): a per-pixel color filter (Brightness/Levels/Colorize/
HSV/Tint/ChannelMixer) computes out_pixel = f(in_pixel, params) with NO spatial/neighbourhood
dependence. So its computation can be isolated EXACTLY — independent of the pipeline that
made the earlier delta-response verdicts unattributable — by feeding UNIFORM-COLOUR input
images (which are conform-invariant: every pixel identical, so scaling/positioning can't
change the value) through REAL FCP and reading the single output colour. Sweeping input
colours builds the exact transfer function; comparing to the TS filter's output on the same
uniform input verifies the node's per-pixel math to within quantisation.

Why this beats the delta-response for pointwise colour nodes:
- The delta-response measures the whole animated/stacked pipeline; a constant pipeline error
  cancels but a VARYING one (drop-zone conform interacting with source content, JPEG source
  offset) does not — so colour nodes read DIVERGED at 5-13 dB even when their per-pixel math
  is EXACT. Proven: PAEBrightness delta-ddb=6.0 (DIVERGED) but its transfer function is a
  perfect sRGB multiply match (32->64, 64->128, 128->255 at 2x; identity at 1x).
- A uniform input removes ALL spatial coupling: FCP's output is one colour, measured directly.
- It also sidesteps the headless-vs-GUI colour-management gap for the IDENTITY case (measured:
  brightness=1 returns the input unchanged, 32->32.2 .. 200->200.1), so any real transfer
  difference is the node's math, not export colour management.

This module renders a sweep of uniform inputs through REAL FCP (filter_probe) and the TS
filter (_filter_apply), and compares the per-channel transfer. VERIFIED when max abs channel
error <= tol_levels (default 2 code levels, i.e. quantisation).
"""
import json
import os
import subprocess
import sys
import tempfile
import pathlib

REPO = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"


def _make_solid(v, path):
    import numpy as np
    from PIL import Image
    img = np.zeros((256, 256, 4), np.uint8)
    img[:, :, 3] = 255
    img[:, :, 0] = v[0]; img[:, :, 1] = v[1]; img[:, :, 2] = v[2]
    Image.fromarray(img, "RGBA").save(path)


def _center_color(path):
    import numpy as np
    from PIL import Image
    a = np.asarray(Image.open(path).convert("RGBA"))
    H, W = a.shape[:2]
    patch = a[H // 2 - 20:H // 2 + 20, W // 2 - 20:W // 2 + 20, :3].reshape(-1, 3)
    return patch.mean(0)


def _render_oracle(uuid, name, params_arg, in_png, out_png):
    """One filter_probe render of a uniform input through REAL FCP."""
    env = dict(os.environ, PYTHONPATH=str(REPO), DYLD_FRAMEWORK_PATH=FW)
    subprocess.run([str(REPO / "venv/bin/python3"), str(REPO / "tools/re/filter_probe.py"),
                    "--uuid", uuid, "--name", name, *params_arg,
                    "--in-a", in_png, "--time", "0.0", "--out", out_png],
                   env=env, check=True, cwd=str(REPO),
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def _render_ts(uuid, name, ts_params, in_png, out_png):
    """One _filter_apply render of the same uniform input through the TS filter."""
    spec = {"uuid": uuid, "pluginName": name, "in": in_png, "out": out_png,
            "time": 0.0, "params": ts_params}
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(spec, f); spec_file = f.name
    subprocess.run(["node_modules/.bin/tsx", "test/_filter_apply.ts"],
                   cwd=str(REPO / "engine"),
                   env=dict(os.environ, FCT_FILTER_SPEC=spec_file), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(spec_file)


def sweep_transfer(node, inputs=None, tol_levels=2.0):
    """Measure the per-pixel transfer of a pointwise colour node in REAL FCP vs TS.
    node needs: oracle.uuid, oracle.pluginName, and `param_cases` (list of {probe params}).
    Returns a report dict."""
    import numpy as np
    uuid = node["oracle"]["uuid"]; name = node["oracle"]["pluginName"]
    inputs = inputs or [(16, 16, 16), (32, 32, 32), (64, 64, 64), (128, 128, 128),
                        (200, 200, 200), (240, 240, 240),
                        (200, 50, 50), (50, 200, 50), (50, 50, 200)]
    tmp = tempfile.mkdtemp(prefix="parity_transfer_")
    worst = {"abs": 0.0, "case": None, "input": None, "oracle": None, "engine": None}
    n = 0; rows = []; failures = []
    for pc in node["param_cases"]:
        probe_arg = ["--param", "%s:%d=%s" % (pc["name"], pc.get("id", 1), pc["value"])]
        ts_params = [{"name": pc["name"], "id": pc.get("id", 1), "value": pc["value"]}]
        for ci, col in enumerate(inputs):
            in_png = os.path.join(tmp, "in_%d_%d.png" % (id(pc) % 9999, ci))
            _make_solid(col, in_png)
            op = os.path.join(tmp, "o.png"); ep = os.path.join(tmp, "e.png")
            try:
                _render_oracle(uuid, name, probe_arg, in_png, op)
                _render_ts(uuid, name, ts_params, in_png, ep)
                oc = _center_color(op); ec = _center_color(ep)
            except Exception as ex:
                failures.append({"param": pc, "input": col, "error": str(ex)[:160]}); continue
            for ch in range(3):
                ae = abs(float(oc[ch]) - float(ec[ch])); n += 1
                if ae > worst["abs"]:
                    worst.update(abs=ae, case=pc, input=col, oracle=oc.round(1).tolist(),
                                 engine=ec.round(1).tolist())
            rows.append({"param": pc, "input": list(col),
                         "oracle": oc.round(1).tolist(), "engine": ec.round(1).tolist()})
    status = "DIVERGED" if worst["abs"] > tol_levels else ("VERIFIED" if n else "NO_SIGNAL")
    if failures and n == 0:
        status = "ERROR"
    return {"id": node["id"], "kind": "transfer", "status": status, "metric": "max_abs_levels",
            "max_abs_levels": worst["abs"], "n_samples": n, "tol_levels": tol_levels,
            "worst": {k: worst[k] for k in ("case", "input", "oracle", "engine")},
            "oracle_truth": node.get("oracle_truth", "transfer"),
            "n_failures": len(failures), "rows": rows[:40]}


if __name__ == "__main__":
    reg = json.load(open(REPO / "fct" / "parity" / "registry.json"))
    node = [n for n in reg["nodes"] if n["kind"] == "transfer"][0]
    r = sweep_transfer(node)
    print(json.dumps({k: v for k, v in r.items() if k != "rows"}, indent=2))
