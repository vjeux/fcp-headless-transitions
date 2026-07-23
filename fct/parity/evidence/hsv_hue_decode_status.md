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

## UPDATE 2026-07-23b — verbatim HgcHSVAdjust shader FOUND + ported; blocker narrowed
The filter_binding listed HgcSaturation as the only shader, but `extract_shader.py HgcHSVAdjust`
yields the REAL hue+sat+value shader (LEN=0x9bb). It is a hand-rolled RGB->HSV (max/min sextant)
-> hue=frac(hue6/6 + hg_Params[0].x) -> HSV->RGB via a select ladder, *V. A verbatim register-
level Python port (evidence/hgc_hsvadjust_shader_sim.py) RUNS and produces clean hue rotations.

Residual vs the Hue-only probe: 165 dR. Root cause is NOT the shader math — it is the frameSetup
PARAM-PREP + defaults:
  - hg_Params[0] = (hueOffset, satMul, valMul). The shader is exact given these.
  - The UI Hue (radians) -> hueOffset (turns) mapping and, crucially, the DEFAULTS of Sat/Value
    when only Hue is authored are non-neutral: the Hue-only probe shows FCP DESATURATES
    ((200,200,50)@pi -> (215,215,255) not a clean (50,50,200)), and explicitly setting
    Value=0 -> BLACK (so Value's neutral is NOT 0 in hg_Params; the transfer-node Value offset
    convention differs from the shader's valMul slot).
  - So closing hue needs -[PAEHSVAdjust canThrowRenderOutput]/frameSetup register trace to
    recover: hueOffset(Hue), satMul(Saturation, default), valMul(Value, default). The shader
    itself is now DECODED and ported; only the CPU param-prep remains. decode-don't-fit.

## UPDATE 2026-07-23c — ported shader is identity-correct but does NOT match off-identity
The verbatim port (hgc_hsvadjust_shader_sim.py) is EXACT at Hue=0 (returns input for all test
colours) — so the RGB->HSV->RGB round-trip + reconstruction ladder is faithfully transcribed.
BUT even with a FREE per-case hueOffset brute-searched to best-match FCP, the residual is
17-165 dR (saturated inputs worst). So FCP's hue result is NOT reproduced by HgcHSVAdjust +
any scalar hue offset. Value confirmed a MULTIPLIER (param Value=0 -> pure black output;
neutral=1), Saturation an offset (satMul=Sat+1, neutral 0).

Implication: either (a) FCP dispatches a DIFFERENT shader than HgcHSVAdjust for PAEHSVAdjust
hue, (b) there is a working-space (gamma-1.958) encode/decode wrapping the shader that the
identity case is blind to, or (c) the frameSetup builds a non-scalar hg_Params (e.g. a per-
octant hue remap table). Distinguishing these needs live GPU capture of hg_Params during a
Hue!=0 render (Metal frame capture) — beyond static disasm + transfer probing. Node stays
CHARACTERIZED; the ported shader + this residual map are the starting point for that capture.

## UPDATE 2026-07-23d — HgcHSVAdjust is the WRONG shader; the WS-YCbCr model is right
Tested the ported HgcHSVAdjust sim on PURE Saturation and PURE Value (not just hue) vs fresh
headless probes: it DIVERGES 120-149 dR on saturated inputs (S=0.5 red: sim (200,0,0) vs FCP
(249,120,115); V=1.5 green: sim (64,255,64) vs FCP (213,255,192)). But the engine's shipped
transfer.PAEHSVAdjust_valsat is VERIFIED at 0.87 lvl — so the engine does NOT use HgcHSVAdjust.
CONCLUSION: HgcHSVAdjust (the hextant max/min shader I extracted) is a legacy/OSC-preview
variant, NOT PAEHSVAdjust's render path. The render path is the DECODED gamma-1.958 WORKING-SPACE
model (hue-saturation.ts hueSaturationFilterWS): WS luma-lerp saturation, WS linear-multiply
value, WS-YCbCr luma-preserving hue rotation. That whole shader-port line of attack was chasing
the wrong shader — abandon it.

## The hue residual IS the shared over-1.0 clamp (unification)
Scored the engine's ACTUAL WS-YCbCr hue model vs the 7x4 headless grid: rms=20.0, worst 70.7 dR.
The residual is ENTIRELY on colours where a rotated channel exits [0,1] — and FCP keeps the
other channels HIGHER (less compressed toward gray) than the engine's desaturate-toward-luma
(e.g. (50,200,200)@0.5: engine R=89, FCP R=160). An over-1.0 "redistribute excess to headroom
channels" model (the SAME mechanism measured for Contrast/Brightness/ChannelMixer_clip) lowers
rms to 14.0. So the HUE out-of-gamut divergence is the SAME shared HGColorMatrix over-1.0
cross-channel GPU-readback lift, NOT a separate hue-decode problem. It unifies with the documented
clamp blocker (needs Metal tile-readback disasm; gate-inert since Hue!=0 never ships).

## UPDATE 2026-07-23d — HgcHSVAdjust is the WRONG shader; engine WS-YCbCr model is optimal (rms 20)
DECISIVE: the extracted HgcHSVAdjust shader (identity-exact port) FAILS 120-149 dR vs headless
FCP even on PURE Saturation and PURE Value on saturated inputs (e.g. Sat=+0.5 red: shader ->
(200,0,0) pure-saturate, FCP -> (249,120,115) desaturate-toward-white; Value=1.5 green: shader
-> (64,255,64), FCP -> (213,255,192)). But the engine's transfer.PAEHSVAdjust_valsat is VERIFIED
at 0.87 lvl using a DIFFERENT model — the gamma-1.958 working-space luma-lerp (HgcSaturation
math), NOT HgcHSVAdjust. => HgcHSVAdjust is a legacy/OSC-preview variant; FCP's PAEHSVAdjust
RENDER path applies HgcSaturation-style ops in the working space. The earlier "port HgcHSVAdjust"
lead was chasing the wrong shader.

Re-confirmed against the fresh 7-input x 4-angle hue grid:
  - engine WS-YCbCr hue (rotate Rec.709 Cb/Cr in gamma-1.958 WS + desat-toward-luma): rms 20.0,
    worst 70.7 dR  ← the best available, and the shipped model
  - HgcHSVAdjust shader port (+ free offset): 165 dR / 17-165 even with per-case best offset
  - rotate in code-space instead of WS: rms 19.7 (no better)
  - gamut hardclip / clip-lo-only instead of desat-toward-luma: rms 23.9 (worse)
So the 20 rms is intrinsic to the Rec.709-YCbCr-rotation MODEL — FCP's hue rotation is not exactly
a Rec.709 chroma rotation. Closing it needs the true PAEHSVAdjust render-path shader + its
frameSetup (the HgcSaturation-in-WS pipeline with the exact hue-rotation primitive), captured
live — NOT HgcHSVAdjust. Node stays CHARACTERIZED (gate-inert; Hue!=0 never ships). The in-gamut
Value+Saturation legs ARE verified (transfer.PAEHSVAdjust_valsat 0.87, ..._combined_ingamut 0.72).
