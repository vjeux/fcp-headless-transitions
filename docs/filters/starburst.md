# Starburst

- **PAE class:** `Starburst`
- **Plugin UUID:** `2D69D3F6-6145-428B-905B-249A76E70830`
- **Node names in corpus:** Starburst (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Starburst radiates streaks of light outward from Center within a given Radius, creating a burst/explosion of rays from a point. Radius sets the burst size.

> **Note.** Not implemented; description is the standard Apple Motion "Starburst" filter. (unverified) exact ray geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Origin of the starburst (X,Y) in normalized frame coordinates. |
| Radius | float (pixels) | 50 | 120 .. 120 | Size of the burst, ~120 (default 50). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcStarburst`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcStarburst` → [`HgcStarburst.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcStarburst.metal)

```metal
//Metal1.0     
//LEN=00000003a5
[[ visible ]] FragmentOut HgcStarburst_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.xy*hg_Params[2].xy;
    r1.x = dot(r0.xy, r0.xy);
    r2.x = rsqrt(r1.x);
    r2.x = select(r2.x, c0.x, r1.x < 0.00000f);
    r2.x = select(c0.x, r2.x, -r1.x < 0.00000f);
    r1.x = r1.x*r2.x;
    r1.x = r1.x*hg_Params[1].x;
    r2.x = 1.00000f / r1.x;
    r1.x = select(c0.x, r2.x, -fabs(r1.x) < 0.00000f);
    r0.xy = r0.xy*r1.xx;
    r0.xy = r0.xy*hg_Params[2].zw + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEStarburst canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEStarburst`

```asm
00000000000c32e8	mov	w4, #0x1
00000000000c32ec	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c32f0	add	x8, sp, #0x50
00000000000c32f4	add	x2, sp, #0xe0
00000000000c32f8	mov	x0, x22
00000000000c32fc	mov	x3, x21
00000000000c3300	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000000c3304	ldr	q0, [sp, #0x50]
00000000000c3308	str	q0, [sp, #0xe0]
00000000000c330c	mov	x8, #0x4049000000000000
00000000000c3310	str	x8, [sp, #0xd8]
00000000000c3314	ldr	x4, [x20]
00000000000c3318	add	x2, sp, #0xd8
00000000000c331c	mov	x0, x23
00000000000c3320	mov	w3, #0x2
00000000000c3324	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c3328	ldr	x2, [x20]
00000000000c332c	mov	x0, x22
00000000000c3330	bl	"_objc_msgSend$getRenderMode:"
00000000000c3334	cbz	w0, 0xc3360
00000000000c3338	mov	x0, x21
00000000000c333c	bl	_objc_msgSend$imageType
00000000000c3340	cmp	x0, #0x3
00000000000c3344	b.ne	0xc335c
00000000000c3348	cbz	x21, 0xc3380
00000000000c334c	add	x8, sp, #0xd0
00000000000c3350	mov	x0, x21
00000000000c3354	bl	_objc_msgSend$heliumRef
00000000000c3358	b	0xc3384
00000000000c335c	mov	w0, #0x0
00000000000c3360	ldp	x29, x30, [sp, #0x1c0]
00000000000c3364	ldp	x20, x19, [sp, #0x1b0]
00000000000c3368	ldp	x22, x21, [sp, #0x1a0]
00000000000c336c	ldp	x24, x23, [sp, #0x190]
00000000000c3370	ldp	x28, x27, [sp, #0x180]
00000000000c3374	ldp	d9, d8, [sp, #0x170]
00000000000c3378	add	sp, sp, #0x1d0
00000000000c337c	ret
00000000000c3380	str	xzr, [sp, #0xd0]
00000000000c3384	mov	w0, #0x1b0
00000000000c3388	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c338c	mov	x20, x0
00000000000c3390	bl	__ZN12HgcStarburstC2Ev
00000000000c3394	adrp	x8, 722 ; 0x395000
00000000000c3398	add	x8, x8, #0x7b0
00000000000c339c	add	x8, x8, #0x10
00000000000c33a0	str	x8, [x20]
00000000000c33a4	add	x8, sp, #0x50
00000000000c33a8	mov	x0, x22
00000000000c33ac	mov	x2, x21
00000000000c33b0	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000c33b4	add	x8, sp, #0x40
00000000000c33b8	mov	x0, x22
00000000000c33bc	mov	x2, x21
00000000000c33c0	bl	"_objc_msgSend$getImageBoundary:"
00000000000c33c4	stp	xzr, xzr, [sp, #0x20]
00000000000c33c8	fmov.2d	v0, #-1.00000000
00000000000c33cc	str	q0, [sp, #0x30]
00000000000c33d0	ldp	d0, d1, [sp, #0x40]
00000000000c33d4	fcvtl	v0.2d, v0.2s
00000000000c33d8	fcvtl	v1.2d, v1.2s
00000000000c33dc	stp	q0, q1, [sp]
00000000000c33e0	add	x0, sp, #0x50
00000000000c33e4	mov	x1, sp
00000000000c33e8	add	x2, sp, #0x20
00000000000c33ec	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
00000000000c33f0	ldp	d0, d1, [sp, #0x20]
00000000000c33f4	fcvt	s0, d0
00000000000c33f8	fcvt	s1, d1
00000000000c33fc	ldp	d2, d3, [sp, #0x30]
00000000000c3400	fcvt	s2, d2
00000000000c3404	fcvt	s3, d3
00000000000c3408	fadd	s2, s0, s2
00000000000c340c	fadd	s3, s1, s3
00000000000c3410	bl	0x250a78 ; symbol stub for: _HGRectfMake4f
00000000000c3414	stp	s0, s1, [sp]
00000000000c3418	stp	s2, s3, [sp, #0x8]
00000000000c341c	mov	x1, sp
00000000000c3420	mov	x0, x20
00000000000c3424	bl	__ZN10HStarburst7SetRectERK7HGRectf
00000000000c3428	ldr	x2, [sp, #0xd0]
00000000000c342c	ldr	x8, [x20]
00000000000c3430	ldr	x8, [x8, #0x78]
00000000000c3434	mov	x0, x20
00000000000c3438	mov	w1, #0x0
00000000000c343c	blr	x8
00000000000c3440	ldp	d0, d1, [sp, #0xe0]
00000000000c3444	fcvt	s0, d0
00000000000c3448	fcvt	s1, d1
00000000000c344c	ldr	x8, [x20]
00000000000c3450	ldr	x8, [x8, #0x60]
00000000000c3454	movi.2d	v2, #0000000000000000
00000000000c3458	movi.2d	v3, #0000000000000000
00000000000c345c	mov	x0, x20
00000000000c3460	mov	w1, #0x0
00000000000c3464	blr	x8
00000000000c3468	ldr	d0, [sp, #0xd8]
00000000000c346c	fmov	d1, #1.00000000
00000000000c3470	fdiv	d0, d1, d0
00000000000c3474	fcvt	s0, d0
00000000000c3478	ldr	x8, [x20]
00000000000c347c	ldr	x8, [x8, #0x60]
00000000000c3480	movi.2d	v1, #0000000000000000
00000000000c3484	movi.2d	v2, #0000000000000000
00000000000c3488	movi.2d	v3, #0000000000000000
00000000000c348c	mov	x0, x20
00000000000c3490	mov	w1, #0x1
00000000000c3494	blr	x8
00000000000c3498	fcvt	s0, d9
00000000000c349c	fcvt	s2, d8
00000000000c34a0	fabs	s3, s0
00000000000c34a4	fmov	s1, #1.00000000
00000000000c34a8	fdiv	s0, s1, s2
00000000000c34ac	ldr	x8, [x20]
00000000000c34b0	ldr	x8, [x8, #0x60]
00000000000c34b4	fdiv	s1, s1, s3
00000000000c34b8	mov	x0, x20
00000000000c34bc	mov	w1, #0x2
00000000000c34c0	blr	x8
00000000000c34c4	str	x20, [sp]
00000000000c34c8	ldr	x8, [x20]
00000000000c34cc	ldr	x8, [x8, #0x10]
00000000000c34d0	mov	x0, x20
00000000000c34d4	blr	x8
00000000000c34d8	mov	x2, sp
00000000000c34dc	mov	x0, x19
00000000000c34e0	bl	"_objc_msgSend$setHeliumRef:"
00000000000c34e4	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm2 (float)
    slot 1  <-  parm2 (float)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
```
