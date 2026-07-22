# Sepia

- **PAE class:** `Sepia`
- **Plugin UUID:** `2CA36FA3-FE92-4E46-B68F-FDB242831254`
- **Node names in corpus:** Sepia (12)
- **Corpus usage:** 8 files, 12 instances

## What it does

Sepia tones the image toward a warm brown monochrome for an antique-photo look. Amount blends between the original color and the full sepia tone.

> **Note.** Not implemented; description is the standard Apple Motion "Sepia" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 1 | 0 .. 1 | Strength of the sepia toning, 0-1 (default 1). Continuous float. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcSepia`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcSepia` → [`HgcSepia.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSepia.metal)

```metal
//Metal1.0     
//LEN=00000002c6
[[ visible ]] FragmentOut HgcSepia_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.2989999950, 0.5870000124, 0.1140000001, 0.2000000030);
    const float4 c1 = float4(1.000000000, 0.9559999704, -0.2720000148, -1.105000019);
    float4 r0, r1, r2;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r1.x = dot(r0.xyz, c0.xyz);
    r1.y = r0.w*c0.w;
    r2.x = dot(r1.xy, c1.xy);
    r2.y = dot(r1.xy, c1.xz);
    r2.z = dot(r1.xy, c1.xw);
    r2.xyz = mix(r0.xyz, r2.xyz, hg_Params[0].xyz);
    output.color0.xyz = r2.xyz*r0.www;
    output.color0.w = r0.w;
    return output;
}
```

### CPU parameter wiring — `-[PAESepia canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAESepia`

```asm
000000000005b66c	mov	w3, #0x1
000000000005b670	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000005b674	mov	x0, x20
000000000005b678	bl	_objc_msgSend$imageType
000000000005b67c	mov	x23, x0
000000000005b680	ldr	x2, [x22]
000000000005b684	mov	x0, x21
000000000005b688	bl	"_objc_msgSend$getRenderMode:"
000000000005b68c	mov	w8, w23
000000000005b690	cmp	w0, #0x0
000000000005b694	ccmp	x8, #0x3, #0x0, ne
000000000005b698	b.eq	0x5b6a4
000000000005b69c	mov	w0, #0x0
000000000005b6a0	b	0x5b78c
000000000005b6a4	ldr	x0, [x21, x24]
000000000005b6a8	adrp	x8, 889 ; 0x3d4000
000000000005b6ac	ldr	x2, [x8, #0x528]
000000000005b6b0	bl	"_objc_msgSend$apiForProtocol:"
000000000005b6b4	cbz	x0, 0x5b78c
000000000005b6b8	mov	x21, x0
000000000005b6bc	cbz	x20, 0x5b6d0
000000000005b6c0	add	x8, sp, #0x10
000000000005b6c4	mov	x0, x20
000000000005b6c8	bl	_objc_msgSend$heliumRef
000000000005b6cc	b	0x5b6d4
000000000005b6d0	str	xzr, [sp, #0x10]
000000000005b6d4	mov	w0, #0x1a0
000000000005b6d8	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000005b6dc	mov	x20, x0
000000000005b6e0	bl	__ZN8HgcSepiaC1Ev
000000000005b6e4	str	x20, [sp, #0x8]
000000000005b6e8	ldr	x2, [sp, #0x10]
000000000005b6ec	ldr	x8, [x20]
000000000005b6f0	ldr	x8, [x8, #0x78]
000000000005b6f4	mov	x0, x20
000000000005b6f8	mov	w1, #0x0
000000000005b6fc	blr	x8
000000000005b700	ldr	d0, [sp, #0x18]
000000000005b704	fcvt	s0, d0
000000000005b708	ldr	x8, [x20]
000000000005b70c	ldr	x8, [x8, #0x60]
000000000005b710	movi.2d	v3, #0000000000000000
000000000005b714	mov	x0, x20
000000000005b718	mov	w1, #0x0
000000000005b71c	mov.16b	v1, v0
000000000005b720	mov.16b	v2, v0
000000000005b724	blr	x8
000000000005b728	mov	x0, x21
000000000005b72c	bl	_objc_msgSend$versionAtCreation
000000000005b730	ldr	x8, [x20]
000000000005b734	ldr	x8, [x8, #0x60]
000000000005b738	fmov	s0, #1.00000000
000000000005b73c	fmov	s1, #1.00000000
000000000005b740	fmov	s2, #1.00000000
000000000005b744	movi.2d	v3, #0000000000000000
000000000005b748	mov	x0, x20
000000000005b74c	mov	w1, #0x1
000000000005b750	blr	x8
000000000005b754	add	x2, sp, #0x8
000000000005b758	mov	x0, x19
000000000005b75c	bl	"_objc_msgSend$setHeliumRef:"
000000000005b760	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  parm1 (float)
    slot 1  <-  (constant / computed / multi-pass — read the disasm)
```
