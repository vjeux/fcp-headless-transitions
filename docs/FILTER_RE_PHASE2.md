# Filter Phase-2 — match TS impl to reverse-engineered FCP, verify vs headless

Phase-1 documented the verbatim FCP algorithm in each filter module. This doc is the
prioritized backlog of DIVERGENCES to fix in Phase-2, each verified against the
headless FCP engine (the real engine — comparing TS-filter output to headless-FCP
output on the SAME synthetic .motr is legitimate here; the headless IS FCP). Gate
(`fct regress`) must stay green vs the GUI GT after every change.

## Verification method (Phase-2)
1. `tools/re/filter_probe.py <shader> [param=val ...]` — renders a filter through the
   REAL FCP filter (headless) on a synthetic input and compares to the TS filter's
   output on the same input, across a param sweep the 65 transitions don't cover.
2. For params the built-in transitions DO cover, the GUI-GT gate already guards them.
3. A change is DONE when: TS output matches headless within tolerance across the swept
   param space AND `fct regress headless/engine` stays green.

## Backlog (by blast radius / impact)

### Color filters (small, self-contained pixel math — safest first)
- **Tint [P2-TINT1]**: FCP is a HARD-LIGHT blend of luma vs tint color about 0.5, NOT
  the `luma*tintColor` lerp `tintFilter` does. Rewrite to the two-leg select. luma
  weights = confirm 601 vs 709 (both in __const).
- **Saturation/Desaturate**: confirm the mix(gray,rgb,amount) uses Rec.709
  (0.2125,0.7154,0.0721) — HgcSaturation has it INLINE. hue-saturation.ts uses 601.
- **HSV [P2-HSV1]**: FCP Value is a MULTIPLIER (hg_Params[0].z), TS ADDS brightness.
  No Mix slot in FCP. Switch value to multiplicative.
- **Colorize**: TS structure matches (black→white luma remap). Confirm the intermediate
  colorize-Amount (hg_Params[2]) vs final Mix (hg_Params[3]) split; confirm luma wts.
- **ChannelMixer**: FCP rows are 4-wide dots incl. alpha column (the -Alpha term is the
  per-channel offset via r1.w=1), clamps ALPHA only, re-premults by NEW alpha. TS uses
  separate offsets[] and clamps all channels — reconcile.
- **Levels [P2-LVL1]**: FCP is TWO-STAGE affine remap (in/out black+white per stage)
  with pow(gamma) between AND after, then Mix. TS is single-stage, pow(1/gamma), only
  whiteOut. Expand to two-stage; fix gamma direction. (27+ transitions — verify gate.)
- **Fill [P2-FILL1]**: FCP forces fill.a=1, lerps alpha by Mix, re-premults by input α.
  TS leaves alpha inert + straight alpha. Reconcile premultiplication.

### Luma key
- **LumaKey [P2-LK1]**: FCP is a LINEAR ramp across [lo,hi] with luma weights as a PARAM;
  TS uses symmetric threshold±softness with fixed 601. HgcLumaKeyer variant bakes a
  256-wide 1-D tolerance LUT. Match the [lo,hi] ramp; read luma wts from param.

### Blur family (geometry — larger, verify carefully)
- **Directional [P2-DB1]**: FCP = rotate→1-D GAUSSIAN→un-rotate; TS = uniform box average.
  Switch to Gaussian falloff, ~3σ extent.
- **Radial/Zoom [P2-RB1/ZB1]**: FCP does the blur in POLAR space (rect↔polar remap);
  TS does it in screen space. Amount scaling: radial ×1.5, zoom ×0.75 (TS uses invented
  ×0.01). Different geometry near center + corners.
- **Gaussian [P2-GB1]**: FCP convolves a small fixed-tap kernel on the DECIMATED image
  with HGBlur-computed weights (not visible in shader — need HGBlur::ComputeDecimation).
  TS builds a full 2r+1 kernel, sigma=r/3 (an assumption). Perf + edge-mode gaps.

