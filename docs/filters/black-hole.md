# Black Hole

- **PAE class:** `Black Hole`
- **Plugin UUID:** `1A32EFEF-6687-401B-A078-300A7AE8F621`
- **Node names in corpus:** Black Hole (9), Black Hole In (2), infoOSC 2 (1), reflectX (1), Black Hole 1 (1), Black Hole 2 (1)
- **Corpus usage:** 11 files, 17 instances

## What it does

Black Hole warps the image radially as if pulled toward a gravitational point at Center: it displaces sample positions away from the center as a function of distance so the picture appears sucked inward, composited over the original. Amount is the pull strength (FCP UI: "Pulls an object toward a point"). Fully reverse-engineered: it is a MIP pyramid of radial-warp passes whose level count = max(1, round(log2(Amount/8))).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 150 | 0 .. 1000 | Pull strength toward the center, 0-1000 (default 150). Drives the number of warp pyramid levels. *(keyframed in 6 instances)* |
| Center | point2D | - | - | The gravitational center (X,Y) in normalized frame coordinates (default 0.5,0.5). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/blackhole.ts`](../../engine/src/compositor/filters/blackhole.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcBlackHole`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBlackHole` → [`HgcBlackHole.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBlackHole.metal)

```metal
//Metal1.0     
//LEN=00000006fd
[[ visible ]] FragmentOut HgcBlackHole_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 color1,
    float4 texCoord0)
{
    const float4 c0 = float4(1.000000000, 2.000000000, 9.999999975e-07, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[4]);
    r0.z = 1.00000f / r0.x;
    r0.y = dot(texCoord0, hg_Params[3]);
    r0.x = dot(texCoord0, hg_Params[2]);
    r0.xy = r0.xy*r0.zz + -hg_Params[0].xy;
    r1.x = dot(r0.xy, r0.xy);
    r0.z = fmax(r1.x, c0.z);
    r0.z = rsqrt(r0.z);
    r1.z = r0.z*r1.x;
    r0.w = clamp(r1.z/hg_Params[1].y, 0.00000f, 1.00000f);
    r0.w = r0.w*hg_Params[1].x + r1.z;
    r0.xy = r0.zz*r0.xy;
    r0.xy = r0.xy*r0.ww + hg_Params[0].xy;
    r0.w = c0.x;
    r1.x = dot(r0.xyw, hg_Params[7].xyz);
    r1.w = 1.00000f / r1.x;
    r1.y = dot(r0.xyw, hg_Params[6].xyz);
    r1.x = dot(r0.xyw, hg_Params[5].xyz);
    r0.xy = r1.xy*r1.ww;
    r0.xy = r0.xy*hg_Params[1].zz;
    r1.xy = float2(hg_Params[9].xy < r0.xy);
    r0.zw = float2(r0.xy < hg_Params[8].xy);
    r0.z = fmax(r0.z, r0.w);
    r1.x = fmax(r1.x, r1.y);
    r0.z = fmax(r0.z, r1.x);
    r0.xy = fmax(r0.xy, hg_Params[8].xy);
    r0.w = r1.z + hg_Params[1].x;
    r0.w = r0.w*hg_Params[1].z;
    r1.xy = fmin(r0.xy, hg_Params[9].xy);
    r0.x = r1.z/r0.w;
    r0.x = clamp(r0.x*c0.y + -c0.x, 0.00000f, 1.00000f);
    r2.x = r0.x*hg_Params[1].w + -hg_Params[1].w;
    r1.xy = r1.xy + hg_Params[10].xy;
    r1.xy = r1.xy*hg_Params[10].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    r1 = select(r1, c0.wwww, -r0.zzzz < 0.00000f);
    r0 = color1;
    r2.x = r2.x + c0.x;
    output.color0 = mix(r0, r1, r2.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEBlackHole canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBlackHole`

