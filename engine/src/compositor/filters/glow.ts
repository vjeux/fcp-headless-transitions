/**
 * Glow / Bloom filter implementation.
 *
 * Used by: Lights/Bloom, Lights/Lens Flare, and other light-based transitions.
 * Plugin names: PAEGlow, PAEBloom, Glow, Bloom
 *
 * Algorithm:
 *   1. Extract pixels above brightness threshold
 *   2. Blur the thresholded image (Gaussian)
 *   3. Add the blurred highlights back onto the original (screen blend)
 *
 * Parameters:
 *   - Radius: blur radius for the glow spread (default 0)
 *   - Threshold: brightness threshold 0-1 (pixels below this don't glow)
 *   - Amount/Intensity: strength of the glow overlay (default 1)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * PHASE-1 RE NOTES — verbatim FCP Metal shaders (Filters.bundle)
 * Extract with: venv/bin/python3 tools/re/extract_shader.py <Name>
 * The glow pipeline in FCP is THREE fragment shaders + a Gaussian blur between
 * the mask pass and the combine pass. Our TS collapses all three into
 * glowFilter(); the notes below record exactly what each real pass does so
 * Phase-2 can align the math.
 *
 * ── PASS 1 — HgcGlow (the threshold / luma-mask that feeds the blur) ──────────
 *   FragmentOut HgcGlow_hgc_visible(const constant float4* hg_Params, float4 color0):
 *     r0   = color0;
 *     r0.w = clamp(dot(r0, hg_Params[0]), 0, 1);   // dot of the *whole* rgba, not rgb
 *     r0.xyz = r0.xyz * r0.www;                     // premultiply rgb by the new mask alpha
 *     out  = r0;
 *   hg_Params SLOT MAP:
 *     hg_Params[0] = (lumaScale·wR, lumaScale·wG, lumaScale·wB, bias) — DECODED
 *                    2026-07-12 from -[PAEGlow canThrowRenderOutput] @0xceb54:
 *                      d0 = Softness (parm 4),  d2 = Threshold (parm 3)
 *                      lumaScale (d9) = 1 / Softness        (FLT_MAX if Softness==0)
 *                      bias      (d8) = -(Threshold - 0.5·Softness) / Softness
 *                                     = -(Threshold/Softness) + 0.5
 *                      (wR,wG,wB) = the Y row of colorMatrixFromDesiredRGBToYCbCr
 *                                   (Rec.709: 0.2126, 0.7152, 0.0722)
 *                    So the mask alpha is the SOFT linear ramp
 *                      a = clamp(luma709/Softness + bias, 0, 1)
 *                        = clamp((luma709 − Threshold)/Softness + 0.5, 0, 1)
 *                    i.e. a linear ramp centred at Threshold, full width = Softness
 *                    (a==0 below Threshold−Softness/2, a==1 above Threshold+Softness/2).
 *                    Softness==0 collapses it to a hard step (infinite slope). The
 *                    source ALPHA also enters the dot via hg_Params[0].w · alpha, but
 *                    for opaque input (alpha=1) that just adds the constant bias, which
 *                    is already the .w term. RGB is then premultiplied by this alpha,
 *                    so the extracted glow layer is rgb·a (partial for mid-bright px),
 *                    NOT the old hard full-or-zero keep.

 *
 * ── PASS 2 — Gaussian blur (separate shader/pass; see gaussian-blur.ts) ───────
 *
 * ── PASS 3 — HgcGlowCombineFx (composite blurred glow over the original) ──────
 *   Inputs: color0 = original, color1 = blurred glow.
 *     r0   = color1;
 *     r1.w   = clamp(r0.w * hg_Params[0].x, 0, 1);        // glow coverage
 *     r0.xyz = r0.xyz * hg_Params[0].xxx;                 // gain the glow rgb
 *     r1.xyz = min(r0.xyz, hg_Params[1].xyz);             // clamp to a ceiling
 *     r1.xyz = max(r1.xyz, 0);
 *     out    = (1 - r1.w) * color0 + r1;                  // over-composite
 *   hg_Params SLOT MAP:
 *     hg_Params[0].x  = glow gain / opacity (scales both glow.rgb and its alpha)
 *     hg_Params[1].xyz = per-channel clamp ceiling for the gained glow rgb
 *   NOTE: this is an OVER composite gated by the blurred alpha — out =
 *   lerp(color0, glow, glowAlpha) + (glow.rgb beyond the alpha term). Because
 *   glow.rgb is added on top of (1-a)*orig it reads as a screen/plus-lighter add
 *   near bright cores and a straight over toward the edges.
 *
 * ── Related optional passes (not wired into our glowFilter yet) ───────────────
 *   HgcOuterGlowColorize: colorizes an alpha-only glow between two colors:
 *     a = min(color0.w * hg_Params[3].x, 1);
 *     rgb = mix(hg_Params[0].xyz [inner], hg_Params[1].xyz [outer], a);
 *     out.w = min(a * hg_Params[2].x, 1);  out.rgb = rgb * out.w;  (premultiplied)
 *     SLOTS: [0]=inner color, [1]=outer color, [2].x=opacity, [3].x=alpha gain.
 *   HgcOuterGlowLumaWeight: out = mix(color0, color1, dot(color1, hg_Params[0]));
 *     blends two layers by the luma of color1. SLOT: [0]=luma weights.
 *   HgcSlitScanGlow: additive streak — out = (hg_Params[1].x / |dot(axis,p)|) *
 *     hg_Params[2] + color0.  SLOTS: [0]=offset dir, [1].x=strength, [2]=streak
 *     color, [3]=center, [4]=projection axis.  (transition-specific; not glow core.)
 *
 * ── PHASE-2 TODO (TS <-> FCP divergences) ─────────────────────────────────────
 *   [P2-glow-1..3 RESOLVED 2026-07-12] MASK MATH — decoded (see PASS 1 slot map):
 *     the FCP mask is the SOFT linear ramp a = clamp((luma709 − Threshold)/Softness
 *     + 0.5, 0, 1), and rgb is premultiplied by a. The `bias` in hg_Params[0].w IS
 *     the threshold representation (−Threshold/Softness + 0.5); Softness is the ramp
 *     width. Implemented below: step 1 reads Softness, uses Rec.709 luma, and
 *     extracts rgb·a (soft) instead of the old hard luma601>threshold keep.
 *   TODO(P2-glow-4): COMBINE MODEL. TS blends with an explicit screen formula
 *     (base+glow-base*glow/255) for amount<=1 and pure additive for amount>1.
 *     FCP always uses HgcGlowCombineFx: over-composite gated by blurred alpha,
 *     with a per-channel ceiling (hg_Params[1].xyz). The `amount>1 -> additive`
 *     branch is a TS approximation of that ceiling behaviour and should be
 *     reconciled to the (1-a)*orig + min(glow*gain, ceiling) form.
 *   TODO(P2-glow-5): GAIN APPLIES TO ALPHA TOO. In FCP hg_Params[0].x scales
 *     BOTH glow.rgb and glow coverage (r1.w). TS `amount` scales only rgb.
 */
