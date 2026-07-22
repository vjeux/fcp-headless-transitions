# Wavy Screen

- **PAE class:** `Wavy Screen`
- **Plugin UUID:** `3C4B5F14-3D6B-4C35-8314-24077F0CB276`
- **Node names in corpus:** Wavy Screen (4), Wavy Screen copy (2)
- **Corpus usage:** 4 files, 6 instances

## What it does

Wavy Screen combines a wavy sinusoidal displacement with a halftone/screen pattern, giving a rippling patterned-screen look. Amplitude/Wavelength shape the wave, Scale the screen frequency, and Contrast the pattern hardness.

> **Note.** Not implemented; description is the standard Apple Motion "Wavy Screen" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float (pixels) | 40 | 0 .. 40 | Wave displacement amplitude, 0-40 (default 40). |
| Wavelength | float (pixels) | 125 | 0 .. 394 | Distance between wave crests, ~0-394 (default 125). |
| Scale | enum(int) | 10 | 8 .. 10 | Screen/pattern frequency, 8-10 (default 10). |
| Contrast | float | 0.5 | 0.5 .. 1 | Hardness of the screen pattern, 0.5-1 (default 0.5). |
| Mix | float | 1 | 0.4195 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcWavyScreen`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcWavyScreen` → [`HgcWavyScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcWavyScreen.metal)

```metal
//Metal1.0     
//LEN=000000038e
[[ visible ]] FragmentOut HgcWavyScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.5000000000, -2.000000000, 1.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xy = hg_Params[1].xy*c0.xx + texCoord1.xy;
    r1.xy = r1.xy*hg_Params[2].xy;
    r2.x = hg_Params[0].x*r1.x;
    r2.x = fract(r2.x);
    r2.x = r2.x*c0.y + c0.z;
    r1.y = hg_Params[1].y - r1.y;
    r1.y = fabs(r2.x)*hg_Params[0].z + r1.y;
    r1.xyz = r1.yyy*hg_Params[0].yyy;
    r1.xyz = fract(r1.xyz);
    r1.xyz = r1.xyz*c0.yyy + c0.zzz;
    r1.xyz = abs(r1.xyz);
    r2.xyz = float3(dot(r0, hg_Params[3]));
    r2.xyz = r2.xyz - r1.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[0].www + c0.xxx, 0.00000f, 1.00000f);
    r0.xyz = r2.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEWavyScreen canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEWavyScreen`

```asm
00000000000bba30	mov	w3, #0x1
00000000000bba34	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000bba38	ldr	x4, [x24]
00000000000bba3c	add	x2, sp, #0x20
00000000000bba40	mov	x0, x25
00000000000bba44	mov	w3, #0x2
00000000000bba48	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000bba4c	ldr	x4, [x24]
00000000000bba50	add	x2, sp, #0x18
00000000000bba54	mov	x0, x25
00000000000bba58	mov	w3, #0x3
00000000000bba5c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000bba60	ldr	x4, [x24]
00000000000bba64	add	x2, sp, #0x10
00000000000bba68	mov	x0, x25
00000000000bba6c	mov	w3, #0x4
00000000000bba70	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000bba74	ldr	d0, [sp, #0x10]
00000000000bba78	fsub	d0, d11, d0
00000000000bba7c	fdiv	d0, d11, d0
00000000000bba80	str	d0, [sp, #0x10]
00000000000bba84	ldr	x2, [x24]
00000000000bba88	mov	x0, x27
00000000000bba8c	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000bba90	bl	_objc_msgSend$matrix
00000000000bba94	mov	x25, x0
00000000000bba98	ldr	x2, [x24]
00000000000bba9c	mov	x0, x26
00000000000bbaa0	bl	"_objc_msgSend$getRenderMode:"
00000000000bbaa4	cbz	w0, 0xbbc98
00000000000bbaa8	mov	x0, x21
00000000000bbaac	bl	_objc_msgSend$imageType
00000000000bbab0	cmp	x0, #0x3
00000000000bbab4	b.ne	0xbbc98
00000000000bbab8	cbz	x21, 0xbbacc
00000000000bbabc	add	x8, sp, #0x8
00000000000bbac0	mov	x0, x21
00000000000bbac4	bl	_objc_msgSend$heliumRef
00000000000bbac8	b	0xbbad0
00000000000bbacc	str	xzr, [sp, #0x8]
00000000000bbad0	mov	w0, #0x1c0
00000000000bbad4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000bbad8	mov	x21, x0
00000000000bbadc	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000bbae0	ldr	x8, [x24, #0x28]
00000000000bbae4	cbnz	x8, 0xbbb30
00000000000bbae8	ldr	x2, [sp, #0x8]
00000000000bbaec	ldr	x8, [x21]
00000000000bbaf0	ldr	x8, [x8, #0x78]
00000000000bbaf4	mov	x0, x21
00000000000bbaf8	mov	w1, #0x0
00000000000bbafc	blr	x8
00000000000bbb00	ldr	x0, [sp, #0x8]
00000000000bbb04	cmp	x0, x21
00000000000bbb08	b.eq	0xbbb30
00000000000bbb0c	cbz	x0, 0xbbb1c
00000000000bbb10	ldr	x8, [x0]
00000000000bbb14	ldr	x8, [x8, #0x18]
00000000000bbb18	blr	x8
00000000000bbb1c	str	x21, [sp, #0x8]
00000000000bbb20	ldr	x8, [x21]
00000000000bbb24	ldr	x8, [x8, #0x10]
00000000000bbb28	mov	x0, x21
00000000000bbb2c	blr	x8
00000000000bbb30	mov	w0, #0x1a0
00000000000bbb34	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000bbb38	mov	x24, x0
00000000000bbb3c	bl	__ZN13HgcWavyScreenC2Ev
00000000000bbb40	adrp	x8, 730 ; 0x395000
00000000000bbb44	add	x8, x8, #0x30
00000000000bbb48	add	x9, x8, #0x10
00000000000bbb4c	str	x9, [x24]
00000000000bbb50	ldr	x2, [sp, #0x8]
00000000000bbb54	ldr	x8, [x8, #0x88]
00000000000bbb58	mov	x0, x24
00000000000bbb5c	mov	w1, #0x0
00000000000bbb60	blr	x8
00000000000bbb64	ldp	d2, d0, [sp, #0x18]
00000000000bbb68	fmov	d1, #1.00000000
00000000000bbb6c	fdiv	d0, d1, d0
00000000000bbb70	fcvt	s0, d0
00000000000bbb74	fdiv	d1, d1, d2
00000000000bbb78	fcvt	s1, d1
00000000000bbb7c	ldr	d2, [sp, #0x28]
00000000000bbb80	fcvt	s2, d2
00000000000bbb84	ldr	d3, [sp, #0x10]
00000000000bbb88	fcvt	s3, d3
00000000000bbb8c	ldr	x8, [x24]
00000000000bbb90	ldr	x8, [x8, #0x60]
00000000000bbb94	mov	x0, x24
00000000000bbb98	mov	w1, #0x0
00000000000bbb9c	blr	x8
00000000000bbba0	ucvtf	d0, x22
00000000000bbba4	ucvtf	d1, x23
00000000000bbba8	fcvt	s0, d0
00000000000bbbac	fcvt	s1, d1
00000000000bbbb0	ldr	x8, [x24]
00000000000bbbb4	ldr	x8, [x8, #0x60]
00000000000bbbb8	movi.2d	v2, #0000000000000000
00000000000bbbbc	movi.2d	v3, #0000000000000000
00000000000bbbc0	mov	x0, x24
00000000000bbbc4	mov	w1, #0x1
00000000000bbbc8	blr	x8
00000000000bbbcc	fmul	d0, d8, d10
00000000000bbbd0	fmov	d1, #1.00000000
00000000000bbbd4	fdiv	d0, d1, d0
00000000000bbbd8	fcvt	s0, d0
00000000000bbbdc	fdiv	d1, d1, d9
00000000000bbbe0	fcvt	s1, d1
00000000000bbbe4	ldr	x8, [x24]
00000000000bbbe8	ldr	x8, [x8, #0x60]
00000000000bbbec	movi.2d	v2, #0000000000000000
00000000000bbbf0	movi.2d	v3, #0000000000000000
00000000000bbbf4	mov	x0, x24
00000000000bbbf8	mov	w1, #0x2
00000000000bbbfc	blr	x8
00000000000bbc00	ldp	d0, d1, [x25]
00000000000bbc04	fcvt	s0, d0
00000000000bbc08	fcvt	s1, d1
00000000000bbc0c	ldr	d2, [x25, #0x10]
00000000000bbc10	fcvt	s2, d2
00000000000bbc14	ldr	x8, [x24]
00000000000bbc18	ldr	x8, [x8, #0x60]
00000000000bbc1c	movi.2d	v3, #0000000000000000
00000000000bbc20	mov	x0, x24
00000000000bbc24	mov	w1, #0x3
00000000000bbc28	blr	x8
00000000000bbc2c	str	x24, [sp]
00000000000bbc30	ldr	x8, [x24]
00000000000bbc34	ldr	x8, [x8, #0x10]
00000000000bbc38	mov	x0, x24
00000000000bbc3c	blr	x8
00000000000bbc40	mov	x2, sp
00000000000bbc44	mov	x0, x20
00000000000bbc48	bl	"_objc_msgSend$setHeliumRef:"
00000000000bbc4c	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm4 (float), parm3 (float), parm1 (float)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
```
