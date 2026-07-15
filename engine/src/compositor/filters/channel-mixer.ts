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
 *   luma = dot(r0.xyz, hg_Params[2].xyz)      // hg_Params[2] = luma weights
 *   A = (1-luma)*(tint-1)                      // r1 = r2.x*tint - r2.x, r2.x=1-luma
 *   shadowLeg    = 2*A + 1                      // r2 = r1*2 + 1
 *   highlightLeg = 2*luma*tint - shadowLeg     // r1 = (luma*tint)*2 - r2
 *   sel  = (luma < 0.5) ? 1 : 0                 // r1.w = float(luma < 0.5)
 *   tinted = sel*highlightLeg + shadowLeg      // r1 = r1.w*highlightLeg + shadowLeg
 *   r0.xyz = mix(r0.xyz, tinted, hg_Params[1].xyz)   // hg_Params[1] = Intensity
 *   r0.xyz *= r0.w                             // re-premultiply
 *   ⇒ FCP Tint is a HARD-LIGHT-style tint (a two-leg select about luma 0.5), NOT
 *   the simple `luma*tintColor` lerp the legacy tintFilter below implements.
 *   ⚠️ PHASE-2 PROBE (tools/re/filter_probe, TintFx over image A, tint=[1,0,0],
 *   Intensity=1): the exact-shader transcription above (sRGB space, either 601 or
 *   709 luma) reproduces the RED channel (255) but lands the suppressed G/B at ~29
 *   vs FCP's ~56 (mean|err|~21). The residual is NOT linear-light (that's worse,
 *   err~45).
 *   ⚠️ 2026-07-15 RE-DECODE (captured a REAL headless FCP TintFx render, tint=[1,0,0]
 *   Intensity=1, and reduced it numerically — see docs/FILTER_RE_PHASE2.md "Tint
 *   zero-channel decode"):
 *     · The "Color-Space (id=11)=3" nuance the earlier note speculated about is
 *       DISPROVEN — TintFx has NO id=11 param. The REAL param set (verified against
 *       the shipping Leaves.motr TintFx block, factoryID=13) is exactly:
 *         Color(id=1){Red id=1, Green id=2, Blue id=3}, Intensity(id=2),
 *         Mix(id=10001), Flip(id=10002), Input Points(id=10003).
 *       (The legacy registration reading top-level Red/Green/Blue is still a
 *       param-name bug — the real color is the nested Color group.)
 *     · FCP's zero-tint channels are ALWAYS EQUAL (G==B for tint=[1,0,0]) → they are
 *       driven by a single shared luma leg, confirming the shared-luma shader shape.
 *     · BUT the transfer is SMOOTHER than the disassembled hard `sel=(luma<0.5)`
 *       branch: the hard branch gives 2*lum-1 (mean|Δ|G≈10.8 vs FCP), whereas FCP's
 *       zero channel is fit to sub-LSB (mean|Δ|G≈0.85) by a *smoothstep* in sRGB-601
 *       luma, smoothstep(≈0.27, ≈1.22, lum). Replacing `sel` with a smoothstep INSIDE
 *       the exact two-leg formula does NOT converge (errRGB≈19.8) — so the smoothstep
 *       is an empirical descriptor of the zero-channel OUTPUT, not the decoded shader
 *       structure. Linear-space, gamma-on-luma, and 601/709-mix variants were all
 *       swept and all fit worse or non-cleanly (best gamma p≈0.85 is not a canonical
 *       constant). Per the decode-don't-fit rule this stays a documented CEILING: the
 *       shipped `lum*color` lerp is retained (it happens to sit closer to Leaves' near-
 *       gray GUI-GT pixels than the faithful-but-still-imperfect hard-light — the 2026-
 *       07-11 hard-light rewrite REGRESSED Leaves 12.24→11.69). The true FCP select is
 *       a smooth (mix/smoothstep) blend, NOT the hard luma<0.5 branch in the disasm.
 *   ⚠️ ATTEMPTED + REVERTED (2026-07-11, GUI-GT gate): rewrote tintFilter to the
 *   verbatim hard-light shader (709 luma) AND fixed the nested-Color param read. The
 *   probe confirmed the hard-light SHAPE + gray-tint output match FCP (gray tint 0.443
 *   -> PSNR 27, 709 beats 601), but on the real GUI GT it REGRESSED Objects__Leaves
 *   12.24 -> 11.69 (-0.55, gate FAIL). Reason: the unresolved color-space/gamma step
 *   means the (correct-shape) hard-light output is farther from FCP's ACTUAL pixels
 *   than the old `lum*color` lerp happened to be for Leaves' near-gray tint. So the
 *   faithful shader is a NET GUI-GT REGRESSION until the color-space piece is pinned.
 *   Do NOT re-apply the hard-light rewrite without ALSO resolving the gamma/color-space
 *   step and confirming `fct gate engine` stays green. Tint is used by only 4
 *   transitions (Glide/Wipes+Stylized Diagonal/Leaves), all dominated by other gaps.
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
import { luma601, luma } from '../blend.js';
import { registerFilter } from './registry.js';
import { evaluateCurve } from '../../evaluator/curves.js';
import {
  isLinearCompositeEnabled,
  LUT_SRGB_TO_LINEAR,
  linearChannelToSrgb,
  srgbChannelToLinear,
} from '../linear.js';

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
    const r = src[i] / 255;
    const g = src[i + 1] / 255;
    const b = src[i + 2] / 255;
    const a = src[i + 3] / 255;

    let outR: number, outG: number, outB: number, outA: number;
    if (monochrome) {
      // FCP Monochrome mode (constrainMonoParams): ALL channels take the RED-row
      // weighted sum; the Green/Blue rows are IGNORED (verified vs headless FCP:
      // out = [gray,gray,gray] with gray = R*matrix[0]+G*matrix[1]+B*matrix[2], the
      // Red Output weights). The old code did luma601 THEN re-applied the full matrix
      // (double-processing -> wrong G/B). Alpha row still applies to alpha.
      const gray = matrix[0] * r + matrix[1] * g + matrix[2] * b + offsets[0];
      outR = outG = outB = gray;
      outA = matrix[12] * r + matrix[13] * g + matrix[14] * b + matrix[15] * a + offsets[3];
    } else {
      outR = matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3] * a + offsets[0];
      outG = matrix[4] * r + matrix[5] * g + matrix[6] * b + matrix[7] * a + offsets[1];
      outB = matrix[8] * r + matrix[9] * g + matrix[10] * b + matrix[11] * a + offsets[2];
      outA = matrix[12] * r + matrix[13] * g + matrix[14] * b + matrix[15] * a + offsets[3];
    }

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
 * @param r, g, b - target tint color (0-1, sRGB-encoded as authored in Motion UI)
 * @param intensity - tint strength (0-1)
 * @param mix - blend with original
 * @param linear - when true, do all math in linear working-space per FCP's
 *   kCGColorSpaceExtendedLinearSRGB pipeline (decoded 2026-07-12 in
 *   oz_render.mm — see linear.ts). Wired to isLinearCompositeEnabled() at
 *   the registry callsite; flag defaults OFF so shipped behaviour is
 *   byte-identical (T-D2b safety contract).
 */
