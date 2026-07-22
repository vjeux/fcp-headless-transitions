# Channel Blur

- **PAE class:** `Channel Blur`
- **Plugin UUID:** `6C0F1215-6017-44F0-82C8-1B265FDC16CB`
- **Node names in corpus:** Channel Blur (225), Channel Blur copy (2), Channel Blur Source (1)
- **Corpus usage:** 185 files, 228 instances

## What it does

Channel Blur blurs the R, G, B and alpha channels independently: you can blur, say, only the red channel while keeping green sharp, producing controllable chromatic softening or selective-channel effects. Amount sets the radius and per-channel toggles select which channels get blurred; Horizontal/Vertical weight the blur axis.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Channel Blur" (per-channel Gaussian). Behavior follows Gaussian Blur applied selectively.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 4 | 0 .. 750 | Blur radius in pixels applied to the enabled channels, 0-750. 0 = no blur. *(keyframed in 6 instances)* |
| Blur Red | bool | 1 | 0 .. 1 | Toggle: blur the red channel. |
| Blur Green | bool | 1 | 0 .. 0 | Toggle: blur the green channel. |
| Blur Blue | bool | 1 | 0 .. 1 | Toggle: blur the blue channel. |
| Blur Alpha | bool | 1 | 0 .. 1 | Toggle: blur the alpha channel. |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal blur weighting, 0-100%. |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical blur weighting, 0-100%. |
| Mix | float | 1 | 0.4 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 214 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcChannelBlur.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcChannelBlur.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcChannelBlur
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

`HgcChannelBlur` is **not** the blur convolution itself — it is the per-channel *un/re-premultiply +
mix* combine that FCP wraps around a blurred copy. The actual blur (per-channel radii) is a
Gaussian pass run upstream (the Helium `HGBlur` primitive, same one decoded in
`gaussian-blur.ts`); this shader blends the blurred result back per channel:

```
orig    = color0                      // original (premultiplied)
blurred = color1                      // blurred copy (premultiplied)
b_str   = blurred.rgb / max(blurred.a, 1e-6)      // un-premultiply the blurred rgb
mixed   = mix(orig.rgb, b_str, hg_Params[0].rgb)  // per-channel blend factor (R,G,B independent!)
out.rgb = mixed * orig.a              // re-premultiply against ORIGINAL alpha
out.a   = orig.a
```

**Key insight:** the blend factor is a *per-channel float3* (`hg_Params[0].xyz`), so Channel Blur
can blur the red channel fully while leaving blue sharp — that's the whole point of the filter vs a
plain Gaussian. The per-channel blur **radii** are the creative params (Red/Green/Blue/Alpha
amounts); they drive the upstream `HGBlur` passes, and this shader's `hg_Params[0]` selects how much
of each blurred channel to keep. To finish: decode `-[PAEChannelBlur ...]` to confirm each channel's
radius→HGBlur mapping (expected identical to Gaussian's `sigma = radius/6.10`).

