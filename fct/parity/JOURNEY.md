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