import { decimatedGaussianBlur } from './gaussian-blur.js';
import { luma } from '../blend.js';
import {
  isLinearCompositeEnabled,
  LUT_SRGB_TO_LINEAR,
  linearChannelToSrgb,
} from '../linear.js';

export interface GlowParams {
  radius: number;
  threshold: number;
  amount: number;
  /** Ramp width of the luma mask (FCP Softness param, id 4; default 0.2). A
   *  value <= 0 collapses the mask to a hard step at Threshold. */
  softness?: number;
  /** When true, run the whole mask+blur+combine chain in LINEAR working space
   *  (FCP's kCGColorSpaceExtendedLinearSRGB, decoded 2026-07-12 in linear.ts —
   *  oz_render.mm OZ_WS_DEBUG confirms). Wired to isLinearCompositeEnabled()
   *  at the registry callsites; defaults OFF so shipped output is byte-identical
   *  (T-D2c safety contract, same as T-D2b/T-D2d). */
  linear?: boolean;
}

/**
 * Apply glow/bloom effect to an image.
 *
 * ============================ LINEAR WORKING SPACE (T-D2c) ============================
 * FCP's HgcGlow / HgcBloomThreshold / HgcGlowCombineFx shaders all sample from and emit
 * to the LINEAR working color space (decoded in compositor/linear.ts:
 * kCGColorSpaceExtendedLinearSRGB confirmed via OZ_WS_DEBUG at oz_render.mm ~338/515).
 * The 6 shipping Glow/Bloom users (Lights__Bloom + 360°__360°_Bloom drive both PAEGlow
 * and PAEBloom; four more use PAEGlow standalone) currently see the whole pipeline —
 * luma mask, Gaussian blur, over-composite — done on sRGB code values, which is wrong
 * in two ways:
 *   (a) the Rec.709 luma mask is a WEIGHTED SUM: on gamma-encoded codes it reads the
 *       relative brightness of encoded pixels, not photons. The soft ramp centred at
 *       Threshold therefore picks up different pixels than FCP does — the encoding
 *       compresses highlights, so mid-highlights get MORE weight in gamma than in
 *       linear (linear luma 0.5 → sRGB ≈ 188, so the sRGB path treats sRGB 128 as
 *       "midtone" while linear treats sRGB 188 as midtone). This shifts which pixels
 *       glow.
 *   (b) the over-composite lerp (1-a)·orig + glow is a LINEAR blend of light, which
 *       is what makes bloom read as ADDITIVE emission near bright cores. In sRGB code
 *       space that same formula darkens the mid-tones (the gamma-compressed sum of two
 *       equal codes ≠ 2× the light). Documented in ROADMAP S2 — Bloom / 360°_Bloom
 *       read over-dim vs GUI GT because the encode-blend-encode chain runs in gamma.
 *
 * The linear branch below decodes sRGB→linear via LUT_SRGB_TO_LINEAR, computes the
 * mask alpha on LINEAR luma709, premultiplies LINEAR RGB by a, stores the intermediate
 * as u8-in-linear-light (each u8 = round(linear·255)), blurs that buffer (Gaussian is
 * a linear operation, so blurring linear-u8 stays linear-u8 up to quantization — same
 * quantization the sRGB path lives with today, applied to a different sample space),
 * then combines in linear light and encodes ONCE at emission. Threshold is interpreted
 * as a LINEAR luma cutoff when the flag is on (per the FCP shader's semantics), so
 * threshold=0.5 corresponds to a physically-brighter cutoff than in the sRGB path — the
 * same param, a different working space.
 *
 * Both callsites (PAEGlow + PAEBloom registrations at the bottom) opt in via
 * isLinearCompositeEnabled(), which defaults OFF. Flag off is BYTE-IDENTICAL to the
 * pre-T-D2c code (verified in test/glow.test.ts).
 * ============================================================================
 */
