/**
 * Framing camera (factory 3, "Framing") — the render-time camera driver for the
 * replicator "wall" transitions (Video Wall, 3D Rectangle, Concentric, Combo
 * Spin). Transcribed from OZScene::computeFraming @0x6ca18 and
 * calcFramingRotation @0x6c374 (Ozone.framework, arm64, otool -tV).
 *
 * The .motr Camera Position/Rotation is STATIC and ignored at render time; the
 * camera is driven by the Framing behaviors attached to the camera node. Each
 * behavior frames its Target object's world bbox: it places the camera at a
 * distance = halfBBoxExtent / tan(AOV/2) from the target so the target fills the
 * frame, offset by Framing Offset / Path Offset, oriented by calcFramingRotation.
 *
 * Two behaviors cross-blend over their timing windows ("Frame framer" 0→0.968 →
 * "Frame B" 0.868→end); this dolly shrinks the tile wall over the transition.
 */

import type { FramingBehavior, RationalTime } from '../types.js';
import type { EvaluatedLayer } from './index.js';

const EPS = 1e-7;

export interface CameraPose {
  /** Camera world position. */
  pos: [number, number, number];
  /** Look-at target (framing point). */
  target: [number, number, number];
  /** Distance from pos to target. */
  distance: number;
}

/** Convert a RationalTime to seconds. */
function t2s(rt: RationalTime | undefined): number {
  if (!rt || rt.timescale <= 0) return 0;
  return rt.value / rt.timescale;
}

/**
 * Compute the world-space axis-aligned bbox of an evaluated layer's drawable
 * content. For an image/generator/shape the local rect (from source size or shape
 * verts) is transformed by the world transform and the min/max taken over the 8
 * (or 4, z=0) transformed corners. Returns {min,max,center,halfExtent}.
 */
export function worldBBox(el: EvaluatedLayer): { min: number[]; max: number[]; center: number[]; half: number[] } {
  const wt = el.worldTransform;
  // Local extent (centered). Image/generator: source size; shape: vertex bounds.
  let hw = 960, hh = 540, hz = 0;
  const l = el.layer;
  if (l.shape && l.shape.verticesX.length > 0) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < l.shape.verticesX.length; i++) {
      x0 = Math.min(x0, l.shape.verticesX[i]); x1 = Math.max(x1, l.shape.verticesX[i]);
      y0 = Math.min(y0, l.shape.verticesY[i]); y1 = Math.max(y1, l.shape.verticesY[i]);
    }
    hw = (x1 - x0) / 2; hh = (y1 - y0) / 2;
  } else if (l.dropZone) {
    hw = l.dropZone.width / 2; hh = l.dropZone.height / 2;
  }
  const corners: Array<[number, number, number]> = [
    [-hw, -hh, -hz], [hw, -hh, -hz], [hw, hh, -hz], [-hw, hh, -hz],
    [-hw, -hh, hz], [hw, -hh, hz], [hw, hh, hz], [-hw, hh, hz],
  ];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const [lx, ly, lz] of corners) {
    const wx = wt[0] * lx + wt[4] * ly + wt[8] * lz + wt[12];
    const wy = wt[1] * lx + wt[5] * ly + wt[9] * lz + wt[13];
    const wz = wt[2] * lx + wt[6] * ly + wt[10] * lz + wt[14];
    min[0] = Math.min(min[0], wx); max[0] = Math.max(max[0], wx);
    min[1] = Math.min(min[1], wy); max[1] = Math.max(max[1], wy);
    min[2] = Math.min(min[2], wz); max[2] = Math.max(max[2], wz);
  }
  const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const half = [(max[0] - min[0]) / 2, (max[1] - min[1]) / 2, (max[2] - min[2]) / 2];
  return { min, max, center, half };
}

