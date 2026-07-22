# Soft Focus

- **PAE class:** `Soft Focus`
- **Plugin UUID:** `BE1A5748-322A-4D25-8107-F3961E0BC21A`
- **Node names in corpus:** Soft Focus (104), Soft Focus copy (5), Soft_Focus (2)
- **Corpus usage:** 73 files, 111 instances

## What it does

Soft Focus blends the sharp image with a blurred copy to give a dreamy, glowing softness (a diffusion/glamour look) without fully losing detail. Amount sets the blur radius and Strength how much of the blurred layer is mixed in. Not implemented and no checked-in shader; described from the standard Motion "Soft Focus".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Soft Focus" (sharp/blurred diffusion blend).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 2 | 2 .. 330 | Blur radius of the soft layer, 2-330. Larger = a broader, dreamier halo. |
| Strength | float | 0.5 | 0 .. 1 | How much of the blurred layer is blended into the sharp image, 0-1. 0 = fully sharp. |
| Horizontal | float (percent) | 100 | 100 .. 100 | Horizontal blur weighting, 0-100%. |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical blur weighting, 0-100%. |
| Mix | float | 1 | 0.05 .. 1 | Wet/dry blend of the soft-focused result over the original, 0-1 continuous. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTextureWrapClampToEdge`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTextureWrapClampToEdge` → [`HgcTextureWrapClampToEdge.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTextureWrapClampToEdge.metal)

```metal
//Metal1.0     
//LEN=00000002a8
[[ visible ]] FragmentOut HgcTextureWrapClampToEdge_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].zw;
    r1.xy = hg_Params[0].xy - c0.xx;
    r0.xy = fmin(r0.xy, r1.xy);
    r0.xy = fmax(r0.xy, c0.xx);
    r0.xy = r0.xy + hg_Params[0].zw;
    r0.xy = r0.xy + hg_Params[1].xy;
    r0.xy = r0.xy*hg_Params[1].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAESoftFocus canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESoftFocus`

```asm
000000000005e604	mov	w3, #0x1
000000000005e608	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005e60c	ldr	d0, [sp, #0x120]
000000000005e610	fmov	d1, #0.50000000
000000000005e614	fmul	d0, d0, d1
000000000005e618	str	d0, [sp, #0x120]
000000000005e61c	ldr	x4, [x23]
000000000005e620	add	x2, sp, #0x118
000000000005e624	mov	x0, x24
000000000005e628	mov	w3, #0x3
000000000005e62c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005e630	ldr	d0, [sp, #0x118]
000000000005e634	adrp	x8, 522 ; 0x268000
000000000005e638	ldr	d10, [x8, #0xc48]
000000000005e63c	fmul	d0, d0, d10
000000000005e640	fmul	d0, d9, d0
000000000005e644	str	d0, [sp, #0x118]
000000000005e648	ldr	x4, [x23]
000000000005e64c	add	x2, sp, #0x110
000000000005e650	mov	x0, x24
000000000005e654	mov	w3, #0x4
000000000005e658	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005e65c	fabs	d0, d8
000000000005e660	ldr	d1, [sp, #0x110]
000000000005e664	fmul	d1, d1, d10
000000000005e668	fmul	d0, d0, d1
000000000005e66c	str	d0, [sp, #0x110]
000000000005e670	ldr	x4, [x23]
000000000005e674	add	x2, sp, #0x108
000000000005e678	mov	x0, x24
000000000005e67c	mov	w3, #0x2
000000000005e680	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005e684	ldr	x4, [x23]
000000000005e688	add	x2, sp, #0x107
000000000005e68c	mov	x0, x24
000000000005e690	mov	w3, #0x5
000000000005e694	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000005e698	strb	wzr, [sp, #0x106]
000000000005e69c	ldr	x4, [x23]
000000000005e6a0	add	x2, sp, #0x106
000000000005e6a4	mov	x0, x24
000000000005e6a8	mov	w3, #0x6
000000000005e6ac	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000005e6b0	ldrb	w8, [sp, #0x106]
000000000005e6b4	eor	w9, w8, #0x1
000000000005e6b8	ldrb	w10, [sp, #0x107]
000000000005e6bc	and	w9, w10, w9
000000000005e6c0	strb	w9, [sp, #0x107]
000000000005e6c4	cbz	x20, 0x5e9a8
000000000005e6c8	add	x8, sp, #0xf8
000000000005e6cc	mov	x0, x20
000000000005e6d0	bl	_objc_msgSend$heliumRef
000000000005e6d4	ldrb	w8, [sp, #0x106]
000000000005e6d8	tbz	w8, #0x0, 0x5e9b0
000000000005e6dc	sub	x8, x29, #0xe8
000000000005e6e0	mov	x0, x22
000000000005e6e4	mov	x2, x19
000000000005e6e8	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000005e6ec	add	x8, sp, #0x78
000000000005e6f0	mov	x0, x22
000000000005e6f4	mov	x2, x19
000000000005e6f8	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000005e6fc	mov	w0, #0x1c0
000000000005e700	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005e704	mov	x21, x0
000000000005e708	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
000000000005e70c	adrp	x8, 824 ; 0x396000
000000000005e710	add	x8, x8, #0x988
000000000005e714	add	x9, x8, #0x10
000000000005e718	str	x9, [x21]
000000000005e71c	stp	xzr, xzr, [x21, #0x198]
000000000005e720	str	wzr, [x21, #0x1a8]
000000000005e724	stp	xzr, xzr, [x21, #0x1b0]
000000000005e728	ldr	x2, [sp, #0xf8]
000000000005e72c	ldr	x8, [x8, #0x88]
000000000005e730	mov	x0, x21
000000000005e734	mov	w1, #0x0
000000000005e738	blr	x8
000000000005e73c	mov	x0, x20
000000000005e740	bl	_objc_msgSend$width
000000000005e744	mov	x22, x0
000000000005e748	ldur	d8, [x29, #-0xe8]
000000000005e74c	mov	x0, x20
000000000005e750	bl	_objc_msgSend$height
000000000005e754	ucvtf	d0, x22
000000000005e758	fabs	d1, d8
000000000005e75c	fmul	d0, d1, d0
000000000005e760	frintp	d4, d0
000000000005e764	ucvtf	d3, x0
000000000005e768	ldp	d1, d0, [sp, #0x118]
000000000005e76c	fcvt	s0, d0
000000000005e770	fcvt	s1, d1
000000000005e774	ldr	d2, [sp, #0x110]
000000000005e778	fcvt	s2, d2
000000000005e77c	str	q4, [sp]
000000000005e780	fcvtzs	w1, d4
000000000005e784	ldur	q4, [x29, #-0xd8]
000000000005e788	ldur	q5, [x29, #-0xe8]
000000000005e78c	fcvtn	v5.2s, v5.2d
000000000005e790	fcvtn2	v5.4s, v4.2d
000000000005e794	str	q5, [sp, #0x20]
000000000005e798	ldur	q4, [x29, #-0xb8]
000000000005e79c	ldur	q5, [x29, #-0xc8]
000000000005e7a0	ldur	d6, [x29, #-0xc0]
000000000005e7a4	fabs	d6, d6
000000000005e7a8	fmul	d8, d6, d3
000000000005e7ac	fcvtps	w2, d8
000000000005e7b0	fcvtn	v3.2s, v5.2d
000000000005e7b4	fcvtn2	v3.4s, v4.2d
000000000005e7b8	str	q3, [sp, #0x60]
000000000005e7bc	ldur	q3, [sp, #0x88]
000000000005e7c0	ldur	q4, [sp, #0x78]
000000000005e7c4	fcvtn	v4.2s, v4.2d
000000000005e7c8	fcvtn2	v4.4s, v3.2d
000000000005e7cc	str	q4, [sp, #0x50]
000000000005e7d0	ldur	q3, [sp, #0xa8]
000000000005e7d4	ldur	q4, [sp, #0x98]
000000000005e7d8	fcvtn	v4.2s, v4.2d
000000000005e7dc	fcvtn2	v4.4s, v3.2d
000000000005e7e0	str	q4, [sp, #0x40]
000000000005e7e4	add	x3, sp, #0x20
000000000005e7e8	add	x4, sp, #0x60
000000000005e7ec	add	x5, sp, #0x50
000000000005e7f0	add	x6, sp, #0x40
000000000005e7f4	mov	x0, x21
000000000005e7f8	bl	__ZN21HEquirectGaussianBlur4initEfffiiRK9PCVector4IfES3_S3_S3_
000000000005e7fc	mov	w0, #0x1c0
000000000005e800	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005e804	mov	x20, x0
000000000005e808	bl	0x251150 ; symbol stub for: __ZN13HGLegacyBlendC1Ev
000000000005e80c	ldr	x8, [x20]
000000000005e810	ldr	x8, [x8, #0x60]
000000000005e814	fmov	s0, #8.00000000
000000000005e818	movi.2d	v1, #0000000000000000
000000000005e81c	movi.2d	v2, #0000000000000000
000000000005e820	movi.2d	v3, #0000000000000000
000000000005e824	mov	x0, x20
000000000005e828	mov	w1, #0x0
000000000005e82c	blr	x8
000000000005e830	ldr	d0, [sp, #0x108]
000000000005e834	fcvt	s0, d0
000000000005e838	ldr	x8, [x20]
000000000005e83c	ldr	x8, [x8, #0x60]
000000000005e840	movi.2d	v1, #0000000000000000
000000000005e844	movi.2d	v2, #0000000000000000
000000000005e848	movi.2d	v3, #0000000000000000
000000000005e84c	mov	x0, x20
000000000005e850	mov	w1, #0x1
000000000005e854	blr	x8
000000000005e858	ldr	x8, [x20]
000000000005e85c	ldr	x8, [x8, #0x78]
000000000005e860	mov	x0, x20
000000000005e864	mov	w1, #0x1
000000000005e868	mov	x2, x21
000000000005e86c	blr	x8
000000000005e870	ldr	x2, [sp, #0xf8]
000000000005e874	ldr	x8, [x20]
000000000005e878	ldr	x8, [x8, #0x78]
000000000005e87c	mov	x0, x20
000000000005e880	mov	w1, #0x0
000000000005e884	blr	x8
000000000005e888	frintp	d0, d8
000000000005e88c	ldr	q3, [sp]
000000000005e890	mov.16b	v1, v3
000000000005e894	mov.d	v1[1], v0[0]
000000000005e898	fmov.2d	v2, #-0.50000000
000000000005e89c	fmul.2d	v1, v1, v2
000000000005e8a0	str	q1, [sp, #0x20]
000000000005e8a4	stp	d3, d0, [sp, #0x30]
000000000005e8a8	add	x0, sp, #0x78
000000000005e8ac	add	x1, sp, #0x20
000000000005e8b0	add	x2, sp, #0x20
000000000005e8b4	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
000000000005e8b8	ldp	d0, d1, [sp, #0x20]
000000000005e8bc	fcvtms	w0, d0
000000000005e8c0	fcvtms	w1, d1
000000000005e8c4	ldp	d2, d3, [sp, #0x30]
000000000005e8c8	fadd	d0, d0, d2
000000000005e8cc	fcvtps	w2, d0
000000000005e8d0	fadd	d0, d1, d3
000000000005e8d4	fcvtps	w3, d0
000000000005e8d8	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000005e8dc	mov	x24, x0
000000000005e8e0	mov	x23, x1
000000000005e8e4	mov	w0, #0x1a0
000000000005e8e8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005e8ec	mov	x22, x0
000000000005e8f0	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
000000000005e8f4	ldr	x8, [x22]
000000000005e8f8	ldr	x8, [x8, #0x78]
000000000005e8fc	mov	x0, x22
000000000005e900	mov	w1, #0x0
000000000005e904	mov	x2, x20
000000000005e908	blr	x8
000000000005e90c	scvtf	s0, w24
000000000005e910	lsr	x8, x24, #32
000000000005e914	scvtf	s1, w8
000000000005e918	scvtf	s2, w23
000000000005e91c	lsr	x8, x23, #32
000000000005e920	scvtf	s3, w8
000000000005e924	ldr	x8, [x22]
000000000005e928	ldr	x8, [x8, #0x60]
000000000005e92c	mov	x0, x22
000000000005e930	mov	w1, #0x0
000000000005e934	blr	x8
000000000005e938	str	x22, [sp, #0x60]
000000000005e93c	ldr	x8, [x22]
000000000005e940	ldr	x8, [x8, #0x10]
000000000005e944	mov	x0, x22
000000000005e948	blr	x8
000000000005e94c	add	x2, sp, #0x60
000000000005e950	mov	x0, x19
000000000005e954	bl	"_objc_msgSend$setHeliumRef:"
000000000005e958	ldr	x0, [sp, #0x60]
000000000005e95c	cbz	x0, 0x5e96c
000000000005e960	ldr	x8, [x0]
000000000005e964	ldr	x8, [x8, #0x18]
000000000005e968	blr	x8
000000000005e96c	ldr	x8, [x22]
000000000005e970	ldr	x8, [x8, #0x18]
000000000005e974	mov	x0, x22
000000000005e978	blr	x8
000000000005e97c	ldr	x8, [x20]
000000000005e980	ldr	x8, [x8, #0x18]
000000000005e984	mov	x0, x20
000000000005e988	blr	x8
000000000005e98c	ldr	x8, [x21]
000000000005e990	ldr	x8, [x8, #0x18]
000000000005e994	mov	x0, x21
000000000005e998	blr	x8
000000000005e99c	b	0x5ecec
000000000005e9a0	mov	w0, #0x0
000000000005e9a4	b	0x5ed04
000000000005e9a8	str	xzr, [sp, #0xf8]
000000000005e9ac	cbnz	w8, 0x5e6dc
000000000005e9b0	ldrb	w8, [sp, #0x107]
000000000005e9b4	cmp	w8, #0x1
000000000005e9b8	b.ne	0x5eb70
000000000005e9bc	cbnz	w21, 0x5eae8
000000000005e9c0	mov	w0, #0x1d0
000000000005e9c4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005e9c8	mov	x23, x0
000000000005e9cc	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
000000000005e9d0	mov	x0, x23
000000000005e9d4	mov	w1, #0x0
000000000005e9d8	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
000000000005e9dc	stp	xzr, xzr, [x29, #-0xe8]
000000000005e9e0	sub	x1, x29, #0xe8
000000000005e9e4	mov	x0, x23
000000000005e9e8	bl	0x251198 ; symbol stub for: __ZN13HGTextureWrap21SetTextureBorderColorEPKf
000000000005e9ec	ldr	x2, [sp, #0xf8]
000000000005e9f0	ldr	x8, [x23]
000000000005e9f4	ldr	x8, [x8, #0x78]
000000000005e9f8	mov	x0, x23
000000000005e9fc	mov	w1, #0x0
000000000005ea00	blr	x8
000000000005ea04	mov	w0, #0x1a0
000000000005ea08	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005ea0c	mov	x24, x0
000000000005ea10	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
000000000005ea14	add	x8, sp, #0x78
000000000005ea18	mov	x0, x22
000000000005ea1c	mov	x2, x20
000000000005ea20	bl	"_objc_msgSend$getImageBoundary:"
000000000005ea24	ldp	s0, s1, [sp, #0x78]
000000000005ea28	fcvtzs	w0, s0
000000000005ea2c	fcvtzs	w1, s1
000000000005ea30	ldp	s0, s1, [sp, #0x80]
000000000005ea34	fcvtzs	w8, s0
000000000005ea38	fcvtzs	w9, s1
000000000005ea3c	add	w2, w8, w0
000000000005ea40	add	w3, w9, w1
000000000005ea44	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000005ea48	mov	x8, #0x100000000
000000000005ea4c	scvtf	s0, w0
000000000005ea50	lsr	x9, x0, #32
000000000005ea54	scvtf	s1, w9
000000000005ea58	add	w9, w1, #0x1
000000000005ea5c	scvtf	s2, w9
000000000005ea60	add	x8, x1, x8
000000000005ea64	lsr	x8, x8, #32
000000000005ea68	scvtf	s3, w8
000000000005ea6c	ldr	x8, [x24]
000000000005ea70	ldr	x8, [x8, #0x60]
000000000005ea74	mov	x0, x24
000000000005ea78	mov	w1, #0x0
000000000005ea7c	blr	x8
000000000005ea80	ldr	x8, [x24]
000000000005ea84	ldr	x8, [x8, #0x78]
000000000005ea88	mov	x0, x24
000000000005ea8c	mov	w1, #0x0
000000000005ea90	mov	x2, x23
000000000005ea94	blr	x8
000000000005ea98	ldr	x0, [sp, #0xf8]
000000000005ea9c	cmp	x0, x24
000000000005eaa0	b.eq	0x5eac8
000000000005eaa4	cbz	x0, 0x5eab4
000000000005eaa8	ldr	x8, [x0]
000000000005eaac	ldr	x8, [x8, #0x18]
000000000005eab0	blr	x8
000000000005eab4	str	x24, [sp, #0xf8]
000000000005eab8	ldr	x8, [x24]
000000000005eabc	ldr	x8, [x8, #0x10]
000000000005eac0	mov	x0, x24
000000000005eac4	blr	x8
000000000005eac8	ldr	x8, [x24]
000000000005eacc	ldr	x8, [x8, #0x18]
000000000005ead0	mov	x0, x24
000000000005ead4	blr	x8
000000000005ead8	ldr	x8, [x23]
000000000005eadc	ldr	x8, [x8, #0x18]
000000000005eae0	mov	x0, x23
000000000005eae4	blr	x8
000000000005eae8	ldr	x0, [sp, #0xf8]
000000000005eaec	str	x0, [sp, #0x18]
000000000005eaf0	cbz	x0, 0x5eb00
000000000005eaf4	ldr	x8, [x0]
000000000005eaf8	ldr	x8, [x8, #0x10]
000000000005eafc	blr	x8
000000000005eb00	sub	x8, x29, #0xe8
000000000005eb04	add	x2, sp, #0x18
000000000005eb08	mov	x0, x22
000000000005eb0c	mov	x3, x20
000000000005eb10	mov	x4, x20
000000000005eb14	bl	"_objc_msgSend$smear:fromImage:toImage:"
000000000005eb18	ldr	x8, [sp, #0xf8]
000000000005eb1c	ldur	x0, [x29, #-0xe8]
000000000005eb20	cmp	x8, x0
000000000005eb24	b.eq	0x5eb4c
000000000005eb28	cbz	x8, 0x5eb40
000000000005eb2c	ldr	x9, [x8]
000000000005eb30	ldr	x9, [x9, #0x18]
000000000005eb34	mov	x0, x8
000000000005eb38	blr	x9
000000000005eb3c	ldur	x0, [x29, #-0xe8]
000000000005eb40	str	x0, [sp, #0xf8]
000000000005eb44	stur	xzr, [x29, #-0xe8]
000000000005eb48	b	0x5eb5c
000000000005eb4c	cbz	x8, 0x5eb5c
000000000005eb50	ldr	x8, [x0]
000000000005eb54	ldr	x8, [x8, #0x18]
000000000005eb58	blr	x8
000000000005eb5c	ldr	x0, [sp, #0x18]
000000000005eb60	cbz	x0, 0x5eb70
000000000005eb64	ldr	x8, [x0]
000000000005eb68	ldr	x8, [x8, #0x18]
000000000005eb6c	blr	x8
000000000005eb70	mov	w0, #0x1b0
000000000005eb74	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005eb78	mov	x22, x0
000000000005eb7c	bl	__ZN10HSoftFocusC1Ev
000000000005eb80	cmp	w21, #0x0
000000000005eb84	cset	w1, eq
000000000005eb88	ldp	d2, d0, [sp, #0x118]
000000000005eb8c	fcvt	s0, d0
000000000005eb90	ldp	d1, d3, [sp, #0x108]
000000000005eb94	fcvt	s1, d1
000000000005eb98	fcvt	s2, d2
000000000005eb9c	fcvt	s3, d3
000000000005eba0	mov	x0, x22
000000000005eba4	bl	__ZN10HSoftFocus4initEffffb
000000000005eba8	ldr	x2, [sp, #0xf8]
000000000005ebac	ldr	x8, [x22]
000000000005ebb0	ldr	x8, [x8, #0x78]
000000000005ebb4	mov	x0, x22
000000000005ebb8	mov	w1, #0x0
000000000005ebbc	blr	x8
000000000005ebc0	ldrb	w8, [sp, #0x107]
000000000005ebc4	cmp	w8, #0x1
000000000005ebc8	b.ne	0x5eca8
000000000005ebcc	mov	w0, #0x1a0
000000000005ebd0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005ebd4	mov	x21, x0
000000000005ebd8	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
000000000005ebdc	ldr	x8, [x21]
000000000005ebe0	ldr	x8, [x8, #0x78]
000000000005ebe4	mov	x0, x21
000000000005ebe8	mov	w1, #0x0
000000000005ebec	mov	x2, x22
000000000005ebf0	blr	x8
000000000005ebf4	mov	x0, x20
000000000005ebf8	bl	_objc_msgSend$width
000000000005ebfc	mov	x23, x0
000000000005ec00	mov	x0, x20
000000000005ec04	bl	_objc_msgSend$height
000000000005ec08	mov	x24, x0
000000000005ec0c	mov	x0, x20
000000000005ec10	bl	_objc_msgSend$width
000000000005ec14	mov	x25, x0
000000000005ec18	mov	x0, x20
000000000005ec1c	bl	_objc_msgSend$height
000000000005ec20	ucvtf	d0, x23
000000000005ec24	fmov	d1, #-0.50000000
000000000005ec28	fmul	d0, d0, d1
000000000005ec2c	fcvt	s0, d0
000000000005ec30	ucvtf	d2, x24
000000000005ec34	fmul	d1, d2, d1
000000000005ec38	fcvt	s1, d1
000000000005ec3c	ucvtf	d2, x25, #0x1
000000000005ec40	fcvt	s2, d2
000000000005ec44	ucvtf	d3, x0, #0x1
000000000005ec48	fcvt	s3, d3
000000000005ec4c	ldr	x8, [x21]
000000000005ec50	ldr	x8, [x8, #0x60]
000000000005ec54	mov	x0, x21
000000000005ec58	mov	w1, #0x0
000000000005ec5c	blr	x8
000000000005ec60	stur	x21, [x29, #-0xe8]
000000000005ec64	ldr	x8, [x21]
000000000005ec68	ldr	x8, [x8, #0x10]
000000000005ec6c	mov	x0, x21
000000000005ec70	blr	x8
000000000005ec74	sub	x2, x29, #0xe8
000000000005ec78	mov	x0, x19
000000000005ec7c	bl	"_objc_msgSend$setHeliumRef:"
000000000005ec80	ldur	x0, [x29, #-0xe8]
000000000005ec84	cbz	x0, 0x5ec94
000000000005ec88	ldr	x8, [x0]
000000000005ec8c	ldr	x8, [x8, #0x18]
000000000005ec90	blr	x8
000000000005ec94	ldr	x8, [x21]
000000000005ec98	ldr	x8, [x8, #0x18]
000000000005ec9c	mov	x0, x21
000000000005eca0	blr	x8
000000000005eca4	b	0x5ecdc
000000000005eca8	stur	x22, [x29, #-0xe8]
000000000005ecac	ldr	x8, [x22]
000000000005ecb0	ldr	x8, [x8, #0x10]
000000000005ecb4	mov	x0, x22
000000000005ecb8	blr	x8
000000000005ecbc	sub	x2, x29, #0xe8
000000000005ecc0	mov	x0, x19
000000000005ecc4	bl	"_objc_msgSend$setHeliumRef:"
000000000005ecc8	ldur	x0, [x29, #-0xe8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm3 (float)
    - parm4 (float)
    - parm2 (float)
    - parm5 (bool)
    - parm6 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (float), parm3 (float), parm4 (float)
    slot 1  <-  parm2 (float)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 0  <-  parm3 (float), parm2 (float)
```
