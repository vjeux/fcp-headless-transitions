/**
 * Animation behaviors — procedural parameter animators.
 *
 * Behaviors compute parameter values over time algorithmically (vs keyframes).
 * Used by many transitions for fades, ramps, oscillation, spin, etc.
 *
 * Times are in FRAMES (behavior offsets are frame counts relative to the clip).
 */

export interface FadeBehavior {
  fadeInTime: number;   // frames
  fadeOutTime: number;  // frames
  /** Behavior timing window start, in the SAME frame units as `frame`. */
  windowIn: number;
  /** Behavior timing window end, in the SAME frame units as `frame`. */
  windowOut: number;
}

/**
 * Evaluate a Fade In/Fade Out behavior → opacity multiplier (0-1).
 *
 * The Fade In/Fade Out behavior in Motion ramps opacity within the behavior's
 * own `<timing in out offset>` window (NOT generic Start/End Offset params):
 *   - Fade In:  opacity ramps 0→1 over `fadeInTime` frames starting at `windowIn`.
 *   - Fade Out: opacity ramps 1→0 over `fadeOutTime` frames ending at `windowOut`.
 *   - Before the fade-in completes / after the fade-out starts, opacity is held
 *     (0 outside the visible portion, 1 in the fully-visible middle).
 *
 * @param frame - current frame (must be in the same units as windowIn/windowOut)
 */
export function evaluateFade(behavior: FadeBehavior, frame: number): number {
  const { fadeInTime, fadeOutTime, windowIn, windowOut } = behavior;

  let mult = 1;

  // Fade in region: [windowIn, windowIn + fadeInTime]
  if (fadeInTime > 0) {
    if (frame <= windowIn) mult = 0;
    else if (frame < windowIn + fadeInTime) mult = (frame - windowIn) / fadeInTime;
  }

  // Fade out region: [windowOut - fadeOutTime, windowOut]
  if (fadeOutTime > 0) {
    let out = 1;
    if (frame >= windowOut) out = 0;
    else if (frame > windowOut - fadeOutTime) out = (windowOut - frame) / fadeOutTime;
    mult = Math.min(mult, out);
  }

  return mult;
}

export interface RampBehavior {
  startValue: number;
  endValue: number;
  /**
   * Curvature — raw channel value from the .motr (an OZChannelPercent). 0 = linear.
   * Positive blends toward a raised-cosine ease-in-ease-out; negative overshoots
   * the linear ramp in the opposite direction.
   */
  curvature: number;
}

/**
 * Ease a normalized ramp progress `t` (0..1) by the Ramp's Curvature, using the
 * EXACT formula decompiled from `OZRampBehavior::solveNode` (Behaviors.ozp):
 *
 *   s        = (1 - cos(π·t)) / 2          // raised-cosine ease
 *   eased_t  = curvature·s + (1 - curvature)·t
 *
 * i.e. a linear blend between linear `t` and the raised-cosine ease `s`, weighted
 * by the raw curvature value. Curvature 0 → pure linear. Curvature 1 → pure ease.
 * (Disassembly: d10=t, d11=curvature; d0=(1-cos(πt))·0.5; d0=curv·d0;
 *  d1=(1-curv)·t; eased = d0+d1.)
 */
export function applyRampCurvature(t: number, curvature: number): number {
  if (curvature === 0) return t;
  const s = (1 - Math.cos(Math.PI * t)) / 2;
  return curvature * s + (1 - curvature) * t;
}

/**
 * Evaluate a Ramp behavior → the ramped value at a normalized progress `t`.
 *
 * `t` is the linear fraction through the Ramp's own timing window, clamped to
 * [0, 1] (before the window → startValue; after → endValue). The curvature ease
 * is applied to `t`, then the value is interpolated:
 *
 *   value = startValue + (endValue - startValue) · easedT
 *
 * (Matches OZRampBehavior::solveNode: base=startValue, delta=endValue-startValue,
 *  result = base + delta·easedT.)
 */
export function evaluateRampAtProgress(behavior: RampBehavior, t: number): number {
  const { startValue, endValue, curvature } = behavior;
  const clamped = Math.max(0, Math.min(1, t));
  const easedT = applyRampCurvature(clamped, curvature);
  return startValue + (endValue - startValue) * easedT;
}

export interface OscillateBehavior {
  amplitude: number;
  frequency: number;   // cycles per duration (or per second)
  phase: number;       // degrees
}

/**
 * Evaluate an Oscillate behavior → oscillating offset value.
 * @param timeSec - current time in seconds
 */
export function evaluateOscillate(behavior: OscillateBehavior, timeSec: number): number {
  const { amplitude, frequency, phase } = behavior;
  const phaseRad = phase * Math.PI / 180;
  return amplitude * Math.sin(2 * Math.PI * frequency * timeSec + phaseRad);
}

export interface SpinBehavior {
  rate: number; // degrees per second
}

/**
 * Evaluate a Spin behavior → rotation angle in degrees.
 */
export function evaluateSpin(behavior: SpinBehavior, timeSec: number): number {
  return behavior.rate * timeSec;
}
