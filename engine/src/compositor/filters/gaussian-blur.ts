/**
 * Gaussian Blur filter implementation.
 *
 * Used by: Blurs/Gaussian, Blurs/Directional, many Stylized transitions.
 * Plugin names: PAEGaussianBlur, GaussianBlur, Gaussian Blur
 *
 * Parameters:
 *   - Amount: blur radius in pixels (0 = no blur)
 *
 * Implementation: separable two-pass Gaussian (horizontal + vertical).
 *
 * ===========================================================================
 * FCP PHASE-1 REVERSE-ENGINEERING — verbatim shader / disasm backing
 * ===========================================================================
 * PAE class:  PAEGaussianBlur  (Filters.bundle/Contents/MacOS/Filters, arm64)
 * Registry UUID (this engine): E472D646-2C92-464E-98A1-91CF8F162AD8
 *
 * WHAT PAEGaussianBlur ACTUALLY BUILDS (from -[PAEGaussianBlur
 * canThrowRenderOutput:withInput:withInfo:] disasm @ 0x3064c):
 *   - reads 3 floats via getFloatValue:fromParm:atFxTime: (amount + blurScale.x/y)
 *   - planar path @ 0x3094c:  HGaussianBlur::init(f,f,f,b,b,b)   [_ZN13HGaussianBlur4initEfffbbb]
 *   - 360 path   @ 0x30c58:  HEquirectGaussianBlur::init(f,f,f,i,i,PCVector4f×4)
 *     (seam-wrap + optional sinusoidal reproject — see FCP_360_BLUR_REVERSE_ENGINEERING.md)
 *
 * THE PER-PIXEL ALGORITHM IS *NOT* A FULL-RES CONVOLUTION.
 * HGaussianBlur delegates to Helium's HGBlur, which DECIMATES → convolves a
 * SMALL fixed-tap kernel → UPSAMPLES:
 *   1. HGBlur::GetDecimation(radius)  (Helium @ 0x1bc0d8) picks level 2^k so
 *      radius²  clears successive 25·4^k bands (see gaussianDecimation() below).
 *   2. HGBlur::fastDecimateDown  bilinearly downsamples by 2^level.
 *   3. A SEPARABLE convolve pass runs on the small image. The GPU shaders are the
 *      HgcConvolvePass* family (verbatim source via extract_shader.py):
 *        HgcConvolvePass5tapPoint / 8tapPoint / 7tapDefocus …
 *      Each is a weighted N-tap sum:
 *        color0 = Σ hg_Params[base+i] * sample(texCoord_i)
 *      NOTE: the per-tap WEIGHTS ARE RUNTIME PARAMS (hg_Params[...]), NOT baked
 *      into the shader. They are the Gaussian coefficients HGBlur computes CPU-side
 *      per (radius,level). The tap WEIGHTS come from the standard normalized Gaussian
 *      PDF — DECODED (not fitted): HGLinearFilter::gaussian(x, mean, sigma) (Helium
 *      @0x1040ec) = (1/sigma)·exp(-0.5·((x-mean)/sigma)^2)·0.39894228, where
 *      0.39894228 = 1/sqrt(2*pi). So the kernel IS a normalized Gaussian PDF; the only
 *      thing HGBlur adds is the decimation-level choice (GetPrefilterRadius @0xff558 =
 *      ceil(-log2(sigma)·kernelCoeff·scale)) and the down/up-sample. HGDefinition::
 *      CIToHGBlurRadius(f)=f*3.0 maps a UI/CI radius to the internal radius.
 *      (Constants read with the fat-binary-correct tools/re/read_const.py — the raw
 *       otool section offset needs the arm64 SLICE base added or it reads garbage.)
 *   4. HGBlur::fastDecimateUp  bilinearly upsamples back to full res.
 *   (HgcChannelBlur / HgcChannelBlurNoPremult are NOT the blur convolution — they
 *    are the un-/re-premultiply channel-mix blends applied around the blur:
 *      r1.xyz /= max(r1.w, 1e-6);  r1.xyz = mix(orig.xyz, r1.xyz, params[0].xyz);
 *      color0.xyz = r1.xyz * orig.w;  color0.w = orig.w;  )
 *
 * PHASE-2 STATUS (TS vs FCP):
 *   [P2-GB1] This file builds a full 2*r+1 normalized Gaussian (makeGaussianKernel) —
 *     the SAME PDF as HGLinearFilter::gaussian, just at full res instead of on the
 *     decimated image. Verified vs headless FCP at psnr 43-46 (isolated Amount sweep),
 *     so the effective kernel matches; the decimation is a perf detail, not a look diff.
 *   [P2-GB2] sigma = radius/6.10 is the DECODED effective ratio: HGaussianBlur::init
 *     (ProAppsFxSupport @0xa1d40) feeds radius = Amount·blurScale directly to HGBlur;
 *     the decimate→normalized-Gaussian-PDF→bilinear-upsample chain yields an effective
 *     screen sigma ≈ radius/6.10 (STEP-EDGE erf fit, Amount 10..300, a/σ=6.06..6.28).
 *     It is a normalized PDF (not r/3, which was the old wrong assumption; the earlier
 *     6.67 was a photo-fitted value that a σ-sensitive edge probe refutes at 3× the rms).
*   [P2-GB4] DECIMATION OVER-BLUR — FIXED 2026-07-18 (decimatedGaussianBlur rewrite).
 *     BEFORE: the decimated path OVER-blurred by ~35% — engine a/σ = 5.79(amt20) 4.50(amt50)
 *     5.45(amt75) 4.50(amt100) 4.59(amt600) vs FCP's constant 6.09 at ALL amounts (step-edge
 *     erf fit, _filter_apply vs headless). Root causes: (1) gaussianDecimation()'s 25·4^k rule
 *     picked too-high a level (amt50→F16 for σ=8); (2) resample() was a SINGLE large-factor
 *     bilinear step that POINT-samples/aliases (down 16× reads 2 of every 16 px) and adds
 *     σ_resample≈0.32·F; plus the tiny inner radius was rounded up (6.25→7) inflating inner σ.
 *     FIX (verified a/σ = 6.09–6.18 across amount 10–600, matching FCP): (a) GENTLE level —
 *     largest F=2^level with 2·F ≤ targetSigma so inner σ stays ≥1 and resample variance stays
 *     correctable; (b) boxHalve() SUCCESSIVE-2× box downsample (true 2×2 mean = FCP's
 *     fastDecimateDown, energy-preserving, not aliasing); (c) inner-σ VARIANCE COMPENSATION
 *     innerSigma=sqrt((targetSigma/F)²−K²), K=0.405 px (measured box-down+bilinear-up round-trip
 *     σ in small-image space); (d) sigmaOverride plumbed into gaussianBlur/makeGaussianKernel so
 *     the compensated σ is used directly (no radius rounding). Gate: NET-neutral on affected
 *     slugs (Bloom/Center_Reveal/360°_Gaussian ~±0.12 jitter, Blurs__Gaussian +0.40) — a
 *     faithful correctness improvement the GUI-GT gate confirms doesn't regress. (T-qgbdecim01 DONE.)
 *   [P2-GB3] EDGE MODE — DECODED 2026-07-15 (tools/re/gen_pattern.py {solid,edge} +
 *     filter_probe --in-a). Two distinct edges to distinguish:
 *     (a) WITHIN-IMAGE borders (a sample would step off the pixel grid): FCP CLAMPs
 *         (repeat-edge), same as this impl. Verified: a bright bar flush to col-0 blurred
 *         at Amount=80 keeps col-0 bright (clamp extends it) rather than reflecting/zeroing
 *         — and the isolated opaque Amount sweep matches headless at 36–46 dB, which a
 *         wrong within-image edge mode would break. So the CLAMP here is correct.
 *     (b) IMAGE-BOUNDARY against transparency (the image sits on a transparent canvas):
 *         FCP blurs in PREMULTIPLIED space — at a solid-white patch's boundary the STORED
 *         (straight) RGB stays ~255 constant while ALPHA feathers 0→18→34→60→132→240; i.e.
 *         it blurs (rgb·a) and a, then un-premultiplies. A STRAIGHT RGBA blur (what
 *         gaussianBlur below does) would instead average the white against the rgb=0
 *         transparent neighbours and pull the stored RGB toward 0 → a DARK HALO at alpha
 *         edges. THIS IS A REAL DECODED DIVERGENCE, but it is NOT exercised by the GUI-GT
 *         gate: the 16 Gaussian transitions blur FULL-FRAME OPAQUE content, and for the
 *         masked-reveal users the compositor applies the mask AFTER the filter on an opaque
 *         source (index.ts renderDrawableLayer: blit src→temp → applyFilter → applyMask →
 *         composite), so the blur never sees the alpha edge. Per rule 1 (GUI GT = one truth)
 *         + decode-don't-fit, the premult-blur is documented here rather than shipped: a
 *         premult-aware rewrite of this 16-user load-bearing filter would be gate-neutral at
 *         best (opaque inputs are identical) and risky at worst. If a future scene DOES blur
 *         an alpha-edged layer (Bloom's Float path already carries its own premult story),
 *         wrap this in an un/re-premultiply (the HgcChannelBlur/NoPremult blends FCP applies
 *         around HGBlur) before shipping, and gate-green.
 *
 * PERF (2026-07-05): two exact speedups on the inner tap loop, both verified
 * byte-identical to the naive path (test/_perf_gbcheck against the reference impl):
 *   1. CLAMP-SPLIT: interior pixels (kHalf ≤ i < size-kHalf) never sample out of
 *      bounds, so the per-tap `Math.min(Math.max(...))` edge clamp is hoisted out
 *      of the hot loop; edge pixels keep the exact clamped path.
 *   2. SYMMETRIC-FOLD: the Gaussian kernel is symmetric (kernel[k]==kernel[size-1-k]),
 *      so each interior pixel sums the mirror-pair samples once and multiplies by the
 *      shared weight — halving the multiplies. Verified identical after Math.round /
 *      Uint8ClampedArray quantization over 180k randomized samples at r∈{1..200}.
 * The kernel, temp-buffer type (Uint8ClampedArray) and Math.round quantization are
 * unchanged. This is a pure speed change (360° Bloom does three 4096×2160 blurs per
 * frame at radius 13/32/90 — the single biggest cost in the render pipeline).
 */
