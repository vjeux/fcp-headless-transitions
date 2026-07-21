# 360° Reorient

- **PAE class:** `360° Reorient`
- **Plugin UUID:** `E61FE95E-0108-47DA-8F29-3CB3C47428EF`
- **Node names in corpus:** 360° Reorient (5), DistortionOrient (1)
- **Corpus usage:** 4 files, 6 instances

## What it does

360 Reorient rotates the viewing sphere of an equirectangular 360 image by three Euler angles -- Tilt (pitch, X), Pan (yaw, Y), and Roll (Z) -- resampling the panorama so the horizon/heading changes. All angles are in radians read straight from the .motr. Identity (0,0,0) is an exact passthrough. Implemented in the TS engine.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Tilt (X) | float (radians) | 0 | -1.571 .. 0 | Pitch rotation about the X axis, radians. |
| Pan (Y) | float (radians) | 0 | 0 .. 3.142 | Yaw/heading rotation about the Y axis, radians. |
| Roll (Z) | float (radians) | 0 | 0 .. 3.142 | Roll rotation about the Z axis, radians. |
| Mix | float | 1 | 1 .. 1 | Blend the reoriented result back toward the input, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/reorient360.ts`](../../engine/src/compositor/filters/reorient360.ts).
