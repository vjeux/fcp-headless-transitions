# Glow

- **PAE class:** `Glow`
- **Plugin UUID:** `73F69C87-7226-4F7A-81F2-F5E378501423`
- **Node names in corpus:** Glow (102), Glow copy (4), CRT Glow (1)
- **Corpus usage:** 78 files, 107 instances

## What it does

Glow blooms the bright areas: it soft-thresholds the highlights, Gaussian-blurs them by Radius, and screen-composites the blurred glow back over the original. Threshold/Softness set which pixels glow, Opacity the glow gain. Implemented (shares the glow module) and RE'd from the three-pass HgcGlow / HgcGlowCombineFx shaders.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 10 | 7 .. 100 | Blur radius of the glow spread, 7-100. Larger = a softer, wider halo. *(keyframed in 1 instance)* |
| Threshold | float | 0.75 | 0 .. 1 | Brightness threshold, 0-1 (default 0.75). Pixels below this don't glow; the mask ramps up around it. |
| Softness | float | 0.2 | 0.09 .. 1 | Width of the threshold ramp, 0-1 (default 0.2). 0 = a hard glow cutoff, larger = a gradual glow onset. |
| Opacity | float | 1.5 | 0.06 .. 3 | Gain/opacity of the glow overlay, 0-3 (default 1.5). Higher = a brighter bloom. *(keyframed in 1 instance)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the glowing result over the original, 0-1 continuous. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Flip`, `Input Points`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/glow.ts`](../../engine/src/compositor/filters/glow.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGlow`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGlow` → [`HgcGlow.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGlow.metal)

```metal
//Metal1.0     
//LEN=0000000145
[[ visible ]] FragmentOut HgcGlow_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0.w = clamp(dot(r0, hg_Params[0]), 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### Metal fragment shader — `HgcGlowCombineFx`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGlowCombineFx` → [`HgcGlowCombineFx.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGlowCombineFx.metal)

```metal
//Metal1.0     
//LEN=0000000249
[[ visible ]] FragmentOut HgcGlowCombineFx_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color1;
    r1.w = clamp(r0.w*hg_Params[0].x, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*hg_Params[0].xxx;
    r1.xyz = fmin(r0.xyz, hg_Params[1].xyz);
    r0.x = c0.x - r1.w;
    r2 = color0;
    r1.xyz = fmax(r1.xyz, c0.yyy);
    output.color0 = r0.xxxx*r2 + r1;
    return output;
}
```

### CPU parameter wiring — `-[PAEGlow canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGlow`

```asm
00000000000ceae8	mov	w3, #0x1
00000000000ceaec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000ceaf0	ldr	x4, [x21]
00000000000ceaf4	add	x2, sp, #0x60
00000000000ceaf8	mov	x0, x25
00000000000ceafc	mov	w3, #0x3
00000000000ceb00	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000ceb04	ldr	x4, [x21]
00000000000ceb08	add	x2, sp, #0x58
00000000000ceb0c	mov	x0, x25
00000000000ceb10	mov	w3, #0x4
00000000000ceb14	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000ceb18	ldr	x4, [x21]
00000000000ceb1c	add	x2, sp, #0x50
00000000000ceb20	mov	x0, x25
00000000000ceb24	mov	w3, #0x2
00000000000ceb28	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000ceb2c	ldr	x4, [x21]
00000000000ceb30	add	x2, sp, #0x4f
00000000000ceb34	mov	x0, x25
00000000000ceb38	mov	w3, #0x5
00000000000ceb3c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000ceb40	ldr	x4, [x21]
00000000000ceb44	add	x2, sp, #0x4e
00000000000ceb48	mov	x0, x25
00000000000ceb4c	mov	w3, #0x6
00000000000ceb50	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000ceb54	ldp	d0, d2, [sp, #0x58]
00000000000ceb58	fmov	d1, #1.00000000
00000000000ceb5c	fdiv	d1, d1, d0
00000000000ceb60	fmov	d3, #-0.50000000
00000000000ceb64	fmul	d3, d0, d3
00000000000ceb68	fadd	d2, d2, d3
00000000000ceb6c	fnmul	d2, d2, d1
00000000000ceb70	fcmp	d0, #0.0
00000000000ceb74	adrp	x8, 412 ; 0x26a000
00000000000ceb78	ldr	d0, [x8, #0x898]
00000000000ceb7c	fcsel	d8, d0, d2, eq
00000000000ceb80	adrp	x8, 412 ; 0x26a000
00000000000ceb84	ldr	d0, [x8, #0x890]
00000000000ceb88	fcsel	d9, d0, d1, eq
00000000000ceb8c	cbz	x22, 0xceba0
00000000000ceb90	add	x8, sp, #0x28
00000000000ceb94	mov	x0, x22
00000000000ceb98	bl	_objc_msgSend$heliumRef
00000000000ceb9c	b	0xceba4
00000000000ceba0	str	xzr, [sp, #0x28]
00000000000ceba4	ldr	x2, [x21]
00000000000ceba8	mov	x0, x24
00000000000cebac	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000cebb0	bl	_objc_msgSend$matrix
00000000000cebb4	mov	x24, x0
00000000000cebb8	mov	w0, #0x1a0
00000000000cebbc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000cebc0	mov	x21, x0
00000000000cebc4	bl	__ZN7HgcGlowC2Ev
00000000000cebc8	adrp	x8, 712 ; 0x396000
00000000000cebcc	add	x8, x8, #0x6f0
00000000000cebd0	add	x9, x8, #0x10
00000000000cebd4	str	x9, [x21]
00000000000cebd8	ldr	x2, [sp, #0x28]
00000000000cebdc	ldr	x8, [x8, #0x88]
00000000000cebe0	mov	x0, x21
00000000000cebe4	mov	w1, #0x0
00000000000cebe8	blr	x8
00000000000cebec	ldp	d0, d1, [x24]
00000000000cebf0	fmul	d0, d9, d0
00000000000cebf4	fcvt	s0, d0
00000000000cebf8	fmul	d1, d9, d1
00000000000cebfc	fcvt	s1, d1
00000000000cec00	ldr	d2, [x24, #0x10]
00000000000cec04	fmul	d2, d9, d2
00000000000cec08	fcvt	s2, d2
00000000000cec0c	fcvt	s3, d8
00000000000cec10	ldr	x8, [x21]
00000000000cec14	ldr	x8, [x8, #0x60]
00000000000cec18	mov	x0, x21
00000000000cec1c	mov	w1, #0x0
00000000000cec20	blr	x8
00000000000cec24	str	x21, [sp, #0x18]
00000000000cec28	ldr	x8, [x21]
00000000000cec2c	ldr	x8, [x8, #0x10]
00000000000cec30	mov	x0, x21
00000000000cec34	blr	x8
00000000000cec38	ldur	d0, [x29, #-0x58]
00000000000cec3c	ldr	q1, [sp, #0x30]
00000000000cec40	str	q1, [sp]
00000000000cec44	ldrb	w6, [sp, #0x4e]
00000000000cec48	add	x8, sp, #0x20
00000000000cec4c	add	x2, sp, #0x18
00000000000cec50	mov	x5, sp
00000000000cec54	mov	x0, x23
00000000000cec58	mov	x3, x22
00000000000cec5c	mov	x4, x20
00000000000cec60	bl	"_objc_msgSend$getBlurNode:withInputImage:outputImage:blurRadius:blurScale:is360:"
00000000000cec64	ldr	x0, [sp, #0x18]
00000000000cec68	cbz	x0, 0xcec78
00000000000cec6c	ldr	x8, [x0]
00000000000cec70	ldr	x8, [x8, #0x18]
00000000000cec74	blr	x8
00000000000cec78	mov	w0, #0x1a0
00000000000cec7c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000cec80	mov	x22, x0
00000000000cec84	bl	__ZN16HgcGlowCombineFxC2Ev
00000000000cec88	adrp	x8, 712 ; 0x396000
00000000000cec8c	add	x8, x8, #0x498
00000000000cec90	add	x9, x8, #0x10
00000000000cec94	str	x9, [x22]
00000000000cec98	str	x22, [sp]
00000000000cec9c	ldr	d0, [sp, #0x50]
00000000000ceca0	fcvt	s0, d0
00000000000ceca4	ldr	x8, [x8, #0x70]
00000000000ceca8	movi.2d	v1, #0000000000000000
00000000000cecac	movi.2d	v2, #0000000000000000
00000000000cecb0	movi.2d	v3, #0000000000000000
00000000000cecb4	mov	x0, x22
00000000000cecb8	mov	w1, #0x0
00000000000cecbc	blr	x8
00000000000cecc0	ldr	x2, [sp, #0x28]
00000000000cecc4	ldr	x8, [x22]
00000000000cecc8	ldr	x8, [x8, #0x78]
00000000000ceccc	mov	x0, x22
00000000000cecd0	mov	w1, #0x0
00000000000cecd4	blr	x8
00000000000cecd8	ldr	x2, [sp, #0x20]
00000000000cecdc	ldr	x8, [x22]
00000000000cece0	ldr	x8, [x8, #0x78]
00000000000cece4	mov	x0, x22
00000000000cece8	mov	w1, #0x1
00000000000cecec	blr	x8
00000000000cecf0	ldrb	w8, [sp, #0x4f]
00000000000cecf4	ldr	x9, [x22]
00000000000cecf8	ldr	x9, [x9, #0x60]
00000000000cecfc	cmp	w8, #0x0
00000000000ced00	mov	w8, #0x7f7fffff
00000000000ced04	fmov	s0, w8
00000000000ced08	fmov	s1, #1.00000000
00000000000ced0c	fcsel	s0, s1, s0, ne
00000000000ced10	movi.2d	v1, #0000000000000000
00000000000ced14	movi.2d	v2, #0000000000000000
00000000000ced18	movi.2d	v3, #0000000000000000
00000000000ced1c	mov	x0, x22
00000000000ced20	mov	w1, #0x1
00000000000ced24	blr	x9
00000000000ced28	mov	x2, sp
00000000000ced2c	mov	x0, x20
00000000000ced30	bl	"_objc_msgSend$setHeliumRef:"
00000000000ced34	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm3 (float)
    - parm4 (float)
    - parm2 (float)
    - parm5 (bool)
    - parm6 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm4 (float)
```
