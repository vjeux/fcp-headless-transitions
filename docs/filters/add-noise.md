# Add Noise

- **PAE class:** `Add Noise`
- **Plugin UUID:** `C423A28F-C016-4133-B120-22FF2E9A7862`
- **Node names in corpus:** Add Noise (122), Add Noise copy (53), Noise (6), Add Noise Source (4), Grain (2), Add Noise 1 (1)
- **Corpus usage:** 123 files, 188 instances

## What it does

Add Noise overlays procedural random noise onto the image, blended by Amount and a chosen Blend Mode, optionally monochrome and auto-animated over time. It is the grain/static generator used for film-grain, TV-static and texture effects. FCP's HgcAddNoise shader is a simple per-pixel scale+abs blend of a noise field; the shader is checked in.

> **Note.** HgcAddNoise shader is checked in (evidence/shaders/HgcAddNoise.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 0.33 | 0 .. 4 | Strength of the noise added, 0-4. 0 = no noise; the primary knob. *(keyframed in 1 instance)* |
| Type | enum(int) | 1 | 0 .. 4 | Noise distribution/type, 0-4 (e.g. uniform vs gaussian variants). |
| Blend Mode | enum(int) | 0 | 0 .. 17 | How the noise composites over the image, 0-17 (add, screen, overlay, etc.). |
| Monochrome | bool | 0 | 0 .. 1 | Toggle: single-channel gray noise vs independent per-channel color noise. |
| Autoanimate | bool | 1 | 0 .. 1 | Toggle: re-roll the noise field every frame (animated static) vs a static pattern. |
| Random Seed | float (int seed) | 25 | 0 .. 500 | Seed for the noise RNG. |
| Mix | float | 1 | 0.0043 .. 1 | Wet/dry blend of the noisy result over the original, 0-1 continuous. *(keyframed in 35 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcAddNoise` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcAddNoise.metal` (Phase-1 done, Phase-2 open).
