/**
 * Channel Mixer / Tint / Colorize filters.
 *
 * ============================ FCP REVERSE-ENGINEERING ============================
 * Source of truth: the verbatim Metal fragment sources embedded in FCP's Filters
 * binary (extract with `tools/re/extract_shader.py Hgc<Name>`) + the `-[PAE<Name>
 * frameSetup]` disassembly that fills `hg_Params[]`. All three filters here operate
 * on UN-premultiplied color then re-premultiply, and `mix()` toward the original by
 * a per-filter Mix param — a shared Motion filter idiom.
 *
 * --- HgcChannelMixer (PAEChannelMixer, UUID B2E0DE39-…) — VERBATIM shader ---
 *   r0  = color0                              // premultiplied input
 *   r1  = r0 / max(r0.w, 1e-6)   (rgb),  r1.w = 1     // UN-premultiply; alpha row uses 1
 *   r3.x = dot(r1, hg_Params[0])              // Red-out  = RR*r + RG*g + RB*b + RA*1
 *   r3.y = dot(r1, hg_Params[1])              // Green-out = GR*r + GG*g + GB*b + GA*1
 *   r3.z = dot(r1, hg_Params[2])              // Blue-out  = BR*r + BG*g + BB*b + BA*1
 *   r3.w = clamp(dot(r1, hg_Params[3]),0,1)   // Alpha-out (clamped)
 *   r3.xyz *= r3.w                            // RE-premultiply by the NEW alpha
 *   out = mix(r0, r3, hg_Params[4])           // hg_Params[4] = Mix (per-channel float4)
 *   NOTE: FCP's mix rows are 4-wide DOTS incl. the ALPHA column (…-Alpha) and the
 *   4th component of each row is the OFFSET applied via r1.w=1 (so "Red - Alpha"
 *   doubles as the Red output offset). The clamp is on ALPHA only; RGB is NOT
 *   clamped in-shader (the framebuffer format clamps on store). Monochrome is a
 *   CPU-side param preset (constrainMonoParams:) that sets all three rows to the
 *   same luma weights — there is no separate mono branch in the shader.
 *
 * --- HgcTint (PAETint, UUID 717D6E01-…) — VERBATIM shader ---
 *   r0  = color0;  r0 = r0 / max(r0.w,1e-6)   // un-premultiply (rgb), alpha kept
 *   r1.w = dot(r0.xyz, hg_Params[2].xyz)      // LUMA (hg_Params[2] = luma weights)
 *   // two-slope tint ramp about luma 0.5, toward hg_Params[0] (tint color):
 *   r2.x = 1 - luma
 *   r1.xyz = r2.x*tint - r2.x                 //  (tint-1)*(1-luma)     [shadows leg]
 *   r2.xyz = r1.xyz*2 + 1                      //  2*that + 1
 *   r1.xyz = luma*tint                         //  luma*tint            [highlights leg]
 *   r1.xyz = r1.xyz*2 - r2.xyz                 //  2*that - shadowsLeg
 *   sel   = (luma < 0.5) ? 1 : 0
 *   r1.xyz = sel*r1.xyz + r2.xyz               // pick leg by luma<0.5  (a "hard-light"-style tint)
 *   r0.xyz = mix(r0.xyz, r1.xyz, hg_Params[1].xyz)  // hg_Params[1] = Amount/Intensity
 *   r0.xyz *= r0.w                             // re-premultiply
 *   ⇒ FCP Tint is a HARD-LIGHT blend of the image luma against the tint color, NOT
 *   the simple `luma*tintColor` lerp the legacy tintFilter below implements. (See
 *   Phase-2 TODO: tintFilter is only correct at Intensity ramps where luma≈mid.)
 *
 * --- HgcColorize (PAEColorize, UUID D995BBCF-…) — VERBATIM shader ---
 *   r0  = color0
 *   r1.xyz = r0.xyz / max(r0.w,1e-6)          // un-premultiply
 *   r1.w = dot(r1.xyz, hg_Params[4].xyz)      // LUMA (hg_Params[4] = luma weights)
 *   r2.xyz = mix(hg_Params[0], hg_Params[1], luma)   // blackPoint→whitePoint by luma
 *   r1.xyz = mix(r1.xyz, r2.xyz, hg_Params[2].xyz)   // hg_Params[2] = colorize Amount
 *   r1.xyz *= r0.w                            // re-premultiply
 *   out = mix(r0, r1, hg_Params[3])           // hg_Params[3] = Mix
 *   ⇒ this is exactly the black→white luminance remap colorizeRemapFilter implements
 *   (hg_Params[0]="Remap Black To", hg_Params[1]="Remap White To"); the only nuance
 *   is the intermediate colorize-Amount (hg_Params[2]) vs the final Mix (hg_Params[3]).
 *
 * LUMA WEIGHTS: PAEColorize/Tint/Desaturate load their dot vector from __TEXT,__const;
 * both Rec.601 (0.299,0.587,0.114) and Rec.709 (0.2126,0.7152,0.0722) vectors exist
 * in the binary. luma601() below is used as the current approximation — Phase-2 must
 * confirm which each filter loads (see docs/FILTER_RE.md).
 * ============================================================================
 *
 * Used by: 16 transitions for color manipulation (desaturation, color swap, tinting).
 *
 * Legacy TS matrix form (row-major 4x4 + offsets) — see channelMixerFilter:
 *   outChannel = sum(inChannels * row) + offset,  then mix with original.
 */
