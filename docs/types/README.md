# Motion Type Reference

Human-authored reference documentation for the Apple Motion / FCP type system this engine must
reproduce, built from a **5,365-file** corpus of real `.motr/.moti/.moef/.motn` templates
(`~/motr-collection`) fused with the repo's own reverse-engineering ground truth (decoded TS
modules, `Hgc*` shaders, RE write-ups). Corpus usage counts are empirical.

Motion scenes are built from these kinds of typed nodes and cross-cutting constructs:

| Type family | Reference | What it is |
|---|---|---|
| **Filters** (FxPlug effects) | [`../filters/README.md`](../filters/README.md) | Per-pixel image effects hosted on `ProPlugin Filter` nodes — blurs, color, distortions, stylize. **All 141** filters seen in the corpus documented, each with per-parameter meaning, correct types, and implementation status. |
| **Components** (factory node types) | [`COMPONENTS.md`](COMPONENTS.md) | The `<factory>` scene-graph node types — Shape, Replicator, Text, Generator, Camera, Emitter, Light, Clone Layer, Image, Widget, Project, Rig, … — each with a per-type parameter table, plus the **shared object-property block** (Transform/Blending/Crop/Drop Shadow/…) and the `sceneSettings` document settings, documented once. Extends `../CATALOG.md §2` (status) and `§3` (Transform IDs). |
| **Behaviors** (procedural animation) | [`BEHAVIORS.md`](BEHAVIORS.md) | All **34** behaviors — Link, Rig Behavior, Clamp, Ramp, Oscillate, Throw, Gravity, Spring, Motion Path, … — that compute parameter values each frame instead of keyframing, with per-parameter tables and a Parameter/Motion family split. |
| **Constructs** (cross-cutting systems) | [`CONSTRUCTS.md`](CONSTRUCTS.md) | The foundational systems inside every file — the parameter/channel value model, keyframe curves + the full interpolation-type table, rational time, shapes/vertices, gradients, styles/text, the channel-link/expression substrate, and document `sceneSettings`. |

### Decompiled code (ground truth)
Every type doc embeds the **actual code Apple ships**, extracted from the user's licensed FCP install — not paraphrase:
- **Filters** — verbatim `Hgc*` Metal shader source + ARM64 disasm of the PAE render method (see `../filters/`).
- **Behaviors** — all 34 carry a `Decompiled code (ground truth)` subsection with the verbatim ARM64 disasm of their per-frame method (`accumForces`/`accumInitialValues` for physics; `solveNode`/`computeValue`/`createCurveNode`/`getMultiplier`/`handleCollisions` for parameter behaviors), from Ozone's core + `Behaviors.ozp`.
- **Components** — 15 of 16 types carry verbatim disasm. Camera (`LiCamera::localToClipMatrix`) and Light (`LiLight::getSpotNodeSurface`) from Lithium; Emitter/Particle Cell/Replicator/Replicator Cell from the **Particles.ozp** plug-in (`PSEmitter::genPos*` emission-shape math + `PSParticleType::simAddObjects` per-frame sim, sprites tinted by `HgcPSImageTint`); Shape, Clone, Text, Text Generator, Widget, Rig, Generator, Image, Master from the Ozone core. Only Project (document root) is a note.
- **Constructs** — the keyframe interpolation table is anchored to verbatim `PCMath::easeInOut` + `inverseEaseInOut` (ProCore) and `PCAlgorithm::BezierSubdivide`.

The regenerators live in [`../../tools/re/`](../../tools/re/): `gen_decompiled_docs.py` (filters), `gen_behavior_decomp.py`, `gen_component_decomp.py`, `gen_constructs_decomp.py`, with `disasm_pae.py` / `disasm_behavior.py` / `disasm_component.py` / `extract_shader.py` as the extractors.

### How this relates to the other docs
- `../CATALOG.md` — the authoritative implementation status, tallied against the **65 shipping FCP
  transitions**. These type docs give the **corpus-scale** picture (1–2 orders of magnitude more
  usage) — i.e. the real scope for rendering arbitrary Motion content, not just the 65 built-ins.
- `../FILTER_UNIVERSE.md` — the filter RE/shader inventory + status legend.
- `../filters/` — the per-filter parameter reference (companion to FILTER_UNIVERSE).

### A note on parameters
Every filter/behavior carries FxPlug **plumbing** parameters (`Flip`, `Input Points`,
`Publish OSC`, `Crop`, `360° Aware`, …) that are host boilerplate, not creative controls; the
per-type docs separate these out. Localized (non-English) parameter duplicates present in the
corpus are merged into their English canonicals. Value ranges are **empirical** (observed in real
templates), not Apple-documented limits.
