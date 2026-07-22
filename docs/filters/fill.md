# Fill

- **PAE class:** `Fill`
- **Plugin UUID:** `47D6B897-5749-4A6A-B93B-00FABCF72B25`
- **Node names in corpus:** Fill (1224), Fill 1 (31), Fill copy (27), Fill 2 (27), Fill 3 (12), Shade (6)
- **Corpus usage:** 531 files, 1351 instances

## What it does

Fill replaces every visible pixel's RGB with a single solid Color (or a gradient, unused by the shipping transitions) while preserving the layer's alpha, so it recolors the shape without painting over the transparent surround. Blended by Mix, it is used to flat-color a layer that a downstream keyer or wipe then reveals. Verified faithful to FCP's HgcFillColor shader (recolor + re-premultiply by original alpha).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Fill With | enum(int) | 0 | 0 .. 1 | Mode: 0 = solid Color, 1 = Gradient. The shipping transitions always use Color mode. |
| Color | color | - | - | The solid fill color (nested Red/Green/Blue 0-1 floats) applied to every visible pixel when Fill With = Color. *(keyframed in 6 instances)* |
| Gradient | group | - | - | Gradient definition (RGB stops, Opacity, Start/End points, Type) used when Fill With = Gradient. Empty in the corpus templates. |
| Mix | float | 1 | 0 .. 1 | Blend of the fill toward the original per channel: out.rgb = input + (fill - input) * Mix. 0 = untouched, 1 = fully the fill color. Continuous. *(keyframed in 30 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/fill.ts`](../../engine/src/compositor/filters/fill.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcFillColor`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcFillColor` → [`HgcFillColor.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcFillColor.metal)

```metal
//Metal1.0     
//LEN=00000001a3
[[ visible ]] FragmentOut HgcFillColor_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.xyz = hg_Params[0].xyz;
    r1.w = c0.w;
    r1 = mix(r0, r1, hg_Params[1]);
    output.color0 = r1*r0.wwww;
    return output;
}
```

### CPU parameter wiring — `-[PAEFill canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEFill`

