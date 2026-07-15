/**
 * Compositor — source-image resolution + mask-alpha rasterization.
 *
 * The acyclic helper layer BELOW renderLayer: it resolves a layer's source pixels
 * (getSourceImage, resolveCloneImage), rasterizes shape/replicator/image-mask alpha
 * mattes (shapeMaskCell, revealThroughMask, replicatorMaskAlpha, resolveImageMaskAlpha),
 * and classifies mask groups (isMaskGroup, collectMaskShapes, collectImageMaskSourceIds,
 * findVisibleDrawable/Shape). None of these call back into renderLayer/composite, so
 * they form a clean lower layer. Split out of compositor/index.ts (ROADMAP item 7).
 */
import type { ImageSource } from '../types.js';
import type { EvaluatedLayer } from '../evaluator/index.js';
import type { RenderContext } from './context.js';
import { evaluateCurve } from '../evaluator/curves.js';
import { rasterizeShape, unionMasks } from './shapes.js';
import { luma601 } from './blend.js';
import { generateInstances, sequenceProgress, sequenceOrder } from './replicator.js';
import { renderGaussianGradient, renderLensFlare } from './filters/gradient.js';
import { mat4Mul, instanceLocalMatrix, createBuffer } from './blit.js';
import { lookupFilter, makeContext } from './filters/registry.js';

/**
 * Apply a mask-source group's OWN filters to a resolved alpha matte.
 *
 * A mask-source group (the layer an Image Mask points at) can carry image filters
 * that reshape the matte before it clips the masked layer. The clearest case is
 * Dissolves/Divide's "B Masks" group, which stacks three MinMax (PAEMinMax, Mode=1 =
 * Maximum = morphological DILATE, Radius curves ramping 0→32/194/29) over a union of
 * animated Rectangle Masks. The raw rectangle union only reaches ~75% frame coverage
 * at the end of the transition; the MinMax dilation is what GROWS the divide-pieces
 * out to fully tile the frame so image B fills it (GUI f23 = full B). Without applying
 * these filters the reveal stalls at the raw-rectangle 75% and 25% renders as black
 * divide-gap voids.
 *
 * The matte is a single-channel alpha; filters operate on RGBA ImageData, so we wrap
 * the alpha into all four channels (a grey image whose value == the matte), run the
 * group's registered filters in order, and read the alpha channel back. This is the
 * same UUID-dispatch path renderLayer uses (lookupFilter + makeContext) — no filter
 * is special-cased and any morphology/blur filter on a mask group is honored.
 */
function applyMaskGroupFilters(
  alpha: Uint8Array, W: number, H: number, group: EvaluatedLayer, time: number,
): Uint8Array {
  const filters = group.layer.filters;
  if (!filters || filters.length === 0) return alpha;
  // Wrap alpha → RGBA (value replicated across RGB + A) so channel filters see it.
  let img = new (globalThis as any).ImageData(new Uint8ClampedArray(W * H * 4), W, H) as ImageData;
  for (let i = 0; i < alpha.length; i++) {
    const v = alpha[i], o = i * 4;
    img.data[o] = v; img.data[o + 1] = v; img.data[o + 2] = v; img.data[o + 3] = v;
  }
  for (const filter of filters) {
    if ((filter as any).enabled === false) continue;
    const mod = lookupFilter(filter);
    if (!mod) continue;
    const ctx = makeContext(filter, time, W, H);
    img = mod.apply(img, ctx);
  }
  // Read the alpha channel back (MinMax and other morphology treat all channels
  // identically, so RGB and A agree; alpha is the canonical matte channel).
  const out = new Uint8Array(W * H);
  for (let i = 0; i < out.length; i++) out[i] = img.data[i * 4 + 3];
  return out;
}

/**
 * Resolve the source image a Clone Layer mirrors. Follows cloneSourceId to the
 * referenced Layer; if that layer is itself a clone/image of Transition A or B,
 * resolves transitively to the underlying source pixels.
 */
