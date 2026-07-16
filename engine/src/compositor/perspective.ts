/**
 * 3D perspective projection for layer rendering.
 *
 * Used by transitions with 3D rotation (Fall, Flip, Doorway, Cube, Page Curl, etc.).
 * Projects a textured quad through a perspective camera and rasterizes it.
 *
 * Motion's default camera: perpendicular view with a focal length such that
 * content at Z=0 renders 1:1. Objects with Z≠0 or 3D rotation get perspective foreshortening.
 */

/** Default perspective distance (Motion's reference camera). */
const DEFAULT_CAMERA_Z = 2000;

import { isSeparable, blendChannel, luma } from './blend.js';
import type { BlendMode } from '../types.js';

/**
 * Composite a single premultiplied-coverage source pixel onto a straight-alpha
 * destination buffer honoring a blend mode. Mirrors index.ts::compositePixel but
 * lives here to avoid a circular import (index → perspective). Used by the
 * perspective rasterizer so Z-projected layers (e.g. Color Planes' additively
 * blended RGB channel clones) blend correctly, not just source-over.
 */
function blendPixel(
  data: Uint8ClampedArray,
  di: number,
  sr: number, sg: number, sb: number,
  sa: number,
  mode: BlendMode
): void {
  const db = data[di + 3] / 255;
  if (mode === 'stencilAlpha' || mode === 'stencilLuma' ||
      mode === 'silhouetteAlpha' || mode === 'silhouetteLuma') {
    let key: number;
    if (mode === 'stencilAlpha' || mode === 'silhouetteAlpha') key = sa;
    else key = (luma(sr, sg, sb) / 255) * sa;
    const isSil = mode === 'silhouetteAlpha' || mode === 'silhouetteLuma';
    const factor = isSil ? (1 - key) : key;
    data[di + 3] = Math.round(db * factor * 255);
    return;
  }
  if (isSeparable(mode)) {
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
  const outA = sa + db * (1 - sa);
  if (outA <= 0) return;
  data[di]     = Math.round((sr * sa + data[di]     * db * (1 - sa)) / outA);
  data[di + 1] = Math.round((sg * sa + data[di + 1] * db * (1 - sa)) / outA);
  data[di + 2] = Math.round((sb * sa + data[di + 2] * db * (1 - sa)) / outA);
  data[di + 3] = Math.round(outA * 255);
}

/** Public — the reference camera distance used across the compositor. Exposed
 * so downstream depth-composite paths (e.g. the two-sided-card / 3D_Rectangle
 * z-buffer builds) can translate a per-pixel projective scale back to world-Z.
 */
export const CAMERA_Z_DEFAULT = DEFAULT_CAMERA_Z;

/**
 * Project a 3D point (in Motion centered coords) to 2D screen coords with perspective.
 * @param x, y, z - 3D point (centered, Y-up, Z toward viewer)
 * @param cameraZ - Camera distance from Z=0 plane
 * @returns [screenX, screenY, perspectiveScale]
 */
export function projectPoint(x: number, y: number, z: number, cameraZ: number = DEFAULT_CAMERA_Z): [number, number, number] {
  // Orthographic camera (camera-less 3D scene: Motion's default LiCameraModel==1,
  // AOV≈0 → parallel projection). cameraZ === Infinity signals no foreshortening.
  if (!isFinite(cameraZ)) return [x, y, 1];
  // Perspective divide. Motion's convention (verified against headless GT): a point with
  // positive world-z has been rotated AWAY from the viewer and recedes (appears smaller);
  // negative z comes toward the viewer (appears larger).
  const denom = cameraZ + z;
  const scale = denom !== 0 ? cameraZ / denom : 1;
  return [x * scale, y * scale, scale];
}

/**
 * Transform and project the 4 corners of a source image quad.
 * @param worldTransform - 4x4 world transform matrix
 * @param srcWidth, srcHeight - source image dimensions
 * @param cameraZ - camera distance
 * @returns 4 projected screen-space corners [topLeft, topRight, bottomRight, bottomLeft], each [x, y, w]
 */
export function projectQuad(
  worldTransform: Float64Array,
  srcWidth: number,
  srcHeight: number,
  cameraZ: number = DEFAULT_CAMERA_Z
): Array<[number, number, number]> {
  const hw = srcWidth / 2;
  const hh = srcHeight / 2;

  // Source corners in centered local coords (Y-DOWN, matching blitTransformed:
  // the world transform is authored so +Y moves content down / Motion Y=-540 → top).
  const corners: Array<[number, number, number]> = [
    [-hw, -hh, 0],  // top-left
    [hw, -hh, 0],   // top-right
    [hw, hh, 0],    // bottom-right
    [-hw, hh, 0],   // bottom-left
  ];

  const projected: Array<[number, number, number]> = [];
  for (const [lx, ly, lz] of corners) {
    // Apply full 4x4 transform (with Z)
    const wx = worldTransform[0] * lx + worldTransform[4] * ly + worldTransform[8] * lz + worldTransform[12];
    const wy = worldTransform[1] * lx + worldTransform[5] * ly + worldTransform[9] * lz + worldTransform[13];
    const wz = worldTransform[2] * lx + worldTransform[6] * ly + worldTransform[10] * lz + worldTransform[14];

    const [sx, sy, w] = projectPoint(wx, wy, wz, cameraZ);
    projected.push([sx, sy, w]);
  }

  return projected;
}

/**
 * PAEFlop page-flip geometry (Movements/Flip).
 *
 * DECOMPILED from `PAEFlop` in Final Cut Pro's InternalFiltersXPC Filters.bundle
 * (arm64 `-[PAEFlop canThrowRenderOutput:withInput:withInfo:]` @ 0x2d6e0). The
 * filter itself is only a MIRROR: it builds a diagonal 4x4 from the "Flop" menu
 * param (parmId 1) via `mask = 6 >> Flop`:
 *   Flop=0 → diag(-1, 1,1,1)  (mirror X)
 *   Flop=1 → diag( 1,-1,1,1)  (mirror Y)
 *   Flop=2 → diag(-1,-1,1,1)  (180°)
 * and composes it centered in pixel space:
 *   heliumXForm( pixelXform · FlipMatrix · invPixelXform )
 * (verified: the two 16-byte __const vectors at 0x2697e0=(-1,-0) and
 * 0x2697f0=(-0,-1) select which diagonal entry becomes negative). The Flip.motr
 * uses Flop=0 → a horizontal mirror of the BACK page so it reads correctly once
 * the group has rotated 180°.
 *
 * The actual *page-flip* motion is produced by the template rig, not the filter:
 * the Group (parent of Transition A + Transition B) has a Ramp driving Rotation Y
 * 0→π (linear, curvature 0 — confirmed: 45°@p=.25, 90°@.5, 180°@1). To reproduce
 * FCP's book-page look each page must hinge on its OUTER vertical edge (A on the
 * LEFT edge, B on the RIGHT edge) rather than sharing the group's centre axis —
 * verified against the headless GT (A's left edge stays pinned at the left border
 * while its right edge recedes; B's right edge stays pinned at the right border
 * while its left edge swings forward).
 *
 * Renders a source quad rotated about its CENTRE vertical (Y) axis by `angle`
 * radians through the shared perspective camera (verified against the headless GT
 * column-height profiles: at θ=31° the near edge enlarges past the border while
 * the far edge recedes inward to screen x≈0.84; at θ≈90° the page collapses to a
 * sliver at screen centre). Optionally mirrored horizontally — the page's reverse
 * side, which PAEFlop (Flop=0) flips so it reads correctly past edge-on. Uses the
 * same centered, Y-down local-corner convention as projectQuad.
 */
export function renderPageFlip(
  dst: ImageData,
  src: ImageData,
  angle: number,
  opacity: number,
  cameraZ: number = DEFAULT_CAMERA_Z,
  mirrorUV: boolean = false,
): void {
  const hw = src.width / 2;
  const hh = src.height / 2;
  const c = Math.cos(angle), s = Math.sin(angle);
  // Centered, Y-down corners (matching projectQuad): TL, TR, BR, BL.
  const local: Array<[number, number]> = [
    [-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh],
  ];
  // Rotate each corner about the centre vertical axis. z' = x·sinθ: the LEFT edge
  // (x<0) goes −Z (toward the viewer, enlarged) and the RIGHT edge (x>0) recedes
  // (+Z) — this sign matches the headless GT (eng-vs-GT PSNR beats eng-vs-mirror).
  // For θ>90° the page has flipped past edge-on (x·cosθ < 0) so its reverse side
  // faces the camera; PAEFlop (Flop=0) horizontally mirrors that reverse so the
  // content still reads correctly — reproduced by reversing the UV left↔right.
  const corners: Array<[number, number, number]> = local.map(([x, y]) =>
    projectPoint(x * c, y, x * s, cameraZ),
  );
  if (mirrorUV) {
    const [TL, TR, BR, BL] = corners;
    renderPerspectiveQuad(dst, src, [TR, TL, BL, BR], opacity);
  } else {
    renderPerspectiveQuad(dst, src, corners, opacity);
  }
}


/**
 * Check if a transform requires 3D perspective rendering (has Z components).
 */
export function needsPerspective(worldTransform: Float64Array): boolean {
  // Check for non-trivial Z-axis components in the rotation part
  // (columns 2 = Z basis vector; if it's not [0,0,1], there's 3D rotation)
  const m2 = worldTransform[2], m6 = worldTransform[6], m8 = worldTransform[8], m9 = worldTransform[9];
  const m14 = worldTransform[14]; // Z translation
  const eps = 1e-6;
  return Math.abs(m2) > eps || Math.abs(m6) > eps || Math.abs(m8) > eps || Math.abs(m9) > eps || Math.abs(m14) > eps;
}

/**
 * Render a textured quad with perspective-correct interpolation.
 * Uses the projected corners and samples the source texture per output pixel.
 *
 * @param dst - Destination ImageData
 * @param src - Source ImageData (texture)
 * @param corners - 4 projected screen corners [TL, TR, BR, BL], each [x, y, w] (centered coords)
 * @param opacity - Layer opacity 0-1
 */
export function renderPerspectiveQuad(
  dst: ImageData,
  src: ImageData,
  corners: Array<[number, number, number]>,
  opacity: number,
  blendMode: BlendMode = 'normal'
): void {
  const dw = dst.width, dh = dst.height;
  const sw = src.width, sh = src.height;

  // Convert projected corners from centered coords to pixel coords
  // Y-DOWN screen convention, consistent with blitTransformed (Motion Y=-540 → top edge).
  const pts = corners.map(([x, y, w]) => [x + dw / 2, dh / 2 + y, w] as [number, number, number]);

  // Bounding box of the quad
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [px, py] of pts) {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  }
  const x0 = Math.max(0, Math.floor(minX)), x1 = Math.min(dw - 1, Math.ceil(maxX));
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(dh - 1, Math.ceil(maxY));

  // The quad has UV coords: TL=(0,0), TR=(1,0), BR=(1,1), BL=(0,1)
  // We rasterize using two triangles with perspective-correct barycentric interpolation.
  const [TL, TR, BR, BL] = pts;
  const uvs: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // Two triangles: (TL, TR, BR) and (TL, BR, BL)
  const tris = [
    [0, 1, 2], // TL, TR, BR
    [0, 2, 3], // TL, BR, BL
  ];

  for (const [ia, ib, ic] of tris) {
    rasterizeTriangle(dst, src, pts[ia], pts[ib], pts[ic], uvs[ia], uvs[ib], uvs[ic], opacity, x0, x1, y0, y1, blendMode);
  }
}

