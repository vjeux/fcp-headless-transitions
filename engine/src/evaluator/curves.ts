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
  if (interp === INTERP_LINEAR) {
    const frac = (timeSec - tA) / duration;
    return keyA.value + (keyB.value - keyA.value) * frac;
  }

  // Bezier / smooth (all variants: 6,7,8,15,16,17).
  //
  // IMPORTANT: Motion does NOT use the tangent handles stored in the .motr file.
  // Verified empirically against the real Ozone engine by editing keyframe
  // tangents in a template and re-rendering: perturbing (even zeroing or setting
  // extreme) inputTangent/outputTangent values had ZERO effect on the output,
  // while changing a keyframe VALUE scaled the motion exactly. Motion recomputes
  // smooth tangents on load from the keyframe (time, value) points alone:
  //
  //   • Interior keyframe slope = Catmull-Rom centered difference:
  //       m_i = (v[i+1] - v[i-1]) / (t[i+1] - t[i-1])
  //   • Endpoint slopes = 0  (the animation eases from / to rest)
  //   • Cubic Hermite, control points placed at 1/3 of the segment in time.
  //
  // This reproduces the real engine to ~1.6px (a 2-keyframe curve becomes exact
  // smoothstep 3u²−2u³; a multi-keyframe ramp becomes a single ease-in → constant
  // → ease-out sweep instead of one accelerate/decelerate hump per segment).
  if (isBezier(interp)) {
    const n = keyframes.length;
    const slopeAt = (i: number): number => {
      if (i <= 0 || i >= n - 1) return 0; // zero-velocity endpoints
      const tPrev = timeToSeconds(keyframes[i - 1].time);
      const tNext = timeToSeconds(keyframes[i + 1].time);
      const span = tNext - tPrev;
      if (span <= 0) return 0;
      return (keyframes[i + 1].value - keyframes[i - 1].value) / span;
    };

    const mA = slopeAt(segIndex);
    const mB = slopeAt(segIndex + 1);

    // Hermite → cubic Bézier: value control points at 1/3 of the segment.
    const valP0 = keyA.value;
    const valP1 = keyA.value + mA * duration / 3;
    const valP2 = keyB.value - mB * duration / 3;
    const valP3 = keyB.value;

    // Time is uniform within the segment (control times at 1/3 spacing), so the
    // Bézier parameter is just the normalized time — no time-warp inversion.
    const u = (timeSec - tA) / duration;
    return cubicBezier(u, valP0, valP1, valP2, valP3);
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
