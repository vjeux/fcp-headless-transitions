# Edges

- **PAE class:** `Edges`
- **Plugin UUID:** `824B3514-C6DF-465A-99B9-D60CA063D6CF`
- **Node names in corpus:** Edges (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Edges performs edge detection, outlining the high-contrast boundaries in the image (typically over black) for a wireframe/outline look. Intensity scales how strongly edges are drawn.

> **Note.** Not implemented; description is the standard Apple Motion "Edges" edge-detect filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Intensity | float | 1 | 7 .. 20 | Strength of the detected edges, ~7-20 (default 1). Continuous float. |
| Mix | float | 1 | 0.5 .. 0.5693 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcEdges`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEdges` → [`HgcEdges.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEdges.metal)

```metal
//Metal1.0     
//LEN=0000000307
[[ visible ]] FragmentOut HgcEdges_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0,
    float4 texCoord1,
    float4 texCoord2,
    float4 texCoord3)
{
    float4 r0, r1, r2, r3;
    FragmentOut output;

    r0.xyz = hg_Texture0.sample(hg_Sampler0, texCoord1.xy).xyz;
    r1.xyz = hg_Texture0.sample(hg_Sampler0, texCoord2.xy).xyz;
    r2.xyz = hg_Texture0.sample(hg_Sampler0, texCoord3.xy).xyz;
    r3 = hg_Texture0.sample(hg_Sampler0, texCoord0.xy);
    r1.xyz = r3.xyz - r1.xyz;
    r0.xyz = r0.xyz - r2.xyz;
    r1.xyz = r1.xyz*r1.xyz;
    r0.xyz = r0.xyz*r0.xyz + r1.xyz;
    r3.xyz = r0.xyz*hg_Params[0].xyz;
    output.color0 = r3;
    return output;
}
```

### CPU parameter wiring — `-[PAEEdges canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEEdges`

```asm
00000000000a9778	mov	w3, #0x1
00000000000a977c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000a9780	ldr	x2, [x21]
00000000000a9784	mov	x0, x23
00000000000a9788	bl	"_objc_msgSend$getRenderMode:"
00000000000a978c	cbz	w0, 0xa9874
00000000000a9790	mov	w0, #0x1b0
00000000000a9794	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
00000000000a9798	mov	x21, x0
00000000000a979c	bl	__ZN8HgcEdgesC2Ev
00000000000a97a0	adrp	x8, 746 ; 0x393000
00000000000a97a4	add	x8, x8, #0x4a8
00000000000a97a8	add	x8, x8, #0x10
00000000000a97ac	str	x8, [x21]
00000000000a97b0	str	x21, [sp, #0x10]
00000000000a97b4	cbz	x22, 0xa97d0
00000000000a97b8	add	x8, sp, #0x8
00000000000a97bc	mov	x0, x22
00000000000a97c0	bl	_objc_msgSend$heliumRef
00000000000a97c4	ldr	x2, [sp, #0x8]
00000000000a97c8	ldr	x8, [x21]
00000000000a97cc	b	0xa97d8
00000000000a97d0	mov	x2, #0x0
00000000000a97d4	str	xzr, [sp, #0x8]
00000000000a97d8	ldr	x8, [x8, #0x78]
00000000000a97dc	mov	x0, x21
00000000000a97e0	mov	w1, #0x0
00000000000a97e4	blr	x8
00000000000a97e8	ldr	x0, [sp, #0x8]
00000000000a97ec	cbz	x0, 0xa97fc
00000000000a97f0	ldr	x8, [x0]
00000000000a97f4	ldr	x8, [x8, #0x18]
00000000000a97f8	blr	x8
00000000000a97fc	ldr	d0, [sp, #0x18]
00000000000a9800	fcvt	s0, d0
00000000000a9804	ldr	x8, [x21]
00000000000a9808	ldr	x8, [x8, #0x60]
00000000000a980c	mov	x0, x21
00000000000a9810	mov	w1, #0x0
00000000000a9814	mov.16b	v1, v0
00000000000a9818	mov.16b	v2, v0
00000000000a981c	mov.16b	v3, v0
00000000000a9820	blr	x8
00000000000a9824	fcvt	s0, d9
00000000000a9828	fcvt	s1, d8
00000000000a982c	fmov	d3, #1.00000000
00000000000a9830	fdiv	d2, d3, d9
00000000000a9834	fcvt	s2, d2
00000000000a9838	fdiv	d3, d3, d8
00000000000a983c	fcvt	s3, d3
00000000000a9840	ldr	x8, [x21]
00000000000a9844	ldr	x8, [x8, #0x60]
00000000000a9848	mov	x0, x21
00000000000a984c	mov	w1, #0x1
00000000000a9850	blr	x8
00000000000a9854	add	x2, sp, #0x10
00000000000a9858	mov	x0, x20
00000000000a985c	bl	"_objc_msgSend$setHeliumRef:"
00000000000a9860	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm1 (float)

  SetParameter slots (source decoded by stack/register dataflow):
    slot 0  <-  parm1 (float)
    slot 1  <-  parm1 (float)
```