/** Rasterize one triangle with perspective-correct texture mapping. */
function rasterizeTriangle(
  dst: ImageData, src: ImageData,
  pa: [number, number, number], pb: [number, number, number], pc: [number, number, number],
  uva: [number, number], uvb: [number, number], uvc: [number, number],
  opacity: number, bx0: number, bx1: number, by0: number, by1: number,
  blendMode: BlendMode = 'normal'
): void {
  const dw = dst.width;
  const sw = src.width, sh = src.height;

  const [ax, ay, aw] = pa, [bx, by, bw] = pb, [cx, cy, cw] = pc;

  // Triangle area (for barycentric coords)
  const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  if (Math.abs(area) < 1e-9) return;
  const invArea = 1 / area;

  // Perspective-correct: divide UV by w, interpolate, then multiply back
  const iwa = 1 / aw, iwb = 1 / bw, iwc = 1 / cw;
  const ua = uva[0] * iwa, va = uva[1] * iwa;
  const ub = uvb[0] * iwb, vb = uvb[1] * iwb;
  const uc = uvc[0] * iwc, vc = uvc[1] * iwc;

  const triMinX = Math.max(bx0, Math.floor(Math.min(ax, bx, cx)));
  const triMaxX = Math.min(bx1, Math.ceil(Math.max(ax, bx, cx)));
  const triMinY = Math.max(by0, Math.floor(Math.min(ay, by, cy)));
  const triMaxY = Math.min(by1, Math.ceil(Math.max(ay, by, cy)));

  for (let y = triMinY; y <= triMaxY; y++) {
    for (let x = triMinX; x <= triMaxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      // Barycentric coords
      const w0 = ((bx - px) * (cy - py) - (cx - px) * (by - py)) * invArea;
      const w1 = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) * invArea;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue; // outside triangle

      // Perspective-correct UV
      const iw = w0 * iwa + w1 * iwb + w2 * iwc;
      const u = (w0 * ua + w1 * ub + w2 * uc) / iw;
      const v = (w0 * va + w1 * vb + w2 * vc) / iw;

      // Sample source texture (bilinear)
      const sx = u * sw - 0.5, sy = v * sh - 0.5;
      const fx = sx - Math.floor(sx), fy = sy - Math.floor(sy);
      const sx0 = Math.max(0, Math.min(sw - 1, Math.floor(sx)));
      const sy0 = Math.max(0, Math.min(sh - 1, Math.floor(sy)));
      const sx1 = Math.min(sw - 1, sx0 + 1), sy1 = Math.min(sh - 1, sy0 + 1);

      const i00 = (sy0 * sw + sx0) * 4, i10 = (sy0 * sw + sx1) * 4;
      const i01 = (sy1 * sw + sx0) * 4, i11 = (sy1 * sw + sx1) * 4;
      // Bilinear weights (hoisted: no per-pixel closure allocation).
      const gx = 1 - fx, gy = 1 - fy;
      const w00b = gx * gy, w10b = fx * gy, w01b = gx * fy, w11b = fx * fy;

      const sr = src.data[i00]   * w00b + src.data[i10]   * w10b + src.data[i01]   * w01b + src.data[i11]   * w11b;
      const sg = src.data[i00+1] * w00b + src.data[i10+1] * w10b + src.data[i01+1] * w01b + src.data[i11+1] * w11b;
      const sb = src.data[i00+2] * w00b + src.data[i10+2] * w10b + src.data[i01+2] * w01b + src.data[i11+2] * w11b;
      const salpha = src.data[i00+3] * w00b + src.data[i10+3] * w10b + src.data[i01+3] * w01b + src.data[i11+3] * w11b;
      const sa = salpha / 255 * opacity;
      if (sa <= 0) continue;

      const dIdx = (y * dw + x) * 4;
      const da = dst.data[dIdx + 3] / 255;
      if (blendMode !== 'normal') {
        // Separable blend (e.g. additive for Color Planes' RGB channel stack).
        blendPixel(dst.data, dIdx, sr, sg, sb, sa, blendMode);
        continue;
      }
      const outA = sa + da * (1 - sa);
      if (outA > 0) {
        dst.data[dIdx]     = Math.round((sr * sa + dst.data[dIdx]     * da * (1 - sa)) / outA);
        dst.data[dIdx + 1] = Math.round((sg * sa + dst.data[dIdx + 1] * da * (1 - sa)) / outA);
        dst.data[dIdx + 2] = Math.round((sb * sa + dst.data[dIdx + 2] * da * (1 - sa)) / outA);
        dst.data[dIdx + 3] = Math.round(outA * 255);
      }
    }
  }
}

