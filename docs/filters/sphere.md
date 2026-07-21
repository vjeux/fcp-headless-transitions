# Sphere

- **PAE class:** `Sphere`
- **Plugin UUID:** `1E78D3E3-63AC-46E3-99F4-014129B9ECCC`
- **Node names in corpus:** Sphere (16), On Screen Control (1), On Screen Controls (1)
- **Corpus usage:** 16 files, 18 instances

## What it does

Sphere wraps the image onto a 3D sphere, mapping the flat frame around a ball centered at Center with the given Radius, so the picture bulges into a globe with the edges receding around the back.

> **Note.** Not implemented; description is the standard Apple Motion "Sphere" distortion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 400 | 15 .. 915 | Radius of the sphere the image is wrapped onto, ~15-915 (default 400). |
| Center | point2D | - | - | Center of the sphere (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
