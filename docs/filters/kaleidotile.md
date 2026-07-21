# Kaleidotile

- **PAE class:** `Kaleidotile`
- **Plugin UUID:** `7438BC75-716C-4D49-9613-7EE2834B9B7B`
- **Node names in corpus:** Kaleidotile (55), Kaleidotile copy (5), kt (3), rect5ctl (3), rect4ctl (3), rect3ctl (3)
- **Corpus usage:** 52 files, 78 instances

## What it does

Kaleidotile tiles the frame into a repeating kaleidoscopic pattern: it takes a Width x Height cell of the image, mirrors/rotates it and tiles it across the frame with a rotation Angle, producing a symmetric mandala/mosaic. FCP's HgcKaleidaTile shader exists in the binary. Not implemented; described from the standard Motion "Kaleidotile".

> **Note.** Not implemented in the TS engine and no checked-in shader (HgcKaleidaTile exists in the binary but is not extracted here). Described from the standard Motion "Kaleidotile".

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Width | float (pixels) | 64 | 28 .. 4072 | Width of the source tile cell, 28-4072 (default 64). *(keyframed in 4 instances)* |
| Height | float (pixels) | 64 | 64 .. 4000 | Height of the source tile cell, 64-4000 (default 64). *(keyframed in 1 instance)* |
| Angle | float (radians) | 0 | 0 .. 6.278 | Rotation of the tiling pattern, 0..2pi. |
| Center | point2D | - | - | Center/origin of the kaleidoscope (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the kaleidoscoped result over the original, 0-1 continuous. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