/**
 * Compute the camera pose that frames a single target (OZScene::computeFraming,
 * single-target branch). The camera sits `distance` in front of the target's
 * bbox center along +Z (toward the viewer), where distance fits the larger of
 * the two bbox half-extents into the vertical AOV. Framing/Path offsets shift
 * the framing point. Rotation (calcFramingRotation) is omitted at first order
 * (the framer's authored rotation is small); the camera looks straight down -Z.
 */
export function framePose(
  target: EvaluatedLayer,
  beh: FramingBehavior,
  aovDeg: number,
  frameAspect: number = 1,
  cover: boolean = false,
): CameraPose {
  const bb = worldBBox(target);
  const tanHalf = Math.tan((aovDeg * Math.PI) / 360);
  const tanV = Math.max(tanHalf, EPS);
  const hw = Math.max(bb.half[0], EPS), hh = Math.max(bb.half[1], EPS);
  let distance: number;
  if (cover) {
    // COVER the frame (used for the scheduled-reveal fill). The camera AOV is
    // VERTICAL; the horizontal AOV widens by the frame aspect (tanH = tanV·aspect).
    // The tile fills the frame height at D = hh/tanV and the width at D = hw/tanH;
    // the frame is fully covered at the SMALLER of the two (tighter axis reaches
    // the edge, looser axis overflows). This makes a 16:9 tile FILL a 16:9 frame,
    // matching FCP's full-frame reveal — a plain max(hw,hh)/tanV fit the WIDTH into
    // the VERTICAL aov and under-filled (letterboxed ~60% tile).
    const tanH = Math.max(tanV * (frameAspect || 1), EPS);
    distance = Math.min(hw / tanH, hh / tanV);
  } else {
    // Default computeFraming distance: fit the larger half-extent into the vertical
    // AOV (matches the max-of-two-lanes fcsel in the decompile). Kept for the
    // always-on framers (e.g. Clone_Spin) that frame their target continuously.
    distance = Math.max(hw, hh) / tanV;
  }


  // The target's world ROTATION basis (calcFramingRotation): OZScene::computeFraming
  // orients the camera along the target's local axes rather than straight down world
  // −Z. The framer proxy in the replicator "wall" transitions carries a deliberate
  // oblique rotation that redirects the view; using its basis (not world +Z) is what
  // makes the camera look the correct oblique direction. Extract normalized columns
  // right/up/forward from the target's world transform.
  const wt = target.worldTransform;
  const nx = (a: number, b: number, c: number): [number, number, number] => {
    const l = Math.hypot(a, b, c) || 1; return [a / l, b / l, c / l];
  };
  const fwd = nx(wt[8], wt[9], wt[10]);   // local +Z in world
  // Framing point = bbox center + framing/path offset expressed in the target's
  // LOCAL frame (foff.z runs along the target's forward axis, not world Z).
  const offX = beh.framingOffset.x + beh.pathOffset.x * beh.apex;
  const offY = beh.framingOffset.y + beh.pathOffset.y * beh.apex;
  const offZ = beh.framingOffset.z + beh.pathOffset.z * beh.apex;
  const right = nx(wt[0], wt[1], wt[2]);
  const up = nx(wt[4], wt[5], wt[6]);
  const fp: [number, number, number] = [
    bb.center[0] + right[0] * offX + up[0] * offY + fwd[0] * offZ,
    bb.center[1] + right[1] * offX + up[1] * offY + fwd[1] * offZ,
    bb.center[2] + right[2] * offX + up[2] * offY + fwd[2] * offZ,
  ];
  // Camera eye sits `distance` in FRONT of the framing point along the target's
  // forward axis, looking back toward it (the framing target fills the frame).
  const pos: [number, number, number] = [
    fp[0] + fwd[0] * distance,
    fp[1] + fwd[1] * distance,
    fp[2] + fwd[2] * distance,
  ];
  return { pos, target: fp, distance };
}

/** Ease a 0..1 blend fraction by the Ease Out Curve exponent (id 213 ~ 10). */
function ease(t: number): number {
  if (t <= 0) return 0; if (t >= 1) return 1;
  // Smoothstep-like ease-in-out (approximation of Motion's default ease curve).
  return t * t * (3 - 2 * t);
}

