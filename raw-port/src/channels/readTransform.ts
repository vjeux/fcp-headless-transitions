// readTransform.ts — extract a node's Transform channel values (Position/Scale/Rotation/Anchor)
// faithfully from its OZChannel tree. The Transform lives under Properties(1) > Transform(100):
//   Position(101): X(1)/Y(2)/Z(3)   Rotation(109): X(1)/Y(2)/Z(3)   Scale(105): X/Y/Z (or uniform)
//   Anchor Point(107): X/Y/Z        Shear/etc. as present.
// Each axis is an OZChannel: static `value`/`defaultValue`, or animated via `curve` (evaluate at t).
// Sub-axis param ids: X=1, Y=2, Z=3 (from the channel scopes; matches the .motr <parameter> tree).
import { OZChannelBase } from "./OZChannelBase.js";
import { OZChannelFolder } from "./OZChannelFolder.js";
import { OZChannel } from "./OZChannel.js";
import { interpKindForType } from "./interpolators.js";
import type { OZKeypoint } from "./OZCurve.js";
export interface Vec3 { x: number; y: number; z: number; }
export interface NodeTransform {
  position: Vec3;
  rotation: Vec3;  // degrees (Motion stores rotation in degrees)
  scale: Vec3;     // 1.0 = 100%
  anchor: Vec3;
}

const TRANSFORM = 100, POSITION = 101, ROTATION_3D = 109, ROTATION_2D = 102, SCALE = 105, ANCHOR = 107;
const AXIS = { x: 1, y: 2, z: 3 } as const;

function folder(c: OZChannelBase | undefined, id: number): OZChannelFolder | undefined {
  if (!(c instanceof OZChannelFolder)) return undefined;
  const f = c.children.find(x => x.id === id);
  return f instanceof OZChannelFolder ? f : undefined;
}

/** Find a direct child parameter (folder OR scalar leaf) of `c` by id. */
function child(c: OZChannelBase | undefined, id: number): OZChannelBase | undefined {
  if (!(c instanceof OZChannelFolder)) return undefined;
  return c.children.find(x => x.id === id);
}

/** Evaluate a channel's scalar at time t (curve if animated, else static value/default). */
export function channelValue(c: OZChannelBase | undefined, t: number, fallback: number): number {
  if (!(c instanceof OZChannel)) return fallback;
  if (c.curve && c.curve.keypoints.length > 0) return evalCurve(c, t);
  return c.value ?? c.defaultValue ?? fallback;
}

/**
 * bezierSegment — evaluate one keyframe segment as a 2D cubic Bézier in (time,value), the way
 * FCP's OZBezierInterpolator / OZCatmullRomInterpolator do. Control polygon (DECODED from
 * OZBezierInterpolator::getControlPoints @0x4054a + the .motr tangent tags):
 *   P0 = (a.time, a.value)
 *   P1 = (a.time + a.outputTangentTime, a.value + a.outputTangentValue)   [outgoing handle of a]
 *   P2 = (b.time + b.inputTangentTime,  b.value + b.inputTangentValue)    [incoming handle of b]
 *   P3 = (b.time, b.value)
 * (inputTangentTime is negative — the handle points back toward a.) x(s) is monotone in s over a
 * well-formed segment; solve x(s)=t for s∈[0,1] (Newton + bisection safety), then return y(s).
 * Absent handles collapse P1/P2 onto the chord => the segment degrades to linear.
 */
function bezierSegment(a: OZKeypoint, b: OZKeypoint, t: number): number {
  const dt = b.time - a.time;
  if (dt <= 0) return a.value;
  const p0x = a.time, p0y = a.value;
  const p3x = b.time, p3y = b.value;
  // Handles default to 1/3 of the chord (a natural spline) only if truly absent; here we honour the
  // stored handle offsets, and treat a missing handle as zero-length (=> linear on that side).
  const p1x = p0x + (a.outputTangentTime ?? dt / 3);
  const p1y = p0y + (a.outputTangentValue ?? (b.value - a.value) / 3);
  const p2x = p3x + (b.inputTangentTime ?? -dt / 3);
  const p2y = p3y + (b.inputTangentValue ?? -(b.value - a.value) / 3);
  // Cubic Bézier basis on parameter s.
  const bez = (s: number, c0: number, c1: number, c2: number, c3: number): number => {
    const mt = 1 - s;
    return mt * mt * mt * c0 + 3 * mt * mt * s * c1 + 3 * mt * s * s * c2 + s * s * s * c3;
  };
  const bezDeriv = (s: number, c0: number, c1: number, c2: number, c3: number): number => {
    const mt = 1 - s;
    return 3 * mt * mt * (c1 - c0) + 6 * mt * s * (c2 - c1) + 3 * s * s * (c3 - c2);
  };
  // Solve x(s) = t. Start from the linear guess; a few Newton steps, guarded by bisection.
  let lo = 0, hi = 1;
  let s = dt > 0 ? (t - p0x) / dt : 0;
  if (s < 0) s = 0; else if (s > 1) s = 1;
  for (let it = 0; it < 24; it++) {
    const x = bez(s, p0x, p1x, p2x, p3x) - t;
    if (Math.abs(x) < 1e-9) break;
    if (x > 0) hi = s; else lo = s;
    const dx = bezDeriv(s, p0x, p1x, p2x, p3x);
    let ns = dx !== 0 ? s - x / dx : (lo + hi) / 2;
    if (!(ns > lo && ns < hi)) ns = (lo + hi) / 2; // Newton escaped the bracket -> bisect
    s = ns;
  }
  return bez(s, p0y, p1y, p2y, p3y);
}