import { resample } from '../resample.js';


export function gaussianBlur(input: ImageData, radius: number, sigmaOverride?: number): ImageData {
  if (radius <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;

  // Clamp radius to reasonable bounds
  const r = Math.min(Math.ceil(radius), 200);
  if (r === 0) return input;

  // Generate 1D Gaussian kernel. sigma defaults to radius/6.10 (decoded HGBlur ratio),
  // but decimatedGaussianBlur passes an explicit resample-variance-COMPENSATED sigma.
  const kernel = makeGaussianKernel(r, sigmaOverride);
  const kSize = kernel.length;
  const kHalf = r; // = (kSize - 1) / 2
  const wCenter = kernel[kHalf];

  const temp = new Uint8ClampedArray(width * height * 4);
  const out = new Uint8ClampedArray(width * height * 4);

  // ---- Horizontal pass (src → temp) ----
  const hLo = kHalf, hHi = width - kHalf; // interior [hLo, hHi)
  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    // Left edge (clamped, naive)
    for (let x = 0; x < Math.min(hLo, width); x++) {
      let rA = 0, gA = 0, bA = 0, aA = 0;
      for (let k = 0; k < kSize; k++) {
        const sx = x + k - kHalf;
        const cx = sx < 0 ? 0 : (sx >= width ? width - 1 : sx);
        const idx = (rowBase + cx) * 4;
        const w = kernel[k];
        rA += src[idx] * w; gA += src[idx + 1] * w; bA += src[idx + 2] * w; aA += src[idx + 3] * w;
      }
      const d = (rowBase + x) * 4;
      temp[d] = Math.round(rA); temp[d + 1] = Math.round(gA); temp[d + 2] = Math.round(bA); temp[d + 3] = Math.round(aA);
    }
    // Interior (unclamped, symmetric-folded)
    for (let x = Math.max(hLo, 0); x < hHi; x++) {
      const cIdx = (rowBase + x) * 4;
      let rA = src[cIdx] * wCenter, gA = src[cIdx + 1] * wCenter, bA = src[cIdx + 2] * wCenter, aA = src[cIdx + 3] * wCenter;
      let lo = cIdx - 4, hi = cIdx + 4;
      for (let k = kHalf - 1; k >= 0; k--) {
        const w = kernel[k];
        rA += w * (src[lo] + src[hi]);
        gA += w * (src[lo + 1] + src[hi + 1]);
        bA += w * (src[lo + 2] + src[hi + 2]);
        aA += w * (src[lo + 3] + src[hi + 3]);
        lo -= 4; hi += 4;
      }
      temp[cIdx] = Math.round(rA); temp[cIdx + 1] = Math.round(gA); temp[cIdx + 2] = Math.round(bA); temp[cIdx + 3] = Math.round(aA);
    }
    // Right edge (clamped, naive)
    for (let x = Math.max(hHi, hLo); x < width; x++) {
      let rA = 0, gA = 0, bA = 0, aA = 0;
      for (let k = 0; k < kSize; k++) {
        const sx = x + k - kHalf;
        const cx = sx < 0 ? 0 : (sx >= width ? width - 1 : sx);
        const idx = (rowBase + cx) * 4;
        const w = kernel[k];
        rA += src[idx] * w; gA += src[idx + 1] * w; bA += src[idx + 2] * w; aA += src[idx + 3] * w;
      }
      const d = (rowBase + x) * 4;
      temp[d] = Math.round(rA); temp[d + 1] = Math.round(gA); temp[d + 2] = Math.round(bA); temp[d + 3] = Math.round(aA);
    }
  }

  // ---- Vertical pass (temp → out) ----
  const vLo = kHalf, vHi = height - kHalf;
  const stride = width * 4;
  // Top edge rows (clamped, naive)
  for (let y = 0; y < Math.min(vLo, height); y++) {
    const dRow = y * width;
    for (let x = 0; x < width; x++) {
      let rA = 0, gA = 0, bA = 0, aA = 0;
      for (let k = 0; k < kSize; k++) {
        const sy = y + k - kHalf;
        const cy = sy < 0 ? 0 : (sy >= height ? height - 1 : sy);
        const idx = (cy * width + x) * 4;
        const w = kernel[k];
        rA += temp[idx] * w; gA += temp[idx + 1] * w; bA += temp[idx + 2] * w; aA += temp[idx + 3] * w;
      }
      const d = (dRow + x) * 4;
      out[d] = Math.round(rA); out[d + 1] = Math.round(gA); out[d + 2] = Math.round(bA); out[d + 3] = Math.round(aA);
    }
  }
  // Interior rows (unclamped, symmetric-folded)
  for (let y = Math.max(vLo, 0); y < vHi; y++) {
    const dRow = y * width;
    for (let x = 0; x < width; x++) {
      const cIdx = (dRow + x) * 4;
      let rA = temp[cIdx] * wCenter, gA = temp[cIdx + 1] * wCenter, bA = temp[cIdx + 2] * wCenter, aA = temp[cIdx + 3] * wCenter;
      let lo = cIdx - stride, hi = cIdx + stride;
      for (let k = kHalf - 1; k >= 0; k--) {
        const w = kernel[k];
        rA += w * (temp[lo] + temp[hi]);
        gA += w * (temp[lo + 1] + temp[hi + 1]);
        bA += w * (temp[lo + 2] + temp[hi + 2]);
        aA += w * (temp[lo + 3] + temp[hi + 3]);
        lo -= stride; hi += stride;
      }
      out[cIdx] = Math.round(rA); out[cIdx + 1] = Math.round(gA); out[cIdx + 2] = Math.round(bA); out[cIdx + 3] = Math.round(aA);
    }
  }
  // Bottom edge rows (clamped, naive)
  for (let y = Math.max(vHi, vLo); y < height; y++) {
    const dRow = y * width;
    for (let x = 0; x < width; x++) {
      let rA = 0, gA = 0, bA = 0, aA = 0;
      for (let k = 0; k < kSize; k++) {
        const sy = y + k - kHalf;
        const cy = sy < 0 ? 0 : (sy >= height ? height - 1 : sy);
        const idx = (cy * width + x) * 4;
        const w = kernel[k];
        rA += temp[idx] * w; gA += temp[idx + 1] * w; bA += temp[idx + 2] * w; aA += temp[idx + 3] * w;
      }
      const d = (dRow + x) * 4;
      out[d] = Math.round(rA); out[d + 1] = Math.round(gA); out[d + 2] = Math.round(bA); out[d + 3] = Math.round(aA);
    }
  }

  return new ImageData(out, width, height);
}

