# Variable Blur

- **PAE class:** `Variable Blur`
- **Plugin UUID:** `05DB4F81-7C57-4F33-A5B3-763C913ACAA3`
- **Node names in corpus:** Variable Blur (78), Variable Blur copy (1), Variable Blur 2 (1), Variable Blur 3 (1)
- **Corpus usage:** 78 files, 81 instances

## What it does

Variable Blur blurs the frame by an amount that increases with distance from a Center, between an Inner Radius (sharp) and an Outer Radius (fully blurred) -- a radial tilt-shift / focus-ring. Amount is the maximum blur. Not implemented and no checked-in shader; described from the standard Motion "Variable Blur".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Variable Blur" (radial focus falloff).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 10 | 0 .. 100 | Maximum blur radius reached beyond the outer radius, 0-100. 0 = no blur. *(keyframed in 11 instances)* |
| Inner Radius | float (pixels) | 100 | 0 .. 665 | Radius of the fully-sharp central region, 0-665. Inside this, no blur. |
| Outer Radius | float (pixels) | 400 | 0 .. 1000 | Radius at which blur reaches maximum, 0-1000. Blur ramps between inner and outer. |
| Center | point2D | - | - | Center of the focus ring (X,Y) in normalized frame coordinates. *(keyframed in 5 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the blurred result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcVariableBlurIntensity`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcVariableBlurIntensity` → [`HgcVariableBlurIntensity.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcVariableBlurIntensity.metal)

```metal
//Metal1.0     
//LEN=0000000240
[[ visible ]] FragmentOut HgcVariableBlurIntensity_hgc_visible(const constant float4* hg_Params,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0.zw = c0.zz;
    r0.x = dot(texCoord0, hg_Params[3]);
    r0.y = dot(texCoord0, hg_Params[4]);
    r0 = r0 - hg_Params[0];
    r0.x = dot(r0, r0);
    r0.x = sqrt(r0.x);
    r0.x = r0.x - hg_Params[2].x;
    output.color0 = clamp(r0.xxxx*hg_Params[1], 0.00000f, 1.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEVariableBlur canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEVariableBlur`

```asm
00000000000f70ac	mov	w4, #0x1
00000000000f70b0	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000f70b4	add	x8, sp, #0x100
00000000000f70b8	sub	x2, x29, #0x100
00000000000f70bc	mov	x0, x21
00000000000f70c0	mov	x3, x20
00000000000f70c4	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000f70c8	ldr	q0, [sp, #0x100]
00000000000f70cc	stur	q0, [x29, #-0x100]
00000000000f70d0	ldr	x4, [x22]
00000000000f70d4	sub	x2, x29, #0xd8
00000000000f70d8	mov	x0, x23
00000000000f70dc	mov	w3, #0x2
00000000000f70e0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f70e4	ldr	x4, [x22]
00000000000f70e8	sub	x2, x29, #0xe0
00000000000f70ec	mov	x0, x23
00000000000f70f0	mov	w3, #0x3
00000000000f70f4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f70f8	ldr	x4, [x22]
00000000000f70fc	sub	x2, x29, #0xe8
00000000000f7100	mov	x0, x23
00000000000f7104	mov	w3, #0x4
00000000000f7108	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000f710c	cbz	w24, 0xf7118
00000000000f7110	ldp	d1, d0, [x29, #-0xe8]
00000000000f7114	stp	d0, d1, [x29, #-0xe8]
00000000000f7118	ldr	x4, [x22]
00000000000f711c	sub	x2, x29, #0xe9
00000000000f7120	mov	x0, x23
00000000000f7124	mov	w3, #0x5
00000000000f7128	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000f712c	add	x8, sp, #0x100
00000000000f7130	mov	x0, x21
00000000000f7134	mov	x2, x20
00000000000f7138	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000f713c	add	x8, sp, #0x80
00000000000f7140	mov	x0, x21
00000000000f7144	mov	x2, x20
00000000000f7148	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000f714c	ldr	d8, [sp, #0x100]
00000000000f7150	ldr	d9, [sp, #0x128]
00000000000f7154	mov	x0, x20
00000000000f7158	bl	_objc_msgSend$imageType
00000000000f715c	mov	x23, x0
00000000000f7160	ldr	x2, [x22]
00000000000f7164	mov	x0, x21
00000000000f7168	bl	"_objc_msgSend$getRenderMode:"
00000000000f716c	cmp	w0, #0x0
00000000000f7170	ccmp	x23, #0x3, #0x0, ne
00000000000f7174	cset	w23, eq
00000000000f7178	b.ne	0xf7844
00000000000f717c	ldur	d0, [x29, #-0xd8]
00000000000f7180	fcmp	d0, #0.0
00000000000f7184	b.ls	0xf719c
00000000000f7188	cbz	x20, 0xf71b0
00000000000f718c	add	x8, sp, #0x78
00000000000f7190	mov	x0, x20
00000000000f7194	bl	_objc_msgSend$heliumRef
00000000000f7198	b	0xf71b4
00000000000f719c	cbz	x20, 0xf7224
00000000000f71a0	sub	x8, x29, #0xd0
00000000000f71a4	mov	x0, x20
00000000000f71a8	bl	_objc_msgSend$heliumRef
00000000000f71ac	b	0xf7228
00000000000f71b0	str	xzr, [sp, #0x78]
00000000000f71b4	ldurb	w8, [x29, #-0xe9]
00000000000f71b8	cmp	w8, #0x1
00000000000f71bc	b.ne	0xf7270
00000000000f71c0	ldr	x0, [sp, #0x78]
00000000000f71c4	str	x0, [sp, #0x70]
00000000000f71c8	cbz	x0, 0xf71d8
00000000000f71cc	ldr	x8, [x0]
00000000000f71d0	ldr	x8, [x8, #0x10]
00000000000f71d4	blr	x8
00000000000f71d8	sub	x8, x29, #0xd0
00000000000f71dc	add	x2, sp, #0x70
00000000000f71e0	mov	x0, x21
00000000000f71e4	mov	x3, x20
00000000000f71e8	mov	x4, x20
00000000000f71ec	bl	"_objc_msgSend$smear:fromImage:toImage:"
00000000000f71f0	ldr	x8, [sp, #0x78]
00000000000f71f4	ldur	x0, [x29, #-0xd0]
00000000000f71f8	cmp	x8, x0
00000000000f71fc	b.eq	0xf724c
00000000000f7200	cbz	x8, 0xf7218
00000000000f7204	ldr	x9, [x8]
00000000000f7208	ldr	x9, [x9, #0x18]
00000000000f720c	mov	x0, x8
00000000000f7210	blr	x9
00000000000f7214	ldur	x0, [x29, #-0xd0]
00000000000f7218	str	x0, [sp, #0x78]
00000000000f721c	stur	xzr, [x29, #-0xd0]
00000000000f7220	b	0xf725c
00000000000f7224	stur	xzr, [x29, #-0xd0]
00000000000f7228	sub	x2, x29, #0xd0
00000000000f722c	mov	x0, x19
00000000000f7230	bl	"_objc_msgSend$setHeliumRef:"
00000000000f7234	ldur	x0, [x29, #-0xd0]
00000000000f7238	cbz	x0, 0xf7844
00000000000f723c	ldr	x8, [x0]
00000000000f7240	ldr	x8, [x8, #0x18]
00000000000f7244	blr	x8
00000000000f7248	b	0xf7844
00000000000f724c	cbz	x8, 0xf725c
00000000000f7250	ldr	x8, [x0]
00000000000f7254	ldr	x8, [x8, #0x18]
00000000000f7258	blr	x8
00000000000f725c	ldr	x0, [sp, #0x70]
00000000000f7260	cbz	x0, 0xf7270
00000000000f7264	ldr	x8, [x0]
00000000000f7268	ldr	x8, [x8, #0x18]
00000000000f726c	blr	x8
00000000000f7270	mov	w0, #0x1a0
00000000000f7274	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f7278	mov	x22, x0
00000000000f727c	bl	__ZN24HgcVariableBlurIntensityC1Ev
00000000000f7280	ldp	d0, d1, [x29, #-0x100]
00000000000f7284	fcvt	s0, d0
00000000000f7288	fcvt	s1, d1
00000000000f728c	ldr	x8, [x22]
00000000000f7290	ldr	x8, [x8, #0x60]
00000000000f7294	movi.2d	v2, #0000000000000000
00000000000f7298	movi.2d	v3, #0000000000000000
00000000000f729c	mov	x0, x22
00000000000f72a0	mov	w1, #0x0
00000000000f72a4	blr	x8
00000000000f72a8	ldp	d0, d1, [x29, #-0xe8]
00000000000f72ac	fsub	d0, d0, d1
00000000000f72b0	fmov	d1, #1.00000000
00000000000f72b4	fdiv	d0, d1, d0
00000000000f72b8	fcvt	s0, d0
00000000000f72bc	ldr	x8, [x22]
00000000000f72c0	ldr	x8, [x8, #0x60]
00000000000f72c4	movi.2d	v1, #0000000000000000
00000000000f72c8	movi.2d	v2, #0000000000000000
00000000000f72cc	movi.2d	v3, #0000000000000000
00000000000f72d0	mov	x0, x22
00000000000f72d4	mov	w1, #0x1
00000000000f72d8	blr	x8
00000000000f72dc	ldur	d0, [x29, #-0xe0]
00000000000f72e0	fcvt	s0, d0
00000000000f72e4	ldr	x8, [x22]
00000000000f72e8	ldr	x8, [x8, #0x60]
00000000000f72ec	movi.2d	v1, #0000000000000000
00000000000f72f0	movi.2d	v2, #0000000000000000
00000000000f72f4	movi.2d	v3, #0000000000000000
00000000000f72f8	mov	x0, x22
00000000000f72fc	mov	w1, #0x2
00000000000f7300	blr	x8
00000000000f7304	ldp	d0, d1, [sp, #0x80]
00000000000f7308	fcvt	s0, d0
00000000000f730c	fcvt	s1, d1
00000000000f7310	ldp	d2, d3, [sp, #0x90]
00000000000f7314	fcvt	s2, d2
00000000000f7318	fcvt	s3, d3
00000000000f731c	ldr	x8, [x22]
00000000000f7320	ldr	x8, [x8, #0x60]
00000000000f7324	mov	x0, x22
00000000000f7328	mov	w1, #0x3
00000000000f732c	blr	x8
00000000000f7330	ldp	d0, d1, [sp, #0xa0]
00000000000f7334	fcvt	s0, d0
00000000000f7338	fcvt	s1, d1
00000000000f733c	ldp	d2, d3, [sp, #0xb0]
00000000000f7340	fcvt	s2, d2
00000000000f7344	fcvt	s3, d3
00000000000f7348	ldr	x8, [x22]
00000000000f734c	ldr	x8, [x8, #0x60]
00000000000f7350	mov	x0, x22
00000000000f7354	mov	w1, #0x4
00000000000f7358	blr	x8
00000000000f735c	mov	w0, #0x1d0
00000000000f7360	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f7364	mov	x24, x0
00000000000f7368	bl	0x2512dc ; symbol stub for: __ZN15HGModulatedBlurC1Ev
00000000000f736c	str	x24, [sp, #0x68]
00000000000f7370	cbz	x24, 0xf7384
00000000000f7374	ldr	x8, [x24]
00000000000f7378	ldr	x8, [x8, #0x10]
00000000000f737c	mov	x0, x24
00000000000f7380	blr	x8
00000000000f7384	ldr	x2, [sp, #0x78]
00000000000f7388	ldr	x8, [x24]
00000000000f738c	ldr	x8, [x8, #0x78]
00000000000f7390	mov	x0, x24
00000000000f7394	mov	w1, #0x0
00000000000f7398	blr	x8
00000000000f739c	ldr	x8, [x24]
00000000000f73a0	ldr	x8, [x8, #0x78]
00000000000f73a4	mov	x0, x24
00000000000f73a8	mov	w1, #0x1
00000000000f73ac	mov	x2, x22
00000000000f73b0	blr	x8
00000000000f73b4	ldur	d0, [x29, #-0xd8]
00000000000f73b8	adrp	x8, 372 ; 0x26b000
00000000000f73bc	ldr	d1, [x8, #0x1a8]
00000000000f73c0	fmul	d0, d0, d1
00000000000f73c4	stur	d0, [x29, #-0xd8]
00000000000f73c8	fcvt	s0, d0
00000000000f73cc	ldr	x8, [x24]
00000000000f73d0	ldr	x8, [x8, #0x60]
00000000000f73d4	movi.2d	v1, #0000000000000000
00000000000f73d8	movi.2d	v2, #0000000000000000
00000000000f73dc	movi.2d	v3, #0000000000000000
00000000000f73e0	mov	x0, x24
00000000000f73e4	mov	w1, #0x0
00000000000f73e8	blr	x8
00000000000f73ec	fcvt	s8, d8
00000000000f73f0	fcvt	s0, d9
00000000000f73f4	fabs	s9, s0
00000000000f73f8	ldr	x8, [x24]
00000000000f73fc	ldr	x8, [x8, #0x60]
00000000000f7400	movi.2d	v2, #0000000000000000
00000000000f7404	movi.2d	v3, #0000000000000000
00000000000f7408	mov	x0, x24
00000000000f740c	mov	w1, #0x1
00000000000f7410	mov.16b	v0, v8
00000000000f7414	mov.16b	v1, v9
00000000000f7418	blr	x8
00000000000f741c	adrp	x8, 372 ; 0x26b000
00000000000f7420	add	x8, x8, #0x1b0
00000000000f7424	ldp	q0, q1, [x8]
00000000000f7428	stp	q0, q1, [x29, #-0xd0]
00000000000f742c	ldur	q0, [x8, #0x1c]
00000000000f7430	stur	q0, [x29, #-0xb4]
00000000000f7434	ldur	d10, [x29, #-0xd8]
00000000000f7438	mov.16b	v0, v10
00000000000f743c	bl	0x252218 ; symbol stub for: _log2
00000000000f7440	frintp	d0, d0
00000000000f7444	fmov	d1, #1.00000000
00000000000f7448	fadd	d0, d0, d1
00000000000f744c	fcvt	s0, d0
00000000000f7450	fcmp	s0, #0.0
00000000000f7454	fmov	s1, #1.00000000
00000000000f7458	fcsel	s0, s0, s1, hi
00000000000f745c	fcvtms	w9, s0
00000000000f7460	cmp	w9, #0x2
00000000000f7464	b.lt	0xf7494
00000000000f7468	add	x8, x9, #0x1
00000000000f746c	sub	x10, x29, #0xd0
00000000000f7470	add	x9, x10, w9, uxtw #2
00000000000f7474	sub	x9, x9, #0x4
00000000000f7478	fmov	d1, #0.50000000
00000000000f747c	fcvt	s2, d10
00000000000f7480	str	s2, [x9], #-0x4
00000000000f7484	fmul	d10, d10, d1
00000000000f7488	sub	x8, x8, #0x1
00000000000f748c	cmp	x8, #0x2
00000000000f7490	b.hi	0xf747c
00000000000f7494	fcvtzu	x2, s0
00000000000f7498	sub	x1, x29, #0xd0
00000000000f749c	mov	x0, x24
00000000000f74a0	bl	0x2512d0 ; symbol stub for: __ZN15HGModulatedBlur13setBlurValuesEPKfm
00000000000f74a4	ldp	d13, d0, [x29, #-0xe8]
00000000000f74a8	fcmp	d0, d13
00000000000f74ac	b.hi	0xf77d0
00000000000f74b0	stp	s9, s8, [sp, #0x8]
00000000000f74b4	ldp	d10, d12, [x29, #-0x100]
00000000000f74b8	ldp	d8, d15, [sp, #0x160]
00000000000f74bc	ldr	d14, [sp, #0x178]
00000000000f74c0	ldp	d9, d1, [sp, #0x100]
00000000000f74c4	ldp	d0, d11, [sp, #0x118]
00000000000f74c8	stp	d1, d0, [sp, #0x20]
00000000000f74cc	ldr	d1, [sp, #0x128]
00000000000f74d0	ldr	d0, [sp, #0x138]
00000000000f74d4	stp	d1, d0, [sp, #0x10]
00000000000f74d8	add	x8, sp, #0x30
00000000000f74dc	mov	x0, x21
00000000000f74e0	mov	x2, x19
00000000000f74e4	bl	"_objc_msgSend$getImageBoundary:"
00000000000f74e8	ldp	d0, d1, [sp, #0x30]
00000000000f74ec	fcvtl	v0.2d, v0.2s
00000000000f74f0	fcvtl	v1.2d, v1.2s
00000000000f74f4	stp	q0, q1, [sp, #0x40]
00000000000f74f8	add	x0, sp, #0x100
00000000000f74fc	add	x1, sp, #0x40
00000000000f7500	add	x2, sp, #0x40
00000000000f7504	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
00000000000f7508	fsub	d3, d10, d13
00000000000f750c	fadd	d2, d13, d12
00000000000f7510	fadd	d5, d13, d10
00000000000f7514	fsub	d0, d12, d13
00000000000f7518	fmul	d7, d3, d8
00000000000f751c	fmul	d4, d2, d15
00000000000f7520	fadd	d1, d7, d4
00000000000f7524	fadd	d1, d14, d1
00000000000f7528	fmul	d6, d3, d9
00000000000f752c	ldp	d22, d21, [sp, #0x20]
00000000000f7530	fmul	d17, d2, d22
00000000000f7534	fadd	d6, d6, d17
00000000000f7538	fadd	d6, d21, d6
00000000000f753c	fdiv	d1, d6, d1
00000000000f7540	fmul	d18, d3, d11
00000000000f7544	fmul	d6, d5, d8
00000000000f7548	fadd	d3, d6, d4
00000000000f754c	fadd	d4, d14, d3
00000000000f7550	fmul	d3, d5, d9
00000000000f7554	fmul	d16, d5, d11
00000000000f7558	fmul	d19, d0, d15
00000000000f755c	fadd	d5, d6, d19
00000000000f7560	fadd	d5, d14, d5
00000000000f7564	ldp	d24, d23, [sp, #0x10]
00000000000f7568	fmul	d20, d0, d24
00000000000f756c	fadd	d6, d16, d20
00000000000f7570	fadd	d6, d23, d6
00000000000f7574	fdiv	d6, d6, d5
00000000000f7578	fadd	d7, d7, d19
00000000000f757c	fadd	d7, d14, d7
00000000000f7580	fadd	d18, d18, d20
00000000000f7584	fadd	d18, d23, d18
00000000000f7588	fdiv	d7, d18, d7
00000000000f758c	ldr	d18, [sp, #0x40]
00000000000f7590	fcmp	d18, d1
00000000000f7594	b.pl	0xf75a8
00000000000f7598	ldr	d19, [sp, #0x50]
00000000000f759c	fadd	d19, d18, d19
00000000000f75a0	fcmp	d1, d19
00000000000f75a4	b.mi	0xf7600
00000000000f75a8	fadd	d17, d3, d17
00000000000f75ac	fadd	d17, d21, d17
00000000000f75b0	fdiv	d17, d17, d4
00000000000f75b4	fcmp	d18, d17
00000000000f75b8	b.pl	0xf75cc
00000000000f75bc	ldr	d19, [sp, #0x50]
00000000000f75c0	fadd	d18, d18, d19
00000000000f75c4	fcmp	d17, d18
00000000000f75c8	b.mi	0xf7600
00000000000f75cc	ldr	d17, [sp, #0x48]
00000000000f75d0	fcmp	d17, d7
00000000000f75d4	b.pl	0xf75e8
00000000000f75d8	ldr	d18, [sp, #0x58]
00000000000f75dc	fadd	d18, d17, d18
00000000000f75e0	fcmp	d7, d18
00000000000f75e4	b.mi	0xf7600
00000000000f75e8	fcmp	d17, d6
00000000000f75ec	b.pl	0xf77d0
00000000000f75f0	ldr	d18, [sp, #0x58]
00000000000f75f4	fadd	d17, d17, d18
00000000000f75f8	fcmp	d6, d17
00000000000f75fc	b.pl	0xf77d0
00000000000f7600	fmul	d2, d2, d24
00000000000f7604	fadd	d2, d16, d2
00000000000f7608	fadd	d2, d23, d2
00000000000f760c	fdiv	d2, d2, d4
00000000000f7610	fmul	d0, d0, d22
00000000000f7614	fadd	d0, d3, d0
00000000000f7618	fadd	d0, d21, d0
00000000000f761c	fdiv	d0, d0, d5
00000000000f7620	fsub	d0, d0, d1
00000000000f7624	fsub	d2, d2, d6
00000000000f7628	fcvtms	w0, d1
00000000000f762c	fcvtms	w1, d7
00000000000f7630	fadd	d0, d1, d0
00000000000f7634	fcvtps	w2, d0
00000000000f7638	fadd	d0, d7, d2
00000000000f763c	fcvtps	w3, d0
00000000000f7640	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000f7644	mov	x28, x0
00000000000f7648	mov	x27, x1
00000000000f764c	mov	w0, #0x1a0
00000000000f7650	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f7654	ldp	s9, s8, [sp, #0x8]
00000000000f7658	mov	x25, x0
00000000000f765c	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
00000000000f7660	ldr	x8, [x25]
00000000000f7664	ldr	x8, [x8, #0x78]
00000000000f7668	mov	x26, x24
00000000000f766c	mov	x0, x25
00000000000f7670	mov	w1, #0x0
00000000000f7674	mov	x2, x24
00000000000f7678	blr	x8
00000000000f767c	scvtf	s0, w28
00000000000f7680	lsr	x8, x28, #32
00000000000f7684	scvtf	s1, w8
00000000000f7688	scvtf	s2, w27
00000000000f768c	lsr	x8, x27, #32
00000000000f7690	scvtf	s3, w8
00000000000f7694	ldr	x8, [x25]
00000000000f7698	ldr	x8, [x8, #0x60]
00000000000f769c	mov	x26, x24
00000000000f76a0	mov	x0, x25
00000000000f76a4	mov	w1, #0x0
00000000000f76a8	blr	x8
00000000000f76ac	mov	x26, x24
00000000000f76b0	cmp	x24, x25
00000000000f76b4	b.eq	0xf76e4
00000000000f76b8	ldr	x8, [x24]
00000000000f76bc	ldr	x8, [x8, #0x18]
00000000000f76c0	mov	x26, x24
00000000000f76c4	mov	x0, x24
00000000000f76c8	blr	x8
00000000000f76cc	str	x25, [sp, #0x68]
00000000000f76d0	ldr	x8, [x25]
00000000000f76d4	ldr	x8, [x8, #0x10]
00000000000f76d8	mov	x26, x25
00000000000f76dc	mov	x0, x25
00000000000f76e0	blr	x8
00000000000f76e4	mov	w0, #0x1b0
00000000000f76e8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f76ec	mov	x27, x0
00000000000f76f0	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
00000000000f76f4	ldr	x2, [sp, #0x78]
00000000000f76f8	ldr	x8, [x27]
00000000000f76fc	ldr	x8, [x8, #0x78]
00000000000f7700	mov	x0, x27
00000000000f7704	mov	w1, #0x0
00000000000f7708	blr	x8
00000000000f770c	ldur	d0, [x29, #-0xd8]
00000000000f7710	fcvt	s0, d0
00000000000f7714	mov	x0, x27
00000000000f7718	mov.16b	v1, v8
00000000000f771c	mov.16b	v2, v9
00000000000f7720	mov	w1, #0x0
00000000000f7724	mov	w2, #0x0
00000000000f7728	mov	w3, #0x0
00000000000f772c	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000000f7730	mov	w0, #0x1a0
00000000000f7734	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000f7738	mov	x28, x0
00000000000f773c	bl	0x250f34 ; symbol stub for: __ZN11HGOverwriteC1Ev
00000000000f7740	ldr	x8, [x28]
00000000000f7744	ldr	x8, [x8, #0x78]
00000000000f7748	mov	x0, x28
00000000000f774c	mov	w1, #0x1
00000000000f7750	mov	x2, x26
00000000000f7754	blr	x8
00000000000f7758	ldr	x8, [x28]
00000000000f775c	ldr	x8, [x8, #0x78]
00000000000f7760	mov	x0, x28
00000000000f7764	mov	w1, #0x0
00000000000f7768	mov	x2, x27
00000000000f776c	blr	x8
00000000000f7770	cmp	x26, x28
00000000000f7774	b.eq	0xf77a0
00000000000f7778	ldr	x8, [x26]
00000000000f777c	ldr	x8, [x8, #0x18]
00000000000f7780	mov	x0, x26
00000000000f7784	blr	x8
00000000000f7788	str	x28, [sp, #0x68]
00000000000f778c	ldr	x8, [x28]
00000000000f7790	ldr	x8, [x8, #0x10]
00000000000f7794	mov	x26, x28
00000000000f7798	mov	x0, x28
00000000000f779c	blr	x8
00000000000f77a0	ldr	x8, [x28]
00000000000f77a4	ldr	x8, [x8, #0x18]
00000000000f77a8	mov	x0, x28
00000000000f77ac	blr	x8
00000000000f77b0	ldr	x8, [x27]
00000000000f77b4	ldr	x8, [x8, #0x18]
00000000000f77b8	mov	x0, x27
00000000000f77bc	blr	x8
00000000000f77c0	ldr	x8, [x25]
00000000000f77c4	ldr	x8, [x8, #0x18]
00000000000f77c8	mov	x0, x25
00000000000f77cc	blr	x8
00000000000f77d0	ldurb	w8, [x29, #-0xe9]
00000000000f77d4	cmp	w8, #0x1
00000000000f77d8	b.ne	0xf77f0
00000000000f77dc	add	x2, sp, #0x68
00000000000f77e0	mov	x0, x21
00000000000f77e4	mov	x3, x20
00000000000f77e8	mov	x4, x19
00000000000f77ec	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000f77f0	add	x2, sp, #0x68
00000000000f77f4	mov	x0, x19
00000000000f77f8	bl	"_objc_msgSend$setHeliumRef:"
00000000000f77fc	ldr	x0, [sp, #0x68]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
