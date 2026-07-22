# Motion Behaviors — corpus reference

Behaviors are Apple Motion's procedural animation system: instead of keyframing a parameter, a behavior *computes* its value every frame from a few controls. In the scene graph they are `<behavior>` / `<parameterBehavior>` nodes attached to an object or a specific parameter channel. This engine evaluates them in `engine/src/evaluator/` (`links.ts`, `ramp.ts`, `motion-curve.ts`, `behaviors/`).

All **34** behavior types observed across the **5,365-file** corpus are documented below, ordered by usage (files). Counts are empirical. Two families:

- **Parameter behaviors** drive a single parameter/channel (Link, Ramp, Oscillate, Clamp…).
- **Motion behaviors** drive an object's transform, including physics simulations (Throw, Gravity, Spring, Repel…).

> Every behavior carries **`Affecting Object (Hidden)`** — the internal target reference, not a user control — plus, on object behaviors, style passthrough params (`Format`, `Face`, `Glow`, `Drop Shadow`, `Controls`…). These are omitted from the tables below.

> **Decompiled code (ground truth).** The 10 physics/**simulation** behaviors — Gravity, Throw, Spin, Spring, Drag, Rotational Drag, Random Motion, Attractor, Orbit Around, Repel — each carry a `### Decompiled code (ground truth)` subsection with the **verbatim ARM64 disassembly** of their `accumForces` / `accumInitialValues` method, extracted from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`) via [`tools/re/disasm_behavior.py`](../../tools/re/disasm_behavior.py). That method is exactly what the shared Ozone integrator calls each sub-step to add the behavior's force / initial velocity to the object's motion state — the real per-frame algorithm, not a paraphrase. The parameter behaviors (Oscillate, Ramp, Randomize, Clamp, …) are table-driven inside the Ozone core rather than exposing a standalone per-frame method in this binary, so they keep their functional descriptions; decode them from the Ozone core (`Ozone.framework/Versions/A/Ozone`) if needed.

## Index

| Behavior | Family | Files | Instances |
|---|---|---|---|
| [Link](#link) | Parameter | 3495 | 50480 |
| [Rig Behavior](#rig-behavior) | Parameter | 3240 | 45242 |
| [Clamp](#clamp) | Parameter | 1640 | 6594 |
| [Custom](#custom) | Parameter | 824 | 2032 |
| [Sequence Text](#sequence-text) | Parameter | 400 | 1563 |
| [Ramp](#ramp) | Parameter | 327 | 1873 |
| [Sequence](#sequence) | Parameter | 312 | 993 |
| [Rate](#rate) | Parameter | 310 | 711 |
| [Fade In/Fade Out](#fade-infade-out) | Parameter | 280 | 729 |
| [Oscillate](#oscillate) | Parameter | 194 | 788 |
| [Align To](#align-to) | Motion | 191 | 907 |
| [Randomize](#randomize) | Parameter | 188 | 496 |
| [Track](#track) | Motion | 146 | 606 |
| [Wriggle](#wriggle) | Parameter | 144 | 362 |
| [Negate](#negate) | Parameter | 83 | 120 |
| [Overshoot](#overshoot) | Parameter | 69 | 145 |
| [Motion Path](#motion-path) | Motion | 59 | 181 |
| [Gravity](#gravity) | Motion (simulation) | 40 | 148 |
| [Random Motion](#random-motion) | Motion (simulation) | 34 | 57 |
| [Drag](#drag) | Motion (simulation) | 29 | 109 |
| [Spin](#spin) | Motion | 21 | 69 |
| [Throw](#throw) | Motion (simulation) | 21 | 54 |
| [Grow/Shrink](#growshrink) | Motion | 20 | 51 |
| [Spring](#spring) | Motion (simulation) | 18 | 90 |
| [Type On](#type-on) | Parameter | 14 | 16 |
| [Repel](#repel) | Motion (simulation) | 9 | 20 |
| [Point](#point) | Parameter | 7 | 38 |
| [Edge Collision](#edge-collision) | Motion (simulation) | 5 | 11 |
| [Rotational Drag](#rotational-drag) | Motion (simulation) | 3 | 14 |
| [Snap Alignment](#snap-alignment) | Motion | 3 | 13 |
| [Stop](#stop) | Parameter | 2 | 9 |
| [Orbit Around](#orbit-around) | Motion (simulation) | 2 | 3 |
| [Reverse](#reverse) | Parameter | 1 | 1 |
| [Attractor](#attractor) | Motion (simulation) | 1 | 1 |

---

## Link

*Parameter behavior · 3495 files · 50480 instances*

Reads a **Source Object**'s value each frame and drives the target parameter from it, with optional linear remap (min/max) and Scale. The backbone of Motion rigs: one master control fanned out to many parameters. Channel-suffixed instances (Link PX/SY/RZ) drive individual position/scale/rotation axes.

| Parameter | What it controls |
|---|---|
| Source Object | The object/parameter whose value is read. |
| Mix Time Range | How the source is sampled in time relative to the target. |
| Clamp Source Value Within Range | Clamp the source to [min,max] before remapping. |
| X min | Input-range low end of the source value… |
| X max | …input-range high end, mapped linearly to the output range. |
| Scale | Multiplier applied to the source value before it drives the target (default 1). |
| Y min | Output-range low end. |
| Y max | Output-range high end. |
| Source Frame Mode | Sample the source at a fixed frame instead of the current time. |
| Source Frame | The fixed frame to sample when Source Frame Mode is on. |

Other observed parameters (not individually described): `Red min`, `Red max`, `Green min`, `Green max`, `Blue min`, `Blue max`, `Y offset`, `X offset`, `Source Attribute`, `Custom Mix`, `Width min`, `Width max`, `Z min`.

## Rig Behavior

*Parameter behavior · 3240 files · 45242 instances*

Backs a **Rig**'s published Widget (slider/popup/checkbox): stores parameter **Snapshots** and interpolates the rigged params between them as the Widget value moves. A popup snaps between discrete snapshots; a slider blends continuously.

| Parameter | What it controls |
|---|---|
| Widget | The published control whose value selects/blends snapshots. |
| Snapshots | The stored parameter states interpolated between. |

## Clamp

*Parameter behavior · 1640 files · 6594 instances*

Constrains the parameter it is attached to within a range every frame.

| Parameter | What it controls |
|---|---|
| Max | Upper bound. |
| Min | Lower bound. |
| Clamp At | Clamp the low end, high end, or both. |

Other observed parameters (not individually described): `Source Object`, `Mix Time Range`, `Clamp Source Value Within Range`, `Max min`, `Max max`, `Min min`, `Min max`, `Apply Mode`, `Scale`, `Y min`, `Y max`, `X min`, `X max`, `Y offset`, `X offset`.

## Custom

*Parameter behavior · 824 files · 2032 instances*

A generic container holding a hand-authored curve/expression for the parameter — bespoke animation that is not one of the named behaviors.

Other observed parameters (not individually described): `Opacity`, `Position`, `Scale`, `Position.Y`, `Position.X`, `Rotation`, `Scale.X`, `Rotation.X`, `Rotation.Z`, `Rotation.Y`, `Mix`, `Position.Z`, `Source Object`, `Mix Time Range`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`.

## Sequence Text

*Parameter behavior · 400 files · 1563 instances*

Animates a repeating transform (position/scale/opacity/color/…) across the units of a Text object, offset in time per unit — the basis of type-on and cascading text animations.

| Parameter | What it controls |
|---|---|
| Sequence Control | How the animation spreads across characters/words/lines. |

Other observed parameters (not individually described): `3D`, `Old Steel`, `Dark Gold`, `Blue Plastic`, `Cardboard`.

## Ramp

*Parameter behavior · 327 files · 1873 instances*

A self-contained tween: drives the parameter from **Start Value** to **End Value** over the behavior's active range, shaped by **Curvature**.

| Parameter | What it controls |
|---|---|
| Curvature | Ease shape (0 = linear, higher = more ease). |
| End Value | Value at the end. |
| Start Value | Value at the start of the ramp. |
| End Offset | Trim frames off the end of the active range. |
| Start Offset | Trim frames off the start of the active range. |

Other observed parameters (not individually described): `Source Object`, `Mix Time Range`, `Custom Mix`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`, `Z max`, `Animate min`, `Animate max`.

## Sequence

*Parameter behavior · 312 files · 993 instances*

The general sequence behavior — spreads an animated transform across an object's sub-elements (replicator cells, text units) with staggered timing.

| Parameter | What it controls |
|---|---|
| Sequence Control | Spread mode across sub-elements. |
| Scale | Per-element scale. |
| Opacity | Per-element opacity. |
| Position | Per-element position. |
| Rotation | Per-element rotation. |

Other observed parameters (not individually described): `Color`, `Redwood`, `Width`.

## Rate

*Parameter behavior · 310 files · 711 instances*

Adds a steady per-frame increment to the parameter — constant-velocity drive (e.g. continuous rotation or scroll).

| Parameter | What it controls |
|---|---|
| Rate | Amount added per unit time. |
| Curvature | Optional ease on the rate ramp. |
| End Offset | Trim frames off the end of the active range. |

## Fade In/Fade Out

*Parameter behavior · 280 files · 729 instances*

An opacity envelope: fades the object in over Fade In Time at the start and out over Fade Out Time at the end.

| Parameter | What it controls |
|---|---|
| Fade Out Time | Duration of the closing fade. |
| Fade In Time | Duration of the opening fade (frames). |
| End Offset | Advance the fade-out. |
| Start Offset | Delay the fade-in. |

## Oscillate

*Parameter behavior · 194 files · 788 instances*

Adds a periodic oscillation (sine/triangle/square/sawtooth) to the parameter.

| Parameter | What it controls |
|---|---|
| Amplitude | Peak deviation from the base value. |
| Speed | Oscillations per unit time. |
| Phase | Starting offset of the wave. |
| Wave Shape | Sine / triangle / square / sawtooth. |
| Start Offset | Trim start frames. |
| Half Range | Oscillate only to one side of the base value. |
| End Offset | Trim end frames. |

Other observed parameters (not individually described): `Oscillate Around`, `Origin`, `Start`, `End`.

## Align To

*Motion behavior · 191 files · 907 instances*

Keeps the object oriented toward / aligned with a target object.

Other observed parameters (not individually described): `Object`, `Align`, `To`, `Offset`, `Transition`, `Custom Amount`, `Align Frame`, `Ignore Sequencing`, `Alignment`, `End Offset`, `Target Alignment`, `Affect Subobjects`.

## Randomize

*Parameter behavior · 188 files · 496 instances*

Adds per-frame pseudo-random variation to the parameter (jittery), seeded and band-limited by Frequency/Noisiness.

| Parameter | What it controls |
|---|---|
| Amount | Magnitude of the random variation. |
| Frequency | How fast the value changes. |
| Noisiness | Adds higher-frequency roughness on top. |
| Random Seed | Seed; reshuffles the pattern. |
| Apply Mode | Add to / replace the base value. |
| Start Offset | Trim start frames. |
| End Offset | Trim end frames. |
| Multiplier | Scales the applied amount. |

Other observed parameters (not individually described): `Wriggle Offset`, `Affect Subobjects`.

## Track

*Motion behavior · 146 files · 606 instances*

Drives the object's transform from tracking data (a Tracker), so it follows tracked screen motion.

| Parameter | What it controls |
|---|---|
| Source | Tracked source. |
| Tracker Root | Root of the tracker data. |
| Transform | Channels driven by the track. |

Other observed parameters (not individually described): `Align Tangents`, `Tracker`.

## Wriggle

*Parameter behavior · 144 files · 362 instances*

Like Randomize but with **smooth** noise — organic wandering rather than per-frame jitter.

| Parameter | What it controls |
|---|---|
| Amount | Magnitude of the wander. |
| Frequency | Speed of the wander. |
| Noisiness | Higher-frequency roughness. |
| Random Seed | Seed. |
| Wriggle Offset | Phase offset into the noise field. |
| Start Offset | Trim start frames. |
| End Offset | Trim end frames. |
| Preserve Angle | Keep orientation while wriggling. |

Other observed parameters (not individually described): `Apply Mode`.

## Negate

*Parameter behavior · 83 files · 120 instances*

Inverts the source parameter value (multiplies by −1) every frame.

## Overshoot

*Parameter behavior · 69 files · 145 instances*

Springy settle: ramps toward a target but overshoots and oscillates past it before settling — a bouncy ease.

| Parameter | What it controls |
|---|---|
| Ramp Duration | Time over which the value ramps to target. |
| End Offset | Trim end frames. |
| Start Value | Value at start. |
| Cycles | Number of overshoot oscillations. |
| Start Offset | Trim start frames. |
| End Value | Target value. |
| Acceleration | Shape of the ramp acceleration. |

## Motion Path

*Motion behavior · 59 files · 181 instances*

Moves the object's position along an authored spline path, with speed control.

| Parameter | What it controls |
|---|---|
| Shape Source | Source of the path. |
| Custom Speed | Use a custom speed curve. |
| Path Shape | The path geometry (open/closed spline). |
| Speed | Travel speed along the path. |
| Loops | How many times to traverse. |
| End Condition | What happens at the path end (stop/loop/ping-pong). |
| Direction | Forward/reverse traversal. |
| Offset | Starting offset along the path. |
| Amplitude | Wave amplitude if oscillating along path. |
| Frequency | Wave frequency. |
| Phase | Wave phase. |

Other observed parameters (not individually described): `Position`, `End Point`, `Apply Speed`, `Damping`, `Radius`, `Attach To Shape`, `Start Value`, `End Value`, `Start Point`, `Shape Type`, `Size`.

## Gravity

*Motion (simulation) behavior · 40 files · 148 instances*

Applies constant downward acceleration to a moving object (used with Throw for arcs).

| Parameter | What it controls |
|---|---|
| Acceleration | Downward acceleration magnitude. |
| Affect Subobjects | Also affect child objects. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZGravityBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZGravityBehavior`

#### `OZGravityBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
0000000000011cf0	sub	sp, sp, #0x50
0000000000011cf4	stp	d9, d8, [sp, #0x20]
0000000000011cf8	stp	x20, x19, [sp, #0x30]
0000000000011cfc	stp	x29, x30, [sp, #0x40]
0000000000011d00	add	x29, sp, #0x40
0000000000011d04	mov	x19, x1
0000000000011d08	ldr	q0, [x1, #0xb0]
0000000000011d0c	str	q0, [sp]
0000000000011d10	ldr	x8, [x1, #0xc0]
0000000000011d14	str	x8, [sp, #0x10]
0000000000011d18	ldr	d8, [x1, #0x88]
0000000000011d1c	add	x0, x0, #0x1f0
0000000000011d20	mov	x1, sp
0000000000011d24	movi.2d	v0, #0000000000000000
0000000000011d28	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000011d2c	fsub	d0, d8, d0
0000000000011d30	str	d0, [x19, #0x88]
0000000000011d34	ldp	x29, x30, [sp, #0x40]
0000000000011d38	ldp	x20, x19, [sp, #0x30]
0000000000011d3c	ldp	d9, d8, [sp, #0x20]
0000000000011d40	add	sp, sp, #0x50
0000000000011d44	ret
```

## Random Motion

*Motion (simulation) behavior · 34 files · 57 instances*

Sends the object wandering along a smooth random path (2D/3D), seeded.

| Parameter | What it controls |
|---|---|
| Amount | Magnitude of the wander. |
| Random Seed | Seed. |
| Affect Subobjects | Also move child objects. |
| Frequency | Speed of direction change. |
| Noisiness | Roughness of the path. |
| Drag | Velocity damping. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZBrownianBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZBrownianBehavior`

#### `OZBrownianBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
000000000001b444	sub	sp, sp, #0x150
000000000001b448	stp	d15, d14, [sp, #0xb0]
000000000001b44c	stp	d13, d12, [sp, #0xc0]
000000000001b450	stp	d11, d10, [sp, #0xd0]
000000000001b454	stp	d9, d8, [sp, #0xe0]
000000000001b458	stp	x28, x27, [sp, #0xf0]
000000000001b45c	stp	x26, x25, [sp, #0x100]
000000000001b460	stp	x24, x23, [sp, #0x110]
000000000001b464	stp	x22, x21, [sp, #0x120]
000000000001b468	stp	x20, x19, [sp, #0x130]
000000000001b46c	stp	x29, x30, [sp, #0x140]
000000000001b470	add	x29, sp, #0x140
000000000001b474	mov	x22, x2
000000000001b478	mov	x19, x1
000000000001b47c	mov	x20, x0
000000000001b480	ldr	q0, [x1, #0xb0]
000000000001b484	str	q0, [sp, #0x50]
000000000001b488	ldr	x8, [x1, #0xc0]
000000000001b48c	str	x8, [sp, #0x60]
000000000001b490	ldr	q0, [x1, #0xb0]
000000000001b494	str	q0, [sp, #0x90]
000000000001b498	ldr	x8, [x1, #0xc0]
000000000001b49c	str	x8, [sp, #0xa0]
000000000001b4a0	ldr	x8, [x0]
000000000001b4a4	ldr	x8, [x8, #0x128]
000000000001b4a8	add	x1, sp, #0x90
000000000001b4ac	mov	w2, #0x0
000000000001b4b0	mov	w3, #0x1
000000000001b4b4	mov	w4, #0x1
000000000001b4b8	blr	x8
000000000001b4bc	cbz	w0, 0x1ba20
000000000001b4c0	add	x8, sp, #0x20
000000000001b4c4	add	x0, x20, #0x30
000000000001b4c8	bl	0xa87c0 ; symbol stub for: __ZNK23OZChannelObjectRootBase13getTimeOffsetEv
000000000001b4cc	ldr	q0, [sp, #0x50]
000000000001b4d0	str	q0, [sp, #0x90]
000000000001b4d4	ldr	x8, [sp, #0x60]
000000000001b4d8	str	x8, [sp, #0xa0]
000000000001b4dc	ldr	q0, [sp, #0x20]
000000000001b4e0	str	q0, [sp, #0x70]
000000000001b4e4	ldr	x8, [sp, #0x30]
000000000001b4e8	str	x8, [sp, #0x80]
000000000001b4ec	add	x8, sp, #0x38
000000000001b4f0	add	x0, sp, #0x90
000000000001b4f4	add	x1, sp, #0x70
000000000001b4f8	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
000000000001b4fc	ldr	x8, [x20]
000000000001b500	ldr	x8, [x8, #0x140]
000000000001b504	mov	x0, x20
000000000001b508	blr	x8
000000000001b50c	ldr	x8, [x0]
000000000001b510	ldr	x8, [x8, #0x110]
000000000001b514	blr	x8
000000000001b518	movi.2d	v10, #0000000000000000
000000000001b51c	add	x0, x20, #0x6a0
000000000001b520	add	x1, sp, #0x50
000000000001b524	movi.2d	v0, #0000000000000000
000000000001b528	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000001b52c	mov	x21, x0
000000000001b530	cbz	x22, 0x1b53c
000000000001b534	ldr	w8, [x22, #0x48]
000000000001b538	eor	w21, w8, w21
000000000001b53c	mov	w22, #0x79b9
000000000001b540	movk	w22, #0x9e37, lsl #16
000000000001b544	ldur	q0, [sp, #0x38]
000000000001b548	str	q0, [sp, #0x90]
000000000001b54c	ldr	x8, [sp, #0x48]
000000000001b550	str	x8, [sp, #0xa0]
000000000001b554	add	x0, sp, #0x90
000000000001b558	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
000000000001b55c	fadd	d11, d0, d10
000000000001b560	add	x0, x20, #0x288
000000000001b564	add	x1, sp, #0x50
000000000001b568	movi.2d	v0, #0000000000000000
000000000001b56c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001b570	mov.16b	v8, v0
000000000001b574	add	x0, x20, #0x320
000000000001b578	add	x1, sp, #0x50
000000000001b57c	movi.2d	v0, #0000000000000000
000000000001b580	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001b584	str	d0, [sp, #0x18]
000000000001b588	mov	w26, #0x0
000000000001b58c	fadd	d0, d11, d11
000000000001b590	str	d0, [sp, #0x10]
000000000001b594	adrp	x8, 227 ; 0xfe000
000000000001b598	ldr	w23, [x8, #0xda0]
000000000001b59c	adrp	x8, 227 ; 0xfe000
000000000001b5a0	ldr	w24, [x8, #0xda4]
000000000001b5a4	mov	x8, #0xffffffc00000
000000000001b5a8	movk	x8, #0x41df, lsl #48
000000000001b5ac	fmov	d12, x8
000000000001b5b0	mov	x8, #0x2d18
000000000001b5b4	movk	x8, #0x5444, lsl #16
000000000001b5b8	movk	x8, #0x21fb, lsl #32
000000000001b5bc	movk	x8, #0x4009, lsl #48
000000000001b5c0	fmov	d9, x8
000000000001b5c4	adrp	x8, 227 ; 0xfe000
000000000001b5c8	ldr	w25, [x8, #0xda8]
000000000001b5cc	fmov	d15, #1.00000000
000000000001b5d0	mov.16b	v11, v8
000000000001b5d4	ldr	d0, [sp, #0x10]
000000000001b5d8	fmul	d0, d0, d11
000000000001b5dc	fcvtzs	w8, d0
000000000001b5e0	mov	w11, #-0x20
000000000001b5e4	mov	w12, #0x79b9
000000000001b5e8	movk	w12, #0x9e37, lsl #16
000000000001b5ec	mov	x9, x26
000000000001b5f0	mov	x10, x21
000000000001b5f4	add	w13, w8, w10, lsl #4
000000000001b5f8	add	w14, w10, w12
000000000001b5fc	eor	w13, w13, w14
000000000001b600	add	w14, w23, w10, lsr #5
000000000001b604	eor	w13, w13, w14
000000000001b608	add	w9, w13, w9
000000000001b60c	add	w13, w12, w9
000000000001b610	add	w14, w24, w9, lsl #4
000000000001b614	eor	w13, w14, w13
000000000001b618	add	w14, w25, w9, lsr #5
000000000001b61c	eor	w13, w13, w14
000000000001b620	add	w10, w13, w10
000000000001b624	add	w12, w12, w22
000000000001b628	adds	w11, w11, #0x1
000000000001b62c	b.lo	0x1b5f4
000000000001b630	add	w11, w8, #0x1
000000000001b634	mov	w13, #-0x20
000000000001b638	mov	w15, #0x79b9
000000000001b63c	movk	w15, #0x9e37, lsl #16
000000000001b640	mov	x12, x26
000000000001b644	mov	x14, x21
000000000001b648	add	w16, w11, w14, lsl #4
000000000001b64c	add	w17, w14, w15
000000000001b650	eor	w16, w16, w17
000000000001b654	add	w17, w23, w14, lsr #5
000000000001b658	eor	w16, w16, w17
000000000001b65c	add	w12, w16, w12
000000000001b660	add	w16, w15, w12
000000000001b664	add	w17, w24, w12, lsl #4
000000000001b668	eor	w16, w17, w16
000000000001b66c	add	w17, w25, w12, lsr #5
000000000001b670	eor	w16, w16, w17
000000000001b674	add	w14, w16, w14
000000000001b678	add	w15, w15, w22
000000000001b67c	adds	w13, w13, #0x1
000000000001b680	b.lo	0x1b648
000000000001b684	eor	w9, w10, w9
000000000001b688	scvtf	d1, w9
000000000001b68c	eor	w9, w14, w12
000000000001b690	scvtf	d2, w9
000000000001b694	fdiv	d14, d1, d12
000000000001b698	scvtf	d1, w8
000000000001b69c	fsub	d0, d0, d1
000000000001b6a0	fmul	d0, d0, d9
000000000001b6a4	fdiv	d13, d2, d12
000000000001b6a8	bl	0xa8b14 ; symbol stub for: _cos
000000000001b6ac	fmov	d1, #1.00000000
000000000001b6b0	fsub	d0, d1, d0
000000000001b6b4	fmov	d2, #0.50000000
000000000001b6b8	fmul	d0, d0, d2
000000000001b6bc	fsub	d1, d1, d0
000000000001b6c0	fmul	d1, d1, d14
000000000001b6c4	fmul	d0, d0, d13
000000000001b6c8	fadd	d0, d1, d0
000000000001b6cc	fmul	d0, d15, d0
000000000001b6d0	fadd	d10, d10, d0
000000000001b6d4	fadd	d11, d11, d11
000000000001b6d8	ldr	d0, [sp, #0x18]
000000000001b6dc	fmul	d15, d0, d15
000000000001b6e0	add	w26, w26, #0x1
000000000001b6e4	cmp	w26, #0xa
000000000001b6e8	b.ne	0x1b5d4
000000000001b6ec	mov	w26, #0x0
000000000001b6f0	mvn	w27, w21
000000000001b6f4	movi.2d	v12, #0000000000000000
000000000001b6f8	mov	x8, #0xffffffc00000
000000000001b6fc	movk	x8, #0x41df, lsl #48
000000000001b700	fmov	d14, x8
000000000001b704	mov	x8, #0x2d18
000000000001b708	movk	x8, #0x5444, lsl #16
000000000001b70c	movk	x8, #0x21fb, lsl #32
000000000001b710	movk	x8, #0x4009, lsl #48
000000000001b714	str	x8, [sp, #0x8]
000000000001b718	fmov	d13, #1.00000000
000000000001b71c	mov.16b	v11, v8
000000000001b720	ldr	d0, [sp, #0x10]
000000000001b724	fmul	d0, d0, d11
000000000001b728	fcvtzs	w8, d0
000000000001b72c	mov	w11, #-0x20
000000000001b730	mov	w12, #0x79b9
000000000001b734	movk	w12, #0x9e37, lsl #16
000000000001b738	mov	x9, x26
000000000001b73c	mov	x10, x27
000000000001b740	add	w13, w8, w10, lsl #4
000000000001b744	add	w14, w10, w12
000000000001b748	eor	w13, w13, w14
000000000001b74c	add	w14, w23, w10, lsr #5
000000000001b750	eor	w13, w13, w14
000000000001b754	add	w9, w13, w9
000000000001b758	add	w13, w12, w9
000000000001b75c	add	w14, w24, w9, lsl #4
000000000001b760	eor	w13, w14, w13
000000000001b764	add	w14, w25, w9, lsr #5
000000000001b768	eor	w13, w13, w14
000000000001b76c	add	w10, w13, w10
000000000001b770	add	w12, w12, w22
000000000001b774	adds	w11, w11, #0x1
000000000001b778	b.lo	0x1b740
000000000001b77c	add	w11, w8, #0x1
000000000001b780	mov	w13, #-0x20
000000000001b784	mov	w15, #0x79b9
000000000001b788	movk	w15, #0x9e37, lsl #16
000000000001b78c	mov	x12, x26
000000000001b790	mov	x14, x27
000000000001b794	add	w16, w11, w14, lsl #4
000000000001b798	add	w17, w14, w15
000000000001b79c	eor	w16, w16, w17
000000000001b7a0	add	w17, w23, w14, lsr #5
000000000001b7a4	eor	w16, w16, w17
000000000001b7a8	add	w12, w16, w12
000000000001b7ac	add	w16, w15, w12
000000000001b7b0	add	w17, w24, w12, lsl #4
000000000001b7b4	eor	w16, w17, w16
000000000001b7b8	add	w17, w25, w12, lsr #5
000000000001b7bc	eor	w16, w16, w17
000000000001b7c0	add	w14, w16, w14
000000000001b7c4	add	w15, w15, w22
000000000001b7c8	adds	w13, w13, #0x1
000000000001b7cc	b.lo	0x1b794
000000000001b7d0	eor	w9, w10, w9
000000000001b7d4	scvtf	d1, w9
000000000001b7d8	eor	w9, w14, w12
000000000001b7dc	scvtf	d2, w9
000000000001b7e0	fdiv	d15, d1, d14
000000000001b7e4	scvtf	d1, w8
000000000001b7e8	fsub	d0, d0, d1
000000000001b7ec	ldr	d1, [sp, #0x8]
000000000001b7f0	fmul	d0, d0, d1
000000000001b7f4	fdiv	d9, d2, d14
000000000001b7f8	bl	0xa8b14 ; symbol stub for: _cos
000000000001b7fc	fmov	d1, #1.00000000
000000000001b800	fsub	d0, d1, d0
000000000001b804	fmov	d2, #0.50000000
000000000001b808	fmul	d0, d0, d2
000000000001b80c	fsub	d1, d1, d0
000000000001b810	fmul	d1, d1, d15
000000000001b814	fmul	d0, d0, d9
000000000001b818	fadd	d0, d1, d0
000000000001b81c	fmul	d0, d13, d0
000000000001b820	fadd	d12, d12, d0
000000000001b824	fadd	d11, d11, d11
000000000001b828	ldr	d0, [sp, #0x18]
000000000001b82c	fmul	d13, d0, d13
000000000001b830	add	w26, w26, #0x1
000000000001b834	cmp	w26, #0xa
000000000001b838	b.ne	0x1b720
000000000001b83c	mov	w26, #0x0
000000000001b840	add	w21, w21, #0x1ff
000000000001b844	movi.2d	v13, #0000000000000000
000000000001b848	mov	x8, #0xffffffc00000
000000000001b84c	movk	x8, #0x41df, lsl #48
000000000001b850	fmov	d15, x8
000000000001b854	mov	x8, #0x2d18
000000000001b858	movk	x8, #0x5444, lsl #16
000000000001b85c	movk	x8, #0x21fb, lsl #32
000000000001b860	movk	x8, #0x4009, lsl #48
000000000001b864	str	x8, [sp, #0x8]
000000000001b868	fmov	d11, #1.00000000
000000000001b86c	ldr	d0, [sp, #0x10]
000000000001b870	fmul	d0, d0, d8
000000000001b874	fcvtzs	w8, d0
000000000001b878	mov	w11, #-0x20
000000000001b87c	mov	w12, #0x79b9
000000000001b880	movk	w12, #0x9e37, lsl #16
000000000001b884	mov	x9, x26
000000000001b888	mov	x10, x21
000000000001b88c	add	w13, w8, w10, lsl #4
000000000001b890	add	w14, w12, w10
000000000001b894	eor	w13, w13, w14
000000000001b898	add	w14, w23, w10, lsr #5
000000000001b89c	eor	w13, w13, w14
000000000001b8a0	add	w9, w13, w9
000000000001b8a4	add	w13, w12, w9
000000000001b8a8	add	w14, w24, w9, lsl #4
000000000001b8ac	eor	w13, w14, w13
000000000001b8b0	add	w14, w25, w9, lsr #5
000000000001b8b4	eor	w13, w13, w14
000000000001b8b8	add	w10, w13, w10
000000000001b8bc	add	w12, w12, w22
000000000001b8c0	adds	w11, w11, #0x1
000000000001b8c4	b.lo	0x1b88c
000000000001b8c8	add	w11, w8, #0x1
000000000001b8cc	mov	w13, #-0x20
000000000001b8d0	mov	w15, #0x79b9
000000000001b8d4	movk	w15, #0x9e37, lsl #16
000000000001b8d8	mov	x12, x26
000000000001b8dc	mov	x14, x21
000000000001b8e0	add	w16, w11, w14, lsl #4
000000000001b8e4	add	w17, w15, w14
000000000001b8e8	eor	w16, w16, w17
000000000001b8ec	add	w17, w23, w14, lsr #5
000000000001b8f0	eor	w16, w16, w17
000000000001b8f4	add	w12, w16, w12
000000000001b8f8	add	w16, w15, w12
000000000001b8fc	add	w17, w24, w12, lsl #4
000000000001b900	eor	w16, w17, w16
000000000001b904	add	w17, w25, w12, lsr #5
000000000001b908	eor	w16, w16, w17
000000000001b90c	add	w14, w16, w14
000000000001b910	add	w15, w15, w22
000000000001b914	adds	w13, w13, #0x1
000000000001b918	b.lo	0x1b8e0
000000000001b91c	eor	w9, w10, w9
000000000001b920	scvtf	d1, w9
000000000001b924	eor	w9, w14, w12
000000000001b928	scvtf	d2, w9
000000000001b92c	fdiv	d9, d1, d15
000000000001b930	scvtf	d1, w8
000000000001b934	fsub	d0, d0, d1
000000000001b938	ldr	d1, [sp, #0x8]
000000000001b93c	fmul	d0, d0, d1
000000000001b940	fdiv	d14, d2, d15
000000000001b944	bl	0xa8b14 ; symbol stub for: _cos
000000000001b948	fmov	d1, #1.00000000
000000000001b94c	fsub	d0, d1, d0
000000000001b950	fmov	d2, #0.50000000
000000000001b954	fmul	d0, d0, d2
000000000001b958	fsub	d1, d1, d0
000000000001b95c	fmul	d1, d1, d9
000000000001b960	fmul	d0, d0, d14
000000000001b964	fadd	d0, d1, d0
000000000001b968	fmul	d0, d11, d0
000000000001b96c	fadd	d13, d13, d0
000000000001b970	fadd	d8, d8, d8
000000000001b974	ldr	d0, [sp, #0x18]
000000000001b978	fmul	d11, d0, d11
000000000001b97c	add	w26, w26, #0x1
000000000001b980	cmp	w26, #0xa
000000000001b984	b.ne	0x1b86c
000000000001b988	add	x0, x20, #0x1f0
000000000001b98c	add	x1, sp, #0x50
000000000001b990	movi.2d	v0, #0000000000000000
000000000001b994	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001b998	fmul	d8, d10, d0
000000000001b99c	fmul	d9, d12, d0
000000000001b9a0	fmul	d10, d13, d0
000000000001b9a4	add	x0, x20, #0x3b8
000000000001b9a8	add	x1, sp, #0x50
000000000001b9ac	movi.2d	v0, #0000000000000000
000000000001b9b0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001b9b4	ldp	d1, d2, [x19, #0x38]
000000000001b9b8	fmul	d1, d0, d1
000000000001b9bc	fsub	d8, d8, d1
000000000001b9c0	fmul	d1, d0, d2
000000000001b9c4	fsub	d9, d9, d1
000000000001b9c8	ldr	d1, [x19, #0x48]
000000000001b9cc	fmul	d0, d0, d1
000000000001b9d0	fsub	d10, d10, d0
000000000001b9d4	stp	xzr, xzr, [sp, #0x90]
000000000001b9d8	str	xzr, [sp, #0xa0]
000000000001b9dc	add	x0, x20, #0x450
000000000001b9e0	add	x1, sp, #0x50
000000000001b9e4	add	x2, sp, #0x90
000000000001b9e8	movi.2d	v0, #0000000000000000
000000000001b9ec	bl	0xa77a0 ; symbol stub for: __ZN15OZChannelBool3D8getValueERK6CMTimeP9PCVector3IdEd
000000000001b9f0	ldp	d0, d1, [sp, #0x90]
000000000001b9f4	fmul	d0, d8, d0
000000000001b9f8	fmul	d1, d9, d1
000000000001b9fc	ldr	d2, [sp, #0xa0]
000000000001ba00	fmul	d2, d10, d2
000000000001ba04	ldp	d3, d4, [x19, #0x80]
000000000001ba08	fadd	d0, d0, d3
000000000001ba0c	fadd	d1, d1, d4
000000000001ba10	stp	d0, d1, [x19, #0x80]
000000000001ba14	ldr	d0, [x19, #0x90]
000000000001ba18	fadd	d0, d2, d0
000000000001ba1c	str	d0, [x19, #0x90]
000000000001ba20	ldp	x29, x30, [sp, #0x140]
000000000001ba24	ldp	x20, x19, [sp, #0x130]
000000000001ba28	ldp	x22, x21, [sp, #0x120]
000000000001ba2c	ldp	x24, x23, [sp, #0x110]
000000000001ba30	ldp	x26, x25, [sp, #0x100]
000000000001ba34	ldp	x28, x27, [sp, #0xf0]
000000000001ba38	ldp	d9, d8, [sp, #0xe0]
000000000001ba3c	ldp	d11, d10, [sp, #0xd0]
000000000001ba40	ldp	d13, d12, [sp, #0xc0]
000000000001ba44	ldp	d15, d14, [sp, #0xb0]
000000000001ba48	add	sp, sp, #0x150
000000000001ba4c	ret
```

## Drag

*Motion (simulation) behavior · 29 files · 109 instances*

Damps a moving object's velocity over time (air resistance).

| Parameter | What it controls |
|---|---|
| Amount | Damping strength. |
| Affect Subobjects | Also affect child objects. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZViscousDragBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZViscousDragBehavior`

#### `OZViscousDragBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
0000000000013870	sub	sp, sp, #0x90
0000000000013874	stp	d9, d8, [sp, #0x60]
0000000000013878	stp	x20, x19, [sp, #0x70]
000000000001387c	stp	x29, x30, [sp, #0x80]
0000000000013880	add	x29, sp, #0x80
0000000000013884	mov	x19, x1
0000000000013888	mov	x20, x0
000000000001388c	ldr	q0, [x1, #0xb0]
0000000000013890	str	q0, [sp, #0x40]
0000000000013894	ldr	x8, [x1, #0xc0]
0000000000013898	str	x8, [sp, #0x50]
000000000001389c	add	x0, x0, #0x278
00000000000138a0	add	x1, sp, #0x40
00000000000138a4	movi.2d	v0, #0000000000000000
00000000000138a8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000138ac	str	q0, [sp, #0x10]
00000000000138b0	add	x0, x20, #0x310
00000000000138b4	add	x1, sp, #0x40
00000000000138b8	movi.2d	v0, #0000000000000000
00000000000138bc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000138c0	str	q0, [sp]
00000000000138c4	add	x0, x20, #0x3a8
00000000000138c8	add	x1, sp, #0x40
00000000000138cc	movi.2d	v0, #0000000000000000
00000000000138d0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000138d4	ldr	d1, [x19, #0x48]
00000000000138d8	fmul	d8, d0, d1
00000000000138dc	stp	xzr, xzr, [sp, #0x20]
00000000000138e0	str	xzr, [sp, #0x30]
00000000000138e4	ldur	q0, [x19, #0x38]
00000000000138e8	ldp	q2, q1, [sp]
00000000000138ec	mov.d	v1[1], v2[0]
00000000000138f0	fmul.2d	v0, v1, v0
00000000000138f4	str	q0, [sp, #0x10]
00000000000138f8	add	x0, x20, #0x440
00000000000138fc	add	x1, sp, #0x40
0000000000013900	add	x2, sp, #0x20
0000000000013904	movi.2d	v0, #0000000000000000
0000000000013908	bl	0xa77a0 ; symbol stub for: __ZN15OZChannelBool3D8getValueERK6CMTimeP9PCVector3IdEd
000000000001390c	ldp	q1, q0, [sp, #0x10]
0000000000013910	fmul.2d	v0, v1, v0
0000000000013914	ldr	d1, [sp, #0x30]
0000000000013918	fmul	d1, d8, d1
000000000001391c	ldr	q2, [x19, #0x80]
0000000000013920	fsub.2d	v0, v2, v0
0000000000013924	str	q0, [x19, #0x80]
0000000000013928	ldr	d0, [x19, #0x90]
000000000001392c	fsub	d0, d0, d1
0000000000013930	str	d0, [x19, #0x90]
0000000000013934	ldp	x29, x30, [sp, #0x80]
0000000000013938	ldp	x20, x19, [sp, #0x70]
000000000001393c	ldp	d9, d8, [sp, #0x60]
0000000000013940	add	sp, sp, #0x90
0000000000013944	ret
```

## Spin

*Motion behavior · 21 files · 69 instances*

Continuously rotates the object at a constant rate about an axis.

| Parameter | What it controls |
|---|---|
| Spin Rate | Rotation speed (degrees/sec). |
| Affect Subobjects | Also spin child objects. |
| Axis | Rotation axis (2D/3D). |
| Spin To | Optional target angle. |
| Latitude | 3D axis latitude. |
| Longitude | 3D axis longitude. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZSpinBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZSpinBehavior`

#### `OZSpinBehavior::accumInitialValues(OZSimulationState*, OZTransformNode*)`
```asm
0000000000017818	sub	sp, sp, #0x60
000000000001781c	stp	d9, d8, [sp, #0x20]
0000000000017820	stp	x22, x21, [sp, #0x30]
0000000000017824	stp	x20, x19, [sp, #0x40]
0000000000017828	stp	x29, x30, [sp, #0x50]
000000000001782c	add	x29, sp, #0x50
0000000000017830	mov	x19, x1
0000000000017834	mov	x20, x0
0000000000017838	adrp	x1, 182 ; 0xcd000
000000000001783c	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000017840	add	x0, x0, #0x420
0000000000017844	movi.2d	v0, #0000000000000000
0000000000017848	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000001784c	movi.2d	v0, #0000000000000000
0000000000017850	movi.2d	v1, #0000000000000000
0000000000017854	cmp	w0, #0x1
0000000000017858	b.gt	0x17874
000000000001785c	cbz	w0, 0x178d4
0000000000017860	cmp	w0, #0x1
0000000000017864	b.ne	0x178f0
0000000000017868	adrp	x8, 152 ; 0xaf000
000000000001786c	ldr	q0, [x8, #0x570]
0000000000017870	b	0x178f0
0000000000017874	cmp	w0, #0x2
0000000000017878	b.eq	0x178e8
000000000001787c	cmp	w0, #0x3
0000000000017880	b.ne	0x178f0
0000000000017884	adrp	x21, 182 ; 0xcd000
0000000000017888	ldr	x21, [x21, #0x520] ; literal pool symbol address: _kCMTimeZero
000000000001788c	add	x0, x20, #0x520
0000000000017890	movi.2d	v0, #0000000000000000
0000000000017894	mov	x1, x21
0000000000017898	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001789c	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
00000000000178a0	str	q0, [sp, #0x10]
00000000000178a4	mov.16b	v8, v1
00000000000178a8	add	x0, x20, #0x5b8
00000000000178ac	movi.2d	v0, #0000000000000000
00000000000178b0	mov	x1, x21
00000000000178b4	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000178b8	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
00000000000178bc	fmul	d1, d8, d1
00000000000178c0	fmul	d0, d8, d0
00000000000178c4	mov.d	v1[1], v0[0]
00000000000178c8	ldr	q2, [sp, #0x10]
00000000000178cc	mov.d	v0[1], v2[0]
00000000000178d0	b	0x178f0
00000000000178d4	adrp	x8, 152 ; 0xaf000
00000000000178d8	ldr	q1, [x8, #0x570]
00000000000178dc	adrp	x8, 152 ; 0xaf000
00000000000178e0	ldr	q0, [x8, #0x560]
00000000000178e4	b	0x178f0
00000000000178e8	adrp	x8, 152 ; 0xaf000
00000000000178ec	ldr	q1, [x8, #0x560]
00000000000178f0	stp	q1, q0, [sp]
00000000000178f4	mov	x0, x20
00000000000178f8	bl	__ZN14OZSpinBehavior12calcRotSpeedEv
00000000000178fc	ldp	d1, d2, [x19, #0x70]
0000000000017900	ldp	q3, q4, [sp]
0000000000017904	fmul.2d	v3, v3, v0[0]
0000000000017908	fmul.2d	v0, v4, v0[0]
000000000001790c	mov	d4, v0[1]
0000000000017910	fadd	d1, d4, d1
0000000000017914	fadd	d2, d3, d2
0000000000017918	stp	d1, d2, [x19, #0x70]
000000000001791c	ldp	q1, q2, [x19, #0x50]
0000000000017920	fadd.2d	v2, v3, v2
0000000000017924	fadd.2d	v0, v0, v1
0000000000017928	stp	q0, q2, [x19, #0x50]
000000000001792c	ldp	x29, x30, [sp, #0x50]
0000000000017930	ldp	x20, x19, [sp, #0x40]
0000000000017934	ldp	x22, x21, [sp, #0x30]
0000000000017938	ldp	d9, d8, [sp, #0x20]
000000000001793c	add	sp, sp, #0x60
0000000000017940	ret
```

#### `OZSpinBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
00000000000174ac	sub	sp, sp, #0x180
00000000000174b0	stp	d9, d8, [sp, #0x140]
00000000000174b4	stp	x22, x21, [sp, #0x150]
00000000000174b8	stp	x20, x19, [sp, #0x160]
00000000000174bc	stp	x29, x30, [sp, #0x170]
00000000000174c0	add	x29, sp, #0x170
00000000000174c4	mov	x19, x1
00000000000174c8	mov	x20, x0
00000000000174cc	sub	x21, x29, #0xa0
00000000000174d0	ldr	x8, [x0]
00000000000174d4	ldr	x8, [x8, #0x150]
00000000000174d8	blr	x8
00000000000174dc	add	x8, sp, #0xb8
00000000000174e0	add	x0, x0, #0x90
00000000000174e4	bl	0xa86d0 ; symbol stub for: __ZNK15OZSceneSettings16getFrameDurationEv
00000000000174e8	mov	x8, #0xa9fc
00000000000174ec	movk	x8, #0xd2f1, lsl #16
00000000000174f0	movk	x8, #0x624d, lsl #32
00000000000174f4	movk	x8, #0x3f50, lsl #48
00000000000174f8	fmov	d0, x8
00000000000174fc	add	x8, sp, #0xa0
0000000000017500	add	x0, sp, #0xb8
0000000000017504	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
0000000000017508	ldr	x8, [x20]
000000000001750c	ldr	x9, [x8, #0x268]
0000000000017510	add	x8, sp, #0x70
0000000000017514	mov	x0, x20
0000000000017518	blr	x9
000000000001751c	ldr	q0, [sp, #0x70]
0000000000017520	str	q0, [sp, #0x40]
0000000000017524	ldr	x8, [sp, #0x80]
0000000000017528	str	x8, [sp, #0x50]
000000000001752c	ldr	q0, [x19, #0xb0]
0000000000017530	str	q0, [x21, #0x50]
0000000000017534	ldr	x8, [x19, #0xc0]
0000000000017538	stur	x8, [x29, #-0x40]
000000000001753c	add	x0, sp, #0x40
0000000000017540	sub	x1, x29, #0x50
0000000000017544	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000017548	cmp	w0, #0x1
000000000001754c	b.lt	0x17568
0000000000017550	ldp	x29, x30, [sp, #0x170]
0000000000017554	ldp	x20, x19, [sp, #0x160]
0000000000017558	ldp	x22, x21, [sp, #0x150]
000000000001755c	ldp	d9, d8, [sp, #0x140]
0000000000017560	add	sp, sp, #0x180
0000000000017564	ret
0000000000017568	ldr	q0, [sp, #0x70]
000000000001756c	str	q0, [sp, #0x40]
0000000000017570	ldr	x8, [sp, #0x80]
0000000000017574	str	x8, [sp, #0x50]
0000000000017578	ldur	q0, [sp, #0x88]
000000000001757c	str	q0, [x21, #0x50]
0000000000017580	ldr	x8, [sp, #0x98]
0000000000017584	stur	x8, [x29, #-0x40]
0000000000017588	sub	x8, x29, #0x70
000000000001758c	add	x0, sp, #0x40
0000000000017590	sub	x1, x29, #0x50
0000000000017594	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000017598	ldr	q0, [x21, #0x30]
000000000001759c	str	q0, [sp, #0x40]
00000000000175a0	ldur	x8, [x29, #-0x60]
00000000000175a4	str	x8, [sp, #0x50]
00000000000175a8	ldur	q0, [sp, #0xb8]
00000000000175ac	str	q0, [x21, #0x50]
00000000000175b0	ldr	x8, [sp, #0xc8]
00000000000175b4	stur	x8, [x29, #-0x40]
00000000000175b8	sub	x8, x29, #0x88
00000000000175bc	add	x0, sp, #0x40
00000000000175c0	sub	x1, x29, #0x50
00000000000175c4	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000175c8	ldur	q0, [x19, #0xb0]
00000000000175cc	str	q0, [sp, #0x40]
00000000000175d0	ldur	x8, [x19, #0xc0]
00000000000175d4	str	x8, [sp, #0x50]
00000000000175d8	ldur	q0, [x29, #-0x88]
00000000000175dc	str	q0, [x21, #0x50]
00000000000175e0	ldur	x8, [x29, #-0x78]
00000000000175e4	stur	x8, [x29, #-0x40]
00000000000175e8	add	x0, sp, #0x40
00000000000175ec	sub	x1, x29, #0x50
00000000000175f0	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
00000000000175f4	cmp	w0, #0x0
00000000000175f8	b.gt	0x17550
00000000000175fc	ldr	x8, [x20]
0000000000017600	ldr	x9, [x8, #0x268]
0000000000017604	add	x8, sp, #0x40
0000000000017608	mov	x0, x20
000000000001760c	blr	x9
0000000000017610	ldur	q0, [x19, #0xb0]
0000000000017614	str	q0, [x21, #0x50]
0000000000017618	ldur	x8, [x19, #0xc0]
000000000001761c	stur	x8, [x29, #-0x40]
0000000000017620	ldr	q0, [sp, #0xa0]
0000000000017624	str	q0, [x21, #0x30]
0000000000017628	ldr	x8, [sp, #0xb0]
000000000001762c	stur	x8, [x29, #-0x60]
0000000000017630	add	x8, sp, #0x28
0000000000017634	sub	x0, x29, #0x50
0000000000017638	sub	x1, x29, #0x70
000000000001763c	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000017640	ldr	q0, [sp, #0x40]
0000000000017644	str	q0, [x21, #0x50]
0000000000017648	ldr	x8, [sp, #0x50]
000000000001764c	stur	x8, [x29, #-0x40]
0000000000017650	ldur	q0, [sp, #0x28]
0000000000017654	str	q0, [x21, #0x30]
0000000000017658	ldr	x8, [sp, #0x38]
000000000001765c	stur	x8, [x29, #-0x60]
0000000000017660	sub	x0, x29, #0x50
0000000000017664	sub	x1, x29, #0x70
0000000000017668	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000001766c	cmp	w0, #0x1
0000000000017670	b.ge	0x17708
0000000000017674	ldr	q0, [sp, #0x40]
0000000000017678	str	q0, [x21, #0x50]
000000000001767c	ldr	x8, [sp, #0x50]
0000000000017680	stur	x8, [x29, #-0x40]
0000000000017684	ldur	q0, [sp, #0x58]
0000000000017688	str	q0, [x21, #0x30]
000000000001768c	ldr	x8, [sp, #0x68]
0000000000017690	stur	x8, [x29, #-0x60]
0000000000017694	sub	x8, x29, #0x88
0000000000017698	sub	x0, x29, #0x50
000000000001769c	sub	x1, x29, #0x70
00000000000176a0	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
00000000000176a4	ldur	q0, [x29, #-0x88]
00000000000176a8	str	q0, [x21, #0x50]
00000000000176ac	ldur	x8, [x29, #-0x78]
00000000000176b0	stur	x8, [x29, #-0x40]
00000000000176b4	ldur	q0, [sp, #0xb8]
00000000000176b8	str	q0, [x21, #0x30]
00000000000176bc	ldr	x8, [sp, #0xc8]
00000000000176c0	stur	x8, [x29, #-0x60]
00000000000176c4	sub	x8, x29, #0xa0
00000000000176c8	sub	x0, x29, #0x50
00000000000176cc	sub	x1, x29, #0x70
00000000000176d0	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000176d4	ldur	q0, [sp, #0x28]
00000000000176d8	str	q0, [x21, #0x50]
00000000000176dc	ldr	x8, [sp, #0x38]
00000000000176e0	stur	x8, [x29, #-0x40]
00000000000176e4	ldr	q0, [x21]
00000000000176e8	str	q0, [x21, #0x30]
00000000000176ec	ldur	x8, [x29, #-0x90]
00000000000176f0	stur	x8, [x29, #-0x60]
00000000000176f4	sub	x0, x29, #0x50
00000000000176f8	sub	x1, x29, #0x70
00000000000176fc	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000017700	cmp	w0, #0x1
0000000000017704	b.lt	0x17550
0000000000017708	adrp	x1, 182 ; 0xcd000
000000000001770c	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000017710	add	x0, x20, #0x420
0000000000017714	movi.2d	v0, #0000000000000000
0000000000017718	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000001771c	movi.2d	v0, #0000000000000000
0000000000017720	cmp	w0, #0x1
0000000000017724	b.gt	0x17744
0000000000017728	cbz	w0, 0x177a8
000000000001772c	movi.2d	v1, #0000000000000000
0000000000017730	cmp	w0, #0x1
0000000000017734	b.ne	0x177c4
0000000000017738	adrp	x8, 152 ; 0xaf000
000000000001773c	ldr	q0, [x8, #0x570]
0000000000017740	b	0x177c4
0000000000017744	cmp	w0, #0x2
0000000000017748	b.eq	0x177bc
000000000001774c	movi.2d	v1, #0000000000000000
0000000000017750	cmp	w0, #0x3
0000000000017754	b.ne	0x177c4
0000000000017758	adrp	x21, 182 ; 0xcd000
000000000001775c	ldr	x21, [x21, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000017760	add	x0, x20, #0x520
0000000000017764	movi.2d	v0, #0000000000000000
0000000000017768	mov	x1, x21
000000000001776c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000017770	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000017774	str	q0, [sp, #0x10]
0000000000017778	mov.16b	v8, v1
000000000001777c	add	x0, x20, #0x5b8
0000000000017780	movi.2d	v0, #0000000000000000
0000000000017784	mov	x1, x21
0000000000017788	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001778c	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000017790	fmul	d1, d8, d1
0000000000017794	fmul	d0, d8, d0
0000000000017798	mov.d	v1[1], v0[0]
000000000001779c	ldr	q2, [sp, #0x10]
00000000000177a0	mov.d	v0[1], v2[0]
00000000000177a4	b	0x177c4
00000000000177a8	adrp	x8, 152 ; 0xaf000
00000000000177ac	ldr	q1, [x8, #0x570]
00000000000177b0	adrp	x8, 152 ; 0xaf000
00000000000177b4	ldr	q0, [x8, #0x560]
00000000000177b8	b	0x177c4
00000000000177bc	adrp	x8, 152 ; 0xaf000
00000000000177c0	ldr	q1, [x8, #0x560]
00000000000177c4	stp	q1, q0, [sp]
00000000000177c8	mov	x0, x20
00000000000177cc	bl	__ZN14OZSpinBehavior12calcRotSpeedEv
00000000000177d0	ldp	d1, d2, [x19, #0x70]
00000000000177d4	ldp	q3, q4, [sp]
00000000000177d8	fmul.2d	v3, v3, v0[0]
00000000000177dc	fmul.2d	v0, v4, v0[0]
00000000000177e0	mov	d4, v0[1]
00000000000177e4	fsub	d1, d1, d4
00000000000177e8	fsub	d2, d2, d3
00000000000177ec	stp	d1, d2, [x19, #0x70]
00000000000177f0	ldp	q1, q2, [x19, #0x50]
00000000000177f4	fsub.2d	v2, v2, v3
00000000000177f8	fsub.2d	v0, v1, v0
00000000000177fc	stp	q0, q2, [x19, #0x50]
0000000000017800	ldp	x29, x30, [sp, #0x170]
0000000000017804	ldp	x20, x19, [sp, #0x160]
0000000000017808	ldp	x22, x21, [sp, #0x150]
000000000001780c	ldp	d9, d8, [sp, #0x140]
0000000000017810	add	sp, sp, #0x180
0000000000017814	ret
```

## Throw

*Motion (simulation) behavior · 21 files · 54 instances*

Gives the object an initial velocity — it drifts in a straight line at constant speed (no forces).

| Parameter | What it controls |
|---|---|
| Throw Velocity | Initial velocity vector. |
| Affect Subobjects | Also throw child objects. |
| Throw Distance | Alternative distance-based throw. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZThrowBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZThrowBehavior`

#### `OZThrowBehavior::accumInitialValues(OZSimulationState*, OZTransformNode*)`
```asm
0000000000012a74	sub	sp, sp, #0x40
0000000000012a78	stp	x20, x19, [sp, #0x20]
0000000000012a7c	stp	x29, x30, [sp, #0x30]
0000000000012a80	add	x29, sp, #0x30
0000000000012a84	mov	x19, x1
0000000000012a88	stp	xzr, xzr, [sp]
0000000000012a8c	str	xzr, [sp, #0x10]
0000000000012a90	mov	x1, sp
0000000000012a94	bl	__ZN15OZThrowBehavior17calcThrowVelocityEP9PCVector3IdE
0000000000012a98	ldr	q0, [sp]
0000000000012a9c	ldur	q1, [x19, #0x38]
0000000000012aa0	fadd.2d	v0, v0, v1
0000000000012aa4	stur	q0, [x19, #0x38]
0000000000012aa8	ldr	d0, [sp, #0x10]
0000000000012aac	ldr	d1, [x19, #0x48]
0000000000012ab0	fadd	d0, d0, d1
0000000000012ab4	str	d0, [x19, #0x48]
0000000000012ab8	ldp	x29, x30, [sp, #0x30]
0000000000012abc	ldp	x20, x19, [sp, #0x20]
0000000000012ac0	add	sp, sp, #0x40
0000000000012ac4	ret
```

#### `OZThrowBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
00000000000127d8	sub	sp, sp, #0x150
00000000000127dc	stp	x22, x21, [sp, #0x120]
00000000000127e0	stp	x20, x19, [sp, #0x130]
00000000000127e4	stp	x29, x30, [sp, #0x140]
00000000000127e8	add	x29, sp, #0x140
00000000000127ec	mov	x19, x1
00000000000127f0	mov	x20, x0
00000000000127f4	sub	x21, x29, #0x90
00000000000127f8	ldr	x8, [x0]
00000000000127fc	ldr	x8, [x8, #0x150]
0000000000012800	blr	x8
0000000000012804	add	x8, sp, #0x98
0000000000012808	add	x0, x0, #0x90
000000000001280c	bl	0xa86d0 ; symbol stub for: __ZNK15OZSceneSettings16getFrameDurationEv
0000000000012810	mov	x8, #0xa9fc
0000000000012814	movk	x8, #0xd2f1, lsl #16
0000000000012818	movk	x8, #0x624d, lsl #32
000000000001281c	movk	x8, #0x3f50, lsl #48
0000000000012820	fmov	d0, x8
0000000000012824	add	x8, sp, #0x80
0000000000012828	add	x0, sp, #0x98
000000000001282c	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
0000000000012830	ldr	x8, [x20]
0000000000012834	ldr	x9, [x8, #0x268]
0000000000012838	add	x8, sp, #0x50
000000000001283c	mov	x0, x20
0000000000012840	blr	x9
0000000000012844	ldr	q0, [sp, #0x50]
0000000000012848	str	q0, [sp, #0x20]
000000000001284c	ldr	x8, [sp, #0x60]
0000000000012850	str	x8, [sp, #0x30]
0000000000012854	ldr	q0, [x19, #0xb0]
0000000000012858	str	q0, [x21, #0x50]
000000000001285c	ldr	x8, [x19, #0xc0]
0000000000012860	stur	x8, [x29, #-0x30]
0000000000012864	add	x0, sp, #0x20
0000000000012868	sub	x1, x29, #0x40
000000000001286c	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000012870	cmp	w0, #0x1
0000000000012874	b.lt	0x1288c
0000000000012878	ldp	x29, x30, [sp, #0x140]
000000000001287c	ldp	x20, x19, [sp, #0x130]
0000000000012880	ldp	x22, x21, [sp, #0x120]
0000000000012884	add	sp, sp, #0x150
0000000000012888	ret
000000000001288c	ldr	q0, [sp, #0x50]
0000000000012890	str	q0, [sp, #0x20]
0000000000012894	ldr	x8, [sp, #0x60]
0000000000012898	str	x8, [sp, #0x30]
000000000001289c	ldur	q0, [sp, #0x68]
00000000000128a0	str	q0, [x21, #0x50]
00000000000128a4	ldr	x8, [sp, #0x78]
00000000000128a8	stur	x8, [x29, #-0x30]
00000000000128ac	sub	x8, x29, #0x60
00000000000128b0	add	x0, sp, #0x20
00000000000128b4	sub	x1, x29, #0x40
00000000000128b8	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
00000000000128bc	ldr	q0, [x21, #0x30]
00000000000128c0	str	q0, [sp, #0x20]
00000000000128c4	ldur	x8, [x29, #-0x50]
00000000000128c8	str	x8, [sp, #0x30]
00000000000128cc	ldur	q0, [sp, #0x98]
00000000000128d0	str	q0, [x21, #0x50]
00000000000128d4	ldr	x8, [sp, #0xa8]
00000000000128d8	stur	x8, [x29, #-0x30]
00000000000128dc	sub	x8, x29, #0x78
00000000000128e0	add	x0, sp, #0x20
00000000000128e4	sub	x1, x29, #0x40
00000000000128e8	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000128ec	ldur	q0, [x19, #0xb0]
00000000000128f0	str	q0, [sp, #0x20]
00000000000128f4	ldur	x8, [x19, #0xc0]
00000000000128f8	str	x8, [sp, #0x30]
00000000000128fc	ldur	q0, [x29, #-0x78]
0000000000012900	str	q0, [x21, #0x50]
0000000000012904	ldur	x8, [x29, #-0x68]
0000000000012908	stur	x8, [x29, #-0x30]
000000000001290c	add	x0, sp, #0x20
0000000000012910	sub	x1, x29, #0x40
0000000000012914	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000012918	cmp	w0, #0x0
000000000001291c	b.gt	0x12878
0000000000012920	ldr	x8, [x20]
0000000000012924	ldr	x9, [x8, #0x268]
0000000000012928	add	x8, sp, #0x20
000000000001292c	mov	x0, x20
0000000000012930	blr	x9
0000000000012934	ldur	q0, [x19, #0xb0]
0000000000012938	str	q0, [x21, #0x50]
000000000001293c	ldur	x8, [x19, #0xc0]
0000000000012940	stur	x8, [x29, #-0x30]
0000000000012944	ldr	q0, [sp, #0x80]
0000000000012948	str	q0, [x21, #0x30]
000000000001294c	ldr	x8, [sp, #0x90]
0000000000012950	stur	x8, [x29, #-0x50]
0000000000012954	add	x8, sp, #0x8
0000000000012958	sub	x0, x29, #0x40
000000000001295c	sub	x1, x29, #0x60
0000000000012960	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000012964	ldr	q0, [sp, #0x20]
0000000000012968	str	q0, [x21, #0x50]
000000000001296c	ldr	x8, [sp, #0x30]
0000000000012970	stur	x8, [x29, #-0x30]
0000000000012974	ldur	q0, [sp, #0x8]
0000000000012978	str	q0, [x21, #0x30]
000000000001297c	ldr	x8, [sp, #0x18]
0000000000012980	stur	x8, [x29, #-0x50]
0000000000012984	sub	x0, x29, #0x40
0000000000012988	sub	x1, x29, #0x60
000000000001298c	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000012990	cmp	w0, #0x1
0000000000012994	b.ge	0x12a2c
0000000000012998	ldr	q0, [sp, #0x20]
000000000001299c	str	q0, [x21, #0x50]
00000000000129a0	ldr	x8, [sp, #0x30]
00000000000129a4	stur	x8, [x29, #-0x30]
00000000000129a8	ldur	q0, [sp, #0x38]
00000000000129ac	str	q0, [x21, #0x30]
00000000000129b0	ldr	x8, [sp, #0x48]
00000000000129b4	stur	x8, [x29, #-0x50]
00000000000129b8	sub	x8, x29, #0x78
00000000000129bc	sub	x0, x29, #0x40
00000000000129c0	sub	x1, x29, #0x60
00000000000129c4	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
00000000000129c8	ldur	q0, [x29, #-0x78]
00000000000129cc	str	q0, [x21, #0x50]
00000000000129d0	ldur	x8, [x29, #-0x68]
00000000000129d4	stur	x8, [x29, #-0x30]
00000000000129d8	ldur	q0, [sp, #0x98]
00000000000129dc	str	q0, [x21, #0x30]
00000000000129e0	ldr	x8, [sp, #0xa8]
00000000000129e4	stur	x8, [x29, #-0x50]
00000000000129e8	sub	x8, x29, #0x90
00000000000129ec	sub	x0, x29, #0x40
00000000000129f0	sub	x1, x29, #0x60
00000000000129f4	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000129f8	ldur	q0, [sp, #0x8]
00000000000129fc	str	q0, [x21, #0x50]
0000000000012a00	ldr	x8, [sp, #0x18]
0000000000012a04	stur	x8, [x29, #-0x30]
0000000000012a08	ldr	q0, [x21]
0000000000012a0c	str	q0, [x21, #0x30]
0000000000012a10	ldur	x8, [x29, #-0x80]
0000000000012a14	stur	x8, [x29, #-0x50]
0000000000012a18	sub	x0, x29, #0x40
0000000000012a1c	sub	x1, x29, #0x60
0000000000012a20	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000012a24	cmp	w0, #0x1
0000000000012a28	b.lt	0x12878
0000000000012a2c	stp	xzr, xzr, [sp, #0x50]
0000000000012a30	str	xzr, [sp, #0x60]
0000000000012a34	add	x1, sp, #0x50
0000000000012a38	mov	x0, x20
0000000000012a3c	bl	__ZN15OZThrowBehavior17calcThrowVelocityEP9PCVector3IdE
0000000000012a40	ldr	q0, [sp, #0x50]
0000000000012a44	ldur	q1, [x19, #0x38]
0000000000012a48	fsub.2d	v0, v1, v0
0000000000012a4c	stur	q0, [x19, #0x38]
0000000000012a50	ldr	d0, [sp, #0x60]
0000000000012a54	ldr	d1, [x19, #0x48]
0000000000012a58	fsub	d0, d1, d0
0000000000012a5c	str	d0, [x19, #0x48]
0000000000012a60	ldp	x29, x30, [sp, #0x140]
0000000000012a64	ldp	x20, x19, [sp, #0x130]
0000000000012a68	ldp	x22, x21, [sp, #0x120]
0000000000012a6c	add	sp, sp, #0x150
0000000000012a70	ret
```

## Grow/Shrink

*Motion behavior · 20 files · 51 instances*

Animates the object's scale up or down over time.

| Parameter | What it controls |
|---|---|
| Scale To | Target scale. |
| Curvature | Ease shape. |
| End Offset | Trim end frames. |

## Spring

*Motion (simulation) behavior · 18 files · 90 instances*

Pulls the object toward a target with spring physics — it springs to and oscillates around the attractor.

| Parameter | What it controls |
|---|---|
| Attract To | Target the spring pulls toward. |
| Spring Tension | Stiffness of the spring. |
| Relaxed Length | Rest length before force applies. |
| Affect Subobjects | Also affect child objects. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZSpringBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZSpringBehavior`

#### `OZSpringBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
000000000001a788	sub	sp, sp, #0xe0
000000000001a78c	stp	d11, d10, [sp, #0x90]
000000000001a790	stp	d9, d8, [sp, #0xa0]
000000000001a794	stp	x22, x21, [sp, #0xb0]
000000000001a798	stp	x20, x19, [sp, #0xc0]
000000000001a79c	stp	x29, x30, [sp, #0xd0]
000000000001a7a0	add	x29, sp, #0xd0
000000000001a7a4	mov	x21, x2
000000000001a7a8	mov	x19, x1
000000000001a7ac	mov	x20, x0
000000000001a7b0	add	x0, x0, #0x1f0
000000000001a7b4	bl	0xa7e0c ; symbol stub for: __ZN22OZChanTransformNodeRef16getTransformNodeEv
000000000001a7b8	cbz	x0, 0x1a8e4
000000000001a7bc	mov	x2, x0
000000000001a7c0	stp	xzr, xzr, [x29, #-0x60]
000000000001a7c4	stur	xzr, [x29, #-0x50]
000000000001a7c8	add	x1, x19, #0xb0
000000000001a7cc	sub	x4, x29, #0x60
000000000001a7d0	mov	x0, x19
000000000001a7d4	mov	x3, x21
000000000001a7d8	bl	0xa7b24 ; symbol stub for: __ZN17OZSimulationState15getNodePositionERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE
000000000001a7dc	ldr	q0, [x19]
000000000001a7e0	ldur	q1, [x29, #-0x60]
000000000001a7e4	fsub.2d	v2, v0, v1
000000000001a7e8	ldr	d0, [x19, #0x10]
000000000001a7ec	ldur	d1, [x29, #-0x50]
000000000001a7f0	fsub	d8, d0, d1
000000000001a7f4	str	q2, [sp, #0x20]
000000000001a7f8	fmul.2d	v0, v2, v2
000000000001a7fc	faddp.2d	d0, v0
000000000001a800	fmul	d1, d8, d8
000000000001a804	fadd	d0, d0, d1
000000000001a808	fsqrt	d9, d0
000000000001a80c	add	x0, x20, #0x328
000000000001a810	add	x1, x19, #0xb0
000000000001a814	movi.2d	v0, #0000000000000000
000000000001a818	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001a81c	fsub	d10, d9, d0
000000000001a820	ldr	q0, [x19, #0xb0]
000000000001a824	str	q0, [sp, #0x50]
000000000001a828	ldr	x8, [x19, #0xc0]
000000000001a82c	str	x8, [sp, #0x60]
000000000001a830	fcmp	d10, #0.0
000000000001a834	b.pl	0x1a84c
000000000001a838	add	x0, x20, #0x3c0
000000000001a83c	add	x1, sp, #0x50
000000000001a840	movi.2d	v0, #0000000000000000
000000000001a844	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000001a848	cbz	w0, 0x1a8e4
000000000001a84c	add	x0, x20, #0x290
000000000001a850	add	x1, sp, #0x50
000000000001a854	movi.2d	v0, #0000000000000000
000000000001a858	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001a85c	fnmul	d2, d0, d10
000000000001a860	fabs	d0, d9
000000000001a864	mov	x8, #0xa0000000
000000000001a868	movk	x8, #0xd7f2, lsl #32
000000000001a86c	movk	x8, #0x3e7a, lsl #48
000000000001a870	fmov	d1, x8
000000000001a874	fcmp	d0, d1
000000000001a878	fmov	d0, #1.00000000
000000000001a87c	fcsel	d0, d0, d9, mi
000000000001a880	stp	q0, q2, [sp]
000000000001a884	fdiv	d0, d8, d0
000000000001a888	fmul	d8, d0, d2
000000000001a88c	stp	xzr, xzr, [sp, #0x30]
000000000001a890	str	xzr, [sp, #0x40]
000000000001a894	add	x0, x20, #0x458
000000000001a898	add	x1, x19, #0xb0
000000000001a89c	add	x2, sp, #0x30
000000000001a8a0	movi.2d	v0, #0000000000000000
000000000001a8a4	bl	0xa77a0 ; symbol stub for: __ZN15OZChannelBool3D8getValueERK6CMTimeP9PCVector3IdEd
000000000001a8a8	ldr	d0, [sp, #0x40]
000000000001a8ac	fmul	d0, d8, d0
000000000001a8b0	ldr	q1, [sp]
000000000001a8b4	dup.2d	v1, v1[0]
000000000001a8b8	ldp	q2, q3, [sp, #0x10]
000000000001a8bc	fdiv.2d	v1, v3, v1
000000000001a8c0	fmul.2d	v1, v1, v2[0]
000000000001a8c4	ldr	q2, [sp, #0x30]
000000000001a8c8	fmul.2d	v1, v1, v2
000000000001a8cc	ldr	q2, [x19, #0x80]
000000000001a8d0	fadd.2d	v1, v1, v2
000000000001a8d4	str	q1, [x19, #0x80]
000000000001a8d8	ldr	d1, [x19, #0x90]
000000000001a8dc	fadd	d0, d0, d1
000000000001a8e0	str	d0, [x19, #0x90]
000000000001a8e4	ldp	x29, x30, [sp, #0xd0]
000000000001a8e8	ldp	x20, x19, [sp, #0xc0]
000000000001a8ec	ldp	x22, x21, [sp, #0xb0]
000000000001a8f0	ldp	d9, d8, [sp, #0xa0]
000000000001a8f4	ldp	d11, d10, [sp, #0x90]
000000000001a8f8	add	sp, sp, #0xe0
000000000001a8fc	ret
```

## Type On

*Parameter behavior · 14 files · 16 instances*

Reveals a Text object one character at a time (typewriter effect).

## Repel

*Motion (simulation) behavior · 9 files · 20 instances*

Pushes the object away from other object(s) within an influence radius.

| Parameter | What it controls |
|---|---|
| Strength | Repulsion force. |
| Influence | Radius of effect. |
| Object | Object(s) repelled from. |
| Falloff Rate | How force decays with distance. |
| Affect | Which objects are affected. |

Other observed parameters (not individually described): `Affect Subobjects`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZAttractedToBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZAttractedToBehavior`

#### `OZAttractedToBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
000000000000eff8	sub	sp, sp, #0xc0
000000000000effc	stp	d9, d8, [sp, #0x80]
000000000000f000	stp	x22, x21, [sp, #0x90]
000000000000f004	stp	x20, x19, [sp, #0xa0]
000000000000f008	stp	x29, x30, [sp, #0xb0]
000000000000f00c	add	x29, sp, #0xb0
000000000000f010	mov	x21, x2
000000000000f014	mov	x19, x1
000000000000f018	mov	x20, x0
000000000000f01c	ldr	q0, [x1, #0xb0]
000000000000f020	stur	q0, [x29, #-0x50]
000000000000f024	ldr	x8, [x1, #0xc0]
000000000000f028	stur	x8, [x29, #-0x40]
000000000000f02c	add	x0, x0, #0x1f0
000000000000f030	bl	0xa7e0c ; symbol stub for: __ZN22OZChanTransformNodeRef16getTransformNodeEv
000000000000f034	movi.2d	v0, #0000000000000000
000000000000f038	movi.2d	v8, #0000000000000000
000000000000f03c	cbz	x0, 0xf098
000000000000f040	mov	x2, x0
000000000000f044	cmp	x21, x0
000000000000f048	b.eq	0xf098
000000000000f04c	stp	xzr, xzr, [sp, #0x48]
000000000000f050	str	xzr, [sp, #0x58]
000000000000f054	add	x1, x19, #0xb0
000000000000f058	add	x4, sp, #0x48
000000000000f05c	mov	x0, x19
000000000000f060	mov	x3, x21
000000000000f064	bl	0xa7b24 ; symbol stub for: __ZN17OZSimulationState15getNodePositionERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE
000000000000f068	ldur	q0, [x29, #-0x50]
000000000000f06c	str	q0, [sp, #0x30]
000000000000f070	ldur	x8, [x29, #-0x40]
000000000000f074	str	x8, [sp, #0x40]
000000000000f078	add	x1, sp, #0x30
000000000000f07c	add	x2, sp, #0x48
000000000000f080	add	x4, sp, #0x10
000000000000f084	mov	x0, x20
000000000000f088	mov	x3, x19
000000000000f08c	bl	__ZN21OZAttractedToBehavior14calcAttractionE6CMTimeRK9PCVector3IdES4_PS2_
000000000000f090	ldr	q0, [sp, #0x10]
000000000000f094	ldr	d8, [sp, #0x20]
000000000000f098	str	q0, [sp]
000000000000f09c	ldur	q0, [x19, #0xb0]
000000000000f0a0	stur	q0, [x29, #-0x50]
000000000000f0a4	ldur	x8, [x19, #0xc0]
000000000000f0a8	stur	x8, [x29, #-0x40]
000000000000f0ac	add	x0, x20, #0x558
000000000000f0b0	sub	x1, x29, #0x50
000000000000f0b4	movi.2d	v0, #0000000000000000
000000000000f0b8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000000f0bc	ldr	d1, [x19, #0x48]
000000000000f0c0	fmul	d1, d0, d1
000000000000f0c4	fsub	d1, d8, d1
000000000000f0c8	ldur	q2, [x19, #0x38]
000000000000f0cc	fmul.2d	v0, v2, v0[0]
000000000000f0d0	ldr	q2, [sp]
000000000000f0d4	fsub.2d	v0, v2, v0
000000000000f0d8	ldr	q2, [x19, #0x80]
000000000000f0dc	fadd.2d	v0, v0, v2
000000000000f0e0	str	q0, [x19, #0x80]
000000000000f0e4	ldr	d0, [x19, #0x90]
000000000000f0e8	fadd	d0, d1, d0
000000000000f0ec	str	d0, [x19, #0x90]
000000000000f0f0	ldp	x29, x30, [sp, #0xb0]
000000000000f0f4	ldp	x20, x19, [sp, #0xa0]
000000000000f0f8	ldp	x22, x21, [sp, #0x90]
000000000000f0fc	ldp	d9, d8, [sp, #0x80]
000000000000f100	add	sp, sp, #0xc0
000000000000f104	ret
```

## Point

*Parameter behavior · 7 files · 38 instances*

Aims one object at another (points its orientation toward a target), with per-axis remap.

| Parameter | What it controls |
|---|---|
| Object | Target to point at. |
| Invert Axis | Flip the pointing axis. |
| Speed | How quickly it re-aims. |
| Axis | Which axis points at the target. |

Other observed parameters (not individually described): `Transition`, `Source Object`, `Mix Time Range`, `Custom Mix`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`, `Z max`, `Animate min`, `Animate max`, `Start Value`, `End Value`, `Curvature`, `Clamp At`, `Max`, `Start Offset`.

## Edge Collision

*Motion (simulation) behavior · 5 files · 11 instances*

Bounces a moving object off the frame (or a defined boundary) edges.

| Parameter | What it controls |
|---|---|
| Affect Subobjects | Also affect child objects. |

Other observed parameters (not individually described): `Bounce Strength`, `Active Edges`, `Height`, `Depth`.

## Rotational Drag

*Motion (simulation) behavior · 3 files · 14 instances*

Damps a spinning object's angular velocity over time.

| Parameter | What it controls |
|---|---|
| Amount | Angular damping strength. |
| Affect Subobjects | Also affect child objects. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZRotationalDragBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZRotationalDragBehavior`

#### `OZRotationalDragBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
000000000001d154	stp	x20, x19, [sp, #-0x20]!
000000000001d158	stp	x29, x30, [sp, #0x10]
000000000001d15c	add	x29, sp, #0x10
000000000001d160	mov	x19, x1
000000000001d164	add	x0, x0, #0x1f0
000000000001d168	add	x1, x1, #0xb0
000000000001d16c	movi.2d	v0, #0000000000000000
000000000001d170	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001d174	ldr	d1, [x19, #0x60]
000000000001d178	fmul	d1, d0, d1
000000000001d17c	ldr	q2, [x19, #0x50]
000000000001d180	fmul.2d	v0, v2, v0[0]
000000000001d184	ldur	q2, [x19, #0x98]
000000000001d188	fsub.2d	v0, v2, v0
000000000001d18c	stur	q0, [x19, #0x98]
000000000001d190	ldr	d0, [x19, #0xa8]
000000000001d194	fsub	d0, d0, d1
000000000001d198	str	d0, [x19, #0xa8]
000000000001d19c	ldp	x29, x30, [sp, #0x10]
000000000001d1a0	ldp	x20, x19, [sp], #0x20
000000000001d1a4	ret
```

## Snap Alignment

*Motion behavior · 3 files · 13 instances*

Snaps the object's alignment to discrete steps (grid/angle snapping).

Other observed parameters (not individually described): `Axis`, `Invert Axis`, `End Offset`.

## Stop

*Parameter behavior · 2 files · 9 instances*

Freezes the parameter at its value when the behavior starts (halts other animation from that point).

## Orbit Around

*Motion (simulation) behavior · 2 files · 3 instances*

Makes the object orbit around a target object.

| Parameter | What it controls |
|---|---|
| Object | The body orbited around. |

Other observed parameters (not individually described): `Strength`, `Influence`, `Pole Axis`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZVortexAroundBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZVortexAroundBehavior`

#### `OZVortexAroundBehavior::accumInitialValues(OZSimulationState*, OZTransformNode*)`
```asm
00000000000146bc	sub	sp, sp, #0x120
00000000000146c0	stp	d11, d10, [sp, #0xc0]
00000000000146c4	stp	d9, d8, [sp, #0xd0]
00000000000146c8	stp	x28, x27, [sp, #0xe0]
00000000000146cc	stp	x22, x21, [sp, #0xf0]
00000000000146d0	stp	x20, x19, [sp, #0x100]
00000000000146d4	stp	x29, x30, [sp, #0x110]
00000000000146d8	add	x29, sp, #0x110
00000000000146dc	mov	x21, x2
00000000000146e0	mov	x19, x1
00000000000146e4	mov	x20, x0
00000000000146e8	ldr	q0, [x1, #0xb0]
00000000000146ec	stur	q0, [x29, #-0x70]
00000000000146f0	ldr	x8, [x1, #0xc0]
00000000000146f4	stur	x8, [x29, #-0x60]
00000000000146f8	add	x0, x0, #0x290
00000000000146fc	sub	x1, x29, #0x70
0000000000014700	movi.2d	v0, #0000000000000000
0000000000014704	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000014708	mov.16b	v8, v0
000000000001470c	add	x0, x20, #0x4c0
0000000000014710	sub	x1, x29, #0x70
0000000000014714	movi.2d	v0, #0000000000000000
0000000000014718	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001471c	mov.16b	v9, v0
0000000000014720	stp	xzr, xzr, [sp, #0x80]
0000000000014724	str	xzr, [sp, #0x90]
0000000000014728	str	wzr, [sp, #0x7c]
000000000001472c	add	x1, sp, #0x80
0000000000014730	add	x2, sp, #0x7c
0000000000014734	mov	x0, x20
0000000000014738	bl	__ZN21OZAttractedToBehavior13getMaskVectorEP9PCVector3IdEPj
000000000001473c	ldr	w8, [sp, #0x7c]
0000000000014740	cmp	w8, #0x2
0000000000014744	b.lo	0x14930
0000000000014748	add	x0, x20, #0x1f0
000000000001474c	bl	0xa7e0c ; symbol stub for: __ZN22OZChanTransformNodeRef16getTransformNodeEv
0000000000014750	cbz	x0, 0x14930
0000000000014754	mov	x2, x0
0000000000014758	stp	xzr, xzr, [sp, #0x60]
000000000001475c	str	xzr, [sp, #0x70]
0000000000014760	add	x1, x19, #0xb0
0000000000014764	add	x4, sp, #0x60
0000000000014768	mov	x0, x19
000000000001476c	mov	x3, x21
0000000000014770	bl	0xa7b24 ; symbol stub for: __ZN17OZSimulationState15getNodePositionERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE
0000000000014774	ldr	d0, [sp, #0x70]
0000000000014778	ldr	d1, [x19, #0x10]
000000000001477c	fsub	d0, d0, d1
0000000000014780	ldr	q1, [sp, #0x60]
0000000000014784	ldr	q2, [x19]
0000000000014788	fsub.2d	v1, v1, v2
000000000001478c	ldr	q2, [sp, #0x80]
0000000000014790	fmul.2d	v1, v1, v2
0000000000014794	str	q1, [sp, #0x40]
0000000000014798	ldr	d2, [sp, #0x90]
000000000001479c	fmul	d0, d0, d2
00000000000147a0	str	d0, [sp, #0x50]
00000000000147a4	fmul.2d	v1, v1, v1
00000000000147a8	faddp.2d	d1, v1
00000000000147ac	fmul	d0, d0, d0
00000000000147b0	fadd	d11, d1, d0
00000000000147b4	fsqrt	d10, d11
00000000000147b8	adrp	x8, 155 ; 0xaf000
00000000000147bc	add	x8, x8, #0x380
00000000000147c0	ldr	d0, [x8]
00000000000147c4	fcmp	d10, d0
00000000000147c8	fccmp	d10, d9, #0x0, pl
00000000000147cc	b.gt	0x14930
00000000000147d0	add	x0, x20, #0x328
00000000000147d4	sub	x1, x29, #0x70
00000000000147d8	movi.2d	v0, #0000000000000000
00000000000147dc	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000147e0	mov	x21, x0
00000000000147e4	add	x0, x20, #0x428
00000000000147e8	sub	x1, x29, #0x70
00000000000147ec	movi.2d	v0, #0000000000000000
00000000000147f0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000147f4	cmp	w21, #0x0
00000000000147f8	fcsel	d1, d10, d11, eq
00000000000147fc	fmul	d0, d1, d0
0000000000014800	fdiv	d9, d8, d0
0000000000014804	add	x0, x20, #0x840
0000000000014808	sub	x1, x29, #0x70
000000000001480c	movi.2d	v0, #0000000000000000
0000000000014810	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000014814	mov	x21, x0
0000000000014818	ldr	w22, [sp, #0x7c]
000000000001481c	adrp	x1, 185 ; 0xcd000
0000000000014820	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000014824	add	x0, x20, #0x940
0000000000014828	movi.2d	v0, #0000000000000000
000000000001482c	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000014830	mov	x5, x0
0000000000014834	add	x8, sp, #0x20
0000000000014838	add	x0, sp, #0x40
000000000001483c	add	x1, sp, #0x80
0000000000014840	mov	x2, x22
0000000000014844	mov	x3, x21
0000000000014848	mov	w4, #0x0
000000000001484c	bl	__ZN16OZVortexBehavior18CalcThrowDirectionER9PCVector3IdES2_jjjj
0000000000014850	ldr	q0, [sp, #0x20]
0000000000014854	ldr	d8, [sp, #0x30]
0000000000014858	ldp	d1, d2, [sp, #0x40]
000000000001485c	fmul	d1, d9, d1
0000000000014860	fmul	d2, d9, d2
0000000000014864	ldr	d3, [sp, #0x50]
0000000000014868	fmul	d3, d9, d3
000000000001486c	fmul	d1, d1, d1
0000000000014870	fmul	d2, d2, d2
0000000000014874	fadd	d1, d1, d2
0000000000014878	fmul	d2, d3, d3
000000000001487c	fadd	d1, d1, d2
0000000000014880	fsqrt	d1, d1
0000000000014884	fmul	d1, d10, d1
0000000000014888	fsqrt	d4, d1
000000000001488c	fmul.2d	v1, v0, v0
0000000000014890	faddp.2d	d1, v1
0000000000014894	fmul	d2, d8, d8
0000000000014898	fadd	d1, d1, d2
000000000001489c	fsqrt	d1, d1
00000000000148a0	fabs	d2, d1
00000000000148a4	mov	x8, #0xa0000000
00000000000148a8	movk	x8, #0xd7f2, lsl #32
00000000000148ac	movk	x8, #0x3e7a, lsl #48
00000000000148b0	fmov	d3, x8
00000000000148b4	fcmp	d2, d3
00000000000148b8	b.mi	0x148c8
00000000000148bc	dup.2d	v2, v1[0]
00000000000148c0	fdiv.2d	v0, v0, v2
00000000000148c4	fdiv	d8, d8, d1
00000000000148c8	fmul.2d	v0, v0, v4[0]
00000000000148cc	str	q0, [sp, #0x10]
00000000000148d0	fmul	d9, d4, d8
00000000000148d4	adrp	x1, 185 ; 0xcd000
00000000000148d8	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
00000000000148dc	add	x0, x20, #0x9d8
00000000000148e0	movi.2d	v0, #0000000000000000
00000000000148e4	str	q4, [sp]
00000000000148e8	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000148ec	cmp	w0, #0x0
00000000000148f0	cset	w8, eq
00000000000148f4	ldp	q0, q3, [sp]
00000000000148f8	fnmul	d0, d0, d8
00000000000148fc	fcsel	d0, d0, d9, eq
0000000000014900	fneg.2d	v1, v3
0000000000014904	dup.2s	v2, w8
0000000000014908	ushll.2d	v2, v2, #0x0
000000000001490c	shl.2d	v2, v2, #0x3f
0000000000014910	cmlt.2d	v2, v2, #0
0000000000014914	bif.16b	v1, v3, v2
0000000000014918	ldur	q2, [x19, #0x38]
000000000001491c	fadd.2d	v1, v2, v1
0000000000014920	stur	q1, [x19, #0x38]
0000000000014924	ldr	d1, [x19, #0x48]
0000000000014928	fadd	d0, d0, d1
000000000001492c	str	d0, [x19, #0x48]
0000000000014930	ldp	x29, x30, [sp, #0x110]
0000000000014934	ldp	x20, x19, [sp, #0x100]
0000000000014938	ldp	x22, x21, [sp, #0xf0]
000000000001493c	ldp	x28, x27, [sp, #0xe0]
0000000000014940	ldp	d9, d8, [sp, #0xd0]
0000000000014944	ldp	d11, d10, [sp, #0xc0]
0000000000014948	add	sp, sp, #0x120
000000000001494c	ret
```

## Reverse

*Parameter behavior · 1 files · 1 instances*

Plays the driving parameter's animation backwards.

## Attractor

*Motion (simulation) behavior · 1 files · 1 instances*

Pulls the object toward an attractor object within an influence radius (inverse of Repel).

| Parameter | What it controls |
|---|---|
| Strength | Attraction force. |
| Falloff Rate | Force decay with distance. |
| Influence | Radius of effect. |

Other observed parameters (not individually described): `Affect`, `Drag`.

---
_Corpus-derived (`~/motr-collection`, 5,365 files). Usage counts empirical; parameter meanings are standard Apple Motion behavior semantics — verify against `engine/src/evaluator/` for the engine's decoded implementations of Link, Ramp, and the motion-curve system._

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZAttractorBehavior`). This `accum*` method is what the shared Ozone simulation integrator calls each sub-step to add this behavior's contribution to the object's motion state — the actual per-frame algorithm, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py OZAttractorBehavior`

#### `OZAttractorBehavior::accumForces(OZSimulationState*, OZTransformNode*)`
```asm
000000000000fec4	sub	sp, sp, #0x90
000000000000fec8	stp	x22, x21, [sp, #0x60]
000000000000fecc	stp	x20, x19, [sp, #0x70]
000000000000fed0	stp	x29, x30, [sp, #0x80]
000000000000fed4	add	x29, sp, #0x80
000000000000fed8	mov	x20, x2
000000000000fedc	mov	x19, x1
000000000000fee0	mov	x21, x0
000000000000fee4	ldr	q0, [x1, #0xb0]
000000000000fee8	str	q0, [sp, #0x20]
000000000000feec	ldr	x8, [x1, #0xc0]
000000000000fef0	str	x8, [sp, #0x30]
000000000000fef4	stp	xzr, xzr, [sp, #0x40]
000000000000fef8	str	xzr, [sp, #0x50]
000000000000fefc	bl	0xa7d88 ; symbol stub for: __ZN20OZSimulationBehavior16getTransformNodeEv
000000000000ff00	mov	x2, x0
000000000000ff04	add	x1, x19, #0xb0
000000000000ff08	add	x4, sp, #0x40
000000000000ff0c	mov	x0, x19
000000000000ff10	mov	x3, x20
000000000000ff14	bl	0xa7b24 ; symbol stub for: __ZN17OZSimulationState15getNodePositionERK6CMTimeP15OZTransformNodeS4_P9PCVector3IdE
000000000000ff18	add	x1, sp, #0x20
000000000000ff1c	add	x2, sp, #0x40
000000000000ff20	mov	x4, sp
000000000000ff24	mov	x0, x21
000000000000ff28	mov	x3, x19
000000000000ff2c	bl	__ZN19OZAttractorBehavior14calcAttractionE6CMTimeRK9PCVector3IdES4_PS2_
000000000000ff30	ldr	q0, [x19, #0xb0]
000000000000ff34	str	q0, [sp, #0x40]
000000000000ff38	ldr	x8, [x19, #0xc0]
000000000000ff3c	str	x8, [sp, #0x50]
000000000000ff40	add	x0, x21, #0x5d8
000000000000ff44	add	x1, sp, #0x40
000000000000ff48	movi.2d	v0, #0000000000000000
000000000000ff4c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000000ff50	ldr	d1, [x19, #0x48]
000000000000ff54	fmul	d1, d0, d1
000000000000ff58	ldr	d2, [sp, #0x10]
000000000000ff5c	fsub	d1, d2, d1
000000000000ff60	ldur	q2, [x19, #0x38]
000000000000ff64	fmul.2d	v0, v2, v0[0]
000000000000ff68	ldr	q2, [sp]
000000000000ff6c	fsub.2d	v0, v2, v0
000000000000ff70	ldr	q2, [x19, #0x80]
000000000000ff74	fadd.2d	v0, v0, v2
000000000000ff78	str	q0, [x19, #0x80]
000000000000ff7c	ldr	d0, [x19, #0x90]
000000000000ff80	fadd	d0, d1, d0
000000000000ff84	str	d0, [x19, #0x90]
000000000000ff88	ldp	x29, x30, [sp, #0x80]
000000000000ff8c	ldp	x20, x19, [sp, #0x70]
000000000000ff90	ldp	x22, x21, [sp, #0x60]
000000000000ff94	add	sp, sp, #0x90
000000000000ff98	ret
```

