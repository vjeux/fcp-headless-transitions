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

  // FCP's HgcLumaKeyer default curve (decoded getAlphaLuma + measured from a headless ramp
  // probe): a TRAPEZOID BAND-PASS over luma. It KEEPS shadows+mids and keys out highlights
  // AND pure black — the opposite of a simple "dark→transparent" threshold. Control points
  // A'=0.004, B'=0.067, C'=0.56, D'=1.0. RGB passes through unchanged.

  test('pure black (luma<A′) → keyed transparent', () => {
    const img = makeImg(0.0);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    assert(out.data[3] < 20, `pure black should be keyed out, alpha=${out.data[3]}`);
  });

  test('mid/shadow pixel (plateau) → fully kept', () => {
    const img = makeImg(0.3);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    assert(out.data[3] > 240, `mid should be kept (plateau), alpha=${out.data[3]}`);
  });

  test('bright highlight (luma>C′) → partially/fully keyed', () => {
    const img = makeImg(0.9);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    // luma 0.9 on the falling edge: alpha = (1-0.9)/(1-0.56) ≈ 0.227 → ~58/255
    assert(out.data[3] < 90, `highlight should be keyed down, alpha=${out.data[3]}`);
  });

  test('pure white (luma≥D′) → keyed transparent', () => {
    const img = makeImg(1.0);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    assert(out.data[3] < 20, `pure white should be keyed out, alpha=${out.data[3]}`);
  });

  test('RGB passes through unchanged (only alpha keyed)', () => {
    const img = makeImg(0.9);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    assert(out.data[0] === img.data[0] && out.data[1] === img.data[1] && out.data[2] === img.data[2],
      `RGB should be unchanged, got (${out.data[0]},${out.data[1]},${out.data[2]})`);
  });

  test('invert flips the key (bright highlight becomes more opaque)', () => {
    const img = makeImg(0.9);
    const normal = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
    const inv = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: true });
    assert(inv.data[3] > normal.data[3], `invert should raise the keyed-out highlight's alpha (${inv.data[3]} vs ${normal.data[3]})`);
  });

  test('strength=0 preserves alpha', () => {
    const img = makeImg(0.9);
    const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 0, invert: false });
    assert(out.data[3] === 255, `strength=0 should preserve alpha, got ${out.data[3]}`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
