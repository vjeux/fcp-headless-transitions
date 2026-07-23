#!/usr/bin/env python3
"""fct/subswarm/runner.py — run ONE subsystem's capability pack against headless FCP.

Each pack node is a synthetic single-primitive scene (built by builders.py) rendered through
BOTH headless FCP (ozengine) and the TS engine (_scene_render.ts), then PSNR-compared. This
is the per-node FCP oracle — NO 65-slug suite, NO shared baseline/frames, so it is fast and
race-free. Results are written to fct/subswarm/results/<subsystem>.json (on disk, so an
agent survives compaction and the orchestrator can read a scoreboard).

Self-re-execs under the venv python with DYLD set (headless FCP needs it; SIP strips DYLD
from spawned children) — same pattern as probe_scene.py / fct/cli.py.
"""
import os, sys, json, time, tempfile, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if REPO not in sys.path:
    sys.path.insert(0, REPO)
FRAMEWORKS = "/Applications/Final Cut Pro.app/Contents/Frameworks"
VENV_PY = os.path.join(REPO, "venv", "bin", "python3")
PACKS = os.path.join(REPO, "fct", "subswarm", "packs")
RESULTS = os.path.join(REPO, "fct", "subswarm", "results")

def _reexec():
    need = (os.environ.get("DYLD_FRAMEWORK_PATH") != FRAMEWORKS
            or os.path.realpath(sys.executable) != os.path.realpath(VENV_PY))
    if need and os.path.exists(VENV_PY):
        os.environ["DYLD_FRAMEWORK_PATH"] = FRAMEWORKS
        os.environ["PYTHONPATH"] = REPO
        os.execv(VENV_PY, [VENV_PY, "-u", os.path.abspath(__file__)] + sys.argv[1:])

def load_pack(subsystem):
    p = os.path.join(PACKS, f"{subsystem}.json")
    if not os.path.exists(p):
        raise SystemExit(f"no pack for subsystem {subsystem!r} at {p}")
    return json.load(open(p))

def run_case(spec, keep=False):
    """Render one pack node through headless FCP + TS engine; return PSNR + diagnostics.
    Uses fct/subswarm/builders.py so the perspective pack can request a Camera node."""
    import numpy as np
    from PIL import Image
    sys.path.insert(0, os.path.join(REPO, "tools"))
    import ozengine
    from fct.config import IMG_A, IMG_B
    import fct.subswarm.builders as B

    motr = B.build(spec["inject"])
    tsec = float(spec.get("time", 0.0))
    tmp = tempfile.mkdtemp(prefix="subsw_")
    head_png = os.path.join(tmp, "headless.png"); ts_png = os.path.join(tmp, "ts.png")

    doc = ozengine.load_doc(motr)
    rc = ozengine.render_frame(doc, IMG_A, IMG_B, tsec, head_png)
    if rc != 0:
        return {"error": f"headless rc={rc}"}

    env = dict(os.environ, FCT_MOTR=motr, FCT_TIME=str(tsec), FCT_OUT=ts_png)
    r = subprocess.run(["node_modules/.bin/tsx", "test/_scene_render.ts"],
                       cwd=os.path.join(REPO, "engine"), env=env,
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode != 0:
        return {"error": "ts render failed: " + r.stderr.decode()[-300:]}

    h4 = np.asarray(Image.open(head_png).convert("RGBA")).astype(float)
    t4 = np.asarray(Image.open(ts_png).convert("RGBA")).astype(float)
    if h4.shape != t4.shape:
        t4 = np.asarray(Image.open(ts_png).convert("RGBA").resize(
            (h4.shape[1], h4.shape[0]), Image.LANCZOS)).astype(float)
    h, t = h4[:, :, :3], t4[:, :, :3]
    mse = float(((h - t) ** 2).mean())
    psnr = 99.0 if mse < 1e-9 else 10 * np.log10(255 * 255 / mse)
    a_in = np.asarray(Image.open(os.path.join(REPO, "engine", "test", "start.png"))
                      .convert("RGBA").resize((h4.shape[1], h4.shape[0]), Image.LANCZOS)).astype(float)
    hvi = float(np.abs(h4 - a_in).mean())
    res = {"psnr": round(psnr, 2), "mean_abs_err": round(float(np.abs(h - t).mean()), 2),
           "headless_vs_input_mad": round(hvi, 2)}
    if keep:
        res["headless_png"] = head_png; res["ts_png"] = ts_png; res["motr"] = motr
    else:
        try: os.remove(motr)
        except OSError: pass
    return res

def run(subsystem, only=None, keep=False, quiet=False):
    pack = load_pack(subsystem)
    caps = [c for c in pack if not only or c["cap"] in only]
    out = {"subsystem": subsystem, "ran_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "nodes": []}
    npass = nfail = 0
    for c in caps:
        # Skip caps whose oracle is documented-invalid (e.g. headless != GUI for a
        # bare-camera plane fold — the GUI, the ONE truth, composites orthographically
        # while headless folds perspectively; matching headless would regress the real
        # GUI slugs). These are recorded, not run, so an agent never chases a phantom.
        if c.get("oracle", "").startswith("INVALID"):
            rec = {"cap": c["cap"], "status": "SKIP", "oracle": c["oracle"]}
            out["nodes"].append(rec)
            if not quiet:
                print(f"  {c['cap']:34s} [SKIP] oracle={c['oracle']} (see pack note)")
            continue
        res = run_case(c, keep=keep)
        mp = c.get("min_psnr", 34)
        rec = {"cap": c["cap"], "min_psnr": mp, **res}
        if "error" in res:
            rec["status"] = "ERROR"; nfail += 1
            if not quiet: print(f"  {c['cap']:34s} ERROR {res['error']}")
        else:
            expect_identity = bool(c.get("expect_identity"))
            applied = expect_identity or res["headless_vs_input_mad"] >= 1.0
            ok = bool(res["psnr"] >= mp and applied)
            rec["status"] = "PASS" if ok else "FAIL"; rec["applied"] = bool(applied)
            npass += int(ok); nfail += int(not ok)
            warn = "" if applied else "  (headless==input: inject IGNORED — schema bug)"
            if not quiet:
                print(f"  {c['cap']:34s} psnr={res['psnr']:5.2f} mae={res['mean_abs_err']:5.2f} "
                      f"hvi={res['headless_vs_input_mad']:5.1f} [{rec['status']}]{warn}")
                if keep and "headless_png" in res:
                    print(f"       kept: headless={res['headless_png']} ts={res['ts_png']} motr={res['motr']}")
        out["nodes"].append(rec)
    out["pass"] = npass; out["fail"] = nfail
    os.makedirs(RESULTS, exist_ok=True)
    json.dump(out, open(os.path.join(RESULTS, f"{subsystem}.json"), "w"), indent=2)
    if not quiet:
        print(f"\n[{subsystem}] TOTAL: {npass} pass, {nfail} fail  "
              f"(results -> fct/subswarm/results/{subsystem}.json)")
    return 1 if nfail else 0

def main(argv):
    _reexec()
    if not argv:
        print("usage: runner.py <subsystem> [cap-id ...] [--keep] [--quiet]"); return 2
    subsystem = argv[0]
    only = [a for a in argv[1:] if not a.startswith("--")]
    keep = "--keep" in argv; quiet = "--quiet" in argv
    return run(subsystem, only=only or None, keep=keep, quiet=quiet)

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
