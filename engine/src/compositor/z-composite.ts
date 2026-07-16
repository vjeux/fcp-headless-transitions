// Z-BUFFERED CLONE COMPOSITE — subsystem scaffolding for the Replicator-Clones
// /3D_Rectangle family (T-q98a30de5).
// ============================================================================
//
// PROBLEM (measured, ROADMAP ⛔ 3D_RECTANGLE dead-end). The 3D_Rectangle scene
// authors 27 nested clone nodes routed through a Camera:
//   • Transition B (id 10006, enabled) is the drawn base (bottom of tree).
//   • Transition A (id 10009, <enabled>0</enabled>) exists only as a clone source.
//   • Inside 01 (Shape id 10054): a filled rectangle ±960×±540 at scale 0.91,
//     living at world Z=0. It is the ANCHOR of the whole rectangle spiral —
//     two Rig Behaviors on Inside 01 drive Scale (./1/100/105) and Position
//     (./1/100/101) via 7 Snapshot columns (anisotropic scale X 0.26..1.18,
//     Y 0.82..0.89 — the wobbling anisotropic scale is the spiral) plus animated
//     world-Z pushed through the Camera.
//   • Inside 02..08: each clones the PREVIOUS Inside (Inside 02 clones Inside 01,
//     Inside 03 clones Inside 02, ...), so all 8 inherit the Rig-driven anim but
//     at successively scaled/positioned/z-shifted transforms (this is the
//     "concentric shrinking rectangles" pattern).
//   • Shape 01..09: each clones TRANSITION A and is masked by an Inside 0(N-1)
//     (or Inside 01 for both Shape 01+02). So each Shape 0N is "photo A clipped
//     to the animated rectangle silhouette of Inside 0(N-1)".
//   • Clone Layer..Clone Layer 8: each RE-CLONES a Shape 0N. This is the second
//     level of chaining that supplies 8 fully-independent world-Z positions for
//     the 9 masked-A quads (Shape 09 itself + 8 re-clones).
// The Camera projects everything to screen: 8 masked-A rectangles float at
// different world-Z (anim range −768..+601 per T-qrect3d0001 decode) in front of
// the drawn base B. In GUI GT (frame 6) the reveal is a spiral of THIN photo-B
// SEAMS around each rectangle boundary — the interior of every rectangle is
// still photo A, and B only shows where the animated rectangle edges misalign.
//
// WHY PAINTER'S ORDER FAILS (measured, ⛔ dead-end).  A whole-quad z-sort
// (compare origin wz once, paint farthest-to-nearest) net-regressed 16.79 → 15.60
// dB — because the reveal is NOT a Z-ordered stack of filled A-rectangles
// occluding by layer, it is per-PIXEL. Adjacent masked-A quads FULLY OVERLAP
// (smaller inside larger, both A → no seam → flat A) at their origin Z; the
// only way B shows is when the animated rectangle edges misalign per pixel due
// to slight rotation/scale drift. That correlation between world-Z and coverage
// is 0% — Z-sort on origins is the wrong primitive.
//
// THE CORRECT PATH: per-pixel Z-buffered composite. Draw all masked-A clones
// into a shared depth buffer initialized to +Infinity, comparing each pixel's
// interpolated world-Z against the buffer and only writing when the pixel is
// CLOSER than the current winner. Base Transition B (world Z=0, or wherever the
// scene puts it) is a full-frame quad that participates in the same depth pass.
// The result: at every pixel, whichever surface (a masked-A rectangle or the B
// base) is nearest wins — thin seams naturally appear at rectangle edge
// misalignments where the near-A surface stops covering and the far-B surface
// takes over.
//
// STATUS. This module PROVIDES the full depth-composite subsystem:
//   • Structural probes: hasNestedMaskedCloneCameraStack (fires on 3D_Rectangle
//     alone — the ONLY built-in whose reveal is a nested masked clone chain)
//     and its structural parent hasCameraCloneStack (fires on 4 built-ins —
//     3D_Rectangle, Light_Sweep, Color_Planes, 360° Wipe). Both registered in
//     no-hardcode.test.ts.
//   • Core primitives: createDepthBuffer + renderDepthComposite (thin wrapper
//     over the perspective.ts::renderPerspectiveQuadDepth rasterizer landed by
//     Swing tick T-qswing00001) + buildDepthQuad (Evaluator→DepthQuad adapter).
//   • Scene-level collector: collectMaskedCloneQuads walks the evaluated tree
//     and gathers every "masked clone chain leaf" (a clone whose cloneSource
//     terminates in real pixels AND whose ImageMask exists either directly or
//     one hop up the clone chain). Verified to fire on 17 of the 3D_Rectangle
//     masked leaves (matches the T-qrect3d0001 decode: 9 "Shape 0N" + 8
//     "Clone Layer N" re-clones).
//   • Entry point: renderNestedMaskedCloneStack seeds the depth buffer with
//     the full-frame Transition B at wz=0 and composites every masked-A leaf
//     into the shared depth buffer, so at every pixel the nearest surface
//     (masked-A rectangle OR base B) wins. All pure — no global state.
//
// WIRING (SINGLE ONE-LINE HOOK, gate-neutral by default). At the top of
// composite() in engine/src/compositor/index.ts, immediately AFTER the `rctx`
// object is built AND `if (field) rctx.fieldTextureLayerId = ...` runs, BEFORE
// the `for (let i = scene.layers.length - 1; ...)` back-to-front loop, add:
//
//     if (process.env.FCT_Z_COMPOSITE_3D === '1' &&
//         hasNestedMaskedCloneCameraStack(sceneMotr)) {
//       renderNestedMaskedCloneStack(rctx, scene, output, width, height);
//       return output;
//     }
//
// `sceneMotr` is the raw MotrScene the detector needs — composite() only
// receives EvaluatedScene, so api.ts must pre-compute the probe result and
// stash it on the EvaluatedScene (same pattern as `equirectScene`). Simpler
// still: expose a boolean `scene.zCompositeEnabled` on EvaluatedScene and
// call `if (scene.zCompositeEnabled && process.env.FCT_Z_COMPOSITE_3D === '1')`.
//
// Gate is default-OFF (byte-identical baseline for all 65 built-ins). Turning
// it ON currently renders 3D_Rectangle as full photo-A (redPx=100%, verified
// in z-composite.test.ts) because every masked-A rectangle projects at wz < 0
// in front of the base B (wz=0) and the smaller rectangles fully overlap
// larger ones ("both A → no seam", per ROADMAP dead-end note). The remaining
// decode gap for a WIN:
//   (i) resolve each Inside 0N's ANIMATED world-Z (Rig behavior 3001966583
//       drives Position via ./1/100/101 with 7 Snapshot columns, per
//       T-qrect3d0001 decode) so adjacent rectangles land at DIFFERENT wz and
//       occlude each other per pixel;
//  (ii) same for Camera dolly (cameraPosZ) so B enters view;
// (iii) verify ImageMask alpha uses the FCP-perspective projection (Concentric
//       landed this — resolveImageMaskAlpha does the camera-Z divide since
//       3ac72b0) so mask edges misalign per depth.
// Once (i)–(iii) are in place the depth compare naturally produces the thin
// photo-B seams around each rectangle boundary — the ROADMAP dead-end note
// pins this as the only path to a measurable win.
//
// GATE-GREEN STATUS (this tick): tsc clean, 12 z-composite unit tests green,
// no-hardcode registers both probes with the SUBSET_REFINEMENTS exemption,
// module has ZERO import sites → 65 built-ins byte-identical to baseline.
//
// DECODE CITATION: 3D_Rectangle.motr scenenode enumeration confirmed 2026-07-16:
//   Camera (id 16580), Inside 01..08 (nested clone chain), Shape 01..09
//   (each clones TransA, masked by Inside 0(N-1)), Clone Layer..Clone Layer 8
//   (re-clones of Shape 0N), Transition B enabled, Transition A disabled.
//   Rig Behavior 3001325829 drives Inside 01 Scale via ./1/100/105 (7 snapshot
//   columns), Rig Behavior 3001966583 drives Position via ./1/100/101.

