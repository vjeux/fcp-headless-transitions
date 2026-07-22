# Kaleidotile

- **PAE class:** `Kaleidotile`
- **Plugin UUID:** `7438BC75-716C-4D49-9613-7EE2834B9B7B`
- **Node names in corpus:** Kaleidotile (55), Kaleidotile copy (5), kt (3), rect5ctl (3), rect4ctl (3), rect3ctl (3)
- **Corpus usage:** 52 files, 78 instances

## What it does

Kaleidotile tiles the frame into a repeating kaleidoscopic pattern: it takes a Width x Height cell of the image, mirrors/rotates it and tiles it across the frame with a rotation Angle, producing a symmetric mandala/mosaic. FCP's HgcKaleidaTile shader exists in the binary. Not implemented; described from the standard Motion "Kaleidotile".

> **Note.** Not implemented in the TS engine and no checked-in shader (HgcKaleidaTile exists in the binary but is not extracted here). Described from the standard Motion "Kaleidotile".

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Width | float (pixels) | 64 | 28 .. 4072 | Width of the source tile cell, 28-4072 (default 64). *(keyframed in 4 instances)* |
| Height | float (pixels) | 64 | 64 .. 4000 | Height of the source tile cell, 64-4000 (default 64). *(keyframed in 1 instance)* |
| Angle | float (radians) | 0 | 0 .. 6.278 | Rotation of the tiling pattern, 0..2pi. |
| Center | point2D | - | - | Center/origin of the kaleidoscope (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the kaleidoscoped result over the original, 0-1 continuous. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcKaleidaTile`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcKaleidaTile` → [`HgcKaleidaTile.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcKaleidaTile.metal)

```metal
//Metal1.0     
//LEN=0000000349
[[ visible ]] FragmentOut HgcKaleidaTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.7500000000, 0.5000000000, 0.2500000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r1.x = dot(r0.xy, hg_Params[2].xy);
    r1.y = dot(r0.xy, hg_Params[2].zw);
    r1.xy = r1.xy + c0.xx;
    r1.xy = fract(r1.xy);
    r1.xy = r1.xy - c0.yy;
    r1.xy = fabs(r1.xy) - c0.zz;
    r0.xy = r1.xx*hg_Params[1].xy;
    r0.xy = r1.yy*hg_Params[1].zw + r0.xy;
    r0.xy = r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEKaleidaTile canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEKaleidaTile`

```asm
000000000003e0b0	mov	w4, #0x1
000000000003e0b4	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000003e0b8	add	x8, sp, #0x40
000000000003e0bc	sub	x2, x29, #0x80
000000000003e0c0	mov	x0, x21
000000000003e0c4	mov	x3, x20
000000000003e0c8	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
000000000003e0cc	ldr	q0, [sp, #0x40]
000000000003e0d0	stur	q0, [x29, #-0x80]
000000000003e0d4	ldr	x4, [x22]
000000000003e0d8	sub	x2, x29, #0x88
000000000003e0dc	mov	x0, x23
000000000003e0e0	mov	w3, #0x2
000000000003e0e4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003e0e8	ldr	x4, [x22]
000000000003e0ec	sub	x2, x29, #0x90
000000000003e0f0	mov	x0, x23
000000000003e0f4	mov	w3, #0x3
000000000003e0f8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003e0fc	ldr	x4, [x22]
000000000003e100	sub	x2, x29, #0x98
000000000003e104	mov	x0, x23
000000000003e108	mov	w3, #0x4
000000000003e10c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000003e110	cbz	x20, 0x3e138
000000000003e114	add	x8, sp, #0xc0
000000000003e118	mov	x0, x20
000000000003e11c	bl	_objc_msgSend$imageInfo
000000000003e120	ldr	x8, [sp, #0xe8]
000000000003e124	cbz	x8, 0x3e148
000000000003e128	ldur	d0, [x29, #-0x98]
000000000003e12c	fneg	d0, d0
000000000003e130	stur	d0, [x29, #-0x98]
000000000003e134	b	0x3e148
000000000003e138	str	xzr, [sp, #0x100]
000000000003e13c	movi.2d	v0, #0000000000000000
000000000003e140	stp	q0, q0, [sp, #0xe0]
000000000003e144	stp	q0, q0, [sp, #0xc0]
000000000003e148	ldr	x2, [x22]
000000000003e14c	mov	x0, x21
000000000003e150	bl	"_objc_msgSend$getRenderMode:"
000000000003e154	mov	x23, x0
000000000003e158	mov	x0, x20
000000000003e15c	bl	_objc_msgSend$imageType
000000000003e160	cmp	w23, #0x0
000000000003e164	ccmp	x0, #0x3, #0x0, ne
000000000003e168	cset	w23, eq
000000000003e16c	b.ne	0x3e448
000000000003e170	add	x8, sp, #0x40
000000000003e174	mov	x0, x21
000000000003e178	mov	x2, x19
000000000003e17c	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000003e180	ldr	d0, [sp, #0x40]
000000000003e184	ldr	d1, [sp, #0x68]
000000000003e188	fabs	d0, d0
000000000003e18c	fabs	d1, d1
000000000003e190	ldur	d2, [x29, #-0x88]
000000000003e194	fmul	d10, d0, d2
000000000003e198	ldur	d0, [x29, #-0x90]
000000000003e19c	fmul	d11, d1, d0
000000000003e1a0	stp	d11, d10, [x29, #-0x90]
000000000003e1a4	ldr	x8, [x22, #0x10]
000000000003e1a8	cbz	x8, 0x3e1cc
000000000003e1ac	adrp	x8, 842 ; 0x388000
000000000003e1b0	ldr	x8, [x8, #0xfc8] ; literal pool symbol address: _OBJC_IVAR_$_PAESharedDefaultBase._upscalesFields
000000000003e1b4	ldrsw	x8, [x8]
000000000003e1b8	ldrb	w8, [x21, x8]
000000000003e1bc	tbnz	w8, #0x0, 0x3e1cc
000000000003e1c0	fadd	d10, d10, d10
000000000003e1c4	fadd	d11, d11, d11
000000000003e1c8	stp	d11, d10, [x29, #-0x90]
000000000003e1cc	fmov	d0, #8.00000000
000000000003e1d0	fcmp	d10, d0
000000000003e1d4	b.pl	0x3e1e4
000000000003e1d8	mov	x8, #0x4020000000000000
000000000003e1dc	stur	x8, [x29, #-0x88]
000000000003e1e0	fmov	d10, #8.00000000
000000000003e1e4	fcmp	d11, d0
000000000003e1e8	b.pl	0x3e1f8
000000000003e1ec	mov	x8, #0x4020000000000000
000000000003e1f0	stur	x8, [x29, #-0x90]
000000000003e1f4	fmov	d11, #8.00000000
000000000003e1f8	ldur	d0, [x29, #-0x98]
000000000003e1fc	bl	0x25205c ; symbol stub for: ___sincos_stret
000000000003e200	mov.16b	v8, v0
000000000003e204	mov.16b	v9, v1
000000000003e208	add	x8, sp, #0x30
000000000003e20c	mov	x0, x21
000000000003e210	mov	x2, x20
000000000003e214	bl	"_objc_msgSend$getScaleForImage:"
000000000003e218	add	x8, sp, #0x20
000000000003e21c	mov	x0, x21
000000000003e220	mov	x2, x20
000000000003e224	bl	"_objc_msgSend$getImageBoundary:"
000000000003e228	ldp	q0, q2, [sp, #0x20]
000000000003e22c	fcvtn	v1.2s, v2.2d
000000000003e230	fcvtn2	v1.4s, v2.2d
000000000003e234	fmul.4s	v0, v0, v1
000000000003e238	str	q0, [sp, #0x20]
000000000003e23c	mov	w0, #0x200
000000000003e240	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003e244	mov	x22, x0
000000000003e248	bl	__ZN12HKaleidaTileC1Ev
000000000003e24c	cbz	x20, 0x3e264
000000000003e250	add	x8, sp, #0x10
000000000003e254	mov	x0, x20
000000000003e258	bl	_objc_msgSend$heliumRef
000000000003e25c	ldr	x2, [sp, #0x10]
000000000003e260	b	0x3e26c
000000000003e264	mov	x2, #0x0
000000000003e268	str	xzr, [sp, #0x10]
000000000003e26c	ldr	x8, [x22]
000000000003e270	ldr	x8, [x8, #0x78]
000000000003e274	mov	x0, x22
000000000003e278	mov	w1, #0x0
000000000003e27c	blr	x8
000000000003e280	ldr	x0, [sp, #0x10]
000000000003e284	cbz	x0, 0x3e294
000000000003e288	ldr	x8, [x0]
000000000003e28c	ldr	x8, [x8, #0x18]
000000000003e290	blr	x8
000000000003e294	ldp	s0, s1, [sp, #0x20]
000000000003e298	ldp	s2, s3, [sp, #0x28]
000000000003e29c	fadd	s2, s0, s2
000000000003e2a0	fadd	s3, s1, s3
000000000003e2a4	add	x0, sp, #0x10
000000000003e2a8	bl	0x2518a0 ; symbol stub for: __ZN7HGRectf4InitEffff
000000000003e2ac	add	x1, sp, #0x10
000000000003e2b0	mov	x0, x22
000000000003e2b4	bl	__ZN12HKaleidaTile7SetRectERK7HGRectf
000000000003e2b8	ldp	d0, d1, [x29, #-0x80]
000000000003e2bc	fcvt	s0, d0
000000000003e2c0	fcvt	s1, d1
000000000003e2c4	ldr	x8, [x22]
000000000003e2c8	ldr	x8, [x8, #0x60]
000000000003e2cc	movi.2d	v2, #0000000000000000
000000000003e2d0	movi.2d	v3, #0000000000000000
000000000003e2d4	mov	x0, x22
000000000003e2d8	mov	w1, #0x0
000000000003e2dc	blr	x8
000000000003e2e0	fadd	d0, d10, d10
000000000003e2e4	fcvt	s12, d0
000000000003e2e8	fadd	d0, d11, d11
000000000003e2ec	fcvt	s10, d0
000000000003e2f0	fcvt	s9, d9
000000000003e2f4	fcvt	s8, d8
000000000003e2f8	fneg	s11, s8
000000000003e2fc	fmul	s0, s12, s9
000000000003e300	fmul	s1, s12, s11
000000000003e304	fmul	s2, s10, s8
000000000003e308	fmul	s3, s10, s9
000000000003e30c	ldr	x8, [x22]
000000000003e310	ldr	x8, [x8, #0x60]
000000000003e314	mov	x0, x22
000000000003e318	mov	w1, #0x1
000000000003e31c	blr	x8
000000000003e320	fdiv	s0, s9, s12
000000000003e324	fdiv	s1, s8, s12
000000000003e328	fdiv	s2, s11, s10
000000000003e32c	ldr	x8, [x22]
000000000003e330	ldr	x8, [x8, #0x60]
000000000003e334	fdiv	s3, s9, s10
000000000003e338	mov	x0, x22
000000000003e33c	mov	w1, #0x2
000000000003e340	blr	x8
000000000003e344	mov	x0, x20
000000000003e348	bl	_objc_msgSend$width
000000000003e34c	mov	x24, x0
000000000003e350	mov	x0, x20
000000000003e354	bl	_objc_msgSend$height
000000000003e358	ucvtf	d2, x24, #0x1
000000000003e35c	fmov	d1, #-0.50000000
000000000003e360	fadd	d0, d2, d1
000000000003e364	fcvt	s0, d0
000000000003e368	ucvtf	d3, x0, #0x1
000000000003e36c	fadd	d1, d3, d1
000000000003e370	fcvt	s1, d1
000000000003e374	fmov	d4, #0.50000000
000000000003e378	fsub	d2, d4, d2
000000000003e37c	fcvt	s2, d2
000000000003e380	fsub	d3, d4, d3
000000000003e384	fcvt	s3, d3
000000000003e388	ldr	x8, [x22]
000000000003e38c	ldr	x8, [x8, #0x60]
000000000003e390	mov	x0, x22
000000000003e394	mov	w1, #0x3
000000000003e398	blr	x8
000000000003e39c	ldp	d1, d0, [x29, #-0x90]
000000000003e3a0	fcvt	s0, d0
000000000003e3a4	fcvt	s1, d1
000000000003e3a8	ldur	d2, [x29, #-0x98]
000000000003e3ac	fcvt	s2, d2
000000000003e3b0	ldr	x8, [x22]
000000000003e3b4	ldr	x8, [x8, #0x60]
000000000003e3b8	movi.2d	v3, #0000000000000000
000000000003e3bc	mov	x0, x22
000000000003e3c0	mov	w1, #0x4
000000000003e3c4	blr	x8
000000000003e3c8	str	x22, [sp, #0x8]
000000000003e3cc	ldr	x8, [x22]
000000000003e3d0	ldr	x8, [x8, #0x10]
000000000003e3d4	mov	x0, x22
000000000003e3d8	blr	x8
000000000003e3dc	add	x2, sp, #0x8
000000000003e3e0	mov	x0, x21
000000000003e3e4	mov	x3, x20
000000000003e3e8	mov	x4, x19
000000000003e3ec	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000003e3f0	str	x22, [sp]
000000000003e3f4	ldr	x8, [x22]
000000000003e3f8	ldr	x8, [x8, #0x10]
000000000003e3fc	mov	x0, x22
000000000003e400	blr	x8
000000000003e404	mov	x2, sp
000000000003e408	mov	x0, x19
000000000003e40c	bl	"_objc_msgSend$setHeliumRef:"
000000000003e410	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  parm4 (float)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
```
