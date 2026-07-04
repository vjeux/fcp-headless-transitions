/**
 * Tests for shape/mask rasterization.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { rasterizeShape, applyMask, unionMasks } from '../src/compositor/shapes.js';
import type { Shape } from '../src/types.js';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Shape rasterization tests:\n');

  // A centered square: 100x100 in a 200x200 frame
  const square: Shape = {
    verticesX: [-50, -50, 50, 50],
    verticesY: [-50, 50, 50, -50],
    closed: true,
    isMask: true,
  };

  test('rasterize square: center is filled', () => {
    const mask = rasterizeShape(square, 200, 200);
    const centerIdx = 100 * 200 + 100; // center pixel
    assert(mask[centerIdx] === 255, `center not filled (${mask[centerIdx]})`);
  });

  test('rasterize square: corner is empty', () => {
    const mask = rasterizeShape(square, 200, 200);
    const cornerIdx = 5 * 200 + 5; // near top-left
    assert(mask[cornerIdx] === 0, `corner filled (${mask[cornerIdx]})`);
  });

  test('rasterize square: fills ~25% of frame', () => {
    const mask = rasterizeShape(square, 200, 200);
    let filled = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i] > 0) filled++;
    const pct = filled / (200 * 200) * 100;
    // 100x100 square in 200x200 = 25%
    assert(pct > 20 && pct < 30, `filled ${pct.toFixed(1)}% (expected ~25%)`);
  });

  test('rasterize: degenerate (< 3 vertices) → empty', () => {
    const line: Shape = { verticesX: [0, 10], verticesY: [0, 10], closed: false, isMask: true };
    const mask = rasterizeShape(line, 100, 100);
    let filled = 0;
    for (let i = 0; i < mask.length; i++) if (mask[i] > 0) filled++;
    assert(filled === 0, `degenerate shape filled ${filled} pixels`);
  });

  test('applyMask: masks out alpha', () => {
    const img = new ImageData(new Uint8ClampedArray(4 * 4 * 4), 4, 4);
    for (let i = 0; i < img.data.length; i += 4) { img.data[i+3] = 255; }
    const mask = new Uint8Array(16);
    mask[0] = 255; // only first pixel visible
    applyMask(img, mask);
    assert(img.data[3] === 255, 'first pixel should be visible');
    assert(img.data[7] === 0, 'second pixel should be masked out');
  });

  test('applyMask: invert', () => {
    const img = new ImageData(new Uint8ClampedArray(4 * 4 * 4), 4, 4);
    for (let i = 0; i < img.data.length; i += 4) { img.data[i+3] = 255; }
    const mask = new Uint8Array(16);
    mask[0] = 255;
    applyMask(img, mask, true); // invert
    assert(img.data[3] === 0, 'first pixel should be masked (inverted)');
    assert(img.data[7] === 255, 'second pixel should be visible (inverted)');
  });

  test('unionMasks: combines', () => {
    const m1 = new Uint8Array([255, 0, 0, 0]);
    const m2 = new Uint8Array([0, 255, 0, 0]);
    const u = unionMasks([m1, m2], 2, 2);
    assert(u[0] === 255 && u[1] === 255 && u[2] === 0, 'union failed');
  });

  test('rasterize with transform: translated square', () => {
    // Identity-ish transform that shifts by +50 in X
    const transform = new Float64Array(16);
    transform[0] = 1; transform[5] = 1; transform[10] = 1; transform[15] = 1;
    transform[12] = 50; // translate X
    const mask = rasterizeShape(square, 200, 200, transform);
    // Center of shape now at pixel x=150 (100+50), y=100
    const shiftedCenter = 100 * 200 + 150;
    assert(mask[shiftedCenter] === 255, `shifted center not filled`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
