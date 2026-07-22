# Vignette

- **PAE class:** `Vignette`
- **Plugin UUID:** `EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B`
- **Node names in corpus:** Vignette (53), Vignette copy (1)
- **Corpus usage:** 48 files, 54 instances

## What it does

Vignette darkens (and optionally desaturates) the frame toward the corners using a radial smoothstep mask: the center stays clear out to a Size radius, then falls off over a Falloff band to a darkened edge set by Darken. Implemented and verified faithful (32-44 dB) to the HgcVignette shader.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float | 0.6 | 0.4799 .. 1.353 | Radius of the clear (unvignetted) center, ~0.48-1.35 (default 0.6). Larger = the clear area reaches farther out. |
| Darken | float | 0.3 | 0 .. 1 | How dark the vignetted edge gets, 0-1 (default 0.3). 0 = no darkening, 1 = edge goes to black. |
| Falloff | float | 0.5 | 0.2129 .. 1 | Softness of the inner->outer transition band, ~0.21-1 (default 0.5). Larger = a wider, softer gradient. |
| Saturation | float | 0.3 | -0.27 .. 1 | Desaturation toward the edge, -0.27..1 (default 0.3). Continuous float; pulls edge color toward gray. |
| Blur Amount | float (pixels) | 4 | 0 .. 47 | Optional blur of the vignetted edge, 0-47. |
| Center | point2D | - | - | Center of the vignette (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 0.0312 .. 1 | Wet/dry blend of the vignetted result over the original, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Prescale Input`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/vignette.ts`](../../engine/src/compositor/filters/vignette.ts). Reverse-engineered against the verbatim `HgcVignette` Metal shader.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcVignette`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcVignette` → [`HgcVignette.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcVignette.metal)

```metal
//Metal1.0     
//LEN=00000004c1
[[ visible ]] FragmentOut HgcVignette_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 texCoord2)
{
    const float4 c0 = float4(2.000000000, -1.000000000, 0.000000000, 3.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r2.z = c0.z;
    r2.xy = texCoord2.xy*hg_Params[4].xy;
    r2.xy = r2.xy*c0.xx + c0.yy;
    r2.xyz = r2.xyz - hg_Params[0].xyz;
    r2.x = dot(r2.xyz, r2.xyz);
    r2.x = sqrt(r2.x);
    r3.x = r2.x - hg_Params[1].y;
    r3.x = clamp(r3.x*hg_Params[1].x, 0.00000f, 1.00000f);
    r4.x = r3.x*r3.x;
    r3.x = r3.x*-c0.x + c0.w;
    r3.x = r3.x*r4.x;
    r2.x = r2.x*hg_Params[1].x + hg_Params[1].y;
    r2.x = clamp(select(r3.x, r2.x, hg_Params[5].x < 0.00000f), 0.00000f, 1.00000f);
    r1 = mix(r0, r1, r2.xxxx);
    r4 = mix(-c0.yyyy, hg_Params[2], r2.xxxx);
    r2.xyz = mix(-c0.yyy, hg_Params[3].xyz, r2.xxx);
    r3 = r1 / float4(fmax(r1.www, 1.00000e-06f), 1.);
    r3 = r3*r4;
    r0.xyz = float3(dot(r3, hg_Params[6]));
    r3.xyz = mix(r0.xyz, r3.xyz, r2.xyz);
    r3.w = r1.w;
    r3.xyz = r3.xyz*r3.www;
    output.color0 = r3;
    return output;
}
```

### CPU parameter wiring — `-[PAEVignette canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEVignette`

```asm
0000000000069144	mov	w3, #0x1
0000000000069148	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006914c	ldur	d0, [x29, #-0x90]
0000000000069150	fcmp	d0, #0.0
0000000000069154	b.ne	0x6916c
0000000000069158	cbz	x24, 0x69248
000000000006915c	add	x8, sp, #0x10
0000000000069160	mov	x0, x24
0000000000069164	bl	_objc_msgSend$heliumRef
0000000000069168	b	0x6924c
000000000006916c	str	w23, [sp, #0xc]
0000000000069170	fmov	d1, #1.50000000
0000000000069174	fsub	d0, d1, d0
0000000000069178	stur	d0, [x29, #-0x90]
000000000006917c	ldr	x4, [x19]
0000000000069180	sub	x2, x29, #0x98
0000000000069184	mov	x0, x27
0000000000069188	mov	w3, #0x5
000000000006918c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000069190	ldr	x4, [x19]
0000000000069194	sub	x2, x29, #0xa0
0000000000069198	mov	x0, x27
000000000006919c	mov	w3, #0x2
00000000000691a0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000691a4	ldr	x4, [x19]
00000000000691a8	sub	x2, x29, #0xa8
00000000000691ac	mov	x0, x27
00000000000691b0	mov	w3, #0x3
00000000000691b4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000691b8	ldr	x4, [x19]
00000000000691bc	sub	x2, x29, #0xb0
00000000000691c0	mov	x0, x27
00000000000691c4	mov	w3, #0x4
00000000000691c8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000691cc	stp	xzr, xzr, [x29, #-0xc0]
00000000000691d0	sub	x8, x29, #0xc0
00000000000691d4	ldr	x5, [x19]
00000000000691d8	sub	x2, x29, #0xc0
00000000000691dc	add	x3, x8, #0x8
00000000000691e0	mov	x0, x27
00000000000691e4	mov	w4, #0x6
00000000000691e8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000691ec	ldr	x4, [x19]
00000000000691f0	sub	x2, x29, #0xc1
00000000000691f4	mov	x0, x27
00000000000691f8	mov	w3, #0x7
00000000000691fc	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000069200	ldr	x2, [x19]
0000000000069204	mov	x0, x28
0000000000069208	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000006920c	bl	_objc_msgSend$matrix
0000000000069210	mov	x27, x0
0000000000069214	ldr	x2, [x19]
0000000000069218	mov	x0, x25
000000000006921c	bl	"_objc_msgSend$getRenderMode:"
0000000000069220	cbz	w0, 0x6926c
0000000000069224	mov	x0, x24
0000000000069228	bl	_objc_msgSend$imageType
000000000006922c	cmp	x0, #0x3
0000000000069230	b.ne	0x6926c
0000000000069234	cbz	x24, 0x6929c
0000000000069238	add	x8, sp, #0xc0
000000000006923c	mov	x0, x24
0000000000069240	bl	_objc_msgSend$heliumRef
0000000000069244	b	0x692a0
0000000000069248	str	xzr, [sp, #0x10]
000000000006924c	add	x2, sp, #0x10
0000000000069250	mov	x0, x21
0000000000069254	bl	"_objc_msgSend$setHeliumRef:"
0000000000069258	ldr	x0, [sp, #0x10]
000000000006925c	cbz	x0, 0x6926c
0000000000069260	ldr	x8, [x0]
0000000000069264	ldr	x8, [x8, #0x18]
0000000000069268	blr	x8
000000000006926c	mov	x0, x20
0000000000069270	ldp	x29, x30, [sp, #0x190]
0000000000069274	ldp	x20, x19, [sp, #0x180]
0000000000069278	ldp	x22, x21, [sp, #0x170]
000000000006927c	ldp	x24, x23, [sp, #0x160]
0000000000069280	ldp	x26, x25, [sp, #0x150]
0000000000069284	ldp	x28, x27, [sp, #0x140]
0000000000069288	ldp	d9, d8, [sp, #0x130]
000000000006928c	ldp	d11, d10, [sp, #0x120]
0000000000069290	ldp	d13, d12, [sp, #0x110]
0000000000069294	add	sp, sp, #0x1a0
0000000000069298	ret
000000000006929c	str	xzr, [sp, #0xc0]
00000000000692a0	mov	w0, #0x1b0
00000000000692a4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000692a8	mov	x19, x0
00000000000692ac	bl	__ZN11HgcVignetteC2Ev
00000000000692b0	adrp	x8, 814 ; 0x397000
00000000000692b4	add	x8, x8, #0x3f8
00000000000692b8	add	x8, x8, #0x10
00000000000692bc	str	x8, [x19]
00000000000692c0	stp	xzr, xzr, [x19, #0x1a0]
00000000000692c4	ldp	d2, d0, [x29, #-0x98]
00000000000692c8	adrp	x8, 512 ; 0x269000
00000000000692cc	ldr	d1, [x8, #0xf10]
00000000000692d0	fsub	d1, d1, d0
00000000000692d4	fmul	d1, d1, d2
00000000000692d8	fmov	d9, #1.00000000
00000000000692dc	fdiv	d1, d9, d1
00000000000692e0	fcvt	s8, d1
00000000000692e4	fcvt	d1, s8
00000000000692e8	fnmul	d1, d1, d0
00000000000692ec	cmp	w26, #0x1
00000000000692f0	fcsel	d12, d1, d0, hi
00000000000692f4	ldp	d10, d11, [x29, #-0xb0]
00000000000692f8	mov	x0, x24
00000000000692fc	bl	_objc_msgSend$width
0000000000069300	mov	x28, x0
0000000000069304	mov	x0, x24
0000000000069308	bl	_objc_msgSend$height
000000000006930c	mov	x23, x0
0000000000069310	ldp	d0, d1, [x29, #-0xc0]
0000000000069314	fadd	d0, d0, d0
0000000000069318	fmov	d2, #-2.00000000
000000000006931c	fadd	d0, d0, d2
0000000000069320	fcvt	s0, d0
0000000000069324	fadd	d1, d1, d1
0000000000069328	fadd	d1, d1, d2
000000000006932c	fcvt	s1, d1
0000000000069330	ldr	x8, [x19]
0000000000069334	ldr	x8, [x8, #0x60]
0000000000069338	movi.2d	v2, #0000000000000000
000000000006933c	movi.2d	v3, #0000000000000000
0000000000069340	mov	x0, x19
0000000000069344	mov	w1, #0x0
0000000000069348	blr	x8
000000000006934c	fcvt	s1, d12
0000000000069350	ldr	x8, [x19]
0000000000069354	ldr	x8, [x8, #0x60]
0000000000069358	movi.2d	v2, #0000000000000000
000000000006935c	movi.2d	v3, #0000000000000000
0000000000069360	mov	x0, x19
0000000000069364	mov	w1, #0x1
0000000000069368	mov.16b	v0, v8
000000000006936c	blr	x8
0000000000069370	fsub	d0, d9, d11
0000000000069374	fcvt	s0, d0
0000000000069378	ldr	x8, [x19]
000000000006937c	ldr	x8, [x8, #0x60]
0000000000069380	fmov	s3, #1.00000000
0000000000069384	mov	x0, x19
0000000000069388	mov	w1, #0x2
000000000006938c	mov.16b	v1, v0
0000000000069390	mov.16b	v2, v0
0000000000069394	blr	x8
0000000000069398	fadd	d0, d10, d9
000000000006939c	fcvt	s0, d0
00000000000693a0	ldr	x8, [x19]
00000000000693a4	ldr	x8, [x8, #0x60]
00000000000693a8	fmov	s8, #1.00000000
00000000000693ac	fmov	s3, #1.00000000
00000000000693b0	mov	x0, x19
00000000000693b4	mov	w1, #0x3
00000000000693b8	mov.16b	v1, v0
00000000000693bc	mov.16b	v2, v0
00000000000693c0	blr	x8
00000000000693c4	ucvtf	s10, x28
00000000000693c8	ucvtf	s9, x23
00000000000693cc	fdiv	s0, s8, s10
00000000000693d0	ldr	x8, [x19]
00000000000693d4	ldr	x8, [x8, #0x60]
00000000000693d8	fdiv	s1, s8, s9
00000000000693dc	movi.2d	v2, #0000000000000000
00000000000693e0	movi.2d	v3, #0000000000000000
00000000000693e4	mov	x0, x19
00000000000693e8	mov	w1, #0x4
00000000000693ec	blr	x8
00000000000693f0	cmp	w26, #0x1
00000000000693f4	fmov	s0, #1.00000000
00000000000693f8	fmov	s1, #-1.00000000
00000000000693fc	fcsel	s0, s1, s0, hi
0000000000069400	ldr	x8, [x19]
0000000000069404	ldr	x8, [x8, #0x60]
0000000000069408	movi.2d	v1, #0000000000000000
000000000006940c	movi.2d	v2, #0000000000000000
0000000000069410	movi.2d	v3, #0000000000000000
0000000000069414	mov	x0, x19
0000000000069418	mov	w1, #0x5
000000000006941c	blr	x8
0000000000069420	cmp	w22, #0x3
0000000000069424	b.lo	0x69440
0000000000069428	ldp	d0, d1, [x27]
000000000006942c	fcvt	s0, d0
0000000000069430	fcvt	s1, d1
0000000000069434	ldr	d2, [x27, #0x10]
0000000000069438	fcvt	s2, d2
000000000006943c	b	0x69458
0000000000069440	adrp	x8, 512 ; 0x269000
0000000000069444	ldr	s2, [x8, #0x5d8]
0000000000069448	adrp	x8, 512 ; 0x269000
000000000006944c	ldr	s1, [x8, #0x5d4]
0000000000069450	adrp	x8, 512 ; 0x269000
0000000000069454	ldr	s0, [x8, #0x5d0]
0000000000069458	ldr	x8, [x19]
000000000006945c	ldr	x8, [x8, #0x60]
0000000000069460	movi.2d	v3, #0000000000000000
0000000000069464	mov	x0, x19
0000000000069468	mov	w1, #0x6
000000000006946c	blr	x8
0000000000069470	fmov	s2, #-0.50000000
0000000000069474	fmul	s0, s10, s2
0000000000069478	fmov	s3, #0.50000000
000000000006947c	fmul	s1, s10, s3
0000000000069480	fmul	s2, s9, s2
0000000000069484	fmul	s3, s9, s3
0000000000069488	mov	x0, x19
000000000006948c	bl	__ZN9HVignette7SetCropEffff
0000000000069490	add	x8, sp, #0xb0
0000000000069494	mov	x0, x25
0000000000069498	mov	x2, x24
000000000006949c	bl	"_objc_msgSend$getScaleForImage:"
00000000000694a0	ldr	x22, [sp, #0xc0]
00000000000694a4	cbz	x22, 0x694e4
00000000000694a8	ldr	x8, [x22]
00000000000694ac	ldr	x8, [x8, #0x10]
00000000000694b0	mov	x0, x22
00000000000694b4	blr	x8
00000000000694b8	ldr	x2, [sp, #0xc0]
00000000000694bc	ldur	d0, [x29, #-0xa0]
00000000000694c0	fcmp	d0, #0.0
00000000000694c4	b.le	0x69804
00000000000694c8	str	x2, [sp, #0xa0]
00000000000694cc	cbz	x2, 0x694f4
00000000000694d0	ldr	x8, [x2]
00000000000694d4	ldr	x8, [x8, #0x10]
00000000000694d8	mov	x0, x2
00000000000694dc	blr	x8
00000000000694e0	b	0x694f4
00000000000694e4	ldur	d0, [x29, #-0xa0]
00000000000694e8	fcmp	d0, #0.0
00000000000694ec	b.le	0x695f8
00000000000694f0	str	xzr, [sp, #0xa0]
00000000000694f4	add	x8, sp, #0xa8
00000000000694f8	add	x2, sp, #0xa0
00000000000694fc	mov	x0, x25
0000000000069500	mov	x3, x24
0000000000069504	mov	x4, x24
0000000000069508	bl	"_objc_msgSend$smear:fromImage:toImage:"
000000000006950c	ldr	x0, [sp, #0xa0]
0000000000069510	cbz	x0, 0x69520
0000000000069514	ldr	x8, [x0]
0000000000069518	ldr	x8, [x8, #0x18]
000000000006951c	blr	x8
0000000000069520	mov	w0, #0x210
0000000000069524	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000069528	mov	x27, x0
000000000006952c	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000069530	ldur	d0, [x29, #-0xa0]
0000000000069534	fmov	d8, #4.00000000
0000000000069538	fmov	d1, #10.00000000
000000000006953c	fcmp	d0, d1
0000000000069540	str	x27, [sp]
0000000000069544	b.gt	0x69558
0000000000069548	fmov	d8, #2.00000000
000000000006954c	fmov	d1, #5.00000000
0000000000069550	fcmp	d0, d1
0000000000069554	b.le	0x69604
0000000000069558	add	x0, sp, #0x10
000000000006955c	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000069560	fmov	d0, #1.00000000
0000000000069564	fdiv	d0, d0, d8
0000000000069568	add	x0, sp, #0x10
000000000006956c	fmov	d2, #1.00000000
0000000000069570	mov.16b	v1, v0
0000000000069574	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000069578	ldr	x2, [sp, #0xa8]
000000000006957c	ldr	x8, [x27]
0000000000069580	ldr	x8, [x8, #0x78]
0000000000069584	mov	x0, x27
0000000000069588	mov	w1, #0x0
000000000006958c	blr	x8
0000000000069590	ldr	x8, [x27]
0000000000069594	ldr	x8, [x8, #0x230]
0000000000069598	add	x1, sp, #0x10
000000000006959c	mov	x0, x27
00000000000695a0	blr	x8
00000000000695a4	ldur	d0, [x29, #-0xa0]
00000000000695a8	adrp	x8, 512 ; 0x269000
00000000000695ac	ldr	d11, [x8, #0xf18]
00000000000695b0	fdiv	d0, d0, d11
00000000000695b4	adrp	x8, 512 ; 0x269000
00000000000695b8	ldr	d1, [x8, #0xf20]
00000000000695bc	bl	0x252398 ; symbol stub for: _pow
00000000000695c0	adrp	x8, 512 ; 0x269000
00000000000695c4	ldr	d1, [x8, #0xf28]
00000000000695c8	fmul	d0, d0, d1
00000000000695cc	fdiv	d0, d0, d8
00000000000695d0	fdiv	d0, d0, d1
00000000000695d4	adrp	x8, 512 ; 0x269000
00000000000695d8	ldr	d1, [x8, #0xf30]
00000000000695dc	bl	0x252398 ; symbol stub for: _pow
00000000000695e0	fmul	d0, d0, d11
00000000000695e4	stur	d0, [x29, #-0xa0]
00000000000695e8	add	x0, sp, #0x10
00000000000695ec	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
00000000000695f0	mov	w24, #0x1
00000000000695f4	b	0x6960c
00000000000695f8	mov	x2, #0x0
00000000000695fc	mov	x22, #0x0
0000000000069600	b	0x69804
0000000000069604	mov	w24, #0x0
0000000000069608	fmov	d8, #1.00000000
000000000006960c	mov	w0, #0x1b0
0000000000069610	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000069614	mov	x25, x0
0000000000069618	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
000000000006961c	ldr	w8, [sp, #0xc]
0000000000069620	cmp	w8, #0x0
0000000000069624	cset	w1, eq
0000000000069628	ldur	d0, [x29, #-0xa0]
000000000006962c	fcvt	s0, d0
0000000000069630	ldp	d1, d2, [sp, #0xb0]
0000000000069634	fcvt	s1, d1
0000000000069638	fcvt	s2, d2
000000000006963c	mov	x0, x25
0000000000069640	mov	w2, #0x0
0000000000069644	mov	w3, #0x0
0000000000069648	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
000000000006964c	ldr	x8, [sp, #0xa8]
0000000000069650	cmp	w24, #0x0
0000000000069654	csel	x2, x27, x8, ne
0000000000069658	ldr	x8, [x25]
000000000006965c	ldr	x8, [x8, #0x78]
0000000000069660	mov	x0, x25
0000000000069664	mov	w1, #0x0
0000000000069668	blr	x8
000000000006966c	mov	w0, #0x210
0000000000069670	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000069674	mov	x23, x0
0000000000069678	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
000000000006967c	cbz	w24, 0x696d0
0000000000069680	add	x0, sp, #0x10
0000000000069684	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000069688	add	x0, sp, #0x10
000000000006968c	fmov	d2, #1.00000000
0000000000069690	mov.16b	v0, v8
0000000000069694	mov.16b	v1, v8
0000000000069698	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
000000000006969c	ldr	x8, [x23]
00000000000696a0	ldr	x8, [x8, #0x78]
00000000000696a4	mov	x0, x23
00000000000696a8	mov	w1, #0x0
00000000000696ac	mov	x2, x25
00000000000696b0	blr	x8
00000000000696b4	ldr	x8, [x23]
00000000000696b8	ldr	x8, [x8, #0x230]
00000000000696bc	add	x1, sp, #0x10
00000000000696c0	mov	x0, x23
00000000000696c4	blr	x8
00000000000696c8	add	x0, sp, #0x10
00000000000696cc	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
00000000000696d0	mov	w0, #0x1a0
00000000000696d4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000696d8	mov	x26, x0
00000000000696dc	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
00000000000696e0	fcvt	d0, s10
00000000000696e4	fneg	s1, s10
00000000000696e8	fcvt	d1, s1
00000000000696ec	fmov	d2, #0.50000000
00000000000696f0	fmul	d1, d1, d2
00000000000696f4	fcvtzs	w0, d1
00000000000696f8	fcvt	d3, s9
00000000000696fc	fneg	s4, s9
0000000000069700	fcvt	d4, s4
0000000000069704	fmul	d2, d4, d2
0000000000069708	fcvtzs	w1, d2
000000000006970c	fadd	d0, d1, d0
0000000000069710	fcvtzs	w2, d0
0000000000069714	fadd	d0, d2, d3
0000000000069718	fcvtzs	w3, d0
000000000006971c	bl	0x250a48 ; symbol stub for: _HGRectMake4i
0000000000069720	mov	x28, x0
0000000000069724	mov	x27, x1
0000000000069728	ldr	x8, [x26]
000000000006972c	ldr	x8, [x8, #0x78]
0000000000069730	cmp	w24, #0x0
0000000000069734	csel	x2, x23, x25, ne
0000000000069738	mov	x0, x26
000000000006973c	mov	w1, #0x0
0000000000069740	blr	x8
0000000000069744	scvtf	s0, w28
0000000000069748	lsr	x8, x28, #32
000000000006974c	scvtf	s1, w8
0000000000069750	scvtf	s2, w27
0000000000069754	lsr	x8, x27, #32
0000000000069758	scvtf	s3, w8
000000000006975c	ldr	x8, [x26]
0000000000069760	ldr	x8, [x8, #0x60]
0000000000069764	mov	x0, x26
0000000000069768	mov	w1, #0x0
000000000006976c	blr	x8
0000000000069770	cmp	x22, x26
0000000000069774	b.eq	0x697a0
0000000000069778	cbz	x22, 0x6978c
000000000006977c	ldr	x8, [x22]
0000000000069780	ldr	x8, [x8, #0x18]
0000000000069784	mov	x0, x22
0000000000069788	blr	x8
000000000006978c	ldr	x8, [x26]
0000000000069790	ldr	x8, [x8, #0x10]
0000000000069794	mov	x22, x26
0000000000069798	mov	x0, x26
000000000006979c	blr	x8
00000000000697a0	ldr	x8, [x26]
00000000000697a4	ldr	x8, [x8, #0x18]
00000000000697a8	mov	x0, x26
00000000000697ac	blr	x8
00000000000697b0	ldr	x24, [sp]
00000000000697b4	cbz	x23, 0x697c8
00000000000697b8	ldr	x8, [x23]
00000000000697bc	ldr	x8, [x8, #0x18]
00000000000697c0	mov	x0, x23
00000000000697c4	blr	x8
00000000000697c8	ldr	x8, [x25]
00000000000697cc	ldr	x8, [x8, #0x18]
00000000000697d0	mov	x0, x25
00000000000697d4	blr	x8
00000000000697d8	cbz	x24, 0x697ec
00000000000697dc	ldr	x8, [x24]
00000000000697e0	ldr	x8, [x8, #0x18]
00000000000697e4	mov	x0, x24
00000000000697e8	blr	x8
00000000000697ec	ldr	x0, [sp, #0xa8]
00000000000697f0	cbz	x0, 0x69800
00000000000697f4	ldr	x8, [x0]
00000000000697f8	ldr	x8, [x8, #0x18]
00000000000697fc	blr	x8
0000000000069800	ldr	x2, [sp, #0xc0]
0000000000069804	ldr	x8, [x19]
0000000000069808	ldr	x8, [x8, #0x78]
000000000006980c	mov	x0, x19
0000000000069810	mov	w1, #0x0
0000000000069814	blr	x8
0000000000069818	ldr	x8, [x19]
000000000006981c	ldr	x8, [x8, #0x78]
0000000000069820	mov	x0, x19
0000000000069824	mov	w1, #0x1
0000000000069828	mov	x2, x22
000000000006982c	blr	x8
0000000000069830	str	x19, [sp, #0x10]
0000000000069834	ldr	x8, [x19]
0000000000069838	ldr	x8, [x8, #0x10]
000000000006983c	mov	x0, x19
0000000000069840	blr	x8
0000000000069844	add	x2, sp, #0x10
0000000000069848	mov	x0, x21
000000000006984c	bl	"_objc_msgSend$setHeliumRef:"
0000000000069850	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm5 : FloatSlider
    parm6 : PointParameter
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm7 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm5 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm7 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  (constant / computed / multi-pass — read the disasm)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  parm7 (bool)
```
