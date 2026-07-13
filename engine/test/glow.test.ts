/**
 * Glow filter unit tests (PAEGlow, UUID 73F69C87-7226-4F7A-81F2-F5E378501423).
 *
 * DECODED (2026-07-12) and verified vs headless FCP (isolated sweep 41.66 / 36.92 dB):
 *   MASK (HgcGlow): a = clamp((luma709 − Threshold)/Softness + 0.5, 0, 1); rgb·a extracted.
 *   COMBINE (HgcGlowCombineFx): out.rgb = (1 − clamp(glowA·gain))·orig + min(glow.rgb·gain, ceil).
 * These tests pin the mask ramp + combine composite (not the blur, which is covered
 * elsewhere) by using radius small enough that the decimated blur is ~identity on a flat
 * field, so the mask+combine math is what's asserted.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { glowFilter } from '../src/compositor/filters/glow.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import { luma } from '../src/compositor/blend.js';
import type { Filter } from '../src/types.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

// A flat field of a uniform gray value (opaque), so the blur is a no-op and the
// mask+combine math is directly testable.
function flat(v: number, w = 16, h = 16): ImageData {
  const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  return img;
}
function px(img: ImageData, x: number, y: number, c = 0): number { return img.data[(y * img.width + x) * 4 + c]; }

function makeGlow(radius: number, threshold: number, softness: number, opacity: number): Filter {
  return { id: 1, name: 'Glow', pluginName: 'PAEGlow',
    pluginUUID: '73F69C87-7226-4F7A-81F2-F5E378501423',
    parameters: [
      { name: 'Radius', id: 1, value: radius },
      { name: 'Opacity', id: 2, value: opacity },
      { name: 'Threshold', id: 3, value: threshold },
      { name: 'Softness', id: 4, value: softness },
    ] };
}

// Reference: mask ramp + combine, applied to a flat field (blur = identity on flat).
function expectFlat(v: number, threshold: number, softness: number, gain: number): number {
  const lum = luma(v, v, v) / 255;
  let a = softness > 0 ? (lum - threshold) / softness + 0.5 : (lum > threshold ? 1 : 0);
  a = a < 0 ? 0 : a > 1 ? 1 : a;
  const glowRGB = v * a * gain;          // premult glow rgb = v·a, gained
  let glowA = a * gain; glowA = glowA > 1 ? 1 : glowA < 0 ? 0 : glowA;
  const out = v * (1 - glowA) + glowRGB;
  return Math.max(0, Math.min(255, Math.round(out)));
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('Glow filter tests:\n');

  test('registered under its UUID', () => {
    const mod = lookupFilter(makeGlow(10, 0.5, 0.2, 1));
    assert(!!mod && mod!.label === 'Glow', 'filter found via UUID');
  });

  test('radius 0 = identity (no glow)', () => {
    const img = flat(200);
    const f = makeGlow(0, 0.5, 0.2, 1);
    const out = lookupFilter(f)!.apply(img, makeContext(f, 0, 16, 16));
    for (let i = 0; i < out.data.length; i++) assert(out.data[i] === img.data[i], 'r0 identity');
  });

  test('mask ramp: pixel far below threshold contributes nothing (a=0)', () => {
    // v=20 (lum≈0.078) with threshold 0.8, softness 0.2 -> a = (0.078-0.8)/0.2+0.5 < 0 -> 0.
    // combine: out = orig (glow adds 0).
    const out = glowFilter(flat(20), { radius: 1, threshold: 0.8, amount: 1, softness: 0.2 });
    assert(Math.abs(px(out, 8, 8) - 20) <= 1, `dark px passes through (got ${px(out,8,8)})`);
  });

  test('mask ramp: bright pixel well above threshold glows fully (a≈1)', () => {
    const v = 240, thr = 0.3, soft = 0.2, gain = 1;
    const out = glowFilter(flat(v), { radius: 1, threshold: thr, amount: gain, softness: soft });
    const exp = expectFlat(v, thr, soft, gain);
    assert(Math.abs(px(out, 8, 8) - exp) <= 2, `bright glow matches combine model (got ${px(out,8,8)} exp ${exp})`);
  });

  test('soft ramp midpoint: a≈0.5 at luma==threshold', () => {
    // choose v so luma≈0.5 -> v≈127.5; threshold 0.5, softness 0.4 => a = 0 + 0.5 = 0.5
    const v = 128, thr = 0.5, soft = 0.4, gain = 1;
    const out = glowFilter(flat(v), { radius: 1, threshold: thr, amount: gain, softness: soft });
    const exp = expectFlat(v, thr, soft, gain);
    assert(Math.abs(px(out, 8, 8) - exp) <= 2, `midpoint matches (got ${px(out,8,8)} exp ${exp})`);
  });

  test('softness 0 = hard step (below vs above threshold)', () => {
    // v=100 lum≈0.39; threshold 0.5 -> below -> a=0 -> passthrough
    const below = glowFilter(flat(100), { radius: 1, threshold: 0.5, amount: 1, softness: 0 });
    assert(Math.abs(px(below, 8, 8) - 100) <= 1, `below-threshold passthrough (got ${px(below,8,8)})`);
    // v=200 lum≈0.78; threshold 0.5 -> above -> a=1
    const above = glowFilter(flat(200), { radius: 1, threshold: 0.5, amount: 1, softness: 0 });
    const exp = expectFlat(200, 0.5, 0, 1);
    assert(Math.abs(px(above, 8, 8) - exp) <= 2, `above-threshold glows (got ${px(above,8,8)} exp ${exp})`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
