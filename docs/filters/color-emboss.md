# Color Emboss

- **PAE class:** `Color Emboss`
- **Plugin UUID:** `4C36AECF-53D9-42A8-AD43-9578B00AE01C`
- **Node names in corpus:** Color Emboss (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Color Emboss embosses the image along a chosen Direction, keeping color (unlike a plain gray emboss) so edges pick up a raised, tinted relief. Direction sets the emboss light angle and Relief toggles the raised vs recessed appearance.

> **Note.** Not implemented; description is the standard Apple Motion "Color Emboss" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Direction | float (radians) | 0.01371 | 0 .. 0.5099 | Emboss light direction, radians (default ~0.014). |
| Relief | bool | 1 | 0 .. 0 | Raised vs recessed relief toggle. *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcColorEmboss`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcColorEmboss` → [`HgcColorEmboss.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorEmboss.metal)

```metal
//Metal1.0     
//LEN=0000000575
[[ visible ]] FragmentOut HgcColorEmboss_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5;
    FragmentOut output;

    r0.x = hg_Params[2].x + c0.x;
    r1.x = hg_Params[2].z - c0.x;
    r2.y = hg_Params[2].y + c0.x;
    r3.y = hg_Params[2].w - c0.x;
    r4.xy = texCoord1.xy + hg_Params[0].xy;
    r4.x = fmax(r4.x, r0.x);
    r4.y = fmax(r4.y, r2.y);
    r4.x = fmin(r4.x, r1.x);
    r4.y = fmin(r4.y, r3.y);
    r4.xy = r4.xy + hg_Params[3].xy;
    r4.xy = r4.xy*hg_Params[3].zw;
    r4 = hg_Texture0.sample(hg_Sampler0, r4.xy);
    r4 = r4 / float4(fmax(r4.www, 1.00000e-06f), 1.);
    r5.xy = texCoord1.xy + hg_Params[1].xy;
    r5.x = fmax(r5.x, r0.x);
    r5.y = fmax(r5.y, r2.y);
    r5.x = fmin(r5.x, r1.x);
    r5.y = fmin(r5.y, r3.y);
    r5.xy = r5.xy + hg_Params[3].xy;
    r5.xy = r5.xy*hg_Params[3].zw;
    r5 = hg_Texture0.sample(hg_Sampler0, r5.xy);
    r5 = r5 / float4(fmax(r5.www, 1.00000e-06f), 1.);
    r0 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r4 = r4 - r5;
    r4 = r4 + r0;
    r4.xyz = r4.xyz*r4.www;
    output.color0 = r4;
    return output;
}
```

### CPU parameter wiring — `-[PAEColorEmboss canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEColorEmboss`

```asm
0000000000019108	mov	w3, #0x2
000000000001910c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000019110	ldur	d0, [x29, #-0x90]
0000000000019114	fcmp	d0, #0.0
0000000000019118	b.ne	0x19138
000000000001911c	cbz	x24, 0x19180
0000000000019120	add	x8, sp, #0x28
0000000000019124	mov	x0, x24
0000000000019128	bl	_objc_msgSend$heliumRef
000000000001912c	b	0x19184
0000000000019130	mov	w21, #0x0
0000000000019134	b	0x19484
0000000000019138	cbz	x19, 0x191ac
000000000001913c	add	x8, sp, #0xb0
0000000000019140	mov	x0, x19
0000000000019144	bl	_objc_msgSend$imageInfo
0000000000019148	ldr	x21, [sp, #0xd8]
000000000001914c	ldr	x4, [x22]
0000000000019150	add	x2, sp, #0xa8
0000000000019154	mov	x0, x23
0000000000019158	mov	w3, #0x1
000000000001915c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000019160	cbz	x21, 0x191d0
0000000000019164	ldr	d0, [sp, #0xa8]
0000000000019168	adrp	x8, 591 ; 0x268000
000000000001916c	ldr	d1, [x8, #0xe08]
0000000000019170	fadd	d0, d0, d1
0000000000019174	fneg	d0, d0
0000000000019178	str	d0, [sp, #0xa8]
000000000001917c	b	0x191d0
0000000000019180	str	xzr, [sp, #0x28]
0000000000019184	add	x2, sp, #0x28
0000000000019188	mov	x0, x19
000000000001918c	bl	"_objc_msgSend$setHeliumRef:"
0000000000019190	ldr	x0, [sp, #0x28]
0000000000019194	cbz	x0, 0x191a4
0000000000019198	ldr	x8, [x0]
000000000001919c	ldr	x8, [x8, #0x18]
00000000000191a0	blr	x8
00000000000191a4	mov	w21, #0x1
00000000000191a8	b	0x19484
00000000000191ac	str	xzr, [sp, #0xf0]
00000000000191b0	movi.2d	v0, #0000000000000000
00000000000191b4	stp	q0, q0, [sp, #0xd0]
00000000000191b8	stp	q0, q0, [sp, #0xb0]
00000000000191bc	ldr	x4, [x22]
00000000000191c0	add	x2, sp, #0xa8
00000000000191c4	mov	x0, x23
00000000000191c8	mov	w3, #0x1
00000000000191cc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000191d0	add	x8, sp, #0x28
00000000000191d4	mov	x0, x20
00000000000191d8	mov	x2, x24
00000000000191dc	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000191e0	ldr	d11, [sp, #0x28]
00000000000191e4	ldr	d10, [sp, #0x50]
00000000000191e8	ldur	d12, [x29, #-0x90]
00000000000191ec	ldr	d0, [sp, #0xa8]
00000000000191f0	bl	0x25205c ; symbol stub for: ___sincos_stret
00000000000191f4	mov.16b	v9, v0
00000000000191f8	mov.16b	v8, v1
00000000000191fc	ldr	x2, [x22]
0000000000019200	mov	x0, x20
0000000000019204	bl	"_objc_msgSend$getRenderMode:"
0000000000019208	mov	x20, x0
000000000001920c	mov	x0, x24
0000000000019210	bl	_objc_msgSend$imageType
0000000000019214	cmp	w20, #0x0
0000000000019218	ccmp	x0, #0x3, #0x0, ne
000000000001921c	cset	w21, eq
0000000000019220	b.ne	0x19484
0000000000019224	cbz	x24, 0x19238
0000000000019228	add	x8, sp, #0x20
000000000001922c	mov	x0, x24
0000000000019230	bl	_objc_msgSend$heliumRef
0000000000019234	b	0x1923c
0000000000019238	str	xzr, [sp, #0x20]
000000000001923c	mov	w0, #0x1b0
0000000000019240	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000019244	mov	x20, x0
0000000000019248	bl	__ZN14HgcColorEmbossC2Ev
000000000001924c	fmul	d0, d11, d12
0000000000019250	fmul	d0, d0, d9
0000000000019254	fmul	d1, d10, d12
0000000000019258	fmul	d1, d1, d8
000000000001925c	adrp	x8, 895 ; 0x398000
0000000000019260	add	x8, x8, #0xc70
0000000000019264	add	x9, x8, #0x10
0000000000019268	str	x9, [x20]
000000000001926c	strb	wzr, [x20, #0x1a0]
0000000000019270	fcvt	s8, d0
0000000000019274	fneg	s0, s8
0000000000019278	fcvt	s9, d1
000000000001927c	fneg	s1, s9
0000000000019280	ldr	x8, [x8, #0x70]
0000000000019284	movi.2d	v2, #0000000000000000
0000000000019288	movi.2d	v3, #0000000000000000
000000000001928c	mov	x0, x20
0000000000019290	mov	w1, #0x0
0000000000019294	blr	x8
0000000000019298	ldr	x8, [x20]
000000000001929c	ldr	x8, [x8, #0x60]
00000000000192a0	movi.2d	v2, #0000000000000000
00000000000192a4	movi.2d	v3, #0000000000000000
00000000000192a8	mov	x0, x20
00000000000192ac	mov	w1, #0x1
00000000000192b0	mov.16b	v0, v8
00000000000192b4	mov.16b	v1, v9
00000000000192b8	blr	x8
00000000000192bc	mov	x0, x24
00000000000192c0	bl	_objc_msgSend$width
00000000000192c4	str	x0, [sp, #0x8]
00000000000192c8	mov	x0, x24
00000000000192cc	bl	_objc_msgSend$height
00000000000192d0	mov	x26, x0
00000000000192d4	mov	x0, x24
00000000000192d8	bl	_objc_msgSend$width
00000000000192dc	mov	x27, x0
00000000000192e0	mov	x0, x24
00000000000192e4	bl	_objc_msgSend$width
00000000000192e8	mov	x28, x0
00000000000192ec	mov	x0, x24
00000000000192f0	bl	_objc_msgSend$height
00000000000192f4	mov	x25, x0
00000000000192f8	mov	x0, x24
00000000000192fc	bl	_objc_msgSend$height
0000000000019300	ldr	x8, [sp, #0x8]
0000000000019304	add	w8, w8, w8, lsr #31
0000000000019308	neg	w8, w8, asr #1
000000000001930c	scvtf	s0, w8
0000000000019310	add	w8, w26, w26, lsr #31
0000000000019314	neg	w8, w8, asr #1
0000000000019318	scvtf	s1, w8
000000000001931c	add	w8, w27, w27, lsr #31
0000000000019320	neg	w8, w8, asr #1
0000000000019324	add	x8, x28, w8, sxtw
0000000000019328	ucvtf	s2, x8
000000000001932c	add	w8, w25, w25, lsr #31
0000000000019330	neg	w8, w8, asr #1
0000000000019334	add	x8, x0, w8, sxtw
0000000000019338	ucvtf	s3, x8
000000000001933c	ldr	x8, [x20]
0000000000019340	ldr	x8, [x8, #0x60]
0000000000019344	mov	x0, x20
0000000000019348	mov	w1, #0x2
000000000001934c	blr	x8
0000000000019350	ldr	x2, [sp, #0x20]
0000000000019354	ldr	x8, [x20]
0000000000019358	ldr	x8, [x8, #0x78]
000000000001935c	mov	x0, x20
0000000000019360	mov	w1, #0x0
0000000000019364	blr	x8
0000000000019368	strb	wzr, [sp, #0x1f]
000000000001936c	ldr	x4, [x22]
0000000000019370	add	x2, sp, #0x1f
0000000000019374	mov	x0, x23
0000000000019378	mov	w3, #0x3
000000000001937c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000019380	ldrb	w1, [sp, #0x1f]
0000000000019384	mov	x0, x20
0000000000019388	bl	__ZN19PAEKeyer2DLumaManipD2Ev
000000000001938c	mov	w0, #0x1a0
0000000000019390	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000019394	mov	x22, x0
0000000000019398	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
000000000001939c	mov	x0, x19
00000000000193a0	bl	_objc_msgSend$width
00000000000193a4	mov	x23, x0
00000000000193a8	mov	x0, x19
00000000000193ac	bl	_objc_msgSend$height
00000000000193b0	mov	x24, x0
00000000000193b4	mov	x0, x19
00000000000193b8	bl	_objc_msgSend$width
00000000000193bc	mov	x25, x0
00000000000193c0	mov	x0, x19
00000000000193c4	bl	_objc_msgSend$height
00000000000193c8	add	w8, w23, w23, lsr #31
00000000000193cc	neg	w8, w8, asr #1
00000000000193d0	add	w9, w24, w24, lsr #31
00000000000193d4	neg	w9, w9, asr #1
00000000000193d8	add	w10, w8, w25
00000000000193dc	add	w11, w9, w0
00000000000193e0	scvtf	s0, w8
00000000000193e4	scvtf	s1, w9
00000000000193e8	scvtf	s2, w10
00000000000193ec	scvtf	s3, w11
00000000000193f0	ldr	x8, [x22]
00000000000193f4	ldr	x8, [x8, #0x60]
00000000000193f8	mov	x0, x22
00000000000193fc	mov	w1, #0x0
0000000000019400	blr	x8
0000000000019404	ldr	x8, [x22]
0000000000019408	ldr	x8, [x8, #0x78]
000000000001940c	mov	x0, x22
0000000000019410	mov	w1, #0x0
0000000000019414	mov	x2, x20
0000000000019418	blr	x8
000000000001941c	str	x22, [sp, #0x10]
0000000000019420	ldr	x8, [x22]
0000000000019424	ldr	x8, [x8, #0x10]
0000000000019428	mov	x0, x22
000000000001942c	blr	x8
0000000000019430	add	x2, sp, #0x10
0000000000019434	mov	x0, x19
0000000000019438	bl	"_objc_msgSend$setHeliumRef:"
000000000001943c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : AngleSlider
    parm2 : FloatSlider
    parm3 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm1 (float)
    - parm1 (float)
    - parm3 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
