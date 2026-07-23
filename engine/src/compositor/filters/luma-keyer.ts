/**
 * Luma Keyer filter.
 *
 * ============================ FCP REVERSE-ENGINEERING ============================
 * FCP has TWO luma-key shaders (tools/re/extract_shader.py):
 *
 * --- HgcLumaKey (the pure-math keyer) VERBATIM ---
 *   rgb = color0 un-premultiplied
 *   luma = dot(rgb, hg_Params[0].xyz)          // ⚠️ luma weights are a PARAM, not fixed 601
 *   lo = hg_Params[2].x   hi = hg_Params[2].y  // key BAND edges (low/high thresholds)
 *   inv = 1/(hi-lo)
 *   // rising edge at lo:
 *   t = (luma - lo) * inv;  t *= (luma >= lo)   // ramp 0..1 across [lo,hi]
 *   aboveHi = (luma >= hi)
 *   keyA = clamp(t + aboveHi, 0, 1)            // 1 above hi, ramp in band, 0 below lo
 *   // FCP builds a 4-vector {keyA, 1-keyA, keyC, 1-keyC} where keyC is a SECOND
 *   // one-sided key using (1 - hi) as an upper clamp (for the "invert/outside" leg),
 *   // then alpha = dot(that4, hg_Params[1])   // hg_Params[1] selects key combination
 *   out.a = alpha * origAlpha;  out.rgb = rgb * alpha  (re-premult)
 *   ⇒ the effective key is a LINEAR RAMP across [lo,hi] (not the symmetric
 *   threshold±softness band the legacy TS uses). Phase-2: match the [lo,hi] ramp and
 *   read the luma weights from the param (hg_Params[0]) instead of hardcoding 601.
 *
 * --- HgcLumaKeyer (the LUT keyer, UUID 7E9178C5-…) VERBATIM ---
 *   x = clamp(color0.x, 0, hg_Params[2].x)     // clamp luma to a max (Clip Level)
 *   uv = (x*255 + 0.5, 0.5) + hg_Params[3].xy, scaled by hg_Params[3].zw   // texel center
 *   k = hg_Texture1.sample(uv).x               // 1-D tolerance/rolloff LUT (256-wide)
 *   out = clamp(k * hg_Params[1] + hg_Params[0], 0, 1)   // scale+bias the keyed result
 *   ⇒ THIS variant bakes the Tolerance/Softness curve into a 256-entry 1-D texture
 *   and samples it. The LUT is built CPU-side in -[PAELumaKeyer createLutForNode:…]:
 *     for i in 0..N-1:  lut[i] = OMKeyer2D::getAlphaLuma( (i/(N-1)) * softScale )
 *   (N=256 for SDR; softScale≈1). getAlphaLuma(x) (ProAppsFxSupport, decoded @0x3bf94)
 *   is a 4-CONTROL-POINT TRAPEZOID band-pass over luma, with control points
 *   A'=(lumA+1)/2, B'=(lumB+1)/2, C'=(lumC+1)/2, D'=(lumD+1)/2:
 *       x < A'           → 0                    (below the low edge → keyed out)
 *       A' ≤ x < B'      → risingSpline((x-A')/(B'-A'))     (steep soft-in)
 *       B' ≤ x < C'      → 1                    (plateau → fully KEPT)
 *       C' ≤ x < D'      → fallingSpline((D'-x)/(D'-C'))    (linear-ish soft-out)
 *       x ≥ D'           → 0                    (above the high edge → keyed out)
 *   then clamp[0,1]. The keyer node feeds color0.x = luma Y (desiredRGBToYCbCrMatrix
 *   Y-row, Rec.709, seen in -[PAELumaKeyer getKeyerNode:] building an HGColorMatrix
 *   from desiredRGBToYCbCrMatrix). RGB is UN-premultiplied and passes through UNCHANGED;
 *   only ALPHA is replaced by out (then re-premultiplied at composite time).
 *
 *   MEASURED default keyer curve (tools/re/gen_pattern.py ramp → filter_probe → read a
 *   row of the RGBA output; the filter's Luma param is a static non-keyframed keyer blob
 *   so both shipping users get this DEFAULT curve; DefaultSoftness=9, Strength=1, Invert=0).
 *   DECODED 2026-07-23 via a FINE headless-FCP alpha ramp (0..255 step 1 on both edges,
 *   /tmp/keyer_fine.json → scipy fit): the trapezoid is a straight-line band-pass in the
 *   gamma-1.958 WORKING SPACE (xw = luma^iv, iv=0.51117), NOT a smoothstep in code space.
 *   In WS coords the control points are clean rationals B=1/4, C=3/4, D=1 (rms 0.37 /
 *   max 1.04 lvl):  xw<1/4 → xw/(1/4) rising ramp;  1/4≤xw<3/4 → 1 plateau (fully KEPT);
 *   3/4≤xw<1 → (1-xw)/(1/4) falling ramp;  xw≥1 → 0.  The earlier "measured" code-space
 *   edges (0.004/0.067/0.56/1.0) were exactly these WS ¼/¾ warped by ^(1/iv); modelling them
 *   with a code-space SMOOTHSTEP rising edge was rms 12.82 / max 71 lvl WRONG in ALPHA — a
 *   gate-invisible bug (the 65-slug PSNR gate is RGB-only). i.e. it KEEPS shadows+mids and
 *   keys out highlights (and pure black). RGB output == input (verified vs headless).
 *   The keyer node feeds color0.x = luma Y (desiredRGBToYCbCrMatrix Y-row, Rec.709, seen in
 *   -[PAELumaKeyer getKeyerNode:] building an HGColorMatrix from desiredRGBToYCbCrMatrix).
 *   RGB is UN-premultiplied and passes through UNCHANGED; only ALPHA is replaced by out
 *   (then re-premultiplied at composite time). LUMA_KEYER_B/C/D below encode this (WS space).
 * ============================================================================
 *
 * Makes pixels transparent based on their luminance (brightness).
 * Used by luma-based reveal transitions.
 *
 * Legacy TS parameters (see lumaKeyerFilter):
 *   - Luma: threshold luminance (0-1) — pixels near this become transparent
 *   - Luma Rolloff / DefaultSoftness: softness of the key edge
 *   - Strength: how strongly to apply the key (0-1)
 *   - Invert: flip which side is keyed
 */
