# Refraction

- **PAE class:** `Refraction`
- **Plugin UUID:** `F6CC79AD-7C35-4AB0-BF10-527994BCD143`
- **Node names in corpus:** Refraction (18), Refraction copy (1), Distortion (1)
- **Corpus usage:** 19 files, 20 instances

## What it does

Refraction distorts the image as if seen through a bumpy refractive surface, displacing each pixel by the gradient of a height map (by default derived from the image itself). Refraction sets the displacement strength and Softness blurs the height map for smoother, glassier bending.

> **Note.** Not implemented; description is the standard Apple Motion "Refraction" filter. The Height Map / Map Channel params are internal image-input wiring.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Softness | float | 0.25 | 0 .. 1 | Blur applied to the height field before refracting, 0-1 (default 0.25). Continuous float. |
| Refraction | float | 100 | 0 .. 200 | Displacement strength; how strongly pixels bend, ~0-200 (default 100). *(keyframed in 2 instances)* |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. *(keyframed in 1 instance)* |
| Height Map | float | 0 | 0 .. 3331531719 | *(unverified)* |
| Map Channel | bool | 0 | 0 .. 0 | *(unverified)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded — HgcRefraction)

_RE'd from the `HgcRefraction` embedded shader (supersedes the earlier estimate in this doc)._

Refraction bends the image using the **gradient of a height map** as a displacement — light passing
through a bumpy glass surface. It reads a height texture (`hg_Texture0`) via 4 neighbor taps, forms
a 2-D gradient, scales it, and offsets where the source (`hg_Texture1`) is sampled.

```
base = (dot(texCoord1, hg_Params[2]), dot(texCoord1, hg_Params[3]))   // base coords (matrix rows)
gy   = dot(hg_Params[4], sampleDown  - sampleUp)     // height-map y gradient (taps texCoord2/…)
gx   = dot(hg_Params[4], sampleRight - sampleLeft)   // height-map x gradient
grad = (gx, gy, 0)
disp = grad * hg_Params[9] + base                    // hg_Params[9] = Refraction strength (index)
uv.x = dot(disp, hg_Params[0])                       // through the output matrix rows
uv.y = dot(disp, hg_Params[1])
out  = sample(source, (uv + hg_Params[26].xy)*hg_Params[26].zw)
```

`hg_Params[9]` = **Refraction** (displacement strength ∝ IOR), `hg_Params[4]` = the channel weights
that turn the height texture into a scalar height, the neighbor taps form the gradient. **Softness**
(this filter's other knob) blurs the height map before the gradient — a smoother glass. Head-start:
build/blur a height field, take its gradient, gather source at `uv + strength·grad`. (Note: the TS
engine's `underwater.ts` currently backs this UUID; a dedicated refraction implementation would use
the height-gradient warp above.)
