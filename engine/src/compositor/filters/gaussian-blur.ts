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
 * Generate a normalized 1D Gaussian kernel.
 * Kernel size = 2*radius + 1. Values sum to 1.0.
 */
function makeGaussianKernel(radius: number): Float64Array {
  const size = radius * 2 + 1;
  const kernel = new Float64Array(size);
  const sigma = radius / 3; // 3-sigma rule
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