import { luma601 } from '../blend.js';
import { registerFilter } from './registry.js';
import { evaluateCurve } from '../../evaluator/curves.js';

export interface ChannelMixerParams {
  matrix: number[]; // 4x4 row-major [RR,RG,RB,RA, GR,GG,GB,GA, BR,BG,BB,BA, AR,AG,AB,AA]
  offsets: number[]; // [R,G,B,A] output offsets (0-1 normalized)
  mix: number;
  monochrome: boolean;
}

/**
 * Apply channel mixer to an image.
 */
export function channelMixerFilter(input: ImageData, params: ChannelMixerParams): ImageData {
  const { matrix, offsets, mix, monochrome } = params;
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i] / 255;
    let g = src[i + 1] / 255;
    let b = src[i + 2] / 255;
    let a = src[i + 3] / 255;

    if (monochrome) {
      // Convert to grayscale first (luminance-based)
      const lum = luma601(r, g, b);
      r = g = b = lum;
    }

    // Apply 4x4 matrix
    const outR = matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3] * a + offsets[0];
    const outG = matrix[4] * r + matrix[5] * g + matrix[6] * b + matrix[7] * a + offsets[1];
    const outB = matrix[8] * r + matrix[9] * g + matrix[10] * b + matrix[11] * a + offsets[2];
    const outA = matrix[12] * r + matrix[13] * g + matrix[14] * b + matrix[15] * a + offsets[3];

    // Mix with original
    if (mix >= 1) {
      out[i] = Math.round(Math.max(0, Math.min(1, outR)) * 255);
      out[i + 1] = Math.round(Math.max(0, Math.min(1, outG)) * 255);
      out[i + 2] = Math.round(Math.max(0, Math.min(1, outB)) * 255);
      out[i + 3] = Math.round(Math.max(0, Math.min(1, outA)) * 255);
    } else {
      out[i] = Math.round((src[i] / 255 * (1 - mix) + Math.max(0, Math.min(1, outR)) * mix) * 255);
      out[i + 1] = Math.round((src[i + 1] / 255 * (1 - mix) + Math.max(0, Math.min(1, outG)) * mix) * 255);
      out[i + 2] = Math.round((src[i + 2] / 255 * (1 - mix) + Math.max(0, Math.min(1, outB)) * mix) * 255);
      out[i + 3] = Math.round((src[i + 3] / 255 * (1 - mix) + Math.max(0, Math.min(1, outA)) * mix) * 255);
    }
  }

  return new ImageData(out, width, height);
}

/**
 * Tint filter (PAETint / TintFx).
 * Tints the image toward a target color, scaled by luminance and intensity.
 * @param r, g, b - target tint color (0-1)
 * @param intensity - tint strength (0-1)
 * @param mix - blend with original
 */
