# Twirl

- **PAE class:** `Twirl`
- **Plugin UUID:** `42D649CE-8CAA-4BCC-8F59-50E1009B03CE`
- **Node names in corpus:** Twirl (491), OSC (52), Control (40), PRS (34), Rotate (28), Twirl copy (6)
- **Corpus usage:** 492 files, 693 instances

## What it does

Twirl applies a swirling rotational distortion around a center point: pixels near the center are rotated most and the rotation falls off with radius, spiraling the image like water down a drain. The `Twirl` angle sets how many radians of spin at the core and `Amount` scales the effect radius/strength. Used for vortex, dizzy, and dissolve-into-a-whirl transition effects.

> **Note.** Not implemented in the TS engine; description is the standard Apple Motion "Twirl" filter. The exact radial falloff curve is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Twirl | float (radians) | pi (3.1416) | -6.083 .. 9.069 | Swirl angle at the center in radians (default pi ~= 3.1416, a half-turn). Negative values swirl the opposite direction; the twist decreases toward the edges. *(keyframed in 7 instances)* |
| Amount | float | 0.5 | 0 .. 1 | Scales the strength / falloff radius of the swirl, 0-1. 0 = no distortion. (Corpus mis-sampled the type; this is a continuous float.) *(keyframed in 3 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the twirled result over the original, 0-1 continuous. NOT a boolean despite only 0/1 being sampled. |
| Center | point2D | - | - | Center of the swirl (X,Y) in Motion's normalized frame coordinates, (0.5,0.5) = frame center. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.
