# Glass Distortion

- **PAE class:** `Glass Distortion`
- **Plugin UUID:** `ACDB3E3B-DEEA-4973-B918-2E355750B995`
- **Node names in corpus:** Glass Distortion (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Glass Distortion displaces the image using a supplied distortion map ("Distort Input"), as if viewed through textured glass. Amount sets the displacement strength and Fit/X-Y Scale fit the map to the frame. The distortion source is an image input.

> **Note.** Not implemented; description is the standard Apple Motion "Glass Distortion" filter. Distort Input is an image-map handle; X/Y Scale and Softness are map-fit/soften sub-knobs.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 110 | 110 .. 110 | Displacement strength, ~110 (default 110). *(keyframed in 2 instances)* |
| Fit | bool | 1 | 1 .. 1 | Fit the distortion map to the frame. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |
| Center | unknown | - | - | *(unverified)* |
| Distort Input | float | 0 | 0 .. 3099128836 | *(unverified)* |
| X Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Y Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Softness | float | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGlassDistort`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGlassDistort` → [`HgcGlassDistort.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGlassDistort.metal)

```metal
//Metal1.0     
//LEN=00000006fa
[[ visible ]] FragmentOut HgcGlassDistort_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1, 
    texture2d< float > hg_Texture2, 
    sampler hg_Sampler2, 
    texture2d< float > hg_Texture3, 
    sampler hg_Sampler3,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3)
{
    const float4 c0 = float4(0.5000000000, 0.2500000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.x = hg_Texture3.sample(hg_Sampler3, texCoord1.xy).x;
    r1.xzw = hg_Texture3.sample(hg_Sampler3, texCoord2.xy).xzw;
    r2.x = hg_Texture3.sample(hg_Sampler3, texCoord3.xy).x;
    r0.x = r0.x*r0.x;
    r1.x = r1.x*r1.x + -r0.x;
    r1.y = r2.x*r2.x + -r0.x;
    r1 = r1*hg_Params[1];
    r2 = float4(hg_Params[0] < fabs(r1));
    r0.xy = fmin(hg_Params[0].xy, r1.xy);
    r0.xy = fmax(-hg_Params[0].xy, r0.xy);
    r0.xy = r0.xy + texCoord0.xy;
    r1 = r1*c0.xxxx;
    r3 = float4(hg_Params[0] < fabs(r1));
    r4.xy = fmin(hg_Params[0].xy, r1.xy);
    r4.xy = fmax(-hg_Params[0].xy, r4.xy);
    r4.xy = texCoord0.xy*c0.xx + r4.xy;
    r1.xy = r1.xy*c0.xx;
    r1.xy = texCoord0.xy*c0.yy + r1.xy;
    r0.xy = r0.xy + hg_Params[2].xy;
    r0.xy = r0.xy*hg_Params[2].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r4.xy = r4.xy + hg_Params[3].xy;
    r4.xy = r4.xy*hg_Params[3].zw;
    r4 = hg_Texture1.sample(hg_Sampler1, r4.xy);
    r1.xy = r1.xy + hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    r1 = hg_Texture2.sample(hg_Sampler2, r1.xy);
    r3 = select(r4, r1, -r3 < 0.00000f);
    output.color0 = select(r0, r3, -r2 < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEGlassDistort canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGlassDistort`

```asm
00000000000b1b80	mov	w3, #0x4
00000000000b1b84	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b1b88	ldur	d0, [x29, #-0x60]
00000000000b1b8c	fcmp	d0, #0.0
00000000000b1b90	b.ne	0xb1ba8
00000000000b1b94	cbz	x23, 0xb1bcc
00000000000b1b98	add	x8, sp, #0x428
00000000000b1b9c	mov	x0, x23
00000000000b1ba0	bl	_objc_msgSend$heliumRef
00000000000b1ba4	b	0xb1bd0
00000000000b1ba8	ldr	x0, [x24, x20]
00000000000b1bac	adrp	x8, 803 ; 0x3d4000
00000000000b1bb0	ldr	x2, [x8, #0x528]
00000000000b1bb4	bl	"_objc_msgSend$apiForProtocol:"
00000000000b1bb8	cbz	x0, 0xb1c14
00000000000b1bbc	bl	_objc_msgSend$versionAtCreation
00000000000b1bc0	cmp	w0, #0x0
00000000000b1bc4	cset	w27, eq
00000000000b1bc8	b	0xb1c18
00000000000b1bcc	str	xzr, [sp, #0x428]
00000000000b1bd0	add	x2, sp, #0x428
00000000000b1bd4	mov	x0, x21
00000000000b1bd8	bl	"_objc_msgSend$setHeliumRef:"
00000000000b1bdc	ldr	x0, [sp, #0x428]
00000000000b1be0	cbz	x0, 0xb1bf0
00000000000b1be4	ldr	x8, [x0]
00000000000b1be8	ldr	x8, [x8, #0x18]
00000000000b1bec	blr	x8
00000000000b1bf0	mov	w0, #0x1
00000000000b1bf4	add	sp, sp, #0x580
00000000000b1bf8	ldp	x29, x30, [sp, #0x50]
00000000000b1bfc	ldp	x20, x19, [sp, #0x40]
00000000000b1c00	ldp	x22, x21, [sp, #0x30]
00000000000b1c04	ldp	x24, x23, [sp, #0x20]
00000000000b1c08	ldp	x26, x25, [sp, #0x10]
00000000000b1c0c	ldp	x28, x27, [sp], #0x60
00000000000b1c10	ret
00000000000b1c14	mov	w27, #0x0
00000000000b1c18	mov	x0, x23
00000000000b1c1c	bl	_objc_msgSend$bounds
00000000000b1c20	stp	q0, q1, [sp, #0x30]
00000000000b1c24	str	q3, [sp, #0x50]
00000000000b1c28	sub	x8, x29, #0x70
00000000000b1c2c	fmov.2d	v0, #0.50000000
00000000000b1c30	stp	q0, q2, [sp, #0x10]
00000000000b1c34	stur	q0, [x29, #-0x70]
00000000000b1c38	ldr	x5, [x25]
00000000000b1c3c	sub	x2, x29, #0x70
00000000000b1c40	orr	x3, x8, #0x8
00000000000b1c44	mov	x0, x19
00000000000b1c48	mov	w4, #0x2
00000000000b1c4c	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000b1c50	ldur	q0, [x29, #-0x70]
00000000000b1c54	ldr	q1, [sp, #0x20]
00000000000b1c58	ldp	q3, q2, [sp, #0x40]
00000000000b1c5c	mov.d	v1[1], v2[0]
00000000000b1c60	ldr	q2, [sp, #0x30]
00000000000b1c64	mov.d	v2[1], v3[0]
00000000000b1c68	fmul.2d	v0, v1, v0
00000000000b1c6c	fadd.2d	v0, v2, v0
00000000000b1c70	stur	q0, [x29, #-0x70]
00000000000b1c74	mov	x20, #0x3fe0000000000000
00000000000b1c78	stur	x20, [x29, #-0x78]
00000000000b1c7c	ldr	x4, [x25]
00000000000b1c80	sub	x2, x29, #0x78
00000000000b1c84	mov	x0, x19
00000000000b1c88	mov	w3, #0x3
00000000000b1c8c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b1c90	stur	x20, [x29, #-0x80]
00000000000b1c94	ldr	x4, [x25]
00000000000b1c98	sub	x2, x29, #0x80
00000000000b1c9c	mov	x0, x19
00000000000b1ca0	mov	w3, #0x6
00000000000b1ca4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b1ca8	cbz	w27, 0xb1cb4
00000000000b1cac	ldur	d0, [x29, #-0x78]
00000000000b1cb0	stur	d0, [x29, #-0x80]
00000000000b1cb4	stur	xzr, [x29, #-0x88]
00000000000b1cb8	ldr	x4, [x25]
00000000000b1cbc	sub	x2, x29, #0x88
00000000000b1cc0	mov	x0, x19
00000000000b1cc4	mov	w3, #0x5
00000000000b1cc8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b1ccc	mov	w8, #0x1
00000000000b1cd0	sturb	w8, [x29, #-0x89]
00000000000b1cd4	ldr	x4, [x25]
00000000000b1cd8	sub	x2, x29, #0x89
00000000000b1cdc	mov	x0, x19
00000000000b1ce0	mov	w3, #0x7
00000000000b1ce4	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000b1ce8	ldr	x2, [x25]
00000000000b1cec	mov	x0, x24
00000000000b1cf0	bl	"_objc_msgSend$getRenderMode:"
00000000000b1cf4	cbz	w0, 0xb1bf4
00000000000b1cf8	mov	x0, x21
00000000000b1cfc	bl	_objc_msgSend$imageType
00000000000b1d00	cmp	x0, #0x3
00000000000b1d04	b.ne	0xb1d1c
00000000000b1d08	cbz	x23, 0xb1d24
00000000000b1d0c	sub	x8, x29, #0x98
00000000000b1d10	mov	x0, x23
00000000000b1d14	bl	_objc_msgSend$heliumRef
00000000000b1d18	b	0xb1d28
00000000000b1d1c	mov	w0, #0x0
00000000000b1d20	b	0xb1bf4
00000000000b1d24	stur	xzr, [x29, #-0x98]
00000000000b1d28	add	x8, sp, #0x4b8
00000000000b1d2c	mov	x0, x24
00000000000b1d30	mov	x2, x23
00000000000b1d34	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000b1d38	mov	w0, #0x1b0
00000000000b1d3c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b1d40	mov	x19, x0
00000000000b1d44	bl	__ZN15HgcGlassDistortC2Ev
00000000000b1d48	adrp	x8, 748 ; 0x39d000
00000000000b1d4c	add	x8, x8, #0x860
00000000000b1d50	add	x9, x8, #0x10
00000000000b1d54	str	x9, [x19]
00000000000b1d58	str	xzr, [x19, #0x1a0]
00000000000b1d5c	ldr	x8, [x8, #0x70]
00000000000b1d60	mov	w9, #0x43fa0000
00000000000b1d64	fmov	s0, w9
00000000000b1d68	movi.2d	v2, #0000000000000000
00000000000b1d6c	movi.2d	v3, #0000000000000000
00000000000b1d70	mov	x0, x19
00000000000b1d74	mov	w1, #0x0
00000000000b1d78	mov.16b	v1, v0
00000000000b1d7c	blr	x8
00000000000b1d80	mov	x0, x21
00000000000b1d84	bl	_objc_msgSend$width
00000000000b1d88	mov	x20, x0
00000000000b1d8c	mov	x0, x21
00000000000b1d90	bl	_objc_msgSend$height
00000000000b1d94	str	w20, [x19, #0x1a0]
00000000000b1d98	str	w0, [x19, #0x1a4]
00000000000b1d9c	ldur	x2, [x29, #-0x98]
00000000000b1da0	ldr	x8, [x19]
00000000000b1da4	ldr	x8, [x8, #0x78]
00000000000b1da8	mov	x0, x19
00000000000b1dac	mov	w1, #0x0
00000000000b1db0	blr	x8
00000000000b1db4	add	x0, sp, #0x428
00000000000b1db8	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000b1dbc	add	x0, sp, #0x428
00000000000b1dc0	fmov	d0, #0.50000000
00000000000b1dc4	fmov	d1, #0.50000000
00000000000b1dc8	fmov	d2, #1.00000000
00000000000b1dcc	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000b1dd0	mov	w0, #0x210
00000000000b1dd4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b1dd8	mov	x26, x0
00000000000b1ddc	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000b1de0	ldr	x8, [x26]
00000000000b1de4	ldr	x8, [x8, #0x230]
00000000000b1de8	add	x1, sp, #0x428
00000000000b1dec	mov	x0, x26
00000000000b1df0	str	x26, [sp, #0x8]
00000000000b1df4	blr	x8
00000000000b1df8	ldur	x2, [x29, #-0x98]
00000000000b1dfc	ldr	x8, [x26]
00000000000b1e00	ldr	x8, [x8, #0x78]
00000000000b1e04	mov	x0, x26
00000000000b1e08	mov	w1, #0x0
00000000000b1e0c	blr	x8
00000000000b1e10	ldr	x8, [x19]
00000000000b1e14	ldr	x8, [x8, #0x78]
00000000000b1e18	mov	x0, x19
00000000000b1e1c	mov	w1, #0x1
00000000000b1e20	mov	x2, x26
00000000000b1e24	blr	x8
00000000000b1e28	add	x0, sp, #0x398
00000000000b1e2c	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000b1e30	add	x0, sp, #0x398
00000000000b1e34	fmov	d0, #0.25000000
00000000000b1e38	fmov	d1, #0.25000000
00000000000b1e3c	fmov	d2, #1.00000000
00000000000b1e40	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000b1e44	mov	w0, #0x210
00000000000b1e48	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b1e4c	mov	x22, x0
00000000000b1e50	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000b1e54	ldr	x8, [x22]
00000000000b1e58	ldr	x8, [x8, #0x230]
00000000000b1e5c	add	x1, sp, #0x398
00000000000b1e60	mov	x0, x22
00000000000b1e64	blr	x8
00000000000b1e68	ldur	x2, [x29, #-0x98]
00000000000b1e6c	ldr	x8, [x22]
00000000000b1e70	ldr	x8, [x8, #0x78]
00000000000b1e74	mov	x0, x22
00000000000b1e78	mov	w1, #0x0
00000000000b1e7c	blr	x8
00000000000b1e80	ldr	x8, [x19]
00000000000b1e84	ldr	x8, [x8, #0x78]
00000000000b1e88	mov	x0, x19
00000000000b1e8c	mov	w1, #0x2
00000000000b1e90	mov	x2, x22
00000000000b1e94	blr	x8
00000000000b1e98	str	xzr, [sp, #0x390]
00000000000b1e9c	ldp	q0, q1, [x25]
00000000000b1ea0	ldr	q2, [x25, #0x20]
00000000000b1ea4	stp	q0, q1, [sp, #0x2f0]
00000000000b1ea8	str	q2, [sp, #0x310]
00000000000b1eac	ldr	x7, [x25]
00000000000b1eb0	add	x2, sp, #0x390
00000000000b1eb4	add	x5, sp, #0x2f0
00000000000b1eb8	mov	x0, x24
00000000000b1ebc	mov	x3, #0x0
00000000000b1ec0	mov	x4, #0x0
00000000000b1ec4	mov	w6, #0x1
00000000000b1ec8	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
00000000000b1ecc	ldr	x8, [sp, #0x390]
00000000000b1ed0	cmp	x8, #0x0
00000000000b1ed4	csel	x20, x23, x8, eq
00000000000b1ed8	mov	w0, #0x1d0
00000000000b1edc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b1ee0	mov	x25, x0
00000000000b1ee4	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
00000000000b1ee8	mov	x0, x25
00000000000b1eec	mov	w1, #0x3
00000000000b1ef0	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
00000000000b1ef4	mov	x0, x20
00000000000b1ef8	bl	_objc_msgSend$bounds
00000000000b1efc	str	d0, [sp, #0x370]
00000000000b1f00	str	d1, [sp, #0x378]
00000000000b1f04	str	d2, [sp, #0x380]
00000000000b1f08	str	d3, [sp, #0x388]
00000000000b1f0c	add	x8, sp, #0x2f0
00000000000b1f10	mov	x0, x24
00000000000b1f14	mov	x2, x20
00000000000b1f18	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000b1f1c	ldr	x8, [sp, #0x390]
00000000000b1f20	cbz	x8, 0xb1fa8
00000000000b1f24	str	xzr, [sp, #0x278]
00000000000b1f28	str	xzr, [sp, #0x270]
00000000000b1f2c	fmov.2d	v0, #-1.00000000
00000000000b1f30	str	q0, [sp, #0x280]
00000000000b1f34	add	x0, sp, #0x2f0
00000000000b1f38	add	x1, sp, #0x370
00000000000b1f3c	add	x2, sp, #0x270
00000000000b1f40	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
00000000000b1f44	ldp	q0, q1, [sp, #0x270]
00000000000b1f48	ldr	q4, [sp, #0x10]
00000000000b1f4c	fadd.2d	v2, v0, v4
00000000000b1f50	mov	x8, #0xaf48
00000000000b1f54	movk	x8, #0x9abc, lsl #16
00000000000b1f58	movk	x8, #0xd7f2, lsl #32
00000000000b1f5c	movk	x8, #0x3e7a, lsl #48
00000000000b1f60	dup.2d	v3, x8
00000000000b1f64	fadd.2d	v2, v2, v3
00000000000b1f68	frintm.2d	v2, v2
00000000000b1f6c	fcvtzs.2d	v2, v2
00000000000b1f70	xtn.2s	v2, v2
00000000000b1f74	fadd.2d	v0, v0, v1
00000000000b1f78	fadd.2d	v0, v0, v4
00000000000b1f7c	fadd.2d	v0, v0, v3
00000000000b1f80	frintm.2d	v0, v0
00000000000b1f84	fcvtzs.2d	v0, v0
00000000000b1f88	xtn.2s	v0, v0
00000000000b1f8c	sub.2s	v0, v0, v2
00000000000b1f90	stp	d2, d0, [sp, #0x1e8]
00000000000b1f94	ldr	x0, [sp, #0x390]
00000000000b1f98	cbz	x0, 0xb1fc4
00000000000b1f9c	add	x8, sp, #0x168
00000000000b1fa0	bl	_objc_msgSend$heliumRef
00000000000b1fa4	b	0xb1fc8
00000000000b1fa8	ldur	x26, [x29, #-0x98]
00000000000b1fac	cbz	x26, 0xb1ff0
00000000000b1fb0	ldr	x8, [x26]
00000000000b1fb4	ldr	x8, [x8, #0x10]
00000000000b1fb8	mov	x0, x26
00000000000b1fbc	blr	x8
00000000000b1fc0	b	0xb1ff0
00000000000b1fc4	str	xzr, [sp, #0x168]
00000000000b1fc8	add	x8, sp, #0xe8
00000000000b1fcc	add	x0, sp, #0x1e8
00000000000b1fd0	add	x1, sp, #0x168
00000000000b1fd4	bl	0x251c00 ; symbol stub for: __ZN9FxSupport14makeHeliumCropERK6PCRectIiERK5HGRefI6HGNodeE
00000000000b1fd8	ldr	x26, [sp, #0xe8]
00000000000b1fdc	ldr	x0, [sp, #0x168]
00000000000b1fe0	cbz	x0, 0xb1ff0
00000000000b1fe4	ldr	x8, [x0]
00000000000b1fe8	ldr	x8, [x8, #0x18]
00000000000b1fec	blr	x8
00000000000b1ff0	ldr	x8, [x25]
00000000000b1ff4	ldr	x8, [x8, #0x78]
00000000000b1ff8	mov	x0, x25
00000000000b1ffc	mov	w1, #0x0
00000000000b2000	mov	x2, x26
00000000000b2004	blr	x8
00000000000b2008	mov	w0, #0x1b0
00000000000b200c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b2010	mov	x28, x0
00000000000b2014	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
00000000000b2018	ldur	d0, [x29, #-0x88]
00000000000b201c	fcvt	s0, d0
00000000000b2020	fmov	s1, #1.00000000
00000000000b2024	fmov	s2, #1.00000000
00000000000b2028	mov	x0, x28
00000000000b202c	mov	x1, x27
00000000000b2030	mov	w2, #0x0
00000000000b2034	mov	w3, #0x0
00000000000b2038	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000000b203c	ldr	x8, [x28]
00000000000b2040	ldr	x8, [x8, #0x78]
00000000000b2044	mov	x0, x28
00000000000b2048	mov	w1, #0x0
00000000000b204c	mov	x2, x25
00000000000b2050	blr	x8
00000000000b2054	add	x8, sp, #0x270
00000000000b2058	ldurb	w9, [x29, #-0x89]
00000000000b205c	cmp	w9, #0x1
00000000000b2060	ldp	q7, q6, [sp, #0x40]
00000000000b2064	ldp	q5, q16, [sp, #0x20]
00000000000b2068	b.ne	0xb20c8
00000000000b206c	movi.2d	v0, #0000000000000000
00000000000b2070	stur	q0, [x8, #0x18]
00000000000b2074	stur	q0, [x8, #0x8]
00000000000b2078	stp	q0, q0, [x8, #0x30]
00000000000b207c	ldr	d3, [sp, #0x380]
00000000000b2080	ldr	d4, [sp, #0x388]
00000000000b2084	fdiv	d0, d5, d3
00000000000b2088	ldr	d1, [sp, #0x370]
00000000000b208c	ldr	d2, [sp, #0x378]
00000000000b2090	fmul	d5, d5, d1
00000000000b2094	fdiv	d3, d5, d3
00000000000b2098	fsub	d3, d16, d3
00000000000b209c	fmul	d5, d6, d2
00000000000b20a0	fdiv	d5, d5, d4
00000000000b20a4	fsub	d5, d7, d5
00000000000b20a8	str	xzr, [sp, #0x2e0]
00000000000b20ac	str	xzr, [sp, #0x2d8]
00000000000b20b0	str	d3, [sp, #0x288]
00000000000b20b4	str	d5, [sp, #0x2a8]
00000000000b20b8	str	xzr, [sp, #0x2d0]
00000000000b20bc	str	xzr, [sp, #0x2c8]
00000000000b20c0	fdiv	d3, d6, d4
00000000000b20c4	b	0xb20ec
00000000000b20c8	ldp	d3, d0, [x29, #-0x80]
00000000000b20cc	movi.2d	v1, #0000000000000000
00000000000b20d0	stur	q1, [x8, #0x8]
00000000000b20d4	stur	q1, [x8, #0x18]
00000000000b20d8	stp	q1, q1, [x8, #0x30]
00000000000b20dc	stur	q1, [x8, #0x58]
00000000000b20e0	stur	q1, [x8, #0x68]
00000000000b20e4	ldr	d1, [sp, #0x370]
00000000000b20e8	ldr	d2, [sp, #0x378]
00000000000b20ec	mov	x8, #0x3ff0000000000000
00000000000b20f0	str	d0, [sp, #0x270]
00000000000b20f4	str	d3, [sp, #0x298]
00000000000b20f8	str	x8, [sp, #0x2e8]
00000000000b20fc	str	x8, [sp, #0x2c0]
00000000000b2100	fneg	d0, d1
00000000000b2104	fneg	d1, d2
00000000000b2108	add	x0, sp, #0x270
00000000000b210c	movi.2d	v2, #0000000000000000
00000000000b2110	bl	__ZN14PCMatrix44TmplIdE14rightTranslateEddd
00000000000b2114	ldp	d0, d1, [x29, #-0x70]
00000000000b2118	add	x0, sp, #0x270
00000000000b211c	movi.2d	v2, #0000000000000000
00000000000b2120	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
00000000000b2124	add	x8, sp, #0xe8
00000000000b2128	mov	x0, x24
00000000000b212c	mov	x2, x23
00000000000b2130	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000b2134	add	x8, sp, #0x168
00000000000b2138	add	x0, sp, #0xe8
00000000000b213c	add	x1, sp, #0x270
00000000000b2140	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
00000000000b2144	add	x8, sp, #0x68
00000000000b2148	mov	x0, x24
00000000000b214c	mov	x2, x20
00000000000b2150	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000b2154	add	x8, sp, #0x1e8
00000000000b2158	add	x0, sp, #0x168
00000000000b215c	add	x1, sp, #0x68
00000000000b2160	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
00000000000b2164	str	x28, [sp, #0x60]
00000000000b2168	ldr	x8, [x28]
00000000000b216c	ldr	x8, [x8, #0x10]
00000000000b2170	mov	x0, x28
00000000000b2174	blr	x8
00000000000b2178	add	x8, sp, #0x268
00000000000b217c	add	x0, sp, #0x1e8
00000000000b2180	add	x1, sp, #0x60
00000000000b2184	mov	w2, #0x1
00000000000b2188	mov	w3, #0x0
00000000000b218c	bl	0x251c24 ; symbol stub for: __ZN9FxSupport15makeHeliumXFormERK14PCMatrix44TmplIdERK5HGRefI6HGNodeEbb
00000000000b2190	ldr	x0, [sp, #0x268]
00000000000b2194	cmp	x26, x0
00000000000b2198	b.eq	0xb21c0
00000000000b219c	cbz	x26, 0xb21b4
00000000000b21a0	ldr	x8, [x26]
00000000000b21a4	ldr	x8, [x8, #0x18]
00000000000b21a8	mov	x0, x26
00000000000b21ac	blr	x8
00000000000b21b0	ldr	x0, [sp, #0x268]
00000000000b21b4	str	xzr, [sp, #0x268]
00000000000b21b8	mov	x26, x0
00000000000b21bc	b	0xb21d0
00000000000b21c0	cbz	x26, 0xb21d0
00000000000b21c4	ldr	x8, [x0]
00000000000b21c8	ldr	x8, [x8, #0x18]
00000000000b21cc	blr	x8
00000000000b21d0	ldr	x0, [sp, #0x60]
00000000000b21d4	cbz	x0, 0xb21e4
00000000000b21d8	ldr	x8, [x0]
00000000000b21dc	ldr	x8, [x8, #0x18]
00000000000b21e0	blr	x8
00000000000b21e4	mov	w0, #0x1c0
00000000000b21e8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b21ec	mov	x20, x0
00000000000b21f0	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000b21f4	ldr	x8, [x20]
00000000000b21f8	ldr	x8, [x8, #0x78]
00000000000b21fc	mov	x0, x20
00000000000b2200	mov	w1, #0x0
00000000000b2204	mov	x2, x26
00000000000b2208	blr	x8
00000000000b220c	ldr	x8, [x19]
00000000000b2210	ldr	x8, [x8, #0x78]
00000000000b2214	mov	x0, x19
00000000000b2218	mov	w1, #0x3
00000000000b221c	mov	x2, x20
00000000000b2220	blr	x8
00000000000b2224	ldur	d1, [x29, #-0x60]
00000000000b2228	ldr	d0, [sp, #0x4b8]
00000000000b222c	ldr	d2, [sp, #0x4e0]
00000000000b2230	fabs	d0, d0
00000000000b2234	fmul	d0, d1, d0
00000000000b2238	fcvt	s0, d0
00000000000b223c	fabs	d2, d2
00000000000b2240	fmul	d1, d1, d2
00000000000b2244	fcvt	s1, d1
00000000000b2248	ldr	x8, [x19]
00000000000b224c	ldr	x8, [x8, #0x60]
00000000000b2250	movi.2d	v2, #0000000000000000
00000000000b2254	movi.2d	v3, #0000000000000000
00000000000b2258	mov	x0, x19
00000000000b225c	mov	w1, #0x5
00000000000b2260	blr	x8
00000000000b2264	str	x19, [sp, #0x1e8]
00000000000b2268	ldr	x8, [x19]
00000000000b226c	ldr	x8, [x8, #0x10]
00000000000b2270	mov	x0, x19
00000000000b2274	blr	x8
00000000000b2278	add	x2, sp, #0x1e8
00000000000b227c	mov	x0, x24
00000000000b2280	mov	x3, x23
00000000000b2284	mov	x4, x21
00000000000b2288	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000b228c	add	x2, sp, #0x1e8
00000000000b2290	mov	x0, x21
00000000000b2294	bl	"_objc_msgSend$setHeliumRef:"
00000000000b2298	ldr	x0, [sp, #0x390]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm2 : PointParameter
    parm1 : ImageReference
    parm7 : ToggleButton
    parm3 : FloatSlider
    parm6 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm4 (float)
    - parm3 (float)
    - parm6 (float)
    - parm5 (float)
    - parm7 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
```
