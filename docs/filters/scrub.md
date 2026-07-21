# Scrub

- **PAE class:** `Scrub`
- **Plugin UUID:** `3A359CB1-0572-48AD-8623-4D5A681466F5`
- **Node names in corpus:** Scrub (3), Scrub Source (1)
- **Corpus usage:** 3 files, 4 instances

## What it does

Scrub offsets which frame of the source clip is displayed (a time-scrub), optionally blending between frames. Frame offset picks the temporal shift and Frame Blending smooths between offset frames. It is a time filter, not a pixel filter.

> **Note.** Not implemented; description is the standard Apple Motion "Scrub" time filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Frame offset | float | 0 | 0 .. 1 | Temporal offset (how many frames to scrub). Continuous. |
| Frame Blending | bool | 1 | 0 .. 0 | Blend between adjacent frames for smoother scrubbing. |
| Offset from | enum | 0 | 0 .. 1 | Reference point the offset is measured from. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