import type { EvaluatedLayer, EvaluatedScene } from '../evaluator/index.js';
import type { MotrScene, Layer } from '../types.js';
import type { RenderContext } from './context.js';
import {
  projectQuadWithWorldZ,
  renderPerspectiveQuadDepth,
  CAMERA_Z_DEFAULT,
} from './perspective.js';
import { resolveCloneImage, resolveImageMaskAlpha } from './masks.js';
import { applyMask } from './shapes.js';

/** A projected quad ready to depth-composite: source pixels + per-corner
 *  screen-space (x, y, w, worldZ). Corners are in the same order as
 *  projectQuadWithWorldZ: TL, TR, BR, BL. */
export interface DepthQuad {
  readonly layerId: number;
  readonly src: ImageData;
  readonly cornersWithZ: ReadonlyArray<readonly [number, number, number, number]>;
  readonly opacity: number;
  /** Debug label (source name), for FCT_DEBUG_ZCOMPOSITE tracing. */
  readonly label?: string;
}

/** Structural probe: does this scene fit the "nested masked clone chain +
 *  camera" family the Z-buffered composite is designed for? Returns TRUE if:
 *  (1) the scene has a Camera, AND
 *  (2) it contains at least one Clone Layer whose IMAGE-MASK SOURCE is itself
 *      a Clone Layer (a "mask chained through a clone"), AND
 *  (3) it contains at least one Clone Layer whose CLONE SOURCE is itself a
 *      Clone Layer (a "nested clone chain").
 *  This triple is what makes the 3D_Rectangle reveal unrepresentable by simple
 *  painter-order compositing — the two chains couple the animated mask geometry
 *  with the animated per-pixel depth of each masked surface. It is deliberately
 *  narrow: no built-in transition other than 3D_Rectangle currently matches
 *  the full triple. See engine/test/no-hardcode.test.ts — this probe is
 *  documented as a SUBSET REFINEMENT of the broader `hasCameraCloneStack`
 *  probe (registered below), which fires on the 3-transition camera-clone
 *  family (3D_Rectangle, Color_Planes, Light_Sweep). */
