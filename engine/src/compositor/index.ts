import { gaussianBlur } from './filters/gaussian-blur.js';
import { directionalBlur, radialBlur, zoomBlur } from './filters/directional-blur.js';
import { evaluateCurve } from '../evaluator/curves.js';
import { rasterizeShape, applyMask, unionMasks } from './shapes.js';
import { needsPerspective, projectQuad, renderPerspectiveQuad, renderPageFlip } from './perspective.js';
import { blendChannel, isSeparable, luma, luma601 } from './blend.js';
import type { BlendMode } from '../types.js';
import { generateInstances, sequenceProgress, sequenceOrder } from './replicator.js';
import { lookupFilter, makeContext } from './filters/registry.js';
import './filters/index.js'; // side-effect: registers all UUID-keyed filter modules

/**
 * Framing-camera view transform (factory-3 "Framing" behaviors). GENERIC primitive:
 * any scene whose Camera carries Framing behaviors gets a moving look-at camera whose
 * pose is computed entirely from the behavior parameters (OZScene::computeFraming —
 * distance = halfBBoxExtent/tan(AOV/2), oriented by the target's calcFramingRotation
 * world basis, cross-blended across the behaviors' timing windows; see
 * evaluator/framing.ts). No transition name, no GT-fit constant. Every replicator
 * tile and framed image layer is projected through this camera (projectFramed).
 */
const FRAMING_VIEW_ENABLED = true;

/** Orthonormal look-at camera basis from a resolved framing pose (eye→target). */
function framedCameraBasis(
  framed: { eye: [number, number, number]; target: [number, number, number]; aov: number },
  frameHeight: number,
): { eye: [number, number, number]; right: [number, number, number]; up: [number, number, number]; fwd: [number, number, number]; focal: number } {
  const eye = framed.eye;
  let fx = framed.target[0] - eye[0], fy = framed.target[1] - eye[1], fz = framed.target[2] - eye[2];
  const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
  const wu: [number, number, number] = [0, 1, 0];
  let rx = fy * wu[2] - fz * wu[1], ry = fz * wu[0] - fx * wu[2], rz = fx * wu[1] - fy * wu[0];
  const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl;
  const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
  const focal = (frameHeight / 2) / Math.tan((framed.aov * Math.PI) / 360);
  return { eye, right: [rx, ry, rz], up: [ux, uy, uz], fwd: [fx, fy, fz], focal };
}

/**
 * Project a world point through the look-at camera to a centre-relative screen
 * offset (+x right, +y up) plus the per-point perspective scale (focal/depth).
 * Returns null when the point is at/behind the camera plane.
 */
function projectFramed(
  wx: number, wy: number, wz: number,
  cam: { eye: [number, number, number]; right: [number, number, number]; up: [number, number, number]; fwd: [number, number, number]; focal: number },
): { sx: number; sy: number; ps: number } | null {
  const dx = wx - cam.eye[0], dy = wy - cam.eye[1], dz = wz - cam.eye[2];
  const cz = dx * cam.fwd[0] + dy * cam.fwd[1] + dz * cam.fwd[2];
  if (cz <= 1e-3) return null;
  const cx = dx * cam.right[0] + dy * cam.right[1] + dz * cam.right[2];
  const cy = dx * cam.up[0] + dy * cam.up[1] + dz * cam.up[2];
  const ps = cam.focal / cz;
  return { sx: cx * ps, sy: cy * ps, ps };
}

/**
 * Motion Drop Zone placeholder fill for an UNFILLED user-media well
 * (dropZone.type===3 with an empty Fill Color). Decompiled from Ozone's
 * OZImageElement::createDropZoneGridBitmap (the placeholder-grid generator draws
 * its cells at RGB 0x96,0x96,0x96 = 150). This is the generator's own default fill
 * read from the framework — NOT a value traced from any GT frame. Cached by size.
 */
const DROPZONE_PLACEHOLDER_GRAY = 0x96; // 150 — Ozone createDropZoneGridBitmap constant
let _dzPlaceholder: { w: number; h: number; img: ImageData } | null = null;
function dropZonePlaceholderCell(w: number, h: number): ImageData {
  if (_dzPlaceholder && _dzPlaceholder.w === w && _dzPlaceholder.h === h) return _dzPlaceholder.img;
  const data = new Uint8ClampedArray(w * h * 4);
  const g = DROPZONE_PLACEHOLDER_GRAY;
  for (let i = 0; i < data.length; i += 4) { data[i] = g; data[i + 1] = g; data[i + 2] = g; data[i + 3] = 255; }
  const img = new ImageData(data, w, h);
  _dzPlaceholder = { w, h, img };
  return img;
}

