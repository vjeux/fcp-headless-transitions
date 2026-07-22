# Starburst

- **PAE class:** `Starburst`
- **Plugin UUID:** `2D69D3F6-6145-428B-905B-249A76E70830`
- **Node names in corpus:** Starburst (2)
- **Corpus usage:** 2 files, 2 instances

## What it does

Starburst radiates streaks of light outward from Center within a given Radius, creating a burst/explosion of rays from a point. Radius sets the burst size.

> **Note.** Not implemented; description is the standard Apple Motion "Starburst" filter. (unverified) exact ray geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Origin of the starburst (X,Y) in normalized frame coordinates. |
| Radius | float (pixels) | 50 | 120 .. 120 | Size of the burst, ~120 (default 50). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcStarburst.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcStarburst.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcStarburst
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Starburst is a **radial reciprocal warp** (`1/r` along the ray) — it stretches content into rays
shooting out from a center, giving a star/burst streak.

```
d    = (texCoord - Center) * asp.xy      // Center=hg_Params[0], asp=hg_Params[2]
r    = length(d);  dir = d/r
push = 1 / (r * hg_Params[1].x)          // reciprocal radial map (Amount = hg_Params[1].x)
uv   = dir * push * asp.zw + Center       // back through aspect/center
out  = sample(source, (uv+hg_Params[3].xy)*hg_Params[3].zw)
```

The `1/(r·Amount)` map means points near the center map far out (and vice-versa) → radial streaks.
`hg_Params[1].x` = **Amount** (ray length/strength), `hg_Params[0]` = **Center**. Head-start: radial
backward warp with reciprocal radius. (Very similar to Disc Warp; Starburst uses pure `1/r` without
the `−r` term, so it's a clean inversion burst.)

