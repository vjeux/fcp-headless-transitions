if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { bevelFilter } from '../src/compositor/filters/bevel.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('Bevel tests:\n');

  // Create a 20x20 image with a filled 10x10 square in the center (alpha edge)
  function makeSquare(): ImageData {
    const img = new ImageData(new Uint8ClampedArray(20 * 20 * 4), 20, 20);
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        const idx = (y * 20 + x) * 4;
        const inside = x >= 5 && x < 15 && y >= 5 && y < 15;
        img.data[idx] = 128; img.data[idx+1] = 128; img.data[idx+2] = 128;
        img.data[idx+3] = inside ? 255 : 0;
      }
    }
    return img;
  }

  test('bevel width=0 → no change', () => {
    const img = makeSquare();
    const orig = new Uint8ClampedArray(img.data);
    const out = bevelFilter(img, { width: 0, lightAngle: 135, opacity: 1, mix: 1 });
    let same = true;
    for (let i = 0; i < out.data.length; i++) if (out.data[i] !== orig[i]) { same = false; break; }
    assert(same, 'width=0 should not change image');
  });

  test('bevel modifies edge pixels', () => {
    const img = makeSquare();
    const out = bevelFilter(img, { width: 2, lightAngle: 135, opacity: 1, mix: 1 });
    // Some edge pixels should differ from 128 (highlight or shadow)
    let modified = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3] > 0 && out.data[i] !== 128) modified++;
    }
    assert(modified > 0, `edge pixels should be lit/shadowed, ${modified} modified`);
  });

  test('bevel preserves interior', () => {
    const img = makeSquare();
    const out = bevelFilter(img, { width: 2, lightAngle: 135, opacity: 1, mix: 1 });
    // Center pixel (10,10) should be unchanged (interior, no alpha gradient)
    const centerIdx = (10 * 20 + 10) * 4;
    assert(out.data[centerIdx] === 128, `interior should be unchanged, got ${out.data[centerIdx]}`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
