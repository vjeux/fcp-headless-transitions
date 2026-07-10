/**
 * Fill filter unit tests (UUID 47D6B897-5749-4A6A-B93B-00FABCF72B25).
 *
 * The real "Fill" FxPlug plugin does not load in the headless FCP render harness
 * (it exits without producing frames, the same class of failure as the 360°
 * reorient plugins used by its two host transitions — verified via
 * the headless renderer producing all-zero frames). So Fill is validated here
 * with deterministic unit tests on the documented Motion "Fill" (Color mode)
 * semantics: recolor each pixel's RGB toward the solid Color by Mix, preserving
 * alpha. Gradient mode (Fill With = 1) is unused by the shipping templates.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { fillFilter } from '../src/compositor/filters/fill.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import type { Filter } from '../src/types.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

// A small image: gray RGB, half opaque / half transparent.
function makeImg(): ImageData {
  const w = 8, h = 8;
  const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    img.data[i] = 100; img.data[i + 1] = 120; img.data[i + 2] = 140;
    img.data[i + 3] = x < 4 ? 255 : 0; // left opaque, right transparent
  }
  return img;
}

// Build a Fill filter (Color mode) matching the .motr param block.
function makeFillFilter(r: number, g: number, b: number, mix: number, fillWith = 0): Filter {
  return {
    id: 1,
    pluginName: 'Fill',
    pluginUUID: '47D6B897-5749-4A6A-B93B-00FABCF72B25',
    parameters: [
      { name: 'Fill With', id: 1, value: fillWith },
      { name: 'Color', id: 2, children: [
        { name: 'Red', id: 1, value: r },
        { name: 'Green', id: 2, value: g },
        { name: 'Blue', id: 3, value: b },
      ] },
      { name: 'Mix', id: 10001, value: mix },
    ],
  };
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('Fill filter tests:\n');

  test('registered under its UUID', () => {
    const mod = lookupFilter(makeFillFilter(1, 0, 0, 1));
    assert(!!mod, 'filter should be found via UUID');
    assert(mod!.label === 'Fill', `label should be Fill, got ${mod!.label}`);
  });

  test('registered under name "fill" (fallback)', () => {
    const f: Filter = { id: 2, pluginName: 'Fill', pluginUUID: '', parameters: [] };
    assert(!!lookupFilter(f), 'name fallback should resolve Fill');
  });

  test('Mix=1 red fully recolors RGB, preserves alpha', () => {
    const out = fillFilter(makeImg(), { r: 1, g: 0, b: 0, mix: 1 });
    // opaque pixel (0,0)
    assert(out.data[0] === 255, `R should be 255, got ${out.data[0]}`);
    assert(out.data[1] === 0, `G should be 0, got ${out.data[1]}`);
    assert(out.data[2] === 0, `B should be 0, got ${out.data[2]}`);
    assert(out.data[3] === 255, `alpha preserved (opaque), got ${out.data[3]}`);
    // transparent pixel (x=4,y=0) — alpha stays 0
    const ti = 4 * 4;
    assert(out.data[ti + 3] === 0, `alpha preserved (transparent), got ${out.data[ti + 3]}`);
    assert(out.data[ti] === 255, `RGB recolored even under 0 alpha, got ${out.data[ti]}`);
  });

  test('Mix=0 leaves input unchanged', () => {
    const img = makeImg();
    const out = fillFilter(img, { r: 1, g: 0, b: 0, mix: 0 });
    for (let i = 0; i < out.data.length; i++) {
      assert(out.data[i] === img.data[i], `pixel ${i} changed: ${img.data[i]} -> ${out.data[i]}`);
    }
  });

  test('Mix=0.5 blends halfway toward fill color', () => {
    // input R=100, fill R=255 -> 100 + (255-100)*0.5 = 177.5 -> clamps to 177/178
    const out = fillFilter(makeImg(), { r: 1, g: 0, b: 0, mix: 0.5 });
    const r = out.data[0];
    assert(Math.abs(r - 177.5) <= 1, `R should be ~177.5, got ${r}`);
    // G: input 120, fill 0 -> 120 + (0-120)*0.5 = 60
    assert(Math.abs(out.data[1] - 60) <= 1, `G should be ~60, got ${out.data[1]}`);
  });

  test('apply() reads nested Color children (0..1 -> 0..255)', () => {
    const filter = makeFillFilter(0, 0.5, 1, 1); // blue-ish: (0, 127.5, 255)
    const mod = lookupFilter(filter)!;
    const ctx = makeContext(filter, 0, 8, 8);
    const out = mod.apply(makeImg(), ctx);
    assert(out.data[0] === 0, `R should be 0, got ${out.data[0]}`);
    assert(Math.abs(out.data[1] - 127.5) <= 1, `G should be ~127.5, got ${out.data[1]}`);
    assert(out.data[2] === 255, `B should be 255, got ${out.data[2]}`);
  });

  test('apply() with Fill With=1 (Gradient) leaves input unchanged', () => {
    const filter = makeFillFilter(1, 0, 0, 1, /*fillWith*/ 1);
    const mod = lookupFilter(filter)!;
    const ctx = makeContext(filter, 0, 8, 8);
    const img = makeImg();
    const out = mod.apply(img, ctx);
    for (let i = 0; i < out.data.length; i++) {
      assert(out.data[i] === img.data[i], `gradient mode should pass through, pixel ${i} changed`);
    }
  });

  test('exact template params: red fill, Mix=1', () => {
    // matches 360° Circle Wipe / Reveal Wipe: Fill With=0, Color=(1,0,0), Mix=1
    const filter = makeFillFilter(1, 0, 0, 1);
    const mod = lookupFilter(filter)!;
    const ctx = makeContext(filter, 0, 8, 8);
    const out = mod.apply(makeImg(), ctx);
    assert(out.data[0] === 255 && out.data[1] === 0 && out.data[2] === 0,
      `should be pure red, got ${out.data[0]},${out.data[1]},${out.data[2]}`);
    assert(out.data[3] === 255, 'alpha preserved');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

runTests();
