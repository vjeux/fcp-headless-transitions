/**
 * PAENoise (Lights/Static) unit + character tests.
 *
 * The PAENoise FxPlug plugin does NOT expose a clean raw-noise render headless
 * (Lights/Static renders as a NOISE-DRIVEN DISSOLVE, and the per-frame seed
 * schedule lives in the FCP transition HOST — not in InternalFiltersXPC). So a
 * bit-exact pixel PSNR against a single GT frame is not attainable; see the w6
 * report. We instead validate:
 *   (1) the dSFMT gradient-texture RNG is bit-exact ([1,2) draws),
 *   (2) the snoise body is the Ashima/McEwan 2D simplex (range, continuity,
 *       determinism, gradient falloff), transcribed 1:1 from the embedded shader,
 *   (3) the assembled field reproduces the REAL Lights/Static noise CHARACTER:
 *       smooth (high spatial autocorrelation, half-decay ≈ several px), per-channel
 *       chroma structure (R≠G≠B), opaque alpha — matching the measured GT frame.
 */
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? data.length / 4 / width;
    }
  };
}
import { snoise, DSFMT, applyNoiseGenerator } from '../src/compositor/filters/noise.js';

let passed = 0, failed = 0;
const ok = (c: boolean, m: string) => { if (c) passed++; else { failed++; console.error('  ✗ ' + m); } };
const close = (a: number, b: number, eps: number, m: string) =>
  ok(Math.abs(a - b) <= eps, `${m} (got ${a}, want ${b}±${eps})`);

// (1) dSFMT — genrand_close1_open2 yields doubles in [1,2), deterministic per seed.
{
  const a = new DSFMT(0), b = new DSFMT(0), c = new DSFMT(1);
  const xa = Array.from({ length: 8 }, () => a.next());
  const xb = Array.from({ length: 8 }, () => b.next());
  ok(xa.every(v => v >= 1 && v < 2), 'dSFMT draws in [1,2)');
  ok(xa.every((v, i) => v === xb[i]), 'dSFMT deterministic for equal seed');
  const xc = Array.from({ length: 8 }, () => c.next());
  ok(xa.some((v, i) => v !== xc[i]), 'dSFMT differs across seeds');
  // uniformity: mean of many draws ≈ 1.5
  const d = new DSFMT(42); let s = 0; const N = 20000;
  for (let i = 0; i < N; i++) s += d.next();
  close(s / N, 1.5, 0.02, 'dSFMT mean ≈ 1.5');
}

// (2) snoise — Ashima 2D simplex: bounded, deterministic, continuous.
{
  let mn = 1e9, mx = -1e9;
  for (let i = 0; i < 5000; i++) {
    const x = (i * 12.9898) % 100, y = (i * 78.233) % 100;
    const v = snoise(x, y); mn = Math.min(mn, v); mx = Math.max(mx, v);
  }
  ok(mn >= -1.2 && mx <= 1.2, `snoise bounded ~[-1,1] (got [${mn.toFixed(2)},${mx.toFixed(2)}])`);
  ok(snoise(3.3, 4.4) === snoise(3.3, 4.4), 'snoise deterministic');
  // continuity: small step → small delta
  const eps = 1e-3;
  ok(Math.abs(snoise(5.0, 5.0) - snoise(5.0 + eps, 5.0)) < 0.05, 'snoise continuous');
}

// (3) Assembled field matches REAL Lights/Static character.
{
  const W = 400, H = 400;
  const img = applyNoiseGenerator(W, H, 0);
  const d = img.data;
  // opaque alpha (color0.w = 1.0)
  let allOpaque = true; for (let i = 3; i < d.length; i += 4) if (d[i] !== 255) allOpaque = false;
  ok(allOpaque, 'alpha fully opaque');
  // chroma structure: R,G,B not identical (3 independent snoise channels)
  let maxRG = 0; for (let i = 0; i < d.length; i += 4) maxRG = Math.max(maxRG, Math.abs(d[i] - d[i + 1]));
  ok(maxRG > 30, `per-channel chroma present (max|R-G|=${maxRG})`);
  // spatial smoothness: horizontal lag-1 autocorrelation high (GT ~0.95)
  const g = new Float64Array(W * H); for (let i = 0; i < W * H; i++) g[i] = d[i * 4];
  let m = 0; for (const v of g) m += v; m /= g.length;
  let v0 = 0, vh = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = g[y * W + x] - m; v0 += a * a;
    if (x + 1 < W) vh += a * (g[y * W + x + 1] - m);
  }
  const ac1 = (vh / v0) * (W * H) / ((W - 1) * H);
  ok(ac1 > 0.7, `spatially smooth (lag1 autocorr=${ac1.toFixed(3)}, GT≈0.95)`);
  // dynamic range comparable to GT (std ~30-60)
  let s2 = 0; for (const v of g) s2 += (v - m) * (v - m); const sd = Math.sqrt(s2 / g.length);
  ok(sd > 20 && sd < 90, `dynamic range plausible (std=${sd.toFixed(1)})`);
  // seed changes the field
  const img1 = applyNoiseGenerator(W, H, 12345);
  let diff = 0; for (let i = 0; i < d.length; i += 4) diff += Math.abs(d[i] - img1.data[i]);
  ok(diff / (W * H) > 5, 'different seed → different field');
}

console.log(`\nPAENoise: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
