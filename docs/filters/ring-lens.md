# Ring Lens

- **PAE class:** `Ring Lens`
- **Plugin UUID:** `9F1EEA3B-85F9-4D8F-AAE4-E4134D502D2D`
- **Node names in corpus:** Ring Lens (1), Ring Lens 2 (1), Ring Lens 3 (1)
- **Corpus usage:** 2 files, 3 instances

## What it does

Ring Lens refracts the image through a circular ring lens at Center: a torus-shaped glass ring bends the picture where the ring sits (like looking through a magnifying ring), controlled by Radius, ring Thickness, and Refraction index.

> **Note.** Not implemented; description is the standard Apple Motion "Ring Lens" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the ring lens (X,Y) in normalized frame coordinates. *(keyframed in 2 instances)* |
| Radius | float (pixels) | 160 | 342.7 .. 777 | Radius of the ring, ~340-780 (default 160). |
| Thickness | float | 0.43 | 0.78 .. 1 | Thickness of the ring band, ~0.78-1 (default 0.43). |
| Refraction | float | 1.7 | -1.5 .. 1.97 | Refraction strength/index of the ring glass, ~-1.5..2 (default 1.7). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcRingLens.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcRingLens.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcRingLens
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Ring Lens magnifies the image inside an **annulus** (a ring-shaped lens): pixels whose radius falls
within a band are pushed/pulled radially (magnified), with smooth falloff at both edges of the ring.

```
d     = texCoord * hg_Params[4].xy + hg_Params[4].zw    // recentre+scale
r     = length(d);  dir = d/r
mag   = r * hg_Params[0].x + hg_Params[0].y             // lens magnification mapping of radius
// two smoothstep bands define the ring's inner and outer soft edges (hg_Params[2].x/.y):
inner = smoothstep-fade(r around hg_Params[2].x)
outer = smoothstep-fade(r around hg_Params[2].y)
lensAmt = inner * outer                                 // 1 inside the ring, 0 outside
r'    = mix(r, mag, lensAmt)                            // apply magnification only within the ring
uv    = dir * r' → back through center/scale
out   = sample(source, uv)
```

`hg_Params[0]` = **magnification** slope/offset, `hg_Params[2].x/.y` = **inner/outer ring radius**.
The two `x²·(3−2x)` smoothsteps are the soft ring edges. Head-start: radial warp gated by a ring
mask; only the annulus is magnified, giving the loupe-ring look.

