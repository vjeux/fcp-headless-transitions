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

> **Decompiled code (ground truth).** Each component type below carries a `#### Decompiled code (ground truth)` subsection with the **verbatim ARM64 disassembly** of its real code from the user's licensed FCP install (via [`tools/re/disasm_component.py`](../../tools/re/disasm_component.py)) — **15 of 16 types**:
> - **Camera** (`LiCamera::localToClipMatrix`, the 3D→2D projection) and **Light** (`LiLight::getSpotNodeSurface`, cone/attenuation shading) — from Lithium.
> - **Emitter / Particle Cell / Replicator / Replicator Cell** — from the **`Particles.ozp`** plug-in: `PSEmitter::genPos*` (Point/Line/Rect/Circle/Radial/Spiral/Wave/Geometry/FilledBox/FilledRect emission-shape math) and `PSParticleType::simAddObjects` / `PSReplicatorPType::simAddObjects` (the per-frame particle/instance simulation step, driven by the same `OZSimulationBehavior` force system as the physics behaviors). Particle sprites are tinted by the embedded `HgcPSImageTint` shader.
> - **Shape** (`OZShapeBehavior::solveNode`), **Clone Layer**, **Text** (TextFramework), **Text Generator** (`OZMoTimecodeFormatter`), **Widget**, **Rig**, **Generator**, **Image**, **Master** (`OZAudioMasterTrack` audio mix pull) — from the Ozone core.
> - **Project** is the document root (a reference container); its "algorithm" is the [Document settings](#document-settings-scenesettings) + the evaluation of its children, so it carries a note rather than a method.
>
> The Camera/Light/Emitter/Particle-Cell parameter tables previously flagged *(unverified)* are now anchored to their real code.

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZShapeBehavior`). `solveNode` — per-frame vector-contour solver (control-point → rendered path). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method solveNode OZShapeBehavior`

##### `OZShapeBehavior::solveNode(OZChannelBase*, CMTime const&, double, double)`
```asm
0000000000352c4c	mov.16b	v0, v1
0000000000352c50	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Particles.ozp`, class `PSReplicator`). `updateReplicatorShapeEnum` — the Replicator is a PSEmitter subclass — it reuses the emitter genPos* shape math to lay out cells; this selects the layout shape (Rectangle/Circle/Burst/Spiral/Wave/Geometry/Image). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method updateReplicatorShapeEnum PSReplicator`

##### `PSReplicator::updateReplicatorShapeEnum(bool)`
```asm
000000000004bc7c	sub	sp, sp, #0x70
000000000004bc80	stp	x22, x21, [sp, #0x40]
000000000004bc84	stp	x20, x19, [sp, #0x50]
000000000004bc88	stp	x29, x30, [sp, #0x60]
000000000004bc8c	add	x29, sp, #0x60
000000000004bc90	mov	x20, x1
000000000004bc94	mov	x19, x0
000000000004bc98	adrp	x8, 122 ; 0xc5000
000000000004bc9c	ldr	x8, [x8, #0xe18] ; literal pool symbol address: ___stack_chk_guard
000000000004bca0	ldr	x8, [x8]
000000000004bca4	stur	x8, [x29, #-0x28]
000000000004bca8	cbz	w1, 0x4bccc
000000000004bcac	add	x0, sp, #0x10
000000000004bcb0	bl	0xa0438 ; symbol stub for: __ZN8PCStringC1Ev
000000000004bcb4	mov	w8, #0x4b18
000000000004bcb8	add	x0, x19, x8
000000000004bcbc	add	x1, sp, #0x10
000000000004bcc0	bl	0xa084c ; symbol stub for: __ZNK13OZChannelBase9addToUndoERK8PCString
000000000004bcc4	add	x0, sp, #0x10
000000000004bcc8	bl	0xa0444 ; symbol stub for: __ZN8PCStringD1Ev
000000000004bccc	mov	w8, #0x8010
000000000004bcd0	adrp	x1, 122 ; 0xc5000
000000000004bcd4	ldr	x1, [x1, #0xa00] ; literal pool symbol address: _kCMTimeZero
000000000004bcd8	add	x0, x19, x8
000000000004bcdc	movi.2d	v0, #0000000000000000
000000000004bce0	bl	0xa0bac ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000004bce4	mov	w21, #0x4b18
000000000004bce8	cbz	w0, 0x4bd58
000000000004bcec	mov	x8, #0xb
000000000004bcf0	movk	x8, #0xa, lsl #32
000000000004bcf4	str	x8, [sp, #0x30]
000000000004bcf8	adrp	x8, 93 ; 0xa8000
000000000004bcfc	add	x8, x8, #0x200
000000000004bd00	ldp	q0, q1, [x8]
000000000004bd04	stp	q0, q1, [sp, #0x10]
000000000004bd08	add	x0, x19, x21
000000000004bd0c	add	x1, sp, #0x10
000000000004bd10	mov	w2, #0xa
000000000004bd14	bl	0x9f1d8 ; symbol stub for: __ZN13OZChannelEnum7setTagsEPKii
000000000004bd18	adrp	x8, 122 ; 0xc5000
000000000004bd1c	ldr	x8, [x8, #0x9d8] ; literal pool symbol address: _theApp
000000000004bd20	ldr	x8, [x8]
000000000004bd24	ldr	x2, [x8, #0x48]
000000000004bd28	adrp	x1, 140 ; 0xd7000
000000000004bd2c	add	x1, x1, #0x870 ; Objc cfstring ref: @"bad cfstring ref"
000000000004bd30	add	x0, sp, #0x8
000000000004bd34	mov	x3, #0x0
000000000004bd38	bl	0xa0408 ; symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000004bd3c	add	x0, x19, x21
000000000004bd40	add	x1, sp, #0x8
000000000004bd44	mov	w2, #0x1
000000000004bd48	bl	0x9f1cc ; symbol stub for: __ZN13OZChannelEnum10setStringsERK8PCStringb
000000000004bd4c	add	x0, sp, #0x8
000000000004bd50	bl	0xa0444 ; symbol stub for: __ZN8PCStringD1Ev
000000000004bd54	b	0x4bdfc
000000000004bd58	adrp	x8, 93 ; 0xa8000
000000000004bd5c	add	x8, x8, #0x228
000000000004bd60	ldp	q0, q1, [x8]
000000000004bd64	stp	q0, q1, [sp, #0x10]
000000000004bd68	add	x0, x19, x21
000000000004bd6c	add	x1, sp, #0x10
000000000004bd70	mov	w2, #0x8
000000000004bd74	bl	0x9f1d8 ; symbol stub for: __ZN13OZChannelEnum7setTagsEPKii
000000000004bd78	adrp	x8, 122 ; 0xc5000
000000000004bd7c	ldr	x8, [x8, #0x9d8] ; literal pool symbol address: _theApp
000000000004bd80	ldr	x8, [x8]
000000000004bd84	ldr	x2, [x8, #0x48]
000000000004bd88	adrp	x1, 140 ; 0xd7000
000000000004bd8c	add	x1, x1, #0x890 ; Objc cfstring ref: @"bad cfstring ref"
000000000004bd90	add	x0, sp, #0x8
000000000004bd94	mov	x3, #0x0
000000000004bd98	bl	0xa0408 ; symbol stub for: __ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_
000000000004bd9c	add	x0, x19, x21
000000000004bda0	add	x1, sp, #0x8
000000000004bda4	mov	w2, #0x1
000000000004bda8	bl	0x9f1cc ; symbol stub for: __ZN13OZChannelEnum10setStringsERK8PCStringb
000000000004bdac	add	x0, sp, #0x8
000000000004bdb0	bl	0xa0444 ; symbol stub for: __ZN8PCStringD1Ev
000000000004bdb4	cbz	w20, 0x4bdfc
000000000004bdb8	adrp	x1, 122 ; 0xc5000
000000000004bdbc	ldr	x1, [x1, #0xa00] ; literal pool symbol address: _kCMTimeZero
000000000004bdc0	add	x0, x19, x21
000000000004bdc4	movi.2d	v0, #0000000000000000
000000000004bdc8	bl	0xa0bac ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000004bdcc	cmp	w0, #0xa
000000000004bdd0	b.eq	0x4bde4
000000000004bdd4	cmp	w0, #0xb
000000000004bdd8	b.ne	0x4bdfc
000000000004bddc	fmov	d0, #6.00000000
000000000004bde0	b	0x4bde8
000000000004bde4	fmov	d0, #2.00000000
000000000004bde8	adrp	x1, 122 ; 0xc5000
000000000004bdec	ldr	x1, [x1, #0xa00] ; literal pool symbol address: _kCMTimeZero
000000000004bdf0	add	x0, x19, x21
000000000004bdf4	mov	w2, #0x0
000000000004bdf8	bl	0xa0600 ; symbol stub for: __ZN9OZChannel8setValueERK6CMTimedb
000000000004bdfc	ldur	x8, [x29, #-0x28]
000000000004be00	adrp	x9, 122 ; 0xc5000
000000000004be04	ldr	x9, [x9, #0xe18] ; literal pool symbol address: ___stack_chk_guard
000000000004be08	ldr	x9, [x9]
000000000004be0c	cmp	x9, x8
000000000004be10	b.ne	0x4be28
000000000004be14	ldp	x29, x30, [sp, #0x60]
000000000004be18	ldp	x20, x19, [sp, #0x50]
000000000004be1c	ldp	x22, x21, [sp, #0x40]
000000000004be20	add	sp, sp, #0x70
000000000004be24	ret
000000000004be28	bl	0xa0e58 ; symbol stub for: ___stack_chk_fail
000000000004be2c	mov	x19, x0
000000000004be30	add	x0, sp, #0x8
000000000004be34	bl	0xa0444 ; symbol stub for: __ZN8PCStringD1Ev
000000000004be38	mov	x0, x19
000000000004be3c	bl	0x9eb54 ; symbol stub for: __Unwind_Resume
000000000004be40	mov	x19, x0
000000000004be44	add	x0, sp, #0x10
000000000004be48	bl	0xa0444 ; symbol stub for: __ZN8PCStringD1Ev
000000000004be4c	mov	x0, x19
000000000004be50	bl	0x9eb54 ; symbol stub for: __Unwind_Resume
000000000004be54	mov	x19, x0
000000000004be58	add	x0, sp, #0x8
000000000004be5c	bl	0xa0444 ; symbol stub for: __ZN8PCStringD1Ev
000000000004be60	mov	x0, x19
000000000004be64	bl	0x9eb54 ; symbol stub for: __Unwind_Resume
000000000004be68	bl	0x9eb54 ; symbol stub for: __Unwind_Resume
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Particles.ozp`, class `PSReplicatorPType`). `simAddObjects` — places each replicated instance using the emitter shape math (the replicator analogue of the particle sim step). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method simAddObjects PSReplicatorPType`

##### `PSReplicatorPType::simAddObjects(OZSystemSimulator*, OZSimStateArray&, double)`
```asm
0000000000053adc	sub	sp, sp, #0xf0
0000000000053ae0	stp	x26, x25, [sp, #0xa0]
0000000000053ae4	stp	x24, x23, [sp, #0xb0]
0000000000053ae8	stp	x22, x21, [sp, #0xc0]
0000000000053aec	stp	x20, x19, [sp, #0xd0]
0000000000053af0	stp	x29, x30, [sp, #0xe0]
0000000000053af4	add	x29, sp, #0xe0
0000000000053af8	mov	x19, x2
0000000000053afc	mov	x22, x1
0000000000053b00	mov	x20, x0
0000000000053b04	ldur	q0, [x2, #0x18]
0000000000053b08	str	q0, [sp, #0x60]
0000000000053b0c	ldr	x8, [x2, #0x28]
0000000000053b10	str	x8, [sp, #0x70]
0000000000053b14	ldr	x8, [x0]
0000000000053b18	ldr	x8, [x8, #0x690]
0000000000053b1c	blr	x8
0000000000053b20	cbz	w0, 0x53bc4
0000000000053b24	ldr	x8, [x20]
0000000000053b28	ldr	x9, [x8, #0x480]
0000000000053b2c	add	x8, sp, #0x30
0000000000053b30	mov	x0, x20
0000000000053b34	blr	x9
0000000000053b38	ldr	q0, [sp, #0x30]
0000000000053b3c	stur	q0, [x29, #-0x60]
0000000000053b40	ldr	x8, [sp, #0x40]
0000000000053b44	stur	x8, [x29, #-0x50]
0000000000053b48	ldr	x0, [x20, #0x4010]
0000000000053b4c	ldr	x8, [x0, #0xc8]!
0000000000053b50	ldr	x8, [x8, #0x110]
0000000000053b54	blr	x8
0000000000053b58	add	x8, sp, #0x18
0000000000053b5c	add	x0, x0, #0x90
0000000000053b60	bl	0xa0954 ; symbol stub for: __ZNK15OZSceneSettings16getFrameDurationEv
0000000000053b64	ldr	q0, [sp, #0x60]
0000000000053b68	str	q0, [sp, #0x30]
0000000000053b6c	ldr	x8, [sp, #0x70]
0000000000053b70	str	x8, [sp, #0x40]
0000000000053b74	mov	x8, sp
0000000000053b78	add	x0, sp, #0x30
0000000000053b7c	sub	x1, x29, #0x60
0000000000053b80	bl	0x9eb30 ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000053b84	ldr	q0, [sp]
0000000000053b88	str	q0, [sp, #0x30]
0000000000053b8c	ldr	x8, [sp, #0x10]
0000000000053b90	str	x8, [sp, #0x40]
0000000000053b94	ldur	q0, [sp, #0x18]
0000000000053b98	stur	q0, [x29, #-0x60]
0000000000053b9c	ldr	x8, [sp, #0x28]
0000000000053ba0	stur	x8, [x29, #-0x50]
0000000000053ba4	add	x0, sp, #0x30
0000000000053ba8	sub	x1, x29, #0x60
0000000000053bac	bl	0x9ea28 ; symbol stub for: _CMTimeCompare
0000000000053bb0	ldr	x8, [x20, #0x3fc8]
0000000000053bb4	ldr	x9, [x20, #0x3fd0]
0000000000053bb8	tbz	w0, #0x1f, 0x53ccc
0000000000053bbc	cmp	x8, x9
0000000000053bc0	b.ne	0x53ccc
0000000000053bc4	ldr	x0, [x20, #0x4010]
0000000000053bc8	add	x1, sp, #0x60
0000000000053bcc	bl	__ZN9PSEmitter20getNumEmissionPointsERK6CMTime
0000000000053bd0	mov	x21, x0
0000000000053bd4	cmp	w0, #0x1
0000000000053bd8	b.lt	0x53d90
0000000000053bdc	mov	w8, #0x3c98
0000000000053be0	mov	w9, #0x3da8
0000000000053be4	add	x9, x20, x9
0000000000053be8	cmp	x22, x9
0000000000053bec	mov	w9, #0x1
0000000000053bf0	cinc	w9, w9, ne
0000000000053bf4	add	x8, x20, x8
0000000000053bf8	cmp	x22, x8
0000000000053bfc	csel	w22, wzr, w9, eq
0000000000053c00	mov	x0, x20
0000000000053c04	mov	x1, x22
0000000000053c08	bl	__ZN14PSParticleType27getParticlesForSimStyleTypeEj
0000000000053c0c	mov	x23, x0
0000000000053c10	ldr	x8, [x20]
0000000000053c14	ldr	x8, [x8, #0x690]
0000000000053c18	mov	x0, x20
0000000000053c1c	blr	x8
0000000000053c20	cmp	w0, #0x0
0000000000053c24	csel	x24, x23, xzr, ne
0000000000053c28	ldp	x8, x0, [x19]
0000000000053c2c	sub	x9, x0, x8
0000000000053c30	asr	x9, x9, #3
0000000000053c34	mov	x10, #0x7bdf
0000000000053c38	movk	x10, #0xbdef, lsl #16
0000000000053c3c	movk	x10, #0xdef7, lsl #32
0000000000053c40	movk	x10, #0xef7b, lsl #48
0000000000053c44	mul	x10, x9, x10
0000000000053c48	add	w9, w21, w10
0000000000053c4c	subs	x1, x9, x10
0000000000053c50	b.ls	0x53c60
0000000000053c54	mov	x0, x19
0000000000053c58	bl	__ZNSt3__16vectorI17OZSimStateElementNS_9allocatorIS1_EEE8__appendEm
0000000000053c5c	b	0x53c88
0000000000053c60	b.hs	0x53c88
0000000000053c64	mov	w10, #0xf8
0000000000053c68	umaddl	x25, w9, w10, x8
0000000000053c6c	cmp	x25, x0
0000000000053c70	b.eq	0x53c84
0000000000053c74	sub	x0, x0, #0xf8
0000000000053c78	bl	0x9f9ac ; symbol stub for: __ZN17OZSimStateElementD1Ev
0000000000053c7c	cmp	x0, x25
0000000000053c80	b.ne	0x53c74
0000000000053c84	str	x25, [x19, #0x8]
0000000000053c88	cbz	x24, 0x53cb4
0000000000053c8c	ldp	x13, x8, [x23]
0000000000053c90	subs	x9, x8, x13
0000000000053c94	b.eq	0x53cb4
0000000000053c98	ldr	x10, [x19]
0000000000053c9c	sub	x9, x9, #0x8
0000000000053ca0	cmp	x9, #0x18
0000000000053ca4	b.hs	0x53d10
0000000000053ca8	mov	x11, #0x0
0000000000053cac	mov	x9, x13
0000000000053cb0	b	0x53d58
0000000000053cb4	mov	x0, x20
0000000000053cb8	mov	x1, x24
0000000000053cbc	mov	x2, x21
0000000000053cc0	mov	x3, x19
0000000000053cc4	bl	__ZN14PSParticleType15createParticlesEPNSt3__16vectorIP10PSParticleNS0_9allocatorIS3_EEEEjR15OZSimStateArray
0000000000053cc8	b	0x53d74
0000000000053ccc	cmp	x8, x9
0000000000053cd0	b.eq	0x53d08
0000000000053cd4	ldr	x8, [x8]
0000000000053cd8	ldur	q0, [x8, #0x8]
0000000000053cdc	ldr	x8, [x8, #0x18]
0000000000053ce0	str	x8, [sp, #0x40]
0000000000053ce4	str	q0, [sp, #0x30]
0000000000053ce8	ldr	q0, [sp, #0x60]
0000000000053cec	stur	q0, [x29, #-0x60]
0000000000053cf0	ldr	x8, [sp, #0x70]
0000000000053cf4	stur	x8, [x29, #-0x50]
0000000000053cf8	add	x0, sp, #0x30
0000000000053cfc	sub	x1, x29, #0x60
0000000000053d00	bl	0x9ea28 ; symbol stub for: _CMTimeCompare
0000000000053d04	cbz	w0, 0x53bc4
0000000000053d08	mov	w21, #0x0
0000000000053d0c	b	0x53d90
0000000000053d10	lsr	x9, x9, #3
0000000000053d14	add	x12, x9, #0x1
0000000000053d18	and	x11, x12, #0x3ffffffffffffffc
0000000000053d1c	add	x9, x13, x11, lsl #3
0000000000053d20	add	x13, x13, #0x10
0000000000053d24	mov	x14, x11
0000000000053d28	mov	x15, x10
0000000000053d2c	ldp	x16, x17, [x13, #-0x10]
0000000000053d30	ldp	x0, x1, [x13], #0x20
0000000000053d34	str	x16, [x15, #0xe8]
0000000000053d38	str	x17, [x15, #0x1e0]
0000000000053d3c	str	x0, [x15, #0x2d8]
0000000000053d40	str	x1, [x15, #0x3d0]
0000000000053d44	add	x15, x15, #0x3e0
0000000000053d48	subs	x14, x14, #0x4
0000000000053d4c	b.ne	0x53d2c
0000000000053d50	cmp	x12, x11
0000000000053d54	b.eq	0x53d74
0000000000053d58	mov	w12, #0xf8
0000000000053d5c	madd	x10, x11, x12, x10
0000000000053d60	add	x10, x10, #0xe8
0000000000053d64	ldr	x11, [x9], #0x8
0000000000053d68	str	x11, [x10], #0xf8
0000000000053d6c	cmp	x9, x8
0000000000053d70	b.ne	0x53d64
0000000000053d74	ldr	x0, [x20, #0x4010]
0000000000053d78	mov	x1, x22
0000000000053d7c	mov	x2, x20
0000000000053d80	mov	x3, x21
0000000000053d84	mov	x4, #0x0
0000000000053d88	mov	x5, x19
0000000000053d8c	bl	__ZN9PSEmitter13initParticlesEjP14PSParticleTypejPvR15OZSimStateArray
0000000000053d90	mov	x0, x21
0000000000053d94	ldp	x29, x30, [sp, #0xe0]
0000000000053d98	ldp	x20, x19, [sp, #0xd0]
0000000000053d9c	ldp	x22, x21, [sp, #0xc0]
0000000000053da0	ldp	x24, x23, [sp, #0xb0]
0000000000053da4	ldp	x26, x25, [sp, #0xa0]
0000000000053da8	add	sp, sp, #0xf0
0000000000053dac	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZImageNode`). `getImageBounds` — image / drop-zone geometry (native bounds → placed rect). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method getImageBounds OZImageNode`

##### `OZImageNode::getImageBounds(PCRect<double>*, OZRenderState const&)`
```asm
00000000000ab0a8	ldr	x8, [x0]
00000000000ab0ac	ldr	x3, [x8, #0x10]
00000000000ab0b0	br	x3
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZTextLayout`). `setText` — text layout entry (builds the glyph run from the string). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method setText OZTextLayout`

##### `OZTextLayout::setText(CMTime, PCString const&)`
```asm
0000000000557de4	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZMoTimecodeFormatter`). `stringForObjectValue:` — numeric/timecode Text-Generator formatting: the Motion timecode NSFormatter that turns the frame/number value into the displayed string (then laid out via TextFramework TXTextLayout). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method stringForObjectValue: OZMoTimecodeFormatter`

##### `-[OZMoTimecodeFormatter stringForObjectValue:]`
```asm
00000000004fe2f4	sub	sp, sp, #0x120
00000000004fe2f8	stp	x26, x25, [sp, #0xd0]
00000000004fe2fc	stp	x24, x23, [sp, #0xe0]
00000000004fe300	stp	x22, x21, [sp, #0xf0]
00000000004fe304	stp	x20, x19, [sp, #0x100]
00000000004fe308	stp	x29, x30, [sp, #0x110]
00000000004fe30c	add	x29, sp, #0x110
00000000004fe310	mov	x21, x2
00000000004fe314	mov	x19, x0
00000000004fe318	adrp	x23, 756 ; 0x7f2000
00000000004fe31c	ldr	x8, [x23, #0x498] ; Objc class ref: bad class ref
00000000004fe320	stp	x0, x8, [x29, #-0x50]
00000000004fe324	adrp	x8, 856 ; 0x856000
00000000004fe328	ldr	x20, [x8, #0x100]
00000000004fe32c	sub	x0, x29, #0x50
00000000004fe330	mov	x1, x20
00000000004fe334	bl	0x5e9f00 ; Objc message: _objc_msgSendSuper2
00000000004fe338	mov	x22, x0
00000000004fe33c	mov	x0, x19
00000000004fe340	bl	_objc_msgSend$timecodeFormat
00000000004fe344	cmp	x0, #0x2
00000000004fe348	b.eq	0x4fe440
00000000004fe34c	mov	x0, x19
00000000004fe350	bl	_objc_msgSend$isDuration
00000000004fe354	tbnz	w0, #0x0, 0x4fe440
00000000004fe358	adrp	x8, 864 ; 0x85e000
00000000004fe35c	ldrsw	x25, [x8, #0x24]
00000000004fe360	ldr	x8, [x19, x25]
00000000004fe364	cbz	x8, 0x4fe440
00000000004fe368	sub	x24, x29, #0x70
00000000004fe36c	ldr	x8, [x8, #0x8]
00000000004fe370	ldrsw	x22, [x8, #0xa8]
00000000004fe374	mov	x0, x21
00000000004fe378	bl	_objc_msgSend$copy
00000000004fe37c	bl	0x5e9e70 ; symbol stub for: _objc_autorelease
00000000004fe380	mov	x21, x0
00000000004fe384	cbz	x0, 0x4fe398
00000000004fe388	sub	x8, x29, #0x70
00000000004fe38c	mov	x0, x21
00000000004fe390	bl	_objc_msgSend$timeValue
00000000004fe394	b	0x4fe3a0
00000000004fe398	stp	xzr, xzr, [x29, #-0x70]
00000000004fe39c	stur	xzr, [x29, #-0x60]
00000000004fe3a0	ldr	q0, [x24]
00000000004fe3a4	str	q0, [sp, #0x60]
00000000004fe3a8	ldur	x8, [x29, #-0x60]
00000000004fe3ac	str	x8, [sp, #0x70]
00000000004fe3b0	ldr	x8, [x19, x25]
00000000004fe3b4	ldr	x9, [x8, #0x8]
00000000004fe3b8	add	x8, sp, #0x30
00000000004fe3bc	add	x0, x9, #0x90
00000000004fe3c0	bl	__ZNK15OZSceneSettings16getFrameDurationEv
00000000004fe3c4	ldr	x8, [sp, #0x30]
00000000004fe3c8	mul	x22, x8, x22
00000000004fe3cc	ldr	x8, [x19, x25]
00000000004fe3d0	ldr	x9, [x8, #0x8]
00000000004fe3d4	add	x8, sp, #0x18
00000000004fe3d8	add	x0, x9, #0x90
00000000004fe3dc	bl	__ZNK15OZSceneSettings16getFrameDurationEv
00000000004fe3e0	ldr	w1, [sp, #0x20]
00000000004fe3e4	add	x8, sp, #0x48
00000000004fe3e8	mov	x0, x22
00000000004fe3ec	bl	0x5e34b0 ; symbol stub for: _CMTimeMake
00000000004fe3f0	add	x8, sp, #0x80
00000000004fe3f4	add	x0, sp, #0x60
00000000004fe3f8	add	x1, sp, #0x48
00000000004fe3fc	bl	0x5e3474 ; symbol stub for: _CMTimeAdd
00000000004fe400	ldr	x8, [sp, #0x90]
00000000004fe404	stur	x8, [x29, #-0x60]
00000000004fe408	ldr	q0, [sp, #0x80]
00000000004fe40c	str	q0, [x24]
00000000004fe410	str	q0, [sp, #0x80]
00000000004fe414	str	x8, [sp, #0x90]
00000000004fe418	add	x2, sp, #0x80
00000000004fe41c	mov	x0, x21
00000000004fe420	bl	"_objc_msgSend$setTimeValue:"
00000000004fe424	ldr	x8, [x23, #0x498]
00000000004fe428	stp	x19, x8, [sp, #0x8]
00000000004fe42c	add	x0, sp, #0x8
00000000004fe430	mov	x1, x20
00000000004fe434	mov	x2, x21
00000000004fe438	bl	0x5e9f00 ; Objc message: _objc_msgSendSuper2
00000000004fe43c	mov	x22, x0
00000000004fe440	mov	x0, x22
00000000004fe444	ldp	x29, x30, [sp, #0x110]
00000000004fe448	ldp	x20, x19, [sp, #0x100]
00000000004fe44c	ldp	x22, x21, [sp, #0xf0]
00000000004fe450	ldp	x24, x23, [sp, #0xe0]
00000000004fe454	ldp	x26, x25, [sp, #0xd0]
00000000004fe458	add	sp, sp, #0x120
00000000004fe45c	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Lithium.framework/…/Lithium`, class `LiCamera`). `localToClipMatrix` — builds the local→clip projection matrix — the actual 3D→2D camera transform (FOV/near/far → clip space). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method localToClipMatrix LiCamera`

##### `LiCamera::localToClipMatrix() const`
```asm
00000000000469c4	sub	sp, sp, #0xe0
00000000000469c8	stp	d9, d8, [sp, #0xa0]
00000000000469cc	stp	x22, x21, [sp, #0xb0]
00000000000469d0	stp	x20, x19, [sp, #0xc0]
00000000000469d4	stp	x29, x30, [sp, #0xd0]
00000000000469d8	add	x29, sp, #0xd0
00000000000469dc	mov	x20, x0
00000000000469e0	mov	x19, x8
00000000000469e4	mov	x22, #0x3ff0000000000000
00000000000469e8	str	x22, [sp, #0x98]
00000000000469ec	str	x22, [sp, #0x70]
00000000000469f0	str	x22, [sp, #0x48]
00000000000469f4	str	x22, [sp, #0x20]
00000000000469f8	movi.2d	v0, #0000000000000000
00000000000469fc	stur	q0, [sp, #0x28]
0000000000046a00	stur	q0, [sp, #0x38]
0000000000046a04	stp	q0, q0, [sp, #0x50]
0000000000046a08	stur	q0, [sp, #0x78]
0000000000046a0c	stur	q0, [sp, #0x88]
0000000000046a10	ldr	x8, [x0]
0000000000046a14	ldr	x8, [x8, #0x108]
0000000000046a18	mov	x1, sp
0000000000046a1c	blr	x8
0000000000046a20	ldr	x8, [x20]
0000000000046a24	ldr	x8, [x8, #0x278]
0000000000046a28	mov	x0, x20
0000000000046a2c	blr	x8
0000000000046a30	mov	x21, x0
0000000000046a34	ldr	x8, [x20]
0000000000046a38	ldr	x8, [x8, #0x70]
0000000000046a3c	mov	x0, x20
0000000000046a40	blr	x8
0000000000046a44	mov.16b	v8, v0
0000000000046a48	ldr	x8, [x20]
0000000000046a4c	ldr	x8, [x8, #0x78]
0000000000046a50	mov	x0, x20
0000000000046a54	blr	x8
0000000000046a58	mov.16b	v9, v0
0000000000046a5c	str	x22, [x19, #0x78]
0000000000046a60	str	x22, [x19, #0x50]
0000000000046a64	str	x22, [x19, #0x28]
0000000000046a68	str	x22, [x19]
0000000000046a6c	movi.2d	v0, #0000000000000000
0000000000046a70	stur	q0, [x19, #0x8]
0000000000046a74	stur	q0, [x19, #0x18]
0000000000046a78	stp	q0, q0, [x19, #0x30]
0000000000046a7c	stur	q0, [x19, #0x58]
0000000000046a80	stur	q0, [x19, #0x68]
0000000000046a84	cmp	w21, #0x1
0000000000046a88	b.eq	0x46ad8
0000000000046a8c	cbnz	w21, 0x46af4
0000000000046a90	ldr	x8, [x20]
0000000000046a94	ldr	x8, [x8, #0x208]
0000000000046a98	mov	x0, x20
0000000000046a9c	blr	x8
0000000000046aa0	cmp	w0, #0x0
0000000000046aa4	adrp	x8, 343 ; 0x19d000
0000000000046aa8	ldr	d0, [x8, #0x300]
0000000000046aac	fmov	d1, #1.00000000
0000000000046ab0	fcsel	d0, d1, d0, ne
0000000000046ab4	ldp	d1, d2, [sp]
0000000000046ab8	fcmp	d2, d0
0000000000046abc	fcsel	d0, d0, d2, mi
0000000000046ac0	str	d0, [sp, #0x8]
0000000000046ac4	mov	x0, x19
0000000000046ac8	mov.16b	v2, v8
0000000000046acc	mov.16b	v3, v9
0000000000046ad0	bl	__ZN14PCMatrix44TmplIdE16setGLPerspectiveEdddd
0000000000046ad4	b	0x46af4
0000000000046ad8	ldp	d0, d1, [sp, #0x10]
0000000000046adc	ldr	d2, [sp, #0x8]
0000000000046ae0	mov	x0, x19
0000000000046ae4	mov.16b	v3, v9
0000000000046ae8	mov.16b	v4, v9
0000000000046aec	mov.16b	v5, v8
0000000000046af0	bl	__ZN14PCMatrix44TmplIdE21rightFramePerspectiveEdddddd
0000000000046af4	ldp	x29, x30, [sp, #0xd0]
0000000000046af8	ldp	x20, x19, [sp, #0xc0]
0000000000046afc	ldp	x22, x21, [sp, #0xb0]
0000000000046b00	ldp	d9, d8, [sp, #0xa0]
0000000000046b04	add	sp, sp, #0xe0
0000000000046b08	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Particles.ozp`, class `PSEmitter`). `genPosCircle` — emission-shape generator that places newborn particles on the emitter shape. Its sibling genPos* methods cover every Emitter/Replicator "Shape" enum value: Point, Line, Rect, Circle, Radial, Spiral, Wave, Geometry, Filled Box, Filled Rect. Per-frame birth+advance is PSParticleType::simAddObjects. The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method genPosCircle PSEmitter`

##### `PSEmitter::genPosCircle(double, CMTime const&, PCVector3<double>&, PCVector3<double>&)`
```asm
0000000000018768	stp	d9, d8, [sp, #-0x30]!
000000000001876c	stp	x20, x19, [sp, #0x10]
0000000000018770	stp	x29, x30, [sp, #0x20]
0000000000018774	add	x29, sp, #0x20
0000000000018778	mov	x19, x3
000000000001877c	mov	x20, x2
0000000000018780	fmov	d1, #-2.00000000
0000000000018784	fmul	d0, d0, d1
0000000000018788	mov	x8, #0x2d18
000000000001878c	movk	x8, #0x5444, lsl #16
0000000000018790	movk	x8, #0x21fb, lsl #32
0000000000018794	movk	x8, #0x4009, lsl #48
0000000000018798	fmov	d1, x8
000000000001879c	fmul	d8, d0, d1
00000000000187a0	mov	w8, #0x5b08
00000000000187a4	add	x0, x0, x8
00000000000187a8	movi.2d	v0, #0000000000000000
00000000000187ac	bl	0xa0bc4 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000187b0	mov.16b	v9, v0
00000000000187b4	mov.16b	v0, v8
00000000000187b8	bl	0xa0e40 ; symbol stub for: ___sincos_stret
00000000000187bc	fmul	d1, d1, d9
00000000000187c0	fmul	d0, d0, d9
00000000000187c4	stp	d1, d0, [x19]
00000000000187c8	str	xzr, [x19, #0x10]
00000000000187cc	ldr	d2, [x20]
00000000000187d0	fadd	d1, d1, d2
00000000000187d4	str	d1, [x20]
00000000000187d8	ldur	q1, [x20, #0x8]
00000000000187dc	movi.2d	v2, #0000000000000000
00000000000187e0	mov.d	v2[0], v0[0]
00000000000187e4	fadd.2d	v0, v2, v1
00000000000187e8	stur	q0, [x20, #0x8]
00000000000187ec	ldp	x29, x30, [sp, #0x20]
00000000000187f0	ldp	x20, x19, [sp, #0x10]
00000000000187f4	ldp	d9, d8, [sp], #0x30
00000000000187f8	ret
```

##### `PSEmitter::genPosSpiral(double, double, CMTime const&, PCVector3<double>&, PCVector3<double>&)`  (sibling shape generator)
```asm
000000000001ab70	stp	d11, d10, [sp, #-0x50]!
000000000001ab74	stp	d9, d8, [sp, #0x10]
000000000001ab78	stp	x22, x21, [sp, #0x20]
000000000001ab7c	stp	x20, x19, [sp, #0x30]
000000000001ab80	stp	x29, x30, [sp, #0x40]
000000000001ab84	add	x29, sp, #0x40
000000000001ab88	mov	x20, x3
000000000001ab8c	mov	x19, x2
000000000001ab90	mov	x21, x1
000000000001ab94	mov.16b	v10, v1
000000000001ab98	mov.16b	v8, v0
000000000001ab9c	mov	x22, x0
000000000001aba0	mov	w8, #0x5b08
000000000001aba4	add	x0, x0, x8
000000000001aba8	movi.2d	v0, #0000000000000000
000000000001abac	bl	0xa0bc4 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001abb0	mov.16b	v9, v0
000000000001abb4	mov	w8, #0x6578
000000000001abb8	add	x0, x22, x8
000000000001abbc	movi.2d	v0, #0000000000000000
000000000001abc0	mov	x1, x21
000000000001abc4	bl	0xa0bac ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000001abc8	scvtf	d11, w0
000000000001abcc	mov	w8, #0x66a8
000000000001abd0	add	x0, x22, x8
000000000001abd4	movi.2d	v0, #0000000000000000
000000000001abd8	mov	x1, x21
000000000001abdc	bl	0xa0bc4 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001abe0	fmul	d1, d10, d11
000000000001abe4	mov	x8, #0x147b
000000000001abe8	movk	x8, #0x47ae, lsl #16
000000000001abec	movk	x8, #0x7ae1, lsl #32
000000000001abf0	movk	x8, #0x3f84, lsl #48
000000000001abf4	fmov	d2, x8
000000000001abf8	fadd	d1, d1, d2
000000000001abfc	mov	x8, #0xaf48
000000000001ac00	movk	x8, #0x9abc, lsl #16
000000000001ac04	movk	x8, #0xd7f2, lsl #32
000000000001ac08	movk	x8, #0x3e7a, lsl #48
000000000001ac0c	fmov	d2, x8
000000000001ac10	fadd	d1, d1, d2
000000000001ac14	frintm	d1, d1
000000000001ac18	fdiv	d1, d1, d11
000000000001ac1c	mov	x8, #0x2d18
000000000001ac20	movk	x8, #0x5444, lsl #16
000000000001ac24	movk	x8, #0x21fb, lsl #32
000000000001ac28	movk	x8, #0x4019, lsl #48
000000000001ac2c	fmov	d2, x8
000000000001ac30	fmul	d0, d0, d2
000000000001ac34	fmul	d10, d8, d0
000000000001ac38	fadd	d0, d1, d1
000000000001ac3c	mov	x8, #0x2d18
000000000001ac40	movk	x8, #0x5444, lsl #16
000000000001ac44	movk	x8, #0x21fb, lsl #32
000000000001ac48	movk	x8, #0x4009, lsl #48
000000000001ac4c	fmov	d1, x8
000000000001ac50	fmul	d0, d0, d1
000000000001ac54	fadd	d0, d10, d0
000000000001ac58	bl	0xa0e40 ; symbol stub for: ___sincos_stret
000000000001ac5c	fmul	d2, d9, d1
000000000001ac60	fmul	d3, d9, d0
000000000001ac64	fmul	d4, d10, d3
000000000001ac68	fsub	d4, d2, d4
000000000001ac6c	fmul	d2, d10, d2
000000000001ac70	fadd	d2, d3, d2
000000000001ac74	fneg	d5, d4
000000000001ac78	str	d2, [x20]
000000000001ac7c	movi.2d	v3, #0000000000000000
000000000001ac80	mov.d	v3[0], v5[0]
000000000001ac84	stur	q3, [x20, #0x8]
000000000001ac88	fmul	d5, d2, d2
000000000001ac8c	fmul	d4, d4, d4
000000000001ac90	fadd	d4, d5, d4
000000000001ac94	fsqrt	d4, d4
000000000001ac98	fabs	d5, d4
000000000001ac9c	mov	x8, #0xa0000000
000000000001aca0	movk	x8, #0xd7f2, lsl #32
000000000001aca4	movk	x8, #0x3e7a, lsl #48
000000000001aca8	fmov	d6, x8
000000000001acac	fcmp	d5, d6
000000000001acb0	b.mi	0x1acc8
000000000001acb4	fdiv	d2, d2, d4
000000000001acb8	str	d2, [x20]
000000000001acbc	dup.2d	v2, v4[0]
000000000001acc0	fdiv.2d	v2, v3, v2
000000000001acc4	stur	q2, [x20, #0x8]
000000000001acc8	fmul	d2, d8, d9
000000000001accc	ldr	q3, [x19]
000000000001acd0	mov.d	v1[1], v0[0]
000000000001acd4	fmul.2d	v0, v1, v2[0]
000000000001acd8	fadd.2d	v0, v0, v3
000000000001acdc	str	q0, [x19]
000000000001ace0	ldp	x29, x30, [sp, #0x40]
000000000001ace4	ldp	x20, x19, [sp, #0x30]
000000000001ace8	ldp	x22, x21, [sp, #0x20]
000000000001acec	ldp	d9, d8, [sp, #0x10]
000000000001acf0	ldp	d11, d10, [sp], #0x50
000000000001acf4	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Particles.ozp`, class `PSParticleType`). `simAddObjects` — the per-frame particle simulation step: births/advances particles into the OZSimStateArray each sub-step (particle motion runs through the same OZSimulationBehavior force system as the physics behaviors), and buildParticleRenderGraph then emits the GPU sprites. The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method simAddObjects PSParticleType`

##### `PSParticleType::simAddObjects(OZSystemSimulator*, OZSimStateArray&, double)`
```asm
000000000003f390	sub	sp, sp, #0x130
000000000003f394	stp	d11, d10, [sp, #0xd0]
000000000003f398	stp	d9, d8, [sp, #0xe0]
000000000003f39c	stp	x24, x23, [sp, #0xf0]
000000000003f3a0	stp	x22, x21, [sp, #0x100]
000000000003f3a4	stp	x20, x19, [sp, #0x110]
000000000003f3a8	stp	x29, x30, [sp, #0x120]
000000000003f3ac	add	x29, sp, #0x120
000000000003f3b0	mov	x19, x2
000000000003f3b4	mov	x20, x0
000000000003f3b8	mov	w8, #0x3c98
000000000003f3bc	mov	w9, #0x3da8
000000000003f3c0	add	x9, x0, x9
000000000003f3c4	cmp	x1, x9
000000000003f3c8	mov	w9, #0x1
000000000003f3cc	cinc	w9, w9, ne
000000000003f3d0	add	x8, x0, x8
000000000003f3d4	cmp	x1, x8
000000000003f3d8	csel	w21, wzr, w9, eq
000000000003f3dc	ldur	q0, [x2, #0x18]
000000000003f3e0	str	q0, [sp, #0x90]
000000000003f3e4	ldr	x8, [x2, #0x28]
000000000003f3e8	str	x8, [sp, #0xa0]
000000000003f3ec	ldr	x0, [x0, #0x4010]
000000000003f3f0	ldr	x8, [x0, #0xc8]!
000000000003f3f4	ldr	x8, [x8, #0x110]
000000000003f3f8	blr	x8
000000000003f3fc	add	x8, sp, #0x78
000000000003f400	add	x0, x0, #0x90
000000000003f404	bl	0xa0954 ; symbol stub for: __ZNK15OZSceneSettings16getFrameDurationEv
000000000003f408	ldr	x0, [x20, #0x4010]
000000000003f40c	bl	__ZN9PSEmitter12getFrameRateEv
000000000003f410	mov.16b	v8, v0
000000000003f414	ldr	x8, [x20, #0x4010]
000000000003f418	mov	w9, #0x6ef0
000000000003f41c	add	x0, x8, x9
000000000003f420	add	x1, sp, #0x90
000000000003f424	movi.2d	v0, #0000000000000000
000000000003f428	bl	0xa0bac ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000003f42c	mov	x22, x0
000000000003f430	add	x0, x20, #0x458
000000000003f434	add	x1, sp, #0x90
000000000003f438	movi.2d	v0, #0000000000000000
000000000003f43c	bl	0xa0bc4 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000003f440	mov.16b	v9, v0
000000000003f444	ldr	x0, [x20, #0x4010]
000000000003f448	add	x1, sp, #0x90
000000000003f44c	bl	__ZN9PSEmitter20getBirthRateFractionERK6CMTime
000000000003f450	mov.16b	v10, v0
000000000003f454	add	x0, x20, #0x4f0
000000000003f458	add	x1, sp, #0x90
000000000003f45c	movi.2d	v0, #0000000000000000
000000000003f460	bl	0xa0bc4 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000003f464	cmp	w22, #0x0
000000000003f468	fmov	d1, #25.00000000
000000000003f46c	fcsel	d1, d8, d1, eq
000000000003f470	fdiv	d2, d9, d1
000000000003f474	fmul	d9, d2, d10
000000000003f478	fdiv	d10, d0, d1
000000000003f47c	fcmp	d10, #0.0
000000000003f480	b.le	0x3f54c
000000000003f484	mov	w22, #0x79b9
000000000003f488	movk	w22, #0x9e37, lsl #16
000000000003f48c	ldr	q0, [sp, #0x90]
000000000003f490	str	q0, [sp, #0x30]
000000000003f494	ldr	x8, [sp, #0xa0]
000000000003f498	str	x8, [sp, #0x40]
000000000003f49c	add	x0, sp, #0x30
000000000003f4a0	bl	0x9ea34 ; symbol stub for: _CMTimeGetSeconds
000000000003f4a4	fadd	d0, d0, d0
000000000003f4a8	fmul	d0, d8, d0
000000000003f4ac	fcvtzu	w23, d0
000000000003f4b0	mov	w8, #0x2d48
000000000003f4b4	adrp	x1, 134 ; 0xc5000
000000000003f4b8	ldr	x1, [x1, #0xa00] ; literal pool symbol address: _kCMTimeZero
000000000003f4bc	add	x0, x20, x8
000000000003f4c0	movi.2d	v0, #0000000000000000
000000000003f4c4	bl	0xa0bb8 ; symbol stub for: __ZNK9OZChannel14getValueAsUintERK6CMTimed
000000000003f4c8	adrp	x8, 162 ; 0xe1000
000000000003f4cc	ldr	w8, [x8, #0xc60]
000000000003f4d0	adrp	x9, 162 ; 0xe1000
000000000003f4d4	ldr	w9, [x9, #0xc64]
000000000003f4d8	mov	w10, #-0x20
000000000003f4dc	adrp	x11, 162 ; 0xe1000
000000000003f4e0	ldr	w11, [x11, #0xc68]
000000000003f4e4	mov	w12, #0x79b9
000000000003f4e8	movk	w12, #0x9e37, lsl #16
000000000003f4ec	mov	x13, x23
000000000003f4f0	add	w14, w23, w0, lsl #4
000000000003f4f4	add	w15, w0, w12
000000000003f4f8	eor	w14, w14, w15
000000000003f4fc	add	w15, w8, w0, lsr #5
000000000003f500	eor	w14, w14, w15
000000000003f504	add	w13, w14, w13
000000000003f508	add	w14, w12, w13
000000000003f50c	add	w15, w9, w13, lsl #4
000000000003f510	eor	w14, w15, w14
000000000003f514	add	w15, w11, w13, lsr #5
000000000003f518	eor	w14, w14, w15
000000000003f51c	add	w0, w14, w0
000000000003f520	add	w12, w12, w22
000000000003f524	adds	w10, w10, #0x1
000000000003f528	b.lo	0x3f4f0
000000000003f52c	eor	w8, w0, w13
000000000003f530	ucvtf	d0, w8
000000000003f534	mov	x8, #0xffffffe00000
000000000003f538	movk	x8, #0x41ef, lsl #48
000000000003f53c	fmov	d1, x8
000000000003f540	fdiv	d0, d0, d1
000000000003f544	fmul	d0, d10, d0
000000000003f548	fadd	d9, d9, d0
000000000003f54c	add	x8, sp, #0x60
000000000003f550	add	x0, sp, #0x78
000000000003f554	fmov	d0, #-1.00000000
000000000003f558	bl	0xa0d74 ; symbol stub for: __ZmlRK6CMTimed
000000000003f55c	ldr	x8, [x20]
000000000003f560	ldr	x9, [x8, #0x480]
000000000003f564	add	x8, sp, #0x30
000000000003f568	mov	x0, x20
000000000003f56c	blr	x9
000000000003f570	ldr	q0, [sp, #0x30]
000000000003f574	stur	q0, [x29, #-0x70]
000000000003f578	ldr	x8, [sp, #0x40]
000000000003f57c	stur	x8, [x29, #-0x60]
000000000003f580	ldr	q0, [sp, #0x90]
000000000003f584	str	q0, [sp, #0x30]
000000000003f588	ldr	x8, [sp, #0xa0]
000000000003f58c	str	x8, [sp, #0x40]
000000000003f590	add	x8, sp, #0x18
000000000003f594	add	x0, sp, #0x30
000000000003f598	sub	x1, x29, #0x70
000000000003f59c	bl	0x9eb30 ; symbol stub for: _PC_CMTimeSaferSubtract
000000000003f5a0	ldur	q0, [sp, #0x18]
000000000003f5a4	str	q0, [sp, #0x30]
000000000003f5a8	ldr	x8, [sp, #0x28]
000000000003f5ac	str	x8, [sp, #0x40]
000000000003f5b0	ldur	q0, [sp, #0x78]
000000000003f5b4	stur	q0, [x29, #-0x70]
000000000003f5b8	ldr	x8, [sp, #0x88]
000000000003f5bc	stur	x8, [x29, #-0x60]
000000000003f5c0	add	x0, sp, #0x30
000000000003f5c4	sub	x1, x29, #0x70
000000000003f5c8	bl	0x9ea28 ; symbol stub for: _CMTimeCompare
000000000003f5cc	tbnz	w0, #0x1f, 0x3f60c
000000000003f5d0	ldr	x8, [x20, #0x450]
000000000003f5d4	ldr	x8, [x8, #0x50]
000000000003f5d8	add	x0, x20, #0x450
000000000003f5dc	blr	x8
000000000003f5e0	eor	w23, w0, #0x1
000000000003f5e4	fabs	d0, d9
000000000003f5e8	mov	x8, #0xaf48
000000000003f5ec	movk	x8, #0x9abc, lsl #16
000000000003f5f0	movk	x8, #0xd7f2, lsl #32
000000000003f5f4	movk	x8, #0x3e7a, lsl #48
000000000003f5f8	fmov	d1, x8
000000000003f5fc	fcmp	d0, d1
000000000003f600	b.pl	0x3f684
000000000003f604	tbnz	w0, #0x0, 0x3f734
000000000003f608	b	0x3f684
000000000003f60c	ldr	x8, [x20, #0x3fc8]
000000000003f610	ldr	x9, [x20, #0x3fd0]
000000000003f614	cmp	x8, x9
000000000003f618	b.eq	0x3f680
000000000003f61c	ldr	x22, [x8]
000000000003f620	ldr	q0, [sp, #0x90]
000000000003f624	str	q0, [sp, #0x30]
000000000003f628	ldr	x8, [sp, #0xa0]
000000000003f62c	str	x8, [sp, #0x40]
000000000003f630	ldr	q0, [sp, #0x60]
000000000003f634	stur	q0, [x29, #-0x70]
000000000003f638	ldr	x8, [sp, #0x70]
000000000003f63c	stur	x8, [x29, #-0x60]
000000000003f640	mov	x8, sp
000000000003f644	add	x0, sp, #0x30
000000000003f648	sub	x1, x29, #0x70
000000000003f64c	bl	0x9eb24 ; symbol stub for: _PC_CMTimeSaferAdd
000000000003f650	ldur	q0, [x22, #0x8]
000000000003f654	ldr	x8, [x22, #0x18]
000000000003f658	str	x8, [sp, #0x40]
000000000003f65c	str	q0, [sp, #0x30]
000000000003f660	ldr	q0, [sp]
000000000003f664	stur	q0, [x29, #-0x70]
000000000003f668	ldr	x8, [sp, #0x10]
000000000003f66c	stur	x8, [x29, #-0x60]
000000000003f670	add	x0, sp, #0x30
000000000003f674	sub	x1, x29, #0x70
000000000003f678	bl	0x9ea28 ; symbol stub for: _CMTimeCompare
000000000003f67c	cbnz	w0, 0x3f5d0
000000000003f680	mov	w23, #0x1
000000000003f684	mov	x8, #0xaf48
000000000003f688	movk	x8, #0x9abc, lsl #16
000000000003f68c	movk	x8, #0xd7f2, lsl #32
000000000003f690	movk	x8, #0x3e7a, lsl #48
000000000003f694	fmov	d0, x8
000000000003f698	fadd	d0, d9, d0
000000000003f69c	fcvtms	w22, d0
000000000003f6a0	scvtf	d0, w22
000000000003f6a4	fsub	d9, d9, d0
000000000003f6a8	fcmp	d9, #0.0
000000000003f6ac	b.le	0x3f6e0
000000000003f6b0	mov	w8, #0x4090
000000000003f6b4	ldrb	w8, [x20, x8]
000000000003f6b8	cmp	w8, #0x1
000000000003f6bc	b.ne	0x3f73c
000000000003f6c0	ldr	q0, [sp, #0x90]
000000000003f6c4	str	q0, [sp, #0x30]
000000000003f6c8	ldr	x8, [sp, #0xa0]
000000000003f6cc	str	x8, [sp, #0x40]
000000000003f6d0	add	x0, sp, #0x30
000000000003f6d4	bl	0x9ea34 ; symbol stub for: _CMTimeGetSeconds
000000000003f6d8	fmul	d0, d8, d0
000000000003f6dc	b	0x3f754
000000000003f6e0	cbz	w23, 0x3f798
000000000003f6e4	ldr	x0, [x20, #0x4010]
000000000003f6e8	add	x1, sp, #0x90
000000000003f6ec	bl	__ZN9PSEmitter21getInitialNumFractionERK6CMTime
000000000003f6f0	mov.16b	v8, v0
000000000003f6f4	add	x0, x20, #0x588
000000000003f6f8	add	x1, sp, #0x90
000000000003f6fc	movi.2d	v0, #0000000000000000
000000000003f700	bl	0xa0bac ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000003f704	scvtf	d0, w0
000000000003f708	fmul	d0, d8, d0
000000000003f70c	mov	x8, #0xaf48
000000000003f710	movk	x8, #0x9abc, lsl #16
000000000003f714	movk	x8, #0xd7f2, lsl #32
000000000003f718	movk	x8, #0x3e7a, lsl #48
000000000003f71c	fmov	d1, x8
000000000003f720	fadd	d0, d0, d1
000000000003f724	fcvtms	w8, d0
000000000003f728	add	w22, w22, w8
000000000003f72c	cmp	w22, #0x1
000000000003f730	b.ge	0x3f7a0
000000000003f734	mov	w0, #0x0
000000000003f738	b	0x3f7d8
000000000003f73c	add	x8, sp, #0x30
000000000003f740	add	x0, sp, #0x90
000000000003f744	add	x1, sp, #0x78
000000000003f748	bl	0xa0d44 ; symbol stub for: __ZdvRK6CMTimeS1_
000000000003f74c	add	x0, sp, #0x30
000000000003f750	bl	0x9ea34 ; symbol stub for: _CMTimeGetSeconds
000000000003f754	fmul	d0, d9, d0
000000000003f758	mov	x8, #0xaf48
000000000003f75c	movk	x8, #0x9abc, lsl #16
000000000003f760	movk	x8, #0xd7f2, lsl #32
000000000003f764	movk	x8, #0x3e7a, lsl #48
000000000003f768	fmov	d1, x8
000000000003f76c	fadd	d1, d0, d1
000000000003f770	frintm	d1, d1
000000000003f774	fsub	d0, d0, d1
000000000003f778	mov	x8, #-0x3333333333333334
000000000003f77c	movk	x8, #0xcccd
000000000003f780	movk	x8, #0x3fec, lsl #48
000000000003f784	fmov	d1, x8
000000000003f788	fmul	d1, d9, d1
000000000003f78c	fcmp	d0, d1
000000000003f790	cinc	w22, w22, mi
000000000003f794	cbnz	w23, 0x3f6e4
000000000003f798	cmp	w22, #0x1
000000000003f79c	b.lt	0x3f734
000000000003f7a0	mov	x0, x20
000000000003f7a4	mov	x1, x21
000000000003f7a8	mov	x2, x22
000000000003f7ac	mov	x3, x19
000000000003f7b0	bl	__ZN14PSParticleType21findOrCreateParticlesEjjR15OZSimStateArray
000000000003f7b4	mov	x22, x0
000000000003f7b8	ldr	x0, [x20, #0x4010]
000000000003f7bc	mov	x1, x21
000000000003f7c0	mov	x2, x20
000000000003f7c4	mov	x3, x22
000000000003f7c8	mov	x4, #0x0
000000000003f7cc	mov	x5, x19
000000000003f7d0	bl	__ZN9PSEmitter13initParticlesEjP14PSParticleTypejPvR15OZSimStateArray
000000000003f7d4	mov	x0, x22
000000000003f7d8	ldp	x29, x30, [sp, #0x120]
000000000003f7dc	ldp	x20, x19, [sp, #0x110]
000000000003f7e0	ldp	x22, x21, [sp, #0x100]
000000000003f7e4	ldp	x24, x23, [sp, #0xf0]
000000000003f7e8	ldp	d9, d8, [sp, #0xe0]
000000000003f7ec	ldp	d11, d10, [sp, #0xd0]
000000000003f7f0	add	sp, sp, #0x130
000000000003f7f4	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Lithium.framework/…/Lithium`, class `LiLight`). `getSpotNodeSurface` — spot-light surface-shading node: cone/attenuation falloff applied to lit surfaces. The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method getSpotNodeSurface LiLight`

##### `LiLight::getSpotNodeSurface(LiLight::NodeParams const&) const`
```asm
0000000000085794	sub	sp, sp, #0x110
0000000000085798	stp	d13, d12, [sp, #0x80]
000000000008579c	stp	d11, d10, [sp, #0x90]
00000000000857a0	stp	d9, d8, [sp, #0xa0]
00000000000857a4	stp	x28, x27, [sp, #0xb0]
00000000000857a8	stp	x26, x25, [sp, #0xc0]
00000000000857ac	stp	x24, x23, [sp, #0xd0]
00000000000857b0	stp	x22, x21, [sp, #0xe0]
00000000000857b4	stp	x20, x19, [sp, #0xf0]
00000000000857b8	stp	x29, x30, [sp, #0x100]
00000000000857bc	add	x29, sp, #0x100
00000000000857c0	mov	x21, x1
00000000000857c4	mov	x20, x0
00000000000857c8	mov	x19, x8
00000000000857cc	ldr	x8, [x1, #0x8]
00000000000857d0	ldrb	w22, [x8, #0x61]
00000000000857d4	ldr	d2, [x0, #0x288]
00000000000857d8	ldr	s0, [x0, #0x260]
00000000000857dc	fcvt	d0, s0
00000000000857e0	fmul	d0, d2, d0
00000000000857e4	fcvt	s0, d0
00000000000857e8	ldr	s1, [x0, #0x264]
00000000000857ec	fcvt	d1, s1
00000000000857f0	fmul	d1, d2, d1
00000000000857f4	fcvt	s1, d1
00000000000857f8	ldr	s3, [x0, #0x268]
00000000000857fc	fcvt	d3, s3
0000000000085800	fmul	d2, d2, d3
0000000000085804	fcvt	s2, d2
0000000000085808	ldr	s3, [x0, #0x26c]
000000000008580c	add	x0, sp, #0x70
0000000000085810	bl	0x199e6c ; symbol stub for: __ZN20PCWorkingColorVectorC1Effff
0000000000085814	add	x8, x20, #0x298
0000000000085818	ldr	q0, [x8]
000000000008581c	str	q0, [sp, #0x50]
0000000000085820	ldr	d0, [x20, #0x2a8]
0000000000085824	str	d0, [sp, #0x60]
0000000000085828	ldr	d0, [x20, #0x280]
000000000008582c	fneg	d0, d0
0000000000085830	ldr	q1, [x20, #0x270]
0000000000085834	fneg.2d	v1, v1
0000000000085838	str	q1, [sp, #0x30]
000000000008583c	str	d0, [sp, #0x40]
0000000000085840	str	xzr, [x19]
0000000000085844	cmp	w22, #0x1
0000000000085848	b.ne	0x85960
000000000008584c	ldr	x22, [x21]
0000000000085850	str	x22, [sp, #0x28]
0000000000085854	cbz	x22, 0x85868
0000000000085858	ldr	x8, [x22]
000000000008585c	ldr	x8, [x8, #0x10]
0000000000085860	mov	x0, x22
0000000000085864	blr	x8
0000000000085868	ldr	x0, [x21, #0x20]
000000000008586c	add	x1, sp, #0x50
0000000000085870	add	x2, sp, #0x50
0000000000085874	bl	__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector3IT_ERKS4_S5_
0000000000085878	mov	x23, x0
000000000008587c	ldr	x0, [x21, #0x20]
0000000000085880	add	x1, sp, #0x30
0000000000085884	add	x2, sp, #0x30
0000000000085888	bl	__ZNK14PCMatrix44TmplIdE16transform_vectorIdEER9PCVector3IT_ERKS4_S5_
000000000008588c	ldr	d0, [x0, #0x10]
0000000000085890	fmul	d1, d0, d0
0000000000085894	ldr	q2, [x0]
0000000000085898	fmul.2d	v3, v2, v2
000000000008589c	faddp.2d	d3, v3
00000000000858a0	fadd	d1, d3, d1
00000000000858a4	fsqrt	d1, d1
00000000000858a8	fabs	d3, d1
00000000000858ac	adrp	x8, 280 ; 0x19d000
00000000000858b0	ldr	d4, [x8, #0x1c8]
00000000000858b4	fcmp	d3, d4
00000000000858b8	fmov	d3, #1.00000000
00000000000858bc	fcsel	d1, d3, d1, mi
00000000000858c0	dup.2d	v3, v1[0]
00000000000858c4	fdiv.2d	v2, v2, v3
00000000000858c8	fdiv	d0, d0, d1
00000000000858cc	str	q2, [sp, #0x10]
00000000000858d0	str	d0, [sp, #0x20]
00000000000858d4	ldp	x26, x24, [x21, #0x8]
00000000000858d8	ldr	d8, [x26, #0x58]
00000000000858dc	ldr	x25, [x21, #0x18]
00000000000858e0	ldr	d9, [x20, #0x258]
00000000000858e4	ldr	d10, [x20, #0x2b8]
00000000000858e8	ldr	d12, [x20, #0x2c0]
00000000000858ec	ldr	d11, [x20, #0x2c8]
00000000000858f0	ldr	x27, [x21, #0x28]
00000000000858f4	mov	w0, #0x1a0
00000000000858f8	bl	0x19a37c ; symbol stub for: __ZN8HGObjectnwEm
00000000000858fc	mov	x21, x0
0000000000085900	fadd	d3, d10, d12
0000000000085904	add	x8, x20, #0x240
0000000000085908	fcvt	s0, d8
000000000008590c	fcvt	s1, d9
0000000000085910	fcvt	s2, d10
0000000000085914	fcvt	s3, d3
0000000000085918	fcvt	s4, d11
000000000008591c	stp	x8, x27, [sp]
0000000000085920	add	x1, sp, #0x28
0000000000085924	add	x3, sp, #0x10
0000000000085928	add	x4, sp, #0x70
000000000008592c	add	x5, x26, #0x40
0000000000085930	mov	x2, x23
0000000000085934	mov	x6, x24
0000000000085938	mov	x7, x25
000000000008593c	bl	__ZN20LiHeLightSpotSurfaceC1ERK5HGRefI6HGNodeERK9PCVector3IdES8_RK20PCWorkingColorVectorSB_fS8_RK9PCVector4IdES8_ffffRK14PCMatrix44TmplIdE
0000000000085940	cbz	x21, 0x85948
0000000000085944	str	x21, [x19]
0000000000085948	ldr	x0, [sp, #0x28]
000000000008594c	cbz	x0, 0x85a60
0000000000085950	ldr	x8, [x0]
0000000000085954	ldr	x8, [x8, #0x18]
0000000000085958	blr	x8
000000000008595c	b	0x85a60
0000000000085960	ldr	x22, [x21]
0000000000085964	str	x22, [sp, #0x28]
0000000000085968	cbz	x22, 0x8597c
000000000008596c	ldr	x8, [x22]
0000000000085970	ldr	x8, [x8, #0x10]
0000000000085974	mov	x0, x22
0000000000085978	blr	x8
000000000008597c	ldr	x0, [x21, #0x20]
0000000000085980	add	x1, sp, #0x50
0000000000085984	add	x2, sp, #0x50
0000000000085988	bl	__ZNK14PCMatrix44TmplIdE9transformIdEER9PCVector3IT_ERKS4_S5_
000000000008598c	mov	x23, x0
0000000000085990	ldr	x0, [x21, #0x20]
0000000000085994	add	x1, sp, #0x30
0000000000085998	add	x2, sp, #0x30
000000000008599c	bl	__ZNK14PCMatrix44TmplIdE16transform_vectorIdEER9PCVector3IT_ERKS4_S5_
00000000000859a0	ldr	d0, [x0, #0x10]
00000000000859a4	fmul	d1, d0, d0
00000000000859a8	ldr	q2, [x0]
00000000000859ac	fmul.2d	v3, v2, v2
00000000000859b0	faddp.2d	d3, v3
00000000000859b4	fadd	d1, d3, d1
00000000000859b8	fsqrt	d1, d1
00000000000859bc	fabs	d3, d1
00000000000859c0	adrp	x8, 280 ; 0x19d000
00000000000859c4	ldr	d4, [x8, #0x1c8]
00000000000859c8	fcmp	d3, d4
00000000000859cc	fmov	d3, #1.00000000
00000000000859d0	fcsel	d1, d3, d1, mi
00000000000859d4	dup.2d	v3, v1[0]
00000000000859d8	fdiv.2d	v2, v2, v3
00000000000859dc	str	q2, [sp, #0x10]
00000000000859e0	fdiv	d0, d0, d1
00000000000859e4	str	d0, [sp, #0x20]
00000000000859e8	ldp	x24, x25, [x21, #0x10]
00000000000859ec	ldr	d8, [x20, #0x258]
00000000000859f0	ldr	d9, [x20, #0x2b8]
00000000000859f4	ldr	d11, [x20, #0x2c0]
00000000000859f8	ldr	d10, [x20, #0x2c8]
00000000000859fc	ldr	x26, [x21, #0x28]
0000000000085a00	mov	w0, #0x1a0
0000000000085a04	bl	0x19a37c ; symbol stub for: __ZN8HGObjectnwEm
0000000000085a08	mov	x21, x0
0000000000085a0c	fadd	d2, d9, d11
0000000000085a10	fcvt	s0, d8
0000000000085a14	fcvt	s1, d9
0000000000085a18	fcvt	s2, d2
0000000000085a1c	fcvt	s3, d10
0000000000085a20	str	x26, [sp]
0000000000085a24	add	x1, sp, #0x28
0000000000085a28	add	x3, sp, #0x10
0000000000085a2c	add	x4, sp, #0x70
0000000000085a30	add	x7, x20, #0x240
0000000000085a34	mov	x2, x23
0000000000085a38	mov	x5, x24
0000000000085a3c	mov	x6, x25
0000000000085a40	bl	__ZN27LiHeLightSpotSurfaceDiffuseC1ERK5HGRefI6HGNodeERK9PCVector3IdES8_RK20PCWorkingColorVectorS8_RK9PCVector4IdES8_ffffRK14PCMatrix44TmplIdE
0000000000085a44	cbz	x21, 0x85a4c
0000000000085a48	str	x21, [x19]
0000000000085a4c	ldr	x0, [sp, #0x28]
0000000000085a50	cbz	x0, 0x85a60
0000000000085a54	ldr	x8, [x0]
0000000000085a58	ldr	x8, [x8, #0x18]
0000000000085a5c	blr	x8
0000000000085a60	ldp	x29, x30, [sp, #0x100]
0000000000085a64	ldp	x20, x19, [sp, #0xf0]
0000000000085a68	ldp	x22, x21, [sp, #0xe0]
0000000000085a6c	ldp	x24, x23, [sp, #0xd0]
0000000000085a70	ldp	x26, x25, [sp, #0xc0]
0000000000085a74	ldp	x28, x27, [sp, #0xb0]
0000000000085a78	ldp	d9, d8, [sp, #0xa0]
0000000000085a7c	ldp	d11, d10, [sp, #0x90]
0000000000085a80	ldp	d13, d12, [sp, #0x80]
0000000000085a84	add	sp, sp, #0x110
0000000000085a88	ret
0000000000085a8c	bl	___clang_call_terminate
0000000000085a90	bl	___clang_call_terminate
0000000000085a94	b	0x85a98
0000000000085a98	mov	x19, x0
0000000000085a9c	b	0x85b08
0000000000085aa0	mov	x19, x0
0000000000085aa4	mov	x0, x21
0000000000085aa8	bl	0x19a370 ; symbol stub for: __ZN8HGObjectdlEPv
0000000000085aac	ldr	x22, [sp, #0x28]
0000000000085ab0	b	0x85ad4
0000000000085ab4	mov	x19, x0
0000000000085ab8	mov	x0, x21
0000000000085abc	bl	0x19a370 ; symbol stub for: __ZN8HGObjectdlEPv
0000000000085ac0	ldr	x22, [sp, #0x28]
0000000000085ac4	b	0x85af4
0000000000085ac8	b	0x85ad0
0000000000085acc	b	0x85af0
0000000000085ad0	mov	x19, x0
0000000000085ad4	cbz	x22, 0x85b08
0000000000085ad8	ldr	x8, [x22]
0000000000085adc	ldr	x8, [x8, #0x18]
0000000000085ae0	mov	x0, x22
0000000000085ae4	blr	x8
0000000000085ae8	b	0x85b08
0000000000085aec	bl	___clang_call_terminate
0000000000085af0	mov	x19, x0
0000000000085af4	cbz	x22, 0x85b08
0000000000085af8	ldr	x8, [x22]
0000000000085afc	ldr	x8, [x8, #0x18]
0000000000085b00	mov	x0, x22
0000000000085b04	blr	x8
0000000000085b08	mov	x0, x19
0000000000085b0c	bl	0x199590 ; symbol stub for: __Unwind_Resume
0000000000085b10	bl	___clang_call_terminate
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZAudioMasterTrack`). `getSampleData` — the only compiled Master node is the audio master track — this pulls mixed sample data through the OZAudioMixer. (A visual Master / published-clip node is a pure reference container with no per-frame math of its own.). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method getSampleData OZAudioMasterTrack`

##### `OZAudioMasterTrack::getSampleData(unsigned long long, unsigned int, unsigned int, double, unsigned int, OZAudioMixer*, bool)`
```asm
00000000000f5e6c	sub	sp, sp, #0xc0
00000000000f5e70	stp	d9, d8, [sp, #0x50]
00000000000f5e74	stp	x28, x27, [sp, #0x60]
00000000000f5e78	stp	x26, x25, [sp, #0x70]
00000000000f5e7c	stp	x24, x23, [sp, #0x80]
00000000000f5e80	stp	x22, x21, [sp, #0x90]
00000000000f5e84	stp	x20, x19, [sp, #0xa0]
00000000000f5e88	stp	x29, x30, [sp, #0xb0]
00000000000f5e8c	add	x29, sp, #0xb0
00000000000f5e90	str	w6, [sp, #0x34]
00000000000f5e94	stp	x1, x5, [sp, #0x20]
00000000000f5e98	mov	x22, x4
00000000000f5e9c	mov.16b	v8, v0
00000000000f5ea0	mov	x23, x3
00000000000f5ea4	mov	x24, x2
00000000000f5ea8	mov	x26, x0
00000000000f5eac	mov	x25, x8
00000000000f5eb0	str	xzr, [x8]
00000000000f5eb4	mov	w0, #0x20
00000000000f5eb8	bl	0x5e9858 ; symbol stub for: __Znwm
00000000000f5ebc	mov	x28, x0
00000000000f5ec0	mov	x20, x0
00000000000f5ec4	str	xzr, [x20, #0x8]!
00000000000f5ec8	adrp	x21, 1668 ; 0x779000
00000000000f5ecc	add	x21, x21, #0x570
00000000000f5ed0	add	x8, x21, #0x10
00000000000f5ed4	str	x8, [x0]
00000000000f5ed8	stp	xzr, xzr, [x0, #0x10]
00000000000f5edc	str	x0, [x25, #0x8]
00000000000f5ee0	mov	w0, #0x38
00000000000f5ee4	str	x25, [sp, #0x10]
00000000000f5ee8	bl	0x5e9858 ; symbol stub for: __Znwm
00000000000f5eec	mov	x19, x0
00000000000f5ef0	mov	w1, w24
00000000000f5ef4	cmp	w22, #0x4
00000000000f5ef8	cset	w4, eq
00000000000f5efc	mov	x2, x22
00000000000f5f00	mov.16b	v0, v8
00000000000f5f04	mov	x3, x23
00000000000f5f08	bl	0x5e543c ; symbol stub for: __ZN13PCAudioBufferC1Eyjdjb
00000000000f5f0c	mov	w0, #0x20
00000000000f5f10	bl	0x5e9858 ; symbol stub for: __Znwm
00000000000f5f14	mul	w8, w22, w23
00000000000f5f18	str	w8, [sp, #0x1c]
00000000000f5f1c	mul	w27, w8, w24
00000000000f5f20	add	x8, x21, #0x10
00000000000f5f24	stp	x8, xzr, [x0]
00000000000f5f28	stp	xzr, x19, [x0, #0x10]
00000000000f5f2c	stp	x19, x0, [x25]
00000000000f5f30	mov	x8, #-0x1
00000000000f5f34	ldaddal	x8, x8, [x20]
00000000000f5f38	cbnz	x8, 0xf5f54
00000000000f5f3c	ldr	x8, [x28]
00000000000f5f40	ldr	x8, [x8, #0x10]
00000000000f5f44	mov	x0, x28
00000000000f5f48	blr	x8
00000000000f5f4c	mov	x0, x28
00000000000f5f50	bl	0x5e9690 ; symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000000f5f54	ldr	x8, [x25]
00000000000f5f58	ldr	x28, [x8, #0x30]
00000000000f5f5c	mov	x0, x28
00000000000f5f60	mov	x1, x27
00000000000f5f64	bl	0x5e9a08 ; symbol stub for: _bzero
00000000000f5f68	mov	w20, #0x0
00000000000f5f6c	mov	x21, #0x0
00000000000f5f70	b	0xf5f78
00000000000f5f74	tbz	w25, #0x0, 0xf6038
00000000000f5f78	cmp	x21, x27
00000000000f5f7c	b.hs	0xf6038
00000000000f5f80	ldp	x8, x5, [sp, #0x20]
00000000000f5f84	add	w1, w20, w8
00000000000f5f88	sub	w2, w24, w20
00000000000f5f8c	ldr	w8, [sp, #0x34]
00000000000f5f90	strb	w8, [sp]
00000000000f5f94	add	x8, sp, #0x38
00000000000f5f98	add	x6, sp, #0x4c
00000000000f5f9c	add	x7, sp, #0x48
00000000000f5fa0	mov	x0, x26
00000000000f5fa4	mov	x3, x23
00000000000f5fa8	mov.16b	v0, v8
00000000000f5fac	mov	x4, x22
00000000000f5fb0	bl	__ZN18OZAudioMasterTrack13getCacheEntryEyjjdjP12OZAudioMixerPjS2_b
00000000000f5fb4	ldr	x8, [sp, #0x38]
00000000000f5fb8	cbz	x8, 0xf6000
00000000000f5fbc	ldr	x8, [x8, #0x30]
00000000000f5fc0	cbz	x8, 0xf6000
00000000000f5fc4	ldp	w25, w9, [sp, #0x48]
00000000000f5fc8	add	x1, x8, x9, lsl #2
00000000000f5fcc	ldr	w8, [sp, #0x1c]
00000000000f5fd0	mul	w19, w8, w25
00000000000f5fd4	mov	x0, x28
00000000000f5fd8	mov	x2, x19
00000000000f5fdc	bl	0x5e9e10 ; symbol stub for: _memcpy
00000000000f5fe0	mul	w8, w25, w23
00000000000f5fe4	add	x28, x28, w8, uxtw #2
00000000000f5fe8	add	x21, x21, x19
00000000000f5fec	add	w20, w25, w20
00000000000f5ff0	mov	w25, #0x1
00000000000f5ff4	ldr	x19, [sp, #0x40]
00000000000f5ff8	cbnz	x19, 0xf600c
00000000000f5ffc	b	0xf5f74
00000000000f6000	mov	w25, #0x0
00000000000f6004	ldr	x19, [sp, #0x40]
00000000000f6008	cbz	x19, 0xf5f74
00000000000f600c	add	x8, x19, #0x8
00000000000f6010	mov	x9, #-0x1
00000000000f6014	ldaddal	x9, x8, [x8]
00000000000f6018	cbnz	x8, 0xf5f74
00000000000f601c	ldr	x8, [x19]
00000000000f6020	ldr	x8, [x8, #0x10]
00000000000f6024	mov	x0, x19
00000000000f6028	blr	x8
00000000000f602c	mov	x0, x19
00000000000f6030	bl	0x5e9690 ; symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000000f6034	b	0xf5f74
00000000000f6038	ldp	x29, x30, [sp, #0xb0]
00000000000f603c	ldp	x20, x19, [sp, #0xa0]
00000000000f6040	ldp	x22, x21, [sp, #0x90]
00000000000f6044	ldp	x24, x23, [sp, #0x80]
00000000000f6048	ldp	x26, x25, [sp, #0x70]
00000000000f604c	ldp	x28, x27, [sp, #0x60]
00000000000f6050	ldp	d9, d8, [sp, #0x50]
00000000000f6054	add	sp, sp, #0xc0
00000000000f6058	ret
00000000000f605c	bl	0x5e98ac ; symbol stub for: ___cxa_begin_catch
00000000000f6060	ldr	x8, [x19]
00000000000f6064	ldr	x8, [x8, #0x8]
00000000000f6068	mov	x0, x19
00000000000f606c	blr	x8
00000000000f6070	bl	0x5e9900 ; symbol stub for: ___cxa_rethrow
00000000000f6074	b	0xf60b0
00000000000f6078	mov	x20, x0
00000000000f607c	bl	0x5e98b8 ; symbol stub for: ___cxa_end_catch
00000000000f6080	b	0xf60cc
00000000000f6084	bl	___clang_call_terminate
00000000000f6088	mov	x20, x0
00000000000f608c	mov	x0, x19
00000000000f6090	bl	0x5e9780 ; symbol stub for: __ZdlPv
00000000000f6094	ldr	x0, [sp, #0x10]
00000000000f6098	bl	__ZNSt3__110shared_ptrI18OZFootageSchedulerED1B9nqe210106Ev
00000000000f609c	mov	x0, x20
00000000000f60a0	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
00000000000f60a4	b	0xf60c8
00000000000f60a8	bl	0x5e98ac ; symbol stub for: ___cxa_begin_catch
00000000000f60ac	bl	0x5e9900 ; symbol stub for: ___cxa_rethrow
00000000000f60b0	brk	#0x1
00000000000f60b4	mov	x20, x0
00000000000f60b8	bl	0x5e98b8 ; symbol stub for: ___cxa_end_catch
00000000000f60bc	mov	x0, x20
00000000000f60c0	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
00000000000f60c4	bl	___clang_call_terminate
00000000000f60c8	mov	x20, x0
00000000000f60cc	ldr	x0, [sp, #0x10]
00000000000f60d0	bl	__ZNSt3__110shared_ptrI18OZFootageSchedulerED1B9nqe210106Ev
00000000000f60d4	mov	x0, x20
00000000000f60d8	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZRigWidget`). `getSnapshotForValue` — rig-widget snapshot lookup/interpolation (which snapshot a slider value maps to). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method getSnapshotForValue OZRigWidget`

##### `OZRigWidget::getSnapshotForValue(double, double)`
```asm
00000000004aa28c	stp	d9, d8, [sp, #-0x40]!
00000000004aa290	stp	x22, x21, [sp, #0x10]
00000000004aa294	stp	x20, x19, [sp, #0x20]
00000000004aa298	stp	x29, x30, [sp, #0x30]
00000000004aa29c	add	x29, sp, #0x30
00000000004aa2a0	ldr	x21, [x0, #0x5f0]
00000000004aa2a4	ldr	x22, [x0, #0x5f8]
00000000004aa2a8	cmp	x21, x22
00000000004aa2ac	b.eq	0x4aa304
00000000004aa2b0	mov.16b	v8, v1
00000000004aa2b4	mov.16b	v9, v0
00000000004aa2b8	adrp	x19, 698 ; 0x764000
00000000004aa2bc	ldr	x19, [x19, #0x508] ; literal pool symbol address: _kCMTimeZero
00000000004aa2c0	ldr	x20, [x21], #0x8
00000000004aa2c4	add	x0, x20, #0x88
00000000004aa2c8	movi.2d	v0, #0000000000000000
00000000004aa2cc	mov	x1, x19
00000000004aa2d0	bl	0x5e9450 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004aa2d4	fabd	d0, d0, d9
00000000004aa2d8	fcmp	d0, d8
00000000004aa2dc	b.mi	0x4aa2ec
00000000004aa2e0	cmp	x21, x22
00000000004aa2e4	b.ne	0x4aa2c0
00000000004aa2e8	mov	x20, #0x0
00000000004aa2ec	mov	x0, x20
00000000004aa2f0	ldp	x29, x30, [sp, #0x30]
00000000004aa2f4	ldp	x20, x19, [sp, #0x20]
00000000004aa2f8	ldp	x22, x21, [sp, #0x10]
00000000004aa2fc	ldp	d9, d8, [sp], #0x40
00000000004aa300	ret
00000000004aa304	mov	x20, #0x0
00000000004aa308	mov	x0, x20
00000000004aa30c	ldp	x29, x30, [sp, #0x30]
00000000004aa310	ldp	x20, x19, [sp, #0x20]
00000000004aa314	ldp	x22, x21, [sp, #0x10]
00000000004aa318	ldp	d9, d8, [sp], #0x40
00000000004aa31c	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZCloneGenerator`). `getDimensions` — output-dimension + time-remap computation for the cloned source. The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method getDimensions OZCloneGenerator`

##### `OZCloneGenerator::getDimensions(float*, float*, OZRenderState const&)`
```asm
0000000000339aa8	sub	sp, sp, #0x190
0000000000339aac	stp	x28, x27, [sp, #0x140]
0000000000339ab0	stp	x24, x23, [sp, #0x150]
0000000000339ab4	stp	x22, x21, [sp, #0x160]
0000000000339ab8	stp	x20, x19, [sp, #0x170]
0000000000339abc	stp	x29, x30, [sp, #0x180]
0000000000339ac0	add	x29, sp, #0x180
0000000000339ac4	mov	x22, x3
0000000000339ac8	mov	x19, x2
0000000000339acc	mov	x20, x1
0000000000339ad0	mov	x21, x0
0000000000339ad4	mov	w24, #0x49d0
0000000000339ad8	adrp	x1, 1067 ; 0x764000
0000000000339adc	ldr	x1, [x1, #0x508] ; literal pool symbol address: _kCMTimeZero
0000000000339ae0	add	x0, x0, x24
0000000000339ae4	movi.2d	v0, #0000000000000000
0000000000339ae8	bl	0x5e942c ; symbol stub for: __ZNK9OZChannel14getValueAsUintERK6CMTimed
0000000000339aec	mov	x23, x0
0000000000339af0	add	x0, x21, x24
0000000000339af4	bl	0x5e89d0 ; symbol stub for: __ZNK13OZChannelBase20getObjectManipulatorEv
0000000000339af8	ldr	x8, [x0]
0000000000339afc	ldr	x8, [x8, #0x100]
0000000000339b00	blr	x8
0000000000339b04	cbz	x0, 0x339b34
0000000000339b08	mov	x1, x23
0000000000339b0c	bl	__ZN7OZScene7getNodeEj
0000000000339b10	cbz	x0, 0x339b34
0000000000339b14	adrp	x1, 1083 ; 0x774000
0000000000339b18	add	x1, x1, #0x928
0000000000339b1c	adrp	x2, 1095 ; 0x780000
0000000000339b20	add	x2, x2, #0xf18
0000000000339b24	mov	x3, #-0x2
0000000000339b28	bl	0x5e9918 ; symbol stub for: ___dynamic_cast
0000000000339b2c	mov	x23, x0
0000000000339b30	b	0x339b38
0000000000339b34	mov	x23, #0x0
0000000000339b38	str	wzr, [x19]
0000000000339b3c	str	wzr, [x20]
0000000000339b40	add	x0, sp, #0x30
0000000000339b44	mov	x1, x22
0000000000339b48	bl	__ZN13OZRenderStateC1ERKS_
0000000000339b4c	ldr	q0, [x22]
0000000000339b50	str	q0, [sp]
0000000000339b54	ldr	x8, [x22, #0x10]
0000000000339b58	str	x8, [sp, #0x10]
0000000000339b5c	add	x8, sp, #0x18
0000000000339b60	mov	x1, sp
0000000000339b64	mov	x0, x21
0000000000339b68	bl	__ZN16OZCloneGenerator20getTimeRemappedFrameE6CMTime
0000000000339b6c	ldur	q0, [sp, #0x18]
0000000000339b70	str	q0, [sp, #0x30]
0000000000339b74	ldr	x8, [sp, #0x28]
0000000000339b78	str	x8, [sp, #0x40]
0000000000339b7c	strh	wzr, [sp, #0x118]
0000000000339b80	cbz	x23, 0x339ba0
0000000000339b84	ldr	x8, [x23]
0000000000339b88	ldr	x8, [x8, #0x60]
0000000000339b8c	add	x3, sp, #0x30
0000000000339b90	mov	x0, x23
0000000000339b94	mov	x1, x20
0000000000339b98	mov	x2, x19
0000000000339b9c	blr	x8
0000000000339ba0	ldp	x29, x30, [sp, #0x180]
0000000000339ba4	ldp	x20, x19, [sp, #0x170]
0000000000339ba8	ldp	x22, x21, [sp, #0x160]
0000000000339bac	ldp	x24, x23, [sp, #0x150]
0000000000339bb0	ldp	x28, x27, [sp, #0x140]
0000000000339bb4	add	sp, sp, #0x190
0000000000339bb8	ret
```

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZSoftGradientGenerator`). `getHelium` — soft-gradient generator: builds its Helium shader node (representative procedural generator). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method getHelium OZSoftGradientGenerator`

##### `OZSoftGradientGenerator::getHelium(LiAgent&, OZRenderParams const&)`
```asm
000000000042818c	sub	sp, sp, #0x180
0000000000428190	stp	d9, d8, [sp, #0x130]
0000000000428194	stp	x28, x27, [sp, #0x140]
0000000000428198	stp	x22, x21, [sp, #0x150]
000000000042819c	stp	x20, x19, [sp, #0x160]
00000000004281a0	stp	x29, x30, [sp, #0x170]
00000000004281a4	add	x29, sp, #0x170
00000000004281a8	mov	x20, x2
00000000004281ac	mov	x21, x1
00000000004281b0	mov	x22, x0
00000000004281b4	mov	x19, x8
00000000004281b8	ldr	q0, [x2]
00000000004281bc	stur	q0, [x29, #-0x60]
00000000004281c0	ldr	x8, [x2, #0x10]
00000000004281c4	stur	x8, [x29, #-0x50]
00000000004281c8	mov	w8, #0x5038
00000000004281cc	add	x0, x0, x8
00000000004281d0	sub	x1, x29, #0x60
00000000004281d4	movi.2d	v0, #0000000000000000
00000000004281d8	bl	0x5e9450 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000004281dc	mov.16b	v8, v0
00000000004281e0	sub	x0, x29, #0x98
00000000004281e4	bl	0x5e7c80 ; symbol stub for: __ZN7PCColorC1Ev
00000000004281e8	mov	w8, #0x4bb0
00000000004281ec	add	x0, x22, x8
00000000004281f0	sub	x1, x29, #0x60
00000000004281f4	sub	x2, x29, #0x98
00000000004281f8	bl	0x5e8af0 ; symbol stub for: __ZNK14OZChannelColor8getColorERK6CMTimeR7PCColor
00000000004281fc	mov	x0, x20
0000000000428200	bl	__ZNK14OZRenderParams20getWorkingColorSpaceEv
0000000000428204	mov	x2, x0
0000000000428208	add	x0, sp, #0xb0
000000000042820c	sub	x1, x29, #0x98
0000000000428210	bl	0x5e5ae4 ; symbol stub for: __ZN14PCWorkingColorC1ERK7PCColorP12CGColorSpace
0000000000428214	add	x8, sp, #0x30
0000000000428218	movi.2d	v0, #0000000000000000
000000000042821c	mov	x0, x21
0000000000428220	bl	0x5e915c ; symbol stub for: __ZNK7LiAgent24getInversePixelTransformEd
0000000000428224	mov	w0, #0x1b0
0000000000428228	bl	0x5e7e00 ; symbol stub for: __ZN8HGObjectnwEm
000000000042822c	mov	x20, x0
0000000000428230	bl	__ZN25OZHeSoftGradientGeneratorC1Ev
0000000000428234	ldp	d0, d1, [sp, #0x30]
0000000000428238	fcvt	s0, d0
000000000042823c	fcvt	s1, d1
0000000000428240	ldr	d2, [sp, #0x48]
0000000000428244	fcvt	s3, d2
0000000000428248	ldr	x8, [x20]
000000000042824c	ldr	x8, [x8, #0x60]
0000000000428250	movi.2d	v2, #0000000000000000
0000000000428254	mov	x0, x20
0000000000428258	mov	w1, #0x0
000000000042825c	blr	x8
0000000000428260	ldp	d0, d1, [sp, #0x50]
0000000000428264	fcvt	s0, d0
0000000000428268	fcvt	s1, d1
000000000042826c	ldr	d2, [sp, #0x68]
0000000000428270	fcvt	s3, d2
0000000000428274	ldr	x8, [x20]
0000000000428278	ldr	x8, [x8, #0x60]
000000000042827c	movi.2d	v2, #0000000000000000
0000000000428280	mov	x0, x20
0000000000428284	mov	w1, #0x1
0000000000428288	blr	x8
000000000042828c	ldp	d0, d1, [sp, #0x90]
0000000000428290	fcvt	s0, d0
0000000000428294	fcvt	s1, d1
0000000000428298	ldr	d2, [sp, #0xa8]
000000000042829c	fcvt	s3, d2
00000000004282a0	ldr	x8, [x20]
00000000004282a4	ldr	x8, [x8, #0x60]
00000000004282a8	movi.2d	v2, #0000000000000000
00000000004282ac	mov	x0, x20
00000000004282b0	mov	w1, #0x2
00000000004282b4	blr	x8
00000000004282b8	ldp	s0, s1, [sp, #0xb0]
00000000004282bc	ldp	s2, s3, [sp, #0xb8]
00000000004282c0	ldr	x8, [x20]
00000000004282c4	ldr	x8, [x8, #0x60]
00000000004282c8	mov	x0, x20
00000000004282cc	mov	w1, #0x3
00000000004282d0	blr	x8
00000000004282d4	fmov	d0, #1.00000000
00000000004282d8	fdiv	d0, d0, d8
00000000004282dc	fcvt	s0, d0
00000000004282e0	ldr	x8, [x20]
00000000004282e4	ldr	x8, [x8, #0x60]
00000000004282e8	movi.2d	v1, #0000000000000000
00000000004282ec	movi.2d	v2, #0000000000000000
00000000004282f0	movi.2d	v3, #0000000000000000
00000000004282f4	mov	x0, x20
00000000004282f8	mov	w1, #0x4
00000000004282fc	blr	x8
0000000000428300	fneg	d0, d8
0000000000428304	fadd	d1, d8, d8
0000000000428308	stp	d0, d0, [sp, #0x10]
000000000042830c	stp	d1, d1, [sp, #0x20]
0000000000428310	ldr	x0, [x21, #0xa0]
0000000000428314	add	x1, sp, #0x10
0000000000428318	add	x2, sp, #0x10
000000000042831c	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
0000000000428320	cbz	w0, 0x42836c
0000000000428324	mov	x8, #0xaf48
0000000000428328	movk	x8, #0x9abc, lsl #16
000000000042832c	movk	x8, #0xd7f2, lsl #32
0000000000428330	movk	x8, #0x3e7a, lsl #48
0000000000428334	fmov	d0, x8
0000000000428338	ldp	d1, d2, [sp, #0x10]
000000000042833c	fadd	d3, d1, d0
0000000000428340	fcvtms	w0, d3
0000000000428344	fadd	d0, d2, d0
0000000000428348	fcvtms	w1, d0
000000000042834c	ldp	d0, d3, [sp, #0x20]
0000000000428350	fadd	d0, d1, d0
0000000000428354	fcvtps	w8, d0
0000000000428358	fadd	d0, d2, d3
000000000042835c	fcvtps	w9, d0
0000000000428360	sub	w8, w8, w0
0000000000428364	sub	w9, w9, w1
0000000000428368	b	0x42838c
000000000042836c	mov	x0, x21
0000000000428370	bl	0x5e91d4 ; symbol stub for: __ZNK7LiAgent7haveROIEv
0000000000428374	cbz	w0, 0x4283ac
0000000000428378	mov	x8, sp
000000000042837c	mov	x0, x21
0000000000428380	bl	0x5e91bc ; symbol stub for: __ZNK7LiAgent6getROIEv
0000000000428384	ldp	w0, w1, [sp]
0000000000428388	ldp	w8, w9, [sp, #0x8]
000000000042838c	add	w2, w8, w0
0000000000428390	add	w3, w9, w1
0000000000428394	bl	0x5e3870 ; symbol stub for: _HGRectMake4i
0000000000428398	stp	x0, x1, [sp]
000000000042839c	mov	x1, sp
00000000004283a0	mov	x0, x20
00000000004283a4	bl	__ZN25OZHeSoftGradientGenerator6setDODERK6HGRect
00000000004283a8	b	0x4283bc
00000000004283ac	adrp	x1, 824 ; 0x760000
00000000004283b0	ldr	x1, [x1, #0xcf0] ; literal pool symbol address: _HGRectInfinite
00000000004283b4	mov	x0, x20
00000000004283b8	bl	__ZN25OZHeSoftGradientGenerator6setDODERK6HGRect
00000000004283bc	str	x20, [x19]
00000000004283c0	ldr	x0, [sp, #0xc0]
00000000004283c4	cbz	x0, 0x4283cc
00000000004283c8	bl	0x5e5454 ; symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000004283cc	ldur	x0, [x29, #-0x68]
00000000004283d0	cbz	x0, 0x4283d8
00000000004283d4	bl	0x5e5454 ; symbol stub for: __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
00000000004283d8	ldp	x29, x30, [sp, #0x170]
00000000004283dc	ldp	x20, x19, [sp, #0x160]
00000000004283e0	ldp	x22, x21, [sp, #0x150]
00000000004283e4	ldp	x28, x27, [sp, #0x140]
00000000004283e8	ldp	d9, d8, [sp, #0x130]
00000000004283ec	add	sp, sp, #0x180
00000000004283f0	ret
00000000004283f4	b	0x428478
00000000004283f8	bl	___clang_call_terminate
00000000004283fc	bl	___clang_call_terminate
0000000000428400	b	0x428478
0000000000428404	b	0x428478
0000000000428408	mov	x19, x0
000000000042840c	mov	x0, x20
0000000000428410	bl	0x5e7df4 ; symbol stub for: __ZN8HGObjectdlEPv
0000000000428414	add	x0, sp, #0xb0
0000000000428418	bl	__ZN14PCWorkingColorD1Ev
000000000042841c	sub	x0, x29, #0x98
0000000000428420	bl	__ZN7PCColorD1Ev
0000000000428424	mov	x0, x19
0000000000428428	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
000000000042842c	b	0x428430
0000000000428430	mov	x19, x0
0000000000428434	add	x0, sp, #0xb0
0000000000428438	bl	__ZN14PCWorkingColorD1Ev
000000000042843c	sub	x0, x29, #0x98
0000000000428440	bl	__ZN7PCColorD1Ev
0000000000428444	mov	x0, x19
0000000000428448	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
000000000042844c	mov	x19, x0
0000000000428450	sub	x0, x29, #0x98
0000000000428454	bl	__ZN7PCColorD1Ev
0000000000428458	mov	x0, x19
000000000042845c	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
0000000000428460	b	0x428478
0000000000428464	mov	x19, x0
0000000000428468	sub	x0, x29, #0x98
000000000042846c	bl	__ZN7PCColorD1Ev
0000000000428470	mov	x0, x19
0000000000428474	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
0000000000428478	mov	x19, x0
000000000042847c	ldr	x8, [x20]
0000000000428480	ldr	x8, [x8, #0x18]
0000000000428484	mov	x0, x20
0000000000428488	blr	x8
000000000042848c	add	x0, sp, #0xb0
0000000000428490	bl	__ZN14PCWorkingColorD1Ev
0000000000428494	sub	x0, x29, #0x98
0000000000428498	bl	__ZN7PCColorD1Ev
000000000042849c	mov	x0, x19
00000000004284a0	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
00000000004284a4	bl	___clang_call_terminate
```

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

#### Decompiled code (ground truth)

No single decodable CPU method: the scene root; its "algorithm" is the document settings + the evaluation of its children (documented in Document settings).

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

#### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZRigBehavior`). `solveNode` — rig fan-out solver (one master control → many driven params). The actual code Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_component.py --method solveNode OZRigBehavior`

##### `OZRigBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
00000000004af718	sub	sp, sp, #0x90
00000000004af71c	stp	d9, d8, [sp, #0x30]
00000000004af720	stp	x26, x25, [sp, #0x40]
00000000004af724	stp	x24, x23, [sp, #0x50]
00000000004af728	stp	x22, x21, [sp, #0x60]
00000000004af72c	stp	x20, x19, [sp, #0x70]
00000000004af730	stp	x29, x30, [sp, #0x80]
00000000004af734	add	x29, sp, #0x80
00000000004af738	mov.16b	v8, v1
00000000004af73c	mov	x21, x2
00000000004af740	mov	x19, x1
00000000004af744	mov	x20, x0
00000000004af748	add	x0, x0, #0x3e0
00000000004af74c	bl	__ZNK20OZChanObjectManipRef9getObjectEv
00000000004af750	cbz	x0, 0x4af83c
00000000004af754	adrp	x1, 719 ; 0x77e000
00000000004af758	add	x1, x1, #0x998
00000000004af75c	adrp	x2, 783 ; 0x7be000
00000000004af760	add	x2, x2, #0xf18
00000000004af764	mov	w3, #0x10
00000000004af768	bl	0x5e9918 ; symbol stub for: ___dynamic_cast
00000000004af76c	cbz	x0, 0x4af83c
00000000004af770	ldr	x8, [x20, #0x520]
00000000004af774	cbz	x8, 0x4af83c
00000000004af778	ldp	x8, x9, [x8]
00000000004af77c	sub	x8, x9, x8
00000000004af780	tst	x8, #0x7fffffff8
00000000004af784	b.eq	0x4af83c
00000000004af788	mov	x23, x0
00000000004af78c	add	x0, x20, #0x378
00000000004af790	bl	0x5e5514 ; symbol stub for: __ZN13PCSharedMutex11lock_sharedEv
00000000004af794	ldrb	w25, [x20, #0x370]
00000000004af798	cmp	w25, #0x1
00000000004af79c	b.ne	0x4af7b4
00000000004af7a0	ldr	w22, [x20, #0x358]
00000000004af7a4	ldr	w24, [x20, #0x35c]
00000000004af7a8	ldr	d9, [x20, #0x360]
00000000004af7ac	ldrb	w26, [x20, #0x368]
00000000004af7b0	b	0x4af7b4
00000000004af7b4	add	x0, x20, #0x378
00000000004af7b8	bl	0x5e5520 ; symbol stub for: __ZN13PCSharedMutex13unlock_sharedEv
00000000004af7bc	ldr	x8, [x20, #0x170]
00000000004af7c0	ldr	x0, [x8, #0x20]
00000000004af7c4	ldr	x8, [x0]
00000000004af7c8	ldr	x9, [x8, #0x150]
00000000004af7cc	add	x8, sp, #0x18
00000000004af7d0	mov	x1, x21
00000000004af7d4	blr	x9
00000000004af7d8	cbz	w25, 0x4af7ec
00000000004af7dc	tbnz	w26, #0x0, 0x4af83c
00000000004af7e0	stp	w24, w22, [sp, #0x10]
00000000004af7e4	str	d9, [sp, #0x8]
00000000004af7e8	b	0x4af81c
00000000004af7ec	mov	x0, x23
00000000004af7f0	mov	x1, x21
00000000004af7f4	bl	__ZN11OZRigWidget13doPassThroughERK6CMTime
00000000004af7f8	tbnz	w0, #0x0, 0x4af83c
00000000004af7fc	add	x1, sp, #0x18
00000000004af800	add	x2, sp, #0x14
00000000004af804	add	x3, sp, #0x10
00000000004af808	add	x4, sp, #0x8
00000000004af80c	mov	x0, x23
00000000004af810	bl	__ZN11OZRigWidget21getCurrentSnapshotIDsERK6CMTimePjS3_Pd
00000000004af814	ldp	w24, w22, [sp, #0x10]
00000000004af818	ldr	d9, [sp, #0x8]
00000000004af81c	add	x4, sp, #0x18
00000000004af820	mov	x0, x20
00000000004af824	mov	x1, x19
00000000004af828	mov	x2, x22
00000000004af82c	mov	x3, x24
00000000004af830	mov.16b	v0, v9
00000000004af834	bl	__ZN13OZRigBehavior14getRiggedValueEjjjdRK6CMTime
00000000004af838	mov.16b	v8, v0
00000000004af83c	mov.16b	v0, v8
00000000004af840	ldp	x29, x30, [sp, #0x80]
00000000004af844	ldp	x20, x19, [sp, #0x70]
00000000004af848	ldp	x22, x21, [sp, #0x60]
00000000004af84c	ldp	x24, x23, [sp, #0x50]
00000000004af850	ldp	x26, x25, [sp, #0x40]
00000000004af854	ldp	d9, d8, [sp, #0x30]
00000000004af858	add	sp, sp, #0x90
00000000004af85c	ret
00000000004af860	bl	___clang_call_terminate
```

