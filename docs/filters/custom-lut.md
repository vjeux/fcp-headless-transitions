# Custom LUT

- **PAE class:** `Custom LUT`
- **Plugin UUID:** `14B39AEF-607D-42DF-98DD-DB3DD345E925`
- **Node names in corpus:** Custom LUT (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Custom LUT applies a user-supplied 1D/3D color lookup table (.cube etc.) to the image, remapping colors through the LUT. Convert controls input/output color-space handling around the LUT.

> **Note.** Not implemented; description is the standard FCP "Custom LUT" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| LUT | file | - | - | The color lookup table file applied to the image. |
| Convert | group | - | - | Input/output color-space conversion applied around the LUT. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGColorConform`, `HGColorGamma`, `HGTransform`.

### CPU render method — `-[PAELUTEffect overrideRender:withOutputImage:inputImage:input:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELUTEffect`

```asm
000000000004c484	mov	x20, x0
000000000004c488	bl	0x251240 ; symbol stub for: __ZN14HGColorConformC1Ev
000000000004c48c	mov	w0, #0x370
000000000004c490	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004c494	mov	x21, x0
000000000004c498	bl	0x251240 ; symbol stub for: __ZN14HGColorConformC1Ev
000000000004c49c	mov	x0, x25
000000000004c4a0	bl	0x252314 ; symbol stub for: _objc_opt_class
000000000004c4a4	mov	x2, x27
000000000004c4a8	bl	"_objc_msgSend$colorPrimaries:"
000000000004c4ac	cmp	x0, #0x1
000000000004c4b0	mov	w8, #0x3
000000000004c4b4	csel	w22, w8, wzr, eq
000000000004c4b8	adrp	x8, 1042 ; 0x45e000
000000000004c4bc	ldrsw	x8, [x8, #0x9f0]
000000000004c4c0	ldr	w2, [x25, x8]
000000000004c4c4	sub	x0, x29, #0xa0
000000000004c4c8	sub	x1, x29, #0xa8
000000000004c4cc	bl	__ZN12_GLOBAL__N_110GetConformIN12HGColorGamma26hgColorGammaColorPrimariesENS1_28hgColorGammaTransferFunctionEiEEbRT_RT0_T1_
000000000004c4d0	cbz	w0, 0x4c658
000000000004c4d4	ldr	x8, [x20]
000000000004c4d8	ldr	x8, [x8, #0x78]
000000000004c4dc	mov	x0, x20
000000000004c4e0	mov	w1, #0x0
000000000004c4e4	mov	x2, x23
000000000004c4e8	blr	x8
000000000004c4ec	ldur	w4, [x29, #-0xa0]
000000000004c4f0	ldur	w5, [x29, #-0xa8]
000000000004c4f4	mov	x0, x20
000000000004c4f8	mov	x1, x22
000000000004c4fc	mov	w2, #0x8
000000000004c500	mov	w3, #0x0
000000000004c504	mov	w6, #0x0
000000000004c508	bl	0x251204 ; symbol stub for: __ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_
000000000004c50c	adrp	x8, 1042 ; 0x45e000
000000000004c510	ldrsw	x8, [x8, #0x9f4]
000000000004c514	ldr	w2, [x25, x8]
000000000004c518	sub	x0, x29, #0xa0
000000000004c51c	sub	x1, x29, #0xa8
000000000004c520	bl	__ZN12_GLOBAL__N_110GetConformIN12HGColorGamma26hgColorGammaColorPrimariesENS1_28hgColorGammaTransferFunctionEiEEbRT_RT0_T1_
000000000004c524	cbz	w0, 0x4c658
000000000004c528	ldr	x8, [x21]
000000000004c52c	ldr	x8, [x8, #0x78]
000000000004c530	mov	x0, x21
000000000004c534	mov	w1, #0x0
000000000004c538	mov	x2, x20
000000000004c53c	blr	x8
000000000004c540	ldr	w23, [x26, #0x18]
000000000004c544	adrp	x8, 829 ; 0x389000
000000000004c548	ldr	x0, [x8, #0xa50] ; literal pool symbol address: _OBJC_CLASS_$_NSData
000000000004c54c	bl	0x252284 ; symbol stub for: _objc_alloc
000000000004c550	add	x8, x23, x23, lsl #1
000000000004c554	lsl	x24, x8, #1
000000000004c558	mul	x27, x24, x23
000000000004c55c	ldr	x8, [x26]
000000000004c560	ldr	x2, [x8]
000000000004c564	mul	x3, x27, x23
000000000004c568	mov	w4, #0x0
000000000004c56c	bl	"_objc_msgSend$initWithBytesNoCopy:length:freeWhenDone:"
000000000004c570	mov	x25, x0
000000000004c574	ldur	w2, [x29, #-0xa0]
000000000004c578	ldur	w3, [x29, #-0xa8]
000000000004c57c	add	x8, x26, #0x8
000000000004c580	ldp	s1, s0, [x26, #0x20]
000000000004c584	mov	w9, #0x10
000000000004c588	stp	x8, x9, [sp, #0x10]
000000000004c58c	mov	w8, #0x2
000000000004c590	str	w8, [sp, #0xc]
000000000004c594	strb	wzr, [sp, #0x8]
000000000004c598	str	x27, [sp]
000000000004c59c	adrp	x8, 541 ; 0x269000
000000000004c5a0	ldr	s2, [x8, #0x26c]
000000000004c5a4	fmov	s3, #1.00000000
000000000004c5a8	movi.2d	v4, #0000000000000000
000000000004c5ac	movi.2d	v5, #0000000000000000
000000000004c5b0	fmov	s6, #1.00000000
000000000004c5b4	mov	x0, x21
000000000004c5b8	mov	w1, #0x0
000000000004c5bc	mov	x4, x22
000000000004c5c0	mov	x5, x25
000000000004c5c4	mov	x6, x23
000000000004c5c8	mov	x7, x24
000000000004c5cc	bl	0x251234 ; symbol stub for: __ZN14HGColorConform22SetLook3DLutConversionEN12HGColorGamma30hgColorGammaMatrixCoefficientsENS0_26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionES2_PK8__CFDatammmfffbNS_15hgLookLUTEndianEPhmffff
000000000004c5d0	mov	x0, x25
000000000004c5d4	bl	0x252344 ; symbol stub for: _objc_release
000000000004c5d8	str	x21, [sp, #0x28]
000000000004c5dc	ldr	x8, [x21]
000000000004c5e0	ldr	x8, [x8, #0x10]
000000000004c5e4	mov	x0, x21
000000000004c5e8	blr	x8
000000000004c5ec	add	x2, sp, #0x28
000000000004c5f0	mov	x0, x19
000000000004c5f4	bl	"_objc_msgSend$setHeliumRef:"
000000000004c5f8	ldr	x0, [sp, #0x28]
000000000004c5fc	cbz	x0, 0x4c60c
000000000004c600	ldr	x8, [x0]
000000000004c604	ldr	x8, [x8, #0x18]
000000000004c608	blr	x8
000000000004c60c	mov	w19, #0x1
000000000004c610	b	0x4c664
000000000004c614	cbz	w8, 0x4c690
000000000004c618	cbz	x23, 0x4c62c
000000000004c61c	ldr	x8, [x23]
000000000004c620	ldr	x8, [x8, #0x10]
000000000004c624	mov	x0, x23
000000000004c628	blr	x8
000000000004c62c	str	x23, [sp, #0x28]
000000000004c630	add	x2, sp, #0x28
000000000004c634	mov	x0, x19
000000000004c638	bl	"_objc_msgSend$setHeliumRef:"
000000000004c63c	ldr	x0, [sp, #0x28]
000000000004c640	cbz	x0, 0x4c650
000000000004c644	ldr	x8, [x0]
000000000004c648	ldr	x8, [x8, #0x18]
000000000004c64c	blr	x8
000000000004c650	mov	w22, #0x1
000000000004c654	b	0x4c980
000000000004c658	mov	w19, #0x0
000000000004c65c	mov	w22, #0x0
000000000004c660	cbz	x21, 0x4c678
000000000004c664	ldr	x8, [x21]
000000000004c668	ldr	x8, [x8, #0x18]
000000000004c66c	mov	x0, x21
000000000004c670	blr	x8
000000000004c674	mov	x22, x19
000000000004c678	cbz	x20, 0x4c980
000000000004c67c	ldr	x8, [x20]
000000000004c680	ldr	x8, [x8, #0x18]
000000000004c684	mov	x0, x20
000000000004c688	blr	x8
000000000004c68c	b	0x4c980
000000000004c690	adrp	x8, 1052 ; 0x468000
000000000004c694	add	x8, x8, #0x28
000000000004c698	ldaprb	w8, [x8]
000000000004c69c	tbz	w8, #0x0, 0x4c9b8
000000000004c6a0	adrp	x8, 1052 ; 0x468000
000000000004c6a4	ldr	x8, [x8, #0x18]
000000000004c6a8	cmn	x8, #0x1
000000000004c6ac	b.ne	0x4c9b0
000000000004c6b0	adrp	x9, 1052 ; 0x468000
000000000004c6b4	add	x9, x9, #0x30
000000000004c6b8	ldr	x8, [x9, #0x8]
000000000004c6bc	ldr	q0, [x9]
000000000004c6c0	stur	q0, [x29, #-0xa0]
000000000004c6c4	cbz	x8, 0x4c6d4
000000000004c6c8	add	x8, x8, #0x8
000000000004c6cc	mov	w9, #0x1
000000000004c6d0	ldadd	x9, x8, [x8]
000000000004c6d4	fmov	x8, d0
000000000004c6d8	cmp	x8, #0x0
000000000004c6dc	cset	w22, ne
000000000004c6e0	cbz	x8, 0x4c950
000000000004c6e4	stur	xzr, [x29, #-0xa8]
000000000004c6e8	add	x8, sp, #0x28
000000000004c6ec	sub	x0, x29, #0xa0
000000000004c6f0	sub	x1, x29, #0xa8
000000000004c6f4	bl	0x251c30 ; symbol stub for: __ZN9FxSupport16createBitmapNodeERKNSt3__110shared_ptrI8PCBitmapEERK9PCVector2IiE
000000000004c6f8	ldr	x20, [sp, #0x28]
000000000004c6fc	add	x0, sp, #0x28
000000000004c700	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
000000000004c704	mov	w0, #0x210
000000000004c708	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004c70c	mov	x21, x0
000000000004c710	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
000000000004c714	mov	x0, x19
000000000004c718	bl	_objc_msgSend$pixelTransform
000000000004c71c	mov	x28, x0
000000000004c720	mov	w0, #0x4a0
000000000004c724	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004c728	mov	x23, x0
000000000004c72c	bl	0x25103c ; symbol stub for: __ZN12HGColorGammaC1Ev
000000000004c730	mov	x0, x25
000000000004c734	bl	0x252314 ; symbol stub for: _objc_opt_class
000000000004c738	mov	x2, x27
000000000004c73c	bl	"_objc_msgSend$colorPrimaries:"
000000000004c740	mov	x25, x0
000000000004c744	ldr	x8, [x23]
000000000004c748	ldr	x8, [x8, #0x78]
000000000004c74c	mov	x0, x23
000000000004c750	mov	w1, #0x0
000000000004c754	mov	x2, x21
000000000004c758	blr	x8
000000000004c75c	cmp	x25, #0x1
000000000004c760	mov	w8, #0x3
000000000004c764	csel	w4, w8, wzr, eq
000000000004c768	mov	x0, x23
000000000004c76c	mov	w1, #0x0
000000000004c770	mov	w2, #0xd
000000000004c774	mov	w3, #0x0
000000000004c778	mov	w5, #0x8
000000000004c77c	mov	w6, #0x0
000000000004c780	bl	0x251024 ; symbol stub for: __ZN12HGColorGamma13SetConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_
000000000004c784	mov	x0, x23
000000000004c788	mov	w1, #0x0
000000000004c78c	mov	w2, #0x1
000000000004c790	bl	0x251030 ; symbol stub for: __ZN12HGColorGamma19SetPremultiplyStateEbb
000000000004c794	cbz	x28, 0x4c8c8
000000000004c798	movi.2d	v0, #0000000000000000
000000000004c79c	movi.2d	v1, #0000000000000000
000000000004c7a0	mov	x0, x28
000000000004c7a4	bl	"_objc_msgSend$transform2DPoint:"
000000000004c7a8	mov.16b	v9, v0
000000000004c7ac	mov.16b	v8, v1
000000000004c7b0	mov	x0, x28
000000000004c7b4	bl	_objc_msgSend$matrix
000000000004c7b8	cbz	x0, 0x4c7d0
000000000004c7bc	ldr	d0, [x0]
000000000004c7c0	fneg	d1, d0
000000000004c7c4	fcmp	d0, #0.0
000000000004c7c8	fcsel	d11, d1, d0, mi
000000000004c7cc	b	0x4c7d4
000000000004c7d0	fmov	d11, #1.00000000
000000000004c7d4	mov	x0, x26
000000000004c7d8	bl	_objc_msgSend$bounds
000000000004c7dc	bl	0x2508d4 ; symbol stub for: _CGRectGetWidth
000000000004c7e0	mov.16b	v10, v0
000000000004c7e4	mov	x0, x19
000000000004c7e8	bl	_objc_msgSend$width
000000000004c7ec	mov	x25, x0
000000000004c7f0	mov	x0, x19
000000000004c7f4	bl	_objc_msgSend$height
000000000004c7f8	ucvtf	d0, x25
000000000004c7fc	ldr	d1, [x24, #0x18]
000000000004c800	fneg	d2, d1
000000000004c804	fcmp	d1, #0.0
000000000004c808	fcsel	d1, d2, d1, mi
000000000004c80c	fdiv	d2, d10, d0
000000000004c810	fmul	d1, d2, d1
000000000004c814	fmul	d0, d1, d0
000000000004c818	fmul	d0, d11, d0
000000000004c81c	ldur	x8, [x29, #-0xa0]
000000000004c820	ldp	s1, s2, [x8, #0x1c]
000000000004c824	ucvtf	d1, d1
000000000004c828	fdiv	d10, d0, d1
000000000004c82c	fmov	d0, #1.00000000
000000000004c830	fdiv	d12, d0, d11
000000000004c834	fadd	d3, d9, d9
000000000004c838	fmov	d4, #0.50000000
000000000004c83c	fmul	d3, d3, d4
000000000004c840	fmul	d1, d12, d1
000000000004c844	fmul	d1, d1, d10
000000000004c848	fmul	d1, d1, d4
000000000004c84c	fsub	d1, d3, d1
000000000004c850	fdiv	d3, d0, d10
000000000004c854	fadd	d5, d8, d8
000000000004c858	fmul	d0, d3, d1
000000000004c85c	fmul	d0, d11, d0
000000000004c860	fmul	d1, d5, d4
000000000004c864	ucvtf	d2, d2
000000000004c868	fmul	d2, d12, d2
000000000004c86c	fmul	d2, d2, d10
000000000004c870	fmul	d2, d2, d4
000000000004c874	fsub	d1, d1, d2
000000000004c878	fmul	d1, d3, d1
000000000004c87c	fmul	d1, d11, d1
000000000004c880	add	x0, sp, #0x28
000000000004c884	movi.2d	v2, #0000000000000000
000000000004c888	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
000000000004c88c	adrp	x8, 828 ; 0x388000
000000000004c890	ldr	x0, [x8, #0xcd0] ; literal pool symbol address: _OBJC_CLASS_$_PCApp
000000000004c894	bl	_objc_msgSend$isMotion
000000000004c898	fmul	d0, d12, d10
000000000004c89c	fnmul	d1, d12, d10
000000000004c8a0	cmp	w0, #0x0
000000000004c8a4	fcsel	d1, d1, d0, ne
000000000004c8a8	add	x0, sp, #0x28
000000000004c8ac	fmov	d2, #1.00000000
000000000004c8b0	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
000000000004c8b4	ldr	x8, [x21]
000000000004c8b8	ldr	x8, [x8, #0x230]
000000000004c8bc	add	x1, sp, #0x28
000000000004c8c0	mov	x0, x21
000000000004c8c4	blr	x8
000000000004c8c8	ldr	x8, [x21]
000000000004c8cc	ldr	x8, [x8, #0x78]
000000000004c8d0	mov	x0, x21
000000000004c8d4	mov	w1, #0x0
000000000004c8d8	mov	x2, x20
000000000004c8dc	blr	x8
000000000004c8e0	stur	x23, [x29, #-0xa8]
000000000004c8e4	ldr	x8, [x23]
000000000004c8e8	ldr	x8, [x8, #0x10]
000000000004c8ec	mov	x0, x23
000000000004c8f0	blr	x8
000000000004c8f4	sub	x2, x29, #0xa8
000000000004c8f8	mov	x0, x19
000000000004c8fc	bl	"_objc_msgSend$setHeliumRef:"
000000000004c900	ldur	x0, [x29, #-0xa8]
```

### Helium primitive — `HGColorConform::GetOutput(HGRenderer*)`
The primitive's own output builder (its per-pixel/tile work). Regenerate: `venv/bin/python3 tools/re/disasm_primitive.py HGColorConform`

```asm
000000000019f184	stp	x22, x21, [sp, #-0x30]!
000000000019f188	stp	x20, x19, [sp, #0x10]
000000000019f18c	stp	x29, x30, [sp, #0x20]
000000000019f190	add	x29, sp, #0x20
000000000019f194	mov	x21, x1
000000000019f198	mov	x19, x0
000000000019f19c	ldr	w2, [x0, #0x1e4]
000000000019f1a0	cmn	w2, #0x1
000000000019f1a4	b.eq	0x19f1f4
000000000019f1a8	bl	__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRendererNS_30hgColorConformConversionPresetE
000000000019f1ac	tbz	w0, #0x0, 0x19f1fc
000000000019f1b0	ldr	x20, [x19, #0x198]
000000000019f1b4	mov	x0, x21
000000000019f1b8	mov	x1, x19
000000000019f1bc	mov	w2, #0x0
000000000019f1c0	bl	__ZN10HGRenderer8GetInputEP6HGNodei
000000000019f1c4	mov	x2, x0
000000000019f1c8	ldr	x8, [x20]
000000000019f1cc	ldr	x8, [x8, #0x78]
000000000019f1d0	mov	x0, x20
000000000019f1d4	mov	w1, #0x0
000000000019f1d8	blr	x8
000000000019f1dc	ldr	x20, [x19, #0x1a0]
000000000019f1e0	mov	x0, x20
000000000019f1e4	ldp	x29, x30, [sp, #0x20]
000000000019f1e8	ldp	x20, x19, [sp, #0x10]
000000000019f1ec	ldp	x22, x21, [sp], #0x30
000000000019f1f0	ret
000000000019f1f4	bl	__ZN14HGColorConform29CreateColorConformHeliumGraphEP10HGRenderer
000000000019f1f8	cbnz	w0, 0x19f1b0
000000000019f1fc	mov	w0, #0x4a0
000000000019f200	bl	__ZN8HGObjectnwEm
000000000019f204	mov	x20, x0
000000000019f208	bl	__ZN12HGColorGammaC1Ev
000000000019f20c	ldrb	w1, [x19, #0x1da]
000000000019f210	mov	x0, x20
000000000019f214	bl	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb
000000000019f218	mov	x0, x21
000000000019f21c	mov	x1, x19
000000000019f220	mov	w2, #0x0
000000000019f224	bl	__ZN10HGRenderer8GetInputEP6HGNodei
000000000019f228	mov	x2, x0
000000000019f22c	ldr	x8, [x20]
000000000019f230	ldr	x8, [x8, #0x78]
000000000019f234	mov	x0, x20
000000000019f238	mov	w1, #0x0
000000000019f23c	blr	x8
000000000019f240	mov	x0, x20
000000000019f244	mov	w1, #0x0
000000000019f248	bl	__ZN12HGColorGamma19SetConversionPresetENS_28hgColorGammaConversionPresetE
000000000019f24c	ldrb	w1, [x19, #0x1b0]
000000000019f250	mov	x0, x20
000000000019f254	bl	__ZN12HGColorGamma15SetFallbackModeEb
000000000019f258	ldrb	w1, [x19, #0x1b1]
000000000019f25c	mov	x0, x20
000000000019f260	bl	__ZN12HGColorGamma13SetDitherModeEb
000000000019f264	ldr	w1, [x19, #0x1bc]
000000000019f268	mov	x0, x20
000000000019f26c	bl	__ZN12HGColorGamma19SetInputPixelFormatE13HGYCbCrFormat
000000000019f270	ldr	w1, [x19, #0x1b8]
000000000019f274	ldr	w2, [x19, #0x1c0]
000000000019f278	mov	x0, x20
000000000019f27c	bl	__ZN12HGColorGamma20SetOutputPixelFormatE8HGFormat13HGYCbCrFormat
000000000019f280	ldr	w1, [x19, #0x1c4]
000000000019f284	mov	x0, x20
000000000019f288	bl	__ZN12HGColorGamma21SetInOut422FilterModeENS_30hgColorGammaInOut422FilterModeE
000000000019f28c	ldp	x1, x2, [x19, #0x1c8]
000000000019f290	mov	x0, x20
000000000019f294	bl	__ZN12HGColorGamma21SetInOut422FilterRectE6HGRect
000000000019f298	ldrb	w1, [x19, #0x1b2]
000000000019f29c	mov	x0, x20
000000000019f2a0	bl	__ZN12HGColorGamma26SetFixedPointPrecisionModeEb
000000000019f2a4	ldrb	w1, [x19, #0x1d8]
000000000019f2a8	ldrb	w2, [x19, #0x1d9]
000000000019f2ac	mov	x0, x20
000000000019f2b0	bl	__ZN12HGColorGamma19SetPremultiplyStateEbb
000000000019f2b4	ldr	s0, [x19, #0x1dc]
000000000019f2b8	ldr	s1, [x19, #0x1e0]
000000000019f2bc	mov	x0, x20
000000000019f2c0	bl	__ZN12HGColorGamma22Set1DLutScaleAndOffsetEff
000000000019f2c4	stp	x20, x20, [x19, #0x198]
000000000019f2c8	mov	x0, x20
000000000019f2cc	ldp	x29, x30, [sp, #0x20]
000000000019f2d0	ldp	x20, x19, [sp, #0x10]
000000000019f2d4	ldp	x22, x21, [sp], #0x30
000000000019f2d8	ret
000000000019f2dc	mov	x19, x0
000000000019f2e0	mov	x0, x20
000000000019f2e4	bl	__ZN8HGObjectdlEPv
000000000019f2e8	mov	x0, x19
000000000019f2ec	bl	0x319314 ; symbol stub for: __Unwind_Resume
```
