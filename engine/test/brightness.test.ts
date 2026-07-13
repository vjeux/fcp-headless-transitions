/**
 * Brightness filter unit tests (PAEBrightness — ROADMAP T-D2a).
 *
 * Pin the two paths of `brightnessFilter`:
 *   1. `linear=false` (SHIPPED DEFAULT): behaviour is byte-identical to the
 *      pre-T-D2a code path — per-channel sRGB code multiply, clamped to
 *      [0,255]. This is what the gate scores today (isLinearCompositeEnabled()
 *      defaults OFF).
 *   2. `linear=true`: the T-D1 linear working-space branch. Input sRGB codes
 *      are decoded to linear via LUT_SRGB_TO_LINEAR, multiplied by `amount`
 *      in linear light, encoded back to sRGB. Same multiply — different colour
 *      space. This is the physically-correct model and matches FCP's chain
 *      when all filters run in ExtendedLinearSRGB and the buffer encodes once
 *      at readback (see linear.ts / T-D1).
 *
 * These invariants let T-D2a ship the linear branch as INFRASTRUCTURE without
 * touching the shipped output — the sibling T-D2 families opt into the linear
 * chain the same way, and only when all four are in does the outer flag flip.
 */
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { brightnessFilter } from '../src/compositor/filters/levels.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import {
  isLinearCompositeEnabled, setLinearCompositeEnabled,
  srgbChannelToLinear, linearChannelToSrgb,
} from '../src/compositor/linear.js';
import type { Filter } from '../src/types.js';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, extra?: string) {
  if (cond) { console.log(`  ✓ ${name}`); pass++; }
  else { console.log(`  ✗ ${name}${extra ? ` (${extra})` : ''}`); fail++; }
}

function flat(r: number, g: number, b: number, a = 255, w = 4, h = 4): ImageData {
  const buf = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < buf.length; i += 4) { buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a; }
  return new ImageData(buf, w, h);
}

// 1. Default (linear=false) is UNCHANGED from the legacy code-multiply.
{
  const src = new Uint8ClampedArray([
    0, 0, 0, 255,
    32, 96, 200, 255,
    128, 64, 192, 255,
    255, 255, 255, 255,
  ]);
  const img = new ImageData(src, 4, 1);
  const amount = 0.7;
  const out = brightnessFilter(img, amount);
  // Reproduce the legacy write EXACTLY: Uint8ClampedArray stores use HTML5
  // canvas "round half to even" (banker's rounding), which differs from
  // Math.round for exact halves — so we compare against a fresh
  // Uint8ClampedArray built the same way, not a Math.round expectation.
  const exp = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    exp[i]     = Math.max(0, Math.min(255, src[i]     * amount));
    exp[i + 1] = Math.max(0, Math.min(255, src[i + 1] * amount));
    exp[i + 2] = Math.max(0, Math.min(255, src[i + 2] * amount));
    exp[i + 3] = src[i + 3];
  }
  let ok = true, worst = 0;
  for (let i = 0; i < src.length; i++) {
    const d = Math.abs(out.data[i] - exp[i]);
    if (d !== 0) ok = false;
    if (d > worst) worst = d;
  }
  check('sRGB-path brightness math unchanged (byte-identical to legacy)', ok, `worst=${worst}`);
}

// 2. Both paths at amount=1 are identity (short-circuit before the branch).
{
  const src = new Uint8ClampedArray([12, 128, 200, 255,  0, 64, 255, 255]);
  const img = new ImageData(src, 2, 1);
  const offOut = brightnessFilter(img, 1, false);
  const onOut  = brightnessFilter(img, 1, true);
  check('amount=1 sRGB path is identity', offOut === img);
  check('amount=1 linear path is identity', onOut === img);
}

// 3. Linear brightness on 50% grey (sRGB 128) at amount=0.5 lands at the
//    physically-correct linear midpoint dim (linear 0.216 * 0.5 = 0.108 → sRGB
//    ~93), NOT the gamma-space 64 the sRGB path returns. This is the whole
//    point of the T-D2a migration — it lets Curtains' Brightness=2.91 → Mono
//    chain live in linear working space and stop over-exposing highlights.
{
  const img = flat(128, 128, 128, 255);
  const outLin  = brightnessFilter(img, 0.5, true);
  const outSRGB = brightnessFilter(img, 0.5, false);
  const expLinR = linearChannelToSrgb(srgbChannelToLinear(128) * 0.5);
  check('linear brightness on mid-grey * 0.5 matches decode/multiply/encode',
        outLin.data[0] === expLinR && outLin.data[1] === expLinR && outLin.data[2] === expLinR,
        `got (${outLin.data[0]},${outLin.data[1]},${outLin.data[2]}) exp ${expLinR}`);
  // The sRGB-path result should be 64 (128 * 0.5). The linear-path result is
  // meaningfully different — proves the paths are wired to different math.
  check('sRGB-path amount=0.5 on 128 = 64 (code multiply)', outSRGB.data[0] === 64);
  check('linear-path result differs from sRGB-path on mid-grey',
        Math.abs(outLin.data[0] - outSRGB.data[0]) >= 10,
        `sRGB=${outSRGB.data[0]} lin=${outLin.data[0]}`);
}

