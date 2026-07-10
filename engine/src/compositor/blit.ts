/**
 * Compositor — low-level pixel + matrix blit primitives.
 *
 * Pure geometry/pixel operations with no dependency on the render graph or
 * RenderContext: 4x4 matrix helpers (mat4MultiplyOffset, mat4Mul, instanceLocalMatrix),
 * buffer allocation (createBuffer), affine blits (blitDstBBox, blitTransformed),
 * per-pixel composite with blend modes (compositePixel), whole-buffer composite
 * (blitDirect), and smoothstep01. Split out of compositor/index.ts (ROADMAP item 7).
 */
import type { BlendMode } from '../types.js';
import { blendChannel, isSeparable, luma } from './blend.js';

/** Offset a transform matrix's translation by (dx, dy). */
export function mat4MultiplyOffset(m: Float64Array, dx: number, dy: number): Float64Array {
  const r = new Float64Array(m);
  r[12] += dx;
  r[13] += dy;
  return r;
}

/**
 * Full column-major 4x4 multiply: returns a·b (apply b first, then a).
 * Used to compose a replicator instance's local scale/rotate/translate onto the
 * replicator layer's world matrix so each instance rasterizes at its own pose.
 */
export function mat4Mul(a: Float64Array, b: Float64Array): Float64Array {
  const r = new Float64Array(16);
  for (let c = 0; c < 4; c++) {
    for (let rr = 0; rr < 4; rr++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + rr] * b[c * 4 + k];
      r[c * 4 + rr] = s;
    }
  }
  return r;
}

/** Local transform for a replicator instance: T(x,y)·Rz(angle)·S(scale). */
export function instanceLocalMatrix(x: number, y: number, angle: number, scale: number): Float64Array {
  const cs = Math.cos(angle) * scale, sn = Math.sin(angle) * scale;
  const m = new Float64Array(16);
  m[0] = cs; m[1] = sn; m[4] = -sn; m[5] = cs; m[10] = scale; m[15] = 1;
  m[12] = x; m[13] = y; m[14] = 0;
  return m;
}

/** Create a transparent buffer (all zeros = transparent black). */
export function createBuffer(width: number, height: number): ImageData {
  return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
}

/**
 * Destination-space bounding box a forward-transformed (cropped) source rect
 * covers, in DST pixel coords. Maps the four crop-bounded source corners through
 * the affine `m` (source-centered → dest-centered, Y-down) using the ACTUAL dst
 * dims — so it works when src and dst differ in size (unlike transformBBoxToOutput,
 * which is for full-frame same-size cell buffers). Padded 1px for bilinear reach.
 *
 * PERF: passed as `dstBBox` to blitTransformed so the inverse-map loop only visits
 * pixels the source can actually cover. Pixels outside this box would fail the
 * existing in-bounds `continue`, so restricting the loop is BYTE-IDENTICAL — it
 * just skips the wasted iterations. Big win for scenes with many small transformed
 * layers (Movements/Pinwheel: 34 clones, each a small rotated wedge, previously
 * scanned the full 1920×1080 frame apiece → 73% of frame time in blitTransformed).
 */
export function blitDstBBox(
  dst: ImageData, src: ImageData, m: Float64Array,
  crop: { left: number; right: number; top: number; bottom: number },
): { x0: number; y0: number; x1: number; y1: number } {
  const sw = src.width, sh = src.height;
  const dw = dst.width, dh = dst.height;
  const sl = crop.left, sr = sw - crop.right, st = crop.top, sb = sh - crop.bottom;
  const a = m[0], b = m[4], tx = m[12];
  const c = m[1], d = m[5], ty = m[13];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const cs: [number, number][] = [[sl, st], [sr, st], [sl, sb], [sr, sb]];
  for (const [px, py] of cs) {
    const scx = px - sw / 2, scy = py - sh / 2;
    const dcx = a * scx + b * scy + tx;
    const dcy = c * scx + d * scy + ty;
    const ox = dcx + dw / 2, oy = dcy + dh / 2;
    if (ox < x0) x0 = ox; if (ox > x1) x1 = ox;
    if (oy < y0) y0 = oy; if (oy > y1) y1 = oy;
  }
  return { x0: Math.floor(x0) - 1, y0: Math.floor(y0) - 1, x1: Math.ceil(x1) + 1, y1: Math.ceil(y1) + 1 };
}

/**
 * Blit a source image onto a destination at an affine transform.
 * Uses inverse-mapping: for each output pixel, find the corresponding source pixel.
 *
 * The worldTransform maps from SOURCE (centered) coordinates to OUTPUT (centered) coordinates.
 * We need the INVERSE to sample: for each output pixel, where does it come from in the source?
 */
