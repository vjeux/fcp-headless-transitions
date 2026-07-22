# Directional Blur

- **PAE class:** `Directional Blur`
- **Plugin UUID:** `2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52`
- **Node names in corpus:** Directional Blur (217), Directional Blur copy (41), Amount (20), Directional Blur copy 1 (15), Directional Blur 1 (10), Directional Blur copy 2 (8)
- **Corpus usage:** 187 files, 456 instances

## What it does

Directional Blur smears the image along a single axis: FCP rotates the frame so the blur axis is horizontal, applies a 1-D Gaussian, then rotates back. Amount is the blur distance and Angle the direction, giving a motion-streak look. Implemented in TS (the current impl uses a uniform box average rather than FCP's Gaussian falloff -- a documented Phase-2 gap).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 7 | 0 .. 4000 | Blur distance in pixels along the axis. 0 = no blur. The primary streak-length knob. *(keyframed in 254 instances)* |
| Angle | float (radians) | 0 | 0 .. 6.283 | Direction of the blur streak, 0..2pi (0 = horizontal). Rotates the smear axis. *(keyframed in 7 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the streaked result over the sharp original, 0-1 continuous. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `OSC Center`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/directional-blur.ts`](../../engine/src/compositor/filters/directional-blur.ts).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HDirectionalBlur`. The primitive's math lives in the Helium framework binary; disassemble it with `otool -arch arm64 -tV "…/Helium.framework/Versions/A/Helium" | grep -A400 '<primitive>'`.

### CPU render method — `-[PAEDirectionalBlur canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEDirectionalBlur`

```asm
00000000000237ec	mov	w3, #0x1
00000000000237f0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000237f4	ldr	d0, [sp, #0x28]
00000000000237f8	fmov	d1, #0.50000000
00000000000237fc	fmul	d0, d0, d1
0000000000023800	str	d0, [sp, #0x28]
0000000000023804	ldr	x4, [x23]
0000000000023808	add	x2, sp, #0x20
000000000002380c	mov	x0, x19
0000000000023810	mov	w3, #0x2
0000000000023814	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000023818	mov	x0, x21
000000000002381c	bl	_objc_msgSend$origin
0000000000023820	cmp	x0, #0x2
0000000000023824	b.ne	0x2383c
0000000000023828	ldr	d0, [sp, #0x20]
000000000002382c	adrp	x8, 581 ; 0x268000
0000000000023830	ldr	d1, [x8, #0xd48]
0000000000023834	fsub	d0, d1, d0
0000000000023838	str	d0, [sp, #0x20]
000000000002383c	ldr	x4, [x23]
0000000000023840	add	x2, sp, #0x1f
0000000000023844	mov	x0, x19
0000000000023848	mov	w3, #0x3
000000000002384c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000023850	ldr	x2, [x23]
0000000000023854	mov	x0, x22
0000000000023858	bl	"_objc_msgSend$getRenderMode:"
000000000002385c	cbz	w0, 0x239a0
0000000000023860	ldr	d0, [sp, #0x28]
0000000000023864	fcmp	d0, #0.0
0000000000023868	b.ne	0x23880
000000000002386c	cbz	x21, 0x23894
0000000000023870	mov	x8, sp
0000000000023874	mov	x0, x21
0000000000023878	bl	_objc_msgSend$heliumRef
000000000002387c	b	0x23898
0000000000023880	cbz	x21, 0x238bc
0000000000023884	add	x8, sp, #0x10
0000000000023888	mov	x0, x21
000000000002388c	bl	_objc_msgSend$heliumRef
0000000000023890	b	0x238c0
0000000000023894	str	xzr, [sp]
0000000000023898	mov	x2, sp
000000000002389c	mov	x0, x20
00000000000238a0	bl	"_objc_msgSend$setHeliumRef:"
00000000000238a4	ldr	x0, [sp]
00000000000238a8	cbz	x0, 0x239a0
00000000000238ac	ldr	x8, [x0]
00000000000238b0	ldr	x8, [x8, #0x18]
00000000000238b4	blr	x8
00000000000238b8	b	0x239a0
00000000000238bc	str	xzr, [sp, #0x10]
00000000000238c0	mov	w0, #0x1b0
00000000000238c4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000238c8	mov	x23, x0
00000000000238cc	bl	__ZN16HDirectionalBlurC1Ev
00000000000238d0	ldr	d0, [sp, #0x20]
00000000000238d4	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000238d8	ldr	d2, [sp, #0x28]
00000000000238dc	ldr	q3, [sp, #0x30]
00000000000238e0	ldr	q4, [sp, #0x50]
00000000000238e4	zip1.2d	v5, v3, v4
00000000000238e8	fmul.2d	v1, v5, v1[0]
00000000000238ec	zip2.2d	v3, v3, v4
00000000000238f0	fmul.2d	v0, v3, v0[0]
00000000000238f4	fadd.2d	v0, v1, v0
00000000000238f8	fmul.2d	v0, v0, v2[0]
00000000000238fc	str	q0, [sp]
0000000000023900	mov	x1, sp
0000000000023904	mov	x0, x23
0000000000023908	bl	__ZN16HDirectionalBlur4initERK9PCVector2IdE
000000000002390c	str	x23, [sp]
0000000000023910	cbz	x23, 0x23924
0000000000023914	ldr	x8, [x23]
0000000000023918	ldr	x8, [x8, #0x10]
000000000002391c	mov	x0, x23
0000000000023920	blr	x8
0000000000023924	ldr	x2, [sp, #0x10]
0000000000023928	ldr	x8, [x23]
000000000002392c	ldr	x8, [x8, #0x78]
0000000000023930	mov	x0, x23
0000000000023934	mov	w1, #0x0
0000000000023938	blr	x8
000000000002393c	ldrb	w8, [sp, #0x1f]
0000000000023940	cmp	w8, #0x1
0000000000023944	b.ne	0x2395c
0000000000023948	mov	x2, sp
000000000002394c	mov	x0, x22
0000000000023950	mov	x3, x21
0000000000023954	mov	x4, x20
0000000000023958	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000002395c	mov	x2, sp
0000000000023960	mov	x0, x20
0000000000023964	bl	"_objc_msgSend$setHeliumRef:"
0000000000023968	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : AngleSlider
    parm3 : ToggleButton
    parm4 : PointParameter
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (bool)

```
