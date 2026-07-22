# Line Screen

- **PAE class:** `Line Screen`
- **Plugin UUID:** `57174A04-8434-4179-A8EB-66C88B63F308`
- **Node names in corpus:** Line Screen (48)
- **Corpus usage:** 5 files, 48 instances

## What it does

Line Screen renders the image as a printed line-screen halftone: tone is represented by the thickness of parallel lines. The verbatim HgcLineScreen shader takes the pixel luma (dot with hg_Params[5]), compares it against a repeating triangular line profile (fract of a dotted coordinate), and thresholds with a contrast slope. Angle rotates the lines, Scale sets their frequency, and Skew/Stretch shear them.

> **Note.** Shader-only. The verbatim HgcLineScreen Metal shader is checked in under evidence/shaders/; not yet ported to TS.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor of the line pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0.4992 | 0.4992 .. 1.571 | Rotation of the lines, radians (default ~0.5). |
| Scale | float | 10 | 10 .. 22 | Line frequency / spacing, ~10-22 (default 10). |
| Skew | float | 0 | 0 .. 0.21 | Shears the line pattern, 0-0.21 (default 0). |
| Stretch | float | 0 | 0 .. 0.34 | Stretches the line cells, 0-0.34 (default 0). |
| Contrast | float | 0.5 | 0 .. 0.5 | Threshold slope / hardness of the lines (shader hg_Params[2]), 0-0.5 (default 0.5). |
| Mix | float | 1 | 0.5 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented.** A verbatim `HgcLineScreen` Metal shader is checked in under `engine/src/compositor/filters/evidence/shaders/HgcLineScreen.metal` (Phase-1 done, Phase-2 open).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcLineScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcLineScreen.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcLineScreen
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Line Screen is a **halftone line pattern**: it builds a periodic triangle wave across the frame at a
chosen angle/frequency, and thresholds the image's luma against it so dark areas fill with thicker
lines (classic newsprint/engraving look).

```
uv   = (texCoord + offset - Center) * scale                 // hg_Params[3],[0],[4]
phase= dot(uv, hg_Params[1])                                // project onto the line direction+freq
tri  = fract(phase);  tri = 2*min(tri, 1-tri)               // triangle wave 0..1 (line profile)
lum  = dot(color0, hg_Params[5])                            // image luma (weights in slot 5)
v    = clamp((lum - tri) * hg_Params[2] + 0.5, 0, 1)        // threshold luma against the line wave
out.rgb = v * color0.a                                      // (re-premultiplied)
```

`hg_Params[1]` encodes **Angle + Frequency** (its direction sets the line angle, its magnitude the
lines-per-unit); `hg_Params[2]` = **contrast/hardness** of the lines; `hg_Params[5]` = luma weights.
The `2·min(t,1−t)` is the triangle wave that gives symmetric line thickness. Head-start: generate
the triangle screen procedurally, threshold against luma; map Angle→direction of `hg_Params[1]`,
Frequency→its length.

