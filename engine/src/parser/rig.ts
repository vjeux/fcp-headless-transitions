/**
 * Parser — rig widgets + rig/scene behaviors.
 *
 * The rig system: popup/checkbox/slider widgets (transition direction & variants) that
 * live under <scenenode name="Rig">, the rig behaviors that map a widget's value onto a
 * target object's parameter, and scene-level behaviors. Split out of parser/index.ts
 * (ROADMAP item 7).
 */
import type { RigWidget, RigBehavior, SceneBehavior, RampTargetChannel, Parameter } from '../types.js';
import { directChildren, firstChild, parseParameter, parseTiming } from './xml.js';

// ============================================================================
// Rig Parsing
// ============================================================================

/**
 * Parse rig widgets (popup menus/checkboxes controlling transition direction/variants).
 * Widgets live inside a <scenenode name="Rig"> and have a current "value".
 */
export function parseRigWidgets(sceneEl: Element, factories: Map<number, string>): RigWidget[] {
  const widgets: RigWidget[] = [];
  for (const sn of Array.from(sceneEl.getElementsByTagName('scenenode'))) {
    const fid = parseInt(sn.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) === 'Widget') {
      const id = parseInt(sn.getAttribute('id') || '0', 10);
      const name = sn.getAttribute('name') || '';
      // The widget's current value is stored in a parameter matching the widget name
      // (e.g., "Direction" widget has a "Direction" parameter with value=2).
      let raw: string | null = null;
      for (const p of Array.from(sn.getElementsByTagName('parameter'))) {
        if (p.getAttribute('name') === name) {
          const v = p.getAttribute('value');
          if (v !== null) { raw = v; break; }
        }
      }
      let value = 0;
      if (raw !== null) {
        const num = parseFloat(raw);
        if (Number.isInteger(num)) {
          // Discrete-index widget. Motion's "Pop-up" menu widget stores a 1-BASED
          // selection (menu item 1 = the first snapshot), whereas the "Direction"
          // widget stores a 0-BASED index. Both share factoryID 13 and identical
          // <snapshot>1..4</snapshot> tags, so we disambiguate by the widget name.
          // Getting this wrong for Blurs/Gaussian & Blurs/Radial (Pop-up value=1)
          // selected snapshot[1] — the blur ramp (Amount 0→100→0, Mix=1) — and
          // over-blurred, when FCP actually shows NO blur (snapshot[0]: Mix=0).
          if (name === 'Pop-up') {
            value = Math.max(0, num - 1);
          } else {
            // Direction (and other discrete menu) widgets: the stored value is the
            // menu TAG, which maps to a snapshot by matching the snapshot's declared
            // "Value". Push's Direction declares snapshot Values [0,1,2,3] (0-based,
            // so value N = index N), but Movements/Switch's Direction declares
            // Values [1,2] with node ids [2,3] (value 1 = "From Left" = the FIRST
            // snapshot = ordinal index 0). Resolving the value to the ORDINAL index
            // of the matching snapshot Value handles both without a snapId-1 offset
            // assumption. Falls back to the raw value when no snapshot list matches.
            const ord = resolveDiscreteWidgetOrdinal(sn, num);
            value = ord !== undefined ? ord : num;
          }
        } else {
          // Continuous-value widget (e.g. an Aspect Ratio pop-up storing 1.7777…).
          // The value is NOT a snapshot index — it matches one of the declared
          // Snapshot entries by its numeric "Value". Rig behaviors index their
          // snapshot arrays by (snapshot id − 1), so resolve to that ordinal.
          value = resolveContinuousWidgetIndex(sn, num);
        }
      }
      widgets.push({ id, name, value, factoryID: fid });
    }
  }
  return widgets;
}

/**
 * A discrete menu Widget (e.g. Direction) stores a menu TAG (integer). Map it to
 * the ORDINAL index (0-based order) of the <Snapshots id=101> child whose declared
 * "Value" equals the tag. Returns undefined when no snapshot list / match exists,
 * so the caller falls back to treating the value as the index directly.
 */
function resolveDiscreteWidgetOrdinal(sn: Element, num: number): number | undefined {
  for (const p of Array.from(sn.getElementsByTagName('parameter'))) {
    if (p.getAttribute('name') !== 'Snapshots' || p.getAttribute('id') !== '101') continue;
    const kids = directChildren(p, 'parameter');
    let ord = 0;
    for (const child of kids) {
      const valEl = directChildren(child, 'parameter').find(x => x.getAttribute('name') === 'Value');
      if (!valEl) continue;
      const v = parseFloat(valEl.getAttribute('value') || 'NaN');
      if (!Number.isNaN(v) && v === num) return ord;
      ord++;
    }
    return undefined; // list present but no exact match
  }
  return undefined;
}

/**
 * A continuous-value Widget (e.g. Aspect Ratio) stores a float like 1.7777. The
 * active snapshot is the declared <Snapshots> entry whose "Value" matches. Rig
 * behaviors driven by this widget index their snapshot arrays by (snapshot id − 1),
 * so return that ordinal (falling back to nearest match, then 0).
 */
function resolveContinuousWidgetIndex(sn: Element, num: number): number {  let bestId = 1;
  let bestDelta = Infinity;
  for (const p of Array.from(sn.getElementsByTagName('parameter'))) {
    if (p.getAttribute('name') !== 'Snapshots' || p.getAttribute('id') !== '101') continue;
    for (const child of directChildren(p, 'parameter')) {
      const snapId = parseInt(child.getAttribute('id') || '0', 10);
      const valEl = directChildren(child, 'parameter').find(x => x.getAttribute('name') === 'Value');
      if (!valEl) continue;
      const v = parseFloat(valEl.getAttribute('value') || 'NaN');
      if (Number.isNaN(v)) continue;
      const delta = Math.abs(v - num);
      if (delta < bestDelta) { bestDelta = delta; bestId = snapId; }
    }
  }
  return bestId - 1;
}


