# Sliced Scale

- **PAE class:** `Sliced Scale`
- **Plugin UUID:** `546352EB-956A-4DDA-9071-C82CC50B7F73`
- **Node names in corpus:** Sliced Scale (6), Scale (2), Width (1)
- **Corpus usage:** 5 files, 9 instances

## What it does

Sliced Scale is a 9-slice / nine-patch scaler: it divides the image into a 3x3 grid using two slice guides and scales the center and edge regions independently, so corners stay fixed while edges stretch (like scalable UI panels/frames). Slice guides and the Scale point set the grid and target size.

> **Note.** Not implemented; description is the standard Apple Motion "Sliced Scale" (nine-patch) filter. Expand/Debug are internal groups.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Edit Slices | bool | 0 | 0 .. 0 | Toggles the slice-guide editing mode (UI). |
| Slice Right Top | point2D | - | - | Top-right slice guide position. |
| Slice Left Bottom | point2D | - | - | Bottom-left slice guide position. |
| Scale Method | enum(int) | 0 | 0 .. 2 | How the sliced regions are scaled (stretch vs tile), 0-2. |
| Scale | point2D | - | - | Target scale (X,Y) applied to the sliced image. |
| Offset | point2D | - | - | Positional offset of the scaled result. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |
| Expand | group | - | - | *(unverified)* |
| Debug | group | - | - | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcSlicedScale` embedded shader. Decoded functional form:_

Sliced Scale is a **9-slice (scale-9) resize**: two guides split an axis into three regions — the
outer two are kept at 1:1 while only the **middle** region is stretched by the Scale factor. Used to
grow banners/borders without distorting their ends.

```
p      = dot(texCoord, axis) / dim              // position along the scaled axis
lo     = hg_Params[2].y   (·Scale-adjusted)     // inner guide (start of stretch region)
hi     = hg_Params[1].z                          // inner guide (end of stretch region)
S      = hg_Params[0].x                          // Scale factor for the middle slice
if      p < lo*S:      src_p = p                 // left slice: unscaled (map straight through)
elif    p > hi_scaled: src_p = p - (S-1)*mid     // right slice: unscaled, shifted back
else:                  src_p = lo + (p-lo)/S     // middle slice: inverse-scale into source
out    = sample(source, along axis at src_p)     // (other axis passes through)
```

`hg_Params[0].x` = **Scale** (middle-region stretch), `hg_Params[1].z`/`[2].y` = the **slice guides**
(where the fixed edges end). The chain of `float(a<b)` comparisons is the branchless region select.
Head-start: piecewise inverse map along the scaled axis — identity in the caps, `1/Scale` in the
middle. Extend to both axes for full 9-slice.
