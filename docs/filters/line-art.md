# Line Art

- **PAE class:** `Line Art`
- **Plugin UUID:** `3286E661-A40D-40BE-82AB-1852FFAF91E0`
- **Node names in corpus:** Line Art (25), LA (2)
- **Corpus usage:** 21 files, 27 instances

## What it does

Line Art converts the image into a stylized pen-and-ink drawing: it detects edges and renders them as ink strokes on a paper-colored background. Threshold and Smoothness control which edges become ink, while the Paper/Ink colors and Paper Opacity set the drawing's look.

> **Note.** Not implemented; description is the standard Apple Motion "Line Art" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Threshold | float | 0.07 | 0.02 .. 0.2 | Edge-detection threshold; lower = more lines, ~0.02-0.2 (default 0.07). |
| Smoothness | float | 0.11 | 0 .. 0.15 | Smoothing of the detected lines, 0-0.15 (default 0.11). |
| Paper Color | color | - | - | Background (paper) color. |
| Paper Opacity | float | 1 | 0 .. 1 | Opacity of the paper background, 0-1. NOT a boolean. |
| Ink Color | color | - | - | Color of the ink strokes. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcLineArtThreshold`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcLineArtThreshold` → [`HgcLineArtThreshold.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLineArtThreshold.metal)

```metal
//Metal1.0     
//LEN=0000000201
[[ visible ]] FragmentOut HgcLineArtThreshold_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.3086000085, 0.6093999743, 0.08200000226, 0.5000000000);
    float4 r0;
    FragmentOut output;

    r0.xyz = color0.xyz;
    r0.x = dot(r0.xyz, c0.xyz);
    r0.x = r0.x - hg_Params[0].x;
    r0.x = clamp(r0.x*hg_Params[1].x + c0.w, 0.00000f, 1.00000f);
    output.color0 = mix(hg_Params[2], hg_Params[3], r0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAELineArt canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELineArt`

```asm
0000000000026650	mov	w3, #0x1
0000000000026654	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000026658	ldr	x4, [x20]
000000000002665c	add	x2, sp, #0xd0
0000000000026660	mov	x0, x24
0000000000026664	mov	w3, #0x2
0000000000026668	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000002666c	ldr	x6, [x20]
0000000000026670	add	x2, sp, #0xc8
0000000000026674	add	x3, sp, #0xc0
0000000000026678	add	x4, sp, #0xb8
000000000002667c	mov	x0, x24
0000000000026680	mov	w5, #0x3
0000000000026684	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
0000000000026688	mov	x8, #0x3ff0000000000000
000000000002668c	str	x8, [sp, #0xb0]
0000000000026690	ldr	x4, [x20]
0000000000026694	add	x2, sp, #0xb0
0000000000026698	mov	x0, x24
000000000002669c	mov	w3, #0x4
00000000000266a0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000266a4	ldr	x6, [x20]
00000000000266a8	add	x2, sp, #0xa8
00000000000266ac	add	x3, sp, #0xa0
00000000000266b0	add	x4, sp, #0x98
00000000000266b4	mov	x0, x24
00000000000266b8	mov	w5, #0x5
00000000000266bc	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
00000000000266c0	mov	x0, x21
00000000000266c4	bl	_objc_msgSend$imageType
00000000000266c8	mov	x24, x0
00000000000266cc	ldr	x2, [x20]
00000000000266d0	mov	x0, x23
00000000000266d4	bl	"_objc_msgSend$getRenderMode:"
00000000000266d8	cmp	w0, #0x0
00000000000266dc	ccmp	x24, #0x3, #0x0, ne
00000000000266e0	cset	w20, eq
00000000000266e4	b.ne	0x26700
00000000000266e8	cbz	x21, 0x26728
00000000000266ec	add	x8, sp, #0x90
00000000000266f0	mov	x0, x21
00000000000266f4	bl	_objc_msgSend$heliumRef
00000000000266f8	b	0x2672c
00000000000266fc	mov	w20, #0x0
0000000000026700	mov	x0, x20
0000000000026704	ldp	x29, x30, [sp, #0x1e0]
0000000000026708	ldp	x20, x19, [sp, #0x1d0]
000000000002670c	ldp	x22, x21, [sp, #0x1c0]
0000000000026710	ldp	x24, x23, [sp, #0x1b0]
0000000000026714	ldp	x26, x25, [sp, #0x1a0]
0000000000026718	ldp	x28, x27, [sp, #0x190]
000000000002671c	ldp	d9, d8, [sp, #0x180]
0000000000026720	add	sp, sp, #0x1f0
0000000000026724	ret
0000000000026728	str	xzr, [sp, #0x90]
000000000002672c	mov	x0, x19
0000000000026730	bl	_objc_msgSend$width
0000000000026734	mov	x24, x0
0000000000026738	mov	x0, x19
000000000002673c	bl	_objc_msgSend$height
0000000000026740	mov	x25, x0
0000000000026744	mov	x27, x25
0000000000026748	mov	x26, x24
000000000002674c	cbnz	w22, 0x26848
0000000000026750	negs	w8, w24
0000000000026754	and	w8, w8, #0xff
0000000000026758	and	w9, w24, #0xff
000000000002675c	csneg	w8, w9, w8, mi
0000000000026760	negs	w9, w25
0000000000026764	and	w9, w9, #0xff
0000000000026768	and	w10, w25, #0xff
000000000002676c	csneg	w9, w10, w9, mi
0000000000026770	sub	w10, w24, w8
0000000000026774	add	w10, w10, #0x100
0000000000026778	cmp	w8, #0x0
000000000002677c	csel	w26, w24, w10, eq
0000000000026780	sub	w8, w25, w9
0000000000026784	add	w8, w8, #0x100
0000000000026788	cmp	w9, #0x0
000000000002678c	csel	w27, w25, w8, eq
0000000000026790	mov	x0, sp
0000000000026794	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
0000000000026798	scvtf	d0, w27
000000000002679c	scvtf	d1, w25
00000000000267a0	fdiv	d1, d0, d1
00000000000267a4	scvtf	d0, w26
00000000000267a8	scvtf	d2, w24
00000000000267ac	fdiv	d0, d0, d2
00000000000267b0	fmov	d2, #1.00000000
00000000000267b4	fdiv	d0, d2, d0
00000000000267b8	fdiv	d1, d2, d1
00000000000267bc	mov	x0, sp
00000000000267c0	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000267c4	mov	w0, #0x210
00000000000267c8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000267cc	mov	x21, x0
00000000000267d0	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000267d4	ldr	x8, [x21]
00000000000267d8	ldr	x8, [x8, #0x230]
00000000000267dc	mov	x1, sp
00000000000267e0	mov	x0, x21
00000000000267e4	blr	x8
00000000000267e8	ldr	x2, [sp, #0x90]
00000000000267ec	ldr	x8, [x21]
00000000000267f0	ldr	x8, [x8, #0x78]
00000000000267f4	mov	x0, x21
00000000000267f8	mov	w1, #0x0
00000000000267fc	blr	x8
0000000000026800	ldr	x0, [sp, #0x90]
0000000000026804	cmp	x0, x21
0000000000026808	b.eq	0x26830
000000000002680c	cbz	x0, 0x2681c
0000000000026810	ldr	x8, [x0]
0000000000026814	ldr	x8, [x8, #0x18]
0000000000026818	blr	x8
000000000002681c	str	x21, [sp, #0x90]
0000000000026820	ldr	x8, [x21]
0000000000026824	ldr	x8, [x8, #0x10]
0000000000026828	mov	x0, x21
000000000002682c	blr	x8
0000000000026830	ldr	x8, [x21]
0000000000026834	ldr	x8, [x8, #0x18]
0000000000026838	mov	x0, x21
000000000002683c	blr	x8
0000000000026840	mov	x0, sp
0000000000026844	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000026848	mov	w0, #0x1b0
000000000002684c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000026850	mov	x21, x0
0000000000026854	bl	__ZN8HLineArtC1Ev
0000000000026858	ldp	d0, d1, [sp, #0xe0]
000000000002685c	fcvt	s0, d0
0000000000026860	fcvt	s1, d1
0000000000026864	ldp	d2, d3, [sp, #0xf0]
0000000000026868	fcvt	s2, d2
000000000002686c	fcvt	s3, d3
0000000000026870	fadd	s2, s0, s2
0000000000026874	fadd	s3, s1, s3
0000000000026878	bl	0x250a78 ; symbol stub for: _HGRectfMake4f
000000000002687c	stp	s0, s1, [sp]
0000000000026880	stp	s2, s3, [sp, #0x8]
0000000000026884	mov	x1, sp
0000000000026888	mov	x0, x21
000000000002688c	bl	__ZN10HStarburst7SetRectERK7HGRectf
0000000000026890	cbz	x21, 0x268a4
0000000000026894	ldr	x8, [x21]
0000000000026898	ldr	x8, [x8, #0x10]
000000000002689c	mov	x0, x21
00000000000268a0	blr	x8
00000000000268a4	ldr	x8, [x21]
00000000000268a8	ldr	x8, [x8, #0x60]
00000000000268ac	movi.2d	v0, #0000000000000000
00000000000268b0	fmov	s1, #-1.00000000
00000000000268b4	movi.2d	v2, #0000000000000000
00000000000268b8	movi.2d	v3, #0000000000000000
00000000000268bc	mov	x0, x21
00000000000268c0	mov	w1, #0x0
00000000000268c4	blr	x8
00000000000268c8	ldr	x8, [x21]
00000000000268cc	ldr	x8, [x8, #0x60]
00000000000268d0	fmov	s0, #-1.00000000
00000000000268d4	movi.2d	v1, #0000000000000000
00000000000268d8	movi.2d	v2, #0000000000000000
00000000000268dc	movi.2d	v3, #0000000000000000
00000000000268e0	mov	x0, x21
00000000000268e4	mov	w1, #0x1
00000000000268e8	blr	x8
00000000000268ec	ldr	x8, [x21]
00000000000268f0	ldr	x8, [x8, #0x60]
00000000000268f4	movi.2d	v0, #0000000000000000
00000000000268f8	fmov	s1, #1.00000000
00000000000268fc	movi.2d	v2, #0000000000000000
0000000000026900	movi.2d	v3, #0000000000000000
0000000000026904	mov	x0, x21
0000000000026908	mov	w1, #0x2
000000000002690c	blr	x8
0000000000026910	ldr	x8, [x21]
0000000000026914	ldr	x8, [x8, #0x60]
0000000000026918	fmov	s0, #1.00000000
000000000002691c	movi.2d	v1, #0000000000000000
0000000000026920	movi.2d	v2, #0000000000000000
0000000000026924	movi.2d	v3, #0000000000000000
0000000000026928	mov	x0, x21
000000000002692c	mov	w1, #0x3
0000000000026930	blr	x8
0000000000026934	ldr	x2, [sp, #0x90]
0000000000026938	ldr	x8, [x21]
000000000002693c	ldr	x8, [x8, #0x78]
0000000000026940	mov	x0, x21
0000000000026944	mov	w1, #0x0
0000000000026948	blr	x8
000000000002694c	mov	x23, x21
0000000000026950	cbnz	w22, 0x26a18
0000000000026954	mov	x0, sp
0000000000026958	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
000000000002695c	scvtf	d0, w25
0000000000026960	scvtf	d1, w27
0000000000026964	fdiv	d1, d0, d1
0000000000026968	scvtf	d0, w24
000000000002696c	scvtf	d2, w26
0000000000026970	fdiv	d0, d0, d2
0000000000026974	fmov	d2, #1.00000000
0000000000026978	fdiv	d0, d2, d0
000000000002697c	fdiv	d1, d2, d1
0000000000026980	mov	x0, sp
0000000000026984	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
0000000000026988	mov	w0, #0x210
000000000002698c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000026990	mov	x22, x0
0000000000026994	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
0000000000026998	ldr	x8, [x22]
000000000002699c	ldr	x8, [x8, #0x230]
00000000000269a0	mov	x1, sp
00000000000269a4	mov	x23, x21
00000000000269a8	mov	x0, x22
00000000000269ac	blr	x8
00000000000269b0	ldr	x8, [x22]
00000000000269b4	ldr	x8, [x8, #0x78]
00000000000269b8	mov	x23, x21
00000000000269bc	mov	x0, x22
00000000000269c0	mov	w1, #0x0
00000000000269c4	mov	x2, x21
00000000000269c8	blr	x8
00000000000269cc	mov	x23, x21
00000000000269d0	cmp	x21, x22
00000000000269d4	b.eq	0x26a00
00000000000269d8	ldr	x8, [x21]
00000000000269dc	ldr	x8, [x8, #0x18]
00000000000269e0	mov	x23, x21
00000000000269e4	mov	x0, x21
00000000000269e8	blr	x8
00000000000269ec	ldr	x8, [x22]
00000000000269f0	ldr	x8, [x8, #0x10]
00000000000269f4	mov	x23, x22
00000000000269f8	mov	x0, x22
00000000000269fc	blr	x8
0000000000026a00	ldr	x8, [x22]
0000000000026a04	ldr	x8, [x8, #0x18]
0000000000026a08	mov	x0, x22
0000000000026a0c	blr	x8
0000000000026a10	mov	x0, sp
0000000000026a14	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
0000000000026a18	ldr	d8, [sp, #0xd0]
0000000000026a1c	fcmp	d8, #0.0
0000000000026a20	b.ne	0x26a3c
0000000000026a24	mov	x8, #0xe0000000
0000000000026a28	movk	x8, #0x624d, lsl #32
0000000000026a2c	movk	x8, #0x3f50, lsl #48
0000000000026a30	str	x8, [sp, #0xd0]
0000000000026a34	adrp	x8, 579 ; 0x269000
0000000000026a38	ldr	d8, [x8, #0x5c8]
0000000000026a3c	mov	w0, #0x1a0
0000000000026a40	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000026a44	mov	x22, x0
0000000000026a48	bl	__ZN19HgcLineArtThresholdC1Ev
0000000000026a4c	ldr	d0, [sp, #0xd8]
0000000000026a50	fcvt	s0, d0
0000000000026a54	ldr	x8, [x22]
0000000000026a58	ldr	x8, [x8, #0x60]
0000000000026a5c	movi.2d	v1, #0000000000000000
0000000000026a60	movi.2d	v2, #0000000000000000
0000000000026a64	movi.2d	v3, #0000000000000000
0000000000026a68	mov	x0, x22
0000000000026a6c	mov	w1, #0x0
0000000000026a70	blr	x8
0000000000026a74	fmov	d0, #1.00000000
0000000000026a78	fdiv	d0, d0, d8
0000000000026a7c	fcvt	s0, d0
0000000000026a80	ldr	x8, [x22]
0000000000026a84	ldr	x8, [x8, #0x60]
0000000000026a88	movi.2d	v1, #0000000000000000
0000000000026a8c	movi.2d	v2, #0000000000000000
0000000000026a90	movi.2d	v3, #0000000000000000
0000000000026a94	mov	x0, x22
0000000000026a98	mov	w1, #0x1
0000000000026a9c	blr	x8
0000000000026aa0	ldp	d1, d0, [sp, #0xc0]
0000000000026aa4	ldp	d3, d2, [sp, #0xb0]
0000000000026aa8	fmul	d0, d0, d3
0000000000026aac	fcvt	s0, d0
0000000000026ab0	fmul	d1, d3, d1
0000000000026ab4	fcvt	s1, d1
0000000000026ab8	fmul	d2, d3, d2
0000000000026abc	fcvt	s2, d2
0000000000026ac0	fcvt	s3, d3
0000000000026ac4	ldr	x8, [x22]
0000000000026ac8	ldr	x8, [x8, #0x60]
0000000000026acc	mov	x0, x22
0000000000026ad0	mov	w1, #0x2
0000000000026ad4	blr	x8
0000000000026ad8	ldp	d1, d0, [sp, #0xa0]
0000000000026adc	fcvt	s0, d0
0000000000026ae0	fcvt	s1, d1
0000000000026ae4	ldr	d2, [sp, #0x98]
0000000000026ae8	fcvt	s2, d2
0000000000026aec	ldr	x8, [x22]
0000000000026af0	ldr	x8, [x8, #0x60]
0000000000026af4	fmov	s3, #1.00000000
0000000000026af8	mov	x0, x22
0000000000026afc	mov	w1, #0x3
0000000000026b00	blr	x8
0000000000026b04	ldr	x8, [x22]
0000000000026b08	ldr	x8, [x8, #0x78]
0000000000026b0c	mov	x0, x22
0000000000026b10	mov	w1, #0x0
0000000000026b14	mov	x2, x23
0000000000026b18	blr	x8
0000000000026b1c	str	x22, [sp]
0000000000026b20	ldr	x8, [x22]
0000000000026b24	ldr	x8, [x8, #0x10]
0000000000026b28	mov	x0, x22
0000000000026b2c	blr	x8
0000000000026b30	mov	x2, sp
0000000000026b34	mov	x0, x19
0000000000026b38	bl	"_objc_msgSend$setHeliumRef:"
0000000000026b3c	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : ColorParameter
    parm4 : FloatSlider
    parm5 : ColorParameter
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (colour)
    - parm4 (float)
    - parm5 (colour)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  (constant / computed / multi-pass — read the disasm)
    slot 3  <-  parm5 (colour)
```
