/**
 * HSV Adjust (PAEHSVAdjust, UUID D23AF030-B0BF-44DF-B622-7C9EA0DF5744) unit tests.
 *
 * Pins the DECODED FCP semantics (from -[PAEHSVAdjust canThrowRenderOutput] + the
 * verbatim HgcHSVAdjust shader, tools/re/extract_shader.py):
 *   • Hue is in DEGREES — internal turns = Hue/360 (decoded @0x372f4-0x37350: FCP wraps
 *     to [0,360] then hg_Params[0].x = Hue/360 + 1.0, the +1 a no-op inside frac()).
 *   • Saturation is 0-CENTERED: lerp toward Rec.709 gray by (1 + Saturation); -1 = gray.
 *   • Value is a MULTIPLIER applied SQUARED: out.rgb *= Value^2.
 *   • Identity = (Hue 0, Sat 0, Value 1).
 * Saturation/Value/grayscale are verified vs headless FCP at 39-48 dB (filter_sweep).
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { hueSaturationFilter } from '../src/compositor/filters/hue-saturation.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import type { Filter } from '../src/types.js';
import {
  setLinearCompositeEnabled, isLinearCompositeEnabled,
  linearChannelToSrgb, srgbChannelToLinear,
} from '../src/compositor/linear.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

function solid(r: number, g: number, b: number, w = 4, h = 4): ImageData {
  const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
  }
  return img;
}
const px = (im: ImageData, c = 0) => im.data[c];

function makeHSV(hue: number, saturation: number, value: number): Filter {
  return { id: 1, name: 'HSV Adjust', pluginName: 'PAEHSVAdjust',
    pluginUUID: 'D23AF030-B0BF-44DF-B622-7C9EA0DF5744',
    parameters: [
      { name: 'Hue', id: 1, value: hue },
      { name: 'Saturation', id: 2, value: saturation },
      { name: 'Value', id: 3, value: value },
      { name: 'Mix', id: 10001, value: 1 },
    ] };
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  \u2713 ${name}`); pass++; }
    catch (e: any) { console.log(`  \u2717 ${name}: ${e.message}`); fail++; }
  }
  console.log('HSV Adjust filter tests:\n');

  test('registered under its UUID', () => {
    const mod = lookupFilter(makeHSV(0, 0, 1));
    assert(!!mod && mod!.label === 'HSV Adjust', 'filter found via UUID');
  });

  test('identity (Hue 0, Sat 0, Value 1) = passthrough', () => {
    const img = solid(180, 90, 40);
    const out = hueSaturationFilter(img, { hue: 0, saturation: 0, value: 1, mix: 1 });
    for (let i = 0; i < out.data.length; i++) assert(out.data[i] === img.data[i], 'identity');
  });

  // HUE UNIT = RADIANS (corrected 2026-07-22 via fct/parity transfer probe against REAL FCP:
  // a red input Hue=2π/3 rad rotates to GREEN, while Hue=120 read as degrees is ~identity —
  // 120 rad mod 2π ≈ 0.09 rad. So turns = hue/(2π).). These tests were previously asserting a
  // DEGREES convention that the node-boundary oracle refuted.
  test('Hue is in RADIANS: Hue=2π is a full turn = identity', () => {
    const out = hueSaturationFilter(solid(200, 50, 50), { hue: 2 * Math.PI, saturation: 0, value: 1, mix: 1 });
    assert(Math.abs(px(out, 0) - 200) <= 1 && Math.abs(px(out, 1) - 50) <= 1 && Math.abs(px(out, 2) - 50) <= 1,
      `Hue=2π identity (got ${px(out,0)},${px(out,1)},${px(out,2)})`);
  });

  test('Hue=2π/3 rad rotates red -> green (RGB cycle by 1/3 turn)', () => {
    const out = hueSaturationFilter(solid(255, 0, 0), { hue: 2 * Math.PI / 3, saturation: 0, value: 1, mix: 1 });
    assert(px(out, 0) < 20 && px(out, 1) > 235 && px(out, 2) < 20,
      `red+2π/3 rad -> green (got ${px(out,0)},${px(out,1)},${px(out,2)})`);
  });

  test('Hue=0.25 rad is a modest rotation (keeps red dominant, NOT a full swing)', () => {
    const out = hueSaturationFilter(solid(200, 50, 50), { hue: 0.25, saturation: 0, value: 1, mix: 1 });
    assert(px(out, 0) > 150, `0.25 rad keeps red dominant (got R=${px(out,0)})`);
  });

  test('Saturation=-1 = grayscale (Rec.709 luma on all channels)', () => {
    const out = hueSaturationFilter(solid(200, 100, 40), { hue: 0, saturation: -1, value: 1, mix: 1 });
    const gray = Math.round(0.2125 * 200 + 0.7154 * 100 + 0.0721 * 40);
    assert(Math.abs(px(out, 0) - gray) <= 1 && Math.abs(px(out, 1) - gray) <= 1 && Math.abs(px(out, 2) - gray) <= 1,
      `grayscale = luma709 ${gray} (got ${px(out,0)},${px(out,1)},${px(out,2)})`);
  });

  test('Value is a squared multiplier: Value=0.5 -> *0.25', () => {
    const out = hueSaturationFilter(solid(200, 100, 40), { hue: 0, saturation: 0, value: 0.5, mix: 1 });
    assert(Math.abs(px(out, 0) - 50) <= 1 && Math.abs(px(out, 1) - 25) <= 1 && Math.abs(px(out, 2) - 10) <= 1,
      `Value^2 = 0.25x (got ${px(out,0)},${px(out,1)},${px(out,2)})`);
  });

  test('apply() via registry: grayscale + darken (Objects__Leaves-like)', () => {
    const f = makeHSV(0, -1, 0.65);
    const out = lookupFilter(f)!.apply(solid(200, 100, 40), makeContext(f, 0, 4, 4));
    const gray = 0.2125 * 200 + 0.7154 * 100 + 0.0721 * 40;
    const exp = Math.round(gray * 0.65 * 0.65);
    assert(Math.abs(px(out, 0) - exp) <= 2, `grayscale*Value^2 (got ${px(out,0)} exp ${exp})`);
  });

  // ----- LINEAR WORKING-SPACE MIGRATION (T-D2d) -----
  // The flag defaults OFF. These tests toggle it under try/finally so the module state
  // is restored to the shipping default — cross-test isolation.

  test('linear-mode flag defaults OFF (T-D1 safety contract)', () => {
    assert(isLinearCompositeEnabled() === false, 'flag off by default');
  });

  test('linear-mode: identity params still pass through', () => {
    setLinearCompositeEnabled(true);
    try {
      const img = solid(180, 90, 40);
      const out = hueSaturationFilter(img, { hue: 0, saturation: 0, value: 1, mix: 1 });
      for (let i = 0; i < out.data.length; i++) assert(out.data[i] === img.data[i], 'identity even in linear');
    } finally { setLinearCompositeEnabled(false); }
  });

  test('linear-mode: Value=0.5 dims light in LINEAR (physically correct midtone)', () => {
    // Legacy sRGB-as-linear path on sRGB 188 with V=0.5:
    //   (188/255) * 0.25 = 0.184 → sRGB 47
    // Linear path on sRGB 188 with V=0.5:
    //   decode 188 → linear ~0.502, *0.25 = 0.126, encode → sRGB ~99
    // The two disagree by ~50 codes, and the linear result matches the FCP shader's
    // linear working-space semantics (Value is a photon multiplier in linear light).
    const legacy = hueSaturationFilter(solid(188, 188, 188), { hue: 0, saturation: 0, value: 0.5, mix: 1 });
    setLinearCompositeEnabled(true);
    let lin: ImageData;
    try { lin = hueSaturationFilter(solid(188, 188, 188), { hue: 0, saturation: 0, value: 0.5, mix: 1 }); }
    finally { setLinearCompositeEnabled(false); }
    // Sanity: the two paths give measurably different answers on this input.
    assert(Math.abs(px(legacy) - px(lin)) >= 20, `legacy vs linear must differ ≥20 codes (legacy=${px(legacy)} lin=${px(lin)})`);
    // Predicted linear result: encode(srgbToLinear(188) * 0.25).
    const exp = linearChannelToSrgb(srgbChannelToLinear(188) * 0.25);
    assert(Math.abs(px(lin) - exp) <= 1, `linear V=0.5 on sRGB 188 → sRGB ${exp} (got ${px(lin)})`);
  });

  test('linear-mode: Saturation=-1 grayscale = luma709 of LINEAR RGB, encoded to sRGB', () => {
    setLinearCompositeEnabled(true);
    let out: ImageData;
    try { out = hueSaturationFilter(solid(200, 100, 40), { hue: 0, saturation: -1, value: 1, mix: 1 }); }
    finally { setLinearCompositeEnabled(false); }
    // Predicted: gray = luma709(linear(200), linear(100), linear(40)); encode(gray).
    const rL = srgbChannelToLinear(200), gL = srgbChannelToLinear(100), bL = srgbChannelToLinear(40);
    const gray = 0.2125 * rL + 0.7154 * gL + 0.0721 * bL;
    const exp = linearChannelToSrgb(gray);
    assert(Math.abs(px(out, 0) - exp) <= 1 && Math.abs(px(out, 1) - exp) <= 1 && Math.abs(px(out, 2) - exp) <= 1,
      `linear grayscale = sRGB ${exp} (got ${px(out,0)},${px(out,1)},${px(out,2)})`);
    // Sanity: linear grayscale differs from the gamma-space grayscale — it's usually
    // DARKER because the sRGB→linear→luma→sRGB round trip preserves relative light,
    // while gamma-space luma over-weights the encoded reds.
    const gamma = Math.round(0.2125 * 200 + 0.7154 * 100 + 0.0721 * 40);
    assert(Math.abs(px(out, 0) - gamma) >= 3, `linear and gamma grayscales must differ (linear=${px(out,0)} gamma=${gamma})`);
  });

  test('linear-mode: flag OFF path is BYTE-IDENTICAL after toggle (isolation)', () => {
    const img = solid(200, 100, 40);
    const params = { hue: 0, saturation: -1, value: 0.65, mix: 1 };
    const before = hueSaturationFilter(img, params);
    setLinearCompositeEnabled(true);
    try { hueSaturationFilter(img, params); /* burn once in linear */ }
    finally { setLinearCompositeEnabled(false); }
    const after = hueSaturationFilter(img, params);
    for (let i = 0; i < before.data.length; i++) {
      assert(before.data[i] === after.data[i], `flag-off byte-identical (i=${i} before=${before.data[i]} after=${after.data[i]})`);
    }
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
