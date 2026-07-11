/**
 * Levels (PAELevels) + Brightness (PAEBrightness) filters.
 *
 * ============================ FCP REVERSE-ENGINEERING ============================
 * HgcLevels VERBATIM shader (tools/re/extract_shader.py HgcLevels). FCP's Levels is
 * a TWO-STAGE remap with a gamma between the stages AND a second gamma at the end —
 * richer than the single-stage TS levelsFilter below. Slot map (each hg_Params[i] is
 * a full float4 = per-channel R,G,B + the .w alpha lane):
 *   hg_Params[0] = input  BLACK point   hg_Params[1] = output BLACK point   (stage 1 in/out low)
 *   hg_Params[2] = input  WHITE point   hg_Params[3] = output WHITE point   (stage 1 in/out high)
 *   hg_Params[4] = stage-1 GAMMA (pow)
 *   hg_Params[5..8] = stage-2 in-black/out-black/in-white/out-white
 *   hg_Params[9]  = stage-2 GAMMA (pow)
 *   hg_Params[10] = Mix
 * Algorithm (un-premult r3 first):
 *   // STAGE 1: affine remap inBlack..inWhite -> outBlack..outWhite
 *   slope1 = (outWhite - outBlack) / ((inBlack - inWhite) + 1e-5)     // NOTE sign: (inB-inW)
 *   b1     = slope1 * (-inBlack) + outBlack
 *   x = clamp(rgb*slope1 + b1, 0,1);  x = clamp(x + 1e-5, 0,1)
 *   x = pow(x, gamma1)                                                // hg_Params[4]
 *   // STAGE 2: same affine shape with the stage-2 slots
 *   slope2 = (out2White - out2Black) / ((in2Black - in2White) + 1e-5)
 *   b2     = slope2 * (-in2Black) + out2Black
 *   x = clamp(x*slope2 + b2, 0,1);  x = clamp(x + 1e-5, 0,1)
 *   x = pow(x, gamma2)                                                // hg_Params[9]
 *   x.rgb *= x.w                                                      // re-premult by alpha
 *   out = mix(rgb_premult, x, hg_Params[10])                          // Mix
 * ⚠️ FINDING: the legacy TS levelsFilter does ONE stage: normalize by
 *   (in-blackIn)/(whiteIn-blackIn), pow(1/gamma), *whiteOut. FCP does the affine map
 *   with a DISTINCT output-black AND output-white, gamma is pow(x,gamma) (NOT 1/gamma),
 *   and there is a SECOND stage + Mix. Phase-2: expand levelsFilter to the two-stage
 *   form. Where a transition only sets stage-1 params (the common case) the second
 *   stage is identity, so the practical gap is gamma-direction (pow vs 1/pow) + the
 *   separate output-black point. Verify against the gate before changing (Levels is
 *   used by 27+ transitions — large blast radius).
 *
 * PAEBrightness: no dedicated Hgc shader (it maps to a generic brightness path);
 * additive add of amount*255 per RGB channel, alpha preserved — the TS form matches.
 * ============================================================================
 *
 * Used by: Many transitions (27+) for brightness/contrast control.
 *
 * Legacy single-stage TS form (see levelsFilter):
 *   normalized = clamp((input - blackIn) / (whiteIn - blackIn), 0, 1)
 *   gammaCorrected = pow(normalized, 1/gamma)
 *   output = gammaCorrected * whiteOut
 */

export interface LevelsParams {
  blackIn: number;   // 0-1, default 0
  whiteIn: number;   // 0-1, default 1
  gamma: number;     // default 1.0
  whiteOut: number;  // 0-1, default 1
  mix: number;       // 0-1, default 1
}

/**
 * Apply levels adjustment to an image.
 */
export function levelsFilter(input: ImageData, params: LevelsParams): ImageData {
  const { blackIn, whiteIn, gamma, whiteOut, mix } = params;

  // No-op check
  if (blackIn === 0 && whiteIn === 1 && gamma === 1 && whiteOut === 1) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  const range = whiteIn - blackIn;
  const invGamma = gamma !== 0 ? 1 / gamma : 1;

  // Build lookup table for speed (256 entries per channel)
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const normalized = Math.max(0, Math.min(1, (i / 255 - blackIn) / (range || 0.001)));
    const gammaCorrected = Math.pow(normalized, invGamma);
    const output = gammaCorrected * whiteOut;
    lut[i] = Math.round(Math.max(0, Math.min(1, output)) * 255);
  }

  for (let i = 0; i < src.length; i += 4) {
    if (mix >= 1) {
      out[i] = lut[src[i]];
      out[i + 1] = lut[src[i + 1]];
      out[i + 2] = lut[src[i + 2]];
    } else {
      // Blend original with processed
      out[i] = Math.round(src[i] * (1 - mix) + lut[src[i]] * mix);
      out[i + 1] = Math.round(src[i + 1] * (1 - mix) + lut[src[i + 1]] * mix);
      out[i + 2] = Math.round(src[i + 2] * (1 - mix) + lut[src[i + 2]] * mix);
    }
    out[i + 3] = src[i + 3]; // preserve alpha
  }

  return new ImageData(out, width, height);
}

/**
 * Simple brightness adjustment (additive).
 * Plugin names: Brightness, Brightness copy
 */
export function brightnessFilter(input: ImageData, amount: number): ImageData {
  if (amount === 0) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const add = Math.round(amount * 255);

  for (let i = 0; i < src.length; i += 4) {
    out[i] = Math.max(0, Math.min(255, src[i] + add));
    out[i + 1] = Math.max(0, Math.min(255, src[i + 1] + add));
    out[i + 2] = Math.max(0, Math.min(255, src[i + 2] + add));
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}

import { registerFilter } from './registry.js';

// PAEBrightness — additive brightness. Reads 'Brightness' or 'Amount' (default 0,
// NOT the filter's declared default=1: the legacy dispatch inited amount=0 and
// brightnessFilter early-returns on 0). Behavior-identical to the old name-matched
// branch in compositor/index.ts.
registerFilter({
  uuid: '2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6',
  names: ['brightness'],
  label: 'Brightness',
  apply(input, ctx) {
    const amount = ctx.has('Brightness') ? ctx.param('Brightness', 0) : ctx.param('Amount', 0);
    return brightnessFilter(input, amount);
  },
});

// PAELevels (UUID 2B221FA1-…). Behavior-identical to the legacy branch: Black In
// (0), White In (1), Gamma (1), White Out (1), Mix (1).
registerFilter({
  uuid: '2B221FA1-08A2-416E-998C-D7559E5509B5',
  names: ['levels', 'paelevels'],
  label: 'Levels',
  apply(input, ctx) {
    return levelsFilter(input, {
      blackIn: ctx.param('Black In', 0),
      whiteIn: ctx.param('White In', 1),
      gamma: ctx.param('Gamma', 1),
      whiteOut: ctx.param('White Out', 1),
      mix: ctx.param('Mix', 1),
    });
  },
});
