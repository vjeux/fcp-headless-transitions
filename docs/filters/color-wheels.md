# Color Wheels

- **PAE class:** `Color Wheels`
- **Plugin UUID:** `52A68C6D-B49C-41AA-B3EA-03945D0C8EB4`
- **Node names in corpus:** Color Wheels (14), Color Wheels copy (1)
- **Corpus usage:** 4 files, 15 instances

## What it does

Color Wheels is FCP's primary color-grading control: independent Master/Shadows/Midtones/Highlights color wheels each set color balance, saturation, and brightness for that tonal range, plus Temperature/Tint white-balance controls. It is a full grade panel rather than a single-purpose image filter.

> **Note.** Not implemented; description is the standard FCP "Color Wheels" grading control. Tint/Hue sub-knobs live inside the wheel groups.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Master | group | - | - | Overall color balance / saturation / brightness wheel. |
| Shadows | group | - | - | Color wheel affecting the dark tones. |
| Midtones | group | - | - | Color wheel affecting the mid tones. |
| Highlights | group | - | - | Color wheel affecting the bright tones. |
| Temperature | float (Kelvin) | 5000 | 4984 .. 5000 | White-balance temperature, ~4984-5000K (default 5000). |
| Preserve Luma | bool | 1 | 1 .. 1 | Keep luminance constant while shifting color. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |
| Tint | bool | 0 | 0 .. 0 | *(unverified)* |
| Hue | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Decompiled code (ground truth)

This filter is a thin **Core Image (`CIFilter`) wrapper**: the per-pixel math lives in Apple's private CoreImage kernels (`/System/Library/Frameworks/CoreImage.framework`), not in FCP's Filters binary, so there is no `Hgc*` shader to extract here. The FCP class only marshals parameters into the CI filter. To recover the exact kernel, dump the CI kernel source (e.g. `CIKernel`/`.cikernel` in CoreImage) for the named filter.
