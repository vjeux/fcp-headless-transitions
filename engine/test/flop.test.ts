/**
 * Flop filter unit tests (UUID 2FF8887B-E673-4727-9601-1B3353531C10).
 * PAEFlop is a geometric mirror about the image center: 0=Horizontal (mirror X),
 * 1=Vertical (mirror Y), 2=Both. Verified vs headless FCP at PSNR 42.2 (all modes);
 * these deterministic unit tests pin the pixel permutation.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { flopFilter } from '../src/compositor/filters/flop.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import type { Filter } from '../src/types.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

// 4x2 image with a unique value per pixel so mirroring is unambiguous.
function makeImg(): ImageData {
  const w = 4, h = 2;
  const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    img.data[i] = x * 10 + y;      // R encodes (x,y)
    img.data[i + 1] = x * 10 + y;
    img.data[i + 2] = x * 10 + y;
    img.data[i + 3] = 255;
  }
  return img;
}
function px(img: ImageData, x: number, y: number): number { return img.data[(y * img.width + x) * 4]; }

function makeFlop(mode: number): Filter {
  return { id: 1, name: 'Flop', pluginName: 'PAEFlop',
    pluginUUID: '2FF8887B-E673-4727-9601-1B3353531C10',
    parameters: [{ name: 'Flop', id: 1, value: mode }] };
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('Flop filter tests:\n');

  test('registered under its UUID', () => {
    const mod = lookupFilter(makeFlop(0));
    assert(!!mod && mod!.label === 'Flop', 'filter found via UUID with label Flop');
  });

  test('Horizontal (mode 0): mirror X, rows unchanged', () => {
    const out = flopFilter(makeImg(), true, false);
    // (0,0)=0 -> becomes (3,0)=30; row y stays
    assert(px(out, 0, 0) === px(makeImg(), 3, 0), 'x0 <- x3');
    assert(px(out, 3, 1) === px(makeImg(), 0, 1), 'x3 <- x0 (row1)');
  });

  test('Vertical (mode 1): mirror Y, columns unchanged', () => {
    const out = flopFilter(makeImg(), false, true);
    assert(px(out, 1, 0) === px(makeImg(), 1, 1), 'y0 <- y1');
    assert(px(out, 2, 1) === px(makeImg(), 2, 0), 'y1 <- y0');
  });

  test('Both (mode 2): 180° point reflection', () => {
    const out = flopFilter(makeImg(), true, true);
    assert(px(out, 0, 0) === px(makeImg(), 3, 1), '(0,0) <- (3,1)');
    assert(px(out, 3, 1) === px(makeImg(), 0, 0), '(3,1) <- (0,0)');
  });

  test('apply() mode 0 mirrors horizontally', () => {
    const f = makeFlop(0); const mod = lookupFilter(f)!;
    const out = mod.apply(makeImg(), makeContext(f, 0, 4, 2));
    assert(px(out, 0, 0) === px(makeImg(), 3, 0), 'apply mirrors X');
  });

  test('apply() out-of-range mode passes through', () => {
    const f = makeFlop(5); const mod = lookupFilter(f)!;
    const img = makeImg();
    const out = mod.apply(img, makeContext(f, 0, 4, 2));
    for (let i = 0; i < out.data.length; i++) assert(out.data[i] === img.data[i], 'passthrough');
  });

  test('double horizontal flip is identity', () => {
    const once = flopFilter(makeImg(), true, false);
    const twice = flopFilter(once, true, false);
    const orig = makeImg();
    for (let i = 0; i < twice.data.length; i++) assert(twice.data[i] === orig.data[i], 'involution');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
