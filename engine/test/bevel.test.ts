if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { bevelFilter } from '../src/compositor/filters/bevel.js';

function assert(cond: boolean, msg: string) { if (!cond) throw new Error(`FAIL: ${msg}`); }

function runTests() {
  let pass = 0, fail = 0;
  function test(name: string, fn: () => void) {
    try { fn(); console.log(`  ✓ ${name}`); pass++; }
    catch (e: any) { console.log(`  ✗ ${name}: ${e.message}`); fail++; }
  }
  console.log('Bevel tests:\n');

  // Bevel Width is NORMALIZED (a fraction of maxDim): band_px = width*0.28125*maxDim.
  // Use a 100x100 image with a filled 60x60 centered square so a small normalized width
  // yields a several-px band that stays inside the shape.
  const N = 100, LO = 20, HI = 80; // 60px square centered in 100x100
  function makeSquare(): ImageData {
    const img = new ImageData(new Uint8ClampedArray(N * N * 4), N, N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const idx = (y * N + x) * 4;
        const inside = x >= LO && x < HI && y >= LO && y < HI;
        img.data[idx] = 128; img.data[idx+1] = 128; img.data[idx+2] = 128;
        img.data[idx+3] = inside ? 255 : 0;
      }
    }
    return img;
  }

  test('bevel width=0 → no change', () => {
    const img = makeSquare();
    const orig = new Uint8ClampedArray(img.data);
    const out = bevelFilter(img, { width: 0, lightAngle: 135, opacity: 1, mix: 1 });
    let same = true;
    for (let i = 0; i < out.data.length; i++) if (out.data[i] !== orig[i]) { same = false; break; }
    assert(same, 'width=0 should not change image');
  });

  test('bevel modifies edge pixels (normalized width → px band)', () => {
    const img = makeSquare();
    // width 0.1 @ maxDim 100 → band = 0.1*0.28125*100 ≈ 2.8px
    const out = bevelFilter(img, { width: 0.1, lightAngle: 135, opacity: 1, mix: 1 });
    let modified = 0;
    for (let i = 0; i < out.data.length; i += 4) {
      if (out.data[i + 3] > 0 && out.data[i] !== 128) modified++;
    }
    assert(modified > 0, `edge pixels should be lit/shadowed, ${modified} modified`);
  });

  test('bevel preserves deep interior', () => {
    const img = makeSquare();
    const out = bevelFilter(img, { width: 0.1, lightAngle: 135, opacity: 1, mix: 1 });
    // Center pixel (50,50) is far (>30px) from any edge → beyond the ~2.8px band → unchanged.
    const centerIdx = (50 * N + 50) * 4;
    assert(out.data[centerIdx] === 128, `interior should be unchanged, got ${out.data[centerIdx]}`);
  });

  test('band width scales with normalized Bevel Width', () => {
    // A frame-filling opaque layer bevels its FRAME BORDER; wider Width → wider lit band.
    function makeFull(): ImageData {
      const img = new ImageData(new Uint8ClampedArray(N * N * 4), N, N);
      for (let i = 0; i < N * N; i++) { img.data[i*4]=128; img.data[i*4+1]=128; img.data[i*4+2]=128; img.data[i*4+3]=255; }
      return img;
    }
    function litBandTop(width: number): number {
      const out = bevelFilter(makeFull(), { width, lightAngle: 90, opacity: 1, mix: 1 });
      let last = 0;
      for (let y = 0; y < N / 2; y++) {
        const idx = (y * N + N / 2) * 4;
        if (out.data[idx] !== 128) last = y;
      }
      return last;
    }
    const b1 = litBandTop(0.1), b2 = litBandTop(0.2);
    assert(b2 > b1, `wider Width → wider band (0.2→${b2}px should exceed 0.1→${b1}px)`);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}
runTests();
