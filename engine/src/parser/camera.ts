/**
 * Parser — camera projection + framing behaviors.
 *
 * Extracts the Camera node's Angle Of View (with rig-driven AOV snapshots) and the
 * factory-3 Framing behaviors that drive a look-at camera basis. Split out of
 * parser/index.ts (ROADMAP item 7).
 */
import type { FramingBehavior, Parameter } from '../types.js';
import { directChildren, parseTiming, findDescendant } from './xml.js';

/**
 * Extract the Camera node's projection parameters. Motion's Camera stores
 * "Angle Of View" (param id 201) in degrees inside its Object param (id 2).
 * The vertical field of view feeds gluPerspective (verified by decompiling
 * Lithium's PCMatrix44Tmpl<double>::setGLPerspective — fovy in degrees).
 *
 * Some transitions rig-drive the AOV via a "Rig Behavior" whose Snapshots hold
 * per-widget AOV values (channelBehavior affectingChannel=".../201"). We capture
 * both the static default and the snapshot list so the evaluator can resolve the
 * active value from the selected widget index.
 */
export function parseCameraParams(
  el: Element,
  params: Parameter[],
  factories: Map<number, string>
): { angleOfView: number; aovSnapshots?: number[]; aovWidgetId?: number; aovDefault?: number; framing?: FramingBehavior[] } {
  // Find "Angle Of View" (id 201) in the param tree.
  let aov = 45; // Motion default
  const findAOV = (ps: Parameter[]): number | undefined => {
    for (const p of ps) {
      if (p.name === 'Angle Of View' && p.id === 201) {
        if (typeof p.value === 'number') return p.value;
        if (p.curve && typeof p.curve.value === 'number') return p.curve.value;
      }
      if (p.children) { const r = findAOV(p.children); if (r !== undefined) return r; }
    }
    return undefined;
  };
  const found = findAOV(params);
  if (found !== undefined) aov = found;

  // Look for a Rig Behavior on the camera driving the AOV via snapshots.
  let aovSnapshots: number[] | undefined;
  let aovWidgetId: number | undefined;
  for (const behEl of directChildren(el, 'behavior')) {
    const cb = findDescendant(behEl, 'channelBehavior');
    const ch = cb?.getAttribute('affectingChannel') || '';
    if (!ch.endsWith('/201')) continue; // this rig drives the AOV channel
    // Widget the behavior reads from (param id 200 "Widget")
    for (const p of Array.from(behEl.getElementsByTagName('parameter'))) {
      if (p.getAttribute('name') === 'Widget' && p.getAttribute('id') === '200') {
        const v = p.getAttribute('value'); if (v) aovWidgetId = parseFloat(v);
      }
    }
    // Snapshots: each holds an "Angle Of View" curve/value.
    const snaps: Array<{ idx: number; val: number }> = [];
    const snapContainer = Array.from(behEl.getElementsByTagName('parameter'))
      .find(p => p.getAttribute('name') === 'Snapshots' && p.getAttribute('id') === '202');
    if (snapContainer) {
      for (const sp of directChildren(snapContainer, 'parameter')) {
        if (sp.getAttribute('name') !== 'Angle Of View') continue;
        const idx = parseInt(sp.getAttribute('id') || '0', 10);
        const curve = findDescendant(sp, 'curve');
        const val = curve ? parseFloat(curve.getAttribute('value') || 'NaN') : NaN;
        if (!isNaN(val)) snaps.push({ idx, val });
      }
    }
    if (snaps.length > 0) {
      // Snapshot ids are 1-based; order them by id so index N-1 → snapshot N.
      snaps.sort((a, b) => a.idx - b.idx);
      aovSnapshots = snaps.map(s => s.val);
    }
  }

  return { angleOfView: aov, aovSnapshots, aovWidgetId, aovDefault: aov, framing: parseFramingBehaviors(el, factories) };
}

/**
 * Parse Framing behaviors (factory 3, "Framing") attached to the Camera node.
 * Each drives the camera to frame its Target object's world bbox over its
 * timing window. Values are read from the behavior's direct parameters (ids
 * 200/204/206/207/209/210/211/213). See OZScene::computeFraming and framing.ts.
 */
function parseFramingBehaviors(el: Element, factories: Map<number, string>): FramingBehavior[] | undefined {
  const out: FramingBehavior[] = [];
  for (const b of directChildren(el, 'behavior')) {
    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) !== 'Framing') continue;
    // Direct scalar param by id.
    const num = (id: number, def: number): number => {
      for (const p of directChildren(b, 'parameter')) {
        if (parseInt(p.getAttribute('id') || '-1', 10) === id) {
          const v = p.getAttribute('value');
          if (v !== null) { const n = parseFloat(v); if (!isNaN(n)) return n; }
        }
      }
      return def;
    };
    // Vector param (X/Y/Z children of a container param id).
    const vec = (id: number): { x: number; y: number; z: number } => {
      const r = { x: 0, y: 0, z: 0 };
      for (const p of directChildren(b, 'parameter')) {
        if (parseInt(p.getAttribute('id') || '-1', 10) !== id) continue;
        for (const c of directChildren(p, 'parameter')) {
          const cid = parseInt(c.getAttribute('id') || '0', 10);
          const v = c.getAttribute('value'); if (v === null) continue;
          const n = parseFloat(v); if (isNaN(n)) continue;
          if (cid === 1) r.x = n; else if (cid === 2) r.y = n; else if (cid === 3) r.z = n;
        }
      }
      return r;
    };
    out.push({
      targetId: num(200, 0),
      framingOffset: vec(204),
      apex: num(206, 0.5),
      pathOffset: vec(207),
      positionTransitionTime: num(209, 0.5),
      rotationTransitionTime: num(210, 0.5),
      transition: num(211, 0),
      easeOutCurve: num(213, 10),
      timing: parseTiming(b),
    });
  }
  return out.length > 0 ? out : undefined;
}
