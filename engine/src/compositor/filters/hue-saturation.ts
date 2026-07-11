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
 *   (1) FCP HUE offset is in TURNS (0..1), added AFTER the /6 — matches TS hueShift
 *       = hue/360 only if the Motion param is DEGREES; confirm the param units.
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
  hue: number;        // degrees of hue rotation
  saturation: number; // multiplier (1 = unchanged)
  brightness: number; // additive (-1 to 1)
  mix: number;        // blend factor
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

  switch (i % 6) {
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
 * Apply Hue/Saturation adjustment.
 */
export function hueSaturationFilter(input: ImageData, params: HueSatParams): ImageData {
  const { hue, saturation, brightness, mix } = params;

  // No-op check
  if (hue === 0 && saturation === 1 && brightness === 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  const hueShift = hue / 360; // normalize to 0-1

  for (let i = 0; i < src.length; i += 4) {
    const r = src[i] / 255;
    const g = src[i + 1] / 255;
    const b = src[i + 2] / 255;

    let [h, s, v] = rgbToHsv(r, g, b);

    // Apply adjustments
    h = (h + hueShift + 1) % 1; // rotate hue
    s = Math.max(0, Math.min(1, s * saturation)); // scale saturation
    v = Math.max(0, Math.min(1, v + brightness)); // offset brightness

    const [outR, outG, outB] = hsvToRgb(h, s, v);

    if (mix >= 1) {
      out[i] = Math.round(outR * 255);
      out[i + 1] = Math.round(outG * 255);
      out[i + 2] = Math.round(outB * 255);
    } else {
      out[i] = Math.round((r * (1 - mix) + outR * mix) * 255);
      out[i + 1] = Math.round((g * (1 - mix) + outG * mix) * 255);
      out[i + 2] = Math.round((b * (1 - mix) + outB * mix) * 255);
    }
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}


import { registerFilter } from './registry.js';

// HSV Adjust (PAEHSVAdjust, UUID D23AF030-…). FAITHFUL migration of the legacy
// dispatch, which read the filter's OWN params and IGNORED rig overrides — so this
// uses rawParam (not param). Hue (or 'Hue Rotation', default 0), Saturation (1),
// brightness from 'Brightness' or 'Value' (0), Mix (1).
// NOTE: whether HSV SHOULD honor rig overrides is a separate open question (ROADMAP)
// — honoring them changed Stylized__Color_Panels output (−0.84 dB), so the mechanical
// migration preserves the legacy raw-read behavior exactly.
registerFilter({
  uuid: 'D23AF030-B0BF-44DF-B622-7C9EA0DF5744',
  names: ['hsv', 'hue', 'saturation'],
  label: 'HSV Adjust',
  apply(input, ctx) {
    const hue = ctx.hasRaw('Hue') ? ctx.rawParam('Hue', 0) : ctx.rawParam('Hue Rotation', 0);
    const saturation = ctx.rawParam('Saturation', 1);
    const brightness = ctx.hasRaw('Brightness') ? ctx.rawParam('Brightness', 0) : ctx.rawParam('Value', 0);
    const mix = ctx.rawParam('Mix', 1);
    return hueSaturationFilter(input, { hue, saturation, brightness, mix });
  },
});