export function tintFilter(input: ImageData, r: number, g: number, b: number, intensity: number, mix: number = 1, linear: boolean = false): ImageData {
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  if (linear) {
    // FCP runs the tint shader in linear working space (see linear.ts). The
    // sRGB-authored target colour (Motion UI) is decoded to linear ONCE, the
    // luma-scaled tint is computed on linear-light values, the intensity/mix
    // lerps happen in linear, and the final result is encoded back to sRGB
    // at output — same "decode once / encode once" contract as T-D1's
    // linearOverlay. Note: this is a PER-FILTER decode/encode; the ceiling
    // (single linear buffer chained across all filters) is reached only when
    // T-D2a-d have all landed and the outer compositor keeps a Float32 buffer
    // across the whole filter chain. Until then the per-filter path is
    // guarded by isLinearCompositeEnabled() (default OFF) so no regression
    // can be introduced from the shipped default.
    const rLin = srgbChannelToLinear(r * 255);
    const gLin = srgbChannelToLinear(g * 255);
    const bLin = srgbChannelToLinear(b * 255);
    const lut = LUT_SRGB_TO_LINEAR;
    for (let i = 0; i < src.length; i += 4) {
      const srL = lut[src[i]];
      const sgL = lut[src[i + 1]];
      const sbL = lut[src[i + 2]];
      // Rec.601 luma weights (matches sRGB-path tintFilter above; the FCP
      // luma vector is stored in HgcTint's hg_Params[2]; documented above).
      const lumL = 0.299 * srL + 0.587 * sgL + 0.114 * sbL;
      const tR = lumL * rLin;
      const tG = lumL * gLin;
      const tB = lumL * bLin;
      // Intensity lerp in linear.
      let iR = srL * (1 - intensity) + tR * intensity;
      let iG = sgL * (1 - intensity) + tG * intensity;
      let iB = sbL * (1 - intensity) + tB * intensity;
      // Mix lerp in linear.
      if (mix < 1) {
        iR = srL * (1 - mix) + iR * mix;
        iG = sgL * (1 - mix) + iG * mix;
        iB = sbL * (1 - mix) + iB * mix;
      }
      out[i]     = linearChannelToSrgb(iR);
      out[i + 1] = linearChannelToSrgb(iG);
      out[i + 2] = linearChannelToSrgb(iB);
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, width, height);
  }

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
 * Motion "Colorize" — a luminance remap from `black` (luma 0) to `white` (luma 1),
 * blended over the original by `intensity` (the colorize AMOUNT), then cross-faded
 * with the original by `mix` (the final blend). Verbatim HgcColorize:
 *   remapped = mix(black, white, luma)          // hg_Params[0..1], luma dot hg_Params[4]
 *   colorized = mix(orig, remapped, intensity)  // hg_Params[2] = Intensity
 *   out = mix(orig, colorized, mix)              // hg_Params[3] = Mix
 * PHASE-2 VERIFIED (tools/re/filter_verify): at Intensity=0 FCP returns the ORIGINAL
 * image unchanged (identity); the earlier one-stage form ignored Intensity and always
 * applied the full remap. All 9 built-in Colorize transitions use Intensity=1 (so this
 * is gate-neutral on them) but the two-stage form is correct across the full param
 * space. Colors are 0-1 RGB.
 * ⚠️ REMAINING GAP (Phase-2, not yet fixed): at Intensity=1 the R/G channels match FCP
 * (~98 vs ~102) but the B channel diverges (FCP ~11 vs TS ~76 for a black.B=0.5/
 * white.B=0 remap) — FCP's effective luma per channel is inconsistent with a single
 * 601 dot, so the remap target math is more than `mix(black,white,luma601)`. Likely a
 * different luma vector (hg_Params[4]) and/or a premultiplied/HDR-Rec709 path (the
 * .motr carries a "Colorize::HDR In Rec. 709" param). Needs a flat-input luma-curve
 * probe to pin before changing the remap; the Intensity plumbing above is correct and
 * shipped independently.
 */
export function colorizeRemapFilter(
  input: ImageData,
  black: { r: number; g: number; b: number },
  white: { r: number; g: number; b: number },
  intensity: number = 1,
  mix: number = 1,
): ImageData {
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  // DECODED 2026-07-12: FCP renders in a LINEAR sRGB working space (see
  // docs/FILTER_RE_PHASE2.md "RESOLVED"). On an ISOLATED probe, FCP sRGB->linear
  // DECODES the "Remap Black/White To" colours before the luma lerp and emits the
  // result to the linear framebuffer as-is, so the net gradient transfer is
  //   out_code = 255·( s2l(black) + luma·(s2l(white) − s2l(black)) )   (luma from sRGB codes)
  // and linearising the endpoints lands the ISOLATED sepia probe at mad 3.88 (vs 18.5
  // with raw endpoints). HOWEVER shipping the endpoint-linearisation PER-FILTER
  // REGRESSED the GUI-GT gate on the real Colorize transitions (Curtains −0.42,
  // Stylized__Slide −0.76, Up-Over −0.52), because those STACK Colorize with other
  // filters and FCP keeps the whole chain in linear + encodes ONCE at readback (a
  // per-filter re-encode diverges — the same architecture limit that keeps
  // Brightness>1 on the plain-multiply, see levels.ts). Per ROADMAP rule 1 (GUI GT is
  // the one truth) the shipped code keeps the RAW sRGB endpoints: it is what the GUI
  // GT prefers for the stacked chain. Closing the isolated gap needs a linear
  // filter-chain (encode once after all filters), tracked as an engine-architecture item.
  const bR = black.r * 255, bG = black.g * 255, bB = black.b * 255;
  const wR = white.r * 255, wG = white.g * 255, wB = white.b * 255;
  // total blend from original toward the remapped color = intensity * mix (both
  // stages lerp original->target, so they compose to a single lerp factor).
  const k = intensity * mix;
  for (let i = 0; i < src.length; i += 4) {
    // DECODED: HgcColorize dots against slot4 = the Y row of
    // colorMatrixFromDesiredRGBToYCbCr (PAEColorize @0x1b1f4). For HD that is the
    // Rec.709 luma (0.2126/0.7152/0.0722), NOT Rec.601 — measured closer to headless.
    // Luma is computed on the sRGB code values (the shader unpremults but does NOT
    // linearise the input before the dot).
    const lum = luma(src[i], src[i + 1], src[i + 2]) / 255;
    const rR = bR + lum * (wR - bR);
    const rG = bG + lum * (wG - bG);
    const rB = bB + lum * (wB - bB);
    out[i] = src[i] * (1 - k) + rR * k;
    out[i + 1] = src[i + 1] * (1 - k) + rG * k;
    out[i + 2] = src[i + 2] * (1 - k) + rB * k;
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, input.width, input.height);
}

// Channel Mixer (UUID B2E0DE39-…). The per-channel weights are NESTED children of the
// "Red/Green/Blue Output" group params (Motion nests "Red - Red"/"Red - Green"/
// "Red - Blue" under "Red Output"), so a flat ctx.param('Red - Red') NEVER finds them
// and the matrix stayed identity (verified vs headless FCP: TS left R unchanged where
// FCP applied the luma weights). This reads the nested children (with a flat fallback).
registerFilter({
  uuid: 'B2E0DE39-119F-4AD6-8796-C18BF8FE27B8',
  names: ['channel mixer', 'channelmixer'],
  label: 'Channel Mixer',
  apply(input, ctx) {
    const t = ctx.time;
    // Read a weight that lives EITHER as a nested child of `group` OR as a flat param.
    const w = (group: string, child: string, def: number): number => {
      const g = ctx.filter.parameters.find(p => p.name === group);
      const c = g?.children?.find(cc => cc.name === child);
      if (c) {
        if (c.curve) return evaluateCurve(c.curve, t);
        if (typeof c.value === 'number') return c.value;
      }
      return ctx.param(child, def);  // flat fallback (+ rig overrides)
    };
    const matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    matrix[0] = w('Red Output', 'Red - Red', 1);    matrix[1] = w('Red Output', 'Red - Green', 0);    matrix[2] = w('Red Output', 'Red - Blue', 0);
    matrix[4] = w('Green Output', 'Green - Red', 0); matrix[5] = w('Green Output', 'Green - Green', 1); matrix[6] = w('Green Output', 'Green - Blue', 0);
    matrix[8] = w('Blue Output', 'Blue - Red', 0);   matrix[9] = w('Blue Output', 'Blue - Green', 0);   matrix[10] = w('Blue Output', 'Blue - Blue', 1);
    // The "* - Alpha" child of each output group is that channel's constant OFFSET
    // (the shader's 4-wide dot row uses r1.w=1, so the -Alpha term adds directly).
    const offsets = [
      w('Red Output', 'Red - Alpha', 0),
      w('Green Output', 'Green - Alpha', 0),
      w('Blue Output', 'Blue - Alpha', 0),
      0,
    ];
    const mix = ctx.param('Mix', 1);
    const monochrome = ctx.param('Monochrome', 0) > 0;
    return channelMixerFilter(input, { matrix, offsets, mix, monochrome });
  },
});

// Tint (PAETint, UUID 717D6E01-…). Behavior-identical: Red/Green/Blue (default 1),
// Intensity (1), Mix (1). The `linear` flag opts into the T-D1 linear working-
// space branch of tintFilter (see linear.ts) — defaults OFF so shipped output
// is byte-identical; flips ON alongside the sibling T-D2a/c/d migrations when
// the linear composite chain is enabled end-to-end.
registerFilter({
  uuid: '717D6E01-83F4-4A4B-AF92-42AABA4B176C',
  names: ['tint'],
  label: 'Tint',
  apply(input, ctx) {
    return tintFilter(input, ctx.param('Red', 1), ctx.param('Green', 1), ctx.param('Blue', 1),
                      ctx.param('Intensity', 1), ctx.param('Mix', 1),
                      isLinearCompositeEnabled());
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
    // Colour-Link overrides (ROADMAP S1/T-A1). A `Link remap black`/`white`
    // behaviour on the enclosing scenenode has piped a source shape's Fill Color
    // RGB into this filter's Remap Black/White folder. The evaluator merges those
    // as special `__ColorLink.RemapBlack.{Red|Green|Blue}` / `.RemapWhite.*` keys
    // in ctx.overrides; when present, they REPLACE the filter's own nested-child
    // Remap value per channel. Per-channel: an override for just Red keeps the
    // filter's own Green/Blue (the built-in colour Links always drive all three
    // R/G/B siblings, but the plumbing is per-channel for future partial links).
    const black = readColor('Remap Black To', { r: 0, g: 0, b: 0 });
    const white = readColor('Remap White To', { r: 1, g: 1, b: 1 });
    if (ctx.overrides) {
      const bR = ctx.overrides.get('__ColorLink.RemapBlack.Red');
      const bG = ctx.overrides.get('__ColorLink.RemapBlack.Green');
      const bB = ctx.overrides.get('__ColorLink.RemapBlack.Blue');
      if (bR !== undefined) black.r = bR;
      if (bG !== undefined) black.g = bG;
      if (bB !== undefined) black.b = bB;
      const wR = ctx.overrides.get('__ColorLink.RemapWhite.Red');
      const wG = ctx.overrides.get('__ColorLink.RemapWhite.Green');
      const wB = ctx.overrides.get('__ColorLink.RemapWhite.Blue');
      if (wR !== undefined) white.r = wR;
      if (wG !== undefined) white.g = wG;
      if (wB !== undefined) white.b = wB;
    }
    const readScalar = (name: string, def: number): number => {
      const p = ctx.filter.parameters.find(pp => pp.name === name);
      if (!p) return def;
      const v = p.curve ? evaluateCurve(p.curve, t) : (typeof p.value === 'number' ? p.value : undefined);
      return v ?? def;
    };
    const intensity = readScalar('Intensity', 1);  // hg_Params[2]: colorize amount
    const mix = readScalar('Mix', 1);               // hg_Params[3]: final blend
    return colorizeRemapFilter(input, black, white, intensity, mix);
  },
});
