# Comic

- **PAE class:** `Comic`
- **Plugin UUID:** `3C6550FA-14A0-45A3-8CD7-C70C58F7B330`
- **Node names in corpus:** Comic (14), Comic Source (3)
- **Corpus usage:** 14 files, 17 instances

## What it does

Comic stylizes the image into a comic-book look: it posterizes colors into flat regions, inks the edges with black outlines, and optionally recolors ink/fill. Style picks the overall treatment, Ink Edges/Smoothness shape the outlines, and Posterize Levels sets how flat the color regions are.

> **Note.** Not implemented; description is the standard Apple Motion "Comic" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Style | enum(int) | 0 | 0 .. 2 | Overall comic treatment preset (0-2). |
| Ink Color | color | - | - | Color of the inked outlines. |
| Fill Color | color | - | - | Base fill color used by some styles. |
| Ink Edges | float | 0.25 | 0 .. 1 | How strongly edges are inked, 0-1 (default 0.25). |
| Ink Smoothness | float | 0.3 | 0 .. 1 | Smoothness of the ink outlines, 0-1 (default 0.3). |
| Ink Fill | float | 0.5 | 0 .. 0.5 | Amount of ink fill in dark regions, 0-0.5 (default 0.5). |
| Posterize Levels | enum(int) | 6 | 2 .. 6 | Number of flat color levels, 2-6 (default 6). |
| Affect Alpha | bool | 0 | 0 .. 0 | Whether the effect also modifies the alpha channel. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 4 instances)* |
| Smoothness | bool | 0.25 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).