export function blitTransformed(
  dst: ImageData,
  src: ImageData,
  worldTransform: Float64Array,
  opacity: number,
  crop: { left: number; right: number; top: number; bottom: number },
  blendMode: BlendMode = 'normal',
  dstBBox?: { x0: number; y0: number; x1: number; y1: number }
): void {
  const dw = dst.width, dh = dst.height;
  const sw = src.width, sh = src.height;

  // Invert the 4x4 matrix (for 2D we only need the 2D affine part)
  // Extract the 2D affine from the 4x4 (ignoring Z):
  // The matrix maps source-centered coords to dest-centered coords.
  // We need inverse: dest-centered → source-centered
  const a = worldTransform[0], b = worldTransform[4], tx = worldTransform[12];
  const c = worldTransform[1], d = worldTransform[5], ty = worldTransform[13];

  const det = a * d - b * c;
  if (Math.abs(det) < 1e-10) return; // degenerate transform

  const invDet = 1 / det;
  const ia = d * invDet, ib = -b * invDet, itx = (b * ty - d * tx) * invDet;
  const ic = -c * invDet, id = a * invDet, ity = (c * tx - a * ty) * invDet;

  // Effective source bounds after crop
  const srcLeft = crop.left;
  const srcRight = sw - crop.right;
  const srcTop = crop.top;
  const srcBottom = sh - crop.bottom;

  // For each destination pixel
  const yLo = dstBBox ? Math.max(0, dstBBox.y0) : 0;
  const yHi = dstBBox ? Math.min(dh, dstBBox.y1 + 1) : dh;
  const xLo = dstBBox ? Math.max(0, dstBBox.x0) : 0;
  const xHi = dstBBox ? Math.min(dw, dstBBox.x1 + 1) : dw;
  // Fast path for the overwhelmingly common 'normal' (source-over) blend: inline
  // the composite so the hot per-pixel loop makes no function call and does no
  // blend-mode string compare (~2M/frame at 1080p). Math is bit-identical to
  // compositePixel's normal branch. Non-normal modes fall through to the generic
  // compositePixel call below.
  const fastNormal = blendMode === 'normal';
  const ddata = dst.data;
  const sdata = src.data;
  for (let dy = yLo; dy < yHi; dy++) {
    // Ozone/.motr internal space is Y-DOWN (screen_y = center + motionY): a clone
    // at Motion Y=-1080 renders at the TOP edge, and a +Y position translates
    // content downward. This was verified against the real engine's Push render
    // (B enters from top, A exits the bottom). So dest-centered Y matches screen Y.
    const dyc = dy - dh / 2;

    for (let dx = xLo; dx < xHi; dx++) {
      const dxc = dx - dw / 2;

      // Inverse-map to source centered coords
      const sxc = ia * dxc + ib * dyc + itx;
      const syc = ic * dxc + id * dyc + ity;

      // Convert from centered to pixel coords (source), Y-down.
      const sx = sxc + sw / 2;
      const sy = syc + sh / 2;

      // Bounds check (with crop)
      if (sx < srcLeft || sx >= srcRight || sy < srcTop || sy >= srcBottom) continue;

      // Bilinear sampling for smooth scaling/rotation
      const fx = sx - Math.floor(sx);
      const fy = sy - Math.floor(sy);
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      const x1 = Math.min(x0 + 1, sw - 1), y1 = Math.min(y0 + 1, sh - 1);
      if (x0 < 0 || x0 >= sw || y0 < 0 || y0 >= sh) continue;
      const cx0 = Math.max(0, x0), cy0 = Math.max(0, y0);

      const i00 = (cy0 * sw + cx0) * 4;
      const i10 = (cy0 * sw + x1) * 4;
      const i01 = (y1 * sw + cx0) * 4;
      const i11 = (y1 * sw + x1) * 4;

      // Bilinear weights (hoisted: no per-pixel closure allocation).
      const gx = 1 - fx, gy = 1 - fy;
      const w00 = gx * gy, w10 = fx * gy, w01 = gx * fy, w11 = fx * fy;

      const sr = sdata[i00]   * w00 + sdata[i10]   * w10 + sdata[i01]   * w01 + sdata[i11]   * w11;
      const sg = sdata[i00+1] * w00 + sdata[i10+1] * w10 + sdata[i01+1] * w01 + sdata[i11+1] * w11;
      const sb = sdata[i00+2] * w00 + sdata[i10+2] * w10 + sdata[i01+2] * w01 + sdata[i11+2] * w11;
      const srcAlpha = sdata[i00+3] * w00 + sdata[i10+3] * w10 + sdata[i01+3] * w01 + sdata[i11+3] * w11;
      const sa = srcAlpha / 255 * opacity;

      const dstIdx = (dy * dw + dx) * 4;

      if (sa <= 0) continue;

      if (fastNormal) {
        // Inlined source-over (bit-identical to compositePixel 'normal' branch).
        const db = ddata[dstIdx + 3] / 255;
        const outA = sa + db * (1 - sa);
        if (outA <= 0) continue;
        ddata[dstIdx]     = Math.round((sr * sa + ddata[dstIdx]     * db * (1 - sa)) / outA);
        ddata[dstIdx + 1] = Math.round((sg * sa + ddata[dstIdx + 1] * db * (1 - sa)) / outA);
        ddata[dstIdx + 2] = Math.round((sb * sa + ddata[dstIdx + 2] * db * (1 - sa)) / outA);
        ddata[dstIdx + 3] = Math.round(outA * 255);
      } else {
        compositePixel(ddata, dstIdx, sr, sg, sb, sa, blendMode);
      }
    }
  }
}

