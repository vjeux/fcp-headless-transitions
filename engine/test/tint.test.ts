/**
 * Tint filter unit tests (PAETint / TintFx — ROADMAP T-D2b).
 *
 * Pin the two paths of `tintFilter`:
 *   1. `linear=false` (SHIPPED DEFAULT): behaviour is byte-identical to the
 *      pre-T-D2b tintFilter — legacy `luma·targetColor` lerp in sRGB code
 *      space. This is what the gate scores today (isLinearCompositeEnabled()
 *      defaults OFF).
 *   2. `linear=true`: the T-D1 linear working-space branch. Input sRGB codes
 *      are decoded to linear via LUT_SRGB_TO_LINEAR, the target sRGB colour is
 *      decoded ONCE, luma-scale + intensity/mix lerps happen on linear light,
 *      output is encoded back to sRGB. Same shape math, different colour space.
 *
 * These invariants let T-D2b ship the linear branch as INFRASTRUCTURE without
 * touching the shipped output — the sibling T-D2 families opt into the linear
 * chain the same way, and only when all four are in does the outer flag flip.
 */
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray; width: number; height: number;
    constructor(data: Uint8ClampedArray, width: number, height?: number) {
      this.data = data; this.width = width; this.height = height ?? (data.length / 4 / width);
    }
  };
}
import { tintFilter } from '../src/compositor/filters/channel-mixer.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import {
  isLinearCompositeEnabled, setLinearCompositeEnabled,
  srgbChannelToLinear, linearChannelToSrgb,
} from '../src/compositor/linear.js';
import { luma601 } from '../src/compositor/blend.js';
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

// 1. Default (linear=false) is UNCHANGED from the pre-T-D2b legacy math.
//    Recompute the legacy formula inline and compare byte-for-byte.
{
  const src = new Uint8ClampedArray([
    0, 0, 0, 255,
    32, 96, 200, 255,
    128, 64, 192, 255,
    255, 255, 255, 255,
  ]);
  const img = new ImageData(src, 4, 1);
  const out = tintFilter(img, 1.0, 0.4, 0.2, 0.6, 0.9);
  let ok = true, worst = 0;
  for (let i = 0; i < src.length; i += 4) {
    const lum = luma601(src[i], src[i + 1], src[i + 2]) / 255;
    const tR = lum * 1.0 * 255, tG = lum * 0.4 * 255, tB = lum * 0.2 * 255;
    const iR = src[i] * (1 - 0.6) + tR * 0.6;
    const iG = src[i + 1] * (1 - 0.6) + tG * 0.6;
    const iB = src[i + 2] * (1 - 0.6) + tB * 0.6;
    const expR = Math.round(src[i]     * (1 - 0.9) + iR * 0.9);
    const expG = Math.round(src[i + 1] * (1 - 0.9) + iG * 0.9);
    const expB = Math.round(src[i + 2] * (1 - 0.9) + iB * 0.9);
    if (out.data[i] !== expR || out.data[i + 1] !== expG || out.data[i + 2] !== expB) { ok = false; }
    worst = Math.max(worst, Math.abs(out.data[i] - expR), Math.abs(out.data[i + 1] - expG), Math.abs(out.data[i + 2] - expB));
    if (out.data[i + 3] !== src[i + 3]) ok = false;
  }
  check('sRGB-path tint math unchanged (byte-identical to legacy formula)', ok, `worst=${worst}`);
}

// 2. linear=true differs from linear=false on a saturated colour input (proves
//    the two paths are wired to genuinely different math). Use a bright red
//    input with a green tint — the luma computation differs sharply between
//    sRGB codes (601 weights on gamma-encoded 200,50,50) and linear light
//    (601 weights on srgbToLinear of those codes, which is much darker).
{
  const img = flat(200, 50, 50, 255);
  const sSRGB = tintFilter(img, 0.2, 1.0, 0.4, 1.0, 1.0, false);
  const sLin  = tintFilter(img, 0.2, 1.0, 0.4, 1.0, 1.0, true);
  const diffR = Math.abs(sSRGB.data[0] - sLin.data[0]);
  const diffG = Math.abs(sSRGB.data[1] - sLin.data[1]);
  const diffB = Math.abs(sSRGB.data[2] - sLin.data[2]);
  check('linear-path output differs from sRGB-path on saturated input (paths wired)',
        diffR + diffG + diffB >= 10,
        `sRGB=(${sSRGB.data[0]},${sSRGB.data[1]},${sSRGB.data[2]}) lin=(${sLin.data[0]},${sLin.data[1]},${sLin.data[2]})`);
}

// 3. Linear path at intensity=0 is IDENTITY (round-trip through decode/encode
//    is u8-exact for every code, verified in linear.test.ts).
{
  const src = new Uint8ClampedArray([
    0, 0, 0, 255,
    32, 96, 200, 255,
    128, 64, 192, 255,
    255, 255, 255, 255,
  ]);
  const img = new ImageData(src, 4, 1);
  const out = tintFilter(img, 1.0, 0.4, 0.2, 0.0, 1.0, true);
  let ok = true;
  for (let i = 0; i < src.length; i++) { if (out.data[i] !== src[i]) { ok = false; break; } }
  check('linear path at intensity=0 is identity', ok);
}

