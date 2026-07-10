# FCP 360° Gaussian Blur / Bloom — reverse-engineered from the real binary

Source of truth: `Filters.bundle/Contents/MacOS/Filters` (arm64) +
`Helium.framework`, disassembled with `otool -arch arm64 -tV`. This is what FCP's
real engine does for the 360°/Bloom family — NOT a guess.

## Why this matters
`360°__360°_Bloom` scores **5.14 dB** in our TS engine (near-garbage) AND is the
single slowest slug (**262 s**, ~30% of the whole batch). Both symptoms have the
same root cause: our TS engine treats the 4096×2048 equirect canvas as a flat image
and runs a naive clamp-edged planar Gaussian over all 8.85M pixels, then *squeezes*
(bilinear-resamples) the whole 2:1 panorama into 16:9. FCP does neither.

## The real filter dispatch (PAEGlow / PAEBloom, Filters binary)
- `-[PAEGlow getBlurNode:...:blurScale:is360:]` @ 0xce8b8 is a dispatcher:
  `cbz w6, planar` — **if `is360` == 0 → `getPlanarBlurNode`**, else `get360BlurNode`.
- Planar path (`getPlanarBlurNode` @ 0xce4ec) builds `HGaussianBlur::init(f,f,f,b,b,b)`
  — the ordinary separable Gaussian.
- 360 path (`get360BlurNode` @ 0xce324) builds `HEquirectGaussianBlur::init(...)`.
  It first calls `getInversePixelTransformForImage:` / `getPixelTransformForImage:`
  and computes the blur radius **in pixels from the pixel transform**:
  `radiusX = ceil(|invXform.a| * imageWidth)`, `radiusY = ceil(|invXform.d| * imageHeight)`
  (asm @ 0xce414–0xce448). So the blur size scales with the image's own pixel scale,
  not a raw constant.
- `-[PAEGlow getOutputWidth:height:]` grows the output canvas by `2*(2*radius)` on
  each axis (0xce2d8–0xce304) to hold the glow spread.

## HEquirectGaussianBlur::init (@ 0xd3640, Filters binary) — the real algorithm
Stored params: `s0=blurScale.x`(+0x198) `s1=blurScale.y`(+0x19c) `s2=amount`(+0x1a0),
`w1=radiusX`(+0x1a4) `w2=radiusY`(+0x1a8), and 4× PCVector4 = the pixel-transform rows.

Pipeline it composes:
1. **`NewEquirectWrapNode(PCVector2, PCVector4×4)`** (@ 0xd36b0) — handles the
   panorama's **horizontal 360° seam**: a blur near x=0 / x=W must sample from the
   opposite edge (the equirect wraps). Our naive blur CLAMPS at the edge instead.
2. **`HGaussianBlur::init(blurScale.x, amount, 0, 0,0,0)`** (@ 0xd36fc/0xd3734) — the
   ordinary separable Gaussian, applied inside the wrap node's space.
3. If `blurScale.y > 0` (fcmp @ 0xd374c, `b.le` skips): **`HgcEquirectToSinusoidal`**
   (@ 0xd3764) — reprojects equirect → sinusoidal so a uniform blur corresponds to
   the correct ANGULAR blur on the sphere (compensating the latitude stretch: near
   the poles, equirect massively oversamples longitude, so a flat blur there is far
   too wide). Blur is applied in the sinusoidal space, then reprojected back. The
   sinusoidal scale uses `k/radiusX`, `k/radiusY` constants (0xd37c8/0xd37e0).

So FCP's 360 blur = **seam-wrap + (optional) sinusoidal-reproject + separable Gaussian
+ inverse-reproject**, with the kernel sized from the pixel transform.

## Readback (oz_render.mm, already correct on the headless side)
For a wide equirect (`sceneBounds.w >= 3072`), FCP renders the full panorama then
reads back a **1920×1080 window CENTERED on the aperture center** (front-facing view):
`roi = { cx-960, cy-540, 1920, 1080 }`, `cx=-sb.x, cy=-sb.y`. It does NOT squeeze the
2:1 panorama into 16:9. Our TS engine's `resample(4096→1920)` squeeze is the geometry
bug behind the 5 dB.

## Implication for the TS engine (Bloom 5 dB + 262 s)
The correct + fast fix is the SAME change: stop rendering/squeezing the full 4096-wide
panorama. FCP only ever shows a 1920×1080 front-facing crop, and its blur is a
sphere-aware (wrap + sinusoidal) kernel, not a flat one. A faithful TS implementation
would (a) render/crop the front-facing 1920×1080 region and (b) apply the seam-wrap +
sinusoidal-scaled Gaussian only where it affects that crop — which is both correct
(closes most of the 5 dB gap) and ~4× less pixel work. This is a CORRECTNESS change
(moves Bloom's gate output), so it belongs in a measured pixel-match investigation
scored against the GUI GT, not a silent perf tweak. Filed as the top item in
ENGINE_BACKLOG.

## HGBlur decimation — the REAL reason FCP's big blurs are fast (Helium.framework)

`HGBlur` (Helium, the node that HGaussianBlur/HEquirectGaussianBlur build) does NOT
convolve a giant kernel at full res. It DECIMATES (downsamples), blurs the small
image with a fixed small tap kernel, then upsamples — via HGBlur::fastDecimateDown /
fastDecimateUp / ComputeDecimation / GetDecimation. This is O(pixels), independent of
radius, and is the faithful algorithm (not a GPU trick).

`HGBlur::GetDecimation(float radius)` @ Helium 0x1bc0d8 — EXACT asm:
```
s0 = radius*radius
if (s0 < 25.0) return 0            // radius < 5 → no decimation
level = 0; scale = 1.0
do {
  s4 = scale * 25.0
  level += 1
  s0 -= s4                          // subtract 25, 100, 400, 1600, ...
  scale *= 4.0
  s4 = scale * 25.0
} while (s0 >= s4)
return level                        // decimation = 2^level
```
i.e. decimation level rises each time radius² clears the next 25·4^k band:
  radius <5 →0 (1×) | ≥5 →1 (2×) | ≥13 →2 (4×) | ≥32 →3 (8×) | ≥90 →4 (16×) …

For 360°/Bloom's three group filters this means FCP blurs:
  Gaussian r=13 → 4× → a 1024×540 image
  Glow     r=90 → 16× → a 256×135 image   (the "6-second" full-res pass is ~instant)
  Bloom    r=32 → 8× → a 512×270 image
then upsamples each back to the working resolution. THIS is why FCP is fast and our
full-res 4096×2160 convolution is 262 s/slug. Reproducing GetDecimation +
decimate-blur-upsample is both the fidelity fix and the speed fix (same math FCP runs).
