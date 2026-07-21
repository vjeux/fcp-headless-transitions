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