/**
 * FCP's blur decimation level for a given radius — a faithful reimplementation of
 * `HGBlur::GetDecimation(float)` (Helium.framework @ 0x1bc0d8), reverse-engineered
 * from the disassembly (see docs/notes/FCP_360_BLUR_REVERSE_ENGINEERING.md). FCP does
 * NOT convolve a giant kernel at full resolution; HGBlur DECIMATES (downsamples by
 * 2^level), blurs the small image with a small kernel, then upsamples. The level
 * rises each time radius² clears the next 25·4^k band:
 *   radius <5 → 0 (1×) | ≥5 → 1 (2×) | ≥13 → 2 (4×) | ≥32 → 3 (8×) | ≥90 → 4 (16×) …
 * This is O(pixels) regardless of radius — the reason FCP renders a radius-90 blur on
 * a 4096-wide panorama instantly while a full-res convolution takes seconds.
 */

/**
 * Generate a normalized 1D Gaussian kernel.
 * Kernel size = 2*radius + 1. Values sum to 1.0.
 */
function makeGaussianKernel(radius: number, sigmaOverride?: number): Float64Array {
  const size = radius * 2 + 1;
  const kernel = new Float64Array(size);
  // sigma = radius / 6.10. MEASURED vs headless FCP via a synthetic high-contrast
  // STEP-EDGE probe (erf-CDF fit, rms residual <0.7 code levels) across Amount ∈
  // {10,20,30,50,75,100,150,200,300} — spanning EVERY decimation level: FCP's effective
  // screen sigma = Amount/6.10 at every amount (a/σ = 6.06–6.28, pooled 6.10). The
  // earlier 6.67 was fitted on a LOW-FREQUENCY PHOTO where PSNR is nearly insensitive to
  // σ (±10% σ barely moves the number); a step edge is far more σ-sensitive and shows
  // 6.67 gives edge rms ~1.8 vs 6.10's ~0.6 (3× worse). The identical 6.10 ratio was
  // independently measured on PAEDirectionalBlur (which wraps the same HGaussianBlur
  // node), confirming the shared kernel. Because decimatedGaussianBlur scales the radius
  // by 1/factor before this call and upsamples ×factor, the effective full-res sigma is
  // (radius/factor)/6.10 × factor = radius/6.10 — so the constant lives here.
  const sigma = sigmaOverride !== undefined ? sigmaOverride : radius / 6.10;
  const twoSigmaSq = 2 * sigma * sigma;
  let sum = 0;
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / twoSigmaSq);
    sum += kernel[i];
  }
  for (let i = 0; i < size; i++) kernel[i] /= sum;
  return kernel;
}

