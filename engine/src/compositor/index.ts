import { gaussianBlur } from './filters/gaussian-blur.js';
import { glowFilter } from './filters/glow.js';
import { levelsFilter, brightnessFilter } from './filters/levels.js';
import { channelMixerFilter, colorizeRemapFilter, tintFilter } from './filters/channel-mixer.js';
import { hueSaturationFilter } from './filters/hue-saturation.js';
import { directionalBlur, radialBlur, zoomBlur } from './filters/directional-blur.js';
import { lumaKeyerFilter } from './filters/luma-keyer.js';
import { bevelFilter } from './filters/bevel.js';
import { evaluateCurve } from '../evaluator/curves.js';
import { rasterizeShape, applyMask, unionMasks } from './shapes.js';
import { needsPerspective, projectQuad, renderPerspectiveQuad, renderPageFlip } from './perspective.js';
import { blendChannel, isSeparable, luma } from './blend.js';
import type { BlendMode } from '../types.js';
import { generateInstances, sequenceProgress, sequenceOrder } from './replicator.js';
import { lookupFilter, makeContext } from './filters/registry.js';
import './filters/index.js'; // side-effect: registers all UUID-keyed filter modules

/** Offset a transform matrix's translation by (dx, dy). */
function mat4MultiplyOffset(m: Float64Array, dx: number, dy: number): Float64Array {
  const r = new Float64Array(m);
  r[12] += dx;
  r[13] += dy;
  return r;
}
/**
 * Compositor: EvaluatedScene + source images → output ImageData
 *
 * Implements the core compositing pipeline:
 *   - Layer stacking (back-to-front, matching Motion's render order)
 *   - Per-layer transform application (affine + perspective via the 4x4 matrix)
 *   - Opacity blending
 *   - Crop regions
 *   - Source image injection (Transition A/B → imageA/imageB)
 *   - Normal blend mode (source-over with premultiplied alpha)
 *
 * This is a CPU-based software renderer for correctness. A WebGL backend
 * can be added later for performance.
 */
import type { EvaluatedScene, EvaluatedLayer } from '../evaluator/index.js';
import type { ImageSource, Layer } from '../types.js';
import { renderGaussianGradient } from './filters/gradient.js';

/**
 * Render context set per composite() call. Holds the object-ID map so clone
 * layers can resolve the image of the object they mirror.
 */
interface RenderContext {
  layerById: Map<number, Layer>;
  evalLayerById: Map<number, EvaluatedLayer>;
  imageA: ImageData;
  imageB: ImageData;
  /**
   * Camera framing distance for 3D perspective projection. When the scene has a
   * Camera node, this is (frameHeight/2)/tan(AOV/2) so content at Z=0 renders 1:1
   * and layers with world-Z get perspective foreshortening. Falls back to the
   * legacy default (2000) when no camera is present.
   */
  cameraZ: number;
  /**
   * Set of object IDs referenced as an Image Mask `Mask Source` by some layer.
   * A group in this set is a hidden geometry provider (it clips its owning layer
   * via the Image Mask), NOT a sibling-clip "Masks" group, so `isMaskGroup` must
   * NOT lift it to clip the enclosing group.
   */
  imageMaskSourceIds: Set<number>;
  /** Host-injected resolver for bundled-media relativeURLs (Slide tile PNGs). */
  mediaResolver?: (url: string) => ImageData | null;
  /** Per-frame cache of resolved media (avoids re-decoding a tile per layer/frame). */
  mediaCache: Map<string, ImageData | null>;
  /** Animation end (seconds) so replicator sequencing can normalize global time. */
  animationEndSec: number;
}
let ctx: RenderContext | null = null;

/**
 * Resolve the source image a Clone Layer mirrors. Follows cloneSourceId to the
 * referenced Layer; if that layer is itself a clone/image of Transition A or B,
 * resolves transitively to the underlying source pixels.
 */
function resolveCloneImage(cloneSourceId: number | undefined, depth = 0): ImageData | null {
  if (cloneSourceId === undefined || !ctx || depth > 8) return null;
  const src = ctx.layerById.get(cloneSourceId);
  if (!src) return null;
  if (src.source?.type === 'transitionA') return ctx.imageA;
  if (src.source?.type === 'transitionB') return ctx.imageB;
  if (src.type === 'clone') return resolveCloneImage(src.cloneSourceId, depth + 1);
  // Image/generator source without an explicit A/B tag: fall back to its source.
  if (src.source) return getSourceImage(src.source, ctx.imageA, ctx.imageB);
  return null;
}
/**
 * Result of resolving a replicator cell's Object Source:
 *  - kind 'image'  → a full-frame RGBA buffer holding the (centered) cell
 *                    content that is TRANSLATED to each instance position.
 *  - kind 'window' → the cell is a SHAPE that masks a source image. Each
 *                    instance reveals `source` at that instance's screen
 *                    position (a hole punched through the background), which is
 *                    how Motion's dot/tile replicators (e.g. Duplicate) work.
 */
type CellContent =
  | { kind: 'image'; img: ImageData }
  | { kind: 'window'; maskCell: ImageData; source: ImageData };

/**
 * Resolve the drawable content a Replicator tiles across its instances. The
 * Replicator Cell's `Object Source` references a scenenode/layer by ID:
 *   - Transition A/B image  → the corresponding source pixels (translated)
 *   - Shape                 → a window that reveals Transition A at each instance
 *   - Group / other         → the first visible drawable descendant, handled as
 *                             one of the above; else the rendered subtree.
 */
