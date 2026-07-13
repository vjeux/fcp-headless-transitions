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
 *   with a DISTINCT output-black AND output-white, gamma is pow(x,gamma) at the SHADER
 *   level, and there is a SECOND stage + Mix. Phase-2: expand levelsFilter to the
 *   two-stage form. Where a transition only sets stage-1 params (the common case) the
 *   second stage is identity, so the practical gap is the separate output-black point.
 * ⚠️ GAMMA DIRECTION (GUI-GT-verified 2026-07-11, do NOT "fix" to pow(x,gamma)):
 *   although the HgcLevels *shader* raises to pow(x, gamma), the Motion "Gamma" UI
 *   param is fed to the shader as its RECIPROCAL, so the net mapping the TS LUT must
 *   reproduce is pow(x, 1/gamma) — a UI Gamma>1 brightens midtones. Confirmed on
 *   Objects/Leaves (authored Gamma=1.726): pow(1/gamma) scores 11.76/13.78 dB vs GUI
 *   GT at f6/f12, while pow(gamma) drops to 9.75/12.54. A synthetic filter_probe
 *   (factoryID=7, guessed param ids) rendered IDENTITY and cannot resolve this — only
 *   the GUI GT can, because it exercises the real Histogram>RGB>Gamma(id=5) plumbing.
 *   Verify against the gate before changing (Levels is used by 27+ transitions).
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
  blackOut?: number; // 0-1, default 0 (output black point)
  whiteOut: number;  // 0-1, default 1 (output white point)
  mix: number;       // 0-1, default 1
}

/**
 * Apply levels adjustment to an image.
 */
