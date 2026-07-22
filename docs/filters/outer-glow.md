# Outer Glow

- **PAE class:** `Outer Glow`
- **Plugin UUID:** `A7077089-AA05-44F8-98E8-0C90E446F447`
- **Node names in corpus:** Outer Glow (52), Outer Glow copy (6)
- **Corpus usage:** 29 files, 58 instances

## What it does

Outer Glow adds a soft colored halo radiating outward from the bright/opaque areas of the image (typically text or a keyed subject). Radius sets how far the halo spreads, Brightness how intense it is, and the Range picks how much of the tonal range is treated as "glowing". Inner and Outer colors tint the near and far parts of the halo.

> **Note.** Not implemented; description is the standard Apple Motion "Outer Glow" filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Inner Color | color | - | - | Tint of the halo close to the source edge. |
| Outer Color | color | - | - | Tint of the halo at its outer extent. |
| Radius | float (pixels) | 2 | 0 .. 300 | How far the glow spreads outward, ~0-300 (default 2). *(keyframed in 1 instance)* |
| Brightness | float | 15 | 0 .. 100 | Intensity of the glow, ~0-100 (default 15). |
| Range | float | 0.25 | 0 .. 1 | Portion of the tonal range treated as the glow source, 0-1 (default 0.25). |
| Mix | float | 1 | 0.4 .. 1 | Wet/dry blend, 0-1 continuous. |
| Horizontal | float (percent) | 100 | 100 .. 100 | Horizontal scale of the glow spread, percent (default 100). |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical scale of the glow spread, percent (default 100). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_PAEOuterGlow — glow confined to outside the alpha edge (glow family, HGBlur)._

```
blur   = gaussianBlur(alphaOrHighlights, Amount/6.10)   // shared HGBlur
outer  = max(blur - originalAlpha, 0)                    // keep only the part OUTSIDE the object
out    = composite(src, outer · Intensity · Color)       // add glow around the silhouette
```

Params: **Amount** (glow radius), **Intensity**, **Color**. Differs from Glow by masking the blur to
the region *outside* the source's alpha (a halo, not an internal bloom). Head-start: blur the alpha,
subtract the original alpha, tint and composite behind/around.
