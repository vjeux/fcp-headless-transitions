# Fun House

- **PAE class:** `Fun House`
- **Plugin UUID:** `448206B5-384F-4056-88C8-369B8AEEA2B0`
- **Node names in corpus:** Fun House (27), Fun House copy (2)
- **Corpus usage:** 17 files, 29 instances

## What it does

Fun House applies a carnival funhouse-mirror distortion, stretching and squeezing the image around a vertical (or angled) axis through Center as if reflected in a warped mirror. Width sets the region affected, Amount the distortion strength, and Angle the axis orientation.

> **Note.** Not implemented; description is the standard Apple Motion "Fun House" distortion filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the funhouse distortion (X,Y) in normalized frame coordinates. *(keyframed in 4 instances)* |
| Width | float (pixels) | 400 | 232 .. 40000 | Width of the affected region, ~230-40000 (default 400). *(keyframed in 10 instances)* |
| Amount | float | 3 | 1.5 .. 100 | Distortion strength, ~1.5-100 (default 3). *(keyframed in 18 instances)* |
| Angle | float (radians) | 0 | -0.5411 .. 1.571 | Orientation of the distortion axis, radians (default 0). *(keyframed in 7 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 12 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