function resolveCellImage(
  cellSourceId: number | undefined,
  imageA: ImageData,
  imageB: ImageData,
  time: number,
  filterOverrides: Map<number, Map<string, number>>
): CellContent | null {
  if (cellSourceId === undefined || !ctx) return null;

  // Prefer the fully-evaluated cell source (has world transform, shape, source).
  const evalSrc = ctx.evalLayerById.get(cellSourceId);
  const rawSrc = ctx.layerById.get(cellSourceId);
  const src = rawSrc;
  if (!src) return null;

  // Direct Transition A/B image cell (translated copy per instance).
  if (src.source?.type === 'transitionA') return { kind: 'image', img: imageA };
  if (src.source?.type === 'transitionB') return { kind: 'image', img: imageB };

  const W = imageA.width, H = imageA.height;

  // Shape cell: a window revealing Transition A at each instance position.
  if (src.type === 'shape' && src.shape) {
    return { kind: 'window', maskCell: shapeMaskCell(src.shape, evalSrc, W, H), source: imageA };
  }

  // Group / clone / other: the cell's drawable content is usually a single
  // visible child (Motion Rigs toggle which child shows).
  if (evalSrc) {
    const drawable = findVisibleDrawable(evalSrc);
    if (drawable) {
      if (drawable.layer.type === 'shape' && drawable.layer.shape) {
        return { kind: 'window', maskCell: shapeMaskCell(drawable.layer.shape, drawable, W, H), source: imageA };
      }
      if (drawable.layer.source?.type === 'transitionA') return { kind: 'image', img: imageA };
      if (drawable.layer.source?.type === 'transitionB') return { kind: 'image', img: imageB };
    }
    // Fallback: render the whole (centered) subtree.
    const centered = centerEvaluatedLayer(evalSrc);
    const buf = createBuffer(W, H);
    renderLayer(buf, centered, imageA, imageB, time, filterOverrides);
    for (let i = 3; i < buf.data.length; i += 4) if (buf.data[i] > 0) return { kind: 'image', img: buf };
  }
  return null;
}

/**
 * Rasterize a shape into a full-frame single-channel-in-alpha RGBA buffer,
 * centered at the origin (white fill, shape alpha). Used as a per-instance
 * window mask. The evaluated shape's transform is used with translation stripped.
 */
function shapeMaskCell(shape: import('../types.js').Shape, evalSrc: EvaluatedLayer | undefined, W: number, H: number): ImageData {
  let xform: Float64Array | undefined;
  if (evalSrc) {
    xform = new Float64Array(evalSrc.worldTransform);
    xform[12] = 0; xform[13] = 0;
  }
  const mask = rasterizeShape(shape, W, H, xform);
  const buf = createBuffer(W, H);
  for (let i = 0; i < mask.length; i++) {
    const a = mask[i];
    if (a === 0) continue;
    const o = i * 4;
    buf.data[o] = 255; buf.data[o + 1] = 255; buf.data[o + 2] = 255; buf.data[o + 3] = a;
  }
  return buf;
}

/**
 * Reveal `source` at each output pixel through a shape mask positioned by the
 * instance transform. The mask (a centered shape buffer) is inverse-mapped so
 * its alpha at output pixel (ox,oy) determines how much of `source` (sampled at
 * the SAME output pixel — a fixed window into the image) shows through.
 * Restricted to `dstBBox` for performance.
 */
function revealThroughMask(
  output: ImageData,
  source: ImageData,
  maskCell: ImageData,
  m: Float64Array,
  opacity: number,
  dstBBox: { x0: number; y0: number; x1: number; y1: number }
): void {
  const dw = output.width, dh = output.height;
  const mw = maskCell.width, mh = maskCell.height;
  const a = m[0], b = m[4], tx = m[12];
  const c = m[1], d = m[5], ty = m[13];
  const det = a * d - b * c;
  if (Math.abs(det) < 1e-10) return;
  const invDet = 1 / det;
  const ia = d * invDet, ib = -b * invDet, itx = (b * ty - d * tx) * invDet;
  const ic = -c * invDet, id = a * invDet, ity = (c * tx - a * ty) * invDet;

  const out = output.data, md = maskCell.data, sd = source.data;
  const yLo = Math.max(0, dstBBox.y0), yHi = Math.min(dh, dstBBox.y1 + 1);
  const xLo = Math.max(0, dstBBox.x0), xHi = Math.min(dw, dstBBox.x1 + 1);
  for (let dy = yLo; dy < yHi; dy++) {
    const dyc = dy - dh / 2;
    for (let dx = xLo; dx < xHi; dx++) {
      const dxc = dx - dw / 2;
      // Inverse-map output → mask-source centered → mask pixel (nearest).
      const sxc = ia * dxc + ib * dyc + itx;
      const syc = ic * dxc + id * dyc + ity;
      const mx = Math.round(sxc + mw / 2);
      const my = Math.round(syc + mh / 2);
      if (mx < 0 || mx >= mw || my < 0 || my >= mh) continue;
      const ma = md[(my * mw + mx) * 4 + 3];
      if (ma === 0) continue;
      const sa = (ma / 255) * opacity;
      const oi = (dy * dw + dx) * 4;
      // Source RGB sampled at the SAME output location (fixed window into image).
      const sr = sd[oi], sg = sd[oi + 1], sb = sd[oi + 2];
      const srcA = (sd[oi + 3] / 255) * sa;
      if (srcA <= 0) continue;
      const da = out[oi + 3] / 255;
      const outA = srcA + da * (1 - srcA);
      if (outA <= 0) continue;
      out[oi]     = Math.round((sr * srcA + out[oi]     * da * (1 - srcA)) / outA);
      out[oi + 1] = Math.round((sg * srcA + out[oi + 1] * da * (1 - srcA)) / outA);
      out[oi + 2] = Math.round((sb * srcA + out[oi + 2] * da * (1 - srcA)) / outA);
      out[oi + 3] = Math.round(outA * 255);
    }
  }
}

