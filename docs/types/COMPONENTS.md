# Motion Component Types — corpus reference

Every node in a Motion scene is created by a `<factory>` whose `description` names its **component
type** (Shape, Replicator, Text, Generator, Camera, Emitter, Light, Clone Layer, Image, Widget,
Project, Rig, …). A component is a node in the scene graph: it can have children, a transform, and
a render. This file documents the component types seen across the **5,365-file** corpus
(`.motr/.moti/.moef/.motn`, `~/motr-collection`), with real-world usage counts and per-type
parameter tables.

It **replaces** the earlier first-pass inventory and **extends** `docs/CATALOG.md`:

- `CATALOG.md §2` tallies the same factory types, but only across the **65 shipping FCP
  transitions** — that table is the authoritative **engine implementation status** (✅/🟡/❌).
- `CATALOG.md §3` documents the **standard Transform/Properties parameter IDs** (Position 101,
  Scale 105, Opacity 202, …). The [Shared object properties](#shared-object-properties) section
  below is the corpus-scale companion to §3.

The corpus counts here are 1–2 orders of magnitude larger than the 65 built-ins and reveal types
that barely appear in the built-ins (Camera, Emitter, Light, Particle Cell) but are heavily used in
third-party MotionVFX / Pixel Film Studios templates — i.e. the real Phase-2 scope if this engine
is to render arbitrary Motion content, not just the 65 transitions.

> **Status legend** (mirrors CATALOG.md; see it for the authoritative per-type engine status):
> ✅ done · 🟡 partial · ❌ not implemented.

## Corpus inventory

Every component carries the [shared object-property block](#shared-object-properties)
(Transform / Blending / Crop / Drop Shadow / …). The **object_params** count below is the number of
distinct **type-specific** parameter names observed *inside the component's Object block* — for the
fixed-schema types it is a real schema size; for the four **container types** it is inflated by
user-authored names (see the note under each).

| Component | Files | Instances | Object params | Kind | Status |
|---|---|---|---|---|---|
| [Widget](#widget) | 5,344 | 20,150 | 4,230* | container (published rig control) | ✅ |
| [Project](#project) | 5,344 | 5,344 | 484* | container (root project node) | ✅ |
| [Image](#image) | 4,621 | 13,544 | 21 | fixed (drop-zone image layer) | ✅ |
| [Shape](#shape) | 3,336 | 28,455 | 53 | fixed (vector shape / mask) | 🟡 |
| [Rig](#rig) | 3,292 | 4,212 | 0 | container (rig group) | ✅ |
| [Generator](#generator) | 3,076 | 9,406 | 1,303* | container (procedural image source) | 🟡 |
| [Text](#text) | 2,433 | 9,944 | 94 | fixed (text layer) | 🟡 |
| [Clone Layer](#clone-layer) | 2,377 | 16,422 | 2,839* | container (renders another object) | ✅ |
| [Replicator Cell](#replicator-cell) | 1,089 | 3,632 | 75 | fixed (replicator element) | 🟡 |
| [Replicator](#replicator) | 1,089 | 3,567 | 68 | fixed (pattern replicator) | 🟡 |
| [Camera](#camera) | 650 | 671 | 16 | fixed (3D camera) | ❌ |
| [Text Generator](#text-generator) | 385 | 1,664 | 67 | fixed (numeric/date/timecode text) | 🟡 |
| [Light](#light) | 146 | 324 | 18 | fixed (3D light) | ❌ |
| [Particle Cell](#particle-cell) | 144 | 369 | 50 | fixed (particle content) | ❌ |
| [Emitter](#emitter) | 144 | 342 | 56 | fixed (particle emitter) | ❌ |
| [Master](#master) | 84 | 84 | 10 | fixed (audio master track) | n/a |
| Output | 15 | 15 | 0 | render output node | n/a |
| 3D Object | 10 | 52 | 2 | imported 3D model node | ❌ |
| 3D Object Media | 10 | 36 | 0 | 3D model media ref | ❌ |
| Form | 2 | 59 | 0 | Motion "Form" (grid-mesh) object | ❌ |

`*` **container type** — the object-param count is inflated by user-authored names (published
control names, layer names, generator-instance labels). These are **not** fixed schemas; see the
per-type notes.

> Types that appear in the corpus only as `<factory>` **behavior** descriptions (Channel, Link,
> Rig Behavior, Clamp, Ramp, Sequence Text, Oscillate, …) are documented in
> [`BEHAVIORS.md`](BEHAVIORS.md), not here. `ProPlugin Filter` (the FxPlug host node) and its
> effects are in [`../filters/`](../filters/README.md).

---

## Shared object properties

**Every** component — Shape, Text, Image, Replicator, Camera, everything — carries a shared
`Properties(id=1)` block in addition to its type-specific Object block. This is the standard object
property block Motion draws in the inspector under *Properties*. It is documented **once** here;
the [CATALOG.md §3](../CATALOG.md) table gives the canonical Motion parameter **IDs** for the
subset the engine reads. Counts are corpus-wide (how many nodes carry each group).

### Transform  ·  `Transform(id=100)`  ·  58,831 nodes

| Group / param | id | Sub | Type | What it controls |
|---|---|---|---|---|
| Position | 101 | X, Y, Z | point3D | Layer position in its parent's space (pixels). ✅ |
| Rotation | 102 | Z, Y, X (+ Animate) | radians | Orientation. Z is the 2D rotation; X/Y need 3D. Observed 0 / ±π / ±π/2. 🟡 |
| Scale | 105 | X, Y, Z | float (frac, 1 = 100%) | Per-axis scale multiplier. ✅ |
| Shear | — | X, Y | float | Skew. Rare (1,663 nodes). ❌ |
| Anchor Point | 107 | X, Y, Z | point3D | Pivot for rotation/scale. ✅ |

### Blending  ·  `Blending(id=200)`  ·  15,461 nodes

| Param | id | Type | Default | What it controls |
|---|---|---|---|---|
| Opacity | 202 | float 0–1 | 1 | Layer opacity. Most-keyframed property (4,870 kf). ✅ |
| Blend Mode | 203 / 227 | enum 0–31 | 0 (Normal) | Compositing mode (see CATALOG §6). Default 0 = Normal. 🟡 |
| Preserve Opacity | — | bool | 0 | Draw only where the layers below are already opaque (alpha-preserve). |
| Casts Reflection | — | enum 0/1/2 | 0 | Whether the layer contributes to floor reflections. |
| Light Wrap | — | group | — | Wrap background light around the layer edge (Intensity / Amount / Opacity / Mode). Very rare (3 nodes). |

### Crop  ·  `Crop(id=216)`  ·  15,241 nodes

| Param | Type | Default | What it controls |
|---|---|---|---|
| Left \| Right \| Top \| Bottom | float (px) | 0 | Inset from each edge, in pixels. Observed up to ~5000. 🟡 |

### Drop Shadow  ·  `Drop Shadow(id=208)`  ·  13,079 nodes

| Param | Type | Default | What it controls |
|---|---|---|---|
| Blur | float | 5 | Shadow softness (0–~540). |
| Distance | float | 5 | Offset distance from the layer (0–~330). |
| Opacity | float 0–1 | — | Shadow strength. |
| Angle | radians | ~5.50 (≈315°) | Shadow direction. |
| Color | color | — | Shadow tint. |
| Fixed Source | bool | 0 | Keep the shadow's source fixed vs. following the layer. ❌ (engine) |

### Four Corner  ·  `Four Corner(id=207)`  ·  12,351 nodes
Free perspective / corner-pin distortion. Four corner points, each a point2D (X, Y):
`Top Left`, `Top Right`, `Bottom Right`, `Bottom Left`. 🟡

### Reflection  ·  67,105 nodes

| Param | Type | Default | What it controls |
|---|---|---|---|
| Reflectivity | float 0–1 | 0.8 | Mirror strength of the floor reflection. |
| Blur Amount | float | 0 | Blur applied to the reflection (0–~56). |
| Blend Mode | enum | — | How the reflection composites. |
| Falloff | group | — | Distance falloff (`Begin Distance`, `End Distance`, `Exponent`). |

❌ (engine) — reflections are not rendered.

### Lighting  ·  `Lighting(id=230)`  ·  68,706 nodes  &  Shadows  ·  `Shadows(id=234)`  ·  68,821 nodes
3D shading interaction with scene [Lights](#light). **Lighting**: `Shading` (enum 0/1/2),
`Highlights` (with a full material sub-block — Shininess, Ambient/Diffuse/Specular/Emission color +
index). **Shadows**: `Cast Shadows`, `Receive Shadows`, `Shadows Only` (each bool, default 1/1/0).
Present on nearly every node as defaults; only meaningful when a Light exists. ❌ (engine)

### Retime / timing

| Param | id | Type | What it controls |
|---|---|---|---|
| Retime Value | 304 | float | Host-time → template-frame remap (the FCP transition progress driver). Heavily keyframed (9,364 kf). ✅ |
| Retime Value Cache | — | float | Cached companion of Retime Value. |
| Duration Cache | — | float | Cached clip duration (frames). |
| Source Media | — | ref | The media/footage this node draws (drop-zone reference id). |
| Timing / Speed / Reverse / End Duration / End Condition / Frame Blending / Time Remap | — | mixed | Retime behaviour: playback speed, reverse, hold-past-end condition, and frame-blend/optical-flow mode. 🟡 |

### Cinematic (Depth of Field)  ·  `Cinematic(id=344)`  ·  6,201 nodes

| Param | id | Type | What it controls |
|---|---|---|---|
| Depth of Field | 346 | float | DoF strength for this layer within the camera's focus. Default ~1.4. |
| Focus Point | — | point | The in-focus depth/point. |
| Retimed | — | bool | Whether DoF follows retimed time. |

❌ (engine) — depth of field is not rendered.

### Color management (per-node)
`Color` group — `Color Space`, `Conversion Type`, `Gamma`, `PQ Peak (nits)`, `HDR White Level`,
`Conversion Version` — the node's colour-space handling for HDR/wide-gamut projects. `Background
Color` (RGBA) appears on nodes that fill their frame. Ignored by the engine (SDR/Rec.709 assumed).

---

## Document settings (`sceneSettings`)

The `<sceneSettings>` element (one per project) holds document-level render settings. The corpus
count is **how many of the 5,365 files carry the field** (near-universal fields ≈ 5,363).
See `CATALOG.md §1` for the engine's handling.

| Field | Meaning | Engine |
|---|---|---|
| `duration` | Project duration, in **frames** (at `frameRate`). | ✅ |
| `frameRate` | Frames per second (e.g. 24 / 25 / 30 / 60). | ✅ |
| `width` / `height` | Render resolution in pixels. | ✅ |
| `NTSC` | NTSC-rate flag — when set, `frameRate` is the drop-frame rate (23.976/29.97/59.94 rather than 24/30/60). | 🟡 |
| `pixelAspectRatio` | Non-square-pixel ratio (1.0 for modern square-pixel projects). | 🟡 |
| `backgroundColor` | Scene background RGBA. | 🟡 |
| `backgroundMode` | Transparent vs. solid-colour background. | 🟡 |
| `motionBlurSamples` | Number of sub-frame samples for motion blur. | ❌ |
| `motionBlurDuration` | Shutter angle — fraction of the frame the shutter is open. | ❌ |
| `fieldRenderingMode` | Interlaced field rendering (upper/lower/none). | ❌ |
| `startTimecode` | Timecode of the first frame. | ❌ |
| `reflectionRecursionLimit` | Max bounces for floor reflections. | ❌ |
| `workingGamut` / `viewGamut` | Working / display colour gamut (Rec.709 / Rec.2020 / P3). | ❌ |
| `parameterColorSpaceID` | Colour space parameters are authored in. | ❌ |
| `sharpScaling` | High-quality (sharp) scaling mode. | ❌ |
| `optimizeForDisplay` / `optimizeForDisplayLast` | Preview-optimisation cache flags. | ❌ (ignore) |
| `onHDRDisplay` / `DRTSupport` / `channelDepth` / `useFloat` | HDR / float-pipeline flags. | ❌ |
| `audioChannels` / `audioBitsPerSample` / `channels` | Audio format (for `.motn` projects with audio). | ❌ |
| `glyphOSCMode` / `animateFlag` / `presetPath` / `savePreviewMovie` | Editor metadata. | ❌ (ignore) |
| `Object3DEnvironments` | Environment maps for imported 3D objects. | ❌ |
| `project360Mode` | 360°/VR project flag. | ❌ |
| `shouldOverrideFCDuration` | Whether the template overrides FCP's clip duration. | 🟡 |
| `renderMethod` / `useDithering` / `parameterGamma` | Low-level render config (rare). | ❌ |

---

## Fixed-schema components

### Shape
`3,336 files / 28,455 instances` · 🟡 — the workhorse geometry primitive: rectangles, circles,
lines, and freehand Bézier paths, used both as **drawn shapes** (fill + outline) and as **masks**.
Its geometry is decoded in `engine/src/parser/shapes.ts`.

| Param | id | Type | Default | What it controls |
|---|---|---|---|---|
| Shape Type | — | enum 0–5 | 5 | Primitive kind — 0 Rectangle, 1 Circle, 2 Line, 4 B-spline, 5 Bézier (freehand). |
| Closed | 116 | bool | (path) | Whether the path is closed (fillable) or open (stroke only). |
| Fill / Fill Color | 111 | color | — | Interior fill colour (RGB children ids 1/2/3, 0–1 float). |
| Fill Mode | 114 | enum | — | Solid vs. gradient fill; a bit-clear Fill Color with an explicit Fill Mode = transparent decorative card (see `shapes.ts`). |
| Outline | — | group | — | Stroke appearance (colour, width, joins, caps). Highly keyframed (path draw-on). |
| Curvature | — | float 0–1 | 1 | Bézier corner rounding of control points (0 = polygonal, 1 = smooth). |
| Roundness | — | float | 0 | Corner radius for rectangles (0–~1000 px). |
| Feather | — | float (px) | 0 | Soft-edge width (can be negative to feather inward). |
| Falloff | — | float | 0 | Feather falloff gradient (−700…700). |
| Radius | — | float/point | — | Circle radius / rectangle half-extents. |
| Size | — | point2D | — | Overall shape extent. |
| Aspect Ratio | — | float | 1 | Width:height lock for the primitive. |
| Preserve Scale | — | bool | 1 | Keep stroke width constant under layer scaling. |
| Is Mask / Invert Mask / Mask Blend Mode / Mask Color | — | mixed | 0 | When the shape acts as a mask: invert, and how it combines (Add/Subtract/…). |
| Initial Scale X/Y, Initial Position | — | float/point | 1 | The primitive's authored baseline transform before the shared Transform block. |

> The many `seen=83` params (Brush Type, Start Cap, End Cap, Arrow Length, Pen Speed Over Stroke, …)
> belong to the **paint-stroke** shape variant (a pressure/tilt-driven brush stroke) and appear in
> only a handful of files. The `Fill`/`Outline`/`Shape`/`Completed`/`Animation` groups (seen ≈28k)
> are near-universal structural containers, not creative scalars.

### Replicator
`1,089 files / 3,567 instances` · 🟡 (basic grid + shape arrangements) — tiles a
[Replicator Cell](#replicator-cell) across a pattern (grid / circle / spiral / wave / image), with
per-element transform ramps. Decoded in `engine/src/parser/replicator.ts`. Motion authors *two*
arrangement systems: the legacy **Arrangement** enum (grid/tile) and the newer **Shape Parameters**
sub-block (`id=301`) for circle/spiral/wave layouts — many third-party replicators use only the
latter.

| Param | id | Type | Default | Range | What it controls |
|---|---|---|---|---|---|
| Arrangement | — | enum 0/1/2 | 1 | 0–2 | Legacy layout: Tile Fill / Rectangle grid / … |
| Origin | — | enum 0–17 | 14 | — | Where instances build from (Center, corners, edges). Default 14 = Center. |
| Build Style | — | enum 0–3 | 0 | — | How instances appear over time (All At Once / By Sequence / …). |
| Shape | 302 | enum 0–11 | 6 | — | Shape-arrangement type — Rectangle, Circle, Burst, Spiral, Wave, Geometry, Image, … |
| Points | 304 | int | 5 | 0–~6433 | Number of instances along the arrangement path. |
| Radius | 307 | float (px) | 200 | 0–5000 | Radius of a circle/spiral arrangement. |
| Twists | 341 | float | 0.25 | −0.42…2 | Spiral twist count. |
| Columns / Rows | — | int | 5 / 5 | 0–200 | Grid dimensions. |
| Ranks | — | int | 5 | 1–20 | Concentric rings (circle/burst arrangements). |
| Number of Arms | — | int | 3 | 1–60 | Arms in a burst/spiral. |
| Points Per Arm | — | int | 10 | 1–160 | Instances per arm. |
| Amplitude | — | float (px) | 50 | — | Wave-arrangement peak displacement. |
| Frequency | — | float | 1 | 0–20 | Wave-arrangement cycles. |
| Phase | — | radians | 0 | — | Wave-arrangement phase offset. |
| Damping | — | float | 0 | −1…5 | Falloff of the wave/spiral toward the ends. |
| Offset | — | float | 0 | −4…1.5 | Shifts instances along the path (fractional). |
| Tile Offset | — | float | 0 | — | Per-row offset for brick-like tiling. |
| Shuffle Order / Reverse Stacking | — | bool | 0 | — | Randomise / reverse instance draw order. |
| Replicate Seed | — | int (seed) | — | — | Random seed for shuffling / randomised params. |
| Size | — | point2D | 200 | — | Overall pattern extent (the grid's width/height, `id=347`; distinct from per-cell stroke Width `id=354`). |
| 3D / Face Camera | — | bool | 0 | — | Lay the pattern out in 3D; billboard cells toward the camera. |
| Emit At Points / Render Particles | — | bool | 1 | — | Particle-style emission along the pattern. |

### Replicator Cell
`1,089 files / 3,632 instances` · 🟡 — the element content a Replicator instances, plus the
**per-instance ramps** that vary each element across the pattern. Note that the same factory
description ("Replicator Cell") is authored under multiple factory IDs; resolve by description, not
id (see `replicator.ts`). `X`/`Y` here are the cell's per-instance **scale ramp** channels
(`id=116` Scale, with `Scale End` `id=133`); `Angle`/`Angle End` (`id=147`) ramp rotation across
the pattern.

| Param | id | Type | Default | What it controls |
|---|---|---|---|---|
| Scale (X/Y/Z) | 116 | float (frac) | 1 | Baseline cell scale, or the START of a per-instance scale ramp when Scale End is present. |
| Scale End | 133 | float | — | End of the per-instance scale ramp (last element). |
| Angle | — | radians | 0 | Baseline / start rotation of the cell. |
| Angle End | 147 | radians | 0 | End rotation across the pattern (per-instance rotation ramp). |
| Opacity | — | float 0–1 | 1 | Per-cell opacity (ramp start). |
| Color / RGB | — | color | — | Per-cell tint; can ramp across the pattern. |
| Color Mode | — | enum 0–4 | 0 | How colour varies across instances (Original / Colorize / Over Pattern / …). |
| Random Seed | — | int | — | Seed for per-cell randomisation. |
| Object Source / Brush Source / Particle Source | — | ref | — | The source layer/brush/particle the cell renders. |
| Align Angle | — | bool | 0 | Orient each cell along the arrangement tangent. |

> The `*Over Stroke` channels (Angle Over Stroke, Width Over Stroke, Spacing Over Stroke, …) and
> the `Speed`/`Life`/`Spin`/`Birth Rate` params are the **paint-stroke / particle** flavour of the
> cell (Motion shares one cell type across replicator, paint stroke, and emitter). For a plain
> image/shape replicator only the Scale/Angle/Opacity/Color ramps above are relevant.

### Image
`4,621 files / 13,544 instances` · ✅ — an image layer. In FCP transitions these are the
**drop zones** (Transition A / Transition B, i.e. the outgoing / incoming clips); in templates they
are the user's media wells. Decoded via `engine/src/parser/footage.ts`.

| Param | Type | Default | What it controls |
|---|---|---|---|
| Width / Height | float (px) | 1 | Native pixel dimensions of the source image. |
| Drop Zone | bool | 0 | Whether this layer is a drop zone (user-fillable well) vs. baked media. |
| Drop Zone Type | enum 0–3 | 0 | Drop-zone flavour (image / video / any). |
| Type | enum 0–3 | 0 | Source type. |
| Fit | enum | 0 | How media fits the well (Fill / Fit / Stretch / …). |
| Fit Factor | float | — | Scale factor applied by the Fit mode. |
| Scale / Pan | point/float | — | User framing of the media inside the well. |
| Fill Opaque / Fill Color | bool / color | 0 | Fill the well with a solid colour when empty. |
| Clear | — | 0 | Clear-to-transparent flag. |
| Use Display Aspect Ratio | bool | 0 | Honour the source's display aspect ratio. |
| Replaced | bool | 0 | Whether the placeholder media has been replaced by the user. |

### Text
`2,433 files / 9,944 instances` · 🟡 — a text layer: glyph content, layout, and (via
`Path Options`) text-on-a-path. The bulk of Text's appearance (font/face/outline/glow) lives in an
attached **Style / Format** block, not in these Object params; what's here is **content and
layout**.

| Param | Type | Default | What it controls |
|---|---|---|---|
| Text | string | — | The glyph content. |
| Layout Method | enum 0–2 | 0 | Type layout — Horizontal / Vertical / Path. |
| Alignment | enum 0–2 | 0 | Horizontal justification (Left / Center / Right). |
| Vertical Alignment | enum 1–2 | — | Top / Center / Bottom. |
| Line Spacing | float | 0 | Leading between lines (−8…56). |
| Tracking | float | 0 | Inter-character spacing. |
| Left / Right / Top / Bottom Margin | float (px) | 0 | Layout box margins (paragraph text). |
| Crop At Margins | bool | 0 | Clip glyphs to the layout box. |
| Auto-Shrink | enum 0–3 | 0 | Shrink text to fit the box. |
| Wrap Around | bool | 1 | Word-wrap within the box. |
| Editable in FCP | bool | 1 | Expose the text as an editable control in FCP. |
| Path Options → Path Shape / Path Offset / Align to Path | enum/float/bool | — | Text-on-a-path: shape of the path, offset along it, and whether glyphs orient to the tangent. |
| Type On → Fade In / Start / End | bool/float | — | Type-on reveal (per-glyph fade, start/end fraction). |
| Amplitude / Frequency / Phase / Damping | float | — | "Wiggle path" text distortion (wave applied to the baseline). |
| Face Camera | bool | 0 | Billboard 3D text toward the camera. |
| Flatten | bool | 0 | Rasterise the text to a flat layer. |

### Text Generator
`385 files / 1,664 instances` · 🟡 — a specialised Text layer that generates its content
**procedurally**: numbers (counters), timecode, or the current date/time. Shares the Text layout
params above, plus:

| Param | Type | Default | What it controls |
|---|---|---|---|
| Value | float | 0 | The number to display (usually keyframed → an animated counter). |
| Start / End | float | — | Counter range for auto-animation (with `Animate`). |
| Animate | bool | 1 | Auto-interpolate `Value` from Start to End over the clip. |
| Minimum Digits | int | — | Zero-pad the integer part to N digits (1–10). |
| Decimals | int 0–10 | 0 | Decimal places. |
| Thousands Separator | bool | 1 | Group thousands with a separator. |
| Format | enum 0–2 | 0 | Number / percentage / currency format. |
| Timecode / Timecode Base / Current Timecode | mixed | — | Timecode display and its frame base (12/16). |
| Time Date / Date Format / Time Format / Time Units | enum | — | Date/time display and formatting. |
| Random / Random Seed / Random Hold Frame | mixed | — | Randomised (slot-machine) number display. |

### Camera
`650 files / 671 instances` · ❌ (not implemented) — a 3D camera. Almost absent from the 65
built-ins but common in third-party templates. The engine reads only `Angle Of View` today
(`engine/src/parser/camera.ts`). Descriptions below are from Motion domain knowledge.

| Param | id | Type | Default | What it controls |
|---|---|---|---|---|
| Angle Of View | 201 | float (degrees) | 45 | Field of view (0–165°). The one param the engine reads. |
| Camera Type | — | enum | 1 | Framing (default) vs. Viewpoint camera. |
| Near Plane / Far Plane | — | float | 10 / 10000 | Clipping planes (units). |
| Depth of Field | — | group | — | DoF master toggle + sub-params. |
| DOF Blur Amount | — | float | 10 | Out-of-focus blur strength (0–100). |
| Near Focus / Far Focus | — | float | — | Near/far edge of the in-focus range. |
| Near Fade / Far Fade | — | float | 10 / 100 | Fade distance beyond the focus range. |
| Focus Offset | — | float | 0 | Shift the focus plane. |
| Infinite Focus | — | bool | — | Everything in focus (disable DoF). |
| Filter Shape / Sides | — | enum/int | 0 / 3 | Bokeh aperture shape (polygon sides 3–6). |

### Emitter
`144 files / 342 instances` · ❌ (not implemented) — a **particle emitter**. Emits
[Particle Cells](#particle-cell) over time. Motion reuses the Replicator's arrangement block for
the emission **source shape**, so many params mirror the Replicator (Shape/Points/Radius/Arms/…);
the emitter-specific ones govern **emission** and **particle physics**. Descriptions from Motion
domain knowledge (**unverified** against a decoder — the engine has no emitter parser).

| Param | Type | Default | What it controls |
|---|---|---|---|
| Emission Angle | radians | 0 | Direction particles are emitted (0–2π). |
| Emission Range | radians | 2π | Angular spread of emission (0 = a beam, 2π = all directions). |
| Emission Longitude | radians | 3π/2 | 3D emission direction (out-of-plane). |
| Birth Rate | float | 1 | Particles emitted per unit time. |
| Speed | float | 1 | Initial particle velocity multiplier. |
| Life | float | 1 | Particle lifetime (seconds). |
| Spin | float | 1 | Per-particle rotation rate. |
| Initial Number | float | 1 | Particles present at frame 0 (burst). |
| Emit At Points / Interleave Particles | bool | 0 | Emit from the arrangement's points; interleave multiple cells. |
| 3D | bool | 0 | 3D emission volume. |
| Depth Ordered / Face Camera / Render Order | bool/enum | — | 3D compositing order and billboarding. |
| (arrangement: Shape / Points / Radius / Number of Arms / Amplitude / Frequency / …) | — | — | The emission **source shape** — same semantics as the Replicator's shape arrangement. |

### Particle Cell
`144 files / 369 instances` · ❌ (not implemented) — the content and **per-particle dynamics** an
Emitter spawns. Shares the paint/replicator cell base, plus particle-physics params. Descriptions
from Motion domain knowledge (**unverified**).

| Param | Type | Default | What it controls |
|---|---|---|---|
| Birth Rate | float | 30 | Particles born per unit time (cell-level override). |
| Life | float | 5 | Particle lifetime (with `Life Randomness`). |
| Speed | float | 100 | Initial speed (with `Speed Randomness`). |
| Angle / Angle Randomness | radians | 0 | Initial emission angle and its spread. |
| Spin / Spin Randomness | radians | 0 | Rotation rate and its spread. |
| Scale / Scale Randomness | float | — | Particle size and its spread. |
| Opacity / Opacity Over Life | float / curve | 1 | Particle opacity, optionally ramped over lifetime. |
| Color / RGB / Color Over Life / Color Mode / Color Range | color / curve / enum | — | Particle colour, optionally ramped over lifetime or randomised. |
| Additive Blend | bool | 0 | Blend particles additively (glow). |
| Random Seed | int | — | Seed for all randomised params. |
| Initial Number | float | 0 | Particles alive at frame 0. |
| Particle Source | ref | — | The layer/image each particle renders. |
| Attach To Emitter | float | — | Bind particles to the emitter's motion. |
| X / Y / Z | float | 1 | Per-particle scale channels (heavily keyframed — size-over-life). |

### Light
`146 files / 324 instances` · ❌ (not implemented) — a 3D light source. Descriptions from Motion
domain knowledge (**unverified** — the engine has no light parser).

| Param | Type | Default | What it controls |
|---|---|---|---|
| Light Type | enum 0–3 | 2 | Ambient / Directional / Point / Spot. |
| Intensity | float | 1 | Brightness (0–~17). |
| Color (Red/Green/Blue) | color | 1,1,1 | Light colour. |
| Falloff | float | 0.03 | How quickly intensity drops with distance. |
| Falloff Start | float | 0 | Distance at which falloff begins. |
| Cone Angle | radians | π/4 | Spot-light cone half-angle. |
| Soft Edge | radians | ~1° | Spot cone edge softness. |
| Diameter | float | 10 | Area-light size. |
| Shadows (group) | — | — | Whether/how this light casts shadows. |
| Softness / Uniform Softness | float / bool | 0 | Shadow-edge softness. |
| Opacity | float | 1 | Light contribution opacity. |

### Master
`84 files / 84 instances` · n/a — the project's **audio master track** (present in `.motn`
projects with sound). Not a visual node.

| Param | Type | What it controls |
|---|---|---|
| Level | float 0–1 | Master output level. |
| Pan | float | Stereo pan. |
| Mute | bool | Mute the master. |
| Output Layout | enum | Output channel layout (mono/stereo/…). |
| Amplitude/Peak (Mix/Left/Right) | float | Metering readouts (not authored controls). |

---

## Container components

These four types have huge object-param counts **not because they have huge fixed schemas**, but
because the corpus survey folds **user-authored names** into the count. Their real structure is a
small set of params plus a container of user-defined content.

### Widget
`5,344 files / 20,150 instances` · ✅ — a **published rig control**: the slider, pop-up, or
checkbox a template author exposes in the FCP inspector. A Rig publishes Widgets; [Rig
Behaviors](BEHAVIORS.md#rig-behavior--snapshot-interpolation-from-a-widget) read a Widget's value
and interpolate parameter snapshots; [Links](BEHAVIORS.md#link--bind-one-parameter-to-another) fan
the value out to many params.

Its **real** structural params are:

| Param | Type | What it controls |
|---|---|---|
| Snapshots | data | The stored parameter states (seen 54,417 — the workhorse; each Widget references the snapshots its Rig Behavior interpolates). |
| Options | enum 0/2 | Widget kind flag. |
| Hidden | enum | Whether the control is hidden / its display index. |
| Range Minimum / Range Maximum | float | Slider range. |
| Initial Value | float | Default value of the control. |
| Pop-up | enum | The selected index of a **pop-up** Widget (0–N menu items). |
| Checkbox | bool | The state of a **checkbox** Widget. |

The other ~4,000 "params" are **user-authored control names and pop-up menu items** — e.g.
`16:9`, `9:16`, `1:1`, `Custom - (2.667)` are the menu entries of an aspect-ratio pop-up, and
`__________________` rows are separator entries. **Do not treat these as a schema**; they are the
inspector labels the template author typed. A Widget is defined by its *kind* (slider / pop-up /
checkbox) + range/initial + its snapshots, not by a fixed parameter list.

### Clone Layer
`2,377 files / 16,422 instances` · ✅ — renders another object's image without duplicating the
source (instancing). Decoded generically by the engine.

Its **only real** param is:

| Param | Type | What it controls |
|---|---|---|
| Source | ref | The object whose rendered image this clone displays (seen 15,566 — universal). |

Every other "param" (`Clone Layer 1`, `Clone Layer 02`, `Left A`, `Right B`, …) is a **user layer
name** — the corpus survey keyed by the node's display name. The Clone Layer schema is just
`Source` + the [shared object properties](#shared-object-properties).

### Generator
`3,076 files / 9,406 instances` · 🟡 (Color Solid, Gradient) — a procedural image source. Unlike
the container types above, a Generator **does** carry meaningful structural params — but its total
count is inflated because Motion has **many generator sub-types** (Color Solid, Gradient, Checker­
board, Noise, Membrane, Op Art, Stripes, …), each contributing its own controls, and the survey
merges them all under one "Generator" bucket.

Common structural params (across sub-types):

| Param | Type | Default | What it controls |
|---|---|---|---|
| Width / Height | float (px) | 1920 / 1080 | Output resolution of the generated image. |
| Color | color | — | Fill colour (Color Solid; also base colour of several generators). |
| Gradient | data | — | The gradient definition (Gradient generator, and gradient-mode fills). |
| Center | point2D | — | Centre of a radial/geometric generator. |
| Radius | float | 240 | Radius of a radial generator. |
| Shape | enum 0–4 | 0 | Sub-shape selector for shape-based generators. |
| Point 1 / Point 2 | point2D | — | Endpoints of a linear generator (Line, linear Gradient). |
| Random Seed | int | 0 | Seed for noise-based generators. |
| Coloring / Color Solid / Radial Controls / Line Style | group | — | Sub-type-specific control groups (their presence identifies the generator kind). |
| Flip / Publish OSC | bool | 0 | FxPlug host boilerplate (flip output; publish on-screen controls) — not creative. |

To document a *specific* generator, identify its sub-type from the group that's present
(`Color Solid`, `Gradient`, `Radial Controls`, …) rather than reading the merged list.

### Project
`5,344 files / 5,344 instances` · ✅ — the root node (exactly one per file). It is a **container**,
not a parameterised object: its handful of high-`seen` "params" are the project's **published
controls** and per-project metadata.

| Param | Type | What it holds |
|---|---|---|
| Published Folder | data | The tree of controls the template publishes to FCP (the inspector layout). |
| (everything else) | — | **User-authored published-parameter names** — `Drop Zone 01`, `X.Position`, `Blur`, `Build In`, `Background Color`, … — i.e. the labels the author exposed. Not a fixed schema. |

The Project's real job is structural: it owns the scene graph and the `<sceneSettings>` document
(see [Document settings](#document-settings-scenesettings)) and the [`publishSettings`](../CATALOG.md)
target list. `Build In` / `Build Out` are the standard FCP transition build-phase flags.

### Rig
`3,292 files / 4,212 instances` · ✅ — a **container that groups published Widgets** and their Rig
Behaviors. It has **no object params of its own** (object_params = 0); it exists purely to organise
the rigging system. See [`BEHAVIORS.md`](BEHAVIORS.md) for Rig Behavior and Link, the nodes that do
the actual parameter driving.

---

_Corpus-derived (`~/motr-collection`, 5,365 files parsed; 5 failed). Usage counts (`files`,
`instances`, `seen`) and value ranges are **empirical** — observed in real templates, not
Apple-documented limits. Parameter meanings reflect standard Apple Motion semantics; verify against
`engine/src/parser/` for the engine's decoded implementation and against `docs/CATALOG.md` for the
authoritative per-type engine status. This file is the corpus-scale companion to CATALOG.md §2/§3._
