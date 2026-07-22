# Sharpen

- **PAE class:** `Sharpen`
- **Plugin UUID:** `6EFE2B74-1702-4829-B98E-E619501D1F16`
- **Node names in corpus:** Sharpen (19), Sharpen copy (1)
- **Corpus usage:** 19 files, 20 instances

## What it does

Sharpen increases apparent detail by subtracting a blurred copy of the image from the original and adding the difference back, boosting local contrast at edges. The verbatim HgcSharpen shader is exactly out = max(color0 + (color0 - blurred) * Amount, 0), where color1 is the pre-blurred input. Amount scales the edge enhancement.

> **Note.** Shader-only. The verbatim HgcSharpen Metal shader (unsharp-mask style: color0 + (color0-blur)*Amount, clamped >=0) is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 2.5 | 0 .. 100 | Edge-enhancement strength (shader hg_Params[0]); higher = crisper/harsher, ~0-100 (default 2.5). |
| Intensity | float | 1 | 1 .. 2 | Secondary strength/gain on the sharpen, ~1-2 (default 1). Continuous float. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcSharpen` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcSharpen.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSharpen`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSharpen` → [`HgcSharpen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSharpen.metal)

```metal
//Metal1.0     
//LEN=00000001a9
[[ visible ]] FragmentOut HgcSharpen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r1 = r0 - r1;
    r1 = r1*hg_Params[0] + r0;
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAESharpen canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESharpen`