export function tintFilter(input: ImageData, r: number, g: number, b: number, intensity: number, mix: number = 1): ImageData {
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  for (let i = 0; i < src.length; i += 4) {
    const lum = luma601(src[i], src[i + 1], src[i + 2]) / 255;
    // Tinted color = luminance × target color
    const tR = lum * r * 255;
    const tG = lum * g * 255;
    const tB = lum * b * 255;
    // Apply intensity (blend between original and tinted)
    const iR = src[i] * (1 - intensity) + tR * intensity;
    const iG = src[i + 1] * (1 - intensity) + tG * intensity;
    const iB = src[i + 2] * (1 - intensity) + tB * intensity;
    // Apply mix (blend with original)
    if (mix >= 1) {
      out[i] = Math.round(iR); out[i + 1] = Math.round(iG); out[i + 2] = Math.round(iB);
    } else {
      out[i] = Math.round(src[i] * (1 - mix) + iR * mix);
      out[i + 1] = Math.round(src[i + 1] * (1 - mix) + iG * mix);
      out[i + 2] = Math.round(src[i + 2] * (1 - mix) + iB * mix);
    }
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}

/**
 * Motion "Colorize" as a black-point/white-point luminance remap.
 *
 * Unlike a hue tint, Motion's Colorize maps each pixel's LUMINANCE through a
 * gradient from `black` (at luminance 0) to `white` (at luminance 1):
 *   out = black + luminance * (white - black)
 * Colors are 0-1 RGB. This is what the Stylized/Documentary/Slide tiles use to
 * recolor their grayscale tile PNGs (Remap Black To → dark, Remap White To →
 * the selected accent color). `mix` cross-fades with the original pixel.
 */
export function colorizeRemapFilter(
  input: ImageData,
  black: { r: number; g: number; b: number },
  white: { r: number; g: number; b: number },
  mix: number = 1,
): ImageData {
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const bR = black.r * 255, bG = black.g * 255, bB = black.b * 255;
  const wR = white.r * 255, wG = white.g * 255, wB = white.b * 255;
  for (let i = 0; i < src.length; i += 4) {
    const lum = luma601(src[i], src[i + 1], src[i + 2]) / 255;
    const rR = bR + lum * (wR - bR);
    const rG = bG + lum * (wG - bG);
    const rB = bB + lum * (wB - bB);
    if (mix >= 1) {
      out[i] = rR; out[i + 1] = rG; out[i + 2] = rB;
    } else {
      out[i] = src[i] * (1 - mix) + rR * mix;
      out[i + 1] = src[i + 1] * (1 - mix) + rG * mix;
      out[i + 2] = src[i + 2] * (1 - mix) + rB * mix;
    }
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, input.width, input.height);
}

// Channel Mixer (UUID B2E0DE39-…). Behavior-identical to the legacy branch: builds
// a 4x4 matrix + offsets from the per-channel params (identity default), Mix (1),
// Monochrome (bool). Unset params keep their identity/zero defaults.
registerFilter({
  uuid: 'B2E0DE39-119F-4AD6-8796-C18BF8FE27B8',
  names: ['channel mixer', 'channelmixer'],
  label: 'Channel Mixer',
  apply(input, ctx) {
    const matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    matrix[0] = ctx.param('Red - Red', 1);   matrix[1] = ctx.param('Red - Green', 0);   matrix[2] = ctx.param('Red - Blue', 0);
    matrix[4] = ctx.param('Green - Red', 0);  matrix[5] = ctx.param('Green - Green', 1); matrix[6] = ctx.param('Green - Blue', 0);
    matrix[8] = ctx.param('Blue - Red', 0);   matrix[9] = ctx.param('Blue - Green', 0);  matrix[10] = ctx.param('Blue - Blue', 1);
    const offsets = [ctx.param('Red Output', 0), ctx.param('Green Output', 0), ctx.param('Blue Output', 0), 0];
    const mix = ctx.param('Mix', 1);
    const monochrome = ctx.param('Monochrome', 0) > 0;
    return channelMixerFilter(input, { matrix, offsets, mix, monochrome });
  },
});

// Tint (PAETint, UUID 717D6E01-…). Behavior-identical: Red/Green/Blue (default 1),
// Intensity (1), Mix (1).
registerFilter({
  uuid: '717D6E01-83F4-4A4B-AF92-42AABA4B176C',
  names: ['tint'],
  label: 'Tint',
  apply(input, ctx) {
    return tintFilter(input, ctx.param('Red', 1), ctx.param('Green', 1), ctx.param('Blue', 1),
                      ctx.param('Intensity', 1), ctx.param('Mix', 1));
  },
});

// Colorize (PAEColorize, UUID D995BBCF-…). FAITHFUL migration of the legacy branch:
// a luminance remap from "Remap Black To" (lum 0) to "Remap White To" (lum 1), each
// a nested RGB color param (children Red/Green/Blue). Reads the filter's own params
// directly (ignores rig overrides), matching the legacy dispatch exactly.
registerFilter({
  uuid: 'D995BBCF-F766-4950-89D5-7A4828CD9B6F',
  names: ['colorize'],
  label: 'Colorize',
  apply(input, ctx) {
    const t = ctx.time;
    const readColor = (paramName: string, def: {r:number;g:number;b:number}) => {
      const p = ctx.filter.parameters.find(pp => pp.name === paramName);
      if (!p) return def;
      const ch = (n: string): number | undefined => {
        const c = p.children?.find(cc => cc.name === n);
        if (!c) return undefined;
        return c.curve ? evaluateCurve(c.curve, t) : (typeof c.value === 'number' ? c.value : undefined);
      };
      return { r: ch('Red') ?? def.r, g: ch('Green') ?? def.g, b: ch('Blue') ?? def.b };
    };
    const black = readColor('Remap Black To', { r: 0, g: 0, b: 0 });
    const white = readColor('Remap White To', { r: 1, g: 1, b: 1 });
    let mix = 1;
    const mixP = ctx.filter.parameters.find(p => p.name === 'Mix');
    if (mixP) {
      const v = mixP.curve ? evaluateCurve(mixP.curve, t) : (typeof mixP.value === 'number' ? mixP.value : undefined);
      if (v !== undefined) mix = v;
    }
    return colorizeRemapFilter(input, black, white, mix);
  },
});
