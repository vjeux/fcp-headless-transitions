# Bad Film

- **PAE class:** `Bad Film`
- **Plugin UUID:** `9B5C17D9-1AC3-4B04-B8F3-59C1420963BF`
- **Node names in corpus:** Bad Film (451), Bad Film copy (11), Bad Film 2 (11), Bad Film 1 (11), Bad Film 7 (2), Bad Film 6 (2)
- **Corpus usage:** 231 files, 500 instances

## What it does

Bad Film emulates aged/damaged film: it adds dust, hairs, scratches, random per-frame brightness and saturation flicker, focus wobble, and frame jitter to make clean footage look like a scratched print. It is a heavily-parameterized "vintage projector" effect with independent Amount and Variance controls for each artifact type. FCP's HgcBadFilm shader (a brightness/saturation/tint pass over the source) is checked in; the dust/scratch/hair layers are generated separately.

> **Note.** HgcBadFilm shader is checked in but the full filter (procedural dust/scratch/hair generation) is not implemented in TS. Corpus dropped 13 localized (non-English) parameter duplicates. Descriptions of the artifact knobs follow the standard Motion "Bad Film" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Focus Amount | float | 0 | 0 .. 64 | Maximum defocus/blur applied by the wobble, 0-64. 0 = always sharp. *(keyframed in 1 instance)* |
| Focus Variance | float | 1 | 0 .. 100 | How much the focus randomly varies frame to frame, 0-100. *(keyframed in 1 instance)* |
| Brightness Amount | float | 1 | 0.5 .. 5 | Base brightness multiplier of the aged look, 0.5-5. |
| Brightness Variance | float | 0.34 | 0 .. 2.5 | Random per-frame brightness flicker amount, 0-2.5. |
| Saturate Amount | float | -50 | -100 .. 58 | Base saturation shift, -100..58 (negative desaturates toward a faded print). |
| Saturate Variance | float | 5 | 0 .. 100 | Random per-frame saturation flicker, 0-100. |
| Scratches | float | 1 | 0 .. 20 | Density of vertical scratch lines, 0-20. |
| Scratch Color | color | - | - | Color of the scratches (nested Red/Green/Blue/Opacity). |
| Hairs | enum(int) | 1 | 0 .. 10 | Number of stray hair/fiber artifacts overlaid, 0-10. |
| Dust | float | 4 | 0 .. 100 | Density of dust specks, 0-100. |
| Jitter Amount | float | 0 | 0 .. 1 | Amount of frame position jitter (gate weave), 0-1. |
| Jitter Variance | float | 0.05 | 0 .. 0.5 | How much the jitter magnitude varies, 0-0.5. |
| Frequency of Change | float | 3 | 0 .. 100 | How often the random artifacts re-roll, 0-100 (higher = more frantic flicker). |
| Grain | float | 0 | 0 .. 1 | Film-grain noise amount, 0-1. Continuous float, heavily keyframed. *(keyframed in 176 instances)* |
| Random Seed | float (int seed) | 25 | 0 .. 1000 | Seed for the artifact RNG; changing it reshuffles the dust/scratch/jitter pattern. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the aged result over the clean original, 0-1 continuous. *(keyframed in 45 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcBadFilm` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcBadFilm.metal` (Phase-1 done, Phase-2 open).

> 13 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcBadFilm`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBadFilm` → [`HgcBadFilm.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBadFilm.metal)

```metal
//Metal1.0     
//LEN=00000002ad
[[ visible ]] FragmentOut HgcBadFilm_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1.w = -r1.w + c0.w;
    r2.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r2.xyz = r1.www*r2.xyz + r1.xyz;
    r2.w = r0.w;
    r1.w = c0.w;
    r1.xyz = hg_Params[0].xyz;
    r1 = r2*r1;
    r1.w = dot(r1, hg_Params[2]);
    r1.xyz = mix(r1.www, r1.xyz, hg_Params[1].xyz);
    output.color0.xyz = r0.www*r1.xyz;
    output.color0.w = r0.w;
    return output;
}
```

### Metal fragment shader — `HgcBadFilmGrain`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBadFilmGrain` → [`HgcBadFilmGrain.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBadFilmGrain.metal)

```metal
//Metal1.0     
//LEN=0000000321
[[ visible ]] FragmentOut HgcBadFilmGrain_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1,
    float4 color2)
{
    const float4 c0 = float4(2.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1.xyz = r0.xyz / fmax(r0.w, 1.00000e-06f);
    r2.xyz = color2.xyz;
    r1.xyz = r2.xyz*c0.xxx + r1.xyz;
    r2 = color1;
    r2.w = -r2.w + c0.y;
    r1.xyz = r1.xyz - c0.yyy;
    r1.xyz = r2.www*r1.xyz + r2.xyz;
    r1.w = r0.w;
    r2.w = c0.y;
    r2.xyz = hg_Params[0].xyz;
    r2 = r1*r2;
    r2.w = dot(r2, hg_Params[2]);
    r2.xyz = mix(r2.www, r2.xyz, hg_Params[1].xyz);
    output.color0.xyz = r0.www*r2.xyz;
    output.color0.w = r0.w;
    return output;
}
```

### CPU parameter wiring — `-[PAEBadFilm canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBadFilm`

```asm
00000000000dbddc	mov	w3, #0x16
00000000000dbde0	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
00000000000dbde4	ldr	w2, [sp, #0x19c]
00000000000dbde8	ldr	w3, [sp, #0x198]
00000000000dbdec	ldr	w5, [sp, #0x194]
00000000000dbdf0	ldr	w6, [sp, #0x190]
00000000000dbdf4	ldr	w7, [sp, #0x174]
00000000000dbdf8	ldr	x8, [x25]
00000000000dbdfc	add	x9, sp, #0xf0
00000000000dbe00	stp	x8, x9, [sp, #0x8]
00000000000dbe04	str	x19, [sp]
00000000000dbe08	sub	x4, x29, #0x88
00000000000dbe0c	mov	x0, x26
00000000000dbe10	bl	"_objc_msgSend$createDust:scratches:scratchColor:hair:randomSeed:autoRandFreq:buffer:atTime:pixelTransform:"
00000000000dbe14	mov	w0, #0x1f0
00000000000dbe18	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000dbe1c	mov	x20, x0
00000000000dbe20	mov	x1, x19
00000000000dbe24	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
00000000000dbe28	add	x8, sp, #0xd8
00000000000dbe2c	mov	x0, x26
00000000000dbe30	mov	x2, x24
00000000000dbe34	bl	"_objc_msgSend$getScaleForImage:"
00000000000dbe38	ldr	x2, [x25]
00000000000dbe3c	mov	x0, x23
00000000000dbe40	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000dbe44	bl	_objc_msgSend$matrix
00000000000dbe48	mov	x27, x0
00000000000dbe4c	ldr	d0, [sp, #0x178]
00000000000dbe50	fcmp	d0, #0.0
00000000000dbe54	b.eq	0xdbee4
00000000000dbe58	add	x8, sp, #0x50
00000000000dbe5c	mov	x0, x26
00000000000dbe60	mov	x2, x24
00000000000dbe64	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000dbe68	ldp	x23, x28, [sp, #0x1b0]
00000000000dbe6c	ldr	x2, [x25]
00000000000dbe70	mov	x0, x26
00000000000dbe74	mov	x3, x26
00000000000dbe78	bl	"_objc_msgSend$frameFromFxTime:forPlugIn:"
00000000000dbe7c	mov.16b	v1, v0
00000000000dbe80	ldr	d0, [sp, #0x178]
00000000000dbe84	add	x8, sp, #0x48
00000000000dbe88	add	x6, sp, #0x50
00000000000dbe8c	mov	x0, x23
00000000000dbe90	mov	x1, x28
00000000000dbe94	mov	w2, #0x2
00000000000dbe98	mov	w3, #0x0
00000000000dbe9c	mov	w4, #0x1
00000000000dbea0	mov	w5, #0x0
00000000000dbea4	bl	0x250d78 ; symbol stub for: __Z16PAEGenerateNoiseii9NoiseTypedbdbiRK14PCMatrix44TmplIdE
00000000000dbea8	mov	w0, #0x1a0
00000000000dbeac	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000dbeb0	mov	x23, x0
00000000000dbeb4	bl	__ZN15HgcBadFilmGrainC1Ev
00000000000dbeb8	cbz	x23, 0xdbecc
00000000000dbebc	ldr	x8, [x23]
00000000000dbec0	ldr	x8, [x8, #0x10]
00000000000dbec4	mov	x0, x23
00000000000dbec8	blr	x8
00000000000dbecc	cbz	x24, 0xdbf58
00000000000dbed0	add	x8, sp, #0x40
00000000000dbed4	mov	x0, x24
00000000000dbed8	bl	_objc_msgSend$heliumRef
00000000000dbedc	ldr	x2, [sp, #0x40]
00000000000dbee0	b	0xdbf60
00000000000dbee4	mov	w0, #0x1a0
00000000000dbee8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000dbeec	mov	x23, x0
00000000000dbef0	movi.2d	v0, #0000000000000000
00000000000dbef4	stp	q0, q0, [x0, #0x180]
00000000000dbef8	stp	q0, q0, [x0, #0x160]
00000000000dbefc	stp	q0, q0, [x0, #0x140]
00000000000dbf00	stp	q0, q0, [x0, #0x120]
00000000000dbf04	stp	q0, q0, [x0, #0x100]
00000000000dbf08	stp	q0, q0, [x0, #0xe0]
00000000000dbf0c	stp	q0, q0, [x0, #0xc0]
00000000000dbf10	stp	q0, q0, [x0, #0xa0]
00000000000dbf14	stp	q0, q0, [x0, #0x80]
00000000000dbf18	stp	q0, q0, [x0, #0x60]
00000000000dbf1c	stp	q0, q0, [x0, #0x40]
00000000000dbf20	stp	q0, q0, [x0, #0x20]
00000000000dbf24	stp	q0, q0, [x0]
00000000000dbf28	bl	__ZN10HgcBadFilmC2Ev
00000000000dbf2c	adrp	x8, 700 ; 0x397000
00000000000dbf30	add	x8, x8, #0x1b0
00000000000dbf34	str	x8, [x23]
00000000000dbf38	mov	x0, x23
00000000000dbf3c	bl	0x251b28 ; symbol stub for: __ZN8HGObject6RetainEv
00000000000dbf40	cbz	x24, 0xdc05c
00000000000dbf44	add	x8, sp, #0x50
00000000000dbf48	mov	x0, x24
00000000000dbf4c	bl	_objc_msgSend$heliumRef
00000000000dbf50	ldr	x2, [sp, #0x50]
00000000000dbf54	b	0xdc064
00000000000dbf58	mov	x2, #0x0
00000000000dbf5c	str	xzr, [sp, #0x40]
00000000000dbf60	ldr	x8, [x23]
00000000000dbf64	ldr	x8, [x8, #0x78]
00000000000dbf68	mov	x0, x23
00000000000dbf6c	mov	w1, #0x0
00000000000dbf70	blr	x8
00000000000dbf74	ldr	x0, [sp, #0x40]
00000000000dbf78	cbz	x0, 0xdbf88
00000000000dbf7c	ldr	x8, [x0]
00000000000dbf80	ldr	x8, [x8, #0x18]
00000000000dbf84	blr	x8
00000000000dbf88	ldr	x8, [x23]
00000000000dbf8c	ldr	x8, [x8, #0x78]
00000000000dbf90	mov	x0, x23
00000000000dbf94	mov	w1, #0x1
00000000000dbf98	mov	x2, x20
00000000000dbf9c	blr	x8
00000000000dbfa0	ldr	x2, [sp, #0x48]
00000000000dbfa4	ldr	x8, [x23]
00000000000dbfa8	ldr	x8, [x8, #0x78]
00000000000dbfac	mov	x0, x23
00000000000dbfb0	mov	w1, #0x2
00000000000dbfb4	blr	x8
00000000000dbfb8	ldr	d0, [sp, #0x1a8]
00000000000dbfbc	fcvt	s0, d0
00000000000dbfc0	ldr	x8, [x23]
00000000000dbfc4	ldr	x8, [x8, #0x60]
00000000000dbfc8	movi.2d	v1, #0000000000000000
00000000000dbfcc	movi.2d	v2, #0000000000000000
00000000000dbfd0	movi.2d	v3, #0000000000000000
00000000000dbfd4	mov	x0, x23
00000000000dbfd8	mov	w1, #0x0
00000000000dbfdc	blr	x8
00000000000dbfe0	ldr	d0, [sp, #0x1a0]
00000000000dbfe4	fcvt	s0, d0
00000000000dbfe8	ldr	x8, [x23]
00000000000dbfec	ldr	x8, [x8, #0x60]
00000000000dbff0	movi.2d	v1, #0000000000000000
00000000000dbff4	movi.2d	v2, #0000000000000000
00000000000dbff8	movi.2d	v3, #0000000000000000
00000000000dbffc	mov	x0, x23
00000000000dc000	mov	w1, #0x1
00000000000dc004	blr	x8
00000000000dc008	ldp	d0, d1, [x27]
00000000000dc00c	fcvt	s0, d0
00000000000dc010	fcvt	s1, d1
00000000000dc014	ldr	d2, [x27, #0x10]
00000000000dc018	fcvt	s2, d2
00000000000dc01c	ldr	x8, [x23]
00000000000dc020	ldr	x8, [x8, #0x60]
00000000000dc024	movi.2d	v3, #0000000000000000
00000000000dc028	mov	x0, x23
00000000000dc02c	mov	w1, #0x2
00000000000dc030	blr	x8
00000000000dc034	ldr	x8, [x23]
00000000000dc038	ldr	x8, [x8, #0x18]
00000000000dc03c	mov	x0, x23
00000000000dc040	blr	x8
00000000000dc044	ldr	x0, [sp, #0x48]
00000000000dc048	cbz	x0, 0xdc130
00000000000dc04c	ldr	x8, [x0]
00000000000dc050	ldr	x8, [x8, #0x18]
00000000000dc054	blr	x8
00000000000dc058	b	0xdc130
00000000000dc05c	mov	x2, #0x0
00000000000dc060	str	xzr, [sp, #0x50]
00000000000dc064	ldr	x8, [x23]
00000000000dc068	ldr	x8, [x8, #0x78]
00000000000dc06c	mov	x0, x23
00000000000dc070	mov	w1, #0x0
00000000000dc074	blr	x8
00000000000dc078	ldr	x0, [sp, #0x50]
00000000000dc07c	cbz	x0, 0xdc08c
00000000000dc080	ldr	x8, [x0]
00000000000dc084	ldr	x8, [x8, #0x18]
00000000000dc088	blr	x8
00000000000dc08c	ldr	x8, [x23]
00000000000dc090	ldr	x8, [x8, #0x78]
00000000000dc094	mov	x0, x23
00000000000dc098	mov	w1, #0x1
00000000000dc09c	mov	x2, x20
00000000000dc0a0	blr	x8
00000000000dc0a4	ldr	d0, [sp, #0x1a8]
00000000000dc0a8	fcvt	s0, d0
00000000000dc0ac	ldr	x8, [x23]
00000000000dc0b0	ldr	x8, [x8, #0x60]
00000000000dc0b4	movi.2d	v1, #0000000000000000
00000000000dc0b8	movi.2d	v2, #0000000000000000
00000000000dc0bc	movi.2d	v3, #0000000000000000
00000000000dc0c0	mov	x0, x23
00000000000dc0c4	mov	w1, #0x0
00000000000dc0c8	blr	x8
00000000000dc0cc	ldr	d0, [sp, #0x1a0]
00000000000dc0d0	fcvt	s0, d0
00000000000dc0d4	ldr	x8, [x23]
00000000000dc0d8	ldr	x8, [x8, #0x60]
00000000000dc0dc	movi.2d	v1, #0000000000000000
00000000000dc0e0	movi.2d	v2, #0000000000000000
00000000000dc0e4	movi.2d	v3, #0000000000000000
00000000000dc0e8	mov	x0, x23
00000000000dc0ec	mov	w1, #0x1
00000000000dc0f0	blr	x8
00000000000dc0f4	ldp	d0, d1, [x27]
00000000000dc0f8	fcvt	s0, d0
00000000000dc0fc	fcvt	s1, d1
00000000000dc100	ldr	d2, [x27, #0x10]
00000000000dc104	fcvt	s2, d2
00000000000dc108	ldr	x8, [x23]
00000000000dc10c	ldr	x8, [x8, #0x60]
00000000000dc110	movi.2d	v3, #0000000000000000
00000000000dc114	mov	x0, x23
00000000000dc118	mov	w1, #0x2
00000000000dc11c	blr	x8
00000000000dc120	ldr	x8, [x23]
00000000000dc124	ldr	x8, [x8, #0x18]
00000000000dc128	mov	x0, x23
00000000000dc12c	blr	x8
00000000000dc130	str	x23, [sp, #0xe8]
00000000000dc134	ldr	x8, [x23]
00000000000dc138	ldr	x8, [x8, #0x10]
00000000000dc13c	mov	x0, x23
00000000000dc140	blr	x8
00000000000dc144	ldr	d0, [sp, #0x188]
00000000000dc148	fcmp	d0, #0.0
00000000000dc14c	b.le	0xdc22c
00000000000dc150	adrp	x8, 898 ; 0x45e000
00000000000dc154	ldrsw	x8, [x8, #0xd08]
00000000000dc158	ldr	x26, [x26, x8]
00000000000dc15c	str	x23, [sp, #0x38]
00000000000dc160	ldr	x8, [x23]
00000000000dc164	ldr	x8, [x8, #0x10]
00000000000dc168	mov	x0, x23
00000000000dc16c	blr	x8
00000000000dc170	ldp	q0, q1, [x25]
00000000000dc174	stp	q0, q1, [sp, #0x50]
00000000000dc178	ldr	q0, [x25, #0x20]
00000000000dc17c	str	q0, [sp, #0x70]
00000000000dc180	cbz	x26, 0xdc1f0
00000000000dc184	ldr	w6, [sp, #0x190]
00000000000dc188	ldr	d0, [sp, #0x188]
00000000000dc18c	adrp	x8, 397 ; 0x269000
00000000000dc190	ldr	d1, [x8, #0x8b0]
00000000000dc194	fmul	d0, d0, d1
00000000000dc198	adrp	x8, 396 ; 0x268000
00000000000dc19c	ldr	d1, [x8, #0xc50]
00000000000dc1a0	fadd	d0, d0, d1
00000000000dc1a4	fcvt	s2, d0
00000000000dc1a8	add	x8, sp, #0x48
00000000000dc1ac	add	x2, sp, #0x38
00000000000dc1b0	add	x5, sp, #0x50
00000000000dc1b4	movi.2d	v0, #0000000000000000
00000000000dc1b8	movi.2d	v1, #0000000000000000
00000000000dc1bc	fmov	s3, #5.00000000
00000000000dc1c0	movi.2d	v4, #0000000000000000
00000000000dc1c4	movi.2d	v5, #0000000000000000
00000000000dc1c8	mov	x0, x26
00000000000dc1cc	mov	x3, x24
00000000000dc1d0	mov	x4, x21
00000000000dc1d4	bl	"_objc_msgSend$quakeHeliumNodeWithInputImage:inputImage:outputImage:renderInfo:twist:horizontalShake:verticalShake:layers:centerX:centerY:randomSeed:"
00000000000dc1d8	ldr	x0, [sp, #0x48]
00000000000dc1dc	ldr	x8, [sp, #0xe8]
00000000000dc1e0	cmp	x8, x0
00000000000dc1e4	b.eq	0xdc360
00000000000dc1e8	cbnz	x8, 0xdc1fc
00000000000dc1ec	b	0xdc210
00000000000dc1f0	str	xzr, [sp, #0x48]
00000000000dc1f4	ldr	x8, [sp, #0xe8]
00000000000dc1f8	cbz	x8, 0xdc218
00000000000dc1fc	ldr	x9, [x8]
00000000000dc200	ldr	x9, [x9, #0x18]
00000000000dc204	mov	x0, x8
00000000000dc208	blr	x9
00000000000dc20c	ldr	x0, [sp, #0x48]
00000000000dc210	str	x0, [sp, #0xe8]
00000000000dc214	str	xzr, [sp, #0x48]
00000000000dc218	ldr	x0, [sp, #0x38]
00000000000dc21c	cbz	x0, 0xdc22c
00000000000dc220	ldr	x8, [x0]
00000000000dc224	ldr	x8, [x8, #0x18]
00000000000dc228	blr	x8
00000000000dc22c	ldr	d0, [sp, #0x180]
00000000000dc230	fcmp	d0, #0.0
00000000000dc234	b.le	0xdc2cc
00000000000dc238	mov	w0, #0x1b0
00000000000dc23c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000dc240	mov	x24, x0
00000000000dc244	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
00000000000dc248	ldr	d0, [sp, #0x180]
00000000000dc24c	fcvt	s0, d0
00000000000dc250	ldp	d1, d2, [sp, #0xd8]
00000000000dc254	fcvt	s1, d1
00000000000dc258	fcvt	s2, d2
00000000000dc25c	mov	x0, x24
00000000000dc260	mov	w1, #0x0
00000000000dc264	mov	w2, #0x0
00000000000dc268	mov	w3, #0x0
00000000000dc26c	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
00000000000dc270	ldr	x25, [sp, #0xe8]
00000000000dc274	ldr	x8, [x24]
00000000000dc278	ldr	x8, [x8, #0x78]
00000000000dc27c	mov	x0, x24
00000000000dc280	mov	w1, #0x0
00000000000dc284	mov	x2, x25
00000000000dc288	blr	x8
00000000000dc28c	cmp	x25, x24
00000000000dc290	b.eq	0xdc2bc
00000000000dc294	cbz	x25, 0xdc2a8
00000000000dc298	ldr	x8, [x25]
00000000000dc29c	ldr	x8, [x8, #0x18]
00000000000dc2a0	mov	x0, x25
00000000000dc2a4	blr	x8
00000000000dc2a8	str	x24, [sp, #0xe8]
00000000000dc2ac	ldr	x8, [x24]
00000000000dc2b0	ldr	x8, [x8, #0x10]
00000000000dc2b4	mov	x0, x24
00000000000dc2b8	blr	x8
00000000000dc2bc	ldr	x8, [x24]
00000000000dc2c0	ldr	x8, [x8, #0x18]
00000000000dc2c4	mov	x0, x24
00000000000dc2c8	blr	x8
00000000000dc2cc	add	x2, sp, #0xe8
00000000000dc2d0	mov	x0, x21
00000000000dc2d4	bl	"_objc_msgSend$setHeliumRef:"
00000000000dc2d8	ldr	x8, [x23]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
```
