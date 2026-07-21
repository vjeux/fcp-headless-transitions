# Offset

- **PAE class:** `Offset`
- **Plugin UUID:** `D6245DC0-5D17-4847-ABB0-C4D01C3FA3F7`
- **Node names in corpus:** Offset (347), Offset copy (13), Offset 1 (3), Offset 2 (3), Ofst (1), Offset H (1)
- **Corpus usage:** 228 files, 374 instances

## What it does

Offset scrolls the image by a horizontal and vertical pixel amount, wrapping it around the frame edges (a torus roll). It is the simplest positional filter, used to slide or wrap content for scrolling backgrounds and roll transitions.

> **Note.** Not implemented in the TS engine and no checked-in shader; described as the standard Motion "Offset" scroll/wrap. Whether the shipping filter wraps or clamps at the edge is unverified here (the wide negative observed range suggests large scrolls).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Horizontal Offset | float (pixels) | 0 | -4945 .. 1000 | Pixels to shift the image on X. Negative = left, positive = right. Content wraps around. Heavily keyframed for scrolls. *(keyframed in 65 instances)* |
| Vertical Offset | float (pixels) | 0 | -169 .. 1000 | Pixels to shift the image on Y. Negative = up, positive = down. Content wraps around. *(keyframed in 74 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the offset result over the original, 0-1 continuous. *(keyframed in 7 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
