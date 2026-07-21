# Ring Lens

- **PAE class:** `Ring Lens`
- **Plugin UUID:** `9F1EEA3B-85F9-4D8F-AAE4-E4134D502D2D`
- **Node names in corpus:** Ring Lens (1), Ring Lens 2 (1), Ring Lens 3 (1)
- **Corpus usage:** 2 files, 3 instances

## What it does

Ring Lens refracts the image through a circular ring lens at Center: a torus-shaped glass ring bends the picture where the ring sits (like looking through a magnifying ring), controlled by Radius, ring Thickness, and Refraction index.

> **Note.** Not implemented; description is the standard Apple Motion "Ring Lens" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the ring lens (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Radius | float (pixels) | 160 | 342.7 .. 777 | Radius of the ring, ~340-780 (default 160). |
| Thickness | float | 0.43 | 0.78 .. 1 | Thickness of the ring band, ~0.78-1 (default 0.43). |
| Refraction | float | 1.7 | -1.5 .. 1.97 | Refraction strength/index of the ring glass, ~-1.5..2 (default 1.7). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
