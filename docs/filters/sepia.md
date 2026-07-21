# Sepia

- **PAE class:** `Sepia`
- **Plugin UUID:** `2CA36FA3-FE92-4E46-B68F-FDB242831254`
- **Node names in corpus:** Sepia (12)
- **Corpus usage:** 8 files, 12 instances

## What it does

Sepia tones the image toward a warm brown monochrome for an antique-photo look. Amount blends between the original color and the full sepia tone.

> **Note.** Not implemented; description is the standard Apple Motion "Sepia" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 1 | 0 .. 1 | Strength of the sepia toning, 0-1 (default 1). Continuous float. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
