# Dazzle

- **PAE class:** `Dazzle`
- **Plugin UUID:** `E92A99A6-A2E5-44A0-B29C-80674F4003D0`
- **Node names in corpus:** Dazzle (28)
- **Corpus usage:** 18 files, 28 instances

## What it does

Dazzle adds anamorphic star/streak flares to the bright points of the image: thresholded highlights sprout radiating spikes, producing a sparkly "dazzle" or glint. Spike Count sets how many arms each star has, Angle rotates them, Amount their length, and Threshold which pixels are bright enough to flare.

> **Note.** Not implemented; description is the standard Apple Motion "Dazzle" star-flare filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 30 | 20 .. 60 | Length/reach of the star spikes, ~20-60 (default 30). |
| Brightness | float | 100 | 50.3 .. 100 | Intensity of the flares, ~50-100 (default 100). |
| Threshold | float | 75 | 24 .. 96 | Brightness cutoff for which pixels sprout flares, ~24-96 (default 75). |
| Angle | float (radians) | 0.006854 | 0 .. 1.054 | Rotation of the star spikes, radians (default ~0). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 2 instances)* |
| Spike Count | enum(int) | 3 | 3 .. 10 | Number of radiating arms per star, 3-10 (default 3). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 3 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

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

### Metal fragment shader — `HgcScaleAndAddClampDazzle`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcScaleAndAddClampDazzle` → [`HgcScaleAndAddClampDazzle.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcScaleAndAddClampDazzle.metal)

```metal
//Metal1.0     
//LEN=00000001f0
[[ visible ]] FragmentOut HgcScaleAndAddClampDazzle_hgc_visible(const constant float4* hg_Params,
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

### CPU parameter wiring — `-[PAEDazzle canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEDazzle`

```asm
00000000000320d0	mov	w3, #0x1
00000000000320d4	bl	"_objc_msgSend$getFloatValue:fromParm:atFxTime:"
00000000000320d8	ldr	x4, [x22]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parm-id legend (from addParameters — parmId : UI control type):
    parm1 : FloatSlider
    parm2 : AngleSlider
    parm3 : FloatSlider
    parm4 : FloatSlider
    parm5 : IntSlider
    parm7 : ToggleButton
    parm6 : ToggleButton
  (match these to the named controls in the Parameters table above,
   in the same order; host Mix is parmId 10001.)

  parameters read by the render method, in program order:
    - parm1 (float)
    - parm3 (float)
    - parm4 (float)
    - parm2 (float)
    - parm5 (int)
    - parm7 (bool)
    - parm6 (bool)

```
