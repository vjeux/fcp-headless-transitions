# Circle Blur

- **PAE class:** `Circle Blur`
- **Plugin UUID:** `8B8B4934-BD85-43BC-A63B-D7A01C4C0191`
- **Node names in corpus:** Circle Blur (54), OSC (2), Circle Blur copy (1), OSC 15 (1), OSC 14 (1), OSC 13 (1)
- **Corpus usage:** 19 files, 72 instances

## What it does

Circle Blur blurs the image everywhere except inside a sharp circular region centered on Center, i.e. it keeps a circular area in focus and blurs the surroundings (a radial focus/spotlight blur). Amount sets the blur strength and Radius the size of the in-focus circle.

> **Note.** Not implemented; description is the standard Apple Motion "Circle Blur" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the in-focus circle (X,Y) in normalized frame coordinates. |
| Amount | float | 10 | 0 .. 100 | Blur strength applied outside the circle, ~0-100 (default 10). *(keyframed in 1 instance)* |
| Radius | float (pixels) | 400 | 25 .. 2594 | Radius of the sharp in-focus circle in pixels, ~25-2600 (default 400). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcCircleBlur2`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcCircleBlur2` → [`HgcCircleBlur2.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcCircleBlur2.metal)

```metal
//Metal1.0     
//LEN=0000000d02
[[ visible ]] FragmentOut HgcCircleBlur2_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2,
    float4 color3,
    float4 color4,
    float4 texCoord5)
{
    const float4 c0 = float4(7.000000000, 3.000000000, 2.000000000, 1.000000000);
    const float4 c1 = float4(4.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8, r9;
    FragmentOut output;

    r0 = color0;
    r1.w = c0.w;
    r1.xy = texCoord5.xy;
    r2.y = dot(r1.xyw, hg_Params[3].xyz);
    r2.x = dot(r1.xyw, hg_Params[2].xyz);
    r2.x = dot(r2.xy, r2.xy);
    r2.x = sqrt(r2.x);
    r2.x = -r2.x*hg_Params[1].x + c0.w;
    r2.y = r2.x*c0.x;
    r1 = color1;
    r3 = color2;
    r4 = color3;
    r2.z = floor(fabs(r2.y));
    r2.z = select(r2.z, -r2.z, r2.y < 0.00000f);
    r5.x = r2.z - c0.y;
    r5.w = r5.x - c0.w;
    r6.yz = r5.xx - c0.zy;
    r5.w = abs(r5.w);
    r6.yz = abs(r6.yz);
    r2.y = r2.y - r2.z;
    r5.z = float(c1.z < r2.x);
    r5.y = float(r2.x < c0.w);
    r5.y = fmin(r5.z, r5.y);
    r5.z = r5.y*hg_Params[0].x;
    r2.w = float(r2.z >= c1.x);
    r2.w = r5.z*r2.w;
    r5.z = float(c1.z >= r5.x);
    r5.zw = float2(-r5.zw >= c1.zz);
    r5.x = abs(r5.x);
    r7 = color4;
    r5.z = r2.w*r5.z;
    r6.x = r5.z*r5.w;
    r5.z = r5.z*-r5.w + r5.z;
    r6.y = float(-r6.y >= c1.z);
    r5.w = r5.z*r6.y;
    r8 = select(r0, r1, -r6.xxxx < 0.00000f);
    r9 = select(r1, r3, -r6.xxxx < 0.00000f);
    r6.yz = float2(-r6.yz >= c1.zz);
    r9 = select(r9, r4, -r5.wwww < 0.00000f);
    r8 = select(r8, r3, -r5.wwww < 0.00000f);
    r5.z = r5.z*r6.y;
    r6.y = r5.z*r6.z;
    r6.z = float(-r6.z >= c1.z);
    r5.z = r5.z*r6.z;
    r8 = select(r8, r4, -r6.yyyy < 0.00000f);
    r6 = select(r9, r7, -r6.yyyy < 0.00000f);
    r6 = select(r6, c1.yzzy, -r5.zzzz < 0.00000f);
    r9.x = float(-fabs(hg_Params[0].x) >= c1.z);
    r8 = select(r8, c1.yzzy, -r5.zzzz < 0.00000f);
    r5.w = r2.z - c1.y;
    r5.z = abs(r5.w);
    r5.w = float(c1.z >= r2.z);
    r9.y = fmin(r5.y, r9.x);
    r5.zw = float2(-r5.zw >= c1.zz);
    r5.w = fmin(r9.y, r5.w);
    r9.z = fmin(r5.w, r5.z);
    r5.xz = float2(-r5.xz >= c1.zz);
    r5.z = fmin(r5.w, r5.z);
    r2.z = float(r2.z == c0.z);
    r5.w = fmin(r5.z, r2.z);
    r9.w = c1.y - r2.y;
    r6 = mix(r6, r8, r9.wwww);
    r8 = select(r1, r3, -r9.zzzz < 0.00000f);
    r1 = select(r0, r1, -r9.zzzz < 0.00000f);
    r2.z = r5.z*-r2.z + r5.z;
    r5.z = fmin(r2.z, r5.x);
    r8 = select(r8, r4, -r5.wwww < 0.00000f);
    r1 = select(r1, r3, -r5.wwww < 0.00000f);
    r2.z = r2.z*-r5.x + r2.z;
    r8 = select(r8, r7, -r5.zzzz < 0.00000f);
    r8 = select(r8, c1.yzzy, -r2.zzzz < 0.00000f);
    r1 = select(r1, r4, -r5.zzzz < 0.00000f);
    r1 = select(r1, c1.yzzy, -r2.zzzz < 0.00000f);
    r2.x = float(c1.z >= r2.x);
    r2.y = r2.x;
    r2.z = r5.y;
    r2.yz = float2(-r2.yz >= c1.zz);
    r2.xy = fmin(r2.zz, r2.xy);
    r1 = mix(r8, r1, r9.wwww);
    r6 = select(r0, r6, -r2.wwww < 0.00000f);
    r6 = select(r6, r1, -r9.yyyy < 0.00000f);
    r6 = select(r6, r0, -r2.xxxx < 0.00000f);
    r2.x = r2.y*-hg_Params[0].x;
    r6 = select(r6, r7, r2.xxxx < 0.00000f);
    r2.x = fmin(r2.y, r9.x);
    output.color0 = select(r6, r0, -r2.xxxx < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAECircleBlur canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAECircleBlur`

```asm
0000000000104868	mov	w4, #0x1
000000000010486c	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000104870	cmp	w24, #0x2
0000000000104874	csel	x3, x19, x20, lo
0000000000104878	add	x8, sp, #0xa0
000000000010487c	add	x2, sp, #0x120
0000000000104880	mov	x0, x21
0000000000104884	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
0000000000104888	add	x24, sp, #0x20
000000000010488c	ldr	q0, [x24, #0x80]
0000000000104890	str	q0, [x24, #0x100]
0000000000104894	ldr	x4, [x22]
0000000000104898	add	x2, sp, #0x140
000000000010489c	mov	x0, x23
00000000001048a0	mov	w3, #0x2
00000000001048a4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000001048a8	ldr	x4, [x22]
00000000001048ac	add	x2, sp, #0x138
00000000001048b0	mov	x0, x23
00000000001048b4	mov	w3, #0x3
00000000001048b8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000001048bc	ldr	x4, [x22]
00000000001048c0	add	x2, sp, #0x137
00000000001048c4	mov	x0, x23
00000000001048c8	mov	w3, #0x4
00000000001048cc	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000001048d0	ldr	x2, [x22]
00000000001048d4	mov	x0, x21
00000000001048d8	bl	"_objc_msgSend$getRenderMode:"
00000000001048dc	mov	x22, x0
00000000001048e0	mov	x0, x20
00000000001048e4	bl	_objc_msgSend$imageType
00000000001048e8	mov	x23, x0
00000000001048ec	add	x8, sp, #0x89
00000000001048f0	ldur	q0, [x8, #0xff]
00000000001048f4	add	x8, sp, #0x99
00000000001048f8	ldur	q1, [x8, #0xff]
00000000001048fc	add	x8, sp, #0xa9
0000000000104900	ldur	q2, [x8, #0xff]
0000000000104904	add	x8, sp, #0xb9
0000000000104908	ldur	q3, [x8, #0xff]
000000000010490c	stp	q1, q2, [x24, #0xd0]
0000000000104910	str	q3, [x24, #0xf0]
0000000000104914	add	x8, sp, #0x49
0000000000104918	ldur	q1, [x8, #0xff]
000000000010491c	add	x8, sp, #0x59
0000000000104920	ldur	q2, [x8, #0xff]
0000000000104924	add	x8, sp, #0x69
0000000000104928	ldur	q3, [x8, #0xff]
000000000010492c	add	x8, sp, #0x79
0000000000104930	ldur	q4, [x8, #0xff]
0000000000104934	stp	q2, q3, [x24, #0x90]
0000000000104938	stp	q4, q0, [x24, #0xb0]
000000000010493c	add	x8, sp, #0x109
0000000000104940	ldur	q0, [x8, #0xff]
0000000000104944	add	x8, sp, #0x119
0000000000104948	ldur	q2, [x8, #0xff]
000000000010494c	stp	q0, q2, [sp, #0x60]
0000000000104950	add	x8, sp, #0x129
0000000000104954	ldur	q0, [x8, #0xff]
0000000000104958	add	x8, sp, #0x139
000000000010495c	ldur	q2, [x8, #0xff]
0000000000104960	str	q0, [sp, #0x80]
0000000000104964	stp	q2, q1, [x24, #0x70]
0000000000104968	add	x8, sp, #0xc9
000000000010496c	ldur	q0, [x8, #0xff]
0000000000104970	add	x8, sp, #0xd9
0000000000104974	ldur	q1, [x8, #0xff]
0000000000104978	stp	q0, q1, [sp, #0x20]
000000000010497c	add	x8, sp, #0xe9
0000000000104980	ldur	q0, [x8, #0xff]
0000000000104984	add	x8, sp, #0xf9
0000000000104988	ldur	q1, [x8, #0xff]
000000000010498c	stp	q0, q1, [sp, #0x40]
0000000000104990	ldr	d0, [sp, #0x120]
0000000000104994	ldur	d1, [x25, #0x8]
0000000000104998	add	x0, sp, #0xa0
000000000010499c	movi.2d	v2, #0000000000000000
00000000001049a0	bl	__ZN14PCMatrix44TmplIdE14rightTranslateEddd
00000000001049a4	ldr	d0, [sp, #0x120]
00000000001049a8	fneg	d0, d0
00000000001049ac	ldur	d1, [x25, #0x8]
00000000001049b0	fneg	d1, d1
00000000001049b4	add	x0, sp, #0x20
00000000001049b8	movi.2d	v2, #0000000000000000
00000000001049bc	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
00000000001049c0	cmp	w22, #0x0
00000000001049c4	ccmp	x23, #0x3, #0x0, ne
00000000001049c8	cset	w22, eq
00000000001049cc	b.ne	0x104f54
00000000001049d0	ldr	d0, [sp, #0x140]
00000000001049d4	fcmp	d0, #0.0
00000000001049d8	b.ne	0x1049f0
00000000001049dc	cbz	x20, 0x104a04
00000000001049e0	sub	x8, x29, #0x88
00000000001049e4	mov	x0, x20
00000000001049e8	bl	_objc_msgSend$heliumRef
00000000001049ec	b	0x104a08
00000000001049f0	cbz	x20, 0x104a2c
00000000001049f4	add	x8, sp, #0x18
00000000001049f8	mov	x0, x20
00000000001049fc	bl	_objc_msgSend$heliumRef
0000000000104a00	b	0x104a30
0000000000104a04	stur	xzr, [x29, #-0x88]
0000000000104a08	sub	x2, x29, #0x88
0000000000104a0c	mov	x0, x19
0000000000104a10	bl	"_objc_msgSend$setHeliumRef:"
0000000000104a14	ldur	x0, [x29, #-0x88]
0000000000104a18	cbz	x0, 0x104f54
0000000000104a1c	ldr	x8, [x0]
0000000000104a20	ldr	x8, [x8, #0x18]
0000000000104a24	blr	x8
0000000000104a28	b	0x104f54
0000000000104a2c	str	xzr, [sp, #0x18]
0000000000104a30	ldrb	w8, [sp, #0x137]
0000000000104a34	cmp	w8, #0x1
0000000000104a38	b.ne	0x104ac4
0000000000104a3c	ldr	x0, [sp, #0x18]
0000000000104a40	str	x0, [sp, #0x10]
0000000000104a44	cbz	x0, 0x104a54
0000000000104a48	ldr	x8, [x0]
0000000000104a4c	ldr	x8, [x8, #0x10]
0000000000104a50	blr	x8
0000000000104a54	sub	x8, x29, #0x88
0000000000104a58	add	x2, sp, #0x10
0000000000104a5c	mov	x0, x21
0000000000104a60	mov	x3, x20
0000000000104a64	mov	x4, x20
0000000000104a68	bl	"_objc_msgSend$smear:fromImage:toImage:"
0000000000104a6c	ldr	x8, [sp, #0x18]
0000000000104a70	ldur	x0, [x29, #-0x88]
0000000000104a74	cmp	x8, x0
0000000000104a78	b.eq	0x104aa0
0000000000104a7c	cbz	x8, 0x104a94
0000000000104a80	ldr	x9, [x8]
0000000000104a84	ldr	x9, [x9, #0x18]
0000000000104a88	mov	x0, x8
0000000000104a8c	blr	x9
0000000000104a90	ldur	x0, [x29, #-0x88]
0000000000104a94	str	x0, [sp, #0x18]
0000000000104a98	stur	xzr, [x29, #-0x88]
0000000000104a9c	b	0x104ab0
0000000000104aa0	cbz	x8, 0x104ab0
0000000000104aa4	ldr	x8, [x0]
0000000000104aa8	ldr	x8, [x8, #0x18]
0000000000104aac	blr	x8
0000000000104ab0	ldr	x0, [sp, #0x10]
0000000000104ab4	cbz	x0, 0x104ac4
0000000000104ab8	ldr	x8, [x0]
0000000000104abc	ldr	x8, [x8, #0x18]
0000000000104ac0	blr	x8
0000000000104ac4	mov	x8, #0x0
0000000000104ac8	ldr	d0, [sp, #0x140]
0000000000104acc	adrp	x9, 359 ; 0x26b000
0000000000104ad0	ldr	d1, [x9, #0x1a8]
0000000000104ad4	fmul	d0, d0, d1
0000000000104ad8	ldr	d1, [sp, #0x48]
0000000000104adc	ldr	d2, [sp, #0x20]
0000000000104ae0	fabs	d3, d1
0000000000104ae4	fmov	d1, #7.00000000
0000000000104ae8	fdiv	d4, d0, d1
0000000000104aec	dup.2d	v1, v2[0]
0000000000104af0	dup.2d	v2, v3[0]
0000000000104af4	fcvt	s3, d4
0000000000104af8	adrp	x9, 357 ; 0x269000
0000000000104afc	ldr	q4, [x9, #0xa60]
0000000000104b00	sub	x9, x29, #0x88
0000000000104b04	sub	x10, x29, #0xa8
0000000000104b08	movi.4s	v5, #0x4
0000000000104b0c	ucvtf.4s	v6, v4
0000000000104b10	fmul.4s	v6, v6, v3[0]
0000000000104b14	fcvtl	v7.2d, v6.2s
0000000000104b18	fcvtl2	v6.2d, v6.4s
0000000000104b1c	fdiv.2d	v16, v6, v1
0000000000104b20	fdiv.2d	v17, v7, v1
0000000000104b24	fcvtn	v17.2s, v17.2d
0000000000104b28	fcvtn2	v17.4s, v16.2d
0000000000104b2c	str	q17, [x9, x8]
0000000000104b30	fdiv.2d	v6, v6, v2
0000000000104b34	fdiv.2d	v7, v7, v2
0000000000104b38	fcvtn	v7.2s, v7.2d
0000000000104b3c	fcvtn2	v7.4s, v6.2d
0000000000104b40	str	q7, [x10, x8]
0000000000104b44	add.4s	v4, v4, v5
0000000000104b48	add	x8, x8, #0x10
0000000000104b4c	cmp	x8, #0x20
0000000000104b50	b.ne	0x104b0c
0000000000104b54	fmov	d1, #7.00000000
0000000000104b58	fmul	d0, d0, d1
0000000000104b5c	mov	x8, #0x4059000000000000
0000000000104b60	fmov	d1, x8
0000000000104b64	fdiv	d0, d0, d1
0000000000104b68	str	d0, [sp, #0x140]
0000000000104b6c	mov	w0, #0x1a0
0000000000104b70	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000104b74	mov	x23, x0
0000000000104b78	bl	__ZN14HgcCircleBlur2C1Ev
0000000000104b7c	mov	w0, #0x1a0
0000000000104b80	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000104b84	mov	x24, x0
0000000000104b88	bl	__ZN14HgcCircleBlur2C1Ev
0000000000104b8c	ldr	d0, [sp, #0x138]
0000000000104b90	fmov	d8, #1.00000000
0000000000104b94	fdiv	d0, d8, d0
0000000000104b98	fcvt	s0, d0
0000000000104b9c	ldr	x8, [x23]
0000000000104ba0	ldr	x8, [x8, #0x60]
0000000000104ba4	movi.2d	v1, #0000000000000000
0000000000104ba8	movi.2d	v2, #0000000000000000
0000000000104bac	movi.2d	v3, #0000000000000000
0000000000104bb0	mov	x0, x23
0000000000104bb4	mov	w1, #0x1
0000000000104bb8	blr	x8
0000000000104bbc	ldr	d0, [sp, #0x138]
0000000000104bc0	fdiv	d0, d8, d0
0000000000104bc4	fcvt	s0, d0
0000000000104bc8	ldr	x8, [x24]
0000000000104bcc	ldr	x8, [x8, #0x60]
0000000000104bd0	movi.2d	v1, #0000000000000000
0000000000104bd4	movi.2d	v2, #0000000000000000
0000000000104bd8	movi.2d	v3, #0000000000000000
0000000000104bdc	mov	x0, x24
0000000000104be0	mov	w1, #0x1
0000000000104be4	blr	x8
0000000000104be8	ldp	d0, d1, [sp, #0x20]
0000000000104bec	fcvt	s0, d0
0000000000104bf0	fcvt	s1, d1
0000000000104bf4	ldp	d2, d3, [sp, #0x30]
0000000000104bf8	fcvt	s2, d2
0000000000104bfc	fcvt	s3, d3
0000000000104c00	ldr	x8, [x23]
0000000000104c04	ldr	x8, [x8, #0x60]
0000000000104c08	mov	x0, x23
0000000000104c0c	mov	w1, #0x2
0000000000104c10	blr	x8
0000000000104c14	ldp	d0, d1, [sp, #0x20]
0000000000104c18	fcvt	s0, d0
0000000000104c1c	fcvt	s1, d1
0000000000104c20	ldp	d2, d3, [sp, #0x30]
0000000000104c24	fcvt	s2, d2
0000000000104c28	fcvt	s3, d3
0000000000104c2c	ldr	x8, [x24]
0000000000104c30	ldr	x8, [x8, #0x60]
0000000000104c34	mov	x0, x24
0000000000104c38	mov	w1, #0x2
0000000000104c3c	blr	x8
0000000000104c40	ldp	d0, d1, [sp, #0x40]
0000000000104c44	fcvt	s0, d0
0000000000104c48	fcvt	s1, d1
0000000000104c4c	ldp	d2, d3, [sp, #0x50]
0000000000104c50	fcvt	s2, d2
0000000000104c54	fcvt	s3, d3
0000000000104c58	ldr	x8, [x23]
0000000000104c5c	ldr	x8, [x8, #0x60]
0000000000104c60	mov	x0, x23
0000000000104c64	mov	w1, #0x3
0000000000104c68	blr	x8
0000000000104c6c	ldp	d0, d1, [sp, #0x40]
0000000000104c70	fcvt	s0, d0
0000000000104c74	fcvt	s1, d1
0000000000104c78	ldp	d2, d3, [sp, #0x50]
0000000000104c7c	fcvt	s2, d2
0000000000104c80	fcvt	s3, d3
0000000000104c84	ldr	x8, [x24]
0000000000104c88	ldr	x8, [x8, #0x60]
0000000000104c8c	mov	x0, x24
0000000000104c90	mov	w1, #0x3
0000000000104c94	blr	x8
0000000000104c98	ldr	x26, [sp, #0x18]
0000000000104c9c	mov	w0, #0x70
0000000000104ca0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000104ca4	mov	x25, x0
0000000000104ca8	mov	x1, x26
0000000000104cac	mov	w2, #0x0
0000000000104cb0	bl	0x250f28 ; symbol stub for: __ZN11HGBlurGroupC1EP6HGNodeb
0000000000104cb4	sub	x1, x29, #0x88
0000000000104cb8	sub	x2, x29, #0xa8
0000000000104cbc	mov	x0, x25
0000000000104cc0	mov	w3, #0x5
0000000000104cc4	bl	0x250f10 ; symbol stub for: __ZN11HGBlurGroup13setBlurValuesEPKfS1_m
0000000000104cc8	ldr	x8, [x23]
0000000000104ccc	ldr	x8, [x8, #0x60]
0000000000104cd0	movi.2d	v0, #0000000000000000
0000000000104cd4	movi.2d	v1, #0000000000000000
0000000000104cd8	movi.2d	v2, #0000000000000000
0000000000104cdc	movi.2d	v3, #0000000000000000
0000000000104ce0	mov	x0, x23
0000000000104ce4	mov	w1, #0x0
0000000000104ce8	blr	x8
0000000000104cec	mov	x0, x25
0000000000104cf0	mov	w1, #0x0
0000000000104cf4	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104cf8	mov	x2, x0
0000000000104cfc	ldr	x8, [x23]
0000000000104d00	ldr	x8, [x8, #0x78]
0000000000104d04	mov	x0, x23
0000000000104d08	mov	w1, #0x0
0000000000104d0c	blr	x8
0000000000104d10	mov	x0, x25
0000000000104d14	mov	w1, #0x1
0000000000104d18	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104d1c	mov	x2, x0
0000000000104d20	ldr	x8, [x23]
0000000000104d24	ldr	x8, [x8, #0x78]
0000000000104d28	mov	x0, x23
0000000000104d2c	mov	w1, #0x1
0000000000104d30	blr	x8
0000000000104d34	mov	x0, x25
0000000000104d38	mov	w1, #0x2
0000000000104d3c	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104d40	mov	x2, x0
0000000000104d44	ldr	x8, [x23]
0000000000104d48	ldr	x8, [x8, #0x78]
0000000000104d4c	mov	x0, x23
0000000000104d50	mov	w1, #0x2
0000000000104d54	blr	x8
0000000000104d58	mov	x0, x25
0000000000104d5c	mov	w1, #0x3
0000000000104d60	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104d64	mov	x2, x0
0000000000104d68	ldr	x8, [x23]
0000000000104d6c	ldr	x8, [x8, #0x78]
0000000000104d70	mov	x0, x23
0000000000104d74	mov	w1, #0x3
0000000000104d78	blr	x8
0000000000104d7c	mov	x0, x25
0000000000104d80	mov	w1, #0x4
0000000000104d84	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104d88	mov	x2, x0
0000000000104d8c	ldr	x8, [x23]
0000000000104d90	ldr	x8, [x8, #0x78]
0000000000104d94	mov	x0, x23
0000000000104d98	mov	w1, #0x4
0000000000104d9c	blr	x8
0000000000104da0	cbz	x25, 0x104db4
0000000000104da4	ldr	x8, [x25]
0000000000104da8	ldr	x8, [x8, #0x18]
0000000000104dac	mov	x0, x25
0000000000104db0	blr	x8
0000000000104db4	ldr	x26, [sp, #0x18]
0000000000104db8	mov	w0, #0x70
0000000000104dbc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000104dc0	mov	x25, x0
0000000000104dc4	mov	x1, x26
0000000000104dc8	mov	w2, #0x0
0000000000104dcc	bl	0x250f28 ; symbol stub for: __ZN11HGBlurGroupC1EP6HGNodeb
0000000000104dd0	sub	x8, x29, #0x88
0000000000104dd4	sub	x9, x29, #0xa8
0000000000104dd8	add	x1, x8, #0x10
0000000000104ddc	add	x2, x9, #0x10
0000000000104de0	mov	x0, x25
0000000000104de4	mov	w3, #0x4
0000000000104de8	bl	0x250f10 ; symbol stub for: __ZN11HGBlurGroup13setBlurValuesEPKfS1_m
0000000000104dec	ldr	x8, [x24]
0000000000104df0	ldr	x8, [x8, #0x60]
0000000000104df4	fmov	s0, #1.00000000
0000000000104df8	movi.2d	v1, #0000000000000000
0000000000104dfc	movi.2d	v2, #0000000000000000
0000000000104e00	movi.2d	v3, #0000000000000000
0000000000104e04	mov	x0, x24
0000000000104e08	mov	w1, #0x0
0000000000104e0c	blr	x8
0000000000104e10	ldr	x8, [x24]
0000000000104e14	ldr	x8, [x8, #0x78]
0000000000104e18	mov	x0, x24
0000000000104e1c	mov	w1, #0x0
0000000000104e20	mov	x2, x23
0000000000104e24	blr	x8
0000000000104e28	mov	x0, x25
0000000000104e2c	mov	w1, #0x0
0000000000104e30	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104e34	mov	x2, x0
0000000000104e38	ldr	x8, [x24]
0000000000104e3c	ldr	x8, [x8, #0x78]
0000000000104e40	mov	x0, x24
0000000000104e44	mov	w1, #0x1
0000000000104e48	blr	x8
0000000000104e4c	mov	x0, x25
0000000000104e50	mov	w1, #0x1
0000000000104e54	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104e58	mov	x2, x0
0000000000104e5c	ldr	x8, [x24]
0000000000104e60	ldr	x8, [x8, #0x78]
0000000000104e64	mov	x0, x24
0000000000104e68	mov	w1, #0x2
0000000000104e6c	blr	x8
0000000000104e70	mov	x0, x25
0000000000104e74	mov	w1, #0x2
0000000000104e78	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104e7c	mov	x2, x0
0000000000104e80	ldr	x8, [x24]
0000000000104e84	ldr	x8, [x8, #0x78]
0000000000104e88	mov	x0, x24
0000000000104e8c	mov	w1, #0x3
0000000000104e90	blr	x8
0000000000104e94	mov	x0, x25
0000000000104e98	mov	w1, #0x3
0000000000104e9c	bl	0x250f1c ; symbol stub for: __ZN11HGBlurGroup5levelEj
0000000000104ea0	mov	x2, x0
0000000000104ea4	ldr	x8, [x24]
0000000000104ea8	ldr	x8, [x8, #0x78]
0000000000104eac	mov	x0, x24
0000000000104eb0	mov	w1, #0x4
0000000000104eb4	blr	x8
0000000000104eb8	cbz	x25, 0x104ecc
0000000000104ebc	ldr	x8, [x25]
0000000000104ec0	ldr	x8, [x8, #0x18]
0000000000104ec4	mov	x0, x25
0000000000104ec8	blr	x8
0000000000104ecc	str	x24, [sp, #0x8]
0000000000104ed0	ldr	x8, [x24]
0000000000104ed4	ldr	x8, [x8, #0x10]
0000000000104ed8	mov	x0, x24
0000000000104edc	blr	x8
0000000000104ee0	ldrb	w8, [sp, #0x137]
0000000000104ee4	cmp	w8, #0x1
0000000000104ee8	b.ne	0x104f00
0000000000104eec	add	x2, sp, #0x8
0000000000104ef0	mov	x0, x21
0000000000104ef4	mov	x3, x20
0000000000104ef8	mov	x4, x19
0000000000104efc	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000104f00	add	x2, sp, #0x8
0000000000104f04	mov	x0, x19
0000000000104f08	bl	"_objc_msgSend$setHeliumRef:"
0000000000104f0c	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 1  <-  parm2 (float), parm4 (bool), parm3 (float)
    slot 1  <-  parm3 (float)
    slot 2  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