export function resolveCloneImage(rctx: RenderContext, cloneSourceId: number | undefined, depth = 0): ImageData | null {
  if (cloneSourceId === undefined || depth > 8) return null;
  const src = rctx.layerById.get(cloneSourceId);
  if (!src) return null;
  if (src.source?.type === 'transitionA') return rctx.imageA;
  if (src.source?.type === 'transitionB') return rctx.imageB;
  if (src.type === 'clone') return resolveCloneImage(rctx, src.cloneSourceId, depth + 1);
  if (src.source) return getSourceImage(rctx, src.source, rctx.imageA, rctx.imageB);
  return null;
}

/**
 * Rasterize a shape into a full-frame single-channel-in-alpha RGBA buffer,
 * centered at the origin (white fill, shape alpha). Used as a per-instance
 * window mask. The evaluated shape's transform is used with translation stripped.
 */
export function shapeMaskCell(shape: import('../types.js').Shape, evalSrc: EvaluatedLayer | undefined, W: number, H: number): ImageData {
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
export function revealThroughMask(
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
export function findVisibleDrawable(el: EvaluatedLayer): EvaluatedLayer | null {
  const t = el.layer.type;
  if ((t === 'shape' || t === 'image' || t === 'generator') && el.visible) return el;
  for (const c of el.children) {
    const r = findVisibleDrawable(c);
    if (r) return r;
  }
  return null;
}

export function getSourceImage(rctx: RenderContext, source: ImageSource | undefined, imageA: ImageData, imageB: ImageData, clipTimeOverride?: number): ImageData | null {
  if (!source) return null;
  switch (source.type) {
    case 'transitionA': return imageA;
    case 'transitionB': return imageB;
    case 'media': {
      if (!rctx.mediaResolver) return null;
      const absolute = clipTimeOverride !== undefined;
      const t = absolute ? clipTimeOverride! : rctx.mediaTime;
      const key = `${source.url}@${t.toFixed(4)}${absolute ? '#abs' : ''}`;
      const cache = rctx.mediaCache;
      if (cache.has(key)) return cache.get(key)!;
      const img = rctx.mediaResolver(source.url, t, absolute);
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
    case 'lensFlare':
      // The flare envelope + sweep follow the LINEAR transition progress, so use
      // the UN-wrapped scene time (mediaTime) — the retime-wrap that remaps
      // `rctx.time` for the drop zones must not warp the flare's own animation.
      if (typeof process !== 'undefined' && process.env?.FCT_FLARE_DEBUG) {
        // eslint-disable-next-line no-console
        console.error(`[flare] time=${rctx.time} media=${rctx.mediaTime} endSec=${rctx.animationEndSec} canvas=${source.flare.width}x${source.flare.height} out=${imageA.width}x${imageA.height}`);
      }
      // Render the flare AT THE OUTPUT FRAME SIZE (not the generator's authored
      // 1920×1080 canvas). The generator canvas is larger than the render frame
      // (1854×1042 here), and the layer's world transform maps canvas→frame, which
      // shifts a canvas-sized buffer into a sub-rect. The flare is inherently
      // full-frame (it floods the whole scene in the GUI GT), so we rasterize it
      // directly into frame space; the (near-identity) transform then places it 1:1.
      return renderLensFlare(source.flare, rctx.mediaTime ?? rctx.time ?? 0, rctx.animationEndSec || 1, imageA.width, imageA.height);
    default: return null;
  }
}

/**
 * True if `child` is a group layer whose descendant shapes are ALL masks (and it
 * contains at least one mask shape). Such a group exists only to hold masks —
 * its masks should clip the sibling content layers, not render on their own.
 */
export function isMaskGroup(rctx: RenderContext, child: EvaluatedLayer): boolean {
  if (child.layer.type !== 'group') return false;
  if (child.layer.children.length === 0) return false;
  // A group referenced by an Image Mask `Mask Source` is a hidden geometry
  // provider for that layer's own mask — it must NOT be lifted to clip its
  // enclosing group (that would clip both Transition A and B, leaving a strip).
  if (rctx.imageMaskSourceIds.has(child.layer.id)) return false;
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
export function collectMaskShapes(group: EvaluatedLayer, out: EvaluatedLayer[]): void {
  for (const c of group.children) {
    if (c.layer.type === 'shape' && c.layer.shape?.isMask) out.push(c);
    else if (c.layer.type === 'group') collectMaskShapes(c, out);
  }
}

/**
 * True when a GROUP-LEVEL Image Mask's resolved Mask Source is SHAPE geometry the
 * group-mask compositor can rasterize through its own world transform (so it
 * swings/foreshortens WITH the group): a shape, a clone (chained to a shape), a
 * replicator of shape cells, or a group whose descendants are shapes/clones and
 * carry NO image-media layer.
 *
 * NOT eligible when the source is an image-MEDIA layer: its reveal matte is
 * rasterized FLAT full-frame by resolveImageMaskAlpha (ignoring the source's own 3D
 * transform), so masking a group to it mis-registers (Pinwheel's `square_fix`
 * regressed −3.46). Those stay on the pre-existing render path.
 */
export function maskSourceIsShapeGeometry(src: EvaluatedLayer): boolean {
  const t = src.layer.type;
  if (t === 'shape') return !!src.layer.shape;
  if (t === 'clone') return src.layer.cloneSourceId !== undefined;
  if (t === 'replicator') return !!src.layer.replicator;
  if (t === 'image') return false; // flat-conformed media matte — not group-eligible
  if (t === 'group') {
    // Eligible iff SOME descendant is shape/clone/replicator geometry AND NONE is an
    // image-media layer that would be rasterized flat (Center's "Shapes for image
    // mask" group qualifies; a group holding a media matte does not).
    let hasGeom = false;
    const walk = (el: EvaluatedLayer): boolean => {
      const et = el.layer.type;
      if (et === 'image') return false;
      if (et === 'shape' && el.layer.shape) hasGeom = true;
      else if (et === 'clone' && el.layer.cloneSourceId !== undefined) hasGeom = true;
      else if (et === 'replicator' && el.layer.replicator) hasGeom = true;
      for (const c of el.children) if (!walk(c)) return false;
      return true;
    };
    if (!walk(src)) return false;
    return hasGeom;
  }
  return false;
}

/**
 * True when `id` is `root` itself or one of its evaluated descendants — i.e. the
 * Image Mask's Mask Source lives INSIDE the masked group (in-group clip geometry
 * that moves with the group). Cross-container mask sources (Combo_Spin's separate
 * `Shape Masks` layer, Close_and_Open's `Mask shapes` layer) are NOT descendants
 * and must not take the group-mask path.
 */
export function evalSubtreeContains(root: EvaluatedLayer, id: number): boolean {
  if (root.layer.id === id) return true;
  for (const c of root.children) if (evalSubtreeContains(c, id)) return true;
  return false;
}

/**
 * Gather every object ID referenced by some layer's Image Mask `Mask Source` that
 * will ACTUALLY be consumed as a mask (so the renderer suppresses the source's own
 * direct draw — hidden geometry, not visible content).
 *
 * A LEAF-drawable owner (image/shape/clone/replicator) always consumes its source
 * (renderDrawableLayer). A GROUP owner consumes its source ONLY when the group-mask
 * apply gate passes (source is a DESCENDANT resolving to SHAPE geometry — mirrors
 * renderChildLayers). Groups that DON'T take the group-apply path (Combo_Spin/
 * Close_and_Open — cross-container source; Pinwheel — image source) must NOT
 * suppress their source, or the source is wrongly hidden and the slug regresses
 * (Close_and_Open −0.36).
 */
export function collectImageMaskSourceIds(evalLayerById: Map<number, EvaluatedLayer>): Set<number> {
  const ids = new Set<number>();
  for (const el of evalLayerById.values()) {
    const srcId = el.layer.imageMaskSourceId;
    if (srcId === undefined) continue;
    if (el.layer.type === 'group') {
      const src = evalLayerById.get(srcId);
      const applied = src !== undefined
        && maskSourceIsShapeGeometry(src)
        && evalSubtreeContains(el, srcId);
      if (!applied) continue;
    }
    ids.add(srcId);
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
function replicatorMaskAlpha(rctx: RenderContext, replEval: EvaluatedLayer, W: number, H: number): Uint8Array | null {
  const layer = replEval.layer;
  if (!layer.replicator || layer.cellSourceId === undefined) return null;

  // Resolve the cell's shape geometry (the dot). The cell source is usually a
  // Group whose Rig selects one visible shape child (Circle); fall back to the
  // node itself if it is directly a shape.
  const cellEval = rctx.evalLayerById.get(layer.cellSourceId);
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
  const globalProgress = seq ? (rctx.time ?? 0) / (rctx.animationEndSec || 1) : 0;

  // Base per-instance transform: the CELL SHAPE's evaluated basis (its authored
  // dot size/rotation), with translation supplied per-instance below. The dot's
  // size comes from the shape's own world scale (matches shapeMaskCell); the grid
  // placement comes from the replicator group translation + the instance offset.
  const base = shapeLayer.worldTransform;
  const rx = replEval.worldTransform[12];
  const ry = replEval.worldTransform[13];
  // Uniform cell-SIZE multiplier (Replicator Cell "Scale" id=116). For a grid
  // replicator this scales the tiled shape up so its extent == the grid spacing
  // and the tiles tessellate seamlessly (Squares: shape extent 122.4 × cellScale
  // 1.13 = 138.3 == grid spacing 1800/13 = 138.5). Without it, tiles rasterize at
  // their bare extent and leave orange seams between them.
  const cellScale = layer.replicator.cellScale ?? 1;

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
    const totalScale = instScale * cellScale;
    const m = new Float64Array(base);
    if (totalScale !== 1) {
      m[0] *= totalScale; m[1] *= totalScale;
      m[4] *= totalScale; m[5] *= totalScale;
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
export function resolveImageMaskAlpha(rctx: RenderContext, sourceId: number, W: number, H: number, invert = false): Uint8Array | null {
  const src = rctx.evalLayerById.get(sourceId);
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
    const alpha = replicatorMaskAlpha(rctx, src, W, H);
    if (alpha) return applyInvert(alpha);
    return null;
  }
  // Video/image media mask source (e.g. Objects/Veil's "Veil - Wipe Matte" mov;
  // Stylized/Loop + Heart's "shape.png" teardrop matte): the layer is a media clip
  // (usually DISABLED — it exists only to supply the matte) whose rendered RGBA is
  // the reveal shape. Motion derives the matte from the source's COVERAGE:
  //   • A matte authored as an OPAQUE luma ramp (Veil's wipe .mov: alpha=255
  //     everywhere, the shape is in the black↔white luma) → use LUMA.
  //   • A matte authored as a SHAPE-BY-ALPHA cutout (Loop/Heart's shape.png: a
  //     black teardrop at alpha=255 on a fully TRANSPARENT alpha=0 field; its luma
  //     is 0 INSIDE the shape and 255 outside) → use ALPHA. Using luma×alpha here
  //     (the old code) gave 0 EVERYWHERE (inside: luma0×a1=0; outside: luma255×a0=0)
  //     so Transition B was never revealed and Loop/Heart rendered a static
  //     Transition A for the whole transition.
  // Decide the channel ONCE from the source's alpha: if the matte carries real
  // transparency (a meaningful fraction of near-zero alpha) the shape lives in the
  // ALPHA channel; otherwise it is an opaque luma matte. Structural (channel stats),
  // never per-transition.
  if (src.layer.type === 'image' && src.layer.source) {
    const mediaImg = getSourceImage(rctx, src.layer.source, rctx.imageA, rctx.imageB);
    if (mediaImg) {
      const alpha = new Uint8Array(W * H);
      const mw = mediaImg.width, mh = mediaImg.height;
      const md = mediaImg.data;
      // One-time channel decision: sample the alpha channel on a coarse grid. If a
      // meaningful fraction of pixels are (near-)transparent, the matte is defined
      // by ALPHA (a shape cutout); else it's an opaque LUMA matte.
      let transparentCount = 0, sampled = 0;
      const stepY = Math.max(1, Math.floor(mh / 64)), stepX = Math.max(1, Math.floor(mw / 64));
      for (let y = 0; y < mh; y += stepY) {
        for (let x = 0; x < mw; x += stepX) {
          if (md[(y * mw + x) * 4 + 3] < 16) transparentCount++;
          sampled++;
        }
      }
      const useAlpha = sampled > 0 && transparentCount / sampled > 0.02;
      // Full-frame matte: sample the media conformed to the output frame.
      for (let y = 0; y < H; y++) {
        const sy = Math.min(mh - 1, Math.floor(y * mh / H));
        for (let x = 0; x < W; x++) {
          const sx = Math.min(mw - 1, Math.floor(x * mw / W));
          const si = (sy * mw + sx) * 4;
          if (useAlpha) {
            // Shape-by-alpha matte: the alpha channel IS the reveal coverage.
            alpha[y * W + x] = md[si + 3];
          } else {
            // Opaque luma matte: Rec.601 luma × the matte's own alpha (≈1 here).
            const l = luma601(md[si], md[si + 1], md[si + 2]);
            alpha[y * W + x] = Math.round(l * (md[si + 3] / 255));
          }
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
  const findShapeLayer = (id: number): EvaluatedLayer | undefined => rctx.evalLayerById.get(id);
  // A DISABLED (<enabled>0</enabled>) shape used as Image Mask geometry is the
  // standard Motion pattern: the mask-geometry shape is switched OFF so it never
  // draws directly — it exists ONLY to supply the reveal matte (Stylized/Loop,
  // Heart: the "shape" mask source is disabled, so `el.visible` is false and the
  // whole reveal was silently EMPTY → Transition B never composited in and the
  // engine rendered a static Transition A for the entire transition). A disabled
  // mask source still contributes its geometry, so admit it as long as it's within
  // its own timing window (a timed-out disabled shape must NOT leak in). Its
  // render opacity/enabled flag is irrelevant to its use AS a mask — exactly like
  // the mask-source GROUP whose own opacity is already ignored above. Non-disabled
  // shapes keep the strict `el.visible` gate (the rig snapshot selects the active
  // variant via the group-opacity early-return + per-shape visibility).
  const t = rctx.time ?? 0;
  const withinTimingWindow = (el: EvaluatedLayer): boolean => {
    const tm = el.layer.timing;
    if (!tm) return true;
    const inn = tm.in && tm.in.timescale > 0 ? tm.in.value / tm.in.timescale : -Infinity;
    const out = tm.out && tm.out.timescale > 0 ? tm.out.value / tm.out.timescale : Infinity;
    return t >= inn && t <= out;
  };
  const eligibleMaskGeom = (el: EvaluatedLayer): boolean =>
    el.visible || (el.layer.enabled === false && withinTimingWindow(el));
  const walk = (el: EvaluatedLayer, isRoot: boolean): void => {
    if (!isRoot && el.layer.type === 'group' && el.opacity <= 0) return;
    if (el.layer.type === 'shape' && el.layer.shape && eligibleMaskGeom(el)) {
      entries.push({ shape: el.layer.shape, xform: el.worldTransform });
    } else if (el.layer.type === 'clone' && eligibleMaskGeom(el) && el.layer.cloneSourceId !== undefined) {
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
      return rasterizeShape(e.shape, W, H, e.xform, rctx.cameraZ, rctx.cameraPosZ, { firstOffset, lastOffset });
    }
    return rasterizeShape(e.shape, W, H, e.xform);
  });
  const merged = masks.length === 1 ? masks[0] : unionMasks(masks, W, H);
  // Apply the mask-source group's own image filters (e.g. Dissolves/Divide's
  // "B Masks" MinMax dilation) to the rasterized matte before it clips the layer.
  const filtered = applyMaskGroupFilters(merged, W, H, src, t);
  return applyInvert(filtered);
}
