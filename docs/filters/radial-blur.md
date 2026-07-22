# Radial Blur

- **PAE class:** `Radial Blur`
- **Plugin UUID:** `8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A`
- **Node names in corpus:** Radial Blur (54), Amount (13), Radial BlurLeft (1), Angle (1)
- **Corpus usage:** 49 files, 69 instances

## What it does

Radial Blur applies a rotational blur about a Center point: pixels are smeared along circular arcs, as if the camera spun during exposure. Angle is the arc of the blur sweep. Implemented in TS (shares the directional-blur module's radial mode).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of rotation the blur sweeps around (X,Y) in normalized frame coordinates. *(keyframed in 1 instance)* |
| Angle | float (radians) | 0.5236 | 0 .. 0.5236 | Arc of the rotational blur sweep in radians (default ~0.524 = 30 deg, max ~0.524 observed). Larger = a longer spin streak. *(keyframed in 25 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the spun result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 8 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/directional-blur.ts`](../../engine/src/compositor/filters/directional-blur.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPolarToRect`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPolarToRect` → [`HgcPolarToRect.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPolarToRect.metal)

```metal
//Metal1.0     
//LEN=0000000594
[[ visible ]] FragmentOut HgcPolarToRect_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[3].xy + hg_Params[2].xy;
    r1.x = r0.x*hg_Params[0].x;
    r1.y = cos(r1.x);
    r1.zw = hg_Params[2].xy + hg_Params[2].xy;
    r1.x = sin(r1.x);
    r1.xy = r0.yy*r1.xy + hg_Params[1].xy;
    r0.zw = r1.xy/r1.zw;
    r2.xy = fract(r0.zw);
    r2.xy = r1.zw*r2.xy;
    r0.xy = floor(r0.zw);
    r0.zw = r0.xy*c0.zz;
    r0.zw = floor(r0.zw);
    r0.xy = -r0.zw*c0.xx + r0.xy;
    r1.zw = r1.zw - r2.xy;
    r1.zw = mix(r2.xy, r1.zw, fabs(r0.xy));
    r0.z = abs(hg_Params[5].z);
    r1.xy = select(r1.zw, r1.xy, -r0.zz < 0.00000f);
    r0.xy = r1.zw - r1.xy;
    r0.xy = float2(c0.zz < fabs(r0.xy));
    r0.z = float(-r0.z >= c0.y);
    r0.x = fmax(r0.x, r0.y);
    r0.y = float(-r0.z >= c0.y);
    r0.x = fmin(r0.y, r0.x);
    r1.xy = select(r1.xy, r1.zw, -r0.xx < 0.00000f);
    r1.xy = r1.xy - hg_Params[2].xy;
    r1.xy = r1.xy*hg_Params[4].xy;
    r1.xy = r1.xy + hg_Params[6].xy;
    r1.xy = r1.xy*hg_Params[6].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    output.color0 = select(r1, c0.yyyy, -r0.xxxx < 0.00000f);
    return output;
}
```

### Metal fragment shader — `HgcRadialMask`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRadialMask` → [`HgcRadialMask.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRadialMask.metal)

```metal
//Metal1.0     
//LEN=00000002fe
[[ visible ]] FragmentOut HgcRadialMask_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.z = c0.z;
    r0.x = dot(hg_Params[3], texCoord1);
    r0.y = dot(hg_Params[4], texCoord1);
    r0.w = dot(hg_Params[5], texCoord1);
    r0.xy = r0.xy/r0.ww;
    r0.xyz = r0.xyz - hg_Params[1].xyz;
    r0.xyz = r0.xyz*hg_Params[0].xyz;
    r0 = float4(dot(r0.xyz, r0.xyz));
    r0 = sqrt(r0);
    r1 = hg_Params[2] - c0.xxxx;
    r1 = fmax(r1, c0.zzzz);
    r0 = clamp(r0 - r1, 0.00000f, 1.00000f);
    r1 = color0;
    output.color0 = r1*-r0 + r1;
    return output;
}
```

### Metal fragment shader — `HgcRectToPolar`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRectToPolar` → [`HgcRectToPolar.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRectToPolar.metal)

```metal
//Metal1.0     
//LEN=00000006a7
[[ visible ]] FragmentOut HgcRectToPolar_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.01348046958, 0.05747731403, 0.000000000, -0.1212390736);
    const float4 c1 = float4(0.1956359297, -0.3329946101, 0.9999956489, 1.570796371);
    const float4 c2 = float4(6.283185482, 3.141592741, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[4].xy;
    r0.zw = c0.zz;
    r0 = r0 + hg_Params[6];
    r0 = r0 - hg_Params[1];
    r1.xy = abs(r0.xy);
    r1.z = fmax(r1.x, r1.y);
    r1.w = 1.00000f / r1.z;
    r1.z = fmin(r1.x, r1.y);
    r1.z = r1.z*r1.w;
    r1.w = r1.z*r1.z;
    r2.x = r1.w*c0.x + c0.y;
    r2.x = r2.x*r1.w + c0.w;
    r2.x = r2.x*r1.w + c1.x;
    r2.x = r2.x*r1.w + c1.y;
    r1.w = r2.x*r1.w + c1.z;
    r1.z = r1.w*r1.z;
    r1.x = r1.y - r1.x;
    r1.w = -r1.z + c1.w;
    r1.x = select(r1.z, r1.w, r1.x < 0.00000f);
    r1.y = -r1.x + c2.y;
    r1.x = select(r1.x, r1.y, r0.y < 0.00000f);
    r1.x = select(r1.x, -r1.x, r0.x < 0.00000f);
    r0.x = dot(r0, r0);
    r1.y = r1.x + c2.x;
    r1.x = select(r1.x, r1.y, r1.x < 0.00000f);
    r1.x = r1.x*hg_Params[0].x;
    r1.y = float(r1.x < hg_Params[6].x);
    r0.y = select(r1.x, hg_Params[2].y, -r1.y < 0.00000f);
    r0.w = sqrt(r0.x);
    r0.z = select(r0.y, r1.x, hg_Params[3].z < 0.00000f);
    r0.xy = r0.zw - hg_Params[6].xy;
    r0.xy = r0.xy*hg_Params[5].xy;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAERadialBlur canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAERadialBlur`

```asm
00000000001089c8	mov	w3, #0x2
00000000001089cc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000001089d0	ldur	d0, [x29, #-0x78]
00000000001089d4	fcmp	d0, #0.0
00000000001089d8	b.ne	0x1089f8
00000000001089dc	cbz	x24, 0x108acc
00000000001089e0	add	x8, sp, #0x148
00000000001089e4	mov	x0, x24
00000000001089e8	bl	_objc_msgSend$heliumRef
00000000001089ec	b	0x108ad0
00000000001089f0	mov	w21, #0x0
00000000001089f4	b	0x108af4
00000000001089f8	adrp	x8, 353 ; 0x269000
00000000001089fc	ldr	d1, [x8, #0xa30]
0000000000108a00	fmul	d0, d0, d1
0000000000108a04	adrp	x8, 352 ; 0x268000
0000000000108a08	ldr	d1, [x8, #0xdd8]
0000000000108a0c	fdiv	d9, d0, d1
0000000000108a10	mov	x0, x24
0000000000108a14	bl	_objc_msgSend$width
0000000000108a18	ucvtf	d0, x0, #0x1
0000000000108a1c	fmul	d0, d9, d0
0000000000108a20	adrp	x8, 353 ; 0x269000
0000000000108a24	ldr	d1, [x8, #0x760]
0000000000108a28	fdiv	d0, d0, d1
0000000000108a2c	stur	d0, [x29, #-0x78]
0000000000108a30	mov	x8, #0x3fe0000000000000
0000000000108a34	stp	x8, x8, [x29, #-0x88]
0000000000108a38	ldr	x5, [x19]
0000000000108a3c	sub	x2, x29, #0x80
0000000000108a40	sub	x3, x29, #0x88
0000000000108a44	mov	x0, x20
0000000000108a48	mov	w4, #0x1
0000000000108a4c	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000108a50	mov	x0, x22
0000000000108a54	bl	_objc_msgSend$origin
0000000000108a58	cmp	x0, #0x2
0000000000108a5c	b.ne	0x108a70
0000000000108a60	ldur	d0, [x29, #-0x88]
0000000000108a64	fmov	d1, #1.00000000
0000000000108a68	fsub	d0, d1, d0
0000000000108a6c	stur	d0, [x29, #-0x88]
0000000000108a70	ldr	x4, [x19]
0000000000108a74	sub	x2, x29, #0x89
0000000000108a78	mov	x0, x20
0000000000108a7c	mov	w3, #0x4
0000000000108a80	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000108a84	mov	x0, x24
0000000000108a88	bl	_objc_msgSend$imageType
0000000000108a8c	mov	x20, x0
0000000000108a90	ldr	x2, [x19]
0000000000108a94	mov	x0, x25
0000000000108a98	bl	"_objc_msgSend$getRenderMode:"
0000000000108a9c	cmp	w0, #0x0
0000000000108aa0	ccmp	w20, #0x3, #0x0, ne
0000000000108aa4	cset	w21, eq
0000000000108aa8	b.ne	0x108af4
0000000000108aac	ldur	d0, [x29, #-0x78]
0000000000108ab0	fcmp	d0, #0.0
0000000000108ab4	b.ne	0x108b20
0000000000108ab8	cbz	x24, 0x108b34
0000000000108abc	add	x8, sp, #0x148
0000000000108ac0	mov	x0, x24
0000000000108ac4	bl	_objc_msgSend$heliumRef
0000000000108ac8	b	0x108b38
0000000000108acc	str	xzr, [sp, #0x148]
0000000000108ad0	add	x2, sp, #0x148
0000000000108ad4	mov	x0, x22
0000000000108ad8	bl	"_objc_msgSend$setHeliumRef:"
0000000000108adc	ldr	x0, [sp, #0x148]
0000000000108ae0	cbz	x0, 0x108af0
0000000000108ae4	ldr	x8, [x0]
0000000000108ae8	ldr	x8, [x8, #0x18]
0000000000108aec	blr	x8
0000000000108af0	mov	w21, #0x1
0000000000108af4	mov	x0, x21
0000000000108af8	add	sp, sp, #0x280
0000000000108afc	ldp	x29, x30, [sp, #0x70]
0000000000108b00	ldp	x20, x19, [sp, #0x60]
0000000000108b04	ldp	x22, x21, [sp, #0x50]
0000000000108b08	ldp	x24, x23, [sp, #0x40]
0000000000108b0c	ldp	x26, x25, [sp, #0x30]
0000000000108b10	ldp	x28, x27, [sp, #0x20]
0000000000108b14	ldp	d9, d8, [sp, #0x10]
0000000000108b18	ldp	d11, d10, [sp], #0x80
0000000000108b1c	ret
0000000000108b20	cbz	x24, 0x108b5c
0000000000108b24	sub	x8, x29, #0x98
0000000000108b28	mov	x0, x24
0000000000108b2c	bl	_objc_msgSend$heliumRef
0000000000108b30	b	0x108b60
0000000000108b34	str	xzr, [sp, #0x148]
0000000000108b38	add	x2, sp, #0x148
0000000000108b3c	mov	x0, x22
0000000000108b40	bl	"_objc_msgSend$setHeliumRef:"
0000000000108b44	ldr	x0, [sp, #0x148]
0000000000108b48	cbz	x0, 0x108af4
0000000000108b4c	ldr	x8, [x0]
0000000000108b50	ldr	x8, [x8, #0x18]
0000000000108b54	blr	x8
0000000000108b58	b	0x108af4
0000000000108b5c	stur	xzr, [x29, #-0x98]
0000000000108b60	add	x8, sp, #0x1d8
0000000000108b64	mov	x0, x25
0000000000108b68	mov	x2, x22
0000000000108b6c	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000108b70	add	x0, sp, #0x148
0000000000108b74	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000108b78	add	x0, sp, #0x148
0000000000108b7c	fmov	d2, #1.00000000
0000000000108b80	mov.16b	v0, v8
0000000000108b84	mov.16b	v1, v8
0000000000108b88	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000108b8c	mov	w0, #0x210
0000000000108b90	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000108b94	mov	x19, x0
0000000000108b98	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000108b9c	ldr	x8, [x19]
0000000000108ba0	ldr	x8, [x8, #0x230]
0000000000108ba4	add	x1, sp, #0x148
0000000000108ba8	mov	x0, x19
0000000000108bac	blr	x8
0000000000108bb0	ldur	x2, [x29, #-0x98]
0000000000108bb4	ldr	x8, [x19]
0000000000108bb8	ldr	x8, [x8, #0x78]
0000000000108bbc	mov	x0, x19
0000000000108bc0	mov	w1, #0x0
0000000000108bc4	blr	x8
0000000000108bc8	stp	x19, xzr, [sp, #0x138]
0000000000108bcc	ldr	x8, [x19]
0000000000108bd0	ldr	x8, [x8, #0x10]
0000000000108bd4	mov	x0, x19
0000000000108bd8	blr	x8
0000000000108bdc	ldp	d1, d0, [x29, #-0x88]
0000000000108be0	add	x4, sp, #0x138
0000000000108be4	add	x5, sp, #0x140
0000000000108be8	mov	x0, x25
0000000000108bec	mov	x2, x22
0000000000108bf0	mov	x3, x24
0000000000108bf4	mov.16b	v2, v8
0000000000108bf8	bl	"_objc_msgSend$polarToRect:withInputImage:withInputNode:centerX:centerY:upscaleFactor:andOutputNode:"
0000000000108bfc	ldr	x0, [sp, #0x138]
0000000000108c00	cbz	x0, 0x108c10
0000000000108c04	ldr	x8, [x0]
0000000000108c08	ldr	x8, [x8, #0x18]
0000000000108c0c	blr	x8
0000000000108c10	mov	w0, #0x1b0
0000000000108c14	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000108c18	mov	x20, x0
0000000000108c1c	bl	__ZN16HDirectionalBlurC1Ev
0000000000108c20	ldur	d0, [x29, #-0x78]
0000000000108c24	fmul	d0, d8, d0
0000000000108c28	fcvt	s0, d0
0000000000108c2c	adrp	x8, 355 ; 0x26b000
0000000000108c30	ldr	s1, [x8, #0x490]
0000000000108c34	fmov	s2, #1.00000000
0000000000108c38	fmov	s3, #1.00000000
0000000000108c3c	mov	x0, x20
0000000000108c40	bl	__ZN16HDirectionalBlur4initEffff
0000000000108c44	ldr	x2, [sp, #0x140]
0000000000108c48	ldr	x8, [x20]
0000000000108c4c	ldr	x8, [x8, #0x78]
0000000000108c50	mov	x0, x20
0000000000108c54	mov	w1, #0x0
0000000000108c58	blr	x8
0000000000108c5c	stp	x20, xzr, [sp, #0x128]
0000000000108c60	ldr	x8, [x20]
0000000000108c64	ldr	x8, [x8, #0x10]
0000000000108c68	mov	x0, x20
0000000000108c6c	blr	x8
0000000000108c70	ldp	d1, d0, [x29, #-0x88]
0000000000108c74	add	x4, sp, #0x128
0000000000108c78	add	x5, sp, #0x130
0000000000108c7c	mov	x0, x25
0000000000108c80	mov	x2, x22
0000000000108c84	mov	x3, x24
0000000000108c88	mov.16b	v2, v8
0000000000108c8c	bl	"_objc_msgSend$rectToPolar:withInputImage:withInputNode:centerX:centerY:upscaleFactor:andOutputNode:"
0000000000108c90	ldr	x0, [sp, #0x128]
0000000000108c94	cbz	x0, 0x108ca4
0000000000108c98	ldr	x8, [x0]
0000000000108c9c	ldr	x8, [x8, #0x18]
0000000000108ca0	blr	x8
0000000000108ca4	add	x0, sp, #0x98
0000000000108ca8	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000108cac	fmov	d0, #1.00000000
0000000000108cb0	fdiv	d0, d0, d8
0000000000108cb4	add	x0, sp, #0x98
0000000000108cb8	fmov	d2, #1.00000000
0000000000108cbc	mov.16b	v1, v0
0000000000108cc0	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000108cc4	mov	w0, #0x210
0000000000108cc8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000108ccc	mov	x23, x0
0000000000108cd0	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000108cd4	ldr	x8, [x23]
0000000000108cd8	ldr	x8, [x8, #0x230]
0000000000108cdc	add	x1, sp, #0x98
0000000000108ce0	mov	x0, x23
0000000000108ce4	blr	x8
0000000000108ce8	ldr	x2, [sp, #0x130]
0000000000108cec	ldr	x8, [x23]
0000000000108cf0	ldr	x8, [x8, #0x78]
0000000000108cf4	mov	x0, x23
0000000000108cf8	mov	w1, #0x0
0000000000108cfc	blr	x8
0000000000108d00	mov	w0, #0x1a0
0000000000108d04	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000108d08	mov	x26, x0
0000000000108d0c	bl	__ZN13HgcRadialMaskC1Ev
0000000000108d10	str	x26, [sp, #0x90]
0000000000108d14	ldur	d8, [x29, #-0x80]
0000000000108d18	mov	x0, x24
0000000000108d1c	bl	_objc_msgSend$width
0000000000108d20	mov	x26, x0
0000000000108d24	ldur	d10, [x29, #-0x88]
0000000000108d28	mov	x0, x24
0000000000108d2c	bl	_objc_msgSend$height
0000000000108d30	fmov	d0, #-0.50000000
0000000000108d34	ucvtf	d1, x26
0000000000108d38	fadd	d2, d8, d0
0000000000108d3c	fmul	d9, d2, d1
0000000000108d40	fadd	d0, d10, d0
0000000000108d44	ucvtf	d1, x0
0000000000108d48	fmul	d10, d0, d1
0000000000108d4c	mov	x0, x25
0000000000108d50	mov.16b	v0, v9
0000000000108d54	mov.16b	v1, v10
0000000000108d58	mov	x2, x24
0000000000108d5c	bl	"_objc_msgSend$getMaxDistanceFromCenterX:andCenterY:inImage:"
0000000000108d60	mov.16b	v8, v0
0000000000108d64	add	x8, sp, #0x10
0000000000108d68	mov	x0, x25
0000000000108d6c	mov	x2, x24
0000000000108d70	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000108d74	ldr	x0, [sp, #0x90]
0000000000108d78	ldr	x8, [x0]
0000000000108d7c	ldr	x8, [x8, #0x60]
0000000000108d80	fmov	s0, #1.00000000
0000000000108d84	fmov	s1, #1.00000000
0000000000108d88	fmov	s2, #1.00000000
0000000000108d8c	fmov	s3, #1.00000000
0000000000108d90	mov	w1, #0x0
0000000000108d94	blr	x8
0000000000108d98	ldr	x0, [sp, #0x90]
0000000000108d9c	fcvt	s0, d9
0000000000108da0	fcvt	s1, d10
0000000000108da4	ldr	x8, [x0]
0000000000108da8	ldr	x8, [x8, #0x60]
0000000000108dac	movi.2d	v2, #0000000000000000
0000000000108db0	movi.2d	v3, #0000000000000000
0000000000108db4	mov	w1, #0x1
0000000000108db8	blr	x8
0000000000108dbc	ldr	x0, [sp, #0x90]
0000000000108dc0	fcvt	s0, d8
0000000000108dc4	ldr	x8, [x0]
0000000000108dc8	ldr	x8, [x8, #0x60]
0000000000108dcc	movi.2d	v1, #0000000000000000
0000000000108dd0	movi.2d	v2, #0000000000000000
0000000000108dd4	movi.2d	v3, #0000000000000000
0000000000108dd8	mov	w1, #0x2
0000000000108ddc	blr	x8
0000000000108de0	ldr	x0, [sp, #0x90]
0000000000108de4	ldp	d0, d1, [sp, #0x10]
0000000000108de8	fcvt	s0, d0
0000000000108dec	fcvt	s1, d1
0000000000108df0	ldr	d2, [sp, #0x28]
0000000000108df4	fcvt	s3, d2
0000000000108df8	ldr	x8, [x0]
0000000000108dfc	ldr	x8, [x8, #0x60]
0000000000108e00	movi.2d	v2, #0000000000000000
0000000000108e04	mov	w1, #0x3
0000000000108e08	blr	x8
0000000000108e0c	ldr	x0, [sp, #0x90]
0000000000108e10	ldp	d0, d1, [sp, #0x30]
0000000000108e14	fcvt	s0, d0
0000000000108e18	fcvt	s1, d1
0000000000108e1c	ldr	d2, [sp, #0x48]
0000000000108e20	fcvt	s3, d2
0000000000108e24	ldr	x8, [x0]
0000000000108e28	ldr	x8, [x8, #0x60]
0000000000108e2c	movi.2d	v2, #0000000000000000
0000000000108e30	mov	w1, #0x4
0000000000108e34	blr	x8
0000000000108e38	ldr	x0, [sp, #0x90]
0000000000108e3c	ldp	d0, d1, [sp, #0x70]
0000000000108e40	fcvt	s0, d0
0000000000108e44	fcvt	s1, d1
0000000000108e48	ldr	d2, [sp, #0x88]
0000000000108e4c	fcvt	s3, d2
0000000000108e50	ldr	x8, [x0]
0000000000108e54	ldr	x8, [x8, #0x60]
0000000000108e58	movi.2d	v2, #0000000000000000
0000000000108e5c	mov	w1, #0x5
0000000000108e60	blr	x8
0000000000108e64	ldr	x0, [sp, #0x90]
0000000000108e68	ldr	x8, [x0]
0000000000108e6c	ldr	x8, [x8, #0x78]
0000000000108e70	mov	w1, #0x0
0000000000108e74	mov	x2, x23
0000000000108e78	blr	x8
0000000000108e7c	ldurb	w8, [x29, #-0x89]
0000000000108e80	cmp	w8, #0x1
0000000000108e84	b.ne	0x108f3c
0000000000108e88	mov	x0, x22
0000000000108e8c	bl	_objc_msgSend$width
0000000000108e90	mov	x25, x0
0000000000108e94	mov	x0, x22
0000000000108e98	bl	_objc_msgSend$height
0000000000108e9c	mov	x26, x0
0000000000108ea0	mov	w0, #0x1a0
0000000000108ea4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000108ea8	mov	x24, x0
0000000000108eac	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000108eb0	ldr	x2, [sp, #0x90]
0000000000108eb4	ldr	x8, [x24]
0000000000108eb8	ldr	x8, [x8, #0x78]
0000000000108ebc	mov	x0, x24
0000000000108ec0	mov	w1, #0x0
0000000000108ec4	blr	x8
0000000000108ec8	ucvtf	d0, x25, #0x1
0000000000108ecc	ucvtf	d1, x26, #0x1
0000000000108ed0	fcvt	s2, d0
0000000000108ed4	fneg	s0, s2
0000000000108ed8	fcvt	s3, d1
0000000000108edc	fneg	s1, s3
0000000000108ee0	ldr	x8, [x24]
0000000000108ee4	ldr	x8, [x8, #0x60]
0000000000108ee8	mov	x0, x24
0000000000108eec	mov	w1, #0x0
0000000000108ef0	blr	x8
0000000000108ef4	str	x24, [sp, #0x8]
0000000000108ef8	ldr	x8, [x24]
0000000000108efc	ldr	x8, [x8, #0x10]
0000000000108f00	mov	x0, x24
0000000000108f04	blr	x8
0000000000108f08	add	x2, sp, #0x8
0000000000108f0c	mov	x0, x22
0000000000108f10	bl	"_objc_msgSend$setHeliumRef:"
0000000000108f14	ldr	x0, [sp, #0x8]
0000000000108f18	cbz	x0, 0x108f28
0000000000108f1c	ldr	x8, [x0]
0000000000108f20	ldr	x8, [x8, #0x18]
0000000000108f24	blr	x8
0000000000108f28	ldr	x8, [x24]
0000000000108f2c	ldr	x8, [x8, #0x18]
0000000000108f30	mov	x0, x24
0000000000108f34	blr	x8
0000000000108f38	b	0x108f48
0000000000108f3c	add	x2, sp, #0x90
0000000000108f40	mov	x0, x22
0000000000108f44	bl	"_objc_msgSend$setHeliumRef:"
0000000000108f48	ldr	x0, [sp, #0x90]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : AngleSlider
    parm4 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm4 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm4 (bool)
    slot 3  <-  parm4 (bool)
    slot 4  <-  parm4 (bool)
    slot 5  <-  parm4 (bool)
```
