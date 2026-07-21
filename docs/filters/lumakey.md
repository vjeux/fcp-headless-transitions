# Lumakey

- **PAE class:** `Lumakey`
- **Plugin UUID:** `A0CE702C-9875-4C9F-9A9A-F0968C4F4A90`
- **Node names in corpus:** Luma Key (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Lumakey (node name "Luma Key") keys out pixels based on their luminance, making dark (or bright) areas transparent. Key Mode selects whether low or high luma is keyed. This corpus record exposes only Key Mode; it is the simple luminance keyer variant.

> **Note.** Not implemented; description is the standard Apple Motion luma-key behavior. This single-instance record exposes only Key Mode.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Key Mode | enum | 0 | 1 .. 1 | Whether dark or bright luminance is keyed to transparent. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