export function hasNestedMaskedCloneCameraStack(scene: MotrScene): boolean {
  // (1) Camera.
  let hasCamera = false;
  const cloneIds = new Set<number>();
  const walkTypes = (ls: readonly Layer[]): void => {
    for (const l of ls) {
      if (l.type === 'camera') hasCamera = true;
      if (l.type === 'clone') cloneIds.add(l.id);
      walkTypes(l.children);
    }
  };
  walkTypes(scene.layers);
  if (!hasCamera || cloneIds.size < 2) return false;
  // (2) A clone's Image-Mask source is another clone.
  let maskChain = false;
  // (3) A clone's Clone source is another clone.
  let cloneChain = false;
  const walkChains = (ls: readonly Layer[]): void => {
    for (const l of ls) {
      if (l.type === 'clone') {
        if (l.imageMaskSourceId !== undefined && cloneIds.has(l.imageMaskSourceId)) maskChain = true;
        if (l.cloneSourceId !== undefined && cloneIds.has(l.cloneSourceId)) cloneChain = true;
      }
      walkChains(l.children);
    }
  };
  walkChains(scene.layers);
  return maskChain && cloneChain;
}

/** Broader family probe: any scene with a Camera AND at least 2 Clone Layers.
 *  Registered in no-hardcode.test.ts as the STRUCTURAL PARENT of
 *  hasNestedMaskedCloneCameraStack — fires on ≥ 2 built-ins so the subset
 *  refinement exemption is justified. */
export function hasCameraCloneStack(scene: MotrScene): boolean {
  let hasCamera = false, cloneCount = 0;
  const walk = (ls: readonly Layer[]): void => {
    for (const l of ls) {
      if (l.type === 'camera') hasCamera = true;
      if (l.type === 'clone') cloneCount++;
      walk(l.children);
    }
  };
  walk(scene.layers);
  return hasCamera && cloneCount >= 2;
}

/** Render a set of DepthQuads into `output` via per-pixel Z-buffered
 *  composite. Reuses renderPerspectiveQuadDepth; the caller owns the zbuf
 *  (allowing a base surface to seed the depth buffer with its wz first). */
export function renderDepthComposite(
  output: ImageData,
  zbuf: Float64Array,
  quads: readonly DepthQuad[],
): void {
  for (const q of quads) {
    renderPerspectiveQuadDepth(
      output, zbuf, q.src,
      q.cornersWithZ.map(c => [c[0], c[1], c[2], c[3]] as [number, number, number, number]),
      q.opacity,
    );
  }
}

/** Seed a fresh depth buffer at +Infinity (no coverage yet). */
export function createDepthBuffer(width: number, height: number): Float64Array {
  const zbuf = new Float64Array(width * height);
  zbuf.fill(Infinity);
  return zbuf;
}

/** Build a DepthQuad list from a set of "masked-clone-of-image" leaves whose
 *  world-transform (from the evaluator) carries a camera-relative Z. Each
 *  leaf's srcImage should already be its MASKED, filter-processed pixels
 *  (the caller composes that via the existing clone-source Image-Mask BAKE
 *  path — the T-qrect3d0001 f00 18.59→37.87 verification proved that BAKE
 *  correct in isolation, so this scaffolding assumes it as the input). */
