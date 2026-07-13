/**
 * Parser — Motion Emitter + Particle Cell parameters (ROADMAP S3 / T-B1).
 *
 * Motion authors particle scenes as an Emitter scenenode (factory description
 * "Emitter"; factoryID NOT stable across .motr files — always resolve by name
 * via the per-file factory table) that owns one or more nested Particle Cell
 * scenenodes (factory description "Particle Cell"). The Emitter carries the
 * spawn region + emission direction; each Cell carries the per-particle physics
 * (birth rate, life, initial velocity/spin, gravity) and a "Particle Source"
 * object id naming the sprite the cell draws at each particle position.
 *
 * ROADMAP T-B1 is PARSE-ONLY: this module lifts the raw Object/id=2 sub-tree
 * into typed EmitterParams / ParticleCellParams / GravityBehavior objects. It
 * runs no simulation and touches no renderer — T-B2 will consume the schema.
 *
 * Field ids reverse-engineered by XML-dumping Movements/Drop_In (Emitter fid 19,
 * Cell fid 14), Movements/Earthquake (Emitter fid 19, Cell fid 14, plus an
 * animated Gravity/Acceleration curve on the cell), and Stylized/Diagonal
 * (Emitter fid 23, Cell fid 15, "hexagon"). All three share the SAME id numbering
 * under Object, confirming these are plugin-schema constants, not per-file assigns.
 *
 * See:
 *   docs of EmitterParams / ParticleCellParams / GravityBehavior in `types.ts` for
 *   the id → field mapping and per-slug value examples.
 */
import type {
  EmitterParams, ParticleCellParams, GravityBehavior, Curve,
} from '../types.js';
import { directChildren, firstChild, parseCurve, parseTiming } from './xml.js';

/**
 * Read a scalar sub-parameter (name+id) directly nested under `parent`. Returns
 * `defaultValue` when the child is absent or unparseable. Motion authors nested
 * scalars (e.g. Color.Red id=1, Color.Green id=2) as `<parameter value=".." default=".."/>`
 * one level under the parent; this walks direct children only, ignoring deeper
 * gradient / curve stops that share the same ids at other depths.
 */
function readSubStatic(parent: Element, id: number, defaultValue: number): number {
  for (const p of directChildren(parent, 'parameter')) {
    if (parseInt(p.getAttribute('id') || '0', 10) !== id) continue;
    const v = p.getAttribute('value') ?? p.getAttribute('default');
    if (v === null) return defaultValue;
    const n = parseFloat(v);
    return isFinite(n) ? n : defaultValue;
  }
  return defaultValue;
}

/**
 * Read a leaf-level numeric parameter (a `<parameter>` whose value/default is a
 * plain number, or which wraps a single `<curve>`), given its child-id under a
 * parent element. Returns either a static number or a Curve; falls back to
 * `defaultValue` when the id is not present or unparseable.
 *
 * The `default` XML attribute is preferred when the `value` attribute is missing
 * — that mirrors Motion's own convention (a param with only `default="30"` on
 * disk means "the current value IS 30", not "no value").
 */
function readNumericParam(
  parent: Element,
  id: number,
  defaultValue: number,
): number | Curve {
  const p = findParameterById(parent, id);
  if (!p) return defaultValue;
  const curveEl = firstChild(p, 'curve');
  if (curveEl) return parseCurve(curveEl);
  const v = p.getAttribute('value');
  const d = p.getAttribute('default');
  const s = v !== null ? v : d;
  if (s === null) return defaultValue;
  const n = parseFloat(s);
  return isFinite(n) ? n : defaultValue;
}

/**
 * Coerce a numeric-or-curve param to a plain number (reading `curve.value ??
 * curve.default` when a curve is present). Used for scalar "randomness" leaves
 * that even Motion authors as static numbers in every built-in.
 */
function readStaticNumber(
  parent: Element,
  id: number,
  defaultValue: number,
): number {
  const v = readNumericParam(parent, id, defaultValue);
  if (typeof v === 'number') return v;
  return v.value ?? v.default ?? defaultValue;
}

