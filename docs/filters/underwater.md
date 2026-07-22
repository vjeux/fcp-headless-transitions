# Underwater

- **PAE class:** `Underwater`
- **Plugin UUID:** `9FA1F483-1E09-4DD0-870F-C32777D7F1B0`
- **Node names in corpus:** Refraction (121), Underwater (55), Distortion (4), Underwater 1 (2), Animation (2), Underwater copy (1)
- **Corpus usage:** 111 files, 188 instances

## What it does

Underwater applies a sinusoidal refraction wobble: the source is resampled through a smoothly space-varying displacement field that is the sum of ten sine waves of decreasing frequency and time-drifting phase -- exactly the look of light refracting through a rippling water surface. Size sets wave scale, Speed the animation rate, Refraction the displacement gain. Implemented and RE'd from the HgcUnderwaterFreqSynth + RefractV2 shaders.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float | 2 | 0.02 .. 72 | Spatial scale of the wave field (default 2). Larger = broader, gentler ripples; smaller = tighter wobble. |
| Speed | float | 0.5 | 0 .. 100 | Animation rate of the wave phases (default 0.5). Only the phase advances over time; 0 = a static frozen ripple. |
| Refraction | float | 100 | 0 .. 540 | Displacement gain -- how far pixels are pushed by the waves (default 100). 0 = passthrough (identity). *(keyframed in 7 instances)* |
| Repeat Edges | bool | 0 | 0 .. 1 | When on, samples outside the frame wrap/repeat rather than clamp. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the refracted result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 6 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/underwater.ts`](../../engine/src/compositor/filters/underwater.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcUnderwaterRefractV2`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcUnderwaterRefractV2` → [`HgcUnderwaterRefractV2.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcUnderwaterRefractV2.metal)

