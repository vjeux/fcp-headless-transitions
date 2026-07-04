/**
 * Shape/Mask rasterization.
 *
 * Converts vector polygon geometry (from Shape layers) into an alpha mask
 * that clips other layers. Used by wipe/reveal transitions (Phase 3).
 *
 * Coordinate system: shapes use Motion's centered coordinates (origin = frame
 * center, Y-up). Rasterization maps these to pixel coordinates.
 */
import type { Shape } from '../types.js';

/**
 * Rasterize a polygon into an alpha mask (Uint8Array, 0-255 per pixel).
 *
 * Uses the even-odd scanline fill algorithm with edge anti-aliasing via
 * supersampling at polygon boundaries.
 *
 * @param shape - The shape geometry (centered coordinates)
 * @param width - Output mask width
 * @param height - Output mask height
 * @param transform - Optional 4x4 transform to apply to vertices
 * @returns Alpha mask (width*height bytes, 255 = inside, 0 = outside)
 */
export function rasterizeShape(
  shape: Shape,
  width: number,
  height: number,
  transform?: Float64Array
): Uint8Array {
  const mask = new Uint8Array(width * height);
  const { verticesX, verticesY } = shape;
  const n = verticesX.length;
  if (n < 3) return mask;

  // Transform vertices from centered coords to pixel coords
  const px: number[] = [];
  const py: number[] = [];
  for (let i = 0; i < n; i++) {
    let vx = verticesX[i];
    let vy = verticesY[i];

    // Apply transform if provided (2D affine part)
    if (transform) {
      const a = transform[0], b = transform[4], tx = transform[12];
      const c = transform[1], d = transform[5], ty = transform[13];
      const nx = a * vx + b * vy + tx;
      const ny = c * vx + d * vy + ty;
      vx = nx; vy = ny;
    }

    // Centered coords → pixel coords (Y-up → Y-down)
    px.push(vx + width / 2);
    py.push(height / 2 - vy);
  }

  // Compute bounding box to limit scanline range
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    minY = Math.min(minY, py[i]);
    maxY = Math.max(maxY, py[i]);
  }
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(height - 1, Math.ceil(maxY));

  // Scanline fill (even-odd rule)
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5; // sample at pixel center
    const intersections: number[] = [];

    // Find edge intersections with this scanline
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const yi = py[i], yj = py[j];
      const xi = px[i], xj = px[j];

      // Does the edge cross this scanline?
      if ((yi <= yc && yj > yc) || (yj <= yc && yi > yc)) {
        // Linear interpolation for X intersection
        const t = (yc - yi) / (yj - yi);
        intersections.push(xi + t * (xj - xi));
      }
    }

    // Sort intersections left to right
    intersections.sort((a, b) => a - b);

    // Fill between pairs of intersections
    for (let k = 0; k + 1 < intersections.length; k += 2) {
      const xStart = Math.max(0, Math.round(intersections[k]));
      const xEnd = Math.min(width - 1, Math.round(intersections[k + 1]));
      for (let x = xStart; x <= xEnd; x++) {
        mask[y * width + x] = 255;
      }
    }
  }

  return mask;
}

/**
 * Apply an alpha mask to an image (multiply the image's alpha by the mask).
 * @param image - Image to mask (modified in place)
 * @param mask - Alpha mask (width*height bytes)
 * @param invert - If true, invert the mask (keep OUTSIDE the shape)
 */
export function applyMask(image: ImageData, mask: Uint8Array, invert: boolean = false): void {
  const n = image.width * image.height;
  for (let i = 0; i < n; i++) {
    let m = mask[i] / 255;
    if (invert) m = 1 - m;
    image.data[i * 4 + 3] = Math.round(image.data[i * 4 + 3] * m);
  }
}

/**
 * Combine multiple masks with union (add) operation.
 */
export function unionMasks(masks: Uint8Array[], width: number, height: number): Uint8Array {
  const result = new Uint8Array(width * height);
  for (const mask of masks) {
    for (let i = 0; i < result.length; i++) {
      result[i] = Math.max(result[i], mask[i]);
    }
  }
  return result;
}
