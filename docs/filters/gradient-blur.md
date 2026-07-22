# Gradient Blur

- **PAE class:** `Gradient Blur`
- **Plugin UUID:** `7C7405BB-1B00-4811-A507-CB9F619CA522`
- **Node names in corpus:** Gradient Blur (217), osc 7 (6), osc 6 (6), osc 5 (6), osc 4 (6), osc 3 (6)
- **Corpus usage:** 235 files, 322 instances

## What it does

Gradient Blur varies blur strength across the frame along a line defined by two points: the image is sharp at one end of the Point 1 -> Point 2 gradient and progressively blurred toward the other, with Amount setting the maximum blur radius. It is the tool for tilt-shift / depth-of-field looks where focus falls off across the frame. FCP's HgcGradientBlur2 shader is checked in.

> **Note.** HgcGradientBlur2 shader is checked in (evidence/shaders/HgcGradientBlur2.metal) but the filter is not yet implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Point 1 | point2D | - | - | Start of the blur gradient (X,Y, normalized frame coords). Defines the sharp (or fully-blurred) end of the falloff line. *(keyframed in 2 instances)* |
| Point 2 | point2D | - | - | End of the blur gradient (X,Y). Blur ramps between Point 1 and Point 2. *(keyframed in 3 instances)* |
| Amount | float (pixels) | 10 | 0 .. 100 | Maximum blur radius reached at the blurred end of the gradient, 0-100. 0 = no blur anywhere. *(keyframed in 17 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the gradient-blurred result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** — 📄 shader available: `evidence/shaders/HgcGradientBlur2.metal` (verbatim FCP source; TS port pending).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm (decoded)

_PAEGradientBlur (shader `HgcGradientBlur2` checked in) — spatially-varying `HGBlur`._

The blur **radius varies across the frame along a gradient** defined by two points: sharp at
`Point 1`, maximally blurred (`Amount`) toward `Point 2`.

```
t       = clamp( dot(p - Point1, Point2-Point1) / |Point2-Point1|² , 0, 1)   // position along gradient
radius  = t * Amount                                   // local blur radius
sigma   = radius / 6.10                                // shared HGBlur ratio
out     = gaussianBlur(source, sigma_at_p)             // per-pixel-varying blur (tiled/mip approx)
```

`Amount` = max radius, `Point 1/2` = the gradient line. FCP approximates the varying blur by
blending a few fixed-radius `HGBlur` levels by `t` (compound-blur style). Head-start: precompute a
handful of Gaussian levels, lerp by the gradient `t`. See `HgcGradientBlur2.metal`.
