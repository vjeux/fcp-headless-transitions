# fct/parity — JOURNEY STATE (durable, compaction-proof)

Last updated: 2026-07-22. Run `fct parity status` for the live verdict table.

## Where the boundary landed (vjeux's correction)
The unit of truth is the **XML node**: one .motr node + its params -> one isolated
computation, verified faithful (TS == REAL FCP) across the param space. NOT a hand-picked
C++ symbol, NOT whole-frame PSNR. See DESIGN.md.

## Two verification regimes (each node uses the RIGHT oracle)
1. **Exact (parity-owned)** — value->value nodes whose computation IS an exported FCP
   function, called via dlsym and compared bit-for-bit:
   - curve.interp.ease            PCMath::easeInOut          VERIFIED 0.0
   - curve.interp.bezier.eval     OZBezierEval               VERIFIED 3.2e-14
   - curve.interp.bezier.findparam OZBezierFindParameter     VERIFIED 4.3e-10
2. **Delegated (faithful)** — image nodes (filter/generator). A static-source injection is
   UNFAITHFUL (synth.py lesson), so parity delegates to the faithful DELTA-RESPONSE in the
   node's real host and mirrors the verdict (`fct parity sync`). 20 nodes across
   blur/color/generators/geometry/stylize.

## Current subsystem map (23 nodes)
  curves      3/3  VERIFIED (exact)
  blur        3/5  (Gaussian/Directional/Radial VERIFIED; Bloom/Zoom DIVERGED)
  color       0/6  ALL DIVERGED — but oracle_truth=gui (headless!=GUI 13-19dB); the
                   GUI GT overrides, so these are CHARACTERIZED, not simple bugs
  generators  1/3  (ColorSolid VERIFIED; Clouds/Noise DIVERGED — RNG fields)
  geometry    2/4  (Flop/BlackHole VERIFIED; Earthquake/Underwater DIVERGED)
  stylize     0/2  (Glow/BadTV DIVERGED)

## What "faithful/DIVERGED" means here
These are the SAME verdicts the faithful program tracks; parity gives them the node-boundary
FRAMING + subsystem grouping. Driving a DIVERGED image node to VERIFIED is genuine subsystem
RE work (owned by the faithful driver / swarm todos) — parity mirrors the result. The color
nodes' DIVERGED is EXPECTED (headless oracle != the GUI truth for color management).

## Callable geometry oracles found (candidate EXACT parity nodes, need an engine counterpart)
These are exported pure-math functions verified callable this session — high-value EXACT
parity targets once the engine exposes a 1:1 function to compare (today the engine uses a
different formulation, e.g. camera-Z projectPoint vs an explicit homography):
  - PCComputeQuadToQuadProjectionMatrix (ProCore)  — the exact quad warp / homography
  - getScaleTranslateRotate / getScale / perspectiveToAffine (ProCore)
  - PCIntersectRayWithSphere (ProCore) — sphere/ray (Insect Eye, sphere transitions)
  - PCMath::cubic / PCMath::quadratic (ProCore) — polynomial root solvers (VERIFIED callable)
  - OZBezierGetRoots (ProChannel) — all-roots bezier solve (OZBezierFindParameter wraps it)
  - HGLinearFilter::gaussian / HGDefinition::CIToHGBlurRadius / HGBlur::GetDecimation (Helium)
    — the blur kernel PDF + radius map + decimation level (all match the TS blur inline math)

## Next steps for the journey
- EXACT expansion: when the engine factors out a function matching one of the callable
  geometry oracles above, add it as a curve/transform-kind node and verify bit-exact.
- Image nodes: advance via the faithful driver (RE the DIVERGED node), then `fct parity sync`.
- The color subsystem needs the GUI-vs-headless resolution (Rule 1) before its parity verdict
  is actionable — tracked in faithful/ as the ORACLE_TRUTH split.


## UPDATE 2026-07-22 (session 2 cont.) — transfer-function kind + first real fix

Added a THIRD verification regime for pointwise colour nodes:
3. **EXACT transfer (parity-owned)** — a per-pixel colour node computes out=f(in,params) with
   no spatial dependence, so it isolates EXACTLY via UNIFORM-COLOUR inputs (conform-invariant),
   sidestepping the pipeline coupling AND the headless-vs-GUI gap. Warm batched oracle
   (transfer_batch.py boots FCP once, ~10x faster). Nodes: transfer.PAEBrightness (CHARACTERIZED
   — cross-channel HGColorMatrix working-space, gate-blocked), transfer.PAEHSVAdjust.

### FIRST REAL BUG FOUND + FIXED via parity: PAEHSVAdjust hue unit
- The transfer probe caught hue rotation DIVERGED 201 levels. Decoded against REAL FCP: Hue is
  RADIANS (turns=hue/(2π)), engine did hue/360 (degrees). Only correct at Hue=0 — survived
  because all 4 shipping HSV hosts author Hue=0 (GATE-NEUTRAL fix, confirmed <0.15 dB).
- Fixed both sites + the 2 tests that encoded the wrong convention. HSV worst 201->107 (residual
  = separate linear-working-space sat/value issue). Commit d5840c2.
- THIS IS THE HARNESS WORKING: an exact node oracle found a param-space bug invisible to the
  65-slug gate (all Hue=0) and the coupled delta-response (unattributable), driving a verified fix.

### Node kinds now: curve (exact dlsym), transfer (exact per-pixel colour), filter/generator
    (delegated faithful delta-response). CHARACTERIZED status = decoded/understood divergence
    that is NOT an open bug (working-space/gate-blocked).

### Transfer-kind TODO (actionable, real bugs likely — NOT gate-blocked like Brightness):
- transfer.PAEHSVAdjust residual 107 levels = linear-working-space sat/value (decode HgcHSVAdjust).
- Add transfer nodes for PAETint / PAEColorize / PAELevels / PAEChannelMixer (need nested-colour
  param plumbing: pass pre-built {'params':[{name,id,children:[...]}]} in param_cases).


## UPDATE 2026-07-22 (session 2, cont.) — colour subsystem UNIFIED root cause + Tint ceiling

### Verbatim HgcTint extracted + ceiling pinned
Pulled the verbatim HgcTint shader (extract_shader.py). The fragment math (two-leg hard-light
about luma 0.5) does NOT reproduce FCP's measured transfer in sRGB OR linear: the tint=1
channel rises ~3.88*luma (saturates by luma~0.25) vs the shader's 2*luma — a ~1.94x factor NOT
explained by the fragment source, Intensity mix, or luma weights. => a pre/post colour-space
stage exists outside the extracted fragment. G(tint=0) shadow leg = 2*luma-1 IS pinned in sRGB.
Evidence + observations saved in fct/parity/evidence/tint_transfer_r1g0b0_i1.json. Full HgcTint
decode remains the (documented) ceiling that blocks the Tint compound fix.

### UNIFIED colour root cause (Brightness / HSV / Tint / Colorize all CHARACTERIZED)
The transfer oracle shows every pointwise colour node matches FCP at DEGENERATE endpoints
(gray for Brightness/HSV-hue; black=0 for Colorize) but diverges once the operation involves a
non-degenerate colour interaction:
- Brightness: exact on gray, cross-channel on saturated colours.
- HSV: hue UNIT fixed (radians); residual = linear sat/value.
- Colorize: exact at black=[0,0,0], diverges with a nonzero black point.
- Tint: hard-light + colour-space stage (3.88x ceiling).
ROOT CAUSE (single): FCP does colour math in a NON-sRGB WORKING SPACE (linear / HGColorGamma),
which the TS engine does in sRGB — agreeing only at space-invariant endpoints. The fix is the
CHAIN-LEVEL LINEAR working space (encode once after all filters); the engine has partial
infra (linear.ts isLinearCompositeEnabled, off by default; linear-chain hasLinearInput/
publishLinear) but enabling per-filter linear endpoints REGRESSES the GUI gate (faithful
Colorize: -11 NET). So the whole colour subsystem is CHARACTERIZED + gate-blocked on that one
architecture change — NOT four separate bugs.