/** First visible drawable (image/shape/generator) in an evaluated subtree. */
function findVisibleDrawable(el: EvaluatedLayer): EvaluatedLayer | null {
  const t = el.layer.type;
  if ((t === 'shape' || t === 'image' || t === 'generator') && el.visible) return el;
  for (const c of el.children) {
    const r = findVisibleDrawable(c);
    if (r) return r;
  }
  return null;
}

/** Non-transparent pixel bounding box of a full-frame cell buffer, or null. */
function cellContentBBox(img: ImageData): { x0: number; y0: number; x1: number; y1: number } | null {
  const w = img.width, h = img.height, d = img.data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (d[row + x * 4 + 3] > 0) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  return { x0, y0, x1, y1 };
}

/**
 * Map a source-pixel bbox through the cell's world transform to an output-space
 * integer bbox, so the blit loop only visits pixels the cell can actually cover.
 * The transform maps SOURCE-centered coords to DEST-centered coords (Y-down).
 */
function transformBBoxToOutput(
  src: ImageData,
  bbox: { x0: number; y0: number; x1: number; y1: number },
  m: Float64Array
): { x0: number; y0: number; x1: number; y1: number } {
  const sw = src.width, sh = src.height;
  // Requires the DEST image dims; the compositor is single-size, so use src dims
  // (cell buffers are full-frame, same size as output).
  const dw = sw, dh = sh;
  const a = m[0], b = m[4], tx = m[12];
  const c = m[1], d = m[5], ty = m[13];
  const corners = [
    [bbox.x0, bbox.y0], [bbox.x1, bbox.y0], [bbox.x0, bbox.y1], [bbox.x1, bbox.y1],
  ];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [sx, sy] of corners) {
    const scx = sx - sw / 2, scy = sy - sh / 2;
    const dcx = a * scx + b * scy + tx;
    const dcy = c * scx + d * scy + ty;
    const px = dcx + dw / 2;
    const py = dcy + dh / 2;
    if (px < x0) x0 = px; if (px > x1) x1 = px;
    if (py < y0) y0 = py; if (py > y1) y1 = py;
  }
  // Pad by 1px for bilinear sampling.
  return { x0: Math.floor(x0) - 1, y0: Math.floor(y0) - 1, x1: Math.ceil(x1) + 1, y1: Math.ceil(y1) + 1 };
}

/**
 * Clone an EvaluatedLayer subtree with its top-level world translation removed,
 * so it renders centered at the frame origin. Child world transforms are shifted
 * by the same delta to preserve their relative layout.
 */
function centerEvaluatedLayer(el: EvaluatedLayer): EvaluatedLayer {
  const dx = el.worldTransform[12];
  const dy = el.worldTransform[13];
  const shift = (l: EvaluatedLayer): EvaluatedLayer => {
    const wt = new Float64Array(l.worldTransform);
    wt[12] -= dx; wt[13] -= dy;
    return {
      ...l,
      worldTransform: wt,
      visible: true,
      children: l.children.map(shift),
    };
  };
  return shift(el);
}



// ============================================================================
// Image buffer operations
// ============================================================================

/** Create a transparent buffer (all zeros = transparent black). */
function createBuffer(width: number, height: number): ImageData {
  return new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
}

/**
 * Blit a source image onto a destination at an affine transform.
 * Uses inverse-mapping: for each output pixel, find the corresponding source pixel.
 *
 * The worldTransform maps from SOURCE (centered) coordinates to OUTPUT (centered) coordinates.
 * We need the INVERSE to sample: for each output pixel, where does it come from in the source?
 */
function blitTransformed(
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

// ============================================================================
// Layer rendering
// ============================================================================



function getSourceImage(source: ImageSource | undefined, imageA: ImageData, imageB: ImageData): ImageData | null {
  if (!source) return null;
  switch (source.type) {
    case 'transitionA': return imageA;
    case 'transitionB': return imageB;
    case 'media': {
      // Bundled template asset (e.g. Slide's sliding tile PNGs). Resolved by the
      // host-injected resolver and cached per frame. Null when unavailable — the
      // layer then draws nothing (graceful degradation).
      if (!ctx?.mediaResolver) return null;
      const cache = ctx.mediaCache;
      if (cache.has(source.url)) return cache.get(source.url)!;
      const img = ctx.mediaResolver(source.url);
      cache.set(source.url, img);
      return img;
    }
    case 'color': {
      // Solid color fill
      const { r, g, b, a } = source;
      const img = createBuffer(imageA.width, imageA.height);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = r; img.data[i+1] = g; img.data[i+2] = b; img.data[i+3] = Math.round(a * 255);
      }
      return img;
    }
    case 'gaussianGradient':
      return renderGaussianGradient(source.gradient);
    default: return null;
  }
}

/** PAEFlop plugin UUID (Movements/Flip's back-page mirror filter). */
const PAEFLOP_UUID = '2FF8887B-E673-4727-9601-1B3353531C10';

/**
 * Perspective camera distance for the PAEFlop page-flip. Fit from the headless
 * GT: the far (receding) edge of the rotating page sits at screen x≈0.87→0.64
 * across θ=15.7°→78.3°, which a centre-axis rotation reproduces with a camera
 * ≈7000 units back (much weaker perspective than the 2000 scene default — the
 * flip is nearly orthographic). PSNR is flat for any camera ≥~6000.
 */
const FLIP_CAMERA_Z = 7000;


