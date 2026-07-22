# Dazzle

- **PAE class:** `Dazzle`
- **Plugin UUID:** `E92A99A6-A2E5-44A0-B29C-80674F4003D0`
- **Node names in corpus:** Dazzle (28)
- **Corpus usage:** 18 files, 28 instances

## What it does

Dazzle adds anamorphic star/streak flares to the bright points of the image: thresholded highlights sprout radiating spikes, producing a sparkly "dazzle" or glint. Spike Count sets how many arms each star has, Angle rotates them, Amount their length, and Threshold which pixels are bright enough to flare.

> **Note.** Not implemented; description is the standard Apple Motion "Dazzle" star-flare filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 30 | 20 .. 60 | Length/reach of the star spikes, ~20-60 (default 30). |
| Brightness | float | 100 | 50.3 .. 100 | Intensity of the flares, ~50-100 (default 100). |
| Threshold | float | 75 | 24 .. 96 | Brightness cutoff for which pixels sprout flares, ~24-96 (default 75). |
| Angle | float (radians) | 0.006854 | 0 .. 1.054 | Rotation of the star spikes, radians (default ~0). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 2 instances)* |
| Spike Count | enum(int) | 3 | 3 .. 10 | Number of radiating arms per star, 3-10 (default 3). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 3 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm (decoded)

_PAEDazzle — animated sparkle/glitter (thresholded noise → glint bursts)._

```
hi     = max(luma(src) - Threshold, 0)         // bright spots that can sparkle
sparkle= noise(p, time·Speed) > (1-Density)    // animated random sparkle mask
star   = sparkle · multiDirectionalStreak(hi)  // small glint-style rays at sparkle points
out    = src + star · Intensity · Color
```

Params: **Threshold**, **Density/Amount**, **Speed** (animation), **Intensity**, **Color**. It's an
animated variant of Glint — random highlight points burst into little stars over time. Head-start:
animated sparse sparkle mask × small streaks on the highlights.
