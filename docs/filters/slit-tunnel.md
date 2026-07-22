# Slit Tunnel

- **PAE class:** `Slit Tunnel`
- **Plugin UUID:** `D7186443-2103-465D-A035-40C390F236EB`
- **Node names in corpus:** Slit Tunnel (2), Circles (1)
- **Corpus usage:** 2 files, 3 instances

## What it does

Slit Tunnel projects the image into a receding tunnel using slit-scan: a single strip is extruded toward Center with Perspective controlling the depth foreshortening and Speed the scroll rate, with an optional glowing tunnel edge. Used for hyperspace/tunnel transitions.

> **Note.** Not implemented; description is the standard Apple Motion "Slit Tunnel" filter. (unverified) exact slit-scan geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Vanishing point of the tunnel (X,Y) in normalized frame coordinates. |
| Speed | float | 100 | 150 .. 150 | Scroll rate down the tunnel (default 100). |
| Perspective | float | 0.5 | 0.2 .. 0.2 | Depth foreshortening of the tunnel, ~0.2-0.5 (default 0.5). |
| Glow Color | color | - | - | Color of the tunnel edge glow. |
| Glow | float | 0.05 | 0 .. 0 | Intensity of the tunnel glow (default 0.05). Continuous float, NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSlitTunnel`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSlitTunnel` → [`HgcSlitTunnel.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSlitTunnel.metal)

```metal
//Metal1.0     
//LEN=0000000a48
[[ visible ]] FragmentOut HgcSlitTunnel_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord0)
{
    const float4 c0 = float4(0.05747731403, -0.01348046958, -0.1212390736, 0.1956359297);
    const float4 c1 = float4(0.9999956489, -0.3329946101, 1.570796371, 3.141592741);
    const float4 c2 = float4(0.1591549367, 0.5000000000, 0.000000000, 1.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.z = dot(r0.xy, hg_Params[10].xy);
    r0.x = dot(r0.xy, hg_Params[9].xy);
    r1.z = abs(r0.z);
    r0.w = abs(r0.x);
    r0.y = fmax(r0.w, r1.z);
    r1.x = 1.00000f / r0.y;
    r0.y = fmin(r0.w, r1.z);
    r1.w = r0.y*r1.x;
    r1.x = r1.w*r1.w;
    r0.y = r1.x*c0.y + c0.x;
    r0.y = r0.y*r1.x + c0.z;
    r0.y = r0.y*r1.x + c0.w;
    r1.y = r0.y*r1.x + c1.y;
    r0.y = r0.z;
    r2.x = r1.y*r1.x + c1.x;
    r1.xy = r0.xy*r0.xy;
    r0.y = r2.x*r1.w;
    r1.y = dot(r1.xy, 1.00000f);
    r1.x = c1.z - r0.y;
    r0.w = r1.z - r0.w;
    r0.w = select(r0.y, r1.x, r0.w < 0.00000f);
    r1.x = rsqrt(r1.y);
    r0.y = 1.00000f / r1.x;
    r2.x = c1.w - r0.w;
    r0.z = select(r0.w, r2.x, r0.z < 0.00000f);
    r0.x = select(r0.z, -r0.z, r0.x < 0.00000f);
    r0.w = r0.y*hg_Params[3].w + c2.w;
    r1.y = r0.x*c2.x + c2.y;
    r0.z = r0.y/r0.w;
    r2.y = r0.z;
    r2.x = r1.y*hg_Params[6].x;
    r2.w = dot(r2.xy, hg_Params[2].xy);
    r2.z = dot(r2.xy, hg_Params[1].xy);
    r2.zw = r2.zw + hg_Params[13].xy;
    r0.xy = abs(r2.zw);
    r2.y = r0.z;
    r2.x = r2.x - hg_Params[6].x;
    r2.w = dot(r2.xy, hg_Params[2].xy);
    r2.z = dot(r2.xy, hg_Params[1].xy);
    r2.xy = r2.zw + hg_Params[13].xy;
    r0.zw = r0.xy*hg_Params[12].xy;
    r2.z = dot(r0.xy, hg_Params[11].xy);
    r2.w = dot(r0.zw, 1.00000f);
    r0.xy = hg_Params[8].xy - hg_Params[7].xy;
    r0.zw = r0.xy + r2.zw;
    r2.xy = abs(r2.xy);
    r2.w = dot(r2.xy, hg_Params[12].xy);
    r2.z = dot(r2.xy, hg_Params[11].xy);
    r2.xy = r2.zw + r0.xy;
    r0.xy = r0.zw + hg_Params[14].xy;
    r0.xy = r0.xy*hg_Params[14].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r2.xy = r2.xy + hg_Params[15].xy;
    r2.xy = r2.xy*hg_Params[15].zw;
    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);
    r0 = mix(r0, r2, r1.yyyy);
    r1.x = r1.x*hg_Params[4].x;
    r2.xyz = hg_Params[5].xyz*hg_Params[5].www;
    r2.w = hg_Params[5].w;
    output.color0 = r1.xxxx*r2 + r0;
    return output;
}
```

### CPU parameter wiring — `-[PAESlitTunnel canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESlitTunnel`

```asm
000000000005d034	mov	w4, #0x1
000000000005d038	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000005d03c	ldp	d1, d0, [sp, #0x68]
000000000005d040	fcvt	s12, d0
000000000005d044	scvtf	d14, w27
000000000005d048	fmul	d2, d0, d14
000000000005d04c	scvtf	d13, w28
000000000005d050	str	d1, [sp, #0x18]
000000000005d054	fmul	d0, d1, d13
000000000005d058	stp	d0, d2, [sp, #0x68]
000000000005d05c	ldr	x4, [x21]
000000000005d060	add	x2, sp, #0x60
000000000005d064	mov	x0, x25
000000000005d068	mov	w3, #0x2
000000000005d06c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005d070	ldr	x4, [x21]
000000000005d074	add	x2, sp, #0x58
000000000005d078	mov	x0, x25
000000000005d07c	mov	w3, #0x3
000000000005d080	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005d084	ldr	d0, [sp, #0x58]
000000000005d088	str	d0, [sp, #0x10]
000000000005d08c	ldr	x4, [x21]
000000000005d090	add	x2, sp, #0x50
000000000005d094	mov	x0, x25
000000000005d098	mov	w3, #0x4
000000000005d09c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005d0a0	ldr	x4, [x21]
000000000005d0a4	add	x2, sp, #0x48
000000000005d0a8	mov	x0, x25
000000000005d0ac	mov	w3, #0x5
000000000005d0b0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005d0b4	ldr	x6, [x21]
000000000005d0b8	add	x2, sp, #0x40
000000000005d0bc	add	x3, sp, #0x38
000000000005d0c0	add	x4, sp, #0x30
000000000005d0c4	mov	x0, x25
000000000005d0c8	mov	w5, #0x6
000000000005d0cc	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000005d0d0	ldr	d15, [sp, #0xf8]
000000000005d0d4	ldr	d0, [sp, #0x120]
000000000005d0d8	str	d0, [sp, #0x8]
000000000005d0dc	mov	x0, x26
000000000005d0e0	bl	_objc_msgSend$versionAtCreation
000000000005d0e4	mov	x25, x0
000000000005d0e8	ldr	d0, [sp, #0x60]
000000000005d0ec	bl	0x25205c ; symbol stub for: ___sincos_stret
000000000005d0f0	mov.16b	v11, v1
000000000005d0f4	fcvt	s10, d0
000000000005d0f8	ldr	d0, [sp, #0x50]
000000000005d0fc	str	d0, [sp, #0x20]
000000000005d100	ldr	x2, [x21]
000000000005d104	mov	x0, x20
000000000005d108	bl	"_objc_msgSend$secondsFromFxTime:"
000000000005d10c	mov.16b	v9, v0
000000000005d110	ldr	d0, [sp, #0x58]
000000000005d114	fmul	d0, d9, d0
000000000005d118	fcvt	s0, d0
000000000005d11c	fdiv	d8, d14, d15
000000000005d120	fcvt	d1, s12
000000000005d124	fmul	d1, d8, d1
000000000005d128	fcvt	s12, d1
000000000005d12c	fmul	s0, s10, s0
000000000005d130	fadd	s0, s12, s0
000000000005d134	fcvt	d0, s0
000000000005d138	fmul	d0, d15, d0
000000000005d13c	fcvt	s0, d0
000000000005d140	fcvt	d1, s0
000000000005d144	adrp	x8, 524 ; 0x269000
000000000005d148	ldr	d2, [x8, #0xbf8]
000000000005d14c	fadd	d1, d1, d2
000000000005d150	fcvt	s1, d1
000000000005d154	cmp	w25, #0x0
000000000005d158	fcsel	s15, s1, s0, eq
000000000005d15c	cmp	w24, #0x0
000000000005d160	ccmp	x22, #0x3, #0x0, ne
000000000005d164	cset	w22, eq
000000000005d168	b.ne	0x5d520
000000000005d16c	ldr	d0, [sp, #0x48]
000000000005d170	str	d0, [sp]
000000000005d174	mov	w0, #0x1d0
000000000005d178	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005d17c	mov	x21, x0
000000000005d180	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
000000000005d184	cbz	x23, 0x5d19c
000000000005d188	add	x8, sp, #0x28
000000000005d18c	mov	x0, x23
000000000005d190	bl	_objc_msgSend$heliumRef
000000000005d194	ldr	x2, [sp, #0x28]
000000000005d198	b	0x5d1a4
000000000005d19c	mov	x2, #0x0
000000000005d1a0	str	xzr, [sp, #0x28]
000000000005d1a4	ldr	x8, [x21]
000000000005d1a8	ldr	x8, [x8, #0x78]
000000000005d1ac	mov	x0, x21
000000000005d1b0	mov	w1, #0x0
000000000005d1b4	blr	x8
000000000005d1b8	ldr	x0, [sp, #0x28]
000000000005d1bc	cbz	x0, 0x5d1cc
000000000005d1c0	ldr	x8, [x0]
000000000005d1c4	ldr	x8, [x8, #0x18]
000000000005d1c8	blr	x8
000000000005d1cc	mov	x0, x21
000000000005d1d0	mov	w1, #0x2
000000000005d1d4	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
000000000005d1d8	mov	w0, #0x1a0
000000000005d1dc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005d1e0	mov	x23, x0
000000000005d1e4	bl	__ZN13HgcSlitTunnelC2Ev
000000000005d1e8	adrp	x8, 830 ; 0x39b000
000000000005d1ec	add	x8, x8, #0x3f8
000000000005d1f0	add	x9, x8, #0x10
000000000005d1f4	str	x9, [x23]
000000000005d1f8	ldp	d1, d0, [sp, #0x68]
000000000005d1fc	fcvt	s0, d0
000000000005d200	fcvt	s1, d1
000000000005d204	ldr	x8, [x8, #0x70]
000000000005d208	movi.2d	v2, #0000000000000000
000000000005d20c	movi.2d	v3, #0000000000000000
000000000005d210	mov	x0, x23
000000000005d214	mov	w1, #0x0
000000000005d218	blr	x8
000000000005d21c	fcvt	s11, d11
000000000005d220	fneg	s1, s10
000000000005d224	ldr	x8, [x23]
000000000005d228	ldr	x8, [x8, #0x60]
000000000005d22c	movi.2d	v2, #0000000000000000
000000000005d230	movi.2d	v3, #0000000000000000
000000000005d234	mov	x0, x23
000000000005d238	mov	w1, #0x1
000000000005d23c	mov.16b	v0, v11
000000000005d240	blr	x8
000000000005d244	ldr	x8, [x23]
000000000005d248	ldr	x8, [x8, #0x60]
000000000005d24c	movi.2d	v2, #0000000000000000
000000000005d250	movi.2d	v3, #0000000000000000
000000000005d254	mov	x0, x23
000000000005d258	mov	w1, #0x2
000000000005d25c	mov.16b	v0, v10
000000000005d260	mov.16b	v1, v11
000000000005d264	blr	x8
000000000005d268	adrp	x8, 524 ; 0x269000
000000000005d26c	ldr	d0, [x8, #0xe68]
000000000005d270	ldr	d1, [sp, #0x20]
000000000005d274	fmul	d0, d1, d0
000000000005d278	fcvt	s0, d0
000000000005d27c	ldr	x8, [x23]
000000000005d280	ldr	x8, [x8, #0x60]
000000000005d284	movi.2d	v1, #0000000000000000
000000000005d288	movi.2d	v2, #0000000000000000
000000000005d28c	movi.2d	v3, #0000000000000000
000000000005d290	mov	x0, x23
000000000005d294	mov	w1, #0x3
000000000005d298	blr	x8
000000000005d29c	fmov	d0, #0.25000000
000000000005d2a0	fmul	d0, d8, d0
000000000005d2a4	ldr	d1, [sp]
000000000005d2a8	fmul	d0, d0, d1
000000000005d2ac	fcvt	s0, d0
000000000005d2b0	ldr	x8, [x23]
000000000005d2b4	ldr	x8, [x8, #0x60]
000000000005d2b8	movi.2d	v1, #0000000000000000
000000000005d2bc	movi.2d	v2, #0000000000000000
000000000005d2c0	movi.2d	v3, #0000000000000000
000000000005d2c4	mov	x0, x23
000000000005d2c8	mov	w1, #0x4
000000000005d2cc	blr	x8
000000000005d2d0	ldp	d1, d0, [sp, #0x38]
000000000005d2d4	fcvt	s0, d0
000000000005d2d8	fcvt	s1, d1
000000000005d2dc	ldr	d2, [sp, #0x30]
000000000005d2e0	fcvt	s2, d2
000000000005d2e4	ldr	x8, [x23]
000000000005d2e8	ldr	x8, [x8, #0x60]
000000000005d2ec	fmov	s3, #1.00000000
000000000005d2f0	mov	x0, x23
000000000005d2f4	mov	w1, #0x5
000000000005d2f8	blr	x8
000000000005d2fc	ldr	x8, [x23]
000000000005d300	ldr	x8, [x8, #0x60]
000000000005d304	mov	w9, #0x42c80000
000000000005d308	fmov	s0, w9
000000000005d30c	movi.2d	v1, #0000000000000000
000000000005d310	movi.2d	v2, #0000000000000000
000000000005d314	movi.2d	v3, #0000000000000000
000000000005d318	mov	x0, x23
000000000005d31c	mov	w1, #0x6
000000000005d320	blr	x8
000000000005d324	fmov	d1, #0.50000000
000000000005d328	fmul	d0, d14, d1
000000000005d32c	fcvt	s0, d0
000000000005d330	fmul	d1, d13, d1
000000000005d334	fcvt	s1, d1
000000000005d338	ldr	x8, [x23]
000000000005d33c	ldr	x8, [x8, #0x60]
000000000005d340	movi.2d	v2, #0000000000000000
000000000005d344	movi.2d	v3, #0000000000000000
000000000005d348	mov	x0, x23
000000000005d34c	mov	w1, #0x7
000000000005d350	blr	x8
000000000005d354	ldp	d1, d0, [sp, #0x10]
000000000005d358	fcvt	s0, d0
000000000005d35c	fmul	d1, d9, d1
000000000005d360	fcvt	s1, d1
000000000005d364	ldr	d3, [sp, #0x8]
000000000005d368	fdiv	d2, d13, d3
000000000005d36c	fcvt	d0, s0
000000000005d370	fmul	d0, d2, d0
000000000005d374	fcvt	s9, d0
000000000005d378	fmul	s0, s11, s1
000000000005d37c	fsub	s0, s9, s0
000000000005d380	fcvt	d0, s0
000000000005d384	fmul	d0, d3, d0
000000000005d388	fcvt	s1, d0
000000000005d38c	fcvt	d0, s15
000000000005d390	ldp	d2, d3, [sp, #0x68]
000000000005d394	fsub	d0, d0, d3
000000000005d398	fcvt	s0, d0
000000000005d39c	fcvt	d1, s1
000000000005d3a0	fsub	d1, d1, d2
000000000005d3a4	fcvt	s1, d1
000000000005d3a8	ldr	x8, [x23]
000000000005d3ac	ldr	x8, [x8, #0x60]
000000000005d3b0	movi.2d	v2, #0000000000000000
000000000005d3b4	movi.2d	v3, #0000000000000000
000000000005d3b8	mov	x0, x23
000000000005d3bc	mov	w1, #0x8
000000000005d3c0	blr	x8
000000000005d3c4	ldp	d0, d1, [sp, #0x78]
000000000005d3c8	fcvt	s0, d0
000000000005d3cc	fcvt	s1, d1
000000000005d3d0	ldr	x8, [x23]
000000000005d3d4	ldr	x8, [x8, #0x60]
000000000005d3d8	movi.2d	v2, #0000000000000000
000000000005d3dc	movi.2d	v3, #0000000000000000
000000000005d3e0	mov	x0, x23
000000000005d3e4	mov	w1, #0x9
000000000005d3e8	blr	x8
000000000005d3ec	ldp	d0, d1, [sp, #0x98]
000000000005d3f0	fcvt	s0, d0
000000000005d3f4	fcvt	s1, d1
000000000005d3f8	ldr	x8, [x23]
000000000005d3fc	ldr	x8, [x8, #0x60]
000000000005d400	movi.2d	v2, #0000000000000000
000000000005d404	movi.2d	v3, #0000000000000000
000000000005d408	mov	x0, x23
000000000005d40c	mov	w1, #0xa
000000000005d410	blr	x8
000000000005d414	ldp	d0, d1, [sp, #0xf8]
000000000005d418	fcvt	s0, d0
000000000005d41c	fcvt	s1, d1
000000000005d420	ldr	x8, [x23]
000000000005d424	ldr	x8, [x8, #0x60]
000000000005d428	movi.2d	v2, #0000000000000000
000000000005d42c	movi.2d	v3, #0000000000000000
000000000005d430	mov	x0, x23
000000000005d434	mov	w1, #0xb
000000000005d438	blr	x8
000000000005d43c	ldp	d0, d1, [sp, #0x118]
000000000005d440	fcvt	s0, d0
000000000005d444	fcvt	s1, d1
000000000005d448	ldr	x8, [x23]
000000000005d44c	ldr	x8, [x8, #0x60]
000000000005d450	movi.2d	v2, #0000000000000000
000000000005d454	movi.2d	v3, #0000000000000000
000000000005d458	mov	x0, x23
000000000005d45c	mov	w1, #0xc
000000000005d460	blr	x8
000000000005d464	ldr	x8, [x23]
000000000005d468	ldr	x8, [x8, #0x60]
000000000005d46c	movi.2d	v2, #0000000000000000
000000000005d470	movi.2d	v3, #0000000000000000
000000000005d474	mov	x0, x23
000000000005d478	mov	w1, #0xd
000000000005d47c	mov.16b	v0, v12
000000000005d480	mov.16b	v1, v9
000000000005d484	blr	x8
000000000005d488	ldr	x8, [x23]
000000000005d48c	ldr	x8, [x8, #0x78]
000000000005d490	mov	x0, x23
000000000005d494	mov	w1, #0x0
000000000005d498	mov	x2, x21
000000000005d49c	blr	x8
000000000005d4a0	ldr	x8, [x23]
000000000005d4a4	ldr	x8, [x8, #0x78]
000000000005d4a8	mov	x0, x23
000000000005d4ac	mov	w1, #0x1
000000000005d4b0	mov	x2, x21
000000000005d4b4	blr	x8
000000000005d4b8	str	x23, [sp, #0x28]
000000000005d4bc	ldr	x8, [x23]
000000000005d4c0	ldr	x8, [x8, #0x10]
000000000005d4c4	mov	x0, x23
000000000005d4c8	blr	x8
000000000005d4cc	add	x2, sp, #0x28
000000000005d4d0	mov	x0, x20
000000000005d4d4	mov	x3, x19
000000000005d4d8	mov	x4, x19
000000000005d4dc	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000005d4e0	add	x2, sp, #0x28
000000000005d4e4	mov	x0, x19
000000000005d4e8	bl	"_objc_msgSend$setHeliumRef:"
000000000005d4ec	ldr	x0, [sp, #0x28]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : AngleSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm6 : ColorParameter
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (colour)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  (constant / computed / multi-pass — read the disasm)
    slot 5  <-  parm6 (colour)
    slot 6  <-  (constant / computed / multi-pass — read the disasm)
    slot 7  <-  (constant / computed / multi-pass — read the disasm)
    slot 8  <-  (constant / computed / multi-pass — read the disasm)
    slot 9  <-  (constant / computed / multi-pass — read the disasm)
    slot 10  <-  (constant / computed / multi-pass — read the disasm)
    slot 11  <-  (constant / computed / multi-pass — read the disasm)
    slot 12  <-  (constant / computed / multi-pass — read the disasm)
    slot 13  <-  (constant / computed / multi-pass — read the disasm)
```
