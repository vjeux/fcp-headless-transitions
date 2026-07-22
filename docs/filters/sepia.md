# Sepia

- **PAE class:** `Sepia`
- **Plugin UUID:** `2CA36FA3-FE92-4E46-B68F-FDB242831254`
- **Node names in corpus:** Sepia (12)
- **Corpus usage:** 8 files, 12 instances

## What it does

Sepia tones the image toward a warm brown monochrome for an antique-photo look. Amount blends between the original color and the full sepia tone.

> **Note.** Not implemented; description is the standard Apple Motion "Sepia" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 1 | 0 .. 1 | Strength of the sepia toning, 0-1 (default 1). Continuous float. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcSepia` embedded shader. Decoded functional form:_

Sepia converts to luma, then maps that single value through a fixed sepia tint, blended by Amount:

```
c     = rgb / max(a,1e-6)
lum   = dot(c, (0.299, 0.587, 0.114))       // Rec.601 luma
// map (lum, alpha*0.2) through a fixed 2-vector → RGB using constants
//   c1 = (1.0, 0.956, -0.272, -1.105)
sepia.r = lum*1.0   + (a*0.2)*0.956
sepia.g = lum*1.0   + (a*0.2)*(-0.272)
sepia.b = lum*1.0   + (a*0.2)*(-1.105)
out.rgb = mix(c, sepia, hg_Params[0].rgb) * a   // Amount blend, re-premultiply
```

The tint coefficients `(0.956, −0.272, −1.105)` are the YIQ I-axis-style warm chroma Apple bakes in
(these are the shader's literal constants). `hg_Params[0]` = **Amount/Intensity** (blend toward
sepia). Head-start: `out = mix(src, sepiaTint(luma), Amount)` with the constants above.