import { luma } from '../blend.js';

export interface LumaKeyerParams {
  luma: number;      // 0-1 threshold (kept for the analytic fallback / legacy callers)
  rolloff: number;   // softness
  strength: number;  // 0-1
  invert: boolean;
}

// FCP default keyer control points — DECODED (2026-07-23) as a LINEAR band-pass trapezoid
// in the gamma-1.958 WORKING SPACE (xw = luma^iv, iv=0.51117), NOT a smoothstep in code
// space. A fine headless-FCP luma-ramp alpha probe (0..255 step 1 on both edges, /tmp/
// keyer_fine.json) fit a clean linear trapezoid in xw with rational control points
// B=1/4, C=3/4, D=1 at rms 0.37 / max 1.04 lvl. The previous smoothstep-in-code-space model
// was rms 12.82 / max 71 lvl off in ALPHA (a gate-invisible bug — the 65-slug PSNR gate is
// RGB-only and never checks alpha). The old code-space edge points (A'=0.004, B'=0.067,
// C'=0.56, D'=1.0) are exactly these WS rationals viewed through ^(1/iv):
//   0.25^(1/iv)=0.062, 0.75^(1/iv)=0.564 — i.e. the "measured" 0.067/0.56 were the WS ¼/¾.
// Band-pass: KEEP shadows+mids, key out highlights and pure black.
const WS_INV_GAMMA = 0.51117;      // working-space inverse gamma (gamma≈1.9563, Rec.709)
const LUMA_KEYER_B = 0.25;   // rising edge end   (WS space; ramp 0→1 across [0,B])
const LUMA_KEYER_C = 0.75;   // plateau end       (WS space; fully kept [B,C])
const LUMA_KEYER_D = 1.0;    // falling edge end  (WS space; ramp 1→0 across [C,D])

/** FCP OMKeyer2D::getAlphaLuma — DECODED as a LINEAR trapezoid band-pass in the WS-gamma
 *  space. Input `x` is code-space luma in [0,1]; it is raised to the working-space inverse
 *  gamma (xw = x^iv) and passed through a straight-line trapezoid with control points
 *  B, C, D (in WS coords). Both edges are LINEAR in WS — the rising edge only LOOKED like a
 *  steep soft-in in code space because of the gamma warp. Returns alpha in [0,1]. */
function getAlphaLuma(x: number, B: number, C: number, D: number): number {
  const xw = Math.pow(x < 0 ? 0 : x > 1 ? 1 : x, WS_INV_GAMMA); // to working space
  let a: number;
  if (xw < B) {
    a = xw / B;                     // rising ramp (linear in WS; sqrt-like in code space)
  } else if (xw < C) {
    a = 1;                          // plateau — fully kept
  } else if (xw < D) {
    a = (D - xw) / (D - C);         // falling ramp (linear in WS)
  } else {
    a = 0;
  }
  return a < 0 ? 0 : a > 1 ? 1 : a;
}

/**
 * Apply luma keying to an image (modifies alpha based on luminance).
 *
 * Faithful to FCP's HgcLumaKeyer: computes luma Y (Rec.709), maps it through the
 * decoded getAlphaLuma trapezoid, and writes the result as the new alpha. RGB is left
 * UNCHANGED (un-premultiplied passthrough), matching headless FCP (RGB==input). Strength
 * blends between the original alpha and the keyed alpha; Invert flips the key.
 */
export function lumaKeyerFilter(input: ImageData, params: LumaKeyerParams): ImageData {
  const { strength, invert } = params;
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src);

  for (let i = 0; i < src.length; i += 4) {
    const lum = luma(src[i], src[i + 1], src[i + 2]) / 255;
    let key = getAlphaLuma(lum, LUMA_KEYER_B, LUMA_KEYER_C, LUMA_KEYER_D);
    if (invert) key = 1 - key;
    // RGB passes through unchanged; only alpha is keyed (re-premultiplied at composite).
    const origAlpha = src[i + 3];
    const keyedAlpha = origAlpha * key;
    out[i + 3] = Math.round(origAlpha * (1 - strength) + keyedAlpha * strength);
  }

  return new ImageData(out, width, height);
}


import { registerFilter } from './registry.js';

// Luma Keyer (UUID 7E9178C5-…). Behavior-identical to the legacy branch: Luma
// (default 0.5), rolloff from 'Luma Rolloff' or 'DefaultSoftness' (0.1), Strength
// (1), Invert (bool from value > 0).
registerFilter({
  uuid: '7E9178C5-7B0F-4B86-884D-FE79F568B6CE',
  names: ['luma keyer', 'lumakeyer'],
  label: 'Luma Keyer',
  apply(input, ctx) {
    const luma = ctx.param('Luma', 0.5);
    const rolloff = ctx.has('Luma Rolloff') ? ctx.param('Luma Rolloff', 0.1)
                                            : ctx.param('DefaultSoftness', 0.1);
    const strength = ctx.param('Strength', 1);
    const invert = ctx.param('Invert', 0) > 0;
    return lumaKeyerFilter(input, { luma, rolloff, strength, invert });
  },
});
