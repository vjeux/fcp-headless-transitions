# Tint

- **PAE class:** `Tint`
- **Plugin UUID:** `717D6E01-83F4-4A4B-AF92-42AABA4B176C`
- **Node names in corpus:** Tint (221), Tint copy (71), Tint Master (2), Card Tint (1), Backdrop Tint (1)
- **Corpus usage:** 85 files, 296 instances

## What it does

Tint recolors the image toward a single Color using a hard-light-style two-leg curve about luma 0.5 (NOT a simple luma*color lerp), blended by Intensity. It gives a monochrome/duotone wash keyed to a target color. Implemented (shares the channel-mixer module) and RE'd from the HgcTint shader.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Color | color | - | - | The tint target color (nested Red/Green/Blue 0-1). The image is pushed toward this hue. *(keyframed in 1 instance)* |
| Intensity | float | 1 | 0.24 .. 1 | How strongly the tint is applied, 0-1. 0 = untinted, 1 = full tint. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the tinted result over the original, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/channel-mixer.ts`](../../engine/src/compositor/filters/channel-mixer.ts).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcTint`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcTint` → [`HgcTint.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTint.metal)

```metal
//Metal1.0     
//LEN=00000002f4
[[ visible ]] FragmentOut HgcTint_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 2.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.w = dot(r0.xyz, hg_Params[2].xyz);
    r2.x = c0.x - r1.w;
    r1.xyz = r2.xxx*hg_Params[0].xyz + -r2.xxx;
    r2.xyz = r1.xyz*c0.yyy + c0.xxx;
    r1.xyz = r1.www*hg_Params[0].xyz;
    r1.xyz = r1.xyz*c0.yyy + -r2.xyz;
    r1.w = float(r1.w < c0.z);
    r1.xyz = r1.www*r1.xyz + r2.xyz;
    r0.xyz = mix(r0.xyz, r1.xyz, hg_Params[1].xyz);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAETint canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAETint`

```asm
000000000008e9f0	mov	w5, #0x1
000000000008e9f4	bl	"_objc_msgSend$getRedValue:greenValue:blueValue:fromParm:atFxTime:"
000000000008e9f8	ldr	x4, [x21]
000000000008e9fc	add	x2, sp, #0x10
000000000008ea00	mov	x0, x25
000000000008ea04	mov	w3, #0x2
000000000008ea08	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000008ea0c	ldr	x2, [x21]
000000000008ea10	mov	x0, x23
000000000008ea14	bl	"_objc_msgSend$getRenderMode:"
000000000008ea18	cbz	w0, 0x8e9b8
000000000008ea1c	mov	x0, x20
000000000008ea20	bl	_objc_msgSend$imageType
000000000008ea24	cmp	x0, #0x3
000000000008ea28	b.ne	0x8e9b8
000000000008ea2c	ldr	x0, [x23, x26]
000000000008ea30	adrp	x8, 838 ; 0x3d4000
000000000008ea34	ldr	x2, [x8, #0x528]
000000000008ea38	bl	"_objc_msgSend$apiForProtocol:"
000000000008ea3c	cbz	x0, 0x8e9b4
000000000008ea40	bl	_objc_msgSend$versionAtCreation
000000000008ea44	cbnz	w0, 0x8ea70
000000000008ea48	ldr	d0, [sp, #0x28]
000000000008ea4c	adrp	x8, 476 ; 0x26a000
000000000008ea50	ldr	d1, [x8, #0x568]
000000000008ea54	fmul	d2, d0, d1
000000000008ea58	ldr	d0, [sp, #0x20]
000000000008ea5c	fmul	d0, d0, d1
000000000008ea60	stp	d0, d2, [sp, #0x20]
000000000008ea64	ldr	d0, [sp, #0x18]
000000000008ea68	fmul	d0, d0, d1
000000000008ea6c	str	d0, [sp, #0x18]
000000000008ea70	cbz	x20, 0x8ea84
000000000008ea74	add	x8, sp, #0x8
000000000008ea78	mov	x0, x20
000000000008ea7c	bl	_objc_msgSend$heliumRef
000000000008ea80	b	0x8ea88
000000000008ea84	str	xzr, [sp, #0x8]
000000000008ea88	mov	w0, #0x1a0
000000000008ea8c	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000008ea90	mov	x20, x0
000000000008ea94	bl	__ZN7HgcTintC1Ev
000000000008ea98	ldr	x2, [sp, #0x8]
000000000008ea9c	ldr	x8, [x20]
000000000008eaa0	ldr	x8, [x8, #0x78]
000000000008eaa4	mov	x0, x20
000000000008eaa8	mov	w1, #0x0
000000000008eaac	blr	x8
000000000008eab0	ldp	d1, d0, [sp, #0x20]
000000000008eab4	fcvt	s0, d0
000000000008eab8	fcvt	s1, d1
000000000008eabc	ldr	d2, [sp, #0x18]
000000000008eac0	fcvt	s2, d2
000000000008eac4	ldr	x8, [x20]
000000000008eac8	ldr	x8, [x8, #0x60]
000000000008eacc	movi.2d	v3, #0000000000000000
000000000008ead0	mov	x0, x20
000000000008ead4	mov	w1, #0x0
000000000008ead8	blr	x8
000000000008eadc	ldr	d0, [sp, #0x10]
000000000008eae0	fcvt	s0, d0
000000000008eae4	ldr	x8, [x20]
000000000008eae8	ldr	x8, [x8, #0x60]
000000000008eaec	movi.2d	v1, #0000000000000000
000000000008eaf0	movi.2d	v2, #0000000000000000
000000000008eaf4	movi.2d	v3, #0000000000000000
000000000008eaf8	mov	x0, x20
000000000008eafc	mov	w1, #0x1
000000000008eb00	blr	x8
000000000008eb04	ldr	x2, [x21]
000000000008eb08	mov	x0, x22
000000000008eb0c	bl	"_objc_msgSend$colorMatrixFromDesiredRGBToYCbCrAtTime:"
000000000008eb10	bl	_objc_msgSend$matrix
000000000008eb14	ldp	d0, d1, [x0]
000000000008eb18	fcvt	s0, d0
000000000008eb1c	fcvt	s1, d1
000000000008eb20	ldr	d2, [x0, #0x10]
000000000008eb24	fcvt	s2, d2
000000000008eb28	ldr	x8, [x20]
000000000008eb2c	ldr	x8, [x8, #0x60]
000000000008eb30	movi.2d	v3, #0000000000000000
000000000008eb34	mov	x0, x20
000000000008eb38	mov	w1, #0x2
000000000008eb3c	blr	x8
000000000008eb40	str	x20, [sp]
000000000008eb44	ldr	x8, [x20]
000000000008eb48	ldr	x8, [x8, #0x10]
000000000008eb4c	mov	x0, x20
000000000008eb50	blr	x8
000000000008eb54	mov	x2, sp
000000000008eb58	mov	x0, x19
000000000008eb5c	bl	"_objc_msgSend$setHeliumRef:"
000000000008eb60	ldr	x0, [sp]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (colour)
    - parm2 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (colour), parm2 (float)
    slot 1  <-  parm2 (float)
    slot 2  <-  (constant / computed)
```
