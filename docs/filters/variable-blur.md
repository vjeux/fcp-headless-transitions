# Variable Blur

- **PAE class:** `Variable Blur`
- **Plugin UUID:** `05DB4F81-7C57-4F33-A5B3-763C913ACAA3`
- **Node names in corpus:** Variable Blur (78), Variable Blur copy (1), Variable Blur 2 (1), Variable Blur 3 (1)
- **Corpus usage:** 78 files, 81 instances

## What it does

Variable Blur blurs the frame by an amount that increases with distance from a Center, between an Inner Radius (sharp) and an Outer Radius (fully blurred) -- a radial tilt-shift / focus-ring. Amount is the maximum blur. Not implemented and no checked-in shader; described from the standard Motion "Variable Blur".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Variable Blur" (radial focus falloff).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 10 | 0 .. 100 | Maximum blur radius reached beyond the outer radius, 0-100. 0 = no blur. *(keyframed in 11 instances)* |
| Inner Radius | float (pixels) | 100 | 0 .. 665 | Radius of the fully-sharp central region, 0-665. Inside this, no blur. |
| Outer Radius | float (pixels) | 400 | 0 .. 1000 | Radius at which blur reaches maximum, 0-1000. Blur ramps between inner and outer. |
| Center | point2D | - | - | Center of the focus ring (X,Y) in normalized frame coordinates. *(keyframed in 5 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the blurred result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
