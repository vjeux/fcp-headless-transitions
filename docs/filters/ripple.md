# Ripple

- **PAE class:** `Ripple`
- **Plugin UUID:** `F6D546C6-5F27-4E9D-9814-960565D6F403`
- **Node names in corpus:** Ripple (5)
- **Corpus usage:** 5 files, 5 instances

## What it does

Ripple sends concentric circular waves rippling out from Center, displacing pixels radially like a stone dropped in water. Amplitude sets the wave height; animate it (or Center) for an expanding ripple.

> **Note.** Not implemented; description is the standard Apple Motion "Ripple" distortion filter. Amplitude was sampled as int in a tiny corpus (5 files) — treat as continuous.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amplitude | float | 50 | 0 .. 4 | Height/strength of the ripple waves (default ~50; corpus samples 0-4). Continuous float. *(keyframed in 1 instance)* |
| Center | point2D | - | - | Center the ripples emanate from (X,Y) in normalized frame coordinates. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend, 0-1 continuous. NOT a boolean. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Publish OSC`, `Crop`, `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAERipple canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

```
d      = texCoord - Center
r      = length(d);  dir = d/r
wave   = Amplitude · sin(r · Frequency·2π - Phase)   // concentric sine of radius
uv     = Center + dir · (r + wave)                    // push samples along the radius
out    = sample(source, uv)
```

Params: **Amplitude** (ripple height), **Frequency/Wavelength** (rings), **Phase** (animate →
expanding ripples), **Center**. Simpler cousin of Droplet (pure sine vs Droplet's piecewise
profile). Head-start: radial backward-warp with the sine-of-radius displacement.

