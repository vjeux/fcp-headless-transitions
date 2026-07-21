# Tile

- **PAE class:** `Tile`
- **Plugin UUID:** `1EFA89E8-CFDA-4D08-B833-33F01A4B9139`
- **Node names in corpus:** Tile (21)
- **Corpus usage:** 16 files, 21 instances

## What it does

Tile repeats the image in a grid of copies filling the frame. Scale sets how many tiles (how small each copy), Stretch the aspect of each tile, Skew/Angle shear or rotate the tiling, and Center anchors the grid.

> **Note.** Not implemented; description is the standard Apple Motion "Tile" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor point of the tiling grid (X,Y) in normalized frame coordinates. *(keyframed in 1 instance)* |
| Skew | float | 0 | 0 .. 0 | Shears the tile grid. Continuous float (default 0). |
| Scale | enum(int) | 3 | 1 .. 10 | Tiling density (number/size of tiles), 1-10 (default 3). *(keyframed in 4 instances)* |
| Stretch | float | 1 | 0.1 .. 1 | Aspect stretch of each tile, 0.1-1 (default 1). |
| Angle | float (radians) | 0 | 0 .. 0 | Rotation of the tiling grid, radians (default 0). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
