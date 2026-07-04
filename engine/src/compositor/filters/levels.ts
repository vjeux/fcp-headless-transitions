/**
 * Levels filter implementation.
 *
 * Used by: Many transitions (27+) for brightness/contrast control.
 * Plugin names: PAELevels, Levels
 *
 * Parameters:
 *   - Black In (0-1): input black point (pixels below → 0)
 *   - White In (0-1): input white point (pixels above → 1)
 *   - Gamma (0.1-10): midtone gamma correction (1.0 = neutral)
 *   - White Out (0-1): output white level (remaps output range)
 *   - Mix (0-1): blend original vs processed (1.0 = full effect)
 *
 * Formula per channel:
 *   normalized = clamp((input - blackIn) / (whiteIn - blackIn), 0, 1)
 *   gammaCorrected = pow(normalized, 1/gamma)
 *   output = gammaCorrected * whiteOut
 */

export interface LevelsParams {
  blackIn: number;   // 0-1, default 0
  whiteIn: number;   // 0-1, default 1
  gamma: number;     // default 1.0
  whiteOut: number;  // 0-1, default 1
  mix: number;       // 0-1, default 1
}

/**
 * Apply levels adjustment to an image.
 */
export function levelsFilter(input: ImageData, params: LevelsParams): ImageData {
  const { blackIn, whiteIn, gamma, whiteOut, mix } = params;

  // No-op check
  if (blackIn === 0 && whiteIn === 1 && gamma === 1 && whiteOut === 1) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  const range = whiteIn - blackIn;
  const invGamma = gamma !== 0 ? 1 / gamma : 1;

  // Build lookup table for speed (256 entries per channel)
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const normalized = Math.max(0, Math.min(1, (i / 255 - blackIn) / (range || 0.001)));
    const gammaCorrected = Math.pow(normalized, invGamma);
    const output = gammaCorrected * whiteOut;
    lut[i] = Math.round(Math.max(0, Math.min(1, output)) * 255);
  }

  for (let i = 0; i < src.length; i += 4) {
    if (mix >= 1) {
      out[i] = lut[src[i]];
      out[i + 1] = lut[src[i + 1]];
      out[i + 2] = lut[src[i + 2]];
    } else {
      // Blend original with processed
      out[i] = Math.round(src[i] * (1 - mix) + lut[src[i]] * mix);
      out[i + 1] = Math.round(src[i + 1] * (1 - mix) + lut[src[i + 1]] * mix);
      out[i + 2] = Math.round(src[i + 2] * (1 - mix) + lut[src[i + 2]] * mix);
    }
    out[i + 3] = src[i + 3]; // preserve alpha
  }

  return new ImageData(out, width, height);
}

/**
 * Simple brightness adjustment (additive).
 * Plugin names: Brightness, Brightness copy
 */
export function brightnessFilter(input: ImageData, amount: number): ImageData {
  if (amount === 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const add = Math.round(amount * 255);

  for (let i = 0; i < src.length; i += 4) {
    out[i] = Math.max(0, Math.min(255, src[i] + add));
    out[i + 1] = Math.max(0, Math.min(255, src[i + 1] + add));
    out[i + 2] = Math.max(0, Math.min(255, src[i + 2] + add));
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
