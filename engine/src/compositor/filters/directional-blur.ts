/**
 * Directional Blur filter implementation.
 *
 * Used by: Blurs/Directional and several stylized transitions.
 * Plugin names: PAEDirectionalBlur, Directional Blur
 *
 * Parameters:
 *   - Amount: blur distance in pixels
 *   - Angle: direction of the blur in degrees (0 = horizontal right)
 *
 * Implementation: sample along the blur direction vector, averaging pixels.
 */

/**
 * Apply directional (motion) blur to an image.
 * @param input - Source image
 * @param amount - Blur distance in pixels
 * @param angle - Blur direction in degrees (0 = right, 90 = up)
 */
export function directionalBlur(input: ImageData, amount: number, angle: number): ImageData {
  if (amount <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  // Compute direction vector from angle
  const rad = angle * Math.PI / 180;
  const dx = Math.cos(rad);
  const dy = -Math.sin(rad); // Y-up → screen Y-down

  // Number of samples along the blur direction
  const samples = Math.max(3, Math.min(Math.ceil(amount) * 2 + 1, 101));
  const halfSamples = Math.floor(samples / 2);
  const step = amount / halfSamples;
  const weight = 1 / samples;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;

      for (let s = -halfSamples; s <= halfSamples; s++) {
        const sx = Math.round(x + dx * s * step);
        const sy = Math.round(y + dy * s * step);

        // Clamp to bounds
        const cx = Math.max(0, Math.min(width - 1, sx));
        const cy = Math.max(0, Math.min(height - 1, sy));
        const idx = (cy * width + cx) * 4;

        rAcc += src[idx] * weight;
        gAcc += src[idx + 1] * weight;
        bAcc += src[idx + 2] * weight;
        aAcc += src[idx + 3] * weight;
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
 * Radial Blur: blur radiating outward from a center point.
 * Plugin names: PAERadialBlur, Radial Blur
 *
 * @param input - Source image
 * @param amount - Blur intensity (degrees of rotation for spin, or distance for zoom)
 * @param centerX - Center X (0-1, relative to frame)
 * @param centerY - Center Y (0-1, relative to frame)
 * @param type - 'spin' (rotational) or 'zoom' (radial outward)
 */
export function radialBlur(input: ImageData, amount: number, centerX: number = 0.5, centerY: number = 0.5, type: 'spin' | 'zoom' = 'spin'): ImageData {
  if (amount <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  const cx = centerX * width;
  const cy = centerY * height;
  const samples = Math.max(3, Math.min(Math.ceil(amount * 2) + 1, 51));
  const weight = 1 / samples;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      for (let s = 0; s < samples; s++) {
        const t = (s / (samples - 1) - 0.5) * amount;
        let sx: number, sy: number;

        if (type === 'spin') {
          // Rotational: rotate each sample point around center
          const angle = (t / 180) * Math.PI * (dist / Math.max(width, height));
          const cosA = Math.cos(angle), sinA = Math.sin(angle);
          sx = cx + dx * cosA - dy * sinA;
          sy = cy + dx * sinA + dy * cosA;
        } else {
          // Zoom: scale each sample outward from center
          const scale = 1 + t * 0.01;
          sx = cx + dx * scale;
          sy = cy + dy * scale;
        }

        const ix = Math.max(0, Math.min(width - 1, Math.round(sx)));
        const iy = Math.max(0, Math.min(height - 1, Math.round(sy)));
        const idx = (iy * width + ix) * 4;

        rAcc += src[idx] * weight;
        gAcc += src[idx + 1] * weight;
        bAcc += src[idx + 2] * weight;
        aAcc += src[idx + 3] * weight;
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
 * Zoom Blur: blur radiating outward (zoom effect).
 * Plugin names: PAEZoomBlur, Zoom Blur
 */
export function zoomBlur(input: ImageData, amount: number, centerX: number = 0.5, centerY: number = 0.5): ImageData {
  return radialBlur(input, amount, centerX, centerY, 'zoom');
}

import { registerFilter } from './registry.js';

// Directional Blur (PAEDirectionalBlur, UUID 2E7B1340-…). Faithful to the legacy
// branch: Mix gate; Amount (fallback Distance) via blurAmount; Angle via param.
registerFilter({
  uuid: '2E7B1340-5D4F-4015-8AA0-53BEB9F2CA52',
  names: ['directional'],
  label: 'Directional Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', ctx.blurAmount('Distance', 0));
    const angle = ctx.param('Angle', 0);
    if (mix > 0 && amount > 0) return directionalBlur(input, amount, angle);
    return input;
  },
});

// Radial Blur (PAERadialBlur, UUID 8F9F88CF-…). Faithful: Mix gate; Amount (fallback
// Angle) via blurAmount; spin about the frame center.
registerFilter({
  uuid: '8F9F88CF-F1DC-4C7E-8946-1A8B53B4F53A',
  names: ['radial'],
  label: 'Radial Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', ctx.blurAmount('Angle', 0));
    if (mix > 0 && amount > 0) return radialBlur(input, amount, 0.5, 0.5, 'spin');
    return input;
  },
});

// Zoom Blur (PAEZoomBlur, UUID 11C0E095-…). Faithful: Mix gate; Amount via blurAmount;
// zoom about the frame center. (The "(for OSC)" preview variant shares this UUID but is
// skipped by the OSC check in applyFilter before the registry lookup.)
registerFilter({
  uuid: '11C0E095-5F4F-46E2-AE28-F56ED7D38D7E',
  names: ['zoom'],
  label: 'Zoom Blur',
  apply(input, ctx) {
    const mix = ctx.param('Mix', 1);
    const amount = ctx.blurAmount('Amount', 0);
    if (mix > 0 && amount > 0) return zoomBlur(input, amount, 0.5, 0.5);
    return input;
  },
});
