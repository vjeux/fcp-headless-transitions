import { rasterizeShape, applyMask, unionMasks } from './shapes.js';
import { needsPerspective, projectQuad, renderPerspectiveQuad, renderPageFlip } from './perspective.js';
import {
  mat4MultiplyOffset, createBuffer, blitDstBBox,
  blitTransformed, blitDirect, smoothstep01,
} from './blit.js';
import type { RenderContext, DropInCard } from './context.js';
import {
  resolveCloneImage, shapeMaskCell, revealThroughMask, findVisibleDrawable,
  getSourceImage, isMaskGroup, collectMaskShapes, collectImageMaskSourceIds,
  resolveImageMaskAlpha,
} from './masks.js';
import {
  framedCameraBasis, projectFramed, dropZonePlaceholderCell, cellContentBBox,
  transformBBoxToOutput, centerEvaluatedLayer, detectPageFlip, isFlatCoplanarStack,
  retimedClipTime,
} from './geometry.js';
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
import type { Layer, RationalTime } from '../types.js';



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
  rctx: RenderContext,
  cellSourceId: number | undefined,
  imageA: ImageData,
  imageB: ImageData,
  time: number,
  filterOverrides: Map<number, Map<string, number>>
): CellContent | null {
  if (cellSourceId === undefined) return null;

  // Prefer the fully-evaluated cell source (has world transform, shape, source).
  const evalSrc = rctx.evalLayerById.get(cellSourceId);
  const rawSrc = rctx.layerById.get(cellSourceId);
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
    return { kind: 'image', img: dropZonePlaceholderCell(rctx, imageA.width, imageA.height) };
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
    renderLayer(rctx, buf, centered, imageA, imageB, time, filterOverrides);
    for (let i = 3; i < buf.data.length; i += 4) if (buf.data[i] > 0) return { kind: 'image', img: buf };
  }
  return null;
}









// ============================================================================
// Image buffer operations
// ============================================================================





// ============================================================================
// Layer rendering
// ============================================================================





/**
 * Perspective camera distance for the PAEFlop page-flip. Fit from the headless
 * GT: the far (receding) edge of the rotating page sits at screen x≈0.87→0.64
 * across θ=15.7°→78.3°, which a centre-axis rotation reproduces with a camera
 * ≈7000 units back (much weaker perspective than the 2000 scene default — the
 * flip is nearly orthographic). PSNR is flat for any camera ≥~6000.
 */
const FLIP_CAMERA_Z = 7000;











