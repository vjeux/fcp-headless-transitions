# PAEYIQAdjust

- **PAE class:** `PAEYIQAdjust`
- **Plugin UUID:** `CECECA09-7686-4EBA-A9AA-585A3F5B322E`
- **Node names in corpus:** YIQ Adjust (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

YIQ Adjust (PAEYIQAdjust) is the NTSC-YIQ analogue of YUV Adjust: it converts to the YIQ color space and lets you tweak luma (Y) and the I/Q chroma axes independently. This corpus record is at defaults so only Mix is sampled.

> **Note.** Not implemented; description is the standard Apple Motion "YIQ Adjust" filter. The Y/I/Q channel sliders were left at defaults (not sampled) in the single corpus instance; only Mix appears.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
