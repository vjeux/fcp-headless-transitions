# PAECircleScreen

- **PAE class:** `PAECircleScreen`
- **Plugin UUID:** `46396CAD-950B-4EA3-92F3-0CC54DF53AC9`
- **Node names in corpus:** Circle Screen copy (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Circle Screen (PAECircleScreen) renders the image as a halftone screen made of concentric circles/rings around Center. Scale sets the ring frequency and Contrast the hardness. It is the circular sibling of Line Screen / Halftone.

> **Note.** Not implemented; description is the standard Apple Motion "Circle Screen" halftone filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the ring screen (X,Y) in normalized frame coordinates. |
| Scale | enum(int) | 10 | 5 .. 5 | Ring frequency / spacing (default 10; sampled 5). |
| Contrast | float | 0.5 | 0 .. 0 | Hardness of the ring pattern, default 0.5. Continuous float, NOT a boolean. |
| Mix | float | 1 | 0.0735 .. 0.0735 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcCircularScreen`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcCircularScreen` → [`HgcCircularScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcCircularScreen.metal)

```metal
//Metal1.0     
//LEN=0000000370
[[ visible ]] FragmentOut HgcCircularScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(9.999999975e-07, 1.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord1.xy*hg_Params[1].wz + hg_Params[0].xy;
    r0.xyz = float3(dot(r0.xy, r0.xy));
    r1.x = r0.x + c0.x;
    r1.xyz = rsqrt(r1.xxx);
    r0.xyz = r0.xyz*r1.xyz;
    r0.xyz = r0.xyz*hg_Params[1].xxx;
    r0.xyz = fract(r0.xyz);
    r1.xyz = c0.yyy - r0.xyz;
    r1.xyz = fmin(r1.xyz, r0.xyz);
    r1.xyz = r1.xyz + r1.xyz;
    r0 = color0;
    r2.xyz = float3(dot(r0, hg_Params[2]));
    r2.xyz = r2.xyz - r1.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[1].yyy + c0.zzz, 0.00000f, 1.00000f);
    r0.xyz = r2.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAECircleScreen canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAECircleScreen`

```asm
00000000000a5f54	mov	w4, #0x1
00000000000a5f58	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000a5f5c	ldr	x4, [x21]
00000000000a5f60	add	x2, sp, #0x38
00000000000a5f64	mov	x0, x20
00000000000a5f68	mov	w3, #0x2
00000000000a5f6c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a5f70	ldr	x4, [x21]
00000000000a5f74	add	x2, sp, #0x30
00000000000a5f78	mov	x0, x20
00000000000a5f7c	mov	w3, #0x3
00000000000a5f80	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a5f84	ldr	x2, [x21]
00000000000a5f88	mov	x0, x24
00000000000a5f8c	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000a5f90	bl	_objc_msgSend$matrix
00000000000a5f94	mov	x24, x0
00000000000a5f98	ldr	x2, [x21]
00000000000a5f9c	mov	x0, x23
00000000000a5fa0	bl	"_objc_msgSend$getRenderMode:"
00000000000a5fa4	cbz	w0, 0xa5fd0
00000000000a5fa8	mov	x0, x22
00000000000a5fac	bl	_objc_msgSend$imageType
00000000000a5fb0	cmp	x0, #0x3
00000000000a5fb4	b.ne	0xa5fcc
00000000000a5fb8	cbz	x22, 0xa5ff0
00000000000a5fbc	add	x8, sp, #0x28
00000000000a5fc0	mov	x0, x22
00000000000a5fc4	bl	_objc_msgSend$heliumRef
00000000000a5fc8	b	0xa5ff4
00000000000a5fcc	mov	w0, #0x0
00000000000a5fd0	ldp	x29, x30, [sp, #0x120]
00000000000a5fd4	ldp	x20, x19, [sp, #0x110]
00000000000a5fd8	ldp	x22, x21, [sp, #0x100]
00000000000a5fdc	ldp	x24, x23, [sp, #0xf0]
00000000000a5fe0	ldp	x28, x27, [sp, #0xe0]
00000000000a5fe4	ldp	d9, d8, [sp, #0xd0]
00000000000a5fe8	add	sp, sp, #0x130
00000000000a5fec	ret
00000000000a5ff0	str	xzr, [sp, #0x28]
00000000000a5ff4	mov	w0, #0x1c0
00000000000a5ff8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a5ffc	mov	x20, x0
00000000000a6000	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000a6004	ldr	x2, [sp, #0x28]
00000000000a6008	ldr	x8, [x20]
00000000000a600c	ldr	x8, [x8, #0x78]
00000000000a6010	mov	x0, x20
00000000000a6014	mov	w1, #0x0
00000000000a6018	blr	x8
00000000000a601c	ldr	x8, [x21, #0x28]
00000000000a6020	cbnz	x8, 0xa6054
00000000000a6024	ldr	x0, [sp, #0x28]
00000000000a6028	cmp	x0, x20
00000000000a602c	b.eq	0xa6054
00000000000a6030	cbz	x0, 0xa6040
00000000000a6034	ldr	x8, [x0]
00000000000a6038	ldr	x8, [x8, #0x18]
00000000000a603c	blr	x8
00000000000a6040	str	x20, [sp, #0x28]
00000000000a6044	ldr	x8, [x20]
00000000000a6048	ldr	x8, [x8, #0x10]
00000000000a604c	mov	x0, x20
00000000000a6050	blr	x8
00000000000a6054	mov	w0, #0x1a0
00000000000a6058	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a605c	mov	x21, x0
00000000000a6060	bl	__ZN17HgcCircularScreenC2Ev
00000000000a6064	adrp	x8, 748 ; 0x392000
00000000000a6068	add	x8, x8, #0xff8
00000000000a606c	add	x8, x8, #0x10
00000000000a6070	str	x8, [x21]
00000000000a6074	ldp	d1, d0, [sp, #0x40]
00000000000a6078	stp	d0, d1, [sp, #0x10]
00000000000a607c	mov	x8, sp
00000000000a6080	add	x2, sp, #0x10
00000000000a6084	mov	x0, x23
00000000000a6088	mov	x3, x22
00000000000a608c	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000a6090	ldr	q0, [sp]
00000000000a6094	str	q0, [sp, #0x10]
00000000000a6098	ldr	x2, [sp, #0x28]
00000000000a609c	ldr	x8, [x21]
00000000000a60a0	ldr	x8, [x8, #0x78]
00000000000a60a4	mov	x0, x21
00000000000a60a8	mov	w1, #0x0
00000000000a60ac	blr	x8
00000000000a60b0	ldp	d0, d1, [sp, #0x10]
00000000000a60b4	fcvt	s0, d0
00000000000a60b8	fcvt	s1, d1
00000000000a60bc	ldr	x8, [x21]
00000000000a60c0	ldr	x8, [x8, #0x60]
00000000000a60c4	movi.2d	v2, #0000000000000000
00000000000a60c8	movi.2d	v3, #0000000000000000
00000000000a60cc	mov	x0, x21
00000000000a60d0	mov	w1, #0x0
00000000000a60d4	blr	x8
00000000000a60d8	fabs	d2, d9
00000000000a60dc	ldp	d1, d0, [sp, #0x30]
00000000000a60e0	fmov	d3, #1.00000000
00000000000a60e4	fdiv	d0, d3, d0
00000000000a60e8	fcvt	s0, d0
00000000000a60ec	fsub	d1, d3, d1
00000000000a60f0	fdiv	d1, d3, d1
00000000000a60f4	fcvt	s1, d1
00000000000a60f8	fdiv	d2, d3, d2
00000000000a60fc	fcvt	s2, d2
00000000000a6100	fdiv	d3, d3, d8
00000000000a6104	fcvt	s3, d3
00000000000a6108	ldr	x8, [x21]
00000000000a610c	ldr	x8, [x8, #0x60]
00000000000a6110	mov	x0, x21
00000000000a6114	mov	w1, #0x1
00000000000a6118	blr	x8
00000000000a611c	ldp	d0, d1, [x24]
00000000000a6120	fcvt	s0, d0
00000000000a6124	fcvt	s1, d1
00000000000a6128	ldr	d2, [x24, #0x10]
00000000000a612c	fcvt	s2, d2
00000000000a6130	ldr	x8, [x21]
00000000000a6134	ldr	x8, [x8, #0x60]
00000000000a6138	movi.2d	v3, #0000000000000000
00000000000a613c	mov	x0, x21
00000000000a6140	mov	w1, #0x2
00000000000a6144	blr	x8
00000000000a6148	str	x21, [sp]
00000000000a614c	ldr	x8, [x21]
00000000000a6150	ldr	x8, [x8, #0x10]
00000000000a6154	mov	x0, x21
00000000000a6158	blr	x8
00000000000a615c	mov	x2, sp
00000000000a6160	mov	x0, x19
00000000000a6164	bl	"_objc_msgSend$setHeliumRef:"
00000000000a6168	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : FloatSlider
    parm3 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm3 (float)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
```
