# Tint

- **PAE class:** `Tint`
- **Plugin UUID:** `717D6E01-83F4-4A4B-AF92-42AABA4B176C`
- **Node names in corpus:** Tint (221), Tint copy (71), Tint Master (2), Card Tint (1), Backdrop Tint (1)
- **Corpus usage:** 85 files, 296 instances

## What it does

Tint recolors the image toward a single Color using a hard-light-style two-leg curve about luma 0.5 (NOT a simple luma*color lerp), blended by Intensity. It gives a monochrome/duotone wash keyed to a target color. Implemented (shares the channel-mixer module) and RE'd from the HgcTint shader.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Color | color | - | - | The tint target color (nested Red/Green/Blue 0-1). The image is pushed toward this hue. *(keyframed in 1 instance)* |
| Intensity | float | 1 | 0.24 .. 1 | How strongly the tint is applied, 0-1. 0 = untinted, 1 = full tint. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the tinted result over the original, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/channel-mixer.ts`](../../engine/src/compositor/filters/channel-mixer.ts).
