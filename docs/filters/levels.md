# Levels

- **PAE class:** `Levels`
- **Plugin UUID:** `2B221FA1-08A2-416E-998C-D7559E5509B5`
- **Node names in corpus:** Levels (617), Levels copy (30), Levels 1 (25), Levels 1 copy (22), Levels 2 (4), Levels 2 copy (2)
- **Corpus usage:** 382 files, 702 instances

## What it does

Levels is a tonal remap: it takes input black/white points and gamma and maps them to output black/white points, per channel or on RGB together, exactly like the Levels control in a photo editor. In the corpus the built-in transitions almost always drive only Gamma (via the Histogram > RGB > Gamma sub-parameter) to brighten or darken midtones. FCP internally runs a two-stage affine + power curve (HgcLevels); the TS engine implements the common single-stage form.

> **Note.** RE finding: the Motion UI `Gamma` is fed to the shader as its reciprocal, so a UI Gamma > 1 brightens midtones (net pow(x, 1/gamma)). The input/output black+white points are exposed as children of `Histogram` and are largely unexercised by the shipping transitions.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Histogram | color | - | - | The tonal-mapping controls, nested: Channel selects RGB or a single channel; RGB/Red/Green/Blue hold the black-in, white-in, gamma, black-out, white-out sub-parameters; Opacity blends. Gamma is the dominant driven knob. *(keyframed in 11 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the remapped result over the original, 0-1 continuous. *(keyframed in 32 instances)* |
| Levels::HDR In Rec. 709 | bool | 0 | 0 .. 0 | Working-space toggle: interpret input as Rec.709 HDR. Not a creative control. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/levels.ts`](../../engine/src/compositor/filters/levels.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcLevels`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcLevels` → [`HgcLevels.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLevels.metal)

```metal
//Metal1.0     
//LEN=00000003f8
[[ visible ]] FragmentOut HgcLevels_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(9.999999747e-06, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = color0;
    r1 = hg_Params[0] - hg_Params[2];
    r1 = r1 + c0.xxxx;
    r2 = hg_Params[1] - hg_Params[3];
    r3 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = r2/r1;
    r2 = r1*-hg_Params[0] + hg_Params[1];
    r1 = clamp(r3*r1 + r2, 0.00000f, 1.00000f);
    r1 = clamp(r1 + c0.xxxx, 0.00000f, 1.00000f);
    r3 = hg_Params[5] - hg_Params[7];
    r3 = r3 + c0.xxxx;
    r2 = hg_Params[6] - hg_Params[8];
    r1 = pow(r1, hg_Params[4]);
    r3 = r2/r3;
    r2 = r3*-hg_Params[5] + hg_Params[6];
    r1 = clamp(r1*r3 + r2, 0.00000f, 1.00000f);
    r1 = clamp(r1 + c0.xxxx, 0.00000f, 1.00000f);
    r1 = pow(r1, hg_Params[9]);
    r1.xyz = r1.www*r1.xyz;
    output.color0 = mix(r0, r1, hg_Params[10]);
    return output;
}
```

### CPU parameter wiring — `-[PAELevels canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELevels`

