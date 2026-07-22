/**
 * Chain-level LINEAR working-space handoff for the colour-adjust filter family
 * (Colorize + HueSat + Tint + ChannelMixer + Brightness).
 *
 * ============================ FCP REVERSE-ENGINEERING ============================
 * FCP/Motion does NOT run each colour filter in its own sRGB→work→sRGB round-trip.
 * It builds the whole HG (HgcColorize / HgcSaturation / HgcTint / HGColorMatrix)
 * node graph INTO A SINGLE LINEAR WORKING SPACE and encodes to sRGB ONCE at readback.
 * Decoded symbols (arm64 slices, `strings`/otool on the shipped binaries):
 *
 *   Ozone.framework:
 *     SDRWorkingSpace / HDRWorkingSpace
 *     getPreferredWorkingSpaceForColorSpace:        // pick the working space
 *     getFloatFormatForWorkingSpace:                // float (half/f32) working buffer
 *     newHGNodeInFormat:withPT:workingSpace:        // HG node built IN a working space
 *     OZFxPlugRenderContextManager { _workingColorDescription (CGColorSpace)  _blendingGamma:f }
 *     OZSceneSettings { _workingGamut  _parameterDefaultGamma:f  _parameterDefaultColorSpaceID }
 *   ProAppsFxSupport.framework:
 *     blendingGamma / getBlendingGamma              // filters query the blending gamma
 *
 * The working space is `kCGColorSpaceExtendedLinearSRGB` at 16-bit half-float
 * (previously decoded in oz_render.mm — see linear.ts): sRGB→linear at graph entry,
 * every HG filter operates on the linear samples, linear→sRGB ONCE at readback. The
 * `_blendingGamma` float on the render context is the smoking gun that blends/filters
 * run in a gamma-decoded (linear) space, not per-filter sRGB.
 *
 * -------------------------------------------------------------------------------
 * WHY A HANDOFF (not a per-filter re-encode):
 * Shipping the linear branch PER-FILTER (each filter sRGB→linear→sRGB on its own)
 * REGRESSED the GUI-GT gate on real Colorize transitions (Curtains −0.42,
 * Stylized__Slide −0.76, Up-Over −0.52; documented in channel-mixer.ts:315-322 and
 * levels.ts). The double sRGB↔linear round-trip + 8-bit requantisation between
 * filters diverges from FCP's ONE readback. The fix is to keep the EXACT linear
 * Float32 result flowing from one colour filter to the next so the chain is
 * effectively continuous-linear — matching FCP's single-readback graph — while each
 * filter still returns a valid sRGB `ImageData` (so the compositor loop's blitDirect
 * is untouched and no compositor/index.ts change is needed).
 *
 * MECHANISM (structural, keys on the CHAIN not on any transition):
 *   - A WeakMap associates an output `ImageData` with the EXACT linear Float32 buffer
 *     that produced it (RGBA, [0,1], alpha = coverage, NOT gamma-transformed).
 *   - A colour-adjust filter checks `chainLinearInput(input)`:
 *       • non-null  ⇒ a PRIOR colour-adjust filter seeded the chain (≥2 filters ⇒ this
 *         is a FOLLOWER). Use that exact linear buffer as the linear input (skip the
 *         sRGB re-decode), run the filter's math in linear, encode ONCE to the returned
 *         sRGB ImageData, and publish the new linear buffer for the next follower.
 *       • null ⇒ this filter is a potential SEED. It emits its LEGACY (flag-off) sRGB
 *         output verbatim (so a LONE colour filter stays byte-identical — this is what
 *         protects Slide/Up-Over/Light_Sweep/Lower/Center, all single-colour-filter
 *         layers) but ALSO publishes its linear-space computation, so IF a follower
 *         runs next it reads the correct linear result.
 *   - Any non-colour filter (e.g. PAELevels) simply never calls into this module, so it
 *     breaks the chain: its output ImageData is not in the map, and the next colour
 *     filter re-seeds from sRGB. Correct — Levels has no linear branch to hand off.
 *
 * NET: lone colour filter = byte-identical (gate-neutral). ≥2 stacked colour filters =
 * continuous linear working buffer, encode once — the FCP model. Gated on
 * isLinearCompositeEnabled() at every call site.
 * ============================================================================
 */

import { LUT_SRGB_TO_LINEAR, linearChannelToSrgb, LUT_SRGB_TO_WORKING, workingChannelToSrgb } from '../linear.js';

/**
 * Maps a filter's OUTPUT ImageData -> the EXACT linear-light RGBA Float32 buffer
 * ([0,1] per channel, alpha as straight coverage in [0,1]) that produced it. A
 * WeakMap so buffers GC with their ImageData; no manual lifecycle. Keyed on object
 * identity, which is stable because the compositor threads the same ImageData
 * object from one filter's output into the next filter's input.
 */
