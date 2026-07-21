# WideTime

- **PAE class:** `WideTime`
- **Plugin UUID:** `5C96D4F9-16FC-4D7F-A4DE-F73D5D0E83BA`
- **Node names in corpus:** WideTime (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

WideTime is a temporal smear/trail filter that stretches the image across a span of time (a wide time window), blending recent frames with a Decay falloff for a long motion-blur streak. Duration sets the time window, Decay the fade, and Amount the strength.

> **Note.** Not implemented; description is the standard Apple Motion "WideTime" temporal filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Duration | float (seconds) | 0.1 | 0.001 .. 0.001 | Time window blended together, ~0.001-0.1s (default 0.1). |
| Decay | float | 0.8 | 0 .. 0 | Falloff of older frames, ~0.8 (default 0.8). Continuous float, NOT a boolean. |
| Amount | float | 0.8 | 1 .. 1 | Strength of the smear, ~0.8 (default 0.8). Continuous float, NOT a boolean. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
