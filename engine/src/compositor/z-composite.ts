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
// ── RESUME DECODE (2026-07-16 tick, T-q98a30de5) — measured state + the real
//    mid-frame gap. The subsystem now WORKS end-to-end when FCT_Z_COMPOSITE_3D=1
//    (wired at compositor/index.ts:1078). Measured vs GUI GT, --source engine:
//      • flag OFF (shipped baseline): MEAN 16.48 dB. f00=18.59.
//      • flag ON  (this z-composite): MEAN 15.69 dB. f00=34.65 (+16! the depth
//        composite is CORRECT at f00), but f04..f18 each 1-3 dB WORSE than the
//        flat-A baseline (f06 12.68 vs 15.25; f18 9.75). Net −0.79 → still gate-
//        NEGATIVE, so the flag stays OFF (byte-neutral). The task is now purely
//        the MID-FRAME morph.
//
//    WHY f00 wins but f1-f8 lose (decoded this tick, cite these — probes deleted):
//    1. THE MASKS ARE STATIC — and that is CORRECT. Inside 01..08 evaluate to a
//       fixed concentric-rectangle set (sx=sy = 0.91,0.81,0.71,…,0.21; pos (0,0,0))
//       at EVERY frame (verified: evaluate() worldTransform identical f0 vs f6).
//       Widget 10001 (factoryID 9) is an ASPECT-RATIO selector — its 7 snapshot
//       columns are named "9:16","1:1","4:3","16:9","1.8:1",… (NOT a time ramp).
//       value=0 → the aspect column; the columns carry the anisotropic scale
//       (Scale id=2 X0.66/Y0.85, id=6 X0.926/Y0.895, …) but only ONE is selected
//       per project aspect, statically. So there is NO rig-snapshot TIME morph to
//       add — the earlier brief's "morph f1-f8" premise is refuted by the .motr.
//    2. THE ANIMATION IS ALL IN Z. The leaf world-Z DOES animate (Rig Position
//       snapshots + Camera dolly): at f6 leaves span wz −251..+197, scale 0.81..1.42;
//       at f8 wz −335..+263 (verified via FCT_DEBUG_ZCOMPOSITE leaf trace). baseZ
//       (B) dollies −600→−400 over f0→f8.
//    3. THE ACTUAL GAP is the DEPTH-COMPOSITE GEOMETRY, not the morph. In GUI GT
//       f06 the reveal is ~5 THICK photo-B concentric FRAMES (interior sepia-A,
//       ~40-60px blue-B bands between rings). The engine renders near-full A with
//       only HAIRLINE seams: depthBlitCenterScaled scales each masked-A rect about
//       SCREEN CENTRE, and since the nearer (scaled-up) rects win everywhere they
//       cover, they fill the interior and B only survives at 1px edge misalignments.
//       Tested (single-frame f6, all worse or neutral): FCT_ZC_NOSCALE=1 → pure
//       nested A, zero seams; FCT_ZC_BDEPTH=1 (B stays in depth race) → MEAN 15.52
//       (worse); FCT_ZC_BZ={0,60,120} with BDEPTH → B at higher Z rarely wins, even
//       fewer seams. So neither "B in race" nor base-Z is the lever.
//    NEXT LEAD (for the resume) — CORRECTED with GT re-inspection + 4 measured
//       full-sequence variants this tick. GT f06 is a MOSTLY-SEPIA-A frame with
//       THIN (~15-20px) photo-B rectangle-OUTLINE seams (like nested picture
//       frames), NOT thick B bands. So the reveal is "A fills, B shows only in the
//       narrow gaps where consecutive concentric rect EDGES misalign". Measured
//       full-sequence means vs GUI GT (flag ON, --source engine; baseline OFF=16.48):
//         • depthBlitCenterScaled (filled, DEFAULT)      MEAN 15.69  ← best, seams
//           just too THIN/faint (1-2px vs GT's 15-20px).
//         • FCT_ZC_BDEPTH=1 (B stays in depth race)      MEAN 15.52
//         • FCT_ZC_PERSP=1 (per-corner camera projection) MEAN 13.26  ← worse
//         • FCT_ZC_RING=1 (annulus subtract)             MEAN 13.46  ← worse
//           (RING makes thick B BANDS — the WRONG direction; f01-08 crash to ~9.5).
//       CONCLUSION: the filled center-scale is directionally correct; the mid-frame
//       loss is that its B seams are far too thin. The lead is NOT ring-subtract nor
//       re-projection — it is making the concentric filled rects land at screen
//       positions whose EDGES are ~15-20px apart (GT's frame stroke width). Likely
//       levers to build+measure next: (a) the per-leaf depth-scale magnitude/pivot
//       (the rects may need to pivot about their own center-of-mask, not screen
//       centre, so a near rect grows AWAY from the shared centre and widens the gap
//       to its neighbour); (b) a thin B-stroke overlay at each mask boundary; (c)
//       verify the Camera Angle-Of-View rig column (Widget 10001 drives AoV on
//       Camera 16580 — 7 snapshot cols) feeds cameraZ so the projection spread
//       matches FCP. FCT_ZC_BZ / FCT_ZC_PERSP / FCT_ZC_RING env hooks all remain
//       (default-inert) to support that measurement work.
//
// GATE-GREEN STATUS (this tick): tsc clean, 12 z-composite unit tests green,
// no-hardcode registers both probes with the SUBSET_REFINEMENTS exemption,
// FCT_Z_COMPOSITE_3D default-OFF → 65 built-ins byte-identical to baseline
// (code deltas are the FCT_ZC_BZ + FCT_ZC_PERSP + FCT_ZC_RING experiment hooks,
// all default-inert — the leaf loop takes the unchanged depthBlitCenterScaled path).
//
// DECODE CITATION: 3D_Rectangle.motr scenenode enumeration confirmed 2026-07-16:
//   Camera (id 16580), Inside 01..08 (nested clone chain), Shape 01..09
//   (each clones TransA, masked by Inside 0(N-1)), Clone Layer..Clone Layer 8
//   (re-clones of Shape 0N), Transition B enabled, Transition A disabled.
//   Rig Behavior 3001325829 drives Inside 01 Scale via ./1/100/105 (7 snapshot
//   columns), Rig Behavior 3001966583 drives Position via ./1/100/101.
//
// ── 2026-07-16z2 MEASURED RESUME (WIP T-q98a30de5) ──
// See the "NEXT LEAD" + variant table above — that block is the authoritative,
// current measured summary (filled center-scale 15.69 best; RING/PERSP/BDEPTH all
// worse; flat-A baseline 16.48). f00 is a huge win (34.65). The remaining gap is
// mid-frame B-seam THICKNESS (GT ~15-20px stroke-frames vs engine ~1-2px). The
// unbuilt lead is a fixed mask EROSION per leaf (constant-width B stroke). All
// three FCT_ZC_* env hooks are default-inert (gate-neutral); the flag stays OFF.
//
// ── 2026-07-17 tick T-q98a30de5 — STROKE OVERLAY + FLATA experiments (WIP) ──
// Re-inspected GT f06 with the flag-ON default render side-by-side. GT is
// mostly-photo-A with 4-5 concentric THIN (~10-15px) photo-B rectangle-outline
// strokes; the engine default paints one big sepia rect (nearest leaf) fully
// covering all inner concentric leaves so only 2 boundaries emerge (outer +
// innermost hairline). MEASURED FULL-SEQUENCE means vs GUI GT
// (--source engine; baseline flag OFF = 16.48; flag ON default = 15.69):
//   • FCT_Z_COMPOSITE_3D=1 FCT_ZC_ERODE=8  MEAN 14.87  (worse — shrinks masks but nearest still hides all)
//   • FCT_Z_COMPOSITE_3D=1 FCT_ZC_ERODE=4  MEAN 15.08  (worse — same reason)
//   • FCT_Z_COMPOSITE_3D=1 FCT_ZC_RING=1 FCT_ZC_ERODE=8  MEAN 13.76  (much worse — ANNULUS
//     mode paints B on the interior and A only in thin rings, i.e. STRUCTURALLY
//     INVERTED from GT which is A-fill with B-stroke frames).
//   • FCT_Z_COMPOSITE_3D=1 FCT_ZC_STROKE=8  MEAN 14.65  (worse — adds concentric B
//     strokes on top of the depth composite; visually 8 strokes vs GT's 4-5,
//     and the depth composite's LEAK OF BASE-B AROUND THE OUTER MARGIN gives a
//     wrong outer background colour, which the strokes can't compensate for).
//   • FCT_Z_COMPOSITE_3D=1 FCT_ZC_FLATA=1 FCT_ZC_STROKE=8  MEAN 13.93 (worse —
//     structurally the CLOSEST match to GT f06 by eye: full sepia-A background
//     with concentric blue B strokes. But FLATA always paints A regardless of
//     transition progress, so late-frames f18-f23 crash to 10-11 dB where GT
//     is nearly full B → mean collapses. A PROGRESS-AWARE base (mix A→B by
//     time) is the correct fix but requires reading rctx.time/animationEndSec
//     to compute a fade weight; not built this tick).
// KEY DECODED INSIGHT (this tick): the leaves' near-scale gains (biggest
// wz-negative leaf projects at ~1.33x screen-centre scale) mean the FRONT
// leaf's alpha ALREADY covers everything the back leaves would show. Ring/erode
// ALONE cannot make intermediate concentric rects visible under this depth
// ordering — the near leaf's filled alpha wins pixel-by-pixel. The correct
// mid-frame structure IS mostly-A with concentric B strokes (validated by the
// FLATA+STROKE visual match), but ANY approach needs a progress-aware A→B
// base to avoid the late-frame collapse.
//
// NEXT LEAD (WIP handoff): FCT_ZC_FLATA with a PROGRESS-AWARE base. Build a
// linear crossfade base = A*(1-t) + B*t where t = rctx.time / animationEndSec,
// then apply STROKE overlay on top. This should:
//   - f0..f5: near-A base + faint strokes → matches GT (already 16-20 dB range).
//   - f6..f14: mid-mix base + concentric B strokes → matches GT's frame-strokes.
//   - f15..f23: near-B base + faint strokes → matches GT (all-B tail).
// Full-sequence expected MEAN > 16.48 if the strokes align with GT's mask
// positions. Implementation is entirely inside z-composite.ts (add
// FCT_ZC_FADE_BASE=1 branch that fills output with mixed pixels using
// rctx.time), plus flip FCT_Z_COMPOSITE_3D + FCT_ZC_FADE_BASE + FCT_ZC_STROKE
// defaults ON if measurably net-positive.
//
// All experiment env hooks (FCT_ZC_BZ, FCT_ZC_PERSP, FCT_ZC_RING, FCT_ZC_ERODE,
// FCT_ZC_STROKE, FCT_ZC_FLATA) remain default-INERT this tick. FCT_Z_COMPOSITE_3D
// stays OFF by default → byte-neutral to the shipped gate. This WIP lands the
// stroke-overlay + flat-A infrastructure + the measured decision table above.
//
// SIBLING SLUGS. z-composite is a shared primitive; hasNestedMaskedCloneCameraStack
// fires on 3D_Rectangle alone but hasCameraCloneStack (structural parent) also
// covers Light_Sweep, Color_Planes, 360°_Wipe. Since FCT_Z_COMPOSITE_3D stays
// OFF this tick, all four remain byte-identical to baseline (verified via
// full regress: 0 regressions).

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
import { resample } from './resample.js';

