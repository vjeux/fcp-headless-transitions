/**
 * Linear working-space compositing (ROADMAP T-D1 / S2) — unit tests.
 *
 * The infrastructure gates the follow-on T-D2 filter-family migrations. This
 * file pins the invariants those migrations rely on:
 *   1. sRGB→linear→sRGB is byte-identical for every 8-bit code (256 values).
 *   2. Linear source-over blend produces the physically-correct mid-value
 *      (e.g. 50% grey overlaid at 50% opacity onto pure black lands at the
 *      linear midpoint, encoded to sRGB ≈ 188, NOT the gamma-blended 128 the
 *      current compositor produces).
 *   3. Flag defaults to `false` (T-D1's safety contract).
 */
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: any; width: number; height: number;
    constructor(data: any, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import {
  isLinearCompositeEnabled, setLinearCompositeEnabled,
  srgbChannelToLinear, linearChannelToSrgb,
  LUT_SRGB_TO_LINEAR,
  decodeImageToLinear, encodeLinearToImage,
  linearOverlay, linearOverlayFloat,
} from '../src/compositor/linear.js';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, extra?: string) {
  if (cond) { console.log(`  ✓ ${name}`); pass++; }
  else { console.log(`  ✗ ${name}${extra ? ` (${extra})` : ''}`); fail++; }
}

// 1. Flag default (T-D1 contract).
check('flag defaults OFF', isLinearCompositeEnabled() === false);

// 2. Round-trip: every 8-bit sRGB value survives decode+encode exactly.
{
  let maxErr = 0, offender = -1;
  for (let v = 0; v <= 255; v++) {
    const rt = linearChannelToSrgb(srgbChannelToLinear(v));
    const err = Math.abs(rt - v);
    if (err > maxErr) { maxErr = err; offender = v; }
  }
  check('sRGB→linear→sRGB round-trip u8-exact', maxErr === 0, `worst=${maxErr} at v=${offender}`);
}

// 3. LUT matches the reference decode (to Float32 precision — the LUT is a
//     Float32Array while the reference is double).
{
  let maxErr = 0;
  for (let v = 0; v <= 255; v++) {
    const err = Math.abs(LUT_SRGB_TO_LINEAR[v] - srgbChannelToLinear(v));
    if (err > maxErr) maxErr = err;
  }
  check('LUT_SRGB_TO_LINEAR matches reference (Float32 precision)', maxErr < 1e-6, `maxErr=${maxErr}`);
}

// 4. Transfer boundary — the piecewise breakpoint at s=0.04045 must not glitch.
//    Encoded v=10 lies BELOW (s=10/255≈0.0392); v=11 lies ABOVE.
{
  const below = srgbChannelToLinear(10);   // linear branch
  const above = srgbChannelToLinear(11);   // power branch
  check('transfer monotonic across piecewise breakpoint', above > below);
}

// 5. Endpoints exact.
check('linear(0) → 0',   linearChannelToSrgb(0) === 0);
check('linear(1) → 255', linearChannelToSrgb(1) === 255);
check('sRGB(255) → 1.0', Math.abs(srgbChannelToLinear(255) - 1.0) < 1e-9);
check('sRGB(0) → 0.0',   srgbChannelToLinear(0) === 0);

// 6. decodeImageToLinear + encodeLinearToImage on a whole image round-trip
//    every pixel exactly. This is the T-D2 entry-point contract.
{
  const w = 16, h = 16;
  const src = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < src.length; i++) src[i] = i % 256;
  const img = new ImageData(src, w, h);
  const lin = decodeImageToLinear(img);
  const back = encodeLinearToImage(lin, w, h);
  let ok = true, offender = -1;
  for (let i = 0; i < src.length; i++) {
    if (back.data[i] !== src[i]) { ok = false; offender = i; break; }
  }
  check('image-level decode→encode round-trip pixel-exact', ok, offender >= 0 ? `mismatch at i=${offender}` : '');
}

// 7. THE key S2 property: 50% grey (sRGB 188) at 50% opacity onto black lands at
//    ~sRGB 188 * 0.7...  Actually the physically-correct answer: sRGB 188 =
//    linear 0.5, blended 50% onto linear 0 → linear 0.25 → sRGB ≈ 137.
//    Gamma-space (current) blend: 188 * 0.5 = 94.  These differ by ~40 codes —
//    exactly the S2-documented mismatch on overlays.
{
  const w = 2, h = 1;
  const base = new ImageData(new Uint8ClampedArray([0, 0, 0, 255,  0, 0, 0, 255]), w, h);
  const overlay = new ImageData(new Uint8ClampedArray([188, 188, 188, 128,  188, 188, 188, 128]), w, h);
  const out = linearOverlay(base, overlay, 1.0);
  // Expected: linear midpoint 0.5 * 128/255 = ~0.251, source-over onto black =
  // 0.251 / (0.251 + (1-0.251)*1) = 0.251 (dest opaque), then encoded to sRGB.
  const sa = 128/255, db = 1;
  const outA = sa + db * (1 - sa); // = 1
  const oLin = (0.5 * sa + 0 * db * (1 - sa)) / outA;
  const expected = linearChannelToSrgb(oLin);
  const got = out.data[0];
  check('linear source-over of 50% grey @ 50%α on black ≈ linear midpoint', Math.abs(got - expected) <= 1, `expected≈${expected} got=${got}`);
  // Sanity: this is NOT the gamma-blended 94.
  check('linear result differs from gamma-space blend', Math.abs(got - 94) >= 20, `got=${got}, gamma=94`);
}

// 8. linearOverlay with zero opacity is a no-op.
{
  const base = new ImageData(new Uint8ClampedArray([12, 34, 56, 255]), 1, 1);
  const overlay = new ImageData(new Uint8ClampedArray([200, 200, 200, 255]), 1, 1);
  const out = linearOverlay(base, overlay, 0);
  check('linearOverlay α=0 returns base unchanged', out.data[0] === 12 && out.data[1] === 34 && out.data[2] === 56 && out.data[3] === 255);
}

// 9. linearOverlayFloat matches linearOverlay for the same inputs.
{
  const base = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1);
  const overlay = new ImageData(new Uint8ClampedArray([188, 188, 188, 128]), 1, 1);
  const outImg = linearOverlay(base, overlay, 1.0);
  const baseF = decodeImageToLinear(base);
  const overF = decodeImageToLinear(overlay);
  linearOverlayFloat(baseF, overF, 1.0);
  const outF = encodeLinearToImage(baseF, 1, 1);
  const diff = Math.max(
    Math.abs(outImg.data[0] - outF.data[0]),
    Math.abs(outImg.data[1] - outF.data[1]),
    Math.abs(outImg.data[2] - outF.data[2]),
    Math.abs(outImg.data[3] - outF.data[3]),
  );
  check('linearOverlayFloat matches linearOverlay (round-trip ≤ 1 code)', diff <= 1, `maxDiff=${diff}`);
}

// 10. Flag toggle isolation — setter changes value, getter reads current, tests
//     leave it OFF as the shipped default.
{
  setLinearCompositeEnabled(true);
  const on = isLinearCompositeEnabled();
  setLinearCompositeEnabled(false);
  const off = isLinearCompositeEnabled();
  check('setLinearCompositeEnabled(true) flips flag on', on === true);
  check('setLinearCompositeEnabled(false) flips flag back off', off === false);
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
