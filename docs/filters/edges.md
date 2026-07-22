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

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcEdges.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcEdges.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcEdges
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Edges is a **gradient-magnitude edge detector** (Sobel-like): it takes horizontal and vertical
differences from 4 neighbor taps, sums their squares, and scales — bright where the image changes.

```
gx   = sample(texCoord0) - sample(texCoord2)   // center − left  (horizontal difference)
gy   = sample(texCoord1) - sample(texCoord3)   // up − down      (vertical difference)
mag  = gx*gx + gy*gy                            // squared gradient magnitude (per channel, RGB)
out.rgb = mag * hg_Params[0].rgb                // Amount/Intensity gain per channel
```

Per-channel (so colored edges keep hue). `hg_Params[0]` = **Amount**; neighbor tap distance
(from a Radius param) sets edge scale. Note it uses squared magnitude (no sqrt) — brighter, more
contrasty edges than a true gradient norm. Head-start: 4-tap central differences, sum of squares,
scale.

