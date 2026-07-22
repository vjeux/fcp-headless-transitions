# Insect Eye

- **PAE class:** `Insect Eye`
- **Plugin UUID:** `62A7EF56-178A-4D81-AF6A-C1B77A7D9519`
- **Node names in corpus:** Insect Eye (15), Insect Eye 2 (3), Insect Eye 1 (3), Insect Eye 3 copy (1), Insect Eye 3 (1)
- **Corpus usage:** 10 files, 23 instances

## What it does

Insect Eye tiles the image into a honeycomb of hexagonal facets, each showing a small refracted copy of the picture, mimicking a compound insect eye. The verbatim HgcInsectEye shader builds a hexagonal grid (the 1.7321 = sqrt(3) constant is the hex-grid metric) and refracts the sample within each cell. Size sets the facet size and Refraction how much each facet distorts.

> **Note.** Shader-only. The verbatim HgcInsectEye (+ HgcInsectEyeBorder) Metal shaders are checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float (pixels) | 128 | 17 .. 350 | Size of each hexagonal facet, ~17-350 (default 128). *(keyframed in 4 instances)* |
| Refraction | float | 2 | 0 .. 2.03 | How strongly each facet bends/magnifies its sample, 0-~2 (default 2). *(keyframed in 14 instances)* |
| Border Size | float | 1 | 0 .. 1 | Thickness of the dark border between facets. Continuous float. |
| Border Color | color | - | - | Color of the inter-facet border (see companion HgcInsectEyeBorder shader). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcInsectEye` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcInsectEye.metal` (Phase-1 done, Phase-2 open).

## Algorithm (decoded)

_RE'd from `HgcInsectEye` (+ `HgcInsectEyeBorder`) embedded shaders. Decoded functional form:_

Insect Eye tiles the frame into a **hexagonal grid of facets**, each facet sampling the source at
its own center — a compound-eye/honeycomb look. The shader does hex-grid coordinate rounding.

```
// Convert pixel coords to a hex grid using the classic axial→cube rounding.
// The constant 1.7321 ≈ sqrt(3) is the hex geometry factor.
q      = texCoord * hg_Params[3].xy + hg_Params[3].zw       // scale to facet size + offset
// two skewed axes (·sqrt3) give hex rows:
a      = q.x*sqrt3 + q.y
b      = q.x*sqrt3 - q.y
// round both to nearest integer (floor + fract compare) → nearest hex cell center:
cell   = hexRound(floor(a), floor(b), q)                    // pick nearest of the 3 candidate centers
center = cellToXY(cell)                                     // facet center in texture space
out    = sample(source, center)                             // whole facet shows its center pixel
```

`HgcInsectEyeBorder` draws the dark seams between facets (same hex math, emits edge coverage instead
of the sample). `hg_Params[3]` = **facet size**, `hg_Params[5]` = **Center/offset**. The `sqrt(3)`
and the `fract`/`floor` cascade are the hexagonal-lattice nearest-cell rounding. Head-start:
implement axial hex rounding at the chosen facet size; each output pixel = its hex cell's center
sample; overlay borders from InsectEyeBorder.
