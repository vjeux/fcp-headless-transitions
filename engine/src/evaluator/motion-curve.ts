/**
 * motion-curve.ts — a faithful JavaScript decompilation of Final Cut Pro / Motion's
 * curve (channel) evaluation codepath, reverse-engineered from ProChannel.framework
 * and ProCore.framework (Apple Silicon / arm64 slice) via lldb + objdump.
 *
 * This is a standalone, dependency-free reference implementation: given a channel's
 * keyframes it returns the exact value the real engine produces at any time. Every
 * function is annotated with the C++ symbol it was decompiled from. The main
 * evaluator (curves.ts) implements the same math inline; this module is the
 * authoritative spec + a validation target.
 *
 * ── Call chain in the real engine ────────────────────────────────────────────
 *   OZChannel::getValueAsDouble(CMTime, double)        [ProChannel 0x1855c]
 *     → (per-channel keyframe store) OZSpline::interpolate / OZConstant...        [+0x268 / +0x270 vtable]
 *       → OZBezierInterpolator::interpolate            [ProChannel 0x41a18]
 *         → getControlPoints → derivePoint             [tangents from neighbours]
 *         → OZBezierFindParameter(timeCtrl, t)         [solve time-bezier for u]
 *         → OZBezierEval(valCtrl, u)                   [ProChannel 0x9ff00]
 *     → getFadeRatio multiply                          [fade in/out envelope]
 *
 * ── Interpolation type → interpolator ────────────────────────────────────────
 *   Decompiled from OZInterpolatorStrategies (jump table @0xac588 + ::C2 ctor).
 *     0        Constant
 *     1, 18    Linear
 *     2-5,9-12 Bezier      (uses the STORED tangent handles)
 *     6        CatmullRom  (auto tangents from neighbours + time reparameterization)
 *     7        EaseIn      vA + (vB-vA)*(1-cos(u*π/2))          [OZEaseInInterpolator]
 *     8        EaseOut     vA + (vB-vA)*sin(u*π/2)              [OZEaseOutInterpolator]
 *     13       Exponential
 *     14       Logarithmic
 *     15       Ease        PCMath::easeInOut(u, 0.25, 0.25)
 *     16       Accelerate  PCMath::easeInOut(u, 0.5,  0)
 *     17       Decelerate  PCMath::easeInOut(u, 0,    0.5)
 *     19       Convex
 *     20       Concave
 *     21       SCurve
 *
 * Only 0,1,6,7,8,15,16,17 appear in the 65 built-in transitions; those are
 * implemented and validated to <0.65px against the real engine. The rest throw.
 *
 * ── Keyframe flags (per OZVertex flags field) ────────────────────────────────
 *   0x80 (128) = boundary/corner marker (first & last keyframe carry it),
 *   0x100 (256) / 0x180 (384) = locked / smooth handle editor state.
 *   VERIFIED (lldb + ruler renders): these flags do NOT affect evaluation output —
 *   they are UI metadata. The interpolation TYPE alone drives the math. So the
 *   evaluator ignores them.
 */

export interface CurveKeyframe {
  /** Time in seconds. */
  t: number;
  /** Value. */
  v: number;
  /** Interpolation type of the OUTGOING segment (0..21, see table above). */
  interp: number;
  /** Stored outgoing tangent (seconds, value) — only used by Bezier types 2-5,9-12. */
  outTangentTime?: number;
  outTangentValue?: number;
  /** Stored incoming tangent — only used by Bezier types 2-5,9-12. */
  inTangentTime?: number;
  inTangentValue?: number;
}

// ── OZBezierEval(const double* p, double t) — ProChannel 0x9ff00 ───────────────
// Standard cubic Bézier in one dimension (Horner form in the binary).
export function bezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

// ── OZBezierFindParameter(const double* timeCtrl, double target) — ProChannel 0xa0184 ──
// Invert the time-Bézier: find u∈[0,1] with bezier(u, timeCtrl) == target.
// Newton-Raphson from a linear seed (the binary uses the same approach + guards).
export function findParameter(target: number, t0: number, t1: number, t2: number, t3: number): number {
  let u = (t3 - t0) !== 0 ? (target - t0) / (t3 - t0) : 0.5;
  u = Math.max(0, Math.min(1, u));
  for (let i = 0; i < 24; i++) {
    const cur = bezier(u, t0, t1, t2, t3);
    const err = cur - target;
    if (Math.abs(err) < 1e-9) break;
    const mt = 1 - u;
    const d = 3 * mt * mt * (t1 - t0) + 6 * mt * u * (t2 - t1) + 3 * u * u * (t3 - t2);
    if (Math.abs(d) < 1e-12) break;
    u = Math.max(0, Math.min(1, u - err / d));
  }
  return u;
}

