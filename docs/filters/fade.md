# Fade

- **PAE class:** `Fade`
- **Plugin UUID:** `8154D0DA-C99B-4EF8-8FF8-006FE5ED57F1`
- **Node names in corpus:** Fade (3)
- **Corpus usage:** 3 files, 3 instances

## What it does

Fade simply fades the image toward transparent/black via its Mix (opacity) control -- effectively an opacity ramp exposed as a filter. Animate Mix for a fade in/out.

> **Note.** Not implemented; a trivial opacity/fade filter — Mix is its only control.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Mix | float | 1 | 0 .. 1 | Opacity of the image, 0-1 continuous (0 = fully faded). NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
