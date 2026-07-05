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
 * Rasterize a shape (polygon or bezier path) into an alpha mask.
 *
 * The shape's outline is first flattened into a polyline: straight segments
 * between corner vertices, and cubic-bezier segments where control handles
 * (out-tangent of A, in-tangent of B) are present. The resulting polygon is
 * then filled with the even-odd scanline rule at 4× vertical / horizontal
 * supersampling for anti-aliased edges.
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
  transform?: Float64Array,
  cameraZ?: number,
  cameraPosZ?: number
): Uint8Array {
  const mask = new Uint8Array(width * height);
  const { verticesX, verticesY } = shape;
  const n = verticesX.length;
  if (n < 3) return mask;

  // A shape that lives at a non-zero world Z (or is 3D-rotated) must be projected
  // through the camera's perspective, exactly like an image quad (projectQuad):
  // Stylized/Documentary/Close & Open builds a 3D BOX of white-fill polygons
  // (Z from −8000 to +5000) that a dolly camera frames. Without the perspective
  // divide those far/near cards render at their flat XY (tiny, near-centre) and
  // never tile the frame. `perspective` is enabled only when a finite cameraZ is
  // supplied AND the transform carries real 3D depth (Z translation column-3 or a
  // Z-coupled basis) — so ordinary 2D fill shapes (Flash/Panels/Heart/Wipes) keep
  // the exact affine path below and are byte-for-byte unchanged.
  const t = transform;
  const perspective = t !== undefined && cameraZ !== undefined && isFinite(cameraZ)
    && (Math.abs(t[2]) > 1e-6 || Math.abs(t[6]) > 1e-6 || Math.abs(t[8]) > 1e-6
      || Math.abs(t[9]) > 1e-6 || Math.abs(t[14]) > 1e-6);
  // Camera dolly: content is viewed from world Z = cameraPosZ, looking down −Z
  // (Motion convention). The viewer-space depth of world point wz is (cameraPosZ −
  // wz); the on-screen scale is the focal distance / that depth. When no camera
  // position is supplied, fall back to Motion's origin-camera divide (cameraZ + wz).
  const camP = cameraPosZ ?? 0;

  // --- Transform vertices (and tangent endpoints) into pixel coordinates. ---
  const toPixel = (vx: number, vy: number): [number, number] => {
    if (transform) {
      if (perspective) {
        const m = transform;
        // Full 4x4 (local vertex has z=0): world point.
        const wx = m[0] * vx + m[4] * vy + m[12];
        const wy = m[1] * vx + m[5] * vy + m[13];
        const wz = m[2] * vx + m[6] * vy + m[14];
        // Perspective divide. With an explicit camera dolly position the viewer-
        // space depth of world point wz is (cameraPosZ − wz) — content in FRONT of
        // the origin-facing camera has positive depth — and the on-screen scale is
        // the focal distance (cameraZ) over that depth. Content behind the camera
        // (depth ≤ 0) is culled. Falls back to Motion's origin-camera divide
        // (cameraZ + wz) when no camera position is supplied.
        const denom = cameraPosZ !== undefined ? (camP - wz) : (cameraZ! + wz);
        const s = denom > 1e-6 ? cameraZ! / denom : 0;
        vx = wx * s; vy = wy * s;
      } else {
        const a = transform[0], b = transform[4], tx = transform[12];
        const c = transform[1], d = transform[5], ty = transform[13];
        const nx = a * vx + b * vy + tx;
        const ny = c * vx + d * vy + ty;
        vx = nx; vy = ny;
      }
    }
    // Centered coords → pixel coords (Y-up → Y-down)
    return [vx + width / 2, height / 2 - vy];
  };

  const px: number[] = [];
  const py: number[] = [];
  for (let i = 0; i < n; i++) {
    const [x, y] = toPixel(verticesX[i], verticesY[i]);
    px.push(x); py.push(y);
  }

  // --- Flatten the outline into a polyline of pixel-space points. ---
  const closed = shape.closed !== false;
  const segCount = closed ? n : n - 1;
  const poly: number[][] = [];
  const { inTangentX, inTangentY, outTangentX, outTangentY, hasTangents } = shape;

  poly.push([px[0], py[0]]);
  for (let i = 0; i < segCount; i++) {
    const a = i;
    const b = (i + 1) % n;

    let curved = false;
    let c1x = 0, c1y = 0, c2x = 0, c2y = 0;
    if (hasTangents && outTangentX && inTangentX) {
      const oatx = outTangentX[a], oaty = outTangentY![a];
      const ibtx = inTangentX[b], ibty = inTangentY![b];
      if (oatx !== undefined || oaty !== undefined || ibtx !== undefined || ibty !== undefined) {
        // Tangents are relative offsets from the vertex position (centered coords).
        // Control point 1 = vertexA + outTangentA, control point 2 = vertexB + inTangentB.
        const [p1x, p1y] = toPixel(verticesX[a] + (oatx ?? 0), verticesY[a] + (oaty ?? 0));
        const [p2x, p2y] = toPixel(verticesX[b] + (ibtx ?? 0), verticesY[b] + (ibty ?? 0));
        c1x = p1x; c1y = p1y; c2x = p2x; c2y = p2y;
        curved = true;
      }
    }

    if (curved) {
      // Adaptive-ish subdivision: pick a step count from the chord/handle spread.
      const spread = Math.hypot(c1x - px[a], c1y - py[a]) + Math.hypot(c2x - px[b], c2y - py[b])
        + Math.hypot(px[b] - px[a], py[b] - py[a]);
      const steps = Math.max(8, Math.min(64, Math.ceil(spread / 8)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const mt = 1 - t;
        const bx = mt * mt * mt * px[a] + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * px[b];
        const by = mt * mt * mt * py[a] + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * py[b];
        poly.push([bx, by]);
      }
    } else {
      poly.push([px[b], py[b]]);
    }
  }

  return fillPolygonAA(poly, width, height);
}

/**
 * Fill a closed polygon (array of [x,y] pixel points) into an alpha mask using
 * the even-odd rule with 4× supersampling for anti-aliased edges.
 */
function fillPolygonAA(poly: number[][], width: number, height: number): Uint8Array {
  const mask = new Uint8Array(width * height);
  const m = poly.length;
  if (m < 3) return mask;

  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of poly) { minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(height - 1, Math.ceil(maxY));

  const SS = 4;                 // vertical supersamples per pixel row
  const inv = 1 / SS;
  const cover = new Float32Array(width); // fractional coverage accumulator per row

  for (let y = y0; y <= y1; y++) {
    cover.fill(0);
    for (let sub = 0; sub < SS; sub++) {
      const yc = y + (sub + 0.5) * inv;
      const xs: number[] = [];
      for (let i = 0; i < m; i++) {
        const j = (i + 1) % m;
        const yi = poly[i][1], yj = poly[j][1];
        const xi = poly[i][0], xj = poly[j][0];
        if ((yi <= yc && yj > yc) || (yj <= yc && yi > yc)) {
          const t = (yc - yi) / (yj - yi);
          xs.push(xi + t * (xj - xi));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        addSpanCoverage(cover, xs[k], xs[k + 1], width, inv);
      }
    }
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const c = cover[x];
      if (c > 0) mask[row + x] = c >= 1 ? 255 : Math.round(c * 255);
    }
  }

  return mask;
}

/**
 * Add horizontal coverage for a span [xStart,xEnd) with per-sub-scanline weight
 * `weight`, computing partial coverage at the fractional endpoints (horizontal AA).
 */
function addSpanCoverage(cover: Float32Array, xStart: number, xEnd: number, width: number, weight: number): void {
  if (xEnd <= xStart) return;
  const lo = Math.max(0, xStart);
  const hi = Math.min(width, xEnd);
  if (hi <= lo) return;
  let x = Math.floor(lo);
  while (x < hi) {
    const cellLo = Math.max(lo, x);
    const cellHi = Math.min(hi, x + 1);
    const frac = cellHi - cellLo; // 0..1 portion of this pixel column covered
    if (frac > 0 && x >= 0 && x < width) cover[x] += frac * weight;
    x++;
  }
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
