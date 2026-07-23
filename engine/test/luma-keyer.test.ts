if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { lumaKeyerFilter } from '../src/compositor/filters/luma-keyer.js';
import fs from 'node:fs';
import path from 'node:path';

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

  // FCP's HgcLumaKeyer default curve — DECODED (2026-07-23) as a LINEAR band-pass TRAPEZOID
  // in the gamma-1.958 WORKING SPACE (xw = luma^0.51117), NOT a smoothstep in code space.
  // WS control points B=1/4, C=3/4, D=1 (rms 0.37 vs headless FCP). It KEEPS shadows+mids
  // and keys out highlights AND pure black. RGB passes through unchanged.

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
    // luma 0.9 → xw=0.9^0.51117=0.949, falling edge: alpha=(1-0.949)/0.25≈0.21 → ~53/255
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

  // NODE-BOUNDARY golden: the engine's keyed alpha must match REAL headless FCP across the
  // full luma ramp (evidence/luma_keyer_alpha_ramp.json — 88 samples captured from the
  // shipping default keyer blob). This is the alpha analogue of the colour-node golden and
  // catches the gate-invisible alpha bug the RGB-only 65-slug PSNR gate can never see.
  test('alpha ramp matches REAL headless FCP (node-boundary, ≤2 levels)', () => {
    const ev = JSON.parse(fs.readFileSync(
      path.resolve(import.meta.dirname, '../src/compositor/filters/evidence/luma_keyer_alpha_ramp.json'), 'utf-8'));
    let worst = 0, worstAt = -1;
    for (const { luma_in, alpha_out } of ev.rows as { luma_in: number; alpha_out: number }[]) {
      const img = makeImg(luma_in / 255);
      const out = lumaKeyerFilter(img, { luma: 0.5, rolloff: 0.1, strength: 1, invert: false });
      const err = Math.abs(out.data[3] - alpha_out);
      if (err > worst) { worst = err; worstAt = luma_in; }
    }
    assert(worst <= 2, `keyed alpha diverges from headless FCP by ${worst.toFixed(2)} levels at luma_in=${worstAt} (want ≤2)`);
    console.log(`    (alpha ramp: worst ${worst.toFixed(2)} lvl vs headless FCP over ${ev.rows.length} samples)`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
