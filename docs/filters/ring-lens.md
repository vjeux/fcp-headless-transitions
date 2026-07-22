# Ring Lens

- **PAE class:** `Ring Lens`
- **Plugin UUID:** `9F1EEA3B-85F9-4D8F-AAE4-E4134D502D2D`
- **Node names in corpus:** Ring Lens (1), Ring Lens 2 (1), Ring Lens 3 (1)
- **Corpus usage:** 2 files, 3 instances

## What it does

Ring Lens refracts the image through a circular ring lens at Center: a torus-shaped glass ring bends the picture where the ring sits (like looking through a magnifying ring), controlled by Radius, ring Thickness, and Refraction index.

> **Note.** Not implemented; description is the standard Apple Motion "Ring Lens" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the ring lens (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Radius | float (pixels) | 160 | 342.7 .. 777 | Radius of the ring, ~340-780 (default 160). |
| Thickness | float | 0.43 | 0.78 .. 1 | Thickness of the ring band, ~0.78-1 (default 0.43). |
| Refraction | float | 1.7 | -1.5 .. 1.97 | Refraction strength/index of the ring glass, ~-1.5..2 (default 1.7). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcRingLens`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRingLens` → [`HgcRingLens.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRingLens.metal)

```metal
//Metal1.0     
//LEN=0000000772
[[ visible ]] FragmentOut HgcRingLens_hgc_visible(const constant float4* hg_Params,
    float4 color0, 
    texture2d< float > hg_Texture1, 
    sampler hg_Sampler1,
    float4 texCoord1)
{
    const float4 c0 = float4(0.000000000, 1.000000000, 2.000000000, 3.000000000);
    float4 r0, r1, r2, r3, r4;
    FragmentOut output;

    r0.xy = texCoord1.xy*hg_Params[4].xy + hg_Params[4].zw;
    r1 = float4(dot(r0.xy, r0.xy));
    r2 = rsqrt(r1.xxxx);
    r2 = select(r2, c0.xxxx, r1 < 0.00000f);
    r2 = select(c0.xxxx, r2, -r1 < 0.00000f);
    r0.xy = r0.xy*r2.xy;
    r1 = r1*r2;
    r2.xy = r1.xy*hg_Params[0].xx + hg_Params[0].yy;
    r3 = clamp(r1 - hg_Params[2].xxxx, 0.00000f, 1.00000f);
    r3 = clamp(c0.yyyy - r3, 0.00000f, 1.00000f);
    r4 = -r3*c0.zzzz + c0.wwww;
    r3 = r3*r3;
    r3 = r3*r4;
    r1 = clamp(r1 - hg_Params[2].yyyy, 0.00000f, 1.00000f);
    r1 = clamp(c0.yyyy - r1, 0.00000f, 1.00000f);
    r4 = -r1*c0.zzzz + c0.wwww;
    r1 = r1*r1;
    r1 = r1*r4;
    r2.xy = clamp(r2.xy, 0.00000f, 1.00000f);
    r2.xy = r2.xy*hg_Params[0].zz + hg_Params[0].ww;
    r4.x = r2.x + c0.y;
    r4.x = r4.x*-r2.x + r4.x;
    r4.xy = r2.xy/r4.xx;
    r4.xy = clamp(r4.xy*hg_Params[1].xx + hg_Params[1].yy, 0.00000f, 1.00000f);
    r4.xy = r4.xy*hg_Params[1].zz;
    r0.xy = r0.xy*r4.xy;
    r0.xy = r0.xy*hg_Params[5].xy + hg_Params[5].zw;
    r2.xy = fmax(r0.xy, -hg_Params[3].xy);
    r2.xy = fmin(r2.xy, hg_Params[3].xy);
    r4.xy = -hg_Params[3].xy - r0.xy;
    r0.xy = r0.xy - hg_Params[3].xy;
    r4.x = fmax(r4.x, r4.y);
    r4.y = fmax(r0.x, r0.y);
    r4.x = fmax(r4.x, r4.y);
    r2.xy = r2.xy + hg_Params[6].xy;
    r2.xy = r2.xy*hg_Params[6].zw;
    r2 = hg_Texture1.sample(hg_Sampler1, r2.xy);
    r2 = select(r2, c0.xxxx, -r4.xxxx < 0.00000f);
    r0 = color0;
    r3 = mix(r0, r2, r3);
    output.color0 = mix(r3, r0, r1);
    return output;
}
```

### CPU parameter wiring — `-[PAERingLens canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAERingLens`

```asm
00000000000cbc80	mov	w3, #0x2
00000000000cbc84	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000cbc88	ldr	d0, [x25, #0x80]
00000000000cbc8c	fcmp	d0, #0.0
00000000000cbc90	b.ne	0xcbca8
00000000000cbc94	cbz	x21, 0xcbccc
00000000000cbc98	add	x8, sp, #0xc8
00000000000cbc9c	mov	x0, x21
00000000000cbca0	bl	_objc_msgSend$heliumRef
00000000000cbca4	b	0xcbcd0
00000000000cbca8	ldr	x0, [x22, x24]
00000000000cbcac	adrp	x8, 777 ; 0x3d4000
00000000000cbcb0	ldr	x2, [x8, #0x528]
00000000000cbcb4	bl	"_objc_msgSend$apiForProtocol:"
00000000000cbcb8	cbz	x0, 0xcbcf4
00000000000cbcbc	bl	_objc_msgSend$versionAtCreation
00000000000cbcc0	cmp	w0, #0x0
00000000000cbcc4	cset	w26, eq
00000000000cbcc8	b	0xcbcf8
00000000000cbccc	str	xzr, [x25]
00000000000cbcd0	add	x2, sp, #0xc8
00000000000cbcd4	mov	x0, x20
00000000000cbcd8	bl	"_objc_msgSend$setHeliumRef:"
00000000000cbcdc	ldr	x0, [x25]
00000000000cbce0	cbz	x0, 0xcc024
00000000000cbce4	ldr	x8, [x0]
00000000000cbce8	ldr	x8, [x8, #0x18]
00000000000cbcec	blr	x8
00000000000cbcf0	b	0xcc024
00000000000cbcf4	mov	w26, #0x0
00000000000cbcf8	add	x8, sp, #0xc8
00000000000cbcfc	mov	x0, x22
00000000000cbd00	mov	x2, x21
00000000000cbd04	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000cbd08	add	x8, sp, #0x48
00000000000cbd0c	mov	x0, x22
00000000000cbd10	mov	x2, x20
00000000000cbd14	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000cbd18	add	x8, sp, #0x30
00000000000cbd1c	fmov.2d	v0, #0.50000000
00000000000cbd20	str	q0, [sp, #0x30]
00000000000cbd24	ldr	x5, [x23]
00000000000cbd28	add	x2, sp, #0x30
00000000000cbd2c	orr	x3, x8, #0x8
00000000000cbd30	mov	x0, x19
00000000000cbd34	mov	w4, #0x1
00000000000cbd38	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000cbd3c	add	x8, sp, #0x20
00000000000cbd40	add	x2, sp, #0x30
00000000000cbd44	mov	x0, x22
00000000000cbd48	mov	x3, x21
00000000000cbd4c	bl	"_objc_msgSend$convertRelativeToImageCoordinates:withImage:"
00000000000cbd50	ldr	q0, [sp, #0x20]
00000000000cbd54	str	q0, [sp, #0x30]
00000000000cbd58	ldp	d0, d1, [sp, #0x30]
00000000000cbd5c	add	x0, sp, #0xc8
00000000000cbd60	movi.2d	v2, #0000000000000000
00000000000cbd64	bl	__ZN14PCMatrix44TmplIdE14rightTranslateEddd
00000000000cbd68	ldp	d0, d1, [sp, #0x30]
00000000000cbd6c	fneg	d0, d0
00000000000cbd70	fneg	d1, d1
00000000000cbd74	add	x0, sp, #0x48
00000000000cbd78	movi.2d	v2, #0000000000000000
00000000000cbd7c	bl	__ZN14PCMatrix44TmplIdE13leftTranslateEddd
00000000000cbd80	mov	x8, #0xeb85
00000000000cbd84	movk	x8, #0xb851, lsl #16
00000000000cbd88	movk	x8, #0x851e, lsl #32
00000000000cbd8c	movk	x8, #0x3fdb, lsl #48
00000000000cbd90	str	x8, [sp, #0x20]
00000000000cbd94	ldr	x4, [x23]
00000000000cbd98	add	x2, sp, #0x20
00000000000cbd9c	mov	x0, x19
00000000000cbda0	mov	w3, #0x3
00000000000cbda4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000cbda8	mov	x8, #0x3333333333333333
00000000000cbdac	movk	x8, #0x3ffb, lsl #48
00000000000cbdb0	str	x8, [sp, #0x18]
00000000000cbdb4	ldr	x4, [x23]
00000000000cbdb8	add	x2, sp, #0x18
00000000000cbdbc	mov	x0, x19
00000000000cbdc0	mov	w3, #0x4
00000000000cbdc4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000cbdc8	ldr	d9, [x25, #0x80]
00000000000cbdcc	ldr	d8, [sp, #0x20]
00000000000cbdd0	ldr	x2, [x23]
00000000000cbdd4	mov	x0, x22
00000000000cbdd8	bl	"_objc_msgSend$getRenderMode:"
00000000000cbddc	cbz	w0, 0xcc024
00000000000cbde0	mov	x0, x21
00000000000cbde4	bl	_objc_msgSend$imageType
00000000000cbde8	cmp	x0, #0x3
00000000000cbdec	b.ne	0xcc024
00000000000cbdf0	cbz	x21, 0xcbe04
00000000000cbdf4	add	x8, sp, #0x10
00000000000cbdf8	mov	x0, x21
00000000000cbdfc	bl	_objc_msgSend$heliumRef
00000000000cbe00	b	0xcbe08
00000000000cbe04	str	xzr, [sp, #0x10]
00000000000cbe08	mov	w0, #0x2b0
00000000000cbe0c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000cbe10	mov	x24, x0
00000000000cbe14	bl	__ZN9HRingLensC2Ev
00000000000cbe18	ldr	x2, [sp, #0x10]
00000000000cbe1c	ldr	x8, [x24]
00000000000cbe20	ldr	x8, [x8, #0x78]
00000000000cbe24	mov	x0, x24
00000000000cbe28	mov	w1, #0x0
00000000000cbe2c	blr	x8
00000000000cbe30	ldr	x2, [sp, #0x10]
00000000000cbe34	ldr	x8, [x24]
00000000000cbe38	ldr	x8, [x8, #0x78]
00000000000cbe3c	mov	x0, x24
00000000000cbe40	mov	w1, #0x1
00000000000cbe44	blr	x8
00000000000cbe48	fmov	d0, #1.00000000
00000000000cbe4c	fsub	d1, d0, d8
00000000000cbe50	fmul	d1, d9, d1
00000000000cbe54	fcvt	s8, d1
00000000000cbe58	fcvt	d1, s8
00000000000cbe5c	fsub	d1, d9, d1
00000000000cbe60	fdiv	d0, d0, d1
00000000000cbe64	fcvt	s0, d0
00000000000cbe68	fneg	s2, s8
00000000000cbe6c	fcvt	d2, s2
00000000000cbe70	fdiv	d1, d2, d1
00000000000cbe74	fcvt	s1, d1
00000000000cbe78	ldr	x8, [x24]
00000000000cbe7c	ldr	x8, [x8, #0x60]
00000000000cbe80	adrp	x9, 415 ; 0x26a000
00000000000cbe84	ldr	s2, [x9, #0xcf8]
00000000000cbe88	adrp	x9, 415 ; 0x26a000
00000000000cbe8c	ldr	s3, [x9, #0xcfc]
00000000000cbe90	mov	x0, x24
00000000000cbe94	mov	w1, #0x0
00000000000cbe98	blr	x8
00000000000cbe9c	ldr	d0, [sp, #0x18]
00000000000cbea0	ldr	d1, [x25, #0x80]
00000000000cbea4	fmul	d0, d0, d1
00000000000cbea8	fcvt	s2, d0
00000000000cbeac	ldr	x8, [x24]
00000000000cbeb0	ldr	x8, [x8, #0x60]
00000000000cbeb4	adrp	x9, 415 ; 0x26a000
00000000000cbeb8	ldr	s0, [x9, #0xd00]
00000000000cbebc	fmov	s1, #0.50000000
00000000000cbec0	movi.2d	v3, #0000000000000000
00000000000cbec4	mov	x0, x24
00000000000cbec8	mov	w1, #0x1
00000000000cbecc	blr	x8
00000000000cbed0	ldr	d0, [x25, #0x80]
00000000000cbed4	fcvt	s0, d0
00000000000cbed8	mov	x0, x24
00000000000cbedc	mov.16b	v1, v8
00000000000cbee0	bl	__ZN9HRingLens9SetRadiusEff
00000000000cbee4	mov	x0, x21
00000000000cbee8	bl	_objc_msgSend$width
00000000000cbeec	mov	x25, x0
00000000000cbef0	mov	x0, x21
00000000000cbef4	bl	_objc_msgSend$height
00000000000cbef8	ucvtf	d0, x25, #0x1
00000000000cbefc	fcvt	s0, d0
00000000000cbf00	ucvtf	d1, x0, #0x1
00000000000cbf04	fcvt	s1, d1
00000000000cbf08	ldr	x8, [x24]
00000000000cbf0c	ldr	x8, [x8, #0x60]
00000000000cbf10	movi.2d	v2, #0000000000000000
00000000000cbf14	movi.2d	v3, #0000000000000000
00000000000cbf18	mov	x0, x24
00000000000cbf1c	mov	w1, #0x3
00000000000cbf20	blr	x8
00000000000cbf24	add	x1, sp, #0x48
00000000000cbf28	mov	x0, x24
00000000000cbf2c	bl	__ZN9HRingLens16SetOutputToImageERK14PCMatrix44TmplIdE
00000000000cbf30	add	x1, sp, #0xc8
00000000000cbf34	mov	x0, x24
00000000000cbf38	bl	__ZN9HRingLens15SetImageToInputERK14PCMatrix44TmplIdE
00000000000cbf3c	mov	w0, #0x1a0
00000000000cbf40	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000cbf44	mov	x25, x0
00000000000cbf48	bl	0x250f34 ; symbol stub for: __ZN11HGOverwriteC1Ev
00000000000cbf4c	ldr	x2, [sp, #0x10]
00000000000cbf50	ldr	x8, [x25]
00000000000cbf54	ldr	x8, [x8, #0x78]
00000000000cbf58	mov	x0, x25
00000000000cbf5c	mov	w1, #0x0
00000000000cbf60	blr	x8
00000000000cbf64	ldr	x8, [x25]
00000000000cbf68	ldr	x8, [x8, #0x78]
00000000000cbf6c	mov	x0, x25
00000000000cbf70	mov	w1, #0x1
00000000000cbf74	mov	x2, x24
00000000000cbf78	blr	x8
00000000000cbf7c	str	x25, [sp, #0x8]
00000000000cbf80	ldr	x8, [x25]
00000000000cbf84	ldr	x8, [x8, #0x10]
00000000000cbf88	mov	x0, x25
00000000000cbf8c	blr	x8
00000000000cbf90	mov	w8, #0x1
00000000000cbf94	strb	w8, [sp, #0x7]
00000000000cbf98	tbnz	w26, #0x0, 0xcbfbc
00000000000cbf9c	ldr	x4, [x23]
00000000000cbfa0	add	x2, sp, #0x7
00000000000cbfa4	mov	x0, x19
00000000000cbfa8	mov	w3, #0x5
00000000000cbfac	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
00000000000cbfb0	ldrb	w8, [sp, #0x7]
00000000000cbfb4	cmp	w8, #0x1
00000000000cbfb8	b.ne	0xcbfd0
00000000000cbfbc	add	x2, sp, #0x8
00000000000cbfc0	mov	x0, x22
00000000000cbfc4	mov	x3, x21
00000000000cbfc8	mov	x4, x20
00000000000cbfcc	bl	"_objc_msgSend$crop:fromImage:toImage:"
00000000000cbfd0	add	x2, sp, #0x8
00000000000cbfd4	mov	x0, x20
00000000000cbfd8	bl	"_objc_msgSend$setHeliumRef:"
00000000000cbfdc	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm3 (float)
    slot 1  <-  parm4 (float)
    slot 3  <-  (constant / computed)
```
