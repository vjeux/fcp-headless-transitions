/**
 * Evaluator — link + rig-behavior + driver-channel resolution.
 *
 * Resolves how one object drives another's transform: buildLayerById (id -> Layer for
 * driver lookups), driverChannelValue / resolveDriverChannel (read a driver's animated
 * X/Y/Z channel, with its own rig behaviors applied), applyLinks (Link behaviors:
 * value = source*scale + offset, range-clamped), getSnapshotValue + applyRigBehaviors
 * (map a rig widget's selected snapshot onto a target transform). Split out of
 * evaluator/index.ts (ROADMAP item 7).
 */
import type { Layer, Transform, Parameter, Curve, RigBehavior, LinkBehavior } from '../types.js';
import { resolveValue } from './curves.js';

/**
 * Build a map of object ID → Layer for driver lookups (Link behaviors, clones).
 */
export function buildLayerById(layers: Layer[], map: Map<number, Layer>): Map<number, Layer> {
  for (const l of layers) {
    map.set(l.id, l);
    buildLayerById(l.children, map);
  }
  return map;
}

/**
 * Compute a driver layer's LOCAL curve time when its scenenode `timing.offset`
 * shifts the local timeline from the parent. Motion authors a driver's transform
 * curves in the local frame (local_time = scene_time - offset); reading at raw
 * scene_time reads the wrong point.
 *
 * Movements/Color_Planes is the canonical case: its hidden Color Solid driver has
 * `offset=-68068/120000 = -0.567s` (with `in=0`). Position.Z / Rotation.Y are
 * authored at local times 0.567..2.369s (6 KFs). Without the shift the last two
 * KFs (KF5@1.802 val 649.95, KF6@2.369 val 0) never play at scene time 0..1.802 —
 * Group 2 stays at Z≈600 (a small tilted plane off-camera at scene end) instead
 * of unwinding to Z=0 (full-frame unfolded B). SAME shift semantics the
 * evaluator applies to `image`/`shape` drop zones with `off - in != 0` (see
 * evaluator/index.ts curveTime); extended here to ANY driver so a hidden generator
 * with its own offset frame reads its curves correctly. Other Movements drivers
 * all have offset==in (Push/Switch/Rotate/Pinwheel/Swing/Reflection/Clothesline
 * verified via .motr grep) so this is a no-op for them.
 */
function driverCurveTime(driver: Layer, timeSec: number): number {
  if (!driver.timing) return timeSec;
  const off = driver.timing.offset && driver.timing.offset.timescale > 0
    ? driver.timing.offset.value / driver.timing.offset.timescale : 0;
  const inn = driver.timing.in && driver.timing.in.timescale > 0
    ? driver.timing.in.value / driver.timing.in.timescale : 0;
  if (Math.abs(off - inn) < 1e-3) return timeSec;
  return timeSec - off;
}

/** Read a driver layer's animated channel (X/Y/Z) from the given transform
 *  property (position/rotation/scale) at a given time. */
