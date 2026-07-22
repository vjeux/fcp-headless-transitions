# fct/parity — NODE-BOUNDARY parity (the correct structure, 2026-07-22)

## The boundary: one XML node → one computation

vjeux's correction (2026-07-22): the unit of truth is NOT a hand-picked C++ symbol
(too low-level, detached from what the XML actually triggers) and NOT a whole-frame PSNR
through the full pipeline (too coupled — a bug anywhere pins the score, the flat-14.6
local optimum). The unit of truth is **the XML node**:

    ONE .motr node + its params  →  triggers ONE computation.

We ISOLATE that computation, drive it with the node's params, and verify the TS port is
FAITHFUL to what REAL FCP computes for that same node+params — across the param space.

## Node kinds and their isolation strategy

A node's "computation" has a type-specific signature. Each kind has a way to isolate it
in REAL FCP (the oracle) and in the TS engine (the port):

| Node kind (XML)            | Computation signature      | FCP isolation                              | TS isolation                     |
|----------------------------|----------------------------|--------------------------------------------|----------------------------------|
| `<filter pluginName=X>`    | image, params → image      | inject as scene <filter> on A-covers-frame skeleton, render (filter_probe.py) | registry filter .apply (_filter_apply.ts) |
| generator `<scenenode>`    | params → image             | inject generator, render (probe_scene)     | generator .render                |
| `<transform>` on a layer   | params → 4×4 matrix / placement | inject transform, render A placement    | buildTransformMatrix / mat4*     |
| keyframe `<curve>` / interp| (keyframes, t) → value     | author a curve on a driven param, read the value FCP applies at t | evaluateCurve(curve, t) |
| `<behavior>`               | (params, t) → param delta  | inject behavior on a param, read applied value over t | behavior evaluator |

The FIRST-CLASS, cleanest boundary is the **filter node** (image→image, fully isolated by
the existing filter_probe/_filter_apply pair) and the **transform/curve** value computations.

## Why this is faithful AND ungameable
- The oracle is REAL FCP computing the SAME node the .motr declares — not a symbol we
  guessed maps to it. If our TS node-computation matches FCP's across the param space, the
  node is faithful BY CONSTRUCTION at the boundary the engine actually consumes.
- Fuzzing the node's OWN params (not scene signatures) means a scene-signature
  discriminator can't help — there is no scene, just the node.
- Isolation removes pipeline coupling: a divergence is attributable to THIS node's math.

## Metric
Per node kind:
- image→image (filters/generators): PSNR(FCP_out, TS_out) over the param sweep; a node is
  VERIFIED when worst-case PSNR ≥ pass_db (the headless-vs-TS ceiling for that kind).
- value→value (curves/transforms/behaviors): max abs/rel error over the sweep; VERIFIED when
  ≤ tol. (These CAN be exact — matrices and curve values are scalars, not rasterized.)

Signal-gating (from faithful/): only score a param setting where FCP's output actually
RESPONDED (else the param is inert in that node and there's nothing to verify).

## What we keep / retire
- KEEP the dlsym oracle (fct/parity/oracle.py) — it's still the RIGHT tool for the value→
  value kinds whose exact math IS a single exported function (curve interpolation:
  easeInOut/OZBezierEval/OZBezierFindParameter already VERIFIED bit-exact). Those ARE the
  node computation for a keyframe segment of that interp type. We just RE-FRAME them as
  "the computation triggered by an <curve interp=N> segment", not "a C++ symbol".
- ADD the image→image node boundary (filter/generator) as the primary structure, reusing
  filter_probe.py + _filter_apply.ts (already isolate one node vs real FCP).
- The registry becomes a catalog of NODES (by pluginName / interp-type / transform-channel),
  each with: how to isolate it, its param space, its compare metric, its status.

## Relation to the other programs
- fct/faithful/ = whole-primitive DELTA-response PSNR through the full pipeline (integration).
- fct/parity/  = single-NODE computation isolated at the XML boundary (unit). Finer-grained;
  a faithful parity node means any residual faithful-gap for that primitive is pipeline/
  wiring, not the node's own math.
