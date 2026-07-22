# PAEColorReduce

- **PAE class:** `PAEColorReduce`
- **Plugin UUID:** `3168D40C-AF34-401F-81DA-CB50EC5DD5D0`
- **Node names in corpus:** Color Reduce (3), Reduction (1)
- **Corpus usage:** 3 files, 4 instances

## What it does

Color Reduce (PAEColorReduce) quantizes the image to a small set of Match Colors, snapping every pixel to its nearest match color (or replacing matched colors with Replace With). The verbatim HgcColorReduce shader computes squared distance to up to four match colors, picks the nearest, and blends by a Smoothness/contrast slope -- a nearest-palette posterization.

> **Note.** Shader-only. The verbatim HgcColorReduce Metal shader (nearest-of-4-colors quantize) is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Replace With | color | - | - | Color that matched pixels are replaced with. |
| Match Color 1 | color | - | - | First palette color to match against. |
| Match Color 2 | color | - | - | Second palette color to match against. |
| Match Color 3 | color | - | - | Third palette color to match against. |
| Match Color 4 | color | - | - | Fourth palette color to match against. |
| Smoothness | float | 0.15 | 1 .. 1 | Blend slope between matched colors (shader hg_Params[0]). Continuous float, NOT a boolean. |
| Reduce To | enum(int) | 2 | 0 .. 2 | How many palette colors to reduce to, 0-2. |
| Mix | float | 1 | 0.2257 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcColorReduce` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcColorReduce.metal` (Phase-1 done, Phase-2 open).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcColorReduce.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcColorReduce.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcColorReduce
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Color Reduce **snaps each pixel to its nearest color from a small palette** (a hard nearest-centroid
quantizer, giving a poster/paint-by-numbers look). The shader carries up to 4 palette colors in
`hg_Params[1..4]` (with paired weights/bias in `hg_Params[5..8]`) and, per pixel, picks the closest:

```
c = rgb / max(a,1e-6)                       // un-premultiply
for k in 0..N-1:                            // N palette entries (≤4 per pass)
    d[k] = dot(c - palette[k], c - palette[k])   // squared distance to each centroid
winner = argmin_k (d[k] + bias[k])          // nearest centroid (bias lets some colors "win" ties)
out.rgb = palette[winner] * a               // replace with the palette color, re-premultiply
out.a   = a
```

The cascade of `select(... < 0)` comparisons in the shader is an unrolled `argmin` over the squared
distances (with the `+ hg_Params[5..8]` acting as per-centroid bias). To finish: decode
`-[PAEColorReduce ...]` to see how the **palette entries** are derived (fixed N-color quantization
grid vs sampled from the image) and how many centroids per pass.