/**
 * Detect the PAEFlop page-flip pattern (Movements/Flip): a Group whose Rotation Y
 * is driven 0→π and that holds two full-frame page children, the BACK page (B)
 * carrying a PAEFlop filter. Returns the front/back page eval-layers plus the
 * group's current Y-rotation angle θ (radians), or null if this isn't a flip
 * group. Structural + UUID match only — no name/English heuristics.
 */
function detectPageFlip(group: EvaluatedLayer): { front: EvaluatedLayer; back: EvaluatedLayer; theta: number } | null {
  if (group.layer.type !== 'group') return null;
  const imgs = group.children.filter(c => (c.layer.type === 'image' || c.layer.type === 'generator') && c.layer.source);
  if (imgs.length !== 2) return null;
  const hasFlop = (c: EvaluatedLayer) => c.layer.filters.some(f => f.pluginUUID.toUpperCase() === PAEFLOP_UUID);
  const back = imgs.find(hasFlop);
  const front = imgs.find(c => !hasFlop(c));
  if (!back || !front) return null;
  // Extract the group's Y-rotation θ from its world transform (Y-rot puts cosθ at
  // m0 and sinθ at m8 — see mat4RotateY). The flip is only meaningful once the
  // group actually rotates about Y.
  const m = group.worldTransform;
  const theta = Math.atan2(m[8], m[0]);
  return { front, back, theta };
}

/**
 * True if `child` is a group layer whose descendant shapes are ALL masks (and it
 * contains at least one mask shape). Such a group exists only to hold masks —
 * its masks should clip the sibling content layers, not render on their own.
 */
function isMaskGroup(child: EvaluatedLayer): boolean {
  if (child.layer.type !== 'group') return false;
  if (child.layer.children.length === 0) return false;
  // A group referenced by an Image Mask `Mask Source` is a hidden geometry
  // provider for that layer's own mask — it must NOT be lifted to clip its
  // enclosing group (that would clip both Transition A and B, leaving a strip).
  if (ctx?.imageMaskSourceIds.has(child.layer.id)) return false;
  let maskCount = 0;
  let ok = true;
  const walk = (l: EvaluatedLayer): void => {
    if (l.layer.type === 'shape') {
      if (l.layer.shape?.isMask) maskCount++;
      else ok = false;
    } else if (l.layer.type === 'group') {
      for (const c of l.children) walk(c);
    } else {
      ok = false; // any non-shape, non-group content means it is not a pure mask group
    }
  };
  for (const c of child.children) walk(c);
  return ok && maskCount > 0;
}

/** Collect all mask shapes (recursively) from a mask group into `out`. */
function collectMaskShapes(group: EvaluatedLayer, out: EvaluatedLayer[]): void {
  for (const c of group.children) {
    if (c.layer.type === 'shape' && c.layer.shape?.isMask) out.push(c);
    else if (c.layer.type === 'group') collectMaskShapes(c, out);
  }
}

/** Gather every object ID referenced by some layer's Image Mask `Mask Source`. */
function collectImageMaskSourceIds(evalLayerById: Map<number, EvaluatedLayer>): Set<number> {
  const ids = new Set<number>();
  for (const el of evalLayerById.values()) {
    if (el.layer.imageMaskSourceId !== undefined) ids.add(el.layer.imageMaskSourceId);
  }
  return ids;
}

/**
 * Rasterize an Image Mask's alpha from its `Mask Source` object.
 *
 * The referenced object is usually a "Masks" GROUP holding one or more shapes,
 * with a rig behavior selecting exactly one (opacity=1) per the transition's
 * Direction/variant widget (the others evaluate to opacity 0 → not visible). We
 * collect every visible shape descendant and union their rasterized alpha. Each
 * shape is rasterized at its own evaluated world transform (so the wipe animation
 * — position/scale/rotation keyframes — is honored). Returns null if the source
 * can't be resolved or no shape is currently visible.
 */
function resolveImageMaskAlpha(sourceId: number, W: number, H: number): Uint8Array | null {
  if (!ctx) return null;
  const src = ctx.evalLayerById.get(sourceId);
  if (!src) return null;
  // Collect visible shape descendants (the rig opacity selects the active one).
  const shapes: EvaluatedLayer[] = [];
  const walk = (el: EvaluatedLayer): void => {
    if (el.layer.type === 'shape' && el.layer.shape) {
      if (el.visible) shapes.push(el);
    }
    for (const c of el.children) walk(c);
  };
  walk(src);
  if (shapes.length === 0) return null;
  const masks = shapes.map(s => rasterizeShape(s.layer.shape!, W, H, s.worldTransform));
  return masks.length === 1 ? masks[0] : unionMasks(masks, W, H);
}

