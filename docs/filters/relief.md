# Relief

- **PAE class:** `Relief`
- **Plugin UUID:** `267EDBAB-297C-4BF4-B741-A166B5997C9B`
- **Node names in corpus:** Relief (6), Relief 1 (5), Relief 1 copy 1 (4), Relief 1 copy 2 (1), Sweep (1), Relief 3 (1)
- **Corpus usage:** 11 files, 19 instances

## What it does

Relief is a directional emboss that carves the image into a raised/recessed surface lit from a direction defined by two OSC points (Front and Back). Fuzziness softens the relief and the Height Map/Map Channel select the surface source; the result is a chiselled, stone-carving look.

> **Note.** Not implemented; description is the standard Apple Motion "Relief" emboss filter. Front/Back Size and Height Map are internal wiring.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Front | point2D | - | - | One end of the relief lighting direction (OSC point). *(keyframed in 11 instances)* |
| Back | point2D | - | - | Other end of the relief lighting direction (OSC point). *(keyframed in 16 instances)* |
| Fuzziness | float | 0.1 | 0 .. 1 | Softness of the embossed relief, 0-1 (default 0.1). |
| Map Channel | enum(int) | 0 | 0 .. 3 | Which channel drives the height/relief (0-3). |
| Mix | float | 1 | 0.35 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 2 instances)* |
| Front Size | bool | 1 | 1 .. 1 | *(unverified)* *(keyframed in 11 instances)* |
| Back Size | bool | 1 | 1 .. 1 | *(unverified)* *(keyframed in 11 instances)* |
| Height Map | float | 0 | 0 .. 3148706917 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

### CPU render method — `-[PAERelief canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAERelief`

