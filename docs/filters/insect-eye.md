# Insect Eye

- **PAE class:** `Insect Eye`
- **Plugin UUID:** `62A7EF56-178A-4D81-AF6A-C1B77A7D9519`
- **Node names in corpus:** Insect Eye (15), Insect Eye 2 (3), Insect Eye 1 (3), Insect Eye 3 copy (1), Insect Eye 3 (1)
- **Corpus usage:** 10 files, 23 instances

## What it does

Insect Eye tiles the image into a honeycomb of hexagonal facets, each showing a small refracted copy of the picture, mimicking a compound insect eye. The verbatim HgcInsectEye shader builds a hexagonal grid (the 1.7321 = sqrt(3) constant is the hex-grid metric) and refracts the sample within each cell. Size sets the facet size and Refraction how much each facet distorts.

> **Note.** Shader-only. The verbatim HgcInsectEye (+ HgcInsectEyeBorder) Metal shaders are checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float (pixels) | 128 | 17 .. 350 | Size of each hexagonal facet, ~17-350 (default 128). *(keyframed in 4 instances)* |
| Refraction | float | 2 | 0 .. 2.03 | How strongly each facet bends/magnifies its sample, 0-~2 (default 2). *(keyframed in 14 instances)* |
| Border Size | float | 1 | 0 .. 1 | Thickness of the dark border between facets. Continuous float. |
| Border Color | color | - | - | Color of the inter-facet border (see companion HgcInsectEyeBorder shader). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcInsectEye` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcInsectEye.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcInsectEyeBorder`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcInsectEyeBorder` → [`HgcInsectEyeBorder.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcInsectEyeBorder.metal)

```metal
//Metal1.0     
//LEN=0000000967
[[ visible ]] FragmentOut HgcInsectEyeBorder_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(1.732100010, -2.000000000, 0.3333329856, 0.6766660213);
    const float4 c1 = float4(3.000000000, 0.5000000000, 0.9990000129, 1.000000000);
    const float4 c2 = float4(0.000000000, -0.8659999967, 0.2500000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7;
    FragmentOut output;

    r0.xy = texCoord1.xy + hg_Params[5].xy;
    r1 = r0.xxxx*hg_Params[3].xxxx + hg_Params[3].zzzz;
    r0 = r0.yyyy*hg_Params[3].yyyy + hg_Params[3].wwww;
    r1.yw = r1.yw + hg_Params[4].xx;
    r0.zw = r0.zw + hg_Params[4].yy;
    r2 = color0;
    r3 = r0 + r0;
    r4 = fract(r3);
    r3 = r3 - r4;
    r4 = r1*c0.xxxx + -r0;
    r5 = fract(r4);
    r4 = r4 - r5;
    r5 = r1*c0.xxxx + r0;
    r6 = fract(r5);
    r5 = r5 - r6;
    r6 = r3*c0.yyyy + r5;
    r6 = r6*c0.zzzz + c0.wwww;
    r6 = fract(r6);
    r6 = r6*c1.xxxx + c1.yyyy;
    r7 = fract(r6);
    r6 = r6 - r7;
    r4 = r3 + r4;
    r4 = r4 - r5;
    r4 = r4 + r6;
    r4 = r4 - c1.zzzz;
    r5 = r3*c0.yyyy + r5;
    r5 = r5 - r6;
    r5 = r5*c0.zzzz;
    r7 = fract(r5);
    r5 = r5 - r7;
    r6 = select(-c0.yyyy, c1.wwww, r4 < 0.00000f);
    r5 = -c0.yyyy*r5 + r6;
    r5 = r5 + r3;
    r7 = select(-c1.yyyy, c1.wwww, r4 < 0.00000f);
    r3 = r3*c1.yyyy + r7;
    r6 = fract(r3);
    r3 = r3 - r6;
    r4 = float4(r4 >= c2.xxxx);
    r3 = r3 + r4;
    r7 = r5*c1.yyyy;
    r7 = fract(r7);
    r3 = r3 - r7;
    r5 = r5*c2.yyyy + r1;
    r3 = r0 - r3;
    r6 = r3 + r3;
    r4 = r5*c0.xxxx + -r3;
    r5 = r5*c0.xxxx + r3;
    r7 = clamp(r6*hg_Params[1].xxxx + hg_Params[1].yyyy, 0.00000f, 1.00000f);
    r6 = clamp(r6*hg_Params[2].xxxx + hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r6);
    r1 = clamp(r4*hg_Params[1].xxxx + hg_Params[1].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r1);
    r4 = clamp(r4*hg_Params[2].xxxx + hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r4);
    r0 = clamp(r5*hg_Params[1].xxxx + hg_Params[1].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r0);
    r5 = clamp(r5*hg_Params[2].xxxx + hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r7 = fmax(r7, r5);
    r7.x = dot(r7, c2.zzzz);
    r7 = hg_Params[0]*r7.xxxx;
    r3.x = c1.w - r7.w;
    output.color0 = r2*r3.xxxx + r7;
    return output;
}
```