function renderLayer(
  output: ImageData,
  evalLayer: EvaluatedLayer,
  imageA: ImageData,
  imageB: ImageData,
  time: number,
  filterOverrides: Map<number, Map<string, number>>
): void {
  if (!evalLayer.visible) return;

  const { layer, worldTransform, opacity, crop } = evalLayer;

  // A group that is an Image Mask `Mask Source` is hidden geometry — it provides
  // alpha to the layer that references it (rendered there via resolveImageMaskAlpha),
  // and must never draw its shapes directly.
  if (layer.type === 'group' && ctx?.imageMaskSourceIds.has(layer.id)) return;

  // Replicator: render the cell content at each grid instance
  if (layer.type === 'replicator' && layer.replicator) {
    const instances = generateInstances(layer.replicator);

    // Materialize the cell's Object Source once, then stamp it at each instance.
    const cell = resolveCellImage(layer.cellSourceId, imageA, imageB, time, filterOverrides);

    // The mask/content bbox is computed ONCE. Per instance we transform it into
    // output space and restrict the blit loop to that region — turning an
    // O(frameArea × instances) cost into O(cellArea × instances). For a 13×9 dot
    // grid this is ~1000× faster and avoids multi-second per-frame renders.
    const stampImg = cell?.kind === 'image' ? cell.img : cell?.kind === 'window' ? cell.maskCell : null;
    const cellBBox = stampImg ? cellContentBBox(stampImg) : null;

    // Sequence Replicator: stagger a per-instance opacity/scale/rotation ramp
    // across the ordered instances. globalProgress is normalized scene time.
    const seq = layer.replicator.sequence;
    const cols = Math.max(1, Math.round(layer.replicator.columns));
    const rows = Math.max(1, Math.round(layer.replicator.rows));
    const globalProgress = seq ? time / (ctx?.animationEndSec || 1) : 0;

    for (const inst of instances) {
      // Per-instance sequenced parameters (default: no change).
      let instOpacityMul = 1;
      let instScale = 1;
      if (seq) {
        const order = sequenceOrder(inst, cols, rows);
        const p = sequenceProgress(order, globalProgress, seq.end, seq.spread, instances.length);
        // Apply the per-instance curves. Motion Scale curve is a MULTIPLIER
        // ramp: value 0 → scaleEnd means the instance grows from 0 to scaleEnd×
        // the base cell. Opacity ramps 0 → opacityEnd. (Rotation would rotate
        // the cell; for a radially-symmetric dot mask it is a visual no-op, so
        // it is intentionally not applied to the circular reveal.)
        instOpacityMul = seq.opacityEnd !== undefined ? p * seq.opacityEnd : p;
        instScale = seq.scaleEnd !== undefined ? p * seq.scaleEnd : p;
      }

      if (cell && cellBBox && stampImg && instOpacityMul > 0 && instScale > 0) {
        const instTransform = new Float64Array(worldTransform);
        if (instScale !== 1) {
          // Scale the cell about its own center (instance origin), then translate.
          instTransform[0] *= instScale; instTransform[1] *= instScale;
          instTransform[4] *= instScale; instTransform[5] *= instScale;
        }
        instTransform[12] += inst.x;
        instTransform[13] += inst.y;
        const dstBBox = transformBBoxToOutput(stampImg, cellBBox, instTransform);
        const instOpacity = opacity * instOpacityMul;
        if (cell.kind === 'window') {
          // Reveal the source image at this instance's screen location through
          // the (transformed) shape mask — dots/tiles are windows, not stamps.
          revealThroughMask(output, cell.source, stampImg, instTransform, instOpacity, dstBBox);
        } else {
          blitTransformed(output, stampImg, instTransform, instOpacity, crop, 'normal', dstBBox);
        }
      }
      // Also render any evaluated cell children (rare — most cells are empty and
      // rely purely on the Object Source above).
      for (let i = evalLayer.children.length - 1; i >= 0; i--) {
        const childCell = evalLayer.children[i];
        const instCell: EvaluatedLayer = {
          ...childCell,
          worldTransform: mat4MultiplyOffset(childCell.worldTransform, inst.x, inst.y),
        };
        renderLayer(output, instCell, imageA, imageB, time, filterOverrides);
      }
    }
    return;
  }

  if (layer.type === 'clone') {
    // Clone Layer: draw the image of the object it mirrors, at this layer's transform.
    let src = resolveCloneImage(layer.cloneSourceId);
    if (src) {
      // A clone may carry its OWN filters (e.g. Color Planes stacks 6 clones of the
      // same source, each with a Channel Mixer isolating one R/G/B channel, then
      // additively blends them at different Z depths for the chromatic-split look).
      // These per-pixel color filters must be applied to the cloned image BEFORE it
      // is projected/blitted — otherwise every clone renders the full-color source
      // and the additive stack blows out (too bright) or collapses (too dark).
      if (layer.filters.length > 0) {
        for (const filter of layer.filters) {
          src = applyFilter(src, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
      }
      if (needsPerspective(worldTransform)) {
        const corners = projectQuad(worldTransform, src.width, src.height, ctx?.cameraZ ?? 2000);
        renderPerspectiveQuad(output, src, corners, opacity, layer.blendMode);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop, layer.blendMode);
      }
    }
    // A clone may also have children (rare); fall through to render them.
  }

  if (layer.type === 'image' || layer.type === 'generator') {
    // Leaf layer: render source image with transform
    const src = getSourceImage(layer.source, imageA, imageB);
    if (src) {
      // An Image Mask clips ONLY this layer by a rig-selected wipe shape (e.g.
      // Wipes/Mask masks Transition B over an unmasked Transition A). Render to a
      // temp buffer, multiply alpha by the rasterized mask, then composite.
      const maskAlpha = layer.imageMaskSourceId !== undefined
        ? resolveImageMaskAlpha(layer.imageMaskSourceId, output.width, output.height)
        : null;
      if (maskAlpha) {
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, src, worldTransform, 1.0, crop);
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
        applyMask(filtered, maskAlpha);
        blitDirect(output, filtered, opacity, layer.blendMode);
      } else if (layer.filters.length > 0) {
        // Render to temp buffer, apply filters, then composite onto output
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, src, worldTransform, 1.0, crop); // full opacity to temp
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
        blitDirect(output, filtered, opacity, layer.blendMode);
      } else if (needsPerspective(worldTransform)) {
        // 3D perspective: project the source quad and rasterize
        const corners = projectQuad(worldTransform, src.width, src.height, ctx?.cameraZ ?? 2000);
        renderPerspectiveQuad(output, src, corners, opacity);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop, layer.blendMode);
      }
    }
  }

  // Render children (back to front = array order)
  if (evalLayer.children.length > 0) {
    // PAEFlop page-flip (Movements/Flip): render each page hinged on its OUTER
    // vertical edge instead of the shared group Y-axis. Front page (A) hinges on
    // its LEFT edge and opens by θ; the back page (B) hinges on its RIGHT edge and
    // opens by π−θ, so it lies face-on when θ→π. Only the page whose front faces
    // the camera (open angle < 90°) is drawn, matching FCP's book-page look.
    const flip = detectPageFlip(evalLayer);
    if (flip) {
      const camZ = ctx?.cameraZ ?? 2000;
      // The single visible page rotates about its centre vertical axis by θ. While
      // its front faces the camera (θ<90°) source A shows; past edge-on the page's
      // BACK faces the camera and PAEFlop (Flop=0) mirrors it horizontally so it
      // reads correctly. The headless reference resolves BOTH pages to source A, so
      // the same drop-zone media renders throughout.
      const pastEdge = flip.theta > Math.PI / 2;
      const page = pastEdge ? flip.back : flip.front;
      const src = getSourceImage(flip.front.layer.source, imageA, imageB);
      // Continuous centre-axis rotation by θ (0→π). While the front faces the
      // camera (θ<90°) source A shows normally; past edge-on the reverse faces the
      // camera and PAEFlop (Flop=0) mirrors it (mirrorUV) so it reads correctly.
      // The headless reference resolves BOTH pages to source A → same media
      // throughout. The far edge recedes only mildly in the GT (fit from the
      // first-half far-edge screen positions ⇒ camera ≈7000 for a 1080p scene, far
      // weaker perspective than the 2000 default), so we use FLIP_CAMERA_Z.
      if (src && page.visible) renderPageFlip(output, src, flip.theta, page.opacity, FLIP_CAMERA_Z, pastEdge);
      return;
    }



    // Separate mask shapes from visible children. Masks can be either direct
    // shape children OR nested inside a sub-group whose children are ALL masks
    // (e.g. a "Masks" layer holding several Bezier shapes). In the latter case
    // we "lift" the masks up so they clip the sibling content layers.
    const maskShapes: EvaluatedLayer[] = [];
    const visibleChildren: EvaluatedLayer[] = [];
    for (const child of evalLayer.children) {
      if (child.layer.type === 'shape' && child.layer.shape?.isMask) {
        maskShapes.push(child);
      } else if (isMaskGroup(child)) {
        // A group that contains only mask shapes → lift its masks.
        collectMaskShapes(child, maskShapes);
      } else {
        visibleChildren.push(child);
      }
    }

    const hasFilters = layer.filters.length > 0;
    const hasMasks = maskShapes.length > 0;
    const hasBlend = layer.blendMode !== 'normal';

    if (hasFilters || hasMasks || hasBlend) {
      // Render visible children to a temp buffer
      const groupBuffer = createBuffer(output.width, output.height);
      for (let i = visibleChildren.length - 1; i >= 0; i--) {
        renderLayer(groupBuffer, visibleChildren[i], imageA, imageB, time, filterOverrides);
      }

      // Apply masks (rasterize shapes, union them, apply to group content)
      if (hasMasks) {
        const masks = maskShapes
          .filter(m => m.visible && m.layer.shape)
          .map(m => rasterizeShape(m.layer.shape!, output.width, output.height, m.worldTransform));
        if (masks.length > 0) {
          const combined = masks.length === 1 ? masks[0] : unionMasks(masks, output.width, output.height);
          applyMask(groupBuffer, combined);
        }
      }

      // Apply filters
      let processed = groupBuffer;
      for (const filter of layer.filters) {
        processed = applyFilter(processed, filter, evalLayer, time, filterOverrides.get(filter.id));
      }

      // Composite onto output
      blitDirect(output, processed, opacity, layer.blendMode);
    } else {
      for (let i = visibleChildren.length - 1; i >= 0; i--) {
        renderLayer(output, visibleChildren[i], imageA, imageB, time, filterOverrides);
      }
    }
  }
}

