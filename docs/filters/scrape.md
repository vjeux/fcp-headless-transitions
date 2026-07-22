# Scrape

- **PAE class:** `Scrape`
- **Plugin UUID:** `0D6E968B-0291-43E2-A8DA-88EB80E9C4B2`
- **Node names in corpus:** Scrape (58), Scrape Down Out (9), Scrape Down In (9), Scrape Top (7), Scrape Bottom (7), Scrape Right Out (6)
- **Corpus usage:** 48 files, 135 instances

## What it does

Scrape (FCP UI: 'Smear', PAEScrape) smears the layer along an axis: pixels past a threshold line (set by Amount, oriented by Rotation, anchored at Center) are dragged/streaked in the axis direction, an inverse-map geometric warp with no blur. Implemented and RE'd verbatim from the HgcScrape shader.

> **Note.** Corpus dropped 2 localized (non-English) parameter duplicates. FCP calls this 'Smear'; the PAE class is PAEScrape.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the smear (X,Y) in normalized frame coordinates. *(keyframed in 112 instances)* |
| Rotation | float (radians) | 0 | 0 .. 6.283 | Orientation of the smear axis in radians, 0..2pi. *(keyframed in 2 instances)* |
| Amount | float | 50 | 0 .. 200 | Smear strength, 0-200 (default 50). Controls the threshold line position -- how much of the layer past the center gets dragged. 0 = no smear. *(keyframed in 9 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the smeared result over the original, 0-1 continuous. *(keyframed in 28 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/scrape.ts`](../../engine/src/compositor/filters/scrape.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcScrape`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcScrape` → [`HgcScrape.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcScrape.metal)

```metal
//Metal1.0     
//LEN=0000000477
[[ visible ]] FragmentOut HgcScrape_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.zw = texCoord0.xy - hg_Params[0].xy;
    r0.xy = r0.zw/hg_Params[4].xy;
    r0.zw = r0.xy*hg_Params[1].xy;
    r1.x = dot(r0.xy, hg_Params[1].xy);
    r0.z = float(r0.z >= -r0.w);
    r1.y = float(r1.x >= hg_Params[2].x);
    r1.z = float(-r1.y >= c0.z);
    r1.z = fmin(r0.z, r1.z);
    r1.w = r1.x*hg_Params[3].w;
    r0.w = c0.x*hg_Params[2].x + -r1.x;
    r0.z = fmin(r0.z, r1.y);
    r0.z = select(c0.z, r0.w, -r0.z < 0.00000f);
    r1.w = -r1.x*r1.w;
    r0.w = r1.w*c0.x;
    r0.z = select(r0.z, r0.w, -r1.z < 0.00000f);
    r0.zw = r0.zz*hg_Params[1].xy + r0.xy;
    r0.xy = 1.00000f / hg_Params[4].zw;
    r0.xy = r0.zw*r0.xy + hg_Params[0].xy;
    r0.xy = r0.xy + hg_Params[5].xy;
    r0.xy = r0.xy*hg_Params[5].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEScrape canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEScrape`

```asm
000000000005d9f8	mov	w4, #0x1
000000000005d9fc	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
000000000005da00	add	x8, sp, #0x20
000000000005da04	add	x2, sp, #0x30
000000000005da08	mov	x0, x22
000000000005da0c	mov	x3, x21
000000000005da10	bl	"_objc_msgSend$convertRelativeToPixelCoordinates:withImage:"
000000000005da14	ldr	q0, [sp, #0x20]
000000000005da18	str	q0, [sp, #0x30]
000000000005da1c	ldr	x4, [x23]
000000000005da20	add	x2, sp, #0x20
000000000005da24	mov	x0, x19
000000000005da28	mov	w3, #0x2
000000000005da2c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005da30	tbnz	w24, #0x0, 0x5da4c
000000000005da34	ldr	d0, [sp, #0x20]
000000000005da38	adrp	x8, 523 ; 0x268000
000000000005da3c	ldr	d1, [x8, #0xe08]
000000000005da40	fadd	d0, d0, d1
000000000005da44	fneg	d0, d0
000000000005da48	str	d0, [sp, #0x20]
000000000005da4c	ldr	x4, [x23]
000000000005da50	add	x2, sp, #0x18
000000000005da54	mov	x0, x19
000000000005da58	mov	w3, #0x3
000000000005da5c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005da60	ldr	d0, [sp, #0x18]
000000000005da64	mov	x8, #0x4069000000000000
000000000005da68	fmov	d1, x8
000000000005da6c	fcmp	d0, d1
000000000005da70	fcsel	d2, d1, d0, gt
000000000005da74	fsub	d2, d1, d2
000000000005da78	fcmp	d0, #0.0
000000000005da7c	fcsel	d0, d1, d2, mi
000000000005da80	str	d0, [sp, #0x18]
000000000005da84	movi.2d	v8, #0000000000000000
000000000005da88	fcmp	d0, #0.0
000000000005da8c	b.le	0x5da9c
000000000005da90	fmov	d1, #1.00000000
000000000005da94	fdiv	d0, d1, d0
000000000005da98	fcvt	s8, d0
000000000005da9c	ldr	x4, [x23]
000000000005daa0	add	x2, sp, #0x14
000000000005daa4	mov	x0, x19
000000000005daa8	mov	w3, #0x4
000000000005daac	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000005dab0	ldr	d0, [sp, #0x20]
000000000005dab4	bl	0x25205c ; symbol stub for: ___sincos_stret
000000000005dab8	mov.16b	v10, v0
000000000005dabc	mov.16b	v9, v1
000000000005dac0	ldr	x2, [x23]
000000000005dac4	mov	x0, x22
000000000005dac8	bl	"_objc_msgSend$getRenderMode:"
000000000005dacc	cbz	w0, 0x5dc50
000000000005dad0	mov	x0, x21
000000000005dad4	bl	_objc_msgSend$imageType
000000000005dad8	cmp	x0, #0x3
000000000005dadc	b.ne	0x5dc50
000000000005dae0	cbz	x21, 0x5daf4
000000000005dae4	add	x8, sp, #0x8
000000000005dae8	mov	x0, x21
000000000005daec	bl	_objc_msgSend$heliumRef
000000000005daf0	b	0x5daf8
000000000005daf4	str	xzr, [sp, #0x8]
000000000005daf8	mov	w0, #0x1b0
000000000005dafc	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005db00	mov	x23, x0
000000000005db04	bl	__ZN9HgcScrapeC2Ev
000000000005db08	adrp	x8, 824 ; 0x395000
000000000005db0c	add	x8, x8, #0xfe8
000000000005db10	add	x9, x8, #0x10
000000000005db14	str	x9, [x23]
000000000005db18	str	x23, [sp]
000000000005db1c	ldr	x2, [sp, #0x8]
000000000005db20	ldr	x8, [x8, #0x88]
000000000005db24	mov	x0, x23
000000000005db28	mov	w1, #0x0
000000000005db2c	blr	x8
000000000005db30	ldp	d0, d1, [sp, #0x30]
000000000005db34	fcvt	s0, d0
000000000005db38	fcvt	s1, d1
000000000005db3c	ldr	x8, [x23]
000000000005db40	ldr	x8, [x8, #0x60]
000000000005db44	movi.2d	v2, #0000000000000000
000000000005db48	movi.2d	v3, #0000000000000000
000000000005db4c	mov	x0, x23
000000000005db50	mov	w1, #0x0
000000000005db54	blr	x8
000000000005db58	fcvt	s0, d10
000000000005db5c	fneg	s0, s0
000000000005db60	fcvt	s1, d9
000000000005db64	ldr	x8, [x23]
000000000005db68	ldr	x8, [x8, #0x60]
000000000005db6c	movi.2d	v2, #0000000000000000
000000000005db70	movi.2d	v3, #0000000000000000
000000000005db74	mov	x0, x23
000000000005db78	mov	w1, #0x1
000000000005db7c	blr	x8
000000000005db80	ldr	d0, [sp, #0x18]
000000000005db84	fcvt	s0, d0
000000000005db88	ldr	x8, [x23]
000000000005db8c	ldr	x8, [x8, #0x60]
000000000005db90	movi.2d	v1, #0000000000000000
000000000005db94	movi.2d	v2, #0000000000000000
000000000005db98	movi.2d	v3, #0000000000000000
000000000005db9c	mov	x0, x23
000000000005dba0	mov	w1, #0x2
000000000005dba4	blr	x8
000000000005dba8	ldr	x8, [x23]
000000000005dbac	ldr	x8, [x8, #0x60]
000000000005dbb0	movi.2d	v1, #0000000000000000
000000000005dbb4	movi.2d	v2, #0000000000000000
000000000005dbb8	movi.2d	v3, #0000000000000000
000000000005dbbc	mov	x0, x23
000000000005dbc0	mov	w1, #0x3
000000000005dbc4	mov.16b	v0, v8
000000000005dbc8	blr	x8
000000000005dbcc	ldp	d2, d3, [sp, #0x40]
000000000005dbd0	fcvt	s0, d2
000000000005dbd4	fcvt	s1, d3
000000000005dbd8	fmov	d4, #1.00000000
000000000005dbdc	fdiv	d2, d4, d2
000000000005dbe0	fcvt	s2, d2
000000000005dbe4	fdiv	d3, d4, d3
000000000005dbe8	fcvt	s3, d3
000000000005dbec	ldr	x8, [x23]
000000000005dbf0	ldr	x8, [x8, #0x60]
000000000005dbf4	mov	x0, x23
000000000005dbf8	mov	w1, #0x4
000000000005dbfc	blr	x8
000000000005dc00	ldr	w8, [sp, #0x14]
000000000005dc04	cbz	w8, 0x5dc1c
000000000005dc08	mov	x2, sp
000000000005dc0c	mov	x0, x22
000000000005dc10	mov	x3, x21
000000000005dc14	mov	x4, x20
000000000005dc18	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000005dc1c	mov	x2, sp
000000000005dc20	mov	x0, x20
000000000005dc24	bl	"_objc_msgSend$setHeliumRef:"
000000000005dc28	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : AngleSlider
    parm3 : FloatSlider
    parm4 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (int)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm4 (int)
    slot 2  <-  parm3 (float)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  (constant / computed / multi-pass — read the disasm)
```
