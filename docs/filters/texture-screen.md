# Texture Screen

- **PAE class:** `Texture Screen`
- **Plugin UUID:** `FBED5D89-8D51-451E-8331-D02F15DE3FA1`
- **Node names in corpus:** Texture Screen (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Texture Screen maps an external texture image onto the source through a halftone-style screen, so the picture is rendered as tonal modulation of the supplied texture (a patterned-screen / texture-halftone). Contrast/Threshold shape how tone maps to texture and Center/Angle/Scale position the screen.

> **Note.** Not implemented; description is the standard Apple Motion "Texture Screen" filter. Map Image is an image-input handle; Angle/Skew/Stretch/Scale are pattern-transform sub-knobs.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the texture screen (X,Y) in normalized frame coordinates. |
| Contrast | float | 1 | 1 .. 20 | Contrast of the texture mapping, ~1-20 (default 1). |
| Threshold | float | 0.5 | -2 .. 0 | Tonal threshold where the texture switches on, ~-2..0 (default 0.5). |
| Noise Contrast | float | 1 | 0.05 .. 1 | Contrast of the noise component, 0.05-1 (default 1). |
| Noisiness | float | 1 | 6 .. 20 | Amount of noise mixed into the screen, ~6-20 (default 1). |
| Mix | float | 1 | 0.091 .. 1 | Wet/dry blend, 0-1 continuous. |
| Map Image | float | 0 | 10145 .. 11513 | *(unverified)* |
| Angle | bool | 0 | 0 .. 0 | *(unverified)* |
| Skew | bool | 0 | 0 .. 0 | *(unverified)* |
| Stretch | bool | 0 | 0 .. 0 | *(unverified)* |
| Scale | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcTextureScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcTextureScreen.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcTextureScreen
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Texture Screen thresholds the image's luma against a **screen texture** (`color1`, a pattern
generated/sampled upstream) to produce a patterned monochrome output — like printing through a mesh.

```
imgLum = dot(color0², weights)                     // hg_Params[1]; note luma of SQUARED color (gamma-ish)
scr    = dot(color1, weights)                      // luma of the screen pattern texture
scr    = scr*hg_Params[0].x + hg_Params[0].z       // screen scale+offset
v      = clamp(imgLum*hg_Params[0].y + scr, 0, 1)   // combine image luma with screen, threshold
out.rgb= v * color1.a                              // (monochrome, premultiplied)
```

`hg_Params[0]` = **(screen gain, image gain, screen offset)** — how the pattern and image mix,
`hg_Params[1]` = luma weights. The `color0²` is a perceptual weighting. Head-start: supply a screen
pattern, combine `image_luma·k + screen`, threshold. The pattern is the creative input.

