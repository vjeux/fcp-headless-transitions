

## Algorithm — NOT YET REVERSE-ENGINEERED

> ⚠️ **Unverified.** This filter has **no dedicated embedded `Hgc*` shader** to extract, so there is
> no ground-truth per-pixel source yet. The notes below are an *inferred sketch* from general
> Motion knowledge — they are **likely wrong in detail and must not be implemented as-is**.
>
> **To reverse-engineer it:** disassemble the CPU class with
> `otool -arch arm64 -tV` on `-[PAEBulge canThrowRenderOutput:withInput:withInfo:]` and `frameSetup:`
> in `Filters.bundle`, and chase the Helium/ProAppsFxSupport primitive it calls
> (e.g. `HGaussianBlur`, `HGLinearFilter::gaussian`). Blur-family filters delegate to the shared
> `HGBlur` primitive already decoded in `engine/src/compositor/filters/gaussian-blur.ts`.

### Inferred sketch (UNVERIFIED — do not treat as decoded)

```
d      = (texCoord - Center) · asp
r      = length(d) / Radius                     // normalized radius (Radius param)
if r < 1:
    f  = 1 + Amount · (1 - r²)                   // polynomial bulge: strong at center, 0 at rim
    d  = d · (1/f)                               // magnify (Amount>0) or pinch (Amount<0)
uv     = d/asp + Center
out    = sample(source, uv)                      // r≥1 passes through unchanged
```

Params: **Amount** (+ bulge / − pinch), **Radius** (extent), **Center**. The `(1−r²)` polynomial is
the classic bulge falloff (vs Twirl's rotation or Sphere's `1/sqrt`). Head-start: radial backward
warp with the quadratic magnification above.

