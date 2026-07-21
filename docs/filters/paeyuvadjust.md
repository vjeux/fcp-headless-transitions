# PAEYUVAdjust

- **PAE class:** `PAEYUVAdjust`
- **Plugin UUID:** `409AA5EF-5327-48C6-A650-DE16A7923DD8`
- **Node names in corpus:** YUV Adjust (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

YUV Adjust (PAEYUVAdjust) converts the image to YUV and lets you tweak the luma (Y) and the two chroma (U, V) channels independently, then converts back -- a color/brightness adjustment in the YUV space used by video. This corpus record is at defaults so only Mix is sampled.

> **Note.** Not implemented; description is the standard Apple Motion "YUV Adjust" filter. The Y/U/V channel sliders were left at defaults (not sampled) in the single corpus instance; only Mix appears.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
