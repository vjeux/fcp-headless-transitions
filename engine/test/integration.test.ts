// ImageData polyfill for Node.js
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}

/**
 * Integration test: loads Push.motr, renders at multiple progress values,
 * and verifies the output is non-trivial (not all black/transparent).
 */
import { createTransition } from '../src/index.js';
import fs from 'node:fs';
import path from 'node:path';

const PUSH_PATH = path.resolve('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Push.localized/Push.motr');

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }

  console.log('Integration tests (Push.motr):\n');

  const xml = fs.readFileSync(PUSH_PATH, 'utf-8');
  const transition = createTransition(xml);

  test('createTransition returns correct dimensions', () => {
    assert(transition.width === 1920, `width ${transition.width}`);
    assert(transition.height === 1080, `height ${transition.height}`);
  });

  // Create solid-color test images (red for A, blue for B)
  const w = 1920, h = 1080;
  const imgA = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  const imgB = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < w * h * 4; i += 4) {
    imgA.data[i] = 200; imgA.data[i+1] = 100; imgA.data[i+2] = 50; imgA.data[i+3] = 255;
    imgB.data[i] = 50; imgB.data[i+1] = 100; imgB.data[i+2] = 200; imgB.data[i+3] = 255;
  }

  test('render at progress=0 returns valid ImageData', () => {
    const frame = transition.render(imgA, imgB, 0);
    assert(frame.width === w, `width ${frame.width}`);
    assert(frame.height === h, `height ${frame.height}`);
    assert(frame.data.length === w * h * 4, `data length ${frame.data.length}`);
  });

  test('render at progress=0.5 returns valid ImageData', () => {
    const frame = transition.render(imgA, imgB, 0.5);
    assert(frame.width === w, 'bad width');
    assert(frame.data.length === w * h * 4, 'bad data length');
  });

  test('render at progress=0 has some non-zero pixels', () => {
    const frame = transition.render(imgA, imgB, 0);
    let nonZero = 0;
    for (let i = 0; i < frame.data.length; i += 4) {
      if (frame.data[i] > 0 || frame.data[i+1] > 0 || frame.data[i+2] > 0) nonZero++;
    }
    // The transition should show SOMETHING at t=0 (source A visible)
    assert(nonZero > 0, `all black (${nonZero} non-zero pixels)`);
  });

  test('render at progress=0.5 has non-trivial output', () => {
    const frame = transition.render(imgA, imgB, 0.5);
    let nonZero = 0;
    for (let i = 0; i < frame.data.length; i += 4) {
      if (frame.data[i] > 0 || frame.data[i+1] > 0 || frame.data[i+2] > 0) nonZero++;
    }
    assert(nonZero > 0, `all black at t=0.5`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
