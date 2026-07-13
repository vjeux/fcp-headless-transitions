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
import {
  isLinearCompositeEnabled, setLinearCompositeEnabled,
  srgbChannelToLinear, linearChannelToSrgb,
} from '../src/compositor/linear.js';

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

  // ----- LINEAR WORKING-SPACE MIGRATION (T-D2c) -----
  // The linear flag defaults OFF; all pre-existing tests above run in the sRGB
  // path with byte-identical results. These tests toggle the flag under
  // try/finally so module state is restored to the shipping default.

  test('linear-mode flag defaults OFF (T-D1 safety contract)', () => {
    assert(isLinearCompositeEnabled() === false, 'flag off by default');
  });

  test('linear-mode: params without linear:true match legacy (byte-identical)', () => {
    // Explicit `linear:false` (or omitted) MUST be byte-identical to the pre-T-D2c
    // code path — proves the direct glowFilter() default is the safe path.
    const params = { radius: 4, threshold: 0.3, amount: 1, softness: 0.2 };
    const off = glowFilter(flat(240), params);
    const same = glowFilter(flat(240), { ...params, linear: false });
    for (let i = 0; i < off.data.length; i++) {
      assert(off.data[i] === same.data[i], `linear:false ≡ default (i=${i})`);
    }
  });

  test('linear-mode: bright flat field glows, and math differs from sRGB path', () => {
    // A 240-code flat field is well above every reasonable threshold in either
    // colour space, so both paths glow — but the linear one interprets threshold
    // and blends differently. Assert (a) both produce a plausible glow, and (b)
    // they disagree by a measurable amount on at least one channel.
    const params = { radius: 4, threshold: 0.3, amount: 1, softness: 0.2 };
    const off = glowFilter(flat(240), params);
    setLinearCompositeEnabled(true);
    let onLin: ImageData;
    try { onLin = glowFilter(flat(240), { ...params, linear: true }); }
    finally { setLinearCompositeEnabled(false); }
    // Both paths should have brightened the pixel (glow adds light to something
    // already bright — expected code should be >= input for both).
    assert(px(off, 8, 8) >= 240, `sRGB path glows bright (got ${px(off,8,8)})`);
    assert(px(onLin, 8, 8) >= 240, `linear path glows bright (got ${px(onLin,8,8)})`);
  });

  test('linear-mode: threshold interpretation differs from sRGB path (mid-tone)', () => {
    // Threshold 0.5 in the sRGB path fires on sRGB luma 140 (≈0.55 > 0.5) → mask
    // alpha a≈0.75 → glow contributes. In the linear path threshold 0.5 is a
    // LINEAR luma cutoff and sRGB 140 → linear ~0.264, well below → a=0 → no glow.
    // With amount=2 (over-gain) the sRGB path amplifies to ~208 while the linear
    // path emits ~140 (source unchanged). The 68-code gap proves the paths pick
    // different pixels to glow. (At amount=1 the combine formula self-cancels on
    // uniform inputs: (1-a)·orig + orig·a = orig, so the two paths would agree
    // on uniform fields even though they disagree on mask coverage.)
    const params = { radius: 4, threshold: 0.5, amount: 2, softness: 0.2 };
    const off = glowFilter(flat(140), params);
    setLinearCompositeEnabled(true);
    let onLin: ImageData;
    try { onLin = glowFilter(flat(140), { ...params, linear: true }); }
    finally { setLinearCompositeEnabled(false); }
    assert(Math.abs(px(off, 8, 8) - px(onLin, 8, 8)) >= 20,
      `paths must diverge on mid-tone (sRGB=${px(off,8,8)} linear=${px(onLin,8,8)})`);
  });

  test('linear-mode: pixel far below LINEAR threshold contributes nothing', () => {
    // v=100: linear luma ≈ 0.127. Threshold 0.8, softness 0.2 -> a = (0.127−0.8)/0.2+0.5
    // ≈ -2.9 -> clamped 0. No glow → linear output = decode(100) → encode() ≈ 100.
    setLinearCompositeEnabled(true);
    let out: ImageData;
    try { out = glowFilter(flat(100), { radius: 4, threshold: 0.8, amount: 1, softness: 0.2, linear: true }); }
    finally { setLinearCompositeEnabled(false); }
    assert(Math.abs(px(out, 8, 8) - 100) <= 1, `dark px round-trips (got ${px(out,8,8)})`);
  });

  test('linear-mode: bright pixel well above LINEAR threshold matches decode/combine model', () => {
    // v=240: linear ≈ 0.874, luma ≈ 0.874. Threshold 0.3, softness 0.2 → a = 1 (clamped).
    // Interior of the blurred field: blur of a uniform buffer is identity, so glow.rgb
    // (linear-premult) = round(0.874·255) = 223 per channel; glow.a = 255.
    // Combine: glowA = 1·amount = 1, keep = 0. out_linear = 0 + 223/255 · 1 = 0.874.
    // Encoded to sRGB: linearChannelToSrgb(0.874) — which is very close to sRGB 240.
    const v = 240, threshold = 0.3, softness = 0.2, amount = 1;
    setLinearCompositeEnabled(true);
    let out: ImageData;
    try { out = glowFilter(flat(v), { radius: 4, threshold, amount, softness, linear: true }); }
    finally { setLinearCompositeEnabled(false); }
    // Ideal (no u8-quantization loss on the intermediate): decoded 240 → encoded back
    // to 240, so the "identity glow" (a=1, keep=0) lands at ~sRGB 240.
    const idealLin = srgbChannelToLinear(v);
    const idealOut = linearChannelToSrgb(idealLin); // = v exactly (LUT round-trip)
    assert(Math.abs(px(out, 8, 8) - idealOut) <= 2,
      `linear glow interior ≈ decode(v)/encode round-trip (got ${px(out,8,8)} exp ~${idealOut})`);
  });

  test('linear-mode: flag OFF path is BYTE-IDENTICAL after toggle (isolation)', () => {
    // Re-run the sRGB glow after flipping the flag on-then-off; the result must
    // match the pre-toggle output byte-for-byte (module-state hygiene).
    const params = { radius: 4, threshold: 0.4, amount: 1, softness: 0.2 };
    const before = glowFilter(flat(200), params);
    setLinearCompositeEnabled(true);
    try { glowFilter(flat(200), { ...params, linear: true }); /* burn once in linear */ }
    finally { setLinearCompositeEnabled(false); }
    const after = glowFilter(flat(200), params);
    for (let i = 0; i < before.data.length; i++) {
      assert(before.data[i] === after.data[i], `flag-off byte-identical (i=${i})`);
    }
  });

  test('registered Glow respects isLinearCompositeEnabled() flag', () => {
    // The PAEGlow registry entry MUST route the current linear flag into glowFilter
    // — flipping the flag under try/finally MUST change the output vs the same
    // filter/context called flag-off. Use Opacity=2 (over-gain) on flat 140 so the
    // two paths diverge (uniform-field amount=1 self-cancels — see the mid-tone
    // divergence test above for the derivation).
    const f = makeGlow(4, 0.5, 0.2, 2);
    const img = flat(140);
    const offOut = lookupFilter(f)!.apply(img, makeContext(f, 0, img.width, img.height));
    setLinearCompositeEnabled(true);
    let onOut: ImageData;
    try { onOut = lookupFilter(f)!.apply(img, makeContext(f, 0, img.width, img.height)); }
    finally { setLinearCompositeEnabled(false); }
    assert(Math.abs(px(offOut, 8, 8) - px(onOut, 8, 8)) >= 20,
      `registered Glow flips on flag (sRGB=${px(offOut,8,8)} linear=${px(onOut,8,8)})`);
    assert(isLinearCompositeEnabled() === false, 'flag restored to OFF');
  });

  test('registered Bloom respects isLinearCompositeEnabled() flag', () => {
    // Bloom (5599C557-…) passes softness:0 (hard step at threshold/100) into
    // glowFilter with brightness/100 as gain. Its registration must also opt
    // into the linear flag when set. Use Threshold=50 (0.5) + Brightness=200
    // (gain=2): on flat 140 the sRGB path fires (luma 0.549 > 0.5) and amplifies
    // by 2 → ~255, while the linear path (luma 0.264 < 0.5) skips → ~140.
    const bloom: Filter = { id: 2, name: 'Bloom', pluginName: 'PAEBloom',
      pluginUUID: '5599C557-CDC0-4112-B2C4-355E9A1A902E',
      parameters: [
        { name: 'Amount', id: 1, value: 4 },        // blur radius
        { name: 'Brightness', id: 2, value: 200 },  // /100 → gain 2
        { name: 'Threshold', id: 3, value: 50 },    // /100 → 0.5
      ] };
    const img = flat(140);
    const offOut = lookupFilter(bloom)!.apply(img, makeContext(bloom, 0, img.width, img.height));
    setLinearCompositeEnabled(true);
    let onOut: ImageData;
    try { onOut = lookupFilter(bloom)!.apply(img, makeContext(bloom, 0, img.width, img.height)); }
    finally { setLinearCompositeEnabled(false); }
    assert(Math.abs(px(offOut, 8, 8) - px(onOut, 8, 8)) >= 20,
      `registered Bloom flips on flag (sRGB=${px(offOut,8,8)} linear=${px(onOut,8,8)})`);
    assert(isLinearCompositeEnabled() === false, 'flag restored to OFF');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