function evalCurve(c: OZChannel, t: number): number {
  const kps = c.curve!.keypoints;
  if (kps.length === 1) return kps[0].value;
  // Before first / after last keypoint: hold the endpoint (FCP's default extrapolation).
  if (t <= kps[0].time) return kps[0].value;
  if (t >= kps[kps.length - 1].time) return kps[kps.length - 1].value;
  for (let i = 0; i < kps.length - 1; i++) {
    const a = kps[i], b = kps[i + 1];
    if (t >= a.time && t <= b.time) {
      // The SEGMENT interpolator is selected by the LEFT keypoint's interpolation type, falling
      // back to the <curve type=N> when the keypoint carries none (Reflection's curves put type on
      // the <curve>, not per-keypoint). DECODED type->interpolator (re/INTERPOLATION_TYPES.md):
      //   0 = Constant (hold-left); 1,15,16,17,18 = Linear; 2..5,9,11 = Bezier (tangents);
      //   6 = CatmullRom; 10 = XSpline; 12 = BSpline; 19 = Convex; 20 = Concave; 21 = SCurve;
      //   7,8,13,14 = base (identity). Constant + Linear cover 13766/13997 keypoints across the 65.
      const kind = interpKindForType(a.interpolation ?? c.curve!.type ?? 1);
      if (kind === "constant") return a.value; // OZConstantInterpolator: hold the left value
      // OZLinearInterpolator (@0x44ec8): u = (t-t0)/(t1-t0); value = v0 + (v1-v0)*u. VERIFIED exact.
      const u = b.time === a.time ? 0 : (t - a.time) / (b.time - a.time);
      if (kind === "linear" || kind === "base") return a.value + (b.value - a.value) * u;
      // Bézier / CatmullRom / SCurve / Convex / Concave: FCP stores these as a 2D cubic Bézier
      // whose interior control points come from the keypoint tangent HANDLES (in/out TangentTime,
      // TangentValue), per OZBezierInterpolator::getControlPoints (@0x4054a) + the .motr tag names
      // inputTangentTime/inputTangentValue/outputTangentTime/outputTangentValue. Solve x(s)=t for
      // the Bézier parameter s, then return y(s). If a segment lacks handles, this degrades to
      // linear (P1/P2 sit on the P0->P3 chord).
      return bezierSegment(a, b, t);
    }
  }
  return c.value ?? c.defaultValue ?? 0;
}

function vec3(f: OZChannelFolder | undefined, t: number, def: Vec3): Vec3 {
  if (!f) return { ...def };
  const ax = (id: number, d: number) => channelValue(f.children.find(x => x.id === id), t, d);
  return { x: ax(AXIS.x, def.x), y: ax(AXIS.y, def.y), z: ax(AXIS.z, def.z) };
}

/** Read the full Transform of a node at time t from its Properties(1)>Transform(100) channel tree. */
export function readTransform(propertiesRoot: OZChannelBase | undefined, t: number): NodeTransform {
  const xf = folder(propertiesRoot, TRANSFORM);
  const Z0: Vec3 = { x: 0, y: 0, z: 0 };
  const ONE: Vec3 = { x: 1, y: 1, z: 1 };
  return {
    position: vec3(folder(xf, POSITION), t, Z0),
    rotation: readRotation(xf, t),
    scale: vec3(folder(xf, SCALE), t, ONE),
    anchor: vec3(folder(xf, ANCHOR), t, Z0),
  };
}

/**
 * Read the Transform's Rotation. DECODED from the .motr transform tree: under Transform(100) the
 * Rotation child appears with one of TWO factory-assigned ids (census over all 65 templates):
 *   - id 109 = the 3D rotation GROUP (folder with X(1)/Y(2)/Z(3) Euler leaves; 326x)
 *   - id 102 = the scalar 2D rotation (a single OZChannel = the in-plane Z angle; 413x)
 * (Position=101 and Scale=105 are shared across both, so 102/109 is purely the rotation-param
 * variant, not a different transform factory.) Prefer the 3D group when present; else read 102 as
 * the Z-angle. Motion stores rotation in DEGREES.
 */
function readRotation(xf: OZChannelFolder | undefined, t: number): Vec3 {
  const g3d = folder(xf, ROTATION_3D);
  if (g3d) return vec3(g3d, t, { x: 0, y: 0, z: 0 });
  const rot2d = child(xf, ROTATION_2D);
  if (rot2d instanceof OZChannel) return { x: 0, y: 0, z: channelValue(rot2d, t, 0) };
  // A 2D rotation authored as a folder-with-Z (rare) — read its Z axis.
  const rot2dFolder = folder(xf, ROTATION_2D);
  if (rot2dFolder) return vec3(rot2dFolder, t, { x: 0, y: 0, z: 0 });
  return { x: 0, y: 0, z: 0 };
}
