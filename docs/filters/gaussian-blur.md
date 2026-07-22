# Gaussian Blur

- **PAE class:** `Gaussian Blur`
- **Plugin UUID:** `E472D646-2C92-464E-98A1-91CF8F162AD8`
- **Node names in corpus:** Gaussian Blur (1416), Blur (43), Gaussian Blur Source (37), Gaussian Blur copy (31), Focus Change (19), Gaussian Blur 1 (17)
- **Corpus usage:** 788 files, 1594 instances

## What it does

A separable two-pass Gaussian blur. Each output pixel is a Gaussian-weighted average of its neighbors, softening detail with a smooth symmetric falloff. FCP's real implementation decimates the image, convolves a small normalized-Gaussian kernel, then upsamples; the effective screen sigma is approximately radius/6.1. The Horizontal/Vertical percentages let the blur be anisotropic (e.g. a purely vertical smear).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 4 | 0 .. 2326 | Blur radius in pixels. 0 = no blur; larger values spread each pixel over a wider Gaussian. The dominant creative knob; often keyframed for focus pulls. *(keyframed in 133 instances)* |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal blur weighting, 0-100%. 100 = full blur on the X axis, 0 = none. Combined with Vertical to make the blur directional. *(keyframed in 4 instances)* |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical blur weighting, 0-100%. 100 = full blur on the Y axis, 0 = none. *(keyframed in 4 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the blurred result over the sharp original, 0-1 continuous. *(keyframed in 120 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Prescale Input`, `Crop`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/gaussian-blur.ts`](../../engine/src/compositor/filters/gaussian-blur.ts).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGTransform`, `HGXForm`, `HGaussianBlur`.

### CPU render method — `-[PAEGaussianBlur canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGaussianBlur`

