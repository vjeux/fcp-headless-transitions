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
import type { MotrScene, Layer, Curve, Transform, RigWidget, RigBehavior, Parameter, SceneBehavior, LinkBehavior, EmitterParams, ParticleCellParams } from '../types.js';
import { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';
import { evaluateFade, evaluateRampAtProgress, evaluateOscillate, evaluateSpin } from './behaviors/index.js';
import { resolveFramedPose, resolveFramedWallPose } from './framing.js';
import { generateInstances } from '../compositor/replicator.js';
import {
  mat4Identity, mat4Multiply, mat4Translate, mat4Scale, mat4RotateZ, mat4RotateX, mat4RotateY,
} from './matrix.js';
import { computeFilterOverrides } from './filter-overrides.js';
import { computeColorLinks, mergeColorLinksIntoFilterOverrides } from './color-links.js';
import type { EvalCtx } from './context.js';
import { applyRampTransforms, applyRampOpacity, applyFadeBehaviors } from './ramp.js';
import { buildLayerById, applyLinks, applyRigBehaviors } from './links.js';
import { needsFilterRevealForceHoldB } from '../capabilities.js';

export { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';
export {
  mat4Identity, mat4Multiply, mat4Translate, mat4Scale, mat4RotateZ, mat4RotateX, mat4RotateY,
} from './matrix.js';




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
  /**
   * WRITE-ON mask envelope (S8, procedural shape masks). A source-less animated
   * `<mask>` (Wipes/Diagonal's "Animated mask") sweeps a finite feathered quad
   * diagonally ACROSS the frame — its instantaneous alpha reveals then RETREATS
   * (coverage 0→85%→0). But FCP's reveal is a MONOTONIC write-on: once a pixel is
   * revealed by the sweep it STAYS revealed. So the correct matte is the per-pixel
   * MAX-over-time of the instantaneous alpha. The evaluator samples the mask's
   * worldTransform at K sub-times from mask-start→t and stores them here; the
   * compositor rasterizes at each and unions (max) to build the monotonic envelope.
   * Undefined for non-write-on masks (single-transform rasterization, unchanged).
   * Empty array = the sweep has not entered yet ⇒ reveal nothing (all-zero matte).
   */
  writeOnTransforms?: Float64Array[];
  /**
   * When true, the compositor renders this image layer as source A regardless of
   * its declared transitionA/B source. Set for a wrapping drop zone (Retime mode
   * 1) whose lifetime has ended while an independent overlay animation keeps the
   * scene alive (e.g. Lights/Flash): FCP loops the drop-zone media back to the
   * transition start (source A), so the flash rides over a persistent A base
   * instead of an empty frame.
   */
  forceSourceA?: boolean;
  /**
   * When true, this is the incoming Transition-B drop zone HELD past its timing
   * `out` as the settled base (see EvalCtx.holdIncomingB). Rendered opaque; keeps
   * its parent group visible so the tail shows settled B, not a black frame.
   */
  heldIncomingB?: boolean;
  /**
   * Colour-Link Fill Color override (0-255 RGB), replaces this shape layer's
   * `layer.shape.fillColor` before rasterisation. Set only when a colour-channel
   * Link (targetProp='color', colorTarget.kind='shapeFill') drives this shape
   * (Panels_Across's "Red bar" copies the Color linker's RGB into its fill).
   * See evaluator/color-links.ts + compositor/index.ts renderDrawableLayer.
   */
  fillColorOverride?: { r: number; g: number; b: number };
}

export interface EvaluatedScene {
  layers: EvaluatedLayer[];
  time: number;
  /**
   * Un-wrapped scene time (seconds): progress × animationEnd, BEFORE any
   * retime-wrap-to-0 the host applies. The compositor's particle-field proxy uses
   * this so the field envelope follows the true transition progress even after the
   * drop zones wrap back to source A. Falls back to `time` when unset.
   */
  unwrappedTime?: number;
  /** Animation end in seconds (last spatial keyframe). Used to normalize time. */
  animationEndSec: number;
  width: number;
  height: number;
  /** Drop-zone media box height (Fixed Height) — governs the Drop In card conform. */
  dropZoneMediaHeight?: number;
  /** Rig-resolved filter parameter overrides: filterId → (paramName → value). */
  filterOverrides: Map<number, Map<string, number>>;
  /** Object ID → source Layer (for clone-source resolution in the compositor). */
  layerById: Map<number, Layer>;
  /** Object ID → EvaluatedLayer (for replicator cell-source resolution). */
  evalLayerById: Map<number, EvaluatedLayer>;
  /**
   * Resolved 3D camera for perspective projection, if the scene has a Camera node.
   * `distance` is the framing distance of the camera from the Z=0 plane, derived
   * from the vertical Angle Of View so that content at Z=0 renders 1:1 with the
   * frame: distance = (height/2) / tan(AOV·π/360). Matches Motion's gluPerspective
   * (decompiled from Lithium's PCMatrix44Tmpl::setGLPerspective).
   */
  camera?: {
    angleOfView: number;
    distance: number;
    worldTransform: Float64Array;
    /**
     * Render-time framed camera pose (OZScene::computeFraming), when the camera
     * carries Framing behaviors (factory 3). Overrides the static camera position:
     * `viewX`/`viewY` are the world XY of the framing point (subtracted from world
     * coords to center the framed region), and `framingDistance` is the dolly
     * distance used for perspective foreshortening of the tile wall.
     */
    framed?: { viewX: number; viewY: number; viewZ: number; framingDistance: number; eye: [number, number, number]; target: [number, number, number]; aov: number };
  };
  /**
   * Flat index of parsed Motion Emitters (T-B1 parser). Copied by reference from
   * MotrScene so the compositor's emitter-sim (T-B2) can iterate cells + resolve
   * their parent emitter's params without re-descending the layer tree. Undefined
   * when the scene has no Emitter nodes (early-out is free for non-particle
   * transitions).
   */
  emitters?: Map<number, EmitterParams>;
  /** Flat index of parsed Particle Cells (T-B1 parser). Companion to `emitters`. */
  particleCells?: Map<number, ParticleCellParams>;
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
 * factoryID-12 Direction default advancement (Movements/Scale).
 *
 * The Scale transition's .motr authors Direction = 0 ("Up"), but the ground-truth
 * FCP render at that authored default shows the "shrink-to-reveal" animation that
 * the rig's column-0 does NOT produce: column 0 leaves EVERY geometric transition
 * link (scale/position/rotation on the Transition A/B layers) inactive (rig Custom
 * Mix = 0), so Transition A stays full-frame and static — a straight cut, not a
 * transition. The first column carrying an active geometric link (column 1: A's
 * Scale link off the shrinking driver) is what FCP actually renders.
 *
 * Rather than hard-code a per-transition value, detect the degenerate case
 * structurally: for a factoryID-12 Direction widget whose SELECTED column drives
 * no geometric link on any layer, while a LATER column does, advance the widget to
 * that first geometrically-active column. This is scoped so it cannot touch:
 *   - Push/Reflection (factoryID-13 Direction widgets — different flavour),
 *   - Switch (factoryID-12, but every column carries active position/rotation/anchor
 *     links → not degenerate → untouched),
 *   - Flip (factoryID-12, but NO column carries geometric links → no "better"
 *     column exists → untouched; its motion is rig-curve driven, not link driven).
 */
function adjustDegenerateDirection(scene: MotrScene, widgetValues: Map<number, number>): void {
  const dirWidgets = scene.rigWidgets.filter(w => w.factoryID === 12 && w.name === 'Direction');
  if (dirWidgets.length === 0) return;

  // Gather every link, keyed by controlling widget, and how many rig columns each
  // exposes (rigCustomMix length). A link is "geometric" if it drives a
  // scale/position/rotation channel (opacity-only links don't create a visible
  // transition on their own here).
  const links: import('../types.js').LinkBehavior[] = [];
  (function collect(ls: readonly Layer[]) {
    for (const l of ls) { if (l.links) for (const lk of l.links) links.push(lk); collect(l.children); }
  })(scene.layers);

  const isGeometric = (lk: import('../types.js').LinkBehavior) =>
    lk.targetProp === 'scale' || lk.targetProp === 'position' || lk.targetProp === 'rotation';
  const colActiveGeometric = (widgetId: number, col: number): boolean => {
    for (const lk of links) {
      if (lk.rigWidgetId !== widgetId || !lk.rigCustomMix) continue;
      if (!isGeometric(lk)) continue;
      const mix = lk.rigCustomMix[Math.min(col, lk.rigCustomMix.length - 1)];
      if (mix && mix !== 0) return true;
    }
    return false;
  };

  for (const w of dirWidgets) {
    // Column count = max rig snapshot length among this widget's links.
    let cols = 0;
    for (const lk of links) if (lk.rigWidgetId === w.id && lk.rigCustomMix) cols = Math.max(cols, lk.rigCustomMix.length);
    if (cols === 0) continue;
    const cur = Math.max(0, Math.min(cols - 1, Math.round(w.value)));
    if (colActiveGeometric(w.id, cur)) continue; // selected column is a real transition — leave it.
    // Find the first LATER column that carries a geometric link.
    for (let c = cur + 1; c < cols; c++) {
      if (colActiveGeometric(w.id, c)) { widgetValues.set(w.id, c); break; }
    }
  }
}



/**
 * Compute the combined opacity multiplier from Fade behaviors on a layer.
 * Fade times are in frames; we convert the current time to frames via the scene fps.
 */


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
function resolveWithRetime(value: number | Curve | undefined, timeSec: number, defaultVal: number, retimeProgress: number, bypassRetime: boolean = false, hasRetime: boolean = false): number {
  if (value === undefined) return defaultVal;
  if (typeof value === 'object') {
    // Curve
    if (value.keyframes.length > 0) {
      return evaluateCurve(value, timeSec); // real keyframes → evaluate normally
    }
    // Empty curve with default→value. Motion authors a STATIC transform parameter as
    // `<parameter default="1" value="1.27"/>` (no keyframes) — the `value` is the
    // authoritative static value and `default` is only the parameter's documented
    // default. The Retime "static-position" heuristic (ramp default→value driven by
    // the layer's playback progress) applies ONLY when the layer actually carries a
    // Retime curve (≥2 keyframes); it models media that advances its authored value
    // as the retimed frame plays. A layer with NO retime curve is not being retimed,
    // so its static `value` is authoritative from the first frame — resolving to
    // `default` there silently drops every static Scale/Position/Rotation authored
    // this way (Concentric's ring-mask Circles carry Scale value=1.27/0.75/0.5/… with
    // no retime; the old `return from` collapsed them all to 1.0 → the concentric
    // rings all rasterized at one radius). Bypass (Link/rig override) always uses the
    // full value.
    const from = value.default;
    const to = value.value !== undefined ? value.value : value.default;
    if (bypassRetime) return to; // Link/rig override: use the full value directly.
    if (!hasRetime) return to;   // No retime curve: the static `value` is authoritative.
    if (retimeProgress > 0 && to !== from) {
      return from + (to - from) * retimeProgress;
    }
    return from;
  }
  // Static number: Link/rig override uses it directly (no ramp from default).
  if (bypassRetime) return value;
  // Static number with retime: interpolate default → value ONLY when the layer is
  // actually being retimed (a real retime curve drives retimeProgress). Without a
  // retime curve the authored number is authoritative from frame 0.
  if (hasRetime && retimeProgress > 0 && value !== defaultVal) {
    return defaultVal + (value - defaultVal) * retimeProgress;
  }
  return value;
}
function buildTransformMatrix(tx: Transform, timeSec: number, retimeProgress: number = 0, hasRetime: boolean = false): Float64Array {
  const ov = tx.__overrideChannels;
  // Motion Path behaviors (factoryID=24) contribute an additive positionX/Y offset
  // via tx.__mpDeltaX/Y (set by applyMotionPathBehaviors, undefined for layers
  // without a Motion Path). Added to the retime-resolved authored position so
  // the layer both animates its authored curves AND slides along the Motion Path.
  const posX = resolveWithRetime(tx.positionX, timeSec, 0, retimeProgress, ov?.has('posX'), hasRetime)
    + (tx.__mpDeltaX ?? 0);
  const posY = resolveWithRetime(tx.positionY, timeSec, 0, retimeProgress, ov?.has('posY'), hasRetime)
    + (tx.__mpDeltaY ?? 0);
  const posZ = resolveWithRetime(tx.positionZ, timeSec, 0, retimeProgress, ov?.has('posZ'), hasRetime);

  // Motion .motr stores rotation in RADIANS (e.g. Rotate uses π/2 for 90°). Convert to degrees
  // for the matrix helpers (which take degrees).
  const RAD2DEG = 180 / Math.PI;
  // X rotation sign: the perspective projector uses a Y-DOWN local convention
  // (top corner at -hh), so a positive Motion X-rotation must tilt the TOP edge
  // away from the viewer. Negating here makes m6/m9 couple Y→Z the correct way
  // (verified against Fall GT: top edge recedes, bottom swings up).
  const rotX = -resolveWithRetime(tx.rotationX, timeSec, 0, retimeProgress, ov?.has('rotX'), hasRetime) * RAD2DEG;
  const rotY = resolveWithRetime(tx.rotationY, timeSec, 0, retimeProgress, ov?.has('rotY'), hasRetime) * RAD2DEG;
  // A Spin behavior contributes an extra in-plane Z rotation (RADIANS), added to the
  // authored rotationZ so it pivots about the layer's own anchor origin. tx.__spinRadians
  // is set by applySpinBehaviors and is 0/undefined for non-spinning layers.
  // rotZ sign: when the value is LINK-DRIVEN (ov.has('rotZ')), Motion's link resolver
  // produces a value whose sign is inverted relative to our matrix convention (verified
  // against Movements__Switch GUI GT: link-driven -π/2 must rotate the outgoing layer +90°
  // in our matrix, not -90°). Directly-authored rotationZ curves and __spinRadians already
  // use our convention, so they stay unnegated.
  const rawRotZ = resolveWithRetime(tx.rotationZ, timeSec, 0, retimeProgress, ov?.has('rotZ'), hasRetime);
  const linkRotZ = ov?.has('rotZ') ? -rawRotZ : rawRotZ;
  const rotZ = (linkRotZ + (tx.__spinRadians ?? 0)) * RAD2DEG;
  // Scale is FRACTIONAL (1.0 = 100%) in every .motr template (all 108 Scale curves have
  // default="1"). Used as-is — never divided by 100.
  const scX = resolveWithRetime(tx.scaleX, timeSec, 1, retimeProgress, ov?.has('scaleX'), hasRetime);
  const scY = resolveWithRetime(tx.scaleY, timeSec, 1, retimeProgress, ov?.has('scaleY'), hasRetime);
  const scZ = resolveWithRetime(tx.scaleZ, timeSec, 1, retimeProgress, ov?.has('scaleZ'), hasRetime);
  // Anchor is retime-interpolated like position (both have default=0, value=X); they must
  // track together so a static offset (e.g. Fall's -540) cancels, leaving only the rotation pivot.
  const ancX = resolveWithRetime(tx.anchorX, timeSec, 0, retimeProgress, false, hasRetime);
  const ancY = resolveWithRetime(tx.anchorY, timeSec, 0, retimeProgress, false, hasRetime);
  // Anchor Z: the rotation/scale pivot's depth. Movements/Reflection's incoming
  // Transition B carries anchor Z = 960 (its page hinges on the shared "spine" at
  // Z=960, not its own centre) — without it, B's 90° pre-rotation leaves it offset
  // ~720px laterally when the group settles, instead of landing full-frame.
  const ancZ = resolveWithRetime(tx.anchorZ, timeSec, 0, retimeProgress, false, hasRetime);

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
  if (ancX !== 0 || ancY !== 0 || ancZ !== 0) m = mat4Multiply(mat4Translate(-ancX, -ancY, -ancZ), m);
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

/**
 * Apply Spin behaviors (factory 22) on a layer as an accumulating in-plane Z rotation.
 *
 * Decoded from OZTransformNode::computeSpin (ENGINE_RE_PLAYBOOK): the "Spin Rate" param
 * (id=400) is in RADIANS/SEC and the angle accrues over the behavior's OWN timing window,
 * held constant after the window ends:
 *   angleZ(t) = rate * (clamp(t, in, out) - in)
 * Multiple Spin behaviors on the same layer sum. The result is stashed in
 * transform.__spinRadians (added to rotationZ in buildTransformMatrix, so the layer pivots
 * about its own anchor origin). Returns the input transform unchanged when the layer has no
 * Spin behavior, so this is a no-op for every non-spinning layer (scoped per the PLAYBOOK
 * warning that a global spin regresses Vertigo/Leaves).
 */
function applySpinBehaviors(layer: Layer, tx: Transform, timeSec: number): Transform {
  const spins = (layer.behaviors ?? []).filter(b => b.type === 'spin');
  if (spins.length === 0) return tx;
  let angle = 0;
  for (const s of spins) {
    const rate = s.params['Spin Rate'] ?? 0;
    if (rate === 0) continue;
    const inSec = s.timing ? timeToSeconds(s.timing.in) : 0;
    const outSec = s.timing ? timeToSeconds(s.timing.out) : Infinity;
    const tClamped = Math.max(inSec, Math.min(timeSec, outSec));
    angle += rate * (tClamped - inSec);
  }
  if (angle === 0) return tx;
  return { ...tx, __spinRadians: (tx.__spinRadians ?? 0) + angle };
}

/**
 * Apply Motion Path behaviors (factoryID=24) on a layer as an additive positionX/Y
 * offset — a MINIMAL first pass that handles ONLY the `basePosition` X/Y curves.
 * Decoded from the Motion Path parser (parseMotionPath in parser/behaviors.ts,
 * see also MotionPathPayload in types.ts). Slide_In authors its "Rounded rect
 * down" mask with a Motion Path behavior whose basePosition X curve ramps
 * 0→4080 over the behavior-local 1s window (Slide In.motr line 553). The panel
 * mask starts far offscreen-left at static position (-1500,-1229) and this
 * Motion Path drives it across the frame — without evaluating the behavior
 * the mask sits offscreen the entire transition (verified: FCT_LINEAR_GRADIENT_GEN
 * +FCT_MOTION_PATH_MASK_LIFT together score 12.11 = baseline because the mask
 * clips the panel to nothing).
 *
 * Behavior-local time: `tLocal = clamp(sceneTime - timing.in, 0, timing.out - timing.in)`.
 * Motion Path holds the last curve value past the behavior's `out` (Motion's
 * documented "end condition"; default 0 = hold). Multiple Motion Paths on one
 * layer sum. Follow-up ticks will layer on: `pathControlPoints` curved path
 * with Attach-To-Shape, Start/End Point trimming, Custom Speed retiming, and
 * Amplitude/Frequency/Phase oscillation.
 *
 * SCOPED to layers that actually carry a Motion Path behavior — no-op for every
 * other layer, mirroring the applySpinBehaviors pattern.
 */
function applyMotionPathBehaviors(layer: Layer, tx: Transform, timeSec: number): Transform {
  const mps = (layer.behaviors ?? []).filter(b => b.type === 'motionPath' && b.motionPath);
  if (mps.length === 0) return tx;
  let dx = 0;
  let dy = 0;
  for (const mp of mps) {
    const inSec = mp.timing ? timeToSeconds(mp.timing.in) : 0;
    const outSec = mp.timing ? timeToSeconds(mp.timing.out) : Infinity;
    // Behavior-local time: clamp to behavior lifetime, then subtract behavior in.
    const tClamped = Math.max(inSec, Math.min(timeSec, outSec));
    const tLocal = tClamped - inSec;
    const bp = mp.motionPath!.basePosition;
    if (bp?.x) dx += evaluateCurve(bp.x, tLocal);
    if (bp?.y) dy += evaluateCurve(bp.y, tLocal);
  }
  if (process.env.FCT_MP_DEBUG === '1') {
    // eslint-disable-next-line no-console
    console.error(`[MP] layer=${layer.name} type=${layer.type} t=${timeSec.toFixed(3)} dx=${dx.toFixed(1)} dy=${dy.toFixed(1)} mps=${mps.length}`);
  }
  if (dx === 0 && dy === 0) return tx;
  return {
    ...tx,
    __mpDeltaX: (tx.__mpDeltaX ?? 0) + dx,
    __mpDeltaY: (tx.__mpDeltaY ?? 0) + dy,
  };
}

// ============================================================================
// Evaluate a layer tree
// ============================================================================

function isLayerVisible(layer: Layer, timeSec: number): boolean {
  if (!layer.timing) return true;
  const inTime = timeToSeconds(layer.timing.in);
  const outTime = timeToSeconds(layer.timing.out);
  // A solid-FILL-COLOR shape overlay's lifetime is governed by its OPACITY curve,
  // not the (often shorter) timing window. Motion authors these flash/color
  // overlays with a timing `out` that can end before the opacity ramps back to 0
  // (Lights/Flash's overlay "Rectangle": out=0.267s but opacity rides down to 0
  // at scene 0.3s). A strict window check clips the fade tail to nothing. Treat
  // such shapes as timing-unbounded — opacity>0 (checked downstream) decides
  // visibility. Also covers the degenerate zero-duration (in==out) case.
  // SCOPED to shapes with a solid fillColor (the flash rectangles) so mask shapes
  // and gradient/stroke reveal shapes (Stylized/Heart, Center_Reveal) keep their
  // normal window gating and don't linger past their lifetime.
  if (layer.type === 'shape' && layer.shape && !layer.shape.isMask && layer.shape.fillColor) {
    // Degenerate zero-duration window (in==out): the shape's whole lifetime is its
    // opacity curve — treat as always on (opacity>0 downstream decides).
    if (outTime <= inTime) return true;
    // Otherwise honor the `in` point but ignore the (often too-early) `out`.
    return timeSec >= inTime;
  }
  return timeSec >= inTime && timeSec <= outTime;
}

function evaluateLayer(layer: Layer, timeSec: number, parentTransform: Float64Array, behaviors: RigBehavior[], widgetValues: Map<number, number>, sceneBehaviors: SceneBehavior[], layerById: Map<number, Layer>, linksByTarget: Map<number, import('../types.js').LinkBehavior[]>, ectx: EvalCtx): EvaluatedLayer {
  let visible = isLayerVisible(layer, timeSec);
  // LATE-WINDOW PANEL VISIBILITY RE-ANCHOR (Stylized/Kinetic "Lower"). isLayerVisible()
  // gates a shape on its RAW timing window [in,out]. An isSolidPanel carries that window
  // in the panel's LOCAL, offset-anchored frame (the same frame the isSolidPanel curveTime
  // retime below re-anchors by −offset). When the panel's raw `in` sits PAST the whole
  // rendered range (in > animationEndSec) the raw check returns false for EVERY frame → the
  // panel is dropped to BLACK even though FCP paints it. Decoded from the committed 3-node
  // min-repro (fct/minimized/Stylized__Lower): the survivor "Panel right 1" (factoryID=12,
  // isSolidPanel) has in=2.870s out=6.773s offset=3.337s while animationEndSec is 2.336s
  // (full) / 1.835s (reduced), so raw in > endSec and the engine renders it BLACK at f12–f17
  // while FCP fills the right half with it (min-repro f12–f17 ≈ 4.2 dB). Re-anchor the window
  // by −offset (the SAME shift the panel's curve gets below), so the panel is visible over
  // scene time [in−offset, out−offset]. SCOPED to `in > endSec` — the only regime where the
  // raw window is definitionally off the rendered range; every other isSolidPanel family has
  // in < endSec (Panels_Across in=0, Center in≤2.069, Panels_Random in=0, Up-Over in≤2.936)
  // so isLayerVisible already fires and this branch never touches them.
  if (layer.type === 'shape' && layer.shape && layer.shape.isSolidPanel && layer.timing) {
    const _voff = layer.timing.offset && layer.timing.offset.timescale > 0
      ? layer.timing.offset.value / layer.timing.offset.timescale : 0;
    const _vin = layer.timing.in && layer.timing.in.timescale > 0
      ? layer.timing.in.value / layer.timing.in.timescale : 0;
    const _vend = ectx.animationEndSec ?? 0;
    if (_voff > 1e-3 && _vend > 1e-3 && _vin > _vend) {
      const _vout = layer.timing.out && layer.timing.out.timescale > 0
        ? layer.timing.out.value / layer.timing.out.timescale : 0;
      visible = timeSec >= _vin - _voff && timeSec <= _vout - _voff;
    }
  }
  // Persistent-A drop zone (see ectx.wrapToA): a wrapping drop-zone image
  // past its lifetime re-shows source A and stays visible as the overlay's base.
  let forceSourceA = false;
  if (ectx.wrapToA && layer.type === 'image' && layer.source
    && layer.retimeValue && layer.retimeValue.retimingExtrapolation === 1 && layer.timing) {
    const out = layer.timing.out.timescale > 0 ? layer.timing.out.value / layer.timing.out.timescale : 0;
    const inn = layer.timing.in.timescale > 0 ? layer.timing.in.value / layer.timing.in.timescale : 0;
    if (timeSec > out) {
      // Past this drop zone's lifetime: it loops back to source A and remains
      // visible as the persistent base. (Before `in` it stays hidden.)
      if (timeSec >= inn) { visible = true; forceSourceA = true; }
    }
  }
  const retimeProgress = getRetimeProgress(layer, timeSec);
  // Whether this layer actually carries a Retime curve (≥2 keyframes). The
  // Retime static-value ramp (default→value driven by retimeProgress) applies
  // ONLY to genuinely-retimed layers; a layer with no retime curve resolves its
  // static empty-curve `value` authoritatively (see resolveWithRetime). A static
  // param encoded as `<parameter default="1" value="X"/>` (Motion's standard
  // static-transform encoding) must NOT be collapsed to `default` — that silently
  // dropped Concentric's ring-mask Circle scales (1.27/0.75/0.5/0.26/0.15 → 1.0).
  //
  // EXCEPTION — DISABLED media DRIVER (Pinwheel's 17 `square_fix` fold drivers,
  // 3D_Rectangle's shape/scale drivers): a `<enabled>0</enabled>` image node
  // never "plays" its media — it exists ONLY to publish a static Position +
  // animated Rotation Transform for a consumer (its sibling group's Image Mask,
  // or a Link behavior). Retime-ramping its static Position from 0 → authored
  // value would slide the driver from centre to its authored tile position as
  // the retime curve advances, which is a media-playback semantic ("as the clip
  // plays, its authored transform activates") — bogus for a hidden geometric
  // driver whose Position is the tile's FIXED coordinate. So bypass the
  // retime-ramp for disabled media drivers: their authored values are the ones
  // the mask consumer needs. Scoped strictly to layer.enabled === false AND
  // layer.type === 'image' AND a media source (a hidden Color Solid or
  // Generator DRIVES rig behaviors, not the transform-mask path this
  // exception targets). Byte-for-byte a no-op for every enabled layer, incl.
  // the drop-zone A/B images and Concentric's ring-mask Circles.
  const hasRetime = !!(layer.retimeValue && layer.retimeValue.keyframes.length >= 2)
    && !(layer.enabled === false && layer.type === 'image' && layer.source?.type === 'media');
  // Hold the incoming (Type=2) B drop zone past its timeout when the scene stays
  // alive past the drop-zone crossfade. Two cases share this:
  //   • a blended VIDEO overlay keeps the scene alive (Lights/Light Noise): B
  //     persists as the base behind the fading overlay, or
  //   • a SMEAR/displacement-filter reveal (Movements/Smear): A is warped OUT by a
  //     Scrape (PAEScrape) displacement filter over the first ~third, revealing B
  //     underneath; both drop zones die early (A.out 0.434s, B.out 0.467s ≪ endSec
  //     1.134s) but the GUI GT tail HOLDS photo B (f17–f23 ramp to (92,106,137) = B,
  //     not the frozen photo A the wrap-to-0 rendered). So B must persist to endSec.
  // Past `out` the retime curve wraps to B's last authored frame (extrap=1), which
  // is the settled B — so holding the layer visible + opaque there yields settled B.
  let heldIncomingB = false;
  if (ectx.holdIncomingB && !visible && layer.type === 'image'
    && layer.source?.type === 'transitionB' && layer.dropZone?.type === 2 && layer.timing) {
    const out = layer.timing.out.timescale > 0 ? layer.timing.out.value / layer.timing.out.timescale : 0;
    const inn = layer.timing.in.timescale > 0 ? layer.timing.in.value / layer.timing.in.timescale : 0;
    // Light Noise keeps its historical visible-only hold (B rides behind a still-
    // opaque overlay). The filter-reveal-settle-B family (Smear/Bloom) additionally
    // marks heldIncomingB so B renders OPAQUE and forces its timed-out group visible
    // (the tail would otherwise be black once the drop zones die).
    if (timeSec > out && timeSec >= inn) {
      visible = true;
      if (ectx.filterRevealSettleB) heldIncomingB = true;
    }
  }
  let riggedTransform = applyRigBehaviors(layer, layer.transform, behaviors, widgetValues);
  // A drop-zone-FRAMED grid panel (declares a SQUARE Width×Height frame, e.g. the
  // Replicator/Multi 1920×1920 panels) carries an authoritative STATIC Scale (e.g.
  // 0.32) that must NOT be ramped from 1.0 by the Retime static-position heuristic —
  // Motion retime only advances the media playback frame, never the panel's layout
  // scale. Ramping it inflates the panels ~3x early in the transition. Mark scale as
  // an override so buildTransformMatrix uses the scenenode value directly. Scoped to
  // SQUARE framed drop zones so full-frame Transition A/B (1920×1080) and ordinary
  // retimed layers are unaffected.
  if (layer.type === 'image' && layer.dropZone && layer.dropZone.width === layer.dropZone.height) {
    const ov = riggedTransform.__overrideChannels ?? (riggedTransform.__overrideChannels = new Set<string>());
    ov.add('scaleX'); ov.add('scaleY'); ov.add('scaleZ');
  }
  // A REAL Transition A drop zone (drop-zone Type=1, the transition-source card,
  // 1920×1080) whose STATIC authored position sits FAR OFF-CANVAS is a STRUCTURAL
  // wall placement — the "starting tile" in a proxy+content Framing scene
  // (Replicator/Clones/Video_Wall's Transition A at world (2051,-2390) is one of
  // the 14 wall cells the framing camera dollies away from). The Retime static-
  // position heuristic (resolveWithRetime) ramps a static param value from its
  // default (0) toward the authored value over retimeProgress; for a wall-placed
  // A that ramp makes A wobble between origin and its wall position over frames
  // 1..11 (retime spans 1→13), so A drops off the framing camera's view and
  // Video_Wall f4 renders BLACK. A's off-canvas authored position is truly
  // static — it doesn't advance with the media playback frame. Mark position as
  // override so buildTransformMatrix uses the authored value.
  // Scope: SCOPED TO Type=1 (the real transition-source card, NOT the Type=0
  // custom drop zones like Clone_Spin's 9 SQUARE "Timeline Pin" 1920×1920 tiles
  // that ALSO source Transition A but rely on the ramp for their slide-in).
  // Threshold: |x| > 1920 AND |y| > 1080 — a true WALL placement is off-canvas
  // in BOTH axes (Video_Wall's A at (2051, -2390) is beyond a full frame in X
  // and >2x frame-height in Y). A single-axis offscreen placement (e.g.
  // Movements/Clothesline's A at (-1342, 540) — just past the left edge in X,
  // fully on-canvas in Y) is the "slides in from the side" pattern that DOES
  // want the ramp (its authored offscreen position is the START of the slide,
  // ramped IN from origin as the media plays); excluding it keeps that gate
  // slug neutral (Movements__Clothesline 15.22 stayed unchanged).
  if (layer.type === 'image' && layer.dropZone && layer.dropZone.type === 1
      && layer.source && layer.source.type === 'transitionA') {
    const t = layer.transform;
    const mag = (v: unknown) => typeof v === 'number' ? Math.abs(v) : 0;
    if (mag(t.positionX) > 1920 && mag(t.positionY) > 1080) {
      const ov = riggedTransform.__overrideChannels ?? (riggedTransform.__overrideChannels = new Set<string>());
      ov.add('posX'); ov.add('posY'); ov.add('posZ');
    }
  }
  // A Clone Layer's STATIC 3D pre-rotation is a fixed structural fold, not a
  // media-retimed channel — it must apply at its full authored value, NOT ramp
  // from 0 by the Retime static-position heuristic. Movements/Swing's "Clone B"
  // carries a fixed Rotation X = -π/2 back-face fold that hinges in as the parent
  // layer swings; retime-ramping it from 0 left B ~face-on mid-transition (m5≈1)
  // instead of edge-on, so the back face showed through full-frame far too early.
  // Scoped to CLONE layers with a static (number) X/Y rotation so drop-zone images
  // and hidden Color-Solid drivers (Reflection's Transition B rotY, its driver's
  // rotX) — which are NOT clones — keep their existing behavior.
  if (layer.type === 'clone') {
    if (typeof layer.transform.rotationX === 'number' && layer.transform.rotationX !== 0) {
      const ov = riggedTransform.__overrideChannels ?? (riggedTransform.__overrideChannels = new Set<string>());
      ov.add('rotX');
    }
    if (typeof layer.transform.rotationY === 'number' && layer.transform.rotationY !== 0) {
      const ov = riggedTransform.__overrideChannels ?? (riggedTransform.__overrideChannels = new Set<string>());
      ov.add('rotY');
    }
  }
  // Links drive channels from a source object; apply after rig snapshots.
  riggedTransform = applyLinks(layer, riggedTransform, linksByTarget, layerById, widgetValues, timeSec, behaviors);
  // Scene Ramp behaviors that drive transform channels (rotation/position/scale)
  // — e.g. Flip's Ramp Y drives the Group's Rotation Y from 0→π over the
  // behavior's own timing window. Applied after rigs/links (rigs configure the
  // ramp's End Value; the resolved static End Value is already in params).
  if (sceneBehaviors.length > 0) {
    riggedTransform = applyRampTransforms(layer, riggedTransform, sceneBehaviors, timeSec, ectx);
  }
  // Spin behaviors (factory 22) on THIS layer contribute an accumulating in-plane Z
  // rotation. Decoded from OZTransformNode::computeSpin (ENGINE_RE_PLAYBOOK): Spin Rate
  // is RAD/SEC and the angle accrues over the behavior's OWN timing window, held after
  // `out`:  angleZ(t) = rate * (clamp(t, in, out) - in), in RADIANS. Combo_Spin's blade
  // groups C1-C6 each carry a "Spin LT/RT" (rate ±3.2468 rad/s over 0.9676s = ±π — the
  // counter-rotating A↔B card flip). Composed as a local-space Z rotation via
  // __spinRadians (buildTransformMatrix adds it to rotationZ), so the group pivots in
  // place. SCOPED to layers that actually carry a Spin behavior (no global effect —
  // the PLAYBOOK warns a global spin regresses Vertigo/Leaves).
  riggedTransform = applySpinBehaviors(layer, riggedTransform, timeSec);
  // Motion Path behaviors (factoryID=24) contribute an additive positionX/Y offset
  // via __mpDeltaX/Y (basePosition curve at behavior-local time). Flag-gated
  // (FCT_MOTION_PATH_EVAL=1, default OFF) — enabling adds the panel-slide for
  // Slide_In but is a MINIMAL first pass that ignores pathControlPoints curved
  // paths, so it may misplace other Motion-Path-driven scenes. Follow-up ticks
  // expand coverage.
  if (typeof process !== 'undefined' && process.env?.FCT_MOTION_PATH_EVAL === '1') {
    riggedTransform = applyMotionPathBehaviors(layer, riggedTransform, timeSec);
  }
  // Drop-zone timeline offset: a Transition A/B image whose media `offset` sits
  // LATER than its `in` point (offset > in) has its transform curves authored in
  // the layer's own local time frame — Motion places that local timeline at
  // `offset` on the parent timeline. Movements/Rotate is the canonical case: its
  // Transition B panel has offset=0.367s but in=0.167s, and its Rotation-Z / Scale
  // / Opacity curves are keyed in [-0.2s .. 0.934s] (they start BEFORE scene-zero).
  // Evaluated at raw scene time those curves settle a third of a second too early,
  // so B stops rotating and reaches full scale while A is still mid-spin — the
  // engine renders an asymmetric cross instead of GT's symmetric X, and every
  // mid-transition frame diverges (10–14 dB). Shifting the curve-eval time by the
  // layer offset (curveTime = timeSec - offset) re-anchors B's animation to its
  // authored local frame, restoring the A/B rotational symmetry FCP produces
  // (Rotate 18.0 → 32.0 dB, with the Opacity crossfade shifted in lock-step below).
  // Gated on a resolved drop-zone image with offset > in
  // so scene-time-authored panels (offset == in: Zoom, Color Planes, Lens Flare)
  // and offset==0 panels (Push, Scale, Fall) are untouched.
  let curveTime = timeSec;
  if (layer.type === 'image' && layer.source && layer.timing) {
    const off = layer.timing.offset && layer.timing.offset.timescale > 0
      ? layer.timing.offset.value / layer.timing.offset.timescale : 0;
    const inn = layer.timing.in && layer.timing.in.timescale > 0
      ? layer.timing.in.value / layer.timing.in.timescale : 0;
    if (off - inn > 1e-3) curveTime = timeSec - off;
    // A blended (screen/add) VIDEO overlay whose media timeline offset is NEGATIVE
    // (its local frame starts BEFORE scene-zero) also anchors its Opacity/transform
    // curves in the layer-local frame: curveTime = timeSec - offset. Lights/Light
    // Noise's light-noise .mov has offset≈-0.734s and its Opacity fade keyframes
    // (2.269→2.469 local) must land ~0.73s EARLIER in scene time (≈1.53→1.74s) so
    // the noise burst has faded out by the time the crossfade settles on B —
    // matching GT (the overlay is gone by frame ~18). Scoped to a media leaf with
    // a frame-numbered Retime curve so scene-time-authored panels are untouched.
    else if (off < -1e-3 && layer.source.type === 'media'
      && (layer.blendMode === 'screen' || layer.blendMode === 'add'
        || layer.blendMode === 'overlay' || layer.blendMode === 'lighten')
      && layer.retimeValue && layer.retimeValue.keyframes.length >= 2) {
      curveTime = timeSec - off;
    }
  }
  // Filled-shape overlays (e.g. Lights/Flash's white flash rectangles) carry
  // their opacity/transform curves in the layer's OWN local time frame, anchored
  // at the layer's timeline `offset`. Motion places local-frame zero at `offset`,
  // so a shape with offset=0.133s and opacity keyed [-0.133s..0.167s] peaks at
  // scene time 0.133s and rides down to 0 by 0.3s — producing the mid-transition
  // white peak. Evaluated at raw scene time the peak wrongly lands at t=0. Shift
  // curveTime by the offset so the flash centers correctly. SCOPED to solid-fill
  // shapes with a positive offset (mask/gradient/stroke shapes are untouched).
  if (layer.type === 'shape' && layer.shape && !layer.shape.isMask && layer.shape.fillColor && layer.timing) {
    const off = layer.timing.offset && layer.timing.offset.timescale > 0
      ? layer.timing.offset.value / layer.timing.offset.timescale : 0;
    if (off > 1e-3) curveTime = timeSec - off;
  }
  // Offset-authored sweeping PANEL shapes (Stylized/Panels white/colored
  // rectangles): their Position/Opacity curves live in the shape's LOCAL negative-
  // time frame, re-anchored by a large positive `offset` (≈3.67s). The parser has
  // already confirmed the panel signature (isSolidPanel = offset>in AND negative-
  // time Position key), so shift curveTime by the offset to move the sweep into
  // the visible window. This is the SAME local-time re-anchor drop-zone images use,
  // extended to the panel shapes. Kept off the strict-`fillColor` path so gradient
  // shapes are never re-anchored (they aren't panels).
  if (layer.type === 'shape' && layer.shape && layer.shape.isSolidPanel && layer.timing) {
    const off = layer.timing.offset && layer.timing.offset.timescale > 0
      ? layer.timing.offset.value / layer.timing.offset.timescale : 0;
    if (off > 1e-3) {
      // TEMPLATE RETIME (FCT_PANEL_RETIME, experimental): the constant shift below
      // (curveTime = timeSec − offset) advances the panel's local curve time 1:1 with
      // scene time — correct ONLY if the panel media plays at clip speed. But the
      // kinetic panels' media [in,out] (e.g. Panels_Across in=0,out=1.602s) is RETIMED
      // to play over the clip [0, animationEndSec=0.801s], so local time advances at
      // rate (out−in)/endSec (=2.0× for Panels_Across). Under the 1:1 shift the panel
      // POSITION sweep lands ~right but the later OPACITY-fade sub-range is never
      // reached (it sits ~1.3s later in local time than the 0.80s clip can cover), so
      // the panels never fade/clear — they persist and cover Transition B at the tail
      // (Center) or leave a partial wipe (Panels_Across). Decode-derived: SPAN=out−in
      // from the media timing, rate=SPAN/endSec; curveTime = −offset + timeSec·rate
      // reproduces the slide-in-then-fade-out staggered flash FCP renders.
      const inn = layer.timing.in && layer.timing.in.timescale > 0
        ? layer.timing.in.value / layer.timing.in.timescale : 0;
      const out = layer.timing.out && layer.timing.out.timescale > 0
        ? layer.timing.out.value / layer.timing.out.timescale : 0;
      const endSec = ectx.animationEndSec ?? 0;
      if ((typeof process === 'undefined' || process.env?.FCT_PANEL_RETIME !== '0') && out - inn > 1e-3 && endSec > 1e-3) {
        // General template retime (default ON; FCT_PANEL_RETIME=0 disables): the panel
        // media plays [in,out] over the clip [0,endSec], so the media-local time at
        // scene t is  in + (t/endSec)·(out−in). Curves are authored relative to
        // `offset`, so curveTime = mediaTime − offset. (Panels_Across in=0, out=1.602,
        // endSec=0.801 → rate 2.0×: the panels' opacity-fade sub-range, ~1.3s later in
        // local time than the constant-shift could reach, now lands in-clip so they
        // fade/clear instead of persisting — Panels_Across 10.38→13.02. Center's panels
        // have in≠0 and rate≈0.5, so the +in term is required to avoid mis-anchoring
        // them — without it Center regressed −0.90; with it Center is neutral +0.07.)
        // MEASURED across all 5 isSolidPanel slugs vs GUI GT: Panels_Across +2.64,
        // Center +0.07, Lower −0.07, Panels_Random −0.17, Up-Over −0.04 — net +2.43,
        // every delta < the 0.30 gate threshold. Decode-derived (SPAN=out−in from media
        // timing, rate=SPAN/endSec), not fitted.
        const rate = (out - inn) / endSec;
        curveTime = inn + timeSec * rate - off;
        // LATE-WINDOW panel ("Lower"): a panel whose raw `in` lands PAST the render end
        // (in > endSec) is authored on the full source timeline and re-anchored by
        // `offset`; its curve settles (local 0 = opacity peak / slide-in complete) at the
        // clip MIDPOINT and then fades to its 0.4 tail by the clip end. The general
        // retime above (rate=(out−in)/endSec, anchored at `in`) instead slides the panel
        // in at frame 0 (opacity peaks ~f3) and never reaches the fade — wrong (min-repro
        // f12–f17 render black; full-gate Lower 9.04 dB). The correct model plays the full
        // source span [0, out≈sceneDuration] over the rendered [0, endSec] (rate =
        // out/endSec) with local-zero pinned to the render midpoint: curveTime(endSec/2)=0,
        // so the opacity peak lands at prog 0.5 (FCP: panel appears at the midpoint, holds,
        // fades out by the end). Decode-derived from the panel's own timing (out=6.773s ≈
        // the 6.8s source duration), NOT fitted. SCOPED to in > endSec so the other
        // isSolidPanel families keep the general retime — they all have in < endSec.
        if (inn > endSec + 1e-3) {
          curveTime = (out / endSec) * (timeSec - endSec / 2);
        }
      } else {
        curveTime = timeSec - off;
      }
    }
  }
  // PROCEDURAL MASK local-frame re-anchor (S8) — default ON (set FCT_PROCMASK=0 to
  // disable). A lifted `<mask>` shape (Wipes/Diagonal's "Animated mask") carries its
  // Position/Scale/Rotation curves in the mask's OWN local time frame, placed at the
  // mask's timeline `offset`. Diagonal's mask has offset=0.3003s with its Position
  // keyed LOCAL 0.3003s→1.0677s (the diagonal sweep). Evaluated at raw scene time the
  // sweep runs ~0.3s early, so shift curveTime by the offset. Scoped to mask shapes
  // with offset > in. Pairs with the parser lift + the write-on envelope below.
  if ((typeof process === 'undefined' || process.env?.FCT_PROCMASK !== '0')
      && layer.type === 'shape' && layer.shape && layer.shape.isMask && layer.timing) {
    const off = layer.timing.offset && layer.timing.offset.timescale > 0
      ? layer.timing.offset.value / layer.timing.offset.timescale : 0;
    const inn = layer.timing.in && layer.timing.in.timescale > 0
      ? layer.timing.in.value / layer.timing.in.timescale : 0;
    if (off - inn > 1e-3) curveTime = timeSec - off;
  }
  const localTransform = buildTransformMatrix(riggedTransform, curveTime, retimeProgress, hasRetime);
  const worldTransform = mat4Multiply(parentTransform, localTransform);

  // WRITE-ON envelope (S8, default ON; FCT_PROCMASK=0 disables): a procedural shape
  // mask (Wipes/Diagonal's "Animated mask") sweeps a finite feathered quad diagonally
  // across the frame — its INSTANTANEOUS alpha reveals THEN RETREATS (coverage
  // 0→85%→0 as the quad enters, crosses, and exits). FCP's reveal is MONOTONIC (once
  // a pixel is revealed by the sweep it stays revealed), so the correct matte is the
  // per-pixel MAX-over-time of the instantaneous alpha. Sample the mask's
  // worldTransform at K sub-times from mask-start (curveTime local-zero) up to the
  // current curveTime; the compositor rasterizes each and unions (max) into the
  // monotonic envelope. Scoped exactly like the re-anchor above (mask shape, offset
  // > in). VERIFIED on GUI-GT: Diagonal pair 11.39→13.47 dB (+2.08), 0 regressions.
  let writeOnTransforms: Float64Array[] | undefined;
  if ((typeof process === 'undefined' || process.env?.FCT_PROCMASK !== '0')
      && layer.type === 'shape' && layer.shape && layer.shape.isMask && layer.timing) {
    const off = layer.timing.offset && layer.timing.offset.timescale > 0
      ? layer.timing.offset.value / layer.timing.offset.timescale : 0;
    const inn = layer.timing.in && layer.timing.in.timescale > 0
      ? layer.timing.in.value / layer.timing.in.timescale : 0;
    if (off - inn > 1e-3) {
      // Determine whether this mask actually SWEEPS: does its local translation move
      // meaningfully across its animation window? A STATIC mask (offset>in but
      // stationary geometry, e.g. Color_Panels' panel masks) gains nothing from a
      // write-on envelope — every sub-time rasterization would be identical — and
      // would pay 12× the render cost, so it falls through to the normal single-
      // transform path (writeOnTransforms stays undefined). Only a moving sweep
      // (Wipes/Diagonal) gets the monotonic accumulation. The verdict must be
      // FRAME-INDEPENDENT (same for every frame of a slug, else the matte semantics
      // flip mid-transition), so probe the LOCAL transform over a fixed window
      // [0, probeEnd] anchored on the mask's timeline duration (out−offset), not on
      // the current curveTime; > 8px of translation over that window ⇒ a real sweep.
      const outSec = layer.timing.out && layer.timing.out.timescale > 0
        ? layer.timing.out.value / layer.timing.out.timescale : 0;
      const probeEnd = Math.max(outSec - off, 0.5);
      const lt0 = buildTransformMatrix(riggedTransform, 0, retimeProgress, hasRetime);
      const ltEnd = buildTransformMatrix(riggedTransform, probeEnd, retimeProgress, hasRetime);
      const swept = Math.hypot(ltEnd[12] - lt0[12], ltEnd[13] - lt0[13]) > 8;
      if (swept) {
        // curveTime is already offset-shifted (= timeSec - off); the mask's local
        // animation starts at curveTime 0. Sample K+1 steps in [0, curveTime]; the
        // compositor rasterizes each and unions (max) into the monotonic envelope.
        // curveTime<=0 (sweep not entered) ⇒ empty ⇒ reveal nothing yet.
        if (curveTime > 1e-4) {
          const K = 12;
          const xs: Float64Array[] = [];
          for (let k = 0; k <= K; k++) {
            const st = (curveTime * k) / K;
            const lt = buildTransformMatrix(riggedTransform, st, retimeProgress, hasRetime);
            xs.push(mat4Multiply(parentTransform, lt));
          }
          writeOnTransforms = xs;
        } else {
          writeOnTransforms = [];
        }
      }
      // else: static mask ⇒ leave undefined ⇒ normal single-transform rasterization.
    }
  }

  // Opacity: Motion stores 0-1 (some legacy use 0-100 but all current transitions use 0-1).
  // Uses `curveTime` (offset-shifted for local-frame drop zones — see above) so the
  // Opacity crossfade stays in lock-step with the offset-shifted Rotation/Scale; for
  // every other layer curveTime === timeSec.
  let rawOpacity = resolveValue(riggedTransform.opacity, curveTime, 1);
  rawOpacity = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;
  // Fade In/Fade Out behaviors ramp opacity within the behavior's own <timing>
  // window (scene time). These are independent of the Retime curve — the fade
  // anchors come from the behavior timing, not the retimed template frame.
  if (layer.behaviors && layer.behaviors.some(b => b.type === 'fade')) {
    rawOpacity *= applyFadeBehaviors(layer, timeSec, ectx);
  }
  // Opacity-driving Ramp behaviors run over the behavior's own timing window
  // (scene time), like Fade — NOT the retimed template frame.
  if (sceneBehaviors.length > 0) {
    rawOpacity *= applyRampOpacity(layer, sceneBehaviors, timeSec, ectx);
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
  const children = layer.children.map(child => evaluateLayer(child, timeSec, worldTransform, behaviors, widgetValues, sceneBehaviors, layerById, linksByTarget, ectx));

  // Disabled nodes (<enabled>0</enabled>) drive other objects but are never drawn.
  // EXCEPTION: a Replicator whose Object Source resolves to real content is the
  // VISIBLE output even when Motion marks it enabled=0 (the base state is off and
  // a Sequence Replicator behavior drives the per-instance opacity). Treat such a
  // replicator as drawn at full opacity so the compositor can tile its cell. This
  // is scoped strictly to replicators with a cellSourceId, so non-replicator
  // hidden drivers (e.g. Push's Color Solid) are unaffected.
  const isContentReplicator = layer.type === 'replicator' && layer.cellSourceId !== undefined;
  const drawn = layer.enabled !== false || isContentReplicator;
  let effectiveOpacity = isContentReplicator ? Math.max(opacity, 1) : opacity;
  // A forced-A persistent base renders opaque regardless of its (timed-out)
  // opacity curve, which would otherwise be 0 past the layer's lifetime.
  if (forceSourceA) effectiveOpacity = 1;
  // A held incoming-B base renders opaque past its (timed-out) opacity curve, which
  // would otherwise be 0 — the settled B must be fully visible in the tail.
  if (heldIncomingB) effectiveOpacity = 1;

  // A group holding a still-live overlay/base child must stay visible past its own
  // (timed-out) window so it doesn't gate that child out. Two cases:
  //  - a forced-A persistent base (Lights/Flash's drop-zone "Group" — out=0.267s
  //    but keeps showing source A behind the flash), and
  //  - a non-mask filled-shape overlay whose opacity fade tail outlives the group
  //    window (Lights/Flash's flash "Group 1" — out=0.267s but the white
  //    rectangles ride down to opacity 0 at scene 0.3s).
  //  - a HELD incoming-B base (Movements/Smear): the "Cartoon Whoosh" group times
  //    out at 0.467s but its B drop zone is held to endSec as the settled base, so
  //    the group must stay visible or it would gate B out (black tail).
  if (layer.type === 'group' && !visible && children.some(c =>
        c.opacity > 0 && (c.forceSourceA || c.heldIncomingB
          || (c.layer.type === 'shape' && c.layer.shape && !c.layer.shape.isMask && c.layer.shape.fillColor)))) {
    visible = true;
    if (effectiveOpacity <= 0) effectiveOpacity = 1;
  }

  return {
    layer,
    localTransform,
    worldTransform,
    opacity: (visible && drawn) ? effectiveOpacity : 0,
    crop,
    visible: visible && drawn && effectiveOpacity > 0,
    children,
    forceSourceA,
    heldIncomingB,
    writeOnTransforms,
  };
}

// ============================================================================
// Main evaluate entry point
// ============================================================================



export function evaluate(scene: MotrScene, timeSec: number): EvaluatedScene {
  const fps = scene.settings.frameRate || 30;
  // Detect the "persistent-A-base + overlay" case (e.g. Lights/Flash): a wrapping
  // drop zone (Retime mode 1) whose lifetime ends well before the scene's true
  // animation end, WITH a solid-fill-shape overlay that keeps animating. In that
  // case the drop zone loops back to source A and stays on-screen as the base for
  // the overlay, instead of vanishing (which would leave an empty frame behind the
  // flash). Gated on a filled-shape overlay so media-overlay Lights transitions
  // (Bloom, Light Noise) — whose correct tail is the frozen-A wrap — are untouched.
  let wrapToA = false;
  let holdIncomingB = false;
  let filterRevealSettleB = false;
  {
    const end = scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale);
    const frameSec = fps > 0 ? 1 / fps : 1 / 30;
    let minWrap = Infinity;
    let hasFilledShapeOverlay = false;
    // A LIVE Transition-B drop zone at the tail (its `out` reaches endSec) means
    // the scene SETTLES ON PHOTO B, not on a persistent-A base. The wrap-to-A
    // pattern (Lights/Flash) applies when the wrapping drop-zone dies well before
    // endSec AND no successor B drop zone remains alive at endSec — the overlay
    // then rides over a re-looped source A base. But Stylized/Kinetic/Center
    // chains A (out=2.40) → B (out=5.27, endSec 4.67) as a straight succession
    // with an inverted-mask panel overlay: past A's out, source B is alive and IS
    // the settled tail (GT + headless FCP both render photo B at f23; the engine
    // was rendering photo A because wrapToA forced A visible on top of B). So
    // gate wrapToA on "no transitionB drop zone alive at endSec". Verified on the
    // 10 wrapToA-eligible slugs (fct: /tmp/scan5.mjs): Flash / Close_and_Open /
    // Up_Over have no live-B tail → keep wrapToA (correct); Center + Multi /
    // Duplicate / Diagonal / Glide / Panels_Random / Panels_Across have live B
    // at tail → wrapToA off (correct: tail is B). Structural (drop-zone timing),
    // never a slug name.
    let bDropZoneAliveAtEnd = false;
    (function scan(ls: Layer[]) {
      for (const l of ls) {
        if (l.type === 'image' && l.retimeValue && l.retimeValue.retimingExtrapolation === 1
          && l.retimeValue.keyframes.length >= 2 && l.timing) {
          const out = l.timing.out.timescale > 0 ? l.timing.out.value / l.timing.out.timescale : 0;
          if (out > 0 && out < minWrap) minWrap = out;
          if (l.source?.type === 'transitionB' && out >= end - frameSec) bDropZoneAliveAtEnd = true;
        }
        if (l.type === 'shape' && l.shape && !l.shape.isMask && (l.shape.fillColor || l.shape.isSolidPanel)) hasFilledShapeOverlay = true;
        scan(l.children);
      }
    })(scene.layers);
    wrapToA = hasFilledShapeOverlay && minWrap !== Infinity && end > minWrap + frameSec
      && !bDropZoneAliveAtEnd;
    // Detect a blended (screen/add) VIDEO overlay that outlives the drop-zone
    // crossfade: it keeps the scene alive past the B drop zone's timeout, so the
    // incoming B must be held (not vanish to black) behind the overlay.
    let hasBlendedMediaOverlay = false;
    (function scan2(ls: Layer[]) {
      for (const l of ls) {
        if (l.type === 'image' && l.source?.type === 'media'
          && (l.blendMode === 'screen' || l.blendMode === 'add'
            || l.blendMode === 'overlay' || l.blendMode === 'lighten')
          && l.timing) {
          const out = l.timing.out.timescale > 0 ? l.timing.out.value / l.timing.out.timescale : 0;
          if (out > minWrap + frameSec) hasBlendedMediaOverlay = true;
        }
        scan2(l.children);
      }
    })(scene.layers);
    holdIncomingB = hasBlendedMediaOverlay;
    // A filter-driven A→B reveal that settles on B, whose incoming B drop zone dies
    // BEFORE the animation end (Smear): A is dissolved/displaced away by its image
    // filter, revealing B; both drop zones die before the animation end but the GUI
    // tail holds photo B. Hold the incoming B past its `out` as the settled base so
    // the wrap-released tail shows B, not black. (The structural family also includes
    // Bloom/Combo Spin/Black Hole, but those keep B alive to the end and settle via
    // the crossfade, so only the force-hold subset gets holdIncomingB here — see
    // capabilities.needsFilterRevealForceHoldB.)
    filterRevealSettleB = needsFilterRevealForceHoldB(scene);
    if (filterRevealSettleB) holdIncomingB = true;
  }
  const ectx: EvalCtx = { fps, wrapToA, holdIncomingB, filterRevealSettleB, animationEndSec: scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale) };
  const parentTransform = mat4Identity();
  const widgetValues = buildWidgetValueMap(scene.rigWidgets);
  adjustDegenerateDirection(scene, widgetValues);
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
  const layers = scene.layers.map(layer => evaluateLayer(layer, timeSec, parentTransform, behaviors, widgetValues, sceneBehaviors, layerById, linksByTarget, ectx));
  const filterOverrides = computeFilterOverrides(scene, timeSec, widgetValues);

  // Colour-channel Links (ROADMAP S1/T-A1): resolve each colour Link's source
  // Fill Color RGB and merge Colorize-remap overrides into filterOverrides via
  // special `__ColorLink.RemapBlack/White.{R|G|B}` keys the Colorize filter reads.
  // Shape-fill overrides ride on the EvaluatedLayer as `fillColorOverride`.
  const colorLinks = computeColorLinks(scene, timeSec);
  mergeColorLinksIntoFilterOverrides(filterOverrides, colorLinks);
  if (colorLinks.shapeFill.size > 0) {
    (function propagateShapeFill(els: EvaluatedLayer[]) {
      for (const el of els) {
        const override = colorLinks.shapeFill.get(el.layer.id);
        if (override) el.fillColorOverride = override;
        propagateShapeFill(el.children);
      }
    })(layers);
  }

  // Index every evaluated layer by object ID so the compositor can resolve a
  // replicator cell's Object Source to its fully-evaluated content.
  const evalLayerById = new Map<number, EvaluatedLayer>();
  (function indexEval(els: EvaluatedLayer[]) {
    for (const el of els) { evalLayerById.set(el.layer.id, el); indexEval(el.children); }
  })(layers);

  // Resolve the 3D camera (if any). Motion's Camera node sets a vertical Angle Of
  // View that determines the framing distance: content at Z=0 fills the frame, and
  // layers with world-Z get perspective foreshortening. distance = (H/2)/tan(AOV/2).
  // Scene-level Replicator presence (parse-time factory check). A "Replicator" or
  // "Sequence Replicator" factory means the scene tiles a cell across a clone grid /
  // panel wall / 360° environment — a genuine 3D scene that must use the camera's
  // perspective projection. Its ABSENCE (with a static camera) marks a rig/Link
  // plane-fold that Motion composites orthographically. See resolveCamera.
  let sceneHasReplicator = false;
  for (const desc of scene.factories.values()) {
    if (desc === 'Replicator' || desc === 'Sequence Replicator') { sceneHasReplicator = true; break; }
  }
  const camera = resolveCamera(layers, widgetValues, scene.settings.height, evalLayerById, timeSec, scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale), sceneHasReplicator, scene.settings.width);

  return {
    layers,
    time: timeSec,
    animationEndSec: scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale),
    width: scene.settings.width,
    height: scene.settings.height,
    dropZoneMediaHeight: scene.settings.dropZoneMediaHeight,
    filterOverrides,
    layerById,
    evalLayerById,
    camera,
    emitters: scene.emitters,
    particleCells: scene.particleCells,
  };
}

