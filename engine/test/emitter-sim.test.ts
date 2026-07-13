/**
 * Tests for the MINIMAL Motion Emitter particle sim + render (ROADMAP S3 / T-B2).
 *
 * Verifies the T-B2 sim primitives against the parsed schema from T-B1:
 *   1. Structural probe (hasSimulatableEmitter) — fires on the emitter-dominated
 *      slugs (Diagonal, Glide, Drop_In, Earthquake), NOT on plain drop-zone
 *      transitions (Push).
 *   2. Determinism — two identical composite calls produce byte-identical pixels
 *      (the sim's PRNG is seeded by (emitterSeed, cellSeed, particle-index) — same
 *      inputs must always land at the same dots on the frame).
 *   3. Non-emitter neutrality — a scene with no emitter (Push) is byte-identical
 *      pre- and post-T-B2 (the composite output is untouched).
 *   4. Emitter neutrality when the parent Emitter layer is rig-suppressed
 *      (visible=false) — no dots drawn.
 *
 * Score verification (Diagonal ×2) is done via the fct gate, not this file.
 */
// ImageData is a browser global; polyfill for Node (same shim as _fct_render.ts).
if (typeof (globalThis as any).ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(d: any, w: number, h?: number) {
      this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w);
    }
  };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { composite } from '../src/compositor/index.js';
import { hasSimulatableEmitter, applyEmitterSim } from '../src/compositor/emitter-sim.js';
import { createBuffer } from '../src/compositor/blit.js';
import fs from 'node:fs';

const FCP = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized';
const DIAGONAL = `${FCP}/Stylized.localized/Nature.localized/Diagonal.localized/Diagonal.motr`;
const DROP_IN  = `${FCP}/Movements.localized/Drop In.localized/Drop In.motr`;
const EARTHQ   = `${FCP}/Movements.localized/Earthquake.localized/Earthquake.motr`;
const GLIDE    = `${FCP}/Stylized.localized/Nature.localized/Glide.localized/Glide.motr`;
const PUSH     = `${FCP}/Movements.localized/Push.localized/Push.motr`;

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

/** Solid-color image of the given size (for imageA/imageB inputs). */
function solidImage(w: number, h: number, r: number, g: number, b: number): ImageData {
  const img = createBuffer(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = r; img.data[i+1] = g; img.data[i+2] = b; img.data[i+3] = 255;
  }
  return img;
}

