/**
 * Keyframe curve evaluator.
 *
 * Supports all Motion interpolation types:
 *   0 = Constant (hold previous value)
 *   1 = Linear
 *   6,7,8,15,16,17 = Bezier (cubic bezier with tangent handles)
 *
 * Tangent format:
 *   - tangentTime is in SECONDS (fractional offset from the keyframe's time)
 *   - tangentValue is in parameter units (pixels, degrees, opacity, etc.)
 *   - A segment [keyA → keyB] uses:
 *       P0 = (timeA, valueA)
 *       P1 = P0 + (keyA.outTangentTime, keyA.outTangentValue)
 *       P2 = P3 + (keyB.inTangentTime, keyB.inTangentValue)  // inTangent is negative
 *       P3 = (timeB, valueB)
 */
import type { Curve, Keyframe, RationalTime } from '../types.js';

/** Convert a RationalTime to seconds. */
export function timeToSeconds(t: RationalTime): number {
  if (t.timescale === 0) return 0;
  return t.value / t.timescale;
}

/**
 * Interpolation type → interpolator, reverse-engineered from ProChannel.framework
 * (OZInterpolatorStrategies jump table at 0xac588 + the constructor at
 * OZInterpolatorStrategies::C2). Authoritative mapping:
 *
 *    0            Constant
 *    1, 18        Linear
 *    2,3,4,5,9-12 Bezier        (uses stored tangent handles)
 *    6            CatmullRom    (auto tangents from neighbours — the common case)
 *    7            EaseIn        vA + (vB-vA)*(1 - cos(u*π/2))     (sine ease-in)
 *    8            EaseOut       vA + (vB-vA)*sin(u*π/2)           (sine ease-out)
 *    13           Exponential
 *    14           Logarithmic
 *    15           Ease          (time-warp; see easeTime)
 *    16           Accelerate    (time-warp)
 *    17           Decelerate    (time-warp)
 *    19           Convex
 *    20           Concave
 *    21           SCurve
 *
 * Only 0,1,6,7,8,15,16,17 actually appear in the 65 built-in transitions.
 */
const INTERP_CONSTANT = 0;
const INTERP_LINEAR = 1;
const INTERP_LINEAR_ALT = 18;
const INTERP_CATMULL_ROM = 6;
const INTERP_EASE_IN = 7;
const INTERP_EASE_OUT = 8;
// Types 2,3,4,5,9,10,11,12 use the stored tangent handles (classic Bezier).
function isStoredBezier(interp: number): boolean {
  return (interp >= 2 && interp <= 5) || (interp >= 9 && interp <= 12);
}

/**
 * Solve a cubic bezier for parameter t given control points in one dimension.
 * Uses the parametric cubic: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
 */
function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0
    + 3 * mt * mt * t * p1
    + 3 * mt * t * t * p2
    + t * t * t * p3;
}

/**
 * Invert a cubic Bézier in the TIME dimension: find parameter u∈[0,1] such that
 * the time-Bézier (t0,t1,t2,t3) equals the target time. Newton-Raphson with a
 * bisection fallback. Motion reparameterizes each segment through a time-Bézier
 * whose control points sit at the keyframes' handle times, so the value must be
 * sampled at this solved u, not at normalized time.
 */
function solveBezierParam(target: number, t0: number, t1: number, t2: number, t3: number): number {
  let u = (t3 - t0) !== 0 ? (target - t0) / (t3 - t0) : 0.5;
  u = Math.max(0, Math.min(1, u));
  for (let i = 0; i < 24; i++) {
    const cur = cubicBezier(u, t0, t1, t2, t3);
    const err = cur - target;
    if (Math.abs(err) < 1e-9) break;
    const mt = 1 - u;
    const d = 3 * mt * mt * (t1 - t0) + 6 * mt * u * (t2 - t1) + 3 * u * u * (t3 - t2);
    if (Math.abs(d) < 1e-12) break;
    u -= err / d;
    u = Math.max(0, Math.min(1, u));
  }
  return u;
}

/**
 * Evaluate a keyframe curve at a given time (in seconds).
 */