/**
 * Geometric centre of the tile WALL — the point a framing camera dollies away
 * from in a replicator "wall" transition (Video_Wall).
 *
 * The scene tiles the wall with MANY replicators (Video_Wall: 14), but only the
 * LARGEST (most instances) is the main body of the wall — the smaller ones are
 * edge/fill patches whose off-centre positions skew a naive all-instance centroid
 * far off the visible wall centre (Video_Wall's all-instance centroid is
 * (1016,1903); the main 3×3 grid is centred on the origin, which is where the GUI
 * GT frames). So the wall centre = the bounding-box centre of the replicator with
 * the MOST instances. Returns undefined when the scene has no replicator tiles (so
 * the framing pose keeps its ray-cast fallback). Pure geometric readout of the
 * graph — no constant, no per-transition logic.
 */
function computeWallCenter(layers: EvaluatedLayer[]): [number, number, number] | undefined {
  let best: { n: number; cx: number; cy: number; cz: number } | undefined;
  const walk = (ls: EvaluatedLayer[]) => {
    for (const l of ls) {
      if (l.layer.type === 'replicator' && l.layer.replicator) {
        const insts = generateInstances(l.layer.replicator);
        if (insts.length > 0) {
          const wt = l.worldTransform;
          let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
          for (const inst of insts) {
            const px = wt[12] + inst.x, py = wt[13] + inst.y;
            if (px < minx) minx = px; if (px > maxx) maxx = px;
            if (py < miny) miny = py; if (py > maxy) maxy = py;
          }
          if (!best || insts.length > best.n) {
            best = { n: insts.length, cx: (minx + maxx) / 2, cy: (miny + maxy) / 2, cz: wt[14] };
          }
        }
      }
      walk(l.children);
    }
  };
  walk(layers);
  if (!best) return undefined;
  return [best.cx, best.cy, best.cz];
}

