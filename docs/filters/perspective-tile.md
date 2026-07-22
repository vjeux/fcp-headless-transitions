# Perspective Tile

- **PAE class:** `Perspective Tile`
- **Plugin UUID:** `A4519C66-916B-470E-B21F-9898EBEAE560`
- **Node names in corpus:** Perspective Tile (3), perst (2)
- **Corpus usage:** 5 files, 5 instances

## What it does

Perspective Tile maps the image into a four-corner quad (Top Left/Right, Bottom Left/Right) and then tiles that perspective-warped copy to fill the frame, producing a receding tiled-floor/wall look. The corner points define the perspective and Angle rotates the tiling.

> **Note.** Not implemented; description is the standard Apple Motion "Perspective Tile" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Top Left | point2D | - | - | Top-left corner of the perspective quad. |
| Top Right | point2D | - | - | Top-right corner of the perspective quad. |
| Bottom Right | point2D | - | - | Bottom-right corner of the perspective quad. |
| Bottom Left | point2D | - | - | Bottom-left corner of the perspective quad. |
| Center | point2D | - | - | Anchor of the tiling (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0 | 0.09727 .. 6.267 | Rotation of the tiling, radians (default 0). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPerspectiveTile`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPerspectiveTile` → [`HgcPerspectiveTile.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPerspectiveTile.metal)

```metal
//Metal1.0     
//LEN=00000002ff
[[ visible ]] FragmentOut HgcPerspectiveTile_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    float4 r0, r1;
    FragmentOut output;

    r0.x = dot(texCoord0, hg_Params[3]);
    r1.y = dot(texCoord0, hg_Params[2]);
    r1.x = dot(texCoord0, hg_Params[1]);
    r1.zw = r1.xy/r0.xx;
    r1.xy = select(r1.xy, r1.zw, -fabs(r0.xx) < 0.00000f);
    r1.zw = r1.xy + hg_Params[0].zw;
    r1.xy = r1.zw/hg_Params[0].xy;
    r1.xy = fract(r1.xy);
    r1.xy = r1.xy*hg_Params[0].xy + -hg_Params[0].zw;
    r1.xy = r1.xy + hg_Params[4].xy;
    r1.xy = r1.xy*hg_Params[4].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    return output;
}
```

### Metal fragment shader — `HgcSolidColor`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSolidColor` → [`HgcSolidColor.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSolidColor.metal)

```metal
//Metal1.0     
//LEN=00000000c9
[[ visible ]] FragmentOut HgcSolidColor_hgc_visible(const constant float4* hg_Params)
{
    FragmentOut output;

    output.color0 = hg_Params[0];
    return output;
}
```

### CPU parameter wiring — `-[PAEPerspectiveTile renderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPerspectiveTile`

```asm
00000000000c647c	mov	w4, #0x1
00000000000c6480	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c6484	ldr	x5, [x22]
00000000000c6488	add	x2, sp, #0x340
00000000000c648c	add	x3, sp, #0x338
00000000000c6490	mov	x0, x23
00000000000c6494	mov	w4, #0x2
00000000000c6498	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c649c	ldr	x5, [x22]
00000000000c64a0	add	x2, sp, #0x330
00000000000c64a4	add	x3, sp, #0x328
00000000000c64a8	mov	x0, x23
00000000000c64ac	mov	w4, #0x3
00000000000c64b0	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c64b4	ldr	x5, [x22]
00000000000c64b8	add	x2, sp, #0x320
00000000000c64bc	add	x3, sp, #0x318
00000000000c64c0	mov	x0, x23
00000000000c64c4	mov	w4, #0x4
00000000000c64c8	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000c64cc	ucvtf	d12, x25
00000000000c64d0	ucvtf	d13, x26
00000000000c64d4	ldr	d0, [sp, #0x350]
00000000000c64d8	fmul	d4, d0, d12
00000000000c64dc	ldr	d0, [sp, #0x348]
00000000000c64e0	fmul	d5, d0, d13
00000000000c64e4	ldr	d0, [sp, #0x340]
00000000000c64e8	fmul	d6, d0, d12
00000000000c64ec	ldr	d0, [sp, #0x338]
00000000000c64f0	fmul	d7, d0, d13
00000000000c64f4	ldr	d0, [sp, #0x330]
00000000000c64f8	fmul	d3, d0, d12
00000000000c64fc	ldr	d0, [sp, #0x328]
00000000000c6500	fmul	d16, d0, d13
00000000000c6504	ldr	d0, [sp, #0x320]
00000000000c6508	fmul	d0, d0, d12
00000000000c650c	ldr	d1, [sp, #0x318]
00000000000c6510	fmul	d1, d1, d13
00000000000c6514	fsub	d2, d0, d3
00000000000c6518	fadd	d2, d6, d2
00000000000c651c	fsub	d2, d2, d4
00000000000c6520	fsub	d17, d1, d16
00000000000c6524	fadd	d17, d7, d17
00000000000c6528	fsub	d17, d17, d5
00000000000c652c	fcmp	d2, #0.0
00000000000c6530	b.ne	0xc6558
00000000000c6534	fcmp	d17, #0.0
00000000000c6538	b.ne	0xc6558
00000000000c653c	fsub	d2, d3, d0
00000000000c6540	fsub	d4, d6, d3
00000000000c6544	fsub	d3, d16, d1
00000000000c6548	fsub	d5, d7, d16
00000000000c654c	movi.2d	v6, #0000000000000000
00000000000c6550	movi.2d	v7, #0000000000000000
00000000000c6554	b	0xc65c4
00000000000c6558	fsub	d18, d5, d7
00000000000c655c	fsub	d19, d4, d6
00000000000c6560	fsub	d20, d16, d7
00000000000c6564	fsub	d6, d3, d6
00000000000c6568	fmul	d7, d18, d6
00000000000c656c	fmul	d21, d19, d20
00000000000c6570	fsub	d21, d7, d21
00000000000c6574	fmul	d7, d18, d2
00000000000c6578	fmul	d18, d19, d17
00000000000c657c	fsub	d7, d7, d18
00000000000c6580	fdiv	d7, d7, d21
00000000000c6584	fmul	d6, d6, d17
00000000000c6588	fmul	d2, d20, d2
00000000000c658c	fsub	d2, d6, d2
00000000000c6590	fdiv	d6, d2, d21
00000000000c6594	fsub	d2, d3, d0
00000000000c6598	fmul	d3, d3, d7
00000000000c659c	fadd	d2, d2, d3
00000000000c65a0	fsub	d3, d16, d1
00000000000c65a4	fmul	d16, d16, d7
00000000000c65a8	fadd	d3, d3, d16
00000000000c65ac	fsub	d16, d4, d0
00000000000c65b0	fmul	d4, d4, d6
00000000000c65b4	fadd	d4, d16, d4
00000000000c65b8	fsub	d16, d5, d1
00000000000c65bc	fmul	d5, d5, d6
00000000000c65c0	fadd	d5, d16, d5
00000000000c65c4	mov	x8, #0x0
00000000000c65c8	add	x19, sp, #0x35c
00000000000c65cc	fmul	d16, d1, d6
00000000000c65d0	fsub	d16, d5, d16
00000000000c65d4	fcvt	s16, d16
00000000000c65d8	fmul	d17, d1, d7
00000000000c65dc	fsub	d17, d17, d3
00000000000c65e0	fcvt	s17, d17
00000000000c65e4	stp	s16, s17, [x29, #-0xc4]
00000000000c65e8	fmul	d16, d6, d3
00000000000c65ec	fmul	d17, d5, d7
00000000000c65f0	fsub	d16, d16, d17
00000000000c65f4	fcvt	s16, d16
00000000000c65f8	fmul	d17, d0, d6
00000000000c65fc	fsub	d17, d17, d4
00000000000c6600	fcvt	s17, d17
00000000000c6604	stp	s16, s17, [x29, #-0xbc]
00000000000c6608	fmul	d16, d0, d7
00000000000c660c	fsub	d16, d2, d16
00000000000c6610	fcvt	s16, d16
00000000000c6614	fmul	d7, d4, d7
00000000000c6618	fmul	d6, d6, d2
00000000000c661c	fsub	d6, d7, d6
00000000000c6620	fcvt	s6, d6
00000000000c6624	stp	s16, s6, [x29, #-0xb4]
00000000000c6628	fmul	d6, d1, d4
00000000000c662c	fmul	d7, d0, d5
00000000000c6630	fsub	d6, d6, d7
00000000000c6634	fcvt	s6, d6
00000000000c6638	fmul	d0, d0, d3
00000000000c663c	fmul	d1, d1, d2
00000000000c6640	fsub	d0, d0, d1
00000000000c6644	fcvt	s0, d0
00000000000c6648	stp	s6, s0, [x29, #-0xac]
00000000000c664c	fmul	d0, d5, d2
00000000000c6650	fmul	d1, d4, d3
00000000000c6654	fsub	d0, d0, d1
00000000000c6658	fcvt	s0, d0
00000000000c665c	stur	s0, [x29, #-0xa4]
00000000000c6660	fcmp	s0, #0.0
00000000000c6664	cset	w24, eq
00000000000c6668	sub	x9, x29, #0xc4
00000000000c666c	ldr	s0, [x9, x8]
00000000000c6670	fcmp	s0, s0
00000000000c6674	cset	w10, vs
00000000000c6678	orr	w24, w10, w24
00000000000c667c	ldur	s1, [x29, #-0xa4]
00000000000c6680	fdiv	s0, s0, s1
00000000000c6684	str	s0, [x9, x8]
00000000000c6688	add	x8, x8, #0x4
00000000000c668c	cmp	x8, #0x24
00000000000c6690	b.ne	0xc666c
00000000000c6694	ldp	s0, s1, [x29, #-0xc4]
00000000000c6698	fcvt	d0, s0
00000000000c669c	fmul	d0, d12, d0
00000000000c66a0	fcvt	s14, d0
00000000000c66a4	ldp	s0, s2, [x29, #-0xb8]
00000000000c66a8	fcvt	d0, s0
00000000000c66ac	fmul	d0, d12, d0
00000000000c66b0	fcvt	s15, d0
00000000000c66b4	ldp	s0, s3, [x29, #-0xac]
00000000000c66b8	fcvt	d0, s0
00000000000c66bc	fmul	d0, d12, d0
00000000000c66c0	fcvt	s10, d0
00000000000c66c4	fcvt	d0, s1
00000000000c66c8	fmul	d0, d13, d0
00000000000c66cc	fcvt	s9, d0
00000000000c66d0	stp	s14, s9, [x29, #-0xc4]
00000000000c66d4	fcvt	d0, s2
00000000000c66d8	fmul	d0, d13, d0
00000000000c66dc	fcvt	s11, d0
00000000000c66e0	stp	s15, s11, [x29, #-0xb8]
00000000000c66e4	fcvt	d0, s3
00000000000c66e8	fmul	d0, d13, d0
00000000000c66ec	fcvt	s8, d0
00000000000c66f0	stp	s10, s8, [x29, #-0xac]
00000000000c66f4	ldr	x2, [x22]
00000000000c66f8	mov	x0, x21
00000000000c66fc	bl	"_objc_msgSend$getRenderMode:"
00000000000c6700	mov	x22, x0
00000000000c6704	mov	x0, x20
00000000000c6708	bl	_objc_msgSend$imageType
00000000000c670c	cmp	w22, #0x0
00000000000c6710	ccmp	x0, #0x3, #0x0, ne
00000000000c6714	cset	w23, eq
00000000000c6718	b.ne	0xc6dac
00000000000c671c	cbz	x20, 0xc6730
00000000000c6720	add	x8, sp, #0x310
00000000000c6724	mov	x0, x20
00000000000c6728	bl	_objc_msgSend$heliumRef
00000000000c672c	b	0xc6734
00000000000c6730	str	xzr, [sp, #0x310]
00000000000c6734	fmov	d0, #-0.50000000
00000000000c6738	fmul	d1, d12, d0
00000000000c673c	fcvtzs	w0, d1
00000000000c6740	fmul	d0, d13, d0
00000000000c6744	stp	d0, d1, [sp, #0x8]
00000000000c6748	fcvtzs	w1, d0
00000000000c674c	fmov	d0, #0.50000000
00000000000c6750	fmul	d1, d12, d0
00000000000c6754	fcvtzs	w2, d1
00000000000c6758	fmul	d0, d13, d0
00000000000c675c	stp	d0, d1, [sp, #0x28]
00000000000c6760	fcvtzs	w3, d0
00000000000c6764	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000c6768	stp	x0, x1, [sp, #0x18]
00000000000c676c	tbz	w24, #0x0, 0xc67fc
00000000000c6770	mov	w0, #0x1b0
00000000000c6774	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c6778	mov	x20, x0
00000000000c677c	bl	__ZN13HgcSolidColorC2Ev
00000000000c6780	ldr	x19, [sp, #0x38]
00000000000c6784	adrp	x8, 712 ; 0x38e000
00000000000c6788	add	x8, x8, #0x60
00000000000c678c	str	x8, [x20]
00000000000c6790	ldp	x9, x8, [sp, #0x18]
00000000000c6794	stp	x9, x8, [x20, #0x1a0]
00000000000c6798	movi.2d	v0, #0000000000000000
00000000000c679c	movi.2d	v1, #0000000000000000
00000000000c67a0	movi.2d	v2, #0000000000000000
00000000000c67a4	movi.2d	v3, #0000000000000000
00000000000c67a8	mov	x0, x20
00000000000c67ac	mov	w1, #0x0
00000000000c67b0	bl	__ZN13HgcSolidColor12SetParameterEiffff
00000000000c67b4	str	x20, [sp, #0x280]
00000000000c67b8	ldr	x8, [x20]
00000000000c67bc	ldr	x8, [x8, #0x10]
00000000000c67c0	mov	x0, x20
00000000000c67c4	blr	x8
00000000000c67c8	add	x2, sp, #0x280
00000000000c67cc	mov	x0, x19
00000000000c67d0	bl	"_objc_msgSend$setHeliumRef:"
00000000000c67d4	ldr	x0, [sp, #0x280]
00000000000c67d8	cbz	x0, 0xc67e8
00000000000c67dc	ldr	x8, [x0]
00000000000c67e0	ldr	x8, [x8, #0x18]
00000000000c67e4	blr	x8
00000000000c67e8	ldr	x8, [x20]
00000000000c67ec	ldr	x8, [x8, #0x18]
00000000000c67f0	mov	x0, x20
00000000000c67f4	blr	x8
00000000000c67f8	b	0xc6d98
00000000000c67fc	cmp	w22, #0x1
00000000000c6800	b.ne	0xc68d4
00000000000c6804	cmp	x25, #0x4, lsl #12
00000000000c6808	b.hi	0xc6814
00000000000c680c	cmp	x26, #0x4, lsl #12
00000000000c6810	b.ls	0xc68d4
00000000000c6814	add	x0, sp, #0x280
00000000000c6818	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000c681c	mov	x8, #0x40d0000000000000
00000000000c6820	fmov	d0, x8
00000000000c6824	fdiv	d1, d0, d13
00000000000c6828	fcvt	s1, d1
00000000000c682c	fdiv	d0, d0, d12
00000000000c6830	fcvt	s0, d0
00000000000c6834	fcmp	s1, s0
00000000000c6838	fcsel	s0, s1, s0, mi
00000000000c683c	fcvt	d0, s0
00000000000c6840	add	x0, sp, #0x280
00000000000c6844	fmov	d2, #1.00000000
00000000000c6848	mov.16b	v1, v0
00000000000c684c	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000c6850	mov	w0, #0x210
00000000000c6854	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c6858	mov	x22, x0
00000000000c685c	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000c6860	ldr	x2, [sp, #0x310]
00000000000c6864	ldr	x8, [x22]
00000000000c6868	ldr	x8, [x8, #0x78]
00000000000c686c	mov	x0, x22
00000000000c6870	mov	w1, #0x0
00000000000c6874	blr	x8
00000000000c6878	ldr	x8, [x22]
00000000000c687c	ldr	x8, [x8, #0x230]
00000000000c6880	add	x1, sp, #0x280
00000000000c6884	mov	x0, x22
00000000000c6888	blr	x8
00000000000c688c	ldr	x0, [sp, #0x310]
00000000000c6890	cmp	x0, x22
00000000000c6894	b.eq	0xc68bc
00000000000c6898	cbz	x0, 0xc68a8
00000000000c689c	ldr	x8, [x0]
00000000000c68a0	ldr	x8, [x8, #0x18]
00000000000c68a4	blr	x8
00000000000c68a8	str	x22, [sp, #0x310]
00000000000c68ac	ldr	x8, [x22]
00000000000c68b0	ldr	x8, [x8, #0x10]
00000000000c68b4	mov	x0, x22
00000000000c68b8	blr	x8
00000000000c68bc	ldr	x8, [x22]
00000000000c68c0	ldr	x8, [x8, #0x18]
00000000000c68c4	mov	x0, x22
00000000000c68c8	blr	x8
00000000000c68cc	add	x0, sp, #0x280
00000000000c68d0	bl	0x250fc4 ; symbol stub for: __ZN11HGTransformD1Ev
00000000000c68d4	mov	w0, #0x210
00000000000c68d8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c68dc	mov	x22, x0
00000000000c68e0	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000c68e4	add	x0, sp, #0x280
00000000000c68e8	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000c68ec	add	x0, sp, #0x280
00000000000c68f0	movi.2d	v2, #0000000000000000
00000000000c68f4	ldp	d1, d0, [sp, #0x28]
00000000000c68f8	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
00000000000c68fc	ldr	x2, [sp, #0x310]
00000000000c6900	ldr	x8, [x22]
00000000000c6904	ldr	x8, [x8, #0x78]
00000000000c6908	mov	x0, x22
00000000000c690c	mov	w1, #0x0
00000000000c6910	blr	x8
00000000000c6914	ldr	x8, [x22]
00000000000c6918	ldr	x8, [x8, #0x230]
00000000000c691c	add	x1, sp, #0x280
00000000000c6920	mov	x0, x22
00000000000c6924	blr	x8
00000000000c6928	mov	w0, #0x1a0
00000000000c692c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c6930	mov	x24, x0
00000000000c6934	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
00000000000c6938	ldr	x8, [x24]
00000000000c693c	ldr	x8, [x8, #0x78]
00000000000c6940	mov	x0, x24
00000000000c6944	mov	w1, #0x0
00000000000c6948	mov	x2, x22
00000000000c694c	blr	x8
00000000000c6950	mov	w0, #0x0
00000000000c6954	mov	w1, #0x0
00000000000c6958	mov	x2, x25
00000000000c695c	mov	x3, x26
00000000000c6960	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000c6964	mov	x27, x0
00000000000c6968	mov	x26, x1
00000000000c696c	scvtf	s0, w27
00000000000c6970	lsr	x8, x0, #32
00000000000c6974	scvtf	s1, w8
00000000000c6978	scvtf	s2, w26
00000000000c697c	lsr	x8, x1, #32
00000000000c6980	scvtf	s3, w8
00000000000c6984	ldr	x8, [x24]
00000000000c6988	ldr	x8, [x8, #0x60]
00000000000c698c	mov	x0, x24
00000000000c6990	mov	w1, #0x0
00000000000c6994	blr	x8
00000000000c6998	mov	w0, #0x1d0
00000000000c699c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c69a0	mov	x25, x0
00000000000c69a4	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
00000000000c69a8	mov	x0, x25
00000000000c69ac	mov	w1, #0x3
00000000000c69b0	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
00000000000c69b4	ldr	x8, [x25]
00000000000c69b8	ldr	x8, [x8, #0x78]
00000000000c69bc	mov	x0, x25
00000000000c69c0	mov	w1, #0x0
00000000000c69c4	mov	x2, x24
00000000000c69c8	blr	x8
00000000000c69cc	mov	w0, #0x1a0
00000000000c69d0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c69d4	mov	x28, x0
00000000000c69d8	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
00000000000c69dc	ldr	x8, [x28]
00000000000c69e0	ldr	x8, [x8, #0x78]
00000000000c69e4	mov	x0, x28
00000000000c69e8	mov	w1, #0x0
00000000000c69ec	mov	x2, x25
00000000000c69f0	blr	x8
00000000000c69f4	sub	w0, w27, #0x1
00000000000c69f8	lsr	x8, x27, #32
00000000000c69fc	sub	w1, w8, #0x1
00000000000c6a00	lsr	x8, x26, #32
00000000000c6a04	add	w2, w26, #0x1
00000000000c6a08	add	w3, w8, #0x1
00000000000c6a0c	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000c6a10	scvtf	s0, w0
00000000000c6a14	lsr	x8, x0, #32
00000000000c6a18	scvtf	s1, w8
00000000000c6a1c	scvtf	s2, w1
00000000000c6a20	lsr	x8, x1, #32
00000000000c6a24	scvtf	s3, w8
00000000000c6a28	ldr	x8, [x28]
00000000000c6a2c	ldr	x8, [x8, #0x60]
00000000000c6a30	mov	x0, x28
00000000000c6a34	mov	w1, #0x0
00000000000c6a38	blr	x8
00000000000c6a3c	mov	w0, #0x210
00000000000c6a40	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c6a44	mov	x26, x0
00000000000c6a48	bl	0x2518ac ; symbol stub for: __ZN7HGXFormC1Ev
00000000000c6a4c	add	x0, sp, #0x1f0
00000000000c6a50	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000c6a54	add	x0, sp, #0x1f0
00000000000c6a58	movi.2d	v2, #0000000000000000
00000000000c6a5c	ldp	d1, d0, [sp, #0x8]
00000000000c6a60	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
00000000000c6a64	ldr	x8, [x26]
00000000000c6a68	ldr	x8, [x8, #0x78]
00000000000c6a6c	mov	x0, x26
00000000000c6a70	mov	w1, #0x0
00000000000c6a74	mov	x2, x28
00000000000c6a78	blr	x8
00000000000c6a7c	ldr	x8, [x26]
00000000000c6a80	ldr	x8, [x8, #0x230]
00000000000c6a84	add	x1, sp, #0x1f0
00000000000c6a88	mov	x0, x26
00000000000c6a8c	blr	x8
00000000000c6a90	movi.2d	v0, #0000000000000000
00000000000c6a94	stur	q0, [x19, #0x8]
00000000000c6a98	stur	q0, [x19, #0x18]
00000000000c6a9c	stur	q0, [x19, #0x28]
00000000000c6aa0	str	wzr, [sp, #0x394]
00000000000c6aa4	str	s14, [sp, #0x35c]
00000000000c6aa8	str	s9, [sp, #0x360]
00000000000c6aac	ldur	s0, [x29, #-0xbc]
00000000000c6ab0	ldur	s1, [x29, #-0xb0]
00000000000c6ab4	str	s0, [sp, #0x368]
00000000000c6ab8	str	s15, [sp, #0x36c]
00000000000c6abc	str	s11, [sp, #0x370]
00000000000c6ac0	str	s1, [sp, #0x378]
00000000000c6ac4	mov	w8, #0x3f800000
00000000000c6ac8	str	w8, [sp, #0x384]
00000000000c6acc	str	s10, [sp, #0x38c]
00000000000c6ad0	str	s8, [sp, #0x390]
00000000000c6ad4	ldur	s0, [x29, #-0xa4]
00000000000c6ad8	str	s0, [sp, #0x398]
00000000000c6adc	add	x0, sp, #0x160
00000000000c6ae0	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000c6ae4	add	x0, sp, #0x160
00000000000c6ae8	add	x1, sp, #0x35c
00000000000c6aec	bl	0x250f4c ; symbol stub for: __ZN11HGTransform11LoadMatrixfEPKf
00000000000c6af0	add	x0, sp, #0x160
00000000000c6af4	bl	0x250f70 ; symbol stub for: __ZN11HGTransform6InvertEv
00000000000c6af8	add	x8, sp, #0xe0
00000000000c6afc	mov	x0, x21
00000000000c6b00	mov	x2, x20
00000000000c6b04	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000c6b08	add	x0, sp, #0x50
00000000000c6b0c	bl	0x250fb8 ; symbol stub for: __ZN11HGTransformC1Ev
00000000000c6b10	add	x0, sp, #0x50
00000000000c6b14	movi.2d	v2, #0000000000000000
00000000000c6b18	ldp	d1, d0, [sp, #0x28]
00000000000c6b1c	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
00000000000c6b20	ldr	d0, [sp, #0x108]
00000000000c6b24	fcmp	d0, #0.0
00000000000c6b28	fmov	d0, #-1.00000000
00000000000c6b2c	fmov	d1, #1.00000000
00000000000c6b30	fcsel	d1, d1, d0, mi
00000000000c6b34	add	x0, sp, #0x50
00000000000c6b38	fmov	d0, #1.00000000
00000000000c6b3c	fmov	d2, #1.00000000
00000000000c6b40	bl	0x250f64 ; symbol stub for: __ZN11HGTransform5ScaleEddd
00000000000c6b44	add	x0, sp, #0x50
00000000000c6b48	add	x1, sp, #0x160
00000000000c6b4c	bl	0x250f94 ; symbol stub for: __ZN11HGTransform8MultiplyEPKS_
00000000000c6b50	add	x0, sp, #0x50
00000000000c6b54	movi.2d	v2, #0000000000000000
00000000000c6b58	ldp	d1, d0, [sp, #0x8]
00000000000c6b5c	bl	0x250fa0 ; symbol stub for: __ZN11HGTransform9TranslateEddd
00000000000c6b60	add	x0, sp, #0x50
00000000000c6b64	bl	0x250f70 ; symbol stub for: __ZN11HGTransform6InvertEv
00000000000c6b68	add	x0, sp, #0x50
00000000000c6b6c	bl	0x251d68 ; symbol stub for: __ZNK11HGTransform12GetMatrixPtrEv
00000000000c6b70	mov	x27, x0
00000000000c6b74	mov	w0, #0x1b0
00000000000c6b78	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000c6b7c	mov	x19, x0
00000000000c6b80	bl	__ZN18HgcPerspectiveTileC2Ev
00000000000c6b84	adrp	x8, 727 ; 0x39d000
00000000000c6b88	add	x8, x8, #0xad8
00000000000c6b8c	add	x9, x8, #0x10
00000000000c6b90	str	x9, [x19]
00000000000c6b94	str	x19, [sp, #0x48]
00000000000c6b98	ldr	x8, [x8, #0x88]
00000000000c6b9c	mov	x0, x19
00000000000c6ba0	mov	w1, #0x0
00000000000c6ba4	mov	x2, x26
00000000000c6ba8	blr	x8
00000000000c6bac	ldr	x0, [sp, #0x48]
00000000000c6bb0	ldr	x8, [x0]
00000000000c6bb4	ldr	x8, [x8, #0x88]
00000000000c6bb8	mov	w1, #0x0
00000000000c6bbc	mov	w2, #0x2
00000000000c6bc0	blr	x8
00000000000c6bc4	ldr	x0, [sp, #0x48]
00000000000c6bc8	fcvt	s0, d12
00000000000c6bcc	fcvt	s1, d13
00000000000c6bd0	ldp	d3, d2, [sp, #0x28]
00000000000c6bd4	fcvt	s2, d2
00000000000c6bd8	fcvt	s3, d3
00000000000c6bdc	ldr	x8, [x0]
00000000000c6be0	ldr	x8, [x8, #0x60]
00000000000c6be4	mov	w1, #0x0
00000000000c6be8	blr	x8
00000000000c6bec	ldr	x0, [sp, #0x48]
00000000000c6bf0	ldr	d0, [x27]
00000000000c6bf4	fcvt	s0, d0
00000000000c6bf8	ldr	d1, [x27, #0x20]
00000000000c6bfc	fcvt	s1, d1
00000000000c6c00	ldr	d2, [x27, #0x40]
00000000000c6c04	fcvt	s2, d2
00000000000c6c08	ldr	d3, [x27, #0x60]
00000000000c6c0c	fcvt	s3, d3
00000000000c6c10	ldr	x8, [x0]
00000000000c6c14	ldr	x8, [x8, #0x60]
00000000000c6c18	mov	w1, #0x1
00000000000c6c1c	blr	x8
00000000000c6c20	ldr	x0, [sp, #0x48]
00000000000c6c24	ldr	d0, [x27, #0x8]
00000000000c6c28	fcvt	s0, d0
00000000000c6c2c	ldr	d1, [x27, #0x28]
00000000000c6c30	fcvt	s1, d1
00000000000c6c34	ldr	d2, [x27, #0x48]
00000000000c6c38	fcvt	s2, d2
00000000000c6c3c	ldr	d3, [x27, #0x68]
00000000000c6c40	fcvt	s3, d3
00000000000c6c44	ldr	x8, [x0]
00000000000c6c48	ldr	x8, [x8, #0x60]
00000000000c6c4c	mov	w1, #0x2
00000000000c6c50	blr	x8
00000000000c6c54	ldr	x0, [sp, #0x48]
00000000000c6c58	ldr	d0, [x27, #0x10]
00000000000c6c5c	fcvt	s0, d0
00000000000c6c60	ldr	d1, [x27, #0x30]
00000000000c6c64	fcvt	s1, d1
00000000000c6c68	ldr	d2, [x27, #0x50]
00000000000c6c6c	fcvt	s2, d2
00000000000c6c70	ldr	d3, [x27, #0x70]
00000000000c6c74	fcvt	s3, d3
00000000000c6c78	ldr	x8, [x0]
00000000000c6c7c	ldr	x8, [x8, #0x60]
00000000000c6c80	mov	w1, #0x3
00000000000c6c84	blr	x8
00000000000c6c88	ldr	x0, [sp, #0x48]
00000000000c6c8c	ldr	d0, [x27, #0x18]
00000000000c6c90	fcvt	s0, d0
00000000000c6c94	ldr	d1, [x27, #0x38]
00000000000c6c98	fcvt	s1, d1
00000000000c6c9c	ldr	d2, [x27, #0x58]
00000000000c6ca0	fcvt	s2, d2
00000000000c6ca4	ldr	d3, [x27, #0x78]
00000000000c6ca8	fcvt	s3, d3
00000000000c6cac	ldr	x8, [x0]
00000000000c6cb0	ldr	x8, [x8, #0x60]
00000000000c6cb4	mov	w1, #0x4
00000000000c6cb8	blr	x8
00000000000c6cbc	ldr	x8, [sp, #0x48]
00000000000c6cc0	ldp	x10, x9, [sp, #0x18]
00000000000c6cc4	stp	x10, x9, [x8, #0x1a0]
00000000000c6cc8	add	x2, sp, #0x48
00000000000c6ccc	mov	x0, x21
00000000000c6cd0	mov	x3, x20
00000000000c6cd4	ldr	x4, [sp, #0x38]
00000000000c6cd8	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000c6cdc	ldr	x0, [sp, #0x48]
00000000000c6ce0	str	x0, [sp, #0x40]
00000000000c6ce4	cbz	x0, 0xc6cf4
00000000000c6ce8	ldr	x8, [x0]
00000000000c6cec	ldr	x8, [x8, #0x10]
00000000000c6cf0	blr	x8
00000000000c6cf4	add	x2, sp, #0x40
00000000000c6cf8	ldr	x0, [sp, #0x38]
00000000000c6cfc	bl	"_objc_msgSend$setHeliumRef:"
00000000000c6d00	ldr	x0, [sp, #0x40]
```
