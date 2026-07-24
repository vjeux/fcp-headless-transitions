/**
 * Hue/Saturation (PAEHSVAdjust) + related Saturation/Desaturate filters.
 *
 * ============================ FCP REVERSE-ENGINEERING ============================
 * Verbatim from the embedded Metal shaders (tools/re/extract_shader.py).
 *
 * --- HgcHSVAdjust (PAEHSVAdjust, UUID D23AF030-…) ---
 * FCP does an in-place RGB↔HSV using a branchless max/min-based hue reconstruction,
 * NOT a table lookup. Distilled from the shader (consts c0..c4):
 *   V     = max(r,g,b)                         // value (r1 after the maxes)
 *   norm  = rgb / V                            // normalize to the max
 *   chroma= max(norm) - min(norm)              // r3.x
 *   // hue sextant via which channel is the max (r4 = float3(rgb>=V) select mask):
 *   hue6  = dot( (norm.yzx - norm.zxy)/chroma + {0,2,4}, r4 )   // 0..6 hue by sextant
 *   hue   = frac( hue6 * (1/6) + hg_Params[0].x )   // hg_Params[0].x = HUE offset (turns)
 *   sat   = clamp( (chroma/V) * hg_Params[0].y, 0, 1 )   // hg_Params[0].y = SATURATION mult
 *   val   = ... * hg_Params[0].z                          // hg_Params[0].z = VALUE mult
 *   // then HSV->RGB via the standard 6-sextant select ladder (r5/r6 selects), and
 *   output.rgb = hsv2rgb(...) * V   (re-applies the original max as the value scale)
 * ⚠️ FINDINGS vs the legacy TS below:
 *   (1) FCP HUE offset is in DEGREES — DECODED 2026-07-12 from
 *       -[PAEHSVAdjust canThrowRenderOutput] @0x372f4-0x37350: the plugin reads Hue
 *       via getFloatValue, wraps into [0, 360] (adding/subtracting 360 as needed —
 *       consts 0x269760=360, 0x269a40=-360), then computes
 *         hg_Params[0].x = Hue/360 + 1.0
 *       The +1 is a no-op inside the shader's `frac()` on the hue value, so the
 *       effective offset is `Hue/360` TURNS. Motion's convention: Hue param is DEGREES,
 *       not turns. All 4 shipping HSV users (Objects__Leaves, Stylized__Center /
 *       Light_Sweep / Lower) set Hue=0 so this is gate-neutral; the sweep's
 *       Hue=0.25 is 0.25 DEGREES (basically no rotation, matching headless).
 *   (2) FCP SATURATION and VALUE are BOTH MULTIPLIERS (hg_Params[0].y/.z). The TS
 *       impl multiplies saturation but ADDS brightness — Phase-2 must switch value
 *       to a multiplier (v *= valueMult) to match, OR confirm PAEHSVAdjust exposes
 *       an additive brightness that frameSetup pre-converts to a multiplier.
 *   (3) No Mix in the shader itself — PAEHSVAdjust has no Mix slot; the legacy `mix`
 *       param below is a TS-ism (keep at 1 for FCP-faithful behavior).
 *
 * --- HgcSaturation (used by Desaturate/Saturation filters) --- VERBATIM ---
 *   luma = dot(rgb_unpremult, (0.2125, 0.7154, 0.0721))   // Rec.709, INLINE CONST
 *   out.rgb = clamp( mix(luma, rgb, hg_Params[0].xyz), 0, 1 ) * alpha
 *   ⇒ Saturation is a lerp between the Rec.709 grayscale and the color by a per-
 *   channel saturation amount. This CONFIRMS FCP uses Rec.709 (NOT 601) luma here.
 *
 * --- HgcDesaturate --- VERBATIM ---
 *   gray = rgb · hg_Params[1].xyz   (summed to all 3 channels)  // custom weights
 *   out.rgb = mix(rgb, gray, hg_Params[0].xyz)                  // hg_Params[0]=amount
 * ============================================================================
 *
 * Used by: 4 transitions for color shifting effects.
 *
 * Legacy TS parameters (see hueSaturationFilter):
 *   - Hue: rotation in degrees (-180 to +180)
 *   - Saturation: multiplier (0 = grayscale, 1 = unchanged, >1 = oversaturated)
 *   - Brightness/Value: offset (-1 to +1)   [⚠️ FCP uses a multiplier — see finding 2]
 *   - Mix: blend factor (0-1)                [⚠️ not in FCP shader — see finding 3]
 */

