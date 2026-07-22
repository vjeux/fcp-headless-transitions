# Comic

- **PAE class:** `Comic`
- **Plugin UUID:** `3C6550FA-14A0-45A3-8CD7-C70C58F7B330`
- **Node names in corpus:** Comic (14), Comic Source (3)
- **Corpus usage:** 14 files, 17 instances

## What it does

Comic stylizes the image into a comic-book look: it posterizes colors into flat regions, inks the edges with black outlines, and optionally recolors ink/fill. Style picks the overall treatment, Ink Edges/Smoothness shape the outlines, and Posterize Levels sets how flat the color regions are.

> **Note.** Not implemented; description is the standard Apple Motion "Comic" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Style | enum(int) | 0 | 0 .. 2 | Overall comic treatment preset (0-2). |
| Ink Color | color | - | - | Color of the inked outlines. |
| Fill Color | color | - | - | Base fill color used by some styles. |
| Ink Edges | float | 0.25 | 0 .. 1 | How strongly edges are inked, 0-1 (default 0.25). |
| Ink Smoothness | float | 0.3 | 0 .. 1 | Smoothness of the ink outlines, 0-1 (default 0.3). |
| Ink Fill | float | 0.5 | 0 .. 0.5 | Amount of ink fill in dark regions, 0-0.5 (default 0.5). |
| Posterize Levels | enum(int) | 6 | 2 .. 6 | Number of flat color levels, 2-6 (default 6). |
| Affect Alpha | bool | 0 | 0 .. 0 | Whether the effect also modifies the alpha channel. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 4 instances)* |
| Smoothness | bool | 0.25 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcColorize`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcColorize` → [`HgcColorize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorize.metal)

```metal
//Metal1.0     
//LEN=0000000208
[[ visible ]] FragmentOut HgcColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r1.w = dot(r1.xyz, hg_Params[4].xyz);
    r2.xyz = mix(hg_Params[0].xyz, hg_Params[1].xyz, r1.www);
    r1.xyz = mix(r1.xyz, r2.xyz, hg_Params[2].xyz);
    r1.w = r0.w;
    r1.xyz = r1.xyz*r0.www;
    output.color0 = mix(r0, r1, hg_Params[3]);
    return output;
}
```

### CPU parameter wiring — `-[PAEComic canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEComic`

```asm
00000000000fbcc0	mov	w3, #0x1
00000000000fbcc4	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000fbcc8	ldr	x4, [x22]
00000000000fbccc	add	x2, sp, #0x88
00000000000fbcd0	mov	x0, x24
00000000000fbcd4	mov	w3, #0x4
00000000000fbcd8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fbcdc	ldr	x4, [x22]
00000000000fbce0	add	x2, sp, #0x80
00000000000fbce4	mov	x0, x24
00000000000fbce8	mov	w3, #0x5
00000000000fbcec	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fbcf0	ldr	x4, [x22]
00000000000fbcf4	add	x2, sp, #0x78
00000000000fbcf8	mov	x0, x24
00000000000fbcfc	mov	w3, #0x6
00000000000fbd00	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fbd04	ldr	x4, [x22]
00000000000fbd08	add	x2, sp, #0x6c
00000000000fbd0c	mov	x0, x24
00000000000fbd10	mov	w3, #0x8
00000000000fbd14	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
00000000000fbd18	ldr	x4, [x22]
00000000000fbd1c	add	x2, sp, #0x70
00000000000fbd20	mov	x0, x24
00000000000fbd24	mov	w3, #0x7
00000000000fbd28	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000fbd2c	mov	w0, #0x1a0
00000000000fbd30	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000fbd34	mov	x19, x0
00000000000fbd38	bl	0x2515f4 ; symbol stub for: __ZN24HGComicDesignerInterfaceC1Ev
00000000000fbd3c	str	xzr, [sp, #0x60]
00000000000fbd40	cbz	x25, 0xfbd54
00000000000fbd44	add	x8, sp, #0x58
00000000000fbd48	mov	x0, x25
00000000000fbd4c	bl	_objc_msgSend$heliumRef
00000000000fbd50	b	0xfbd58
00000000000fbd54	str	xzr, [sp, #0x58]
00000000000fbd58	mov	w0, #0x1d0
00000000000fbd5c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000fbd60	mov	x21, x0
00000000000fbd64	bl	0x2511a4 ; symbol stub for: __ZN13HGTextureWrapC1Ev
00000000000fbd68	mov	x0, x21
00000000000fbd6c	mov	w1, #0x0
00000000000fbd70	bl	0x25118c ; symbol stub for: __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
00000000000fbd74	add	x27, sp, #0x88
00000000000fbd78	stp	xzr, xzr, [x27, #0x10]
00000000000fbd7c	sub	x1, x29, #0x78
00000000000fbd80	mov	x0, x21
00000000000fbd84	bl	0x251198 ; symbol stub for: __ZN13HGTextureWrap21SetTextureBorderColorEPKf
00000000000fbd88	ldr	x2, [sp, #0x58]
00000000000fbd8c	ldr	x8, [x21]
00000000000fbd90	ldr	x8, [x8, #0x78]
00000000000fbd94	mov	x0, x21
00000000000fbd98	mov	w1, #0x0
00000000000fbd9c	blr	x8
00000000000fbda0	ldr	x8, [x19]
00000000000fbda4	ldr	x8, [x8, #0x78]
00000000000fbda8	mov	x0, x19
00000000000fbdac	mov	w1, #0x0
00000000000fbdb0	mov	x2, x21
00000000000fbdb4	blr	x8
00000000000fbdb8	ldr	d0, [x27]
00000000000fbdbc	mov	x8, #0x4059000000000000
00000000000fbdc0	fmov	d1, x8
00000000000fbdc4	fmul	d0, d0, d1
00000000000fbdc8	fcvt	s0, d0
00000000000fbdcc	ldr	x8, [x19]
00000000000fbdd0	ldr	x8, [x8, #0x60]
00000000000fbdd4	movi.2d	v1, #0000000000000000
00000000000fbdd8	movi.2d	v2, #0000000000000000
00000000000fbddc	movi.2d	v3, #0000000000000000
00000000000fbde0	mov	x0, x19
00000000000fbde4	mov	w1, #0x0
00000000000fbde8	blr	x8
00000000000fbdec	ldr	d0, [sp, #0x80]
00000000000fbdf0	fmov	d1, #1.00000000
00000000000fbdf4	fsub	d0, d1, d0
00000000000fbdf8	mov	x8, #0x4059000000000000
00000000000fbdfc	fmov	d1, x8
00000000000fbe00	fmul	d0, d0, d1
00000000000fbe04	fcvt	s0, d0
00000000000fbe08	ldr	x8, [x19]
00000000000fbe0c	ldr	x8, [x8, #0x60]
00000000000fbe10	movi.2d	v1, #0000000000000000
00000000000fbe14	movi.2d	v2, #0000000000000000
00000000000fbe18	movi.2d	v3, #0000000000000000
00000000000fbe1c	mov	x0, x19
00000000000fbe20	mov	w1, #0x1
00000000000fbe24	blr	x8
00000000000fbe28	ldr	d0, [sp, #0x78]
00000000000fbe2c	mov	x8, #0x4059000000000000
00000000000fbe30	fmov	d1, x8
00000000000fbe34	fmul	d0, d0, d1
00000000000fbe38	fcvt	s0, d0
00000000000fbe3c	ldr	x8, [x19]
00000000000fbe40	ldr	x8, [x8, #0x60]
00000000000fbe44	movi.2d	v1, #0000000000000000
00000000000fbe48	movi.2d	v2, #0000000000000000
00000000000fbe4c	movi.2d	v3, #0000000000000000
00000000000fbe50	mov	x0, x19
00000000000fbe54	mov	w1, #0x2
00000000000fbe58	blr	x8
00000000000fbe5c	ldr	s0, [sp, #0x6c]
00000000000fbe60	scvtf	s0, s0
00000000000fbe64	ldr	x8, [x19]
00000000000fbe68	ldr	x8, [x8, #0x60]
00000000000fbe6c	movi.2d	v1, #0000000000000000
00000000000fbe70	movi.2d	v2, #0000000000000000
00000000000fbe74	movi.2d	v3, #0000000000000000
00000000000fbe78	mov	x0, x19
00000000000fbe7c	mov	w1, #0x4
00000000000fbe80	blr	x8
00000000000fbe84	ldr	x8, [x19]
00000000000fbe88	ldr	x8, [x8, #0x60]
00000000000fbe8c	mov	w9, #0x44340000
00000000000fbe90	fmov	s0, w9
00000000000fbe94	movi.2d	v1, #0000000000000000
00000000000fbe98	movi.2d	v2, #0000000000000000
00000000000fbe9c	movi.2d	v3, #0000000000000000
00000000000fbea0	mov	x0, x19
00000000000fbea4	mov	w1, #0x5
00000000000fbea8	blr	x8
00000000000fbeac	ldr	d0, [sp, #0x70]
00000000000fbeb0	mov	x8, #0x4059000000000000
00000000000fbeb4	fmov	d1, x8
00000000000fbeb8	fmul	d0, d0, d1
00000000000fbebc	fcvt	s0, d0
00000000000fbec0	ldr	x8, [x19]
00000000000fbec4	ldr	x8, [x8, #0x60]
00000000000fbec8	movi.2d	v1, #0000000000000000
00000000000fbecc	movi.2d	v2, #0000000000000000
00000000000fbed0	movi.2d	v3, #0000000000000000
00000000000fbed4	mov	x0, x19
00000000000fbed8	mov	w1, #0x7
00000000000fbedc	blr	x8
00000000000fbee0	ldr	x8, [x19]
00000000000fbee4	ldr	x8, [x8, #0x60]
00000000000fbee8	fmov	s0, #-1.00000000
00000000000fbeec	movi.2d	v1, #0000000000000000
00000000000fbef0	movi.2d	v2, #0000000000000000
00000000000fbef4	movi.2d	v3, #0000000000000000
00000000000fbef8	mov	x0, x19
00000000000fbefc	mov	w1, #0x3
00000000000fbf00	blr	x8
00000000000fbf04	ldr	x8, [x19]
00000000000fbf08	ldr	x8, [x8, #0x60]
00000000000fbf0c	fmov	s0, #1.00000000
00000000000fbf10	movi.2d	v1, #0000000000000000
00000000000fbf14	movi.2d	v2, #0000000000000000
00000000000fbf18	movi.2d	v3, #0000000000000000
00000000000fbf1c	mov	x0, x19
00000000000fbf20	mov	w1, #0xb
00000000000fbf24	blr	x8
00000000000fbf28	ldr	x8, [x19]
00000000000fbf2c	ldr	x8, [x8, #0x60]
00000000000fbf30	fmov	s0, #1.00000000
00000000000fbf34	movi.2d	v1, #0000000000000000
00000000000fbf38	movi.2d	v2, #0000000000000000
00000000000fbf3c	movi.2d	v3, #0000000000000000
00000000000fbf40	mov	x0, x19
00000000000fbf44	mov	w1, #0xc
00000000000fbf48	blr	x8
00000000000fbf4c	ldr	x8, [x19]
00000000000fbf50	ldr	x8, [x8, #0x60]
00000000000fbf54	fmov	s0, #1.00000000
00000000000fbf58	movi.2d	v1, #0000000000000000
00000000000fbf5c	movi.2d	v2, #0000000000000000
00000000000fbf60	movi.2d	v3, #0000000000000000
00000000000fbf64	mov	x0, x19
00000000000fbf68	mov	w1, #0xa
00000000000fbf6c	blr	x8
00000000000fbf70	mov	x0, x20
00000000000fbf74	bl	_objc_msgSend$dod
00000000000fbf78	mov	x2, x1
00000000000fbf7c	lsr	x1, x0, #32
00000000000fbf80	lsr	x3, x2, #32
00000000000fbf84	bl	0x250a48 ; symbol stub for: _HGRectMake4i
00000000000fbf88	scvtf	s0, w0
00000000000fbf8c	lsr	x8, x0, #32
00000000000fbf90	scvtf	s1, w8
00000000000fbf94	scvtf	s2, w1
00000000000fbf98	lsr	x8, x1, #32
00000000000fbf9c	scvtf	s3, w8
00000000000fbfa0	ldr	x8, [x19]
00000000000fbfa4	ldr	x8, [x8, #0x60]
00000000000fbfa8	mov	x0, x19
00000000000fbfac	mov	w1, #0x8
00000000000fbfb0	blr	x8
00000000000fbfb4	add	x8, sp, #0x48
00000000000fbfb8	mov	x0, x26
00000000000fbfbc	mov	x2, x25
00000000000fbfc0	bl	"_objc_msgSend$getScaleForImage:"
00000000000fbfc4	ldp	d0, d1, [sp, #0x48]
00000000000fbfc8	fcvt	s0, d0
00000000000fbfcc	fcvt	s1, d1
00000000000fbfd0	ldr	x8, [x19]
00000000000fbfd4	ldr	x8, [x8, #0x60]
00000000000fbfd8	movi.2d	v2, #0000000000000000
00000000000fbfdc	movi.2d	v3, #0000000000000000
00000000000fbfe0	mov	x0, x19
00000000000fbfe4	mov	w1, #0x9
00000000000fbfe8	blr	x8
00000000000fbfec	ldr	w8, [x27, #0xc]
00000000000fbff0	cmp	w8, #0x1
00000000000fbff4	b.eq	0xfc1d8
00000000000fbff8	cmp	w8, #0x2
00000000000fbffc	b.ne	0xfc1e0
00000000000fc000	ldr	x7, [x22]
00000000000fc004	add	x2, sp, #0x40
00000000000fc008	add	x3, sp, #0x38
00000000000fc00c	add	x4, sp, #0x30
00000000000fc010	add	x5, sp, #0x28
00000000000fc014	mov	x0, x24
00000000000fc018	mov	w6, #0x2
00000000000fc01c	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:alphaValue:fromParm:atFxTime:"
00000000000fc020	ldr	x7, [x22]
00000000000fc024	add	x2, sp, #0x20
00000000000fc028	add	x3, sp, #0x18
00000000000fc02c	add	x4, sp, #0x10
00000000000fc030	add	x5, sp, #0x8
00000000000fc034	mov	x0, x24
00000000000fc038	mov	w6, #0x3
00000000000fc03c	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:alphaValue:fromParm:atFxTime:"
00000000000fc040	ldr	x4, [x22]
00000000000fc044	add	x2, sp, #0x7
00000000000fc048	mov	x0, x24
00000000000fc04c	mov	w3, #0x9
00000000000fc050	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000fc054	ldr	x8, [x19]
00000000000fc058	ldr	x8, [x8, #0x60]
00000000000fc05c	movi.2d	v8, #0000000000000000
00000000000fc060	fmov	s0, #24.00000000
00000000000fc064	movi.2d	v1, #0000000000000000
00000000000fc068	movi.2d	v2, #0000000000000000
00000000000fc06c	movi.2d	v3, #0000000000000000
00000000000fc070	mov	x0, x19
00000000000fc074	mov	w1, #0x6
00000000000fc078	blr	x8
00000000000fc07c	ldrb	w8, [sp, #0x7]
00000000000fc080	cmp	w8, #0x0
00000000000fc084	fmov	s0, #1.00000000
00000000000fc088	fcsel	s0, s8, s0, ne
00000000000fc08c	ldr	x8, [x19]
00000000000fc090	ldr	x8, [x8, #0x60]
00000000000fc094	movi.2d	v1, #0000000000000000
00000000000fc098	movi.2d	v2, #0000000000000000
00000000000fc09c	movi.2d	v3, #0000000000000000
00000000000fc0a0	mov	x0, x19
00000000000fc0a4	mov	w1, #0xa
00000000000fc0a8	blr	x8
00000000000fc0ac	mov	w0, #0x1a0
00000000000fc0b0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000fc0b4	mov	x24, x0
00000000000fc0b8	bl	__ZN11HgcColorizeC1Ev
00000000000fc0bc	ldr	x8, [x24]
00000000000fc0c0	ldr	x8, [x8, #0x78]
00000000000fc0c4	mov	x0, x24
00000000000fc0c8	mov	w1, #0x0
00000000000fc0cc	mov	x2, x19
00000000000fc0d0	blr	x8
00000000000fc0d4	ldp	d1, d0, [sp, #0x38]
00000000000fc0d8	fcvt	s0, d0
00000000000fc0dc	fcvt	s1, d1
00000000000fc0e0	ldr	d2, [sp, #0x30]
00000000000fc0e4	fcvt	s2, d2
00000000000fc0e8	ldr	x8, [x24]
00000000000fc0ec	ldr	x8, [x8, #0x60]
00000000000fc0f0	movi.2d	v3, #0000000000000000
00000000000fc0f4	mov	x0, x24
00000000000fc0f8	mov	w1, #0x0
00000000000fc0fc	blr	x8
00000000000fc100	ldp	d1, d0, [sp, #0x18]
00000000000fc104	fcvt	s0, d0
00000000000fc108	fcvt	s1, d1
00000000000fc10c	ldr	d2, [sp, #0x10]
00000000000fc110	fcvt	s2, d2
00000000000fc114	ldr	x8, [x24]
00000000000fc118	ldr	x8, [x8, #0x60]
00000000000fc11c	movi.2d	v3, #0000000000000000
00000000000fc120	mov	x0, x24
00000000000fc124	mov	w1, #0x1
00000000000fc128	blr	x8
00000000000fc12c	ldr	x8, [x24]
00000000000fc130	ldr	x8, [x8, #0x60]
00000000000fc134	fmov	s0, #1.00000000
00000000000fc138	movi.2d	v1, #0000000000000000
00000000000fc13c	movi.2d	v2, #0000000000000000
00000000000fc140	movi.2d	v3, #0000000000000000
00000000000fc144	mov	x0, x24
00000000000fc148	mov	w1, #0x2
00000000000fc14c	blr	x8
00000000000fc150	ldr	x8, [x24]
00000000000fc154	ldr	x8, [x8, #0x60]
00000000000fc158	fmov	s0, #1.00000000
00000000000fc15c	movi.2d	v1, #0000000000000000
00000000000fc160	movi.2d	v2, #0000000000000000
00000000000fc164	movi.2d	v3, #0000000000000000
00000000000fc168	mov	x0, x24
00000000000fc16c	mov	w1, #0x3
00000000000fc170	blr	x8
00000000000fc174	ldr	x2, [x22]
00000000000fc178	mov	x0, x23
00000000000fc17c	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000fc180	bl	_objc_msgSend$matrix
00000000000fc184	ldp	d0, d1, [x0]
00000000000fc188	fcvt	s0, d0
00000000000fc18c	fcvt	s1, d1
00000000000fc190	ldr	d2, [x0, #0x10]
00000000000fc194	fcvt	s2, d2
00000000000fc198	ldr	x8, [x24]
00000000000fc19c	ldr	x8, [x8, #0x60]
00000000000fc1a0	movi.2d	v3, #0000000000000000
00000000000fc1a4	mov	x0, x24
00000000000fc1a8	mov	w1, #0x4
00000000000fc1ac	blr	x8
00000000000fc1b0	ldr	x8, [x24]
00000000000fc1b4	ldr	x8, [x8, #0x10]
00000000000fc1b8	str	x24, [sp, #0x60]
00000000000fc1bc	mov	x0, x24
00000000000fc1c0	blr	x8
00000000000fc1c4	ldr	x8, [x24]
00000000000fc1c8	ldr	x8, [x8, #0x18]
00000000000fc1cc	mov	x0, x24
00000000000fc1d0	blr	x8
00000000000fc1d4	b	0xfc218
00000000000fc1d8	fmov	s0, #10.00000000
00000000000fc1dc	b	0xfc1e4
00000000000fc1e0	fmov	s0, #7.00000000
00000000000fc1e4	ldr	x8, [x19]
00000000000fc1e8	ldr	x8, [x8, #0x60]
00000000000fc1ec	movi.2d	v1, #0000000000000000
00000000000fc1f0	movi.2d	v2, #0000000000000000
00000000000fc1f4	movi.2d	v3, #0000000000000000
00000000000fc1f8	mov	x0, x19
00000000000fc1fc	mov	w1, #0x6
00000000000fc200	blr	x8
00000000000fc204	ldr	x8, [x19]
00000000000fc208	ldr	x8, [x8, #0x10]
00000000000fc20c	str	x19, [sp, #0x60]
00000000000fc210	mov	x0, x19
00000000000fc214	blr	x8
00000000000fc218	add	x2, sp, #0x60
00000000000fc21c	mov	x0, x20
00000000000fc220	bl	"_objc_msgSend$setHeliumRef:"
00000000000fc224	ldr	x8, [x21]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (int)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)
    - parm8 (int)
    - parm7 (float)
    - parm9 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  parm5 (float)
    slot 2  <-  parm6 (float)
    slot 4  <-  parm8 (int)
    slot 5  <-  (constant / computed)
    slot 7  <-  parm7 (float)
    slot 3  <-  (constant / computed)
    slot 11  <-  (constant / computed)
    slot 12  <-  (constant / computed)
    slot 10  <-  (constant / computed)
    slot 8  <-  (constant / computed)
    slot 9  <-  (constant / computed)
    slot 6  <-  (constant / computed)
    slot 10  <-  (constant / computed)
    slot 0  <-  parm9 (bool)
    slot 1  <-  parm9 (bool)
    slot 2  <-  (constant / computed)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
    slot 6  <-  (constant / computed)
```
