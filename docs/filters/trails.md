# Trails

- **PAE class:** `Trails`
- **Plugin UUID:** `2DB30B44-28E5-4A3C-BCBA-6B8D3966F4C6`
- **Node names in corpus:** Trails (31), Trails copy (1), Trails 2 (1), Trails 1 (1)
- **Corpus usage:** 25 files, 34 instances

## What it does

Trails is a temporal echo effect: it composites several delayed, fading copies of the moving image on top of the current frame, leaving a motion-blur/ghosting streak behind anything that moves. Duration sets how far back in time the echoes reach, Echoes how many copies, and Decay whether each successive echo fades out.

> **Note.** Not implemented; description is the standard Apple Motion "Trails" temporal filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Duration | float (seconds) | 0.1 | 0.01 .. 0.9 | Time span the trailing echoes cover, ~0.01-0.9s (default 0.1). *(keyframed in 3 instances)* |
| Echoes | enum(int) | 4 | 2 .. 12 | Number of delayed copies drawn, 2-12 (default 4). *(keyframed in 3 instances)* |
| Decay | float | 1 | 1 .. 1 | Whether/how much each successive echo fades toward transparent. Continuous, not a hard boolean. |
| Trail On | bool | 0 | 0 .. 1 | Enables the trailing behavior (vs pass-through). |
| Mix | float | 1 | 0.209 .. 1 | Wet/dry blend of the trailed result over the original, 0-1 continuous. *(keyframed in 14 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSolidColor`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSolidColor` → [`HgcSolidColor.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSolidColor.metal)

```metal
//Metal1.0     
//LEN=00000000c9
[[ visible ]] FragmentOut HgcSolidColor_hgc_visible(const constant float4* hg_Params)
{
    FragmentOut output;

    output.color0 = hg_Params[0];
    return output;
}
```

### Metal fragment shader — `HgcTrailsMaxBlend`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTrailsMaxBlend` → [`HgcTrailsMaxBlend.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTrailsMaxBlend.metal)

```metal
//Metal1.0     
//LEN=00000001a3
[[ visible ]] FragmentOut HgcTrailsMaxBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = mix(c0.xxxx, r1, hg_Params[0]);
    output.color0 = fmax(r0, r1);
    return output;
}
```

### Metal fragment shader — `HgcTrailsMinBlend`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTrailsMinBlend` → [`HgcTrailsMinBlend.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTrailsMinBlend.metal)

```metal
//Metal1.0     
//LEN=00000001a3
[[ visible ]] FragmentOut HgcTrailsMinBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = mix(c0.xxxx, r1, hg_Params[0]);
    output.color0 = fmin(r0, r1);
    return output;
}
```

### CPU parameter wiring — `-[PAETrails canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAETrails`

```asm
0000000000064d50	mov	w3, #0x3
0000000000064d54	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000064d58	ldr	x4, [x23]
0000000000064d5c	sub	x2, x29, #0x88
0000000000064d60	mov	x0, x20
0000000000064d64	mov	w3, #0x4
0000000000064d68	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000064d6c	ldur	w26, [x29, #-0x88]
0000000000064d70	ldr	x24, [x23]
0000000000064d74	mov	x20, x22
0000000000064d78	adrp	x22, 804 ; 0x388000
0000000000064d7c	ldr	x22, [x22, #0x488] ; literal pool symbol address: _kCMTimeZero
0000000000064d80	ldr	q0, [x22]
0000000000064d84	stur	q0, [x29, #-0xa0]
0000000000064d88	ldr	x8, [x22, #0x10]
0000000000064d8c	stur	x8, [x29, #-0x90]
0000000000064d90	sub	x8, x29, #0xa0
0000000000064d94	stur	x8, [x29, #-0xa8]
0000000000064d98	sub	x2, x29, #0xa8
0000000000064d9c	mov	x0, x25
0000000000064da0	bl	"_objc_msgSend$frameDuration:"
0000000000064da4	str	x20, [sp, #0x10]
0000000000064da8	mov	x0, x20
0000000000064dac	bl	_objc_msgSend$imageType
0000000000064db0	mov	x20, x0
0000000000064db4	ldr	x2, [x23]
0000000000064db8	mov	x0, x21
0000000000064dbc	bl	"_objc_msgSend$getRenderMode:"
0000000000064dc0	cmp	w0, #0x0
0000000000064dc4	ccmp	x20, #0x3, #0x0, ne
0000000000064dc8	cset	w20, eq
0000000000064dcc	b.ne	0x6516c
0000000000064dd0	stur	xzr, [x29, #-0xb0]
0000000000064dd4	str	w26, [sp, #0x1c]
0000000000064dd8	cmp	w26, #0x1
0000000000064ddc	b.ne	0x64e88
0000000000064de0	mov	x0, x19
0000000000064de4	bl	_objc_msgSend$width
0000000000064de8	mov	x26, x0
0000000000064dec	mov	x0, x19
0000000000064df0	bl	_objc_msgSend$height
0000000000064df4	mov	x27, x0
0000000000064df8	mov	w0, #0x1b0
0000000000064dfc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000064e00	mov	x25, x0
0000000000064e04	bl	__ZN13HgcSolidColorC2Ev
0000000000064e08	ucvtf	d0, x26
0000000000064e0c	ucvtf	d1, x26, #0x1
0000000000064e10	ucvtf	d2, x27
0000000000064e14	ucvtf	d3, x27, #0x1
0000000000064e18	fmov	d4, #0.50000000
0000000000064e1c	fnmul	d0, d0, d4
0000000000064e20	fcvtzs	w8, d0
0000000000064e24	fnmul	d0, d2, d4
0000000000064e28	fcvtzs	w9, d0
0000000000064e2c	orr	x8, x8, x9, lsl #32
0000000000064e30	fcvtzs	w9, d1
0000000000064e34	fcvtzs	w10, d3
0000000000064e38	orr	x9, x9, x10, lsl #32
0000000000064e3c	adrp	x10, 810 ; 0x38e000
0000000000064e40	add	x10, x10, #0x60
0000000000064e44	str	x10, [x25]
0000000000064e48	stp	x8, x9, [x25, #0x1a0]
0000000000064e4c	stur	x25, [x29, #-0xb0]
0000000000064e50	mov	w8, #0x7f7fffff
0000000000064e54	fmov	s0, w8
0000000000064e58	mov	x0, x25
0000000000064e5c	mov	w1, #0x0
0000000000064e60	mov.16b	v1, v0
0000000000064e64	mov.16b	v2, v0
0000000000064e68	mov.16b	v3, v0
0000000000064e6c	bl	__ZN13HgcSolidColor12SetParameterEiffff
0000000000064e70	b	0x64f14
0000000000064e74	cbz	x22, 0x65144
0000000000064e78	add	x8, sp, #0x20
0000000000064e7c	mov	x0, x22
0000000000064e80	bl	_objc_msgSend$heliumRef
0000000000064e84	b	0x65148
0000000000064e88	mov	x0, x19
0000000000064e8c	bl	_objc_msgSend$width
0000000000064e90	mov	x26, x0
0000000000064e94	mov	x0, x19
0000000000064e98	bl	_objc_msgSend$height
0000000000064e9c	mov	x27, x0
0000000000064ea0	mov	w0, #0x1b0
0000000000064ea4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000064ea8	mov	x25, x0
0000000000064eac	bl	__ZN13HgcSolidColorC2Ev
0000000000064eb0	ucvtf	d0, x26
0000000000064eb4	ucvtf	d1, x26, #0x1
0000000000064eb8	ucvtf	d2, x27
0000000000064ebc	ucvtf	d3, x27, #0x1
0000000000064ec0	fmov	d4, #0.50000000
0000000000064ec4	fnmul	d0, d0, d4
0000000000064ec8	fcvtzs	w8, d0
0000000000064ecc	fnmul	d0, d2, d4
0000000000064ed0	fcvtzs	w9, d0
0000000000064ed4	orr	x8, x8, x9, lsl #32
0000000000064ed8	fcvtzs	w9, d1
0000000000064edc	fcvtzs	w10, d3
0000000000064ee0	orr	x9, x9, x10, lsl #32
0000000000064ee4	adrp	x10, 810 ; 0x38e000
0000000000064ee8	add	x10, x10, #0x60
0000000000064eec	str	x10, [x25]
0000000000064ef0	stp	x8, x9, [x25, #0x1a0]
0000000000064ef4	stur	x25, [x29, #-0xb0]
0000000000064ef8	movi.2d	v0, #0000000000000000
0000000000064efc	movi.2d	v1, #0000000000000000
0000000000064f00	movi.2d	v2, #0000000000000000
0000000000064f04	movi.2d	v3, #0000000000000000
0000000000064f08	mov	x0, x25
0000000000064f0c	mov	w1, #0x0
0000000000064f10	bl	__ZN13HgcSolidColor12SetParameterEiffff
0000000000064f14	str	w20, [sp, #0x4]
0000000000064f18	str	x19, [sp, #0x8]
0000000000064f1c	ldur	x8, [x29, #-0x80]
0000000000064f20	cbz	x8, 0x65108
0000000000064f24	mov	x20, #0x0
0000000000064f28	add	x19, sp, #0xc0
0000000000064f2c	fmov	d8, #1.00000000
0000000000064f30	ldr	q0, [x22]
0000000000064f34	str	q0, [sp, #0xc0]
0000000000064f38	ldr	x8, [x22, #0x10]
0000000000064f3c	str	x8, [sp, #0xd0]
0000000000064f40	str	x19, [sp, #0xb8]
0000000000064f44	ldr	x0, [x21, x28]
0000000000064f48	ucvtf	d9, w20
0000000000064f4c	ldur	w8, [x29, #-0x6c]
0000000000064f50	scvtf	d0, w8
0000000000064f54	ldur	d1, [x29, #-0x78]
0000000000064f58	fdiv	d0, d0, d1
0000000000064f5c	fmul	d0, d0, d9
0000000000064f60	add	x2, sp, #0xb8
0000000000064f64	mov	x1, x24
0000000000064f68	bl	0x250e08 ; symbol stub for: __Z22subtractFramesFromTimePU26objcproto15PROAPIAccessing11objc_objectd6FxTimePS1_
0000000000064f6c	str	xzr, [sp, #0xb0]
0000000000064f70	ldp	q0, q1, [x23]
0000000000064f74	stp	q0, q1, [sp, #0x20]
0000000000064f78	ldr	q0, [x23, #0x20]
0000000000064f7c	str	q0, [sp, #0x40]
0000000000064f80	ldr	x5, [sp, #0xb8]
0000000000064f84	add	x2, sp, #0xb0
0000000000064f88	add	x4, sp, #0x20
0000000000064f8c	mov	x0, x21
0000000000064f90	mov	w3, #0x0
0000000000064f94	bl	"_objc_msgSend$getHeliumImage:source:withInfo:atTime:"
0000000000064f98	ldr	x0, [sp, #0xb0]
0000000000064f9c	cbz	x0, 0x650f8
0000000000064fa0	add	x8, sp, #0x20
0000000000064fa4	bl	_objc_msgSend$heliumRef
0000000000064fa8	ldr	x26, [sp, #0x20]
0000000000064fac	ldr	w8, [sp, #0x1c]
0000000000064fb0	cmp	w8, #0x1
0000000000064fb4	b.ne	0x64fcc
0000000000064fb8	mov	w0, #0x1a0
0000000000064fbc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000064fc0	mov	x27, x0
0000000000064fc4	bl	__ZN17HgcTrailsMinBlendC1Ev
0000000000064fc8	b	0x64fdc
0000000000064fcc	mov	w0, #0x1a0
0000000000064fd0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000064fd4	mov	x27, x0
0000000000064fd8	bl	__ZN17HgcTrailsMaxBlendC1Ev
0000000000064fdc	ldr	x8, [x27]
0000000000064fe0	ldr	x8, [x8, #0x78]
0000000000064fe4	mov	x0, x27
0000000000064fe8	mov	w1, #0x0
0000000000064fec	mov	x2, x25
0000000000064ff0	blr	x8
0000000000064ff4	ldr	x8, [x27]
0000000000064ff8	ldr	x8, [x8, #0x78]
0000000000064ffc	mov	x0, x27
0000000000065000	mov	w1, #0x1
0000000000065004	mov	x2, x26
0000000000065008	blr	x8
000000000006500c	ldr	x0, [sp, #0xb0]
0000000000065010	bl	0x252344 ; symbol stub for: _objc_release
0000000000065014	ldurb	w8, [x29, #-0x81]
0000000000065018	fmov	s0, #1.00000000
000000000006501c	cmp	w8, #0x1
0000000000065020	b.ne	0x65034
0000000000065024	ldur	d0, [x29, #-0x78]
0000000000065028	fdiv	d0, d9, d0
000000000006502c	fsub	d0, d8, d0
0000000000065030	fcvt	s0, d0
0000000000065034	ldr	x8, [x27]
0000000000065038	ldr	x8, [x8, #0x60]
000000000006503c	movi.2d	v1, #0000000000000000
0000000000065040	movi.2d	v2, #0000000000000000
0000000000065044	movi.2d	v3, #0000000000000000
0000000000065048	mov	x0, x27
000000000006504c	mov	w1, #0x0
0000000000065050	blr	x8
0000000000065054	ldur	x25, [x29, #-0xb0]
0000000000065058	cmp	x25, x27
000000000006505c	b.eq	0x6508c
0000000000065060	cbz	x25, 0x65074
0000000000065064	ldr	x8, [x25]
0000000000065068	ldr	x8, [x8, #0x18]
000000000006506c	mov	x0, x25
0000000000065070	blr	x8
0000000000065074	stur	x27, [x29, #-0xb0]
0000000000065078	ldr	x8, [x27]
000000000006507c	ldr	x8, [x8, #0x10]
0000000000065080	mov	x0, x27
0000000000065084	blr	x8
0000000000065088	mov	x25, x27
000000000006508c	cbz	x20, 0x650ac
0000000000065090	mov	w8, w20
0000000000065094	mov	x9, #0x5555555555555555
0000000000065098	movk	x9, #0x5556
000000000006509c	umulh	x8, x8, x9
00000000000650a0	add	x8, x8, x8, lsl #1
00000000000650a4	cmp	w8, w20
00000000000650a8	b.eq	0x650bc
00000000000650ac	ldur	x8, [x29, #-0x80]
00000000000650b0	sub	x8, x8, #0x1
00000000000650b4	cmp	x20, x8
00000000000650b8	b.ne	0x650d4
00000000000650bc	ldr	x8, [x25]
00000000000650c0	ldr	x8, [x8, #0x88]
00000000000650c4	mov	x0, x25
00000000000650c8	mov	w1, #-0x1
00000000000650cc	mov	w2, #0x2
00000000000650d0	blr	x8
00000000000650d4	ldr	x8, [x27]
00000000000650d8	ldr	x8, [x8, #0x18]
00000000000650dc	mov	x0, x27
00000000000650e0	blr	x8
00000000000650e4	cbz	x26, 0x650f8
00000000000650e8	ldr	x8, [x26]
00000000000650ec	ldr	x8, [x8, #0x18]
00000000000650f0	mov	x0, x26
00000000000650f4	blr	x8
00000000000650f8	add	x20, x20, #0x1
00000000000650fc	ldur	x8, [x29, #-0x80]
0000000000065100	cmp	x8, x20
0000000000065104	b.hi	0x64f30
0000000000065108	ldr	x19, [sp, #0x8]
000000000006510c	mov	x0, x19
0000000000065110	bl	_objc_msgSend$fieldOrder
0000000000065114	ldr	w20, [sp, #0x4]
0000000000065118	ldr	x8, [sp, #0x10]
000000000006511c	cbz	x0, 0x65194
0000000000065120	sub	x2, x29, #0xb0
0000000000065124	mov	x0, x19
0000000000065128	bl	"_objc_msgSend$setHeliumRef:"
000000000006512c	ldur	x0, [x29, #-0xb0]
0000000000065130	cbz	x0, 0x6516c
0000000000065134	ldr	x8, [x0]
0000000000065138	ldr	x8, [x8, #0x18]
000000000006513c	blr	x8
0000000000065140	b	0x6516c
0000000000065144	str	xzr, [sp, #0x20]
0000000000065148	add	x2, sp, #0x20
000000000006514c	mov	x0, x19
0000000000065150	bl	"_objc_msgSend$setHeliumRef:"
0000000000065154	ldr	x0, [sp, #0x20]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm3 (bool)
    - parm4 (int)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
```
