# Bulge Source

- **PAE class:** `Bulge Source`
- **Plugin UUID:** `6AFD20E9-70D0-48F2-A5DD-97FC7B3E2BC4`
- **Node names in corpus:** Bulge (209), Distort 01 (10), Pointer OSC (8), Fix (1), Bulge copy (1), Effect (1)
- **Corpus usage:** 204 files, 236 instances

## What it does

Bulge (Bulge Source) pushes pixels radially outward from a center point to create a convex, lens-like magnification bump (or, with negative Scale, a concave pinch). Amount sets the pixel radius of the affected region and Scale the strength/sign of the bulge. Used for fisheye pops, magnifier, and elastic-pop transitions.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Bulge" filter. The exact radial displacement curve is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 300 | 0 .. 14712 | Radius of the bulge region in pixels (default 300). Larger = a wider area is distorted. *(keyframed in 10 instances)* |
| Center | point2D | - | - | Center of the bulge (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Scale | float | 0.5 | -1.34 .. 4.424 | Strength and sign of the bulge, roughly -1.3..4.4. Positive = convex outward bulge, negative = concave pinch, 0 = no distortion. *(keyframed in 187 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the bulged result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcBulge`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBulge` → [`HgcBulge.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBulge.metal)

```metal
//Metal1.0     
//LEN=0000000395
[[ visible ]] FragmentOut HgcBulge_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(1.000000000, -2.000000000, 3.000000000, 9.999999975e-07);
    float4 r0;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.xy*hg_Params[2].zw;
    r0.z = dot(r0.xy, r0.xy);
    r0.w = r0.z + c0.w;
    r0.w = rsqrt(r0.w);
    r0.z = r0.w*r0.z;
    r0.z = clamp(-r0.z*hg_Params[1].x + c0.x, 0.00000f, 1.00000f);
    r0.w = r0.z*c0.y + c0.z;
    r0.z = r0.z*r0.z;
    r0.z = r0.z*r0.w;
    r0.z = r0.z*hg_Params[1].y + c0.x;
    r0.xy = r0.xy*r0.zz;
    r0.xy = r0.xy*hg_Params[2].xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEBulge canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBulge`

```asm
000000000009ba10	mov	w3, #0x2
000000000009ba14	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000009ba18	ldr	d0, [sp, #0x48]
000000000009ba1c	fcmp	d0, #0.0
000000000009ba20	b.ne	0x9ba38
000000000009ba24	cbz	x20, 0x9bafc
000000000009ba28	add	x8, sp, #0x38
000000000009ba2c	mov	x0, x20
000000000009ba30	bl	_objc_msgSend$heliumRef
000000000009ba34	b	0x9bb00
000000000009ba38	add	x8, sp, #0x38
000000000009ba3c	mov	x0, x21
000000000009ba40	mov	x2, x20
000000000009ba44	bl	"_objc_msgSend$getScaleForImage:"
000000000009ba48	ldp	d9, d8, [sp, #0x38]
000000000009ba4c	mov	x24, #0x3fe0000000000000
000000000009ba50	stp	x24, x24, [sp, #0x28]
000000000009ba54	ldr	x5, [x22]
000000000009ba58	add	x2, sp, #0x30
000000000009ba5c	add	x3, sp, #0x28
000000000009ba60	mov	x0, x23
000000000009ba64	mov	w4, #0x1
000000000009ba68	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000009ba6c	mov	x0, x20
000000000009ba70	bl	_objc_msgSend$width
000000000009ba74	ucvtf	d0, x0
000000000009ba78	ldr	d1, [sp, #0x30]
000000000009ba7c	fmul	d0, d1, d0
000000000009ba80	str	d0, [sp, #0x30]
000000000009ba84	mov	x0, x20
000000000009ba88	bl	_objc_msgSend$height
000000000009ba8c	ucvtf	d0, x0
000000000009ba90	ldr	d1, [sp, #0x28]
000000000009ba94	fmul	d0, d1, d0
000000000009ba98	str	d0, [sp, #0x28]
000000000009ba9c	str	x24, [sp, #0x20]
000000000009baa0	ldr	x4, [x22]
000000000009baa4	add	x2, sp, #0x20
000000000009baa8	mov	x0, x23
000000000009baac	mov	w3, #0x3
000000000009bab0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000009bab4	ldr	x4, [x22]
000000000009bab8	add	x2, sp, #0x1f
000000000009babc	mov	x0, x23
000000000009bac0	mov	w3, #0x4
000000000009bac4	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000009bac8	ldr	x2, [x22]
000000000009bacc	mov	x0, x21
000000000009bad0	bl	"_objc_msgSend$getRenderMode:"
000000000009bad4	cbz	w0, 0x9bb24
000000000009bad8	mov	x0, x20
000000000009badc	bl	_objc_msgSend$imageType
000000000009bae0	cmp	x0, #0x3
000000000009bae4	b.ne	0x9bb44
000000000009bae8	cbz	x20, 0x9bb4c
000000000009baec	add	x8, sp, #0x10
000000000009baf0	mov	x0, x20
000000000009baf4	bl	_objc_msgSend$heliumRef
000000000009baf8	b	0x9bb50
000000000009bafc	str	xzr, [sp, #0x38]
000000000009bb00	add	x2, sp, #0x38
000000000009bb04	mov	x0, x19
000000000009bb08	bl	"_objc_msgSend$setHeliumRef:"
000000000009bb0c	ldr	x0, [sp, #0x38]
000000000009bb10	cbz	x0, 0x9bb20
000000000009bb14	ldr	x8, [x0]
000000000009bb18	ldr	x8, [x8, #0x18]
000000000009bb1c	blr	x8
000000000009bb20	mov	w0, #0x1
000000000009bb24	ldp	x29, x30, [sp, #0xa0]
000000000009bb28	ldp	x20, x19, [sp, #0x90]
000000000009bb2c	ldp	x22, x21, [sp, #0x80]
000000000009bb30	ldp	x24, x23, [sp, #0x70]
000000000009bb34	ldp	d9, d8, [sp, #0x60]
000000000009bb38	ldp	d11, d10, [sp, #0x50]
000000000009bb3c	add	sp, sp, #0xb0
000000000009bb40	ret
000000000009bb44	mov	w0, #0x0
000000000009bb48	b	0x9bb24
000000000009bb4c	str	xzr, [sp, #0x10]
000000000009bb50	ldrb	w8, [sp, #0x1f]
000000000009bb54	cmp	w8, #0x1
000000000009bb58	b.ne	0x9bbdc
000000000009bb5c	ldr	x0, [sp, #0x10]
000000000009bb60	str	x0, [sp]
000000000009bb64	cbz	x0, 0x9bb74
000000000009bb68	ldr	x8, [x0]
000000000009bb6c	ldr	x8, [x8, #0x10]
000000000009bb70	blr	x8
000000000009bb74	add	x8, sp, #0x8
000000000009bb78	mov	x2, sp
000000000009bb7c	mov	x0, x21
000000000009bb80	mov	x3, x20
000000000009bb84	mov	x4, x20
000000000009bb88	bl	"_objc_msgSend$smear:fromImage:toImage:"
000000000009bb8c	ldp	x0, x8, [sp, #0x8]
000000000009bb90	cmp	x8, x0
000000000009bb94	b.eq	0x9bbb8
000000000009bb98	cbz	x8, 0x9bbb0
000000000009bb9c	ldr	x9, [x8]
000000000009bba0	ldr	x9, [x9, #0x18]
000000000009bba4	mov	x0, x8
000000000009bba8	blr	x9
000000000009bbac	ldr	x0, [sp, #0x8]
000000000009bbb0	stp	xzr, x0, [sp, #0x8]
000000000009bbb4	b	0x9bbc8
000000000009bbb8	cbz	x8, 0x9bbc8
000000000009bbbc	ldr	x8, [x0]
000000000009bbc0	ldr	x8, [x8, #0x18]
000000000009bbc4	blr	x8
000000000009bbc8	ldr	x0, [sp]
000000000009bbcc	cbz	x0, 0x9bbdc
000000000009bbd0	ldr	x8, [x0]
000000000009bbd4	ldr	x8, [x8, #0x18]
000000000009bbd8	blr	x8
000000000009bbdc	mov	w0, #0x1a0
000000000009bbe0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000009bbe4	mov	x22, x0
000000000009bbe8	bl	__ZN8HgcBulgeC2Ev
000000000009bbec	adrp	x8, 758 ; 0x391000
000000000009bbf0	add	x8, x8, #0x858
000000000009bbf4	add	x8, x8, #0x10
000000000009bbf8	str	x8, [x22]
000000000009bbfc	mov	x0, x19
000000000009bc00	bl	_objc_msgSend$width
000000000009bc04	mov	x23, x0
000000000009bc08	mov	x0, x19
000000000009bc0c	bl	_objc_msgSend$height
000000000009bc10	mov	x24, x0
000000000009bc14	ldr	x2, [sp, #0x10]
000000000009bc18	ldr	x8, [x22]
000000000009bc1c	ldr	x8, [x8, #0x78]
000000000009bc20	mov	x0, x22
000000000009bc24	mov	w1, #0x0
000000000009bc28	blr	x8
000000000009bc2c	ucvtf	d0, x23, #0x1
000000000009bc30	ucvtf	d1, x24
000000000009bc34	fmov	d2, #-0.50000000
000000000009bc38	fmul	d1, d1, d2
000000000009bc3c	ldp	d2, d3, [sp, #0x28]
000000000009bc40	fsub	d0, d3, d0
000000000009bc44	fcvt	s0, d0
000000000009bc48	fadd	d1, d2, d1
000000000009bc4c	fcvt	s1, d1
000000000009bc50	ldr	x8, [x22]
000000000009bc54	ldr	x8, [x8, #0x60]
000000000009bc58	movi.2d	v2, #0000000000000000
000000000009bc5c	movi.2d	v3, #0000000000000000
000000000009bc60	mov	x0, x22
000000000009bc64	mov	w1, #0x0
000000000009bc68	blr	x8
000000000009bc6c	ldr	d0, [sp, #0x48]
000000000009bc70	adrp	x8, 461 ; 0x268000
000000000009bc74	ldr	d1, [x8, #0xc58]
000000000009bc78	fadd	d0, d0, d1
000000000009bc7c	fmov	d10, #1.00000000
000000000009bc80	fdiv	d0, d10, d0
000000000009bc84	fcvt	s0, d0
000000000009bc88	ldr	d1, [sp, #0x20]
000000000009bc8c	fmov	d2, #-1.00000000
000000000009bc90	fadd	d1, d1, d2
000000000009bc94	fcvt	s1, d1
000000000009bc98	ldr	x8, [x22]
000000000009bc9c	ldr	x8, [x8, #0x60]
000000000009bca0	movi.2d	v2, #0000000000000000
000000000009bca4	movi.2d	v3, #0000000000000000
000000000009bca8	mov	x0, x22
000000000009bcac	mov	w1, #0x1
000000000009bcb0	blr	x8
000000000009bcb4	fcvt	s0, d9
000000000009bcb8	fcvt	s1, d8
000000000009bcbc	fdiv	d2, d10, d9
000000000009bcc0	fcvt	s2, d2
000000000009bcc4	fdiv	d3, d10, d8
000000000009bcc8	fcvt	s3, d3
000000000009bccc	ldr	x8, [x22]
000000000009bcd0	ldr	x8, [x8, #0x60]
000000000009bcd4	mov	x0, x22
000000000009bcd8	mov	w1, #0x2
000000000009bcdc	blr	x8
000000000009bce0	mov	w0, #0x1a0
000000000009bce4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000009bce8	mov	x23, x0
000000000009bcec	bl	0x250f34 ; symbol stub for: __ZN11HGOverwriteC1Ev
000000000009bcf0	ldr	x2, [sp, #0x10]
000000000009bcf4	ldr	x8, [x23]
000000000009bcf8	ldr	x8, [x8, #0x78]
000000000009bcfc	mov	x0, x23
000000000009bd00	mov	w1, #0x0
000000000009bd04	blr	x8
000000000009bd08	ldr	x8, [x23]
000000000009bd0c	ldr	x8, [x8, #0x78]
000000000009bd10	mov	x0, x23
000000000009bd14	mov	w1, #0x1
000000000009bd18	mov	x2, x22
000000000009bd1c	blr	x8
000000000009bd20	str	x23, [sp, #0x8]
000000000009bd24	ldr	x8, [x23]
000000000009bd28	ldr	x8, [x8, #0x10]
000000000009bd2c	mov	x0, x23
000000000009bd30	blr	x8
000000000009bd34	ldrb	w8, [sp, #0x1f]
000000000009bd38	cmp	w8, #0x1
000000000009bd3c	b.ne	0x9bd54
000000000009bd40	add	x2, sp, #0x8
000000000009bd44	mov	x0, x21
000000000009bd48	mov	x3, x20
000000000009bd4c	mov	x4, x19
000000000009bd50	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000009bd54	add	x2, sp, #0x8
000000000009bd58	mov	x0, x19
000000000009bd5c	bl	"_objc_msgSend$setHeliumRef:"
000000000009bd60	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm2 (float), parm3 (float)
    slot 1  <-  parm2 (float), parm3 (float)
    slot 2  <-  (constant / computed)
```
