# Zoom Blur

- **PAE class:** `Zoom Blur`
- **Plugin UUID:** `11C0E095-5F4F-46E2-AE28-F56ED7D38D7E`
- **Node names in corpus:** Zoom Blur (67), Zoom Blur 2 (6), Zoom Blur 3 (2), Zoom Blur 1 (2)
- **Corpus usage:** 58 files, 77 instances

## What it does

Zoom Blur streaks the image radially from a Center point (a dolly-zoom / speed-warp blur), optionally adding a rotational Swirl. Amount sets the streak length. Implemented in TS (shares the directional-blur module's radial mode).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 2 | 0 .. 50 | Length/strength of the radial streak, 0-50. 0 = no blur. Heavily keyframed for punch-in bursts. *(keyframed in 36 instances)* |
| Swirl | float | 0 | -0.03 .. 1 | Adds a rotational component to the zoom, -0.03..1. 0 = pure radial zoom; positive = spiral streaks. |
| Center | point2D | - | - | Focus point the blur streaks away from (X,Y) in normalized frame coordinates. |
| Look | bool/enum | 0 | 0 .. 1 | Selects a blur look/quality variant. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the streaked result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 10 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/directional-blur.ts`](../../engine/src/compositor/filters/directional-blur.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPolarToRect`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPolarToRect` → [`HgcPolarToRect.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPolarToRect.metal)

```metal
//Metal1.0     
//LEN=0000000594
[[ visible ]] FragmentOut HgcPolarToRect_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[3].xy + hg_Params[2].xy;
    r1.x = r0.x*hg_Params[0].x;
    r1.y = cos(r1.x);
    r1.zw = hg_Params[2].xy + hg_Params[2].xy;
    r1.x = sin(r1.x);
    r1.xy = r0.yy*r1.xy + hg_Params[1].xy;
    r0.zw = r1.xy/r1.zw;
    r2.xy = fract(r0.zw);
    r2.xy = r1.zw*r2.xy;
    r0.xy = floor(r0.zw);
    r0.zw = r0.xy*c0.zz;
    r0.zw = floor(r0.zw);
    r0.xy = -r0.zw*c0.xx + r0.xy;
    r1.zw = r1.zw - r2.xy;
    r1.zw = mix(r2.xy, r1.zw, fabs(r0.xy));
    r0.z = abs(hg_Params[5].z);
    r1.xy = select(r1.zw, r1.xy, -r0.zz < 0.00000f);
    r0.xy = r1.zw - r1.xy;
    r0.xy = float2(c0.zz < fabs(r0.xy));
    r0.z = float(-r0.z >= c0.y);
    r0.x = fmax(r0.x, r0.y);
    r0.y = float(-r0.z >= c0.y);
    r0.x = fmin(r0.y, r0.x);
    r1.xy = select(r1.xy, r1.zw, -r0.xx < 0.00000f);
    r1.xy = r1.xy - hg_Params[2].xy;
    r1.xy = r1.xy*hg_Params[4].xy;
    r1.xy = r1.xy + hg_Params[6].xy;
    r1.xy = r1.xy*hg_Params[6].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    output.color0 = select(r1, c0.yyyy, -r0.xxxx < 0.00000f);
    return output;
}
```

### Metal fragment shader — `HgcRectToPolar`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRectToPolar` → [`HgcRectToPolar.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRectToPolar.metal)

