# Color Curves

- **PAE class:** `Color Curves`
- **Plugin UUID:** `920273EF-948C-4556-8EB8-8EFEF7A34111`
- **Node names in corpus:** Color Curves (67), Color Curves copy (7)
- **Corpus usage:** 65 files, 74 instances

## What it does

Color Curves adjusts tone via editable per-channel and luma curves (Curve 1/2/3 + Luma), the classic curves grade for shaping shadows, mids and highlights independently. Preserve Luma keeps overall brightness while shifting color. Not implemented; the curve data is stored as opaque graph blobs in the .motr.

> **Note.** Not implemented in the TS engine and no checked-in shader; the Curve/Luma parameters are stored as opaque graph blobs (their control points are not decoded here). Described from the standard Motion "Color Curves".

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Curve 1 | unknown | - | - | Editable tone curve for the first channel (opaque graph blob). |
| Curve 2 | unknown | - | - | Editable tone curve for the second channel (opaque graph blob). |
| Curve 3 | unknown | - | - | Editable tone curve for the third channel (opaque graph blob). |
| Luma | unknown | - | - | Editable luma (brightness) curve (opaque graph blob). |
| Preserve Luma | bool | 1 | 1 .. 1 | Toggle: keep overall luminance constant while the color curves shift chroma. |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the graded result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 1 non-creative internal/hidden state parameter(s) (persisted engine state, not user knobs) were omitted from the table above.
