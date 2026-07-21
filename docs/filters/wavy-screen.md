# Wavy Screen

- **PAE class:** `Wavy Screen`
- **Plugin UUID:** `3C4B5F14-3D6B-4C35-8314-24077F0CB276`
- **Node names in corpus:** Wavy Screen (4), Wavy Screen copy (2)
- **Corpus usage:** 4 files, 6 instances

## What it does

Wavy Screen combines a wavy sinusoidal displacement with a halftone/screen pattern, giving a rippling patterned-screen look. Amplitude/Wavelength shape the wave, Scale the screen frequency, and Contrast the pattern hardness.

> **Note.** Not implemented; description is the standard Apple Motion "Wavy Screen" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float (pixels) | 40 | 0 .. 40 | Wave displacement amplitude, 0-40 (default 40). |
| Wavelength | float (pixels) | 125 | 0 .. 394 | Distance between wave crests, ~0-394 (default 125). |
| Scale | enum(int) | 10 | 8 .. 10 | Screen/pattern frequency, 8-10 (default 10). |
| Contrast | float | 0.5 | 0.5 .. 1 | Hardness of the screen pattern, 0.5-1 (default 0.5). |
| Mix | float | 1 | 0.4195 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
