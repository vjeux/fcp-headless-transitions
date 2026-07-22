# Soft Focus

- **PAE class:** `Soft Focus`
- **Plugin UUID:** `BE1A5748-322A-4D25-8107-F3961E0BC21A`
- **Node names in corpus:** Soft Focus (104), Soft Focus copy (5), Soft_Focus (2)
- **Corpus usage:** 73 files, 111 instances

## What it does

Soft Focus blends the sharp image with a blurred copy to give a dreamy, glowing softness (a diffusion/glamour look) without fully losing detail. Amount sets the blur radius and Strength how much of the blurred layer is mixed in. Not implemented and no checked-in shader; described from the standard Motion "Soft Focus".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Soft Focus" (sharp/blurred diffusion blend).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 2 | 2 .. 330 | Blur radius of the soft layer, 2-330. Larger = a broader, dreamier halo. |
| Strength | float | 0.5 | 0 .. 1 | How much of the blurred layer is blended into the sharp image, 0-1. 0 = fully sharp. |
| Horizontal | float (percent) | 100 | 100 .. 100 | Horizontal blur weighting, 0-100%. |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical blur weighting, 0-100%. |
| Mix | float | 1 | 0.05 .. 1 | Wet/dry blend of the soft-focused result over the original, 0-1 continuous. *(keyframed in 4 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_PAESoftFocus — bloom-style diffusion: screen a blurred copy over the sharp original._

Softens while keeping edge definition (dreamy portrait glow):

```
blur   = gaussianBlur(source, Amount/6.10)     // shared HGBlur
out    = screen(source, blur · Intensity)       // 1-(1-a)(1-b): lifts highlights, softens
out    = mix(source, out, Mix)
```

`Amount` = blur radius, **Intensity** = strength of the soft overlay, `Mix` = blend. Distinct from a
plain blur: the screen keeps darks sharp and blooms lights. Head-start: blur + screen composite.