/**
 * FCP's `HGBlur::GetDecimation(radius)` (Helium.framework @ 0x1bc0d8), exact:
 * a large blur is not convolved at full res — the image is DECIMATED (downsampled)
 * by 2^level, blurred small, then upsampled. The level rises each time radius²
 * clears the next 25·4^k band: r<5→0(1×) | ≥5→1(2×) | ≥13→2(4×) | ≥32→3(8×) |
 * ≥90→4(16×)… This is O(pixels) regardless of radius and is what makes FCP's
 * radius-90 glow on a 4096-wide panorama fast. See
 * docs/notes/FCP_360_BLUR_REVERSE_ENGINEERING.md.
 */
export function gaussianDecimation(radius: number): number {
  let r2 = radius * radius;
  if (r2 < 25.0) return 0;
  let level = 0, scale = 1.0;
  do {
    level += 1;
    r2 -= scale * 25.0;
    scale *= 4.0;
  } while (r2 >= scale * 25.0);
  return level;
}

/**
 * Decimate → blur → upsample, matching FCP's HGBlur. For radius < 5 (decimation 0)
 * this is just the plain full-res gaussianBlur. Otherwise the image is bilinearly
 * downsampled by 2^level, blurred at the reduced radius (radius / 2^level) on the
 * small image, and bilinearly upsampled back to the original size — the same
 * decimate-blur-upsample HGBlur runs (fastDecimateDown/Up), which is both faithful
 * and O(pixels) instead of O(pixels·radius).
 */
