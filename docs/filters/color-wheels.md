# Color Wheels

- **PAE class:** `Color Wheels`
- **Plugin UUID:** `52A68C6D-B49C-41AA-B3EA-03945D0C8EB4`
- **Node names in corpus:** Color Wheels (14), Color Wheels copy (1)
- **Corpus usage:** 4 files, 15 instances

## What it does

Color Wheels is FCP's primary color-grading control: independent Master/Shadows/Midtones/Highlights color wheels each set color balance, saturation, and brightness for that tonal range, plus Temperature/Tint white-balance controls. It is a full grade panel rather than a single-purpose image filter.

> **Note.** Not implemented; description is the standard FCP "Color Wheels" grading control. Tint/Hue sub-knobs live inside the wheel groups.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Master | group | - | - | Overall color balance / saturation / brightness wheel. |
| Shadows | group | - | - | Color wheel affecting the dark tones. |
| Midtones | group | - | - | Color wheel affecting the mid tones. |
| Highlights | group | - | - | Color wheel affecting the bright tones. |
| Temperature | float (Kelvin) | 5000 | 4984 .. 5000 | White-balance temperature, ~4984-5000K (default 5000). |
| Preserve Luma | bool | 1 | 1 .. 1 | Keep luminance constant while shifting color. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |
| Tint | bool | 0 | 0 .. 0 | *(unverified)* |
| Hue | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGColorMatrix`.

### CPU render method — `-[PAECorrectorEffect overrideRender:withOutputImage:inputImage:input:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAECorrectorEffect`

```asm
00000000000c02ec	mov	x20, x0
00000000000c02f0	bl	0x2510fc ; symbol stub for: __ZN13HGColorMatrixC1Ev
00000000000c02f4	adrp	x8, 926 ; 0x45e000
00000000000c02f8	ldrsw	x8, [x8, #0xc80]
00000000000c02fc	ldr	w8, [x26, x8]
00000000000c0300	cmp	w8, #0x1
00000000000c0304	b.le	0xc0310
00000000000c0308	mov	w21, #0x1
00000000000c030c	b	0xc0330
00000000000c0310	adrp	x8, 936 ; 0x468000
00000000000c0314	ldr	x8, [x8, #0x268]
00000000000c0318	cmn	x8, #0x1
00000000000c031c	b.ne	0xc075c
00000000000c0320	adrp	x8, 936 ; 0x468000
00000000000c0324	ldr	w8, [x8, #0x260]
00000000000c0328	cmp	w8, #0x0
00000000000c032c	cset	w21, ne
00000000000c0330	mov	x0, x26
00000000000c0334	bl	0x252314 ; symbol stub for: _objc_opt_class
00000000000c0338	mov	x2, x25
00000000000c033c	bl	"_objc_msgSend$colorPrimaries:"
00000000000c0340	cmp	x0, #0x1
00000000000c0344	csinc	w8, w21, wzr, ne
00000000000c0348	mov	w9, #0x1
00000000000c034c	mov	w10, #0x2
00000000000c0350	cmp	w8, #0x0
00000000000c0354	csel	w8, w10, wzr, ne
00000000000c0358	cinc	w23, w9, ne
00000000000c035c	cmp	w21, #0x0
00000000000c0360	csinc	w21, w8, wzr, eq
00000000000c0364	mov	x0, x22
00000000000c0368	mov	x1, x23
00000000000c036c	mov	x2, x23
00000000000c0370	mov	x3, x21
00000000000c0374	mov	w4, #0x1
00000000000c0378	mov	w5, #0x0
00000000000c037c	bl	0x250c64 ; symbol stub for: _PAECreateGammaEncodingNode
00000000000c0380	mov	x22, x0
00000000000c0384	mov	x0, x26
00000000000c0388	bl	_objc_msgSend$newNodeForCorrector
00000000000c038c	mov	x24, x0
00000000000c0390	cbz	x0, 0xc04d4
00000000000c0394	ldr	x8, [x27]
00000000000c0398	adrp	x9, 712 ; 0x388000
00000000000c039c	ldr	x9, [x9, #0x488] ; literal pool symbol address: _kCMTimeZero
00000000000c03a0	cmp	x8, #0x0
00000000000c03a4	csel	x8, x9, x8, eq
00000000000c03a8	ldr	q0, [x8]
00000000000c03ac	stur	q0, [x29, #-0x70]
00000000000c03b0	ldr	x8, [x8, #0x10]
00000000000c03b4	stur	x8, [x29, #-0x60]
00000000000c03b8	str	q0, [sp, #0x10]
00000000000c03bc	str	x8, [sp, #0x20]
00000000000c03c0	add	x4, sp, #0x10
00000000000c03c4	mov	x0, x26
00000000000c03c8	mov	x2, x25
00000000000c03cc	mov	x3, x24
00000000000c03d0	bl	"_objc_msgSend$setParameters:onNodeCorrector:time:"
00000000000c03d4	ldr	x8, [x24]
00000000000c03d8	ldr	x8, [x8, #0x78]
00000000000c03dc	mov	x0, x24
00000000000c03e0	mov	w1, #0x0
00000000000c03e4	mov	x2, x22
00000000000c03e8	blr	x8
00000000000c03ec	mov	x0, x24
00000000000c03f0	mov	x1, x23
00000000000c03f4	mov	x2, x23
00000000000c03f8	mov	x3, x21
00000000000c03fc	mov	w4, #0x0
00000000000c0400	mov	w5, #0x1
00000000000c0404	bl	0x250c58 ; symbol stub for: _PAECreateGammaDecodingNode
00000000000c0408	mov	x23, x0
00000000000c040c	ldr	x4, [x27]
00000000000c0410	add	x2, sp, #0x78
00000000000c0414	mov	x0, x28
00000000000c0418	mov	w3, #0x22ba
00000000000c041c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c0420	cbz	w0, 0xc04cc
00000000000c0424	ldr	x4, [x27]
00000000000c0428	add	x2, sp, #0x70
00000000000c042c	mov	x0, x28
00000000000c0430	mov	w3, #0x22bb
00000000000c0434	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c0438	cbz	w0, 0xc04cc
00000000000c043c	ldp	d0, d2, [sp, #0x70]
00000000000c0440	adrp	x8, 426 ; 0x26a000
00000000000c0444	ldr	d1, [x8, #0xb48]
00000000000c0448	fcmp	d2, d1
00000000000c044c	b.ne	0xc0530
00000000000c0450	fcmp	d0, #0.0
00000000000c0454	b.ne	0xc0530
00000000000c0458	ldp	q0, q1, [x27]
00000000000c045c	stp	q0, q1, [sp, #0x10]
00000000000c0460	ldr	q0, [x27, #0x20]
00000000000c0464	str	q0, [sp, #0x30]
00000000000c0468	add	x4, sp, #0x10
00000000000c046c	mov	x0, x26
00000000000c0470	mov	x2, x25
00000000000c0474	mov	x3, x23
00000000000c0478	bl	"_objc_msgSend$_hueNode:withInput:renderInfo:"
00000000000c047c	mov	x21, x0
00000000000c0480	cbz	x0, 0xc06a4
00000000000c0484	ldr	x8, [x21]
00000000000c0488	ldr	x8, [x8, #0x10]
00000000000c048c	mov	x0, x21
00000000000c0490	blr	x8
00000000000c0494	str	x21, [sp, #0x10]
00000000000c0498	add	x2, sp, #0x10
00000000000c049c	ldr	x0, [sp, #0x8]
00000000000c04a0	bl	"_objc_msgSend$setHeliumRef:"
00000000000c04a4	ldr	x0, [sp, #0x10]
00000000000c04a8	cbz	x0, 0xc04b8
00000000000c04ac	ldr	x8, [x0]
00000000000c04b0	ldr	x8, [x8, #0x18]
00000000000c04b4	blr	x8
00000000000c04b8	ldr	x8, [x21]
00000000000c04bc	ldr	x8, [x8, #0x18]
00000000000c04c0	mov	x0, x21
00000000000c04c4	blr	x8
00000000000c04c8	b	0xc06a0
00000000000c04cc	mov	w21, #0x0
00000000000c04d0	b	0xc06a4
00000000000c04d4	mov	x0, x22
00000000000c04d8	mov	x1, x23
00000000000c04dc	mov	x2, x23
00000000000c04e0	mov	x3, x21
00000000000c04e4	mov	w4, #0x0
00000000000c04e8	mov	w5, #0x1
00000000000c04ec	bl	0x250c58 ; symbol stub for: _PAECreateGammaDecodingNode
00000000000c04f0	mov	x23, x0
00000000000c04f4	cbz	x0, 0xc0508
00000000000c04f8	ldr	x8, [x23]
00000000000c04fc	ldr	x8, [x8, #0x10]
00000000000c0500	mov	x0, x23
00000000000c0504	blr	x8
00000000000c0508	str	x23, [sp, #0x10]
00000000000c050c	add	x2, sp, #0x10
00000000000c0510	ldr	x0, [sp, #0x8]
00000000000c0514	bl	"_objc_msgSend$setHeliumRef:"
00000000000c0518	ldr	x0, [sp, #0x10]
00000000000c051c	cbz	x0, 0xc06f0
00000000000c0520	ldr	x8, [x0]
00000000000c0524	ldr	x8, [x8, #0x18]
00000000000c0528	blr	x8
00000000000c052c	b	0xc06f0
00000000000c0530	adrp	x8, 426 ; 0x26a000
00000000000c0534	ldr	d3, [x8, #0xb58]
00000000000c0538	fadd	d3, d2, d3
00000000000c053c	fcmp	d2, d1
00000000000c0540	mov	w8, #0x8
00000000000c0544	csel	x8, x8, xzr, gt
00000000000c0548	adrp	x9, 426 ; 0x26a000
00000000000c054c	add	x9, x9, #0xba0
00000000000c0550	ldr	d2, [x9, x8]
00000000000c0554	fmul	d2, d3, d2
00000000000c0558	fadd	d1, d2, d1
00000000000c055c	str	d1, [sp, #0x78]
00000000000c0560	fcvt	s1, d1
00000000000c0564	fcvt	s0, d0
00000000000c0568	stp	s1, s0, [sp, #0x68]
00000000000c056c	add	x0, sp, #0x44
00000000000c0570	bl	0x251d5c ; symbol stub for: __ZN9cc_matrix8identityEv
00000000000c0574	add	x0, sp, #0x68
00000000000c0578	add	x1, sp, #0x44
00000000000c057c	bl	0x2524a0 ; symbol stub for: _temptint_to_matrix
00000000000c0580	ldr	x8, [x20]
00000000000c0584	ldr	x8, [x8, #0x78]
00000000000c0588	mov	x0, x20
00000000000c058c	mov	w1, #0x0
00000000000c0590	mov	x2, x23
00000000000c0594	blr	x8
00000000000c0598	ldp	s0, s1, [sp, #0x44]
00000000000c059c	ldr	s2, [sp, #0x4c]
00000000000c05a0	ldr	x8, [x20]
00000000000c05a4	ldr	x8, [x8, #0x60]
00000000000c05a8	movi.2d	v3, #0000000000000000
00000000000c05ac	mov	x0, x20
00000000000c05b0	mov	w1, #0x0
00000000000c05b4	blr	x8
00000000000c05b8	ldp	s0, s1, [sp, #0x50]
00000000000c05bc	ldr	s2, [sp, #0x58]
00000000000c05c0	ldr	x8, [x20]
00000000000c05c4	ldr	x8, [x8, #0x60]
00000000000c05c8	movi.2d	v3, #0000000000000000
00000000000c05cc	mov	x0, x20
00000000000c05d0	mov	w1, #0x1
00000000000c05d4	blr	x8
00000000000c05d8	ldp	s0, s1, [sp, #0x5c]
00000000000c05dc	ldr	s2, [sp, #0x64]
00000000000c05e0	ldr	x8, [x20]
00000000000c05e4	ldr	x8, [x8, #0x60]
00000000000c05e8	movi.2d	v3, #0000000000000000
00000000000c05ec	mov	x0, x20
00000000000c05f0	mov	w1, #0x2
00000000000c05f4	blr	x8
00000000000c05f8	ldp	q0, q1, [x27]
00000000000c05fc	stp	q0, q1, [sp, #0x10]
00000000000c0600	ldr	q0, [x27, #0x20]
00000000000c0604	str	q0, [sp, #0x30]
00000000000c0608	add	x4, sp, #0x10
00000000000c060c	mov	x0, x26
00000000000c0610	mov	x2, x25
00000000000c0614	mov	x3, x20
00000000000c0618	bl	"_objc_msgSend$_hueNode:withInput:renderInfo:"
00000000000c061c	mov	x21, x0
00000000000c0620	cbz	x0, 0xc066c
00000000000c0624	ldr	x8, [x21]
00000000000c0628	ldr	x8, [x8, #0x10]
00000000000c062c	mov	x0, x21
00000000000c0630	blr	x8
00000000000c0634	str	x21, [sp, #0x10]
00000000000c0638	add	x2, sp, #0x10
00000000000c063c	ldr	x0, [sp, #0x8]
00000000000c0640	bl	"_objc_msgSend$setHeliumRef:"
00000000000c0644	ldr	x0, [sp, #0x10]
00000000000c0648	cbz	x0, 0xc0658
00000000000c064c	ldr	x8, [x0]
00000000000c0650	ldr	x8, [x8, #0x18]
00000000000c0654	blr	x8
00000000000c0658	ldr	x8, [x21]
00000000000c065c	ldr	x8, [x8, #0x18]
00000000000c0660	mov	x0, x21
00000000000c0664	blr	x8
00000000000c0668	b	0xc06a0
00000000000c066c	str	x20, [sp, #0x10]
00000000000c0670	ldr	x8, [x20]
00000000000c0674	ldr	x8, [x8, #0x10]
00000000000c0678	mov	x0, x20
00000000000c067c	blr	x8
00000000000c0680	add	x2, sp, #0x10
00000000000c0684	ldr	x0, [sp, #0x8]
00000000000c0688	bl	"_objc_msgSend$setHeliumRef:"
00000000000c068c	ldr	x0, [sp, #0x10]
00000000000c0690	cbz	x0, 0xc06a0
00000000000c0694	ldr	x8, [x0]
00000000000c0698	ldr	x8, [x8, #0x18]
00000000000c069c	blr	x8
00000000000c06a0	mov	w21, #0x1
00000000000c06a4	ldr	x8, [x24]
00000000000c06a8	ldr	x8, [x8, #0x18]
00000000000c06ac	mov	x0, x24
00000000000c06b0	blr	x8
00000000000c06b4	tbnz	w21, #0x0, 0xc06f0
00000000000c06b8	cbz	x23, 0xc06cc
00000000000c06bc	ldr	x8, [x23]
00000000000c06c0	ldr	x8, [x8, #0x10]
00000000000c06c4	mov	x0, x23
00000000000c06c8	blr	x8
00000000000c06cc	str	x23, [sp, #0x10]
00000000000c06d0	add	x2, sp, #0x10
00000000000c06d4	ldr	x0, [sp, #0x8]
00000000000c06d8	bl	"_objc_msgSend$setHeliumRef:"
00000000000c06dc	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm8888 : CustomParameter
    parm8893 : CustomParameter
    parm8889 : PopupMenu
    parm8890 : FloatSlider
    parm8891 : FloatSlider
    parm8892 : AngleSlider
    parm8894 : ToggleButton
    parm9321 : CustomParameter
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm8890 (float)
    - parm8891 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm8891 (float)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
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
