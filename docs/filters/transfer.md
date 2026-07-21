# Transfer

- **PAE class:** `Transfer`
- **Plugin UUID:** `AE4C894E-F2A9-4CD1-B620-DAC46EB87805`
- **Node names in corpus:** Transfer (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Transfer is a preset color-transfer / cross-process look. It exposes only Mix; the exact grade is a canned transform.

> **Note.** Not implemented; a preset color look with only Mix exposed. (unverified) exact transform.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 0 | Wet/dry blend of the transfer look, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
