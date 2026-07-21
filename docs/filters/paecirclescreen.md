# PAECircleScreen

- **PAE class:** `PAECircleScreen`
- **Plugin UUID:** `46396CAD-950B-4EA3-92F3-0CC54DF53AC9`
- **Node names in corpus:** Circle Screen copy (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Circle Screen (PAECircleScreen) renders the image as a halftone screen made of concentric circles/rings around Center. Scale sets the ring frequency and Contrast the hardness. It is the circular sibling of Line Screen / Halftone.

> **Note.** Not implemented; description is the standard Apple Motion "Circle Screen" halftone filter. Single-instance record.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the ring screen (X,Y) in normalized frame coordinates. |
| Scale | enum(int) | 10 | 5 .. 5 | Ring frequency / spacing (default 10; sampled 5). |
| Contrast | float | 0.5 | 0 .. 0 | Hardness of the ring pattern, default 0.5. Continuous float, NOT a boolean. |
| Mix | float | 1 | 0.0735 .. 0.0735 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
