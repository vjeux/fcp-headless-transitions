# Brightness

- **PAE class:** `Brightness`
- **Plugin UUID:** `2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6`
- **Node names in corpus:** Brightness (513), Brightness copy (55), Brightness copy 15 (3), Brightness copy 19 (2), Brightness copy 21 (2), Brightness copy 20 (1)
- **Corpus usage:** 259 files, 586 instances

## What it does

Brightness applies a simple per-channel brightness scale/offset to the image (in this engine it maps onto the Levels path; PAEBrightness has no dedicated shader and does an additive/multiplicative lift of RGB with alpha preserved). It is the plain "make it brighter/darker" knob, frequently keyframed to flash or fade a layer.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Brightness | float | 1 | 0 .. 54.04 | Brightness amount. Default 1 (identity). Values above 1 brighten, below 1 darken; a very wide range (up to ~54) is observed for blown-out flash effects. *(keyframed in 222 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the brightened result over the original, 0-1 continuous. *(keyframed in 33 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/levels.ts`](../../engine/src/compositor/filters/levels.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGColorMatrix`.

### CPU render method — `-[PAEBrightness canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBrightness`

```asm
00000000000fce1c	mov	w3, #0x1
00000000000fce20	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fce24	ldr	x2, [x19]
00000000000fce28	mov	x0, x22
00000000000fce2c	bl	"_objc_msgSend$getRenderMode:"
00000000000fce30	mov	x19, x0
00000000000fce34	mov	x0, x21
00000000000fce38	bl	_objc_msgSend$imageType
00000000000fce3c	cmp	w19, #0x0
00000000000fce40	ccmp	x0, #0x3, #0x0, ne
00000000000fce44	cset	w19, eq
00000000000fce48	b.ne	0xfcf68
00000000000fce4c	cbz	x21, 0xfce68
00000000000fce50	add	x8, sp, #0x10
00000000000fce54	mov	x0, x21
00000000000fce58	bl	_objc_msgSend$heliumRef
00000000000fce5c	b	0xfce6c
00000000000fce60	mov	w19, #0x0
00000000000fce64	b	0xfcf68
00000000000fce68	str	xzr, [sp, #0x10]
00000000000fce6c	mov	w0, #0x1f0
00000000000fce70	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000fce74	mov	x21, x0
00000000000fce78	bl	0x2510fc ; symbol stub for: __ZN13HGColorMatrixC1Ev
00000000000fce7c	str	x21, [sp, #0x8]
00000000000fce80	ldr	d0, [sp, #0x18]
00000000000fce84	fcvt	s0, d0
00000000000fce88	ldr	x8, [x21]
00000000000fce8c	ldr	x8, [x8, #0x60]
00000000000fce90	movi.2d	v1, #0000000000000000
00000000000fce94	movi.2d	v2, #0000000000000000
00000000000fce98	movi.2d	v3, #0000000000000000
00000000000fce9c	mov	x0, x21
00000000000fcea0	mov	w1, #0x0
00000000000fcea4	blr	x8
00000000000fcea8	ldr	d0, [sp, #0x18]
00000000000fceac	fcvt	s1, d0
00000000000fceb0	ldr	x8, [x21]
00000000000fceb4	ldr	x8, [x8, #0x60]
00000000000fceb8	movi.2d	v0, #0000000000000000
00000000000fcebc	movi.2d	v2, #0000000000000000
00000000000fcec0	movi.2d	v3, #0000000000000000
00000000000fcec4	mov	x0, x21
00000000000fcec8	mov	w1, #0x1
00000000000fcecc	blr	x8
00000000000fced0	ldr	d0, [sp, #0x18]
00000000000fced4	fcvt	s2, d0
00000000000fced8	ldr	x8, [x21]
00000000000fcedc	ldr	x8, [x8, #0x60]
00000000000fcee0	movi.2d	v0, #0000000000000000
00000000000fcee4	movi.2d	v1, #0000000000000000
00000000000fcee8	movi.2d	v3, #0000000000000000
00000000000fceec	mov	x0, x21
00000000000fcef0	mov	w1, #0x2
00000000000fcef4	blr	x8
00000000000fcef8	ldr	x8, [x21]
00000000000fcefc	ldr	x8, [x8, #0x60]
00000000000fcf00	movi.2d	v0, #0000000000000000
00000000000fcf04	movi.2d	v1, #0000000000000000
00000000000fcf08	movi.2d	v2, #0000000000000000
00000000000fcf0c	fmov	s3, #1.00000000
00000000000fcf10	mov	x0, x21
00000000000fcf14	mov	w1, #0x3
00000000000fcf18	blr	x8
00000000000fcf1c	ldr	x2, [sp, #0x10]
00000000000fcf20	ldr	x8, [x21]
00000000000fcf24	ldr	x8, [x8, #0x78]
00000000000fcf28	mov	x0, x21
00000000000fcf2c	mov	w1, #0x0
00000000000fcf30	blr	x8
00000000000fcf34	add	x2, sp, #0x8
00000000000fcf38	mov	x0, x20
00000000000fcf3c	bl	"_objc_msgSend$setHeliumRef:"
00000000000fcf40	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm1 (float)
    slot 1  <-  parm1 (float)
    slot 2  <-  parm1 (float)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
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
