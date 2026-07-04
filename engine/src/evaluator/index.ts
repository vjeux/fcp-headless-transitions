/**
 * Evaluator: MotrScene + time → EvaluatedScene
 *
 * For each layer at a given time:
 *   - Evaluate all animated parameters (keyframe interpolation)
 *   - Resolve transform matrices
 *   - Evaluate filter parameters
 *   - Determine visibility (timing in/out, enabled)
 */
import type { MotrScene, Layer, Curve, Keyframe } from '../types.js';

/** A fully-evaluated layer ready for compositing. */
export interface EvaluatedLayer {
  layer: Layer;
  worldTransform: Float64Array; // 4x4 matrix
  opacity: number;
  crop: { left: number; right: number; top: number; bottom: number };
  visible: boolean;
  filterParams: Map<string, Map<string, number>>;
  children: EvaluatedLayer[];
}

export interface EvaluatedScene {
  layers: EvaluatedLayer[];
  time: number;
}

/** Evaluate a bezier keyframe curve at a given time (seconds). */
export function evaluateCurve(curve: Curve, timeSec: number): number {
  if (!curve.keyframes.length) return curve.default;
  // TODO: implement full bezier interpolation
  return curve.default;
}

export function evaluate(scene: MotrScene, timeSec: number): EvaluatedScene {
  // TODO: implement full evaluation
  return { layers: [], time: timeSec };
}
