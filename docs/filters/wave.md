# Wave

- **PAE class:** `Wave`
- **Plugin UUID:** `C67E6AD5-C16B-40CE-AA72-A4F88EDDD990`
- **Node names in corpus:** Wave (40), Wave copy (19), Wave copy 4 (1), Wave  (1)
- **Corpus usage:** 33 files, 61 instances

## What it does

Wave displaces the image along sinusoidal waves: each row (or column, if Vertical) is shifted horizontally by a sine of its position, producing a rippling flag/water wobble. Amplitude sets how far pixels move, Wavelength the distance between wave crests, and Offset scrolls the wave phase over time (animate it for motion).

> **Note.** Not implemented; description is the standard Apple Motion "Wave" distortion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float (pixels) | 10 | 0 .. 468.8 | Peak displacement of the wave in pixels, ~0-470 (default 10). *(keyframed in 3 instances)* |
| Wavelength | float (pixels) | 100 | 4 .. 500 | Distance between wave crests in pixels, ~4-500 (default 100). Smaller = tighter ripples. *(keyframed in 1 instance)* |
| Offset | float (pixels) | 100 | -147 .. 500 | Phase offset that scrolls the wave; animate to make the wave travel. Default 100. *(keyframed in 2 instances)* |
| Vertical | bool | 0 | 0 .. 1 | If on, waves run vertically (columns shifted) instead of horizontally. |
| Repeat Edges | bool | 1 | 0 .. 1 | Clamp/repeat edge pixels instead of showing transparent gaps where the image is pushed away. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the waved result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcWave`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcWave` → [`HgcWave.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcWave.metal)

```metal
//Metal1.0     
//LEN=0000000396
[[ visible ]] FragmentOut HgcWave_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[6].xy;
    r1.xy = texCoord0.xy - hg_Params[2].xy;
    r2.x = hg_Params[1].x*r1.x;
    r2.x = sin(r2.x);
    r2.y = hg_Params[0].x*r2.x;
    r1.x = hg_Params[1].x*r1.y;
    r1.x = sin(r1.x);
    r2.x = hg_Params[0].x*r1.x;
    r2.xy = r2.xy*hg_Params[6].xy;
    r2.xy = r2.xy*hg_Params[3].xy + r0.xy;
    r2.xy = r2.xy*hg_Params[6].zw;
    r1.xy = fmin(r2.xy, hg_Params[4].xy);
    r1.xy = fmax(r1.xy, hg_Params[4].zw);
    r2.xy = select(r1.xy, r2.xy, hg_Params[5].xy < 0.00000f);
    r2.xy = r2.xy + hg_Params[7].xy;
    r2.xy = r2.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r2.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEWave canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEWave`

```asm
000000000006d6f4	mov	w3, #0x1
000000000006d6f8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006d6fc	ldur	d0, [x29, #-0x80]
000000000006d700	fcmp	d0, #0.0
000000000006d704	b.ne	0x6d71c
000000000006d708	cbz	x20, 0x6d798
000000000006d70c	add	x8, sp, #0x70
000000000006d710	mov	x0, x20
000000000006d714	bl	_objc_msgSend$heliumRef
000000000006d718	b	0x6d79c
000000000006d71c	ldr	x4, [x24]
000000000006d720	sub	x2, x29, #0x88
000000000006d724	mov	x0, x22
000000000006d728	mov	w3, #0x2
000000000006d72c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006d730	ldr	x4, [x24]
000000000006d734	sub	x2, x29, #0x90
000000000006d738	mov	x0, x22
000000000006d73c	mov	w3, #0x3
000000000006d740	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000006d744	ldr	x4, [x24]
000000000006d748	sub	x2, x29, #0x91
000000000006d74c	mov	x0, x22
000000000006d750	mov	w3, #0x4
000000000006d754	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000006d758	ldr	x4, [x24]
000000000006d75c	sub	x2, x29, #0x92
000000000006d760	mov	x0, x22
000000000006d764	mov	w3, #0x5
000000000006d768	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000006d76c	cbz	x20, 0x6d7e8
000000000006d770	sub	x8, x29, #0xe0
000000000006d774	mov	x0, x20
000000000006d778	bl	_objc_msgSend$imageInfo
000000000006d77c	ldur	x8, [x29, #-0xb8]
000000000006d780	ldur	d8, [x29, #-0x90]
000000000006d784	cmp	x8, #0x2
000000000006d788	b.ne	0x6d7fc
000000000006d78c	fneg	d8, d8
000000000006d790	stur	d8, [x29, #-0x90]
000000000006d794	b	0x6d7fc
000000000006d798	str	xzr, [sp, #0x70]
000000000006d79c	add	x2, sp, #0x70
000000000006d7a0	mov	x0, x19
000000000006d7a4	bl	"_objc_msgSend$setHeliumRef:"
000000000006d7a8	ldr	x0, [sp, #0x70]
000000000006d7ac	cbz	x0, 0x6d7bc
000000000006d7b0	ldr	x8, [x0]
000000000006d7b4	ldr	x8, [x8, #0x18]
000000000006d7b8	blr	x8
000000000006d7bc	mov	w0, #0x1
000000000006d7c0	ldp	x29, x30, [sp, #0x1d0]
000000000006d7c4	ldp	x20, x19, [sp, #0x1c0]
000000000006d7c8	ldp	x22, x21, [sp, #0x1b0]
000000000006d7cc	ldp	x24, x23, [sp, #0x1a0]
000000000006d7d0	ldp	x26, x25, [sp, #0x190]
000000000006d7d4	ldp	x28, x27, [sp, #0x180]
000000000006d7d8	ldp	d9, d8, [sp, #0x170]
000000000006d7dc	ldp	d11, d10, [sp, #0x160]
000000000006d7e0	add	sp, sp, #0x1e0
000000000006d7e4	ret
000000000006d7e8	stur	xzr, [x29, #-0xa0]
000000000006d7ec	movi.2d	v0, #0000000000000000
000000000006d7f0	stp	q0, q0, [x29, #-0xc0]
000000000006d7f4	stp	q0, q0, [x29, #-0xe0]
000000000006d7f8	ldur	d8, [x29, #-0x90]
000000000006d7fc	mov	x0, x20
000000000006d800	bl	_objc_msgSend$width
000000000006d804	mov	x22, x0
000000000006d808	ldur	d9, [x29, #-0x90]
000000000006d80c	mov	x0, x20
000000000006d810	bl	_objc_msgSend$height
000000000006d814	mov	x23, x0
000000000006d818	ldur	d0, [x29, #-0x88]
000000000006d81c	fcmp	d0, #0.0
000000000006d820	b.ne	0x6d82c
000000000006d824	mov	x8, #0x3ff0000000000000
000000000006d828	stur	x8, [x29, #-0x88]
000000000006d82c	add	x8, sp, #0x70
000000000006d830	mov	x0, x21
000000000006d834	mov	x2, x20
000000000006d838	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000006d83c	ldr	d0, [sp, #0x70]
000000000006d840	ldr	d1, [sp, #0x98]
000000000006d844	fabs	d0, d0
000000000006d848	fabs	d1, d1
000000000006d84c	ldur	d2, [x29, #-0x80]
000000000006d850	fmul	d3, d0, d2
000000000006d854	ldur	d0, [x29, #-0x88]
000000000006d858	fmul	d10, d1, d0
000000000006d85c	stp	d10, d3, [x29, #-0x88]
000000000006d860	ldr	x2, [x24]
000000000006d864	mov	x0, x21
000000000006d868	bl	"_objc_msgSend$getRenderMode:"
000000000006d86c	cbz	w0, 0x6d7c0
000000000006d870	mov	x0, x20
000000000006d874	bl	_objc_msgSend$imageType
000000000006d878	cmp	x0, #0x3
000000000006d87c	b.ne	0x6d940
000000000006d880	cbz	x20, 0x6d894
000000000006d884	add	x8, sp, #0x68
000000000006d888	mov	x0, x20
000000000006d88c	bl	_objc_msgSend$heliumRef
000000000006d890	b	0x6d898
000000000006d894	str	xzr, [sp, #0x68]
000000000006d898	add	x8, sp, #0x30
000000000006d89c	mov	x0, x21
000000000006d8a0	mov	x2, x20
000000000006d8a4	bl	"_objc_msgSend$getImageBoundary:"
000000000006d8a8	ldp	d0, d1, [sp, #0x30]
000000000006d8ac	fcvtl	v0.2d, v0.2s
000000000006d8b0	fcvtl	v1.2d, v1.2s
000000000006d8b4	stp	q0, q1, [sp, #0x40]
000000000006d8b8	add	x0, sp, #0x70
000000000006d8bc	add	x1, sp, #0x40
000000000006d8c0	add	x2, sp, #0x40
000000000006d8c4	bl	__ZNK14PCMatrix44TmplIdE13transformRectIdEEbRK6PCRectIT_ERS4_
000000000006d8c8	tbz	w0, #0x0, 0x6d92c
000000000006d8cc	ldr	x0, [sp, #0x68]
000000000006d8d0	str	x0, [sp, #0x28]
000000000006d8d4	cbz	x0, 0x6d8e4
000000000006d8d8	ldr	x8, [x0]
000000000006d8dc	ldr	x8, [x8, #0x10]
000000000006d8e0	blr	x8
000000000006d8e4	add	x8, sp, #0x30
000000000006d8e8	add	x2, sp, #0x28
000000000006d8ec	add	x3, sp, #0x40
000000000006d8f0	mov	x0, x21
000000000006d8f4	bl	"_objc_msgSend$changeDOD:withRect:"
000000000006d8f8	ldr	x8, [sp, #0x68]
000000000006d8fc	ldr	x0, [sp, #0x30]
000000000006d900	cmp	x8, x0
000000000006d904	b.eq	0x6d948
000000000006d908	cbz	x8, 0x6d920
000000000006d90c	ldr	x9, [x8]
000000000006d910	ldr	x9, [x9, #0x18]
000000000006d914	mov	x0, x8
000000000006d918	blr	x9
000000000006d91c	ldr	x0, [sp, #0x30]
000000000006d920	str	x0, [sp, #0x68]
000000000006d924	str	xzr, [sp, #0x30]
000000000006d928	b	0x6d958
000000000006d92c	ldr	x0, [sp, #0x68]
000000000006d930	cbz	x0, 0x6d940
000000000006d934	ldr	x8, [x0]
000000000006d938	ldr	x8, [x8, #0x18]
000000000006d93c	blr	x8
000000000006d940	mov	w0, #0x0
000000000006d944	b	0x6d7c0
000000000006d948	cbz	x8, 0x6d958
000000000006d94c	ldr	x8, [x0]
000000000006d950	ldr	x8, [x8, #0x18]
000000000006d954	blr	x8
000000000006d958	ldr	x0, [sp, #0x28]
000000000006d95c	cbz	x0, 0x6d96c
000000000006d960	ldr	x8, [x0]
000000000006d964	ldr	x8, [x8, #0x18]
000000000006d968	blr	x8
000000000006d96c	mov	x0, x20
000000000006d970	bl	_objc_msgSend$width
000000000006d974	mov	x28, x0
000000000006d978	mov	x0, x20
000000000006d97c	bl	_objc_msgSend$height
000000000006d980	mov	x24, x0
000000000006d984	adrp	x8, 507 ; 0x268000
000000000006d988	ldr	d0, [x8, #0xd48]
000000000006d98c	fdiv	d0, d0, d10
000000000006d990	ldur	x8, [x29, #-0xb8]
000000000006d994	fneg	d1, d0
000000000006d998	cmp	x8, #0x2
000000000006d99c	fcsel	d10, d1, d0, eq
000000000006d9a0	mov	x0, x19
000000000006d9a4	bl	_objc_msgSend$width
000000000006d9a8	mov	x26, x0
000000000006d9ac	mov	x0, x19
000000000006d9b0	bl	_objc_msgSend$height
000000000006d9b4	mov	x27, x0
000000000006d9b8	mov	x0, x19
000000000006d9bc	bl	_objc_msgSend$width
000000000006d9c0	str	x0, [sp, #0x18]
000000000006d9c4	mov	x0, x19
000000000006d9c8	bl	_objc_msgSend$height
000000000006d9cc	str	x0, [sp, #0x10]
000000000006d9d0	mov	w0, #0x1a0
000000000006d9d4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006d9d8	mov	x25, x0
000000000006d9dc	bl	__ZN7HgcWaveC2Ev
000000000006d9e0	adrp	x8, 809 ; 0x396000
000000000006d9e4	add	x8, x8, #0xf28
000000000006d9e8	add	x9, x8, #0x10
000000000006d9ec	str	x9, [x25]
000000000006d9f0	str	x25, [sp, #0x30]
000000000006d9f4	ldurb	w9, [x29, #-0x92]
000000000006d9f8	str	w9, [sp, #0xc]
000000000006d9fc	ldr	x2, [sp, #0x68]
000000000006da00	ldr	x8, [x8, #0x88]
000000000006da04	mov	x0, x25
000000000006da08	mov	w1, #0x0
000000000006da0c	blr	x8
000000000006da10	ldr	x0, [sp, #0x30]
000000000006da14	ldur	d0, [x29, #-0x80]
000000000006da18	fcvt	s0, d0
000000000006da1c	ldr	x8, [x0]
000000000006da20	ldr	x8, [x8, #0x60]
000000000006da24	movi.2d	v1, #0000000000000000
000000000006da28	movi.2d	v2, #0000000000000000
000000000006da2c	movi.2d	v3, #0000000000000000
000000000006da30	mov	w1, #0x0
000000000006da34	blr	x8
000000000006da38	ldr	x0, [sp, #0x30]
000000000006da3c	fcvt	s0, d10
000000000006da40	ldr	x8, [x0]
000000000006da44	ldr	x8, [x8, #0x60]
000000000006da48	movi.2d	v1, #0000000000000000
000000000006da4c	movi.2d	v2, #0000000000000000
000000000006da50	movi.2d	v3, #0000000000000000
000000000006da54	mov	w1, #0x1
000000000006da58	blr	x8
000000000006da5c	mov	x8, #0x4059000000000000
000000000006da60	fmov	d0, x8
000000000006da64	fdiv	d1, d8, d0
000000000006da68	ucvtf	d2, x22
000000000006da6c	fdiv	d0, d9, d0
000000000006da70	ucvtf	d3, x23
000000000006da74	fmul	d1, d1, d2
000000000006da78	fmul	d0, d0, d3
000000000006da7c	ucvtf	d2, x28
000000000006da80	fmov	d3, #-0.50000000
000000000006da84	fmul	d2, d2, d3
000000000006da88	fadd	d1, d1, d2
000000000006da8c	ucvtf	d2, x24
000000000006da90	fmul	d2, d2, d3
000000000006da94	fadd	d2, d0, d2
000000000006da98	ldr	x0, [sp, #0x30]
000000000006da9c	fcvt	s0, d1
000000000006daa0	fcvt	s1, d2
000000000006daa4	ldr	x8, [x0]
000000000006daa8	ldr	x8, [x8, #0x60]
000000000006daac	movi.2d	v8, #0000000000000000
000000000006dab0	movi.2d	v2, #0000000000000000
000000000006dab4	movi.2d	v3, #0000000000000000
000000000006dab8	mov	w1, #0x2
000000000006dabc	blr	x8
000000000006dac0	ldr	x0, [sp, #0x30]
000000000006dac4	ldurb	w8, [x29, #-0x91]
000000000006dac8	cmp	w8, #0x0
000000000006dacc	fmov	s0, #1.00000000
000000000006dad0	fcsel	s0, s0, s8, eq
000000000006dad4	ucvtf	s1, w8
000000000006dad8	ldr	x8, [x0]
000000000006dadc	ldr	x8, [x8, #0x60]
000000000006dae0	movi.2d	v2, #0000000000000000
000000000006dae4	movi.2d	v3, #0000000000000000
000000000006dae8	mov	w1, #0x3
000000000006daec	blr	x8
000000000006daf0	ucvtf	d0, x26, #0x1
000000000006daf4	fmov	d1, #-2.00000000
000000000006daf8	fadd	d0, d0, d1
000000000006dafc	fcvt	s0, d0
000000000006db00	ucvtf	d2, x27, #0x1
000000000006db04	fadd	d1, d2, d1
000000000006db08	fcvt	s1, d1
000000000006db0c	ldp	x8, x9, [sp, #0x10]
000000000006db10	ucvtf	s2, x9
000000000006db14	fcvt	d2, s2
000000000006db18	fmov	d3, #-0.50000000
000000000006db1c	fmul	d2, d2, d3
000000000006db20	fmov	d4, #2.00000000
000000000006db24	fadd	d2, d2, d4
000000000006db28	fcvt	s2, d2
000000000006db2c	ucvtf	s5, x8
000000000006db30	fcvt	d5, s5
000000000006db34	fmul	d3, d5, d3
000000000006db38	fadd	d3, d3, d4
000000000006db3c	fcvt	s3, d3
000000000006db40	ldr	x0, [sp, #0x30]
000000000006db44	ldr	x8, [x0]
000000000006db48	ldr	x8, [x8, #0x60]
000000000006db4c	mov	w1, #0x4
000000000006db50	blr	x8
000000000006db54	ldr	w8, [sp, #0xc]
000000000006db58	eor	w8, w8, #0x1
000000000006db5c	neg	w8, w8
000000000006db60	scvtf	s0, w8
000000000006db64	ldr	x0, [sp, #0x30]
000000000006db68	ldr	x8, [x0]
000000000006db6c	ldr	x8, [x8, #0x60]
000000000006db70	mov	w1, #0x5
000000000006db74	mov.16b	v1, v0
000000000006db78	mov.16b	v2, v0
000000000006db7c	mov.16b	v3, v0
000000000006db80	blr	x8
000000000006db84	ldr	x0, [sp, #0x30]
000000000006db88	ldr	d2, [sp, #0x70]
000000000006db8c	ldr	d3, [sp, #0x98]
000000000006db90	fcvt	s0, d2
000000000006db94	fcvt	s1, d3
000000000006db98	fabs	s1, s1
000000000006db9c	fmov	d4, #1.00000000
000000000006dba0	fdiv	d2, d4, d2
000000000006dba4	fcvt	s2, d2
000000000006dba8	fabs	d3, d3
000000000006dbac	fdiv	d3, d4, d3
000000000006dbb0	fcvt	s3, d3
000000000006dbb4	ldr	x8, [x0]
000000000006dbb8	ldr	x8, [x8, #0x60]
000000000006dbbc	mov	w1, #0x6
000000000006dbc0	blr	x8
000000000006dbc4	add	x2, sp, #0x30
000000000006dbc8	mov	x0, x21
000000000006dbcc	mov	x3, x20
000000000006dbd0	mov	x4, x19
000000000006dbd4	bl	"_objc_msgSend$crop:fromImage:toImage:"
000000000006dbd8	ldr	x0, [sp, #0x30]
000000000006dbdc	str	x0, [sp, #0x20]
000000000006dbe0	cbz	x0, 0x6dbf0
000000000006dbe4	ldr	x8, [x0]
000000000006dbe8	ldr	x8, [x8, #0x10]
000000000006dbec	blr	x8
000000000006dbf0	add	x2, sp, #0x20
000000000006dbf4	mov	x0, x19
000000000006dbf8	bl	"_objc_msgSend$setHeliumRef:"
000000000006dbfc	ldr	x0, [sp, #0x20]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : ToggleButton
    parm5 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (bool)
    - parm5 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm5 (bool)
    slot 3  <-  (constant / computed / multi-pass — read the disasm)
    slot 4  <-  parm5 (bool)
    slot 5  <-  (constant / computed / multi-pass — read the disasm)
    slot 6  <-  parm5 (bool)
```
