# Gloom

- **PAE class:** `Gloom`
- **Plugin UUID:** `50387134-338C-42A2-8078-7DF9D7DB36EE`
- **Node names in corpus:** Gloom (8), Gloom copy (3)
- **Corpus usage:** 9 files, 11 instances

## What it does

Gloom is an inverse-bloom / dark-glow: it spreads the dark regions of the image outward (blurring shadows over highlights) for a murky, gloomy diffusion, the tonal opposite of Bloom. Radius sets the spread and Amount the strength.

> **Note.** Not implemented; description is the standard Apple Motion "Gloom" dark-diffusion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 10 | 13 .. 100 | Spread radius of the dark diffusion, ~13-100 (default 10). |
| Amount | float | 1 | 1 .. 1.16 | Strength of the gloom, ~1-1.16 (default 1). |
| Mix | float | 1 | 0.7101 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Prescale Input`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcGloom`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcGloom` → [`HgcGloom.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcGloom.metal)

```metal
//Metal1.0     
//LEN=00000001e8
[[ visible ]] FragmentOut HgcGloom_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = fmin(r0, r1);
    r0 = mix(r0, r1, hg_Params[0]);
    r1.xyz = r0.xyz;
    r1.w = c0.w;
    output.color0 = select(r0, r1, r0.wwww < 0.00000f);
    return output;
}
```

### CPU parameter wiring — `-[PAEGloom canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEGloom`