/** Offset a transform matrix's translation by (dx, dy). */
function mat4MultiplyOffset(m: Float64Array, dx: number, dy: number): Float64Array {
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
function mat4Mul(a: Float64Array, b: Float64Array): Float64Array {
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
function instanceLocalMatrix(x: number, y: number, angle: number, scale: number): Float64Array {
  const cs = Math.cos(angle) * scale, sn = Math.sin(angle) * scale;
  const m = new Float64Array(16);
  m[0] = cs; m[1] = sn; m[4] = -sn; m[5] = cs; m[10] = scale; m[15] = 1;
  m[12] = x; m[13] = y; m[14] = 0;
  return m;
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
import type { ImageSource, Layer, RationalTime } from '../types.js';
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
  /** Camera node's animated world Z position (dolly). Undefined when no camera. */
  cameraPosZ?: number;
  /**
   * Framing camera pose (OZScene::computeFraming), present only when the camera
   * carries Framing behaviors (factory 3, "Framing"). When present the tile wall
   * (replicator instances / clones) is routed through this moving camera: world
   * coords are shifted by −(viewX,viewY) so the framed region is centered, and
   * perspective uses `framingDistance`. Gated so origin-camera transitions are
   * untouched (see renderLayer's replicator branch).
   */
  framed?: { viewX: number; viewY: number; viewZ: number; framingDistance: number; eye: [number, number, number]; target: [number, number, number]; aov: number };
  /**
   * Set of object IDs referenced as an Image Mask `Mask Source` by some layer.
   * A group in this set is a hidden geometry provider (it clips its owning layer
   * via the Image Mask), NOT a sibling-clip "Masks" group, so `isMaskGroup` must
   * NOT lift it to clip the enclosing group.
   */
  imageMaskSourceIds: Set<number>;
  /**
   * Host-injected resolver for bundled-media relativeURLs. Still images (e.g.
   * Slide's tile PNGs) ignore the second arg; VIDEO media (e.g. Objects/Veil's
   * `Media/Veil.mov` overlay + wipe-matte) uses `timeSec` (current scene time)
   * to pick the correct mov frame. The resolver owns its own decode cache.
   */
  mediaResolver?: (url: string, timeSec?: number, absolute?: boolean) => ImageData | null;
  /** Per-frame cache of resolved media (avoids re-decoding a tile per layer/frame). */
  mediaCache: Map<string, ImageData | null>;
  /** Animation end (seconds) so replicator sequencing can normalize global time. */
  animationEndSec: number;
  /** Current scene time (seconds) — threaded to the media resolver for video media. */
  time: number;
  /**
   * Un-wrapped scene time (seconds) used for VIDEO media resolution. The host's
   * drop-zone retime wraps `scene.time` back to 0 for the tail frames (see
   * unwrappedTime); a .mov overlay/matte must keep advancing through those frames,
   * so the media resolver is fed the un-wrapped time instead. Falls back to `time`.
   */
  mediaTime: number;
  /**
   * Object ID of the full-frame bundled texture that the particle-field proxy owns
   * (Stylized/Nature emitter transitions). When set, renderLayer SKIPS that image
   * layer's normal render — the proxy composites the texture over the whole frame on
   * a derived envelope, so rendering it twice (once dim, once via the proxy) would
   * double-count. Undefined when the scene has no particle-field proxy.
   */
  fieldTextureLayerId?: number;
  /**
   * Movements/Drop In card conform. Drop In renders its two Transition A/B drop
   * zones NOT full-frame but conformed into a smaller CARD anchored at the scene's
   * top-left (the drop-zone media is 600px tall in a 720px scene → the source is
   * scaled to ~83% of frame height and pinned top-left; verified against GT:
   * the settled A card is exactly 1588×902 at (0,0) in the 1920×1080 output).
   * Image A is the static card; image B rides the bounce (its Position-Y curve) as
   * a same-size card BEHIND A. When set, renderLayer draws Transition A/B through
   * this card conform instead of the default full-frame blit. See detectDropInCard.
   */
  dropInCard?: DropInCard;
}

/** Drop In card-conform geometry (output-pixel space). */
interface DropInCard {
  /** Card width/height in output pixels (source conformed to the drop-zone box). */
  cardW: number;
  cardH: number;
  /** scene→output scale applied to the bounce Position-Y (outputH / sceneH). */
  posScale: number;
  /** Layer IDs of the two drop-zone image nodes (A static, B bouncing). */
  aId: number;
  bId: number;
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

  // Unfilled user-media Drop Zone well (Type=3): the headless render supplies only
  // Transition A (Type=1) and B (Type=2); a Type-3 "Pin"/user well has no media, so
  // Motion renders its placeholder (OZImageElement::createDropZoneGridBitmap → flat
  // gray). This is the generic drop-zone semantic — a Type-3 well with no host media
  // is always the placeholder, independent of which transition it belongs to. The
  // clip ref on these wells resolves to the A-footage id in the graph, so this must
  // be checked BEFORE the transitionA/B fall-through below.
  if (src.type === 'image' && src.dropZone?.type === 3) {
    return { kind: 'image', img: dropZonePlaceholderCell(imageA.width, imageA.height) };
  }

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
function blitDstBBox(
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



function getSourceImage(source: ImageSource | undefined, imageA: ImageData, imageB: ImageData, clipTimeOverride?: number): ImageData | null {
  if (!source) return null;
  switch (source.type) {
    case 'transitionA': return imageA;
    case 'transitionB': return imageB;
    case 'media': {
      // Bundled template asset. Still images (Slide's tiles) resolve by URL and
      // are cached per frame. VIDEO media (Objects/Veil, Leaves) varies with
      // scene time, so it is keyed by url@time and never cached across frames —
      // the host resolver owns the mov decode cache.
      if (!ctx?.mediaResolver) return null;
      // A media layer with a Retime Value curve of clip FRAME numbers supplies an
      // absolute forward clip time (clipTimeOverride). This is the authoritative
      // per-clip playhead (Lights/Light Noise: the screen-blend light-noise .mov
      // plays FORWARD through the transition per its Retime curve). When present,
      // resolve at that absolute clip time (no reverse). Otherwise fall back to the
      // global mediaTime + resolver's reverse heuristic (Veil/Leaves default).
      const absolute = clipTimeOverride !== undefined;
      const t = absolute ? clipTimeOverride! : ctx.mediaTime;
      const key = `${source.url}@${t.toFixed(4)}${absolute ? '#abs' : ''}`;
      const cache = ctx.mediaCache;
      if (cache.has(key)) return cache.get(key)!;
      const img = ctx.mediaResolver(source.url, t, absolute);
      cache.set(key, img);
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

/**
 * A FLAT coplanar 2D stack: ≥2 visible full-frame image/clone/generator layers
 * that carry ONLY Z-rotation (no camera-facing 3D X/Y tilt), with at least one
 * Clone Layer. This is the Movements/Switch signature (Clone B + the two rotating
 * drop zones). Such groups composite in DECLARED order (LAST-listed on top),
 * unlike the default reverse convention. The 3D-hinge groups (Rotate/Reflection/
 * Flip) are excluded: their pages carry X/Y rotation, which couples into the world
 * matrix's third row/col, so this returns false for them.
 */
function isFlatCoplanarStack(children: EvaluatedLayer[]): boolean {
  const content = children.filter(c =>
    c.layer.type === 'image' || c.layer.type === 'clone' || c.layer.type === 'generator');
  if (content.length < 2) return false;
  if (!content.some(c => c.layer.type === 'clone')) return false;
  // A pure Z-rotation + translation + scale matrix has m2,m6,m8,m9 ≈ 0. A Y- or
  // X-rotation (page flip / hinge) puts sinθ into m8 / m6, so any non-trivial value
  // there means the layer is not coplanar-2D.
  for (const c of content) {
    const m = c.worldTransform;
    if (Math.abs(m[2]) > 1e-3 || Math.abs(m[6]) > 1e-3 || Math.abs(m[8]) > 1e-3 || Math.abs(m[9]) > 1e-3) return false;
  }
  return true;
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
 * Rasterize a Replicator (used as an Image Mask source) into a reveal-matte alpha.
 *
 * The replicator tiles a cell SHAPE across a grid; its Sequence Replicator
 * behavior grows each instance's Scale/Opacity 0→1 in a staggered order (the
 * corner-to-corner dot wave). We resolve the cell's shape geometry once, then for
 * each instance apply the sequenced per-instance scale, rasterize the shape at the
 * instance's world transform, and union all instances into a single alpha mask.
 * Returns null when the cell isn't a resolvable shape.
 */
function replicatorMaskAlpha(replEval: EvaluatedLayer, W: number, H: number): Uint8Array | null {
  const layer = replEval.layer;
  if (!layer.replicator || layer.cellSourceId === undefined || !ctx) return null;

  // Resolve the cell's shape geometry (the dot). The cell source is usually a
  // Group whose Rig selects one visible shape child (Circle); fall back to the
  // node itself if it is directly a shape.
  const cellEval = ctx.evalLayerById.get(layer.cellSourceId);
  let shapeLayer: EvaluatedLayer | undefined;
  if (cellEval) {
    if (cellEval.layer.type === 'shape' && cellEval.layer.shape) shapeLayer = cellEval;
    else shapeLayer = findVisibleShape(cellEval) ?? undefined;
  }
  if (!shapeLayer || shapeLayer.layer.type !== 'shape' || !shapeLayer.layer.shape) return null;
  const shape = shapeLayer.layer.shape;

  const instances = generateInstances(layer.replicator);
  const seq = layer.replicator.sequence;
  const cols = Math.max(1, Math.round(layer.replicator.columns));
  const rows = Math.max(1, Math.round(layer.replicator.rows));
  const globalProgress = seq ? (ctx.time ?? 0) / (ctx.animationEndSec || 1) : 0;

  // Base per-instance transform: the CELL SHAPE's evaluated basis (its authored
  // dot size/rotation), with translation supplied per-instance below. The dot's
  // size comes from the shape's own world scale (matches shapeMaskCell); the grid
  // placement comes from the replicator group translation + the instance offset.
  const base = shapeLayer.worldTransform;
  const rx = replEval.worldTransform[12];
  const ry = replEval.worldTransform[13];

  const masks: Uint8Array[] = [];
  for (const inst of instances) {
    let instScale = 1;
    let instOpacity = 1;
    if (seq) {
      const order = sequenceOrder(inst, cols, rows);
      const p = sequenceProgress(order, globalProgress, seq.end, seq.spread, instances.length);
      instScale = seq.scaleEnd !== undefined ? p * seq.scaleEnd : p;
      instOpacity = seq.opacityEnd !== undefined ? p * seq.opacityEnd : p;
    }
    if (instScale <= 0 || instOpacity <= 0) continue;
    const m = new Float64Array(base);
    if (instScale !== 1) {
      m[0] *= instScale; m[1] *= instScale;
      m[4] *= instScale; m[5] *= instScale;
    }
    // Grid placement: replicator group translation + instance grid offset.
    m[12] = rx + inst.x;
    m[13] = ry + inst.y;
    const cellMask = rasterizeShape(shape, W, H, m);
    // Fold the sequenced opacity into the cell's alpha so a mid-ramp dot reveals B
    // partially (matches Motion's cell opacity fade-in).
    if (instOpacity < 1) {
      for (let i = 0; i < cellMask.length; i++) cellMask[i] = Math.round(cellMask[i] * instOpacity);
    }
    masks.push(cellMask);
  }
  if (masks.length === 0) return new Uint8Array(W * H);
  return masks.length === 1 ? masks[0] : unionMasks(masks, W, H);
}

/** First visible shape descendant in an evaluated subtree (rig-selected cell). */
function findVisibleShape(el: EvaluatedLayer): EvaluatedLayer | null {
  if (el.layer.type === 'shape' && el.layer.shape && el.visible && !el.layer.shape.isMask) return el;
  for (const c of el.children) {
    const r = findVisibleShape(c);
    if (r) return r;
  }
  return null;
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
function resolveImageMaskAlpha(sourceId: number, W: number, H: number, invert = false): Uint8Array | null {
  if (!ctx) return null;
  const src = ctx.evalLayerById.get(sourceId);
  if (!src) return null;
  const applyInvert = (m: Uint8Array): Uint8Array => {
    if (!invert) return m;
    for (let i = 0; i < m.length; i++) m[i] = 255 - m[i];
    return m;
  };

  // REPLICATOR mask source (Replicator-Clones/Duplicate): the Image Mask's source
  // is a grid Replicator of cell shapes (dots) whose Sequence Replicator behavior
  // grows each cell's Scale/Opacity 0→1 in a staggered corner-to-corner wave. The
  // union of the sequenced cells is the reveal matte that clips the masked layer
  // (Transition B) over the unmasked base (Transition A). This is the generic
  // replicator-as-matte semantic — the same primitive as a shape mask source, just
  // tiled + sequenced across instances. Fully param-driven (grid layout, sequence
  // End/Spread, per-cell Scale) — no per-transition constant.
  if (src.layer.type === 'replicator' && src.layer.replicator) {
    const alpha = replicatorMaskAlpha(src, W, H);
    if (alpha) return applyInvert(alpha);
    return null;
  }
  // Video/image media mask source (e.g. Objects/Veil's "Veil - Wipe Matte" mov):
  // the layer is a media clip (often disabled — it exists only to supply matte
  // luma). Its LUMA drives the reveal. Rasterize the media (via the time-aware
  // resolver), fit it to the frame the same way a full-frame drop zone conforms,
  // and use luma (0..255) as the mask alpha.
  if (src.layer.type === 'image' && src.layer.source) {
    const mediaImg = getSourceImage(src.layer.source, ctx.imageA, ctx.imageB);
    if (mediaImg) {
      const alpha = new Uint8Array(W * H);
      // Full-frame matte: sample the media conformed to the output frame.
      const mw = mediaImg.width, mh = mediaImg.height;
      for (let y = 0; y < H; y++) {
        const sy = Math.min(mh - 1, Math.floor(y * mh / H));
        for (let x = 0; x < W; x++) {
          const sx = Math.min(mw - 1, Math.floor(x * mw / W));
          const si = (sy * mw + sx) * 4;
          // Rec.601 luma; premultiply by the matte's own alpha (fully opaque here).
          const l = luma601(mediaImg.data[si], mediaImg.data[si + 1], mediaImg.data[si + 2]);
          alpha[y * W + x] = Math.round(l * (mediaImg.data[si + 3] / 255));
        }
      }
      return applyInvert(alpha);
    }
  }
  // Collect visible shape descendants (the rig opacity selects the active one).
  // A hidden ancestor group (opacity 0, e.g. the inactive "Number of Sections"
  // snapshot subgroup in Dissolves/Divide) hides its whole subtree — the shape's
  // own opacity is 1 but the rig zeroes the enclosing group, so we must NOT
  // descend into a group whose opacity is 0 (else all snapshot variants union and
  // the mask over-covers the frame). The Mask Source group itself is always
  // traversed (it is the hidden geometry provider — its own opacity is irrelevant).
  // A mask-source group may hold plain shapes AND Clone Layers that reference
  // another shape (Objects/Arrows: C6/C7/C8 are clones of C3/C5 placed at their own
  // rotation/scale — extra arrow instances). Collect each as {shape geometry,
  // world transform to rasterize it at}. Clones borrow the referenced shape's
  // geometry (incl. its stroke) but use the CLONE's own transform.
  const entries: { shape: import('../types.js').Shape; xform: Float64Array; writeOnPhase?: number }[] = [];
  const findShapeLayer = (id: number): EvaluatedLayer | undefined => ctx!.evalLayerById.get(id);
  const walk = (el: EvaluatedLayer, isRoot: boolean): void => {
    if (!isRoot && el.layer.type === 'group' && el.opacity <= 0) return;
    if (el.layer.type === 'shape' && el.layer.shape && el.visible) {
      entries.push({ shape: el.layer.shape, xform: el.worldTransform });
    } else if (el.layer.type === 'clone' && el.visible && el.layer.cloneSourceId !== undefined) {
      // Resolve the clone's source shape (may itself chain through clones).
      let srcId: number | undefined = el.layer.cloneSourceId; let hop = 0;
      let srcLayer: EvaluatedLayer | undefined;
      while (srcId !== undefined && hop++ < 8) {
        srcLayer = findShapeLayer(srcId);
        if (!srcLayer) break;
        if (srcLayer.layer.type === 'shape' && srcLayer.layer.shape) break;
        srcId = srcLayer.layer.cloneSourceId;
      }
      if (srcLayer && srcLayer.layer.type === 'shape' && srcLayer.layer.shape) {
        entries.push({ shape: srcLayer.layer.shape, xform: el.worldTransform });
      }
    } else if (el.layer.type === 'replicator' && el.layer.replicator && el.visible) {
      // A Replicator inside the mask-source group (e.g. Vertigo's spiral of arc
      // rings). Generate its instances from the Shape arrangement + per-cell
      // Scale/Angle ramps, resolve the cell's arc SHAPE (Object Source id=128),
      // and add one entry per instance at its own pose so each ring rasterizes
      // into the mask. Fully param-driven — the same generic replicator layout
      // that stamps image cells, reused as a mask-geometry provider.
      const cellId = el.layer.cellSourceId;
      const cellLayer = cellId !== undefined ? findShapeLayer(cellId) : undefined;
      if (cellLayer && cellLayer.layer.type === 'shape' && cellLayer.layer.shape) {
        const insts = generateInstances(el.layer.replicator);
        for (const inst of insts) {
          const local = instanceLocalMatrix(inst.x, inst.y, inst.angle ?? 0, inst.scale ?? 1);
          entries.push({
            shape: cellLayer.layer.shape,
            xform: mat4Mul(el.worldTransform, local),
            // Per-instance write-on phase = the instance's normalized pattern
            // position. The cell's animated stroke offset is a GLOBAL front that
            // sweeps the spiral center→out; an instance only starts drawing once
            // the front reaches its pattern position (see the masks map). This
            // reproduces Motion's replicator "build" sweep, where the huge outer
            // rings appear late rather than all rings drawing at once.
            writeOnPhase: inst.normalizedIndex,
          });
        }
      }
    }
    for (const c of el.children) walk(c, false);
  };
  walk(src, true);
  if (entries.length === 0) return null;
  const t = ctx.time ?? 0;
  const resolveOffset = (v: number | { keyframes: { value: number }[]; value?: number; default: number } | undefined, def: number): number => {
    if (v === undefined) return def;
    if (typeof v === 'number') return v;
    // A Curve — evaluate at the current scene time.
    return evaluateCurve(v as any, t);
  };
  const masks = entries.map(e => {
    const stroke = e.shape.stroke;
    if (stroke) {
      const firstOffset = resolveOffset(stroke.firstPointOffset, 0);
      let lastOffset = resolveOffset(stroke.lastPointOffset, 1);
      // Per-instance write-on sweep: the cell's animated stroke offset is a GLOBAL
      // front (0→1) that travels across the replicator pattern center→out. An
      // instance at pattern phase `p` stays hidden until the front reaches it,
      // then draws its arc over a 1/N-wide band. Without this the huge outer rings
      // (per-cell Scale up to ~9×, so a single thick disc spans much of the frame)
      // all draw from frame 1 and the reveal is effectively instantaneous.
      if (e.writeOnPhase !== undefined && entries.length > 1) {
        // The cell's animated stroke offset is a GLOBAL front (0..1). Each instance
        // draws its own arc once the front reaches its pattern phase, over a band
        // one instance wide (the replicator's default sequential build order). The
        // front and per-instance timing come entirely from the .motr (the stroke
        // curve + the pattern index) — no GT-fit constant.
        const g = lastOffset;
        const band = 1 / entries.length;
        const local = (g - e.writeOnPhase) / band;
        lastOffset = Math.max(0, Math.min(1, local));
      }
      return rasterizeShape(e.shape, W, H, e.xform, ctx?.cameraZ, ctx?.cameraPosZ, { firstOffset, lastOffset });
    }
    return rasterizeShape(e.shape, W, H, e.xform);
  });
  const merged = masks.length === 1 ? masks[0] : unionMasks(masks, W, H);
  return applyInvert(merged);
}

/**
 * Absolute forward clip time (seconds) for a VIDEO media leaf whose Retime Value
 * curve stores clip FRAME numbers. Motion plays such a clip along its own
 * timeline: the Retime curve maps the layer-LOCAL time (scene mediaTime minus the
 * layer offset) to a clip frame; dividing by the clip's frame rate yields the
 * clip second to seek. This is the authoritative per-clip playhead for
 * screen-blend overlays like Lights/Light Noise (the light-noise .mov plays
 * FORWARD through the transition — NOT the reverse heuristic used for the
 * un-falling Veil/Leaves overlays, which lack a frame-numbered Retime curve on
 * their base clip). Returns undefined when there is no usable frame-numbered
 * retime curve, so the caller falls back to the global mediaTime + reverse.
 */
function retimedClipTime(evalLayer: EvaluatedLayer): number | undefined {
  const layer = evalLayer.layer;
  if (!layer.source || layer.source.type !== 'media') return undefined;
  // SCOPE (fix 2026-07-06): the forward frame-numbered clip playhead is ONLY correct
  // for a SCREEN/ADD-blend light overlay that FCP plays forward along its own Retime
  // timeline (Lights/Light Noise). Normal-blend media overlays with a wipe-matte
  // (Objects/Leaves, Objects/Veil) ALSO carry a frame-numbered retimeValue ([1..42])
  // but FCP plays them via the reverse heuristic (progress 0 = clip last frame) —
  // forcing them onto this forward path regressed Leaves 13.41→7.23 and Veil
  // 18.64→16.10. Gate on the same blend modes as p12's other Light-Noise changes so
  // reverse-played normal overlays keep the fallback (ctx.mediaTime + reverse).
  const bm = layer.blendMode;
  if (bm !== 'screen' && bm !== 'add' && bm !== 'overlay' && bm !== 'lighten') return undefined;
  const rv = layer.retimeValue;
  if (!rv || rv.keyframes.length < 2) return undefined;
  const fps = layer.source.frameRate;
  if (!fps || fps <= 0) return undefined;
  // Frame-numbered retime curves span a wide frame range (Light Noise 24→119).
  // A curve whose values are ~[0,1] is a normalized progress retime, not a clip
  // frame index — leave those to the fallback path.
  const first = rv.keyframes[0].value;
  const last = rv.keyframes[rv.keyframes.length - 1].value;
  if (Math.max(first, last) <= 2) return undefined;
  // Layer-local time = scene media time minus the layer's timeline offset.
  const off = layer.timing ? (layer.timing.offset.timescale > 0
    ? layer.timing.offset.value / layer.timing.offset.timescale : 0) : 0;
  const localTime = (ctx?.mediaTime ?? 0) - off;
  const frame = evaluateCurve(rv, localTime);
  // Motion's Retime Value / Page Number is a 1-BASED frame index: frame 1 is the
  // clip's FIRST frame (presentation time 0). Convert to the 0-based presentation
  // time the host resolver seeks with: clipTime = (frame - 1) / fps.
  return Math.max(0, (frame - 1) / fps);
}

function renderLayer(
  output: ImageData,
  evalLayer: EvaluatedLayer,
  imageA: ImageData,
  imageB: ImageData,
  time: number,
  filterOverrides: Map<number, Map<string, number>>
): void {  if (!evalLayer.visible) return;

  const { layer, worldTransform, opacity, crop } = evalLayer;

  // A group that is an Image Mask `Mask Source` is hidden geometry — it provides
  // alpha to the layer that references it (rendered there via resolveImageMaskAlpha),
  // and must never draw its shapes directly.
  if (layer.type === 'group' && ctx?.imageMaskSourceIds.has(layer.id)) return;

  // Replicator: render the cell content at each grid instance
  if (layer.type === 'replicator' && layer.replicator) {
    // A replicator that is an Image Mask `Mask Source` is HIDDEN geometry — it
    // provides the reveal matte to the layer that references it (Transition B),
    // rasterized there via resolveImageMaskAlpha → replicatorMaskAlpha. It must
    // never draw its cells directly (that would paint the dots as visible content
    // over the frame). Same semantic as the group-mask-source skip above.
    if (ctx?.imageMaskSourceIds.has(layer.id)) return;
    const instances = generateInstances(layer.replicator);

    // Framing-camera look-at basis (built once per replicator; present only when the
    // Camera carries factory-3 Framing behaviors). Generic — see framedCameraBasis.
    const framedCam = (FRAMING_VIEW_ENABLED && ctx?.framed && output.height)
      ? framedCameraBasis(ctx.framed, output.height)
      : undefined;

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
        // Framing camera (factory 3): project each tile through the moving look-at
        // camera resolved from the Framing behaviors (computeFraming pose +
        // calcFramingRotation basis, cross-blended over the behavior timing windows).
        // Fully param-driven — no per-transition constant. Origin-camera transitions
        // are untouched (framedCam is undefined unless a Framing behavior exists).
        if (framedCam) {
          const pr = projectFramed(instTransform[12], instTransform[13], instTransform[14], framedCam);
          if (!pr) continue; // tile behind the camera — skip
          instTransform[0] *= pr.ps; instTransform[1] *= pr.ps;
          instTransform[4] *= pr.ps; instTransform[5] *= pr.ps;
          instTransform[12] = pr.sx;
          instTransform[13] = pr.sy;
        }
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
      // A clone may carry its OWN mask shapes (e.g. Stylized/Color Panels clones a
      // hue/sat-shifted copy of a drop zone and clips it to a vertical "Rectangle
      // Mask" strip that slides off-frame). Rasterize the clone's mask children,
      // clip the clone's pixels to their union, then composite — so the tinted
      // clone shows only inside its panel, not across the whole frame. SCOPED to
      // clone layers (the parser only lifts <mask> siblings to clip children for
      // clones), so rig-selected masks on other node types are untouched.
      const cloneMasks = evalLayer.children
        .filter(c => c.layer.type === 'shape' && c.layer.shape?.isMask && c.visible)
        .map(c => rasterizeShape(c.layer.shape!, output.width, output.height, c.worldTransform));
      if (cloneMasks.length > 0) {
        const temp = createBuffer(output.width, output.height);
        if (needsPerspective(worldTransform)) {
          const corners = projectQuad(worldTransform, src.width, src.height, ctx?.cameraZ ?? 2000);
          renderPerspectiveQuad(temp, src, corners, 1.0, 'normal');
        } else {
          blitTransformed(temp, src, worldTransform, 1.0, crop, 'normal', blitDstBBox(temp, src, worldTransform, crop));
        }
        const combined = cloneMasks.length === 1 ? cloneMasks[0] : unionMasks(cloneMasks, output.width, output.height);
        applyMask(temp, combined);
        blitDirect(output, temp, opacity, layer.blendMode);
      } else if (needsPerspective(worldTransform)) {
        const corners = projectQuad(worldTransform, src.width, src.height, ctx?.cameraZ ?? 2000);
        renderPerspectiveQuad(output, src, corners, opacity, layer.blendMode);
      } else {
        blitTransformed(output, src, worldTransform, opacity, crop, layer.blendMode, blitDstBBox(output, src, worldTransform, crop));
      }
    }
    // A clone's mask children are consumed above; skip the generic child-render
    // (which would otherwise draw the mask shapes as visible content) when the
    // clone had mask children. Clones without masks fall through (rare).
    if (evalLayer.children.some(c => c.layer.type === 'shape' && c.layer.shape?.isMask)) return;
  }

  // Non-mask filled shape: a solid-color vector shape drawn as visible content
  // (NOT a mask). Motion uses these for color/flash overlays — e.g. Lights/Flash's
  // two full-frame white rectangles that peak at opacity ~1 mid-transition (one
  // Normal, one Overlay blend) to fade the cut through white. Rasterize the shape
  // at its world transform, fill with its Fill Color, and composite with the
  // layer's opacity + blend mode. Filters (if any) apply to the filled buffer.
  if (layer.type === 'shape' && layer.shape && !layer.shape.isMask && layer.shape.fillColor && opacity > 0) {
    const alpha = rasterizeShape(layer.shape, output.width, output.height, worldTransform, ctx?.cameraZ, ctx?.cameraPosZ);
    const { r, g, b, a } = layer.shape.fillColor;
    const fillBuf = createBuffer(output.width, output.height);
    const fd = fillBuf.data;
    for (let p = 0, di = 0; p < alpha.length; p++, di += 4) {
      const av = alpha[p];
      if (av === 0) continue;
      fd[di] = r; fd[di + 1] = g; fd[di + 2] = b;
      fd[di + 3] = Math.round(av * a);
    }
    let filtered = fillBuf;
    for (const filter of layer.filters) {
      filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
    }
    blitDirect(output, filtered, opacity, layer.blendMode);
    // A filled shape may still have children (e.g. a replicator emitter); fall
    // through so they render on top.
  }

  // Offset-authored sweeping PANEL shape (Stylized/Panels): a non-mask solid-fill
  // rectangle the parser marked `isSolidPanel` (offset re-anchored past `in` AND a
  // negative-time Position sweep). Paint it with its permissive Fill Color/Opacity
  // (`panelFill`/`panelFillOpacity`) and the layer's evaluated opacity + blend
  // mode. This is a SEPARATE path from the strict-`fillColor` block above — it only
  // fires for confirmed panels, so gradient-rendered Fill-Mode-0 shapes (Heart,
  // Center Reveal, Wipes/Diagonal) are never painted flat. Source-over composite.
  if (layer.type === 'shape' && layer.shape && layer.shape.isSolidPanel && layer.shape.panelFill && opacity > 0) {
    const shp = layer.shape;
    const { r, g, b } = shp.panelFill!;
    const mask = rasterizeShape(shp, output.width, output.height, worldTransform);
    const fillBuf = createBuffer(output.width, output.height);
    const fd = fillBuf.data;
    const fillA = shp.panelFillOpacity ?? 1;
    for (let p = 0, di = 0; p < mask.length; p++, di += 4) {
      const av = mask[p];
      if (av === 0) continue;
      fd[di] = r; fd[di + 1] = g; fd[di + 2] = b;
      fd[di + 3] = Math.round(av * fillA);
    }
    let filtered = fillBuf;
    for (const filter of layer.filters) {
      filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
    }
    blitDirect(output, filtered, opacity, layer.blendMode);
    // Panels can still have children; fall through.
  }

  // Drop-zone framing: a drop zone declares a Width×Height FRAME (e.g. 1920×1920)
  // that the source media is fit into (aspect-fill by width) BEFORE crop/scale.
  // Motion's Crop is therefore expressed in FRAME-pixel space, not source-pixel
  // space. A 1920×1080 source fit into a 1920×1920 frame is letterboxed with
  // (1920−1080)/2 = 420px bars top & bottom; a Crop of Top=Bottom=420 removes
  // exactly those bars, netting to the FULL source (no content cut). Convert the
  // frame-space crop into source-space so the panel shows the framed image rather
  // than a thin sliced band. Scoped to leaf image drop zones with a frame.
  let effCrop = crop;
  if ((layer.type === 'image') && layer.dropZone && layer.source) {
    const srcImg0 = evalLayer.forceSourceA ? imageA : getSourceImage(layer.source, imageA, imageB);
    if (srcImg0) {
      const fw = layer.dropZone.width, fh = layer.dropZone.height;
      const sw = srcImg0.width, sh = srcImg0.height;
      if (fw > 0 && fh > 0) {
        // Aspect-fill by width (Motion drop zones fill the frame width, letterbox
        // the shorter axis). Fitted source size within the frame:
        const fitScale = fw / sw;                    // width-fill
        const fittedH = sh * fitScale;               // fitted source height (frame px)
        const barTop = (fh - fittedH) / 2;           // frame-px letterbox bar
        const barBottom = barTop;
        const barLeft = 0, barRight = 0;             // width-fill → no side bars
        // Frame-space crop minus letterbox bar → source-frame px, then / fitScale
        // back into SOURCE pixels. Clamp ≥ 0 (a crop inside the bar shows full src).
        effCrop = {
          left: Math.max(0, crop.left - barLeft) / fitScale,
          right: Math.max(0, crop.right - barRight) / fitScale,
          top: Math.max(0, crop.top - barTop) / fitScale,
          bottom: Math.max(0, crop.bottom - barBottom) / fitScale,
        };
      }
    }
  }

  if (layer.type === 'image' || layer.type === 'generator') {
    // Skip the full-frame particle-field texture: the field proxy composites it
    // over the whole frame on a derived envelope (rendering it here too would
    // double-count and wash the early frames too gray). See applyParticleFieldProxy.
    if (layer.type === 'image' && ctx?.fieldTextureLayerId === layer.id) return;

    // Movements/Drop In: the Transition A/B drop-zone cards are drawn by a
    // dedicated pass in composite() (below) so their B-under-A z-order and the
    // tail frames (B timed out → A alone, not black) are correct regardless of
    // child render order / visibility. Skip both here.
    const card = ctx?.dropInCard;
    if (card && layer.type === 'image' && (layer.id === card.aId || layer.id === card.bId)) return;



    // Leaf layer: render source image with transform

    // A forced-A persistent base (wrapping drop zone past its lifetime) renders
    // source A regardless of its declared transitionA/B source — see evaluator's
    // DROPZONE_WRAP_TO_A (Lights/Flash's flash rides over a persistent A base).
    // A frame-numbered Retime curve (Lights/Light Noise's screen .mov) supplies an
    // absolute forward clip time so the light-noise overlay plays along its own
    // timeline instead of the reverse-video default.
    const clipT = retimedClipTime(evalLayer);
    const src = evalLayer.forceSourceA ? imageA : getSourceImage(layer.source, imageA, imageB, clipT);
    if (src) {
      // Framing camera (factory 3): the standalone Transition A/B drop-zone tiles
      // live in the same off-canvas world space as the replicator wall, so route
      // them through the same look-at camera (computeFraming pose). Generic — only
      // active when the scene resolves a Framing pose (ctx.framed).
      let worldTransform = evalLayer.worldTransform;
      if (FRAMING_VIEW_ENABLED && ctx?.framed && output.height && layer.type === 'image' && layer.dropZone) {
        const fcam = framedCameraBasis(ctx.framed, output.height);
        const wtp = new Float64Array(worldTransform);
        const pr = projectFramed(wtp[12], wtp[13], wtp[14], fcam);
        if (pr) {
          wtp[0] *= pr.ps; wtp[1] *= pr.ps; wtp[4] *= pr.ps; wtp[5] *= pr.ps;
          wtp[12] = pr.sx; wtp[13] = pr.sy; wtp[14] = 0;
          worldTransform = wtp;
        }
      }
      // An Image Mask clips ONLY this layer by a rig-selected wipe shape (e.g.
      // Wipes/Mask masks Transition B over an unmasked Transition A). Render to a
      // temp buffer, multiply alpha by the rasterized mask, then composite.
      const maskAlpha = layer.imageMaskSourceId !== undefined
        ? resolveImageMaskAlpha(layer.imageMaskSourceId, output.width, output.height, layer.imageMaskInvert)
        : null;
      if (maskAlpha) {
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, src, worldTransform, 1.0, effCrop, 'normal', blitDstBBox(temp, src, worldTransform, effCrop));
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id));
        }
        applyMask(filtered, maskAlpha);
        blitDirect(output, filtered, opacity, layer.blendMode);
      } else if (layer.filters.length > 0) {
        // Render to temp buffer, apply filters, then composite onto output
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, src, worldTransform, 1.0, effCrop); // full opacity to temp
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
        blitTransformed(output, src, worldTransform, opacity, effCrop, layer.blendMode, blitDstBBox(output, src, worldTransform, effCrop));
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

    // Draw-order convention. The default renders children in REVERSE list order
    // (last-listed rendered first = bottom, first-listed last = top), which the
    // 3D-hinge groups (Rotate/Reflection/Flip) rely on — there depth, not draw
    // order, resolves z. But a FLAT 2D stack of coplanar full-frame images/clones
    // (Movements/Switch: Clone B + Transition A + Transition B, all Z-rotation
    // only, no camera-facing 3D tilt) is composited by Motion in DECLARED order
    // with the LAST-listed layer on TOP. Rendering such a group forward (so the
    // last child blits last = on top) reproduces the switch's z-order: early both
    // drop zones show with B (last) on top; after B times out its Clone (first,
    // bottom) sits under Transition A, so A comes to the front — the "switch".
    const flatStack = isFlatCoplanarStack(visibleChildren);
    const order = (idx: number): EvaluatedLayer =>
      flatStack ? visibleChildren[idx] : visibleChildren[visibleChildren.length - 1 - idx];

    if (hasFilters || hasMasks || hasBlend) {
      // Render visible children to a temp buffer
      const groupBuffer = createBuffer(output.width, output.height);
      for (let i = 0; i < visibleChildren.length; i++) {
        renderLayer(groupBuffer, order(i), imageA, imageB, time, filterOverrides);
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
      for (let i = 0; i < visibleChildren.length; i++) {
        renderLayer(output, order(i), imageA, imageB, time, filterOverrides);
      }
    }
  }
}

// ============================================================================
// Main composite entry point
// ============================================================================

/**
 * Detect Movements/Drop In and compute its card-conform geometry.
 *
 * Drop In's signature (distinct from Push, which fills the frame): the scene is
 * authored SMALLER than the output (1280×720 → 1920×1080 upscale), it has two
 * Transition A/B drop-zone image nodes, and the incoming (Transition B) node
 * carries a multi-keyframe Position-Y BOUNCE curve that starts ≈ one scene-height
 * below (value ≈ scene height, so B enters from off-screen bottom) and settles to
 * 0 with decaying overshoot. Push has no such per-panel bounce and its scene ==
 * output. Divide/other upscaled templates have no Transition-B position bounce.
 *
 * The card geometry: the drop-zone media is 600px tall (its Fixed Height, a square
 * 600×600 media box). Motion conforms the source to that media box's HEIGHT and
 * pins it to the scene's top-left, then the whole scene scales to output. So the
 * card height in output = (mediaFixedHeight / sceneH) × outputH, and the width
 * follows the source's aspect. Validated: mediaH=600, sceneH=720, outputH=1080 →
 * cardH = 900 (GT measures 902); cardW = cardH × srcAspect (GT measures 1588).
 */
function detectDropInCard(
  scene: EvaluatedScene,
  imageA: ImageData,
  imageB: ImageData,
  outputW: number,
  outputH: number
): DropInCard | undefined {
  // Only the upscale case (scene authored smaller than output).
  if (!(scene.width < outputW && scene.height < outputH)) return undefined;

  // Find the two Transition A/B drop-zone image nodes and B's Position-Y bounce.
  let aId: number | undefined, bId: number | undefined;
  let bBounce: import('../types.js').Curve | undefined;
  for (const l of scene.layerById.values()) {
    if (l.type !== 'image' || !l.source) continue;
    if (l.source.type === 'transitionA' && l.dropZone) aId = l.id;
    if (l.source.type === 'transitionB' && l.dropZone) {
      bId = l.id;
      const py = l.transform?.positionY;
      if (py && typeof py === 'object' && py.keyframes && py.keyframes.length >= 4) bBounce = py;
    }
  }
  if (aId === undefined || bId === undefined || !bBounce) return undefined;

  // The bounce must ENTER from ~one scene-height below (off-screen bottom) and
  // settle near 0 — the "drop in" signature. First keyframe ≈ +sceneH, last ≈ 0.
  const first = bBounce.keyframes[0].value;
  const last = bBounce.keyframes[bBounce.keyframes.length - 1].value;
  if (!(first > scene.height * 0.6 && Math.abs(last) < scene.height * 0.2)) return undefined;

  // The drop-zone media box height governs the card conform. It lives on the
  // referenced <clip> (Fixed Height, id 115), captured at parse time. If
  // unavailable, fall back to the observed default (600 in a 720 scene = 5/6 of
  // scene height — the media/scene ratio Motion authors for this template).
  const mediaFixedH = scene.dropZoneMediaHeight ?? Math.round(scene.height * (5 / 6));
  const posScale = outputH / scene.height;
  const cardH = Math.round((mediaFixedH / scene.height) * outputH);
  const srcAspect = imageB.width / imageB.height;
  const cardW = Math.round(cardH * srcAspect);
  return { cardW, cardH, posScale, aId, bId };
}

/**
 * Blit a source image conformed into a top-left CARD (Drop In). The source is
 * scaled to cardW×cardH and pinned to the output's top-left (0,0), then shifted
 * DOWN by `yOffset` output-pixels (the bounce). Pixels outside the card are left
 * untouched (source-over onto whatever is already there — black background, or the
 * static A card beneath a bouncing B). Bilinear sampled.
 */
function blitDropInCard(
  dst: ImageData,
  src: ImageData,
  cardW: number,
  cardH: number,
  yOffset: number,
  opacity: number
): void {
  const OW = dst.width, OH = dst.height;
  const sw = src.width, sh = src.height;
  const y0 = Math.max(0, Math.floor(yOffset));
  const y1 = Math.min(OH, Math.ceil(cardH + yOffset));
  const ddata = dst.data, sdata = src.data;
  for (let dy = y0; dy < y1; dy++) {
    const cy = dy - yOffset;               // card-local y
    if (cy < 0 || cy >= cardH) continue;
    const syf = cy * sh / cardH;
    const sy0 = Math.min(sh - 1, Math.floor(syf));
    const sy1 = Math.min(sh - 1, sy0 + 1);
    const fy = syf - sy0;
    for (let dx = 0; dx < cardW; dx++) {
      const sxf = dx * sw / cardW;
      const sx0 = Math.min(sw - 1, Math.floor(sxf));
      const sx1 = Math.min(sw - 1, sx0 + 1);
      const fx = sxf - sx0;
      const i00 = (sy0 * sw + sx0) * 4, i10 = (sy0 * sw + sx1) * 4;
      const i01 = (sy1 * sw + sx0) * 4, i11 = (sy1 * sw + sx1) * 4;
      const gx = 1 - fx, gy = 1 - fy;
      const w00 = gx * gy, w10 = fx * gy, w01 = gx * fy, w11 = fx * fy;
      const r = sdata[i00] * w00 + sdata[i10] * w10 + sdata[i01] * w01 + sdata[i11] * w11;
      const g = sdata[i00 + 1] * w00 + sdata[i10 + 1] * w10 + sdata[i01 + 1] * w01 + sdata[i11 + 1] * w11;
      const b = sdata[i00 + 2] * w00 + sdata[i10 + 2] * w10 + sdata[i01 + 2] * w01 + sdata[i11 + 2] * w11;
      const a = (sdata[i00 + 3] * w00 + sdata[i10 + 3] * w10 + sdata[i01 + 3] * w01 + sdata[i11 + 3] * w11) / 255 * opacity;
      if (a <= 0) continue;
      const di = (dy * OW + dx) * 4;
      const ia = 1 - a;
      ddata[di] = r * a + ddata[di] * ia;
      ddata[di + 1] = g * a + ddata[di + 1] * ia;
      ddata[di + 2] = b * a + ddata[di + 2] * ia;
      ddata[di + 3] = Math.min(255, a * 255 + ddata[di + 3] * ia);
    }
  }
}

export function composite(
  scene: EvaluatedScene,  // includes scene.time
  imageA: ImageData,
  imageB: ImageData,
  width: number,
  height: number,
  mediaResolver?: (url: string, timeSec?: number, absolute?: boolean) => ImageData | null
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
    cameraPosZ: scene.camera?.worldTransform ? scene.camera.worldTransform[14] : undefined,
    framed: scene.camera?.framed,
    imageMaskSourceIds: collectImageMaskSourceIds(scene.evalLayerById),
    mediaResolver,
    mediaCache: new Map<string, ImageData | null>(),
    animationEndSec: scene.animationEndSec || 1,
    time: scene.time,
    mediaTime: scene.unwrappedTime ?? scene.time,
  };

  // Particle-emitter field proxy (Stylized/Nature: Diagonal, Glide) — detect once.
  // See applyParticleFieldProxy for rationale. Detecting the field texture up front
  // lets renderLayer SKIP that texture's dim normal render (the proxy owns it),
  // avoiding a double-composite that washed the early frames too gray.
  const field = detectFieldTexture(scene, mediaResolver);
  if (field) ctx.fieldTextureLayerId = field.layerId;

  // Movements/Drop In card conform: detect once. When present, renderLayer draws
  // the Transition A/B drop zones as top-left cards (A static, B bouncing behind)
  // instead of the default full-frame blit.
  ctx.dropInCard = detectDropInCard(scene, imageA, imageB, width, height);

  // Draw the Drop In cards up front (B behind, A in front) so their z-order and
  // tail-frame behavior are independent of child render order / per-layer
  // visibility. The particle emitters then render on top via the normal loop.
  if (ctx.dropInCard) {
    const c = ctx.dropInCard;
    const bEval = scene.evalLayerById.get(c.bId);
    const aEval = scene.evalLayerById.get(c.aId);
    // B (behind): riding its Position-Y bounce, only while its lifetime is live.
    // (Verified: A-on-top scores higher than B-on-top — the settled tail shows the
    // sepia A card with B fully occluded behind it.)
    if (bEval && bEval.visible && bEval.opacity > 0) {
      const bSrc = getSourceImage(bEval.layer.source, imageA, imageB);
      if (bSrc) blitDropInCard(output, bSrc, c.cardW, c.cardH, bEval.worldTransform[13] * c.posScale, bEval.opacity);
    }
    // A (in front): static at the top-left.
    if (aEval && aEval.visible && aEval.opacity > 0) {
      const aSrc = getSourceImage(aEval.layer.source, imageA, imageB);
      if (aSrc) blitDropInCard(output, aSrc, c.cardW, c.cardH, 0, aEval.opacity);
    }
  }

  // Render layers back-to-front (Motion: first in list = top/foreground, last = bottom/background)
  for (let i = scene.layers.length - 1; i >= 0; i--) {
    renderLayer(output, scene.layers[i], imageA, imageB, scene.time, scene.filterOverrides);
  }

  // Composite the field-texture proxy over the rendered frame (no-op if not detected).
  if (field) applyParticleFieldProxy(output, scene, field);

  ctx = null;
  return output;
}

/**
 * Smoothstep 0→1 (Hermite) — 0 for x≤0, 1 for x≥1, smooth in between.
 */
function smoothstep01(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

/** Detected particle-field texture + its envelope window (progress space). */
interface FieldTexture { img: ImageData; layerId: number; pin: number; pout: number; }

/**
 * Detect the full-frame bundled texture that stands in for a Stylized/Nature
 * Emitter transition's aggregate particle field. Returns null unless the scene
 * has a particle Emitter (factoryID 23), a resolvable frame-filling texture image,
 * and a mediaResolver. The envelope window is that texture layer's own parsed
 * timing (in→out) in progress space.
 */
function detectFieldTexture(
  scene: EvaluatedScene,
  mediaResolver?: (url: string) => ImageData | null
): FieldTexture | null {
  if (!mediaResolver) return null;

  // 1. Require a particle Emitter (factoryID 23) somewhere in the scene.
  let hasEmitter = false;
  for (const l of scene.layerById.values()) { if (l.isParticleEmitter) { hasEmitter = true; break; } }
  if (!hasEmitter) return null;

  // 2. Find the largest resolvable full-frame texture image layer + its timing.
  const end = scene.animationEndSec || 1;
  let texImg: ImageData | null = null;
  let texArea = 0, texId = -1;
  let winIn = 0, winOut = end;
  const t2s = (rt: RationalTime): number => (rt.timescale > 0 ? rt.value / rt.timescale : 0);
  const scanTex = (l: Layer): void => {
    if (l.type === 'image' && l.source && l.source.type === 'media') {
      const img = mediaResolver(l.source.url);
      if (img) {
        const area = img.width * img.height;
        if (area > texArea && img.width >= scene.width * 0.5 && img.height >= scene.height * 0.5) {
          texImg = img; texArea = area; texId = l.id;
          if (l.timing) { winIn = t2s(l.timing.in); winOut = t2s(l.timing.out); }
        }
      }
    }
    for (const c of l.children) scanTex(c);
  };
  for (const l of scene.layerById.values()) scanTex(l);
  if (!texImg) return null;

  const pin = Math.max(0, winIn / end);
  const pout = Math.min(1, winOut / end);
  if (pout <= pin) return null;
  return { img: texImg, layerId: texId, pin, pout };
}

/**
 * Composite the bundled gray texture over the frame as a proxy for the aggregate
 * particle field of Stylized/Nature Emitter transitions. Motion spawns a dense
 * field of gray hexagon/bokeh particles over a bundled gray "paper" texture,
 * blending toward a near-uniform gray backdrop that hides the source photo through
 * the middle of the transition. The pure-JS engine does not run Motion's seeded
 * particle simulation, so this reconstructs the gray backdrop the field aggregates
 * to, using the texture's own visibility window and a symmetric smoothstep bell
 * (ramp = 35% of the window each side). Uses the UN-wrapped scene time so the
 * envelope follows the true transition progress even after the drop zones
 * retime-wrap back to source A.
 */
function applyParticleFieldProxy(output: ImageData, scene: EvaluatedScene, field: FieldTexture): void {
  const end = scene.animationEndSec || 1;
  const { img: tex, pin, pout } = field;
  const fieldTime = scene.unwrappedTime ?? scene.time;
  const progress = Math.min(1, Math.max(0, fieldTime / end));
  if (progress <= pin || progress >= pout) return;
  const win = pout - pin;
  const ramp = Math.max(1e-3, 0.35 * win);
  const up = smoothstep01((progress - pin) / ramp);
  const dn = smoothstep01((pout - progress) / ramp);
  const o = Math.min(up, dn);
  if (o <= 0) return;

  const ow = output.width, oh = output.height;
  const tw = tex.width, th = tex.height;
  const sameSize = tw === ow && th === oh;
  for (let y = 0; y < oh; y++) {
    const sy = sameSize ? y : Math.min(th - 1, (y * th / oh) | 0);
    for (let x = 0; x < ow; x++) {
      const sx = sameSize ? x : Math.min(tw - 1, (x * tw / ow) | 0);
      const di = (y * ow + x) * 4;
      const si = (sy * tw + sx) * 4;
      output.data[di]   = output.data[di]   * (1 - o) + tex.data[si]   * o;
      output.data[di+1] = output.data[di+1] * (1 - o) + tex.data[si+1] * o;
      output.data[di+2] = output.data[di+2] * (1 - o) + tex.data[si+2] * o;
    }
  }
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
  // Colorize — Motion's is a black/white luminance remap, NOT a hue tint. Each
  // pixel's luminance is mapped through a gradient from "Remap Black To" (at lum 0)
  // to "Remap White To" (at lum 1). Used by Slide's tiles to recolor grayscale
  // tile PNGs. The two endpoints are RGB color params (children Red/Green/Blue),
  // and may be rig-driven (a Color widget selecting an accent) — honor overrides.
  // (Migrated to the UUID registry — see compositor/filters/channel-mixer.ts.)
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