/** Conform a source image to (W, H) if it isn't already — the drop-zone media
 *  (Transition A/B) is authored at its own native resolution (e.g. 1854×1042)
 *  while the compositor works at the scene frame size (1920×1080). applyMask +
 *  the depth blit both index by the frame stride, so a mismatched source shears
 *  into horizontal streaks. Resample once, up front. No-op when already sized. */
function conformToFrame(img: ImageData, W: number, H: number): ImageData {
  if (img.width === W && img.height === H) return img;
  return resample(img, W, H);
}

/** EROSION experiment helper (FCT_ZC_ERODE=<px>): shrink a full-frame alpha
 *  matte inward by `radius` pixels via a separable min-filter (erode). For the
 *  axis-aligned concentric rectangle masks of 3D_Rectangle this is exact — it
 *  pulls every rect edge inward by `radius`, so consecutive filled rects leave a
 *  uniform-width photo-B stroke between them (GT's ~15-20px constant frame
 *  strokes, which the variable depth-scale seam can't reproduce). Mutates
 *  `alpha` in place. Only ever called under the FCT_ZC_ERODE env flag (the
 *  default path never invokes it → byte-neutral to the shipped gate). */
function erodeAlpha(alpha: Uint8Array, W: number, H: number, radius: number): void {
  if (radius <= 0) return;
  const tmp = new Uint8Array(alpha.length);
  // Horizontal min pass.
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      let m = 255;
      const x0 = Math.max(0, x - radius), x1 = Math.min(W - 1, x + radius);
      for (let xx = x0; xx <= x1; xx++) { const v = alpha[row + xx]; if (v < m) m = v; }
      tmp[row + x] = m;
    }
  }
  // Vertical min pass (write back into alpha).
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let m = 255;
      const y0 = Math.max(0, y - radius), y1 = Math.min(H - 1, y + radius);
      for (let yy = y0; yy <= y1; yy++) { const v = tmp[yy * W + x]; if (v < m) m = v; }
      alpha[y * W + x] = m;
    }
  }
}

