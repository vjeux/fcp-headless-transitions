# PAEYUVAdjust

- **PAE class:** `PAEYUVAdjust`
- **Plugin UUID:** `409AA5EF-5327-48C6-A650-DE16A7923DD8`
- **Node names in corpus:** YUV Adjust (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

YUV Adjust (PAEYUVAdjust) converts the image to YUV and lets you tweak the luma (Y) and the two chroma (U, V) channels independently, then converts back -- a color/brightness adjustment in the YUV space used by video. This corpus record is at defaults so only Mix is sampled.

> **Note.** Not implemented; description is the standard Apple Motion "YUV Adjust" filter. The Y/U/V channel sliders were left at defaults (not sampled) in the single corpus instance; only Mix appears.

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

### Metal fragment shader — `HgcYUVRGBAdjust`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcYUVRGBAdjust` → [`HgcYUVRGBAdjust.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcYUVRGBAdjust.metal)

```metal
//Metal1.0     
//LEN=00000002c0
[[ visible ]] FragmentOut HgcYUVRGBAdjust_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 1.139999986, -0.3939999938, -0.5809999704);
    const float4 c1 = float4(1.000000000, 2.028000116, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = clamp(r0 / float4(fmax(r0.www, 1.00000e-06f), 1.), 0.00000f, 1.00000f);
    r1.x = dot(c0.xy, hg_Params[0].xz);
    r1.y = dot(c0.xzw, hg_Params[0].xyz);
    r1.z = dot(c1.xy, hg_Params[0].xy);
    r0.xyz = clamp(r0.xyz + r1.xyz, 0.00000f, 1.00000f);
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAEYUVAdjust canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEYUVAdjust`

```asm
000000000007d708	mov	w3, #0x1
000000000007d70c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007d710	ldr	x4, [x20]
000000000007d714	add	x2, sp, #0x20
000000000007d718	mov	x0, x23
000000000007d71c	mov	w3, #0x2
000000000007d720	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007d724	ldr	x4, [x20]
000000000007d728	add	x2, sp, #0x18
000000000007d72c	mov	x0, x23
000000000007d730	mov	w3, #0x3
000000000007d734	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000007d738	mov	x0, x21
000000000007d73c	bl	_objc_msgSend$imageType
000000000007d740	mov	x23, x0
000000000007d744	ldr	x2, [x20]
000000000007d748	mov	x0, x22
000000000007d74c	bl	"_objc_msgSend$getRenderMode:"
000000000007d750	cmp	w0, #0x0
000000000007d754	ccmp	w23, #0x3, #0x0, ne
000000000007d758	cset	w20, eq
000000000007d75c	b.ne	0x7d814
000000000007d760	cbz	x21, 0x7d77c
000000000007d764	add	x8, sp, #0x10
000000000007d768	mov	x0, x21
000000000007d76c	bl	_objc_msgSend$heliumRef
000000000007d770	b	0x7d780
000000000007d774	mov	w20, #0x0
000000000007d778	b	0x7d814
000000000007d77c	str	xzr, [sp, #0x10]
000000000007d780	str	xzr, [sp, #0x8]
000000000007d784	mov	w0, #0x1a0
000000000007d788	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000007d78c	mov	x21, x0
000000000007d790	bl	__ZN15HgcYUVRGBAdjustC1Ev
000000000007d794	cbz	x21, 0x7d79c
000000000007d798	str	x21, [sp, #0x8]
000000000007d79c	ldp	d1, d0, [sp, #0x20]
000000000007d7a0	fcvt	s0, d0
000000000007d7a4	fcvt	s1, d1
000000000007d7a8	ldr	d2, [sp, #0x18]
000000000007d7ac	fcvt	s2, d2
000000000007d7b0	ldr	x8, [x21]
000000000007d7b4	ldr	x8, [x8, #0x60]
000000000007d7b8	fmov	s3, #1.00000000
000000000007d7bc	mov	x0, x21
000000000007d7c0	mov	w1, #0x0
000000000007d7c4	blr	x8
000000000007d7c8	ldr	x2, [sp, #0x10]
000000000007d7cc	ldr	x8, [x21]
000000000007d7d0	ldr	x8, [x8, #0x78]
000000000007d7d4	mov	x0, x21
000000000007d7d8	mov	w1, #0x0
000000000007d7dc	blr	x8
000000000007d7e0	add	x2, sp, #0x8
000000000007d7e4	mov	x0, x19
000000000007d7e8	bl	"_objc_msgSend$setHeliumRef:"
000000000007d7ec	ldr	x0, [sp, #0x8]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm2 (float), parm3 (float)
```