export interface HueSatParams {
  hue: number;        // HUE offset in DEGREES (0..360); FCP param "Hue" (decoded). Internal
                      //    hg_Params[0].x = (hue/360) + 1.0 (the +1 is a no-op inside frac).
  saturation: number; // 0-CENTERED: 0 = unchanged, -1 = grayscale, >0 = more saturated
  value: number;      // VALUE multiplier: out.rgb *= value^2 (1 = unchanged)
  mix: number;        // blend factor
}

// Rec.709 luma (FCP's HgcSaturation uses these inline: 0.2125/0.7154/0.0721).
function luma709(r: number, g: number, b: number): number {
  return 0.2125 * r + 0.7154 * g + 0.0721 * b;
}

// DECODED FCP HSV working space (fct/parity 2026-07-22): power-law gamma ≈ 1.958.
const HSV_WS_INV_GAMMA = 0.51117;              // v_ws = (code/255)^0.51117 (gamma 1.9563)
const HSV_WS_GAMMA = 1.0 / HSV_WS_INV_GAMMA;

/**
 * FCP HgcHSVAdjust in the DECODED gamma-1.958 working space (fct/parity, 2026-07-22).
 * Same working space + Rec.709 luma as the decoded HgcTint. Verified at the transfer
 * node boundary (transfer.PAEHSVAdjust). Hue rotates in HSV built on the working-space
 * RGB; Saturation lerps toward the Rec.709 luma of the working-space RGB; Value is a
 * LINEAR multiply in the working space (out = ws_inv(ws(in)*value), NOT value²).
 */
// DECODED FCP hue rotation basis: FCP's EXACT Rec.709 RGB→YCbCr matrix, pulled from the
// binary via dlsym (ProCore PCGetRec709YCbCrMatrix — fct/parity 2026-07-22). FCP's HSV Hue
// rotates the (Cb,Cr) chroma vector about the luma axis (luma-PRESERVING), NOT an HSV-hextant
// rotation (which preserves value=max and diverged). Row 0 = Rec.709 luma (== luma709 exact).
const RGB2YCBCR = [
  [0.212639, 0.715169, 0.072192],
  [-0.114592, -0.385408, 0.5],
  [0.5, -0.454156, -0.045844],
];
// Inverse (YCbCr→RGB), precomputed from the exact matrix above.
const YCBCR2RGB = (() => {
  const m = RGB2YCBCR;
  const det =
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const inv = (a: number, b: number, c: number, d: number) => (a * d - b * c) / det;
  return [
    [inv(m[1][1], m[1][2], m[2][1], m[2][2]), inv(m[0][2], m[0][1], m[2][2], m[2][1]), inv(m[0][1], m[0][2], m[1][1], m[1][2])],
    [inv(m[1][2], m[1][0], m[2][2], m[2][0]), inv(m[0][0], m[0][2], m[2][0], m[2][2]), inv(m[0][2], m[0][0], m[1][2], m[1][0])],
    [inv(m[1][0], m[1][1], m[2][0], m[2][1]), inv(m[0][1], m[0][0], m[2][1], m[2][0]), inv(m[0][0], m[0][1], m[1][0], m[1][1])],
  ];
})();

/** Rotate an RGB triple's hue by `turns` about the luma axis, in FCP's exact Rec.709 YCbCr
 * space (luma-preserving). Returns the rotated RGB (may be out of [0,1] before gamut clamp). */
