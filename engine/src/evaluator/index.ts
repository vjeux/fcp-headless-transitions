/**
 * Evaluator: MotrScene + time → EvaluatedScene
 *
 * For each layer at a given time:
 *   - Evaluate all animated parameters (keyframe interpolation)
 *   - Build world-transform matrices (parent × child composition)
 *   - Determine visibility (timing in/out, opacity=0)
 *   - Resolve filter parameters
 *
 * Motion's transform order (applied from anchor point):
 *   1. Translate to anchor point
 *   2. Scale
 *   3. Rotate (Z, then Y, then X)
 *   4. Translate to position
 *
 * Coordinate system:
 *   - Origin at CENTER of frame
 *   - Y-up (positive Y = up)
 *   - Angles in degrees, clockwise positive
 */
import type { MotrScene, Layer, Curve, Transform } from '../types.js';
import { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';

export { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';

// ============================================================================
// Transform Matrix (4x4 stored as Float64Array[16], column-major)
// ============================================================================

/** Create a 4x4 identity matrix. */
export function mat4Identity(): Float64Array {
  const m = new Float64Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}

/** Multiply two 4x4 matrices: result = a × b. */
export function mat4Multiply(a: Float64Array, b: Float64Array): Float64Array {
  const r = new Float64Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row + k * 4] * b[k + col * 4];
      }
      r[row + col * 4] = sum;
    }
  }
  return r;
}

/** Create a translation matrix. */
export function mat4Translate(tx: number, ty: number, tz: number): Float64Array {
  const m = mat4Identity();
  m[12] = tx; m[13] = ty; m[14] = tz;
  return m;
}

/** Create a scale matrix. */
export function mat4Scale(sx: number, sy: number, sz: number): Float64Array {
  const m = mat4Identity();
  m[0] = sx; m[5] = sy; m[10] = sz;
  return m;
}

/** Create a rotation matrix around Z axis (angle in degrees). */
export function mat4RotateZ(degrees: number): Float64Array {
  const rad = degrees * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const m = mat4Identity();
  m[0] = c; m[1] = s;
  m[4] = -s; m[5] = c;
  return m;
}

/** Create a rotation matrix around X axis (angle in degrees). */
export function mat4RotateX(degrees: number): Float64Array {
  const rad = degrees * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const m = mat4Identity();
  m[5] = c; m[6] = s;
  m[9] = -s; m[10] = c;
  return m;
}

/** Create a rotation matrix around Y axis (angle in degrees). */
export function mat4RotateY(degrees: number): Float64Array {
  const rad = degrees * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  const m = mat4Identity();
  m[0] = c; m[2] = -s;
  m[8] = s; m[10] = c;
  return m;
}

// ============================================================================
// Evaluated Layer
// ============================================================================

/** A fully-evaluated layer ready for compositing. */
export interface EvaluatedLayer {
  layer: Layer;
  /** Local transform matrix (this layer only). */
  localTransform: Float64Array;
  /** World transform matrix (accumulated parent transforms). */
  worldTransform: Float64Array;
  /** Opacity 0-1 (after evaluating the animated Opacity param, which is 0-100 in Motion). */
  opacity: number;
  /** Crop in pixels from each edge. */
  crop: { left: number; right: number; top: number; bottom: number };
  /** Whether this layer is visible (within timing range, opacity>0). */
  visible: boolean;
  /** Evaluated children (for groups). */
  children: EvaluatedLayer[];
}

export interface EvaluatedScene {
  layers: EvaluatedLayer[];
  time: number;
  width: number;
  height: number;
}

// ============================================================================
// Build Transform Matrix from evaluated params
// ============================================================================

function buildTransformMatrix(tx: Transform, timeSec: number): Float64Array {
  const posX = resolveValue(tx.positionX, timeSec, 0);
  const posY = resolveValue(tx.positionY, timeSec, 0);
  const posZ = resolveValue(tx.positionZ, timeSec, 0);
  const rotX = resolveValue(tx.rotationX, timeSec, 0);
  const rotY = resolveValue(tx.rotationY, timeSec, 0);
  const rotZ = resolveValue(tx.rotationZ, timeSec, 0);
  const scX = resolveValue(tx.scaleX, timeSec, 100) / 100; // Motion uses percent
  const scY = resolveValue(tx.scaleY, timeSec, 100) / 100;
  const scZ = resolveValue(tx.scaleZ, timeSec, 100) / 100;
  const ancX = resolveValue(tx.anchorX, timeSec, 0);
  const ancY = resolveValue(tx.anchorY, timeSec, 0);

  // Transform order (Motion's documented order):
  // 1. Translate to -anchor
  // 2. Scale
  // 3. Rotate Z, Y, X
  // 4. Translate to position

  let m = mat4Identity();
  // Translate to position
  m = mat4Multiply(mat4Translate(posX, posY, posZ), m);
  // Rotate
  if (rotZ !== 0) m = mat4Multiply(mat4RotateZ(rotZ), m);
  if (rotY !== 0) m = mat4Multiply(mat4RotateY(rotY), m);
  if (rotX !== 0) m = mat4Multiply(mat4RotateX(rotX), m);
  // Scale
  if (scX !== 1 || scY !== 1 || scZ !== 1) m = mat4Multiply(mat4Scale(scX, scY, scZ), m);
  // Translate by -anchor (applied first = rightmost in column-major multiply)
  if (ancX !== 0 || ancY !== 0) m = mat4Multiply(mat4Translate(-ancX, -ancY, 0), m);

  return m;
}

// ============================================================================
// Evaluate a layer tree
// ============================================================================

function isLayerVisible(layer: Layer, timeSec: number): boolean {
  if (!layer.timing) return true;
  const inTime = timeToSeconds(layer.timing.in);
  const outTime = timeToSeconds(layer.timing.out);
  return timeSec >= inTime && timeSec <= outTime;
}

function evaluateLayer(layer: Layer, timeSec: number, parentTransform: Float64Array): EvaluatedLayer {
  const visible = isLayerVisible(layer, timeSec);
  const localTransform = buildTransformMatrix(layer.transform, timeSec);
  const worldTransform = mat4Multiply(parentTransform, localTransform);

  // Opacity: Motion stores 0-100, we normalize to 0-1
  const rawOpacity = resolveValue(layer.transform.opacity, timeSec, 100);
  const opacity = Math.max(0, Math.min(1, rawOpacity / 100));

  // Crop
  const crop = {
    left: resolveValue(layer.transform.cropLeft, timeSec, 0),
    right: resolveValue(layer.transform.cropRight, timeSec, 0),
    top: resolveValue(layer.transform.cropTop, timeSec, 0),
    bottom: resolveValue(layer.transform.cropBottom, timeSec, 0),
  };

  // Evaluate children
  const children = layer.children.map(child => evaluateLayer(child, timeSec, worldTransform));

  return {
    layer,
    localTransform,
    worldTransform,
    opacity: visible ? opacity : 0,
    crop,
    visible: visible && opacity > 0,
    children,
  };
}

// ============================================================================
// Main evaluate entry point
// ============================================================================

export function evaluate(scene: MotrScene, timeSec: number): EvaluatedScene {
  const parentTransform = mat4Identity();
  const layers = scene.layers.map(layer => evaluateLayer(layer, timeSec, parentTransform));

  return {
    layers,
    time: timeSec,
    width: scene.settings.width,
    height: scene.settings.height,
  };
}
