# Pixellate

- **PAE class:** `Pixellate`
- **Plugin UUID:** `5E7CA164-3AAF-4C70-A377-567E5796528A`
- **Node names in corpus:** Pixellate (266), Pixellate 1 (10), Pixellate 2 (8), Pixellate copy (6), Pixellate 3 (3), Animate (2)
- **Corpus usage:** 162 files, 296 instances

## What it does

Pixellate snaps each output pixel to the center of a Scale x Scale-pixel grid cell and nearest-samples the source there, producing a blocky mosaic. Scale is the block size in pixels exactly (verified on both axes) and Center anchors the grid. Implemented and verified against headless FCP via the HgcPixellate shader (a coordinate quantize).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Scale | float (pixels) | 8 | 1 .. 320 | Mosaic block size in pixels (default 8). 1 = no pixelation; larger = coarser blocks. Verified as an exact block size on both axes. *(keyframed in 29 instances)* |
| Center | point2D | - | - | Grid origin (X,Y) as a fraction of the frame; shifts where the block boundaries fall. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the mosaic over the original, 0-1 continuous. *(keyframed in 110 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/pixellate.ts`](../../engine/src/compositor/filters/pixellate.ts). Reverse-engineered against the verbatim `HgcPixellate` Metal shader.

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPixellate`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPixellate` → [`HgcPixellate.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPixellate.metal)

```metal
//Metal1.0     
//LEN=000000037b
[[ visible ]] FragmentOut HgcPixellate_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.w = c0.w;
    r0.xy = texCoord0.xy;
    r1.x = dot(r0.xyw, hg_Params[0].xyz);
    r1.y = dot(r0.xyw, hg_Params[1].xyz);
    r1.xy = r1.xy - hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[5].xx;
    r1.xy = floor(r1.xy);
    r1.xy = r1.xy + c0.xx;
    r1.xy = r1.xy*hg_Params[5].yy + hg_Params[4].xy;
    r1.w = c0.w;
    r0.x = dot(r1.xyw, hg_Params[2].xyz);
    r0.y = dot(r1.xyw, hg_Params[3].xyz);
    r0.xy = r0.xy + hg_Params[6].xy;
    r0.xy = r0.xy*hg_Params[6].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEPixellate canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPixellate`

