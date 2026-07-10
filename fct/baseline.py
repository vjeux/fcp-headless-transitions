"""fct.baseline — freeze and check the per-transition score baseline (the GATE).

The baseline is the committed source of truth for "known-good" scores: a JSON of
{slug: mean_psnr} for a given source, scored against the GUI GT. `fct regress`
re-scores the current frames and FAILS if any slug drops more than TOL below its
baseline — this is the gate every change must pass before commit.

    fct baseline <source>          # freeze current scores -> fct/baseline_<source>.json
    fct regress  <source>          # re-score, diff vs baseline, exit 1 on any regression

Truth is ALWAYS the GUI GT (fct.score). There is no headless-vs-headless path.
"""
import os, json
from .config import SLUGS, REPO
from .score import score

TOL = 0.30  # dB a slug may drop below baseline before it counts as a regression

def _baseline_path(source: str) -> str:
    return os.path.join(REPO, "fct", f"baseline_{source}.json")

def freeze(source: str = "headless") -> dict:
    """Score every slug and write the baseline file. Returns {slug: mean}."""
    data = {s: score(s, source)["mean"] for s in SLUGS}
    with open(_baseline_path(source), "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
    return data

def regress(source: str = "headless") -> dict:
    """Re-score every slug vs the frozen baseline. Returns a report dict with
    'regressions' (slug -> (baseline, current, delta)) and 'ok' (bool)."""
    p = _baseline_path(source)
    if not os.path.exists(p):
        raise FileNotFoundError(f"no baseline for {source} — run `fct baseline {source}` first")
    base = json.load(open(p))
    regressions, improvements = {}, {}
    for s in SLUGS:
        cur = score(s, source)["mean"]
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
            "tol": TOL, "n": len(base)}
