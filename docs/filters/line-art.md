# Line Art

- **PAE class:** `Line Art`
- **Plugin UUID:** `3286E661-A40D-40BE-82AB-1852FFAF91E0`
- **Node names in corpus:** Line Art (25), LA (2)
- **Corpus usage:** 21 files, 27 instances

## What it does

Line Art converts the image into a stylized pen-and-ink drawing: it detects edges and renders them as ink strokes on a paper-colored background. Threshold and Smoothness control which edges become ink, while the Paper/Ink colors and Paper Opacity set the drawing's look.

> **Note.** Not implemented; description is the standard Apple Motion "Line Art" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Threshold | float | 0.07 | 0.02 .. 0.2 | Edge-detection threshold; lower = more lines, ~0.02-0.2 (default 0.07). |
| Smoothness | float | 0.11 | 0 .. 0.15 | Smoothing of the detected lines, 0-0.15 (default 0.11). |
| Paper Color | color | - | - | Background (paper) color. |
| Paper Opacity | float | 1 | 0 .. 1 | Opacity of the paper background, 0-1. NOT a boolean. |
| Ink Color | color | - | - | Color of the ink strokes. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 3 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcLineArt.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLineArt.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcLineArt
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Line Art is a **morphological edge detector** (dilation minus original) — it finds outlines by
taking the brightest of a pixel and its 4 neighbors, then subtracting the center. Flat regions
cancel to 0 (black); edges leave a bright outline.

```
c    = sample(center)                     // texCoord0
mx   = max(c, sample(±dx), sample(±dy))   // texCoord1..4 = the 4 neighbor taps (dilate)
out  = mx - c                             // dilation − original = edge magnitude
```

No parameters in the shader itself — the neighbor **offset distance** (line thickness / edge scale)
is baked into the tap coordinates upstream (from a Radius/Amount param). It's a per-channel morphological
gradient, so colored edges keep their color. Head-start: `out = maxNeighborhood(src) − src`; expose
tap distance as the line-width control. (Compare `edges.md` which uses a symmetric difference.)

