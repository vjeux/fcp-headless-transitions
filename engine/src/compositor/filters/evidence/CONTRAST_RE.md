# PAEContrast — Phase-1 RE (structure + measured transfer; Phase-2 impl pending)

UUID B13B57AC-811B-4A24-BB5A-2167A3C66F5F, pluginVersion 0. 40 corpus files (2nd-most-used
unimplemented filter). ONE user param: `Contrast` (id 1, default 1 = identity) + Mix (10001).

## CPU structure (from -[PAEContrast ...] in Filters.bundle)
- `-[PAEContrast generateLut:forContrast:andPivot:]` builds a 1-D LUT.
- `-[PAEContrast calculateBezier:startPt:controlPoint1:controlPoint2:endPt:]` — the LUT is a
  CUBIC BEZIER curve, so Contrast is an S-shaped tone curve around a PIVOT (not a simple
  scale-around-mid). `andPivot:` supplies the fixed point.
- Applied per-channel through the LUT (generic LUT sampler shader; no dedicated HgcContrast —
  it reuses the LUT/gamma path).

## Measured input→output transfer (red channel, oracle, corpus host)
Contrast=0.5 (compress):  in 61.6→63.4, 109.5→86.3, 142.8→100.5, 177.8→115.1, 227.9→134.9
Contrast=1.5 (expand):    in 61.6→123.0, 109.5→183.5, 142.8→217.0, 177.8→246.7, 201.9→255(clip)
Contrast=2.0:             in 61.6→120.1, 109.5→198.3, 142.8→241.3, 177.8→255(clip)

NOTE the transfer is NOT symmetric around code 128 — at Contrast>1 even low inputs move UP,
so the Bezier pivot is low (near black) and/or the curve operates in a non-sRGB space. Next
tick: decode the exact pivot + Bezier control points from generateLut disasm (constants at
0x1dfb8: -1, +1, 0.5 appear — likely `x' = pivot + (x-pivot)*f(Contrast)` with a Bezier ease),
OR fit the measured LUT directly (dense input sweep) and reproduce it. Then verify with the
faithful delta-response harness (same method as PAEVignette → VIGNETTE_VERIFICATION.md).

## Further decode (2026-07-20, oracle affine-fit per Contrast)
The curve is a cubic Bezier with control points built by a ROTATION (the generateLut disasm
calls `___sincos_stret` — the tone line y=x is rotated by an angle derived from Contrast around
a pivot). Angle math (from disasm @0x1dfb8): `a = 0.5 · K · (2 - Contrast)` (K = a const loaded
from the data page, not yet read); then sin/cos rotate the pivot-relative control points.

Empirical affine fit of the measured LUT (median per input code, unclipped 5..250 range):
```
  C=0.5:  slope 0.455  intercept 34.0  fixed-pt 62.4  affine_resid 2.4   (affine EXCELLENT)
  C=0.75: slope 0.716  intercept 17.3  fixed-pt 61.0  affine_resid 1.9   (affine EXCELLENT)
  C=1.25: slope 0.990  intercept 63.5  fixed-pt ~     affine_resid 13.6  (NON-LINEAR)
  C=1.5:  slope 1.274  intercept 42.8  fixed-pt -156  affine_resid 14.7  (NON-LINEAR)
  C=2.0:  slope 1.804  intercept 10.9  fixed-pt  -14  affine_resid 12.7  (NON-LINEAR)
```
FINDINGS: (1) for Contrast < 1 (compress) the transfer is very nearly AFFINE with a fixed point
~61-62 codes — NOT 128. (2) for Contrast > 1 (expand) it is a genuine S-CURVE (Bezier), affine
resid 13-15 — an affine model would be wrong. So PAEContrast CANNOT be shipped as a simple
slope-around-pivot; it needs the Bezier LUT reproduced. NEXT: read the const K + pivot arg from
the binary (or dense-sample the LUT at 256 inputs via a flat-gradient synth source and bake the
exact Bezier), then verify with the faithful delta-response harness. NOT shipping an affine
approximation (would be fitted-not-faithful, violates ROADMAP Rule 13).
