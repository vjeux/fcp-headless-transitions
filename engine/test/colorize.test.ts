/**
 * Colorize filter unit tests (PAEColorize / HgcColorize — ROADMAP T-D2a).
 *
 * Pin the two paths of `colorizeRemapFilter`:
 *   1. `linear=false` (SHIPPED DEFAULT): the raw-sRGB-endpoint luma remap that
 *      the GUI GT gate currently favours for the STACKED filter chains that
 *      shipping Colorize users all have (see the ⚠️ block in channel-mixer.ts —
 *      an earlier attempt to linearise endpoints per-filter REGRESSED Curtains
 *      by 0.42 dB because the whole chain has to be linear, not one filter).
 *   2. `linear=true`: the physically-correct linear-working-space branch.
 *      Input sRGB decoded via LUT_SRGB_TO_LINEAR; endpoints (Motion-authored
 *      sRGB colours) decoded once via srgbChannelToLinear; luma computed on
 *      LINEAR RGB via Rec.709 (the HgcColorize slot4 luma vector); remap +
 *      intensity/mix lerps in linear light; encoded back to sRGB at output.
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
import { colorizeRemapFilter } from '../src/compositor/filters/channel-mixer.js';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js';
import {
  isLinearCompositeEnabled, setLinearCompositeEnabled,
  srgbChannelToLinear, linearChannelToSrgb,
} from '../src/compositor/linear.js';
import { luma } from '../src/compositor/blend.js';
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

// 1. Default (linear=false) is UNCHANGED from the legacy sRGB-endpoint remap.
{
  const src = new Uint8ClampedArray([
    0, 0, 0, 255,
    32, 96, 200, 255,
    128, 64, 192, 255,
    255, 255, 255, 255,
  ]);
  const img = new ImageData(src, 4, 1);
  const black = { r: 0.1, g: 0.05, b: 0.2 };
  const white = { r: 0.9, g: 0.85, b: 0.4 };
  const intensity = 0.8;
  const mix = 0.7;
  const out = colorizeRemapFilter(img, black, white, intensity, mix);
  const bR = black.r * 255, bG = black.g * 255, bB = black.b * 255;
  const wR = white.r * 255, wG = white.g * 255, wB = white.b * 255;
  const k = intensity * mix;
  let ok = true, worst = 0;
  for (let i = 0; i < src.length; i += 4) {
    const lum = luma(src[i], src[i + 1], src[i + 2]) / 255;
    const rR = bR + lum * (wR - bR);
    const rG = bG + lum * (wG - bG);
    const rB = bB + lum * (wB - bB);
    const expR = src[i] * (1 - k) + rR * k;
    const expG = src[i + 1] * (1 - k) + rG * k;
    const expB = src[i + 2] * (1 - k) + rB * k;
    // Uint8ClampedArray rounds fractional stores per HTML5 canvas semantics.
    const gotR = out.data[i], gotG = out.data[i + 1], gotB = out.data[i + 2];
    if (Math.abs(gotR - expR) > 1 || Math.abs(gotG - expG) > 1 || Math.abs(gotB - expB) > 1) ok = false;
    worst = Math.max(worst, Math.abs(gotR - expR), Math.abs(gotG - expG), Math.abs(gotB - expB));
    if (out.data[i + 3] !== src[i + 3]) ok = false;
  }
  check('sRGB-path colorize matches legacy formula (≤1 code)', ok, `worst=${worst}`);
}

// 2. Both paths at intensity=0 are identity (k = 0*mix = 0, so out = src).
{
  const src = new Uint8ClampedArray([0, 0, 0, 255,  32, 96, 200, 255,  128, 64, 192, 255,  255, 255, 255, 255]);
  const img = new ImageData(src, 4, 1);
  const outOff = colorizeRemapFilter(img, { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, 0, 1, false);
  const outOn  = colorizeRemapFilter(img, { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, 0, 1, true);
  let okOff = true, okOn = true;
  for (let i = 0; i < src.length; i++) {
    // A fresh Uint8ClampedArray of the source values should round-trip exactly.
    if (outOff.data[i] !== src[i]) okOff = false;
    if (outOn.data[i]  !== src[i]) okOn  = false;
  }
  check('sRGB path at intensity=0 is identity', okOff);
  check('linear path at intensity=0 is identity', okOn);
}

// 3. Both paths at mix=0 are identity.
{
  const src = new Uint8ClampedArray([0, 0, 0, 255,  32, 96, 200, 255,  128, 64, 192, 255,  255, 255, 255, 255]);
  const img = new ImageData(src, 4, 1);
  const outOff = colorizeRemapFilter(img, { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, 1, 0, false);
  const outOn  = colorizeRemapFilter(img, { r: 1, g: 0, b: 0 }, { r: 0, g: 1, b: 0 }, 1, 0, true);
  let okOff = true, okOn = true;
  for (let i = 0; i < src.length; i++) {
    if (outOff.data[i] !== src[i]) okOff = false;
    if (outOn.data[i]  !== src[i]) okOn  = false;
  }
  check('sRGB path at mix=0 is identity', okOff);
  check('linear path at mix=0 is identity', okOn);
}

// 4. Linear path with black=(0,0,0), white=(1,0,0) (a pure-red colorize at
//    intensity=1, mix=1) on a mid-grey input matches the decode/luma/lerp/
//    encode expectation exactly. Uses Rec.709 luma weights on LINEAR RGB.
{
  const img = flat(128, 128, 128, 255);
  const out = colorizeRemapFilter(img,
    { r: 0, g: 0, b: 0 }, { r: 1, g: 0, b: 0 }, 1, 1, true);
  const s = srgbChannelToLinear(128);
  const lumL = 0.2126 * s + 0.7152 * s + 0.0722 * s; // ≈ s (grey)
  const wRl = srgbChannelToLinear(1 * 255);          // 1.0
  const rL = 0 + lumL * (wRl - 0);   // = lumL
  const gL = 0;
  const bL = 0;
  const expR = linearChannelToSrgb(rL);
  const expG = linearChannelToSrgb(gL);
  const expB = linearChannelToSrgb(bL);
  check('linear colorize on mid-grey w/ pure-red endpoints matches decode/apply/encode',
        out.data[0] === expR && out.data[1] === expG && out.data[2] === expB,
        `got (${out.data[0]},${out.data[1]},${out.data[2]}) exp (${expR},${expG},${expB})`);
}

// 5. Linear-path output DIFFERS from sRGB-path output on a saturated colour
//    input (proves the two paths are wired to different math). Red-saturated
//    input + green endpoint white = clearly different luma weighting in the
//    two colour spaces.
{
  const img = flat(200, 50, 50, 255);
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 0, g: 1, b: 0 };
  const outSRGB = colorizeRemapFilter(img, black, white, 1, 1, false);
  const outLin  = colorizeRemapFilter(img, black, white, 1, 1, true);
  const diffR = Math.abs(outSRGB.data[0] - outLin.data[0]);
  const diffG = Math.abs(outSRGB.data[1] - outLin.data[1]);
  const diffB = Math.abs(outSRGB.data[2] - outLin.data[2]);
  check('linear-path output differs from sRGB-path on saturated input (paths wired)',
        diffR + diffG + diffB >= 5,
        `sRGB=(${outSRGB.data[0]},${outSRGB.data[1]},${outSRGB.data[2]}) lin=(${outLin.data[0]},${outLin.data[1]},${outLin.data[2]})`);
}

// 6. Linear-path endpoints round-trip exactly at luma-0/luma-1 extremes: on a
//    pure-black input the output equals the sRGB-encoding of the linear black
//    endpoint; on pure-white it equals the sRGB-encoding of white — proves the
//    endpoint decode/encode round-trip is exact within the u8-round contract.
{
  const black = { r: 0.7, g: 0.1, b: 0.05 };
  const white = { r: 0.3, g: 0.9, b: 0.2 };
  // Pure-black input: lumL = 0 → out = black_lin → encode → sRGB(black).
  const outB = colorizeRemapFilter(flat(0, 0, 0, 255), black, white, 1, 1, true);
  const expBR = linearChannelToSrgb(srgbChannelToLinear(black.r * 255));
  const expBG = linearChannelToSrgb(srgbChannelToLinear(black.g * 255));
  const expBB = linearChannelToSrgb(srgbChannelToLinear(black.b * 255));
  check('linear luma-0 endpoint sRGB-authored round-trips exact',
        outB.data[0] === expBR && outB.data[1] === expBG && outB.data[2] === expBB,
        `got (${outB.data[0]},${outB.data[1]},${outB.data[2]}) exp (${expBR},${expBG},${expBB})`);
  // Pure-white input: lumL = 1 → out = white_lin → encode → sRGB(white).
  const outW = colorizeRemapFilter(flat(255, 255, 255, 255), black, white, 1, 1, true);
  const expWR = linearChannelToSrgb(srgbChannelToLinear(white.r * 255));
  const expWG = linearChannelToSrgb(srgbChannelToLinear(white.g * 255));
  const expWB = linearChannelToSrgb(srgbChannelToLinear(white.b * 255));
  check('linear luma-1 endpoint sRGB-authored round-trips exact',
        outW.data[0] === expWR && outW.data[1] === expWG && outW.data[2] === expWB,
        `got (${outW.data[0]},${outW.data[1]},${outW.data[2]}) exp (${expWR},${expWG},${expWB})`);
}

// 7. Registration wiring: the registered Colorize filter reads
//    isLinearCompositeEnabled() per call — flipping the flag under
//    try/finally changes the output, then restores the default. Matches the
//    contract linear.test.ts / tint.test.ts use.
{
  const uuid = 'D995BBCF-F766-4950-89D5-7A4828CD9B6F';
  const mod = lookupFilter({ id: 'test', pluginName: 'colorize', uuid, name: 'Colorize', parameters: [] } as any);
  if (!mod) { check('lookupFilter finds Colorize by UUID', false, 'no module'); }
  else {
    // Motion nests Remap Black/White under a colour parameter with Red/Green/Blue
    // children — replicate the shape colorizeRemapFilter's registered apply reads.
    const filter: Filter = {
      id: 'f1', pluginName: 'PAEColorize', uuid, name: 'Colorize',
      parameters: [
        { name: 'Remap Black To', children: [
          { name: 'Red',   value: 0.1 },
          { name: 'Green', value: 0.05 },
          { name: 'Blue',  value: 0.2 },
        ] },
        { name: 'Remap White To', children: [
          { name: 'Red',   value: 0.9 },
          { name: 'Green', value: 0.85 },
          { name: 'Blue',  value: 0.4 },
        ] },
        { name: 'Intensity', value: 1.0 },
        { name: 'Mix',       value: 1.0 },
      ],
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
    check('registered Colorize respects isLinearCompositeEnabled() flag', differ);
    // Byte-identity spot-check after flag toggle.
    const offOut2 = mod.apply(img, makeContext(filter, 0, img.width, img.height));
    let sameBytes = true;
    for (let i = 0; i < offOut.data.length; i++) {
      if (offOut.data[i] !== offOut2.data[i]) { sameBytes = false; break; }
    }
    check('flag-OFF output is byte-identical across toggle', sameBytes);
  }
}

// 8. Alpha is preserved on both paths (coverage is not a photon count).
{
  const src = new Uint8ClampedArray([64, 64, 64, 128,  200, 100, 50, 200]);
  const img = new ImageData(src, 2, 1);
  const outSRGB = colorizeRemapFilter(img, { r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 }, 1, 1, false);
  const outLin  = colorizeRemapFilter(img, { r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 }, 1, 1, true);
  check('sRGB-path preserves alpha', outSRGB.data[3] === 128 && outSRGB.data[7] === 200);
  check('linear-path preserves alpha', outLin.data[3] === 128 && outLin.data[7] === 200);
}

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
