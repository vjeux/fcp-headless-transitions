# Negative

- **PAE class:** `Negative`
- **Plugin UUID:** `9A527DF8-790C-4FD7-B800-116A41B91E24`
- **Node names in corpus:** Negative (93), Negative 2 (5), Negative 1 (5), Negative 3 (3), Negative Out (2), Negative copy (1)
- **Corpus usage:** 74 files, 112 instances

## What it does

Negative inverts the image colors (out = 1 - in per channel), producing a photographic negative. It is a single-purpose invert with only a blend control. Not implemented and no checked-in shader, but the operation is unambiguous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the inverted result over the original, 0-1 continuous. Fractional values give a partial-invert wash. *(keyframed in 23 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcNegative`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcNegative` → [`HgcNegative.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcNegative.metal)

```metal
//Metal1.0     
//LEN=00000001b2
[[ visible ]] FragmentOut HgcNegative_hgc_visible(const constant float4* hg_Params,
    float4 color0)
{
    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);
    float4 r0;
    FragmentOut output;

    r0 = color0;
    r0 = r0 / float4(fmax(r0.www, 1.00000e-06f), 1.);
    r0.xyz = c0.xxx - r0.xyz;
    r0.xyz = r0.xyz*r0.www;
    output.color0 = r0;
    return output;
}
```

### CPU parameter wiring — `-[PAENegative canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAENegative`

```asm
000000000004a7dc	mov	x19, x0
000000000004a7e0	bl	__ZN11HgcNegativeC1Ev
000000000004a7e4	ldr	x2, [sp, #0x8]
000000000004a7e8	ldr	x8, [x19]
000000000004a7ec	ldr	x8, [x8, #0x78]
000000000004a7f0	mov	x0, x19
000000000004a7f4	mov	w1, #0x0
000000000004a7f8	blr	x8
000000000004a7fc	mov	w0, #0x370
000000000004a800	bl	0x251b58 ; symbol stub for: __ZN8HGObjectnwEm
000000000004a804	mov	x21, x0
000000000004a808	bl	0x251240 ; symbol stub for: __ZN14HGColorConformC1Ev
000000000004a80c	ldr	x8, [x21]
000000000004a810	ldr	x8, [x8, #0x78]
000000000004a814	mov	x0, x21
000000000004a818	mov	w1, #0x0
000000000004a81c	mov	x2, x19
000000000004a820	blr	x8
000000000004a824	mov	x0, x21
000000000004a828	mov	w1, #0x0
000000000004a82c	mov	w2, #0x1
000000000004a830	mov	w3, #0x0
000000000004a834	mov	w4, #0x0
000000000004a838	mov	w5, #0x8
000000000004a83c	mov	w6, #0x0
000000000004a840	bl	0x251204 ; symbol stub for: __ZN14HGColorConform13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_
000000000004a844	str	x21, [sp]
000000000004a848	ldr	x8, [x21]
000000000004a84c	ldr	x8, [x8, #0x10]
000000000004a850	mov	x0, x21
000000000004a854	blr	x8
000000000004a858	mov	x2, sp
000000000004a85c	mov	x0, x20
000000000004a860	bl	"_objc_msgSend$setHeliumRef:"
000000000004a864	ldr	x0, [sp]
```
