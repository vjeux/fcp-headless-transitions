/**
 * Tests for replicator instance generation.
 */
import {
  generateInstances,
  sequenceProgress,
  sequenceOrder,
  cellStampScale,
  replicatorPitch,
  cellFillPitchHackScale,
  cellFillAspectFit,
  resolveAuthoredStampScale,
  shouldHoldReplicatorPastTiming,
} from '../src/compositor/replicator.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }
function assertClose(a: number, b: number, tol: number, msg: string) {
  if (Math.abs(a - b) > tol) throw new Error(`FAIL: ${msg} — expected ${b}, got ${a}`);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Replicator instance tests:\n');

  test('point arrangement: single instance', () => {
    const inst = generateInstances({ arrangement: 0, columns: 1, rows: 1, sizeWidth: 100, sizeHeight: 100 });
    assert(inst.length === 1, `expected 1, got ${inst.length}`);
    assertClose(inst[0].x, 0, 0.01, 'x');
    assertClose(inst[0].y, 0, 0.01, 'y');
  });

  test('rectangle grid 3x2: 6 instances', () => {
    const inst = generateInstances({ arrangement: 1, columns: 3, rows: 2, sizeWidth: 200, sizeHeight: 100 });
    assert(inst.length === 6, `expected 6, got ${inst.length}`);
  });

  test('grid: centered on origin', () => {
    const inst = generateInstances({ arrangement: 1, columns: 3, rows: 1, sizeWidth: 200, sizeHeight: 0 });
    // 3 columns spanning 200px: -100, 0, +100
    assertClose(inst[0].x, -100, 0.01, 'first x');
    assertClose(inst[1].x, 0, 0.01, 'middle x');
    assertClose(inst[2].x, 100, 0.01, 'last x');
  });

  test('grid: row/col metadata', () => {
    const inst = generateInstances({ arrangement: 1, columns: 2, rows: 2, sizeWidth: 100, sizeHeight: 100 });
    assert(inst[0].row === 0 && inst[0].col === 0, 'inst[0] should be (0,0)');
    assert(inst[3].row === 1 && inst[3].col === 1, 'inst[3] should be (1,1)');
  });

  test('grid: normalized index 0→1', () => {
    const inst = generateInstances({ arrangement: 1, columns: 3, rows: 1, sizeWidth: 200, sizeHeight: 0 });
    assertClose(inst[0].normalizedIndex, 0, 0.01, 'first');
    assertClose(inst[2].normalizedIndex, 1, 0.01, 'last');
  });

  test('circle arrangement: correct count + radius', () => {
    const inst = generateInstances({ arrangement: 3, columns: 8, rows: 1, sizeWidth: 200, sizeHeight: 200 });
    assert(inst.length === 8, `expected 8, got ${inst.length}`);
    // All instances should be at radius 100 from center
    for (const i of inst) {
      const r = Math.sqrt(i.x * i.x + i.y * i.y);
      assertClose(r, 100, 0.1, `radius for instance ${i.index}`);
    }
  });

  test('single column grid', () => {
    const inst = generateInstances({ arrangement: 1, columns: 1, rows: 4, sizeWidth: 0, sizeHeight: 300 });
    assert(inst.length === 4, `expected 4, got ${inst.length}`);
    // Y positions should span the height, top to bottom
    assert(inst[0].y > inst[3].y, 'first row should be above last row (Y-up)');
  });


  // Sequence Replicator: sequenceProgress(seqPos, globalProgress, end, spread, total)
  test('sequence: instance that finished leads one that has not', () => {
    // At global progress mid-way, an early-ordered instance (seqPos 0) leads a
    // late one (seqPos 1).
    const early = sequenceProgress(0.0, 0.5, 0.8, 5, 10);
    const late = sequenceProgress(1.0, 0.5, 0.8, 5, 10);
    assert(early > late, `early instance (${early}) should lead late (${late})`);
  });

  test('sequence: earliest instance done, latest not started at small progress', () => {
    const early = sequenceProgress(0.0, 0.9, 0.8, 5, 10);
    assertClose(early, 1, 0.01, 'earliest instance should be complete near end');
    const late = sequenceProgress(1.0, 0.05, 0.8, 5, 10);
    assertClose(late, 0, 0.01, 'latest instance should not have started early');
  });

  test('sequence: clamped 0-1', () => {
    for (const g of [0, 0.1, 0.5, 0.9, 1]) {
      for (const s of [0, 0.5, 1]) {
        const p = sequenceProgress(s, g, 0.8, 70, 117);
        assert(p >= 0 && p <= 1, `progress should be clamped, got ${p}`);
      }
    }
  });

  test('sequenceOrder: diagonal ranks corner→corner', () => {
    // Motion's Sequence Replicator sweeps a diagonal WAVEFRONT across the grid.
    // sequenceOrder ranks by (col + (Rmax − row)) normalized to [0,1], so the wave
    // runs from the BOTTOM-LEFT corner (rank 0, animates first) to the TOP-RIGHT
    // corner (rank 1, animates last). This orientation is the one validated against
    // the GUI GT for Replicator-Clones/Duplicate (the dot wave sweeps across the
    // frame leaving the far corner last; scored 19.80→30.53 dB). Do NOT "fix" this to
    // top-left-first — that was the pre-GT guess and mismatches FCP.
    const first = sequenceOrder({ x: 0, y: 0, index: 6, row: 2, col: 0, normalizedIndex: 0 }, 3, 3);
    const last = sequenceOrder({ x: 0, y: 0, index: 2, row: 0, col: 2, normalizedIndex: 1 }, 3, 3);
    assertClose(first, 0, 0.001, 'bottom-left corner animates first');
    assertClose(last, 1, 0.001, 'opposite (top-right) corner animates last');
  });

  // ── OZReplicator cell stamp-size decode (2026-07-16, T-q7fd2fef0) ─────────
  // These helpers document the authored-vs-pitch-fit sizing rules parsed from
  // Motion's Video Wall.motr. They are exported for a future integrated tick
  // (parser + compositor/index.ts + framing.ts) that lands the correct model.

  test('cellStampScale: defaults 100%×100%', () => {
    assertClose(cellStampScale({}), 1, 1e-9, 'no args');
    assertClose(cellStampScale({ cellScalePct: 1 }), 1, 1e-9, 'only scale');
    assertClose(cellStampScale({ cellSizePct: 1 }), 1, 1e-9, 'only size');
  });

  test('cellStampScale: Video Wall (Scale=100%, Size=200%) → 2.0', () => {
    // Every one of Video Wall's 14 Replicator Cells authors Scale=empty (100%)
    // and Size=200% — verified in fct/minimized/Replicator-Clones__Video_Wall/
    // manifest.json + Motion .motr scenenode dump.
    assertClose(cellStampScale({ cellScalePct: 1, cellSizePct: 2 }), 2, 1e-9, 'authored');
    assertClose(resolveAuthoredStampScale({ cellSizePct: 2 }), 2, 1e-9, 'resolver alias');
  });

  test('cellStampScale: multiplicative (Scale × Size)', () => {
    assertClose(cellStampScale({ cellScalePct: 0.5, cellSizePct: 2 }), 1, 1e-9, 'half × double = 1');
    assertClose(cellStampScale({ cellScalePct: 1.5, cellSizePct: 1.5 }), 2.25, 1e-9, 'both 150%');
  });

  test('replicatorPitch: Pin-1 3×3 (sizeW=8200) → pitchX=4100', () => {
    const p = replicatorPitch({ columns: 3, rows: 3, sizeWidth: 8200, sizeHeight: 2400 });
    assertClose(p.pitchX, 4100, 1e-9, 'pitchX = 8200/(3-1)');
    assertClose(p.pitchY, 1200, 1e-9, 'pitchY = 2400/(3-1)');
  });

  test('replicatorPitch: single-row line replicator (rows=1) → pitchY=0', () => {
    // Video Wall's decorative 1×2 Pin-2 copies have rows=1; pitchY collapses to
    // 0 (no vertical spacing). Aspect-fit helpers must handle this cleanly.
    const p = replicatorPitch({ columns: 2, rows: 1, sizeWidth: 8260, sizeHeight: 2400 });
    assertClose(p.pitchX, 8260, 1e-9, 'pitchX for 2 cols spanning 8260');
    assertClose(p.pitchY, 0, 1e-9, 'pitchY = 0 for 1 row');
  });

  test('replicatorPitch: single column (cols=1) → pitchX=0', () => {
    const p = replicatorPitch({ columns: 1, rows: 4, sizeWidth: 0, sizeHeight: 300 });
    assertClose(p.pitchX, 0, 1e-9, 'pitchX = 0 for 1 col');
    assertClose(p.pitchY, 100, 1e-9, 'pitchY = 300/3');
  });

  test('cellFillPitchHackScale: matches inline formula in compositor/index.ts', () => {
    // Reference: `const fillScale = pitchX / stampImg.width; if (fillScale > 1) cellFill = fillScale;`
    // Video Wall Pin-1: pitchX=4100, tileW=1920 → 2.135…
    assertClose(cellFillPitchHackScale({ pitchX: 4100, tileWidth: 1920 }), 4100 / 1920, 1e-9, 'Pin-1 3×3');
    // Sub-1 case clamped to 1 (dense grids / dot replicators).
    assertClose(cellFillPitchHackScale({ pitchX: 100, tileWidth: 500 }), 1, 1e-9, 'sub-1 clamps to 1');
    // Zero tile guards against div-by-zero.
    assertClose(cellFillPitchHackScale({ pitchX: 4100, tileWidth: 0 }), 1, 1e-9, 'zero tileW guard');
  });

  test('cellFillAspectFit cover: preserves tile aspect, dominant axis wins', () => {
    // Pin-1: pitchX=4100 pitchY=1200, tile 1920×1080. X ratio 2.135, Y ratio 1.111.
    // Cover = max = 2.135 (X dominates because sizeW/sizeH 3.42 > tile aspect 1.78).
    const cover = cellFillAspectFit({ pitchX: 4100, pitchY: 1200, tileWidth: 1920, tileHeight: 1080, mode: 'cover' });
    assertClose(cover, 4100 / 1920, 1e-9, 'cover = max ratio');
  });

  test('cellFillAspectFit contain: fits inside pitch, smaller ratio wins', () => {
    // Same geometry, contain = min = 1.111.
    const contain = cellFillAspectFit({ pitchX: 4100, pitchY: 1200, tileWidth: 1920, tileHeight: 1080, mode: 'contain' });
    assertClose(contain, 1200 / 1080, 1e-9, 'contain = min ratio');
  });

  test('cellFillAspectFit: rows=1 → pitchY=0 excluded, X governs both modes', () => {
    // Line replicator (pitchY=0): only X ratio is finite. Both modes return it.
    const g = { pitchX: 8260, pitchY: 0, tileWidth: 1920, tileHeight: 1080 } as const;
    assertClose(cellFillAspectFit({ ...g, mode: 'cover' }), 8260 / 1920, 1e-9, 'cover');
    assertClose(cellFillAspectFit({ ...g, mode: 'contain' }), 8260 / 1920, 1e-9, 'contain');
  });

  test('cellFillAspectFit: cols=1 && rows=1 → both pitches 0, returns 1', () => {
    // Fully degenerate (point-arrangement style) — no scaling can be derived.
    const s = cellFillAspectFit({ pitchX: 0, pitchY: 0, tileWidth: 1920, tileHeight: 1080, mode: 'cover' });
    assertClose(s, 1, 1e-9, 'default 1');
  });

  // ==========================================================================
  // shouldHoldReplicatorPastTiming (T-q7fd2fef0)
  // ==========================================================================

  test('shouldHoldReplicatorPastTiming: fires past timing.out in framed scene with cellSource', () => {
    // Video_Wall's main wall: framed, has Pin cell, out=1.101s, current time 1.2s → HELD.
    assert(shouldHoldReplicatorPastTiming({
      framed: true, hasCellSource: true, hasTiming: true, time: 1.2, outSec: 1.101,
    }), 'main wall past out should hold');
  });

  test('shouldHoldReplicatorPastTiming: does NOT fire before timing.out', () => {
    // Same replicator, current time 0.9s (before out=1.101s) → NOT held.
    assert(!shouldHoldReplicatorPastTiming({
      framed: true, hasCellSource: true, hasTiming: true, time: 0.9, outSec: 1.101,
    }), 'before out should not hold');
  });

  test('shouldHoldReplicatorPastTiming: does NOT fire in origin-camera scene', () => {
    // Duplicate/Squares/Concentric have origin cameras (framed=false) — never held.
    assert(!shouldHoldReplicatorPastTiming({
      framed: false, hasCellSource: true, hasTiming: true, time: 1.5, outSec: 1.0,
    }), 'origin camera should not hold');
  });

  test('shouldHoldReplicatorPastTiming: does NOT fire when replicator has no cell source', () => {
    // Shape/panel/particle replicator (no cellSourceId) — respects timing.
    assert(!shouldHoldReplicatorPastTiming({
      framed: true, hasCellSource: false, hasTiming: true, time: 1.5, outSec: 1.0,
    }), 'no cell source should not hold');
  });

  test('shouldHoldReplicatorPastTiming: does NOT fire when replicator has no timing', () => {
    // A replicator without a <timing> element has no lifetime to hold past.
    assert(!shouldHoldReplicatorPastTiming({
      framed: true, hasCellSource: true, hasTiming: false, time: 1.5, outSec: 0,
    }), 'no timing should not hold');
  });

  test('shouldHoldReplicatorPastTiming: exactly at out is NOT held (strict >)', () => {
    // Edge case: at time = outSec, the layer is still in its authored window.
    assert(!shouldHoldReplicatorPastTiming({
      framed: true, hasCellSource: true, hasTiming: true, time: 1.101, outSec: 1.101,
    }), 'at out should not hold (strict >)');
  });

  test('shouldHoldReplicatorPastTiming: Video_Wall decorative replicators also held past their out', () => {
    // Decorative line replicators (Pin 2 copy 4/5/8/9/10, etc.) have their own
    // staggered timing.out ∈ [0.367, 1.869]. At the tail frame f22 (t=1.921s),
    // all held replicators contribute to the wall through the framing camera —
    // measured: broad-gate 10.53 dB vs 2D-only-gate 10.38 dB (2D-only excludes
    // the decoratives and loses composition).
    for (const outSec of [0.367, 0.534, 0.767, 0.968, 1.101, 1.134, 1.768, 1.835, 1.869]) {
      assert(shouldHoldReplicatorPastTiming({
        framed: true, hasCellSource: true, hasTiming: true, time: 1.921, outSec,
      }), `held at t=1.921 with out=${outSec}`);
    }
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
