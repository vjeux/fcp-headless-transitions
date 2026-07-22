# Glint

- **PAE class:** `Glint`
- **Plugin UUID:** `D24138A3-1569-4771-8F4F-70F88ABB53B4`
- **Node names in corpus:** Glint (209), Glow: Glint (20), Glint 1 (5), Glint 2 (2), Glint 1 copy (1), g (1)
- **Corpus usage:** 165 files, 241 instances

## What it does

Glint adds anamorphic star/streak highlights to bright areas: it thresholds the highlights, blooms them, and casts radial streaks (like the star filter on a camera lens) with controllable number, size, softness and color fringing. It is the sparkle/lens-flare-star effect used on speculars and light sources. Not implemented and no checked-in shader.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Glint" filter. Exact bloom/streak math unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Exposure | float | 2 | -4.017 .. 10 | Highlight threshold / exposure that controls which pixels glint (higher = only the brightest streak). *(keyframed in 1 instance)* |
| Intensity | float | 2.5 | 0 .. 3.2 | Overall strength of the glint overlay, 0-3.2. Continuous float. |
| Glint Size | float | 4 | 0 .. 25 | Length of the star streaks, 0-25. |
| Streaks | enum(int) | 1 | 1 .. 10 | Number of radial streak arms, 1-10. |
| Glint Softness | float | 0 | 0 .. 1 | Softness/feather of the streaks, 0-1. |
| Glint Angle | float (radians) | 0 | -0.5236 .. 1.798 | Rotation of the streak pattern in radians. |
| Glow Amount | float | 3 | 0 .. 40 | Strength of the soft bloom halo added under the streaks, 0-40. |
| Tint | float | 0 | 0 .. 1 | How much the Tint Color is applied to the glint, 0-1. |
| Tint Color | color | - | - | Color of the glint tint (nested Red/Green/Blue + Color Space). |
| Color Fringing | float | 6 | 0 .. 27.9 | Chromatic dispersion along the streaks, 0-28 (rainbow edges). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the glint over the original, 0-1 continuous. *(keyframed in 5 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 6 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 2 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcAdditiveTransparentBlend`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcAdditiveTransparentBlend` → [`HgcAdditiveTransparentBlend.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcAdditiveTransparentBlend.metal)

```metal
//Metal1.0     
//LEN=00000001f3
[[ visible ]] FragmentOut HgcAdditiveTransparentBlend_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    output.color0.xyz = r0.xyz + r1.xyz;
    r0.x = -r0.w*hg_Params[0].x + c0.x;
    r0.y = r1.w - c0.x;
    output.color0.w = r0.y*r0.x + c0.x;
    return output;
}
```

### Metal fragment shader — `HgcColorize`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcColorize` → [`HgcColorize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorize.metal)

```metal
//Metal1.0     
//LEN=0000000208
[[ visible ]] FragmentOut HgcColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r1.w = dot(r1.xyz, hg_Params[4].xyz);
    r2.xyz = mix(hg_Params[0].xyz, hg_Params[1].xyz, r1.www);
    r1.xyz = mix(r1.xyz, r2.xyz, hg_Params[2].xyz);
    r1.w = r0.w;
    r1.xyz = r1.xyz*r0.www;
    output.color0 = mix(r0, r1, hg_Params[3]);
    return output;
}
```

### Metal fragment shader — `HgcHDRCurveShader`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcHDRCurveShader` → [`HgcHDRCurveShader.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcHDRCurveShader.metal)

```metal
//Metal1.0     
//LEN=00000001a2
[[ visible ]] FragmentOut HgcHDRCurveShader_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.xyz = r0.xyz - hg_Params[0].xyz;
    output.color0.w = r0.w;
    output.color0.xyz = fmax(r0.xyz, c0.xxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEGlint canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGlint`

```asm
000000000012fa3c	mov	w3, #0x1
000000000012fa40	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fa44	ldr	x4, [x22]
000000000012fa48	sub	x2, x29, #0x60
000000000012fa4c	mov	x0, x23
000000000012fa50	mov	w3, #0x2
000000000012fa54	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fa58	ldr	x4, [x22]
000000000012fa5c	sub	x2, x29, #0x68
000000000012fa60	mov	x0, x23
000000000012fa64	mov	w3, #0x3
000000000012fa68	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fa6c	ldr	x4, [x22]
000000000012fa70	sub	x2, x29, #0x70
000000000012fa74	mov	x0, x23
000000000012fa78	mov	w3, #0x4
000000000012fa7c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fa80	adrp	x8, 815 ; 0x45e000
000000000012fa84	ldrsw	x8, [x8, #0xf24]
000000000012fa88	ldr	d0, [x21, x8]
000000000012fa8c	ldur	d1, [x29, #-0x70]
000000000012fa90	fsub	d0, d0, d1
000000000012fa94	stur	d0, [x29, #-0x70]
000000000012fa98	ldr	x4, [x22]
000000000012fa9c	sub	x2, x29, #0x78
000000000012faa0	mov	x0, x23
000000000012faa4	mov	w3, #0x5
000000000012faa8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012faac	ldr	x4, [x22]
000000000012fab0	sub	x2, x29, #0x80
000000000012fab4	mov	x0, x23
000000000012fab8	mov	w3, #0x6
000000000012fabc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fac0	ldr	x4, [x22]
000000000012fac4	sub	x2, x29, #0x88
000000000012fac8	mov	x0, x23
000000000012facc	mov	w3, #0x8
000000000012fad0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fad4	ldr	x4, [x22]
000000000012fad8	sub	x2, x29, #0x8c
000000000012fadc	mov	x0, x23
000000000012fae0	mov	w3, #0x9
000000000012fae4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000012fae8	ldr	x6, [x22]
000000000012faec	sub	x2, x29, #0x98
000000000012faf0	sub	x3, x29, #0xa0
000000000012faf4	sub	x4, x29, #0xa8
000000000012faf8	mov	x0, x23
000000000012fafc	mov	w5, #0xb
000000000012fb00	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000012fb04	ldr	x4, [x22]
000000000012fb08	sub	x2, x29, #0xb0
000000000012fb0c	mov	x0, x23
000000000012fb10	mov	w3, #0xa
000000000012fb14	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000012fb18	ldr	x2, [x22]
000000000012fb1c	mov	x0, x24
000000000012fb20	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000012fb24	bl	_objc_msgSend$matrix
000000000012fb28	mov	x25, x0
000000000012fb2c	ldur	d0, [x29, #-0xb0]
000000000012fb30	fmov	d1, #0.50000000
000000000012fb34	fmul	d0, d0, d1
000000000012fb38	stur	d0, [x29, #-0xb0]
000000000012fb3c	add	x8, sp, #0x1a0
000000000012fb40	mov	x0, x21
000000000012fb44	mov	x2, x20
000000000012fb48	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000012fb4c	add	x8, sp, #0x120
000000000012fb50	mov	x0, x21
000000000012fb54	mov	x2, x20
000000000012fb58	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000012fb5c	add	x8, sp, #0x110
000000000012fb60	mov	x0, x21
000000000012fb64	mov	x2, x20
000000000012fb68	bl	"_objc_msgSend$getImageBoundary:"
000000000012fb6c	ldp	d8, d9, [sp, #0x110]
000000000012fb70	cbz	x20, 0x12fb84
000000000012fb74	add	x8, sp, #0x110
000000000012fb78	mov	x0, x20
000000000012fb7c	bl	_objc_msgSend$heliumRef
000000000012fb80	b	0x12fb88
000000000012fb84	str	xzr, [sp, #0x110]
000000000012fb88	mov	w0, #0x300
000000000012fb8c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000012fb90	mov	x24, x0
000000000012fb94	bl	__ZN9HHDRBloomC1Ev
000000000012fb98	ldr	x2, [sp, #0x110]
000000000012fb9c	ldr	x8, [x24]
000000000012fba0	ldr	x8, [x8, #0x78]
000000000012fba4	mov	x0, x24
000000000012fba8	mov	w1, #0x0
000000000012fbac	blr	x8
000000000012fbb0	mov	x8, #0x0
000000000012fbb4	add	x9, sp, #0x1a0
000000000012fbb8	fcvtl	v0.2d, v8.2s
000000000012fbbc	fcvtl	v1.2d, v9.2s
000000000012fbc0	ldur	d2, [x29, #-0x58]
000000000012fbc4	fcvt	s2, d2
000000000012fbc8	str	s2, [x24, #0x198]
000000000012fbcc	ldur	d2, [x29, #-0x68]
000000000012fbd0	fcvt	s2, d2
000000000012fbd4	str	s2, [x24, #0x19c]
000000000012fbd8	ldur	d2, [x29, #-0x80]
000000000012fbdc	fadd	d2, d2, d2
000000000012fbe0	fcvt	s2, d2
000000000012fbe4	str	s2, [x24, #0x1d4]
000000000012fbe8	fmov.2d	v2, #0.50000000
000000000012fbec	fmul.2d	v1, v1, v2
000000000012fbf0	ldr	d2, [sp, #0x218]
000000000012fbf4	fadd.2d	v0, v1, v0
000000000012fbf8	ldr	q1, [sp, #0x200]
000000000012fbfc	ldr	q3, [sp, #0x200]
000000000012fc00	fmul.2d	v1, v0, v1
000000000012fc04	faddp.2d	d1, v1
000000000012fc08	fadd	d1, d2, d1
000000000012fc0c	ldur	q2, [x9, #0x18]
000000000012fc10	ldur	q4, [x9, #0x28]
000000000012fc14	ldr	q5, [sp, #0x1a0]
000000000012fc18	ldr	q6, [sp, #0x1a0]
000000000012fc1c	mov.d	v4[1], v5[0]
000000000012fc20	zip2.2d	v5, v2, v5
000000000012fc24	fmul.2d	v5, v0, v5
000000000012fc28	ext.16b	v0, v0, v0, #0x8
000000000012fc2c	fmul.2d	v0, v0, v4
000000000012fc30	ldur	d4, [x29, #-0x60]
000000000012fc34	add	x9, x24, #0x1d8
000000000012fc38	fadd.2d	v0, v5, v0
000000000012fc3c	ldr	d5, [sp, #0x1d8]
000000000012fc40	mov.d	v5[1], v2[0]
000000000012fc44	fadd.2d	v0, v5, v0
000000000012fc48	dup.2d	v1, v1[0]
000000000012fc4c	ext.16b	v0, v0, v0, #0x8
000000000012fc50	fdiv.2d	v0, v0, v1
000000000012fc54	str	q0, [x9]
000000000012fc58	ldur	d0, [x29, #-0x88]
000000000012fc5c	fcvt	s0, d0
000000000012fc60	sub	x9, x29, #0xb0
000000000012fc64	ld1.d	{ v4 }[1], [x9]
000000000012fc68	ldur	d1, [x29, #-0x70]
000000000012fc6c	sub	x9, x29, #0x78
000000000012fc70	ld1.d	{ v1 }[1], [x9]
000000000012fc74	str	s0, [x24, #0x1e8]
000000000012fc78	fcvtn	v0.2s, v4.2d
000000000012fc7c	fcvtn2	v0.4s, v1.2d
000000000012fc80	str	q0, [x24, #0x1a0]
000000000012fc84	ldur	s0, [x29, #-0x8c]
000000000012fc88	scvtf	s0, s0
000000000012fc8c	fcvtzs	w9, s0
000000000012fc90	str	w9, [x24, #0x1ec]
000000000012fc94	ldp	q0, q1, [sp, #0x1e0]
000000000012fc98	stp	q0, q1, [sp, #0xd0]
000000000012fc9c	ldr	q0, [sp, #0x210]
000000000012fca0	stp	q3, q0, [sp, #0xf0]
000000000012fca4	ldp	q0, q1, [sp, #0x1b0]
000000000012fca8	stp	q6, q0, [sp, #0x90]
000000000012fcac	ldr	q0, [sp, #0x1d0]
000000000012fcb0	stp	q1, q0, [sp, #0xb0]
000000000012fcb4	add	x9, sp, #0x90
000000000012fcb8	add	x10, x24, x8
000000000012fcbc	add	x11, x9, x8
000000000012fcc0	ldp	q0, q1, [x11]
000000000012fcc4	stp	q0, q1, [x10, #0x1f0]
000000000012fcc8	add	x8, x8, #0x20
000000000012fccc	cmp	x8, #0x80
000000000012fcd0	b.ne	0x12fcb8
000000000012fcd4	mov	x8, #0x0
000000000012fcd8	ldp	q0, q1, [sp, #0x160]
000000000012fcdc	stp	q0, q1, [sp, #0x50]
000000000012fce0	ldp	q0, q1, [sp, #0x180]
000000000012fce4	stp	q0, q1, [sp, #0x70]
000000000012fce8	ldp	q0, q1, [sp, #0x120]
000000000012fcec	stp	q0, q1, [sp, #0x10]
000000000012fcf0	ldp	q0, q1, [sp, #0x140]
000000000012fcf4	add	x9, sp, #0x10
000000000012fcf8	stp	q0, q1, [sp, #0x30]
000000000012fcfc	add	x10, x24, x8
000000000012fd00	add	x11, x9, x8
000000000012fd04	ldp	q0, q1, [x11]
000000000012fd08	stp	q0, q1, [x10, #0x270]
000000000012fd0c	add	x8, x8, #0x20
000000000012fd10	cmp	x8, #0x80
000000000012fd14	b.ne	0x12fcfc
000000000012fd18	ldp	d1, d0, [x29, #-0xa0]
000000000012fd1c	ldur	d2, [x29, #-0xa8]
000000000012fd20	stp	d0, d1, [x24, #0x1b0]
000000000012fd24	str	d2, [x24, #0x1c0]
000000000012fd28	ldr	d0, [x25, #0x10]
000000000012fd2c	fcvt	s0, d0
000000000012fd30	ldr	q1, [x25]
000000000012fd34	fcvtn	v1.2s, v1.2d
000000000012fd38	str	d1, [x24, #0x1c8]
000000000012fd3c	str	s0, [x24, #0x1d0]
000000000012fd40	ldr	x4, [x22]
000000000012fd44	add	x2, sp, #0xf
000000000012fd48	mov	x0, x23
000000000012fd4c	mov	w3, #0x7
000000000012fd50	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000012fd54	str	x24, [sp]
000000000012fd58	ldr	x8, [x24]
000000000012fd5c	ldr	x8, [x8, #0x10]
000000000012fd60	mov	x0, x24
000000000012fd64	blr	x8
000000000012fd68	ldrb	w8, [sp, #0xf]
000000000012fd6c	cmp	w8, #0x1
000000000012fd70	b.ne	0x12fd88
000000000012fd74	mov	x2, sp
000000000012fd78	mov	x0, x21
000000000012fd7c	mov	x3, x20
000000000012fd80	mov	x4, x19
000000000012fd84	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000012fd88	mov	x2, sp
000000000012fd8c	mov	x0, x19
000000000012fd90	bl	"_objc_msgSend$setHeliumRef:"
000000000012fd94	ldr	x0, [sp]
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
    - parm5 (float)
    - parm6 (float)
    - parm8 (float)
    - parm9 (int)
    - parm11 (colour)
    - parm10 (float)
    - parm7 (bool)

```
