/**
 * Gaussian Blur filter implementation.
 *
 * Used by: Blurs/Gaussian, Blurs/Directional, many Stylized transitions.
 * Plugin names: PAEGaussianBlur, GaussianBlur, Gaussian Blur
 *
 * Parameters:
 *   - Amount: blur radius in pixels (0 = no blur)
 *   - Horizontal / Vertical: optional per-axis control
 *
 * Implementation: separable two-pass Gaussian (horizontal + vertical).
 * This is O(radius * width * height) which is efficient for the CPU path.
 */

/**
 * Apply Gaussian blur to an ImageData buffer.
 * @param input - Source image (not modified)
 * @param radius - Blur radius in pixels (Amount parameter value)
 * @returns New blurred ImageData
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
  const kHalf = Math.floor(kSize / 2);

  // Two-pass separable: horizontal then vertical
  const temp = new Uint8ClampedArray(width * height * 4);
  const out = new Uint8ClampedArray(width * height * 4);

  // Horizontal pass (src → temp)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;
      for (let k = 0; k < kSize; k++) {
        const sx = Math.min(Math.max(x + k - kHalf, 0), width - 1);
        const idx = (y * width + sx) * 4;
        const w = kernel[k];
        rAcc += src[idx] * w;
        gAcc += src[idx + 1] * w;
        bAcc += src[idx + 2] * w;
        aAcc += src[idx + 3] * w;
      }
      const dIdx = (y * width + x) * 4;
      temp[dIdx] = Math.round(rAcc);
      temp[dIdx + 1] = Math.round(gAcc);
      temp[dIdx + 2] = Math.round(bAcc);
      temp[dIdx + 3] = Math.round(aAcc);
    }
  }

  // Vertical pass (temp → out)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;
      for (let k = 0; k < kSize; k++) {
        const sy = Math.min(Math.max(y + k - kHalf, 0), height - 1);
        const idx = (sy * width + x) * 4;
        const w = kernel[k];
        rAcc += temp[idx] * w;
        gAcc += temp[idx + 1] * w;
        bAcc += temp[idx + 2] * w;
        aAcc += temp[idx + 3] * w;
      }
      const dIdx = (y * width + x) * 4;
      out[dIdx] = Math.round(rAcc);
      out[dIdx + 1] = Math.round(gAcc);
      out[dIdx + 2] = Math.round(bAcc);
      out[dIdx + 3] = Math.round(aAcc);
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
  const sigma = radius / 3; // 3-sigma rule: 99.7% of distribution within radius
  const twoSigmaSq = 2 * sigma * sigma;
  let sum = 0;

  for (let i = 0; i < size; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / twoSigmaSq);
    sum += kernel[i];
  }

  // Normalize
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}