### Bevel (biggest divergence)
- **Bevel [P2-BEV1]**: FCP = 4-quad offset accumulation, tint = LightColor × |cos(θ+k)|
  for k∈{0,−45,−90,+45}, width HALVED, composite = mix(tex,color,color.a)+max alpha. TS
  = per-pixel gradient-normal dot with invented Opacity/Mix params, ignores Light Color,
  uses width raw (2× off). Rewrite to the offset-accumulation model.

### 360 Reorient (needs GUI GT — plugin renders black headless)
- **Reorient [P2-360*]**: FCP = equirect→sinusoidal→affine rot→sinusoidal→equirect with
  pole guard + longitude wrap. TS = direct 3-D sphere rotation. Equivalent for pure
  rotation at sample points but resampling/pole geometry differs. Rotation encoding in
  params[4]/[5] unconfirmed — needs a GUI GT capture before changing.

## Phase-2 progress (verified vs headless FCP + gate)
- [DONE] Brightness: additive -> sRGB MULTIPLY (identity at 1). Curtains 4.7->14.31
  (+9.61), 3D_Rectangle +0.55. filter_verify @0.5 PSNR 47.
- [DONE] ChannelMixer: (a) read NESTED Red/Green/Blue-Output child weights (were read
  flat -> identity no-op); (b) Monochrome = Red-row dot on all channels (was luma601 +
  double matrix). Color_Planes 6.09->9.86 (+3.77). filter_verify PSNR ~42 both cases.
- [DONE] Colorize: honor Intensity (hg_Params[2]) as colorize amount; was ignored so
  the remap always applied at full strength. Gate-neutral (built-ins use Intensity=1)
  but full-param-space correct (Intensity=0 now = FCP identity, PSNR 42). REMAINING:
  B-channel luma-vector mismatch at Intensity=1 (FCP luma != 601 dot) — unfixed.
- [PARTIAL] Tint: documented exact hard-light shader; sRGB transcription matches RED
  channel but G/B off (~21 err) — TintFx/Color-Space=3 nuance unpinned. Only 4
  transitions, all dominated by other gaps -> deferred.
