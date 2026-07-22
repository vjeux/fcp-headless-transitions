# Disc Warp

- **PAE class:** `Disc Warp`
- **Plugin UUID:** `182BAC6C-B38A-4B1D-9269-8190FD1E5C42`
- **Node names in corpus:** Controller (107), Disc Warp (100), Main OSC (8)
- **Corpus usage:** 215 files, 215 instances

## What it does

Disc Warp wraps the image around a disc/tube: pixels within a Radius of the Center are bent onto a circular surface, producing a bulging cylindrical/spherical warp inside the disc and leaving the outside untouched. It is used for lens-like, orb, and tunnel transition looks.

> **Note.** Not implemented in the TS engine and no checked-in shader; described from the standard Motion "Disc Warp". The exact mapping (cylinder vs sphere) is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the disc (X,Y) in normalized frame coordinates, (0.5,0.5) = frame center. |
| Radius | float (pixels) | 150 | 61.58 .. 605 | Radius of the warped disc in pixels (default 150). Pixels inside this radius are warped; outside is unaffected. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the warped result over the original, 0-1 continuous. NOT a boolean (only 1 sampled in corpus). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcDiscWarp.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcDiscWarp.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcDiscWarp
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Disc Warp is a **radial reciprocal warp** — it bends the image around a center as if projected onto
a disc/dome, pushing pixels outward with an inverse-radius term so content near the center balloons
outward and the rim compresses.

```
d    = texCoord * hg_Params[1].xy + hg_Params[1].zw   // recentre+scale into disc space
r    = length(d)
dir  = d / r                                           // unit direction (guarded when r≈0)
// reciprocal warp: new radius = r - 1/(r·Amount), clamped to ≥0 past the disc edge
warp = (r*Amount) - 1/(r*Amount)
warp = max(warp, 0) * Amount2                          // hg_Params[0].x = Amount, .y = strength
uv   = dir * warp
uv   = uv * hg_Params[2].xy + hg_Params[2].zw          // undo center/scale
uv   = (uv + hg_Params[3].xy) * hg_Params[3].zw        // final offset+scale
out  = sample(source, uv)
```

The `r − 1/r` reciprocal is the signature of the disc/dome bulge (vs Bulge's polynomial or Twirl's
rotation). `hg_Params[0].x/.y` = **Amount / rim strength**. Head-start: backward-warp gather with a
reciprocal radial map centered on the disc; decode `-[PAEDiscWarp ...]` for the exact
Amount→scale constants. (Corpus display name is often "Controller".)