// ============================================================================
// Main composite entry point
// ============================================================================

export function composite(
  scene: EvaluatedScene,  // includes scene.time
  imageA: ImageData,
  imageB: ImageData,
  width: number,
  height: number,
  mediaResolver?: (url: string) => ImageData | null
): ImageData {
  const output = createBuffer(width, height);

  // Set the render context so clone layers can resolve their mirrored image,
  // replicator cells can resolve their Object Source (evalLayerById), and 3D
  // perspective uses the scene's resolved camera framing distance (Camera node's
  // Angle Of View) — otherwise the legacy default.
  ctx = {
    layerById: scene.layerById,
    evalLayerById: scene.evalLayerById,
    imageA,
    imageB,
    cameraZ: scene.camera?.distance ?? 2000,
    imageMaskSourceIds: collectImageMaskSourceIds(scene.evalLayerById),
    mediaResolver,
    mediaCache: new Map<string, ImageData | null>(),
    animationEndSec: scene.animationEndSec || 1,
  };

  // Render layers back-to-front (Motion: first in list = top/foreground, last = bottom/background)
  for (let i = scene.layers.length - 1; i >= 0; i--) {
    renderLayer(output, scene.layers[i], imageA, imageB, scene.time, scene.filterOverrides);
  }

  ctx = null;
  return output;
}


