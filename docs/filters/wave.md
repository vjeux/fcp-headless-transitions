# Wave

- **PAE class:** `Wave`
- **Plugin UUID:** `C67E6AD5-C16B-40CE-AA72-A4F88EDDD990`
- **Node names in corpus:** Wave (40), Wave copy (19), Wave copy 4 (1), Wave  (1)
- **Corpus usage:** 33 files, 61 instances

## What it does

Wave displaces the image along sinusoidal waves: each row (or column, if Vertical) is shifted horizontally by a sine of its position, producing a rippling flag/water wobble. Amplitude sets how far pixels move, Wavelength the distance between wave crests, and Offset scrolls the wave phase over time (animate it for motion).

> **Note.** Not implemented; description is the standard Apple Motion "Wave" distortion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float (pixels) | 10 | 0 .. 468.8 | Peak displacement of the wave in pixels, ~0-470 (default 10). *(keyframed in 3 instances)* |
| Wavelength | float (pixels) | 100 | 4 .. 500 | Distance between wave crests in pixels, ~4-500 (default 100). Smaller = tighter ripples. *(keyframed in 1 instance)* |
| Offset | float (pixels) | 100 | -147 .. 500 | Phase offset that scrolls the wave; animate to make the wave travel. Default 100. *(keyframed in 2 instances)* |
| Vertical | bool | 0 | 0 .. 1 | If on, waves run vertically (columns shifted) instead of horizontally. |
| Repeat Edges | bool | 1 | 0 .. 1 | Clamp/repeat edge pixels instead of showing transparent gaps where the image is pushed away. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the waved result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcWave` embedded shader. Decoded functional form:_

Wave is a **sinusoidal displacement** — it offsets each pixel's sample position by a sine of the
opposite coordinate, giving a rippling flag/water wobble.

```
d      = texCoord - Center                       // Center = hg_Params[2]
offX   = Amplitude * sin(Frequency * d.x)        // hg_Params[0].x = Amplitude, [1].x = Frequency
offY   = Amplitude * sin(Frequency * d.y)
uv     = texCoord*aspect + (offX, offY)*aspect*hg_Params[3].xy   // apply, scaled per-axis
// optional clamp to crop bounds (hg_Params[4]) gated by hg_Params[5]
uv     = (uv + hg_Params[7].xy) * hg_Params[7].zw
out    = sample(source, uv)
```

`hg_Params[0]` = **Amplitude**, `hg_Params[1]` = **Frequency** (wavelength⁻¹), `hg_Params[2]` =
**Center**, `hg_Params[3]` = per-axis weighting (lets you do horizontal-only or vertical-only waves),
`hg_Params[6]` = aspect. Note the sine of `d.x` drives the *x* offset here (a longitudinal wave);
Direction params choose which axis modulates which. Head-start: backward-warp gather with the sine
offsets above.
