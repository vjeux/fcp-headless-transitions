# Bloom

- **PAE class:** `Bloom`
- **Plugin UUID:** `5599C557-CDC0-4112-B2C4-355E9A1A902E`
- **Node names in corpus:** Bloom (27), Bloom copy (4)
- **Corpus usage:** 18 files, 31 instances

## What it does

Bloom is a light-bloom filter: it isolates pixels brighter than a threshold, blurs them, and screens the glowing result back over the image so highlights bleed and "bloom". In this engine it is served by the shared glow module. Amount is the blur/spread of the bloom, Threshold the brightness cutoff, and Brightness the intensity of the added glow.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Amount | float (pixels) | 7 | 10 .. 32 | Blur radius / spread of the bloom, ~10-32 (default 7). *(keyframed in 1 instance)* |
| Brightness | float | 70 | 51 .. 100 | Intensity of the added glow, ~51-100 (default 70). *(keyframed in 1 instance)* |
| Threshold | float | 75 | 0 .. 94 | Brightness cutoff above which pixels bloom, ~0-94 (default 75). |
| Mix | float | 1 | 0.15 .. 1 | Wet/dry blend, 0-1 continuous. *(keyframed in 2 instances)* |
| Horizontal | float (percent) | 100 | 0 .. 100 | Horizontal scale of the bloom spread, percent (default 100). |
| Vertical | float (percent) | 100 | 0 .. 100 | Vertical scale of the bloom spread, percent (default 100). |

## FxPlug plumbing

Non-creative host parameters on this filter: `Clip to White`, `Crop`, `Flip`, `Input Points`, `360° Aware`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/glow.ts`](../../engine/src/compositor/filters/glow.ts).

> 2 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm (decoded)

_PAEBloom — HDR highlight bloom (shipped in `glow.ts` `bloomFilter`, float path)._

```
hi     = max(src·GainMultiplier - Threshold, 0)     // ×N highlight extract in FLOAT (keeps >1.0)
blur   = decimatedBlurFloatRGB(hi, Amount/6.10)      // multi-level HGBlur in Float32 (headroom!)
out    = src + blur · Intensity                       // add the bloom (screen/add)
```

The **float buffer** is essential: an 8-bit store would clip the ×10 highlight extract to 1.0 and
lose the energy that blooms the frame to white (see `gaussian-blur.ts` float path). Params:
**Amount** (bloom radius), **Threshold**, **Intensity/Brightness**. Head-start: extract highlights
in float, decimated float Gaussian, add back. Shipped + verified.