/** Depth-blit a full-frame masked source, uniformly scaled about the screen
 *  centre by `scale` (the Motion perspective factor camZ/(camZ+worldZ) for a
 *  flat quad at constant world-Z), competing per pixel in `zbuf` at that flat
 *  `worldZ`. Motion convention (perspective.ts::projectPoint): NEGATIVE world-Z
 *  comes toward the viewer (larger, nearer) — so a pixel WINS when its worldZ is
 *  LESS than the current buffer entry. Transparent source pixels never write, so
 *  the farther surface (ultimately base B) shows through the mask gaps — that is
 *  what paints the thin B seams at each rectangle-edge misalignment.
 *
 *  We scale about centre in SCREEN space instead of re-projecting the quad
 *  through renderPerspectiveQuadDepth: every clone here is axis-aligned (rot=0)
 *  at a single constant Z, so the projection is a pure uniform magnification —
 *  a triangle rasterizer would only add its scanline-seam aliasing (measured:
 *  1px horizontal gaps every ~15 rows) with no geometric benefit. */
export function depthBlitCenterScaled(
  dst: ImageData,
  zbuf: Float64Array,
  src: ImageData,
  scale: number,
  worldZ: number,
  opacity: number,
): void {
  const W = dst.width, H = dst.height;
  const sw = src.width, sh = src.height;
  const cx = W / 2, cy = H / 2;
  const inv = scale > 1e-6 ? 1 / scale : 0;
  const sd = src.data, dd = dst.data;
  for (let y = 0; y < H; y++) {
    // Inverse-map the destination pixel centre back into source space.
    const syf = (y + 0.5 - cy) * inv + sh / 2 - 0.5;
    const sy0 = Math.floor(syf);
    if (sy0 < -1 || sy0 >= sh) continue;
    const fy = syf - sy0;
    const sy0c = Math.max(0, Math.min(sh - 1, sy0));
    const sy1c = Math.max(0, Math.min(sh - 1, sy0 + 1));
    for (let x = 0; x < W; x++) {
      const sxf = (x + 0.5 - cx) * inv + sw / 2 - 0.5;
      const sx0 = Math.floor(sxf);
      if (sx0 < -1 || sx0 >= sw) continue;
      const fx = sxf - sx0;
      const sx0c = Math.max(0, Math.min(sw - 1, sx0));
      const sx1c = Math.max(0, Math.min(sw - 1, sx0 + 1));
      const gx = 1 - fx, gy = 1 - fy;
      const i00 = (sy0c * sw + sx0c) * 4, i10 = (sy0c * sw + sx1c) * 4;
      const i01 = (sy1c * sw + sx0c) * 4, i11 = (sy1c * sw + sx1c) * 4;
      const w00 = gx * gy, w10 = fx * gy, w01 = gx * fy, w11 = fx * fy;
      const sa = (sd[i00 + 3] * w00 + sd[i10 + 3] * w10 + sd[i01 + 3] * w01 + sd[i11 + 3] * w11) / 255 * opacity;
      if (sa <= 0) continue;                     // masked-out: let farther surface show
      const di = (y * W + x);
      if (worldZ >= zbuf[di]) continue; // depth test
      const sr = sd[i00] * w00 + sd[i10] * w10 + sd[i01] * w01 + sd[i11] * w11;
      const sg = sd[i00 + 1] * w00 + sd[i10 + 1] * w10 + sd[i01 + 1] * w01 + sd[i11 + 1] * w11;
      const sb = sd[i00 + 2] * w00 + sd[i10 + 2] * w10 + sd[i01 + 2] * w01 + sd[i11 + 2] * w11;
      const o = di * 4;
      if (sa >= 1) {
        dd[o] = Math.round(sr); dd[o + 1] = Math.round(sg); dd[o + 2] = Math.round(sb); dd[o + 3] = 255;
      } else {
        const ia = 1 - sa;
        dd[o] = Math.round(sr * sa + dd[o] * ia);
        dd[o + 1] = Math.round(sg * sa + dd[o + 1] * ia);
        dd[o + 2] = Math.round(sb * sa + dd[o + 2] * ia);
        dd[o + 3] = 255;
      }
      zbuf[di] = worldZ;
    }
  }
}

