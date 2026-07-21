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