```asm
000000000006cad0	mov	w3, #0x1
000000000006cad4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000006cad8	ldr	x2, [x21]
000000000006cadc	mov	x0, x25
000000000006cae0	bl	"_objc_msgSend$getRenderMode:"
000000000006cae4	mov	x25, x0
000000000006cae8	ldr	x2, [x21]
000000000006caec	mov	x0, x19
000000000006caf0	bl	"_objc_msgSend$mixAmountAtTime:"
000000000006caf4	cbz	w25, 0x6cb20
000000000006caf8	mov.16b	v8, v0
000000000006cafc	mov	x0, x23
000000000006cb00	bl	_objc_msgSend$imageType
000000000006cb04	cmp	x0, #0x3
000000000006cb08	b.ne	0x6cb20
000000000006cb0c	cbz	x23, 0x6cb50
000000000006cb10	sub	x8, x29, #0x90
000000000006cb14	mov	x0, x23
000000000006cb18	bl	_objc_msgSend$heliumRef
000000000006cb1c	b	0x6cb54
000000000006cb20	mov	w0, #0x0
000000000006cb24	ldp	x29, x30, [sp, #0x1d0]
000000000006cb28	ldp	x20, x19, [sp, #0x1c0]
000000000006cb2c	ldp	x22, x21, [sp, #0x1b0]
000000000006cb30	ldp	x24, x23, [sp, #0x1a0]
000000000006cb34	ldp	x26, x25, [sp, #0x190]
000000000006cb38	ldp	x28, x27, [sp, #0x180]
000000000006cb3c	ldp	d9, d8, [sp, #0x170]
000000000006cb40	ldp	d11, d10, [sp, #0x160]
000000000006cb44	ldp	d13, d12, [sp, #0x150]
000000000006cb48	add	sp, sp, #0x1e0
000000000006cb4c	ret
000000000006cb50	stur	xzr, [x29, #-0x90]
000000000006cb54	ldur	w8, [x29, #-0x84]
000000000006cb58	cbz	w8, 0x6ccbc
000000000006cb5c	add	x8, sp, #0xb0
000000000006cb60	mov	x9, #0x3ff0000000000000
000000000006cb64	str	x9, [sp, #0x128]
000000000006cb68	str	x9, [sp, #0x100]
000000000006cb6c	str	x9, [sp, #0xd8]
000000000006cb70	str	x9, [sp, #0xb0]
000000000006cb74	movi.2d	v0, #0000000000000000
000000000006cb78	stur	q0, [x8, #0x8]
000000000006cb7c	stur	q0, [x8, #0x18]
000000000006cb80	stp	q0, q0, [sp, #0xe0]
000000000006cb84	stur	q0, [x8, #0x58]
000000000006cb88	stur	q0, [x8, #0x68]
000000000006cb8c	add	x19, sp, #0x30
000000000006cb90	add	x8, sp, #0x30
000000000006cb94	mov	x0, x24
000000000006cb98	bl	_objc_msgSend$inversePixelTransform
000000000006cb9c	mov	x8, #0x0
000000000006cba0	add	x9, sp, #0xb0
000000000006cba4	add	x10, x9, x8
000000000006cba8	add	x11, x19, x8
000000000006cbac	ldp	q0, q1, [x11]
000000000006cbb0	stp	q0, q1, [x10]
000000000006cbb4	add	x8, x8, #0x20
000000000006cbb8	cmp	x8, #0x80
000000000006cbbc	b.ne	0x6cba4
000000000006cbc0	mov	w0, #0x0
000000000006cbc4	mov	w1, #0x0
000000000006cbc8	mov	w2, #0x400
000000000006cbcc	mov	w3, #0x1
000000000006cbd0	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000006cbd4	mov	x23, x0
000000000006cbd8	mov	x24, x1
000000000006cbdc	mov	w0, #0x80
000000000006cbe0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006cbe4	mov	x19, x0
000000000006cbe8	mov	x1, x23
000000000006cbec	mov	x2, x24
000000000006cbf0	mov	w3, #0x1c
000000000006cbf4	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
000000000006cbf8	ldr	x2, [x19, #0x50]
000000000006cbfc	ldr	x6, [x21]
000000000006cc00	mov	x0, x22
000000000006cc04	mov	w3, #0x400
000000000006cc08	mov	w4, #0x4
000000000006cc0c	mov	w5, #0x3
000000000006cc10	bl	"_objc_msgSend$getGradientSamples:numSamples:depth:fromParm:atFxTime:"
000000000006cc14	ldr	x8, [x21]
000000000006cc18	str	x8, [sp]
000000000006cc1c	add	x2, sp, #0x30
000000000006cc20	sub	x3, x29, #0x98
000000000006cc24	sub	x4, x29, #0xa0
000000000006cc28	add	x5, sp, #0x28
000000000006cc2c	add	x6, sp, #0x24
000000000006cc30	mov	x0, x22
000000000006cc34	mov	w7, #0x3
000000000006cc38	bl	"_objc_msgSend$getGradientStartEnd:startY:endX:endY:type:fromParm:atFxTime:"
000000000006cc3c	mov	x0, x20
000000000006cc40	bl	_objc_msgSend$pixelAspect
000000000006cc44	mov.16b	v9, v0
000000000006cc48	ldp	d10, d13, [x29, #-0xa0]
000000000006cc4c	ldp	d11, d12, [sp, #0x28]
000000000006cc50	mov	w0, #0x210
000000000006cc54	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006cc58	mov	x21, x0
000000000006cc5c	bl	0x250ebc ; symbol stub for: __ZN10HGGradientC1Ev
000000000006cc60	ldr	w8, [sp, #0x24]
000000000006cc64	cbz	w8, 0x6cd9c
000000000006cc68	mov	x0, x21
000000000006cc6c	mov	w1, #0x1
000000000006cc70	bl	0x250eb0 ; symbol stub for: __ZN10HGGradient15SetGradientModeENS_12GradientModeE
000000000006cc74	fsub	d0, d10, d12
000000000006cc78	fmul	d0, d9, d0
000000000006cc7c	fsub	d1, d11, d13
000000000006cc80	fmul	d0, d0, d0
000000000006cc84	fmul	d1, d1, d1
000000000006cc88	fadd	d0, d0, d1
000000000006cc8c	fsqrt	d0, d0
000000000006cc90	fcvt	s0, d0
000000000006cc94	fabs	s0, s0
000000000006cc98	ldr	x8, [x21]
000000000006cc9c	ldr	x8, [x8, #0x60]
000000000006cca0	movi.2d	v1, #0000000000000000
000000000006cca4	movi.2d	v2, #0000000000000000
000000000006cca8	movi.2d	v3, #0000000000000000
000000000006ccac	mov	x0, x21
000000000006ccb0	mov	w1, #0x2
000000000006ccb4	blr	x8
000000000006ccb8	b	0x6cdd4
000000000006ccbc	ldr	x6, [x21]
000000000006ccc0	add	x2, sp, #0xb0
000000000006ccc4	add	x3, sp, #0x30
000000000006ccc8	sub	x4, x29, #0x98
000000000006cccc	mov	x0, x19
000000000006ccd0	mov	w5, #0x2
000000000006ccd4	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000006ccd8	mov	w0, #0x1a0
000000000006ccdc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006cce0	mov	x19, x0
000000000006cce4	bl	__ZN12HgcFillColorC1Ev
000000000006cce8	ldur	x2, [x29, #-0x90]
000000000006ccec	ldr	x8, [x19]
000000000006ccf0	ldr	x8, [x8, #0x78]
000000000006ccf4	mov	x0, x19
000000000006ccf8	mov	w1, #0x0
000000000006ccfc	blr	x8
000000000006cd00	ldr	d0, [sp, #0xb0]
000000000006cd04	fcvt	s0, d0
000000000006cd08	ldr	d1, [sp, #0x30]
000000000006cd0c	fcvt	s1, d1
000000000006cd10	ldur	d2, [x29, #-0x98]
000000000006cd14	fcvt	s2, d2
000000000006cd18	ldr	x8, [x19]
000000000006cd1c	ldr	x8, [x8, #0x60]
000000000006cd20	movi.2d	v3, #0000000000000000
000000000006cd24	mov	x0, x19
000000000006cd28	mov	w1, #0x0
000000000006cd2c	blr	x8
000000000006cd30	fcvt	s0, d8
000000000006cd34	ldr	x8, [x19]
000000000006cd38	ldr	x8, [x8, #0x60]
000000000006cd3c	movi.2d	v1, #0000000000000000
000000000006cd40	movi.2d	v2, #0000000000000000
000000000006cd44	movi.2d	v3, #0000000000000000
000000000006cd48	mov	x0, x19
000000000006cd4c	mov	w1, #0x1
000000000006cd50	blr	x8
000000000006cd54	stur	x19, [x29, #-0xa0]
000000000006cd58	ldr	x8, [x19]
000000000006cd5c	ldr	x8, [x8, #0x10]
000000000006cd60	mov	x0, x19
000000000006cd64	blr	x8
000000000006cd68	sub	x2, x29, #0xa0
000000000006cd6c	mov	x0, x20
000000000006cd70	bl	"_objc_msgSend$setHeliumRef:"
000000000006cd74	ldur	x0, [x29, #-0xa0]
000000000006cd78	cbz	x0, 0x6cd88
000000000006cd7c	ldr	x8, [x0]
000000000006cd80	ldr	x8, [x8, #0x18]
000000000006cd84	blr	x8
000000000006cd88	ldr	x8, [x19]
000000000006cd8c	ldr	x8, [x8, #0x18]
000000000006cd90	mov	x0, x19
000000000006cd94	blr	x8
000000000006cd98	b	0x6d08c
000000000006cd9c	mov	x0, x21
000000000006cda0	mov	w1, #0x0
000000000006cda4	bl	0x250eb0 ; symbol stub for: __ZN10HGGradient15SetGradientModeENS_12GradientModeE
000000000006cda8	ldur	d0, [x29, #-0xa0]
000000000006cdac	fcvt	s0, d0
000000000006cdb0	ldr	d1, [sp, #0x28]
000000000006cdb4	fcvt	s1, d1
000000000006cdb8	ldr	x8, [x21]
000000000006cdbc	ldr	x8, [x8, #0x60]
000000000006cdc0	movi.2d	v2, #0000000000000000
000000000006cdc4	movi.2d	v3, #0000000000000000
000000000006cdc8	mov	x0, x21
000000000006cdcc	mov	w1, #0x2
000000000006cdd0	blr	x8
000000000006cdd4	fcvt	s0, d9
000000000006cdd8	ldr	x8, [x21]
000000000006cddc	ldr	x8, [x8, #0x60]
000000000006cde0	fmov	s1, #1.00000000
000000000006cde4	fmov	s2, #1.00000000
000000000006cde8	fmov	s3, #1.00000000
000000000006cdec	mov	x0, x21
000000000006cdf0	mov	w1, #0x0
000000000006cdf4	blr	x8
000000000006cdf8	ldr	d0, [sp, #0x30]
000000000006cdfc	fcvt	s0, d0
000000000006ce00	ldur	d1, [x29, #-0x98]
000000000006ce04	fcvt	s1, d1
000000000006ce08	ldr	x8, [x21]
000000000006ce0c	ldr	x8, [x8, #0x60]
000000000006ce10	movi.2d	v2, #0000000000000000
000000000006ce14	movi.2d	v3, #0000000000000000
000000000006ce18	mov	x0, x21
000000000006ce1c	mov	w1, #0x1
000000000006ce20	blr	x8
000000000006ce24	ldp	d0, d1, [sp, #0xb0]
000000000006ce28	fcvt	s0, d0
000000000006ce2c	fcvt	s1, d1
000000000006ce30	ldr	d2, [sp, #0xc8]
000000000006ce34	fcvt	s3, d2
000000000006ce38	ldr	x8, [x21]
000000000006ce3c	ldr	x8, [x8, #0x60]
000000000006ce40	movi.2d	v2, #0000000000000000
000000000006ce44	mov	x0, x21
000000000006ce48	mov	w1, #0x3
000000000006ce4c	blr	x8
000000000006ce50	ldp	d0, d1, [sp, #0xd0]
000000000006ce54	fcvt	s0, d0
000000000006ce58	fcvt	s1, d1
000000000006ce5c	ldr	d2, [sp, #0xe8]
000000000006ce60	fcvt	s3, d2
000000000006ce64	ldr	x8, [x21]
000000000006ce68	ldr	x8, [x8, #0x60]
000000000006ce6c	movi.2d	v2, #0000000000000000
000000000006ce70	mov	x0, x21
000000000006ce74	mov	w1, #0x4
000000000006ce78	blr	x8
000000000006ce7c	ldp	d0, d1, [sp, #0x110]
000000000006ce80	fcvt	s0, d0
000000000006ce84	fcvt	s1, d1
000000000006ce88	ldr	d2, [sp, #0x128]
000000000006ce8c	fcvt	s3, d2
000000000006ce90	ldr	x8, [x21]
000000000006ce94	ldr	x8, [x8, #0x60]
000000000006ce98	movi.2d	v2, #0000000000000000
000000000006ce9c	mov	x0, x21
000000000006cea0	mov	w1, #0x5
000000000006cea4	blr	x8
000000000006cea8	mov	x8, #0x0
000000000006ceac	ldr	x9, [x19, #0x50]
000000000006ceb0	add	x10, x9, #0x4
000000000006ceb4	add	x11, x9, x8, lsl #4
000000000006ceb8	ldr	s0, [x11]
000000000006cebc	mov	w12, #0x3
000000000006cec0	mov	x13, x10
000000000006cec4	ldr	s1, [x13]
000000000006cec8	stur	s1, [x13, #-0x4]
000000000006cecc	add	x13, x13, #0x4
000000000006ced0	subs	x12, x12, #0x1
000000000006ced4	b.ne	0x6cec4
000000000006ced8	str	s0, [x11, #0xc]
000000000006cedc	add	x8, x8, #0x1
000000000006cee0	add	x10, x10, #0x10
000000000006cee4	cmp	x8, #0x400
000000000006cee8	b.ne	0x6ceb4
000000000006ceec	mov	w0, #0x1f0
000000000006cef0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006cef4	mov	x22, x0
000000000006cef8	mov	x1, x19
000000000006cefc	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
000000000006cf00	ldr	x8, [x21]
000000000006cf04	ldr	x8, [x8, #0x78]
000000000006cf08	mov	x0, x21
000000000006cf0c	mov	w1, #0x0
000000000006cf10	mov	x2, x22
000000000006cf14	blr	x8
000000000006cf18	str	x21, [sp, #0x10]
000000000006cf1c	ldr	x8, [x21]
000000000006cf20	ldr	x8, [x8, #0x10]
000000000006cf24	mov	x0, x21
000000000006cf28	blr	x8
000000000006cf2c	add	x8, sp, #0x18
000000000006cf30	sub	x0, x29, #0x90
000000000006cf34	add	x1, sp, #0x10
000000000006cf38	bl	0x250e50 ; symbol stub for: __Z27FxApplyGradientBlendRequestRK5HGRefI6HGNodeES3_
000000000006cf3c	ldr	x0, [sp, #0x10]
000000000006cf40	cbz	x0, 0x6cf50
000000000006cf44	ldr	x8, [x0]
000000000006cf48	ldr	x8, [x8, #0x18]
000000000006cf4c	blr	x8
000000000006cf50	mov	w0, #0x220
000000000006cf54	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006cf58	mov	x23, x0
000000000006cf5c	bl	0x25130c ; symbol stub for: __ZN16HGHWBlendFlippedC1Ev
000000000006cf60	ldur	x2, [x29, #-0x90]
000000000006cf64	ldr	x8, [x23]
000000000006cf68	ldr	x8, [x8, #0x78]
000000000006cf6c	mov	x0, x23
000000000006cf70	mov	w1, #0x0
000000000006cf74	blr	x8
000000000006cf78	ldr	x2, [sp, #0x18]
000000000006cf7c	ldr	x8, [x23]
000000000006cf80	ldr	x8, [x8, #0x78]
000000000006cf84	mov	x0, x23
000000000006cf88	mov	w1, #0x1
000000000006cf8c	blr	x8
000000000006cf90	ldr	x8, [x23]
000000000006cf94	ldr	x8, [x8, #0x60]
000000000006cf98	fmov	s0, #8.00000000
000000000006cf9c	movi.2d	v1, #0000000000000000
000000000006cfa0	movi.2d	v2, #0000000000000000
000000000006cfa4	movi.2d	v3, #0000000000000000
000000000006cfa8	mov	x0, x23
000000000006cfac	mov	w1, #0x0
000000000006cfb0	blr	x8
000000000006cfb4	fcvt	s0, d8
000000000006cfb8	ldr	x8, [x23]
000000000006cfbc	ldr	x8, [x8, #0x60]
000000000006cfc0	movi.2d	v1, #0000000000000000
000000000006cfc4	movi.2d	v2, #0000000000000000
000000000006cfc8	movi.2d	v3, #0000000000000000
000000000006cfcc	mov	x0, x23
000000000006cfd0	mov	w1, #0x1
000000000006cfd4	blr	x8
000000000006cfd8	ldr	x8, [x23]
000000000006cfdc	ldr	x8, [x8, #0x60]
000000000006cfe0	movi.2d	v0, #0000000000000000
000000000006cfe4	movi.2d	v1, #0000000000000000
000000000006cfe8	movi.2d	v2, #0000000000000000
000000000006cfec	movi.2d	v3, #0000000000000000
000000000006cff0	mov	x0, x23
000000000006cff4	mov	w1, #0x2
000000000006cff8	blr	x8
000000000006cffc	str	x23, [sp, #0x10]
000000000006d000	ldr	x8, [x23]
000000000006d004	ldr	x8, [x8, #0x10]
000000000006d008	mov	x0, x23
000000000006d00c	blr	x8
000000000006d010	add	x2, sp, #0x10
000000000006d014	mov	x0, x20
000000000006d018	bl	"_objc_msgSend$setHeliumRef:"
000000000006d01c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (int)
    - host Mix
    - parm2 (colour)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 2  <-  parm2 (colour)
    slot 0  <-  parm2 (colour)
    slot 1  <-  host Mix
    slot 2  <-  parm2 (colour)
    slot 0  <-  host Mix
    slot 1  <-  parm2 (colour)
    slot 3  <-  parm2 (colour)
    slot 4  <-  (constant / computed)
    slot 5  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 1  <-  host Mix
    slot 2  <-  (constant / computed)
```
