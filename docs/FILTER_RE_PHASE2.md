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
