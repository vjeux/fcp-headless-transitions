#!/usr/bin/env python3
"""tools/re/filter_verify.py — Phase-2 filter fidelity check (committed tool).

Renders ONE filter two ways and compares:
  (a) headless FCP  : tools/re/filter_probe.py -> filter(imageA) via the REAL engine
  (b) TS engine     : engine/test/_filter_apply.ts -> the registered TS filter on A
and reports mean|err| / PSNR between them. This validates a TS filter primitive
against FCP itself across arbitrary params (the 65 built-in transitions only cover a
sliver of each filter's param space). headless-vs-TS on a synthetic single-filter
scene is a legitimate Phase-2 check — the headless IS FCP — distinct from the banned
render-vs-render TS-*transition* scoring.

This replaces ad-hoc /tmp scratch scripts: everything the check needs lives here.

USAGE (spec is a small JSON, inline or file):
  filter_verify.py --spec '{"uuid":"2E4DBB0A-...","pluginName":"PAEBrightness",
      "params":[{"name":"Brightness","id":1,"value":2.0}]}'
  filter_verify.py --spec-file probe.json
Options: --time (scene time, default 0.0), --keep (keep intermediate PNGs).

The spec's params use the SAME shape the TS applier + headless probe both consume:
  [{"name","id","value"}] with optional "children":[...] for color groups.
"""
import os, sys, json, argparse, subprocess, tempfile

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRAMEWORKS = "/Applications/Final Cut Pro.app/Contents/Frameworks"
IMG_A_PNG = os.path.join(REPO, "engine", "test", "start.png")


def _probe_args(spec):
    """Pass the full params list as JSON so filter_probe handles arbitrary nesting."""
    return ["--uuid", spec["uuid"], "--name", spec["pluginName"],
            "--spec", json.dumps(spec.get("params", []))]


def run(spec, time=0.0, keep=False):
    tmp = tempfile.mkdtemp(prefix="fverify_")
    head_png = os.path.join(tmp, "headless.png")
    ts_png = os.path.join(tmp, "ts.png")

    # (a) headless FCP
    env = dict(os.environ, PYTHONPATH=REPO, DYLD_FRAMEWORK_PATH=FRAMEWORKS)
    subprocess.run([sys.executable, os.path.join(REPO, "tools/re/filter_probe.py"),
                    *_probe_args(spec), "--time", str(time), "--out", head_png],
                   env=env, check=True, cwd=REPO,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # (b) TS engine
    ts_spec = dict(spec, **{"in": IMG_A_PNG, "out": ts_png, "time": time})
    spec_file = os.path.join(tmp, "spec.json")
    json.dump(ts_spec, open(spec_file, "w"))
    subprocess.run(["node_modules/.bin/tsx", "test/_filter_apply.ts"],
                   cwd=os.path.join(REPO, "engine"),
                   env=dict(os.environ, FCT_FILTER_SPEC=spec_file), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Compare. PRIMARY psnr is over RGB (the visible color result) so the existing
    # per-filter thresholds stay stable; alpha is scored SEPARATELY (alpha_psnr) because
    # alpha-modifying filters (Luma Keyer) carry their whole effect in the matte while
    # geometry filters (polar-remap blurs) legitimately differ in edge transparency that
    # is irrelevant to their color match. Callers that care about the matte read
    # alpha_psnr; the identity guard uses RGBA so an alpha-only keyer is not mis-flagged
    # as "ignored by the host".
    import numpy as np
    from PIL import Image
    h4 = np.asarray(Image.open(head_png).convert("RGBA")).astype(float)
    t4 = np.asarray(Image.open(ts_png).convert("RGBA")).astype(float)
    if h4.shape != t4.shape:
        h4 = np.asarray(Image.open(head_png).convert("RGBA").resize(
            (t4.shape[1], t4.shape[0]), Image.LANCZOS)).astype(float)
    h = h4[:, :, :3]; t = t4[:, :, :3]
    err = float(np.abs(h - t).mean())
    mse = float(((h - t) ** 2).mean())
    psnr = 99.0 if mse < 1e-9 else 10 * np.log10(255 * 255 / mse)
    amse = float(((h4[:, :, 3] - t4[:, :, 3]) ** 2).mean())
    alpha_psnr = 99.0 if amse < 1e-9 else 10 * np.log10(255 * 255 / amse)
    # IDENTITY GUARD: if the HEADLESS output equals the input image within JPEG noise,
    # the host silently ignored the injected filter (wrong factoryID / param ids /
    # nesting) and this comparison is meaningless — a high PSNR here would only mean
    # "the TS filter also happened to be near-identity", not that it matches FCP. Flag
    # it so a probe result is never trusted as a fidelity reference by accident.
    # Measured over RGBA so an alpha-only keyer is correctly seen as "applied".
    a_in = np.asarray(Image.open(IMG_A_PNG).convert("RGBA").resize(
        (h4.shape[1], h4.shape[0]), Image.LANCZOS)).astype(float)
    head_vs_input = float(np.abs(h4 - a_in).mean())


    res = {"mean_abs_err": round(err, 2), "psnr": round(psnr, 2),
           "alpha_psnr": round(alpha_psnr, 2),
           "headless_mean": [round(x, 1) for x in h4.reshape(-1, 4).mean(0)],
           "ts_mean": [round(x, 1) for x in t4.reshape(-1, 4).mean(0)],
           "headless_vs_input_mad": round(head_vs_input, 2),
           "headless_png": head_png, "ts_png": ts_png}
    if head_vs_input < 1.5:
        res["identity_warning"] = ("headless output == input (filter IGNORED by host — "
                                   "check factoryID + param names/ids vs a real .motr); "
                                   "this PSNR is NOT a valid fidelity measurement")
    if not keep:
        for p in (head_png, ts_png, spec_file):
            try: os.remove(p)
            except OSError: pass
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec")
    ap.add_argument("--spec-file")
    ap.add_argument("--time", type=float, default=0.0)
    ap.add_argument("--keep", action="store_true")
    a = ap.parse_args()
    spec = json.load(open(a.spec_file)) if a.spec_file else json.loads(a.spec)
    res = run(spec, a.time, a.keep)
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
