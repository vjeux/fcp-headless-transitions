# Crystallize

- **PAE class:** `Crystallize`
- **Plugin UUID:** `9D6E32F9-7C04-4207-B1B5-A480780B2B9D`
- **Node names in corpus:** Crystallize (14), Crystallize Out (1), Crystallize In (1)
- **Corpus usage:** 14 files, 16 instances

## What it does

Crystallize breaks the image into randomly-shaped crystal cells (a Voronoi/cellular mosaic), filling each cell with a single averaged color so the picture looks like it is seen through cut glass. Size sets the crystal scale, Speed animates the cells, and Feathering softens cell edges.

> **Note.** Not implemented; description is the standard Apple Motion "Crystallize" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float (pixels) | 8 | 3 .. 64 | Size of the crystal cells, ~3-64 (default 8). *(keyframed in 4 instances)* |
| Speed | float | 0.5 | 0 .. 2 | Animation rate of the crystal pattern, 0-2 (default 0.5). |
| Smooth | bool | 1 | 0 .. 1 | Smooth the cell coloring rather than flat-fill. |
| Feathering | float | 0.25 | 0 .. 2 | Softness of the cell boundaries, 0-2 (default 0.25). |
| Mix | float | 1 | 0.9 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 4 instances)* |
| Smoothness | bool | 1 | 1 .. 1 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcCrystallize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcCrystallize.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcCrystallize
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

`HgcCrystallize` is a **Voronoi/depth pass**: it passes the source color through but writes a
**depth** equal to the distance from each pixel to its cell's feature point. The actual crystallize
(snapping each cell to one color) is resolved by the depth-buffer min upstream — the pixel closest
to each Voronoi seed "wins" the cell.

```
out.color = sample(source, texCoord0)          // color passthrough
d         = (texCoord2 - texCoord1) * hg_Params[1].xy   // vector to the cell's feature point
out.depth = length(d) * hg_Params[0].z         // depth = distance to seed (× scale)
```

`hg_Params[1]` = cell size / aspect, `hg_Params[0].z` = depth scale. Because FCP renders this with
depth-testing, the fragment nearest each Voronoi seed survives → the frame is partitioned into
polygonal crystal cells, each filled from its seed pixel. **Cell Size** = the seed spacing.
Head-start: compute a Voronoi diagram at the chosen cell size; fill each cell with the color at its
seed. (This one needs a Voronoi pass, not a pure per-pixel gather.)