/** Apply a filter to an image buffer. */
function applyFilter(input: ImageData, filter: import('../types.js').Filter, evalLayer: EvaluatedLayer, time: number, overrides?: Map<string, number>): ImageData {
  const name = filter.pluginName.toLowerCase();

  // Skip on-screen-control (OSC) preview filters — they're editor UI, not rendered
  // output. These share the SAME pluginName as the real filter (e.g. "PAEZoomBlur"),
  // so pluginName alone can't distinguish them. The scenenode `name` attribute
  // carries the "(for OSC)" marker, and OSC filters set `Publish OSC` = 1. Check
  // both: the display name for the marker, and the Publish OSC parameter as a
  // structural fallback.
  const nodeName = (filter.name || '').toLowerCase();
  const isOscByName = (s: string) => s.includes('for osc') || s.includes('(osc)') || s.endsWith(' osc');
  const publishOsc = filter.parameters.find(p => p.name === 'Publish OSC');
  const publishOscOn = publishOsc && typeof publishOsc.value === 'number' && publishOsc.value >= 1;
  if (isOscByName(name) || isOscByName(nodeName) || publishOscOn) {
    return input;
  }

  // Registry first (UUID-keyed, self-registering modules — the extensible path
  // that lets filters be added without touching this dispatch). Falls through to
  // the legacy name-matched chain below for filters not yet migrated.
  {
    const mod = lookupFilter(filter);
    if (mod) {
      const ctx = makeContext(filter, time, input.width, input.height, overrides);
      return mod.apply(input, ctx);
    }
  }

  // Resolve a filter parameter, preferring a rig override if present.
  const resolveParam = (paramName: string, fallback: number): number => {
    if (overrides && overrides.has(paramName)) return overrides.get(paramName)!;
    for (const p of filter.parameters) {
      if (p.name === paramName) {
        if (p.curve) return evaluateCurve(p.curve, time);
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  // Resolve a blur intensity parameter (Amount/Distance). A keyframed blur curve
  // in a transition template can be a dormant "template animation" whose actual
  // rendered strength is the curve's static `value` attribute — when that is 0 the
  // filter is authored-inactive and FCP renders NO blur even though the keyframes
  // ramp to a large value (verified for Blurs/Directional: a sharp impulse and the
  // full-photo laplacian profile are pixel-identical to the non-blurred Gaussian
  // crossfade). A rig override always wins (it's the live-driven value).
  const resolveBlurAmount = (paramName: string, fallback: number): number => {
    if (overrides && overrides.has(paramName)) return overrides.get(paramName)!;
    for (const p of filter.parameters) {
      if (p.name === paramName) {
        if (p.curve) {
          // Static value=0 on a keyframed curve = filter authored-inactive → no blur.
          if (p.curve.keyframes.length > 0 && p.curve.value === 0) return 0;
          return evaluateCurve(p.curve, time);
        }
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  if (name.includes('gaussian') || (name.includes('blur') && !name.includes('directional') && !name.includes('radial') && !name.includes('zoom'))) {
    // Mix is the effect wet/dry gate (0 = filter fully bypassed). Blurs/Gaussian &
    // Blurs/Radial select a rig snapshot whose Mix is 0 → the blur is OFF and the
    // transition is a pure crossfade (verified against FCP: a sharp impulse stays
    // 1px FWHM at every frame). Without this gate the engine over-blurred by ~40dB.
    const mix = resolveParam('Mix', 1);
    const amount = resolveBlurAmount('Amount', 0);
    if (mix > 0 && amount > 0) {
      return gaussianBlur(input, amount * (mix < 1 ? mix : 1));
    }
    return input;
  }
  // Bevel
  if (name.includes('bevel')) {
    let width = 0, lightAngle = 135, opacity = 1, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Bevel Width') width = val;
      if (p.name === 'Light Angle') lightAngle = val;
      if (p.name === 'Opacity') opacity = val;
      if (p.name === 'Mix') mix = val;
    }
    if (width > 0) return bevelFilter(input, { width, lightAngle, opacity, mix });
    return input;
  }
  // Luma Keyer
  if (name.includes('luma') && name.includes('key')) {
    let luma = 0.5, rolloff = 0.1, strength = 1;
    let invert = false;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Luma') luma = val;
      if (p.name === 'Luma Rolloff' || p.name === 'DefaultSoftness') rolloff = val;
      if (p.name === 'Strength') strength = val;
      if (p.name === 'Invert') invert = val > 0;
    }
    return lumaKeyerFilter(input, { luma, rolloff, strength, invert });
  }
  // Directional Blur
  if (name.includes('directional')) {
    const mix = resolveParam('Mix', 1);
    const amount = resolveBlurAmount('Amount', resolveBlurAmount('Distance', 0));
    const angle = resolveParam('Angle', 0);
    if (mix > 0 && amount > 0) return directionalBlur(input, amount, angle);
    return input;
  }
  // Radial Blur
  if (name.includes('radial')) {
    const mix = resolveParam('Mix', 1);
    const amount = resolveBlurAmount('Amount', resolveBlurAmount('Angle', 0));
    if (mix > 0 && amount > 0) return radialBlur(input, amount, 0.5, 0.5, 'spin');
    return input;
  }
  // Zoom Blur
  if (name.includes('zoom')) {
    const mix = resolveParam('Mix', 1);
    const amount = resolveBlurAmount('Amount', 0);
    if (mix > 0 && amount > 0) return zoomBlur(input, amount, 0.5, 0.5);
    return input;
  }
  // Hue/Saturation
  if (name.includes('hsv') || name.includes('hue') || name.includes('saturation')) {
    let hue = 0, saturation = 1, brightness = 0, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Hue' || p.name === 'Hue Rotation') hue = val;
      if (p.name === 'Saturation') saturation = val;
      if (p.name === 'Brightness' || p.name === 'Value') brightness = val;
      if (p.name === 'Mix') mix = val;
    }
    return hueSaturationFilter(input, { hue, saturation, brightness, mix });
  }
  // Channel Mixer
  if (name.includes('channel') && name.includes('mixer')) {
    const matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; // identity
    const offsets = [0,0,0,0];
    let mix = 1, monochrome = false;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      // Map param names to matrix positions
      if (p.name === 'Red - Red') matrix[0] = val;
      if (p.name === 'Red - Green') matrix[1] = val;
      if (p.name === 'Red - Blue') matrix[2] = val;
      if (p.name === 'Green - Red') matrix[4] = val;
      if (p.name === 'Green - Green') matrix[5] = val;
      if (p.name === 'Green - Blue') matrix[6] = val;
      if (p.name === 'Blue - Red') matrix[8] = val;
      if (p.name === 'Blue - Green') matrix[9] = val;
      if (p.name === 'Blue - Blue') matrix[10] = val;
      if (p.name === 'Red Output') offsets[0] = val;
      if (p.name === 'Green Output') offsets[1] = val;
      if (p.name === 'Blue Output') offsets[2] = val;
      if (p.name === 'Mix') mix = val;
      if (p.name === 'Monochrome') monochrome = val > 0;
    }
    return channelMixerFilter(input, { matrix, offsets, mix, monochrome });
  }
  // Tint (PAETint / TintFx)
  if (name.includes('tint')) {
    let r = 1, g = 1, b = 1, intensity = 1, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Red') r = val;
      if (p.name === 'Green') g = val;
      if (p.name === 'Blue') b = val;
      if (p.name === 'Intensity') intensity = val;
      if (p.name === 'Mix') mix = val;
    }
    return tintFilter(input, r, g, b, intensity, mix);
  }
  // Colorize — Motion's is a black/white luminance remap, NOT a hue tint. Each
  // pixel's luminance is mapped through a gradient from "Remap Black To" (at lum 0)
  // to "Remap White To" (at lum 1). Used by Slide's tiles to recolor grayscale
  // tile PNGs. The two endpoints are RGB color params (children Red/Green/Blue),
  // and may be rig-driven (a Color widget selecting an accent) — honor overrides.
  if (name.includes('colorize')) {
    const readColor = (paramName: string, def: {r:number;g:number;b:number}): {r:number;g:number;b:number} => {
      const p = filter.parameters.find(pp => pp.name === paramName);
      if (!p) return def;
      const ch = (n: string): number | undefined => {
        const c = p.children?.find(cc => cc.name === n);
        if (!c) return undefined;
        return c.curve ? evaluateCurve(c.curve, time) : (typeof c.value === 'number' ? c.value : undefined);
      };
      return { r: ch('Red') ?? def.r, g: ch('Green') ?? def.g, b: ch('Blue') ?? def.b };
    };
    const black = readColor('Remap Black To', { r: 0, g: 0, b: 0 });
    const white = readColor('Remap White To', { r: 1, g: 1, b: 1 });
    let mix = 1;
    const mixP = filter.parameters.find(p => p.name === 'Mix');
    if (mixP) {
      const v = mixP.curve ? evaluateCurve(mixP.curve, time) : (typeof mixP.value === 'number' ? mixP.value : undefined);
      if (v !== undefined) mix = v;
    }
    return colorizeRemapFilter(input, black, white, mix);
  }
  // Levels filter
  if (name.includes('level') || name === 'paelevels') {
    let blackIn = 0, whiteIn = 1, gamma = 1, whiteOut = 1, mix = 1;
    for (const p of filter.parameters) {
      const pn = p.name;
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (pn === 'Black In') blackIn = val;
      if (pn === 'White In') whiteIn = val;
      if (pn === 'Gamma') gamma = val;
      if (pn === 'White Out') whiteOut = val;
      if (pn === 'Mix') mix = val;
    }
    return levelsFilter(input, { blackIn, whiteIn, gamma, whiteOut, mix });
  }
  // Brightness filter
  if (name.includes('brightness')) {
    let amount = 0;
    for (const p of filter.parameters) {
      if (p.name === 'Brightness' || p.name === 'Amount') {
        amount = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : 0);
        break;
      }
    }
    return brightnessFilter(input, amount);
  }
  // Glow filter (PAEGlow): Radius (blur), Threshold, Opacity (intensity, can be >1)
  if (name.includes('glow')) {
    let radius = 0, threshold = 0, intensity = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Radius') radius = val;
      if (p.name === 'Threshold') threshold = val;
      if (p.name === 'Opacity' || p.name === 'Intensity') intensity = val;
    }
    if (radius > 0 && intensity > 0) {
      return glowFilter(input, { radius, threshold, amount: intensity });
    }
    return input;
  }
  // Bloom filter (PAEBloom): Amount (blur spread), Brightness (intensity boost), Threshold
  if (name.includes('bloom')) {
    let amount = 0, brightness = 1, threshold = 0;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Amount') amount = val;
      if (p.name === 'Brightness') brightness = val;
      if (p.name === 'Threshold') threshold = val;
    }
    if (amount > 0 && brightness > 0) {
      // Bloom: brighten above threshold, blur, screen-add. Brightness is 0-100 (÷ scale).
      // Threshold here is 0-100 (÷100 to normalize).
      return glowFilter(input, { radius: amount, threshold: threshold / 100, amount: brightness / 100 });
    }
    return input;
  }
  return input;
}

/** Blit source directly onto destination with opacity (no transform, 1:1 pixel copy). */
function blitDirect(dst: ImageData, src: ImageData, opacity: number, blendMode: BlendMode = 'normal'): void {
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
