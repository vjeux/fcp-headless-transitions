# Variable Blur

- **PAE class:** `Variable Blur`
- **Plugin UUID:** `05DB4F81-7C57-4F33-A5B3-763C913ACAA3`
- **Node names in corpus:** Variable Blur (78), Variable Blur copy (1), Variable Blur 2 (1), Variable Blur 3 (1)
- **Corpus usage:** 78 files, 81 instances

## What it does

Variable Blur blurs the frame by an amount that increases with distance from a Center, between an Inner Radius (sharp) and an Outer Radius (fully blurred) -- a radial tilt-shift / focus-ring. Amount is the maximum blur. Not implemented and no checked-in shader; described from the standard Motion "Variable Blur".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Variable Blur" (radial focus falloff).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 10 | 0 .. 100 | Maximum blur radius reached beyond the outer radius, 0-100. 0 = no blur. *(keyframed in 11 instances)* |
| Inner Radius | float (pixels) | 100 | 0 .. 665 | Radius of the fully-sharp central region, 0-665. Inside this, no blur. |
| Outer Radius | float (pixels) | 400 | 0 .. 1000 | Radius at which blur reaches maximum, 0-1000. Blur ramps between inner and outer. |
| Center | point2D | - | - | Center of the focus ring (X,Y) in normalized frame coordinates. *(keyframed in 5 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the blurred result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEVariableBlur canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

A blur whose radius is driven by a control (map or gradient); functionally identical engine to
Compound Blur:

```
radius = control(p) * Amount        // control = map luma or gradient position
sigma  = radius / 6.10
out    = varyingGaussian(source, sigma)
```

Head-start: reuse the Compound/Gradient varying-blur (blend fixed Gaussian levels by the control).
`Amount` = max radius; the control source is the distinguishing param.

