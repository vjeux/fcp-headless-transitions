# Noir

- **PAE class:** `Noir`
- **Plugin UUID:** `CFA2D547-3560-437A-A7E3-15228E78DD29`
- **Node names in corpus:** Noir (9)
- **Corpus usage:** 9 files, 9 instances

## What it does

Noir is a preset film-noir color grade that converts the image to a high-contrast, moody black-and-white (or near-monochrome) look. It is a one-knob stylize preset with only a Mix control exposed.

> **Note.** Not implemented; description is the standard Apple Motion "Noir" preset look. As a canned grade it exposes no creative parameters beyond Mix. (unverified) exact tone curve.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the noir grade over the original, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