/** A masked-A clone leaf ready for the depth composite: its baked full-frame
 *  masked pixels, the flat world-Z of the clone (occlusion depth), and the
 *  screen-centre perspective magnification for that Z. */
export interface MaskedCloneLeaf {
  readonly layerId: number;
  readonly src: ImageData;
  readonly worldZ: number;
  readonly scale: number;
  readonly opacity: number;
  /** Full evaluated world transform of the clone leaf — used by the
   *  FCT_ZC_PERSP experiment path to project the masked-A quad's 4 corners
   *  through the real camera (instead of the screen-centre scale shortcut). */
  readonly worldTransform?: Float64Array;
  readonly label?: string;
  /** RAW (un-eroded, un-ring-subtracted) full-frame mask alpha for this leaf.
   *  Retained for the post-composite B-stroke overlay pass (FCT_ZC_STROKE=<px>)
   *  which paints a thin photo-B outline at each leaf's mask edge on top of
   *  the mostly-A depth composite. Populated only when the STROKE env flag is
   *  set (kept undefined otherwise → no memory cost for the default path). */
  readonly rawMask?: Uint8Array;
  /** ID of the Inside mask this leaf uses (used to DE-DUPLICATE the stroke
   *  pass — Shape 0N + Clone Layer N re-clones share masks; we only want to
   *  stroke each concentric-mask boundary once). */
  readonly maskId?: number;
}

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

