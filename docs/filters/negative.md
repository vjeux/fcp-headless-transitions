# Negative

- **PAE class:** `Negative`
- **Plugin UUID:** `9A527DF8-790C-4FD7-B800-116A41B91E24`
- **Node names in corpus:** Negative (93), Negative 2 (5), Negative 1 (5), Negative 3 (3), Negative Out (2), Negative copy (1)
- **Corpus usage:** 74 files, 112 instances

## What it does

Negative inverts the image colors (out = 1 - in per channel), producing a photographic negative. It is a single-purpose invert with only a blend control. Not implemented and no checked-in shader, but the operation is unambiguous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the inverted result over the original, 0-1 continuous. Fractional values give a partial-invert wash. *(keyframed in 23 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