export function glowFilter(input: ImageData, params: GlowParams): ImageData {
  const { radius, threshold, amount } = params;
  if (radius <= 0 || amount <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const softness = params.softness ?? 0.2;
  const n = src.length;
  const linear = params.linear === true;

  if (linear) {
    // LINEAR path (T-D2c). Same three steps as the sRGB path, but every operation
    // is on linear-light values. The intermediate `brightData` u8 buffer stores
    // linear light in [0,255] (u8 code = round(linear · 255)), NOT sRGB codes —
    // so the blur that runs on it stays in linear light (a Gaussian is a linear
    // op; blurring linear-u8 keeps linear-u8 semantics up to the same round-to-int
    // quantization the sRGB path already lives with).
    const lut = LUT_SRGB_TO_LINEAR;

    // Step 1 (LINEAR): soft luma mask on Rec.709 luma of LINEAR RGB.
    const brightData = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < n; i += 4) {
      const rL = lut[src[i]];
      const gL = lut[src[i + 1]];
      const bL = lut[src[i + 2]];
      // Rec.709 luma weights (HgcGlow hg_Params[0].xyz = the Y row of
      // colorMatrixFromDesiredRGBToYCbCr; the same weights blend.ts's luma()
      // applies in the sRGB path, but read here off LINEAR channels).
      const lumL = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
      let a: number;
      if (softness > 0) {
        a = (lumL - threshold) / softness + 0.5;
        a = a < 0 ? 0 : a > 1 ? 1 : a;
      } else {
        a = lumL > threshold ? 1 : 0;
      }
      if (a > 0) {
        // Store linear-light u8: v = round(linear · a · 255). Alpha stays as a
        // coverage fraction (u8 = round(a · srcAlpha)) — same convention as the
        // sRGB path (coverage is not gamma-encoded, per linear.ts).
        brightData[i]     = Math.round(rL * a * 255);
        brightData[i + 1] = Math.round(gL * a * 255);
        brightData[i + 2] = Math.round(bL * a * 255);
        brightData[i + 3] = Math.round(a * src[i + 3]);
      }
      // else: stays zero (transparent)
    }

    // Step 2 (LINEAR): blur the linear-light bright buffer. decimatedGaussianBlur
    // is a weighted sum of samples — it doesn't care what colour space the samples
    // live in, so blurring linear-u8 yields linear-u8.
    const brightImg = new ImageData(brightData, width, height);
    const blurred = decimatedGaussianBlur(brightImg, radius);
    const bdata = blurred.data;

    // Step 3 (LINEAR): HgcGlowCombineFx in linear light, then encode once to sRGB.
    // Decode the original source per-pixel (no allocation of a whole float buffer —
    // the LUT lookup is a single indexed read). glow.rgb is already linear-premult
    // from step 1; the combine formula is a straight source-over lerp on linear
    // light, exactly what the FCP shader does in kCGColorSpaceExtendedLinearSRGB.
    const out = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < n; i += 4) {
      let glowA = (bdata[i + 3] / 255) * amount;
      if (glowA > 1) glowA = 1; else if (glowA < 0) glowA = 0;
      const keep = 1 - glowA;
      const oR = lut[src[i]]     * keep + (bdata[i]     / 255) * amount;
      const oG = lut[src[i + 1]] * keep + (bdata[i + 1] / 255) * amount;
      const oB = lut[src[i + 2]] * keep + (bdata[i + 2] / 255) * amount;
      out[i]     = linearChannelToSrgb(oR);
      out[i + 1] = linearChannelToSrgb(oG);
      out[i + 2] = linearChannelToSrgb(oB);
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, width, height);
  }

  // Step 1: SOFT luma mask (DECODED HgcGlow, see header). The extracted glow
  // layer is rgb·a where a = clamp((luma709 − Threshold)/Softness + 0.5, 0, 1) —
  // a linear ramp centred at Threshold with full width Softness. Softness<=0 gives
  // the old hard step. luma & threshold are in [0,1]; luma() returns [0,255] so we
  // normalise. RGB is premultiplied by a (partial-brightness pixels feather in).
  const brightData = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < n; i += 4) {
    const lum = luma(src[i], src[i + 1], src[i + 2]) / 255; // Rec.709, normalised
    let a: number;
    if (softness > 0) {
      a = (lum - threshold) / softness + 0.5;
      a = a < 0 ? 0 : a > 1 ? 1 : a;
    } else {
      a = lum > threshold ? 1 : 0;
    }
    if (a > 0) {
      brightData[i] = src[i] * a;
      brightData[i + 1] = src[i + 1] * a;
      brightData[i + 2] = src[i + 2] * a;
      brightData[i + 3] = src[i + 3] * a;
    }
    // else: stays zero (transparent)
  }

  // Step 2: Blur the bright pixels
  const brightImg = new ImageData(brightData, width, height);
  const blurred = decimatedGaussianBlur(brightImg, radius);

  // Step 3: Composite the blurred glow over the original — VERBATIM HgcGlowCombineFx
  // (DECODED 2026-07-12, extract_shader.py HgcGlowCombineFx + -[PAEGlow
  // canThrowRenderOutput] @0xcec84):
  //   glowA   = clamp(glow.a · gain, 0, 1)            // gain = hg_Params[0].x = Opacity
  //   glowRGB = max(min(glow.rgb · gain, ceiling), 0) // ceiling = hg_Params[1].xyz
  //   out.rgb = (1 − glowA) · orig.rgb + glowRGB      // over-composite (glow premult)
  // The blurred glow (bdata) is ALREADY premultiplied (Step-1 mask premultiplied rgb
  // by a, and the blur preserves premult), so glow.rgb is the premultiplied colour.
  // gain = `amount` (Opacity/Brightness). ceiling is 1.0 (byte 255) when the plugin's
  // "allow >1" bool is off, else FLT_MAX (unclamped); in 8-bit output both cap at 255,
  // so a straight Uint8ClampedArray store realises the ceiling. This is ONE formula for
  // all gains — it replaces the old screen(amount<=1)/additive(amount>1) approximation.
  const out = new Uint8ClampedArray(width * height * 4);
  const bdata = blurred.data;
  for (let i = 0; i < n; i += 4) {
    let glowA = (bdata[i + 3] / 255) * amount;
    if (glowA > 1) glowA = 1; else if (glowA < 0) glowA = 0;
    const keep = 1 - glowA;
    out[i]     = src[i]     * keep + bdata[i]     * amount;
    out[i + 1] = src[i + 1] * keep + bdata[i + 1] * amount;
    out[i + 2] = src[i + 2] * keep + bdata[i + 2] * amount;
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}

