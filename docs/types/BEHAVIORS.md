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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZLinkBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZLinkBehavior`

#### `OZLinkBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
00000000004e2fbc	sub	sp, sp, #0x70
00000000004e2fc0	stp	d9, d8, [sp, #0x30]
00000000004e2fc4	stp	x22, x21, [sp, #0x40]
00000000004e2fc8	stp	x20, x19, [sp, #0x50]
00000000004e2fcc	stp	x29, x30, [sp, #0x60]
00000000004e2fd0	add	x29, sp, #0x60
00000000004e2fd4	mov.16b	v8, v1
00000000004e2fd8	mov	x21, x2
00000000004e2fdc	mov	x20, x1
00000000004e2fe0	mov	x19, x0
00000000004e2fe4	ldr	x8, [x0]
00000000004e2fe8	ldr	x8, [x8, #0x150]
00000000004e2fec	blr	x8
00000000004e2ff0	cbz	x0, 0x4e3024
00000000004e2ff4	add	x0, x19, #0x420
00000000004e2ff8	bl	__ZNK20OZChanObjectManipRef9getObjectEv
00000000004e2ffc	cbz	x0, 0x4e3024
00000000004e3000	add	x0, x19, #0x420
00000000004e3004	bl	__ZNK20OZChanObjectManipRef9getObjectEv
00000000004e3008	ldr	x8, [x0]
00000000004e300c	ldr	x8, [x8, #0xd0]
00000000004e3010	blr	x8
00000000004e3014	mov	x1, x0
00000000004e3018	add	x0, x19, #0x4f0
00000000004e301c	bl	0x5e8910 ; symbol stub for: __ZNK12OZChannelRef10getChannelEP13OZChannelBase
00000000004e3020	cbnz	x0, 0x4e303c
00000000004e3024	adrp	x1, 641 ; 0x764000
00000000004e3028	ldr	x1, [x1, #0x508] ; literal pool symbol address: _kCMTimeZero
00000000004e302c	add	x0, x19, #0x508
00000000004e3030	movi.2d	v0, #0000000000000000
00000000004e3034	bl	0x5e942c ; symbol stub for: __ZNK9OZChannel14getValueAsUintERK6CMTimed
00000000004e3038	cbz	w0, 0x4e3168
00000000004e303c	ldr	x8, [x19, #0x170]
00000000004e3040	ldr	x0, [x8, #0x20]
00000000004e3044	ldr	x8, [x0]
00000000004e3048	ldr	x9, [x8, #0x150]
00000000004e304c	add	x8, sp, #0x18
00000000004e3050	mov	x1, x21
00000000004e3054	blr	x9
00000000004e3058	ldur	q0, [sp, #0x18]
00000000004e305c	str	q0, [sp]
00000000004e3060	ldr	x8, [sp, #0x28]
00000000004e3064	str	x8, [sp, #0x10]
00000000004e3068	ldr	x8, [x19]
00000000004e306c	ldr	x8, [x8, #0x128]
00000000004e3070	mov	x1, sp
00000000004e3074	mov	x0, x19
00000000004e3078	mov	w2, #0x0
00000000004e307c	mov	w3, #0x1
00000000004e3080	mov	w4, #0x1
00000000004e3084	blr	x8
00000000004e3088	cbz	w0, 0x4e3168
00000000004e308c	adrp	x1, 641 ; 0x764000
00000000004e3090	ldr	x1, [x1, #0x508] ; literal pool symbol address: _kCMTimeZero
00000000004e3094	add	x0, x19, #0x508
00000000004e3098	movi.2d	v0, #0000000000000000
00000000004e309c	bl	0x5e942c ; symbol stub for: __ZNK9OZChannel14getValueAsUintERK6CMTimed
00000000004e30a0	cbz	w0, 0x4e30c0
00000000004e30a4	mov	x0, x19
00000000004e30a8	mov	x1, x20
00000000004e30ac	mov	x2, x21
00000000004e30b0	mov.16b	v1, v8
00000000004e30b4	bl	__ZN14OZLinkBehavior25solveWithSourceAttributesEjRK6CMTimedd
00000000004e30b8	mov.16b	v8, v0
00000000004e30bc	b	0x4e3168
00000000004e30c0	mov	x0, x19
00000000004e30c4	mov	x1, x20
00000000004e30c8	bl	__ZN14OZLinkBehavior20expressionForChannelEj
00000000004e30cc	cbz	x0, 0x4e3168
00000000004e30d0	mov	x20, x0
00000000004e30d4	ldr	x8, [x19, #0x5e8]
00000000004e30d8	cbz	x8, 0x4e314c
00000000004e30dc	ldr	x21, [x19, #0x5d8]
00000000004e30e0	add	x19, x19, #0x5e0
00000000004e30e4	b	0x4e30f0
00000000004e30e8	mov	x21, x8
00000000004e30ec	tbz	w0, #0x0, 0x4e3168
00000000004e30f0	cmp	x21, x19
00000000004e30f4	b.eq	0x4e314c
00000000004e30f8	ldr	x0, [x21, #0x28]
00000000004e30fc	cmp	x0, x20
00000000004e3100	b.eq	0x4e3118
00000000004e3104	add	x1, sp, #0x18
00000000004e3108	bl	__ZN23OZLinkChannelExpression14isWithinLimitsERK6CMTime
00000000004e310c	ldr	x9, [x21, #0x8]
00000000004e3110	cbnz	x9, 0x4e3124
00000000004e3114	b	0x4e3134
00000000004e3118	mov	w0, #0x1
00000000004e311c	ldr	x9, [x21, #0x8]
00000000004e3120	cbz	x9, 0x4e3134
00000000004e3124	mov	x8, x9
00000000004e3128	ldr	x9, [x9]
00000000004e312c	cbnz	x9, 0x4e3124
00000000004e3130	b	0x4e30e8
00000000004e3134	ldr	x8, [x21, #0x10]
00000000004e3138	ldr	x9, [x8]
00000000004e313c	cmp	x21, x9
00000000004e3140	mov	x21, x8
00000000004e3144	b.ne	0x4e3134
00000000004e3148	b	0x4e30e8
00000000004e314c	add	x1, sp, #0x18
00000000004e3150	mov	x2, sp
00000000004e3154	mov	x0, x20
00000000004e3158	mov.16b	v0, v8
00000000004e315c	mov	x3, #0x0
00000000004e3160	bl	__ZN23OZLinkChannelExpression5solveEdRK6CMTimePdPb
00000000004e3164	ldr	d8, [sp]
00000000004e3168	mov.16b	v0, v8
00000000004e316c	ldp	x29, x30, [sp, #0x60]
00000000004e3170	ldp	x20, x19, [sp, #0x50]
00000000004e3174	ldp	x22, x21, [sp, #0x40]
00000000004e3178	ldp	d9, d8, [sp, #0x30]
00000000004e317c	add	sp, sp, #0x70
00000000004e3180	ret
```

## Rig Behavior

*Parameter behavior · 3240 files · 45242 instances*

Backs a **Rig**'s published Widget (slider/popup/checkbox): stores parameter **Snapshots** and interpolates the rigged params between them as the Widget value moves. A popup snaps between discrete snapshots; a slider blends continuously.

| Parameter | What it controls |
|---|---|
| Widget | The published control whose value selects/blends snapshots. |
| Snapshots | The stored parameter states interpolated between. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZRigBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZRigBehavior`

#### `OZRigBehavior::solveNode(unsigned int, CMTime const&, double, double)`
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

## Clamp

*Parameter behavior · 1640 files · 6594 instances*

Constrains the parameter it is attached to within a range every frame.

| Parameter | What it controls |
|---|---|
| Max | Upper bound. |
| Min | Lower bound. |
| Clamp At | Clamp the low end, high end, or both. |

Other observed parameters (not individually described): `Source Object`, `Mix Time Range`, `Clamp Source Value Within Range`, `Max min`, `Max max`, `Min min`, `Min max`, `Apply Mode`, `Scale`, `Y min`, `Y max`, `X min`, `X max`, `Y offset`, `X offset`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZClampBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZClampBehavior`

#### `OZClampBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
000000000009420c	sub	sp, sp, #0x60
0000000000094210	stp	d9, d8, [sp, #0x30]
0000000000094214	stp	x20, x19, [sp, #0x40]
0000000000094218	stp	x29, x30, [sp, #0x50]
000000000009421c	add	x29, sp, #0x50
0000000000094220	mov.16b	v8, v1
0000000000094224	mov	x1, x2
0000000000094228	mov	x19, x0
000000000009422c	ldr	x8, [x0, #0x170]
0000000000094230	ldr	x0, [x8, #0x20]
0000000000094234	ldr	x8, [x0]
0000000000094238	ldr	x9, [x8, #0x150]
000000000009423c	add	x8, sp, #0x18
0000000000094240	blr	x9
0000000000094244	ldur	q0, [sp, #0x18]
0000000000094248	str	q0, [sp]
000000000009424c	ldr	x8, [sp, #0x28]
0000000000094250	str	x8, [sp, #0x10]
0000000000094254	ldr	x8, [x19]
0000000000094258	ldr	x8, [x8, #0x128]
000000000009425c	mov	x1, sp
0000000000094260	mov	x0, x19
0000000000094264	mov	w2, #0x0
0000000000094268	mov	w3, #0x1
000000000009426c	mov	w4, #0x1
0000000000094270	blr	x8
0000000000094274	cbz	w0, 0x942cc
0000000000094278	add	x0, x19, #0x358
000000000009427c	add	x1, sp, #0x18
0000000000094280	movi.2d	v0, #0000000000000000
0000000000094284	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000094288	mov	x20, x0
000000000009428c	add	x0, x19, #0x458
0000000000094290	add	x1, sp, #0x18
0000000000094294	movi.2d	v0, #0000000000000000
0000000000094298	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000009429c	mov.16b	v9, v0
00000000000942a0	add	x0, x19, #0x4f0
00000000000942a4	add	x1, sp, #0x18
00000000000942a8	movi.2d	v0, #0000000000000000
00000000000942ac	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000942b0	tst	w20, #0xfffffffd
00000000000942b4	fccmp	d8, d9, #0x0, eq
00000000000942b8	fcsel	d1, d9, d8, mi
00000000000942bc	sub	w8, w20, #0x1
00000000000942c0	cmp	w8, #0x2
00000000000942c4	fccmp	d1, d0, #0x4, lo
00000000000942c8	fcsel	d8, d0, d1, gt
00000000000942cc	mov.16b	v0, v8
00000000000942d0	ldp	x29, x30, [sp, #0x50]
00000000000942d4	ldp	x20, x19, [sp, #0x40]
00000000000942d8	ldp	d9, d8, [sp, #0x30]
00000000000942dc	add	sp, sp, #0x60
00000000000942e0	ret
```

## Custom

*Parameter behavior · 824 files · 2032 instances*

A generic container holding a hand-authored curve/expression for the parameter — bespoke animation that is not one of the named behaviors.

Other observed parameters (not individually described): `Opacity`, `Position`, `Scale`, `Position.Y`, `Position.X`, `Rotation`, `Scale.X`, `Rotation.X`, `Rotation.Z`, `Rotation.Y`, `Mix`, `Position.Z`, `Source Object`, `Mix Time Range`, `Clamp Source Value Within Range`, `X min`, `X max`, `Y min`, `Y max`, `Z min`.

### Decompiled code (ground truth)

This behavior (`OZReflexiveBehavior`) has **no behavior-specific per-frame method** in the binary: it evaluates through the shared `OZSingleChannelBehavior::solveNode` base together with a per-instance user/table curve — for Custom/Sequence/Randomize the actual shape comes from the saved keyframes / sequence table in the `.motn`, not from compiled code. The verbatim shared base solver Apple ships is shown below; regenerate with `venv/bin/python3 tools/re/disasm_behavior.py OZSingleChannelBehavior`.

#### `OZSingleChannelBehavior::solveNode(unsigned int, CMTime const&, double, double)`  (shared base)
```asm
0000000000358c74	mov.16b	v0, v1
0000000000358c78	ret
```

## Sequence Text

*Parameter behavior · 400 files · 1563 instances*

Animates a repeating transform (position/scale/opacity/color/…) across the units of a Text object, offset in time per unit — the basis of type-on and cascading text animations.

| Parameter | What it controls |
|---|---|
| Sequence Control | How the animation spreads across characters/words/lines. |

Other observed parameters (not individually described): `3D`, `Old Steel`, `Dark Gold`, `Blue Plastic`, `Cardboard`.

### Decompiled code (ground truth)

This behavior (`OZSequenceTextBehavior`) has **no behavior-specific per-frame method** in the binary: it evaluates through the shared `OZSingleChannelBehavior::solveNode` base together with a per-instance user/table curve — for Custom/Sequence/Randomize the actual shape comes from the saved keyframes / sequence table in the `.motn`, not from compiled code. The verbatim shared base solver Apple ships is shown below; regenerate with `venv/bin/python3 tools/re/disasm_behavior.py OZSingleChannelBehavior`.

#### `OZSingleChannelBehavior::solveNode(unsigned int, CMTime const&, double, double)`  (shared base)
```asm
0000000000358c74	mov.16b	v0, v1
0000000000358c78	ret
```

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZRampBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZRampBehavior`

#### `OZRampBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
000000000001e948	sub	sp, sp, #0x170
000000000001e94c	stp	d13, d12, [sp, #0x100]
000000000001e950	stp	d11, d10, [sp, #0x110]
000000000001e954	stp	d9, d8, [sp, #0x120]
000000000001e958	stp	x28, x27, [sp, #0x130]
000000000001e95c	stp	x22, x21, [sp, #0x140]
000000000001e960	stp	x20, x19, [sp, #0x150]
000000000001e964	stp	x29, x30, [sp, #0x160]
000000000001e968	add	x29, sp, #0x160
000000000001e96c	mov.16b	v8, v1
000000000001e970	mov	x1, x2
000000000001e974	mov	x19, x0
000000000001e978	ldr	x8, [x0, #0x170]
000000000001e97c	ldr	x0, [x8, #0x20]
000000000001e980	ldr	x8, [x0]
000000000001e984	ldr	x9, [x8, #0x150]
000000000001e988	add	x8, sp, #0x90
000000000001e98c	blr	x9
000000000001e990	ldr	q0, [sp, #0x90]
000000000001e994	str	q0, [sp, #0x60]
000000000001e998	ldr	x8, [sp, #0xa0]
000000000001e99c	str	x8, [sp, #0x70]
000000000001e9a0	ldr	x8, [x19]
000000000001e9a4	ldr	x8, [x8, #0x128]
000000000001e9a8	add	x1, sp, #0x60
000000000001e9ac	mov	x0, x19
000000000001e9b0	mov	w2, #0x0
000000000001e9b4	mov	w3, #0x1
000000000001e9b8	mov	w4, #0x1
000000000001e9bc	blr	x8
000000000001e9c0	cbz	w0, 0x1ebb0
000000000001e9c4	ldr	x8, [x19]
000000000001e9c8	ldr	x8, [x8, #0x150]
000000000001e9cc	mov	x0, x19
000000000001e9d0	blr	x8
000000000001e9d4	cbz	x0, 0x1ebb0
000000000001e9d8	add	x22, sp, #0xa8
000000000001e9dc	ldr	x8, [x19]
000000000001e9e0	ldr	x9, [x8, #0x268]
000000000001e9e4	add	x8, sp, #0x60
000000000001e9e8	mov	x0, x19
000000000001e9ec	blr	x9
000000000001e9f0	ldr	q0, [sp, #0x60]
000000000001e9f4	stur	q0, [x29, #-0x80]
000000000001e9f8	ldr	x8, [sp, #0x70]
000000000001e9fc	stur	x8, [x29, #-0x70]
000000000001ea00	ldr	x8, [x19]
000000000001ea04	ldr	x8, [x8, #0x150]
000000000001ea08	mov	x0, x19
000000000001ea0c	blr	x8
000000000001ea10	mov	x21, x0
000000000001ea14	adrp	x20, 175 ; 0xcd000
000000000001ea18	ldr	x20, [x20, #0x520] ; literal pool symbol address: _kCMTimeZero
000000000001ea1c	add	x0, x19, #0x520
000000000001ea20	movi.2d	v0, #0000000000000000
000000000001ea24	mov	x1, x20
000000000001ea28	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001ea2c	add	x8, sp, #0xa8
000000000001ea30	mov	x0, x21
000000000001ea34	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
000000000001ea38	ldr	q0, [x22]
000000000001ea3c	stur	q0, [x29, #-0xa0]
000000000001ea40	ldr	x8, [sp, #0xb8]
000000000001ea44	stur	x8, [x29, #-0x90]
000000000001ea48	add	x8, sp, #0x48
000000000001ea4c	sub	x0, x29, #0x80
000000000001ea50	sub	x1, x29, #0xa0
000000000001ea54	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
000000000001ea58	add	x8, sp, #0x18
000000000001ea5c	mov	x0, x19
000000000001ea60	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
000000000001ea64	ldr	q0, [sp, #0x60]
000000000001ea68	stur	q0, [x29, #-0x80]
000000000001ea6c	ldr	x8, [sp, #0x70]
000000000001ea70	stur	x8, [x29, #-0x70]
000000000001ea74	ldur	q0, [sp, #0x78]
000000000001ea78	stur	q0, [x29, #-0xa0]
000000000001ea7c	ldr	x8, [sp, #0x88]
000000000001ea80	stur	x8, [x29, #-0x90]
000000000001ea84	add	x8, sp, #0xa8
000000000001ea88	sub	x0, x29, #0x80
000000000001ea8c	sub	x1, x29, #0xa0
000000000001ea90	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
000000000001ea94	ldr	q0, [x22]
000000000001ea98	stur	q0, [x29, #-0x80]
000000000001ea9c	ldr	x8, [sp, #0xb8]
000000000001eaa0	stur	x8, [x29, #-0x70]
000000000001eaa4	ldur	q0, [sp, #0x18]
000000000001eaa8	stur	q0, [x29, #-0xa0]
000000000001eaac	ldr	x8, [sp, #0x28]
000000000001eab0	stur	x8, [x29, #-0x90]
000000000001eab4	add	x8, sp, #0x30
000000000001eab8	sub	x0, x29, #0x80
000000000001eabc	sub	x1, x29, #0xa0
000000000001eac0	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
000000000001eac4	ldr	x8, [x19]
000000000001eac8	ldr	x8, [x8, #0x150]
000000000001eacc	mov	x0, x19
000000000001ead0	blr	x8
000000000001ead4	mov	x21, x0
000000000001ead8	add	x0, x19, #0x5b8
000000000001eadc	movi.2d	v0, #0000000000000000
000000000001eae0	mov	x1, x20
000000000001eae4	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001eae8	mov	x8, sp
000000000001eaec	mov	x0, x21
000000000001eaf0	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
000000000001eaf4	ldr	q0, [sp, #0x30]
000000000001eaf8	stur	q0, [x29, #-0x80]
000000000001eafc	ldr	x8, [sp, #0x40]
000000000001eb00	stur	x8, [x29, #-0x70]
000000000001eb04	ldr	q0, [sp]
000000000001eb08	stur	q0, [x29, #-0xa0]
000000000001eb0c	ldr	x8, [sp, #0x10]
000000000001eb10	stur	x8, [x29, #-0x90]
000000000001eb14	add	x8, sp, #0xa8
000000000001eb18	sub	x0, x29, #0x80
000000000001eb1c	sub	x1, x29, #0xa0
000000000001eb20	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
000000000001eb24	ldr	q0, [sp, #0x90]
000000000001eb28	stur	q0, [x29, #-0x80]
000000000001eb2c	ldr	x8, [sp, #0xa0]
000000000001eb30	stur	x8, [x29, #-0x70]
000000000001eb34	ldur	q0, [sp, #0x48]
000000000001eb38	stur	q0, [x29, #-0xa0]
000000000001eb3c	ldr	x8, [sp, #0x58]
000000000001eb40	stur	x8, [x29, #-0x90]
000000000001eb44	sub	x0, x29, #0x80
000000000001eb48	sub	x1, x29, #0xa0
000000000001eb4c	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000001eb50	tbnz	w0, #0x1f, 0x1eb98
000000000001eb54	ldr	q0, [sp, #0x90]
000000000001eb58	stur	q0, [x29, #-0x80]
000000000001eb5c	ldr	x8, [sp, #0xa0]
000000000001eb60	stur	x8, [x29, #-0x70]
000000000001eb64	ldr	q0, [x22]
000000000001eb68	stur	q0, [x29, #-0xa0]
000000000001eb6c	ldr	x8, [sp, #0xb8]
000000000001eb70	stur	x8, [x29, #-0x90]
000000000001eb74	sub	x0, x29, #0x80
000000000001eb78	sub	x1, x29, #0xa0
000000000001eb7c	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000001eb80	cmp	w0, #0x1
000000000001eb84	b.lt	0x1ebd8
000000000001eb88	adrp	x1, 175 ; 0xcd000
000000000001eb8c	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
000000000001eb90	add	x0, x19, #0x3f0
000000000001eb94	b	0x1eba4
000000000001eb98	adrp	x1, 175 ; 0xcd000
000000000001eb9c	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
000000000001eba0	add	x0, x19, #0x358
000000000001eba4	movi.2d	v0, #0000000000000000
000000000001eba8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001ebac	fadd	d8, d8, d0
000000000001ebb0	mov.16b	v0, v8
000000000001ebb4	ldp	x29, x30, [sp, #0x160]
000000000001ebb8	ldp	x20, x19, [sp, #0x150]
000000000001ebbc	ldp	x22, x21, [sp, #0x140]
000000000001ebc0	ldp	x28, x27, [sp, #0x130]
000000000001ebc4	ldp	d9, d8, [sp, #0x120]
000000000001ebc8	ldp	d11, d10, [sp, #0x110]
000000000001ebcc	ldp	d13, d12, [sp, #0x100]
000000000001ebd0	add	sp, sp, #0x170
000000000001ebd4	ret
000000000001ebd8	ldr	q0, [x22]
000000000001ebdc	stur	q0, [x29, #-0x80]
000000000001ebe0	ldr	x8, [sp, #0xb8]
000000000001ebe4	stur	x8, [x29, #-0x70]
000000000001ebe8	ldur	q0, [sp, #0x48]
000000000001ebec	stur	q0, [x29, #-0xa0]
000000000001ebf0	ldr	x8, [sp, #0x58]
000000000001ebf4	stur	x8, [x29, #-0x90]
000000000001ebf8	add	x8, sp, #0x30
000000000001ebfc	sub	x0, x29, #0x80
000000000001ec00	sub	x1, x29, #0xa0
000000000001ec04	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
000000000001ec08	ldr	q0, [sp, #0x30]
000000000001ec0c	stur	q0, [x29, #-0x80]
000000000001ec10	ldr	x8, [sp, #0x40]
000000000001ec14	stur	x8, [x29, #-0x70]
000000000001ec18	ldr	q0, [x20]
000000000001ec1c	stur	q0, [x29, #-0xa0]
000000000001ec20	ldr	x8, [x20, #0x10]
000000000001ec24	stur	x8, [x29, #-0x90]
000000000001ec28	sub	x0, x29, #0x80
000000000001ec2c	sub	x1, x29, #0xa0
000000000001ec30	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000001ec34	cbz	w0, 0x1ed0c
000000000001ec38	add	x0, x19, #0x358
000000000001ec3c	movi.2d	v0, #0000000000000000
000000000001ec40	mov	x1, x20
000000000001ec44	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001ec48	mov.16b	v9, v0
000000000001ec4c	add	x0, x19, #0x3f0
000000000001ec50	movi.2d	v0, #0000000000000000
000000000001ec54	mov	x1, x20
000000000001ec58	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001ec5c	fsub	d12, d0, d9
000000000001ec60	ldr	q0, [sp, #0x90]
000000000001ec64	stur	q0, [x29, #-0x80]
000000000001ec68	ldr	x8, [sp, #0xa0]
000000000001ec6c	stur	x8, [x29, #-0x70]
000000000001ec70	ldur	q0, [sp, #0x48]
000000000001ec74	stur	q0, [x29, #-0xa0]
000000000001ec78	ldr	x8, [sp, #0x58]
000000000001ec7c	stur	x8, [x29, #-0x90]
000000000001ec80	add	x8, sp, #0x18
000000000001ec84	sub	x0, x29, #0x80
000000000001ec88	sub	x1, x29, #0xa0
000000000001ec8c	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
000000000001ec90	sub	x8, x29, #0x80
000000000001ec94	add	x0, sp, #0x18
000000000001ec98	add	x1, sp, #0x30
000000000001ec9c	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
000000000001eca0	sub	x0, x29, #0x80
000000000001eca4	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
000000000001eca8	mov.16b	v10, v0
000000000001ecac	add	x0, x19, #0x488
000000000001ecb0	movi.2d	v0, #0000000000000000
000000000001ecb4	mov	x1, x20
000000000001ecb8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001ecbc	mov.16b	v11, v0
000000000001ecc0	mov	x8, #0x2d18
000000000001ecc4	movk	x8, #0x5444, lsl #16
000000000001ecc8	movk	x8, #0x21fb, lsl #32
000000000001eccc	movk	x8, #0x4009, lsl #48
000000000001ecd0	fmov	d0, x8
000000000001ecd4	fmul	d0, d10, d0
000000000001ecd8	bl	0xa8b14 ; symbol stub for: _cos
000000000001ecdc	fmov	d1, #1.00000000
000000000001ece0	fsub	d0, d1, d0
000000000001ece4	fmov	d2, #0.50000000
000000000001ece8	fmul	d0, d0, d2
000000000001ecec	fmul	d0, d11, d0
000000000001ecf0	fsub	d1, d1, d11
000000000001ecf4	fmul	d1, d10, d1
000000000001ecf8	fadd	d0, d0, d1
000000000001ecfc	fmul	d0, d12, d0
000000000001ed00	fadd	d0, d8, d0
000000000001ed04	fadd	d8, d9, d0
000000000001ed08	b	0x1ebb0
000000000001ed0c	movi.2d	v8, #0000000000000000
000000000001ed10	b	0x1ebb0
```

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

### Decompiled code (ground truth)

This behavior (`OZSequenceBehavior`) has **no behavior-specific per-frame method** in the binary: it evaluates through the shared `OZSingleChannelBehavior::solveNode` base together with a per-instance user/table curve — for Custom/Sequence/Randomize the actual shape comes from the saved keyframes / sequence table in the `.motn`, not from compiled code. The verbatim shared base solver Apple ships is shown below; regenerate with `venv/bin/python3 tools/re/disasm_behavior.py OZSingleChannelBehavior`.

#### `OZSingleChannelBehavior::solveNode(unsigned int, CMTime const&, double, double)`  (shared base)
```asm
0000000000358c74	mov.16b	v0, v1
0000000000358c78	ret
```

## Rate

*Parameter behavior · 310 files · 711 instances*

Adds a steady per-frame increment to the parameter — constant-velocity drive (e.g. continuous rotation or scroll).

| Parameter | What it controls |
|---|---|
| Rate | Amount added per unit time. |
| Curvature | Optional ease on the rate ramp. |
| End Offset | Trim frames off the end of the active range. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZRateBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZRateBehavior`

#### `OZRateBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
0000000000001bf4	sub	sp, sp, #0x160
0000000000001bf8	stp	d11, d10, [sp, #0x110]
0000000000001bfc	stp	d9, d8, [sp, #0x120]
0000000000001c00	stp	x28, x27, [sp, #0x130]
0000000000001c04	stp	x20, x19, [sp, #0x140]
0000000000001c08	stp	x29, x30, [sp, #0x150]
0000000000001c0c	add	x29, sp, #0x150
0000000000001c10	mov.16b	v8, v1
0000000000001c14	mov	x1, x2
0000000000001c18	mov	x19, x0
0000000000001c1c	ldr	x8, [x0, #0x170]
0000000000001c20	ldr	x0, [x8, #0x20]
0000000000001c24	ldr	x8, [x0]
0000000000001c28	ldr	x9, [x8, #0x150]
0000000000001c2c	sub	x8, x29, #0x98
0000000000001c30	blr	x9
0000000000001c34	ldur	q0, [x29, #-0x98]
0000000000001c38	str	q0, [sp, #0x70]
0000000000001c3c	ldur	x8, [x29, #-0x88]
0000000000001c40	str	x8, [sp, #0x80]
0000000000001c44	ldr	x8, [x19]
0000000000001c48	ldr	x8, [x8, #0x128]
0000000000001c4c	add	x1, sp, #0x70
0000000000001c50	mov	x0, x19
0000000000001c54	mov	w2, #0x0
0000000000001c58	mov	w3, #0x1
0000000000001c5c	mov	w4, #0x1
0000000000001c60	blr	x8
0000000000001c64	cbz	w0, 0x1e6c
0000000000001c68	add	x20, sp, #0x70
0000000000001c6c	add	x8, sp, #0xa0
0000000000001c70	mov	x0, x19
0000000000001c74	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
0000000000001c78	ldr	x8, [x19]
0000000000001c7c	ldr	x9, [x8, #0x268]
0000000000001c80	add	x8, sp, #0x70
0000000000001c84	mov	x0, x19
0000000000001c88	blr	x9
0000000000001c8c	ldr	q0, [sp, #0x70]
0000000000001c90	str	q0, [x20, #0x60]
0000000000001c94	ldr	x8, [sp, #0x80]
0000000000001c98	stur	x8, [x29, #-0x70]
0000000000001c9c	ldur	q0, [x29, #-0x98]
0000000000001ca0	str	q0, [x20, #0x80]
0000000000001ca4	ldur	x8, [x29, #-0x88]
0000000000001ca8	stur	x8, [x29, #-0x50]
0000000000001cac	add	x8, sp, #0x50
0000000000001cb0	sub	x0, x29, #0x60
0000000000001cb4	sub	x1, x29, #0x80
0000000000001cb8	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000001cbc	ldur	q0, [x20, #0x18]
0000000000001cc0	str	q0, [x20, #0x80]
0000000000001cc4	ldr	x8, [sp, #0x98]
0000000000001cc8	stur	x8, [x29, #-0x50]
0000000000001ccc	adrp	x1, 204 ; 0xcd000
0000000000001cd0	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000001cd4	add	x0, x19, #0x488
0000000000001cd8	movi.2d	v0, #0000000000000000
0000000000001cdc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000001ce0	add	x8, sp, #0x20
0000000000001ce4	add	x0, sp, #0xa0
0000000000001ce8	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
0000000000001cec	ldr	q0, [sp, #0x20]
0000000000001cf0	str	q0, [x20, #0x60]
0000000000001cf4	ldr	x8, [sp, #0x30]
0000000000001cf8	stur	x8, [x29, #-0x70]
0000000000001cfc	add	x8, sp, #0x38
0000000000001d00	sub	x0, x29, #0x60
0000000000001d04	sub	x1, x29, #0x80
0000000000001d08	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000001d0c	ldur	q0, [sp, #0x38]
0000000000001d10	str	q0, [x20, #0x80]
0000000000001d14	ldr	x8, [sp, #0x48]
0000000000001d18	stur	x8, [x29, #-0x50]
0000000000001d1c	ldr	q0, [x20, #0x30]
0000000000001d20	str	q0, [x20, #0x60]
0000000000001d24	ldr	x8, [sp, #0xb0]
0000000000001d28	stur	x8, [x29, #-0x70]
0000000000001d2c	sub	x0, x29, #0x60
0000000000001d30	sub	x1, x29, #0x80
0000000000001d34	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000001d38	cmp	w0, #0x1
0000000000001d3c	b.lt	0x1e6c
0000000000001d40	ldr	q0, [sp, #0x50]
0000000000001d44	str	q0, [x20, #0x80]
0000000000001d48	ldr	x8, [sp, #0x60]
0000000000001d4c	stur	x8, [x29, #-0x50]
0000000000001d50	ldur	q0, [sp, #0x38]
0000000000001d54	str	q0, [x20, #0x60]
0000000000001d58	ldr	x8, [sp, #0x48]
0000000000001d5c	stur	x8, [x29, #-0x70]
0000000000001d60	sub	x0, x29, #0x60
0000000000001d64	sub	x1, x29, #0x80
0000000000001d68	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000001d6c	cmp	w0, #0x1
0000000000001d70	b.lt	0x1d84
0000000000001d74	ldur	q0, [sp, #0x38]
0000000000001d78	str	q0, [sp, #0x50]
0000000000001d7c	ldr	x8, [sp, #0x48]
0000000000001d80	str	x8, [sp, #0x60]
0000000000001d84	add	x8, sp, #0x8
0000000000001d88	mov	x0, x19
0000000000001d8c	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
0000000000001d90	ldur	q0, [sp, #0x38]
0000000000001d94	str	q0, [x20, #0x80]
0000000000001d98	ldr	x8, [sp, #0x48]
0000000000001d9c	stur	x8, [x29, #-0x50]
0000000000001da0	ldur	q0, [sp, #0x8]
0000000000001da4	str	q0, [x20, #0x60]
0000000000001da8	ldr	x8, [sp, #0x18]
0000000000001dac	stur	x8, [x29, #-0x70]
0000000000001db0	add	x8, sp, #0x20
0000000000001db4	sub	x0, x29, #0x60
0000000000001db8	sub	x1, x29, #0x80
0000000000001dbc	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000001dc0	sub	x8, x29, #0x60
0000000000001dc4	add	x0, sp, #0x50
0000000000001dc8	add	x1, sp, #0x20
0000000000001dcc	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
0000000000001dd0	sub	x0, x29, #0x60
0000000000001dd4	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
0000000000001dd8	mov.16b	v9, v0
0000000000001ddc	adrp	x20, 204 ; 0xcd000
0000000000001de0	ldr	x20, [x20, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000001de4	add	x0, x19, #0x3f0
0000000000001de8	movi.2d	v0, #0000000000000000
0000000000001dec	mov	x1, x20
0000000000001df0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000001df4	mov.16b	v10, v0
0000000000001df8	mov	x8, #0x2d18
0000000000001dfc	movk	x8, #0x5444, lsl #16
0000000000001e00	movk	x8, #0x21fb, lsl #32
0000000000001e04	movk	x8, #0x4009, lsl #48
0000000000001e08	fmov	d0, x8
0000000000001e0c	fmul	d0, d9, d0
0000000000001e10	bl	0xa8b14 ; symbol stub for: _cos
0000000000001e14	fmov	d1, #1.00000000
0000000000001e18	fsub	d0, d1, d0
0000000000001e1c	fmov	d2, #0.50000000
0000000000001e20	fmul	d0, d0, d2
0000000000001e24	fmul	d0, d10, d0
0000000000001e28	fsub	d1, d1, d10
0000000000001e2c	fmul	d1, d9, d1
0000000000001e30	fadd	d9, d0, d1
0000000000001e34	add	x0, x19, #0x358
0000000000001e38	movi.2d	v0, #0000000000000000
0000000000001e3c	mov	x1, x20
0000000000001e40	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000001e44	sub	x8, x29, #0x60
0000000000001e48	add	x0, sp, #0x38
0000000000001e4c	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
0000000000001e50	sub	x8, x29, #0x80
0000000000001e54	sub	x0, x29, #0x60
0000000000001e58	mov.16b	v0, v9
0000000000001e5c	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
0000000000001e60	sub	x0, x29, #0x80
0000000000001e64	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
0000000000001e68	fadd	d8, d8, d0
0000000000001e6c	mov.16b	v0, v8
0000000000001e70	ldp	x29, x30, [sp, #0x150]
0000000000001e74	ldp	x20, x19, [sp, #0x140]
0000000000001e78	ldp	x28, x27, [sp, #0x130]
0000000000001e7c	ldp	d9, d8, [sp, #0x120]
0000000000001e80	ldp	d11, d10, [sp, #0x110]
0000000000001e84	add	sp, sp, #0x160
0000000000001e88	ret
```

## Fade In/Fade Out

*Parameter behavior · 280 files · 729 instances*

An opacity envelope: fades the object in over Fade In Time at the start and out over Fade Out Time at the end.

| Parameter | What it controls |
|---|---|
| Fade Out Time | Duration of the closing fade. |
| Fade In Time | Duration of the opening fade (frames). |
| End Offset | Advance the fade-out. |
| Start Offset | Delay the fade-in. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZFadeInOutBehavior`). This `getMultiplier` method is the behavior's **per-frame fade multiplier** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method getMultiplier OZFadeInOutBehavior`

#### `OZFadeInOutBehavior::getMultiplier(CMTime)`
```asm
00000000000063f8	sub	sp, sp, #0x1a0
00000000000063fc	stp	d9, d8, [sp, #0x150]
0000000000006400	stp	x28, x27, [sp, #0x160]
0000000000006404	stp	x22, x21, [sp, #0x170]
0000000000006408	stp	x20, x19, [sp, #0x180]
000000000000640c	stp	x29, x30, [sp, #0x190]
0000000000006410	add	x29, sp, #0x190
0000000000006414	mov	x19, x1
0000000000006418	mov	x20, x0
000000000000641c	ldr	x8, [x0, #0x170]
0000000000006420	ldr	x0, [x8, #0x20]
0000000000006424	ldr	x8, [x0]
0000000000006428	ldr	x9, [x8, #0x150]
000000000000642c	add	x8, sp, #0xc0
0000000000006430	blr	x9
0000000000006434	ldr	q0, [sp, #0xc0]
0000000000006438	str	q0, [x19]
000000000000643c	ldr	x8, [sp, #0xd0]
0000000000006440	str	x8, [x19, #0x10]
0000000000006444	ldr	q0, [x19]
0000000000006448	str	q0, [sp, #0xc0]
000000000000644c	str	x8, [sp, #0xd0]
0000000000006450	ldr	x8, [x20]
0000000000006454	ldr	x8, [x8, #0x128]
0000000000006458	add	x1, sp, #0xc0
000000000000645c	mov	x0, x20
0000000000006460	mov	w2, #0x0
0000000000006464	mov	w3, #0x1
0000000000006468	mov	w4, #0x1
000000000000646c	blr	x8
0000000000006470	fmov	d8, #-1.00000000
0000000000006474	cbz	w0, 0x6640
0000000000006478	add	x22, sp, #0xa8
000000000000647c	ldr	x8, [x20]
0000000000006480	ldr	x8, [x8, #0x138]
0000000000006484	mov	x0, x20
0000000000006488	blr	x8
000000000000648c	ldr	x8, [x0]
0000000000006490	ldr	x9, [x8, #0x2c8]
0000000000006494	add	x8, sp, #0xc0
0000000000006498	blr	x9
000000000000649c	add	x8, sp, #0xa8
00000000000064a0	mov	x0, x20
00000000000064a4	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
00000000000064a8	ldr	q0, [sp, #0xc0]
00000000000064ac	stur	q0, [x29, #-0x60]
00000000000064b0	ldr	x8, [sp, #0xd0]
00000000000064b4	stur	x8, [x29, #-0x50]
00000000000064b8	adrp	x21, 199 ; 0xcd000
00000000000064bc	ldr	x21, [x21, #0x520] ; literal pool symbol address: _kCMTimeZero
00000000000064c0	movi.2d	v8, #0000000000000000
00000000000064c4	add	x0, x20, #0x340
00000000000064c8	movi.2d	v0, #0000000000000000
00000000000064cc	mov	x1, x21
00000000000064d0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000064d4	sub	x8, x29, #0xa0
00000000000064d8	add	x0, sp, #0xa8
00000000000064dc	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
00000000000064e0	ldur	q0, [x29, #-0xa0]
00000000000064e4	stur	q0, [x29, #-0x80]
00000000000064e8	ldur	x8, [x29, #-0x90]
00000000000064ec	stur	x8, [x29, #-0x70]
00000000000064f0	add	x8, sp, #0x90
00000000000064f4	sub	x0, x29, #0x60
00000000000064f8	sub	x1, x29, #0x80
00000000000064fc	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000006500	ldr	q0, [sp, #0xc0]
0000000000006504	stur	q0, [x29, #-0x60]
0000000000006508	ldr	x8, [sp, #0xd0]
000000000000650c	ldr	x9, [sp, #0xe8]
0000000000006510	stur	x8, [x29, #-0x50]
0000000000006514	ldur	q0, [x22, #0x30]
0000000000006518	stur	q0, [x29, #-0x80]
000000000000651c	stur	x9, [x29, #-0x70]
0000000000006520	sub	x8, x29, #0xa0
0000000000006524	sub	x0, x29, #0x60
0000000000006528	sub	x1, x29, #0x80
000000000000652c	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000006530	ldur	q0, [x29, #-0xa0]
0000000000006534	stur	q0, [x29, #-0x60]
0000000000006538	ldur	x8, [x29, #-0x90]
000000000000653c	stur	x8, [x29, #-0x50]
0000000000006540	ldr	q0, [x22]
0000000000006544	stur	q0, [x29, #-0x80]
0000000000006548	ldr	x8, [sp, #0xb8]
000000000000654c	stur	x8, [x29, #-0x70]
0000000000006550	add	x8, sp, #0x60
0000000000006554	sub	x0, x29, #0x60
0000000000006558	sub	x1, x29, #0x80
000000000000655c	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000006560	add	x0, x20, #0x3d8
0000000000006564	movi.2d	v0, #0000000000000000
0000000000006568	mov	x1, x21
000000000000656c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000006570	sub	x8, x29, #0xa0
0000000000006574	add	x0, sp, #0xa8
0000000000006578	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
000000000000657c	ldr	q0, [sp, #0x60]
0000000000006580	stur	q0, [x29, #-0x60]
0000000000006584	ldr	x8, [sp, #0x70]
0000000000006588	stur	x8, [x29, #-0x50]
000000000000658c	ldur	q0, [x29, #-0xa0]
0000000000006590	stur	q0, [x29, #-0x80]
0000000000006594	ldur	x8, [x29, #-0x90]
0000000000006598	stur	x8, [x29, #-0x70]
000000000000659c	add	x8, sp, #0x78
00000000000065a0	sub	x0, x29, #0x60
00000000000065a4	sub	x1, x29, #0x80
00000000000065a8	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000065ac	ldr	q0, [x19]
00000000000065b0	stur	q0, [x29, #-0x60]
00000000000065b4	ldr	x8, [x19, #0x10]
00000000000065b8	stur	x8, [x29, #-0x50]
00000000000065bc	ldr	q0, [x22]
00000000000065c0	stur	q0, [x29, #-0x80]
00000000000065c4	ldr	x8, [sp, #0xb8]
00000000000065c8	stur	x8, [x29, #-0x70]
00000000000065cc	add	x8, sp, #0x60
00000000000065d0	sub	x0, x29, #0x60
00000000000065d4	sub	x1, x29, #0x80
00000000000065d8	bl	0xa6f54 ; symbol stub for: _PC_CMTimeFloorToSampleDuration
00000000000065dc	ldr	q0, [sp, #0x60]
00000000000065e0	stur	q0, [x29, #-0x60]
00000000000065e4	ldr	x8, [sp, #0x70]
00000000000065e8	stur	x8, [x29, #-0x50]
00000000000065ec	ldr	q0, [sp, #0x90]
00000000000065f0	stur	q0, [x29, #-0x80]
00000000000065f4	ldr	x8, [sp, #0xa0]
00000000000065f8	stur	x8, [x29, #-0x70]
00000000000065fc	sub	x0, x29, #0x60
0000000000006600	sub	x1, x29, #0x80
0000000000006604	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000006608	tbnz	w0, #0x1f, 0x6640
000000000000660c	ldr	q0, [sp, #0x60]
0000000000006610	stur	q0, [x29, #-0x60]
0000000000006614	ldr	x8, [sp, #0x70]
0000000000006618	stur	x8, [x29, #-0x50]
000000000000661c	ldur	q0, [sp, #0x78]
0000000000006620	stur	q0, [x29, #-0x80]
0000000000006624	ldr	x8, [sp, #0x88]
0000000000006628	stur	x8, [x29, #-0x70]
000000000000662c	sub	x0, x29, #0x60
0000000000006630	sub	x1, x29, #0x80
0000000000006634	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000006638	cmp	w0, #0x0
000000000000663c	b.le	0x6660
0000000000006640	mov.16b	v0, v8
0000000000006644	ldp	x29, x30, [sp, #0x190]
0000000000006648	ldp	x20, x19, [sp, #0x180]
000000000000664c	ldp	x22, x21, [sp, #0x170]
0000000000006650	ldp	x28, x27, [sp, #0x160]
0000000000006654	ldp	d9, d8, [sp, #0x150]
0000000000006658	add	sp, sp, #0x1a0
000000000000665c	ret
0000000000006660	ldr	q0, [x19]
0000000000006664	stur	q0, [x29, #-0x60]
0000000000006668	ldr	x8, [x19, #0x10]
000000000000666c	stur	x8, [x29, #-0x50]
0000000000006670	ldur	q0, [sp, #0x78]
0000000000006674	stur	q0, [x29, #-0x80]
0000000000006678	ldr	x8, [sp, #0x88]
000000000000667c	stur	x8, [x29, #-0x70]
0000000000006680	sub	x0, x29, #0x60
0000000000006684	sub	x1, x29, #0x80
0000000000006688	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000000668c	cmp	w0, #0x1
0000000000006690	b.lt	0x66a4
0000000000006694	ldur	q0, [sp, #0x78]
0000000000006698	str	q0, [x19]
000000000000669c	ldr	x8, [sp, #0x88]
00000000000066a0	str	x8, [x19, #0x10]
00000000000066a4	ldur	q0, [sp, #0x78]
00000000000066a8	stur	q0, [x29, #-0x60]
00000000000066ac	ldr	x8, [sp, #0x88]
00000000000066b0	stur	x8, [x29, #-0x50]
00000000000066b4	ldr	q0, [sp, #0x90]
00000000000066b8	stur	q0, [x29, #-0x80]
00000000000066bc	ldr	x8, [sp, #0xa0]
00000000000066c0	stur	x8, [x29, #-0x70]
00000000000066c4	add	x8, sp, #0x48
00000000000066c8	sub	x0, x29, #0x60
00000000000066cc	sub	x1, x29, #0x80
00000000000066d0	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000066d4	ldr	q0, [x19]
00000000000066d8	stur	q0, [x29, #-0x80]
00000000000066dc	ldr	x8, [x19, #0x10]
00000000000066e0	stur	x8, [x29, #-0x70]
00000000000066e4	ldr	q0, [sp, #0x90]
00000000000066e8	stur	q0, [x29, #-0xa0]
00000000000066ec	ldr	x8, [sp, #0xa0]
00000000000066f0	stur	x8, [x29, #-0x90]
00000000000066f4	sub	x8, x29, #0x60
00000000000066f8	sub	x0, x29, #0x80
00000000000066fc	sub	x1, x29, #0xa0
0000000000006700	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000006704	ldur	q0, [x29, #-0x60]
0000000000006708	str	q0, [x19]
000000000000670c	ldur	x8, [x29, #-0x50]
0000000000006710	str	x8, [x19, #0x10]
0000000000006714	add	x0, x20, #0x210
0000000000006718	movi.2d	v0, #0000000000000000
000000000000671c	mov	x1, x21
0000000000006720	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000006724	sub	x8, x29, #0xa0
0000000000006728	add	x0, sp, #0xa8
000000000000672c	bl	0xa8a30 ; symbol stub for: __ZmldRK6CMTime
0000000000006730	add	x0, x20, #0x2a8
0000000000006734	movi.2d	v0, #0000000000000000
0000000000006738	mov	x1, x21
000000000000673c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000006740	add	x8, sp, #0x30
0000000000006744	add	x0, sp, #0xa8
0000000000006748	bl	0xa8a30 ; symbol stub for: __ZmldRK6CMTime
000000000000674c	ldur	q0, [sp, #0x48]
0000000000006750	stur	q0, [x29, #-0x60]
0000000000006754	ldr	x8, [sp, #0x58]
0000000000006758	stur	x8, [x29, #-0x50]
000000000000675c	ldr	q0, [sp, #0x30]
0000000000006760	stur	q0, [x29, #-0x80]
0000000000006764	ldr	x8, [sp, #0x40]
0000000000006768	stur	x8, [x29, #-0x70]
000000000000676c	add	x8, sp, #0x18
0000000000006770	sub	x0, x29, #0x60
0000000000006774	sub	x1, x29, #0x80
0000000000006778	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
000000000000677c	ldr	q0, [x19]
0000000000006780	stur	q0, [x29, #-0x60]
0000000000006784	ldr	x8, [x19, #0x10]
0000000000006788	stur	x8, [x29, #-0x50]
000000000000678c	ldur	q0, [x29, #-0xa0]
0000000000006790	stur	q0, [x29, #-0x80]
0000000000006794	ldur	x8, [x29, #-0x90]
0000000000006798	stur	x8, [x29, #-0x70]
000000000000679c	sub	x0, x29, #0x60
00000000000067a0	sub	x1, x29, #0x80
00000000000067a4	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
00000000000067a8	tbnz	w0, #0x1f, 0x6868
00000000000067ac	ldr	q0, [x19]
00000000000067b0	stur	q0, [x29, #-0x60]
00000000000067b4	ldr	x8, [x19, #0x10]
00000000000067b8	stur	x8, [x29, #-0x50]
00000000000067bc	ldur	q0, [sp, #0x18]
00000000000067c0	stur	q0, [x29, #-0x80]
00000000000067c4	ldr	x8, [sp, #0x28]
00000000000067c8	stur	x8, [x29, #-0x70]
00000000000067cc	sub	x0, x29, #0x60
00000000000067d0	sub	x1, x29, #0x80
00000000000067d4	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
00000000000067d8	fmov	d8, #1.00000000
00000000000067dc	tbnz	w0, #0x1f, 0x6640
00000000000067e0	ldr	q0, [sp, #0x30]
00000000000067e4	stur	q0, [x29, #-0x60]
00000000000067e8	ldr	x8, [sp, #0x40]
00000000000067ec	stur	x8, [x29, #-0x50]
00000000000067f0	ldr	q0, [x21]
00000000000067f4	stur	q0, [x29, #-0x80]
00000000000067f8	ldr	x8, [x21, #0x10]
00000000000067fc	stur	x8, [x29, #-0x70]
0000000000006800	sub	x0, x29, #0x60
0000000000006804	sub	x1, x29, #0x80
0000000000006808	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000000680c	cmp	w0, #0x1
0000000000006810	b.lt	0x6640
0000000000006814	ldr	q0, [x19]
0000000000006818	stur	q0, [x29, #-0x60]
000000000000681c	ldr	x8, [x19, #0x10]
0000000000006820	stur	x8, [x29, #-0x50]
0000000000006824	ldur	q0, [sp, #0x18]
0000000000006828	stur	q0, [x29, #-0x80]
000000000000682c	ldr	x8, [sp, #0x28]
0000000000006830	stur	x8, [x29, #-0x70]
0000000000006834	mov	x8, sp
0000000000006838	sub	x0, x29, #0x60
000000000000683c	sub	x1, x29, #0x80
0000000000006840	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000006844	sub	x8, x29, #0x60
0000000000006848	mov	x0, sp
000000000000684c	add	x1, sp, #0x30
0000000000006850	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
0000000000006854	sub	x0, x29, #0x60
0000000000006858	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
000000000000685c	fmov	d1, #1.00000000
0000000000006860	fsub	d8, d1, d0
0000000000006864	b	0x6640
0000000000006868	sub	x8, x29, #0x60
000000000000686c	sub	x1, x29, #0xa0
0000000000006870	mov	x0, x19
0000000000006874	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
0000000000006878	sub	x0, x29, #0x60
000000000000687c	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
0000000000006880	mov.16b	v8, v0
0000000000006884	ldr	q0, [x19]
0000000000006888	stur	q0, [x29, #-0x60]
000000000000688c	ldr	x8, [x19, #0x10]
0000000000006890	stur	x8, [x29, #-0x50]
0000000000006894	ldur	q0, [sp, #0x18]
0000000000006898	stur	q0, [x29, #-0x80]
000000000000689c	ldr	x8, [sp, #0x28]
00000000000068a0	stur	x8, [x29, #-0x70]
00000000000068a4	sub	x0, x29, #0x60
00000000000068a8	sub	x1, x29, #0x80
00000000000068ac	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
00000000000068b0	tbnz	w0, #0x1f, 0x6640
00000000000068b4	ldr	q0, [sp, #0x30]
00000000000068b8	stur	q0, [x29, #-0x60]
00000000000068bc	ldr	x8, [sp, #0x40]
00000000000068c0	stur	x8, [x29, #-0x50]
00000000000068c4	ldr	q0, [x21]
00000000000068c8	stur	q0, [x29, #-0x80]
00000000000068cc	ldr	x8, [x21, #0x10]
00000000000068d0	stur	x8, [x29, #-0x70]
00000000000068d4	sub	x0, x29, #0x60
00000000000068d8	sub	x1, x29, #0x80
00000000000068dc	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
00000000000068e0	cmp	w0, #0x1
00000000000068e4	b.lt	0x6640
00000000000068e8	ldr	q0, [x19]
00000000000068ec	stur	q0, [x29, #-0x60]
00000000000068f0	ldr	x8, [x19, #0x10]
00000000000068f4	stur	x8, [x29, #-0x50]
00000000000068f8	ldur	q0, [sp, #0x18]
00000000000068fc	stur	q0, [x29, #-0x80]
0000000000006900	ldr	x8, [sp, #0x28]
0000000000006904	stur	x8, [x29, #-0x70]
0000000000006908	mov	x8, sp
000000000000690c	sub	x0, x29, #0x60
0000000000006910	sub	x1, x29, #0x80
0000000000006914	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000006918	sub	x8, x29, #0x60
000000000000691c	mov	x0, sp
0000000000006920	add	x1, sp, #0x30
0000000000006924	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
0000000000006928	sub	x0, x29, #0x60
000000000000692c	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
0000000000006930	fmov	d1, #1.00000000
0000000000006934	fsub	d0, d1, d0
0000000000006938	fcmp	d8, d0
000000000000693c	fcsel	d8, d0, d8, gt
0000000000006940	b	0x6640
```

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZOscillateBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZOscillateBehavior`

#### `OZOscillateBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
0000000000021004	sub	sp, sp, #0x1f0
0000000000021008	stp	d15, d14, [sp, #0x160]
000000000002100c	stp	d13, d12, [sp, #0x170]
0000000000021010	stp	d11, d10, [sp, #0x180]
0000000000021014	stp	d9, d8, [sp, #0x190]
0000000000021018	stp	x28, x27, [sp, #0x1a0]
000000000002101c	stp	x24, x23, [sp, #0x1b0]
0000000000021020	stp	x22, x21, [sp, #0x1c0]
0000000000021024	stp	x20, x19, [sp, #0x1d0]
0000000000021028	stp	x29, x30, [sp, #0x1e0]
000000000002102c	add	x29, sp, #0x1e0
0000000000021030	mov.16b	v8, v1
0000000000021034	mov	x20, x2
0000000000021038	mov	x19, x0
000000000002103c	add	x22, sp, #0x80
0000000000021040	ldr	x8, [x0, #0x170]
0000000000021044	ldr	x0, [x8, #0x20]
0000000000021048	ldr	x8, [x0]
000000000002104c	ldr	x9, [x8, #0x150]
0000000000021050	add	x8, sp, #0xb0
0000000000021054	mov	x1, x2
0000000000021058	blr	x9
000000000002105c	ldr	q0, [x22, #0x30]
0000000000021060	str	q0, [sp, #0x80]
0000000000021064	ldr	x8, [sp, #0xc0]
0000000000021068	str	x8, [sp, #0x90]
000000000002106c	ldr	x8, [x19]
0000000000021070	ldr	x8, [x8, #0x128]
0000000000021074	add	x1, sp, #0x80
0000000000021078	mov	x0, x19
000000000002107c	mov	w2, #0x0
0000000000021080	mov	w3, #0x1
0000000000021084	mov	w4, #0x1
0000000000021088	blr	x8
000000000002108c	cbz	w0, 0x21728
0000000000021090	ldr	x8, [x19]
0000000000021094	ldr	x8, [x8, #0x150]
0000000000021098	mov	x0, x19
000000000002109c	blr	x8
00000000000210a0	cbz	x0, 0x21728
00000000000210a4	ldr	x8, [x19]
00000000000210a8	ldr	x9, [x8, #0x268]
00000000000210ac	add	x8, sp, #0x80
00000000000210b0	mov	x0, x19
00000000000210b4	blr	x9
00000000000210b8	ldr	q0, [sp, #0x80]
00000000000210bc	str	q0, [x22, #0x80]
00000000000210c0	ldr	x8, [sp, #0x90]
00000000000210c4	stur	x8, [x29, #-0xd0]
00000000000210c8	ldr	x8, [x19]
00000000000210cc	ldr	x8, [x8, #0x150]
00000000000210d0	mov	x0, x19
00000000000210d4	blr	x8
00000000000210d8	mov	x21, x0
00000000000210dc	add	x23, sp, #0xb0
00000000000210e0	add	x0, x19, #0x6b8
00000000000210e4	add	x1, sp, #0xb0
00000000000210e8	movi.2d	v0, #0000000000000000
00000000000210ec	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000210f0	add	x8, sp, #0xe0
00000000000210f4	mov	x0, x21
00000000000210f8	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
00000000000210fc	ldr	q0, [x22, #0x80]
0000000000021100	str	q0, [x22, #0xc0]
0000000000021104	ldur	x8, [x29, #-0xd0]
0000000000021108	stur	x8, [x29, #-0x90]
000000000002110c	ldr	q0, [x22, #0x60]
0000000000021110	str	q0, [x22, #0xa0]
0000000000021114	ldr	x8, [sp, #0xf0]
0000000000021118	stur	x8, [x29, #-0xb0]
000000000002111c	add	x24, sp, #0x68
0000000000021120	add	x8, sp, #0x68
0000000000021124	sub	x0, x29, #0xa0
0000000000021128	sub	x1, x29, #0xc0
000000000002112c	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000021130	add	x8, sp, #0xc8
0000000000021134	mov	x0, x19
0000000000021138	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
000000000002113c	ldr	q0, [sp, #0x80]
0000000000021140	str	q0, [x22, #0xc0]
0000000000021144	ldr	x8, [sp, #0x90]
0000000000021148	ldr	x9, [sp, #0xa8]
000000000002114c	stur	x8, [x29, #-0x90]
0000000000021150	ldur	q0, [x22, #0x18]
0000000000021154	str	q0, [x22, #0xa0]
0000000000021158	stur	x9, [x29, #-0xb0]
000000000002115c	sub	x8, x29, #0xe0
0000000000021160	sub	x0, x29, #0xa0
0000000000021164	sub	x1, x29, #0xc0
0000000000021168	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
000000000002116c	ldr	q0, [x22, #0x80]
0000000000021170	str	q0, [x22, #0xc0]
0000000000021174	ldur	x8, [x29, #-0xd0]
0000000000021178	stur	x8, [x29, #-0x90]
000000000002117c	ldur	q0, [sp, #0xc8]
0000000000021180	str	q0, [x22, #0xa0]
0000000000021184	ldr	x8, [sp, #0xd8]
0000000000021188	stur	x8, [x29, #-0xb0]
000000000002118c	add	x8, sp, #0xe0
0000000000021190	sub	x0, x29, #0xa0
0000000000021194	sub	x1, x29, #0xc0
0000000000021198	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
000000000002119c	ldr	x8, [x19]
00000000000211a0	ldr	x8, [x8, #0x150]
00000000000211a4	mov	x0, x19
00000000000211a8	blr	x8
00000000000211ac	mov	x21, x0
00000000000211b0	add	x0, x19, #0x750
00000000000211b4	add	x1, sp, #0xb0
00000000000211b8	movi.2d	v0, #0000000000000000
00000000000211bc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000211c0	sub	x8, x29, #0xe0
00000000000211c4	mov	x0, x21
00000000000211c8	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
00000000000211cc	ldr	q0, [x22, #0x60]
00000000000211d0	str	q0, [x22, #0xc0]
00000000000211d4	ldr	x8, [sp, #0xf0]
00000000000211d8	stur	x8, [x29, #-0x90]
00000000000211dc	ldr	q0, [x22, #0x80]
00000000000211e0	str	q0, [x22, #0xa0]
00000000000211e4	ldur	x8, [x29, #-0xd0]
00000000000211e8	stur	x8, [x29, #-0xb0]
00000000000211ec	add	x21, sp, #0x50
00000000000211f0	add	x8, sp, #0x50
00000000000211f4	sub	x0, x29, #0xa0
00000000000211f8	sub	x1, x29, #0xc0
00000000000211fc	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000021200	ldr	q0, [x22, #0x30]
0000000000021204	str	q0, [x22, #0xc0]
0000000000021208	ldr	x8, [sp, #0xc0]
000000000002120c	stur	x8, [x29, #-0x90]
0000000000021210	ldur	q0, [sp, #0x68]
0000000000021214	str	q0, [x22, #0xa0]
0000000000021218	ldr	x8, [sp, #0x78]
000000000002121c	stur	x8, [x29, #-0xb0]
0000000000021220	sub	x0, x29, #0xa0
0000000000021224	sub	x1, x29, #0xc0
0000000000021228	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000002122c	tbnz	w0, #0x1f, 0x21264
0000000000021230	ldr	q0, [x22, #0x30]
0000000000021234	str	q0, [x22, #0xc0]
0000000000021238	ldr	x8, [sp, #0xc0]
000000000002123c	stur	x8, [x29, #-0x90]
0000000000021240	ldr	q0, [sp, #0x50]
0000000000021244	str	q0, [x22, #0xa0]
0000000000021248	ldr	x8, [sp, #0x60]
000000000002124c	stur	x8, [x29, #-0xb0]
0000000000021250	sub	x0, x29, #0xa0
0000000000021254	sub	x1, x29, #0xc0
0000000000021258	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000002125c	cmp	w0, #0x0
0000000000021260	csel	x24, x21, x23, gt
0000000000021264	ldr	q0, [x24]
0000000000021268	str	q0, [sp, #0x30]
000000000002126c	ldr	x8, [x24, #0x10]
0000000000021270	str	x8, [sp, #0x40]
0000000000021274	ldr	q0, [x24]
0000000000021278	str	q0, [x22, #0xc0]
000000000002127c	ldr	x8, [x24, #0x10]
0000000000021280	stur	x8, [x29, #-0x90]
0000000000021284	ldur	q0, [sp, #0x68]
0000000000021288	str	q0, [x22, #0xa0]
000000000002128c	ldr	x8, [sp, #0x78]
0000000000021290	stur	x8, [x29, #-0xb0]
0000000000021294	add	x8, sp, #0x30
0000000000021298	sub	x0, x29, #0xa0
000000000002129c	sub	x1, x29, #0xc0
00000000000212a0	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000212a4	adrp	x1, 172 ; 0xcd000
00000000000212a8	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
00000000000212ac	add	x0, x19, #0x7e8
00000000000212b0	movi.2d	v0, #0000000000000000
00000000000212b4	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000212b8	cbz	w0, 0x21344
00000000000212bc	ldr	x8, [x19, #0x170]
00000000000212c0	ldr	x0, [x8, #0x20]
00000000000212c4	ldr	x8, [x0]
00000000000212c8	ldr	x9, [x8, #0x140]
00000000000212cc	add	x8, sp, #0xe0
00000000000212d0	blr	x9
00000000000212d4	ldr	q0, [x20]
00000000000212d8	str	q0, [x22, #0xc0]
00000000000212dc	ldr	x8, [x20, #0x10]
00000000000212e0	stur	x8, [x29, #-0x90]
00000000000212e4	ldr	q0, [x22, #0x60]
00000000000212e8	str	q0, [x22, #0xa0]
00000000000212ec	ldr	x8, [sp, #0xf0]
00000000000212f0	stur	x8, [x29, #-0xb0]
00000000000212f4	sub	x8, x29, #0xe0
00000000000212f8	sub	x0, x29, #0xa0
00000000000212fc	sub	x1, x29, #0xc0
0000000000021300	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000021304	add	x8, sp, #0xc8
0000000000021308	add	x0, x19, #0x30
000000000002130c	bl	0xa87c0 ; symbol stub for: __ZNK23OZChannelObjectRootBase13getTimeOffsetEv
0000000000021310	ldr	q0, [x22, #0x80]
0000000000021314	str	q0, [x22, #0xc0]
0000000000021318	ldur	x8, [x29, #-0xd0]
000000000002131c	stur	x8, [x29, #-0x90]
0000000000021320	ldur	q0, [sp, #0xc8]
0000000000021324	str	q0, [x22, #0xa0]
0000000000021328	ldr	x8, [sp, #0xd8]
000000000002132c	stur	x8, [x29, #-0xb0]
0000000000021330	add	x8, sp, #0x10
0000000000021334	sub	x0, x29, #0xa0
0000000000021338	sub	x1, x29, #0xc0
000000000002133c	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000021340	b	0x21354
0000000000021344	ldr	q0, [x22, #0x30]
0000000000021348	str	q0, [sp, #0x10]
000000000002134c	ldr	x8, [sp, #0xc0]
0000000000021350	str	x8, [sp, #0x20]
0000000000021354	add	x0, x19, #0x458
0000000000021358	add	x1, sp, #0x10
000000000002135c	movi.2d	v0, #0000000000000000
0000000000021360	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000021364	mov.16b	v10, v0
0000000000021368	add	x0, x19, #0x4f0
000000000002136c	add	x1, sp, #0x10
0000000000021370	movi.2d	v0, #0000000000000000
0000000000021374	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000021378	mov.16b	v13, v0
000000000002137c	add	x0, x19, #0x588
0000000000021380	bl	0xa88c8 ; symbol stub for: __ZNK9OZChannel22hasMoreThanOneKeypointEv
0000000000021384	tbnz	w0, #0x0, 0x21398
0000000000021388	add	x0, x19, #0x588
000000000002138c	mov	w1, #0x0
0000000000021390	bl	0xa70a4 ; symbol stub for: __ZN10OZBehavior28IsChannelAffectedByBehaviorsEPK13OZChannelBaseb
0000000000021394	cbz	w0, 0x215c0
0000000000021398	str	d13, [sp]
000000000002139c	ldur	q0, [sp, #0x68]
00000000000213a0	str	q0, [x22, #0x60]
00000000000213a4	ldr	x8, [sp, #0x78]
00000000000213a8	str	x8, [sp, #0xf0]
00000000000213ac	adrp	x1, 172 ; 0xcd000
00000000000213b0	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
00000000000213b4	add	x0, x19, #0x358
00000000000213b8	movi.2d	v0, #0000000000000000
00000000000213bc	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000213c0	mov	w20, #0x0
00000000000213c4	mov	w8, #0x4
00000000000213c8	cmp	w0, #0x2
00000000000213cc	csel	w21, w0, w8, eq
00000000000213d0	ucvtf	d11, w21
00000000000213d4	mov	x8, #0x404e000000000000
00000000000213d8	fmov	d12, x8
00000000000213dc	fmov	d13, #1.00000000
00000000000213e0	mov	x8, #0xd78400000000
00000000000213e4	movk	x8, #0x4197, lsl #48
00000000000213e8	fmov	d14, x8
00000000000213ec	add	x0, x19, #0x588
00000000000213f0	add	x1, sp, #0xe0
00000000000213f4	movi.2d	v0, #0000000000000000
00000000000213f8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000213fc	fdiv	d15, d0, d12
0000000000021400	fdiv	d0, d13, d15
0000000000021404	fcmp	d15, #0.0
0000000000021408	fcsel	d9, d0, d14, gt
000000000002140c	fdiv	d0, d9, d11
0000000000021410	add	x8, sp, #0xc8
0000000000021414	mov	w0, #0x40000
0000000000021418	bl	0xa7014 ; symbol stub for: __Z26OZFigTimeForChannelSecondsdi
000000000002141c	ldr	q0, [x22, #0x60]
0000000000021420	str	q0, [x22, #0xc0]
0000000000021424	ldr	x8, [sp, #0xf0]
0000000000021428	stur	x8, [x29, #-0x90]
000000000002142c	ldur	q0, [sp, #0xc8]
0000000000021430	str	q0, [x22, #0xa0]
0000000000021434	ldr	x8, [sp, #0xd8]
0000000000021438	stur	x8, [x29, #-0xb0]
000000000002143c	sub	x8, x29, #0xe0
0000000000021440	sub	x0, x29, #0xa0
0000000000021444	sub	x1, x29, #0xc0
0000000000021448	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
000000000002144c	ldr	q0, [x22, #0x80]
0000000000021450	str	q0, [x22, #0xc0]
0000000000021454	ldur	x8, [x29, #-0xd0]
0000000000021458	stur	x8, [x29, #-0x90]
000000000002145c	ldr	q0, [sp, #0x30]
0000000000021460	str	q0, [x22, #0xa0]
0000000000021464	ldr	x8, [sp, #0x40]
0000000000021468	stur	x8, [x29, #-0xb0]
000000000002146c	sub	x0, x29, #0xa0
0000000000021470	sub	x1, x29, #0xc0
0000000000021474	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000021478	tbz	w0, #0x1f, 0x214c4
000000000002147c	ldr	q0, [x22, #0x60]
0000000000021480	str	q0, [x22, #0xa0]
0000000000021484	ldr	x8, [sp, #0xf0]
0000000000021488	stur	x8, [x29, #-0xb0]
000000000002148c	ldur	q0, [sp, #0xc8]
0000000000021490	str	q0, [x22, #0x80]
0000000000021494	ldr	x8, [sp, #0xd8]
0000000000021498	stur	x8, [x29, #-0xd0]
000000000002149c	sub	x8, x29, #0xa0
00000000000214a0	sub	x0, x29, #0xc0
00000000000214a4	sub	x1, x29, #0xe0
00000000000214a8	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
00000000000214ac	ldr	q0, [x22, #0xc0]
00000000000214b0	str	q0, [x22, #0x60]
00000000000214b4	ldur	x8, [x29, #-0x90]
00000000000214b8	str	x8, [sp, #0xf0]
00000000000214bc	add	w20, w20, #0x1
00000000000214c0	b	0x213ec
00000000000214c4	sub	w8, w21, #0x1
00000000000214c8	and	w8, w20, w8
00000000000214cc	ucvtf	d0, w8
00000000000214d0	fdiv	d11, d0, d11
00000000000214d4	ldr	q0, [sp, #0x30]
00000000000214d8	str	q0, [x22, #0xc0]
00000000000214dc	ldr	x8, [sp, #0x40]
00000000000214e0	stur	x8, [x29, #-0x90]
00000000000214e4	ldr	q0, [x22, #0x60]
00000000000214e8	str	q0, [x22, #0xa0]
00000000000214ec	ldr	x8, [sp, #0xf0]
00000000000214f0	stur	x8, [x29, #-0xb0]
00000000000214f4	sub	x8, x29, #0xe0
00000000000214f8	sub	x0, x29, #0xa0
00000000000214fc	sub	x1, x29, #0xc0
0000000000021500	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000021504	sub	x0, x29, #0xe0
0000000000021508	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
000000000002150c	fmul	d1, d11, d9
0000000000021510	fadd	d0, d1, d0
0000000000021514	fmul	d0, d15, d0
0000000000021518	mov	x8, #0x2d18
000000000002151c	movk	x8, #0x5444, lsl #16
0000000000021520	movk	x8, #0x21fb, lsl #32
0000000000021524	movk	x8, #0x4019, lsl #48
0000000000021528	fmov	d1, x8
000000000002152c	fdiv	d1, d10, d1
0000000000021530	fadd	d9, d1, d0
0000000000021534	adrp	x1, 172 ; 0xcd000
0000000000021538	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
000000000002153c	movi.2d	v11, #0000000000000000
0000000000021540	add	x0, x19, #0x358
0000000000021544	movi.2d	v0, #0000000000000000
0000000000021548	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000002154c	cmp	w0, #0x1
0000000000021550	b.gt	0x2157c
0000000000021554	ldr	d13, [sp]
0000000000021558	cbz	w0, 0x21660
000000000002155c	cmp	w0, #0x1
0000000000021560	b.ne	0x216e4
0000000000021564	fmov	d0, #0.50000000
0000000000021568	fcmp	d9, d0
000000000002156c	fmov	d0, #-1.00000000
0000000000021570	fmov	d1, #1.00000000
0000000000021574	fcsel	d11, d1, d0, ls
0000000000021578	b	0x216e4
000000000002157c	cmp	w0, #0x2
0000000000021580	ldr	d13, [sp]
0000000000021584	b.eq	0x216cc
0000000000021588	cmp	w0, #0x3
000000000002158c	b.ne	0x216e4
0000000000021590	fmov	d0, #0.25000000
0000000000021594	fcmp	d9, d0
0000000000021598	fmov	d0, #0.75000000
000000000002159c	fccmp	d9, d0, #0x0, hi
00000000000215a0	b.lt	0x216ac
00000000000215a4	fmov	d0, #4.00000000
00000000000215a8	fmul	d11, d9, d0
00000000000215ac	fmov	d0, #1.00000000
00000000000215b0	fcmp	d11, d0
00000000000215b4	b.le	0x216e4
00000000000215b8	fmov	d0, #-4.00000000
00000000000215bc	b	0x216e0
00000000000215c0	movi.2d	v11, #0000000000000000
00000000000215c4	add	x0, x19, #0x588
00000000000215c8	add	x1, sp, #0x10
00000000000215cc	movi.2d	v0, #0000000000000000
00000000000215d0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000215d4	mov.16b	v12, v0
00000000000215d8	ldr	q0, [sp, #0x30]
00000000000215dc	str	q0, [x22, #0xc0]
00000000000215e0	ldr	x8, [sp, #0x40]
00000000000215e4	stur	x8, [x29, #-0x90]
00000000000215e8	sub	x0, x29, #0xa0
00000000000215ec	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
00000000000215f0	mov	x8, #0x404e000000000000
00000000000215f4	fmov	d1, x8
00000000000215f8	fdiv	d0, d0, d1
00000000000215fc	fmul	d0, d12, d0
0000000000021600	mov	x8, #0x2d18
0000000000021604	movk	x8, #0x5444, lsl #16
0000000000021608	movk	x8, #0x21fb, lsl #32
000000000002160c	movk	x8, #0x4019, lsl #48
0000000000021610	fmov	d1, x8
0000000000021614	fdiv	d1, d10, d1
0000000000021618	fadd	d10, d1, d0
000000000002161c	add	x0, sp, #0x8
0000000000021620	mov.16b	v0, v10
0000000000021624	bl	0xa8c1c ; symbol stub for: _modf
0000000000021628	ldr	d0, [sp, #0x8]
000000000002162c	fsub	d0, d10, d0
0000000000021630	fmov	d1, #1.00000000
0000000000021634	fadd	d1, d0, d1
0000000000021638	fcmp	d0, #0.0
000000000002163c	fcsel	d9, d1, d0, mi
0000000000021640	adrp	x1, 172 ; 0xcd000
0000000000021644	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000021648	add	x0, x19, #0x358
000000000002164c	movi.2d	v0, #0000000000000000
0000000000021650	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000021654	cmp	w0, #0x1
0000000000021658	b.gt	0x21684
000000000002165c	cbnz	w0, 0x2155c
0000000000021660	mov	x8, #0x2d18
0000000000021664	movk	x8, #0x5444, lsl #16
0000000000021668	movk	x8, #0x21fb, lsl #32
000000000002166c	movk	x8, #0x4019, lsl #48
0000000000021670	fmov	d0, x8
0000000000021674	fmul	d0, d9, d0
0000000000021678	bl	0xa8ce8 ; symbol stub for: _sin
000000000002167c	mov.16b	v11, v0
0000000000021680	b	0x216e4
0000000000021684	cmp	w0, #0x2
0000000000021688	b.eq	0x216cc
000000000002168c	cmp	w0, #0x3
0000000000021690	b.ne	0x216e4
0000000000021694	fmov	d0, #0.25000000
0000000000021698	fcmp	d9, d0
000000000002169c	b.ls	0x215a4
00000000000216a0	fmov	d0, #0.75000000
00000000000216a4	fcmp	d9, d0
00000000000216a8	b.ge	0x215a4
00000000000216ac	fmov	d0, #-0.50000000
00000000000216b0	fadd	d0, d9, d0
00000000000216b4	fmov	d1, #-4.00000000
00000000000216b8	fmul	d11, d0, d1
00000000000216bc	fmov	d0, #1.00000000
00000000000216c0	fcmp	d11, d0
00000000000216c4	b.gt	0x216dc
00000000000216c8	b	0x216e4
00000000000216cc	fadd	d11, d9, d9
00000000000216d0	fmov	d0, #1.00000000
00000000000216d4	fcmp	d11, d0
00000000000216d8	b.le	0x216e4
00000000000216dc	fmov	d0, #-2.00000000
00000000000216e0	fadd	d11, d11, d0
00000000000216e4	fmul	d9, d13, d11
00000000000216e8	adrp	x1, 172 ; 0xcd000
00000000000216ec	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
00000000000216f0	add	x0, x19, #0x620
00000000000216f4	movi.2d	v0, #0000000000000000
00000000000216f8	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000216fc	cbz	w0, 0x21724
0000000000021700	fcmp	d13, #0.0
0000000000021704	b.le	0x21710
0000000000021708	fcmp	d9, #0.0
000000000002170c	b.mi	0x21720
0000000000021710	fcmp	d13, #0.0
0000000000021714	b.pl	0x21724
0000000000021718	fcmp	d9, #0.0
000000000002171c	b.le	0x21724
0000000000021720	fneg	d9, d9
0000000000021724	fadd	d8, d8, d9
0000000000021728	mov.16b	v0, v8
000000000002172c	ldp	x29, x30, [sp, #0x1e0]
0000000000021730	ldp	x20, x19, [sp, #0x1d0]
0000000000021734	ldp	x22, x21, [sp, #0x1c0]
0000000000021738	ldp	x24, x23, [sp, #0x1b0]
000000000002173c	ldp	x28, x27, [sp, #0x1a0]
0000000000021740	ldp	d9, d8, [sp, #0x190]
0000000000021744	ldp	d11, d10, [sp, #0x180]
0000000000021748	ldp	d13, d12, [sp, #0x170]
000000000002174c	ldp	d15, d14, [sp, #0x160]
0000000000021750	add	sp, sp, #0x1f0
0000000000021754	ret
```

## Align To

*Motion behavior · 191 files · 907 instances*

Keeps the object oriented toward / aligned with a target object.

Other observed parameters (not individually described): `Object`, `Align`, `To`, `Offset`, `Transition`, `Custom Amount`, `Align Frame`, `Ignore Sequencing`, `Alignment`, `End Offset`, `Target Alignment`, `Affect Subobjects`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZAlignToBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZAlignToBehavior`

#### `OZAlignToBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
00000000004149b0	sub	sp, sp, #0xc0
00000000004149b4	stp	d9, d8, [sp, #0x80]
00000000004149b8	stp	x22, x21, [sp, #0x90]
00000000004149bc	stp	x20, x19, [sp, #0xa0]
00000000004149c0	stp	x29, x30, [sp, #0xb0]
00000000004149c4	add	x29, sp, #0xb0
00000000004149c8	mov.16b	v8, v1
00000000004149cc	mov	x20, x1
00000000004149d0	mov	x19, x0
00000000004149d4	ldr	x8, [x0, #0x170]
00000000004149d8	ldr	x0, [x8, #0x20]
00000000004149dc	ldr	x8, [x0]
00000000004149e0	ldr	x9, [x8, #0x150]
00000000004149e4	add	x8, sp, #0x8
00000000004149e8	mov	x1, x2
00000000004149ec	blr	x9
00000000004149f0	ldur	q0, [sp, #0x8]
00000000004149f4	str	q0, [sp, #0x20]
00000000004149f8	ldr	x8, [sp, #0x18]
00000000004149fc	str	x8, [sp, #0x30]
0000000000414a00	ldr	x8, [x19]
0000000000414a04	ldr	x8, [x8, #0x128]
0000000000414a08	add	x1, sp, #0x20
0000000000414a0c	mov	x0, x19
0000000000414a10	mov	w2, #0x0
0000000000414a14	mov	w3, #0x1
0000000000414a18	mov	w4, #0x1
0000000000414a1c	blr	x8
0000000000414a20	cbz	w0, 0x414b64
0000000000414a24	add	x0, x19, #0x2e0
0000000000414a28	bl	__ZNK18OZChanSceneNodeRef7getNodeEv
0000000000414a2c	cbz	x0, 0x414b64
0000000000414a30	adrp	x1, 864 ; 0x774000
0000000000414a34	add	x1, x1, #0x928
0000000000414a38	adrp	x2, 878 ; 0x782000
0000000000414a3c	add	x2, x2, #0x6f0
0000000000414a40	mov	x3, #0x0
0000000000414a44	bl	0x5e9918 ; symbol stub for: ___dynamic_cast
0000000000414a48	cbz	x0, 0x414b64
0000000000414a4c	mov	x21, x0
0000000000414a50	ldr	x8, [x19]
0000000000414a54	ldr	x8, [x8, #0x140]
0000000000414a58	mov	x0, x19
0000000000414a5c	blr	x8
0000000000414a60	cbz	x0, 0x414b64
0000000000414a64	adrp	x1, 864 ; 0x774000
0000000000414a68	add	x1, x1, #0x928
0000000000414a6c	adrp	x2, 878 ; 0x782000
0000000000414a70	add	x2, x2, #0x6f0
0000000000414a74	mov	x3, #0x0
0000000000414a78	bl	0x5e9918 ; symbol stub for: ___dynamic_cast
0000000000414a7c	cbz	x0, 0x414b64
0000000000414a80	mov	x22, x0
0000000000414a84	add	x1, sp, #0x8
0000000000414a88	mov	x0, x19
0000000000414a8c	bl	__ZN17OZAlignToBehavior16computeMixFactorERK6CMTime
0000000000414a90	fabs	d0, d0
0000000000414a94	mov	x8, #0xaf48
0000000000414a98	movk	x8, #0x9abc, lsl #16
0000000000414a9c	movk	x8, #0xd7f2, lsl #32
0000000000414aa0	movk	x8, #0x3e7a, lsl #48
0000000000414aa4	fmov	d1, x8
0000000000414aa8	fcmp	d0, d1
0000000000414aac	b.mi	0x414b64
0000000000414ab0	add	x0, x19, #0x218
0000000000414ab4	bl	__ZNK9OZLocking15getLockingGroupEv
0000000000414ab8	mov	x1, x0
0000000000414abc	mov	x0, sp
0000000000414ac0	bl	__ZN14OZLockingGroup11WriteSentryC1EPS_
0000000000414ac4	mov	w8, #0x10dc
0000000000414ac8	ldrb	w8, [x19, x8]
0000000000414acc	tbnz	w8, #0x0, 0x414b5c
0000000000414ad0	cmp	w20, #0x2
0000000000414ad4	b.hi	0x414afc
0000000000414ad8	add	x4, sp, #0x8
0000000000414adc	mov	x0, x19
0000000000414ae0	mov	x1, x21
0000000000414ae4	mov	x2, x22
0000000000414ae8	mov	x3, x20
0000000000414aec	mov.16b	v0, v8
0000000000414af0	bl	__ZN17OZAlignToBehavior13solvePositionEP15OZTransformNodeS1_jRK6CMTimed
0000000000414af4	mov.16b	v8, v0
0000000000414af8	b	0x414b5c
0000000000414afc	add	x8, sp, #0x20
0000000000414b00	add	x3, sp, #0x8
0000000000414b04	mov	x0, x19
0000000000414b08	mov	x1, x21
0000000000414b0c	mov	x2, x22
0000000000414b10	bl	__ZN17OZAlignToBehavior17getSourceRotationEP15OZTransformNodeS1_RK6CMTime
0000000000414b14	cmp	w20, #0x5
0000000000414b18	b.eq	0x414b40
0000000000414b1c	cmp	w20, #0x4
0000000000414b20	b.eq	0x414b38
0000000000414b24	mov.16b	v9, v8
0000000000414b28	cmp	w20, #0x3
0000000000414b2c	b.ne	0x414b44
0000000000414b30	ldr	d9, [sp, #0x58]
0000000000414b34	b	0x414b44
0000000000414b38	ldr	d9, [sp, #0x60]
0000000000414b3c	b	0x414b44
0000000000414b40	ldr	d9, [sp, #0x68]
0000000000414b44	add	x1, sp, #0x8
0000000000414b48	mov	x0, x19
0000000000414b4c	bl	__ZN17OZAlignToBehavior16computeMixFactorERK6CMTime
0000000000414b50	fsub	d1, d9, d8
0000000000414b54	fmul	d0, d0, d1
0000000000414b58	fadd	d8, d8, d0
0000000000414b5c	mov	x0, sp
0000000000414b60	bl	__ZN14OZLockingGroup11WriteSentryD1Ev
0000000000414b64	mov.16b	v0, v8
0000000000414b68	ldp	x29, x30, [sp, #0xb0]
0000000000414b6c	ldp	x20, x19, [sp, #0xa0]
0000000000414b70	ldp	x22, x21, [sp, #0x90]
0000000000414b74	ldp	d9, d8, [sp, #0x80]
0000000000414b78	add	sp, sp, #0xc0
0000000000414b7c	ret
0000000000414b80	mov	x19, x0
0000000000414b84	mov	x0, sp
0000000000414b88	bl	__ZN14OZLockingGroup11WriteSentryD1Ev
0000000000414b8c	mov	x0, x19
0000000000414b90	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
```

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

### Decompiled code (ground truth)

This behavior (`OZRandomizeBehavior`) has **no behavior-specific per-frame method** in the binary: it evaluates through the shared `OZSingleChannelBehavior::solveNode` base together with a per-instance user/table curve — for Custom/Sequence/Randomize the actual shape comes from the saved keyframes / sequence table in the `.motn`, not from compiled code. The verbatim shared base solver Apple ships is shown below; regenerate with `venv/bin/python3 tools/re/disasm_behavior.py OZSingleChannelBehavior`.

#### `OZSingleChannelBehavior::solveNode(unsigned int, CMTime const&, double, double)`  (shared base)
```asm
0000000000358c74	mov.16b	v0, v1
0000000000358c78	ret
```

## Track

*Motion behavior · 146 files · 606 instances*

Drives the object's transform from tracking data (a Tracker), so it follows tracked screen motion.

| Parameter | What it controls |
|---|---|
| Source | Tracked source. |
| Tracker Root | Root of the tracker data. |
| Transform | Channels driven by the track. |

Other observed parameters (not individually described): `Align Tangents`, `Tracker`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZTrackerBehavior`). This `createTrackers` method is the behavior's **tracker setup (analysis-time)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method createTrackers OZTrackerBehavior`

#### `OZTrackerBehavior::createTrackers(unsigned int)`
```asm
000000000004f7e4	stp	x22, x21, [sp, #-0x30]!
000000000004f7e8	stp	x20, x19, [sp, #0x10]
000000000004f7ec	stp	x29, x30, [sp, #0x20]
000000000004f7f0	add	x29, sp, #0x20
000000000004f7f4	mov	x21, x1
000000000004f7f8	mov	x20, x0
000000000004f7fc	mov	w0, #0xb78
000000000004f800	bl	0xa8a60 ; symbol stub for: __Znwm
000000000004f804	mov	x19, x0
000000000004f808	mov	w0, #0x20
000000000004f80c	bl	0xa8a60 ; symbol stub for: __Znwm
000000000004f810	mov	x22, x0
000000000004f814	bl	0xa7efc ; symbol stub for: __ZN23OZTrackerMotionSpecificC1Ev
000000000004f818	add	x1, x20, #0x210
000000000004f81c	mov	x0, x19
000000000004f820	mov	x2, x22
000000000004f824	mov	w3, #0xcb
000000000004f828	mov	x4, x21
000000000004f82c	bl	0xa7c08 ; symbol stub for: __ZN19OZBloodhoundTrackerC1EP15OZChannelFolderP20OZTrackerAppSpecificjj
000000000004f830	str	x19, [x20, #0x490]
000000000004f834	mov	w0, #0x1200
000000000004f838	bl	0xa8a60 ; symbol stub for: __Znwm
000000000004f83c	mov	x19, x0
000000000004f840	mov	w0, #0x20
000000000004f844	bl	0xa8a60 ; symbol stub for: __Znwm
000000000004f848	mov	x22, x0
000000000004f84c	bl	0xa7efc ; symbol stub for: __ZN23OZTrackerMotionSpecificC1Ev
000000000004f850	add	x1, x20, #0x210
000000000004f854	mov	x0, x19
000000000004f858	mov	x2, x22
000000000004f85c	mov	w3, #0xca
000000000004f860	mov	x4, x21
000000000004f864	bl	__ZN14OZSensoTrackerC1EP15OZChannelFolderP20OZTrackerAppSpecificjj
000000000004f868	str	x19, [x20, #0x498]
000000000004f86c	mov	w0, #0x2440
000000000004f870	bl	0xa8a60 ; symbol stub for: __Znwm
000000000004f874	mov	x19, x0
000000000004f878	mov	w0, #0x20
000000000004f87c	bl	0xa8a60 ; symbol stub for: __Znwm
000000000004f880	mov	x22, x0
000000000004f884	bl	0xa7efc ; symbol stub for: __ZN23OZTrackerMotionSpecificC1Ev
000000000004f888	add	x1, x20, #0x210
000000000004f88c	mov	x0, x19
000000000004f890	mov	x2, x22
000000000004f894	mov	w3, #0xcc
000000000004f898	mov	x4, x21
000000000004f89c	bl	0xa7884 ; symbol stub for: __ZN15OZObjectTrackerC1EP15OZChannelFolderP20OZTrackerAppSpecificjj
000000000004f8a0	str	x19, [x20, #0x4a0]
000000000004f8a4	ldr	x8, [x20, #0x498]
000000000004f8a8	add	x0, x8, #0x18
000000000004f8ac	mov	w1, #0x2
000000000004f8b0	mov	w2, #0x0
000000000004f8b4	bl	0xa74ac ; symbol stub for: __ZN13OZChannelBase7setFlagEyb
000000000004f8b8	ldr	x8, [x20]
000000000004f8bc	ldr	x1, [x8, #0x2c0]
000000000004f8c0	mov	x0, x20
000000000004f8c4	ldp	x29, x30, [sp, #0x20]
000000000004f8c8	ldp	x20, x19, [sp, #0x10]
000000000004f8cc	ldp	x22, x21, [sp], #0x30
000000000004f8d0	br	x1
000000000004f8d4	b	0x4f8dc
000000000004f8d8	b	0x4f8dc
000000000004f8dc	mov	x20, x0
000000000004f8e0	mov	x0, x22
000000000004f8e4	bl	0xa89e8 ; symbol stub for: __ZdlPv
000000000004f8e8	mov	x0, x19
000000000004f8ec	bl	0xa89e8 ; symbol stub for: __ZdlPv
000000000004f8f0	mov	x0, x20
000000000004f8f4	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
000000000004f8f8	mov	x20, x0
000000000004f8fc	mov	x0, x19
000000000004f900	bl	0xa89e8 ; symbol stub for: __ZdlPv
000000000004f904	mov	x0, x20
000000000004f908	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
000000000004f90c	mov	x20, x0
000000000004f910	mov	x0, x19
000000000004f914	bl	0xa89e8 ; symbol stub for: __ZdlPv
000000000004f918	mov	x0, x20
000000000004f91c	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
000000000004f920	mov	x20, x0
000000000004f924	mov	x0, x19
000000000004f928	bl	0xa89e8 ; symbol stub for: __ZdlPv
000000000004f92c	mov	x0, x20
000000000004f930	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
```

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZWriggleBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZWriggleBehavior`

#### `OZWriggleBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
0000000000022d18	stp	d15, d14, [sp, #-0xa0]!
0000000000022d1c	stp	d13, d12, [sp, #0x10]
0000000000022d20	stp	d11, d10, [sp, #0x20]
0000000000022d24	stp	d9, d8, [sp, #0x30]
0000000000022d28	stp	x28, x27, [sp, #0x40]
0000000000022d2c	stp	x26, x25, [sp, #0x50]
0000000000022d30	stp	x24, x23, [sp, #0x60]
0000000000022d34	stp	x22, x21, [sp, #0x70]
0000000000022d38	stp	x20, x19, [sp, #0x80]
0000000000022d3c	stp	x29, x30, [sp, #0x90]
0000000000022d40	add	x29, sp, #0x90
0000000000022d44	sub	sp, sp, #0x170
0000000000022d48	mov.16b	v10, v1
0000000000022d4c	mov.16b	v9, v0
0000000000022d50	mov	x20, x2
0000000000022d54	mov	x22, x1
0000000000022d58	mov	x19, x0
0000000000022d5c	add	x23, sp, #0xb0
0000000000022d60	ldr	x8, [x0, #0x170]
0000000000022d64	ldr	x0, [x8, #0x20]
0000000000022d68	ldr	x8, [x0]
0000000000022d6c	ldr	x9, [x8, #0x150]
0000000000022d70	add	x8, sp, #0xf8
0000000000022d74	mov	x1, x2
0000000000022d78	blr	x9
0000000000022d7c	ldur	q0, [x23, #0x48]
0000000000022d80	str	q0, [sp, #0x80]
0000000000022d84	ldr	x8, [sp, #0x108]
0000000000022d88	str	x8, [sp, #0x90]
0000000000022d8c	ldr	x8, [x19]
0000000000022d90	ldr	x8, [x8, #0x128]
0000000000022d94	add	x1, sp, #0x80
0000000000022d98	mov	x0, x19
0000000000022d9c	mov	w2, #0x0
0000000000022da0	mov	w3, #0x1
0000000000022da4	mov	w4, #0x1
0000000000022da8	blr	x8
0000000000022dac	cbz	w0, 0x2396c
0000000000022db0	ldr	x8, [x19]
0000000000022db4	ldr	x8, [x8, #0x150]
0000000000022db8	mov	x0, x19
0000000000022dbc	blr	x8
0000000000022dc0	cbz	x0, 0x2396c
0000000000022dc4	ldur	q0, [x23, #0x48]
0000000000022dc8	str	q0, [sp, #0xe0]
0000000000022dcc	ldr	x8, [sp, #0x108]
0000000000022dd0	str	x8, [sp, #0xf0]
0000000000022dd4	adrp	x1, 171 ; 0xcd000
0000000000022dd8	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000022ddc	add	x0, x19, #0xbf8
0000000000022de0	movi.2d	v0, #0000000000000000
0000000000022de4	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000022de8	cbz	w0, 0x22e38
0000000000022dec	sub	x8, x29, #0xd0
0000000000022df0	add	x0, x19, #0x30
0000000000022df4	bl	0xa87c0 ; symbol stub for: __ZNK23OZChannelObjectRootBase13getTimeOffsetEv
0000000000022df8	ldr	q0, [sp, #0xe0]
0000000000022dfc	str	q0, [sp, #0xb0]
0000000000022e00	ldr	x8, [sp, #0xf0]
0000000000022e04	str	x8, [sp, #0xc0]
0000000000022e08	ldur	q0, [x29, #-0xd0]
0000000000022e0c	stur	q0, [x29, #-0xb0]
0000000000022e10	ldur	x8, [x29, #-0xc0]
0000000000022e14	stur	x8, [x29, #-0xa0]
0000000000022e18	add	x8, sp, #0x80
0000000000022e1c	add	x0, sp, #0xb0
0000000000022e20	sub	x1, x29, #0xb0
0000000000022e24	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000022e28	ldr	q0, [sp, #0x80]
0000000000022e2c	str	q0, [sp, #0xe0]
0000000000022e30	ldr	x8, [sp, #0x90]
0000000000022e34	str	x8, [sp, #0xf0]
0000000000022e38	str	w22, [sp, #0xb0]
0000000000022e3c	ldr	q0, [x20]
0000000000022e40	stur	q0, [x23, #0x4]
0000000000022e44	ldr	x8, [x20, #0x10]
0000000000022e48	stur	x8, [x23, #0x14]
0000000000022e4c	str	d9, [sp, #0xd0]
0000000000022e50	add	x0, x19, #0x370
0000000000022e54	bl	0xa762c ; symbol stub for: __ZN13PCSharedMutex11lock_sharedEv
0000000000022e58	add	x20, x19, #0x358
0000000000022e5c	add	x1, sp, #0xb0
0000000000022e60	mov	x0, x20
0000000000022e64	bl	__ZNSt3__16__treeINS_12__value_typeIN17OZWriggleBehavior13ValueCacheKeyENS2_15ValueCacheEntryEEENS_19__map_value_compareIS3_NS_4pairIKS3_S4_EENS2_11CompareKeysELb1EEENS_9allocatorIS9_EEE4findIS3_EENS_15__tree_iteratorIS5_PNS_11__tree_nodeIS5_PvEElEERKT_
0000000000022e68	add	x8, x19, #0x360
0000000000022e6c	cmp	x8, x0
0000000000022e70	b.eq	0x22e98
0000000000022e74	ldrb	w8, [x0, #0x58]
0000000000022e78	cmp	w8, #0x1
0000000000022e7c	b.ne	0x22e98
0000000000022e80	ldr	d0, [x0, #0x48]
0000000000022e84	fcmp	d10, d0
0000000000022e88	b.ne	0x22e98
0000000000022e8c	mov	w21, #0x0
0000000000022e90	ldr	d12, [x0, #0x50]
0000000000022e94	b	0x22e9c
0000000000022e98	mov	w21, #0x1
0000000000022e9c	add	x0, x19, #0x370
0000000000022ea0	bl	0xa7638 ; symbol stub for: __ZN13PCSharedMutex13unlock_sharedEv
0000000000022ea4	cbz	w21, 0x23968
0000000000022ea8	ldr	x8, [x19]
0000000000022eac	ldr	x9, [x8, #0x268]
0000000000022eb0	add	x8, sp, #0x80
0000000000022eb4	mov	x0, x19
0000000000022eb8	blr	x9
0000000000022ebc	ldr	q0, [sp, #0x80]
0000000000022ec0	stur	q0, [x29, #-0xf0]
0000000000022ec4	ldr	x8, [sp, #0x90]
0000000000022ec8	stur	x8, [x29, #-0xe0]
0000000000022ecc	ldr	x8, [x19]
0000000000022ed0	ldr	x8, [x8, #0x150]
0000000000022ed4	mov	x0, x19
0000000000022ed8	blr	x8
0000000000022edc	mov	x21, x0
0000000000022ee0	add	x0, x19, #0xac8
0000000000022ee4	add	x1, sp, #0xe0
0000000000022ee8	movi.2d	v0, #0000000000000000
0000000000022eec	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000022ef0	add	x8, sp, #0x50
0000000000022ef4	mov	x0, x21
0000000000022ef8	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
0000000000022efc	ldur	q0, [x29, #-0xf0]
0000000000022f00	stur	q0, [x29, #-0xb0]
0000000000022f04	ldur	x8, [x29, #-0xe0]
0000000000022f08	stur	x8, [x29, #-0xa0]
0000000000022f0c	ldr	q0, [sp, #0x50]
0000000000022f10	stur	q0, [x29, #-0xd0]
0000000000022f14	ldr	x8, [sp, #0x60]
0000000000022f18	stur	x8, [x29, #-0xc0]
0000000000022f1c	add	x24, sp, #0x68
0000000000022f20	add	x8, sp, #0x68
0000000000022f24	sub	x0, x29, #0xb0
0000000000022f28	sub	x1, x29, #0xd0
0000000000022f2c	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000022f30	add	x8, sp, #0x20
0000000000022f34	mov	x0, x19
0000000000022f38	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
0000000000022f3c	ldr	q0, [sp, #0x80]
0000000000022f40	stur	q0, [x29, #-0xb0]
0000000000022f44	ldr	x8, [sp, #0x90]
0000000000022f48	stur	x8, [x29, #-0xa0]
0000000000022f4c	ldur	q0, [sp, #0x98]
0000000000022f50	stur	q0, [x29, #-0xd0]
0000000000022f54	ldr	x8, [sp, #0xa8]
0000000000022f58	stur	x8, [x29, #-0xc0]
0000000000022f5c	sub	x8, x29, #0xf0
0000000000022f60	sub	x0, x29, #0xb0
0000000000022f64	sub	x1, x29, #0xd0
0000000000022f68	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000022f6c	ldur	q0, [x29, #-0xf0]
0000000000022f70	stur	q0, [x29, #-0xb0]
0000000000022f74	ldur	x8, [x29, #-0xe0]
0000000000022f78	stur	x8, [x29, #-0xa0]
0000000000022f7c	ldr	q0, [sp, #0x20]
0000000000022f80	stur	q0, [x29, #-0xd0]
0000000000022f84	ldr	x8, [sp, #0x30]
0000000000022f88	stur	x8, [x29, #-0xc0]
0000000000022f8c	add	x8, sp, #0x38
0000000000022f90	sub	x0, x29, #0xb0
0000000000022f94	sub	x1, x29, #0xd0
0000000000022f98	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000022f9c	ldr	x8, [x19]
0000000000022fa0	ldr	x8, [x8, #0x150]
0000000000022fa4	mov	x0, x19
0000000000022fa8	blr	x8
0000000000022fac	mov	x21, x0
0000000000022fb0	add	x0, x19, #0xb60
0000000000022fb4	add	x1, sp, #0xe0
0000000000022fb8	movi.2d	v0, #0000000000000000
0000000000022fbc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000022fc0	sub	x8, x29, #0xf0
0000000000022fc4	mov	x0, x21
0000000000022fc8	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
0000000000022fcc	ldur	q0, [sp, #0x38]
0000000000022fd0	stur	q0, [x29, #-0xb0]
0000000000022fd4	ldr	x8, [sp, #0x48]
0000000000022fd8	stur	x8, [x29, #-0xa0]
0000000000022fdc	ldur	q0, [x29, #-0xf0]
0000000000022fe0	stur	q0, [x29, #-0xd0]
0000000000022fe4	ldur	x8, [x29, #-0xe0]
0000000000022fe8	stur	x8, [x29, #-0xc0]
0000000000022fec	add	x21, sp, #0x50
0000000000022ff0	add	x8, sp, #0x50
0000000000022ff4	sub	x0, x29, #0xb0
0000000000022ff8	sub	x1, x29, #0xd0
0000000000022ffc	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000023000	ldur	q0, [x23, #0x48]
0000000000023004	stur	q0, [x29, #-0xb0]
0000000000023008	ldr	x8, [sp, #0x108]
000000000002300c	stur	x8, [x29, #-0xa0]
0000000000023010	ldur	q0, [sp, #0x68]
0000000000023014	stur	q0, [x29, #-0xd0]
0000000000023018	ldr	x8, [sp, #0x78]
000000000002301c	stur	x8, [x29, #-0xc0]
0000000000023020	sub	x0, x29, #0xb0
0000000000023024	sub	x1, x29, #0xd0
0000000000023028	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000002302c	tbnz	w0, #0x1f, 0x23068
0000000000023030	ldur	q0, [x23, #0x48]
0000000000023034	stur	q0, [x29, #-0xb0]
0000000000023038	ldr	x8, [sp, #0x108]
000000000002303c	stur	x8, [x29, #-0xa0]
0000000000023040	ldr	q0, [sp, #0x50]
0000000000023044	stur	q0, [x29, #-0xd0]
0000000000023048	ldr	x8, [sp, #0x60]
000000000002304c	stur	x8, [x29, #-0xc0]
0000000000023050	sub	x0, x29, #0xb0
0000000000023054	sub	x1, x29, #0xd0
0000000000023058	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
000000000002305c	cmp	w0, #0x0
0000000000023060	add	x8, sp, #0xf8
0000000000023064	csel	x24, x21, x8, gt
0000000000023068	ldr	q0, [x24]
000000000002306c	stur	q0, [x29, #-0xf0]
0000000000023070	ldr	x8, [x24, #0x10]
0000000000023074	stur	x8, [x29, #-0xe0]
0000000000023078	ldr	q0, [x24]
000000000002307c	stur	q0, [x29, #-0xb0]
0000000000023080	ldr	x8, [x24, #0x10]
0000000000023084	stur	x8, [x29, #-0xa0]
0000000000023088	ldur	q0, [sp, #0x68]
000000000002308c	stur	q0, [x29, #-0xd0]
0000000000023090	ldr	x8, [sp, #0x78]
0000000000023094	stur	x8, [x29, #-0xc0]
0000000000023098	sub	x8, x29, #0xf0
000000000002309c	sub	x0, x29, #0xb0
00000000000230a0	sub	x1, x29, #0xd0
00000000000230a4	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
00000000000230a8	add	x0, x19, #0xa30
00000000000230ac	add	x1, sp, #0xe0
00000000000230b0	movi.2d	v0, #0000000000000000
00000000000230b4	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000230b8	mov	x21, x0
00000000000230bc	add	x0, x19, #0x900
00000000000230c0	add	x1, sp, #0xe0
00000000000230c4	movi.2d	v0, #0000000000000000
00000000000230c8	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000230cc	cbnz	w0, 0x230f4
00000000000230d0	mov	x0, x19
00000000000230d4	bl	0xa87cc ; symbol stub for: __ZNK23OZSingleChannelBehavior11getChanBaseEv
00000000000230d8	cbz	x0, 0x230f4
00000000000230dc	mov	x0, x19
00000000000230e0	bl	0xa87cc ; symbol stub for: __ZNK23OZSingleChannelBehavior11getChanBaseEv
00000000000230e4	ldrb	w8, [x0, #0x39]
00000000000230e8	lsl	w8, w8, #27
00000000000230ec	and	w8, w22, w8, asr #31
00000000000230f0	eor	w21, w8, w21
00000000000230f4	add	x0, x19, #0x998
00000000000230f8	add	x1, sp, #0xe0
00000000000230fc	movi.2d	v0, #0000000000000000
0000000000023100	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000023104	cbz	w0, 0x23154
0000000000023108	mov	x0, x19
000000000002310c	bl	0xa87cc ; symbol stub for: __ZNK23OZSingleChannelBehavior11getChanBaseEv
0000000000023110	cbz	x0, 0x23154
0000000000023114	bl	0xa8634 ; symbol stub for: __ZNK13OZChannelBase20getObjectManipulatorEv
0000000000023118	cbz	x0, 0x23154
000000000002311c	ldr	x8, [x0]
0000000000023120	ldr	x8, [x8, #0xf8]
0000000000023124	blr	x8
0000000000023128	ldr	x8, [x0, #0x8]
000000000002312c	ldur	q0, [x8, #0x8]
0000000000023130	adrp	x8, 140 ; 0xaf000
0000000000023134	ldr	q1, [x8, #0x8a0]
0000000000023138	cmeq.4s	v0, v0, v1
000000000002313c	mvn.16b	v0, v0
0000000000023140	umaxv.4s	s0, v0
0000000000023144	fmov	w8, s0
0000000000023148	tbnz	w8, #0x0, 0x23154
000000000002314c	fcvtzu	w8, d9
0000000000023150	eor	w21, w21, w8
0000000000023154	add	x0, x19, #0x6a0
0000000000023158	add	x1, sp, #0xe0
000000000002315c	movi.2d	v0, #0000000000000000
0000000000023160	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000023164	mov.16b	v9, v0
0000000000023168	ldur	q0, [x29, #-0xf0]
000000000002316c	stur	q0, [x29, #-0xb0]
0000000000023170	ldur	x8, [x29, #-0xe0]
0000000000023174	stur	x8, [x29, #-0xa0]
0000000000023178	sub	x0, x29, #0xb0
000000000002317c	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
0000000000023180	fadd	d8, d9, d0
0000000000023184	add	x0, x19, #0x738
0000000000023188	add	x1, sp, #0xe0
000000000002318c	movi.2d	v0, #0000000000000000
0000000000023190	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000023194	mov	x22, x0
0000000000023198	add	x0, x19, #0x608
000000000002319c	add	x1, sp, #0xe0
00000000000231a0	movi.2d	v0, #0000000000000000
00000000000231a4	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000231a8	mov.16b	v9, v0
00000000000231ac	add	x0, x19, #0x7d0
00000000000231b0	add	x1, sp, #0xe0
00000000000231b4	movi.2d	v0, #0000000000000000
00000000000231b8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000231bc	str	d0, [sp, #0x18]
00000000000231c0	add	x0, x19, #0x868
00000000000231c4	add	x1, sp, #0xe0
00000000000231c8	movi.2d	v0, #0000000000000000
00000000000231cc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000231d0	str	d0, [sp, #0x10]
00000000000231d4	add	x0, x19, #0x508
00000000000231d8	add	x1, sp, #0xe0
00000000000231dc	movi.2d	v0, #0000000000000000
00000000000231e0	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000231e4	cmp	w0, #0x1
00000000000231e8	b.gt	0x23394
00000000000231ec	cbz	w0, 0x2352c
00000000000231f0	mov.16b	v12, v10
00000000000231f4	cmp	w0, #0x1
00000000000231f8	b.ne	0x238d8
00000000000231fc	cmp	w22, #0x1
0000000000023200	b.lt	0x2385c
0000000000023204	mov	w23, #0x0
0000000000023208	fadd	d0, d8, d8
000000000002320c	stp	d10, d0, [sp]
0000000000023210	adrp	x8, 219 ; 0xfe000
0000000000023214	ldr	w24, [x8, #0xda0]
0000000000023218	adrp	x8, 219 ; 0xfe000
000000000002321c	ldr	w25, [x8, #0xda4]
0000000000023220	adrp	x8, 219 ; 0xfe000
0000000000023224	ldr	w26, [x8, #0xda8]
0000000000023228	mov	x8, #0xffffffc00000
000000000002322c	movk	x8, #0x41df, lsl #48
0000000000023230	fmov	d13, x8
0000000000023234	mov	x8, #0x2d18
0000000000023238	movk	x8, #0x5444, lsl #16
000000000002323c	movk	x8, #0x21fb, lsl #32
0000000000023240	movk	x8, #0x4009, lsl #48
0000000000023244	fmov	d14, x8
0000000000023248	mov	w27, #0x79b9
000000000002324c	movk	w27, #0x9e37, lsl #16
0000000000023250	fmov	d10, #-1.00000000
0000000000023254	movi.2d	v15, #0000000000000000
0000000000023258	fmov	d8, #1.00000000
000000000002325c	fmov	d12, #1.00000000
0000000000023260	ldr	d0, [sp, #0x8]
0000000000023264	fmul	d0, d0, d9
0000000000023268	fcvtzs	w8, d0
000000000002326c	cbz	w8, 0x232cc
0000000000023270	mov	w9, #-0x20
0000000000023274	mov	w10, #0x79b9
0000000000023278	movk	w10, #0x9e37, lsl #16
000000000002327c	mov	x11, x23
0000000000023280	mov	x12, x21
0000000000023284	add	w13, w8, w12, lsl #4
0000000000023288	add	w14, w12, w10
000000000002328c	eor	w13, w13, w14
0000000000023290	add	w14, w24, w12, lsr #5
0000000000023294	eor	w13, w13, w14
0000000000023298	add	w11, w13, w11
000000000002329c	add	w13, w10, w11
00000000000232a0	add	w14, w25, w11, lsl #4
00000000000232a4	eor	w13, w14, w13
00000000000232a8	add	w14, w26, w11, lsr #5
00000000000232ac	eor	w13, w13, w14
00000000000232b0	add	w12, w13, w12
00000000000232b4	add	w10, w10, w27
00000000000232b8	adds	w9, w9, #0x1
00000000000232bc	b.lo	0x23284
00000000000232c0	eor	w9, w12, w11
00000000000232c4	scvtf	d1, w9
00000000000232c8	fdiv	d10, d1, d13
00000000000232cc	add	w9, w8, #0x1
00000000000232d0	mov	w10, #-0x20
00000000000232d4	mov	w11, #0x79b9
00000000000232d8	movk	w11, #0x9e37, lsl #16
00000000000232dc	mov	x12, x23
00000000000232e0	mov	x13, x21
00000000000232e4	add	w14, w9, w13, lsl #4
00000000000232e8	add	w15, w13, w11
00000000000232ec	eor	w14, w14, w15
00000000000232f0	add	w15, w24, w13, lsr #5
00000000000232f4	eor	w14, w14, w15
00000000000232f8	add	w12, w14, w12
00000000000232fc	add	w14, w11, w12
0000000000023300	add	w15, w25, w12, lsl #4
0000000000023304	eor	w14, w15, w14
0000000000023308	add	w15, w26, w12, lsr #5
000000000002330c	eor	w14, w14, w15
0000000000023310	add	w13, w14, w13
0000000000023314	add	w11, w11, w27
0000000000023318	adds	w10, w10, #0x1
000000000002331c	b.lo	0x232e4
0000000000023320	eor	w9, w13, w12
0000000000023324	scvtf	d1, w9
0000000000023328	fdiv	d11, d1, d13
000000000002332c	scvtf	d1, w8
0000000000023330	fsub	d0, d0, d1
0000000000023334	fmul	d0, d0, d14
0000000000023338	bl	0xa8b14 ; symbol stub for: _cos
000000000002333c	fsub	d0, d8, d0
0000000000023340	fmov	d1, #0.50000000
0000000000023344	fmul	d0, d0, d1
0000000000023348	fsub	d1, d8, d0
000000000002334c	fmul	d1, d1, d10
0000000000023350	fmul	d0, d0, d11
0000000000023354	fadd	d0, d1, d0
0000000000023358	fmul	d0, d12, d0
000000000002335c	fadd	d15, d15, d0
0000000000023360	ldp	d0, d1, [sp, #0x10]
0000000000023364	fmul	d9, d1, d9
0000000000023368	fmul	d12, d0, d12
000000000002336c	add	w23, w23, #0x1
0000000000023370	movi.2d	v10, #0000000000000000
0000000000023374	cmp	w23, w22
0000000000023378	b.ne	0x23260
000000000002337c	fmov	d0, #1.00000000
0000000000023380	fadd	d0, d15, d0
0000000000023384	fmov	d1, #0.50000000
0000000000023388	fmul	d8, d0, d1
000000000002338c	ldr	d10, [sp]
0000000000023390	b	0x23860
0000000000023394	cmp	w0, #0x2
0000000000023398	b.eq	0x236c4
000000000002339c	mov.16b	v12, v10
00000000000233a0	cmp	w0, #0x3
00000000000233a4	b.ne	0x238d8
00000000000233a8	str	d10, [sp]
00000000000233ac	cmp	w22, #0x1
00000000000233b0	b.lt	0x2387c
00000000000233b4	mov	w23, #0x0
00000000000233b8	fadd	d0, d8, d8
00000000000233bc	str	d0, [sp, #0x8]
00000000000233c0	adrp	x8, 219 ; 0xfe000
00000000000233c4	ldr	w24, [x8, #0xda0]
00000000000233c8	adrp	x8, 219 ; 0xfe000
00000000000233cc	ldr	w25, [x8, #0xda4]
00000000000233d0	adrp	x8, 219 ; 0xfe000
00000000000233d4	ldr	w26, [x8, #0xda8]
00000000000233d8	mov	x8, #0xffffffc00000
00000000000233dc	movk	x8, #0x41df, lsl #48
00000000000233e0	fmov	d14, x8
00000000000233e4	mov	x8, #0x2d18
00000000000233e8	movk	x8, #0x5444, lsl #16
00000000000233ec	movk	x8, #0x21fb, lsl #32
00000000000233f0	movk	x8, #0x4009, lsl #48
00000000000233f4	fmov	d15, x8
00000000000233f8	mov	w27, #0x79b9
00000000000233fc	movk	w27, #0x9e37, lsl #16
0000000000023400	movi.2d	v13, #0000000000000000
0000000000023404	fmov	d8, #1.00000000
0000000000023408	fmov	d12, #1.00000000
000000000002340c	ldr	d0, [sp, #0x8]
0000000000023410	fmul	d0, d0, d9
0000000000023414	fcvtzs	w8, d0
0000000000023418	movi.2d	v10, #0000000000000000
000000000002341c	cbz	w8, 0x2347c
0000000000023420	mov	w9, #-0x20
0000000000023424	mov	w10, #0x79b9
0000000000023428	movk	w10, #0x9e37, lsl #16
000000000002342c	mov	x11, x23
0000000000023430	mov	x12, x21
0000000000023434	add	w13, w8, w12, lsl #4
0000000000023438	add	w14, w12, w10
000000000002343c	eor	w13, w13, w14
0000000000023440	add	w14, w24, w12, lsr #5
0000000000023444	eor	w13, w13, w14
0000000000023448	add	w11, w13, w11
000000000002344c	add	w13, w10, w11
0000000000023450	add	w14, w25, w11, lsl #4
0000000000023454	eor	w13, w14, w13
0000000000023458	add	w14, w26, w11, lsr #5
000000000002345c	eor	w13, w13, w14
0000000000023460	add	w12, w13, w12
0000000000023464	add	w10, w10, w27
0000000000023468	adds	w9, w9, #0x1
000000000002346c	b.lo	0x23434
0000000000023470	eor	w9, w12, w11
0000000000023474	scvtf	d1, w9
0000000000023478	fdiv	d10, d1, d14
000000000002347c	add	w9, w8, #0x1
0000000000023480	mov	w10, #-0x20
0000000000023484	mov	w11, #0x79b9
0000000000023488	movk	w11, #0x9e37, lsl #16
000000000002348c	mov	x12, x23
0000000000023490	mov	x13, x21
0000000000023494	add	w14, w9, w13, lsl #4
0000000000023498	add	w15, w13, w11
000000000002349c	eor	w14, w14, w15
00000000000234a0	add	w15, w24, w13, lsr #5
00000000000234a4	eor	w14, w14, w15
00000000000234a8	add	w12, w14, w12
00000000000234ac	add	w14, w11, w12
00000000000234b0	add	w15, w25, w12, lsl #4
00000000000234b4	eor	w14, w15, w14
00000000000234b8	add	w15, w26, w12, lsr #5
00000000000234bc	eor	w14, w14, w15
00000000000234c0	add	w13, w14, w13
00000000000234c4	add	w11, w11, w27
00000000000234c8	adds	w10, w10, #0x1
00000000000234cc	b.lo	0x23494
00000000000234d0	eor	w9, w13, w12
00000000000234d4	scvtf	d1, w9
00000000000234d8	fdiv	d11, d1, d14
00000000000234dc	scvtf	d1, w8
00000000000234e0	fsub	d0, d0, d1
00000000000234e4	fmul	d0, d0, d15
00000000000234e8	bl	0xa8b14 ; symbol stub for: _cos
00000000000234ec	fsub	d0, d8, d0
00000000000234f0	fmov	d1, #0.50000000
00000000000234f4	fmul	d0, d0, d1
00000000000234f8	fsub	d1, d8, d0
00000000000234fc	fmul	d1, d1, d10
0000000000023500	fmul	d0, d0, d11
0000000000023504	fadd	d0, d1, d0
0000000000023508	fmul	d0, d12, d0
000000000002350c	fadd	d13, d13, d0
0000000000023510	ldp	d0, d1, [sp, #0x10]
0000000000023514	fmul	d9, d1, d9
0000000000023518	fmul	d12, d0, d12
000000000002351c	add	w23, w23, #0x1
0000000000023520	cmp	w23, w22
0000000000023524	b.ne	0x2340c
0000000000023528	b	0x23880
000000000002352c	cmp	w22, #0x1
0000000000023530	b.lt	0x2389c
0000000000023534	mov	w23, #0x0
0000000000023538	fadd	d0, d8, d8
000000000002353c	stp	d10, d0, [sp]
0000000000023540	adrp	x8, 219 ; 0xfe000
0000000000023544	ldr	w24, [x8, #0xda0]
0000000000023548	adrp	x8, 219 ; 0xfe000
000000000002354c	ldr	w25, [x8, #0xda4]
0000000000023550	adrp	x8, 219 ; 0xfe000
0000000000023554	ldr	w26, [x8, #0xda8]
0000000000023558	mov	x8, #0xffffffc00000
000000000002355c	movk	x8, #0x41df, lsl #48
0000000000023560	fmov	d13, x8
0000000000023564	mov	x8, #0x2d18
0000000000023568	movk	x8, #0x5444, lsl #16
000000000002356c	movk	x8, #0x21fb, lsl #32
0000000000023570	movk	x8, #0x4009, lsl #48
0000000000023574	fmov	d14, x8
0000000000023578	mov	w27, #0x79b9
000000000002357c	movk	w27, #0x9e37, lsl #16
0000000000023580	fmov	d10, #-1.00000000
0000000000023584	movi.2d	v15, #0000000000000000
0000000000023588	fmov	d8, #1.00000000
000000000002358c	fmov	d12, #1.00000000
0000000000023590	ldr	d0, [sp, #0x8]
0000000000023594	fmul	d0, d0, d9
0000000000023598	fcvtzs	w8, d0
000000000002359c	cbz	w8, 0x235fc
00000000000235a0	mov	w9, #-0x20
00000000000235a4	mov	w10, #0x79b9
00000000000235a8	movk	w10, #0x9e37, lsl #16
00000000000235ac	mov	x11, x23
00000000000235b0	mov	x12, x21
00000000000235b4	add	w13, w8, w12, lsl #4
00000000000235b8	add	w14, w12, w10
00000000000235bc	eor	w13, w13, w14
00000000000235c0	add	w14, w24, w12, lsr #5
00000000000235c4	eor	w13, w13, w14
00000000000235c8	add	w11, w13, w11
00000000000235cc	add	w13, w10, w11
00000000000235d0	add	w14, w25, w11, lsl #4
00000000000235d4	eor	w13, w14, w13
00000000000235d8	add	w14, w26, w11, lsr #5
00000000000235dc	eor	w13, w13, w14
00000000000235e0	add	w12, w13, w12
00000000000235e4	add	w10, w10, w27
00000000000235e8	adds	w9, w9, #0x1
00000000000235ec	b.lo	0x235b4
00000000000235f0	eor	w9, w12, w11
00000000000235f4	scvtf	d1, w9
00000000000235f8	fdiv	d10, d1, d13
00000000000235fc	add	w9, w8, #0x1
0000000000023600	mov	w10, #-0x20
0000000000023604	mov	w11, #0x79b9
0000000000023608	movk	w11, #0x9e37, lsl #16
000000000002360c	mov	x12, x23
0000000000023610	mov	x13, x21
0000000000023614	add	w14, w9, w13, lsl #4
0000000000023618	add	w15, w13, w11
000000000002361c	eor	w14, w14, w15
0000000000023620	add	w15, w24, w13, lsr #5
0000000000023624	eor	w14, w14, w15
0000000000023628	add	w12, w14, w12
000000000002362c	add	w14, w11, w12
0000000000023630	add	w15, w25, w12, lsl #4
0000000000023634	eor	w14, w15, w14
0000000000023638	add	w15, w26, w12, lsr #5
000000000002363c	eor	w14, w14, w15
0000000000023640	add	w13, w14, w13
0000000000023644	add	w11, w11, w27
0000000000023648	adds	w10, w10, #0x1
000000000002364c	b.lo	0x23614
0000000000023650	eor	w9, w13, w12
0000000000023654	scvtf	d1, w9
0000000000023658	fdiv	d11, d1, d13
000000000002365c	scvtf	d1, w8
0000000000023660	fsub	d0, d0, d1
0000000000023664	fmul	d0, d0, d14
0000000000023668	bl	0xa8b14 ; symbol stub for: _cos
000000000002366c	fsub	d0, d8, d0
0000000000023670	fmov	d1, #0.50000000
0000000000023674	fmul	d0, d0, d1
0000000000023678	fsub	d1, d8, d0
000000000002367c	fmul	d1, d1, d10
0000000000023680	fmul	d0, d0, d11
0000000000023684	fadd	d0, d1, d0
0000000000023688	fmul	d0, d12, d0
000000000002368c	fadd	d15, d15, d0
0000000000023690	ldp	d0, d1, [sp, #0x10]
0000000000023694	fmul	d9, d1, d9
0000000000023698	fmul	d12, d0, d12
000000000002369c	add	w23, w23, #0x1
00000000000236a0	movi.2d	v10, #0000000000000000
00000000000236a4	cmp	w23, w22
00000000000236a8	b.ne	0x23590
00000000000236ac	fmov	d0, #1.00000000
00000000000236b0	fadd	d0, d15, d0
00000000000236b4	fmov	d1, #0.50000000
00000000000236b8	fmul	d8, d0, d1
00000000000236bc	ldr	d10, [sp]
00000000000236c0	b	0x238a0
00000000000236c4	cmp	w22, #0x1
00000000000236c8	b.lt	0x238bc
00000000000236cc	mov	w23, #0x0
00000000000236d0	fadd	d0, d8, d8
00000000000236d4	stp	d10, d0, [sp]
00000000000236d8	adrp	x8, 219 ; 0xfe000
00000000000236dc	ldr	w24, [x8, #0xda0]
00000000000236e0	adrp	x8, 219 ; 0xfe000
00000000000236e4	ldr	w25, [x8, #0xda4]
00000000000236e8	adrp	x8, 219 ; 0xfe000
00000000000236ec	ldr	w26, [x8, #0xda8]
00000000000236f0	mov	x8, #0xffffffc00000
00000000000236f4	movk	x8, #0x41df, lsl #48
00000000000236f8	fmov	d13, x8
00000000000236fc	mov	x8, #0x2d18
0000000000023700	movk	x8, #0x5444, lsl #16
0000000000023704	movk	x8, #0x21fb, lsl #32
0000000000023708	movk	x8, #0x4009, lsl #48
000000000002370c	fmov	d15, x8
0000000000023710	mov	w27, #0x79b9
0000000000023714	movk	w27, #0x9e37, lsl #16
0000000000023718	movi.2d	v14, #0000000000000000
000000000002371c	fmov	d8, #1.00000000
0000000000023720	fmov	d12, #1.00000000
0000000000023724	fmov	d10, #1.00000000
0000000000023728	ldr	d0, [sp, #0x8]
000000000002372c	fmul	d0, d0, d9
0000000000023730	fcvtzs	w8, d0
0000000000023734	cbz	w8, 0x23794
0000000000023738	mov	w9, #-0x20
000000000002373c	mov	w10, #0x79b9
0000000000023740	movk	w10, #0x9e37, lsl #16
0000000000023744	mov	x11, x23
0000000000023748	mov	x12, x21
000000000002374c	add	w13, w8, w12, lsl #4
0000000000023750	add	w14, w12, w10
0000000000023754	eor	w13, w13, w14
0000000000023758	add	w14, w24, w12, lsr #5
000000000002375c	eor	w13, w13, w14
0000000000023760	add	w11, w13, w11
0000000000023764	add	w13, w10, w11
0000000000023768	add	w14, w25, w11, lsl #4
000000000002376c	eor	w13, w14, w13
0000000000023770	add	w14, w26, w11, lsr #5
0000000000023774	eor	w13, w13, w14
0000000000023778	add	w12, w13, w12
000000000002377c	add	w10, w10, w27
0000000000023780	adds	w9, w9, #0x1
0000000000023784	b.lo	0x2374c
0000000000023788	eor	w9, w12, w11
000000000002378c	scvtf	d1, w9
0000000000023790	fdiv	d10, d1, d13
0000000000023794	add	w9, w8, #0x1
0000000000023798	mov	w10, #-0x20
000000000002379c	mov	w11, #0x79b9
00000000000237a0	movk	w11, #0x9e37, lsl #16
00000000000237a4	mov	x12, x23
00000000000237a8	mov	x13, x21
00000000000237ac	add	w14, w9, w13, lsl #4
00000000000237b0	add	w15, w13, w11
00000000000237b4	eor	w14, w14, w15
00000000000237b8	add	w15, w24, w13, lsr #5
00000000000237bc	eor	w14, w14, w15
00000000000237c0	add	w12, w14, w12
00000000000237c4	add	w14, w11, w12
00000000000237c8	add	w15, w25, w12, lsl #4
00000000000237cc	eor	w14, w15, w14
00000000000237d0	add	w15, w26, w12, lsr #5
00000000000237d4	eor	w14, w14, w15
00000000000237d8	add	w13, w14, w13
00000000000237dc	add	w11, w11, w27
00000000000237e0	adds	w10, w10, #0x1
00000000000237e4	b.lo	0x237ac
00000000000237e8	eor	w9, w13, w12
00000000000237ec	scvtf	d1, w9
00000000000237f0	fdiv	d11, d1, d13
00000000000237f4	scvtf	d1, w8
00000000000237f8	fsub	d0, d0, d1
00000000000237fc	fmul	d0, d0, d15
0000000000023800	bl	0xa8b14 ; symbol stub for: _cos
0000000000023804	fsub	d0, d8, d0
0000000000023808	fmov	d1, #0.50000000
000000000002380c	fmul	d0, d0, d1
0000000000023810	fsub	d1, d8, d0
0000000000023814	fmul	d1, d1, d10
0000000000023818	fmul	d0, d0, d11
000000000002381c	fadd	d0, d1, d0
0000000000023820	fmul	d0, d12, d0
0000000000023824	fadd	d14, d14, d0
0000000000023828	ldp	d0, d1, [sp, #0x10]
000000000002382c	fmul	d9, d1, d9
0000000000023830	fmul	d12, d0, d12
0000000000023834	add	w23, w23, #0x1
0000000000023838	movi.2d	v10, #0000000000000000
000000000002383c	cmp	w23, w22
0000000000023840	b.ne	0x23728
0000000000023844	fmov	d0, #1.00000000
0000000000023848	fadd	d0, d14, d0
000000000002384c	fmov	d1, #0.50000000
0000000000023850	fmul	d8, d0, d1
0000000000023854	ldr	d10, [sp]
0000000000023858	b	0x238c0
000000000002385c	fmov	d8, #0.50000000
0000000000023860	add	x0, x19, #0x3d8
0000000000023864	add	x1, sp, #0xe0
0000000000023868	movi.2d	v0, #0000000000000000
000000000002386c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000023870	fmul	d0, d0, d8
0000000000023874	fsub	d12, d10, d0
0000000000023878	b	0x238d8
000000000002387c	movi.2d	v13, #0000000000000000
0000000000023880	add	x0, x19, #0x3d8
0000000000023884	add	x1, sp, #0xe0
0000000000023888	movi.2d	v0, #0000000000000000
000000000002388c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000023890	fmul	d0, d13, d0
0000000000023894	ldr	d10, [sp]
0000000000023898	b	0x238b4
000000000002389c	fmov	d8, #0.50000000
00000000000238a0	add	x0, x19, #0x3d8
00000000000238a4	add	x1, sp, #0xe0
00000000000238a8	movi.2d	v0, #0000000000000000
00000000000238ac	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000238b0	fmul	d0, d0, d8
00000000000238b4	fadd	d12, d10, d0
00000000000238b8	b	0x238d8
00000000000238bc	fmov	d8, #0.50000000
00000000000238c0	add	x0, x19, #0x470
00000000000238c4	add	x1, sp, #0xe0
00000000000238c8	movi.2d	v0, #0000000000000000
00000000000238cc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000238d0	fmul	d0, d0, d8
00000000000238d4	fmul	d12, d10, d0
00000000000238d8	add	x0, x19, #0x370
00000000000238dc	bl	0xa7644 ; symbol stub for: __ZN13PCSharedMutex4lockEv
00000000000238e0	sub	x1, x29, #0xb0
00000000000238e4	add	x2, sp, #0xb0
00000000000238e8	mov	x0, x20
00000000000238ec	bl	__ZNSt3__16__treeINS_12__value_typeIN17OZWriggleBehavior13ValueCacheKeyENS2_15ValueCacheEntryEEENS_19__map_value_compareIS3_NS_4pairIKS3_S4_EENS2_11CompareKeysELb1EEENS_9allocatorIS9_EEE12__find_equalIS3_EERPNS_16__tree_node_baseIPvEERPNS_15__tree_end_nodeISJ_EERKT_
00000000000238f0	mov	x22, x0
00000000000238f4	ldr	x21, [x0]
00000000000238f8	cbnz	x21, 0x23954
00000000000238fc	mov	w0, #0x60
0000000000023900	bl	0xa8a60 ; symbol stub for: __Znwm
0000000000023904	mov	x21, x0
0000000000023908	ldp	q0, q1, [sp, #0xb0]
000000000002390c	stp	q0, q1, [x0, #0x20]
0000000000023910	ldr	x8, [sp, #0xd0]
0000000000023914	stp	x8, xzr, [x0, #0x40]
0000000000023918	stp	xzr, xzr, [x0, #0x50]
000000000002391c	ldur	x8, [x29, #-0xb0]
0000000000023920	stp	xzr, xzr, [x0]
0000000000023924	str	x8, [x0, #0x10]
0000000000023928	str	x0, [x22]
000000000002392c	ldr	x8, [x20]
0000000000023930	ldr	x8, [x8]
0000000000023934	cbz	x8, 0x2393c
0000000000023938	str	x8, [x20]
000000000002393c	ldr	x0, [x19, #0x360]
0000000000023940	mov	x1, x21
0000000000023944	bl	__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_
0000000000023948	ldr	x8, [x19, #0x368]
000000000002394c	add	x8, x8, #0x1
0000000000023950	str	x8, [x19, #0x368]
0000000000023954	stp	d10, d12, [x21, #0x48]
0000000000023958	mov	w8, #0x1
000000000002395c	strb	w8, [x21, #0x58]
0000000000023960	add	x0, x19, #0x370
0000000000023964	bl	0xa7650 ; symbol stub for: __ZN13PCSharedMutex6unlockEv
0000000000023968	mov.16b	v10, v12
000000000002396c	mov.16b	v0, v10
0000000000023970	add	sp, sp, #0x170
0000000000023974	ldp	x29, x30, [sp, #0x90]
0000000000023978	ldp	x20, x19, [sp, #0x80]
000000000002397c	ldp	x22, x21, [sp, #0x70]
0000000000023980	ldp	x24, x23, [sp, #0x60]
0000000000023984	ldp	x26, x25, [sp, #0x50]
0000000000023988	ldp	x28, x27, [sp, #0x40]
000000000002398c	ldp	d9, d8, [sp, #0x30]
0000000000023990	ldp	d11, d10, [sp, #0x20]
0000000000023994	ldp	d13, d12, [sp, #0x10]
0000000000023998	ldp	d15, d14, [sp], #0xa0
000000000002399c	ret
00000000000239a0	bl	___clang_call_terminate
00000000000239a4	mov	x20, x0
00000000000239a8	add	x0, x19, #0x370
00000000000239ac	bl	0xa7650 ; symbol stub for: __ZN13PCSharedMutex6unlockEv
00000000000239b0	b	0x239c8
00000000000239b4	bl	___clang_call_terminate
00000000000239b8	bl	___clang_call_terminate
00000000000239bc	mov	x20, x0
00000000000239c0	add	x0, x19, #0x370
00000000000239c4	bl	0xa7638 ; symbol stub for: __ZN13PCSharedMutex13unlock_sharedEv
00000000000239c8	mov	x0, x20
00000000000239cc	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
00000000000239d0	bl	___clang_call_terminate
```

## Negate

*Parameter behavior · 83 files · 120 instances*

Inverts the source parameter value (multiplies by −1) every frame.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZNegateBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZNegateBehavior`

#### `OZNegateBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
000000000001fa08	sub	sp, sp, #0x60
000000000001fa0c	stp	d9, d8, [sp, #0x30]
000000000001fa10	stp	x20, x19, [sp, #0x40]
000000000001fa14	stp	x29, x30, [sp, #0x50]
000000000001fa18	add	x29, sp, #0x50
000000000001fa1c	mov.16b	v8, v1
000000000001fa20	mov	x1, x2
000000000001fa24	mov	x19, x0
000000000001fa28	ldr	x8, [x0, #0x170]
000000000001fa2c	ldr	x0, [x8, #0x20]
000000000001fa30	ldr	x8, [x0]
000000000001fa34	ldr	x9, [x8, #0x150]
000000000001fa38	add	x8, sp, #0x18
000000000001fa3c	blr	x9
000000000001fa40	ldur	q0, [sp, #0x18]
000000000001fa44	str	q0, [sp]
000000000001fa48	ldr	x8, [sp, #0x28]
000000000001fa4c	str	x8, [sp, #0x10]
000000000001fa50	ldr	x8, [x19]
000000000001fa54	ldr	x8, [x8, #0x128]
000000000001fa58	mov	x1, sp
000000000001fa5c	mov	x0, x19
000000000001fa60	mov	w2, #0x0
000000000001fa64	mov	w3, #0x1
000000000001fa68	mov	w4, #0x1
000000000001fa6c	blr	x8
000000000001fa70	fneg	d0, d8
000000000001fa74	cmp	w0, #0x0
000000000001fa78	fcsel	d0, d0, d8, ne
000000000001fa7c	ldp	x29, x30, [sp, #0x50]
000000000001fa80	ldp	x20, x19, [sp, #0x40]
000000000001fa84	ldp	d9, d8, [sp, #0x30]
000000000001fa88	add	sp, sp, #0x60
000000000001fa8c	ret
```

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `BHOvershootBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode BHOvershootBehavior`

#### `BHOvershootBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
00000000000258cc	sub	sp, sp, #0x180
00000000000258d0	stp	d15, d14, [sp, #0x100]
00000000000258d4	stp	d13, d12, [sp, #0x110]
00000000000258d8	stp	d11, d10, [sp, #0x120]
00000000000258dc	stp	d9, d8, [sp, #0x130]
00000000000258e0	stp	x28, x27, [sp, #0x140]
00000000000258e4	stp	x22, x21, [sp, #0x150]
00000000000258e8	stp	x20, x19, [sp, #0x160]
00000000000258ec	stp	x29, x30, [sp, #0x170]
00000000000258f0	add	x29, sp, #0x170
00000000000258f4	mov.16b	v8, v1
00000000000258f8	mov	x1, x2
00000000000258fc	mov	x19, x0
0000000000025900	ldr	x8, [x0, #0x170]
0000000000025904	ldr	x0, [x8, #0x20]
0000000000025908	ldr	x8, [x0]
000000000002590c	ldr	x9, [x8, #0x150]
0000000000025910	add	x8, sp, #0x90
0000000000025914	blr	x9
0000000000025918	ldr	q0, [sp, #0x90]
000000000002591c	str	q0, [sp, #0x60]
0000000000025920	ldr	x8, [sp, #0xa0]
0000000000025924	str	x8, [sp, #0x70]
0000000000025928	ldr	x8, [x19]
000000000002592c	ldr	x8, [x8, #0x128]
0000000000025930	add	x1, sp, #0x60
0000000000025934	mov	x0, x19
0000000000025938	mov	w2, #0x0
000000000002593c	mov	w3, #0x1
0000000000025940	mov	w4, #0x1
0000000000025944	blr	x8
0000000000025948	cbz	w0, 0x25b38
000000000002594c	ldr	x8, [x19]
0000000000025950	ldr	x8, [x8, #0x150]
0000000000025954	mov	x0, x19
0000000000025958	blr	x8
000000000002595c	cbz	x0, 0x25b38
0000000000025960	add	x22, sp, #0xa8
0000000000025964	ldr	x8, [x19]
0000000000025968	ldr	x9, [x8, #0x268]
000000000002596c	add	x8, sp, #0x60
0000000000025970	mov	x0, x19
0000000000025974	blr	x9
0000000000025978	ldr	q0, [sp, #0x60]
000000000002597c	stur	q0, [x29, #-0x90]
0000000000025980	ldr	x8, [sp, #0x70]
0000000000025984	stur	x8, [x29, #-0x80]
0000000000025988	ldr	x8, [x19]
000000000002598c	ldr	x8, [x8, #0x150]
0000000000025990	mov	x0, x19
0000000000025994	blr	x8
0000000000025998	mov	x21, x0
000000000002599c	adrp	x20, 168 ; 0xcd000
00000000000259a0	ldr	x20, [x20, #0x520] ; literal pool symbol address: _kCMTimeZero
00000000000259a4	add	x0, x19, #0x650
00000000000259a8	movi.2d	v0, #0000000000000000
00000000000259ac	mov	x1, x20
00000000000259b0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000259b4	add	x8, sp, #0xa8
00000000000259b8	mov	x0, x21
00000000000259bc	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
00000000000259c0	ldr	q0, [x22]
00000000000259c4	stur	q0, [x29, #-0xb0]
00000000000259c8	ldr	x8, [sp, #0xb8]
00000000000259cc	stur	x8, [x29, #-0xa0]
00000000000259d0	add	x8, sp, #0x48
00000000000259d4	sub	x0, x29, #0x90
00000000000259d8	sub	x1, x29, #0xb0
00000000000259dc	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
00000000000259e0	add	x8, sp, #0x18
00000000000259e4	mov	x0, x19
00000000000259e8	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
00000000000259ec	ldr	q0, [sp, #0x60]
00000000000259f0	stur	q0, [x29, #-0x90]
00000000000259f4	ldr	x8, [sp, #0x70]
00000000000259f8	stur	x8, [x29, #-0x80]
00000000000259fc	ldur	q0, [sp, #0x78]
0000000000025a00	stur	q0, [x29, #-0xb0]
0000000000025a04	ldr	x8, [sp, #0x88]
0000000000025a08	stur	x8, [x29, #-0xa0]
0000000000025a0c	add	x8, sp, #0xa8
0000000000025a10	sub	x0, x29, #0x90
0000000000025a14	sub	x1, x29, #0xb0
0000000000025a18	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000025a1c	ldr	q0, [x22]
0000000000025a20	stur	q0, [x29, #-0x90]
0000000000025a24	ldr	x8, [sp, #0xb8]
0000000000025a28	stur	x8, [x29, #-0x80]
0000000000025a2c	ldur	q0, [sp, #0x18]
0000000000025a30	stur	q0, [x29, #-0xb0]
0000000000025a34	ldr	x8, [sp, #0x28]
0000000000025a38	stur	x8, [x29, #-0xa0]
0000000000025a3c	add	x8, sp, #0x30
0000000000025a40	sub	x0, x29, #0x90
0000000000025a44	sub	x1, x29, #0xb0
0000000000025a48	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000025a4c	ldr	x8, [x19]
0000000000025a50	ldr	x8, [x8, #0x150]
0000000000025a54	mov	x0, x19
0000000000025a58	blr	x8
0000000000025a5c	mov	x21, x0
0000000000025a60	add	x0, x19, #0x6e8
0000000000025a64	movi.2d	v0, #0000000000000000
0000000000025a68	mov	x1, x20
0000000000025a6c	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025a70	mov	x8, sp
0000000000025a74	mov	x0, x21
0000000000025a78	bl	0xa8808 ; symbol stub for: __ZNK7OZScene15getTimeForFrameEd
0000000000025a7c	ldr	q0, [sp, #0x30]
0000000000025a80	stur	q0, [x29, #-0x90]
0000000000025a84	ldr	x8, [sp, #0x40]
0000000000025a88	stur	x8, [x29, #-0x80]
0000000000025a8c	ldr	q0, [sp]
0000000000025a90	stur	q0, [x29, #-0xb0]
0000000000025a94	ldr	x8, [sp, #0x10]
0000000000025a98	stur	x8, [x29, #-0xa0]
0000000000025a9c	add	x8, sp, #0xa8
0000000000025aa0	sub	x0, x29, #0x90
0000000000025aa4	sub	x1, x29, #0xb0
0000000000025aa8	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000025aac	ldr	q0, [sp, #0x90]
0000000000025ab0	stur	q0, [x29, #-0x90]
0000000000025ab4	ldr	x8, [sp, #0xa0]
0000000000025ab8	stur	x8, [x29, #-0x80]
0000000000025abc	ldur	q0, [sp, #0x48]
0000000000025ac0	stur	q0, [x29, #-0xb0]
0000000000025ac4	ldr	x8, [sp, #0x58]
0000000000025ac8	stur	x8, [x29, #-0xa0]
0000000000025acc	sub	x0, x29, #0x90
0000000000025ad0	sub	x1, x29, #0xb0
0000000000025ad4	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000025ad8	tbnz	w0, #0x1f, 0x25b20
0000000000025adc	ldr	q0, [sp, #0x90]
0000000000025ae0	stur	q0, [x29, #-0x90]
0000000000025ae4	ldr	x8, [sp, #0xa0]
0000000000025ae8	stur	x8, [x29, #-0x80]
0000000000025aec	ldr	q0, [x22]
0000000000025af0	stur	q0, [x29, #-0xb0]
0000000000025af4	ldr	x8, [sp, #0xb8]
0000000000025af8	stur	x8, [x29, #-0xa0]
0000000000025afc	sub	x0, x29, #0x90
0000000000025b00	sub	x1, x29, #0xb0
0000000000025b04	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000025b08	cmp	w0, #0x1
0000000000025b0c	b.lt	0x25b64
0000000000025b10	adrp	x1, 168 ; 0xcd000
0000000000025b14	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000025b18	add	x0, x19, #0x3f0
0000000000025b1c	b	0x25b2c
0000000000025b20	adrp	x1, 168 ; 0xcd000
0000000000025b24	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000025b28	add	x0, x19, #0x358
0000000000025b2c	movi.2d	v0, #0000000000000000
0000000000025b30	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025b34	fadd	d8, d8, d0
0000000000025b38	mov.16b	v0, v8
0000000000025b3c	ldp	x29, x30, [sp, #0x170]
0000000000025b40	ldp	x20, x19, [sp, #0x160]
0000000000025b44	ldp	x22, x21, [sp, #0x150]
0000000000025b48	ldp	x28, x27, [sp, #0x140]
0000000000025b4c	ldp	d9, d8, [sp, #0x130]
0000000000025b50	ldp	d11, d10, [sp, #0x120]
0000000000025b54	ldp	d13, d12, [sp, #0x110]
0000000000025b58	ldp	d15, d14, [sp, #0x100]
0000000000025b5c	add	sp, sp, #0x180
0000000000025b60	ret
0000000000025b64	ldr	q0, [x22]
0000000000025b68	stur	q0, [x29, #-0x90]
0000000000025b6c	ldr	x8, [sp, #0xb8]
0000000000025b70	stur	x8, [x29, #-0x80]
0000000000025b74	ldur	q0, [sp, #0x48]
0000000000025b78	stur	q0, [x29, #-0xb0]
0000000000025b7c	ldr	x8, [sp, #0x58]
0000000000025b80	stur	x8, [x29, #-0xa0]
0000000000025b84	add	x8, sp, #0x30
0000000000025b88	sub	x0, x29, #0x90
0000000000025b8c	sub	x1, x29, #0xb0
0000000000025b90	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000025b94	ldr	q0, [sp, #0x30]
0000000000025b98	stur	q0, [x29, #-0x90]
0000000000025b9c	ldr	x8, [sp, #0x40]
0000000000025ba0	stur	x8, [x29, #-0x80]
0000000000025ba4	ldr	q0, [x20]
0000000000025ba8	stur	q0, [x29, #-0xb0]
0000000000025bac	ldr	x8, [x20, #0x10]
0000000000025bb0	stur	x8, [x29, #-0xa0]
0000000000025bb4	sub	x0, x29, #0x90
0000000000025bb8	sub	x1, x29, #0xb0
0000000000025bbc	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000025bc0	cbz	w0, 0x25d34
0000000000025bc4	add	x0, x19, #0x358
0000000000025bc8	movi.2d	v0, #0000000000000000
0000000000025bcc	mov	x1, x20
0000000000025bd0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025bd4	mov.16b	v10, v0
0000000000025bd8	add	x0, x19, #0x3f0
0000000000025bdc	movi.2d	v0, #0000000000000000
0000000000025be0	mov	x1, x20
0000000000025be4	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025be8	mov.16b	v9, v0
0000000000025bec	fsub	d14, d0, d10
0000000000025bf0	add	x0, x19, #0x488
0000000000025bf4	movi.2d	v0, #0000000000000000
0000000000025bf8	mov	x1, x20
0000000000025bfc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025c00	mov.16b	v12, v0
0000000000025c04	add	x0, x19, #0x5b8
0000000000025c08	movi.2d	v0, #0000000000000000
0000000000025c0c	mov	x1, x20
0000000000025c10	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025c14	mov.16b	v11, v0
0000000000025c18	ldr	q0, [sp, #0x90]
0000000000025c1c	stur	q0, [x29, #-0x90]
0000000000025c20	ldr	x8, [sp, #0xa0]
0000000000025c24	stur	x8, [x29, #-0x80]
0000000000025c28	ldur	q0, [sp, #0x48]
0000000000025c2c	stur	q0, [x29, #-0xb0]
0000000000025c30	ldr	x8, [sp, #0x58]
0000000000025c34	stur	x8, [x29, #-0xa0]
0000000000025c38	add	x8, sp, #0x18
0000000000025c3c	sub	x0, x29, #0x90
0000000000025c40	sub	x1, x29, #0xb0
0000000000025c44	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000025c48	sub	x8, x29, #0x90
0000000000025c4c	add	x0, sp, #0x18
0000000000025c50	add	x1, sp, #0x30
0000000000025c54	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
0000000000025c58	sub	x0, x29, #0x90
0000000000025c5c	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
0000000000025c60	mov.16b	v13, v0
0000000000025c64	fcmp	d0, d12
0000000000025c68	b.ls	0x25d3c
0000000000025c6c	fmov	d0, #1.00000000
0000000000025c70	fsub	d10, d0, d12
0000000000025c74	adrp	x1, 168 ; 0xcd000
0000000000025c78	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000025c7c	add	x0, x19, #0x520
0000000000025c80	movi.2d	v0, #0000000000000000
0000000000025c84	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000025c88	mov	x8, #0x2d18
0000000000025c8c	movk	x8, #0x5444, lsl #16
0000000000025c90	movk	x8, #0x21fb, lsl #32
0000000000025c94	movk	x8, #0x4019, lsl #48
0000000000025c98	fmov	d1, x8
0000000000025c9c	fmul	d15, d0, d1
0000000000025ca0	fmov	d0, #1.00000000
0000000000025ca4	movi.2d	v2, #0000000000000000
0000000000025ca8	movi.2d	v3, #0000000000000000
0000000000025cac	sub	x1, x29, #0x90
0000000000025cb0	fmov	d4, #1.00000000
0000000000025cb4	mov.16b	v1, v11
0000000000025cb8	mov	x0, #0x0
0000000000025cbc	bl	0xa819c ; symbol stub for: __ZN6PCMath9easeInOutEdddddPdS0_
0000000000025cc0	ldur	d0, [x29, #-0x90]
0000000000025cc4	fmul	d0, d14, d0
0000000000025cc8	fmul	d0, d10, d0
0000000000025ccc	fdiv	d0, d0, d12
0000000000025cd0	fdiv	d11, d0, d15
0000000000025cd4	fsub	d0, d13, d12
0000000000025cd8	fdiv	d10, d0, d10
0000000000025cdc	fmul	d0, d15, d10
0000000000025ce0	bl	0xa8ce8 ; symbol stub for: _sin
0000000000025ce4	fmul	d11, d11, d0
0000000000025ce8	fmov	d0, #-3.00000000
0000000000025cec	fmul	d0, d10, d0
0000000000025cf0	bl	0xa8b20 ; symbol stub for: _exp
0000000000025cf4	mov	x8, #0xb0af
0000000000025cf8	movk	x8, #0xccce, lsl #16
0000000000025cfc	movk	x8, #0x7db0, lsl #32
0000000000025d00	movk	x8, #0xbfa9, lsl #48
0000000000025d04	fmov	d1, x8
0000000000025d08	fadd	d0, d0, d1
0000000000025d0c	mov	x8, #0x18ee
0000000000025d10	movk	x8, #0xdeae, lsl #16
0000000000025d14	movk	x8, #0xd69c, lsl #32
0000000000025d18	movk	x8, #0x3ff0, lsl #48
0000000000025d1c	fmov	d1, x8
0000000000025d20	fmul	d0, d0, d1
0000000000025d24	fadd	d1, d8, d9
0000000000025d28	fmul	d0, d11, d0
0000000000025d2c	fadd	d8, d1, d0
0000000000025d30	b	0x25b38
0000000000025d34	movi.2d	v8, #0000000000000000
0000000000025d38	b	0x25b38
0000000000025d3c	fdiv	d0, d13, d12
0000000000025d40	stur	d0, [x29, #-0x90]
0000000000025d44	fcmp	d11, #0.0
0000000000025d48	b.le	0x25d80
0000000000025d4c	fcmp	d0, #0.0
0000000000025d50	b.le	0x25d80
0000000000025d54	fmov	d1, #1.00000000
0000000000025d58	fcmp	d0, d1
0000000000025d5c	b.pl	0x25d80
0000000000025d60	movi.2d	v2, #0000000000000000
0000000000025d64	movi.2d	v3, #0000000000000000
0000000000025d68	fmov	d4, #1.00000000
0000000000025d6c	sub	x0, x29, #0x90
0000000000025d70	mov.16b	v1, v11
0000000000025d74	mov	x1, #0x0
0000000000025d78	bl	0xa819c ; symbol stub for: __ZN6PCMath9easeInOutEdddddPdS0_
0000000000025d7c	ldur	d0, [x29, #-0x90]
0000000000025d80	fmul	d0, d14, d0
0000000000025d84	fadd	d0, d8, d0
0000000000025d88	fadd	d8, d10, d0
0000000000025d8c	b	0x25b38
```

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZMotionPathBehavior`). This `createCurveNode` method is the behavior's **curve-node factory (per-frame value node)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method createCurveNode OZMotionPathBehavior`

#### `OZMotionPathBehavior::createCurveNode(OZChannel*)`
```asm
0000000000370300	stp	x22, x21, [sp, #-0x30]!
0000000000370304	stp	x20, x19, [sp, #0x10]
0000000000370308	stp	x29, x30, [sp, #0x20]
000000000037030c	add	x29, sp, #0x20
0000000000370310	mov	x20, x1
0000000000370314	mov	x21, x0
0000000000370318	mov	w0, #0x88
000000000037031c	bl	0x5e9858 ; symbol stub for: __Znwm
0000000000370320	mov	x19, x0
0000000000370324	mov	x1, x21
0000000000370328	mov	x2, x20
000000000037032c	bl	__ZN21OZMotionPathCurveNodeC1EP10OZBehaviorP9OZChannel
0000000000370330	mov	x0, x19
0000000000370334	ldp	x29, x30, [sp, #0x20]
0000000000370338	ldp	x20, x19, [sp, #0x10]
000000000037033c	ldp	x22, x21, [sp], #0x30
0000000000370340	ret
0000000000370344	mov	x20, x0
0000000000370348	mov	x0, x19
000000000037034c	bl	0x5e9780 ; symbol stub for: __ZdlPv
0000000000370350	mov	x0, x20
0000000000370354	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
```

## Gravity

*Motion (simulation) behavior · 40 files · 148 instances*

Applies constant downward acceleration to a moving object (used with Throw for arcs).

| Parameter | What it controls |
|---|---|
| Acceleration | Downward acceleration magnitude. |
| Affect Subobjects | Also affect child objects. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZGravityBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZGravityBehavior`

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

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZBrownianBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZBrownianBehavior`

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

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZViscousDragBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZViscousDragBehavior`

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

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZSpinBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZSpinBehavior`

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

## Throw

*Motion (simulation) behavior · 21 files · 54 instances*

Gives the object an initial velocity — it drifts in a straight line at constant speed (no forces).

| Parameter | What it controls |
|---|---|
| Throw Velocity | Initial velocity vector. |
| Affect Subobjects | Also throw child objects. |
| Throw Distance | Alternative distance-based throw. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZThrowBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZThrowBehavior`

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

## Grow/Shrink

*Motion behavior · 20 files · 51 instances*

Animates the object's scale up or down over time.

| Parameter | What it controls |
|---|---|
| Scale To | Target scale. |
| Curvature | Ease shape. |
| End Offset | Trim end frames. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZGrowShrinkBehavior`). This `createCurveNode` method is the behavior's **curve-node factory (per-frame value node)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method createCurveNode OZGrowShrinkBehavior`

#### `OZGrowShrinkBehavior::createCurveNode(OZChannel*)`
```asm
0000000000003900	stp	x22, x21, [sp, #-0x30]!
0000000000003904	stp	x20, x19, [sp, #0x10]
0000000000003908	stp	x29, x30, [sp, #0x20]
000000000000390c	add	x29, sp, #0x20
0000000000003910	mov	x20, x1
0000000000003914	mov	x21, x0
0000000000003918	ldr	w8, [x1, #0x18]
000000000000391c	cmp	w8, #0x1
0000000000003920	cset	w22, eq
0000000000003924	mov	w0, #0x30
0000000000003928	bl	0xa8a60 ; symbol stub for: __Znwm
000000000000392c	mov	x19, x0
0000000000003930	mov	x1, x21
0000000000003934	mov	x2, x20
0000000000003938	mov	x3, x22
000000000000393c	bl	__ZN21OZGrowShrinkCurveNodeC1EP20OZGrowShrinkBehaviorP9OZChannelb
0000000000003940	mov	x0, x19
0000000000003944	ldp	x29, x30, [sp, #0x20]
0000000000003948	ldp	x20, x19, [sp, #0x10]
000000000000394c	ldp	x22, x21, [sp], #0x30
0000000000003950	ret
0000000000003954	mov	x20, x0
0000000000003958	mov	x0, x19
000000000000395c	bl	0xa89e8 ; symbol stub for: __ZdlPv
0000000000003960	mov	x0, x20
0000000000003964	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
```

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

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZSpringBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZSpringBehavior`

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Ozone`, class `OZWriteOnBehavior`). This `createCurveNode` method is the behavior's **curve-node factory (per-frame value node)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method createCurveNode OZWriteOnBehavior`

#### `OZWriteOnBehavior::createCurveNode(OZChannel*)`
```asm
00000000003cf914	stp	x20, x19, [sp, #-0x20]!
00000000003cf918	stp	x29, x30, [sp, #0x10]
00000000003cf91c	add	x29, sp, #0x10
00000000003cf920	mov	x20, x0
00000000003cf924	mov	w0, #0x20
00000000003cf928	bl	0x5e9858 ; symbol stub for: __Znwm
00000000003cf92c	mov	x19, x0
00000000003cf930	mov	x1, x20
00000000003cf934	mov	x2, #0x0
00000000003cf938	bl	__ZN18OZWriteOnCurveNodeC1EP10OZBehaviorP9OZChannel
00000000003cf93c	mov	x0, x19
00000000003cf940	ldp	x29, x30, [sp, #0x10]
00000000003cf944	ldp	x20, x19, [sp], #0x20
00000000003cf948	ret
00000000003cf94c	mov	x20, x0
00000000003cf950	mov	x0, x19
00000000003cf954	bl	0x5e9780 ; symbol stub for: __ZdlPv
00000000003cf958	mov	x0, x20
00000000003cf95c	bl	0x5e4014 ; symbol stub for: __Unwind_Resume
```

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

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZAttractedToBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZAttractedToBehavior`

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZPointAtBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZPointAtBehavior`

#### `OZPointAtBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
000000000008ffa4	stp	d15, d14, [sp, #-0xa0]!
000000000008ffa8	stp	d13, d12, [sp, #0x10]
000000000008ffac	stp	d11, d10, [sp, #0x20]
000000000008ffb0	stp	d9, d8, [sp, #0x30]
000000000008ffb4	stp	x28, x27, [sp, #0x40]
000000000008ffb8	stp	x26, x25, [sp, #0x50]
000000000008ffbc	stp	x24, x23, [sp, #0x60]
000000000008ffc0	stp	x22, x21, [sp, #0x70]
000000000008ffc4	stp	x20, x19, [sp, #0x80]
000000000008ffc8	stp	x29, x30, [sp, #0x90]
000000000008ffcc	add	x29, sp, #0x90
000000000008ffd0	sub	sp, sp, #0x820
000000000008ffd4	str	q1, [sp, #0x110]
000000000008ffd8	mov	x23, x2
000000000008ffdc	mov	x19, x1
000000000008ffe0	mov	x20, x0
000000000008ffe4	ldr	x8, [x0]
000000000008ffe8	ldr	x8, [x8, #0x308]
000000000008ffec	blr	x8
000000000008fff0	cmp	w19, #0x2
000000000008fff4	b.hi	0x901c8
000000000008fff8	cbz	w0, 0x901c8
000000000008fffc	add	x0, x20, #0x358
0000000000090000	bl	0xa7e0c ; symbol stub for: __ZN22OZChanTransformNodeRef16getTransformNodeEv
0000000000090004	cbz	x0, 0x901c8
0000000000090008	mov	x22, x0
000000000009000c	ldr	x0, [x20, #0x728]
0000000000090010	cbz	x0, 0x901c8
0000000000090014	adrp	x1, 61 ; 0xcd000
0000000000090018	ldr	x1, [x1, #0x468] ; literal pool symbol address: __ZTI15OZTransformNode
000000000009001c	adrp	x2, 61 ; 0xcd000
0000000000090020	ldr	x2, [x2, #0x4e0] ; literal pool symbol address: __ZTI8OZCamera
0000000000090024	mov	x3, #0x0
0000000000090028	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
000000000009002c	mov	x21, x0
0000000000090030	cbz	x0, 0x9009c
0000000000090034	ldr	x0, [x22, #0x3b8]
0000000000090038	cbz	x0, 0x9009c
000000000009003c	adrp	x1, 61 ; 0xcd000
0000000000090040	ldr	x1, [x1, #0x438] ; literal pool symbol address: __ZTI11OZSceneNode
0000000000090044	adrp	x2, 61 ; 0xcd000
0000000000090048	ldr	x2, [x2, #0x4d0] ; literal pool symbol address: __ZTI7OZGroup
000000000009004c	mov	x3, #0x0
0000000000090050	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
0000000000090054	cbz	x0, 0x9009c
0000000000090058	adrp	x25, 61 ; 0xcd000
000000000009005c	ldr	x25, [x25, #0x438] ; literal pool symbol address: __ZTI11OZSceneNode
0000000000090060	adrp	x26, 61 ; 0xcd000
0000000000090064	ldr	x26, [x26, #0x4d0] ; literal pool symbol address: __ZTI7OZGroup
0000000000090068	mov	x24, x0
000000000009006c	ldr	x0, [x0, #0x3b8]
0000000000090070	cbz	x0, 0x90088
0000000000090074	mov	x1, x25
0000000000090078	mov	x2, x26
000000000009007c	mov	x3, #0x0
0000000000090080	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
0000000000090084	cbnz	x0, 0x90068
0000000000090088	ldr	x8, [x24]
000000000009008c	ldr	x8, [x8, #0x680]
0000000000090090	mov	x0, x24
0000000000090094	blr	x8
0000000000090098	cbz	w0, 0x901c8
000000000009009c	add	x24, sp, #0x6a8
00000000000900a0	ldr	x8, [x20, #0x170]
00000000000900a4	ldr	x0, [x8, #0x20]
00000000000900a8	ldr	x8, [x0]
00000000000900ac	ldr	x9, [x8, #0x150]
00000000000900b0	add	x8, sp, #0x728
00000000000900b4	mov	x1, x23
00000000000900b8	blr	x9
00000000000900bc	ldr	x8, [x20]
00000000000900c0	ldr	x8, [x8, #0x150]
00000000000900c4	mov	x0, x20
00000000000900c8	blr	x8
00000000000900cc	add	x25, sp, #0x710
00000000000900d0	add	x8, sp, #0x710
00000000000900d4	add	x0, x0, #0x90
00000000000900d8	bl	0xa86d0 ; symbol stub for: __ZNK15OZSceneSettings16getFrameDurationEv
00000000000900dc	ldr	x8, [x20]
00000000000900e0	ldr	x9, [x8, #0x268]
00000000000900e4	add	x8, sp, #0x6e0
00000000000900e8	mov	x0, x20
00000000000900ec	blr	x9
00000000000900f0	ldr	q0, [sp, #0x6e0]
00000000000900f4	str	q0, [sp, #0x6c0]
00000000000900f8	ldr	x8, [sp, #0x6f0]
00000000000900fc	ldr	x9, [sp, #0x708]
0000000000090100	str	x8, [sp, #0x6d0]
0000000000090104	ldur	q0, [x24, #0x50]
0000000000090108	str	q0, [sp, #0x540]
000000000009010c	str	x9, [sp, #0x550]
0000000000090110	ldr	q0, [sp, #0x710]
0000000000090114	str	q0, [sp, #0x430]
0000000000090118	ldr	x8, [sp, #0x720]
000000000009011c	str	x8, [sp, #0x440]
0000000000090120	add	x26, sp, #0x6a8
0000000000090124	add	x8, sp, #0x6a8
0000000000090128	add	x0, sp, #0x540
000000000009012c	add	x1, sp, #0x430
0000000000090130	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000090134	ldr	q0, [x24, #0x80]
0000000000090138	str	q0, [sp, #0x540]
000000000009013c	ldr	x8, [sp, #0x738]
0000000000090140	str	x8, [sp, #0x550]
0000000000090144	ldr	q0, [sp, #0x6c0]
0000000000090148	str	q0, [sp, #0x430]
000000000009014c	ldr	x8, [sp, #0x6d0]
0000000000090150	str	x8, [sp, #0x440]
0000000000090154	add	x8, sp, #0x7a0
0000000000090158	add	x0, sp, #0x540
000000000009015c	add	x1, sp, #0x430
0000000000090160	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000090164	ldr	q0, [sp, #0x710]
0000000000090168	str	q0, [sp, #0x540]
000000000009016c	ldr	x8, [sp, #0x720]
0000000000090170	str	x8, [sp, #0x550]
0000000000090174	ldr	q0, [x24]
0000000000090178	str	q0, [sp, #0x430]
000000000009017c	ldr	x8, [sp, #0x6b8]
0000000000090180	str	x8, [sp, #0x440]
0000000000090184	add	x0, sp, #0x540
0000000000090188	add	x1, sp, #0x430
000000000009018c	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000090190	cmp	w0, #0x0
0000000000090194	csel	x8, x26, x25, lt
0000000000090198	ldr	q0, [x8]
000000000009019c	str	q0, [sp, #0x430]
00000000000901a0	ldr	x8, [x8, #0x10]
00000000000901a4	str	x8, [sp, #0x440]
00000000000901a8	add	x8, sp, #0x540
00000000000901ac	add	x0, sp, #0x7a0
00000000000901b0	add	x1, sp, #0x430
00000000000901b4	bl	0xa89f4 ; symbol stub for: __ZdvRK6CMTimeS1_
00000000000901b8	add	x0, sp, #0x540
00000000000901bc	bl	0xa6e94 ; symbol stub for: _CMTimeGetSeconds
00000000000901c0	fcmp	d0, #0.0
00000000000901c4	b.pl	0x901fc
00000000000901c8	ldr	q0, [sp, #0x110]
00000000000901cc	add	sp, sp, #0x820
00000000000901d0	ldp	x29, x30, [sp, #0x90]
00000000000901d4	ldp	x20, x19, [sp, #0x80]
00000000000901d8	ldp	x22, x21, [sp, #0x70]
00000000000901dc	ldp	x24, x23, [sp, #0x60]
00000000000901e0	ldp	x26, x25, [sp, #0x50]
00000000000901e4	ldp	x28, x27, [sp, #0x40]
00000000000901e8	ldp	d9, d8, [sp, #0x30]
00000000000901ec	ldp	d11, d10, [sp, #0x20]
00000000000901f0	ldp	d13, d12, [sp, #0x10]
00000000000901f4	ldp	d15, d14, [sp], #0xa0
00000000000901f8	ret
00000000000901fc	fmov	d1, #1.00000000
0000000000090200	fcmp	d0, d1
0000000000090204	fcsel	d13, d1, d0, gt
0000000000090208	movi.2d	v8, #0000000000000000
000000000009020c	movi.2d	v12, #0000000000000000
0000000000090210	b.le	0x90264
0000000000090214	ldr	q0, [sp, #0x6c0]
0000000000090218	str	q0, [sp, #0x540]
000000000009021c	ldr	x8, [sp, #0x6d0]
0000000000090220	str	x8, [sp, #0x550]
0000000000090224	ldr	q0, [x24]
0000000000090228	str	q0, [sp, #0x430]
000000000009022c	ldr	x8, [sp, #0x6b8]
0000000000090230	str	x8, [sp, #0x440]
0000000000090234	add	x8, sp, #0x7a0
0000000000090238	add	x0, sp, #0x540
000000000009023c	add	x1, sp, #0x430
0000000000090240	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000090244	ldr	x8, [x20]
0000000000090248	ldr	x8, [x8, #0x310]
000000000009024c	add	x2, sp, #0x7a0
0000000000090250	mov	x0, x20
0000000000090254	mov	x1, x19
0000000000090258	ldr	q0, [sp, #0x110]
000000000009025c	blr	x8
0000000000090260	mov.16b	v12, v0
0000000000090264	add	x0, x20, #0x758
0000000000090268	bl	0xa762c ; symbol stub for: __ZN13PCSharedMutex11lock_sharedEv
000000000009026c	add	x9, x20, #0x738
0000000000090270	ldr	x8, [x20, #0x740]
0000000000090274	cmp	x8, x9
0000000000090278	b.eq	0x90294
000000000009027c	ldr	d0, [x8, #0x18]
0000000000090280	fcmp	d0, d13
0000000000090284	b.eq	0x902a4
0000000000090288	ldr	x8, [x8, #0x8]
000000000009028c	cmp	x8, x9
0000000000090290	b.ne	0x9027c
0000000000090294	mov	w25, #0x0
0000000000090298	movi.2d	v10, #0000000000000000
000000000009029c	movi.2d	v9, #0000000000000000
00000000000902a0	b	0x902b0
00000000000902a4	ldp	d9, d10, [x8, #0x20]
00000000000902a8	mov	w25, #0x1
00000000000902ac	ldr	d8, [x8, #0x30]
00000000000902b0	add	x0, x20, #0x758
00000000000902b4	bl	0xa7638 ; symbol stub for: __ZN13PCSharedMutex13unlock_sharedEv
00000000000902b8	cbz	w25, 0x902d0
00000000000902bc	cmp	w19, #0x2
00000000000902c0	fcsel	d0, d8, d10, eq
00000000000902c4	cmp	w19, #0x0
00000000000902c8	fcsel	d8, d9, d0, eq
00000000000902cc	b	0x913e0
00000000000902d0	movi.2d	v8, #0000000000000000
00000000000902d4	add	x0, x20, #0x3f8
00000000000902d8	add	x1, sp, #0x728
00000000000902dc	movi.2d	v0, #0000000000000000
00000000000902e0	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000902e4	fabs	d2, d0
00000000000902e8	fmov	d1, #1.00000000
00000000000902ec	mov	x25, #0xaf48
00000000000902f0	movk	x25, #0x9abc, lsl #16
00000000000902f4	movk	x25, #0xd7f2, lsl #32
00000000000902f8	movk	x25, #0x3e7a, lsl #48
00000000000902fc	fmov	d3, x25
0000000000090300	fcmp	d2, d3
0000000000090304	b.mi	0x9031c
0000000000090308	fdiv	d0, d13, d0
000000000009030c	fcmp	d0, d1
0000000000090310	fcsel	d1, d1, d0, gt
0000000000090314	fcmp	d0, #0.0
0000000000090318	fcsel	d1, d8, d1, mi
000000000009031c	str	d1, [sp, #0x6a0]
0000000000090320	adrp	x1, 61 ; 0xcd000
0000000000090324	ldr	x1, [x1, #0x520] ; literal pool symbol address: _kCMTimeZero
0000000000090328	add	x0, x20, #0x490
000000000009032c	movi.2d	v0, #0000000000000000
0000000000090330	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000090334	ldr	d0, [sp, #0x6a0]
0000000000090338	bl	__ZN16OZCameraBehavior17calcEaseInEaseOutEid
000000000009033c	str	d0, [sp, #0x6a0]
0000000000090340	ldr	x1, [x20, #0x728]
0000000000090344	add	x8, sp, #0x688
0000000000090348	mov	x0, x20
000000000009034c	mov	x2, x23
0000000000090350	bl	__ZN16OZCameraBehavior21getPositionBeforeThisEP15OZTransformNodeRK6CMTime
0000000000090354	mov	w0, #0x18
0000000000090358	bl	0xa8a60 ; symbol stub for: __Znwm
000000000009035c	add	x8, x0, #0x18
0000000000090360	str	x8, [sp, #0x680]
0000000000090364	stp	xzr, xzr, [x0, #0x8]
0000000000090368	str	xzr, [x0]
000000000009036c	str	x0, [sp, #0x670]
0000000000090370	str	x8, [sp, #0x678]
0000000000090374	ldr	x8, [x20]
0000000000090378	ldr	x8, [x8, #0x2f0]
000000000009037c	add	x2, sp, #0x670
0000000000090380	mov	x0, x20
0000000000090384	mov	x1, x23
0000000000090388	blr	x8
000000000009038c	ldr	x8, [sp, #0x670]
0000000000090390	ldr	q0, [x8]
0000000000090394	str	q0, [sp, #0x30]
0000000000090398	ldp	d14, d8, [x8, #0x8]
000000000009039c	fmov	d0, #1.00000000
00000000000903a0	fcmp	d13, d0
00000000000903a4	b.ne	0x903dc
00000000000903a8	ldr	q0, [sp, #0x6c0]
00000000000903ac	str	q0, [sp, #0x540]
00000000000903b0	ldr	x8, [sp, #0x6d0]
00000000000903b4	str	x8, [sp, #0x550]
00000000000903b8	ldr	q0, [x24]
00000000000903bc	str	q0, [sp, #0x430]
00000000000903c0	ldr	x8, [sp, #0x6b8]
00000000000903c4	str	x8, [sp, #0x440]
00000000000903c8	add	x8, sp, #0x650
00000000000903cc	add	x0, sp, #0x540
00000000000903d0	add	x1, sp, #0x430
00000000000903d4	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
00000000000903d8	b	0x903ec
00000000000903dc	ldr	q0, [x24, #0x80]
00000000000903e0	str	q0, [sp, #0x650]
00000000000903e4	ldr	x8, [sp, #0x738]
00000000000903e8	str	x8, [sp, #0x660]
00000000000903ec	add	x0, sp, #0x540
00000000000903f0	bl	0xa75d8 ; symbol stub for: __ZN13OZRenderStateC1Ev
00000000000903f4	ldr	q0, [sp, #0x650]
00000000000903f8	str	q0, [sp, #0x540]
00000000000903fc	ldr	x8, [sp, #0x660]
0000000000090400	str	x8, [sp, #0x550]
0000000000090404	add	x0, sp, #0x430
0000000000090408	bl	0xa75d8 ; symbol stub for: __ZN13OZRenderStateC1Ev
000000000009040c	ldr	q0, [x24, #0x80]
0000000000090410	str	q0, [sp, #0x430]
0000000000090414	ldr	x8, [sp, #0x738]
0000000000090418	str	x8, [sp, #0x440]
000000000009041c	strb	wzr, [sp, #0x4f8]
0000000000090420	ldr	x0, [x20, #0x728]
0000000000090424	ldr	x8, [x0]
0000000000090428	ldr	x8, [x8, #0x548]
000000000009042c	blr	x8
0000000000090430	mov.16b	v11, v0
0000000000090434	adrp	x1, 61 ; 0xcd000
0000000000090438	ldr	x1, [x1, #0x468] ; literal pool symbol address: __ZTI15OZTransformNode
000000000009043c	adrp	x2, 61 ; 0xcd000
0000000000090440	ldr	x2, [x2, #0x4e0] ; literal pool symbol address: __ZTI8OZCamera
0000000000090444	mov	x0, x22
0000000000090448	mov	x3, #0x0
000000000009044c	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
0000000000090450	cbz	x0, 0x904e4
0000000000090454	mov	x23, x0
0000000000090458	ldr	q0, [sp, #0x540]
000000000009045c	str	q0, [sp, #0x7a0]
0000000000090460	ldr	x8, [sp, #0x550]
0000000000090464	str	x8, [sp, #0x7b0]
0000000000090468	add	x8, sp, #0x330
000000000009046c	add	x1, sp, #0x7a0
0000000000090470	bl	0xa8268 ; symbol stub for: __ZN8OZCamera12cameraAtTimeE6CMTime
0000000000090474	add	x26, sp, #0x330
0000000000090478	add	x0, sp, #0x3b0
000000000009047c	add	x1, sp, #0x330
0000000000090480	bl	__ZN5PCPtrI8LiCameraEC1I13OZSceneCameraEERKS_IT_E
0000000000090484	add	x0, x26, #0x8
0000000000090488	bl	0xa7614 ; symbol stub for: __ZN13PCSharedCountD1Ev
000000000009048c	ldr	x0, [sp, #0x3b0]
0000000000090490	cbnz	x0, 0x904a0
0000000000090494	mov	w0, #0x1
0000000000090498	bl	0xa702c ; symbol stub for: __Z28throw_PCNullPointerExceptionb
000000000009049c	ldr	x0, [sp, #0x3b0]
00000000000904a0	ldr	x8, [x0]
00000000000904a4	ldr	x8, [x8, #0x278]
00000000000904a8	blr	x8
00000000000904ac	movi.2d	v0, #0000000000000000
00000000000904b0	cmp	w0, #0x1
00000000000904b4	b.ne	0x904d0
00000000000904b8	add	x2, sp, #0x650
00000000000904bc	mov	x0, x20
00000000000904c0	mov	x1, x23
00000000000904c4	bl	__ZN16OZCameraBehavior16getFocalDistanceEP17OZChannelBehaviorP8OZCameraRK6CMTime
00000000000904c8	movi.2d	v1, #0000000000000000
00000000000904cc	fadd	d0, d0, d1
00000000000904d0	str	q0, [sp, #0x100]
00000000000904d4	add	x8, sp, #0x3b0
00000000000904d8	add	x0, x8, #0x8
00000000000904dc	bl	0xa7614 ; symbol stub for: __ZN13PCSharedCountD1Ev
00000000000904e0	b	0x904ec
00000000000904e4	movi.2d	v0, #0000000000000000
00000000000904e8	str	q0, [sp, #0x100]
00000000000904ec	add	x23, sp, #0x330
00000000000904f0	mov	x26, #0x3ff0000000000000
00000000000904f4	str	x26, [sp, #0x428]
00000000000904f8	str	x26, [sp, #0x400]
00000000000904fc	str	x26, [sp, #0x3d8]
0000000000090500	str	x26, [sp, #0x3b0]
0000000000090504	movi.2d	v0, #0000000000000000
0000000000090508	stur	q0, [x23, #0x88]
000000000009050c	stur	q0, [x23, #0x98]
0000000000090510	stp	q0, q0, [sp, #0x3e0]
0000000000090514	stur	q0, [x23, #0xd8]
0000000000090518	stur	q0, [x23, #0xe8]
000000000009051c	ldr	x8, [x22]
0000000000090520	ldr	x8, [x8, #0x500]
0000000000090524	add	x27, sp, #0x3b0
0000000000090528	add	x1, sp, #0x3b0
000000000009052c	add	x2, sp, #0x540
0000000000090530	mov	x0, x22
0000000000090534	blr	x8
0000000000090538	ldr	q0, [sp, #0x410]
000000000009053c	str	q0, [sp, #0x90]
0000000000090540	ldr	d0, [sp, #0x420]
0000000000090544	str	d0, [sp, #0xa0]
0000000000090548	ldr	d10, [sp, #0x428]
000000000009054c	ld4.2d	{ v0, v1, v2, v3 }, [x27], #64
0000000000090550	add	x8, sp, #0xc0
0000000000090554	st1.2d	{ v0, v1, v2, v3 }, [x8]
0000000000090558	ldr	d1, [x27]
000000000009055c	ldr	d0, [sp, #0x3f8]
0000000000090560	stp	d0, d1, [sp, #0xa8]
0000000000090564	ldr	d0, [sp, #0x400]
0000000000090568	str	d0, [sp, #0xb8]
000000000009056c	ldr	d15, [sp, #0x408]
0000000000090570	str	x26, [sp, #0x3a8]
0000000000090574	str	x26, [sp, #0x380]
0000000000090578	str	x26, [sp, #0x358]
000000000009057c	str	x26, [sp, #0x330]
0000000000090580	movi.2d	v0, #0000000000000000
0000000000090584	stur	q0, [x23, #0x8]
0000000000090588	stur	q0, [x23, #0x18]
000000000009058c	stp	q0, q0, [sp, #0x360]
0000000000090590	stur	q0, [x23, #0x58]
0000000000090594	stur	q0, [x23, #0x68]
0000000000090598	ldr	x8, [x20, #0x728]
000000000009059c	ldr	x0, [x8, #0x3b8]
00000000000905a0	cbz	x0, 0x905dc
00000000000905a4	adrp	x1, 61 ; 0xcd000
00000000000905a8	ldr	x1, [x1, #0x438] ; literal pool symbol address: __ZTI11OZSceneNode
00000000000905ac	adrp	x2, 61 ; 0xcd000
00000000000905b0	ldr	x2, [x2, #0x468] ; literal pool symbol address: __ZTI15OZTransformNode
00000000000905b4	mov	x3, #0x0
00000000000905b8	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
00000000000905bc	cbz	x0, 0x905dc
00000000000905c0	ldr	x8, [x0]
00000000000905c4	ldr	x8, [x8, #0x500]
00000000000905c8	add	x1, sp, #0x330
00000000000905cc	add	x2, sp, #0x430
00000000000905d0	blr	x8
00000000000905d4	ldr	d1, [sp, #0x688]
00000000000905d8	b	0x905e8
00000000000905dc	ldr	d0, [sp, #0x688]
00000000000905e0	fmul	d1, d11, d0
00000000000905e4	str	d1, [sp, #0x688]
00000000000905e8	ldp	q0, q2, [sp, #0x370]
00000000000905ec	stp	q0, q2, [sp, #0x2f0]
00000000000905f0	ldp	q0, q2, [sp, #0x390]
00000000000905f4	stp	q0, q2, [sp, #0x310]
00000000000905f8	ldp	q0, q2, [sp, #0x330]
00000000000905fc	stp	q0, q2, [sp, #0x2b0]
0000000000090600	ldp	q0, q2, [sp, #0x350]
0000000000090604	stp	q0, q2, [sp, #0x2d0]
0000000000090608	fcmp	d1, #0.0
000000000009060c	ldr	d0, [sp, #0x690]
0000000000090610	b.eq	0x90664
0000000000090614	ldr	d2, [sp, #0x2b0]
0000000000090618	ldr	d3, [sp, #0x2c8]
000000000009061c	fmul	d2, d1, d2
0000000000090620	fadd	d2, d3, d2
0000000000090624	ldr	d3, [sp, #0x2d0]
0000000000090628	ldr	d4, [sp, #0x2e8]
000000000009062c	fmul	d3, d1, d3
0000000000090630	fadd	d3, d4, d3
0000000000090634	str	d2, [sp, #0x2c8]
0000000000090638	str	d3, [sp, #0x2e8]
000000000009063c	ldr	d2, [sp, #0x2f0]
0000000000090640	ldr	d3, [sp, #0x308]
0000000000090644	fmul	d2, d1, d2
0000000000090648	fadd	d2, d3, d2
000000000009064c	ldr	d3, [sp, #0x310]
0000000000090650	ldr	d4, [sp, #0x328]
0000000000090654	fmul	d1, d1, d3
0000000000090658	fadd	d1, d4, d1
000000000009065c	str	d2, [sp, #0x308]
0000000000090660	str	d1, [sp, #0x328]
0000000000090664	ldr	d1, [sp, #0x698]
0000000000090668	fcmp	d0, #0.0
000000000009066c	b.eq	0x906c0
0000000000090670	ldr	d2, [sp, #0x2b8]
0000000000090674	ldr	d3, [sp, #0x2c8]
0000000000090678	fmul	d2, d0, d2
000000000009067c	fadd	d2, d3, d2
0000000000090680	ldr	d3, [sp, #0x2d8]
0000000000090684	ldr	d4, [sp, #0x2e8]
0000000000090688	fmul	d3, d0, d3
000000000009068c	fadd	d3, d4, d3
0000000000090690	str	d2, [sp, #0x2c8]
0000000000090694	str	d3, [sp, #0x2e8]
0000000000090698	ldr	d2, [sp, #0x2f8]
000000000009069c	ldr	d3, [sp, #0x308]
00000000000906a0	fmul	d2, d0, d2
00000000000906a4	fadd	d2, d3, d2
00000000000906a8	ldr	d3, [sp, #0x318]
00000000000906ac	ldr	d4, [sp, #0x328]
00000000000906b0	fmul	d0, d0, d3
00000000000906b4	fadd	d0, d4, d0
00000000000906b8	str	d2, [sp, #0x308]
00000000000906bc	str	d0, [sp, #0x328]
00000000000906c0	fcmp	d1, #0.0
00000000000906c4	b.eq	0x90718
00000000000906c8	ldr	d0, [sp, #0x2c0]
00000000000906cc	ldr	d2, [sp, #0x2c8]
00000000000906d0	fmul	d0, d1, d0
00000000000906d4	fadd	d0, d2, d0
00000000000906d8	ldr	d2, [sp, #0x2e0]
00000000000906dc	ldr	d3, [sp, #0x2e8]
00000000000906e0	fmul	d2, d1, d2
00000000000906e4	fadd	d2, d3, d2
00000000000906e8	str	d0, [sp, #0x2c8]
00000000000906ec	str	d2, [sp, #0x2e8]
00000000000906f0	ldr	d0, [sp, #0x300]
00000000000906f4	ldr	d2, [sp, #0x308]
00000000000906f8	fmul	d0, d1, d0
00000000000906fc	fadd	d0, d2, d0
0000000000090700	ldr	d2, [sp, #0x320]
0000000000090704	ldr	d3, [sp, #0x328]
0000000000090708	fmul	d1, d1, d2
000000000009070c	fadd	d1, d3, d1
0000000000090710	str	d0, [sp, #0x308]
0000000000090714	str	d1, [sp, #0x328]
0000000000090718	fcmp	d14, #0.0
000000000009071c	b.eq	0x90918
0000000000090720	mov	x8, #0x2d18
0000000000090724	movk	x8, #0x5444, lsl #16
0000000000090728	movk	x8, #0x21fb, lsl #32
000000000009072c	movk	x8, #0xbff9, lsl #48
0000000000090730	fmov	d0, x8
0000000000090734	fabd	d2, d0, d14
0000000000090738	fmov	d0, #1.00000000
000000000009073c	movi.2d	v1, #0000000000000000
0000000000090740	mov	x8, #0xaf48
0000000000090744	movk	x8, #0x9abc, lsl #16
0000000000090748	movk	x8, #0xd7f2, lsl #32
000000000009074c	movk	x8, #0x3e7a, lsl #48
0000000000090750	fmov	d3, x8
0000000000090754	fcmp	d2, d3
0000000000090758	b.mi	0x90878
000000000009075c	mov	x8, #0x21d2
0000000000090760	movk	x8, #0x7f33, lsl #16
0000000000090764	movk	x8, #0xd97c, lsl #32
0000000000090768	movk	x8, #0x4012, lsl #48
000000000009076c	fmov	d2, x8
0000000000090770	fabd	d2, d2, d14
0000000000090774	mov	x8, #0xaf48
0000000000090778	movk	x8, #0x9abc, lsl #16
000000000009077c	movk	x8, #0xd7f2, lsl #32
0000000000090780	movk	x8, #0x3e7a, lsl #48
0000000000090784	fmov	d3, x8
0000000000090788	fcmp	d2, d3
000000000009078c	b.mi	0x90878
0000000000090790	mov	x8, #0x2d18
0000000000090794	movk	x8, #0x5444, lsl #16
0000000000090798	movk	x8, #0x21fb, lsl #32
000000000009079c	movk	x8, #0x3ff9, lsl #48
00000000000907a0	fmov	d0, x8
00000000000907a4	fabd	d2, d0, d14
00000000000907a8	fmov	d0, #-1.00000000
00000000000907ac	mov	x8, #0xaf48
00000000000907b0	movk	x8, #0x9abc, lsl #16
00000000000907b4	movk	x8, #0xd7f2, lsl #32
00000000000907b8	movk	x8, #0x3e7a, lsl #48
00000000000907bc	fmov	d3, x8
00000000000907c0	fcmp	d2, d3
00000000000907c4	b.mi	0x90878
00000000000907c8	mov	x8, #0x21d2
00000000000907cc	movk	x8, #0x7f33, lsl #16
00000000000907d0	movk	x8, #0xd97c, lsl #32
00000000000907d4	movk	x8, #0xc012, lsl #48
00000000000907d8	fmov	d2, x8
00000000000907dc	fabd	d2, d2, d14
00000000000907e0	mov	x8, #0xaf48
00000000000907e4	movk	x8, #0x9abc, lsl #16
00000000000907e8	movk	x8, #0xd7f2, lsl #32
00000000000907ec	movk	x8, #0x3e7a, lsl #48
00000000000907f0	fmov	d3, x8
00000000000907f4	fcmp	d2, d3
00000000000907f8	b.mi	0x90878
00000000000907fc	mov	x8, #0x2d18
0000000000090800	movk	x8, #0x5444, lsl #16
0000000000090804	movk	x8, #0x21fb, lsl #32
0000000000090808	movk	x8, #0xc009, lsl #48
000000000009080c	fmov	d0, x8
0000000000090810	fabd	d2, d0, d14
0000000000090814	movi.2d	v0, #0000000000000000
0000000000090818	fmov	d1, #-1.00000000
000000000009081c	mov	x8, #0xaf48
0000000000090820	movk	x8, #0x9abc, lsl #16
0000000000090824	movk	x8, #0xd7f2, lsl #32
0000000000090828	movk	x8, #0x3e7a, lsl #48
000000000009082c	fmov	d3, x8
0000000000090830	fcmp	d2, d3
0000000000090834	b.mi	0x90878
0000000000090838	mov	x8, #0x2d18
000000000009083c	movk	x8, #0x5444, lsl #16
0000000000090840	movk	x8, #0x21fb, lsl #32
0000000000090844	movk	x8, #0x4009, lsl #48
0000000000090848	fmov	d2, x8
000000000009084c	fabd	d2, d2, d14
0000000000090850	mov	x8, #0xaf48
0000000000090854	movk	x8, #0x9abc, lsl #16
0000000000090858	movk	x8, #0xd7f2, lsl #32
000000000009085c	movk	x8, #0x3e7a, lsl #48
0000000000090860	fmov	d3, x8
0000000000090864	fcmp	d2, d3
0000000000090868	b.mi	0x90878
000000000009086c	mov.16b	v0, v14
0000000000090870	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000090874	fneg	d0, d0
0000000000090878	ldr	d2, [sp, #0x2b0]
000000000009087c	ldr	d3, [sp, #0x2c0]
0000000000090880	fmul	d4, d1, d2
0000000000090884	fmul	d5, d0, d3
0000000000090888	fadd	d4, d4, d5
000000000009088c	ldr	d5, [sp, #0x2d0]
0000000000090890	ldr	d6, [sp, #0x2e0]
0000000000090894	fmul	d7, d1, d5
0000000000090898	fmul	d16, d0, d6
000000000009089c	fadd	d7, d7, d16
00000000000908a0	ldr	d16, [sp, #0x2f0]
00000000000908a4	ldr	d17, [sp, #0x300]
00000000000908a8	fmul	d18, d1, d16
00000000000908ac	fmul	d19, d0, d17
00000000000908b0	fadd	d18, d18, d19
00000000000908b4	ldr	d19, [sp, #0x310]
00000000000908b8	ldr	d20, [sp, #0x320]
00000000000908bc	fmul	d21, d1, d19
00000000000908c0	fmul	d22, d0, d20
00000000000908c4	fadd	d21, d21, d22
00000000000908c8	fmul	d3, d1, d3
00000000000908cc	fmul	d2, d0, d2
00000000000908d0	fsub	d2, d3, d2
00000000000908d4	fmul	d3, d1, d6
00000000000908d8	fmul	d5, d0, d5
00000000000908dc	fsub	d3, d3, d5
00000000000908e0	fmul	d5, d1, d17
00000000000908e4	fmul	d6, d0, d16
00000000000908e8	fsub	d5, d5, d6
00000000000908ec	fmul	d1, d1, d20
00000000000908f0	fmul	d0, d0, d19
00000000000908f4	str	d4, [sp, #0x2b0]
00000000000908f8	str	d2, [sp, #0x2c0]
00000000000908fc	str	d7, [sp, #0x2d0]
0000000000090900	str	d3, [sp, #0x2e0]
0000000000090904	str	d18, [sp, #0x2f0]
0000000000090908	str	d5, [sp, #0x300]
000000000009090c	fsub	d0, d1, d0
0000000000090910	str	d21, [sp, #0x310]
0000000000090914	str	d0, [sp, #0x320]
0000000000090918	add	x0, sp, #0x2b0
000000000009091c	ldr	q0, [sp, #0x30]
0000000000090920	mov	w1, #0x0
0000000000090924	bl	__ZN14PCMatrix44TmplIdE11rightRotateEdNS0_4axisE
0000000000090928	add	x0, sp, #0x2b0
000000000009092c	mov.16b	v0, v8
0000000000090930	mov	w1, #0x2
0000000000090934	bl	__ZN14PCMatrix44TmplIdE11rightRotateEdNS0_4axisE
0000000000090938	mov.16b	v9, v15
000000000009093c	stp	d14, d13, [sp, #0x10]
0000000000090940	stp	d12, d8, [sp, #0x20]
0000000000090944	ldp	q0, q1, [sp, #0x2f0]
0000000000090948	stp	q0, q1, [sp, #0x270]
000000000009094c	ldp	q0, q1, [sp, #0x310]
0000000000090950	stp	q0, q1, [sp, #0x290]
0000000000090954	ldp	q0, q1, [sp, #0x2b0]
0000000000090958	stp	q0, q1, [sp, #0x230]
000000000009095c	ldp	q0, q1, [sp, #0x2d0]
0000000000090960	stp	q0, q1, [sp, #0x250]
0000000000090964	add	x0, sp, #0x230
0000000000090968	add	x1, sp, #0x230
000000000009096c	movi.2d	v0, #0000000000000000
0000000000090970	bl	__ZN14PCMatrix44TmplIdE6invertERKS0_d
0000000000090974	ldr	q1, [sp, #0x290]
0000000000090978	ldr	d8, [sp, #0x2a0]
000000000009097c	ldr	d15, [sp, #0x2a8]
0000000000090980	ldr	d12, [sp, #0x250]
0000000000090984	ldr	d13, [sp, #0x258]
0000000000090988	ldr	d14, [sp, #0x260]
000000000009098c	ldr	d11, [sp, #0x268]
0000000000090990	ldp	q2, q0, [sp, #0x230]
0000000000090994	str	q0, [sp, #0x80]
0000000000090998	ldp	q3, q0, [sp, #0x270]
000000000009099c	stp	q1, q3, [sp, #0x40]
00000000000909a0	stp	q2, q0, [sp, #0x60]
00000000000909a4	ldp	q0, q1, [sp, #0x2f0]
00000000000909a8	stp	q0, q1, [sp, #0x1f0]
00000000000909ac	ldp	q0, q1, [sp, #0x310]
00000000000909b0	stp	q0, q1, [sp, #0x210]
00000000000909b4	ldp	q0, q1, [sp, #0x2b0]
00000000000909b8	stp	q0, q1, [sp, #0x1b0]
00000000000909bc	ldp	q0, q1, [sp, #0x2d0]
00000000000909c0	stp	q0, q1, [sp, #0x1d0]
00000000000909c4	cbnz	x21, 0x90a18
00000000000909c8	ldp	q0, q1, [sp, #0x3f0]
00000000000909cc	str	q0, [sp, #0x7e0]
00000000000909d0	str	q1, [sp, #0x7f0]
00000000000909d4	ldr	q0, [sp, #0x410]
00000000000909d8	ldr	q1, [sp, #0x420]
00000000000909dc	str	q0, [sp, #0x800]
00000000000909e0	str	q1, [sp, #0x810]
00000000000909e4	ldp	q0, q1, [sp, #0x3b0]
00000000000909e8	str	q0, [sp, #0x7a0]
00000000000909ec	str	q1, [sp, #0x7b0]
00000000000909f0	ldp	q0, q1, [sp, #0x3d0]
00000000000909f4	str	q0, [sp, #0x7c0]
00000000000909f8	str	q1, [sp, #0x7d0]
00000000000909fc	add	x0, sp, #0x7a0
0000000000090a00	add	x1, sp, #0x7a0
0000000000090a04	movi.2d	v0, #0000000000000000
0000000000090a08	bl	__ZN14PCMatrix44TmplIdE6invertERKS0_d
0000000000090a0c	add	x0, sp, #0x1b0
0000000000090a10	add	x1, sp, #0x7a0
0000000000090a14	bl	__ZN14PCMatrix44TmplIdE8leftMultERKS0_
0000000000090a18	stp	xzr, xzr, [sp, #0x198]
0000000000090a1c	str	xzr, [sp, #0x1a8]
0000000000090a20	add	x0, x20, #0x590
0000000000090a24	add	x1, sp, #0x728
0000000000090a28	movi.2d	v0, #0000000000000000
0000000000090a2c	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000090a30	mov	x21, x0
0000000000090a34	add	x0, x20, #0x690
0000000000090a38	add	x1, sp, #0x728
0000000000090a3c	movi.2d	v0, #0000000000000000
0000000000090a40	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000090a44	movi.2d	v3, #0000000000000000
0000000000090a48	ldr	q0, [sp, #0x90]
0000000000090a4c	fmul.2d	v0, v0, v3
0000000000090a50	faddp.2d	d0, v0
0000000000090a54	ldr	q5, [sp, #0x100]
0000000000090a58	ldp	d1, d6, [sp, #0xa0]
0000000000090a5c	fmul	d1, d5, d1
0000000000090a60	movi.2d	v2, #0000000000000000
0000000000090a64	fadd	d0, d0, d1
0000000000090a68	add	x8, sp, #0xc0
0000000000090a6c	ld1.2d	{ v16, v17, v18, v19 }, [x8]
0000000000090a70	fmul.2d	v1, v16, v3
0000000000090a74	fmul.2d	v3, v17, v3
0000000000090a78	ldr	d4, [sp, #0xb0]
0000000000090a7c	fmul	d4, d4, d2
0000000000090a80	fmul	d2, d6, d2
0000000000090a84	fadd	d0, d10, d0
0000000000090a88	fadd.2d	v1, v1, v3
0000000000090a8c	fmul.2d	v3, v18, v5[0]
0000000000090a90	fadd	d2, d4, d2
0000000000090a94	ldr	d4, [sp, #0xb8]
0000000000090a98	fmul	d4, d5, d4
0000000000090a9c	fadd.2d	v1, v1, v3
0000000000090aa0	fadd	d2, d2, d4
0000000000090aa4	dup.2d	v3, v0[0]
0000000000090aa8	fadd.2d	v1, v19, v1
0000000000090aac	fadd	d2, d9, d2
0000000000090ab0	fdiv.2d	v1, v1, v3
0000000000090ab4	fdiv	d2, d2, d0
0000000000090ab8	ldp	q0, q6, [sp, #0x40]
0000000000090abc	fmul.2d	v0, v1, v0
0000000000090ac0	faddp.2d	d0, v0
0000000000090ac4	fmul	d3, d2, d8
0000000000090ac8	fadd	d0, d0, d3
0000000000090acc	fadd	d3, d15, d0
0000000000090ad0	fmul	d0, d12, d1
0000000000090ad4	fmul.d	d4, d13, v1[1]
0000000000090ad8	fadd	d0, d0, d4
0000000000090adc	fmul	d4, d2, d14
0000000000090ae0	fadd	d0, d0, d4
0000000000090ae4	fadd	d0, d11, d0
0000000000090ae8	mov.16b	v4, v6
0000000000090aec	ldr	q5, [sp, #0x60]
0000000000090af0	mov.d	v4[1], v5[1]
0000000000090af4	fdiv	d0, d0, d3
0000000000090af8	fmul.2d	v4, v1, v4
0000000000090afc	ext.16b	v5, v6, v5, #0x8
0000000000090b00	ext.16b	v1, v1, v1, #0x8
0000000000090b04	fmul.2d	v1, v1, v5
0000000000090b08	fadd.2d	v1, v4, v1
0000000000090b0c	ldp	q6, q5, [sp, #0x70]
0000000000090b10	zip1.2d	v4, v6, v5
0000000000090b14	fmul.2d	v2, v4, v2[0]
0000000000090b18	fadd.2d	v1, v1, v2
0000000000090b1c	zip2.2d	v2, v6, v5
0000000000090b20	dup.2d	v3, v3[0]
0000000000090b24	fadd.2d	v1, v2, v1
0000000000090b28	fdiv.2d	v1, v1, v3
0000000000090b2c	cmp	w0, #0x0
0000000000090b30	fmov	d2, #-1.00000000
0000000000090b34	fmov	d3, #1.00000000
0000000000090b38	fcsel	d8, d3, d2, eq
0000000000090b3c	add	x8, sp, #0x198
0000000000090b40	str	d8, [x8, w21, sxtw #3]
0000000000090b44	add	x8, sp, #0x180
0000000000090b48	st1.d	{ v1 }[1], [x8]
0000000000090b4c	stp	d0, d1, [sp, #0x188]
0000000000090b50	fmul.2d	v2, v1, v1
0000000000090b54	fmul	d3, d0, d0
0000000000090b58	mov	d4, v2[1]
0000000000090b5c	fadd	d3, d4, d3
0000000000090b60	fadd	d9, d3, d2
0000000000090b64	fsqrt	d2, d9
0000000000090b68	fabs	d3, d2
0000000000090b6c	mov	x8, #0xa0000000
0000000000090b70	movk	x8, #0xd7f2, lsl #32
0000000000090b74	movk	x8, #0x3e7a, lsl #48
0000000000090b78	fmov	d4, x8
0000000000090b7c	fcmp	d3, d4
0000000000090b80	b.mi	0x90b9c
0000000000090b84	mov	d3, v1[1]
0000000000090b88	fdiv	d3, d3, d2
0000000000090b8c	fdiv	d0, d0, d2
0000000000090b90	stp	d3, d0, [sp, #0x180]
0000000000090b94	fdiv	d0, d1, d2
0000000000090b98	str	d0, [sp, #0x190]
0000000000090b9c	mov	x8, #0x3ff0000000000000
0000000000090ba0	add	x26, sp, #0x160
0000000000090ba4	stp	x8, xzr, [sp, #0x160]
0000000000090ba8	stp	xzr, xzr, [sp, #0x170]
0000000000090bac	stp	x8, xzr, [sp, #0x140]
0000000000090bb0	stp	xzr, xzr, [sp, #0x150]
0000000000090bb4	mov	x8, #0xed8d
0000000000090bb8	movk	x8, #0xa0b5, lsl #16
0000000000090bbc	movk	x8, #0xc6f7, lsl #32
0000000000090bc0	movk	x8, #0x3eb0, lsl #48
0000000000090bc4	fmov	d0, x8
0000000000090bc8	add	x0, sp, #0x160
0000000000090bcc	add	x1, sp, #0x198
0000000000090bd0	add	x2, sp, #0x180
0000000000090bd4	bl	__ZN6PCQuatIdE11setRotationERK9PCVector3IdES4_d
0000000000090bd8	str	d9, [sp, #0x8]
0000000000090bdc	add	x27, sp, #0x7a0
0000000000090be0	add	x8, sp, #0x7a0
0000000000090be4	add	x0, sp, #0x140
0000000000090be8	add	x1, sp, #0x160
0000000000090bec	add	x2, sp, #0x6a0
0000000000090bf0	bl	__Z5slerpIdE6PCQuatIT_ERKS2_S4_RKS1_
0000000000090bf4	mov	w23, #0x0
0000000000090bf8	ldr	x8, [sp, #0x7b8]
0000000000090bfc	stur	x8, [x26, #0x18]
0000000000090c00	add	x22, sp, #0x7a0
0000000000090c04	ldr	d0, [sp, #0x7a0]
0000000000090c08	str	d0, [sp, #0x100]
0000000000090c0c	ldur	q0, [x22, #0x8]
0000000000090c10	stur	q0, [x26, #0x8]
0000000000090c14	str	xzr, [sp, #0x7a8]
0000000000090c18	str	xzr, [sp, #0x7a0]
0000000000090c1c	str	xzr, [sp, #0x7b0]
0000000000090c20	cmp	w21, #0x2
0000000000090c24	fmov	d0, #1.00000000
0000000000090c28	movi.2d	v1, #0000000000000000
0000000000090c2c	fcsel	d10, d1, d0, eq
0000000000090c30	fcsel	d11, d0, d1, eq
0000000000090c34	str	d8, [x27, w21, sxtw #3]
0000000000090c38	ldr	d1, [sp, #0x7a0]
0000000000090c3c	ldr	d2, [sp, #0x7a8]
0000000000090c40	fmul	d3, d1, d1
0000000000090c44	fmul	d4, d2, d2
0000000000090c48	fadd	d3, d3, d4
0000000000090c4c	ldr	d4, [sp, #0x7b0]
0000000000090c50	fmul	d5, d4, d4
0000000000090c54	fadd	d3, d3, d5
0000000000090c58	fsqrt	d3, d3
0000000000090c5c	fabs	d5, d3
0000000000090c60	mov	x8, #0xa0000000
0000000000090c64	movk	x8, #0xd7f2, lsl #32
0000000000090c68	movk	x8, #0x3e7a, lsl #48
0000000000090c6c	fmov	d6, x8
0000000000090c70	fcmp	d5, d6
0000000000090c74	fcsel	d0, d0, d3, mi
0000000000090c78	fdiv	d3, d1, d0
0000000000090c7c	fdiv	d1, d2, d0
0000000000090c80	stp	d1, d3, [sp, #0xb8]
0000000000090c84	fdiv	d1, d4, d0
0000000000090c88	ldp	d14, d12, [sp, #0x168]
0000000000090c8c	ldr	d13, [sp, #0x178]
0000000000090c90	ldp	d2, d0, [sp, #0x1d0]
0000000000090c94	stp	d2, d1, [sp, #0xa8]
0000000000090c98	str	d0, [sp, #0xa0]
0000000000090c9c	ldr	d0, [sp, #0x1e0]
0000000000090ca0	str	d0, [sp, #0x90]
0000000000090ca4	ldp	d1, d0, [sp, #0x1f0]
0000000000090ca8	str	d1, [sp, #0x80]
0000000000090cac	mov	w26, #0xb40
0000000000090cb0	str	d0, [sp, #0x70]
0000000000090cb4	ldr	d0, [sp, #0x200]
0000000000090cb8	str	d0, [sp, #0x60]
0000000000090cbc	mov	x8, #0xffffe0000000
0000000000090cc0	movk	x8, #0xc7ef, lsl #48
0000000000090cc4	fmov	d9, x8
0000000000090cc8	mov	x8, #0x800000000000
0000000000090ccc	movk	x8, #0x40a6, lsl #48
0000000000090cd0	str	x8, [sp, #0x50]
0000000000090cd4	mov	x8, #0x2d18
0000000000090cd8	movk	x8, #0x5444, lsl #16
0000000000090cdc	movk	x8, #0x21fb, lsl #32
0000000000090ce0	movk	x8, #0x4009, lsl #48
0000000000090ce4	str	x8, [sp, #0x40]
0000000000090ce8	mov.16b	v15, v9
0000000000090cec	ucvtf	d0, w23
0000000000090cf0	ldr	d1, [sp, #0x50]
0000000000090cf4	fdiv	d0, d0, d1
0000000000090cf8	fmov	d1, #-1.00000000
0000000000090cfc	fadd	d0, d0, d1
0000000000090d00	ldr	d1, [sp, #0x40]
0000000000090d04	fmul	d8, d0, d1
0000000000090d08	fmov	d0, #0.50000000
0000000000090d0c	fmul	d0, d8, d0
0000000000090d10	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000090d14	ldp	d3, d2, [sp, #0xb8]
0000000000090d18	fmul	d2, d0, d2
0000000000090d1c	fmul	d3, d0, d3
0000000000090d20	ldr	d4, [sp, #0xb0]
0000000000090d24	fmul	d0, d0, d4
0000000000090d28	ldr	d18, [sp, #0x100]
0000000000090d2c	fmul	d4, d18, d1
0000000000090d30	fmul	d5, d14, d2
0000000000090d34	fmul	d6, d12, d3
0000000000090d38	fmul	d7, d13, d0
0000000000090d3c	fmul	d16, d18, d2
0000000000090d40	fmul	d17, d18, d3
0000000000090d44	fmul	d18, d18, d0
0000000000090d48	fmul	d19, d1, d14
0000000000090d4c	fmul	d20, d1, d12
0000000000090d50	fadd	d5, d5, d6
0000000000090d54	fmul	d1, d1, d13
0000000000090d58	fadd	d6, d19, d16
0000000000090d5c	fadd	d16, d20, d17
0000000000090d60	fmul	d17, d12, d0
0000000000090d64	fmul	d19, d13, d3
0000000000090d68	fadd	d1, d1, d18
0000000000090d6c	fsub	d17, d17, d19
0000000000090d70	fmul	d18, d13, d2
0000000000090d74	fmul	d0, d14, d0
0000000000090d78	fsub	d0, d18, d0
0000000000090d7c	fmul	d3, d14, d3
0000000000090d80	fadd	d5, d7, d5
0000000000090d84	fmul	d2, d12, d2
0000000000090d88	fsub	d2, d3, d2
0000000000090d8c	fadd	d3, d6, d17
0000000000090d90	fadd	d0, d16, d0
0000000000090d94	fadd	d1, d2, d1
0000000000090d98	fsub	d2, d4, d5
0000000000090d9c	movi.2d	v20, #0000000000000000
0000000000090da0	fmul	d4, d3, d20
0000000000090da4	fmul	d5, d11, d0
0000000000090da8	fadd	d4, d4, d5
0000000000090dac	fmul	d5, d10, d1
0000000000090db0	fadd	d4, d5, d4
0000000000090db4	fadd	d4, d4, d4
0000000000090db8	fadd	d5, d2, d2
0000000000090dbc	fmul	d6, d2, d5
0000000000090dc0	fmov	d7, #-1.00000000
0000000000090dc4	fadd	d6, d6, d7
0000000000090dc8	fmul	d7, d6, d20
0000000000090dcc	fmul	d16, d3, d4
0000000000090dd0	fadd	d7, d16, d7
0000000000090dd4	fmul	d16, d10, d0
0000000000090dd8	fmul	d17, d11, d1
0000000000090ddc	fsub	d16, d16, d17
0000000000090de0	fmul	d17, d11, d6
0000000000090de4	fmul	d18, d0, d4
0000000000090de8	fadd	d17, d18, d17
0000000000090dec	fmul	d18, d1, d20
0000000000090df0	fmul	d19, d10, d3
0000000000090df4	fsub	d18, d18, d19
0000000000090df8	fmul	d16, d5, d16
0000000000090dfc	fmul	d18, d5, d18
0000000000090e00	fadd	d7, d16, d7
0000000000090e04	fmul	d6, d10, d6
0000000000090e08	fmul	d4, d1, d4
0000000000090e0c	fadd	d4, d4, d6
0000000000090e10	fmul	d6, d11, d3
0000000000090e14	fmul	d16, d0, d20
0000000000090e18	fadd	d17, d18, d17
0000000000090e1c	fsub	d6, d6, d16
0000000000090e20	fmul	d5, d6, d5
0000000000090e24	fmul	d2, d2, d2
0000000000090e28	fmul	d3, d3, d3
0000000000090e2c	fmul	d0, d0, d0
0000000000090e30	fadd	d4, d5, d4
0000000000090e34	fadd	d0, d3, d0
0000000000090e38	fmul	d1, d1, d1
0000000000090e3c	fadd	d0, d1, d0
0000000000090e40	fadd	d0, d2, d0
0000000000090e44	fdiv	d1, d7, d0
0000000000090e48	fdiv	d2, d17, d0
0000000000090e4c	fdiv	d0, d4, d0
0000000000090e50	ldp	d4, d3, [sp, #0xa0]
0000000000090e54	fmul	d3, d3, d1
0000000000090e58	fmul	d4, d4, d2
0000000000090e5c	fadd	d3, d3, d4
0000000000090e60	ldr	d4, [sp, #0x90]
0000000000090e64	fmul	d4, d4, d0
0000000000090e68	fadd	d3, d4, d3
0000000000090e6c	ldr	d4, [sp, #0x80]
0000000000090e70	fmul	d1, d4, d1
0000000000090e74	ldr	d4, [sp, #0x70]
0000000000090e78	fmul	d2, d2, d4
0000000000090e7c	fadd	d1, d1, d2
0000000000090e80	ldr	d2, [sp, #0x60]
0000000000090e84	fmul	d0, d0, d2
0000000000090e88	fadd	d0, d1, d0
0000000000090e8c	cmp	w21, #0x2
0000000000090e90	fcsel	d0, d3, d0, eq
0000000000090e94	fcmp	d0, d15
0000000000090e98	fcsel	d15, d0, d15, gt
0000000000090e9c	fcsel	d9, d8, d9, gt
0000000000090ea0	add	w23, w23, #0x2
0000000000090ea4	subs	w26, w26, #0x1
0000000000090ea8	b.ne	0x90cec
0000000000090eac	fmov	d0, #0.50000000
0000000000090eb0	fmul	d0, d9, d0
0000000000090eb4	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000090eb8	ldr	d2, [sp, #0x7a0]
0000000000090ebc	ldr	d3, [sp, #0x7a8]
0000000000090ec0	fmul	d4, d2, d2
0000000000090ec4	fmul	d5, d3, d3
0000000000090ec8	fadd	d4, d4, d5
0000000000090ecc	ldr	d5, [sp, #0x7b0]
0000000000090ed0	fmul	d6, d5, d5
0000000000090ed4	fadd	d4, d4, d6
0000000000090ed8	fsqrt	d4, d4
0000000000090edc	fabs	d6, d4
0000000000090ee0	mov	x8, #0xa0000000
0000000000090ee4	movk	x8, #0xd7f2, lsl #32
0000000000090ee8	movk	x8, #0x3e7a, lsl #48
0000000000090eec	fmov	d7, x8
0000000000090ef0	fcmp	d6, d7
0000000000090ef4	fmov	d6, #1.00000000
0000000000090ef8	fcsel	d4, d6, d4, mi
0000000000090efc	fdiv	d2, d2, d4
0000000000090f00	fdiv	d3, d3, d4
0000000000090f04	fdiv	d4, d5, d4
0000000000090f08	fmul	d2, d0, d2
0000000000090f0c	fmul	d3, d0, d3
0000000000090f10	fmul	d0, d0, d4
0000000000090f14	ldr	d18, [sp, #0x100]
0000000000090f18	fmul	d4, d18, d1
0000000000090f1c	ldp	d5, d6, [sp, #0x168]
0000000000090f20	fmul	d7, d5, d2
0000000000090f24	fmul	d16, d6, d3
0000000000090f28	fadd	d7, d7, d16
0000000000090f2c	ldr	d16, [sp, #0x178]
0000000000090f30	fmul	d17, d16, d0
0000000000090f34	fadd	d7, d17, d7
0000000000090f38	fsub	d20, d4, d7
0000000000090f3c	str	d20, [sp, #0xc0]
0000000000090f40	fmul	d4, d18, d2
0000000000090f44	fmul	d7, d18, d3
0000000000090f48	fmul	d17, d18, d0
0000000000090f4c	fmul	d18, d1, d5
0000000000090f50	fmul	d19, d1, d6
0000000000090f54	fmul	d1, d1, d16
0000000000090f58	fadd	d4, d18, d4
0000000000090f5c	fadd	d7, d19, d7
0000000000090f60	fadd	d1, d1, d17
0000000000090f64	fmul	d17, d6, d0
0000000000090f68	fmul	d18, d16, d3
0000000000090f6c	fsub	d17, d17, d18
0000000000090f70	fmul	d16, d16, d2
0000000000090f74	fmul	d0, d5, d0
0000000000090f78	fsub	d0, d16, d0
0000000000090f7c	fmul	d3, d5, d3
0000000000090f80	fmul	d2, d6, d2
0000000000090f84	fsub	d2, d3, d2
0000000000090f88	fadd	d3, d4, d17
0000000000090f8c	str	d3, [sp, #0x100]
0000000000090f90	fadd	d9, d7, d0
0000000000090f94	fadd	d8, d2, d1
0000000000090f98	stp	d9, d8, [sp, #0x170]
0000000000090f9c	stp	d20, d3, [sp, #0x160]
0000000000090fa0	stp	xzr, xzr, [sp, #0x120]
0000000000090fa4	str	xzr, [sp, #0x130]
0000000000090fa8	ldr	q0, [sp, #0x30]
0000000000090fac	fmov	d10, #0.50000000
0000000000090fb0	fmul	d0, d0, d10
0000000000090fb4	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000090fb8	mov.16b	v11, v0
0000000000090fbc	mov.16b	v12, v1
0000000000090fc0	movi.2d	v15, #0000000000000000
0000000000090fc4	fmul	d14, d0, d15
0000000000090fc8	ldr	d0, [sp, #0x10]
0000000000090fcc	fmul	d0, d0, d10
0000000000090fd0	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000090fd4	mov.16b	v10, v0
0000000000090fd8	mov.16b	v13, v1
0000000000090fdc	fmul	d15, d0, d15
0000000000090fe0	ldr	d0, [sp, #0x28]
0000000000090fe4	fmov	d1, #0.50000000
0000000000090fe8	fmul	d0, d0, d1
0000000000090fec	bl	0xa8ac0 ; symbol stub for: ___sincos_stret
0000000000090ff0	movi.2d	v21, #0000000000000000
0000000000090ff4	fmul	d2, d0, d21
0000000000090ff8	fmul	d3, d12, d13
0000000000090ffc	fmul	d4, d11, d15
0000000000091000	fmul	d5, d14, d10
0000000000091004	fadd	d6, d5, d4
0000000000091008	fmul	d7, d14, d15
000000000009100c	fadd	d6, d7, d6
0000000000091010	fsub	d3, d3, d6
0000000000091014	fmul	d6, d11, d13
0000000000091018	fmul	d16, d14, d13
000000000009101c	fmul	d17, d12, d15
0000000000091020	fmul	d18, d12, d10
0000000000091024	fadd	d6, d6, d17
0000000000091028	fadd	d18, d16, d18
000000000009102c	fadd	d16, d16, d17
0000000000091030	fsub	d5, d5, d7
0000000000091034	fsub	d4, d4, d7
0000000000091038	fmul	d17, d11, d10
000000000009103c	fsub	d7, d7, d17
0000000000091040	fadd	d5, d6, d5
0000000000091044	fadd	d4, d18, d4
0000000000091048	fadd	d6, d7, d16
000000000009104c	fmul	d7, d1, d3
0000000000091050	fmul	d16, d2, d5
0000000000091054	fmul	d17, d2, d4
0000000000091058	fadd	d18, d16, d17
000000000009105c	fmul	d19, d0, d6
0000000000091060	fadd	d18, d19, d18
0000000000091064	fsub	d7, d7, d18
0000000000091068	fmul	d18, d2, d3
000000000009106c	fmul	d3, d0, d3
0000000000091070	fmul	d19, d1, d5
0000000000091074	fmul	d20, d1, d4
0000000000091078	fmul	d1, d1, d6
000000000009107c	fadd	d19, d19, d18
0000000000091080	fadd	d18, d20, d18
0000000000091084	fadd	d1, d1, d3
0000000000091088	fmul	d3, d0, d4
000000000009108c	fmul	d2, d2, d6
0000000000091090	fsub	d3, d3, d2
0000000000091094	fmul	d0, d0, d5
0000000000091098	fsub	d0, d2, d0
000000000009109c	fsub	d2, d16, d17
00000000000910a0	fadd	d3, d3, d19
00000000000910a4	fadd	d4, d0, d18
00000000000910a8	fadd	d1, d2, d1
00000000000910ac	ldr	d17, [sp, #0xc0]
00000000000910b0	fmul	d0, d7, d17
00000000000910b4	ldr	d18, [sp, #0x100]
00000000000910b8	fmul	d2, d3, d18
00000000000910bc	fmul	d5, d4, d9
00000000000910c0	fadd	d2, d2, d5
00000000000910c4	fmul	d5, d1, d8
00000000000910c8	fadd	d2, d5, d2
00000000000910cc	fsub	d0, d0, d2
00000000000910d0	fmul	d2, d7, d18
00000000000910d4	fmul	d5, d7, d9
00000000000910d8	fmul	d6, d7, d8
00000000000910dc	fmul	d7, d3, d17
00000000000910e0	fmul	d16, d4, d17
00000000000910e4	fmul	d17, d1, d17
00000000000910e8	fadd	d2, d2, d7
00000000000910ec	fadd	d7, d5, d16
00000000000910f0	fadd	d16, d6, d17
00000000000910f4	fmul	d5, d4, d8
00000000000910f8	fmul	d6, d1, d9
00000000000910fc	fsub	d5, d5, d6
0000000000091100	fmul	d1, d1, d18
0000000000091104	fmul	d6, d3, d8
0000000000091108	fsub	d1, d1, d6
000000000009110c	fmul	d3, d3, d9
0000000000091110	fmul	d4, d4, d18
0000000000091114	fsub	d3, d3, d4
0000000000091118	fadd	d5, d5, d2
000000000009111c	fadd	d6, d1, d7
0000000000091120	fadd	d7, d3, d16
0000000000091124	fmul	d1, d0, d0
0000000000091128	fmul	d2, d5, d5
000000000009112c	fmul	d3, d6, d6
0000000000091130	fadd	d2, d2, d3
0000000000091134	fmul	d3, d7, d7
0000000000091138	fadd	d2, d3, d2
000000000009113c	fadd	d16, d1, d2
0000000000091140	fcmp	d16, #0.0
0000000000091144	movi.2d	v1, #0000000000000000
0000000000091148	movi.2d	v2, #0000000000000000
000000000009114c	movi.2d	v3, #0000000000000000
0000000000091150	fmov	d4, #1.00000000
0000000000091154	b.eq	0x9116c
0000000000091158	fsqrt	d3, d16
000000000009115c	fdiv	d4, d0, d3
0000000000091160	fdiv	d1, d5, d3
0000000000091164	fdiv	d2, d6, d3
0000000000091168	fdiv	d3, d7, d3
000000000009116c	fmul	d0, d4, d4
0000000000091170	fmul	d5, d1, d1
0000000000091174	fmul	d6, d2, d2
0000000000091178	fadd	d5, d5, d6
000000000009117c	fmul	d6, d3, d3
0000000000091180	fadd	d5, d5, d6
0000000000091184	fadd	d0, d0, d5
0000000000091188	fmov	d5, #2.00000000
000000000009118c	fdiv	d5, d5, d0
0000000000091190	fcmp	d0, #0.0
0000000000091194	fcsel	d0, d5, d21, gt
0000000000091198	fmul	d5, d1, d0
000000000009119c	fmul	d6, d2, d0
00000000000911a0	fmul	d0, d3, d0
00000000000911a4	fmul	d7, d4, d5
00000000000911a8	fmul	d16, d4, d6
00000000000911ac	fmul	d4, d4, d0
00000000000911b0	fmul	d5, d1, d5
00000000000911b4	fmul	d17, d1, d6
00000000000911b8	fmul	d1, d1, d0
00000000000911bc	fmul	d6, d2, d6
00000000000911c0	fmul	d2, d2, d0
00000000000911c4	fmul	d0, d3, d0
00000000000911c8	fadd	d3, d6, d0
00000000000911cc	fmov	d19, #1.00000000
00000000000911d0	fsub	d3, d19, d3
00000000000911d4	fsub	d18, d17, d4
00000000000911d8	str	d3, [sp, #0x7a0]
00000000000911dc	str	d18, [sp, #0x7a8]
00000000000911e0	fadd	d3, d1, d16
00000000000911e4	str	d3, [sp, #0x7b0]
00000000000911e8	str	xzr, [sp, #0x7b8]
00000000000911ec	fadd	d3, d17, d4
00000000000911f0	fadd	d0, d5, d0
00000000000911f4	fsub	d0, d19, d0
00000000000911f8	str	d3, [sp, #0x7c0]
00000000000911fc	str	d0, [sp, #0x7c8]
0000000000091200	fsub	d0, d2, d7
0000000000091204	str	d0, [sp, #0x7d0]
0000000000091208	str	xzr, [sp, #0x7d8]
000000000009120c	fsub	d0, d1, d16
0000000000091210	fadd	d1, d2, d7
0000000000091214	str	d0, [sp, #0x7e0]
0000000000091218	str	d1, [sp, #0x7e8]
000000000009121c	fadd	d0, d5, d6
0000000000091220	fsub	d0, d19, d0
0000000000091224	str	d0, [sp, #0x7f0]
0000000000091228	movi.2d	v0, #0000000000000000
000000000009122c	stur	q0, [x22, #0x58]
0000000000091230	stur	q0, [x22, #0x68]
0000000000091234	mov	x8, #0x3ff0000000000000
0000000000091238	str	x8, [sp, #0x818]
000000000009123c	str	q0, [sp, #0x760]
0000000000091240	str	q0, [sp, #0x750]
0000000000091244	str	q0, [sp, #0x740]
0000000000091248	stp	q0, q0, [x24, #0xd0]
000000000009124c	str	xzr, [sp, #0x798]
0000000000091250	mov	w8, #0x4
0000000000091254	str	w8, [sp, #0x770]
0000000000091258	add	x0, sp, #0x7a0
000000000009125c	add	x1, sp, #0x740
0000000000091260	bl	__ZNK14PCMatrix44TmplIdE17getTransformationER20PCMatrix44ParametersIdE
0000000000091264	ldp	d5, d12, [sp, #0x18]
0000000000091268	ldr	d0, [sp, #0x788]
000000000009126c	ldur	q1, [x24, #0xd0]
0000000000091270	ldr	q2, [sp, #0x30]
0000000000091274	fsub.2d	v2, v2, v1
0000000000091278	mov	x8, #0x2d18
000000000009127c	movk	x8, #0x5444, lsl #16
0000000000091280	movk	x8, #0x21fb, lsl #32
0000000000091284	movk	x8, #0x4019, lsl #48
0000000000091288	dup.2d	v3, x8
000000000009128c	fdiv.2d	v2, v2, v3
0000000000091290	fmov.2d	v4, #0.50000000
0000000000091294	fadd.2d	v2, v2, v4
0000000000091298	dup.2d	v4, x25
000000000009129c	fadd.2d	v2, v2, v4
00000000000912a0	frintm.2d	v2, v2
00000000000912a4	fcvtzs.2d	v2, v2
00000000000912a8	xtn.2s	v2, v2
00000000000912ac	sshll.2d	v2, v2, #0x0
00000000000912b0	scvtf.2d	v2, v2
00000000000912b4	fmul.2d	v2, v2, v3
00000000000912b8	fadd.2d	v1, v1, v2
00000000000912bc	fcmeq.2d	v2, v1, v1
00000000000912c0	ldr	q4, [sp, #0x110]
00000000000912c4	dup.2d	v3, v4[0]
00000000000912c8	bif.16b	v1, v3, v2
00000000000912cc	str	q1, [sp, #0x120]
00000000000912d0	ldr	d1, [sp, #0x28]
00000000000912d4	fsub	d1, d1, d0
00000000000912d8	fmov	d2, x8
00000000000912dc	fdiv	d1, d1, d2
00000000000912e0	fmov	d3, #0.50000000
00000000000912e4	fadd	d1, d1, d3
00000000000912e8	fmov	d3, x25
00000000000912ec	fadd	d1, d1, d3
00000000000912f0	fcvtms	w8, d1
00000000000912f4	scvtf	d1, w8
00000000000912f8	fmul	d1, d1, d2
00000000000912fc	fadd	d0, d0, d1
0000000000091300	fcmp	d0, d0
0000000000091304	fcsel	d0, d4, d0, vs
0000000000091308	str	d0, [sp, #0x130]
000000000009130c	add	x8, sp, #0x120
0000000000091310	ldr	d0, [x8, w21, sxtw #3]
0000000000091314	fabs	d1, d0
0000000000091318	mov	x9, #0x147b
000000000009131c	movk	x9, #0x47ae, lsl #16
0000000000091320	movk	x9, #0x7ae1, lsl #32
0000000000091324	movk	x9, #0x3f84, lsl #48
0000000000091328	fmov	d2, x9
000000000009132c	fcmp	d1, d2
0000000000091330	movi.2d	v1, #0000000000000000
0000000000091334	fcsel	d0, d1, d0, mi
0000000000091338	str	d0, [x8, w21, sxtw #3]
000000000009133c	mov	x8, #0xa9fc
0000000000091340	movk	x8, #0xd2f1, lsl #16
0000000000091344	movk	x8, #0x624d, lsl #32
0000000000091348	movk	x8, #0x3f50, lsl #48
000000000009134c	fmov	d0, x8
0000000000091350	ldr	d1, [sp, #0x8]
0000000000091354	fcmp	d1, d0
0000000000091358	b.pl	0x91370
000000000009135c	ldr	q0, [x20, #0x7c0]
0000000000091360	str	q0, [sp, #0x120]
0000000000091364	ldr	x8, [x20, #0x7d0]
0000000000091368	str	x8, [sp, #0x130]
000000000009136c	b	0x913b0
0000000000091370	str	d5, [sp, #0x7a8]
0000000000091374	adrp	x8, 97 ; 0xf2000
0000000000091378	add	x8, x8, #0x370
000000000009137c	add	x8, x8, #0x10
0000000000091380	str	x8, [sp, #0x7a0]
0000000000091384	ldr	q0, [sp, #0x120]
0000000000091388	str	q0, [sp, #0x7b0]
000000000009138c	ldr	d0, [sp, #0x130]
0000000000091390	str	d0, [sp, #0x7c0]
0000000000091394	add	x0, x20, #0x730
0000000000091398	add	x1, sp, #0x7a0
000000000009139c	bl	__ZN12OZValueCacheI18OZPointAtCacheItemE3addERKS0_
00000000000913a0	ldr	q0, [sp, #0x120]
00000000000913a4	str	q0, [x20, #0x7c0]
00000000000913a8	ldr	x8, [sp, #0x130]
00000000000913ac	str	x8, [x20, #0x7d0]
00000000000913b0	cmp	w19, #0x1
00000000000913b4	b.eq	0x913c4
00000000000913b8	cbnz	w19, 0x913cc
00000000000913bc	ldr	d8, [sp, #0x120]
00000000000913c0	b	0x913d0
00000000000913c4	ldr	d8, [sp, #0x128]
00000000000913c8	b	0x913d0
00000000000913cc	ldr	d8, [sp, #0x130]
00000000000913d0	ldr	x0, [sp, #0x670]
00000000000913d4	cbz	x0, 0x913e0
00000000000913d8	str	x0, [sp, #0x678]
00000000000913dc	bl	0xa89e8 ; symbol stub for: __ZdlPv
00000000000913e0	fadd	d0, d12, d8
00000000000913e4	b	0x901cc
00000000000913e8	b	0x91410
00000000000913ec	b	0x91450
00000000000913f0	b	0x91450
00000000000913f4	mov	x19, x0
00000000000913f8	add	x0, x26, #0x8
00000000000913fc	bl	0xa7614 ; symbol stub for: __ZN13PCSharedCountD1Ev
0000000000091400	b	0x91454
0000000000091404	b	0x91450
0000000000091408	b	0x91450
000000000009140c	b	0x91450
0000000000091410	mov	x19, x0
0000000000091414	add	x8, sp, #0x3b0
0000000000091418	add	x0, x8, #0x8
000000000009141c	bl	0xa7614 ; symbol stub for: __ZN13PCSharedCountD1Ev
0000000000091420	b	0x91454
0000000000091424	b	0x91450
0000000000091428	b	0x91450
000000000009142c	b	0x91450
0000000000091430	b	0x91450
0000000000091434	b	0x91450
0000000000091438	b	0x91450
000000000009143c	b	0x91450
0000000000091440	b	0x91450
0000000000091444	b	0x91450
0000000000091448	b	0x91450
000000000009144c	b	0x91450
0000000000091450	mov	x19, x0
0000000000091454	ldr	x0, [sp, #0x670]
0000000000091458	cbz	x0, 0x91464
000000000009145c	str	x0, [sp, #0x678]
0000000000091460	bl	0xa89e8 ; symbol stub for: __ZdlPv
0000000000091464	mov	x0, x19
0000000000091468	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
000000000009146c	bl	___clang_call_terminate
```

## Edge Collision

*Motion (simulation) behavior · 5 files · 11 instances*

Bounces a moving object off the frame (or a defined boundary) edges.

| Parameter | What it controls |
|---|---|
| Affect Subobjects | Also affect child objects. |

Other observed parameters (not individually described): `Bounce Strength`, `Active Edges`, `Height`, `Depth`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZBoundsCollisionBehavior`). This `handleCollisions` method is the behavior's **collision resolver (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method handleCollisions OZBoundsCollisionBehavior`

#### `OZBoundsCollisionBehavior::handleCollisions(OZTransformNode*, OZSimulationState*, OZSimulationState*, bool, bool*)`
```asm
0000000000011198	sub	sp, sp, #0x150
000000000001119c	stp	d15, d14, [sp, #0xb0]
00000000000111a0	stp	d13, d12, [sp, #0xc0]
00000000000111a4	stp	d11, d10, [sp, #0xd0]
00000000000111a8	stp	d9, d8, [sp, #0xe0]
00000000000111ac	stp	x28, x27, [sp, #0xf0]
00000000000111b0	stp	x26, x25, [sp, #0x100]
00000000000111b4	stp	x24, x23, [sp, #0x110]
00000000000111b8	stp	x22, x21, [sp, #0x120]
00000000000111bc	stp	x20, x19, [sp, #0x130]
00000000000111c0	stp	x29, x30, [sp, #0x140]
00000000000111c4	add	x29, sp, #0x140
00000000000111c8	str	x5, [sp, #0x10]
00000000000111cc	mov	x20, x3
00000000000111d0	mov	x24, x0
00000000000111d4	adrp	x8, 188 ; 0xcd000
00000000000111d8	ldr	x8, [x8, #0x998] ; literal pool symbol address: ___stack_chk_guard
00000000000111dc	ldr	x8, [x8]
00000000000111e0	str	x8, [sp, #0xa0]
00000000000111e4	cbz	x1, 0x11318
00000000000111e8	mov	x22, x1
00000000000111ec	adrp	x1, 188 ; 0xcd000
00000000000111f0	ldr	x1, [x1, #0x468] ; literal pool symbol address: __ZTI15OZTransformNode
00000000000111f4	adrp	x2, 188 ; 0xcd000
00000000000111f8	ldr	x2, [x2, #0x4e8] ; literal pool symbol address: __ZTI9OZElement
00000000000111fc	mov	x0, x22
0000000000011200	mov	x3, #0x0
0000000000011204	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
0000000000011208	mov	x21, x0
000000000001120c	cbz	x0, 0x1131c
0000000000011210	ldr	x8, [x22]
0000000000011214	ldr	x8, [x8, #0x400]
0000000000011218	mov	x0, x22
000000000001121c	blr	x8
0000000000011220	cbz	w0, 0x1131c
0000000000011224	ldr	x0, [x22, #0x8]
0000000000011228	adrp	x8, 158 ; 0xaf000
000000000001122c	ldr	q0, [x8, #0x430]
0000000000011230	str	q0, [sp, #0x40]
0000000000011234	add	x1, sp, #0x40
0000000000011238	bl	0xa88d4 ; symbol stub for: __ZNK9OZFactory13isKindOfClassE6PCUUID
000000000001123c	cbz	w0, 0x11318
0000000000011240	ldr	x8, [x22]
0000000000011244	ldr	x8, [x8, #0x408]
0000000000011248	mov	x0, x22
000000000001124c	blr	x8
0000000000011250	cbz	x0, 0x1131c
0000000000011254	add	x22, sp, #0x40
0000000000011258	stp	x22, x22, [sp, #0x40]
000000000001125c	str	xzr, [sp, #0x50]
0000000000011260	ldr	x8, [x0]
0000000000011264	ldr	x8, [x8, #0x30]
0000000000011268	add	x1, sp, #0x40
000000000001126c	blr	x8
0000000000011270	ldr	x19, [sp, #0x48]
0000000000011274	cmp	x19, x22
0000000000011278	b.eq	0x112d4
000000000001127c	add	x26, sp, #0x40
0000000000011280	adrp	x22, 188 ; 0xcd000
0000000000011284	ldr	x22, [x22, #0x4b8] ; literal pool symbol address: __ZTI20OZSimulationBehavior
0000000000011288	adrp	x23, 195 ; 0xd4000
000000000001128c	add	x23, x23, #0x270
0000000000011290	b	0x112a0
0000000000011294	ldr	x19, [x19, #0x8]
0000000000011298	cmp	x19, x26
000000000001129c	b.eq	0x112d4
00000000000112a0	ldr	x25, [x19, #0x10]
00000000000112a4	mov	x0, x25
00000000000112a8	ldr	x8, [x0, #0x10]!
00000000000112ac	ldr	x8, [x8, #0x28]
00000000000112b0	blr	x8
00000000000112b4	tbnz	w0, #0x0, 0x11294
00000000000112b8	mov	x0, x25
00000000000112bc	mov	x1, x22
00000000000112c0	mov	x2, x23
00000000000112c4	mov	x3, #0x0
00000000000112c8	bl	0xa8ab4 ; symbol stub for: ___dynamic_cast
00000000000112cc	cbnz	x0, 0x11294
00000000000112d0	mov	x21, #0x0
00000000000112d4	ldr	x8, [sp, #0x50]
00000000000112d8	cbz	x8, 0x1131c
00000000000112dc	ldp	x8, x0, [sp, #0x40]
00000000000112e0	ldr	x8, [x8, #0x8]
00000000000112e4	ldr	x9, [x0]
00000000000112e8	str	x8, [x9, #0x8]
00000000000112ec	str	x9, [x8]
00000000000112f0	str	xzr, [sp, #0x50]
00000000000112f4	add	x19, sp, #0x40
00000000000112f8	cmp	x0, x19
00000000000112fc	b.eq	0x1131c
0000000000011300	ldr	x22, [x0, #0x8]
0000000000011304	bl	0xa89e8 ; symbol stub for: __ZdlPv
0000000000011308	mov	x0, x22
000000000001130c	cmp	x22, x19
0000000000011310	b.ne	0x11300
0000000000011314	b	0x1131c
0000000000011318	mov	x21, #0x0
000000000001131c	ldr	q0, [x20, #0xb0]
0000000000011320	str	q0, [sp, #0x20]
0000000000011324	ldr	x8, [x20, #0xc0]
0000000000011328	str	x8, [sp, #0x30]
000000000001132c	add	x0, x24, #0x1f0
0000000000011330	add	x1, sp, #0x20
0000000000011334	movi.2d	v0, #0000000000000000
0000000000011338	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
000000000001133c	mov.16b	v8, v0
0000000000011340	add	x0, x24, #0x3a0
0000000000011344	add	x1, sp, #0x20
0000000000011348	movi.2d	v0, #0000000000000000
000000000001134c	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000011350	mov	x28, x0
0000000000011354	cmp	w0, #0x0
0000000000011358	cset	w19, ne
000000000001135c	add	x0, x24, #0x438
0000000000011360	add	x1, sp, #0x20
0000000000011364	movi.2d	v0, #0000000000000000
0000000000011368	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
000000000001136c	mov	x26, x0
0000000000011370	cmp	w0, #0x0
0000000000011374	cset	w22, ne
0000000000011378	add	x0, x24, #0x4d0
000000000001137c	add	x1, sp, #0x20
0000000000011380	movi.2d	v0, #0000000000000000
0000000000011384	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
0000000000011388	str	w0, [sp, #0x1c]
000000000001138c	ldr	w8, [sp, #0x1c]
0000000000011390	cmp	w8, #0x0
0000000000011394	cset	w25, ne
0000000000011398	add	x0, x24, #0x568
000000000001139c	add	x1, sp, #0x20
00000000000113a0	movi.2d	v0, #0000000000000000
00000000000113a4	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000113a8	mov	x27, x0
00000000000113ac	cmp	w0, #0x0
00000000000113b0	cset	w23, ne
00000000000113b4	add	x0, x24, #0x600
00000000000113b8	add	x1, sp, #0x20
00000000000113bc	movi.2d	v0, #0000000000000000
00000000000113c0	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000113c4	str	w0, [sp, #0xc]
00000000000113c8	add	x0, x24, #0x698
00000000000113cc	add	x1, sp, #0x20
00000000000113d0	movi.2d	v0, #0000000000000000
00000000000113d4	bl	0xa8880 ; symbol stub for: __ZNK9OZChannel13getValueAsIntERK6CMTimed
00000000000113d8	str	w0, [sp, #0x8]
00000000000113dc	add	x0, x24, #0x730
00000000000113e0	add	x1, sp, #0x20
00000000000113e4	movi.2d	v0, #0000000000000000
00000000000113e8	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
00000000000113ec	mov.16b	v9, v0
00000000000113f0	add	x0, x24, #0x7c8
00000000000113f4	add	x1, sp, #0x20
00000000000113f8	movi.2d	v0, #0000000000000000
00000000000113fc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000011400	mov.16b	v10, v0
0000000000011404	add	x0, x24, #0x860
0000000000011408	add	x1, sp, #0x20
000000000001140c	movi.2d	v0, #0000000000000000
0000000000011410	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000011414	orr	w8, w19, w22
0000000000011418	orr	w9, w25, w23
000000000001141c	orr	w8, w8, w9
0000000000011420	tbz	w8, #0x0, 0x11740
0000000000011424	fmov	d1, #-0.50000000
0000000000011428	fmul	d14, d9, d1
000000000001142c	fnmul	d13, d9, d1
0000000000011430	fmov	d1, #0.50000000
0000000000011434	fmul	d11, d10, d1
0000000000011438	fnmul	d12, d10, d1
000000000001143c	fmul	d9, d0, d1
0000000000011440	fnmul	d10, d0, d1
0000000000011444	cbz	x21, 0x1158c
0000000000011448	movi.2d	v0, #0000000000000000
000000000001144c	stp	q0, q0, [sp, #0x80]
0000000000011450	stp	q0, q0, [sp, #0x60]
0000000000011454	stp	q0, q0, [sp, #0x40]
0000000000011458	add	x19, sp, #0x40
000000000001145c	add	x2, sp, #0x40
0000000000011460	add	x3, x19, #0x18
0000000000011464	add	x4, x19, #0x30
0000000000011468	add	x5, x19, #0x48
000000000001146c	mov	x0, x20
0000000000011470	mov	x1, x21
0000000000011474	bl	0xa7b30 ; symbol stub for: __ZN17OZSimulationState21getTransformedCornersEP9OZElementP9PCVector3IdES4_S4_S4_
0000000000011478	mov	x8, #0xffffe0000000
000000000001147c	movk	x8, #0x47ef, lsl #48
0000000000011480	fmov	d0, x8
0000000000011484	ldp	d1, d2, [sp, #0x40]
0000000000011488	fminnm	d3, d1, d0
000000000001148c	fminnm	d4, d2, d0
0000000000011490	ldr	d5, [sp, #0x50]
0000000000011494	ldp	d6, d16, [sp, #0x60]
0000000000011498	fminnm	d0, d5, d0
000000000001149c	mov	x8, #0xffffe0000000
00000000000114a0	movk	x8, #0xc7ef, lsl #48
00000000000114a4	fmov	d7, x8
00000000000114a8	fmaxnm	d1, d1, d7
00000000000114ac	fmaxnm	d2, d2, d7
00000000000114b0	fmaxnm	d5, d5, d7
00000000000114b4	ldur	d7, [x19, #0x18]
00000000000114b8	fcmp	d3, d7
00000000000114bc	fcsel	d3, d7, d3, gt
00000000000114c0	fcmp	d4, d6
00000000000114c4	fcsel	d4, d6, d4, gt
00000000000114c8	ldr	d17, [sp, #0x78]
00000000000114cc	fcmp	d0, d16
00000000000114d0	fcsel	d0, d16, d0, gt
00000000000114d4	fcmp	d1, d7
00000000000114d8	fcsel	d1, d7, d1, mi
00000000000114dc	fcmp	d2, d6
00000000000114e0	fcsel	d2, d6, d2, mi
00000000000114e4	fcmp	d5, d16
00000000000114e8	fcsel	d5, d16, d5, mi
00000000000114ec	ldur	d6, [x19, #0x30]
00000000000114f0	fcmp	d3, d6
00000000000114f4	fcsel	d3, d6, d3, gt
00000000000114f8	fcmp	d4, d17
00000000000114fc	fcsel	d7, d17, d4, gt
0000000000011500	ldr	d4, [sp, #0x80]
0000000000011504	ldr	d16, [sp, #0x90]
0000000000011508	fcmp	d0, d4
000000000001150c	fcsel	d0, d4, d0, gt
0000000000011510	fcmp	d1, d6
0000000000011514	fcsel	d6, d6, d1, mi
0000000000011518	fcmp	d2, d17
000000000001151c	fcsel	d2, d17, d2, mi
0000000000011520	fcmp	d5, d4
0000000000011524	fcsel	d17, d4, d5, mi
0000000000011528	ldur	d5, [x19, #0x48]
000000000001152c	fcmp	d3, d5
0000000000011530	fcsel	d4, d5, d3, gt
0000000000011534	fcmp	d7, d16
0000000000011538	fcsel	d3, d16, d7, gt
000000000001153c	ldr	d7, [sp, #0x98]
0000000000011540	fcmp	d0, d7
0000000000011544	fcsel	d1, d7, d0, gt
0000000000011548	fcmp	d6, d5
000000000001154c	fcsel	d5, d5, d6, mi
0000000000011550	fcmp	d2, d16
0000000000011554	fcsel	d2, d16, d2, mi
0000000000011558	fcmp	d17, d7
000000000001155c	fcsel	d0, d7, d17, mi
0000000000011560	fsub	d6, d5, d4
0000000000011564	fsub	d7, d13, d14
0000000000011568	fcmp	d6, d7
000000000001156c	b.pl	0x11678
0000000000011570	cbz	w28, 0x11650
0000000000011574	fcmp	d4, d14
0000000000011578	b.pl	0x11650
000000000001157c	ldr	d5, [x20]
0000000000011580	fsub	d4, d14, d4
0000000000011584	fadd	d4, d4, d5
0000000000011588	b	0x11668
000000000001158c	cbz	w28, 0x115ac
0000000000011590	ldr	d0, [x20]
0000000000011594	fcmp	d0, d14
0000000000011598	b.pl	0x115ac
000000000001159c	str	d14, [x20]
00000000000115a0	ldr	d0, [x20, #0x38]
00000000000115a4	fnmul	d0, d8, d0
00000000000115a8	str	d0, [x20, #0x38]
00000000000115ac	cbz	w27, 0x115cc
00000000000115b0	ldr	d0, [x20, #0x8]
00000000000115b4	fcmp	d0, d12
00000000000115b8	b.pl	0x115cc
00000000000115bc	str	d12, [x20, #0x8]
00000000000115c0	ldr	d0, [x20, #0x40]
00000000000115c4	fnmul	d0, d8, d0
00000000000115c8	str	d0, [x20, #0x40]
00000000000115cc	ldr	w8, [sp, #0xc]
00000000000115d0	cbz	w8, 0x115f0
00000000000115d4	ldr	d0, [x20, #0x10]
00000000000115d8	fcmp	d0, d10
00000000000115dc	b.pl	0x115f0
00000000000115e0	str	d10, [x20, #0x10]
00000000000115e4	ldr	d0, [x20, #0x48]
00000000000115e8	fnmul	d0, d8, d0
00000000000115ec	str	d0, [x20, #0x48]
00000000000115f0	cbz	w26, 0x11610
00000000000115f4	ldr	d0, [x20]
00000000000115f8	fcmp	d0, d13
00000000000115fc	b.le	0x11610
0000000000011600	str	d13, [x20]
0000000000011604	ldr	d0, [x20, #0x38]
0000000000011608	fnmul	d0, d8, d0
000000000001160c	str	d0, [x20, #0x38]
0000000000011610	ldr	w8, [sp, #0x1c]
0000000000011614	cbz	w8, 0x11634
0000000000011618	ldr	d0, [x20, #0x8]
000000000001161c	fcmp	d0, d11
0000000000011620	b.le	0x11634
0000000000011624	str	d11, [x20, #0x8]
0000000000011628	ldr	d0, [x20, #0x40]
000000000001162c	fnmul	d0, d8, d0
0000000000011630	str	d0, [x20, #0x40]
0000000000011634	ldr	w8, [sp, #0x8]
0000000000011638	cbz	w8, 0x11738
000000000001163c	ldr	d0, [x20, #0x10]
0000000000011640	fcmp	d0, d9
0000000000011644	b.le	0x11738
0000000000011648	str	d9, [x20, #0x10]
000000000001164c	b	0x1172c
0000000000011650	cbz	w26, 0x11678
0000000000011654	fcmp	d5, d13
0000000000011658	b.le	0x11678
000000000001165c	ldr	d4, [x20]
0000000000011660	fsub	d5, d13, d5
0000000000011664	fadd	d4, d5, d4
0000000000011668	str	d4, [x20]
000000000001166c	ldr	d4, [x20, #0x38]
0000000000011670	fnmul	d4, d8, d4
0000000000011674	str	d4, [x20, #0x38]
0000000000011678	fsub	d4, d2, d3
000000000001167c	fadd	d5, d11, d11
0000000000011680	fcmp	d4, d5
0000000000011684	b.pl	0x116dc
0000000000011688	cbz	w27, 0x116b0
000000000001168c	fcmp	d3, d12
0000000000011690	b.pl	0x116b0
0000000000011694	ldr	d4, [x20, #0x8]
0000000000011698	fsub	d3, d12, d3
000000000001169c	fadd	d3, d3, d4
00000000000116a0	str	d3, [x20, #0x8]
00000000000116a4	ldr	d3, [x20, #0x40]
00000000000116a8	fnmul	d3, d8, d3
00000000000116ac	str	d3, [x20, #0x40]
00000000000116b0	ldr	w8, [sp, #0x1c]
00000000000116b4	cbz	w8, 0x116dc
00000000000116b8	fcmp	d2, d11
00000000000116bc	b.le	0x116dc
00000000000116c0	ldr	d3, [x20, #0x8]
00000000000116c4	fsub	d2, d11, d2
00000000000116c8	fadd	d2, d2, d3
00000000000116cc	str	d2, [x20, #0x8]
00000000000116d0	ldr	d2, [x20, #0x40]
00000000000116d4	fnmul	d2, d8, d2
00000000000116d8	str	d2, [x20, #0x40]
00000000000116dc	fsub	d2, d0, d1
00000000000116e0	fadd	d3, d9, d9
00000000000116e4	fcmp	d2, d3
00000000000116e8	b.pl	0x11738
00000000000116ec	ldr	w8, [sp, #0xc]
00000000000116f0	cbz	w8, 0x1170c
00000000000116f4	fcmp	d1, d10
00000000000116f8	b.pl	0x1170c
00000000000116fc	ldr	d0, [x20, #0x10]
0000000000011700	fsub	d1, d10, d1
0000000000011704	fadd	d0, d1, d0
0000000000011708	b	0x11728
000000000001170c	ldr	w8, [sp, #0x8]
0000000000011710	cbz	w8, 0x11738
0000000000011714	fcmp	d0, d9
0000000000011718	b.le	0x11738
000000000001171c	ldr	d1, [x20, #0x10]
0000000000011720	fsub	d0, d9, d0
0000000000011724	fadd	d0, d0, d1
0000000000011728	str	d0, [x20, #0x10]
000000000001172c	ldr	d0, [x20, #0x48]
0000000000011730	fnmul	d0, d8, d0
0000000000011734	str	d0, [x20, #0x48]
0000000000011738	ldr	x8, [sp, #0x10]
000000000001173c	strb	wzr, [x8]
0000000000011740	ldr	x8, [sp, #0xa0]
0000000000011744	adrp	x9, 188 ; 0xcd000
0000000000011748	ldr	x9, [x9, #0x998] ; literal pool symbol address: ___stack_chk_guard
000000000001174c	ldr	x9, [x9]
0000000000011750	cmp	x9, x8
0000000000011754	b.ne	0x11788
0000000000011758	ldp	x29, x30, [sp, #0x140]
000000000001175c	ldp	x20, x19, [sp, #0x130]
0000000000011760	ldp	x22, x21, [sp, #0x120]
0000000000011764	ldp	x24, x23, [sp, #0x110]
0000000000011768	ldp	x26, x25, [sp, #0x100]
000000000001176c	ldp	x28, x27, [sp, #0xf0]
0000000000011770	ldp	d9, d8, [sp, #0xe0]
0000000000011774	ldp	d11, d10, [sp, #0xd0]
0000000000011778	ldp	d13, d12, [sp, #0xc0]
000000000001177c	ldp	d15, d14, [sp, #0xb0]
0000000000011780	add	sp, sp, #0x150
0000000000011784	ret
0000000000011788	bl	0xa8ad8 ; symbol stub for: ___stack_chk_fail
000000000001178c	mov	x19, x0
0000000000011790	add	x0, sp, #0x40
0000000000011794	bl	__ZNSt3__110__list_impIP20OZGrowShrinkBehaviorNS_9allocatorIS2_EEED2Ev
0000000000011798	mov	x0, x19
000000000001179c	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
00000000000117a0	mov	x19, x0
00000000000117a4	add	x0, sp, #0x40
00000000000117a8	bl	__ZNSt3__110__list_impIP20OZGrowShrinkBehaviorNS_9allocatorIS2_EEED2Ev
00000000000117ac	mov	x0, x19
00000000000117b0	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
00000000000117b4	bl	0xa6f84 ; symbol stub for: __Unwind_Resume
```

## Rotational Drag

*Motion (simulation) behavior · 3 files · 14 instances*

Damps a spinning object's angular velocity over time.

| Parameter | What it controls |
|---|---|
| Amount | Angular damping strength. |
| Affect Subobjects | Also affect child objects. |

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZRotationalDragBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZRotationalDragBehavior`

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZSnapAlignBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZSnapAlignBehavior`

#### `OZSnapAlignBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
00000000000089c8	sub	sp, sp, #0x130
00000000000089cc	stp	d9, d8, [sp, #0xf0]
00000000000089d0	stp	x22, x21, [sp, #0x100]
00000000000089d4	stp	x20, x19, [sp, #0x110]
00000000000089d8	stp	x29, x30, [sp, #0x120]
00000000000089dc	add	x29, sp, #0x120
00000000000089e0	mov.16b	v8, v1
00000000000089e4	mov	x19, x1
00000000000089e8	mov	x20, x0
00000000000089ec	ldr	x8, [x0, #0x170]
00000000000089f0	ldr	x0, [x8, #0x20]
00000000000089f4	ldr	x8, [x0]
00000000000089f8	ldr	x9, [x8, #0x150]
00000000000089fc	add	x8, sp, #0x80
0000000000008a00	mov	x1, x2
0000000000008a04	blr	x9
0000000000008a08	ldr	q0, [sp, #0x80]
0000000000008a0c	str	q0, [sp, #0x30]
0000000000008a10	ldr	x8, [sp, #0x90]
0000000000008a14	str	x8, [sp, #0x40]
0000000000008a18	ldr	x8, [x20]
0000000000008a1c	ldr	x8, [x8, #0x128]
0000000000008a20	add	x1, sp, #0x30
0000000000008a24	mov	x0, x20
0000000000008a28	mov	w2, #0x0
0000000000008a2c	mov	w3, #0x1
0000000000008a30	mov	w4, #0x1
0000000000008a34	blr	x8
0000000000008a38	cbz	w0, 0x8be0
0000000000008a3c	sub	x21, x29, #0x88
0000000000008a40	add	x8, sp, #0x68
0000000000008a44	mov	x0, x20
0000000000008a48	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
0000000000008a4c	ldr	x8, [x20]
0000000000008a50	ldr	x9, [x8, #0x268]
0000000000008a54	add	x8, sp, #0x30
0000000000008a58	mov	x0, x20
0000000000008a5c	blr	x9
0000000000008a60	ldr	q0, [sp, #0x30]
0000000000008a64	stur	q0, [x29, #-0x50]
0000000000008a68	ldr	x8, [sp, #0x40]
0000000000008a6c	stur	x8, [x29, #-0x40]
0000000000008a70	ldur	q0, [sp, #0x48]
0000000000008a74	stur	q0, [x29, #-0x70]
0000000000008a78	ldr	x8, [sp, #0x58]
0000000000008a7c	stur	x8, [x29, #-0x60]
0000000000008a80	sub	x8, x29, #0x88
0000000000008a84	sub	x0, x29, #0x50
0000000000008a88	sub	x1, x29, #0x70
0000000000008a8c	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000008a90	ldr	q0, [x21]
0000000000008a94	stur	q0, [x29, #-0x50]
0000000000008a98	ldur	x8, [x29, #-0x78]
0000000000008a9c	stur	x8, [x29, #-0x40]
0000000000008aa0	ldur	q0, [sp, #0x68]
0000000000008aa4	stur	q0, [x29, #-0x70]
0000000000008aa8	ldr	x8, [sp, #0x78]
0000000000008aac	stur	x8, [x29, #-0x60]
0000000000008ab0	add	x8, sp, #0x18
0000000000008ab4	sub	x0, x29, #0x50
0000000000008ab8	sub	x1, x29, #0x70
0000000000008abc	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000008ac0	add	x0, x20, #0x4b0
0000000000008ac4	add	x1, sp, #0x80
0000000000008ac8	movi.2d	v0, #0000000000000000
0000000000008acc	bl	0xa88b0 ; symbol stub for: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed
0000000000008ad0	mov	x8, sp
0000000000008ad4	add	x0, sp, #0x68
0000000000008ad8	bl	0xa8a18 ; symbol stub for: __ZmlRK6CMTimed
0000000000008adc	ldur	q0, [sp, #0x18]
0000000000008ae0	stur	q0, [x29, #-0x50]
0000000000008ae4	ldr	x8, [sp, #0x28]
0000000000008ae8	stur	x8, [x29, #-0x40]
0000000000008aec	ldr	q0, [sp]
0000000000008af0	stur	q0, [x29, #-0x70]
0000000000008af4	ldr	x8, [sp, #0x10]
0000000000008af8	stur	x8, [x29, #-0x60]
0000000000008afc	sub	x8, x29, #0x88
0000000000008b00	sub	x0, x29, #0x50
0000000000008b04	sub	x1, x29, #0x70
0000000000008b08	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000008b0c	mov	x8, sp
0000000000008b10	mov	x0, x20
0000000000008b14	bl	0xa8544 ; symbol stub for: __ZNK10OZBehavior16getFrameDurationEv
0000000000008b18	ldr	q0, [sp, #0x80]
0000000000008b1c	stur	q0, [x29, #-0x50]
0000000000008b20	ldr	x8, [sp, #0x90]
0000000000008b24	stur	x8, [x29, #-0x40]
0000000000008b28	ldr	q0, [sp]
0000000000008b2c	stur	q0, [x29, #-0x70]
0000000000008b30	ldr	x8, [sp, #0x10]
0000000000008b34	stur	x8, [x29, #-0x60]
0000000000008b38	add	x8, sp, #0x18
0000000000008b3c	sub	x0, x29, #0x50
0000000000008b40	sub	x1, x29, #0x70
0000000000008b44	bl	0xa6f60 ; symbol stub for: _PC_CMTimeSaferAdd
0000000000008b48	ldur	q0, [sp, #0x18]
0000000000008b4c	stur	q0, [x29, #-0x50]
0000000000008b50	ldr	x8, [sp, #0x28]
0000000000008b54	stur	x8, [x29, #-0x40]
0000000000008b58	ldr	q0, [x21]
0000000000008b5c	stur	q0, [x29, #-0x70]
0000000000008b60	ldur	x8, [x29, #-0x78]
0000000000008b64	stur	x8, [x29, #-0x60]
0000000000008b68	sub	x0, x29, #0x50
0000000000008b6c	sub	x1, x29, #0x70
0000000000008b70	bl	0xa6e88 ; symbol stub for: _CMTimeCompare
0000000000008b74	tbnz	w0, #0x1f, 0x8bb8
0000000000008b78	ldr	q0, [x21]
0000000000008b7c	stur	q0, [x29, #-0x50]
0000000000008b80	ldur	x8, [x29, #-0x78]
0000000000008b84	stur	x8, [x29, #-0x40]
0000000000008b88	ldur	q0, [sp, #0x68]
0000000000008b8c	stur	q0, [x29, #-0x70]
0000000000008b90	ldr	x8, [sp, #0x78]
0000000000008b94	stur	x8, [x29, #-0x60]
0000000000008b98	add	x8, sp, #0x18
0000000000008b9c	sub	x0, x29, #0x50
0000000000008ba0	sub	x1, x29, #0x70
0000000000008ba4	bl	0xa6f6c ; symbol stub for: _PC_CMTimeSaferSubtract
0000000000008ba8	ldur	q0, [sp, #0x18]
0000000000008bac	str	q0, [sp, #0x80]
0000000000008bb0	ldr	x8, [sp, #0x28]
0000000000008bb4	str	x8, [sp, #0x90]
0000000000008bb8	ldr	q0, [sp, #0x80]
0000000000008bbc	stur	q0, [x29, #-0x50]
0000000000008bc0	ldr	x8, [sp, #0x90]
0000000000008bc4	stur	x8, [x29, #-0x40]
0000000000008bc8	sub	x2, x29, #0x50
0000000000008bcc	mov	x0, x20
0000000000008bd0	mov	x1, x19
0000000000008bd4	mov.16b	v0, v8
0000000000008bd8	bl	__ZN19OZSnapAlignBehavior11solveHelperEj6CMTimed
0000000000008bdc	mov.16b	v8, v0
0000000000008be0	mov.16b	v0, v8
0000000000008be4	ldp	x29, x30, [sp, #0x120]
0000000000008be8	ldp	x20, x19, [sp, #0x110]
0000000000008bec	ldp	x22, x21, [sp, #0x100]
0000000000008bf0	ldp	d9, d8, [sp, #0xf0]
0000000000008bf4	add	sp, sp, #0x130
0000000000008bf8	ret
```

## Stop

*Parameter behavior · 2 files · 9 instances*

Freezes the parameter at its value when the behavior starts (halts other animation from that point).

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZStopBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZStopBehavior`

#### `OZStopBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
000000000001f0d0	mov.16b	v0, v1
000000000001f0d4	ret
```

## Orbit Around

*Motion (simulation) behavior · 2 files · 3 instances*

Makes the object orbit around a target object.

| Parameter | What it controls |
|---|---|
| Object | The body orbited around. |

Other observed parameters (not individually described): `Strength`, `Influence`, `Pole Axis`.

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZVortexAroundBehavior`). This `accumInitialValues` method is the behavior's **simulation initial-value seeder** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumInitialValues OZVortexAroundBehavior`

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

### Decompiled code (ground truth)

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZReverseBehavior`). This `solveNode` method is the behavior's **per-frame channel value solver** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method solveNode OZReverseBehavior`

#### `OZReverseBehavior::solveNode(unsigned int, CMTime const&, double, double)`
```asm
000000000001fcb8	mov.16b	v0, v1
000000000001fcbc	ret
```

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

Verbatim ARM64 disassembly from the user's licensed FCP install (`Ozone.framework/…/Behaviors.ozp`, class `OZAttractorBehavior`). This `accumForces` method is the behavior's **simulation force accumulator (per sub-step)** — the actual per-frame algorithm Apple ships, not a paraphrase. Regenerate: `venv/bin/python3 tools/re/disasm_behavior.py --method accumForces OZAttractorBehavior`

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

