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
