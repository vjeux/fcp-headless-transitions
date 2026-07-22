# Flop

- **PAE class:** `Flop`
- **Plugin UUID:** `2FF8887B-E673-4727-9601-1B3353531C10`
- **Node names in corpus:** Flop (383), Flip (64), Flop copy (30), Flop 1 (4), Flop 2 (3), Flop 5 (1)
- **Corpus usage:** 212 files, 487 instances

## What it does

Flop mirrors the layer about its center: horizontally (left<->right), vertically (top<->bottom), or both (a 180 deg point reflection). It is a lossless axis-aligned pixel permutation with no resampling. Implemented and verified faithful to FCP's pure geometric transform (there is no shader).

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Flop | enum(int) | 0 | 0 .. 2 | Mirror axis: 0 = Horizontal (mirror left/right), 1 = Vertical (mirror top/bottom), 2 = Both (180 deg point reflection). |
| Mix | float | 1 | 0 .. 1 | Host-level wet/dry blend, 0-1 continuous. Always 1 in the corpus; the filter itself is a hard mirror. |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Implemented.** TS module: [`engine/src/compositor/filters/flop.ts`](../../engine/src/compositor/filters/flop.ts).

> 1 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEFlop canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

A discrete **flip / 90°-rotate** selected by a mode enum — pure coordinate remap, no resampling
math beyond the axis swap/negate:

```
Flop mode → one of: identity | flip-H (x→1-x) | flip-V (y→1-y) | rotate 90/180/270 | transpose
out = sample(source, remap(texCoord))
```

The `Flip`/`Input Points` params (id 10002/10003) are host plumbing, unused by the filter. `Flop`
(the mode enum) is the only creative control. See `evidence/PAEFlop_DECOMPILE.md` for the full mode
table. Head-start: a switch over the 8 axis-aligned remaps.

