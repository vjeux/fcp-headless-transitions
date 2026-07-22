# Random Tile

- **PAE class:** `Random Tile`
- **Plugin UUID:** `F63A2C1A-551A-4061-8DEF-F20183056ABA`
- **Node names in corpus:** Random Tile (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Random Tile shatters a circular region (Radius) around Center into randomly-offset tiles, scattering the image into a mosaic of displaced squares. Seed sets the random arrangement and Feathering softens tile edges. Used for shatter/scatter transitions.

> **Note.** Not implemented; description is the standard Apple Motion "Random Tile" scatter filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the shattered region (X,Y) in normalized frame coordinates. |
| Radius | float (pixels) | 250 | 512 .. 512 | Radius of the affected region, ~512 (default 250). |
| Feathering | float | 0.5 | 1 .. 1 | Softness of the tile edges (default 0.5). Continuous float, NOT a boolean. |
| Seed | float (int seed) | 0 | 189 .. 189 | Random seed for the tile scatter arrangement. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcRandomTile` embedded shader — a variant of the Parallelogram/mirror tiler
(see `parallelogram-tile.md`)._ Coordinates are quantized to a tile grid; each tile is given a
**pseudo-random offset (and/or flip)** keyed by its grid index before sampling the source, so the
frame fills with randomly-shuffled tiles of the image.

```
cell   = floor(texCoord * gridFreq)            // which tile (hg_Params sets frequency)
rnd    = hash(cell)                            // per-tile random (baked/looked-up)
local  = fract(texCoord * gridFreq)            // position within tile
uv     = (cell + local) shifted by rnd·offset  // random per-tile displacement (+ optional mirror)
out    = sample(source, uvToTexture(uv))
```

Head-start: same tiler as Parallelogram Tile but add `hash(cell)`-driven offset/flip per cell.
