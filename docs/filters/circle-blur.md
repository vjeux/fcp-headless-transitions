# Circle Blur

- **PAE class:** `Circle Blur`
- **Plugin UUID:** `8B8B4934-BD85-43BC-A63B-D7A01C4C0191`
- **Node names in corpus:** Circle Blur (54), OSC (2), Circle Blur copy (1), OSC 15 (1), OSC 14 (1), OSC 13 (1)
- **Corpus usage:** 19 files, 72 instances

## What it does

Circle Blur blurs the image everywhere except inside a sharp circular region centered on Center, i.e. it keeps a circular area in focus and blurs the surroundings (a radial focus/spotlight blur). Amount sets the blur strength and Radius the size of the in-focus circle.

> **Note.** Not implemented; description is the standard Apple Motion "Circle Blur" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the in-focus circle (X,Y) in normalized frame coordinates. |
| Amount | float | 10 | 0 .. 100 | Blur strength applied outside the circle, ~0-100 (default 10). *(keyframed in 1 instance)* |
| Radius | float (pixels) | 400 | 25 .. 2594 | Radius of the sharp in-focus circle in pixels, ~25-2600 (default 400). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAECircleBlur canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

```
r      = distance(p, Center) / Radius
t      = clamp(r, 0, 1)                     // 0 at center → 1 at/after Radius
radius = t * Amount                          // (or (1-t)*Amount for inside-blur)
sigma  = radius / 6.10                        // shared HGBlur ratio
out    = varyingGaussian(source, sigma)
```

`Center`, `Radius` (sharp zone), `Amount` (max blur). Same varying-blur approximation as Gradient
Blur but with a radial `t`. Head-start: radial `t` → per-pixel sigma via blended Gaussian levels.

