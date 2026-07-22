# Bump Map

- **PAE class:** `Bump Map`
- **Plugin UUID:** `1E6F3535-CAD6-4F4A-8EFE-24C402488000`
- **Node names in corpus:** Bump Map (171), Distortion (110), Glitch 2 (67), Glitch 1 (66), Bump Map 1 (49), Distortion 2 (40)
- **Corpus usage:** 257 files, 780 instances

## What it does

Bump Map treats a second image (the Map Image) as a height field and refracts the source through it: brightness gradients in the map become surface slopes that displace the sampled source texcoord, giving the source the illusion of being embossed onto the map's relief. Direction and the Horizontal/Vertical scales control the lighting angle and displacement strength. Verified against the HgcBumpMap shader, which reads the map, builds a per-pixel offset, and resamples the source.

> **Note.** HgcBumpMap shader is checked in (evidence/shaders/HgcBumpMap.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Map Image | source ref | 0 | 10009 .. 3335299512 | Reference to the layer used as the height/bump map (stored as a large source-ID integer, not a numeric value). The relief of this image drives the displacement. |
| Direction | float (radians) | 0.1745 | -6.281 .. 6.283 | Lighting / displacement direction in radians (default ~0.1745 = 10 deg). Rotates which way the bump slopes push the source samples. |
| Amount | float | 0.1 | -4 .. 10 | Displacement strength / bump depth. 0 = flat (no displacement); negative inverts the relief; positive exaggerates it (range -4..10 observed). Heavily keyframed. *(keyframed in 316 instances)* |
| Horizontal Scale | float | 0.1 | -10 .. 10 | Horizontal component of the displacement gain, -10..10. Scales how far map slopes push samples on X. *(keyframed in 172 instances)* |
| Vertical Scale | float | 0.1 | -10 .. 10 | Vertical component of the displacement gain, -10..10. Scales the push on Y. *(keyframed in 131 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the bump-mapped result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 22 instances)* |
| Repeat Edges | bool | 0 | 0 .. 1 | When on, sample coordinates that fall outside the frame wrap/repeat rather than clamp. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcBumpMap` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcBumpMap.metal` (Phase-1 done, Phase-2 open).

> 5 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcBumpMap`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBumpMap` → [`HgcBumpMap.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBumpMap.metal)

```metal
//Metal1.0     
//LEN=000000045d
[[ visible ]] FragmentOut HgcBumpMap_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 255.0000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = color0.xy;
    r1.x = hg_Params[5].x - c0.x;
    r2 = select(c0.xyyy, hg_Params[1], -r1.xxxx < 0.00000f);
    r1.z = dot(texCoord1, r2);
    r2 = select(c0.yxyy, hg_Params[2], -r1.xxxx < 0.00000f);
    r1.w = dot(texCoord1, r2);
    r0.y = clamp(r0.y, 0.00000f, 1.00000f);
    r0.x = clamp(r0.x, 0.00000f, 1.00000f);
    r2.xyw = select(c0.xyy, hg_Params[3].xyw, -r1.xxx < 0.00000f);
    r0.xy = r0.xy*c0.zz;
    r0.xy = r0.xy*hg_Params[0].xy + r1.zw;
    r1.xyw = select(c0.yxy, hg_Params[4].xyw, -r1.xxx < 0.00000f);
    r0.w = c0.x;
    r1.y = dot(r0.xyw, r1.xyw);
    r1.x = dot(r0.xyw, r2.xyw);
    r1.xy = r1.xy + hg_Params[6].xy;
    r1.xy = r1.xy*hg_Params[6].zw;
    output.color0 = hg_Texture1.sample(hg_Sampler1, r1.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEBumpMap canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBumpMap`

```asm
00000000000158bc	mov	w3, #0x3
00000000000158c0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000158c4	ldur	d0, [x29, #-0x68]
00000000000158c8	fcmp	d0, #0.0
00000000000158cc	b.ne	0x158e4
00000000000158d0	cbz	x21, 0x15a54
00000000000158d4	add	x8, sp, #0x98
00000000000158d8	mov	x0, x21
00000000000158dc	bl	_objc_msgSend$heliumRef
00000000000158e0	b	0x15a58
00000000000158e4	ldr	x4, [x19]
00000000000158e8	sub	x2, x29, #0x60
00000000000158ec	mov	x0, x24
00000000000158f0	mov	w3, #0x2
00000000000158f4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000158f8	ldr	x4, [x19]
00000000000158fc	sub	x2, x29, #0x51
0000000000015900	mov	x0, x24
0000000000015904	mov	w3, #0x4
0000000000015908	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001590c	ldr	x4, [x19]
0000000000015910	sub	x2, x29, #0x70
0000000000015914	mov	x0, x24
0000000000015918	mov	w3, #0x6
000000000001591c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000015920	ldr	x4, [x19]
0000000000015924	sub	x2, x29, #0x78
0000000000015928	mov	x0, x24
000000000001592c	mov	w3, #0x7
0000000000015930	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000015934	ldr	x4, [x19]
0000000000015938	sub	x2, x29, #0x7c
000000000001593c	mov	x0, x24
0000000000015940	mov	w3, #0x5
0000000000015944	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000015948	ldr	x2, [x19]
000000000001594c	mov	x0, x22
0000000000015950	bl	"_objc_msgSend$getRenderMode:"
0000000000015954	cbz	w0, 0x15a34
0000000000015958	mov	x0, x21
000000000001595c	bl	_objc_msgSend$imageType
0000000000015960	cmp	x0, #0x3
0000000000015964	b.ne	0x15a30
0000000000015968	stur	xzr, [x29, #-0x88]
000000000001596c	ldr	d0, [x19]
0000000000015970	ldr	x8, [x19, #0x10]
0000000000015974	ldr	x9, [x19, #0x28]
0000000000015978	str	d0, [sp, #0x98]
000000000001597c	mov	w10, #0x2
0000000000015980	stp	x10, x8, [sp, #0xa0]
0000000000015984	fmov.2d	v1, #1.00000000
0000000000015988	stur	q1, [sp, #0xb0]
000000000001598c	str	x9, [sp, #0xc0]
0000000000015990	fmov	x7, d0
0000000000015994	sub	x2, x29, #0x88
0000000000015998	add	x5, sp, #0x98
000000000001599c	mov	x0, x22
00000000000159a0	mov	x3, #0x0
00000000000159a4	mov	x4, #0x0
00000000000159a8	mov	w6, #0x1
00000000000159ac	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
00000000000159b0	add	x8, sp, #0x98
00000000000159b4	mov	x0, x22
00000000000159b8	mov	x2, x21
00000000000159bc	bl	"_objc_msgSend$getImageBoundary:"
00000000000159c0	add	x8, sp, #0x98
00000000000159c4	mov	x0, x22
00000000000159c8	mov	x2, x20
00000000000159cc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000159d0	add	x8, sp, #0x18
00000000000159d4	mov	x0, x22
00000000000159d8	mov	x2, x21
00000000000159dc	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000159e0	ldur	x2, [x29, #-0x88]
00000000000159e4	cbz	x2, 0x15a80
00000000000159e8	add	x8, sp, #0x10
00000000000159ec	mov	x0, x22
00000000000159f0	mov	x3, x21
00000000000159f4	mov	w4, #0x1
00000000000159f8	bl	"_objc_msgSend$transformFromImage:toImage:fit:"
00000000000159fc	ldr	x19, [sp, #0x10]
0000000000015a00	cbz	x19, 0x15a84
0000000000015a04	ldur	d0, [x29, #-0x68]
0000000000015a08	fabs	d0, d0
0000000000015a0c	adrp	x8, 596 ; 0x269000
0000000000015a10	ldr	d1, [x8, #0x498]
0000000000015a14	fcmp	d0, d1
0000000000015a18	b.mi	0x15a84
0000000000015a1c	cbz	x21, 0x15adc
0000000000015a20	add	x8, sp, #0x10
0000000000015a24	mov	x0, x21
0000000000015a28	bl	_objc_msgSend$heliumRef
0000000000015a2c	b	0x15ae0
0000000000015a30	mov	w0, #0x0
0000000000015a34	ldp	x29, x30, [sp, #0x1a0]
0000000000015a38	ldp	x20, x19, [sp, #0x190]
0000000000015a3c	ldp	x22, x21, [sp, #0x180]
0000000000015a40	ldp	x24, x23, [sp, #0x170]
0000000000015a44	ldp	x26, x25, [sp, #0x160]
0000000000015a48	ldp	d9, d8, [sp, #0x150]
0000000000015a4c	add	sp, sp, #0x1b0
0000000000015a50	ret
0000000000015a54	str	xzr, [sp, #0x98]
0000000000015a58	add	x2, sp, #0x98
0000000000015a5c	mov	x0, x20
0000000000015a60	bl	"_objc_msgSend$setHeliumRef:"
0000000000015a64	ldr	x0, [sp, #0x98]
0000000000015a68	cbz	x0, 0x15a78
0000000000015a6c	ldr	x8, [x0]
0000000000015a70	ldr	x8, [x8, #0x18]
0000000000015a74	blr	x8
0000000000015a78	mov	w0, #0x1
0000000000015a7c	b	0x15a34
0000000000015a80	mov	x19, #0x0
0000000000015a84	cbz	x21, 0x15a98
0000000000015a88	add	x8, sp, #0x10
0000000000015a8c	mov	x0, x21
0000000000015a90	bl	_objc_msgSend$heliumRef
0000000000015a94	b	0x15a9c
0000000000015a98	str	xzr, [sp, #0x10]
0000000000015a9c	add	x2, sp, #0x10
0000000000015aa0	mov	x0, x20
0000000000015aa4	bl	"_objc_msgSend$setHeliumRef:"
0000000000015aa8	ldr	x0, [sp, #0x10]
0000000000015aac	cbz	x0, 0x15abc
0000000000015ab0	ldr	x8, [x0]
0000000000015ab4	ldr	x8, [x8, #0x18]
0000000000015ab8	blr	x8
0000000000015abc	ldur	x0, [x29, #-0x88]
0000000000015ac0	bl	0x252344 ; symbol stub for: _objc_release
0000000000015ac4	cbz	x19, 0x15a78
0000000000015ac8	ldr	x8, [x19]
0000000000015acc	ldr	x8, [x8, #0x18]
0000000000015ad0	mov	x0, x19
0000000000015ad4	blr	x8
0000000000015ad8	b	0x15a78
0000000000015adc	str	xzr, [sp, #0x10]
0000000000015ae0	ldur	w8, [x29, #-0x7c]
0000000000015ae4	cmp	w23, #0x1
0000000000015ae8	b.hi	0x15b30
0000000000015aec	cbz	w8, 0x15b48
0000000000015af0	ldur	d8, [x29, #-0x70]
0000000000015af4	mov	x0, x20
0000000000015af8	bl	_objc_msgSend$height
0000000000015afc	mov	x24, x0
0000000000015b00	ldur	d9, [x29, #-0x78]
0000000000015b04	mov	x0, x20
0000000000015b08	bl	_objc_msgSend$height
0000000000015b0c	ucvtf	d0, x24
0000000000015b10	fmul	d0, d8, d0
0000000000015b14	mov	x8, #0x4084000000000000
0000000000015b18	fmov	d1, x8
0000000000015b1c	fdiv	d8, d0, d1
0000000000015b20	ucvtf	d0, x0
0000000000015b24	fmul	d0, d9, d0
0000000000015b28	fdiv	d9, d0, d1
0000000000015b2c	b	0x15b8c
0000000000015b30	cbz	w8, 0x15b70
0000000000015b34	ldp	d0, d2, [x29, #-0x78]
0000000000015b38	fmov	d1, #1.68750000
0000000000015b3c	fmul	d8, d2, d1
0000000000015b40	fmul	d9, d0, d1
0000000000015b44	b	0x15b8c
0000000000015b48	ldur	d8, [x29, #-0x68]
0000000000015b4c	mov	x0, x20
0000000000015b50	bl	_objc_msgSend$height
0000000000015b54	ucvtf	d0, x0
0000000000015b58	fmul	d0, d8, d0
0000000000015b5c	mov	x8, #0x4084000000000000
0000000000015b60	fmov	d1, x8
0000000000015b64	fdiv	d9, d0, d1
0000000000015b68	stur	d9, [x29, #-0x68]
0000000000015b6c	b	0x15b7c
0000000000015b70	ldur	d0, [x29, #-0x68]
0000000000015b74	fmov	d1, #1.68750000
0000000000015b78	fmul	d9, d0, d1
0000000000015b7c	ldur	d0, [x29, #-0x60]
0000000000015b80	bl	0x25205c ; symbol stub for: ___sincos_stret
0000000000015b84	fmul	d8, d9, d0
0000000000015b88	fmul	d9, d9, d1
0000000000015b8c	ldr	x24, [sp, #0x10]
0000000000015b90	cbz	x24, 0x15bc4
0000000000015b94	ldr	x8, [x24]
0000000000015b98	ldr	x8, [x8, #0x10]
0000000000015b9c	mov	x0, x24
0000000000015ba0	blr	x8
0000000000015ba4	ldurb	w8, [x29, #-0x51]
0000000000015ba8	tbz	w8, #0x0, 0x15c44
0000000000015bac	str	x24, [sp]
0000000000015bb0	ldr	x8, [x24]
0000000000015bb4	ldr	x8, [x8, #0x10]
0000000000015bb8	mov	x0, x24
0000000000015bbc	blr	x8
0000000000015bc0	b	0x15bd0
0000000000015bc4	ldurb	w8, [x29, #-0x51]
0000000000015bc8	tbz	w8, #0x0, 0x15c18
0000000000015bcc	str	xzr, [sp]
0000000000015bd0	add	x8, sp, #0x8
0000000000015bd4	mov	x2, sp
0000000000015bd8	mov	x0, x22
0000000000015bdc	mov	x3, x21
0000000000015be0	mov	x4, x21
0000000000015be4	bl	"_objc_msgSend$smear:fromImage:toImage:"
0000000000015be8	ldr	x0, [sp, #0x8]
0000000000015bec	cmp	x24, x0
0000000000015bf0	b.eq	0x15c20
0000000000015bf4	cbz	x24, 0x15c0c
0000000000015bf8	ldr	x8, [x24]
0000000000015bfc	ldr	x8, [x8, #0x18]
0000000000015c00	mov	x0, x24
0000000000015c04	blr	x8
0000000000015c08	ldr	x0, [sp, #0x8]
0000000000015c0c	str	xzr, [sp, #0x8]
0000000000015c10	mov	x24, x0
0000000000015c14	b	0x15c30
0000000000015c18	mov	x24, #0x0
0000000000015c1c	b	0x15c44
0000000000015c20	cbz	x24, 0x15c30
0000000000015c24	ldr	x8, [x0]
0000000000015c28	ldr	x8, [x8, #0x18]
0000000000015c2c	blr	x8
0000000000015c30	ldr	x0, [sp]
0000000000015c34	cbz	x0, 0x15c44
0000000000015c38	ldr	x8, [x0]
0000000000015c3c	ldr	x8, [x8, #0x18]
0000000000015c40	blr	x8
0000000000015c44	mov	w0, #0x1a0
0000000000015c48	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000015c4c	mov	x25, x0
0000000000015c50	bl	__ZN10HgcBumpMapC2Ev
0000000000015c54	adrp	x8, 899 ; 0x398000
0000000000015c58	add	x8, x8, #0x460
0000000000015c5c	add	x9, x8, #0x10
0000000000015c60	str	x9, [x25]
0000000000015c64	ldr	x8, [x8, #0x88]
0000000000015c68	mov	x0, x25
0000000000015c6c	mov	w1, #0x1
0000000000015c70	mov	x2, x24
0000000000015c74	blr	x8
0000000000015c78	ldr	x8, [x25]
0000000000015c7c	ldr	x8, [x8, #0x78]
0000000000015c80	mov	x0, x25
0000000000015c84	mov	w1, #0x0
0000000000015c88	mov	x2, x19
0000000000015c8c	blr	x8
0000000000015c90	fcvt	s0, d8
0000000000015c94	fcvt	s1, d9
0000000000015c98	ldr	x8, [x25]
0000000000015c9c	ldr	x8, [x8, #0x60]
0000000000015ca0	movi.2d	v2, #0000000000000000
0000000000015ca4	movi.2d	v3, #0000000000000000
0000000000015ca8	mov	x0, x25
0000000000015cac	mov	w1, #0x0
0000000000015cb0	blr	x8
0000000000015cb4	ldp	d0, d1, [sp, #0x98]
0000000000015cb8	fcvt	s0, d0
0000000000015cbc	fcvt	s1, d1
0000000000015cc0	ldp	d2, d3, [sp, #0xa8]
0000000000015cc4	fcvt	s2, d2
0000000000015cc8	fcvt	s3, d3
0000000000015ccc	ldr	x8, [x25]
0000000000015cd0	ldr	x8, [x8, #0x60]
0000000000015cd4	mov	x0, x25
0000000000015cd8	mov	w1, #0x1
0000000000015cdc	blr	x8
0000000000015ce0	ldp	d0, d1, [sp, #0xb8]
0000000000015ce4	fcvt	s0, d0
0000000000015ce8	fcvt	s1, d1
0000000000015cec	ldp	d2, d3, [sp, #0xc8]
0000000000015cf0	fcvt	s2, d2
0000000000015cf4	fcvt	s3, d3
0000000000015cf8	ldr	x8, [x25]
0000000000015cfc	ldr	x8, [x8, #0x60]
0000000000015d00	mov	x0, x25
0000000000015d04	mov	w1, #0x2
0000000000015d08	blr	x8
0000000000015d0c	ldp	d0, d1, [sp, #0x18]
0000000000015d10	fcvt	s0, d0
0000000000015d14	fcvt	s1, d1
0000000000015d18	ldp	d2, d3, [sp, #0x28]
0000000000015d1c	fcvt	s2, d2
0000000000015d20	fcvt	s3, d3
0000000000015d24	ldr	x8, [x25]
0000000000015d28	ldr	x8, [x8, #0x60]
0000000000015d2c	mov	x0, x25
0000000000015d30	mov	w1, #0x3
0000000000015d34	blr	x8
0000000000015d38	ldp	d0, d1, [sp, #0x38]
0000000000015d3c	fcvt	s0, d0
0000000000015d40	fcvt	s1, d1
0000000000015d44	ldp	d2, d3, [sp, #0x48]
0000000000015d48	fcvt	s2, d2
0000000000015d4c	fcvt	s3, d3
0000000000015d50	ldr	x8, [x25]
0000000000015d54	ldr	x8, [x8, #0x60]
0000000000015d58	mov	x0, x25
0000000000015d5c	mov	w1, #0x4
0000000000015d60	blr	x8
0000000000015d64	ucvtf	s0, w23
0000000000015d68	ldr	x8, [x25]
0000000000015d6c	ldr	x8, [x8, #0x60]
0000000000015d70	movi.2d	v1, #0000000000000000
0000000000015d74	movi.2d	v2, #0000000000000000
0000000000015d78	movi.2d	v3, #0000000000000000
0000000000015d7c	mov	x0, x25
0000000000015d80	mov	w1, #0x5
0000000000015d84	blr	x8
0000000000015d88	str	x25, [sp, #0x8]
0000000000015d8c	ldr	x8, [x25]
0000000000015d90	ldr	x8, [x8, #0x10]
0000000000015d94	mov	x0, x25
0000000000015d98	blr	x8
0000000000015d9c	ldurb	w8, [x29, #-0x51]
0000000000015da0	cmp	w8, #0x1
0000000000015da4	b.ne	0x15dbc
0000000000015da8	add	x2, sp, #0x8
0000000000015dac	mov	x0, x22
0000000000015db0	mov	x3, x21
0000000000015db4	mov	x4, x20
0000000000015db8	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000015dbc	add	x2, sp, #0x8
0000000000015dc0	mov	x0, x20
0000000000015dc4	bl	"_objc_msgSend$setHeliumRef:"
0000000000015dc8	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm3 (float)
    - parm2 (float)
    - parm4 (bool)
    - parm6 (float)
    - parm7 (float)
    - parm5 (int)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  parm5 (int)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
    slot 5  <-  (constant / computed)
```
