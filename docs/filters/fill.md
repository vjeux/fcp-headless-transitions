# Fill

- **PAE class:** `Fill`
- **Plugin UUID:** `47D6B897-5749-4A6A-B93B-00FABCF72B25`
- **Node names in corpus:** Fill (1224), Fill 1 (31), Fill copy (27), Fill 2 (27), Fill 3 (12), Shade (6)
- **Corpus usage:** 531 files, 1351 instances

## What it does

Fill replaces every visible pixel's RGB with a single solid Color (or a gradient, unused by the shipping transitions) while preserving the layer's alpha, so it recolors the shape without painting over the transparent surround. Blended by Mix, it is used to flat-color a layer that a downstream keyer or wipe then reveals. Verified faithful to FCP's HgcFillColor shader (recolor + re-premultiply by original alpha).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Fill With | enum(int) | 0 | 0 .. 1 | Mode: 0 = solid Color, 1 = Gradient. The shipping transitions always use Color mode. |
| Color | color | - | - | The solid fill color (nested Red/Green/Blue 0-1 floats) applied to every visible pixel when Fill With = Color. *(keyframed in 6 instances)* |
| Gradient | group | - | - | Gradient definition (RGB stops, Opacity, Start/End points, Type) used when Fill With = Gradient. Empty in the corpus templates. |
| Mix | float | 1 | 0 .. 1 | Blend of the fill toward the original per channel: out.rgb = input + (fill - input) * Mix. 0 = untouched, 1 = fully the fill color. Continuous. *(keyframed in 30 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/fill.ts`](../../engine/src/compositor/filters/fill.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm (decoded)

_PAEFill — solid/gradient fill blended by Mix (shipped in `fill.ts`, decoded from its shader)._

```
fill.rgb = hg_Params[0].xyz        // Fill Color
fill.a   = 1.0                      // fill alpha forced opaque
out      = mix(src, fill, hg_Params[1]) * src.a   // lerp toward fill by Mix, RE-PREMULTIPLY by ORIGINAL alpha
```

`hg_Params[0]` = **Color**, `hg_Params[1]` = **Mix**. When "Fill With" = gradient it fills with a
Gradient generator instead of a solid (unused by the 65 built-ins). The re-premultiply by the
*original* alpha is the subtle correctness point (keeps edges). Head-start: the 3 lines above.