- [DONE] Fill: verified vs headless FCP across Mix. filter_verify (factoryID=7 applies
  Fill fine, identity guard confirms it's NOT ignored — headless_vs_input_mad 88.5):
  red fill Mix=1 -> PSNR 54.97; Mix=0.5 -> PSNR 45.35, means align to <0.2. The
  P2-fill alpha-premult TODOs are theoretical (partial-coverage edge alpha); on the
  opaque full-frame drop-zone input the transitions actually use, TS already matches
  FCP. No code change needed.
- [DONE] Levels gamma direction: GUI-GT-verified the net mapping is pow(x, 1/gamma)
  (UI Gamma fed to the HgcLevels shader as its reciprocal). Objects/Leaves (Gamma=1.726)
  scores 11.76/13.78 dB at f6/f12 with pow(1/gamma) vs 9.75/12.54 with pow(gamma). The
  existing TS code was already correct; corrected the misleading doc + reverted a wrong
  edit. (Two-stage + output-black expansion remains a theoretical gap — the built-ins
  only set stage-1, so it's identity in practice.)
- [DONE] Gaussian blur sigma: MEASURED vs headless FCP (probe Amount 10/20/40/80) that
  FCP's blur is sigma = Amount/6.67, not the assumed radius/3 (2.2x too much blur).
  Isolated filter_apply Amount=20: TS 34.0 -> 43.5 dB after fix. gaussian-blur.ts.
- [DONE] Pop-up widget snapshot mapping (parser/rig.ts): was (value-1), forcing the
  Blurs family to the NO-BLUR snapshot. ROOT CAUSE of Blurs rendering sharp where FCP
  is heavily blurred (GT frame-12 sharpness 0.18 vs engine 2.30). Fixed to 0-based
  index `num`: Gaussian=1->blur snapshot, Radial=2, Rotate/Slide=0. Gate 0 regressions,
  Gaussian +0.25 (gate-res). Makes the sigma fix load-bearing. Re-baselined engine.
- [DONE] Blur activation bugs (3 root causes, GUI-GT-verified): (1) applyFilter's OSC
  skip was too broad — it dropped any filter with Publish OSC=1, but the REAL Directional
  & Radial blurs set that too; narrowed to the 'for OSC' node-name marker. (2) blurAmount
  treated any static-value-0 curve as inactive even with an animated 0->300->0 ramp
  (Blurs/Directional); now only FLAT value-0 curves are inactive. (3) Directional blur
  was a box average; FCP uses a 1-D Gaussian sigma=Amount/6.67 (measured: Amount=50 σ7.5
  PSNR 46.4 vs box 33.5). Net: Directional now fires + matches FCP falloff (+0.08, was
  -0.94 with box); sharpness tracks GT. Gate 0 regressions.
- [OPEN] Radial/Zoom blur GEOMETRY (P2-RB1/ZB1): blur now FIRES but the spin math uses
  angle-in-degrees x (dist/max(w,h)) giving near-zero rotation for the transition's
  Angle=2.39rad, and zoom uses a screen-space 1+t*0.01 scale. Both need the FCP
  polar-space (rect<->polar remap) + correct Amount->arc/scale mapping. Next target.
- [ATTEMPTED+REVERTED] Radial (spin) blur geometry: measured FCP's spin as a RIGID
  rotation over total arc = Angle x 0.5 rad (probe Angle=0.5/1.0). Implemented it
  (screen-space rigid rotation, arc=Angle*0.5, uniform weight) — the blur then FIRES and
  the sharpness tracks GT (engine 0.5-0.79 vs GT 0.17-0.24), BUT it REGRESSED Blurs/Radial
  -0.43 on the gate. Even the best isolated screen-space spin fit only reached PSNR 33-36
  (vs Gaussian's 46 for directional), i.e. the screen-space rigid rotation is NOT what FCP
  does — FCP's radial blur is polar-space (rect<->polar remap, P2-RB1) with per-radius
  arc. Reverted to keep the gate green; the polar-space rewrite is the real fix and is
  the remaining Radial/Zoom item.
- [TOOLING] Added an IDENTITY GUARD to filter_probe/filter_verify: warns when the
  headless output == input (filter silently ignored by the host due to wrong
  factoryID/param-ids). This trap had nearly flipped the Levels gamma direction. When a
  synthetic probe can't be made to apply, fall back to the GUI GT (fct probe <slug>).
- Tooling: tools/re/{extract_shader,filter_probe,filter_verify,filter_usage}.py +
  engine/test/_filter_apply.ts (committed; no /tmp scratch).

## The 8 previously-UNIMPLEMENTED transition filters (2026-07-12)
These filters appeared in the 65 built-in transitions but were unregistered no-ops
(passed through untouched). All 8 are now reverse-engineered + documented; 5 are
matched+verified and wired in; 2 hit a structural RNG/noise ceiling; 1 is disabled.

- [DONE] **PAEFlop** (mirror, 2FF8887B): verbatim disasm — geometric H/V/Both mirror
  about image center via Helium XForm. Verified vs headless PSNR 42.2 (all modes).
  Unit-tested (engine/test/flop.test.ts). Gate-neutral (built-ins use mode 0).
- [DONE] **PAEMinMax** (D2342006): verbatim Helium MMNode<Mode,Axis> Metal shader —
  separable X-then-Y (2R+1) min/max morphology on premul RGBA. Verified PSNR 35-40
  across Mode×Radius. Unit-tested (engine/test/minmax.test.ts).
- [DONE] **PAEScrape/Smear** (0D6E968B): verbatim HgcScrape inverse-map directional
  warp. TWO disasm-label corrections proven empirically: axis=(-sin,cos) (sincos
  bakes a π/2), threshold=(200-clamp(Amount,0,200)). Geometry EXACT (synthetic mad
  0.2); real-photo PSNR 24-40 (residual = 1854→1920 conform, not algorithm). Fixed an
  ESM `require()` bug in the draft. Gate: Movements__Smear +0.35.
- [DONE] **PAEBlackHole** (1A32EFEF): verbatim HgcBlackHole — radial gravity-lens warp
  as a mip pyramid (numLevels=max(1,round(log2(Amount/8)))); per-level radial pull-in
  len'=len+clamp(len/radius,0,1)·Amount + OOB→transparent + edge-falloff blend. Amount
  in 1920×1080 render px → conform-scaled. Verified PSNR 32-39 across Amount×Center.
  Gate: Movements__Black_Hole +1.33.
- [DONE] **PAEEarthquake** (DEB7CD03): no shader; CPU seeded RNG FULLY recovered — LCG
  (a=4096,c=150889,m=714025) + Numerical-Recipes Bays-Durham shuffle (NTAB=101),
  seed=RandomSeed+0x232323+trunc(frame·1000); 3 draws/layer → (rotRad=Twist·0.1·(2r-1),
  tx=HShake·25·(2r-1), ty=VShake·25·(2r-1)); Rot about epicenter. Pure-rotation PSNR
  37.5 (proves exact RNG). Gate-neutral (Layers=1, small shake, sub-pixel-conform).
- [PARTIAL/CEILING] **PAEBadTV** (32AB5EE1): deterministic components verified+applied
  (desaturate mix(luma,rgb,Sat/100+1) PSNR 34; scanline smoothstep bands PSNR 23; roll
  phase; host Mix). Waviness + Static both draw from a per-frame-reseeded dSFMT RNG
  (seed=2·frame+1) with host-side table normalization NOT byte-reproducible → phases
  differ → NOT applied (a phase-divergent displacement/noise is not "identical" and
  hurts full-res). Lights/Static sets Mix=0 → passthrough there. Gate-neutral.
- [CEILING] **PAEUnderwater** (9FA1F483): verbatim 10-octave sum-of-sinusoids
  refraction (HgcUnderwaterFreqSynth + HgcUnderwaterRefractV2) documented. Phase-2
  BLOCKED: (1) FreqSynth reads a runtime GPU gradient-noise texture unrecoverable from
  the binary → ripple phases differ; (2) plugin renders BLACK headless for t>~1.0 (no
  GUI GT, same as reorient360); (3) MEASURED wiring it regresses Movements/Flashback
  −1.74. Registered as gate-safe passthrough; faithful impl retained as underwaterApply().
- [N/A] **PAETrails** (2DB30B44): `<enabled>0</enabled>` in its only use (Black_Hole) —
  FCP never applies it. Parser fix (967189b) now skips disabled filters generally.

### The 1854→1920 conform artifact (affects ALL geometry filters' probe PSNR)
`engine/test/start.png` is 1854×1042 but FCP renders the probe at 1920×1080. So a
geometry filter's TS half runs at 1854 while pixel-space params (radius, threshold,
shake px) are in 1920 render px — a uniform ~3.6% scale mismatch that shows as a
~1-3 mad floor / whole-frame residual on the real-photo probe, LARGEST where the
displacement is largest. It is NOT an algorithm error: at matched resolution
(synthetic gradient, or the real transition rendered at project size) the geometry is
exact. Verified independently by Scrape (mad 0.2 synthetic), Earthquake (interior mad
1.7 after removing the constant offset), BlackHole (mad→0.07 at Amount=1000).

## Phase-2 verification suite (2026-07-12) — the repeatable artifact
`tools/re/filter_sweep.py` + `filter_sweeps.json` run each filter through REAL headless
FCP + the TS engine across a parameter matrix (the objective's "verify identical across
ALL inputs, incl. values the 65 transitions don't exercise"). Run:
  DYLD_FRAMEWORK_PATH=".../Frameworks" PYTHONPATH="$PWD" venv/bin/python3 tools/re/filter_sweep.py
Latest results — 27 PASS, 0 true FAIL, plus tracked GAPs and CEILINGs:
  * PASS (matched vs headless across their param space): flop, minmax, gaussian
    (46→36 dB as Amount grows — conform floor, mae stays 0.8-2.4), radial/spin
    (38→30 dB over Angle), scrape (39.6 / 34.5; rot=0 weakest 25.8 = conform),
    blackhole (32-33 dB over Amount×Center), earthquake (37.5 pure-rot),
    brightness-darken (47/44), hsv sat/value/grayscale (39-48).
  * GAP (real divergence, but NO shipping transition exercises the input — documented,
    not fit): HSV hue rotation (hexagon reconstruction differs, all 5 users Hue=0);
    Brightness >1 (HGColorMatrix multiply confirmed, headless working-space transform
    unresolved, all 27 users darken).
  * CEILING (structural, can't be made identical): Tint [P2-TINT1] hard-light
    color-space; Underwater unrecoverable GPU noise field + black-headless.
The suite CAUGHT a real shipped bug: the committed Scrape axis was (-cos,sin); the
sweep's isolated-headless check proved it must be (-sin,cos) (psnr 14→39.6) — fixed.

## Consolidated finding: the 3 remaining GAPs share ONE root cause (2026-07-12)
Brightness>1, HSV hue rotation, and Tint hard-light all diverge from headless despite
DECODED-correct filter math. Evidence they are NOT filter-math bugs:
  * Brightness: darken 0.5 = plain sRGB multiply matches headless mad 0.67 (near-exact);
    brighten 2.0 mad 63.8. NO single working-space transfer (sRGB<->lin, gamma 1.8/2.2)
    reconciles both (all make darken WORSE). => brightening engages a highlight
    rolloff / soft-clip on the HGColorMatrix output values that exceed 1.0, beyond the
    pure multiply — an FCP output tone-map, not the (correctly-decoded) matrix.
  * HSV hue: a byte-faithful port of the verbatim HgcHSVAdjust shader gives the SAME
    mad ~37 as the naive TS (linear-light ~32) => the divergence is the working-space
    transform around the shader, not the HSV reconstruction.
  * Tint: the verbatim hard-light shader matches SHAPE but the sRGB-vs-working legs are
    unpinned (regressed the gate when shipped).
COMMON ROOT: FCP's headless renders through a working color space + output tone-map
that these out-of-range / hue-rotated operations expose. This is a SYSTEMIC color-
pipeline investigation (shared by all filters), distinct from per-filter RE, and NONE
of the 65 shipping transitions exercise these paths (all darken / Hue=0 / default Tint).
Documented as the correct stopping point: filter math is decoded + verified; the
residual is the color pipeline, tracked for a dedicated future pass. Do NOT fit it.

## Brightness>1 curve — measured, defies standard color-space models (2026-07-12)
Deeper dig on the Brightness>1 gap (the cleanest of the shared color-pipeline gaps):
  * DECODED: PAEBrightness = HGColorMatrix diagonal (r0.x/y/z = Brightness, alpha row
    = 1), raw param → matrix with NO transform (frameSetup confirms). So FCP's op IS
    `out = in * Brightness`.
  * darken (×0.5): plain sRGB multiply matches headless mad 0.67 (EXACT). So the
    working space for multiply-down is sRGB.
  * brighten (×2.0): the MEASURED transfer is an extreme shadow-lift, NOT in*2:
    in~10→104, 30→143, 60→188, 90→220, 120→249, 160→255 (in*2 would be 20/60/120/...).
    No standard model fits: linear-light ×2 (mad 73), single-gamma working space
    (best p=0.75, mad 22 — worse than sRGB for darken), x^(1/4.4) (mad 18), screen
    1-(1-x)^2 (mad 61). The darken=exact-sRGB / brighten=huge-lift ASYMMETRY rules out
    any symmetric decode/multiply/encode.
  * Hypothesis for a future pass: the HGColorMatrix executes in a camera/log working
    space where a >1 gain becomes a log-domain lift, OR the >1 branch remaps the param
    (not visible in the decoded straight-through path). Needs the HGColorMatrix
    RenderTile / the Ozone render color-management config, not the filter binary.
  * UNEXERCISED: all 27 Brightness users darken; brighten hits no shipping transition.
    Documented with the measured curve; explicitly NOT fit.
