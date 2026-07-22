# Echo

- **PAE class:** `Echo`
- **Plugin UUID:** `EA4CD041-900C-4D48-90A6-E64CA1EB60CA`
- **Node names in corpus:** Echo (5)
- **Corpus usage:** 4 files, 5 instances

## What it does

Echo is a temporal filter that overlays a few evenly-spaced previous frames on top of the current one, each fainter than the last, creating a ghosting/echo trail. Delay sets the spacing between echoes, Number how many, and Decay how quickly they fade.

> **Note.** Not implemented; description is the standard Apple Motion "Echo" temporal filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 0.8 | 0 .. 0.8 | Opacity/strength of the echoes, 0-0.8 (default 0.8). |
| Delay | float (seconds) | 0.1 | 0.1 .. 0.21 | Time spacing between successive echoes, ~0.1-0.21s (default 0.1). |
| Number | enum(int) | 4 | 2 .. 4 | Number of echo copies, 2-4 (default 4). |
| Decay | float | 0.8 | 0 .. 0.8 | How quickly each echo fades, 0-0.8 (default 0.8). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcEchoBlend`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEchoBlend` → [`HgcEchoBlend.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEchoBlend.metal)

```metal
//Metal1.0     
//LEN=0000000130
[[ visible ]] FragmentOut HgcEchoBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    output.color0 = mix(r1, r0, hg_Params[0]);
    return output;
}
```

### Metal fragment shader — `HgcEchoScaleAndAdd`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEchoScaleAndAdd` → [`HgcEchoScaleAndAdd.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEchoScaleAndAdd.metal)

```metal
//Metal1.0     
//LEN=0000000216
[[ visible ]] FragmentOut HgcEchoScaleAndAdd_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    r1 = r1*hg_Params[0] + r0;
    r1.xyz = fmin(r1.xyz, hg_Params[1].xxx);
    r1.xyz = fmin(r1.xyz, hg_Params[1].xxx);
    r1.w = fmin(r1.w, c0.w);
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEEcho canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEEcho`

```asm
000000000012eccc	mov	w3, #0x4
000000000012ecd0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012ecd4	ldr	d0, [sp, #0x158]
000000000012ecd8	fcmp	d0, #0.0
000000000012ecdc	b.ne	0x12ecf4
000000000012ece0	cbz	x21, 0x12f158
000000000012ece4	add	x8, sp, #0x160
000000000012ece8	mov	x0, x21
000000000012ecec	bl	_objc_msgSend$heliumRef
000000000012ecf0	b	0x12f15c
000000000012ecf4	ldr	x4, [x24]
000000000012ecf8	add	x2, sp, #0x150
000000000012ecfc	mov	x0, x22
000000000012ed00	mov	w3, #0x3
000000000012ed04	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012ed08	stp	xzr, xzr, [sp, #0x140]
000000000012ed0c	stp	xzr, xzr, [sp, #0x130]
000000000012ed10	ldr	x6, [x24]
000000000012ed14	add	x2, sp, #0x148
000000000012ed18	add	x3, sp, #0x140
000000000012ed1c	add	x4, sp, #0x130
000000000012ed20	add	x5, sp, #0x138
000000000012ed24	mov	x0, x23
000000000012ed28	bl	"_objc_msgSend$getEchoTime:echoNumber:totalFrames:totalTime:atTime:"
000000000012ed2c	ldr	x8, [x24]
000000000012ed30	ldr	q0, [x8]
000000000012ed34	str	q0, [sp, #0x110]
000000000012ed38	ldr	x8, [x8, #0x10]
000000000012ed3c	str	x8, [sp, #0x120]
000000000012ed40	adrp	x8, 602 ; 0x388000
000000000012ed44	ldr	x8, [x8, #0x488] ; literal pool symbol address: _kCMTimeZero
000000000012ed48	ldr	q0, [x8]
000000000012ed4c	str	q0, [sp, #0xf0]
000000000012ed50	ldr	x8, [x8, #0x10]
000000000012ed54	str	x8, [sp, #0x100]
000000000012ed58	add	x8, sp, #0xf0
000000000012ed5c	str	x8, [sp, #0xe8]
000000000012ed60	add	x2, sp, #0xe8
000000000012ed64	mov	x0, x19
000000000012ed68	bl	"_objc_msgSend$frameDuration:"
000000000012ed6c	add	x19, sp, #0x160
000000000012ed70	add	x0, sp, #0x160
000000000012ed74	mov	w1, #0x1000
000000000012ed78	bl	0x2520e0 ; symbol stub for: _bzero
000000000012ed7c	ldr	d12, [sp, #0x138]
000000000012ed80	movi.2d	v8, #0000000000000000
000000000012ed84	fcmp	d12, #0.0
000000000012ed88	b.le	0x12edf4
000000000012ed8c	movi.2d	v11, #0000000000000000
000000000012ed90	fmov	d9, #1.00000000
000000000012ed94	fmov	s10, #1.00000000
000000000012ed98	ldr	d13, [sp, #0x150]
000000000012ed9c	mov	x0, x23
000000000012eda0	bl	_objc_msgSend$frameRate
000000000012eda4	fdiv	d1, d11, d12
000000000012eda8	fsub	d1, d9, d1
000000000012edac	fcvt	s1, d1
000000000012edb0	fsub	s2, s10, s1
000000000012edb4	fcvt	d1, s1
000000000012edb8	fcvt	d2, s2
000000000012edbc	fmul	d2, d13, d2
000000000012edc0	fadd	d1, d2, d1
000000000012edc4	fcvt	s1, d1
000000000012edc8	fmul	d0, d11, d0
000000000012edcc	fcvtms	w8, d0
000000000012edd0	str	s1, [x19, w8, sxtw #2]
000000000012edd4	fadd	s8, s8, s1
000000000012edd8	ldr	d0, [sp, #0x148]
000000000012eddc	fadd	d0, d11, d0
000000000012ede0	fcvt	s0, d0
000000000012ede4	fcvt	d11, s0
000000000012ede8	ldr	d12, [sp, #0x138]
000000000012edec	fcmp	d12, d11
000000000012edf0	b.gt	0x12ed98
000000000012edf4	fmov	s0, #1.00000000
000000000012edf8	fdiv	s1, s0, s8
000000000012edfc	fcmp	s8, #0.0
000000000012ee00	fcsel	s0, s0, s1, eq
000000000012ee04	ldr	x8, [sp, #0x130]
000000000012ee08	cbz	x8, 0x12ee24
000000000012ee0c	add	x9, sp, #0x160
000000000012ee10	ldr	s1, [x9]
000000000012ee14	fmul	s1, s0, s1
000000000012ee18	str	s1, [x9], #0x4
000000000012ee1c	subs	x8, x8, #0x1
000000000012ee20	b.ne	0x12ee10
000000000012ee24	mov	x0, x21
000000000012ee28	bl	_objc_msgSend$imageType
000000000012ee2c	cmp	x0, #0x3
000000000012ee30	cset	w22, eq
000000000012ee34	b.ne	0x12f180
000000000012ee38	mov	w0, #0x1a0
000000000012ee3c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000012ee40	mov	x19, x0
000000000012ee44	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
000000000012ee48	str	x20, [sp, #0x8]
000000000012ee4c	ldr	x8, [sp, #0x130]
000000000012ee50	cbz	x8, 0x12efe8
000000000012ee54	mov	x25, #0x0
000000000012ee58	add	x20, sp, #0x160
000000000012ee5c	ldr	q0, [sp, #0x110]
000000000012ee60	str	q0, [sp, #0x10]
000000000012ee64	ldr	x8, [sp, #0x120]
000000000012ee68	str	x8, [sp, #0x20]
000000000012ee6c	ldr	q0, [sp, #0xf0]
000000000012ee70	str	q0, [sp, #0xa0]
000000000012ee74	ldr	x8, [sp, #0x100]
000000000012ee78	str	x8, [sp, #0xb0]
000000000012ee7c	add	x8, sp, #0xb8
000000000012ee80	add	x0, sp, #0xa0
000000000012ee84	mov	x1, x25
000000000012ee88	bl	0x250964 ; symbol stub for: _CMTimeMultiply
000000000012ee8c	add	x8, sp, #0xd0
000000000012ee90	add	x0, sp, #0x10
000000000012ee94	add	x1, sp, #0xb8
000000000012ee98	bl	0x250994 ; symbol stub for: _CMTimeSubtract
000000000012ee9c	ldr	s8, [x20, x25, lsl #2]
000000000012eea0	fcmp	s8, #0.0
000000000012eea4	b.le	0x12efd8
000000000012eea8	str	xzr, [sp, #0xb8]
000000000012eeac	ldp	q0, q1, [x24]
000000000012eeb0	stp	q0, q1, [sp, #0x10]
000000000012eeb4	ldr	q0, [x24, #0x20]
000000000012eeb8	str	q0, [sp, #0x30]
000000000012eebc	add	x2, sp, #0xb8
000000000012eec0	add	x4, sp, #0x10
000000000012eec4	add	x5, sp, #0xd0
000000000012eec8	mov	x0, x23
000000000012eecc	mov	w3, #0x0
000000000012eed0	bl	"_objc_msgSend$getHeliumImage:source:withInfo:atTime:"
000000000012eed4	ldr	x0, [sp, #0xb8]
000000000012eed8	cbz	x0, 0x12efd8
000000000012eedc	add	x8, sp, #0x10
000000000012eee0	bl	_objc_msgSend$heliumRef
000000000012eee4	ldr	x26, [sp, #0x10]
000000000012eee8	ldr	x0, [sp, #0xb8]
000000000012eeec	bl	0x252344 ; symbol stub for: _objc_release
000000000012eef0	cbz	x26, 0x12efd8
000000000012eef4	mov	w0, #0x1a0
000000000012eef8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000012eefc	mov	x27, x0
000000000012ef00	bl	__ZN18HgcEchoScaleAndAddC1Ev
000000000012ef04	ldr	x8, [x27]
000000000012ef08	ldr	x8, [x8, #0x60]
000000000012ef0c	mov	x0, x27
000000000012ef10	mov	w1, #0x0
000000000012ef14	mov.16b	v0, v8
000000000012ef18	mov.16b	v1, v8
000000000012ef1c	mov.16b	v2, v8
000000000012ef20	mov.16b	v3, v8
000000000012ef24	blr	x8
000000000012ef28	ldr	x8, [x27]
000000000012ef2c	ldr	x8, [x8, #0x78]
000000000012ef30	mov	x0, x27
000000000012ef34	mov	w1, #0x0
000000000012ef38	mov	x2, x26
000000000012ef3c	blr	x8
000000000012ef40	mov	x0, #0x0
000000000012ef44	bl	0x252344 ; symbol stub for: _objc_release
000000000012ef48	ldr	x8, [x27]
000000000012ef4c	ldr	x8, [x8, #0x78]
000000000012ef50	mov	x0, x27
000000000012ef54	mov	w1, #0x1
000000000012ef58	mov	x2, x19
000000000012ef5c	blr	x8
000000000012ef60	ldr	x8, [x27]
000000000012ef64	ldr	x8, [x8, #0x60]
000000000012ef68	mov	w9, #0x7f7fffff
000000000012ef6c	fmov	s0, w9
000000000012ef70	movi.2d	v1, #0000000000000000
000000000012ef74	movi.2d	v2, #0000000000000000
000000000012ef78	movi.2d	v3, #0000000000000000
000000000012ef7c	mov	x0, x27
000000000012ef80	mov	w1, #0x1
000000000012ef84	blr	x8
000000000012ef88	cmp	x19, x27
000000000012ef8c	b.eq	0x12efb8
000000000012ef90	cbz	x19, 0x12efa4
000000000012ef94	ldr	x8, [x19]
000000000012ef98	ldr	x8, [x8, #0x18]
000000000012ef9c	mov	x0, x19
000000000012efa0	blr	x8
000000000012efa4	ldr	x8, [x27]
000000000012efa8	ldr	x8, [x8, #0x10]
000000000012efac	mov	x19, x27
000000000012efb0	mov	x0, x27
000000000012efb4	blr	x8
000000000012efb8	ldr	x8, [x27]
000000000012efbc	ldr	x8, [x8, #0x18]
000000000012efc0	mov	x0, x27
000000000012efc4	blr	x8
000000000012efc8	ldr	x8, [x26]
000000000012efcc	ldr	x8, [x8, #0x18]
000000000012efd0	mov	x0, x26
000000000012efd4	blr	x8
000000000012efd8	add	x25, x25, #0x1
000000000012efdc	ldr	x8, [sp, #0x130]
000000000012efe0	cmp	x8, x25
000000000012efe4	b.hi	0x12ee5c
000000000012efe8	mov	w0, #0x1a0
000000000012efec	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000012eff0	mov	x24, x0
000000000012eff4	bl	__ZN12HgcEchoBlendC1Ev
000000000012eff8	ldr	x20, [sp, #0x8]
000000000012effc	ldr	d0, [sp, #0x158]
000000000012f000	fcvt	s0, d0
000000000012f004	ldr	x8, [x24]
000000000012f008	ldr	x8, [x8, #0x60]
000000000012f00c	mov	x0, x24
000000000012f010	mov	w1, #0x0
000000000012f014	mov.16b	v1, v0
000000000012f018	mov.16b	v2, v0
000000000012f01c	mov.16b	v3, v0
000000000012f020	blr	x8
000000000012f024	adrp	x0, 665 ; 0x3c8000
000000000012f028	add	x0, x0, #0xbe8 ; Objc cfstring ref: @"bad cfstring ref"
000000000012f02c	bl	0x250ba4 ; symbol stub for: _NSClassFromString
000000000012f030	bl	0x252284 ; symbol stub for: _objc_alloc
000000000012f034	ldr	x2, [x23, x28]
000000000012f038	bl	"_objc_msgSend$initWithAPIManager:"
000000000012f03c	bl	0x25229c ; symbol stub for: _objc_autorelease
000000000012f040	mov	x25, x0
000000000012f044	bl	_objc_msgSend$upscalesFields
000000000012f048	mov	x23, x0
000000000012f04c	mov	x0, x25
000000000012f050	bl	_objc_msgSend$hostIsFCP
000000000012f054	mov	x25, x0
000000000012f058	mov	x0, x20
000000000012f05c	bl	_objc_msgSend$fieldOrder
000000000012f060	cbnz	x0, 0x12f128
000000000012f064	mov	x0, x21
000000000012f068	bl	_objc_msgSend$fieldOrder
000000000012f06c	cmp	x0, #0x0
000000000012f070	cset	w8, ne
000000000012f074	eor	w9, w23, #0x1
000000000012f078	and	w8, w8, w25
000000000012f07c	and	w8, w8, w9
000000000012f080	cmp	w8, #0x1
000000000012f084	b.ne	0x12f128
000000000012f088	add	x0, sp, #0x10
000000000012f08c	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
000000000012f090	add	x0, sp, #0x10
000000000012f094	fmov	d0, #1.00000000
000000000012f098	fmov	d1, #2.00000000
000000000012f09c	fmov	d2, #1.00000000
000000000012f0a0	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
000000000012f0a4	mov	w0, #0x210
000000000012f0a8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000012f0ac	mov	x23, x0
000000000012f0b0	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
000000000012f0b4	ldr	x8, [x23]
000000000012f0b8	ldr	x8, [x8, #0x230]
000000000012f0bc	add	x1, sp, #0x10
000000000012f0c0	mov	x0, x23
000000000012f0c4	blr	x8
000000000012f0c8	ldr	x8, [x23]
000000000012f0cc	ldr	x8, [x8, #0x78]
000000000012f0d0	mov	x0, x23
000000000012f0d4	mov	w1, #0x0
000000000012f0d8	mov	x2, x19
000000000012f0dc	blr	x8
000000000012f0e0	cmp	x19, x23
000000000012f0e4	b.eq	0x12f110
000000000012f0e8	cbz	x19, 0x12f0fc
000000000012f0ec	ldr	x8, [x19]
000000000012f0f0	ldr	x8, [x8, #0x18]
000000000012f0f4	mov	x0, x19
000000000012f0f8	blr	x8
000000000012f0fc	ldr	x8, [x23]
000000000012f100	ldr	x8, [x8, #0x10]
000000000012f104	mov	x19, x23
000000000012f108	mov	x0, x23
000000000012f10c	blr	x8
000000000012f110	ldr	x8, [x23]
000000000012f114	ldr	x8, [x8, #0x18]
000000000012f118	mov	x0, x23
000000000012f11c	blr	x8
000000000012f120	add	x0, sp, #0x10
000000000012f124	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
000000000012f128	ldr	x8, [x24]
000000000012f12c	ldr	x8, [x8, #0x78]
000000000012f130	mov	x0, x24
000000000012f134	mov	w1, #0x0
000000000012f138	mov	x2, x19
000000000012f13c	blr	x8
000000000012f140	cbz	x21, 0x12f1cc
000000000012f144	add	x8, sp, #0x10
000000000012f148	mov	x0, x21
000000000012f14c	bl	_objc_msgSend$heliumRef
000000000012f150	ldr	x2, [sp, #0x10]
000000000012f154	b	0x12f1d4
000000000012f158	str	xzr, [sp, #0x160]
000000000012f15c	add	x2, sp, #0x160
000000000012f160	mov	x0, x20
000000000012f164	bl	"_objc_msgSend$setHeliumRef:"
000000000012f168	ldr	x0, [sp, #0x160]
000000000012f16c	cbz	x0, 0x12f17c
000000000012f170	ldr	x8, [x0]
000000000012f174	ldr	x8, [x8, #0x18]
000000000012f178	blr	x8
000000000012f17c	mov	w22, #0x1
000000000012f180	ldur	x8, [x29, #-0x90]
000000000012f184	adrp	x9, 602 ; 0x389000
000000000012f188	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
000000000012f18c	ldr	x9, [x9]
000000000012f190	cmp	x9, x8
000000000012f194	b.ne	0x12f258
000000000012f198	mov	x0, x22
000000000012f19c	add	sp, sp, #0x1, lsl #12
000000000012f1a0	add	sp, sp, #0x170
000000000012f1a4	ldp	x29, x30, [sp, #0x80]
000000000012f1a8	ldp	x20, x19, [sp, #0x70]
000000000012f1ac	ldp	x22, x21, [sp, #0x60]
000000000012f1b0	ldp	x24, x23, [sp, #0x50]
000000000012f1b4	ldp	x26, x25, [sp, #0x40]
000000000012f1b8	ldp	x28, x27, [sp, #0x30]
000000000012f1bc	ldp	d9, d8, [sp, #0x20]
000000000012f1c0	ldp	d11, d10, [sp, #0x10]
000000000012f1c4	ldp	d13, d12, [sp], #0x90
000000000012f1c8	ret
000000000012f1cc	mov	x2, #0x0
000000000012f1d0	str	xzr, [sp, #0x10]
000000000012f1d4	ldr	x8, [x24]
000000000012f1d8	ldr	x8, [x8, #0x78]
000000000012f1dc	mov	x0, x24
000000000012f1e0	mov	w1, #0x1
000000000012f1e4	blr	x8
000000000012f1e8	ldr	x0, [sp, #0x10]
000000000012f1ec	cbz	x0, 0x12f1fc
000000000012f1f0	ldr	x8, [x0]
000000000012f1f4	ldr	x8, [x8, #0x18]
000000000012f1f8	blr	x8
000000000012f1fc	str	x24, [sp, #0x10]
000000000012f200	ldr	x8, [x24]
000000000012f204	ldr	x8, [x8, #0x10]
000000000012f208	mov	x0, x24
000000000012f20c	blr	x8
000000000012f210	add	x2, sp, #0x10
000000000012f214	mov	x0, x20
000000000012f218	bl	"_objc_msgSend$setHeliumRef:"
000000000012f21c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm4 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm4 (float), parm3 (float)
    slot 1  <-  (constant / computed)
    slot 0  <-  parm4 (float)
```
