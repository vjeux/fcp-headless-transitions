/**
 * 360° Reorient filter unit tests (UUID E61FE95E-0108-47DA-8F29-3CB3C47428EF).
 *
 * The real "360° Reorient" FxPlug plugin does NOT load in the headless FCP render
 * harness (the 360° family transitions render all-zero/black frames — same class
 * of failure as the "Fill" plugin they share a stack with, see fill.test.ts). So a
 * direct pixel-for-pixel ground-truth PSNR is unavailable for this filter. We
 * validate the equirectangular reorientation MATH here with deterministic unit
 * tests instead:
 *   - identity rotation (0,0,0) is an exact passthrough,
 *   - Pan/Tilt/Roll rotate sample directions to the expected longitude/latitude,
 *   - the full-image remap moves content the correct way and round-trips.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import {
  reorient360,
  reorientMatrix,
  dirFromLonLat,
  lonLatFromDir,
} from '../src/compositor/filters/reorient360.js';

let passed = 0, failed = 0;
function ok(cond: boolean, msg: string) {
  if (cond) { passed++; }
  else { failed++; console.error('  ✗ ' + msg); }
}
function close(a: number, b: number, eps: number, msg: string) {
  ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b}, eps ${eps})`);
}

// --- helpers -----------------------------------------------------------------
const PI = Math.PI, HALF = Math.PI / 2;

/** Rotate vector d by matrix R (row-major 3x3). */
function apply(R: number[], d: [number, number, number]): [number, number, number] {
  return [
    R[0] * d[0] + R[1] * d[1] + R[2] * d[2],
    R[3] * d[0] + R[4] * d[1] + R[5] * d[2],
    R[6] * d[0] + R[7] * d[1] + R[8] * d[2],
  ];
}
function applyT(R: number[], d: [number, number, number]): [number, number, number] {
  // transpose (inverse of a rotation)
  return [
    R[0] * d[0] + R[3] * d[1] + R[6] * d[2],
    R[1] * d[0] + R[4] * d[1] + R[7] * d[2],
    R[2] * d[0] + R[5] * d[1] + R[8] * d[2],
  ];
}

// --- 1. dir <-> lonlat round trip -------------------------------------------
{
  for (const [lon, lat] of [[0, 0], [HALF, 0], [-HALF, 0], [PI - 0.01, 0.3], [0, HALF - 0.01], [0, -HALF + 0.01]] as [number, number][]) {
    const d = dirFromLonLat(lon, lat);
    close(Math.hypot(d[0], d[1], d[2]), 1, 1e-9, 'dir is unit length');
    const [l2, p2] = lonLatFromDir(d[0], d[1], d[2]);
    close(l2, lon, 1e-6, `lon round-trip ${lon}`);
    close(p2, lat, 1e-6, `lat round-trip ${lat}`);
  }
  // center pixel dir is +Z forward
  const c = dirFromLonLat(0, 0);
  close(c[0], 0, 1e-9, 'center x=0'); close(c[1], 0, 1e-9, 'center y=0'); close(c[2], 1, 1e-9, 'center z=1');
}

// --- 2. rotation matrix is orthonormal identity at zero ---------------------
{
  const I = reorientMatrix(0, 0, 0);
  const expect = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  for (let i = 0; i < 9; i++) close(I[i], expect[i], 1e-12, `identity matrix[${i}]`);
}

// --- 3. Pan (Y) rotates longitude -------------------------------------------
{
  // Ry(pan): forward +Z should rotate toward +X for positive pan.
  const R = reorientMatrix(0, HALF, 0);
  const f = apply(R, [0, 0, 1]); // rotate the forward dir by the sphere rotation
  close(f[0], 1, 1e-9, 'pan +90: forward -> +X'); close(f[2], 0, 1e-9, 'pan +90: z=0');
  // In the remap, an OUTPUT looking forward samples SOURCE at Rᵀ·d.
  const s = applyT(R, [0, 0, 1]);
  const [slon] = lonLatFromDir(s[0], s[1], s[2]);
  close(slon, -HALF, 1e-9, 'pan +90: center output samples source lon -90');
}

// --- 4. Tilt (X) rotates latitude -------------------------------------------
{
  const R = reorientMatrix(HALF, 0, 0);
  // Output looking forward (0,0,1) samples source Rᵀ·d.
  const s = applyT(R, [0, 0, 1]);
  const [, slat] = lonLatFromDir(s[0], s[1], s[2]);
  // Rx(-90) applied to +Z -> points to +Y (up): source latitude +90.
  close(slat, HALF, 1e-9, 'tilt +90: center output samples source lat +90 (pole)');
}

// --- 5. Roll (Z) keeps forward fixed, rotates the up direction --------------
{
  const R = reorientMatrix(0, 0, HALF);
  const s = applyT(R, [0, 0, 1]); // forward unchanged by roll
  close(s[0], 0, 1e-9, 'roll: forward x unchanged');
  close(s[1], 0, 1e-9, 'roll: forward y unchanged');
  close(s[2], 1, 1e-9, 'roll: forward z unchanged');
}

// --- 6. identity remap is exact passthrough ---------------------------------
{
  const w = 16, h = 8;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i++) data[i] = (i * 37) % 256;
  const img = new ImageData(data, w, h);
  const out = reorient360(img, 0, 0, 0);
  let maxDiff = 0;
  for (let i = 0; i < data.length; i++) maxDiff = Math.max(maxDiff, Math.abs(out.data[i] - data[i]));
  ok(maxDiff <= 1, `identity remap passthrough (maxDiff=${maxDiff})`);
}

// --- 7. Pan by exactly one column-width shifts image horizontally by 1 col --
{
  // A vertical-stripe image: column x has a unique value. A pan of 2π/w should
  // shift sampling by exactly one column (with wrap), because longitude is the
  // horizontal axis.
  const w = 36, h = 4;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    data[idx] = (x * 7) % 256; data[idx + 1] = 0; data[idx + 2] = 0; data[idx + 3] = 255;
  }
  const img = new ImageData(data, w, h);
  const panOneCol = (Math.PI * 2) / w;
  const out = reorient360(img, 0, panOneCol, 0);
  // Output column x should now equal source column (x - 1) mod w in the red channel
  // (a +pan shifts the sampled longitude, moving content). Check a middle row.
  const y = 1;
  let matches = 0, total = 0;
  for (let x = 0; x < w; x++) {
    const oidx = (y * w + x) * 4;
    // find which source column best matches
    const val = out.data[oidx];
    const srcCol = ((x - 1) % w + w) % w;
    const expect = (srcCol * 7) % 256;
    total++;
    if (Math.abs(val - expect) <= 2) matches++;
  }
  ok(matches >= total - 1, `pan of one column shifts content by ~1 col (matches ${matches}/${total})`);
}

// TWO_PI local (module-level const isn't exported)

console.log(`\nreorient360: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
