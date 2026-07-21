# Bump Map

- **PAE class:** `Bump Map`
- **Plugin UUID:** `1E6F3535-CAD6-4F4A-8EFE-24C402488000`
- **Node names in corpus:** Bump Map (171), Distortion (110), Glitch 2 (67), Glitch 1 (66), Bump Map 1 (49), Distortion 2 (40)
- **Corpus usage:** 257 files, 780 instances

## What it does

Bump Map treats a second image (the Map Image) as a height field and refracts the source through it: brightness gradients in the map become surface slopes that displace the sampled source texcoord, giving the source the illusion of being embossed onto the map's relief. Direction and the Horizontal/Vertical scales control the lighting angle and displacement strength. Verified against the HgcBumpMap shader, which reads the map, builds a per-pixel offset, and resamples the source.

> **Note.** HgcBumpMap shader is checked in (evidence/shaders/HgcBumpMap.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Map Image | source ref | 0 | 10009 .. 3335299512 | Reference to the layer used as the height/bump map (stored as a large source-ID integer, not a numeric value). The relief of this image drives the displacement. |
| Direction | float (radians) | 0.1745 | -6.281 .. 6.283 | Lighting / displacement direction in radians (default ~0.1745 = 10 deg). Rotates which way the bump slopes push the source samples. |
| Amount | float | 0.1 | -4 .. 10 | Displacement strength / bump depth. 0 = flat (no displacement); negative inverts the relief; positive exaggerates it (range -4..10 observed). Heavily keyframed. *(keyframed in 316 instances)* |
| Horizontal Scale | float | 0.1 | -10 .. 10 | Horizontal component of the displacement gain, -10..10. Scales how far map slopes push samples on X. *(keyframed in 172 instances)* |
| Vertical Scale | float | 0.1 | -10 .. 10 | Vertical component of the displacement gain, -10..10. Scales the push on Y. *(keyframed in 131 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the bump-mapped result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 22 instances)* |
| Repeat Edges | bool | 0 | 0 .. 1 | When on, sample coordinates that fall outside the frame wrap/repeat rather than clamp. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcBumpMap` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcBumpMap.metal` (Phase-1 done, Phase-2 open).

> 5 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
