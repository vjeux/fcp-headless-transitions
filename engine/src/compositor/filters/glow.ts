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
 *     hg_Params[0] = luma/mask weights (float4, dotted against rgba). The .w term
 *                    means the source alpha also contributes to the mask, and
 *                    there is NO explicit threshold subtract here — the "cutoff"
 *                    is produced purely by clamp(dot,0,1): pixels whose weighted
 *                    sum <= 0 fall to 0. i.e. threshold is baked into hg_Params[0]
 *                    (a negative bias in one lane) upstream, not a separate step.
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
 *   TODO(P2-glow-1): MASK MATH. TS does a hard binary cutoff on Rec.601 luma
 *     (luma601 > thresholdByte ? keep : drop). FCP does a SOFT mask:
 *     alpha = clamp(dot(rgba, hg_Params[0]), 0, 1) and PREMULTIPLIES rgb by it.
 *     FCP therefore feathers the glow contribution near the threshold and lets
 *     source alpha participate; TS produces a hard-edged mask. Replace the
 *     binary test with the clamp(dot(...)) soft mask + premultiply.
 *   TODO(P2-glow-2): DOT INCLUDES ALPHA. hg_Params[0] is dotted against the full
 *     float4 (rgba), so alpha weights into the mask. TS uses rgb-only luma601.
 *   TODO(P2-glow-3): THRESHOLD REPRESENTATION. FCP has no explicit `threshold`
 *     scalar in HgcGlow — the cutoff is encoded as a bias term inside
 *     hg_Params[0]. Our `threshold` param must be converted into that weight
 *     vector (weights that make the dot cross zero at the desired luma), not
 *     compared directly.
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
import { luma601 } from '../blend.js';

export interface GlowParams {
  radius: number;
  threshold: number;
  amount: number;
}

/**
 * Apply glow/bloom effect to an image.
 */
export function glowFilter(input: ImageData, params: GlowParams): ImageData {
  const { radius, threshold, amount } = params;
  if (radius <= 0 || amount <= 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;

  // Step 1: Extract bright pixels (above threshold)
  const brightData = new Uint8ClampedArray(width * height * 4);
  const thresholdByte = Math.round(threshold * 255);

  const n = src.length;
  for (let i = 0; i < n; i += 4) {
    // Compute luminance (perceived brightness)
    const lum = luma601(src[i], src[i + 1], src[i + 2]);
    if (lum > thresholdByte) {
      // Keep this pixel for the glow
      brightData[i] = src[i];
      brightData[i + 1] = src[i + 1];
      brightData[i + 2] = src[i + 2];
      brightData[i + 3] = src[i + 3];
    }
    // else: stays zero (transparent)
  }

  // Step 2: Blur the bright pixels
  const brightImg = new ImageData(brightData, width, height);
  const blurred = decimatedGaussianBlur(brightImg, radius);

  // Step 3: Blend the blurred glow back onto the original.
  // For amount <= 1: screen blend (gentle). For amount > 1: additive accumulation
  // (matches FCP's bloom overexposure that blows highlights toward white).
  // PERF: the per-channel branch is hoisted out of the pixel loop (the additive vs
  // screen decision is loop-invariant) and the c-loop is unrolled. Math is identical.
  const out = new Uint8ClampedArray(width * height * 4);
  const bdata = blurred.data;
  if (amount > 1) {
    for (let i = 0; i < n; i += 4) {
      out[i]     = Math.min(255, Math.round(src[i]     + bdata[i]     * amount));
      out[i + 1] = Math.min(255, Math.round(src[i + 1] + bdata[i + 1] * amount));
      out[i + 2] = Math.min(255, Math.round(src[i + 2] + bdata[i + 2] * amount));
      out[i + 3] = src[i + 3];
    }
  } else {
    for (let i = 0; i < n; i += 4) {
      let base = src[i];       let glow = bdata[i]     * amount; out[i]     = Math.min(255, Math.round(base + glow - (base * glow) / 255));
      base = src[i + 1];       glow = bdata[i + 1]     * amount; out[i + 1] = Math.min(255, Math.round(base + glow - (base * glow) / 255));
      base = src[i + 2];       glow = bdata[i + 2]     * amount; out[i + 2] = Math.min(255, Math.round(base + glow - (base * glow) / 255));
      out[i + 3] = src[i + 3];
    }
  }

  return new ImageData(out, width, height);
}

import { registerFilter } from './registry.js';

// Glow (PAEGlow, UUID 73F69C87-…). Behavior-identical to the legacy branch:
// Radius/Threshold(raw)/intensity(Opacity or Intensity, default 1); a radius<=0 or
// intensity<=0 leaves input unchanged.
registerFilter({
  uuid: '73F69C87-7226-4F7A-81F2-F5E378501423',
  names: ['glow'],
  label: 'Glow',
  apply(input, ctx) {
    const radius = ctx.param('Radius', 0);
    const threshold = ctx.param('Threshold', 0);
    const intensity = ctx.has('Opacity') ? ctx.param('Opacity', 1) : ctx.param('Intensity', 1);
    if (radius > 0 && intensity > 0) return glowFilter(input, { radius, threshold, amount: intensity });
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
      return glowFilter(input, { radius: amount, threshold: threshold / 100, amount: brightness / 100 });
    }
    return input;
  },
});