function rotateHueYCbCr(r: number, g: number, b: number, turns: number): [number, number, number] {
  const Y = RGB2YCBCR[0][0] * r + RGB2YCBCR[0][1] * g + RGB2YCBCR[0][2] * b;
  const cb = RGB2YCBCR[1][0] * r + RGB2YCBCR[1][1] * g + RGB2YCBCR[1][2] * b;
  const cr = RGB2YCBCR[2][0] * r + RGB2YCBCR[2][1] * g + RGB2YCBCR[2][2] * b;
  const ang = turns * 2 * Math.PI;
  const c = Math.cos(ang), s = Math.sin(ang);
  const cb2 = c * cb - s * cr;
  const cr2 = s * cb + c * cr;
  return [
    YCBCR2RGB[0][0] * Y + YCBCR2RGB[0][1] * cb2 + YCBCR2RGB[0][2] * cr2,
    YCBCR2RGB[1][0] * Y + YCBCR2RGB[1][1] * cb2 + YCBCR2RGB[1][2] * cr2,
    YCBCR2RGB[2][0] * Y + YCBCR2RGB[2][1] * cb2 + YCBCR2RGB[2][2] * cr2,
  ];
}

function hueSaturationFilterWS(input: ImageData, params: HueSatParams): ImageData {
  const { saturation, value, mix } = params;
  // DECODED 2026-07-23 (fct/parity hue-sign probe): FCP CLAMPS the Hue param at 0 in the
  // headless render path — every NEGATIVE hue (-8°/-15°/-30°/-90°/-180°) leaves the input
  // BYTE-IDENTICAL (no rotation), while positive hue rotates progressively. So negative hue
  // is a no-op, not a wrap. The engine previously wrapped negatives (frac) and rotated the
  // wrong way (up to 62 lvl off at -30° on saturated red). Matches FCP: hue = max(0, hue).
  const hue = params.hue > 0 ? params.hue : 0;
  // DECODED 2026-07-23 (fct/parity sat-sweep probe): FCP clamps the Saturation factor at 0 (its
  // lower bound). On saturated red, Sat=-1.0/-1.5/-2.0 all give the SAME fully-desaturated gray
  // (73.5) — Sat below -1 does NOT invert the chroma. The engine's raw satFactor=1+S went
  // negative for S<-1 (inverting chroma), diverging from FCP. So satFactor = max(0, 1+S).
  const satFactor = Math.max(0, 1 + saturation);
  // DECODED 2026-07-23 (fct/parity value-sweep probe): FCP CLAMPS the Value multiplier at 2.0.
  // On gray 32, Value 1.0/1.5/2.0 give effective ws-mult 1.0/1.5/2.0, but Value 2.5/3/4/5 all
  // saturate at mult 2.0 (out stays 124.3) — NOT unbounded. So effectiveMult = min(max(0,V),2).
  // The engine previously used the raw Value (V=3 -> mult 3 -> gray 32 clipped to 255 vs FCP 124,
  // a 130 lvl gap). This mirrors the Hue-at-0 clamp: FCP's HSV CPU wiring bounds the param.
  const valMul = Math.min(2, Math.max(0, value));  // Value = linear multiply in the gamma-1.958 working
  // space: out = ws_inv(ws(in) * value). DECODED + VERIFIED for BOTH legs (fct/parity golden,
  // transfer.PAEHSVAdjust_value_brighten): darken (value<=1) AND brighten (value>1) match REAL
  // headless FCP within 1 level on grays (e.g. Value=2, gray 64 -> 248.2; ws_mul 249.2). This
  // supersedes the legacy sRGB-code `value²` model (see the hueSaturationFilter header, which
  // correctly noted value² fails for brighten) — in the WS the single ws-multiply is exact.
  // The only residual is brighten on SATURATED colours where a channel over-clips (>1): that is
  // the shared HGColorMatrix over-1.0 GPU-readback lift, not the Value op (same as Brightness).
  if (hue === 0 && saturation === 0 && value === 1) return input;
  const width = input.width, height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const hueTurns = (((hue / (2 * Math.PI)) % 1) + 1) % 1;
  const doHue = hueTurns !== 0;
  const iv = HSV_WS_INV_GAMMA, gm = HSV_WS_GAMMA;
  const cl = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
  for (let i = 0; i < src.length; i += 4) {
    // sRGB code → gamma-1.958 working space.
    let r = Math.pow(src[i] / 255, iv);
    let g = Math.pow(src[i + 1] / 255, iv);
    let b = Math.pow(src[i + 2] / 255, iv);
    if (doHue) {
      // DECODED + VERIFIED (fct/parity 2026-07-23, transfer.PAEHSVAdjust_hue, worst 0.7 lvl vs the
      // CLEAN OZ_CLAMP_UNIT headless oracle): FCP's HSV "Hue" is a Rec.709 (Cb,Cr) chroma-plane
      // rotation about the luma axis, done in THIS gamma-1.958 working space, followed by a HARD
      // PER-CHANNEL clamp to [0,1] — NOT a luma-preserving gamut desaturation. The earlier
      // desaturate-toward-luma gamut step was the entire ~26-lvl residual: it over-compressed
      // chroma where FCP simply clips each channel (and the clip is exactly what the readback does
      // for in-gamut display). Replacing it with a plain [0,1] clamp lands the hue transfer at
      // sub-level fidelity across all inputs × angles. Gate-neutral: all shipping HSV hosts author
      // Hue=0. (The OZ_CLAMP_UNIT oracle removed the CoreGraphics over-1.0 readback lift — a
      // separate, proven artifact — so this decode is against FCP's TRUE per-channel effect.)
      [r, g, b] = rotateHueYCbCr(r, g, b, hueTurns);
      r = cl(r); g = cl(g); b = cl(b);
    }
    if (saturation !== 0) {
      // DECODED (fct/parity golden): Saturation is a SINGLE lerp about the Rec.709 luma-gray in
      // the gamma-1.958 working space by satFactor=1+S — for BOTH desaturation (satFactor<1) AND
      // over-saturation (satFactor>1, pushing away from gray). This UNIFIES the two legs and
      // supersedes the old HSV-hextant rebuild for satFactor>1 (which drove low channels to 0 and
      // diverged badly — grn(50,200,50)@S=1 FCP (121,254,83) vs hextant (0,200,0)).
      // 2026-07-23 (fct/parity, OZ_CLAMP_UNIT clean oracle): the over-saturation out-of-gamut path
      // is a HARD PER-CHANNEL clamp to [0,1] (the shared final `cl()`), NOT a luma-preserving
      // gamut compression. The old desaturate-toward-gray step was a ~5-lvl residual on the
      // combined oversaturate+brighten case (transfer.PAEHSVAdjust_combined); removing it (and
      // letting the terminal clamp clip each channel) matches FCP's TRUE per-channel effect.
      const gray = luma709(r, g, b);
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }
    if (value !== 1) { r *= valMul; g *= valMul; b *= valMul; }
    let oR = cl(r), oG = cl(g), oB = cl(b);
    if (mix < 1) {
      const sr = Math.pow(src[i] / 255, iv), sg = Math.pow(src[i + 1] / 255, iv), sb = Math.pow(src[i + 2] / 255, iv);
      oR = sr * (1 - mix) + oR * mix;
      oG = sg * (1 - mix) + oG * mix;
      oB = sb * (1 - mix) + oB * mix;
    }
    // Working space → sRGB code.
    out[i]     = Math.round(Math.pow(oR, gm) * 255);
    out[i + 1] = Math.round(Math.pow(oG, gm) * 255);
    out[i + 2] = Math.round(Math.pow(oB, gm) * 255);
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, width, height);
}


