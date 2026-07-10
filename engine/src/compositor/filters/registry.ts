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
  /** Resolve a blur-intensity param honoring overrides, with the "keyframed curve
   * whose static value=0 means authored-inactive -> 0" rule (legacy resolveBlurAmount). */
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
  const param = (name: string, fallback: number): number => {
    if (overrides && overrides.has(name)) return overrides.get(name)!;
    for (const p of filter.parameters) {
      if (p.name === name) {
        if (p.curve) return evaluateCurve(p.curve, time);
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
        if (p.curve) return evaluateCurve(p.curve, time);
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  const hasRaw = (name: string): boolean =>
    filter.parameters.some(p => p.name === name && (p.curve || typeof p.value === 'number'));
  // Resolve a blur-intensity param (Amount/Distance/Angle), honoring rig overrides.
  // Extra rule (matches the legacy resolveBlurAmount): a keyframed curve whose static
  // `value` attribute is 0 means the filter is authored-INACTIVE -> 0 (no blur), even
  // though its keyframes may ramp to a large value.
  const blurAmount = (name: string, fallback: number): number => {
    if (overrides && overrides.has(name)) return overrides.get(name)!;
    for (const p of filter.parameters) {
      if (p.name === name) {
        if (p.curve) {
          if (p.curve.keyframes.length > 0 && p.curve.value === 0) return 0;
          return evaluateCurve(p.curve, time);
        }
        if (typeof p.value === 'number') return p.value;
      }
    }
    return fallback;
  };
  return { filter, time, overrides, width, height, param, has, rawParam, hasRaw, blurAmount };
}
