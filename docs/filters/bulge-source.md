# Bulge Source

- **PAE class:** `Bulge Source`
- **Plugin UUID:** `6AFD20E9-70D0-48F2-A5DD-97FC7B3E2BC4`
- **Node names in corpus:** Bulge (209), Distort 01 (10), Pointer OSC (8), Fix (1), Bulge copy (1), Effect (1)
- **Corpus usage:** 204 files, 236 instances

## What it does

Bulge (Bulge Source) pushes pixels radially outward from a center point to create a convex, lens-like magnification bump (or, with negative Scale, a concave pinch). Amount sets the pixel radius of the affected region and Scale the strength/sign of the bulge. Used for fisheye pops, magnifier, and elastic-pop transitions.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Bulge" filter. The exact radial displacement curve is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 300 | 0 .. 14712 | Radius of the bulge region in pixels (default 300). Larger = a wider area is distorted. *(keyframed in 10 instances)* |
| Center | point2D | - | - | Center of the bulge (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Scale | float | 0.5 | -1.34 .. 4.424 | Strength and sign of the bulge, roughly -1.3..4.4. Positive = convex outward bulge, negative = concave pinch, 0 = no distortion. *(keyframed in 187 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the bulged result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
