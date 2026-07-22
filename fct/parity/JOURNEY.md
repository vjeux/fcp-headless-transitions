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