/** Convert RGB (0-1) to HSV. */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h, s, v];
}

/** Convert HSV to RGB (0-1). */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (((i % 6) + 6) % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    case 5: return [v, p, q];
    default: return [v, v, v];
  }
}

/**
 * Apply FCP's Hue/Saturation/Value adjustment. PHASE-2 measured against the real
 * headless FCP engine (tools/re/filter_verify) — the three params are:
 *   - Hue (TURNS): out hue = frac(hue_in + Hue). Hue=0.5 -> 180° shift; Hue=180 (=180
 *     whole turns) -> identity. Verified.
 *   - Saturation (0-centered): out = mix(gray709, rgb, 1 + Saturation). S=0 identity,
 *     S=-1 grayscale, S=-0.5 halfway to gray. Verified ([118,94,78] at S=-0.5).
 *   - Value: out.rgb *= Value^2 (a squared multiply) FOR Value <= 1 (the dimming
 *     range every transition uses). Verified vs headless FCP: V=0.65 -> in*0.4225
 *     ([60.5,39.2,25.9] headless vs [59.4,38.4,25.5], PSNR 46.05); V=0.707 -> 0.5x A.
 *     ⚠️ Value > 1 (BRIGHTEN) is NOT this model: the real HgcHSVAdjust shader works in
 *     HSV space (normalize rgb by max(V,1), scale S and V, rebuild) which compresses
 *     highlights differently — at V=1.5 the shader gives ~[238,210,186] while in*1.5^2
 *     gives ~[229,176,131] (PSNR ~15). No built-in transition uses Value>1 (they use
 *     0.65 or 1.0), so the squared multiply is correct for the shipped param space;
 *     a full-HSV-space rewrite is only needed if a Value>1 test .motr is added.
 * ⚠️ This REPLACES the old model, which read FCP's Value (default 1) as ADDITIVE
 * brightness -> added 255 to every pixel -> BLEW IDENTITY INPUTS TO WHITE, and treated
 * the 0-centered Saturation as a plain multiplier. (Confirmed: old TS returned
 * [255,255,255] where FCP returns the unchanged image.)
 *
 * ============================ LINEAR WORKING SPACE (T-D2d) ============================
 * FCP's HgcHSVAdjust shader runs in the LINEAR working color space (decoded in
 * compositor/linear.ts: oz_render.mm OZ_WS_DEBUG confirms kCGColorSpaceExtendedLinearSRGB
 * for the entire filter+composite chain). The 4 shipping HSV users (Objects__Leaves,
 * Stylized__Center / Light_Sweep / Lower + Color_Panels) get RGB in LINEAR light, run
 * the max/min/normalize HSV reconstruction there, apply Saturation as a lerp toward the
 * Rec.709 luma of the LINEAR RGB, apply Value as a squared multiply on LINEAR RGB, and
 * emit LINEAR to the next stage. The engine currently decodes sRGB code as if it were
 * linear, biasing Saturation lerps (luma weights compressed by the sRGB gamma) and
 * Value dims (V=0.65 in gamma → sRGB 130 midtone lands at 84; in linear → sRGB 105 —
 * a ~20-code shift). Every HSV shipping user also STACKS more filters (Colorize on
 * Color_Panels, Bloom/DirectionalBlur on Leaves), so the correct model is not per-filter
 * encode but a linear WORKING BUFFER carried across the chain (T-D1 groundwork).
 *
 * This function honors `isLinearCompositeEnabled()`:
 *   flag OFF (shipped default, T-D1's safety contract) — legacy sRGB-as-linear path,
 *     BYTE-IDENTICAL to before this migration.
 *   flag ON  — decode sRGB→linear via LUT_SRGB_TO_LINEAR, do the HSV math in linear
 *     light, encode linear→sRGB via linearChannelToSrgb at emission. Mix (unused in
 *     shipping — PAEHSVAdjust has no Mix slot) also lerps in linear when the flag is on.
 * ============================================================================
 */