const linearByImage = new WeakMap<ImageData, Float32Array>();

/** True when `input` was emitted by a prior colour-adjust filter in this chain
 * (its exact linear buffer is cached) — i.e. we are MID-chain, not at chain entry. */
export function hasLinearInput(input: ImageData): boolean {
  return linearByImage.has(input);
}

/**
 * WORKING-SPACE SELECTOR (fct/parity 2026-07-22). The chain's "linear" buffer can use
 * EITHER the legacy scene-linear sRGB EOTF (shipped default) OR the DECODED Rec.709
 * gamma-1.961 working space (FCT_WS_GAMMA=1). The gamma-1.961 space is what FCP's colour
 * ops actually use (confirmed from ProCore PCEstimateGamma(ITUR_709)=1.961 + the 6 VERIFIED
 * transfer decodes). The scene-linear seed was decoding colours too dark, which is why
 * shipping the chain regressed the GUI gate — this flag lets us A/B that hypothesis and,
 * if it wins, becomes the shared colour-chain fix. Default OFF = byte-identical.
 */
function _useWorkingGamma(): boolean {
  return typeof process !== 'undefined' && !!process.env && process.env.FCT_WS_GAMMA === '1';
}

/**
 * Get the linear-light RGBA buffer to start this filter's work from. If `input` is
 * a cached prior colour-adjust output, returns a COPY of its EXACT linear buffer (no
 * sRGB round-trip — the whole point). Otherwise (chain entry) decodes `input`'s sRGB
 * via LUT_SRGB_TO_LINEAR. Alpha stays linear (coverage). The result is safe to mutate.
 */
export function getLinearInput(input: ImageData): Float32Array {
  const cached = linearByImage.get(input);
  if (cached) return cached.slice();
  const src = input.data;
  const n = src.length;
  const lin = new Float32Array(n);
  const lut = _useWorkingGamma() ? LUT_SRGB_TO_WORKING : LUT_SRGB_TO_LINEAR;
  for (let i = 0; i < n; i += 4) {
    lin[i]     = lut[src[i]];
    lin[i + 1] = lut[src[i + 1]];
    lin[i + 2] = lut[src[i + 2]];
    lin[i + 3] = src[i + 3] / 255; // coverage stays linear
  }
  return lin;
}

/** Associate an output ImageData with the exact linear buffer that produced it, so
 * the next colour-adjust filter can resume from it losslessly. */
export function publishLinear(output: ImageData, lin: Float32Array): void {
  linearByImage.set(output, lin);
}

/** Encode a linear Float32 RGBA buffer to an sRGB ImageData (chain exit / emit).
 * Alpha (coverage) is written straight back from [0,1]. */
export function encodeLinearBuf(lin: Float32Array, width: number, height: number): ImageData {
  const n = lin.length;
  const out = new Uint8ClampedArray(n);
  const enc = _useWorkingGamma() ? workingChannelToSrgb : linearChannelToSrgb;
  for (let i = 0; i < n; i += 4) {
    out[i]     = enc(lin[i]);
    out[i + 1] = enc(lin[i + 1]);
    out[i + 2] = enc(lin[i + 2]);
    const a = lin[i + 3];
    out[i + 3] = a <= 0 ? 0 : a >= 1 ? 255 : Math.round(a * 255);
  }
  return new ImageData(out, width, height);
}

// ---------------------------------------------------------------------------
// In-place linear-space colour-adjust ops. Each mutates a linear RGBA Float32
// buffer ([0,1]) — the shared working buffer — matching the FCP HG node graph
// running in the ExtendedLinearSRGB working space (decode above). These are the
// linear analogues of the sRGB math in colorizeRemapFilter / hueSaturationFilter.
// ---------------------------------------------------------------------------

const REC709 = [0.2126, 0.7152, 0.0722] as const;

/**
 * Colorize (HgcColorize) in linear light. Luminance remap black→white by the
 * Rec.709 luma of the LINEAR input, blended by k = intensity*mix. Endpoints are
 * the sRGB-authored "Remap Black/White To" colours DECODED to linear (s2l), which
 * is the correction the isolated probe wanted (channel-mixer.ts:303-312) but that
 * regressed the gate PER-FILTER because of the double sRGB round-trip — here it
 * runs on the shared linear buffer with no intermediate re-encode.
 */
