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
 * ⚠️ BLACK/WHITE-POINT DIVERGENCE MEASURED (2026-07-15, real headless FCP probes):
 *   the built-in transitions author ONLY Gamma (Histogram>RGB>Gamma id=5), so the
 *   input/output black+white points are UNEXERCISED by the 65-slug gate. Phase-2
 *   probed them directly (filter_probe, Histogram>RGB>{Black In id=1, White In id=3}):
 *   FCP ACCEPTS them but the current single-stage TS affine DIVERGES:
 *     • Black In=0.3 → TS mean|Δ|≈12: TS crushes shadows harder than FCP
 *       (FCP in[191,136,82]→[169,99,39] vs TS [163,85,7] — TS B-channel goes to 7,
 *        FCP holds it at 39).
 *     • White In=0.7 → TS mean|Δ|≈34: FCP pushes G/B toward 255 harder than TS
 *       (FCP in[191,136,82]→[255,255,167] vs TS [255,194,117]).
 *   Neither an sRGB-space nor a linear-space single-stage affine reproduces both
 *   (linear got B closer on Black In but overshot R). This is consistent with FCP's
 *   internal TWO-STAGE HgcLevels (slot map above) applying the affine differently than
 *   the single-stage LUT. This stays a documented CEILING/GAP: the GUI-GT gate is
 *   UNAFFECTED (no built-in authors these points), and a faithful two-stage rewrite is
 *   deferred (needs the exact stage-1↔stage-2 param split + space decoded, and Levels
 *   is used by 27+ transitions so any change is gate-load-bearing). Sweep GAP cases
 *   'black in 0.3' / 'white in 0.7' added to tools/re/filter_sweeps.json track it.
 *   Param-id map (verified where noted): Black In=1, White In=3, Gamma=5; Black Out=2,
 *   White Out=4 (VERIFIED 2026-07-22 via transfer.PAELevels_outremap — a headless-FCP sweep
 *   of Black Out/White Out matched the engine's WS output-remap at 0.63 levels, confirming
 *   both the param IDs and that the output remap is affine out=ws_inv(bo+ws(in)*(wo-bo)) in
 *   the gamma-1.958 working space).
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

/** Levels params for ONE channel group (no mix — mix is applied once at the end). */
export interface LevelsChannel {
  blackIn: number; whiteIn: number; gamma: number; blackOut: number; whiteOut: number;
}

function levelsChannelIsIdentity(c: LevelsChannel): boolean {
  return c.blackIn === 0 && c.whiteIn === 1 && c.gamma === 1 && c.blackOut === 0 && c.whiteOut === 1;
}

/** Build a 256-entry code->code LUT for ONE channel's Levels params, in the decoded
 *  gamma-1.958 WORKING SPACE (the FCT_LEVELS_WS 2-stage HgcLevels model): encode to WS,
 *  input-affine (NO intermediate clamp), output-affine, pow(1/gamma), decode WS->code.
 *  Same math the RGB-master path uses; reused so per-channel Red/Green/Blue groups apply
 *  the IDENTICAL transfer to their own channel (verified: Red gamma=2 on R=160 -> 202.0
 *  vs FCP 202.4, matches the master model within quantisation). */
export function buildLevelsWSLUT(c: LevelsChannel): Uint8Array {
  const iv = 0.51117, gm = 1.0 / 0.51117;
  const rng = (c.whiteIn - c.blackIn) || 0.001;
  const invGamma = c.gamma !== 0 ? 1 / c.gamma : 1;
  const cl01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let x = Math.pow(i / 255, iv);
    x = (x - c.blackIn) / rng;
    x = x * (c.whiteOut - c.blackOut) + c.blackOut;
    x = x > 0 ? Math.pow(x, invGamma) : 0;
    lut[i] = Math.round(Math.pow(cl01(x), gm) * 255);
  }
  return lut;
}

