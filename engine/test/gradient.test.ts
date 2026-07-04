/**
 * Tests for the gradient generator.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { renderGradient } from '../src/compositor/filters/gradient.js';

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

  console.log('Gradient tests:\n');

  const blackToWhite = {
    type: 'linear' as const,
    stops: [
      { position: 0, r: 0, g: 0, b: 0, a: 1 },
      { position: 1, r: 255, g: 255, b: 255, a: 1 },
    ],
    startX: 0, startY: 0, endX: 0, endY: 0, angle: 0, // horizontal (0° = right)
  };

  test('linear: renders full-size buffer', () => {
    const g = renderGradient(blackToWhite, 100, 50);
    assert(g.width === 100 && g.height === 50, 'wrong size');
  });

  test('linear: left edge dark, right edge light (0° angle)', () => {
    const g = renderGradient(blackToWhite, 100, 50);
    const leftIdx = (25 * 100 + 2) * 4;
    const rightIdx = (25 * 100 + 97) * 4;
    assert(g.data[leftIdx] < g.data[rightIdx], `left (${g.data[leftIdx]}) should be darker than right (${g.data[rightIdx]})`);
  });

  test('linear: center is mid-gray', () => {
    const g = renderGradient(blackToWhite, 100, 50);
    const centerIdx = (25 * 100 + 50) * 4;
    assertClose(g.data[centerIdx], 127, 20, 'center gray');
  });

  test('radial: center is first stop', () => {
    const radial = { ...blackToWhite, type: 'radial' as const };
    const g = renderGradient(radial, 100, 100);
    const centerIdx = (50 * 100 + 50) * 4;
    assert(g.data[centerIdx] < 50, `center should be dark (first stop), got ${g.data[centerIdx]}`);
  });

  test('radial: corner is last stop', () => {
    const radial = { ...blackToWhite, type: 'radial' as const };
    const g = renderGradient(radial, 100, 100);
    const cornerIdx = (2 * 100 + 2) * 4;
    assert(g.data[cornerIdx] > 200, `corner should be light (last stop), got ${g.data[cornerIdx]}`);
  });

  test('multi-stop gradient', () => {
    const multi = {
      type: 'linear' as const,
      stops: [
        { position: 0, r: 255, g: 0, b: 0, a: 1 },
        { position: 0.5, r: 0, g: 255, b: 0, a: 1 },
        { position: 1, r: 0, g: 0, b: 255, a: 1 },
      ],
      startX: 0, startY: 0, endX: 0, endY: 0, angle: 0,
    };
    const g = renderGradient(multi, 100, 10);
    const centerIdx = (5 * 100 + 50) * 4;
    // Center should be green-ish
    assert(g.data[centerIdx + 1] > 200, `center should be green, got g=${g.data[centerIdx+1]}`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
