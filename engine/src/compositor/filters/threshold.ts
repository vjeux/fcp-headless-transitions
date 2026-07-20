/**
 * Threshold (PAEThreshold) — Motion "Threshold" filter.
 *   pluginUUID 96AFC322-287E-4014-9EFD-763CD9813C67, pluginVersion 1.
 *
 * ============================ FCP PHASE-1 REVERSE-ENGINEERING =============================
 * VERBATIM HgcThreshold fragment shader (evidence/shaders/HgcThreshold.metal) + CPU wiring
 * from -[PAEThreshold canThrowRenderOutput:] (the smoothness->slope is `1.0 / Smoothness`).
 *
 * PARAMETERS (from the real .motr block + -[PAEThreshold addParameters]):
 *   Threshold  (id 1, default 0.5)  — the luma level that splits dark/light.
 *   Smoothness (id 2, default 0.15) — width of the soft transition band around Threshold.
 *                                 0 = hard step; larger = softer ramp.
 *   Dark Color  (id 3, RGB, default black) — output where luma < Threshold.
 *   Light Color (id 4, RGB, default white) — output where luma > Threshold.
 *   (Mix present, default 1.)
 *
 * HgcThreshold SHADER (verbatim):
 *   c0 = (0.3086, 0.6094, 0.082, 0.5)          // Threshold-luma weights + the 0.5 bias
 *   rgb  = color0.rgb / max(color0.a, 1e-6)     // UN-premultiply
 *   luma = dot(rgb, c0.xyz)                      // Motion "Threshold" luminance (NOT Rec.709)
 *   t    = luma - hg_Params[0].x                 // hg_Params[0].x = Threshold
 *   t    = clamp(t * hg_Params[1].x + 0.5, 0, 1) // hg_Params[1].x = 1/Smoothness; +0.5 centres
 *   out.rgb = mix(hg_Params[2].xyz, hg_Params[3].xyz, t)   // dark->light lerp by t
 *   out.rgb *= color0.a                          // RE-premultiply
 *   out.a   = color0.a
 *
 * ⇒ Threshold = binarize-with-soft-edge on the 0.3086/0.6094/0.082 luma: a smooth ramp of
 *   half-width Smoothness centred on Threshold, remapping to Dark/Light colours. Alpha kept.
 *   The luma weights are Motion's classic "Threshold" luminance (0.3086,0.6094,0.082), NOT
 *   Rec.709 — verified verbatim in the shader constant c0.xyz.
 *   SPLIT POINT verified against headless FCP on a PHOTO source: output flips dark->light at
 *   luma == Threshold EXACTLY (Thr 0.3/0.5/0.7 -> split 0.300/0.500/0.700, <1.3% misclass).
 *
 * CPU hg_Params mapping (decoded):
 *   hg_Params[0].x = Threshold
 *   hg_Params[1].x = 1 / Smoothness   (Smoothness=0 => +inf => hard step; the clamp handles it)
 *   hg_Params[2]   = Dark Color RGB
 *   hg_Params[3]   = Light Color RGB
 *
 * ── PHASE-2 STATUS: implemented below, faithful to the shader (split=Threshold verified).
 *   No shipping transition in the 65 uses PAEThreshold, so byte-neutral to the GUI-GT gate.
 */
import { registerFilter } from './registry.js';

// Motion "Threshold" luminance weights (shader c0.xyz — NOT Rec.709).
const TL_R = 0.3086, TL_G = 0.6094, TL_B = 0.082;

export function thresholdFilter(
  input: ImageData,
  opts: {
    threshold: number; smoothness: number;
    dark: [number, number, number]; light: [number, number, number]; mix: number;
  },
): ImageData {
  const { width: W, height: H } = input;
  const src = input.data;
  const dst = new Uint8ClampedArray(src.length);
  // slope = 1/Smoothness (hard step when Smoothness->0). Cap to a large finite value so
  // Smoothness=0 yields an exact step without NaN/inf.
  const slope = opts.smoothness > 1e-6 ? 1 / opts.smoothness : 1e6;
  const dr = opts.dark[0] * 255, dg = opts.dark[1] * 255, db = opts.dark[2] * 255;
  const lr = opts.light[0] * 255, lg = opts.light[1] * 255, lb = opts.light[2] * 255;
  const mix = opts.mix;
  for (let i = 0; i < src.length; i += 4) {
    const a = src[i + 3];
    if (a === 0) { dst[i] = dst[i + 1] = dst[i + 2] = 0; dst[i + 3] = 0; continue; }
    const inv = 1 / a;                              // un-premult; rgb in 0..1 straight
    const rr = src[i] * inv, gg = src[i + 1] * inv, bb = src[i + 2] * inv;
    const luma = TL_R * rr + TL_G * gg + TL_B * bb; // 0..1
    let t = (luma - opts.threshold) * slope + 0.5;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    let or_ = dr + (lr - dr) * t, og = dg + (lg - dg) * t, ob = db + (lb - db) * t; // 0..255
    if (mix < 1) {
      const pr = src[i] * inv * 255, pg = src[i + 1] * inv * 255, pb = src[i + 2] * inv * 255;
      or_ = pr + (or_ - pr) * mix; og = pg + (og - pg) * mix; ob = pb + (ob - pb) * mix;
    }
    const pa = a / 255;                             // re-premult
    dst[i] = clamp255(or_ * pa); dst[i + 1] = clamp255(og * pa); dst[i + 2] = clamp255(ob * pa);
    dst[i + 3] = a;
  }
  return new ImageData(dst, W, H);
}

function clamp255(v: number): number { return v < 0 ? 0 : v > 255 ? 255 : v; }

registerFilter({
  uuid: '96AFC322-287E-4014-9EFD-763CD9813C67',
  names: ['paethreshold'],
  label: 'Threshold',
  apply(input, ctx) {
    return thresholdFilter(input, {
      threshold: ctx.param('Threshold', 0.5),
      smoothness: ctx.param('Smoothness', 0.15),
      dark: [ctx.nestedParam('Dark Color', 'Red', 0), ctx.nestedParam('Dark Color', 'Green', 0), ctx.nestedParam('Dark Color', 'Blue', 0)],
      light: [ctx.nestedParam('Light Color', 'Red', 1), ctx.nestedParam('Light Color', 'Green', 1), ctx.nestedParam('Light Color', 'Blue', 1)],
      mix: ctx.param('Mix', 1),
    });
  },
});
