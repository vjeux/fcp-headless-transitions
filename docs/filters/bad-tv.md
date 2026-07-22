# Bad TV

- **PAE class:** `Bad TV`
- **Plugin UUID:** `32AB5EE1-BACB-4B81-B44E-6D1E643C8D00`
- **Node names in corpus:** Bad TV (129), Bad TV copy (14), Bad TV 1 (8), Bad TV 2 (7), Roll 3 (5), Roll 2 (5)
- **Corpus usage:** 103 files, 199 instances

## What it does

Bad TV emulates analog-TV glitch: horizontal roll, wavy random-walk horizontal displacement, static/noise overlay, dark scan lines, chromatic aberration and desaturation. It is the CRT/VHS-breakup effect. Implemented and RE'd verbatim from the HgcBadTV / HgcBadTVNoise Metal shaders.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Roll | float | 45 | -100 .. 400 | Vertical roll/scroll speed of the picture (the classic hold-vertical breakup). *(keyframed in 48 instances)* |
| Waviness | float | 10 | 0 .. 200 | Amplitude of the wavy horizontal displacement (random-walk per scanline), 0-200. *(keyframed in 22 instances)* |
| Static | float | 0.1 | 0 .. 1 | Amount of noise/static overlaid, 0-1. When >0 the noise-variant shader (HgcBadTVNoise) runs. *(keyframed in 5 instances)* |
| Saturate | float | -25 | -100 .. 100 | Saturation shift, -100..100 (negative bleeds color toward gray). *(keyframed in 4 instances)* |
| Color Synch | float | 0.8 | 0 .. 1 | Chromatic aberration / color-sync error, 0-1 (higher = more RGB split). *(keyframed in 5 instances)* |
| Number of Scan Lines | float | 100 | 1 .. 1035 | How many dark scan lines are drawn across the frame, 1-1035. *(keyframed in 2 instances)* |
| Scan Line Brightness | float | 1.5 | 0 .. 5 | Brightness floor of the dark scan-line bands, 0-5 (lower = darker lines). *(keyframed in 2 instances)* |
| Scan Line Percentage | float | 0.5 | 0 .. 1 | Duty cycle / thickness of the scan lines, 0-1. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the glitched result over the clean original, 0-1 continuous. *(keyframed in 23 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/badtv.ts`](../../engine/src/compositor/filters/badtv.ts).

> 5 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 3 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcBadTV`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBadTV` → [`HgcBadTV.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBadTV.metal)

```metal
//Metal1.0     
//LEN=0000000876
[[ visible ]] FragmentOut HgcBadTV_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.5000000000, -1.000000000, 0.000000000);
    const float4 c1 = float4(0.000000000, 3.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[3]);
    r1.y = r0.x + hg_Params[6].y;
    r0.y = c0.y*hg_Params[9].x + r0.x;
    r0.z = r0.y/hg_Params[9].x;
    r0.w = floor(r0.z);
    r0.w = -r0.w*hg_Params[9].x + r0.y;
    r0.z = c0.y;
    r0.xy = r0.zw + hg_Params[13].xy;
    r0.xy = r0.xy*hg_Params[13].zw;
    r1.x = hg_Texture0.sample(hg_Sampler0, r0.xy).x;
    r1.z = dot(texCoord0, hg_Params[4]);
    r1.w = dot(texCoord0, hg_Params[5]);
    r0.z = r1.x*c0.x + c0.z;
    r0.y = dot(texCoord0, hg_Params[2]);
    r1.x = r0.z*hg_Params[8].x + r0.y;
    r0.yzw = c0.www;
    r0.x = hg_Params[11].x;
    r2 = r1 - r0;
    r0 = r1 + r0;
    r3.x = dot(r2, hg_Params[0]);
    r3.y = dot(r2, hg_Params[1]);
    r2.y = dot(r0, hg_Params[1]);
    r2.x = dot(r0, hg_Params[0]);
    r0.x = dot(r1, hg_Params[1]);
    r0.z = dot(r1, hg_Params[0]);
    r2.xy = r2.xy + hg_Params[14].xy;
    r2.xy = r2.xy*hg_Params[14].zw;
    r2.x = hg_Texture1.sample(hg_Sampler1, r2.xy).x;
    r0.w = r0.x;
    r1.xy = r0.zw + hg_Params[14].xy;
    r1.xy = r1.xy*hg_Params[14].zw;
    r2.yw = hg_Texture1.sample(hg_Sampler1, r1.xy).yw;
    r0.y = r0.x*hg_Params[10].y;
    r3.xy = r3.xy + hg_Params[14].xy;
    r3.xy = r3.xy*hg_Params[14].zw;
    r2.z = hg_Texture1.sample(hg_Sampler1, r3.xy).z;
    r0.x = fract(r0.y);
    r0.x = clamp(r0.x*hg_Params[10].z + -hg_Params[10].x, 0.00000f, 1.00000f);
    r0.y = -r0.x - r0.x;
    r1.w = dot(r2, hg_Params[12]);
    r0.x = r0.x*r0.x;
    r0.y = r0.y + c1.y;
    r0.x = r0.x*r0.y;
    r0.x = mix(hg_Params[10].w, -c0.z, r0.x);
    r1.xyz = mix(r1.www, r2.xyz, hg_Params[7].xyz);
    output.color0.xyz = r1.xyz*r0.xxx;
    output.color0.w = r2.w;
    return output;
}
```

### Metal fragment shader — `HgcBadTVNoise`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBadTVNoise` → [`HgcBadTVNoise.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBadTVNoise.metal)

