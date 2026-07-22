# Light Rays

- **PAE class:** `Light Rays`
- **Plugin UUID:** `B074E0A5-BE6F-43B4-898A-AB0A44189CD9`
- **Node names in corpus:** Light Rays (112)
- **Corpus usage:** 93 files, 112 instances

## What it does

Light Rays casts volumetric god-rays from a Center point: bright areas are streaked radially outward (a zoom-blur of the highlights) and glowed, simulating light shafts bursting from a source. Amount sets ray length, Expansion the spread, Glow the bloom. Not implemented and no checked-in shader; described from the standard Motion "Light Rays".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Light Rays" filter. Exact radial-streak math unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 50 | 9 .. 200 | Length/strength of the rays, 9-200. Often keyframed to shoot the rays out. *(keyframed in 66 instances)* |
| Expansion | float | 0.4 | 0 .. 2 | How far the rays spread from the center, 0-2. |
| Glow | float | 1.5 | 0.66 .. 8 | Strength of the bloom/glow on the rays, 0.66-8. *(keyframed in 65 instances)* |
| Center | point2D | - | - | Origin point of the rays (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the rays over the original, 0-1 continuous. *(keyframed in 75 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Clip to White`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcConvolvePass8tapPoint`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcConvolvePass8tapPoint` → [`HgcConvolvePass8tapPoint.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcConvolvePass8tapPoint.metal)

```metal
//Metal1.0     
//LEN=0000000490
[[ visible ]] FragmentOut HgcConvolvePass8tapPoint_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4,
    float4 texCoord5,
    float4 texCoord6,
    float4 texCoord7)
{
    float4 r0, r1, r2, r3, r4, r5, r6, r7;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord1.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r5 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r6 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r7 = hg_Texture0.sample(hg_Sampler0, texCoord7.xy);
    r0 = hg_Params[8]*r0;
    r0 = hg_Params[9]*r1 + r0;
    r0 = hg_Params[10]*r2 + r0;
    r0 = hg_Params[11]*r3 + r0;
    r0 = hg_Params[12]*r4 + r0;
    r0 = hg_Params[13]*r5 + r0;
    r0 = hg_Params[14]*r6 + r0;
    output.color0 = hg_Params[15]*r7 + r0;
    return output;
}
```

### Metal fragment shader — `HgcScaleAndAddClampDazzle`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcScaleAndAddClampDazzle` → [`HgcScaleAndAddClampDazzle.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcScaleAndAddClampDazzle.metal)

```metal
//Metal1.0     
//LEN=00000001f0
[[ visible ]] FragmentOut HgcScaleAndAddClampDazzle_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    r1 = r1*hg_Params[0] + r0;
    r1.w = fmin(r1.w, c0.w);
    r1.xyz = fmin(r1.xyz, hg_Params[1].xyz);
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAELightRays canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELightRays`

```asm
0000000000042cd8	mov	w3, #0x1
0000000000042cdc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000042ce0	ldr	d0, [sp, #0x58]
0000000000042ce4	fcmp	d0, #0.0
0000000000042ce8	b.ne	0x42d04
0000000000042cec	cbz	x23, 0x42d60
0000000000042cf0	add	x8, sp, #0x1, lsl #12
0000000000042cf4	add	x8, x8, #0x60
0000000000042cf8	mov	x0, x23
0000000000042cfc	bl	_objc_msgSend$heliumRef
0000000000042d00	b	0x42d64
0000000000042d04	mov	x8, #0x3fe0000000000000
0000000000042d08	stp	x8, x8, [sp, #0x48]
0000000000042d0c	ldr	x5, [x20]
0000000000042d10	add	x2, sp, #0x50
0000000000042d14	add	x3, sp, #0x48
0000000000042d18	ldr	x0, [sp, #0x10]
0000000000042d1c	mov	w4, #0x2
0000000000042d20	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000042d24	ldr	x4, [x20]
0000000000042d28	add	x2, sp, #0x40
0000000000042d2c	ldr	x0, [sp, #0x10]
0000000000042d30	mov	w3, #0x3
0000000000042d34	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000042d38	ldr	x4, [x20]
0000000000042d3c	add	x2, sp, #0x3f
0000000000042d40	ldr	x0, [sp, #0x10]
0000000000042d44	mov	w3, #0x5
0000000000042d48	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000042d4c	cbz	x23, 0x42d8c
0000000000042d50	add	x8, sp, #0x30
0000000000042d54	mov	x0, x23
0000000000042d58	bl	_objc_msgSend$heliumRef
0000000000042d5c	b	0x42d90
0000000000042d60	str	xzr, [sp, #0x1060]
0000000000042d64	add	x2, sp, #0x1, lsl #12
0000000000042d68	add	x2, x2, #0x60
0000000000042d6c	ldr	x0, [sp, #0x8]
0000000000042d70	bl	"_objc_msgSend$setHeliumRef:"
0000000000042d74	ldr	x0, [sp, #0x1060]
0000000000042d78	cbz	x0, 0x43234
0000000000042d7c	ldr	x8, [x0]
0000000000042d80	ldr	x8, [x8, #0x18]
0000000000042d84	blr	x8
0000000000042d88	b	0x43234
0000000000042d8c	str	xzr, [sp, #0x30]
0000000000042d90	ldr	x20, [sp, #0x8]
0000000000042d94	mov	x0, x20
0000000000042d98	bl	_objc_msgSend$width
0000000000042d9c	mov	x25, x0
0000000000042da0	mov	x0, x20
0000000000042da4	bl	_objc_msgSend$height
0000000000042da8	mov	x24, x0
0000000000042dac	stp	xzr, xzr, [x29, #-0x90]
0000000000042db0	mov	w0, #0x1d0
0000000000042db4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000042db8	mov	x20, x0
0000000000042dbc	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
0000000000042dc0	mov	x0, x20
0000000000042dc4	mov	w1, #0x0
0000000000042dc8	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
0000000000042dcc	sub	x1, x29, #0x90
0000000000042dd0	mov	x0, x20
0000000000042dd4	bl	0x251198 ; symbol stub for: __ZN13HGTextureWrap21SetTextureBorderColorEPKf
0000000000042dd8	ldr	x2, [sp, #0x30]
0000000000042ddc	ldr	x8, [x20]
0000000000042de0	ldr	x8, [x8, #0x78]
0000000000042de4	mov	x0, x20
0000000000042de8	mov	w1, #0x0
0000000000042dec	blr	x8
0000000000042df0	ucvtf	d8, x25
0000000000042df4	fmov	d0, #0.50000000
0000000000042df8	fmul	d10, d8, d0
0000000000042dfc	ucvtf	d9, x24, #0x1
0000000000042e00	fcvt	s2, d10
0000000000042e04	fneg	s0, s2
0000000000042e08	fcvt	s3, d9
0000000000042e0c	fneg	s1, s3
0000000000042e10	bl	0x250a3c ; symbol stub for: _HGRectMake4f
0000000000042e14	str	x0, [sp, #0x1060]
0000000000042e18	str	x1, [sp, #0x1068]
0000000000042e1c	add	x1, sp, #0x1, lsl #12
0000000000042e20	add	x1, x1, #0x60
0000000000042e24	mov	x0, x20
0000000000042e28	bl	0x251180 ; symbol stub for: __ZN13HGTextureWrap11SetCropRectERK6HGRect
0000000000042e2c	ldr	x8, [sp]
0000000000042e30	ldr	x0, [x8, x19]
0000000000042e34	adrp	x8, 914 ; 0x3d4000
0000000000042e38	ldr	x2, [x8, #0x528]
0000000000042e3c	bl	"_objc_msgSend$apiForProtocol:"
0000000000042e40	bl	_objc_msgSend$versionAtCreation
0000000000042e44	ldr	d11, [sp, #0x50]
0000000000042e48	cbz	w0, 0x42eac
0000000000042e4c	mov	x0, x23
0000000000042e50	bl	_objc_msgSend$width
0000000000042e54	mov	x24, x0
0000000000042e58	mov	x0, x23
0000000000042e5c	bl	_objc_msgSend$width
0000000000042e60	mov	x25, x0
0000000000042e64	ldr	d9, [sp, #0x48]
0000000000042e68	mov	x0, x23
0000000000042e6c	bl	_objc_msgSend$height
0000000000042e70	mov	x26, x0
0000000000042e74	mov	x0, x23
0000000000042e78	bl	_objc_msgSend$height
0000000000042e7c	ucvtf	d0, x24
0000000000042e80	ucvtf	d1, x25
0000000000042e84	fmul	d0, d11, d0
0000000000042e88	fmov	d2, #-0.50000000
0000000000042e8c	fmul	d1, d1, d2
0000000000042e90	fadd	d8, d0, d1
0000000000042e94	ucvtf	d0, x26
0000000000042e98	fmul	d0, d9, d0
0000000000042e9c	ucvtf	d1, x0
0000000000042ea0	fmul	d1, d1, d2
0000000000042ea4	fadd	d9, d0, d1
0000000000042ea8	b	0x42ec4
0000000000042eac	ucvtf	d0, x24
0000000000042eb0	fmul	d1, d11, d8
0000000000042eb4	fsub	d8, d1, d10
0000000000042eb8	ldr	d1, [sp, #0x48]
0000000000042ebc	fmul	d0, d1, d0
0000000000042ec0	fsub	d9, d0, d9
0000000000042ec4	add	x8, sp, #0x20
0000000000042ec8	ldr	x0, [sp]
0000000000042ecc	mov	x2, x23
0000000000042ed0	bl	"_objc_msgSend$getScaleForImage:"
0000000000042ed4	ldp	d0, d1, [sp, #0x20]
0000000000042ed8	fcmp	d0, d1
0000000000042edc	fcsel	d0, d0, d1, gt
0000000000042ee0	ldr	d1, [sp, #0x58]
0000000000042ee4	fmul	d1, d0, d1
0000000000042ee8	fmov	d2, #0.50000000
0000000000042eec	fmul	d1, d1, d2
0000000000042ef0	fcvtps	w26, d1
0000000000042ef4	cmp	w26, #0x1
0000000000042ef8	b.lt	0x42f84
0000000000042efc	mov	x8, #0x0
0000000000042f00	mov	x9, #0x3f70000000000000
0000000000042f04	fmov	d1, x9
0000000000042f08	fdiv	d0, d1, d0
0000000000042f0c	fcvt	s1, d0
0000000000042f10	ucvtf	s2, w26
0000000000042f14	movi.2d	v0, #0000000000000000
0000000000042f18	fmov	s3, #1.00000000
0000000000042f1c	add	x9, sp, #0x1, lsl #12
0000000000042f20	add	x9, x9, #0x60
0000000000042f24	add	x10, sp, #0x60
0000000000042f28	ucvtf	s4, w8
0000000000042f2c	fdiv	s5, s4, s2
0000000000042f30	fsub	s5, s3, s5
0000000000042f34	str	s5, [x9, x8, lsl #2]
0000000000042f38	fadd	s0, s0, s5
0000000000042f3c	fmul	s4, s1, s4
0000000000042f40	fsub	s4, s3, s4
0000000000042f44	str	s4, [x10, x8, lsl #2]
0000000000042f48	add	x8, x8, #0x1
0000000000042f4c	cmp	x26, x8
0000000000042f50	b.ne	0x42f28
0000000000042f54	fmov	s1, #1.00000000
0000000000042f58	add	x8, sp, #0x1, lsl #12
0000000000042f5c	add	x8, x8, #0x60
0000000000042f60	mov	x9, x26
0000000000042f64	fdiv	s0, s1, s0
0000000000042f68	ldr	s1, [x8]
0000000000042f6c	fmul	s1, s0, s1
0000000000042f70	str	s1, [x8], #0x4
0000000000042f74	subs	x9, x9, #0x1
0000000000042f78	b.ne	0x42f68
0000000000042f7c	str	xzr, [sp, #0x18]
0000000000042f80	b	0x42f8c
0000000000042f84	str	xzr, [sp, #0x18]
0000000000042f88	cbz	w26, 0x431c8
0000000000042f8c	mov	w0, #0x1a0
0000000000042f90	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000042f94	mov	x24, x0
0000000000042f98	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
0000000000042f9c	cbz	x24, 0x42fa4
0000000000042fa0	str	x24, [sp, #0x18]
0000000000042fa4	cmp	w26, #0x1
0000000000042fa8	b.lt	0x431dc
0000000000042fac	mov	x27, #0x0
0000000000042fb0	adrp	x8, 858 ; 0x39c000
0000000000042fb4	add	x8, x8, #0xa30
0000000000042fb8	ldr	x21, [x8, #0x88]
0000000000042fbc	fcvt	s8, d8
0000000000042fc0	fcvt	s9, d9
0000000000042fc4	add	x22, sp, #0x60
0000000000042fc8	add	x19, sp, #0x1, lsl #12
0000000000042fcc	add	x19, x19, #0x60
0000000000042fd0	fmov	s10, #1.00000000
0000000000042fd4	mov	w28, #0x7f7fffff
0000000000042fd8	mov	w0, #0x1b0
0000000000042fdc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000042fe0	mov	x23, x0
0000000000042fe4	bl	__ZN24HgcConvolvePass8tapPointC2Ev
0000000000042fe8	adrp	x8, 858 ; 0x39c000
0000000000042fec	add	x8, x8, #0xa30
0000000000042ff0	add	x8, x8, #0x10
0000000000042ff4	str	x8, [x23]
0000000000042ff8	mov	x0, x23
0000000000042ffc	mov	w1, #0x0
0000000000043000	mov	x2, x20
0000000000043004	blr	x21
0000000000043008	mov	x25, #0x0
000000000004300c	fmov	s0, #1.00000000
0000000000043010	add	x8, x27, x25
0000000000043014	cmp	x8, x26
0000000000043018	b.hs	0x43020
000000000004301c	ldr	s0, [x22, x25, lsl #2]
0000000000043020	ldr	x8, [x23]
0000000000043024	ldr	x8, [x8, #0x60]
0000000000043028	movi.2d	v2, #0000000000000000
000000000004302c	movi.2d	v3, #0000000000000000
0000000000043030	mov	x0, x23
0000000000043034	mov	x1, x25
0000000000043038	mov.16b	v1, v0
000000000004303c	blr	x8
0000000000043040	add	x25, x25, #0x1
0000000000043044	cmp	x25, #0x8
0000000000043048	b.ne	0x4300c
000000000004304c	mov	x25, #0x0
0000000000043050	movi.2d	v0, #0000000000000000
0000000000043054	add	x8, x27, x25
0000000000043058	cmp	x8, x26
000000000004305c	movi.2d	v3, #0000000000000000
0000000000043060	b.hs	0x43078
0000000000043064	ldr	s3, [x19, x25, lsl #2]
0000000000043068	fcvt	d0, s3
000000000004306c	ldr	d1, [sp, #0x40]
0000000000043070	fmul	d0, d1, d0
0000000000043074	fcvt	s0, d0
0000000000043078	ldr	x8, [x23]
000000000004307c	ldr	x8, [x8, #0x60]
0000000000043080	orr	w1, w25, #0x8
0000000000043084	mov	x0, x23
0000000000043088	mov.16b	v1, v0
000000000004308c	mov.16b	v2, v0
0000000000043090	blr	x8
0000000000043094	add	x25, x25, #0x1
0000000000043098	cmp	x25, #0x8
000000000004309c	b.ne	0x43050
00000000000430a0	ldr	x8, [x23]
00000000000430a4	ldr	x8, [x8, #0x60]
00000000000430a8	movi.2d	v2, #0000000000000000
00000000000430ac	movi.2d	v3, #0000000000000000
00000000000430b0	mov	x0, x23
00000000000430b4	mov	w1, #0x10
00000000000430b8	mov.16b	v0, v8
00000000000430bc	mov.16b	v1, v9
00000000000430c0	blr	x8
00000000000430c4	mov	w0, #0x1a0
00000000000430c8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000430cc	mov	x25, x0
00000000000430d0	bl	__ZN25HgcScaleAndAddClampDazzleC1Ev
00000000000430d4	ldr	x8, [x25]
00000000000430d8	ldr	x8, [x8, #0x78]
00000000000430dc	mov	x0, x25
00000000000430e0	mov	w1, #0x0
00000000000430e4	mov	x2, x23
00000000000430e8	blr	x8
00000000000430ec	ldr	x8, [x25]
00000000000430f0	ldr	x8, [x8, #0x78]
00000000000430f4	mov	x0, x25
00000000000430f8	mov	w1, #0x1
00000000000430fc	mov	x2, x24
0000000000043100	blr	x8
0000000000043104	ldr	x8, [x25]
0000000000043108	ldr	x8, [x8, #0x60]
000000000004310c	fmov	s0, #1.00000000
0000000000043110	fmov	s1, #1.00000000
0000000000043114	fmov	s2, #1.00000000
0000000000043118	fmov	s3, #1.00000000
000000000004311c	mov	x0, x25
0000000000043120	mov	w1, #0x0
0000000000043124	blr	x8
0000000000043128	ldrb	w8, [sp, #0x3f]
000000000004312c	ldr	x9, [x25]
0000000000043130	ldr	x9, [x9, #0x60]
0000000000043134	cmp	w8, #0x0
0000000000043138	fmov	s0, w28
000000000004313c	fcsel	s0, s10, s0, ne
0000000000043140	movi.2d	v1, #0000000000000000
0000000000043144	movi.2d	v2, #0000000000000000
0000000000043148	movi.2d	v3, #0000000000000000
000000000004314c	mov	x0, x25
0000000000043150	mov	w1, #0x1
0000000000043154	blr	x9
0000000000043158	ldr	x24, [sp, #0x18]
000000000004315c	cmp	x24, x25
0000000000043160	b.eq	0x43190
0000000000043164	cbz	x24, 0x43178
0000000000043168	ldr	x8, [x24]
000000000004316c	ldr	x8, [x8, #0x18]
0000000000043170	mov	x0, x24
0000000000043174	blr	x8
0000000000043178	str	x25, [sp, #0x18]
000000000004317c	ldr	x8, [x25]
0000000000043180	ldr	x8, [x8, #0x10]
0000000000043184	mov	x0, x25
0000000000043188	blr	x8
000000000004318c	mov	x24, x25
0000000000043190	ldr	x8, [x25]
0000000000043194	ldr	x8, [x8, #0x18]
0000000000043198	mov	x0, x25
000000000004319c	blr	x8
00000000000431a0	ldr	x8, [x23]
00000000000431a4	ldr	x8, [x8, #0x18]
00000000000431a8	mov	x0, x23
00000000000431ac	blr	x8
00000000000431b0	add	x27, x27, #0x8
00000000000431b4	add	x22, x22, #0x20
00000000000431b8	add	x19, x19, #0x20
00000000000431bc	cmp	w27, w26
00000000000431c0	b.lt	0x42fd8
00000000000431c4	b	0x431dc
00000000000431c8	str	x20, [sp, #0x18]
00000000000431cc	ldr	x8, [x20]
00000000000431d0	ldr	x8, [x8, #0x10]
00000000000431d4	mov	x0, x20
00000000000431d8	blr	x8
00000000000431dc	add	x2, sp, #0x18
00000000000431e0	ldp	x0, x19, [sp]
00000000000431e4	mov	x3, x19
00000000000431e8	mov	x4, x19
00000000000431ec	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000431f0	add	x2, sp, #0x18
00000000000431f4	mov	x0, x19
00000000000431f8	bl	"_objc_msgSend$setHeliumRef:"
00000000000431fc	ldr	x0, [sp, #0x18]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm3 (float)
    - parm5 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (float), parm3 (float)
    slot 0  <-  parm3 (float)
    slot 16  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
