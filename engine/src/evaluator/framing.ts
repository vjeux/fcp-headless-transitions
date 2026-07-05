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
): CameraPose {
  const bb = worldBBox(target);
  const tanHalf = Math.tan((aovDeg * Math.PI) / 360);
  // Fit the larger half-extent (matches the max-of-two-lanes fcsel in the decompile).
  const halfExtent = Math.max(bb.half[0], bb.half[1], EPS);
  const distance = halfExtent / Math.max(tanHalf, EPS);
  // Framing point = bbox center + framing offset (+ path offset scaled by apex).
  const fp: [number, number, number] = [
    bb.center[0] + beh.framingOffset.x + beh.pathOffset.x * beh.apex,
    bb.center[1] + beh.framingOffset.y + beh.pathOffset.y * beh.apex,
    bb.center[2] + beh.framingOffset.z + beh.pathOffset.z * beh.apex,
  ];
  const pos: [number, number, number] = [fp[0], fp[1], fp[2] + distance + beh.framingOffset.z];
  return { pos, target: fp, distance };
}

/** Ease a 0..1 blend fraction by the Ease Out Curve exponent (id 213 ~ 10). */
function ease(t: number): number {
  if (t <= 0) return 0; if (t >= 1) return 1;
  // Smoothstep-like ease-in-out (approximation of Motion's default ease curve).
  return t * t * (3 - 2 * t);
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
): CameraPose | undefined {
  // Compute each behavior's pose and its [in,out] window.
  const poses: Array<{ pose: CameraPose; tin: number; tout: number }> = [];
  for (const b of framing) {
    const tgt = resolveTarget(b.targetId);
    if (!tgt) continue;
    poses.push({ pose: framePose(tgt, b, aovDeg), tin: t2s(b.timing?.in), tout: t2s(b.timing?.out) });
  }
  if (poses.length === 0) return undefined;
  if (poses.length === 1) return poses[0].pose;

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
