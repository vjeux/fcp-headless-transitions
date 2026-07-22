# Glint

- **PAE class:** `Glint`
- **Plugin UUID:** `D24138A3-1569-4771-8F4F-70F88ABB53B4`
- **Node names in corpus:** Glint (209), Glow: Glint (20), Glint 1 (5), Glint 2 (2), Glint 1 copy (1), g (1)
- **Corpus usage:** 165 files, 241 instances

## What it does

Glint adds anamorphic star/streak highlights to bright areas: it thresholds the highlights, blooms them, and casts radial streaks (like the star filter on a camera lens) with controllable number, size, softness and color fringing. It is the sparkle/lens-flare-star effect used on speculars and light sources. Not implemented and no checked-in shader.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Glint" filter. Exact bloom/streak math unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Exposure | float | 2 | -4.017 .. 10 | Highlight threshold / exposure that controls which pixels glint (higher = only the brightest streak). *(keyframed in 1 instance)* |
| Intensity | float | 2.5 | 0 .. 3.2 | Overall strength of the glint overlay, 0-3.2. Continuous float. |
| Glint Size | float | 4 | 0 .. 25 | Length of the star streaks, 0-25. |
| Streaks | enum(int) | 1 | 1 .. 10 | Number of radial streak arms, 1-10. |
| Glint Softness | float | 0 | 0 .. 1 | Softness/feather of the streaks, 0-1. |
| Glint Angle | float (radians) | 0 | -0.5236 .. 1.798 | Rotation of the streak pattern in radians. |
| Glow Amount | float | 3 | 0 .. 40 | Strength of the soft bloom halo added under the streaks, 0-40. |
| Tint | float | 0 | 0 .. 1 | How much the Tint Color is applied to the glint, 0-1. |
| Tint Color | color | - | - | Color of the glint tint (nested Red/Green/Blue + Color Space). |
| Color Fringing | float | 6 | 0 .. 27.9 | Chromatic dispersion along the streaks, 0-28 (rainbow edges). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the glint over the original, 0-1 continuous. *(keyframed in 5 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 6 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 2 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEGlint canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

Glint extracts bright pixels and smears them into **star/streak rays** (anamorphic lens flare look):

```
hi     = max(luma(src) - Threshold, 0)              // highlight mask (Threshold param)
streak = 0
for i in 0..(Streaks-1):                            // N rays at evenly-spaced angles + Rotation
    dir = angle(i·2π/Streaks + Rotation)
    streak += directionalBlur(hi·src, dir, Length)  // 1-D HGBlur along each ray (sigma=Length/6.10)
out    = src + streak · Intensity · GlintColor      // add the rays back, tinted
```

Params: **Threshold** (what glints), **Streaks/Points** (number of rays), **Length** (ray reach),
**Rotation** (ray angle), **Intensity**, **Color**. Each ray is the already-decoded directional
`HGBlur`. Head-start: threshold → N directional blurs of the highlights → additive tinted composite.

