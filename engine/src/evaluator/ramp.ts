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
 *
 * FULL-SPAN RAMP COMPRESSION (2026-07-24, Movements__Swing). A ramp whose authored
 * window spans (nearly) the WHOLE scene does NOT run over its full [in,out]; the FCP
 * transition host compresses it to the sub-window [out/3, out/2] — it HOLDS the start
 * value until out/3, ramps to the end value by out/2, then holds. DECODE-DERIVED, not
 * fit: with the FCP-headless oracle (ozengine.render_frame — the SAME binary that makes
 * the golden), verified by controlled `out`-scaling (3 pts, exact): content onset at
 * EXACTLY out/3 (rx=0 at 0.3333*out, first pixels 0.3384*out), full at EXACTLY out/2
 * (0.5000*out), held after. Both endpoints scale linearly with `out`. Confirmed NOT the
 * value formula (solveNode disasm = our raised-cosine curvature blend, byte-for-byte),
 * NOT geometry (projectQuad correct — the engine matches FCP to 40.19 dB once the window
 * is right), NOT the media retime (freeze: no change), NOT sceneSettings frameRate
 * (30->60: no change).
 *
 * SCOPED to full-span ramps: Replicator/Clones/Multi authors a SHORT scale ramp
 * (out=0.267s on a 2.333s scene) and the oracle shows it completes at its full authored
 * `out` (0.267s), NOT out/2 — so a blanket [out/3,out/2] would REGRESS Multi. The gate
 * `spanRamp` (authored window >= 90% of the scene span) selects only the whole-scene
 * ramps (Swing) and leaves short ramps (Multi) on the faithful [in,out] path. The exact
 * transition-host mechanism that yields [out/3, out/2] for a whole-scene ramp is still
 * under RE (likely the solveNode caller's object time-range / OZScene timebase); the
 * [1/3,1/2] endpoints themselves are the measured FCP response, gated to avoid Multi.
 */
function rampProgress(b: SceneBehavior, timeSec: number, ectx: EvalCtx, allowSpanCompress = false): number {
  const startFrameOffset = b.params['Start Frame Offset'] ?? b.params['Start Offset'] ?? 0;
  const endFrameOffset = b.params['End Frame Offset'] ?? b.params['End Offset'] ?? 0;
  const startSec = (b.timing ? timeToSeconds(b.timing.in) : 0) + startFrameOffset / ectx.fps;
  const endSec = (b.timing ? timeToSeconds(b.timing.out) : 0) + endFrameOffset / ectx.fps;
  const authored = endSec - startSec;
  if (authored <= 0) return timeSec >= endSec ? 1 : 0;
  // A whole-scene ramp (authored window >= 90% of the scene span) is compressed by the
  // transition host to [out/3, out/2] (hold start until out/3, reach end by out/2, hold).
  // Only for TRANSFORM ramps (allowSpanCompress) — the whole-scene-ramp behavior was
  // decoded on Swing's rotation ramp; opacity/fade ramps stay on the faithful [in,out].
  const span = ectx.animationEndSec ?? authored;
  const spanRamp = allowSpanCompress && authored >= 0.9 * span;
  const winStart = spanRamp ? startSec + authored / 3 : startSec;
  const winEnd = spanRamp ? startSec + authored / 2 : endSec;
  const dur = winEnd - winStart;
  if (dur <= 0) return timeSec >= winEnd ? 1 : 0;
  const t = (timeSec - winStart) / dur;
  return t < 0 ? 0 : t > 1 ? 1 : t;
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
    const t = rampProgress(b, timeSec, ectx, /*allowSpanCompress*/ true);
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
