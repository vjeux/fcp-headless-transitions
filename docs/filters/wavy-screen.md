# Wavy Screen

- **PAE class:** `Wavy Screen`
- **Plugin UUID:** `3C4B5F14-3D6B-4C35-8314-24077F0CB276`
- **Node names in corpus:** Wavy Screen (4), Wavy Screen copy (2)
- **Corpus usage:** 4 files, 6 instances

## What it does

Wavy Screen combines a wavy sinusoidal displacement with a halftone/screen pattern, giving a rippling patterned-screen look. Amplitude/Wavelength shape the wave, Scale the screen frequency, and Contrast the pattern hardness.

> **Note.** Not implemented; description is the standard Apple Motion "Wavy Screen" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float (pixels) | 40 | 0 .. 40 | Wave displacement amplitude, 0-40 (default 40). |
| Wavelength | float (pixels) | 125 | 0 .. 394 | Distance between wave crests, ~0-394 (default 125). |
| Scale | enum(int) | 10 | 8 .. 10 | Screen/pattern frequency, 8-10 (default 10). |
| Contrast | float | 0.5 | 0.5 .. 1 | Hardness of the screen pattern, 0.5-1 (default 0.5). |
| Mix | float | 1 | 0.4195 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcWavyScreen` embedded shader. Decoded functional form:_

Wavy Screen is a **line screen whose lines wobble** — a halftone line pattern modulated by a sine so
the hatching ripples across the frame.

```
uv    = (texCoord + 0.5·offset) * Scale               // hg_Params[1],[2]
wob   = fract(Freq1 * uv.x)*(-2)+1                     // a wave along x (hg_Params[0].x = Freq1)
row   = (offset.y - uv.y) + |wob| * hg_Params[0].z     // displace the line coordinate by the wave
line  = fract(row * hg_Params[0].y)*(-2)+1             // line-screen triangle wave (hg_Params[0].y = line freq)
line  = |line|
lum   = dot(color0, hg_Params[3])                      // image luma
out   = clamp((lum - line) * hg_Params[0].w + 0.5, 0, 1) * color0.a
```

`hg_Params[0]` packs **(wobble freq, line freq, wobble amplitude, contrast)**, `hg_Params[3]` = luma
weights. The `|fract·(−2)+1|` idiom is the triangle-wave line profile; the extra sine (`wob`) bends
the lines. Head-start: line screen (as in `line-screen.md`) but add a sinusoidal offset to the line
coordinate before thresholding.
