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
import { decimatedGaussianBlur } from './gaussian-blur.js';
import { luma601 } from '../blend.js';

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

  const n = src.length;
  for (let i = 0; i < n; i += 4) {
    // Compute luminance (perceived brightness)
    const lum = luma601(src[i], src[i + 1], src[i + 2]);
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
  const blurred = decimatedGaussianBlur(brightImg, radius);

  // Step 3: Blend the blurred glow back onto the original.
  // For amount <= 1: screen blend (gentle). For amount > 1: additive accumulation
  // (matches FCP's bloom overexposure that blows highlights toward white).
  // PERF: the per-channel branch is hoisted out of the pixel loop (the additive vs
  // screen decision is loop-invariant) and the c-loop is unrolled. Math is identical.
  const out = new Uint8ClampedArray(width * height * 4);
  const bdata = blurred.data;
  if (amount > 1) {
    for (let i = 0; i < n; i += 4) {
      out[i]     = Math.min(255, Math.round(src[i]     + bdata[i]     * amount));
      out[i + 1] = Math.min(255, Math.round(src[i + 1] + bdata[i + 1] * amount));
      out[i + 2] = Math.min(255, Math.round(src[i + 2] + bdata[i + 2] * amount));
      out[i + 3] = src[i + 3];
    }
  } else {
    for (let i = 0; i < n; i += 4) {
      let base = src[i];       let glow = bdata[i]     * amount; out[i]     = Math.min(255, Math.round(base + glow - (base * glow) / 255));
      base = src[i + 1];       glow = bdata[i + 1]     * amount; out[i + 1] = Math.min(255, Math.round(base + glow - (base * glow) / 255));
      base = src[i + 2];       glow = bdata[i + 2]     * amount; out[i + 2] = Math.min(255, Math.round(base + glow - (base * glow) / 255));
      out[i + 3] = src[i + 3];
    }
  }

  return new ImageData(out, width, height);
}

import { registerFilter } from './registry.js';

// Glow (PAEGlow, UUID 73F69C87-…). Behavior-identical to the legacy branch:
// Radius/Threshold(raw)/intensity(Opacity or Intensity, default 1); a radius<=0 or
// intensity<=0 leaves input unchanged.
registerFilter({
  uuid: '73F69C87-7226-4F7A-81F2-F5E378501423',
  names: ['glow'],
  label: 'Glow',
  apply(input, ctx) {
    const radius = ctx.param('Radius', 0);
    const threshold = ctx.param('Threshold', 0);
    const intensity = ctx.has('Opacity') ? ctx.param('Opacity', 1) : ctx.param('Intensity', 1);
    if (radius > 0 && intensity > 0) return glowFilter(input, { radius, threshold, amount: intensity });
    return input;
  },
});

// Bloom (PAEBloom, UUID 5599C557-…). Behavior-identical to the legacy branch:
// Amount (blur spread) / Brightness (0-100, ÷100) / Threshold (0-100, ÷100),
// rendered via glowFilter; amount<=0 or brightness<=0 leaves input unchanged.
registerFilter({
  uuid: '5599C557-CDC0-4112-B2C4-355E9A1A902E',
  names: ['bloom'],
  label: 'Bloom',
  apply(input, ctx) {
    const amount = ctx.param('Amount', 0);
    const brightness = ctx.param('Brightness', 1);
    const threshold = ctx.param('Threshold', 0);
    if (amount > 0 && brightness > 0) {
      return glowFilter(input, { radius: amount, threshold: threshold / 100, amount: brightness / 100 });
    }
    return input;
  },
});
