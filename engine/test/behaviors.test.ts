/**
 * Tests for animation behaviors.
 */
import { evaluateFade, evaluateRampAtProgress, applyRampCurvature, evaluateOscillate, evaluateSpin } from '../src/evaluator/behaviors/index.js';

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

  // Ramp (progress-based, exact decompiled formula)
  const ramp = { startValue: 0, endValue: 100, curvature: 0 };
  test('ramp: start value', () => assertClose(evaluateRampAtProgress(ramp, 0), 0, 0.01, 'start'));
  test('ramp: mid = 50', () => assertClose(evaluateRampAtProgress(ramp, 0.5), 50, 0.01, 'mid'));
  test('ramp: end value', () => assertClose(evaluateRampAtProgress(ramp, 1), 100, 0.01, 'end'));
  test('ramp: clamps before start', () => assertClose(evaluateRampAtProgress(ramp, -0.1), 0, 0.01, 'before'));
  test('ramp: clamps after end', () => assertClose(evaluateRampAtProgress(ramp, 1.2), 100, 0.01, 'after'));
  // Curvature = 1 → pure raised-cosine ease: at t=0.5, s=(1-cos(π/2))/2=0.5 → 50
  test('ramp curvature=1: linear-blend endpoints', () => {
    assertClose(applyRampCurvature(0, 1), 0, 1e-9, 'c1 t0');
    assertClose(applyRampCurvature(1, 1), 1, 1e-9, 'c1 t1');
    assertClose(applyRampCurvature(0.5, 1), 0.5, 1e-9, 'c1 t0.5 = (1-cos(π/2))/2');
  });
  // Curvature=1 eases the early part slower than linear (t=0.25 → below 0.25)
  test('ramp curvature=1: eased below linear at t=0.25', () => {
    const eased = applyRampCurvature(0.25, 1);
    assert(eased < 0.25 && eased > 0, `expected 0<eased<0.25, got ${eased}`);
  });

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
