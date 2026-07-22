# Colorize

- **PAE class:** `Colorize`
- **Plugin UUID:** `D995BBCF-F766-4950-89D5-7A4828CD9B6F`
- **Node names in corpus:** Colorize (2150), Global Color (327), Global Colorize (90), Colorize copy (53), U Curve Arrow (3), Bow Arrow (3)
- **Corpus usage:** 921 files, 2667 instances

## What it does

Colorize is a two-point duotone / gradient-map. It remaps the image's tonal range so the darkest pixels take one target color ("Remap Black To") and the brightest take another ("Remap White To"), interpolating every intermediate luminance between them. It is the classic way to tint footage into a single-hue look (sepia, cyan-orange, monochrome washes) while preserving contrast. In this engine it shares the channel-mixer module because both are per-pixel linear color remaps.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Remap Black To | color | - | - | The color assigned to the darkest (black-point) pixels. Its `Color Space` child selects how the RGB triple is interpreted; Red/Green/Blue are 0-1 floats. *(keyframed in 4 instances)* |
| Remap White To | color | - | - | The color assigned to the brightest (white-point) pixels. With Remap Black To it defines the two ends of the tonal gradient every pixel maps onto. *(keyframed in 1 instance)* |
| Intensity | float | 1 | 0 .. 1 | Strength of the recolor, 0-1. 0 leaves the image untouched, 1 applies the full black->white remap. Continuous float despite only 0/1 being sampled. *(keyframed in 1 instance)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the colorized result over the original, 0-1 continuous. 0 = bypass, 1 = full effect. Frequently keyframed to animate the tint in/out. *(keyframed in 50 instances)* |
| Colorize::HDR In Rec. 709 | bool | 0 | 0 .. 0 | Working-space toggle: treat the input as Rec.709 HDR when computing the remap. Not a creative control. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/channel-mixer.ts`](../../engine/src/compositor/filters/channel-mixer.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 3 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

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

### CPU parameter wiring — `-[PAEColorize canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEColorize`

```asm
000000000001b19c	mov	w3, #0x3
000000000001b1a0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001b1a4	ldr	x6, [x21]
000000000001b1a8	add	x2, sp, #0x40
000000000001b1ac	add	x3, sp, #0x38
000000000001b1b0	add	x4, sp, #0x30
000000000001b1b4	mov	x0, x22
000000000001b1b8	mov	w5, #0x1
000000000001b1bc	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001b1c0	ldr	x6, [x21]
000000000001b1c4	add	x2, sp, #0x28
000000000001b1c8	add	x3, sp, #0x20
000000000001b1cc	add	x4, sp, #0x18
000000000001b1d0	mov	x0, x22
000000000001b1d4	mov	w5, #0x2
000000000001b1d8	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001b1dc	ldr	x2, [x21]
000000000001b1e0	mov	x0, x22
000000000001b1e4	bl	"_objc_msgSend$mixAmountAtTime:"
000000000001b1e8	mov.16b	v8, v0
000000000001b1ec	ldr	x2, [x21]
000000000001b1f0	mov	x0, x23
000000000001b1f4	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000001b1f8	bl	_objc_msgSend$matrix
000000000001b1fc	ldp	d9, d10, [x0]
000000000001b200	ldr	d11, [x0, #0x10]
000000000001b204	cbz	x20, 0x1b218
000000000001b208	add	x8, sp, #0x10
000000000001b20c	mov	x0, x20
000000000001b210	bl	_objc_msgSend$heliumRef
000000000001b214	b	0x1b21c
000000000001b218	str	xzr, [sp, #0x10]
000000000001b21c	mov	w0, #0x1a0
000000000001b220	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001b224	mov	x20, x0
000000000001b228	bl	__ZN11HgcColorizeC1Ev
000000000001b22c	ldr	x2, [sp, #0x10]
000000000001b230	ldr	x8, [x20]
000000000001b234	ldr	x8, [x8, #0x78]
000000000001b238	mov	x0, x20
000000000001b23c	mov	w1, #0x0
000000000001b240	blr	x8
000000000001b244	ldp	d1, d0, [sp, #0x38]
000000000001b248	fcvt	s0, d0
000000000001b24c	fcvt	s1, d1
000000000001b250	ldr	d2, [sp, #0x30]
000000000001b254	fcvt	s2, d2
000000000001b258	ldr	x8, [x20]
000000000001b25c	ldr	x8, [x8, #0x60]
000000000001b260	movi.2d	v3, #0000000000000000
000000000001b264	mov	x0, x20
000000000001b268	mov	w1, #0x0
000000000001b26c	blr	x8
000000000001b270	ldp	d1, d0, [sp, #0x20]
000000000001b274	fcvt	s0, d0
000000000001b278	fcvt	s1, d1
000000000001b27c	ldr	d2, [sp, #0x18]
000000000001b280	fcvt	s2, d2
000000000001b284	ldr	x8, [x20]
000000000001b288	ldr	x8, [x8, #0x60]
000000000001b28c	movi.2d	v3, #0000000000000000
000000000001b290	mov	x0, x20
000000000001b294	mov	w1, #0x1
000000000001b298	blr	x8
000000000001b29c	ldr	d0, [sp, #0x48]
000000000001b2a0	fcvt	s0, d0
000000000001b2a4	ldr	x8, [x20]
000000000001b2a8	ldr	x8, [x8, #0x60]
000000000001b2ac	movi.2d	v1, #0000000000000000
000000000001b2b0	movi.2d	v2, #0000000000000000
000000000001b2b4	movi.2d	v3, #0000000000000000
000000000001b2b8	mov	x0, x20
000000000001b2bc	mov	w1, #0x2
000000000001b2c0	blr	x8
000000000001b2c4	fcvt	s0, d8
000000000001b2c8	ldr	x8, [x20]
000000000001b2cc	ldr	x8, [x8, #0x60]
000000000001b2d0	movi.2d	v1, #0000000000000000
000000000001b2d4	movi.2d	v2, #0000000000000000
000000000001b2d8	movi.2d	v3, #0000000000000000
000000000001b2dc	mov	x0, x20
000000000001b2e0	mov	w1, #0x3
000000000001b2e4	blr	x8
000000000001b2e8	fcvt	s0, d9
000000000001b2ec	fcvt	s1, d10
000000000001b2f0	fcvt	s2, d11
000000000001b2f4	ldr	x8, [x20]
000000000001b2f8	ldr	x8, [x8, #0x60]
000000000001b2fc	movi.2d	v3, #0000000000000000
000000000001b300	mov	x0, x20
000000000001b304	mov	w1, #0x4
000000000001b308	blr	x8
000000000001b30c	str	x20, [sp, #0x8]
000000000001b310	ldr	x8, [x20]
000000000001b314	ldr	x8, [x8, #0x10]
000000000001b318	mov	x0, x20
000000000001b31c	blr	x8
000000000001b320	add	x2, sp, #0x8
000000000001b324	mov	x0, x19
000000000001b328	bl	"_objc_msgSend$setHeliumRef:"
000000000001b32c	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm3 (float)
    - parm1 (colour)
    - parm2 (colour)
    - host Mix

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (colour)
    slot 1  <-  parm2 (colour)
    slot 2  <-  parm3 (float)
    slot 3  <-  host Mix
    slot 4  <-  (constant / computed)
```
