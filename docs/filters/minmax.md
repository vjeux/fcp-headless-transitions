# MinMax

- **PAE class:** `MinMax`
- **Plugin UUID:** `D2342006-51C4-4439-8E89-E970F135E21C`
- **Node names in corpus:** MinMax (272), MinMax 2 (2), MinMax 1 (1), MinMax copy (1)
- **Corpus usage:** 117 files, 276 instances

## What it does

MinMax is a morphological erode/dilate: in Minimum mode it shrinks (erodes) light areas by replacing each pixel with the minimum in a Radius window, in Maximum mode it grows (dilates) them with the maximum. It runs a separable X-then-Y pass over the full 2R+1 window on premultiplied RGBA. Implemented and verified against headless FCP.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 0 | 0 .. 100 | Window half-width in pixels (0-250 nominal). 0 = identity (passthrough). Larger = more aggressive erode/dilate. *(keyframed in 2 instances)* |
| Mode | bool/enum | 0 | 0 .. 1 | 0 = Minimum (erode: shrink light areas), 1 = Maximum (dilate: grow light areas). |
| Mix | float | 1 | 0.9343 .. 1 | Wet/dry blend of the morphed result over the original, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/minmax.ts`](../../engine/src/compositor/filters/minmax.ts).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEMinMax canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

A separable min/max window filter — the classic morphology that erodes or dilates light/dark areas:

```
Mode (id 1): 0 = Minimum (erode), 1 = Maximum (dilate)
Radius (id 2): window half-width in pixels
// separable, per channel:
horiz[p] = min|max over k∈[-R,R] of sample(p.x+k, p.y)
out[p]   = min|max over k∈[-R,R] of horiz(p.x, p.y+k)
```

`Mode` picks min (shrinks bright regions / grows dark) vs max (opposite); `Radius` = structuring
element half-width. Separable two-pass like a box filter but with min/max instead of sum. Head-start
is exactly the two passes above; shipped in `minmax.ts`.

