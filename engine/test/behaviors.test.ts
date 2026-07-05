/**
 * Tests for animation behaviors.
 */
import { evaluateFade, evaluateRamp, evaluateOscillate, evaluateSpin } from '../src/evaluator/behaviors/index.js';

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

  console.log('Behavior tests:\n');

  // Fade In/Fade Out. Window [0, 100]; fade in over first 10, fade out over last 10.
  const fade = { fadeInTime: 10, fadeOutTime: 10, windowIn: 0, windowOut: 100 };
  test('fade: 0 at start', () => assertClose(evaluateFade(fade, 0), 0, 0.01, 'start'));
  test('fade: 0.5 mid fade-in', () => assertClose(evaluateFade(fade, 5), 0.5, 0.01, 'mid-in'));
  test('fade: 1.0 after fade-in', () => assertClose(evaluateFade(fade, 10), 1.0, 0.01, 'after-in'));
  test('fade: 1.0 in middle', () => assertClose(evaluateFade(fade, 50), 1.0, 0.01, 'middle'));
  test('fade: 0.5 mid fade-out', () => assertClose(evaluateFade(fade, 95), 0.5, 0.01, 'mid-out'));
  test('fade: 0 at end', () => assertClose(evaluateFade(fade, 100), 0, 0.01, 'end'));

  // Ramp (linear)
  const ramp = { startValue: 0, endValue: 100, curvature: 0, startOffset: 0, endOffset: 0 };
  test('ramp: start value', () => assertClose(evaluateRamp(ramp, 0, 100), 0, 0.01, 'start'));
  test('ramp: mid = 50', () => assertClose(evaluateRamp(ramp, 50, 100), 50, 0.01, 'mid'));
  test('ramp: end value', () => assertClose(evaluateRamp(ramp, 100, 100), 100, 0.01, 'end'));
  test('ramp: clamps before start', () => assertClose(evaluateRamp(ramp, -10, 100), 0, 0.01, 'before'));

  // Oscillate
  const osc = { amplitude: 100, frequency: 1, phase: 0 };
  test('oscillate: 0 at t=0 (sin 0)', () => assertClose(evaluateOscillate(osc, 0), 0, 0.01, 't=0'));
  test('oscillate: peak at quarter period', () => assertClose(evaluateOscillate(osc, 0.25), 100, 0.01, 'peak'));
  test('oscillate: 0 at half period', () => assertClose(evaluateOscillate(osc, 0.5), 0, 0.1, 'half'));

  // Spin
  const spin = { rate: 360 };
  test('spin: 0 at t=0', () => assertClose(evaluateSpin(spin, 0), 0, 0.01, 't=0'));
  test('spin: 360 at t=1', () => assertClose(evaluateSpin(spin, 1), 360, 0.01, 't=1'));
  test('spin: 180 at t=0.5', () => assertClose(evaluateSpin(spin, 0.5), 180, 0.01, 't=0.5'));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
