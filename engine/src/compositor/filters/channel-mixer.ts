/**
 * Channel Mixer filter implementation.
 *
 * Used by: 16 transitions for color manipulation (desaturation, color swap, tinting).
 * Plugin name: Channel Mixer
 *
 * Parameters (4x4 matrix + offsets):
 *   Red - Red, Red - Green, Red - Blue, Red - Alpha   → row 0
 *   Green - Red, Green - Green, Green - Blue, Green - Alpha → row 1
 *   Blue - Red, Blue - Green, Blue - Blue, Blue - Alpha  → row 2
 *   Alpha - Red, Alpha - Green, Alpha - Blue, Alpha - Alpha → row 3
 *   Red Output, Green Output, Blue Output, Alpha Output → offset per channel
 *   Mix (0-1): blend original vs processed
 *   Monochrome (bool): convert to grayscale first
 *
 * Formula: outChannel = sum(inChannels * row) + offset
 */

export interface ChannelMixerParams {
  matrix: number[]; // 4x4 row-major [RR,RG,RB,RA, GR,GG,GB,GA, BR,BG,BB,BA, AR,AG,AB,AA]
  offsets: number[]; // [R,G,B,A] output offsets (0-1 normalized)
  mix: number;
  monochrome: boolean;
}

/**
 * Apply channel mixer to an image.
 */
export function channelMixerFilter(input: ImageData, params: ChannelMixerParams): ImageData {
  const { matrix, offsets, mix, monochrome } = params;
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i] / 255;
    let g = src[i + 1] / 255;
    let b = src[i + 2] / 255;
    let a = src[i + 3] / 255;

    if (monochrome) {
      // Convert to grayscale first (luminance-based)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = lum;
    }

    // Apply 4x4 matrix
    const outR = matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3] * a + offsets[0];
    const outG = matrix[4] * r + matrix[5] * g + matrix[6] * b + matrix[7] * a + offsets[1];
    const outB = matrix[8] * r + matrix[9] * g + matrix[10] * b + matrix[11] * a + offsets[2];
    const outA = matrix[12] * r + matrix[13] * g + matrix[14] * b + matrix[15] * a + offsets[3];

    // Mix with original
    if (mix >= 1) {
      out[i] = Math.round(Math.max(0, Math.min(1, outR)) * 255);
      out[i + 1] = Math.round(Math.max(0, Math.min(1, outG)) * 255);
      out[i + 2] = Math.round(Math.max(0, Math.min(1, outB)) * 255);
      out[i + 3] = Math.round(Math.max(0, Math.min(1, outA)) * 255);
    } else {
      out[i] = Math.round((src[i] / 255 * (1 - mix) + Math.max(0, Math.min(1, outR)) * mix) * 255);
      out[i + 1] = Math.round((src[i + 1] / 255 * (1 - mix) + Math.max(0, Math.min(1, outG)) * mix) * 255);
      out[i + 2] = Math.round((src[i + 2] / 255 * (1 - mix) + Math.max(0, Math.min(1, outB)) * mix) * 255);
      out[i + 3] = Math.round((src[i + 3] / 255 * (1 - mix) + Math.max(0, Math.min(1, outA)) * mix) * 255);
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Colorize filter (simplified channel mixer variant).
 * Maps luminance to a target hue/saturation.
 * Plugin names: PAEColorize, Colorize
 */
export function colorizeFilter(input: ImageData, hue: number, saturation: number, mix: number = 1): ImageData {
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  // Convert hue (degrees) to RGB multipliers
  const hRad = (hue % 360) * Math.PI / 180;
  const tR = 0.5 + Math.cos(hRad) * 0.5;
  const tG = 0.5 + Math.cos(hRad - 2.094) * 0.5; // -120°
  const tB = 0.5 + Math.cos(hRad + 2.094) * 0.5; // +120°

  for (let i = 0; i < src.length; i += 4) {
    const lum = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;
    // Tint: lerp between grayscale and colorized based on saturation
    const colR = lum * tR * saturation + lum * (1 - saturation);
    const colG = lum * tG * saturation + lum * (1 - saturation);
    const colB = lum * tB * saturation + lum * (1 - saturation);

    if (mix >= 1) {
      out[i] = Math.round(Math.max(0, Math.min(1, colR)) * 255);
      out[i + 1] = Math.round(Math.max(0, Math.min(1, colG)) * 255);
      out[i + 2] = Math.round(Math.max(0, Math.min(1, colB)) * 255);
    } else {
      out[i] = Math.round((src[i] * (1 - mix) + Math.max(0, Math.min(1, colR)) * 255 * mix));
      out[i + 1] = Math.round((src[i + 1] * (1 - mix) + Math.max(0, Math.min(1, colG)) * 255 * mix));
      out[i + 2] = Math.round((src[i + 2] * (1 - mix) + Math.max(0, Math.min(1, colB)) * 255 * mix));
    }
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}

/**
 * Tint filter (PAETint / TintFx).
 * Tints the image toward a target color, scaled by luminance and intensity.
 * @param r, g, b - target tint color (0-1)
 * @param intensity - tint strength (0-1)
 * @param mix - blend with original
 */
export function tintFilter(input: ImageData, r: number, g: number, b: number, intensity: number, mix: number = 1): ImageData {
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    const lum = (0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2]) / 255;
    // Tinted color = luminance × target color
    const tR = lum * r * 255;
    const tG = lum * g * 255;
    const tB = lum * b * 255;
    // Apply intensity (blend between original and tinted)
    const iR = src[i] * (1 - intensity) + tR * intensity;
    const iG = src[i + 1] * (1 - intensity) + tG * intensity;
    const iB = src[i + 2] * (1 - intensity) + tB * intensity;
    // Apply mix (blend with original)
    if (mix >= 1) {
      out[i] = Math.round(iR); out[i + 1] = Math.round(iG); out[i + 2] = Math.round(iB);
    } else {
      out[i] = Math.round(src[i] * (1 - mix) + iR * mix);
      out[i + 1] = Math.round(src[i + 1] * (1 - mix) + iG * mix);
      out[i + 2] = Math.round(src[i + 2] * (1 - mix) + iB * mix);
    }
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}
