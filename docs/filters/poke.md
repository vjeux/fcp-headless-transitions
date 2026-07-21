# Poke

- **PAE class:** `Poke`
- **Plugin UUID:** `70471B0A-5D9D-4699-AEEE-CCFC84045B4B`
- **Node names in corpus:** Poke (127), Poke 2 (60), Poke 1 (59), CP2 (13), CP1 (13), Poke copy (7)
- **Corpus usage:** 177 files, 397 instances

## What it does

Poke pushes the image outward from a center point as if a finger poked the surface: pixels within the effect are displaced radially, scaled by Scale, over a region set by Radius, sampling the source at the poked coordinate. The HgcPoke shader is a per-pixel inverse radial remap (normalize position, scale by distance, resample). The shader is checked in.

> **Note.** HgcPoke shader is checked in (evidence/shaders/HgcPoke.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the poke (X,Y) in normalized frame coordinates. Often keyframed to drive the poke around the frame. *(keyframed in 50 instances)* |
| Scale | float | 0.5 | 0 .. 1 | Strength of the radial push, 0-1. 0 = no distortion. *(keyframed in 116 instances)* |
| Radius | float (pixels) | 300 | 0 .. 1000 | Radius of the affected region in pixels (default 300). *(keyframed in 1 instance)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the poked result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcPoke` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcPoke.metal` (Phase-1 done, Phase-2 open).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
