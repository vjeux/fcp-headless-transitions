# WideTime

- **PAE class:** `WideTime`
- **Plugin UUID:** `5C96D4F9-16FC-4D7F-A4DE-F73D5D0E83BA`
- **Node names in corpus:** WideTime (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

WideTime is a temporal smear/trail filter that stretches the image across a span of time (a wide time window), blending recent frames with a Decay falloff for a long motion-blur streak. Duration sets the time window, Decay the fade, and Amount the strength.

> **Note.** Not implemented; description is the standard Apple Motion "WideTime" temporal filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Duration | float (seconds) | 0.1 | 0.001 .. 0.001 | Time window blended together, ~0.001-0.1s (default 0.1). |
| Decay | float | 0.8 | 0 .. 0 | Falloff of older frames, ~0.8 (default 0.8). Continuous float, NOT a boolean. |
| Amount | float | 0.8 | 1 .. 1 | Strength of the smear, ~0.8 (default 0.8). Continuous float, NOT a boolean. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcEchoBlend`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEchoBlend` → [`HgcEchoBlend.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEchoBlend.metal)

```metal
//Metal1.0     
//LEN=0000000130
[[ visible ]] FragmentOut HgcEchoBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    output.color0 = mix(r1, r0, hg_Params[0]);
    return output;
}
```

### Metal fragment shader — `HgcEchoScaleAndAdd`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEchoScaleAndAdd` → [`HgcEchoScaleAndAdd.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEchoScaleAndAdd.metal)

```metal
//Metal1.0     
//LEN=0000000216
[[ visible ]] FragmentOut HgcEchoScaleAndAdd_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    r1 = r1*hg_Params[0] + r0;
    r1.xyz = fmin(r1.xyz, hg_Params[1].xxx);
    r1.xyz = fmin(r1.xyz, hg_Params[1].xxx);
    r1.w = fmin(r1.w, c0.w);
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEWideTime canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEWideTime`

```asm
0000000000073a64	mov	x19, x0
0000000000073a68	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
0000000000073a6c	stp	x21, x20, [sp, #0x10]
0000000000073a70	ldr	w8, [sp, #0xe0]
0000000000073a74	cmp	w8, #0x1
0000000000073a78	b.lt	0x73bdc
0000000000073a7c	mov	x28, #0x0
0000000000073a80	adrp	x20, 789 ; 0x388000
0000000000073a84	ldr	x20, [x20, #0x488] ; literal pool symbol address: _kCMTimeZero
0000000000073a88	add	x21, sp, #0x100
0000000000073a8c	ldr	q0, [x20]
0000000000073a90	str	q0, [sp, #0xc0]
0000000000073a94	ldr	x8, [x20, #0x10]
0000000000073a98	str	x8, [sp, #0xd0]
0000000000073a9c	add	x8, sp, #0xc0
0000000000073aa0	str	x8, [sp, #0xb8]
0000000000073aa4	ldr	x0, [x22, x27]
0000000000073aa8	ucvtf	d0, w28
0000000000073aac	add	x2, sp, #0xb8
0000000000073ab0	mov	x1, x24
0000000000073ab4	bl	0x250e08 ; symbol stub for: __Z22subtractFramesFromTimePU26objcproto15PROAPIAccessing11objc_objectd6FxTimePS1_
0000000000073ab8	ldr	s8, [x21, x28, lsl #2]
0000000000073abc	fcmp	s8, #0.0
0000000000073ac0	b.le	0x73bcc
0000000000073ac4	ldr	x2, [sp, #0xb8]
0000000000073ac8	ldp	q0, q1, [x23]
0000000000073acc	stp	q0, q1, [sp, #0x20]
0000000000073ad0	ldr	q0, [x23, #0x20]
0000000000073ad4	str	q0, [sp, #0x40]
0000000000073ad8	add	x8, sp, #0xb0
0000000000073adc	add	x3, sp, #0x20
0000000000073ae0	mov	x0, x22
0000000000073ae4	bl	"_objc_msgSend$cachedItemAtTime:withInfo:"
0000000000073ae8	ldr	x25, [sp, #0xb0]
0000000000073aec	cbz	x25, 0x73bcc
0000000000073af0	mov	w0, #0x1a0
0000000000073af4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000073af8	mov	x26, x0
0000000000073afc	bl	__ZN18HgcEchoScaleAndAddC1Ev
0000000000073b00	ldr	x8, [x26]
0000000000073b04	ldr	x8, [x8, #0x60]
0000000000073b08	mov	x0, x26
0000000000073b0c	mov	w1, #0x0
0000000000073b10	mov.16b	v0, v8
0000000000073b14	mov.16b	v1, v8
0000000000073b18	mov.16b	v2, v8
0000000000073b1c	mov.16b	v3, v8
0000000000073b20	blr	x8
0000000000073b24	ldr	x8, [x26]
0000000000073b28	ldr	x8, [x8, #0x60]
0000000000073b2c	mov	w9, #0x7f7fffff
0000000000073b30	fmov	s0, w9
0000000000073b34	movi.2d	v1, #0000000000000000
0000000000073b38	movi.2d	v2, #0000000000000000
0000000000073b3c	movi.2d	v3, #0000000000000000
0000000000073b40	mov	x0, x26
0000000000073b44	mov	w1, #0x1
0000000000073b48	blr	x8
0000000000073b4c	ldr	x8, [x26]
0000000000073b50	ldr	x8, [x8, #0x78]
0000000000073b54	mov	x0, x26
0000000000073b58	mov	w1, #0x0
0000000000073b5c	mov	x2, x25
0000000000073b60	blr	x8
0000000000073b64	ldr	x8, [x26]
0000000000073b68	ldr	x8, [x8, #0x78]
0000000000073b6c	mov	x0, x26
0000000000073b70	mov	w1, #0x1
0000000000073b74	mov	x2, x19
0000000000073b78	blr	x8
0000000000073b7c	cmp	x19, x26
0000000000073b80	b.eq	0x73bac
0000000000073b84	cbz	x19, 0x73b98
0000000000073b88	ldr	x8, [x19]
0000000000073b8c	ldr	x8, [x8, #0x18]
0000000000073b90	mov	x0, x19
0000000000073b94	blr	x8
0000000000073b98	ldr	x8, [x26]
0000000000073b9c	ldr	x8, [x8, #0x10]
0000000000073ba0	mov	x19, x26
0000000000073ba4	mov	x0, x26
0000000000073ba8	blr	x8
0000000000073bac	ldr	x8, [x26]
0000000000073bb0	ldr	x8, [x8, #0x18]
0000000000073bb4	mov	x0, x26
0000000000073bb8	blr	x8
0000000000073bbc	ldr	x8, [x25]
0000000000073bc0	ldr	x8, [x8, #0x18]
0000000000073bc4	mov	x0, x25
0000000000073bc8	blr	x8
0000000000073bcc	add	x28, x28, #0x1
0000000000073bd0	ldrsw	x8, [sp, #0xe0]
0000000000073bd4	cmp	x28, x8
0000000000073bd8	b.lt	0x73a8c
0000000000073bdc	mov	w0, #0x1a0
0000000000073be0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000073be4	mov	x23, x0
0000000000073be8	bl	__ZN12HgcEchoBlendC1Ev
0000000000073bec	ldp	x21, x20, [sp, #0x10]
0000000000073bf0	ldr	d0, [sp, #0xf8]
0000000000073bf4	fcvt	s0, d0
0000000000073bf8	ldr	x8, [x23]
0000000000073bfc	ldr	x8, [x8, #0x60]
0000000000073c00	mov	x0, x23
0000000000073c04	mov	w1, #0x0
0000000000073c08	mov.16b	v1, v0
0000000000073c0c	mov.16b	v2, v0
0000000000073c10	mov.16b	v3, v0
0000000000073c14	blr	x8
0000000000073c18	adrp	x0, 853 ; 0x3c8000
0000000000073c1c	add	x0, x0, #0xbe8 ; Objc cfstring ref: @"bad cfstring ref"
0000000000073c20	bl	0x250ba4 ; symbol stub for: _NSClassFromString
0000000000073c24	bl	0x252284 ; symbol stub for: _objc_alloc
0000000000073c28	ldr	x2, [x22, x27]
0000000000073c2c	bl	"_objc_msgSend$initWithAPIManager:"
0000000000073c30	bl	0x25229c ; symbol stub for: _objc_autorelease
0000000000073c34	mov	x24, x0
0000000000073c38	bl	_objc_msgSend$upscalesFields
0000000000073c3c	mov	x22, x0
0000000000073c40	mov	x0, x24
0000000000073c44	bl	_objc_msgSend$hostIsFCP
0000000000073c48	mov	x24, x0
0000000000073c4c	mov	x0, x20
0000000000073c50	bl	_objc_msgSend$fieldOrder
0000000000073c54	cbnz	x0, 0x73d1c
0000000000073c58	mov	x0, x21
0000000000073c5c	bl	_objc_msgSend$fieldOrder
0000000000073c60	cmp	x0, #0x0
0000000000073c64	cset	w8, ne
0000000000073c68	eor	w9, w22, #0x1
0000000000073c6c	and	w8, w8, w24
0000000000073c70	and	w8, w8, w9
0000000000073c74	cmp	w8, #0x1
0000000000073c78	b.ne	0x73d1c
0000000000073c7c	add	x0, sp, #0x20
0000000000073c80	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000073c84	add	x0, sp, #0x20
0000000000073c88	fmov	d0, #1.00000000
0000000000073c8c	fmov	d1, #2.00000000
0000000000073c90	fmov	d2, #1.00000000
0000000000073c94	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000073c98	mov	w0, #0x210
0000000000073c9c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000073ca0	mov	x22, x0
0000000000073ca4	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000073ca8	ldr	x8, [x22]
0000000000073cac	ldr	x8, [x8, #0x230]
0000000000073cb0	add	x1, sp, #0x20
0000000000073cb4	mov	x0, x22
0000000000073cb8	blr	x8
0000000000073cbc	ldr	x8, [x22]
0000000000073cc0	ldr	x8, [x8, #0x78]
0000000000073cc4	mov	x0, x22
0000000000073cc8	mov	w1, #0x0
0000000000073ccc	mov	x2, x19
0000000000073cd0	blr	x8
0000000000073cd4	cmp	x19, x22
0000000000073cd8	b.eq	0x73d04
0000000000073cdc	cbz	x19, 0x73cf0
0000000000073ce0	ldr	x8, [x19]
0000000000073ce4	ldr	x8, [x8, #0x18]
0000000000073ce8	mov	x0, x19
0000000000073cec	blr	x8
0000000000073cf0	ldr	x8, [x22]
0000000000073cf4	ldr	x8, [x8, #0x10]
0000000000073cf8	mov	x19, x22
0000000000073cfc	mov	x0, x22
0000000000073d00	blr	x8
0000000000073d04	ldr	x8, [x22]
0000000000073d08	ldr	x8, [x8, #0x18]
0000000000073d0c	mov	x0, x22
0000000000073d10	blr	x8
0000000000073d14	add	x0, sp, #0x20
0000000000073d18	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000073d1c	ldr	x8, [x23]
0000000000073d20	ldr	x8, [x8, #0x78]
0000000000073d24	mov	x0, x23
0000000000073d28	mov	w1, #0x0
0000000000073d2c	mov	x2, x19
0000000000073d30	blr	x8
0000000000073d34	cbz	x21, 0x73de4
0000000000073d38	add	x8, sp, #0x20
0000000000073d3c	mov	x0, x21
0000000000073d40	bl	_objc_msgSend$heliumRef
0000000000073d44	ldr	x2, [sp, #0x20]
0000000000073d48	b	0x73dec
0000000000073d4c	str	xzr, [sp, #0x100]
0000000000073d50	add	x2, sp, #0x100
0000000000073d54	mov	x0, x20
0000000000073d58	bl	"_objc_msgSend$setHeliumRef:"
0000000000073d5c	ldr	x0, [sp, #0x100]
0000000000073d60	cbz	x0, 0x73d70
0000000000073d64	ldr	x8, [x0]
0000000000073d68	ldr	x8, [x8, #0x18]
0000000000073d6c	blr	x8
0000000000073d70	mov	w0, #0x1
0000000000073d74	b	0x73da4
0000000000073d78	adrp	x8, 790 ; 0x389000
0000000000073d7c	ldr	x8, [x8, #0x848] ; literal pool symbol address: ___stderrp
0000000000073d80	ldr	x0, [x8]
0000000000073d84	mov	w8, #0x16d
0000000000073d88	adrp	x9, 541 ; 0x290000
0000000000073d8c	add	x9, x9, #0x81c ; literal pool for: "/Library/Caches/com.apple.xbs/Sources/Filters/Filters-45000.0.17/Filters/PAEWideTime.mm"
0000000000073d90	stp	x9, x8, [sp]
0000000000073d94	adrp	x1, 539 ; 0x28e000
0000000000073d98	add	x1, x1, #0x167 ; literal pool for: "%s:%d - Couldn't find temporal API\n"
0000000000073d9c	bl	0x2521c4 ; symbol stub for: _fprintf
0000000000073da0	mov	w0, #0x0
0000000000073da4	ldur	x8, [x29, #-0x70]
0000000000073da8	adrp	x9, 790 ; 0x389000
0000000000073dac	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
0000000000073db0	ldr	x9, [x9]
0000000000073db4	cmp	x9, x8
0000000000073db8	b.ne	0x73e70
0000000000073dbc	add	sp, sp, #0x1, lsl #12
0000000000073dc0	add	sp, sp, #0x110
0000000000073dc4	ldp	x29, x30, [sp, #0x60]
0000000000073dc8	ldp	x20, x19, [sp, #0x50]
0000000000073dcc	ldp	x22, x21, [sp, #0x40]
0000000000073dd0	ldp	x24, x23, [sp, #0x30]
0000000000073dd4	ldp	x26, x25, [sp, #0x20]
0000000000073dd8	ldp	x28, x27, [sp, #0x10]
0000000000073ddc	ldp	d9, d8, [sp], #0x70
0000000000073de0	ret
0000000000073de4	mov	x2, #0x0
0000000000073de8	str	xzr, [sp, #0x20]
0000000000073dec	ldr	x8, [x23]
0000000000073df0	ldr	x8, [x8, #0x78]
0000000000073df4	mov	x0, x23
0000000000073df8	mov	w1, #0x1
0000000000073dfc	blr	x8
0000000000073e00	ldr	x0, [sp, #0x20]
0000000000073e04	cbz	x0, 0x73e14
0000000000073e08	ldr	x8, [x0]
0000000000073e0c	ldr	x8, [x8, #0x18]
0000000000073e10	blr	x8
0000000000073e14	str	x23, [sp, #0x20]
0000000000073e18	ldr	x8, [x23]
0000000000073e1c	ldr	x8, [x8, #0x10]
0000000000073e20	mov	x0, x23
0000000000073e24	blr	x8
0000000000073e28	add	x2, sp, #0x20
0000000000073e2c	mov	x0, x20
0000000000073e30	bl	"_objc_msgSend$setHeliumRef:"
0000000000073e34	ldr	x0, [sp, #0x20]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
