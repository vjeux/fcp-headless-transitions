# Zoom Blur

- **PAE class:** `Zoom Blur`
- **Plugin UUID:** `11C0E095-5F4F-46E2-AE28-F56ED7D38D7E`
- **Node names in corpus:** Zoom Blur (67), Zoom Blur 2 (6), Zoom Blur 3 (2), Zoom Blur 1 (2)
- **Corpus usage:** 58 files, 77 instances

## What it does

Zoom Blur streaks the image radially from a Center point (a dolly-zoom / speed-warp blur), optionally adding a rotational Swirl. Amount sets the streak length. Implemented in TS (shares the directional-blur module's radial mode).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 2 | 0 .. 50 | Length/strength of the radial streak, 0-50. 0 = no blur. Heavily keyframed for punch-in bursts. *(keyframed in 36 instances)* |
| Swirl | float | 0 | -0.03 .. 1 | Adds a rotational component to the zoom, -0.03..1. 0 = pure radial zoom; positive = spiral streaks. |
| Center | point2D | - | - | Focus point the blur streaks away from (X,Y) in normalized frame coordinates. |
| Look | bool/enum | 0 | 0 .. 1 | Selects a blur look/quality variant. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the streaked result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 10 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/directional-blur.ts`](../../engine/src/compositor/filters/directional-blur.ts).