```metal
//Metal1.0     
//LEN=00000009fb
[[ visible ]] FragmentOut HgcBadTVNoise_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1, 
    texture2d< float > hg_Texture2, 
    sampler hg_Sampler2,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.5000000000, -1.000000000, 0.000000000);
    const float4 c1 = float4(9.999999975e-07, 3.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[3]);
    r1.y = r0.x + hg_Params[6].y;
    r0.y = c0.y*hg_Params[9].x + r0.x;
    r0.z = r0.y/hg_Params[9].x;
    r0.w = floor(r0.z);
    r0.w = -r0.w*hg_Params[9].x + r0.y;
    r0.z = c0.y;
    r0.xy = r0.zw + hg_Params[13].xy;
    r0.xy = r0.xy*hg_Params[13].zw;
    r1.x = hg_Texture0.sample(hg_Sampler0, r0.xy).x;
    r1.w = dot(texCoord0, hg_Params[5]);
    r1.z = dot(texCoord0, hg_Params[4]);
    r0.z = r1.x*c0.x + c0.z;
    r0.y = dot(texCoord0, hg_Params[2]);
    r1.x = r0.z*hg_Params[8].x + r0.y;
    r0.yzw = c0.www;
    r0.x = hg_Params[11].x;
    r2 = r1 - r0;
    r0 = r1 + r0;
    r3.x = dot(r2, hg_Params[0]);
    r3.y = dot(r2, hg_Params[1]);
    r3.xy = r3.xy + hg_Params[14].xy;
    r3.xy = r3.xy*hg_Params[14].zw;
    r3.z = hg_Texture1.sample(hg_Sampler1, r3.xy).z;
    r3.w = dot(r1, hg_Params[1]);
    r3.y = dot(r0, hg_Params[1]);
    r3.x = dot(r0, hg_Params[0]);
    r1.x = dot(r1, hg_Params[0]);
    r1.y = r3.w;
    r2.xy = r1.xy + hg_Params[14].xy;
    r2.xy = r2.xy*hg_Params[14].zw;
    r2.yw = hg_Texture1.sample(hg_Sampler1, r2.xy).yw;
    r0.xy = r3.xy + hg_Params[14].xy;
    r0.xy = r0.xy*hg_Params[14].zw;
    r3.x = hg_Texture1.sample(hg_Sampler1, r0.xy).x;
    r3.y = r2.y;
    r0.x = fmax(r2.w, c1.x);
    r1.xy = r1.xy + hg_Params[15].xy;
    r1.xy = r1.xy*hg_Params[15].zw;
    r2.xyz = hg_Texture2.sample(hg_Sampler2, r1.xy).xyz;
    r0.xyz = r3.xyz/r0.xxx;
    r0.xyz = r2.xyz*c0.xxx + r0.xyz;
    r2.x = r3.w*hg_Params[10].y;
    r2.x = fract(r2.x);
    r2.x = clamp(r2.x*hg_Params[10].z + -hg_Params[10].x, 0.00000f, 1.00000f);
    r2.y = -r2.x - r2.x;
    r0.xyz = r0.xyz + c0.zzz;
    r0.w = r2.w;
    r0.w = dot(r0, hg_Params[12]);
    r2.x = r2.x*r2.x;
    r2.y = r2.y + c1.y;
    r2.x = r2.x*r2.y;
    r2.x = mix(hg_Params[10].w, -c0.z, r2.x);
    r0.xyz = mix(r0.www, r0.xyz, hg_Params[7].xyz);
    r0.xyz = r0.xyz*r2.xxx;
    output.color0.xyz = r2.www*r0.xyz;
    output.color0.w = r2.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEBadTV canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBadTV`

