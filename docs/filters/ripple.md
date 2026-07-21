# Ripple

- **PAE class:** `Ripple`
- **Plugin UUID:** `F6D546C6-5F27-4E9D-9814-960565D6F403`
- **Node names in corpus:** Ripple (5)
- **Corpus usage:** 5 files, 5 instances

## What it does

Ripple sends concentric circular waves rippling out from Center, displacing pixels radially like a stone dropped in water. Amplitude sets the wave height; animate it (or Center) for an expanding ripple.

> **Note.** Not implemented; description is the standard Apple Motion "Ripple" distortion filter. Amplitude was sampled as int in a tiny corpus (5 files) — treat as continuous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float | 50 | 0 .. 4 | Height/strength of the ripple waves (default ~50; corpus samples 0-4). Continuous float. *(keyframed in 1 instance)* |
| Center | point2D | - | - | Center the ripples emanate from (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