function readBoolParam(parent: Element, id: number, defaultValue: boolean): boolean {
  const n = readStaticNumber(parent, id, defaultValue ? 1 : 0);
  return n !== 0;
}

/**
 * Direct-child `<parameter>` search by numeric id. Bypasses parseParameter (which
 * builds a full Parameter tree with all children) — the emitter parser only
 * needs to read a handful of known leaf ids, so a targeted scan is both cheaper
 * and easier to reason about than "parseParameter then walk the tree".
 */
function findParameterById(parent: Element, id: number): Element | null {
  for (const p of directChildren(parent, 'parameter')) {
    if (parseInt(p.getAttribute('id') || '0', 10) === id) return p;
  }
  return null;
}

/** Get the nested `<parameter name="Object" id="2">` folder of a scenenode. */
function getObjectFolder(el: Element): Element | null {
  return findParameterById(el, 2);
}

/**
 * Parse EmitterParams from an Emitter scenenode. Caller must confirm the node is
 * indeed an Emitter (factory description === "Emitter") before invoking —
 * factoryID is per-file and this function does not re-verify.
 */
export function parseEmitterParams(el: Element): EmitterParams {
  const id = parseInt(el.getAttribute('id') || '0', 10);
  const name = el.getAttribute('name') || undefined;
  const obj = getObjectFolder(el);
  // Emitter's Shape Parameters folder (Object/id=301) is where the spawn-region
  // radius lives (id=307, circle/spiral/burst arrangements). Absent for point/
  // line arrangements — leave undefined then.
  const shapeFolder = obj ? findParameterById(obj, 301) : null;
  let radius: number | undefined;
  if (shapeFolder) {
    const rParam = findParameterById(shapeFolder, 307);
    if (rParam) {
      const v = rParam.getAttribute('value') ?? rParam.getAttribute('default');
      if (v !== null) { const n = parseFloat(v); if (isFinite(n)) radius = n; }
    }
  }
  // Fall back to sensible defaults when Object/id=2 is entirely absent (should
  // never happen for a real Emitter, but keep the return-type total).
  if (!obj) {
    return {
      id, name,
      emissionAngle: 0, emissionLongitude: 3 * Math.PI / 2,
      emissionRange: 2 * Math.PI, emitAtPoints: false,
      emitterSeed: 0, is3D: false, faceCamera: true, radius,
    };
  }
  return {
    id, name,
    emissionAngle: readStaticNumber(obj, 310, 0),
    emissionLongitude: readStaticNumber(obj, 358, 3 * Math.PI / 2),
    emissionRange: readStaticNumber(obj, 311, 2 * Math.PI),
    emitAtPoints: readBoolParam(obj, 303, false),
    emitterSeed: readStaticNumber(obj, 349, 0),
    is3D: readBoolParam(obj, 356, false),
    faceCamera: readBoolParam(obj, 357, true),
    radius,
  };
}

/**
 * Parse a Gravity behavior on a Particle Cell. Returns undefined when the cell
 * has no Gravity child. The behavior's factory description is expected to be
 * "Gravity" — the caller resolves it via the factory table.
 */
function parseGravityBehavior(
  cellEl: Element,
  factories: Map<number, string>,
): GravityBehavior | undefined {
  for (const b of directChildren(cellEl, 'behavior')) {
    const bfid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(bfid) !== 'Gravity') continue;
    // Motion default acceleration is 30 (visible in every built-in's <curve
    // default="30">). The Acceleration param (id 401) may be a static number,
    // a curve, or entirely absent (Drop_In's cells only carry Affect Subobjects
    // and rely on the curve's own default).
    const acceleration = readNumericParam(b, 401, 30);
    const affectSubobjects = readBoolParam(b, 300, false);
    return { acceleration, affectSubobjects, timing: parseTiming(b) };
  }
  return undefined;
}

/**
 * Parse ParticleCellParams from a Particle Cell scenenode. `emitterId` is the
 * id of the enclosing Emitter (caller-supplied — the Cell has no back-reference
 * of its own). `factories` is the per-file factory table (used to resolve the
 * Gravity behavior's factory name).
 */