```asm
0000000000042268	mov	x0, x24
000000000004226c	bl	"_objc_msgSend$mixAmountAtTime:"
0000000000042270	mov.16b	v8, v0
0000000000042274	ldr	x8, [x23]
0000000000042278	str	x8, [sp, #0x8]
000000000004227c	mov	w26, #0x1
0000000000042280	str	w26, [sp]
0000000000042284	add	x2, sp, #0x68
0000000000042288	add	x3, sp, #0x60
000000000004228c	add	x4, sp, #0x58
0000000000042290	add	x5, sp, #0x50
0000000000042294	add	x6, sp, #0x48
0000000000042298	mov	x0, x24
000000000004229c	mov	x7, #0x0
00000000000422a0	bl	"_objc_msgSend$getHistogramBlackIn:BlackOut:WhiteIn:WhiteOut:Gamma:forChannel:fromParm:atFxTime:"
00000000000422a4	mov	x27, #0x0
00000000000422a8	ldr	d0, [sp, #0x48]
00000000000422ac	adrp	x8, 551 ; 0x269000
00000000000422b0	ldr	d9, [x8, #0x4b0]
00000000000422b4	fcmp	d0, d9
00000000000422b8	fcsel	d0, d9, d0, mi
00000000000422bc	fmov	d10, #1.00000000
00000000000422c0	sub	x28, x29, #0xa0
00000000000422c4	sub	x19, x29, #0xc0
00000000000422c8	fdiv	d0, d10, d0
00000000000422cc	str	d0, [sp, #0x48]
00000000000422d0	add	x20, sp, #0xb0
00000000000422d4	add	x21, sp, #0x90
00000000000422d8	add	x22, sp, #0x70
00000000000422dc	mov	w25, #0x1
00000000000422e0	ldr	x8, [x23]
00000000000422e4	str	x8, [sp, #0x8]
00000000000422e8	str	w26, [sp]
00000000000422ec	add	x2, x28, x27
00000000000422f0	add	x3, x19, x27
00000000000422f4	add	x4, x20, x27
00000000000422f8	add	x5, x21, x27
00000000000422fc	add	x6, x22, x27
0000000000042300	mov	x0, x24
0000000000042304	mov	x7, x25
0000000000042308	bl	"_objc_msgSend$getHistogramBlackIn:BlackOut:WhiteIn:WhiteOut:Gamma:forChannel:fromParm:atFxTime:"
000000000004230c	ldr	d0, [x22, x27]
0000000000042310	fcmp	d0, d9
0000000000042314	fcsel	d0, d9, d0, mi
0000000000042318	fdiv	d0, d10, d0
000000000004231c	str	d0, [x22, x27]
0000000000042320	add	x27, x27, #0x8
0000000000042324	add	x25, x25, #0x1
0000000000042328	cmp	x27, #0x20
000000000004232c	b.ne	0x422e0
0000000000042330	ldr	x2, [x23]
0000000000042334	ldr	x0, [sp, #0x30]
0000000000042338	bl	"_objc_msgSend$getRenderMode:"
000000000004233c	cbz	w0, 0x42368
0000000000042340	ldr	x0, [sp, #0x28]
0000000000042344	bl	_objc_msgSend$imageType
0000000000042348	cmp	x0, #0x3
000000000004234c	b.ne	0x42364
0000000000042350	ldr	x0, [sp, #0x28]
0000000000042354	cbz	x0, 0x423a8
0000000000042358	add	x8, sp, #0x40
000000000004235c	bl	_objc_msgSend$heliumRef
0000000000042360	b	0x423ac
0000000000042364	mov	w0, #0x0
0000000000042368	ldur	x8, [x29, #-0x80]
000000000004236c	adrp	x9, 839 ; 0x389000
0000000000042370	ldr	x9, [x9, #0x840] ; literal pool symbol address: ___stack_chk_guard
0000000000042374	ldr	x9, [x9]
0000000000042378	cmp	x9, x8
000000000004237c	b.ne	0x42608
0000000000042380	ldp	x29, x30, [sp, #0x190]
0000000000042384	ldp	x20, x19, [sp, #0x180]
0000000000042388	ldp	x22, x21, [sp, #0x170]
000000000004238c	ldp	x24, x23, [sp, #0x160]
0000000000042390	ldp	x26, x25, [sp, #0x150]
0000000000042394	ldp	x28, x27, [sp, #0x140]
0000000000042398	ldp	d9, d8, [sp, #0x130]
000000000004239c	ldp	d11, d10, [sp, #0x120]
00000000000423a0	add	sp, sp, #0x1a0
00000000000423a4	ret
00000000000423a8	str	xzr, [sp, #0x40]
00000000000423ac	str	xzr, [sp, #0x38]
00000000000423b0	mov	w0, #0x1a0
00000000000423b4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000423b8	mov	x21, x0
00000000000423bc	bl	__ZN7HLevelsC2Ev
00000000000423c0	ldr	d0, [sp, #0x68]
00000000000423c4	fcvt	s0, d0
00000000000423c8	ldr	x8, [x21]
00000000000423cc	ldr	x8, [x8, #0x60]
00000000000423d0	movi.2d	v3, #0000000000000000
00000000000423d4	mov	x0, x21
00000000000423d8	mov	w1, #0x0
00000000000423dc	mov.16b	v1, v0
00000000000423e0	mov.16b	v2, v0
00000000000423e4	blr	x8
00000000000423e8	ldr	d0, [sp, #0x60]
00000000000423ec	fcvt	s0, d0
00000000000423f0	ldr	x8, [x21]
00000000000423f4	ldr	x8, [x8, #0x60]
00000000000423f8	movi.2d	v3, #0000000000000000
00000000000423fc	mov	x0, x21
0000000000042400	mov	w1, #0x1
0000000000042404	mov.16b	v1, v0
0000000000042408	mov.16b	v2, v0
000000000004240c	blr	x8
0000000000042410	ldr	d0, [sp, #0x58]
0000000000042414	fcvt	s0, d0
0000000000042418	ldr	x8, [x21]
000000000004241c	ldr	x8, [x8, #0x60]
0000000000042420	fmov	s3, #1.00000000
0000000000042424	mov	x0, x21
0000000000042428	mov	w1, #0x2
000000000004242c	mov.16b	v1, v0
0000000000042430	mov.16b	v2, v0
0000000000042434	blr	x8
0000000000042438	ldr	d0, [sp, #0x50]
000000000004243c	fcvt	s0, d0
0000000000042440	ldr	x8, [x21]
0000000000042444	ldr	x8, [x8, #0x60]
0000000000042448	fmov	s3, #1.00000000
000000000004244c	mov	x0, x21
0000000000042450	mov	w1, #0x3
0000000000042454	mov.16b	v1, v0
0000000000042458	mov.16b	v2, v0
000000000004245c	blr	x8
0000000000042460	ldr	d0, [sp, #0x48]
0000000000042464	fcvt	s0, d0
0000000000042468	ldr	x8, [x21]
000000000004246c	ldr	x8, [x8, #0x60]
0000000000042470	fmov	s3, #1.00000000
0000000000042474	mov	x0, x21
0000000000042478	mov	w1, #0x4
000000000004247c	mov.16b	v1, v0
0000000000042480	mov.16b	v2, v0
0000000000042484	blr	x8
0000000000042488	ldp	d0, d1, [x29, #-0xa0]
000000000004248c	fcvt	s0, d0
0000000000042490	fcvt	s1, d1
0000000000042494	ldp	d2, d3, [x29, #-0x90]
0000000000042498	fcvt	s2, d2
000000000004249c	fcvt	s3, d3
00000000000424a0	ldr	x8, [x21]
00000000000424a4	ldr	x8, [x8, #0x60]
00000000000424a8	mov	x0, x21
00000000000424ac	mov	w1, #0x5
00000000000424b0	blr	x8
00000000000424b4	ldp	d0, d1, [x29, #-0xc0]
00000000000424b8	fcvt	s0, d0
00000000000424bc	fcvt	s1, d1
00000000000424c0	ldp	d2, d3, [x29, #-0xb0]
00000000000424c4	fcvt	s2, d2
00000000000424c8	fcvt	s3, d3
00000000000424cc	ldr	x8, [x21]
00000000000424d0	ldr	x8, [x8, #0x60]
00000000000424d4	mov	x0, x21
00000000000424d8	mov	w1, #0x6
00000000000424dc	blr	x8
00000000000424e0	ldp	d0, d1, [sp, #0xb0]
00000000000424e4	fcvt	s0, d0
00000000000424e8	fcvt	s1, d1
00000000000424ec	ldp	d2, d3, [sp, #0xc0]
00000000000424f0	fcvt	s2, d2
00000000000424f4	fcvt	s3, d3
00000000000424f8	ldr	x8, [x21]
00000000000424fc	ldr	x8, [x8, #0x60]
0000000000042500	mov	x0, x21
0000000000042504	mov	w1, #0x7
0000000000042508	blr	x8
000000000004250c	ldp	d0, d1, [sp, #0x90]
0000000000042510	fcvt	s0, d0
0000000000042514	fcvt	s1, d1
0000000000042518	ldp	d2, d3, [sp, #0xa0]
000000000004251c	fcvt	s2, d2
0000000000042520	fcvt	s3, d3
0000000000042524	ldr	x8, [x21]
0000000000042528	ldr	x8, [x8, #0x60]
000000000004252c	mov	x0, x21
0000000000042530	mov	w1, #0x8
0000000000042534	blr	x8
0000000000042538	ldp	d0, d1, [sp, #0x70]
000000000004253c	fcvt	s0, d0
0000000000042540	fcvt	s1, d1
0000000000042544	ldp	d2, d3, [sp, #0x80]
0000000000042548	fcvt	s2, d2
000000000004254c	fcvt	s3, d3
0000000000042550	ldr	x8, [x21]
0000000000042554	ldr	x8, [x8, #0x60]
0000000000042558	mov	x0, x21
000000000004255c	mov	w1, #0x9
0000000000042560	blr	x8
0000000000042564	fcvt	s0, d8
0000000000042568	ldr	x8, [x21]
000000000004256c	ldr	x8, [x8, #0x60]
0000000000042570	mov	x0, x21
0000000000042574	mov	w1, #0xa
0000000000042578	mov.16b	v1, v0
000000000004257c	mov.16b	v2, v0
0000000000042580	mov.16b	v3, v0
0000000000042584	blr	x8
0000000000042588	ldr	x0, [sp, #0x20]
000000000004258c	bl	_objc_msgSend$versionAtCreation
0000000000042590	ldr	x2, [sp, #0x40]
0000000000042594	ldr	x8, [x21]
0000000000042598	ldr	x8, [x8, #0x78]
000000000004259c	mov	x0, x21
00000000000425a0	mov	w1, #0x0
00000000000425a4	blr	x8
00000000000425a8	ldr	x8, [x21]
00000000000425ac	ldr	x8, [x8, #0x10]
00000000000425b0	str	x21, [sp, #0x38]
00000000000425b4	mov	x0, x21
00000000000425b8	blr	x8
00000000000425bc	add	x2, sp, #0x38
00000000000425c0	ldr	x0, [sp, #0x18]
00000000000425c4	bl	"_objc_msgSend$setHeliumRef:"
00000000000425c8	ldr	x8, [x21]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - host Mix

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  host Mix
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  host Mix
    slot 5  <-  host Mix
    slot 6  <-  host Mix
    slot 7  <-  host Mix
    slot 8  <-  host Mix
    slot 9  <-  host Mix
    slot 10  <-  host Mix
```
