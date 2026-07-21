# Color Emboss

- **PAE class:** `Color Emboss`
- **Plugin UUID:** `4C36AECF-53D9-42A8-AD43-9578B00AE01C`
- **Node names in corpus:** Color Emboss (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Color Emboss embosses the image along a chosen Direction, keeping color (unlike a plain gray emboss) so edges pick up a raised, tinted relief. Direction sets the emboss light angle and Relief toggles the raised vs recessed appearance.

> **Note.** Not implemented; description is the standard Apple Motion "Color Emboss" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Direction | float (radians) | 0.01371 | 0 .. 0.5099 | Emboss light direction, radians (default ~0.014). |
| Relief | bool | 1 | 0 .. 0 | Raised vs recessed relief toggle. *(keyframed in 1 instance)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