```asm
00000000000d435c	mov	w3, #0x1
00000000000d4360	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000d4364	ldur	d0, [x29, #-0x68]
00000000000d4368	fcmp	d0, #0.0
00000000000d436c	b.ne	0xd438c
00000000000d4370	cbz	x20, 0xd444c
00000000000d4374	add	x8, sp, #0xc0
00000000000d4378	mov	x0, x20
00000000000d437c	bl	_objc_msgSend$heliumRef
00000000000d4380	b	0xd4450
00000000000d4384	mov	w0, #0x0
00000000000d4388	b	0xd4884
00000000000d438c	cbnz	w22, 0xd43b8
00000000000d4390	mov	x8, #0x4059000000000000
00000000000d4394	fmov	d1, x8
00000000000d4398	fdiv	d0, d0, d1
00000000000d439c	adrp	x8, 406 ; 0x26a000
00000000000d43a0	ldr	d1, [x8, #0xd70]
00000000000d43a4	bl	0x252398 ; symbol stub for: _pow
00000000000d43a8	adrp	x8, 406 ; 0x26a000
00000000000d43ac	ldr	d1, [x8, #0xd78]
00000000000d43b0	fmul	d0, d0, d1
00000000000d43b4	stur	d0, [x29, #-0x68]
00000000000d43b8	ldr	x4, [x23]
00000000000d43bc	sub	x2, x29, #0x71
00000000000d43c0	mov	x0, x24
00000000000d43c4	mov	w3, #0x3
00000000000d43c8	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d43cc	ldr	x4, [x23]
00000000000d43d0	sub	x2, x29, #0x70
00000000000d43d4	mov	x0, x24
00000000000d43d8	mov	w3, #0x2
00000000000d43dc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000d43e0	sturb	wzr, [x29, #-0x72]
00000000000d43e4	ldr	x4, [x23]
00000000000d43e8	sub	x2, x29, #0x72
00000000000d43ec	mov	x0, x24
00000000000d43f0	mov	w3, #0x4
00000000000d43f4	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000d43f8	ldurb	w8, [x29, #-0x72]
00000000000d43fc	eor	w8, w8, #0x1
00000000000d4400	ldurb	w9, [x29, #-0x71]
00000000000d4404	and	w8, w9, w8
00000000000d4408	sturb	w8, [x29, #-0x71]
00000000000d440c	sub	x8, x29, #0x88
00000000000d4410	mov	x0, x21
00000000000d4414	mov	x2, x20
00000000000d4418	bl	"_objc_msgSend$getScaleForImage:"
00000000000d441c	ldp	d9, d8, [x29, #-0x88]
00000000000d4420	cbz	x20, 0xd4474
00000000000d4424	sub	x8, x29, #0x90
00000000000d4428	mov	x0, x20
00000000000d442c	bl	_objc_msgSend$heliumRef
00000000000d4430	ldur	x0, [x29, #-0x90]
00000000000d4434	stur	x0, [x29, #-0x98]
00000000000d4438	cbz	x0, 0xd4478
00000000000d443c	ldr	x8, [x0]
00000000000d4440	ldr	x8, [x8, #0x10]
00000000000d4444	blr	x8
00000000000d4448	b	0xd4478
00000000000d444c	str	xzr, [sp, #0xc0]
00000000000d4450	add	x2, sp, #0xc0
00000000000d4454	mov	x0, x19
00000000000d4458	bl	"_objc_msgSend$setHeliumRef:"
00000000000d445c	ldr	x0, [sp, #0xc0]
00000000000d4460	cbz	x0, 0xd4880
00000000000d4464	ldr	x8, [x0]
00000000000d4468	ldr	x8, [x8, #0x18]
00000000000d446c	blr	x8
00000000000d4470	b	0xd4880
00000000000d4474	stp	xzr, xzr, [x29, #-0x98]
00000000000d4478	add	x8, sp, #0xc0
00000000000d447c	sub	x2, x29, #0x98
00000000000d4480	mov	x0, x21
00000000000d4484	mov	x3, x20
00000000000d4488	mov	x4, x20
00000000000d448c	bl	"_objc_msgSend$smear:fromImage:toImage:"
00000000000d4490	ldur	x8, [x29, #-0x90]
00000000000d4494	ldr	x0, [sp, #0xc0]
00000000000d4498	cmp	x8, x0
00000000000d449c	b.eq	0xd44c4
00000000000d44a0	cbz	x8, 0xd44b8
00000000000d44a4	ldr	x9, [x8]
00000000000d44a8	ldr	x9, [x9, #0x18]
00000000000d44ac	mov	x0, x8
00000000000d44b0	blr	x9
00000000000d44b4	ldr	x0, [sp, #0xc0]
00000000000d44b8	stur	x0, [x29, #-0x90]
00000000000d44bc	str	xzr, [sp, #0xc0]
00000000000d44c0	b	0xd44d4
00000000000d44c4	cbz	x8, 0xd44d4
00000000000d44c8	ldr	x8, [x0]
00000000000d44cc	ldr	x8, [x8, #0x18]
00000000000d44d0	blr	x8
00000000000d44d4	ldur	x0, [x29, #-0x98]
00000000000d44d8	cbz	x0, 0xd44e8
00000000000d44dc	ldr	x8, [x0]
00000000000d44e0	ldr	x8, [x8, #0x18]
00000000000d44e4	blr	x8
00000000000d44e8	ldurb	w8, [x29, #-0x71]
00000000000d44ec	cmp	w8, #0x1
00000000000d44f0	b.ne	0xd4560
00000000000d44f4	ldur	x0, [x29, #-0x90]
00000000000d44f8	stur	x0, [x29, #-0xa0]
00000000000d44fc	cbz	x0, 0xd450c
00000000000d4500	ldr	x8, [x0]
00000000000d4504	ldr	x8, [x8, #0x10]
00000000000d4508	blr	x8
00000000000d450c	ldur	d0, [x29, #-0x68]
00000000000d4510	fcvt	s0, d0
00000000000d4514	fcvt	s1, d9
00000000000d4518	fcvt	s2, d8
00000000000d451c	stp	s1, s2, [sp, #0x40]
00000000000d4520	add	x8, sp, #0xc0
00000000000d4524	sub	x2, x29, #0xa0
00000000000d4528	add	x3, sp, #0x40
00000000000d452c	fmov	s1, #1.50000000
00000000000d4530	fmov	s2, #3.00000000
00000000000d4534	mov	x0, x21
00000000000d4538	bl	"_objc_msgSend$makePrescaledBlurNode:radius:withScale:minInputScale:maxInputScale:"
00000000000d453c	ldr	x21, [sp, #0xc0]
00000000000d4540	cbz	x21, 0xd4548
00000000000d4544	str	xzr, [sp, #0xc0]
00000000000d4548	ldur	x0, [x29, #-0xa0]
00000000000d454c	cbz	x0, 0xd4724
00000000000d4550	ldr	x8, [x0]
00000000000d4554	ldr	x8, [x8, #0x18]
00000000000d4558	blr	x8
00000000000d455c	b	0xd4724
00000000000d4560	ldurb	w8, [x29, #-0x72]
00000000000d4564	cmp	w8, #0x1
00000000000d4568	b.ne	0xd46ac
00000000000d456c	add	x8, sp, #0xc0
00000000000d4570	mov	x0, x21
00000000000d4574	mov	x2, x19
00000000000d4578	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000d457c	add	x8, sp, #0x40
00000000000d4580	mov	x0, x21
00000000000d4584	mov	x2, x19
00000000000d4588	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000d458c	mov	w0, #0x1c0
00000000000d4590	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d4594	mov	x21, x0
00000000000d4598	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
00000000000d459c	adrp	x8, 706 ; 0x396000
00000000000d45a0	add	x8, x8, #0x988
00000000000d45a4	add	x8, x8, #0x10
00000000000d45a8	str	x8, [x21]
00000000000d45ac	stp	xzr, xzr, [x21, #0x198]
00000000000d45b0	str	wzr, [x21, #0x1a8]
00000000000d45b4	stp	xzr, xzr, [x21, #0x1b0]
00000000000d45b8	ldur	d8, [x29, #-0x68]
00000000000d45bc	ldp	d9, d10, [x29, #-0x88]
00000000000d45c0	mov	x23, #0x0
00000000000d45c4	mov	x0, x20
00000000000d45c8	bl	_objc_msgSend$width
00000000000d45cc	mov	x22, x0
00000000000d45d0	ldr	d11, [sp, #0xc0]
00000000000d45d4	mov	x23, #0x0
00000000000d45d8	mov	x0, x20
00000000000d45dc	bl	_objc_msgSend$height
00000000000d45e0	fcvt	s0, d8
00000000000d45e4	fcvt	s1, d9
00000000000d45e8	fcvt	s2, d10
00000000000d45ec	fabs	d3, d11
00000000000d45f0	ucvtf	d4, x22
00000000000d45f4	fmul	d3, d3, d4
00000000000d45f8	fcvtps	w1, d3
00000000000d45fc	ucvtf	d3, x0
00000000000d4600	ldp	q5, q4, [sp, #0xc0]
00000000000d4604	fcvtn	v5.2s, v5.2d
00000000000d4608	fcvtn2	v5.4s, v4.2d
00000000000d460c	str	q5, [sp, #0x30]
00000000000d4610	ldp	q5, q4, [sp, #0xe0]
00000000000d4614	ldr	d6, [sp, #0xe8]
00000000000d4618	fabs	d6, d6
00000000000d461c	fmul	d3, d6, d3
00000000000d4620	fcvtps	w2, d3
00000000000d4624	fcvtn	v3.2s, v5.2d
00000000000d4628	fcvtn2	v3.4s, v4.2d
00000000000d462c	str	q3, [sp, #0x20]
00000000000d4630	ldp	q4, q3, [sp, #0x40]
00000000000d4634	fcvtn	v4.2s, v4.2d
00000000000d4638	fcvtn2	v4.4s, v3.2d
00000000000d463c	str	q4, [sp, #0x10]
00000000000d4640	ldp	q4, q3, [sp, #0x60]
00000000000d4644	fcvtn	v4.2s, v4.2d
00000000000d4648	fcvtn2	v4.4s, v3.2d
00000000000d464c	str	q4, [sp]
00000000000d4650	add	x3, sp, #0x30
00000000000d4654	add	x4, sp, #0x20
00000000000d4658	add	x5, sp, #0x10
00000000000d465c	mov	x6, sp
00000000000d4660	mov	x0, x21
00000000000d4664	bl	__ZN21HEquirectGaussianBlur4initEfffiiRK9PCVector4IfES3_S3_S3_
00000000000d4668	ldur	x2, [x29, #-0x90]
00000000000d466c	ldr	x8, [x21]
00000000000d4670	ldr	x8, [x8, #0x78]
00000000000d4674	mov	x23, #0x0
00000000000d4678	mov	x0, x21
00000000000d467c	mov	w1, #0x0
00000000000d4680	blr	x8
00000000000d4684	ldr	x8, [x21]
00000000000d4688	ldr	x8, [x8, #0x10]
00000000000d468c	mov	x23, x21
00000000000d4690	mov	x0, x21
00000000000d4694	blr	x8
00000000000d4698	ldr	x8, [x21]
00000000000d469c	ldr	x8, [x8, #0x18]
00000000000d46a0	mov	x0, x21
00000000000d46a4	blr	x8
00000000000d46a8	b	0xd4724
00000000000d46ac	mov	w0, #0x1b0
00000000000d46b0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d46b4	mov	x21, x0
00000000000d46b8	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
00000000000d46bc	cmp	w22, #0x0
00000000000d46c0	cset	w1, eq
00000000000d46c4	ldur	d0, [x29, #-0x68]
00000000000d46c8	fcvt	s0, d0
00000000000d46cc	fcvt	s1, d9
00000000000d46d0	fcvt	s2, d8
00000000000d46d4	mov	x0, x21
00000000000d46d8	mov	w2, #0x0
00000000000d46dc	mov	w3, #0x0
00000000000d46e0	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000000d46e4	ldur	x2, [x29, #-0x90]
00000000000d46e8	ldr	x8, [x21]
00000000000d46ec	ldr	x8, [x8, #0x78]
00000000000d46f0	mov	x22, #0x0
00000000000d46f4	mov	x0, x21
00000000000d46f8	mov	w1, #0x0
00000000000d46fc	blr	x8
00000000000d4700	ldr	x8, [x21]
00000000000d4704	ldr	x8, [x8, #0x10]
00000000000d4708	mov	x22, x21
00000000000d470c	mov	x0, x21
00000000000d4710	blr	x8
00000000000d4714	ldr	x8, [x21]
00000000000d4718	ldr	x8, [x8, #0x18]
00000000000d471c	mov	x0, x21
00000000000d4720	blr	x8
00000000000d4724	mov	w0, #0x1a0
00000000000d4728	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d472c	mov	x22, x0
00000000000d4730	bl	__ZN8HgcGloomC2Ev
00000000000d4734	adrp	x8, 706 ; 0x396000
00000000000d4738	add	x8, x8, #0xbe0
00000000000d473c	add	x9, x8, #0x10
00000000000d4740	str	x9, [x22]
00000000000d4744	ldur	d0, [x29, #-0x70]
00000000000d4748	fcvt	s0, d0
00000000000d474c	ldr	x8, [x8, #0x70]
00000000000d4750	mov	x0, x22
00000000000d4754	mov	w1, #0x0
00000000000d4758	mov.16b	v1, v0
00000000000d475c	mov.16b	v2, v0
00000000000d4760	mov.16b	v3, v0
00000000000d4764	blr	x8
00000000000d4768	ldur	x2, [x29, #-0x90]
00000000000d476c	ldr	x8, [x22]
00000000000d4770	ldr	x8, [x8, #0x78]
00000000000d4774	mov	x0, x22
00000000000d4778	mov	w1, #0x0
00000000000d477c	blr	x8
00000000000d4780	ldr	x8, [x22]
00000000000d4784	ldr	x8, [x8, #0x78]
00000000000d4788	mov	x0, x22
00000000000d478c	mov	w1, #0x1
00000000000d4790	mov	x2, x21
00000000000d4794	blr	x8
00000000000d4798	mov	w0, #0x1a0
00000000000d479c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000d47a0	mov	x23, x0
00000000000d47a4	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
00000000000d47a8	ldr	x8, [x23]
00000000000d47ac	ldr	x8, [x8, #0x78]
00000000000d47b0	mov	x0, x23
00000000000d47b4	mov	w1, #0x0
00000000000d47b8	mov	x2, x22
00000000000d47bc	blr	x8
00000000000d47c0	mov	x0, x20
00000000000d47c4	bl	_objc_msgSend$dod
00000000000d47c8	mov	x2, x1
00000000000d47cc	lsr	x1, x0, #32
00000000000d47d0	lsr	x3, x2, #32
00000000000d47d4	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000d47d8	scvtf	s0, w0
00000000000d47dc	lsr	x8, x0, #32
00000000000d47e0	scvtf	s1, w8
00000000000d47e4	scvtf	s2, w1
00000000000d47e8	lsr	x8, x1, #32
00000000000d47ec	scvtf	s3, w8
00000000000d47f0	ldr	x8, [x23]
00000000000d47f4	ldr	x8, [x8, #0x60]
00000000000d47f8	mov	x0, x23
00000000000d47fc	mov	w1, #0x0
00000000000d4800	blr	x8
00000000000d4804	str	x23, [sp, #0xc0]
00000000000d4808	ldr	x8, [x23]
00000000000d480c	ldr	x8, [x8, #0x10]
00000000000d4810	mov	x0, x23
00000000000d4814	blr	x8
00000000000d4818	add	x2, sp, #0xc0
00000000000d481c	mov	x0, x19
00000000000d4820	bl	"_objc_msgSend$setHeliumRef:"
00000000000d4824	ldr	x0, [sp, #0xc0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : ToggleButton
    parm4 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm3 (bool)
    - parm2 (float)
    - parm4 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
