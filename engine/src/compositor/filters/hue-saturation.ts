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
 */
export function hueSaturationFilter(input: ImageData, params: HueSatParams): ImageData {
  const { hue, saturation, value, mix } = params;
  const satFactor = 1 + saturation;   // 0-centered -> lerp weight toward color
  const valMul = value * value;       // FCP applies Value as a squared multiply
  if (hue === 0 && saturation === 0 && value === 1) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  // DECODED 2026-07-12 (-[PAEHSVAdjust canThrowRenderOutput] @0x37294): the Hue param
  // is in DEGREES (not turns). FCP wraps it into [0, 360] then divides by 360 to feed
  // hg_Params[0].x as turns; the +1.0 inside frac() is a no-op. So turns = hue/360.
  // (Prior TS docstring said "turns" — that was wrong. All 4 shipping users set Hue=0,
  // so this is gate-neutral, but the isolated sweep exercised Hue=0.25 which is
  // 0.25 DEGREES ≈ 0.000694 turns — a tiny rotation, exactly what headless produces.)
  const hueTurns = (((hue / 360) % 1) + 1) % 1;
  const doHue = hueTurns !== 0;

  for (let i = 0; i < src.length; i += 4) {
    let r = src[i] / 255, g = src[i + 1] / 255, b = src[i + 2] / 255;

    if (doHue) {
      let [h, s, v] = rgbToHsv(r, g, b);
      h = (h + hueTurns) % 1;
      [r, g, b] = hsvToRgb(h, s, v);
    }
    // Saturation: lerp between Rec.709 gray and color by (1 + Saturation).
    if (saturation !== 0) {
      const gray = luma709(r, g, b);
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }
    // Value: squared multiply.
    if (value !== 1) { r *= valMul; g *= valMul; b *= valMul; }

    const cl = (x: number) => Math.max(0, Math.min(1, x));
    if (mix >= 1) {
      out[i] = Math.round(cl(r) * 255);
      out[i + 1] = Math.round(cl(g) * 255);
      out[i + 2] = Math.round(cl(b) * 255);
    } else {
      out[i] = Math.round((src[i] / 255 * (1 - mix) + cl(r) * mix) * 255);
      out[i + 1] = Math.round((src[i + 1] / 255 * (1 - mix) + cl(g) * mix) * 255);
      out[i + 2] = Math.round((src[i + 2] / 255 * (1 - mix) + cl(b) * mix) * 255);
    }
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}


import { registerFilter } from './registry.js';

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
  apply(input, ctx) {
    const hue = ctx.hasRaw('Hue') ? ctx.rawParam('Hue', 0) : ctx.rawParam('Hue Rotation', 0);
    const saturation = ctx.rawParam('Saturation', 0);
    const value = ctx.rawParam('Value', 1);
    const mix = ctx.rawParam('Mix', 1);
    return hueSaturationFilter(input, { hue, saturation, value, mix });
  },
});
