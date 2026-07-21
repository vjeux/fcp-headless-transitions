# Motion Scene Constructs — reference

Beyond the typed nodes (filters, components, behaviors), every `.motr/.moti/.moef/.motn` file is
built from a set of **cross-cutting structural constructs** — the value/animation system, the
geometry primitives, and the styling model — that appear inside almost every node. This document
is the exhaustive reference for those constructs. Element counts are from a 5,365-file corpus scan;
algorithms are cross-referenced to the engine's decoded implementation.

Related: [`COMPONENTS.md`](COMPONENTS.md) (node types) · [`BEHAVIORS.md`](BEHAVIORS.md) (procedural
animation) · [`../filters/`](../filters/README.md) (FxPlug effects) · [`../CATALOG.md`](../CATALOG.md)
(implementation status, §1 document structure, §3 Transform parameter IDs).

---

## 1. Parameter / Channel — the value model

Every animatable value in Motion is a **`<parameter>`** (the single most common element —
~795K occurrences in a 300-file sample alone). A parameter has:

| Attribute / child | Meaning |
|---|---|
| `name` | The parameter's label (localized in non-English templates — English canonical is authoritative). |
| `id` | Stable numeric parameter ID (see `../CATALOG.md §3` for the Transform block: Position 101, Rotation 102, Scale 105, Anchor 107, Opacity 202, Blend Mode 203…). IDs are stable across locales; **names are not** — resolve by ID. |
| `flags` | Bitfield encoding the parameter's type and state (parts decoded: bit `0x100000000` = "solid fill active" on shapes; the field also distinguishes point/color/menu/animated). Largely opaque; the engine reads specific bits where needed (`parser/shapes.ts`). |
| `value` | The static value when the parameter is not animated. Scalar, or space-separated tuple for point/color/vector. |
| `default` | The factory default. |
| `<parameter>` children | **Compound parameters** nest children: a point has `X`,`Y`(`,Z`); a color has `Red`,`Green`,`Blue`(`,Alpha`); a group bundles related sub-params. |
| `<curve>` child | Present when the parameter is **animated** (keyframed) — see §2. |

A **Channel** (the `Channel` factory type — ~63K instances) is the scene-graph node that owns an
animated parameter's curve; "parameter" and "channel" are used interchangeably for animated values.

### Value shapes / types (as this doc uses them)
- **float** — scalar continuous (blur amount, opacity, mix). *Blend/scale params (Mix, Amount 0–1,
  Opacity, Intensity, Saturation) are continuous floats even when a template only sets 0 or 1.*
- **bool** — 0/1 toggle.
- **enum(int)** — small integer menu selection.
- **radians** — angles (`Angle`, `Rotation`, `Twirl`) are stored in radians (π ≈ 3.1416), not degrees.
- **point2D / vec3** — `X,Y(,Z)` children (positions, centers, anchors), in Motion's coordinate space.
- **color** — `Red,Green,Blue(,Alpha)` children, components typically 0–1.

---

## 2. Keyframe curves — `<curve>` / `<keypoint>`