export function parseParticleCellParams(
  el: Element,
  factories: Map<number, string>,
  emitterId?: number,
): ParticleCellParams {
  const id = parseInt(el.getAttribute('id') || '0', 10);
  const name = el.getAttribute('name') || undefined;
  const obj = getObjectFolder(el);
  // Particle Source (id 128) can be zero for a built-in point-sprite cell; treat
  // 0 as "no object source" and leave the field undefined.
  let particleSourceId: number | undefined;
  if (obj) {
    const psParam = findParameterById(obj, 128);
    if (psParam) {
      const v = psParam.getAttribute('value') ?? psParam.getAttribute('default');
      if (v !== null) {
        const n = parseInt(v, 10);
        if (n !== 0 && isFinite(n)) particleSourceId = n;
      }
    }
  }
  const gravity = parseGravityBehavior(el, factories);
  const timing = parseTiming(el);
  if (!obj) {
    return {
      id, name, emitterId,
      birthRate: 30, birthRateRandomness: 0,
      initialNumber: 0,
      life: 5, lifeRandomness: 0,
      speed: 100, speedRandomness: 0,
      spin: 0, spinRandomness: 0,
      particleSourceId, randomSeed: 0,
      gravity, timing,
    };
  }
  // Appearance (T-B3): per-cell base Color (id=130 R/G/B/Opacity), Color Mode
  // (id=129), and Scale (id=116 X/Y). Values are in Motion 0..1 physical
  // colour space; consumers should scale by 255 when compositing to 8-bit
  // RGBA. Verified by XML dump on Stylized/Diagonal cells (hexagon Color Mode=3
  // grey (0.483,0.482,0.484); Hexagon 1 Color Mode=1 near-white (0.999,0.960,
  // 0.956); Ring cells Color Mode=1 (0.41,0.76,0.36) etc; Scale ranges 0.05 → 1.0).
  const colorFolder = findParameterById(obj, 130);
  let color: { r: number; g: number; b: number; a: number } | undefined;
  if (colorFolder) {
    color = {
      r: readSubStatic(colorFolder, 1, 1),
      g: readSubStatic(colorFolder, 2, 1),
      b: readSubStatic(colorFolder, 3, 1),
      // Motion's Color/Opacity sub-parameter (id=4, "Opacity") is the physical
      // colour's alpha; default 1. Absent on many cells, in which case the
      // per-particle sim falls back to the cell's opacity envelope alone.
      a: readSubStatic(colorFolder, 4, 1),
    };
  }
  const colorMode = readStaticNumber(obj, 129, 0);
  // Cell Scale (id=116) is a Motion size-vector: X (id=1), Y (id=2). Rare
  // cells author non-uniform X/Y (Diagonal Bar has 0.05/0.05, Ring cells 1.0/1.0)
  // — the sim treats the average as a per-cell radius multiplier so a
  // 0.05-scale Bar produces near-invisible dots while a 1.0-scale Ring
  // gets a full radius.
  const scaleFolder = findParameterById(obj, 116);
  let cellScale: { x: number; y: number } | undefined;
  if (scaleFolder) {
    cellScale = {
      x: readSubStatic(scaleFolder, 1, 1),
      y: readSubStatic(scaleFolder, 2, 1),
    };
  }
  return {
    id, name, emitterId,
    birthRate: readNumericParam(obj, 101, 30),
    birthRateRandomness: readStaticNumber(obj, 102, 0),
    initialNumber: readNumericParam(obj, 103, 0),
    life: readNumericParam(obj, 104, 5),
    lifeRandomness: readStaticNumber(obj, 105, 0),
    speed: readNumericParam(obj, 106, 100),
    speedRandomness: readStaticNumber(obj, 107, 0),
    spin: readNumericParam(obj, 110, 0),
    spinRandomness: readStaticNumber(obj, 111, 0),
    particleSourceId,
    randomSeed: readStaticNumber(obj, 131, 0),
    gravity,
    timing,
    color,
    colorMode,
    cellScale,
  };
}
