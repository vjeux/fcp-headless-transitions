# Edges

- **PAE class:** `Edges`
- **Plugin UUID:** `824B3514-C6DF-465A-99B9-D60CA063D6CF`
- **Node names in corpus:** Edges (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Edges performs edge detection, outlining the high-contrast boundaries in the image (typically over black) for a wireframe/outline look. Intensity scales how strongly edges are drawn.

> **Note.** Not implemented; description is the standard Apple Motion "Edges" edge-detect filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Intensity | float | 1 | 7 .. 20 | Strength of the detected edges, ~7-20 (default 1). Continuous float. |
| Mix | float | 1 | 0.5 .. 0.5693 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