import { registerFilter } from './registry.js';

// Glow (PAEGlow, UUID 73F69C87-…). Behavior-identical to the legacy branch:
// Radius/Threshold(raw)/intensity(Opacity or Intensity, default 1); a radius<=0 or
// intensity<=0 leaves input unchanged. The `linear` param opts into the T-D2c
// linear working-space branch of glowFilter (see linear.ts) — defaults OFF via
// isLinearCompositeEnabled() so shipped output is byte-identical; flips ON
// alongside the sibling T-D2a/b/d migrations when the linear composite chain
// is enabled end-to-end.
registerFilter({
  uuid: '73F69C87-7226-4F7A-81F2-F5E378501423',
  names: ['glow'],
  label: 'Glow',
  apply(input, ctx) {
    const radius = ctx.param('Radius', 0);
    const threshold = ctx.param('Threshold', 0);
    const softness = ctx.param('Softness', 0.2);
    const intensity = ctx.has('Opacity') ? ctx.param('Opacity', 1) : ctx.param('Intensity', 1);
    if (radius > 0 && intensity > 0) return glowFilter(input, {
      radius, threshold, amount: intensity, softness, linear: isLinearCompositeEnabled(),
    });
    return input;
  },
});

// Bloom (PAEBloom, UUID 5599C557-…). Behavior-identical to the legacy branch:
// Amount (blur spread) / Brightness (0-100, ÷100) / Threshold (0-100, ÷100),
// rendered via glowFilter; amount<=0 or brightness<=0 leaves input unchanged.
//
// ── PHASE-1 RE NOTE — HgcBloomThreshold (verbatim, the pre-blur bloom mask) ──
//   FragmentOut HgcBloomThreshold_hgc_visible(const constant float4* hg_Params, float4 color0):
//     r0   = color0 * hg_Params[1] + hg_Params[0];        // scale then bias
//     r0   = max(r0, 0);
//     luma = max(max(r0.x, r0.y), r0.z);                  // max-channel, NOT rec.601
//     r0.w = (hg_Params[3].w < 0) ? luma : r0.w;          // select: use maxlum as alpha
//     r0.w = min(r0.w, hg_Params[2].y);                   // clamp hi
//     out.w   = max(r0.w, hg_Params[2].x);                // clamp lo
//     out.xyz = r0.xyz;
//   hg_Params SLOT MAP:
//     hg_Params[0]   = bias   (added after scale; carries the threshold as a
//                              negative offset that pushes sub-threshold pixels <0)
//     hg_Params[1]   = scale  (per-channel gain applied before bias)
//     hg_Params[2].x = alpha clamp LO, hg_Params[2].y = alpha clamp HI
//     hg_Params[3].w = mode flag: <0 selects max-channel luma as the mask alpha,
//                                  otherwise the source alpha is kept.
//   So FCP's bloom threshold is a scale+bias (affine) knockout using MAX-CHANNEL
//   brightness, with lo/hi alpha clamps — feeding the same blur+combine as glow.
//
// ── PHASE-2 TODO (Bloom) ─────────────────────────────────────────────────────
//   TODO(P2-bloom-1): TS reuses glowFilter's Rec.601 binary luma cutoff. FCP's
//     bloom mask is affine (color*scale + bias, clamp>=0) using MAX-CHANNEL luma
//     = max(r,g,b), not Rec.601 weighted luma. Different pixels qualify.
//   TODO(P2-bloom-2): TS maps Brightness->amount (screen/add strength) and
//     Threshold->cutoff independently. FCP folds Brightness into hg_Params[1]
//     (scale) and Threshold into hg_Params[0] (bias); Amount is the blur spread
//     only. The param->slot mapping (Brightness=scale, Threshold=bias) is unproven
//     for our engine and must be derived in Phase-2, not assumed.
//   TODO(P2-bloom-3): TS has no alpha lo/hi clamp (hg_Params[2].xy); the FCP
//     mask floors/ceilings coverage before the blur.
registerFilter({
  uuid: '5599C557-CDC0-4112-B2C4-355E9A1A902E',
  names: ['bloom'],
  label: 'Bloom',
  apply(input, ctx) {
    const amount = ctx.param('Amount', 0);
    const brightness = ctx.param('Brightness', 1);
    const threshold = ctx.param('Threshold', 0);
    if (amount > 0 && brightness > 0) {
      // Bloom's real pre-blur mask (HgcBloomThreshold) is an affine max-channel
      // knockout, NOT the glow luma ramp — pass softness:0 so glowFilter keeps its
      // hard cutoff here (the soft-ramp default is Glow-only). Bloom's exact mask
      // is decoded in the header note but not yet wired (P2-bloom-*).
      // `linear` opts into the T-D2c linear working-space branch (see linear.ts) —
      // defaults OFF via isLinearCompositeEnabled() so shipped output is byte-
      // identical; flips ON alongside T-D2a/b/d when the linear chain lands.
      return glowFilter(input, {
        radius: amount, threshold: threshold / 100, amount: brightness / 100,
        softness: 0, linear: isLinearCompositeEnabled(),
      });
    }
    return input;
  },
});
