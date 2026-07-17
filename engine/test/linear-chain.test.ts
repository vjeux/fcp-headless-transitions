/**
 * Chain-level linear working-space handoff (T-qlinchain01) — unit tests.
 *
 * Pins the STRUCTURAL contract of compositor/filters/linear-chain.ts:
 *   1. A LONE colour-adjust filter (chain entry — nobody consumes the published
 *      linear buffer) emits deterministic output equal to the legacy sRGB path. This
 *      is what keeps single-Colorize/single-HSV slugs (Slide/Up-Over/Lower/Center/
 *      Light_Sweep) byte-identical.
 *   2. A Colorize→HueSat chain (Color_Panels-like) hands off the EXACT linear buffer:
 *      Colorize publishes it, HueSat resumes from it and re-publishes. With the
 *      min(1,1+S) saturation clamp the colorised red panel keeps its Colorize ratio
 *      (G/B NOT crushed to 0) — matching the GUI GT.
 *   3. hasLinearInput / getLinearInput / publishLinear round-trip on the WeakMap.
 */
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: any; width: number; height: number;
    constructor(data: any, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import {
  hasLinearInput, getLinearInput, publishLinear,
} from '../src/compositor/filters/linear-chain.js';
import type { Filter } from '../src/types.js';

let pass = 0, fail = 0;
function test(name: string, fn: () => void) {
  try { fn(); console.log(`  \u2713 ${name}`); pass++; }
  catch (e) { console.log(`  \u2717 ${name}: ${(e as Error).message}`); fail++; }
}
function assert(c: boolean, m: string) { if (!c) throw new Error(m); }

function solid(r: number, g: number, b: number, w = 4, h = 4): ImageData {
  const img = new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  for (let i = 0; i < img.data.length; i += 4) { img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255; }
  return img;
}
function colorize(black: number[], white: number[], intensity = 1, mix = 1): Filter {
  const rgb = (name: string, c: number[]) => ({ name, id: 1, children: [
    { name: 'Red', id: 1, value: c[0] }, { name: 'Green', id: 2, value: c[1] }, { name: 'Blue', id: 3, value: c[2] } ] });
  return { id: 1, name: 'PAEColorize', pluginName: 'PAEColorize', pluginUUID: 'D995BBCF-F766-4950-89D5-7A4828CD9B6F',
    parameters: [ rgb('Remap Black To', black) as any, rgb('Remap White To', white) as any,
      { name: 'Intensity', id: 4, value: intensity }, { name: 'Mix', id: 5, value: mix } ] };
}
function hsv(hue: number, saturation: number, value: number): Filter {
  return { id: 2, name: 'HSV Adjust', pluginName: 'PAEHSVAdjust', pluginUUID: 'D23AF030-B0BF-44DF-B622-7C9EA0DF5744',
    parameters: [ { name: 'Hue', id: 1, value: hue }, { name: 'Saturation', id: 2, value: saturation },
      { name: 'Value', id: 3, value: value }, { name: 'Mix', id: 4, value: 1 } ] };
}
function apply(f: Filter, input: ImageData): ImageData {
  const mod = lookupFilter(f)!;
  return mod.apply(input, makeContext(f, 0, input.width, input.height));
}

test('lone Colorize entry is deterministic (== legacy, keeps Slide/Up-Over neutral)', () => {
  const a = apply(colorize([0.08, 0.08, 0.08], [0.66, 0.24, 0.13]), solid(120, 90, 60));
  const b = apply(colorize([0.08, 0.08, 0.08], [0.66, 0.24, 0.13]), solid(120, 90, 60));
  for (let i = 0; i < a.data.length; i++) assert(a.data[i] === b.data[i], `entry deterministic @${i}`);
});

test('Colorize→HueSat chain hands off the exact linear buffer (Color_Panels)', () => {
  const afterColorize = apply(colorize([0.08, 0.08, 0.08], [0.66, 0.24, 0.13]), solid(120, 90, 60));
  assert(hasLinearInput(afterColorize), 'Colorize published a linear buffer');
  const afterHSV = apply(hsv(0, 1, 1), afterColorize);
  // min(1,1+S) clamp: Sat=1 does NOT super-saturate, so the red panel keeps G/B > 0.
  assert(afterHSV.data[1] > 0 && afterHSV.data[2] > 0, `panel G/B not crushed (got ${afterHSV.data[1]},${afterHSV.data[2]})`);
  assert(hasLinearInput(afterHSV), 'HueSat re-published the linear buffer for a further follower');
});

test('publishLinear / getLinearInput round-trip on the WeakMap', () => {
  const im = solid(50, 60, 70);
  assert(!hasLinearInput(im), 'fresh image not cached');
  const buf = getLinearInput(im);
  publishLinear(im, buf);
  assert(hasLinearInput(im), 'published');
  const got = getLinearInput(im);
  for (let i = 0; i < buf.length; i++) assert(Math.abs(got[i] - buf[i]) < 1e-9, `exact round-trip @${i}`);
});

console.log(`\n${pass} pass, ${fail} fail`);
if (fail > 0) process.exit(1);
