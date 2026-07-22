# Colorize

- **PAE class:** `Colorize`
- **Plugin UUID:** `D995BBCF-F766-4950-89D5-7A4828CD9B6F`
- **Node names in corpus:** Colorize (2150), Global Color (327), Global Colorize (90), Colorize copy (53), U Curve Arrow (3), Bow Arrow (3)
- **Corpus usage:** 921 files, 2667 instances

## What it does

Colorize is a two-point duotone / gradient-map. It remaps the image's tonal range so the darkest pixels take one target color ("Remap Black To") and the brightest take another ("Remap White To"), interpolating every intermediate luminance between them. It is the classic way to tint footage into a single-hue look (sepia, cyan-orange, monochrome washes) while preserving contrast. In this engine it shares the channel-mixer module because both are per-pixel linear color remaps.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Remap Black To | color | - | - | The color assigned to the darkest (black-point) pixels. Its `Color Space` child selects how the RGB triple is interpreted; Red/Green/Blue are 0-1 floats. *(keyframed in 4 instances)* |
| Remap White To | color | - | - | The color assigned to the brightest (white-point) pixels. With Remap Black To it defines the two ends of the tonal gradient every pixel maps onto. *(keyframed in 1 instance)* |
| Intensity | float | 1 | 0 .. 1 | Strength of the recolor, 0-1. 0 leaves the image untouched, 1 applies the full black->white remap. Continuous float despite only 0/1 being sampled. *(keyframed in 1 instance)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the colorized result over the original, 0-1 continuous. 0 = bypass, 1 = full effect. Frequently keyframed to animate the tint in/out. *(keyframed in 50 instances)* |
| Colorize::HDR In Rec. 709 | bool | 0 | 0 .. 0 | Working-space toggle: treat the input as Rec.709 HDR when computing the remap. Not a creative control. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/channel-mixer.ts`](../../engine/src/compositor/filters/channel-mixer.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

> 3 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcColorize.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorize.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcColorize
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

```
c    = rgb / max(a,1e-6)                          // un-premultiply
key  = dot(c, hg_Params[4].xyz)                   // luminance key (weights in slot 4)
ramp = mix(RemapBlackTo, RemapWhiteTo, key)       // hg_Params[0]→dark color, [1]→light color
c'   = mix(c, ramp, hg_Params[2].xyz)             // Intensity: per-channel blend toward the ramp
out  = mix(src, c'·a, hg_Params[3])               // Mix: blend the colorized result over original
```

`hg_Params[0]` = **Remap Black To**, `[1]` = **Remap White To**, `[2]` = **Intensity** (per-channel),
`[3]` = **Mix**, `[4]` = luma weights. So it's a luma-keyed gradient between two colors, then blended
back — matching the TS implementation (`channel-mixer.ts` shares the linear-remap machinery).