export function colorizeLinearInPlace(
  buf: Float32Array,
  blackLin: { r: number; g: number; b: number },
  whiteLin: { r: number; g: number; b: number },
  k: number,
): void {
  const dR = whiteLin.r - blackLin.r, dG = whiteLin.g - blackLin.g, dB = whiteLin.b - blackLin.b;
  for (let i = 0; i < buf.length; i += 4) {
    const lum = REC709[0] * buf[i] + REC709[1] * buf[i + 1] + REC709[2] * buf[i + 2];
    const rR = blackLin.r + lum * dR;
    const rG = blackLin.g + lum * dG;
    const rB = blackLin.b + lum * dB;
    buf[i] = buf[i] * (1 - k) + rR * k;
    buf[i + 1] = buf[i + 1] * (1 - k) + rG * k;
    buf[i + 2] = buf[i + 2] * (1 - k) + rB * k;
  }
}

/**
 * HSV Adjust (HgcHSVAdjust/HgcSaturation) in linear light. Hue rotation (turns),
 * Saturation as a lerp toward the Rec.709 luma of the LINEAR RGB, Value as a
 * squared multiply on linear light. Same math as hueSaturationFilter's linear
 * branch, but operating on the shared working buffer (no per-filter decode/encode).
 */
export function hsvLinearInPlace(
  buf: Float32Array,
  hueTurns: number,
  saturation: number,
  value: number,
): void {
  // DECODED (this task): PAEHSVAdjust Saturation only DESATURATES in the built-in
  // param space — it never over-boosts. The shader's saturation term is
  // clamp((chroma/V)*mult, 0, 1); the UI "Saturation" maps so that the effective
  // RGB-lerp factor is clamp(1+Saturation, 0, 1). Evidence: Leaves/Center/Lower
  // store Saturation=-1 (→ satFactor 0 = grayscale ✓), the isolated probe verified
  // Saturation=-0.5 → satFactor 0.5 (halfway to gray, [118,94,78] ✓), and
  // Color_Panels stores Saturation=1 whose GUI GT red panel = the Colorize output
  // UNCHANGED (satFactor 1 = identity — a 0-centered 1+S=2 would double-saturate and
  // crush G/B to 0, which the GT does NOT show: GT (94,37,26) vs 1+S=2 → (125,0,0)).
  // So the boost half of 0-centered is spurious; cap the factor at identity.
  const satFactor = Math.min(1, 1 + saturation);
  const valMul = value * value;
  const doHue = hueTurns !== 0;
  for (let i = 0; i < buf.length; i += 4) {
    let r = buf[i], g = buf[i + 1], b = buf[i + 2];
    if (doHue) {
      const [h, s, v] = rgbToHsvLocal(r, g, b);
      const hh = (h + hueTurns) % 1;
      [r, g, b] = hsvToRgbLocal(hh, s, v);
    }
    if (satFactor !== 1) {
      const gray = REC709[0] * r + REC709[1] * g + REC709[2] * b;
      r = gray + (r - gray) * satFactor;
      g = gray + (g - gray) * satFactor;
      b = gray + (b - gray) * satFactor;
    }
    if (value !== 1) { r *= valMul; g *= valMul; b *= valMul; }
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b;
  }
}

/**
 * Tint (HgcTint) in linear light: luma·tintColor lerp by intensity then mix,
 * on the shared linear buffer. Endpoints (tint colour) are sRGB-authored →
 * decoded to linear by the caller. Rec.601 luma (matches tintFilter's linear leg).
 */
export function tintLinearInPlace(
  buf: Float32Array,
  tintLin: { r: number; g: number; b: number },
  intensity: number,
  mix: number,
): void {
  for (let i = 0; i < buf.length; i += 4) {
    const sr = buf[i], sg = buf[i + 1], sb = buf[i + 2];
    const lum = 0.299 * sr + 0.587 * sg + 0.114 * sb;
    const tR = lum * tintLin.r, tG = lum * tintLin.g, tB = lum * tintLin.b;
    let iR = sr * (1 - intensity) + tR * intensity;
    let iG = sg * (1 - intensity) + tG * intensity;
    let iB = sb * (1 - intensity) + tB * intensity;
    if (mix < 1) {
      iR = sr * (1 - mix) + iR * mix;
      iG = sg * (1 - mix) + iG * mix;
      iB = sb * (1 - mix) + iB * mix;
    }
    buf[i] = iR; buf[i + 1] = iG; buf[i + 2] = iB;
  }
}

// Local RGB<->HSV (max/min reconstruction; matches hue-saturation.ts). Kept local
// so this module has no import cycle with the filter files that call it.
function rgbToHsvLocal(r: number, g: number, b: number): [number, number, number] {
  // Byte-for-byte the same reconstruction as hue-saturation.ts's rgbToHsv, so the
  // linear HSV path matches the sRGB one exactly (both are gate-neutral on the
  // shipping Hue=0 users; keep them identical for the general case).
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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
function hsvToRgbLocal(h: number, s: number, v: number): [number, number, number] {
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
    default: return [v, p, q];
  }
}
