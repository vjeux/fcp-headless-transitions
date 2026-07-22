# Texture Screen

- **PAE class:** `Texture Screen`
- **Plugin UUID:** `FBED5D89-8D51-451E-8331-D02F15DE3FA1`
- **Node names in corpus:** Texture Screen (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Texture Screen maps an external texture image onto the source through a halftone-style screen, so the picture is rendered as tonal modulation of the supplied texture (a patterned-screen / texture-halftone). Contrast/Threshold shape how tone maps to texture and Center/Angle/Scale position the screen.

> **Note.** Not implemented; description is the standard Apple Motion "Texture Screen" filter. Map Image is an image-input handle; Angle/Skew/Stretch/Scale are pattern-transform sub-knobs.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the texture screen (X,Y) in normalized frame coordinates. |
| Contrast | float | 1 | 1 .. 20 | Contrast of the texture mapping, ~1-20 (default 1). |
| Threshold | float | 0.5 | -2 .. 0 | Tonal threshold where the texture switches on, ~-2..0 (default 0.5). |
| Noise Contrast | float | 1 | 0.05 .. 1 | Contrast of the noise component, 0.05-1 (default 1). |
| Noisiness | float | 1 | 6 .. 20 | Amount of noise mixed into the screen, ~6-20 (default 1). |
| Mix | float | 1 | 0.091 .. 1 | Wet/dry blend, 0-1 continuous. |
| Map Image | float | 0 | 10145 .. 11513 | *(unverified)* |
| Angle | bool | 0 | 0 .. 0 | *(unverified)* |
| Skew | bool | 0 | 0 .. 0 | *(unverified)* |
| Stretch | bool | 0 | 0 .. 0 | *(unverified)* |
| Scale | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTextureScreen`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTextureScreen` → [`HgcTextureScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTextureScreen.metal)

```metal
//Metal1.0     
//LEN=000000020f
[[ visible ]] FragmentOut HgcTextureScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0*r0;
    r0.x = dot(r0, hg_Params[1]);
    r1 = color1;
    r1.x = dot(r1, hg_Params[1]);
    r1.x = r1.x*hg_Params[0].x + hg_Params[0].z;
    r1.x = clamp(r0.x*hg_Params[0].y + r1.x, 0.00000f, 1.00000f);
    output.color0.xyz = r1.xxx*r1.www;
    output.color0.w = r1.w;
    return output;
}
```

### CPU parameter wiring — `-[PAETextureScreen canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAETextureScreen`

```asm
000000000003d2d8	mov	w4, #0x2
000000000003d2dc	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000003d2e0	ldr	x4, [x25]
000000000003d2e4	sub	x2, x29, #0xe0
000000000003d2e8	mov	x0, x24
000000000003d2ec	mov	w3, #0x3
000000000003d2f0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d2f4	ldr	x4, [x25]
000000000003d2f8	add	x2, sp, #0xe8
000000000003d2fc	mov	x0, x24
000000000003d300	mov	w3, #0x4
000000000003d304	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d308	ldr	x4, [x25]
000000000003d30c	add	x2, sp, #0xe0
000000000003d310	mov	x0, x24
000000000003d314	mov	w3, #0x5
000000000003d318	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d31c	ldr	x4, [x25]
000000000003d320	add	x2, sp, #0xd8
000000000003d324	mov	x0, x24
000000000003d328	mov	w3, #0x6
000000000003d32c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d330	ldr	x4, [x25]
000000000003d334	add	x2, sp, #0xb8
000000000003d338	mov	x0, x24
000000000003d33c	mov	w3, #0x8
000000000003d340	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d344	ldr	x4, [x25]
000000000003d348	add	x2, sp, #0xd0
000000000003d34c	mov	x0, x24
000000000003d350	mov	w3, #0x7
000000000003d354	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d358	ldr	x4, [x25]
000000000003d35c	add	x2, sp, #0xc8
000000000003d360	mov	x0, x24
000000000003d364	mov	w3, #0x9
000000000003d368	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d36c	ldr	x4, [x25]
000000000003d370	add	x2, sp, #0xc0
000000000003d374	mov	x0, x24
000000000003d378	mov	w3, #0xa
000000000003d37c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003d380	ldr	d0, [sp, #0xd8]
000000000003d384	bl	0x252050 ; symbol stub for: ___exp10
000000000003d388	str	d0, [sp, #0xd8]
000000000003d38c	ldr	d0, [sp, #0xe0]
000000000003d390	bl	0x252050 ; symbol stub for: ___exp10
000000000003d394	str	d0, [sp, #0xe0]
000000000003d398	ldr	x2, [x25]
000000000003d39c	mov	x0, x19
000000000003d3a0	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000003d3a4	bl	_objc_msgSend$matrix
000000000003d3a8	cmp	w26, #0x0
000000000003d3ac	ccmp	x21, #0x3, #0x0, ne
000000000003d3b0	cset	w21, eq
000000000003d3b4	b.ne	0x3d870
000000000003d3b8	mov	x24, x0
000000000003d3bc	cbz	x22, 0x3d3d0
000000000003d3c0	add	x8, sp, #0x98
000000000003d3c4	mov	x0, x22
000000000003d3c8	bl	_objc_msgSend$heliumRef
000000000003d3cc	b	0x3d3d4
000000000003d3d0	str	xzr, [sp, #0x98]
000000000003d3d4	add	x8, sp, #0x80
000000000003d3d8	mov	x0, x23
000000000003d3dc	mov	x2, x22
000000000003d3e0	bl	"_objc_msgSend$getScaleForImage:"
000000000003d3e4	ldp	q0, q1, [x25]
000000000003d3e8	ldr	q2, [x25, #0x20]
000000000003d3ec	stp	q0, q1, [sp, #0x30]
000000000003d3f0	str	q2, [sp, #0x50]
000000000003d3f4	ldr	x7, [x25]
000000000003d3f8	add	x2, sp, #0x78
000000000003d3fc	add	x5, sp, #0x30
000000000003d400	mov	x0, x23
000000000003d404	mov	x3, #0x0
000000000003d408	mov	x4, #0x0
000000000003d40c	mov	w6, #0x1
000000000003d410	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
000000000003d414	ldr	x0, [sp, #0x78]
000000000003d418	cbz	x0, 0x3d42c
000000000003d41c	add	x8, sp, #0x30
000000000003d420	bl	_objc_msgSend$heliumRef
000000000003d424	ldr	x19, [sp, #0x30]
000000000003d428	cbnz	x19, 0x3d598
000000000003d42c	str	x28, [sp, #0x10]
000000000003d430	add	x8, sp, #0x30
000000000003d434	mov	x0, x23
000000000003d438	mov	x2, x22
000000000003d43c	bl	"_objc_msgSend$getImageBoundary:"
000000000003d440	ldp	s0, s1, [sp, #0x30]
000000000003d444	fcvtzs	w0, s0
000000000003d448	fcvtzs	w1, s1
000000000003d44c	ldp	s0, s1, [sp, #0x38]
000000000003d450	fcvtzs	w8, s0
000000000003d454	fcvtzs	w9, s1
000000000003d458	add	w2, w8, w0
000000000003d45c	add	w3, w9, w1
000000000003d460	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000003d464	mov	x26, x0
000000000003d468	mov	x28, x1
000000000003d46c	mov	w0, #0x1a0
000000000003d470	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003d474	mov	x19, x0
000000000003d478	mov	x1, x26
000000000003d47c	mov	x2, x28
000000000003d480	bl	0x251060 ; symbol stub for: __ZN12HGSolidColorC1E6HGRect
000000000003d484	ldr	x8, [x19]
000000000003d488	ldr	x8, [x8, #0x60]
000000000003d48c	movi.2d	v0, #0000000000000000
000000000003d490	movi.2d	v1, #0000000000000000
000000000003d494	movi.2d	v2, #0000000000000000
000000000003d498	fmov	s3, #1.00000000
000000000003d49c	mov	x0, x19
000000000003d4a0	mov	w1, #0x0
000000000003d4a4	blr	x8
000000000003d4a8	mov	w0, #0x1d0
000000000003d4ac	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003d4b0	mov	x27, x0
000000000003d4b4	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
000000000003d4b8	ldr	x8, [x27]
000000000003d4bc	ldr	x8, [x8, #0x78]
000000000003d4c0	mov	x0, x27
000000000003d4c4	mov	w1, #0x0
000000000003d4c8	mov	x2, x19
000000000003d4cc	blr	x8
000000000003d4d0	mov	x0, x27
000000000003d4d4	mov	w1, #0x3
000000000003d4d8	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
000000000003d4dc	cmp	x19, x27
000000000003d4e0	b.eq	0x3d508
000000000003d4e4	ldr	x8, [x19]
000000000003d4e8	ldr	x8, [x8, #0x18]
000000000003d4ec	mov	x0, x19
000000000003d4f0	blr	x8
000000000003d4f4	ldr	x8, [x27]
000000000003d4f8	ldr	x8, [x8, #0x10]
000000000003d4fc	mov	x19, x27
000000000003d500	mov	x0, x27
000000000003d504	blr	x8
000000000003d508	ldr	x8, [sp, #0x78]
000000000003d50c	cbnz	x8, 0x3d584
000000000003d510	str	x24, [sp, #0x8]
000000000003d514	adrp	x8, 843 ; 0x388000
000000000003d518	ldr	x0, [x8, #0xef8] ; literal pool symbol address: _OBJC_CLASS_$_FxHeliumImage
000000000003d51c	bl	0x252284 ; symbol stub for: _objc_alloc
000000000003d520	sub	w24, w28, w26
000000000003d524	lsr	x8, x28, #32
000000000003d528	lsr	x28, x26, #32
000000000003d52c	sub	w20, w8, w28
000000000003d530	stp	x24, x20, [sp, #0x30]
000000000003d534	adrp	x8, 556 ; 0x269000
000000000003d538	ldr	q0, [x8, #0xb00]
000000000003d53c	adrp	x8, 556 ; 0x269000
000000000003d540	ldr	q1, [x8, #0xb10]
000000000003d544	stp	q0, q1, [sp, #0x40]
000000000003d548	mov	w8, #0x2
000000000003d54c	str	x8, [sp, #0x60]
000000000003d550	mov	w8, #0x1
000000000003d554	strb	w8, [sp, #0x68]
000000000003d558	mov	x8, #0x3ff0000000000000
000000000003d55c	str	x8, [sp, #0x70]
000000000003d560	add	x2, sp, #0x30
000000000003d564	bl	"_objc_msgSend$initWithInfo:"
000000000003d568	scvtf	d2, w24
000000000003d56c	scvtf	d3, w20
000000000003d570	str	x0, [sp, #0x78]
000000000003d574	scvtf	d0, w26
000000000003d578	scvtf	d1, w28
000000000003d57c	bl	"_objc_msgSend$setBounds:"
000000000003d580	ldr	x24, [sp, #0x8]
000000000003d584	ldr	x8, [x27]
000000000003d588	ldr	x8, [x8, #0x18]
000000000003d58c	mov	x0, x27
000000000003d590	blr	x8
000000000003d594	ldr	x28, [sp, #0x10]
000000000003d598	add	x8, sp, #0x30
000000000003d59c	add	x2, sp, #0xa0
000000000003d5a0	mov	x0, x23
000000000003d5a4	mov	x3, x22
000000000003d5a8	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
000000000003d5ac	ldr	q0, [sp, #0x30]
000000000003d5b0	str	q0, [sp, #0xa0]
000000000003d5b4	ldr	x20, [x25, #0x8]
000000000003d5b8	str	x19, [sp, #0x28]
000000000003d5bc	ldr	x8, [x19]
000000000003d5c0	ldr	x8, [x8, #0x10]
000000000003d5c4	mov	x0, x19
000000000003d5c8	blr	x8
000000000003d5cc	cmp	x20, #0x1
000000000003d5d0	cset	w6, hi
000000000003d5d4	ldp	d0, d1, [sp, #0xa0]
000000000003d5d8	ldp	d4, d2, [sp, #0xe0]
000000000003d5dc	ldr	d3, [sp, #0xd8]
000000000003d5e0	ldur	d5, [x29, #-0xe0]
000000000003d5e4	ldr	q6, [sp, #0x80]
000000000003d5e8	str	q6, [sp, #0x30]
000000000003d5ec	ldr	x4, [sp, #0x78]
000000000003d5f0	add	x8, sp, #0x18
000000000003d5f4	add	x2, sp, #0x28
000000000003d5f8	add	x3, sp, #0x30
000000000003d5fc	mov	x0, x23
000000000003d600	mov	x5, x22
000000000003d604	bl	"_objc_msgSend$transformTile_v2:withXValue:YValue:skew:scale:stretch:rotation:resolution:inputImage:andCropAgainstImage:highQuality:"
000000000003d608	ldr	x26, [sp, #0x18]
000000000003d60c	cbz	x26, 0x3d614
000000000003d610	str	xzr, [sp, #0x18]
000000000003d614	ldr	x0, [sp, #0x28]
000000000003d618	cbz	x0, 0x3d628
000000000003d61c	ldr	x8, [x0]
000000000003d620	ldr	x8, [x8, #0x18]
000000000003d624	blr	x8
000000000003d628	mov	w0, #0x1b0
000000000003d62c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003d630	mov	x27, x0
000000000003d634	bl	__ZN16HgcTextureScreenC2Ev
000000000003d638	adrp	x8, 862 ; 0x39b000
000000000003d63c	add	x8, x8, #0x1a0
000000000003d640	add	x8, x8, #0x10
000000000003d644	str	x8, [x27]
000000000003d648	adrp	x9, 843 ; 0x388000
000000000003d64c	ldr	x9, [x9, #0x560] ; literal pool symbol address: _HGRectNull
000000000003d650	ldr	q0, [x9]
000000000003d654	str	q0, [x27, #0x1a0]
000000000003d658	ldr	x9, [x25, #0x28]
000000000003d65c	cbnz	x9, 0x3d6cc
000000000003d660	mov	w0, #0x1c0
000000000003d664	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003d668	mov	x25, x0
000000000003d66c	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
000000000003d670	ldr	x2, [sp, #0x98]
000000000003d674	ldr	x8, [x25]
000000000003d678	ldr	x8, [x8, #0x78]
000000000003d67c	mov	x0, x25
000000000003d680	mov	w1, #0x0
000000000003d684	blr	x8
000000000003d688	ldr	x0, [sp, #0x98]
000000000003d68c	cmp	x0, x25
000000000003d690	b.eq	0x3d6b8
000000000003d694	cbz	x0, 0x3d6a4
000000000003d698	ldr	x8, [x0]
000000000003d69c	ldr	x8, [x8, #0x18]
000000000003d6a0	blr	x8
000000000003d6a4	str	x25, [sp, #0x98]
000000000003d6a8	ldr	x8, [x25]
000000000003d6ac	ldr	x8, [x8, #0x10]
000000000003d6b0	mov	x0, x25
000000000003d6b4	blr	x8
000000000003d6b8	ldr	x8, [x25]
000000000003d6bc	ldr	x8, [x8, #0x18]
000000000003d6c0	mov	x0, x25
000000000003d6c4	blr	x8
000000000003d6c8	ldr	x8, [x27]
000000000003d6cc	ldr	x2, [sp, #0x98]
000000000003d6d0	ldr	x8, [x8, #0x78]
000000000003d6d4	mov	x0, x27
000000000003d6d8	mov	w1, #0x1
000000000003d6dc	blr	x8
000000000003d6e0	ldr	x8, [x27]
000000000003d6e4	ldr	x8, [x8, #0x78]
000000000003d6e8	mov	x0, x27
000000000003d6ec	mov	w1, #0x0
000000000003d6f0	mov	x2, x26
000000000003d6f4	blr	x8
000000000003d6f8	add	x8, sp, #0x18
000000000003d6fc	mov	x0, x23
000000000003d700	mov	x2, x22
000000000003d704	bl	"_objc_msgSend$getImageBoundary:"
000000000003d708	ldp	d0, d1, [sp, #0x18]
000000000003d70c	fcvtl	v0.2d, v0.2s
000000000003d710	fcvtl	v1.2d, v1.2s
000000000003d714	stp	q0, q1, [sp, #0x30]
000000000003d718	sub	x0, x29, #0xd8
000000000003d71c	add	x1, sp, #0x30
000000000003d720	add	x2, sp, #0x30
000000000003d724	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
000000000003d728	ldp	d0, d1, [sp, #0x30]
000000000003d72c	fcvtzs	w0, d0
000000000003d730	fcvtzs	w1, d1
000000000003d734	ldp	d0, d1, [sp, #0x40]
000000000003d738	fcvtzs	w8, d0
000000000003d73c	fcvtzs	w9, d1
000000000003d740	add	w2, w8, w0
000000000003d744	add	w3, w9, w1
000000000003d748	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000003d74c	mov	x2, x0
000000000003d750	mov	x3, x1
000000000003d754	mov	x0, x27
000000000003d758	mov	x1, x2
000000000003d75c	mov	x2, x3
000000000003d760	bl	__ZN27HGradientWipeClockGenerator6setDODE6HGRect
000000000003d764	ldp	d1, d0, [sp, #0xc8]
000000000003d768	fmul	d2, d0, d1
000000000003d76c	ldp	d4, d3, [sp, #0xb8]
000000000003d770	fmul	d3, d1, d3
000000000003d774	fmul	d4, d1, d4
000000000003d778	fmov	d5, #1.00000000
000000000003d77c	fsub	d0, d5, d0
000000000003d780	fmul	d0, d0, d1
000000000003d784	fmov	d6, #0.50000000
000000000003d788	fmul	d0, d0, d6
000000000003d78c	fadd	d0, d0, d4
000000000003d790	fsub	d1, d5, d1
000000000003d794	fmul	d1, d1, d6
000000000003d798	fadd	d4, d1, d0
000000000003d79c	fcvt	s0, d2
000000000003d7a0	fcvt	s1, d3
000000000003d7a4	fcvt	s2, d4
000000000003d7a8	ldr	x8, [x27]
000000000003d7ac	ldr	x8, [x8, #0x60]
000000000003d7b0	movi.2d	v3, #0000000000000000
000000000003d7b4	mov	x0, x27
000000000003d7b8	mov	w1, #0x0
000000000003d7bc	blr	x8
000000000003d7c0	ldp	d0, d1, [x24]
000000000003d7c4	fcvt	s0, d0
000000000003d7c8	fcvt	s1, d1
000000000003d7cc	ldr	d2, [x24, #0x10]
000000000003d7d0	fcvt	s2, d2
000000000003d7d4	ldr	x8, [x27]
000000000003d7d8	ldr	x8, [x8, #0x60]
000000000003d7dc	movi.2d	v3, #0000000000000000
000000000003d7e0	mov	x0, x27
000000000003d7e4	mov	w1, #0x1
000000000003d7e8	blr	x8
000000000003d7ec	str	x27, [sp, #0x30]
000000000003d7f0	ldr	x8, [x27]
000000000003d7f4	ldr	x8, [x8, #0x10]
000000000003d7f8	mov	x0, x27
000000000003d7fc	blr	x8
000000000003d800	add	x2, sp, #0x30
000000000003d804	mov	x0, x28
000000000003d808	bl	"_objc_msgSend$setHeliumRef:"
000000000003d80c	ldr	x0, [sp, #0x30]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)
    - parm8 (float)
    - parm7 (float)
    - parm9 (float)
    - parm10 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm10 (float)
    slot 0  <-  parm3 (float), parm10 (float), parm9 (float), parm8 (float)
    slot 1  <-  (constant / computed)
```