// ============================================================================
// PER-PIXEL Z-BUFFERED PERSPECTIVE RASTERIZER
// (shared infrastructure for Movements/Swing + Replicator-Clones/3D_Rectangle
// families — both need per-pixel depth to composite overlapping camera-projected
// quads whose ORDER doesn't uniquely determine visibility.)
// ============================================================================
//
// WHY THIS EXISTS. Painter's-order (draw farthest-to-nearest) only produces the
// correct composite when the quads are FULLY orderable by their world-Z origin —
// i.e. every pixel of quad A is either uniformly closer or uniformly farther than
// every pixel of quad B. Two families in FCP's built-in transitions violate that:
//   • Movements/Swing: two clone children share an anchor with π/2-apart static
//     rotationX (0 vs ±π/2) and rotate together via a parent Ramp. Mid-swing
//     BOTH projected quads span the frame and their surfaces INTERSECT — no
//     single global order paints the two-sided-card reveal correctly.
//   • Replicator-Clones/3D_Rectangle: 27-node nested clone chain of camera-
//     projected masked A-rectangles over a B base; adjacent A quads overlap and
//     leave THIN B seams that only appear when depth is resolved per pixel.
// A whole-quad z-sort (compare origin wz once, paint back-then-front) is the
// measured dead-end for both scenes: 3D_Rectangle net −1.19 (ROADMAP ⛔ block),
// Swing 12.89 → 12.58 on a T-qswing00001 experiment.
//
// DEPTH CONVENTION. `projectPoint(x, y, z, cameraZ) = (x·s, y·s, s)` where
// `s = cameraZ / (cameraZ + wz)` ⇒ `wz = cameraZ · (1/s − 1)`. Motion's rule
// (verified against camera-less Fall + Rotate): SMALLER world-Z = CLOSER to
// camera; positive Z recedes. We interpolate `wz/s` per pixel with the SAME
// perspective-correct trick used for UV: divide by w at each corner, interpolate
// linearly across the triangle, divide by the interpolated `1/s`.
//
// STATUS. Ready to hook. Not yet wired into `renderChildLayers` — the WIRING
// requires the compositor to walk sibling perspective quads under a shared
// Z-buffer, replacing the current single-quad `renderPerspectiveQuad` call at
// `compositor/index.ts::renderChildLayers`. Blocked here by cross-agent scope
// (T-qswing00001 is scoped to perspective.ts only; three concurrent agents own
// disjoint regions of `compositor/index.ts`).
//
// SWING DECODE (from Movements/Swing.motr, Anchor widget value=2 → "Top" branch,
// verified with tools/re/read_const style manual XML walk, 2026-07-16):
//   Top-away LAYER: Position=(0,+728.34,0), Anchor=(0,+540,0), Ramp on rotationX
//     0 → +π/2 rad over the transition (behavior id=987619281).
//   Top-away CloneA (id=987619277): Position=(0,+540,0), Anchor=(0,+540,0),
//     Rotation.X = 0    (source = Transition A id=987619205).
//   Top-away CloneB (id=987619279): Position=(0,+540,0), Anchor=(0,+540,0),
//     Rotation.X = -π/2 (source = Transition B id=987619203).
//   Same shape for Bottom/Left/Right branches, mirrored via ±540 pos/anchor.
// Under `M = T(pos)·R·S·T(-anchor)` this puts BOTH clones sharing the BOTTOM
// hinge edge at world (X±540, Y=+540, Z=0), with Clone A face-on (identity when
// R=I) and Clone B tilted 90° X so its back extends INTO the scene at Z=-1080.
// As the Top-away Ramp advances, Clone A rotates AWAY (top-of-source swings
// forward), Clone B rotates INTO face-on. Painter's-order (reverse-list) draws
// Clone A on TOP for the whole transition — the two-clone occlusion bug.
//
// SWING GATE-MEASURED DEAD-ENDS (do NOT re-attempt without new decode):
//   • Naive whole-quad z-sort by CENTRE wz (paint farther-first): 12.89 → 12.58
//     (−0.31 dB). Verified 2026-07-16 with an FCT_SWING_ZORDER=1 experimental
//     path in renderChildLayers.
//   • Per-pixel Z-buffer wiring alone WITHOUT correcting the "Top away" world Y:
//     produces engine panels centred BELOW frame centre (Clone A pixel_y=358..1080,
//     Clone B pixel_y=286..973 at t≈0.94) — but GUI GT wants the reveal centred at
//     TOP (source B fills pixel_y=0..~700 with a black band below). The world
//     transforms are geometrically self-consistent but the OFFSET AXIS does not
//     match the GT reveal — implies the fix needs an evaluator-side Y-inversion
//     OR a rig-column swap for factoryID-16 anchor widgets, both OUT of scope for
//     `perspective.ts`.
//
// WHAT THE Z-BUFFER PATH NEEDS FROM ITS CALLER (compositor/index.ts wiring plan
// once the geometry is settled):
//   1. In `renderChildLayers`, for a group whose visible children are all
//      camera-projected quads with `needsPerspective(worldTransform)==true`
//      (typically clone/image leaves under a 3D-fold parent), allocate a shared
//      `Float64Array(output.width*output.height).fill(Infinity)` z-buffer.
//   2. For each child in ANY order (order becomes irrelevant), compute
//      `cornersWithZ = projectQuadWithWorldZ(child.worldTransform, srcW, srcH, cameraZ)`
//      and call `renderPerspectiveQuadDepth(output, zbuf, src, cornersWithZ, opacity)`.
//   3. Skip the current painter's-order sort branches (concentric, flatStack,
//      reverse-list) since depth is now data-driven per pixel.
// Unit-tested here (perspective.test.ts +2 Swing-specific cases) to pin the
// projection + depth-compare semantics so the upstream tick can consume this
// infrastructure without re-deriving the math.
//
// SWING DECODE (2026-07-16 session, T-qswing00001 revisit). The Movements/Swing
// .motr Top-away branch (Anchor widget default value=2) is a two-clone pair:
//   Clone A: pos=(0,540,0), anchor=(0,540,0), rot=0            → identity at t=0
//   Clone B: pos=(0,540,0), anchor=(0,540,0), rot.X=-π/2 (rad) → 90° edge-on
//   Parent "Top away" LAYER: pos=(0,728.34,0), anchor=(0,540,0)
//   Parent "Top" group: pos=(0,-188,0)  (cancels Top-away's +188 static offset)
//   Ramp on "Top away" rotationX: 0 → +π/2 over transition duration.
// Under engine convention `rotX_deg = -motr_rotX * RAD2DEG`, at t=0 world
// transforms are: Clone A = identity, Clone B = T(0,+540,-540) with rot +90°
// (horizontal "shelf" panel at frame bottom, edge-on).
//
// THE MEASURED DEAD-END (this session confirmed prior WIP finding). Two
// z-composite experiments both regress vs GT:
//   (a) whole-quad centre-Z paint order (12.76 → 12.58, −0.18 dB): sorting by
//       worldTransform[14] puts Clone B on top when its centre is nearer, but
//       both quads' PROJECTED GEOMETRY covers the wrong screen region (both
//       hinge at frame-bottom Y=+540, GT wants hinge in middle/top of frame).
//   (b) per-pixel z-buffer via renderPerspectiveQuadDepth: identical outcome —
//       the DEPTH math is correct, but the GEOMETRY FEEDING the depth pass
//       (which panel occupies which screen pixels) matches the FCP compositor's
//       Y-DOWN interpretation, not the FCP renderer's *visual* result. GT f11
//       shows source B occupying the TOP ~65% of the frame with black at
//       bottom; the engine's decoded geometry puts both clones straddling the
//       BOTTOM half. The mismatch is upstream of perspective.ts — either the
//       evaluator's rotation-sign convention for this specific "Anchor=Top"
//       widget variant, or the interaction between the Top-away layer's
//       Position Y=+728.34 and the parent Top's -188 translation, produces
//       screen-space output rotated about a hinge line that doesn't match FCP's
//       real render (visible ONLY when comparing to GUI GT, not headless).
//
// The wiring FROM the compositor is a small change to `renderChildLayers`
// (compositor/index.ts around L826, adding a two-perspective-siblings order/
// z-buffer path alongside the existing `flatStack`, `concentricRings`, and
// default reverse-list paths). That change is currently gated by the collision
// map (3 concurrent editors of index.ts: Concentric renderCloneLayer, Close_and_
// Open group-mask block, Video_Wall standalone-render). Once index.ts is free,
// the wiring should also address the upstream anchor/rotation decode so the
// underlying geometry matches GT — otherwise even a correct z-buffer will
// score net-negative (both experiments above confirmed on 2026-07-16).


