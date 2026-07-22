# Threshold

- **PAE class:** `Threshold`
- **Plugin UUID:** `96AFC322-287E-4014-9EFD-763CD9813E17`
- **Node names in corpus:** Threshold (51), Luma (35), Threshold copy (8), ©idustrialrevolution.com (1), Luma Source (1), Threshold Control (1)
- **Corpus usage:** 81 files, 97 instances

## What it does

Threshold posterizes luma into two colors: pixels with luminance above the Threshold become the Light Color, below become the Dark Color, with a Smoothness ramp softening the transition. It is a high-contrast two-tone / cutout effect. Implemented and RE'd verbatim from the HgcThreshold shader (luma dot, offset by Threshold, smoothstep by Smoothness, mix dark->light).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Threshold | float | 0.5 | 0 .. 1 | Luminance cutoff, 0-1 (default 0.5). Pixels brighter than this go to Light Color, darker to Dark Color. *(keyframed in 40 instances)* |
| Smoothness | float | 0.15 | 0 .. 1 | Width of the soft transition band around the threshold, 0-1. 0 = a hard two-tone edge; larger = a smooth ramp. *(keyframed in 1 instance)* |
| Light Color | color | - | - | Color assigned to pixels above the threshold (nested RGB + Color Space). *(keyframed in 35 instances)* |
| Dark Color | color | - | - | Color assigned to pixels below the threshold (nested RGB + Color Space). *(keyframed in 35 instances)* |
| Correct For Alpha | bool | 0 | 0 .. 1 | Toggle: account for the source alpha (un-premultiply) when computing luma. |
| Mix | float | 1 | 0.35 .. 1 | Wet/dry blend of the two-tone result over the original, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcThreshold` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcThreshold.metal` (Phase-1 done, Phase-2 open).

> 3 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 2 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Algorithm (decoded)

_RE'd from the `HgcThreshold` embedded shader. Decoded functional form:_

Threshold reduces the image to two colors by comparing a luma value against a cutoff, with a soft
transition band:

```
c    = rgb / max(a,1e-6)                         // un-premultiply
lum  = dot(c, (0.3086, 0.6094, 0.082))           // Apple's luma weights (NOT Rec.601/709)
t    = clamp((lum - Threshold) * Softness + 0.5, 0, 1)   // soft step around the cutoff
out.rgb = mix(LowColor, HighColor, t) * a        // two-color map, re-premultiply
out.a   = a
```

Ground-truth constants worth keeping: the luma weights are **(0.3086, 0.6094, 0.082)** (Apple's
"luminance" weighting, distinct from Rec.601 0.299/0.587/0.114 and Rec.709). `hg_Params[0].x` =
**Threshold** cutoff, `hg_Params[1].x` = **Softness/Sharpness** (larger = harder edge), `hg_Params[2]`
= **low/dark color**, `hg_Params[3]` = **high/light color** (default black/white). See also the
existing `THRESHOLD_RE.md` evidence for the premult-edge (`HgcThresholdNoPremult`) variant.
