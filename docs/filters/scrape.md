# Scrape

- **PAE class:** `Scrape`
- **Plugin UUID:** `0D6E968B-0291-43E2-A8DA-88EB80E9C4B2`
- **Node names in corpus:** Scrape (58), Scrape Down Out (9), Scrape Down In (9), Scrape Top (7), Scrape Bottom (7), Scrape Right Out (6)
- **Corpus usage:** 48 files, 135 instances

## What it does

Scrape (FCP UI: 'Smear', PAEScrape) smears the layer along an axis: pixels past a threshold line (set by Amount, oriented by Rotation, anchored at Center) are dragged/streaked in the axis direction, an inverse-map geometric warp with no blur. Implemented and RE'd verbatim from the HgcScrape shader.

> **Note.** Corpus dropped 2 localized (non-English) parameter duplicates. FCP calls this 'Smear'; the PAE class is PAEScrape.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the smear (X,Y) in normalized frame coordinates. *(keyframed in 112 instances)* |
| Rotation | float (radians) | 0 | 0 .. 6.283 | Orientation of the smear axis in radians, 0..2pi. *(keyframed in 2 instances)* |
| Amount | float | 50 | 0 .. 200 | Smear strength, 0-200 (default 50). Controls the threshold line position -- how much of the layer past the center gets dragged. 0 = no smear. *(keyframed in 9 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the smeared result over the original, 0-1 continuous. *(keyframed in 28 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/scrape.ts`](../../engine/src/compositor/filters/scrape.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