```asm
0000000000009a84	mov	w4, #0x1
0000000000009a88	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000009a8c	ldr	d0, [sp, #0x208]
0000000000009a90	fmul	d0, d0, d8
0000000000009a94	str	d0, [sp, #0x208]
0000000000009a98	ldr	d0, [sp, #0x200]
0000000000009a9c	fmul	d0, d0, d9
0000000000009aa0	str	d0, [sp, #0x200]
0000000000009aa4	ldr	x4, [x23]
0000000000009aa8	add	x2, sp, #0x1f8
0000000000009aac	mov	x0, x24
0000000000009ab0	mov	w3, #0x2
0000000000009ab4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000009ab8	ldr	x5, [x23]
0000000000009abc	add	x2, sp, #0x1f0
0000000000009ac0	add	x3, sp, #0x1e8
0000000000009ac4	mov	x0, x24
0000000000009ac8	mov	w4, #0x3
0000000000009acc	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000009ad0	ldp	d0, d1, [sp, #0x1e8]
0000000000009ad4	fmul	d2, d1, d8
0000000000009ad8	fmul	d1, d0, d9
0000000000009adc	stp	d1, d2, [sp, #0x1e8]
0000000000009ae0	ldr	d4, [sp, #0x208]
0000000000009ae4	fsub	d5, d4, d2
0000000000009ae8	ldp	d3, d0, [x23, #0x18]
0000000000009aec	fdiv	d6, d5, d3
0000000000009af0	ldr	d5, [sp, #0x200]
0000000000009af4	fsub	d7, d5, d1
0000000000009af8	fdiv	d7, d7, d0
0000000000009afc	fmul	d16, d6, d6
0000000000009b00	fmul	d17, d7, d7
0000000000009b04	fadd	d16, d16, d17
0000000000009b08	fsqrt	d17, d16
0000000000009b0c	adrp	x8, 607 ; 0x268000
0000000000009b10	ldr	d16, [x8, #0xe40]
0000000000009b14	fcmp	d17, d16
0000000000009b18	b.le	0x9b8c
0000000000009b1c	fdiv	d6, d6, d17
0000000000009b20	fdiv	d17, d7, d17
0000000000009b24	adrp	x8, 1109 ; 0x45e000
0000000000009b28	ldrsw	x8, [x8, #0x908]
0000000000009b2c	ldr	w8, [x22, x8]
0000000000009b30	fmul	d7, d6, d16
0000000000009b34	fmul	d6, d17, d16
0000000000009b38	cmp	w8, #0x1
0000000000009b3c	b.ne	0x9b68
0000000000009b40	fdiv	d2, d2, d3
0000000000009b44	fadd	d2, d2, d7
0000000000009b48	fmul	d2, d3, d2
0000000000009b4c	str	d2, [sp, #0x208]
0000000000009b50	fdiv	d1, d1, d0
0000000000009b54	fadd	d1, d1, d6
0000000000009b58	add	x8, sp, #0x200
0000000000009b5c	b	0x9b84
0000000000009b60	mov	w21, #0x0
0000000000009b64	b	0xa1a8
0000000000009b68	fdiv	d1, d4, d3
0000000000009b6c	fsub	d1, d1, d7
0000000000009b70	fmul	d1, d3, d1
0000000000009b74	str	d1, [sp, #0x1f0]
0000000000009b78	fdiv	d1, d5, d0
0000000000009b7c	fsub	d1, d1, d6
0000000000009b80	add	x8, sp, #0x1e8
0000000000009b84	fmul	d0, d0, d1
0000000000009b88	str	d0, [x8]
0000000000009b8c	ldr	x4, [x23]
0000000000009b90	add	x2, sp, #0x1e0
0000000000009b94	mov	x0, x24
0000000000009b98	mov	w3, #0x4
0000000000009b9c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000009ba0	ldr	x4, [x23]
0000000000009ba4	add	x2, sp, #0x1d8
0000000000009ba8	mov	x0, x24
0000000000009bac	mov	w3, #0x5
0000000000009bb0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000009bb4	ldr	x4, [x23]
0000000000009bb8	add	x2, sp, #0x1d4
0000000000009bbc	mov	x0, x24
0000000000009bc0	mov	w3, #0x7
0000000000009bc4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000009bc8	ldr	w8, [sp, #0x1d4]
0000000000009bcc	movi.2d	v11, #0000000000000000
0000000000009bd0	movi.2d	v12, #0000000000000000
0000000000009bd4	movi.2d	v13, #0000000000000000
0000000000009bd8	movi.2d	v14, #0000000000000000
0000000000009bdc	cmp	w8, #0x4
0000000000009be0	b.hi	0x9c14
0000000000009be4	adrp	x9, 607 ; 0x268000
0000000000009be8	add	x9, x9, #0xe60
0000000000009bec	ldr	d11, [x9, x8, lsl #3]
0000000000009bf0	adrp	x9, 607 ; 0x268000
0000000000009bf4	add	x9, x9, #0xe88
0000000000009bf8	ldr	d12, [x9, x8, lsl #3]
0000000000009bfc	adrp	x9, 607 ; 0x268000
0000000000009c00	add	x9, x9, #0xeb0
0000000000009c04	ldr	d13, [x9, x8, lsl #3]
0000000000009c08	adrp	x9, 607 ; 0x268000
0000000000009c0c	add	x9, x9, #0xed8
0000000000009c10	ldr	d14, [x9, x8, lsl #3]
0000000000009c14	cmp	w25, #0x0
0000000000009c18	ccmp	x21, #0x3, #0x0, ne
0000000000009c1c	cset	w21, eq
0000000000009c20	b.ne	0xa1a8
0000000000009c24	cbz	x20, 0x9c38
0000000000009c28	add	x8, sp, #0x1c8
0000000000009c2c	mov	x0, x20
0000000000009c30	bl	_objc_msgSend$heliumRef
0000000000009c34	b	0x9c3c
0000000000009c38	str	xzr, [sp, #0x1c8]
0000000000009c3c	mov	x0, x20
0000000000009c40	bl	_objc_msgSend$bounds
0000000000009c44	stp	q2, q1, [sp, #0x90]
0000000000009c48	stp	q0, q3, [sp, #0x70]
0000000000009c4c	add	x8, sp, #0x310
0000000000009c50	ldr	d10, [sp, #0x370]
0000000000009c54	ldr	d9, [sp, #0x378]
0000000000009c58	ldr	d8, [sp, #0x388]
0000000000009c5c	add	x9, sp, #0x310
0000000000009c60	add	x10, x9, #0x28
0000000000009c64	add	x9, x9, #0x38
0000000000009c68	ldr	q0, [x8]
0000000000009c6c	str	q0, [sp, #0x40]
0000000000009c70	dup.2d	v0, v0[0]
0000000000009c74	ldur	q1, [x8, #0x18]
0000000000009c78	ld1.d	{ v0 }[0], [x10]
0000000000009c7c	str	q0, [sp, #0x50]
0000000000009c80	str	q1, [sp, #0x30]
0000000000009c84	mov.16b	v0, v1
0000000000009c88	ld1.d	{ v0 }[1], [x9]
0000000000009c8c	str	q0, [sp, #0x60]
0000000000009c90	mov	x0, x19
0000000000009c94	bl	_objc_msgSend$bounds
0000000000009c98	add	x24, sp, #0x138
0000000000009c9c	ldr	d0, [x23]
0000000000009ca0	ldr	x8, [x23, #0x10]
0000000000009ca4	ldr	x9, [x23, #0x28]
0000000000009ca8	str	xzr, [sp, #0x1c0]
0000000000009cac	str	d0, [sp, #0x138]
0000000000009cb0	mov	w10, #0x2
0000000000009cb4	stp	x10, x8, [sp, #0x140]
0000000000009cb8	fmov.2d	v1, #1.00000000
0000000000009cbc	stur	q1, [x24, #0x18]
0000000000009cc0	str	x9, [sp, #0x160]
0000000000009cc4	fmov	x7, d0
0000000000009cc8	add	x2, sp, #0x1c0
0000000000009ccc	add	x5, sp, #0x138
0000000000009cd0	mov	x0, x22
0000000000009cd4	mov	x3, #0x0
0000000000009cd8	mov	x4, #0x0
0000000000009cdc	mov	w6, #0x6
0000000000009ce0	bl	"_objc_msgSend$getHeliumImage:layerOffsetX:layerOffsetY:requestInfo:fromParm:atTime:"
0000000000009ce4	ldp	q4, q2, [sp, #0x60]
0000000000009ce8	fmul	d0, d2, d10
0000000000009cec	ldr	q5, [sp, #0xa0]
0000000000009cf0	fmul	d1, d5, d9
0000000000009cf4	fadd	d0, d0, d1
0000000000009cf8	fadd	d0, d8, d0
0000000000009cfc	mov.d	v5[1], v2[0]
0000000000009d00	ldp	q2, q1, [sp, #0x30]
0000000000009d04	zip2.2d	v1, v1, v2
0000000000009d08	fmul.2d	v2, v5, v1
0000000000009d0c	ldr	q6, [sp, #0x50]
0000000000009d10	fmul.2d	v3, v5, v6
0000000000009d14	ext.16b	v3, v3, v3, #0x8
0000000000009d18	fadd.2d	v2, v2, v3
0000000000009d1c	fadd.2d	v2, v4, v2
0000000000009d20	dup.2d	v0, v0[0]
0000000000009d24	fdiv.2d	v0, v2, v0
0000000000009d28	str	q0, [sp, #0xa0]
0000000000009d2c	ldp	q2, q0, [sp, #0x80]
0000000000009d30	mov.d	v2[1], v0[0]
0000000000009d34	fadd.2d	v0, v5, v2
0000000000009d38	fmul.d	d2, d10, v0[1]
0000000000009d3c	fmul	d3, d9, d0
0000000000009d40	fadd	d2, d2, d3
0000000000009d44	fadd	d2, d8, d2
0000000000009d48	fmul.2d	v1, v0, v1
0000000000009d4c	fmul.2d	v0, v0, v6
0000000000009d50	ext.16b	v0, v0, v0, #0x8
0000000000009d54	fadd.2d	v0, v1, v0
0000000000009d58	dup.2d	v1, v2[0]
0000000000009d5c	ldr	x2, [sp, #0x1c0]
0000000000009d60	mov	x8, #0x3ff0000000000000
0000000000009d64	stp	x8, x2, [sp, #0x1b0]
0000000000009d68	str	x8, [sp, #0x188]
0000000000009d6c	str	x8, [sp, #0x160]
0000000000009d70	str	x8, [sp, #0x138]
0000000000009d74	movi.2d	v2, #0000000000000000
0000000000009d78	stur	q2, [x24, #0x8]
0000000000009d7c	stur	q2, [x24, #0x18]
0000000000009d80	fadd.2d	v0, v4, v0
0000000000009d84	add	x8, sp, #0x69
0000000000009d88	stur	q2, [x8, #0xff]
0000000000009d8c	add	x8, sp, #0x79
0000000000009d90	stur	q2, [x8, #0xff]
0000000000009d94	fdiv.2d	v0, v0, v1
0000000000009d98	str	q0, [sp, #0x90]
0000000000009d9c	stur	q2, [x24, #0x58]
0000000000009da0	stur	q2, [x24, #0x68]
0000000000009da4	cbz	x2, 0x9e38
0000000000009da8	add	x23, sp, #0xb8
0000000000009dac	add	x8, sp, #0xb8
0000000000009db0	mov	x0, x22
0000000000009db4	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000009db8	mov	x8, #0x0
0000000000009dbc	add	x9, sp, #0x138
0000000000009dc0	add	x10, x9, x8
0000000000009dc4	add	x11, x23, x8
0000000000009dc8	ldp	q0, q1, [x11]
0000000000009dcc	stp	q0, q1, [x10]
0000000000009dd0	add	x8, x8, #0x20
0000000000009dd4	cmp	x8, #0x80
0000000000009dd8	b.ne	0x9dc0
0000000000009ddc	str	d14, [sp, #0x30]
0000000000009de0	str	d13, [sp, #0x40]
0000000000009de4	str	d12, [sp, #0x50]
0000000000009de8	str	d11, [sp, #0x60]
0000000000009dec	ldr	x0, [sp, #0x1c0]
0000000000009df0	bl	_objc_msgSend$bounds
0000000000009df4	stp	d3, d2, [sp, #0x20]
0000000000009df8	mov.16b	v8, v0
0000000000009dfc	mov.16b	v9, v1
0000000000009e00	ldp	d13, d14, [sp, #0x198]
0000000000009e04	ldr	d10, [sp, #0x1b0]
0000000000009e08	ldp	d11, d12, [sp, #0x138]
0000000000009e0c	ldp	d15, d2, [sp, #0x150]
0000000000009e10	ldr	d0, [sp, #0x160]
0000000000009e14	stp	d0, d2, [sp, #0x8]
0000000000009e18	ldr	d0, [sp, #0x170]
0000000000009e1c	str	d0, [sp, #0x18]
0000000000009e20	ldr	x0, [sp, #0x1c0]
0000000000009e24	cbz	x0, 0x9e98
0000000000009e28	add	x8, sp, #0xb8
0000000000009e2c	bl	_objc_msgSend$heliumRef
0000000000009e30	ldr	x22, [sp, #0xb8]
0000000000009e34	b	0x9e9c
0000000000009e38	mov	x8, #0x0
0000000000009e3c	add	x9, sp, #0x138
0000000000009e40	add	x10, sp, #0x310
0000000000009e44	add	x11, x9, x8
0000000000009e48	add	x12, x10, x8
0000000000009e4c	ldp	q0, q1, [x12]
0000000000009e50	stp	q0, q1, [x11]
0000000000009e54	add	x8, x8, #0x20
0000000000009e58	cmp	x8, #0x80
0000000000009e5c	b.ne	0x9e44
0000000000009e60	ldr	x22, [sp, #0x1c8]
0000000000009e64	ldp	q1, q0, [sp, #0x90]
0000000000009e68	mov	d8, v1[1]
0000000000009e6c	mov	d2, v0[1]
0000000000009e70	str	d2, [sp, #0x80]
0000000000009e74	cbz	x22, 0x9e8c
0000000000009e78	ldr	x8, [x22]
0000000000009e7c	ldr	x8, [x8, #0x10]
0000000000009e80	mov	x0, x22
0000000000009e84	blr	x8
0000000000009e88	ldp	q1, q0, [sp, #0x90]
0000000000009e8c	mov.16b	v9, v1
0000000000009e90	str	d0, [sp, #0x70]
0000000000009e94	b	0x9f3c
0000000000009e98	mov	x22, #0x0
0000000000009e9c	fmul	d0, d8, d13
0000000000009ea0	fmul	d1, d9, d14
0000000000009ea4	fadd	d0, d0, d1
0000000000009ea8	fadd	d0, d10, d0
0000000000009eac	fmul	d1, d8, d11
0000000000009eb0	fmul	d2, d9, d12
0000000000009eb4	fadd	d1, d1, d2
0000000000009eb8	fadd	d1, d15, d1
0000000000009ebc	fdiv	d1, d1, d0
0000000000009ec0	str	d1, [sp, #0x70]
0000000000009ec4	ldp	d7, d6, [sp, #0x8]
0000000000009ec8	fmul	d1, d8, d6
0000000000009ecc	fmul	d2, d9, d7
0000000000009ed0	fadd	d1, d1, d2
0000000000009ed4	ldr	d5, [sp, #0x18]
0000000000009ed8	fadd	d1, d5, d1
0000000000009edc	fdiv	d0, d1, d0
0000000000009ee0	str	d0, [sp, #0x80]
0000000000009ee4	ldp	d1, d0, [sp, #0x20]
0000000000009ee8	fadd	d0, d8, d0
0000000000009eec	fadd	d1, d9, d1
0000000000009ef0	fmul	d2, d0, d13
0000000000009ef4	fmul	d3, d1, d14
0000000000009ef8	fadd	d2, d2, d3
0000000000009efc	fadd	d2, d10, d2
0000000000009f00	fmul	d3, d0, d11
0000000000009f04	fmul	d4, d1, d12
0000000000009f08	fadd	d3, d3, d4
0000000000009f0c	fadd	d3, d15, d3
0000000000009f10	fdiv	d9, d3, d2
0000000000009f14	fmul	d0, d0, d6
0000000000009f18	fmul	d1, d1, d7
0000000000009f1c	fadd	d0, d0, d1
0000000000009f20	fadd	d0, d5, d0
0000000000009f24	fdiv	d8, d0, d2
0000000000009f28	ldr	d11, [sp, #0x60]
0000000000009f2c	ldr	d12, [sp, #0x50]
0000000000009f30	ldr	d13, [sp, #0x40]
0000000000009f34	ldr	d14, [sp, #0x30]
0000000000009f38	ldp	q1, q0, [sp, #0x90]
0000000000009f3c	fcvtn	v0.2s, v0.2d
0000000000009f40	fcvtn	v1.2s, v1.2d
0000000000009f44	ldr	d2, [sp, #0x1e0]
0000000000009f48	fcvt	s2, d2
0000000000009f4c	ldp	d3, d5, [sp, #0x1f0]
0000000000009f50	ldr	d4, [sp, #0x208]
0000000000009f54	fcvt	s5, d5
0000000000009f58	add	x8, sp, #0x1e8
0000000000009f5c	ld1.d	{ v3 }[1], [x8]
0000000000009f60	fcvtn	v3.2s, v3.2d
0000000000009f64	add	x8, sp, #0x200
0000000000009f68	ld1.d	{ v4 }[1], [x8]
0000000000009f6c	fcvtn	v4.2s, v4.2d
0000000000009f70	fsub.2s	v4, v4, v3
0000000000009f74	fadd.2s	v6, v1, v0
0000000000009f78	movi.2s	v7, #0x3f, lsl #24
0000000000009f7c	fmul.2s	v6, v6, v7
0000000000009f80	movi	d7, #0000000000000000
0000000000009f84	fmul.2s	v7, v4, v7
0000000000009f88	fadd.2s	v7, v7, v3
0000000000009f8c	fsub.2s	v1, v1, v6
0000000000009f90	fmul.2s	v16, v1, v2[0]
0000000000009f94	fadd.2s	v16, v16, v7
0000000000009f98	fadd.2s	v3, v4, v3
0000000000009f9c	fmul.2s	v1, v1, v5[0]
0000000000009fa0	fadd.2s	v1, v3, v1
0000000000009fa4	fsub.2s	v1, v1, v16
0000000000009fa8	fmul.2s	v1, v1, v1
0000000000009fac	mov	s4, v1[1]
0000000000009fb0	faddp.2s	s16, v1
0000000000009fb4	fsqrt	s16, s16
0000000000009fb8	fsub.2s	v0, v0, v6
0000000000009fbc	fmul.2s	v2, v0, v2[0]
0000000000009fc0	fadd.2s	v2, v2, v7
0000000000009fc4	fmul.2s	v0, v0, v5[0]
0000000000009fc8	fadd.2s	v0, v3, v0
0000000000009fcc	fsub.2s	v0, v0, v2
0000000000009fd0	fmul.2s	v0, v0, v0
0000000000009fd4	fadd	s2, s0, s4
0000000000009fd8	fsqrt	s2, s2
0000000000009fdc	mov	s3, v0[1]
0000000000009fe0	fadd	s1, s1, s3
0000000000009fe4	fsqrt	s1, s1
0000000000009fe8	faddp.2s	s0, v0
0000000000009fec	fsqrt	s0, s0
0000000000009ff0	fcmp	s16, s2
0000000000009ff4	fcsel	s2, s16, s2, gt
0000000000009ff8	fcmp	s1, s2
0000000000009ffc	fcsel	s1, s1, s2, gt
000000000000a000	fcmp	s0, s1
000000000000a004	fcsel	s10, s0, s1, gt
000000000000a008	fcmp	s10, #0.0
000000000000a00c	b.eq	0xa16c
000000000000a010	mov	w0, #0x250
000000000000a014	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000000a018	mov	x23, x0
000000000000a01c	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
000000000000a020	adrp	x8, 916 ; 0x39e000
000000000000a024	add	x8, x8, #0x9a8
000000000000a028	add	x9, x8, #0x10
000000000000a02c	str	x9, [x23]
000000000000a030	str	xzr, [x23, #0x198]
000000000000a034	add	x9, x23, #0x1b8
000000000000a038	movi.2d	v0, #0000000000000000
000000000000a03c	stp	q0, q0, [x9]
000000000000a040	stp	q0, q0, [x23, #0x220]
000000000000a044	str	q0, [x23, #0x240]
000000000000a048	ldr	x2, [sp, #0x1c8]
000000000000a04c	ldr	x8, [x8, #0x88]
000000000000a050	mov	x0, x23
000000000000a054	mov	w1, #0x0
000000000000a058	blr	x8
000000000000a05c	ldr	x8, [x23]
000000000000a060	ldr	x8, [x8, #0x78]
000000000000a064	mov	x0, x23
000000000000a068	mov	w1, #0x1
000000000000a06c	mov	x2, x22
000000000000a070	blr	x8
000000000000a074	mov	x0, x20
000000000000a078	bl	_objc_msgSend$width
000000000000a07c	mov	x24, x0
000000000000a080	mov	x0, x20
000000000000a084	bl	_objc_msgSend$height
000000000000a088	mov	x25, x0
000000000000a08c	ldr	x8, [sp, #0x1c0]
000000000000a090	cmp	x8, #0x0
000000000000a094	csel	x0, x20, x8, eq
000000000000a098	bl	_objc_msgSend$width
000000000000a09c	mov	x26, x0
000000000000a0a0	ldr	x8, [sp, #0x1c0]
000000000000a0a4	cmp	x8, #0x0
000000000000a0a8	csel	x0, x20, x8, eq
000000000000a0ac	bl	_objc_msgSend$height
000000000000a0b0	str	w24, [x23, #0x240]
000000000000a0b4	str	w25, [x23, #0x244]
000000000000a0b8	str	w26, [x23, #0x248]
000000000000a0bc	str	w0, [x23, #0x24c]
000000000000a0c0	fcvt	d0, s10
000000000000a0c4	ldp	d1, d3, [sp, #0x1f8]
000000000000a0c8	ldr	d2, [sp, #0x1e0]
000000000000a0cc	stp	d0, d1, [x23, #0x1a0]
000000000000a0d0	str	d2, [x23, #0x1b0]
000000000000a0d4	add	x8, x23, #0x1b8
000000000000a0d8	ldp	q0, q1, [sp, #0x90]
000000000000a0dc	str	q1, [x8]
000000000000a0e0	add	x8, x23, #0x1c8
000000000000a0e4	str	q0, [x8]
000000000000a0e8	ldp	d1, d0, [sp, #0x1e8]
000000000000a0ec	ldr	d2, [sp, #0x208]
000000000000a0f0	stp	d0, d1, [x23, #0x1d8]
000000000000a0f4	stp	d2, d3, [x23, #0x1e8]
000000000000a0f8	ldr	d0, [sp, #0x1d8]
000000000000a0fc	stp	d0, d14, [x23, #0x1f8]
000000000000a100	str	d13, [x23, #0x208]
000000000000a104	str	d12, [x23, #0x210]
000000000000a108	str	d11, [x23, #0x218]
000000000000a10c	ldr	d0, [sp, #0x70]
000000000000a110	str	d0, [x23, #0x220]
000000000000a114	ldr	d0, [sp, #0x80]
000000000000a118	str	d0, [x23, #0x228]
000000000000a11c	str	d9, [x23, #0x230]
000000000000a120	str	d8, [x23, #0x238]
000000000000a124	str	x23, [sp, #0xb8]
000000000000a128	ldr	x8, [x23]
000000000000a12c	ldr	x8, [x8, #0x10]
000000000000a130	mov	x0, x23
000000000000a134	blr	x8
000000000000a138	add	x2, sp, #0xb8
000000000000a13c	mov	x0, x19
000000000000a140	bl	"_objc_msgSend$setHeliumRef:"
000000000000a144	ldr	x0, [sp, #0xb8]
000000000000a148	cbz	x0, 0xa158
000000000000a14c	ldr	x8, [x0]
000000000000a150	ldr	x8, [x8, #0x18]
000000000000a154	blr	x8
000000000000a158	ldr	x8, [x23]
000000000000a15c	ldr	x8, [x8, #0x18]
000000000000a160	mov	x0, x23
000000000000a164	blr	x8
000000000000a168	b	0xa178
000000000000a16c	add	x2, sp, #0x1c8
000000000000a170	mov	x0, x19
000000000000a174	bl	"_objc_msgSend$setHeliumRef:"
000000000000a178	add	x0, sp, #0x1b8
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
    parm3 : PointParameter
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm6 : ImageReference
    parm7 : PopupMenu
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm4 (float)
    - parm5 (float)
    - parm7 (int)

```
