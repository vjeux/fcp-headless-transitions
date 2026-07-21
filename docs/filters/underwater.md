# Underwater

- **PAE class:** `Underwater`
- **Plugin UUID:** `9FA1F483-1E09-4DD0-870F-C32777D7F1B0`
- **Node names in corpus:** Refraction (121), Underwater (55), Distortion (4), Underwater 1 (2), Animation (2), Underwater copy (1)
- **Corpus usage:** 111 files, 188 instances

## What it does

Underwater applies a sinusoidal refraction wobble: the source is resampled through a smoothly space-varying displacement field that is the sum of ten sine waves of decreasing frequency and time-drifting phase -- exactly the look of light refracting through a rippling water surface. Size sets wave scale, Speed the animation rate, Refraction the displacement gain. Implemented and RE'd from the HgcUnderwaterFreqSynth + RefractV2 shaders.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float | 2 | 0.02 .. 72 | Spatial scale of the wave field (default 2). Larger = broader, gentler ripples; smaller = tighter wobble. |
| Speed | float | 0.5 | 0 .. 100 | Animation rate of the wave phases (default 0.5). Only the phase advances over time; 0 = a static frozen ripple. |
| Refraction | float | 100 | 0 .. 540 | Displacement gain -- how far pixels are pushed by the waves (default 100). 0 = passthrough (identity). *(keyframed in 7 instances)* |
| Repeat Edges | bool | 0 | 0 .. 1 | When on, samples outside the frame wrap/repeat rather than clamp. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the refracted result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 6 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/underwater.ts`](../../engine/src/compositor/filters/underwater.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