/** Project a quad and also return world-Z per corner. Same order as projectQuad. */
export function projectQuadWithWorldZ(
  worldTransform: Float64Array,
  srcWidth: number,
  srcHeight: number,
  cameraZ: number = DEFAULT_CAMERA_Z
): Array<[number, number, number, number]> {
  const hw = srcWidth / 2;
  const hh = srcHeight / 2;
  const localCorners: Array<[number, number]> = [
    [-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh],
  ];
  const out: Array<[number, number, number, number]> = [];
  for (const [lx, ly] of localCorners) {
    const wx = worldTransform[0] * lx + worldTransform[4] * ly + worldTransform[12];
    const wy = worldTransform[1] * lx + worldTransform[5] * ly + worldTransform[13];
    const wz = worldTransform[2] * lx + worldTransform[6] * ly + worldTransform[14];
    const [sx, sy, s] = projectPoint(wx, wy, wz, cameraZ);
    out.push([sx, sy, s, wz]);
  }
  return out;
}

/** Rasterize ONE clone of a two-sided card into `dst`, updating a shared per-pixel
 * `zbuf` (world-Z; smaller = closer). A pixel is written iff the interpolated
 * world-Z at that pixel is <= the current zbuf entry (Motion's near-wins rule).
 * Same perspective-correct UV interpolation as renderPerspectiveQuad. `zbuf`
 * is Float64Array of length dst.width*dst.height, initialised by the caller
 * (Infinity = "no coverage yet"). Only used for the two-sided-card depth pass. */
