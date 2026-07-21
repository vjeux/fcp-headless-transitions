# Gloom

- **PAE class:** `Gloom`
- **Plugin UUID:** `50387134-338C-42A2-8078-7DF9D7DB36EE`
- **Node names in corpus:** Gloom (8), Gloom copy (3)
- **Corpus usage:** 9 files, 11 instances

## What it does

Gloom is an inverse-bloom / dark-glow: it spreads the dark regions of the image outward (blurring shadows over highlights) for a murky, gloomy diffusion, the tonal opposite of Bloom. Radius sets the spread and Amount the strength.

> **Note.** Not implemented; description is the standard Apple Motion "Gloom" dark-diffusion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 10 | 13 .. 100 | Spread radius of the dark diffusion, ~13-100 (default 10). |
| Amount | float | 1 | 1 .. 1.16 | Strength of the gloom, ~1-1.16 (default 1). |
| Mix | float | 1 | 0.7101 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Prescale Input`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
