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
import { decimatedGaussianBlur, decimatedBlurFloatRGB } from './gaussian-blur.js';
import { luma } from '../blend.js';

export interface GlowParams {
  radius: number;
  threshold: number;
  amount: number;
  /** Ramp width of the luma mask (FCP Softness param, id 4; default 0.2). A
   *  value <= 0 collapses the mask to a hard step at Threshold. */
  softness?: number;
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

  // Step 1: SOFT luma mask (DECODED HgcGlow, see header). The extracted glow
  // layer is rgb·a where a = clamp((luma709 − Threshold)/Softness + 0.5, 0, 1) —
  // a linear ramp centred at Threshold with full width Softness. Softness<=0 gives
  // the old hard step. luma & threshold are in [0,1]; luma() returns [0,255] so we
  // normalise. RGB is premultiplied by a (partial-brightness pixels feather in).
  const brightData = new Uint8ClampedArray(width * height * 4);
  const softness = params.softness ?? 0.2;
  const n = src.length;
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
// intensity<=0 leaves input unchanged.
registerFilter({
  uuid: '73F69C87-7226-4F7A-81F2-F5E378501423',
  names: ['glow'],
  label: 'Glow',
  apply(input, ctx) {
    const radius = ctx.param('Radius', 0);
    const threshold = ctx.param('Threshold', 0);
    const softness = ctx.param('Softness', 0.2);
    const intensity = ctx.has('Opacity') ? ctx.param('Opacity', 1) : ctx.param('Intensity', 1);
    if (radius > 0 && intensity > 0) return glowFilter(input, { radius, threshold, amount: intensity, softness });
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
//
// ── PHASE-1 RE UPDATE 2026-07-13e — the REAL dispatch + why Bloom UNDER-BLOOMS ──
//   Diagnosed against GUI GT: Lights__Bloom PEAK frames (f11–f18) should blow the
//   whole frame to WHITE (GT f14 ≈ full white + cyan glow); the engine renders the
//   near-UNBLOOMED sepia photo (f14 ≈ 3 dB). Root cause: the extracted highlight
//   layer is NOT gained by Brightness, so the additive combine has nothing bright to
//   add — glowFilter just replaces the image with a blurred copy of ITSELF (measured:
//   input mean-luma 97.3 → bloom output 97.3, i.e. no brightening at any threshold).
//   The .motr Bloom is Amount=32 (blur spread), Brightness=100, Threshold ramps
//   100→1, Clip to White=1.
//
//   REAL METHOD (Filters.bundle arm64): the dispatch is
//     -[PAEBloom bloomHeliumRender:withInput:withRadius:withBrightness:withThreshold:
//        doDarkBloom:withXScale:withYScale:withDoCrop:withDoClip:is360:withInfo:] @0xe58a
//   so Radius, Brightness, Threshold, doDarkBloom, XScale(Horizontal), YScale(Vertical),
//   doCrop, doClip(=Clip to White) are ALL distinct inputs — TS currently drops
//   Brightness (maps it to the combine gain=1.0 via /100) and ignores Clip to White,
//   doDarkBloom, X/Y scale. Decoded constants so far (canThrowRenderOutput @0xe269 +
//   bloomHeliumRender @0xe58a): d11 @0x268c48 = 0.01 (the /100 for Horizontal/Vertical→
//   XScale/YScale), radius scale ×4.0, threshold pack uses ±10 range + a −2.25 bias
//   constant and two 0.5·0.01 terms (the HgcBloomThreshold scale+bias). The exact
//   Brightness→hg_Params[1] (RGB scale) and Threshold→hg_Params[0] (bias) mapping still
//   needs the full bloomHeliumRender register trace (movi/str q into the shader param
//   buffer at sp#0xa0..0xd0) — NEXT TICK, decode-don't-fit (no guessed constant).
//   FIX SHAPE (once decoded): threshold pass = max(color·brightnessScale + thresholdBias, 0),
//   alpha = clamp(max_channel, lo, hi); blur; combine = (1−glowA)·orig + min(glowRGB, 1)
//   [Clip to White ceiling]. The Brightness gain (>1) is what pushes the blurred cores
//   past white. Blast radius = 2 slugs: Lights__Bloom AND 360°__360°_Bloom (the latter
//   stores pluginName="Bloom", not "PAEBloom" — the earlier "only 1 user" grep missed it).
//
// ── PHASE-1 RE UPDATE 2026-07-13f — FULL pipeline decoded + two blockers found ──
//   Completed the -[PAEBloom bloomHeliumRender:…] @0xe58a register trace. The THREE real
//   GPU nodes (normal bloom, doDarkBloom=0):
//     1. HgcBloomThreshold (pre-blur extract):  rgb = max(color·SCALE + BIAS, 0)
//          SCALE (hg_Params[1]) = +10                         (fcsel ±10 on doDarkBloom)
//          BIAS  (hg_Params[0]) = −10·Threshold/100 = −Threshold/10  (Threshold 0–100)
//          alpha = clamp(max(r,g,b), lo=−FLT_MAX, hi=+FLT_MAX)   (i.e. no alpha clamp)
//        i.e. a 10× gain minus a threshold floor — THIS is the amplification the current
//        code drops (it premultiplies by a ≤1 mask so nothing ever brightens).
//     2. Gaussian blur by the spread radius (Amount).
//     3. HgcEchoScaleAndAdd (combine, ADDITIVE — not the glow over-composite):
//          out = orig + blurred·(Brightness/50)               (d9=50 via fcsel on doDarkBloom)
//          then CLAMP to ceiling = (Clip to White ? 1.0 : +∞)  (fcsel on doClip, hg_Params[1])
//        Brightness 0–100 → /50 = ≈1.4–2× gain; the additive+clip is what blows to white.
//   IMPLEMENTED + REFUTED (reverted): a decode-faithful bloomFilter (extract ×10−Thr/10,
//   additive combine ×Brightness/50, clip-to-white) rendered correctly IN ISOLATION
//   (mean-luma 97→255 at peak) but the render was gated by TWO transition-timing blockers:
//     BLOCKER-A (retime-wrap kills the bloom): buildTimeMap wraps Lights__Bloom to time 0
//       at wrapSec≈0.20s, but the Bloom/Glow Threshold+Radius keyframes fire at 0.36→0.59s
//       — so Threshold stays pinned at 100 → the extract knocks out everything → ZERO bloom
//       (the filter is dormant, which is why the "fix" was gate-neutral on Lights__Bloom).
//       GT REFUTES the wrap: f06 (0.317s, past the wrap) is already blown-out, NOT frame-0.
//       A wrap-cancel (animated-filter-past-wrap) makes the bloom FIRE.
//     BLOCKER-B (black tail): cancelling the wrap exposes a BLACK tail — Transition A
//       (out=0.20s) and B (in=0.234,out=0.534s) BOTH time out by 0.534s, so frames f11+
//       have no drop zone → black. GT holds the bloom peak (~f14 white) then reveals CLEAN
//       B by f23 (the bloom is a flash-to-white A→B wipe). So the fix needs the drop-zone
//       content to PERSIST (hold B) past 0.534s WHILE the Bloom filter time plays THROUGH
//       (a clamp on CONTENT time decoupled from FILTER time) — more than one safe tick.
//     Also: on 360°__360°_Bloom (which does NOT wrap, so its Bloom evaluates live) the
//       isolated bloomFilter REGRESSED 11.47→10.48 — the ×10 extract + 8-bit-blur HEADROOM
//       proxy distorts the energy vs GT. The magnitude needs the blur run in FLOAT (no 8-bit
//       proxy) and re-verified against BOTH Bloom slugs' GUI GT. NEXT: (1) float-buffer blur
//       so >1 cores survive without the HEADROOM hack; (2) content-persist + filter-time-
//       through for the wrap/black-tail coupling; (3) gate-verify Lights__Bloom AND 360° Bloom.

export interface BloomParams {
  /** FCP Amount (blur spread). The blur radius fed to HGaussianBlur is 0.5·Amount. */
  amount: number;
  /** FCP Brightness 0–100 → additive gain Brightness/50. */
  brightness: number;
  /** FCP Threshold 0–100 → extract bias Threshold/10 (on the ×10-gained colour). */
  threshold: number;
  /** Clip to White (doClip): clamp the additive result to 1.0 when true, else unbounded. */
  clipToWhite: boolean;
}

/**
 * FCP Bloom (PAEBloom `bloomHeliumRender`), decode-faithful FLOAT implementation.
 *
 * FULLY DECODED 2026-07-14s from the arm64 register trace of -[PAEBloom
 * bloomHeliumRender:withInput:withRadius:withBrightness:withThreshold:doDarkBloom:
 * withXScale:withYScale:withDoCrop:withDoClip:is360:withInfo:] @0xc88c (Filters.bundle,
 * InternalFiltersXPC slice) + the verbatim HgcBloomThreshold / HgcEchoScaleAndAdd shaders
 * (extract_shader.py). Three GPU nodes, normal bloom (doDarkBloom=0):
 *
 *   1. HgcBloomThreshold (pre-blur extract).  Param wiring (register trace):
 *        s13 = doDarkBloom ? -10 : +10   → hg_Params[1] (SCALE) = +10
 *        s14 = doDarkBloom ? +10 : -10   → hg_Params[0] (BIAS)  = s14·Threshold/100
 *                                          = -10·Threshold/100 = -Threshold/10
 *        hg_Params[2] = (lo=-FLT_MAX, hi=+FLT_MAX)  → NO alpha clamp
 *        hg_Params[3] = 0
 *      shader: r0 = color·SCALE + BIAS = color·10 − Threshold/10; then max(r0, 0).
 *      i.e. a 10× gain minus a threshold floor — the amplification the 8-bit glowFilter
 *      path DROPPED (it premultiplied by a ≤1 mask so nothing ever brightened past white).
 *
 *   2. Gaussian blur.  Register trace (both HGaussianBlur::init and HEquirectGaussianBlur::init
 *      paths): the radius arg = 0.5·Amount (cb8c/caa8: fmov d0,#0.5; fmul d0,d11,d0). So the
 *      spread fed to HGBlur is HALF the Amount param — NOT the raw Amount. (X/Y scale are the
 *      Horizontal/Vertical params, |·|·image-dim; both 1 for these slugs.) MUST run in Float32:
 *      the ×10 extract produces >1 cores; an 8-bit intermediate caps them at 1 and dilutes the
 *      capped core with dark neighbours, losing the flash-to-white energy.
 *
 *   3. HgcEchoScaleAndAdd (combine, ADDITIVE — verbatim shader):
 *        r1 = color0·hg_Params[0] + color1        (color0 = blurred glow, color1 = original)
 *        r1.xyz = min(r1.xyz, hg_Params[1].x)      (ceiling)
 *        out = max(r1, 0)
 *      Register wiring: hg_Params[0] = Brightness/50 (cc04: d8/50, d9=50 via fcsel doDarkBloom);
 *      hg_Params[1].x = doClip ? 1.0 : +FLT_MAX (cc44: fcsel on withDoClip=w25).
 *      => out = original + blurred·(Brightness/50), clamped to (Clip to White ? 1 : ∞).
 *      (The legacy HGTransform::Translate(0,-2.25,0) at cc98 is GATED on versionAtCreation==0
 *       — a pre-modern compat echo-offset — and is SKIPPED on the current render path; omitted.)
 */
export function bloomFilter(input: ImageData, params: BloomParams): ImageData {
  const { amount, brightness, threshold, clipToWhite } = params;
  if (amount <= 0 || brightness <= 0) return input;
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const n = src.length;
  const px = width * height;

  // Step 1 — HgcBloomThreshold extract: rgb = max(color·10 − Threshold/10, 0), no alpha clamp.
  const thrFloor = threshold / 10; // BIAS = Threshold/10 (Threshold is the raw 0–100 param).
  const bright = new Float32Array(px * 3);
  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    const r = src[i] / 255, g = src[i + 1] / 255, b = src[i + 2] / 255;
    let er = r * 10 - thrFloor; if (er < 0) er = 0;
    let eg = g * 10 - thrFloor; if (eg < 0) eg = 0;
    let eb = b * 10 - thrFloor; if (eb < 0) eb = 0;
    bright[j] = er; bright[j + 1] = eg; bright[j + 2] = eb;
  }

  // Step 2 — blur the extracted highlights in FLOAT at radius 0.5·Amount (register trace).
  const blurred = decimatedBlurFloatRGB(bright, width, height, 0.5 * amount);

  // Step 3 — HgcEchoScaleAndAdd: out = orig + blurred·(Brightness/50), clip to (doClip ? 1 : ∞).
  const gain = brightness / 50;
  const out = new Uint8ClampedArray(n);
  for (let i = 0, j = 0; i < n; i += 4, j += 3) {
    let or_ = src[i] / 255 + blurred[j] * gain;
    let og = src[i + 1] / 255 + blurred[j + 1] * gain;
    let ob = src[i + 2] / 255 + blurred[j + 2] * gain;
    if (clipToWhite) { if (or_ > 1) or_ = 1; if (og > 1) og = 1; if (ob > 1) ob = 1; }
    out[i] = Math.round(or_ * 255);
    out[i + 1] = Math.round(og * 255);
    out[i + 2] = Math.round(ob * 255);
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, width, height);
}

registerFilter({
  uuid: '5599C557-CDC0-4112-B2C4-355E9A1A902E',
  names: ['bloom'],
  label: 'Bloom',
  apply(input, ctx) {
    const amount = ctx.param('Amount', 0);
    const brightness = ctx.param('Brightness', 1);
    const threshold = ctx.param('Threshold', 0);
    if (amount > 0 && brightness > 0) {
      // Decode-faithful FLOAT bloom (bloomHeliumRender register trace, see bloomFilter
      // header): extract max(color·10 − Threshold/10, 0) → float blur(0.5·Amount) →
      // additive orig + blur·(Brightness/50), clip to white. Gated behind FCT_BLOOM_FLOAT
      // while gate-verifying; the 8-bit fallback below is the prior shipping behaviour.
      if (process.env?.FCT_BLOOM_FLOAT) {
        const clipToWhite = ctx.has('Clip to White') ? ctx.param('Clip to White', 1) > 0.5 : true;
        return bloomFilter(input, { amount, brightness, threshold, clipToWhite });
      }
      // Prior 8-bit path (glowFilter): Bloom's pre-blur mask approximated by a hard
      // luma cutoff; drops the ×10 amplification so it under-blooms at the peak.
      return glowFilter(input, { radius: amount, threshold: threshold / 100, amount: brightness / 100, softness: 0 });
    }
    return input;
  },
});
