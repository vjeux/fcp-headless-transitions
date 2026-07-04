/**
 * Tests for the evaluator (transform matrix building + layer evaluation).
 */
import { parseMotr } from '../src/parser/index.js';
import { evaluate, mat4Identity, mat4Multiply, mat4Translate, mat4Scale, mat4RotateZ } from '../src/evaluator/index.js';
import fs from 'node:fs';
import path from 'node:path';

const PUSH_PATH = path.resolve('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr');

function assertClose(actual: number, expected: number, tolerance: number, msg: string) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) throw new Error(`FAIL: ${msg} — expected ${expected}, got ${actual} (diff ${diff})`);
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Evaluator tests:\n');

  // Matrix tests
  test('mat4Identity is identity', () => {
    const m = mat4Identity();
    assertClose(m[0], 1, 0.001, '[0]'); assertClose(m[5], 1, 0.001, '[5]');
    assertClose(m[10], 1, 0.001, '[10]'); assertClose(m[15], 1, 0.001, '[15]');
    assertClose(m[1], 0, 0.001, '[1]'); assertClose(m[4], 0, 0.001, '[4]');
  });

  test('mat4Translate works', () => {
    const m = mat4Translate(10, 20, 30);
    assertClose(m[12], 10, 0.001, 'tx'); assertClose(m[13], 20, 0.001, 'ty'); assertClose(m[14], 30, 0.001, 'tz');
  });

  test('mat4Scale works', () => {
    const m = mat4Scale(2, 3, 4);
    assertClose(m[0], 2, 0.001, 'sx'); assertClose(m[5], 3, 0.001, 'sy'); assertClose(m[10], 4, 0.001, 'sz');
  });

  test('mat4RotateZ 90°', () => {
    const m = mat4RotateZ(90);
    assertClose(m[0], 0, 0.001, 'cos90'); assertClose(m[1], 1, 0.001, 'sin90');
    assertClose(m[4], -1, 0.001, '-sin90'); assertClose(m[5], 0, 0.001, 'cos90');
  });

  test('mat4Multiply identity × A = A', () => {
    const a = mat4Translate(5, 10, 15);
    const r = mat4Multiply(mat4Identity(), a);
    assertClose(r[12], 5, 0.001, 'tx'); assertClose(r[13], 10, 0.001, 'ty');
  });

  // Evaluator integration: evaluate Push scene at different times
  const xml = fs.readFileSync(PUSH_PATH, 'utf-8');
  const scene = parseMotr(xml);

  test('evaluate at t=0 produces layers', () => {
    const ev = evaluate(scene, 0);
    assert(ev.layers.length > 0, `no layers at t=0`);
  });

  test('evaluate at t=0.5 produces layers', () => {
    const ev = evaluate(scene, 0.5);
    assert(ev.layers.length > 0, `no layers at t=0.5`);
  });

  test('scene dimensions propagated', () => {
    const ev = evaluate(scene, 0);
    assertClose(ev.width, 1920, 0.1, 'width');
    assertClose(ev.height, 1080, 0.1, 'height');
  });

  // Find Transition A and check its opacity/transform at different times
  function findEvaluatedLayer(layers: any[], name: string): any {
    for (const l of layers) {
      if (l.layer.name === name) return l;
      const found = findEvaluatedLayer(l.children, name);
      if (found) return found;
    }
    return null;
  }

  test('Transition A visible at t=0', () => {
    const ev = evaluate(scene, 0);
    const ta = findEvaluatedLayer(ev.layers, 'Transition A');
    assert(ta !== null, 'not found');
    assert(ta.visible, 'not visible');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
