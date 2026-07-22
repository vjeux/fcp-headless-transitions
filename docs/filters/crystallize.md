# Crystallize

- **PAE class:** `Crystallize`
- **Plugin UUID:** `9D6E32F9-7C04-4207-B1B5-A480780B2B9D`
- **Node names in corpus:** Crystallize (14), Crystallize Out (1), Crystallize In (1)
- **Corpus usage:** 14 files, 16 instances

## What it does

Crystallize breaks the image into randomly-shaped crystal cells (a Voronoi/cellular mosaic), filling each cell with a single averaged color so the picture looks like it is seen through cut glass. Size sets the crystal scale, Speed animates the cells, and Feathering softens cell edges.

> **Note.** Not implemented; description is the standard Apple Motion "Crystallize" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float (pixels) | 8 | 3 .. 64 | Size of the crystal cells, ~3-64 (default 8). *(keyframed in 4 instances)* |
| Speed | float | 0.5 | 0 .. 2 | Animation rate of the crystal pattern, 0-2 (default 0.5). |
| Smooth | bool | 1 | 0 .. 1 | Smooth the cell coloring rather than flat-fill. |
| Feathering | float | 0.25 | 0 .. 2 | Softness of the cell boundaries, 0-2 (default 0.25). |
| Mix | float | 1 | 0.9 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 4 instances)* |
| Smoothness | bool | 1 | 1 .. 1 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGGLNode`, `HGaussianBlur`. The primitive's math lives in the Helium framework binary; disassemble it with `otool -arch arm64 -tV "…/Helium.framework/Versions/A/Helium" | grep -A400 '<primitive>'`.

### CPU render method — `-[PAECrystallize canThrowRenderOutputHe:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAECrystallize`

```asm
000000000001ed5c	mov	w3, #0x1
000000000001ed60	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001ed64	ldr	d9, [sp, #0x158]
000000000001ed68	fmul	d0, d11, d9
000000000001ed6c	str	d0, [sp, #0x158]
000000000001ed70	ldr	x4, [x25]
000000000001ed74	add	x2, sp, #0x150
000000000001ed78	mov	x0, x26
000000000001ed7c	mov	w3, #0x2
000000000001ed80	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001ed84	ldr	x4, [x25]
000000000001ed88	add	x2, sp, #0x14f
000000000001ed8c	mov	x0, x26
000000000001ed90	mov	w3, #0x3
000000000001ed94	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001ed98	ldr	x4, [x25]
000000000001ed9c	add	x2, sp, #0x140
000000000001eda0	mov	x0, x26
000000000001eda4	mov	w3, #0x4
000000000001eda8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001edac	mov	w0, #0x1b0
000000000001edb0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001edb4	mov	x19, x0
000000000001edb8	mov	x1, #0x0
000000000001edbc	bl	0x251ae0 ; symbol stub for: __ZN8HGGLNodeC1Em
000000000001edc0	adrp	x8, 587 ; 0x269000
000000000001edc4	ldr	s8, [x8, #0x610]
000000000001edc8	mov	x0, x19
000000000001edcc	mov	w1, #0x84f5
000000000001edd0	mov	w2, #0x2801
000000000001edd4	mov.16b	v0, v8
000000000001edd8	str	x19, [sp, #0x58]
000000000001eddc	bl	0x251a20 ; symbol stub for: __ZN8HGGLNode16hglTexParameteriEjjf
000000000001ede0	mov	x0, x19
000000000001ede4	mov	w1, #0x84f5
000000000001ede8	mov	w2, #0x2800
000000000001edec	mov.16b	v0, v8
000000000001edf0	bl	0x251a20 ; symbol stub for: __ZN8HGGLNode16hglTexParameteriEjjf
000000000001edf4	cbz	w20, 0x1ee38
000000000001edf8	fmov	s0, #1.00000000
000000000001edfc	fmov	s1, #-1.00000000
000000000001ee00	fmov	s2, #1.00000000
000000000001ee04	mov	x0, x19
000000000001ee08	bl	0x251ad4 ; symbol stub for: __ZN8HGGLNode9hglScalefEfff
000000000001ee0c	mov	x0, x19
000000000001ee10	mov	w1, #0x1702
000000000001ee14	bl	0x25199c ; symbol stub for: __ZN8HGGLNode13hglMatrixModeEj
000000000001ee18	mov	x0, x19
000000000001ee1c	mov	w1, #0x84c0
000000000001ee20	bl	0x251a08 ; symbol stub for: __ZN8HGGLNode16hglActiveTextureEj
000000000001ee24	fmov	s0, #1.00000000
000000000001ee28	fmov	s1, #-1.00000000
000000000001ee2c	fmov	s2, #1.00000000
000000000001ee30	mov	x0, x19
000000000001ee34	bl	0x251ad4 ; symbol stub for: __ZN8HGGLNode9hglScalefEfff
000000000001ee38	mov	x0, x19
000000000001ee3c	bl	0x251a44 ; symbol stub for: __ZN8HGGLNode18hglEnableDepthTestEv
000000000001ee40	mov	x0, x19
000000000001ee44	bl	0x2519e4 ; symbol stub for: __ZN8HGGLNode15hglClearToBlackEv
000000000001ee48	mov	w0, #0x1f0
000000000001ee4c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001ee50	mov	x20, x0
000000000001ee54	movi.2d	v0, #0000000000000000
000000000001ee58	stp	q0, q0, [x0, #0x1d0]
000000000001ee5c	stp	q0, q0, [x0, #0x1b0]
000000000001ee60	stp	q0, q0, [x0, #0x190]
000000000001ee64	stp	q0, q0, [x0, #0x170]
000000000001ee68	stp	q0, q0, [x0, #0x150]
000000000001ee6c	stp	q0, q0, [x0, #0x130]
000000000001ee70	stp	q0, q0, [x0, #0x110]
000000000001ee74	stp	q0, q0, [x0, #0xf0]
000000000001ee78	stp	q0, q0, [x0, #0xd0]
000000000001ee7c	stp	q0, q0, [x0, #0xb0]
000000000001ee80	stp	q0, q0, [x0, #0x90]
000000000001ee84	stp	q0, q0, [x0, #0x70]
000000000001ee88	stp	q0, q0, [x0, #0x50]
000000000001ee8c	stp	q0, q0, [x0, #0x30]
000000000001ee90	stp	q0, q0, [x0, #0x10]
000000000001ee94	str	q0, [x0]
000000000001ee98	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
000000000001ee9c	adrp	x8, 877 ; 0x38b000
000000000001eea0	add	x8, x8, #0x700
000000000001eea4	str	x8, [x20]
000000000001eea8	str	xzr, [x20, #0x1e0]
000000000001eeac	stp	xzr, xzr, [x20, #0x198]
000000000001eeb0	ldp	d10, d0, [sp, #0x150]
000000000001eeb4	str	q0, [sp, #0x100]
000000000001eeb8	ldr	x2, [x25]
000000000001eebc	str	x21, [sp, #0x60]
000000000001eec0	mov	x0, x21
000000000001eec4	str	x20, [sp, #0x50]
000000000001eec8	bl	"_objc_msgSend$secondsFromFxTime:"
000000000001eecc	mov.16b	v8, v0
000000000001eed0	fmov	s0, w28
000000000001eed4	fmov	s1, w27
000000000001eed8	ldr	x8, [sp, #0x110]
000000000001eedc	mov.s	v0[1], w8
000000000001eee0	mov.s	v1[1], w24
000000000001eee4	scvtf	d3, w27, #0x1
000000000001eee8	scvtf	d2, w24, #0x1
000000000001eeec	stp	d2, d3, [sp, #0x40]
000000000001eef0	fabs	d2, d12
000000000001eef4	mov	w25, #0x4d69
000000000001eef8	movk	w25, #0x2, lsl #16
000000000001eefc	add	x8, sp, #0x228
000000000001ef00	add	x26, x8, #0x8
000000000001ef04	fmul	d2, d2, d9
000000000001ef08	mov	w10, #0x2323
000000000001ef0c	movk	w10, #0x2323, lsl #16
000000000001ef10	mov	w9, #0x8
000000000001ef14	mov	x27, #0x2319
000000000001ef18	movk	x27, #0x8187, lsl #16
000000000001ef1c	movk	x27, #0x9956, lsl #32
000000000001ef20	movk	x27, #0x5dfc, lsl #48
000000000001ef24	mov	w11, #0xe529
000000000001ef28	movk	w11, #0xa, lsl #16
000000000001ef2c	add	x10, x25, x10, lsl #12
000000000001ef30	umulh	x12, x10, x27
000000000001ef34	lsr	x12, x12, #18
000000000001ef38	msub	x10, x12, x11, x10
000000000001ef3c	str	x10, [x8, x9]
000000000001ef40	add	x9, x9, #0x8
000000000001ef44	cmp	x9, #0x330
000000000001ef48	b.ne	0x1ef2c
000000000001ef4c	scvtf.2s	v1, v1
000000000001ef50	str	q2, [sp, #0x30]
000000000001ef54	ldr	q3, [sp, #0x100]
000000000001ef58	mov.d	v3[1], v2[0]
000000000001ef5c	scvtf.2s	v0, v0
000000000001ef60	fcvtn	v4.2s, v3.2d
000000000001ef64	fadd.2s	v13, v4, v4
000000000001ef68	movi.2s	v2, #0x3f, lsl #24
000000000001ef6c	fmul.2s	v14, v1, v2
000000000001ef70	fabs.2s	v1, v14
000000000001ef74	fadd.2s	v1, v1, v1
000000000001ef78	fcmgt.2s	v3, v1, v0
000000000001ef7c	bit.8b	v0, v1, v3
000000000001ef80	fadd.2s	v3, v0, v13
000000000001ef84	fdiv.2s	v0, v3, v4
000000000001ef88	frintm	s0, s0
000000000001ef8c	fmul	s0, s0, s4
000000000001ef90	fsub	s0, s3, s0
000000000001ef94	fmov	s1, #0.50000000
000000000001ef98	fmul	s0, s0, s1
000000000001ef9c	fmul.2s	v5, v3, v2
000000000001efa0	mov	s15, v4[1]
000000000001efa4	stp	q5, q3, [sp, #0xb0]
000000000001efa8	mov	s2, v3[1]
000000000001efac	fdiv	s3, s2, s15
000000000001efb0	frintm	s3, s3
000000000001efb4	fmul.s	s3, s3, v4[1]
000000000001efb8	fsub	s2, s2, s3
000000000001efbc	fmul	s1, s2, s1
000000000001efc0	mov	s2, v5[1]
000000000001efc4	fsub	s1, s1, s2
000000000001efc8	stp	q4, q1, [sp, #0xd0]
000000000001efcc	fsub	s1, s2, s1
000000000001efd0	fdiv	s1, s1, s15
000000000001efd4	fcvtps	w8, s1
000000000001efd8	fsub	s0, s0, s5
000000000001efdc	str	s0, [sp, #0x74]
000000000001efe0	fsub	s0, s5, s0
000000000001efe4	fdiv	s0, s0, s4
000000000001efe8	fcvtps	w9, s0
000000000001efec	and	w10, w8, #0x1
000000000001eff0	add	w21, w10, w8
000000000001eff4	and	w8, w9, #0x1
000000000001eff8	add	w8, w8, w9
000000000001effc	str	x8, [sp, #0x88]
000000000001f000	mul	w8, w21, w8
000000000001f004	sxtw	x9, w8
000000000001f008	sbfiz	x10, x8, #1, #32
000000000001f00c	add	x8, x10, w8, sxtw
000000000001f010	lsl	x8, x8, #3
000000000001f014	mov	w10, #0x18
000000000001f018	umulh	x9, x9, x10
000000000001f01c	cmp	xzr, x9
000000000001f020	csinv	x0, x8, xzr, eq
000000000001f024	bl	0x251fb4 ; symbol stub for: __Znam
000000000001f028	str	x0, [sp, #0x78]
000000000001f02c	stp	d12, d11, [sp, #0x10]
000000000001f030	stp	x23, x22, [sp, #0x20]
000000000001f034	cmp	w21, #0x1
000000000001f038	ldp	q4, q5, [sp, #0xd0]
000000000001f03c	ldr	x9, [sp, #0x88]
000000000001f040	b.lt	0x1f26c
000000000001f044	mov	x19, #0x0
000000000001f048	fcvt	s0, d10
000000000001f04c	fcvt	s6, d8
000000000001f050	mov	w8, #0x42700000
000000000001f054	fmov	s1, w8
000000000001f058	fmul	s7, s0, s1
000000000001f05c	mov	w8, #0x447a0000
000000000001f060	dup.2s	v0, w8
000000000001f064	ldr	q1, [sp, #0xc0]
000000000001f068	fmul.2s	v11, v1, v0
000000000001f06c	sxtw	x8, w9
000000000001f070	str	x8, [sp, #0x68]
000000000001f074	mov	w24, #0xf638
000000000001f078	movk	w24, #0x6, lsl #16
000000000001f07c	mov	x22, #0xaee5
000000000001f080	movk	x22, #0x2d9f, lsl #16
000000000001f084	movk	x22, #0x8656, lsl #32
000000000001f088	movk	x22, #0x446f, lsl #48
000000000001f08c	mov	w20, #0x65
000000000001f090	adrp	x8, 586 ; 0x269000
000000000001f094	ldr	s12, [x8, #0x614]
000000000001f098	mov	w8, #0x5290
000000000001f09c	movk	w8, #0x492e, lsl #16
000000000001f0a0	dup.2s	v10, w8
000000000001f0a4	mov	w23, #0xe529
000000000001f0a8	movk	w23, #0xa, lsl #16
000000000001f0ac	fmov.2s	v9, #-1.00000000
000000000001f0b0	mov	s8, v1[1]
000000000001f0b4	str	x21, [sp, #0x80]
000000000001f0b8	stp	q7, q6, [sp, #0x90]
000000000001f0bc	cmp	w9, #0x1
000000000001f0c0	b.lt	0x1f258
000000000001f0c4	ldr	x8, [sp, #0x68]
000000000001f0c8	mul	x8, x19, x8
000000000001f0cc	ldr	x10, [sp, #0x78]
000000000001f0d0	mov	w11, #0x18
000000000001f0d4	madd	x28, x8, x11, x10
000000000001f0d8	mov	x21, x9
000000000001f0dc	ldr	s16, [sp, #0x74]
000000000001f0e0	str	q5, [sp, #0xe0]
000000000001f0e4	str	q16, [sp, #0x110]
000000000001f0e8	umulh	x8, x24, x22
000000000001f0ec	sub	x9, x24, x8
000000000001f0f0	add	x8, x8, x9, lsr #1
000000000001f0f4	lsr	x8, x8, #6
000000000001f0f8	msub	x8, x8, x20, x24
000000000001f0fc	ldr	x9, [x26, x8, lsl #3]
000000000001f100	add	x10, x25, x9, lsl #12
000000000001f104	umulh	x11, x10, x27
000000000001f108	lsr	x11, x11, #18
000000000001f10c	msub	x10, x11, x23, x10
000000000001f110	str	x10, [x26, x8, lsl #3]
000000000001f114	ucvtf	s0, x9
000000000001f118	umulh	x8, x9, x22
000000000001f11c	sub	x10, x9, x8
000000000001f120	add	x8, x8, x10, lsr #1
000000000001f124	lsr	x8, x8, #6
000000000001f128	msub	x8, x8, x20, x9
000000000001f12c	ldr	x9, [x26, x8, lsl #3]
000000000001f130	add	x10, x25, x9, lsl #12
000000000001f134	umulh	x11, x10, x27
000000000001f138	lsr	x11, x11, #18
000000000001f13c	msub	x10, x11, x23, x10
000000000001f140	str	x10, [x26, x8, lsl #3]
000000000001f144	ucvtf	s1, x9
000000000001f148	umulh	x8, x9, x22
000000000001f14c	sub	x10, x9, x8
000000000001f150	add	x8, x8, x10, lsr #1
000000000001f154	lsr	x8, x8, #6
000000000001f158	msub	x8, x8, x20, x9
000000000001f15c	ldr	x9, [x26, x8, lsl #3]
000000000001f160	add	x10, x25, x9, lsl #12
000000000001f164	umulh	x11, x10, x27
000000000001f168	lsr	x11, x11, #18
000000000001f16c	msub	x10, x11, x23, x10
000000000001f170	str	x10, [x26, x8, lsl #3]
000000000001f174	ucvtf	s2, x9
000000000001f178	fdiv	s2, s2, s12
000000000001f17c	fadd	s2, s2, s2
000000000001f180	umulh	x8, x9, x22
000000000001f184	sub	x10, x9, x8
000000000001f188	add	x8, x8, x10, lsr #1
000000000001f18c	lsr	x8, x8, #6
000000000001f190	msub	x8, x8, x20, x9
000000000001f194	ldr	x24, [x26, x8, lsl #3]
000000000001f198	add	x9, x25, x24, lsl #12
000000000001f19c	umulh	x10, x9, x27
000000000001f1a0	lsr	x10, x10, #18
000000000001f1a4	msub	x9, x10, x23, x9
000000000001f1a8	str	x9, [x26, x8, lsl #3]
000000000001f1ac	ucvtf	s3, x24
000000000001f1b0	fdiv	s3, s3, s12
000000000001f1b4	fadd	s3, s3, s3
000000000001f1b8	mov.s	v0[1], v1[0]
000000000001f1bc	fdiv.2s	v0, v0, v10
000000000001f1c0	fmul.2s	v0, v13, v0
000000000001f1c4	mov.s	v2[1], v3[0]
000000000001f1c8	fsub.2s	v0, v0, v4
000000000001f1cc	fadd.2s	v1, v2, v9
000000000001f1d0	fmul.2s	v1, v1, v7[0]
000000000001f1d4	fmul.2s	v1, v1, v6[0]
000000000001f1d8	fadd.2s	v0, v0, v1
000000000001f1dc	mov.16b	v1, v16
000000000001f1e0	mov.s	v1[1], v5[0]
000000000001f1e4	fadd.2s	v0, v1, v0
000000000001f1e8	ldr	q1, [sp, #0xb0]
000000000001f1ec	fadd.2s	v0, v1, v0
000000000001f1f0	fadd.2s	v0, v11, v0
000000000001f1f4	str	q0, [sp, #0xf0]
000000000001f1f8	mov	s0, v0[1]
000000000001f1fc	mov.16b	v1, v8
000000000001f200	bl	0x2521b8 ; symbol stub for: _fmodf
000000000001f204	str	q0, [sp, #0x100]
000000000001f208	ldr	q0, [sp, #0xf0]
000000000001f20c	ldr	q1, [sp, #0xc0]
000000000001f210	bl	0x2521b8 ; symbol stub for: _fmodf
000000000001f214	ldp	q1, q16, [sp, #0x100]
000000000001f218	ldp	q7, q6, [sp, #0x90]
000000000001f21c	ldp	q4, q5, [sp, #0xd0]
000000000001f220	mov.s	v0[1], v1[0]
000000000001f224	fsub.2s	v0, v0, v4
000000000001f228	fsub.2s	v0, v0, v14
000000000001f22c	str	d0, [x28]
000000000001f230	fsub.2s	v1, v0, v13
000000000001f234	add	x8, x28, #0x14
000000000001f238	st1.s	{ v1 }[1], [x8]
000000000001f23c	str	s1, [x28, #0x8]
000000000001f240	fadd.2s	v0, v13, v0
000000000001f244	stur	d0, [x28, #0xc]
000000000001f248	add	x28, x28, #0x18
000000000001f24c	fadd	s16, s16, s4
000000000001f250	subs	w21, w21, #0x1
000000000001f254	b.ne	0x1f0e4
000000000001f258	fadd	s5, s5, s15
000000000001f25c	add	x19, x19, #0x1
000000000001f260	ldp	x21, x9, [sp, #0x80]
000000000001f264	cmp	x19, x21
000000000001f268	b.ne	0x1f0bc
000000000001f26c	ldr	x20, [sp, #0x50]
000000000001f270	ldr	x0, [x20, #0x198]
000000000001f274	ldr	x8, [sp, #0x78]
000000000001f278	str	x8, [x20, #0x198]
000000000001f27c	cbz	x0, 0x1f288
000000000001f280	bl	0x251f9c ; symbol stub for: __ZdlPv
000000000001f284	ldr	x9, [sp, #0x88]
000000000001f288	str	w21, [x20, #0x1a4]
000000000001f28c	str	w9, [x20, #0x1a0]
000000000001f290	ldr	d1, [sp, #0x158]
000000000001f294	ldr	q0, [sp, #0x30]
000000000001f298	stp	d1, d0, [x20, #0x1a8]
000000000001f29c	ldp	d0, d9, [sp, #0x10]
000000000001f2a0	fcvt	s1, d9
000000000001f2a4	fcvt	s0, d0
000000000001f2a8	fabs	s2, s0
000000000001f2ac	stp	q2, q1, [sp, #0x100]
000000000001f2b0	mov.16b	v0, v1
000000000001f2b4	mov.s	v0[1], v2[0]
000000000001f2b8	ldp	d1, d2, [sp, #0x40]
000000000001f2bc	stp	d2, d1, [x20, #0x1b8]
000000000001f2c0	fmov.2s	v1, #1.00000000
000000000001f2c4	fdiv.2s	v0, v1, v0
000000000001f2c8	str	q0, [x20, #0x1d0]
000000000001f2cc	ldr	x0, [x20, #0x1e0]
000000000001f2d0	ldr	x19, [sp, #0x58]
000000000001f2d4	cmp	x0, x19
000000000001f2d8	ldp	x22, x21, [sp, #0x20]
000000000001f2dc	b.eq	0x1f308
000000000001f2e0	cbz	x0, 0x1f2f0
000000000001f2e4	ldr	x8, [x0]
000000000001f2e8	ldr	x8, [x8, #0x18]
000000000001f2ec	blr	x8
000000000001f2f0	str	x19, [x20, #0x1e0]
000000000001f2f4	cbz	x19, 0x1f308
000000000001f2f8	ldr	x8, [x19]
000000000001f2fc	ldr	x8, [x8, #0x10]
000000000001f300	mov	x0, x19
000000000001f304	blr	x8
000000000001f308	cbz	x22, 0x1f31c
000000000001f30c	add	x8, sp, #0x138
000000000001f310	mov	x0, x22
000000000001f314	bl	_objc_msgSend$heliumRef
000000000001f318	b	0x1f320
000000000001f31c	str	xzr, [sp, #0x138]
000000000001f320	mov	x0, x22
000000000001f324	bl	_objc_msgSend$bounds
000000000001f328	str	d0, [sp, #0x228]
000000000001f32c	str	d1, [sp, #0x230]
000000000001f330	str	d2, [sp, #0x238]
000000000001f334	str	d3, [sp, #0x240]
000000000001f338	add	x0, sp, #0x160
000000000001f33c	add	x1, sp, #0x228
000000000001f340	add	x2, sp, #0x228
000000000001f344	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
000000000001f348	mov	x25, x0
000000000001f34c	tbz	w0, #0x0, 0x1f5b4
000000000001f350	ldr	x0, [sp, #0x138]
000000000001f354	str	x0, [sp, #0x128]
000000000001f358	cbz	x0, 0x1f368
000000000001f35c	ldr	x8, [x0]
000000000001f360	ldr	x8, [x8, #0x10]
000000000001f364	blr	x8
000000000001f368	ldr	x0, [sp, #0x60]
000000000001f36c	cbz	x0, 0x1f394
000000000001f370	add	x8, sp, #0x130
000000000001f374	add	x2, sp, #0x128
000000000001f378	add	x3, sp, #0x228
000000000001f37c	bl	"_objc_msgSend$changeDOD:withRect:"
000000000001f380	ldp	x0, x8, [sp, #0x130]
000000000001f384	cmp	x8, x0
000000000001f388	b.eq	0x1f620
000000000001f38c	cbnz	x8, 0x1f3a0
000000000001f390	b	0x1f3b4
000000000001f394	str	xzr, [sp, #0x130]
000000000001f398	ldr	x8, [sp, #0x138]
000000000001f39c	cbz	x8, 0x1f3b8
000000000001f3a0	ldr	x9, [x8]
000000000001f3a4	ldr	x9, [x9, #0x18]
000000000001f3a8	mov	x0, x8
000000000001f3ac	blr	x9
000000000001f3b0	ldr	x0, [sp, #0x130]
000000000001f3b4	stp	xzr, x0, [sp, #0x130]
000000000001f3b8	ldr	x0, [sp, #0x128]
000000000001f3bc	cbz	x0, 0x1f3cc
000000000001f3c0	ldr	x8, [x0]
000000000001f3c4	ldr	x8, [x8, #0x18]
000000000001f3c8	blr	x8
000000000001f3cc	ldr	x0, [sp, #0x138]
000000000001f3d0	str	x0, [sp, #0x120]
000000000001f3d4	cbz	x0, 0x1f3e4
000000000001f3d8	ldr	x8, [x0]
000000000001f3dc	ldr	x8, [x8, #0x10]
000000000001f3e0	blr	x8
000000000001f3e4	ldr	x0, [sp, #0x60]
000000000001f3e8	cbz	x0, 0x1f414
000000000001f3ec	add	x8, sp, #0x130
000000000001f3f0	add	x2, sp, #0x120
000000000001f3f4	mov	x3, x22
000000000001f3f8	mov	x4, x22
000000000001f3fc	bl	"_objc_msgSend$smear:fromImage:toImage:"
000000000001f400	ldp	x0, x8, [sp, #0x130]
000000000001f404	cmp	x8, x0
000000000001f408	b.eq	0x1f634
000000000001f40c	cbnz	x8, 0x1f420
000000000001f410	b	0x1f434
000000000001f414	str	xzr, [sp, #0x130]
000000000001f418	ldr	x8, [sp, #0x138]
000000000001f41c	cbz	x8, 0x1f438
000000000001f420	ldr	x9, [x8]
000000000001f424	ldr	x9, [x9, #0x18]
000000000001f428	mov	x0, x8
000000000001f42c	blr	x9
000000000001f430	ldr	x0, [sp, #0x130]
000000000001f434	stp	xzr, x0, [sp, #0x130]
000000000001f438	ldr	x0, [sp, #0x120]
000000000001f43c	cbz	x0, 0x1f44c
000000000001f440	ldr	x8, [x0]
000000000001f444	ldr	x8, [x8, #0x18]
000000000001f448	blr	x8
000000000001f44c	ldrb	w8, [sp, #0x14f]
000000000001f450	cmp	w8, #0x1
000000000001f454	b.ne	0x1f4f4
000000000001f458	ldr	d8, [sp, #0x158]
000000000001f45c	mov	w0, #0x1b0
000000000001f460	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001f464	mov	x24, x0
000000000001f468	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
000000000001f46c	ldr	w8, [sp, #0xc]
000000000001f470	cmp	w8, #0x0
000000000001f474	cset	w1, eq
000000000001f478	fdiv	d0, d8, d9
000000000001f47c	fmov	d1, #3.00000000
000000000001f480	fdiv	d0, d0, d1
000000000001f484	fcvt	s0, d0
000000000001f488	mov	x0, x24
000000000001f48c	ldp	q2, q1, [sp, #0x100]
000000000001f490	mov	w2, #0x0
000000000001f494	mov	w3, #0x0
000000000001f498	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
000000000001f49c	ldr	x2, [sp, #0x138]
000000000001f4a0	ldr	x8, [x24]
000000000001f4a4	ldr	x8, [x8, #0x78]
000000000001f4a8	mov	x0, x24
000000000001f4ac	mov	w1, #0x0
000000000001f4b0	blr	x8
000000000001f4b4	ldr	x0, [sp, #0x138]
000000000001f4b8	cmp	x0, x24
000000000001f4bc	b.eq	0x1f4e4
000000000001f4c0	cbz	x0, 0x1f4d0
000000000001f4c4	ldr	x8, [x0]
000000000001f4c8	ldr	x8, [x8, #0x18]
000000000001f4cc	blr	x8
000000000001f4d0	str	x24, [sp, #0x138]
000000000001f4d4	ldr	x8, [x24]
000000000001f4d8	ldr	x8, [x8, #0x10]
000000000001f4dc	mov	x0, x24
000000000001f4e0	blr	x8
000000000001f4e4	ldr	x8, [x24]
000000000001f4e8	ldr	x8, [x8, #0x18]
000000000001f4ec	mov	x0, x24
000000000001f4f0	blr	x8
000000000001f4f4	ldr	x2, [sp, #0x138]
000000000001f4f8	ldr	x8, [x19]
000000000001f4fc	ldr	x8, [x8, #0x78]
000000000001f500	mov	x0, x19
000000000001f504	mov	w1, #0x0
000000000001f508	blr	x8
000000000001f50c	mov	w0, #0x1b0
000000000001f510	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001f514	mov	x24, x0
000000000001f518	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
000000000001f51c	ldr	w8, [sp, #0xc]
000000000001f520	cmp	w8, #0x0
000000000001f524	cset	w1, eq
000000000001f528	ldr	d0, [sp, #0x140]
000000000001f52c	fcvt	s0, d0
000000000001f530	mov	x0, x24
000000000001f534	ldp	q2, q1, [sp, #0x100]
000000000001f538	mov	w2, #0x0
000000000001f53c	mov	w3, #0x0
000000000001f540	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
000000000001f544	ldr	x8, [x24]
000000000001f548	ldr	x8, [x8, #0x78]
000000000001f54c	mov	x0, x24
000000000001f550	mov	w1, #0x0
000000000001f554	mov	x2, x20
000000000001f558	blr	x8
000000000001f55c	str	x24, [sp, #0x130]
000000000001f560	ldr	x8, [x24]
000000000001f564	ldr	x8, [x8, #0x10]
000000000001f568	mov	x0, x24
000000000001f56c	blr	x8
000000000001f570	add	x2, sp, #0x130
000000000001f574	ldr	x0, [sp, #0x60]
000000000001f578	mov	x3, x22
000000000001f57c	mov	x4, x21
000000000001f580	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000001f584	add	x2, sp, #0x130
000000000001f588	mov	x0, x21
000000000001f58c	bl	"_objc_msgSend$setHeliumRef:"
000000000001f590	ldr	x0, [sp, #0x130]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : ToggleButton
    parm4 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (bool)
    - parm4 (float)

```
