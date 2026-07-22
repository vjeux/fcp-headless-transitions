# Line Screen

- **PAE class:** `Line Screen`
- **Plugin UUID:** `57174A04-8434-4179-A8EB-66C88B63F308`
- **Node names in corpus:** Line Screen (48)
- **Corpus usage:** 5 files, 48 instances

## What it does

Line Screen renders the image as a printed line-screen halftone: tone is represented by the thickness of parallel lines. The verbatim HgcLineScreen shader takes the pixel luma (dot with hg_Params[5]), compares it against a repeating triangular line profile (fract of a dotted coordinate), and thresholds with a contrast slope. Angle rotates the lines, Scale sets their frequency, and Skew/Stretch shear them.

> **Note.** Shader-only. The verbatim HgcLineScreen Metal shader is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the line pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0.4992 | 0.4992 .. 1.571 | Rotation of the lines, radians (default ~0.5). |
| Scale | float | 10 | 10 .. 22 | Line frequency / spacing, ~10-22 (default 10). |
| Skew | float | 0 | 0 .. 0.21 | Shears the line pattern, 0-0.21 (default 0). |
| Stretch | float | 0 | 0 .. 0.34 | Stretches the line cells, 0-0.34 (default 0). |
| Contrast | float | 0.5 | 0 .. 0.5 | Threshold slope / hardness of the lines (shader hg_Params[2]), 0-0.5 (default 0.5). |
| Mix | float | 1 | 0.5 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcLineScreen` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcLineScreen.metal` (Phase-1 done, Phase-2 open).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcLineScreen`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcLineScreen` → [`HgcLineScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLineScreen.metal)

```metal
//Metal1.0     
//LEN=0000000313
[[ visible ]] FragmentOut HgcLineScreen_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 texCoord1)
{
    const float4 c0 = float4(1.000000000, 0.5000000000, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = texCoord1 + hg_Params[3];
    r0 = r0 - hg_Params[0];
    r0 = r0*hg_Params[4];
    r0.xyz = float3(dot(r0, hg_Params[1]));
    r0.xyz = fract(r0.xyz);
    r1 = color0;
    r2.xyz = c0.xxx - r0.xyz;
    r0.xyz = fmin(r2.xyz, r0.xyz);
    r0.xyz = r0.xyz + r0.xyz;
    r2.xyz = float3(dot(r1, hg_Params[5]));
    r2.xyz = r2.xyz - r0.xyz;
    r2.xyz = clamp(r2.xyz*hg_Params[2].xyz + c0.yyy, 0.00000f, 1.00000f);
    r1.xyz = r2.xyz*r1.www;
    output.color0 = r1;
    return output;
}
```

### CPU parameter wiring — `-[PAELineScreen canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAELineScreen`

```asm
00000000000b9690	mov	w4, #0x1
00000000000b9694	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000b9698	ldr	x4, [x24]
00000000000b969c	sub	x2, x29, #0xa0
00000000000b96a0	mov	x0, x27
00000000000b96a4	mov	w3, #0x2
00000000000b96a8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b96ac	ldr	x4, [x24]
00000000000b96b0	add	x2, sp, #0xa8
00000000000b96b4	mov	x0, x27
00000000000b96b8	mov	w3, #0x3
00000000000b96bc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b96c0	ldr	x4, [x24]
00000000000b96c4	add	x2, sp, #0xa0
00000000000b96c8	mov	x0, x27
00000000000b96cc	mov	w3, #0x4
00000000000b96d0	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b96d4	ldr	x4, [x24]
00000000000b96d8	add	x2, sp, #0x98
00000000000b96dc	mov	x0, x27
00000000000b96e0	mov	w3, #0x5
00000000000b96e4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b96e8	ldr	x4, [x24]
00000000000b96ec	add	x2, sp, #0x90
00000000000b96f0	mov	x0, x27
00000000000b96f4	mov	w3, #0x6
00000000000b96f8	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000b96fc	ldp	d2, d0, [sp, #0xa0]
00000000000b9700	ldr	d1, [sp, #0x98]
00000000000b9704	ldur	d3, [x29, #-0xa0]
00000000000b9708	sub	x2, x29, #0x88
00000000000b970c	mov	x0, x22
00000000000b9710	bl	"_objc_msgSend$compute_2x2_matrix:fromScale:stretch:skew:andAngle:"
00000000000b9714	ldr	x2, [x24]
00000000000b9718	mov	x0, x23
00000000000b971c	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
00000000000b9720	bl	_objc_msgSend$matrix
00000000000b9724	mov	x23, x0
00000000000b9728	ldr	x2, [x24]
00000000000b972c	mov	x0, x22
00000000000b9730	bl	"_objc_msgSend$getRenderMode:"
00000000000b9734	mov	x24, x0
00000000000b9738	add	x8, sp, #0x10
00000000000b973c	mov	x0, x22
00000000000b9740	mov	x2, x20
00000000000b9744	bl	"_objc_msgSend$getPixelTransformForImage:"
00000000000b9748	cbz	w24, 0xb9968
00000000000b974c	mov	x0, x21
00000000000b9750	bl	_objc_msgSend$imageType
00000000000b9754	cmp	x0, #0x3
00000000000b9758	b.ne	0xb9968
00000000000b975c	mov	w0, #0x1a0
00000000000b9760	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b9764	mov	x22, x0
00000000000b9768	bl	__ZN13HgcLineScreenC2Ev
00000000000b976c	ucvtf	d9, x25
00000000000b9770	ucvtf	d8, x26
00000000000b9774	adrp	x8, 731 ; 0x394000
00000000000b9778	add	x8, x8, #0xa08
00000000000b977c	add	x9, x8, #0x10
00000000000b9780	str	x9, [x22]
00000000000b9784	ldp	d1, d0, [x29, #-0x98]
00000000000b9788	fmul	d0, d0, d9
00000000000b978c	fmul	d1, d1, d8
00000000000b9790	stp	d1, d0, [x29, #-0x98]
00000000000b9794	fcvt	s0, d0
00000000000b9798	fcvt	s1, d1
00000000000b979c	ldr	x8, [x8, #0x70]
00000000000b97a0	movi.2d	v2, #0000000000000000
00000000000b97a4	movi.2d	v3, #0000000000000000
00000000000b97a8	mov	x0, x22
00000000000b97ac	mov	w1, #0x0
00000000000b97b0	blr	x8
00000000000b97b4	ldp	d0, d1, [x29, #-0x88]
00000000000b97b8	fcvt	s0, d0
00000000000b97bc	fcvt	s1, d1
00000000000b97c0	ldr	x8, [x22]
00000000000b97c4	ldr	x8, [x8, #0x60]
00000000000b97c8	movi.2d	v2, #0000000000000000
00000000000b97cc	movi.2d	v3, #0000000000000000
00000000000b97d0	mov	x0, x22
00000000000b97d4	mov	w1, #0x1
00000000000b97d8	blr	x8
00000000000b97dc	ldr	d0, [sp, #0x90]
00000000000b97e0	fmov	d1, #1.00000000
00000000000b97e4	fsub	d0, d1, d0
00000000000b97e8	fdiv	d0, d1, d0
00000000000b97ec	fcvt	s0, d0
00000000000b97f0	ldr	x8, [x22]
00000000000b97f4	ldr	x8, [x8, #0x60]
00000000000b97f8	movi.2d	v1, #0000000000000000
00000000000b97fc	movi.2d	v2, #0000000000000000
00000000000b9800	movi.2d	v3, #0000000000000000
00000000000b9804	mov	x0, x22
00000000000b9808	mov	w1, #0x2
00000000000b980c	blr	x8
00000000000b9810	fmov	d1, #0.50000000
00000000000b9814	fmul	d0, d9, d1
00000000000b9818	fcvt	s0, d0
00000000000b981c	fmul	d1, d8, d1
00000000000b9820	fcvt	s1, d1
00000000000b9824	ldr	x8, [x22]
00000000000b9828	ldr	x8, [x8, #0x60]
00000000000b982c	movi.2d	v2, #0000000000000000
00000000000b9830	movi.2d	v3, #0000000000000000
00000000000b9834	mov	x0, x22
00000000000b9838	mov	w1, #0x3
00000000000b983c	blr	x8
00000000000b9840	fmov	d1, #1.00000000
00000000000b9844	ldr	d0, [sp, #0x10]
00000000000b9848	ldr	d2, [sp, #0x38]
00000000000b984c	fdiv	d0, d1, d0
00000000000b9850	fcvt	s0, d0
00000000000b9854	fdiv	d1, d1, d2
00000000000b9858	fcvt	s1, d1
00000000000b985c	ldr	x8, [x22]
00000000000b9860	ldr	x8, [x8, #0x60]
00000000000b9864	movi.2d	v2, #0000000000000000
00000000000b9868	movi.2d	v3, #0000000000000000
00000000000b986c	mov	x0, x22
00000000000b9870	mov	w1, #0x4
00000000000b9874	blr	x8
00000000000b9878	ldp	d0, d1, [x23]
00000000000b987c	fcvt	s0, d0
00000000000b9880	fcvt	s1, d1
00000000000b9884	ldr	d2, [x23, #0x10]
00000000000b9888	fcvt	s2, d2
00000000000b988c	ldr	x8, [x22]
00000000000b9890	ldr	x8, [x8, #0x60]
00000000000b9894	movi.2d	v3, #0000000000000000
00000000000b9898	mov	x0, x22
00000000000b989c	mov	w1, #0x5
00000000000b98a0	blr	x8
00000000000b98a4	mov	w0, #0x1c0
00000000000b98a8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000b98ac	mov	x23, x0
00000000000b98b0	bl	0x251018 ; symbol stub for: __ZN12HGColorClampC1Ev
00000000000b98b4	cbz	x21, 0xb98cc
00000000000b98b8	add	x8, sp, #0x8
00000000000b98bc	mov	x0, x21
00000000000b98c0	bl	_objc_msgSend$heliumRef
00000000000b98c4	ldr	x2, [sp, #0x8]
00000000000b98c8	b	0xb98d4
00000000000b98cc	mov	x2, #0x0
00000000000b98d0	str	xzr, [sp, #0x8]
00000000000b98d4	ldr	x8, [x23]
00000000000b98d8	ldr	x8, [x8, #0x78]
00000000000b98dc	mov	x0, x23
00000000000b98e0	mov	w1, #0x0
00000000000b98e4	blr	x8
00000000000b98e8	ldr	x0, [sp, #0x8]
00000000000b98ec	cbz	x0, 0xb98fc
00000000000b98f0	ldr	x8, [x0]
00000000000b98f4	ldr	x8, [x8, #0x18]
00000000000b98f8	blr	x8
00000000000b98fc	ldr	x8, [x22]
00000000000b9900	ldr	x8, [x8, #0x78]
00000000000b9904	mov	x0, x22
00000000000b9908	mov	w1, #0x0
00000000000b990c	mov	x2, x23
00000000000b9910	blr	x8
00000000000b9914	str	x22, [sp, #0x8]
00000000000b9918	ldr	x8, [x22]
00000000000b991c	ldr	x8, [x8, #0x10]
00000000000b9920	mov	x0, x22
00000000000b9924	blr	x8
00000000000b9928	add	x2, sp, #0x8
00000000000b992c	mov	x0, x20
00000000000b9930	bl	"_objc_msgSend$setHeliumRef:"
00000000000b9934	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (float)
    - parm3 (float)
    - parm4 (float)
    - parm5 (float)
    - parm6 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 1  <-  parm4 (float), parm5 (float)
    slot 2  <-  parm6 (float)
    slot 3  <-  (constant / computed)
    slot 4  <-  (constant / computed)
    slot 5  <-  (constant / computed)
```
