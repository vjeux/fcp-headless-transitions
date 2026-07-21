# Gamma

- **PAE class:** `Gamma`
- **Plugin UUID:** `9F2DAEB8-1875-4E0E-B62F-DF1E28C1999B`
- **Node names in corpus:** Gamma (24), Gamma copy (1)
- **Corpus usage:** 17 files, 25 instances

## What it does

Gamma applies a power-law tone curve to the image: out = in ^ (1/Gamma) per channel, brightening midtones for Gamma>1 and darkening them for Gamma<1 while leaving black and white fixed. A single slider.

> **Note.** Not implemented; description is the standard Apple Motion "Gamma" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Gamma | float | 1 | 0.1445 .. 10 | Gamma exponent; >1 brightens midtones, <1 darkens, ~0.14-10 (default 1 = identity). *(keyframed in 5 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