function driverChannelValue(driver: Layer, channel: 'X' | 'Y' | 'Z', timeSec: number, prop: 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor' = 'position'): number {
  const t = driver.transform;
  const localTime = driverCurveTime(driver, timeSec);
  let c: Curve | number | undefined;
  if (prop === 'opacity') {
    // Opacity is a scalar (channel-independent). Motion stores 0-1; some legacy
    // files use 0-100. Default 1 (fully opaque) when unset.
    let v = resolveValue(t.opacity, localTime, 1);
    if (v > 1) v /= 100;
    return v;
  }
  if (prop === 'rotation') {
    c = channel === 'X' ? t.rotationX : channel === 'Y' ? t.rotationY : t.rotationZ;
    return resolveValue(c, localTime, 0);
  }
  if (prop === 'scale') {
    c = channel === 'X' ? t.scaleX : channel === 'Y' ? t.scaleY : t.scaleZ;
    return resolveValue(c, localTime, 1);
  }
  if (prop === 'anchor') {
    c = channel === 'X' ? t.anchorX : channel === 'Y' ? t.anchorY : t.anchorZ;
    return resolveValue(c, localTime, 0);
  }
  c = channel === 'X' ? t.positionX : channel === 'Y' ? t.positionY : t.positionZ;
  return resolveValue(c, localTime, 0);
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
  linksByTarget?: Map<number, LinkBehavior[]>,
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
  // Same offset shift as driverChannelValue: rigged reads must sample at the
  // driver's local time so an offset-shifted driver (Color_Planes' Color Solid)
  // yields curve values consistent with its base channel read.
  const localTime = driverCurveTime(driver, timeSec);
  const readRigged = (p: typeof prop, ch: typeof channel): number => {
    if (p === 'opacity') { const vv = resolveValue(rigged.opacity, localTime, 1); return vv > 1 ? vv / 100 : vv; }
    if (p === 'rotation') return resolveValue(ch === 'X' ? rigged.rotationX : ch === 'Y' ? rigged.rotationY : rigged.rotationZ, localTime, 0);
    if (p === 'scale') return resolveValue(ch === 'X' ? rigged.scaleX : ch === 'Y' ? rigged.scaleY : rigged.scaleZ, localTime, 1);
    if (p === 'anchor') return resolveValue(ch === 'X' ? rigged.anchorX : ch === 'Y' ? rigged.anchorY : rigged.anchorZ, localTime, 0);
    return resolveValue(ch === 'X' ? rigged.positionX : ch === 'Y' ? rigged.positionY : rigged.positionZ, localTime, 0);
  };
  let value = readRigged(prop, channel);
  for (const sl of selfLinks) {
    // Colour-channel Links are handled by evaluator/color-links.ts (they don't
    // drive transform channels), so skip them here.
    if (sl.targetProp === 'color' || sl.sourceProp === 'color') continue;
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
        if (cl.targetProp === 'color' || cl.sourceProp === 'color') continue;
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
export function applyLinks(
  layer: Layer,
  transform: Transform,
  linksByTarget: Map<number, LinkBehavior[]>,
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
    // Colour-channel Links are evaluated in a separate pass (evaluator/color-
    // links.ts). Skip them here so they never reach the transform-channel branches
    // below (which would corrupt a random transform channel with an RGB value).
    if (link.targetProp === 'color') continue;
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

    // sourceProp cannot be 'color' here — the guard above already `continue`d on
     // colour Links. TS can't narrow through the object property, so we assert.
    const srcProp = link.sourceProp as 'position' | 'rotation' | 'scale' | 'opacity' | 'anchor';
    let v = resolveDriverChannel(driver, link.sourceChannel, timeSec, srcProp, behaviors, widgetValues, layerById, linksByTarget);
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
      // Mark the anchor channel as a Link override so buildTransformMatrix uses the
      // FULL linked anchor (bypass) instead of ramping it from 0 by the Retime
      // static-position heuristic. Movements/Switch: Transition A links BOTH its
      // position (→2388, bypassed) AND its anchor (→2388, from the driver's
      // anchor←position self-link) off the shared far-right pivot. When A also
      // carries a Retime curve (frames 1→53), the anchor was being ramped
      // anchor=2388·retimeProgress while position stayed 2388 — the mismatch left a
      // 1651→2189px lever arm that shoved A entirely off the right edge by frame 2
      // (GT f02 still shows A full-frame). Bypassing the anchor's retime ramp makes
      // position and anchor track together so they cancel at every frame, leaving
      // only the intended pivot rotation. Key ('ancX'/'ancY'/'ancZ') read below.
      const ovKey = link.targetChannel === 'X' ? 'ancX' : link.targetChannel === 'Y' ? 'ancY' : 'ancZ';
      overrides.add(ovKey);
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
export function applyRigBehaviors(
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
