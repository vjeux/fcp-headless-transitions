# Stripes

- **PAE class:** `Stripes`
- **Plugin UUID:** `6968E691-88C2-4FAC-8864-674BD75C777F`
- **Node names in corpus:** Stripes (25), Stripes 2 (1)
- **Corpus usage:** 17 files, 26 instances

## What it does

Stripes overlays a repeating stripe/line pattern generator over the image. Center positions the pattern, Angle rotates the stripes, and Offset shifts their phase. (Note: this filter is largely a pattern generator; most creative controls live in its OSC.)

> **Note.** Not implemented; description is the standard Apple Motion "Stripes" pattern filter. (unverified) exact stripe geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Position of the stripe pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0 | 0 .. 1.571 | Rotation of the stripes, radians (0-~pi/2). |
| Offset | float | 0 | 0 .. 0 | Phase offset shifting the stripes across the frame. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 11 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTextureWrapClampToEdge`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTextureWrapClampToEdge` → [`HgcTextureWrapClampToEdge.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTextureWrapClampToEdge.metal)

```metal
//Metal1.0     
//LEN=00000002a8
[[ visible ]] FragmentOut HgcTextureWrapClampToEdge_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.xy = texCoord0.xy - hg_Params[0].zw;
    r1.xy = hg_Params[0].xy - c0.xx;
    r0.xy = fmin(r0.xy, r1.xy);
    r0.xy = fmax(r0.xy, c0.xx);
    r0.xy = r0.xy + hg_Params[0].zw;
    r0.xy = r0.xy + hg_Params[1].xy;
    r0.xy = r0.xy*hg_Params[1].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEStripesFilter canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEStripesFilter`

```asm
00000000000622a8	mov	w4, #0x1
00000000000622ac	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000622b0	ldur	d0, [x29, #-0x68]
00000000000622b4	fmov	d1, #-0.50000000
00000000000622b8	fadd	d0, d0, d1
00000000000622bc	scvtf	d2, w25
00000000000622c0	fmul	d3, d0, d2
00000000000622c4	ldur	d0, [x29, #-0x70]
00000000000622c8	fadd	d0, d0, d1
00000000000622cc	scvtf	d1, w24
00000000000622d0	fmul	d0, d0, d1
00000000000622d4	stp	d0, d3, [x29, #-0x70]
00000000000622d8	ldr	x4, [x19]
00000000000622dc	sub	x2, x29, #0x78
00000000000622e0	mov	x0, x23
00000000000622e4	mov	w3, #0x2
00000000000622e8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000622ec	ldr	x4, [x19]
00000000000622f0	sub	x2, x29, #0x80
00000000000622f4	mov	x0, x23
00000000000622f8	mov	w3, #0x3
00000000000622fc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000062300	cbz	x20, 0x62334
0000000000062304	sub	x8, x29, #0xd0
0000000000062308	mov	x0, x20
000000000006230c	bl	_objc_msgSend$imageInfo
0000000000062310	ldur	x8, [x29, #-0xa8]
0000000000062314	ldur	d8, [x29, #-0x90]
0000000000062318	cbz	x8, 0x62348
000000000006231c	ldur	d0, [x29, #-0x78]
0000000000062320	fneg	d1, d0
0000000000062324	ldur	d0, [x29, #-0x80]
0000000000062328	fneg	d0, d0
000000000006232c	stp	d0, d1, [x29, #-0x80]
0000000000062330	b	0x62348
0000000000062334	stur	xzr, [x29, #-0x90]
0000000000062338	movi.2d	v0, #0000000000000000
000000000006233c	stp	q0, q0, [x29, #-0xb0]
0000000000062340	stp	q0, q0, [x29, #-0xd0]
0000000000062344	movi.2d	v8, #0000000000000000
0000000000062348	ldr	x2, [x19]
000000000006234c	mov	x0, x22
0000000000062350	bl	"_objc_msgSend$getRenderMode:"
0000000000062354	cbz	w0, 0x62678
0000000000062358	mov	x0, x21
000000000006235c	bl	_objc_msgSend$imageType
0000000000062360	cmp	x0, #0x3
0000000000062364	b.ne	0x6237c
0000000000062368	cbz	x21, 0x62384
000000000006236c	sub	x8, x29, #0xd8
0000000000062370	mov	x0, x21
0000000000062374	bl	_objc_msgSend$heliumRef
0000000000062378	b	0x62388
000000000006237c	mov	w0, #0x0
0000000000062380	b	0x62678
0000000000062384	stur	xzr, [x29, #-0xd8]
0000000000062388	mov	w0, #0x1d0
000000000006238c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000062390	mov	x19, x0
0000000000062394	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
0000000000062398	mov	x0, x19
000000000006239c	mov	w1, #0x2
00000000000623a0	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
00000000000623a4	ldur	x2, [x29, #-0xd8]
00000000000623a8	ldr	x8, [x19]
00000000000623ac	ldr	x8, [x8, #0x78]
00000000000623b0	mov	x0, x19
00000000000623b4	mov	w1, #0x0
00000000000623b8	blr	x8
00000000000623bc	add	x0, sp, #0x98
00000000000623c0	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000623c4	ldp	d1, d0, [x29, #-0x70]
00000000000623c8	fneg	d0, d0
00000000000623cc	add	x0, sp, #0x98
00000000000623d0	movi.2d	v2, #0000000000000000
00000000000623d4	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
00000000000623d8	add	x0, sp, #0x98
00000000000623dc	fmov	d1, #1.00000000
00000000000623e0	fmov	d2, #1.00000000
00000000000623e4	mov.16b	v0, v8
00000000000623e8	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000623ec	ldur	d0, [x29, #-0x78]
00000000000623f0	adrp	x8, 519 ; 0x269000
00000000000623f4	ldr	d1, [x8, #0xa30]
00000000000623f8	fmul	d0, d0, d1
00000000000623fc	adrp	x8, 518 ; 0x268000
0000000000062400	ldr	d9, [x8, #0xdd8]
0000000000062404	fdiv	d0, d0, d9
0000000000062408	add	x0, sp, #0x98
000000000006240c	movi.2d	v1, #0000000000000000
0000000000062410	movi.2d	v2, #0000000000000000
0000000000062414	fmov	d3, #1.00000000
0000000000062418	bl	0x250f7c ; symbol stub for: __ZN11HGTransform6RotateEdddd
000000000006241c	ldur	d0, [x29, #-0x80]
0000000000062420	adrp	x8, 519 ; 0x269000
0000000000062424	ldr	d1, [x8, #0xd70]
0000000000062428	fmul	d0, d0, d1
000000000006242c	fdiv	d0, d0, d9
0000000000062430	add	x0, sp, #0x98
0000000000062434	movi.2d	v1, #0000000000000000
0000000000062438	movi.2d	v2, #0000000000000000
000000000006243c	fmov	d3, #1.00000000
0000000000062440	bl	0x250f7c ; symbol stub for: __ZN11HGTransform6RotateEdddd
0000000000062444	mov	w0, #0x210
0000000000062448	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000006244c	mov	x23, x0
0000000000062450	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000062454	ldr	x8, [x23]
0000000000062458	ldr	x8, [x8, #0x230]
000000000006245c	add	x1, sp, #0x98
0000000000062460	mov	x0, x23
0000000000062464	blr	x8
0000000000062468	ldr	x8, [x23]
000000000006246c	ldr	x8, [x8, #0x78]
0000000000062470	mov	x0, x23
0000000000062474	mov	w1, #0x0
0000000000062478	mov	x2, x19
000000000006247c	blr	x8
0000000000062480	mov	w0, #0x1a0
0000000000062484	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000062488	mov	x24, x0
000000000006248c	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
0000000000062490	neg	w0, w25
0000000000062494	mov	w1, #0x0
0000000000062498	mov	x2, x25
000000000006249c	mov	w3, #0x1
00000000000624a0	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000624a4	mov	x26, x0
00000000000624a8	mov	x25, x1
00000000000624ac	ldr	x8, [x24]
00000000000624b0	ldr	x8, [x8, #0x78]
00000000000624b4	mov	x0, x24
00000000000624b8	mov	w1, #0x0
00000000000624bc	mov	x2, x23
00000000000624c0	blr	x8
00000000000624c4	scvtf	s0, w26
00000000000624c8	lsr	x8, x26, #32
00000000000624cc	scvtf	s1, w8
00000000000624d0	scvtf	s2, w25
00000000000624d4	lsr	x8, x25, #32
00000000000624d8	scvtf	s3, w8
00000000000624dc	ldr	x8, [x24]
00000000000624e0	ldr	x8, [x8, #0x60]
00000000000624e4	mov	x0, x24
00000000000624e8	mov	w1, #0x0
00000000000624ec	blr	x8
00000000000624f0	mov	w0, #0x1d0
00000000000624f4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000624f8	mov	x25, x0
00000000000624fc	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
0000000000062500	mov	x0, x25
0000000000062504	mov	w1, #0x1
0000000000062508	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
000000000006250c	ldr	x8, [x25]
0000000000062510	ldr	x8, [x8, #0x78]
0000000000062514	mov	x0, x25
0000000000062518	mov	w1, #0x0
000000000006251c	mov	x2, x24
0000000000062520	blr	x8
0000000000062524	add	x0, sp, #0x8
0000000000062528	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
000000000006252c	ldur	d0, [x29, #-0x78]
0000000000062530	adrp	x8, 519 ; 0x269000
0000000000062534	ldr	d1, [x8, #0xeb0]
0000000000062538	fmul	d0, d0, d1
000000000006253c	fmov	d9, #1.00000000
0000000000062540	add	x0, sp, #0x8
0000000000062544	movi.2d	v1, #0000000000000000
0000000000062548	movi.2d	v2, #0000000000000000
000000000006254c	fmov	d3, #1.00000000
0000000000062550	bl	0x250f7c ; symbol stub for: __ZN11HGTransform6RotateEdddd
0000000000062554	fdiv	d0, d9, d8
0000000000062558	add	x0, sp, #0x8
000000000006255c	fmov	d1, #1.00000000
0000000000062560	fmov	d2, #1.00000000
0000000000062564	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000062568	ldp	d1, d0, [x29, #-0x70]
000000000006256c	fneg	d1, d1
0000000000062570	add	x0, sp, #0x8
0000000000062574	movi.2d	v2, #0000000000000000
0000000000062578	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
000000000006257c	mov	w0, #0x210
0000000000062580	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000062584	mov	x26, x0
0000000000062588	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
000000000006258c	ldr	x8, [x26]
0000000000062590	ldr	x8, [x8, #0x230]
0000000000062594	add	x1, sp, #0x8
0000000000062598	mov	x0, x26
000000000006259c	blr	x8
00000000000625a0	ldr	x8, [x26]
00000000000625a4	ldr	x8, [x8, #0x78]
00000000000625a8	mov	x0, x26
00000000000625ac	mov	w1, #0x0
00000000000625b0	mov	x2, x25
00000000000625b4	blr	x8
00000000000625b8	str	x26, [sp]
00000000000625bc	ldr	x8, [x26]
00000000000625c0	ldr	x8, [x8, #0x10]
00000000000625c4	mov	x0, x26
00000000000625c8	blr	x8
00000000000625cc	mov	x2, sp
00000000000625d0	mov	x0, x22
00000000000625d4	mov	x3, x21
00000000000625d8	mov	x4, x20
00000000000625dc	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000625e0	mov	x2, sp
00000000000625e4	mov	x0, x20
00000000000625e8	bl	"_objc_msgSend$setHeliumRef:"
00000000000625ec	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : PointParameter
    parm2 : AngleSlider
    parm3 : AngleSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm2 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