/**
 * Parse rig behaviors. Each maps (affectedObject, widget) → parameter snapshots.
 * The active snapshot is selected by the widget's current value.
 */
export function parseRigBehaviors(sceneEl: Element): RigBehavior[] {
  const behaviors: RigBehavior[] = [];
  for (const b of Array.from(sceneEl.getElementsByTagName('behavior'))) {
    const name = b.getAttribute('name') || '';
    if (!name.startsWith('Rig Behavior')) continue;

    let affectedObjectId = 0;
    let widgetId = 0;
    let snapshotsParam: Element | null = null;

    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name');
      if (pname === 'Affecting Object (Hidden)') {
        affectedObjectId = parseInt(p.getAttribute('value') || '0', 10);
      } else if (pname === 'Widget') {
        widgetId = parseInt(p.getAttribute('value') || '0', 10);
      } else if (pname === 'Snapshots') {
        snapshotsParam = p;
      }
    }

    if (!snapshotsParam) continue;

    // Parse the snapshot parameters (one per widget value)
    const snapshots: Parameter[] = [];
    const snapshotIds: number[] = [];
    let paramType = '';
    for (const snapEl of directChildren(snapshotsParam, 'parameter')) {
      const snap = parseParameter(snapEl);
      if (!paramType) paramType = snap.name;
      snapshots.push(snap);
      snapshotIds.push(parseInt(snapEl.getAttribute('id') || '0', 10));
    }

    behaviors.push({ affectedObjectId, widgetId, paramType, snapshots, snapshotIds });
  }
  return behaviors;
}


/**
 * Resolve a `channelBehavior affectingChannel` path into a transform channel.
 *
 * Channel paths are relative param-ID paths from the affected scenenode, e.g.
 * "./1/100/109/2" = Properties(1) → Transform(100) → Rotation(109) → Y(2).
 * Under Transform(100): Position=101, Scale=105, Rotation=109.
 * Sub-index 1/2/3 = X/Y/Z. Scale may be uniform (no sub-index) → scaleX/Y/Z all.
 * Paths that don't resolve to a transform channel (rig End Values like "./203",
 * plugin params like "./2/353/...") return undefined and are handled elsewhere.
 */
function resolveRampTargetChannel(path: string | undefined): RampTargetChannel | undefined {
  if (!path) return undefined;
  const parts = path.replace(/^\.\//, '').split('/').map(s => s.trim()).filter(Boolean);
  // Expect Properties(1)/Transform(100)/<group>/<axis?>
  if (parts.length < 3) return undefined;
  if (parts[0] !== '1' || parts[1] !== '100') return undefined;
  const group = parts[2];
  const axis = parts[3]; // '1'|'2'|'3' or undefined (uniform)
  const axisSuffix = axis === '1' ? 'X' : axis === '2' ? 'Y' : axis === '3' ? 'Z' : undefined;
  if (group === '109') { // Rotation
    if (axisSuffix) return `rotation${axisSuffix}` as RampTargetChannel;
    return undefined;
  }
  if (group === '101') { // Position
    if (axisSuffix) return `position${axisSuffix}` as RampTargetChannel;
    return undefined;
  }
  if (group === '105') { // Scale (uniform on this node type)
    // Uniform scale: driven onto all axes. Represent as scaleX; evaluator mirrors.
    return 'scaleX';
  }
  return undefined;
}

/**
 * Parse scene-level behaviors that affect objects by ID (Ramp, Oscillate).
 * These are distinct from rig behaviors (which use snapshots) and layer behaviors
 * (like Fade, which attach directly to their parent).
 */
export function parseSceneBehaviors(sceneEl: Element, factories: Map<number, string>): SceneBehavior[] {
  const result: SceneBehavior[] = [];
  for (const b of Array.from(sceneEl.getElementsByTagName('behavior'))) {
    const name = b.getAttribute('name') || '';
    if (name.startsWith('Rig Behavior')) continue;

    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    const ftype = factories.get(fid) || '';
    let type: SceneBehavior['type'] = 'other';
    if (ftype === 'Ramp') type = 'ramp';
    else if (ftype === 'Oscillate') type = 'oscillate';
    else if (ftype === 'Spin') type = 'spin';
    else continue; // only track behaviors that affect objects by ID

    let affectedObjectId = 0;
    const params: Record<string, number> = {};
    for (const p of directChildren(b, 'parameter')) {
      const pname = p.getAttribute('name') || '';
      const pval = p.getAttribute('value');
      if (pname === 'Affecting Object (Hidden)') {
        affectedObjectId = parseInt(pval || '0', 10);
      } else if (pval !== null) {
        const num = parseFloat(pval);
        if (!isNaN(num)) params[pname] = num;
      }
    }
    // The driven channel + active time window come from <channelBehavior> / <timing>.
    const cb = firstChild(b, 'channelBehavior');
    const affectingChannel = cb?.getAttribute('affectingChannel') || undefined;
    const targetChannel = resolveRampTargetChannel(affectingChannel);
    // sliderRange scales the Oscillate amplitude for filter-parameter targets.
    if (cb) {
      const sr = cb.getAttribute('sliderRange');
      if (sr !== null) { const n = parseFloat(sr); if (!isNaN(n)) params['sliderRange'] = n; }
    }
    const t = parseTiming(b);
    // Store raw RationalTime (converted to seconds at use-site via timeToSeconds).
    const timing = t ? { in: t.in, out: t.out, offset: t.offset } : undefined;
    if (affectedObjectId !== 0) {
      result.push({ type, affectedObjectId, params, affectingChannel, targetChannel, timing });
    }
  }
  return result;
}
