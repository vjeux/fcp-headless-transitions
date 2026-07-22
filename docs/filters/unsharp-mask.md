# Unsharp Mask

- **PAE class:** `Unsharp Mask`
- **Plugin UUID:** `710CFB1F-16B3-48A2-8366-67BE752695CF`
- **Node names in corpus:** Unsharp Mask (41), Unsharp Mask copy (24), usm (5), Unsharp Mask 1 (1), um (1)
- **Corpus usage:** 54 files, 72 instances

## What it does

Unsharp Mask sharpens by subtracting a blurred copy from the original and adding the difference back, boosting edge contrast. Radius sets the blur scale (edge size), Amount the sharpening strength, and Threshold suppresses sharpening of low-contrast (noise) areas. Not implemented, but the algorithm is standard and unambiguous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 7 | 2 .. 32 | Blur radius of the unsharp kernel, 2-32 (default 7). Larger = sharpens broader edges / halos. |
| Amount | float | 1 | 0 .. 2 | Sharpening strength, 0-2 (default 1). 0 = no sharpening. |
| Threshold | float | 0 | 0 .. 0.57 | Minimum local contrast before sharpening applies, 0-0.57. Higher = leaves flat/noisy areas untouched. |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal weighting, 0-100%. |
| Vertical | float (percent) | 100 | 100 .. 100 | Vertical weighting, 0-100%. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the sharpened result over the original, 0-1 continuous. NOT a boolean (only 1 sampled). |

## FxPlug plumbing

Non-creative host parameters on this filter: `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcUnsharpMask`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcUnsharpMask` → [`HgcUnsharpMask.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcUnsharpMask.metal)

```metal
//Metal1.0     
//LEN=0000000283
[[ visible ]] FragmentOut HgcUnsharpMask_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = r0 - r1;
    r2 = r1 - hg_Params[1].xxxx;
    r2 = fmax(r2, c0.xxxx);
    r3 = r1 + hg_Params[1].xxxx;
    r3 = fmin(r3, c0.xxxx);
    r1 = select(r2, r3, r1 < 0.00000f);
    r1 = r1*hg_Params[0] + r0;
    r1.w = clamp(r1.w, 0.00000f, 1.00000f);
    output.color0 = fmax(c0.xxxx, r1);
    return output;
}
```

### CPU parameter wiring — `-[PAEUnsharpMask canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEUnsharpMask`