/**
 * Composite one source pixel (straight color sr/sg/sb in [0..255], premultiplied
 * coverage `sa` in [0..1]) onto the destination buffer at byte offset `di`,
 * honoring the given blend mode. Destination is straight color with alpha.
 *
 *   Separable modes use the W3C blending equation:
 *     Co = αs·(1−αb)·Cs + αs·αb·B(Cb,Cs) + (1−αs)·αb·Cb
 *   Stencil/Silhouette modes MODULATE the destination's alpha by the source's
 *   coverage/luma (they do not add color); Combine falls back to source-over.
 */
export function compositePixel(
  data: Uint8ClampedArray | Uint8Array,
  di: number,
  sr: number, sg: number, sb: number,
  sa: number,
  mode: BlendMode
): void {
  const db = data[di + 3] / 255;

  // --- Stencil / Silhouette: modulate destination alpha, no color contribution.
  //   Stencil  = keep dst where source is present   (dstA *= sourceCoverage)
  //   Silhouette = cut dst where source is present   (dstA *= 1 - sourceCoverage)
  //   *_ALPHA uses the source alpha; *_LUMA uses the source luma.
  if (mode === 'stencilAlpha' || mode === 'stencilLuma' ||
      mode === 'silhouetteAlpha' || mode === 'silhouetteLuma') {
    let key: number;
    if (mode === 'stencilAlpha' || mode === 'silhouetteAlpha') {
      key = sa; // premultiplied coverage already folds in opacity
    } else {
      // luma of the straight source color, scaled by coverage
      key = (luma(sr, sg, sb) / 255) * sa;
    }
    const isSilhouette = mode === 'silhouetteAlpha' || mode === 'silhouetteLuma';
    const factor = isSilhouette ? (1 - key) : key;
    const outA = db * factor;
    data[di + 3] = Math.round(outA * 255);
    return;
  }

  if (mode !== 'normal' && isSeparable(mode)) {
    const outA = sa + db * (1 - sa);
    if (outA <= 0) return;
    for (let c = 0; c < 3; c++) {
      const cb = data[di + c];
      const cs = c === 0 ? sr : c === 1 ? sg : sb;
      const blended = blendChannel(mode, cb, cs);
      const co = sa * (1 - db) * cs + sa * db * blended + (1 - sa) * db * cb;
      data[di + c] = Math.round(co / outA);
    }
    data[di + 3] = Math.round(outA * 255);
    return;
  }

  // Normal (and 'combine'/unimplemented non-separable) → source-over.
  const outA = sa + db * (1 - sa);
  if (outA <= 0) return;
  data[di]     = Math.round((sr * sa + data[di]     * db * (1 - sa)) / outA);
  data[di + 1] = Math.round((sg * sa + data[di + 1] * db * (1 - sa)) / outA);
  data[di + 2] = Math.round((sb * sa + data[di + 2] * db * (1 - sa)) / outA);
  data[di + 3] = Math.round(outA * 255);
}

/**
 * Smoothstep 0→1 (Hermite) — 0 for x≤0, 1 for x≥1, smooth in between.
 */
export function smoothstep01(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

/** Blit source directly onto destination with opacity (no transform, 1:1 pixel copy). */
export function blitDirect(dst: ImageData, src: ImageData, opacity: number, blendMode: BlendMode = 'normal'): void {
  for (let i = 0; i < dst.data.length; i += 4) {
    const sa = src.data[i + 3] / 255 * opacity;
    if (sa <= 0) {
      // Silhouette/Stencil with no source coverage still affect dst alpha
      // (stencil with 0 coverage erases dst); handle via compositePixel only
      // when a masking mode is active and there IS backdrop to modify.
      if ((blendMode === 'stencilAlpha' || blendMode === 'stencilLuma') && dst.data[i + 3] > 0) {
        dst.data[i + 3] = 0; // stencil: no source → erase backdrop
      }
      continue;
    }
    compositePixel(dst.data, i, src.data[i], src.data[i + 1], src.data[i + 2], sa, blendMode);
  }
}
