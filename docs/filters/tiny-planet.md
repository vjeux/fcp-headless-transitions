# Tiny Planet

- **PAE class:** `Tiny Planet`
- **Plugin UUID:** `AAC5D840-7379-4B49-941A-DAE7F6882AEE`
- **Node names in corpus:** Tiny Planet (4), WarpEffect (1)
- **Corpus usage:** 5 files, 5 instances

## What it does

Tiny Planet reprojects an equirectangular 360 image into a stereographic "little planet" -- the ground curls into a small globe with the sky wrapping around the outside. X/Y/Z Rotation orient the sphere before projection and Field of View sets how much of the sphere is squeezed into frame.

> **Note.** Not implemented; description is the standard Apple Motion 360 "Tiny Planet" projection.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| X Rotation | float (radians) | 0 | -2.635 .. 0 | Pitch of the sphere before projection, radians. |
| Y Rotation | float (radians) | 0 | -2.548 .. 1.536 | Yaw of the sphere before projection, radians. |
| Z Rotation | float (radians) | 0 | 0 .. 1.885 | Roll of the sphere before projection, radians. |
| Field of View | float (degrees) | 360 | 360 .. 720 | How much of the sphere is squeezed into frame, ~360-720 (default 360). |
| Rotation Order | enum | 0 | 0 .. 0 | Order the X/Y/Z rotations are applied. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