```metal
//Metal1.0     
//LEN=00000006a7
[[ visible ]] FragmentOut HgcRectToPolar_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.01348046958, 0.05747731403, 0.000000000, -0.1212390736);
    const float4 c1 = float4(0.1956359297, -0.3329946101, 0.9999956489, 1.570796371);
    const float4 c2 = float4(6.283185482, 3.141592741, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[4].xy;
    r0.zw = c0.zz;
    r0 = r0 + hg_Params[6];
    r0 = r0 - hg_Params[1];
    r1.xy = abs(r0.xy);
    r1.z = fmax(r1.x, r1.y);
    r1.w = 1.00000f / r1.z;
    r1.z = fmin(r1.x, r1.y);
    r1.z = r1.z*r1.w;
    r1.w = r1.z*r1.z;
    r2.x = r1.w*c0.x + c0.y;
    r2.x = r2.x*r1.w + c0.w;
    r2.x = r2.x*r1.w + c1.x;
    r2.x = r2.x*r1.w + c1.y;
    r1.w = r2.x*r1.w + c1.z;
    r1.z = r1.w*r1.z;
    r1.x = r1.y - r1.x;
    r1.w = -r1.z + c1.w;
    r1.x = select(r1.z, r1.w, r1.x < 0.00000f);
    r1.y = -r1.x + c2.y;
    r1.x = select(r1.x, r1.y, r0.y < 0.00000f);
    r1.x = select(r1.x, -r1.x, r0.x < 0.00000f);
    r0.x = dot(r0, r0);
    r1.y = r1.x + c2.x;
    r1.x = select(r1.x, r1.y, r1.x < 0.00000f);
    r1.x = r1.x*hg_Params[0].x;
    r1.y = float(r1.x < hg_Params[6].x);
    r0.y = select(r1.x, hg_Params[2].y, -r1.y < 0.00000f);
    r0.w = sqrt(r0.x);
    r0.z = select(r0.y, r1.x, hg_Params[3].z < 0.00000f);
    r0.xy = r0.zw - hg_Params[6].xy;
    r0.xy = r0.xy*hg_Params[5].xy;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEZoomBlur canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEZoomBlur`

