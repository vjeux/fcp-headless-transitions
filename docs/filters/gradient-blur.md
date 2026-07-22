# Gradient Blur

- **PAE class:** `Gradient Blur`
- **Plugin UUID:** `7C7405BB-1B00-4811-A507-CB9F619CA522`
- **Node names in corpus:** Gradient Blur (217), osc 7 (6), osc 6 (6), osc 5 (6), osc 4 (6), osc 3 (6)
- **Corpus usage:** 235 files, 322 instances

## What it does

Gradient Blur varies blur strength across the frame along a line defined by two points: the image is sharp at one end of the Point 1 -> Point 2 gradient and progressively blurred toward the other, with Amount setting the maximum blur radius. It is the tool for tilt-shift / depth-of-field looks where focus falls off across the frame. FCP's HgcGradientBlur2 shader is checked in.

> **Note.** HgcGradientBlur2 shader is checked in (evidence/shaders/HgcGradientBlur2.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Point 1 | point2D | - | - | Start of the blur gradient (X,Y, normalized frame coords). Defines the sharp (or fully-blurred) end of the falloff line. *(keyframed in 2 instances)* |
| Point 2 | point2D | - | - | End of the blur gradient (X,Y). Blur ramps between Point 1 and Point 2. *(keyframed in 3 instances)* |
| Amount | float (pixels) | 10 | 0 .. 100 | Maximum blur radius reached at the blurred end of the gradient, 0-100. 0 = no blur anywhere. *(keyframed in 17 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the gradient-blurred result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** — 📄 shader available: `evidence/shaders/HgcGradientBlur2.metal` (verbatim FCP source; TS port pending).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGradientBlur2`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGradientBlur2` → [`HgcGradientBlur2.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGradientBlur2.metal)

```metal
//Metal1.0     
//LEN=0000000d41
[[ visible ]] FragmentOut HgcGradientBlur2_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2,
    float4 color3,
    float4 color4,
    float4 texCoord5)
{
    const float4 c0 = float4(7.000000000, 3.000000000, 2.000000000, 1.000000000);
    const float4 c1 = float4(4.000000000, 0.000000000, 1.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r2.w = c0.w;
    r2.xy = texCoord5.xy;
    r2.x = dot(r2.xyw, hg_Params[1].xyz);
    r2.x = r2.x*hg_Params[2].x + c0.w;
    r3.x = r2.x*c0.x;
    r4.y = floor(fabs(r3.x));
    r3.w = select(r4.y, -r4.y, r3.x < 0.00000f);
    r2.w = r3.w - c0.y;
    r4.x = r3.x - r3.w;
    r3.x = abs(hg_Params[0].x);
    r5.y = float(r2.w == c0.z);
    r6.x = float(r3.w < c1.x);
    r6.z = float(r2.x < c0.w);
    r6.y = float(c1.y < r2.x);
    r2.y = fmin(r6.y, r6.z);
    r6.y = float(-r6.x >= c1.y);
    r6.x = r2.y*hg_Params[0].x;
    r2.z = r6.x*r6.y;
    r6.x = float(c1.y >= r2.w);
    r6.y = r2.w - c0.w;
    r6.y = abs(r6.y);
    r6.x = float(-r6.x >= c1.y);
    r7.x = r2.z*r6.x;
    r7.y = float(-r6.y >= c1.y);
    r6.z = r7.x*r7.y;
    r7.y = float(-r7.y >= c1.y);
    r5.x = r7.x*r7.y;
    r7 = select(r0, r1, -r6.zzzz < 0.00000f);
    r8 = color2;
    r6.x = r5.x*r5.y;
    r7 = select(r7, r8, -r6.xxxx < 0.00000f);
    r9.y = float(-r5.y >= c1.y);
    r9.x = float(r2.w == c0.y);
    r6.y = r5.x*r9.y;
    r6.w = r9.x;
    r3.z = r6.y*r9.x;
    r5 = color3;
    r7 = select(r7, r5, -r3.zzzz < 0.00000f);
    r6.w = float(-r6.w >= c1.y);
    r3.y = r6.y*r6.w;
    r9 = select(r1, r8, -r6.zzzz < 0.00000f);
    r6 = select(r9, r5, -r6.xxxx < 0.00000f);
    r9 = color4;
    r6 = select(r6, r9, -r3.zzzz < 0.00000f);
    r6 = select(r6, c1.zyyz, -r3.yyyy < 0.00000f);
    r7 = select(r7, c1.zyyz, -r3.yyyy < 0.00000f);
    r4.z = float(r3.w == c1.z);
    r3.y = float(c1.y >= r3.w);
    r3.w = r3.w - c0.z;
    r3.w = abs(r3.w);
    r3.xzw = float3(-r3.xyw >= c1.yyy);
    r3.y = fmin(r2.y, r3.x);
    r4.y = fmin(r3.y, r3.z);
    r4.w = fmin(r4.y, r4.z);
    r4.y = r4.y*-r4.z + r4.y;
    r3.z = c1.z - r4.x;
    r6 = mix(r6, r7, r3.zzzz);
    r7 = select(r1, r8, -r4.wwww < 0.00000f);
    r1 = select(r0, r1, -r4.wwww < 0.00000f);
    r4.z = fmin(r4.y, r3.w);
    r8 = select(r1, r8, -r4.zzzz < 0.00000f);
    r7 = select(r7, r5, -r4.zzzz < 0.00000f);
    r1.x = r3.w;
    r1.y = abs(r2.w);
    r1.xy = float2(-r1.xy >= c1.yy);
    r1.z = r1.y;
    r1.x = fmin(r4.y, r1.x);
    r1.y = fmin(r1.x, r1.y);
    r1.z = float(-r1.z >= c1.y);
    r5 = select(r8, r5, -r1.yyyy < 0.00000f);
    r1.x = fmin(r1.x, r1.z);
    r7 = select(r7, r9, -r1.yyyy < 0.00000f);
    r7 = select(r7, c1.zyyz, -r1.xxxx < 0.00000f);
    r5 = select(r5, c1.zyyz, -r1.xxxx < 0.00000f);
    r5 = mix(r7, r5, r3.zzzz);
    r6 = select(r0, r6, -r2.zzzz < 0.00000f);
    r5 = select(r6, r5, -r3.yyyy < 0.00000f);
    r4.x = float(c1.y >= r2.x);
    r8.x = r4.x;
    r8.y = r2.y;
    r8.xy = float2(-r8.xy >= c1.yy);
    r8.x = fmin(r8.y, r8.x);
    r8.y = fmin(r8.y, r4.x);
    r5 = select(r5, r0, -r8.yyyy < 0.00000f);
    r8.y = r8.x*-hg_Params[0].x;
    r5 = select(r5, r9, r8.yyyy < 0.00000f);
    r8.x = fmin(r8.x, r3.x);
    output.color0 = select(r5, r0, -r8.xxxx < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEGradientBlur canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGradientBlur`

```asm
00000000001057e0	mov	w3, #0x3
00000000001057e4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000001057e8	ldur	d0, [x29, #-0xc8]
00000000001057ec	fcmp	d0, #0.0
00000000001057f0	b.ne	0x105808
00000000001057f4	cbz	x20, 0x1058f0
00000000001057f8	add	x8, sp, #0x90
00000000001057fc	mov	x0, x20
0000000000105800	bl	_objc_msgSend$heliumRef
0000000000105804	b	0x1058f4
0000000000105808	sub	x8, x29, #0xe0
000000000010580c	stp	xzr, xzr, [x29, #-0xe0]
0000000000105810	ldr	x5, [x22]
0000000000105814	sub	x2, x29, #0xe0
0000000000105818	add	x3, x8, #0x8
000000000010581c	mov	x0, x23
0000000000105820	mov	w4, #0x1
0000000000105824	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000105828	sub	x8, x29, #0xf0
000000000010582c	mov	x9, #0x3d71
0000000000105830	movk	x9, #0xd70a, lsl #16
0000000000105834	movk	x9, #0x70a3, lsl #32
0000000000105838	movk	x9, #0x3fe5, lsl #48
000000000010583c	dup.2d	v0, x9
0000000000105840	stur	q0, [x29, #-0xf0]
0000000000105844	ldr	x5, [x22]
0000000000105848	sub	x2, x29, #0xf0
000000000010584c	orr	x3, x8, #0x8
0000000000105850	mov	x0, x23
0000000000105854	mov	w4, #0x2
0000000000105858	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000010585c	ldr	x4, [x22]
0000000000105860	sub	x2, x29, #0xc9
0000000000105864	mov	x0, x23
0000000000105868	mov	w3, #0x4
000000000010586c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000105870	add	x8, sp, #0x90
0000000000105874	mov	x0, x21
0000000000105878	mov	x2, x20
000000000010587c	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000105880	add	x8, sp, #0x10
0000000000105884	mov	x0, x21
0000000000105888	mov	x2, x19
000000000010588c	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000105890	ldr	d12, [sp, #0x90]
0000000000105894	ldr	d13, [sp, #0xb8]
0000000000105898	sub	x8, x29, #0xa0
000000000010589c	sub	x2, x29, #0xe0
00000000001058a0	mov	x0, x21
00000000001058a4	mov	x3, x19
00000000001058a8	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000001058ac	ldur	q0, [x29, #-0xa0]
00000000001058b0	stur	q0, [x29, #-0xe0]
00000000001058b4	sub	x8, x29, #0xa0
00000000001058b8	sub	x2, x29, #0xf0
00000000001058bc	mov	x0, x21
00000000001058c0	mov	x3, x19
00000000001058c4	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000001058c8	ldur	q0, [x29, #-0xa0]
00000000001058cc	stur	q0, [x29, #-0xf0]
00000000001058d0	ldur	d0, [x29, #-0xc8]
00000000001058d4	fcmp	d0, #0.0
00000000001058d8	b.ne	0x105918
00000000001058dc	cbz	x20, 0x10594c
00000000001058e0	sub	x8, x29, #0xa0
00000000001058e4	mov	x0, x20
00000000001058e8	bl	_objc_msgSend$heliumRef
00000000001058ec	b	0x105950
00000000001058f0	str	xzr, [sp, #0x90]
00000000001058f4	add	x2, sp, #0x90
00000000001058f8	mov	x0, x19
00000000001058fc	bl	"_objc_msgSend$setHeliumRef:"
0000000000105900	ldr	x0, [sp, #0x90]
0000000000105904	cbz	x0, 0x105970
0000000000105908	ldr	x8, [x0]
000000000010590c	ldr	x8, [x8, #0x18]
0000000000105910	blr	x8
0000000000105914	b	0x105970
0000000000105918	ldr	x2, [x22]
000000000010591c	mov	x0, x21
0000000000105920	bl	"_objc_msgSend$getRenderMode:"
0000000000105924	cbz	w0, 0x105974
0000000000105928	mov	x0, x20
000000000010592c	bl	_objc_msgSend$imageType
0000000000105930	cmp	x0, #0x3
0000000000105934	b.ne	0x1059b4
0000000000105938	cbz	x20, 0x1059bc
000000000010593c	add	x8, sp, #0x8
0000000000105940	mov	x0, x20
0000000000105944	bl	_objc_msgSend$heliumRef
0000000000105948	b	0x1059c0
000000000010594c	stur	xzr, [x29, #-0xa0]
0000000000105950	sub	x2, x29, #0xa0
0000000000105954	mov	x0, x19
0000000000105958	bl	"_objc_msgSend$setHeliumRef:"
000000000010595c	ldur	x0, [x29, #-0xa0]
0000000000105960	cbz	x0, 0x105970
0000000000105964	ldr	x8, [x0]
0000000000105968	ldr	x8, [x8, #0x18]
000000000010596c	blr	x8
0000000000105970	mov	w0, #0x1
0000000000105974	ldur	x8, [x29, #-0x78]
0000000000105978	adrp	x9, 644 ; 0x389000
000000000010597c	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
0000000000105980	ldr	x9, [x9]
0000000000105984	cmp	x9, x8
0000000000105988	b.ne	0x105e6c
000000000010598c	add	sp, sp, #0x190
0000000000105990	ldp	x29, x30, [sp, #0x70]
0000000000105994	ldp	x20, x19, [sp, #0x60]
0000000000105998	ldp	x22, x21, [sp, #0x50]
000000000010599c	ldp	x24, x23, [sp, #0x40]
00000000001059a0	ldp	x26, x25, [sp, #0x30]
00000000001059a4	ldp	d9, d8, [sp, #0x20]
00000000001059a8	ldp	d11, d10, [sp, #0x10]
00000000001059ac	ldp	d13, d12, [sp], #0x80
00000000001059b0	ret
00000000001059b4	mov	w0, #0x0
00000000001059b8	b	0x105974
00000000001059bc	str	xzr, [sp, #0x8]
00000000001059c0	ldurb	w8, [x29, #-0xc9]
00000000001059c4	cmp	w8, #0x1
00000000001059c8	b.ne	0x105a54
00000000001059cc	ldr	x0, [sp, #0x8]
00000000001059d0	str	x0, [sp]
00000000001059d4	cbz	x0, 0x1059e4
00000000001059d8	ldr	x8, [x0]
00000000001059dc	ldr	x8, [x8, #0x10]
00000000001059e0	blr	x8
00000000001059e4	sub	x8, x29, #0xa0
00000000001059e8	mov	x2, sp
00000000001059ec	mov	x0, x21
00000000001059f0	mov	x3, x20
00000000001059f4	mov	x4, x20
00000000001059f8	bl	"_objc_msgSend$smear:fromImage:toImage:"
00000000001059fc	ldr	x8, [sp, #0x8]
0000000000105a00	ldur	x0, [x29, #-0xa0]
0000000000105a04	cmp	x8, x0
0000000000105a08	b.eq	0x105a30
0000000000105a0c	cbz	x8, 0x105a24
0000000000105a10	ldr	x9, [x8]
0000000000105a14	ldr	x9, [x9, #0x18]
0000000000105a18	mov	x0, x8
0000000000105a1c	blr	x9
0000000000105a20	ldur	x0, [x29, #-0xa0]
0000000000105a24	str	x0, [sp, #0x8]
0000000000105a28	stur	xzr, [x29, #-0xa0]
0000000000105a2c	b	0x105a40
0000000000105a30	cbz	x8, 0x105a40
0000000000105a34	ldr	x8, [x0]
0000000000105a38	ldr	x8, [x8, #0x18]
0000000000105a3c	blr	x8
0000000000105a40	ldr	x0, [sp]
0000000000105a44	cbz	x0, 0x105a54
0000000000105a48	ldr	x8, [x0]
0000000000105a4c	ldr	x8, [x8, #0x18]
0000000000105a50	blr	x8
0000000000105a54	ldp	d10, d11, [x29, #-0xe0]
0000000000105a58	ldp	d8, d9, [x29, #-0xf0]
0000000000105a5c	mov	w0, #0x1a0
0000000000105a60	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000105a64	mov	x22, x0
0000000000105a68	bl	__ZN16HgcGradientBlur2C1Ev
0000000000105a6c	fsub	d0, d10, d8
0000000000105a70	fsub	d1, d11, d9
0000000000105a74	fmul	d2, d0, d0
0000000000105a78	fmul	d3, d1, d1
0000000000105a7c	fadd	d2, d2, d3
0000000000105a80	fsqrt	d2, d2
0000000000105a84	fmov	d3, #1.00000000
0000000000105a88	fdiv	d11, d3, d2
0000000000105a8c	fmul	d0, d0, d11
0000000000105a90	fmul	d1, d1, d11
0000000000105a94	fmul	d2, d8, d0
0000000000105a98	fmul	d3, d9, d1
0000000000105a9c	fadd	d2, d2, d3
0000000000105aa0	fcvt	s8, d0
0000000000105aa4	fcvt	s9, d1
0000000000105aa8	fcvt	s0, d2
0000000000105aac	fneg	s10, s0
0000000000105ab0	ldr	x8, [x22]
0000000000105ab4	ldr	x8, [x8, #0x60]
0000000000105ab8	movi.2d	v2, #0000000000000000
0000000000105abc	mov	x0, x22
0000000000105ac0	mov	w1, #0x1
0000000000105ac4	mov.16b	v0, v8
0000000000105ac8	mov.16b	v1, v9
0000000000105acc	mov.16b	v3, v10
0000000000105ad0	blr	x8
0000000000105ad4	fcvt	s11, d11
0000000000105ad8	ldr	x8, [x22]
0000000000105adc	ldr	x8, [x8, #0x60]
0000000000105ae0	movi.2d	v1, #0000000000000000
0000000000105ae4	movi.2d	v2, #0000000000000000
0000000000105ae8	movi.2d	v3, #0000000000000000
0000000000105aec	mov	x0, x22
0000000000105af0	mov	w1, #0x2
0000000000105af4	mov.16b	v0, v11
0000000000105af8	blr	x8
0000000000105afc	mov	w0, #0x1a0
0000000000105b00	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000105b04	mov	x23, x0
0000000000105b08	bl	__ZN16HgcGradientBlur2C1Ev
0000000000105b0c	ldr	x8, [x23]
0000000000105b10	ldr	x8, [x8, #0x60]
0000000000105b14	movi.2d	v2, #0000000000000000
0000000000105b18	mov	x0, x23
0000000000105b1c	mov	w1, #0x1
0000000000105b20	mov.16b	v0, v8
0000000000105b24	mov.16b	v1, v9
0000000000105b28	mov.16b	v3, v10
0000000000105b2c	blr	x8
0000000000105b30	ldr	x8, [x23]
0000000000105b34	ldr	x8, [x8, #0x60]
0000000000105b38	movi.2d	v1, #0000000000000000
0000000000105b3c	movi.2d	v2, #0000000000000000
0000000000105b40	movi.2d	v3, #0000000000000000
0000000000105b44	mov	x0, x23
0000000000105b48	mov	w1, #0x2
0000000000105b4c	mov.16b	v0, v11
0000000000105b50	blr	x8
0000000000105b54	fcvt	s0, d12
0000000000105b58	fcvt	s1, d13
0000000000105b5c	ldur	d2, [x29, #-0xc8]
0000000000105b60	adrp	x8, 358 ; 0x26b000
0000000000105b64	ldr	d3, [x8, #0x1a8]
0000000000105b68	fmul	d2, d2, d3
0000000000105b6c	stur	d2, [x29, #-0xc8]
0000000000105b70	fmov	d3, #7.00000000
0000000000105b74	fdiv	d2, d2, d3
0000000000105b78	fcvt	s2, d2
0000000000105b7c	adrp	x8, 356 ; 0x269000
0000000000105b80	ldr	q3, [x8, #0xaf0]
0000000000105b84	fmul.4s	v3, v3, v2[0]
0000000000105b88	adrp	x8, 358 ; 0x26b000
0000000000105b8c	ldr	q4, [x8, #0x450]
0000000000105b90	fmul.4s	v2, v4, v2[0]
0000000000105b94	fmul.4s	v4, v3, v0[0]
0000000000105b98	fmul.4s	v3, v3, v1[0]
0000000000105b9c	fmul.4s	v0, v2, v0[0]
0000000000105ba0	stp	q4, q0, [x29, #-0xa0]
0000000000105ba4	fmul.4s	v0, v2, v1[0]
0000000000105ba8	stp	q3, q0, [x29, #-0xc0]
0000000000105bac	ldr	x25, [sp, #0x8]
0000000000105bb0	mov	w0, #0x70
0000000000105bb4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000105bb8	mov	x24, x0
0000000000105bbc	mov	x1, x25
0000000000105bc0	mov	w2, #0x0
0000000000105bc4	bl	0x250f28 ; symbol stub for: __ZN11HGBlurGroupC1EP6HGNodeb
0000000000105bc8	sub	x1, x29, #0xa0
0000000000105bcc	sub	x2, x29, #0xc0
0000000000105bd0	mov	x0, x24
0000000000105bd4	mov	w3, #0x5
0000000000105bd8	bl	0x250f10 ; symbol stub for: __ZN11HGBlurGroup13setBlurValuesEPKfS1_m
0000000000105bdc	ldr	x8, [x22]
0000000000105be0	ldr	x8, [x8, #0x60]
0000000000105be4	movi.2d	v0, #0000000000000000
0000000000105be8	movi.2d	v1, #0000000000000000
0000000000105bec	movi.2d	v2, #0000000000000000
0000000000105bf0	movi.2d	v3, #0000000000000000
0000000000105bf4	mov	x0, x22
0000000000105bf8	mov	w1, #0x0
0000000000105bfc	blr	x8
0000000000105c00	mov	x0, x24
0000000000105c04	mov	w1, #0x0
0000000000105c08	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105c0c	mov	x2, x0
0000000000105c10	ldr	x8, [x22]
0000000000105c14	ldr	x8, [x8, #0x78]
0000000000105c18	mov	x0, x22
0000000000105c1c	mov	w1, #0x0
0000000000105c20	blr	x8
0000000000105c24	mov	x0, x24
0000000000105c28	mov	w1, #0x1
0000000000105c2c	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105c30	mov	x2, x0
0000000000105c34	ldr	x8, [x22]
0000000000105c38	ldr	x8, [x8, #0x78]
0000000000105c3c	mov	x0, x22
0000000000105c40	mov	w1, #0x1
0000000000105c44	blr	x8
0000000000105c48	mov	x0, x24
0000000000105c4c	mov	w1, #0x2
0000000000105c50	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105c54	mov	x2, x0
0000000000105c58	ldr	x8, [x22]
0000000000105c5c	ldr	x8, [x8, #0x78]
0000000000105c60	mov	x0, x22
0000000000105c64	mov	w1, #0x2
0000000000105c68	blr	x8
0000000000105c6c	mov	x0, x24
0000000000105c70	mov	w1, #0x3
0000000000105c74	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105c78	mov	x2, x0
0000000000105c7c	ldr	x8, [x22]
0000000000105c80	ldr	x8, [x8, #0x78]
0000000000105c84	mov	x0, x22
0000000000105c88	mov	w1, #0x3
0000000000105c8c	blr	x8
0000000000105c90	mov	x0, x24
0000000000105c94	mov	w1, #0x4
0000000000105c98	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105c9c	mov	x2, x0
0000000000105ca0	ldr	x8, [x22]
0000000000105ca4	ldr	x8, [x8, #0x78]
0000000000105ca8	mov	x0, x22
0000000000105cac	mov	w1, #0x4
0000000000105cb0	blr	x8
0000000000105cb4	cbz	x24, 0x105cc8
0000000000105cb8	ldr	x8, [x24]
0000000000105cbc	ldr	x8, [x8, #0x18]
0000000000105cc0	mov	x0, x24
0000000000105cc4	blr	x8
0000000000105cc8	ldr	x25, [sp, #0x8]
0000000000105ccc	mov	w0, #0x70
0000000000105cd0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000105cd4	mov	x24, x0
0000000000105cd8	mov	x1, x25
0000000000105cdc	mov	w2, #0x0
0000000000105ce0	bl	0x250f28 ; symbol stub for: __ZN11HGBlurGroupC1EP6HGNodeb
0000000000105ce4	sub	x8, x29, #0xa0
0000000000105ce8	sub	x9, x29, #0xc0
0000000000105cec	add	x1, x8, #0x10
0000000000105cf0	add	x2, x9, #0x10
0000000000105cf4	mov	x0, x24
0000000000105cf8	mov	w3, #0x4
0000000000105cfc	bl	0x250f10 ; symbol stub for: __ZN11HGBlurGroup13setBlurValuesEPKfS1_m
0000000000105d00	ldr	x8, [x23]
0000000000105d04	ldr	x8, [x8, #0x60]
0000000000105d08	fmov	s0, #1.00000000
0000000000105d0c	movi.2d	v1, #0000000000000000
0000000000105d10	movi.2d	v2, #0000000000000000
0000000000105d14	movi.2d	v3, #0000000000000000
0000000000105d18	mov	x0, x23
0000000000105d1c	mov	w1, #0x0
0000000000105d20	blr	x8
0000000000105d24	ldr	x8, [x23]
0000000000105d28	ldr	x8, [x8, #0x78]
0000000000105d2c	mov	x0, x23
0000000000105d30	mov	w1, #0x0
0000000000105d34	mov	x2, x22
0000000000105d38	blr	x8
0000000000105d3c	mov	x0, x24
0000000000105d40	mov	w1, #0x0
0000000000105d44	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105d48	mov	x2, x0
0000000000105d4c	ldr	x8, [x23]
0000000000105d50	ldr	x8, [x8, #0x78]
0000000000105d54	mov	x0, x23
0000000000105d58	mov	w1, #0x1
0000000000105d5c	blr	x8
0000000000105d60	mov	x0, x24
0000000000105d64	mov	w1, #0x1
0000000000105d68	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105d6c	mov	x2, x0
0000000000105d70	ldr	x8, [x23]
0000000000105d74	ldr	x8, [x8, #0x78]
0000000000105d78	mov	x0, x23
0000000000105d7c	mov	w1, #0x2
0000000000105d80	blr	x8
0000000000105d84	mov	x0, x24
0000000000105d88	mov	w1, #0x2
0000000000105d8c	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105d90	mov	x2, x0
0000000000105d94	ldr	x8, [x23]
0000000000105d98	ldr	x8, [x8, #0x78]
0000000000105d9c	mov	x0, x23
0000000000105da0	mov	w1, #0x3
0000000000105da4	blr	x8
0000000000105da8	mov	x0, x24
0000000000105dac	mov	w1, #0x3
0000000000105db0	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000105db4	mov	x2, x0
0000000000105db8	ldr	x8, [x23]
0000000000105dbc	ldr	x8, [x8, #0x78]
0000000000105dc0	mov	x0, x23
0000000000105dc4	mov	w1, #0x4
0000000000105dc8	blr	x8
0000000000105dcc	cbz	x24, 0x105de0
0000000000105dd0	ldr	x8, [x24]
0000000000105dd4	ldr	x8, [x8, #0x18]
0000000000105dd8	mov	x0, x24
0000000000105ddc	blr	x8
0000000000105de0	stur	x23, [x29, #-0xa0]
0000000000105de4	ldr	x8, [x23]
0000000000105de8	ldr	x8, [x8, #0x10]
0000000000105dec	mov	x0, x23
0000000000105df0	blr	x8
0000000000105df4	ldurb	w8, [x29, #-0xc9]
0000000000105df8	cmp	w8, #0x1
0000000000105dfc	b.ne	0x105e14
0000000000105e00	sub	x2, x29, #0xa0
0000000000105e04	mov	x0, x21
0000000000105e08	mov	x3, x20
0000000000105e0c	mov	x4, x19
0000000000105e10	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000105e14	sub	x2, x29, #0xa0
0000000000105e18	mov	x0, x19
0000000000105e1c	bl	"_objc_msgSend$setHeliumRef:"
0000000000105e20	ldur	x0, [x29, #-0xa0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm3 (float)
    - parm4 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