/** Per-channel Levels: apply the RGB-master transfer to all channels, THEN the per-channel
 *  Red/Green/Blue transfer to its own channel (FCP composes master∘channel). Each of the
 *  four groups uses the decoded WS HgcLevels model. `mix` cross-fades the whole result with
 *  the original. This is the functionality FCP exposes via Histogram > {RGB,Red,Green,Blue}
 *  that the single-RGB path could not represent. */
export function levelsFilterPerChannel(
  input: ImageData,
  rgb: LevelsChannel, red: LevelsChannel, green: LevelsChannel, blue: LevelsChannel,
  mix: number,
): ImageData {
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);
  const perCh = [red, green, blue];
  const masterId = levelsChannelIsIdentity(rgb);
  const chId = perCh.map(levelsChannelIsIdentity);
  if (masterId && chId[0] && chId[1] && chId[2]) return input;
  const mLut = masterId ? null : buildLevelsWSLUT(rgb);
  const cLut = perCh.map((c, i) => (chId[i] ? null : buildLevelsWSLUT(c)));
  for (let i = 0; i < src.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      let v = src[i + ch];
      if (mLut) v = mLut[v];
      const cl = cLut[ch];
      if (cl) v = cl[v];
      out[i + ch] = mix >= 1 ? v : Math.round(src[i + ch] * (1 - mix) + v * mix);
    }
    out[i + 3] = src[i + 3];
  }
  return new ImageData(out, input.width, input.height);
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

  // DECODED HgcLevels — UNIFIED 2-stage model (fct/parity, 2026-07-22). Guarded by
  // FCT_LEVELS_WS=1. Extracted the verbatim HgcLevels fragment shader: it is TWO affine+gamma
  // stages. Wrapped in the gamma-1.958 working space (encode in / decode out), with RAW
  // endpoints, it fits ALL Levels legs vs REAL headless FCP: gamma-alone 0.17, input-remap 0.24,
  // output-remap 0.16 rms — AND the previously-diverging COMBINED case (in+gamma+out together)
  // drops from 12 rms to ~4 (residual is the clip-boundary shared clamp). The prior per-leg LUT
  // (gamma applied between the in- and out-remap, all in WS) matched each leg alone but mis-
  // composed them; the shader shows the true order:
  //   ws(in) -> stage1: affine [blackIn,whiteIn]->[0,1]  (NO gamma here)
  //          -> stage2: affine [0,1]->[blackOut,whiteOut], THEN pow(1/gamma)
  //          -> ws_inv -> code
  // (each stage clamps to [0,1]). Shipped GUI-GT path (code-space LUT below) byte-identical.
  const useWS = typeof process !== 'undefined' && process.env && process.env.FCT_LEVELS_WS === '1';
  if (useWS) {
    const iv = 0.51117, gm = 1.0 / 0.51117;   // gamma-1.958 working space
    const rng = range || 0.001;
    const cl01 = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x);
    const lutWS = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      let x = Math.pow(i / 255, iv);                        // encode to WS
      // stage 1: input remap [blackIn, whiteIn] -> [0, 1]. NO intermediate clamp: the
      // WS-wrapped HgcLevels composition lets an above-whiteIn value overshoot [0,1] and
      // flow through the output remap, so a bright pixel past whiteIn resolves ABOVE
      // whiteOut (near white) rather than being capped at whiteOut. DECODED 2026-07-23
      // from the FCP ramp at (BlackIn .1, WhiteIn .9, Gamma 1.5, BlackOut .05, WhiteOut .95):
      // in=229..255 -> 254.7 (NOT 242=whiteOut*255) and in=0 -> 0.0 (NOT blackOut-lifted).
      // Removing the stage-1 clamp fixes the combined case (16.7 -> 0.71 lvl) with ZERO
      // regression on the 3 VERIFIED legs (input/output/gamma alone, still 0.6-0.74 lvl).
      // Only the final WS->code decode clamps (and the pow domain guard x>0).
      x = (x - blackIn) / rng;
      // stage 2: output remap [0,1] -> [blackOut, whiteOut], then gamma pow(1/gamma)
      x = x * (whiteOut - blackOut) + blackOut;
      x = x > 0 ? Math.pow(x, invGamma) : 0;
      lutWS[i] = Math.round(Math.pow(cl01(x), gm) * 255);   // decode WS -> code (final clamp)
    }
    for (let i = 0; i < src.length; i += 4) {
      if (mix >= 1) {
        out[i] = lutWS[src[i]]; out[i + 1] = lutWS[src[i + 1]]; out[i + 2] = lutWS[src[i + 2]];
      } else {
        out[i] = Math.round(src[i] * (1 - mix) + lutWS[src[i]] * mix);
        out[i + 1] = Math.round(src[i + 1] * (1 - mix) + lutWS[src[i + 1]] * mix);
        out[i + 2] = Math.round(src[i + 2] * (1 - mix) + lutWS[src[i + 2]] * mix);
      }
      out[i + 3] = src[i + 3];
    }
    return new ImageData(out, width, height);
  }

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
 * PAEBrightness — per-channel MULTIPLY (sRGB) for GRAY; cross-channel on saturated colour.
 *
 * ⚠️ CORRECTED 2026-07-22 (fct/parity transfer oracle, UNIFORM-colour inputs — which are
 * conform-invariant, unlike the 2026-07-12 "gradient" probe below that was pipeline-coupled).
 * The clean isolated transfer refutes the old srgbEncode brighten model:
 *   • GRAY inputs, ALL amounts: out = clip(v · amount) EXACTLY (16·2→32, 64·2→128, 64·0.5→32).
 *     NOT srgbEncode(amount·v/255) (that predicts 64·2→188, measured 128). So the engine's
 *     plain per-channel sRGB multiply is CORRECT for gray at both legs.
 *   • SATURATED-colour inputs, amount>1 (brighten): FCP is CROSS-CHANNEL — when one channel
 *     clips, the OTHER channels are lifted far beyond v·amount. (200,50,50)·1.5 → FCP
 *     [255,154,151] (lows 50→~152), vs per-channel [255,75,75]; (50,200,50)·1.5 → [179,255,161].
 *     amount≤1 (darken) is exact per-channel (no coupling: (200,50,50)·0.5 → [100,25,25]).
 *   • Neither plain-linear nor plain-sRGB per-channel reproduces the brighten coupling ON ITS
 *     OWN — because the coupling is NOT in the operation. BINARY-DECODED 2026-07-22
 *     (disasm_pae.py PAEBrightness): PAEBrightness constructs an HGColorMatrix and sets 4 rows
 *     SetParameter(0,(amount,0,0,0)) (1,(0,amount,0,0)) (2,(0,0,amount,0)) (3,(0,0,0,1)) — a
 *     DIAGONAL matrix = PLAIN per-channel multiply out=amount·channel, EXACTLY what
 *     brightnessFilter does. So the cross-channel coupling on saturated colour is 100% the
 *     HGColorMatrix RENDER's working-space + clamp stage (ExtendedLinearSRGB half-float
 *     readback), NOT the op. The shipped per-channel multiply IS the correct matrix; closing
 *     the coupling needs the chain-level linear working-space/clamp (shared colour-subsystem
 *     fix), NOT a different Brightness formula. See fct/parity evidence.
 *
 * The shipped code keeps the plain per-channel sRGB multiply: it is EXACT for gray + the
 * darken leg, it is what the GUI GT prefers for the stacked Curtains chain (a per-filter
 * working-space encode regressed Curtains 14.31→13.85), and the brighten cross-channel coupling
 * needs the chain-level linear/working-space pipeline (encode once after all filters) — an
 * engine-architecture change tracked with the rest of the colour subsystem, NOT a per-filter fix.
 *
 * ── SUPERSEDED (kept for provenance) 2026-07-12 gradient probe ──
 * The earlier probe (a 0..255 GRADIENT through the coupled pipeline, oz_render.mm OZ_WS_DEBUG
 * reporting kCGColorSpaceLinearSRGB working space) fit `out=srgbEncode(amount·v/255)` for the
 * brighten leg — but that was a pipeline artifact of the non-uniform gradient input; the
 * conform-invariant uniform-input transfer above shows gray brighten is plain v·amount. Treat
 * the srgbEncode brighten model as REFUTED.
 * ── original note continues ──
 * The only shipping PAEBrightness user (Objects__Curtains, amount=2.91) STACKS Mono
 * (PAEChannelMixer) → Brightness → Colorize (FCP applies filters in REVERSE XML order —
 * decoded 2026-07-16, see parser/index.ts). Closing the brighten leg requires a linear-
 * working-space FILTER CHAIN (encode once after all filters), which is an
 * engine-architecture change tracked separately — NOT a per-filter encode.
 */
