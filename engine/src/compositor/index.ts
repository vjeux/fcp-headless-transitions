import { gaussianBlur } from './filters/gaussian-blur.js';
import { glowFilter } from './filters/glow.js';
import { levelsFilter, brightnessFilter } from './filters/levels.js';
import { channelMixerFilter, colorizeFilter, tintFilter } from './filters/channel-mixer.js';
import { hueSaturationFilter } from './filters/hue-saturation.js';
import { directionalBlur, radialBlur, zoomBlur } from './filters/directional-blur.js';
import { lumaKeyerFilter } from './filters/luma-keyer.js';
import { bevelFilter } from './filters/bevel.js';
import { evaluateCurve } from '../evaluator/curves.js';
import { rasterizeShape, applyMask, unionMasks } from './shapes.js';
import { needsPerspective, projectQuad, renderPerspectiveQuad } from './perspective.js';
import { generateInstances } from './replicator.js';
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

/**
 * Render context set per composite() call. Holds the object-ID map so clone
 * layers can resolve the image of the object they mirror.
 */
interface RenderContext {
  layerById: Map<number, Layer>;
  evalLayerById: Map<number, EvaluatedLayer>;
  imageA: ImageData;
  imageB: ImageData;
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
      // Inverse-map output → mask-source centered → mask pixel.
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

      const lerp2 = (a: number, b: number, c: number, d: number) =>
        (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;

      const sr = lerp2(src.data[i00], src.data[i10], src.data[i01], src.data[i11]);
      const sg = lerp2(src.data[i00+1], src.data[i10+1], src.data[i01+1], src.data[i11+1]);
      const sb = lerp2(src.data[i00+2], src.data[i10+2], src.data[i01+2], src.data[i11+2]);
      const srcAlpha = lerp2(src.data[i00+3], src.data[i10+3], src.data[i01+3], src.data[i11+3]);
      const sa = srcAlpha / 255 * opacity;

      const dstIdx = (dy * dw + dx) * 4;

      if (sa <= 0) continue;

      // Source-over compositing (premultiplied)
      const da = dst.data[dstIdx + 3] / 255;
      const outA = sa + da * (1 - sa);

      if (outA > 0) {
        dst.data[dstIdx]     = Math.round((sr * sa + dst.data[dstIdx]     * da * (1 - sa)) / outA);
        dst.data[dstIdx + 1] = Math.round((sg * sa + dst.data[dstIdx + 1] * da * (1 - sa)) / outA);
        dst.data[dstIdx + 2] = Math.round((sb * sa + dst.data[dstIdx + 2] * da * (1 - sa)) / outA);
        dst.data[dstIdx + 3] = Math.round(outA * 255);
      }
    }
  }
}

// ============================================================================
// Layer rendering
// ============================================================================



