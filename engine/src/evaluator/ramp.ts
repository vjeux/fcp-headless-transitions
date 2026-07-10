/**
 * Evaluator — Ramp + Fade behavior application.
 *
 * Scene Ramp behaviors that drive transform channels (applyRampTransforms) or opacity
 * (applyRampOpacity), and Fade behaviors that drive opacity (applyFadeBehaviors), plus
 * the shared rampProgress helper (normalized 0..1 over the behavior's timing window).
 * Split out of evaluator/index.ts (ROADMAP item 7).
 */
import type { Layer, Transform, SceneBehavior } from '../types.js';
import type { EvalCtx } from './context.js';
import { evaluateFade, evaluateRampAtProgress } from './behaviors/index.js';
import { timeToSeconds } from './curves.js';

/**
 * Compute a Ramp behavior's normalized progress `t` (0..1) at `timeSec`, using
 * the behavior's own `<timing in out offset>` window (scene seconds) plus the
 * Start/End Frame Offset channels (in frames). Matches OZRampBehavior::solveNode,
 * which anchors the ramp to [sceneStart + startFrameOffset, sceneEnd + endFrameOffset]
 * where sceneStart/End come from the behavior timing.
 */
function rampProgress(b: SceneBehavior, timeSec: number, ectx: EvalCtx): number {
  const startFrameOffset = b.params['Start Frame Offset'] ?? b.params['Start Offset'] ?? 0;
  const endFrameOffset = b.params['End Frame Offset'] ?? b.params['End Offset'] ?? 0;
  const startSec = (b.timing ? timeToSeconds(b.timing.in) : 0) + startFrameOffset / ectx.fps;
  const endSec = (b.timing ? timeToSeconds(b.timing.out) : 0) + endFrameOffset / ectx.fps;
  const dur = endSec - startSec;
  if (dur <= 0) return timeSec >= endSec ? 1 : 0;
  return (timeSec - startSec) / dur;
}

/**
 * Apply scene Ramp behaviors that drive TRANSFORM channels (rotation/position/
 * scale) of this layer. The ramped value overwrites the corresponding channel.
 * Returns the (possibly modified) transform. Rig-driven transforms already ran.
 */
export function applyRampTransforms(
  layer: Layer,
  transform: Transform,
  sceneBehaviors: SceneBehavior[],
  timeSec: number,
  ectx: EvalCtx
): Transform {
  let result = transform;
  for (const b of sceneBehaviors) {
    if (b.type !== 'ramp') continue;
    if (b.affectedObjectId !== layer.id) continue;
    if (!b.targetChannel || b.targetChannel === 'opacity') continue;
    const startValue = b.params['Start Value'] ?? 0;
    const endValue = b.params['End Value'] ?? 0;
    const curvature = b.params['Curvature'] ?? 0;
    // A ramp with no motion (start==end) contributes nothing.
    if (startValue === endValue) continue;
    const t = rampProgress(b, timeSec, ectx);
    const value = evaluateRampAtProgress({ startValue, endValue, curvature }, t);
    if (result === transform) result = { ...transform };
    switch (b.targetChannel) {
      case 'rotationX': result.rotationX = value; break;
      case 'rotationY': result.rotationY = value; break;
      case 'rotationZ': result.rotationZ = value; break;
      case 'positionX': result.positionX = value; break;
      case 'positionY': result.positionY = value; break;
      case 'positionZ': result.positionZ = value; break;
      case 'scaleX': // uniform scale channel → all axes
        result.scaleX = value; result.scaleY = value; result.scaleZ = value; break;
    }
  }
  return result;
}

/**
 * Compute the combined opacity MULTIPLIER from scene Ramp behaviors on a layer
 * that drive opacity (either an explicit opacity channel or a legacy 0..1 range
 * heuristic). Transform-channel ramps are handled by applyRampTransforms.
 */
export function applyRampOpacity(
  layer: Layer,
  sceneBehaviors: SceneBehavior[],
  timeSec: number,
  ectx: EvalCtx
): number {
  let opacityMult = 1;
  for (const b of sceneBehaviors) {
    if (b.type !== 'ramp') continue;
    if (b.affectedObjectId !== layer.id) continue;
    const startValue = b.params['Start Value'] ?? 0;
    const endValue = b.params['End Value'] ?? 0;
    const curvature = b.params['Curvature'] ?? 0;
    const isOpacity = b.targetChannel === 'opacity';
    // Legacy heuristic: an unresolved ramp whose range is within [0,1] is treated
    // as an opacity ramp. Resolved transform-channel ramps are NOT opacity.
    const heuristicOpacity = !b.targetChannel && Math.abs(startValue) <= 1.01 && Math.abs(endValue) <= 1.01;
    if (!isOpacity && !heuristicOpacity) continue;
    const t = rampProgress(b, timeSec, ectx);
    const rampVal = evaluateRampAtProgress({ startValue, endValue, curvature }, t);
    opacityMult *= Math.max(0, Math.min(1, rampVal));
  }
  return opacityMult;
}

export function applyFadeBehaviors(layer: Layer, timeSec: number, ectx: EvalCtx): number {
  if (!layer.behaviors) return 1;
  let mult = 1;
  for (const b of layer.behaviors) {
    if (b.type !== 'fade') continue;
    const fadeInFrames = b.params['Fade In Time'] ?? 0;
    const fadeOutFrames = b.params['Fade Out Time'] ?? 0;

    // The behavior's <timing in out> window defines the fade anchors, in scene
    // time. Fall back to the layer's own timing if the behavior lacks one.
    const tim = b.timing ?? layer.timing;
    if (!tim) continue;
    const windowIn = timeToSeconds(tim.in);
    const windowOut = timeToSeconds(tim.out);

    // Fade In/Out Times are frame counts. Convert to seconds via the scene fps so
    // everything lives in the same (scene-time) domain as the timing window.
    const fadeInSec = fadeInFrames / ectx.fps;
    const fadeOutSec = fadeOutFrames / ectx.fps;

    mult *= evaluateFade(
      { fadeInTime: fadeInSec, fadeOutTime: fadeOutSec, windowIn, windowOut },
      timeSec,
    );
  }
  return mult;
}
