# Posterize

- **PAE class:** `Posterize`
- **Plugin UUID:** `2AC86D66-BBD2-467B-B257-6C5E182488F4`
- **Node names in corpus:** Posterize (9)
- **Corpus usage:** 2 files, 9 instances

## What it does

Posterize reduces the number of tonal levels per channel, snapping smooth gradients into flat bands for a poster-print look. Levels sets how many steps per channel (fewer = more banding).

> **Note.** Not implemented; description is the standard Apple Motion "Posterize" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Levels | float (int) | 5 | 255 .. 255 | Number of tonal levels per channel (default 5; corpus sampled the internal 255 cap). Fewer = harsher banding. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
