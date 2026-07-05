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
import type { MotrScene, Layer, Curve, Transform, RigWidget, RigBehavior, Parameter, SceneBehavior, LinkBehavior } from '../types.js';
import { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';
import { evaluateFade, evaluateRamp, evaluateOscillate, evaluateSpin } from './behaviors/index.js';

export { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';

/**
 * Scene frame rate for the current evaluation pass. Set at the top of
 * `evaluate()`. Fade In/Out Times are expressed in frames; the behavior's
 * timing window is in seconds, so we need the fps to convert.
 */
let CURRENT_FPS = 30;


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
  /** Rig-resolved filter parameter overrides: filterId → (paramName → value). */
  filterOverrides: Map<number, Map<string, number>>;
  /** Object ID → source Layer (for clone-source resolution in the compositor). */
  layerById: Map<number, Layer>;
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
 * Build a map of object ID → Layer for driver lookups (Link behaviors, clones).
 */
function buildLayerById(layers: Layer[], map: Map<number, Layer>): Map<number, Layer> {
  for (const l of layers) {
    map.set(l.id, l);
    buildLayerById(l.children, map);
  }
  return map;
}

/** Read a driver layer's animated Position channel (X/Y/Z) at a given time. */
function driverChannelValue(driver: Layer, channel: 'X' | 'Y' | 'Z', timeSec: number): number {
  const t = driver.transform;
  const c = channel === 'X' ? t.positionX : channel === 'Y' ? t.positionY : t.positionZ;
  return resolveValue(c, timeSec, 0);
}

/**
 * Apply Link behaviors to a layer's transform. Each Link drives one Position
 * channel from a source object's channel: value = clamp(src, min, max) * scale,
 * gated by the (rig-selected) Custom Mix. When Custom Mix is 0 the link is off
 * and the channel keeps its own value.
 */
function applyLinks(
  layer: Layer,
  transform: Transform,
  linksByTarget: Map<number, import('../types.js').LinkBehavior[]>,
  layerById: Map<number, Layer>,
  widgetValues: Map<number, number>,
  timeSec: number
): Transform {
  const links = linksByTarget.get(layer.id);
  if (!links || links.length === 0) return transform;
  const result = { ...transform };
  for (const link of links) {
    const driver = layerById.get(link.sourceObjectId);
    if (!driver) continue;

    // Resolve the Custom Mix (rig-gated if a rig snapshot is present).
    let mix = link.customMix;
    if (link.rigCustomMix && link.rigWidgetId !== undefined) {
      const wv = widgetValues.get(link.rigWidgetId) ?? 0;
      const idx = Math.max(0, Math.min(link.rigCustomMix.length - 1, Math.round(wv)));
      mix = link.rigCustomMix[idx];
    }
    if (mix === 0) continue; // link inactive for this direction

    // Resolve the Scale (rig-gated per direction if a rig snapshot is present).
    // The Scale snapshots carry the per-direction sign (e.g. Left→Right vs
    // Right→Left share the X link but need opposite scale).
    let scale = link.scale;
    if (link.rigScale && link.rigWidgetId !== undefined) {
      const wv = widgetValues.get(link.rigWidgetId) ?? 0;
      const idx = Math.max(0, Math.min(link.rigScale.length - 1, Math.round(wv)));
      scale = link.rigScale[idx];
    }

    let v = driverChannelValue(driver, link.sourceChannel, timeSec);
    // Motion's "Clamp Source Value Within Range" uses min/max = ±100 as the
    // default (unset) UI sentinel; real transitions drive far past ±100 (e.g. a
    // full 1080px push). Only clamp when a non-default range is present.
    const defaultRange = link.min === -100 && link.max === 100;
    if (!defaultRange) {
      if (v < link.min) v = link.min;
      if (v > link.max) v = link.max;
    }
    v *= scale;

    // Motion's Link REPLACES the channel via a mix blend, it does NOT add to the
    // base value: result = base*(1-mix) + linkedValue*mix. When mix=1 the channel
    // becomes the linked value outright. Adding (the old behavior) double-counts
    // the clone's static base offset (e.g. Right's base X=+1920 plus a -1*Left
    // link) and shifts the clone mid-transition. The linked channel is marked as
    // an override so buildTransformMatrix skips the Retime static-position ramp.
    const overrides = result.__overrideChannels ?? (result.__overrideChannels = new Set<string>());
    if (link.targetChannel === 'X') {
      const base = resolveValue(result.positionX, timeSec, 0);
      result.positionX = base * (1 - mix) + v * mix;
      overrides.add('posX');
    } else if (link.targetChannel === 'Y') {
      const base = resolveValue(result.positionY, timeSec, 0);
      result.positionY = base * (1 - mix) + v * mix;
      overrides.add('posY');
    } else {
      const base = resolveValue(result.positionZ, timeSec, 0);
      result.positionZ = base * (1 - mix) + v * mix;
      overrides.add('posZ');
    }
  }
  return result;
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
        // A rig Position snapshot sets the channel outright (e.g. the Left clone's
        // -1920). Mark it as an override so the Retime static-position heuristic
        // does not ramp it from 0 (which would leave it at e.g. -280 mid-transition).
        const overrides = result.__overrideChannels ?? (result.__overrideChannels = new Set<string>());
        if (x !== undefined) { result.positionX = x; overrides.add('posX'); }
        if (y !== undefined) { result.positionY = y; overrides.add('posY'); }
        if (z !== undefined) { result.positionZ = z; overrides.add('posZ'); }
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

function applyFadeBehaviors(layer: Layer, timeSec: number): number {
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
    const fadeInSec = fadeInFrames / CURRENT_FPS;
    const fadeOutSec = fadeOutFrames / CURRENT_FPS;

    mult *= evaluateFade(
      { fadeInTime: fadeInSec, fadeOutTime: fadeOutSec, windowIn, windowOut },
      timeSec,
    );
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
function resolveWithRetime(value: number | Curve | undefined, timeSec: number, defaultVal: number, retimeProgress: number, bypassRetime: boolean = false): number {
  if (value === undefined) return defaultVal;
  if (typeof value === 'object') {
    // Curve
    if (value.keyframes.length > 0) {
      return evaluateCurve(value, timeSec); // real keyframes → evaluate normally
    }
    // Empty curve with default→value: Retime-interpolate (unless overridden).
    const from = value.default;
    const to = value.value !== undefined ? value.value : value.default;
    if (bypassRetime) return to; // Link/rig override: use the full value directly.
    if (retimeProgress > 0 && to !== from) {
      return from + (to - from) * retimeProgress;
    }
    return from;
  }
  // Static number: Link/rig override uses it directly (no ramp from default).
  if (bypassRetime) return value;
  // Static number with retime: interpolate default → value
  if (retimeProgress > 0 && value !== defaultVal) {
    return defaultVal + (value - defaultVal) * retimeProgress;
  }
  return value;
}
function buildTransformMatrix(tx: Transform, timeSec: number, retimeProgress: number = 0): Float64Array {
  const ov = tx.__overrideChannels;
  const posX = resolveWithRetime(tx.positionX, timeSec, 0, retimeProgress, ov?.has('posX'));
  const posY = resolveWithRetime(tx.positionY, timeSec, 0, retimeProgress, ov?.has('posY'));
  const posZ = resolveWithRetime(tx.positionZ, timeSec, 0, retimeProgress, ov?.has('posZ'));

  // Motion .motr stores rotation in RADIANS (e.g. Rotate uses π/2 for 90°). Convert to degrees
  // for the matrix helpers (which take degrees).
  const RAD2DEG = 180 / Math.PI;
  const rotX = resolveWithRetime(tx.rotationX, timeSec, 0, retimeProgress) * RAD2DEG;
  const rotY = resolveWithRetime(tx.rotationY, timeSec, 0, retimeProgress) * RAD2DEG;
  const rotZ = resolveWithRetime(tx.rotationZ, timeSec, 0, retimeProgress) * RAD2DEG;
  // Scale is FRACTIONAL (1.0 = 100%) in every .motr template (all 108 Scale curves have
  // default="1"). Used as-is — never divided by 100.
  const scX = resolveWithRetime(tx.scaleX, timeSec, 1, retimeProgress);
  const scY = resolveWithRetime(tx.scaleY, timeSec, 1, retimeProgress);
  const scZ = resolveWithRetime(tx.scaleZ, timeSec, 1, retimeProgress);
  // Anchor is retime-interpolated like position (both have default=0, value=X); they must
  // track together so a static offset (e.g. Fall's -540) cancels, leaving only the rotation pivot.
  const ancX = resolveWithRetime(tx.anchorX, timeSec, 0, retimeProgress);
  const ancY = resolveWithRetime(tx.anchorY, timeSec, 0, retimeProgress);

  // Transform order (Motion's documented order), producing the matrix
  //   M = T(position) · R · S · T(-anchor)
  // so a shape/point v maps to  position + R·S·(v - anchor).
  // Because mat4Multiply(a,b) = a·b and we left-multiply into `m`, we must build
  // from the INNERMOST (rightmost) operation outward: -anchor, then scale, then
  // rotate, then position. (The previous build order applied position FIRST,
  // which incorrectly scaled/rotated the translation — only visible when a layer
  // combines a non-origin position with scale AND rotation, e.g. the Wipes masks.)
  let m = mat4Identity();
  // Innermost: translate by -anchor
  if (ancX !== 0 || ancY !== 0) m = mat4Multiply(mat4Translate(-ancX, -ancY, 0), m);
  // Scale
  if (scX !== 1 || scY !== 1 || scZ !== 1) m = mat4Multiply(mat4Scale(scX, scY, scZ), m);
  // Rotate (X, Y, Z applied so Z is outermost of the three, matching prior code)
  if (rotX !== 0) m = mat4Multiply(mat4RotateX(rotX), m);
  if (rotY !== 0) m = mat4Multiply(mat4RotateY(rotY), m);
  if (rotZ !== 0) m = mat4Multiply(mat4RotateZ(rotZ), m);
  // Outermost: translate to position
  m = mat4Multiply(mat4Translate(posX, posY, posZ), m);

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

function evaluateLayer(layer: Layer, timeSec: number, parentTransform: Float64Array, behaviors: RigBehavior[], widgetValues: Map<number, number>, sceneBehaviors: SceneBehavior[], layerById: Map<number, Layer>, linksByTarget: Map<number, import('../types.js').LinkBehavior[]>): EvaluatedLayer {
  const visible = isLayerVisible(layer, timeSec);
  const retimeProgress = getRetimeProgress(layer, timeSec);
  let riggedTransform = applyRigBehaviors(layer, layer.transform, behaviors, widgetValues);
  // Links drive channels from a source object; apply after rig snapshots.
  riggedTransform = applyLinks(layer, riggedTransform, linksByTarget, layerById, widgetValues, timeSec);
  const localTransform = buildTransformMatrix(riggedTransform, timeSec, retimeProgress);
  const worldTransform = mat4Multiply(parentTransform, localTransform);

  // Opacity: Motion stores 0-1 (some legacy use 0-100 but all current transitions use 0-1)
  let rawOpacity = resolveValue(riggedTransform.opacity, timeSec, 1);
  rawOpacity = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;
  // Fade In/Fade Out behaviors ramp opacity within the behavior's own <timing>
  // window (scene time). These are independent of the Retime curve — the fade
  // anchors come from the behavior timing, not the retimed template frame.
  if (layer.behaviors && layer.behaviors.some(b => b.type === 'fade')) {
    rawOpacity *= applyFadeBehaviors(layer, timeSec);
  }
  // Ramp behaviors are still driven off the retimed template frame.
  if (layer.retimeValue && layer.retimeValue.keyframes.length >= 2) {
    const curFrame = evaluateCurve(layer.retimeValue, timeSec);
    const totalFrames = layer.retimeValue.keyframes[layer.retimeValue.keyframes.length - 1].value;
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
  const children = layer.children.map(child => evaluateLayer(child, timeSec, worldTransform, behaviors, widgetValues, sceneBehaviors, layerById, linksByTarget));

  // Disabled nodes (<enabled>0</enabled>) drive other objects but are never drawn.
  const drawn = layer.enabled !== false;

  return {
    layer,
    localTransform,
    worldTransform,
    opacity: (visible && drawn) ? opacity : 0,
    crop,
    visible: visible && drawn && opacity > 0,
    children,
  };
}

// ============================================================================
// Main evaluate entry point
// ============================================================================


/**
 * Compute rig-resolved filter parameter overrides.
 * Rig behaviors can target filter objects (by id) to set params like Amount/Mix/Angle
 * based on the widget's snapshot. Returns filterId → (paramName → resolved value).
 */
function computeFilterOverrides(scene: MotrScene, timeSec: number, widgetValues: Map<number, number>): Map<number, Map<string, number>> {
  const overrides = new Map<number, Map<string, number>>();

  // Collect all filter IDs in the scene
  const filterIds = new Set<number>();
  function collectFilters(layers: Layer[]) {
    for (const l of layers) {
      for (const f of l.filters) filterIds.add(f.id);
      collectFilters(l.children);
    }
  }
  collectFilters(scene.layers);

  // Find the max retime frame span for time→frame conversion (use scene duration)
  for (const behavior of scene.rigBehaviors) {
    if (!filterIds.has(behavior.affectedObjectId)) continue;
    // This rig behavior targets a filter
    const rawValue = widgetValues.get(behavior.widgetId) ?? 0;
    let snapIndex = Math.round(rawValue);
    snapIndex = Math.max(0, Math.min(behavior.snapshots.length - 1, snapIndex));
    const snapshot = behavior.snapshots[snapIndex];
    if (!snapshot) continue;

    // The snapshot's value is the resolved parameter (may be a curve or default→value)
    let value: number;
    if (snapshot.curve) {
      if (snapshot.curve.keyframes.length > 0) {
        value = evaluateCurve(snapshot.curve, timeSec);
      } else {
        value = snapshot.curve.value !== undefined ? snapshot.curve.value : snapshot.curve.default;
      }
    } else if (typeof snapshot.value === 'number') {
      value = snapshot.value;
    } else {
      continue;
    }

    if (!overrides.has(behavior.affectedObjectId)) {
      overrides.set(behavior.affectedObjectId, new Map());
    }
    overrides.get(behavior.affectedObjectId)!.set(behavior.paramType, value);
  }

  // Scene Oscillate behaviors can drive a filter parameter channel directly
  // (e.g. Blurs/Zoom: an Oscillate targets the real "Zoom Blur" filter's channel
  // "./1" = Amount). This is distinct from rig snapshots — it's a procedural
  // animator. Map channel "./N" → the filter param whose id === N, then apply the
  // Oscillate value at this time.
  {
    // Index every filter by id for channel→param resolution.
    const filterById = new Map<number, import('../types.js').Filter>();
    (function collect(layers: Layer[]) {
      for (const l of layers) { for (const f of l.filters) filterById.set(f.id, f); collect(l.children); }
    })(scene.layers);

    for (const b of scene.sceneBehaviors) {
      if (b.type !== 'oscillate') continue;
      if (!filterIds.has(b.affectedObjectId)) continue;
      const filter = filterById.get(b.affectedObjectId);
      if (!filter) continue;
      // Resolve the driven channel "./N" → param id N → param name.
      const chanMatch = /\.\/(\d+)$/.exec(b.affectingChannel || '');
      if (!chanMatch) continue;
      const paramId = parseInt(chanMatch[1], 10);
      const targetParam = filter.parameters.find(p => p.id === paramId);
      if (!targetParam) continue;

      const oscVal = evaluateOscillateChannel(b, timeSec, scene);
      if (oscVal === undefined) continue;

      if (!overrides.has(b.affectedObjectId)) overrides.set(b.affectedObjectId, new Map());
      // The channel's base value + the oscillation. Base is the param's static value.
      const base = typeof targetParam.value === 'number' ? targetParam.value : 0;
      overrides.get(b.affectedObjectId)!.set(targetParam.name, base + oscVal);
    }
  }

  return overrides;
}

/**
 * Evaluate a scene Oscillate behavior driving a filter-parameter channel.
 *
 * Motion's Oscillate produces a periodic offset around the channel's base value.
 * Parameters observed on Blurs/Zoom's Amount oscillator:
 *   Wave Shape = 3, Amplitude = 100, Speed = 50, sliderRange = 32
 *
 * Formula (derived + validated against the real FCP engine on Blurs/Zoom):
 *   - Speed is oscillations per MINUTE ⇒ cyclesPerSec = Speed / 60. With Speed=50
 *     over the ~0.6s window this is ≈0.5 cycle = a single hump.
 *   - Wave Shape 3 = sine. Taking the positive half (|sin|) over the behavior's
 *     active [in,out] window yields a hump: 0 at the ends, peak in the middle —
 *     the "blur peaks mid-transition" pattern the previous agent observed and that
 *     the GT (frames ~5–7) confirms.
 *   - Amplitude is a percentage of the channel's slider range, so the raw FCP
 *     channel offset is (Amplitude/100) * sliderRange (peak 32 for Amount).
 *
 * IMPORTANT UNIT + WINDOW NOTES (validated empirically against the real engine):
 *   1. FCP's PAEZoomBlur "Amount" units are NOT 1:1 with this engine's zoomBlur()
 *      `amount` (a per-sample scale of `1 + t*0.01`). Applying the raw channel
 *      value (≈32) as a zoomBlur amount massively over-blurs (PSNR 31→20dB).
 *      Calibrating the peak against the GT sharpness profile gives a conversion of
 *      ~0.016 (FCP Amount 32 → zoomBlur amount ≈0.5).
 *   2. The visible blur in the GT is concentrated in the LATE half of the window
 *      (frames ~4–8, i.e. once Transition B has faded in and the two layers
 *      overlap); the first half is sharp Transition A. A raw half-sine over the
 *      full Oscillate window would blur those sharp early frames. So we phase the
 *      hump into the second half of the window (where A/B overlap), matching where
 *      FCP actually shows the zoom streaking.
 *   3. Even so, the mid-transition softness is dominated by the A/B cross-dissolve
 *      (which the compositor already reproduces); the incremental zoom blur is
 *      subtle. See the w3 report / test/window_sweep.ts for the calibration data.
 */
const FCP_AMOUNT_TO_ZOOMBLUR = 0.016; // calibrated on Blurs/Zoom GT (32 → ~0.5)

function evaluateOscillateChannel(b: SceneBehavior, timeSec: number, scene: MotrScene): number | undefined {
  const amplitude = b.params['Amplitude'] ?? 0;
  const sliderRange = b.params['sliderRange'] ?? 1;

  // Active window (seconds) from the behavior's <timing>. Outside it, no drive.
  const winIn = b.timing ? b.timing.in : 0;
  const winOut = b.timing ? b.timing.out
    : (scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale));
  const dur = winOut - winIn;
  if (dur <= 0) return 0;

  const tRel = timeSec - winIn;
  if (tRel <= 0 || tRel >= dur) return 0;

  // Phase the hump into the overlap half of the window: the blur ramps in only
  // once Transition B has appeared (the first ~40% of the window is sharp A).
  const HUMP_START = 0.4; // fraction of the window where the blur begins
  const u = (tRel / dur - HUMP_START) / (1 - HUMP_START);
  if (u <= 0) return 0;
  // Half-sine hump over [HUMP_START, 1] (Wave Shape 3 = sine, positive half).
  const wave = Math.sin(Math.PI * Math.min(1, u));
  const fcpAmount = (amplitude / 100) * sliderRange * wave;
  return fcpAmount * FCP_AMOUNT_TO_ZOOMBLUR;
}

export function evaluate(scene: MotrScene, timeSec: number): EvaluatedScene {
  CURRENT_FPS = scene.settings.frameRate || 30;
  const parentTransform = mat4Identity();
  const widgetValues = buildWidgetValueMap(scene.rigWidgets);
  const behaviors = scene.rigBehaviors;
  const sceneBehaviors = scene.sceneBehaviors;
  const layerById = buildLayerById(scene.layers, new Map());
  const linksByTarget = new Map<number, import('../types.js').LinkBehavior[]>();
  (function collectLinks(ls: Layer[]) {
    for (const l of ls) {
      if (l.links) for (const lk of l.links) {
        const arr = linksByTarget.get(lk.affectedObjectId) || [];
        arr.push(lk); linksByTarget.set(lk.affectedObjectId, arr);
      }
      collectLinks(l.children);
    }
  })(scene.layers);
  const layers = scene.layers.map(layer => evaluateLayer(layer, timeSec, parentTransform, behaviors, widgetValues, sceneBehaviors, layerById, linksByTarget));
  const filterOverrides = computeFilterOverrides(scene, timeSec, widgetValues);

  return {
    layers,
    time: timeSec,
    width: scene.settings.width,
    height: scene.settings.height,
    filterOverrides,
    layerById,
  };
}
