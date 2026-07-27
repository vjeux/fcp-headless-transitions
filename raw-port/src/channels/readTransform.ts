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
export interface Vec3 { x: number; y: number; z: number; }
export interface NodeTransform {
  position: Vec3;
  rotation: Vec3;  // degrees (Motion stores rotation in degrees)
  scale: Vec3;     // 1.0 = 100%
  anchor: Vec3;
}

const TRANSFORM = 100, POSITION = 101, ROTATION = 109, SCALE = 105, ANCHOR = 107;
const AXIS = { x: 1, y: 2, z: 3 } as const;

function folder(c: OZChannelBase | undefined, id: number): OZChannelFolder | undefined {
  if (!(c instanceof OZChannelFolder)) return undefined;
  const f = c.children.find(x => x.id === id);
  return f instanceof OZChannelFolder ? f : undefined;
}

/** Evaluate a channel's scalar at time t (curve if animated, else static value/default). */
export function channelValue(c: OZChannelBase | undefined, t: number, fallback: number): number {
  if (!(c instanceof OZChannel)) return fallback;
  if (c.curve && c.curve.keypoints.length > 0) return evalCurve(c, t);
  return c.value ?? c.defaultValue ?? fallback;
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
      // Bezier/CatmullRom/SCurve segment math (tangent-based) is not yet decoded; fall back to the
      // linear parameterisation of u for those (documented TODO — decode OZBezierInterpolator next).
      return a.value + (b.value - a.value) * u;
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
    rotation: vec3(folder(xf, ROTATION), t, Z0),
    scale: vec3(folder(xf, SCALE), t, ONE),
    anchor: vec3(folder(xf, ANCHOR), t, Z0),
  };
}
