# Custom LUT

- **PAE class:** `Custom LUT`
- **Plugin UUID:** `14B39AEF-607D-42DF-98DD-DB3DD345E925`
- **Node names in corpus:** Custom LUT (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Custom LUT applies a user-supplied 1D/3D color lookup table (.cube etc.) to the image, remapping colors through the LUT. Convert controls input/output color-space handling around the LUT.

> **Note.** Not implemented; description is the standard FCP "Custom LUT" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| LUT | file | - | - | The color lookup table file applied to the image. |
| Convert | group | - | - | Input/output color-space conversion applied around the LUT. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter is a thin **Core Image (`CIFilter`) wrapper**: the per-pixel math lives in Apple's private CoreImage kernels (`/System/Library/Frameworks/CoreImage.framework`), not in FCP's Filters binary, so there is no `Hgc*` shader to extract here. The FCP class only marshals parameters into the CI filter. To recover the exact kernel, dump the CI kernel source (e.g. `CIKernel`/`.cikernel` in CoreImage) for the named filter.
