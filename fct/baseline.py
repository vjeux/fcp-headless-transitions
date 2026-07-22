"""fct.baseline — freeze and check the per-transition score baseline (the GATE).

The baseline is the committed source of truth for "known-good" scores: a JSON of
{slug: mean_psnr} for a given source, scored against the GUI GT. `fct regress`
re-scores the current frames and FAILS if any slug drops more than TOL below its
baseline — this is the gate every change must pass before commit.

    fct baseline <source>          # freeze current scores -> fct/baseline_<source>.json
    fct regress  <source>          # re-score, diff vs baseline, exit 1 on any regression

Both freeze and regress score at GATE_SIZE (a small fixed resolution with a cached
GUI-GT thumbnail) so the gate is FAST and slug-uniform — the whole point of a gate
is that it's cheap enough to run on every change. Truth is ALWAYS the GUI GT.
"""
import os, json, time
from .config import SLUGS, REPO
from .score import score, GATE_SIZE

TOL = 0.30  # dB a slug may drop below baseline before it counts as a regression

def _baseline_path(source: str) -> str:
    return os.path.join(REPO, "fct", f"baseline_{source}.json")

def freeze(source: str = "engine") -> dict:
    """Score every slug at GATE_SIZE and write the baseline file. Returns {slug: mean}.
    Default source is "engine" (scored against the ground-truth reference = headless FCP;
    see fct.score.TRUTH). Freezing "headless" against a headless truth is degenerate."""
    data = {s: score(s, source, gate_size=GATE_SIZE)["mean"] for s in SLUGS}
    with open(_baseline_path(source), "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
    return data

def regress(source: str = "engine", verbose: bool = False) -> dict:
    """Re-score every slug vs the frozen baseline (at GATE_SIZE). Returns a report
    with 'regressions' (slug -> (baseline, current, delta)), 'improvements', 'ok',
    and per-slug 'timings' (seconds). Set verbose to print each slug's time live."""
    p = _baseline_path(source)
    if not os.path.exists(p):
        raise FileNotFoundError(f"no baseline for {source} — run `fct baseline {source}` first")
    base = json.load(open(p))
    regressions, improvements, timings = {}, {}, {}
    t_all = time.time()
    for s in SLUGS:
        t0 = time.time()
        cur = score(s, source, gate_size=GATE_SIZE)["mean"]
        dt = time.time() - t0
        timings[s] = round(dt, 3)
        if verbose:
            print(f"  {dt:5.2f}s  {s}  {cur}", flush=True)
        b = base.get(s)
        if b is None:
            continue
        delta = round(cur - b, 2)
        if delta < -TOL:
            regressions[s] = (b, cur, delta)
        elif delta > TOL:
            improvements[s] = (b, cur, delta)
    return {"source": source, "ok": len(regressions) == 0,
            "regressions": regressions, "improvements": improvements,
            "tol": TOL, "n": len(base), "timings": timings,
            "total_sec": round(time.time() - t_all, 2)}
