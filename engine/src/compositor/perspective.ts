/**
 * 3D perspective projection for layer rendering.
 *
 * Used by transitions with 3D rotation (Fall, Flip, Doorway, Cube, Page Curl, etc.).
 * Projects a textured quad through a perspective camera and rasterizes it.
 *
 * Motion's default camera: perpendicular view with a focal length such that
 * content at Z=0 renders 1:1. Objects with Z≠0 or 3D rotation get perspective foreshortening.
 */

/** Default perspective distance (Motion's reference camera). */
const DEFAULT_CAMERA_Z = 2000;

/**
 * Project a 3D point (in Motion centered coords) to 2D screen coords with perspective.
 * @param x, y, z - 3D point (centered, Y-up, Z toward viewer)
 * @param cameraZ - Camera distance from Z=0 plane
 * @returns [screenX, screenY, perspectiveScale]
 */
export function projectPoint(x: number, y: number, z: number, cameraZ: number = DEFAULT_CAMERA_Z): [number, number, number] {
  // Perspective divide: points closer to camera (higher z) appear larger
  const denom = cameraZ - z;
  const scale = denom !== 0 ? cameraZ / denom : 1;
  return [x * scale, y * scale, scale];
}

/**
 * Transform and project the 4 corners of a source image quad.
 * @param worldTransform - 4x4 world transform matrix
 * @param srcWidth, srcHeight - source image dimensions
 * @param cameraZ - camera distance
 * @returns 4 projected screen-space corners [topLeft, topRight, bottomRight, bottomLeft], each [x, y, w]
 */
export function projectQuad(
  worldTransform: Float64Array,
  srcWidth: number,
  srcHeight: number,
  cameraZ: number = DEFAULT_CAMERA_Z
): Array<[number, number, number]> {
  const hw = srcWidth / 2;
  const hh = srcHeight / 2;

  // Source corners in centered local coords (Y-up)
  const corners: Array<[number, number, number]> = [
    [-hw, hh, 0],   // top-left
    [hw, hh, 0],    // top-right
    [hw, -hh, 0],   // bottom-right
    [-hw, -hh, 0],  // bottom-left
  ];

  const projected: Array<[number, number, number]> = [];
  for (const [lx, ly, lz] of corners) {
    // Apply full 4x4 transform (with Z)
    const wx = worldTransform[0] * lx + worldTransform[4] * ly + worldTransform[8] * lz + worldTransform[12];
    const wy = worldTransform[1] * lx + worldTransform[5] * ly + worldTransform[9] * lz + worldTransform[13];
    const wz = worldTransform[2] * lx + worldTransform[6] * ly + worldTransform[10] * lz + worldTransform[14];

    const [sx, sy, w] = projectPoint(wx, wy, wz, cameraZ);
    projected.push([sx, sy, w]);
  }

  return projected;
}

/**
 * Check if a transform requires 3D perspective rendering (has Z components).
 */
export function needsPerspective(worldTransform: Float64Array): boolean {
  // Check for non-trivial Z-axis components in the rotation part
  // (columns 2 = Z basis vector; if it's not [0,0,1], there's 3D rotation)
  const m2 = worldTransform[2], m6 = worldTransform[6], m8 = worldTransform[8], m9 = worldTransform[9];
  const m14 = worldTransform[14]; // Z translation
  const eps = 1e-6;
  return Math.abs(m2) > eps || Math.abs(m6) > eps || Math.abs(m8) > eps || Math.abs(m9) > eps || Math.abs(m14) > eps;
}

/**
 * Render a textured quad with perspective-correct interpolation.
 * Uses the projected corners and samples the source texture per output pixel.
 *
 * @param dst - Destination ImageData
 * @param src - Source ImageData (texture)
 * @param corners - 4 projected screen corners [TL, TR, BR, BL], each [x, y, w] (centered coords)
 * @param opacity - Layer opacity 0-1
 */
export function renderPerspectiveQuad(
  dst: ImageData,
  src: ImageData,
  corners: Array<[number, number, number]>,
  opacity: number
): void {
  const dw = dst.width, dh = dst.height;
  const sw = src.width, sh = src.height;

  // Convert projected corners from centered coords to pixel coords
  const pts = corners.map(([x, y, w]) => [x + dw / 2, dh / 2 - y, w] as [number, number, number]);

  // Bounding box of the quad
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [px, py] of pts) {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  }
  const x0 = Math.max(0, Math.floor(minX)), x1 = Math.min(dw - 1, Math.ceil(maxX));
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(dh - 1, Math.ceil(maxY));

  // The quad has UV coords: TL=(0,0), TR=(1,0), BR=(1,1), BL=(0,1)
  // We rasterize using two triangles with perspective-correct barycentric interpolation.
  const [TL, TR, BR, BL] = pts;
  const uvs: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // Two triangles: (TL, TR, BR) and (TL, BR, BL)
  const tris = [
    [0, 1, 2], // TL, TR, BR
    [0, 2, 3], // TL, BR, BL
  ];

  for (const [ia, ib, ic] of tris) {
    rasterizeTriangle(dst, src, pts[ia], pts[ib], pts[ic], uvs[ia], uvs[ib], uvs[ic], opacity, x0, x1, y0, y1);
  }
}