export function decimatedGaussianBlur(input: ImageData, radius: number): ImageData {
  if (radius <= 0) return input;
  // Target SCREEN sigma (decoded HGBlur ratio). FCP holds this at every amount.
  const targetSigma = radius / 6.10;
  // NO decimation while the target sigma is small enough to convolve full-res cheaply
  // (< ~2 px). Full-res is EXACT (no resample variance) — verified a/sigma=6.10.
  if (targetSigma < 2.0) return gaussianBlur(input, radius, targetSigma);
  // GENTLE decimation (DECODED 2026-07-18 — supersedes GetDecimation's 25·4^k rule for
  // OUR resample, which over-decimated and OVER-BLURRED by ~35%, a/sigma 4.5-5.8 vs FCP
  // 6.09; see [P2-GB4]). Pick the largest factor F=2^level with 2·F <= targetSigma so the
  // small-image blur keeps sigma >= ~1 px and the resample variance stays a small,
  // correctable fraction of the target. FCP's fastDecimateDown is a SUCCESSIVE 2× box
  // reduction (variance-correct); we mirror that with boxHalve() (a true 2×2 average per
  // step, NOT a single large-factor bilinear point-sample which aliases).
  let level = 0;
  while ((1 << (level + 1)) * 2 <= targetSigma && level < 6) level += 1;
  const factor = 1 << level;
  // RESAMPLE-VARIANCE COMPENSATION: the box-down + bilinear-up round trip adds
  // sigma_resample ≈ K px in SMALL-image space (K = 0.405, measured: box-halve↓ + bilinear↑
  // step-edge erf fit). The desired small-image sigma is (targetSigma/factor); subtract the
  // resample variance so the UPSAMPLED result lands on targetSigma:
  //   innerSigma = sqrt( (targetSigma/factor)^2 − K^2 )
  // Verified a/sigma = 6.06–6.18 across amount∈{10..600} (was 4.5–5.8). K lives here because
  // it is a property of THIS resample pair, not the blur.
  const K = 0.405;
  const naiveInner = targetSigma / factor;
  const innerSigma = Math.sqrt(Math.max(0, naiveInner * naiveInner - K * K));
  // Successive 2× box downsample (fastDecimateDown).
  let small = input;
  for (let i = 0; i < level; i++) small = boxHalve(small);
  // Blur the small image at the compensated sigma. Kernel half-width tracks innerSigma
  // (ceil(3σ)), not a rounded radius, so tiny inner blurs are not sigma-inflated.
  const half = Math.max(1, Math.ceil(innerSigma * 3));
  const blurredSmall = innerSigma > 0.05 ? gaussianBlur(small, half, innerSigma) : small;
  // Successive 2× bilinear upsample (fastDecimateUp) back to full res.
  let up = blurredSmall;
  for (let i = 0; i < level; i++) {
    up = resample(up, Math.min(input.width, up.width * 2), Math.min(input.height, up.height * 2));
  }
  // Final conform to exact input size (successive doubling may over/undershoot by 1).
  if (up.width !== input.width || up.height !== input.height) up = resample(up, input.width, input.height);
  return up;
}

/** Successive-2× box downsample (one 2×2 average step) — FCP's fastDecimateDown. A true
 *  2×2 mean (energy-preserving, anti-aliased), unlike a single large-factor bilinear
 *  resample which point-samples and aliases. Odd dims drop the last row/col (matches the
 *  floor(w/2) reduction). */
