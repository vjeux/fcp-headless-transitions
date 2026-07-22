# PAEYIQAdjust

- **PAE class:** `PAEYIQAdjust`
- **Plugin UUID:** `CECECA09-7686-4EBA-A9AA-585A3F5B322E`
- **Node names in corpus:** YIQ Adjust (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

YIQ Adjust (PAEYIQAdjust) is the NTSC-YIQ analogue of YUV Adjust: it converts to the YIQ color space and lets you tweak luma (Y) and the I/Q chroma axes independently. This corpus record is at defaults so only Mix is sampled.

> **Note.** Not implemented; description is the standard Apple Motion "YIQ Adjust" filter. The Y/I/Q channel sliders were left at defaults (not sampled) in the single corpus instance; only Mix appears.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcYIQAdjust`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcYIQAdjust` → [`HgcYIQAdjust.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcYIQAdjust.metal)

```metal
//Metal1.0     
//LEN=0000000316
[[ visible ]] FragmentOut HgcYIQAdjust_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.9559999704, 0.6209999919, 0.000000000);
    const float4 c1 = float4(1.000000000, -0.2720000148, -0.6470000148, 0.000000000);
    const float4 c2 = float4(1.000000000, -1.105000019, 1.702000022, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = clamp(r0 / float4(fmax(r0.www, 1.00000e-06f), 1.), 0.00000f, 1.00000f);
    r1.x = dot(c0.xyz, hg_Params[0].xyz);
    r1.y = dot(c1.xyz, hg_Params[0].xyz);
    r1.z = dot(c2.xyz, hg_Params[0].xyz);
    r0.xyz = clamp(r0.xyz + r1.xyz, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEYIQAdjust canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEYIQAdjust`

```asm
000000000007a244	mov	w3, #0x1
000000000007a248	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007a24c	ldr	x4, [x20]
000000000007a250	add	x2, sp, #0x20
000000000007a254	mov	x0, x23
000000000007a258	mov	w3, #0x2
000000000007a25c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007a260	ldr	x4, [x20]
000000000007a264	add	x2, sp, #0x18
000000000007a268	mov	x0, x23
000000000007a26c	mov	w3, #0x3
000000000007a270	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007a274	mov	x0, x21
000000000007a278	bl	_objc_msgSend$imageType
000000000007a27c	mov	x23, x0
000000000007a280	ldr	x2, [x20]
000000000007a284	mov	x0, x22
000000000007a288	bl	"_objc_msgSend$getRenderMode:"
000000000007a28c	cmp	w0, #0x0
000000000007a290	ccmp	w23, #0x3, #0x0, ne
000000000007a294	cset	w20, eq
000000000007a298	b.ne	0x7a348
000000000007a29c	cbz	x21, 0x7a2b8
000000000007a2a0	add	x8, sp, #0x10
000000000007a2a4	mov	x0, x21
000000000007a2a8	bl	_objc_msgSend$heliumRef
000000000007a2ac	b	0x7a2bc
000000000007a2b0	mov	w20, #0x0
000000000007a2b4	b	0x7a348
000000000007a2b8	str	xzr, [sp, #0x10]
000000000007a2bc	mov	w0, #0x1a0
000000000007a2c0	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007a2c4	mov	x21, x0
000000000007a2c8	bl	__ZN12HgcYIQAdjustC1Ev
000000000007a2cc	str	x21, [sp, #0x8]
000000000007a2d0	ldp	d1, d0, [sp, #0x20]
000000000007a2d4	fcvt	s0, d0
000000000007a2d8	fcvt	s1, d1
000000000007a2dc	ldr	d2, [sp, #0x18]
000000000007a2e0	fcvt	s2, d2
000000000007a2e4	ldr	x8, [x21]
000000000007a2e8	ldr	x8, [x8, #0x60]
000000000007a2ec	fmov	s3, #1.00000000
000000000007a2f0	mov	x0, x21
000000000007a2f4	mov	w1, #0x0
000000000007a2f8	blr	x8
000000000007a2fc	ldr	x2, [sp, #0x10]
000000000007a300	ldr	x8, [x21]
000000000007a304	ldr	x8, [x8, #0x78]
000000000007a308	mov	x0, x21
000000000007a30c	mov	w1, #0x0
000000000007a310	blr	x8
000000000007a314	add	x2, sp, #0x8
000000000007a318	mov	x0, x19
000000000007a31c	bl	"_objc_msgSend$setHeliumRef:"
000000000007a320	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow;
  only unambiguous single-source slots are asserted):
    slot 0  <-  (constant / computed / multi-pass — read the disasm)
```
