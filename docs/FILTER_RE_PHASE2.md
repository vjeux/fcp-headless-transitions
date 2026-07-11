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
- [TOOLING] Added an IDENTITY GUARD to filter_probe/filter_verify: warns when the
  headless output == input (filter silently ignored by the host due to wrong
  factoryID/param-ids). This trap had nearly flipped the Levels gamma direction. When a
  synthetic probe can't be made to apply, fall back to the GUI GT (fct probe <slug>).
- Tooling: tools/re/{extract_shader,filter_probe,filter_verify,filter_usage}.py +
  engine/test/_filter_apply.ts (committed; no /tmp scratch).