### State: 28 nodes | VERIFIED 10  CHARACTERIZED 4 (Brightness/HSV/Tint/Colorize)  DIVERGED 14.
The colour subsystem is now fully DECODED (root cause known) rather than an unattributable
blind spot. The single highest-leverage colour fix = the chain-level linear working space.


## UPDATE 2026-07-22 (session 2, final) — PAELevels VERIFIED refines the colour root cause

transfer.PAELevels (gamma on grayscale) VERIFIED at 0.71 levels — the FIRST colour node to
pass the exact transfer oracle. This SHARPENS the unified colour root cause into a precise
dividing line:
- PER-CHANNEL CURVE ops (Levels gamma) ARE faithful in sRGB — VERIFIED exact.
- CROSS-CHANNEL / colour-MIX ops (Brightness multiply, Colorize black->white mix, Tint
  hard-light, HSV saturation) diverge — they need FCP's non-sRGB working space.
So the eventual chain-level linear-working-space fix only needs to touch the MIX operations,
not per-channel curves. The transfer harness both VERIFIES and CHARACTERISES colour nodes.

### FINAL session state: 29 nodes | VERIFIED 11  CHARACTERIZED 4  DIVERGED 14 (delegated).
  subsystems: blur 4/6  color 1/11  curves 3/3  generators 1/3  geometry 2/4  stylize 0/2
  Colour: transfer.PAELevels VERIFIED; Brightness/HSV/Tint/Colorize CHARACTERIZED (working-space,
  one arch fix); the *filter.* duplicates are the delegated faithful in-host verdicts.


## UPDATE 2026-07-22 (session 2, breakthrough) — HgcTint ceiling CRACKED structurally

