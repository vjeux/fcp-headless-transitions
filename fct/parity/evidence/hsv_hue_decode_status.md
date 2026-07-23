# PAEHSVAdjust HUE rotation — decode status (2026-07-23, strengthened)

## Param unit: RADIANS (newly confirmed)
Sweeping the Hue param (id=1) on (200,50,50) through headless FCP, the rotation ANGLE is the
param value in RADIANS (param × 180/π degrees):
  param=π (3.14159) → 179.7° ; param=2π (6.28) → 359.7° — exact radian→degree anchors.
The engine (hue-saturation.ts) treats Hue as DEGREES → wrong by ~57.3×. (All 4 shipping HSV
users author Hue=0, so this is gate-neutral; but it is a real, decoded param-unit divergence.)

## It is NOT a hue rotation — value/sat change
A pure HSV hue rotation preserves S and V. FCP does NOT: (200,50,50) [S=0.75,V=0.78] at
param=π/2 → (53,92,3) [S=0.96,V=0.36]. Value drops by half. So the "hue" control rotates in a
NON-HSV opponent space and the rotated point leaves the RGB cube and is CLAMPED (which is what
lowers value). The HSV-hue *delta* is sub-linear in the param (39.6° at param=1.0 rad=57.3°).

## Models RULED OUT (fit against a 7-input × 4-angle headless grid, hsv_hue_multiinput_probe.json)
  - pure HSV hue rotation (offset=param/2π turns):          worst 165 dR
  - verbatim shader HSV round-trip (max/min hue6 + frac):   worst 165 dR
  - YIQ chroma rotation (θ=param):                          worst 255 dR
  - Rec.709 YCbCr chroma rotation (θ=param):                worst ~50 dR (best, still far)
  - Rodrigues about gray (1,1,1), ±param:                   worst 175–242 dR
  - Rodrigues about luma709 axis:                           worst 255 dR
  - unconstrained best-fit LINEAR 3×3 RGB map (per angle):  worst ~40 dR  ← NOT even linear
  - unconstrained best-fit linear map in gamma-1.958 WS:    worst ~45–73 dR
The ~40 dR floor of an UNCONSTRAINED linear fit proves the operation is NONLINEAR in RGB (the
shader's max/min HSV reconstruction + cube clamp), so no matrix/space rotation can express it.

## Conclusion
Faithful decode requires porting the EXACT HgcHSVAdjust shader math (consts c0..c4, the sextant
select ladder) AND the -[PAEHSVAdjust canThrowRenderOutput] frameSetup that maps the radian Hue
param into hg_Params[0].x — decode-don't-fit. Node stays CHARACTERIZED; Hue≠0 never ships.
The in-gamut Value+Saturation composition IS verified (transfer.PAEHSVAdjust_valsat 0.87 lvl,
transfer.PAEHSVAdjust_combined_ingamut 0.72 lvl incl. a small in-gamut hue).
