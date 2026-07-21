# Echo

- **PAE class:** `Echo`
- **Plugin UUID:** `EA4CD041-900C-4D48-90A6-E64CA1EB60CA`
- **Node names in corpus:** Echo (5)
- **Corpus usage:** 4 files, 5 instances

## What it does

Echo is a temporal filter that overlays a few evenly-spaced previous frames on top of the current one, each fainter than the last, creating a ghosting/echo trail. Delay sets the spacing between echoes, Number how many, and Decay how quickly they fade.

> **Note.** Not implemented; description is the standard Apple Motion "Echo" temporal filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 0.8 | 0 .. 0.8 | Opacity/strength of the echoes, 0-0.8 (default 0.8). |
| Delay | float (seconds) | 0.1 | 0.1 .. 0.21 | Time spacing between successive echoes, ~0.1-0.21s (default 0.1). |
| Number | enum(int) | 4 | 2 .. 4 | Number of echo copies, 2-4 (default 4). |
| Decay | float | 0.8 | 0 .. 0.8 | How quickly each echo fades, 0-0.8 (default 0.8). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
