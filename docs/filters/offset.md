# Offset

- **PAE class:** `Offset`
- **Plugin UUID:** `D6245DC0-5D17-4847-ABB0-C4D01C3FA3F7`
- **Node names in corpus:** Offset (347), Offset copy (13), Offset 1 (3), Offset 2 (3), Ofst (1), Offset H (1)
- **Corpus usage:** 228 files, 374 instances

## What it does

Offset scrolls the image by a horizontal and vertical pixel amount, wrapping it around the frame edges (a torus roll). It is the simplest positional filter, used to slide or wrap content for scrolling backgrounds and roll transitions.

> **Note.** Not implemented in the TS engine and no checked-in shader; described as the standard Motion "Offset" scroll/wrap. Whether the shipping filter wraps or clamps at the edge is unverified here (the wide negative observed range suggests large scrolls).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Horizontal Offset | float (pixels) | 0 | -4945 .. 1000 | Pixels to shift the image on X. Negative = left, positive = right. Content wraps around. Heavily keyframed for scrolls. *(keyframed in 65 instances)* |
| Vertical Offset | float (pixels) | 0 | -169 .. 1000 | Pixels to shift the image on Y. Negative = up, positive = down. Content wraps around. *(keyframed in 74 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the offset result over the original, 0-1 continuous. *(keyframed in 7 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

### CPU render method — `-[PAEOffset canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEOffset`

```asm
0000000000080534	mov	w3, #0x1
0000000000080538	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000008053c	ldr	x4, [x23]
0000000000080540	sub	x2, x29, #0x60
0000000000080544	mov	x0, x19
0000000000080548	mov	w3, #0x2
000000000008054c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000080550	cbz	x20, 0x80564
0000000000080554	sub	x8, x29, #0xb0
0000000000080558	mov	x0, x20
000000000008055c	bl	_objc_msgSend$imageInfo
0000000000080560	b	0x80574
0000000000080564	stur	xzr, [x29, #-0x70]
0000000000080568	movi.2d	v0, #0000000000000000
000000000008056c	stp	q0, q0, [x29, #-0x90]
0000000000080570	stp	q0, q0, [x29, #-0xb0]
0000000000080574	add	x8, sp, #0xc0
0000000000080578	mov	x0, x22
000000000008057c	mov	x2, x21
0000000000080580	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000080584	add	x8, sp, #0x40
0000000000080588	mov	x0, x22
000000000008058c	mov	x2, x21
0000000000080590	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000080594	ldur	x8, [x29, #-0x88]
0000000000080598	ldur	d0, [x29, #-0x60]
000000000008059c	fneg	d1, d0
00000000000805a0	cmp	x8, #0x0
00000000000805a4	fcsel	d0, d0, d1, eq
00000000000805a8	ldur	d1, [x29, #-0x58]
00000000000805ac	mov	x8, #0x4059000000000000
00000000000805b0	fmov	d2, x8
00000000000805b4	fdiv	d1, d1, d2
00000000000805b8	fdiv	d0, d0, d2
00000000000805bc	frintm	d2, d1
00000000000805c0	fsub	d3, d1, d2
00000000000805c4	frintm	d1, d0
00000000000805c8	fsub	d0, d0, d1
00000000000805cc	stp	d0, d3, [x29, #-0x60]
00000000000805d0	ldr	x2, [x23]
00000000000805d4	mov	x0, x22
00000000000805d8	bl	"_objc_msgSend$getRenderMode:"
00000000000805dc	cbz	w0, 0x806e4
00000000000805e0	mov	x0, x21
00000000000805e4	bl	_objc_msgSend$imageType
00000000000805e8	cmp	x0, #0x3
00000000000805ec	b.ne	0x806e4
00000000000805f0	cbz	x21, 0x80604
00000000000805f4	add	x8, sp, #0x38
00000000000805f8	mov	x0, x21
00000000000805fc	bl	_objc_msgSend$heliumRef
0000000000080600	b	0x80608
0000000000080604	str	xzr, [sp, #0x38]
0000000000080608	add	x8, sp, #0x20
000000000008060c	mov	x0, x22
0000000000080610	mov	x2, x21
0000000000080614	bl	"_objc_msgSend$getScaleForImage:"
0000000000080618	ldr	x0, [sp, #0x38]
000000000008061c	str	x0, [sp, #0x10]
0000000000080620	cbz	x0, 0x80630
0000000000080624	ldr	x8, [x0]
0000000000080628	ldr	x8, [x8, #0x10]
000000000008062c	blr	x8
0000000000080630	ldur	d8, [x29, #-0x58]
0000000000080634	mov	x0, x21
0000000000080638	bl	_objc_msgSend$width
000000000008063c	mov	x23, x0
0000000000080640	ldr	d9, [sp, #0x20]
0000000000080644	ldur	d10, [x29, #-0x60]
0000000000080648	mov	x0, x21
000000000008064c	bl	_objc_msgSend$height
0000000000080650	ucvtf	d0, x23
0000000000080654	fmul	d0, d8, d0
0000000000080658	ucvtf	d1, x0
000000000008065c	fmul	d0, d0, d9
0000000000080660	fmul	d1, d10, d1
0000000000080664	ldr	d2, [sp, #0x28]
0000000000080668	ldr	q3, [sp, #0x20]
000000000008066c	fmul	d1, d1, d2
0000000000080670	str	q3, [sp]
0000000000080674	add	x8, sp, #0x18
0000000000080678	add	x2, sp, #0x10
000000000008067c	movi.2d	v2, #0000000000000000
0000000000080680	fmov	d3, #1.00000000
0000000000080684	fmov	d4, #1.00000000
0000000000080688	mov	x3, sp
000000000008068c	movi.2d	v5, #0000000000000000
0000000000080690	mov	x0, x22
0000000000080694	mov	x4, x21
0000000000080698	bl	"_objc_msgSend$transformAndTile:withXValue:YValue:skew:scale:stretch:rotation:resolution:inputImage:"
000000000008069c	ldr	x0, [sp, #0x10]
00000000000806a0	cbz	x0, 0x806b0
00000000000806a4	ldr	x8, [x0]
00000000000806a8	ldr	x8, [x8, #0x18]
00000000000806ac	blr	x8
00000000000806b0	add	x2, sp, #0x18
00000000000806b4	mov	x0, x20
00000000000806b8	bl	"_objc_msgSend$setHeliumRef:"
00000000000806bc	ldr	x0, [sp, #0x18]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)

```
