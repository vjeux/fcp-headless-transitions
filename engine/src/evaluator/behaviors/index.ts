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
  curvature: number;   // -100..100, 0 = linear
  startOffset: number; // frames
  endOffset: number;   // frames
}

/**
 * Evaluate a Ramp behavior → the ramped value at the given frame.
 * Ramps from startValue to endValue over the duration, with optional easing curvature.
 */
export function evaluateRamp(behavior: RampBehavior, frame: number, totalFrames: number): number {
  const { startValue, endValue, curvature, startOffset, endOffset } = behavior;

  const start = startOffset;
  const end = totalFrames + endOffset;
  const duration = end - start;

  if (duration <= 0) return startValue;

  let t = (frame - start) / duration;
  t = Math.max(0, Math.min(1, t));

  // Apply curvature (ease in/out)
  if (curvature !== 0) {
    const c = curvature / 100; // -1..1
    if (c > 0) {
      // Ease: smoothstep-like
      t = t * t * (3 - 2 * t) * c + t * (1 - c);
    } else {
      // Inverse ease (accelerate)
      const eased = t * t * (3 - 2 * t);
      t = eased * (-c) + t * (1 + c);
    }
  }

  return startValue + (endValue - startValue) * t;
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
