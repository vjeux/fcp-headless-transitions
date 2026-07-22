# Defocus

- **PAE class:** `Defocus`
- **Plugin UUID:** `0F3B36EF-B955-4471-87C6-9EE2A74AFE5E`
- **Node names in corpus:** Defocus (51), Source (31), Df (1), Defocus copy (1)
- **Corpus usage:** 69 files, 84 instances

## What it does

Defocus simulates a camera's out-of-focus lens: instead of a Gaussian, it blurs with a polygonal aperture (bokeh) whose shape has a chosen number of Sides and Rotation, so bright points bloom into hexagons/pentagons. Amount is the defocus radius, Gain boosts highlight bokeh. FCP uses the HgcConvolvePass7tapDefocus shader (checked in); the filter is not yet implemented.

> **Note.** HgcConvolvePass7tapDefocus shader is checked in but the filter is not implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 10 | 0 .. 80 | Defocus / blur-circle radius, 0-80. 0 = in focus. Heavily keyframed for rack-focus pulls. *(keyframed in 61 instances)* |
| Sides | enum(int) | 3 | 3 .. 8 | Number of aperture-blade sides shaping the bokeh, 3-8 (3 = triangular bokeh, higher = rounder). |
| Rotation | float (radians) | 0 | 0 .. 1.745 | Rotation of the aperture polygon, 0..~1.75 radians. |
| Gain | float | 2 | 0.05 .. 4 | Highlight bokeh gain, 0.05-4 (default 2). Higher = brighter, more defined bokeh discs. |
| Shape | bool | 0 | 0 .. 1 | Toggle between aperture shape modes. |
| Aspect Ratio | bool/float | 1 | 1 .. 1 | Aspect stretch of the bokeh (anamorphic bokeh when non-square). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the defocused result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** — 📄 shader available: `evidence/shaders/HgcConvolvePass7tapDefocus.metal` (verbatim FCP source, per-pixel math decoded; TS port pending).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGamma`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGamma` → [`HgcGamma.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGamma.metal)

```metal
//Metal1.0     
//LEN=000000018b
[[ visible ]] FragmentOut HgcGamma_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = pow(r0, hg_Params[0]);
    r0 = select(r1, r0, r0 < 0.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEDefocus canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEDefocus`

```asm
0000000000021a7c	mov	w3, #0x1
0000000000021a80	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000021a84	ldur	d0, [x29, #-0x48]
0000000000021a88	fcmp	d0, #0.0
0000000000021a8c	b.ne	0x21aa4
0000000000021a90	cbz	x20, 0x21b4c
0000000000021a94	add	x8, sp, #0x40
0000000000021a98	mov	x0, x20
0000000000021a9c	bl	_objc_msgSend$heliumRef
0000000000021aa0	b	0x21b50
0000000000021aa4	fmov	d1, #0.50000000
0000000000021aa8	fmul	d0, d0, d1
0000000000021aac	stur	d0, [x29, #-0x48]
0000000000021ab0	ldr	x4, [x23]
0000000000021ab4	sub	x2, x29, #0x49
0000000000021ab8	mov	x0, x22
0000000000021abc	mov	w3, #0x7
0000000000021ac0	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000021ac4	ldr	x4, [x23]
0000000000021ac8	sub	x2, x29, #0x58
0000000000021acc	mov	x0, x22
0000000000021ad0	mov	w3, #0x2
0000000000021ad4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000021ad8	ldr	x4, [x23]
0000000000021adc	sub	x2, x29, #0x5c
0000000000021ae0	mov	x0, x22
0000000000021ae4	mov	w3, #0x3
0000000000021ae8	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000021aec	ldur	w24, [x29, #-0x5c]
0000000000021af0	ldr	x4, [x23]
0000000000021af4	sub	x2, x29, #0x60
0000000000021af8	mov	x0, x22
0000000000021afc	mov	w3, #0x4
0000000000021b00	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000021b04	cbnz	w24, 0x21b10
0000000000021b08	mov	w8, #0x14
0000000000021b0c	stur	w8, [x29, #-0x60]
0000000000021b10	ldr	x4, [x23]
0000000000021b14	sub	x2, x29, #0x68
0000000000021b18	mov	x0, x22
0000000000021b1c	mov	w3, #0x5
0000000000021b20	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000021b24	add	x8, sp, #0xa0
0000000000021b28	cbz	x19, 0x21b78
0000000000021b2c	mov	x0, x19
0000000000021b30	bl	_objc_msgSend$imageInfo
0000000000021b34	ldr	x8, [sp, #0xc8]
0000000000021b38	cbz	x8, 0x21b88
0000000000021b3c	ldur	d0, [x29, #-0x68]
0000000000021b40	fneg	d0, d0
0000000000021b44	stur	d0, [x29, #-0x68]
0000000000021b48	b	0x21b88
0000000000021b4c	str	xzr, [sp, #0x40]
0000000000021b50	add	x2, sp, #0x40
0000000000021b54	mov	x0, x19
0000000000021b58	bl	"_objc_msgSend$setHeliumRef:"
0000000000021b5c	ldr	x0, [sp, #0x40]
0000000000021b60	cbz	x0, 0x21b70
0000000000021b64	ldr	x8, [x0]
0000000000021b68	ldr	x8, [x8, #0x18]
0000000000021b6c	blr	x8
0000000000021b70	mov	w0, #0x1
0000000000021b74	b	0x21c68
0000000000021b78	str	xzr, [sp, #0xe0]
0000000000021b7c	movi.2d	v0, #0000000000000000
0000000000021b80	stp	q0, q0, [x8, #0x20]
0000000000021b84	stp	q0, q0, [sp, #0xa0]
0000000000021b88	mov	x0, x20
0000000000021b8c	bl	_objc_msgSend$pixelTransform
0000000000021b90	bl	_objc_msgSend$matrix
0000000000021b94	mov	x24, x0
0000000000021b98	ldr	x4, [x23]
0000000000021b9c	add	x2, sp, #0x98
0000000000021ba0	mov	x0, x22
0000000000021ba4	mov	w3, #0x6
0000000000021ba8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000021bac	ldr	d0, [sp, #0x98]
0000000000021bb0	adrp	x8, 584 ; 0x269000
0000000000021bb4	ldr	d1, [x8, #0x6a0]
0000000000021bb8	fmaxnm	d0, d0, d1
0000000000021bbc	adrp	x8, 584 ; 0x269000
0000000000021bc0	ldr	d1, [x8, #0x6a8]
0000000000021bc4	fminnm	d0, d0, d1
0000000000021bc8	str	d0, [sp, #0x98]
0000000000021bcc	fmov	d1, #1.00000000
0000000000021bd0	fcmp	d0, d1
0000000000021bd4	fmov.2d	v2, #1.00000000
0000000000021bd8	b.pl	0x21bec
0000000000021bdc	fcvt	s0, d0
0000000000021be0	fcvt	d0, s0
0000000000021be4	mov.d	v2[1], v0[0]
0000000000021be8	b	0x21c00
0000000000021bec	fmov	d1, #2.00000000
0000000000021bf0	fsub	d0, d1, d0
0000000000021bf4	fcvt	s0, d0
0000000000021bf8	fcvt	d0, s0
0000000000021bfc	mov.d	v2[0], v0[0]
0000000000021c00	add	x8, x24, #0x28
0000000000021c04	ldr	d0, [x24]
0000000000021c08	ld1.d	{ v0 }[1], [x8]
0000000000021c0c	stp	q0, q2, [sp, #0x10]
0000000000021c10	ldur	q0, [x23, #0x18]
0000000000021c14	str	q0, [sp]
0000000000021c18	ldur	d0, [x29, #-0x48]
0000000000021c1c	mov	x8, #0x4059000000000000
0000000000021c20	fmov	d1, x8
0000000000021c24	fcmp	d0, d1
0000000000021c28	fcsel	d0, d1, d0, gt
0000000000021c2c	stur	d0, [x29, #-0x48]
0000000000021c30	mov	x0, x20
0000000000021c34	bl	_objc_msgSend$imageType
0000000000021c38	cmp	w0, #0x3
0000000000021c3c	b.ne	0x21c64
0000000000021c40	ldr	x2, [x23]
0000000000021c44	mov	x0, x21
0000000000021c48	bl	"_objc_msgSend$getRenderMode:"
0000000000021c4c	cbz	w0, 0x21c68
0000000000021c50	cbz	x20, 0x21c84
0000000000021c54	add	x8, sp, #0x90
0000000000021c58	mov	x0, x20
0000000000021c5c	bl	_objc_msgSend$heliumRef
0000000000021c60	b	0x21c88
0000000000021c64	mov	w0, #0x0
0000000000021c68	ldp	x29, x30, [sp, #0x150]
0000000000021c6c	ldp	x20, x19, [sp, #0x140]
0000000000021c70	ldp	x22, x21, [sp, #0x130]
0000000000021c74	ldp	x24, x23, [sp, #0x120]
0000000000021c78	ldp	x28, x27, [sp, #0x110]
0000000000021c7c	add	sp, sp, #0x160
0000000000021c80	ret
0000000000021c84	str	xzr, [sp, #0x90]
0000000000021c88	ldur	d0, [x29, #-0x48]
0000000000021c8c	fcmp	d0, #0.0
0000000000021c90	b.ls	0x21e70
0000000000021c94	mov	w0, #0x1a0
0000000000021c98	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000021c9c	mov	x22, x0
0000000000021ca0	bl	__ZN13HGammaDefocusC1Ev
0000000000021ca4	ldr	x2, [sp, #0x90]
0000000000021ca8	ldr	x8, [x22]
0000000000021cac	ldr	x8, [x8, #0x78]
0000000000021cb0	mov	x0, x22
0000000000021cb4	mov	w1, #0x0
0000000000021cb8	blr	x8
0000000000021cbc	ldur	d0, [x29, #-0x58]
0000000000021cc0	fcvt	s0, d0
0000000000021cc4	ldr	x8, [x22]
0000000000021cc8	ldr	x8, [x8, #0x60]
0000000000021ccc	mov	x0, x22
0000000000021cd0	mov	w1, #0x0
0000000000021cd4	mov.16b	v1, v0
0000000000021cd8	mov.16b	v2, v0
0000000000021cdc	mov.16b	v3, v0
0000000000021ce0	blr	x8
0000000000021ce4	mov	w0, #0x290
0000000000021ce8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000021cec	mov	x24, x0
0000000000021cf0	bl	0x2512c4 ; symbol stub for: __ZN14LiDepthDefocusC1Ev
0000000000021cf4	ldr	x8, [x24]
0000000000021cf8	ldr	x8, [x8, #0x230]
0000000000021cfc	mov	x0, x24
0000000000021d00	mov	w1, #0x1
0000000000021d04	blr	x8
0000000000021d08	ldur	d0, [x29, #-0x48]
0000000000021d0c	ldr	d1, [x23, #0x18]
0000000000021d10	fmul	d0, d0, d1
0000000000021d14	fcvt	s0, d0
0000000000021d18	ldr	x8, [x24]
0000000000021d1c	ldr	x8, [x8, #0x238]
0000000000021d20	mov	x0, x24
0000000000021d24	blr	x8
0000000000021d28	ldr	x8, [x24]
0000000000021d2c	ldr	x8, [x8, #0x78]
0000000000021d30	mov	x0, x24
0000000000021d34	mov	w1, #0x0
0000000000021d38	mov	x2, x22
0000000000021d3c	blr	x8
0000000000021d40	ldp	q1, q0, [sp, #0x10]
0000000000021d44	fmul.2d	v0, v0, v1
0000000000021d48	ldr	q1, [sp]
0000000000021d4c	fdiv.2d	v0, v0, v1
0000000000021d50	fcvtn	v0.2s, v0.2d
0000000000021d54	str	d0, [sp, #0x40]
0000000000021d58	ldr	x8, [x24]
0000000000021d5c	ldr	x8, [x8, #0x240]
0000000000021d60	add	x1, sp, #0x40
0000000000021d64	mov	x0, x24
0000000000021d68	blr	x8
0000000000021d6c	ldur	d0, [x29, #-0x68]
0000000000021d70	fcvt	s0, d0
0000000000021d74	fneg	s0, s0
0000000000021d78	ldr	x8, [x24]
0000000000021d7c	ldr	x8, [x8, #0x248]
0000000000021d80	mov	x0, x24
0000000000021d84	blr	x8
0000000000021d88	ldur	w1, [x29, #-0x60]
0000000000021d8c	ldr	x8, [x24]
0000000000021d90	ldr	x8, [x8, #0x250]
0000000000021d94	mov	x0, x24
0000000000021d98	blr	x8
0000000000021d9c	add	x0, sp, #0x40
0000000000021da0	bl	0x251ca8 ; symbol stub for: __ZN9LiDofInfoC1Ev
0000000000021da4	add	x1, sp, #0x40
0000000000021da8	mov	x0, x24
0000000000021dac	bl	0x2512b8 ; symbol stub for: __ZN14LiDepthDefocus9SetParamsERK9LiDofInfo
0000000000021db0	mov	w0, #0x1a0
0000000000021db4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000021db8	mov	x23, x0
0000000000021dbc	bl	__ZN13HGammaDefocusC1Ev
0000000000021dc0	str	x23, [sp, #0x38]
0000000000021dc4	ldr	x8, [x23]
0000000000021dc8	ldr	x8, [x8, #0x78]
0000000000021dcc	mov	x0, x23
0000000000021dd0	mov	w1, #0x0
0000000000021dd4	mov	x2, x24
0000000000021dd8	blr	x8
0000000000021ddc	ldur	d0, [x29, #-0x58]
0000000000021de0	fmov	d1, #1.00000000
0000000000021de4	fdiv	d0, d1, d0
0000000000021de8	fcvt	s0, d0
0000000000021dec	ldr	x8, [x23]
0000000000021df0	ldr	x8, [x8, #0x60]
0000000000021df4	mov	x0, x23
0000000000021df8	mov	w1, #0x0
0000000000021dfc	mov.16b	v1, v0
0000000000021e00	mov.16b	v2, v0
0000000000021e04	mov.16b	v3, v0
0000000000021e08	blr	x8
0000000000021e0c	ldurb	w8, [x29, #-0x49]
0000000000021e10	cmp	w8, #0x1
0000000000021e14	b.ne	0x21e2c
0000000000021e18	add	x2, sp, #0x38
0000000000021e1c	mov	x0, x21
0000000000021e20	mov	x3, x20
0000000000021e24	mov	x4, x19
0000000000021e28	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000021e2c	add	x2, sp, #0x38
0000000000021e30	mov	x0, x19
0000000000021e34	bl	"_objc_msgSend$setHeliumRef:"
0000000000021e38	ldr	x0, [sp, #0x38]
0000000000021e3c	cbz	x0, 0x21e4c
0000000000021e40	ldr	x8, [x0]
0000000000021e44	ldr	x8, [x8, #0x18]
0000000000021e48	blr	x8
0000000000021e4c	ldr	x8, [x24]
0000000000021e50	ldr	x8, [x8, #0x18]
0000000000021e54	mov	x0, x24
0000000000021e58	blr	x8
0000000000021e5c	ldr	x8, [x22]
0000000000021e60	ldr	x8, [x8, #0x18]
0000000000021e64	mov	x0, x22
0000000000021e68	blr	x8
0000000000021e6c	b	0x21e7c
0000000000021e70	add	x2, sp, #0x90
0000000000021e74	mov	x0, x19
0000000000021e78	bl	"_objc_msgSend$setHeliumRef:"
0000000000021e7c	ldr	x0, [sp, #0x90]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm7 (bool)
    - parm2 (float)
    - parm3 (int)
    - parm4 (int)
    - parm5 (float)
    - parm6 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm6 (float)
    slot 0  <-  (constant / computed)
```
