# Gaussian Blur

- **PAE class:** `Gaussian Blur`
- **Plugin UUID:** `E472D646-2C92-464E-98A1-91CF8F162AD8`
- **Node names in corpus:** Gaussian Blur (1416), Blur (43), Gaussian Blur Source (37), Gaussian Blur copy (31), Focus Change (19), Gaussian Blur 1 (17)
- **Corpus usage:** 788 files, 1594 instances

## What it does

A separable two-pass Gaussian blur. Each output pixel is a Gaussian-weighted average of its neighbors, softening detail with a smooth symmetric falloff. FCP's real implementation decimates the image, convolves a small normalized-Gaussian kernel, then upsamples; the effective screen sigma is approximately radius/6.1. The Horizontal/Vertical percentages let the blur be anisotropic (e.g. a purely vertical smear).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 4 | 0 .. 2326 | Blur radius in pixels. 0 = no blur; larger values spread each pixel over a wider Gaussian. The dominant creative knob; often keyframed for focus pulls. *(keyframed in 133 instances)* |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal blur weighting, 0-100%. 100 = full blur on the X axis, 0 = none. Combined with Vertical to make the blur directional. *(keyframed in 4 instances)* |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical blur weighting, 0-100%. 100 = full blur on the Y axis, 0 = none. *(keyframed in 4 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the blurred result over the sharp original, 0-1 continuous. *(keyframed in 120 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Prescale Input`, `Crop`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/gaussian-blur.ts`](../../engine/src/compositor/filters/gaussian-blur.ts).
