/**
 * Hue/Saturation filter implementation.
 *
 * Used by: 4 transitions for color shifting effects.
 * Plugin names: PAEHSVAdjust, Hue/Saturation
 *
 * Parameters:
 *   - Hue: rotation in degrees (-180 to +180)
 *   - Saturation: multiplier (0 = grayscale, 1 = unchanged, >1 = oversaturated)
 *   - Brightness/Value: offset (-1 to +1)
 *   - Mix: blend factor (0-1)
 */

export interface HueSatParams {
  hue: number;        // degrees of hue rotation
  saturation: number; // multiplier (1 = unchanged)
  brightness: number; // additive (-1 to 1)
  mix: number;        // blend factor
}

/** Convert RGB (0-1) to HSV. */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return [h, s, v];
}

/** Convert HSV to RGB (0-1). */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    case 5: return [v, p, q];
    default: return [v, v, v];
  }
}

/**
 * Apply Hue/Saturation adjustment.
 */
export function hueSaturationFilter(input: ImageData, params: HueSatParams): ImageData {
  const { hue, saturation, brightness, mix } = params;

  // No-op check
  if (hue === 0 && saturation === 1 && brightness === 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  const hueShift = hue / 360; // normalize to 0-1

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i] / 255;
    const g = src[i + 1] / 255;
    const b = src[i + 2] / 255;

    let [h, s, v] = rgbToHsv(r, g, b);

    // Apply adjustments
    h = (h + hueShift + 1) % 1; // rotate hue
    s = Math.max(0, Math.min(1, s * saturation)); // scale saturation
    v = Math.max(0, Math.min(1, v + brightness)); // offset brightness

    const [outR, outG, outB] = hsvToRgb(h, s, v);

    if (mix >= 1) {
      out[i] = Math.round(outR * 255);
      out[i + 1] = Math.round(outG * 255);
      out[i + 2] = Math.round(outB * 255);
    } else {
      out[i] = Math.round((r * (1 - mix) + outR * mix) * 255);
      out[i + 1] = Math.round((g * (1 - mix) + outG * mix) * 255);
      out[i + 2] = Math.round((b * (1 - mix) + outB * mix) * 255);
    }
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}


import { registerFilter } from './registry.js';

// HSV Adjust (PAEHSVAdjust, UUID D23AF030-…). FAITHFUL migration of the legacy
// dispatch, which read the filter's OWN params and IGNORED rig overrides — so this
// uses rawParam (not param). Hue (or 'Hue Rotation', default 0), Saturation (1),
// brightness from 'Brightness' or 'Value' (0), Mix (1).
// NOTE: whether HSV SHOULD honor rig overrides is a separate open question (ROADMAP)
// — honoring them changed Stylized__Color_Panels output (−0.84 dB), so the mechanical
// migration preserves the legacy raw-read behavior exactly.
registerFilter({
  uuid: 'D23AF030-B0BF-44DF-B622-7C9EA0DF5744',
  names: ['hsv', 'hue', 'saturation'],
  label: 'HSV Adjust',
  apply(input, ctx) {
    const hue = ctx.hasRaw('Hue') ? ctx.rawParam('Hue', 0) : ctx.rawParam('Hue Rotation', 0);
    const saturation = ctx.rawParam('Saturation', 1);
    const brightness = ctx.hasRaw('Brightness') ? ctx.rawParam('Brightness', 0) : ctx.rawParam('Value', 0);
    const mix = ctx.rawParam('Mix', 1);
    return hueSaturationFilter(input, { hue, saturation, brightness, mix });
  },
});
