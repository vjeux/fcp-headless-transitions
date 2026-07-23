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
