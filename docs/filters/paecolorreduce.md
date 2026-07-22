# PAEColorReduce

- **PAE class:** `PAEColorReduce`
- **Plugin UUID:** `3168D40C-AF34-401F-81DA-CB50EC5DD5D0`
- **Node names in corpus:** Color Reduce (3), Reduction (1)
- **Corpus usage:** 3 files, 4 instances

## What it does

Color Reduce (PAEColorReduce) quantizes the image to a small set of Match Colors, snapping every pixel to its nearest match color (or replacing matched colors with Replace With). The verbatim HgcColorReduce shader computes squared distance to up to four match colors, picks the nearest, and blends by a Smoothness/contrast slope -- a nearest-palette posterization.

> **Note.** Shader-only. The verbatim HgcColorReduce Metal shader (nearest-of-4-colors quantize) is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Replace With | color | - | - | Color that matched pixels are replaced with. |
| Match Color 1 | color | - | - | First palette color to match against. |
| Match Color 2 | color | - | - | Second palette color to match against. |
| Match Color 3 | color | - | - | Third palette color to match against. |
| Match Color 4 | color | - | - | Fourth palette color to match against. |
| Smoothness | float | 0.15 | 1 .. 1 | Blend slope between matched colors (shader hg_Params[0]). Continuous float, NOT a boolean. |
| Reduce To | enum(int) | 2 | 0 .. 2 | How many palette colors to reduce to, 0-2. |
| Mix | float | 1 | 0.2257 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcColorReduce` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcColorReduce.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcColorReduce`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcColorReduce` → [`HgcColorReduce.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorReduce.metal)

```metal
//Metal1.0     
//LEN=00000007ce
[[ visible ]] FragmentOut HgcColorReduce_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(100000.0000, 0.000000000, 9.999999747e-06, 1.000000000);
    const float4 c1 = float4(0.5000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3, r4, r5, r6, r7;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.xyz = hg_Params[5].xyz;
    r2.xyz = r0.xyz - hg_Params[1].xyz;
    r1.w = dot(r2.xyz, r2.xyz);
    r2.xyz = hg_Params[6].xyz;
    r3.xyz = r0.xyz - hg_Params[2].xyz;
    r2.w = dot(r3.xyz, r3.xyz);
    r3.xyz = hg_Params[7].xyz;
    r4.xyz = r0.xyz - hg_Params[3].xyz;
    r3.w = dot(r4.xyz, r4.xyz);
    r4.xyz = hg_Params[8].xyz;
    r5.xyz = r0.xyz - hg_Params[4].xyz;
    r4.w = dot(r5.xyz, r5.xyz);
    r5 = r1.wwww - r2.wwww;
    r6 = select(r2, r1, r5 < 0.00000f);
    r5 = select(c0.yxyy, c0.xyyy, r5 < 0.00000f);
    r7 = r6.wwww - r3.wwww;
    r6 = select(r3, r6, r7 < 0.00000f);
    r5 = select(c0.yyxy, r5, r7 < 0.00000f);
    r7 = r6.wwww - r4.wwww;
    r6 = select(r4, r6, r7 < 0.00000f);
    r5 = select(c0.yyyx, r5, r7 < 0.00000f);
    r7.w = fmax(r2.w, r1.w);
    r7.w = fmax(r3.w, r7.w);
    r7.w = fmax(r4.w, r7.w);
    r1.w = r1.w + r5.x;
    r2.w = r2.w + r5.y;
    r3.w = r3.w + r5.z;
    r4.w = r4.w + r5.w;
    r5 = r1.wwww - r2.wwww;
    r5 = select(r2, r1, r5 < 0.00000f);
    r1 = r5.wwww - r3.wwww;
    r5 = select(r3, r5, r1 < 0.00000f);
    r2 = r5.wwww - r4.wwww;
    r5 = select(r4, r5, r2 < 0.00000f);
    r6.w = r6.w + c0.z;
    r6.w = sqrt(r6.w);
    r7.w = r7.w + c0.z;
    r7.w = rsqrt(r7.w);
    r5.w = r5.w + c0.z;
    r5.w = sqrt(r5.w);
    r1.x = r5.w - r6.w;
    r1.x = r1.x*r7.w;
    r1.x = clamp(r1.x*hg_Params[0].x + c0.w, 0.00000f, 1.00000f);
    r1.x = r1.x*c1.x;
    r1.xyz = mix(r6.xyz, r5.xyz, r1.xxx);
    output.color0.xyz = r1.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEColorReduce canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEColorReduce`

