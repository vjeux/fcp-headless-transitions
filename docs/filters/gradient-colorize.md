# Gradient Colorize

- **PAE class:** `Gradient Colorize`
- **Plugin UUID:** `FB917FD2-68DF-4BE7-A313-82124F6DE776`
- **Node names in corpus:** Gradient Colorize (31), Gradient Colorize copy (4), Gradient Colorize left (1), Gradient Colorize right (1), flagWave_h (1), flagWave (1)
- **Corpus usage:** 26 files, 41 instances

## What it does

Gradient Colorize is a gradient-map: it computes each pixel's luminance and looks that value up in a user-defined color gradient, replacing the pixel color while keeping its brightness structure. Offset scrolls the lookup position along the gradient and Repeats tiles the gradient multiple times across the tonal range (with a Repeat Method for how the ends wrap). The verbatim HgcGradientColorize shader confirms: dot(rgb, luma-weights) -> scale/offset -> fract/repeat -> sample the gradient texture -> optional saturation mix.

> **Note.** Shader-only. The verbatim HgcGradientColorize Metal shader is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Gradient | group | - | - | The color gradient the image's luminance is mapped through (color stops + positions). *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the colorized result over the original, 0-1 continuous. NOT a boolean (shader mixes via hg_Params[7]). *(keyframed in 3 instances)* |
| Offset | float | 0 | 0 .. 28.27 | Scrolls the luminance-to-gradient lookup position; animate for a sweeping color shift. ~0-28. |
| Repeats | float | 1 | 1 .. 20 | How many times the gradient tiles across the tonal range, ~1-20 (default 1). |
| Repeat Method | enum | 1 | 0 .. 1 | How the gradient ends wrap when Repeats>1 (repeat vs mirror). |
| Map Channel | enum | 0 | 0 .. 0 | Which channel drives the lookup (luminance by default). |
| Saturation | float | 1 | 1 .. 1 | Blend between the mapped color and its desaturated luma, 0-1 (shader hg_Params[4]). NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcGradientColorize` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcGradientColorize.metal` (Phase-1 done, Phase-2 open).