```metal
//Metal1.0     
//LEN=0000000bd2
[[ visible ]] FragmentOut HgcUnderwaterRefractV2_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(6.281380177, 1.000000000, 0.000000000, 0.5000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[2]);
    r0.w = 1.00000f / r0.x;
    r0.z = 1.00000f / hg_Params[6].z;
    r0.y = dot(texCoord0, hg_Params[1]);
    r0.x = dot(texCoord0, hg_Params[0]);
    r0.xy = r0.xy*r0.ww;
    r1.w = r0.x*r0.z + c0.w;
    r1.z = 1.00000f / hg_Params[7].z;
    r1.z = r0.y*r1.z + c0.w;
    r0.zw = mix(hg_Params[9].xy, hg_Params[9].zw, r1.ww);
    r1.xy = mix(hg_Params[14].xy, hg_Params[14].zw, r1.ww);
    r2.xy = mix(r0.zw, r1.xy, r1.zz);
    r2.xy = r2.xy*c0.xx;
    r1.xy = mix(hg_Params[10].xy, hg_Params[10].zw, r1.ww);
    r0.zw = mix(hg_Params[15].xy, hg_Params[15].zw, r1.ww);
    r0.zw = mix(r1.xy, r0.zw, r1.zz);
    r2.z = sin(r2.x);
    r2.x = r0.z*c0.x;
    r1.x = sin(r2.y);
    r1.y = r1.x*hg_Params[20].y;
    r2.y = sin(r2.x);
    r0.z = r0.w*c0.x;
    r1.y = r2.z*hg_Params[19].y + r1.y;
    r2.w = r1.x*hg_Params[20].x;
    r0.w = r2.y*hg_Params[21].y + r1.y;
    r2.x = sin(r0.z);
    r3.x = r2.x*hg_Params[22].y + r0.w;
    r1.xy = mix(hg_Params[11].xy, hg_Params[11].zw, r1.ww);
    r0.zw = mix(hg_Params[16].xy, hg_Params[16].zw, r1.ww);
    r0.zw = mix(r1.xy, r0.zw, r1.zz);
    r2.z = r2.z*hg_Params[19].x + r2.w;
    r1.x = r2.y*hg_Params[21].x + r2.z;
    r1.y = r2.x*hg_Params[22].x + r1.x;
    r0.zw = r0.zw*c0.xx;
    r1.x = sin(r0.z);
    r2.xy = mix(hg_Params[12].xy, hg_Params[12].zw, r1.ww);
    r0.z = r1.x*hg_Params[23].x + r1.y;
    r2.z = r1.x*hg_Params[23].y + r3.x;
    r1.xy = mix(hg_Params[17].xy, hg_Params[17].zw, r1.ww);
    r1.xy = mix(r2.xy, r1.xy, r1.zz);
    r2.y = r1.x*c0.x;
    r0.w = sin(r0.w);
    r2.x = r0.w*hg_Params[24].y + r2.z;
    r2.z = r0.w*hg_Params[24].x + r0.z;
    r1.x = r1.y*c0.x;
    r2.y = sin(r2.y);
    r1.y = r2.y*hg_Params[25].y + r2.x;
    r2.x = sin(r1.x);
    r2.w = r2.x*hg_Params[26].y + r1.y;
    r1.xy = mix(hg_Params[13].xy, hg_Params[13].zw, r1.ww);
    r0.zw = mix(hg_Params[18].xy, hg_Params[18].zw, r1.ww);
    r0.zw = mix(r1.xy, r0.zw, r1.zz);
    r3.w = r2.y*hg_Params[25].x + r2.z;
    r0.zw = r0.zw*c0.xx;
    r0.zw = sin(r0.zw);
    r3.x = r2.x*hg_Params[26].x + r3.w;
    r3.x = r0.z*hg_Params[27].x + r3.x;
    r3.x = r0.w*hg_Params[28].x + r3.x;
    r0.x = r3.x*hg_Params[8].x + r0.x;
    r0.z = r0.z*hg_Params[27].y + r2.w;
    r1.x = r0.w*hg_Params[28].y + r0.z;
    r0.y = r1.x*hg_Params[8].y + r0.y;
    r0.w = c0.y;
    r3.x = dot(r0.xyw, hg_Params[5].xyz);
    r3.z = 1.00000f / r3.x;
    r3.y = dot(r0.xyw, hg_Params[4].xyz);
    r3.x = dot(r0.xyw, hg_Params[3].xyz);
    r3.xy = r3.xy*r3.zz;
    r3.xy = r3.xy + hg_Params[29].xy;
    r3.xy = r3.xy*hg_Params[29].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r3.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEUnderwater canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEUnderwater`

