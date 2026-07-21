# Motion Component Types — corpus reference

Every node in a Motion scene is created by a `<factory>` whose `description` names its **component
type** (Channel, Replicator, Shape, Generator, Camera, …). This file inventories all **134**
component types seen across the **5,365-file** corpus (`.motr/.moti/.moef/.motn`), with real-world
usage counts and what each type is.

This **extends** `docs/CATALOG.md §2`, which tallies the same types but only across the 65 shipping
FCP transitions. The corpus counts here are 1–2 orders of magnitude larger and reveal types that
barely appear in the 65 built-ins (Camera 650 files, Text 2,430, Material 2,427, Image Mask 2,384)
but are heavily used in third-party templates — i.e. the real Phase-2 scope if this engine is to
render arbitrary Motion content, not just the 65 transitions.

Status legend mirrors CATALOG.md: ✅ done · 🟡 partial · ❌ not implemented (see CATALOG.md for the
authoritative per-type engine status; repeated here where known).

## Core scene-graph types (present in nearly every file)

| Component | Files | Instances | Role |
|---|---|---|---|
| Channel | 5,363 | 63,407 | An animated parameter channel — the leaf that holds a value and/or keyframe curve. The single most common node; everything animatable is a Channel. ✅ |
| Widget | 5,294 | 8,517 | A published **rig control** (slider / popup / checkbox) exposed in the FCP inspector. Driven into params by Rig Behaviors + Links. ✅ |
| Project | 5,291 | 5,291 | The root project node (one per file). ✅ |
| Image | 4,568 | 4,568 | A drop-zone image layer — in transitions these are Transition A / Transition B (the outgoing/incoming clips). ✅ |
| Gradient | 3,729 | 3,729 | Gradient generator/definition (linear / radial / …). Used for fills, ramps, colorize maps. 🟡 |
| Shape | 3,646 | 3,646 | Vector shape / mask geometry (Bézier path). Used for masks, fills, strokes. 🟡 |
| ProPlugin Filter | 3,598 | 3,598 | An FxPlug effect instance — the host node for the `<filter>` types documented in `docs/filters/`. 🟡 (25 of 141 filter UUIDs implemented) |
| Style | 2,579 | 2,579 | A style block (text/shape appearance: face, outline, glow, drop-shadow toggles). |
| Text | 2,430 | 2,430 | A text layer (glyph content + layout). |
| Material | 2,427 | 2,427 | Surface/shading material (esp. for 3D text and shapes). |
| Image Mask | 2,384 | 2,384 | A per-layer mask that limits where the layer draws. 🟡 |
| Clone Layer | 2,327 | 2,327 | Renders another object's image (instancing without duplicating the source). ✅ |

## Replicator / particle system

| Component | Files | Instances | Role |
|---|---|---|---|
| Replicator | 3,709 | 4,398 | Tiles a **Replicator Cell** across a pattern (grid / circle / spiral / image / …), with per-element transform ramps. 🟡 (basic grid) |
| Replicator Cell | 3,709 | 4,398 | The element content a Replicator instances. 🟡 |
| Sequence Replicator | 251 | 251 | Staggered-timing animation across replicator elements. 🟡 |
| Emitter | (low) | — | Particle emitter. ❌ |
| Particle Cell | (low) | — | Particle content. ❌ |

## Rigging (the parameter-control system)

| Component | Files | Instances | Role |
|---|---|---|---|
| Link | 3,481 | 3,481 | Node form of the Link behavior — drives a channel from another object. ✅ (see `docs/types/BEHAVIORS.md`) |
| Rig | 3,242 | 3,242 | Container grouping published Widgets + their Rig Behaviors. ✅ |
| Rig Behavior | 3,190 | 3,190 | Interpolates snapshot parameter states from a Widget value. ✅ |

## Generators (procedural image sources)

| Component | Files | Instances | Role |
|---|---|---|---|
| Generator | 3,026 | 3,027 | Procedural image (Color Solid, Gradient, Noise, Checkerboard, …). 🟡 (Color Solid, Gradient) |
| Text Generator | 385 | 408 | Procedural/animated text source. |

## 3D / lighting / camera

| Component | Files | Instances | Role |
|---|---|---|---|
| Camera | 650 | 650 | 3D camera / projection. Heavily used in third-party templates, essentially absent from the 65 built-ins. ❌ |
| Light | 146 | 146 | 3D light source. ❌ |

## Animation-behavior nodes
`Clamp` (1,614), `Sequence Text` (1,507), `Custom` (1,295), `Ramp` (396), `Rate` (372),
`Fade In/Fade Out` (286), `Oscillate` (197), `Align To` (193) and other behavior nodes also
surface as factory descriptions — see `docs/types/BEHAVIORS.md` for their parameters.

---
_Corpus-derived (`~/motr-collection`, 5,365 files parsed). Usage counts empirical; engine status
per `docs/CATALOG.md`. This file is the corpus-scale companion to CATALOG.md §2._
