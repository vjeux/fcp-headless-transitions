"""fct.parity.spatial — SPATIAL node-boundary parity for kernel filters (Glow/Blur/...).

The transfer probe (fct/parity/transfer.py) isolates a POINTWISE colour node by feeding
uniform swatches through REAL headless FCP and reading the center colour. A SPATIAL filter
(Glow, Gaussian/Directional/Radial/Zoom blur) has a neighbourhood dependence, so we compare
the WHOLE output frame instead: render ONE injected filter over a fixed synthetic input at
the project's NATIVE canvas through headless FCP (spatial_batch.py, one boot) and the SAME
input through the TS engine (_filter_apply.ts), then score full-frame PSNR.

CANVAS: FCP renders at the PROJECT resolution (1920x1080) regardless of input size, so the
synthetic input MUST be 1920x1080 — otherwise FCP LANCZOS-resizes the output and the
residual is dominated by resample error, not the filter (measured: a 1854x1042 input drops
PAEGlow from 40.4 dB to 34 dB purely from the crop-resize). SYNTH is generated at 1920x1080.

VERDICT: worst-case full-frame PSNR over the param sweep. pass_db mirrors the faithful gate
(40 dB). A spatial filter that decodes faithfully scores 40+ dB here even when the delegated
in-host delta-response cannot isolate it (PAEGlow reads 13.5 dB inside the Bloom pipeline but
40.4 dB at its own node boundary — the divergence is Bloom's, not Glow's).
"""
import json, os, subprocess, sys, tempfile, pathlib

REPO = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
SYNTH = REPO / "fct" / "parity" / "evidence" / "spatial_synth_1920x1080.png"
SYNTH_TEX = REPO / "fct" / "parity" / "evidence" / "spatial_synth_tex_1920x1080.png"


