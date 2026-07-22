# Fisheye

- **PAE class:** `Fisheye`
- **Plugin UUID:** `C1278154-B061-453F-8BDE-9F70AB2E6066`
- **Node names in corpus:** Fisheye (69), Fisheye copy (1)
- **Corpus usage:** 41 files, 70 instances

## What it does

Fisheye applies an anisotropic radial power warp (barrel/fisheye bulge or pinch) about a Center: the sample offset scales with normalized radius raised to a power derived from Amount, normalized per-axis by frame width and height. Radius scales the effect extent. Implemented and verified (34-36 dB) with the exact model from the HgcFisheye shader.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | enum(int)/float | 15 | 0 .. 4 | Strength (and sign) of the fisheye. Internally exponent = (Amount/30 <= 0) ? 1/(1-Amount/30) : (Amount/30 + 1). Amount 0 = identity; positive = barrel bulge, negative = pincushion. Default 15. *(keyframed in 67 instances)* |
| Radius | float | 1 | 0.23 .. 2 | Scales the normalization radius, 0.23-2 (default 1). Larger = a broader, gentler warp. *(keyframed in 2 instances)* |
| Center | point2D | - | - | Center of the fisheye (X,Y) in normalized frame coordinates. *(keyframed in 28 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the warped result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/fisheye.ts`](../../engine/src/compositor/filters/fisheye.ts). Reverse-engineered against the verbatim `HgcFisheye` Metal shader.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcFisheye`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcFisheye` → [`HgcFisheye.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcFisheye.metal)

```metal
//Metal1.0     
//LEN=00000003b9
[[ visible ]] FragmentOut HgcFisheye_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy;
    r0.w = c0.w;
    r1.x = dot(r0.xyw, hg_Params[2].xyz);
    r1.y = dot(r0.xyw, hg_Params[3].xyz);
    r1.xy = r1.xy - hg_Params[6].xy;
    r1.zw = r1.xy*r1.xy;
    r1.z = dot(r1.zw, hg_Params[5].xy);
    r1.z = rsqrt(r1.z);
    r0.w = -hg_Params[4].x;
    r1.w = pow(r1.z, r0.w);
    r0.x = r1.z*r1.w;
    r1.xy = r1.xy*r0.xx;
    r1.zw = c0.xw;
    r1 = r1 + hg_Params[6];
    r0.x = dot(r1, hg_Params[0]);
    r0.y = dot(r1, hg_Params[1]);
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEFisheye canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEFisheye`

