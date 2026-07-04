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
import type { MotrScene, Layer, Curve, Transform, RigWidget, RigBehavior, Parameter, SceneBehavior } from '../types.js';
import { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';
import { evaluateFade, evaluateRamp, evaluateOscillate, evaluateSpin } from './behaviors/index.js';

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


/**
 * Compute the Retime progress (0-1) for a layer at a given time.
 * Retime Value curve maps host time → template frame number.
 * Progress = (currentFrame - firstFrame) / (lastFrame - firstFrame).
 */

/**
 * Build a map of widget ID → current value for fast lookup.
 */
function buildWidgetValueMap(widgets: RigWidget[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const w of widgets) map.set(w.id, w.value);
  return map;
}

/**
 * Extract a Curve or static value from a snapshot parameter's named sub-parameter.
 */
function getSnapshotValue(snapshot: Parameter, coordName: string): Curve | number | undefined {
  if (!snapshot.children) {
    // The snapshot itself might be the value (for scalar params like Opacity)
    if (snapshot.name === coordName || coordName === '') {
      if (snapshot.curve) return snapshot.curve;
      if (typeof snapshot.value === 'number') return snapshot.value;
    }
    return undefined;
  }
  for (const child of snapshot.children) {
    if (child.name === coordName) {
      if (child.curve) return child.curve;
      if (typeof child.value === 'number') return child.value;
    }
  }
  return undefined;
}

/**
 * Apply rig behaviors to a layer's transform.
 * For each behavior affecting this layer, select the snapshot matching the widget's
 * current value and override the corresponding transform parameters.
 */
function applyRigBehaviors(
  layer: Layer,
  transform: Transform,
  behaviors: RigBehavior[],
  widgetValues: Map<number, number>
): Transform {
  const result = { ...transform };

  for (const behavior of behaviors) {
    if (behavior.affectedObjectId !== layer.id) continue;

    const rawValue = widgetValues.get(behavior.widgetId) ?? 0;
    // Widget values may be fractional (e.g. aspect ratios) or discrete indices.
    // Round to nearest integer and clamp to the valid snapshot range.
    let snapIndex = Math.round(rawValue);
    snapIndex = Math.max(0, Math.min(behavior.snapshots.length - 1, snapIndex));
    const snapshot = behavior.snapshots[snapIndex];
    if (!snapshot) continue;

    // Apply the snapshot's parameters based on the controlled param type
    switch (behavior.paramType) {
      case 'Position': {
        const x = getSnapshotValue(snapshot, 'X');
        const y = getSnapshotValue(snapshot, 'Y');
        const z = getSnapshotValue(snapshot, 'Z');
        if (x !== undefined) result.positionX = x;
        if (y !== undefined) result.positionY = y;
        if (z !== undefined) result.positionZ = z;
        break;
      }
      case 'Scale': {
        const x = getSnapshotValue(snapshot, 'X');
        const y = getSnapshotValue(snapshot, 'Y');
        const z = getSnapshotValue(snapshot, 'Z');
        if (x !== undefined) result.scaleX = x;
        if (y !== undefined) result.scaleY = y;
        if (z !== undefined) result.scaleZ = z;
        break;
      }
      case 'Rotation': {
        const x = getSnapshotValue(snapshot, 'X');
        const y = getSnapshotValue(snapshot, 'Y');
        const z = getSnapshotValue(snapshot, 'Z');
        if (x !== undefined) result.rotationX = x;
        if (y !== undefined) result.rotationY = y;
        if (z !== undefined) result.rotationZ = z;
        break;
      }
      case 'Opacity': {
        const op = getSnapshotValue(snapshot, 'Opacity') ?? getSnapshotValue(snapshot, '');
        if (op !== undefined) result.opacity = op;
        break;
      }
    }
  }

  return result;
}


/**
 * Compute the combined opacity multiplier from Fade behaviors on a layer.
 * Fade times are in frames; we convert the current time to frames via the scene fps.
 */

/**
 * Compute additive Ramp contributions for a layer from scene behaviors.
 * Ramp behaviors that affect this layer's object ID contribute a ramped value
 * (Start Value → End Value over the transition) to the target parameter.
 * Returns a map of contributions (currently: opacity multiplier).
 */
function applyRampBehaviors(
  layer: Layer,
  sceneBehaviors: SceneBehavior[],
  frame: number,
  totalFrames: number
): number {
  let opacityMult = 1;
  for (const b of sceneBehaviors) {
    if (b.affectedObjectId !== layer.id) continue;
    if (b.type === 'ramp') {
      const startValue = b.params['Start Value'] ?? 0;
      const endValue = b.params['End Value'] ?? 0;
      const curvature = b.params['Curvature'] ?? 0;
      const startOffset = b.params['Start Offset'] ?? 0;
      const endOffset = b.params['End Offset'] ?? 0;
      const rampVal = evaluateRamp({ startValue, endValue, curvature, startOffset, endOffset }, frame, totalFrames);
      // Ramps that go 0→1 or 1→0 typically drive opacity; clamp as a multiplier
      // Only apply as opacity if the range is within [0, 1] (heuristic for opacity ramps)
      if (Math.abs(startValue) <= 1.01 && Math.abs(endValue) <= 1.01) {
        opacityMult *= Math.max(0, Math.min(1, rampVal));
      }
    }
  }
  return opacityMult;
}

function applyFadeBehaviors(layer: Layer, frame: number, totalFrames: number): number {
  if (!layer.behaviors) return 1;
  let mult = 1;
  for (const b of layer.behaviors) {
    if (b.type === 'fade') {
      const fadeInTime = b.params['Fade In Time'] ?? 0;
      const fadeOutTime = b.params['Fade Out Time'] ?? 0;
      const startOffset = b.params['Start Offset'] ?? 0;
      const endOffset = b.params['End Offset'] ?? 0;
      mult *= evaluateFade({ fadeInTime, fadeOutTime, startOffset, endOffset }, frame, totalFrames);
    }
  }
  return mult;
}

function getRetimeProgress(layer: Layer, timeSec: number): number {
  if (!layer.retimeValue || layer.retimeValue.keyframes.length < 2) return 0;
  const curve = layer.retimeValue;
  const currentFrame = evaluateCurve(curve, timeSec);
  const firstFrame = curve.keyframes[0].value;
  const lastFrame = curve.keyframes[curve.keyframes.length - 1].value;
  if (lastFrame === firstFrame) return 0;
  return Math.max(0, Math.min(1, (currentFrame - firstFrame) / (lastFrame - firstFrame)));
}


/**
 * Resolve a parameter value with Retime interpolation.
 * If the value is a curve, evaluate it normally.
 * If it's a static number and retimeProgress > 0, interpolate from defaultVal toward the value.
 */
function resolveWithRetime(value: number | Curve | undefined, timeSec: number, defaultVal: number, retimeProgress: number): number {
  if (value === undefined) return defaultVal;
  if (typeof value === 'object') {
    // Curve
    if (value.keyframes.length > 0) {
      return evaluateCurve(value, timeSec); // real keyframes → evaluate normally
    }
    // Empty curve with default→value: Retime-interpolate
    const from = value.default;
    const to = value.value !== undefined ? value.value : value.default;
    if (retimeProgress > 0 && to !== from) {
      return from + (to - from) * retimeProgress;
    }
    return from;
  }
  // Static number with retime: interpolate default → value
  if (retimeProgress > 0 && value !== defaultVal) {
    return defaultVal + (value - defaultVal) * retimeProgress;
  }
  return value;
}
function buildTransformMatrix(tx: Transform, timeSec: number, retimeProgress: number = 0): Float64Array {
  const posX = resolveWithRetime(tx.positionX, timeSec, 0, retimeProgress);
  const posY = resolveWithRetime(tx.positionY, timeSec, 0, retimeProgress);
  const posZ = resolveWithRetime(tx.positionZ, timeSec, 0, retimeProgress);
  const rotX = resolveWithRetime(tx.rotationX, timeSec, 0, retimeProgress);
  const rotY = resolveWithRetime(tx.rotationY, timeSec, 0, retimeProgress);
  const rotZ = resolveWithRetime(tx.rotationZ, timeSec, 0, retimeProgress);
  const scX = resolveWithRetime(tx.scaleX, timeSec, 100, retimeProgress) / 100; // Motion uses percent
  const scY = resolveWithRetime(tx.scaleY, timeSec, 100, retimeProgress) / 100;
  const scZ = resolveWithRetime(tx.scaleZ, timeSec, 100, retimeProgress) / 100;
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

function evaluateLayer(layer: Layer, timeSec: number, parentTransform: Float64Array, behaviors: RigBehavior[], widgetValues: Map<number, number>, sceneBehaviors: SceneBehavior[]): EvaluatedLayer {
  const visible = isLayerVisible(layer, timeSec);
  const retimeProgress = getRetimeProgress(layer, timeSec);
  const riggedTransform = applyRigBehaviors(layer, layer.transform, behaviors, widgetValues);
  const localTransform = buildTransformMatrix(riggedTransform, timeSec, retimeProgress);
  const worldTransform = mat4Multiply(parentTransform, localTransform);

  // Opacity: Motion stores 0-1 (some legacy use 0-100 but all current transitions use 0-1)
  let rawOpacity = resolveValue(riggedTransform.opacity, timeSec, 1);
  rawOpacity = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;
  // Apply Fade behaviors (frame-based). Derive frame from the Retime curve if present.
  if (layer.retimeValue && layer.retimeValue.keyframes.length >= 2) {
    const curFrame = evaluateCurve(layer.retimeValue, timeSec);
    const totalFrames = layer.retimeValue.keyframes[layer.retimeValue.keyframes.length - 1].value;
    if (layer.behaviors && layer.behaviors.some(b => b.type === 'fade')) {
      rawOpacity *= applyFadeBehaviors(layer, curFrame, totalFrames);
    }
    if (sceneBehaviors.length > 0) {
      rawOpacity *= applyRampBehaviors(layer, sceneBehaviors, curFrame, totalFrames);
    }
  }
  const opacity = Math.max(0, Math.min(1, rawOpacity));

  // Crop
  const crop = {
    left: resolveValue(layer.transform.cropLeft, timeSec, 0),
    right: resolveValue(layer.transform.cropRight, timeSec, 0),
    top: resolveValue(layer.transform.cropTop, timeSec, 0),
    bottom: resolveValue(layer.transform.cropBottom, timeSec, 0),
  };

  // Evaluate children
  const children = layer.children.map(child => evaluateLayer(child, timeSec, worldTransform, behaviors, widgetValues, sceneBehaviors));

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
  const widgetValues = buildWidgetValueMap(scene.rigWidgets);
  const behaviors = scene.rigBehaviors;
  const sceneBehaviors = scene.sceneBehaviors;
  const layers = scene.layers.map(layer => evaluateLayer(layer, timeSec, parentTransform, behaviors, widgetValues, sceneBehaviors));

  return {
    layers,
    time: timeSec,
    width: scene.settings.width,
    height: scene.settings.height,
  };
}
