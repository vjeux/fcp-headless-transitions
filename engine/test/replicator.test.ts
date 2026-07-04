/**
 * Tests for replicator instance generation.
 */
import { generateInstances } from '../src/compositor/replicator.js';

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

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
