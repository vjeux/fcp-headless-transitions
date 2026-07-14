"""fct.minimize_gate — the GATE for MINIMIZED test cases (fct/minimized/<case>/).

A minimized case is a reduced .motr (produced by `fct minimize`) plus its rendered
`headless/` (real FCP = truth for that reduced input) and `engine/` frames. The
minimized gate scores ENGINE-vs-HEADLESS on the reduced case — i.e. how far our engine
is from FCP's ACTUAL output on the exact reduced input. Both are sRGB, so no bt709
conform (unlike the GUI-GT gate). Progress = raising these toward 99 dB (pixel-perfect
== engine reproduces FCP on the reduced case).

WHY this is a legitimate, NON-circular objective (and does NOT violate one-truth):
  The one-truth rule bans using headless as a stand-in for the GUI GT when scoring the
  65 SHIPPED transitions (that hid real bugs behind a fake ceiling). Here the target is
  different: a minimized case is a DELTA-DEBUG REPRO whose whole purpose is "our code
  diverges from FCP's code on these specific nodes". headless IS FCP's code; matching it
  on the reduced input is exactly the fix. The GUI-GT gate on the full transitions stays
  the release truth. These two gates are complementary: minimized cases localise the bug;
  the GUI-GT gate confirms the fix helps the shipped transition.

COMMANDS (dispatched from fct/cli.py):
  fct min-gen [case ...|--all]     re-render engine/ for each case from case.motr (headless/
                                   is FCP truth, frozen at minimize time — not re-rendered)
  fct min-score [case ...|--all]   print engine-vs-headless mean PSNR per case (+ per frame)
  fct min-baseline                 freeze fct/baseline_minimized.json {case: mean_psnr}
  fct min-regress                  re-score; FAIL (exit 1) if any case drops > TOL below
                                   baseline (a fix must never make a reduced case WORSE)
"""
import os, sys, json, subprocess
import numpy as np
from .config import REPO, N_FRAMES
from .read import read_frame
from .compare import _psnr

MINIMIZED_DIR = os.path.join(REPO, "fct", "minimized")
BASELINE = os.path.join(REPO, "fct", "baseline_minimized.json")
GATE_SIZE = (480, 270)
TOL = 0.30


def _cases(names=None):
    if not os.path.isdir(MINIMIZED_DIR):
        return []
    all_cases = sorted(d for d in os.listdir(MINIMIZED_DIR)
                       if os.path.isdir(os.path.join(MINIMIZED_DIR, d))
                       and os.path.exists(os.path.join(MINIMIZED_DIR, d, "case.motr")))
    if names:
        want = set(names)
        return [c for c in all_cases if c in want]
    return all_cases


def _case_nframes(case):
    m = os.path.join(MINIMIZED_DIR, case, "manifest.json")
    if os.path.exists(m):
        try:
            return json.load(open(m)).get("nframes", N_FRAMES)
        except Exception:
            pass
    return N_FRAMES


def _score_case(case):
    """Mean engine-vs-headless PSNR over the case's frames (both sRGB, no conform)."""
    cd = os.path.join(MINIMIZED_DIR, case)
    hd, ed = os.path.join(cd, "headless"), os.path.join(cd, "engine")
    n = _case_nframes(case)
    per = []
    for i in range(n):
        hp = os.path.join(hd, f"frame_{i:04d}.jpg")
        ep = os.path.join(ed, f"frame_{i:04d}.jpg")
        if not os.path.exists(hp):
            continue
        h = read_frame(hp, size=GATE_SIZE)
        e = read_frame(ep, size=GATE_SIZE)
        per.append(round(_psnr(h, e), 2))
    mean = round(float(np.mean(per)), 2) if per else 0.0
    return {"case": case, "mean": mean, "frames": per, "n": len(per)}