/** Byte-identical image comparison (returns index of first mismatch or -1). */
function firstDiff(a: ImageData, b: ImageData): number {
  if (a.width !== b.width || a.height !== b.height) return 0;
  for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) return i;
  return -1;
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Emitter sim tests:\n');

  // -------- Structural probe fires on the right slugs --------
  const diag = parseMotr(fs.readFileSync(DIAGONAL, 'utf-8'));
  const drop = parseMotr(fs.readFileSync(DROP_IN, 'utf-8'));
  const eq   = parseMotr(fs.readFileSync(EARTHQ, 'utf-8'));
  const glide = parseMotr(fs.readFileSync(GLIDE, 'utf-8'));
  const push  = parseMotr(fs.readFileSync(PUSH, 'utf-8'));

  test('probe: fires on Diagonal', () => assert(hasSimulatableEmitter(diag), 'expected fire'));
  test('probe: fires on Drop_In', () => assert(hasSimulatableEmitter(drop), 'expected fire'));
  test('probe: fires on Earthquake', () => assert(hasSimulatableEmitter(eq), 'expected fire'));
  test('probe: fires on Glide', () => assert(hasSimulatableEmitter(glide), 'expected fire'));
  test('probe: does NOT fire on Push (no emitters)', () => assert(!hasSimulatableEmitter(push), 'unexpected fire'));

  // -------- Determinism: 2 identical composite calls produce identical pixels --------
  test('composite: Diagonal is deterministic across two calls', () => {
    const t = 0.5;
    const evalA = evaluate(diag, t);
    const evalB = evaluate(diag, t);
    const iA = solidImage(evalA.width, evalA.height, 128, 64, 32);
    const iB = solidImage(evalB.width, evalB.height, 32, 64, 128);
    const out1 = composite(evalA, iA, iB, evalA.width, evalA.height);
    const out2 = composite(evalB, iA, iB, evalB.width, evalB.height);
    const d = firstDiff(out1, out2);
    assert(d < 0, `pixel diff at byte ${d}`);
  });

  // -------- Non-emitter neutrality: Push output is EXACTLY the same with or without
  //          the sim call (nothing to sim → no pixels touched). --------
  test('composite: Push output identical before/after applyEmitterSim', () => {
    const evalP = evaluate(push, 0.5);
    const iA = solidImage(evalP.width, evalP.height, 200, 100, 50);
    const iB = solidImage(evalP.width, evalP.height, 50, 100, 200);
    const before = composite(evalP, iA, iB, evalP.width, evalP.height);
    // Copy pixels, then apply the sim explicitly and diff. hasSimulatableEmitter
    // returns false on Push, so applyEmitterSim should short-circuit and touch nothing.
    const after = createBuffer(before.width, before.height);
    after.data.set(before.data);
    applyEmitterSim(after, evalP, { emitters: push.emitters, particleCells: push.particleCells });
    const d = firstDiff(before, after);
    assert(d < 0, `Push not neutral, diff at byte ${d}`);
  });

  // -------- Rig-suppression: cells whose parent Emitter layer is not visible
  //          contribute ZERO particles (Diagonal has 15 emitters, only 3 visible
  //          for the default rig; sim must not paint into the other 12). --------
  test('sim: cells under rig-suppressed emitters are skipped', () => {
    const t = 0.5;
    const evalScene = evaluate(diag, t);
    // Verify assumption: at t=0.5s Diagonal has some invisible emitters (rig suppressed).
    let visibleEm = 0, invisibleEm = 0;
    for (const em of diag.emitters!.values()) {
      const ev = evalScene.evalLayerById.get(em.id);
      if (ev && ev.visible) visibleEm++; else invisibleEm++;
    }
    assert(invisibleEm > 0, `expected some invisible emitters (got ${invisibleEm})`);
    assert(visibleEm > 0, `expected some visible emitters (got ${visibleEm})`);

    // Render with the full scene (all cells).
    const iA = solidImage(evalScene.width, evalScene.height, 0, 0, 0);
    const iB = solidImage(evalScene.width, evalScene.height, 0, 0, 0);
    const full = composite(evalScene, iA, iB, evalScene.width, evalScene.height);

    // Render with cells restricted to invisible-emitter cells only — the sim
    // should paint NOTHING and the frame stays black-ish (only the field-texture
    // proxy contributes; sim contributes zero pixels).
    const restrictedCells = new Map<number, any>();
    for (const c of diag.particleCells!.values()) {
      const parentEv = evalScene.evalLayerById.get(c.emitterId ?? -1);
      if (!parentEv || !parentEv.visible) restrictedCells.set(c.id, c);
    }
    const restrictedScene = { ...evalScene };
    const overlay = createBuffer(evalScene.width, evalScene.height);
    applyEmitterSim(overlay, restrictedScene, { emitters: diag.emitters, particleCells: restrictedCells });
    // overlay should have NO alpha painted anywhere — cells under invisible
    // emitters are skipped by the visibility gate.
    let anyPainted = false;
    for (let i = 3; i < overlay.data.length; i += 4) {
      if (overlay.data[i] !== 0) { anyPainted = true; break; }
    }
    assert(!anyPainted, 'expected NO pixels painted for invisible-emitter cells');
    // Silence unused-var lint on `full`; the intent is to also prove composite ran.
    void full;
  });

  // -------- Determinism at the module level: two applyEmitterSim calls on the
  //          same inputs produce identical pixels. --------
  test('sim: applyEmitterSim is deterministic', () => {
    const evalScene = evaluate(diag, 0.7);
    const a = createBuffer(evalScene.width, evalScene.height);
    const b = createBuffer(evalScene.width, evalScene.height);
    applyEmitterSim(a, evalScene, { emitters: diag.emitters, particleCells: diag.particleCells });
    applyEmitterSim(b, evalScene, { emitters: diag.emitters, particleCells: diag.particleCells });
    const d = firstDiff(a, b);
    assert(d < 0, `not deterministic, diff at byte ${d}`);
  });

  // -------- Time-dependence: at scene t=0 vs later, the aggregate particle set
  //          differs (more particles have been born as time advances). --------
  test('sim: particle set advances with time', () => {
    const eScene0 = evaluate(diag, 0);
    const eScene1 = evaluate(diag, 1.0);
    const a = createBuffer(eScene0.width, eScene0.height);
    const b = createBuffer(eScene1.width, eScene1.height);
    applyEmitterSim(a, eScene0, { emitters: diag.emitters, particleCells: diag.particleCells });
    applyEmitterSim(b, eScene1, { emitters: diag.emitters, particleCells: diag.particleCells });
    const d = firstDiff(a, b);
    assert(d >= 0, 'expected the sim to differ across scene time');
  });

  console.log(`\n${pass} pass, ${fail} fail`);
  if (fail > 0) process.exit(1);
}
runTests();
