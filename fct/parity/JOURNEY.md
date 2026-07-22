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
