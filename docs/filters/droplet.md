# Droplet

- **PAE class:** `Droplet`
- **Plugin UUID:** `0ACFAE37-4FAF-4D60-A50C-46E422EE0CD7`
- **Node names in corpus:** Droplet (8), Droplet 2 (4), Droplet 1 (4), Droplet 4 (3), Droplet 3 (3), Droplet 5 (1)
- **Corpus usage:** 8 files, 35 instances

## What it does

Droplet simulates a water droplet/ripple lens on the image: a circular ring at Center refracts the picture like a bead of water, with Radius/Thickness shaping the droplet's lens ring and Height its bulge. Radius is typically animated to make the droplet expand.

> **Note.** Not implemented; description is the standard Apple Motion "Droplet" filter. Radius is animated per-instance (kept internal here).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Thickness | float (pixels) | 40 | 30 .. 100 | Thickness of the droplet's refractive ring, ~30-100 (default 40). *(keyframed in 17 instances)* |
| Height | float | 30 | -50 .. 50 | Bulge height of the droplet lens, ~-50..50 (default 30). *(keyframed in 18 instances)* |
| Center | point2D | - | - | Center of the droplet (X,Y) in normalized frame coordinates. *(keyframed in 1 instance)* |
| Mix | float | 1 | 0.9 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 9 instances)* |
| Radius | unknown | - | - | *(unverified)* *(keyframed in 35 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcDroplet` embedded shader. Decoded functional form:_

Droplet is a **concentric ripple warp** — like a water drop hitting the surface, it displaces pixels
radially by a periodic (piecewise-polynomial) wave of the radius.

```
d      = texCoord * hg_Params[0].xy + hg_Params[0].zw   // recentre+scale
r      = length(d);  dir = d / r
phase  = r * hg_Params[2].x + hg_Params[2].y            // ripple frequency + phase offset
w      = phase - floor(phase)  →  piecewise smooth wave  // (the cascade of clamp/select builds a
         // smooth triangular/cubic ripple profile repeating every cycle)
disp   = wave(w)                                         // signed radial displacement per ring
uv     = (r + disp)*dir → back through center+scale
out    = sample(source, uv)
```

`hg_Params[2].x` = **ripple frequency** (rings per unit = Amount/Wavelength), `.y` = **phase** (animate
this → expanding ripples), `hg_Params[0]` = center+scale. The piecewise polynomial (the
`clamp(...)²·(3−2·)` chain) is a smooth repeating ring profile. Head-start: radial backward warp with
a periodic displacement of `r`; animate phase for the drop spreading outward.