```asm
00000000000306f4	mov	w3, #0x1
00000000000306f8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000306fc	ldr	x4, [x22]
0000000000030700	sub	x2, x29, #0x79
0000000000030704	mov	x0, x23
0000000000030708	mov	w3, #0x5
000000000003070c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000030710	ldur	d0, [x29, #-0x78]
0000000000030714	fcmp	d0, #0.0
0000000000030718	b.ls	0x30790
000000000003071c	fmov	d1, #0.50000000
0000000000030720	fmul	d0, d0, d1
0000000000030724	stur	d0, [x29, #-0x78]
0000000000030728	sturb	wzr, [x29, #-0x7a]
000000000003072c	ldr	x4, [x22]
0000000000030730	sub	x2, x29, #0x7a
0000000000030734	mov	x0, x23
0000000000030738	mov	w3, #0x6
000000000003073c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000030740	ldurb	w8, [x29, #-0x7a]
0000000000030744	ldurb	w9, [x29, #-0x79]
0000000000030748	ands	w8, w9, w8
000000000003074c	sturb	w8, [x29, #-0x79]
0000000000030750	b.eq	0x307a4
0000000000030754	ldur	d11, [x29, #-0x78]
0000000000030758	fcvt	s0, d11
000000000003075c	bl	0x252224 ; symbol stub for: _log2f
0000000000030760	fmov	s1, #3.00000000
0000000000030764	fmul	s0, s0, s1
0000000000030768	fcvt	d8, s0
000000000003076c	fmov	s1, #1.00000000
0000000000030770	fcmp	s0, s1
0000000000030774	b.le	0x307d8
0000000000030778	fdiv	d0, d11, d8
000000000003077c	stur	d0, [x29, #-0x78]
0000000000030780	mov	w25, #0x1
0000000000030784	b	0x307dc
0000000000030788	mov	w0, #0x0
000000000003078c	b	0x30cb8
0000000000030790	cbz	x20, 0x307b0
0000000000030794	mov	x8, sp
0000000000030798	mov	x0, x20
000000000003079c	bl	_objc_msgSend$heliumRef
00000000000307a0	b	0x307b4
00000000000307a4	mov	w25, #0x0
00000000000307a8	fmov	d8, #1.00000000
00000000000307ac	b	0x307dc
00000000000307b0	str	xzr, [sp]
00000000000307b4	mov	x2, sp
00000000000307b8	mov	x0, x19
00000000000307bc	bl	"_objc_msgSend$setHeliumRef:"
00000000000307c0	ldr	x0, [sp]
00000000000307c4	cbz	x0, 0x30cb4
00000000000307c8	ldr	x8, [x0]
00000000000307cc	ldr	x8, [x8, #0x18]
00000000000307d0	blr	x8
00000000000307d4	b	0x30cb4
00000000000307d8	mov	w25, #0x0
00000000000307dc	ldr	x4, [x22]
00000000000307e0	sub	x2, x29, #0x88
00000000000307e4	mov	x0, x23
00000000000307e8	mov	w3, #0x2
00000000000307ec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000307f0	ldur	d0, [x29, #-0x88]
00000000000307f4	adrp	x8, 568 ; 0x268000
00000000000307f8	ldr	d11, [x8, #0xc48]
00000000000307fc	fmul	d0, d0, d11
0000000000030800	fmul	d0, d10, d0
0000000000030804	stur	d0, [x29, #-0x88]
0000000000030808	ldr	x4, [x22]
000000000003080c	sub	x2, x29, #0x90
0000000000030810	mov	x0, x23
0000000000030814	mov	w3, #0x3
0000000000030818	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003081c	ldur	d0, [x29, #-0x90]
0000000000030820	fmul	d0, d0, d11
0000000000030824	fmul	d0, d9, d0
0000000000030828	stur	d0, [x29, #-0x90]
000000000003082c	cbz	x20, 0x30840
0000000000030830	sub	x8, x29, #0x98
0000000000030834	mov	x0, x20
0000000000030838	bl	_objc_msgSend$heliumRef
000000000003083c	b	0x30844
0000000000030840	stur	xzr, [x29, #-0x98]
0000000000030844	ldr	x4, [x22]
0000000000030848	sub	x2, x29, #0x99
000000000003084c	mov	x0, x23
0000000000030850	mov	w3, #0x4
0000000000030854	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000030858	ldurb	w8, [x29, #-0x7a]
000000000003085c	eor	w9, w8, #0x1
0000000000030860	ldurb	w10, [x29, #-0x99]
0000000000030864	ands	w9, w10, w9
0000000000030868	sturb	w9, [x29, #-0x99]
000000000003086c	b.eq	0x308d4
0000000000030870	ldur	x0, [x29, #-0x98]
0000000000030874	stur	x0, [x29, #-0xa8]
0000000000030878	cbz	x0, 0x30888
000000000003087c	ldr	x8, [x0]
0000000000030880	ldr	x8, [x8, #0x10]
0000000000030884	blr	x8
0000000000030888	mov	x8, sp
000000000003088c	sub	x2, x29, #0xa8
0000000000030890	mov	x0, x21
0000000000030894	mov	x3, x20
0000000000030898	mov	x4, x20
000000000003089c	bl	"_objc_msgSend$smear:fromImage:toImage:"
00000000000308a0	ldur	x8, [x29, #-0x98]
00000000000308a4	ldr	x0, [sp]
00000000000308a8	cmp	x8, x0
00000000000308ac	b.eq	0x30b18
00000000000308b0	cbz	x8, 0x308c8
00000000000308b4	ldr	x9, [x8]
00000000000308b8	ldr	x9, [x9, #0x18]
00000000000308bc	mov	x0, x8
00000000000308c0	blr	x9
00000000000308c4	ldr	x0, [sp]
00000000000308c8	stur	x0, [x29, #-0x98]
00000000000308cc	str	xzr, [sp]
00000000000308d0	b	0x30b28
00000000000308d4	cbnz	w8, 0x30b44
00000000000308d8	mov	w0, #0x210
00000000000308dc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000308e0	mov	x22, x0
00000000000308e4	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000308e8	cbz	w25, 0x30940
00000000000308ec	mov	x0, sp
00000000000308f0	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000308f4	fmov	d0, #1.00000000
00000000000308f8	fdiv	d0, d0, d8
00000000000308fc	mov	x0, sp
0000000000030900	fmov	d2, #1.00000000
0000000000030904	mov.16b	v1, v0
0000000000030908	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
000000000003090c	ldur	x2, [x29, #-0x98]
0000000000030910	ldr	x8, [x22]
0000000000030914	ldr	x8, [x8, #0x78]
0000000000030918	mov	x0, x22
000000000003091c	mov	w1, #0x0
0000000000030920	blr	x8
0000000000030924	ldr	x8, [x22]
0000000000030928	ldr	x8, [x8, #0x230]
000000000003092c	mov	x1, sp
0000000000030930	mov	x0, x22
0000000000030934	blr	x8
0000000000030938	mov	x0, sp
000000000003093c	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000030940	mov	w0, #0x1b0
0000000000030944	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000030948	mov	x23, x0
000000000003094c	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
0000000000030950	cmp	w24, #0x0
0000000000030954	cset	w1, eq
0000000000030958	ldur	d0, [x29, #-0x78]
000000000003095c	fcvt	s0, d0
0000000000030960	ldp	d2, d1, [x29, #-0x90]
0000000000030964	fcvt	s1, d1
0000000000030968	fcvt	s2, d2
000000000003096c	mov	x0, x23
0000000000030970	mov	w2, #0x0
0000000000030974	mov	w3, #0x0
0000000000030978	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
000000000003097c	ldur	x8, [x29, #-0x98]
0000000000030980	cmp	w25, #0x0
0000000000030984	csel	x2, x22, x8, ne
0000000000030988	ldr	x8, [x23]
000000000003098c	ldr	x8, [x8, #0x78]
0000000000030990	mov	x0, x23
0000000000030994	mov	w1, #0x0
0000000000030998	blr	x8
000000000003099c	mov	w0, #0x1a0
00000000000309a0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000309a4	mov	x24, x0
00000000000309a8	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
00000000000309ac	ldr	x8, [x23]
00000000000309b0	ldr	x8, [x8, #0x10]
00000000000309b4	cbz	w25, 0x30a5c
00000000000309b8	mov	x0, x23
00000000000309bc	blr	x8
00000000000309c0	mov	x0, sp
00000000000309c4	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000309c8	mov	w0, #0x210
00000000000309cc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000309d0	mov	x25, x0
00000000000309d4	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000309d8	mov	x0, sp
00000000000309dc	fmov	d2, #1.00000000
00000000000309e0	mov.16b	v0, v8
00000000000309e4	mov.16b	v1, v8
00000000000309e8	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000309ec	ldr	x8, [x25]
00000000000309f0	ldr	x8, [x8, #0x78]
00000000000309f4	mov	x0, x25
00000000000309f8	mov	w1, #0x0
00000000000309fc	mov	x2, x23
0000000000030a00	blr	x8
0000000000030a04	ldr	x8, [x25]
0000000000030a08	ldr	x8, [x8, #0x230]
0000000000030a0c	mov	x1, sp
0000000000030a10	mov	x0, x25
0000000000030a14	blr	x8
0000000000030a18	ldr	x8, [x24]
0000000000030a1c	ldr	x8, [x8, #0x78]
0000000000030a20	mov	x0, x24
0000000000030a24	mov	w1, #0x0
0000000000030a28	mov	x2, x25
0000000000030a2c	blr	x8
0000000000030a30	ldr	x8, [x25]
0000000000030a34	ldr	x8, [x8, #0x18]
0000000000030a38	mov	x0, x25
0000000000030a3c	blr	x8
0000000000030a40	mov	x0, sp
0000000000030a44	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000030a48	ldr	x8, [x23]
0000000000030a4c	ldr	x8, [x8, #0x18]
0000000000030a50	mov	x0, x23
0000000000030a54	blr	x8
0000000000030a58	b	0x30a8c
0000000000030a5c	mov	x0, x23
0000000000030a60	blr	x8
0000000000030a64	ldr	x8, [x24]
0000000000030a68	ldr	x8, [x8, #0x78]
0000000000030a6c	mov	x0, x24
0000000000030a70	mov	w1, #0x0
0000000000030a74	mov	x2, x23
0000000000030a78	blr	x8
0000000000030a7c	ldr	x8, [x23]
0000000000030a80	ldr	x8, [x8, #0x18]
0000000000030a84	mov	x0, x23
0000000000030a88	blr	x8
0000000000030a8c	str	x24, [sp]
0000000000030a90	ldr	x8, [x24]
0000000000030a94	ldr	x8, [x8, #0x10]
0000000000030a98	mov	x0, x24
0000000000030a9c	blr	x8
0000000000030aa0	ldurb	w8, [x29, #-0x99]
0000000000030aa4	cmp	w8, #0x1
0000000000030aa8	b.ne	0x30ac0
0000000000030aac	mov	x2, sp
0000000000030ab0	mov	x0, x21
0000000000030ab4	mov	x3, x20
0000000000030ab8	mov	x4, x19
0000000000030abc	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000030ac0	mov	x2, sp
0000000000030ac4	mov	x0, x19
0000000000030ac8	bl	"_objc_msgSend$setHeliumRef:"
0000000000030acc	ldr	x0, [sp]
0000000000030ad0	cbz	x0, 0x30ae0
0000000000030ad4	ldr	x8, [x0]
0000000000030ad8	ldr	x8, [x8, #0x18]
0000000000030adc	blr	x8
0000000000030ae0	ldr	x8, [x24]
0000000000030ae4	ldr	x8, [x8, #0x18]
0000000000030ae8	mov	x0, x24
0000000000030aec	blr	x8
0000000000030af0	ldr	x8, [x23]
0000000000030af4	ldr	x8, [x8, #0x18]
0000000000030af8	mov	x0, x23
0000000000030afc	blr	x8
0000000000030b00	cbz	x22, 0x30ca0
0000000000030b04	ldr	x8, [x22]
0000000000030b08	ldr	x8, [x8, #0x18]
0000000000030b0c	mov	x0, x22
0000000000030b10	blr	x8
0000000000030b14	b	0x30ca0
0000000000030b18	cbz	x8, 0x30b28
0000000000030b1c	ldr	x8, [x0]
0000000000030b20	ldr	x8, [x8, #0x18]
0000000000030b24	blr	x8
0000000000030b28	ldur	x0, [x29, #-0xa8]
0000000000030b2c	cbz	x0, 0x30b3c
0000000000030b30	ldr	x8, [x0]
0000000000030b34	ldr	x8, [x8, #0x18]
0000000000030b38	blr	x8
0000000000030b3c	ldurb	w8, [x29, #-0x7a]
0000000000030b40	tbz	w8, #0x0, 0x308d8
0000000000030b44	mov	x8, sp
0000000000030b48	mov	x0, x21
0000000000030b4c	mov	x2, x19
0000000000030b50	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000030b54	add	x8, sp, #0xd8
0000000000030b58	mov	x0, x21
0000000000030b5c	mov	x2, x19
0000000000030b60	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000030b64	mov	w0, #0x1c0
0000000000030b68	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000030b6c	mov	x21, x0
0000000000030b70	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
0000000000030b74	adrp	x8, 870 ; 0x396000
0000000000030b78	add	x8, x8, #0x988
0000000000030b7c	add	x8, x8, #0x10
0000000000030b80	str	x8, [x21]
0000000000030b84	stp	xzr, xzr, [x21, #0x198]
0000000000030b88	str	wzr, [x21, #0x1a8]
0000000000030b8c	stp	xzr, xzr, [x21, #0x1b0]
0000000000030b90	mov	x0, x20
0000000000030b94	bl	_objc_msgSend$heliumNode
0000000000030b98	mov	x2, x0
0000000000030b9c	ldr	x8, [x21]
0000000000030ba0	ldr	x8, [x8, #0x78]
0000000000030ba4	mov	x0, x21
0000000000030ba8	mov	w1, #0x0
0000000000030bac	blr	x8
0000000000030bb0	ldur	d8, [x29, #-0x78]
0000000000030bb4	ldp	d10, d9, [x29, #-0x90]
0000000000030bb8	mov	x0, x20
0000000000030bbc	bl	_objc_msgSend$width
0000000000030bc0	mov	x22, x0
0000000000030bc4	ldr	d11, [sp]
0000000000030bc8	mov	x0, x20
0000000000030bcc	bl	_objc_msgSend$height
0000000000030bd0	add	x8, sp, #0xd8
0000000000030bd4	fcvt	s0, d8
0000000000030bd8	fcvt	s1, d9
0000000000030bdc	fcvt	s2, d10
0000000000030be0	fabs	d3, d11
0000000000030be4	ucvtf	d4, x22
0000000000030be8	fmul	d3, d3, d4
0000000000030bec	fcvtps	w1, d3
0000000000030bf0	ucvtf	d3, x0
0000000000030bf4	ldp	q5, q4, [sp]
0000000000030bf8	fcvtn	v5.2s, v5.2d
0000000000030bfc	fcvtn2	v5.4s, v4.2d
0000000000030c00	str	q5, [sp, #0xc0]
0000000000030c04	ldp	q5, q4, [sp, #0x20]
0000000000030c08	ldr	d6, [sp, #0x28]
0000000000030c0c	fabs	d6, d6
0000000000030c10	fmul	d3, d6, d3
0000000000030c14	fcvtps	w2, d3
0000000000030c18	fcvtn	v3.2s, v5.2d
0000000000030c1c	fcvtn2	v3.4s, v4.2d
0000000000030c20	str	q3, [sp, #0xb0]
0000000000030c24	ldp	q4, q3, [x8]
0000000000030c28	fcvtn	v4.2s, v4.2d
0000000000030c2c	fcvtn2	v4.4s, v3.2d
0000000000030c30	str	q4, [sp, #0xa0]
0000000000030c34	ldp	q4, q3, [x8, #0x20]
0000000000030c38	fcvtn	v4.2s, v4.2d
0000000000030c3c	fcvtn2	v4.4s, v3.2d
0000000000030c40	str	q4, [sp, #0x90]
0000000000030c44	add	x3, sp, #0xc0
0000000000030c48	add	x4, sp, #0xb0
0000000000030c4c	add	x5, sp, #0xa0
0000000000030c50	add	x6, sp, #0x90
0000000000030c54	mov	x0, x21
0000000000030c58	bl	__ZN21HEquirectGaussianBlur4initEfffiiRK9PCVector4IfES3_S3_S3_
0000000000030c5c	str	x21, [sp, #0xc0]
0000000000030c60	ldr	x8, [x21]
0000000000030c64	ldr	x8, [x8, #0x10]
0000000000030c68	mov	x0, x21
0000000000030c6c	blr	x8
0000000000030c70	add	x2, sp, #0xc0
0000000000030c74	mov	x0, x19
0000000000030c78	bl	"_objc_msgSend$setHeliumRef:"
0000000000030c7c	ldr	x0, [sp, #0xc0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : ToggleButton
    parm5 : ToggleButton
    parm6 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm5 (bool)
    - parm6 (bool)
    - parm2 (float)
    - parm3 (float)
    - parm4 (bool)

```
