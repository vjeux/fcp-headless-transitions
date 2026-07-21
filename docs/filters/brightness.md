# Brightness

- **PAE class:** `Brightness`
- **Plugin UUID:** `2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6`
- **Node names in corpus:** Brightness (513), Brightness copy (55), Brightness copy 15 (3), Brightness copy 19 (2), Brightness copy 21 (2), Brightness copy 20 (1)
- **Corpus usage:** 259 files, 586 instances

## What it does

Brightness applies a simple per-channel brightness scale/offset to the image (in this engine it maps onto the Levels path; PAEBrightness has no dedicated shader and does an additive/multiplicative lift of RGB with alpha preserved). It is the plain "make it brighter/darker" knob, frequently keyframed to flash or fade a layer.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Brightness | float | 1 | 0 .. 54.04 | Brightness amount. Default 1 (identity). Values above 1 brighten, below 1 darken; a very wide range (up to ~54) is observed for blown-out flash effects. *(keyframed in 222 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the brightened result over the original, 0-1 continuous. *(keyframed in 33 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/levels.ts`](../../engine/src/compositor/filters/levels.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