export function renderPerspectiveQuadDepth(
  dst: ImageData,
  zbuf: Float64Array,
  src: ImageData,
  cornersWithZ: Array<[number, number, number, number]>,
  opacity: number,
): void {
  const dw = dst.width, dh = dst.height;
  // Screen-pixel corners: same Y-DOWN convention as renderPerspectiveQuad.
  const pts = cornersWithZ.map(([x, y, w, wz]) =>
    [x + dw / 2, dh / 2 + y, w, wz] as [number, number, number, number]);
  const [TL, TR, BR, BL] = pts;
  const uvs: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const tris = [
    [0, 1, 2], // TL, TR, BR
    [0, 2, 3], // TL, BR, BL
  ];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [px, py] of pts) {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  }
  const x0 = Math.max(0, Math.floor(minX)), x1 = Math.min(dw - 1, Math.ceil(maxX));
  const y0 = Math.max(0, Math.floor(minY)), y1 = Math.min(dh - 1, Math.ceil(maxY));
  for (const [ia, ib, ic] of tris) {
    rasterizeDepthTri(dst, zbuf, src,
      pts[ia], pts[ib], pts[ic],
      uvs[ia], uvs[ib], uvs[ic],
      opacity, x0, x1, y0, y1);
  }
}

function rasterizeDepthTri(
  dst: ImageData, zbuf: Float64Array, src: ImageData,
  pa: [number, number, number, number],
  pb: [number, number, number, number],
  pc: [number, number, number, number],
  uva: [number, number], uvb: [number, number], uvc: [number, number],
  opacity: number, bx0: number, bx1: number, by0: number, by1: number,
): void {
  const dw = dst.width;
  const sw = src.width, sh = src.height;
  const [ax, ay, aw, awz] = pa, [bx, by, bw, bwz] = pb, [cx, cy, cw, cwz] = pc;
  const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  if (Math.abs(area) < 1e-9) return;
  const invArea = 1 / area;
  // Perspective-correct: divide (u,v,wz) by w, interpolate, then multiply back by 1/(sum w0/w).
  const iwa = 1 / aw, iwb = 1 / bw, iwc = 1 / cw;
  const ua = uva[0] * iwa, va = uva[1] * iwa;
  const ub = uvb[0] * iwb, vb = uvb[1] * iwb;
  const uc = uvc[0] * iwc, vc = uvc[1] * iwc;
  const za = awz * iwa, zb = bwz * iwb, zc = cwz * iwc;
  const triMinX = Math.max(bx0, Math.floor(Math.min(ax, bx, cx)));
  const triMaxX = Math.min(bx1, Math.ceil(Math.max(ax, bx, cx)));
  const triMinY = Math.max(by0, Math.floor(Math.min(ay, by, cy)));
  const triMaxY = Math.min(by1, Math.ceil(Math.max(ay, by, cy)));
  for (let y = triMinY; y <= triMaxY; y++) {
    for (let x = triMinX; x <= triMaxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((bx - px) * (cy - py) - (cx - px) * (by - py)) * invArea;
      const w1 = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) * invArea;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const iw = w0 * iwa + w1 * iwb + w2 * iwc;
      const invIw = 1 / iw;
      const u = (w0 * ua + w1 * ub + w2 * uc) * invIw;
      const v = (w0 * va + w1 * vb + w2 * vc) * invIw;
      const wz = (w0 * za + w1 * zb + w2 * zc) * invIw;
      // Depth compare: smaller world-Z = closer to camera (Motion convention).
      const zi = y * dw + x;
      if (wz >= zbuf[zi]) continue; // farther than existing coverage: skip
      // Sample source texture (bilinear).
      const sx = u * sw - 0.5, sy = v * sh - 0.5;
      const fx = sx - Math.floor(sx), fy = sy - Math.floor(sy);
      const sx0 = Math.max(0, Math.min(sw - 1, Math.floor(sx)));
      const sy0 = Math.max(0, Math.min(sh - 1, Math.floor(sy)));
      const sx1 = Math.min(sw - 1, sx0 + 1), sy1 = Math.min(sh - 1, sy0 + 1);
      const i00 = (sy0 * sw + sx0) * 4, i10 = (sy0 * sw + sx1) * 4;
      const i01 = (sy1 * sw + sx0) * 4, i11 = (sy1 * sw + sx1) * 4;
      const gx = 1 - fx, gy = 1 - fy;
      const w00b = gx * gy, w10b = fx * gy, w01b = gx * fy, w11b = fx * fy;
      const sr = src.data[i00]   * w00b + src.data[i10]   * w10b + src.data[i01]   * w01b + src.data[i11]   * w11b;
      const sg = src.data[i00+1] * w00b + src.data[i10+1] * w10b + src.data[i01+1] * w01b + src.data[i11+1] * w11b;
      const sb = src.data[i00+2] * w00b + src.data[i10+2] * w10b + src.data[i01+2] * w01b + src.data[i11+2] * w11b;
      const salpha = src.data[i00+3] * w00b + src.data[i10+3] * w10b + src.data[i01+3] * w01b + src.data[i11+3] * w11b;
      const sa = salpha / 255 * opacity;
      if (sa <= 0) continue;
      // Winner: overwrite dst pixel (both clones own their own pixel outputs — no
      // blend, because the DEPTH decides which surface owns the pixel; the loser
      // would leak through if we source-over'd instead).
      const di = zi * 4;
      dst.data[di]     = Math.round(sr);
      dst.data[di + 1] = Math.round(sg);
      dst.data[di + 2] = Math.round(sb);
      dst.data[di + 3] = Math.round(sa * 255);
      zbuf[zi] = wz;
    }
  }
}