```asm
00000000000682c0	mov	w3, #0x2
00000000000682c4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000682c8	ldur	d0, [x29, #-0x88]
00000000000682cc	fcmp	d0, #0.0
00000000000682d0	b.ne	0x682f0
00000000000682d4	cbz	x21, 0x683e8
00000000000682d8	add	x8, sp, #0xa0
00000000000682dc	mov	x0, x21
00000000000682e0	bl	_objc_msgSend$heliumRef
00000000000682e4	b	0x683ec
00000000000682e8	mov	w0, #0x0
00000000000682ec	b	0x688a8
00000000000682f0	mov	x0, x23
00000000000682f4	bl	_objc_msgSend$versionAtCreation
00000000000682f8	mov	x23, x0
00000000000682fc	sub	x8, x29, #0x98
0000000000068300	mov	x0, x22
0000000000068304	mov	x2, x21
0000000000068308	bl	"_objc_msgSend$getScaleForImage:"
000000000006830c	ldp	d8, d9, [x29, #-0x98]
0000000000068310	fcmp	d8, d9
0000000000068314	fcsel	d10, d8, d9, gt
0000000000068318	ldr	x4, [x19]
000000000006831c	sub	x2, x29, #0xa0
0000000000068320	mov	x0, x24
0000000000068324	mov	w3, #0x1
0000000000068328	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006832c	ldur	d0, [x29, #-0xa0]
0000000000068330	fmul	d0, d10, d0
0000000000068334	stur	d0, [x29, #-0xa0]
0000000000068338	ldr	x4, [x19]
000000000006833c	sub	x2, x29, #0xa8
0000000000068340	mov	x0, x24
0000000000068344	mov	w3, #0x3
0000000000068348	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006834c	ldr	x4, [x19]
0000000000068350	sub	x2, x29, #0xb0
0000000000068354	mov	x0, x24
0000000000068358	mov	w3, #0x4
000000000006835c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000068360	ldur	d0, [x29, #-0xb0]
0000000000068364	adrp	x8, 512 ; 0x268000
0000000000068368	ldr	d11, [x8, #0xc48]
000000000006836c	fmul	d0, d0, d11
0000000000068370	fdiv	d8, d8, d10
0000000000068374	fmul	d0, d8, d0
0000000000068378	stur	d0, [x29, #-0xb0]
000000000006837c	ldr	x4, [x19]
0000000000068380	sub	x2, x29, #0xb8
0000000000068384	mov	x0, x24
0000000000068388	mov	w3, #0x5
000000000006838c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000068390	ldur	d0, [x29, #-0xb8]
0000000000068394	fmul	d0, d0, d11
0000000000068398	fdiv	d9, d9, d10
000000000006839c	fmul	d0, d9, d0
00000000000683a0	stur	d0, [x29, #-0xb8]
00000000000683a4	sturb	wzr, [x29, #-0xb9]
00000000000683a8	ldr	x4, [x19]
00000000000683ac	sub	x2, x29, #0xb9
00000000000683b0	mov	x0, x24
00000000000683b4	mov	w3, #0x6
00000000000683b8	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000683bc	cbz	x21, 0x68410
00000000000683c0	sub	x8, x29, #0xc8
00000000000683c4	mov	x0, x21
00000000000683c8	bl	_objc_msgSend$heliumRef
00000000000683cc	ldur	x0, [x29, #-0xc8]
00000000000683d0	stur	x0, [x29, #-0xd8]
00000000000683d4	cbz	x0, 0x68418
00000000000683d8	ldr	x8, [x0]
00000000000683dc	ldr	x8, [x8, #0x10]
00000000000683e0	blr	x8
00000000000683e4	b	0x68418
00000000000683e8	str	xzr, [sp, #0xa0]
00000000000683ec	add	x2, sp, #0xa0
00000000000683f0	mov	x0, x20
00000000000683f4	bl	"_objc_msgSend$setHeliumRef:"
00000000000683f8	ldr	x0, [sp, #0xa0]
00000000000683fc	cbz	x0, 0x688a4
0000000000068400	ldr	x8, [x0]
0000000000068404	ldr	x8, [x8, #0x18]
0000000000068408	blr	x8
000000000006840c	b	0x688a4
0000000000068410	stur	xzr, [x29, #-0xc8]
0000000000068414	stur	xzr, [x29, #-0xd8]
0000000000068418	sub	x8, x29, #0xd0
000000000006841c	sub	x2, x29, #0xd8
0000000000068420	mov	x0, x22
0000000000068424	mov	x3, x21
0000000000068428	mov	x4, x21
000000000006842c	bl	"_objc_msgSend$smear:fromImage:toImage:"
0000000000068430	ldur	x0, [x29, #-0xd8]
0000000000068434	cbz	x0, 0x68444
0000000000068438	ldr	x8, [x0]
000000000006843c	ldr	x8, [x8, #0x18]
0000000000068440	blr	x8
0000000000068444	ldurb	w8, [x29, #-0xb9]
0000000000068448	cmp	w8, #0x1
000000000006844c	b.ne	0x68544
0000000000068450	mov	w0, #0x1c0
0000000000068454	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000068458	mov	x19, x0
000000000006845c	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
0000000000068460	adrp	x8, 814 ; 0x396000
0000000000068464	add	x8, x8, #0x988
0000000000068468	add	x8, x8, #0x10
000000000006846c	str	x8, [x19]
0000000000068470	stp	xzr, xzr, [x19, #0x198]
0000000000068474	str	wzr, [x19, #0x1a8]
0000000000068478	stp	xzr, xzr, [x19, #0x1b0]
000000000006847c	ldp	d10, d14, [x29, #-0xa0]
0000000000068480	ldp	d13, d12, [x29, #-0xb8]
0000000000068484	ldur	d11, [x29, #-0x90]
0000000000068488	mov	x25, #0x0
000000000006848c	mov	x0, x21
0000000000068490	bl	_objc_msgSend$width
0000000000068494	mov	x24, x0
0000000000068498	mov	x25, #0x0
000000000006849c	mov	x0, x21
00000000000684a0	bl	_objc_msgSend$height
00000000000684a4	mov	x2, x0
00000000000684a8	fcvt	s0, d10
00000000000684ac	fmul	d1, d14, d12
00000000000684b0	fdiv	d1, d1, d8
00000000000684b4	fcvt	s1, d1
00000000000684b8	fmul	d2, d11, d13
00000000000684bc	fdiv	d2, d2, d9
00000000000684c0	adrp	x8, 513 ; 0x269000
00000000000684c4	ldr	q3, [x8, #0x4e0]
00000000000684c8	str	q3, [sp, #0xa0]
00000000000684cc	adrp	x8, 513 ; 0x269000
00000000000684d0	ldr	q4, [x8, #0x8e0]
00000000000684d4	str	q4, [sp, #0x20]
00000000000684d8	fcvt	s2, d2
00000000000684dc	str	q3, [sp]
00000000000684e0	stur	q4, [x29, #-0xf0]
00000000000684e4	add	x3, sp, #0xa0
00000000000684e8	add	x4, sp, #0x20
00000000000684ec	mov	x5, sp
00000000000684f0	sub	x6, x29, #0xf0
00000000000684f4	mov	x0, x19
00000000000684f8	mov	x1, x24
00000000000684fc	bl	__ZN21HEquirectGaussianBlur4initEfffiiRK9PCVector4IfES3_S3_S3_
0000000000068500	ldur	x2, [x29, #-0xc8]
0000000000068504	ldr	x8, [x19]
0000000000068508	ldr	x8, [x8, #0x78]
000000000006850c	mov	x25, #0x0
0000000000068510	mov	x0, x19
0000000000068514	mov	w1, #0x0
0000000000068518	blr	x8
000000000006851c	ldr	x8, [x19]
0000000000068520	ldr	x8, [x8, #0x10]
0000000000068524	mov	x25, x19
0000000000068528	mov	x0, x19
000000000006852c	blr	x8
0000000000068530	ldr	x8, [x19]
0000000000068534	ldr	x8, [x8, #0x18]
0000000000068538	mov	x0, x19
000000000006853c	blr	x8
0000000000068540	b	0x685c0
0000000000068544	mov	w0, #0x1b0
0000000000068548	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006854c	mov	x19, x0
0000000000068550	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
0000000000068554	cmp	w23, #0x0
0000000000068558	cset	w1, eq
000000000006855c	ldur	d0, [x29, #-0xa0]
0000000000068560	fcvt	s0, d0
0000000000068564	ldp	d2, d1, [x29, #-0xb8]
0000000000068568	fcvt	s1, d1
000000000006856c	fcvt	s2, d2
0000000000068570	mov	x0, x19
0000000000068574	mov	w2, #0x0
0000000000068578	mov	w3, #0x0
000000000006857c	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
0000000000068580	ldur	x2, [x29, #-0xc8]
0000000000068584	ldr	x8, [x19]
0000000000068588	ldr	x8, [x8, #0x78]
000000000006858c	mov	x25, #0x0
0000000000068590	mov	x0, x19
0000000000068594	mov	w1, #0x0
0000000000068598	blr	x8
000000000006859c	ldr	x8, [x19]
00000000000685a0	ldr	x8, [x8, #0x10]
00000000000685a4	mov	x25, x19
00000000000685a8	mov	x0, x19
00000000000685ac	blr	x8
00000000000685b0	ldr	x8, [x19]
00000000000685b4	ldr	x8, [x8, #0x18]
00000000000685b8	mov	x0, x19
00000000000685bc	blr	x8
00000000000685c0	stur	x19, [x29, #-0xf0]
00000000000685c4	ldr	x8, [x19]
00000000000685c8	ldr	x8, [x8, #0x10]
00000000000685cc	mov	x0, x19
00000000000685d0	blr	x8
00000000000685d4	sub	x2, x29, #0xf0
00000000000685d8	mov	x0, x22
00000000000685dc	mov	x3, x21
00000000000685e0	mov	x4, x20
00000000000685e4	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000685e8	mov	w0, #0x1a0
00000000000685ec	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000685f0	mov	x24, x0
00000000000685f4	bl	__ZN14HgcUnsharpMaskC1Ev
00000000000685f8	stur	x24, [x29, #-0xf8]
00000000000685fc	ldur	x2, [x29, #-0xc8]
0000000000068600	ldr	x8, [x24]
0000000000068604	ldr	x8, [x8, #0x78]
0000000000068608	mov	x0, x24
000000000006860c	mov	w1, #0x0
0000000000068610	blr	x8
0000000000068614	ldp	x0, x2, [x29, #-0xf8]
0000000000068618	ldr	x8, [x0]
000000000006861c	ldr	x8, [x8, #0x78]
0000000000068620	mov	w1, #0x1
0000000000068624	blr	x8
0000000000068628	ldur	x0, [x29, #-0xf8]
000000000006862c	ldur	d0, [x29, #-0x88]
0000000000068630	fcvt	s0, d0
0000000000068634	ldr	x8, [x0]
0000000000068638	ldr	x8, [x8, #0x60]
000000000006863c	movi.2d	v1, #0000000000000000
0000000000068640	movi.2d	v2, #0000000000000000
0000000000068644	movi.2d	v3, #0000000000000000
0000000000068648	mov	w1, #0x0
000000000006864c	blr	x8
0000000000068650	ldur	x0, [x29, #-0xf8]
0000000000068654	ldur	d0, [x29, #-0xa8]
0000000000068658	fcvt	s0, d0
000000000006865c	ldr	x8, [x0]
0000000000068660	ldr	x8, [x8, #0x60]
0000000000068664	movi.2d	v1, #0000000000000000
0000000000068668	movi.2d	v2, #0000000000000000
000000000006866c	movi.2d	v3, #0000000000000000
0000000000068670	mov	w1, #0x1
0000000000068674	blr	x8
0000000000068678	cbz	w23, 0x687d8
000000000006867c	ldurb	w8, [x29, #-0xb9]
0000000000068680	cmp	w8, #0x1
0000000000068684	b.ne	0x687c8
0000000000068688	add	x8, sp, #0xa0
000000000006868c	mov	x0, x22
0000000000068690	mov	x2, x20
0000000000068694	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000068698	add	x8, sp, #0x20
000000000006869c	mov	x0, x22
00000000000686a0	mov	x2, x20
00000000000686a4	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000686a8	mov	x0, x21
00000000000686ac	bl	_objc_msgSend$width
00000000000686b0	mov	x22, x0
00000000000686b4	ldr	d8, [sp, #0x20]
00000000000686b8	mov	x0, x21
00000000000686bc	bl	_objc_msgSend$height
00000000000686c0	fabs	d0, d8
00000000000686c4	ucvtf	d1, x22
00000000000686c8	fmul	d0, d0, d1
00000000000686cc	ucvtf	d1, x0
00000000000686d0	frintp	d0, d0
00000000000686d4	ldr	d2, [sp, #0x48]
00000000000686d8	fabs	d2, d2
00000000000686dc	fmul	d1, d2, d1
00000000000686e0	frintp	d1, d1
00000000000686e4	fmov	d2, #-0.50000000
00000000000686e8	fmul	d3, d0, d2
00000000000686ec	fmul	d2, d1, d2
00000000000686f0	stp	d3, d2, [sp]
00000000000686f4	stp	d0, d1, [sp, #0x10]
00000000000686f8	add	x0, sp, #0xa0
00000000000686fc	mov	x1, sp
0000000000068700	mov	x2, sp
0000000000068704	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
0000000000068708	ldp	d2, d3, [sp]
000000000006870c	fcvt	s0, d2
0000000000068710	fcvt	s1, d3
0000000000068714	ldp	d4, d5, [sp, #0x10]
0000000000068718	fadd	d2, d2, d4
000000000006871c	fcvt	s2, d2
0000000000068720	fadd	d3, d3, d5
0000000000068724	fcvt	s3, d3
0000000000068728	bl	0x250a3c ; symbol stub for: _HGRectMake4f
000000000006872c	mov	x23, x0
0000000000068730	mov	x22, x1
0000000000068734	mov	w0, #0x1a0
0000000000068738	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006873c	mov	x21, x0
0000000000068740	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000068744	ldur	x2, [x29, #-0xf8]
0000000000068748	ldr	x8, [x21]
000000000006874c	ldr	x8, [x8, #0x78]
0000000000068750	mov	x0, x21
0000000000068754	mov	w1, #0x0
0000000000068758	blr	x8
000000000006875c	scvtf	s0, w23
0000000000068760	lsr	x8, x23, #32
0000000000068764	scvtf	s1, w8
0000000000068768	scvtf	s2, w22
000000000006876c	lsr	x8, x22, #32
0000000000068770	scvtf	s3, w8
0000000000068774	ldr	x8, [x21]
0000000000068778	ldr	x8, [x8, #0x60]
000000000006877c	mov	x0, x21
0000000000068780	mov	w1, #0x0
0000000000068784	blr	x8
0000000000068788	ldur	x0, [x29, #-0xf8]
000000000006878c	cmp	x0, x21
0000000000068790	b.eq	0x687b8
0000000000068794	cbz	x0, 0x687a4
0000000000068798	ldr	x8, [x0]
000000000006879c	ldr	x8, [x8, #0x18]
00000000000687a0	blr	x8
00000000000687a4	stur	x21, [x29, #-0xf8]
00000000000687a8	ldr	x8, [x21]
00000000000687ac	ldr	x8, [x8, #0x10]
00000000000687b0	mov	x0, x21
00000000000687b4	blr	x8
00000000000687b8	ldr	x8, [x21]
00000000000687bc	ldr	x8, [x8, #0x18]
00000000000687c0	mov	x0, x21
00000000000687c4	blr	x8
00000000000687c8	sub	x2, x29, #0xf8
00000000000687cc	mov	x0, x20
00000000000687d0	bl	"_objc_msgSend$setHeliumRef:"
00000000000687d4	b	0x68844
00000000000687d8	mov	w0, #0x1c0
00000000000687dc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000687e0	mov	x21, x0
00000000000687e4	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000687e8	ldur	x2, [x29, #-0xf8]
00000000000687ec	ldr	x8, [x21]
00000000000687f0	ldr	x8, [x8, #0x78]
00000000000687f4	mov	x0, x21
00000000000687f8	mov	w1, #0x0
00000000000687fc	blr	x8
0000000000068800	str	x21, [sp, #0xa0]
0000000000068804	ldr	x8, [x21]
0000000000068808	ldr	x8, [x8, #0x10]
000000000006880c	mov	x0, x21
0000000000068810	blr	x8
0000000000068814	add	x2, sp, #0xa0
0000000000068818	mov	x0, x20
000000000006881c	bl	"_objc_msgSend$setHeliumRef:"
0000000000068820	ldr	x0, [sp, #0xa0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm6 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm1 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm3 (float)
```
