# Threshold

- **PAE class:** `Threshold`
- **Plugin UUID:** `96AFC322-287E-4014-9EFD-763CD9813E17`
- **Node names in corpus:** Threshold (51), Luma (35), Threshold copy (8), ©idustrialrevolution.com (1), Luma Source (1), Threshold Control (1)
- **Corpus usage:** 81 files, 97 instances

## What it does

Threshold posterizes luma into two colors: pixels with luminance above the Threshold become the Light Color, below become the Dark Color, with a Smoothness ramp softening the transition. It is a high-contrast two-tone / cutout effect. Implemented and RE'd verbatim from the HgcThreshold shader (luma dot, offset by Threshold, smoothstep by Smoothness, mix dark->light).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Threshold | float | 0.5 | 0 .. 1 | Luminance cutoff, 0-1 (default 0.5). Pixels brighter than this go to Light Color, darker to Dark Color. *(keyframed in 40 instances)* |
| Smoothness | float | 0.15 | 0 .. 1 | Width of the soft transition band around the threshold, 0-1. 0 = a hard two-tone edge; larger = a smooth ramp. *(keyframed in 1 instance)* |
| Light Color | color | - | - | Color assigned to pixels above the threshold (nested RGB + Color Space). *(keyframed in 35 instances)* |
| Dark Color | color | - | - | Color assigned to pixels below the threshold (nested RGB + Color Space). *(keyframed in 35 instances)* |
| Correct For Alpha | bool | 0 | 0 .. 1 | Toggle: account for the source alpha (un-premultiply) when computing luma. |
| Mix | float | 1 | 0.35 .. 1 | Wet/dry blend of the two-tone result over the original, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcThreshold` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcThreshold.metal` (Phase-1 done, Phase-2 open).

> 3 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 2 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcThreshold`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcThreshold` → [`HgcThreshold.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcThreshold.metal)

```metal
//Metal1.0     
//LEN=000000026f
[[ visible ]] FragmentOut HgcThreshold_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.3086000085, 0.6093999743, 0.08200000226, 0.5000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.x = dot(r0.xyz, c0.xyz);
    r1.x = r1.x - hg_Params[0].x;
    r1.x = clamp(r1.x*hg_Params[1].x + c0.w, 0.00000f, 1.00000f);
    r1.xyz = mix(hg_Params[2].xyz, hg_Params[3].xyz, r1.xxx);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}
