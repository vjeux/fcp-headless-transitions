# Angle OSC

- **PAE class:** `Angle OSC`
- **Plugin UUID:** `6209E095-64E4-11D9-B08D-000A95AF90F2`
- **Node names in corpus:** Angle OSC (2), Kaleidoscope (1)
- **Corpus usage:** 3 files, 3 instances

## What it does

Angle OSC drives a kaleidoscope: it takes an angular wedge of the image (Segment Angle) around Center and mirrors it repeatedly around the circle, producing a symmetric kaleidoscopic pattern. Offset Angle rotates the source wedge and Partial Segments allows incomplete final wedges.

> **Note.** Not implemented; description is the standard Apple Motion kaleidoscope ("Angle OSC") behavior.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the kaleidoscope (X,Y) in normalized frame coordinates. |
| Segment Angle | float (radians) | pi/8 (0.3927) | 0.3927 .. 2.531 | Angular width of the mirrored wedge, radians (~0.39-2.53, default pi/8). |
| Offset Angle | float (radians) | 0.01371 | 0 .. 0.01745 | Rotation of the source wedge, radians (default ~0.014). |
| Partial Segments | bool | 0 | 0 .. 0 | Allow an incomplete final wedge rather than only whole segments. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
