# Line Screen

- **PAE class:** `Line Screen`
- **Plugin UUID:** `57174A04-8434-4179-A8EB-66C88B63F308`
- **Node names in corpus:** Line Screen (48)
- **Corpus usage:** 5 files, 48 instances

## What it does

Line Screen renders the image as a printed line-screen halftone: tone is represented by the thickness of parallel lines. The verbatim HgcLineScreen shader takes the pixel luma (dot with hg_Params[5]), compares it against a repeating triangular line profile (fract of a dotted coordinate), and thresholds with a contrast slope. Angle rotates the lines, Scale sets their frequency, and Skew/Stretch shear them.

> **Note.** Shader-only. The verbatim HgcLineScreen Metal shader is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the line pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0.4992 | 0.4992 .. 1.571 | Rotation of the lines, radians (default ~0.5). |
| Scale | float | 10 | 10 .. 22 | Line frequency / spacing, ~10-22 (default 10). |
| Skew | float | 0 | 0 .. 0.21 | Shears the line pattern, 0-0.21 (default 0). |
| Stretch | float | 0 | 0 .. 0.34 | Stretches the line cells, 0-0.34 (default 0). |
| Contrast | float | 0.5 | 0 .. 0.5 | Threshold slope / hardness of the lines (shader hg_Params[2]), 0-0.5 (default 0.5). |
| Mix | float | 1 | 0.5 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcLineScreen` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcLineScreen.metal` (Phase-1 done, Phase-2 open).
