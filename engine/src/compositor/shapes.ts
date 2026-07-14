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
  cameraPosZ?: number,
  strokeOverride?: { firstOffset: number; lastOffset: number }
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

  // STROKED shape (Objects/Arrows): draw a thick trimmed band ALONG the path with
  // arrow caps, instead of filling the interior. The stroke width is in shape-local
  // units — scale it by the transform's average linear magnification so the band
  // matches the transformed geometry.
  if (shape.stroke && strokeOverride) {
    let scale = 1;
    if (transform) {
      const sx = Math.hypot(transform[0], transform[1]);
      const sy = Math.hypot(transform[4], transform[5]);
      scale = (sx + sy) / 2;
    }
    return rasterizeStrokedArc(
      poly, closed, shape.stroke, strokeOverride, scale, width, height,
    );
  }

  const alpha = fillPolygonAA(poly, width, height);

  // FEATHER (S8): Motion soft-blurs a mask's alpha edge by the shape's Feather
  // radius (shape-local units). Convert to pixels via the transform's average
  // linear magnification (verts already map 1:1 to native pixels), then blur the
  // rasterized alpha. A large feather (Wipes/Diagonal's Animated mask = 300) turns
  // the sweep edge into a wide soft gradient — the crux of the diagonal reveal.
  // 0/absent = hard edge (unchanged; the blur is skipped entirely).
  if (shape.feather && shape.feather > 0) {
    let fscale = 1;
    if (transform) {
      const sx = Math.hypot(transform[0], transform[1]);
      const sy = Math.hypot(transform[4], transform[5]);
      fscale = (sx + sy) / 2;
    }
    const radius = shape.feather * fscale;
    if (radius >= 0.75) featherAlpha(alpha, width, height, radius);
  }
  return alpha;
}

/**
 * Soft-blur a rasterized alpha buffer IN PLACE by `radius` pixels, approximating
 * Motion's mask Feather. Motion's feather is a symmetric Gaussian falloff about
 * the shape edge; three passes of a separable box blur closely approximate a
 * Gaussian (central-limit), which is what real-time compositors use. The box
 * half-width is chosen so the combined 3-pass stddev ≈ radius/2 (so the visible
 * soft band spans ≈±radius about the edge, matching Motion's "Feather = full
 * edge-to-edge soft width" convention). Cost is O(W·H) per pass (running sum),
 * negligible next to the fill.
 */
function featherAlpha(a: Uint8Array, width: number, height: number, radius: number): void {
  // 3 box passes; each box radius r gives variance r(r+1)/3. Solve 3·var ≈
  // (radius/2)² for r → r ≈ radius/2 · sqrt(1/ ... ) ; empirically r≈radius/3
  // reproduces Motion's soft width well. Clamp to ≥1.
  const boxR = Math.max(1, Math.round(radius / 3));
  const tmp = new Float32Array(width * height);
  const buf = new Float32Array(width * height);
  for (let i = 0; i < a.length; i++) buf[i] = a[i];
  for (let pass = 0; pass < 3; pass++) {
    // horizontal
    boxBlurH(buf, tmp, width, height, boxR);
    // vertical
    boxBlurV(tmp, buf, width, height, boxR);
  }
  for (let i = 0; i < a.length; i++) a[i] = buf[i] < 0 ? 0 : buf[i] > 255 ? 255 : Math.round(buf[i]);
}

/** Separable running-sum box blur, horizontal pass (src→dst). */
function boxBlurH(src: Float32Array, dst: Float32Array, width: number, height: number, r: number): void {
  const win = 2 * r + 1;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    let sum = 0;
    // Prime with clamped-left window.
    for (let k = -r; k <= r; k++) sum += src[row + Math.min(width - 1, Math.max(0, k))];
    for (let x = 0; x < width; x++) {
      dst[row + x] = sum / win;
      const addX = Math.min(width - 1, x + r + 1);
      const subX = Math.max(0, x - r);
      sum += src[row + addX] - src[row + subX];
    }
  }
}

/** Separable running-sum box blur, vertical pass (src→dst). */
function boxBlurV(src: Float32Array, dst: Float32Array, width: number, height: number, r: number): void {
  const win = 2 * r + 1;
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[Math.min(height - 1, Math.max(0, k)) * width + x];
    for (let y = 0; y < height; y++) {
      dst[y * width + x] = sum / win;
      const addY = Math.min(height - 1, y + r + 1);
      const subY = Math.max(0, y - r);
      sum += src[addY * width + x] - src[subY * width + x];
    }
  }
}


/**
 * Rasterize a STROKED, arc-trimmed, arrow-capped path into an alpha mask.
 *
 * The Objects/Arrows C-shapes are closed circle beziers whose visible geometry is
 * a heavy stroke drawn along a TRIMMED sub-arc (First/Last Point Offset select the
 * fraction of the path length that is visible; animating Last Point Offset from
 * ~0.38→1 grows the arrow around the circle). The stroke has arrow end-caps.
 *
 * Method: resample the flattened polyline to uniform arc-length samples, select
 * the [firstOffset, lastOffset] sub-range, then paint a band of half-width
 * `width*scale/2` around every sample point (a dense disc stamp — robust for the
 * high-curvature circular arcs here). A triangular arrowhead is stamped at the
 * capped end(s). Returns the union alpha.
 */
