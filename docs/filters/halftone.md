# Halftone

- **PAE class:** `Halftone`
- **Plugin UUID:** `10A46FDA-13E9-4167-B8AE-1A7204EB5139`
- **Node names in corpus:** Halftone (17), Noir (1), ht (1)
- **Corpus usage:** 17 files, 19 instances

## What it does

Halftone reproduces the image as a printed halftone screen: continuous tone is converted to a grid of variously-sized dots. Scale sets the dot-grid frequency, Angle the screen angle, Contrast the dot hardness, and Center anchors the grid.

> **Note.** Not implemented; description is the standard Apple Motion "Halftone" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Scale | float | 6 | 2 .. 35 | Dot-grid frequency / cell size, ~2-35 (default 6). |
| Contrast | float | 0.5 | 0.41 .. 0.99 | Hardness of the dot edges, ~0.4-0.99 (default 0.5). |
| Center | point2D | - | - | Anchor point of the halftone grid (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | pi/4 (0.7854) | 0.3491 .. 0.8203 | Screen angle of the dot grid, radians (default pi/4). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
