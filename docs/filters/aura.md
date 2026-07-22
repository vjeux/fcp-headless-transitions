# Aura

- **PAE class:** `Aura`
- **Plugin UUID:** `2E01612E-7A80-42B5-8767-9F3E58679DDD`
- **Node names in corpus:** Aura (21)
- **Corpus usage:** 16 files, 21 instances

## What it does

Aura wraps a soft glowing halo around the subject, similar to Outer Glow but with separate inner and outer radii defining a ring of brightness. Brightness sets its intensity; the two radii shape where the aura starts and ends.

> **Note.** Not implemented; description is the standard Apple Motion "Aura" glow filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Inner Radius | float (pixels) | 2 | 0 .. 22 | Inner edge of the aura ring, ~0-22 (default 2). |
| Outer Radius | float (pixels) | 10 | 0 .. 22 | Outer edge of the aura ring, ~0-22 (default 10). |
| Brightness | float | 70 | 40 .. 100 | Intensity of the aura, ~40-100 (default 70). |
| Mix | float | 1 | 0 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 1 instance)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Clip to White`, `Crop`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm (decoded)

_RE'd from the `HgcAura` embedded shader. Decoded functional form:_

Aura is the **combine stage of a glow/aura**: it adds a blurred, brightened copy of the image
(`color0`, produced upstream) on top of the original (`color1`), clamped to a ceiling color.

```
aura   = color0 * hg_Params[0]            // blurred copy × Intensity (per-channel)
out    = color1 + aura                    // add the aura over the original
out.a  = min(out.a, 1)
out.rgb= min(out.rgb, hg_Params[1].rgb)   // clamp to a max color (prevents blowout / tints the aura ceiling)
out    = max(out, 0)
```

`hg_Params[0]` = **Intensity** (aura brightness, per-channel), `hg_Params[1]` = the **aura color
ceiling** (caps and tints the glow). The blur radius that builds `color0` = **Radius/Size**. So Aura
= additive bloom with a colored clamp. Head-start: blur+brighten source → add → clamp to aura color.