def _gen_engine(case):
    """Re-render the ENGINE frames for a case from its case.motr (headless/ is frozen
    FCP truth). Symlinks the source .motr's siblings so bundled Media/ resolves, then
    renders 24 frames via the committed engine/test/_fct_render.ts."""
    import tempfile, shutil
    cd = os.path.join(MINIMIZED_DIR, case)
    man = json.load(open(os.path.join(cd, "manifest.json")))
    src = man.get("source_motr")
    n = man.get("nframes", N_FRAMES)
    ed = os.path.join(cd, "engine")
    os.makedirs(ed, exist_ok=True)
    # Work dir with sibling symlinks + the case.motr, so the engine resolves textures.
    work = tempfile.mkdtemp(prefix="mingen_")
    if src and os.path.exists(src):
        srcdir = os.path.dirname(os.path.abspath(src))
        for name in os.listdir(srcdir):
            if name.endswith(".motr"):
                continue
            try: os.symlink(os.path.join(srcdir, name), os.path.join(work, name))
            except OSError: pass
    wm = os.path.join(work, "case.motr")
    shutil.copy(os.path.join(cd, "case.motr"), wm)
    smap = os.path.join(work, "_slugmap.json")
    json.dump({"_min": wm}, open(smap, "w"))
    env = dict(os.environ, FCT_SLUG="_min", FCT_OUT=ed, FCT_N=str(n),
               FCT_EXT="jpg", FCT_QUALITY="90", FCT_SLUGMAP=smap)
    subprocess.run(["node_modules/.bin/tsx", "test/_fct_render.ts"],
                   cwd=os.path.join(REPO, "engine"), env=env, check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    shutil.rmtree(work, ignore_errors=True)


def run(cmd, argv):
    names = [a for a in argv if not a.startswith("--")]
    if "--all" in argv or not names:
        names = None

    if cmd == "min-gen":
        cases = _cases(names)
        if not cases:
            print("no minimized cases (run `fct minimize <slug>` first)"); return 1
        for c in cases:
            _gen_engine(c)
            r = _score_case(c)
            print(f"OK {c}: engine-vs-FCP {r['mean']} dB")
        return 0

    if cmd == "min-score":
        cases = _cases(names)
        if not cases:
            print("no minimized cases"); return 1
        for c in cases:
            r = _score_case(c)
            worst = min(r["frames"]) if r["frames"] else 0.0
            print(f"{c:40} mean {r['mean']:6.2f} dB  worst {worst:6.2f}  (n={r['n']})")
        return 0

    if cmd == "min-baseline":
        cases = _cases(None)
        data = {c: _score_case(c)["mean"] for c in cases}
        json.dump(data, open(BASELINE, "w"), indent=2, sort_keys=True)
        print(f"froze {len(data)} minimized-case baselines -> {os.path.relpath(BASELINE, REPO)}")
        for c, v in sorted(data.items()):
            print(f"  {c:40} {v:6.2f} dB")
        return 0

    if cmd == "min-regress":
        if not os.path.exists(BASELINE):
            print("no minimized baseline — run `fct min-baseline` first"); return 1
        base = json.load(open(BASELINE))
        regressions, improvements = {}, {}
        for c in _cases(None):
            cur = _score_case(c)["mean"]
            b = base.get(c)
            if b is None:
                continue
            d = round(cur - b, 2)
            if d < -TOL:
                regressions[c] = (b, cur, d)
            elif d > TOL:
                improvements[c] = (b, cur, d)
        for c, (b, cur, d) in sorted(improvements.items()):
            print(f"  ↑ {c}: {b} -> {cur} ({d:+.2f} dB)")
        if regressions:
            print(f"REGRESSION ({len(regressions)} minimized case(s) dropped > {TOL} dB):")
            for c, (b, cur, d) in sorted(regressions.items()):
                print(f"  ↓ {c}: {b} -> {cur} ({d:+.2f} dB)")
            return 1
        print(f"OK — {len(_cases(None))} minimized cases, 0 regressions"
              + (f", {len(improvements)} improved" if improvements else ""))
        return 0

    print(f"unknown min gate command {cmd}"); return 1
