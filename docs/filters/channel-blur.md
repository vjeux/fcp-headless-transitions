# Channel Blur

- **PAE class:** `Channel Blur`
- **Plugin UUID:** `6C0F1215-6017-44F0-82C8-1B265FDC16CB`
- **Node names in corpus:** Channel Blur (225), Channel Blur copy (2), Channel Blur Source (1)
- **Corpus usage:** 185 files, 228 instances

## What it does

Channel Blur blurs the R, G, B and alpha channels independently: you can blur, say, only the red channel while keeping green sharp, producing controllable chromatic softening or selective-channel effects. Amount sets the radius and per-channel toggles select which channels get blurred; Horizontal/Vertical weight the blur axis.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Channel Blur" (per-channel Gaussian). Behavior follows Gaussian Blur applied selectively.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 4 | 0 .. 750 | Blur radius in pixels applied to the enabled channels, 0-750. 0 = no blur. *(keyframed in 6 instances)* |
| Blur Red | bool | 1 | 0 .. 1 | Toggle: blur the red channel. |
| Blur Green | bool | 1 | 0 .. 0 | Toggle: blur the green channel. |
| Blur Blue | bool | 1 | 0 .. 1 | Toggle: blur the blue channel. |
| Blur Alpha | bool | 1 | 0 .. 1 | Toggle: blur the alpha channel. |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal blur weighting, 0-100%. |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical blur weighting, 0-100%. |
| Mix | float | 1 | 0.4 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 214 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcChannelBlur`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcChannelBlur` → [`HgcChannelBlur.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcChannelBlur.metal)

```metal
//Metal1.0     
//LEN=00000001aa
[[ visible ]] FragmentOut HgcChannelBlur_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1.xyz = r1.xyz / fmax(r1.w, 1.00000e-06f);
    r1.xyz = mix(r0.xyz, r1.xyz, hg_Params[0].xyz);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}
