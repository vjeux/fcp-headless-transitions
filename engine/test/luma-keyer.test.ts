if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { lumaKeyerFilter } from '../src/compositor/filters/luma-keyer.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('Luma Keyer tests:\n');

  function makeImg(lum: number): ImageData {
    const img = new ImageData(new Uint8ClampedArray(4), 1, 1);
    const v = Math.round(lum * 255);
    img.data[0] = v; img.data[1] = v; img.data[2] = v; img.data[3] = 255;
    return img;
  }

  test('dark pixel below threshold → keyed transparent', () => {
    const img = makeImg(0.1);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    assert(out.data[3] < 50, `dark should be keyed, alpha=${out.data[3]}`);
  });

  test('bright pixel above threshold → visible', () => {
    const img = makeImg(0.9);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    assert(out.data[3] > 200, `bright should be visible, alpha=${out.data[3]}`);
  });

  test('invert flips the key', () => {
    const img = makeImg(0.1);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: true });
    assert(out.data[3] > 200, `inverted: dark should be visible, alpha=${out.data[3]}`);
  });

  test('strength=0 preserves alpha', () => {
    const img = makeImg(0.1);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 0, invert: false });
    assert(out.data[3] === 255, `strength=0 should preserve alpha, got ${out.data[3]}`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
