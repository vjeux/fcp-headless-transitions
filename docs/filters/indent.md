# Indent

- **PAE class:** `Indent`
- **Plugin UUID:** `F7F4A6D4-09A3-493F-A345-3AA779595838`
- **Node names in corpus:** Indent (36), Indent copy (7), Indent copy 4 (2), Indent copy 3 (1), 3Dkiss (1)
- **Corpus usage:** 24 files, 47 instances

## What it does

Indent is an emboss/bump-lighting effect: it treats the image (or a supplied height map) as a relief surface and relights it, carving pseudo-3D indented/raised edges with a directional highlight. Depth sets how pronounced the relief is, Light Rotation the light direction, and the Highlight/Brightness/Ambient controls shape the specular and fill lighting.

> **Note.** Not implemented; description is the standard Apple Motion "Indent" emboss/relight filter. Several Height Map wiring params are internal.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Ambient | float | 0.5 | 0 .. 0.87 | Ambient (fill) light level, 0-~0.87 (default 0.5). |
| Depth | float | 10 | 1.701 .. 100 | Strength of the embossed relief, ~1.7-100 (default 10). |
| Softness | float | 0.25 | 0 .. 1 | Softness of the relief edges, 0-1 (default 0.25). |
| Brightness | float | 0.5 | 0 .. 1.649 | Overall brightness of the relit surface, ~0-1.6 (default 0.5). |
| Highlight Brightness | float | 20 | 0 .. 1000 | Intensity of the specular highlight, ~0-1000 (default 20). |
| Highlight Sharpness | float | 30 | 1 .. 100 | Tightness of the specular highlight, ~1-100 (default 30). |
| Light Rotation | float (radians) | pi/4 (0.7854) | 0.7854 .. 5.952 | Direction of the relighting light in radians (default pi/4). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 7 instances)* |
| Height Map | float | 0 | 0 .. 1199713477 | *(unverified)* |
| Height Map X Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Height Map Y Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Height Map X Offset | bool | 0 | 0 .. 0 | *(unverified)* |
| Height Map Y Offset | bool | 0 | 0 .. 0 | *(unverified)* |
| Stretch To Fit | bool | 1 | 0 .. 1 | *(unverified)* |
| Map Channel | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 10 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcConvolvePass8tapIndent`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcConvolvePass8tapIndent` → [`HgcConvolvePass8tapIndent.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcConvolvePass8tapIndent.metal)

```metal
//Metal1.0     
//LEN=00000006a6
[[ visible ]] FragmentOut HgcConvolvePass8tapIndent_hgc_visible(const constant float4* hg_Params, 
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
    const float4 c0 = float4(256.0000000, -0.003906250000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8;
    FragmentOut output;

    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1 = hg_Texture0.sample(hg_Sampler0, texCoord1.xy);
    r2 = hg_Texture0.sample(hg_Sampler0, texCoord2.xy);
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord3.xy);
    r4 = hg_Texture0.sample(hg_Sampler0, texCoord4.xy);
    r5 = hg_Texture0.sample(hg_Sampler0, texCoord5.xy);
    r6 = hg_Texture0.sample(hg_Sampler0, texCoord6.xy);
    r7 = hg_Texture0.sample(hg_Sampler0, texCoord7.xy);
    r8.zw = c0.zz;
    r8.x = dot(r0, hg_Params[10]);
    r8.x = r8.x*hg_Params[8].x;
    r1.x = dot(r1, hg_Params[10]);
    r8.x = r1.x*hg_Params[8].y + r8.x;
    r2.x = dot(r2, hg_Params[10]);
    r8.x = r2.x*hg_Params[8].z + r8.x;
    r3.x = dot(r3, hg_Params[10]);
    r8.x = r3.x*hg_Params[8].w + r8.x;
    r4.x = dot(r4, hg_Params[10]);
    r8.x = r4.x*hg_Params[9].x + r8.x;
    r5.x = dot(r5, hg_Params[10]);
    r8.x = r5.x*hg_Params[9].y + r8.x;
    r6.x = dot(r6, hg_Params[10]);
    r8.x = r6.x*hg_Params[9].z + r8.x;
    r7.x = dot(r7, hg_Params[10]);
    r8.x = r7.x*hg_Params[9].w + r8.x;
    r8.y = r8.x*c0.x;
    r8.y = fract(r8.y);
    r8.x = r8.y*c0.y + r8.x;
    output.color0 = r8;
    return output;
}
```

### Metal fragment shader — `HgcIndent`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcIndent` → [`HgcIndent.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcIndent.metal)

```metal
//Metal1.0     
//LEN=00000004b4
[[ visible ]] FragmentOut HgcIndent_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3,
    float4 texCoord4)
{
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = hg_Texture1.sample(hg_Sampler1, texCoord1.xy);
    r1 = hg_Texture1.sample(hg_Sampler1, texCoord2.xy);
    r2 = hg_Texture1.sample(hg_Sampler1, texCoord3.xy);
    r3 = hg_Texture1.sample(hg_Sampler1, texCoord4.xy);
    r1 = r1 - r0;
    r1.x = dot(hg_Params[1], r1);
    r3 = r3 - r2;
    r1.y = dot(hg_Params[1], r3);
    r1.z = hg_Params[6].z;
    r1.xyz = normalize(r1.xyz).xyz;
    r0.x = clamp(dot(r1.xyz, hg_Params[0].xyz), 0.00000f, 1.00000f);
    r0.x = r0.x*hg_Params[2].x + hg_Params[7].x;
    r1.x = clamp(dot(r1.xyz, hg_Params[5].xyz), 0.00000f, 1.00000f);
    r1.x = pow(r1.x, hg_Params[3].x);
    r1.x = clamp(r1.x*hg_Params[4].x, 0.00000f, 1.00000f);
    r2 = color0;
    r3.xyz = r2.xyz / fmax(r2.w, 1.00000e-06f);
    r3.xyz = r3.xyz*r0.xxx + r1.xxx;
    output.color0.xyz = r3.xyz*r2.www;
    output.color0.w = r2.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEIndent canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEIndent`

```asm
00000000000389ac	mov	w3, #0x1
00000000000389b0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000389b4	ldr	x4, [x24]
00000000000389b8	add	x2, sp, #0x1e0
00000000000389bc	mov	x0, x25
00000000000389c0	mov	w3, #0x2
00000000000389c4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000389c8	ldr	x4, [x24]
00000000000389cc	add	x2, sp, #0x1d8
00000000000389d0	mov	x0, x25
00000000000389d4	mov	w3, #0x4
00000000000389d8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000389dc	ldr	x4, [x24]
00000000000389e0	add	x2, sp, #0x1d0
00000000000389e4	mov	x0, x25
00000000000389e8	mov	w3, #0x5
00000000000389ec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000389f0	ldr	x4, [x24]
00000000000389f4	add	x2, sp, #0x1c8
00000000000389f8	mov	x0, x25
00000000000389fc	mov	w3, #0x6
0000000000038a00	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038a04	ldr	x4, [x24]
0000000000038a08	add	x2, sp, #0x1c4
0000000000038a0c	mov	x0, x25
0000000000038a10	mov	w3, #0x8
0000000000038a14	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000038a18	ldr	x4, [x24]
0000000000038a1c	add	x2, sp, #0x1b8
0000000000038a20	mov	x0, x25
0000000000038a24	mov	w3, #0x3
0000000000038a28	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038a2c	ldr	x4, [x24]
0000000000038a30	add	x2, sp, #0x1b0
0000000000038a34	mov	x0, x25
0000000000038a38	mov	w3, #0x9
0000000000038a3c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038a40	mov	w8, #0x1
0000000000038a44	strb	w8, [sp, #0x1af]
0000000000038a48	ldr	x4, [x24]
0000000000038a4c	add	x2, sp, #0x1af
0000000000038a50	mov	x0, x25
0000000000038a54	mov	w3, #0xa
0000000000038a58	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000038a5c	ldp	d0, d1, [x24, #0x18]
0000000000038a60	fcmp	d0, d1
0000000000038a64	fcsel	d0, d0, d1, gt
0000000000038a68	ldr	d1, [sp, #0x1e8]
0000000000038a6c	fmul	d0, d1, d0
0000000000038a70	str	d0, [sp, #0x1e8]
0000000000038a74	ldr	w8, [sp, #0x1c4]
0000000000038a78	movi.2d	v9, #0000000000000000
0000000000038a7c	movi.2d	v14, #0000000000000000
0000000000038a80	movi.2d	v10, #0000000000000000
0000000000038a84	movi.2d	v11, #0000000000000000
0000000000038a88	cmp	w8, #0x4
0000000000038a8c	b.hi	0x38ac0
0000000000038a90	adrp	x9, 561 ; 0x269000
0000000000038a94	add	x9, x9, #0xa70
0000000000038a98	ldr	s9, [x9, x8, lsl #2]
0000000000038a9c	adrp	x9, 561 ; 0x269000
0000000000038aa0	add	x9, x9, #0xa84
0000000000038aa4	ldr	s14, [x9, x8, lsl #2]
0000000000038aa8	adrp	x9, 561 ; 0x269000
0000000000038aac	add	x9, x9, #0xa98
0000000000038ab0	ldr	s10, [x9, x8, lsl #2]
0000000000038ab4	adrp	x9, 561 ; 0x269000
0000000000038ab8	add	x9, x9, #0xaac
0000000000038abc	ldr	s11, [x9, x8, lsl #2]
0000000000038ac0	add	x26, sp, #0xc0
0000000000038ac4	cbz	x20, 0x38ae4
0000000000038ac8	add	x8, sp, #0x160
0000000000038acc	mov	x0, x20
0000000000038ad0	bl	_objc_msgSend$imageInfo
0000000000038ad4	ldr	x8, [sp, #0x188]
0000000000038ad8	ldr	d0, [sp, #0x1c8]
0000000000038adc	cbz	x8, 0x38af8
0000000000038ae0	b	0x38b00
0000000000038ae4	str	xzr, [sp, #0x1a0]
0000000000038ae8	movi.2d	v0, #0000000000000000
0000000000038aec	stp	q0, q0, [x26, #0xc0]
0000000000038af0	stp	q0, q0, [x26, #0xa0]
0000000000038af4	ldr	d0, [sp, #0x1c8]
0000000000038af8	fneg	d0, d0
0000000000038afc	str	d0, [sp, #0x1c8]
0000000000038b00	bl	0x25205c ; symbol stub for: ___sincos_stret
0000000000038b04	mov.16b	v12, v0
0000000000038b08	mov.16b	v13, v1
0000000000038b0c	ldr	x2, [x24]
0000000000038b10	mov	x0, x22
0000000000038b14	bl	"_objc_msgSend$getRenderMode:"
0000000000038b18	cbz	w0, 0x38b44
0000000000038b1c	mov	x0, x23
0000000000038b20	bl	_objc_msgSend$imageType
0000000000038b24	cmp	x0, #0x3
0000000000038b28	b.ne	0x38b40
0000000000038b2c	cbz	x23, 0x38b8c
0000000000038b30	add	x8, sp, #0x158
0000000000038b34	mov	x0, x23
0000000000038b38	bl	_objc_msgSend$heliumRef
0000000000038b3c	b	0x38b90
0000000000038b40	mov	w0, #0x0
0000000000038b44	ldur	x8, [x29, #-0xa8]
0000000000038b48	adrp	x9, 849 ; 0x389000
0000000000038b4c	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
0000000000038b50	ldr	x9, [x9]
0000000000038b54	cmp	x9, x8
0000000000038b58	b.ne	0x39500
0000000000038b5c	add	sp, sp, #0x390
0000000000038b60	ldp	x29, x30, [sp, #0x90]
0000000000038b64	ldp	x20, x19, [sp, #0x80]
0000000000038b68	ldp	x22, x21, [sp, #0x70]
0000000000038b6c	ldp	x24, x23, [sp, #0x60]
0000000000038b70	ldp	x26, x25, [sp, #0x50]
0000000000038b74	ldp	x28, x27, [sp, #0x40]
0000000000038b78	ldp	d9, d8, [sp, #0x30]
0000000000038b7c	ldp	d11, d10, [sp, #0x20]
0000000000038b80	ldp	d13, d12, [sp, #0x10]
0000000000038b84	ldp	d15, d14, [sp], #0xa0
0000000000038b88	ret
0000000000038b8c	str	xzr, [sp, #0x158]
0000000000038b90	mov	w0, #0x1c0
0000000000038b94	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000038b98	mov	x19, x0
0000000000038b9c	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
0000000000038ba0	ldr	x8, [x24, #0x28]
0000000000038ba4	cbnz	x8, 0x38bf0
0000000000038ba8	ldr	x2, [sp, #0x158]
0000000000038bac	ldr	x8, [x19]
0000000000038bb0	ldr	x8, [x8, #0x78]
0000000000038bb4	mov	x0, x19
0000000000038bb8	mov	w1, #0x0
0000000000038bbc	blr	x8
0000000000038bc0	ldr	x0, [sp, #0x158]
0000000000038bc4	cmp	x0, x19
0000000000038bc8	b.eq	0x38bf0
0000000000038bcc	cbz	x0, 0x38bdc
0000000000038bd0	ldr	x8, [x0]
0000000000038bd4	ldr	x8, [x8, #0x18]
0000000000038bd8	blr	x8
0000000000038bdc	str	x19, [sp, #0x158]
0000000000038be0	ldr	x8, [x19]
0000000000038be4	ldr	x8, [x8, #0x10]
0000000000038be8	mov	x0, x19
0000000000038bec	blr	x8
0000000000038bf0	str	xzr, [sp, #0x150]
0000000000038bf4	ldp	q0, q1, [x24]
0000000000038bf8	ldr	q2, [x24, #0x20]
0000000000038bfc	stp	q0, q1, [x26]
0000000000038c00	str	q2, [x26, #0x20]
0000000000038c04	ldr	x7, [x24]
0000000000038c08	add	x2, sp, #0x150
0000000000038c0c	add	x5, sp, #0xc0
0000000000038c10	mov	x0, x22
0000000000038c14	mov	x3, #0x0
0000000000038c18	mov	x4, #0x0
0000000000038c1c	mov	w6, #0x7
0000000000038c20	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
0000000000038c24	ldr	x0, [sp, #0x150]
0000000000038c28	stp	xzr, x0, [sp, #0x140]
0000000000038c2c	str	d8, [sp, #0x10]
0000000000038c30	stp	s14, s9, [sp, #0x18]
0000000000038c34	str	s15, [sp, #0x20]
0000000000038c38	cbz	x0, 0x38c74
0000000000038c3c	add	x8, sp, #0xc0
0000000000038c40	bl	_objc_msgSend$heliumRef
0000000000038c44	ldr	x8, [sp, #0x140]
0000000000038c48	ldr	x0, [sp, #0xc0]
0000000000038c4c	cmp	x8, x0
0000000000038c50	b.eq	0x38c94
0000000000038c54	cbz	x8, 0x38c6c
0000000000038c58	ldr	x9, [x8]
0000000000038c5c	ldr	x9, [x9, #0x18]
0000000000038c60	mov	x0, x8
0000000000038c64	blr	x9
0000000000038c68	ldr	x0, [sp, #0xc0]
0000000000038c6c	str	x0, [sp, #0x140]
0000000000038c70	b	0x38ca4
0000000000038c74	ldr	x0, [sp, #0x158]
0000000000038c78	cbz	x0, 0x38c8c
0000000000038c7c	str	x0, [sp, #0x140]
0000000000038c80	ldr	x8, [x0]
0000000000038c84	ldr	x8, [x8, #0x10]
0000000000038c88	blr	x8
0000000000038c8c	str	x23, [sp, #0x150]
0000000000038c90	b	0x38ca4
0000000000038c94	cbz	x8, 0x38ca4
0000000000038c98	ldr	x8, [x0]
0000000000038c9c	ldr	x8, [x8, #0x18]
0000000000038ca0	blr	x8
0000000000038ca4	mov	x8, #0x3ff0000000000000
0000000000038ca8	str	x8, [sp, #0x138]
0000000000038cac	str	x8, [sp, #0x110]
0000000000038cb0	str	x8, [sp, #0xe8]
0000000000038cb4	str	x8, [sp, #0xc0]
0000000000038cb8	movi.2d	v0, #0000000000000000
0000000000038cbc	stur	q0, [x26, #0x8]
0000000000038cc0	stur	q0, [x26, #0x18]
0000000000038cc4	stp	q0, q0, [x26, #0x30]
0000000000038cc8	stur	q0, [x26, #0x58]
0000000000038ccc	stur	q0, [x26, #0x68]
0000000000038cd0	mov	x0, x23
0000000000038cd4	bl	_objc_msgSend$bounds
0000000000038cd8	mov.16b	v9, v0
0000000000038cdc	mov.16b	v8, v1
0000000000038ce0	mov.16b	v15, v2
0000000000038ce4	mov.16b	v14, v3
0000000000038ce8	ldr	x0, [sp, #0x150]
0000000000038cec	bl	_objc_msgSend$bounds
0000000000038cf0	ldrb	w8, [sp, #0x1af]
0000000000038cf4	tbz	w8, #0x0, 0x38d58
0000000000038cf8	add	x8, sp, #0xc0
0000000000038cfc	orr	x9, x8, #0x8
0000000000038d00	mov	x10, #0x3ff0000000000000
0000000000038d04	movi.2d	v4, #0000000000000000
0000000000038d08	stp	q4, q4, [x9]
0000000000038d0c	stp	q4, q4, [x8, #0x30]
0000000000038d10	stp	xzr, x10, [sp, #0x130]
0000000000038d14	stp	xzr, xzr, [sp, #0x120]
0000000000038d18	fdiv	d4, d15, d2
0000000000038d1c	fmul	d0, d15, d0
0000000000038d20	fdiv	d0, d0, d2
0000000000038d24	fsub	d0, d9, d0
0000000000038d28	str	d4, [sp, #0xc0]
0000000000038d2c	str	d0, [sp, #0xd8]
0000000000038d30	fmul	d0, d14, d1
0000000000038d34	fdiv	d0, d0, d3
0000000000038d38	fsub	d0, d8, d0
0000000000038d3c	fdiv	d1, d14, d3
0000000000038d40	str	d1, [sp, #0xe8]
0000000000038d44	str	d0, [sp, #0xf8]
0000000000038d48	adrp	x8, 561 ; 0x269000
0000000000038d4c	ldr	q0, [x8, #0x7a0]
0000000000038d50	str	q0, [x26, #0x50]
0000000000038d54	b	0x38e28
0000000000038d58	add	x27, sp, #0x2f0
0000000000038d5c	fmov.2d	v0, #1.00000000
0000000000038d60	str	q0, [x26, #0x230]
0000000000038d64	str	xzr, [sp, #0x278]
0000000000038d68	str	xzr, [sp, #0x270]
0000000000038d6c	ldr	x4, [x24]
0000000000038d70	add	x2, sp, #0x2f0
0000000000038d74	mov	x0, x25
0000000000038d78	mov	w3, #0xb
0000000000038d7c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038d80	ldr	x4, [x24]
0000000000038d84	orr	x2, x27, #0x8
0000000000038d88	mov	x0, x25
0000000000038d8c	mov	w3, #0xc
0000000000038d90	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038d94	ldr	x4, [x24]
0000000000038d98	add	x2, sp, #0x270
0000000000038d9c	mov	x0, x25
0000000000038da0	mov	w3, #0xd
0000000000038da4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038da8	add	x8, sp, #0x270
0000000000038dac	ldr	x4, [x24]
0000000000038db0	add	x2, x8, #0x8
0000000000038db4	mov	x0, x25
0000000000038db8	mov	w3, #0xe
0000000000038dbc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000038dc0	ldr	d2, [sp, #0x2f0]
0000000000038dc4	ldr	d0, [sp, #0x2f8]
0000000000038dc8	fmov	d1, #1.00000000
0000000000038dcc	fcmp	d2, d1
0000000000038dd0	b.eq	0x38de4
0000000000038dd4	ldp	q3, q4, [x26]
0000000000038dd8	fmul.2d	v3, v3, v2[0]
0000000000038ddc	fmul.2d	v2, v4, v2[0]
0000000000038de0	stp	q3, q2, [x26]
0000000000038de4	fcmp	d0, d1
0000000000038de8	b.eq	0x38dfc
0000000000038dec	ldp	q1, q2, [x26, #0x20]
0000000000038df0	fmul.2d	v1, v1, v0[0]
0000000000038df4	fmul.2d	v0, v2, v0[0]
0000000000038df8	stp	q1, q0, [x26, #0x20]
0000000000038dfc	ldr	d0, [sp, #0x270]
0000000000038e00	ldr	d1, [sp, #0x278]
0000000000038e04	fmul	d0, d15, d0
0000000000038e08	fmul	d1, d14, d1
0000000000038e0c	mov	x8, #0x4059000000000000
0000000000038e10	fmov	d2, x8
0000000000038e14	fdiv	d0, d0, d2
0000000000038e18	fdiv	d1, d1, d2
0000000000038e1c	add	x0, sp, #0xc0
0000000000038e20	movi.2d	v2, #0000000000000000
0000000000038e24	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
0000000000038e28	add	x8, sp, #0x1f0
0000000000038e2c	mov	x0, x22
0000000000038e30	mov	x2, x23
0000000000038e34	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000038e38	add	x8, sp, #0x270
0000000000038e3c	add	x0, sp, #0x1f0
0000000000038e40	add	x1, sp, #0xc0
0000000000038e44	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
0000000000038e48	ldr	x2, [sp, #0x150]
0000000000038e4c	add	x8, sp, #0x38
0000000000038e50	mov	x0, x22
0000000000038e54	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000038e58	add	x8, sp, #0x2f0
0000000000038e5c	add	x0, sp, #0x270
0000000000038e60	add	x1, sp, #0x38
0000000000038e64	bl	__ZNK14PCMatrix44TmplIdEmlERKS0_
0000000000038e68	add	x8, sp, #0xb8
0000000000038e6c	add	x0, sp, #0x2f0
0000000000038e70	add	x1, sp, #0x140
0000000000038e74	mov	w2, #0x1
0000000000038e78	mov	w3, #0x0
0000000000038e7c	bl	0x251c24 ; symbol stub for: __ZN9FxSupport15makeHeliumXFormERK14PCMatrix44TmplIdERK5HGRefI6HGNodeEbb
0000000000038e80	ldr	x8, [sp, #0x140]
0000000000038e84	ldr	x0, [sp, #0xb8]
0000000000038e88	cmp	x8, x0
0000000000038e8c	b.eq	0x38eb0
0000000000038e90	cbz	x8, 0x38ea8
0000000000038e94	ldr	x9, [x8]
0000000000038e98	ldr	x9, [x9, #0x18]
0000000000038e9c	mov	x0, x8
0000000000038ea0	blr	x9
0000000000038ea4	ldr	x0, [sp, #0xb8]
0000000000038ea8	str	x0, [sp, #0x140]
0000000000038eac	b	0x38ec0
0000000000038eb0	cbz	x8, 0x38ec0
0000000000038eb4	ldr	x8, [x0]
0000000000038eb8	ldr	x8, [x8, #0x18]
0000000000038ebc	blr	x8
0000000000038ec0	mov	x8, #0x0
0000000000038ec4	adrp	x9, 561 ; 0x269000
0000000000038ec8	ldr	d0, [x9, #0xa48]
0000000000038ecc	fmul	d1, d13, d0
0000000000038ed0	fcvt	s15, d1
0000000000038ed4	fmul	d0, d12, d0
0000000000038ed8	fcvt	s12, d0
0000000000038edc	fmov	s0, #0.50000000
0000000000038ee0	fmul	s1, s15, s0
0000000000038ee4	fmul	s0, s12, s0
0000000000038ee8	fmul	s2, s1, s1
0000000000038eec	fmul	s3, s0, s0
0000000000038ef0	fadd	s2, s2, s3
0000000000038ef4	adrp	x9, 561 ; 0x269000
0000000000038ef8	ldr	s3, [x9, #0xa50]
0000000000038efc	fadd	s2, s2, s3
0000000000038f00	fsqrt	s2, s2
0000000000038f04	fmul	s9, s1, s2
0000000000038f08	fmul	s13, s0, s2
0000000000038f0c	adrp	x9, 561 ; 0x269000
0000000000038f10	ldr	s0, [x9, #0xa54]
0000000000038f14	fmul	s14, s2, s0
0000000000038f18	ldr	d0, [sp, #0x1e8]
0000000000038f1c	ldr	s1, [sp, #0x20]
0000000000038f20	fcvt	d1, s1
0000000000038f24	cmp	w21, #0x0
0000000000038f28	fmov	d2, #1.00000000
0000000000038f2c	fcsel	d1, d2, d1, eq
0000000000038f30	fdiv	d0, d0, d1
0000000000038f34	fcvt	s0, d0
0000000000038f38	adrp	x24, 561 ; 0x269000
0000000000038f3c	ldr	q1, [x24, #0xa60]
0000000000038f40	movi.2d	v8, #0000000000000000
0000000000038f44	fmov.2d	v17, #-3.50000000
0000000000038f48	add	x9, sp, #0x2f0
0000000000038f4c	movi.2d	v2, #0000000000000000
0000000000038f50	add	x10, sp, #0x270
0000000000038f54	fmov.2d	v18, #4.50000000
0000000000038f58	add	x11, sp, #0x1f0
0000000000038f5c	movi.4s	v3, #0x4
0000000000038f60	ushll.2d	v4, v1, #0x0
0000000000038f64	ucvtf.2d	v4, v4
0000000000038f68	ushll2.2d	v5, v1, #0x0
0000000000038f6c	ucvtf.2d	v5, v5
0000000000038f70	fadd.2d	v5, v5, v17
0000000000038f74	fadd.2d	v4, v4, v17
0000000000038f78	fcvtn	v6.2s, v4.2d
0000000000038f7c	fcvtn2	v6.4s, v5.2d
0000000000038f80	fmul.4s	v7, v6, v0[0]
0000000000038f84	str	q7, [x9, x8]
0000000000038f88	fmul.4s	v6, v6, v2
0000000000038f8c	str	q6, [x10, x8]
0000000000038f90	fabs.2d	v4, v4
0000000000038f94	fabs.2d	v5, v5
0000000000038f98	fsub.2d	v5, v18, v5
0000000000038f9c	fsub.2d	v4, v18, v4
0000000000038fa0	fcvtn	v4.2s, v4.2d
0000000000038fa4	mov	s6, v4[1]
0000000000038fa8	fadd	s7, s8, s4
0000000000038fac	fcvtn2	v4.4s, v5.2d
0000000000038fb0	fcvtn	v5.2s, v5.2d
0000000000038fb4	mov	s16, v5[1]
0000000000038fb8	str	q4, [x11, x8]
0000000000038fbc	fadd	s4, s7, s6
0000000000038fc0	fadd	s4, s4, s5
0000000000038fc4	fadd	s8, s4, s16
0000000000038fc8	add.4s	v1, v1, v3
0000000000038fcc	add	x8, x8, #0x10
0000000000038fd0	cmp	x8, #0x20
0000000000038fd4	b.ne	0x38f60
0000000000038fd8	str	q18, [sp]
0000000000038fdc	str	q17, [sp, #0x20]
0000000000038fe0	fmov	s0, #1.00000000
0000000000038fe4	fdiv	s0, s0, s8
0000000000038fe8	ldp	q1, q2, [x26, #0x130]
0000000000038fec	fmul.4s	v1, v1, v0[0]
0000000000038ff0	fmul.4s	v0, v2, v0[0]
0000000000038ff4	stp	q1, q0, [x26, #0x130]
0000000000038ff8	mov	w0, #0x1b0
0000000000038ffc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000039000	mov	x21, x0
0000000000039004	bl	__ZN25HgcConvolvePass8tapIndentC2Ev
0000000000039008	adrp	x25, 867 ; 0x39c000
000000000003900c	add	x25, x25, #0x7d8
0000000000039010	add	x8, x25, #0x10
0000000000039014	str	x8, [x21]
0000000000039018	ldr	x2, [sp, #0x140]
000000000003901c	ldr	x23, [x25, #0x88]
0000000000039020	mov	x0, x21
0000000000039024	mov	w1, #0x0
0000000000039028	blr	x23
000000000003902c	mov	x22, #0x0
0000000000039030	add	x27, sp, #0x2f0
0000000000039034	add	x28, sp, #0x270
0000000000039038	ldr	s0, [x27, x22, lsl #2]
000000000003903c	ldr	s1, [x28, x22, lsl #2]
0000000000039040	ldr	x8, [x21]
0000000000039044	ldr	x8, [x8, #0x60]
0000000000039048	movi.2d	v2, #0000000000000000
000000000003904c	movi.2d	v3, #0000000000000000
0000000000039050	mov	x0, x21
0000000000039054	mov	x1, x22
0000000000039058	blr	x8
000000000003905c	add	x22, x22, #0x1
0000000000039060	cmp	x22, #0x8
0000000000039064	b.ne	0x39038
0000000000039068	ldr	s0, [sp, #0x1f0]
000000000003906c	ldr	s1, [sp, #0x1f4]
0000000000039070	ldr	s2, [sp, #0x1f8]
0000000000039074	ldr	s3, [sp, #0x1fc]
0000000000039078	ldr	x8, [x21]
000000000003907c	ldr	x8, [x8, #0x60]
0000000000039080	mov	x0, x21
0000000000039084	mov	w1, #0x8
0000000000039088	blr	x8
000000000003908c	ldr	s0, [sp, #0x200]
0000000000039090	ldr	s1, [sp, #0x204]
0000000000039094	ldr	s2, [sp, #0x208]
0000000000039098	ldr	s3, [sp, #0x20c]
000000000003909c	ldr	x8, [x21]
00000000000390a0	ldr	x8, [x8, #0x60]
00000000000390a4	mov	x0, x21
00000000000390a8	mov	w1, #0x9
00000000000390ac	blr	x8
00000000000390b0	ldr	x8, [x21]
00000000000390b4	ldr	x8, [x8, #0x60]
00000000000390b8	mov	x0, x21
00000000000390bc	mov	w1, #0xa
00000000000390c0	mov.16b	v0, v11
00000000000390c4	mov.16b	v1, v10
00000000000390c8	ldp	s2, s3, [sp, #0x18]
00000000000390cc	blr	x8
00000000000390d0	ldr	x8, [x21]
00000000000390d4	ldr	x8, [x8, #0x60]
00000000000390d8	fmov	s0, #1.00000000
00000000000390dc	fmov	s1, #1.00000000
00000000000390e0	movi.2d	v2, #0000000000000000
00000000000390e4	movi.2d	v3, #0000000000000000
00000000000390e8	mov	x0, x21
00000000000390ec	mov	w1, #0xb
00000000000390f0	blr	x8
00000000000390f4	mov	x8, #0x0
00000000000390f8	ldr	d0, [sp, #0x1e8]
00000000000390fc	ldr	d1, [sp, #0x10]
0000000000039100	fdiv	d0, d0, d1
0000000000039104	fcvt	s0, d0
0000000000039108	ldr	q1, [x24, #0xa60]
000000000003910c	movi.2d	v2, #0000000000000000
0000000000039110	add	x9, sp, #0x2f0
0000000000039114	add	x10, sp, #0x270
0000000000039118	add	x11, sp, #0x1f0
000000000003911c	movi.4s	v3, #0x4
0000000000039120	ldr	q17, [sp, #0x20]
0000000000039124	ldr	q18, [sp]
0000000000039128	ushll.2d	v4, v1, #0x0
000000000003912c	ucvtf.2d	v4, v4
0000000000039130	ushll2.2d	v5, v1, #0x0
0000000000039134	ucvtf.2d	v5, v5
0000000000039138	fadd.2d	v5, v5, v17
000000000003913c	fadd.2d	v4, v4, v17
0000000000039140	fcvtn	v6.2s, v4.2d
0000000000039144	fcvtn2	v6.4s, v5.2d
0000000000039148	fmul.4s	v7, v6, v2
000000000003914c	str	q7, [x9, x8]
0000000000039150	fmul.4s	v6, v6, v0[0]
0000000000039154	str	q6, [x10, x8]
0000000000039158	fabs.2d	v4, v4
000000000003915c	fabs.2d	v5, v5
0000000000039160	fsub.2d	v5, v18, v5
0000000000039164	fsub.2d	v4, v18, v4
0000000000039168	fcvtn	v4.2s, v4.2d
000000000003916c	mov	s6, v4[1]
0000000000039170	fadd	s7, s8, s4
0000000000039174	fcvtn2	v4.4s, v5.2d
0000000000039178	fcvtn	v5.2s, v5.2d
000000000003917c	mov	s16, v5[1]
0000000000039180	str	q4, [x11, x8]
0000000000039184	fadd	s4, s7, s6
0000000000039188	fadd	s4, s4, s5
000000000003918c	fadd	s8, s4, s16
0000000000039190	add.4s	v1, v1, v3
0000000000039194	add	x8, x8, #0x10
0000000000039198	cmp	x8, #0x20
000000000003919c	b.ne	0x39128
00000000000391a0	fmov	s0, #1.00000000
00000000000391a4	fdiv	s0, s0, s8
00000000000391a8	ldp	q1, q2, [x26, #0x130]
00000000000391ac	fmul.4s	v1, v1, v0[0]
00000000000391b0	fmul.4s	v0, v2, v0[0]
00000000000391b4	stp	q1, q0, [x26, #0x130]
00000000000391b8	mov	w0, #0x1b0
00000000000391bc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000391c0	mov	x22, x0
00000000000391c4	bl	__ZN25HgcConvolvePass8tapIndentC2Ev
00000000000391c8	add	x8, x25, #0x10
00000000000391cc	str	x8, [x22]
00000000000391d0	mov	x0, x22
00000000000391d4	mov	w1, #0x0
00000000000391d8	mov	x2, x21
00000000000391dc	blr	x23
00000000000391e0	mov	x23, #0x0
00000000000391e4	add	x24, sp, #0x2f0
00000000000391e8	add	x25, sp, #0x270
00000000000391ec	ldr	s0, [x24, x23, lsl #2]
00000000000391f0	ldr	s1, [x25, x23, lsl #2]
00000000000391f4	ldr	x8, [x22]
00000000000391f8	ldr	x8, [x8, #0x60]
00000000000391fc	movi.2d	v2, #0000000000000000
0000000000039200	movi.2d	v3, #0000000000000000
0000000000039204	mov	x0, x22
0000000000039208	mov	x1, x23
000000000003920c	blr	x8
0000000000039210	add	x23, x23, #0x1
0000000000039214	cmp	x23, #0x8
0000000000039218	b.ne	0x391ec
000000000003921c	ldr	s0, [sp, #0x1f0]
0000000000039220	ldr	s1, [sp, #0x1f4]
0000000000039224	ldr	s2, [sp, #0x1f8]
0000000000039228	ldr	s3, [sp, #0x1fc]
000000000003922c	ldr	x8, [x22]
0000000000039230	ldr	x8, [x8, #0x60]
0000000000039234	mov	x0, x22
0000000000039238	mov	w1, #0x8
000000000003923c	blr	x8
0000000000039240	ldr	s0, [sp, #0x200]
0000000000039244	ldr	s1, [sp, #0x204]
0000000000039248	ldr	s2, [sp, #0x208]
000000000003924c	ldr	s3, [sp, #0x20c]
0000000000039250	ldr	x8, [x22]
0000000000039254	ldr	x8, [x8, #0x60]
0000000000039258	mov	x0, x22
000000000003925c	mov	w1, #0x9
0000000000039260	blr	x8
0000000000039264	ldr	x8, [x22]
0000000000039268	ldr	x8, [x8, #0x60]
000000000003926c	mov	w9, #0x3b800000
0000000000039270	fmov	s1, w9
0000000000039274	fmov	s0, #1.00000000
0000000000039278	movi.2d	v2, #0000000000000000
000000000003927c	movi.2d	v3, #0000000000000000
0000000000039280	mov	x0, x22
0000000000039284	mov	w1, #0xa
0000000000039288	blr	x8
000000000003928c	ldr	x8, [x22]
0000000000039290	ldr	x8, [x8, #0x60]
0000000000039294	fmov	s0, #1.00000000
0000000000039298	fmov	s1, #1.00000000
000000000003929c	movi.2d	v2, #0000000000000000
00000000000392a0	movi.2d	v3, #0000000000000000
00000000000392a4	mov	x0, x22
00000000000392a8	mov	w1, #0xb
00000000000392ac	blr	x8
00000000000392b0	ldr	d8, [sp, #0x1e8]
00000000000392b4	mov	w0, #0x1b0
00000000000392b8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000392bc	mov	x23, x0
00000000000392c0	bl	__ZN9HgcIndentC1Ev
00000000000392c4	str	x23, [sp, #0x38]
00000000000392c8	ldr	x2, [sp, #0x158]
00000000000392cc	ldr	x8, [x23]
00000000000392d0	ldr	x8, [x8, #0x78]
00000000000392d4	mov	x0, x23
00000000000392d8	mov	w1, #0x0
00000000000392dc	blr	x8
00000000000392e0	ldr	x0, [sp, #0x38]
00000000000392e4	ldr	x8, [x0]
00000000000392e8	ldr	x8, [x8, #0x78]
00000000000392ec	mov	w1, #0x1
00000000000392f0	mov	x2, x22
00000000000392f4	blr	x8
00000000000392f8	ldr	x0, [sp, #0x38]
00000000000392fc	ldr	x8, [x0]
0000000000039300	ldr	x8, [x8, #0x60]
0000000000039304	adrp	x9, 560 ; 0x269000
0000000000039308	ldr	s2, [x9, #0xa58]
000000000003930c	movi.2d	v3, #0000000000000000
0000000000039310	mov	w1, #0x0
0000000000039314	mov.16b	v0, v15
0000000000039318	mov.16b	v1, v12
000000000003931c	blr	x8
0000000000039320	ldr	x0, [sp, #0x38]
0000000000039324	ldr	x8, [x0]
0000000000039328	ldr	x8, [x8, #0x60]
000000000003932c	mov	w9, #0x3b800000
0000000000039330	fmov	s1, w9
0000000000039334	fmov	s0, #1.00000000
0000000000039338	movi.2d	v2, #0000000000000000
000000000003933c	movi.2d	v3, #0000000000000000
0000000000039340	mov	w1, #0x1
0000000000039344	blr	x8
0000000000039348	ldr	x0, [sp, #0x38]
000000000003934c	ldr	d0, [sp, #0x1e0]
0000000000039350	fcvt	s0, d0
0000000000039354	ldr	x8, [x0]
0000000000039358	ldr	x8, [x8, #0x60]
000000000003935c	movi.2d	v1, #0000000000000000
0000000000039360	movi.2d	v2, #0000000000000000
0000000000039364	movi.2d	v3, #0000000000000000
0000000000039368	mov	w1, #0x2
000000000003936c	blr	x8
0000000000039370	ldr	x0, [sp, #0x38]
0000000000039374	ldr	d0, [sp, #0x1d0]
0000000000039378	fcvt	s0, d0
000000000003937c	ldr	x8, [x0]
0000000000039380	ldr	x8, [x8, #0x60]
0000000000039384	movi.2d	v1, #0000000000000000
0000000000039388	movi.2d	v2, #0000000000000000
000000000003938c	movi.2d	v3, #0000000000000000
0000000000039390	mov	w1, #0x3
0000000000039394	blr	x8
0000000000039398	ldr	x0, [sp, #0x38]
000000000003939c	ldr	d0, [sp, #0x1d8]
00000000000393a0	fcvt	s0, d0
00000000000393a4	ldr	x8, [x0]
00000000000393a8	ldr	x8, [x8, #0x60]
00000000000393ac	movi.2d	v1, #0000000000000000
00000000000393b0	movi.2d	v2, #0000000000000000
00000000000393b4	movi.2d	v3, #0000000000000000
00000000000393b8	mov	w1, #0x4
00000000000393bc	blr	x8
00000000000393c0	ldr	x0, [sp, #0x38]
00000000000393c4	ldr	x8, [x0]
00000000000393c8	ldr	x8, [x8, #0x60]
00000000000393cc	movi.2d	v3, #0000000000000000
00000000000393d0	mov	w1, #0x5
00000000000393d4	mov.16b	v0, v9
00000000000393d8	mov.16b	v1, v13
00000000000393dc	mov.16b	v2, v14
00000000000393e0	blr	x8
00000000000393e4	ldr	x0, [sp, #0x38]
00000000000393e8	ldr	d0, [sp, #0x1b0]
00000000000393ec	fadd	d0, d0, d0
00000000000393f0	fmov	d1, #1.00000000
00000000000393f4	fdiv	d0, d1, d0
00000000000393f8	fcvt	s0, d0
00000000000393fc	ldr	x8, [x0]
0000000000039400	ldr	x8, [x8, #0x60]
0000000000039404	movi.2d	v1, #0000000000000000
0000000000039408	movi.2d	v2, #0000000000000000
000000000003940c	movi.2d	v3, #0000000000000000
0000000000039410	mov	w1, #0x6
0000000000039414	blr	x8
0000000000039418	ldr	x0, [sp, #0x38]
000000000003941c	ldr	d0, [sp, #0x1b8]
0000000000039420	fcvt	s0, d0
0000000000039424	ldr	x8, [x0]
0000000000039428	ldr	x8, [x8, #0x60]
000000000003942c	movi.2d	v1, #0000000000000000
0000000000039430	movi.2d	v2, #0000000000000000
0000000000039434	movi.2d	v3, #0000000000000000
0000000000039438	mov	w1, #0x7
000000000003943c	blr	x8
0000000000039440	fmov	d0, #8.00000000
0000000000039444	fmul	d0, d8, d0
0000000000039448	fmov	d1, #1.00000000
000000000003944c	fadd	d0, d0, d1
0000000000039450	fcvt	s0, d0
0000000000039454	ldr	x0, [sp, #0x38]
0000000000039458	ldr	x8, [x0]
000000000003945c	ldr	x8, [x8, #0x60]
0000000000039460	movi.2d	v1, #0000000000000000
0000000000039464	movi.2d	v2, #0000000000000000
0000000000039468	movi.2d	v3, #0000000000000000
000000000003946c	mov	w1, #0x8
0000000000039470	blr	x8
0000000000039474	add	x2, sp, #0x38
0000000000039478	mov	x0, x20
000000000003947c	bl	"_objc_msgSend$setHeliumRef:"
0000000000039480	ldr	x0, [sp, #0x38]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)
    - parm8 (int)
    - parm3 (float)
    - parm9 (float)
    - parm10 (bool)
    - parm11 (float)
    - parm12 (float)
    - parm13 (float)
    - parm14 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm10 (bool), parm11 (float), parm13 (float)
    slot 8  <-  (constant / computed)
    slot 9  <-  (constant / computed)
    slot 10  <-  (constant / computed)
    slot 11  <-  (constant / computed)
    slot 0  <-  parm10 (bool)
    slot 8  <-  (constant / computed)
    slot 9  <-  (constant / computed)
    slot 10  <-  (constant / computed)
    slot 11  <-  (constant / computed)
    slot 0  <-  parm10 (bool)
    slot 1  <-  (constant / computed)
    slot 2  <-  parm2 (float)
    slot 3  <-  parm5 (float)
    slot 4  <-  parm4 (float)
    slot 5  <-  (constant / computed)
    slot 6  <-  parm9 (float)
    slot 7  <-  parm3 (float)
    slot 8  <-  (constant / computed)
```
