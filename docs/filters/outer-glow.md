# Outer Glow

- **PAE class:** `Outer Glow`
- **Plugin UUID:** `A7077089-AA05-44F8-98E8-0C90E446F447`
- **Node names in corpus:** Outer Glow (52), Outer Glow copy (6)
- **Corpus usage:** 29 files, 58 instances

## What it does

Outer Glow adds a soft colored halo radiating outward from the bright/opaque areas of the image (typically text or a keyed subject). Radius sets how far the halo spreads, Brightness how intense it is, and the Range picks how much of the tonal range is treated as "glowing". Inner and Outer colors tint the near and far parts of the halo.

> **Note.** Not implemented; description is the standard Apple Motion "Outer Glow" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Inner Color | color | - | - | Tint of the halo close to the source edge. |
| Outer Color | color | - | - | Tint of the halo at its outer extent. |
| Radius | float (pixels) | 2 | 0 .. 300 | How far the glow spreads outward, ~0-300 (default 2). *(keyframed in 1 instance)* |
| Brightness | float | 15 | 0 .. 100 | Intensity of the glow, ~0-100 (default 15). |
| Range | float | 0.25 | 0 .. 1 | Portion of the tonal range treated as the glow source, 0-1 (default 0.25). |
| Mix | float | 1 | 0.4 .. 1 | Wet/dry blend, 0-1 continuous. |
| Horizontal | float (percent) | 100 | 100 .. 100 | Horizontal scale of the glow spread, percent (default 100). |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical scale of the glow spread, percent (default 100). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcOuterGlowColorize`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcOuterGlowColorize` → [`HgcOuterGlowColorize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcOuterGlowColorize.metal)

```metal
//Metal1.0     
//LEN=0000000227
[[ visible ]] FragmentOut HgcOuterGlowColorize_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0.w = color0.w;
    r0.x = r0.w*hg_Params[3].x;
    r0.x = fmin(r0.x, c0.x);
    r1.xyz = mix(hg_Params[0].xyz, hg_Params[1].xyz, r0.xxx);
    r0.x = r0.x*hg_Params[2].x;
    r1.w = fmin(r0.x, c0.x);
    r1.xyz = r1.xyz*r1.www;
    output.color0 = r1;
    return output;
}
```

### Metal fragment shader — `HgcOuterGlowLumaWeight`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcOuterGlowLumaWeight` → [`HgcOuterGlowLumaWeight.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcOuterGlowLumaWeight.metal)

```metal
//Metal1.0     
//LEN=000000015b
[[ visible ]] FragmentOut HgcOuterGlowLumaWeight_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r1 = color1;
    r2.x = dot(r1, hg_Params[0]);
    output.color0 = mix(r0, r1, r2.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEOuterGlow canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEOuterGlow`

```asm
0000000000063acc	mov	w3, #0x1
0000000000063ad0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000063ad4	ldur	d0, [x29, #-0x58]
0000000000063ad8	fcmp	d0, #0.0
0000000000063adc	b.ne	0x63afc
0000000000063ae0	cbz	x20, 0x63c48
0000000000063ae4	add	x8, sp, #0x68
0000000000063ae8	mov	x0, x20
0000000000063aec	bl	_objc_msgSend$heliumRef
0000000000063af0	b	0x63c4c
0000000000063af4	mov	w0, #0x0
0000000000063af8	b	0x63eb0
0000000000063afc	add	x8, sp, #0x68
0000000000063b00	mov	x0, x21
0000000000063b04	mov	x2, x20
0000000000063b08	bl	"_objc_msgSend$getScaleForImage:"
0000000000063b0c	ldp	d8, d9, [sp, #0x68]
0000000000063b10	fcmp	d8, d9
0000000000063b14	fcsel	d10, d8, d9, gt
0000000000063b18	ldur	d0, [x29, #-0x58]
0000000000063b1c	fmul	d0, d0, d10
0000000000063b20	stur	d0, [x29, #-0x58]
0000000000063b24	ldr	x4, [x22]
0000000000063b28	add	x2, sp, #0x60
0000000000063b2c	mov	x0, x24
0000000000063b30	mov	w3, #0x6
0000000000063b34	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000063b38	ldr	d0, [sp, #0x60]
0000000000063b3c	adrp	x8, 517 ; 0x268000
0000000000063b40	ldr	d11, [x8, #0xc48]
0000000000063b44	fmul	d0, d0, d11
0000000000063b48	fdiv	d1, d8, d10
0000000000063b4c	fmul	d0, d1, d0
0000000000063b50	str	d0, [sp, #0x60]
0000000000063b54	ldr	x4, [x22]
0000000000063b58	add	x2, sp, #0x58
0000000000063b5c	mov	x0, x24
0000000000063b60	mov	w3, #0x7
0000000000063b64	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000063b68	ldr	d0, [sp, #0x58]
0000000000063b6c	fmul	d0, d0, d11
0000000000063b70	fdiv	d1, d9, d10
0000000000063b74	fmul	d0, d1, d0
0000000000063b78	str	d0, [sp, #0x58]
0000000000063b7c	ldr	x4, [x22]
0000000000063b80	add	x2, sp, #0x50
0000000000063b84	mov	x0, x24
0000000000063b88	mov	w3, #0x2
0000000000063b8c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000063b90	ldr	x6, [x22]
0000000000063b94	add	x2, sp, #0x48
0000000000063b98	add	x3, sp, #0x40
0000000000063b9c	add	x4, sp, #0x38
0000000000063ba0	mov	x0, x24
0000000000063ba4	mov	w5, #0x3
0000000000063ba8	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
0000000000063bac	ldr	x6, [x22]
0000000000063bb0	add	x2, sp, #0x30
0000000000063bb4	add	x3, sp, #0x28
0000000000063bb8	add	x4, sp, #0x20
0000000000063bbc	mov	x0, x24
0000000000063bc0	mov	w5, #0x4
0000000000063bc4	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
0000000000063bc8	ldr	x4, [x22]
0000000000063bcc	add	x2, sp, #0x18
0000000000063bd0	mov	x0, x24
0000000000063bd4	mov	w3, #0x5
0000000000063bd8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
0000000000063bdc	ldr	x4, [x22]
0000000000063be0	add	x2, sp, #0x17
0000000000063be4	mov	x0, x24
0000000000063be8	mov	w3, #0x8
0000000000063bec	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
0000000000063bf0	ldr	d0, [sp, #0x18]
0000000000063bf4	adrp	x8, 518 ; 0x269000
0000000000063bf8	ldr	d1, [x8, #0x5c8]
0000000000063bfc	fcmp	d0, d1
0000000000063c00	fcsel	d0, d1, d0, mi
0000000000063c04	str	d0, [sp, #0x18]
0000000000063c08	ldr	d0, [sp, #0x50]
0000000000063c0c	fmov	d1, #4.00000000
0000000000063c10	fmul	d0, d0, d1
0000000000063c14	str	d0, [sp, #0x50]
0000000000063c18	mov	x0, x23
0000000000063c1c	bl	_objc_msgSend$versionAtCreation
0000000000063c20	mov	x23, x0
0000000000063c24	ldr	d0, [sp, #0x50]
0000000000063c28	fmov	d1, #12.50000000
0000000000063c2c	fdiv	d0, d0, d1
0000000000063c30	str	d0, [sp, #0x50]
0000000000063c34	cbz	x20, 0x63c70
0000000000063c38	add	x8, sp, #0x8
0000000000063c3c	mov	x0, x20
0000000000063c40	bl	_objc_msgSend$heliumRef
0000000000063c44	b	0x63c74
0000000000063c48	str	xzr, [sp, #0x68]
0000000000063c4c	add	x2, sp, #0x68
0000000000063c50	mov	x0, x19
0000000000063c54	bl	"_objc_msgSend$setHeliumRef:"
0000000000063c58	ldr	x0, [sp, #0x68]
0000000000063c5c	cbz	x0, 0x63eac
0000000000063c60	ldr	x8, [x0]
0000000000063c64	ldr	x8, [x8, #0x18]
0000000000063c68	blr	x8
0000000000063c6c	b	0x63eac
0000000000063c70	str	xzr, [sp, #0x8]
0000000000063c74	mov	w0, #0x1b0
0000000000063c78	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000063c7c	mov	x22, x0
0000000000063c80	bl	0x2511bc ; symbol stub for: __ZN13HGaussianBlurC1Ev
0000000000063c84	ldur	d0, [x29, #-0x58]
0000000000063c88	fcvt	s0, d0
0000000000063c8c	ldp	d2, d1, [sp, #0x58]
0000000000063c90	fcvt	s1, d1
0000000000063c94	fcvt	s2, d2
0000000000063c98	cmp	w23, #0x0
0000000000063c9c	cset	w1, eq
0000000000063ca0	mov	x0, x22
0000000000063ca4	mov	w2, #0x0
0000000000063ca8	mov	w3, #0x0
0000000000063cac	bl	0x2511b0 ; symbol stub for: __ZN13HGaussianBlur4initEfffbbb
0000000000063cb0	ldr	x2, [sp, #0x8]
0000000000063cb4	ldr	x8, [x22]
0000000000063cb8	ldr	x8, [x8, #0x78]
0000000000063cbc	mov	x23, #0x0
0000000000063cc0	mov	x0, x22
0000000000063cc4	mov	w1, #0x0
0000000000063cc8	blr	x8
0000000000063ccc	ldr	x8, [x22]
0000000000063cd0	ldr	x8, [x8, #0x10]
0000000000063cd4	mov	x23, x22
0000000000063cd8	mov	x0, x22
0000000000063cdc	blr	x8
0000000000063ce0	mov	w0, #0x1a0
0000000000063ce4	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000063ce8	mov	x23, x0
0000000000063cec	bl	__ZN20HgcOuterGlowColorizeC1Ev
0000000000063cf0	ldp	d1, d0, [sp, #0x28]
0000000000063cf4	fcvt	s0, d0
0000000000063cf8	fcvt	s1, d1
0000000000063cfc	ldr	d2, [sp, #0x20]
0000000000063d00	fcvt	s2, d2
0000000000063d04	ldr	x8, [x23]
0000000000063d08	ldr	x8, [x8, #0x60]
0000000000063d0c	fmov	s3, #1.00000000
0000000000063d10	mov	x0, x23
0000000000063d14	mov	w1, #0x0
0000000000063d18	blr	x8
0000000000063d1c	ldp	d1, d0, [sp, #0x40]
0000000000063d20	fcvt	s0, d0
0000000000063d24	fcvt	s1, d1
0000000000063d28	ldr	d2, [sp, #0x38]
0000000000063d2c	fcvt	s2, d2
0000000000063d30	ldr	x8, [x23]
0000000000063d34	ldr	x8, [x8, #0x60]
0000000000063d38	fmov	s3, #1.00000000
0000000000063d3c	mov	x0, x23
0000000000063d40	mov	w1, #0x1
0000000000063d44	blr	x8
0000000000063d48	ldr	d0, [sp, #0x50]
0000000000063d4c	fcvt	s0, d0
0000000000063d50	ldr	x8, [x23]
0000000000063d54	ldr	x8, [x8, #0x60]
0000000000063d58	fmov	s3, #1.00000000
0000000000063d5c	mov	x0, x23
0000000000063d60	mov	w1, #0x2
0000000000063d64	mov.16b	v1, v0
0000000000063d68	mov.16b	v2, v0
0000000000063d6c	blr	x8
0000000000063d70	ldr	d1, [sp, #0x18]
0000000000063d74	movi.2d	v0, #0000000000000000
0000000000063d78	fcmp	d1, #0.0
0000000000063d7c	b.le	0x63d8c
0000000000063d80	fmov	d0, #1.00000000
0000000000063d84	fdiv	d0, d0, d1
0000000000063d88	fcvt	s0, d0
0000000000063d8c	ldr	x8, [x23]
0000000000063d90	ldr	x8, [x8, #0x60]
0000000000063d94	movi.2d	v1, #0000000000000000
0000000000063d98	movi.2d	v2, #0000000000000000
0000000000063d9c	movi.2d	v3, #0000000000000000
0000000000063da0	mov	x0, x23
0000000000063da4	mov	w1, #0x3
0000000000063da8	blr	x8
0000000000063dac	ldr	x8, [x23]
0000000000063db0	ldr	x8, [x8, #0x78]
0000000000063db4	mov	x0, x23
0000000000063db8	mov	w1, #0x0
0000000000063dbc	mov	x2, x22
0000000000063dc0	blr	x8
0000000000063dc4	mov	w0, #0x1a0
0000000000063dc8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
0000000000063dcc	mov	x24, x0
0000000000063dd0	bl	__ZN22HgcOuterGlowLumaWeightC1Ev
0000000000063dd4	str	x24, [sp]
0000000000063dd8	ldr	x8, [x24]
0000000000063ddc	ldr	x8, [x8, #0x60]
0000000000063de0	movi.2d	v0, #0000000000000000
0000000000063de4	movi.2d	v1, #0000000000000000
0000000000063de8	movi.2d	v2, #0000000000000000
0000000000063dec	fmov	s3, #1.00000000
0000000000063df0	mov	x0, x24
0000000000063df4	mov	w1, #0x0
0000000000063df8	blr	x8
0000000000063dfc	ldr	x0, [sp]
0000000000063e00	ldr	x8, [x0]
0000000000063e04	ldr	x8, [x8, #0x78]
0000000000063e08	mov	w1, #0x0
0000000000063e0c	mov	x2, x23
0000000000063e10	blr	x8
0000000000063e14	ldp	x0, x2, [sp]
0000000000063e18	ldr	x8, [x0]
0000000000063e1c	ldr	x8, [x8, #0x78]
0000000000063e20	mov	w1, #0x1
0000000000063e24	blr	x8
0000000000063e28	ldrb	w8, [sp, #0x17]
0000000000063e2c	cmp	w8, #0x1
0000000000063e30	b.ne	0x63e48
0000000000063e34	mov	x2, sp
0000000000063e38	mov	x0, x21
0000000000063e3c	mov	x3, x20
0000000000063e40	mov	x4, x19
0000000000063e44	bl	"_objc_msgSend$crop:fromImage:toImage:"
0000000000063e48	mov	x2, sp
0000000000063e4c	mov	x0, x19
0000000000063e50	bl	"_objc_msgSend$setHeliumRef:"
0000000000063e54	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : ColorParameter
    parm4 : ColorParameter
    parm5 : FloatSlider
    parm6 : FloatSlider
    parm7 : FloatSlider
    parm8 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm6 (float)
    - parm7 (float)
    - parm2 (float)
    - parm3 (colour)
    - parm4 (colour)
    - parm5 (float)
    - parm8 (bool)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
    slot 2  <-  parm8 (bool)
    slot 3  <-  parm8 (bool)
```
