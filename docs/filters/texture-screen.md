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
