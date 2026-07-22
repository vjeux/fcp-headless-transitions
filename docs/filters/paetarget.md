# PAETarget

- **PAE class:** `PAETarget`
- **Plugin UUID:** `220963F2-8E3F-4642-A080-C064CA0B487E`
- **Node names in corpus:** Target (4), ImageOSC-8 (1), ImageOSC-7 (1), ImageOSC-6 (1), ImageOSC-5 (1), ImageOSC-4 (1)
- **Corpus usage:** 6 files, 16 instances

## What it does

Target (PAETarget) creates a concentric target/tunnel distortion: it remaps the image radially around Center so it wraps into rings, with an Angle offset for spiral twist. The verbatim HgcTarget shader computes distance from center, scales it, adds an angular term, and resamples -- a radial coordinate warp.

> **Note.** Shader-only. The verbatim HgcTarget Metal shader (radial distance remap around Center) is checked in under evidence/shaders/; not yet ported to TS. Node names are usually "Target".

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the target rings (X,Y) in normalized frame coordinates (shader hg_Params[0]). |
| Angle | float (radians) | pi/8 (0.3927) | 0 .. 6.252 | Angular twist/offset of the rings, radians (default pi/8). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcTarget` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcTarget.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTarget`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTarget` → [`HgcTarget.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTarget.metal)

```metal
//Metal1.0     
//LEN=000000028f
[[ visible ]] FragmentOut HgcTarget_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0;
    FragmentOut output;

    r0.xyz = texCoord0.xyz - hg_Params[0].xyz;
    r0.xy = r0.xy*hg_Params[2].xy;
    r0.x = dot(r0.xyz, r0.xyz);
    r0.x = sqrt(r0.x);
    r0.xy = hg_Params[1].xy*r0.xx;
    r0.xy = r0.xy*hg_Params[2].zw;
    r0.xy = hg_Params[0].xy*hg_Params[3].xy + r0.xy;
    r0.xy = r0.xy + hg_Params[4].xy;
    r0.xy = r0.xy*hg_Params[4].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAETarget canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAETarget`

