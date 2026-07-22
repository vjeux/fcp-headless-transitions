# Neon

- **PAE class:** `Neon`
- **Plugin UUID:** `176021CD-2DFB-40FF-B3D4-9399F25C36C4`
- **Node names in corpus:** Neon (22), Glow (2)
- **Corpus usage:** 23 files, 24 instances

## What it does

Neon finds the edges in the image and lights them up like glowing neon tubing, adding a bright colored inner line and a softer outer glow around detected contours. Inner/Outer Glow set the two halo sizes, the Brightness enums pick their intensity tiers, and Edge Intensity controls how strongly edges are detected.

> **Note.** Not implemented; description is the standard Apple Motion "Neon" edge-glow filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Outer Brightness | enum(int) | 2 | 1 .. 2 | Intensity tier of the outer halo (1-2). |
| Outer Glow | float (pixels) | 45 | 1 .. 200 | Size of the outer glow halo, ~1-200 (default 45). |
| Inner Brightness | enum(int) | 2 | 1 .. 2 | Intensity tier of the inner glowing line (1-2). |
| Inner Glow | float (pixels) | 50 | 50 .. 65 | Size of the inner glow, ~50-65 (default 50). *(keyframed in 2 instances)* |
| Edge Intensity | float | 10 | 10 .. 15 | How strongly edges are detected/lit, ~10-15 (default 10). |
| Mix | float | 1 | 0.05 .. 1 | Wet/dry blend, 0-1 continuous. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAENeon canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

```
edges  = gradientMagnitude(src)                 // as in Edges filter (4-tap)
glow   = gaussianBlur(edges, Amount/6.10)        // shared HGBlur on the edge map
out    = composite(src or black, edges·CoreColor + glow·GlowColor·Intensity)
```

Params: **Amount** (glow radius), **Intensity**, core/glow **Color**s, **Threshold**. Bright neon
tubes = sharp edges; the halo = blurred edges, tinted. Head-start: detect edges, blur+tint for the
glow, add sharp edges on top.