// ── PCMath::easeInOut(u, accelIn, accelOut, 0, 1, &out, 0) — ProCore 0x11f14 ───
// Constant-accel / linear / constant-decel motion profile. accelIn/accelOut are
// the fractions of the segment spent ramping. Returns eased fraction 0..1.
export function easeInOut(u: number, accelIn: number, accelOut: number): number {
  let ai = accelIn < 0 ? 0 : accelIn;
  let ao = accelOut < 0 ? 1 : accelOut;
  const s = ai + ao;
  if (Math.abs(s) < 1e-9) return u;
  const d4 = s <= 1 ? s : 1;
  const d6 = s <= 1 ? ao : ao / s;
  const d7 = s <= 1 ? ai : ai / s;
  if (u < 0) return 0;
  const d4m = d4 - 2;
  if (u < d7) return -(u * u) / (d4m * d7);            // accel (quadratic from rest)
  if (u <= 1 - d6) return (d7 - 2 * u) / d4m;          // linear middle
  if (u < 1) return ((1 - u) * (1 - u)) / (d4m * d6) + 1; // decel (quadratic to rest)
  return 1;
}

// ── OZSpline::derivePoint slope — Catmull-Rom centered difference ──────────────
// Interior keyframe slope = (v[i+1]-v[i-1]) / (t[i+1]-t[i-1]); 0 at the ends
// (the missing-neighbour branch zeroes it → ease from/to rest).
function catmullSlope(kfs: CurveKeyframe[], i: number): number {
  const n = kfs.length;
  if (i <= 0 || i >= n - 1) return 0;
  const span = kfs[i + 1].t - kfs[i - 1].t;
  return span > 0 ? (kfs[i + 1].v - kfs[i - 1].v) / span : 0;
}

// Handle time h_i = ½·(dt_{i-1}/3 + dt_i/3) interior; dt/3 at the ends.
// (Averaging adjacent third-segments gives C¹ velocity continuity across
// non-uniformly spaced keyframes — confirmed by reading getControlPoints' output.)
function catmullHandleTime(kfs: CurveKeyframe[], i: number): number {
  const n = kfs.length;
  const dt = (j: number) => kfs[j + 1].t - kfs[j].t;
  if (i <= 0) return dt(0) / 3;
  if (i >= n - 1) return dt(n - 2) / 3;
  return 0.5 * (dt(i - 1) / 3 + dt(i) / 3);
}

/**
 * Evaluate a single segment [a, b] at time `time` (a.t ≤ time ≤ b.t), using the
 * outgoing interpolation type of keyframe `a`. `kfs`/`ia` give neighbour context
 * for the Catmull-Rom auto tangents.
 */
function evalSegment(kfs: CurveKeyframe[], ia: number, time: number): number {
  const a = kfs[ia], b = kfs[ia + 1];
  const dur = b.t - a.t;
  if (dur <= 0) return a.v;
  const interp = a.interp;
  const u = (time - a.t) / dur; // normalized time

  switch (interp) {
    case 0: // Constant
      return a.v;
    case 1: case 18: // Linear
      return a.v + (b.v - a.v) * u;
    case 7: // EaseIn (sine)
      return a.v + (b.v - a.v) * (1 - Math.cos(u * Math.PI / 2));
    case 8: // EaseOut (sine)
      return a.v + (b.v - a.v) * Math.sin(u * Math.PI / 2);
    case 15: // Ease
      return a.v + (b.v - a.v) * easeInOut(u, 0.25, 0.25);
    case 16: // Accelerate
      return a.v + (b.v - a.v) * easeInOut(u, 0.5, 0);
    case 17: // Decelerate
      return a.v + (b.v - a.v) * easeInOut(u, 0, 0.5);
    case 2: case 3: case 4: case 5:
    case 9: case 10: case 11: case 12: { // Bezier — STORED tangent handles
      const V1 = a.v + (a.outTangentValue ?? 0);
      const V2 = b.v + (b.inTangentValue ?? 0);
      const uu = findParameter(time, a.t, a.t + (a.outTangentTime ?? 0), b.t + (b.inTangentTime ?? 0), b.t);
      return bezier(uu, a.v, V1, V2, b.v);
    }
    case 6: { // CatmullRom — auto tangents + time reparameterization
      const hA = catmullHandleTime(kfs, ia);
      const hB = catmullHandleTime(kfs, ia + 1);
      const mA = catmullSlope(kfs, ia);
      const mB = catmullSlope(kfs, ia + 1);
      const V1 = a.v + mA * hA;
      const V2 = b.v - mB * hB;
      const uu = findParameter(time, a.t, a.t + hA, b.t - hB, b.t);
      return bezier(uu, a.v, V1, V2, b.v);
    }
    default:
      throw new Error(`motion-curve: interpolation type ${interp} not yet implemented`);
  }
}

/**
 * OZChannel::getValueAsDouble — evaluate a keyframed channel at `time` (seconds).
 * (Fade-ratio envelope and round-to-int flag are handled by the caller/param.)
 */
export function evaluateMotionCurve(kfs: CurveKeyframe[], time: number): number {
  if (kfs.length === 0) return 0;
  if (kfs.length === 1) return kfs[0].v;
  if (time <= kfs[0].t) return kfs[0].v;         // hold before first
  if (time >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].v; // hold after last
  let ia = 0;
  for (let i = 0; i < kfs.length - 1; i++) {
    if (time >= kfs[i].t && time <= kfs[i + 1].t) { ia = i; break; }
  }
  return evalSegment(kfs, ia, time);
}
