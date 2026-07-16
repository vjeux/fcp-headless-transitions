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
// STATUS. This module PROVIDES the depth-composite scaffolding
// (buildDepthQuad + renderDepthComposite + createDepthBuffer + two structural
// probes) reusing the shared perspective.ts primitives (projectQuadWithWorldZ +
// renderPerspectiveQuadDepth). It is NOT YET wired into the main composite()
// pipeline — the wiring lives inside renderCloneLayer which is concurrently
// being edited by T-qconcentric1 (Concentric task). Wiring lands as a
// SEPARATE T-q98a30de5 increment after that tick completes; this module is
// gate-neutral (no import site) until then. Unit tests in
// engine/test/z-composite.test.ts pin the rasterization + probes so the
// scaffolding cannot silently regress before wiring lands.
//
// WIRING RECIPE (for the next T-q98a30de5 increment, after Concentric releases
// renderCloneLayer):
//   1. In compositor/index.ts::composite(), AFTER `rctx` is constructed and
//      BEFORE the main render loop `for (let i = scene.layers.length - 1;...`,
//      probe the scene: `if (hasNestedMaskedCloneCameraStack(sceneMotr))` —
//      note `composite()` currently only sees EvaluatedScene, not the raw
//      MotrScene, so the probe result must be pre-computed at API-level
//      (api.ts) and stashed on `scene` (e.g. scene.zCompositeEnabled: boolean)
//      exactly like `equirectScene`. Guard behind `env.FCT_Z_COMPOSITE_3D` in
//      dev/staging.
//   2. When `scene.zCompositeEnabled`, DO NOT call the normal
//      renderCloneLayer/renderDrawableLayer per-layer loop for the masked-A
//      "Shape 0N" + "Clone Layer N" family. Instead:
//        a. Render the drawn base (Transition B, id 10006 for 3D_Rectangle)
//           into `output` via the normal renderDrawableLayer path. This seeds
//           `output` with photo B at every pixel and seeds `zbuf` with the
//           base's world-Z at every pixel (renderPerspectiveQuadDepth handles
//           this — pass in a full-frame quad for B).
//        b. For each masked-A quad (the 9 "Shape 0N" or their re-cloner
//           "Clone Layer N" — pick the outermost layer whose evaluator has
//           already baked the animated mask into its src ImageData; the
//           T-qrect3d0001 f00 18.59→37.87 BAKE proves this bake is correct
//           when done via the existing clone-source Image-Mask path), build a
//           DepthQuad via `buildDepthQuad(evalLayer, maskedSrc, rctx.cameraZ)`.
//        c. Call `renderDepthComposite(output, zbuf, quads)`. Order does not
//           matter — the near-wins-per-pixel semantics are verified by
//           z-composite.test.ts::"reverse order — near wins regardless of
//           paint order".
//   3. All other scenes (`!scene.zCompositeEnabled`) fall through to today's
//      renderCloneLayer path unchanged — gate-neutral for 64 built-ins.
//   4. Update no-hardcode.test.ts to register `hasNestedMaskedCloneCameraStack`
//      as a subset-refinement of `hasCameraCloneStack` (parent fires on 4:
//      3D Rectangle, Light Sweep, Color Planes, 360° Wipe — well above
//      MIN_FIRES=2, verified 2026-07-16). The refinement selects the ONE
//      family member (3D_Rectangle) where the nested masked-clone chain
//      requires per-pixel depth; the other 3 parent members render fine
//      today so they stay on the painter path.
//   5. Gate: `./fct.sh gen engine Replicator-Clones__3D_Rectangle` then
//      `./fct.sh regress engine`. Target: 3D_Rectangle 16.48 → materially
//      up, 0 regressions across the other 64.
//
// DECODE CITATION: 3D_Rectangle.motr scenenode enumeration confirmed 2026-07-16:
//   Camera (id 16580), Inside 01..08 (nested clone chain), Shape 01..09
//   (each clones TransA, masked by Inside 0(N-1)), Clone Layer..Clone Layer 8
//   (re-clones of Shape 0N), Transition B enabled, Transition A disabled.
//   Rig Behavior 3001325829 drives Inside 01 Scale via ./1/100/105 (7 snapshot
//   columns), Rig Behavior 3001966583 drives Position via ./1/100/101.

import type { EvaluatedLayer } from '../evaluator/index.js';
import type { MotrScene, Layer } from '../types.js';
import {
  projectQuadWithWorldZ,
  renderPerspectiveQuadDepth,
  CAMERA_Z_DEFAULT,
} from './perspective.js';

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