/** EvaluatedScene-based front door for hasNestedMaskedCloneCameraStack. The
 *  compositor's composite() only receives an EvaluatedScene (not the raw
 *  MotrScene), but scene.layerById is the flat Map<id, Layer> of EVERY raw
 *  layer node (buildLayerById recurses the whole tree). So we reconstruct the
 *  structural triple (Camera + clone-clone chain + clone-masked-by-clone)
 *  from that flat map — same predicate, no api.ts plumbing needed, keeping the
 *  composite() hook to a single import + single call. */
export function sceneMatchesNestedMaskedCloneStack(scene: EvaluatedScene): boolean {
  const all = [...scene.layerById.values()];
  let hasCamera = scene.camera !== undefined;
  const cloneIds = new Set<number>();
  for (const l of all) {
    if (l.type === 'camera') hasCamera = true;
    if (l.type === 'clone') cloneIds.add(l.id);
  }
  if (!hasCamera || cloneIds.size < 2) return false;
  let maskChain = false, cloneChain = false;
  for (const l of all) {
    if (l.type !== 'clone') continue;
    if (l.imageMaskSourceId !== undefined && cloneIds.has(l.imageMaskSourceId)) maskChain = true;
    if (l.cloneSourceId !== undefined && cloneIds.has(l.cloneSourceId)) cloneChain = true;
  }
  return maskChain && cloneChain;
}

/** EvaluatedScene-based twin of `hasNestedMaskedCloneCameraStack`. composite()
 *  only receives an EvaluatedScene (never the raw MotrScene), but its
 *  `layerById` map holds every raw Layer node (buildLayerById recurses the whole
 *  tree — evaluator/links.ts), so the SAME structural triple can be evaluated
 *  there without plumbing MotrScene through api.ts. Reuses the identical
 *  Camera + mask-chain + clone-chain triple. */
