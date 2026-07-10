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
import { evaluateFade, evaluateRampAtProgress, evaluateOscillate, evaluateSpin } from './behaviors/index.js';
import { resolveFramedPose, resolveFramedWallPose } from './framing.js';
import {
  mat4Identity, mat4Multiply, mat4Translate, mat4Scale, mat4RotateZ, mat4RotateX, mat4RotateY,
} from './matrix.js';
import { computeFilterOverrides } from './filter-overrides.js';

export { evaluateCurve, resolveValue, timeToSeconds } from './curves.js';
export {
  mat4Identity, mat4Multiply, mat4Translate, mat4Scale, mat4RotateZ, mat4RotateX, mat4RotateY,
} from './matrix.js';

/**
 * Scene frame rate for the current evaluation pass. Set at the top of
 * `evaluate()`. Fade In/Out Times are expressed in frames; the behavior's
 * timing window is in seconds, so we need the fps to convert.
 *
 * These three were module-level globals (set per-render at the top of evaluate()),
 * which meant two concurrent evaluate() calls corrupted each other and tests had to
 * run serially. They are now bundled into a per-call EvalCtx threaded through the
 * evaluation tree (evaluate -> evaluateLayer -> ...). Nothing render-scoped is a
 * module global anymore.
 */
interface EvalCtx {
  /** scene.settings.frameRate (or 30). Frame->second conversions for behaviors. */
  fps: number;
  /**
   * When true, a wrapping drop-zone image layer (Retime mode 1) whose lifetime has
   * ended is kept VISIBLE re-showing source A past its `out`, rather than
   * disappearing. Set only when the transition has an independent overlay animation
   * that outlives the drop-zone crossfade (e.g. Lights/Flash's white flash), so the
   * flash rides over a persistent source-A base instead of an empty frame.
   */
  wrapToA: boolean;
  /**
   * When true, the incoming (Type=2) Transition-B drop zone HOLDS its last frame
   * (source B) past its timing `out`, staying visible as the settled base. Set for a
   * scene whose drop-zone A->B crossfade is over-run by an independent blended VIDEO
   * overlay (Lights/Light Noise). Without it the tail frames render an empty base.
   */
  holdIncomingB: boolean;
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
  /**
   * When true, the compositor renders this image layer as source A regardless of
   * its declared transitionA/B source. Set for a wrapping drop zone (Retime mode
   * 1) whose lifetime has ended while an independent overlay animation keeps the
   * scene alive (e.g. Lights/Flash): FCP loops the drop-zone media back to the
   * transition start (source A), so the flash rides over a persistent A base
   * instead of an empty frame.
   */
  forceSourceA?: boolean;
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
 * Build a map of object ID → Layer for driver lookups (Link behaviors, clones).
 */
function buildLayerById(layers: Layer[], map: Map<number, Layer>): Map<number, Layer> {
  for (const l of layers) {
    map.set(l.id, l);
    buildLayerById(l.children, map);
  }
  return map;
}

/** Read a driver layer's animated channel (X/Y/Z) from the given transform
 *  property (position/rotation/scale) at a given time. */
function driverChannelValue(driver: Layer, channel: 'X' | 'Y' | 'Z', timeSec: number, prop: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor' = 'position'): number {
  const t = driver.transform;
  let c: Curve | number | undefined;
  if (prop === 'opacity') {
    // Opacity is a scalar (channel-independent). Motion stores 0-1; some legacy
    // files use 0-100. Default 1 (fully opaque) when unset.
    let v = resolveValue(t.opacity, timeSec, 1);
    if (v > 1) v /= 100;
    return v;
  }
  if (prop === 'rotation') {
    c = channel === 'X' ? t.rotationX : channel === 'Y' ? t.rotationY : t.rotationZ;
    return resolveValue(c, timeSec, 0);
  }
  if (prop === 'scale') {
    c = channel === 'X' ? t.scaleX : channel === 'Y' ? t.scaleY : t.scaleZ;
    return resolveValue(c, timeSec, 1);
  }
  if (prop === 'anchor') {
    c = channel === 'X' ? t.anchorX : channel === 'Y' ? t.anchorY : t.anchorZ;
    return resolveValue(c, timeSec, 0);
  }
  c = channel === 'X' ? t.positionX : channel === 'Y' ? t.positionY : t.positionZ;
  return resolveValue(c, timeSec, 0);
}

/**
 * Resolve a DRIVER layer's effective channel value as a Link source — i.e. after
 * the driver's OWN rig behaviors and its own (non-relative) self-links have been
 * applied. Plain `driverChannelValue` reads the driver's RAW authored transform,
 * which is correct for Push (its slide is baked into the driver's position curve)
 * but WRONG for a pivot rig whose driver is itself rigged/self-linked.
 *
 * Movements/Switch's driver (the hidden Color Solid) sets its own anchor via a
 * self-LinkPos (anchorX ← its own positionX) and its position via an aspect-ratio
 * rig snapshot. Reading its raw anchor (737) instead of the self-linked value
 * (≈ its rigged position) collapses the off-screen pivot the swinging fold needs.
 * Resolving the driver's rig + self-links gives anchor ≈ position ≈ 2363, so the
 * images (which copy both) stay centred at t=0 and swing about that far-right
 * pivot exactly as FCP renders.
 *
 * Self-links only (sourceObjectId === driver.id) are applied here, and they read
 * the driver's rigged base directly (no recursion) — enough for the shipped
 * pivot rigs and loop-safe. The driver's rig behaviors are applied first.
 */
function resolveDriverChannel(
  driver: Layer,
  channel: 'X' | 'Y' | 'Z',
  timeSec: number,
  prop: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor',
  behaviors: RigBehavior[],
  widgetValues: Map<number, number>,
  layerById?: Map<number, Layer>,
  linksByTarget?: Map<number, import('../types.js').LinkBehavior[]>,
  visited?: Set<number>
): number {
  // The base (raw authored) channel value.
  const baseVal = driverChannelValue(driver, channel, timeSec, prop);
  const selfLinks = (driver.links || []).filter(l => l.sourceObjectId === driver.id);

  // CROSS-links: Links where this layer copies a channel from ANOTHER object.
  // Needed for chained pivot rigs (Movements/Switch): Transition A links its
  // anchor/position from Clone B, which links from Transition B, which links
  // from the hidden Color Solid driver. Reading A's pivot source (Clone B)
  // naively returns Clone B's RAW transform (identity) — so A rotates about the
  // scene origin instead of the shared right-side pivot. Resolving the source's
  // own cross-links recursively propagates the real pivot down the chain.
  const crossLinks = layerById && linksByTarget
    ? (linksByTarget.get(driver.id) || []).filter(l => l.sourceObjectId !== driver.id)
    : [];

  // Fast path: a driver with NO self-links AND no relevant cross-links behaves
  // exactly as its raw channel (preserves Push et al. — their driver's position
  // is read directly and its rig behaviors are applied by the normal per-layer
  // pass; re-applying them here would double-count Push's Direction snapshots).
  if (selfLinks.length === 0 && crossLinks.length === 0) return baseVal;

  // Pivot rig (Movements/Switch): the driver copies one of its own channels onto
  // another via a self-link (anchorX ← positionX). Resolve that so a downstream
  // Link reading the driver's anchor gets the self-linked value, not the stale
  // authored anchor. The self-link's SOURCE channel is read after the driver's
  // own rig behaviors (its position comes from an aspect-ratio Position snapshot),
  // matching how the driver itself is evaluated.
  const rigged = applyRigBehaviors(driver, driver.transform, behaviors, widgetValues);
  const readRigged = (p: typeof prop, ch: typeof channel): number => {
    if (p === 'opacity') { const vv = resolveValue(rigged.opacity, timeSec, 1); return vv > 1 ? vv / 100 : vv; }
    if (p === 'rotation') return resolveValue(ch === 'X' ? rigged.rotationX : ch === 'Y' ? rigged.rotationY : rigged.rotationZ, timeSec, 0);
    if (p === 'scale') return resolveValue(ch === 'X' ? rigged.scaleX : ch === 'Y' ? rigged.scaleY : rigged.scaleZ, timeSec, 1);
    if (p === 'anchor') return resolveValue(ch === 'X' ? rigged.anchorX : ch === 'Y' ? rigged.anchorY : rigged.anchorZ, timeSec, 0);
    return resolveValue(ch === 'X' ? rigged.positionX : ch === 'Y' ? rigged.positionY : rigged.positionZ, timeSec, 0);
  };
  let value = readRigged(prop, channel);
  for (const sl of selfLinks) {
    if (sl.targetProp !== prop || sl.targetChannel !== channel) continue;
    if (sl.customMix === 0) continue;
    const sv = readRigged(sl.sourceProp, sl.sourceChannel) * sl.scale + sl.offset;
    value = value * (1 - sl.customMix) + sv * sl.customMix;
  }
  // Apply cross-links targeting this channel/prop, resolving their source
  // recursively (visited guard prevents cycles). Motion's Link REPLACES via a
  // mix blend: result = base*(1-mix) + src*scale*mix. Range clamp uses the
  // ±100 sentinel convention (only clamp when a non-default range is present).
  if (crossLinks.length > 0 && layerById && linksByTarget) {
    const vis = visited ?? new Set<number>();
    if (!vis.has(driver.id)) {
      vis.add(driver.id);
      for (const cl of crossLinks) {
        if (cl.targetProp !== prop || cl.targetChannel !== channel) continue;
        if (cl.customMix === 0) continue;
        const src = layerById.get(cl.sourceObjectId);
        if (!src) continue;
        let sv = resolveDriverChannel(
          src, cl.sourceChannel, timeSec, cl.sourceProp, behaviors, widgetValues,
          layerById, linksByTarget, vis
        );
        const defRange = cl.min === -100 && cl.max === 100;
        if (!defRange) { if (sv < cl.min) sv = cl.min; if (sv > cl.max) sv = cl.max; }
        sv = sv * cl.scale + cl.offset;
        value = value * (1 - cl.customMix) + sv * cl.customMix;
      }
      vis.delete(driver.id);
    }
  }
  return value;
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
  timeSec: number,
  behaviors: RigBehavior[]
): Transform {
  const rawLinks = linksByTarget.get(layer.id);
  if (!rawLinks || rawLinks.length === 0) return transform;
  // Fold-rig detection: when a group carries BOTH a position-Z Link and an
  // anchor-Z Link from the SAME driver (Movements/Reflection: LinkPos.Z + LinkAnchor.Z,
  // both off the hidden Color Solid), Motion pins the content to the pivot plane —
  // the driver's Z animation is the rotation-hinge DEPTH, not a viewer-distance
  // translation. The engine models the pivot via the anchor separately, so applying
  // the position-Z as an extra world-Z translation double-counts it and makes the
  // card recede far too much (verified: dropping it lifts Reflection 10.9→12.9dB).
  // Drop the coupled position-Z link (content stays on the screen plane and only
  // rotates). Position X/Y and rotation links are unaffected.
  const anchorZSources = new Set<number>();
  for (const a of rawLinks) {
    if (a.targetProp === 'anchor' && a.targetChannel === 'Z') anchorZSources.add(a.sourceObjectId);
  }
  const links = anchorZSources.size === 0 ? rawLinks : rawLinks.filter(l =>
    !(l.targetProp === 'position' && l.targetChannel === 'Z' && anchorZSources.has(l.sourceObjectId)));
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

    let v = resolveDriverChannel(driver, link.sourceChannel, timeSec, link.sourceProp, behaviors, widgetValues, layerById, linksByTarget);
    // Motion's "Clamp Source Value Within Range" uses min/max = ±100 as the
    // default (unset) UI sentinel; real transitions drive far past ±100 (e.g. a
    // full 1080px push). Only clamp when a non-default range is present.
    const defaultRange = link.min === -100 && link.max === 100;
    if (!defaultRange) {
      if (v < link.min) v = link.min;
      if (v > link.max) v = link.max;
    }
    v *= scale;
    // Additive per-clone offset (linked = source*scale + offset). Keeps a clone
    // spatially separated from its shared driver (e.g. Clothesline's Transition B
    // starts +2072px right so it swings to center as the driver slides left).
    v += link.offset;

    // Motion's Link REPLACES the channel via a mix blend, it does NOT add to the
    // base value: result = base*(1-mix) + linkedValue*mix. When mix=1 the channel
    // becomes the linked value outright. Adding (the old behavior) double-counts
    // the clone's static base offset (e.g. Right's base X=+1920 plus a -1*Left
    // link) and shifts the clone mid-transition. The linked channel is marked as
    // an override so buildTransformMatrix skips the Retime static-position ramp.
    const overrides = result.__overrideChannels ?? (result.__overrideChannels = new Set<string>());
    // Route the linked value to the correct transform PROPERTY. A rotation or
    // scale Link (e.g. Clothesline's LinkRotZ on ".../100/109/3") must drive the
    // rotation/scale channel — NOT positionZ. Default (position) keeps Push's
    // position links intact.
    if (link.targetProp === 'rotation') {
      const chan = link.targetChannel === 'X' ? 'rotationX' : link.targetChannel === 'Y' ? 'rotationY' : 'rotationZ';
      const ovKey = link.targetChannel === 'X' ? 'rotX' : link.targetChannel === 'Y' ? 'rotY' : 'rotZ';
      const base = resolveValue(result[chan], timeSec, 0);
      result[chan] = base * (1 - mix) + v * mix;
      overrides.add(ovKey);
    } else if (link.targetProp === 'opacity') {
      // Opacity link (LinkAO/LinkBO/LinkBOF): drive layer opacity from the
      // source's opacity via the mix blend. Motion stores opacity 0-1; the base
      // defaults to 1 (fully opaque). result = base*(1-mix) + linkedOpacity*mix.
      // `v` already carries the source*scale + offset (then clamp) computed above.
      let base = resolveValue(result.opacity, timeSec, 1);
      if (base > 1) base /= 100;
      result.opacity = base * (1 - mix) + v * mix;
    } else if (link.targetProp === 'anchor') {
      // Anchor Link (Movements/Reflection LinkAnchor): copy the driver's anchor
      // channel onto this layer's anchor so the group hinges on the shared spine
      // (driver anchor Z = 960). Anchor default is 0.
      const chan = link.targetChannel === 'X' ? 'anchorX' : link.targetChannel === 'Y' ? 'anchorY' : 'anchorZ';
      const base = resolveValue(result[chan], timeSec, 0);
      result[chan] = base * (1 - mix) + v * mix;
    } else if (link.targetProp === 'scale') {
      // Scale is uniform on these nodes; drive all axes. Scale default is 1.
      const base = resolveValue(result.scaleX, timeSec, 1);
      const nv = base * (1 - mix) + v * mix;
      result.scaleX = nv; result.scaleY = nv; result.scaleZ = nv;
      overrides.add('scaleX'); overrides.add('scaleY'); overrides.add('scaleZ');
    } else if (link.targetChannel === 'X') {
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
    // A continuous Widget resolves to a snapshot *id* − 1 (see parser's
    // resolveContinuousWidgetIndex). But snapshots are stored in DOCUMENT order,
    // which is not id order (e.g. Replicator/Multi's aspect rig: ids 5,4,2,1,3,7).
    // Prefer matching the active snapshot by id (id === widgetValue+1); fall back
    // to positional indexing when there is no id match (discrete-widget rigs whose
    // snapshot ids already equal index+1 are unaffected).
    const byId = behavior.snapshotIds.indexOf(snapIndex + 1);
    if (byId >= 0) snapIndex = byId;
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
function applyRampTransforms(
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
function applyRampOpacity(
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

function applyFadeBehaviors(layer: Layer, timeSec: number, ectx: EvalCtx): number {
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
  // X rotation sign: the perspective projector uses a Y-DOWN local convention
  // (top corner at -hh), so a positive Motion X-rotation must tilt the TOP edge
  // away from the viewer. Negating here makes m6/m9 couple Y→Z the correct way
  // (verified against Fall GT: top edge recedes, bottom swings up).
  const rotX = -resolveWithRetime(tx.rotationX, timeSec, 0, retimeProgress, ov?.has('rotX')) * RAD2DEG;
  const rotY = resolveWithRetime(tx.rotationY, timeSec, 0, retimeProgress, ov?.has('rotY')) * RAD2DEG;
  const rotZ = resolveWithRetime(tx.rotationZ, timeSec, 0, retimeProgress, ov?.has('rotZ')) * RAD2DEG;
  // Scale is FRACTIONAL (1.0 = 100%) in every .motr template (all 108 Scale curves have
  // default="1"). Used as-is — never divided by 100.
  const scX = resolveWithRetime(tx.scaleX, timeSec, 1, retimeProgress, ov?.has('scaleX'));
  const scY = resolveWithRetime(tx.scaleY, timeSec, 1, retimeProgress, ov?.has('scaleY'));
  const scZ = resolveWithRetime(tx.scaleZ, timeSec, 1, retimeProgress, ov?.has('scaleZ'));
  // Anchor is retime-interpolated like position (both have default=0, value=X); they must
  // track together so a static offset (e.g. Fall's -540) cancels, leaving only the rotation pivot.
  const ancX = resolveWithRetime(tx.anchorX, timeSec, 0, retimeProgress);
  const ancY = resolveWithRetime(tx.anchorY, timeSec, 0, retimeProgress);
  // Anchor Z: the rotation/scale pivot's depth. Movements/Reflection's incoming
  // Transition B carries anchor Z = 960 (its page hinges on the shared "spine" at
  // Z=960, not its own centre) — without it, B's 90° pre-rotation leaves it offset
  // ~720px laterally when the group settles, instead of landing full-frame.
  const ancZ = resolveWithRetime(tx.anchorZ, timeSec, 0, retimeProgress);

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
  // Hold the incoming (Type=2) B drop zone past its timeout when a blended overlay
  // keeps the scene alive (Lights/Light Noise): the crossfade has settled on B, so
  // B persists as the base behind the fading overlay instead of vanishing to black.
  if (ectx.holdIncomingB && !visible && layer.type === 'image'
    && layer.source?.type === 'transitionB' && layer.dropZone?.type === 2 && layer.timing) {
    const out = layer.timing.out.timescale > 0 ? layer.timing.out.value / layer.timing.out.timescale : 0;
    const inn = layer.timing.in.timescale > 0 ? layer.timing.in.value / layer.timing.in.timescale : 0;
    if (timeSec > out && timeSec >= inn) visible = true;
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
    if (off > 1e-3) curveTime = timeSec - off;
  }
  const localTransform = buildTransformMatrix(riggedTransform, curveTime, retimeProgress);
  const worldTransform = mat4Multiply(parentTransform, localTransform);

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

  // A group holding a still-live overlay/base child must stay visible past its own
  // (timed-out) window so it doesn't gate that child out. Two cases:
  //  - a forced-A persistent base (Lights/Flash's drop-zone "Group" — out=0.267s
  //    but keeps showing source A behind the flash), and
  //  - a non-mask filled-shape overlay whose opacity fade tail outlives the group
  //    window (Lights/Flash's flash "Group 1" — out=0.267s but the white
  //    rectangles ride down to opacity 0 at scene 0.3s).
  if (layer.type === 'group' && !visible && children.some(c =>
        c.opacity > 0 && (c.forceSourceA
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
  {
    const end = scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale);
    const frameSec = fps > 0 ? 1 / fps : 1 / 30;
    let minWrap = Infinity;
    let hasFilledShapeOverlay = false;
    (function scan(ls: Layer[]) {
      for (const l of ls) {
        if (l.type === 'image' && l.retimeValue && l.retimeValue.retimingExtrapolation === 1
          && l.retimeValue.keyframes.length >= 2 && l.timing) {
          const out = l.timing.out.timescale > 0 ? l.timing.out.value / l.timing.out.timescale : 0;
          if (out > 0 && out < minWrap) minWrap = out;
        }
        if (l.type === 'shape' && l.shape && !l.shape.isMask && (l.shape.fillColor || l.shape.isSolidPanel)) hasFilledShapeOverlay = true;
        scan(l.children);
      }
    })(scene.layers);
    wrapToA = hasFilledShapeOverlay && minWrap !== Infinity && end > minWrap + frameSec;
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
  }
  const ectx: EvalCtx = { fps, wrapToA, holdIncomingB };
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

  // Index every evaluated layer by object ID so the compositor can resolve a
  // replicator cell's Object Source to its fully-evaluated content.
  const evalLayerById = new Map<number, EvaluatedLayer>();
  (function indexEval(els: EvaluatedLayer[]) {
    for (const el of els) { evalLayerById.set(el.layer.id, el); indexEval(el.children); }
  })(layers);

  // Resolve the 3D camera (if any). Motion's Camera node sets a vertical Angle Of
  // View that determines the framing distance: content at Z=0 fills the frame, and
  // layers with world-Z get perspective foreshortening. distance = (H/2)/tan(AOV/2).
  const camera = resolveCamera(layers, widgetValues, scene.settings.height, evalLayerById, timeSec, scene.settings.animationEndSec ?? (scene.settings.duration.value / scene.settings.duration.timescale));

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
  };
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
  animationEndSec: number
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
  const distance = t > 1e-9 ? (frameHeight / 2) / t : 1e9;

  // Framing camera (factory 3): the static camera position is ignored; the camera
  // is driven to frame its Framing behaviors' targets (OZScene::computeFraming),
  // reconciled across the framer proxy (orientation) and the content tile (anchor
  // + dolly). See resolveFramedWallPose — fully param-driven, no per-transition
  // constant.
  let framed: { viewX: number; viewY: number; viewZ: number; framingDistance: number; eye: [number, number, number]; target: [number, number, number]; aov: number } | undefined;
  if (cam.framing && cam.framing.length > 0) {
    const wall = resolveFramedWallPose(cam.framing, (id) => evalLayerById.get(id), aov, frameHeight, timeSec, animationEndSec);
    const pose = wall ?? resolveFramedPose(cam.framing, (id) => evalLayerById.get(id), aov, timeSec);
    if (pose) {
      framed = { viewX: pose.target[0], viewY: pose.target[1], viewZ: pose.target[2], framingDistance: pose.distance, eye: pose.pos, target: pose.target, aov };
    }
  }
  return { angleOfView: aov, distance, worldTransform: camLayer.worldTransform, framed };
}