```

### Metal fragment shader — `HgcThresholdNoPremult`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcThresholdNoPremult` → [`HgcThresholdNoPremult.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcThresholdNoPremult.metal)

```metal
//Metal1.0     
//LEN=0000000242
[[ visible ]] FragmentOut HgcThresholdNoPremult_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.3086000085, 0.6093999743, 0.08200000226, 0.5000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.x = dot(r0.xyz, c0.xyz);
    r1.x = r1.x - hg_Params[0].x;
    r1.x = clamp(r1.x*hg_Params[1].x + c0.w, 0.00000f, 1.00000f);
    r1.xyz = mix(hg_Params[2].xyz, hg_Params[3].xyz, r1.xxx);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEThreshold canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEThreshold`

```asm
0000000000064390	mov	w3, #0x1
0000000000064394	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000064398	ldr	x4, [x22]
000000000006439c	add	x2, sp, #0x50
00000000000643a0	mov	x0, x23
00000000000643a4	mov	w3, #0x2
00000000000643a8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000643ac	ldr	x6, [x22]
00000000000643b0	add	x2, sp, #0x48
00000000000643b4	add	x3, sp, #0x40
00000000000643b8	add	x4, sp, #0x38
00000000000643bc	mov	x0, x23
00000000000643c0	mov	w5, #0x3
00000000000643c4	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
00000000000643c8	ldr	x6, [x22]
00000000000643cc	add	x2, sp, #0x30
00000000000643d0	add	x3, sp, #0x28
00000000000643d4	add	x4, sp, #0x20
00000000000643d8	mov	x0, x23
00000000000643dc	mov	w5, #0x4
00000000000643e0	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
00000000000643e4	ldr	x4, [x22]
00000000000643e8	add	x2, sp, #0x1c
00000000000643ec	mov	x0, x23
00000000000643f0	mov	w3, #0x5
00000000000643f4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000643f8	mov	x23, x0
00000000000643fc	ldr	x2, [x22]
0000000000064400	mov	x0, x21
0000000000064404	bl	"_objc_msgSend$getRenderMode:"
0000000000064408	cbz	w0, 0x645c0
000000000006440c	mov	x0, x20
0000000000064410	bl	_objc_msgSend$imageType
0000000000064414	cmp	x0, #0x3
0000000000064418	b.ne	0x64448
000000000006441c	ldr	x0, [x21, x24]
0000000000064420	adrp	x8, 880 ; 0x3d4000
0000000000064424	ldr	x2, [x8, #0x528]
0000000000064428	bl	"_objc_msgSend$apiForProtocol:"
000000000006442c	cbz	x0, 0x645c0
0000000000064430	mov	x21, x0
0000000000064434	cbz	x20, 0x64450
0000000000064438	add	x8, sp, #0x10
000000000006443c	mov	x0, x20
0000000000064440	bl	_objc_msgSend$heliumRef
0000000000064444	b	0x64454
0000000000064448	mov	w0, #0x0
000000000006444c	b	0x645c0
0000000000064450	str	xzr, [sp, #0x10]
0000000000064454	str	xzr, [sp, #0x8]
0000000000064458	ldr	w8, [sp, #0x1c]
000000000006445c	cmp	w8, #0x0
0000000000064460	csel	w8, wzr, w23, eq
0000000000064464	cmp	w8, #0x1
0000000000064468	b.ne	0x64480
000000000006446c	mov	w0, #0x1a0
0000000000064470	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000064474	mov	x20, x0
0000000000064478	bl	__ZN12HgcThresholdC1Ev
000000000006447c	b	0x64490
0000000000064480	mov	w0, #0x1a0
0000000000064484	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000064488	mov	x20, x0
000000000006448c	bl	__ZN21HgcThresholdNoPremultC1Ev
0000000000064490	cbz	x20, 0x64498
0000000000064494	str	x20, [sp, #0x8]
0000000000064498	ldr	d8, [sp, #0x50]
000000000006449c	fcmp	d8, #0.0
00000000000644a0	b.ne	0x644bc
00000000000644a4	mov	x8, #0xe0000000
00000000000644a8	movk	x8, #0x624d, lsl #32
00000000000644ac	movk	x8, #0x3f50, lsl #48
00000000000644b0	str	x8, [sp, #0x50]
00000000000644b4	adrp	x8, 517 ; 0x269000
00000000000644b8	ldr	d8, [x8, #0x5c8]
00000000000644bc	ldr	x2, [sp, #0x10]
00000000000644c0	ldr	x8, [x20]
00000000000644c4	ldr	x8, [x8, #0x78]
00000000000644c8	mov	x0, x20
00000000000644cc	mov	w1, #0x0
00000000000644d0	blr	x8
00000000000644d4	ldur	d0, [x29, #-0x48]
00000000000644d8	fcvt	s0, d0
00000000000644dc	ldr	x8, [x20]
00000000000644e0	ldr	x8, [x8, #0x60]
00000000000644e4	movi.2d	v1, #0000000000000000
00000000000644e8	movi.2d	v2, #0000000000000000
00000000000644ec	movi.2d	v3, #0000000000000000
00000000000644f0	mov	x0, x20
00000000000644f4	mov	w1, #0x0
00000000000644f8	blr	x8
00000000000644fc	fmov	d0, #1.00000000
0000000000064500	fdiv	d0, d0, d8
0000000000064504	fcvt	s0, d0
0000000000064508	ldr	x8, [x20]
000000000006450c	ldr	x8, [x8, #0x60]
0000000000064510	movi.2d	v1, #0000000000000000
0000000000064514	movi.2d	v2, #0000000000000000
0000000000064518	movi.2d	v3, #0000000000000000
000000000006451c	mov	x0, x20
0000000000064520	mov	w1, #0x1
0000000000064524	blr	x8
0000000000064528	mov	x0, x21
000000000006452c	bl	_objc_msgSend$versionAtCreation
0000000000064530	ldp	d1, d0, [sp, #0x40]
0000000000064534	fcvt	s0, d0
0000000000064538	fcvt	s1, d1
000000000006453c	ldr	d2, [sp, #0x38]
0000000000064540	fcvt	s2, d2
0000000000064544	ldr	x8, [x20]
0000000000064548	ldr	x8, [x8, #0x60]
000000000006454c	fmov	s3, #1.00000000
0000000000064550	mov	x0, x20
0000000000064554	mov	w1, #0x2
0000000000064558	blr	x8
000000000006455c	ldp	d1, d0, [sp, #0x28]
0000000000064560	fcvt	s0, d0
0000000000064564	fcvt	s1, d1
0000000000064568	ldr	d2, [sp, #0x20]
000000000006456c	fcvt	s2, d2
0000000000064570	ldr	x8, [x20]
0000000000064574	ldr	x8, [x8, #0x60]
0000000000064578	fmov	s3, #1.00000000
000000000006457c	mov	x0, x20
0000000000064580	mov	w1, #0x3
0000000000064584	blr	x8
0000000000064588	add	x2, sp, #0x8
000000000006458c	mov	x0, x19
0000000000064590	bl	"_objc_msgSend$setHeliumRef:"
0000000000064594	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : ColorParameter
    parm4 : ColorParameter
    parm5 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (colour)
    - parm4 (colour)
    - parm5 (int)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm3 (colour)
    slot 3  <-  parm4 (colour)
```
