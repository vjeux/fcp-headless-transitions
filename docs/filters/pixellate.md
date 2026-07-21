# Pixellate

- **PAE class:** `Pixellate`
- **Plugin UUID:** `5E7CA164-3AAF-4C70-A377-567E5796528A`
- **Node names in corpus:** Pixellate (266), Pixellate 1 (10), Pixellate 2 (8), Pixellate copy (6), Pixellate 3 (3), Animate (2)
- **Corpus usage:** 162 files, 296 instances

## What it does

Pixellate snaps each output pixel to the center of a Scale x Scale-pixel grid cell and nearest-samples the source there, producing a blocky mosaic. Scale is the block size in pixels exactly (verified on both axes) and Center anchors the grid. Implemented and verified against headless FCP via the HgcPixellate shader (a coordinate quantize).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Scale | float (pixels) | 8 | 1 .. 320 | Mosaic block size in pixels (default 8). 1 = no pixelation; larger = coarser blocks. Verified as an exact block size on both axes. *(keyframed in 29 instances)* |
| Center | point2D | - | - | Grid origin (X,Y) as a fraction of the frame; shifts where the block boundaries fall. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the mosaic over the original, 0-1 continuous. *(keyframed in 110 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/pixellate.ts`](../../engine/src/compositor/filters/pixellate.ts). Reverse-engineered against the verbatim `HgcPixellate` Metal shader.

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