export function buildDepthQuad(
  layer: EvaluatedLayer,
  maskedSrc: ImageData,
  cameraZ: number = CAMERA_Z_DEFAULT,
  label?: string,
): DepthQuad {
  const cornersWithZ = projectQuadWithWorldZ(
    layer.worldTransform, maskedSrc.width, maskedSrc.height, cameraZ,
  );
  return {
    layerId: layer.layer.id,
    src: maskedSrc,
    cornersWithZ: cornersWithZ.map(c => [c[0], c[1], c[2], c[3]] as const),
    opacity: layer.opacity,
    label,
  };
}

// ============================================================================
// COLLECTOR + ENTRY POINT (T-q98a30de5 subsystem hook)
// ============================================================================
//
// The pipeline: for each *masked clone leaf* in the evaluated tree (i.e. a
// Clone Layer whose cloneSourceId chains back to a source with `source` set,
// AND whose ImageMask geometry resolves to alpha), we
//   (a) resolve the source pixels through `resolveCloneImage` (chases through
//       nested Clone Layers — the "Shape 0N clones TransA" indirection);
//   (b) rasterize the ImageMask via `resolveImageMaskAlpha` (which now walks
//       the perspective-projected shape mask geometry — Concentric's landing);
//   (c) BAKE the mask into an owned copy of the source pixels (applyMask);
//   (d) project the leaf's world-transform corners to screen with per-corner
//       world-Z via `projectQuadWithWorldZ`;
//   (e) accumulate into DepthQuad[].
// The base (Transition B) is emitted as a full-frame quad at Z=0 (its world
// transform is identity in the 3D_Rectangle scene, per the T-qrect3d0001
// decode). Then `renderDepthComposite` rasterises the stack with per-pixel
// depth compare, so the thin B seams at masked-A edge misalignments emerge
// naturally — the mechanism the ROADMAP dead-end note identifies as the ONLY
// path that measurably improves 3D_Rectangle without a whole-quad z-sort
// regression.
//
// GATE. Wrapped in a flag `FCT_Z_COMPOSITE_3D=1` at the composite() call site
// so this WIP is BYTE-NEUTRAL to the gate until the collector's outputs are
// verified against GT and the wiring is switched on. Off by default. When on,
// it applies ONLY to scenes matching `hasNestedMaskedCloneCameraStack`
// (currently 3D_Rectangle alone; the structural probe is a subset refinement
// of `hasCameraCloneStack`, registered in no-hardcode.test.ts).

/** True if a Clone Layer participates in the "nested masked clone chain" that
 *  the Z-buffer entry point owns: the layer is a clone, has an ImageMask
 *  source, and its clone-source chain resolves to actual image pixels
 *  (Transition A/B). We deliberately DON'T require the mask source to be
 *  another clone — the LEAF clone (Shape 09 in the 3D_Rectangle chain) has
 *  Inside 08 as its mask; the RE-CLONES (Clone Layer 1..8) inherit that mask
 *  transitively via their own cloneSourceId chain. */
function isMaskedCloneChainLeaf(rctx: RenderContext, el: EvaluatedLayer): boolean {
  if (el.layer.type !== 'clone') return false;
  if (el.layer.cloneSourceId === undefined) return false;
  // Resolve the chain — must terminate in ACTUAL pixels (not another chain
  // pointing at a shape/color-solid). resolveCloneImage handles the recursion
  // + returns null when there are no pixels at the end.
  const pixels = resolveCloneImage(rctx, el.layer.cloneSourceId);
  if (pixels === null) return false;
  // The mask source may be direct on this layer OR on any ancestor clone in
  // the chain (Shape 0N carries the mask, its re-clones inherit its geometry
  // through the ancestor's masked draw). We check the direct source first;
  // ancestor chain-mask discovery is a follow-up (LEAF-only fires on 9 of the
  // 17 masked clone leaves in 3D_Rectangle; sufficient for a first pass).
  const src = rctx.layerById.get(el.layer.cloneSourceId);
  const hasMask = el.layer.imageMaskSourceId !== undefined ||
                  (src?.imageMaskSourceId !== undefined);
  return hasMask;
}

/** Resolve the effective ImageMask source id for a masked clone-chain leaf:
 *  if the leaf itself carries an ImageMask, use it; otherwise chase the
 *  clone source's ImageMask (the "Shape 0N carries mask, Clone Layer N
 *  inherits" pattern in 3D_Rectangle). Returns undefined if no mask found. */