/** Rasterize one triangle with perspective-correct texture mapping. */
function rasterizeTriangle(
  dst: ImageData, src: ImageData,
  pa: [number, number, number], pb: [number, number, number], pc: [number, number, number],
  uva: [number, number], uvb: [number, number], uvc: [number, number],
  opacity: number, bx0: number, bx1: number, by0: number, by1: number
): void {
  const dw = dst.width;
  const sw = src.width, sh = src.height;

  const [ax, ay, aw] = pa, [bx, by, bw] = pb, [cx, cy, cw] = pc;

  // Triangle area (for barycentric coords)
  const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  if (Math.abs(area) < 1e-9) return;
  const invArea = 1 / area;

  // Perspective-correct: divide UV by w, interpolate, then multiply back
  const iwa = 1 / aw, iwb = 1 / bw, iwc = 1 / cw;
  const ua = uva[0] * iwa, va = uva[1] * iwa;
  const ub = uvb[0] * iwb, vb = uvb[1] * iwb;
  const uc = uvc[0] * iwc, vc = uvc[1] * iwc;

  const triMinX = Math.max(bx0, Math.floor(Math.min(ax, bx, cx)));
  const triMaxX = Math.min(bx1, Math.ceil(Math.max(ax, bx, cx)));
  const triMinY = Math.max(by0, Math.floor(Math.min(ay, by, cy)));
  const triMaxY = Math.min(by1, Math.ceil(Math.max(ay, by, cy)));

  for (let y = triMinY; y <= triMaxY; y++) {
    for (let x = triMinX; x <= triMaxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      // Barycentric coords
      const w0 = ((bx - px) * (cy - py) - (cx - px) * (by - py)) * invArea;
      const w1 = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) * invArea;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue; // outside triangle

      // Perspective-correct UV
      const iw = w0 * iwa + w1 * iwb + w2 * iwc;
      const u = (w0 * ua + w1 * ub + w2 * uc) / iw;
      const v = (w0 * va + w1 * vb + w2 * vc) / iw;

      // Sample source texture (bilinear)
      const sx = u * sw - 0.5, sy = v * sh - 0.5;
      const fx = sx - Math.floor(sx), fy = sy - Math.floor(sy);
      const sx0 = Math.max(0, Math.min(sw - 1, Math.floor(sx)));
      const sy0 = Math.max(0, Math.min(sh - 1, Math.floor(sy)));
      const sx1 = Math.min(sw - 1, sx0 + 1), sy1 = Math.min(sh - 1, sy0 + 1);

      const i00 = (sy0 * sw + sx0) * 4, i10 = (sy0 * sw + sx1) * 4;
      const i01 = (sy1 * sw + sx0) * 4, i11 = (sy1 * sw + sx1) * 4;
      const lerp2 = (a: number, b: number, c: number, d: number) =>
        (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;

      const sr = lerp2(src.data[i00], src.data[i10], src.data[i01], src.data[i11]);
      const sg = lerp2(src.data[i00+1], src.data[i10+1], src.data[i01+1], src.data[i11+1]);
      const sb = lerp2(src.data[i00+2], src.data[i10+2], src.data[i01+2], src.data[i11+2]);
      const salpha = lerp2(src.data[i00+3], src.data[i10+3], src.data[i01+3], src.data[i11+3]);
      const sa = salpha / 255 * opacity;
      if (sa <= 0) continue;

      const dIdx = (y * dw + x) * 4;
      const da = dst.data[dIdx + 3] / 255;
      const outA = sa + da * (1 - sa);
      if (outA > 0) {
        dst.data[dIdx]     = Math.round((sr * sa + dst.data[dIdx]     * da * (1 - sa)) / outA);
        dst.data[dIdx + 1] = Math.round((sg * sa + dst.data[dIdx + 1] * da * (1 - sa)) / outA);
        dst.data[dIdx + 2] = Math.round((sb * sa + dst.data[dIdx + 2] * da * (1 - sa)) / outA);
        dst.data[dIdx + 3] = Math.round(outA * 255);
      }
    }
  }
}
