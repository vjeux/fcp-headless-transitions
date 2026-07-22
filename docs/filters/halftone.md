# Halftone

- **PAE class:** `Halftone`
- **Plugin UUID:** `10A46FDA-13E9-4167-B8AE-1A7204EB5139`
- **Node names in corpus:** Halftone (17), Noir (1), ht (1)
- **Corpus usage:** 17 files, 19 instances

## What it does

Halftone reproduces the image as a printed halftone screen: continuous tone is converted to a grid of variously-sized dots. Scale sets the dot-grid frequency, Angle the screen angle, Contrast the dot hardness, and Center anchors the grid.

> **Note.** Not implemented; description is the standard Apple Motion "Halftone" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Scale | float | 6 | 2 .. 35 | Dot-grid frequency / cell size, ~2-35 (default 6). |
| Contrast | float | 0.5 | 0.41 .. 0.99 | Hardness of the dot edges, ~0.4-0.99 (default 0.5). |
| Center | point2D | - | - | Anchor point of the halftone grid (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | pi/4 (0.7854) | 0.3491 .. 0.8203 | Screen angle of the dot grid, radians (default pi/4). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcHalftone`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcHalftone` → [`HgcHalftone.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcHalftone.metal)

```metal
//Metal1.0     
//LEN=0000000492
[[ visible ]] FragmentOut HgcHalftone_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(0.000000000, 0.5000000000, 2.000000000, 3.000000000);
    const float4 c1 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0 = texCoord1 - hg_Params[0];
    r0 = r0*hg_Params[4];
    r1.x = dot(r0, hg_Params[1]);
    r1.y = dot(r0, hg_Params[2]);
    r1.xy = r1.xy + hg_Params[0].xy;
    r1.xy = fract(r1.xy);
    r0 = color0;
    r2 = r1.xxyy - c0.xyxy;
    r2 = clamp(r2 + r2, 0.00000f, 1.00000f);
    r3 = -r2*c0.zzzz + c0.wwww;
    r2 = r2*r2;
    r2 = r2*r3;
    r2.yw = -r2.yw;
    r2 = r2*c0.yyyy + c0.xyxy;
    r1 = float4(r1.xxyy < c0.yyyy);
    r1.yw = -r1.yw;
    r1 = r1 + c1.xyxy;
    r1 = r2*r1;
    r3.xyz = float3(dot(r0, hg_Params[5]));
    r1.xyz = float3(dot(r1, 1.00000f));
    r3.xyz = r3.xyz - r1.xyz;
    r3.xyz = clamp(r3.xyz*hg_Params[3].xyz + c0.yyy, 0.00000f, 1.00000f);
    r3.xyz = r3.xyz*r0.www;
    r3.w = r0.w;
    output.color0 = mix(r0, r3, hg_Params[6]);
    return output;
}
```

### CPU parameter wiring — `-[PAEHalftone canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEHalftone`

```asm
00000000000abdcc	mov	w4, #0x1
00000000000abdd0	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000abdd4	ldr	x4, [x25]
00000000000abdd8	add	x2, sp, #0xa8
00000000000abddc	mov	x0, x28
00000000000abde0	mov	w3, #0x2
00000000000abde4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000abde8	ldr	x4, [x25]
00000000000abdec	add	x2, sp, #0xa0
00000000000abdf0	mov	x0, x28
00000000000abdf4	mov	w3, #0x3
00000000000abdf8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000abdfc	ldr	x4, [x25]
00000000000abe00	add	x2, sp, #0x98
00000000000abe04	mov	x0, x28
00000000000abe08	mov	w3, #0x4
00000000000abe0c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000abe10	ldr	x2, [x25]
00000000000abe14	mov	x0, x28
00000000000abe18	bl	"_objc_msgSend$mixAmountAtTime:"
00000000000abe1c	mov.16b	v8, v0
00000000000abe20	add	x8, sp, #0x18
00000000000abe24	mov	x0, x27
00000000000abe28	mov	x2, x26
00000000000abe2c	bl	"_objc_msgSend$getInversePixelTransformForImage:"
00000000000abe30	ldp	d1, d0, [sp, #0xa0]
00000000000abe34	sub	x2, x29, #0x90
00000000000abe38	mov	x0, x27
00000000000abe3c	bl	"_objc_msgSend$compute_2x2_matrix:fromAngle:andScale:"
00000000000abe40	ldr	x2, [x25]
00000000000abe44	mov	x0, x21
00000000000abe48	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000abe4c	bl	_objc_msgSend$matrix
00000000000abe50	mov	x21, x0
00000000000abe54	ldr	x2, [x25]
00000000000abe58	mov	x0, x27
00000000000abe5c	bl	"_objc_msgSend$getRenderMode:"
00000000000abe60	cbz	w0, 0xac16c
00000000000abe64	mov	x0, x26
00000000000abe68	bl	_objc_msgSend$imageType
00000000000abe6c	cmp	x0, #0x3
00000000000abe70	b.ne	0xac16c
00000000000abe74	cbz	x26, 0xabe88
00000000000abe78	add	x8, sp, #0x10
00000000000abe7c	mov	x0, x26
00000000000abe80	bl	_objc_msgSend$heliumRef
00000000000abe84	b	0xabe8c
00000000000abe88	str	xzr, [sp, #0x10]
00000000000abe8c	ldr	x8, [x25, #0x28]
00000000000abe90	cbnz	x8, 0xabefc
00000000000abe94	mov	w0, #0x1c0
00000000000abe98	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000abe9c	mov	x25, x0
00000000000abea0	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000abea4	ldr	x2, [sp, #0x10]
00000000000abea8	ldr	x8, [x25]
00000000000abeac	ldr	x8, [x8, #0x78]
00000000000abeb0	mov	x0, x25
00000000000abeb4	mov	w1, #0x0
00000000000abeb8	blr	x8
00000000000abebc	ldr	x0, [sp, #0x10]
00000000000abec0	cmp	x0, x25
00000000000abec4	b.eq	0xabeec
00000000000abec8	cbz	x0, 0xabed8
00000000000abecc	ldr	x8, [x0]
00000000000abed0	ldr	x8, [x8, #0x18]
00000000000abed4	blr	x8
00000000000abed8	str	x25, [sp, #0x10]
00000000000abedc	ldr	x8, [x25]
00000000000abee0	ldr	x8, [x8, #0x10]
00000000000abee4	mov	x0, x25
00000000000abee8	blr	x8
00000000000abeec	ldr	x8, [x25]
00000000000abef0	ldr	x8, [x8, #0x18]
00000000000abef4	mov	x0, x25
00000000000abef8	blr	x8
00000000000abefc	cbnz	w24, 0xabf90
00000000000abf00	mov	w0, #0x1b0
00000000000abf04	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000abf08	mov	x24, x0
00000000000abf0c	bl	0x251894 ; symbol stub for: __ZN7HGGammaC1Ev
00000000000abf10	ldr	x8, [x24]
00000000000abf14	ldr	x8, [x8, #0x60]
00000000000abf18	adrp	x9, 447 ; 0x26a000
00000000000abf1c	ldr	s0, [x9, #0x8c4]
00000000000abf20	movi.2d	v1, #0000000000000000
00000000000abf24	movi.2d	v2, #0000000000000000
00000000000abf28	movi.2d	v3, #0000000000000000
00000000000abf2c	mov	x0, x24
00000000000abf30	mov	w1, #0x0
00000000000abf34	blr	x8
00000000000abf38	ldr	x2, [sp, #0x10]
00000000000abf3c	ldr	x8, [x24]
00000000000abf40	ldr	x8, [x8, #0x78]
00000000000abf44	mov	x0, x24
00000000000abf48	mov	w1, #0x0
00000000000abf4c	blr	x8
00000000000abf50	ldr	x0, [sp, #0x10]
00000000000abf54	cmp	x0, x24
00000000000abf58	b.eq	0xabf80
00000000000abf5c	cbz	x0, 0xabf6c
00000000000abf60	ldr	x8, [x0]
00000000000abf64	ldr	x8, [x8, #0x18]
00000000000abf68	blr	x8
00000000000abf6c	str	x24, [sp, #0x10]
00000000000abf70	ldr	x8, [x24]
00000000000abf74	ldr	x8, [x8, #0x10]
00000000000abf78	mov	x0, x24
00000000000abf7c	blr	x8
00000000000abf80	ldr	x8, [x24]
00000000000abf84	ldr	x8, [x8, #0x18]
00000000000abf88	mov	x0, x24
00000000000abf8c	blr	x8
00000000000abf90	mov	w0, #0x1a0
00000000000abf94	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000abf98	mov	x24, x0
00000000000abf9c	bl	__ZN11HgcHalftoneC2Ev
00000000000abfa0	ucvtf	d0, x22
00000000000abfa4	ucvtf	d1, x23
00000000000abfa8	adrp	x8, 745 ; 0x394000
00000000000abfac	add	x8, x8, #0x60
00000000000abfb0	add	x9, x8, #0x10
00000000000abfb4	str	x9, [x24]
00000000000abfb8	ldur	d2, [x29, #-0x98]
00000000000abfbc	fmov	d3, #-0.50000000
00000000000abfc0	fadd	d2, d2, d3
00000000000abfc4	fmul	d4, d2, d0
00000000000abfc8	ldur	d0, [x29, #-0xa0]
00000000000abfcc	fadd	d0, d0, d3
00000000000abfd0	fmul	d0, d0, d1
00000000000abfd4	stp	d0, d4, [x29, #-0xa0]
00000000000abfd8	ldr	x2, [sp, #0x10]
00000000000abfdc	ldr	x8, [x8, #0x88]
00000000000abfe0	mov	x0, x24
00000000000abfe4	mov	w1, #0x0
00000000000abfe8	blr	x8
00000000000abfec	ldp	d1, d0, [x29, #-0xa0]
00000000000abff0	fcvt	s0, d0
00000000000abff4	fcvt	s1, d1
00000000000abff8	ldr	x8, [x24]
00000000000abffc	ldr	x8, [x8, #0x60]
00000000000ac000	movi.2d	v2, #0000000000000000
00000000000ac004	movi.2d	v3, #0000000000000000
00000000000ac008	mov	x0, x24
00000000000ac00c	mov	w1, #0x0
00000000000ac010	blr	x8
00000000000ac014	ldp	d0, d1, [x29, #-0x90]
00000000000ac018	fcvt	s0, d0
00000000000ac01c	fcvt	s1, d1
00000000000ac020	ldr	x8, [x24]
00000000000ac024	ldr	x8, [x8, #0x60]
00000000000ac028	movi.2d	v2, #0000000000000000
00000000000ac02c	movi.2d	v3, #0000000000000000
00000000000ac030	mov	x0, x24
00000000000ac034	mov	w1, #0x1
00000000000ac038	blr	x8
00000000000ac03c	ldp	d0, d1, [x29, #-0x80]
00000000000ac040	fcvt	s0, d0
00000000000ac044	fcvt	s1, d1
00000000000ac048	ldr	x8, [x24]
00000000000ac04c	ldr	x8, [x8, #0x60]
00000000000ac050	movi.2d	v2, #0000000000000000
00000000000ac054	movi.2d	v3, #0000000000000000
00000000000ac058	mov	x0, x24
00000000000ac05c	mov	w1, #0x2
00000000000ac060	blr	x8
00000000000ac064	ldr	d0, [sp, #0x98]
00000000000ac068	fmov	d1, #1.00000000
00000000000ac06c	fsub	d0, d1, d0
00000000000ac070	fdiv	d0, d1, d0
00000000000ac074	fcvt	s0, d0
00000000000ac078	ldr	x8, [x24]
00000000000ac07c	ldr	x8, [x8, #0x60]
00000000000ac080	movi.2d	v1, #0000000000000000
00000000000ac084	movi.2d	v2, #0000000000000000
00000000000ac088	movi.2d	v3, #0000000000000000
00000000000ac08c	mov	x0, x24
00000000000ac090	mov	w1, #0x3
00000000000ac094	blr	x8
00000000000ac098	ldr	d0, [sp, #0x18]
00000000000ac09c	ldr	d1, [sp, #0x40]
00000000000ac0a0	fcvt	s0, d0
00000000000ac0a4	fcvt	s1, d1
00000000000ac0a8	ldr	x8, [x24]
00000000000ac0ac	ldr	x8, [x8, #0x60]
00000000000ac0b0	movi.2d	v2, #0000000000000000
00000000000ac0b4	movi.2d	v3, #0000000000000000
00000000000ac0b8	mov	x0, x24
00000000000ac0bc	mov	w1, #0x4
00000000000ac0c0	blr	x8
00000000000ac0c4	fcvt	s0, d8
00000000000ac0c8	ldr	x8, [x24]
00000000000ac0cc	ldr	x8, [x8, #0x60]
00000000000ac0d0	movi.2d	v1, #0000000000000000
00000000000ac0d4	movi.2d	v2, #0000000000000000
00000000000ac0d8	movi.2d	v3, #0000000000000000
00000000000ac0dc	mov	x0, x24
00000000000ac0e0	mov	w1, #0x6
00000000000ac0e4	blr	x8
00000000000ac0e8	ldp	d0, d1, [x21]
00000000000ac0ec	fcvt	s0, d0
00000000000ac0f0	fcvt	s1, d1
00000000000ac0f4	ldr	d2, [x21, #0x10]
00000000000ac0f8	fcvt	s2, d2
00000000000ac0fc	ldr	x8, [x24]
00000000000ac100	ldr	x8, [x8, #0x60]
00000000000ac104	movi.2d	v3, #0000000000000000
00000000000ac108	mov	x0, x24
00000000000ac10c	mov	w1, #0x5
00000000000ac110	blr	x8
00000000000ac114	str	x24, [sp, #0x8]
00000000000ac118	ldr	x8, [x24]
00000000000ac11c	ldr	x8, [x8, #0x10]
00000000000ac120	mov	x0, x24
00000000000ac124	blr	x8
00000000000ac128	add	x2, sp, #0x8
00000000000ac12c	mov	x0, x20
00000000000ac130	bl	"_objc_msgSend$setHeliumRef:"
00000000000ac134	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - host Mix

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm3 (float)
    slot 0  <-  (constant / computed)
    slot 1  <-  (constant / computed)
    slot 2  <-  (constant / computed)
    slot 3  <-  parm4 (float)
    slot 4  <-  (constant / computed)
    slot 6  <-  host Mix
    slot 5  <-  (constant / computed)
```