function boxHalve(input: ImageData): ImageData {
  const w = input.width, h = input.height, s = input.data;
  const w2 = Math.max(1, w >> 1), h2 = Math.max(1, h >> 1);
  const out = new Uint8ClampedArray(w2 * h2 * 4);
  for (let y = 0; y < h2; y++) {
    const y0 = y * 2, y1 = y0 + 1;
    for (let x = 0; x < w2; x++) {
      const x0 = x * 2, x1 = x0 + 1;
      const i00 = (y0 * w + x0) * 4, i10 = (y0 * w + x1) * 4;
      const i01 = (y1 * w + x0) * 4, i11 = (y1 * w + x1) * 4;
      const o = (y * w2 + x) * 4;
      for (let c = 0; c < 4; c++) {
        out[o + c] = Math.round((s[i00 + c] + s[i10 + c] + s[i01 + c] + s[i11 + c]) * 0.25);
      }
    }
  }
  return new ImageData(out, w2, h2);
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOAT-buffer Gaussian blur (RGB, 3-channel interleaved, NO 8-bit clamp).
//
// The Uint8ClampedArray path above clamps every intermediate to [0,255], which is
// correct for a normal blur but DESTROYS the >1.0 headroom Bloom's ×10 highlight
// extract produces (a mid-gray 0.5 → 5.0; an 8-bit store caps it at 1.0 and the blur
// then dilutes the capped core with dark neighbours, so the energy that should blow
// the frame to white is lost). Bloom therefore runs its blur in Float32 here.
// The kernel + decimation are IDENTICAL to the 8-bit path (same makeGaussianKernel,
// same gaussianDecimation), so the blur SHAPE matches FCP's HGBlur exactly; only the
// storage type (and thus the headroom) differs. See glow.ts bloomFilter.
// ─────────────────────────────────────────────────────────────────────────────

/** Bilinear resample of a Float32 RGB buffer (mirrors resample() for u8 RGBA). */
function resampleFloatRGB(src: Float32Array, sw: number, sh: number, tw: number, th: number): Float32Array {
  if (sw === tw && sh === th) return src;
  const out = new Float32Array(tw * th * 3);
  for (let y = 0; y < th; y++) {
    const sy = (y + 0.5) * sh / th - 0.5;
    const y0 = Math.max(0, Math.floor(sy));
    const y1 = Math.min(sh - 1, y0 + 1);
    const fy = sy - Math.floor(sy);
    for (let x = 0; x < tw; x++) {
      const sx = (x + 0.5) * sw / tw - 0.5;
      const x0 = Math.max(0, Math.floor(sx));
      const x1 = Math.min(sw - 1, x0 + 1);
      const fx = sx - Math.floor(sx);
      const o = (y * tw + x) * 3;
      const i00 = (y0 * sw + x0) * 3, i10 = (y0 * sw + x1) * 3;
      const i01 = (y1 * sw + x0) * 3, i11 = (y1 * sw + x1) * 3;
      for (let c = 0; c < 3; c++) {
        const top = src[i00 + c] * (1 - fx) + src[i10 + c] * fx;
        const bot = src[i01 + c] * (1 - fx) + src[i11 + c] * fx;
        out[o + c] = top * (1 - fy) + bot * fy;
      }
    }
  }
  return out;
}

/** Separable full-res Gaussian on a Float32 RGB buffer (mirrors gaussianBlur, no clamp). */
function gaussianBlurFloatRGB(src: Float32Array, width: number, height: number, radius: number, sigmaOverride?: number): Float32Array {
  const r = Math.min(Math.ceil(radius), 200);
  if (r === 0) return src;
  const kernel = makeGaussianKernel(r, sigmaOverride);
  const kSize = kernel.length;
  const kHalf = r;
  const temp = new Float32Array(width * height * 3);
  const out = new Float32Array(width * height * 3);
  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      let rA = 0, gA = 0, bA = 0;
      for (let k = 0; k < kSize; k++) {
        let sx = x + k - kHalf;
        if (sx < 0) sx = 0; else if (sx >= width) sx = width - 1;
        const idx = (rowBase + sx) * 3;
        const w = kernel[k];
        rA += src[idx] * w; gA += src[idx + 1] * w; bA += src[idx + 2] * w;
      }
      const d = (rowBase + x) * 3;
      temp[d] = rA; temp[d + 1] = gA; temp[d + 2] = bA;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rA = 0, gA = 0, bA = 0;
      for (let k = 0; k < kSize; k++) {
        let sy = y + k - kHalf;
        if (sy < 0) sy = 0; else if (sy >= height) sy = height - 1;
        const idx = (sy * width + x) * 3;
        const w = kernel[k];
        rA += temp[idx] * w; gA += temp[idx + 1] * w; bA += temp[idx + 2] * w;
      }
      const d = (y * width + x) * 3;
      out[d] = rA; out[d + 1] = gA; out[d + 2] = bA;
    }
  }
  return out;
}