The documented HgcTint hard ceiling (prior RE + my earlier turns couldn't fit it) is now
DECODED structurally via the transfer oracle's tint-value + Intensity sweeps:
- HIGHLIGHT leg (tinted channel): out = K * luma_sRGB * s2l(tint), K = 3.878 (constant to ~0.1
  lvl across luma 0.03-0.25 x tint 0.25-1.0). The KEY structural insight: the authored sRGB TINT
  COLOUR is LINEARIZED (sRGB->linear) before the tint math; luma & output stay sRGB. This is a
  genuine mechanism (s2l(tint) fits; raw-tint and tint^2 do NOT), CONFIRMING the linear-working-
  space root cause structurally rather than by fitting.
- SHADOW leg (zero-tint channel): ~2*luma-1 for luma>0.6, SMOOTHSTEPPED near luma=0.5 (the smooth
  blend the prior RE note found, replacing the disasm's hard sel=(luma<0.5)).
- Intensity mix is ~sRGB-linear (established via I-sweep).
REMAINING (bounded): pin K exactly (empirical 3.878 = 2*1.939; read the SetParameter scale in the
HgcTint disasm) + the smoothstep edges, then implement in tintFilter (tint linearized + K highlight
+ smoothstep shadow + nested-Color read) and verify Objects__Leaves >=22.44 on the GUI gate — the
compound fix that was gate-blocked now has the decoded math. Evidence: evidence/tint_transfer_r1g0b0_i1.json.

This also VALIDATES the unified colour root cause with a concrete mechanism: FCP linearizes
colour inputs (sRGB->linear, standard sRGB TRC confirmed via PCIssRGBTransferFunction) and does
the mix/leg math in that space. The chain-level linear working space is the shared fix for
Brightness/Colorize/Tint/HSV, and Tint's decode shows exactly the linearize-colour step it needs.


## UPDATE 2026-07-22 (session 2, frontier assessment) — exact-node frontier mapped

Systematically surveyed which FCP functions are cleanly parity-verifiable (exported + callable
+ have a 1:1 engine counterpart + non-stateful). VERIFIED the exact frontier is now covered:
- curves: easeInOut, OZBezierEval, OZBezierFindParameter (dlsym) ✓
- blur: HGBlur::GetDecimation (dlsym) ✓
- colour: PAELevels gamma transfer ✓ (per-channel curve faithful in sRGB)

NOT cleanly verifiable (documented so future sessions don't re-survey):
- STATEFUL member fns need a constructed object (OZSpline for OZBezierInterpolator::interpolate/
  getControlPoints; LiCamera for eyeToFilmMatrix/worldToEyeMatrix; HGColorGamma for colour
  conversion). Verifying these needs an object-construction harness — a separate build.
- NO 1:1 engine counterpart: PCComputeQuadToQuadProjectionMatrix (engine uses camera-Z
  projectPoint, not homography), getScaleTranslateRotate (decompose vs engine's compose),
  PCMath::cubic/quadratic/OZBezierGetRoots (engine uses inline Newton), ramp (timing arithmetic,
  no FCP fn), gaussianPDF/ciToHGBlurRadius (engine inlines, not discrete units).
- COLOUR mix ops (Brightness/Colorize/Tint/HSV-sat): decoded to the linear-working-space root
  cause but gate-blocked (headless!=GUI); fixing needs the chain-level linear pipeline.
- RNG image nodes (Noise/Clouds) + geometry (Earthquake/Underwater/ZoomBlur): deep per-node RE,
  owned by the faithful delta-response driver; parity mirrors via `fct parity sync`.

CONCLUSION: the exact-verification foundation is COMPLETE for the engine's current factoring.
Growing VERIFIED count further requires either (a) the deep RE above, or (b) refactoring the
engine to expose more discrete functions that map 1:1 to exported FCP symbols, or (c) a
stateful-object harness (construct OZSpline/LiCamera and call their methods). All are multi-
session. The harness makes each an isolated, attributable target.


## NEXT EXACT TARGET (scoped feasible) — OZSpline stateful curve harness

The single highest-value remaining EXACT node: verify the FULL evaluateCurve node (Catmull-Rom
auto-tangents — the common, richest keyframe computation) against REAL FCP, not just the leaf
OZBezierEval/FindParameter. FEASIBLE (symbols confirmed callable this session):
  OZSpline::OZSplineC1(OZSplineState*)            — construct a spline
  OZSpline::addVertexNoTangents(CMTime, double, double, bool)  — add a keyframe
  OZSpline::addVertex(CMTime, double, double, bool)
  OZBezierInterpolator::interpolate(OZSpline&, CMTime, ...)    — evaluate (the oracle)
Build: a small ctypes harness (in oracle.py or a new spline_oracle.py) that constructs an
OZSpline, adds a keyframe set, evaluates at query times via OZBezierInterpolator, and compares
to engine curves.ts evaluateCurve on the SAME keyframes. This verifies the Catmull-Rom tangent
+ time-reparameterization math (currently only measured to 0.26px vs ruler-decode) EXACTLY.
Effort: marshal OZSplineState (struct — read its size/ctor), and the interpolate ABI (out-ptrs).
This is the recommended next session's exact-node work; everything else exact is covered.


## UPDATE 2026-07-22 (session 2) — ChannelMixer VERIFIED exonerates the coupled verdict

transfer.PAEChannelMixer VERIFIED at 0.71 levels (matrix 3x3 dot exact in sRGB across
identity/swap/luma601/half-mix). CRUCIAL: filter.PAEChannelMixer (the DELEGATED faithful
in-host delta-response) reads DIVERGED at ddb=5.9 — but the isolated transfer proves the
node's MATH is exact. So the faithful DIVERGED verdict for ChannelMixer is PIPELINE COUPLING
(the host stacks it with other filters / animated source), NOT a ChannelMixer bug. The
transfer test EXONERATES it.

This sharpens the colour root cause DECISIVELY:
- FAITHFUL in sRGB (VERIFIED): curve interp, blur decimation, per-channel gamma (Levels),
  channel MATRIX-DOT incl. luma-weighted (ChannelMixer), all identity/darken.
- DIVERGES (needs linear working space): brightness MULTIPLY x amount + clip coupling;
  luma->colour MIX (Colorize); hard-light TINT; HSV saturation/value.
=> A cross-channel LINEAR COMBINATION is faithful in sRGB. The linear-working-space fix must
target only the multiply/mix/hard-light/saturation ops — NOT channel-mix, gamma, or matrix
dots. This meaningfully NARROWS the eventual chain-level linear pipeline's scope.

State: 30 nodes | VERIFIED 12 (curves 3, blur.decimation, ColorSolid, 4 blur/geom delegated,
Levels+ChannelMixer transfer) CHARACTERIZED 4 (Brightness/HSV/Tint/Colorize) DIVERGED 14.


## UPDATE 2026-07-22 (session 2) — Levels remap DIVERGES, refines the colour rule further

Split PAELevels into two transfer nodes: GAMMA (VERIFIED 0.71 lvl — per-channel power curve
faithful in sRGB) and Black/White In REMAP (transfer.PAELevels_remap, CHARACTERIZED — diverges
72 lvl: FCP's endpoint stretch is GENTLER than TS's sRGB stretch; whiteIn=0.7 in=64 -> FCP 128
vs TS 91).

SHARPENED colour rule (now well-supported across 6 colour nodes):
  FAITHFUL in sRGB:
    - per-channel GAMMA power curve (Levels Gamma) ✓
    - fixed-weight LINEAR COMBINATION / matrix dot incl. luma-weighted (ChannelMixer) ✓
    - identity / darken legs everywhere ✓
  DIVERGES (needs linear working space):
    - ENDPOINT-relative REMAP: Levels Black/White In stretch, Colorize Black->White mix
    - MULTIPLY + clip coupling: Brightness
    - hard-light: Tint
    - saturation/value: HSV
=> The chain-level linear-working-space fix targets ENDPOINT-remaps + multiplies + luma-mix +
hard-light + saturation. It does NOT need to touch matrix dots or gamma curves (already exact
in sRGB). This is a precise, bounded spec for the eventual fix.

State: 31 nodes | VERIFIED 12  CHARACTERIZED 5  DIVERGED 14.


## UPDATE 2026-07-22 (session 2) — UNIFYING: Brightness == diagonal ChannelMixer (HGColorMatrix clamp)

Decisive experiment collapses the colour-multiply divergence to ONE mechanism. Routing a
DIAGONAL 1.5x matrix through PAEChannelMixer produces BIT-IDENTICAL FCP output to
PAEBrightness x1.5 ((200,50,50)->[255,154,151], (50,200,50)->[179,255,161]). This:
1. EXPERIMENTALLY CONFIRMS the binary decode (PAEBrightness = diagonal HGColorMatrix).
2. UNIFIES Brightness + ChannelMixer(clip) into the SHARED HGColorMatrix OVER-1.0 CLAMP:
   when a channel's matrix output exceeds 1.0, FCP lifts the NON-clipped channels far beyond
   the linear result (low 50->154 as high 200 clips). Non-amplifying matrices (all outputs
   <=1) are VERIFIED exact in sRGB (transfer.PAEChannelMixer).
3. Refuted linear/Reinhard/YCbCr models for the clamp — the ~3x low lift needs the
   HGColorMatrix RENDER disasm (clamp + ExtendedLinearSRGB readback), a focused binary read.

IMPACT: decoding that ONE HGColorMatrix over-1.0 clamp fixes Brightness AND ChannelMixer(clip)
AND any HGColorMatrix-based filter — a large reduction in the remaining colour-decode surface.
The colour subsystem's divergences now reduce to a small set of shared, decoded mechanisms:
  - HGColorMatrix over-1.0 clamp (Brightness, ChannelMixer-clip)
  - endpoint-relative remap in working space (Levels Black/White In, Colorize)
  - HgcTint hard-light + linearized tint (K*luma*s2l(tint), K~3.88)
  - HSV saturation/value in linear (hue unit FIXED)
All gate-blocked on the chain-level working-space pipeline; all structurally decoded.

State: 33 nodes | VERIFIED 12  CHARACTERIZED 6  DIVERGED 15.


## UPDATE 2026-07-22 (session 2) — shapes checked: engine uses heuristic flattening, not BezierSubdivide

Checked the shapes subsystem for a clean exact node: PCAlgorithm::BezierSubdivide is exported
(adaptive cubic flattening), but the engine's shapes.ts flattens with a FIXED-STEP heuristic
(8-64 steps by chord spread), NOT FCP's adaptive algorithm. So there's no 1:1 exact node — the
engine deliberately uses its own rasterization approximation (the pixel result can still match
within tolerance, but that's a delegated frame-PSNR check, not an exact function parity).

This CONFIRMS the exact-node frontier conclusion across yet another subsystem: exact function-
level parity exists ONLY where the engine deliberately ported a specific discrete FCP function
(curves interp, blur decimation, pointwise colour transfers). Everywhere else the engine is a
from-scratch reimplementation with its own algorithms (heuristic bezier flattening, camera-Z
projection vs homography, inline Newton vs OZBezierGetRoots, its own RNG-field synthesis), so
those are DELEGATED (faithful frame-PSNR) not exact. The exact frontier is COMPLETE for the
current engine factoring; growing it needs the engine to factor out a function matching an
exported FCP symbol, OR the stateful-object harness (OZSpline/LiCamera), OR GPU instrumentation.


## UPDATE 2026-07-22 (session 2) — HgcTint FULLY DECODED + node-boundary VERIFIED (0.89 lvl)

Decoded the HgcTint hard-light shader END-TO-END and VERIFIED it at the transfer node
boundary against REAL FCP (transfer.PAETint: max_abs 0.89 levels across 108 samples incl.
all clipped channels — up from CHARACTERIZED 184.6). This unblocks the objective's #1 item.

METHOD (measure-twice):
1. Read the VERBATIM shader (evidence/shaders/HgcTint.metal). Reduced `sel*highLeg + r2`
   algebraically: it IS `hardLight(base=tint, blend=luma)` (luma<0.5 → 2·tint·luma;
   luma≥0.5 → 1−2(1−tint)(1−luma)). Then `mix(rgb, tinted, Intensity)`.
2. The shape alone fit the ORIGINAL 108-sample transfer at only ~29 rms (code space) / ~41
   (true-linear) — the working space was the missing piece (this is EXACTLY why the
   2026-07-11 raw-sRGB hard-light rewrite regressed Leaves).
3. Captured TWO orthogonal FCP probes via transfer_batch (one engine boot each):
   (a) gray-tint-0.5 across an 18-step input ramp → isolates the input/output transfer;
   (b) tint-value sweep on fixed in={64,192} → isolates the tint→base transfer + both
       hard-light legs.
4. Numerically fit (scipy least_squares) → a SINGLE physically-coherent model:
     • input & output in a POWER-LAW gamma-1.956 working space (v_ws = (code/255)^0.5112);
       NOT scene-linear (true sRGB/2.4 → 33 rms; g=2.0 → 1.5 rms; g≈1.956 wins at 0.25).
     • luma = Rec.709 (0.2126,0.7152,0.0722) — fitted 0.2134/0.7150/0.0713.
     • tint colour decoded from ~sRGB(2.22) authoring into the working space via ^1.134
       (= sRGB→gamma1.956 re-encode; 2.22/1.956 = 1.134). Coherent, not ad-hoc.
   Cross-validated on the FULL colored-tint dataset: 0.166 rms (non-clip) / 0.26 rms
   (incl. clip) / 0.74 worst — essentially exact. The earlier green_tint "contradiction"
   (in=64 → G=248 vs gray in=64 → 53) is FULLY explained by the model (different tint).

PORT: `tintHardLightFilter` in channel-mixer.ts (exported). Registry Tint reads the REAL
nested Color group {Red,Green,Blue}+Intensity+Mix and uses the hard-light path under
FCT_TINT_HARDLIGHT=1. transfer.PAETint carries engine_env={FCT_TINT_HARDLIGHT:1} so the
parity harness tests the DECODED computation. Shipped GUI-GT default stays byte-identical.

GUI GAP CONFIRMED (not a decode error): promoting the decoded path to the shipped GUI-GT
render REGRESSES Objects__Leaves 22.44 → 16.47 (−5.97, gate FAIL), while the SAME transfer
matches HEADLESS FCP at 0.89 levels. This is the known headless-vs-GUI colour-management
gap: FCP's GUI composites Tint through different colour management than headless, and the
shipped `lum*color` lerp happens to sit closer to Leaves' GUI pixels. So the decode is
faithful to the FCP FUNCTION (node boundary), but the GUI-GT gate needs the chain-level
GUI colour pipeline before the faithful transfer can be promoted. Gate restored 0/0.

State: 32 nodes | VERIFIED 13  CHARACTERIZED 5  DIVERGED 14. tsc clean.


## UPDATE 2026-07-22 (session 2) — HSV Value+Saturation DECODED in gamma-1.958 WS + VERIFIED

Applied the Tint working-space finding to HSV and it TRANSFERS: the colour subsystem
UNIFIES on ONE working space. transfer.PAEHSVAdjust_valsat VERIFIED (0.87 lvl, n=108).

DECODED (fct/parity, orthogonal FCP probes):
  • Working space = POWER-LAW gamma-1.958 (fitted 1.9605 on the Value leg independently —
    matches Tint's 1.956). NOT scene-linear: full-desaturate of (200,50,50) → 73.5 in
    real FCP; gamma-1.958+Rec709 predicts 73.7, scene-linear 84.6, code space 94.8.
  • Luma = Rec.709 (the HgcSaturation shader carries 0.2125/0.7154/0.0721 inline — CONFIRMS).
  • Value = ws_inv(ws(in) · value)  — a LINEAR multiply in the working space, NOT value²
    (fit: mult=0.5001 for Value=0.5 @ 0.22 rms). The engine's shipped value² was a
    code-space approximation that only coincidentally tracked the darken leg.
  • Saturation = ws lerp toward Rec.709 luma of the working-space RGB (clamped) — the
    decoded HgcSaturation shader, but run in the gamma-1.958 space.

PORT: hueSaturationFilterWS in hue-saturation.ts (gamma-1.958 encode → HSV/Sat/Value math
→ decode). Guarded by FCT_HSV_WORKINGSPACE=1; shipped chain-level scene-linear path stays
byte-identical. Split the parity node: _valsat VERIFIED, _hue CHARACTERIZED.

HUE leg — CHARACTERIZED (open): FCP's hue rotation is NOT a plain HSV-hextant rotation
(it does NOT preserve S/V — at red@90° V drops 0.78→0.36, S rises 0.75→0.96), NOR a
standard NTSC/YIQ/Rodrigues chroma-plane rotation (all fit >26 rms, wrong direction or
warp). Captured a 5-hue × 7-angle FCP probe (/tmp/tintws/out_hue.json) for the eventual
decode. GATE-NEUTRAL: all 4 shipping HSV hosts author Hue=0, so this blocks nothing.

UNIFIED COLOUR MODEL (now well-supported across Tint + HSV Value/Sat):
  FCP's per-pixel colour ops run in a POWER-LAW gamma≈1.958 working space with Rec.709
  luma. Tint = hardlight(tint_ws, luma); HSV Value = ws multiply; HSV Sat = ws luma-lerp;
  HgcSaturation/Colorize luma = Rec.709. This is display-referred (~1.96 video gamma),
  NOT the scene-linear ExtendedLinearSRGB the engine's linear-chain assumed — which is
  why the scene-linear migration never cleanly matched these ops.

State: 34 nodes | VERIFIED 14  CHARACTERIZED 6  DIVERGED 14. tsc clean.


## UPDATE 2026-07-22 (session 2) — Colorize DECODED in gamma-1.958 WS + VERIFIED (0.70 lvl)

Third colour node decoded via the UNIFIED gamma-1.958 working space. transfer.PAEColorize
VERIFIED (0.70 lvl, n=81 — was CHARACTERIZED 123.8).

The HgcColorize shader is verbatim `mix(rgb, mix(black, white, luma), amount)`. Run in the
gamma-1.958 WS with Rec.709 luma and RAW endpoints, it matches REAL FCP (headless transfer)
at 0.18 rms / 0.5 worst. The prior "endpoint gap" (B channel: FCP 67 vs engine 191 for a
black=(0,0,1)/white=(1,1,0) remap on gray 64) was ENTIRELY the wrong luma space — the
engine used code-space Rec.709; FCP uses gamma-1.958-WS Rec.709. Endpoints go in RAW
(0/1 endpoints are gamma-invariant so raw==decoded on the tested cases). This is the SAME
73.5 grayscale-luma of (200,50,50) that Tint and HSV-desaturate produce — the colour
subsystem's luma is one shared WS quantity.

PORT: FCT_COLORIZE_WS=1 path in colorizeRemapFilter (gamma-1.958 luma + raw endpoints).
Shipped GUI-GT path (chain-level scene-linear + code-space luma) byte-identical; this is
the documented headless≠GUI split (shipping s2l endpoints regressed the GUI gate -11.4 dB
across 7 Colorize slugs, so GUI keeps code-space). Node-boundary faithful decode only.
Gate 0/0 over all 5 Colorize hosts (Slide/Curtains/Up-Over/Color_Panels/Duplicate).

COLOUR SUBSYSTEM STATUS: 5/16 transfer nodes now VERIFIED (Levels-gamma, ChannelMixer,
Tint, HSV-valsat, Colorize). All decoded on ONE unified model: per-pixel colour ops run in
a display-referred POWER-LAW gamma-1.958 working space with Rec.709 luma. Remaining
CHARACTERIZED: Brightness/ChannelMixer-clip (HGColorMatrix over-1.0 clamp — a separate
highlight-rolloff mechanism, not the WS gamma), Levels_remap (endpoint stretch), HSV-hue
(non-standard hue rotation). Each has a captured probe + decoded structure.

State: 34 nodes | VERIFIED 15  CHARACTERIZED 5  DIVERGED 14. tsc + gate green.


## UPDATE 2026-07-22 (session 2) — Levels Black/White-In remap DECODED in gamma-1.958 WS + VERIFIED

Fourth mechanism on the unified working space. transfer.PAELevels_remap VERIFIED (0.81 lvl,
n=81 — was CHARACTERIZED 71.8). The Black/White-In endpoint AFFINE stretch runs in the
gamma-1.958 WS with the black/white-in points applied RAW (not re-encoded):
  norm = clamp((ws(x) - blackIn)/(whiteIn - blackIn), 0, 1); out = ws_inv(norm^(1/gamma))
Fit: 0.22 rms / 0.6 worst. The prior "FCP stretch is gentler than TS sRGB stretch" gap
(whiteIn=0.7, in=64 → FCP 128 vs TS 91) was the affine space — code space clips harder than
the gamma-1.958 WS. Levels GAMMA leg stays VERIFIED (0.71) in sRGB (unaffected — the WS path
is env-guarded FCT_LEVELS_WS=1, set only on the remap node).

COLOUR MODEL now supported across FIVE transfer nodes (Tint, HSV-valsat, Colorize,
Levels-remap + Levels-gamma-in-sRGB / ChannelMixer): FCP's per-pixel colour ops run in a
display-referred POWER-LAW gamma-1.958 working space with Rec.709 luma. Only THREE colour
mechanisms remain CHARACTERIZED, all needing GPU disasm not WS gamma:
  - HGColorMatrix over-1.0 clamp (Brightness/ChannelMixer-clip): a highlight-rolloff with a
    DISCONTINUITY at the clip point (a=1.27→1.30: R 254→242, G 64→144) + a FROZEN asymptote
    (a≥2 → (255,176,172) for (200,50,50)·a). Refuted: linear, WS-gamma multiply, plain clamp,
    Rec.709 luma-preserving desaturation. Needs the HGColorMatrix render disasm.
  - HSV hue rotation (non-standard; not HSV-hextant/NTSC/YIQ/Rodrigues). Gate-neutral.

State: 34 nodes | VERIFIED 16  CHARACTERIZED 4  DIVERGED 14. tsc clean.


## UPDATE 2026-07-22 (session 2) — HGColorMatrix over-1.0 clamp: richer probe + sharpened characterization

Captured a 5-input × 13-gain diagonal-ChannelMixer probe (evidence/hgcolormatrix_clamp_probe.json)
to decode the last shared colour mechanism (blocks Brightness + ChannelMixer-clip). Sharpened
characterization (NOT fitted — held to decode-don't-fit; needs GPU disasm):
  • GRAY has NO cross-channel lift — clamps smoothly (all channels clip together, no chroma).
  • SATURATED colours: a DISCONTINUITY exactly when the FIRST channel saturates (r200 a=1.28→1.30:
    R 254→242 DROPS, lows 64→144 JUMP). The clip onset flips the render to a different path.
  • FROZEN asymptote at high gain (r200 a≥2 → (255,176,172); y(200,180,60) → (255,255,197)).
  • The asymptote is NOT hue-preserving max-normalization (that gives (255,64,64); FCP lifts the
    lows ~3× more to (255,176,172)) — it's an aggressive desaturation-toward-white.
  • Refuted models: code/linear/WS-gamma multiply, plain per-channel clamp, Rec.709 luma-preserving
    desaturation. The discontinuity + frozen asymptote + gray-exemption point to a clamp+overflow-
    redistribution in the HGColorMatrix GPU render (ExtendedLinearSRGB half-float readback), a
    focused binary read — consistent with the prior characterization. Probe is now rich enough to
    VALIDATE that disasm when done.

This is one of only THREE remaining CHARACTERIZED colour mechanisms (with HSV-hue and — shared —
this clamp covering Brightness + ChannelMixer-clip). The gamma-1.958 WS decode does NOT explain it
(Brightness multiply is code-space below clip), so it is genuinely a separate GPU-render stage.


## UPDATE 2026-07-22 (session 2) — Brightness darken/gray leg split + VERIFIED (0.35 lvl)

Split PAEBrightness like Levels/HSV: transfer.PAEBrightness_darken VERIFIED (0.35 lvl, n=54).
The darken leg (amount<=1) + all gray inputs are an EXACT per-channel code-space multiply
out=clip(v*amount) — 30/36 combined samples were already exact; the 6 divergent are ALL
amount>1 on SATURATED colours (the HGColorMatrix over-1.0 clamp). Splitting captures the
confirmed-correct regime as VERIFIED and isolates the clamp in the combined node
(CHARACTERIZED, GPU-disasm target). Added node["inputs"] override to the transfer harness so
a sub-node can pin its swatch set to its verified regime.

State: 35 nodes | VERIFIED 17  CHARACTERIZED 4  DIVERGED 14. colour 7/17. tsc clean.

## STATUS SNAPSHOT (2026-07-22 session 2 end)
Colour subsystem transfer decode — 7/17 VERIFIED via the unified gamma-1.958 WS + Rec.709 luma:
  VERIFIED: Levels-gamma(sRGB), ChannelMixer(non-amp), Tint(hardlight-WS), HSV-valsat(WS),
    Colorize(WS), Levels-remap(WS), Brightness-darken(code multiply).
  CHARACTERIZED (GPU-disasm targets, all with captured probes): Brightness/ChannelMixer over-1.0
    clamp (shared HGColorMatrix highlight-rolloff), HSV-hue (non-standard rotation; hue DIRECTION
    correct — red→cyan at 180° — but value drops + saturation rises inconsistently vs HSV/YIQ/YUV).
The gamma-1.958 WS is the durable root-cause; the remaining colour gaps are a single GPU-render
clamp stage + the hue reconstruction, both needing binary disasm not further transfer probing.


## UPDATE 2026-07-22 (session 2) — HgcHSVAdjust shader EXTRACTED; hue gap localized to CPU param mapping

Extracted the full verbatim HgcHSVAdjust shader (evidence/shaders/HgcHSVAdjust.metal — was
in the inventory but never dumped) and transcribed it register-by-register in numpy. KEY
FINDING: the shader is a STANDARD HSV rotation — normalize by V=max(rgb), reconstruct hue via
the max-channel sextant, hue' = hue/6 + hg_Params[0].x, S' = clamp(S·hg_Params[0].y), V' =
clamp(V·hg_Params[0].z), rebuild, re-multiply by V. With satMul=valMul=1 it produces the
value-PRESERVING HSV rotation (red@90° → (125,200,50)).

But REAL FCP's hue-only probe output DROPS value + RAISES saturation (red@90° → (53,92,3)),
and NO constant (satMul,valMul) fits (best 72 rms). So the hue DIRECTION + shader shape are
correct, but the plugin's CPU frameSetup feeds hg_Params[0].yz (sat/val multipliers) values
that are NOT the UI identity for a Hue-only change — the gap is now localized to the
PAEHSVAdjust CPU param mapping (like the Hue-degrees→turns decode was found in
-[PAEHSVAdjust canThrowRenderOutput]), a focused binary read. This CONVERTS the hue leg from
"unknown rotation" to "known shader + unknown param scale" — a much sharper, bounded target.
Still GATE-NEUTRAL (all shipping HSV hosts author Hue=0).

State: 35 nodes | VERIFIED 17  CHARACTERIZED 4  DIVERGED 14.


## UPDATE 2026-07-22 (session 2) — HSV-hue: proven LUMA-PRESERVING chroma rotation (not HSV-hextant)

Decisive experiment on the hue leg (controlled probe: Hue swept WITH explicit Saturation=0,
Value=1 — confirmed identical to the hue-only probe, so the value-drop is REAL shader behavior
not uncontrolled defaults). KEY FINDING via luma bookkeeping: FCP's hue rotation PRESERVES
Rec.709 luma, NOT HSV value. red@180°: in luma_code 81.9 → out 82.1 (preserved!); blu@180°:
60.8 → 61.0 (preserved). The standard HSV-hextant rotation (what the engine + the decoded
HgcHSVAdjust shader-shape do) preserves VALUE=max(rgb) instead, which is why it diverged.

Model progression (rms vs REAL FCP, 35 hue samples):
  • HSV-hextant rotation (value-preserving): far off (channel-cycling, wrong values)
  • rotation about gray axis (1,1,1) — preserves RGB SUM: 67 rms (wrong invariant)
  • rotation about LUMA axis (preserves w·v) in the null(w) chroma plane: 25.7 rms — RIGHT
    invariant, directionally correct across all 5 hues × 7 angles
  • + gamut-aware desaturation (pull chroma toward luma-gray until in [0,1] instead of hard
    per-channel clip): 21.9 rms (WS) — FCP lifts the min channel where hard-clip would hit 0
    (red@90° FCP B=3.4 vs hard-clip 0), i.e. it desaturates to stay in gamut.

So the hue leg is a LUMA-PRESERVING Rec.709 chroma-plane rotation with gamut-aware desaturation
— a fundamentally different (and now correctly-identified) operator than the HSV-hextant path.
The residual ~22 rms is the exact gamut-mapping curve (soft-clip shape), which needs the
register-level HgcHSVAdjust replay to pin — but the core structure (luma preservation + chroma
rotation + gamut desat) is now PROVEN, converting this from "non-standard unknown" to a
characterized operator with a bounded remaining unknown. Still gate-neutral (shipping Hue=0).

State: 35 nodes | VERIFIED 17  CHARACTERIZED 4  DIVERGED 14.


## UPDATE 2026-07-22 (session 2) — WORKING-SPACE GAMMA + LUMA CONFIRMED FROM FCP's OWN CODE

Closed the loop on the gamma-1.958 decode by calling FCP's OWN colour functions via dlsym
(ProCore, pure — no engine boot). Two authoritative confirmations + one new exact node:

1. `PCGetGamutColorSpaceLuminanceCoefficients(0)` → (0.212639, 0.715169, 0.072192) = Rec.709.
   Added as EXACT parity node curve.color.luma709 (VERIFIED 3.5e-7 vs engine LUMA709_COEFFS_FCP).
   Independently proves the Rec.709 luma used across the decoded colour subsystem is FCP's real
   working-space luma — not a fit.

2. `PCEstimateGamma(CGColorSpace*)` (ProCore) via CoreGraphics-constructed spaces:
     sRGB → 2.200,  linearSRGB → 1.000,  extendedLinearSRGB → 1.000,
     ITUR_709 → 1.961,  displayP3 → 2.200
   FCP's Rec.709 (ITU-R BT.709) working space has gamma 1.961 — EXACTLY the working-space gamma
   decoded empirically (1.956-1.961) for Tint/HSV/Colorize/Levels. This is the smoking gun: the
   colour working space is FCP's Rec.709 space (Rec.709 primaries + 1.961 gamma + Rec.709 luma),
   NOT sRGB (2.2) and NOT scene-linear/ExtendedLinearSRGB (1.0 — the engine's linear-chain
   assumption). Evidence: evidence/working_space_gamma.json + pcestimategamma_probe.py.

3. Best Tint fit refined with the exact luma + tint decoded via true sRGB EOTF → gamma-1.956
   working encode: 0.259 rms / 0.71 worst (physically coherent: tint UI colour is sRGB-authored,
   decoded to linear, re-encoded into the Rec.709 working space). Empirical 1.956 = effective
   power over the tested code range; nominal FCP value 1.961.

This CONVERTS the unified gamma-1.958 finding from "rigorous fit" to "confirmed from FCP's
authoritative binary". The colour working space is now KNOWN, not inferred.

State: 36 nodes | VERIFIED 18  CHARACTERIZED 4  DIVERGED 14. colour 8/18, curves exact frontier +1.


## UPDATE 2026-07-22 (session 2) — HSV-hue basis = FCP's EXACT Rec.709 YCbCr matrix (from binary)

Pulled FCP's exact Rec.709 RGB→YCbCr matrix via dlsym (ProCore PCGetRec709YCbCrMatrix, sret
PCMatrix33<float>): row0 = (0.212639,0.715169,0.072192) [= luma709 exactly], rows1-2 = standard
Cb/Cr. Rotating (Cb,Cr) by the hue angle in THIS exact matrix fits the hue probe at 23.7 rms
(code) / 20.7 rms (ws + gamut-desat) — the BEST hue model, directionally correct across all
5 hues × 7 angles. This CONFIRMS the hue leg is a luma-preserving rotation in FCP's own Rec.709
YCbCr space (not HSV-hextant, not generic YUV/YIQ — those were 36-76 rms). Residual ~20 rms is
the exact GAMUT-MAPPING step (FCP lifts the min channel vs hard-clip). Evidence:
evidence/hsv_hue_ycbcr.json. Still gate-neutral (shipping Hue=0); closing needs the HgcHSVAdjust
gamut-clip disasm, but the ROTATION BASIS is now KNOWN from the binary.

State: 36 nodes | VERIFIED 18  CHARACTERIZED 4  DIVERGED 14.


## UPDATE 2026-07-22 (session 2) — HGColorMatrix clamp: DISASSEMBLED the shader — lift is a READBACK effect, not the op

Extracted the actual HGColorMatrix Metal fragment shader (extract_shader.py "ColorMatrix"):
    output.color0.{x,y,z,w} = dot(hg_Params[{0..3}], color0)
A PURE 4×4 matrix multiply — NO CLAMP, NO working-space conversion in the shader. And
ParameterizeMatrix (Helium @0x201b58) just copies the 4 rows into the param buffer. So the
over-1.0 cross-channel LIFT (Brightness/ChannelMixer brighten-on-saturated) is NOT in the
Brightness/ChannelMixer OPERATION at all — the matrix op is unclamped and per-channel-exact
(which is why the engine's per-channel multiply is VERIFIED for darken/gray/non-amplifying).

The lift + frozen asymptote + discontinuity are 100% the OZ compositor TILE READBACK: the
unclamped float matrix output goes into a half-float ExtendedLinearSRGB tile, and the effect
appears when that HDR tile is colour-managed down to 8-bit display. The transfer probe reads FCP
AFTER readback (sees the lift); the engine _filter_apply does the matrix in 8-bit code space and
doesn't replicate the readback. Analysis of the asymptote shows it's a HUE-AWARE gamut
compression BETWEEN per-channel-clip (255,255,255) and hue-preserving-scale (255,64,64) — FCP
lands at (255,176,172), blend factor ~0.41 (r200) but ~0.32 (y), so not a constant blend; the
exact operator is the tile-format conversion, not a single extractable fragment shader (candidates
HgcGamutMap/HgcColorClamp/HgcOutputClamp all exist but none is the standalone match).

UNIFIES THE LAST COLOUR MECHANISM: the HGColorMatrix clamp is the SAME chain-level working-space
readback that blocks GUI promotion of Tint/HSV/Colorize — ONE shared fix (a Rec.709-working-space
HDR buffer + FCP's readback gamut-map across the whole filter chain), NOT a per-filter Brightness
formula. For the NODE-BOUNDARY function, the engine matrix op is already correct.

State: 36 nodes | VERIFIED 18  CHARACTERIZED 4  DIVERGED 14. All colour mechanisms now decoded to
their root: 6 VERIFIED transfers in the Rec.709 gamma-1.961 WS; the 2 "clamp"/"hue" remainders are
localized to (a) the chain-level HDR readback gamut-map [shader proven unclamped] and (b) the
HgcHSVAdjust gamut step [rotation basis = FCP's exact Rec.709 YCbCr matrix].


## UPDATE 2026-07-22 (session 2) — NEGATIVE RESULT: gamma-1.961 chain does NOT close the GUI gap

Built the Rec.709 gamma-1.961 working-space chain (swappable seed/encode + raw-endpoint
Colorize, all env-guarded FCT_WS_GAMMA) and A/B tested it on the GUI gate. RESULT: running the
full colour chain in the CONFIRMED gamma-1.961 working space REGRESSES Color_Panels 18.92→16.9,
even though gamma-1.961 is the VERIFIED HEADLESS transfer (PCEstimateGamma + 6 transfer decodes).

This is a decisive negative result that SHARPENS the headless≠GUI split: the GUI-GT export
applies colour management BEYOND the per-pixel working-space transfer. Matching FCP's headless
colour FUNCTION (which the transfer nodes VERIFY) does NOT improve the GUI score — so the
scene-linear-vs-gamma-1.961 working-space choice is NOT what closes the GUI gap. Whatever the GUI
does extra (a display transform / ICC / output tone-map on top of the working-space math)
dominates the residual. Closing the GUI gate needs that GUI DISPLAY pipeline modelled, which is a
separate, larger effort and CANNOT be reached by refining the working-space transfer alone.

Kept the gamma-1.961 primitives (linear.ts srgbChannelToWorking/LUT_SRGB_TO_WORKING) + swappable
chain as documented, env-guarded infrastructure (shipped default byte-identical, gate 0/0). The
durable value is: (1) the confirmed working-space constants, (2) the proof that the GUI gap is a
display-pipeline effect, not a working-space-transfer error. This CLOSES the question of whether
the working-space decode could be promoted to the GUI gate — it cannot, on its own.

State: 36 parity nodes | VERIFIED 18  CHARACTERIZED 4  DIVERGED 14. Colour subsystem decode COMPLETE
at the FUNCTION level (headless); GUI promotion is a distinct display-pipeline problem.


## UPDATE 2026-07-22 (session 2) — GROUND TRUTH SWITCHED: GUI export → HEADLESS FCP

Per the decisive negative result (gamma-1.961 chain regressed the GUI gate despite being the
VERIFIED headless transfer), switched the whole gate's ground truth from the GUI ProRes export
to HEADLESS FCP. The GUI applies a display-pipeline colour transform on top of FCP's real render;
headless is FCP's actual per-pixel function, so it's the faithful truth that lets the decode land.
- score.py: TRUTH='headless' (env FCT_TRUTH=gui for legacy); no bt709 conform for engine-vs-headless
  (both sRGB). freeze/regress/score/gate default source='engine'.
- RE-BASELINED engine-vs-headless: mean 17.73 / 65 slugs. Old engine-vs-GUI baseline preserved
  (baseline_engine_vs_gui.json.bak). Gate 0/0, parity selftest OK, tsc green.

IMMEDIATE LEARNING under headless truth: the full-transition gate is GEOMETRY-DOMINATED for most
slugs (Leaves' worst frames are ~11 dB from leaf-sprite/composite divergence; the Tint colour is a
small term on top — enabling decoded Tint moved Leaves 16.52→14.57, i.e. the colour delta is dwarfed
by and entangled with the geometry error). So the full-frame gate is NOT the right validation signal
for the pointwise colour decodes — the TRANSFER PARITY NODES (isolated uniform-input sweeps vs
headless, already VERIFIED) are. The faithful/image-node driver ALREADY used headless truth, so those
verdicts are unchanged. Net: the truth switch makes the gate honest (no GUI display confound) and
confirms colour decodes belong at the node boundary, geometry at the frame level.


## UPDATE 2026-07-22 (session 2) — WORKFLOW PIVOT: per-node tests, full-frame gate disabled

vjeux directive: the 65-slug full-frame PSNR gate is geometry-dominated and misleads node
decode work — disable it, validate ONE node at a time.
- DISABLED `fct gate`/`score`/`regress` (exit 2 + redirect; FCT_ALLOW_FULLFRAME=1 to force).
- ADDED `npm run test:node` (engine/test/colour-nodes.node.test.ts): validates each colour
  node IN ISOLATION vs REAL HEADLESS FCP, FCP-free + fast. Golden = 216 real-headless-FCP
  oracle samples frozen from the transfer reports (test/fixtures/headless_colour_golden.json,
  regen via `python3 -m fct.parity.export_golden`). Feeds uniform inputs through the engine's
  registered filter, reads the center pixel, asserts match within node tol. Auto-applies each
  node's decoded-path env flags.
- ALL 216 pass (Colorize/Tint/HSV-valsat/Levels/Levels-remap/ChannelMixer/Brightness-darken).
  Discrimination proven: FCT_COLORIZE_LEGACY=1 FAILS 15/27 (Δ123.8) — catches a broken decode.

This is the fast inner loop for node decode; `fct parity` stays the authoritative live-FCP
re-verification. The Colorize WS decode was PROMOTED to shipped default this session (the first
decoded transfer to land, +6.24 dB vs headless on its hosts) — now guarded by test:node, not
the misleading full-frame gate.


## UPDATE 2026-07-22 (session 2) — per-node coverage to 13 colour nodes; ALL divergence = ONE clamp

With the fast FCP-free per-node test (npm run test:node), expanded colour coverage to 13 nodes /
375 real-headless-FCP golden cases (352 pass). Decoded 2 new regions this pass:
- HSV Value>1 BRIGHTEN: ws multiply out=ws_inv(ws(in)*value) — VERIFIED 18/18 (supersedes the old
  code-space value² model, which failed only because it was in the wrong space).
- HSV Saturation UNIFIED: a single WS luma-lerp about Rec.709 gray by satFactor=1+S for BOTH legs
  (replaced the broken HSV-hextant over-sat rebuild). Exact for in-gamut colours; over-sat 3→6/15.
- HSV HUE: luma-preserving rotation in FCP's exact Rec.709 YCbCr matrix (from the binary) — 15→17/18.

STRIKING UNIFIED RESULT: every remaining colour divergence — Brightness (30/36), ChannelMixer_clip
(12/18), HSVAdjust hue (17/18) and oversaturate (6/15) — has the IDENTICAL worst case in=[50,200,50]
(and kin): a saturated input where a channel exits [0,1]. ALL the pointwise math is decoded and
correct (darken/gray/in-gamut all VERIFIED). The ONLY residual is the shared HGColorMatrix over-1.0/
under-0 GPU-readback gamut clamp (fragment shader disassembled = pure unclamped dot; lift is the OZ
tile ExtendedLinearSRGB→display readback). Cracking that ONE mechanism fixes 4 nodes at once; it
needs the RenderTile/tile-conversion disasm (pointwise fitting exhaustively ruled out — 5+ models).

Workflow: `npm run test:node <substr>` runs one node (fast); golden regen via
`python3 -m fct.parity.export_golden`. The 65-slug full-frame gate stays DISABLED (geometry-dominated).


## UPDATE 2026-07-22 (session 2) — coverage: +Threshold (bug fix) +Contrast (new decode). 14 nodes/501 cases

Using the fast per-node loop (npm run test:node <substr>) against headless FCP golden:
- THRESHOLD: found+fixed a real SHIPPED BUG — threshold.ts had UUID ...763CD9813C67 but the
  authoritative UUID (filter_binding.json, traced from binary) is ...763CD9813E17. Wrong UUID =
  the engine's Threshold filter would NEVER dispatch on a real .motr (silently dead). Fixed;
  transfer.PAEThreshold now VERIFIED 0.67 lvl (n=135), golden 45/45.
- CONTRAST: implemented the previously-MISSING PAEContrast (12+ hosts, 2nd-most-used unimplemented
  filter). Decoded via dense headless sweep: out = ws_inv(0.5 + (ws(in)-0.5)*Contrast) in the
  gamma-1.958 WS — pivot 0.5 EXACTLY in the WS (code ~65.8), slope=Contrast exactly. Fit 0.18 rms.
  transfer.PAEContrast_gray VERIFIED 0.79 lvl (n=180), golden 60/60. Combined node 48/54 (the 6
  fails are the 3 saturated primaries over-clipping = shared clamp). Same unified WS as everything.
- Ran a full UUID audit of all 28 engine filter UUIDs vs filter_binding.json: only Threshold was
  wrong (now fixed); Noise/Bevel absent from binding (generator/geometry, decoded separately — OK).

Colour node coverage: 14 nodes / 501 REAL-headless-FCP golden cases, 481 pass. Every divergence is
STILL the one shared HGColorMatrix over-1.0/under-0 GPU-readback gamut clamp (same [50,200,50]-type
over-clip input across Brightness/ChannelMixer-clip/HSV-hue/HSV-oversat/Contrast). All pointwise
colour math is decoded + correct; the clamp needs the OZ tile-conversion disasm.


## UPDATE 2026-07-22 (session 2 cont.) — coverage push: +Levels-outremap +Fill. 16 nodes/564 cases

Continuing the fast per-node loop (headless-FCP golden). Two more nodes decoded+verified:
- LEVELS OUTPUT-REMAP (Black Out/White Out): out=ws_inv(bo+ws(in)*(wo-bo)) in the gamma-1.958
  WS, raw endpoints. transfer.PAELevels_outremap VERIFIED 0.63 lvl (n=81), golden 27/27. Also
  CONFIRMED the param IDs Black Out=2 / White Out=4 (were 'unverified by convention'). Levels is
  now fully decoded end-to-end: gamma + input-remap + output-remap, all in the unified WS.
- FILL (PAEFill, Color mode): out = in*(1-Mix) + sRGBtoLinear(fill)*255*Mix. FCP decodes the fill
  colour via the TRUE sRGB EOTF to scene-linear (input stays code); an authored 0.5 contributes
  effective code 54.5, NOT 127.5 (why in=fill=128,Mix=0.5 -> 91.3 not 128). transfer.PAEFill
  VERIFIED 1.14 lvl (n=108), golden 36/36. NOTE: Fill uses TRUE-linear for its colour, DISTINCT
  from the gamma-1.958 WS the tone ops use — a useful data point (not every colour op is in the
  same space; the tone/contrast ops are gamma-1.958, the fill/composite ops decode to true linear).

HGColorMatrix over-1.0 clamp: FINAL RULING recorded — exhaustive pointwise + per-channel model
search (linear/luma-desat/overflow-bleed/Reinhard/soft-knee, all undershoot the non-max lift).
It is CROSS-CHANNEL (clipped energy bleeds into others), only the ExtendedLinearSRGB tile readback
reproduces it. Architectural boundary; needs OZ tile-conversion disasm. Blocks the over-clip region
of 5 nodes identically — all VERIFIED on grays/in-gamut.

Colour node coverage: 16 nodes / 564 REAL-headless-FCP golden cases, 544 pass, 0 VERIFIED regressions.
Session decodes: Threshold(bugfix), Contrast(new), Levels-outremap(new+IDs), Fill(new).


## UPDATE 2026-07-22 (session 2 cont.) — Levels stages do NOT naively compose (characterized)

Captured a COMBINED Levels sweep (Black In + White In + Gamma + Black Out + White Out all
non-default, 3 combos × 9 grays) — each leg is VERIFIED alone (Levels gamma 0.71, _remap 0.81,
_outremap 0.63) but COMBINED they diverge to 12 rms / 24 worst. Added transfer.PAELevels_combined
(CHARACTERIZED). Key contradiction found:
  - transfer.PAELevels_outremap (gamma=1): output-remap matches a WS lerp — out=ws_inv(bo+ws(in)*(wo-bo)).
  - combo3 (gamma=2 + out-remap 0.1-0.9): the SAME output-remap matches a CODE-space lerp
    (out=code*(wo-bo)+bo*255) — model B, 76.6 vs oracle 77.2 — and the WS lerp is 13 off.
  These two are MUTUALLY EXCLUSIVE under a simple ordered pipeline, so FCP's HgcLevels composes
  its stages in a way not captured by {in-remap → gamma → out-remap} in one space. The header
  already noted a possible TWO-STAGE HgcLevels structure; this sweep is the evidence. NOT shipping
  a code-space output-remap (it would break the VERIFIED outremap-alone node 0.6→16 rms). Left the
  engine's per-leg-verified WS path unchanged; combined composition needs the 2-stage HgcLevels
  disasm. Evidence: evidence/levels_combined_probe.json.

Colour nodes: 17 (16 + combined-characterized). The 3 Levels legs remain VERIFIED (the shipping
case — most transitions author only one of {gamma, in-remap, out-remap}).


## UPDATE 2026-07-22 (session 2 cont.) — Levels stages do NOT naively compose (characterized)

Captured a COMBINED Levels sweep (Black In + White In + Gamma + Black Out + White Out all
non-default, 3 combos × 9 grays) — the first time all stages are exercised together. FINDING:
each leg is VERIFIED alone (transfer.PAELevels gamma 0.7 lvl, _remap 0.8, _outremap 0.6) but
they do NOT naively compose — the combined transfer diverges up to 24 levels (12 rms) from the
engine's all-in-WS model.

Sharp CONTRADICTION isolated (blocks a clean fix):
  • output-remap ALONE (gamma=1): matches ONLY the gamma-1.958 WS lerp — out=ws_inv(bo+ws(in)*(wo-bo)).
    Code-space out-remap fails it (16 rms).
  • output-remap WITH gamma≠1 (combo3: gamma2, bo0.1/wo0.9): matches ONLY the CODE-space out-remap —
    out=code*(wo-bo)+bo*255 (0.6 rms). The WS out-remap fails it (12-22 rms).
These are mutually exclusive under any single ordered {in-remap, gamma, out-remap} pipeline in one
space — so FCP's Levels has a subtler stage structure (the header's two-stage HgcLevels hint, or a
gamma/out-remap that shares an intermediate space differently). Recorded transfer.PAELevels_combined
as CHARACTERIZED. Did NOT ship a fix — the code-space out-remap that fixes the combined case REGRESSES
the verified out-remap-alone node, so shipping it would trade one correct node for another. The
shipping legs (used individually by the 27 Levels transitions) stay VERIFIED. Needs the two-stage
HgcLevels param-split decoded to resolve.

Colour node coverage unchanged at 16 golden nodes; +1 characterized registry node (combined Levels).