```asm
000000000001c4bc	mov	w3, #0x1
000000000001c4c0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001c4c4	ldr	x4, [x22]
000000000001c4c8	add	x2, sp, #0xe4
000000000001c4cc	mov	x0, x23
000000000001c4d0	mov	w3, #0xc
000000000001c4d4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000001c4d8	ldr	w25, [sp, #0xe4]
000000000001c4dc	cmp	w25, #0x0
000000000001c4e0	cset	w26, gt
000000000001c4e4	ldr	x6, [x22]
000000000001c4e8	add	x2, sp, #0xd8
000000000001c4ec	add	x3, sp, #0xd0
000000000001c4f0	add	x4, sp, #0xc8
000000000001c4f4	mov	x0, x23
000000000001c4f8	mov	w5, #0x2
000000000001c4fc	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c500	ldr	x6, [x22]
000000000001c504	add	x2, sp, #0xc0
000000000001c508	add	x3, sp, #0xb8
000000000001c50c	add	x4, sp, #0xb0
000000000001c510	mov	x0, x23
000000000001c514	mov	w5, #0x3
000000000001c518	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c51c	ldr	x6, [x22]
000000000001c520	add	x2, sp, #0xa8
000000000001c524	add	x3, sp, #0xa0
000000000001c528	add	x4, sp, #0x98
000000000001c52c	mov	x0, x23
000000000001c530	mov	w5, #0x4
000000000001c534	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c538	ldr	x6, [x22]
000000000001c53c	add	x2, sp, #0x90
000000000001c540	add	x3, sp, #0x88
000000000001c544	add	x4, sp, #0x80
000000000001c548	mov	x0, x23
000000000001c54c	mov	w5, #0x6
000000000001c550	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c554	ldr	x6, [x22]
000000000001c558	add	x2, sp, #0x78
000000000001c55c	add	x3, sp, #0x70
000000000001c560	add	x4, sp, #0x68
000000000001c564	mov	x0, x23
000000000001c568	mov	w5, #0x8
000000000001c56c	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c570	ldr	x6, [x22]
000000000001c574	add	x2, sp, #0x60
000000000001c578	add	x3, sp, #0x58
000000000001c57c	add	x4, sp, #0x50
000000000001c580	mov	x0, x23
000000000001c584	mov	w5, #0x9
000000000001c588	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c58c	ldr	x6, [x22]
000000000001c590	add	x2, sp, #0x48
000000000001c594	add	x3, sp, #0x40
000000000001c598	add	x4, sp, #0x38
000000000001c59c	mov	x0, x23
000000000001c5a0	mov	w5, #0xa
000000000001c5a4	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c5a8	ldr	x6, [x22]
000000000001c5ac	add	x2, sp, #0x30
000000000001c5b0	add	x3, sp, #0x28
000000000001c5b4	add	x4, sp, #0x20
000000000001c5b8	mov	x0, x23
000000000001c5bc	mov	w5, #0xb
000000000001c5c0	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000001c5c4	tbz	w26, #0x0, 0x1c5e4
000000000001c5c8	cmp	w25, #0x1
000000000001c5cc	b.ne	0x1c614
000000000001c5d0	ldp	d1, d0, [sp, #0xd0]
000000000001c5d4	ldr	d2, [sp, #0xc8]
000000000001c5d8	ldp	d4, d3, [sp, #0x70]
000000000001c5dc	ldr	d5, [sp, #0x68]
000000000001c5e0	b	0x1c604
000000000001c5e4	ldp	d1, d0, [sp, #0xd0]
000000000001c5e8	stp	d1, d0, [sp, #0xa0]
000000000001c5ec	ldr	d2, [sp, #0xc8]
000000000001c5f0	str	d2, [sp, #0x98]
000000000001c5f4	ldp	d4, d3, [sp, #0x70]
000000000001c5f8	stp	d4, d3, [sp, #0x40]
000000000001c5fc	ldr	d5, [sp, #0x68]
000000000001c600	str	d5, [sp, #0x38]
000000000001c604	stp	d1, d0, [sp, #0x88]
000000000001c608	str	d2, [sp, #0x80]
000000000001c60c	stp	d4, d3, [sp, #0x28]
000000000001c610	str	d5, [sp, #0x20]
000000000001c614	ldr	x2, [x22]
000000000001c618	mov	x0, x21
000000000001c61c	bl	"_objc_msgSend$getRenderMode:"
000000000001c620	cbz	w0, 0x1c8bc
000000000001c624	mov	x0, x20
000000000001c628	bl	_objc_msgSend$imageType
000000000001c62c	cmp	x0, #0x3
000000000001c630	b.ne	0x1c660
000000000001c634	ldr	x0, [x21, x24]
000000000001c638	adrp	x8, 952 ; 0x3d4000
000000000001c63c	ldr	x2, [x8, #0x528]
000000000001c640	bl	"_objc_msgSend$apiForProtocol:"
000000000001c644	mov	x21, x0
000000000001c648	cbz	x0, 0x1c660
000000000001c64c	cbz	x20, 0x1c668
000000000001c650	add	x8, sp, #0x18
000000000001c654	mov	x0, x20
000000000001c658	bl	_objc_msgSend$heliumRef
000000000001c65c	b	0x1c66c
000000000001c660	mov	w0, #0x0
000000000001c664	b	0x1c8bc
000000000001c668	str	xzr, [sp, #0x18]
000000000001c66c	mov	w0, #0x1a0
000000000001c670	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001c674	mov	x20, x0
000000000001c678	bl	__ZN14HgcColorReduceC1Ev
000000000001c67c	str	x20, [sp, #0x10]
000000000001c680	ldr	x2, [sp, #0x18]
000000000001c684	ldr	x8, [x20]
000000000001c688	ldr	x8, [x8, #0x78]
000000000001c68c	mov	x0, x20
000000000001c690	mov	w1, #0x0
000000000001c694	blr	x8
000000000001c698	ldr	d8, [sp, #0xe8]
000000000001c69c	fcmp	d8, #0.0
000000000001c6a0	b.ne	0x1c6bc
000000000001c6a4	mov	x8, #0xe0000000
000000000001c6a8	movk	x8, #0x624d, lsl #32
000000000001c6ac	movk	x8, #0x3f50, lsl #48
000000000001c6b0	str	x8, [sp, #0xe8]
000000000001c6b4	adrp	x8, 589 ; 0x269000
000000000001c6b8	ldr	d8, [x8, #0x5c8]
000000000001c6bc	ldp	d1, d0, [sp, #0xd0]
000000000001c6c0	ldp	d3, d2, [sp, #0xc0]
000000000001c6c4	stp	d0, d3, [x29, #-0x90]
000000000001c6c8	ldp	d0, d3, [sp, #0xb0]
000000000001c6cc	stp	d1, d3, [x29, #-0xb0]
000000000001c6d0	stp	d2, d0, [x29, #-0xd0]
000000000001c6d4	fmov.2d	v0, #1.00000000
000000000001c6d8	ldp	d2, d1, [sp, #0xa0]
000000000001c6dc	ldp	d4, d3, [sp, #0x90]
000000000001c6e0	stp	d1, d4, [x29, #-0x80]
000000000001c6e4	ldp	d1, d4, [sp, #0x80]
000000000001c6e8	stp	d2, d4, [x29, #-0xa0]
000000000001c6ec	stp	d3, d1, [x29, #-0xc0]
000000000001c6f0	stp	q0, q0, [x29, #-0xf0]
000000000001c6f4	ldp	d2, d1, [sp, #0x70]
000000000001c6f8	ldp	d4, d3, [sp, #0x60]
000000000001c6fc	stp	d1, d4, [sp, #0x150]
000000000001c700	ldp	d1, d4, [sp, #0x50]
000000000001c704	stp	d2, d4, [sp, #0x130]
000000000001c708	stp	d3, d1, [sp, #0x110]
000000000001c70c	ldp	d2, d1, [sp, #0x40]
000000000001c710	ldp	d4, d3, [sp, #0x30]
000000000001c714	stp	d1, d4, [sp, #0x160]
000000000001c718	ldp	d1, d4, [sp, #0x20]
000000000001c71c	stp	d2, d4, [sp, #0x140]
000000000001c720	stp	d3, d1, [sp, #0x120]
000000000001c724	stp	q0, q0, [sp, #0xf0]
000000000001c728	mov	x0, x21
000000000001c72c	bl	_objc_msgSend$versionAtCreation
000000000001c730	fmov	d0, #-1.00000000
000000000001c734	fdiv	d0, d0, d8
000000000001c738	fcvt	s0, d0
000000000001c73c	cbz	w0, 0x1c7c0
000000000001c740	mov	x8, #0x0
000000000001c744	sub	x9, x29, #0xf0
000000000001c748	sub	x10, x29, #0x90
000000000001c74c	sub	x11, x29, #0xb0
000000000001c750	sub	x12, x29, #0xd0
000000000001c754	add	x13, sp, #0xf0
000000000001c758	add	x14, sp, #0x150
000000000001c75c	add	x15, sp, #0x130
000000000001c760	add	x16, sp, #0x110
000000000001c764	ldr	q1, [x9, x8]
000000000001c768	ldr	q2, [x10, x8]
000000000001c76c	fmul.2d	v2, v1, v2
000000000001c770	str	q2, [x10, x8]
000000000001c774	ldr	q2, [x11, x8]
000000000001c778	fmul.2d	v2, v1, v2
000000000001c77c	str	q2, [x11, x8]
000000000001c780	ldr	q2, [x12, x8]
000000000001c784	fmul.2d	v1, v1, v2
000000000001c788	str	q1, [x12, x8]
000000000001c78c	ldr	q1, [x13, x8]
000000000001c790	ldr	q2, [x14, x8]
000000000001c794	fmul.2d	v2, v1, v2
000000000001c798	str	q2, [x14, x8]
000000000001c79c	ldr	q2, [x15, x8]
000000000001c7a0	fmul.2d	v2, v1, v2
000000000001c7a4	str	q2, [x15, x8]
000000000001c7a8	ldr	q2, [x16, x8]
000000000001c7ac	fmul.2d	v1, v1, v2
000000000001c7b0	str	q1, [x16, x8]
000000000001c7b4	add	x8, x8, #0x10
000000000001c7b8	cmp	x8, #0x20
000000000001c7bc	b.ne	0x1c764
000000000001c7c0	ldr	x8, [x20]
000000000001c7c4	ldr	x8, [x8, #0x60]
000000000001c7c8	movi.2d	v1, #0000000000000000
000000000001c7cc	movi.2d	v2, #0000000000000000
000000000001c7d0	movi.2d	v3, #0000000000000000
000000000001c7d4	mov	x0, x20
000000000001c7d8	mov	w1, #0x0
000000000001c7dc	blr	x8
000000000001c7e0	str	x19, [sp, #0x8]
000000000001c7e4	mov	x28, #0x0
000000000001c7e8	sub	x22, x29, #0xb0
000000000001c7ec	sub	x23, x29, #0xd0
000000000001c7f0	sub	x24, x29, #0xf0
000000000001c7f4	add	x25, sp, #0x150
000000000001c7f8	add	x26, sp, #0x130
000000000001c7fc	add	x27, sp, #0x110
000000000001c800	add	x19, sp, #0xf0
000000000001c804	cmp	x28, #0x4
000000000001c808	b.eq	0x1c884
000000000001c80c	sub	x8, x29, #0x90
000000000001c810	ldr	d0, [x8, x28, lsl #3]
000000000001c814	fcvt	s0, d0
000000000001c818	ldr	d1, [x22, x28, lsl #3]
000000000001c81c	fcvt	s1, d1
000000000001c820	ldr	d2, [x23, x28, lsl #3]
000000000001c824	fcvt	s2, d2
000000000001c828	ldr	d3, [x24, x28, lsl #3]
000000000001c82c	fcvt	s3, d3
000000000001c830	ldr	x8, [x20]
000000000001c834	ldr	x8, [x8, #0x60]
000000000001c838	add	w1, w28, #0x1
000000000001c83c	mov	x0, x20
000000000001c840	blr	x8
000000000001c844	ldr	d0, [x25, x28, lsl #3]
000000000001c848	fcvt	s0, d0
000000000001c84c	ldr	d1, [x26, x28, lsl #3]
000000000001c850	fcvt	s1, d1
000000000001c854	ldr	d2, [x27, x28, lsl #3]
000000000001c858	fcvt	s2, d2
000000000001c85c	ldr	d3, [x19, x28, lsl #3]
000000000001c860	fcvt	s3, d3
000000000001c864	ldr	x8, [x20]
000000000001c868	ldr	x8, [x8, #0x60]
000000000001c86c	add	x21, x28, #0x1
000000000001c870	add	w1, w28, #0x5
000000000001c874	mov	x0, x20
000000000001c878	blr	x8
000000000001c87c	mov	x28, x21
000000000001c880	b	0x1c804
000000000001c884	add	x2, sp, #0x10
000000000001c888	ldr	x0, [sp, #0x8]
000000000001c88c	bl	"_objc_msgSend$setHeliumRef:"
000000000001c890	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm12 (int)
    - parm2 (colour)
    - parm3 (colour)
    - parm4 (colour)
    - parm6 (colour)
    - parm8 (colour)
    - parm9 (colour)
    - parm10 (colour)
    - parm11 (colour)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm2 (colour), parm8 (colour), parm1 (float), parm3 (colour), parm4 (colour), parm6 (colour), parm9 (colour), parm10 (colour), parm11 (colour)
    slot 0  <-  (constant / computed)
    slot 0  <-  (constant / computed)
```