```asm
000000000002ccf4	mov	w3, #0x2
000000000002ccf8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000002ccfc	ldur	d0, [x29, #-0x68]
000000000002cd00	fcmp	d0, #0.0
000000000002cd04	b.ne	0x2cd1c
000000000002cd08	cbz	x20, 0x2cd58
000000000002cd0c	add	x8, sp, #0x98
000000000002cd10	mov	x0, x20
000000000002cd14	bl	_objc_msgSend$heliumRef
000000000002cd18	b	0x2cd5c
000000000002cd1c	sub	x25, x29, #0x80
000000000002cd20	fmov	d1, #30.00000000
000000000002cd24	fdiv	d0, d0, d1
000000000002cd28	fmov	d9, #1.00000000
000000000002cd2c	fsub	d1, d9, d0
000000000002cd30	fdiv	d1, d9, d1
000000000002cd34	fadd	d0, d0, d9
000000000002cd38	fcsel	d0, d1, d0, le
000000000002cd3c	stur	d0, [x29, #-0x68]
000000000002cd40	cbz	x24, 0x2cd84
000000000002cd44	mov	x0, x24
000000000002cd48	bl	_objc_msgSend$versionAtCreation
000000000002cd4c	cmp	w0, #0x0
000000000002cd50	cset	w24, eq
000000000002cd54	b	0x2cd88
000000000002cd58	str	xzr, [sp, #0x98]
000000000002cd5c	add	x2, sp, #0x98
000000000002cd60	mov	x0, x19
000000000002cd64	bl	"_objc_msgSend$setHeliumRef:"
000000000002cd68	ldr	x0, [sp, #0x98]
000000000002cd6c	cbz	x0, 0x2cd7c
000000000002cd70	ldr	x8, [x0]
000000000002cd74	ldr	x8, [x8, #0x18]
000000000002cd78	blr	x8
000000000002cd7c	mov	w0, #0x1
000000000002cd80	b	0x2ce90
000000000002cd84	mov	w24, #0x1
000000000002cd88	sub	x8, x29, #0x80
000000000002cd8c	fmov.2d	v0, #0.50000000
000000000002cd90	str	q0, [x25]
000000000002cd94	ldr	x5, [x22]
000000000002cd98	sub	x2, x29, #0x80
000000000002cd9c	orr	x3, x8, #0x8
000000000002cda0	mov	x0, x23
000000000002cda4	mov	w4, #0x3
000000000002cda8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000002cdac	add	x8, sp, #0x98
000000000002cdb0	sub	x2, x29, #0x80
000000000002cdb4	mov	x0, x21
000000000002cdb8	mov	x3, x20
000000000002cdbc	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
000000000002cdc0	ldur	q0, [sp, #0x98]
000000000002cdc4	str	q0, [x25]
000000000002cdc8	mov	x8, #-0x6666666666666667
000000000002cdcc	movk	x8, #0x999a
000000000002cdd0	movk	x8, #0x3fb9, lsl #48
000000000002cdd4	stur	x8, [x29, #-0x88]
000000000002cdd8	ldr	x4, [x22]
000000000002cddc	sub	x2, x29, #0x88
000000000002cde0	mov	x0, x23
000000000002cde4	mov	w3, #0x1
000000000002cde8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000002cdec	ldur	d8, [x29, #-0x88]
000000000002cdf0	mov	x0, x20
000000000002cdf4	bl	_objc_msgSend$width
000000000002cdf8	ucvtf	d0, x0
000000000002cdfc	fmul	d8, d8, d0
000000000002ce00	ldur	d10, [x29, #-0x88]
000000000002ce04	mov	x0, x20
000000000002ce08	bl	_objc_msgSend$height
000000000002ce0c	fmaxnm	d8, d8, d9
000000000002ce10	cbz	w24, 0x2ce2c
000000000002ce14	mov	x0, x20
000000000002ce18	bl	_objc_msgSend$pixelAspect
000000000002ce1c	fmov	d1, #1.00000000
000000000002ce20	fdiv	d0, d1, d0
000000000002ce24	fmul	d9, d8, d0
000000000002ce28	b	0x2ce38
000000000002ce2c	ucvtf	d0, x0
000000000002ce30	fmul	d0, d10, d0
000000000002ce34	fmaxnm	d9, d0, d9
000000000002ce38	add	x8, sp, #0x98
000000000002ce3c	mov	x0, x21
000000000002ce40	mov	x2, x20
000000000002ce44	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000002ce48	add	x8, sp, #0x18
000000000002ce4c	mov	x0, x21
000000000002ce50	mov	x2, x20
000000000002ce54	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000002ce58	ldr	x2, [x22]
000000000002ce5c	mov	x0, x21
000000000002ce60	bl	"_objc_msgSend$getRenderMode:"
000000000002ce64	cbz	w0, 0x2ce90
000000000002ce68	mov	x0, x19
000000000002ce6c	bl	_objc_msgSend$imageType
000000000002ce70	cmp	x0, #0x3
000000000002ce74	b.ne	0x2ce8c
000000000002ce78	cbz	x20, 0x2ceb4
000000000002ce7c	add	x8, sp, #0x10
000000000002ce80	mov	x0, x20
000000000002ce84	bl	_objc_msgSend$heliumRef
000000000002ce88	b	0x2ceb8
000000000002ce8c	mov	w0, #0x0
000000000002ce90	ldp	x29, x30, [sp, #0x1a0]
000000000002ce94	ldp	x20, x19, [sp, #0x190]
000000000002ce98	ldp	x22, x21, [sp, #0x180]
000000000002ce9c	ldp	x24, x23, [sp, #0x170]
000000000002cea0	ldp	x26, x25, [sp, #0x160]
000000000002cea4	ldp	d9, d8, [sp, #0x150]
000000000002cea8	ldp	d11, d10, [sp, #0x140]
000000000002ceac	add	sp, sp, #0x1b0
000000000002ceb0	ret
000000000002ceb4	str	xzr, [sp, #0x10]
000000000002ceb8	mov	w0, #0x220
000000000002cebc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000002cec0	mov	x23, x0
000000000002cec4	bl	__ZN10HgcFisheyeC2Ev
000000000002cec8	adrp	x8, 867 ; 0x38f000
000000000002cecc	add	x8, x8, #0x178
000000000002ced0	add	x9, x8, #0x10
000000000002ced4	str	x9, [x23]
000000000002ced8	ldr	x2, [sp, #0x10]
000000000002cedc	ldr	x8, [x8, #0x88]
000000000002cee0	mov	x0, x23
000000000002cee4	mov	w1, #0x0
000000000002cee8	blr	x8
000000000002ceec	ldp	d0, d1, [sp, #0x98]
000000000002cef0	fcvt	s0, d0
000000000002cef4	fcvt	s1, d1
000000000002cef8	ldp	d2, d3, [sp, #0xa8]
000000000002cefc	fcvt	s2, d2
000000000002cf00	fcvt	s3, d3
000000000002cf04	ldr	x8, [x23]
000000000002cf08	ldr	x8, [x8, #0x60]
000000000002cf0c	mov	x0, x23
000000000002cf10	mov	w1, #0x0
000000000002cf14	blr	x8
000000000002cf18	ldp	d0, d1, [sp, #0xb8]
000000000002cf1c	fcvt	s0, d0
000000000002cf20	fcvt	s1, d1
000000000002cf24	ldp	d2, d3, [sp, #0xc8]
000000000002cf28	fcvt	s2, d2
000000000002cf2c	fcvt	s3, d3
000000000002cf30	ldr	x8, [x23]
000000000002cf34	ldr	x8, [x8, #0x60]
000000000002cf38	mov	x0, x23
000000000002cf3c	mov	w1, #0x1
000000000002cf40	blr	x8
000000000002cf44	ldp	d0, d1, [sp, #0x18]
000000000002cf48	fcvt	s0, d0
000000000002cf4c	fcvt	s1, d1
000000000002cf50	ldp	d2, d3, [sp, #0x28]
000000000002cf54	fcvt	s2, d2
000000000002cf58	fcvt	s3, d3
000000000002cf5c	ldr	x8, [x23]
000000000002cf60	ldr	x8, [x8, #0x60]
000000000002cf64	mov	x0, x23
000000000002cf68	mov	w1, #0x2
000000000002cf6c	blr	x8
000000000002cf70	ldp	d0, d1, [sp, #0x38]
000000000002cf74	fcvt	s0, d0
000000000002cf78	fcvt	s1, d1
000000000002cf7c	ldp	d2, d3, [sp, #0x48]
000000000002cf80	fcvt	s2, d2
000000000002cf84	fcvt	s3, d3
000000000002cf88	ldr	x8, [x23]
000000000002cf8c	ldr	x8, [x8, #0x60]
000000000002cf90	mov	x0, x23
000000000002cf94	mov	w1, #0x3
000000000002cf98	blr	x8
000000000002cf9c	ldur	d0, [x29, #-0x68]
000000000002cfa0	fcvt	s0, d0
000000000002cfa4	ldr	x8, [x23]
000000000002cfa8	ldr	x8, [x8, #0x60]
000000000002cfac	movi.2d	v1, #0000000000000000
000000000002cfb0	movi.2d	v2, #0000000000000000
000000000002cfb4	movi.2d	v3, #0000000000000000
000000000002cfb8	mov	x0, x23
000000000002cfbc	mov	w1, #0x4
000000000002cfc0	blr	x8
000000000002cfc4	ldp	d0, d1, [x22, #0x18]
000000000002cfc8	fdiv	d0, d8, d0
000000000002cfcc	fdiv	d1, d9, d1
000000000002cfd0	fmul	d0, d0, d0
000000000002cfd4	fmov	d2, #1.00000000
000000000002cfd8	fdiv	d0, d2, d0
000000000002cfdc	fcvt	s0, d0
000000000002cfe0	fmul	d1, d1, d1
000000000002cfe4	fdiv	d1, d2, d1
000000000002cfe8	fcvt	s1, d1
000000000002cfec	ldr	x8, [x23]
000000000002cff0	ldr	x8, [x8, #0x60]
000000000002cff4	movi.2d	v2, #0000000000000000
000000000002cff8	movi.2d	v3, #0000000000000000
000000000002cffc	mov	x0, x23
000000000002d000	mov	w1, #0x5
000000000002d004	blr	x8
000000000002d008	ldp	d0, d1, [x29, #-0x80]
000000000002d00c	fcvt	s0, d0
000000000002d010	fcvt	s1, d1
000000000002d014	ldr	x8, [x23]
000000000002d018	ldr	x8, [x8, #0x60]
000000000002d01c	movi.2d	v2, #0000000000000000
000000000002d020	movi.2d	v3, #0000000000000000
000000000002d024	mov	x0, x23
000000000002d028	mov	w1, #0x6
000000000002d02c	blr	x8
000000000002d030	str	x23, [sp, #0x8]
000000000002d034	ldr	x8, [x23]
000000000002d038	ldr	x8, [x8, #0x10]
000000000002d03c	mov	x0, x23
000000000002d040	blr	x8
000000000002d044	add	x2, sp, #0x8
000000000002d048	mov	x0, x21
000000000002d04c	mov	x3, x20
000000000002d050	mov	x4, x19
000000000002d054	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000002d058	add	x2, sp, #0x8
000000000002d05c	mov	x0, x19
000000000002d060	bl	"_objc_msgSend$setHeliumRef:"
000000000002d064	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : PointParameter
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm1 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  parm2 (float)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  parm1 (float)
```
