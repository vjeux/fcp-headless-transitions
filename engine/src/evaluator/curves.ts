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

/** Interpolation type constants. */
const INTERP_CONSTANT = 0;
const INTERP_LINEAR = 1;
// All bezier variants (6,7,8,15,16,17) are evaluated identically at runtime.
function isBezier(interp: number): boolean {
  return interp >= 6;
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
 * Given a cubic bezier in the TIME dimension, find the parameter `t` (0-1) that
 * corresponds to a given time value. Uses Newton-Raphson iteration.
 *
 * This is needed because bezier keyframes define curves in (time, value) space,
 * but the X-axis (time) is ALSO a bezier — so we need to invert the time bezier
 * to find what parameter `t` gives us the desired time.
 */
function solveBezierT(targetTime: number, t0: number, t1: number, t2: number, t3: number): number {
  // Initial guess: linear proportion
  let t = (t3 - t0) !== 0 ? (targetTime - t0) / (t3 - t0) : 0.5;
  t = Math.max(0, Math.min(1, t));

  // Newton-Raphson iterations
  for (let i = 0; i < 12; i++) {
    const currentTime = cubicBezier(t, t0, t1, t2, t3);
    const error = currentTime - targetTime;
    if (Math.abs(error) < 1e-10) break;

    // Derivative of cubic bezier: B'(t) = 3(1-t)²(P1-P0) + 6(1-t)t(P2-P1) + 3t²(P3-P2)
    const mt = 1 - t;
    const dt = 3 * mt * mt * (t1 - t0) + 6 * mt * t * (t2 - t1) + 3 * t * t * (t3 - t2);
    if (Math.abs(dt) < 1e-12) break;

    t -= error / dt;
    t = Math.max(0, Math.min(1, t));
  }

  return t;
}

/**
 * Evaluate a keyframe curve at a given time (in seconds).
 */
export function evaluateCurve(curve: Curve, timeSec: number): number {
  const { keyframes } = curve;

  if (keyframes.length === 0) {
    return curve.default;
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

  // Find the segment [keyA, keyB] that contains timeSec
  let keyA = keyframes[0];
  let keyB = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    const tA = timeToSeconds(keyframes[i].time);
    const tB = timeToSeconds(keyframes[i + 1].time);
    if (timeSec >= tA && timeSec <= tB) {
      keyA = keyframes[i];
      keyB = keyframes[i + 1];
      break;
    }
  }

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
  if (interp === INTERP_LINEAR) {
    const frac = (timeSec - tA) / duration;
    return keyA.value + (keyB.value - keyA.value) * frac;
  }

  // Bezier (all variants: 6,7,8,15,16,17)
  if (isBezier(interp)) {
    // Build the cubic bezier control points in (time, value) space
    const outTTime = keyA.outTangentTime ?? 0;
    const outTValue = keyA.outTangentValue ?? 0;
    const inTTime = keyB.inTangentTime ?? 0;
    const inTValue = keyB.inTangentValue ?? 0;

    // Time control points (in seconds)
    const timeP0 = tA;
    const timeP1 = tA + outTTime;      // outgoing tangent time offset
    const timeP2 = tB + inTTime;       // incoming tangent time offset (negative = before keyB)
    const timeP3 = tB;

    // Value control points
    const valP0 = keyA.value;
    const valP1 = keyA.value + outTValue;   // outgoing tangent value offset
    const valP2 = keyB.value + inTValue;    // incoming tangent value offset
    const valP3 = keyB.value;

    // Find parameter t that gives us the desired time
    const t = solveBezierT(timeSec, timeP0, timeP1, timeP2, timeP3);

    // Evaluate value at parameter t
    return cubicBezier(t, valP0, valP1, valP2, valP3);
  }

  // Fallback: linear
  const frac = (timeSec - tA) / duration;
  return keyA.value + (keyB.value - keyA.value) * frac;
}

/**
 * Resolve a parameter value that may be a static number or an animated curve.
 */
export function resolveValue(value: number | Curve | undefined, timeSec: number, defaultVal: number = 0): number {
  if (value === undefined) return defaultVal;
  if (typeof value === 'number') return value;
  return evaluateCurve(value, timeSec);
}
