# Earthquake

- **PAE class:** `Earthquake`
- **Plugin UUID:** `DEB7CD03-0C92-416A-B42A-656FB37530A1`
- **Node names in corpus:** Earthquake (122), Earthquake copy (2), Earthquake 3 (2), Earthquake 2 (2), Earthquake 1 (2), OSC 03 (2)
- **Corpus usage:** 128 files, 145 instances

## What it does

Earthquake shakes and twists the frame with a per-frame pseudo-random rigid transform: a small rotation about an Epicenter plus horizontal/vertical translation, optionally composited across several jittered Layers for a blurred multi-exposure shake. Amplitudes are deterministic functions of Twist/Shake and a seeded RNG. Implemented and RE'd (twist is +/- Twist*0.1 radians, shakes are +/- amount*25 pixels).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Twist | float (radians scale) | 0.1 | 0 .. 0.43 | Rotational shake amplitude. Per-frame rotation is +/- Twist*0.1 radians about the epicenter. 0 = no rotation. *(keyframed in 74 instances)* |
| Horizontal Shake | float (pixels scale) | 0.1 | 0 .. 1 | Horizontal translation amplitude. Per-frame shift is +/- Shake*25 pixels. Keyframed. *(keyframed in 74 instances)* |
| Vertical Shake | float (pixels scale) | 0.1 | 0 .. 1 | Vertical translation amplitude. Per-frame shift is +/- Shake*25 pixels. Keyframed. *(keyframed in 74 instances)* |
| Layers | enum(int) | 1 | 1 .. 5 | Number of jittered copies blended together, 1-8. >1 blurs the shake into a multi-exposure smear. |
| Epicenter | point2D | - | - | Center of the rotational shake (X,Y) in normalized frame coordinates. |
| Random Seed | float (int seed) | 0 | 0 .. 1000 | Seed for the shake RNG; changing it reshuffles the jitter pattern. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the shaken result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/earthquake.ts`](../../engine/src/compositor/filters/earthquake.ts).

> 5 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 8 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGTransform`, `HGXForm`.

### CPU render method — `-[PAEEarthquake canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEEarthquake`

```asm
00000000000580d8	mov	w3, #0x1
00000000000580dc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000580e0	ldr	x4, [x22]
00000000000580e4	sub	x2, x29, #0x40
00000000000580e8	mov	x0, x23
00000000000580ec	mov	w3, #0x2
00000000000580f0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000580f4	ldr	x4, [x22]
00000000000580f8	sub	x2, x29, #0x48
00000000000580fc	mov	x0, x23
0000000000058100	mov	w3, #0x3
0000000000058104	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000058108	ldr	x4, [x22]
000000000005810c	sub	x2, x29, #0x4c
0000000000058110	mov	x0, x23
0000000000058114	mov	w3, #0x4
0000000000058118	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000005811c	ldr	x5, [x22]
0000000000058120	sub	x2, x29, #0x58
0000000000058124	sub	x3, x29, #0x60
0000000000058128	mov	x0, x23
000000000005812c	mov	w4, #0x5
0000000000058130	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000058134	ldr	x4, [x22]
0000000000058138	sub	x2, x29, #0x64
000000000005813c	mov	x0, x23
0000000000058140	mov	w3, #0x6
0000000000058144	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000058148	cbz	x20, 0x58170
000000000005814c	add	x8, sp, #0x40
0000000000058150	mov	x0, x20
0000000000058154	bl	_objc_msgSend$imageInfo
0000000000058158	ldr	x8, [sp, #0x68]
000000000005815c	cbz	x8, 0x58180
0000000000058160	ldur	d0, [x29, #-0x38]
0000000000058164	fneg	d0, d0
0000000000058168	stur	d0, [x29, #-0x38]
000000000005816c	b	0x58180
0000000000058170	str	xzr, [sp, #0x80]
0000000000058174	movi.2d	v0, #0000000000000000
0000000000058178	stp	q0, q0, [sp, #0x60]
000000000005817c	stp	q0, q0, [sp, #0x40]
0000000000058180	mov	x0, x20
0000000000058184	bl	_objc_msgSend$imageType
0000000000058188	mov	x23, x0
000000000005818c	ldr	x2, [x22]
0000000000058190	mov	x0, x21
0000000000058194	bl	"_objc_msgSend$getRenderMode:"
0000000000058198	cmp	w0, #0x0
000000000005819c	ccmp	x23, #0x3, #0x0, ne
00000000000581a0	cset	w23, eq
00000000000581a4	b.ne	0x58274
00000000000581a8	mov	x0, x20
00000000000581ac	bl	_objc_msgSend$bounds
00000000000581b0	ldur	d0, [x29, #-0x58]
00000000000581b4	fmov	d1, #-0.50000000
00000000000581b8	fadd	d0, d0, d1
00000000000581bc	fmul	d0, d0, d2
00000000000581c0	ldur	d2, [x29, #-0x60]
00000000000581c4	fadd	d1, d2, d1
00000000000581c8	fmul	d1, d3, d1
00000000000581cc	stp	d1, d0, [x29, #-0x60]
00000000000581d0	cbz	x20, 0x581e8
00000000000581d4	add	x8, sp, #0x30
00000000000581d8	mov	x0, x20
00000000000581dc	bl	_objc_msgSend$heliumRef
00000000000581e0	ldp	d1, d0, [x29, #-0x60]
00000000000581e4	b	0x581ec
00000000000581e8	str	xzr, [sp, #0x30]
00000000000581ec	ldp	q2, q3, [x22]
00000000000581f0	stp	q2, q3, [sp]
00000000000581f4	ldr	q2, [x22, #0x20]
00000000000581f8	str	q2, [sp, #0x20]
00000000000581fc	fcvt	s5, d1
0000000000058200	fcvt	s4, d0
0000000000058204	ldur	s0, [x29, #-0x4c]
0000000000058208	scvtf	s3, s0
000000000005820c	ldp	d1, d0, [x29, #-0x48]
0000000000058210	fcvt	s2, d1
0000000000058214	fcvt	s1, d0
0000000000058218	ldur	d0, [x29, #-0x38]
000000000005821c	fcvt	s0, d0
0000000000058220	ldur	w6, [x29, #-0x64]
0000000000058224	add	x8, sp, #0x38
0000000000058228	add	x2, sp, #0x30
000000000005822c	mov	x5, sp
0000000000058230	mov	x0, x21
0000000000058234	mov	x3, x20
0000000000058238	mov	x4, x19
000000000005823c	bl	"_objc_msgSend$quakeHeliumNodeWithInputImage:inputImage:outputImage:renderInfo:twist:horizontalShake:verticalShake:layers:centerX:centerY:randomSeed:"
0000000000058240	ldr	x0, [sp, #0x30]
0000000000058244	cbz	x0, 0x58254
0000000000058248	ldr	x8, [x0]
000000000005824c	ldr	x8, [x8, #0x18]
0000000000058250	blr	x8
0000000000058254	add	x2, sp, #0x38
0000000000058258	mov	x0, x19
000000000005825c	bl	"_objc_msgSend$setHeliumRef:"
0000000000058260	ldr	x0, [sp, #0x38]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : IntSlider
    parm5 : PointParameter
    parm6 : IntSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (int)
    - parm6 (int)

```