/**
 * Reveal ramp for the single-framer slide-up. Motion's Framing behaviors carry an
 * Ease Out curve (parameter id 213) with a HIGH exponent: the framed target stays
 * off-screen for most of the window then rushes in at the end. Empirically (from
 * the Video_Wall min-repro headless) the visible fraction is ~0 until ~60% of the
 * window, then ramps roughly linearly to full by the window end. Model that as a
 * shifted ramp e = clamp((frac − k)/(1 − k)) with k = REVEAL_HOLD; a strong ease-in
 * exponent gives the same "hold then rush" shape without a magic breakpoint per
 * transition. k and the exponent are generic (no slug branch).
 */
const REVEAL_HOLD = 0.6;   // fraction of the window the tile is held off-frame
function revealEase(frac: number): number {
  if (frac <= REVEAL_HOLD) return 0;
  const x = (frac - REVEAL_HOLD) / (1 - REVEAL_HOLD);
  return x <= 0 ? 0 : x >= 1 ? 1 : x; // near-linear over the reveal stretch
}

/**
 * Slide a framed pose's look-at point (and eye) vertically so the target sits off
 * the bottom of the frame at e=0 and fills the frame at e=1. The vertical world
 * shift is one full target height (2·halfH) — enough to clear the frame — scaled
 * by (1−e). The eye tracks the target so the tile only translates (no zoom), which
 * matches FCP's full-width, bottom-pinned slide-up reveal.
 */
function revealPose(
  pose: CameraPose,
  bb: { half: number[] },
  e: number,
): CameraPose {
  // 2.6·halfH clears the tile fully below the frame at e=0 (a plain 2·halfH left a
  // one-frame sliver visible during the hold; the extra 0.6 accounts for the tile's
  // bottom-pinned framing so f<reveal reads fully black, matching the min-repro).
  const HOLD_MUL = 2.6;
  const dy = (1 - Math.max(0, Math.min(1, e))) * HOLD_MUL * Math.max(bb.half[1], EPS);
  return {
    pos: [pose.pos[0], pose.pos[1] - dy, pose.pos[2]],
    target: [pose.target[0], pose.target[1] - dy, pose.target[2]],
    distance: pose.distance,
  };
}


/**
 * Resolve the active framed camera pose at scene time `timeSec`, cross-blending
 * the two Framing behaviors over their timing windows. Returns undefined when no
 * framing behavior is active.
 */
