import { rasterizeShape, applyMask, unionMasks } from './shapes.js';
import { needsPerspective, projectQuad, renderPerspectiveQuad, renderPageFlip } from './perspective.js';
import {
  mat4MultiplyOffset, createBuffer, blitDstBBox,
  blitTransformed, blitDirect,
} from './blit.js';
import type { RenderContext } from './context.js';
import {
  resolveCloneImage, cloneChainLeafId, shapeMaskCell, revealThroughMask, findVisibleDrawable,
  getSourceImage, isMaskGroup, collectMaskShapes, collectImageMaskSourceIds,
  resolveImageMaskAlpha, maskSourceIsShapeGeometry, evalSubtreeContains,
  maskSourceWorldRadius,
} from './masks.js';
import {
  framedCameraBasis, projectFramed, dropZonePlaceholderCell, cellContentBBox,
  transformBBoxToOutput, centerEvaluatedLayer, detectPageFlip, isFlatCoplanarStack,
  retimedClipTime,
} from './geometry.js';
import { resample } from './resample.js';
import { detectFieldTexture, applyParticleFieldProxy, detectParticleGroupTint } from './field-texture.js';
import { applyEmitterSim } from './emitter-sim.js';
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

// Drop-zone media conform (capability #1, "close this first"). FCP conforms a
// drop-zone's SOURCE media to its declared Width×Height box before the transition
// graph runs — a Fit=0 / Type=1 drop zone stretches the media to exactly fill the box
// (Use Display Aspect Ratio id=323=0 → no aspect preservation). The engine historically
// blitted the source at its NATIVE pixel size, so a 1854×1042 bench image landed centred
// in the 1920×1080 frame leaving a ~19px top/bottom + ~33px left/right BLACK band ("base
// A renders as a band not full-frame", the known letterbox-conform bug shared by
// Blurs/Push/Rotate/360°/Kinetic). GUI GT + headless FCP both fill the frame; the identity
// capability scene measured headless mae 1.0 vs A (conformed) but TS mae 16.4 (edge error).
//
// conformDropZoneSource stretch-resamples a leaf drop-zone source UP to the box (== output
// frame for the full-frame Transition A/B cards). Anamorphic STRETCH (not aspect-fill): the
// box aspect (16:9) already ~matches the source (1.7793 vs 1.7778) and headless matches a
// stretch (edge mae ~1.0) over aspect-fill+crop (right-edge mae ~3.1). Only UPSCALE. Scoped
// at the call site to the base full-frame UNCROPPED case (box ≈ frame, crop=0 so effCrop is
// 0 too, no framing/perspective/360). Env FCT_CONFORM_FILL=0 restores the native blit.
const CONFORM_FILL_ENABLED = process.env.FCT_CONFORM_FILL !== '0';
function conformDropZoneSource(src: ImageData, boxW: number, boxH: number): ImageData {
  if (!CONFORM_FILL_ENABLED) return src;
  if (boxW <= 0 || boxH <= 0) return src;
  if (src.width >= boxW && src.height >= boxH) return src;
  return resample(src, boxW, boxH);
}

// Scene-aware refinement of the raw wide-equirect dimension test (isWideEquirect).
// A ≥3072-wide, ≥1.6:1 project canvas is only a GENUINE 360°/VR panorama when BOTH transition drop
// zones are themselves authored at the wide panorama resolution (≥3072 px). A plain
// HD transition composited into a 4K canvas (Movements/Smear: a 1920×1080 Transition-A
// card inside a 4096×2160 project) is NOT equirect — its drop-zone sources must still
// be fill-conformed (otherwise the settled-B tail letterboxes). Computed from the raw
// layer map (composite() only holds the EvaluatedScene, not the MotrScene).
function computeEquirectScene(width: number, height: number, layerById: Map<number, Layer>): boolean {
  if (!isWideEquirect(width, height)) return false;
  let anyDropZone = false;
  let allWide = true;
  for (const l of layerById.values()) {
    if (l.type === 'image' && l.dropZone
      && (l.source?.type === 'transitionA' || l.source?.type === 'transitionB')) {
      anyDropZone = true;
      if (l.dropZone.width < 3072) allWide = false;
    }
  }
  return anyDropZone && allWide;
}

/**
 * IDs of the standalone Transition A/B drop-zone image scenenodes (Object.Type=1
 * or 2) that FCP CULLS when the same A/B content is already provided to the scene
 * by a Replicator wall through drop-zone (Type=3) "Pin" cells.
 *
 * Decoded 2026-07-16 (T-qd1814800): Replicator-Clones · Video_Wall authors 14
 * Replicators whose Cells' `Object Source` (param id 128) point to two Type=3
 * drop-zone Image scenenodes named "Pin 1 " / "Pin 2" (FCPX Motion-Template
 * convention: FCPX binds the transition's two clips into the two indexed Pin
 * wells, and resolveCellImage routes Pin 1 → imageA, Pin 2 → imageB). The scene
 * also carries STANDALONE Transition A (Type=1, world y=-2390) and Transition B
 * (Type=2, world y=+3596) image scenenodes at extreme off-canvas Y. FCP's real
 * render suppresses these standalone plates once the same A/B content lives in
 * the tile wall (otherwise the framing-camera projection blows them up into
 * lone frame-filling tiles that overlap the wall — engine f11 rendered a
 * frame-height blue Transition-B plate that GT does not show).
 *
 * Structural signature (no slug names / fitted constants):
 *   - AT LEAST ONE Replicator layer whose Cell (cellSourceId) resolves to an
 *     Image layer carrying an Object.Type=3 drop zone (dropZone.type === 3),
 *   - AND at least one STANDALONE Image layer at top-level whose source is
 *     transitionA (Type=1) or transitionB (Type=2) with a drop zone
 *     (layer.dropZone defined).
 *
 * The cull is applied ONLY when the render context has a framing pose
 * (rctx.framed) — an origin-camera scene never projects off-canvas plates
 * into the frame, so nothing to cull.
 *
 * Returns the set of standalone A/B image layer ids to skip (empty when the
 * signature doesn't fire).
 */
