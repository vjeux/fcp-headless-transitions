"""fct.parity.transfer — EXACT per-pixel transfer-function parity for pointwise colour nodes.

THE INSIGHT (validated 2026-07-22): a per-pixel colour filter (Brightness/Levels/Colorize/
HSV/Tint/ChannelMixer) computes out_pixel = f(in_pixel, params) with NO spatial dependence.
So its computation isolates EXACTLY — independent of the pipeline that made delta-response
verdicts unattributable — by feeding UNIFORM-COLOUR inputs (conform-invariant) through REAL
FCP and reading the single output colour. Sweeping input colours builds the exact transfer.

Proven: PAEBrightness read delta-ddb=6.0 (DIVERGED, unattributable) but the transfer test
shows it matches FCP exactly on gray and diverges cross-channel on saturated colours — a
precise, decoded RE lead. Also sidesteps the headless-vs-GUI colour-management gap for the
identity case (bright=1 returns input unchanged).

PERF: the oracle side boots FCP ONCE (transfer_batch.py) and renders every (uniform-input,
params) combo in that one process — ~10x faster than one-shot filter_probe per render.
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
    return [round(float(x), 2) for x in patch.mean(0)]


def _render_oracle_batch(node, combos, tmp):
    """Render ALL (input,params) combos through REAL FCP in ONE engine boot. combos is a
    list of (tag, in_png, params_list). Returns {tag: center_rgb}."""
    uuid = node["oracle"]["uuid"]; name = node["oracle"]["pluginName"]
    jobs = [{"tag": tag, "in": in_png, "params": params} for (tag, in_png, params) in combos]
    job = {"uuid": uuid, "pluginName": name, "jobs": jobs}
    jf = os.path.join(tmp, "job.json"); of = os.path.join(tmp, "out.json")
    json.dump(job, open(jf, "w"))
    subprocess.run([str(REPO / "venv/bin/python3"), str(REPO / "fct/parity/transfer_batch.py"), jf, of],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    res = json.load(open(of))["results"]
    return {r["tag"]: r.get("center") for r in res if "center" in r}


def _render_ts(node, params_list, in_png, out_png):
    spec = {"uuid": node["oracle"]["uuid"], "pluginName": node["oracle"]["pluginName"],
            "in": in_png, "out": out_png, "time": 0.0, "params": params_list}
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(spec, f); spec_file = f.name
    subprocess.run(["node_modules/.bin/tsx", "test/_filter_apply.ts"],
                   cwd=str(REPO / "engine"),
                   env=dict(os.environ, FCT_FILTER_SPEC=spec_file), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(spec_file)


def _params_for(pc):
    """A param_case entry -> the params list filter_probe/_filter_apply consume. Supports
    a flat {name,id,value} or a pre-built {'params':[...]} (for nested colour groups)."""
    if "params" in pc:
        return pc["params"]
    return [{"name": pc["name"], "id": pc.get("id", 1), "value": pc["value"]}]


def sweep_transfer(node, inputs=None, tol_levels=2.0):
    """Measure the per-pixel transfer of a pointwise colour node: REAL FCP (batched) vs TS."""
    inputs = inputs or [(16, 16, 16), (32, 32, 32), (64, 64, 64), (128, 128, 128),
                        (200, 200, 200), (240, 240, 240),
                        (200, 50, 50), (50, 200, 50), (50, 50, 200)]
    tmp = tempfile.mkdtemp(prefix="parity_transfer_")
    # build all combos, render oracle in ONE boot
    combos = []; combo_meta = []
    for pi, pc in enumerate(node["param_cases"]):
        params = _params_for(pc)
        for ci, col in enumerate(inputs):
            in_png = os.path.join(tmp, "in_%d_%d.png" % (pi, ci))
            _make_solid(col, in_png)
            tag = "p%d_c%d" % (pi, ci)
            combos.append((tag, in_png, params))
            combo_meta.append((tag, pc, col, params, in_png))
    try:
        oracle_out = _render_oracle_batch(node, combos, tmp)
    except Exception as ex:
        return {"id": node["id"], "kind": "transfer", "status": "ERROR",
                "error": "oracle batch failed: %s" % str(ex)[:200]}
    worst = {"abs": 0.0, "case": None, "input": None, "oracle": None, "engine": None}
    n = 0; rows = []; failures = []
    for (tag, pc, col, params, in_png) in combo_meta:
        oc = oracle_out.get(tag)
        if oc is None:
            failures.append({"tag": tag, "param": pc, "input": col, "error": "no oracle center"}); continue
        ep = os.path.join(tmp, "e_%s.png" % tag)
        try:
            _render_ts(node, params, in_png, ep)
            ec = _center_color(ep)
        except Exception as ex:
            failures.append({"tag": tag, "param": pc, "input": col, "error": str(ex)[:160]}); continue
        for ch in range(3):
            ae = abs(float(oc[ch]) - float(ec[ch])); n += 1
            if ae > worst["abs"]:
                worst.update(abs=ae, case=pc, input=list(col), oracle=oc, engine=ec)
        rows.append({"param": pc, "input": list(col), "oracle": oc, "engine": ec})
    status = "DIVERGED" if worst["abs"] > tol_levels else ("VERIFIED" if n else "NO_SIGNAL")
    if failures and n == 0:
        status = "ERROR"
    return {"id": node["id"], "kind": "transfer", "status": status, "metric": "max_abs_levels",
            "max_abs_levels": worst["abs"], "n_samples": n, "tol_levels": tol_levels,
            "worst": {k: worst[k] for k in ("case", "input", "oracle", "engine")},
            "oracle_truth": node.get("oracle_truth", "transfer"),
            "n_failures": len(failures), "rows": rows[:60]}


if __name__ == "__main__":
    reg = json.load(open(REPO / "fct" / "parity" / "registry.json"))
    node = [n for n in reg["nodes"] if n["kind"] == "transfer"][0]
    r = sweep_transfer(node)
    print(json.dumps({k: v for k, v in r.items() if k != "rows"}, indent=2))