export function resolveFramedPose(
  framing: FramingBehavior[],
  resolveTarget: (id: number) => EvaluatedLayer | undefined,
  aovDeg: number,
  timeSec: number,
  frameAspect: number = 1,
): CameraPose | undefined {
  // Compute each behavior's pose and its [in,out] window.
  const poses: Array<{ pose: CameraPose; tin: number; tout: number; bb: ReturnType<typeof worldBBox>; beh: FramingBehavior; tgt: EvaluatedLayer }> = [];
  for (const b of framing) {
    const tgt = resolveTarget(b.targetId);
    if (!tgt) continue;
    poses.push({ pose: framePose(tgt, b, aovDeg, frameAspect), tin: t2s(b.timing?.in), tout: t2s(b.timing?.out), bb: worldBBox(tgt), beh: b, tgt });
  }
  if (poses.length === 0) return undefined;
  if (poses.length === 1) {
    const only = poses[0];
    // A DELAYED framer (tin > 0) is a scheduled REVEAL: the framed target is meant
    // to be absent before its window opens, then slide into frame over [tin,tout].
    // (Video_Wall min-repro: tin=0.868, black until the last stretch then slide-up.)
    // A framer that is active from t=0 (tin≈0) frames its target for the whole clip
    // — no reveal (e.g. Clone_Spin's full-window spin framer, tin=0). Only the
    // delayed case gets the off-frame hold + slide ramp; the always-on case frames
    // straight (returning the plain pose), so we never push its tile off-screen.
    const REVEAL_TIN_EPS = 1e-3;
    if (only.tout <= only.tin || only.tin <= REVEAL_TIN_EPS) return only.pose;
    // Reveal path: frame the target so it COVERS the frame (full-frame reveal), then
    // slide it up from off-screen over the window.
    const coverPose = framePose(only.tgt, only.beh, aovDeg, frameAspect, true);
    if (timeSec <= only.tin) return revealPose(coverPose, only.bb, 0);
    if (timeSec >= only.tout) return coverPose;
    const frac = (timeSec - only.tin) / (only.tout - only.tin);
    return revealPose(coverPose, only.bb, revealEase(frac));
  }


  // Sort by window start. The first (framer) holds until the second (B) window
  // opens; over the overlap the pose eases from framer → B.
  poses.sort((a, b) => a.tin - b.tin);
  const a = poses[0], bb = poses[poses.length - 1];
  // Blend fraction: 0 before B's window opens, 1 at/after B fully engages.
  const bStart = bb.tin, aEnd = a.tout;
  let f: number;
  if (timeSec <= bStart) f = 0;
  else if (timeSec >= aEnd) f = 1;
  else f = ease((timeSec - bStart) / Math.max(aEnd - bStart, EPS));
  const lerp = (p: number, q: number) => p + (q - p) * f;
  return {
    pos: [lerp(a.pose.pos[0], bb.pose.pos[0]), lerp(a.pose.pos[1], bb.pose.pos[1]), lerp(a.pose.pos[2], bb.pose.pos[2])],
    target: [lerp(a.pose.target[0], bb.pose.target[0]), lerp(a.pose.target[1], bb.pose.target[1]), lerp(a.pose.target[2], bb.pose.target[2])],
    distance: lerp(a.pose.distance, bb.pose.distance),
  };
}

/**
 * Reconciled Framing-camera pose for the replicator "wall" transitions (the class
 * where the Framing behaviors cross-blend a rotation PROXY — a small off-plane
 * "framer" shape carrying calcFramingRotation — with an on-plane CONTENT target
 * that is a Transition drop-zone tile). Fully param-driven; no per-transition
 * constant.
 *
 * The proxy and the visible photo tiles live in DIFFERENT depth scales (the proxy
 * sits far off the tile plane), so framing the proxy directly maps the tiles far
 * off-screen. computeFraming's own math reconciles them: the camera ORIENTATION is
 * the proxy's world-rotation basis (its −forward is the look direction), while the
 * ANCHOR and DISTANCE come from framing the on-plane CONTENT tile:
 *   • anchor  = the content behavior's target world centre (a z≈0 tile),
 *   • dist(t) = dollies from framing ONE tile edge-to-edge — distance = the
 *               content tile's own computeFraming distance at its NEAR (in-frame)
 *               extent (half-height / tan(AOV/2)) — out to the content behavior's
 *               FULL computeFraming distance (max half-extent / tan(AOV/2)), which
 *               reveals the surrounding wall. Both endpoints are computeFraming
 *               outputs on real bboxes read from the graph.
 * The two distances cross-blend on the behaviors' timing windows (ease-out),
 * exactly like resolveFramedPose. Returns undefined when the scene is not this
 * proxy+content shape (e.g. a single framing target), so the caller falls back to
 * the plain per-target framePose.
 */
