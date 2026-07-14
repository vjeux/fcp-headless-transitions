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
          // Discrete-index widget. The "Pop-up" menu widget stores a 0-BASED snapshot
          // index directly (its own-name parameter value = the selected snapshot's
          // ordinal): Blurs/Gaussian Pop-up=1 -> snapshot[1] (Gaussian blur ramp,
          // Amount 0->304->0, Mix=1); Blurs/Radial Pop-up=2 -> snapshot[2] (radial blur);
          // Movements/Rotate + Stylized/Slide Pop-up=0 -> snapshot[0].
          // ⚠️ SCAR CORRECTED (2026-07-11, GUI-GT-verified): this previously did
          // `num - 1`, forcing Gaussian to snapshot[0] (Mix=0 = NO blur) and Radial to
          // snapshot[1]. That was based on a mistaken "FCP shows no blur" reading — the
          // GUI GT is in fact HEAVILY blurred (Blurs/Gaussian frame-12 edge-sharpness
          // 0.18 vs the engine's then-2.30). With `num` the engine applies the blur FCP
          // applies (Gaussian sharpness now tracks GT 0.18-0.63) and the gate is
          // neutral-to-positive (Gaussian +0.25, others unchanged, 0 regressions/65).
          if (name === 'Pop-up') {
            value = Math.max(0, num);
          } else {
            // Direction (and other discrete menu) widgets. Two widget FLAVOURS exist:
            //   • factoryID 13 (Push / Reflection / Color_Planes): the popup's stored
            //     numeric (`<parameter name="Direction" id="100" value="N">`) is the
            //     0-based DISPLAY INDEX of the selected menu entry — NOT the entry's
            //     tag. FCP feeds the rig the selected entry's `tag`, then the rig picks
            //     the snapshot whose declared "Value" equals that tag
            //     (getSnapshotIDsForValue type-2, arm64 disasm: exact Value match). See
            //     docs/notes/RIG_DIRECTION_FORENSICS.md.
            //       Push.motr: entries (display order) tags = [0,3,1,2]; stored value=2
            //       → display entry[2] "Top to Bottom" → tag 1 → snapshot Value==1 →
            //       ordinal 1. The engine previously matched the stored value (2)
            //       directly against snapshot Values → ordinal 2 (the WRONG "Bottom to
            //       Top" snapshot), pushing source A DOWN instead of UP (headless/GUI
            //       GT: A slides up, B enters from bottom). GUI-GT verified: Push
            //       12.3→17.4 dB. Reflection/Color_Planes have natural-order tags
            //       [0,1,…] so the remap is an identity no-op for them.
            //   • factoryID 12 (Switch / Scale / Flip): the stored numeric is ALREADY
            //     the tag (Switch tags=[1,2], value=1 = "From Left" = the first
            //     snapshot). Remapping it through the menu as a display index would
            //     wrongly select the second entry (measured: Switch 11.7→10.1). So the
            //     display-index→tag remap is scoped to factoryID 13 ONLY; factoryID 12
            //     keeps matching the stored value against snapshot "Value" directly.
            const eff = fid === 13
              ? (resolveMenuEntryTag(sn, name, num) ?? num)
              : num;
            const ord = resolveDiscreteWidgetOrdinal(sn, eff);
            value = ord !== undefined ? ord : eff;
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
 * A discrete menu popup widget stores its selection as the chosen entry's DISPLAY
 * INDEX (0-based position in the `<entry name=… tag=…/>` list). FCP feeds the rig
 * the selected entry's TAG. Return that tag for a given stored display index, or
 * undefined when the widget has no such menu popup (caller falls back to the raw
 * value). The popup is the direct-descendant `<parameter>` carrying `<entry>`
 * children — usually the one whose name matches the widget (e.g. "Direction"), but
 * we accept any `<parameter>` with entries so an off-name popup still resolves.
 *
 * For menus whose tags already equal display order (tags==[0,1,2,…]) this returns
 * `num` unchanged (identity), so it only alters selection for the reordered menus
 * (Movements/Push tags=[0,3,1,2], Movements/Switch tags=[1,2]).
 */
function resolveMenuEntryTag(sn: Element, widgetName: string, num: number): number | undefined {
  const params = Array.from(sn.getElementsByTagName('parameter'));
  // Prefer the popup parameter named like the widget; else the first with entries.
  let named: Element | undefined;
  let anyWithEntries: Element | undefined;
  for (const p of params) {
    const entries = directChildren(p, 'entry');
    if (entries.length === 0) continue;
    if (!anyWithEntries) anyWithEntries = p;
    if (p.getAttribute('name') === widgetName) { named = p; break; }
  }
  const popup = named ?? anyWithEntries;
  if (!popup) return undefined;
  const entries = directChildren(popup, 'entry');
  const idx = Math.round(num);
  if (idx < 0 || idx >= entries.length) return undefined;
  const tag = entries[idx].getAttribute('tag');
  if (tag === null) return undefined;
  const t = parseInt(tag, 10);
  return Number.isNaN(t) ? undefined : t;
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
