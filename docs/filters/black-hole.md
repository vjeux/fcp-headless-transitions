# Black Hole

- **PAE class:** `Black Hole`
- **Plugin UUID:** `1A32EFEF-6687-401B-A078-300A7AE8F621`
- **Node names in corpus:** Black Hole (9), Black Hole In (2), infoOSC 2 (1), reflectX (1), Black Hole 1 (1), Black Hole 2 (1)
- **Corpus usage:** 11 files, 17 instances

## What it does

Black Hole warps the image radially as if pulled toward a gravitational point at Center: it displaces sample positions away from the center as a function of distance so the picture appears sucked inward, composited over the original. Amount is the pull strength (FCP UI: "Pulls an object toward a point"). Fully reverse-engineered: it is a MIP pyramid of radial-warp passes whose level count = max(1, round(log2(Amount/8))).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float | 150 | 0 .. 1000 | Pull strength toward the center, 0-1000 (default 150). Drives the number of warp pyramid levels. *(keyframed in 6 instances)* |
| Center | point2D | - | - | The gravitational center (X,Y) in normalized frame coordinates (default 0.5,0.5). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/blackhole.ts`](../../engine/src/compositor/filters/blackhole.ts).

## Ground-truth shader source

The authoritative per-pixel algorithm is the **verbatim extracted Metal fragment shader**, checked in at
[`../../engine/src/compositor/filters/evidence/shaders/HgcBlackHole.metal`](../../engine/src/compositor/filters/evidence/shaders/HgcBlackHole.metal). Regenerate/print it with:

```
venv/bin/python3 tools/re/extract_shader.py HgcBlackHole
```

That `.metal` file is the ground truth — implement against it, not against the notes below.

### Decoded notes (annotation of the shader above — verify against it)

Black Hole is a **gravitational-lens radial warp**: near a center, space is pulled inward with a
`1/r`-weighted displacement, so content spirals/sucks into the hole with a soft event-horizon edge.

```
p    = homography(texCoord, hg_Params[2..4])       // perspective-correct to working space (w-divide)
d    = p - Center                                   // Center = hg_Params[0]
r    = length(d);  dir = d/r
pull = clamp(r / Radius, 0, 1) * Strength + r       // hg_Params[1] = (Strength, Radius)
uv   = dir * (r_norm · pull) + Center               // displace inward, scaled by the 1/r term
uv   = homography(uv, hg_Params[5..7])              // back through inverse transform
out  = sample(source, uvToTexture(uv))
```

`hg_Params[1].x` = **Strength** (how hard it sucks), `.y` = **Radius** (event-horizon size),
`hg_Params[0]` = **Center**. The `clamp(r/Radius)·Strength + r` mapping is the lens profile — strong
near the center, fading to identity past the radius. Shipped in `blackhole.ts`; head-start is the
radial backward-warp above bracketed by the two homographies.

