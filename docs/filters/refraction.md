# Refraction

- **PAE class:** `Refraction`
- **Plugin UUID:** `F6CC79AD-7C35-4AB0-BF10-527994BCD143`
- **Node names in corpus:** Refraction (18), Refraction copy (1), Distortion (1)
- **Corpus usage:** 19 files, 20 instances

## What it does

Refraction distorts the image as if seen through a bumpy refractive surface, displacing each pixel by the gradient of a height map (by default derived from the image itself). Refraction sets the displacement strength and Softness blurs the height map for smoother, glassier bending.

> **Note.** Not implemented; description is the standard Apple Motion "Refraction" filter. The Height Map / Map Channel params are internal image-input wiring.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Softness | float | 0.25 | 0 .. 1 | Blur applied to the height field before refracting, 0-1 (default 0.25). Continuous float. |
| Refraction | float | 100 | 0 .. 200 | Displacement strength; how strongly pixels bend, ~0-200 (default 100). *(keyframed in 2 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |
| Height Map | float | 0 | 0 .. 3331531719 | *(unverified)* |
| Map Channel | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