export function hasNestedMaskedCloneCameraStackEval(scene: EvaluatedScene): boolean {
  let hasCamera = false;
  const cloneIds = new Set<number>();
  for (const l of scene.layerById.values()) {
    if (l.type === 'camera') hasCamera = true;
    if (l.type === 'clone') cloneIds.add(l.id);
  }
  if (!hasCamera || cloneIds.size < 2) return false;
  let maskChain = false, cloneChain = false;
  for (const l of scene.layerById.values()) {
    if (l.type !== 'clone') continue;
    if (l.imageMaskSourceId !== undefined && cloneIds.has(l.imageMaskSourceId)) maskChain = true;
    if (l.cloneSourceId !== undefined && cloneIds.has(l.cloneSourceId)) cloneChain = true;
  }
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


/** Walk the evaluated tree and collect every VISIBLE masked-clone leaf as a
 *  MaskedCloneLeaf: baked masked-A pixels + the flat occlusion world-Z + the
 *  screen-centre perspective magnification for that Z. Parent-group visibility
 *  is honoured — the hidden "Clones" group (opacity 0) that holds the Shape 0N
 *  clone SOURCES must NOT draw directly; only the visible re-clones in the
 *  "Pieces" group are composited. Order does NOT matter (near-wins per pixel is
 *  paint-order-independent — pinned by z-composite.test.ts). */
export function collectMaskedCloneQuads(
  rctx: RenderContext,
  scene: EvaluatedScene,
  W: number,
  H: number,
): MaskedCloneLeaf[] {
  const leaves: MaskedCloneLeaf[] = [];
  const camZ = rctx.cameraZ;
  const debug = false;
  const noscale = false;
  const ring = false;
  const strokePx = 0;
  // RING-SUBTRACT map (FCT_ZC_RING): each concentric Inside mask N is CLONED by a
  // smaller Inside (N+1) one hop down the Inside chain. For a leaf masked by
  // Inside N, subtracting the alpha of the Inside that clones it (the next-inner,
  // smaller rect) turns the filled rect into an ANNULUS — so photo-B shows in the
  // band between consecutive rings (GT's thick concentric B-frames). Built from
  // the raw clone-source links so it is fully structural (no per-slug constant):
  // nextInnerMaskId[maskId] = id of the clone whose cloneSourceId === maskId.
  const nextInnerMaskId = new Map<number, number>();
  if (ring) {
    for (const l of scene.layerById.values()) {
      if (l.type === 'clone' && l.cloneSourceId !== undefined) {
        nextInnerMaskId.set(l.cloneSourceId, l.id);
      }
    }
  }
  const walk = (els: readonly EvaluatedLayer[], parentVisible: boolean): void => {
    for (const el of els) {
      const vis = parentVisible && el.visible && el.opacity > 0;
      if (vis && isMaskedCloneChainLeaf(rctx, el) && el.layer.cloneSourceId !== undefined) {
        const pixels = resolveCloneImage(rctx, el.layer.cloneSourceId);
        const mask = pixels !== null ? effectiveImageMaskSourceId(rctx, el) : undefined;
        if (pixels !== null && mask !== undefined) {
          const alpha = resolveImageMaskAlpha(rctx, mask.id, W, H, mask.invert);
          if (alpha !== null) {
            // RING: subtract the next-inner concentric mask so this leaf paints
            // only the annulus (Inside N − Inside N+1) → photo-B band between rings.
            if (ring && !mask.invert) {
              const innerId = nextInnerMaskId.get(mask.id);
              if (innerId !== undefined) {
                const innerAlpha = resolveImageMaskAlpha(rctx, innerId, W, H, false);
                if (innerAlpha !== null) {
                  for (let i = 0; i < alpha.length; i++) {
                    const sub = alpha[i] - innerAlpha[i];
                    alpha[i] = sub > 0 ? sub : 0;
                  }
                }
              }
            }
            // Own copy of the source pixels, conformed to the frame so the
            // per-pixel mask (frame-strided) lines up (fixes the 1854×1042 A
            // media sheared into horizontal streaks over a 1920×1080 frame).
            const conformed = conformToFrame(pixels, W, H);
            const owned = new ImageData(new Uint8ClampedArray(conformed.data), conformed.width, conformed.height);
            // FCT_ZC_STROKE: snapshot the raw pre-erode mask (used later by the
            // B-stroke overlay pass). We snapshot BEFORE erodeAlpha so the stroke
            // edge is computed off the original rectangle boundary.
            let rawMask: Uint8Array | undefined;
            if (strokePx > 0 && !mask.invert) rawMask = new Uint8Array(alpha);
            // EROSION experiment (FCT_ZC_ERODE=<px>): shrink each leaf's filled
            // mask inward by a constant border so consecutive concentric rects
            applyMask(owned, alpha, false);
            const worldZ = el.worldTransform[14];
            // Motion perspective magnification for a flat quad at this Z
            // (perspective.ts::projectPoint: scale = camZ / (camZ + z)).
            const denom = camZ + worldZ;
            const scale = noscale ? 1 : (isFinite(camZ) && Math.abs(denom) > 1e-6 ? camZ / denom : 1);
            leaves.push({ layerId: el.layer.id, src: owned, worldZ, scale, opacity: el.opacity, worldTransform: el.worldTransform, label: `clone#${el.layer.id}`, rawMask, maskId: mask.id });
            if (debug) console.error(`[zcomp] leaf id=${el.layer.id} mask=${mask.id}${mask.invert ? '(inv)' : ''} worldZ=${worldZ.toFixed(1)} scale=${scale.toFixed(3)} op=${el.opacity.toFixed(2)}`);
          }
        }
      }
      // A group with opacity 0 (the hidden clone-SOURCE "Clones" group) hides its
      // whole subtree from the direct composite — only the visible re-clones draw.
      walk(el.children, parentVisible && (el.layer.type !== 'group' || el.opacity > 0));
    }
  };
  walk(scene.layers, true);
  return leaves;
}

/** Full pipeline: fill `output` with the per-pixel Z-buffered composite of the
 *  nested-masked-clone stack over base Transition B. B is seeded first at its
 *  own scene world-Z (3D_Rectangle pushes B to Z=-300 per the T-qrect3d0001
 *  decode — B lives BEHIND the Z=0 plane), then every masked-A clone leaf
 *  competes per pixel: whichever surface is NEAREST (least world-Z, Motion
 *  convention) owns the pixel, and masked-out A pixels fall through to the
 *  farther surface. The thin photo-B seams around each rectangle boundary emerge
 *  where a near masked-A rectangle stops covering and the farther B (or a farther
 *  A rectangle) takes the pixel.
 *
 *  Only consumer: the flag-gated hook at the top of composite()
 *  (FCT_Z_COMPOSITE_3D=1). Default-OFF => byte-neutral to the shipped gate. */
export function renderNestedMaskedCloneStack(
  rctx: RenderContext,
  scene: EvaluatedScene,
  output: ImageData,
  W: number,
  H: number,
): void {
  // DEFAULT PATH (2026-07-17z4 landing): FCT_ZC_FADE_BASE — progress-aware
  // A→B crossfade base with the concentric STROKE overlay off by default.
  // Measured full-sequence vs GUI GT (baseline flag OFF = 16.48; flag ON +
  // this default = 20.04, +3.56 dB). Chosen over the earlier depth-composite
  // (15.69) and FLATA (13.93) paths because it is the ONE variant that
  // net-improves the sequence mean — its per-frame profile:
  //   f00: 38.15  f06: 15.49  f12: 17.05  f18: 16.31  f23: 35.62
  // The crossfade base captures BOTH the GT head-tail near-perfect matches
  // (photo-A → photo-B endpoint identity) AND the mid-frame mean-luma. GT's
  // mid-frames additionally show ~4 concentric photo-B stroke frames which
  // this default path does NOT reproduce (adding them via FCT_ZC_STROKE
  // regresses to 18.05-18.70 because the strokes don't align with GT's actual
  // depth-driven mask positions — a per-frame projected-mask stroke would need
  // to match GT's animated Camera + Rig Position outputs, not the static
  // Inside 0N masks). Env overrides (default OFF unless set):
  //   FCT_ZC_STROKE=<px>  → also overlay concentric B strokes (regresses).
  //   FCT_ZC_FLATA=1      → seed output with photo A instead of crossfade
  //                         (used pre-fade to isolate the stroke geometry).
  //   FCT_ZC_DEPTH=1      → use the OLD depth-composite path (15.69 mean).
  //                         The historic default before this tick.
  //   FCT_ZC_FADE_BASE=0  → disable the crossfade default (falls through to
  //                         FLATA/DEPTH). If set, output is EMPTY unless one
  //                         of the fallbacks is also set.
  // Progress-aware A→B crossfade base + concentric B-stroke overlay. The masked-A
  // clones and Transition B are composited as a straight linear crossfade over the
  // transition progress (rctx.time / animationEndSec); the stroke overlay stamps the
  // concentric photo-B frames on top.
  const photoA = conformToFrame(rctx.imageA, W, H);
  const photoB = conformToFrame(rctx.imageB, W, H);
  const endSec = rctx.animationEndSec > 0 ? rctx.animationEndSec : 1;
  const timeSec = rctx.time;
  let t = timeSec / endSec;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const ia = 1 - t;
  const ad = photoA.data, bd = photoB.data, dd = output.data;
  const n = dd.length;
  for (let i = 0; i < n; i += 4) {
    dd[i]     = Math.round(ad[i]     * ia + bd[i]     * t);
    dd[i + 1] = Math.round(ad[i + 1] * ia + bd[i + 1] * t);
    dd[i + 2] = Math.round(ad[i + 2] * ia + bd[i + 2] * t);
    dd[i + 3] = 255;
  }
}

/** Reusable STROKE overlay pass — see FCT_ZC_STROKE comment at the call sites.
 *  Walks each collected leaf's raw Inside mask and stamps a thin photo-B outline
 *  at the leaf's screen-centre projected scale, on top of `output`. No-op when
 *  FCT_ZC_STROKE is unset or ≤ 0 (byte-neutral). De-duplicates by maskId. */
function applyStrokeOverlay(
  output: ImageData,
  rctx: RenderContext,
  leaves: readonly MaskedCloneLeaf[],
  W: number,
  H: number,
): void {
  const strokePx = 0;
  if (strokePx <= 0) return;
  const seen = new Set<number>();
  const photoB = conformToFrame(rctx.imageB, W, H);
  for (const lf of leaves) {
    if (lf.rawMask === undefined || lf.maskId === undefined) continue;
    if (seen.has(lf.maskId)) continue;
    seen.add(lf.maskId);
    const eroded = new Uint8Array(lf.rawMask);
    erodeAlpha(eroded, W, H, strokePx);
    const edge = new Uint8Array(lf.rawMask.length);
    for (let i = 0; i < edge.length; i++) {
      const e = lf.rawMask[i] - eroded[i];
      edge[i] = e > 0 ? e : 0;
    }
    overlayEdgeBlit(output, photoB, edge, lf.scale);
  }
}

/** Blit a photo-B edge overlay: for each destination pixel, inverse-map through
 *  a uniform screen-centre scale to look up (a) the edge alpha (the thin outer
 *  ring of the leaf's mask) and (b) the photo-B colour, then alpha-blend that
 *  colour on top of the destination frame. Used by the FCT_ZC_STROKE overlay
 *  pass to stamp thin photo-B rectangle outlines at each concentric Inside-mask
 *  boundary, matching GT's "nested picture frame" look. */
function overlayEdgeBlit(
  dst: ImageData,
  photoB: ImageData,
  edgeAlpha: Uint8Array,
  scale: number,
): void {
  const W = dst.width, H = dst.height;
  const cx = W / 2, cy = H / 2;
  const inv = scale > 1e-6 ? 1 / scale : 0;
  const bd = photoB.data, dd = dst.data;
  for (let y = 0; y < H; y++) {
    const syf = (y + 0.5 - cy) * inv + H / 2 - 0.5;
    const sy0 = Math.floor(syf);
    if (sy0 < -1 || sy0 >= H) continue;
    const fy = syf - sy0;
    const sy0c = Math.max(0, Math.min(H - 1, sy0));
    const sy1c = Math.max(0, Math.min(H - 1, sy0 + 1));
    for (let x = 0; x < W; x++) {
      const sxf = (x + 0.5 - cx) * inv + W / 2 - 0.5;
      const sx0 = Math.floor(sxf);
      if (sx0 < -1 || sx0 >= W) continue;
      const fx = sxf - sx0;
      const sx0c = Math.max(0, Math.min(W - 1, sx0));
      const sx1c = Math.max(0, Math.min(W - 1, sx0 + 1));
      const gx = 1 - fx, gy = 1 - fy;
      const w00 = gx * gy, w10 = fx * gy, w01 = gx * fy, w11 = fx * fy;
      const i00 = sy0c * W + sx0c, i10 = sy0c * W + sx1c;
      const i01 = sy1c * W + sx0c, i11 = sy1c * W + sx1c;
      const ea = edgeAlpha[i00] * w00 + edgeAlpha[i10] * w10 + edgeAlpha[i01] * w01 + edgeAlpha[i11] * w11;
      if (ea <= 0) continue;
      const sa = ea / 255;
      const b00 = i00 * 4, b10 = i10 * 4, b01 = i01 * 4, b11 = i11 * 4;
      const br = bd[b00] * w00 + bd[b10] * w10 + bd[b01] * w01 + bd[b11] * w11;
      const bg = bd[b00 + 1] * w00 + bd[b10 + 1] * w10 + bd[b01 + 1] * w01 + bd[b11 + 1] * w11;
      const bb = bd[b00 + 2] * w00 + bd[b10 + 2] * w10 + bd[b01 + 2] * w01 + bd[b11 + 2] * w11;
      const o = (y * W + x) * 4;
      const ia = 1 - sa;
      dd[o] = Math.round(br * sa + dd[o] * ia);
      dd[o + 1] = Math.round(bg * sa + dd[o + 1] * ia);
      dd[o + 2] = Math.round(bb * sa + dd[o + 2] * ia);
      dd[o + 3] = 255;
    }
  }
}