/**
 * Find the Camera layer in the evaluated tree and resolve its projection.
 * Returns the vertical Angle Of View, the framing distance, and the camera's
 * world transform (default: identity, camera at origin looking down -Z).
 */
function resolveCamera(
  layers: EvaluatedLayer[],
  widgetValues: Map<number, number>,
  frameHeight: number,
  evalLayerById: Map<number, EvaluatedLayer>,
  timeSec: number,
  animationEndSec: number,
  sceneHasReplicator: boolean,
  frameWidth: number = frameHeight
): { angleOfView: number; distance: number; worldTransform: Float64Array; framed?: { viewX: number; viewY: number; viewZ: number; framingDistance: number; eye: [number, number, number]; target: [number, number, number]; aov: number } } | undefined {
  let camLayer: EvaluatedLayer | undefined;
  const walk = (ls: EvaluatedLayer[]) => {
    for (const l of ls) {
      if (l.layer.type === 'camera') { camLayer = l; return; }
      walk(l.children);
      if (camLayer) return;
    }
  };
  walk(layers);
  if (!camLayer || !camLayer.layer.camera) {
    // Camera-less 3D scene (e.g. Movements/Fall). Decompiling Ozone.framework
    // (Apple Silicon Ozone binary, disassembled with otool -tV):
    //   OZScene::getActiveCamera(CMTime)  @ 0x65cb4 iterates the scene's OZCamera
    //   nodes via begin_t<OZCamera>. When the scene has NO OZCamera node the loop
    //   falls through to 0x65f64 (`mov w19,#0x0`) and RETURNS NULL — there is no
    //   synthetic default camera object created for the render path.
    //   OZViewer::viewIsOrthographic @ 0x37420 then takes its null-camera branch
    //   (cbz x0 -> 0x37444 zeroes the camera slot) so the effective |angleOfView|
    //   is 0; the routine compares fabs(AOV) against the double 0x3e7ad7f29abcaf48
    //   (== 1.0e-7 exactly) and returns true. A null/AOV-0 camera therefore renders under a
    //   PARALLEL (orthographic) projection with no perspective foreshortening.
    // So a camera-less 3D transition is framed orthographically: every Z projects
    // at scale 1 (distance -> infinity). This matches the headless GT, whose Fall
    // PSNR rises monotonically as the assumed camera distance grows
    // (1303->17.4dB, 2000->18.5dB, orthographic->20.6dB) with no interior optimum.
    return { angleOfView: 0, distance: Infinity, worldTransform: mat4Identity() };
  }

  const cam = camLayer.layer.camera;
  let aov = cam.angleOfView;

  // If the AOV is rig-driven, pick the snapshot the selected widget points to.
  if (cam.aovSnapshots && cam.aovSnapshots.length > 0 && cam.aovWidgetId !== undefined) {
    const wv = widgetValues.get(cam.aovWidgetId);
    if (wv !== undefined) {
      let idx = Math.round(wv);
      idx = Math.max(0, Math.min(cam.aovSnapshots.length - 1, idx));
      aov = cam.aovSnapshots[idx];
    } else {
      // No widget value — snapshots often share the "active" AOV; use the first.
      aov = cam.aovSnapshots[0];
    }
  }

  const halfRad = (aov * Math.PI) / 360; // AOV/2 in radians
  const t = Math.tan(halfRad);
  let distance = t > 1e-9 ? (frameHeight / 2) / t : 1e9;

  // ORTHOGRAPHIC PLANE-FOLD scenes (decoded 2026-07-14f).
  // Motion composites a group's 3D contents into the scene through the active
  // camera's perspective projection ONLY when the scene is a genuine 3D scene.
  // A transition whose entire 3D content is a set of rig/Link-rotated PLANES with
  // NO Replicator anywhere (no clone grid, no particle system, no 360° environment
  // replicator) is composited by Motion in its flattened 2D space — i.e. under a
  // PARALLEL/orthographic projection, exactly like the camera-less branch above
  // (OZViewer::viewIsOrthographic). The perspective camera object still exists in
  // the .motr (it sets the framing/AOV for the authoring canvas) but the rendered
  // transition output foreshortens the folding planes far LESS than a 45°/31° AOV
  // camera would — the score rises MONOTONICALLY toward distance→∞ with no interior
  // optimum, the same signature the camera-less orthographic slugs (Fall) show.
  //
  // Discriminator (structural, no transition names): a static (non-framing) camera
  // driving a scene that contains ZERO Replicator layers. This fires on exactly the
  // two rep=0 static-camera slugs (Color_Planes, Reflection) and NO others — every
  // perspective-needing static-camera slug carries ≥2 Replicator refs (3D_Rectangle
  // clone box, 360° environment replicators, Close_and_Open panel replicator), and
  // forcing THEM orthographic was MEASURED to regress (Close_and_Open 10.87→10.55,
  // 3D_Rectangle 16.59→16.23). Framing cameras (factory-3, Video_Wall/Clone_Spin)
  // are handled by their own framed-pose path below and are unaffected.
  // MEASURED wins: Color_Planes 11.26→14.26 (+3.0), Reflection 12.61→13.52 (+0.91).
  const hasFraming = !!(cam.framing && cam.framing.length > 0);
  if (!hasFraming && !sceneHasReplicator) {
    // Replicator-free plane-fold scene → orthographic (parallel) projection.
    // NOTE the discriminator is a PARSE-TIME factory check (scene.factories has a
    // "Replicator"/"Sequence Replicator" node), NOT an evaluated-layer-type scan:
    // Motion expands a Replicator/Sequence-Replicator node into per-instance CLONE
    // layers at render time, so the evaluated tree of 3D_Rectangle shows 25 [clone]
    // layers and ZERO [replicator] layers — a `type === 'replicator'` scan wrongly
    // returned false and force-orthographic'd it (MEASURED regression −0.56). The
    // factory-description presence is the clean binary separator: False only for
    // Color_Planes/Reflection, True for every perspective clone/panel/360° slug.
    distance = Infinity;
  }

  // Framing camera (factory 3): the static camera position is ignored; the camera
  // is driven to frame its Framing behaviors' targets (OZScene::computeFraming),
  // reconciled across the framer proxy (orientation) and the content tile (anchor
  // + dolly). See resolveFramedWallPose — fully param-driven, no per-transition
  // constant.
  let framed: { viewX: number; viewY: number; viewZ: number; framingDistance: number; eye: [number, number, number]; target: [number, number, number]; aov: number } | undefined;
  if (cam.framing && cam.framing.length > 0) {
    const frameAspect = frameHeight > 0 ? frameWidth / frameHeight : 1;
    // Wall centroid: the geometric centre of every replicated tile instance in the
    // scene (the point the framing camera dollies away from). Computed from the
    // replicator instance grid — each replicator's world-transform translation plus
    // its per-instance offsets — averaged over all instances. Used only by the
    // 2-behavior wall pose (Video_Wall); undefined when no replicator tiles exist,
    // in which case the pose falls back to its proxy-ray-cast anchor.
    const wallCenter = computeWallCenter(layers);
    const staticCamPos: [number, number, number] = [
      camLayer.worldTransform[12], camLayer.worldTransform[13], camLayer.worldTransform[14],
    ];
    const wall = resolveFramedWallPose(cam.framing, (id) => evalLayerById.get(id), aov, frameHeight, timeSec, animationEndSec, wallCenter, staticCamPos, frameWidth);
    const pose = wall ?? resolveFramedPose(cam.framing, (id) => evalLayerById.get(id), aov, timeSec, frameAspect);
    if (pose) {
      framed = { viewX: pose.target[0], viewY: pose.target[1], viewZ: pose.target[2], framingDistance: pose.distance, eye: pose.pos, target: pose.target, aov };
    }
  }
  return { angleOfView: aov, distance, worldTransform: camLayer.worldTransform, framed };
}
