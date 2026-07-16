/**
 * Tests for the paint-stroke Emitter rasteriser subsystem (T-q1f2f0f55).
 *
 * Pins the structural detectors, dab-sampling math, and rasteriser semantics so
 * the scaffolding cannot silently regress once it is wired into composite().
 * Data-points are taken from a real .motr decode of Slide_In (10 emitter
 * layers, each 5x5 dabs, shape=4). No render is scored here — the WIP tick's
 * job is to pin the math; the follow-up wiring tick will score against GT.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}

import {
  hasPaintStrokeReplicator,
  isPaintStrokeReplicator,
  extractPaintStrokeSpec,
  sampleDabs,
  rasterisePaintStroke,
  type PaintStrokeSpec,
} from '../src/compositor/emitter-render.js';
import type { Layer, Curve } from '../src/types.js';
import { parseMotr } from '../src/parser/index.js';
import fs from 'node:fs';

const TX = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized';
const SLIDE_IN_MOTR = `${TX}/Stylized.localized/Boxes.localized/Slide In.localized/Slide In.motr`;
const LIGHT_SWEEP_MOTR = `${TX}/Stylized.localized/Cinema.localized/Light Sweep.localized/Light Sweep.motr`;
const CLOSE_OPEN_MOTR = `${TX}/Stylized.localized/Documentary.localized/Close & Open.localized/Close & Open.motr`;
const UP_OVER_MOTR = `${TX}/Stylized.localized/Tribute.localized/Up:Over.localized/Up:Over.motr`;
const FLASH_MOTR = `${TX}/Lights.localized/Flash.localized/Flash.motr`;
const DUPLICATE_MOTR = `${TX}/Replicator:Clones.localized/Duplicate.localized/Duplicate.motr`;
// Non-paint-stroke slugs — the detectors MUST NOT fire on any of these.
const SQUARES_MOTR = `${TX}/Objects.localized/Squares.localized/Squares.motr`;
const VERTIGO_MOTR = `${TX}/Replicator:Clones.localized/Vertigo.localized/Vertigo.motr`;
const DIAGONAL_MOTR = `${TX}/Stylized.localized/Nature.localized/Diagonal.localized/Diagonal.motr`;
const BLURS_ZOOM_MOTR = `${TX}/Blurs.localized/Zoom.localized/Zoom.motr`;

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }
function assertClose(a: number, b: number, tol: number, msg: string) {
  if (Math.abs(a - b) > tol) throw new Error(`FAIL: ${msg} — expected ${b}, got ${a} (|diff|=${Math.abs(a - b)} > tol ${tol})`);
}

/** Build a synthetic paint-stroke Replicator Layer mirroring one of Slide_In's
 *  10 emitters: shape=4 arrangement, Points=5 dabs along the stroke. Used by
 *  math-pinning tests that don't need to spin up the full parser. */
function makeSlideInLikeLayer(overrides: Partial<Layer['replicator']> = {}): Layer {
  return {
    name: 'Emitter',
    id: 1239094,
    type: 'replicator',
    transform: {},
    blendMode: 'normal' as any,
    filters: [],
    children: [],
    replicator: {
      arrangement: 0,
      columns: 1,
      rows: 1,
      sizeWidth: 0,
      sizeHeight: 0,
      origin: 14,
      shape: 4,
      points: 5,
      ...overrides,
    },
    enabled: true,
  };
}

/** Trivial constant-value curve (single keypoint at t=0 with the given value).
 *  Slide_In's over-stroke curves are exactly this: two identical keypoints
 *  giving a constant ramp. Used by curve-pinning tests. */
function constantCurve(v: number): Curve {
  return {
    type: 1,
    default: v,
    value: v,
    keyframes: [
      { time: { value: 0, timescale: 1 }, value: v, interpolation: 1 },
      { time: { value: 1, timescale: 1 }, value: v, interpolation: 1 },
    ],
  };
}