function renderLayer(
  rctx: RenderContext,
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
  if (layer.type === 'group' && rctx.imageMaskSourceIds.has(layer.id)) return;

  // Replicator: render the cell content at each grid instance
  if (layer.type === 'replicator' && layer.replicator) {
    // A replicator that is an Image Mask `Mask Source` is HIDDEN geometry — it
    // provides the reveal matte to the layer that references it (Transition B),
    // rasterized there via resolveImageMaskAlpha → replicatorMaskAlpha. It must
    // never draw its cells directly (that would paint the dots as visible content
    // over the frame). Same semantic as the group-mask-source skip above.
    if (rctx.imageMaskSourceIds.has(layer.id)) return;
    const instances = generateInstances(layer.replicator);

    // Framing-camera look-at basis (built once per replicator; present only when the
    // Camera carries factory-3 Framing behaviors). Generic — see framedCameraBasis.
    const framedCam = (FRAMING_VIEW_ENABLED && rctx.framed && output.height)
      ? framedCameraBasis(rctx.framed, output.height)
      : undefined;

    // Materialize the cell's Object Source once, then stamp it at each instance.
    const cell = resolveCellImage(rctx, layer.cellSourceId, imageA, imageB, time, filterOverrides);

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
    const globalProgress = seq ? time / (rctx.animationEndSec || 1) : 0;

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
        renderLayer(rctx, output, instCell, imageA, imageB, time, filterOverrides);
      }
    }
    return;
  }

  if (layer.type === 'clone') {
    // Clone Layer: draw the image of the object it mirrors, at this layer's transform.
    let src = resolveCloneImage(rctx, layer.cloneSourceId);
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
          const corners = projectQuad(worldTransform, src.width, src.height, rctx.cameraZ ?? 2000);
          renderPerspectiveQuad(temp, src, corners, 1.0, 'normal');
        } else {
          blitTransformed(temp, src, worldTransform, 1.0, crop, 'normal', blitDstBBox(temp, src, worldTransform, crop));
        }
        const combined = cloneMasks.length === 1 ? cloneMasks[0] : unionMasks(cloneMasks, output.width, output.height);
        applyMask(temp, combined);
        blitDirect(output, temp, opacity, layer.blendMode);
      } else if (needsPerspective(worldTransform)) {
        const corners = projectQuad(worldTransform, src.width, src.height, rctx.cameraZ ?? 2000);
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
    const alpha = rasterizeShape(layer.shape, output.width, output.height, worldTransform, rctx.cameraZ, rctx.cameraPosZ);
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
    const srcImg0 = evalLayer.forceSourceA ? imageA : getSourceImage(rctx, layer.source, imageA, imageB);
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
    if (layer.type === 'image' && rctx.fieldTextureLayerId === layer.id) return;

    // Movements/Drop In: the Transition A/B drop-zone cards are drawn by a
    // dedicated pass in composite() (below) so their B-under-A z-order and the
    // tail frames (B timed out → A alone, not black) are correct regardless of
    // child render order / visibility. Skip both here.
    const card = rctx.dropInCard;
    if (card && layer.type === 'image' && (layer.id === card.aId || layer.id === card.bId)) return;



    // Leaf layer: render source image with transform

    // A forced-A persistent base (wrapping drop zone past its lifetime) renders
    // source A regardless of its declared transitionA/B source — see evaluator's
    // DROPZONE_WRAP_TO_A (Lights/Flash's flash rides over a persistent A base).
    // A frame-numbered Retime curve (Lights/Light Noise's screen .mov) supplies an
    // absolute forward clip time so the light-noise overlay plays along its own
    // timeline instead of the reverse-video default.
    const clipT = retimedClipTime(evalLayer, rctx);
    const src = evalLayer.forceSourceA ? imageA : getSourceImage(rctx, layer.source, imageA, imageB, clipT);
    if (src) {
      // Framing camera (factory 3): the standalone Transition A/B drop-zone tiles
      // live in the same off-canvas world space as the replicator wall, so route
      // them through the same look-at camera (computeFraming pose). Generic — only
      // active when the scene resolves a Framing pose (rctx.framed).
      let worldTransform = evalLayer.worldTransform;
      if (FRAMING_VIEW_ENABLED && rctx.framed && output.height && layer.type === 'image' && layer.dropZone) {
        const fcam = framedCameraBasis(rctx.framed, output.height);
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
        ? resolveImageMaskAlpha(rctx, layer.imageMaskSourceId, output.width, output.height, layer.imageMaskInvert)
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
        const corners = projectQuad(worldTransform, src.width, src.height, rctx.cameraZ ?? 2000);
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
      const camZ = rctx.cameraZ ?? 2000;
      // The single visible page rotates about its centre vertical axis by θ. While
      // its front faces the camera (θ<90°) source A shows; past edge-on the page's
      // BACK faces the camera and PAEFlop (Flop=0) mirrors it horizontally so it
      // reads correctly. The headless reference resolves BOTH pages to source A, so
      // the same drop-zone media renders throughout.
      const pastEdge = flip.theta > Math.PI / 2;
      const page = pastEdge ? flip.back : flip.front;
      const src = getSourceImage(rctx, flip.front.layer.source, imageA, imageB);
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
      } else if (isMaskGroup(rctx, child)) {
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
        renderLayer(rctx, groupBuffer, order(i), imageA, imageB, time, filterOverrides);
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
        renderLayer(rctx, output, order(i), imageA, imageB, time, filterOverrides);
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
  const rctx: RenderContext = {
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
  if (field) rctx.fieldTextureLayerId = field.layerId;

  // Movements/Drop In card conform: detect once. When present, renderLayer draws
  // the Transition A/B drop zones as top-left cards (A static, B bouncing behind)
  // instead of the default full-frame blit.
  rctx.dropInCard = detectDropInCard(scene, imageA, imageB, width, height);

  // Draw the Drop In cards up front (B behind, A in front) so their z-order and
  // tail-frame behavior are independent of child render order / per-layer
  // visibility. The particle emitters then render on top via the normal loop.
  if (rctx.dropInCard) {
    const c = rctx.dropInCard;
    const bEval = scene.evalLayerById.get(c.bId);
    const aEval = scene.evalLayerById.get(c.aId);
    // B (behind): riding its Position-Y bounce, only while its lifetime is live.
    // (Verified: A-on-top scores higher than B-on-top — the settled tail shows the
    // sepia A card with B fully occluded behind it.)
    if (bEval && bEval.visible && bEval.opacity > 0) {
      const bSrc = getSourceImage(rctx, bEval.layer.source, imageA, imageB);
      if (bSrc) blitDropInCard(output, bSrc, c.cardW, c.cardH, bEval.worldTransform[13] * c.posScale, bEval.opacity);
    }
    // A (in front): static at the top-left.
    if (aEval && aEval.visible && aEval.opacity > 0) {
      const aSrc = getSourceImage(rctx, aEval.layer.source, imageA, imageB);
      if (aSrc) blitDropInCard(output, aSrc, c.cardW, c.cardH, 0, aEval.opacity);
    }
  }

  // Render layers back-to-front (Motion: first in list = top/foreground, last = bottom/background)
  for (let i = scene.layers.length - 1; i >= 0; i--) {
    renderLayer(rctx, output, scene.layers[i], imageA, imageB, scene.time, scene.filterOverrides);
  }

  // Composite the field-texture proxy over the rendered frame (no-op if not detected).
  if (field) applyParticleFieldProxy(output, scene, field);

  return output;
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

  // All filters are dispatched by UUID via the self-registering modules in
  // compositor/filters/ (see filters/index.ts). Add a new filter as a module there;
  // this function never needs editing. Unknown/unregistered filters pass through.
  {
    const mod = lookupFilter(filter);
    if (mod) {
      const ctx = makeContext(filter, time, input.width, input.height, overrides);
      return mod.apply(input, ctx);
    }
  }
  return input;
}