// 4. Linear brightness at amount>1 brightens WITHOUT the plain-multiply
//    highlight blowout. On sRGB 100 * 2.0: sRGB path = 200; linear path:
//    linear(100)≈0.127 * 2.0 = 0.254 → sRGB ≈ 138. Different, monotonic in
//    amount, and closer to the physically-correct exposure the FCP chain
//    produces once the whole buffer runs linear.
{
  const img = flat(100, 100, 100, 255);
  const outLin  = brightnessFilter(img, 2.0, true);
  const outSRGB = brightnessFilter(img, 2.0, false);
  const expLin = linearChannelToSrgb(srgbChannelToLinear(100) * 2.0);
  check('linear brightness on 100 * 2.0 matches decode/multiply/encode',
        outLin.data[0] === expLin, `got ${outLin.data[0]} exp ${expLin}`);
  check('sRGB-path amount=2 on 100 = 200 (code multiply)', outSRGB.data[0] === 200);
  check('linear-path differs from sRGB-path when brightening',
        Math.abs(outLin.data[0] - outSRGB.data[0]) >= 10);
}

// 5. Linear-path clamp: amount=10 on sRGB 200 saturates to 255 (the linear
//    product overshoots 1.0, gets clamped, encodes to 255).
{
  const img = flat(200, 200, 200, 255);
  const out = brightnessFilter(img, 10, true);
  check('linear-path saturates to 255 when product > 1', out.data[0] === 255);
}

// 6. Registration wiring: the registered Brightness filter reads
//    isLinearCompositeEnabled() per call — flipping the flag under
//    try/finally changes the output, then restores the default. Matches the
//    contract linear.test.ts / tint.test.ts use.
{
  const uuid = '2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6';
  const mod = lookupFilter({ id: 'test', pluginName: 'brightness', uuid, name: 'Brightness', parameters: [] } as any);
  if (!mod) { check('lookupFilter finds Brightness by UUID', false, 'no module'); }
  else {
    const filter: Filter = {
      id: 'f1', pluginName: 'PAEBrightness', uuid, name: 'Brightness',
      parameters: [{ name: 'Brightness', value: 0.5 }],
    } as any;
    const img = flat(128, 128, 128, 255);
    const shippedDefault = isLinearCompositeEnabled();
    check('flag defaults OFF at test entry', shippedDefault === false);
    const offOut = mod.apply(img, makeContext(filter, 0, img.width, img.height));
    let onOut: ImageData;
    try {
      setLinearCompositeEnabled(true);
      onOut = mod.apply(img, makeContext(filter, 0, img.width, img.height));
    } finally {
      setLinearCompositeEnabled(false);
    }
    check('flag restored to OFF after try/finally', isLinearCompositeEnabled() === false);
    let differ = false;
    for (let i = 0; i < 12; i += 4) {
      if (offOut.data[i] !== onOut.data[i] || offOut.data[i + 1] !== onOut.data[i + 1] || offOut.data[i + 2] !== onOut.data[i + 2]) {
        differ = true; break;
      }
    }
    check('registered Brightness respects isLinearCompositeEnabled() flag', differ);
    // Byte-identity spot-check after flag toggle: post-restore, the shipped
    // path must produce the SAME pixels as before the toggle.
    const offOut2 = mod.apply(img, makeContext(filter, 0, img.width, img.height));
    let sameBytes = true;
    for (let i = 0; i < offOut.data.length; i++) {
      if (offOut.data[i] !== offOut2.data[i]) { sameBytes = false; break; }
    }
    check('flag-OFF output is byte-identical across toggle', sameBytes);
  }
}

// 7. Alpha is preserved on both paths (coverage is not a photon count).
{
  const src = new Uint8ClampedArray([64, 64, 64, 128,  200, 100, 50, 200]);
  const img = new ImageData(src, 2, 1);
  const outSRGB = brightnessFilter(img, 0.7, false);
  const outLin  = brightnessFilter(img, 0.7, true);
  check('sRGB-path preserves alpha', outSRGB.data[3] === 128 && outSRGB.data[7] === 200);
  check('linear-path preserves alpha', outLin.data[3] === 128 && outLin.data[7] === 200);
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
