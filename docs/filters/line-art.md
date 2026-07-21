# Line Art

- **PAE class:** `Line Art`
- **Plugin UUID:** `3286E661-A40D-40BE-82AB-1852FFAF91E0`
- **Node names in corpus:** Line Art (25), LA (2)
- **Corpus usage:** 21 files, 27 instances

## What it does

Line Art converts the image into a stylized pen-and-ink drawing: it detects edges and renders them as ink strokes on a paper-colored background. Threshold and Smoothness control which edges become ink, while the Paper/Ink colors and Paper Opacity set the drawing's look.

> **Note.** Not implemented; description is the standard Apple Motion "Line Art" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Threshold | float | 0.07 | 0.02 .. 0.2 | Edge-detection threshold; lower = more lines, ~0.02-0.2 (default 0.07). |
| Smoothness | float | 0.11 | 0 .. 0.15 | Smoothing of the detected lines, 0-0.15 (default 0.11). |
| Paper Color | color | - | - | Background (paper) color. |
| Paper Opacity | float | 1 | 0 .. 1 | Opacity of the paper background, 0-1. NOT a boolean. |
| Ink Color | color | - | - | Color of the ink strokes. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