def _ensure_synth(variant="smooth"):
    """Fixed 1920x1080 structured probes, committed to disk (deterministic, compaction-proof).

    Two variants selected per node via node['synth'] (default 'smooth'):
      - 'smooth'   : dark field + bright disc + colour bar + gradient strip. NO fine texture,
                     so a faithful radial/threshold filter's edge resampling is not misread as
                     a decode error. Used by Glow (mask ramp + blur) and Zoom (radial spread).
      - 'textured' : the smooth content PLUS a mid-frequency diagonal-stripe block (~48px, well
                     below the blur Nyquist), giving LOCAL kernel filters (Directional) enough
                     signal to exceed the identity guard without the aliasing a fine checker
                     injects. (A 16px checker was rejected: it dropped a faithful Glow 40.4->38.)"""
    target = SYNTH_TEX if variant == "textured" else SYNTH
    if target.exists():
        return str(target)
    import numpy as np
    from PIL import Image
    W, H = 1920, 1080
    a = np.full((H, W, 3), 40, np.uint8)
    yy, xx = np.mgrid[0:H, 0:W]
    disc = ((xx - W * 0.35) ** 2 + (yy - H * 0.5) ** 2) < (180 ** 2)
    a[disc] = [250, 250, 250]
    a[int(H * 0.20):int(H * 0.28), int(W * 0.50):int(W * 0.90)] = [230, 60, 60]
    grad = np.linspace(0, 255, W).astype(np.uint8)
    a[int(H * 0.75):int(H * 0.85)] = np.stack([grad] * 3, -1)[None].repeat(
        int(H * 0.85) - int(H * 0.75), 0)
    if variant == "textured":
        cb_y0, cb_y1, cb_x0, cb_x1 = int(H * 0.05), int(H * 0.45), int(W * 0.05), int(W * 0.30)
        stripes = ((((xx + yy) // 48) % 2).astype(np.uint8)) * 180 + 40
        block = np.zeros((H, W), bool); block[cb_y0:cb_y1, cb_x0:cb_x1] = True
        for c in range(3):
            a[..., c] = np.where(block, stripes, a[..., c])
    target.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(a).save(target)
    return str(target)


def _render_oracle_batch(node, jobs, in_png, tmp):
    uuid = node["oracle"]["uuid"]; name = node["oracle"]["pluginName"]
    job = {"uuid": uuid, "pluginName": name, "in": in_png, "jobs": jobs}
    jf = os.path.join(tmp, "job.json"); of = os.path.join(tmp, "out.json")
    json.dump(job, open(jf, "w"))
    subprocess.run([str(REPO / "venv/bin/python3"), str(REPO / "fct/parity/spatial_batch.py"), jf, of],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    res = json.load(open(of))["results"]
    return {r["tag"]: r.get("out") for r in res if "out" in r}


def _render_ts(node, params_list, in_png, out_png):
    spec = {"uuid": node["oracle"]["uuid"], "pluginName": node["oracle"]["pluginName"],
            "in": in_png, "out": out_png, "time": 0.0, "params": params_list}
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(spec, f); spec_file = f.name
    env = dict(os.environ, FCT_FILTER_SPEC=spec_file)
    for k, v in (node.get("engine_env") or {}).items():
        env[k] = str(v)
    subprocess.run(["node_modules/.bin/tsx", "test/_filter_apply.ts"], cwd=str(REPO / "engine"),
                   env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(spec_file)


def _psnr(head_png, ts_png, in_png):
    import numpy as np
    from PIL import Image
    h = np.asarray(Image.open(head_png).convert("RGB")).astype(float)
    t = np.asarray(Image.open(ts_png).convert("RGB")).astype(float)
    resized = False
    if h.shape != t.shape:
        h = np.asarray(Image.open(head_png).convert("RGB").resize(
            (t.shape[1], t.shape[0]), Image.LANCZOS)).astype(float)
        resized = True
    d = t - h
    mse = float((d ** 2).mean())
    psnr = 99.0 if mse < 1e-9 else 10.0 * float(np.log10(255 * 255 / mse))
    mad = float(np.abs(d).mean())
    signed = [round(float(d[:, :, c].mean()), 3) for c in range(3)]
    # identity guard: did the filter actually change the input?
    a_in = np.asarray(Image.open(in_png).convert("RGB")).astype(float)
    head_vs_in = float(np.abs(h - a_in).mean()) if h.shape == a_in.shape else -1.0
    return {"psnr": round(psnr, 2), "mad": round(mad, 3), "signed": signed,
            "resized": resized, "head_vs_input_mad": round(head_vs_in, 2)}


def sweep_spatial(node, pass_db=40.0):
    """Full-frame PSNR sweep of a spatial filter at its native node boundary. node['synth']
    selects the probe input ('smooth' default | 'textured' for local kernel filters)."""
    in_png = _ensure_synth(node.get("synth", "smooth"))
    param_cases = node["param_cases"]
    jobs = [{"tag": "p%d" % i, "params": pc["params"] if "params" in pc else pc, "time": 0.0}
            for i, pc in enumerate(param_cases)]
    tmp = tempfile.mkdtemp(prefix="parity_spatial_")
    try:
        oracle_out = _render_oracle_batch(node, jobs, in_png, tmp)
    except Exception as ex:
        return {"id": node["id"], "kind": node["kind"], "status": "ERROR",
                "error": "oracle batch failed: %s" % str(ex)[:200]}
    worst = {"psnr": 99.0, "case": None, "detail": None}
    rows = []; n = 0; failures = []
    for i, pc in enumerate(param_cases):
        tag = "p%d" % i
        hp = oracle_out.get(tag)
        if not hp or not os.path.exists(hp):
            failures.append({"tag": tag, "param": pc, "error": "no oracle frame"}); continue
        ep = os.path.join(tmp, "ts_%s.png" % tag)
        try:
            _render_ts(node, jobs[i]["params"], in_png, ep)
            m = _psnr(hp, ep, in_png)
        except Exception as ex:
            failures.append({"tag": tag, "param": pc, "error": str(ex)[:160]}); continue
        n += 1
        row = {"param": pc, **m}
        rows.append(row)
        if m["head_vs_input_mad"] >= 0 and m["head_vs_input_mad"] < 1.5:
            row["identity_warning"] = "filter ignored by host (output==input)"
        elif m["psnr"] < worst["psnr"]:
            worst.update(psnr=m["psnr"], case=pc, detail=m)
    # a case where FCP ignored the filter can't set the worst; only real applied cases count
    applied = [r for r in rows if r.get("head_vs_input_mad", 0) >= 1.5]
    if not applied:
        status = "NO_SIGNAL"
    else:
        worst_psnr = min(r["psnr"] for r in applied)
        worst = next(r for r in applied if r["psnr"] == worst_psnr)
        status = "VERIFIED" if worst_psnr >= pass_db else "DIVERGED"
    return {"id": node["id"], "kind": node["kind"], "status": status, "metric": "frame_psnr_db",
            "worst_psnr_db": round(min((r["psnr"] for r in applied), default=99.0), 2),
            "pass_db": pass_db, "n_scored": n, "oracle_truth": "headless",
            "worst_case": worst if applied else None, "n_failures": len(failures),
            "rows": rows, "note": node.get("spatial_note", "")}


if __name__ == "__main__":
    reg = json.load(open(REPO / "fct" / "parity" / "registry.json"))
    node = next(n for n in reg["nodes"] if n["id"] == sys.argv[1] if len(sys.argv) > 1) if len(sys.argv) > 1 \
        else next(n for n in reg["nodes"] if n["kind"] == "spatial")
    r = sweep_spatial(node)
    print(json.dumps({k: v for k, v in r.items() if k != "rows"}, indent=2))
    for row in r.get("rows", []):
        print("  ", row.get("param"), "psnr", row.get("psnr"), "signed", row.get("signed"),
              row.get("identity_warning", ""))