function collectCulledStandaloneAB(scene: EvaluatedScene): Set<number> {
  const out = new Set<number>();
  const layerById = scene.layerById;
  // Discover Type=3 drop-zone image ids that are cell sources.
  let anyType3CellSrc = false;
  for (const l of layerById.values()) {
    if (l.type !== 'replicator' || !l.replicator) continue;
    const csid = l.cellSourceId;
    if (csid === undefined) continue;
    const src = layerById.get(csid);
    if (src && src.type === 'image' && src.dropZone && src.dropZone.type === 3) {
      anyType3CellSrc = true;
      break;
    }
  }
  if (!anyType3CellSrc) return out;
  // Standalone A/B image scenenodes (Type=1 or Type=2 drop zones with source
  // transitionA / transitionB). Walk the whole layerById map — these live
  // INSIDE the "Source" group, not at top level.
  for (const l of layerById.values()) {
    if (l.type === 'image' && l.dropZone
      && (l.dropZone.type === 1 || l.dropZone.type === 2)
      && (l.source?.type === 'transitionA' || l.source?.type === 'transitionB')) {
      out.add(l.id);
    }
  }
  return out;
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
import type { Layer } from '../types.js';
import { isWideEquirect } from '../capabilities.js';




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
 * Motion Template "Pin N" drop-zone convention (Type=3 user-media wells named
 * "Pin 1"/"Pin 2"/…). Returns the 1-based Pin index or undefined for other names.
 * Trims trailing whitespace (Video_Wall.motr authors "Pin 1 " with a stray space).
 */
function parsePinIndex(name: string): number | undefined {
  const m = name.trim().match(/^Pin\s+(\d+)$/i);
  return m ? parseInt(m[1], 10) : undefined;
}

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

  // User-media Drop Zone well (Type=3): the headless render supplies only Transition
  // A (Type=1) and B (Type=2); a Type-3 well has no bound media by itself. Two cases:
  //  • Motion Template "Pin N" — Replicator/Clones · Video_Wall names its two Type-3
  //    wells "Pin 1"/"Pin 2". Motion Templates enumerate drop zones per-index; FCPX
  //    binds a 2-clip transition's A→Pin 1 and B→Pin 2 (the drop-zone dialog's
  //    "Drop Zone 1"/"Drop Zone 2" ordering carries through). Route the cell to the
  //    matching source image so the 14 replicated wall tiles show the real A/B
  //    photos instead of the gray placeholder. The name is the ONE piece of the
  //    scenenode that expresses the Pin index (there's no separate index parameter).
  //  • Everything else (name doesn't match "Pin N") — fall through to Motion's
  //    OZImageElement::createDropZoneGridBitmap gray placeholder, preserving the
  //    generic Type=3-without-content behaviour for non-Pin templates.
  if (src.type === 'image' && src.dropZone?.type === 3) {
    const pinIdx = parsePinIndex(src.name);
    if (pinIdx === 1) return { kind: 'image', img: imageA };
    if (pinIdx === 2) return { kind: 'image', img: imageB };
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











type RenderOutcome = 'stop' | 'children';

function renderReplicatorLayer(rctx: RenderContext, output: ImageData, evalLayer: EvaluatedLayer, imageA: ImageData, imageB: ImageData, time: number, filterOverrides: Map<number, Map<string, number>>): RenderOutcome {
  const { layer, worldTransform, opacity, crop } = evalLayer;
  if (!(layer.type === 'replicator' && layer.replicator)) return 'children';
    // A replicator that is an Image Mask `Mask Source` is HIDDEN geometry — it
    // provides the reveal matte to the layer that references it (Transition B),
    // rasterized there via resolveImageMaskAlpha → replicatorMaskAlpha. It must
    // never draw its cells directly (that would paint the dots as visible content
    // over the frame). Same semantic as the group-mask-source skip above.
    if (rctx.imageMaskSourceIds.has(layer.id)) return 'stop';
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

    // CELL-FILL scale (decoded 2026-07-16, T-qvidwall01). Motion scales a replicator
    // cell's content to FILL its grid cell: the visible wall tiles TOUCH (thin seams),
    // they do not float as small stamps in a wide cell. The grid pitch (the world
    // distance between adjacent instances) is sizeWidth/(cols−1); a raw 1920-px photo
    // tile at Video_Wall's ~4100 pitch would leave a ~2180-px black gap on every side
    // (the engine rendered ~4 tiny tiles on black at the far dolly — 41-66% black —
    // vs GT's frame-filling grid). Uniformly scale the cell so its WIDTH fills the
    // grid-cell pitch (pitchX / tileWidth), which makes adjacent tiles meet with a
    // thin seam exactly as the GUI GT shows. Derived purely from the parsed grid
    // geometry (sizeWidth, columns) and the source tile width — NO fitted constant,
    // NO per-transition branch. Only fires for multi-column grids whose pitch exceeds
    // the tile (fillScale>1); single-column / already-dense grids keep scale 1, so
    // dot/panel replicators (Duplicate, Squares, Concentric) are untouched. This is
    // the tile-density half of the Video_Wall wall-fill fix (the camera 3-key dolly is
    // the other half — see resolveFramedWallPose).
    let cellFill = 1;
    if (stampImg && stampImg.width > 0 && cols > 1) {
      const pitchX = layer.replicator.sizeWidth / (cols - 1);
      const fillScale = pitchX / stampImg.width;
      if (fillScale > 1) cellFill = fillScale;
    }

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
        const effScale = instScale * cellFill;
        if (effScale !== 1) {
          // Scale the cell about its own center (instance origin), then translate.
          instTransform[0] *= effScale; instTransform[1] *= effScale;
          instTransform[4] *= effScale; instTransform[5] *= effScale;
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
  return 'stop';
}

function renderCloneLayer(rctx: RenderContext, output: ImageData, evalLayer: EvaluatedLayer, imageA: ImageData, imageB: ImageData, time: number, filterOverrides: Map<number, Map<string, number>>): RenderOutcome {
  const { layer, worldTransform, opacity, crop } = evalLayer;
    // Clone Layer: draw the image of the object it mirrors, at this layer's transform.
    let src = resolveCloneImage(rctx, layer.cloneSourceId);
    if (src) {
      // CLONE SOURCE'S OWN FILTERS: when a Clone Layer references a standalone
      // Transition A/B (or another leaf) as its `cloneSourceId`, the SOURCE layer's
      // filters must be applied to the resolved pixels — resolveCloneImage returns
      // the raw imageA/imageB without them. Decoded from Replicator-Clones/Concentric:
      // standalone Transition B (id 10006) carries a PAEFlop (horizontal-mirror)
      // filter, and every "Clone B copy N" ring clones B by ID. Without applying
      // the source's PAEFlop here, the ring content is un-mirrored (raw imageB),
      // so the interior rings look identical to the B background — no visible
      // woven bullseye. Walking `cloneSourceId` up to the terminal leaf (bounded
      // by resolveCloneImage's depth guard) and running its filters is a strict
      // superset of the previous behavior — clone chains whose leaf has no filters
      // are byte-identical.
      const leafId = cloneChainLeafId(rctx, layer.cloneSourceId);
      const leaf = leafId !== undefined ? rctx.layerById.get(leafId) : undefined;
      if (leaf && leaf.filters && leaf.filters.length > 0) {
        if (process.env.FCT_DEBUG_CLONE_FILT) console.error(`[clone-filt] layer=${layer.id} type=${layer.type} name=${layer.name} leafId=${leafId} leafName=${leaf.name} filters=${leaf.filters.map(f=>(f as any).kind||(f as any).type||'?').join(',')}`);
        for (const filter of leaf.filters) {
          src = applyFilter(src, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
        }
      }
      // A clone may carry its OWN filters (e.g. Color Planes stacks 6 clones of the
      // same source, each with a Channel Mixer isolating one R/G/B channel, then
      // additively blends them at different Z depths for the chromatic-split look).
      // These per-pixel color filters must be applied to the cloned image BEFORE it
      // is projected/blitted — otherwise every clone renders the full-color source
      // and the additive stack blows out (too bright) or collapses (too dark).
      if (layer.filters.length > 0) {
        for (const filter of layer.filters) {
          src = applyFilter(src, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
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
      // A clone may reference a rig-selected Image Mask via `imageMaskSourceId`
      // (mirrors renderMedia's imageMaskSourceId branch above). Decoded from
      // Replicator-Clones/Concentric: each "Clone B copy N" ring has an
      // imageMaskSourceId pointing at a ring-shaped shape/group, which clips the
      // cloned B pixels into rings woven with A. Without this branch the clone
      // renders full-frame B and the ring geometry is invisible. Generic:
      // mirrors exactly what renderMedia does (blit to temp, apply mask, direct
      // composite) — no per-transition hardcoding.
      const cloneMaskAlpha = layer.imageMaskSourceId !== undefined
        ? resolveImageMaskAlpha(rctx, layer.imageMaskSourceId, output.width, output.height, layer.imageMaskInvert)
        : null;
      if (cloneMaskAlpha) {
        const temp = createBuffer(output.width, output.height);
        if (needsPerspective(worldTransform)) {
          const corners = projectQuad(worldTransform, src.width, src.height, rctx.cameraZ ?? 2000);
          renderPerspectiveQuad(temp, src, corners, 1.0, 'normal');
        } else {
          blitTransformed(temp, src, worldTransform, 1.0, crop, 'normal', blitDstBBox(temp, src, worldTransform, crop));
        }
        applyMask(temp, cloneMaskAlpha);
        blitDirect(output, temp, opacity, layer.blendMode);
      } else if (cloneMasks.length > 0) {
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
    if (evalLayer.children.some(c => c.layer.type === 'shape' && c.layer.shape?.isMask)) return 'stop';
  return 'children';
}

function renderDrawableLayer(rctx: RenderContext, output: ImageData, evalLayer: EvaluatedLayer, imageA: ImageData, imageB: ImageData, time: number, filterOverrides: Map<number, Map<string, number>>): RenderOutcome {
  const { layer, worldTransform, opacity, crop } = evalLayer;
  if (layer.type === 'shape' && layer.shape && !layer.shape.isMask
      && (layer.shape.fillColor || evalLayer.fillColorOverride) && opacity > 0) {
    const alpha = rasterizeShape(layer.shape, output.width, output.height, worldTransform, rctx.cameraZ, rctx.cameraPosZ);
    // A colour-channel Link (ROADMAP S1/T-A1) may drive this shape's Fill Color
    // RGB from a hidden colour-driver shape's fill. Panels_Across's "Red bar"
    // authors its Fill Color WITHOUT the solid-fill flag bit (findFillColor
    // returns undefined) BECAUSE the fill is Link-driven (the "Link fill color"
    // behaviour copies the Color linker's (188, 18, 36) into the bar's fill each
    // frame). When only the Link override is present, we treat it as the fill and
    // rasterise at full alpha (the override is authoritative — the source shape
    // is a colour swatch, no per-channel alpha modulation).
    const baseFC = layer.shape.fillColor;
    const linked = evalLayer.fillColorOverride;
    const r = linked ? linked.r : baseFC!.r;
    const g = linked ? linked.g : baseFC!.g;
    const b = linked ? linked.b : baseFC!.b;
    const a = baseFC ? baseFC.a : 1;
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
      filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
    }
    blitDirect(output, filtered, opacity, layer.blendMode);
    // A filled shape may still have children (e.g. a replicator emitter); fall
    // through so they render on top.
  }

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
      filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
    }
    blitDirect(output, filtered, opacity, layer.blendMode);
    // Panels can still have children; fall through.
  }

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
    if (layer.type === 'image' && rctx.fieldTextureLayerId === layer.id) return 'stop';

    // Skip a STANDALONE Transition A/B drop-zone image layer whose A/B content is
    // already provided to the framed scene by a Replicator wall through Type=3
    // drop-zone Pin cells (see collectCulledStandaloneAB). Without this cull the
    // off-canvas (world y ~ ±3000) A/B plates project through the framing camera
    // as giant lone tiles overlapping the wall (Video_Wall f11 rendered a
    // frame-height blue Transition-B plate; GT shows only the tile grid).
    // Gated behind rctx.framed via culledStandaloneAB being populated only when
    // scene.camera?.framed is present, so origin-camera scenes are untouched.
    // DISABLED — see per-frame investigation: at f00/f23 the standalone A/B IS
    // the near-key content that fills the frame (GT shows only that plate). The
    // wall replicator is what needs suppressing in mid-frames, or the plate
    // culled only in the FAR pose. See ROADMAP.
    // if (layer.type === 'image' && rctx.culledStandaloneAB && rctx.culledStandaloneAB.has(layer.id)) return 'stop';

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
      // Lens-flare glow: renderLensFlare emits a FULL-FRAME field already in output
      // coordinates (its centre sweep + envelope are computed in frame pixels), so
      // it composites 1:1 with the layer's Screen/add blend — NOT through the
      // generator layer's worldTransform. That layer carries a rig-driven Scale
      // (Oscillate Size) + a fixed-res box that would otherwise displace/shrink the
      // full-frame glow into a corner. (Generic: keyed on the lensFlare SOURCE
      // TYPE, never the slug.)
      if (layer.source?.type === 'lensFlare') {
        let filtered = src;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
        }
        blitDirect(output, filtered, opacity, layer.blendMode);
        return 'children';
      }
      // Conform the base full-frame drop-zone SOURCE to fill the frame (capability #1;
      // see conformDropZoneSource). The classic case: a plain UNCROPPED drop-zone image
      // whose box ≈ the render buffer in a NON-panorama scene (rctx.equirectScene false).
      // A GENUINE 360°/VR scene renders at its native panorama size and reads back a
      // centred window; stretching its source to the buffer regressed 360°_Bloom −0.38,
      // so equirect scenes keep the native blit. Also excluded: the framing camera
      // (off-canvas wall tiles project their own scale) and cropped drop zones (crop is
      // in native source pixels).
      const boxNotCropped = crop.left === 0 && crop.right === 0 && crop.top === 0 && crop.bottom === 0;
      const dz = layer.type === 'image' ? layer.dropZone : undefined;
      const conformBaseOK = !!dz
        && !(FRAMING_VIEW_ENABLED && rctx.framed) && !rctx.equirectScene && boxNotCropped;
      // ADDITIONAL sub-canvas case: a transition A/B card whose box is SMALLER than the
      // render buffer — a plain HD transition composited into an OVERSIZED project canvas
      // (Movements/Smear: a 1920×1080 Transition-A card + a 4096×2160 Transition-B in a
      // 4096×2160 project). Without the conform the card stays native-size + centred, so
      // the settled-B tail LETTERBOXED (native 1854×1042 centred in the 4K buffer)
      // instead of filling the frame like the GUI GT. Restricted to A/B transition cards
      // (a decorative sub-canvas MEDIA sprite must NOT be stretched to full frame).
      const conformSubCanvasAB = conformBaseOK && !!dz
        && (layer.source?.type === 'transitionA' || layer.source?.type === 'transitionB')
        && dz.width <= output.width + 2 && dz.height <= output.height + 2
        && (dz.width < output.width - 2 || dz.height < output.height - 2);
      const conformBoxEqOut = conformBaseOK && !!dz
        && Math.abs(dz.width - output.width) <= 2
        && Math.abs(dz.height - output.height) <= 2;
      const drawSrc = (conformBoxEqOut || conformSubCanvasAB)
        ? conformDropZoneSource(src, output.width, output.height)
        : src;
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
        blitTransformed(temp, drawSrc, worldTransform, 1.0, effCrop, 'normal', blitDstBBox(temp, drawSrc, worldTransform, effCrop));
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
        }
        applyMask(filtered, maskAlpha);
        blitDirect(output, filtered, opacity, layer.blendMode);
      } else if (layer.filters.length > 0) {
        // Render to temp buffer, apply filters, then composite onto output
        const temp = createBuffer(output.width, output.height);
        blitTransformed(temp, drawSrc, worldTransform, 1.0, effCrop); // full opacity to temp
        let filtered = temp;
        for (const filter of layer.filters) {
          filtered = applyFilter(filtered, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
        }
        blitDirect(output, filtered, opacity, layer.blendMode);
      } else if (needsPerspective(worldTransform)) {
        // 3D perspective: project the source quad and rasterize
        const corners = projectQuad(worldTransform, drawSrc.width, drawSrc.height, rctx.cameraZ ?? 2000);
        renderPerspectiveQuad(output, drawSrc, corners, opacity);
      } else {
        blitTransformed(output, drawSrc, worldTransform, opacity, effCrop, layer.blendMode, blitDstBBox(output, drawSrc, worldTransform, effCrop));
      }
    }
  }
  return 'children';
}

function renderChildLayers(rctx: RenderContext, output: ImageData, evalLayer: EvaluatedLayer, imageA: ImageData, imageB: ImageData, time: number, filterOverrides: Map<number, Map<string, number>>): void {
  const { layer, opacity } = evalLayer;
  if (evalLayer.children.length === 0) return;
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
      // Draw the media of the page whose FRONT faces the camera: front page (A)
      // before edge-on, back page (B) after. FCP's card flip is two-sided — A on
      // the front, B on the reverse (pre-mirrored by PAEFlop so it reads upright).
      // GUI GT confirms the reveal: the flip tail settles on photo B (bluish), not
      // A — the earlier "headless resolves both pages to source A" note was a wrong
      // assumption (one truth = GUI GT). Bind each page to its OWN drop-zone source.
      const src = getSourceImage(rctx, page.layer.source, imageA, imageB);
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
    // GROUP-LEVEL IMAGE MASK: a `<mask Image Mask>` authored on the GROUP/LAYER (not a
    // leaf drawable) clips the WHOLE group to a referenced shape/clone. Concentric's
    // ring groups mask stacked Clone A/B to a Circle shape (the concentric-ring
    // geometry); minimized 11-node repro proves the engine renders the unmasked
    // full-frame clone (f10-f18 ~6 dB) because this mask was dropped. Trigger the
    // temp-buffer path so the group's composited children can be alpha-clipped by the
    // rasterized mask source, exactly like the leaf-drawable path at renderDrawableLayer.
    //
    // SCOPE (verified vs the full GUI-GT gate): apply the group mask ONLY when the
    // Mask Source is a DESCENDANT of this group AND resolves to SHAPE/CLONE geometry
    // (rasterized through its own world transform, so it swings/foreshortens WITH the
    // group). This is the "in-group clip geometry" semantic — the source lives inside
    // the masked group (Concentric's Circle child, Center's Shapes-group child) and
    // moves with it. Two other conventions must NOT take this path or they regress:
    //   • Cross-container source (Combo_Spin's separate `Shape Masks` layer, -4.28;
    //     Close_and_Open's `Mask shapes` layer, -1.29): source is NOT a descendant —
    //     masking the whole composited group to a foreign static shape drops the
    //     spinning clones. Handled by the pre-existing (non-group) paths.
    //   • Image-MEDIA source (Pinwheel's `square_fix`, -3.46): the source is an image
    //     whose reveal matte is rasterized FLAT full-frame (resolveImageMaskAlpha's
    //     image branch ignores the source's own 3D-swing transform), so masking the
    //     group to it mis-registers. Left to the pre-existing path.
    // Concentric (+min-repro 40 dB) and Center (+0.46) are descendant SHAPE/CLONE
    // sources -> they take this path; the four regressors are all excluded.
    const maskSrcEval = layer.imageMaskSourceId !== undefined
      ? rctx.evalLayerById.get(layer.imageMaskSourceId)
      : undefined;
    const maskSrcIsShapeGeom = maskSrcEval !== undefined && maskSourceIsShapeGeometry(maskSrcEval);
    // GROUP IMAGE-MASK on 3D-swinging ring groups (Concentric): the mask-source
    // Circle carries the group's animated Rotation.Y swing, so its worldTransform has
    // real 3D depth. Historically the group content (clones) was projected via
    // projectQuad while the mask rasterized FLAT-AFFINE (resolveImageMaskAlpha passed
    // no cameraZ), so the two disagreed and only the outermost ring survived — a
    // 3D-swing GUARD skipped the mask for 3D sources. That guard is now removed:
    // resolveImageMaskAlpha rasterizes the mask shape through the SAME perspective
    // camera as the content (rctx.cameraZ/cameraPosZ), and the evaluator honors each
    // Circle's static Scale (1.27/0.75/0.5/…) so the concentric rings are correctly
    // sized. A flat 2D mask source takes rasterizeShape's affine path unchanged, so
    // flat group masks (Center/Heart) are byte-for-byte identical to before.
    const hasImageMask = layer.imageMaskSourceId !== undefined
      && maskSrcIsShapeGeom
      && evalSubtreeContains(evalLayer, layer.imageMaskSourceId);

    // Draw-order convention. The default renders children in REVERSE list order
    // (last-listed rendered first = bottom, first-listed last = top), which the
    // 3D-hinge groups (Rotate/Reflection/Flip) rely on — there depth, not draw
    // order, resolves z. A FLAT 2D stack of coplanar full-frame images/clones
    // (Movements/Switch: Clone B + Transition A + Transition B, all Z-rotation
    // only) has NO 3D depth to resolve z, so Motion's compositor shows whichever
    // co-planar card is CLOSEST TO FRAME CENTRE on top — the "switch" is the two
    // cards counter-rotating past each other so the incoming card (B, then its
    // Clone once B times out) slides to centre and covers the outgoing one (A),
    // which swings away. VERIFIED vs GUI GT: A holds centre f00→~f05, B takes over
    // ~f06 and STAYS to the end (the engine's old declared-order model wrongly
    // brought A back to the front at the tail — f18–f23 showed warm A, GT is cool
    // B). So for a flat stack we PAINT the visible cards farthest-centre-first
    // (bottom) → closest-centre-last (top). Distance uses the world-transform
    // translation (m12,m13) from the output centre. The 3D-hinge groups keep the
    // reverse default (their z is real depth). Generic: keyed on the flat-stack
    // geometry, never a slug name.
    const flatStack = isFlatCoplanarStack(visibleChildren, layer);
    // CONCENTRIC MASKED-RING ORDER (Concentric): the children are masked ring GROUPS,
    // each clipped to a filled circle of a DIFFERENT authored radius (Circle 1..6 =
    // Scale 1.27/1.0/0.75/0.5/0.26/0.15). Each ring shows a disc of one photo phase;
    // stacked, they form concentric rings ONLY when the largest disc is drawn at the
    // BOTTOM and the smallest on TOP (else the outer disc covers all inner rings). The
    // .motr lists them largest-first, and the default reverse-list order would draw the
    // largest LAST (on top) → full-frame cover (verified: engine rendered flat photo B).
    // Detect the pattern structurally — ≥3 visible children, ALL carrying an in-group
    // shape-geometry Image Mask, with a spread of mask radii — then paint
    // largest-radius-first (bottom) → smallest-last (top). Fully param-driven (the mask
    // circle's authored Scale IS the radius); never a slug name.
    const ringRadii = visibleChildren.map(c =>
      c.layer.imageMaskSourceId !== undefined
        ? maskSourceWorldRadius(rctx.evalLayerById, c.layer.imageMaskSourceId)
        : undefined);
    const ringCount = ringRadii.filter(r => r !== undefined).length;
    const distinctRadii = new Set(ringRadii.filter(r => r !== undefined).map(r => Math.round(r!))).size;
    const concentricRings = ringCount === visibleChildren.length && ringCount >= 3 && distinctRadii >= 2;
    let order: (idx: number) => EvaluatedLayer;
    if (concentricRings) {
      // Largest radius first (bottom), smallest last (top). Stable sort keeps the
      // authored left/right pairing of equal-radius rings.
      const idxs = visibleChildren.map((_, i) => i);
      idxs.sort((a, b) => (ringRadii[b] ?? 0) - (ringRadii[a] ?? 0));
      order = (idx: number): EvaluatedLayer => visibleChildren[idxs[idx]];
    } else if (flatStack) {
      // The layer world-transform translation (m12,m13) is already expressed
      // relative to the frame centre (Motion's scene origin is the canvas centre),
      // so |(m12,m13)| IS the distance from centre.
      const centreDist = (c: EvaluatedLayer): number => {
        const m = c.worldTransform;
        const dx = m ? m[12] : 0;
        const dy = m ? m[13] : 0;
        return dx * dx + dy * dy;
      };
      const sorted = [...visibleChildren].sort((a, b) => centreDist(b) - centreDist(a));
      order = (idx: number): EvaluatedLayer => sorted[idx];
    } else {
      order = (idx: number): EvaluatedLayer => visibleChildren[visibleChildren.length - 1 - idx];
    }

    if (hasFilters || hasMasks || hasBlend || hasImageMask) {
      // Render visible children to a temp buffer
      const groupBuffer = createBuffer(output.width, output.height);
      for (let i = 0; i < visibleChildren.length; i++) {
        renderLayer(rctx, groupBuffer, order(i), imageA, imageB, time, filterOverrides);
      }

      // Apply masks (rasterize shapes, union them, apply to group content).
      // WRITE-ON masks (S8): a procedural mask carrying `writeOnTransforms` sweeps a
      // finite quad that RETREATS; FCP reveals monotonically. Rasterize the shape at
      // every sub-time transform and union (per-pixel max) so a pixel revealed at ANY
      // earlier sub-time stays revealed — the monotonic write-on envelope. An EMPTY
      // writeOnTransforms means the sweep has not entered yet ⇒ reveal nothing (an
      // all-zero matte), NOT "no mask" (which would leave the group unmasked).
      if (hasMasks) {
        const masks: Uint8Array[] = [];
        let writeOnPending = false; // a write-on mask exists but reveals nothing yet
        for (const m of maskShapes) {
          if (!m.visible || !m.layer.shape) continue;
          if (m.writeOnTransforms) {
            if (m.writeOnTransforms.length === 0) { writeOnPending = true; continue; }
            for (const xf of m.writeOnTransforms) {
              masks.push(rasterizeShape(m.layer.shape, output.width, output.height, xf));
            }
          } else {
            masks.push(rasterizeShape(m.layer.shape, output.width, output.height, m.worldTransform));
          }
        }
        if (masks.length > 0) {
          const combined = masks.length === 1 ? masks[0] : unionMasks(masks, output.width, output.height);
          applyMask(groupBuffer, combined);
        } else if (writeOnPending) {
          // Sweep not started: nothing revealed → zero out the group content.
          applyMask(groupBuffer, new Uint8Array(output.width * output.height));
        }
      }

      // Apply a GROUP-LEVEL Image Mask (a `<mask Image Mask>` on this group/layer whose
      // Mask Source is a sibling shape/clone). Rasterize the source alpha and multiply
      // it into the composited group content — the same operation the leaf-drawable path
      // does at renderDrawableLayer (:479), lifted to the group so ring-mask groups
      // (Concentric) clip their stacked clones to the shape. `invert` honors Invert Mask.
      if (hasImageMask && layer.imageMaskSourceId !== undefined) {
        const maskAlpha = resolveImageMaskAlpha(
          rctx, layer.imageMaskSourceId, output.width, output.height, layer.imageMaskInvert);
        if (maskAlpha) applyMask(groupBuffer, maskAlpha);
      }

      // Apply filters
      let processed = groupBuffer;
      for (const filter of layer.filters) {
        processed = applyFilter(processed, filter, evalLayer, time, filterOverrides.get(filter.id), rctx);
      }

      // Composite onto output
      blitDirect(output, processed, opacity, layer.blendMode);
    } else {
      for (let i = 0; i < visibleChildren.length; i++) {
        renderLayer(rctx, output, order(i), imageA, imageB, time, filterOverrides);
      }
    }
}

/**
 * Per-layer-type render pipeline, registered by primary layer type. Each renderer
 * keeps its own type/shape guard (so it is self-contained + unit-testable) and returns
 * whether rendering should STOP or continue to the generic child render. renderLayer is
 * a thin dispatcher: it resolves the ordered renderer chain for the layer's type from
 * LAYER_RENDERERS, runs them until one says 'stop', then renders children.
 *
 * Chains (mirrors the original fall-through order exactly):
 *   replicator -> [renderReplicatorLayer]                 (always 'stop')
 *   clone      -> [renderCloneLayer, renderDrawableLayer] (clone may 'stop' or fall through)
 *   image/generator/shape -> [renderDrawableLayer]        (draw then children, image may 'stop')
 *   group/other -> []                                     (straight to children)
 */
const LAYER_RENDERERS: Record<string, Array<(rctx: RenderContext, output: ImageData, evalLayer: EvaluatedLayer, imageA: ImageData, imageB: ImageData, time: number, filterOverrides: Map<number, Map<string, number>>) => RenderOutcome>> = {
  replicator: [renderReplicatorLayer],
  clone: [renderCloneLayer, renderDrawableLayer],
  image: [renderDrawableLayer],
  generator: [renderDrawableLayer],
  shape: [renderDrawableLayer],
};

function renderLayer(rctx: RenderContext, output: ImageData, evalLayer: EvaluatedLayer, imageA: ImageData, imageB: ImageData, time: number, filterOverrides: Map<number, Map<string, number>>): void {
  if (!evalLayer.visible) return;
  const { layer } = evalLayer;

  // A group that is an Image Mask `Mask Source` is hidden geometry — it provides
  // alpha to the layer that references it (rendered there via resolveImageMaskAlpha),
  // and must never draw its shapes directly.
  if (layer.type === 'group' && rctx.imageMaskSourceIds.has(layer.id)) return;

  // Run the type's renderer chain; a renderer returning 'stop' skips the child render.
  const chain = LAYER_RENDERERS[layer.type];
  if (chain) {
    for (const render of chain) {
      if (render(rctx, output, evalLayer, imageA, imageB, time, filterOverrides) === 'stop') return;
    }
  }

  // Children (back to front).
  renderChildLayers(rctx, output, evalLayer, imageA, imageB, time, filterOverrides);
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
    filterTime: scene.unwrappedTime ?? scene.time,
    equirectScene: computeEquirectScene(scene.width, scene.height, scene.layerById),
    culledStandaloneAB: scene.camera?.framed ? collectCulledStandaloneAB(scene) : undefined,
  };

  // Particle-emitter field proxy (Stylized/Nature: Diagonal, Glide) — detect once.
  // See applyParticleFieldProxy for rationale. Detecting the field texture up front
  // lets renderLayer SKIP that texture's dim normal render (the proxy owns it),
  // avoiding a double-composite that washed the early frames too gray.
  const field = detectFieldTexture(scene, mediaResolver);
  if (field) rctx.fieldTextureLayerId = field.layerId;

  // Render layers back-to-front (Motion: first in list = top/foreground, last = bottom/background)
  for (let i = scene.layers.length - 1; i >= 0; i--) {
    renderLayer(rctx, output, scene.layers[i], imageA, imageB, scene.time, scene.filterOverrides);
  }

  // Composite the field-texture proxy over the rendered frame (no-op if not detected).
  // T-B3 (flag-gated, default OFF): tint the proxy texture by the particle group's
  // ancestor TintFx so the backdrop matches Motion's green wash. Default path is the
  // untinted proxy (byte-identical to the shipped baseline).
  const spriteSimOn = process.env.FCT_SPRITE_SIM !== '0';
  const particleTint = spriteSimOn && field ? detectParticleGroupTint(scene) : null;
  if (field) applyParticleFieldProxy(output, scene, field, particleTint);

  // The whole particle GROUP shares a fade-in envelope (FCP holds pure source A, then
  // fades the tinted texture backdrop AND the massed sprites in together). The texture
  // layer's evaluated opacity IS that group envelope (decoded: op 0 → 0.31 plateau).
  // Gate the sprite sim by it so sprites don't render over the held photo in the early
  // frames (GT stays pure photo A through ~f05, then greens). Normalised by the 0.31
  // plateau and clamped to [0,1] so it reaches full strength at the plateau. Defaults
  // to 1 when there's no field texture (non-Nature emitter scenes are unaffected).
  const groupFade = spriteSimOn && field
    ? Math.min(1, Math.max(0, (scene.evalLayerById?.get(field.layerId)?.opacity ?? 0.31) / 0.31))
    : 1;

  // Emitter sim + render. T-B2 default: flat-COLOUR dots (byte-identical to baseline).
  // T-B3 (flag-gated FCT_SPRITE_SIM=1): renders the cell's REAL Particle Source sprite
  // (resolved PNG, scaled/rotated/tinted/faded-over-life) + tints it by the particle-
  // group TintFx. The sprite subsystem is BUILT and verified to render the correct
  // structure (green hexagons over a green field on Wipes/Diagonal), but is gated OFF
  // pending two calibration decodes that currently regress the PSNR vs GUI GT:
  //   (1) TINT MAGNITUDE — Motion's TintFx (Color Space id=11 = 3) yields a PALE green
  //       (GT f12 mean ≈ (183,225,178)); the luma·color model here over-darkens
  //       (≈(52,134,50)). Needs the Color-Space=3 blend decoded (not plain luma·tint).
  //   (2) FIELD ENVELOPE TIMING — GT stays pure brown photo through f05 then greens
  //       f06→f11 and holds; the current proxy bell starts at progress≈0.088 (f02),
  //       far too early. Needs the real green-onset envelope (texture layer opacity
  //       curve, not a symmetric bell) decoded.
  // No-op when the scene has no simulatable emitter — non-particle transitions stay
  // byte-identical. Runs AFTER the field-texture proxy.
  applyEmitterSim(
    output, scene, { emitters: scene.emitters, particleCells: scene.particleCells },
    spriteSimOn ? mediaResolver : undefined, particleTint, groupFade,
  );

  return output;
}



/** Apply a filter to an image buffer. */
function applyFilter(input: ImageData, filter: import('../types.js').Filter, evalLayer: EvaluatedLayer, time: number, overrides?: Map<string, number>, rctx?: RenderContext): ImageData {
  const name = filter.pluginName.toLowerCase();

  // Skip on-screen-control (OSC) preview filters — they're editor UI, not rendered
  // output. These share the SAME pluginName as the real filter (e.g. "PAEZoomBlur"),
  // so pluginName alone can't distinguish them. The reliable discriminator is the
  // scenenode `name` attribute's "(for OSC)" marker (e.g. Blurs/Zoom carries both
  // "Zoom Blur (for OSC)" AND the real "Zoom Blur").
  // ⚠️ Do NOT also skip on `Publish OSC == 1`: that is NOT an OSC marker — the REAL
  // Directional Blur and Radial Blur filters set Publish OSC=1 too (verified in the
  // Blurs/Directional + Blurs/Radial .motr), so skipping on it silently dropped their
  // blur entirely (engine rendered sharp where FCP blurs heavily). GUI-GT-verified.
  const nodeName = (filter.name || '').toLowerCase();
  const isOscByName = (s: string) => s.includes('for osc') || s.includes('(osc)') || s.endsWith(' osc');
  if (isOscByName(name) || isOscByName(nodeName)) {
    return input;
  }

  // All filters are dispatched by UUID via the self-registering modules in
  // compositor/filters/ (see filters/index.ts). Add a new filter as a module there;
  // this function never needs editing. Unknown/unregistered filters pass through.
  {
    const mod = lookupFilter(filter);
    if (mod) {
      // Filter parameter curves animate on the effect's OWN (un-retimed) timeline —
      // the drop-zone retime-wrap that loops `time` back to 0 for the content must
      // NOT warp a filter's keyframed params (e.g. Lights/Bloom's Threshold ramp
      // fires at t≈0.33→0.59s but every frame past the 0.20s wrap froze it at t=0 =
      // Threshold 100 = the ×10 extract knocks everything out = ZERO bloom). Evaluate
      // filter curves at the un-wrapped scene time (rctx.filterTime) so keyframed
      // filter animation plays through regardless of the source-media wrap. Same
      // principle already used for lensFlare/video overlays (mediaTime). Falls back
      // to the wrapped `time` when no rctx is threaded.
      const fTime = rctx?.filterTime ?? time;
      const ctx = makeContext(filter, fTime, input.width, input.height, overrides);
      return mod.apply(input, ctx);
    }
  }
  return input;
}