### CPU parameter wiring — `-[PAEInsectEye canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEInsectEye`

```asm
0000000000039ad8	mov	w3, #0x1
0000000000039adc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000039ae0	ldr	d10, [sp, #0x108]
0000000000039ae4	fmul	d0, d8, d10
0000000000039ae8	str	d0, [sp, #0x108]
0000000000039aec	ldr	x4, [x24]
0000000000039af0	add	x2, sp, #0x100
0000000000039af4	mov	x0, x25
0000000000039af8	mov	w3, #0x2
0000000000039afc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000039b00	ldr	x4, [x24]
0000000000039b04	add	x2, sp, #0xf8
0000000000039b08	mov	x0, x25
0000000000039b0c	mov	w3, #0x3
0000000000039b10	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000039b14	ldr	x6, [x24]
0000000000039b18	add	x2, sp, #0xf0
0000000000039b1c	add	x3, sp, #0xe8
0000000000039b20	add	x4, sp, #0xe0
0000000000039b24	mov	x0, x25
0000000000039b28	mov	w5, #0x4
0000000000039b2c	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
0000000000039b30	ldr	d11, [sp, #0x108]
0000000000039b34	ldr	d14, [sp, #0xf8]
0000000000039b38	ldr	x2, [x24]
0000000000039b3c	mov	x0, x21
0000000000039b40	bl	"_objc_msgSend$getRenderMode:"
0000000000039b44	cbz	w0, 0x3a240
0000000000039b48	mov	x0, x20
0000000000039b4c	bl	_objc_msgSend$imageType
0000000000039b50	cmp	x0, #0x3
0000000000039b54	b.ne	0x39b6c
0000000000039b58	cbz	x20, 0x39b74
0000000000039b5c	add	x8, sp, #0xd8
0000000000039b60	mov	x0, x20
0000000000039b64	bl	_objc_msgSend$heliumRef
0000000000039b68	b	0x39b78
0000000000039b6c	mov	w0, #0x0
0000000000039b70	b	0x3a240
0000000000039b74	str	xzr, [sp, #0xd8]
0000000000039b78	mov	x0, x20
0000000000039b7c	bl	_objc_msgSend$bounds
0000000000039b80	stp	d0, d1, [sp, #0xb0]
0000000000039b84	stp	d2, d3, [sp, #0xc0]
0000000000039b88	sub	x0, x29, #0x100
0000000000039b8c	add	x1, sp, #0xb0
0000000000039b90	add	x2, sp, #0xb0
0000000000039b94	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
0000000000039b98	ldr	d12, [sp, #0x100]
0000000000039b9c	fmov	d0, #1.00000000
0000000000039ba0	fcmp	d12, d0
0000000000039ba4	b.ge	0x39c0c
0000000000039ba8	ldr	x0, [sp, #0xd8]
0000000000039bac	str	x0, [sp, #0x20]
0000000000039bb0	cbz	x0, 0x39bc0
0000000000039bb4	ldr	x8, [x0]
0000000000039bb8	ldr	x8, [x8, #0x10]
0000000000039bbc	blr	x8
0000000000039bc0	add	x8, sp, #0x30
0000000000039bc4	add	x2, sp, #0x20
0000000000039bc8	mov	x0, x21
0000000000039bcc	mov	x3, x20
0000000000039bd0	mov	x4, x20
0000000000039bd4	bl	"_objc_msgSend$smear:fromImage:toImage:"
0000000000039bd8	ldr	x8, [sp, #0xd8]
0000000000039bdc	ldr	x0, [sp, #0x30]
0000000000039be0	cmp	x8, x0
0000000000039be4	b.eq	0x39dd4
0000000000039be8	cbz	x8, 0x39c00
0000000000039bec	ldr	x9, [x8]
0000000000039bf0	ldr	x9, [x9, #0x18]
0000000000039bf4	mov	x0, x8
0000000000039bf8	blr	x9
0000000000039bfc	ldr	x0, [sp, #0x30]
0000000000039c00	str	x0, [sp, #0xd8]
0000000000039c04	str	xzr, [sp, #0x30]
0000000000039c08	b	0x39de4
0000000000039c0c	add	x8, sp, #0x30
0000000000039c10	add	x0, sp, #0xd8
0000000000039c14	add	x1, sp, #0xb0
0000000000039c18	bl	0x250d48 ; symbol stub for: __Z14Fx_smearToRectRK5HGRefI6HGNodeERK6PCRectIdE
0000000000039c1c	ldr	x8, [sp, #0xd8]
0000000000039c20	ldr	x0, [sp, #0x30]
0000000000039c24	cmp	x8, x0
0000000000039c28	stp	d9, d14, [sp, #0x10]
0000000000039c2c	str	d11, [sp, #0x8]
0000000000039c30	b.eq	0x39c54
0000000000039c34	cbz	x8, 0x39c4c
0000000000039c38	ldr	x9, [x8]
0000000000039c3c	ldr	x9, [x9, #0x18]
0000000000039c40	mov	x0, x8
0000000000039c44	blr	x9
0000000000039c48	ldr	x0, [sp, #0x30]
0000000000039c4c	str	x0, [sp, #0xd8]
0000000000039c50	b	0x39c64
0000000000039c54	cbz	x8, 0x39c64
0000000000039c58	ldr	x8, [x0]
0000000000039c5c	ldr	x8, [x8, #0x18]
0000000000039c60	blr	x8
0000000000039c64	ldr	d9, [sp, #0x100]
0000000000039c68	ldp	d11, d13, [sp, #0xb0]
0000000000039c6c	ldp	d14, d15, [sp, #0xc0]
0000000000039c70	mov	w0, #0x1a0
0000000000039c74	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000039c78	mov	x24, x0
0000000000039c7c	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000039c80	fmov	d0, #3.00000000
0000000000039c84	fmul	d0, d9, d0
0000000000039c88	fsub	d1, d11, d0
0000000000039c8c	adrp	x8, 560 ; 0x269000
0000000000039c90	ldr	d2, [x8, #0x498]
0000000000039c94	fadd	d3, d1, d2
0000000000039c98	fcvtms	w8, d3
0000000000039c9c	fsub	d3, d13, d0
0000000000039ca0	fadd	d0, d0, d0
0000000000039ca4	fadd	d4, d0, d14
0000000000039ca8	fadd	d2, d3, d2
0000000000039cac	fcvtms	w9, d2
0000000000039cb0	fadd	d1, d1, d4
0000000000039cb4	fcvtps	w10, d1
0000000000039cb8	fadd	d0, d0, d15
0000000000039cbc	fadd	d0, d3, d0
0000000000039cc0	fcvtps	w11, d0
0000000000039cc4	sub	w10, w10, w8
0000000000039cc8	sub	w11, w11, w9
0000000000039ccc	scvtf	d2, w8
0000000000039cd0	scvtf	d1, w9
0000000000039cd4	scvtf	d3, w10
0000000000039cd8	scvtf	d4, w11
0000000000039cdc	scvtf	s0, w8
0000000000039ce0	fadd	d1, d1, d4
0000000000039ce4	fcvt	s1, d1
0000000000039ce8	fadd	d2, d2, d3
0000000000039cec	fcvt	s2, d2
0000000000039cf0	scvtf	s3, w9
0000000000039cf4	ldr	x8, [x24]
0000000000039cf8	ldr	x8, [x8, #0x60]
0000000000039cfc	mov	x0, x24
0000000000039d00	mov	w1, #0x0
0000000000039d04	blr	x8
0000000000039d08	ldr	x2, [sp, #0xd8]
0000000000039d0c	ldr	x8, [x24]
0000000000039d10	ldr	x8, [x8, #0x78]
0000000000039d14	mov	x0, x24
0000000000039d18	mov	w1, #0x0
0000000000039d1c	blr	x8
0000000000039d20	ldr	x0, [sp, #0xd8]
0000000000039d24	cmp	x0, x24
0000000000039d28	b.eq	0x39d50
0000000000039d2c	cbz	x0, 0x39d3c
0000000000039d30	ldr	x8, [x0]
0000000000039d34	ldr	x8, [x8, #0x18]
0000000000039d38	blr	x8
0000000000039d3c	str	x24, [sp, #0xd8]
0000000000039d40	ldr	x8, [x24]
0000000000039d44	ldr	x8, [x8, #0x10]
0000000000039d48	mov	x0, x24
0000000000039d4c	blr	x8
0000000000039d50	fmov	d0, #1.00000000
0000000000039d54	fdiv	d12, d0, d12
0000000000039d58	str	d12, [sp, #0x30]
0000000000039d5c	movi.2d	v0, #0000000000000000
0000000000039d60	stur	q0, [sp, #0x38]
0000000000039d64	stur	q0, [sp, #0x48]
0000000000039d68	str	d12, [sp, #0x58]
0000000000039d6c	stp	q0, q0, [sp, #0x60]
0000000000039d70	str	d12, [sp, #0x80]
0000000000039d74	stur	q0, [sp, #0x88]
0000000000039d78	stur	q0, [sp, #0x98]
0000000000039d7c	mov	x8, #0x3ff0000000000000
0000000000039d80	str	x8, [sp, #0xa8]
0000000000039d84	add	x8, sp, #0x28
0000000000039d88	add	x0, sp, #0x30
0000000000039d8c	add	x1, sp, #0xd8
0000000000039d90	mov	w2, #0x1
0000000000039d94	mov	w3, #0x0
0000000000039d98	bl	0x251c24 ; symbol stub for: __ZN9FxSupport15makeHeliumXFormERK14PCMatrix44TmplIdERK5HGRefI6HGNodeEbb
0000000000039d9c	ldp	d9, d14, [sp, #0x10]
0000000000039da0	ldr	d11, [sp, #0x8]
0000000000039da4	ldr	x8, [sp, #0xd8]
0000000000039da8	ldr	x0, [sp, #0x28]
0000000000039dac	cmp	x8, x0
0000000000039db0	b.eq	0x39e00
0000000000039db4	cbz	x8, 0x39dcc
0000000000039db8	ldr	x9, [x8]
0000000000039dbc	ldr	x9, [x9, #0x18]
0000000000039dc0	mov	x0, x8
0000000000039dc4	blr	x9
0000000000039dc8	ldr	x0, [sp, #0x28]
0000000000039dcc	str	x0, [sp, #0xd8]
0000000000039dd0	b	0x39e10
0000000000039dd4	cbz	x8, 0x39de4
0000000000039dd8	ldr	x8, [x0]
0000000000039ddc	ldr	x8, [x8, #0x18]
0000000000039de0	blr	x8
0000000000039de4	ldr	x0, [sp, #0x20]
0000000000039de8	cbz	x0, 0x39df8
0000000000039dec	ldr	x8, [x0]
0000000000039df0	ldr	x8, [x8, #0x18]
0000000000039df4	blr	x8
0000000000039df8	fmov	s13, #1.00000000
0000000000039dfc	b	0x39e90
0000000000039e00	cbz	x8, 0x39e10
0000000000039e04	ldr	x8, [x0]
0000000000039e08	ldr	x8, [x8, #0x18]
0000000000039e0c	blr	x8
0000000000039e10	add	x0, sp, #0x30
0000000000039e14	add	x1, sp, #0xb0
0000000000039e18	add	x2, sp, #0xb0
0000000000039e1c	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
0000000000039e20	mov	x8, #0xaf48
0000000000039e24	movk	x8, #0x9abc, lsl #16
0000000000039e28	movk	x8, #0xd7f2, lsl #32
0000000000039e2c	movk	x8, #0x3e7a, lsl #48
0000000000039e30	dup.2d	v0, x8
0000000000039e34	ldp	q1, q2, [sp, #0xb0]
0000000000039e38	fadd.2d	v0, v1, v0
0000000000039e3c	frintm.2d	v0, v0
0000000000039e40	fcvtzs.2d	v0, v0
0000000000039e44	xtn.2s	v0, v0
0000000000039e48	fadd.2d	v1, v1, v2
0000000000039e4c	frintp.2d	v1, v1
0000000000039e50	fcvtzs.2d	v1, v1
0000000000039e54	xtn.2s	v1, v1
0000000000039e58	sub.2s	v1, v1, v0
0000000000039e5c	mov.s	w8, v0[1]
0000000000039e60	fmov	w9, s0
0000000000039e64	scvtf	d0, w9
0000000000039e68	scvtf	d2, w8
0000000000039e6c	stp	d0, d2, [sp, #0xb0]
0000000000039e70	sshll.2d	v0, v1, #0x0
0000000000039e74	scvtf.2d	v0, v0
0000000000039e78	str	q0, [sp, #0xc0]
0000000000039e7c	ldr	x8, [x24]
0000000000039e80	ldr	x8, [x8, #0x18]
0000000000039e84	mov	x0, x24
0000000000039e88	blr	x8
0000000000039e8c	fcvt	s13, d12
0000000000039e90	fmov.2d	v0, #0.50000000
0000000000039e94	ldp	q1, q2, [sp, #0xb0]
0000000000039e98	fadd.2d	v0, v1, v0
0000000000039e9c	fmov.2d	v1, #-1.00000000
0000000000039ea0	fadd.2d	v1, v2, v1
0000000000039ea4	stp	q0, q1, [sp, #0xb0]
0000000000039ea8	mov	w0, #0x1a0
0000000000039eac	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000039eb0	mov	x24, x0
0000000000039eb4	bl	__ZN15HInsectEye_BaseC1Ev
0000000000039eb8	fabs	d0, d9
0000000000039ebc	ucvtf	d1, x22
0000000000039ec0	ucvtf	d2, x23
0000000000039ec4	fmul	d15, d0, d10
0000000000039ec8	fdiv	d3, d1, d8
0000000000039ecc	fdiv	d4, d2, d0
0000000000039ed0	fdiv	d5, d11, d8
0000000000039ed4	fdiv	d0, d15, d0
0000000000039ed8	fdiv	d3, d3, d5
0000000000039edc	fdiv	d0, d4, d0
0000000000039ee0	fcvt	s10, d3
0000000000039ee4	fcvt	s11, d0
0000000000039ee8	fadd	s0, s10, s10
0000000000039eec	fadd	s3, s11, s11
0000000000039ef0	fcvt	d0, s0
0000000000039ef4	fcvt	d3, s3
0000000000039ef8	fdiv	d0, d1, d0
0000000000039efc	fdiv	d1, d2, d3
0000000000039f00	fcvt	s8, d0
0000000000039f04	fcvt	s12, d1
0000000000039f08	ldr	x8, [x24]
0000000000039f0c	ldr	x8, [x8, #0x60]
0000000000039f10	movi.2d	v2, #0000000000000000
0000000000039f14	movi.2d	v3, #0000000000000000
0000000000039f18	mov	x0, x24
0000000000039f1c	mov	w1, #0x0
0000000000039f20	mov.16b	v0, v8
0000000000039f24	mov.16b	v1, v12
0000000000039f28	blr	x8
0000000000039f2c	fmul	s0, s10, s8
0000000000039f30	fmul	s1, s11, s12
0000000000039f34	ldr	x8, [x24]
0000000000039f38	ldr	x8, [x8, #0x60]
0000000000039f3c	movi.2d	v2, #0000000000000000
0000000000039f40	movi.2d	v3, #0000000000000000
0000000000039f44	mov	x0, x24
0000000000039f48	mov	w1, #0x1
0000000000039f4c	blr	x8
0000000000039f50	ldr	d0, [sp, #0x100]
0000000000039f54	fcvt	s0, d0
0000000000039f58	ldr	x8, [x24]
0000000000039f5c	ldr	x8, [x8, #0x60]
0000000000039f60	movi.2d	v2, #0000000000000000
0000000000039f64	movi.2d	v3, #0000000000000000
0000000000039f68	mov	x0, x24
0000000000039f6c	mov	w1, #0x2
0000000000039f70	mov.16b	v1, v0
0000000000039f74	blr	x8
0000000000039f78	ldr	d0, [sp, #0x108]
0000000000039f7c	fmov	d1, #2.00000000
0000000000039f80	fdiv	d0, d1, d0
0000000000039f84	fcvt	s0, d0
0000000000039f88	fdiv	d1, d1, d15
0000000000039f8c	fcvt	s9, d1
0000000000039f90	fneg	s10, s10
0000000000039f94	fneg	s11, s11
0000000000039f98	ldr	x8, [x24]
0000000000039f9c	ldr	x8, [x8, #0x60]
0000000000039fa0	mov	x0, x24
0000000000039fa4	mov	w1, #0x3
0000000000039fa8	mov.16b	v1, v9
0000000000039fac	mov.16b	v2, v10
0000000000039fb0	mov.16b	v3, v11
0000000000039fb4	blr	x8
0000000000039fb8	fmov	s0, #0.50000000
0000000000039fbc	fdiv	s8, s0, s8
0000000000039fc0	ldr	x8, [x24]
0000000000039fc4	ldr	x8, [x8, #0x60]
0000000000039fc8	fdiv	s12, s0, s12
0000000000039fcc	movi.2d	v2, #0000000000000000
0000000000039fd0	movi.2d	v3, #0000000000000000
0000000000039fd4	mov	x0, x24
0000000000039fd8	mov	w1, #0x4
0000000000039fdc	mov.16b	v0, v8
0000000000039fe0	mov.16b	v1, v12
0000000000039fe4	blr	x8
0000000000039fe8	mov	x0, x20
0000000000039fec	bl	_objc_msgSend$width
0000000000039ff0	mov	x22, x0
0000000000039ff4	mov	x0, x20
0000000000039ff8	bl	_objc_msgSend$height
0000000000039ffc	lsr	x8, x22, #1
000000000003a000	ucvtf	s0, x8
000000000003a004	lsr	x8, x0, #1
000000000003a008	ucvtf	s1, x8
000000000003a00c	ldr	x8, [x24]
000000000003a010	ldr	x8, [x8, #0x60]
000000000003a014	movi.2d	v2, #0000000000000000
000000000003a018	movi.2d	v3, #0000000000000000
000000000003a01c	mov	x0, x24
000000000003a020	mov	w1, #0x5
000000000003a024	blr	x8
000000000003a028	ldr	x8, [x24]
000000000003a02c	ldr	x8, [x8, #0x60]
000000000003a030	movi.2d	v2, #0000000000000000
000000000003a034	movi.2d	v3, #0000000000000000
000000000003a038	mov	x0, x24
000000000003a03c	mov	w1, #0x6
000000000003a040	mov.16b	v0, v13
000000000003a044	mov.16b	v1, v13
000000000003a048	blr	x8
000000000003a04c	ldp	d2, d3, [sp, #0xb0]
000000000003a050	fcvt	s0, d2
000000000003a054	fcvt	s1, d3
000000000003a058	ldp	d4, d5, [sp, #0xc0]
000000000003a05c	fadd	d2, d2, d4
000000000003a060	fcvt	s2, d2
000000000003a064	fadd	d3, d3, d5
000000000003a068	fcvt	s3, d3
000000000003a06c	ldr	x8, [x24]
000000000003a070	ldr	x8, [x8, #0x60]
000000000003a074	mov	x0, x24
000000000003a078	mov	w1, #0x7
000000000003a07c	blr	x8
000000000003a080	ldr	x2, [sp, #0xd8]
000000000003a084	ldr	x8, [x24]
000000000003a088	ldr	x8, [x8, #0x78]
000000000003a08c	mov	x0, x24
000000000003a090	mov	w1, #0x0
000000000003a094	blr	x8
000000000003a098	mov	w0, #0x1a0
000000000003a09c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000003a0a0	mov	x22, x0
000000000003a0a4	bl	__ZN18HgcInsectEyeBorderC1Ev
000000000003a0a8	str	x22, [sp, #0x30]
000000000003a0ac	ldp	d1, d0, [sp, #0xe8]
000000000003a0b0	fcvt	s0, d0
000000000003a0b4	fcvt	s1, d1
000000000003a0b8	ldr	d2, [sp, #0xe0]
000000000003a0bc	fcvt	s2, d2
000000000003a0c0	ldr	x8, [x22]
000000000003a0c4	ldr	x8, [x8, #0x60]
000000000003a0c8	fmov	s3, #1.00000000
000000000003a0cc	mov	x0, x22
000000000003a0d0	mov	w1, #0x0
000000000003a0d4	blr	x8
000000000003a0d8	fdiv	d0, d14, d15
000000000003a0dc	fcvt	s0, d0
000000000003a0e0	fmov	s1, #1.00000000
000000000003a0e4	fsub	s1, s1, s0
000000000003a0e8	fcvt	s13, d15
000000000003a0ec	fneg	s0, s13
000000000003a0f0	fnmul	s14, s13, s1
000000000003a0f4	ldr	x8, [x22]
000000000003a0f8	ldr	x8, [x8, #0x60]
000000000003a0fc	movi.2d	v2, #0000000000000000
000000000003a100	movi.2d	v3, #0000000000000000
000000000003a104	mov	x0, x22
000000000003a108	mov	w1, #0x1
000000000003a10c	mov.16b	v1, v14
000000000003a110	blr	x8
000000000003a114	ldr	x8, [x22]
000000000003a118	ldr	x8, [x8, #0x60]
000000000003a11c	movi.2d	v2, #0000000000000000
000000000003a120	movi.2d	v3, #0000000000000000
000000000003a124	mov	x0, x22
000000000003a128	mov	w1, #0x2
000000000003a12c	mov.16b	v0, v13
000000000003a130	mov.16b	v1, v14
000000000003a134	blr	x8
000000000003a138	ldr	d0, [sp, #0x108]
000000000003a13c	fmov	d1, #2.00000000
000000000003a140	fdiv	d0, d1, d0
000000000003a144	fcvt	s0, d0
000000000003a148	ldr	x8, [x22]
000000000003a14c	ldr	x8, [x8, #0x60]
000000000003a150	mov	x0, x22
000000000003a154	mov	w1, #0x3
000000000003a158	mov.16b	v1, v9
000000000003a15c	mov.16b	v2, v10
000000000003a160	mov.16b	v3, v11
000000000003a164	blr	x8
000000000003a168	ldr	x8, [x22]
000000000003a16c	ldr	x8, [x8, #0x60]
000000000003a170	movi.2d	v2, #0000000000000000
000000000003a174	movi.2d	v3, #0000000000000000
000000000003a178	mov	x0, x22
000000000003a17c	mov	w1, #0x4
000000000003a180	mov.16b	v0, v8
000000000003a184	mov.16b	v1, v12
000000000003a188	blr	x8
000000000003a18c	mov	x0, x20
000000000003a190	bl	_objc_msgSend$width
000000000003a194	mov	x23, x0
000000000003a198	mov	x0, x20
000000000003a19c	bl	_objc_msgSend$height
000000000003a1a0	lsr	x8, x23, #1
000000000003a1a4	ucvtf	s0, x8
000000000003a1a8	lsr	x8, x0, #1
000000000003a1ac	ucvtf	s1, x8
000000000003a1b0	ldr	x8, [x22]
000000000003a1b4	ldr	x8, [x8, #0x60]
000000000003a1b8	movi.2d	v2, #0000000000000000
000000000003a1bc	movi.2d	v3, #0000000000000000
000000000003a1c0	mov	x0, x22
000000000003a1c4	mov	w1, #0x5
000000000003a1c8	blr	x8
000000000003a1cc	ldr	x8, [x22]
000000000003a1d0	ldr	x8, [x8, #0x78]
000000000003a1d4	mov	x0, x22
000000000003a1d8	mov	w1, #0x0
000000000003a1dc	mov	x2, x24
000000000003a1e0	blr	x8
000000000003a1e4	add	x2, sp, #0x30
000000000003a1e8	mov	x0, x21
000000000003a1ec	mov	x3, x20
000000000003a1f0	mov	x4, x19
000000000003a1f4	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000003a1f8	add	x2, sp, #0x30
000000000003a1fc	mov	x0, x19
000000000003a200	bl	"_objc_msgSend$setHeliumRef:"
000000000003a204	ldr	x0, [sp, #0x30]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : ColorParameter
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (colour)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm2 (float)
    slot 3  <-  parm1 (float)
    slot 4  <-  (constant / computed / multi-pass — read the disasm)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  (constant / computed / multi-pass — read the disasm)
    slot 7  <-  (constant / computed / multi-pass — read the disasm)
```