```asm
0000000000088330	mov	w4, #0x1
0000000000088334	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
0000000000088338	mov	x8, #0xc00000000000
000000000008833c	movk	x8, #0x4062, lsl #48
0000000000088340	stur	x8, [x29, #-0x98]
0000000000088344	ldr	x4, [x23]
0000000000088348	sub	x2, x29, #0x98
000000000008834c	mov	x0, x21
0000000000088350	mov	w3, #0x2
0000000000088354	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000088358	ldur	d0, [x29, #-0x98]
000000000008835c	fmov	d1, #0.12500000
0000000000088360	fmul	d0, d0, d1
0000000000088364	bl	0x252218 ; symbol stub for: _log2
0000000000088368	fcvtas	w8, d0
000000000008836c	cmp	w8, #0x1
0000000000088370	csinc	w21, w8, wzr, gt
0000000000088374	ldr	x2, [x23]
0000000000088378	mov	x0, x22
000000000008837c	bl	"_objc_msgSend$getRenderMode:"
0000000000088380	mov	x23, x0
0000000000088384	add	x8, sp, #0x178
0000000000088388	mov	x0, x22
000000000008838c	mov	x2, x20
0000000000088390	bl	"_objc_msgSend$getPixelTransformForImage:"
0000000000088394	add	x8, sp, #0xf8
0000000000088398	mov	x0, x22
000000000008839c	mov	x2, x20
00000000000883a0	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000883a4	add	x8, sp, #0x58
00000000000883a8	sub	x2, x29, #0x90
00000000000883ac	mov	x0, x22
00000000000883b0	mov	x3, x20
00000000000883b4	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000883b8	ldur	q0, [sp, #0x58]
00000000000883bc	str	q0, [x24]
00000000000883c0	cbz	w23, 0x883e8
00000000000883c4	mov	x0, x20
00000000000883c8	bl	_objc_msgSend$imageType
00000000000883cc	cmp	x0, #0x3
00000000000883d0	b.ne	0x883e8
00000000000883d4	cbz	x20, 0x883f0
00000000000883d8	add	x8, sp, #0xf0
00000000000883dc	mov	x0, x20
00000000000883e0	bl	_objc_msgSend$heliumRef
00000000000883e4	b	0x883f4
00000000000883e8	mov	w0, #0x0
00000000000883ec	b	0x88808
00000000000883f0	str	xzr, [sp, #0xf0]
00000000000883f4	stp	xzr, xzr, [sp, #0xe0]
00000000000883f8	adrp	x22, 775 ; 0x38f000
00000000000883fc	add	x22, x22, #0xf98
0000000000088400	str	x22, [sp, #0xd8]
0000000000088404	add	x0, sp, #0xd8
0000000000088408	mov	w1, #0x1
000000000008840c	mov	w2, #0x3
0000000000088410	bl	__ZN7PCArrayI5HGRefI6HGNodeE14PCArray_TraitsIS2_EE6resizeEii
0000000000088414	ldr	w8, [sp, #0xe0]
0000000000088418	lsl	w9, w21, #1
000000000008841c	cmp	w21, w8
0000000000088420	csinc	w2, w8, w9, le
0000000000088424	add	x0, sp, #0xd8
0000000000088428	mov	x1, x21
000000000008842c	bl	__ZN7PCArrayI5HGRefI6HGNodeE14PCArray_TraitsIS2_EE6resizeEii
0000000000088430	ldr	w8, [sp, #0xe4]
0000000000088434	cmp	w8, #0x0
0000000000088438	b.gt	0x88440
000000000008843c	bl	0x251090 ; symbol stub for: __ZN12PCArray_base8badIndexEv
0000000000088440	ldp	x20, x0, [sp, #0xe8]
0000000000088444	ldr	x8, [x20]
0000000000088448	cmp	x8, x0
000000000008844c	b.eq	0x8847c
0000000000088450	cbz	x8, 0x88468
0000000000088454	ldr	x9, [x8]
0000000000088458	ldr	x9, [x9, #0x18]
000000000008845c	mov	x0, x8
0000000000088460	blr	x9
0000000000088464	ldr	x0, [sp, #0xf0]
0000000000088468	str	x0, [x20]
000000000008846c	cbz	x0, 0x8847c
0000000000088470	ldr	x8, [x0]
0000000000088474	ldr	x8, [x8, #0x10]
0000000000088478	blr	x8
000000000008847c	mov	x8, #0x3fe0000000000000
0000000000088480	str	x8, [sp, #0x58]
0000000000088484	add	x9, sp, #0x58
0000000000088488	movi.2d	v0, #0000000000000000
000000000008848c	stp	q0, q0, [sp, #0x60]
0000000000088490	str	x8, [sp, #0x80]
0000000000088494	stur	q0, [sp, #0x88]
0000000000088498	stur	q0, [sp, #0x98]
000000000008849c	stur	q0, [x9, #0x58]
00000000000884a0	stur	q0, [x9, #0x68]
00000000000884a4	mov	x9, #0x3ff0000000000000
00000000000884a8	str	x8, [sp, #0xa8]
00000000000884ac	str	x9, [sp, #0xd0]
00000000000884b0	ldr	w8, [sp, #0xe4]
00000000000884b4	cmp	w8, #0x2
00000000000884b8	b.lt	0x88544
00000000000884bc	mov	w20, #0x1
00000000000884c0	ldr	x8, [sp, #0xe8]
00000000000884c4	add	x8, x8, x20, lsl #3
00000000000884c8	sub	x1, x8, #0x8
00000000000884cc	add	x8, sp, #0x30
00000000000884d0	add	x0, sp, #0x58
00000000000884d4	mov	w2, #0x1
00000000000884d8	mov	w3, #0x0
00000000000884dc	bl	0x251c24 ; symbol stub for: __ZN9FxSupport15makeHeliumXFormERK14PCMatrix44TmplIdERK5HGRefI6HGNodeEbb
00000000000884e0	ldrsw	x8, [sp, #0xe4]
00000000000884e4	cmp	x20, x8
00000000000884e8	b.lt	0x884f0
00000000000884ec	bl	0x251090 ; symbol stub for: __ZN12PCArray_base8badIndexEv
00000000000884f0	ldr	x21, [sp, #0xe8]
00000000000884f4	ldr	x8, [x21, x20, lsl #3]
00000000000884f8	ldr	x0, [sp, #0x30]
00000000000884fc	cmp	x8, x0
0000000000088500	b.eq	0x88524
0000000000088504	cbz	x8, 0x8851c
0000000000088508	ldr	x9, [x8]
000000000008850c	ldr	x9, [x9, #0x18]
0000000000088510	mov	x0, x8
0000000000088514	blr	x9
0000000000088518	ldr	x0, [sp, #0x30]
000000000008851c	str	x0, [x21, x20, lsl #3]
0000000000088520	b	0x88534
0000000000088524	cbz	x8, 0x88534
0000000000088528	ldr	x8, [x0]
000000000008852c	ldr	x8, [x8, #0x18]
0000000000088530	blr	x8
0000000000088534	add	x20, x20, #0x1
0000000000088538	ldrsw	x8, [sp, #0xe4]
000000000008853c	cmp	x20, x8
0000000000088540	b.lt	0x884c0
0000000000088544	mov	w0, #0x1a0
0000000000088548	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000008854c	mov	x20, x0
0000000000088550	bl	0x25181c ; symbol stub for: __ZN6HGNodeC1Ev
0000000000088554	str	x20, [sp, #0x50]
0000000000088558	ldr	w23, [sp, #0xe4]
000000000008855c	mov	w8, #-0x1
0000000000088560	add	x25, x23, x8
0000000000088564	mov	w26, #0x1
0000000000088568	sub	w21, w26, w23
000000000008856c	movi.2d	v8, #0000000000000000
0000000000088570	fmov	d9, #2.00000000
0000000000088574	fmov	d10, #-1.00000000
0000000000088578	fmov	s11, #1.00000000
000000000008857c	mov	x8, #0xaf48
0000000000088580	movk	x8, #0x9abc, lsl #16
0000000000088584	movk	x8, #0xd7f2, lsl #32
0000000000088588	movk	x8, #0x3e7a, lsl #48
000000000008858c	dup.2d	v0, x8
0000000000088590	str	q0, [sp]
0000000000088594	cmp	w23, #0x1
0000000000088598	b.lt	0x887a8
000000000008859c	mov	w0, #0x2a0
00000000000885a0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000885a4	mov	x20, x0
00000000000885a8	bl	__ZN10HBlackHoleC2Ev
00000000000885ac	ldr	w8, [sp, #0xe4]
00000000000885b0	cmp	w8, w23
00000000000885b4	b.ge	0x885bc
00000000000885b8	bl	0x251090 ; symbol stub for: __ZN12PCArray_base8badIndexEv
00000000000885bc	ldr	x8, [sp, #0xe8]
00000000000885c0	ldr	x2, [x8, w25, uxtw #3]
00000000000885c4	ldr	x8, [x20]
00000000000885c8	ldr	x8, [x8, #0x78]
00000000000885cc	mov	x0, x20
00000000000885d0	mov	w1, #0x0
00000000000885d4	blr	x8
00000000000885d8	ldr	x2, [sp, #0x50]
00000000000885dc	ldr	x8, [x20]
00000000000885e0	ldr	x8, [x8, #0x78]
00000000000885e4	mov	x0, x20
00000000000885e8	mov	w1, #0x1
00000000000885ec	blr	x8
00000000000885f0	ldr	x8, [x20]
00000000000885f4	ldr	x8, [x8, #0x230]
00000000000885f8	add	x1, sp, #0x178
00000000000885fc	mov	x0, x20
0000000000088600	blr	x8
0000000000088604	ldr	x8, [x20]
0000000000088608	ldr	x8, [x8, #0x238]
000000000008860c	add	x1, sp, #0xf8
0000000000088610	mov	x0, x20
0000000000088614	blr	x8
0000000000088618	ldp	d0, d1, [x29, #-0x90]
000000000008861c	fcvt	s0, d0
0000000000088620	fcvt	s1, d1
0000000000088624	ldr	x8, [x20]
0000000000088628	ldr	x8, [x8, #0x60]
000000000008862c	movi.2d	v2, #0000000000000000
0000000000088630	movi.2d	v3, #0000000000000000
0000000000088634	mov	x0, x20
0000000000088638	mov	w1, #0x0
000000000008863c	blr	x8
0000000000088640	fmov	d0, #1.00000000
0000000000088644	mov	x0, x21
0000000000088648	bl	0x252200 ; symbol stub for: _ldexp
000000000008864c	ldur	d1, [x29, #-0x98]
0000000000088650	fdiv	d2, d9, d0
0000000000088654	fadd	d2, d2, d10
0000000000088658	fdiv	d2, d1, d2
000000000008865c	tst	w26, #0x1
0000000000088660	fcsel	s3, s8, s11, ne
0000000000088664	fcvt	s4, d1
0000000000088668	fcvt	s1, d2
000000000008866c	fcsel	s1, s8, s1, ne
0000000000088670	fcvt	s2, d0
0000000000088674	ldr	x8, [x20]
0000000000088678	ldr	x8, [x8, #0x60]
000000000008867c	mov	x0, x20
0000000000088680	mov	w1, #0x1
0000000000088684	mov.16b	v0, v4
0000000000088688	blr	x8
000000000008868c	ldr	x0, [sp, #0x50]
0000000000088690	cmp	x0, x20
0000000000088694	b.eq	0x886bc
0000000000088698	cbz	x0, 0x886a8
000000000008869c	ldr	x8, [x0]
00000000000886a0	ldr	x8, [x8, #0x18]
00000000000886a4	blr	x8
00000000000886a8	str	x20, [sp, #0x50]
00000000000886ac	ldr	x8, [x20]
00000000000886b0	ldr	x8, [x8, #0x10]
00000000000886b4	mov	x0, x20
00000000000886b8	blr	x8
00000000000886bc	cmp	x23, #0x3
00000000000886c0	b.lo	0x88784
00000000000886c4	ldur	d12, [x29, #-0x98]
00000000000886c8	sub	w8, w23, #0x2
00000000000886cc	ucvtf	d0, w8
00000000000886d0	bl	0x252188 ; symbol stub for: _exp2
00000000000886d4	fadd	d0, d0, d10
00000000000886d8	fdiv	d0, d12, d0
00000000000886dc	fadd	d1, d0, d0
00000000000886e0	stp	d1, d1, [sp, #0x40]
00000000000886e4	ldr	q1, [x24]
00000000000886e8	dup.2d	v0, v0[0]
00000000000886ec	fsub.2d	v0, v1, v0
00000000000886f0	str	q0, [sp, #0x30]
00000000000886f4	add	x0, sp, #0x178
00000000000886f8	add	x1, sp, #0x30
00000000000886fc	add	x2, sp, #0x30
0000000000088700	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
0000000000088704	ldp	q0, q1, [sp, #0x30]
0000000000088708	ldr	q2, [sp]
000000000008870c	fadd.2d	v2, v0, v2
0000000000088710	frintm.2d	v2, v2
0000000000088714	fcvtzs.2d	v2, v2
0000000000088718	xtn.2s	v2, v2
000000000008871c	fadd.2d	v0, v0, v1
0000000000088720	frintp.2d	v0, v0
0000000000088724	fcvtzs.2d	v0, v0
0000000000088728	xtn.2s	v0, v0
000000000008872c	sub.2s	v0, v0, v2
0000000000088730	stp	d2, d0, [sp, #0x18]
0000000000088734	add	x8, sp, #0x28
0000000000088738	add	x0, sp, #0x18
000000000008873c	add	x1, sp, #0x50
0000000000088740	bl	0x251c00 ; symbol stub for: __ZN9FxSupport14makeHeliumCropERK6PCRectIiERK5HGRefI6HGNodeE
0000000000088744	ldr	x8, [sp, #0x50]
0000000000088748	ldr	x0, [sp, #0x28]
000000000008874c	cmp	x8, x0
0000000000088750	b.eq	0x88774
0000000000088754	cbz	x8, 0x8876c
0000000000088758	ldr	x9, [x8]
000000000008875c	ldr	x9, [x9, #0x18]
0000000000088760	mov	x0, x8
0000000000088764	blr	x9
0000000000088768	ldr	x0, [sp, #0x28]
000000000008876c	str	x0, [sp, #0x50]
0000000000088770	b	0x88784
0000000000088774	cbz	x8, 0x88784
0000000000088778	ldr	x8, [x0]
000000000008877c	ldr	x8, [x8, #0x18]
0000000000088780	blr	x8
0000000000088784	ldr	x8, [x20]
0000000000088788	ldr	x8, [x8, #0x18]
000000000008878c	sub	x23, x23, #0x1
0000000000088790	sub	x25, x25, #0x1
0000000000088794	add	w21, w21, #0x1
0000000000088798	mov	x0, x20
000000000008879c	blr	x8
00000000000887a0	mov	w26, #0x0
00000000000887a4	b	0x88594
00000000000887a8	add	x2, sp, #0x50
00000000000887ac	mov	x0, x19
00000000000887b0	bl	"_objc_msgSend$setHeliumRef:"
00000000000887b4	ldr	x0, [sp, #0x50]
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
    slot 1  <-  parm2 (float)
```
