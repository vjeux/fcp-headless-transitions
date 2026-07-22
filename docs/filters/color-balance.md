# Color Balance

- **PAE class:** `Color Balance`
- **Plugin UUID:** `E9B93275-A56D-4012-BEF6-5DD59A74B344`
- **Node names in corpus:** Color Balance (255), Color Balance Master (2), Color Balance - Green (1), Color Balance - Blue (1), Color Balance Wheel (1), Color Balance RGB (1)
- **Corpus usage:** 196 files, 262 instances

## What it does

Color Balance shifts the color in three tonal ranges independently -- Shadows, Midtones and Highlights -- letting you warm the shadows and cool the highlights (or any combination) for color grading. Boost controls overall intensity and Clip Color Values sets clamping behavior. It is the classic three-way color-grade control.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Color Balance". The exact luminance masks that separate shadows/mids/highlights are unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Shadows | color | - | - | Color shift applied to the darkest tones (nested Red/Green/Blue + Color Space). *(keyframed in 2 instances)* |
| Midtones | color | - | - | Color shift applied to the mid tones (nested RGB + Color Space). *(keyframed in 2 instances)* |
| Highlights | color | - | - | Color shift applied to the brightest tones (nested RGB + Color Space). *(keyframed in 2 instances)* |
| Boost | float | 0 | 0 .. 1.003 | Overall strength of the three-way balance, 0-1. *(keyframed in 1 instance)* |
| Clip Color Values | enum(int) | 0 | 0 .. 3 | How out-of-range values are clamped, 0-3. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the graded result over the original, 0-1 continuous. *(keyframed in 74 instances)* |
| ColorBalance::HDR In Rec. 709 | bool | 0 | 0 .. 0 | Working-space toggle (Rec.709 HDR). Not a creative control. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Algorithm (decoded)

_PAEColorBalance — 3-way (shadows/mids/highlights) RGB balance; no dedicated shader (CPU color op)._

Adjusts color separately in three tonal ranges, weighted by luminance masks:

```
c      = rgb / max(a,1e-6)
lum    = luma(c)
wS     = shadowMask(lum)       // ≈ 1 in darks, → 0 in lights  (smooth luminance weight)
wH     = highlightMask(lum)    // ≈ 1 in lights
wM     = 1 - wS - wH            // midtones
out    = c + wS·ShadowBalance + wM·MidBalance + wH·HighlightBalance   // per-range RGB offsets
out    = clamp(out,0,1) * a
```

Params = **Shadow / Midtone / Highlight** RGB balance vectors (each a small ±color push), gated by
smooth luminance masks. "Preserve Luminosity" (if set) renormalizes luma after. Head-start: build
the 3 luminance weights, add the 3 balance offsets. The exact mask curves come from
`-[PAEColorBalance ...]` (expected smoothstep splits around ~0.33/0.66 luma).
