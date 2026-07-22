# Glass Block

- **PAE class:** `Glass Block`
- **Plugin UUID:** `E8018079-D8E9-45B0-9A29-6B2BFC356AFB`
- **Node names in corpus:** Glass Block (13)
- **Corpus usage:** 7 files, 13 instances

## What it does

Glass Block tiles the image into a grid of rectangular glass bricks, each refracting/magnifying its portion of the picture like glass-block windows. Tile Size sets the brick size, Scale the magnification within each brick, and Angle rotates the grid.

> **Note.** Not implemented; description is the standard Apple Motion "Glass Block" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Scale | float | 2.8 | 1.12 .. 2.92 | Magnification within each glass brick, ~1.1-2.9 (default 2.8). *(keyframed in 4 instances)* |
| Center | point2D | - | - | Anchor of the brick grid (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0 | 0 .. 6.37 | Rotation of the brick grid, radians (default 0). |
| Tile Size | float (pixels) | 65 | 30 .. 1000 | Size of each glass brick, ~30-1000 (default 65). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcGlassBlock` embedded shader. Decoded functional form:_

Glass Block **mosaics the image into rectangular blocks that each show a shifted/rotated view** —
like looking through glass brick. Coords are quantized to a block grid, and each block's content is
offset by a per-block transform.

```
d      = texCoord - Center                          // hg_Params[0]
cell   = floor(d * hg_Params[1].xy) * hg_Params[1].zw   // which block (grid index → block origin)
local  = d - cell                                    // position within the block
// per-block offset via a 2x2 transform of the cell index (hg_Params[2] rows):
shift.x= dot(cell, hg_Params[2].xy)
shift.y= dot(cell, hg_Params[2].zw)
uv     = shift + local + Center                      // sample the shifted view inside each block
uv     = clamp(uv, hg_Params[3].xy, hg_Params[4].xy) // clamp to crop; outside → transparent
out    = sample(source, uv)
```

`hg_Params[1]` = **block size** (xy = 1/size grid, zw = size), `hg_Params[2]` = the per-block
shift/rotation matrix (the "refraction" each brick applies), `hg_Params[3]/[4]` = crop bounds.
Head-start: quantize to blocks, sample each block from a per-block-offset location. Larger blocks +
bigger shift = chunkier glass.