```asm
0000000000062ce4	mov	x5, x27
0000000000062ce8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000062cec	ldp	d3, d0, [x29, #-0x90]
0000000000062cf0	fmov	d1, #-1.00000000
0000000000062cf4	fcmp	d0, d1
0000000000062cf8	fcsel	d0, d1, d0, mi
0000000000062cfc	fmov	d2, #2.00000000
0000000000062d00	fcmp	d0, d2
0000000000062d04	fcsel	d0, d2, d0, gt
0000000000062d08	fcmp	d3, d1
0000000000062d0c	fcsel	d1, d1, d3, mi
0000000000062d10	fcmp	d1, d2
0000000000062d14	fcsel	d1, d2, d1, gt
0000000000062d18	ucvtf	d10, x22
0000000000062d1c	fmul	d2, d0, d10
0000000000062d20	ucvtf	d11, x23
0000000000062d24	fmul	d0, d1, d11
0000000000062d28	stp	d0, d2, [x29, #-0x90]
0000000000062d2c	sub	x2, x29, #0x98
0000000000062d30	mov	x0, x26
0000000000062d34	mov	w3, #0x2
0000000000062d38	mov	x4, x27
0000000000062d3c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000062d40	sub	x2, x29, #0x99
0000000000062d44	mov	x0, x26
0000000000062d48	mov	w3, #0x3
0000000000062d4c	mov	x4, x27
0000000000062d50	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000062d54	add	x8, sp, #0x20
0000000000062d58	mov	x0, x25
0000000000062d5c	mov	x2, x21
0000000000062d60	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000062d64	ldur	d0, [x29, #-0x98]
0000000000062d68	bl	0x25205c ; symbol stub for: ___sincos_stret
0000000000062d6c	mov.16b	v8, v0
0000000000062d70	mov.16b	v9, v1
0000000000062d74	ldr	x2, [x20]
0000000000062d78	mov	x0, x25
0000000000062d7c	bl	"_objc_msgSend$getRenderMode:"
0000000000062d80	cbz	w0, 0x62dac
0000000000062d84	mov	x0, x21
0000000000062d88	bl	_objc_msgSend$imageType
0000000000062d8c	cmp	x0, #0x3
0000000000062d90	b.ne	0x62da8
0000000000062d94	cbz	x21, 0x62dd8
0000000000062d98	add	x8, sp, #0x18
0000000000062d9c	mov	x0, x21
0000000000062da0	bl	_objc_msgSend$heliumRef
0000000000062da4	b	0x62ddc
0000000000062da8	mov	w0, #0x0
0000000000062dac	ldp	x29, x30, [sp, #0x140]
0000000000062db0	ldp	x20, x19, [sp, #0x130]
0000000000062db4	ldp	x22, x21, [sp, #0x120]
0000000000062db8	ldp	x24, x23, [sp, #0x110]
0000000000062dbc	ldp	x26, x25, [sp, #0x100]
0000000000062dc0	ldp	x28, x27, [sp, #0xf0]
0000000000062dc4	ldp	d9, d8, [sp, #0xe0]
0000000000062dc8	ldp	d11, d10, [sp, #0xd0]
0000000000062dcc	ldp	d13, d12, [sp, #0xc0]
0000000000062dd0	add	sp, sp, #0x150
0000000000062dd4	ret
0000000000062dd8	str	xzr, [sp, #0x18]
0000000000062ddc	mov	w0, #0x1c0
0000000000062de0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000062de4	mov	x20, x0
0000000000062de8	bl	__ZN9HgcTargetC2Ev
0000000000062dec	adrp	x8, 813 ; 0x38f000
0000000000062df0	add	x8, x8, #0x628
0000000000062df4	add	x9, x8, #0x10
0000000000062df8	str	x9, [x20]
0000000000062dfc	str	xzr, [x20, #0x1a0]
0000000000062e00	add	x9, x20, #0x1a8
0000000000062e04	adrp	x10, 806 ; 0x388000
0000000000062e08	ldr	x10, [x10, #0x528] ; literal pool symbol address: _HGRectInfinite
0000000000062e0c	ldr	q0, [x10]
0000000000062e10	str	q0, [x9]
0000000000062e14	ldr	x2, [sp, #0x18]
0000000000062e18	ldr	x8, [x8, #0x88]
0000000000062e1c	mov	x0, x20
0000000000062e20	mov	w1, #0x0
0000000000062e24	blr	x8
0000000000062e28	mov	x0, x21
0000000000062e2c	bl	_objc_msgSend$width
0000000000062e30	ucvtf	d0, x0
0000000000062e34	fmov	d12, #-0.50000000
0000000000062e38	fmul	d0, d0, d12
0000000000062e3c	ldur	d1, [x29, #-0x88]
0000000000062e40	fadd	d0, d1, d0
0000000000062e44	stur	d0, [x29, #-0x88]
0000000000062e48	mov	x0, x21
0000000000062e4c	bl	_objc_msgSend$height
0000000000062e50	ucvtf	d0, x0
0000000000062e54	fmul	d0, d0, d12
0000000000062e58	ldur	d1, [x29, #-0x90]
0000000000062e5c	fadd	d1, d1, d0
0000000000062e60	stur	d1, [x29, #-0x90]
0000000000062e64	ldur	d0, [x29, #-0x88]
0000000000062e68	fcvt	s0, d0
0000000000062e6c	fcvt	s1, d1
0000000000062e70	ldr	x8, [x20]
0000000000062e74	ldr	x8, [x8, #0x60]
0000000000062e78	movi.2d	v2, #0000000000000000
0000000000062e7c	movi.2d	v3, #0000000000000000
0000000000062e80	mov	x0, x20
0000000000062e84	mov	w1, #0x0
0000000000062e88	blr	x8
0000000000062e8c	fcvt	s9, d9
0000000000062e90	fcvt	s8, d8
0000000000062e94	ldr	x8, [x20]
0000000000062e98	ldr	x8, [x8, #0x60]
0000000000062e9c	movi.2d	v2, #0000000000000000
0000000000062ea0	movi.2d	v3, #0000000000000000
0000000000062ea4	mov	x0, x20
0000000000062ea8	mov	w1, #0x1
0000000000062eac	mov.16b	v0, v9
0000000000062eb0	mov.16b	v1, v8
0000000000062eb4	blr	x8
0000000000062eb8	fmov	d1, #1.00000000
0000000000062ebc	ldr	d2, [sp, #0x20]
0000000000062ec0	ldr	d3, [sp, #0x48]
0000000000062ec4	fdiv	d0, d1, d2
0000000000062ec8	fcvt	s0, d0
0000000000062ecc	fdiv	d1, d1, d3
0000000000062ed0	fcvt	s1, d1
0000000000062ed4	fcvt	s2, d2
0000000000062ed8	fcvt	s3, d3
0000000000062edc	ldr	x8, [x20]
0000000000062ee0	ldr	x8, [x8, #0x60]
0000000000062ee4	mov	x0, x20
0000000000062ee8	mov	w1, #0x2
0000000000062eec	blr	x8
0000000000062ef0	cmp	w24, #0x0
0000000000062ef4	fmov	s0, #1.00000000
0000000000062ef8	fmov	s1, #-1.00000000
0000000000062efc	fcsel	s1, s1, s0, eq
0000000000062f00	ldr	x8, [x20]
0000000000062f04	ldr	x8, [x8, #0x60]
0000000000062f08	fmov	s2, #1.00000000
0000000000062f0c	fmov	s3, #1.00000000
0000000000062f10	mov	x0, x20
0000000000062f14	mov	w1, #0x3
0000000000062f18	blr	x8
0000000000062f1c	mov	x0, x21
0000000000062f20	bl	_objc_msgSend$width
0000000000062f24	mov	x24, x0
0000000000062f28	mov	x0, x21
0000000000062f2c	bl	_objc_msgSend$height
0000000000062f30	mov	x2, x0
0000000000062f34	mov	x0, x20
0000000000062f38	mov	x1, x24
0000000000062f3c	bl	__ZN7HTarget12SetFrameSizeEjj
0000000000062f40	ldp	d12, d13, [x29, #-0x90]
0000000000062f44	ucvtf	s0, x22
0000000000062f48	ucvtf	s2, x22, #0x1
0000000000062f4c	fmov	s1, #0.50000000
0000000000062f50	fnmul	s0, s0, s1
0000000000062f54	ucvtf	s4, x23
0000000000062f58	ucvtf	s3, x23, #0x1
0000000000062f5c	fnmul	s1, s4, s1
0000000000062f60	bl	0x250a3c ; symbol stub for: _HGRectMake4f
0000000000062f64	mov	x21, x0
0000000000062f68	mov	x22, x1
0000000000062f6c	fmov	s0, #-1.00000000
0000000000062f70	fmov	s1, #-1.00000000
0000000000062f74	fmov	s2, #1.00000000
0000000000062f78	fmov	s3, #1.00000000
0000000000062f7c	bl	0x250a3c ; symbol stub for: _HGRectMake4f
0000000000062f80	mov	x2, x0
0000000000062f84	mov	x3, x1
0000000000062f88	mov	x0, x21
0000000000062f8c	mov	x1, x22
0000000000062f90	bl	0x250a00 ; symbol stub for: _HGRectGrow
0000000000062f94	fdiv	s4, s8, s9
0000000000062f98	fcvt	d0, s4
0000000000062f9c	fmul	d0, d13, d0
0000000000062fa0	fsub	d0, d12, d0
0000000000062fa4	fcvt	s16, d0
0000000000062fa8	scvtf	d2, w0
0000000000062fac	scvtf	d3, w1
0000000000062fb0	lsr	x8, x0, #32
0000000000062fb4	scvtf	s0, w8
0000000000062fb8	fsub	s0, s0, s16
0000000000062fbc	fdiv	s0, s0, s4
0000000000062fc0	fcvt	d6, s0
0000000000062fc4	scvtf	d0, w8
0000000000062fc8	lsr	x8, x1, #32
0000000000062fcc	scvtf	s1, w8
0000000000062fd0	fsub	s1, s1, s16
0000000000062fd4	fdiv	s1, s1, s4
0000000000062fd8	fcvt	d7, s1
0000000000062fdc	scvtf	d1, w8
0000000000062fe0	ldur	d5, [x29, #-0x90]
0000000000062fe4	fcmp	s9, #0.0
0000000000062fe8	b.ge	0x63054
0000000000062fec	scvtf	s17, w0
0000000000062ff0	fmul	s4, s4, s17
0000000000062ff4	fadd	s4, s4, s16
0000000000062ff8	fcvt	d16, s4
0000000000062ffc	fsub	d4, d2, d13
0000000000063000	fsub	d17, d16, d12
0000000000063004	fmul	d4, d4, d4
0000000000063008	fmul	d17, d17, d17
000000000006300c	fadd	d4, d4, d17
0000000000063010	fcvt	s4, d4
0000000000063014	fsqrt	s17, s4
0000000000063018	fcmp	s8, #0.0
000000000006301c	b.ge	0x630bc
0000000000063020	fsub	d4, d6, d13
0000000000063024	fsub	d7, d0, d12
0000000000063028	fmul	d4, d4, d4
000000000006302c	fmul	d7, d7, d7
0000000000063030	fadd	d4, d7, d4
0000000000063034	fcvt	s4, d4
0000000000063038	fsqrt	s4, s4
000000000006303c	fcmp	s4, s17
0000000000063040	fccmp	d5, d0, #0x4, mi
0000000000063044	fccmp	d6, d2, #0x8, gt
0000000000063048	fccmp	d6, d3, #0x2, ge
000000000006304c	b.hi	0x630ec
0000000000063050	b	0x63158
0000000000063054	scvtf	s17, w1
0000000000063058	fmul	s4, s4, s17
000000000006305c	fadd	s4, s4, s16
0000000000063060	fcvt	d16, s4
0000000000063064	fsub	d4, d3, d13
0000000000063068	fsub	d17, d16, d12
000000000006306c	fmul	d4, d4, d4
0000000000063070	fmul	d17, d17, d17
0000000000063074	fadd	d4, d4, d17
0000000000063078	fcvt	s4, d4
000000000006307c	fsqrt	s17, s4
0000000000063080	fcmp	s8, #0.0
0000000000063084	b.ge	0x63104
0000000000063088	fsub	d4, d6, d13
000000000006308c	fsub	d7, d0, d12
0000000000063090	fmul	d4, d4, d4
0000000000063094	fmul	d7, d7, d7
0000000000063098	fadd	d4, d7, d4
000000000006309c	fcvt	s4, d4
00000000000630a0	fsqrt	s4, s4
00000000000630a4	fcmp	s4, s17
00000000000630a8	fccmp	d5, d0, #0x4, mi
00000000000630ac	fccmp	d6, d2, #0x8, gt
00000000000630b0	fccmp	d6, d3, #0x2, ge
00000000000630b4	b.hi	0x63134
00000000000630b8	b	0x63158
00000000000630bc	fsub	d4, d7, d13
00000000000630c0	fsub	d6, d1, d12
00000000000630c4	fmul	d4, d4, d4
00000000000630c8	fmul	d6, d6, d6
00000000000630cc	fadd	d4, d6, d4
00000000000630d0	fcvt	s4, d4
00000000000630d4	fsqrt	s4, s4
00000000000630d8	fcmp	s4, s17
00000000000630dc	fccmp	d5, d1, #0x0, mi
00000000000630e0	fccmp	d7, d2, #0x8, mi
00000000000630e4	fccmp	d7, d3, #0x2, ge
00000000000630e8	b.ls	0x63158
00000000000630ec	ldur	d3, [x29, #-0x88]
00000000000630f0	fcmp	s4, s17
00000000000630f4	fccmp	d3, d2, #0x4, gt
00000000000630f8	movi.2d	v4, #0000000000000000
00000000000630fc	b.gt	0x63148
0000000000063100	b	0x63158
0000000000063104	fsub	d4, d7, d13
0000000000063108	fsub	d6, d1, d12
000000000006310c	fmul	d4, d4, d4
0000000000063110	fmul	d6, d6, d6
0000000000063114	fadd	d4, d6, d4
0000000000063118	fcvt	s4, d4
000000000006311c	fsqrt	s4, s4
0000000000063120	fcmp	s4, s17
0000000000063124	fccmp	d5, d1, #0x0, mi
0000000000063128	fccmp	d7, d2, #0x8, mi
000000000006312c	fccmp	d7, d3, #0x2, ge
0000000000063130	b.ls	0x63158
0000000000063134	ldur	d2, [x29, #-0x88]
0000000000063138	fcmp	s4, s17
000000000006313c	fccmp	d2, d3, #0x0, gt
0000000000063140	movi.2d	v4, #0000000000000000
0000000000063144	b.pl	0x63158
0000000000063148	fcmp	d16, d1
000000000006314c	fccmp	d16, d0, #0x8, ls
0000000000063150	movi.2d	v0, #0000000000000000
0000000000063154	fcsel	s4, s0, s17, lt
0000000000063158	fcvt	d0, s4
000000000006315c	fsub	d1, d13, d0
0000000000063160	fcvtzs	w0, d1
0000000000063164	fsub	d1, d12, d0
0000000000063168	fcvtzs	w1, d1
000000000006316c	fadd	d1, d13, d0
0000000000063170	fcvtzs	w2, d1
0000000000063174	fadd	d0, d12, d0
0000000000063178	fcvtzs	w3, d0
000000000006317c	bl	0x250a48 ; symbol stub for: _HGRectMake4i
0000000000063180	mov	x21, x0
0000000000063184	mov	x22, x1
0000000000063188	stp	x0, x1, [sp, #0x8]
000000000006318c	ldurb	w8, [x29, #-0x99]
0000000000063190	cmp	w8, #0x1
0000000000063194	b.ne	0x631d0
0000000000063198	fmov	d0, #0.50000000
000000000006319c	fmul	d1, d10, d0
00000000000631a0	fcvtps	w2, d1
00000000000631a4	fmul	d0, d11, d0
00000000000631a8	fcvtps	w3, d0
00000000000631ac	neg	w0, w2
00000000000631b0	neg	w1, w3
00000000000631b4	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000631b8	mov	x2, x0
00000000000631bc	mov	x3, x1
00000000000631c0	mov	x0, x21
00000000000631c4	mov	x1, x22
00000000000631c8	bl	0x250a18 ; symbol stub for: _HGRectIntersection
00000000000631cc	stp	x0, x1, [sp, #0x8]
00000000000631d0	add	x1, sp, #0x8
00000000000631d4	mov	x0, x20
00000000000631d8	bl	__ZN7HTarget11SetCropRectERK6HGRect
00000000000631dc	str	x20, [sp]
00000000000631e0	ldr	x8, [x20]
00000000000631e4	ldr	x8, [x8, #0x10]
00000000000631e8	mov	x0, x20
00000000000631ec	blr	x8
00000000000631f0	mov	x2, sp
00000000000631f4	mov	x0, x19
00000000000631f8	bl	"_objc_msgSend$setHeliumRef:"
00000000000631fc	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : AngleSlider
    parm3 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  parm3 (bool)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
```
