# Vignette

- **PAE class:** `Vignette`
- **Plugin UUID:** `EB96FF9E-5863-4770-B7B5-65CB9BBF8E3B`
- **Node names in corpus:** Vignette (53), Vignette copy (1)
- **Corpus usage:** 48 files, 54 instances

## What it does

Vignette darkens (and optionally desaturates) the frame toward the corners using a radial smoothstep mask: the center stays clear out to a Size radius, then falls off over a Falloff band to a darkened edge set by Darken. Implemented and verified faithful (32-44 dB) to the HgcVignette shader.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Size | float | 0.6 | 0.4799 .. 1.353 | Radius of the clear (unvignetted) center, ~0.48-1.35 (default 0.6). Larger = the clear area reaches farther out. |
| Darken | float | 0.3 | 0 .. 1 | How dark the vignetted edge gets, 0-1 (default 0.3). 0 = no darkening, 1 = edge goes to black. |
| Falloff | float | 0.5 | 0.2129 .. 1 | Softness of the inner->outer transition band, ~0.21-1 (default 0.5). Larger = a wider, softer gradient. |
| Saturation | float | 0.3 | -0.27 .. 1 | Desaturation toward the edge, -0.27..1 (default 0.3). Continuous float; pulls edge color toward gray. |
| Blur Amount | float (pixels) | 4 | 0 .. 47 | Optional blur of the vignetted edge, 0-47. |
| Center | point2D | - | - | Center of the vignette (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 0.0312 .. 1 | Wet/dry blend of the vignetted result over the original, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Prescale Input`, `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/vignette.ts`](../../engine/src/compositor/filters/vignette.ts). Reverse-engineered against the verbatim `HgcVignette` Metal shader.

## Algorithm (decoded)

_RE'd from `HgcVignette` (verification in `../../engine/src/compositor/filters/evidence/VIGNETTE_VERIFICATION.md`; shipped in `vignette.ts`, verified 32–44 dB)._

Radial darkening mask with a smooth falloff band:

```
d      = (texCoord*2 - 1 - Center) · aspect     // centred, aspect-corrected coords
r      = length(d)
t      = clamp((r - (Size - Falloff)) / Falloff, 0, 1)   // 0 inside Size, →1 across the Falloff band
mask   = smoothstep(t)                                    // soft ring
out.rgb= mix(src.rgb, src.rgb*Darken, mask)               // darken toward the edges
```

`hg_Params[0]` = Center, `[1]` = radius/falloff (Size, Falloff), Darken = edge brightness. Optional
desaturation toward the rim uses the same mask.