Animation is stored as a **`<curve>`** on a parameter, holding an ordered list of **`<keypoint>`**s
(~105K curves / ~58K keypoints per 300-file sample — the dominant payload after parameters). The
engine evaluates these in `engine/src/evaluator/curves.ts` (reverse-engineered from
`ProChannel.framework`'s `OZInterpolatorStrategies`).

### Keypoint structure
| Field | Meaning |
|---|---|
| `<time>` | The keyframe's time, in **rational time** `VALUE TIMESCALE FLAGS EPOCH` (e.g. `36036 120000 1 0` = 36036/120000 s). |
| `<value>` | The parameter value at this keyframe. |
| `interpolation` (attr) | Interpolation type for the segment **leaving** this keypoint (table below). |
| `<inputTangentTime>` / `<inputTangentValue>` | Incoming Bézier handle (time offset in **seconds**, value in parameter units; input time is negative). |
| `<outputTangentTime>` / `<outputTangentValue>` | Outgoing Bézier handle. |

A Bézier segment `[A→B]` uses control points `P0=(tA,vA)`, `P1=P0+A.outTangent`, `P2=P3+B.inTangent`,
`P3=(tB,vB)`.

### Interpolation types (decoded — authoritative, from `OZInterpolatorStrategies`)
| Code | Type | Notes |
|---|---|---|
| 0 | Constant | Hold previous value (step). |
| 1, 18 | Linear | Straight line. |
| 2,3,4,5, 9–12 | Bézier | Uses the stored tangent handles (classic Bézier). |
| 6 | Catmull-Rom | Auto tangents from neighbours (the common animated case). |
| 7 | Ease In | `vA + (vB−vA)·(1 − cos(u·π/2))` (sine ease-in). |
| 8 | Ease Out | `vA + (vB−vA)·sin(u·π/2)` (sine ease-out). |
| 13 | Exponential | |
| 14 | Logarithmic | |
| 15 | Ease | Time-warp ease. |
| 16 | Accelerate | Time-warp. |
| 17 | Decelerate | Time-warp. |
| 19 | Convex | |
| 20 | Concave | |
| 21 | S-Curve | |

Only 0, 1, 6, 7, 8, 15, 16, 17 appear in the 65 built-in transitions; the full table is what
arbitrary corpus templates can use. Engine status: ✅ implemented (curves.ts).

---

## 3. Time encoding

Motion stores time as a **rational** 4-tuple `VALUE TIMESCALE FLAGS EPOCH`:
- `VALUE / TIMESCALE` = the time in seconds (e.g. `36036 120000 1 0` → 0.3003 s).
- Scene duration is expressed in **frames** (`sceneSettings/duration`); frame rate in `frameRate`.
- The engine converts via `timeToSeconds()` (`evaluator/curves.ts`); canonical timescale constants
  live in `tools/fcp_constants.py`. Engine status: ✅.

---

## 4. Shapes — vector geometry (`<vertex>` / `curve_X` / `curve_Y` / `closed`)

`Shape` nodes (and masks) store vector geometry as a list of **`<vertex>`** control points grouped
in a **`<vertex_folder>`**, with per-vertex Bézier handles carried in parallel **`curve_X`** /
**`curve_Y`** channels and a **`closed`** flag for open vs closed paths. Parsed by
`engine/src/parser/shapes.ts`.

| Construct | Meaning |
|---|---|
| `<vertex>` / `<vertex_folder>` | Bézier path control points (position + in/out handles). |
| `curve_X` / `curve_Y` | Per-vertex handle channels (can themselves be animated). |
| `closed` | Whether the path is closed (fillable) or an open stroke. |
| `isShapeStyle` | Marks a style block attached to the shape. |
| Fill Color (id 111) / Fill Mode (id 114) / Closed (id 116) | Shape fill parameters (see shapes.ts; solid-fill-active is encoded in the Fill Color param `flags` bit `0x100000000`). |

Shapes are used for vector graphics, masks (`Image Mask`), and stroke paths. Engine status: 🟡 partial.

---

## 5. Gradients

`Gradient` nodes (~3.7K files) define a color ramp used by fills, generators, and colorize maps.
A gradient is a list of color **tags** (stops) with positions; the corpus stores tag colours that
can be **linked** (driven by a rig) — see `docs/notes/GRADIENT_TAG_COLOUR_LINK_RE.md` for the
decoded tag-colour link mechanism. Types: linear / radial. Engine status: 🟡 (linear/radial).

---

## 6. Styles & Text (`<style>` / `styleRun` / `paragraphStyle` / `font`)

Text and shape appearance is carried in **style** constructs:
| Construct | Meaning |
|---|---|
| `<style>` / `styleRun` | A run of styled content (a span of text/shape sharing appearance). |
| `paragraphStyle` | Paragraph-level layout (alignment, spacing) for Text. |
| `font` | Font family/face reference. |
| `Face` / `Outline` / `Glow` / `Drop Shadow` (style toggles) | The standard text/shape appearance layers (each a param group toggled on/off). |

Engine status: 🟡 (Text layout partial; see `Text` / `Style` / `Material` in COMPONENTS.md).

---

## 7. Channel expressions & links (`sourceChannelRef` / `targetChannelID` / `expressionChannels`)

Beyond behaviors, parameters can be wired directly through a **channel link / expression** system:
| Construct | Meaning |
|---|---|
| `expressionChannels` | A parameter driven by an expression over other channels. |
| `sourceChannelRef` / `targetChannelID` | The source and target of a channel link (drive B from A). |
| `offsetChannelRef` / `minChannelRef` / `maxChannelRef` | Offset and clamp bounds for the link, themselves channel-referenced (so bounds can animate). |
| `dynamicChannelIDSet` | Set of channels a dynamic link touches. |
| `channelBehavior` | A behavior attached at the channel level. |
| `ignoreBehaviorsBeforeID` | Evaluation ordering hint (which behaviors to skip). |
| `override` | A value override on a channel. |

This is the low-level substrate the **Link** behavior and **Rig** system are built on
(`engine/src/evaluator/links.ts`, `color-links.ts`). Engine status: ✅ (links) / 🟡 (general expressions).

---

## 8. Document settings (`<sceneSettings>`)

The per-file document block. See `../CATALOG.md §1` for the full field list; the load-bearing ones:
`width`, `height`, `duration` (frames), `frameRate`, `NTSC`, `pixelAspectRatio`, `motionBlurSamples` /
`motionBlurDuration`, `workingGamut` / `viewGamut`, `parameterColorSpaceID`, `reflectionRecursionLimit`,
`backgroundColor`. Engine uses width/height/duration/frameRate; motion-blur, gamut and colorspace are
currently ignored (🟡).

---
_Corpus-derived (`~/motr-collection`, 5,365 files) fused with the engine's decoded implementations
(`engine/src/parser/`, `engine/src/evaluator/`). Where a construct is decoded in-repo it is marked
with engine status; otherwise the description reflects standard Motion semantics._