```asm
000000000007e3dc	mov	w3, #0x1
000000000007e3e0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e3e4	ldur	x20, [x29, #-0x98]
000000000007e3e8	mov	w0, #0x0
000000000007e3ec	mov	w1, #0x0
000000000007e3f0	mov	w2, #0x1
000000000007e3f4	mov	x26, x21
000000000007e3f8	mov	x3, x21
000000000007e3fc	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000007e400	mov	x27, x0
000000000007e404	mov	x21, x1
000000000007e408	mov	w0, #0x80
000000000007e40c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007e410	mov	x24, x0
000000000007e414	mov	x1, x27
000000000007e418	mov	x2, x21
000000000007e41c	mov	w3, #0x16
000000000007e420	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
000000000007e424	ldr	x4, [x24, #0x50]
000000000007e428	cbz	x4, 0x7efb0
000000000007e42c	cmp	x20, #0x2
000000000007e430	cset	w5, eq
000000000007e434	str	x24, [sp, #0x28]
000000000007e438	ldr	x3, [x24, #0x40]
000000000007e43c	ldr	x6, [x25]
000000000007e440	mov	x0, x23
000000000007e444	mov	x27, x26
000000000007e448	mov	x2, x26
000000000007e44c	bl	"_objc_msgSend$createWavyTableOfHeight:rowBytes:table:flip:atTime:"
000000000007e450	str	xzr, [sp, #0x200]
000000000007e454	ldr	x4, [x25]
000000000007e458	add	x2, sp, #0x200
000000000007e45c	mov	x0, x28
000000000007e460	mov	w3, #0x2
000000000007e464	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e468	mov	x20, #0x3ff0000000000000
000000000007e46c	str	x20, [sp, #0x1f8]
000000000007e470	ldr	x4, [x25]
000000000007e474	add	x2, sp, #0x1f8
000000000007e478	mov	x0, x28
000000000007e47c	mov	w3, #0x5
000000000007e480	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e484	ldr	d0, [sp, #0x1f8]
000000000007e488	mov	x8, #0x4059000000000000
000000000007e48c	fmov	d1, x8
000000000007e490	fdiv	d0, d0, d1
000000000007e494	fmov	d1, #1.00000000
000000000007e498	fadd	d0, d0, d1
000000000007e49c	str	d0, [sp, #0x1f8]
000000000007e4a0	str	x20, [sp, #0x1f0]
000000000007e4a4	ldr	x4, [x25]
000000000007e4a8	add	x2, sp, #0x1f0
000000000007e4ac	mov	x0, x28
000000000007e4b0	mov	w3, #0x6
000000000007e4b4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e4b8	mov	x8, #0x3ff0000000000000
000000000007e4bc	str	x8, [sp, #0x1e8]
000000000007e4c0	ldr	x4, [x25]
000000000007e4c4	cbz	w19, 0x7e530
000000000007e4c8	add	x2, sp, #0x1e8
000000000007e4cc	mov	x0, x28
000000000007e4d0	mov	w3, #0x9
000000000007e4d4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e4d8	mov	x8, #0x3ff0000000000000
000000000007e4dc	str	x8, [sp, #0x1e0]
000000000007e4e0	ldr	x4, [x25]
000000000007e4e4	add	x2, sp, #0x30
000000000007e4e8	mov	x0, x28
000000000007e4ec	mov	w3, #0xa
000000000007e4f0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e4f4	ldr	d0, [sp, #0x30]
000000000007e4f8	fcmp	d0, #0.0
000000000007e4fc	b.ne	0x7e508
000000000007e500	mov	x8, #0x3ff0000000000000
000000000007e504	str	x8, [sp, #0x30]
000000000007e508	mov	x0, x22
000000000007e50c	bl	_objc_msgSend$height
000000000007e510	ucvtf	d0, x0
000000000007e514	ldr	d1, [sp, #0x30]
000000000007e518	fdiv	d0, d0, d1
000000000007e51c	ldr	d1, [sp, #0x1e8]
000000000007e520	fmul	d1, d0, d1
000000000007e524	fsub	d0, d0, d1
000000000007e528	stp	d0, d1, [sp, #0x1e0]
000000000007e52c	b	0x7e55c
000000000007e530	add	x2, sp, #0x1e8
000000000007e534	mov	x0, x28
000000000007e538	mov	w3, #0x7
000000000007e53c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e540	mov	x8, #0x3ff0000000000000
000000000007e544	str	x8, [sp, #0x1e0]
000000000007e548	ldr	x4, [x25]
000000000007e54c	add	x2, sp, #0x1e0
000000000007e550	mov	x0, x28
000000000007e554	mov	w3, #0x8
000000000007e558	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e55c	mov	x8, #0x3ff0000000000000
000000000007e560	str	x8, [sp, #0x1d8]
000000000007e564	ldr	x4, [x25]
000000000007e568	add	x2, sp, #0x1d8
000000000007e56c	mov	x0, x28
000000000007e570	mov	w3, #0x4
000000000007e574	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e578	ldr	d0, [sp, #0x1d8]
000000000007e57c	fmov	d1, #1.00000000
000000000007e580	fsub	d0, d1, d0
000000000007e584	fmov	d1, #10.00000000
000000000007e588	fmul	d0, d0, d1
000000000007e58c	str	d0, [sp, #0x1d8]
000000000007e590	str	xzr, [sp, #0x1d0]
000000000007e594	ldr	x4, [x25]
000000000007e598	add	x2, sp, #0x1d0
000000000007e59c	mov	x0, x28
000000000007e5a0	mov	w3, #0x3
000000000007e5a4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007e5a8	ldp	x8, x9, [sp, #0x18]
000000000007e5ac	ucvtf	s11, x9
000000000007e5b0	ucvtf	s10, x8
000000000007e5b4	ldr	d0, [sp, #0x1d0]
000000000007e5b8	fcmp	d0, #0.0
000000000007e5bc	b.le	0x7e61c
000000000007e5c0	add	x8, sp, #0x30
000000000007e5c4	mov	x0, x23
000000000007e5c8	mov	x2, x22
000000000007e5cc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000007e5d0	ldr	x2, [x25]
000000000007e5d4	mov	x0, x23
000000000007e5d8	mov	x3, x23
000000000007e5dc	bl	"_objc_msgSend$frameFromFxTime:forPlugIn:"
000000000007e5e0	mov.16b	v1, v0
000000000007e5e4	fcvtzs	w0, s11
000000000007e5e8	fcvtzs	w1, s10
000000000007e5ec	ldr	d0, [sp, #0x1d0]
000000000007e5f0	add	x8, sp, #0x140
000000000007e5f4	add	x6, sp, #0x30
000000000007e5f8	mov	w2, #0x0
000000000007e5fc	mov	w3, #0x0
000000000007e600	mov	w4, #0x1
000000000007e604	mov	w5, #0x0
000000000007e608	bl	0x250d78 ; symbol stub for: __Z16PAEGenerateNoiseii9NoiseTypedbdbiRK14PCMatrix44TmplIdE
000000000007e60c	ldr	x21, [sp, #0x140]
000000000007e610	cbnz	x22, 0x7e624
000000000007e614	stp	xzr, xzr, [sp, #0x1c0]
000000000007e618	b	0x7e648
000000000007e61c	mov	x21, #0x0
000000000007e620	cbz	x22, 0x7e614
000000000007e624	add	x8, sp, #0x1c8
000000000007e628	mov	x0, x22
000000000007e62c	bl	_objc_msgSend$heliumRef
000000000007e630	ldr	x0, [sp, #0x1c8]
000000000007e634	str	x0, [sp, #0x1c0]
000000000007e638	cbz	x0, 0x7e648
000000000007e63c	ldr	x8, [x0]
000000000007e640	ldr	x8, [x8, #0x10]
000000000007e644	blr	x8
000000000007e648	add	x8, sp, #0x30
000000000007e64c	add	x2, sp, #0x1c0
000000000007e650	add	x3, sp, #0x210
000000000007e654	mov	x0, x23
000000000007e658	bl	"_objc_msgSend$changeDOD:withRect:"
000000000007e65c	ldr	x8, [sp, #0x1c8]
000000000007e660	ldr	x0, [sp, #0x30]
000000000007e664	cmp	x8, x0
000000000007e668	b.eq	0x7e690
000000000007e66c	cbz	x8, 0x7e684
000000000007e670	ldr	x9, [x8]
000000000007e674	ldr	x9, [x9, #0x18]
000000000007e678	mov	x0, x8
000000000007e67c	blr	x9
000000000007e680	ldr	x0, [sp, #0x30]
000000000007e684	str	x0, [sp, #0x1c8]
000000000007e688	str	xzr, [sp, #0x30]
000000000007e68c	b	0x7e6a0
000000000007e690	cbz	x8, 0x7e6a0
000000000007e694	ldr	x8, [x0]
000000000007e698	ldr	x8, [x8, #0x18]
000000000007e69c	blr	x8
000000000007e6a0	ldr	x0, [sp, #0x1c0]
000000000007e6a4	cbz	x0, 0x7e6b4
000000000007e6a8	ldr	x8, [x0]
000000000007e6ac	ldr	x8, [x8, #0x18]
000000000007e6b0	blr	x8
000000000007e6b4	mov	w0, #0x1f0
000000000007e6b8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007e6bc	str	x0, [sp, #0x20]
000000000007e6c0	ldr	x1, [sp, #0x28]
000000000007e6c4	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
000000000007e6c8	mov	x0, x22
000000000007e6cc	bl	_objc_msgSend$height
000000000007e6d0	mov	x20, x0
000000000007e6d4	mov	x0, x22
000000000007e6d8	bl	_objc_msgSend$width
000000000007e6dc	mov	x24, x0
000000000007e6e0	ldr	d0, [sp, #0x200]
000000000007e6e4	scvtf	d1, w27
000000000007e6e8	fmul	d0, d0, d1
000000000007e6ec	mov	x8, #0x4059000000000000
000000000007e6f0	fmov	d2, x8
000000000007e6f4	fdiv	d0, d0, d2
000000000007e6f8	bl	0x2521ac ; symbol stub for: _fmod
000000000007e6fc	str	d0, [sp, #0x200]
000000000007e700	ldr	x2, [x25]
000000000007e704	ldr	x0, [sp, #0x10]
000000000007e708	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000007e70c	bl	_objc_msgSend$matrix
000000000007e710	mov	x28, x0
000000000007e714	mov	w0, #0x1d0
000000000007e718	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007e71c	mov	x25, x0
000000000007e720	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
000000000007e724	mov	x0, x25
000000000007e728	mov	w1, #0x3
000000000007e72c	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
000000000007e730	ldr	x2, [sp, #0x1c8]
000000000007e734	ldr	x8, [x25]
000000000007e738	ldr	x8, [x8, #0x78]
000000000007e73c	mov	x0, x25
000000000007e740	mov	w1, #0x0
000000000007e744	blr	x8
000000000007e748	ldr	d0, [sp, #0x1d0]
000000000007e74c	fcmp	d0, #0.0
000000000007e750	b.le	0x7ebe8
000000000007e754	mov	w0, #0x1b0
000000000007e758	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007e75c	mov	x26, x0
000000000007e760	bl	__ZN13HgcBadTVNoiseC2Ev
000000000007e764	adrp	x8, 796 ; 0x39a000
000000000007e768	add	x8, x8, #0xf48
000000000007e76c	add	x9, x8, #0x10
000000000007e770	str	x9, [x26]
000000000007e774	str	w24, [x26, #0x1a0]
000000000007e778	str	w20, [x26, #0x1a4]
000000000007e77c	ldr	x8, [x8, #0x20]
000000000007e780	mov	x0, x26
000000000007e784	blr	x8
000000000007e788	ldr	x8, [x26]
000000000007e78c	ldr	x8, [x8, #0x78]
000000000007e790	mov	x0, x26
000000000007e794	mov	w1, #0x1
000000000007e798	mov	x2, x25
000000000007e79c	blr	x8
000000000007e7a0	ldr	x8, [x26]
000000000007e7a4	ldr	x8, [x8, #0x78]
000000000007e7a8	mov	x0, x26
000000000007e7ac	mov	w1, #0x0
000000000007e7b0	ldr	x2, [sp, #0x20]
000000000007e7b4	blr	x8
000000000007e7b8	ldr	d0, [sp, #0x200]
000000000007e7bc	fcvt	s0, d0
000000000007e7c0	ldr	x8, [x26]
000000000007e7c4	ldr	x8, [x8, #0x60]
000000000007e7c8	movi.2d	v1, #0000000000000000
000000000007e7cc	movi.2d	v2, #0000000000000000
000000000007e7d0	movi.2d	v3, #0000000000000000
000000000007e7d4	mov	x0, x26
000000000007e7d8	mov	w1, #0x8
000000000007e7dc	blr	x8
000000000007e7e0	ldr	d0, [sp, #0x1f8]
000000000007e7e4	fcvt	s0, d0
000000000007e7e8	ldr	x8, [x26]
000000000007e7ec	ldr	x8, [x8, #0x60]
000000000007e7f0	movi.2d	v1, #0000000000000000
000000000007e7f4	movi.2d	v2, #0000000000000000
000000000007e7f8	movi.2d	v3, #0000000000000000
000000000007e7fc	mov	x0, x26
000000000007e800	mov	w1, #0x9
000000000007e804	blr	x8
000000000007e808	ldr	d0, [sp, #0x208]
000000000007e80c	fcvt	s0, d0
000000000007e810	ldr	x8, [x26]
000000000007e814	ldr	x8, [x8, #0x60]
000000000007e818	movi.2d	v1, #0000000000000000
000000000007e81c	movi.2d	v2, #0000000000000000
000000000007e820	movi.2d	v3, #0000000000000000
000000000007e824	mov	x0, x26
000000000007e828	mov	w1, #0xa
000000000007e82c	blr	x8
000000000007e830	ldp	d2, d1, [sp, #0x1e0]
000000000007e834	fcvt	s0, d1
000000000007e838	fadd	d2, d1, d2
000000000007e83c	fmov	d1, #1.00000000
000000000007e840	fdiv	d1, d1, d2
000000000007e844	fcvt	s1, d1
000000000007e848	fcvt	s2, d2
000000000007e84c	ldr	d3, [sp, #0x1f0]
000000000007e850	fcvt	s3, d3
000000000007e854	ldr	x8, [x26]
000000000007e858	ldr	x8, [x8, #0x60]
000000000007e85c	mov	x0, x26
000000000007e860	mov	w1, #0xc
000000000007e864	blr	x8
000000000007e868	ldr	d0, [sp, #0x1d8]
000000000007e86c	fcvt	s0, d0
000000000007e870	ldr	x8, [x26]
000000000007e874	ldr	x8, [x8, #0x60]
000000000007e878	movi.2d	v1, #0000000000000000
000000000007e87c	movi.2d	v2, #0000000000000000
000000000007e880	movi.2d	v3, #0000000000000000
000000000007e884	mov	x0, x26
000000000007e888	mov	w1, #0xd
000000000007e88c	blr	x8
000000000007e890	ldp	d0, d1, [x28]
000000000007e894	fcvt	s0, d0
000000000007e898	fcvt	s1, d1
000000000007e89c	ldr	d2, [x28, #0x10]
000000000007e8a0	fcvt	s2, d2
000000000007e8a4	ldr	x8, [x26]
000000000007e8a8	ldr	x8, [x8, #0x60]
000000000007e8ac	movi.2d	v3, #0000000000000000
000000000007e8b0	mov	x0, x26
000000000007e8b4	mov	w1, #0xe
000000000007e8b8	blr	x8
000000000007e8bc	add	x8, sp, #0x140
000000000007e8c0	mov	x0, x23
000000000007e8c4	mov	x2, x22
000000000007e8c8	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000007e8cc	ldr	x20, [sp, #0x8]
000000000007e8d0	add	x8, sp, #0xc0
000000000007e8d4	mov	x0, x23
000000000007e8d8	mov	x2, x22
000000000007e8dc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000007e8e0	ldp	d0, d1, [sp, #0x140]
000000000007e8e4	fcvt	s0, d0
000000000007e8e8	fcvt	s1, d1
000000000007e8ec	ldp	d2, d3, [sp, #0x150]
000000000007e8f0	fcvt	s2, d2
000000000007e8f4	fcvt	s3, d3
000000000007e8f8	ldr	x8, [x26]
000000000007e8fc	ldr	x8, [x8, #0x60]
000000000007e900	mov	x0, x26
000000000007e904	mov	w1, #0x0
000000000007e908	blr	x8
000000000007e90c	ldp	d0, d1, [sp, #0x160]
000000000007e910	fcvt	s0, d0
000000000007e914	fcvt	s1, d1
000000000007e918	ldp	d2, d3, [sp, #0x170]
000000000007e91c	fcvt	s2, d2
000000000007e920	fcvt	s3, d3
000000000007e924	ldr	x8, [x26]
000000000007e928	ldr	x8, [x8, #0x60]
000000000007e92c	mov	x0, x26
000000000007e930	mov	w1, #0x1
000000000007e934	blr	x8
000000000007e938	ldp	d0, d1, [sp, #0x180]
000000000007e93c	fcvt	s0, d0
000000000007e940	fcvt	s1, d1
000000000007e944	ldp	d2, d3, [sp, #0x190]
000000000007e948	fcvt	s2, d2
000000000007e94c	fcvt	s3, d3
000000000007e950	ldr	x8, [x26]
000000000007e954	ldr	x8, [x8, #0x60]
000000000007e958	mov	x0, x26
000000000007e95c	mov	w1, #0x2
000000000007e960	blr	x8
000000000007e964	ldp	d0, d1, [sp, #0x1a0]
000000000007e968	fcvt	s0, d0
000000000007e96c	fcvt	s1, d1
000000000007e970	ldp	d2, d3, [sp, #0x1b0]
000000000007e974	fcvt	s2, d2
000000000007e978	fcvt	s3, d3
000000000007e97c	ldr	x8, [x26]
000000000007e980	ldr	x8, [x8, #0x60]
000000000007e984	mov	x0, x26
000000000007e988	mov	w1, #0x3
000000000007e98c	blr	x8
000000000007e990	ldp	d0, d1, [sp, #0xc0]
000000000007e994	fcvt	s0, d0
000000000007e998	fcvt	s1, d1
000000000007e99c	ldp	d2, d3, [sp, #0xd0]
000000000007e9a0	fcvt	s2, d2
000000000007e9a4	fcvt	s3, d3
000000000007e9a8	ldr	x8, [x26]
000000000007e9ac	ldr	x8, [x8, #0x60]
000000000007e9b0	mov	x0, x26
000000000007e9b4	mov	w1, #0x4
000000000007e9b8	blr	x8
000000000007e9bc	ldp	d0, d1, [sp, #0xe0]
000000000007e9c0	fcvt	s0, d0
000000000007e9c4	fcvt	s1, d1
000000000007e9c8	ldp	d2, d3, [sp, #0xf0]
000000000007e9cc	fcvt	s2, d2
000000000007e9d0	fcvt	s3, d3
000000000007e9d4	ldr	x8, [x26]
000000000007e9d8	ldr	x8, [x8, #0x60]
000000000007e9dc	mov	x0, x26
000000000007e9e0	mov	w1, #0x5
000000000007e9e4	blr	x8
000000000007e9e8	ldp	d0, d1, [sp, #0x100]
000000000007e9ec	fcvt	s0, d0
000000000007e9f0	fcvt	s1, d1
000000000007e9f4	ldp	d2, d3, [sp, #0x110]
000000000007e9f8	fcvt	s2, d2
000000000007e9fc	fcvt	s3, d3
000000000007ea00	ldr	x8, [x26]
000000000007ea04	ldr	x8, [x8, #0x60]
000000000007ea08	mov	x0, x26
000000000007ea0c	mov	w1, #0x6
000000000007ea10	blr	x8
000000000007ea14	ldp	d0, d1, [sp, #0x120]
000000000007ea18	fcvt	s0, d0
000000000007ea1c	fcvt	s1, d1
000000000007ea20	ldp	d2, d3, [sp, #0x130]
000000000007ea24	fcvt	s2, d2
000000000007ea28	fcvt	s3, d3
000000000007ea2c	ldr	x8, [x26]
000000000007ea30	ldr	x8, [x8, #0x60]
000000000007ea34	mov	x0, x26
000000000007ea38	mov	w1, #0x7
000000000007ea3c	blr	x8
000000000007ea40	scvtf	s0, w27
000000000007ea44	ldr	x8, [x26]
000000000007ea48	ldr	x8, [x8, #0x60]
000000000007ea4c	movi.2d	v1, #0000000000000000
000000000007ea50	movi.2d	v2, #0000000000000000
000000000007ea54	movi.2d	v3, #0000000000000000
000000000007ea58	mov	x0, x26
000000000007ea5c	mov	w1, #0xb
000000000007ea60	blr	x8
000000000007ea64	mov	w0, #0x1a0
000000000007ea68	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007ea6c	mov	x27, x0
000000000007ea70	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
000000000007ea74	fneg	s0, s11
000000000007ea78	fcvt	d0, s0
000000000007ea7c	fmov	d1, #0.50000000
000000000007ea80	fmul	d0, d0, d1
000000000007ea84	fcvtzs	w0, d0
000000000007ea88	fneg	s0, s10
000000000007ea8c	fcvt	d0, s0
000000000007ea90	fmul	d0, d0, d1
000000000007ea94	fcvtzs	w1, d0
000000000007ea98	fcvt	d0, s11
000000000007ea9c	fmul	d0, d0, d1
000000000007eaa0	fcvtzs	w2, d0
000000000007eaa4	fcvt	d0, s10
000000000007eaa8	fmul	d0, d0, d1
000000000007eaac	fcvtzs	w3, d0
000000000007eab0	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000007eab4	scvtf	s0, w0
000000000007eab8	lsr	x8, x0, #32
000000000007eabc	scvtf	s1, w8
000000000007eac0	scvtf	s2, w1
000000000007eac4	lsr	x8, x1, #32
000000000007eac8	scvtf	s3, w8
000000000007eacc	ldr	x8, [x27]
000000000007ead0	ldr	x8, [x8, #0x60]
000000000007ead4	mov	x0, x27
000000000007ead8	mov	w1, #0x0
000000000007eadc	blr	x8
000000000007eae0	ldr	x8, [x27]
000000000007eae4	ldr	x8, [x8, #0x78]
000000000007eae8	mov	x0, x27
000000000007eaec	mov	w1, #0x0
000000000007eaf0	mov	x2, x21
000000000007eaf4	blr	x8
000000000007eaf8	mov	w0, #0x1d0
000000000007eafc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007eb00	mov	x28, x0
000000000007eb04	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
000000000007eb08	ldr	x8, [x28]
000000000007eb0c	ldr	x8, [x8, #0x78]
000000000007eb10	mov	x0, x28
000000000007eb14	mov	w1, #0x0
000000000007eb18	mov	x2, x27
000000000007eb1c	blr	x8
000000000007eb20	mov	x0, x28
000000000007eb24	mov	w1, #0x3
000000000007eb28	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
000000000007eb2c	add	x0, sp, #0x30
000000000007eb30	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
000000000007eb34	add	x0, sp, #0x30
000000000007eb38	fmov	d2, #1.00000000
000000000007eb3c	mov.16b	v0, v9
000000000007eb40	mov.16b	v1, v8
000000000007eb44	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
000000000007eb48	mov	w0, #0x210
000000000007eb4c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007eb50	mov	x19, x0
000000000007eb54	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
000000000007eb58	ldr	x8, [x19]
000000000007eb5c	ldr	x8, [x8, #0x230]
000000000007eb60	add	x1, sp, #0x30
000000000007eb64	mov	x0, x19
000000000007eb68	blr	x8
000000000007eb6c	ldr	x8, [x19]
000000000007eb70	ldr	x8, [x8, #0x78]
000000000007eb74	mov	x0, x19
000000000007eb78	mov	w1, #0x0
000000000007eb7c	mov	x2, x28
000000000007eb80	blr	x8
000000000007eb84	ldr	x8, [x26]
000000000007eb88	ldr	x8, [x8, #0x78]
000000000007eb8c	mov	x0, x26
000000000007eb90	mov	w1, #0x2
000000000007eb94	mov	x2, x19
000000000007eb98	blr	x8
000000000007eb9c	ldr	x8, [x19]
000000000007eba0	ldr	x8, [x8, #0x18]
000000000007eba4	mov	x0, x19
000000000007eba8	blr	x8
000000000007ebac	add	x0, sp, #0x30
000000000007ebb0	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
000000000007ebb4	ldr	x8, [x28]
000000000007ebb8	ldr	x8, [x8, #0x18]
000000000007ebbc	mov	x0, x28
000000000007ebc0	blr	x8
000000000007ebc4	ldr	x8, [x27]
000000000007ebc8	ldr	x8, [x8, #0x18]
000000000007ebcc	mov	x0, x27
000000000007ebd0	blr	x8
000000000007ebd4	ldr	x8, [x26]
000000000007ebd8	ldr	x8, [x8, #0x18]
000000000007ebdc	mov	x0, x26
000000000007ebe0	blr	x8
000000000007ebe4	b	0x7ef08
000000000007ebe8	mov	w0, #0x1b0
000000000007ebec	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007ebf0	mov	x26, x0
000000000007ebf4	bl	__ZN8HgcBadTVC2Ev
000000000007ebf8	adrp	x8, 796 ; 0x39a000
000000000007ebfc	add	x8, x8, #0xa98
000000000007ec00	add	x9, x8, #0x10
000000000007ec04	str	x9, [x26]
000000000007ec08	str	w24, [x26, #0x1a0]
000000000007ec0c	str	w20, [x26, #0x1a4]
000000000007ec10	ldr	x8, [x8, #0x20]
000000000007ec14	mov	x0, x26
000000000007ec18	blr	x8
000000000007ec1c	ldr	x8, [x26]
000000000007ec20	ldr	x8, [x8, #0x78]
000000000007ec24	mov	x0, x26
000000000007ec28	mov	w1, #0x1
000000000007ec2c	mov	x2, x25
000000000007ec30	blr	x8
000000000007ec34	ldr	x8, [x26]
000000000007ec38	ldr	x8, [x8, #0x78]
000000000007ec3c	mov	x0, x26
000000000007ec40	mov	w1, #0x0
000000000007ec44	ldr	x2, [sp, #0x20]
000000000007ec48	blr	x8
000000000007ec4c	ldr	d0, [sp, #0x200]
000000000007ec50	fcvt	s0, d0
000000000007ec54	ldr	x8, [x26]
000000000007ec58	ldr	x8, [x8, #0x60]
000000000007ec5c	movi.2d	v1, #0000000000000000
000000000007ec60	movi.2d	v2, #0000000000000000
000000000007ec64	movi.2d	v3, #0000000000000000
000000000007ec68	mov	x0, x26
000000000007ec6c	mov	w1, #0x8
000000000007ec70	blr	x8
000000000007ec74	ldr	d0, [sp, #0x1f8]
000000000007ec78	fcvt	s0, d0
000000000007ec7c	ldr	x8, [x26]
000000000007ec80	ldr	x8, [x8, #0x60]
000000000007ec84	movi.2d	v1, #0000000000000000
000000000007ec88	movi.2d	v2, #0000000000000000
000000000007ec8c	movi.2d	v3, #0000000000000000
000000000007ec90	mov	x0, x26
000000000007ec94	mov	w1, #0x9
000000000007ec98	blr	x8
000000000007ec9c	ldr	d0, [sp, #0x208]
000000000007eca0	fcvt	s0, d0
000000000007eca4	ldr	x8, [x26]
000000000007eca8	ldr	x8, [x8, #0x60]
000000000007ecac	movi.2d	v1, #0000000000000000
000000000007ecb0	movi.2d	v2, #0000000000000000
000000000007ecb4	movi.2d	v3, #0000000000000000
000000000007ecb8	mov	x0, x26
000000000007ecbc	mov	w1, #0xa
000000000007ecc0	blr	x8
000000000007ecc4	ldp	d2, d1, [sp, #0x1e0]
000000000007ecc8	fcvt	s0, d1
000000000007eccc	fadd	d2, d1, d2
000000000007ecd0	fmov	d1, #1.00000000
000000000007ecd4	fdiv	d1, d1, d2
000000000007ecd8	fcvt	s1, d1
000000000007ecdc	fcvt	s2, d2
000000000007ece0	ldr	d3, [sp, #0x1f0]
000000000007ece4	fcvt	s3, d3
000000000007ece8	ldr	x8, [x26]
000000000007ecec	ldr	x8, [x8, #0x60]
000000000007ecf0	mov	x0, x26
000000000007ecf4	mov	w1, #0xc
000000000007ecf8	blr	x8
000000000007ecfc	ldr	d0, [sp, #0x1d8]
000000000007ed00	fcvt	s0, d0
000000000007ed04	ldr	x8, [x26]
000000000007ed08	ldr	x8, [x8, #0x60]
000000000007ed0c	movi.2d	v1, #0000000000000000
000000000007ed10	movi.2d	v2, #0000000000000000
000000000007ed14	movi.2d	v3, #0000000000000000
000000000007ed18	mov	x0, x26
000000000007ed1c	mov	w1, #0xd
000000000007ed20	blr	x8
000000000007ed24	ldp	d0, d1, [x28]
000000000007ed28	fcvt	s0, d0
000000000007ed2c	fcvt	s1, d1
000000000007ed30	ldr	d2, [x28, #0x10]
000000000007ed34	fcvt	s2, d2
000000000007ed38	ldr	x8, [x26]
000000000007ed3c	ldr	x8, [x8, #0x60]
000000000007ed40	movi.2d	v3, #0000000000000000
000000000007ed44	mov	x0, x26
000000000007ed48	mov	w1, #0xe
000000000007ed4c	blr	x8
000000000007ed50	add	x8, sp, #0x30
000000000007ed54	mov	x0, x23
000000000007ed58	mov	x2, x22
000000000007ed5c	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000007ed60	ldr	x20, [sp, #0x8]
000000000007ed64	add	x8, sp, #0x140
000000000007ed68	mov	x0, x23
000000000007ed6c	mov	x2, x22
000000000007ed70	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000007ed74	ldp	d0, d1, [sp, #0x30]
000000000007ed78	fcvt	s0, d0
000000000007ed7c	fcvt	s1, d1
000000000007ed80	ldp	d2, d3, [sp, #0x40]
000000000007ed84	fcvt	s2, d2
000000000007ed88	fcvt	s3, d3
000000000007ed8c	ldr	x8, [x26]
000000000007ed90	ldr	x8, [x8, #0x60]
000000000007ed94	mov	x0, x26
000000000007ed98	mov	w1, #0x0
000000000007ed9c	blr	x8
000000000007eda0	ldp	d0, d1, [sp, #0x50]
000000000007eda4	fcvt	s0, d0
000000000007eda8	fcvt	s1, d1
000000000007edac	ldp	d2, d3, [sp, #0x60]
000000000007edb0	fcvt	s2, d2
000000000007edb4	fcvt	s3, d3
000000000007edb8	ldr	x8, [x26]
000000000007edbc	ldr	x8, [x8, #0x60]
000000000007edc0	mov	x0, x26
000000000007edc4	mov	w1, #0x1
000000000007edc8	blr	x8
000000000007edcc	ldp	d0, d1, [sp, #0x70]
000000000007edd0	fcvt	s0, d0
000000000007edd4	fcvt	s1, d1
000000000007edd8	ldp	d2, d3, [sp, #0x80]
000000000007eddc	fcvt	s2, d2
000000000007ede0	fcvt	s3, d3
000000000007ede4	ldr	x8, [x26]
000000000007ede8	ldr	x8, [x8, #0x60]
000000000007edec	mov	x0, x26
000000000007edf0	mov	w1, #0x2
000000000007edf4	blr	x8
000000000007edf8	ldp	d0, d1, [sp, #0x90]
000000000007edfc	fcvt	s0, d0
000000000007ee00	fcvt	s1, d1
000000000007ee04	ldp	d2, d3, [sp, #0xa0]
000000000007ee08	fcvt	s2, d2
000000000007ee0c	fcvt	s3, d3
000000000007ee10	ldr	x8, [x26]
000000000007ee14	ldr	x8, [x8, #0x60]
000000000007ee18	mov	x0, x26
000000000007ee1c	mov	w1, #0x3
000000000007ee20	blr	x8
000000000007ee24	ldp	d0, d1, [sp, #0x140]
000000000007ee28	fcvt	s0, d0
000000000007ee2c	fcvt	s1, d1
000000000007ee30	ldp	d2, d3, [sp, #0x150]
000000000007ee34	fcvt	s2, d2
000000000007ee38	fcvt	s3, d3
000000000007ee3c	ldr	x8, [x26]
000000000007ee40	ldr	x8, [x8, #0x60]
000000000007ee44	mov	x0, x26
000000000007ee48	mov	w1, #0x4
000000000007ee4c	blr	x8
000000000007ee50	ldp	d0, d1, [sp, #0x160]
000000000007ee54	fcvt	s0, d0
000000000007ee58	fcvt	s1, d1
000000000007ee5c	ldp	d2, d3, [sp, #0x170]
000000000007ee60	fcvt	s2, d2
000000000007ee64	fcvt	s3, d3
000000000007ee68	ldr	x8, [x26]
000000000007ee6c	ldr	x8, [x8, #0x60]
000000000007ee70	mov	x0, x26
000000000007ee74	mov	w1, #0x5
000000000007ee78	blr	x8
000000000007ee7c	ldp	d0, d1, [sp, #0x180]
000000000007ee80	fcvt	s0, d0
000000000007ee84	fcvt	s1, d1
000000000007ee88	ldp	d2, d3, [sp, #0x190]
000000000007ee8c	fcvt	s2, d2
000000000007ee90	fcvt	s3, d3
000000000007ee94	ldr	x8, [x26]
000000000007ee98	ldr	x8, [x8, #0x60]
000000000007ee9c	mov	x0, x26
000000000007eea0	mov	w1, #0x6
000000000007eea4	blr	x8
000000000007eea8	ldp	d0, d1, [sp, #0x1a0]
000000000007eeac	fcvt	s0, d0
000000000007eeb0	fcvt	s1, d1
000000000007eeb4	ldp	d2, d3, [sp, #0x1b0]
000000000007eeb8	fcvt	s2, d2
000000000007eebc	fcvt	s3, d3
000000000007eec0	ldr	x8, [x26]
000000000007eec4	ldr	x8, [x8, #0x60]
000000000007eec8	mov	x0, x26
000000000007eecc	mov	w1, #0x7
000000000007eed0	blr	x8
000000000007eed4	scvtf	s0, w27
000000000007eed8	ldr	x8, [x26]
000000000007eedc	ldr	x8, [x8, #0x60]
000000000007eee0	movi.2d	v1, #0000000000000000
000000000007eee4	movi.2d	v2, #0000000000000000
000000000007eee8	movi.2d	v3, #0000000000000000
000000000007eeec	mov	x0, x26
000000000007eef0	mov	w1, #0xb
000000000007eef4	blr	x8
000000000007eef8	ldr	x8, [x26]
000000000007eefc	ldr	x8, [x8, #0x18]
000000000007ef00	mov	x0, x26
000000000007ef04	blr	x8
000000000007ef08	str	x26, [sp, #0x30]
000000000007ef0c	ldr	x8, [x26]
000000000007ef10	ldr	x8, [x8, #0x10]
000000000007ef14	mov	x0, x26
000000000007ef18	blr	x8
000000000007ef1c	add	x2, sp, #0x30
000000000007ef20	mov	x0, x23
000000000007ef24	mov	x3, x22
000000000007ef28	mov	x4, x20
000000000007ef2c	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000007ef30	add	x2, sp, #0x30
000000000007ef34	mov	x0, x20
000000000007ef38	bl	"_objc_msgSend$setHeliumRef:"
000000000007ef3c	ldr	x0, [sp, #0x30]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm6 : FloatSlider
    parm7 : IntSlider
    parm8 : IntSlider
    parm9 : FloatSlider
    parm10 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm5 (float)
    - parm6 (float)
    - parm9 (float)
    - parm10 (float)
    - parm7 (float)
    - parm8 (float)
    - parm4 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 8  <-  (constant / computed / multi-pass — read the disasm)
    slot 9  <-  parm5 (float)
    slot 10  <-  parm1 (float)
    slot 12  <-  (constant / computed / multi-pass — read the disasm)
    slot 13  <-  parm4 (float)
    slot 14  <-  parm3 (float)
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm3 (float)
    slot 2  <-  parm3 (float)
    slot 3  <-  parm3 (float)
    slot 4  <-  parm3 (float)
    slot 5  <-  parm3 (float)
    slot 6  <-  parm3 (float)
    slot 7  <-  parm3 (float)
    slot 11  <-  (constant / computed / multi-pass — read the disasm)
```
