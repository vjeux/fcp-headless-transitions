# Fun House

- **PAE class:** `Fun House`
- **Plugin UUID:** `448206B5-384F-4056-88C8-369B8AEEA2B0`
- **Node names in corpus:** Fun House (27), Fun House copy (2)
- **Corpus usage:** 17 files, 29 instances

## What it does

Fun House applies a carnival funhouse-mirror distortion, stretching and squeezing the image around a vertical (or angled) axis through Center as if reflected in a warped mirror. Width sets the region affected, Amount the distortion strength, and Angle the axis orientation.

> **Note.** Not implemented; description is the standard Apple Motion "Fun House" distortion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the funhouse distortion (X,Y) in normalized frame coordinates. *(keyframed in 4 instances)* |
| Width | float (pixels) | 400 | 232 .. 40000 | Width of the affected region, ~230-40000 (default 400). *(keyframed in 10 instances)* |
| Amount | float | 3 | 1.5 .. 100 | Distortion strength, ~1.5-100 (default 3). *(keyframed in 18 instances)* |
| Angle | float (radians) | 0 | -0.5411 .. 1.571 | Orientation of the distortion axis, radians (default 0). *(keyframed in 7 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 12 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcFunHouse`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcFunHouse` → [`HgcFunHouse.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcFunHouse.metal)

```metal
//Metal1.0     
//LEN=0000000577
[[ visible ]] FragmentOut HgcFunHouse_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 1.000000000, -2.000000000, 3.000000000);
    const float4 c1 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.xy = hg_Params[5].xy*c0.xx;
    r1.xy = texCoord0.xy - hg_Params[0].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    r2.x = dot(r1.xy, hg_Params[1].xy);
    r2.y = dot(r1.xy, hg_Params[1].zw);
    r1.x = clamp(abs(r2.x), 0.00000f, 1.00000f);
    r1.x = clamp(c0.y - r1.x, 0.00000f, 1.00000f);
    r3.x = r1.x*c0.z + c0.w;
    r1.x = r1.x*r1.x;
    r3.x = r1.x*r3.x;
    r3.x = mix(c0.y, hg_Params[3].x, r3.x);
    r2.x = r2.x*r3.x;
    r1.x = dot(r2.xy, hg_Params[2].xy);
    r1.y = dot(r2.xy, hg_Params[2].zw);
    r1.xy = r1.xy*hg_Params[4].xy + hg_Params[0].xy;
    r3.xy = fmax(r1.xy, -r0.xy);
    r3.xy = fmin(r3.xy, r0.xy);
    r2.xy = -r0.xy - r1.xy;
    r1.xy = r1.xy - r0.xy;
    r2.x = fmax(r2.x, r2.y);
    r2.y = fmax(r1.x, r1.y);
    r2.x = fmax(r2.x, r2.y);
    r3.xy = r3.xy + hg_Params[6].xy;
    r3.xy = r3.xy*hg_Params[6].zw;
    r3 = hg_Texture0.sample(hg_Sampler0, r3.xy);
    output.color0 = select(r3, c1.xxxx, -r2.xxxx < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEFunHouse canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEFunHouse`

```asm
00000000000a31cc	mov	w4, #0x1
00000000000a31d0	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000a31d4	stur	xzr, [x29, #-0x98]
00000000000a31d8	ldr	x4, [x19]
00000000000a31dc	sub	x2, x29, #0x98
00000000000a31e0	mov	x0, x23
00000000000a31e4	mov	w3, #0x2
00000000000a31e8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a31ec	stur	xzr, [x29, #-0xa0]
00000000000a31f0	ldr	x4, [x19]
00000000000a31f4	sub	x2, x29, #0xa0
00000000000a31f8	mov	x0, x23
00000000000a31fc	mov	w3, #0x3
00000000000a3200	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a3204	mov	x8, #0x403e000000000000
00000000000a3208	stur	x8, [x29, #-0xa8]
00000000000a320c	ldr	x4, [x19]
00000000000a3210	sub	x2, x29, #0xa8
00000000000a3214	mov	x0, x23
00000000000a3218	mov	w3, #0x4
00000000000a321c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a3220	ldr	x2, [x19]
00000000000a3224	mov	x0, x22
00000000000a3228	bl	"_objc_msgSend$getRenderMode:"
00000000000a322c	mov	x19, x0
00000000000a3230	ldur	d0, [x29, #-0xa8]
00000000000a3234	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000a3238	cbz	w19, 0xa345c
00000000000a323c	mov.16b	v8, v0
00000000000a3240	mov.16b	v9, v1
00000000000a3244	mov	x0, x20
00000000000a3248	bl	_objc_msgSend$imageType
00000000000a324c	cmp	x0, #0x3
00000000000a3250	b.ne	0xa345c
00000000000a3254	mov	w0, #0x1b0
00000000000a3258	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a325c	mov	x19, x0
00000000000a3260	bl	__ZN9HFunHouseC1Ev
00000000000a3264	add	x8, sp, #0x58
00000000000a3268	mov	x0, x22
00000000000a326c	mov	x2, x21
00000000000a3270	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000a3274	add	x8, sp, #0x48
00000000000a3278	mov	x0, x22
00000000000a327c	mov	x2, x21
00000000000a3280	bl	"_objc_msgSend$getImageBoundary:"
00000000000a3284	stp	xzr, xzr, [sp, #0x28]
00000000000a3288	fmov.2d	v0, #-1.00000000
00000000000a328c	stur	q0, [sp, #0x38]
00000000000a3290	ldp	d0, d1, [sp, #0x48]
00000000000a3294	fcvtl	v0.2d, v0.2s
00000000000a3298	fcvtl	v1.2d, v1.2s
00000000000a329c	stp	q0, q1, [sp]
00000000000a32a0	add	x0, sp, #0x58
00000000000a32a4	mov	x1, sp
00000000000a32a8	add	x2, sp, #0x28
00000000000a32ac	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
00000000000a32b0	ldp	d0, d1, [sp, #0x28]
00000000000a32b4	fcvt	s0, d0
00000000000a32b8	fcvt	s1, d1
00000000000a32bc	ldp	d2, d3, [sp, #0x38]
00000000000a32c0	fcvt	s2, d2
00000000000a32c4	fcvt	s3, d3
00000000000a32c8	fadd	s2, s0, s2
00000000000a32cc	fadd	s3, s1, s3
00000000000a32d0	bl	0x250a78 ; symbol stub for: _HGRectfMake4f
00000000000a32d4	stp	s0, s1, [sp]
00000000000a32d8	stp	s2, s3, [sp, #0x8]
00000000000a32dc	mov	x1, sp
00000000000a32e0	mov	x0, x19
00000000000a32e4	bl	__ZN10HStarburst7SetRectERK7HGRectf
00000000000a32e8	mov	x0, x21
00000000000a32ec	bl	_objc_msgSend$width
00000000000a32f0	mov	x22, x0
00000000000a32f4	mov	x0, x21
00000000000a32f8	bl	_objc_msgSend$height
00000000000a32fc	ucvtf	d12, x22
00000000000a3300	ucvtf	d13, x0
00000000000a3304	ldp	d2, d0, [x29, #-0x90]
00000000000a3308	fmov	d1, #-0.50000000
00000000000a330c	fadd	d0, d0, d1
00000000000a3310	fmul	d0, d0, d12
00000000000a3314	fadd	d1, d2, d1
00000000000a3318	fmul	d1, d1, d13
00000000000a331c	stp	d1, d0, [x29, #-0x90]
00000000000a3320	fcvt	s0, d0
00000000000a3324	fcvt	s1, d1
00000000000a3328	ldr	x8, [x19]
00000000000a332c	ldr	x8, [x8, #0x60]
00000000000a3330	movi.2d	v2, #0000000000000000
00000000000a3334	movi.2d	v3, #0000000000000000
00000000000a3338	mov	x0, x19
00000000000a333c	mov	w1, #0x0
00000000000a3340	blr	x8
00000000000a3344	fcvt	s0, d9
00000000000a3348	fcvt	s2, d8
00000000000a334c	fneg	s1, s2
00000000000a3350	fcvt	d8, s0
00000000000a3354	ldur	d3, [x29, #-0x98]
00000000000a3358	fdiv	d0, d8, d3
00000000000a335c	fcvt	s0, d0
00000000000a3360	fcvt	d9, s1
00000000000a3364	fdiv	d1, d9, d3
00000000000a3368	fcvt	s1, d1
00000000000a336c	fcvt	d14, s2
00000000000a3370	fdiv	d2, d14, d3
00000000000a3374	fcvt	s2, d2
00000000000a3378	ldr	x8, [x19]
00000000000a337c	ldr	x8, [x8, #0x60]
00000000000a3380	mov	x0, x19
00000000000a3384	mov	w1, #0x1
00000000000a3388	mov.16b	v3, v0
00000000000a338c	blr	x8
00000000000a3390	ldur	d2, [x29, #-0x98]
00000000000a3394	fmul	d0, d2, d8
00000000000a3398	fcvt	s0, d0
00000000000a339c	fmul	d1, d2, d14
00000000000a33a0	fcvt	s1, d1
00000000000a33a4	fmul	d2, d2, d9
00000000000a33a8	fcvt	s2, d2
00000000000a33ac	ldr	x8, [x19]
00000000000a33b0	ldr	x8, [x8, #0x60]
00000000000a33b4	mov	x0, x19
00000000000a33b8	mov	w1, #0x2
00000000000a33bc	mov.16b	v3, v0
00000000000a33c0	blr	x8
00000000000a33c4	ldur	d0, [x29, #-0xa0]
00000000000a33c8	fmov	d8, #1.00000000
00000000000a33cc	fdiv	d0, d8, d0
00000000000a33d0	fcvt	s0, d0
00000000000a33d4	ldr	x8, [x19]
00000000000a33d8	ldr	x8, [x8, #0x60]
00000000000a33dc	movi.2d	v1, #0000000000000000
00000000000a33e0	movi.2d	v2, #0000000000000000
00000000000a33e4	movi.2d	v3, #0000000000000000
00000000000a33e8	mov	x0, x19
00000000000a33ec	mov	w1, #0x3
00000000000a33f0	blr	x8
00000000000a33f4	fcvt	s0, d11
00000000000a33f8	fcvt	s1, d10
00000000000a33fc	fdiv	d2, d8, d11
00000000000a3400	fcvt	s2, d2
00000000000a3404	fdiv	d3, d8, d10
00000000000a3408	fcvt	s3, d3
00000000000a340c	ldr	x8, [x19]
00000000000a3410	ldr	x8, [x8, #0x60]
00000000000a3414	mov	x0, x19
00000000000a3418	mov	w1, #0x4
00000000000a341c	blr	x8
00000000000a3420	fcvt	s0, d12
00000000000a3424	fcvt	s1, d13
00000000000a3428	ldr	x8, [x19]
00000000000a342c	ldr	x8, [x8, #0x60]
00000000000a3430	movi.2d	v2, #0000000000000000
00000000000a3434	movi.2d	v3, #0000000000000000
00000000000a3438	mov	x0, x19
00000000000a343c	mov	w1, #0x5
00000000000a3440	blr	x8
00000000000a3444	cbz	x21, 0xa3464
00000000000a3448	mov	x8, sp
00000000000a344c	mov	x0, x21
00000000000a3450	bl	_objc_msgSend$heliumRef
00000000000a3454	ldr	x2, [sp]
00000000000a3458	b	0xa346c
00000000000a345c	mov	w0, #0x0
00000000000a3460	b	0xa34dc
00000000000a3464	mov	x2, #0x0
00000000000a3468	str	xzr, [sp]
00000000000a346c	ldr	x8, [x19]
00000000000a3470	ldr	x8, [x8, #0x78]
00000000000a3474	mov	x0, x19
00000000000a3478	mov	w1, #0x0
00000000000a347c	blr	x8
00000000000a3480	ldr	x0, [sp]
00000000000a3484	cbz	x0, 0xa3494
00000000000a3488	ldr	x8, [x0]
00000000000a348c	ldr	x8, [x8, #0x18]
00000000000a3490	blr	x8
00000000000a3494	str	x19, [sp]
00000000000a3498	ldr	x8, [x19]
00000000000a349c	ldr	x8, [x8, #0x10]
00000000000a34a0	mov	x0, x19
00000000000a34a4	blr	x8
00000000000a34a8	mov	x2, sp
00000000000a34ac	mov	x0, x20
00000000000a34b0	bl	"_objc_msgSend$setHeliumRef:"
00000000000a34b4	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : AngleSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm2 (float)
    slot 3  <-  parm3 (float)
    slot 4  <-  parm4 (float)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
```
