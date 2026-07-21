# Simple Border

- **PAE class:** `Simple Border`
- **Plugin UUID:** `8777A5DD-CDDA-4707-8454-D648943210D9`
- **Node names in corpus:** Simple Border (30), Simple Border 1 (16), Fill Colour (2), Outside 2nd Border (2), 2nd Border Filler  (2), Color Filler (2)
- **Corpus usage:** 22 files, 58 instances

## What it does

Simple Border draws a solid-colored frame around the image. Width sets the border thickness in pixels, Color its color, and Border Placement whether the border sits inside, centered on, or outside the image edge.

> **Note.** Not implemented; description is the standard Apple Motion "Simple Border" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Width | float (pixels) | 10 | 0 .. 1000 | Border thickness in pixels, ~0-1000 (default 10). |
| Color | color | - | - | Border color. |
| Mix | float | 1 | 0.3942 .. 1 | Wet/dry blend, 0-1 continuous. |
| Border Placement | enum(int) | 0 | 0 .. 2 | Where the border sits relative to the edge: inside / center / outside (0-2). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