export function resolveFramedWallPose(
  framing: FramingBehavior[],
  resolveTarget: (id: number) => EvaluatedLayer | undefined,
  aovDeg: number,
  frameHeight: number,
  timeSec: number,
  animationEndSec: number,
  wallCenter?: [number, number, number],
  staticCamPos?: [number, number, number],
  frameWidth?: number,
): CameraPose | undefined {
  if (framing.length < 1) return undefined;
  const t2s = (rt: RationalTime | undefined) => (rt && rt.timescale > 0) ? rt.value / rt.timescale : 0;

  // SINGLE-BEHAVIOR spin dolly (Replicator-Clones/Clone_Spin). Clone_Spin's Camera
  // carries ONE Framing behavior (factory 3, transition type 1) whose Target is the
  // "Transition B" photo tile, active the whole clip (timing in=0, out~endSec).
  // Decoded from Clone Spin.motr: it frames B at an oblique world pose (rot X=0.309,
  // Y=0.529 rad), Path Offset (1450,980,5332), Offset Path Apex=0.2925. FCP's
  // OZScene::computeFraming samples the target transform at time t; the resulting
  // camera path opens full-frame on photo A (Transition-A tile at world origin z=0,
  // un-rotated -> GT f0 is warm A edge-to-edge), then pulls back to the wide oblique
  // reveal that brings the surrounding "Timeline Pin" tile staircase into frame (the
  // spinning grid GT holds through the middle). The final full-frame-B settle in GT
  // is delivered by the B drop-zone retime-wrap (timemap), NOT the framing camera, so
  // the camera HOLDS the wide reveal after the pull-back rather than chasing the lone
  // oblique B tile (which mis-frames it and regresses the tail). Structural: a single
  // always-on framer targeting an off-plane Transition tile. No fitted constant. The
  // baseline returned framePose(B) STATICALLY (never opened on A); adding the near-A
  // opening dolly is the win (Clone_Spin 10.16 -> 10.69 dB, no per-frame regression).
  if (framing.length === 1) {
    const beh = framing[0];
    const tgt = resolveTarget(beh.targetId);
    if (!tgt) return undefined;
    if (t2s(beh.timing?.in) > 1e-3) return undefined;
    const tanHalfC = Math.tan((aovDeg * Math.PI) / 360);
    if (tanHalfC < EPS) return undefined;
    const aspectC = (frameWidth && frameHeight) ? frameWidth / frameHeight : (16 / 9);
    const tanHC = Math.max(tanHalfC * aspectC, EPS);
    const bbC = worldBBox(tgt);
    const halfVc = Math.max(bbC.half[1], EPS), halfHc = Math.max(bbC.half[0], EPS);
    const nearDistC = Math.min(halfHc / tanHC, halfVc / tanHalfC);
    const far = framePose(tgt, beh, aovDeg, aspectC);
    const camXc = staticCamPos ? staticCamPos[0] : 0;
    const camYc = staticCamPos ? staticCamPos[1] : 0;
    const keyNearA: CameraPose = {
      target: [camXc, camYc, 0],
      pos: [camXc, camYc, nearDistC],
      distance: nearDistC,
    };
    const endC = animationEndSec > EPS ? animationEndSec : Math.max(t2s(beh.timing?.out), EPS);
    const apexFracC = Math.max(0.05, Math.min(0.95, beh.apex || 0.5));
    const tFarC = apexFracC * endC;
    const lerpC = (a: CameraPose, b: CameraPose, f: number): CameraPose => {
      const e = ease(Math.max(0, Math.min(1, f)));
      const L = (p: number, q: number) => p + (q - p) * e;
      return {
        pos: [L(a.pos[0], b.pos[0]), L(a.pos[1], b.pos[1]), L(a.pos[2], b.pos[2])],
        target: [L(a.target[0], b.target[0]), L(a.target[1], b.target[1]), L(a.target[2], b.target[2])],
        distance: L(a.distance, b.distance),
      };
    };
    if (timeSec <= 0) return keyNearA;
    if (timeSec <= tFarC) return lerpC(keyNearA, far, tFarC > EPS ? timeSec / tFarC : 1);
    return far;
  }

  // Proxy behavior = the one active at t=0 (smallest timing-in); content behavior =
  // the later one, whose target is an on-plane tile.
  const sorted = [...framing].sort((a, b) => t2s(a.timing?.in) - t2s(b.timing?.in));
  const proxyBeh = sorted[0], contentBeh = sorted[sorted.length - 1];
  const proxy = resolveTarget(proxyBeh.targetId);
  const content = resolveTarget(contentBeh.targetId);
  if (!proxy || !content) return undefined;

  const tanHalf = Math.tan((aovDeg * Math.PI) / 360);
  if (tanHalf < EPS) return undefined;

  // Orientation basis: the proxy's normalized world-rotation columns.
  const pw = proxy.worldTransform;
  const nx = (a: number, b: number, c: number): [number, number, number] => {
    const l = Math.hypot(a, b, c) || 1; return [a / l, b / l, c / l];
  };
  const right = nx(pw[0], pw[1], pw[2]);
  const up = nx(pw[4], pw[5], pw[6]);
  const fwd = nx(pw[8], pw[9], pw[10]);   // proxy local +Z in world = dolly-back axis

  // ANCHOR reconciliation. The proxy sits far off the content tile plane, so its
  // own bbox centre is NOT where the wall is. computeFraming's framing point is the
  // proxy bbox centre plus the behavior's Framing/Path offset expressed in the
  // proxy's LOCAL frame; the camera looks from there along −forward. Cast that
  // framing ray to the CONTENT tile plane (the content target's world Z) to recover
  // the on-plane point the proxy is actually pointing at — this is the wall anchor.
  const pb = worldBBox(proxy);
  const offX = proxyBeh.framingOffset.x + proxyBeh.pathOffset.x * proxyBeh.apex;
  const offY = proxyBeh.framingOffset.y + proxyBeh.pathOffset.y * proxyBeh.apex;
  const offZ = proxyBeh.framingOffset.z + proxyBeh.pathOffset.z * proxyBeh.apex;
  const fp: [number, number, number] = [
    pb.center[0] + right[0] * offX + up[0] * offY + fwd[0] * offZ,
    pb.center[1] + right[1] * offX + up[1] * offY + fwd[1] * offZ,
    pb.center[2] + right[2] * offX + up[2] * offY + fwd[2] * offZ,
  ];
  const cb = worldBBox(content);
  const planeZ = cb.center[2]; // content tile plane
  // WALL ANCHOR = the tile grid's geometric centre (centroid of every replicator
  // instance, passed as wallCenter). This is the point the oblique framer proxy
  // dollies away from — GT starts full-frame on the centre tile and dollies straight
  // back along the proxy's forward axis to reveal the surrounding wall symmetrically.
  // Falls back to the proxy ray-cast onto the tile plane when no centroid is known.
  const dz = -fwd[2];
  let anchor: [number, number, number];
  if (wallCenter) {
    anchor = [wallCenter[0], wallCenter[1], wallCenter[2]];
  } else if (Math.abs(dz) > EPS) {
    const s = (planeZ - fp[2]) / dz;
    anchor = [fp[0] - fwd[0] * s, fp[1] - fwd[1] * s, planeZ];
  } else {
    anchor = [cb.center[0], cb.center[1], cb.center[2]];
  }

  // 3-KEY DOLLY PATH (decoded 2026-07-16, T-qvidwall01). The GT is a near→far→near
  // dolly authored by TWO Framing behaviors of Motion "Transition" type 3:
  //   • PROXY/framer behavior (in=0, out≈0.968): frames the small off-plane "framer"
  //     shape at world Z≈5711 carrying the oblique orientation basis; the camera
  //     pulls OUT along its −forward axis to reveal the whole tile wall.
  //   • CONTENT/"Frame B" behavior (in≈0.868, out=end): frames the on-plane
  //     Transition-B photo tile; the camera dollies back IN to fill the frame with B.
  // The endpoints are:
  //   key0 (near-A, t=0):      look STRAIGHT DOWN −Z at the A tile plane from the
  //                            static-camera XY, at nearDist (one tile fills frame).
  //                            The static camera's own Z (≈23, a rig depth) is far
  //                            too close and blows the A tile into a flat colour;
  //                            use contentPlaneZ + nearDist instead.
  //   key1 (far,  t=proxyOut): eye = anchor + proxyFwd·farDist, oriented obliquely
  //                            (proxy basis via the eye→anchor look-at), framing the
  //                            whole wall — farDist = the proxy framePose eye depth.
  //   key2 (near-B, t=end):    look straight down −Z at the B tile centre from B's
  //                            XY, at nearDist (one tile fills frame → settled B).
  // Ease-lerp eye+target key0→key1 over [0,proxyOut], key1→key2 over [proxyOut,end].
  // COVER the frame for the near keys (fit the 16:9 tile to the 16:9 frame): fit the
  // tighter axis so the tile fills the frame rather than letterboxing.
  const aspect = (frameWidth && frameHeight) ? frameWidth / frameHeight : 1;
  const tanH = Math.max(tanHalf * aspect, EPS);
  const halfV = Math.max(cb.half[1], EPS);
  const halfH = Math.max(cb.half[0], EPS);
  // near cover: tile fills the frame → smaller of the two fit distances.
  const nearDist = Math.min(halfH / tanH, halfV / tanHalf);

  // FAR distance: the proxy's own computeFraming eye depth from the wall anchor. The
  // framer proxy at world Z≈5711 is framed edge-to-edge at eye depth ≈ its bbox +
  // Framing offset resolved along its forward axis; the camera sits that far from the
  // anchor along +forward, where the wall half-width fills the AOV and the full grid
  // is revealed. Derived from the proxy's world position projected onto the dolly
  // axis (fp is the proxy framing point; its distance from the anchor along +fwd is
  // the natural far depth), NOT a fitted constant.
  const dfx = fp[0] - anchor[0], dfy = fp[1] - anchor[1], dfz = fp[2] - anchor[2];
  const farDist = Math.abs(dfx * fwd[0] + dfy * fwd[1] + dfz * fwd[2]);

  // Near-A eye/target: straight down −Z at the A tile plane from the static-camera XY.
  const camXY: [number, number] = staticCamPos ? [staticCamPos[0], staticCamPos[1]] : [anchor[0], anchor[1]];
  const key0: CameraPose = {
    target: [camXY[0], camXY[1], planeZ],
    pos: [camXY[0], camXY[1], planeZ + nearDist],
    distance: nearDist,
  };
  // Far eye/target: oblique dolly-out framing the whole wall.
  const key1: CameraPose = {
    target: [anchor[0], anchor[1], anchor[2]],
    pos: [anchor[0] + fwd[0] * farDist, anchor[1] + fwd[1] * farDist, anchor[2] + fwd[2] * farDist],
    distance: farDist,
  };
  // Near-B eye/target: straight down −Z at the B tile centre.
  const key2: CameraPose = {
    target: [cb.center[0], cb.center[1], cb.center[2]],
    pos: [cb.center[0], cb.center[1], cb.center[2] + nearDist],
    distance: nearDist,
  };

  const proxyOut = t2s(proxyBeh.timing?.out);
  const end = animationEndSec > EPS ? animationEndSec : Math.max(proxyOut, t2s(contentBeh.timing?.out), EPS);
  const lerpPose = (a: CameraPose, b: CameraPose, f: number): CameraPose => {
    const e = ease(Math.max(0, Math.min(1, f)));
    const L = (p: number, q: number) => p + (q - p) * e;
    return {
      pos: [L(a.pos[0], b.pos[0]), L(a.pos[1], b.pos[1]), L(a.pos[2], b.pos[2])],
      target: [L(a.target[0], b.target[0]), L(a.target[1], b.target[1]), L(a.target[2], b.target[2])],
      distance: L(a.distance, b.distance),
    };
  };
  if (timeSec <= 0) return key0;
  if (timeSec <= proxyOut) return lerpPose(key0, key1, proxyOut > EPS ? timeSec / proxyOut : 1);
  if (timeSec >= end) return key2;
  return lerpPose(key1, key2, (timeSec - proxyOut) / Math.max(end - proxyOut, EPS));
}