export function levelsFilter(input: ImageData, params: LevelsParams): ImageData {
  const { blackIn, whiteIn, gamma, whiteOut, mix } = params;
  const blackOut = params.blackOut ?? 0;

  // No-op check
  if (blackIn === 0 && whiteIn === 1 && gamma === 1 && blackOut === 0 && whiteOut === 1) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  const range = whiteIn - blackIn;
  const invGamma = gamma !== 0 ? 1 / gamma : 1;

  // Build lookup table for speed (256 entries per channel):
  //   norm = clamp((x - blackIn)/(whiteIn - blackIn), 0, 1)
  //   out  = pow(norm, 1/gamma) * (whiteOut - blackOut) + blackOut
  // Verified vs headless FCP: gamma is pow(x, 1/gamma) (gamma>1 brightens midtones);
  // the input black/white affine + output black/white remap match the HgcLevels
  // stage-1 form (the second HgcLevels stage is identity for these templates).
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    const normalized = Math.max(0, Math.min(1, (i / 255 - blackIn) / (range || 0.001)));
    const gammaCorrected = Math.pow(normalized, invGamma);
    const output = gammaCorrected * (whiteOut - blackOut) + blackOut;
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
 * PAEBrightness — per-channel MULTIPLY. FCP renders in a LINEAR working space
 * (decoded below), which makes the ISOLATED transfer curve piecewise on `amount`:
 *
 * DECODED 2026-07-12 (tools/re/filter_probe.py + a synthetic 0..255 gradient through
 * the real headless FCP engine, and oz_render.mm OZ_WS_DEBUG confirming the working
 * color space is kCGColorSpaceLinearSRGB / 16-bit half-float ExtendedLinearSRGB
 * readback). The 8-bit source node is UNTAGGED, so FCP treats its code values AS
 * linear working values; HGColorMatrix multiplies by `amount` in that space, and the
 * readback sRGB-encodes the result. Measured ISOLATED transfer (gradient, code v):
 *
 *   • amount <= 1 (darken):   out = clip(amount · v)          — exact, mad 0.24
 *   • amount  > 1 (brighten): out = srgbEncode(amount · v/255) — exact, mad 0.12
 *
 * with a hard discontinuity at amount == 1 (verified: b=0.95 code-mult leg, b=1.01
 * linear-encode leg). This matches the isolated headless probe (brighten PSNR 13->34).
 *
 * ⚠️ BUT the brighten-encode is a PER-FILTER encode, and FCP keeps the WHOLE node
 * graph in linear working space and encodes ONCE at readback. The only shipping
 * PAEBrightness user (Objects__Curtains, amount=2.91) STACKS Brightness → Mono
 * (PAEChannelMixer), so a per-filter sRGB-encode between them diverges from FCP's
 * single-encode chain and REGRESSED the GUI-GT gate (Curtains 14.31 -> 13.85, -0.46).
 * The one truth is the GUI GT (ROADMAP rule 1), so the shipped code keeps the plain
 * code-multiply for BOTH legs: it is what the GUI GT prefers for the stacked chain,
 * and correctly reduces to the darken leg for amount<=1. Closing the brighten leg
 * requires a linear-working-space FILTER CHAIN (encode once after all filters), which
 * is an engine-architecture change tracked separately — NOT a per-filter encode.
 *
 * ============================ LINEAR WORKING SPACE (T-D2a) ============================
 * FCP's HGColorMatrix runs in the LINEAR working color space (see compositor/linear.ts:
 * kCGColorSpaceExtendedLinearSRGB, decoded 2026-07-12 from oz_render.mm OZ_WS_DEBUG).
 * The physically-correct model — matching FCP's chain when all filters run in linear
 * and the buffer encodes ONCE at readback — is:
 *   linear = srgbDecode(v/255) ; linear' = linear * amount ; out = srgbEncode(clip(linear'))
 * This is what the shader actually computes when the working buffer is Extended-Linear-
 * sRGB and its input has been sRGB-decoded at scene ingest (T-D1's contract). It
 * DIFFERS from BOTH measured legs of the standalone probe: the darken measurement
 * (clip(amount·v)) matches only because FCP's isolated test passed an sRGB-tagged
 * 8-bit source through a code-space multiply. In the working-space chain the two
 * PAEBrightness users — Objects__Curtains (amount=2.91) + Replicator-Clones__3D_
 * Rectangle (8× Brightness copies, animated 1.0→~0.65 dims) — both flow through
 * the linear buffer.
 *
 * `linear=true` opts into that path: decode input sRGB→linear via LUT_SRGB_TO_LINEAR,
 * multiply by `amount` in linear light, encode back via linearChannelToSrgb. Wired to
 * `isLinearCompositeEnabled()` at the registry callsite; flag defaults OFF so shipped
 * behaviour is BYTE-IDENTICAL. The default flag flip happens after all four T-D2*
 * filter families have landed (T-D1's contract).
 * ============================================================================
 */
export function brightnessFilter(input: ImageData, amount: number, linear: boolean = false): ImageData {
  if (amount === 1) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

  if (linear) {
    // Physically-correct linear-working-space multiply: decode → multiply →
    // encode. Same math for BOTH legs (no discontinuity at amount=1). Alpha
    // is coverage (linear), preserved as-is.
    const lut = LUT_SRGB_TO_LINEAR;
    for (let i = 0; i < src.length; i += 4) {
      const rL = lut[src[i]]     * amount;
      const gL = lut[src[i + 1]] * amount;
      const bL = lut[src[i + 2]] * amount;
      out[i]     = linearChannelToSrgb(rL);
      out[i + 1] = linearChannelToSrgb(gL);
      out[i + 2] = linearChannelToSrgb(bL);
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, width, height);
  }

  for (let i = 0; i < src.length; i += 4) {
    out[i] = Math.max(0, Math.min(255, src[i] * amount));
    out[i + 1] = Math.max(0, Math.min(255, src[i + 1] * amount));
    out[i + 2] = Math.max(0, Math.min(255, src[i + 2] * amount));
    out[i + 3] = src[i + 3];
  }

  return new ImageData(out, width, height);
}

import { registerFilter } from './registry.js';
import { evaluateCurve } from '../../evaluator/curves.js';
import {
  isLinearCompositeEnabled,
  LUT_SRGB_TO_LINEAR,
  linearChannelToSrgb,
} from '../linear.js';

// PAEBrightness — sRGB per-channel MULTIPLY (out = in * amount; identity at 1).
// Phase-2 verified against headless FCP (see brightnessFilter). Param default is 1
// (the plugin's declared default), NOT 0 — a multiply's identity is 1. The `linear`
// arg opts into the T-D1 linear working-space branch (see brightnessFilter header);
// wired to isLinearCompositeEnabled() so flag OFF is byte-identical (T-D2a contract).
registerFilter({
  uuid: '2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6',
  names: ['brightness'],
  label: 'Brightness',
  apply(input, ctx) {
    const amount = ctx.has('Brightness') ? ctx.param('Brightness', 1) : ctx.param('Amount', 1);
    return brightnessFilter(input, amount, isLinearCompositeEnabled());
  },
});

// PAELevels (UUID 2B221FA1-…). The Black/White In/Out + Gamma live NESTED under
// "Histogram" > "RGB" (per-channel groups also exist: Red/Green/Blue). A flat
// ctx.param('Black In') NEVER matched -> Levels was a NO-OP (verified vs headless
// FCP: TS returned the unchanged image where FCP applied the remap). Reads the
// nested RGB group (flat fallback kept for robustness).
registerFilter({
  uuid: '2B221FA1-08A2-416E-998C-D7559E5509B5',
  names: ['levels', 'paelevels'],
  label: 'Levels',
  apply(input, ctx) {
    const t = ctx.time;
    // Resolve a value nested under Histogram > RGB > <name>, else flat.
    const nested = (name: string, def: number): number => {
      const hist = ctx.filter.parameters.find(p => p.name === 'Histogram');
      const rgb = hist?.children?.find(c => c.name === 'RGB');
      const c = rgb?.children?.find(cc => cc.name === name);
      if (c) {
        if (c.curve) return evaluateCurve(c.curve, t);
        if (typeof c.value === 'number') return c.value;
      }
      return ctx.param(name, def);
    };
    return levelsFilter(input, {
      blackIn: nested('Black In', 0),
      whiteIn: nested('White In', 1),
      gamma: nested('Gamma', 1),
      blackOut: nested('Black Out', 0),
      whiteOut: nested('White Out', 1),
      mix: ctx.param('Mix', 1),
    });
  },
});