export function evaluateCurve(curve: Curve, timeSec: number): number {
  const { keyframes } = curve;

  if (keyframes.length === 0) {
    // A curve with no keyframes holds a constant. Motion stores the current
    // constant in `value` (the `value=` attribute); `default` is only the
    // factory default and is used when no explicit value was authored. Rig
    // snapshot curves (e.g. Opacity 0/1 selectors) rely on this: their curve is
    // keyframeless with value=0 or 1 but default=1, so returning `default` here
    // would make every "hidden" snapshot visible.
    return curve.value !== undefined ? curve.value : curve.default;
  }

  if (keyframes.length === 1) {
    return keyframes[0].value;
  }

  // Convert keyframe times to seconds for comparison
  const firstTime = timeToSeconds(keyframes[0].time);
  const lastTime = timeToSeconds(keyframes[keyframes.length - 1].time);

  // Before first keyframe: hold first value
  if (timeSec <= firstTime) {
    return keyframes[0].value;
  }

  // After last keyframe: hold last value
  if (timeSec >= lastTime) {
    return keyframes[keyframes.length - 1].value;
  }

  // Find the segment index [i, i+1] that contains timeSec
  let segIndex = 0;
  for (let i = 0; i < keyframes.length - 1; i++) {
    const tA = timeToSeconds(keyframes[i].time);
    const tB = timeToSeconds(keyframes[i + 1].time);
    if (timeSec >= tA && timeSec <= tB) { segIndex = i; break; }
  }

  const keyA = keyframes[segIndex];
  const keyB = keyframes[segIndex + 1];
  const tA = timeToSeconds(keyA.time);
  const tB = timeToSeconds(keyB.time);
  const duration = tB - tA;

  if (duration <= 0) {
    return keyA.value;
  }

  // Determine interpolation type (use the OUTGOING interpolation of keyA)
  const interp = keyA.interpolation;

  // Constant: hold value until next keyframe
  if (interp === INTERP_CONSTANT) {
    return keyA.value;
  }

  // Linear: simple lerp
  if (interp === INTERP_LINEAR || interp === INTERP_LINEAR_ALT) {
    const frac = (timeSec - tA) / duration;
    return keyA.value + (keyB.value - keyA.value) * frac;
  }

  // Sine ease-in (7) / ease-out (8), and the constant-accel Ease/Accelerate/
  // Decelerate profiles (15/16/17). All shape the *value* by a normalized-time
  // easing of the endpoint values (verified sub-pixel against the real engine via
  // ruler renders of single-type test curves).
  {
    const u = (timeSec - tA) / duration; // normalized time 0..1
    let e: number | null = null;
    if (interp === INTERP_EASE_IN) e = 1 - Math.cos(u * Math.PI / 2);          // sine ease-in
    else if (interp === INTERP_EASE_OUT) e = Math.sin(u * Math.PI / 2);        // sine ease-out
    else if (interp === 15) e = easeInOut(u, 0.25, 0.25);                      // Ease
    else if (interp === 16) e = easeInOut(u, 0.5, 0.0);                        // Accelerate
    else if (interp === 17) e = easeInOut(u, 0.0, 0.5);                        // Decelerate
    if (e !== null) return keyA.value + (keyB.value - keyA.value) * e;
  }

  // Classic Bezier using the STORED tangent handles (types 2,3,4,5,9,10,11,12).
  if (isStoredBezier(interp)) {
    const outTTime = keyA.outTangentTime ?? 0;
    const outTValue = keyA.outTangentValue ?? 0;
    const inTTime = keyB.inTangentTime ?? 0;
    const inTValue = keyB.inTangentValue ?? 0;
    const valP0 = keyA.value;
    const valP1 = keyA.value + outTValue;
    const valP2 = keyB.value + inTValue;
    const valP3 = keyB.value;
    const u = solveBezierParam(timeSec, tA, tA + outTTime, tB + inTTime, tB);
    return cubicBezier(u, valP0, valP1, valP2, valP3);
  }

  // CatmullRom (type 6) — auto tangents from neighbours + time reparameterization.
  //
  // FULLY REVERSE-ENGINEERED from the real Motion curve engine (ProChannel.framework)
  // by breakpointing OZBezierInterpolator::getControlPoints / OZBezierEval /
  // OZBezierFindParameter under lldb and reading the exact control polygons it
  // builds for a known transition. The algorithm:
  //
  // Motion IGNORES the tangent handles stored in the .motr for type 6 (verified:
  // editing them to zero/extreme values changes nothing; only keyframe VALUES
  // matter). It recomputes a smooth tangent per keyframe from the neighbouring
  // points and reparameterizes each segment through a time-Bézier:
  //
  //   • slope m_i  = Catmull-Rom centered difference (v[i+1]-v[i-1])/(t[i+1]-t[i-1]);
  //                  0 at the first/last keyframe (ease from / to rest).
  //   • handle time h_i = ½·(dt_{i-1}/3 + dt_i/3) at interior keyframes,
  //                  dt_0/3 at the first, dt_{n-2}/3 at the last.  (Averaging the
  //                  adjacent third-segments is what gives C¹ velocity continuity
  //                  across non-uniformly spaced keyframes — this was the missing
  //                  piece that made per-segment humps.)
  // Per segment [i,i+1]:
  //   • value control  [v_i, v_i + m_i·h_i, v_{i+1} − m_{i+1}·h_{i+1}, v_{i+1}]
  //   • time control   [t_i, t_i + h_i,     t_{i+1} − h_{i+1},        t_{i+1}]
  //   • solve the time-Bézier for u at the query time, then eval the value-Bézier.
  //
  // Verified to 0.26px mean / 0.59px max against the real engine (ruler-decode
  // precision). A 2-keyframe curve reduces to exact smoothstep 3u²−2u³.
  {
    const n = keyframes.length;
    const tAt = (i: number): number => timeToSeconds(keyframes[i].time);
    const dtAt = (i: number): number => tAt(i + 1) - tAt(i); // segment i duration

    const slopeAt = (i: number): number => {
      if (i <= 0 || i >= n - 1) return 0; // zero-velocity endpoints
      const span = tAt(i + 1) - tAt(i - 1);
      if (span <= 0) return 0;
      return (keyframes[i + 1].value - keyframes[i - 1].value) / span;
    };
    const handleTime = (i: number): number => {
      if (i <= 0) return dtAt(0) / 3;
      if (i >= n - 1) return dtAt(n - 2) / 3;
      return 0.5 * (dtAt(i - 1) / 3 + dtAt(i) / 3);
    };

    const hA = handleTime(segIndex);
    const hB = handleTime(segIndex + 1);
    const mA = slopeAt(segIndex);
    const mB = slopeAt(segIndex + 1);

    // Value control polygon.
    const valP0 = keyA.value;
    const valP1 = keyA.value + mA * hA;
    const valP2 = keyB.value - mB * hB;
    const valP3 = keyB.value;

    // Time control polygon (seconds), then solve for the Bézier parameter u.
    const u = solveBezierParam(timeSec, tA, tA + hA, tB - hB, tB);
    return cubicBezier(u, valP0, valP1, valP2, valP3);
  }


  // Fallback: linear
  const frac = (timeSec - tA) / duration;
  return keyA.value + (keyB.value - keyA.value) * frac;
}

