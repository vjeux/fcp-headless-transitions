# Light Rays

- **PAE class:** `Light Rays`
- **Plugin UUID:** `B074E0A5-BE6F-43B4-898A-AB0A44189CD9`
- **Node names in corpus:** Light Rays (112)
- **Corpus usage:** 93 files, 112 instances

## What it does

Light Rays casts volumetric god-rays from a Center point: bright areas are streaked radially outward (a zoom-blur of the highlights) and glowed, simulating light shafts bursting from a source. Amount sets ray length, Expansion the spread, Glow the bloom. Not implemented and no checked-in shader; described from the standard Motion "Light Rays".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Light Rays" filter. Exact radial-streak math unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 50 | 9 .. 200 | Length/strength of the rays, 9-200. Often keyframed to shoot the rays out. *(keyframed in 66 instances)* |
| Expansion | float | 0.4 | 0 .. 2 | How far the rays spread from the center, 0-2. |
| Glow | float | 1.5 | 0.66 .. 8 | Strength of the bloom/glow on the rays, 0.66-8. *(keyframed in 65 instances)* |
| Center | point2D | - | - | Origin point of the rays (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the rays over the original, 0-1 continuous. *(keyframed in 75 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Clip to White`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
