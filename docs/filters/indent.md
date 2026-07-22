# Indent

- **PAE class:** `Indent`
- **Plugin UUID:** `F7F4A6D4-09A3-493F-A345-3AA779595838`
- **Node names in corpus:** Indent (36), Indent copy (7), Indent copy 4 (2), Indent copy 3 (1), 3Dkiss (1)
- **Corpus usage:** 24 files, 47 instances

## What it does

Indent is an emboss/bump-lighting effect: it treats the image (or a supplied height map) as a relief surface and relights it, carving pseudo-3D indented/raised edges with a directional highlight. Depth sets how pronounced the relief is, Light Rotation the light direction, and the Highlight/Brightness/Ambient controls shape the specular and fill lighting.

> **Note.** Not implemented; description is the standard Apple Motion "Indent" emboss/relight filter. Several Height Map wiring params are internal.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Ambient | float | 0.5 | 0 .. 0.87 | Ambient (fill) light level, 0-~0.87 (default 0.5). |
| Depth | float | 10 | 1.701 .. 100 | Strength of the embossed relief, ~1.7-100 (default 10). |
| Softness | float | 0.25 | 0 .. 1 | Softness of the relief edges, 0-1 (default 0.25). |
| Brightness | float | 0.5 | 0 .. 1.649 | Overall brightness of the relit surface, ~0-1.6 (default 0.5). |
| Highlight Brightness | float | 20 | 0 .. 1000 | Intensity of the specular highlight, ~0-1000 (default 20). |
| Highlight Sharpness | float | 30 | 1 .. 100 | Tightness of the specular highlight, ~1-100 (default 30). |
| Light Rotation | float (radians) | pi/4 (0.7854) | 0.7854 .. 5.952 | Direction of the relighting light in radians (default pi/4). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 7 instances)* |
| Height Map | float | 0 | 0 .. 1199713477 | *(unverified)* |
| Height Map X Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Height Map Y Scale | bool | 1 | 1 .. 1 | *(unverified)* |
| Height Map X Offset | bool | 0 | 0 .. 0 | *(unverified)* |
| Height Map Y Offset | bool | 0 | 0 .. 0 | *(unverified)* |
| Stretch To Fit | bool | 1 | 0 .. 1 | *(unverified)* |
| Map Channel | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 10 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Algorithm (decoded)

_RE'd from the `HgcIndent` embedded shader. Decoded functional form:_

Indent is an **emboss/bevel lighting** filter: it derives a surface normal from the alpha/luma
gradient (via 4 neighbor taps), then shades it with a directional light — giving the image a raised,
carved-into-a-surface look.

```
// 4 neighbor samples of a height source (texCoord1..4 = ±dx, ±dy taps)
gx   = dot(hg_Params[1], sampleRight - sampleLeft)     // x gradient
gy   = dot(hg_Params[1], sampleDown  - sampleUp)       // y gradient
N    = normalize( (gx, gy, hg_Params[6].z) )           // surface normal (z = flatness)
diff = clamp(dot(N, hg_Params[0].xyz), 0, 1)           // diffuse: N·lightDir
diff = diff * hg_Params[2].x + hg_Params[7].x          // gain + ambient
spec = clamp(dot(N, hg_Params[5].xyz), 0, 1)           // specular direction
spec = clamp(pow(spec, hg_Params[3].x) * hg_Params[4].x, 0, 1)   // shininess^power · intensity
out.rgb = (src·diff + spec) * a                        // shade the source, re-premultiply
```

`hg_Params[0]` = **light direction** (diffuse), `[5]` = specular direction, `[2].x` = **diffuse
gain**, `[3].x` = **shininess/hardness**, `[4].x` = **specular intensity**, `[6].z` = normal-z
(bevel softness), `[7].x` = ambient. Classic Blinn-ish bump-lighting off the image's own gradient.
Head-start: Sobel-ish gradient → normal → Lambert diffuse + power specular.
