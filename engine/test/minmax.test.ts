/**
 * MinMax filter unit tests (UUID D2342006-51C4-4439-8E89-E970F135E21C).
 * PAEMinMax = Helium separable morphology: X-then-Y, each R0=center then for
 * k in 1..radius R0=min/max(R0, sample(±k)) over the FULL [-R,+R] window, per
 * channel, clamp-at-edge. Mode 0=Minimum(erode), 1=Maximum(dilate). Verified vs
 * headless FCP at PSNR 35-40 across Mode×Radius; these unit tests pin the kernel.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { minmaxFilter } from '../src/compositor/filters/minmax.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import type { Filter } from '../src/types.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

// A single bright dot on black, so dilate grows it and erode removes it.
function dotImg(w = 9, h = 9): ImageData {
  const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < img.data.length; i += 4) { img.data[i + 3] = 255; } // opaque black
  const cx = 4, cy = 4, i = (cy * w + cx) * 4;
  img.data[i] = 200; img.data[i + 1] = 200; img.data[i + 2] = 200;
  return img;
}
function px(img: ImageData, x: number, y: number): number { return img.data[(y * img.width + x) * 4]; }

function makeMinMax(mode: number, radius: number): Filter {
  return { id: 1, name: 'MinMax2', pluginName: 'MinMax2',
    pluginUUID: 'D2342006-51C4-4439-8E89-E970F135E21C',
    parameters: [{ name: 'Mode', id: 1, value: mode }, { name: 'Radius', id: 2, value: radius }] };
}

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('MinMax filter tests:\n');

  test('registered under its UUID', () => {
    const mod = lookupFilter(makeMinMax(1, 2));
    assert(!!mod && mod!.label === 'MinMax', 'filter found via UUID');
  });

  test('Radius 0 = identity', () => {
    const img = dotImg();
    const out = minmaxFilter(img, 0, true);
    for (let i = 0; i < out.data.length; i++) assert(out.data[i] === img.data[i], 'r0 identity');
  });

  test('Maximum (dilate) grows the bright dot by radius (square window)', () => {
    const out = minmaxFilter(dotImg(), 2, /*isMax*/ true);
    // dot at (4,4) with value 200; after dilate R=2 the whole [2..6]x[2..6] block is 200
    assert(px(out, 4, 4) === 200, 'center still 200');
    assert(px(out, 2, 2) === 200, 'corner of 5x5 block dilated to 200');
    assert(px(out, 6, 6) === 200, 'opposite corner dilated');
    assert(px(out, 1, 4) === 0, 'just outside window stays 0');
    assert(px(out, 7, 4) === 0, 'just outside window (other side) stays 0');
  });

  test('Minimum (erode) removes the isolated bright dot', () => {
    const out = minmaxFilter(dotImg(), 1, /*isMax*/ false);
    // erode with R=1: the single bright pixel is surrounded by black -> becomes black
    assert(px(out, 4, 4) === 0, 'isolated dot eroded away');
  });

  test('apply() mode 1 dilates, mode 0 erodes', () => {
    const fMax = makeMinMax(1, 2); const outMax = lookupFilter(fMax)!.apply(dotImg(), makeContext(fMax, 0, 9, 9));
    assert(px(outMax, 2, 2) === 200, 'apply dilate grows');
    const fMin = makeMinMax(0, 1); const outMin = lookupFilter(fMin)!.apply(dotImg(), makeContext(fMin, 0, 9, 9));
    assert(px(outMin, 4, 4) === 0, 'apply erode removes');
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
