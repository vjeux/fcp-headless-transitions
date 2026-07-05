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

/**
 * OffsetFrom mode for the Scrub retiming behavior. Decompiled from
 * `OZScrubRetimeBehavior::getOffsetFromValue` (Behaviors.ozp @ 0x7f978):
 *   getValueAsInt(kCMTimeZero) == 1 → returns 1  (offset from behavior START)
 *   otherwise                        → returns 0  (offset from the CURRENT frame)
 * so the behavior only ever passes 0 or 1 into RetimingMath::scrub.
 */
export const enum ScrubOffsetFrom {
  Current = 0, // scrubbed frame = objectFrame  + frameOffset
  Start = 1,   // scrubbed frame = offsetFrames + frameOffset
}

export interface ScrubBehavior {
  /** The behavior's timing-window start, in source FRAMES (getOffsetFrames). */
  offsetFrames: number;
  /** The behavior's timing-window end, in source FRAMES (getEndFrames). */
  endFrames: number;
  /** OffsetFrom selector (Current=0 / Start=1) — OZScrubRetimeBehavior::getOffsetFromValue. */
  offsetFrom: ScrubOffsetFrom;
}

/**
 * Evaluate the Scrub retiming behavior → the retimed SOURCE frame index that a
 * clip should display at object-time `objectFrame`.
 *
 * EXACT formula decompiled from `RetimingMath::scrub(double,double,double,double,OffsetFrom)`
 * (RetimingMath.framework, arm64 @ 0x5c68). The disassembly is only 9 instructions:
 *
 *   scrub(d0=objectFrame, d1=offsetFrames, d2=endFrames, d3=frameOffset, w0=offsetFrom):
 *     0x5c68  fcmp   d0, d1                 ; objectFrame vs offsetFrames
 *     0x5c6c  fccmp  d0, d2, #0, pl         ; if (objectFrame >= offsetFrames) also cmp vs endFrames
 *     0x5c70  b.pl   0x5c90                 ; if (objectFrame >= offsetFrames && >= endFrames) → ret objectFrame
 *     0x5c74  cmp    w0, #1
 *     0x5c78  b.eq   0x5c8c                 ; offsetFrom == 1 (Start) → offsetFrames + frameOffset
 *     0x5c7c  fadd   d1, d0, d3             ; tmp = objectFrame + frameOffset
 *     0x5c80  cmp    w0, #0
 *     0x5c84  fcsel  d0, d0, d1, ne         ; w0 != 0 → objectFrame (unchanged); w0 == 0 → tmp
 *     0x5c88  ret
 *     0x5c8c  fadd   d0, d1, d3 ; ret       ; offsetFrames + frameOffset
 *     0x5c90  ret                           ; objectFrame
 *
 * In words: while the object time is still WITHIN the scrub window
 * (objectFrame < offsetFrames OR objectFrame < endFrames), the source frame is
 * displaced by the animated "Frame Offset" channel value; once the object time
 * has passed BOTH window bounds the clip plays through untouched. The base the
 * offset adds to is the window START (offsetFrom==1) or the CURRENT object frame
 * (offsetFrom==0). Any other enum value (≥2) leaves the frame unchanged.
 *
 * @param frameOffset - the animated "Frame Offset" (id=200) channel value at this
 *                       time, in frames (OZScrubRetimeBehavior::getOffsetValue @ 0x7f96c).
 * @param objectFrame - the clip's own object time in frames (figToFrames of the sample time).
 */
export function evaluateScrub(
  behavior: ScrubBehavior,
  objectFrame: number,
  frameOffset: number,
): number {
  const { offsetFrames, endFrames, offsetFrom } = behavior;
  // fcmp/fccmp/b.pl: past BOTH window bounds → no scrub.
  if (objectFrame >= offsetFrames && objectFrame >= endFrames) return objectFrame;
  if (offsetFrom === 1) return offsetFrames + frameOffset; // Start
  if (offsetFrom === 0) return objectFrame + frameOffset;  // Current
  return objectFrame; // any other OffsetFrom enum value → unchanged
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