/**
 * PCMath::easeInOut — the shared constant-accel / linear / constant-decel motion
 * profile used by the Ease / Accelerate / Decelerate interpolators. Ported exactly
 * from ProCore.framework `_ZN6PCMath9easeInOutEdddddPdS0_`.
 *
 * `u` is normalized time 0..1. `accelIn` / `accelOut` are the fractions of the
 * segment spent accelerating / decelerating (quadratic ramps); the middle is
 * linear. Returns the eased fraction 0..1. If both fractions are 0 it degenerates
 * to linear; if they sum > 1 they are normalized.
 *
 *   Ease       accelIn=0.25 accelOut=0.25   (interp 15)
 *   Accelerate accelIn=0.50 accelOut=0      (interp 16)
 *   Decelerate accelIn=0    accelOut=0.50   (interp 17)
 */
function easeInOut(u: number, accelIn: number, accelOut: number): number {
  let ai = accelIn < 0 ? 0 : accelIn;
  let ao = accelOut < 0 ? 1 : accelOut;
  const s = ai + ao;
  if (Math.abs(s) < 1e-9) return u; // no ramps → linear
  const d4 = s <= 1 ? s : 1;
  const d6 = s <= 1 ? ao : ao / s;
  const d7 = s <= 1 ? ai : ai / s;
  if (u < 0) return 0;
  const d4m = d4 - 2;
  if (u < d7) {
    // accelerate phase (quadratic from rest)
    return -(u * u) / (d4m * d7);
  }
  if (u <= 1 - d6) {
    // linear middle
    return (d7 - 2 * u) / d4m;
  }
  if (u < 1) {
    // decelerate phase (quadratic to rest)
    return ((1 - u) * (1 - u)) / (d4m * d6) + 1;
  }
  return 1;
}


/**
 * Resolve a parameter value that may be a static number or an animated curve.
 */
export function resolveValue(value: number | Curve | undefined, timeSec: number, defaultVal: number = 0): number {
  if (value === undefined) return defaultVal;
  if (typeof value === 'number') return value;
  return evaluateCurve(value, timeSec);
}
