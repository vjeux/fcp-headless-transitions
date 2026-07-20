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
