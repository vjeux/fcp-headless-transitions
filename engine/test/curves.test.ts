/**
 * Tests for the bezier keyframe curve evaluator.
 * Validates against known keyframe data from Push.motr.
 */
import { evaluateCurve, timeToSeconds } from '../src/evaluator/curves.js';
import type { Curve, Keyframe } from '../src/types.js';

function assertClose(actual: number, expected: number, tolerance: number, msg: string) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`FAIL: ${msg} — expected ${expected}, got ${actual} (diff ${diff})`);
  }
}

// Push.motr X keyframes for Transition A (the outgoing image slides left)
// These are the ACTUAL keyframes from the file:
const pushXCurve: Curve = {
  type: 1,
  default: -194.9,
  keyframes: [
    {
      time: { value: 0, timescale: 120000 },
      value: 0,
      interpolation: 6,
      inTangentTime: -0.55658033759811665,
      inTangentValue: 171.58681348977461,
      outTangentTime: 0.039283739922516513,
      outTangentValue: -12.11068968831024,
    },
    {
      time: { value: 36036, timescale: 120000 },
      value: -221.16512544260996,
      interpolation: 6,
      inTangentTime: -0.10009999999999999,
      inTangentValue: 136.60487384738676,
      outTangentTime: 0.16683333319999999,
      outTangentValue: -243.07458820714652,
    },
    {
      time: { value: 96096, timescale: 120000 },
      value: -1084.4299999999998,
      interpolation: 6,
      inTangentTime: -0.16683333324999999,
      inTangentValue: 286.92556693615455,
      outTangentTime: 0.16683333323076921,
      outTangentValue: -287.84624622319404,
    },
    {
      time: { value: 156156, timescale: 120000 },
      value: -1738.4557373374375,
      interpolation: 6,
      inTangentTime: -0.16683333319999999,
      inTangentValue: 179.76307840542427,
      outTangentTime: 0.12234444440000002,
      outTangentValue: -124.82549436957501,
    },
    {
      time: { value: 200200, timescale: 120000 },
      value: -1920,
      interpolation: 6,
      inTangentTime: -0.10947718556525808,
      inTangentValue: 41.24447753704461,
      outTangentTime: 0.55658033759811665,
      outTangentValue: -171.58681348977461,
    },
  ]
};

// Test: constant/linear curves
const constantCurve: Curve = {
  type: 1,
  default: 42,
  keyframes: [
    { time: { value: 0, timescale: 1 }, value: 100, interpolation: 0 },
    { time: { value: 1, timescale: 1 }, value: 200, interpolation: 0 },
  ]
};

const linearCurve: Curve = {
  type: 1,
  default: 0,
  keyframes: [
    { time: { value: 0, timescale: 1 }, value: 0, interpolation: 1 },
    { time: { value: 1, timescale: 1 }, value: 100, interpolation: 1 },
  ]
};

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Curve evaluator tests:\n');

  // Constant interpolation
  test('constant: holds value', () => {
    assertClose(evaluateCurve(constantCurve, 0.5), 100, 0.001, 'mid constant');
  });
  test('constant: before first', () => {
    assertClose(evaluateCurve(constantCurve, -1), 100, 0.001, 'before');
  });
  test('constant: after last', () => {
    assertClose(evaluateCurve(constantCurve, 2), 200, 0.001, 'after');
  });

  // Linear interpolation
  test('linear: start', () => {
    assertClose(evaluateCurve(linearCurve, 0), 0, 0.001, 'start');
  });
  test('linear: mid', () => {
    assertClose(evaluateCurve(linearCurve, 0.5), 50, 0.001, 'mid');
  });
  test('linear: end', () => {
    assertClose(evaluateCurve(linearCurve, 1.0), 100, 0.001, 'end');
  });
  test('linear: quarter', () => {
    assertClose(evaluateCurve(linearCurve, 0.25), 25, 0.001, 'quarter');
  });

  // Empty curve
  test('empty: returns default', () => {
    const empty: Curve = { type: 1, default: 99, keyframes: [] };
    assertClose(evaluateCurve(empty, 0.5), 99, 0.001, 'empty default');
  });

  // Single keyframe
  test('single keyframe: always that value', () => {
    const single: Curve = { type: 1, default: 0, keyframes: [
      { time: { value: 60000, timescale: 120000 }, value: 42, interpolation: 1 }
    ]};
    assertClose(evaluateCurve(single, 0), 42, 0.001, 'single');
    assertClose(evaluateCurve(single, 1), 42, 0.001, 'single late');
  });

  // Bezier: Push X keyframes
  test('bezier: Push X at t=0 → 0', () => {
    assertClose(evaluateCurve(pushXCurve, 0), 0, 0.1, 'push t=0');
  });
  test('bezier: Push X at end → -1920', () => {
    const endTime = 200200 / 120000;
    assertClose(evaluateCurve(pushXCurve, endTime), -1920, 0.1, 'push t=end');
  });
  test('bezier: Push X mid is between 0 and -1920', () => {
    const midTime = 96096 / 120000;
    const val = evaluateCurve(pushXCurve, midTime);
    if (val > 0 || val < -1920) throw new Error(`mid value ${val} out of range`);
    assertClose(val, -1084.43, 1, 'push mid');
  });
  test('bezier: Push X is monotonically decreasing', () => {
    let prev = 0;
    for (let i = 1; i <= 20; i++) {
      const t = (i / 20) * (200200 / 120000);
      const v = evaluateCurve(pushXCurve, t);
      if (v > prev + 1) throw new Error(`not monotonic at t=${t}: ${v} > ${prev}`);
      prev = v;
    }
  });

  // timeToSeconds
  test('timeToSeconds: standard', () => {
    assertClose(timeToSeconds({ value: 120000, timescale: 120000 }), 1.0, 0.0001, 'tts');
  });
  test('timeToSeconds: zero timescale', () => {
    assertClose(timeToSeconds({ value: 100, timescale: 0 }), 0, 0.0001, 'tts zero');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
