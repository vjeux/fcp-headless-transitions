/**
 * Contrast (PAEContrast) — Motion "Contrast" filter.
 *   pluginUUID B13B57AC-811B-4A24-BB5A-2167A3C66F5F, pluginVersion 0.
 *   Used by 12 shipping transition hosts (2nd-most-used previously-unimplemented filter).
 *
 * ============================ FCP DECODE (fct/parity, 2026-07-22) =============================
 * PARAMETERS (from -[PAEContrast addParameters] + the corpus .motr blocks):
 *   Contrast (id 1, default 1.0 = identity) + Mix (id 10001, default 1).
 *
 * PAEContrast is a per-channel tone curve. The CPU builds a 1-D LUT via a cubic Bezier
 * (-[PAEContrast generateLut:forContrast:andPivot:] + calculateBezier:…), rotating the
 * y=x line around a pivot. DECODED by a dense headless-FCP transfer sweep (gray ramp ×
 * Contrast ∈ {0.5,0.75,1,1.25,1.5,2}) + least-squares fit: the curve is EXACTLY an affine
 * scale around a pivot IN THE UNIFIED gamma-1.958 WORKING SPACE:
 *
 *     out = ws_inv( 0.5 + (ws(in) - 0.5) * Contrast )         ws(x) = (x/255)^0.51117
 *
 * i.e. pivot = 0.5 in the working space (= sRGB code ≈ 65.8, matching the measured ~64
 * fixed point), and the slope is EXACTLY Contrast in that space. Fits REAL headless FCP at
 * 0.18 rms / 0.5 worst level across the whole ramp and all contrasts (transfer.PAEContrast).
 * This is the SAME gamma-1.958 working space as Tint / HSV / Colorize / Levels — Contrast is
 * a linear contrast-scale about the working-space midpoint. (The code-space transfer looks
 * like slope≈Contrast^1.135 with a low ~60-code pivot; that ^1.135 is just the code-space
 * shadow of the working-space multiply — 2.22/1.958 — not a separate curve.)
 */
import { registerFilter } from './registry.js';

const WS_INV_GAMMA = 0.51117;            // ws(x) = (x/255)^0.51117 (gamma ≈ 1.958)
const WS_GAMMA = 1.0 / WS_INV_GAMMA;
const WS_PIVOT = 0.5;                    // working-space midpoint (sRGB code ≈ 65.8)

export function contrastFilter(input: ImageData, contrast: number, mix: number = 1): ImageData {
  const width = input.width, height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  if (contrast === 1) return input;      // identity
  // Per-channel LUT (256) of the working-space contrast-around-0.5 curve.
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const ws = Math.pow(i / 255, WS_INV_GAMMA);
    const ows = WS_PIVOT + (ws - WS_PIVOT) * contrast;
    lut[i] = Math.round(Math.pow(ows <= 0 ? 0 : ows >= 1 ? 1 : ows, WS_GAMMA) * 255);
  }
  for (let i = 0; i < src.length; i += 4) {
    if (mix >= 1) {
      out[i] = lut[src[i]]; out[i + 1] = lut[src[i + 1]]; out[i + 2] = lut[src[i + 2]];
    } else {
      out[i] = Math.round(src[i] * (1 - mix) + lut[src[i]] * mix);
      out[i + 1] = Math.round(src[i + 1] * (1 - mix) + lut[src[i + 1]] * mix);
      out[i + 2] = Math.round(src[i + 2] * (1 - mix) + lut[src[i + 2]] * mix);
    }
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, width, height);
}

registerFilter({
  uuid: 'B13B57AC-811B-4A24-BB5A-2167A3C66F5F',
  names: ['contrast', 'paecontrast'],
  label: 'Contrast',
  apply(input, ctx) {
    return contrastFilter(input, ctx.param('Contrast', 1), ctx.param('Mix', 1));
  },
  // FLOAT WORKING-SPACE path (architectural, 2026-07-23): Contrast is an affine scale about the
  // working-space pivot 0.5 — and the fused buffer is ALREADY in gamma-1.961 working space, so we
  // apply it DIRECTLY with no code↔working round-trip and NO clamp. The unclamped result carries
  // over-1.0 / under-0 excursions to the terminal encode (or a following filter), matching FCP's
  // float HGColorMatrix. This is the fix for transfer.PAEContrast's over-1.0 clamp divergence.
  applyWorking(fimg: import('../working-space.js').FloatImage, ctx): import('../working-space.js').FloatImage {
    const contrast = ctx.param('Contrast', 1);
    const mix = ctx.param('Mix', 1);
    if (contrast === 1 || mix <= 0) return fimg;
    const d = fimg.data;
    for (let i = 0; i < d.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const ws = d[i + c];
        const ows = WS_PIVOT + (ws - WS_PIVOT) * contrast; // unclamped affine-about-0.5
        d[i + c] = mix >= 1 ? ows : ws + (ows - ws) * mix;
      }
    }
    return fimg;
  },
});
