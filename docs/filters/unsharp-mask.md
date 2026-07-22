# Unsharp Mask

- **PAE class:** `Unsharp Mask`
- **Plugin UUID:** `710CFB1F-16B3-48A2-8366-67BE752695CF`
- **Node names in corpus:** Unsharp Mask (41), Unsharp Mask copy (24), usm (5), Unsharp Mask 1 (1), um (1)
- **Corpus usage:** 54 files, 72 instances

## What it does

Unsharp Mask sharpens by subtracting a blurred copy from the original and adding the difference back, boosting edge contrast. Radius sets the blur scale (edge size), Amount the sharpening strength, and Threshold suppresses sharpening of low-contrast (noise) areas. Not implemented, but the algorithm is standard and unambiguous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Radius | float (pixels) | 7 | 2 .. 32 | Blur radius of the unsharp kernel, 2-32 (default 7). Larger = sharpens broader edges / halos. |
| Amount | float | 1 | 0 .. 2 | Sharpening strength, 0-2 (default 1). 0 = no sharpening. |
| Threshold | float | 0 | 0 .. 0.57 | Minimum local contrast before sharpening applies, 0-0.57. Higher = leaves flat/noisy areas untouched. |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal weighting, 0-100%. |
| Vertical | float (percent) | 100 | 100 .. 100 | Vertical weighting, 0-100%. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the sharpened result over the original, 0-1 continuous. NOT a boolean (only 1 sampled). |

## FxPlug plumbing

Non-creative host parameters on this filter: `360° Aware`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcUnsharpMask.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcUnsharpMask.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcUnsharpMask
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Unsharp Mask sharpens with a **threshold** (unlike plain Sharpen): only differences larger than a
threshold are amplified, so flat noise isn't boosted.

```
detail = color0 - color1                      // orig − blurred (high freq); color1 = Gaussian copy
// threshold: subtract Threshold from |detail|, clamp — small differences → 0
pos    = max(detail - Threshold, 0)           // hg_Params[1].x = Threshold
neg    = min(detail + Threshold, 0)
detail = (detail < 0) ? neg : pos             // dead-zone of width ±Threshold around 0
out    = max(detail * Amount + color0, 0)     // hg_Params[0] = Amount, add back, clamp≥0
out.a  = clamp(out.a, 0, 1)
```

`hg_Params[0]` = **Amount** (sharpening strength), `hg_Params[1].x` = **Threshold** (dead-zone; edges
below it aren't sharpened). The blur radius that builds `color1` = **Radius** (edge scale). This is
the textbook unsharp-mask-with-threshold; head-start is the 4 lines above over a shared Gaussian.

