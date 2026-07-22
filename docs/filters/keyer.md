# Keyer

- **PAE class:** `Keyer`
- **Plugin UUID:** `41122549-B8A6-470E-94DA-211294D20B62`
- **Node names in corpus:** Keyer (44), Green Screen Keyer (1)
- **Corpus usage:** 22 files, 45 instances

## What it does

Keyer is FCP's flagship chroma/color keyer: it pulls a matte from a green- or blue-screen automatically (Autokey samples the dominant backing color) and knocks it out, with grouped controls for color selection, spill suppression, matte tools, and light wrap. In this corpus it appears mostly at defaults with an auto-sampled key. It is a full compositing keyer, not a simple image filter.

> **Note.** Not implemented. Many of this filter's real_params are persisted internal keyer engine state (MinGreen/MaxGreen/GreenChroma/Strength/etc.) rather than user knobs; only the user-facing groups are documented here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Color Selection | group | - | - | The sampled backing color(s) and their selection tolerance. *(keyframed in 4 instances)* |
| Spill Suppression | group | - | - | Removes green/blue spill from the retained foreground. |
| Edge Distance | enum(int) | 3 | 0 .. 3 | Matte edge tightness (0-3). |
| Fill Holes | enum(int) | 0 | 0 .. 10 | Fills small transparent holes in the matte, 0-10. |
| Invert | bool | 0 | 0 .. 1 | Invert the matte (key the foreground instead of the backing). |
| Matte Tools | group | - | - | Shrink/erode/feather/levels controls on the pulled matte. |
| Light Wrap | group | - | - | Wraps background light around the foreground edges for realistic compositing. |
| Preserve RGB | bool | 0 | 0 .. 0 | Keep original RGB values rather than premultiplying by the matte. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the keyed result, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 14 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcAlphaMult`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcAlphaMult` → [`HgcAlphaMult.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcAlphaMult.metal)

```metal
//Metal1.0     
//LEN=0000000146
[[ visible ]] FragmentOut HgcAlphaMult_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    output.color0.xyz = r0.xyz;
    output.color0.w = r0.w*r1.w;
    return output;
}
```

### Metal fragment shader — `HgcCopyAlpha`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcCopyAlpha` → [`HgcCopyAlpha.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcCopyAlpha.metal)

```metal
//Metal1.0     
//LEN=0000000147
[[ visible ]] FragmentOut HgcCopyAlpha_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.w = color1.w;
    output.color0 = select(r0, r1.wwww, hg_Params[0] < 0.00000f);
    return output;
}
```

### Metal fragment shader — `HgcPostKeyer`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPostKeyer` → [`HgcPostKeyer.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPostKeyer.metal)

```metal
//Metal1.0     
//LEN=0000000265
[[ visible ]] FragmentOut HgcPostKeyer_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2)
{
    const float4 c0 = float4(1.500000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.w = clamp(color0.w, 0.00000f, 1.00000f);
    r1.w = color1.w;
    r2.xyz = color2.xyz;
    r2.w = r0.w*r1.w;
    r0.xyz = r2.xyz*r2.www;
    r0.w = r2.w;
    r1.xyz = r2.www*c0.xxx;
    r2.xyz = fmin(r2.xyz, r1.xyz);
    output.color0 = select(r2, r0, hg_Params[0] < 0.00000f);
    return output;
}
```

### Metal fragment shader — `HgcSpillRemoval`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSpillRemoval` → [`HgcSpillRemoval.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSpillRemoval.metal)

```metal
//Metal1.0     
//LEN=00000003a7
[[ visible ]] FragmentOut HgcSpillRemoval_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(8.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = float3(dot(r0, hg_Params[4]));
    r2.xyz = abs(r2.xyz);
    r1.xyz = r2.xyz*hg_Params[5].xyz + r1.xyz;
    r3.x = dot(r0, hg_Params[0]);
    r3.y = dot(r0, hg_Params[1]);
    r3.z = dot(r0, hg_Params[2]);
    r4.x = dot(r0, hg_Params[6]);
    r4.y = dot(r0, hg_Params[7]);
    r4.z = dot(r0, hg_Params[8]);
    r2.xyz = clamp(r2.xyz*hg_Params[9].xyz, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r4.xyz, r2.xyz);
    r1.xyz = clamp(r1.xyz*c0.xxx + c0.yyy, 0.00000f, 1.00000f);
    output.color0.xyz = mix(r3.xyz, r0.xyz, r1.xyz);
    output.color0.w = r0.w;
    return output;
}
```

### Metal fragment shader — `HgcSpillRemovalDarkEdges`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSpillRemovalDarkEdges` → [`HgcSpillRemovalDarkEdges.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSpillRemovalDarkEdges.metal)

```metal
//Metal1.0     
//LEN=00000005f4
[[ visible ]] FragmentOut HgcSpillRemovalDarkEdges_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(8.000000000, 1.000000000, 0.000000000, 0.000000000);
    const float4 c1 = float4(-0.1145000011, -0.3855000138, 0.5000000000, 0.000000000);
    const float4 c2 = float4(0.5016000271, -0.4555999935, -0.04589999840, 0.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = float3(dot(r0, hg_Params[4]));
    r2.xyz = abs(r2.xyz);
    r1.xyz = r2.xyz*hg_Params[5].xyz + r1.xyz;
    r3.x = dot(r0, hg_Params[0]);
    r3.y = dot(r0, hg_Params[1]);
    r3.z = dot(r0, hg_Params[2]);
    r4.x = dot(r0, hg_Params[6]);
    r4.y = dot(r0, hg_Params[7]);
    r4.z = dot(r0, hg_Params[8]);
    r2.xyz = clamp(r2.xyz*hg_Params[9].xyz, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r4.xyz, r2.xyz);
    r1.xyz = clamp(r1.xyz*c0.xxx + c0.yyy, 0.00000f, 1.00000f);
    r3.xyz = mix(r3.xyz, r0.xyz, r1.xyz);
    r2.xyz = r0.xyz - r3.xyz;
    r2.xyz = abs(r2.xyz);
    r2.w = dot(r2.xyz, 1.00000f);
    r2.w = clamp(r2.w + r2.w, 0.00000f, 1.00000f);
    r4.x = dot(r3.xyz, c1.xyz);
    r4.y = dot(r3.xyz, c2.xyz);
    r4.w = fmax(r4.x, r4.y);
    r4.w = clamp(r4.w*hg_Params[11].w, 0.00000f, 1.00000f);
    r2.w = r2.w*-r4.w + r2.w;
    r1.xyz = r3.xyz*hg_Params[10].xyz;
    output.color0.xyz = mix(r3.xyz, r1.xyz, r2.www);
    output.color0.w = r0.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEKeyer canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEKeyer`

```asm
00000000000e6d20	mov	w3, #0x32
00000000000e6d24	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000e6d28	adrp	x8, 893 ; 0x463000
00000000000e6d2c	add	x0, x8, #0x1c8
00000000000e6d30	bl	0x252284 ; symbol stub for: _objc_alloc
00000000000e6d34	mov	x22, x0
00000000000e6d38	ldr	x23, [x21, x19]
00000000000e6d3c	mov	x0, x21
00000000000e6d40	bl	_objc_msgSend$getColorPrimaries
00000000000e6d44	mov	x3, x0
00000000000e6d48	ldr	x4, [x24]
00000000000e6d4c	mov	x0, x22
00000000000e6d50	mov	x2, x23
00000000000e6d54	bl	"_objc_msgSend$initWithAPIManager:colorPrimaries:atTime:"
00000000000e6d58	mov	x22, x0
00000000000e6d5c	ldr	x2, [x24]
00000000000e6d60	bl	"_objc_msgSend$keyerActiveAt:"
00000000000e6d64	mov	x26, x0
00000000000e6d68	str	x22, [sp, #0x30]
00000000000e6d6c	mov	x0, x22
00000000000e6d70	bl	_objc_msgSend$omKeyer
00000000000e6d74	str	x0, [sp, #0x28]
00000000000e6d78	cbz	w26, 0xe6e40
00000000000e6d7c	ldur	x0, [x29, #-0xa8]
00000000000e6d80	str	x0, [sp, #0x130]
00000000000e6d84	cbz	x0, 0xe6d94
00000000000e6d88	ldr	x8, [x0]
00000000000e6d8c	ldr	x8, [x8, #0x10]
00000000000e6d90	blr	x8
00000000000e6d94	ldr	x4, [x24]
00000000000e6d98	add	x8, sp, #0xc0
00000000000e6d9c	add	x2, sp, #0x130
00000000000e6da0	mov	x0, x21
00000000000e6da4	ldr	x3, [sp, #0x28]
00000000000e6da8	bl	"_objc_msgSend$getKeyerNode:omKeyer:atTime:"
00000000000e6dac	ldr	x0, [sp, #0x130]
00000000000e6db0	cbz	x0, 0xe6dc0
00000000000e6db4	ldr	x8, [x0]
00000000000e6db8	ldr	x8, [x8, #0x18]
00000000000e6dbc	blr	x8
00000000000e6dc0	ldur	x8, [x29, #-0xa8]
00000000000e6dc4	ldr	x0, [sp, #0xc0]
00000000000e6dc8	cmp	x8, x0
00000000000e6dcc	b.eq	0xe6dfc
00000000000e6dd0	cbz	x8, 0xe6de8
00000000000e6dd4	ldr	x9, [x8]
00000000000e6dd8	ldr	x9, [x9, #0x18]
00000000000e6ddc	mov	x0, x8
00000000000e6de0	blr	x9
00000000000e6de4	ldr	x0, [sp, #0xc0]
00000000000e6de8	stur	x0, [x29, #-0xa8]
00000000000e6dec	cbz	x0, 0xe6dfc
00000000000e6df0	ldr	x8, [x0]
00000000000e6df4	ldr	x8, [x8, #0x10]
00000000000e6df8	blr	x8
00000000000e6dfc	mov	x0, x21
00000000000e6e00	bl	_objc_msgSend$isLumaKey
00000000000e6e04	mov	x22, x0
00000000000e6e08	mov	x0, x21
00000000000e6e0c	bl	_objc_msgSend$isLumaKey
00000000000e6e10	mov	x23, x0
00000000000e6e14	ldr	x0, [sp, #0xc0]
00000000000e6e18	cbz	x0, 0xe6e28
00000000000e6e1c	ldr	x8, [x0]
00000000000e6e20	ldr	x8, [x8, #0x18]
00000000000e6e24	blr	x8
00000000000e6e28	eor	w8, w22, #0x1
00000000000e6e2c	str	w8, [sp, #0x24]
00000000000e6e30	eor	w23, w23, #0x1
00000000000e6e34	b	0xe6e88
00000000000e6e38	mov	w23, #0x0
00000000000e6e3c	b	0xe77f0
00000000000e6e40	strb	wzr, [sp, #0x13f]
00000000000e6e44	ldur	x8, [x29, #-0xa8]
00000000000e6e48	ldur	x0, [x29, #-0x90]
00000000000e6e4c	cmp	x8, x0
00000000000e6e50	b.eq	0xe6e80
00000000000e6e54	cbz	x8, 0xe6e6c
00000000000e6e58	ldr	x9, [x8]
00000000000e6e5c	ldr	x9, [x9, #0x18]
00000000000e6e60	mov	x0, x8
00000000000e6e64	blr	x9
00000000000e6e68	ldur	x0, [x29, #-0x90]
00000000000e6e6c	stur	x0, [x29, #-0xa8]
00000000000e6e70	cbz	x0, 0xe6e80
00000000000e6e74	ldr	x8, [x0]
00000000000e6e78	ldr	x8, [x8, #0x10]
00000000000e6e7c	blr	x8
00000000000e6e80	mov	w23, #0x0
00000000000e6e84	str	wzr, [sp, #0x24]
00000000000e6e88	adrp	x8, 888 ; 0x45e000
00000000000e6e8c	ldrsw	x8, [x8, #0xd40]
00000000000e6e90	ldr	x22, [x21, x8]
00000000000e6e94	ldp	q0, q1, [x24]
00000000000e6e98	stp	q0, q1, [sp, #0xc0]
00000000000e6e9c	ldr	q0, [x24, #0x20]
00000000000e6ea0	str	q0, [sp, #0xe0]
00000000000e6ea4	ldrb	w28, [sp, #0x13f]
00000000000e6ea8	mov	x0, x21
00000000000e6eac	bl	_objc_msgSend$getBlendingGamma
00000000000e6eb0	mov.16b	v2, v0
00000000000e6eb4	sub	x8, x29, #0xa8
00000000000e6eb8	sub	x9, x29, #0xb0
00000000000e6ebc	stp	x9, x8, [sp, #0x8]
00000000000e6ec0	mov	w8, #0x1
00000000000e6ec4	strb	w8, [sp]
00000000000e6ec8	add	x4, sp, #0xc0
00000000000e6ecc	mov	x0, x22
00000000000e6ed0	mov	x2, x25
00000000000e6ed4	mov	x3, x27
00000000000e6ed8	mov.16b	v0, v9
00000000000e6edc	mov.16b	v1, v8
00000000000e6ee0	mov	x5, x28
00000000000e6ee4	mov	x6, x23
00000000000e6ee8	mov	w7, #0x1
00000000000e6eec	bl	"_objc_msgSend$doMatteManipulationWithParamAPI:withPrivateParamAPI:withInfo:pixelAspectRatio:fieldHeight:doInvertMatte:inputIsInverted:fillHoles:scaling:blendingGamma:preKeyedInputNode:outputNode:"
00000000000e6ef0	mov	x23, x0
00000000000e6ef4	tbz	w0, #0x0, 0xe6f50
00000000000e6ef8	ldr	x4, [x24]
00000000000e6efc	add	x2, sp, #0x12c
00000000000e6f00	mov	x0, x25
00000000000e6f04	mov	w3, #0x1b
00000000000e6f08	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000e6f0c	ldr	w8, [sp, #0x12c]
00000000000e6f10	cmp	w8, #0x2
00000000000e6f14	b.gt	0xe6f5c
00000000000e6f18	cmp	w8, #0x1
00000000000e6f1c	b.eq	0xe70ac
00000000000e6f20	cmp	w8, #0x2
00000000000e6f24	b.ne	0xe6f90
00000000000e6f28	ldur	x0, [x29, #-0xa8]
00000000000e6f2c	ldur	x8, [x29, #-0x90]
00000000000e6f30	cmp	x0, x8
00000000000e6f34	b.eq	0xe77a0
00000000000e6f38	cbz	x0, 0xe7318
00000000000e6f3c	ldr	x8, [x0]
00000000000e6f40	ldr	x8, [x8, #0x18]
00000000000e6f44	blr	x8
00000000000e6f48	ldur	x8, [x29, #-0x90]
00000000000e6f4c	b	0xe7318
00000000000e6f50	ldr	x0, [sp, #0x30]
00000000000e6f54	bl	0x252344 ; symbol stub for: _objc_release
00000000000e6f58	b	0xe77f0
00000000000e6f5c	cmp	w8, #0x3
00000000000e6f60	b.eq	0xe72f4
00000000000e6f64	cmp	w8, #0x4
00000000000e6f68	b.ne	0xe6f90
00000000000e6f6c	ldp	x0, x8, [x29, #-0xa8]
00000000000e6f70	cmp	x0, x8
00000000000e6f74	b.eq	0xe77a0
00000000000e6f78	cbz	x0, 0xe7318
00000000000e6f7c	ldr	x8, [x0]
00000000000e6f80	ldr	x8, [x8, #0x18]
00000000000e6f84	blr	x8
00000000000e6f88	ldur	x8, [x29, #-0xa0]
00000000000e6f8c	b	0xe7318
00000000000e6f90	ldp	x8, x0, [x29, #-0xb0]
00000000000e6f94	cmp	x8, x0
00000000000e6f98	b.eq	0xe77a0
00000000000e6f9c	mov	w0, #0x1a0
00000000000e6fa0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e6fa4	mov	x26, x0
00000000000e6fa8	bl	__ZN12HgcPostKeyerC1Ev
00000000000e6fac	ldur	x2, [x29, #-0xa8]
00000000000e6fb0	ldr	x8, [x26]
00000000000e6fb4	ldr	x8, [x8, #0x78]
00000000000e6fb8	mov	x0, x26
00000000000e6fbc	mov	w1, #0x0
00000000000e6fc0	blr	x8
00000000000e6fc4	ldur	x2, [x29, #-0xb0]
00000000000e6fc8	ldr	x8, [x26]
00000000000e6fcc	ldr	x8, [x8, #0x78]
00000000000e6fd0	mov	x0, x26
00000000000e6fd4	mov	w1, #0x1
00000000000e6fd8	blr	x8
00000000000e6fdc	ldr	x4, [x24]
00000000000e6fe0	add	x2, sp, #0xc0
00000000000e6fe4	mov	x0, x25
00000000000e6fe8	mov	w3, #0x14
00000000000e6fec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000e6ff0	ldr	d0, [sp, #0xc0]
00000000000e6ff4	fcvt	s10, d0
00000000000e6ff8	adrp	x8, 386 ; 0x268000
00000000000e6ffc	ldr	s0, [x8, #0xe28]
00000000000e7000	fcmp	s10, s0
00000000000e7004	ldr	w8, [sp, #0x24]
00000000000e7008	csel	w8, wzr, w8, lt
00000000000e700c	cmp	w8, #0x1
00000000000e7010	b.ne	0xe733c
00000000000e7014	movi.2s	v0, #0x3f, lsl #24
00000000000e7018	str	d0, [sp, #0x120]
00000000000e701c	mov	w8, #0x3f000000
00000000000e7020	str	w8, [sp, #0x128]
00000000000e7024	ldr	x4, [x24]
00000000000e7028	add	x2, sp, #0xc0
00000000000e702c	mov	x0, x25
00000000000e7030	mov	w3, #0x17
00000000000e7034	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000e7038	ldr	d9, [sp, #0xc0]
00000000000e703c	ldr	x4, [x24]
00000000000e7040	add	x2, sp, #0xc0
00000000000e7044	mov	x0, x25
00000000000e7048	mov	w3, #0x18
00000000000e704c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000e7050	ldr	d11, [sp, #0xc0]
00000000000e7054	ldr	x6, [x24]
00000000000e7058	add	x2, sp, #0x118
00000000000e705c	add	x3, sp, #0x110
00000000000e7060	add	x4, sp, #0x108
00000000000e7064	mov	x0, x27
00000000000e7068	mov	w5, #0x1a
00000000000e706c	bl	"_objc_msgSend$getLevelsBlack:White:Gamma:fromParm:atTime:"
00000000000e7070	ldr	x0, [x21, x19]
00000000000e7074	adrp	x8, 749 ; 0x3d4000
00000000000e7078	ldr	x2, [x8, #0x528]
00000000000e707c	bl	"_objc_msgSend$apiForProtocol:"
00000000000e7080	cbz	x0, 0xe7358
00000000000e7084	bl	_objc_msgSend$versionAtCreation
00000000000e7088	cmp	w0, #0x2
00000000000e708c	cset	w19, hi
00000000000e7090	ldr	d0, [sp, #0x110]
00000000000e7094	fmov	d1, #-1.00000000
00000000000e7098	fadd	d0, d0, d1
00000000000e709c	fcvt	s0, d0
00000000000e70a0	movi.2d	v1, #0000000000000000
00000000000e70a4	fcsel	s8, s1, s0, hi
00000000000e70a8	b	0xe7360
00000000000e70ac	cbz	w26, 0xe7130
00000000000e70b0	mov	w0, #0x1a0
00000000000e70b4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e70b8	mov	x24, x0
00000000000e70bc	bl	__ZN12HgcAlphaMultC1Ev
00000000000e70c0	ldur	x2, [x29, #-0xb0]
00000000000e70c4	ldr	x8, [x24]
00000000000e70c8	ldr	x8, [x8, #0x78]
00000000000e70cc	mov	x0, x24
00000000000e70d0	mov	w1, #0x0
00000000000e70d4	blr	x8
00000000000e70d8	ldur	x2, [x29, #-0xa8]
00000000000e70dc	ldr	x8, [x24]
00000000000e70e0	ldr	x8, [x8, #0x78]
00000000000e70e4	mov	x0, x24
00000000000e70e8	mov	w1, #0x1
00000000000e70ec	blr	x8
00000000000e70f0	ldur	x0, [x29, #-0xa8]
00000000000e70f4	cmp	x0, x24
00000000000e70f8	b.eq	0xe7120
00000000000e70fc	cbz	x0, 0xe710c
00000000000e7100	ldr	x8, [x0]
00000000000e7104	ldr	x8, [x8, #0x18]
00000000000e7108	blr	x8
00000000000e710c	stur	x24, [x29, #-0xa8]
00000000000e7110	ldr	x8, [x24]
00000000000e7114	ldr	x8, [x8, #0x10]
00000000000e7118	mov	x0, x24
00000000000e711c	blr	x8
00000000000e7120	ldr	x8, [x24]
00000000000e7124	ldr	x8, [x8, #0x18]
00000000000e7128	mov	x0, x24
00000000000e712c	blr	x8
00000000000e7130	mov	w0, #0x1a0
00000000000e7134	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e7138	mov	x24, x0
00000000000e713c	movi.2d	v0, #0000000000000000
00000000000e7140	stp	q0, q0, [x0, #0x180]
00000000000e7144	stp	q0, q0, [x0, #0x160]
00000000000e7148	stp	q0, q0, [x0, #0x140]
00000000000e714c	stp	q0, q0, [x0, #0x120]
00000000000e7150	stp	q0, q0, [x0, #0x100]
00000000000e7154	stp	q0, q0, [x0, #0xe0]
00000000000e7158	stp	q0, q0, [x0, #0xc0]
00000000000e715c	stp	q0, q0, [x0, #0xa0]
00000000000e7160	stp	q0, q0, [x0, #0x80]
00000000000e7164	stp	q0, q0, [x0, #0x60]
00000000000e7168	stp	q0, q0, [x0, #0x40]
00000000000e716c	stp	q0, q0, [x0, #0x20]
00000000000e7170	stp	q0, q0, [x0]
00000000000e7174	bl	__ZN12HgcCopyAlphaC2Ev
00000000000e7178	adrp	x8, 689 ; 0x398000
00000000000e717c	add	x8, x8, #0xa28
00000000000e7180	str	x8, [x24]
00000000000e7184	fmov	s0, #1.00000000
00000000000e7188	fmov	s1, #1.00000000
00000000000e718c	fmov	s2, #1.00000000
00000000000e7190	fmov	s3, #1.00000000
00000000000e7194	mov	x0, x24
00000000000e7198	mov	w1, #0x0
00000000000e719c	bl	__ZN12HgcCopyAlpha12SetParameterEiffff
00000000000e71a0	ldur	x2, [x29, #-0xa8]
00000000000e71a4	ldr	x8, [x24]
00000000000e71a8	ldr	x8, [x8, #0x78]
00000000000e71ac	mov	x0, x24
00000000000e71b0	mov	w1, #0x0
00000000000e71b4	blr	x8
00000000000e71b8	ldur	x2, [x29, #-0xa8]
00000000000e71bc	ldr	x8, [x24]
00000000000e71c0	ldr	x8, [x8, #0x78]
00000000000e71c4	mov	x0, x24
00000000000e71c8	mov	w1, #0x1
00000000000e71cc	blr	x8
00000000000e71d0	mov	w0, #0x1a0
00000000000e71d4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e71d8	mov	x25, x0
00000000000e71dc	bl	0x25106c ; symbol stub for: __ZN12HGSolidColorC1Ev
00000000000e71e0	ldr	x8, [x25]
00000000000e71e4	ldr	x8, [x8, #0x60]
00000000000e71e8	movi.2d	v0, #0000000000000000
00000000000e71ec	movi.2d	v1, #0000000000000000
00000000000e71f0	movi.2d	v2, #0000000000000000
00000000000e71f4	fmov	s3, #1.00000000
00000000000e71f8	mov	x0, x25
00000000000e71fc	mov	w1, #0x0
00000000000e7200	blr	x8
00000000000e7204	mov	w0, #0x220
00000000000e7208	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e720c	mov	x26, x0
00000000000e7210	bl	0x25130c ; symbol stub for: __ZN16HGHWBlendFlippedC1Ev
00000000000e7214	ldr	x8, [x26]
00000000000e7218	ldr	x8, [x8, #0x60]
00000000000e721c	movi.2d	v0, #0000000000000000
00000000000e7220	movi.2d	v1, #0000000000000000
00000000000e7224	movi.2d	v2, #0000000000000000
00000000000e7228	movi.2d	v3, #0000000000000000
00000000000e722c	mov	x0, x26
00000000000e7230	mov	w1, #0x0
00000000000e7234	blr	x8
00000000000e7238	mov	x0, x21
00000000000e723c	bl	_objc_msgSend$getBlendingGamma
00000000000e7240	ldr	x8, [x26]
00000000000e7244	ldr	x8, [x8, #0x60]
00000000000e7248	movi.2d	v1, #0000000000000000
00000000000e724c	movi.2d	v2, #0000000000000000
00000000000e7250	movi.2d	v3, #0000000000000000
00000000000e7254	mov	x0, x26
00000000000e7258	mov	w1, #0x5
00000000000e725c	blr	x8
00000000000e7260	ldr	x8, [x26]
00000000000e7264	ldr	x8, [x8, #0x78]
00000000000e7268	mov	x0, x26
00000000000e726c	mov	w1, #0x1
00000000000e7270	mov	x2, x25
00000000000e7274	blr	x8
00000000000e7278	ldr	x8, [x26]
00000000000e727c	ldr	x8, [x8, #0x78]
00000000000e7280	mov	x0, x26
00000000000e7284	mov	w1, #0x0
00000000000e7288	mov	x2, x24
00000000000e728c	blr	x8
00000000000e7290	ldur	x0, [x29, #-0xa8]
00000000000e7294	cmp	x0, x26
00000000000e7298	b.eq	0xe72c0
00000000000e729c	cbz	x0, 0xe72ac
00000000000e72a0	ldr	x8, [x0]
00000000000e72a4	ldr	x8, [x8, #0x18]
00000000000e72a8	blr	x8
00000000000e72ac	stur	x26, [x29, #-0xa8]
00000000000e72b0	ldr	x8, [x26]
00000000000e72b4	ldr	x8, [x8, #0x10]
00000000000e72b8	mov	x0, x26
00000000000e72bc	blr	x8
00000000000e72c0	ldr	x8, [x26]
00000000000e72c4	ldr	x8, [x8, #0x18]
00000000000e72c8	mov	x0, x26
00000000000e72cc	blr	x8
00000000000e72d0	ldr	x8, [x25]
00000000000e72d4	ldr	x8, [x8, #0x18]
00000000000e72d8	mov	x0, x25
00000000000e72dc	blr	x8
00000000000e72e0	ldr	x8, [x24]
00000000000e72e4	ldr	x8, [x8, #0x18]
00000000000e72e8	mov	x0, x24
00000000000e72ec	blr	x8
00000000000e72f0	b	0xe779c
00000000000e72f4	ldur	x0, [x29, #-0xa8]
00000000000e72f8	ldur	x8, [x29, #-0x98]
00000000000e72fc	cmp	x0, x8
00000000000e7300	b.eq	0xe77a0
00000000000e7304	cbz	x0, 0xe7318
00000000000e7308	ldr	x8, [x0]
00000000000e730c	ldr	x8, [x8, #0x18]
00000000000e7310	blr	x8
00000000000e7314	ldur	x8, [x29, #-0x98]
00000000000e7318	stur	x8, [x29, #-0xa8]
00000000000e731c	cbz	x8, 0xe7334
00000000000e7320	ldr	x9, [x8]
00000000000e7324	ldr	x9, [x9, #0x10]
00000000000e7328	mov	x0, x8
00000000000e732c	blr	x9
00000000000e7330	b	0xe779c
00000000000e7334	str	xzr, [sp, #0xc0]
00000000000e7338	b	0xe77b4
00000000000e733c	ldur	x2, [x29, #-0xb0]
00000000000e7340	ldr	x8, [x26]
00000000000e7344	ldr	x8, [x8, #0x78]
00000000000e7348	mov	x0, x26
00000000000e734c	mov	w1, #0x2
00000000000e7350	blr	x8
00000000000e7354	b	0xe7714
00000000000e7358	movi.2d	v8, #0000000000000000
00000000000e735c	mov	w19, #0x1
00000000000e7360	ldr	d12, [sp, #0x118]
00000000000e7364	mov	x0, x21
00000000000e7368	bl	_objc_msgSend$getColorPrimaries
00000000000e736c	mov	x27, x0
00000000000e7370	mov	x0, x21
00000000000e7374	bl	_objc_msgSend$isApplyTuningForRec2020
00000000000e7378	mov	x6, x0
00000000000e737c	fcvt	d0, s10
00000000000e7380	adrp	x8, 386 ; 0x269000
00000000000e7384	ldr	d1, [x8, #0xf58]
00000000000e7388	fadd	d0, d0, d1
00000000000e738c	fmov	d1, #9.00000000
00000000000e7390	fdiv	d0, d0, d1
00000000000e7394	fcvt	s4, d11
00000000000e7398	fcvt	s0, d0
00000000000e739c	fcvt	s1, d12
00000000000e73a0	add	x1, sp, #0x120
00000000000e73a4	movi.2d	v3, #0000000000000000
00000000000e73a8	add	x2, sp, #0xc0
00000000000e73ac	add	x3, sp, #0x80
00000000000e73b0	add	x4, sp, #0x40
00000000000e73b4	ldr	x0, [sp, #0x28]
00000000000e73b8	mov	x5, x27
00000000000e73bc	mov.16b	v2, v8
00000000000e73c0	bl	0x251cf0 ; symbol stub for: __ZN9OMKeyer2D22getSpillSuppressTransfEfRK5Vec3ffffR5Mat4fS4_S4_f16OMColorPrimariesb
00000000000e73c4	fmov	d0, #20.00000000
00000000000e73c8	fmul	d0, d9, d0
00000000000e73cc	fcvt	s8, d0
00000000000e73d0	cbz	w19, 0xe759c
00000000000e73d4	mov	w0, #0x1a0
00000000000e73d8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e73dc	mov	x27, x0
00000000000e73e0	bl	__ZN24HgcSpillRemovalDarkEdgesC1Ev
00000000000e73e4	ldp	s0, s1, [sp, #0x80]
00000000000e73e8	ldp	s2, s3, [sp, #0x88]
00000000000e73ec	ldr	x8, [x27]
00000000000e73f0	ldr	x8, [x8, #0x60]
00000000000e73f4	mov	x0, x27
00000000000e73f8	mov	w1, #0x0
00000000000e73fc	blr	x8
00000000000e7400	ldp	s0, s1, [sp, #0x90]
00000000000e7404	ldp	s2, s3, [sp, #0x98]
00000000000e7408	ldr	x8, [x27]
00000000000e740c	ldr	x8, [x8, #0x60]
00000000000e7410	mov	x0, x27
00000000000e7414	mov	w1, #0x1
00000000000e7418	blr	x8
00000000000e741c	ldp	s0, s1, [sp, #0xa0]
00000000000e7420	ldp	s2, s3, [sp, #0xa8]
00000000000e7424	ldr	x8, [x27]
00000000000e7428	ldr	x8, [x8, #0x60]
00000000000e742c	mov	x0, x27
00000000000e7430	mov	w1, #0x2
00000000000e7434	blr	x8
00000000000e7438	ldp	s0, s1, [sp, #0xe0]
00000000000e743c	ldp	s2, s3, [sp, #0xe8]
00000000000e7440	ldr	x8, [x27]
00000000000e7444	ldr	x8, [x8, #0x60]
00000000000e7448	mov	x0, x27
00000000000e744c	mov	w1, #0x3
00000000000e7450	blr	x8
00000000000e7454	ldp	s0, s1, [sp, #0xd0]
00000000000e7458	ldp	s2, s3, [sp, #0xd8]
00000000000e745c	ldr	x8, [x27]
00000000000e7460	ldr	x8, [x8, #0x60]
00000000000e7464	mov	x0, x27
00000000000e7468	mov	w1, #0x4
00000000000e746c	blr	x8
00000000000e7470	ldr	x8, [x27]
00000000000e7474	ldr	x8, [x8, #0x60]
00000000000e7478	movi.2d	v0, #0000000000000000
00000000000e747c	movi.2d	v1, #0000000000000000
00000000000e7480	movi.2d	v2, #0000000000000000
00000000000e7484	movi.2d	v3, #0000000000000000
00000000000e7488	mov	x0, x27
00000000000e748c	mov	w1, #0x5
00000000000e7490	blr	x8
00000000000e7494	ldp	s0, s1, [sp, #0x40]
00000000000e7498	ldp	s2, s3, [sp, #0x48]
00000000000e749c	ldr	x8, [x27]
00000000000e74a0	ldr	x8, [x8, #0x60]
00000000000e74a4	mov	x0, x27
00000000000e74a8	mov	w1, #0x6
00000000000e74ac	blr	x8
00000000000e74b0	ldp	s0, s1, [sp, #0x50]
00000000000e74b4	ldp	s2, s3, [sp, #0x58]
00000000000e74b8	ldr	x8, [x27]
00000000000e74bc	ldr	x8, [x8, #0x60]
00000000000e74c0	mov	x0, x27
00000000000e74c4	mov	w1, #0x7
00000000000e74c8	blr	x8
00000000000e74cc	ldp	s0, s1, [sp, #0x60]
00000000000e74d0	ldp	s2, s3, [sp, #0x68]
00000000000e74d4	ldr	x8, [x27]
00000000000e74d8	ldr	x8, [x8, #0x60]
00000000000e74dc	mov	x0, x27
00000000000e74e0	mov	w1, #0x8
00000000000e74e4	blr	x8
00000000000e74e8	ldr	x8, [x27]
00000000000e74ec	ldr	x8, [x8, #0x60]
00000000000e74f0	mov	x0, x27
00000000000e74f4	mov	w1, #0x9
00000000000e74f8	mov.16b	v0, v8
00000000000e74fc	mov.16b	v1, v8
00000000000e7500	mov.16b	v2, v8
00000000000e7504	mov.16b	v3, v8
00000000000e7508	blr	x8
00000000000e750c	ldr	d0, [sp, #0x110]
00000000000e7510	fcvt	s0, d0
00000000000e7514	ldr	x8, [x27]
00000000000e7518	ldr	x8, [x8, #0x60]
00000000000e751c	fmov	s3, #1.00000000
00000000000e7520	mov	x0, x27
00000000000e7524	mov	w1, #0xa
00000000000e7528	mov.16b	v1, v0
00000000000e752c	mov.16b	v2, v0
00000000000e7530	blr	x8
00000000000e7534	ldr	x8, [x27]
00000000000e7538	ldr	x8, [x8, #0x60]
00000000000e753c	fmov	s0, #10.00000000
00000000000e7540	fmov	s1, #10.00000000
00000000000e7544	fmov	s2, #10.00000000
00000000000e7548	fmov	s3, #10.00000000
00000000000e754c	mov	x0, x27
00000000000e7550	mov	w1, #0xb
00000000000e7554	blr	x8
00000000000e7558	ldur	x2, [x29, #-0xb0]
00000000000e755c	ldr	x8, [x27]
00000000000e7560	ldr	x8, [x8, #0x78]
00000000000e7564	mov	x0, x27
00000000000e7568	mov	w1, #0x0
00000000000e756c	blr	x8
00000000000e7570	ldr	x8, [x26]
00000000000e7574	ldr	x8, [x8, #0x78]
00000000000e7578	mov	x0, x26
00000000000e757c	mov	w1, #0x2
00000000000e7580	mov	x2, x27
00000000000e7584	blr	x8
00000000000e7588	ldr	x8, [x27]
00000000000e758c	ldr	x8, [x8, #0x18]
00000000000e7590	mov	x0, x27
00000000000e7594	blr	x8
00000000000e7598	b	0xe7714
00000000000e759c	mov	w0, #0x1a0
00000000000e75a0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000e75a4	mov	x27, x0
00000000000e75a8	bl	__ZN15HgcSpillRemovalC1Ev
00000000000e75ac	ldp	s0, s1, [sp, #0x80]
00000000000e75b0	ldp	s2, s3, [sp, #0x88]
00000000000e75b4	ldr	x8, [x27]
00000000000e75b8	ldr	x8, [x8, #0x60]
00000000000e75bc	mov	x0, x27
00000000000e75c0	mov	w1, #0x0
00000000000e75c4	blr	x8
00000000000e75c8	ldp	s0, s1, [sp, #0x90]
00000000000e75cc	ldp	s2, s3, [sp, #0x98]
00000000000e75d0	ldr	x8, [x27]
00000000000e75d4	ldr	x8, [x8, #0x60]
00000000000e75d8	mov	x0, x27
00000000000e75dc	mov	w1, #0x1
00000000000e75e0	blr	x8
00000000000e75e4	ldp	s0, s1, [sp, #0xa0]
00000000000e75e8	ldp	s2, s3, [sp, #0xa8]
00000000000e75ec	ldr	x8, [x27]
00000000000e75f0	ldr	x8, [x8, #0x60]
00000000000e75f4	mov	x0, x27
00000000000e75f8	mov	w1, #0x2
00000000000e75fc	blr	x8
00000000000e7600	ldp	s0, s1, [sp, #0xe0]
00000000000e7604	ldp	s2, s3, [sp, #0xe8]
00000000000e7608	ldr	x8, [x27]
00000000000e760c	ldr	x8, [x8, #0x60]
00000000000e7610	mov	x0, x27
00000000000e7614	mov	w1, #0x3
00000000000e7618	blr	x8
00000000000e761c	ldp	s0, s1, [sp, #0xd0]
00000000000e7620	ldp	s2, s3, [sp, #0xd8]
00000000000e7624	ldr	x8, [x27]
00000000000e7628	ldr	x8, [x8, #0x60]
00000000000e762c	mov	x0, x27
00000000000e7630	mov	w1, #0x4
00000000000e7634	blr	x8
00000000000e7638	ldr	x8, [x27]
00000000000e763c	ldr	x8, [x8, #0x60]
00000000000e7640	movi.2d	v0, #0000000000000000
00000000000e7644	movi.2d	v1, #0000000000000000
00000000000e7648	movi.2d	v2, #0000000000000000
00000000000e764c	movi.2d	v3, #0000000000000000
00000000000e7650	mov	x0, x27
00000000000e7654	mov	w1, #0x5
00000000000e7658	blr	x8
00000000000e765c	ldp	s0, s1, [sp, #0x40]
00000000000e7660	ldp	s2, s3, [sp, #0x48]
00000000000e7664	ldr	x8, [x27]
00000000000e7668	ldr	x8, [x8, #0x60]
00000000000e766c	mov	x0, x27
00000000000e7670	mov	w1, #0x6
00000000000e7674	blr	x8
00000000000e7678	ldp	s0, s1, [sp, #0x50]
00000000000e767c	ldp	s2, s3, [sp, #0x58]
00000000000e7680	ldr	x8, [x27]
00000000000e7684	ldr	x8, [x8, #0x60]
00000000000e7688	mov	x0, x27
00000000000e768c	mov	w1, #0x7
00000000000e7690	blr	x8
00000000000e7694	ldp	s0, s1, [sp, #0x60]
00000000000e7698	ldp	s2, s3, [sp, #0x68]
00000000000e769c	ldr	x8, [x27]
00000000000e76a0	ldr	x8, [x8, #0x60]
00000000000e76a4	mov	x0, x27
00000000000e76a8	mov	w1, #0x8
00000000000e76ac	blr	x8
00000000000e76b0	ldr	x8, [x27]
00000000000e76b4	ldr	x8, [x8, #0x60]
00000000000e76b8	mov	x0, x27
00000000000e76bc	mov	w1, #0x9
00000000000e76c0	mov.16b	v0, v8
00000000000e76c4	mov.16b	v1, v8
00000000000e76c8	mov.16b	v2, v8
00000000000e76cc	mov.16b	v3, v8
00000000000e76d0	blr	x8
00000000000e76d4	ldur	x2, [x29, #-0xb0]
00000000000e76d8	ldr	x8, [x27]
00000000000e76dc	ldr	x8, [x8, #0x78]
00000000000e76e0	mov	x0, x27
00000000000e76e4	mov	w1, #0x0
00000000000e76e8	blr	x8
00000000000e76ec	ldr	x8, [x26]
00000000000e76f0	ldr	x8, [x8, #0x78]
00000000000e76f4	mov	x0, x26
00000000000e76f8	mov	w1, #0x2
00000000000e76fc	mov	x2, x27
00000000000e7700	blr	x8
00000000000e7704	ldr	x8, [x27]
00000000000e7708	ldr	x8, [x8, #0x18]
00000000000e770c	mov	x0, x27
00000000000e7710	blr	x8
00000000000e7714	ldr	x4, [x24]
00000000000e7718	add	x2, sp, #0xc0
00000000000e771c	mov	x0, x25
00000000000e7720	mov	w3, #0x7
00000000000e7724	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000e7728	ldrb	w8, [sp, #0xc0]
00000000000e772c	ldr	x9, [x26]
00000000000e7730	ldr	x9, [x9, #0x60]
00000000000e7734	cmp	w8, #0x0
00000000000e7738	fmov	s0, #1.00000000
00000000000e773c	fmov	s1, #-1.00000000
00000000000e7740	fcsel	s0, s1, s0, eq
00000000000e7744	mov	x0, x26
00000000000e7748	mov	w1, #0x0
00000000000e774c	mov.16b	v1, v0
00000000000e7750	mov.16b	v2, v0
00000000000e7754	mov.16b	v3, v0
00000000000e7758	blr	x9
00000000000e775c	ldur	x0, [x29, #-0xa8]
00000000000e7760	cmp	x0, x26
00000000000e7764	b.eq	0xe778c
00000000000e7768	cbz	x0, 0xe7778
00000000000e776c	ldr	x8, [x0]
00000000000e7770	ldr	x8, [x8, #0x18]
00000000000e7774	blr	x8
00000000000e7778	stur	x26, [x29, #-0xa8]
00000000000e777c	ldr	x8, [x26]
00000000000e7780	ldr	x8, [x8, #0x10]
00000000000e7784	mov	x0, x26
00000000000e7788	blr	x8
00000000000e778c	ldr	x8, [x26]
00000000000e7790	ldr	x8, [x8, #0x18]
00000000000e7794	mov	x0, x26
00000000000e7798	blr	x8
00000000000e779c	ldur	x0, [x29, #-0xa8]
00000000000e77a0	str	x0, [sp, #0xc0]
00000000000e77a4	cbz	x0, 0xe77b4
00000000000e77a8	ldr	x8, [x0]
00000000000e77ac	ldr	x8, [x8, #0x10]
00000000000e77b0	blr	x8
00000000000e77b4	add	x2, sp, #0xc0
00000000000e77b8	mov	x0, x21
00000000000e77bc	mov	x3, x20
00000000000e77c0	ldr	x4, [sp, #0x38]
00000000000e77c4	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000e77c8	ldr	x0, [sp, #0x30]
00000000000e77cc	bl	0x252344 ; symbol stub for: _objc_release
00000000000e77d0	add	x2, sp, #0xc0
00000000000e77d4	ldr	x0, [sp, #0x38]
00000000000e77d8	bl	"_objc_msgSend$setHeliumRef:"
00000000000e77dc	ldr	x0, [sp, #0xc0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm50 (bool)
    - parm27 (int)
    - parm20 (float)
    - parm23 (float)
    - parm24 (float)
    - parm7 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm7 (bool)
    slot 0  <-  (constant / computed)
    slot 5  <-  (constant / computed)
    slot 0  <-  parm7 (bool)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
    slot 5  <-  (constant / computed)
    slot 6  <-  parm7 (bool)
    slot 7  <-  (constant / computed)
    slot 8  <-  (constant / computed)
    slot 9  <-  (constant / computed)
    slot 10  <-  parm7 (bool)
    slot 11  <-  (constant / computed)
    slot 0  <-  parm7 (bool)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
    slot 5  <-  (constant / computed)
    slot 6  <-  parm7 (bool)
    slot 7  <-  (constant / computed)
    slot 8  <-  (constant / computed)
    slot 9  <-  (constant / computed)
```
