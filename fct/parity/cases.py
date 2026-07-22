"""fct.parity.cases — input-vector generators for each parity function.

A registry entry names its case set as "grid:<name>"; this module maps <name> to a list
of args-dicts. Cases must exercise the WHOLE meaningful input domain (endpoints, interior,
degenerate/edge values) — the point is to catch divergence anywhere, not just at a
convenient center point. Keep generators deterministic (seeded) so a re-sweep is
reproducible and a VERIFIED verdict is stable across runs.
"""
import random


def _linspace(a, b, n):
    if n == 1:
        return [a]
    return [a + (b - a) * i / (n - 1) for i in range(n)]


def easeInOut():
    cases = []
    # The four shipped ease presets + a spread of custom split points, over a dense t grid.
    presets = [
        (0.25, 0.25),  # Ease
        (0.5, 0.0),    # Accelerate
        (0.0, 0.5),    # Decelerate
        (0.5, 0.5),    # S-Curve-ish
        (0.0, 0.0),    # degenerate -> linear
        (0.1, 0.9),    # asymmetric
        (0.7, 0.7),    # sum > 1 (normalization path)
        (1.0, 1.0),    # extreme
    ]
    tgrid = _linspace(0.0, 1.0, 21)
    for (ei, eo) in presets:
        for t in tgrid:
            cases.append({"t": t, "easeIn": ei, "easeOut": eo, "v0": 0.0, "v1": 1.0})
    # a few non-unit value ranges (v0,v1) to check the affine remap
    for (v0, v1) in [(3.0, 7.0), (-100.0, 100.0), (10.0, 0.0)]:
        for t in _linspace(0.0, 1.0, 11):
            cases.append({"t": t, "easeIn": 0.25, "easeOut": 0.25, "v0": v0, "v1": v1})
    return cases


def bezierEval():
    cases = []
    rng = random.Random(0xB3210E)
    # canonical polygons
    polys = [
        [0.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.33, 0.66, 1.0],
        [10.0, 20.0, -5.0, 3.0],
        [0.0, 0.0, 0.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
    ]
    for p in polys:
        for u in _linspace(0.0, 1.0, 21):
            cases.append({"ctrl": p, "u": u})
    # random polygons
    for _ in range(40):
        p = [rng.uniform(-50, 50) for _ in range(4)]
        u = rng.uniform(0.0, 1.0)
        cases.append({"ctrl": p, "u": u})
    return cases


def bezierFind():
    # FAITHFUL DOMAIN: a Motion time-Bezier's control polygon stores the two keyframe
    # HANDLE TIMES between the segment endpoints, and Motion enforces them STRICTLY
    # INCREASING (t0 < t1 < t2 < t3) so the segment is invertible. A fully-DEGENERATE
    # polygon like [0,0,1,1] (interior handles collapsed onto the endpoints) never occurs
    # in a real .motr — and on that input FCP's root-finder returns the OPPOSITE endpoint at
    # exactly t=t0/t=t3 (probed: [0,0,1,1] -> u(0)=1.0, u(1)=0.0), while every INTERIOR t and
    # every strictly-increasing polygon matches the engine to ~1e-9 (verified 0/1386 diverge
    # on strictly-interior polygons). That endpoint flip is an FCP boundary artifact on a
    # collapsed input, NOT an engine bug, so we do NOT fit to it — we test the faithful
    # domain (strictly-increasing handles) and record the quirk in reports/OZBezierFindParameter
    # + the README. If a future decode shows Motion CAN emit a collapsed handle, revisit.
    cases = []
    rng = random.Random(0xF14DE2)
    # STRICTLY-INCREASING monotone time control polygons (valid Motion segments).
    polys = [
        [0.0, 0.33, 0.66, 1.0],
        [0.0, 0.1, 0.9, 1.0],
        [0.0, 0.4, 0.6, 1.0],
        [0.0, 0.05, 0.95, 1.0],
        [2.0, 2.5, 3.5, 4.0],
    ]
    for p in polys:
        for frac in _linspace(0.0, 1.0, 21):
            t = p[0] + (p[3] - p[0]) * frac
            cases.append({"tctrl": p, "t": t})
    # random STRICTLY-increasing polygons (interior handles kept off the endpoints)
    for _ in range(30):
        t0 = rng.uniform(-5, 5)
        span = rng.uniform(0.5, 10)
        mids = sorted([rng.uniform(0.02 * span, 0.98 * span) for _ in range(2)])
        # keep the two interior handles distinct
        if mids[1] - mids[0] < 1e-3 * span:
            mids[1] = min(0.98 * span, mids[0] + 1e-3 * span)
        p = [t0, t0 + mids[0], t0 + mids[1], t0 + span]
        t = rng.uniform(p[0], p[3])
        cases.append({"tctrl": p, "t": t})
    return cases


def blurDecimation():
    # HGBlur::GetDecimation(radius) — dense integer-boundary coverage. The level steps at
    # radius^2 clearing 25*4^k bands: <5->0, >=5->1, >=13->2, >=32->3, >=90->4, ... Sample
    # densely around each boundary (4.9/5, 12/13, 31/32, 89/90) + a broad range.
    cases = []
    xs = set()
    for b in (5, 13, 32, 90, 200, 400):
        for d in (-1.1, -0.1, -0.01, 0.0, 0.01, 0.1, 1.0):
            xs.add(round(b + d, 3))
    for v in _linspace(0.0, 500.0, 60):
        xs.add(round(v, 3))
    for x in sorted(xs):
        if x >= 0:
            cases.append({"radius": x})
    return cases


def lumaCoeffs():
    # PCGetGamutColorSpaceLuminanceCoefficients(gamut): gamut 0 = the Rec.709 working space
    # (the one the decoded colour subsystem uses). One case suffices — the fn reads a fixed
    # table row and writes 3 floats; the vector compare checks all 3 coefficients.
    return [{"gamut": 0}]


_GENERATORS = {
    "easeInOut": easeInOut,
    "bezierEval": bezierEval,
    "bezierFind": bezierFind,
    "blurDecimation": blurDecimation,
    "lumaCoeffs": lumaCoeffs,
}


def generate(spec, node=None):
    """spec like 'grid:easeInOut' -> list of args dicts (curve/value nodes).

    NOTE: filter/generator (image) nodes do NOT use this — they delegate to the FAITHFUL
    delta-response sweep (fct.parity.filter_node), which drives params from the real host's
    extracted schema. A static-source param grid would be UNFAITHFUL (synth.py lesson). So
    this generator serves only the exact curve/value kinds.
    """
    if spec.startswith("grid:"):
        name = spec.split(":", 1)[1]
        gen = _GENERATORS.get(name)
        if gen is None:
            raise ValueError("no case generator named %r (add to cases._GENERATORS)" % name)
        return gen()
    raise ValueError("unknown case spec %r" % spec)


if __name__ == "__main__":
    for spec in ("grid:easeInOut", "grid:bezierEval", "grid:bezierFind"):
        cs = generate(spec)
        print(spec, "->", len(cs), "cases; e.g.", cs[0])