function rasterizeStrokedArc(
  poly: number[][],
  closed: boolean,
  stroke: NonNullable<Shape['stroke']>,
  ov: { firstOffset: number; lastOffset: number },
  scale: number,
  width: number,
  height: number,
): Uint8Array {
  const mask = new Uint8Array(width * height);
  if (poly.length < 2) return mask;

  // Build cumulative arc-length along the (optionally closed) polyline.
  const pts = closed ? [...poly, poly[0]] : poly;
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  if (total < 1) return mask;

  const halfW = Math.max(0.5, (stroke.width * scale) / 2);
  let f0 = Math.min(ov.firstOffset, ov.lastOffset);
  let f1 = Math.max(ov.firstOffset, ov.lastOffset);
  f0 = Math.max(0, Math.min(1, f0));
  f1 = Math.max(0, Math.min(1, f1));
  const startLen = f0 * total;
  const endLen = f1 * total;
  if (endLen - startLen < 0.5) return mask;

  // Sample the sub-arc at ~1px spacing along its length and stamp a disc of radius
  // halfW at each sample. Point-at-length via linear interp on the cum table.
  const pointAt = (len: number): [number, number] => {
    if (len <= 0) return [pts[0][0], pts[0][1]];
    if (len >= total) return [pts[pts.length - 1][0], pts[pts.length - 1][1]];
    // binary search segment
    let lo = 0, hi = cum.length - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] <= len) lo = mid; else hi = mid;
    }
    const segLen = cum[hi] - cum[lo] || 1;
    const t = (len - cum[lo]) / segLen;
    return [pts[lo][0] + t * (pts[hi][0] - pts[lo][0]), pts[lo][1] + t * (pts[hi][1] - pts[lo][1])];
  };

  const stampDisc = (cx: number, cy: number, r: number): void => {
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(width - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(height - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = y0; y <= y1; y++) {
      const dy = y + 0.5 - cy;
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx;
        const d2 = dx * dx + dy * dy;
        if (d2 <= r2) {
          // 1px feathered edge for anti-aliasing.
          const d = Math.sqrt(d2);
          const a = d <= r - 1 ? 255 : Math.round((r - d) * 255);
          const idx = y * width + x;
          if (a > mask[idx]) mask[idx] = a;
        }
      }
    }
  };

  const step = Math.max(0.75, halfW * 0.5);
  for (let len = startLen; len <= endLen; len += step) {
    const [cx, cy] = pointAt(len);
    stampDisc(cx, cy, halfW);
  }
  // ensure exact endpoints stamped
  { const [cx, cy] = pointAt(endLen); stampDisc(cx, cy, halfW); }

  // Arrow caps: Motion cap styles 3/4 are arrowhead variants. Stamp a filled
  // triangle pointing along the local tangent at the capped end, sized by
  // Arrow Length/Width (multiples of stroke width). End Cap → arc END; Start Cap
  // → arc START (tangent reversed).
  const arrowHalfW = halfW * Math.max(0.6, stroke.arrowWidth);
  const arrowLen = stroke.width * scale * Math.max(0.6, stroke.arrowLength);
  const isArrow = (cap: number) => cap === 3 || cap === 4;

  const stampArrow = (tipLen: number, dir: 1 | -1): void => {
    // Tangent at the tip (direction the stroke travels toward the tip).
    const behind = pointAt(Math.max(0, Math.min(total, tipLen - dir * Math.max(2, halfW * 0.5))));
    const tip = pointAt(Math.max(0, Math.min(total, tipLen)));
    let tx = (tip[0] - behind[0]), ty = (tip[1] - behind[1]);
    const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    // The arrowhead extends BEYOND the tip in the travel direction; base sits
    // behind the tip.
    const apex: [number, number] = [tip[0] + tx * arrowLen * 0.5, tip[1] + ty * arrowLen * 0.5];
    const baseC: [number, number] = [tip[0] - tx * arrowLen * 0.5, tip[1] - ty * arrowLen * 0.5];
    const nx = -ty, ny = tx;
    const bl: [number, number] = [baseC[0] + nx * arrowHalfW, baseC[1] + ny * arrowHalfW];
    const br: [number, number] = [baseC[0] - nx * arrowHalfW, baseC[1] - ny * arrowHalfW];
    fillTriangle(mask, width, height, apex, bl, br);
  };

  if (isArrow(stroke.endCap)) stampArrow(endLen, 1);
  if (isArrow(stroke.startCap)) stampArrow(startLen, -1);

  return mask;
}

/** Fill a triangle into a mask (max-blend, solid). */
function fillTriangle(
  mask: Uint8Array, width: number, height: number,
  a: [number, number], b: [number, number], c: [number, number],
): void {
  const minX = Math.max(0, Math.floor(Math.min(a[0], b[0], c[0])));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(a[0], b[0], c[0])));
  const minY = Math.max(0, Math.floor(Math.min(a[1], b[1], c[1])));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(a[1], b[1], c[1])));
  const area = (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
  if (Math.abs(area) < 1e-6) return;
  const inv = 1 / area;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const pxc = x + 0.5, pyc = y + 0.5;
      const w0 = ((b[0] - pxc) * (c[1] - pyc) - (c[0] - pxc) * (b[1] - pyc)) * inv;
      const w1 = ((c[0] - pxc) * (a[1] - pyc) - (a[0] - pxc) * (c[1] - pyc)) * inv;
      const w2 = 1 - w0 - w1;
      if (w0 >= -0.001 && w1 >= -0.001 && w2 >= -0.001) mask[y * width + x] = 255;
    }
  }
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
