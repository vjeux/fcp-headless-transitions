# Compound Blur

- **PAE class:** `Compound Blur`
- **Plugin UUID:** `000BAA25-418E-412B-8649-CF5C7C2771E3`
- **Node names in corpus:** Compound Blur (81), Compound Blur copy (1), Vignette Blur (1), Compound Blur 1 (1), Compound Blur Source (1)
- **Corpus usage:** 83 files, 85 instances

## What it does

Compound Blur uses a second image (the Blur Map) to drive blur strength per pixel: bright areas of the map get more blur, dark areas stay sharp, so an arbitrary mask controls where focus falls. Amount is the max radius, Map Channel selects which channel of the map to read, and Invert/Stretch adjust the mask. It is the general depth-of-field-from-a-matte tool.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Compound Blur". Behavior follows a variable Gaussian driven by the map channel.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 7 | 0 .. 300 | Maximum blur radius reached where the map is fully bright, 0-300. 0 = no blur. *(keyframed in 7 instances)* |
| Blur Map | source ref | 0 | 0 .. 3335359707 | Reference to the layer used as the per-pixel blur-strength map (stored as a source-ID integer). |
| Map Channel | enum(int) | 4 | 3 .. 4 | Which channel of the map drives blur, 3-4 (e.g. alpha vs luminance). |
| Invert Map | bool | 0 | 0 .. 1 | Toggle: invert the map so dark areas blur instead of bright. |
| Stretch Map | bool | 0 | 0 .. 1 | Toggle: stretch/fit the map to the frame. |
| Horizontal | float (percent) | 100 | 10 .. 100 | Horizontal blur weighting, 10-100%. |
| Vertical | float (percent) | 100 | 10 .. 100 | Vertical blur weighting, 10-100%. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 4 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
