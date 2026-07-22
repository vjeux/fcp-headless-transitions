# Slit Tunnel

- **PAE class:** `Slit Tunnel`
- **Plugin UUID:** `D7186443-2103-465D-A035-40C390F236EB`
- **Node names in corpus:** Slit Tunnel (2), Circles (1)
- **Corpus usage:** 2 files, 3 instances

## What it does

Slit Tunnel projects the image into a receding tunnel using slit-scan: a single strip is extruded toward Center with Perspective controlling the depth foreshortening and Speed the scroll rate, with an optional glowing tunnel edge. Used for hyperspace/tunnel transitions.

> **Note.** Not implemented; description is the standard Apple Motion "Slit Tunnel" filter. (unverified) exact slit-scan geometry.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Vanishing point of the tunnel (X,Y) in normalized frame coordinates. |
| Speed | float | 100 | 150 .. 150 | Scroll rate down the tunnel (default 100). |
| Perspective | float | 0.5 | 0.2 .. 0.2 | Depth foreshortening of the tunnel, ~0.2-0.5 (default 0.5). |
| Glow Color | color | - | - | Color of the tunnel edge glow. |
| Glow | float | 0.05 | 0 .. 0 | Intensity of the tunnel glow (default 0.05). Continuous float, NOT a boolean. *(keyframed in 2 instances)* |

## FxPlug plumbing

No extra plumbing parameters recorded. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcSlitTunnel.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcSlitTunnel.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcSlitTunnel
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Slit Tunnel maps the image into an infinite **perspective tunnel** using polar coordinates: the
angle around the center picks a column of the source, and `1/radius` gives depth (so content
recedes to a vanishing point).

```
d      = texCoord - Center + offset          // hg_Params[0], [7]
x      = dot(d, hg_Params[9].xy)             // rotated coords
z      = dot(d, hg_Params[10].xy)
// fast atan2 approximation (the c0/c1 polynomial constants are a minimax atan):
angle  = atan2_approx(z, x)                  // → tunnel "around" coordinate
depth  = 1 / max(|x|,|z|)                    // → tunnel "into" coordinate (1/r perspective)
u      = angle * (1/2π) + 0.5                // wrap angle to [0,1]  (c2.x = 0.15915 = 1/2π)
v      = depth * Speed + scroll              // move down the tunnel (animate scroll)
out    = sample(tunnelTexture, (u, v))       // hg_Texture1 = the wall texture / source tiled
```

The constants `0.15915≈1/2π`, `1.5708≈π/2`, `3.1416≈π` and the small polynomial `c0` are a
minimax **atan2** — the tell for a polar/tunnel mapping. `hg_Params[9]/[10]` = orientation,
`hg_Params[0]` = center. Head-start: polar transform (angle→u, 1/r→v), scroll v over time for the
fly-through; tile the source as the tunnel wall.

