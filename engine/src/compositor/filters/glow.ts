/**
 * Glow / Bloom filter implementation.
 *
 * Used by: Lights/Bloom, Lights/Lens Flare, and other light-based transitions.
 * Plugin names: PAEGlow, PAEBloom, Glow, Bloom
 *
 * Algorithm:
 *   1. Extract pixels above brightness threshold
 *   2. Blur the thresholded image (Gaussian)
 *   3. Add the blurred highlights back onto the original (screen blend)
 *
 * Parameters:
 *   - Radius: blur radius for the glow spread (default 0)
 *   - Threshold: brightness threshold 0-1 (pixels below this don't glow)
 *   - Amount/Intensity: strength of the glow overlay (default 1)
 */
import { gaussianBlur } from './gaussian-blur.js';

export interface GlowParams {
  radius: number;
  threshold: number;
  amount: number;
}

/**
 * Apply glow/bloom effect to an image.
 */
export function glowFilter(input: ImageData, params: GlowParams): ImageData {
  const { radius, threshold, amount } = params;
  if (radius <= 0 || amount <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;

  // Step 1: Extract bright pixels (above threshold)
  const brightData = new Uint8ClampedArray(width * height * 4);
  const thresholdByte = Math.round(threshold * 255);

  for (let i = 0; i < src.length; i += 4) {
    // Compute luminance (perceived brightness)
    const lum = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    if (lum > thresholdByte) {
      // Keep this pixel for the glow
      brightData[i] = src[i];
      brightData[i + 1] = src[i + 1];
      brightData[i + 2] = src[i + 2];
      brightData[i + 3] = src[i + 3];
    }
    // else: stays zero (transparent)
  }

  // Step 2: Blur the bright pixels
  const brightImg = new ImageData(brightData, width, height);
  const blurred = gaussianBlur(brightImg, radius);

  // Step 3: Screen-blend the blurred glow back onto the original
  const out = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < src.length; i += 4) {
    // Screen blend: result = 1 - (1 - base) * (1 - glow*amount)
    // Simplified for bytes: R = base + glow*amount - base*glow*amount/255
    for (let c = 0; c < 3; c++) {
      const base = src[i + c];
      const glow = blurred.data[i + c] * amount;
      out[i + c] = Math.min(255, Math.round(base + glow - (base * glow) / 255));
    }
    out[i + 3] = src[i + 3]; // preserve alpha
  }

  return new ImageData(out, width, height);
}
