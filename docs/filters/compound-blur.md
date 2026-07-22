# Compound Blur

- **PAE class:** `Compound Blur`
- **Plugin UUID:** `000BAA25-418E-412B-8649-CF5C7C2771E3`
- **Node names in corpus:** Compound Blur (81), Compound Blur copy (1), Vignette Blur (1), Compound Blur 1 (1), Compound Blur Source (1)
- **Corpus usage:** 83 files, 85 instances

## What it does

Compound Blur uses a second image (the Blur Map) to drive blur strength per pixel: bright areas of the map get more blur, dark areas stay sharp, so an arbitrary mask controls where focus falls. Amount is the max radius, Map Channel selects which channel of the map to read, and Invert/Stretch adjust the mask. It is the general depth-of-field-from-a-matte tool.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Compound Blur". Behavior follows a variable Gaussian driven by the map channel.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 7 | 0 .. 300 | Maximum blur radius reached where the map is fully bright, 0-300. 0 = no blur. *(keyframed in 7 instances)* |
| Blur Map | source ref | 0 | 0 .. 3335359707 | Reference to the layer used as the per-pixel blur-strength map (stored as a source-ID integer). |
| Map Channel | enum(int) | 4 | 3 .. 4 | Which channel of the map drives blur, 3-4 (e.g. alpha vs luminance). |
| Invert Map | bool | 0 | 0 .. 1 | Toggle: invert the map so dark areas blur instead of bright. |
| Stretch Map | bool | 0 | 0 .. 1 | Toggle: stretch/fit the map to the frame. |
| Horizontal | float (percent) | 100 | 10 .. 100 | Horizontal blur weighting, 10-100%. |
| Vertical | float (percent) | 100 | 10 .. 100 | Vertical blur weighting, 10-100%. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 4 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGColorMatrix`, `HGModulatedBlur`.

### CPU render method — `-[PAECompoundBlur canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAECompoundBlur`

```asm
000000000001d368	mov	w3, #0x1
000000000001d36c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001d370	ldr	d0, [sp, #0x68]
000000000001d374	fmov	d1, #0.50000000
000000000001d378	fmul	d0, d0, d1
000000000001d37c	str	d0, [sp, #0x68]
000000000001d380	ldr	x4, [x22]
000000000001d384	add	x2, sp, #0x60
000000000001d388	mov	x0, x24
000000000001d38c	mov	w3, #0x6
000000000001d390	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001d394	ldr	d0, [sp, #0x60]
000000000001d398	adrp	x8, 587 ; 0x268000
000000000001d39c	ldr	d11, [x8, #0xc48]
000000000001d3a0	fmul	d0, d0, d11
000000000001d3a4	fdiv	d1, d10, d8
000000000001d3a8	fmul	d0, d1, d0
000000000001d3ac	str	d0, [sp, #0x60]
000000000001d3b0	ldr	x4, [x22]
000000000001d3b4	add	x2, sp, #0x58
000000000001d3b8	mov	x0, x24
000000000001d3bc	mov	w3, #0x7
000000000001d3c0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001d3c4	ldr	d0, [sp, #0x58]
000000000001d3c8	fmul	d0, d0, d11
000000000001d3cc	fdiv	d1, d9, d8
000000000001d3d0	fmul	d0, d1, d0
000000000001d3d4	str	d0, [sp, #0x58]
000000000001d3d8	ldr	x4, [x22]
000000000001d3dc	add	x2, sp, #0x54
000000000001d3e0	mov	x0, x24
000000000001d3e4	mov	w3, #0x3
000000000001d3e8	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000001d3ec	ldr	x4, [x22]
000000000001d3f0	add	x2, sp, #0x53
000000000001d3f4	mov	x0, x24
000000000001d3f8	mov	w3, #0x4
000000000001d3fc	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001d400	ldr	x4, [x22]
000000000001d404	add	x2, sp, #0x52
000000000001d408	mov	x0, x24
000000000001d40c	mov	w3, #0x5
000000000001d410	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001d414	mov	x0, x20
000000000001d418	bl	_objc_msgSend$imageType
000000000001d41c	ldr	d0, [sp, #0x68]
000000000001d420	fcmp	d0, #0.0
000000000001d424	b.ls	0x1d478
000000000001d428	mov	x24, x0
000000000001d42c	ldrb	w8, [sp, #0x53]
000000000001d430	cmp	w8, #0x0
000000000001d434	fmov	s0, #1.00000000
000000000001d438	fmov	s1, #-1.00000000
000000000001d43c	fcsel	s0, s1, s0, ne
000000000001d440	str	q0, [sp, #0x20]
000000000001d444	movi	d0, #0000000000000000
000000000001d448	str	q0, [sp, #0x10]
000000000001d44c	ldr	w8, [sp, #0x54]
000000000001d450	cmp	w8, #0x2
000000000001d454	b.gt	0x1d48c
000000000001d458	cmp	w8, #0x1
000000000001d45c	b.eq	0x1d508
000000000001d460	cmp	w8, #0x2
000000000001d464	b.ne	0x1d500
000000000001d468	movi	d0, #0000000000000000
000000000001d46c	ldr	q1, [sp, #0x20]
000000000001d470	mov.s	v0[0], v1[0]
000000000001d474	b	0x1d520
000000000001d478	cbz	x20, 0x1d4d8
000000000001d47c	add	x8, sp, #0x80
000000000001d480	mov	x0, x20
000000000001d484	bl	_objc_msgSend$heliumRef
000000000001d488	b	0x1d4dc
000000000001d48c	cmp	w8, #0x3
000000000001d490	b.eq	0x1d514
000000000001d494	cmp	w8, #0x4
000000000001d498	b.ne	0x1d500
000000000001d49c	adrp	x8, 588 ; 0x269000
000000000001d4a0	ldr	s0, [x8, #0x5d0]
000000000001d4a4	ldr	q2, [sp, #0x20]
000000000001d4a8	fmul	s0, s2, s0
000000000001d4ac	str	q0, [sp]
000000000001d4b0	adrp	x8, 588 ; 0x269000
000000000001d4b4	ldr	s0, [x8, #0x5d4]
000000000001d4b8	adrp	x8, 588 ; 0x269000
000000000001d4bc	ldr	s1, [x8, #0x5d8]
000000000001d4c0	fmul	s1, s2, s1
000000000001d4c4	fmul	s0, s2, s0
000000000001d4c8	movi	d2, #0000000000000000
000000000001d4cc	mov.s	v2[0], v1[0]
000000000001d4d0	str	q2, [sp, #0x10]
000000000001d4d4	b	0x1d530
000000000001d4d8	str	xzr, [sp, #0x80]
000000000001d4dc	add	x2, sp, #0x80
000000000001d4e0	mov	x0, x19
000000000001d4e4	bl	"_objc_msgSend$setHeliumRef:"
000000000001d4e8	ldr	x0, [sp, #0x80]
000000000001d4ec	cbz	x0, 0x1d82c
000000000001d4f0	ldr	x8, [x0]
000000000001d4f4	ldr	x8, [x8, #0x18]
000000000001d4f8	blr	x8
000000000001d4fc	b	0x1d82c
000000000001d500	ldr	q0, [sp, #0x20]
000000000001d504	b	0x1d528
000000000001d508	movi.2d	v0, #0000000000000000
000000000001d50c	str	q0, [sp]
000000000001d510	b	0x1d534
000000000001d514	movi	d0, #0000000000000000
000000000001d518	ldr	q1, [sp, #0x20]
000000000001d51c	mov.s	v0[1], v1[0]
000000000001d520	str	q0, [sp, #0x10]
000000000001d524	movi.2d	v0, #0000000000000000
000000000001d528	str	q0, [sp]
000000000001d52c	movi.2d	v0, #0000000000000000
000000000001d530	str	q0, [sp, #0x20]
000000000001d534	mov	x0, x20
000000000001d538	bl	_objc_msgSend$pixelAspect
000000000001d53c	mov.16b	v8, v0
000000000001d540	mov	w0, #0x0
000000000001d544	adrp	x8, 875 ; 0x388000
000000000001d548	ldr	x8, [x8, #0xfc8] ; literal pool symbol address: _OBJC_IVAR_$_PAESharedDefaultBase._upscalesFields
000000000001d54c	ldrsw	x8, [x8]
000000000001d550	ldrb	w8, [x21, x8]
000000000001d554	cmp	w8, #0x0
000000000001d558	fmov	d0, #2.00000000
000000000001d55c	fmov	d1, #1.00000000
000000000001d560	fcsel	d11, d1, d0, ne
000000000001d564	cbz	w23, 0x1d830
000000000001d568	mov	w8, w24
000000000001d56c	cmp	x8, #0x3
000000000001d570	b.ne	0x1d830
000000000001d574	cbz	x20, 0x1d588
000000000001d578	add	x8, sp, #0x48
000000000001d57c	mov	x0, x20
000000000001d580	bl	_objc_msgSend$heliumRef
000000000001d584	b	0x1d58c
000000000001d588	str	xzr, [sp, #0x48]
000000000001d58c	str	xzr, [sp, #0x40]
000000000001d590	ldp	q0, q1, [x22]
000000000001d594	ldr	q2, [x22, #0x20]
000000000001d598	stp	q0, q1, [sp, #0x80]
000000000001d59c	str	q2, [sp, #0xa0]
000000000001d5a0	ldr	x7, [x22]
000000000001d5a4	add	x2, sp, #0x40
000000000001d5a8	add	x5, sp, #0x80
000000000001d5ac	mov	x0, x21
000000000001d5b0	mov	x3, #0x0
000000000001d5b4	mov	x4, #0x0
000000000001d5b8	mov	w6, #0x2
000000000001d5bc	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
000000000001d5c0	ldr	x24, [sp, #0x40]
000000000001d5c4	cbz	x24, 0x1d5dc
000000000001d5c8	add	x8, sp, #0x80
000000000001d5cc	mov	x0, x24
000000000001d5d0	bl	_objc_msgSend$heliumRef
000000000001d5d4	ldr	x22, [sp, #0x80]
000000000001d5d8	b	0x1d5f8
000000000001d5dc	str	x20, [sp, #0x40]
000000000001d5e0	ldr	x22, [sp, #0x48]
000000000001d5e4	cbz	x22, 0x1d5f8
000000000001d5e8	ldr	x8, [x22]
000000000001d5ec	ldr	x8, [x8, #0x10]
000000000001d5f0	mov	x0, x22
000000000001d5f4	blr	x8
000000000001d5f8	mov	w0, #0x1d0
000000000001d5fc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001d600	mov	x23, x0
000000000001d604	bl	0x2512dc ; symbol stub for: __ZN15HGModulatedBlurC1Ev
000000000001d608	ldr	d0, [sp, #0x68]
000000000001d60c	fcvt	s0, d0
000000000001d610	ldr	x8, [x23]
000000000001d614	ldr	x8, [x8, #0x60]
000000000001d618	movi.2d	v1, #0000000000000000
000000000001d61c	movi.2d	v2, #0000000000000000
000000000001d620	movi.2d	v3, #0000000000000000
000000000001d624	mov	x0, x23
000000000001d628	mov	w1, #0x0
000000000001d62c	blr	x8
000000000001d630	ldp	d1, d0, [sp, #0x58]
000000000001d634	fmul	d0, d10, d0
000000000001d638	fdiv	d0, d0, d8
000000000001d63c	fcvt	s0, d0
000000000001d640	fmul	d1, d9, d1
000000000001d644	fdiv	d1, d1, d11
000000000001d648	fcvt	s1, d1
000000000001d64c	ldr	x8, [x23]
000000000001d650	ldr	x8, [x8, #0x60]
000000000001d654	movi.2d	v2, #0000000000000000
000000000001d658	movi.2d	v3, #0000000000000000
000000000001d65c	mov	x0, x23
000000000001d660	mov	w1, #0x1
000000000001d664	blr	x8
000000000001d668	sub	x8, x29, #0xa0
000000000001d66c	adrp	x9, 588 ; 0x269000
000000000001d670	add	x9, x9, #0x5dc
000000000001d674	ldp	q0, q1, [x9]
000000000001d678	stp	q0, q1, [x8]
000000000001d67c	ldur	q0, [x9, #0x1c]
000000000001d680	stur	q0, [x8, #0x1c]
000000000001d684	ldr	d0, [sp, #0x68]
000000000001d688	bl	0x252218 ; symbol stub for: _log2
000000000001d68c	frintp	d0, d0
000000000001d690	fmov	d1, #1.00000000
000000000001d694	fadd	d0, d0, d1
000000000001d698	fcvt	s0, d0
000000000001d69c	fcmp	s0, #0.0
000000000001d6a0	fmov	s1, #1.00000000
000000000001d6a4	fcsel	s0, s0, s1, hi
000000000001d6a8	fcvtzu	x2, s0
000000000001d6ac	sub	x1, x29, #0xa0
000000000001d6b0	mov	x0, x23
000000000001d6b4	bl	0x2512d0 ; symbol stub for: __ZN15HGModulatedBlur13setBlurValuesEPKfm
000000000001d6b8	ldr	x2, [sp, #0x48]
000000000001d6bc	ldr	x8, [x23]
000000000001d6c0	ldr	x8, [x8, #0x78]
000000000001d6c4	mov	x0, x23
000000000001d6c8	mov	w1, #0x0
000000000001d6cc	blr	x8
000000000001d6d0	mov	w0, #0x1f0
000000000001d6d4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001d6d8	mov	x25, x0
000000000001d6dc	bl	0x2510fc ; symbol stub for: __ZN13HGColorMatrixC1Ev
000000000001d6e0	ldr	x8, [x25]
000000000001d6e4	ldr	x8, [x8, #0x78]
000000000001d6e8	mov	x0, x25
000000000001d6ec	mov	w1, #0x0
000000000001d6f0	mov	x2, x22
000000000001d6f4	blr	x8
000000000001d6f8	ldp	q0, q2, [sp, #0x10]
000000000001d6fc	ldr	q1, [sp]
000000000001d700	mov.s	v1[1], v2[0]
000000000001d704	mov.d	v1[1], v0[0]
000000000001d708	movi.2d	v0, #0000000000000000
000000000001d70c	stp	q1, q0, [sp, #0x80]
000000000001d710	adrp	x8, 587 ; 0x268000
000000000001d714	ldr	q1, [x8, #0xc10]
000000000001d718	stp	q0, q1, [sp, #0xa0]
000000000001d71c	add	x1, sp, #0x80
000000000001d720	mov	x0, x25
000000000001d724	mov	w2, #0x1
000000000001d728	bl	0x2510e4 ; symbol stub for: __ZN13HGColorMatrix10MultMatrixEPK5HGVecb
000000000001d72c	ldrb	w8, [sp, #0x53]
000000000001d730	cmp	w8, #0x1
000000000001d734	b.ne	0x1d74c
000000000001d738	fmov	s0, #1.00000000
000000000001d73c	movi.2d	v1, #0000000000000000
000000000001d740	movi.2d	v2, #0000000000000000
000000000001d744	mov	x0, x25
000000000001d748	bl	0x2510f0 ; symbol stub for: __ZN13HGColorMatrix9TranslateEfff
000000000001d74c	str	x25, [sp, #0x38]
000000000001d750	ldr	x8, [x25]
000000000001d754	ldr	x8, [x8, #0x10]
000000000001d758	mov	x0, x25
000000000001d75c	blr	x8
000000000001d760	ldr	x3, [sp, #0x40]
000000000001d764	ldrb	w5, [sp, #0x52]
000000000001d768	add	x2, sp, #0x38
000000000001d76c	mov	x0, x21
000000000001d770	mov	x4, x20
000000000001d774	bl	"_objc_msgSend$transform:fromImage:toImage:fit:"
000000000001d778	ldr	x2, [sp, #0x38]
000000000001d77c	ldr	x8, [x23]
000000000001d780	ldr	x8, [x8, #0x78]
000000000001d784	mov	x0, x23
000000000001d788	mov	w1, #0x1
000000000001d78c	blr	x8
000000000001d790	ldr	x0, [sp, #0x38]
000000000001d794	cbz	x0, 0x1d7a4
000000000001d798	ldr	x8, [x0]
000000000001d79c	ldr	x8, [x8, #0x18]
000000000001d7a0	blr	x8
000000000001d7a4	ldr	x8, [x25]
000000000001d7a8	ldr	x8, [x8, #0x18]
000000000001d7ac	mov	x0, x25
000000000001d7b0	blr	x8
000000000001d7b4	str	x23, [sp, #0x80]
000000000001d7b8	ldr	x8, [x23]
000000000001d7bc	ldr	x8, [x8, #0x10]
000000000001d7c0	mov	x0, x23
000000000001d7c4	blr	x8
000000000001d7c8	add	x2, sp, #0x80
000000000001d7cc	mov	x0, x19
000000000001d7d0	bl	"_objc_msgSend$setHeliumRef:"
000000000001d7d4	ldr	x0, [sp, #0x80]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : ImageReference
    parm3 : PopupMenu
    parm4 : ToggleButton
    parm5 : ToggleButton
    parm6 : FloatSlider
    parm7 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm6 (float)
    - parm7 (float)
    - parm3 (int)
    - parm4 (bool)
    - parm5 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm7 (float)
```

### Helium primitive — `HGColorMatrix::GetOutput(HGRenderer*)`
The primitive's own output builder (its per-pixel/tile work). Regenerate: `venv/bin/python3 tools/re/disasm_primitive.py HGColorMatrix`

```asm
000000000018b778	stp	x22, x21, [sp, #-0x30]!
000000000018b77c	stp	x20, x19, [sp, #0x10]
000000000018b780	stp	x29, x30, [sp, #0x20]
000000000018b784	add	x29, sp, #0x20
000000000018b788	mov	x19, x1
000000000018b78c	mov	x20, x0
000000000018b790	ldr	q0, [x0, #0x1b0]
000000000018b794	adrp	x8, 406 ; 0x321000
000000000018b798	ldr	q1, [x8, #0x1e0]
000000000018b79c	mov	w8, #0xc5ac
000000000018b7a0	movk	w8, #0x3727, lsl #16
000000000018b7a4	fmov	s2, w8
000000000018b7a8	bl	__ZN6HGMath22IsEqualWithinToleranceE19__simd128_float32_tS0_f
000000000018b7ac	cbz	w0, 0x18b82c
000000000018b7b0	ldr	q0, [x20, #0x1c0]
000000000018b7b4	adrp	x8, 406 ; 0x321000
000000000018b7b8	ldr	q1, [x8, #0x200]
000000000018b7bc	mov	w8, #0xc5ac
000000000018b7c0	movk	w8, #0x3727, lsl #16
000000000018b7c4	fmov	s2, w8
000000000018b7c8	bl	__ZN6HGMath22IsEqualWithinToleranceE19__simd128_float32_tS0_f
000000000018b7cc	cbz	w0, 0x18b82c
000000000018b7d0	ldr	q0, [x20, #0x1d0]
000000000018b7d4	adrp	x8, 406 ; 0x321000
000000000018b7d8	ldr	q1, [x8, #0x9e0]
000000000018b7dc	mov	w8, #0xc5ac
000000000018b7e0	movk	w8, #0x3727, lsl #16
000000000018b7e4	fmov	s2, w8
000000000018b7e8	bl	__ZN6HGMath22IsEqualWithinToleranceE19__simd128_float32_tS0_f
000000000018b7ec	cbz	w0, 0x18b82c
000000000018b7f0	ldr	q0, [x20, #0x1e0]
000000000018b7f4	adrp	x8, 406 ; 0x321000
000000000018b7f8	ldr	q1, [x8, #0x140]
000000000018b7fc	mov	w8, #0xc5ac
000000000018b800	movk	w8, #0x3727, lsl #16
000000000018b804	fmov	s2, w8
000000000018b808	bl	__ZN6HGMath22IsEqualWithinToleranceE19__simd128_float32_tS0_f
000000000018b80c	tbz	w0, #0x0, 0x18b82c
000000000018b810	mov	x0, x19
000000000018b814	mov	x1, x20
000000000018b818	mov	w2, #0x0
000000000018b81c	ldp	x29, x30, [sp, #0x20]
000000000018b820	ldp	x20, x19, [sp, #0x10]
000000000018b824	ldp	x22, x21, [sp], #0x30
000000000018b828	b	__ZN10HGRenderer8GetInputEP6HGNodei
000000000018b82c	mov	x0, x19
000000000018b830	mov	x1, x20
000000000018b834	mov	w2, #0x0
000000000018b838	mov	w3, #0x0
000000000018b83c	bl	__ZN10HGRenderer11IsMergeableEP6HGNodeib
000000000018b840	cbz	w0, 0x18b9a0
000000000018b844	mov	x0, x19
000000000018b848	mov	x1, x20
000000000018b84c	mov	w2, #0x0
000000000018b850	bl	__ZN10HGRenderer8GetInputEP6HGNodei
000000000018b854	cbz	x0, 0x18b9a0
000000000018b858	mov	x21, x0
000000000018b85c	ldr	w8, [x0, #0xc]
000000000018b860	mov	w9, #0x6486
000000000018b864	movk	w9, #0xd425, lsl #16
000000000018b868	cmp	w8, w9
000000000018b86c	b.eq	0x18b8f4
000000000018b870	mov	w9, #0x6485
000000000018b874	movk	w9, #0xd425, lsl #16
000000000018b878	cmp	w8, w9
000000000018b87c	b.ne	0x18b9a0
000000000018b880	ldr	x22, [x20, #0x198]
000000000018b884	cbnz	x22, 0x18b8a8
000000000018b888	mov	w0, #0x1f0
000000000018b88c	bl	__ZN8HGObjectnwEm
000000000018b890	mov	x22, x0
000000000018b894	bl	__ZN13HGColorMatrixC1Ev
000000000018b898	str	x22, [x20, #0x198]
000000000018b89c	mov	w8, #0x6486
000000000018b8a0	movk	w8, #0xd425, lsl #16
000000000018b8a4	str	w8, [x22, #0xc]
000000000018b8a8	ldr	q0, [x21, #0x1b0]
000000000018b8ac	str	q0, [x22, #0x1b0]
000000000018b8b0	ldr	q0, [x21, #0x1c0]
000000000018b8b4	str	q0, [x22, #0x1c0]
000000000018b8b8	ldr	q0, [x21, #0x1d0]
000000000018b8bc	str	q0, [x22, #0x1d0]
000000000018b8c0	ldr	q0, [x21, #0x1e0]
000000000018b8c4	str	q0, [x22, #0x1e0]
000000000018b8c8	mov	x0, x19
000000000018b8cc	mov	x1, x21
000000000018b8d0	mov	w2, #0x0
000000000018b8d4	bl	__ZN10HGRenderer8GetInputEP6HGNodei
000000000018b8d8	mov	x2, x0
000000000018b8dc	ldr	x8, [x22]
000000000018b8e0	ldr	x8, [x8, #0x78]
000000000018b8e4	mov	x0, x22
000000000018b8e8	mov	w1, #0x0
000000000018b8ec	blr	x8
000000000018b8f0	mov	x21, x22
000000000018b8f4	ldp	q0, q1, [x20, #0x1b0]
000000000018b8f8	ldp	q2, q3, [x20, #0x1d0]
000000000018b8fc	ldp	q4, q5, [x21, #0x1b0]
000000000018b900	fmul.4s	v6, v0, v4[0]
000000000018b904	fmul.4s	v7, v1, v4[1]
000000000018b908	fadd.4s	v6, v6, v7
000000000018b90c	fmul.4s	v7, v2, v4[2]
000000000018b910	fadd.4s	v6, v7, v6
000000000018b914	fmul.4s	v4, v3, v4[3]
000000000018b918	fadd.4s	v4, v4, v6
000000000018b91c	fmul.4s	v6, v0, v5[0]
000000000018b920	fmul.4s	v7, v1, v5[1]
000000000018b924	fadd.4s	v6, v6, v7
000000000018b928	fmul.4s	v7, v2, v5[2]
000000000018b92c	fadd.4s	v6, v7, v6
000000000018b930	fmul.4s	v5, v3, v5[3]
000000000018b934	fadd.4s	v5, v5, v6
000000000018b938	stp	q4, q5, [x21, #0x1b0]
000000000018b93c	ldp	q4, q5, [x21, #0x1d0]
000000000018b940	fmul.4s	v6, v0, v4[0]
000000000018b944	fmul.4s	v7, v1, v4[1]
000000000018b948	fadd.4s	v6, v6, v7
000000000018b94c	fmul.4s	v7, v2, v4[2]
000000000018b950	fadd.4s	v6, v7, v6
000000000018b954	fmul.4s	v4, v3, v4[3]
000000000018b958	fadd.4s	v4, v4, v6
000000000018b95c	fmul.4s	v0, v0, v5[0]
000000000018b960	fmul.4s	v1, v1, v5[1]
000000000018b964	fadd.4s	v0, v0, v1
000000000018b968	fmul.4s	v1, v2, v5[2]
000000000018b96c	fadd.4s	v0, v1, v0
000000000018b970	fmul.4s	v1, v3, v5[3]
000000000018b974	fadd.4s	v0, v1, v0
000000000018b978	stp	q4, q0, [x21, #0x1d0]
000000000018b97c	mov	x0, x21
000000000018b980	mov	x1, x19
000000000018b984	bl	__ZN13HGColorMatrix18ParameterizeMatrixEP10HGRenderer
000000000018b988	mov	x20, x21
000000000018b98c	mov	x0, x20
000000000018b990	ldp	x29, x30, [sp, #0x20]
000000000018b994	ldp	x20, x19, [sp, #0x10]
000000000018b998	ldp	x22, x21, [sp], #0x30
000000000018b99c	ret
000000000018b9a0	ldr	x0, [x20, #0x198]
000000000018b9a4	cbz	x0, 0x18b9bc
000000000018b9a8	ldr	x8, [x0]
000000000018b9ac	ldr	x8, [x8, #0x78]
000000000018b9b0	mov	w1, #0x0
000000000018b9b4	mov	x2, #0x0
000000000018b9b8	blr	x8
000000000018b9bc	mov	x0, x20
000000000018b9c0	mov	x1, x19
000000000018b9c4	bl	__ZN13HGColorMatrix18ParameterizeMatrixEP10HGRenderer
000000000018b9c8	mov	x0, x20
000000000018b9cc	ldp	x29, x30, [sp, #0x20]
000000000018b9d0	ldp	x20, x19, [sp, #0x10]
000000000018b9d4	ldp	x22, x21, [sp], #0x30
000000000018b9d8	ret
000000000018b9dc	mov	x19, x0
000000000018b9e0	mov	x0, x22
000000000018b9e4	bl	__ZN8HGObjectdlEPv
000000000018b9e8	mov	x0, x19
000000000018b9ec	bl	0x319314 ; symbol stub for: __Unwind_Resume
```
