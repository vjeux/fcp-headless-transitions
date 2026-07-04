/**
 * Luma Keyer filter.
 *
 * Makes pixels transparent based on their luminance (brightness).
 * Used by luma-based reveal transitions.
 * Plugin name: Luma Keyer
 *
 * Parameters:
 *   - Luma: threshold luminance (0-1) — pixels near this become transparent
 *   - Luma Rolloff / DefaultSoftness: softness of the key edge
 *   - Strength: how strongly to apply the key (0-1)
 *   - Invert: flip which side is keyed
 */

export interface LumaKeyerParams {
  luma: number;      // 0-1 threshold
  rolloff: number;   // softness
  strength: number;  // 0-1
  invert: boolean;
}

/**
 * Apply luma keying to an image (modifies alpha based on luminance).
 */
export function lumaKeyerFilter(input: ImageData, params: LumaKeyerParams): ImageData {
  const { luma, rolloff, strength, invert } = params;
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src);

  const threshold = luma;
  const softness = Math.max(0.001, rolloff);

  for (let i = 0; i < src.length; i += 4) {
    const lum = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;

    // Compute key value: 0 = fully keyed (transparent), 1 = fully visible
    // Pixels below (threshold - softness) → keyed; above → visible; smooth in between
    let key: number;
    if (lum <= threshold - softness) {
      key = 0;
    } else if (lum >= threshold + softness) {
      key = 1;
    } else {
      key = (lum - (threshold - softness)) / (2 * softness);
    }

    if (invert) key = 1 - key;

    // Apply strength: blend between original alpha and keyed alpha
    const origAlpha = src[i + 3];
    const keyedAlpha = origAlpha * key;
    out[i + 3] = Math.round(origAlpha * (1 - strength) + keyedAlpha * strength);
  }

  return new ImageData(out, width, height);
}
