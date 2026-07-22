# Hatched Screen

- **PAE class:** `Hatched Screen`
- **Plugin UUID:** `5A65EC34-AA97-4A6E-B40D-DFEFD46364C5`
- **Node names in corpus:** Hatched Screen (27), Hatched Screen copy (1), Hatched Screen Source (1)
- **Corpus usage:** 11 files, 29 instances

## What it does

Hatched Screen renders the image as a cross-hatched line-screen halftone: tone is represented by the density of hatching lines. Scale sets the hatch frequency, Angle rotates it, Skew/Stretch shear the pattern, and Contrast sets how sharply hatching switches on with darkness.

> **Note.** Not implemented; description is the standard Apple Motion "Hatched Screen" halftone filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor point of the hatch pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0.4992 | 0 .. 0.7854 | Rotation of the hatching lines, radians (default ~0.5). |
| Scale | float | 10 | 1 .. 26 | Hatch line frequency / cell size, ~1-26 (default 10). |
| Skew | float | 0 | -1.41 .. 1.83 | Shears the hatch pattern, ~-1.4..1.8 (default 0). |
| Stretch | float | 0 | -0.37 .. 0.25 | Stretches the hatch cells, ~-0.4..0.25 (default 0). |
| Contrast | float | 0.5 | 0 .. 0.65 | How sharply hatching appears with tone, 0-0.65 (default 0.5). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcHatchedScreen`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcHatchedScreen` → [`HgcHatchedScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcHatchedScreen.metal)

```metal
//Metal1.0     
//LEN=0000000363
[[ visible ]] FragmentOut HgcHatchedScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = texCoord1 + hg_Params[4];
    r0 = r0 - hg_Params[0];
    r0 = r0*hg_Params[5];
    r1.x = dot(r0, hg_Params[1]);
    r1.y = dot(r0, hg_Params[2]);
    r1.xy = fract(r1.xy);
    r0 = color0;
    r2.xy = c0.xx - r1.xy;
    r1.xy = fmin(r2.xy, r1.xy);
    r1.xy = r1.xy + r1.xy;
    r1.y = r1.y*c0.y + c0.y;
    r1.xyz = fmin(r1.xxx, r1.yyy);
    r2.xyz = float3(dot(r0, hg_Params[6]));
    r2.xyz = r2.xyz - r1.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[3].xyz + c0.yyy, 0.00000f, 1.00000f);
    r0.xyz = r2.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEHatchedScreen canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEHatchedScreen`

```asm
00000000000acc84	mov	w4, #0x1
00000000000acc88	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000acc8c	ldr	x4, [x23]
00000000000acc90	sub	x2, x29, #0xa0
00000000000acc94	mov	x0, x27
00000000000acc98	mov	w3, #0x2
00000000000acc9c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000acca0	ldr	x4, [x23]
00000000000acca4	add	x2, sp, #0xa8
00000000000acca8	mov	x0, x27
00000000000accac	mov	w3, #0x3
00000000000accb0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000accb4	ldr	x4, [x23]
00000000000accb8	add	x2, sp, #0xa0
00000000000accbc	mov	x0, x27
00000000000accc0	mov	w3, #0x4
00000000000accc4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000accc8	ldr	x4, [x23]
00000000000acccc	add	x2, sp, #0x98
00000000000accd0	mov	x0, x27
00000000000accd4	mov	w3, #0x5
00000000000accd8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000accdc	ldr	x4, [x23]
00000000000acce0	add	x2, sp, #0x90
00000000000acce4	mov	x0, x27
00000000000acce8	mov	w3, #0x6
00000000000accec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000accf0	add	x8, sp, #0x10
00000000000accf4	mov	x0, x26
00000000000accf8	mov	x2, x21
00000000000accfc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000acd00	ldp	d2, d0, [sp, #0xa0]
00000000000acd04	ldr	d1, [sp, #0x98]
00000000000acd08	ldur	d3, [x29, #-0xa0]
00000000000acd0c	sub	x2, x29, #0x88
00000000000acd10	mov	x0, x26
00000000000acd14	bl	"_objc_msgSend$compute_2x2_matrix:fromScale:stretch:skew:andAngle:"
00000000000acd18	ldr	x2, [x23]
00000000000acd1c	mov	x0, x22
00000000000acd20	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000acd24	bl	_objc_msgSend$matrix
00000000000acd28	mov	x22, x0
00000000000acd2c	ldr	x2, [x23]
00000000000acd30	mov	x0, x26
00000000000acd34	bl	"_objc_msgSend$getRenderMode:"
00000000000acd38	cbz	w0, 0xacfb4
00000000000acd3c	mov	x0, x21
00000000000acd40	bl	_objc_msgSend$imageType
00000000000acd44	cmp	x0, #0x3
00000000000acd48	b.ne	0xacfb4
00000000000acd4c	cbz	x21, 0xacd60
00000000000acd50	add	x8, sp, #0x8
00000000000acd54	mov	x0, x21
00000000000acd58	bl	_objc_msgSend$heliumRef
00000000000acd5c	b	0xacd64
00000000000acd60	str	xzr, [sp, #0x8]
00000000000acd64	mov	w0, #0x1c0
00000000000acd68	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000acd6c	mov	x21, x0
00000000000acd70	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000acd74	ldr	x8, [x23, #0x28]
00000000000acd78	cbnz	x8, 0xacdc4
00000000000acd7c	ldr	x2, [sp, #0x8]
00000000000acd80	ldr	x8, [x21]
00000000000acd84	ldr	x8, [x8, #0x78]
00000000000acd88	mov	x0, x21
00000000000acd8c	mov	w1, #0x0
00000000000acd90	blr	x8
00000000000acd94	ldr	x0, [sp, #0x8]
00000000000acd98	cmp	x0, x21
00000000000acd9c	b.eq	0xacdc4
00000000000acda0	cbz	x0, 0xacdb0
00000000000acda4	ldr	x8, [x0]
00000000000acda8	ldr	x8, [x8, #0x18]
00000000000acdac	blr	x8
00000000000acdb0	str	x21, [sp, #0x8]
00000000000acdb4	ldr	x8, [x21]
00000000000acdb8	ldr	x8, [x8, #0x10]
00000000000acdbc	mov	x0, x21
00000000000acdc0	blr	x8
00000000000acdc4	mov	w0, #0x1a0
00000000000acdc8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000acdcc	mov	x23, x0
00000000000acdd0	bl	__ZN16HgcHatchedScreenC2Ev
00000000000acdd4	ucvtf	d9, x24
00000000000acdd8	ucvtf	d8, x25
00000000000acddc	adrp	x8, 744 ; 0x394000
00000000000acde0	add	x8, x8, #0x2b8
00000000000acde4	add	x9, x8, #0x10
00000000000acde8	str	x9, [x23]
00000000000acdec	ldur	d0, [x29, #-0x90]
00000000000acdf0	fmul	d1, d0, d9
00000000000acdf4	ldur	d0, [x29, #-0x98]
00000000000acdf8	fmul	d0, d0, d8
00000000000acdfc	stp	d0, d1, [x29, #-0x98]
00000000000ace00	ldr	x2, [sp, #0x8]
00000000000ace04	ldr	x8, [x8, #0x88]
00000000000ace08	mov	x0, x23
00000000000ace0c	mov	w1, #0x0
00000000000ace10	blr	x8
00000000000ace14	ldp	d1, d0, [x29, #-0x98]
00000000000ace18	fcvt	s0, d0
00000000000ace1c	fcvt	s1, d1
00000000000ace20	ldr	x8, [x23]
00000000000ace24	ldr	x8, [x8, #0x60]
00000000000ace28	movi.2d	v2, #0000000000000000
00000000000ace2c	movi.2d	v3, #0000000000000000
00000000000ace30	mov	x0, x23
00000000000ace34	mov	w1, #0x0
00000000000ace38	blr	x8
00000000000ace3c	ldp	d0, d1, [x29, #-0x88]
00000000000ace40	fcvt	s0, d0
00000000000ace44	fcvt	s1, d1
00000000000ace48	ldr	x8, [x23]
00000000000ace4c	ldr	x8, [x8, #0x60]
00000000000ace50	movi.2d	v2, #0000000000000000
00000000000ace54	movi.2d	v3, #0000000000000000
00000000000ace58	mov	x0, x23
00000000000ace5c	mov	w1, #0x1
00000000000ace60	blr	x8
00000000000ace64	ldp	d0, d1, [x29, #-0x78]
00000000000ace68	fcvt	s0, d0
00000000000ace6c	fcvt	s1, d1
00000000000ace70	ldr	x8, [x23]
00000000000ace74	ldr	x8, [x8, #0x60]
00000000000ace78	movi.2d	v2, #0000000000000000
00000000000ace7c	movi.2d	v3, #0000000000000000
00000000000ace80	mov	x0, x23
00000000000ace84	mov	w1, #0x2
00000000000ace88	blr	x8
00000000000ace8c	ldr	d0, [sp, #0x90]
00000000000ace90	fmov	d1, #1.00000000
00000000000ace94	fsub	d0, d1, d0
00000000000ace98	fdiv	d0, d1, d0
00000000000ace9c	fcvt	s0, d0
00000000000acea0	ldr	x8, [x23]
00000000000acea4	ldr	x8, [x8, #0x60]
00000000000acea8	movi.2d	v1, #0000000000000000
00000000000aceac	movi.2d	v2, #0000000000000000
00000000000aceb0	movi.2d	v3, #0000000000000000
00000000000aceb4	mov	x0, x23
00000000000aceb8	mov	w1, #0x3
00000000000acebc	blr	x8
00000000000acec0	fmov	d1, #0.50000000
00000000000acec4	fmul	d0, d9, d1
00000000000acec8	fcvt	s0, d0
00000000000acecc	fmul	d1, d8, d1
00000000000aced0	fcvt	s1, d1
00000000000aced4	ldr	x8, [x23]
00000000000aced8	ldr	x8, [x8, #0x60]
00000000000acedc	movi.2d	v2, #0000000000000000
00000000000acee0	movi.2d	v3, #0000000000000000
00000000000acee4	mov	x0, x23
00000000000acee8	mov	w1, #0x4
00000000000aceec	blr	x8
00000000000acef0	ldr	d0, [sp, #0x10]
00000000000acef4	ldr	d1, [sp, #0x38]
00000000000acef8	fcvt	s0, d0
00000000000acefc	fcvt	s1, d1
00000000000acf00	ldr	x8, [x23]
00000000000acf04	ldr	x8, [x8, #0x60]
00000000000acf08	movi.2d	v2, #0000000000000000
00000000000acf0c	movi.2d	v3, #0000000000000000
00000000000acf10	mov	x0, x23
00000000000acf14	mov	w1, #0x5
00000000000acf18	blr	x8
00000000000acf1c	ldp	d0, d1, [x22]
00000000000acf20	fcvt	s0, d0
00000000000acf24	fcvt	s1, d1
00000000000acf28	ldr	d2, [x22, #0x10]
00000000000acf2c	fcvt	s2, d2
00000000000acf30	ldr	x8, [x23]
00000000000acf34	ldr	x8, [x8, #0x60]
00000000000acf38	movi.2d	v3, #0000000000000000
00000000000acf3c	mov	x0, x23
00000000000acf40	mov	w1, #0x6
00000000000acf44	blr	x8
00000000000acf48	str	x23, [sp]
00000000000acf4c	ldr	x8, [x23]
00000000000acf50	ldr	x8, [x8, #0x10]
00000000000acf54	mov	x0, x23
00000000000acf58	blr	x8
00000000000acf5c	mov	x2, sp
00000000000acf60	mov	x0, x20
00000000000acf64	bl	"_objc_msgSend$setHeliumRef:"
00000000000acf68	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : AngleSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm6 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  parm6 (float)
    slot 4  <-  (constant / computed / multi-pass — read the disasm)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  (constant / computed / multi-pass — read the disasm)
```
