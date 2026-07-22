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

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcColorCurves.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorCurves.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcColorCurves
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Color Curves applies a **per-channel lookup curve** (like Photoshop Curves) — each channel's value
indexes a 1-D curve **texture** (`hg_Texture1..4` = the R/G/B/luma curve LUTs) between a
low/high clamp, and the looked-up value replaces it.

```
for channel in {luma or R, G, B}:
    v    = dot(rgb, weights)                         // channel value (hg_Params[4] = luma weights for master)
    v    = clamp(v, Lo, Hi)                          // per-curve black/white points (hg_Params[10],[11])
    idx  = clamp(v * (LUTsize) , 0, LUTsize-1)       // hg_Params[18] = LUT width
    out_channel = sample(curveTex, (idx+0.5)/LUTsize)  // curve lookup
```

There are 4 curve textures (master/luma + R + G + B), each a baked 1-D LUT of the user's curve.
`hg_Params[10]/[11]` = per-curve input clamp (black/white point), `hg_Params[18]` = LUT resolution.
Head-start: bake each editable curve into a 256-entry LUT and do 4 lookups (apply master then per-
channel). The curve *shape* is entirely in the textures — the shader is just the indexed lookup.

