/**
 * Parser — replicator + sequence-replicator parsing.
 *
 * Parses a Replicator scenenode (grid arrangement, rows/columns, sizing, cell source)
 * and its Sequence Replicator behavior (staggered per-instance opacity/scale/rotation
 * ramps). Split out of parser/index.ts (ROADMAP item 7).
 */
import type { Replicator, SequenceReplicator, Parameter } from '../types.js';
import { directChildren, firstChild, getTextContent, parseParameter } from './xml.js';

/**
 * Parse replicator configuration from a Replicator scenenode.
 * Extracts grid arrangement, rows/columns, and sizing.
 */



export function parseReplicator(params: Parameter[], el?: Element, factories?: Map<number, string>): Replicator | undefined {
  function findVal(ps: Parameter[], name: string): number | undefined {
    for (const p of ps) {
      if (p.name === name && typeof p.value === 'number') return p.value;
      if (p.children) {
        const found = findVal(p.children, name);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  }

  const arrangement = findVal(params, 'Arrangement') ?? 0;
  const columns = findVal(params, 'Columns') ?? 1;
  const rows = findVal(params, 'Rows') ?? 1;
  // Grid extent lives in the "Size id=347" sub-group (Width/Height children),
  // NOT the top-level "Width id=354" (which is a per-cell stroke width and is
  // often 1). Prefer Size's Width/Height; fall back to any Width/Height.
  function findSizeGroup(ps: Parameter[]): Parameter | undefined {
    for (const p of ps) {
      if (p.name === 'Size' && p.children && p.children.some(c => c.name === 'Width')) return p;
      if (p.children) { const r = findSizeGroup(p.children); if (r) return r; }
    }
    return undefined;
  }
  const sizeGroup = findSizeGroup(params);
  const sizeWidth = (sizeGroup ? findVal(sizeGroup.children!, 'Width') : undefined) ?? findVal(params, 'Width') ?? 0;
  const sizeHeight = (sizeGroup ? findVal(sizeGroup.children!, 'Height') : undefined) ?? findVal(params, 'Height') ?? 0;
  const origin = findVal(params, 'Origin') ?? 0;

  const sequence = el && factories ? parseSequenceReplicator(el, factories) : undefined;

  // Shape-based arrangement (Motion "Shape Parameters" id=301 on the Replicator
  // node, and per-cell ramps on the Cell node). These replicators (e.g. Vertigo)
  // do NOT author the legacy "Arrangement" param; instead they lay instances out
  // on a Circle/Spiral shape and ramp each cell's Scale/Angle across the pattern.
  // Read them by their Motion param IDs (generic — no transition name).
  function findById(ps: Parameter[], name: string, id: number): number | undefined {
    for (const p of ps) {
      if (p.name === name && p.id === id && typeof p.value === 'number') return p.value;
      if (p.children) { const r = findById(p.children, name, id); if (r !== undefined) return r; }
    }
    return undefined;
  }
  const shapeVal = findById(params, 'Shape', 302);
  const points = findById(params, 'Points', 304);
  const radius = findById(params, 'Radius', 307);
  const twists = findById(params, 'Twists', 341);

  // Per-cell ramps live on the Replicator Cell scenenode (factoryID 19), a direct
  // child of the Replicator element. Read Scale (id116)/Scale End (id133) and
  // Angle End (id147→3) + Align Angle (id132).
  let scaleStart: number | undefined, cellScaleEnd: number | undefined, angleEnd: number | undefined;
  if (el) {
    const cellEl = directChildren(el, 'scenenode').find(c => {
      const fid = parseInt(c.getAttribute('factoryID') || '0', 10);
      return fid === 19;
    });
    if (cellEl) {
      const cellParams: Parameter[] = [];
      for (const p of directChildren(cellEl, 'parameter')) cellParams.push(parseParameter(p));
      const scaleGroup = (function find(ps: Parameter[]): Parameter | undefined {
        for (const p of ps) { if (p.name === 'Scale' && p.id === 116) return p; if (p.children) { const r = find(p.children); if (r) return r; } }
        return undefined;
      })(cellParams);
      scaleStart = scaleGroup?.children ? findVal(scaleGroup.children, 'X') : undefined;
      const seg = (function find(ps: Parameter[]): Parameter | undefined {
        for (const p of ps) { if (p.name === 'Scale End' && p.id === 133) return p; if (p.children) { const r = find(p.children); if (r) return r; } }
        return undefined;
      })(cellParams);
      cellScaleEnd = seg?.children ? findVal(seg.children, 'X') : undefined;
      const aeg = (function find(ps: Parameter[]): Parameter | undefined {
        for (const p of ps) { if (p.name === 'Angle End' && p.id === 147) return p; if (p.children) { const r = find(p.children); if (r) return r; } }
        return undefined;
      })(cellParams);
      angleEnd = aeg?.children ? findVal(aeg.children, 'Angle End') : undefined;
    }
  }

  return {
    arrangement, columns, rows, sizeWidth, sizeHeight, origin, sequence,
    shape: shapeVal, points, radius, twists,
    scaleStart, cellScaleEnd, angleEnd,
  };
}

/**
 * Parse the Sequence Replicator behavior attached to a Replicator scenenode.
 *
 * The behavior (factory description "Sequence Replicator") carries a "Sequence
 * Control" parameter group (Sequencing/End/Spread/Map Animation/Use Quadratic
 * Ease) plus per-instance animated curves (Opacity/Scale/Rotation). We read the
 * control values by param NAME and the curve ENDPOINTS (last keypoint value) for
 * Opacity(202), Scale(203) X, and Rotation(206) Z. Resolving by name/id (never
 * by English transition name) keeps this template-agnostic.
 */
function parseSequenceReplicator(el: Element, factories: Map<number, string>): SequenceReplicator | undefined {
  let seqBehavior: Element | undefined;
  // The behavior is a direct <behavior> child of the Replicator scenenode.
  const behaviors = el.getElementsByTagName('behavior');
  for (let i = 0; i < behaviors.length; i++) {
    const b = behaviors[i];
    const fid = parseInt(b.getAttribute('factoryID') || '0', 10);
    if (factories.get(fid) === 'Sequence Replicator') { seqBehavior = b; break; }
  }
  if (!seqBehavior) return undefined;

  // Read a numeric param by name within a group (searches nested params).
  const findParam = (root: Element, name: string): Element | undefined => {
    const ps = root.getElementsByTagName('parameter');
    for (let i = 0; i < ps.length; i++) {
      if (ps[i].getAttribute('name') === name) return ps[i];
    }
    return undefined;
  };
  const numVal = (name: string, dflt: number): number => {
    const p = findParam(seqBehavior!, name);
    if (!p) return dflt;
    const v = p.getAttribute('value');
    const n = v !== null ? parseFloat(v) : NaN;
    return isNaN(n) ? dflt : n;
  };

  // Sequence Control group values.
  const sequencing = numVal('Sequencing', 0);
  const end = numVal('End', 0.1);
  const spread = numVal('Spread', 1);
  const mapAnimation = numVal('Map Animation', 1);
  const quadraticEase = numVal('Use Quadratic Ease', 1);

  // Per-instance animated curve endpoints: the LAST keypoint value of each curve.
  // Opacity(id 202), Scale(id 203)/X(id 1), Rotation(id 206)/Z(id 3).
  const lastKeypointValue = (paramName: string, subName?: string): number | undefined => {
    // Find the named parameter that owns a <curve>.
    const ps = seqBehavior!.getElementsByTagName('parameter');
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (p.getAttribute('name') !== paramName) continue;
      let curveHost: Element | undefined = p;
      if (subName) {
        // descend into the sub-axis (e.g. Scale → X)
        const subs = p.getElementsByTagName('parameter');
        curveHost = undefined;
        for (let j = 0; j < subs.length; j++) {
          if (subs[j].getAttribute('name') === subName) { curveHost = subs[j]; break; }
        }
        if (!curveHost) continue;
      }
      const curve = firstChild(curveHost, 'curve');
      if (!curve) continue;
      const kps = curve.getElementsByTagName('keypoint');
      if (kps.length === 0) continue;
      const last = kps[kps.length - 1];
      const raw = getTextContent(last, 'value');
      const n = raw !== null ? parseFloat(raw) : NaN;
      if (!isNaN(n)) return n;
    }
    return undefined;
  };

  const opacityEnd = lastKeypointValue('Opacity');
  const scaleEnd = lastKeypointValue('Scale', 'X');
  const rotationEnd = lastKeypointValue('Rotation', 'Z');

  return { sequencing, end, spread, mapAnimation, quadraticEase, opacityEnd, scaleEnd, rotationEnd };
}