```asm
00000000000c5da8	mov	w4, #0x1
00000000000c5dac	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c5db0	ldr	x4, [x20]
00000000000c5db4	sub	x2, x29, #0x48
00000000000c5db8	mov	x0, x19
00000000000c5dbc	mov	w3, #0x2
00000000000c5dc0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000c5dc4	ldr	x2, [x20]
00000000000c5dc8	mov	x0, x23
00000000000c5dcc	bl	"_objc_msgSend$getRenderMode:"
00000000000c5dd0	cbz	w0, 0xc5fd8
00000000000c5dd4	mov	x0, x22
00000000000c5dd8	bl	_objc_msgSend$imageType
00000000000c5ddc	cmp	x0, #0x3
00000000000c5de0	b.ne	0xc5fd8
00000000000c5de4	cbz	x22, 0xc5df8
00000000000c5de8	sub	x8, x29, #0x50
00000000000c5dec	mov	x0, x22
00000000000c5df0	bl	_objc_msgSend$heliumRef
00000000000c5df4	b	0xc5dfc
00000000000c5df8	stur	xzr, [x29, #-0x50]
00000000000c5dfc	mov	w0, #0x1a0
00000000000c5e00	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c5e04	mov	x20, x0
00000000000c5e08	bl	__ZN12HgcPixellateC2Ev
00000000000c5e0c	adrp	x8, 720 ; 0x395000
00000000000c5e10	add	x8, x8, #0xa08
00000000000c5e14	add	x8, x8, #0x10
00000000000c5e18	str	x8, [x20]
00000000000c5e1c	add	x8, sp, #0xa0
00000000000c5e20	mov	x0, x23
00000000000c5e24	mov	x2, x22
00000000000c5e28	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000c5e2c	add	x8, sp, #0x20
00000000000c5e30	mov	x0, x23
00000000000c5e34	mov	x2, x22
00000000000c5e38	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000c5e3c	ldp	d1, d0, [x29, #-0x40]
00000000000c5e40	stp	d0, d1, [sp, #0x10]
00000000000c5e44	mov	x8, sp
00000000000c5e48	add	x2, sp, #0x10
00000000000c5e4c	mov	x0, x23
00000000000c5e50	mov	x3, x22
00000000000c5e54	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
00000000000c5e58	ldr	q0, [sp]
00000000000c5e5c	str	q0, [sp, #0x10]
00000000000c5e60	ldur	x2, [x29, #-0x50]
00000000000c5e64	ldr	x8, [x20]
00000000000c5e68	ldr	x8, [x8, #0x78]
00000000000c5e6c	mov	x0, x20
00000000000c5e70	mov	w1, #0x0
00000000000c5e74	blr	x8
00000000000c5e78	ldp	d0, d1, [sp, #0xa0]
00000000000c5e7c	fcvt	s0, d0
00000000000c5e80	fcvt	s1, d1
00000000000c5e84	ldp	d2, d3, [sp, #0xb0]
00000000000c5e88	fcvt	s2, d2
00000000000c5e8c	fcvt	s3, d3
00000000000c5e90	ldr	x8, [x20]
00000000000c5e94	ldr	x8, [x8, #0x60]
00000000000c5e98	mov	x0, x20
00000000000c5e9c	mov	w1, #0x0
00000000000c5ea0	blr	x8
00000000000c5ea4	ldp	d0, d1, [sp, #0xc0]
00000000000c5ea8	fcvt	s0, d0
00000000000c5eac	fcvt	s1, d1
00000000000c5eb0	ldp	d2, d3, [sp, #0xd0]
00000000000c5eb4	fcvt	s2, d2
00000000000c5eb8	fcvt	s3, d3
00000000000c5ebc	ldr	x8, [x20]
00000000000c5ec0	ldr	x8, [x8, #0x60]
00000000000c5ec4	mov	x0, x20
00000000000c5ec8	mov	w1, #0x1
00000000000c5ecc	blr	x8
00000000000c5ed0	ldp	d0, d1, [sp, #0x20]
00000000000c5ed4	fcvt	s0, d0
00000000000c5ed8	fcvt	s1, d1
00000000000c5edc	ldp	d2, d3, [sp, #0x30]
00000000000c5ee0	fcvt	s2, d2
00000000000c5ee4	fcvt	s3, d3
00000000000c5ee8	ldr	x8, [x20]
00000000000c5eec	ldr	x8, [x8, #0x60]
00000000000c5ef0	mov	x0, x20
00000000000c5ef4	mov	w1, #0x2
00000000000c5ef8	blr	x8
00000000000c5efc	ldp	d0, d1, [sp, #0x40]
00000000000c5f00	fcvt	s0, d0
00000000000c5f04	fcvt	s1, d1
00000000000c5f08	ldp	d2, d3, [sp, #0x50]
00000000000c5f0c	fcvt	s2, d2
00000000000c5f10	fcvt	s3, d3
00000000000c5f14	ldr	x8, [x20]
00000000000c5f18	ldr	x8, [x8, #0x60]
00000000000c5f1c	mov	x0, x20
00000000000c5f20	mov	w1, #0x3
00000000000c5f24	blr	x8
00000000000c5f28	ldp	d0, d1, [sp, #0x10]
00000000000c5f2c	fcvt	s0, d0
00000000000c5f30	fcvt	s1, d1
00000000000c5f34	ldr	x8, [x20]
00000000000c5f38	ldr	x8, [x8, #0x60]
00000000000c5f3c	movi.2d	v2, #0000000000000000
00000000000c5f40	movi.2d	v3, #0000000000000000
00000000000c5f44	mov	x0, x20
00000000000c5f48	mov	w1, #0x4
00000000000c5f4c	blr	x8
00000000000c5f50	ldur	d1, [x29, #-0x48]
00000000000c5f54	fmov	d0, #1.00000000
00000000000c5f58	fdiv	d0, d0, d1
00000000000c5f5c	fcvt	s0, d0
00000000000c5f60	fcvt	s1, d1
00000000000c5f64	ldr	x8, [x20]
00000000000c5f68	ldr	x8, [x8, #0x60]
00000000000c5f6c	movi.2d	v2, #0000000000000000
00000000000c5f70	movi.2d	v3, #0000000000000000
00000000000c5f74	mov	x0, x20
00000000000c5f78	mov	w1, #0x5
00000000000c5f7c	blr	x8
00000000000c5f80	str	x20, [sp]
00000000000c5f84	ldr	x8, [x20]
00000000000c5f88	ldr	x8, [x8, #0x10]
00000000000c5f8c	mov	x0, x20
00000000000c5f90	blr	x8
00000000000c5f94	mov	x2, sp
00000000000c5f98	mov	x0, x21
00000000000c5f9c	bl	"_objc_msgSend$setHeliumRef:"
00000000000c5fa0	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm2 (float)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  parm2 (float)
    slot 5  <-  parm2 (float)
```
