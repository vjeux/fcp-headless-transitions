# Polar

- **PAE class:** `Polar`
- **Plugin UUID:** `937A3262-A691-4F18-9DB9-36B88D0A0FF7`
- **Node names in corpus:** Polar (11), Polar copy (2), Polar 2 (2), Polar 1 (2)
- **Corpus usage:** 10 files, 17 instances

## What it does

Polar converts the image between rectangular and polar coordinates: with Polar To Rect off it wraps the frame around Center (columns become concentric rings); with it on, it unwraps a polar image back to a rectangle. Used for tunnel/vortex and unwrap effects.

> **Note.** Not implemented; description is the standard Apple Motion "Polar" coordinate filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the polar mapping (X,Y) in normalized frame coordinates. |
| Polar To Rect | bool | 0 | 0 .. 1 | Direction of conversion: off = rect->polar (wrap), on = polar->rect (unwrap). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

The code below is **verbatim** from the user's licensed Final Cut Pro install — the embedded Metal shader source and the ARM64 disassembly of the plug-in class, extracted with the repo's `tools/re` toolkit. It is the actual algorithm Apple shipped, not a paraphrase. Implement against this.

### Metal fragment shader — `HgcPolarToRect`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcPolarToRect` → [`HgcPolarToRect.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcPolarToRect.metal)

```metal
//Metal1.0     
//LEN=0000000594
[[ visible ]] FragmentOut HgcPolarToRect_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(2.000000000, 0.000000000, 0.5000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[3].xy + hg_Params[2].xy;
    r1.x = r0.x*hg_Params[0].x;
    r1.y = cos(r1.x);
    r1.zw = hg_Params[2].xy + hg_Params[2].xy;
    r1.x = sin(r1.x);
    r1.xy = r0.yy*r1.xy + hg_Params[1].xy;
    r0.zw = r1.xy/r1.zw;
    r2.xy = fract(r0.zw);
    r2.xy = r1.zw*r2.xy;
    r0.xy = floor(r0.zw);
    r0.zw = r0.xy*c0.zz;
    r0.zw = floor(r0.zw);
    r0.xy = -r0.zw*c0.xx + r0.xy;
    r1.zw = r1.zw - r2.xy;
    r1.zw = mix(r2.xy, r1.zw, fabs(r0.xy));
    r0.z = abs(hg_Params[5].z);
    r1.xy = select(r1.zw, r1.xy, -r0.zz < 0.00000f);
    r0.xy = r1.zw - r1.xy;
    r0.xy = float2(c0.zz < fabs(r0.xy));
    r0.z = float(-r0.z >= c0.y);
    r0.x = fmax(r0.x, r0.y);
    r0.y = float(-r0.z >= c0.y);
    r0.x = fmin(r0.y, r0.x);
    r1.xy = select(r1.xy, r1.zw, -r0.xx < 0.00000f);
    r1.xy = r1.xy - hg_Params[2].xy;
    r1.xy = r1.xy*hg_Params[4].xy;
    r1.xy = r1.xy + hg_Params[6].xy;
    r1.xy = r1.xy*hg_Params[6].zw;
    r1 = hg_Texture0.sample(hg_Sampler0, r1.xy);
    output.color0 = select(r1, c0.yyyy, -r0.xxxx < 0.00000f);
    return output;
}
```

### Metal fragment shader — `HgcRectToPolar`
Per-pixel math. Regenerate: `venv/bin/python3 tools/re/extract_shader.py HgcRectToPolar` → [`HgcRectToPolar.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRectToPolar.metal)

```metal
//Metal1.0     
//LEN=00000006a7
[[ visible ]] FragmentOut HgcRectToPolar_hgc_visible(const constant float4* hg_Params, 
    texture2d< float > hg_Texture0, 
    sampler hg_Sampler0,
    float4 texCoord0)
{
    const float4 c0 = float4(-0.01348046958, 0.05747731403, 0.000000000, -0.1212390736);
    const float4 c1 = float4(0.1956359297, -0.3329946101, 0.9999956489, 1.570796371);
    const float4 c2 = float4(6.283185482, 3.141592741, 0.000000000, 0.000000000);
    float4 r0, r1, r2;
    FragmentOut output;

    r0.xy = texCoord0.xy*hg_Params[4].xy;
    r0.zw = c0.zz;
    r0 = r0 + hg_Params[6];
    r0 = r0 - hg_Params[1];
    r1.xy = abs(r0.xy);
    r1.z = fmax(r1.x, r1.y);
    r1.w = 1.00000f / r1.z;
    r1.z = fmin(r1.x, r1.y);
    r1.z = r1.z*r1.w;
    r1.w = r1.z*r1.z;
    r2.x = r1.w*c0.x + c0.y;
    r2.x = r2.x*r1.w + c0.w;
    r2.x = r2.x*r1.w + c1.x;
    r2.x = r2.x*r1.w + c1.y;
    r1.w = r2.x*r1.w + c1.z;
    r1.z = r1.w*r1.z;
    r1.x = r1.y - r1.x;
    r1.w = -r1.z + c1.w;
    r1.x = select(r1.z, r1.w, r1.x < 0.00000f);
    r1.y = -r1.x + c2.y;
    r1.x = select(r1.x, r1.y, r0.y < 0.00000f);
    r1.x = select(r1.x, -r1.x, r0.x < 0.00000f);
    r0.x = dot(r0, r0);
    r1.y = r1.x + c2.x;
    r1.x = select(r1.x, r1.y, r1.x < 0.00000f);
    r1.x = r1.x*hg_Params[0].x;
    r1.y = float(r1.x < hg_Params[6].x);
    r0.y = select(r1.x, hg_Params[2].y, -r1.y < 0.00000f);
    r0.w = sqrt(r0.x);
    r0.z = select(r0.y, r1.x, hg_Params[3].z < 0.00000f);
    r0.xy = r0.zw - hg_Params[6].xy;
    r0.xy = r0.xy*hg_Params[5].xy;
    r0.xy = r0.xy + hg_Params[7].xy;
    r0.xy = r0.xy*hg_Params[7].zw;
    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);
    return output;
}
```

### CPU parameter wiring — `-[PAEPolar canThrowRenderOutput:withInput:withInfo:]`
How each UI parameter is read and pushed into the shader's `hg_Params[]` slots. Regenerate: `venv/bin/python3 tools/re/disasm_pae.py PAEPolar`

```asm
00000000000d92cc	mov	w4, #0x1
00000000000d92d0	bl	"_objc_msgSend$getXValue:YValue:fromParm:atFxTime:"
00000000000d92d4	strb	w26, [sp, #0x3f]
```

```
Parameter -> shader-slot mapping, decoded from the dataflow above
(parm N = the getter's fromParm: index; slot K = the primitive/shader
 SetParameter index that feeds hg_Params[K]):

  parameters read, in program order:
    - parm2 (bool)

```