/** Solid-red 8x8 brush sprite (alpha 255). Small so rasteriser tests are fast. */
function makeSolidBrush(): ImageData {
  const w = 8, h = 8;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4]     = 255; // R
    data[i * 4 + 1] = 0;   // G
    data[i * 4 + 2] = 0;   // B
    data[i * 4 + 3] = 255; // A
  }
  return new (globalThis as any).ImageData(data, w, h);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Paint-stroke emitter rasteriser tests:\n');

  // ─── Structural detectors ─────────────────────────────────────────────────

  test('isPaintStrokeReplicator: fires on shape=4 replicator layer', () => {
    const layer = makeSlideInLikeLayer();
    assert(isPaintStrokeReplicator(layer), 'shape=4 replicator should match');
  });

  test('isPaintStrokeReplicator: does NOT fire on grid replicator (shape=undefined)', () => {
    const layer = makeSlideInLikeLayer({ shape: undefined, columns: 10, rows: 10 });
    assert(!isPaintStrokeReplicator(layer), 'grid replicator should not match');
  });

  test('isPaintStrokeReplicator: does NOT fire on Circle replicator (shape=1)', () => {
    const layer = makeSlideInLikeLayer({ shape: 1 });
    assert(!isPaintStrokeReplicator(layer), 'circle replicator should not match');
  });

  test('isPaintStrokeReplicator: does NOT fire on non-replicator layers', () => {
    const layer: Layer = {
      name: 'group', id: 1, type: 'group', transform: {}, blendMode: 'normal' as any,
      filters: [], children: [], enabled: true,
    };
    assert(!isPaintStrokeReplicator(layer), 'group layer should not match');
  });

  test('hasPaintStrokeReplicator: fires on Slide_In (6 built-ins expected)', () => {
    if (!fs.existsSync(SLIDE_IN_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(SLIDE_IN_MOTR, 'utf-8'));
    assert(hasPaintStrokeReplicator(scene), 'Slide_In should match');
  });

  test('hasPaintStrokeReplicator: fires on Light_Sweep', () => {
    if (!fs.existsSync(LIGHT_SWEEP_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(LIGHT_SWEEP_MOTR, 'utf-8'));
    assert(hasPaintStrokeReplicator(scene), 'Light_Sweep should match');
  });

  test('hasPaintStrokeReplicator: fires on Close & Open', () => {
    if (!fs.existsSync(CLOSE_OPEN_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(CLOSE_OPEN_MOTR, 'utf-8'));
    assert(hasPaintStrokeReplicator(scene), 'Close & Open should match');
  });

  test('hasPaintStrokeReplicator: fires on Up/Over', () => {
    if (!fs.existsSync(UP_OVER_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(UP_OVER_MOTR, 'utf-8'));
    assert(hasPaintStrokeReplicator(scene), 'Up:Over should match');
  });

  test('hasPaintStrokeReplicator: fires on Flash', () => {
    if (!fs.existsSync(FLASH_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(FLASH_MOTR, 'utf-8'));
    assert(hasPaintStrokeReplicator(scene), 'Flash should match');
  });

  test('hasPaintStrokeReplicator: fires on Duplicate', () => {
    if (!fs.existsSync(DUPLICATE_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(DUPLICATE_MOTR, 'utf-8'));
    assert(hasPaintStrokeReplicator(scene), 'Duplicate should match');
  });

  test('hasPaintStrokeReplicator: does NOT fire on Squares (grid replicator)', () => {
    if (!fs.existsSync(SQUARES_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(SQUARES_MOTR, 'utf-8'));
    assert(!hasPaintStrokeReplicator(scene), 'Squares should not match');
  });

  test('hasPaintStrokeReplicator: does NOT fire on Vertigo (circle replicator)', () => {
    if (!fs.existsSync(VERTIGO_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(VERTIGO_MOTR, 'utf-8'));
    assert(!hasPaintStrokeReplicator(scene), 'Vertigo should not match');
  });

  test('hasPaintStrokeReplicator: does NOT fire on Diagonal (particle Emitter, not Replicator)', () => {
    if (!fs.existsSync(DIAGONAL_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(DIAGONAL_MOTR, 'utf-8'));
    assert(!hasPaintStrokeReplicator(scene), 'Diagonal is a particle Emitter (fid 23), not a paint-stroke Replicator');
  });

  test('hasPaintStrokeReplicator: does NOT fire on Blurs/Zoom (no replicator at all)', () => {
    if (!fs.existsSync(BLURS_ZOOM_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(BLURS_ZOOM_MOTR, 'utf-8'));
    assert(!hasPaintStrokeReplicator(scene), 'Blurs/Zoom should not match');
  });

  // ─── Extractor ────────────────────────────────────────────────────────────

  test('extractPaintStrokeSpec: returns null for non-paint-stroke layer', () => {
    const layer = makeSlideInLikeLayer({ shape: undefined });
    assert(extractPaintStrokeSpec(layer) === null, 'non-paint-stroke → null');
  });

  test('extractPaintStrokeSpec: returns null when points === 0', () => {
    const layer = makeSlideInLikeLayer({ points: 0 });
    assert(extractPaintStrokeSpec(layer) === null, 'points=0 → null');
  });

  test('extractPaintStrokeSpec: Slide_In-like layer produces defaulted spec', () => {
    const layer = makeSlideInLikeLayer();
    const spec = extractPaintStrokeSpec(layer);
    assert(spec !== null, 'spec is not null');
    assert(spec!.points === 5, `points=5 (got ${spec!.points})`);
    assert(spec!.ranks === 1, `ranks defaults to 1 (parser gap) (got ${spec!.ranks})`);
    assert(spec!.brush === null, 'brush is null without resolver');
    assert(spec!.buildProgress === 1, 'buildProgress defaults to 1');
    assert(spec!.opacity === 1, 'opacity defaults to 1');
    assert(spec!.angleRad === 0, 'angleRad defaults to 0');
    assert(spec!.extent.along === 1920, `along defaults to 1920 when sizeWidth=0 (got ${spec!.extent.along})`);
    assert(spec!.extent.across === 1080, `across defaults to 1080 when sizeHeight=0`);
    assert(spec!.seed === layer.id, 'seed = layer.id');
  });

  test('extractPaintStrokeSpec: uses parsed sizeWidth/Height when non-zero', () => {
    const layer = makeSlideInLikeLayer({ sizeWidth: 800, sizeHeight: 600 });
    const spec = extractPaintStrokeSpec(layer);
    assert(spec!.extent.along === 800, 'along uses sizeWidth');
    assert(spec!.extent.across === 600, 'across uses sizeHeight');
  });

  test('extractPaintStrokeSpec: brush resolver receives cellSourceId', () => {
    const layer = { ...makeSlideInLikeLayer(), cellSourceId: 1919300403 };
    let seenId: number | undefined = -1;
    const brush = makeSolidBrush();
    const spec = extractPaintStrokeSpec(layer, (id) => { seenId = id; return brush; });
    assert(seenId === 1919300403, `resolver got id=${seenId}`);
    assert(spec!.brush === brush, 'brush routed through');
  });

  // ─── Dab sampling ─────────────────────────────────────────────────────────

  test('sampleDabs: 5 points × 1 rank at zero-extent → 5 dabs at origin', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 0, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    assert(dabs.length === 5, `5 dabs (got ${dabs.length})`);
    for (const d of dabs) {
      assertClose(d.x, 0, 1e-9, 'x at origin');
      assertClose(d.y, 0, 1e-9, 'y at origin');
    }
    // strokeT should be 0, 0.25, 0.5, 0.75, 1
    assertClose(dabs[0].strokeT, 0.00, 1e-9, 'dab0 strokeT');
    assertClose(dabs[1].strokeT, 0.25, 1e-9, 'dab1 strokeT');
    assertClose(dabs[2].strokeT, 0.50, 1e-9, 'dab2 strokeT');
    assertClose(dabs[3].strokeT, 0.75, 1e-9, 'dab3 strokeT');
    assertClose(dabs[4].strokeT, 1.00, 1e-9, 'dab4 strokeT');
  });

  test('sampleDabs: Slide_In geometry — 5 dabs span the full stroke length', () => {
    // Slide_In: shape=4, Points=5, default extent 1920. With centre=(0,0) the
    // dabs stretch from x=-960 (t=0) to x=+960 (t=1), evenly spaced.
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 1920, across: 1080 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    assert(dabs.length === 5, `5 dabs (got ${dabs.length})`);
    assertClose(dabs[0].x, -960, 1e-6, 'first dab at left');
    assertClose(dabs[4].x, +960, 1e-6, 'last dab at right');
    assertClose(dabs[2].x, 0, 1e-6, 'middle dab at centre');
    // Uniform spacing:
    const step = dabs[1].x - dabs[0].x;
    assertClose(step, 480, 1e-6, 'uniform 480px spacing');
  });

  test('sampleDabs: 5×5 lattice like Slide_In produces 25 dabs', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 5,
      extent: { along: 1920, across: 1080 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    assert(dabs.length === 25, `25 dabs (got ${dabs.length})`);
    // Ranks span across ±540; check first-point rank spread.
    const firstPointDabs = dabs.filter(d => d.pointIdx === 0);
    assert(firstPointDabs.length === 5, '5 ranks at pointIdx=0');
    assertClose(firstPointDabs[0].y, -540, 1e-6, 'first rank at y=-540');
    assertClose(firstPointDabs[4].y, +540, 1e-6, 'last rank at y=+540');
  });

  test('sampleDabs: buildProgress=0.5 gates dabs past strokeT>0.5', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 1920, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 0.5, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    // dabs at t=0, 0.25, 0.5 should pass; t=0.75, 1 should be gated out.
    assert(dabs.length === 3, `3 dabs at buildProgress=0.5 (got ${dabs.length})`);
    assert(dabs.every(d => d.strokeT <= 0.5 + 1e-6), 'all dabs strokeT ≤ 0.5');
  });

  test('sampleDabs: buildProgress=0 → zero dabs (except strokeT=0)', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 1920, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 0, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    // Only the strokeT=0 dab satisfies the ≤ 0 gate (with the 1e-6 slack).
    assert(dabs.length === 1, `just strokeT=0 dab at buildProgress=0 (got ${dabs.length})`);
    assertClose(dabs[0].strokeT, 0, 1e-9, 'first dab at strokeT=0');
  });

  test('sampleDabs: angleRad=π/2 rotates stroke 90° CCW (x-axis becomes y-axis)', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 1920, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: Math.PI / 2,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    // After 90° rotation, along-axis dabs live on the y-axis, x should be 0.
    // Motion Y-DOWN: rotation matrix [cos -sin; sin cos] with angle=π/2 sends
    // (along=-960, 0) → (0, -960). So dab[0].y ≈ -960 (not +960) is expected
    // as the stroke was oriented at +90° radians (screen up-vs-down convention
    // doesn't matter here — we're pinning the transform is applied, direction
    // is documented). Just verify x collapsed to 0 within tolerance:
    for (const d of dabs) assertClose(d.x, 0, 1e-6, 'x collapsed after 90° rot');
  });

  test('sampleDabs: widthOverStroke curve drives per-dab scale', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 3, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: { widthOverStroke: constantCurve(2.5) },
      buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    assert(dabs.length === 3, '3 dabs');
    for (const d of dabs) assertClose(d.scale, 2.5, 1e-6, 'constant width=2.5');
  });

  test('sampleDabs: angleOverStroke curve drives per-dab rotation', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 3, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0.3, // base rotation
      curves: { angleOverStroke: constantCurve(0.7) },
      buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    for (const d of dabs) assertClose(d.rotationRad, 1.0, 1e-6, 'base + curve = 1.0');
  });

  test('sampleDabs: sourceStartFrame curve is rounded to integer', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 3, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: { sourceStartFrameOverStroke: constantCurve(3.7) },
      buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    for (const d of dabs) assert(d.spriteFrame === 4, `3.7 rounds to 4 (got ${d.spriteFrame})`);
  });

  test('sampleDabs: jitter with seed=0 is deterministic across calls', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: { jitterXOverStroke: constantCurve(50), jitterYOverStroke: constantCurve(50) },
      buildProgress: 1, seed: 42, opacity: 1,
    };
    const a = sampleDabs(spec);
    const b = sampleDabs(spec);
    for (let i = 0; i < a.length; i++) {
      assertClose(a[i].x, b[i].x, 1e-12, `deterministic x[${i}]`);
      assertClose(a[i].y, b[i].y, 1e-12, `deterministic y[${i}]`);
      assertClose(a[i].jitterX, b[i].jitterX, 1e-12, `deterministic jitterX[${i}]`);
    }
  });

  test('sampleDabs: jitter differs across different seeds', () => {
    const specA: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: { jitterXOverStroke: constantCurve(50) },
      buildProgress: 1, seed: 1, opacity: 1,
    };
    const specB = { ...specA, seed: 123456789 };
    const a = sampleDabs(specA), b = sampleDabs(specB);
    let anyDiff = false;
    for (let i = 0; i < a.length; i++) if (Math.abs(a[i].x - b[i].x) > 1e-6) { anyDiff = true; break; }
    assert(anyDiff, 'different seeds → different jitter');
  });

  test('sampleDabs: zero jitter amplitude → zero jitter offset', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: { jitterXOverStroke: constantCurve(0), jitterYOverStroke: constantCurve(0) },
      buildProgress: 1, seed: 999, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    for (const d of dabs) {
      assertClose(d.jitterX, 0, 1e-9, 'zero jitterX');
      assertClose(d.jitterY, 0, 1e-9, 'zero jitterY');
    }
  });

  test('sampleDabs: point-major, rank-minor build order (Dab Depth Ordered)', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 3, ranks: 3,
      extent: { along: 100, across: 100 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const dabs = sampleDabs(spec);
    assert(dabs.length === 9, '9 dabs');
    // First 3 dabs share pointIdx=0
    for (let i = 0; i < 3; i++) assert(dabs[i].pointIdx === 0, `dabs[${i}].pointIdx === 0`);
    // Next 3 share pointIdx=1
    for (let i = 3; i < 6; i++) assert(dabs[i].pointIdx === 1, `dabs[${i}].pointIdx === 1`);
    // rank cycles 0,1,2
    for (let i = 0; i < 9; i++) assert(dabs[i].rankIdx === i % 3, `dabs[${i}].rankIdx === ${i%3}`);
  });

  // ─── Rasteriser ───────────────────────────────────────────────────────────

  test('rasterisePaintStroke: null brush → 0 stamps, output unchanged', () => {
    const spec: PaintStrokeSpec = {
      brush: null, points: 5, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const out = new (globalThis as any).ImageData(new Uint8ClampedArray(32 * 32 * 4), 32, 32) as ImageData;
    const stamped = rasterisePaintStroke(out, spec, 32, 32);
    assert(stamped === 0, 'no dabs stamped');
    for (let i = 0; i < out.data.length; i++) assert(out.data[i] === 0, 'output unchanged');
  });

  test('rasterisePaintStroke: single centre dab paints red pixels', () => {
    const brush = makeSolidBrush();
    const spec: PaintStrokeSpec = {
      brush, points: 1, ranks: 1,
      extent: { along: 0, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const out = new (globalThis as any).ImageData(new Uint8ClampedArray(32 * 32 * 4), 32, 32) as ImageData;
    const stamped = rasterisePaintStroke(out, spec, 32, 32);
    assert(stamped === 1, `1 dab stamped (got ${stamped})`);
    // Centre pixel (16,16) should be red.
    const centreIdx = (16 * 32 + 16) * 4;
    assert(out.data[centreIdx] > 200, `red channel at centre (got ${out.data[centreIdx]})`);
    assert(out.data[centreIdx + 3] > 200, `alpha at centre (got ${out.data[centreIdx + 3]})`);
    // Corner pixel (0,0) should be untouched (brush is 8px, centred at 16,16 → covers ~12-20).
    const cornerIdx = 0;
    assert(out.data[cornerIdx] === 0, 'corner unchanged');
  });

  test('rasterisePaintStroke: 5-dab Slide_In-like stroke stamps 5 times', () => {
    const brush = makeSolidBrush();
    const spec: PaintStrokeSpec = {
      brush, points: 5, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const out = new (globalThis as any).ImageData(new Uint8ClampedArray(200 * 100 * 4), 200, 100) as ImageData;
    const stamped = rasterisePaintStroke(out, spec, 200, 100);
    assert(stamped === 5, `5 dabs stamped (got ${stamped})`);
  });

  test('rasterisePaintStroke: opacity=0 → 0 stamps', () => {
    const spec: PaintStrokeSpec = {
      brush: makeSolidBrush(), points: 5, ranks: 1,
      extent: { along: 100, across: 0 },
      centre: { x: 0, y: 0 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 0,
    };
    const out = new (globalThis as any).ImageData(new Uint8ClampedArray(32 * 32 * 4), 32, 32) as ImageData;
    const stamped = rasterisePaintStroke(out, spec, 32, 32);
    assert(stamped === 0, 'opacity=0 → no stamps');
  });

  test('rasterisePaintStroke: is deterministic (identical output across calls)', () => {
    const brush = makeSolidBrush();
    const spec: PaintStrokeSpec = {
      brush, points: 3, ranks: 3,
      extent: { along: 100, across: 100 },
      centre: { x: 0, y: 0 }, angleRad: 0.3,
      curves: {
        jitterXOverStroke: constantCurve(5),
        jitterYOverStroke: constantCurve(5),
      },
      buildProgress: 1, seed: 42, opacity: 0.8,
    };
    const outA = new (globalThis as any).ImageData(new Uint8ClampedArray(64 * 64 * 4), 64, 64) as ImageData;
    const outB = new (globalThis as any).ImageData(new Uint8ClampedArray(64 * 64 * 4), 64, 64) as ImageData;
    rasterisePaintStroke(outA, spec, 64, 64);
    rasterisePaintStroke(outB, spec, 64, 64);
    for (let i = 0; i < outA.data.length; i++) {
      if (outA.data[i] !== outB.data[i]) {
        throw new Error(`byte drift at index ${i}: ${outA.data[i]} vs ${outB.data[i]}`);
      }
    }
  });

  test('rasterisePaintStroke: dab fully offscreen → 0 painted pixels', () => {
    const brush = makeSolidBrush();
    const spec: PaintStrokeSpec = {
      brush, points: 1, ranks: 1,
      extent: { along: 0, across: 0 },
      centre: { x: 10000, y: 10000 }, angleRad: 0,
      curves: {}, buildProgress: 1, seed: 0, opacity: 1,
    };
    const out = new (globalThis as any).ImageData(new Uint8ClampedArray(32 * 32 * 4), 32, 32) as ImageData;
    rasterisePaintStroke(out, spec, 32, 32);
    for (let i = 0; i < out.data.length; i++) assert(out.data[i] === 0, 'output unchanged');
  });

  // ─── End-to-end: real Slide_In .motr → extractor produces expected specs ──

  test('e2e Slide_In: parse → walk layers → extract ≥ 1 valid paint-stroke spec', () => {
    if (!fs.existsSync(SLIDE_IN_MOTR)) { console.log('    (skipped — motr not present)'); return; }
    const scene = parseMotr(fs.readFileSync(SLIDE_IN_MOTR, 'utf-8'));
    let specs = 0;
    function walk(layers: readonly Layer[]) {
      for (const l of layers) {
        if (isPaintStrokeReplicator(l)) {
          const s = extractPaintStrokeSpec(l);
          assert(s !== null, `extractor produced spec for paint-stroke layer id=${l.id}`);
          assert(s!.points === 5, `Slide_In authors Points=5 (got ${s!.points})`);
          specs++;
        }
        if (l.children) walk(l.children);
      }
    }
    walk(scene.layers);
    assert(specs >= 1, `at least 1 paint-stroke extracted (got ${specs})`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
