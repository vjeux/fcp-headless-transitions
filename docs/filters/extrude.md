# Extrude

- **PAE class:** `Extrude`
- **Plugin UUID:** `85C01B33-3560-45E5-959E-5C265B0A8977`
- **Node names in corpus:** Extrude (91), Extrude  copy (20), Direction (2), Extrude copy (2), Extrude  (1), OSC 1 (1)
- **Corpus usage:** 60 files, 120 instances

## What it does

Extrude gives a 2D layer a faux-3D extruded depth: it projects the alpha shape back along an Angle by a Distance, shading the extruded sides between Front and Back brightness for a beveled/3D-text look. Not implemented; described from the standard Motion "Extrude".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Extrude" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Distance | float (pixels) | 50 | 0 .. 500 | Depth of the extrusion, 0-500 (default 50). 0 = flat. *(keyframed in 3 instances)* |
| Angle | float (radians) | pi/4 (0.7854) | 0 .. 6.265 | Direction the shape is extruded toward, 0..2pi (default pi/4 = 45 deg). *(keyframed in 1 instance)* |
| Extrude Style | bool/enum | 0 | 0 .. 1 | Style of the extrusion (e.g. solid vs gradient sides). |
| Gradient | group | - | - | Gradient applied along the extruded depth (RGB, Opacity). |
| Face Brightness | float | 1 | 0 .. 8 | Brightness of the front face, 0-8 (default 1). |
| Front Brightness | float | 0.7 | 0 .. 1.42 | Brightness at the near end of the extruded sides, 0-1.42. |
| Back Brightness | float | 0.3 | 0 .. 2 | Brightness at the far end of the extruded sides, 0-2. |
| Back Size | float | 1 | 0.78 .. 1 | Scale of the far face relative to the front, 0.78-1 (perspective taper). *(keyframed in 1 instance)* |
| Clipping | float | 0 | 0 .. 99 | Clips the extrusion depth, 0-99. *(keyframed in 4 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the extruded result over the original, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcExtrudeGradient`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcExtrudeGradient` → [`HgcExtrudeGradient.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcExtrudeGradient.metal)

```metal
//Metal1.0     
//LEN=0000000181
[[ visible ]] FragmentOut HgcExtrudeGradient_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 color,
    float4 texCoord0)
{
    float4 r0;
    FragmentOut output;

    r0.w = hg_Texture0.sample(hg_Sampler0, texCoord0.xy).w;
    output.color0 = color*r0.wwww;
    return output;
}
```

### CPU parameter wiring — `-[PAEExtrude canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEExtrude`

```asm
0000000000118ec0	mov	w3, #0x2
0000000000118ec4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118ec8	ldr	d0, [sp, #0x1f8]
0000000000118ecc	fcmp	d0, #0.0
0000000000118ed0	b.ne	0x118ee8
0000000000118ed4	cbz	x20, 0x119228
0000000000118ed8	add	x8, sp, #0x250
0000000000118edc	mov	x0, x20
0000000000118ee0	bl	_objc_msgSend$heliumRef
0000000000118ee4	b	0x11922c
0000000000118ee8	mov	x0, x20
0000000000118eec	bl	_objc_msgSend$imageType
0000000000118ef0	str	x0, [sp, #0x30]
0000000000118ef4	add	x8, sp, #0x178
0000000000118ef8	mov	x0, x21
0000000000118efc	mov	x2, x19
0000000000118f00	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000118f04	ldr	d13, [sp, #0x178]
0000000000118f08	ldr	d11, [sp, #0x1a0]
0000000000118f0c	mov	x0, x19
0000000000118f10	bl	_objc_msgSend$width
0000000000118f14	str	x0, [sp, #0x38]
0000000000118f18	mov	x0, x19
0000000000118f1c	bl	_objc_msgSend$height
0000000000118f20	mov	x25, x0
0000000000118f24	mov	x0, x20
0000000000118f28	bl	_objc_msgSend$width
0000000000118f2c	mov	x27, x0
0000000000118f30	mov	x0, x20
0000000000118f34	bl	_objc_msgSend$height
0000000000118f38	mov	x28, x0
0000000000118f3c	ldr	x4, [x22]
0000000000118f40	add	x2, sp, #0x170
0000000000118f44	mov	x0, x23
0000000000118f48	mov	w3, #0x1
0000000000118f4c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118f50	ldr	d0, [sp, #0x170]
0000000000118f54	tbnz	w24, #0x0, 0x118f60
0000000000118f58	fneg	d0, d0
0000000000118f5c	str	d0, [sp, #0x170]
0000000000118f60	ldr	d14, [sp, #0x1f8]
0000000000118f64	bl	0x25205c ; symbol stub for: ___sincos_stret
0000000000118f68	mov.16b	v8, v0
0000000000118f6c	mov.16b	v9, v1
0000000000118f70	ldr	x4, [x22]
0000000000118f74	add	x2, sp, #0x168
0000000000118f78	mov	x0, x23
0000000000118f7c	mov	w3, #0x3
0000000000118f80	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118f84	ldr	x4, [x22]
0000000000118f88	add	x2, sp, #0x160
0000000000118f8c	mov	x0, x23
0000000000118f90	mov	w3, #0x4
0000000000118f94	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118f98	ldr	x4, [x22]
0000000000118f9c	add	x2, sp, #0x158
0000000000118fa0	mov	x0, x23
0000000000118fa4	mov	w3, #0x5
0000000000118fa8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118fac	ldr	x4, [x22]
0000000000118fb0	add	x2, sp, #0x150
0000000000118fb4	mov	x0, x23
0000000000118fb8	mov	w3, #0x6
0000000000118fbc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118fc0	ldr	x4, [x22]
0000000000118fc4	add	x2, sp, #0x148
0000000000118fc8	mov	x0, x23
0000000000118fcc	mov	w3, #0x7
0000000000118fd0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000118fd4	ldr	x4, [x22]
0000000000118fd8	add	x2, sp, #0x144
0000000000118fdc	mov	x0, x23
0000000000118fe0	mov	w3, #0x8
0000000000118fe4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
0000000000118fe8	ldr	w8, [sp, #0x144]
0000000000118fec	cmp	w8, #0x1
0000000000118ff0	cset	w24, eq
0000000000118ff4	ldr	x6, [x22]
0000000000118ff8	add	x2, sp, #0x250
0000000000118ffc	mov	x0, x26
0000000000119000	mov	w3, #0x100
0000000000119004	mov	w4, #0x8
0000000000119008	mov	w5, #0x9
000000000011900c	bl	"_objc_msgSend$getGradientSamples:numSamples:depth:fromParm:atFxTime:"
0000000000119010	mov	x0, x20
0000000000119014	bl	_objc_msgSend$width
0000000000119018	mov	x23, x0
000000000011901c	mov	x0, x20
0000000000119020	bl	_objc_msgSend$height
0000000000119024	mov	x26, x0
0000000000119028	str	w24, [sp, #0x2c]
000000000011902c	mov	x0, x19
0000000000119030	bl	_objc_msgSend$width
0000000000119034	cmn	x0, #0x3
0000000000119038	movi.2d	v10, #0000000000000000
000000000011903c	fmov	d12, #1.00000000
0000000000119040	fcsel	d0, d12, d10, hi
0000000000119044	str	d0, [sp, #0x20]
0000000000119048	mov	x0, x19
000000000011904c	bl	_objc_msgSend$height
0000000000119050	cmn	x0, #0x3
0000000000119054	fcsel	d0, d12, d10, hi
0000000000119058	str	d0, [sp, #0x18]
000000000011905c	mov	x0, x19
0000000000119060	bl	_objc_msgSend$width
0000000000119064	str	x0, [sp, #0x10]
0000000000119068	mov	x0, x19
000000000011906c	bl	_objc_msgSend$height
0000000000119070	str	x0, [sp, #0x8]
0000000000119074	fabs	d11, d11
0000000000119078	ldr	x8, [sp, #0x38]
000000000011907c	ucvtf	d0, x8
0000000000119080	ucvtf	d1, x25
0000000000119084	ucvtf	d2, x27
0000000000119088	ucvtf	d3, x28
000000000011908c	fdiv	d0, d0, d13
0000000000119090	fdiv	d1, d1, d11
0000000000119094	str	d13, [sp, #0x38]
0000000000119098	fdiv	d2, d2, d13
000000000011909c	fdiv	d3, d3, d11
00000000001190a0	fcvtzs	w25, d0
00000000001190a4	fcvtzs	w24, d1
00000000001190a8	fcvtzs	w8, d2
00000000001190ac	fcvtzs	w9, d3
00000000001190b0	sub	w10, w25, w8
00000000001190b4	sub	w11, w24, w9
00000000001190b8	add	w10, w10, w10, lsr #31
00000000001190bc	add	w11, w11, w11, lsr #31
00000000001190c0	asr	w10, w10, #1
00000000001190c4	asr	w11, w11, #1
00000000001190c8	scvtf	d0, w8, #0x1
00000000001190cc	scvtf	d1, w9, #0x1
00000000001190d0	scvtf	d2, w10
00000000001190d4	scvtf	d3, w11
00000000001190d8	fadd	d15, d0, d2
00000000001190dc	fadd	d12, d1, d3
00000000001190e0	fmul	d0, d14, d9
00000000001190e4	fadd	d9, d15, d0
00000000001190e8	fmul	d0, d14, d8
00000000001190ec	fadd	d8, d12, d0
00000000001190f0	ucvtf	d14, x23
00000000001190f4	ucvtf	d13, x26
00000000001190f8	fcvt	s0, d14
00000000001190fc	fcvt	s1, d13
0000000000119100	ldr	d2, [sp, #0x160]
0000000000119104	fcvt	s2, d2
0000000000119108	fcvt	s3, d9
000000000011910c	fcvt	s4, d8
0000000000119110	fcvt	s5, d15
0000000000119114	fcvt	s6, d12
0000000000119118	fsub	s5, s5, s3
000000000011911c	fsub	s6, s6, s4
0000000000119120	movi.2d	v7, #0000000000000000
0000000000119124	fadd	s16, s0, s7
0000000000119128	fmov	s17, #0.50000000
000000000011912c	fmul	s16, s16, s17
0000000000119130	fadd	s18, s1, s7
0000000000119134	fmul	s17, s18, s17
0000000000119138	fmul	s18, s5, s7
000000000011913c	fadd	s18, s18, s3
0000000000119140	fmul	s19, s6, s7
0000000000119144	fadd	s19, s19, s4
0000000000119148	fsub	s20, s7, s16
000000000011914c	fmul	s21, s20, s2
0000000000119150	fadd	s21, s18, s21
0000000000119154	fsub	s0, s0, s16
0000000000119158	fmul	s16, s0, s2
000000000011915c	fadd	s16, s18, s16
0000000000119160	fsub	s1, s1, s17
0000000000119164	fmul	s18, s1, s2
0000000000119168	fadd	s18, s19, s18
000000000011916c	fsub	s7, s7, s17
0000000000119170	fmul	s2, s7, s2
0000000000119174	fadd	s2, s19, s2
0000000000119178	fadd	s3, s5, s3
000000000011917c	fadd	s4, s6, s4
0000000000119180	fadd	s5, s3, s20
0000000000119184	fadd	s0, s3, s0
0000000000119188	fadd	s1, s4, s1
000000000011918c	fadd	s3, s4, s7
0000000000119190	fsub	s4, s5, s21
0000000000119194	fsub	s0, s0, s16
0000000000119198	fsub	s1, s1, s18
000000000011919c	fsub	s2, s3, s2
00000000001191a0	fmul	s3, s4, s4
00000000001191a4	fmul	s1, s1, s1
00000000001191a8	fadd	s4, s3, s1
00000000001191ac	fsqrt	s4, s4
00000000001191b0	fmul	s0, s0, s0
00000000001191b4	fadd	s1, s0, s1
00000000001191b8	fsqrt	s1, s1
00000000001191bc	fmul	s2, s2, s2
00000000001191c0	fadd	s0, s0, s2
00000000001191c4	fsqrt	s0, s0
00000000001191c8	fadd	s2, s3, s2
00000000001191cc	fsqrt	s2, s2
00000000001191d0	fcmp	s1, s4
00000000001191d4	fcsel	s1, s1, s4, gt
00000000001191d8	fcmp	s0, s1
00000000001191dc	fcsel	s0, s0, s1, gt
00000000001191e0	fcmp	s2, s0
00000000001191e4	fcsel	s10, s2, s0, gt
00000000001191e8	ldr	x2, [x22]
00000000001191ec	mov	x0, x21
00000000001191f0	bl	"_objc_msgSend$getRenderMode:"
00000000001191f4	mov	x8, x0
00000000001191f8	mov	w0, #0x0
00000000001191fc	fcmp	s10, #0.0
0000000000119200	b.ne	0x119298
0000000000119204	cbz	w8, 0x119250
0000000000119208	ldr	x8, [sp, #0x30]
000000000011920c	cmp	w8, #0x3
0000000000119210	b.ne	0x119250
0000000000119214	cbz	x20, 0x1193e0
0000000000119218	add	x8, sp, #0x40
000000000011921c	mov	x0, x20
0000000000119220	bl	_objc_msgSend$heliumRef
0000000000119224	b	0x1193e4
0000000000119228	str	xzr, [sp, #0x250]
000000000011922c	add	x2, sp, #0x250
0000000000119230	mov	x0, x19
0000000000119234	bl	"_objc_msgSend$setHeliumRef:"
0000000000119238	ldr	x0, [sp, #0x250]
000000000011923c	cbz	x0, 0x11924c
0000000000119240	ldr	x8, [x0]
0000000000119244	ldr	x8, [x8, #0x18]
0000000000119248	blr	x8
000000000011924c	mov	w0, #0x1
0000000000119250	ldur	x8, [x29, #-0xa0]
0000000000119254	adrp	x9, 624 ; 0x389000
0000000000119258	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
000000000011925c	ldr	x9, [x9]
0000000000119260	cmp	x9, x8
0000000000119264	b.ne	0x119408
0000000000119268	add	sp, sp, #0x660
000000000011926c	ldp	x29, x30, [sp, #0x90]
0000000000119270	ldp	x20, x19, [sp, #0x80]
0000000000119274	ldp	x22, x21, [sp, #0x70]
0000000000119278	ldp	x24, x23, [sp, #0x60]
000000000011927c	ldp	x26, x25, [sp, #0x50]
0000000000119280	ldp	x28, x27, [sp, #0x40]
0000000000119284	ldp	d9, d8, [sp, #0x30]
0000000000119288	ldp	d11, d10, [sp, #0x20]
000000000011928c	ldp	d13, d12, [sp, #0x10]
0000000000119290	ldp	d15, d14, [sp], #0xa0
0000000000119294	ret
0000000000119298	ldr	x9, [x22, #0x8]
000000000011929c	cmp	x9, #0x2
00000000001192a0	fmov	s0, #1.00000000
00000000001192a4	fmov	s1, #2.00000000
00000000001192a8	fcsel	s0, s1, s0, eq
00000000001192ac	fmul	s0, s10, s0
00000000001192b0	fcvtps	w9, s0
00000000001192b4	ldr	d1, [sp, #0x168]
00000000001192b8	scvtf	d2, w9
00000000001192bc	mov	x10, #-0x3fa7000000000000
00000000001192c0	fmov	d3, x10
00000000001192c4	fdiv	d3, d1, d3
00000000001192c8	fmul	d3, d3, d2
00000000001192cc	fcvtms	w10, d3
00000000001192d0	mvn	w10, w10
00000000001192d4	add	w10, w10, w9
00000000001192d8	mov	x11, #0x4059000000000000
00000000001192dc	fmov	d3, x11
00000000001192e0	sub	w11, w9, #0x1
00000000001192e4	fdiv	d3, d1, d3
00000000001192e8	fmul	d2, d3, d2
00000000001192ec	fcmp	d1, #0.0
00000000001192f0	csel	w10, w10, w11, le
00000000001192f4	fcvtms	w11, d2
00000000001192f8	csel	w11, wzr, w11, le
00000000001192fc	cbz	w8, 0x119250
0000000000119300	ldr	x8, [sp, #0x30]
0000000000119304	cmp	w8, #0x3
0000000000119308	b.ne	0x119250
000000000011930c	ldr	x8, [sp, #0x10]
0000000000119310	lsr	x8, x8, #1
0000000000119314	ucvtf	d1, x8
0000000000119318	ldr	x8, [sp, #0x8]
000000000011931c	lsr	x8, x8, #1
0000000000119320	ucvtf	d2, x8
0000000000119324	frintp	s0, s0
0000000000119328	ldp	d7, d3, [sp, #0x158]
000000000011932c	fmov	d4, #1.00000000
0000000000119330	fsub	d4, d4, d3
0000000000119334	fcvt	s4, d4
0000000000119338	fcvtzs	s0, s0
000000000011933c	scvtf	s0, s0
0000000000119340	fdiv	s4, s4, s0
0000000000119344	ldp	d6, d5, [sp, #0x148]
0000000000119348	fsub	d5, d5, d6
000000000011934c	fcvt	s5, d5
0000000000119350	scvtf	d16, w25
0000000000119354	ldp	q17, q18, [x22]
0000000000119358	stp	q17, q18, [sp, #0x110]
000000000011935c	ldr	q17, [x22, #0x20]
0000000000119360	str	q17, [sp, #0x130]
0000000000119364	scvtf	d17, w24
0000000000119368	stp	w10, w11, [sp, #0x40]
000000000011936c	str	d3, [sp, #0x48]
0000000000119370	str	s4, [sp, #0x50]
0000000000119374	ldr	d3, [sp, #0x38]
0000000000119378	stp	d3, d11, [sp, #0x58]
000000000011937c	str	w9, [sp, #0x68]
0000000000119380	stp	d7, d6, [sp, #0x70]
0000000000119384	fdiv	s0, s5, s0
0000000000119388	str	s0, [sp, #0x80]
000000000011938c	ldr	w8, [sp, #0x2c]
0000000000119390	strb	w8, [sp, #0x84]
0000000000119394	str	xzr, [sp, #0x88]
0000000000119398	stp	d14, d13, [sp, #0x90]
000000000011939c	str	xzr, [sp, #0xa0]
00000000001193a0	stp	d9, d8, [sp, #0xa8]
00000000001193a4	stp	d15, d12, [sp, #0xb8]
00000000001193a8	ldp	d0, d4, [sp, #0x18]
00000000001193ac	stp	d4, d1, [sp, #0xc8]
00000000001193b0	stp	d0, d2, [sp, #0xd8]
00000000001193b4	stp	d16, d17, [sp, #0xe8]
00000000001193b8	add	x8, sp, #0x250
00000000001193bc	str	x8, [sp, #0xf8]
00000000001193c0	stp	d3, d11, [sp, #0x100]
00000000001193c4	add	x4, sp, #0x110
00000000001193c8	add	x5, sp, #0x40
00000000001193cc	mov	x0, x21
00000000001193d0	mov	x2, x19
00000000001193d4	mov	x3, x20
00000000001193d8	bl	"_objc_msgSend$renderHeliumWithOutput:withInput:withInfo:withData:"
00000000001193dc	b	0x11924c
00000000001193e0	str	xzr, [sp, #0x40]
00000000001193e4	add	x2, sp, #0x40
00000000001193e8	mov	x0, x19
00000000001193ec	bl	"_objc_msgSend$setHeliumRef:"
00000000001193f0	ldr	x0, [sp, #0x40]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : AngleSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm6 : FloatSlider
    parm7 : FloatSlider
    parm8 : PopupMenu
    parm9 : Gradient
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm1 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)
    - parm7 (float)
    - parm8 (int)

```
