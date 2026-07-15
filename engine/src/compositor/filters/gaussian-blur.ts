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
 *   [P2-GB2] sigma = radius/6.67 is the DECODED effective ratio: HGaussianBlur::init
 *     (ProAppsFxSupport @0xa1d40) feeds radius = Amount·blurScale directly to HGBlur;
 *     the decimate→PDF→upsample chain yields an effective screen sigma ≈ radius/6.67
 *     (verified: Amount 10→σ1.5 … 80→σ11.3). It is a normalized PDF (not r/3, which was
 *     the old wrong assumption).
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


export function gaussianBlur(input: ImageData, radius: number): ImageData {
  if (radius <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;

  // Clamp radius to reasonable bounds
  const r = Math.min(Math.ceil(radius), 200);
  if (r === 0) return input;

  // Generate 1D Gaussian kernel
  const kernel = makeGaussianKernel(r);
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
function makeGaussianKernel(radius: number): Float64Array {
  const size = radius * 2 + 1;
  const kernel = new Float64Array(size);
  // sigma = radius / 6.67. MEASURED vs headless FCP (2026-07-11): probed PAEGaussianBlur
  // at Amount ∈ {10,20,40,80} and fitted the sigma that best matches FCP's output —
  // sigma = Amount/6.67 (Amount10→σ1.5, 20→3.0, 40→5.8, 80→11.3; ratio ~6.7–7.1).
  // The old sigma = radius/3 produced ~2.2× TOO MUCH blur (Amount=20: TS 34.0 dB vs
  // FCP, over-blurred mad 6.49 vs FCP's 4.51). Because decimatedGaussianBlur scales the
  // radius by 1/factor before this call and upsamples ×factor, the effective full-res
  // sigma is (radius/factor)/6.67 × factor = radius/6.67 — so the constant lives here.
  const sigma = radius / 6.67;
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
  const level = gaussianDecimation(radius);
  if (level === 0) return gaussianBlur(input, radius);
  const factor = 1 << level; // 2^level
  const dw = Math.max(1, Math.round(input.width / factor));
  const dh = Math.max(1, Math.round(input.height / factor));
  const small = resample(input, dw, dh);
  const blurred = gaussianBlur(small, radius / factor);
  return resample(blurred, input.width, input.height);
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
function gaussianBlurFloatRGB(src: Float32Array, width: number, height: number, radius: number): Float32Array {
  const r = Math.min(Math.ceil(radius), 200);
  if (r === 0) return src;
  const kernel = makeGaussianKernel(r);
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
  const level = gaussianDecimation(radius);
  if (level === 0) return gaussianBlurFloatRGB(src, width, height, radius);
  const factor = 1 << level;
  const dw = Math.max(1, Math.round(width / factor));
  const dh = Math.max(1, Math.round(height / factor));
  const small = resampleFloatRGB(src, width, height, dw, dh);
  const blurred = gaussianBlurFloatRGB(small, dw, dh, radius / factor);
  return resampleFloatRGB(blurred, dw, dh, width, height);
}

import { registerFilter } from './registry.js';

// Gaussian Blur (UUID E472D646-…). Faithful to the legacy branch: Mix gates the
// effect (0 = bypass); Amount via blurAmount (honors overrides + static-value=0
// inactive rule); rendered radius = Amount * min(Mix,1). Rendered through FCP's
// decimate→blur→upsample HGBlur (decimatedGaussianBlur) so a large radius is O(pixels),
// not O(pixels·radius) — matches FCP and is dramatically faster on big canvases.
registerFilter({
  uuid: 'E472D646-2C92-464E-98A1-91CF8F162AD8',
  names: ['gaussian'],
  label: 'Gaussian Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', 0);
    if (mix > 0 && amount > 0) return decimatedGaussianBlur(input, amount * (mix < 1 ? mix : 1));
    return input;
  },
});
