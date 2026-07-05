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

  // Circle/ellipse detection: Motion stores circles as a 4-vertex closed path
  // whose control points sit at the N/E/S/W extremes (bezier circle). A naive
  // polygon fill of those 4 points draws a DIAMOND. Detect this pattern and
  // rasterize a true ellipse inscribed in the vertices' bounding box instead.
  if (n === 4 && shape.closed && isBezierEllipse(px, py)) {
    return rasterizeEllipse(px, py, width, height);
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
 * Detect a bezier circle/ellipse: 4 vertices where each lies on a different
 * side extreme (two on the horizontal axis at the vertical midpoint, two on the
 * vertical axis at the horizontal midpoint), i.e. N/E/S/W control points. This
 * is how Motion encodes circles (and rotated ellipses collapse to this in the
 * axis-aligned case). We test that the 4 points are the axis extremes of their
 * own bounding box and that opposite pairs are roughly symmetric.
 */
function isBezierEllipse(px: number[], py: number[]): boolean {
  const minX = Math.min(...px), maxX = Math.max(...px);
  const minY = Math.min(...py), maxY = Math.max(...py);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const rx = (maxX - minX) / 2, ry = (maxY - minY) / 2;
  if (rx < 1 || ry < 1) return false;
  // Each vertex should be at one of the four axis extremes (top/bottom/left/right
  // of the bbox, on the centre line of the other axis).
  const tol = Math.max(1.5, Math.max(rx, ry) * 0.06);
  let onLeft = 0, onRight = 0, onTop = 0, onBottom = 0;
  for (let i = 0; i < 4; i++) {
    const x = px[i], y = py[i];
    if (Math.abs(x - minX) < tol && Math.abs(y - cy) < tol) onLeft++;
    else if (Math.abs(x - maxX) < tol && Math.abs(y - cy) < tol) onRight++;
    else if (Math.abs(y - minY) < tol && Math.abs(x - cx) < tol) onTop++;
    else if (Math.abs(y - maxY) < tol && Math.abs(x - cx) < tol) onBottom++;
    else return false;
  }
  return onLeft === 1 && onRight === 1 && onTop === 1 && onBottom === 1;
}

/** Rasterize a (bezier) ellipse inscribed in the vertices' bounding box. */
function rasterizeEllipse(px: number[], py: number[], width: number, height: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const minX = Math.min(...px), maxX = Math.max(...px);
  const minY = Math.min(...py), maxY = Math.max(...py);
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  const rx = (maxX - minX) / 2, ry = (maxY - minY) / 2;
  if (rx < 0.5 || ry < 0.5) return mask;
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(height - 1, Math.ceil(maxY));
  for (let y = y0; y <= y1; y++) {
    const dy = (y + 0.5 - cy) / ry;
    if (Math.abs(dy) > 1) continue;
    const halfW = rx * Math.sqrt(Math.max(0, 1 - dy * dy));
    const xStart = Math.max(0, Math.round(cx - halfW));
    const xEnd = Math.min(width - 1, Math.round(cx + halfW));
    for (let x = xStart; x <= xEnd; x++) mask[y * width + x] = 255;
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
