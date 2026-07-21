# Stroke

- **PAE class:** `Stroke`
- **Plugin UUID:** `0CB21C8A-7983-418D-B7EC-EDBB20AF4732`
- **Node names in corpus:** Stroke (60), Outline (6), Stroke copy (5), s (1)
- **Corpus usage:** 61 files, 72 instances

## What it does

Stroke draws an outline around the alpha edge of a layer, with a chosen Width, Color (or Gradient), and Position (inside/outside/center of the edge), plus fade controls to feather it. It is the standard edge-outline effect for titles and shapes. Not implemented; described from the standard Motion "Stroke".

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Stroke" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Stroke Type | enum(int) | 0 | 0 .. 2 | Fill type of the stroke, 0-2 (e.g. color vs gradient vs texture). |
| Color | color | - | - | Stroke color (nested Red/Green/Blue/Opacity). |
| Gradient | group | - | - | Stroke gradient (RGB stops, Opacity, Start/End) when Stroke Type is gradient. |
| Width | float (pixels) | 10 | 1 .. 300 | Thickness of the outline in pixels, 1-300 (default 10). |
| Position | enum(int) | 0 | 0 .. 2 | Where the stroke sits relative to the alpha edge, 0-2 (inside / center / outside). |
| Offset | float (pixels) | 0 | -12 .. 40 | Shifts the stroke in/out from the edge, -12..40. *(keyframed in 1 instance)* |
| Threshold | float | 0.5001 | 0 .. 1 | Alpha threshold that defines the edge to stroke, 0-1. |
| Fade Inside | float | 0 | 0 .. 1 | Feather of the stroke's inner edge, 0-1. |
| Fade Outside | float | 0 | 0 .. 1 | Feather of the stroke's outer edge, 0-1. |
| Fade Width | float | 1 | 0 .. 1 | Overall feather width, 0-1. |
| Fade Falloff | float | 0 | -100 .. 100 | Curve of the fade, -100..100. |
| Hide Source | bool | 0 | 0 .. 1 | Toggle: show only the stroke, hiding the original layer content. |
| Blend Mode | enum(int) | 0 | 0 .. 16 | How the stroke composites, 0-16. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the stroked result over the original, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
