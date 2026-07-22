# Noise Dissolve

- **PAE class:** `Noise Dissolve`
- **Plugin UUID:** `ABFED81E-35D9-429C-AB47-438C1FB5D9DE`
- **Node names in corpus:** Noise Dissolve (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Noise Dissolve is a transition filter that dissolves the image away through a random noise pattern: as Dissolve Amount rises, pixels drop out in a random (Random Seed) speckle order until the image is gone. Used as a grainy dissolve transition.

> **Note.** Not implemented; description is the standard Apple Motion "Noise Dissolve" transition filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Dissolve Amount | float | - | - | Fraction of the image dissolved away, 0-1 (animate to drive the transition). *(keyframed in 1 instance)* |
| Random Seed | float (int seed) | - | - | Seed for the dissolve noise pattern; changing it reshuffles the speckle order. *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcNoiseDissolve`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcNoiseDissolve` → [`HgcNoiseDissolve.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcNoiseDissolve.metal)

```metal
//Metal1.0     
//LEN=00000001c1
[[ visible ]] FragmentOut HgcNoiseDissolve_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1.x = color1.x;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1 = float4(r1.xxxx >= hg_Params[0]);
    r1 = r0.wwww*r1;
    output.color0.xyz = r0.xyz*r1.xyz;
    output.color0.w = r1.w;
    return output;
}
```

### CPU parameter wiring — `-[PAENoiseDissolve canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAENoiseDissolve`

```asm
000000000004ebec	mov	w3, #0x1
000000000004ebf0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000004ebf4	ldr	d0, [sp, #0x18]
000000000004ebf8	fcmp	d0, #0.0
000000000004ebfc	b.ne	0x4ec14
000000000004ec00	cbz	x21, 0x4ec94
000000000004ec04	add	x8, sp, #0x8
000000000004ec08	mov	x0, x21
000000000004ec0c	bl	_objc_msgSend$heliumRef
000000000004ec10	b	0x4ec98
000000000004ec14	ldr	x4, [x20]
000000000004ec18	add	x2, sp, #0x14
000000000004ec1c	mov	x0, x23
000000000004ec20	mov	w3, #0x2
000000000004ec24	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000004ec28	ldr	d0, [sp, #0x18]
000000000004ec2c	mov	x8, #0x4059000000000000
000000000004ec30	fmov	d1, x8
000000000004ec34	fdiv	d0, d0, d1
000000000004ec38	str	d0, [sp, #0x18]
000000000004ec3c	ldr	x2, [x20]
000000000004ec40	mov	x0, x22
000000000004ec44	bl	"_objc_msgSend$getRenderMode:"
000000000004ec48	mov	x20, x0
000000000004ec4c	mov	x0, x21
000000000004ec50	bl	_objc_msgSend$imageType
000000000004ec54	mov	x8, x0
000000000004ec58	mov	w0, #0x0
000000000004ec5c	cbz	w20, 0x4eebc
000000000004ec60	cmp	x8, #0x3
000000000004ec64	b.ne	0x4eebc
000000000004ec68	mov	w0, #0x1a0
000000000004ec6c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004ec70	mov	x20, x0
000000000004ec74	bl	__ZN16HgcNoiseDissolveC1Ev
000000000004ec78	str	x20, [sp, #0x8]
000000000004ec7c	cbz	x21, 0x4ecbc
000000000004ec80	mov	x8, sp
000000000004ec84	mov	x0, x21
000000000004ec88	bl	_objc_msgSend$heliumRef
000000000004ec8c	ldr	x2, [sp]
000000000004ec90	b	0x4ecc4
000000000004ec94	str	xzr, [sp, #0x8]
000000000004ec98	add	x2, sp, #0x8
000000000004ec9c	mov	x0, x19
000000000004eca0	bl	"_objc_msgSend$setHeliumRef:"
000000000004eca4	ldr	x0, [sp, #0x8]
000000000004eca8	cbz	x0, 0x4eeb8
000000000004ecac	ldr	x8, [x0]
000000000004ecb0	ldr	x8, [x8, #0x18]
000000000004ecb4	blr	x8
000000000004ecb8	b	0x4eeb8
000000000004ecbc	mov	x2, #0x0
000000000004ecc0	str	xzr, [sp]
000000000004ecc4	ldr	x8, [x20]
000000000004ecc8	ldr	x8, [x8, #0x78]
000000000004eccc	mov	x0, x20
000000000004ecd0	mov	w1, #0x0
000000000004ecd4	blr	x8
000000000004ecd8	ldr	x0, [sp]
000000000004ecdc	cbz	x0, 0x4ecec
000000000004ece0	ldr	x8, [x0]
000000000004ece4	ldr	x8, [x8, #0x18]
000000000004ece8	blr	x8
000000000004ecec	ldr	d0, [sp, #0x18]
000000000004ecf0	fcvt	s0, d0
000000000004ecf4	ldr	x8, [x20]
000000000004ecf8	ldr	x8, [x8, #0x60]
000000000004ecfc	movi.2d	v1, #0000000000000000
000000000004ed00	movi.2d	v2, #0000000000000000
000000000004ed04	movi.2d	v3, #0000000000000000
000000000004ed08	mov	x0, x20
000000000004ed0c	mov	w1, #0x0
000000000004ed10	blr	x8
000000000004ed14	mov	x0, x21
000000000004ed18	bl	_objc_msgSend$width
000000000004ed1c	mov	x22, x0
000000000004ed20	mov	x0, x21
000000000004ed24	bl	_objc_msgSend$height
000000000004ed28	mov	x23, x0
000000000004ed2c	ldr	w24, [sp, #0x14]
000000000004ed30	mov	w0, #0x80
000000000004ed34	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004ed38	mov	x21, x0
000000000004ed3c	add	w8, w22, w22, lsr #31
000000000004ed40	neg	w22, w8, asr #1
000000000004ed44	add	w9, w23, w23, lsr #31
000000000004ed48	neg	w25, w9, asr #1
000000000004ed4c	asr	w23, w8, #1
000000000004ed50	asr	w26, w9, #1
000000000004ed54	orr	x1, x22, x25, lsl #32
000000000004ed58	orr	x2, x23, x26, lsl #32
000000000004ed5c	mov	w3, #0x16
000000000004ed60	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
000000000004ed64	subs	w8, w26, w25
000000000004ed68	b.eq	0x4ee44
000000000004ed6c	mov	x9, #0x0
000000000004ed70	ldr	x10, [x21, #0x50]
000000000004ed74	ldr	x11, [x21, #0x40]
000000000004ed78	sub	w12, w23, w22
000000000004ed7c	mov	w13, #0x79b9
000000000004ed80	movk	w13, #0x9e37, lsl #16
000000000004ed84	adrp	x14, 1049 ; 0x467000
000000000004ed88	adrp	x15, 1049 ; 0x467000
000000000004ed8c	adrp	x16, 539 ; 0x269000
000000000004ed90	ldr	d0, [x16, #0xd58]
000000000004ed94	adrp	x16, 1049 ; 0x467000
000000000004ed98	adrp	x17, 539 ; 0x269000
000000000004ed9c	ldr	d1, [x17, #0xd60]
000000000004eda0	mov	w17, #0x1010101
000000000004eda4	cmp	w23, w22
000000000004eda8	b.eq	0x4ee38
000000000004edac	mov	w0, #0x0
000000000004edb0	madd	x1, x9, x11, x10
000000000004edb4	ldr	w2, [x14, #0x208]
000000000004edb8	ldr	w3, [x15, #0x20c]
000000000004edbc	mov	w4, #-0x20
000000000004edc0	mov	w5, #0x79b9
000000000004edc4	movk	w5, #0x9e37, lsl #16
000000000004edc8	mov	x6, x24
000000000004edcc	mov	x7, x0
000000000004edd0	ldr	w25, [x16, #0x210]
000000000004edd4	add	w26, w9, w7, lsl #4
000000000004edd8	add	w27, w7, w5
000000000004eddc	eor	w26, w26, w27
000000000004ede0	add	w27, w2, w7, lsr #5
000000000004ede4	eor	w26, w26, w27
000000000004ede8	add	w6, w26, w6
000000000004edec	add	w26, w5, w6
000000000004edf0	add	w27, w3, w6, lsl #4
000000000004edf4	eor	w26, w27, w26
000000000004edf8	add	w27, w25, w6, lsr #5
000000000004edfc	eor	w26, w26, w27
000000000004ee00	add	w7, w26, w7
000000000004ee04	add	w5, w5, w13
000000000004ee08	adds	w4, w4, #0x1
000000000004ee0c	b.lo	0x4edd4
000000000004ee10	eor	w2, w7, w6
000000000004ee14	ucvtf	d2, w2
000000000004ee18	fdiv	d2, d2, d0
000000000004ee1c	fmul	d2, d2, d1
000000000004ee20	fcvtzs	w2, d2
000000000004ee24	mul	w2, w2, w17
000000000004ee28	str	w2, [x1], #0x4
000000000004ee2c	add	w0, w0, #0x1
000000000004ee30	cmp	w0, w12
000000000004ee34	b.ne	0x4edb4
000000000004ee38	add	x9, x9, #0x1
000000000004ee3c	cmp	x9, x8
000000000004ee40	b.ne	0x4eda4
000000000004ee44	mov	w0, #0x1f0
000000000004ee48	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004ee4c	mov	x22, x0
000000000004ee50	mov	x1, x21
000000000004ee54	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
000000000004ee58	ldr	x8, [x20]
000000000004ee5c	ldr	x8, [x8, #0x78]
000000000004ee60	mov	x0, x20
000000000004ee64	mov	w1, #0x1
000000000004ee68	mov	x2, x22
000000000004ee6c	blr	x8
000000000004ee70	add	x2, sp, #0x8
000000000004ee74	mov	x0, x19
000000000004ee78	bl	"_objc_msgSend$setHeliumRef:"
000000000004ee7c	cbz	x22, 0x4ee90
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : IntSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (int)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm2 (int)
```