/**
 * Decimate → float-blur → upsample, matching FCP's HGBlur decimation but carrying
 * values in Float32 so >1.0 bloom cores survive. Identical decimation levels + kernel
 * to decimatedGaussianBlur (the u8 path).
 */
export function decimatedBlurFloatRGB(src: Float32Array, width: number, height: number, radius: number): Float32Array {
  if (radius <= 0) return src;
  // Same variance-correct decimation as the u8 decimatedGaussianBlur (see [P2-GB4]) —
  // gentle level + successive-2× box downsample + inner-σ resample-variance compensation —
  // so the Float bloom blur ALSO holds a/σ = 6.09 at every amount instead of over-blurring
  // ~35% (the old single-large-factor bilinear + 25·4^k level over-decimated here too).
  const targetSigma = radius / 6.10;
  if (targetSigma < 2.0) return gaussianBlurFloatRGB(src, width, height, radius, targetSigma);
  let level = 0;
  while ((1 << (level + 1)) * 2 <= targetSigma && level < 6) level += 1;
  const factor = 1 << level;
  const K = 0.405;
  const naiveInner = targetSigma / factor;
  const innerSigma = Math.sqrt(Math.max(0, naiveInner * naiveInner - K * K));
  // Successive 2× box downsample (fastDecimateDown).
  let cw = width, ch = height, cur = src;
  for (let i = 0; i < level; i++) { const nw = Math.max(1, cw >> 1), nh = Math.max(1, ch >> 1); cur = boxHalveFloatRGB(cur, cw, ch); cw = nw; ch = nh; }
  // Blur the small buffer at the compensated sigma (kernel half-width tracks σ, no rounding).
  const half = Math.max(1, Math.ceil(innerSigma * 3));
  const blurredSmall = innerSigma > 0.05 ? gaussianBlurFloatRGB(cur, cw, ch, half, innerSigma) : cur;
  // Successive 2× bilinear upsample (fastDecimateUp) back to full res.
  let uw = cw, uh = ch, up = blurredSmall;
  for (let i = 0; i < level; i++) {
    const nw = Math.min(width, uw * 2), nh = Math.min(height, uh * 2);
    up = resampleFloatRGB(up, uw, uh, nw, nh); uw = nw; uh = nh;
  }
  if (uw !== width || uh !== height) up = resampleFloatRGB(up, uw, uh, width, height);
  return up;
}

/** Successive-2× box downsample for a Float32 RGB buffer (FCP fastDecimateDown, Float). */
function boxHalveFloatRGB(src: Float32Array, w: number, h: number): Float32Array {
  const w2 = Math.max(1, w >> 1), h2 = Math.max(1, h >> 1);
  const out = new Float32Array(w2 * h2 * 3);
  for (let y = 0; y < h2; y++) {
    const y0 = y * 2, y1 = y0 + 1;
    for (let x = 0; x < w2; x++) {
      const x0 = x * 2, x1 = x0 + 1;
      const i00 = (y0 * w + x0) * 3, i10 = (y0 * w + x1) * 3;
      const i01 = (y1 * w + x0) * 3, i11 = (y1 * w + x1) * 3;
      const o = (y * w2 + x) * 3;
      for (let c = 0; c < 3; c++) out[o + c] = (src[i00 + c] + src[i10 + c] + src[i01 + c] + src[i11 + c]) * 0.25;
    }
  }
  return out;
}

/** Anisotropic separable Gaussian: independent horizontal (sigmaX) and vertical (sigmaY)
 *  screen sigmas, full-res (no decimation). DECODED 2026-07-18 vs headless FCP (cross
 *  probe): PAEGaussianBlur's Horizontal/Vertical params (0..100, default 100) LINEARLY
 *  scale the per-axis blur amount — Vertical=0 leaves the vertical axis SHARP (V-spread
 *  8px = line width), Horizontal=50 halves the horizontal spread (26 vs 50px). So
 *  sigmaX = (Amount/6.10)·(Horizontal/100), sigmaY = (Amount/6.10)·(Vertical/100). Used
 *  only for the ANISOTROPIC case (H≠V); the isotropic shipping case (H=V=100) keeps the
 *  fast decimatedGaussianBlur. Full-res is fine here — anisotropic blur is unexercised by
 *  the 65 built-ins (all author H=V=100) so it is never on the perf-critical path. */
