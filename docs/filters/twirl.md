# Twirl

- **PAE class:** `Twirl`
- **Plugin UUID:** `42D649CE-8CAA-4BCC-8F59-50E1009B03CE`
- **Node names in corpus:** Twirl (491), OSC (52), Control (40), PRS (34), Rotate (28), Twirl copy (6)
- **Corpus usage:** 492 files, 693 instances

## What it does

Twirl applies a swirling rotational distortion around a center point: pixels near the center are rotated most and the rotation falls off with radius, spiraling the image like water down a drain. The `Twirl` angle sets how many radians of spin at the core and `Amount` scales the effect radius/strength. Used for vortex, dizzy, and dissolve-into-a-whirl transition effects.

> **Note.** Not implemented in the TS engine; description is the standard Apple Motion "Twirl" filter. The exact radial falloff curve is unverified here.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Twirl | float (radians) | pi (3.1416) | -6.083 .. 9.069 | Swirl angle at the center in radians (default pi ~= 3.1416, a half-turn). Negative values swirl the opposite direction; the twist decreases toward the edges. *(keyframed in 7 instances)* |
| Amount | float | 0.5 | 0 .. 1 | Scales the strength / falloff radius of the swirl, 0-1. 0 = no distortion. (Corpus mis-sampled the type; this is a continuous float.) *(keyframed in 3 instances)* |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend of the twirled result over the original, 0-1 continuous. NOT a boolean despite only 0/1 being sampled. |
| Center | point2D | - | - | Center of the swirl (X,Y) in Motion's normalized frame coordinates, (0.5,0.5) = frame center. *(keyframed in 2 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm (decoded)

_RE'd from the `HgcTwirl` embedded fragment shader (via `tools/re/extract_shader.py HgcTwirl`).
The math below is the decoded functional form; verbatim Apple source is not reproduced here._

Per output pixel at texture coord `p`, with center `C = hg_Params[0].xy`, aspect scale
`asp = hg_Params[2]` (`.xy` forward, `.zw` inverse), max radius `Rmax = hg_Params[1].x`, and peak
angle `A = hg_Params[1].y` (radians):

```
d      = (p - C) * asp.xy              // recentre + aspect-correct
r      = length(d)                     // radius from center
t      = clamp(r / Rmax, 0, 1)         // normalized radius, 0 at center → 1 at Rmax
falloff = 2*t^3 - 3*t^2 + 1            // smoothstep(1→0): full twist at center, 0 past Rmax
angle  = A * falloff                   // this pixel's rotation
d'     = rotate(d, angle)              // 2D rotation by angle
uv     = d' * asp.zw + C               // undo aspect, re-centre
out    = sample(source, uv)            // (pixels sampled outside the frame → transparent)
```

**Key insight:** the twist is *not* linear in radius — it uses the Hermite smoothstep polynomial
`2t³−3t²+1` so the rotation is strongest at the center and eases smoothly to zero at `Rmax`,
giving the characteristic soft whirlpool (a naive `angle·(1−r/Rmax)` looks visibly conical/wrong).

**Parameter → slot mapping** (to confirm against `-[PAETwirl canThrowRenderOutput:]` disasm):
- `hg_Params[0].xy` ← **Center** (point2D, frame-normalized).
- `hg_Params[1].x`  ← **Amount**-derived max radius `Rmax`.
- `hg_Params[1].y`  ← **Twirl** angle in radians (the corpus default π ≈ half-turn at center).
- `hg_Params[2]`    ← aspect-ratio correction (`.xy` forward, `.zw` inverse) so the twirl stays circular on non-square frames.
- `hg_Params[3]`, `hg_Params[4]` ← crop/offset bounds (the trailing `fmin` chain clamps to the valid region → transparent outside).

**Implementation note:** sample with clamp-to-transparent outside `[0,1]`; the falloff makes this a
pure backward-warp (gather), so it parallelizes trivially and needs no accumulation buffer.