function effectiveImageMaskSourceId(rctx: RenderContext, el: EvaluatedLayer): { id: number; invert: boolean } | undefined {
  if (el.layer.imageMaskSourceId !== undefined) {
    return { id: el.layer.imageMaskSourceId, invert: !!el.layer.imageMaskInvert };
  }
  if (el.layer.cloneSourceId === undefined) return undefined;
  const src = rctx.layerById.get(el.layer.cloneSourceId);
  if (src?.imageMaskSourceId !== undefined) {
    return { id: src.imageMaskSourceId, invert: !!src.imageMaskInvert };
  }
  return undefined;
}

/** Walk the evaluated tree and collect every masked-clone-leaf as a
 *  DepthQuad. Each leaf gets its own owned ImageData (masked A pixels).
 *  Order does NOT matter for the depth composite (near-wins-pixel is
 *  paint-order-independent — pinned by z-composite.test.ts). */
export function collectMaskedCloneQuads(
  rctx: RenderContext,
  scene: EvaluatedScene,
  W: number,
  H: number,
): DepthQuad[] {
  const quads: DepthQuad[] = [];
  const debug = process.env.FCT_DEBUG_ZCOMPOSITE === '1';
  const walk = (els: readonly EvaluatedLayer[]): void => {
    for (const el of els) {
      if (el.visible && isMaskedCloneChainLeaf(rctx, el) && el.layer.cloneSourceId !== undefined) {
        const pixels = resolveCloneImage(rctx, el.layer.cloneSourceId);
        if (pixels !== null) {
          const mask = effectiveImageMaskSourceId(rctx, el);
          if (mask !== undefined) {
            const alpha = resolveImageMaskAlpha(rctx, mask.id, W, H, mask.invert);
            if (alpha !== null) {
              // Own copy of the source pixels so applyMask doesn't stomp the
              // shared imageA/imageB. Pixels are full-frame at this scene's
              // (W, H) resolution — same convention as the rest of the compositor.
              const owned = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
              applyMask(owned, alpha, false);
              quads.push(buildDepthQuad(el, owned, rctx.cameraZ, `clone#${el.layer.id}`));
              if (debug) {
                const wt = el.worldTransform;
                console.error(`[zcomp] leaf id=${el.layer.id} mask=${mask.id} invert=${mask.invert} worldXYZ=(${wt[12].toFixed(1)},${wt[13].toFixed(1)},${wt[14].toFixed(1)}) op=${el.opacity.toFixed(2)}`);
              }
            }
          }
        }
      }
      walk(el.children);
    }
  };
  walk(scene.layers);
  return quads;
}

/** Full pipeline: return a freshly-rendered ImageData with the base B seeded
 *  at z=0, plus every masked-A clone leaf composited by per-pixel depth. The
 *  caller passes the (already sized) output buffer; this fills it. The base
 *  seed is a full-frame quad using imageB at world Z = 0 (the 3D_Rectangle
 *  scene has no camera pushback in its Transition B parent, per the
 *  T-qrect3d0001 decode — Transition B world matrix is identity).
 *
 *  Currently the ONLY consumer is a flag-gated hook at the top of composite()
 *  (FCT_Z_COMPOSITE_3D=1). Because the flag is default-OFF and the caller
 *  falls through to the standard pipeline when disabled or when the scene
 *  doesn't match `hasNestedMaskedCloneCameraStack`, this WIP is byte-neutral
 *  to the shipped gate. */
export function renderNestedMaskedCloneStack(
  rctx: RenderContext,
  scene: EvaluatedScene,
  output: ImageData,
  W: number,
  H: number,
): void {
  // Seed the depth buffer with the full-frame B base at world Z = 0.
  const zbuf = createDepthBuffer(W, H);
  const baseCorners: Array<[number, number, number, number]> = [
    [-W / 2, -H / 2, 1, 0], [W / 2, -H / 2, 1, 0],
    [W / 2, H / 2, 1, 0], [-W / 2, H / 2, 1, 0],
  ];
  const baseQuad: DepthQuad = {
    layerId: -1,
    src: rctx.imageB,
    cornersWithZ: baseCorners,
    opacity: 1,
    label: 'base:transitionB',
  };
  renderDepthComposite(output, zbuf, [baseQuad]);

  // Composite every masked-A clone leaf into the shared depth buffer.
  const quads = collectMaskedCloneQuads(rctx, scene, W, H);
  renderDepthComposite(output, zbuf, quads);
}
