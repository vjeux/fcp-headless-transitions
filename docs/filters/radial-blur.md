# Radial Blur

- **PAE class:** `Radial Blur`
- **Plugin UUID:** `8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A`
- **Node names in corpus:** Radial Blur (54), Amount (13), Radial BlurLeft (1), Angle (1)
- **Corpus usage:** 49 files, 69 instances

## What it does

Radial Blur applies a rotational blur about a Center point: pixels are smeared along circular arcs, as if the camera spun during exposure. Angle is the arc of the blur sweep. Implemented in TS (shares the directional-blur module's radial mode).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of rotation the blur sweeps around (X,Y) in normalized frame coordinates. *(keyframed in 1 instance)* |
| Angle | float (radians) | 0.5236 | 0 .. 0.5236 | Arc of the rotational blur sweep in radians (default ~0.524 = 30 deg, max ~0.524 observed). Larger = a longer spin streak. *(keyframed in 25 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the spun result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 8 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/directional-blur.ts`](../../engine/src/compositor/filters/directional-blur.ts).
