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
| `<filter pluginName=X>`    | image, params → image      | FAITHFUL delta-response in the node's REAL host (delegated to fct/faithful) — NOT static injection | registry filter .apply |
| generator `<scenenode>`    | params → image             | FAITHFUL delta-response / solo-synth (delegated to fct/faithful) | generator .render |
| `<transform>` on a layer   | params → 4×4 matrix / placement | inject transform, render A placement    | buildTransformMatrix / mat4*     |
| keyframe `<curve>` / interp| (keyframes, t) → value     | the exact FCP fn that segment triggers, called via dlsym | evaluateCurve / cubicBezier / easeInOut |
| `<behavior>`               | (params, t) → param delta  | inject behavior on a param, read applied value over t | behavior evaluator |

The FIRST-CLASS, cleanest EXACT boundary is the **curve/value node** (a keyframe segment's
value IS an exported FCP function — verified bit-for-bit via dlsym; this is parity's unique
contribution). The **image nodes** (filter/generator) use the FAITHFUL DELTA-RESPONSE.

## ⚠️ Image nodes: why we DELEGATE to the faithful delta-response (not static injection)

The naive "inject the filter on a static full-frame source and compare filter(imageA)"
approach is **UNFAITHFUL** — documented in fct/faithful/synth.py (learned 2026-07-18 on
PAELevels): a filter's response depends on its REAL input pipeline (animated source, upstream
filters, working colour space), which a static source does not reproduce. A per-case ABSOLUTE
PSNR against a static injection is therefore the WRONG metric for an image node.

The faithful node-boundary metric for an image node is the DELTA-RESPONSE already built in
fct/faithful/: in the node's REAL host, measure how the output MOVES when the node's param
moves — delta_o = oracle(θ)−oracle(θ0), delta_e = engine(θ)−engine(θ0),
ddb = PSNR(delta_o, delta_e). Any constant pipeline error cancels in the delta, so ddb
isolates THIS node's parameter response even inside the full transition. So parity does NOT
re-implement an image oracle — for filter/generator nodes it DELEGATES to fct/faithful and
surfaces that verdict under the single node registry.

## Why this is faithful AND ungameable
- The oracle is REAL FCP computing the SAME node the .motr declares — not a symbol we
  guessed maps to it. If our TS node-computation matches FCP's across the param space, the
  node is faithful BY CONSTRUCTION at the boundary the engine actually consumes.
- Fuzzing the node's OWN params (not scene signatures) means a scene-signature
  discriminator can't help — there is no scene, just the node.
- Isolation removes pipeline coupling: a divergence is attributable to THIS node's math.

## Metric
Per node kind:
- image→image (filters/generators): DELTA-RESPONSE ddb in the node's REAL host (delegated to
  fct/faithful); a node is VERIFIED when worst-case ddb ≥ pass_db. NOT a static-source PSNR.
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
