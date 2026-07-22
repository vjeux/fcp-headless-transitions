# Random Tile

- **PAE class:** `Random Tile`
- **Plugin UUID:** `F63A2C1A-551A-4061-8DEF-F20183056ABA`
- **Node names in corpus:** Random Tile (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Random Tile shatters a circular region (Radius) around Center into randomly-offset tiles, scattering the image into a mosaic of displaced squares. Seed sets the random arrangement and Feathering softens tile edges. Used for shatter/scatter transitions.

> **Note.** Not implemented; description is the standard Apple Motion "Random Tile" scatter filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the shattered region (X,Y) in normalized frame coordinates. |
| Radius | float (pixels) | 250 | 512 .. 512 | Radius of the affected region, ~512 (default 250). |
| Feathering | float | 0.5 | 1 .. 1 | Softness of the tile edges (default 0.5). Continuous float, NOT a boolean. |
| Seed | float (int seed) | 0 | 189 .. 189 | Random seed for the tile scatter arrangement. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcRandomTile`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRandomTile` → [`HgcRandomTile.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRandomTile.metal)

```metal
//Metal1.0     
//LEN=0000000287
[[ visible ]] FragmentOut HgcRandomTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy + hg_Params[3].xy;
    r0.xy = r0.xy*hg_Params[3].zw;
    r0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    r1.xyz = texCoord0.xyz - hg_Params[2].xyz;
    r1.xyz = r1.xyz*hg_Params[1].xyz;
    r1.x = dot(r1.xyz, r1.xyz);
    r1.x = sqrt(r1.x);
    r1.x = clamp(r1.x*hg_Params[0].x + hg_Params[0].y, 0.00000f, 1.00000f);
    output.color0 = r0*r1.xxxx;
    return output;
}
```

### CPU parameter wiring — `-[PAERandomTile canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAERandomTile`

```asm
0000000000061658	mov	w4, #0x1
000000000006165c	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000061660	ldr	x4, [x19]
0000000000061664	add	x2, sp, #0x410
0000000000061668	mov	x0, x23
000000000006166c	mov	w3, #0x2
0000000000061670	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000061674	ldr	x4, [x19]
0000000000061678	add	x2, sp, #0x408
000000000006167c	mov	x0, x23
0000000000061680	mov	w3, #0x3
0000000000061684	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000061688	ldr	x4, [x19]
000000000006168c	add	x2, sp, #0x400
0000000000061690	mov	x0, x23
0000000000061694	mov	w3, #0x4
0000000000061698	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006169c	ldr	d0, [sp, #0x400]
00000000000616a0	adrp	x8, 520 ; 0x269000
00000000000616a4	ldr	d1, [x8, #0x690]
00000000000616a8	fadd	d0, d0, d1
00000000000616ac	fcvtzs	w8, d0
00000000000616b0	sxtw	x20, w8
00000000000616b4	add	x8, sp, #0xd0
00000000000616b8	add	x24, x8, #0x8
00000000000616bc	mov	w9, #0x8
00000000000616c0	mov	x27, #0x2319
00000000000616c4	movk	x27, #0x8187, lsl #16
00000000000616c8	movk	x27, #0x9956, lsl #32
00000000000616cc	movk	x27, #0x5dfc, lsl #48
00000000000616d0	mov	w10, #0xe529
00000000000616d4	movk	w10, #0xa, lsl #16
00000000000616d8	add	x11, x28, x20, lsl #12
00000000000616dc	umulh	x12, x11, x27
00000000000616e0	lsr	x12, x12, #18
00000000000616e4	msub	x20, x12, x10, x11
00000000000616e8	str	x20, [x8, x9]
00000000000616ec	add	x9, x9, #0x8
00000000000616f0	cmp	x9, #0x330
00000000000616f4	b.ne	0x616d8
00000000000616f8	ldr	d10, [sp, #0x408]
00000000000616fc	ldr	d9, [sp, #0x420]
0000000000061700	ldr	d8, [sp, #0x418]
0000000000061704	ldr	d15, [sp, #0x410]
0000000000061708	ldr	x0, [sp, #0x28]
000000000006170c	bl	_objc_msgSend$imageType
0000000000061710	mov	x23, x0
0000000000061714	ldr	x2, [x19]
0000000000061718	ldr	x0, [sp, #0x20]
000000000006171c	bl	"_objc_msgSend$getRenderMode:"
0000000000061720	cmp	w0, #0x0
0000000000061724	ccmp	w23, #0x3, #0x0, ne
0000000000061728	cset	w23, eq
000000000006172c	b.ne	0x61df8
0000000000061730	mov	w0, #0x1b0
0000000000061734	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000061738	mov	x19, x0
000000000006173c	mov	x1, #0x0
0000000000061740	bl	0x251ae0 ; symbol stub for: __ZN8HGGLNodeC1Em
0000000000061744	fcvt	s0, d11
0000000000061748	fcvt	s1, d13
000000000006174c	fmov	s2, #1.00000000
0000000000061750	mov	x0, x19
0000000000061754	str	x19, [sp, #0x18]
0000000000061758	bl	0x251ad4 ; symbol stub for: __ZN8HGGLNode9hglScalefEfff
000000000006175c	mov	w0, #0x1a0
0000000000061760	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000061764	mov	x22, x0
0000000000061768	bl	__ZN13HgcRandomTileC1Ev
000000000006176c	mov	x0, x19
0000000000061770	mov	x1, x22
0000000000061774	str	x22, [sp, #0x48]
0000000000061778	bl	0x251a2c ; symbol stub for: __ZN8HGGLNode17addFragmentShaderEP8HGNode3D
000000000006177c	ldr	x0, [sp, #0x28]
0000000000061780	cbz	x0, 0x61794
0000000000061784	add	x8, sp, #0xc8
0000000000061788	bl	_objc_msgSend$heliumRef
000000000006178c	ldr	x2, [sp, #0xc8]
0000000000061790	b	0x6179c
0000000000061794	mov	x2, #0x0
0000000000061798	str	xzr, [sp, #0xc8]
000000000006179c	ldr	x8, [x19]
00000000000617a0	ldr	x8, [x8, #0x78]
00000000000617a4	mov	x0, x19
00000000000617a8	mov	w1, #0x0
00000000000617ac	blr	x8
00000000000617b0	ldr	x0, [sp, #0xc8]
00000000000617b4	cbz	x0, 0x617c4
00000000000617b8	ldr	x8, [x0]
00000000000617bc	ldr	x8, [x8, #0x18]
00000000000617c0	blr	x8
00000000000617c4	ldr	x0, [sp, #0x28]
00000000000617c8	cbz	x0, 0x617dc
00000000000617cc	add	x8, sp, #0xc8
00000000000617d0	bl	_objc_msgSend$heliumRef
00000000000617d4	ldr	x2, [sp, #0xc8]
00000000000617d8	b	0x617e4
00000000000617dc	mov	x2, #0x0
00000000000617e0	str	xzr, [sp, #0xc8]
00000000000617e4	ldr	x8, [x22]
00000000000617e8	ldr	x8, [x8, #0x78]
00000000000617ec	mov	x0, x22
00000000000617f0	mov	w1, #0x0
00000000000617f4	blr	x8
00000000000617f8	ldr	x0, [sp, #0xc8]
00000000000617fc	cbz	x0, 0x6180c
0000000000061800	ldr	x8, [x0]
0000000000061804	ldr	x8, [x8, #0x18]
0000000000061808	blr	x8
000000000006180c	mov	x0, x19
0000000000061810	mov	w1, #0x0
0000000000061814	mov	w2, #0x0
0000000000061818	bl	0x251a38 ; symbol stub for: __ZN8HGGLNode17hglEnableBlendingE12HGLBlendModeb
000000000006181c	str	d10, [sp, #0x50]
0000000000061820	str	d9, [sp, #0x60]
0000000000061824	str	d8, [sp, #0x80]
0000000000061828	mov.16b	v10, v13
000000000006182c	mov.16b	v13, v12
0000000000061830	ldr	d8, [sp, #0x420]
0000000000061834	ldr	d12, [sp, #0x418]
0000000000061838	ldr	x8, [x22]
000000000006183c	ldr	x8, [x8, #0x60]
0000000000061840	fmov	s0, #-10.00000000
0000000000061844	fmov	s1, #10.00000000
0000000000061848	movi.2d	v2, #0000000000000000
000000000006184c	movi.2d	v3, #0000000000000000
0000000000061850	mov	x0, x22
0000000000061854	mov	w1, #0x0
0000000000061858	blr	x8
000000000006185c	ldr	d1, [sp, #0x410]
0000000000061860	ldr	d0, [sp, #0xb0]
0000000000061864	fmul	d0, d0, d1
0000000000061868	fdiv	d2, d0, d13
000000000006186c	cmp	w25, #0x0
0000000000061870	fcsel	d0, d0, d2, eq
0000000000061874	fmov	d2, #1.00000000
0000000000061878	fdiv	d0, d2, d0
000000000006187c	fcvt	s0, d0
0000000000061880	fmul	d1, d10, d1
0000000000061884	fdiv	d1, d2, d1
0000000000061888	fcvt	s1, d1
000000000006188c	ldr	x8, [x22]
0000000000061890	ldr	x8, [x8, #0x60]
0000000000061894	movi.2d	v2, #0000000000000000
0000000000061898	movi.2d	v3, #0000000000000000
000000000006189c	mov	x0, x22
00000000000618a0	mov	w1, #0x1
00000000000618a4	blr	x8
00000000000618a8	ldr	w8, [sp, #0x90]
00000000000618ac	scvtf	d11, w8
00000000000618b0	ldr	w8, [sp, #0xa0]
00000000000618b4	scvtf	d9, w8
00000000000618b8	fmov	d0, #-0.50000000
00000000000618bc	fadd	d1, d8, d0
00000000000618c0	fmul	d1, d1, d11
00000000000618c4	fdiv	d1, d1, d13
00000000000618c8	fadd	d0, d12, d0
00000000000618cc	fmul	d2, d0, d9
00000000000618d0	fcvt	s0, d1
00000000000618d4	fcvt	s1, d2
00000000000618d8	ldr	x8, [x22]
00000000000618dc	ldr	x8, [x8, #0x60]
00000000000618e0	movi.2d	v2, #0000000000000000
00000000000618e4	movi.2d	v3, #0000000000000000
00000000000618e8	mov	x0, x22
00000000000618ec	mov	w1, #0x2
00000000000618f0	blr	x8
00000000000618f4	mov	w0, #0x10
00000000000618f8	bl	0x251fc0 ; symbol stub for: __Znwm
00000000000618fc	mov	x25, x0
0000000000061900	str	w23, [sp, #0x8]
0000000000061904	str	x21, [sp, #0x10]
0000000000061908	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EEC2Ev
000000000006190c	ldr	d8, [sp, #0x70]
0000000000061910	mov	w0, #0x10
0000000000061914	bl	0x251fc0 ; symbol stub for: __Znwm
0000000000061918	mov	x26, x0
000000000006191c	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EEC2Ev
0000000000061920	fmov	d12, #1.00000000
0000000000061924	fcvt	s0, d15
0000000000061928	str	s0, [sp, #0x44]
000000000006192c	fcvt	d0, s0
0000000000061930	fdiv	d0, d14, d0
0000000000061934	frintp	d0, d0
0000000000061938	fadd	d0, d0, d12
000000000006193c	fcvtzs	w19, d0
0000000000061940	mul	w21, w19, w19
0000000000061944	fmov	d0, #4.00000000
0000000000061948	fmul	d0, d15, d0
000000000006194c	fmul	d0, d15, d0
0000000000061950	fcvt	s0, d0
0000000000061954	fmul	d1, d8, d14
0000000000061958	fcvt	s1, d1
000000000006195c	ucvtf	s2, w21
0000000000061960	fdiv	s0, s1, s0
0000000000061964	movi.2s	v1, #0x42, lsl #24
0000000000061968	fmul	s0, s0, s1
000000000006196c	fadd	s0, s0, s2
0000000000061970	fcvtzs	w22, s0
0000000000061974	lsl	w23, w22, #2
0000000000061978	mov	x0, x25
000000000006197c	mov	x1, x23
0000000000061980	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE7reserveEi
0000000000061984	mov	x0, x26
0000000000061988	mov	x1, x23
000000000006198c	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE7reserveEi
0000000000061990	str	w23, [sp, #0xc]
0000000000061994	cmp	w22, #0x1
0000000000061998	b.lt	0x61cec
000000000006199c	mov	w23, #0x0
00000000000619a0	mov	w8, #0x4d69
00000000000619a4	movk	w8, #0x2, lsl #16
00000000000619a8	add	w8, w8, w20, lsl #12
00000000000619ac	mov	w9, #0x655b
00000000000619b0	movk	w9, #0x77f2, lsl #16
00000000000619b4	umull	x9, w8, w9
00000000000619b8	lsr	x9, x9, #32
00000000000619bc	sub	w10, w8, w9
00000000000619c0	add	w9, w9, w10, lsr #1
00000000000619c4	lsr	w9, w9, #19
00000000000619c8	mov	w10, #0xe529
00000000000619cc	movk	w10, #0xa, lsl #16
00000000000619d0	msub	w20, w9, w10, w8
00000000000619d4	fmov	d0, #-1.00000000
00000000000619d8	ldr	d1, [sp, #0x50]
00000000000619dc	fdiv	d0, d0, d1
00000000000619e0	fcvt	s2, d0
00000000000619e4	fsub	d0, d12, d1
00000000000619e8	fcvt	d1, s2
00000000000619ec	fmul	d0, d0, d1
00000000000619f0	fsub	d0, d12, d0
00000000000619f4	fcvt	s0, d0
00000000000619f8	stp	s0, s2, [sp, #0x3c]
00000000000619fc	fmov	d0, #-0.50000000
0000000000061a00	fmul	d1, d11, d0
0000000000061a04	ldr	w8, [sp, #0x90]
0000000000061a08	scvtf	d2, w8, #0x1
0000000000061a0c	fmul	d0, d9, d0
0000000000061a10	ldr	w8, [sp, #0xa0]
0000000000061a14	scvtf	d3, w8, #0x1
0000000000061a18	fsub	d2, d2, d1
0000000000061a1c	ldr	d4, [sp, #0x60]
0000000000061a20	fmul	d2, d2, d4
0000000000061a24	fadd	d1, d1, d2
0000000000061a28	fcvt	s1, d1
0000000000061a2c	fsub	d2, d3, d0
0000000000061a30	ldr	d3, [sp, #0x80]
0000000000061a34	fmul	d2, d2, d3
0000000000061a38	fadd	d0, d0, d2
0000000000061a3c	fcvt	s0, d0
0000000000061a40	fcvt	d1, s1
0000000000061a44	fdiv	d1, d1, d13
0000000000061a48	fsub	d2, d1, d15
0000000000061a4c	fcvt	s2, d2
0000000000061a50	fadd	d1, d15, d1
0000000000061a54	fcvt	s1, d1
0000000000061a58	fcvt	d0, s0
0000000000061a5c	fadd	d3, d15, d0
0000000000061a60	fcvt	s3, d3
0000000000061a64	fsub	d0, d0, d15
0000000000061a68	fcvt	s0, d0
0000000000061a6c	fcvt	s5, d14
0000000000061a70	fcvt	s4, d8
0000000000061a74	stp	s4, s5, [sp, #0x34]
0000000000061a78	fcvt	d2, s2
0000000000061a7c	ldr	d4, [sp, #0xb0]
0000000000061a80	fmul	d2, d4, d2
0000000000061a84	fcvt	s2, d2
0000000000061a88	adrp	x8, 519 ; 0x268000
0000000000061a8c	ldr	q5, [x8, #0xc10]
0000000000061a90	mov.16b	v6, v5
0000000000061a94	mov.s	v6[0], v2[0]
0000000000061a98	fmov	d2, #0.50000000
0000000000061a9c	fmul	d14, d14, d2
0000000000061aa0	fcvt	d3, s3
0000000000061aa4	fmul	d3, d10, d3
0000000000061aa8	fcvt	s3, d3
0000000000061aac	fcvt	d1, s1
0000000000061ab0	fmul	d1, d4, d1
0000000000061ab4	mov.16b	v4, v6
0000000000061ab8	mov.s	v4[1], v3[0]
0000000000061abc	fcvt	s1, d1
0000000000061ac0	mov.s	v5[0], v1[0]
0000000000061ac4	fmul	d11, d8, d2
0000000000061ac8	mov.16b	v1, v5
0000000000061acc	mov.s	v1[1], v3[0]
0000000000061ad0	stp	q1, q4, [sp, #0x70]
0000000000061ad4	fcvt	d0, s0
0000000000061ad8	fmul	d0, d10, d0
0000000000061adc	fcvt	s0, d0
0000000000061ae0	mov.s	v5[1], v0[0]
0000000000061ae4	mov.s	v6[1], v0[0]
0000000000061ae8	stp	q6, q5, [sp, #0x50]
0000000000061aec	adrp	x8, 520 ; 0x269000
0000000000061af0	ldr	s9, [x8, #0x614]
0000000000061af4	cmp	w21, w23
0000000000061af8	b.ne	0x61b1c
0000000000061afc	ldr	x0, [sp, #0x48]
0000000000061b00	ldr	x8, [x0]
0000000000061b04	ldr	x8, [x8, #0x60]
0000000000061b08	movi.2d	v2, #0000000000000000
0000000000061b0c	movi.2d	v3, #0000000000000000
0000000000061b10	mov	w1, #0x0
0000000000061b14	ldp	s1, s0, [sp, #0x3c]
0000000000061b18	blr	x8
0000000000061b1c	cmp	w23, w21
0000000000061b20	b.hs	0x61b4c
0000000000061b24	sdiv	w8, w23, w19
0000000000061b28	msub	w9, w19, w8, w23
0000000000061b2c	ucvtf	s0, w9
0000000000061b30	ldr	s1, [sp, #0x44]
0000000000061b34	fmul	s0, s1, s0
0000000000061b38	fcvt	d0, s0
0000000000061b3c	fmul	d10, d13, d0
0000000000061b40	scvtf	s0, w8
0000000000061b44	fmul	s8, s1, s0
0000000000061b48	b	0x61bec
0000000000061b4c	mov	x12, #0xaee5
0000000000061b50	movk	x12, #0x2d9f, lsl #16
0000000000061b54	movk	x12, #0x8656, lsl #32
0000000000061b58	movk	x12, #0x446f, lsl #48
0000000000061b5c	umulh	x8, x20, x12
0000000000061b60	sub	x9, x20, x8
0000000000061b64	add	x8, x8, x9, lsr #1
0000000000061b68	lsr	x8, x8, #6
0000000000061b6c	mov	w13, #0x65
0000000000061b70	msub	x8, x8, x13, x20
0000000000061b74	ldr	x9, [x24, x8, lsl #3]
0000000000061b78	add	x10, x28, x9, lsl #12
0000000000061b7c	umulh	x11, x10, x27
0000000000061b80	lsr	x11, x11, #18
0000000000061b84	mov	w14, #0xe529
0000000000061b88	movk	w14, #0xa, lsl #16
0000000000061b8c	msub	x10, x11, x14, x10
0000000000061b90	str	x10, [x24, x8, lsl #3]
0000000000061b94	ucvtf	s0, x9
0000000000061b98	fdiv	s0, s0, s9
0000000000061b9c	ldp	s1, s3, [sp, #0x34]
0000000000061ba0	fmul	s0, s0, s3
0000000000061ba4	movi.2d	v2, #0000000000000000
0000000000061ba8	fadd	s0, s0, s2
0000000000061bac	umulh	x8, x9, x12
0000000000061bb0	sub	x10, x9, x8
0000000000061bb4	add	x8, x8, x10, lsr #1
0000000000061bb8	lsr	x8, x8, #6
0000000000061bbc	msub	x8, x8, x13, x9
0000000000061bc0	ldr	x20, [x24, x8, lsl #3]
0000000000061bc4	add	x9, x28, x20, lsl #12
0000000000061bc8	umulh	x10, x9, x27
0000000000061bcc	lsr	x10, x10, #18
0000000000061bd0	msub	x9, x10, x14, x9
0000000000061bd4	str	x9, [x24, x8, lsl #3]
0000000000061bd8	fcvt	d10, s0
0000000000061bdc	ucvtf	s0, x20
0000000000061be0	fdiv	s0, s0, s9
0000000000061be4	fmul	s0, s0, s1
0000000000061be8	fadd	s8, s0, s2
0000000000061bec	ldr	d15, [sp, #0x410]
0000000000061bf0	mov	x0, x25
0000000000061bf4	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061bf8	fcvt	d12, s8
0000000000061bfc	fmul	d8, d13, d15
0000000000061c00	fsub	d0, d10, d8
0000000000061c04	fsub	d0, d0, d14
0000000000061c08	fcvt	s1, d0
0000000000061c0c	fadd	d0, d15, d12
0000000000061c10	fsub	d0, d0, d11
0000000000061c14	fcvt	s2, d0
0000000000061c18	mov.s	v1[2], wzr
0000000000061c1c	fmov	s0, #1.00000000
0000000000061c20	mov.s	v1[3], v0[0]
0000000000061c24	stp	q1, q2, [sp, #0xa0]
0000000000061c28	mov.16b	v0, v1
0000000000061c2c	mov.s	v0[1], v2[0]
0000000000061c30	str	q0, [x0]
0000000000061c34	mov	x0, x26
0000000000061c38	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061c3c	ldr	q0, [sp, #0x80]
0000000000061c40	str	q0, [x0]
0000000000061c44	mov	x0, x25
0000000000061c48	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061c4c	fadd	d0, d10, d8
0000000000061c50	fsub	d0, d0, d14
0000000000061c54	fcvt	s1, d0
0000000000061c58	mov.s	v1[2], wzr
0000000000061c5c	fmov	s0, #1.00000000
0000000000061c60	mov.s	v1[3], v0[0]
0000000000061c64	str	q1, [sp, #0x90]
0000000000061c68	mov.16b	v0, v1
0000000000061c6c	ldr	q1, [sp, #0xb0]
0000000000061c70	mov.s	v0[1], v1[0]
0000000000061c74	str	q0, [x0]
0000000000061c78	mov	x0, x26
0000000000061c7c	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061c80	ldr	q0, [sp, #0x70]
0000000000061c84	str	q0, [x0]
0000000000061c88	mov	x0, x25
0000000000061c8c	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061c90	fsub	d0, d12, d15
0000000000061c94	fsub	d0, d0, d11
0000000000061c98	fcvt	s1, d0
0000000000061c9c	ldr	q0, [sp, #0x90]
0000000000061ca0	str	q1, [sp, #0xb0]
0000000000061ca4	mov.s	v0[1], v1[0]
0000000000061ca8	str	q0, [x0]
0000000000061cac	mov	x0, x26
0000000000061cb0	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061cb4	ldr	q0, [sp, #0x60]
0000000000061cb8	str	q0, [x0]
0000000000061cbc	mov	x0, x25
0000000000061cc0	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061cc4	ldp	q0, q1, [sp, #0xa0]
0000000000061cc8	mov.s	v0[1], v1[0]
0000000000061ccc	str	q0, [x0]
0000000000061cd0	mov	x0, x26
0000000000061cd4	bl	__ZN7HGArrayI19__simd128_float32_tL8HGFormat28EE6appendEv
0000000000061cd8	ldr	q0, [sp, #0x50]
0000000000061cdc	str	q0, [x0]
0000000000061ce0	add	w23, w23, #0x1
0000000000061ce4	cmp	w22, w23
0000000000061ce8	b.ne	0x61af4
0000000000061cec	ldr	x19, [sp, #0x18]
0000000000061cf0	mov	x0, x19
0000000000061cf4	mov	w1, #0x8074
0000000000061cf8	bl	0x251a68 ; symbol stub for: __ZN8HGGLNode20hglEnableClientStateEj
0000000000061cfc	mov	x0, x19
0000000000061d00	mov	x1, x25
0000000000061d04	bl	0x2519d8 ; symbol stub for: __ZN8HGGLNode14hglVertexArrayERK14HGArrayDataRef
0000000000061d08	mov	x0, x19
0000000000061d0c	mov	w1, #0x84c0
0000000000061d10	bl	0x251a08 ; symbol stub for: __ZN8HGGLNode16hglActiveTextureEj
0000000000061d14	mov	x0, x19
0000000000061d18	mov	w1, #0x8078
0000000000061d1c	bl	0x251a68 ; symbol stub for: __ZN8HGGLNode20hglEnableClientStateEj
0000000000061d20	mov	x0, x19
0000000000061d24	mov	x1, x26
0000000000061d28	bl	0x251a14 ; symbol stub for: __ZN8HGGLNode16hglTexCoordArrayERK14HGArrayDataRef
0000000000061d2c	mov	x0, x19
0000000000061d30	mov	w1, #0x7
0000000000061d34	mov	w2, #0x0
0000000000061d38	ldr	w3, [sp, #0xc]
0000000000061d3c	bl	0x251990 ; symbol stub for: __ZN8HGGLNode13hglDrawArraysEjii
0000000000061d40	mov	x0, x19
0000000000061d44	mov	w1, #0x8074
0000000000061d48	bl	0x251a74 ; symbol stub for: __ZN8HGGLNode21hglDisableClientStateEj
0000000000061d4c	mov	x0, x19
0000000000061d50	mov	w1, #0x8078
0000000000061d54	bl	0x251a74 ; symbol stub for: __ZN8HGGLNode21hglDisableClientStateEj
0000000000061d58	ldr	x0, [x26]
0000000000061d5c	ldr	x20, [sp, #0x10]
0000000000061d60	ldp	x22, x21, [sp, #0x20]
0000000000061d64	ldr	x23, [sp, #0x48]
0000000000061d68	cbz	x0, 0x61d70
0000000000061d6c	bl	__ZN11HGArrayData7ReleaseEv
0000000000061d70	mov	x0, x26
0000000000061d74	bl	0x251f9c ; symbol stub for: __ZdlPv
0000000000061d78	ldr	x0, [x25]
0000000000061d7c	cbz	x0, 0x61d84
0000000000061d80	bl	__ZN11HGArrayData7ReleaseEv
0000000000061d84	mov	x0, x25
0000000000061d88	bl	0x251f9c ; symbol stub for: __ZdlPv
0000000000061d8c	str	x19, [sp, #0xc8]
0000000000061d90	ldr	x8, [x19]
0000000000061d94	ldr	x8, [x8, #0x10]
0000000000061d98	mov	x0, x19
0000000000061d9c	blr	x8
0000000000061da0	add	x2, sp, #0xc8
0000000000061da4	mov	x0, x22
0000000000061da8	mov	x3, x21
0000000000061dac	mov	x4, x20
0000000000061db0	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000061db4	add	x2, sp, #0xc8
0000000000061db8	mov	x0, x20
0000000000061dbc	bl	"_objc_msgSend$setHeliumRef:"
0000000000061dc0	ldr	x0, [sp, #0xc8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm4 (float), parm3 (float), parm2 (float)
    slot 1  <-  parm2 (float)
    slot 2  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