```asm
0000000000075790	mov	w3, #0x1
0000000000075794	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000075798	ldur	d0, [x29, #-0x78]
000000000007579c	fcmp	d0, #0.0
00000000000757a0	b.ne	0x757c0
00000000000757a4	cbz	x24, 0x75964
00000000000757a8	add	x8, sp, #0xc0
00000000000757ac	mov	x0, x24
00000000000757b0	bl	_objc_msgSend$heliumRef
00000000000757b4	b	0x75968
00000000000757b8	mov	w20, #0x0
00000000000757bc	b	0x7598c
00000000000757c0	ldr	x4, [x20]
00000000000757c4	sub	x2, x29, #0x80
00000000000757c8	mov	x0, x21
00000000000757cc	mov	w3, #0x4
00000000000757d0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000757d4	ldur	d0, [x29, #-0x80]
00000000000757d8	adrp	x8, 499 ; 0x268000
00000000000757dc	ldr	d1, [x8, #0xdd8]
00000000000757e0	fmul	d0, d0, d1
00000000000757e4	fmov	d1, #0.50000000
00000000000757e8	fmul	d0, d0, d1
00000000000757ec	adrp	x8, 499 ; 0x268000
00000000000757f0	ldr	d1, [x8, #0xd50]
00000000000757f4	fadd	d0, d0, d1
00000000000757f8	stur	d0, [x29, #-0x80]
00000000000757fc	mov	x8, #0x3fe0000000000000
0000000000075800	stp	x8, x8, [x29, #-0x90]
0000000000075804	ldr	x5, [x20]
0000000000075808	sub	x2, x29, #0x88
000000000007580c	sub	x3, x29, #0x90
0000000000075810	mov	x0, x21
0000000000075814	mov	w4, #0x2
0000000000075818	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000007581c	ldur	d9, [x29, #-0x88]
0000000000075820	mov	x0, x24
0000000000075824	bl	_objc_msgSend$width
0000000000075828	ucvtf	d0, x0
000000000007582c	fmul	d9, d9, d0
0000000000075830	mov	x0, x24
0000000000075834	bl	_objc_msgSend$width
0000000000075838	ucvtf	d0, x0, #0x1
000000000007583c	fsub	d0, d9, d0
0000000000075840	fcvt	s9, d0
0000000000075844	ldur	d10, [x29, #-0x90]
0000000000075848	mov	x0, x24
000000000007584c	bl	_objc_msgSend$height
0000000000075850	ucvtf	d0, x0
0000000000075854	fmul	d10, d10, d0
0000000000075858	mov	x0, x24
000000000007585c	bl	_objc_msgSend$height
0000000000075860	ucvtf	d0, x0, #0x1
0000000000075864	fsub	d0, d10, d0
0000000000075868	fcvt	s0, d0
000000000007586c	fmul	s1, s9, s9
0000000000075870	fmul	s2, s0, s0
0000000000075874	fadd	s1, s1, s2
0000000000075878	fsqrt	s2, s1
000000000007587c	adrp	x8, 501 ; 0x26a000
0000000000075880	ldr	s1, [x8, #0x60]
0000000000075884	fcmp	s2, s1
0000000000075888	b.le	0x758fc
000000000007588c	adrp	x8, 501 ; 0x26a000
0000000000075890	ldr	s3, [x8, #0x64]
0000000000075894	fcmp	s2, s3
0000000000075898	b.mi	0x758a4
000000000007589c	fdiv	s9, s9, s2
00000000000758a0	fdiv	s0, s0, s2
00000000000758a4	fmul	s2, s9, s1
00000000000758a8	fmul	s9, s0, s1
00000000000758ac	fcvt	d10, s2
00000000000758b0	mov	x0, x24
00000000000758b4	bl	_objc_msgSend$width
00000000000758b8	ucvtf	d0, x0, #0x1
00000000000758bc	fadd	d10, d0, d10
00000000000758c0	mov	x0, x24
00000000000758c4	bl	_objc_msgSend$width
00000000000758c8	ucvtf	d0, x0
00000000000758cc	fdiv	d0, d10, d0
00000000000758d0	stur	d0, [x29, #-0x88]
00000000000758d4	fcvt	d9, s9
00000000000758d8	mov	x0, x24
00000000000758dc	bl	_objc_msgSend$height
00000000000758e0	ucvtf	d0, x0, #0x1
00000000000758e4	fadd	d9, d0, d9
00000000000758e8	mov	x0, x24
00000000000758ec	bl	_objc_msgSend$height
00000000000758f0	ucvtf	d0, x0
00000000000758f4	fdiv	d0, d9, d0
00000000000758f8	stur	d0, [x29, #-0x90]
00000000000758fc	ldr	x4, [x20]
0000000000075900	sub	x2, x29, #0x91
0000000000075904	mov	x0, x21
0000000000075908	mov	w3, #0x3
000000000007590c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000075910	stur	wzr, [x29, #-0x98]
0000000000075914	ldr	x4, [x20]
0000000000075918	sub	x2, x29, #0x98
000000000007591c	mov	x0, x21
0000000000075920	mov	w3, #0x5
0000000000075924	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000075928	mov	x0, x24
000000000007592c	bl	_objc_msgSend$imageType
0000000000075930	mov	x21, x0
0000000000075934	ldr	x2, [x20]
0000000000075938	mov	x0, x23
000000000007593c	bl	"_objc_msgSend$getRenderMode:"
0000000000075940	cmp	w0, #0x0
0000000000075944	ccmp	x21, #0x3, #0x0, ne
0000000000075948	cset	w20, eq
000000000007594c	b.ne	0x7598c
0000000000075950	cbz	x24, 0x759b8
0000000000075954	sub	x8, x29, #0xa0
0000000000075958	mov	x0, x24
000000000007595c	bl	_objc_msgSend$heliumRef
0000000000075960	b	0x759bc
0000000000075964	str	xzr, [sp, #0xc0]
0000000000075968	add	x2, sp, #0xc0
000000000007596c	mov	x0, x19
0000000000075970	bl	"_objc_msgSend$setHeliumRef:"
0000000000075974	ldr	x0, [sp, #0xc0]
0000000000075978	cbz	x0, 0x75988
000000000007597c	ldr	x8, [x0]
0000000000075980	ldr	x8, [x8, #0x18]
0000000000075984	blr	x8
0000000000075988	mov	w20, #0x1
000000000007598c	mov	x0, x20
0000000000075990	add	sp, sp, #0x200
0000000000075994	ldp	x29, x30, [sp, #0x70]
0000000000075998	ldp	x20, x19, [sp, #0x60]
000000000007599c	ldp	x22, x21, [sp, #0x50]
00000000000759a0	ldp	x24, x23, [sp, #0x40]
00000000000759a4	ldp	x26, x25, [sp, #0x30]
00000000000759a8	ldp	x28, x27, [sp, #0x20]
00000000000759ac	ldp	d9, d8, [sp, #0x10]
00000000000759b0	ldp	d11, d10, [sp], #0x80
00000000000759b4	ret
00000000000759b8	stur	xzr, [x29, #-0xa0]
00000000000759bc	ldur	d0, [x29, #-0x78]
00000000000759c0	fcmp	d0, #0.0
00000000000759c4	b.ne	0x759d8
00000000000759c8	sub	x2, x29, #0xa0
00000000000759cc	mov	x0, x19
00000000000759d0	bl	"_objc_msgSend$setHeliumRef:"
00000000000759d4	b	0x75ebc
00000000000759d8	ldur	w8, [x29, #-0x98]
00000000000759dc	cmp	w8, #0x1
00000000000759e0	b.ne	0x75c6c
00000000000759e4	add	x8, sp, #0x150
00000000000759e8	mov	x0, x23
00000000000759ec	mov	x2, x19
00000000000759f0	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000759f4	add	x0, sp, #0xc0
00000000000759f8	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000759fc	add	x0, sp, #0xc0
0000000000075a00	fmov	d2, #1.00000000
0000000000075a04	mov.16b	v0, v8
0000000000075a08	mov.16b	v1, v8
0000000000075a0c	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000075a10	mov	w0, #0x210
0000000000075a14	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000075a18	mov	x21, x0
0000000000075a1c	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000075a20	ldr	x8, [x21]
0000000000075a24	ldr	x8, [x8, #0x230]
0000000000075a28	add	x1, sp, #0xc0
0000000000075a2c	mov	x0, x21
0000000000075a30	blr	x8
0000000000075a34	ldur	x2, [x29, #-0xa0]
0000000000075a38	ldr	x8, [x21]
0000000000075a3c	ldr	x8, [x8, #0x78]
0000000000075a40	mov	x0, x21
0000000000075a44	mov	w1, #0x0
0000000000075a48	blr	x8
0000000000075a4c	stp	x21, xzr, [sp, #0xb0]
0000000000075a50	ldr	x8, [x21]
0000000000075a54	ldr	x8, [x8, #0x10]
0000000000075a58	mov	x0, x21
0000000000075a5c	blr	x8
0000000000075a60	ldp	d1, d0, [x29, #-0x90]
0000000000075a64	add	x4, sp, #0xb0
0000000000075a68	add	x5, sp, #0xb8
0000000000075a6c	mov	x0, x23
0000000000075a70	mov	x2, x19
0000000000075a74	mov	x3, x24
0000000000075a78	mov.16b	v2, v8
0000000000075a7c	bl	"_objc_msgSend$polarToRect:withInputImage:withInputNode:centerX:centerY:upscaleFactor:andOutputNode:"
0000000000075a80	ldr	x0, [sp, #0xb0]
0000000000075a84	cbz	x0, 0x75a94
0000000000075a88	ldr	x8, [x0]
0000000000075a8c	ldr	x8, [x8, #0x18]
0000000000075a90	blr	x8
0000000000075a94	mov	w0, #0x1b0
0000000000075a98	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000075a9c	mov	x22, x0
0000000000075aa0	bl	__ZN16HDirectionalBlurC1Ev
0000000000075aa4	cbz	x22, 0x75ab8
0000000000075aa8	ldr	x8, [x22]
0000000000075aac	ldr	x8, [x8, #0x10]
0000000000075ab0	mov	x0, x22
0000000000075ab4	blr	x8
0000000000075ab8	ldp	d1, d0, [x29, #-0x80]
0000000000075abc	fmul	d0, d8, d0
0000000000075ac0	fcvt	s0, d0
0000000000075ac4	fcvt	s1, d1
0000000000075ac8	fmov	d3, #1.00000000
0000000000075acc	ldr	d2, [sp, #0x150]
0000000000075ad0	ldr	d4, [sp, #0x178]
0000000000075ad4	fdiv	d2, d3, d2
0000000000075ad8	fcvt	s2, d2
0000000000075adc	fabs	d4, d4
0000000000075ae0	fdiv	d3, d3, d4
0000000000075ae4	fcvt	s3, d3
0000000000075ae8	mov	x0, x22
0000000000075aec	bl	__ZN16HDirectionalBlur4initEffff
0000000000075af0	ldr	x2, [sp, #0xb8]
0000000000075af4	ldr	x8, [x22]
0000000000075af8	ldr	x8, [x8, #0x78]
0000000000075afc	mov	x0, x22
0000000000075b00	mov	w1, #0x0
0000000000075b04	blr	x8
0000000000075b08	stp	x22, xzr, [sp, #0xa0]
0000000000075b0c	ldr	x8, [x22]
0000000000075b10	ldr	x8, [x8, #0x10]
0000000000075b14	mov	x0, x22
0000000000075b18	blr	x8
0000000000075b1c	ldp	d1, d0, [x29, #-0x90]
0000000000075b20	add	x4, sp, #0xa0
0000000000075b24	add	x5, sp, #0xa8
0000000000075b28	mov	x0, x23
0000000000075b2c	mov	x2, x19
0000000000075b30	mov	x3, x24
0000000000075b34	mov.16b	v2, v8
0000000000075b38	bl	"_objc_msgSend$rectToPolar:withInputImage:withInputNode:centerX:centerY:upscaleFactor:andOutputNode:"
0000000000075b3c	ldr	x0, [sp, #0xa0]
0000000000075b40	cbz	x0, 0x75b50
0000000000075b44	ldr	x8, [x0]
0000000000075b48	ldr	x8, [x8, #0x18]
0000000000075b4c	blr	x8
0000000000075b50	add	x0, sp, #0x10
0000000000075b54	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000075b58	fmov	d0, #1.00000000
0000000000075b5c	fdiv	d0, d0, d8
0000000000075b60	add	x0, sp, #0x10
0000000000075b64	fmov	d2, #1.00000000
0000000000075b68	mov.16b	v1, v0
0000000000075b6c	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000075b70	mov	w0, #0x210
0000000000075b74	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000075b78	mov	x23, x0
0000000000075b7c	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000075b80	ldr	x8, [x23]
0000000000075b84	ldr	x8, [x8, #0x230]
0000000000075b88	add	x1, sp, #0x10
0000000000075b8c	mov	x0, x23
0000000000075b90	blr	x8
0000000000075b94	ldr	x2, [sp, #0xa8]
0000000000075b98	ldr	x8, [x23]
0000000000075b9c	ldr	x8, [x8, #0x78]
0000000000075ba0	mov	x0, x23
0000000000075ba4	mov	w1, #0x0
0000000000075ba8	blr	x8
0000000000075bac	ldurb	w8, [x29, #-0x91]
0000000000075bb0	cmp	w8, #0x1
0000000000075bb4	b.ne	0x75d20
0000000000075bb8	mov	x0, x19
0000000000075bbc	bl	_objc_msgSend$width
0000000000075bc0	mov	x25, x0
0000000000075bc4	mov	x0, x19
0000000000075bc8	bl	_objc_msgSend$height
0000000000075bcc	mov	x26, x0
0000000000075bd0	mov	w0, #0x1a0
0000000000075bd4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000075bd8	mov	x24, x0
0000000000075bdc	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000075be0	ldr	x8, [x24]
0000000000075be4	ldr	x8, [x8, #0x78]
0000000000075be8	mov	x0, x24
0000000000075bec	mov	w1, #0x0
0000000000075bf0	mov	x2, x23
0000000000075bf4	blr	x8
0000000000075bf8	ucvtf	d0, x25, #0x1
0000000000075bfc	ucvtf	d1, x26, #0x1
0000000000075c00	fcvt	s2, d0
0000000000075c04	fneg	s0, s2
0000000000075c08	fcvt	s3, d1
0000000000075c0c	fneg	s1, s3
0000000000075c10	ldr	x8, [x24]
0000000000075c14	ldr	x8, [x8, #0x60]
0000000000075c18	mov	x0, x24
0000000000075c1c	mov	w1, #0x0
0000000000075c20	blr	x8
0000000000075c24	str	x24, [sp, #0x8]
0000000000075c28	ldr	x8, [x24]
0000000000075c2c	ldr	x8, [x8, #0x10]
0000000000075c30	mov	x0, x24
0000000000075c34	blr	x8
0000000000075c38	add	x2, sp, #0x8
0000000000075c3c	mov	x0, x19
0000000000075c40	bl	"_objc_msgSend$setHeliumRef:"
0000000000075c44	ldr	x0, [sp, #0x8]
0000000000075c48	cbz	x0, 0x75c58
0000000000075c4c	ldr	x8, [x0]
0000000000075c50	ldr	x8, [x8, #0x18]
0000000000075c54	blr	x8
0000000000075c58	ldr	x8, [x24]
0000000000075c5c	ldr	x8, [x8, #0x18]
0000000000075c60	mov	x0, x24
0000000000075c64	blr	x8
0000000000075c68	b	0x75d54
0000000000075c6c	add	x8, sp, #0xc0
0000000000075c70	mov	x0, x23
0000000000075c74	mov	x2, x24
0000000000075c78	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000075c7c	ldur	d9, [x29, #-0x88]
0000000000075c80	mov	x0, x24
0000000000075c84	bl	_objc_msgSend$width
0000000000075c88	fmov	d8, #-0.50000000
0000000000075c8c	fadd	d0, d9, d8
0000000000075c90	ucvtf	d1, x0
0000000000075c94	fmul	d0, d0, d1
0000000000075c98	stur	d0, [x29, #-0x88]
0000000000075c9c	ldur	d9, [x29, #-0x90]
0000000000075ca0	mov	x0, x24
0000000000075ca4	bl	_objc_msgSend$height
0000000000075ca8	fadd	d0, d9, d8
0000000000075cac	ucvtf	d1, x0
0000000000075cb0	fmul	d2, d0, d1
0000000000075cb4	stur	d2, [x29, #-0x90]
0000000000075cb8	ldur	d0, [x29, #-0x78]
0000000000075cbc	fcvt	s0, d0
0000000000075cc0	ldur	d1, [x29, #-0x88]
0000000000075cc4	fcvt	s1, d1
0000000000075cc8	fcvt	s2, d2
0000000000075ccc	add	x8, sp, #0x150
0000000000075cd0	sub	x0, x29, #0xa0
0000000000075cd4	bl	__ZN9HZoomBlur8makeZoomERK5HGRefI6HGNodeEfff
0000000000075cd8	mov	x0, x19
0000000000075cdc	bl	_objc_msgSend$width
0000000000075ce0	str	x0, [sp, #0xb8]
0000000000075ce4	mov	x0, x19
0000000000075ce8	bl	_objc_msgSend$height
0000000000075cec	str	x0, [sp, #0xa8]
0000000000075cf0	ldurb	w8, [x29, #-0x91]
0000000000075cf4	tbnz	w8, #0x0, 0x75d0c
0000000000075cf8	ldr	x8, [sp, #0xb8]
0000000000075cfc	lsl	x8, x8, #1
0000000000075d00	str	x8, [sp, #0xb8]
0000000000075d04	lsl	x8, x0, #1
0000000000075d08	str	x8, [sp, #0xa8]
0000000000075d0c	cbz	x24, 0x75dd0
0000000000075d10	add	x8, sp, #0x10
0000000000075d14	mov	x0, x24
0000000000075d18	bl	_objc_msgSend$imageInfo
0000000000075d1c	b	0x75de0
0000000000075d20	str	x23, [sp, #0x8]
0000000000075d24	ldr	x8, [x23]
0000000000075d28	ldr	x8, [x8, #0x10]
0000000000075d2c	mov	x0, x23
0000000000075d30	blr	x8
0000000000075d34	add	x2, sp, #0x8
0000000000075d38	mov	x0, x19
0000000000075d3c	bl	"_objc_msgSend$setHeliumRef:"
0000000000075d40	ldr	x0, [sp, #0x8]
0000000000075d44	cbz	x0, 0x75d54
0000000000075d48	ldr	x8, [x0]
0000000000075d4c	ldr	x8, [x8, #0x18]
0000000000075d50	blr	x8
0000000000075d54	ldr	x8, [x23]
0000000000075d58	ldr	x8, [x8, #0x18]
0000000000075d5c	mov	x0, x23
0000000000075d60	blr	x8
0000000000075d64	add	x0, sp, #0x10
0000000000075d68	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000075d6c	ldr	x0, [sp, #0xa8]
0000000000075d70	cbz	x0, 0x75d80
0000000000075d74	ldr	x8, [x0]
0000000000075d78	ldr	x8, [x8, #0x18]
0000000000075d7c	blr	x8
0000000000075d80	ldr	x8, [x22]
0000000000075d84	ldr	x8, [x8, #0x18]
0000000000075d88	mov	x0, x22
0000000000075d8c	blr	x8
0000000000075d90	ldr	x8, [x22]
0000000000075d94	ldr	x8, [x8, #0x18]
0000000000075d98	mov	x0, x22
0000000000075d9c	blr	x8
0000000000075da0	ldr	x0, [sp, #0xb8]
0000000000075da4	cbz	x0, 0x75db4
0000000000075da8	ldr	x8, [x0]
0000000000075dac	ldr	x8, [x8, #0x18]
0000000000075db0	blr	x8
0000000000075db4	ldr	x8, [x21]
0000000000075db8	ldr	x8, [x8, #0x18]
0000000000075dbc	mov	x0, x21
0000000000075dc0	blr	x8
0000000000075dc4	add	x0, sp, #0xc0
0000000000075dc8	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000075dcc	b	0x75ebc
0000000000075dd0	str	xzr, [sp, #0x50]
0000000000075dd4	movi.2d	v0, #0000000000000000
0000000000075dd8	stp	q0, q0, [sp, #0x30]
0000000000075ddc	stp	q0, q0, [sp, #0x10]
0000000000075de0	add	x2, sp, #0xb8
0000000000075de4	add	x3, sp, #0xa8
0000000000075de8	add	x4, sp, #0x10
0000000000075dec	mov	x0, x23
0000000000075df0	bl	"_objc_msgSend$constrainWidth:andHeight:withImageInfo:"
0000000000075df4	ldr	d9, [sp, #0xb8]
0000000000075df8	ldr	d8, [sp, #0xa8]
0000000000075dfc	mov	w0, #0x1a0
0000000000075e00	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000075e04	mov	x21, x0
0000000000075e08	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000075e0c	ldr	x2, [sp, #0x150]
0000000000075e10	ldr	x8, [x21]
0000000000075e14	ldr	x8, [x8, #0x78]
0000000000075e18	mov	x0, x21
0000000000075e1c	mov	w1, #0x0
0000000000075e20	blr	x8
0000000000075e24	ucvtf	d0, d9
0000000000075e28	fmov	d1, #0.50000000
0000000000075e2c	fmul	d0, d0, d1
0000000000075e30	ucvtf	d2, d8
0000000000075e34	fmul	d1, d2, d1
0000000000075e38	fcvt	s2, d0
0000000000075e3c	fneg	s0, s2
0000000000075e40	fcvt	s3, d1
0000000000075e44	fneg	s1, s3
0000000000075e48	ldr	x8, [x21]
0000000000075e4c	ldr	x8, [x8, #0x60]
0000000000075e50	mov	x0, x21
0000000000075e54	mov	w1, #0x0
0000000000075e58	blr	x8
0000000000075e5c	ldr	x0, [sp, #0x150]
0000000000075e60	cmp	x0, x21
0000000000075e64	b.eq	0x75e8c
0000000000075e68	cbz	x0, 0x75e78
0000000000075e6c	ldr	x8, [x0]
0000000000075e70	ldr	x8, [x8, #0x18]
0000000000075e74	blr	x8
0000000000075e78	str	x21, [sp, #0x150]
0000000000075e7c	ldr	x8, [x21]
0000000000075e80	ldr	x8, [x8, #0x10]
0000000000075e84	mov	x0, x21
0000000000075e88	blr	x8
0000000000075e8c	add	x2, sp, #0x150
0000000000075e90	mov	x0, x19
0000000000075e94	bl	"_objc_msgSend$setHeliumRef:"
0000000000075e98	ldr	x8, [x21]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm4 (float)
    - parm3 (bool)
    - parm5 (int)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm5 (int)
    slot 0  <-  parm5 (int)
```