export function brightnessFilter(input: ImageData, amount: number): ImageData {
  if (amount === 1) return input;

  const width = input.width;
  const height = input.height;
  const src = input.data;
  const out = new Uint8ClampedArray(src.length);

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

// PAEBrightness — sRGB per-channel MULTIPLY (out = in * amount; identity at 1).
// Phase-2 verified against headless FCP (see brightnessFilter). Param default is 1
// (the plugin's declared default), NOT 0 — a multiply's identity is 1.
registerFilter({
  uuid: '2E4DBB0A-A950-4896-BC2D-A5B0CFF7FAC6',
  names: ['brightness'],
  label: 'Brightness',
  apply(input, ctx) {
    const amount = ctx.has('Brightness') ? ctx.param('Brightness', 1) : ctx.param('Amount', 1);
    return brightnessFilter(input, amount);
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
    const hist = ctx.filter.parameters.find(p => p.name === 'Histogram');
    // Resolve a value nested under Histogram > <group> > <name>, else flat.
    const grp = (group: string, name: string, def: number): number => {
      const g = hist?.children?.find(c => c.name === group);
      const c = g?.children?.find(cc => cc.name === name);
      if (c) {
        if (c.curve) return evaluateCurve(c.curve, t);
        if (typeof c.value === 'number') return c.value;
      }
      if (group === 'RGB') return ctx.param(name, def);  // flat fallback for the master
      return def;
    };
    const chan = (group: string): LevelsChannel => ({
      blackIn: grp(group, 'Black In', 0), whiteIn: grp(group, 'White In', 1),
      gamma: grp(group, 'Gamma', 1), blackOut: grp(group, 'Black Out', 0),
      whiteOut: grp(group, 'White Out', 1),
    });
    const mix = ctx.param('Mix', 1);
    // Per-channel path: FCP's Histogram exposes RGB (master) + Red/Green/Blue groups. If any
    // per-channel group is authored (and the WS decode is active), compose master∘channel via
    // the per-channel filter. DECODED (fct/parity): a per-channel group applies the IDENTICAL
    // WS HgcLevels transfer to its own channel only (Red gamma=2 on R=160 -> 202 vs FCP 202.4).
    const useWS = typeof process !== 'undefined' && process.env && process.env.FCT_LEVELS_WS === '1';
    const hasPerChannel = !!hist?.children?.some(c => c.name === 'Red' || c.name === 'Green' || c.name === 'Blue');
    if (useWS && hasPerChannel) {
      return levelsFilterPerChannel(input, chan('RGB'), chan('Red'), chan('Green'), chan('Blue'), mix);
    }
    return levelsFilter(input, {
      blackIn: grp('RGB', 'Black In', 0),
      whiteIn: grp('RGB', 'White In', 1),
      gamma: grp('RGB', 'Gamma', 1),
      blackOut: grp('RGB', 'Black Out', 0),
      whiteOut: grp('RGB', 'White Out', 1),
      mix,
    });
  },
});
