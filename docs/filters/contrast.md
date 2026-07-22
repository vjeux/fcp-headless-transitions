# Contrast

- **PAE class:** `Contrast`
- **Plugin UUID:** `B13B57AC-811B-4A24-BB5A-2167A3C66F5F`
- **Node names in corpus:** Contrast (165), Contrast copy (49), Contrast 1 (3), C (2), c 2 (1), c 1 (1)
- **Corpus usage:** 136 files, 224 instances

## What it does

Contrast applies an S-shaped tone curve around a Pivot point: for Contrast < 1 it compresses tones toward the pivot (flatter), for Contrast > 1 it expands them (punchier). FCP builds the curve as a cubic Bezier (a rotation of the y=x line by an angle derived from Contrast), so it is NOT a simple scale-around-mid. Reverse-engineered (CONTRAST_RE.md) but not yet shipped, because an affine approximation is faithful only for Contrast < 1.

> **Note.** Reverse-engineered in evidence/CONTRAST_RE.md; not implemented (the Bezier LUT must be reproduced exactly rather than fitted). For Contrast < 1 the transfer is nearly affine with a fixed point around code 61-62 (NOT 128); for Contrast > 1 it is a genuine S-curve.

## Parameters

Only the creative parameters are listed. Ranges are the *typical values observed in the corpus*, not Apple-documented limits.

| Parameter | Type | Default | Typical range | What it controls |
|---|---|---|---|---|
| Contrast | float | 1 | 0.3 .. 3 | Contrast strength, 0.3-3. 1 = identity, <1 flattens (compress toward pivot), >1 punches up (expand). The primary knob. *(keyframed in 3 instances)* |
| Pivot | float | 0.5 | 0 .. 1 | The tonal fixed point the curve rotates around, 0-1 (default 0.5). Pixels at the pivot luminance are unchanged. *(keyframed in 2 instances)* |
| Smooth Contrast | bool | 0 | 0 .. 1 | Toggle: use the smoother Bezier ease vs a harder curve. |
| Luminance Only | bool | 0 | 0 .. 1 | Toggle: apply the contrast to luminance only (preserve chroma) rather than per-channel RGB. |
| Clip Color Values | enum(int) | 0 | 0 .. 3 | Out-of-range clamping mode, 0-3. |
| Mix | float | 1 | 1 .. 1 | Wet/dry blend of the contrasted result over the original, 0-1 continuous. NOT a boolean (only 1 sampled). *(keyframed in 5 instances)* |

## FxPlug plumbing

Non-creative host parameters on this filter: `Flip`, `Input Points`. These are standard FxPlug/host boilerplate parameters shared by every Motion filter (on-screen-control plumbing, input-point handshakes, edge cropping, 360-degree awareness, HDR/scaling flags). They are not creative controls -- see the [README](README.md#fxplug-plumbing-parameters) for the full explanation.

## Implementation status

**Not implemented** (corpus-exercised; no dedicated shader extracted yet).

> 4 localized (non-English) parameter duplicate(s) were merged/omitted from the parameter table above.

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEContrast canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

```
c    = rgb / max(a,1e-6)
out  = clamp( (c - 0.5) * (1 + Contrast) + 0.5, 0, 1 ) * a    // expand/compress around 0.5
```

`Contrast` (corpus ~[0, 0.43]) is the gain about the 0.5 pivot; >0 increases contrast. See
`evidence/CONTRAST_RE.md` for the exact pivot/gain mapping decoded from `-[PAEContrast ...]`.
Head-start: the pivot-scale line above.

