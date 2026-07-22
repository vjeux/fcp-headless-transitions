# Hatched Screen

- **PAE class:** `Hatched Screen`
- **Plugin UUID:** `5A65EC34-AA97-4A6E-B40D-DFEFD46364C5`
- **Node names in corpus:** Hatched Screen (27), Hatched Screen copy (1), Hatched Screen Source (1)
- **Corpus usage:** 11 files, 29 instances

## What it does

Hatched Screen renders the image as a cross-hatched line-screen halftone: tone is represented by the density of hatching lines. Scale sets the hatch frequency, Angle rotates it, Skew/Stretch shear the pattern, and Contrast sets how sharply hatching switches on with darkness.

> **Note.** Not implemented; description is the standard Apple Motion "Hatched Screen" halftone filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Anchor point of the hatch pattern (X,Y) in normalized frame coordinates. |
| Angle | float (radians) | 0.4992 | 0 .. 0.7854 | Rotation of the hatching lines, radians (default ~0.5). |
| Scale | float | 10 | 1 .. 26 | Hatch line frequency / cell size, ~1-26 (default 10). |
| Skew | float | 0 | -1.41 .. 1.83 | Shears the hatch pattern, ~-1.4..1.8 (default 0). |
| Stretch | float | 0 | -0.37 .. 0.25 | Stretches the hatch cells, ~-0.4..0.25 (default 0). |
| Contrast | float | 0.5 | 0 .. 0.65 | How sharply hatching appears with tone, 0-0.65 (default 0.5). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcHatchedScreen.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcHatchedScreen.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcHatchedScreen
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Hatched Screen is a **cross-hatch** engraving: two perpendicular triangle-wave line sets are combined
and thresholded against the image luma (darker → denser hatching).

```
uv    = (texCoord + offset - Center) * Scale          // hg_Params[4],[0],[5]
u     = fract(dot(uv, hg_Params[1]))                  // line set 1 phase (Angle+Freq in slot 1)
v     = fract(dot(uv, hg_Params[2]))                  // line set 2 phase (perpendicular)
tu    = 2*min(u, 1-u)                                  // triangle wave → line profile
tv    = 2*min(v, 1-v)*0.5 + 0.5                        // second set, biased
hatch = min(tu, tv)                                    // crossing of the two hatch directions
lum   = dot(color0, hg_Params[6])                      // image luma
out   = clamp((lum - hatch)*hg_Params[3] + 0.5, 0, 1) * color0.a
```

`hg_Params[1]/[2]` = the two hatch directions (Angle) + frequencies, `hg_Params[3]` = contrast,
`hg_Params[6]` = luma weights. `min(tu,tv)` overlays the two line sets into a cross-hatch. Head-start:
two triangle screens at ±Angle, combine, threshold against luma.

