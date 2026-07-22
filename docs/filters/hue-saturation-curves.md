# Hue/Saturation Curves

- **PAE class:** `Hue/Saturation Curves`
- **Plugin UUID:** `23723AD7-62C4-4ED0-A8C6-FA5A2D7162E4`
- **Node names in corpus:** Hue/Saturation Curves copy (2), Hue/Saturation Curves (2)
- **Corpus usage:** 2 files, 4 instances

## What it does

Hue/Saturation Curves is FCP's curve-based secondary color tool: it lets you reshape color via curves keyed on hue, saturation, and luma (Hue vs Hue, Hue vs Sat, Hue vs Luma, Luma vs Sat, Sat vs Sat, plus a custom range). It is a full curve panel, not a single-slider filter.

> **Note.** Not implemented; description is the standard FCP "Hue/Saturation Curves" tool.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Hue vs. Hue | curve | - | - | Shifts hue as a function of hue (rotate specific hues). |
| Hue vs. Saturation | curve | - | - | Adjusts saturation as a function of hue. |
| Hue vs. Luma | curve | - | - | Adjusts luma as a function of hue. |
| Luma vs. Saturation | curve | - | - | Adjusts saturation as a function of luma. |
| Saturation vs. Saturation | curve | - | - | Adjusts saturation as a function of saturation. |
| Custom vs. Saturation | curve | - | - | Adjusts saturation for a custom-picked color range. |
| Preserve Luma | bool | 1 | 1 .. 1 | Keep luminance constant while shifting color. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcColorCurves`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcColorCurves` → [`HgcColorCurves.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorCurves.metal)

```metal
//Metal1.0     
//LEN=00000015af
[[ visible ]] FragmentOut HgcColorCurves_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1, 
    texture2d< float > hg_Texture2, 
    sampler hg_Sampler2, 
    texture2d< float > hg_Texture3, 
    sampler hg_Sampler3, 
    texture2d< float > hg_Texture4, 
    sampler hg_Sampler4)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz;
    r2.xyz = float3(dot(r1.xyz, hg_Params[4].xyz));
    r3.x = fmax(r2.x, hg_Params[10].x);
    r3.x = fmin(r3.x, hg_Params[11].x);
    r3.x = r3.x*hg_Params[18].x;
    r3.x = fmax(r3.x, c0.x);
    r4.x = hg_Params[18].x - c0.x;
    r3.x = fmin(r3.x, r4.x);
    r3.y = c0.x;
    r3.x = hg_Texture1.sample(hg_Sampler1, r3.xy).x;
    r4.xyz = r2.xyz - hg_Params[11].xxx;
    r4.xyz = fmax(r4.xyz, c0.yyy);
    r4.xyz = r4.xyz*hg_Params[11].zzz + hg_Params[11].yyy;
    r5.xyz = r2.xyz - hg_Params[11].xxx;
    r5.xyz = select(r4.xyz, r3.xxx, r5.xyz < 0.00000f);
    r3.xyz = r2.xyz - hg_Params[10].xxx;
    r3.xyz = fmin(r3.xyz, c0.yyy);
    r3.xyz = r3.xyz*hg_Params[10].zzz + hg_Params[10].yyy;
    r4.xyz = r2.xyz - hg_Params[10].xxx;
    r5.xyz = select(r5.xyz, r3.xyz, r4.xyz < 0.00000f);
    r5.xyz = r5.xyz - r2.xyz;
    r1.xyz = r1.xyz + r5.xyz;
    r4.xyz = r1.xyz;
    r1.x = dot(r1.xyz, hg_Params[4].xyz);
    r3.xyz = fmax(r4.xyz, hg_Params[12].xxx);
    r3.xyz = fmin(r3.xyz, hg_Params[13].xxx);
    r2.x = r3.x*hg_Params[19].x;
    r2.x = fmax(r2.x, c0.x);
    r5.x = hg_Params[19].x - c0.x;
    r2.x = fmin(r2.x, r5.x);
    r2.y = c0.x;
    r3.x = hg_Texture2.sample(hg_Sampler2, r2.xy).x;
    r5.x = r3.y*hg_Params[19].x;
    r5.x = fmax(r5.x, c0.x);
    r2.x = hg_Params[19].x - c0.x;
    r5.x = fmin(r5.x, r2.x);
    r5.y = c0.x;
    r5.x = hg_Texture2.sample(hg_Sampler2, r5.xy).x;
    r3.y = r5.x;
    r2.x = r3.z*hg_Params[19].x;
    r2.x = fmax(r2.x, c0.x);
    r5.x = hg_Params[19].x - c0.x;
    r2.x = fmin(r2.x, r5.x);
    r2.y = c0.x;
    r2.x = hg_Texture2.sample(hg_Sampler2, r2.xy).x;
    r3.z = r2.x;
    r5.xyz = r4.xyz - hg_Params[13].xxx;
    r5.xyz = fmax(r5.xyz, c0.yyy);
    r5.xyz = r5.xyz*hg_Params[13].zzz + hg_Params[13].yyy;
    r2.xyz = r4.xyz - hg_Params[13].xxx;
    r2.xyz = select(r5.xyz, r3.xyz, r2.xyz < 0.00000f);
    r3.xyz = r4.xyz - hg_Params[12].xxx;
    r3.xyz = fmin(r3.xyz, c0.yyy);
    r3.xyz = r3.xyz*hg_Params[12].zzz + hg_Params[12].yyy;
    r5.xyz = r4.xyz - hg_Params[12].xxx;
    r2.xyz = select(r2.xyz, r3.xyz, r5.xyz < 0.00000f);
    r4.xyz = mix(r4.xyz, r2.xyz, hg_Params[0].xyz);
    r5.xyz = fmax(r4.xyz, hg_Params[14].xxx);
    r5.xyz = fmin(r5.xyz, hg_Params[15].xxx);
    r3.x = r5.x*hg_Params[20].x;
    r3.x = fmax(r3.x, c0.x);
    r2.x = hg_Params[20].x - c0.x;
    r3.x = fmin(r3.x, r2.x);
    r3.y = c0.x;
    r5.x = hg_Texture3.sample(hg_Sampler3, r3.xy).x;
    r2.x = r5.y*hg_Params[20].x;
    r2.x = fmax(r2.x, c0.x);
    r3.x = hg_Params[20].x - c0.x;
    r2.x = fmin(r2.x, r3.x);
    r2.y = c0.x;
    r2.x = hg_Texture3.sample(hg_Sampler3, r2.xy).x;
    r5.y = r2.x;
    r3.x = r5.z*hg_Params[20].x;
    r3.x = fmax(r3.x, c0.x);
    r2.x = hg_Params[20].x - c0.x;
    r3.x = fmin(r3.x, r2.x);
    r3.y = c0.x;
    r3.x = hg_Texture3.sample(hg_Sampler3, r3.xy).x;
    r5.z = r3.x;
    r2.xyz = r4.xyz - hg_Params[15].xxx;
    r2.xyz = fmax(r2.xyz, c0.yyy);
    r2.xyz = r2.xyz*hg_Params[15].zzz + hg_Params[15].yyy;
    r3.xyz = r4.xyz - hg_Params[15].xxx;
    r3.xyz = select(r2.xyz, r5.xyz, r3.xyz < 0.00000f);
    r5.xyz = r4.xyz - hg_Params[14].xxx;
    r5.xyz = fmin(r5.xyz, c0.yyy);
    r5.xyz = r5.xyz*hg_Params[14].zzz + hg_Params[14].yyy;
    r2.xyz = r4.xyz - hg_Params[14].xxx;
    r3.xyz = select(r3.xyz, r5.xyz, r2.xyz < 0.00000f);
    r4.xyz = mix(r4.xyz, r3.xyz, hg_Params[1].xyz);
    r2.xyz = fmax(r4.xyz, hg_Params[16].xxx);
    r2.xyz = fmin(r2.xyz, hg_Params[17].xxx);
    r5.x = r2.x*hg_Params[21].x;
    r5.x = fmax(r5.x, c0.x);
    r3.x = hg_Params[21].x - c0.x;
    r5.x = fmin(r5.x, r3.x);
    r5.y = c0.x;
    r2.x = hg_Texture4.sample(hg_Sampler4, r5.xy).x;
    r3.x = r2.y*hg_Params[21].x;
    r3.x = fmax(r3.x, c0.x);
    r5.x = hg_Params[21].x - c0.x;
    r3.x = fmin(r3.x, r5.x);
    r3.y = c0.x;
    r3.x = hg_Texture4.sample(hg_Sampler4, r3.xy).x;
    r2.y = r3.x;
    r5.x = r2.z*hg_Params[21].x;
    r5.x = fmax(r5.x, c0.x);
    r3.x = hg_Params[21].x - c0.x;
    r5.x = fmin(r5.x, r3.x);
    r5.y = c0.x;
    r5.x = hg_Texture4.sample(hg_Sampler4, r5.xy).x;
    r2.z = r5.x;
    r3.xyz = r4.xyz - hg_Params[17].xxx;
    r3.xyz = fmax(r3.xyz, c0.yyy);
    r3.xyz = r3.xyz*hg_Params[17].zzz + hg_Params[17].yyy;
    r5.xyz = r4.xyz - hg_Params[17].xxx;
    r5.xyz = select(r3.xyz, r2.xyz, r5.xyz < 0.00000f);
    r2.xyz = r4.xyz - hg_Params[16].xxx;
    r2.xyz = fmin(r2.xyz, c0.yyy);
    r2.xyz = r2.xyz*hg_Params[16].zzz + hg_Params[16].yyy;
    r3.xyz = r4.xyz - hg_Params[16].xxx;
    r5.xyz = select(r5.xyz, r2.xyz, r3.xyz < 0.00000f);
    r5.xyz = mix(r4.xyz, r5.xyz, hg_Params[2].xyz);
    r3.x = dot(r5.xyz, hg_Params[4].xyz);
    r3.x = select(r3.x, r1.x, hg_Params[3].x < 0.00000f);
    r3.y = dot(r5.xyz, hg_Params[5].xyz);
    r3.z = dot(r5.xyz, hg_Params[6].xyz);
    r2.x = dot(r3.xyz, hg_Params[7].xyz);
    r2.y = dot(r3.xyz, hg_Params[8].xyz);
    r2.z = dot(r3.xyz, hg_Params[9].xyz);
    r2.w = r0.w;
    output.color0 = r2;
    return output;
}
```

### CPU parameter wiring — `-[PAEColorCurvesEffect overrideRender:withOutputImage:inputImage:input:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEColorCurvesEffect`

```asm
0000000000092108	sub	sp, sp, #0x80
000000000009210c	stp	x28, x27, [sp, #0x20]
0000000000092110	stp	x26, x25, [sp, #0x30]
0000000000092114	stp	x24, x23, [sp, #0x40]
0000000000092118	stp	x22, x21, [sp, #0x50]
000000000009211c	stp	x20, x19, [sp, #0x60]
0000000000092120	stp	x29, x30, [sp, #0x70]
0000000000092124	add	x29, sp, #0x70
0000000000092128	mov	x23, x6
000000000009212c	mov	x24, x5
0000000000092130	mov	x20, x3
0000000000092134	mov	x21, x2
0000000000092138	mov	x22, x0
000000000009213c	ldr	x8, [x5]
0000000000092140	ldr	x8, [x8, #0x80]
0000000000092144	mov	x0, x5
0000000000092148	mov	w1, #0x0
000000000009214c	blr	x8
0000000000092150	mov	x19, x0
0000000000092154	cbz	x0, 0x92168
0000000000092158	ldr	x8, [x19]
000000000009215c	ldr	x8, [x8, #0x10]
0000000000092160	mov	x0, x19
0000000000092164	blr	x8
0000000000092168	adrp	x8, 972 ; 0x45e000
000000000009216c	ldrsw	x8, [x8, #0xb64]
0000000000092170	ldr	w8, [x22, x8]
0000000000092174	cmp	w8, #0x1
0000000000092178	b.ne	0x92184
000000000009217c	mov	w26, #0x1
0000000000092180	b	0x921a4
0000000000092184	adrp	x8, 982 ; 0x468000
0000000000092188	ldr	x8, [x8, #0x1f8]
000000000009218c	cmn	x8, #0x1
0000000000092190	b.ne	0x92320
0000000000092194	adrp	x8, 982 ; 0x468000
0000000000092198	ldr	w8, [x8, #0x1f0]
000000000009219c	cmp	w8, #0x0
00000000000921a0	cset	w26, ne
00000000000921a4	mov	x0, x22
00000000000921a8	bl	0x252314 ; symbol stub for: _objc_opt_class
00000000000921ac	mov	x2, x21
00000000000921b0	bl	"_objc_msgSend$colorPrimaries:"
00000000000921b4	cmp	x0, #0x1
00000000000921b8	csinc	w8, w26, wzr, ne
00000000000921bc	mov	w9, #0x1
00000000000921c0	mov	w10, #0x2
00000000000921c4	cmp	w8, #0x0
00000000000921c8	csel	w8, w10, wzr, ne
00000000000921cc	cinc	w25, w9, ne
00000000000921d0	cmp	w26, #0x0
00000000000921d4	csinc	w27, w8, wzr, eq
00000000000921d8	mov	x0, x24
00000000000921dc	mov	x1, x25
00000000000921e0	mov	x2, x25
00000000000921e4	mov	x3, x27
00000000000921e8	mov	w4, #0x1
00000000000921ec	mov	w5, #0x0
00000000000921f0	bl	0x250c64 ; symbol stub for: _PAECreateGammaEncodingNode
00000000000921f4	mov	x24, x0
00000000000921f8	mov	x0, x22
00000000000921fc	bl	_objc_msgSend$newNodeForCorrector
0000000000092200	mov	x26, x0
0000000000092204	cmp	x0, #0x0
0000000000092208	csel	x0, x24, x0, eq
000000000009220c	mov	x1, x25
0000000000092210	mov	x2, x25
0000000000092214	mov	x3, x27
0000000000092218	mov	w4, #0x0
000000000009221c	mov	w5, #0x1
0000000000092220	bl	0x250c58 ; symbol stub for: _PAECreateGammaDecodingNode
0000000000092224	mov	x25, x0
0000000000092228	cbz	x26, 0x9227c
000000000009222c	ldr	x8, [x23]
0000000000092230	adrp	x9, 758 ; 0x388000
0000000000092234	ldr	x9, [x9, #0x488] ; literal pool symbol address: _kCMTimeZero
0000000000092238	cmp	x8, #0x0
000000000009223c	csel	x8, x9, x8, eq
0000000000092240	ldr	x9, [x8, #0x10]
0000000000092244	ldr	q0, [x8]
0000000000092248	str	q0, [sp]
000000000009224c	str	x9, [sp, #0x10]
0000000000092250	mov	x4, sp
0000000000092254	mov	x0, x22
0000000000092258	mov	x2, x21
000000000009225c	mov	x3, x26
0000000000092260	bl	"_objc_msgSend$setParameters:onNodeCorrector:time:"
0000000000092264	ldr	x8, [x26]
0000000000092268	ldr	x8, [x8, #0x78]
000000000009226c	mov	x0, x26
0000000000092270	mov	w1, #0x0
0000000000092274	mov	x2, x24
0000000000092278	blr	x8
000000000009227c	cbz	x25, 0x92290
0000000000092280	ldr	x8, [x25]
0000000000092284	ldr	x8, [x8, #0x10]
0000000000092288	mov	x0, x25
000000000009228c	blr	x8
0000000000092290	str	x25, [sp]
0000000000092294	mov	x2, sp
0000000000092298	mov	x0, x20
000000000009229c	bl	"_objc_msgSend$setHeliumRef:"
00000000000922a0	ldr	x0, [sp]
00000000000922a4	cbz	x0, 0x922b4
00000000000922a8	ldr	x8, [x0]
00000000000922ac	ldr	x8, [x8, #0x18]
00000000000922b0	blr	x8
00000000000922b4	cbz	x26, 0x922c8
00000000000922b8	ldr	x8, [x26]
00000000000922bc	ldr	x8, [x8, #0x18]
00000000000922c0	mov	x0, x26
00000000000922c4	blr	x8
00000000000922c8	ldr	x8, [x24]
00000000000922cc	ldr	x8, [x8, #0x18]
00000000000922d0	mov	x0, x24
00000000000922d4	blr	x8
00000000000922d8	ldr	x8, [x25]
00000000000922dc	ldr	x8, [x8, #0x18]
00000000000922e0	mov	x0, x25
00000000000922e4	blr	x8
00000000000922e8	cbz	x19, 0x922fc
00000000000922ec	ldr	x8, [x19]
00000000000922f0	ldr	x8, [x8, #0x18]
00000000000922f4	mov	x0, x19
00000000000922f8	blr	x8
00000000000922fc	mov	w0, #0x1
0000000000092300	ldp	x29, x30, [sp, #0x70]
0000000000092304	ldp	x20, x19, [sp, #0x60]
0000000000092308	ldp	x22, x21, [sp, #0x50]
000000000009230c	ldp	x24, x23, [sp, #0x40]
0000000000092310	ldp	x26, x25, [sp, #0x30]
0000000000092314	ldp	x28, x27, [sp, #0x20]
0000000000092318	add	sp, sp, #0x80
000000000009231c	ret
0000000000092320	bl	"-[PAEColorCurvesEffect overrideRender:withOutputImage:inputImage:input:withInfo:].cold.1"
0000000000092324	b	0x92194
0000000000092328	bl	___clang_call_terminate
000000000009232c	bl	___clang_call_terminate
0000000000092330	b	0x92360
0000000000092334	mov	x20, x0
0000000000092338	ldr	x0, [sp]
000000000009233c	cbz	x0, 0x92364
0000000000092340	ldr	x8, [x0]
0000000000092344	ldr	x8, [x8, #0x18]
0000000000092348	blr	x8
000000000009234c	b	0x92364
0000000000092350	bl	___clang_call_terminate
0000000000092354	b	0x92360
0000000000092358	b	0x92360
000000000009235c	b	0x92360
0000000000092360	mov	x20, x0
0000000000092364	cbz	x19, 0x92378
0000000000092368	ldr	x8, [x19]
000000000009236c	ldr	x8, [x8, #0x18]
0000000000092370	mov	x0, x19
0000000000092374	blr	x8
0000000000092378	mov	x0, x20
000000000009237c	bl	0x250d18 ; symbol stub for: __Unwind_Resume
0000000000092380	bl	___clang_call_terminate
```
