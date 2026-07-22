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

**Helium primitive(s) constructed:** `HGColorMatrix`. The primitive's math lives in the Helium framework binary; disassemble it with `otool -arch arm64 -tV "…/Helium.framework/Versions/A/Helium" | grep -A400 '<primitive>'`.

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