function anisotropicGaussianBlur(input: ImageData, sigmaX: number, sigmaY: number): ImageData {
  const width = input.width, height = input.height, src = input.data;
  const halfX = Math.max(0, Math.min(Math.ceil(sigmaX * 3), 400));
  const halfY = Math.max(0, Math.min(Math.ceil(sigmaY * 3), 400));
  const kx = makeGaussianKernel(halfX, sigmaX > 0.05 ? sigmaX : undefined);
  const ky = makeGaussianKernel(halfY, sigmaY > 0.05 ? sigmaY : undefined);
  const temp = new Uint8ClampedArray(width * height * 4);
  const out = new Uint8ClampedArray(width * height * 4);
  // Horizontal pass (src -> temp)
  for (let y = 0; y < height; y++) {
    const rowBase = y * width;
    for (let x = 0; x < width; x++) {
      let rA = 0, gA = 0, bA = 0, aA = 0;
      if (sigmaX <= 0.05) { const i = (rowBase + x) * 4; rA = src[i]; gA = src[i+1]; bA = src[i+2]; aA = src[i+3]; }
      else for (let k = -halfX; k <= halfX; k++) {
        let sx = x + k; sx = sx < 0 ? 0 : sx >= width ? width - 1 : sx;
        const idx = (rowBase + sx) * 4; const w = kx[k + halfX];
        rA += src[idx]*w; gA += src[idx+1]*w; bA += src[idx+2]*w; aA += src[idx+3]*w;
      }
      const d = (rowBase + x) * 4;
      temp[d] = Math.round(rA); temp[d+1] = Math.round(gA); temp[d+2] = Math.round(bA); temp[d+3] = Math.round(aA);
    }
  }
  // Vertical pass (temp -> out)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rA = 0, gA = 0, bA = 0, aA = 0;
      if (sigmaY <= 0.05) { const i = (y * width + x) * 4; rA = temp[i]; gA = temp[i+1]; bA = temp[i+2]; aA = temp[i+3]; }
      else for (let k = -halfY; k <= halfY; k++) {
        let sy = y + k; sy = sy < 0 ? 0 : sy >= height ? height - 1 : sy;
        const idx = (sy * width + x) * 4; const w = ky[k + halfY];
        rA += temp[idx]*w; gA += temp[idx+1]*w; bA += temp[idx+2]*w; aA += temp[idx+3]*w;
      }
      const d = (y * width + x) * 4;
      out[d] = Math.round(rA); out[d+1] = Math.round(gA); out[d+2] = Math.round(bA); out[d+3] = Math.round(aA);
    }
  }
  return new ImageData(out, width, height);
}

import { registerFilter } from './registry.js';

// Gaussian Blur (UUID E472D646-…). Mix gates the effect (0 = bypass); Amount via
// blurAmount (honors overrides + static-value=0 inactive rule). Rendered through FCP's
// decimate→blur→upsample HGBlur (decimatedGaussianBlur) so a large radius is O(pixels),
// not O(pixels·radius) — matches FCP and is dramatically faster on big canvases.
// MIX IS A BLEND, NOT A RADIUS SCALE (DECODED 2026-07-18 vs headless FCP, step-edge
// probe): FCP's Mix=0.5 output == 0.5·orig + 0.5·fullBlur (matches within ±2 codes),
// NOT a blur at half the radius (which the old `amount * min(Mix,1)` did — that was
// measurably wrong: at Mix=0.5 the radius-scaled prediction diverged by 20-60 codes).
// This is the decoded HgcChannelBlur combine `r1.xyz = mix(orig, blurred, params[0])`.
// Byte-identical for shipping (all Gaussian users author Mix∈{0,1}): Mix=1 → pure
// blurred, Mix=0 → bypass; the blend only changes the un-shipped Mix∈(0,1) regime.
registerFilter({
  uuid: 'E472D646-2C92-464E-98A1-91CF8F162AD8',
  names: ['gaussian'],
  label: 'Gaussian Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', 0);
    if (mix <= 0 || amount <= 0) return input;
    // Horizontal/Vertical (0..100, default 100) LINEARLY scale the per-axis blur (DECODED
    // vs headless: Vertical=0 -> no vertical blur, Horizontal=50 -> half horizontal spread).
    const hScale = ctx.param('Horizontal', 100) / 100;
    const vScale = ctx.param('Vertical', 100) / 100;
    let blurred: ImageData;
    if (Math.abs(hScale - 1) < 1e-4 && Math.abs(vScale - 1) < 1e-4) {
      // ISOTROPIC (the shipping case, H=V=100): fast decimated path.
      blurred = decimatedGaussianBlur(input, amount);
    } else {
      // ANISOTROPIC: full-res separable with per-axis sigma = (amount/6.10)*(scale).
      const base = amount / 6.10;
      blurred = anisotropicGaussianBlur(input, base * hScale, base * vScale);
    }
    if (mix >= 1) return blurred;
    // Blend orig -> blurred by Mix (the HgcChannelBlur combine).
    const a = input.data, b = blurred.data;
    const out = new Uint8ClampedArray(a.length);
    for (let i = 0; i < a.length; i++) out[i] = Math.round(a[i] * (1 - mix) + b[i] * mix);
    return new ImageData(out, input.width, input.height);
  },
});
