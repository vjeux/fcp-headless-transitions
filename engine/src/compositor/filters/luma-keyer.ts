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
 *   and samples it — so the edge shape can be arbitrary, not just linear. The TS impl
 *   approximates it with an analytic threshold±softness ramp; exact match needs the
 *   LUT build (frameSetup fills hg_Texture1 from the Tolerance/Softness params).
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
import { luma601 } from '../blend.js';

export interface LumaKeyerParams {
  luma: number;      // 0-1 threshold
  rolloff: number;   // softness
  strength: number;  // 0-1
  invert: boolean;
}

/**
 * Apply luma keying to an image (modifies alpha based on luminance).
 */
export function lumaKeyerFilter(input: ImageData, params: LumaKeyerParams): ImageData {
  const { luma, rolloff, strength, invert } = params;
  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src);

  const threshold = luma;
  const softness = Math.max(0.001, rolloff);

  for (let i = 0; i < src.length; i += 4) {
    const lum = luma601(src[i], src[i + 1], src[i + 2]) / 255;

    // Compute key value: 0 = fully keyed (transparent), 1 = fully visible
    // Pixels below (threshold - softness) → keyed; above → visible; smooth in between
    let key: number;
    if (lum <= threshold - softness) {
      key = 0;
    } else if (lum >= threshold + softness) {
      key = 1;
    } else {
      key = (lum - (threshold - softness)) / (2 * softness);
    }

    if (invert) key = 1 - key;

    // Apply strength: blend between original alpha and keyed alpha
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
