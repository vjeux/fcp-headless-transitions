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

## Algorithm (decoded)

_RE'd from the `HgcColorEmboss` embedded shader. Decoded functional form:_

Color Emboss is a **directional gradient** that keeps color (unlike a gray emboss): it samples the
source at two opposite offsets (`+d` and `−d`), subtracts them, and adds the center — giving a
raised/lit relief along the offset direction while preserving hue.

```
d      = hg_Params[0].xy            // emboss offset (direction+distance), e.g. from Angle+Amount
d2     = hg_Params[1].xy            // opposite offset (≈ -d)
a      = sample(source, clampToCrop(uv + d))  |> unpremult
b      = sample(source, clampToCrop(uv + d2)) |> unpremult
c      = sample(source, uv)                    |> unpremult
out.rgb = (a - b + c) * a_alpha     // directional difference + center, re-premultiply
```

`hg_Params[2]` = crop bounds (`fmax/fmin` clamp), `hg_Params[3]` = final scale+bias to UV. The
`a − b` is a finite-difference derivative along `d`; adding `c` (the center) keeps the base image so
it reads as embossed color rather than pure edges. Head-start: two offset gathers + center, combine
as above; map **Direction**→`d` angle and **Amount**→`|d|`.
