# M-SLIDEIN decode (2026-07-14) — BLOCKED, deep subsystem, NO push (no regression)

Slug: Stylized__Slide_In. Baseline min-repro 8.55 dB. THREE stacked missing pieces:

1. LINEAR GRADIENT GENERATOR NOT RENDERED (fixable, but alone REGRESSES).
   - scenenode factoryID=8 pluginName="Gradient" (Apple factory f32e7a31-146f-11d8),
     UUID 40091D89. determineImageSource() only handles "Gaussian Gradient" -> returns
     undefined -> generator renders BLACK. Symptom: engine frame = all black.
   - Implemented renderLinearGradient (HgcGradientLinear verbatim: t = proj onto
     start->end axis / |axis|^2, clamp, sample ramp). Parser reads Object>Gradient>
     Gradient(id310)>RGB stops + Start(id4)/End(id5). GOTCHA: gradient colors are
     authored as <curve default=1 value=0.28...>; parseParameter mirrors curve.default
     onto p.value, so MUST read p.curve.value FIRST (else you get white/default).
   - Correct stops decoded: teal(72,141,144) -> lightblue(223,241,242). RENDERS but
     WASHES FULL FRAME (7.73 dB, worse than 8.55 black) because the mask doesn't clip.

2. ROUNDED-RECT <mask> NOT LIFTED/CLIPPING (detection fix is UNSAFE to broaden).
   - <mask name="Rounded rect down" factoryID=13> on the generator, Is Mask=1, 4-vert
     rounded rect (verts X[-1065..2305], Y[-605..605], Roundness=6), huge (~3370x1210).
   - liftProceduralMasks needs mshape.isMask, but detectMask() checks the element's
     NAME attr / ancestors, not tagName. A <mask> whose name is the shape name
     ("Rounded rect down") is NOT detected. Adding `tagName==='mask'` to detectMask
     fixes lifting BUT is TOO BROAD: 8 gate slugs (Center, Center_Reveal, Glide, Heart,
     Light_Sweep, Lower, 3D_Rectangle, full Slide_In) have <mask> elements with
     non-"mask" names that are currently handled by rig/Image-Mask/Masks-group paths.
     Broadening lift = the FCT_LIFT_ALL_MASKS scar (-1 dB). HIGH regression risk.
   - Also added a generic "own source-less mask-shape children clip" for image/generator
     leaf layers (mirrors the existing clone path). Correct primitive, but depends on (2).

3. MOTION PATH BEHAVIOR (factoryID=24) NOT IMPLEMENTED (deep, multi-hour RE).
   - Drives the mask position. Observed FCP truth (headless): panel is a TOP band
     y[0..~250], RIGHT-pinned, rigid LEFTWARD slide of the rounded rect, left edge
     806->655->506->356->206->56->0 over frames 0..6 (~-134 px/frame, ~-806 total),
     then STOPS (retime playhead). B revealed below ~frame 13.
   - Behavior has: End Point X=400,Y=0; Start Point (0,0); Position(id200) X curve
     0->4080 (arc-length param); Position(id206) CLOSED DIAMOND shape curve
     X:0->405->810->405, Y:0->405->0->-405; Attach To Shape=1, Shape Source=0,
     Direction=1, Loops=1. Plus the whole layer is RETIMED (Transition B Retime 1->31,
     nonlinear/eased) so motion completes early.
   - I implemented a naive linear Start->End (X 0->400) motion path over [timing.in,out].
     Insufficient: needed worldTransform tx~+1531(f0) sweeping to ~-726(f6), ty~+895
     constant. My static base gave tx=-2510, ty=-676. The static Position(-1500,-1229)/
     Anchor(1069,-606)/ScaleY(0.912) do NOT map to the target under any simple anchor
     convention (T*R*S*T(-anchor), no-anchor, or Y-flip all miss). The REAL placement
     comes from the Motion Path id200/id206 curves + retimed playhead — a shape-path-
     following subsystem, not a linear tween.

NEXT TICK: this needs a multi-tick BUILD arc: (a) render linear Gradient generator
(safe infra, keep), (b) implement Motion Path shape-following (id206 path + id200
arc-length param, retime-aware), (c) apply the mask clip ONLY where a Motion-Path-driven
generator mask exists (scope narrowly to avoid the broad detectMask scar — e.g. lift
<mask> ONLY on generator/image leaves that carry a Motion Path behavior, leaving the
8 rig/Image-Mask slugs untouched). Verify each step on the FULL gate.
