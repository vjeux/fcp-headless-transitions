# Fisheye

- **PAE class:** `Fisheye`
- **Plugin UUID:** `C1278154-B061-453F-8BDE-9F70AB2E6066`
- **Node names in corpus:** Fisheye (69), Fisheye copy (1)
- **Corpus usage:** 41 files, 70 instances

## What it does

Fisheye applies an anisotropic radial power warp (barrel/fisheye bulge or pinch) about a Center: the sample offset scales with normalized radius raised to a power derived from Amount, normalized per-axis by frame width and height. Radius scales the effect extent. Implemented and verified (34-36 dB) with the exact model from the HgcFisheye shader.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | enum(int)/float | 15 | 0 .. 4 | Strength (and sign) of the fisheye. Internally exponent = (Amount/30 <= 0) ? 1/(1-Amount/30) : (Amount/30 + 1). Amount 0 = identity; positive = barrel bulge, negative = pincushion. Default 15. *(keyframed in 67 instances)* |
| Radius | float | 1 | 0.23 .. 2 | Scales the normalization radius, 0.23-2 (default 1). Larger = a broader, gentler warp. *(keyframed in 2 instances)* |
| Center | point2D | - | - | Center of the fisheye (X,Y) in normalized frame coordinates. *(keyframed in 28 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the warped result over the original, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/fisheye.ts`](../../engine/src/compositor/filters/fisheye.ts). Reverse-engineered against the verbatim `HgcFisheye` Metal shader.

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcFisheye.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcFisheye.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcFisheye
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Power-law radial lens distortion with **anisotropic (per-axis) radius normalization** — that W/H
normalization was the key fix that took it from 16→34 dB:

```
d     = (matrix·texCoord) - Center                  // hg_Params[2..3] rows, Center=hg_Params[6]
r2    = dot(d*d, hg_Params[5].xy)                    // ANISOTROPIC squared radius (per-axis weights)
rn    = rsqrt(r2)
scale = rn * pow(rn, -Amount)                        // hg_Params[4].x = Amount (bulge power)
uv    = d * scale + Center → back through output matrix (hg_Params[0..1]) + offset (hg_Params[7])
out   = sample(source, uv)
```

`hg_Params[4].x` = **Amount** (+ = bulge/convex, − = pinch/concave), `hg_Params[5].xy` = the per-axis
normalization that keeps the distortion circular on 16:9. See FISHEYE_RE.md for the power-law decode.

