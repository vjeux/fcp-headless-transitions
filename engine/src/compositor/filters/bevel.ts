/**
 * Bevel filter.
 *
 * Adds a lit 3D beveled edge along the alpha boundary of a layer.
 * Used by ~7 transitions (panels, tiles with dimensional edges).
 * Plugin name: Bevel
 *
 * Parameters:
 *   - Bevel Width: width of the bevel edge in pixels
 *   - Light Angle: direction of the light (degrees)
 *   - Light Color: highlight color
 *   - Opacity: bevel strength
 *   - Mix: blend with original
 *
 * Algorithm: compute the alpha gradient (edge normal), light it with a
 * directional light, and add highlights/shadows along the edges.
 */

export interface BevelParams {
  width: number;      // bevel width in pixels
  lightAngle: number; // degrees
  opacity: number;    // 0-1
  mix: number;        // 0-1
}

/**
 * Apply bevel effect to an image.
 */
export function bevelFilter(input: ImageData, params: BevelParams): ImageData {
  const { width: bevelWidth, lightAngle, opacity, mix } = params;
  if (bevelWidth <= 0 || opacity <= 0) return input;

  const w = input.width;
  const h = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src);

  // Light direction
  const rad = lightAngle * Math.PI / 180;
  const lx = Math.cos(rad);
  const ly = -Math.sin(rad);

  const step = Math.max(1, Math.round(bevelWidth));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const a = src[idx + 3];
      if (a === 0) continue; // outside the shape

      // Compute alpha gradient (edge normal) via central differences
      const xl = Math.max(0, x - step), xr = Math.min(w - 1, x + step);
      const yt = Math.max(0, y - step), yb = Math.min(h - 1, y + step);
      const aL = src[(y * w + xl) * 4 + 3];
      const aR = src[(y * w + xr) * 4 + 3];
      const aT = src[(yt * w + x) * 4 + 3];
      const aB = src[(yb * w + x) * 4 + 3];

      const gx = (aR - aL) / 255;
      const gy = (aB - aT) / 255;
      const gradMag = Math.sqrt(gx * gx + gy * gy);

      if (gradMag < 0.01) continue; // interior — no bevel

      // Normalize gradient (points from transparent → opaque = edge normal)
      const nx = -gx / gradMag;
      const ny = -gy / gradMag;

      // Dot with light direction → highlight (+) or shadow (-)
      const light = nx * lx + ny * ly;

      // Apply as brightness delta scaled by gradient magnitude, opacity
      const delta = light * gradMag * opacity * 128;
      const finalDelta = delta * mix;

      for (let c = 0; c < 3; c++) {
        out[idx + c] = Math.max(0, Math.min(255, src[idx + c] + finalDelta));
      }
    }
  }

  return new ImageData(out, w, h);
}

import { registerFilter } from './registry.js';

// Bevel (UUID 9C655247-…). Behavior-identical to the legacy name-matched branch:
// reads Bevel Width / Light Angle / Opacity / Mix (defaults 0/135/1/1); a width of
// 0 leaves the input unchanged (filter authored-inactive).
registerFilter({
  uuid: '9C655247-E514-458B-83BA-B3F63EFFD241',
  names: ['bevel'],
  label: 'Bevel',
  apply(input, ctx) {
    const width = ctx.param('Bevel Width', 0);
    if (width <= 0) return input;
    const lightAngle = ctx.param('Light Angle', 135);
    const opacity = ctx.param('Opacity', 1);
    const mix = ctx.param('Mix', 1);
    return bevelFilter(input, { width, lightAngle, opacity, mix });
  },
});