```asm
0000000000065fdc	mov	w3, #0x3
0000000000065fe0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000065fe4	ldr	d0, [sp, #0x4b8]
0000000000065fe8	fcmp	d0, #0.0
0000000000065fec	b.ne	0x66004
0000000000065ff0	cbz	x27, 0x66444
0000000000065ff4	add	x8, sp, #0x70
0000000000065ff8	mov	x0, x27
0000000000065ffc	bl	_objc_msgSend$heliumRef
0000000000066000	b	0x66448
0000000000066004	mov	x0, x27
0000000000066008	bl	_objc_msgSend$width
000000000006600c	mov	x24, x0
0000000000066010	mov	x0, x27
0000000000066014	bl	_objc_msgSend$height
0000000000066018	mov	x25, x0
000000000006601c	mov	x0, x20
0000000000066020	bl	_objc_msgSend$imageType
0000000000066024	mov	x26, x0
0000000000066028	ldr	x2, [x22]
000000000006602c	mov	x0, x21
0000000000066030	bl	"_objc_msgSend$getRenderMode:"
0000000000066034	mov	x8, x0
0000000000066038	mov	w0, #0x0
000000000006603c	cbz	w8, 0x66750
0000000000066040	cmp	x26, #0x3
0000000000066044	b.ne	0x66750
0000000000066048	add	x8, sp, #0x438
000000000006604c	mov	x0, x21
0000000000066050	mov	x2, x27
0000000000066054	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000066058	add	x8, sp, #0x3b8
000000000006605c	mov	x0, x21
0000000000066060	mov	x2, x27
0000000000066064	bl	"_objc_msgSend$getInversePixelTransformForImage:"
0000000000066068	ldr	x4, [x22]
000000000006606c	add	x2, sp, #0x3b0
0000000000066070	mov	x0, x23
0000000000066074	mov	w3, #0x1
0000000000066078	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006607c	ldr	d0, [sp, #0x3b0]
0000000000066080	adrp	x8, 514 ; 0x268000
0000000000066084	ldr	d1, [x8, #0xc50]
0000000000066088	fmul	d8, d0, d1
000000000006608c	str	d8, [sp, #0x3b0]
0000000000066090	ldr	x4, [x22]
0000000000066094	add	x2, sp, #0x3a8
0000000000066098	mov	x0, x23
000000000006609c	mov	w3, #0x2
00000000000660a0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000660a4	ldr	x4, [x22]
00000000000660a8	add	x2, sp, #0x3a7
00000000000660ac	mov	x0, x23
00000000000660b0	mov	w3, #0x6
00000000000660b4	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000660b8	ucvtf	d1, x24
00000000000660bc	mov	w23, #0x4d69
00000000000660c0	movk	w23, #0x2, lsl #16
00000000000660c4	add	x8, sp, #0x70
00000000000660c8	add	x24, x8, #0x8
00000000000660cc	ucvtf	d0, x25
00000000000660d0	stp	d1, d0, [sp, #0x18]
00000000000660d4	mov	w10, #0x2323
00000000000660d8	movk	w10, #0x2323, lsl #16
00000000000660dc	mov	w9, #0x8
00000000000660e0	mov	x25, #0x2319
00000000000660e4	movk	x25, #0x8187, lsl #16
00000000000660e8	movk	x25, #0x9956, lsl #32
00000000000660ec	movk	x25, #0x5dfc, lsl #48
00000000000660f0	mov	w11, #0xe529
00000000000660f4	movk	w11, #0xa, lsl #16
00000000000660f8	add	x10, x23, x10, lsl #12
00000000000660fc	umulh	x12, x10, x25
0000000000066100	lsr	x12, x12, #18
0000000000066104	msub	x10, x12, x11, x10
0000000000066108	str	x10, [x8, x9]
000000000006610c	add	x9, x9, #0x8
0000000000066110	cmp	x9, #0x330
0000000000066114	b.ne	0x660f8
0000000000066118	str	d8, [sp, #0x40]
000000000006611c	stp	x20, x27, [sp, #0x28]
0000000000066120	ldr	x2, [x22]
0000000000066124	mov	x0, x21
0000000000066128	bl	"_objc_msgSend$secondsFromFxTime:"
000000000006612c	mov	x22, #0x0
0000000000066130	fcvt	s0, d0
0000000000066134	fcvt	d0, s0
0000000000066138	ldr	d1, [sp, #0x3a8]
000000000006613c	fmul	d0, d1, d0
0000000000066140	str	d0, [sp, #0x50]
0000000000066144	add	x8, sp, #0x4c0
0000000000066148	add	x26, x8, #0x8
000000000006614c	mov	w20, #0xf638
0000000000066150	movk	w20, #0x6, lsl #16
0000000000066154	mov	x27, #0xaee5
0000000000066158	movk	x27, #0x2d9f, lsl #16
000000000006615c	movk	x27, #0x8656, lsl #32
0000000000066160	movk	x27, #0x446f, lsl #48
0000000000066164	mov	w28, #0x65
0000000000066168	adrp	x8, 515 ; 0x269000
000000000006616c	ldr	s9, [x8, #0x614]
0000000000066170	adrp	x8, 515 ; 0x269000
0000000000066174	ldr	s0, [x8, #0x820]
0000000000066178	str	s0, [sp, #0x4c]
000000000006617c	mov	w19, #0xe529
0000000000066180	movk	w19, #0xa, lsl #16
0000000000066184	movi.2d	v13, #0000000000000000
0000000000066188	movi.2d	v14, #0000000000000000
000000000006618c	movi.2d	v12, #0000000000000000
0000000000066190	movi.2d	v15, #0000000000000000
0000000000066194	umulh	x8, x20, x27
0000000000066198	sub	x9, x20, x8
000000000006619c	add	x8, x8, x9, lsr #1
00000000000661a0	lsr	x8, x8, #6
00000000000661a4	msub	x8, x8, x28, x20
00000000000661a8	ldr	x9, [x24, x8, lsl #3]
00000000000661ac	add	x10, x23, x9, lsl #12
00000000000661b0	umulh	x11, x10, x25
00000000000661b4	lsr	x11, x11, #18
00000000000661b8	msub	x10, x11, x19, x10
00000000000661bc	str	x10, [x24, x8, lsl #3]
00000000000661c0	ucvtf	s0, x9
00000000000661c4	fdiv	s0, s0, s9
00000000000661c8	ldr	s2, [sp, #0x4c]
00000000000661cc	fmul	s0, s0, s2
00000000000661d0	umulh	x8, x9, x27
00000000000661d4	sub	x10, x9, x8
00000000000661d8	add	x8, x8, x10, lsr #1
00000000000661dc	lsr	x8, x8, #6
00000000000661e0	msub	x8, x8, x28, x9
00000000000661e4	ldr	x9, [x24, x8, lsl #3]
00000000000661e8	add	x10, x23, x9, lsl #12
00000000000661ec	umulh	x11, x10, x25
00000000000661f0	lsr	x11, x11, #18
00000000000661f4	msub	x10, x11, x19, x10
00000000000661f8	str	x10, [x24, x8, lsl #3]
00000000000661fc	ucvtf	s1, x9
0000000000066200	movi.2d	v3, #0000000000000000
0000000000066204	fadd	s0, s0, s3
0000000000066208	fdiv	s1, s1, s9
000000000006620c	fmul	s1, s1, s2
0000000000066210	umulh	x8, x9, x27
0000000000066214	sub	x10, x9, x8
0000000000066218	add	x8, x8, x10, lsr #1
000000000006621c	lsr	x8, x8, #6
0000000000066220	msub	x8, x8, x28, x9
0000000000066224	ldr	x20, [x24, x8, lsl #3]
0000000000066228	add	x9, x23, x20, lsl #12
000000000006622c	umulh	x10, x9, x25
0000000000066230	lsr	x10, x10, #18
0000000000066234	msub	x9, x10, x19, x9
0000000000066238	str	x9, [x24, x8, lsl #3]
000000000006623c	ucvtf	s2, x20
0000000000066240	fadd	s10, s1, s3
0000000000066244	fdiv	s1, s2, s9
0000000000066248	fmov	s3, #0.25000000
000000000006624c	fmul	s1, s1, s3
0000000000066250	fmov	s2, #0.75000000
0000000000066254	fadd	s1, s1, s2
0000000000066258	ucvtf	s2, w22, #0x2
000000000006625c	fmov	s4, #1.00000000
0000000000066260	fadd	s11, s2, s4
0000000000066264	fdiv	s2, s4, s11
0000000000066268	fmul	s1, s2, s1
000000000006626c	fmul	s1, s1, s3
0000000000066270	str	s1, [x26, #0x4]
0000000000066274	mov.16b	v8, v12
0000000000066278	fmul	s12, s11, s1
000000000006627c	bl	0x252068 ; symbol stub for: ___sincosf_stret
0000000000066280	fmul	s1, s1, s12
0000000000066284	fmul	s0, s0, s12
0000000000066288	stp	s1, s0, [x26, #-0x8]
000000000006628c	fcvt	d2, s10
0000000000066290	fcvt	d3, s11
0000000000066294	ldr	d4, [sp, #0x50]
0000000000066298	fmul	d3, d4, d3
000000000006629c	fadd	d2, d3, d2
00000000000662a0	fcvt	s2, d2
00000000000662a4	str	s2, [x26], #0x10
00000000000662a8	fadd	s2, s13, s1
00000000000662ac	fadd	s3, s8, s1
00000000000662b0	fcmp	s1, #0.0
00000000000662b4	fcsel	s12, s3, s8, lt
00000000000662b8	fcsel	s13, s13, s2, lt
00000000000662bc	fadd	s1, s14, s0
00000000000662c0	fadd	s2, s15, s0
00000000000662c4	fcmp	s0, #0.0
00000000000662c8	fcsel	s15, s2, s15, lt
00000000000662cc	fcsel	s14, s14, s1, lt
00000000000662d0	add	x22, x22, #0x1
00000000000662d4	cmp	x22, #0xa
00000000000662d8	b.ne	0x66194
00000000000662dc	str	x20, [sp, #0x70]
00000000000662e0	mov	w0, #0x1b0
00000000000662e4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000662e8	mov	x22, x0
00000000000662ec	bl	__ZN20HUnderwaterRefractV2C1Ev
00000000000662f0	ldr	x24, [sp, #0x30]
00000000000662f4	add	x8, sp, #0x4c0
00000000000662f8	add	x19, x8, #0x4
00000000000662fc	mov	x20, #-0xa
0000000000066300	ldp	s0, s1, [x19, #-0x4]
0000000000066304	ldr	x8, [x22]
0000000000066308	ldr	x8, [x8, #0x60]
000000000006630c	add	w1, w20, #0x1d
0000000000066310	movi.2d	v2, #0000000000000000
0000000000066314	movi.2d	v3, #0000000000000000
0000000000066318	mov	x0, x22
000000000006631c	blr	x8
0000000000066320	add	x19, x19, #0x10
0000000000066324	adds	x20, x20, #0x1
0000000000066328	b.lo	0x66300
000000000006632c	stp	s15, s12, [sp, #0x8]
0000000000066330	stp	s14, s13, [sp, #0x10]
0000000000066334	mov	x19, #0x0
0000000000066338	ldr	d0, [sp, #0x438]
000000000006633c	ldr	d1, [sp, #0x460]
0000000000066340	ldr	d2, [sp, #0x40]
0000000000066344	fdiv	d0, d0, d2
0000000000066348	fcvt	s3, d0
000000000006634c	fdiv	d0, d1, d2
0000000000066350	fcvt	s0, d0
0000000000066354	stp	s0, s3, [sp, #0x4c]
0000000000066358	fneg	s1, s3
000000000006635c	fneg	s0, s0
0000000000066360	stp	s0, s1, [sp, #0x3c]
0000000000066364	add	x8, sp, #0x4c0
0000000000066368	add	x20, x8, #0x10
000000000006636c	ldp	s2, s12, [x20, #-0x10]
0000000000066370	ldr	s5, [sp, #0x40]
0000000000066374	fmul	s11, s2, s5
0000000000066378	ldp	s1, s6, [sp, #0x4c]
000000000006637c	fmul	s3, s12, s1
0000000000066380	fadd	s0, s11, s3
0000000000066384	ldur	s10, [x20, #-0x8]
0000000000066388	fadd	s0, s10, s0
000000000006638c	ldp	s4, s9, [x20]
0000000000066390	fmul	s14, s4, s5
0000000000066394	fmul	s5, s9, s1
0000000000066398	fadd	s1, s14, s5
000000000006639c	ldr	s13, [x20, #0x8]
00000000000663a0	fadd	s1, s13, s1
00000000000663a4	fmul	s8, s2, s6
00000000000663a8	fadd	s2, s8, s3
00000000000663ac	fadd	s2, s10, s2
00000000000663b0	fmul	s15, s4, s6
00000000000663b4	fadd	s3, s15, s5
00000000000663b8	fadd	s3, s13, s3
00000000000663bc	ldr	x8, [x22]
00000000000663c0	ldr	x8, [x8, #0x60]
00000000000663c4	add	w1, w19, #0x9
00000000000663c8	mov	x0, x22
00000000000663cc	blr	x8
00000000000663d0	ldr	s3, [sp, #0x3c]
00000000000663d4	fmul	s2, s9, s3
00000000000663d8	fadd	s0, s14, s2
00000000000663dc	fadd	s1, s13, s0
00000000000663e0	fmul	s4, s12, s3
00000000000663e4	fadd	s0, s11, s4
00000000000663e8	fadd	s0, s10, s0
00000000000663ec	fadd	s2, s15, s2
00000000000663f0	fadd	s3, s13, s2
00000000000663f4	fadd	s2, s8, s4
00000000000663f8	fadd	s2, s10, s2
00000000000663fc	ldr	x8, [x22]
0000000000066400	ldr	x8, [x8, #0x60]
0000000000066404	add	w1, w19, #0xe
0000000000066408	mov	x0, x22
000000000006640c	blr	x8
0000000000066410	add	x20, x20, #0x20
0000000000066414	add	x19, x19, #0x1
0000000000066418	cmp	x19, #0x5
000000000006641c	b.ne	0x6636c
0000000000066420	cbz	x24, 0x6646c
0000000000066424	add	x8, sp, #0x68
0000000000066428	mov	x0, x24
000000000006642c	bl	_objc_msgSend$heliumRef
0000000000066430	ldr	x19, [sp, #0x28]
0000000000066434	ldr	d8, [sp, #0x20]
0000000000066438	ldp	s10, s9, [sp, #0x10]
000000000006643c	ldp	s12, s11, [sp, #0x8]
0000000000066440	b	0x66480
0000000000066444	str	xzr, [sp, #0x70]
0000000000066448	add	x2, sp, #0x70
000000000006644c	mov	x0, x20
0000000000066450	bl	"_objc_msgSend$setHeliumRef:"
0000000000066454	ldr	x0, [sp, #0x70]
0000000000066458	cbz	x0, 0x6674c
000000000006645c	ldr	x8, [x0]
0000000000066460	ldr	x8, [x8, #0x18]
0000000000066464	blr	x8
0000000000066468	b	0x6674c
000000000006646c	str	xzr, [sp, #0x68]
0000000000066470	ldr	x19, [sp, #0x28]
0000000000066474	ldr	d8, [sp, #0x20]
0000000000066478	ldp	s10, s9, [sp, #0x10]
000000000006647c	ldp	s12, s11, [sp, #0x8]
0000000000066480	ldrb	w8, [sp, #0x3a7]
0000000000066484	cmp	w8, #0x1
0000000000066488	b.ne	0x664e0
000000000006648c	ldr	x0, [sp, #0x68]
0000000000066490	str	x0, [sp, #0x58]
0000000000066494	cbz	x0, 0x664a4
0000000000066498	ldr	x8, [x0]
000000000006649c	ldr	x8, [x8, #0x10]
00000000000664a0	blr	x8
00000000000664a4	add	x8, sp, #0x60
00000000000664a8	add	x2, sp, #0x58
00000000000664ac	mov	x0, x21
00000000000664b0	mov	x3, x24
00000000000664b4	mov	x4, x19
00000000000664b8	bl	"_objc_msgSend$smear:fromImage:toImage:"
00000000000664bc	ldr	x23, [sp, #0x60]
00000000000664c0	cbz	x23, 0x664c8
00000000000664c4	str	xzr, [sp, #0x60]
00000000000664c8	ldr	x0, [sp, #0x58]
00000000000664cc	cbz	x0, 0x664f8
00000000000664d0	ldr	x8, [x0]
00000000000664d4	ldr	x8, [x8, #0x18]
00000000000664d8	blr	x8
00000000000664dc	b	0x664f8
00000000000664e0	ldr	x23, [sp, #0x68]
00000000000664e4	cbz	x23, 0x664f8
00000000000664e8	ldr	x8, [x23]
00000000000664ec	ldr	x8, [x8, #0x10]
00000000000664f0	mov	x0, x23
00000000000664f4	blr	x8
00000000000664f8	ldr	d0, [sp, #0x4b8]
00000000000664fc	fcvt	s0, d0
0000000000066500	ldr	x8, [x22]
0000000000066504	ldr	x8, [x8, #0x60]
0000000000066508	movi.2d	v2, #0000000000000000
000000000006650c	movi.2d	v3, #0000000000000000
0000000000066510	mov	x0, x22
0000000000066514	mov	w1, #0x8
0000000000066518	mov.16b	v1, v0
000000000006651c	blr	x8
0000000000066520	ldr	x8, [x22]
0000000000066524	ldr	x8, [x8, #0x78]
0000000000066528	mov	x0, x22
000000000006652c	mov	w1, #0x0
0000000000066530	mov	x2, x23
0000000000066534	blr	x8
0000000000066538	fsub	s0, s9, s11
000000000006653c	fsub	s1, s10, s12
0000000000066540	mov	x0, x22
0000000000066544	bl	__ZN20HUnderwaterRefractV213SetMaxOffsetsEff
0000000000066548	ldr	d0, [sp, #0x18]
000000000006654c	fcvt	s0, d0
0000000000066550	ldr	x8, [x22]
0000000000066554	ldr	x8, [x8, #0x60]
0000000000066558	movi.2d	v1, #0000000000000000
000000000006655c	movi.2d	v2, #0000000000000000
0000000000066560	movi.2d	v3, #0000000000000000
0000000000066564	mov	x0, x22
0000000000066568	mov	w1, #0x6
000000000006656c	blr	x8
0000000000066570	fcvt	s0, d8
0000000000066574	ldr	x8, [x22]
0000000000066578	ldr	x8, [x8, #0x60]
000000000006657c	movi.2d	v1, #0000000000000000
0000000000066580	movi.2d	v2, #0000000000000000
0000000000066584	movi.2d	v3, #0000000000000000
0000000000066588	mov	x0, x22
000000000006658c	mov	w1, #0x7
0000000000066590	blr	x8
0000000000066594	ldr	d0, [sp, #0x438]
0000000000066598	ldr	d1, [sp, #0x440]
000000000006659c	fcvt	s0, d0
00000000000665a0	fcvt	s1, d1
00000000000665a4	ldr	d2, [sp, #0x448]
00000000000665a8	ldr	d3, [sp, #0x450]
00000000000665ac	fcvt	s2, d2
00000000000665b0	fcvt	s3, d3
00000000000665b4	ldr	x8, [x22]
00000000000665b8	ldr	x8, [x8, #0x60]
00000000000665bc	mov	x0, x22
00000000000665c0	mov	w1, #0x3
00000000000665c4	blr	x8
00000000000665c8	ldr	d0, [sp, #0x458]
00000000000665cc	ldr	d1, [sp, #0x460]
00000000000665d0	fcvt	s0, d0
00000000000665d4	fcvt	s1, d1
00000000000665d8	ldr	d2, [sp, #0x468]
00000000000665dc	ldr	d3, [sp, #0x470]
00000000000665e0	fcvt	s2, d2
00000000000665e4	fcvt	s3, d3
00000000000665e8	ldr	x8, [x22]
00000000000665ec	ldr	x8, [x8, #0x60]
00000000000665f0	mov	x0, x22
00000000000665f4	mov	w1, #0x4
00000000000665f8	blr	x8
00000000000665fc	ldr	d0, [sp, #0x498]
0000000000066600	ldr	d1, [sp, #0x4a0]
0000000000066604	fcvt	s0, d0
0000000000066608	fcvt	s1, d1
000000000006660c	ldr	d2, [sp, #0x4a8]
0000000000066610	ldr	d3, [sp, #0x4b0]
0000000000066614	fcvt	s2, d2
0000000000066618	fcvt	s3, d3
000000000006661c	ldr	x8, [x22]
0000000000066620	ldr	x8, [x8, #0x60]
0000000000066624	mov	x0, x22
0000000000066628	mov	w1, #0x5
000000000006662c	blr	x8
0000000000066630	ldr	d0, [sp, #0x3b8]
0000000000066634	ldr	d1, [sp, #0x3c0]
0000000000066638	fcvt	s0, d0
000000000006663c	fcvt	s1, d1
0000000000066640	ldr	d2, [sp, #0x3c8]
0000000000066644	ldr	d3, [sp, #0x3d0]
0000000000066648	fcvt	s2, d2
000000000006664c	fcvt	s3, d3
0000000000066650	ldr	x8, [x22]
0000000000066654	ldr	x8, [x8, #0x60]
0000000000066658	mov	x0, x22
000000000006665c	mov	w1, #0x0
0000000000066660	blr	x8
0000000000066664	ldr	d0, [sp, #0x3d8]
0000000000066668	ldr	d1, [sp, #0x3e0]
000000000006666c	fcvt	s0, d0
0000000000066670	fcvt	s1, d1
0000000000066674	ldr	d2, [sp, #0x3e8]
0000000000066678	ldr	d3, [sp, #0x3f0]
000000000006667c	fcvt	s2, d2
0000000000066680	fcvt	s3, d3
0000000000066684	ldr	x8, [x22]
0000000000066688	ldr	x8, [x8, #0x60]
000000000006668c	mov	x0, x22
0000000000066690	mov	w1, #0x1
0000000000066694	blr	x8
0000000000066698	ldr	d0, [sp, #0x418]
000000000006669c	ldr	d1, [sp, #0x420]
00000000000666a0	fcvt	s0, d0
00000000000666a4	fcvt	s1, d1
00000000000666a8	ldr	d2, [sp, #0x428]
00000000000666ac	ldr	d3, [sp, #0x430]
00000000000666b0	fcvt	s2, d2
00000000000666b4	fcvt	s3, d3
00000000000666b8	ldr	x8, [x22]
00000000000666bc	ldr	x8, [x8, #0x60]
00000000000666c0	mov	x0, x22
00000000000666c4	mov	w1, #0x2
00000000000666c8	blr	x8
00000000000666cc	str	x22, [sp, #0x60]
00000000000666d0	ldr	x8, [x22]
00000000000666d4	ldr	x8, [x8, #0x10]
00000000000666d8	mov	x0, x22
00000000000666dc	blr	x8
00000000000666e0	add	x2, sp, #0x60
00000000000666e4	mov	x0, x21
00000000000666e8	mov	x3, x24
00000000000666ec	mov	x4, x19
00000000000666f0	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000666f4	add	x2, sp, #0x60
00000000000666f8	mov	x0, x19
00000000000666fc	bl	"_objc_msgSend$setHeliumRef:"
0000000000066700	ldr	x0, [sp, #0x60]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm3 (float)
    - parm1 (float)
    - parm2 (float)
    - parm6 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot None  <-  parm3 (float), parm1 (float), parm2 (float), parm6 (bool)
    slot None  <-  (constant / computed)
    slot None  <-  (constant / computed)
    slot 8  <-  parm3 (float)
    slot 6  <-  (constant / computed)
    slot 7  <-  (constant / computed)
    slot 3  <-  parm6 (bool)
    slot 4  <-  parm6 (bool)
    slot 5  <-  parm6 (bool)
    slot 0  <-  parm6 (bool)
    slot 1  <-  parm6 (bool)
    slot 2  <-  parm6 (bool)
```
