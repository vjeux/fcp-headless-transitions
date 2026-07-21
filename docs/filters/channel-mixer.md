# Channel Mixer

- **PAE class:** `Channel Mixer`
- **Plugin UUID:** `B2E0DE39-119F-4AD6-8796-C18BF8FE27B8`
- **Node names in corpus:** Channel Mixer (382), Channel Mixer copy (3), mixer-green-blue2green (1), mixer-red (1)
- **Corpus usage:** 102 files, 387 instances

## What it does

Channel Mixer recomputes each output channel as a weighted sum of the input R, G, B (and optionally alpha) channels plus an offset -- a full per-channel linear color matrix. It is used for creative channel swaps, custom monochrome mixes, and color-space corrections. Implemented and RE'd from the HgcChannelMixer shader (a 4-wide dot per channel, un-premultiply then re-premultiply).

> **Note.** RE gap: the '...-Alpha' offset column does not behave as a clean per-channel add in real FCP, but every shipping transition sets those offsets to 0, so the exercised path is exact.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Red Output | group | - | - | Weights that build the output red channel: Red-Red, Red-Green, Red-Blue (channel mix) and Red-Alpha (offset). *(keyframed in 12 instances)* |
| Green Output | group | - | - | Weights that build the output green channel (Green-Red/Green/Blue mix + Green-Alpha offset). *(keyframed in 12 instances)* |
| Blue Output | group | - | - | Weights that build the output blue channel (Blue-Red/Green/Blue mix + Blue-Alpha offset). *(keyframed in 12 instances)* |
| Alpha Output | group | - | - | Weights that build the output alpha channel (only used when Include Alpha is on). *(keyframed in 12 instances)* |
| Monochrome | bool | 0 | 0 .. 1 | Toggle: set all three RGB rows to the same luma weights for a custom grayscale mix. |
| Include Alpha | bool | 0 | 0 .. 1 | Toggle: also mix the alpha channel. |
| Allow Mono > 1 | bool | 1 | 1 .. 1 | Toggle: permit monochrome weights that sum above 1 (brighter gray mix). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the mixed result over the original, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/channel-mixer.ts`](../../engine/src/compositor/filters/channel-mixer.ts).
