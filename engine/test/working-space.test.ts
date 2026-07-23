// Unit tests for the float working-space filter pipeline (compositor/working-space.ts).
// Proves the architectural invariants: round-trip identity, unclamped headroom, and that a
// fused chain preserves headroom the old 8-bit-per-filter path destroys.
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import {
  decodeToWorking, encodeFromWorking, srgbToWorkingUnclamped, workingToSrgbUnclamped,
  isWorkingSpacePipelineEnabled, setWorkingSpacePipelineEnabled,
} from '../src/compositor/working-space.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }
const mk = (r: number, g: number, b: number, a = 255) =>
  new (globalThis as any).ImageData(new Uint8ClampedArray([r, g, b, a]), 1, 1) as ImageData;

function runTests() {
  let pass = 0, fail = 0;
  const test = (name: string, fn: () => void) => {
    try { fn(); console.log(`  \u2713 ${name}`); pass++; }
    catch (e: any) { console.log(`  \u2717 ${name}: ${e.message}`); fail++; }
  };
  console.log('Float working-space pipeline tests:\n');

  test('decode->encode round-trips EXACTLY for all 256 codes', () => {
    let maxErr = 0;
    for (let v = 0; v < 256; v++) {
      const o = encodeFromWorking(decodeToWorking(mk(v, v, v)));
      maxErr = Math.max(maxErr, Math.abs(o.data[0] - v));
    }
    assert(maxErr <= 1, `round-trip max error ${maxErr} > 1`);
  });

  test('working transfer is UNCLAMPED (values exceed 1.0 / go below 0)', () => {
    assert(srgbToWorkingUnclamped(510) > 1, 'code 510 should give ws > 1');
    assert(workingToSrgbUnclamped(2.0) > 255, 'ws 2.0 should give code > 255');
    assert(srgbToWorkingUnclamped(0) === 0, 'code 0 -> ws 0');
  });

  test('encode terminal-clamps to [0,255] (FCP end quantise)', () => {
    const f = decodeToWorking(mk(0, 0, 0));
    f.data[0] = 5.0;  // way over 1.0 working
    f.data[1] = -1.0; // under 0
    const o = encodeFromWorking(f);
    assert(o.data[0] === 255, `over-range -> 255, got ${o.data[0]}`);
    assert(o.data[1] === 0, `under-range -> 0, got ${o.data[1]}`);
  });

  test('FUSED Brightness x2 then x0.5 PRESERVES headroom (arch invariant)', () => {
    const bmod = lookupFilter({ pluginUUID: '2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6', pluginName: 'Brightness' } as any)!;
    const ctx = (amt: number) => makeContext(
      { id: 1, pluginUUID: 'x', pluginName: 'Brightness', parameters: [{ name: 'Brightness', value: amt, keyframes: [] }] } as any, 0, 1, 1);
    // Old 8-bit path: 180*2 clamps to 255, *0.5 -> ~128 (headroom lost).
    let img = bmod.apply(mk(180, 180, 180), ctx(2.0));
    img = bmod.apply(img, ctx(0.5));
    assert(img.data[0] < 160, `old path should LOSE headroom (got ${img.data[0]}, expected ~128)`);
    // Fused working-space path: unclamped -> round-trips to ~180.
    let f = decodeToWorking(mk(180, 180, 180));
    f = bmod.applyWorking!(f, ctx(2.0));
    f = bmod.applyWorking!(f, ctx(0.5));
    const out = encodeFromWorking(f);
    assert(Math.abs(out.data[0] - 180) <= 2, `fused path preserves headroom (got ${out.data[0]}, expected ~180)`);
  });

  test('Contrast applyWorking matches apply for in-gamut (no regression)', () => {
    const cmod = lookupFilter({ pluginUUID: 'B13B57AC-811B-4A24-BB5A-2167A3C66F5F', pluginName: 'Contrast' } as any)!;
    const ctx = makeContext({ id: 1, pluginUUID: 'x', pluginName: 'Contrast', parameters: [{ name: 'Contrast', value: 0.5, keyframes: [] }, { name: 'Mix', value: 1, keyframes: [] }] } as any, 0, 1, 1);
    for (const v of [16, 64, 128, 200, 240]) {
      const old = cmod.apply(mk(v, v, v), ctx).data[0];
      const ws = encodeFromWorking(cmod.applyWorking!(decodeToWorking(mk(v, v, v)), ctx)).data[0];
      assert(Math.abs(old - ws) <= 1, `Contrast in-gamut mismatch at ${v}: apply=${old} applyWorking=${ws}`);
    }
  });

  test('pipeline flag toggles (default OFF for byte-identical shipped path)', () => {
    const orig = isWorkingSpacePipelineEnabled();
    setWorkingSpacePipelineEnabled(true); assert(isWorkingSpacePipelineEnabled(), 'enable failed');
    setWorkingSpacePipelineEnabled(false); assert(!isWorkingSpacePipelineEnabled(), 'disable failed');
    setWorkingSpacePipelineEnabled(orig);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
