# Bloom

- **PAE class:** `Bloom`
- **Plugin UUID:** `5599C557-CDC0-4112-B2C4-355E9A1A902E`
- **Node names in corpus:** Bloom (27), Bloom copy (4)
- **Corpus usage:** 18 files, 31 instances

## What it does

Bloom is a light-bloom filter: it isolates pixels brighter than a threshold, blurs them, and screens the glowing result back over the image so highlights bleed and "bloom". In this engine it is served by the shared glow module. Amount is the blur/spread of the bloom, Threshold the brightness cutoff, and Brightness the intensity of the added glow.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 7 | 10 .. 32 | Blur radius / spread of the bloom, ~10-32 (default 7). *(keyframed in 1 instance)* |
| Brightness | float | 70 | 51 .. 100 | Intensity of the added glow, ~51-100 (default 70). *(keyframed in 1 instance)* |
| Threshold | float | 75 | 0 .. 94 | Brightness cutoff above which pixels bloom, ~0-94 (default 75). |
| Mix | float | 1 | 0.15 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 2 instances)* |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal scale of the bloom spread, percent (default 100). |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical scale of the bloom spread, percent (default 100). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Crop`, `Flip`, `Input Points`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/glow.ts`](../../engine/src/compositor/filters/glow.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcBloomThreshold`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcBloomThreshold` → [`HgcBloomThreshold.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBloomThreshold.metal)

```metal
//Metal1.0     
//LEN=0000000266
[[ visible ]] FragmentOut HgcBloomThreshold_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color0;
    r0 = r0*hg_Params[1] + hg_Params[0];
    r0 = fmax(r0, c0.xxxx);
    r1.x = fmax(r0.x, r0.y);
    r1.x = fmax(r1.x, r0.z);
    r0.w = select(r0.w, r1.x, hg_Params[3].w < 0.00000f);
    r0.w = fmin(r0.w, hg_Params[2].y);
    output.color0.w = fmax(r0.w, hg_Params[2].x);
    output.color0.xyz = r0.xyz;
    return output;
}
```

### Metal fragment shader — `HgcEchoScaleAndAdd`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcEchoScaleAndAdd` → [`HgcEchoScaleAndAdd.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEchoScaleAndAdd.metal)

```metal
//Metal1.0     
//LEN=0000000216
[[ visible ]] FragmentOut HgcEchoScaleAndAdd_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    r1 = r1*hg_Params[0] + r0;
    r1.xyz = fmin(r1.xyz, hg_Params[1].xxx);
    r1.xyz = fmin(r1.xyz, hg_Params[1].xxx);
    r1.w = fmin(r1.w, c0.w);
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEBloom canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEBloom`

```asm
000000000000c694	mov	w3, #0x1
000000000000c698	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000c69c	ldr	d0, [sp, #0x68]
000000000000c6a0	fcmp	d0, #0.0
000000000000c6a4	b.ne	0xc6c4
000000000000c6a8	cbz	x20, 0xc81c
000000000000c6ac	add	x8, sp, #0x10
000000000000c6b0	mov	x0, x20
000000000000c6b4	bl	_objc_msgSend$heliumRef
000000000000c6b8	b	0xc820
000000000000c6bc	mov	w0, #0x0
000000000000c6c0	b	0xc844
000000000000c6c4	fcmp	d9, d8
000000000000c6c8	fcsel	d10, d9, d8, gt
000000000000c6cc	ldr	x4, [x22]
000000000000c6d0	add	x2, sp, #0x60
000000000000c6d4	mov	x0, x23
000000000000c6d8	mov	w3, #0x4
000000000000c6dc	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000c6e0	ldr	d0, [sp, #0x60]
000000000000c6e4	adrp	x8, 604 ; 0x268000
000000000000c6e8	ldr	d11, [x8, #0xc48]
000000000000c6ec	fmul	d0, d0, d11
000000000000c6f0	fdiv	d1, d9, d10
000000000000c6f4	fmul	d0, d1, d0
000000000000c6f8	str	d0, [sp, #0x60]
000000000000c6fc	ldr	x4, [x22]
000000000000c700	add	x2, sp, #0x58
000000000000c704	mov	x0, x23
000000000000c708	mov	w3, #0x5
000000000000c70c	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000c710	ldr	d0, [sp, #0x58]
000000000000c714	fmul	d0, d0, d11
000000000000c718	fdiv	d1, d8, d10
000000000000c71c	fmul	d0, d1, d0
000000000000c720	str	d0, [sp, #0x58]
000000000000c724	ldr	x4, [x22]
000000000000c728	add	x2, sp, #0x50
000000000000c72c	mov	x0, x23
000000000000c730	mov	w3, #0x2
000000000000c734	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000c738	ldr	x4, [x22]
000000000000c73c	add	x2, sp, #0x48
000000000000c740	mov	x0, x23
000000000000c744	mov	w3, #0x3
000000000000c748	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
000000000000c74c	ldr	x4, [x22]
000000000000c750	add	x2, sp, #0x47
000000000000c754	mov	x0, x23
000000000000c758	mov	w3, #0x7
000000000000c75c	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000000c760	ldr	x4, [x22]
000000000000c764	add	x2, sp, #0x46
000000000000c768	mov	x0, x23
000000000000c76c	mov	w3, #0x6
000000000000c770	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000000c774	strb	wzr, [sp, #0x45]
000000000000c778	ldr	x4, [x22]
000000000000c77c	add	x2, sp, #0x45
000000000000c780	mov	x0, x23
000000000000c784	mov	w3, #0x8
000000000000c788	bl	"_objc_msgSend$getBoolValue:fromParm:atFxTime:"
000000000000c78c	ldp	d2, d3, [sp, #0x48]
000000000000c790	mov	x8, #-0x3fb7000000000000
000000000000c794	fmov	d0, x8
000000000000c798	fadd	d0, d3, d0
000000000000c79c	fmov	d1, #4.00000000
000000000000c7a0	fmul	d0, d0, d1
000000000000c7a4	fabs	d1, d0
000000000000c7a8	str	d1, [sp, #0x50]
000000000000c7ac	mov	x8, #0x4049000000000000
000000000000c7b0	fmov	d0, x8
000000000000c7b4	fcmp	d3, d0
000000000000c7b8	b.pl	0xc7cc
000000000000c7bc	mov	x8, #0x4059000000000000
000000000000c7c0	fmov	d0, x8
000000000000c7c4	fsub	d2, d0, d2
000000000000c7c8	str	d2, [sp, #0x48]
000000000000c7cc	mov	x8, #0x4049000000000000
000000000000c7d0	fmov	d4, x8
000000000000c7d4	fcmp	d3, d4
000000000000c7d8	ldp	d3, d0, [sp, #0x60]
000000000000c7dc	cset	w4, mi
000000000000c7e0	ldr	d4, [sp, #0x58]
000000000000c7e4	ldrb	w5, [sp, #0x46]
000000000000c7e8	ldrb	w6, [sp, #0x47]
000000000000c7ec	ldrb	w7, [sp, #0x45]
000000000000c7f0	ldp	q5, q6, [x22]
000000000000c7f4	stp	q5, q6, [sp, #0x10]
000000000000c7f8	ldr	q5, [x22, #0x20]
000000000000c7fc	str	q5, [sp, #0x30]
000000000000c800	add	x8, sp, #0x10
000000000000c804	str	x8, [sp]
000000000000c808	mov	x0, x21
000000000000c80c	mov	x2, x19
000000000000c810	mov	x3, x20
000000000000c814	bl	"_objc_msgSend$bloomHeliumRender:withInput:withRadius:withBrightness:withThreshold:doDarkBloom:withXScale:withYScale:withDoCrop:withDoClip:is360:withInfo:"
000000000000c818	b	0xc844
000000000000c81c	str	xzr, [sp, #0x10]
000000000000c820	add	x2, sp, #0x10
000000000000c824	mov	x0, x19
000000000000c828	bl	"_objc_msgSend$setHeliumRef:"
000000000000c82c	ldr	x0, [sp, #0x10]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : FloatSlider
    parm7 : ToggleButton
    parm6 : ToggleButton
    parm8 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm4 (float)
    - parm5 (float)
    - parm2 (float)
    - parm3 (float)
    - parm7 (bool)
    - parm6 (bool)
    - parm8 (bool)

```
