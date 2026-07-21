# Slit Tunnel

- **PAE class:** `Slit Tunnel`
- **Plugin UUID:** `D7186443-2103-465D-A035-40C390F236EB`
- **Node names in corpus:** Slit Tunnel (2), Circles (1)
- **Corpus usage:** 2 files, 3 instances

## What it does

Slit Tunnel projects the image into a receding tunnel using slit-scan: a single strip is extruded toward Center with Perspective controlling the depth foreshortening and Speed the scroll rate, with an optional glowing tunnel edge. Used for hyperspace/tunnel transitions.

> **Note.** Not implemented; description is the standard Apple Motion "Slit Tunnel" filter. (unverified) exact slit-scan geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Vanishing point of the tunnel (X,Y) in normalized frame coordinates. |
| Speed | float | 100 | 150 .. 150 | Scroll rate down the tunnel (default 100). |
| Perspective | float | 0.5 | 0.2 .. 0.2 | Depth foreshortening of the tunnel, ~0.2-0.5 (default 0.5). |
| Glow Color | color | - | - | Color of the tunnel edge glow. |
| Glow | float | 0.05 | 0 .. 0 | Intensity of the tunnel glow (default 0.05). Continuous float, NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
