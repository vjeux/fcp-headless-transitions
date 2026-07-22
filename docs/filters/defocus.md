# Defocus

- **PAE class:** `Defocus`
- **Plugin UUID:** `0F3B36EF-B955-4471-87C6-9EE2A74AFE5E`
- **Node names in corpus:** Defocus (51), Source (31), Df (1), Defocus copy (1)
- **Corpus usage:** 69 files, 84 instances

## What it does

Defocus simulates a camera's out-of-focus lens: instead of a Gaussian, it blurs with a polygonal aperture (bokeh) whose shape has a chosen number of Sides and Rotation, so bright points bloom into hexagons/pentagons. Amount is the defocus radius, Gain boosts highlight bokeh. FCP uses the HgcConvolvePass7tapDefocus shader (checked in); the filter is not yet implemented.

> **Note.** HgcConvolvePass7tapDefocus shader is checked in but the filter is not implemented in TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 10 | 0 .. 80 | Defocus / blur-circle radius, 0-80. 0 = in focus. Heavily keyframed for rack-focus pulls. *(keyframed in 61 instances)* |
| Sides | enum(int) | 3 | 3 .. 8 | Number of aperture-blade sides shaping the bokeh, 3-8 (3 = triangular bokeh, higher = rounder). |
| Rotation | float (radians) | 0 | 0 .. 1.745 | Rotation of the aperture polygon, 0..~1.75 radians. |
| Gain | float | 2 | 0.05 .. 4 | Highlight bokeh gain, 0.05-4 (default 2). Higher = brighter, more defined bokeh discs. |
| Shape | bool | 0 | 0 .. 1 | Toggle between aperture shape modes. |
| Aspect Ratio | bool/float | 1 | 1 .. 1 | Aspect stretch of the bokeh (anamorphic bokeh when non-square). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the defocused result over the sharp original, 0-1 continuous. NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** — 📄 shader available: `evidence/shaders/HgcConvolvePass7tapDefocus.metal` (verbatim FCP source, per-pixel math decoded; TS port pending).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcConvolvePass7tapDefocus.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcConvolvePass7tapDefocus.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcConvolvePass7tapDefocus
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Unlike Gaussian, Defocus convolves with a **polygonal-aperture disc** so out-of-focus highlights
bloom into hexagons/pentagons (real lens bokeh):

```
// 7-tap disc kernel (HgcConvolvePass7tapDefocus): taps arranged on the aperture polygon,
// equal-ish weights (a disc, not a bell), radius = Amount:
out = Σ_{k=0..6} w_k · sample(p + radius · tap_k)
// tap_k positions define the aperture SHAPE (Sides), rotated by Rotation.
// Gain boosts the brightest taps so highlights blow into bokeh discs.
```

`Amount` = defocus radius, **Sides** = aperture polygon (5=pentagon…), **Rotation** = aperture
angle, **Gain** = highlight bokeh boost. The disc (flat) kernel vs Gaussian (bell) is the whole
difference. 📄 shader in `evidence/shaders/HgcConvolvePass7tapDefocus.metal`; head-start: disc-tap
convolution at the aperture vertices, with a highlight-gain pre-pass.

