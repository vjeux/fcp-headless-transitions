/**
 * Filter registry — keyed by FxPlug plugin UUID (the stable identifier; see
 * docs/CATALOG.md §4). Each filter lives in its own module and registers itself,
 * so new filters can be added WITHOUT editing any shared dispatch code (this is
 * what lets multiple agents add filters in parallel without merge conflicts).
 *
 * A filter module calls `registerFilter({ uuid, names?, apply })`. The compositor
 * looks up by `filter.pluginUUID` first, then falls back to a name substring match
 * (for robustness / OSC variants). `apply(input, ctx) => ImageData`.
 */
import type { Filter } from '../../types.js';
import { evaluateCurve } from '../../evaluator/curves.js';

/** Everything a filter needs to read its params and render. */
export interface FilterContext {
  filter: Filter;
  time: number;
  /** Rig-resolved overrides for this filter's params (may be undefined). */
  overrides?: Map<string, number>;
  width: number;
  height: number;
  /** Resolve a numeric param by name, honoring rig overrides then curve/value. */
  param(name: string, fallback: number): number;
  /** True if a param is explicitly present (curve or value). */
  has(name: string): boolean;
  /** Resolve a param IGNORING rig overrides (filter's own curve/value only).
   * For faithful migration of legacy dispatch that read params directly. */
  rawParam(name: string, fallback: number): number;
  /** True if a param is present as the filter's own curve/value (ignores overrides). */
  hasRaw(name: string): boolean;
  /** Resolve a blur-intensity param honoring overrides. A curve is evaluated at the
   * current time; it's treated as inactive (->0) only when it does NOT animate AND its
   * static value is 0 (an animated 0->N->0 ramp is a real blur). */
  blurAmount(name: string, fallback: number): number;
}

export interface FilterModule {
  /** FxPlug plugin UUID this filter handles (uppercase). */
  uuid: string;
  /** Optional lowercased plugin-name substrings to also match (fallback). */
  names?: string[];
  /** Human label for logs/catalog. */
  label?: string;
  apply(input: ImageData, ctx: FilterContext): ImageData;
}

const byUuid = new Map<string, FilterModule>();
const byName: FilterModule[] = [];

export function registerFilter(mod: FilterModule): void {
  byUuid.set(mod.uuid.toUpperCase(), mod);
  if (mod.names) byName.push(mod);
}

export function lookupFilter(filter: Filter): FilterModule | undefined {
  const u = (filter.pluginUUID || '').toUpperCase();
  if (u && byUuid.has(u)) return byUuid.get(u);
  const n = (filter.pluginName || '').toLowerCase();
  for (const m of byName) {
    if (m.names!.some(s => n.includes(s))) return m;
  }
  return undefined;
}

/** Build the FilterContext for a given filter invocation. */
export function makeContext(filter: Filter, time: number, width: number, height: number, overrides?: Map<string, number>): FilterContext {
  // A filter's parameter curves are authored on the effect's OWN (filter-local)
  // timeline; Motion places local zero at the filter's `timing offset` on the scene
  // timeline (scene = local + offset). So a curve is sampled at (sceneTime − offset).
  // Lights/Bloom's Bloom filters carry offset≈−0.77s that re-anchors their Threshold
  // ramps into scene time; without it the curve (keyed at local 0.36–1.27s) reads the
  // wrong value at the scene time passed in. Static `value` params are unaffected.
  const curveTime = time - (filter.timingOffsetSec ?? 0);
  const param = (name: string, fallback: number): number => {
    if (overrides && overrides.has(name)) return overrides.get(name)!;
    for (const p of filter.parameters) {
      if (p.name === name) {
        if (p.curve) return evaluateCurve(p.curve, curveTime);
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  const has = (name: string): boolean => {
    if (overrides && overrides.has(name)) return true;
    return filter.parameters.some(p => p.name === name && (p.curve || typeof p.value === 'number'));
  };
  // Raw param read that IGNORES rig overrides (reads only the filter's own
  // curve/value). Used by filters whose legacy dispatch read params directly and
  // must migrate byte-faithfully; whether such a filter SHOULD honor overrides is
  // a separate behavior question, tracked in ROADMAP, not this mechanical migration.
  const rawParam = (name: string, fallback: number): number => {
    for (const p of filter.parameters) {
      if (p.name === name) {
        if (p.curve) return evaluateCurve(p.curve, curveTime);
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  const hasRaw = (name: string): boolean =>
    filter.parameters.some(p => p.name === name && (p.curve || typeof p.value === 'number'));
  // Resolve a blur-intensity param (Amount/Distance/Angle), honoring rig overrides.
  // A curve is evaluated at the current time. NOTE: Motion stores a channel's static
  // `value` attribute (the value when no keyframes apply) separately from its keyframes;
  // an ANIMATED curve (keyframes that actually vary) is a real blur ramp regardless of
  // that static attribute. We only treat a curve as inactive when it does NOT actually
  // animate (see curveAnimates) AND its static value is 0.
  const curveAnimates = (c: NonNullable<import('../../types.js').Parameter['curve']>): boolean => {
    if (!c.keyframes || c.keyframes.length === 0) return false;
    const vs = c.keyframes.map(k => k.value);
    return vs.some(v => v !== vs[0]); // any keyframe differs from the first => animates
  };
  const blurAmount = (name: string, fallback: number): number => {
    if (overrides && overrides.has(name)) return overrides.get(name)!;
    for (const p of filter.parameters) {
      if (p.name === name) {
        if (p.curve) {
          // Inactive only when the curve is FLAT (no real animation) and its static
          // value is 0. An animated 0->300->0 ramp (e.g. Blurs/Directional) is a real
          // blur and must be evaluated — the old rule zeroed it by looking only at the
          // static `value` attribute. GUI-GT-verified: FCP blurs those transitions.
          if (!curveAnimates(p.curve) && p.curve.value === 0) return 0;
          return evaluateCurve(p.curve, curveTime);
        }
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  return { filter, time, overrides, width, height, param, has, rawParam, hasRaw, blurAmount };
}