function getSourceImage(source: ImageSource | undefined, imageA: ImageData, imageB: ImageData): ImageData | null {
  if (!source) return null;
  switch (source.type) {
    case 'transitionA': return imageA;
    case 'transitionB': return imageB;
    case 'color': {
      // Solid color fill
      const { r, g, b, a } = source;
      const img = createBuffer(imageA.width, imageA.height);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = r; img.data[i+1] = g; img.data[i+2] = b; img.data[i+3] = Math.round(a * 255);
      }
      return img;
    }
    default: return null;
  }
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

    for (const inst of instances) {
      if (cell && cellBBox && stampImg) {
        const instTransform = new Float64Array(worldTransform);
        instTransform[12] += inst.x;
        instTransform[13] += inst.y;
        const dstBBox = transformBBoxToOutput(stampImg, cellBBox, instTransform);
        if (cell.kind === 'window') {
          // Reveal the source image at this instance's screen location through
          // the (transformed) shape mask — dots/tiles are windows, not stamps.
          revealThroughMask(output, cell.source, stampImg, instTransform, opacity, dstBBox);
        } else {
          blitTransformed(output, stampImg, instTransform, opacity, crop, dstBBox);
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
    const src = resolveCloneImage(layer.cloneSourceId);
    if (src) {
      if (needsPerspective(worldTransform)) {
        const corners = projectQuad(worldTransform, src.width, src.height);
        renderPerspectiveQuad(output, src, corners, opacity);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop);
      }
    }
    // A clone may also have children (rare); fall through to render them.
  }

  if (layer.type === 'image' || layer.type === 'generator') {
    // Leaf layer: render source image with transform
    const src = getSourceImage(layer.source, imageA, imageB);
    if (src) {
      if (layer.filters.length > 0) {
        // Render to temp buffer, apply filters, then composite onto output
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, src, worldTransform, 1.0, crop); // full opacity to temp
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
        blitDirect(output, filtered, opacity);
      } else if (needsPerspective(worldTransform)) {
        // 3D perspective: project the source quad and rasterize
        const corners = projectQuad(worldTransform, src.width, src.height);
        renderPerspectiveQuad(output, src, corners, opacity);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop);
      }
    }
  }

  // Render children (back to front = array order)
  if (evalLayer.children.length > 0) {
    // Separate mask shapes from visible children
    const maskShapes: EvaluatedLayer[] = [];
    const visibleChildren: EvaluatedLayer[] = [];
    for (const child of evalLayer.children) {
      if (child.layer.type === 'shape' && child.layer.shape?.isMask) {
        maskShapes.push(child);
      } else {
        visibleChildren.push(child);
      }
    }

    const hasFilters = layer.filters.length > 0;
    const hasMasks = maskShapes.length > 0;

    if (hasFilters || hasMasks) {
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
      blitDirect(output, processed, opacity);
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
  height: number
): ImageData {
  const output = createBuffer(width, height);

  // Set the render context so clone layers can resolve their mirrored image.
  ctx = { layerById: scene.layerById, evalLayerById: scene.evalLayerById, imageA, imageB };

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

  // Skip on-screen-control (OSC) preview filters — they're editor UI, not rendered output.
  if (name.includes('for osc') || name.includes('(osc)') || name.endsWith(' osc')) {
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
  if (name.includes('gaussian') || (name.includes('blur') && !name.includes('directional') && !name.includes('radial') && !name.includes('zoom'))) {
    const amount = resolveParam('Amount', 0);
    if (amount > 0) {
      return gaussianBlur(input, amount);
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
    const amount = resolveParam('Amount', resolveParam('Distance', 0));
    const angle = resolveParam('Angle', 0);
    if (amount > 0) return directionalBlur(input, amount, angle);
    return input;
  }
  // Radial Blur
  if (name.includes('radial')) {
    const amount = resolveParam('Amount', resolveParam('Angle', 0));
    if (amount > 0) return radialBlur(input, amount, 0.5, 0.5, 'spin');
    return input;
  }
  // Zoom Blur
  if (name.includes('zoom')) {
    const amount = resolveParam('Amount', 0);
    if (amount > 0) return zoomBlur(input, amount, 0.5, 0.5);
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
  // Colorize
  if (name.includes('colorize')) {
    let hue = 0, saturation = 1, mix = 1;
    for (const p of filter.parameters) {
      const val = p.curve ? evaluateCurve(p.curve, time) : (typeof p.value === 'number' ? p.value : undefined);
      if (val === undefined) continue;
      if (p.name === 'Remap Black To' || p.name === 'Hue') hue = val;
      if (p.name === 'Saturation' || p.name === 'Intensity') saturation = val;
      if (p.name === 'Mix') mix = val;
    }
    return colorizeFilter(input, hue, saturation, mix);
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
function blitDirect(dst: ImageData, src: ImageData, opacity: number): void {
  for (let i = 0; i < dst.data.length; i += 4) {
    const sa = src.data[i + 3] / 255 * opacity;
    if (sa <= 0) continue;
    const da = dst.data[i + 3] / 255;
    const outA = sa + da * (1 - sa);
    if (outA > 0) {
      dst.data[i]     = Math.round((src.data[i]     * sa + dst.data[i]     * da * (1 - sa)) / outA);
      dst.data[i + 1] = Math.round((src.data[i + 1] * sa + dst.data[i + 1] * da * (1 - sa)) / outA);
      dst.data[i + 2] = Math.round((src.data[i + 2] * sa + dst.data[i + 2] * da * (1 - sa)) / outA);
      dst.data[i + 3] = Math.round(outA * 255);
    }
  }
}