export function hueSaturationFilter(input: ImageData, params: HueSatParams): ImageData {
  const { hue, saturation, value, mix } = params;
  // DECODED gamma-1.958 working space (fct/parity, 2026-07-22). FCP's HgcHSVAdjust /
  // HgcSaturation run in a POWER-LAW gamma-1.958 space (NOT scene-linear): fitting the
  // REAL FCP transfer gives Value = ws_inv(ws(in)*value) at 0.22 rms (gamma 1.9605),
  // and full Saturation-desaturate = ws_inv(Rec709·ws(rgb)) matching (200,50,50)→73.5
  // vs measured 73.5 (scene-linear gives 84.6, code space 94.8). Same working space as
  // the decoded HgcTint. The decoded gamma-1.958 working-space transfer (VERIFIED vs
  // REAL FCP headless).
  return hueSaturationFilterWS(input, params);
}


import { registerFilter } from './registry.js';
import {
  isLinearCompositeEnabled,
  LUT_SRGB_TO_LINEAR,
  linearChannelToSrgb,
} from '../linear.js';
import {
  hasLinearInput,
  getLinearInput,
  publishLinear,
  encodeLinearBuf,
  hsvLinearInPlace,
} from './linear-chain.js';

// HSV Adjust (PAEHSVAdjust, UUID D23AF030-…). PHASE-2 CORRECTED semantics (measured
// vs headless FCP): Hue in TURNS (default 0), Saturation 0-CENTERED (default 0,
// -1 = grayscale), Value MULTIPLIER applied squared (default 1). The old code read
// FCP's Value as ADDITIVE brightness (default 0) which added 255 -> white blowout,
// and treated the 0-centered Saturation as a multiplier. Reads the filter's own
// params (rawParam) to preserve the legacy override-ignoring behavior (see note above).
registerFilter({
  uuid: 'D23AF030-B0BF-44DF-B622-7C9EA0DF5744',
  names: ['hsv', 'hue', 'saturation'],
  label: 'HSV Adjust',
  // FLOAT WORKING-SPACE path (architectural, 2026-07-23): the fused buffer is ALREADY in the
  // gamma-0.51117 working space HSV's decoded transfer uses, so we run Hue(luma-preserving YCbCr)
  // + Saturation(lerp about Rec.709 luma) + Value(linear multiply) DIRECTLY on the buffer with NO
  // terminal [0,1] clamp — the >1.0 headroom from brighten/over-saturate survives to the terminal
  // encode (matching FCP's float readback). In-gamut this equals the decoded WS transfer; the
  // over-1.0 residual is the shared coupled GPU soft-clip (see compositor/evidence).
  applyWorking(fimg: import('../working-space.js').FloatImage, ctx): import('../working-space.js').FloatImage {
    const hueRaw = ctx.hasRaw('Hue') ? ctx.rawParam('Hue', 0) : ctx.rawParam('Hue Rotation', 0);
    const saturation = ctx.rawParam('Saturation', 0);
    const value = ctx.rawParam('Value', 1);
    if ((hueRaw <= 0 || hueRaw === 0) && saturation === 0 && value === 1) return fimg;
    const hue = hueRaw > 0 ? hueRaw : 0;                 // FCP clamps Hue at 0 (decoded)
    const satFactor = Math.max(0, 1 + saturation);       // FCP clamps sat factor at 0
    const valMul = Math.min(2, Math.max(0, value));      // FCP clamps Value multiplier at 2.0
    const hueTurns = (((hue / (2 * Math.PI)) % 1) + 1) % 1;
    const doHue = hueTurns !== 0;
    const d = fimg.data;
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2]; // already in gamma-0.51117 working space
      if (doHue) [r, g, b] = rotateHueYCbCr(r, g, b, hueTurns);
      if (saturation !== 0) {
        const gray = luma709(r, g, b);
        r = gray + (r - gray) * satFactor;
        g = gray + (g - gray) * satFactor;
        b = gray + (b - gray) * satFactor;
      }
      if (value !== 1) { r *= valMul; g *= valMul; b *= valMul; }
      d[i] = r; d[i + 1] = g; d[i + 2] = b; // UNCLAMPED — headroom preserved
    }
    return fimg;
  },
  apply(input, ctx) {
    const hue = ctx.hasRaw('Hue') ? ctx.rawParam('Hue', 0) : ctx.rawParam('Hue Rotation', 0);
    const saturation = ctx.rawParam('Saturation', 0);
    const value = ctx.rawParam('Value', 1);
    const mix = ctx.rawParam('Mix', 1);

    // DECODED gamma-1.958 working-space transfer (fct/parity, node-boundary faithful,
    // VERIFIED vs REAL FCP headless).
    return hueSaturationFilter(input, { hue, saturation, value, mix });
  },
});
