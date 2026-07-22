# Aura

- **PAE class:** `Aura`
- **Plugin UUID:** `2E01612E-7A80-42B5-8767-9F3E58679DDD`
- **Node names in corpus:** Aura (21)
- **Corpus usage:** 16 files, 21 instances

## What it does

Aura wraps a soft glowing halo around the subject, similar to Outer Glow but with separate inner and outer radii defining a ring of brightness. Brightness sets its intensity; the two radii shape where the aura starts and ends.

> **Note.** Not implemented; description is the standard Apple Motion "Aura" glow filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Inner Radius | float (pixels) | 2 | 0 .. 22 | Inner edge of the aura ring, ~0-22 (default 2). |
| Outer Radius | float (pixels) | 10 | 0 .. 22 | Outer edge of the aura ring, ~0-22 (default 10). |
| Brightness | float | 70 | 40 .. 100 | Intensity of the aura, ~40-100 (default 70). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Clip to White`, `Crop`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcAura`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcAura` → [`HgcAura.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcAura.metal)

```metal
//Metal1.0     
//LEN=00000001de
[[ visible ]] FragmentOut HgcAura_hgc_visible(const constant float4* hg_Params,
    float4 color0,
    float4 color1)
{
    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 1.000000000);
    float4 r0, r1;
    FragmentOut output;

    r0 = color1;
    r1 = color0;
    r1 = r1*hg_Params[0] + r0;
    r1.w = fmin(r1.w, c0.w);
    r1.xyz = fmin(r1.xyz, hg_Params[1].xyz);
    output.color0 = fmax(r1, c0.xxxx);
    return output;
}
```

### CPU parameter wiring — `-[PAEAura canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEAura`

```asm
00000000000ea34c	mov	w3, #0x1
00000000000ea350	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000ea354	ldr	d0, [sp, #0x18]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : FloatSlider
    parm3 : FloatSlider
    parm5 : ToggleButton
    parm4 : ToggleButton
    parm6 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm2 (float)
    - parm3 (float)
    - parm4 (bool)
    - parm5 (bool)
    - parm6 (bool)

```
