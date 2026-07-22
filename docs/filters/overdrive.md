# Overdrive

- **PAE class:** `Overdrive`
- **Plugin UUID:** `37C59CC3-8FD8-4460-A17E-71B32254FAD7`
- **Node names in corpus:** Overdrive (37), Glow (9)
- **Corpus usage:** 37 files, 46 instances

## What it does

Overdrive is a stylized bloom/edge-glow that extracts the brightest parts of the image, blurs and colorizes them into an inner and outer glow, and adds them back over the source for a hot, over-exposed neon look. Size controls how far the glow spreads, Intensity how hot it burns, and the two glow colors tint the inner core and outer halo. Rotation slightly rotates the glow kernel for a streaky flare.

> **Note.** Not implemented in the TS engine; description is the standard Apple Motion "Overdrive" glow filter. Exact glow kernel is unverified.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Intensity | float | 10 | 0 .. 100 | Strength/brightness of the glow that is added back, ~0-100 (default 10). |
| Size | float (pixels) | 30 | 1 .. 32 | Spread/blur radius of the glow, ~1-32 (default 30). |
| Rotation | float (radians) | 0.006854 | 0 .. 6.283 | Rotates the glow kernel, giving a streaky/directional flare. 0-2pi. |
| Inner Glow | color | - | - | Color of the hot inner core of the glow. |
| Outer Glow | color | - | - | Color of the softer outer halo. |
| Mix | float | 1 | 0 .. 0.7 | Wet/dry blend of the glow result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 12 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_PAEOverdrive — saturated contrast/clip look (per-pixel color op)._

```
c    = rgb / max(a,1e-6)
c    = (c - 0.5) * Drive + 0.5        // hard contrast about mid (Drive = Amount)
c    = clamp(c, 0, 1)                  // clip → the "overdriven" crushed look
c    = mix(luma(c), c, Saturation)     // push saturation
out  = mix(src, c·a, Mix)
```

Params: **Drive/Amount** (contrast gain), **Saturation**, **Mix**. A crushed high-contrast,
high-saturation stylize. Head-start: pivot-contrast + clip + saturate.
