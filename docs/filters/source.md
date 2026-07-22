# Source

- **PAE class:** `Source`
- **Plugin UUID:** `C848D8E4-5625-43A3-B465-0E405B51279E`
- **Node names in corpus:** Source (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Source is effectively a passthrough/source-tap node -- it returns the source image largely unmodified and exposes only a host Mix. It is used inside templates as a source reference rather than as a creative image filter.

> **Note.** Not a creative filter; a passthrough/source reference node exposing only Mix. No pixel operation.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 1 .. 1 | Host-level blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This is a **structural/source node** (an image source, not a per-pixel filter). It has no filtering algorithm to decompile; it supplies pixels for downstream filters.
