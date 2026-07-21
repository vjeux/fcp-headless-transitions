# Glow

- **PAE class:** `Glow`
- **Plugin UUID:** `73F69C87-7226-4F7A-81F2-F5E378501423`
- **Node names in corpus:** Glow (102), Glow copy (4), CRT Glow (1)
- **Corpus usage:** 78 files, 107 instances

## What it does

Glow blooms the bright areas: it soft-thresholds the highlights, Gaussian-blurs them by Radius, and screen-composites the blurred glow back over the original. Threshold/Softness set which pixels glow, Opacity the glow gain. Implemented (shares the glow module) and RE'd from the three-pass HgcGlow / HgcGlowCombineFx shaders.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 10 | 7 .. 100 | Blur radius of the glow spread, 7-100. Larger = a softer, wider halo. *(keyframed in 1 instance)* |
| Threshold | float | 0.75 | 0 .. 1 | Brightness threshold, 0-1 (default 0.75). Pixels below this don't glow; the mask ramps up around it. |
| Softness | float | 0.2 | 0.09 .. 1 | Width of the threshold ramp, 0-1 (default 0.2). 0 = a hard glow cutoff, larger = a gradual glow onset. |
| Opacity | float | 1.5 | 0.06 .. 3 | Gain/opacity of the glow overlay, 0-3 (default 1.5). Higher = a brighter bloom. *(keyframed in 1 instance)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the glowing result over the original, 0-1 continuous. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Flip`, `Input Points`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/glow.ts`](../../engine/src/compositor/filters/glow.ts).