// 4. Linear path at mix=0 is IDENTITY (final lerp back to original).
{
  const src = new Uint8ClampedArray([0, 0, 0, 255,  128, 128, 128, 255,  200, 100, 50, 255,  255, 255, 255, 255]);
  const img = new ImageData(src, 4, 1);
  const out = tintFilter(img, 1.0, 0.4, 0.2, 1.0, 0.0, true);
  let ok = true;
  for (let i = 0; i < src.length; i++) { if (out.data[i] !== src[i]) { ok = false; break; } }
  check('linear path at mix=0 is identity', ok);
}

// 5. Linear path with a partially-saturated tint on mid-grey: expected value
//    is the FCP-linear-space luma·target computed here, encoded to sRGB.
//    A grey input with a target of (1, 0.4, 0.2) exercises the G/B channels
//    where the sRGB→linear→sRGB non-linearity shows up (R exits at the same
//    code because target R=1 makes tR = lum·1 = lum, which round-trips exact).
{
  const img = flat(128, 128, 128, 255);
  const out = tintFilter(img, 1.0, 0.4, 0.2, 1.0, 1.0, true);
  const lin = srgbChannelToLinear(128);          // ~0.216
  const rLinT = srgbChannelToLinear(1.0 * 255);
  const gLinT = srgbChannelToLinear(0.4 * 255);
  const bLinT = srgbChannelToLinear(0.2 * 255);
  const lumL = 0.299 * lin + 0.587 * lin + 0.114 * lin; // ≈ lin (grey)
  const expR = linearChannelToSrgb(lumL * rLinT);
  const expG = linearChannelToSrgb(lumL * gLinT);
  const expB = linearChannelToSrgb(lumL * bLinT);
  check('linear tint on mid-grey matches decode/apply/encode expectation',
        out.data[0] === expR && out.data[1] === expG && out.data[2] === expB,
        `got (${out.data[0]},${out.data[1]},${out.data[2]}) exp (${expR},${expG},${expB})`);
  // Consequence of the linear math: the G/B channels come out DIMMER than the
  // sRGB path (the sRGB-encoded target 0.4 → linear 0.132, so t = lum·0.132
  // < the sRGB-path t = lum·0.4). This documents the known "linear tint
  // dims sub-unity channels" behaviour that the T-D2b linear branch introduces.
  const outSRGB = tintFilter(img, 1.0, 0.4, 0.2, 1.0, 1.0, false);
  check('linear-path G channel is DIMMER than sRGB-path (linearised target 0.4 → 0.132)',
        out.data[1] < outSRGB.data[1], `linear G=${out.data[1]} vs sRGB G=${outSRGB.data[1]}`);
}

// 6. Registration wiring: the registered filter reads isLinearCompositeEnabled()
//    per call — flipping the flag under try/finally changes the shipped output,
//    then restores the default (matches linear.test.ts's toggle contract).
{
  const uuid = '717D6E01-83F4-4A4B-AF92-42AABA4B176C';
  const mod = lookupFilter({ id: 'test', pluginName: 'tint', uuid, name: 'Tint', parameters: [] } as any);
  if (!mod) { check('lookupFilter finds Tint by UUID', false, 'no module'); }
  else {
    // Build a filter node with Intensity=1, Mix=1, Red/Green/Blue defaults.
    const filter: Filter = {
      id: 'f1', pluginName: 'PAETint', uuid, name: 'Tint',
      parameters: [
        { name: 'Red',       value: 1.0 },
        { name: 'Green',     value: 0.4 },
        { name: 'Blue',      value: 0.2 },
        { name: 'Intensity', value: 1.0 },
        { name: 'Mix',       value: 1.0 },
      ],
    } as any;
    const img = flat(128, 128, 128, 255);
    // Flag OFF (shipped default): sRGB-path output.
    const shippedDefault = isLinearCompositeEnabled();
    check('flag defaults OFF at test entry', shippedDefault === false);
    const offOut = mod.apply(img, makeContext(filter, 0, img.width, img.height));
    // Flag ON under try/finally.
    let onOut: ImageData;
    try {
      setLinearCompositeEnabled(true);
      onOut = mod.apply(img, makeContext(filter, 0, img.width, img.height));
    } finally {
      setLinearCompositeEnabled(false);
    }
    check('flag restored to OFF after try/finally', isLinearCompositeEnabled() === false);
    // The two calls should differ (flag OFF vs ON picks different math).
    let differ = false;
    for (let i = 0; i < 12; i += 4) {
      if (offOut.data[i] !== onOut.data[i] || offOut.data[i + 1] !== onOut.data[i + 1] || offOut.data[i + 2] !== onOut.data[i + 2]) {
        differ = true; break;
      }
    }
    check('registered Tint respects isLinearCompositeEnabled() flag', differ);
  }
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
