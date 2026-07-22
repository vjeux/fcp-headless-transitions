# Neon

- **PAE class:** `Neon`
- **Plugin UUID:** `176021CD-2DFB-40FF-B3D4-9399F25C36C4`
- **Node names in corpus:** Neon (22), Glow (2)
- **Corpus usage:** 23 files, 24 instances

## What it does

Neon finds the edges in the image and lights them up like glowing neon tubing, adding a bright colored inner line and a softer outer glow around detected contours. Inner/Outer Glow set the two halo sizes, the Brightness enums pick their intensity tiers, and Edge Intensity controls how strongly edges are detected.

> **Note.** Not implemented; description is the standard Apple Motion "Neon" edge-glow filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Outer Brightness | enum(int) | 2 | 1 .. 2 | Intensity tier of the outer halo (1-2). |
| Outer Glow | float (pixels) | 45 | 1 .. 200 | Size of the outer glow halo, ~1-200 (default 45). |
| Inner Brightness | enum(int) | 2 | 1 .. 2 | Intensity tier of the inner glowing line (1-2). |
| Inner Glow | float (pixels) | 50 | 50 .. 65 | Size of the inner glow, ~50-65 (default 50). *(keyframed in 2 instances)* |
| Edge Intensity | float | 10 | 10 .. 15 | How strongly edges are detected/lit, ~10-15 (default 10). |
| Mix | float | 1 | 0.05 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGColorMatrix`, `HGHWMultiBlend`, `HGaussianBlur`.

### CPU render method — `-[PAENeon canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAENeon`

```asm
000000000000d65c	mov	w3, #0x1
000000000000d660	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d664	stur	xzr, [x29, #-0x70]
000000000000d668	ldr	x4, [x19]
000000000000d66c	sub	x2, x29, #0x70
000000000000d670	mov	x0, x24
000000000000d674	mov	w3, #0x3
000000000000d678	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d67c	stur	x25, [x29, #-0x78]
000000000000d680	ldr	x4, [x19]
000000000000d684	sub	x2, x29, #0x78
000000000000d688	mov	x0, x24
000000000000d68c	mov	w3, #0x2
000000000000d690	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d694	str	xzr, [sp, #0x80]
000000000000d698	ldr	x4, [x19]
000000000000d69c	add	x2, sp, #0x80
000000000000d6a0	mov	x0, x24
000000000000d6a4	mov	w3, #0x5
000000000000d6a8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d6ac	str	x25, [sp, #0x78]
000000000000d6b0	ldr	x4, [x19]
000000000000d6b4	add	x2, sp, #0x78
000000000000d6b8	mov	x0, x24
000000000000d6bc	mov	w3, #0x4
000000000000d6c0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000d6c4	ldr	x2, [x19]
000000000000d6c8	mov	x0, x22
000000000000d6cc	bl	"_objc_msgSend$getRenderMode:"
000000000000d6d0	mov	x19, x0
000000000000d6d4	mov	x0, x23
000000000000d6d8	bl	_objc_msgSend$imageType
000000000000d6dc	cmp	w19, #0x0
000000000000d6e0	ccmp	x0, #0x3, #0x0, ne
000000000000d6e4	cset	w19, eq
000000000000d6e8	b.ne	0xd9b8
000000000000d6ec	cbz	x23, 0xd700
000000000000d6f0	add	x8, sp, #0x70
000000000000d6f4	mov	x0, x23
000000000000d6f8	bl	_objc_msgSend$heliumRef
000000000000d6fc	b	0xd704
000000000000d700	str	xzr, [sp, #0x70]
000000000000d704	add	x8, sp, #0x60
000000000000d708	mov	x0, x22
000000000000d70c	mov	x2, x23
000000000000d710	bl	"_objc_msgSend$getScaleForImage:"
000000000000d714	ldur	d8, [x29, #-0x68]
000000000000d718	ldr	x0, [sp, #0x70]
000000000000d71c	str	x0, [sp, #0x50]
000000000000d720	cbz	x0, 0xd730
000000000000d724	ldr	x8, [x0]
000000000000d728	ldr	x8, [x8, #0x10]
000000000000d72c	blr	x8
000000000000d730	add	x8, sp, #0x58
000000000000d734	add	x2, sp, #0x50
000000000000d738	mov	x0, x22
000000000000d73c	mov.16b	v0, v8
000000000000d740	bl	"_objc_msgSend$brightnessNodeWithValue:inputNode:"
000000000000d744	ldr	x0, [sp, #0x50]
000000000000d748	cbz	x0, 0xd758
000000000000d74c	ldr	x8, [x0]
000000000000d750	ldr	x8, [x8, #0x18]
000000000000d754	blr	x8
000000000000d758	ldur	d8, [x29, #-0x70]
000000000000d75c	ldp	d9, d10, [sp, #0x60]
000000000000d760	ldr	x0, [sp, #0x70]
000000000000d764	str	x0, [sp, #0x40]
000000000000d768	cbz	x0, 0xd778
000000000000d76c	ldr	x8, [x0]
000000000000d770	ldr	x8, [x8, #0x10]
000000000000d774	blr	x8
000000000000d778	add	x8, sp, #0x48
000000000000d77c	add	x2, sp, #0x40
000000000000d780	mov	x0, x22
000000000000d784	mov.16b	v0, v8
000000000000d788	mov.16b	v1, v9
000000000000d78c	mov.16b	v2, v10
000000000000d790	bl	"_objc_msgSend$blurNodeWithRadius:xScale:yScale:inputNode:"
000000000000d794	ldr	x0, [sp, #0x40]
000000000000d798	cbz	x0, 0xd7a8
000000000000d79c	ldr	x8, [x0]
000000000000d7a0	ldr	x8, [x8, #0x18]
000000000000d7a4	blr	x8
000000000000d7a8	ldur	d8, [x29, #-0x78]
000000000000d7ac	ldr	x0, [sp, #0x48]
000000000000d7b0	str	x0, [sp, #0x30]
000000000000d7b4	cbz	x0, 0xd7c4
000000000000d7b8	ldr	x8, [x0]
000000000000d7bc	ldr	x8, [x8, #0x10]
000000000000d7c0	blr	x8
000000000000d7c4	add	x8, sp, #0x38
000000000000d7c8	add	x2, sp, #0x30
000000000000d7cc	mov	x0, x22
000000000000d7d0	mov.16b	v0, v8
000000000000d7d4	bl	"_objc_msgSend$brightnessNodeWithValue:inputNode:"
000000000000d7d8	ldr	x0, [sp, #0x30]
000000000000d7dc	cbz	x0, 0xd7ec
000000000000d7e0	ldr	x8, [x0]
000000000000d7e4	ldr	x8, [x8, #0x18]
000000000000d7e8	blr	x8
000000000000d7ec	ldr	d8, [sp, #0x80]
000000000000d7f0	ldp	d9, d10, [sp, #0x60]
000000000000d7f4	ldr	x0, [sp, #0x70]
000000000000d7f8	str	x0, [sp, #0x20]
000000000000d7fc	cbz	x0, 0xd80c
000000000000d800	ldr	x8, [x0]
000000000000d804	ldr	x8, [x8, #0x10]
000000000000d808	blr	x8
000000000000d80c	add	x8, sp, #0x28
000000000000d810	add	x2, sp, #0x20
000000000000d814	mov	x0, x22
000000000000d818	mov.16b	v0, v8
000000000000d81c	mov.16b	v1, v9
000000000000d820	mov.16b	v2, v10
000000000000d824	bl	"_objc_msgSend$blurNodeWithRadius:xScale:yScale:inputNode:"
000000000000d828	ldr	x0, [sp, #0x20]
000000000000d82c	cbz	x0, 0xd83c
000000000000d830	ldr	x8, [x0]
000000000000d834	ldr	x8, [x8, #0x18]
000000000000d838	blr	x8
000000000000d83c	ldr	d8, [sp, #0x78]
000000000000d840	ldr	x0, [sp, #0x28]
000000000000d844	str	x0, [sp, #0x10]
000000000000d848	cbz	x0, 0xd858
000000000000d84c	ldr	x8, [x0]
000000000000d850	ldr	x8, [x8, #0x10]
000000000000d854	blr	x8
000000000000d858	add	x8, sp, #0x18
000000000000d85c	add	x2, sp, #0x10
000000000000d860	mov	x0, x22
000000000000d864	mov.16b	v0, v8
000000000000d868	bl	"_objc_msgSend$brightnessNodeWithValue:inputNode:"
000000000000d86c	ldr	x0, [sp, #0x10]
000000000000d870	cbz	x0, 0xd880
000000000000d874	ldr	x8, [x0]
000000000000d878	ldr	x8, [x8, #0x18]
000000000000d87c	blr	x8
000000000000d880	mov	w0, #0x280
000000000000d884	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000000d888	mov	x22, x0
000000000000d88c	bl	0x25124c ; symbol stub for: __ZN14HGHWMultiBlendC1Ev
000000000000d890	ldr	x2, [sp, #0x58]
000000000000d894	ldr	x8, [x22]
000000000000d898	ldr	x8, [x8, #0x78]
000000000000d89c	mov	x0, x22
000000000000d8a0	mov	w1, #0x0
000000000000d8a4	blr	x8
000000000000d8a8	ldr	x8, [x22]
000000000000d8ac	ldr	x8, [x8, #0x78]
000000000000d8b0	cmp	w21, #0x4
000000000000d8b4	b.lo	0xd8d0
000000000000d8b8	ldr	x2, [sp, #0x18]
000000000000d8bc	mov	x0, x22
000000000000d8c0	mov	w1, #0x1
000000000000d8c4	blr	x8
000000000000d8c8	add	x8, sp, #0x38
000000000000d8cc	b	0xd8e4
000000000000d8d0	ldr	x2, [sp, #0x38]
000000000000d8d4	mov	x0, x22
000000000000d8d8	mov	w1, #0x1
000000000000d8dc	blr	x8
000000000000d8e0	add	x8, sp, #0x18
000000000000d8e4	ldr	x2, [x8]
000000000000d8e8	ldr	x8, [x22]
000000000000d8ec	ldr	x8, [x8, #0x78]
000000000000d8f0	mov	x0, x22
000000000000d8f4	mov	w1, #0x2
000000000000d8f8	blr	x8
000000000000d8fc	str	x22, [sp, #0x8]
000000000000d900	ldr	x8, [x22]
000000000000d904	ldr	x8, [x8, #0x10]
000000000000d908	mov	x0, x22
000000000000d90c	blr	x8
000000000000d910	add	x2, sp, #0x8
000000000000d914	mov	x0, x20
000000000000d918	bl	"_objc_msgSend$setHeliumRef:"
000000000000d91c	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm1 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm3 (float)
    - parm2 (float)
    - parm5 (float)
    - parm4 (float)

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
