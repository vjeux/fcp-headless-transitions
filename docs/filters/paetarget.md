# PAETarget

- **PAE class:** `PAETarget`
- **Plugin UUID:** `220963F2-8E3F-4642-A080-C064CA0B487E`
- **Node names in corpus:** Target (4), ImageOSC-8 (1), ImageOSC-7 (1), ImageOSC-6 (1), ImageOSC-5 (1), ImageOSC-4 (1)
- **Corpus usage:** 6 files, 16 instances

## What it does

Target (PAETarget) creates a concentric target/tunnel distortion: it remaps the image radially around Center so it wraps into rings, with an Angle offset for spiral twist. The verbatim HgcTarget shader computes distance from center, scales it, adds an angular term, and resamples -- a radial coordinate warp.

> **Note.** Shader-only. The verbatim HgcTarget Metal shader (radial distance remap around Center) is checked in under evidence/shaders/; not yet ported to TS. Node names are usually "Target".

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the target rings (X,Y) in normalized frame coordinates (shader hg_Params[0]). |
| Angle | float (radians) | pi/8 (0.3927) | 0 .. 6.252 | Angular twist/offset of the rings, radians (default pi/8). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcTarget` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcTarget.metal` (Phase-1 done, Phase-2 open).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcTarget.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTarget.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcTarget
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Target is a **radial coordinate warp** — it displaces each pixel along the ray from a center point
by an amount proportional to its distance, producing a concentric zoom/target-ring distortion.

```
d    = (texCoord - Center) * asp.xy        // recentre + aspect-correct (Center=hg_Params[0])
r    = length(d)                           // radius from center
disp = hg_Params[1].xy * r                 // displacement magnitude ∝ radius (the "target" strength)
uv   = disp * asp.zw                        // undo aspect
     + Center * hg_Params[3].xy             // center-relative term
uv   = (uv + hg_Params[4].xy) * hg_Params[4].zw   // final offset+scale to texture space
out  = sample(source, uv)
```

Because the displacement grows linearly with `r`, the effect is a smooth radial stretch/compress
centered on `Center`. `hg_Params[1]` is the **Amount/Size** knob (how strong the radial push),
`hg_Params[2]` the aspect correction, `hg_Params[3..4]` center/crop transforms. Head-start:
backward-warp gather with `uv = center + (p−center)·(1 + k·|p−center|)`-style radial map; decode
`-[PAETarget ...]` for the exact `k(Amount)`.

