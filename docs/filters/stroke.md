# Stroke

- **PAE class:** `Stroke`
- **Plugin UUID:** `0CB21C8A-7983-418D-B7EC-EDBB20AF4732`
- **Node names in corpus:** Stroke (60), Outline (6), Stroke copy (5), s (1)
- **Corpus usage:** 61 files, 72 instances

## What it does

Stroke draws an outline around the alpha edge of a layer, with a chosen Width, Color (or Gradient), and Position (inside/outside/center of the edge), plus fade controls to feather it. It is the standard edge-outline effect for titles and shapes. Not implemented; described from the standard Motion "Stroke".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Stroke" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Stroke Type | enum(int) | 0 | 0 .. 2 | Fill type of the stroke, 0-2 (e.g. color vs gradient vs texture). |
| Color | color | - | - | Stroke color (nested Red/Green/Blue/Opacity). |
| Gradient | group | - | - | Stroke gradient (RGB stops, Opacity, Start/End) when Stroke Type is gradient. |
| Width | float (pixels) | 10 | 1 .. 300 | Thickness of the outline in pixels, 1-300 (default 10). |
| Position | enum(int) | 0 | 0 .. 2 | Where the stroke sits relative to the alpha edge, 0-2 (inside / center / outside). |
| Offset | float (pixels) | 0 | -12 .. 40 | Shifts the stroke in/out from the edge, -12..40. *(keyframed in 1 instance)* |
| Threshold | float | 0.5001 | 0 .. 1 | Alpha threshold that defines the edge to stroke, 0-1. |
| Fade Inside | float | 0 | 0 .. 1 | Feather of the stroke's inner edge, 0-1. |
| Fade Outside | float | 0 | 0 .. 1 | Feather of the stroke's outer edge, 0-1. |
| Fade Width | float | 1 | 0 .. 1 | Overall feather width, 0-1. |
| Fade Falloff | float | 0 | -100 .. 100 | Curve of the fade, -100..100. |
| Hide Source | bool | 0 | 0 .. 1 | Toggle: show only the stroke, hiding the original layer content. |
| Blend Mode | enum(int) | 0 | 0 .. 16 | How the stroke composites, 0-16. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the stroked result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcColorAndGradientStroke`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcColorAndGradientStroke` → [`HgcColorAndGradientStroke.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorAndGradientStroke.metal)

```metal
//Metal1.0     
//LEN=0000000622
[[ visible ]] FragmentOut HgcColorAndGradientStroke_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = color0.x;
    r0.y = float(hg_Params[0].x < r0.x);
    r0.w = float(hg_Params[0].y >= r0.x);
    r0.w = fmin(r0.y, r0.w);
    r0.z = hg_Params[0].y - hg_Params[0].x;
    r0.y = r0.z*hg_Params[0].w;
    r1 = color1;
    r1 = select(c0.xxxx, r1, -r0.wwww < 0.00000f);
    r0.z = r0.z + r0.y;
    r0.w = r0.y + hg_Params[0].y;
    r0.w = -r0.z*hg_Params[1].x + r0.w;
    r2.x = hg_Params[0].x - r0.y;
    r0.z = r0.z*hg_Params[1].y + r2.x;
    r2.xy = float2(r0.zx >= r0.xw);
    r2.x = fmax(r2.x, r2.y);
    r2.z = r0.x - r0.z;
    r2.y = 1.00000f / r0.y;
    r2.w = r2.z*r2.y;
    r2.z = select(r1.w, c0.x, -r2.x < 0.00000f);
    r1.w = r0.w - r0.y;
    r0.y = r0.z + r0.y;
    r3.x = float(r0.x < r1.w);
    r0.z = float(r0.y < r0.x);
    r0.w = r0.w - r0.x;
    r0.z = fmin(r0.z, r3.x);
    r0.y = float(r0.y >= r0.x);
    r1.w = float(r0.x >= r1.w);
    r2.w = r2.z*r2.w;
    r2.x = float(-r2.x >= c0.x);
    r0.z = float(-r0.z >= c0.x);
    r0.zw = r2.xy*r0.zw;
    r0.y = fmin(r0.z, r0.y);
    r0.y = select(r2.z, r2.w, -r0.y < 0.00000f);
    r0.x = r0.y*r0.w;
    r1.w = fmin(r0.z, r1.w);
    r1.w = select(r0.y, r0.x, -r1.w < 0.00000f);
    r1.w = pow(r1.w, hg_Params[0].z);
    r1.xyz = r1.xyz*r1.www;
    output.color0 = r1;
    return output;
}
```

### Metal fragment shader — `HgcOutlineGradientStroke`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcOutlineGradientStroke` → [`HgcOutlineGradientStroke.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcOutlineGradientStroke.metal)

```metal
//Metal1.0     
//LEN=0000000730
[[ visible ]] FragmentOut HgcOutlineGradientStroke_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1)
{
    const float4 c0 = float4(0.000000000, 0.5000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = color0.x;
    r0.z = hg_Params[0].y - hg_Params[0].x;
    r1.x = r0.x - hg_Params[0].x;
    r1.x = clamp(r1.x/r0.z, 0.00000f, 1.00000f);
    r0.y = float(hg_Params[0].x < r0.x);
    r0.w = float(hg_Params[0].y >= r0.x);
    r0.w = fmin(r0.y, r0.w);
    r0.y = r0.z*hg_Params[0].w;
    r1.x = r0.z*r1.x;
    r1.y = c0.y;
    r1.xy = r1.xy + hg_Params[2].xy;
    r1.xy = r1.xy*hg_Params[2].zw;
    r1 = hg_Texture1.sample(hg_Sampler1, r1.xy);
    r1 = select(c0.xxxx, r1, -r0.wwww < 0.00000f);
    r0.z = r0.z + r0.y;
    r0.w = r0.y + hg_Params[0].y;
    r0.w = -r0.z*hg_Params[1].x + r0.w;
    r2.x = hg_Params[0].x - r0.y;
    r0.z = r0.z*hg_Params[1].y + r2.x;
    r2.xy = float2(r0.zx >= r0.xw);
    r2.x = fmax(r2.x, r2.y);
    r2.z = r0.x - r0.z;
    r2.y = 1.00000f / r0.y;
    r2.w = r2.z*r2.y;
    r2.z = select(r1.w, c0.x, -r2.x < 0.00000f);
    r1.w = r0.w - r0.y;
    r0.y = r0.z + r0.y;
    r3.x = float(r0.x < r1.w);
    r0.z = float(r0.y < r0.x);
    r0.w = r0.w - r0.x;
    r0.z = fmin(r0.z, r3.x);
    r0.y = float(r0.y >= r0.x);
    r1.w = float(r0.x >= r1.w);
    r2.w = r2.z*r2.w;
    r2.x = float(-r2.x >= c0.x);
    r0.z = float(-r0.z >= c0.x);
    r0.zw = r2.xy*r0.zw;
    r0.y = fmin(r0.z, r0.y);
    r0.y = select(r2.z, r2.w, -r0.y < 0.00000f);
    r0.x = r0.y*r0.w;
    r1.w = fmin(r0.z, r1.w);
    r1.w = select(r0.y, r0.x, -r1.w < 0.00000f);
    r1.w = pow(r1.w, hg_Params[0].z);
    r1.xyz = r1.xyz*r1.www;
    output.color0 = r1;
    return output;
}
```

### Metal fragment shader — `HgcReconstructDT`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcReconstructDT` → [`HgcReconstructDT.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcReconstructDT.metal)

```metal
//Metal1.0     
//LEN=00000001a4
[[ visible ]] FragmentOut HgcReconstructDT_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0.x = color0.x;
    r0.x = r0.x*hg_Params[0].x;
    output.color0.xyz = r0.xxx;
    output.color0.w = float(-fabs(r0.x) < c0.w);
    return output;
}
```

### Metal fragment shader — `HgcSimpleAdd`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSimpleAdd` → [`HgcSimpleAdd.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSimpleAdd.metal)

```metal
//Metal1.0     
//LEN=000000011e
[[ visible ]] FragmentOut HgcSimpleAdd_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    output.color0 = r1 + r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEStroke canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEStroke`

```asm
00000000000033e0	mov	w3, #0x1
00000000000033e4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000033e8	ldr	x7, [x28]
00000000000033ec	sub	x2, x29, #0xa8
00000000000033f0	sub	x3, x29, #0xb0
00000000000033f4	sub	x4, x29, #0xb8
00000000000033f8	sub	x5, x29, #0xc0
00000000000033fc	mov	x0, x24
0000000000003400	mov	w6, #0x2
0000000000003404	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:alphaValue:fromParm:atFxTime:"
0000000000003408	ldr	x8, [x28]
000000000000340c	str	x8, [sp]
0000000000003410	sub	x2, x29, #0xc8
0000000000003414	sub	x3, x29, #0xd0
0000000000003418	sub	x4, x29, #0xd8
000000000000341c	sub	x5, x29, #0xe0
0000000000003420	sub	x6, x29, #0xe4
0000000000003424	mov	x0, x24
0000000000003428	mov	w7, #0x3
000000000000342c	bl	"_objc_msgSend$getGradientStartEnd:startY:endX:endY:type:fromParm:atFxTime:"
0000000000003430	ldr	x4, [x28]
0000000000003434	sub	x2, x29, #0xf0
0000000000003438	mov	x0, x24
000000000000343c	mov	w3, #0x4
0000000000003440	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000003444	ldr	x4, [x28]
0000000000003448	sub	x2, x29, #0xf4
000000000000344c	mov	x0, x24
0000000000003450	mov	w3, #0x5
0000000000003454	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000003458	ldr	x4, [x28]
000000000000345c	sub	x2, x29, #0x100
0000000000003460	mov	x0, x24
0000000000003464	mov	w3, #0x6
0000000000003468	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000346c	ldr	x4, [x28]
0000000000003470	add	x2, sp, #0x288
0000000000003474	mov	x0, x24
0000000000003478	mov	w3, #0x7
000000000000347c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000003480	ldr	d0, [sp, #0x288]
0000000000003484	adrp	x8, 613 ; 0x268000
0000000000003488	ldr	d1, [x8, #0xc48]
000000000000348c	fmaxnm	d0, d0, d1
0000000000003490	adrp	x8, 613 ; 0x268000
0000000000003494	ldr	d1, [x8, #0xc80]
0000000000003498	fminnm	d0, d0, d1
000000000000349c	str	d0, [sp, #0x288]
00000000000034a0	ldr	x4, [x28]
00000000000034a4	add	x2, sp, #0x280
00000000000034a8	mov	x0, x24
00000000000034ac	mov	w3, #0x8
00000000000034b0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000034b4	ldr	x4, [x28]
00000000000034b8	add	x2, sp, #0x278
00000000000034bc	mov	x0, x24
00000000000034c0	mov	w3, #0x9
00000000000034c4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000034c8	ldr	x4, [x28]
00000000000034cc	add	x2, sp, #0x270
00000000000034d0	mov	x0, x24
00000000000034d4	mov	w3, #0xd
00000000000034d8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000034dc	ldr	x4, [x28]
00000000000034e0	add	x2, sp, #0x268
00000000000034e4	mov	x0, x24
00000000000034e8	mov	w3, #0xa
00000000000034ec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000034f0	ldr	x4, [x28]
00000000000034f4	add	x2, sp, #0x267
00000000000034f8	mov	x0, x24
00000000000034fc	mov	w3, #0xc
0000000000003500	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000003504	ldr	x4, [x28]
0000000000003508	add	x2, sp, #0x260
000000000000350c	mov	x0, x24
0000000000003510	mov	w3, #0xb
0000000000003514	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000003518	cbz	x19, 0x3544
000000000000351c	add	x8, sp, #0x258
0000000000003520	mov	x0, x19
0000000000003524	bl	_objc_msgSend$heliumRef
0000000000003528	ldr	x0, [sp, #0x258]
000000000000352c	str	x0, [sp, #0x250]
0000000000003530	cbz	x0, 0x354c
0000000000003534	ldr	x8, [x0]
0000000000003538	ldr	x8, [x8, #0x10]
000000000000353c	blr	x8
0000000000003540	b	0x354c
0000000000003544	str	xzr, [sp, #0x258]
0000000000003548	str	xzr, [sp, #0x250]
000000000000354c	add	x8, sp, #0x1d0
0000000000003550	mov	x0, x20
0000000000003554	ldr	x2, [sp, #0x28]
0000000000003558	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000000355c	add	x8, sp, #0x150
0000000000003560	mov	x0, x20
0000000000003564	mov	x2, x19
0000000000003568	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000000356c	add	x0, sp, #0xc0
0000000000003570	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000003574	ldr	d0, [sp, #0x1d0]
0000000000003578	ldr	d1, [sp, #0x1f8]
000000000000357c	add	x0, sp, #0xc0
0000000000003580	fmov	d2, #1.00000000
0000000000003584	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000003588	ldr	d0, [sp, #0x1e8]
000000000000358c	ldr	d1, [sp, #0x208]
0000000000003590	add	x0, sp, #0xc0
0000000000003594	movi.2d	v2, #0000000000000000
0000000000003598	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
000000000000359c	mov	w0, #0x210
00000000000035a0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000035a4	mov	x19, x0
00000000000035a8	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000035ac	ldr	x8, [x19]
00000000000035b0	ldr	x8, [x8, #0x230]
00000000000035b4	add	x1, sp, #0xc0
00000000000035b8	mov	x0, x19
00000000000035bc	blr	x8
00000000000035c0	ldr	x2, [sp, #0x258]
00000000000035c4	ldr	x8, [x19]
00000000000035c8	ldr	x8, [x8, #0x78]
00000000000035cc	mov	x0, x19
00000000000035d0	mov	w1, #0x0
00000000000035d4	blr	x8
00000000000035d8	ldr	x0, [sp, #0x250]
00000000000035dc	cmp	x0, x19
00000000000035e0	b.eq	0x3608
00000000000035e4	cbz	x0, 0x35f4
00000000000035e8	ldr	x8, [x0]
00000000000035ec	ldr	x8, [x8, #0x18]
00000000000035f0	blr	x8
00000000000035f4	str	x19, [sp, #0x250]
00000000000035f8	ldr	x8, [x19]
00000000000035fc	ldr	x8, [x8, #0x10]
0000000000003600	mov	x0, x19
0000000000003604	blr	x8
0000000000003608	ldur	w8, [x29, #-0xf4]
000000000000360c	ldur	d11, [x29, #-0xf0]
0000000000003610	fmov	d0, #-0.50000000
0000000000003614	fmul	d0, d11, d0
0000000000003618	fcvt	s0, d0
000000000000361c	cmp	w8, #0x1
0000000000003620	movi.2d	v1, #0000000000000000
0000000000003624	fcsel	s0, s0, s1, eq
0000000000003628	fcvt	s2, d11
000000000000362c	fneg	s2, s2
0000000000003630	cmp	w8, #0x2
0000000000003634	fcsel	s0, s2, s0, eq
0000000000003638	fcvt	d0, s0
000000000000363c	ldur	d2, [x29, #-0x100]
0000000000003640	fadd	d0, d2, d0
0000000000003644	fcvt	s8, d0
0000000000003648	fcvt	d3, s8
000000000000364c	fadd	d0, d11, d3
0000000000003650	fcvt	s2, d0
0000000000003654	fmov	s0, #1.00000000
0000000000003658	fcmp	s2, s0
000000000000365c	fccmp	s2, s1, #0x4, mi
0000000000003660	fcsel	s9, s0, s2, gt
0000000000003664	fcmp	s9, #0.0
0000000000003668	b.ne	0x3694
000000000000366c	fcvt	d1, s9
0000000000003670	adrp	x8, 613 ; 0x268000
0000000000003674	ldr	d2, [x8, #0xc88]
0000000000003678	fadd	d1, d1, d2
000000000000367c	fcvt	s9, d1
0000000000003680	fadd	d1, d3, d2
0000000000003684	fcvt	s8, d1
0000000000003688	fcvt	d1, s8
000000000000368c	str	d1, [sp, #0x8]
0000000000003690	b	0x3698
0000000000003694	str	d3, [sp, #0x8]
0000000000003698	frintp	s1, s9
000000000000369c	fcmp	s1, s0
00000000000036a0	fcsel	s10, s0, s1, ls
00000000000036a4	mov	w0, #0x1b0
00000000000036a8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000036ac	fcvtzs	w20, s10
00000000000036b0	mov	x21, x0
00000000000036b4	mov	x1, x20
00000000000036b8	bl	__ZN10HMaskAlphaC1Ej
00000000000036bc	ldr	x8, [x21]
00000000000036c0	ldr	x8, [x8, #0x78]
00000000000036c4	mov	x0, x21
00000000000036c8	mov	w1, #0x0
00000000000036cc	mov	x2, x19
00000000000036d0	str	x21, [sp, #0x18]
00000000000036d4	blr	x8
00000000000036d8	ldr	d0, [sp, #0x288]
00000000000036dc	fcvt	s1, d0
00000000000036e0	ldr	x8, [x21]
00000000000036e4	ldr	x8, [x8, #0x60]
00000000000036e8	movi.2d	v0, #0000000000000000
00000000000036ec	movi.2d	v2, #0000000000000000
00000000000036f0	movi.2d	v3, #0000000000000000
00000000000036f4	mov	x0, x21
00000000000036f8	mov	w1, #0x0
00000000000036fc	blr	x8
0000000000003700	mov	w0, #0x1b0
0000000000003704	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003708	mov	x21, x0
000000000000370c	mov	x1, x20
0000000000003710	bl	__ZN10HMaskAlphaC1Ej
0000000000003714	ldr	x8, [x21]
0000000000003718	ldr	x8, [x8, #0x78]
000000000000371c	mov	x0, x21
0000000000003720	mov	w1, #0x0
0000000000003724	mov	x2, x19
0000000000003728	str	x21, [sp, #0x10]
000000000000372c	blr	x8
0000000000003730	ldr	d0, [sp, #0x288]
0000000000003734	fcvt	s1, d0
0000000000003738	ldr	x8, [x21]
000000000000373c	ldr	x8, [x8, #0x60]
0000000000003740	fmov	s0, #1.00000000
0000000000003744	movi.2d	v2, #0000000000000000
0000000000003748	movi.2d	v3, #0000000000000000
000000000000374c	mov	x0, x21
0000000000003750	mov	w1, #0x0
0000000000003754	blr	x8
0000000000003758	mov	w0, #0x1b0
000000000000375c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003760	mov	x22, x0
0000000000003764	fmov	s0, #1.00000000
0000000000003768	fadd	s0, s9, s0
000000000000376c	fcvtps	w1, s0
0000000000003770	bl	__ZN13HGMPSImageEDTC1Es
0000000000003774	ldr	x8, [x22]
0000000000003778	ldr	x8, [x8, #0x78]
000000000000377c	mov	x0, x22
0000000000003780	mov	w1, #0x0
0000000000003784	ldr	x2, [sp, #0x18]
0000000000003788	blr	x8
000000000000378c	ldr	x8, [x22]
0000000000003790	ldr	x8, [x8, #0x88]
0000000000003794	mov	x0, x22
0000000000003798	mov	w1, #-0x1
000000000000379c	mov	w2, #0x2
00000000000037a0	blr	x8
00000000000037a4	ldr	x8, [x22]
00000000000037a8	ldr	x8, [x8, #0x88]
00000000000037ac	mov	x0, x22
00000000000037b0	mov	w1, #0x0
00000000000037b4	mov	w2, #0x2
00000000000037b8	blr	x8
00000000000037bc	mov	x0, x22
00000000000037c0	mov	w1, #0x4
00000000000037c4	bl	0x2517c8 ; symbol stub for: __ZN6HGNode25SetOutputFormatComponentsE18HGFormatComponents
00000000000037c8	mov	x0, x22
00000000000037cc	mov	w1, #0xc
00000000000037d0	bl	0x2517d4 ; symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
00000000000037d4	mov	w0, #0x1b0
00000000000037d8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000037dc	mov	x23, x0
00000000000037e0	fabs	s0, s8
00000000000037e4	fcvtps	w1, s0
00000000000037e8	bl	__ZN13HGMPSImageEDTC1Es
00000000000037ec	ldr	x8, [x23]
00000000000037f0	ldr	x8, [x8, #0x78]
00000000000037f4	mov	x0, x23
00000000000037f8	mov	w1, #0x0
00000000000037fc	ldr	x2, [sp, #0x10]
0000000000003800	blr	x8
0000000000003804	ldr	x8, [x23]
0000000000003808	ldr	x8, [x8, #0x88]
000000000000380c	mov	x0, x23
0000000000003810	mov	w1, #-0x1
0000000000003814	mov	w2, #0x2
0000000000003818	blr	x8
000000000000381c	ldr	x8, [x23]
0000000000003820	ldr	x8, [x8, #0x88]
0000000000003824	mov	x0, x23
0000000000003828	mov	w1, #0x0
000000000000382c	mov	w2, #0x2
0000000000003830	blr	x8
0000000000003834	mov	x0, x23
0000000000003838	mov	w1, #0x4
000000000000383c	bl	0x2517c8 ; symbol stub for: __ZN6HGNode25SetOutputFormatComponentsE18HGFormatComponents
0000000000003840	mov	x0, x23
0000000000003844	mov	w1, #0xc
0000000000003848	bl	0x2517d4 ; symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
000000000000384c	mov	w0, #0x1a0
0000000000003850	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003854	mov	x25, x0
0000000000003858	bl	__ZN16HgcReconstructDTC1Ev
000000000000385c	ldr	x8, [x25]
0000000000003860	ldr	x8, [x8, #0x78]
0000000000003864	mov	x0, x25
0000000000003868	mov	w1, #0x0
000000000000386c	mov	x2, x22
0000000000003870	blr	x8
0000000000003874	ldr	x8, [x25]
0000000000003878	ldr	x8, [x8, #0x60]
000000000000387c	fmov	s0, #1.00000000
0000000000003880	fmov	s1, #1.00000000
0000000000003884	movi.2d	v2, #0000000000000000
0000000000003888	movi.2d	v3, #0000000000000000
000000000000388c	mov	x0, x25
0000000000003890	mov	w1, #0x0
0000000000003894	blr	x8
0000000000003898	mov	x0, x25
000000000000389c	mov	w1, #0x4
00000000000038a0	bl	0x2517c8 ; symbol stub for: __ZN6HGNode25SetOutputFormatComponentsE18HGFormatComponents
00000000000038a4	mov	x0, x25
00000000000038a8	mov	w1, #0xc
00000000000038ac	bl	0x2517d4 ; symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
00000000000038b0	mov	w0, #0x1a0
00000000000038b4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000038b8	mov	x26, x0
00000000000038bc	bl	__ZN16HgcReconstructDTC1Ev
00000000000038c0	ldr	x8, [x26]
00000000000038c4	ldr	x8, [x8, #0x78]
00000000000038c8	mov	x0, x26
00000000000038cc	mov	w1, #0x0
00000000000038d0	mov	x2, x23
00000000000038d4	blr	x8
00000000000038d8	ldr	x8, [x26]
00000000000038dc	ldr	x8, [x8, #0x60]
00000000000038e0	fmov	s0, #1.00000000
00000000000038e4	fmov	s1, #-1.00000000
00000000000038e8	movi.2d	v2, #0000000000000000
00000000000038ec	movi.2d	v3, #0000000000000000
00000000000038f0	mov	x0, x26
00000000000038f4	mov	w1, #0x0
00000000000038f8	blr	x8
00000000000038fc	mov	x0, x26
0000000000003900	mov	w1, #0x4
0000000000003904	bl	0x2517c8 ; symbol stub for: __ZN6HGNode25SetOutputFormatComponentsE18HGFormatComponents
0000000000003908	mov	x0, x26
000000000000390c	mov	w1, #0xc
0000000000003910	bl	0x2517d4 ; symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
0000000000003914	ldur	w8, [x29, #-0x9c]
0000000000003918	cbz	w8, 0x3ab4
000000000000391c	ldur	d0, [x29, #-0xf0]
0000000000003920	fcvt	s0, d0
0000000000003924	cmp	w8, #0x1
0000000000003928	movi.2s	v1, #0x44, lsl #24
000000000000392c	fcsel	s10, s1, s0, eq
0000000000003930	fcvtzs	w2, s10
0000000000003934	mov	w0, #0x0
0000000000003938	mov	w1, #0x0
000000000000393c	mov	w3, #0x1
0000000000003940	bl	0x250a48 ; symbol stub for: _HGRectMake4i
0000000000003944	mov	x20, x0
0000000000003948	mov	x21, x1
000000000000394c	mov	w0, #0x80
0000000000003950	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003954	mov	x27, x0
0000000000003958	mov	x1, x20
000000000000395c	mov	x2, x21
0000000000003960	mov	w3, #0x1c
0000000000003964	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
0000000000003968	ldr	x2, [x27, #0x50]
000000000000396c	fcvtzu	x3, s10
0000000000003970	ldr	x6, [x28]
0000000000003974	mov	x0, x24
0000000000003978	mov	w4, #0x4
000000000000397c	mov	w5, #0x3
0000000000003980	bl	"_objc_msgSend$getGradientSamples:numSamples:depth:fromParm:atFxTime:"
0000000000003984	fcmp	s10, #0.0
0000000000003988	b.le	0x39d4
000000000000398c	mov	x8, #0x0
0000000000003990	ldr	x9, [x27, #0x50]
0000000000003994	add	x10, x9, #0x4
0000000000003998	add	x11, x9, x8, lsl #4
000000000000399c	ldr	s0, [x11]
00000000000039a0	mov	w12, #0x3
00000000000039a4	mov	x13, x10
00000000000039a8	ldr	s1, [x13]
00000000000039ac	stur	s1, [x13, #-0x4]
00000000000039b0	add	x13, x13, #0x4
00000000000039b4	subs	x12, x12, #0x1
00000000000039b8	b.ne	0x39a8
00000000000039bc	str	s0, [x11, #0xc]
00000000000039c0	add	x8, x8, #0x1
00000000000039c4	ucvtf	s0, w8
00000000000039c8	add	x10, x10, #0x10
00000000000039cc	fcmp	s10, s0
00000000000039d0	b.gt	0x3998
00000000000039d4	mov	w0, #0x1f0
00000000000039d8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000039dc	mov	x24, x0
00000000000039e0	mov	x1, x27
00000000000039e4	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
00000000000039e8	ldr	x8, [x24]
00000000000039ec	ldr	x8, [x8, #0x88]
00000000000039f0	mov	x28, #0x0
00000000000039f4	mov	x0, x24
00000000000039f8	mov	w1, #-0x1
00000000000039fc	mov	w2, #0x4
0000000000003a00	blr	x8
0000000000003a04	ldur	w8, [x29, #-0x9c]
0000000000003a08	cmp	w8, #0x2
0000000000003a0c	b.eq	0x3b38
0000000000003a10	cmp	w8, #0x1
0000000000003a14	b.ne	0x3b68
0000000000003a18	mov	w0, #0x1a0
0000000000003a1c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003a20	mov	x28, x0
0000000000003a24	bl	__ZN25HgcColorAndGradientStrokeC2Ev
0000000000003a28	adrp	x8, 902 ; 0x389000
0000000000003a2c	add	x8, x8, #0xff8
0000000000003a30	str	x8, [x28]
0000000000003a34	ldr	x0, [sp, #0x28]
0000000000003a38	bl	_objc_msgSend$pixelAspect
0000000000003a3c	mov.16b	v10, v0
0000000000003a40	ldp	d14, d13, [x29, #-0xe0]
0000000000003a44	ldp	d12, d15, [x29, #-0xd0]
0000000000003a48	mov	w0, #0x210
0000000000003a4c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003a50	mov	x20, x0
0000000000003a54	bl	0x250ebc ; symbol stub for: __ZN10HGGradientC1Ev
0000000000003a58	ldur	w8, [x29, #-0xe4]
0000000000003a5c	cbz	w8, 0x3ba4
0000000000003a60	mov	x0, x20
0000000000003a64	mov	w1, #0x1
0000000000003a68	bl	0x250eb0 ; symbol stub for: __ZN10HGGradient15SetGradientModeENS_12GradientModeE
0000000000003a6c	fsub	d0, d13, d15
0000000000003a70	fmul	d0, d10, d0
0000000000003a74	fsub	d1, d14, d12
0000000000003a78	fmul	d0, d0, d0
0000000000003a7c	fmul	d1, d1, d1
0000000000003a80	fadd	d0, d0, d1
0000000000003a84	fsqrt	d0, d0
0000000000003a88	fcvt	s0, d0
0000000000003a8c	fabs	s0, s0
0000000000003a90	ldr	x8, [x20]
0000000000003a94	ldr	x8, [x8, #0x60]
0000000000003a98	movi.2d	v1, #0000000000000000
0000000000003a9c	movi.2d	v2, #0000000000000000
0000000000003aa0	movi.2d	v3, #0000000000000000
0000000000003aa4	mov	x0, x20
0000000000003aa8	mov	w1, #0x2
0000000000003aac	blr	x8
0000000000003ab0	b	0x3bd8
0000000000003ab4	mov	w0, #0x1a0
0000000000003ab8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003abc	mov	x28, x0
0000000000003ac0	bl	__ZN25HgcColorAndGradientStrokeC2Ev
0000000000003ac4	adrp	x8, 902 ; 0x389000
0000000000003ac8	add	x8, x8, #0xff8
0000000000003acc	str	x8, [x28]
0000000000003ad0	mov	w0, #0x1a0
0000000000003ad4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003ad8	mov	x20, x0
0000000000003adc	bl	0x25106c ; symbol stub for: __ZN12HGSolidColorC1Ev
0000000000003ae0	ldp	d1, d0, [x29, #-0xb0]
0000000000003ae4	fcvt	s0, d0
0000000000003ae8	fcvt	s1, d1
0000000000003aec	ldp	d3, d2, [x29, #-0xc0]
0000000000003af0	fcvt	s2, d2
0000000000003af4	fcvt	s3, d3
0000000000003af8	ldr	x8, [x20]
0000000000003afc	ldr	x8, [x8, #0x60]
0000000000003b00	mov	x0, x20
0000000000003b04	mov	w1, #0x0
0000000000003b08	blr	x8
0000000000003b0c	ldr	x8, [x28]
0000000000003b10	ldr	x8, [x8, #0x78]
0000000000003b14	mov	x0, x28
0000000000003b18	mov	w1, #0x1
0000000000003b1c	mov	x2, x20
0000000000003b20	blr	x8
0000000000003b24	ldr	x8, [x20]
0000000000003b28	ldr	x8, [x8, #0x18]
0000000000003b2c	mov	x0, x20
0000000000003b30	blr	x8
0000000000003b34	b	0x3c88
0000000000003b38	mov	w0, #0x1a0
0000000000003b3c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003b40	mov	x28, x0
0000000000003b44	bl	__ZN24HgcOutlineGradientStrokeC2Ev
0000000000003b48	adrp	x8, 903 ; 0x38a000
0000000000003b4c	add	x8, x8, #0x250
0000000000003b50	str	x8, [x28]
0000000000003b54	mov	x0, x28
0000000000003b58	mov	w1, #0x1
0000000000003b5c	mov	x2, x24
0000000000003b60	bl	0x251804 ; symbol stub for: __ZN6HGNode8SetInputEiPS_
0000000000003b64	b	0x3c64
0000000000003b68	mov	x28, #0x0
0000000000003b6c	adrp	x0, 961 ; 0x3c4000
0000000000003b70	add	x0, x0, #0x728 ; Objc cfstring ref: @"bad cfstring ref"
0000000000003b74	bl	0x250bf8 ; symbol stub for: _NSLog
0000000000003b78	ldr	x8, [x24]
0000000000003b7c	ldr	x8, [x8, #0x18]
0000000000003b80	mov	x0, x24
0000000000003b84	blr	x8
0000000000003b88	cbz	x27, 0x4014
0000000000003b8c	ldr	x8, [x27]
0000000000003b90	ldr	x8, [x8, #0x18]
0000000000003b94	mov	x0, x27
0000000000003b98	blr	x8
0000000000003b9c	mov	w27, #0x0
0000000000003ba0	b	0x4014
0000000000003ba4	mov	x0, x20
0000000000003ba8	mov	w1, #0x0
0000000000003bac	bl	0x250eb0 ; symbol stub for: __ZN10HGGradient15SetGradientModeENS_12GradientModeE
0000000000003bb0	ldp	d1, d0, [x29, #-0xe0]
0000000000003bb4	fcvt	s0, d0
0000000000003bb8	fcvt	s1, d1
0000000000003bbc	ldr	x8, [x20]
0000000000003bc0	ldr	x8, [x8, #0x60]
0000000000003bc4	movi.2d	v2, #0000000000000000
0000000000003bc8	movi.2d	v3, #0000000000000000
0000000000003bcc	mov	x0, x20
0000000000003bd0	mov	w1, #0x2
0000000000003bd4	blr	x8
0000000000003bd8	fcvt	s0, d10
0000000000003bdc	ldr	x8, [x20]
0000000000003be0	ldr	x8, [x8, #0x60]
0000000000003be4	fmov	s1, #1.00000000
0000000000003be8	fmov	s2, #1.00000000
0000000000003bec	fmov	s3, #1.00000000
0000000000003bf0	mov	x0, x20
0000000000003bf4	mov	w1, #0x0
0000000000003bf8	blr	x8
0000000000003bfc	ldp	d1, d0, [x29, #-0xd0]
0000000000003c00	fcvt	s0, d0
0000000000003c04	fcvt	s1, d1
0000000000003c08	ldr	x8, [x20]
0000000000003c0c	ldr	x8, [x8, #0x60]
0000000000003c10	movi.2d	v2, #0000000000000000
0000000000003c14	movi.2d	v3, #0000000000000000
0000000000003c18	mov	x0, x20
0000000000003c1c	mov	w1, #0x1
0000000000003c20	blr	x8
0000000000003c24	ldr	x8, [x20]
0000000000003c28	ldr	x8, [x8, #0x78]
0000000000003c2c	mov	x0, x20
0000000000003c30	mov	w1, #0x0
0000000000003c34	mov	x2, x24
0000000000003c38	blr	x8
0000000000003c3c	ldr	x8, [x28]
0000000000003c40	ldr	x8, [x8, #0x78]
0000000000003c44	mov	x0, x28
0000000000003c48	mov	w1, #0x1
0000000000003c4c	mov	x2, x20
0000000000003c50	blr	x8
0000000000003c54	ldr	x8, [x20]
0000000000003c58	ldr	x8, [x8, #0x18]
0000000000003c5c	mov	x0, x20
0000000000003c60	blr	x8
0000000000003c64	ldr	x8, [x24]
0000000000003c68	ldr	x8, [x8, #0x18]
0000000000003c6c	mov	x0, x24
0000000000003c70	blr	x8
0000000000003c74	cbz	x27, 0x3c88
0000000000003c78	ldr	x8, [x27]
0000000000003c7c	ldr	x8, [x8, #0x18]
0000000000003c80	mov	x0, x27
0000000000003c84	blr	x8
0000000000003c88	fcmp	s8, #0.0
0000000000003c8c	ldr	d1, [sp, #0x8]
0000000000003c90	b.ge	0x3d24
0000000000003c94	fneg	d0, d11
0000000000003c98	fcmp	d1, d0
0000000000003c9c	b.ls	0x3d24
0000000000003ca0	mov	w0, #0x1a0
0000000000003ca4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003ca8	mov	x20, x0
0000000000003cac	bl	__ZN12HgcSimpleAddC1Ev
0000000000003cb0	ldr	x8, [x20]
0000000000003cb4	ldr	x8, [x8, #0x78]
0000000000003cb8	mov	x0, x20
0000000000003cbc	mov	w1, #0x0
0000000000003cc0	mov	x2, x26
0000000000003cc4	blr	x8
0000000000003cc8	ldr	x8, [x20]
0000000000003ccc	ldr	x8, [x8, #0x78]
0000000000003cd0	mov	x0, x20
0000000000003cd4	mov	w1, #0x1
0000000000003cd8	mov	x2, x25
0000000000003cdc	blr	x8
0000000000003ce0	mov	x0, x20
0000000000003ce4	mov	w1, #0x4
0000000000003ce8	bl	0x2517c8 ; symbol stub for: __ZN6HGNode25SetOutputFormatComponentsE18HGFormatComponents
0000000000003cec	mov	x0, x20
0000000000003cf0	mov	w1, #0xc
0000000000003cf4	bl	0x2517d4 ; symbol stub for: __ZN6HGNode28SetSupportedFormatPrecisionsEj
0000000000003cf8	ldr	x8, [x28]
0000000000003cfc	ldr	x8, [x8, #0x78]
0000000000003d00	mov	x0, x28
0000000000003d04	mov	w1, #0x0
0000000000003d08	mov	x2, x20
0000000000003d0c	blr	x8
0000000000003d10	ldr	x8, [x20]
0000000000003d14	ldr	x8, [x8, #0x18]
0000000000003d18	mov	x0, x20
0000000000003d1c	blr	x8
0000000000003d20	b	0x3d40
0000000000003d24	fcmp	s8, #0.0
0000000000003d28	csel	x2, x25, x26, ge
0000000000003d2c	ldr	x8, [x28]
0000000000003d30	ldr	x8, [x8, #0x78]
0000000000003d34	mov	x0, x28
0000000000003d38	mov	w1, #0x0
0000000000003d3c	blr	x8
0000000000003d40	ldr	d0, [sp, #0x268]
0000000000003d44	mov	x8, #0x4059000000000000
0000000000003d48	fmov	d1, x8
0000000000003d4c	fdiv	d0, d0, d1
0000000000003d50	adrp	x8, 613 ; 0x268000
0000000000003d54	ldr	d1, [x8, #0xc90]
0000000000003d58	fmul	d0, d0, d1
0000000000003d5c	bl	0x25217c ; symbol stub for: _exp
0000000000003d60	fcvt	s2, d0
0000000000003d64	ldr	d0, [sp, #0x270]
0000000000003d68	fcvt	s3, d0
0000000000003d6c	ldr	x8, [x28]
0000000000003d70	ldr	x8, [x8, #0x60]
0000000000003d74	mov	x0, x28
0000000000003d78	mov	w1, #0x0
0000000000003d7c	mov.16b	v0, v8
0000000000003d80	mov.16b	v1, v9
0000000000003d84	blr	x8
0000000000003d88	ldr	d0, [sp, #0x278]
0000000000003d8c	fcvt	s0, d0
0000000000003d90	ldr	d1, [sp, #0x280]
0000000000003d94	fcvt	s1, d1
0000000000003d98	ldr	x8, [x28]
0000000000003d9c	ldr	x8, [x8, #0x60]
0000000000003da0	movi.2d	v2, #0000000000000000
0000000000003da4	movi.2d	v3, #0000000000000000
0000000000003da8	mov	x0, x28
0000000000003dac	mov	w1, #0x1
0000000000003db0	blr	x8
0000000000003db4	ldr	x0, [sp, #0x250]
0000000000003db8	cmp	x0, x28
0000000000003dbc	b.eq	0x3de4
0000000000003dc0	cbz	x0, 0x3dd0
0000000000003dc4	ldr	x8, [x0]
0000000000003dc8	ldr	x8, [x8, #0x18]
0000000000003dcc	blr	x8
0000000000003dd0	str	x28, [sp, #0x250]
0000000000003dd4	ldr	x8, [x28]
0000000000003dd8	ldr	x8, [x8, #0x10]
0000000000003ddc	mov	x0, x28
0000000000003de0	blr	x8
0000000000003de4	add	x0, sp, #0x30
0000000000003de8	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000003dec	ldr	d0, [sp, #0x150]
0000000000003df0	ldr	d1, [sp, #0x178]
0000000000003df4	add	x0, sp, #0x30
0000000000003df8	fmov	d2, #1.00000000
0000000000003dfc	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000003e00	ldr	d0, [sp, #0x168]
0000000000003e04	ldr	d1, [sp, #0x188]
0000000000003e08	add	x0, sp, #0x30
0000000000003e0c	movi.2d	v2, #0000000000000000
0000000000003e10	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
0000000000003e14	mov	w0, #0x210
0000000000003e18	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003e1c	mov	x24, x0
0000000000003e20	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000003e24	ldr	x8, [x24]
0000000000003e28	ldr	x8, [x8, #0x230]
0000000000003e2c	add	x1, sp, #0x30
0000000000003e30	mov	x0, x24
0000000000003e34	blr	x8
0000000000003e38	ldr	x8, [x24]
0000000000003e3c	ldr	x8, [x8, #0x78]
0000000000003e40	mov	x0, x24
0000000000003e44	mov	w1, #0x0
0000000000003e48	mov	x2, x28
0000000000003e4c	blr	x8
0000000000003e50	ldr	x0, [sp, #0x250]
0000000000003e54	cmp	x0, x24
0000000000003e58	b.eq	0x3e80
0000000000003e5c	cbz	x0, 0x3e6c
0000000000003e60	ldr	x8, [x0]
0000000000003e64	ldr	x8, [x8, #0x18]
0000000000003e68	blr	x8
0000000000003e6c	str	x24, [sp, #0x250]
0000000000003e70	ldr	x8, [x24]
0000000000003e74	ldr	x8, [x8, #0x10]
0000000000003e78	mov	x0, x24
0000000000003e7c	blr	x8
0000000000003e80	ldr	x0, [sp, #0x20]
0000000000003e84	bl	_objc_msgSend$colorPrimaries
0000000000003e88	mov	x20, x0
0000000000003e8c	mov	w0, #0x1b0
0000000000003e90	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003e94	mov	x27, x0
0000000000003e98	cmp	x20, #0x1
0000000000003e9c	cset	w1, eq
0000000000003ea0	bl	0x250f04 ; symbol stub for: __ZN11HGAntiAliasC1ENS_10ColorSpaceE
0000000000003ea4	ldr	x8, [x27]
0000000000003ea8	ldr	x8, [x8, #0x60]
0000000000003eac	movi.2d	v0, #0000000000000000
0000000000003eb0	movi.2d	v1, #0000000000000000
0000000000003eb4	movi.2d	v2, #0000000000000000
0000000000003eb8	movi.2d	v3, #0000000000000000
0000000000003ebc	mov	x0, x27
0000000000003ec0	mov	w1, #0x0
0000000000003ec4	blr	x8
0000000000003ec8	ldr	x2, [sp, #0x250]
0000000000003ecc	ldr	x8, [x27]
0000000000003ed0	ldr	x8, [x8, #0x78]
0000000000003ed4	mov	x0, x27
0000000000003ed8	mov	w1, #0x0
0000000000003edc	blr	x8
0000000000003ee0	ldr	x0, [sp, #0x250]
0000000000003ee4	cmp	x0, x27
0000000000003ee8	b.eq	0x3f10
0000000000003eec	cbz	x0, 0x3efc
0000000000003ef0	ldr	x8, [x0]
0000000000003ef4	ldr	x8, [x8, #0x18]
0000000000003ef8	blr	x8
0000000000003efc	str	x27, [sp, #0x250]
0000000000003f00	ldr	x8, [x27]
0000000000003f04	ldr	x8, [x8, #0x10]
0000000000003f08	mov	x0, x27
0000000000003f0c	blr	x8
0000000000003f10	ldrb	w8, [sp, #0x267]
0000000000003f14	tbnz	w8, #0x0, 0x3fcc
0000000000003f18	mov	w0, #0x220
0000000000003f1c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000003f20	mov	x20, x0
0000000000003f24	bl	0x25130c ; symbol stub for: __ZN16HGHWBlendFlippedC1Ev
0000000000003f28	adrp	x8, 613 ; 0x268000
0000000000003f2c	add	x8, x8, #0xcb0
0000000000003f30	ldrsw	x9, [sp, #0x260]
0000000000003f34	ldr	s0, [x8, x9, lsl #2]
0000000000003f38	ucvtf	s0, s0
0000000000003f3c	ldr	x8, [x20]
0000000000003f40	ldr	x8, [x8, #0x60]
0000000000003f44	movi.2d	v1, #0000000000000000
0000000000003f48	movi.2d	v2, #0000000000000000
0000000000003f4c	movi.2d	v3, #0000000000000000
0000000000003f50	mov	x0, x20
0000000000003f54	mov	w1, #0x0
0000000000003f58	blr	x8
0000000000003f5c	ldr	x2, [sp, #0x258]
0000000000003f60	ldr	x8, [x20]
0000000000003f64	ldr	x8, [x8, #0x78]
0000000000003f68	mov	x0, x20
0000000000003f6c	mov	w1, #0x1
0000000000003f70	blr	x8
0000000000003f74	ldr	x2, [sp, #0x250]
0000000000003f78	ldr	x8, [x20]
0000000000003f7c	ldr	x8, [x8, #0x78]
0000000000003f80	mov	x0, x20
0000000000003f84	mov	w1, #0x0
0000000000003f88	blr	x8
0000000000003f8c	ldr	x0, [sp, #0x250]
0000000000003f90	cmp	x0, x20
0000000000003f94	b.eq	0x3fbc
0000000000003f98	cbz	x0, 0x3fa8
0000000000003f9c	ldr	x8, [x0]
0000000000003fa0	ldr	x8, [x8, #0x18]
0000000000003fa4	blr	x8
0000000000003fa8	str	x20, [sp, #0x250]
0000000000003fac	ldr	x8, [x20]
0000000000003fb0	ldr	x8, [x8, #0x10]
0000000000003fb4	mov	x0, x20
0000000000003fb8	blr	x8
0000000000003fbc	ldr	x8, [x20]
0000000000003fc0	ldr	x8, [x8, #0x18]
0000000000003fc4	mov	x0, x20
0000000000003fc8	blr	x8
0000000000003fcc	add	x2, sp, #0x250
0000000000003fd0	ldr	x0, [sp, #0x28]
0000000000003fd4	bl	"_objc_msgSend$setHeliumRef:"
0000000000003fd8	ldr	x8, [x27]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (int)
    - parm4 (float)
    - parm5 (int)
    - parm6 (float)
    - parm7 (float)
    - parm8 (float)
    - parm9 (float)
    - parm13 (float)
    - parm10 (float)
    - parm12 (bool)
    - parm11 (int)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm7 (float)
    slot 0  <-  parm7 (float)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 0  <-  parm11 (int)
    slot 1  <-  (constant / computed)
    slot 0  <-  parm10 (float), parm13 (float)
    slot 1  <-  parm9 (float), parm8 (float)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
