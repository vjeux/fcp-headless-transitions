# Contrast

- **PAE class:** `Contrast`
- **Plugin UUID:** `B13B57AC-811B-4A24-BB5A-2167A3C66F5F`
- **Node names in corpus:** Contrast (165), Contrast copy (49), Contrast 1 (3), C (2), c 2 (1), c 1 (1)
- **Corpus usage:** 136 files, 224 instances

## What it does

Contrast applies an S-shaped tone curve around a Pivot point: for Contrast < 1 it compresses tones toward the pivot (flatter), for Contrast > 1 it expands them (punchier). FCP builds the curve as a cubic Bezier (a rotation of the y=x line by an angle derived from Contrast), so it is NOT a simple scale-around-mid. Reverse-engineered (CONTRAST_RE.md) but not yet shipped, because an affine approximation is faithful only for Contrast < 1.

> **Note.** Reverse-engineered in evidence/CONTRAST_RE.md; not implemented (the Bezier LUT must be reproduced exactly rather than fitted). For Contrast < 1 the transfer is nearly affine with a fixed point around code 61-62 (NOT 128); for Contrast > 1 it is a genuine S-curve.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Contrast | float | 1 | 0.3 .. 3 | Contrast strength, 0.3-3. 1 = identity, <1 flattens (compress toward pivot), >1 punches up (expand). The primary knob. *(keyframed in 3 instances)* |
| Pivot | float | 0.5 | 0 .. 1 | The tonal fixed point the curve rotates around, 0-1 (default 0.5). Pixels at the pivot luminance are unchanged. *(keyframed in 2 instances)* |
| Smooth Contrast | bool | 0 | 0 .. 1 | Toggle: use the smoother Bezier ease vs a harder curve. |
| Luminance Only | bool | 0 | 0 .. 1 | Toggle: apply the contrast to luminance only (preserve chroma) rather than per-channel RGB. |
| Clip Color Values | enum(int) | 0 | 0 .. 3 | Out-of-range clamping mode, 0-3. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the contrasted result over the original, 0-1 continuous. NOT a boolean (only 1 sampled). *(keyframed in 5 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 4 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

This filter has **no dedicated `Hgc*` fragment shader**: its per-pixel work is done by a Helium primitive (a compiled C++ image node) driven from the CPU class. The code below is **verbatim** from the user's licensed FCP install — the ARM64 disassembly of the plug-in's render method, extracted with `tools/re/disasm_pae.py`. It shows exactly which parameters are read and which primitive is constructed. Nothing is paraphrased.

**Helium primitive(s) constructed:** `HGBitmap`, `HGBitmapLoader`. The primitive's math lives in the Helium framework binary; disassemble it with `otool -arch arm64 -tV "…/Helium.framework/Versions/A/Helium" | grep -A400 '<primitive>'`.

### CPU render method — `-[PAEContrast canThrowRenderOutput:withInput:withInfo:]`
Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEContrast`

```asm
000000000001e1e4	mov	w3, #0x1
000000000001e1e8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001e1ec	ldr	x4, [x22]
000000000001e1f0	add	x2, sp, #0x50
000000000001e1f4	mov	x0, x19
000000000001e1f8	mov	w3, #0x2
000000000001e1fc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001e200	ldr	x4, [x22]
000000000001e204	add	x2, sp, #0x48
000000000001e208	mov	x0, x19
000000000001e20c	mov	w3, #0x3
000000000001e210	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000001e214	ldr	x4, [x22]
000000000001e218	add	x2, sp, #0x4f
000000000001e21c	mov	x0, x19
000000000001e220	mov	w3, #0x4
000000000001e224	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001e228	ldr	x4, [x22]
000000000001e22c	add	x2, sp, #0x4e
000000000001e230	mov	x0, x19
000000000001e234	mov	w3, #0x5
000000000001e238	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000001e23c	ldr	w24, [sp, #0x48]
000000000001e240	ldr	x2, [x22]
000000000001e244	mov	x0, x19
000000000001e248	bl	"_objc_msgSend$mixAmountAtTime:"
000000000001e24c	mov.16b	v8, v0
000000000001e250	cbz	x20, 0x1e264
000000000001e254	add	x8, sp, #0x40
000000000001e258	mov	x0, x20
000000000001e25c	bl	_objc_msgSend$heliumRef
000000000001e260	b	0x1e268
000000000001e264	str	xzr, [sp, #0x40]
000000000001e268	and	w26, w24, #0xfffffffd
000000000001e26c	and	w27, w24, #0xfffffffe
000000000001e270	ldrb	w8, [sp, #0x4f]
000000000001e274	cmp	w8, #0x1
000000000001e278	b.ne	0x1e3fc
000000000001e27c	mov	w0, #0x0
000000000001e280	mov	w1, #0x0
000000000001e284	mov	w2, #0x400
000000000001e288	mov	w3, #0x1
000000000001e28c	bl	0x250a48 ; symbol stub for: _HGRectMake4i
000000000001e290	mov	x24, x0
000000000001e294	mov	x25, x1
000000000001e298	mov	w0, #0x80
000000000001e29c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001e2a0	mov	x20, x0
000000000001e2a4	mov	x1, x24
000000000001e2a8	mov	x2, x25
000000000001e2ac	mov	w3, #0x1c
000000000001e2b0	bl	0x25193c ; symbol stub for: __ZN8HGBitmapC1E6HGRect8HGFormat
000000000001e2b4	ldr	x2, [x20, #0x50]
000000000001e2b8	ldp	d1, d0, [sp, #0x50]
000000000001e2bc	mov	x0, x23
000000000001e2c0	bl	"_objc_msgSend$generateLut:forContrast:andPivot:"
000000000001e2c4	ldr	x4, [x22]
000000000001e2c8	add	x2, sp, #0x58
000000000001e2cc	mov	x0, x19
000000000001e2d0	mov	w3, #0x1
000000000001e2d4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001e2d8	ldr	x4, [x22]
000000000001e2dc	add	x2, sp, #0x50
000000000001e2e0	mov	x0, x19
000000000001e2e4	mov	w3, #0x2
000000000001e2e8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000001e2ec	ldr	x4, [x22]
000000000001e2f0	add	x2, sp, #0x48
000000000001e2f4	mov	x0, x19
000000000001e2f8	mov	w3, #0x3
000000000001e2fc	bl	"_objc_msgSend$getIntValue:fromParm:atFxTime:"
000000000001e300	ldr	x2, [x22]
000000000001e304	mov	x0, x19
000000000001e308	bl	"_objc_msgSend$mixAmountAtTime:"
000000000001e30c	mov.16b	v8, v0
000000000001e310	mov	w0, #0x1f0
000000000001e314	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000001e318	mov	x22, x0
000000000001e31c	mov	x1, x20
000000000001e320	bl	0x2511f8 ; symbol stub for: __ZN14HGBitmapLoaderC1EP8HGBitmap
000000000001e324	ldrb	w8, [sp, #0x4e]
000000000001e328	cmp	w8, #0x1
000000000001e32c	b.ne	0x1e548
000000000001e330	ldr	x0, [sp, #0x40]
000000000001e334	str	x0, [sp, #0x30]
000000000001e338	cbz	x0, 0x1e348
000000000001e33c	ldr	x8, [x0]
000000000001e340	ldr	x8, [x8, #0x10]
000000000001e344	blr	x8
000000000001e348	str	x22, [sp, #0x28]
000000000001e34c	cbz	x22, 0x1e360
000000000001e350	ldr	x8, [x22]
000000000001e354	ldr	x8, [x8, #0x10]
000000000001e358	mov	x0, x22
000000000001e35c	blr	x8
000000000001e360	cmp	w27, #0x2
000000000001e364	cset	w2, eq
000000000001e368	cmp	w26, #0x1
000000000001e36c	cset	w3, eq
000000000001e370	add	x8, sp, #0x38
000000000001e374	add	x0, sp, #0x30
000000000001e378	add	x1, sp, #0x28
000000000001e37c	mov.16b	v0, v8
000000000001e380	bl	0x250e68 ; symbol stub for: __Z28createContrastBezierLumaNode5HGRefI6HGNodeES1_bbd
000000000001e384	ldr	x0, [sp, #0x28]
000000000001e388	cbz	x0, 0x1e398
000000000001e38c	ldr	x8, [x0]
000000000001e390	ldr	x8, [x8, #0x18]
000000000001e394	blr	x8
000000000001e398	ldr	x0, [sp, #0x30]
000000000001e39c	cbz	x0, 0x1e3ac
000000000001e3a0	ldr	x8, [x0]
000000000001e3a4	ldr	x8, [x8, #0x18]
000000000001e3a8	blr	x8
000000000001e3ac	ldr	x0, [sp, #0x38]
000000000001e3b0	str	x0, [sp, #0x20]
000000000001e3b4	cbz	x0, 0x1e3c4
000000000001e3b8	ldr	x8, [x0]
000000000001e3bc	ldr	x8, [x8, #0x10]
000000000001e3c0	blr	x8
000000000001e3c4	add	x2, sp, #0x20
000000000001e3c8	mov	x0, x21
000000000001e3cc	bl	"_objc_msgSend$setHeliumRef:"
000000000001e3d0	ldr	x0, [sp, #0x20]
000000000001e3d4	cbz	x0, 0x1e3e4
000000000001e3d8	ldr	x8, [x0]
000000000001e3dc	ldr	x8, [x8, #0x18]
000000000001e3e0	blr	x8
000000000001e3e4	ldr	x0, [sp, #0x38]
000000000001e3e8	cbz	x0, 0x1e610
000000000001e3ec	ldr	x8, [x0]
000000000001e3f0	ldr	x8, [x8, #0x18]
000000000001e3f4	blr	x8
000000000001e3f8	b	0x1e610
000000000001e3fc	ldrb	w8, [sp, #0x4e]
000000000001e400	cmp	w8, #0x1
000000000001e404	b.ne	0x1e4a8
000000000001e408	ldr	x0, [sp, #0x40]
000000000001e40c	str	x0, [sp, #0x8]
000000000001e410	cbz	x0, 0x1e420
000000000001e414	ldr	x8, [x0]
000000000001e418	ldr	x8, [x8, #0x10]
000000000001e41c	blr	x8
000000000001e420	cmp	w27, #0x2
000000000001e424	cset	w1, eq
000000000001e428	cmp	w26, #0x1
000000000001e42c	cset	w2, eq
000000000001e430	ldp	d1, d0, [sp, #0x50]
000000000001e434	add	x8, sp, #0x38
000000000001e438	add	x0, sp, #0x8
000000000001e43c	mov.16b	v2, v8
000000000001e440	bl	0x250dfc ; symbol stub for: __Z22createContrastLumaNode5HGRefI6HGNodeEddbbd
000000000001e444	ldr	x0, [sp, #0x8]
000000000001e448	cbz	x0, 0x1e458
000000000001e44c	ldr	x8, [x0]
000000000001e450	ldr	x8, [x8, #0x18]
000000000001e454	blr	x8
000000000001e458	ldr	x0, [sp, #0x38]
000000000001e45c	str	x0, [sp, #0x20]
000000000001e460	cbz	x0, 0x1e470
000000000001e464	ldr	x8, [x0]
000000000001e468	ldr	x8, [x8, #0x10]
000000000001e46c	blr	x8
000000000001e470	add	x2, sp, #0x20
000000000001e474	mov	x0, x21
000000000001e478	bl	"_objc_msgSend$setHeliumRef:"
000000000001e47c	ldr	x0, [sp, #0x20]
000000000001e480	cbz	x0, 0x1e490
000000000001e484	ldr	x8, [x0]
000000000001e488	ldr	x8, [x8, #0x18]
000000000001e48c	blr	x8
000000000001e490	ldr	x0, [sp, #0x38]
000000000001e494	cbz	x0, 0x1e634
000000000001e498	ldr	x8, [x0]
000000000001e49c	ldr	x8, [x8, #0x18]
000000000001e4a0	blr	x8
000000000001e4a4	b	0x1e634
000000000001e4a8	ldr	x0, [sp, #0x40]
000000000001e4ac	str	x0, [sp]
000000000001e4b0	cbz	x0, 0x1e4c0
000000000001e4b4	ldr	x8, [x0]
000000000001e4b8	ldr	x8, [x8, #0x10]
000000000001e4bc	blr	x8
000000000001e4c0	cmp	w27, #0x2
000000000001e4c4	cset	w1, eq
000000000001e4c8	cmp	w26, #0x1
000000000001e4cc	cset	w2, eq
000000000001e4d0	ldp	d1, d0, [sp, #0x50]
000000000001e4d4	add	x8, sp, #0x38
000000000001e4d8	mov	x0, sp
000000000001e4dc	mov.16b	v2, v8
000000000001e4e0	bl	0x250dd8 ; symbol stub for: __Z21createContrastRGBNode5HGRefI6HGNodeEddbbd
000000000001e4e4	ldr	x0, [sp]
000000000001e4e8	cbz	x0, 0x1e4f8
000000000001e4ec	ldr	x8, [x0]
000000000001e4f0	ldr	x8, [x8, #0x18]
000000000001e4f4	blr	x8
000000000001e4f8	ldr	x0, [sp, #0x38]
000000000001e4fc	str	x0, [sp, #0x20]
000000000001e500	cbz	x0, 0x1e510
000000000001e504	ldr	x8, [x0]
000000000001e508	ldr	x8, [x8, #0x10]
000000000001e50c	blr	x8
000000000001e510	add	x2, sp, #0x20
000000000001e514	mov	x0, x21
000000000001e518	bl	"_objc_msgSend$setHeliumRef:"
000000000001e51c	ldr	x0, [sp, #0x20]
000000000001e520	cbz	x0, 0x1e530
000000000001e524	ldr	x8, [x0]
000000000001e528	ldr	x8, [x8, #0x18]
000000000001e52c	blr	x8
000000000001e530	ldr	x0, [sp, #0x38]
000000000001e534	cbz	x0, 0x1e634
000000000001e538	ldr	x8, [x0]
000000000001e53c	ldr	x8, [x8, #0x18]
000000000001e540	blr	x8
000000000001e544	b	0x1e634
000000000001e548	ldr	x0, [sp, #0x40]
000000000001e54c	str	x0, [sp, #0x18]
000000000001e550	cbz	x0, 0x1e560
000000000001e554	ldr	x8, [x0]
000000000001e558	ldr	x8, [x8, #0x10]
000000000001e55c	blr	x8
000000000001e560	str	x22, [sp, #0x10]
000000000001e564	cbz	x22, 0x1e578
000000000001e568	ldr	x8, [x22]
000000000001e56c	ldr	x8, [x8, #0x10]
000000000001e570	mov	x0, x22
000000000001e574	blr	x8
000000000001e578	cmp	w27, #0x2
000000000001e57c	cset	w2, eq
000000000001e580	cmp	w26, #0x1
000000000001e584	cset	w3, eq
000000000001e588	add	x8, sp, #0x38
000000000001e58c	add	x0, sp, #0x18
000000000001e590	add	x1, sp, #0x10
000000000001e594	mov.16b	v0, v8
000000000001e598	bl	0x250e5c ; symbol stub for: __Z27createContrastBezierRGBNode5HGRefI6HGNodeES1_bbd
000000000001e59c	ldr	x0, [sp, #0x10]
000000000001e5a0	cbz	x0, 0x1e5b0
000000000001e5a4	ldr	x8, [x0]
000000000001e5a8	ldr	x8, [x8, #0x18]
000000000001e5ac	blr	x8
000000000001e5b0	ldr	x0, [sp, #0x18]
000000000001e5b4	cbz	x0, 0x1e5c4
000000000001e5b8	ldr	x8, [x0]
000000000001e5bc	ldr	x8, [x8, #0x18]
000000000001e5c0	blr	x8
000000000001e5c4	ldr	x0, [sp, #0x38]
000000000001e5c8	str	x0, [sp, #0x20]
000000000001e5cc	cbz	x0, 0x1e5dc
000000000001e5d0	ldr	x8, [x0]
000000000001e5d4	ldr	x8, [x8, #0x10]
000000000001e5d8	blr	x8
000000000001e5dc	add	x2, sp, #0x20
000000000001e5e0	mov	x0, x21
000000000001e5e4	bl	"_objc_msgSend$setHeliumRef:"
000000000001e5e8	ldr	x0, [sp, #0x20]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (int)
    - parm4 (bool)
    - parm5 (bool)
    - host Mix
    - parm1 (float)
    - parm2 (float)
    - parm3 (int)
    - host Mix

```
