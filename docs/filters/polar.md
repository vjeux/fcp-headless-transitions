# Polar

- **PAE class:** `Polar`
- **Plugin UUID:** `937A3262-A691-4F18-9DB9-36B88D0A0FF7`
- **Node names in corpus:** Polar (11), Polar copy (2), Polar 2 (2), Polar 1 (2)
- **Corpus usage:** 10 files, 17 instances

## What it does

Polar converts the image between rectangular and polar coordinates: with Polar To Rect off it wraps the frame around Center (columns become concentric rings); with it on, it unwraps a polar image back to a rectangle. Used for tunnel/vortex and unwrap effects.

> **Note.** Not implemented; description is the standard Apple Motion "Polar" coordinate filter.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Center | point2D | - | - | Center of the polar mapping (X,Y) in normalized frame coordinates. |
| Polar To Rect | bool | 0 | 0 .. 1 | Direction of conversion: off = rect->polar (wrap), on = polar->rect (unwrap). |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`, `Publish OSC`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEPolar canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

Converts the image between Cartesian and polar coordinates (wrap a strip into a ring, or unwrap a
ring into a strip):

```
// Rect→Polar (mode 0):
d     = texCoord - Center
r     = length(d) / MaxRadius            // → v (or u)
θ     = atan2(d.y, d.x) / (2π) + 0.5     // → u (or v)
out   = sample(source, (θ, r))           // source read as a rectangular strip

// Polar→Rect (mode 1): inverse — (u,v) → (Center + v·MaxRadius·(cos,sin)(2π·u))
```

Params: **Mode** (rect→polar / polar→rect), **Center**, **MaxRadius**. Classic "polar coordinates"
filter (tiny-planet / ring text). Head-start: the atan2/length forward map (and its inverse for the
other mode). Tiny Planet is a preset of Polar (polar→rect with the horizon wrapped).

