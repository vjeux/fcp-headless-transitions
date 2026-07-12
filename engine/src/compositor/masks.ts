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
import { renderGaussianGradient } from './filters/gradient.js';
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

/** Gather every object ID referenced by some layer's Image Mask `Mask Source`. */
export function collectImageMaskSourceIds(evalLayerById: Map<number, EvaluatedLayer>): Set<number> {
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
  // Video/image media mask source (e.g. Objects/Veil's "Veil - Wipe Matte" mov):
  // the layer is a media clip (often disabled — it exists only to supply matte
  // luma). Its LUMA drives the reveal. Rasterize the media (via the time-aware
  // resolver), fit it to the frame the same way a full-frame drop zone conforms,
  // and use luma (0..255) as the mask alpha.
  if (src.layer.type === 'image' && src.layer.source) {
    const mediaImg = getSourceImage(rctx, src.layer.source, rctx.imageA, rctx.imageB);
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
  const findShapeLayer = (id: number): EvaluatedLayer | undefined => rctx.evalLayerById.get(id);
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
  const t = rctx.time ?? 0;
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
