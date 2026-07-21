# Aura

- **PAE class:** `Aura`
- **Plugin UUID:** `2E01612E-7A80-42B5-8767-9F3E58679DDD`
- **Node names in corpus:** Aura (21)
- **Corpus usage:** 16 files, 21 instances

## What it does

Aura wraps a soft glowing halo around the subject, similar to Outer Glow but with separate inner and outer radii defining a ring of brightness. Brightness sets its intensity; the two radii shape where the aura starts and ends.

> **Note.** Not implemented; description is the standard Apple Motion "Aura" glow filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Inner Radius | float (pixels) | 2 | 0 .. 22 | Inner edge of the aura ring, ~0-22 (default 2). |
| Outer Radius | float (pixels) | 10 | 0 .. 22 | Outer edge of the aura ring, ~0-22 (default 10). |
| Brightness | float | 70 | 40 .. 100 | Intensity of the aura, ~40-100 (default 70). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Clip to White`, `Crop`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