```asm
000000000011cde0	mov	w3, #0x2
000000000011cde4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000011cde8	ldur	d0, [x29, #-0x68]
000000000011cdec	fcmp	d0, #0.0
000000000011cdf0	b.ne	0x11ce10
000000000011cdf4	cbz	x21, 0x11ce78
000000000011cdf8	add	x8, sp, #0xd0
000000000011cdfc	mov	x0, x21
000000000011ce00	bl	_objc_msgSend$heliumRef
000000000011ce04	b	0x11ce7c
000000000011ce08	mov	w0, #0x0
000000000011ce0c	b	0x11d2b4
000000000011ce10	mov	x0, x22
000000000011ce14	bl	_objc_msgSend$versionAtCreation
000000000011ce18	mov	x22, x0
000000000011ce1c	sub	x8, x29, #0x78
000000000011ce20	mov	x0, x19
000000000011ce24	mov	x2, x21
000000000011ce28	bl	"_objc_msgSend$getScaleForImage:"
000000000011ce2c	ldp	d8, d9, [x29, #-0x78]
000000000011ce30	mov	x8, #0x3ff0000000000000
000000000011ce34	stur	x8, [x29, #-0x80]
000000000011ce38	ldr	x4, [x23]
000000000011ce3c	sub	x2, x29, #0x80
000000000011ce40	mov	x0, x24
000000000011ce44	mov	w3, #0x1
000000000011ce48	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000011ce4c	sturb	wzr, [x29, #-0x81]
000000000011ce50	ldr	x4, [x23]
000000000011ce54	sub	x2, x29, #0x81
000000000011ce58	mov	x0, x24
000000000011ce5c	mov	w3, #0x3
000000000011ce60	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000011ce64	cbz	x21, 0x11cea0
000000000011ce68	sub	x8, x29, #0x90
000000000011ce6c	mov	x0, x21
000000000011ce70	bl	_objc_msgSend$heliumRef
000000000011ce74	b	0x11cea4
000000000011ce78	str	xzr, [sp, #0xd0]
000000000011ce7c	add	x2, sp, #0xd0
000000000011ce80	mov	x0, x20
000000000011ce84	bl	"_objc_msgSend$setHeliumRef:"
000000000011ce88	ldr	x0, [sp, #0xd0]
000000000011ce8c	cbz	x0, 0x11d2b0
000000000011ce90	ldr	x8, [x0]
000000000011ce94	ldr	x8, [x8, #0x18]
000000000011ce98	blr	x8
000000000011ce9c	b	0x11d2b0
000000000011cea0	stur	xzr, [x29, #-0x90]
000000000011cea4	ldurb	w8, [x29, #-0x81]
000000000011cea8	cmp	w8, #0x1
000000000011ceac	b.ne	0x11d000
000000000011ceb0	add	x8, sp, #0xd0
000000000011ceb4	mov	x0, x19
000000000011ceb8	mov	x2, x20
000000000011cebc	bl	"_objc_msgSend$getInversePixelTransformForImage:"
000000000011cec0	add	x8, sp, #0x50
000000000011cec4	mov	x0, x19
000000000011cec8	mov	x2, x20
000000000011cecc	bl	"_objc_msgSend$getPixelTransformForImage:"
000000000011ced0	mov	w0, #0x1c0
000000000011ced4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000011ced8	mov	x19, x0
000000000011cedc	bl	0x251828 ; symbol stub for: __ZN6HGNodeC2Ev
000000000011cee0	adrp	x8, 634 ; 0x396000
000000000011cee4	add	x8, x8, #0x988
000000000011cee8	add	x8, x8, #0x10
000000000011ceec	str	x8, [x19]
000000000011cef0	stp	xzr, xzr, [x19, #0x198]
000000000011cef4	str	wzr, [x19, #0x1a8]
000000000011cef8	stp	xzr, xzr, [x19, #0x1b0]
000000000011cefc	mov	x23, #0x0
000000000011cf00	mov	x0, x21
000000000011cf04	bl	_objc_msgSend$heliumNode
000000000011cf08	mov	x2, x0
000000000011cf0c	ldr	x8, [x19]
000000000011cf10	ldr	x8, [x8, #0x78]
000000000011cf14	mov	x23, #0x0
000000000011cf18	mov	x0, x19
000000000011cf1c	mov	w1, #0x0
000000000011cf20	blr	x8
000000000011cf24	ldp	d10, d8, [x29, #-0x70]
000000000011cf28	ldur	d9, [x29, #-0x78]
000000000011cf2c	mov	x23, #0x0
000000000011cf30	mov	x0, x21
000000000011cf34	bl	_objc_msgSend$width
000000000011cf38	mov	x22, x0
000000000011cf3c	ldr	d11, [sp, #0xd0]
000000000011cf40	mov	x23, #0x0
000000000011cf44	mov	x0, x21
000000000011cf48	bl	_objc_msgSend$height
000000000011cf4c	add	x8, sp, #0xd0
000000000011cf50	fcvt	s0, d8
000000000011cf54	fcvt	s1, d9
000000000011cf58	fcvt	s2, d10
000000000011cf5c	fabs	d3, d11
000000000011cf60	ucvtf	d4, x22
000000000011cf64	fmul	d3, d3, d4
000000000011cf68	fcvtps	w1, d3
000000000011cf6c	ucvtf	d3, x0
000000000011cf70	ldp	q5, q4, [x8]
000000000011cf74	fcvtn	v5.2s, v5.2d
000000000011cf78	fcvtn2	v5.4s, v4.2d
000000000011cf7c	str	q5, [sp, #0x40]
000000000011cf80	ldp	q5, q4, [x8, #0x20]
000000000011cf84	ldr	d6, [sp, #0xf8]
000000000011cf88	fabs	d6, d6
000000000011cf8c	fmul	d3, d6, d3
000000000011cf90	fcvtps	w2, d3
000000000011cf94	fcvtn	v3.2s, v5.2d
000000000011cf98	fcvtn2	v3.4s, v4.2d
000000000011cf9c	str	q3, [sp, #0x30]
000000000011cfa0	ldp	q4, q3, [sp, #0x50]
000000000011cfa4	fcvtn	v4.2s, v4.2d
000000000011cfa8	fcvtn2	v4.4s, v3.2d
000000000011cfac	str	q4, [sp, #0x20]
000000000011cfb0	ldp	q4, q3, [sp, #0x70]
000000000011cfb4	fcvtn	v4.2s, v4.2d
000000000011cfb8	fcvtn2	v4.4s, v3.2d
000000000011cfbc	str	q4, [sp, #0x10]
000000000011cfc0	add	x3, sp, #0x40
000000000011cfc4	add	x4, sp, #0x30
000000000011cfc8	add	x5, sp, #0x20
000000000011cfcc	add	x6, sp, #0x10
000000000011cfd0	mov	x0, x19
000000000011cfd4	bl	__ZN21HEquirectGaussianBlur4initEfffiiRK9PCVector4IfES3_S3_S3_
000000000011cfd8	ldr	x8, [x19]
000000000011cfdc	ldr	x8, [x8, #0x10]
000000000011cfe0	mov	x23, x19
000000000011cfe4	mov	x0, x19
000000000011cfe8	blr	x8
000000000011cfec	ldr	x8, [x19]
000000000011cff0	ldr	x8, [x8, #0x18]
000000000011cff4	mov	x0, x19
000000000011cff8	blr	x8
000000000011cffc	b	0x11d100
000000000011d000	ldur	x0, [x29, #-0x90]
000000000011d004	str	x0, [sp, #0x8]
000000000011d008	cbz	x0, 0x11d018
000000000011d00c	ldr	x8, [x0]
000000000011d010	ldr	x8, [x8, #0x10]
000000000011d014	blr	x8
000000000011d018	add	x8, sp, #0xd0
000000000011d01c	add	x2, sp, #0x8
000000000011d020	mov	x0, x19
000000000011d024	mov	x3, x21
000000000011d028	mov	x4, x21
000000000011d02c	bl	"_objc_msgSend$smear:fromImage:toImage:"
000000000011d030	ldur	x8, [x29, #-0x90]
000000000011d034	ldr	x0, [sp, #0xd0]
000000000011d038	cmp	x8, x0
000000000011d03c	b.eq	0x11d064
000000000011d040	cbz	x8, 0x11d058
000000000011d044	ldr	x9, [x8]
000000000011d048	ldr	x9, [x9, #0x18]
000000000011d04c	mov	x0, x8
000000000011d050	blr	x9
000000000011d054	ldr	x0, [sp, #0xd0]
000000000011d058	stur	x0, [x29, #-0x90]
000000000011d05c	str	xzr, [sp, #0xd0]
000000000011d060	b	0x11d074
000000000011d064	cbz	x8, 0x11d074
000000000011d068	ldr	x8, [x0]
000000000011d06c	ldr	x8, [x8, #0x18]
000000000011d070	blr	x8
000000000011d074	ldr	x0, [sp, #0x8]
000000000011d078	cbz	x0, 0x11d088
000000000011d07c	ldr	x8, [x0]
000000000011d080	ldr	x8, [x8, #0x18]
000000000011d084	blr	x8
000000000011d088	mov	w0, #0x1b0
000000000011d08c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000011d090	mov	x19, x0
000000000011d094	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
000000000011d098	cmp	w22, #0x0
000000000011d09c	cset	w1, eq
000000000011d0a0	ldur	d0, [x29, #-0x68]
000000000011d0a4	fcvt	s0, d0
000000000011d0a8	fcvt	s1, d8
000000000011d0ac	fcvt	s2, d9
000000000011d0b0	mov	x0, x19
000000000011d0b4	mov	w2, #0x0
000000000011d0b8	mov	w3, #0x0
000000000011d0bc	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
000000000011d0c0	ldur	x2, [x29, #-0x90]
000000000011d0c4	ldr	x8, [x19]
000000000011d0c8	ldr	x8, [x8, #0x78]
000000000011d0cc	mov	x22, #0x0
000000000011d0d0	mov	x0, x19
000000000011d0d4	mov	w1, #0x0
000000000011d0d8	blr	x8
000000000011d0dc	ldr	x8, [x19]
000000000011d0e0	ldr	x8, [x8, #0x10]
000000000011d0e4	mov	x22, x19
000000000011d0e8	mov	x0, x19
000000000011d0ec	blr	x8
000000000011d0f0	ldr	x8, [x19]
000000000011d0f4	ldr	x8, [x8, #0x18]
000000000011d0f8	mov	x0, x19
000000000011d0fc	blr	x8
000000000011d100	mov	w0, #0x1a0
000000000011d104	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000011d108	mov	x22, x0
000000000011d10c	bl	__ZN10HgcSharpenC2Ev
000000000011d110	adrp	x8, 623 ; 0x38c000
000000000011d114	add	x8, x8, #0xca8
000000000011d118	add	x9, x8, #0x10
000000000011d11c	str	x9, [x22]
000000000011d120	ldur	d0, [x29, #-0x80]
000000000011d124	fcvt	s0, d0
000000000011d128	ldr	x8, [x8, #0x70]
000000000011d12c	mov	x0, x22
000000000011d130	mov	w1, #0x0
000000000011d134	mov.16b	v1, v0
000000000011d138	mov.16b	v2, v0
000000000011d13c	mov.16b	v3, v0
000000000011d140	blr	x8
000000000011d144	cbz	x21, 0x11d15c
000000000011d148	add	x8, sp, #0xd0
000000000011d14c	mov	x0, x21
000000000011d150	bl	_objc_msgSend$heliumRef
000000000011d154	ldr	x2, [sp, #0xd0]
000000000011d158	b	0x11d164
000000000011d15c	mov	x2, #0x0
000000000011d160	str	xzr, [sp, #0xd0]
000000000011d164	ldr	x8, [x22]
000000000011d168	ldr	x8, [x8, #0x78]
000000000011d16c	mov	x0, x22
000000000011d170	mov	w1, #0x0
000000000011d174	blr	x8
000000000011d178	ldr	x0, [sp, #0xd0]
000000000011d17c	cbz	x0, 0x11d18c
000000000011d180	ldr	x8, [x0]
000000000011d184	ldr	x8, [x8, #0x18]
000000000011d188	blr	x8
000000000011d18c	ldr	x8, [x22]
000000000011d190	ldr	x8, [x8, #0x78]
000000000011d194	mov	x0, x22
000000000011d198	mov	w1, #0x1
000000000011d19c	mov	x2, x19
000000000011d1a0	blr	x8
000000000011d1a4	mov	w0, #0x1a0
000000000011d1a8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000011d1ac	mov	x21, x0
000000000011d1b0	bl	0x251798 ; symbol stub for: __ZN6HGCropC1Ev
000000000011d1b4	ldr	x8, [x21]
000000000011d1b8	ldr	x8, [x8, #0x78]
000000000011d1bc	mov	x0, x21
000000000011d1c0	mov	w1, #0x0
000000000011d1c4	mov	x2, x22
000000000011d1c8	blr	x8
000000000011d1cc	mov	x0, x20
000000000011d1d0	bl	_objc_msgSend$width
000000000011d1d4	mov	x23, x0
000000000011d1d8	mov	x0, x20
000000000011d1dc	bl	_objc_msgSend$height
000000000011d1e0	mov	x24, x0
000000000011d1e4	mov	x0, x20
000000000011d1e8	bl	_objc_msgSend$width
000000000011d1ec	mov	x25, x0
000000000011d1f0	mov	x0, x20
000000000011d1f4	bl	_objc_msgSend$height
000000000011d1f8	ucvtf	d0, x23
000000000011d1fc	fmov	d1, #-0.50000000
000000000011d200	fmul	d0, d0, d1
000000000011d204	fcvt	s0, d0
000000000011d208	ucvtf	d2, x24
000000000011d20c	fmul	d1, d2, d1
000000000011d210	fcvt	s1, d1
000000000011d214	ucvtf	d2, x25, #0x1
000000000011d218	fcvt	s2, d2
000000000011d21c	ucvtf	d3, x0, #0x1
000000000011d220	fcvt	s3, d3
000000000011d224	ldr	x8, [x21]
000000000011d228	ldr	x8, [x8, #0x60]
000000000011d22c	mov	x0, x21
000000000011d230	mov	w1, #0x0
000000000011d234	blr	x8
000000000011d238	str	x21, [sp, #0xd0]
000000000011d23c	ldr	x8, [x21]
000000000011d240	ldr	x8, [x8, #0x10]
000000000011d244	mov	x0, x21
000000000011d248	blr	x8
000000000011d24c	add	x2, sp, #0xd0
000000000011d250	mov	x0, x20
000000000011d254	bl	"_objc_msgSend$setHeliumRef:"
000000000011d258	ldr	x0, [sp, #0xd0]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm1 (float)
    - parm3 (bool)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm3 (bool)
```