```

### Metal fragment shader — `HgcChannelBlurNoPremult`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcChannelBlurNoPremult` → [`HgcChannelBlurNoPremult.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcChannelBlurNoPremult.metal)

```metal
//Metal1.0     
//LEN=000000013b
[[ visible ]] FragmentOut HgcChannelBlurNoPremult_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    output.color0 = mix(r0, r1, hg_Params[0]);
    return output;
}
```

### CPU parameter wiring — `-[PAEChannelBlur canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEChannelBlur`

```asm
00000000000d8988	mov	w3, #0x1
00000000000d898c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000d8990	ldur	d0, [x29, #-0x88]
00000000000d8994	fmov	d1, #0.50000000
00000000000d8998	fmul	d0, d0, d1
00000000000d899c	stur	d0, [x29, #-0x88]
00000000000d89a0	ldr	x4, [x23]
00000000000d89a4	sub	x2, x29, #0x90
00000000000d89a8	mov	x0, x24
00000000000d89ac	mov	w3, #0x6
00000000000d89b0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000d89b4	ldur	d0, [x29, #-0x90]
00000000000d89b8	adrp	x8, 400 ; 0x268000
00000000000d89bc	ldr	d10, [x8, #0xc48]
00000000000d89c0	fmul	d0, d0, d10
00000000000d89c4	fmul	d0, d8, d0
00000000000d89c8	stur	d0, [x29, #-0x90]
00000000000d89cc	ldr	x4, [x23]
00000000000d89d0	sub	x2, x29, #0x98
00000000000d89d4	mov	x0, x24
00000000000d89d8	mov	w3, #0x7
00000000000d89dc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000d89e0	ldur	d0, [x29, #-0x98]
00000000000d89e4	fmul	d0, d0, d10
00000000000d89e8	fmul	d0, d9, d0
00000000000d89ec	stur	d0, [x29, #-0x98]
00000000000d89f0	ldr	x4, [x23]
00000000000d89f4	sub	x2, x29, #0x99
00000000000d89f8	mov	x0, x24
00000000000d89fc	mov	w3, #0x2
00000000000d8a00	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d8a04	ldr	x4, [x23]
00000000000d8a08	sub	x2, x29, #0x9a
00000000000d8a0c	mov	x0, x24
00000000000d8a10	mov	w3, #0x3
00000000000d8a14	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d8a18	ldr	x4, [x23]
00000000000d8a1c	sub	x2, x29, #0x9b
00000000000d8a20	mov	x0, x24
00000000000d8a24	mov	w3, #0x4
00000000000d8a28	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d8a2c	ldr	x4, [x23]
00000000000d8a30	sub	x2, x29, #0x9c
00000000000d8a34	mov	x0, x24
00000000000d8a38	mov	w3, #0x5
00000000000d8a3c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d8a40	ldr	x4, [x23]
00000000000d8a44	sub	x2, x29, #0x9d
00000000000d8a48	mov	x0, x24
00000000000d8a4c	mov	w3, #0x8
00000000000d8a50	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d8a54	sturb	wzr, [x29, #-0x9e]
00000000000d8a58	ldr	x4, [x23]
00000000000d8a5c	sub	x2, x29, #0x9e
00000000000d8a60	mov	x0, x24
00000000000d8a64	mov	w3, #0x9
00000000000d8a68	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d8a6c	cbz	x21, 0xd8a88
00000000000d8a70	sub	x8, x29, #0xa8
00000000000d8a74	mov	x0, x21
00000000000d8a78	bl	_objc_msgSend$heliumRef
00000000000d8a7c	b	0xd8a8c
00000000000d8a80	mov	w0, #0x0
00000000000d8a84	b	0xd8e60
00000000000d8a88	stur	xzr, [x29, #-0xa8]
00000000000d8a8c	ldur	d0, [x29, #-0x88]
00000000000d8a90	fcmp	d0, #0.0
00000000000d8a94	b.ne	0xd8aa8
00000000000d8a98	sub	x2, x29, #0xa8
00000000000d8a9c	mov	x0, x20
00000000000d8aa0	bl	"_objc_msgSend$setHeliumRef:"
00000000000d8aa4	b	0xd8e48
00000000000d8aa8	ldurb	w8, [x29, #-0x9e]
00000000000d8aac	cmp	w8, #0x1
00000000000d8ab0	b.ne	0xd8bf8
00000000000d8ab4	add	x8, sp, #0xc8
00000000000d8ab8	mov	x0, x19
00000000000d8abc	mov	x2, x20
00000000000d8ac0	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000d8ac4	add	x8, sp, #0x48
00000000000d8ac8	mov	x0, x19
00000000000d8acc	mov	x2, x20
00000000000d8ad0	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000d8ad4	mov	w0, #0x1c0
00000000000d8ad8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d8adc	mov	x19, x0
00000000000d8ae0	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
00000000000d8ae4	adrp	x8, 702 ; 0x396000
00000000000d8ae8	add	x8, x8, #0x988
00000000000d8aec	add	x8, x8, #0x10
00000000000d8af0	str	x8, [x19]
00000000000d8af4	stp	xzr, xzr, [x19, #0x198]
00000000000d8af8	str	wzr, [x19, #0x1a8]
00000000000d8afc	stp	xzr, xzr, [x19, #0x1b0]
00000000000d8b00	ldp	d10, d9, [x29, #-0x90]
00000000000d8b04	ldur	d8, [x29, #-0x98]
00000000000d8b08	mov	x23, #0x0
00000000000d8b0c	mov	x0, x21
00000000000d8b10	bl	_objc_msgSend$width
00000000000d8b14	mov	x22, x0
00000000000d8b18	ldr	d11, [sp, #0xc8]
00000000000d8b1c	mov	x23, #0x0
00000000000d8b20	mov	x0, x21
00000000000d8b24	bl	_objc_msgSend$height
00000000000d8b28	add	x8, sp, #0xc8
00000000000d8b2c	fcvt	s0, d9
00000000000d8b30	fcvt	s1, d10
00000000000d8b34	ucvtf	d3, x22
00000000000d8b38	fcvt	s2, d8
00000000000d8b3c	fmul	d3, d11, d3
00000000000d8b40	fcvtps	w1, d3
00000000000d8b44	ucvtf	d3, x0
00000000000d8b48	ldp	q5, q4, [x8]
00000000000d8b4c	fcvtn	v5.2s, v5.2d
00000000000d8b50	fcvtn2	v5.4s, v4.2d
00000000000d8b54	str	q5, [sp, #0x30]
00000000000d8b58	ldp	q5, q4, [x8, #0x20]
00000000000d8b5c	ldr	d6, [sp, #0xf0]
00000000000d8b60	fmul	d3, d6, d3
00000000000d8b64	fcvtps	w2, d3
00000000000d8b68	fcvtn	v3.2s, v5.2d
00000000000d8b6c	fcvtn2	v3.4s, v4.2d
00000000000d8b70	str	q3, [sp, #0x20]
00000000000d8b74	ldur	q3, [sp, #0x58]
00000000000d8b78	ldur	q4, [sp, #0x48]
00000000000d8b7c	fcvtn	v4.2s, v4.2d
00000000000d8b80	fcvtn2	v4.4s, v3.2d
00000000000d8b84	str	q4, [sp, #0x10]
00000000000d8b88	ldur	q3, [sp, #0x78]
00000000000d8b8c	ldur	q4, [sp, #0x68]
00000000000d8b90	fcvtn	v4.2s, v4.2d
00000000000d8b94	fcvtn2	v4.4s, v3.2d
00000000000d8b98	str	q4, [sp]
00000000000d8b9c	add	x3, sp, #0x30
00000000000d8ba0	add	x4, sp, #0x20
00000000000d8ba4	add	x5, sp, #0x10
00000000000d8ba8	mov	x6, sp
00000000000d8bac	mov	x0, x19
00000000000d8bb0	bl	__ZN21HEquirectGaussianBlur4initEfffiiRK9PCVector4IfES3_S3_S3_
00000000000d8bb4	ldur	x2, [x29, #-0xa8]
00000000000d8bb8	ldr	x8, [x19]
00000000000d8bbc	ldr	x8, [x8, #0x78]
00000000000d8bc0	mov	x23, #0x0
00000000000d8bc4	mov	x0, x19
00000000000d8bc8	mov	w1, #0x0
00000000000d8bcc	blr	x8
00000000000d8bd0	ldr	x8, [x19]
00000000000d8bd4	ldr	x8, [x8, #0x10]
00000000000d8bd8	mov	x23, x19
00000000000d8bdc	mov	x0, x19
00000000000d8be0	blr	x8
00000000000d8be4	ldr	x8, [x19]
00000000000d8be8	ldr	x8, [x8, #0x18]
00000000000d8bec	mov	x0, x19
00000000000d8bf0	blr	x8
00000000000d8bf4	b	0xd8c74
00000000000d8bf8	mov	w0, #0x1b0
00000000000d8bfc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d8c00	mov	x19, x0
00000000000d8c04	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
00000000000d8c08	cmp	w22, #0x0
00000000000d8c0c	cset	w1, eq
00000000000d8c10	ldp	d1, d0, [x29, #-0x90]
00000000000d8c14	fcvt	s0, d0
00000000000d8c18	fcvt	s1, d1
00000000000d8c1c	ldur	d2, [x29, #-0x98]
00000000000d8c20	fcvt	s2, d2
00000000000d8c24	mov	x0, x19
00000000000d8c28	mov	w2, #0x0
00000000000d8c2c	mov	w3, #0x0
00000000000d8c30	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000000d8c34	ldur	x2, [x29, #-0xa8]
00000000000d8c38	ldr	x8, [x19]
00000000000d8c3c	ldr	x8, [x8, #0x78]
00000000000d8c40	mov	x22, #0x0
00000000000d8c44	mov	x0, x19
00000000000d8c48	mov	w1, #0x0
00000000000d8c4c	blr	x8
00000000000d8c50	ldr	x8, [x19]
00000000000d8c54	ldr	x8, [x8, #0x10]
00000000000d8c58	mov	x22, x19
00000000000d8c5c	mov	x0, x19
00000000000d8c60	blr	x8
00000000000d8c64	ldr	x8, [x19]
00000000000d8c68	ldr	x8, [x8, #0x18]
00000000000d8c6c	mov	x0, x19
00000000000d8c70	blr	x8
00000000000d8c74	ldurb	w8, [x29, #-0x99]
00000000000d8c78	cmp	w8, #0x0
00000000000d8c7c	movi.2d	v0, #0000000000000000
00000000000d8c80	fmov	s1, #1.00000000
00000000000d8c84	fcsel	s8, s1, s0, ne
00000000000d8c88	ldurb	w8, [x29, #-0x9a]
00000000000d8c8c	cmp	w8, #0x0
00000000000d8c90	fcsel	s9, s1, s0, ne
00000000000d8c94	ldurb	w8, [x29, #-0x9b]
00000000000d8c98	cmp	w8, #0x0
00000000000d8c9c	fcsel	s10, s1, s0, ne
00000000000d8ca0	ldurb	w8, [x29, #-0x9c]
00000000000d8ca4	cmp	w8, #0x0
00000000000d8ca8	fcsel	s11, s1, s0, ne
00000000000d8cac	str	xzr, [sp, #0xc8]
00000000000d8cb0	cbz	w8, 0xd8cc8
00000000000d8cb4	mov	w0, #0x1a0
00000000000d8cb8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d8cbc	mov	x22, x0
00000000000d8cc0	bl	__ZN23HgcChannelBlurNoPremultC1Ev
00000000000d8cc4	b	0xd8cd8
00000000000d8cc8	mov	w0, #0x1a0
00000000000d8ccc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d8cd0	mov	x22, x0
00000000000d8cd4	bl	__ZN14HgcChannelBlurC1Ev
00000000000d8cd8	cbz	x22, 0xd8ce0
00000000000d8cdc	str	x22, [sp, #0xc8]
00000000000d8ce0	ldr	x8, [x22]
00000000000d8ce4	ldr	x8, [x8, #0x78]
00000000000d8ce8	mov	x0, x22
00000000000d8cec	mov	w1, #0x1
00000000000d8cf0	mov	x2, x19
00000000000d8cf4	blr	x8
00000000000d8cf8	ldr	x8, [x22]
00000000000d8cfc	ldr	x8, [x8, #0x60]
00000000000d8d00	mov	x0, x22
00000000000d8d04	mov	w1, #0x0
00000000000d8d08	mov.16b	v0, v8
00000000000d8d0c	mov.16b	v1, v9
00000000000d8d10	mov.16b	v2, v10
00000000000d8d14	mov.16b	v3, v11
00000000000d8d18	blr	x8
00000000000d8d1c	ldur	x2, [x29, #-0xa8]
00000000000d8d20	ldr	x8, [x22]
00000000000d8d24	ldr	x8, [x8, #0x78]
00000000000d8d28	mov	x0, x22
00000000000d8d2c	mov	w1, #0x0
00000000000d8d30	blr	x8
00000000000d8d34	ldurb	w8, [x29, #-0x9d]
00000000000d8d38	tbnz	w8, #0x0, 0xd8d44
00000000000d8d3c	ldurb	w8, [x29, #-0x9e]
00000000000d8d40	tbz	w8, #0x0, 0xd8e18
00000000000d8d44	mov	w0, #0x1a0
00000000000d8d48	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d8d4c	mov	x23, x0
00000000000d8d50	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
00000000000d8d54	mov	x0, x21
00000000000d8d58	bl	_objc_msgSend$width
00000000000d8d5c	mov	x24, x0
00000000000d8d60	mov	x0, x21
00000000000d8d64	bl	_objc_msgSend$width
00000000000d8d68	mov	x25, x0
00000000000d8d6c	mov	x0, x21
00000000000d8d70	bl	_objc_msgSend$height
00000000000d8d74	mov	x26, x0
00000000000d8d78	mov	x0, x21
00000000000d8d7c	bl	_objc_msgSend$height
00000000000d8d80	mov	x21, x0
00000000000d8d84	ldr	x8, [x23]
00000000000d8d88	ldr	x8, [x8, #0x78]
00000000000d8d8c	mov	x0, x23
00000000000d8d90	mov	w1, #0x0
00000000000d8d94	mov	x2, x22
00000000000d8d98	blr	x8
00000000000d8d9c	add	w8, w24, w24, lsr #31
00000000000d8da0	neg	w8, w8, asr #1
00000000000d8da4	add	w9, w8, w25
00000000000d8da8	add	w10, w26, w26, lsr #31
00000000000d8dac	neg	w10, w10, asr #1
00000000000d8db0	add	w11, w10, w21
00000000000d8db4	scvtf	s0, w8
00000000000d8db8	scvtf	s1, w10
00000000000d8dbc	scvtf	s2, w9
00000000000d8dc0	scvtf	s3, w11
00000000000d8dc4	ldr	x8, [x23]
00000000000d8dc8	ldr	x8, [x8, #0x60]
00000000000d8dcc	mov	x0, x23
00000000000d8dd0	mov	w1, #0x0
00000000000d8dd4	blr	x8
00000000000d8dd8	cmp	x22, x23
00000000000d8ddc	b.eq	0xd8e08
00000000000d8de0	ldr	x8, [x22]
00000000000d8de4	ldr	x8, [x8, #0x18]
00000000000d8de8	mov	x0, x22
00000000000d8dec	blr	x8
00000000000d8df0	str	x23, [sp, #0xc8]
00000000000d8df4	ldr	x8, [x23]
00000000000d8df8	ldr	x8, [x8, #0x10]
00000000000d8dfc	mov	x22, x23
00000000000d8e00	mov	x0, x23
00000000000d8e04	blr	x8
00000000000d8e08	ldr	x8, [x23]
00000000000d8e0c	ldr	x8, [x8, #0x18]
00000000000d8e10	mov	x0, x23
00000000000d8e14	blr	x8
00000000000d8e18	add	x2, sp, #0xc8
00000000000d8e1c	mov	x0, x20
00000000000d8e20	bl	"_objc_msgSend$setHeliumRef:"
00000000000d8e24	ldr	x0, [sp, #0xc8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm6 (float)
    - parm7 (float)
    - parm2 (bool)
    - parm3 (bool)
    - parm4 (bool)
    - parm5 (bool)
    - parm8 (bool)
    - parm9 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
