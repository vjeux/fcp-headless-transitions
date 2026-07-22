# Directional Blur

- **PAE class:** `Directional Blur`
- **Plugin UUID:** `2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52`
- **Node names in corpus:** Directional Blur (217), Directional Blur copy (41), Amount (20), Directional Blur copy 1 (15), Directional Blur 1 (10), Directional Blur copy 2 (8)
- **Corpus usage:** 187 files, 456 instances

## What it does

Directional Blur smears the image along a single axis: FCP rotates the frame so the blur axis is horizontal, applies a 1-D Gaussian, then rotates back. Amount is the blur distance and Angle the direction, giving a motion-streak look. Implemented in TS (the current impl uses a uniform box average rather than FCP's Gaussian falloff -- a documented Phase-2 gap).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 7 | 0 .. 4000 | Blur distance in pixels along the axis. 0 = no blur. The primary streak-length knob. *(keyframed in 254 instances)* |
| Angle | float (radians) | 0 | 0 .. 6.283 | Direction of the blur streak, 0..2pi (0 = horizontal). Rotates the smear axis. *(keyframed in 7 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the streaked result over the sharp original, 0-1 continuous. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `OSC Center`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/directional-blur.ts`](../../engine/src/compositor/filters/directional-blur.ts).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEDirectionalBlur canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

`gaussian-blur.ts`; same `sigma = radius/6.10` kernel, independently confirmed on this filter)._

A **1-D Gaussian along a chosen angle**: it blurs only in the direction of `Angle`, leaving the
perpendicular axis sharp — motion-blur look.

```
dir    = (cos(Angle), sin(Angle))
sigma  = Amount / 6.10                       // SAME decoded ratio as Gaussian Blur (measured)
// separable 1-D Gaussian convolution along `dir` only:
out    = Σ_k  gaussian(k, sigma) · sample(p + k·dir)
out    = mix(src, out, Mix)
```

`Amount` = blur length (px), `Angle` = blur direction (radians), `Mix` = blend. Because it reuses
`HGBlur`, the kernel is the normalized Gaussian PDF `(1/σ)·exp(−½(x/σ)²)·0.39894` — no separate
constant to fit. Head-start: project onto `dir`, run the shared 1-D Gaussian; shipped in
`directional-blur.ts`.

