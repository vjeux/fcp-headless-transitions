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
