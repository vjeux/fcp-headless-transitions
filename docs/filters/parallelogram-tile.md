# Parallelogram Tile

- **PAE class:** `Parallelogram Tile`
- **Plugin UUID:** `9946E82C-ABC0-4B0F-BB63-0BB96535D43F`
- **Node names in corpus:** Parallelogram Tile (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Parallelogram Tile tiles the image in a parallelogram-shaped grid: each tile is a parallelogram defined by Acute Angle, repeated to fill the frame, with Angle rotating the whole pattern and Tile Size setting the cell size.

> **Note.** Not implemented; description is the standard Apple Motion "Parallelogram Tile" filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the tiling (X,Y) in normalized frame coordinates. |
| Acute Angle | float (radians) | pi/2 (1.5708) | 1.571 .. 1.571 | The acute corner angle of the parallelogram cell, radians (default pi/2 = rectangular). |
| Tile Size | float (pixels) | 100 | 100 .. 100 | Size of each parallelogram tile, ~100 (default 100). |
| Angle | float (radians) | 0 | 0 .. 0 | Rotation of the whole tiling pattern, radians (default 0). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcParallelogramTile` embedded shader. Decoded functional form:_

Parallelogram Tile **kaleidoscope-tiles** the image into mirrored parallelogram cells: coordinates
are projected onto two (non-orthogonal) axes, folded with a `min(frac, 1-frac)` mirror, then mapped
back — so the frame fills with a repeating, edge-mirrored parallelogram pattern.

```
u    = fract(dot((texCoord,1), hg_Params[0].xyz))   // axis 1 (slanted → parallelogram)
v    = fract(dot((texCoord,1), hg_Params[1].xyz))   // axis 2
u    = min(u, 1-u)                                   // mirror-fold within the cell (seamless tiling)
v    = min(v, 1-v)
uv.x = dot((u,v,1), hg_Params[2].xyz)                // map folded coords back to texture space
uv.y = dot((u,v,1), hg_Params[3].xyz)
out  = sample(source, (uv+hg_Params[4].xy)*hg_Params[4].zw)
```

`hg_Params[0]/[1]` = the two tiling axes (their skew makes parallelograms rather than squares; Angle
+ Size params), `hg_Params[2]/[3]` = the inverse map. The `min(f,1-f)` fold is what makes adjacent
tiles mirror seamlessly. Head-start: project onto two skew axes, mirror-fold, sample. (Random Tile
and Perspective Tile are variants: Random Tile adds a per-cell random offset/rotation; Perspective
Tile applies a homography per tile.)
