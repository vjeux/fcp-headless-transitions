# Process

- **PAE class:** `Process`
- **Plugin UUID:** `FA2255DA-D88C-489C-A4B4-D33AAB97A8E8`
- **Node names in corpus:** Process (1)
- **Corpus usage:** 1 files, 1 instances

## What it does

Process is a preset cross-process color look (emulating photographic cross-processing). It exposes only Mix.

> **Note.** Not implemented; a preset cross-process look with only Mix exposed. (unverified) exact transform.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 0 | Wet/dry blend of the process look, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
