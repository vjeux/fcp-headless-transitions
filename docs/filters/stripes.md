# Stripes

- **PAE class:** `Stripes`
- **Plugin UUID:** `6968E691-88C2-4FAC-8864-674BD75C777F`
- **Node names in corpus:** Stripes (25), Stripes 2 (1)
- **Corpus usage:** 17 files, 26 instances

## What it does

Stripes overlays a repeating stripe/line pattern generator over the image. Center positions the pattern, Angle rotates the stripes, and Offset shifts their phase. (Note: this filter is largely a pattern generator; most creative controls live in its OSC.)

> **Note.** Not implemented; description is the standard Apple Motion "Stripes" pattern filter. (unverified) exact stripe geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Position of the stripe pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0 | 0 .. 1.571 | Rotation of the stripes, radians (0-~pi/2). |
| Offset | float | 0 | 0 .. 0 | Phase offset shifting the stripes across the frame. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 11 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
