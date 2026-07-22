/**
 * Linear working-space compositing infrastructure (ROADMAP T-D1 / S2).
 *
 * FCP's Motion engine runs the ENTIRE filter+blend+composite chain in a linear
 * working color space and encodes to sRGB ONCE at readback. Decoded 2026-07-12
 * from oz_render.mm (OZ_WS_DEBUG instrumentation of
 * `OZRenderParams_getWorkingColorSpace()` + the readback CGColorSpace):
 *
 *   workingColorSpace = kCGColorSpaceExtendedLinearSRGB  (16-bit half-float)
 *   readback (bpp=8) = ExtendedLinearSRGB → sRGB encode
 *   readback (bpp=4) = plain sRGB (no linear intermediate)
 *
 * (See oz_render.mm ~line 338 for the workingColorSpace probe and ~line 515 for
 * the readback color space; the linear leg is used whenever bpp==8.)
 *
 * The TS engine currently composites in gamma/sRGB space, so any operation that
 * MUST be linear to match FCP — semi-transparent overlays, additive / screen
 * blends, Brightness>1, glow/bloom accumulation, colour-remap filters — lands
 * warm/dim or over-exposed vs GUI GT. Documented cases: Lower f12 GUI≈239,245
 * vs engine≈137,99; Bloom / 360° Bloom over-additive; Panels_Across dim panel
 * blend; Brightness=2.91 (Curtains) + Colorize=1 users; Tint/Veil.
 *
 * This module is the ENGINE-LEVEL infrastructure the follow-on T-D2a/b/c/d
 * tasks will consume — each migrates one filter family (Brightness/Colorize,
 * Tint, Glow/Bloom, HSV) into the linear chain, gate-green per commit. See the
 * ROADMAP S2/S4 items.
 *
 * DESIGN:
 *   - sRGB→linear + linear→sRGB per IEC 61966-2-1 piecewise transfer, same as
 *     CoreGraphics' kCGColorSpaceExtendedLinearSRGB decode.
 *   - 8-bit sRGB in → Float32 linear intermediate (per-channel [0,1], alpha
 *     also 0..1 as coverage). Round-trip is EXACT for the 256 encoded values.
 *   - `LINEAR_COMPOSITE_ENABLED` gates any behavior change. Defaults OFF so
 *     the compositor is byte-identical to today (T-D1's gate contract).
 *   - Alpha stays LINEAR (coverage is a fraction, not a photon count) — only
 *     the RGB channels traverse the sRGB transfer. This matches Motion's
 *     Extended-Linear-sRGB semantics (linear light + straight coverage).
 *
 * Nothing in this file changes rendered pixels on its own; it's the toolkit
 * T-D2 callers reach for. See linear.test.ts for round-trip + composite tests.
 */

/**
 * Master flag for the linear working-space composite path.
 *
 * **Defaults to `false`** (T-D1's safety contract): with the flag off, the
 * compositor is BYTE-IDENTICAL to today, so the gate stays green. T-D2a-d
 * flip individual filter families to consume the linear helpers below when
 * the flag is on, gate-verifying each migration.
 *
 * This is a compile-time-ish constant (a `const let` re-exported so tests can
 * toggle it via `setLinearCompositeEnabled` under a `try/finally`). Callers
 * MUST read the accessor `isLinearCompositeEnabled()` — importing the value
 * directly captures the initial `false` and never sees flips.
 */
let _linearCompositeEnabled = false;

/** Read the current linear-composite flag. See `_linearCompositeEnabled`. */
export function isLinearCompositeEnabled(): boolean {
  return _linearCompositeEnabled;
}

/** Toggle the flag. Intended for tests + the T-D2a-d migrations (with the flag
 * still shipping OFF until every family has landed and re-baselined). */
export function setLinearCompositeEnabled(enabled: boolean): void {
  _linearCompositeEnabled = enabled;
}

// ---------------------------------------------------------------------------
// sRGB ↔ linear transfer (IEC 61966-2-1, matches CoreGraphics decode).
// ---------------------------------------------------------------------------

/**
 * Convert one sRGB channel value (u8, 0..255) to linear light in [0,1].
 * Piecewise IEC 61966-2-1:  v = (V/255) then
 *   linear = v/12.92               for v ≤ 0.04045   (encoded ≤ 10)
 *   linear = ((v+0.055)/1.055)^2.4  otherwise
 * The 0.04045 boundary is exactly V==10.31... on the [0,255] axis; we build a
 * 256-entry LUT rather than run the branch per pixel (hot path).
 */
export function srgbChannelToLinear(v: number): number {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Convert one linear-light channel value in [0,1] to an sRGB u8 (0..255).
 * Inverse piecewise transfer:
 *   sRGB = 12.92 · linear                            for linear ≤ 0.0031308
 *   sRGB = 1.055 · linear^(1/2.4) − 0.055             otherwise
 * Values outside [0,1] are clamped to [0,1] (matches the readback clamp — the
 * ExtendedLinearSRGB float buffer allows OOB values, but 8-bit sRGB does not).
 */
export function linearChannelToSrgb(x: number): number {
  const v = x <= 0 ? 0 : x >= 1 ? 1 : x;
  const s = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

// ---------------------------------------------------------------------------
// Rec.709 WORKING SPACE transfer (gamma 1.961) — the DECODED colour working space.
// ---------------------------------------------------------------------------
/**
 * FCP's per-pixel colour ops (Tint/HSV/Colorize/Levels/ChannelMixer) run in the
 * Rec.709 WORKING SPACE, NOT scene-linear ExtendedLinearSRGB. CONFIRMED 2026-07-22
 * from FCP's OWN ProCore via dlsym (fct/parity):
 *   PCEstimateGamma(ITUR_709)                    = 1.961   (sRGB=2.2, linearSRGB=1.0)
 *   PCGetGamutColorSpaceLuminanceCoefficients(0) = Rec.709 (0.212639,0.715169,0.072192)
 * and independently by fitting isolated FCP transfer sweeps for 6 colour nodes
 * (Tint 0.26 rms, HSV/Colorize/Levels-remap all < 1 level) — see fct/parity/JOURNEY.md.
 *
 * This is a pure power-law gamma-1.961 (display-referred), distinct from the sRGB EOTF
 * (~2.4 with a linear toe) used by `srgbChannelToLinear` above. The earlier scene-linear
 * chain regressed the GUI gate precisely because it decoded colours into the too-dark
 * scene-linear space instead of this Rec.709 working gamma.
 *
 * WORKING_GAMMA is FCP's nominal 1.961; the effective power measured over the 0–255 code
 * range fits ~1.956 (the small difference is the Rec.709 OETF's linear toe), but the
 * authoritative nominal value is used here.
 */
export const WORKING_GAMMA = 1.961;
const _INV_WORKING_GAMMA = 1 / WORKING_GAMMA;

/** sRGB u8 (0..255) → Rec.709 gamma-1.961 working-space value in [0,1]. */
export function srgbChannelToWorking(v: number): number {
  const s = v <= 0 ? 0 : v >= 255 ? 1 : v / 255;
  return Math.pow(s, WORKING_GAMMA);
}

/** Rec.709 gamma-1.961 working-space value in [0,1] → sRGB u8 (0..255). */
export function workingChannelToSrgb(x: number): number {
  const v = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return Math.round(Math.pow(v, _INV_WORKING_GAMMA) * 255);
}

/** 256-entry LUT of the sRGB→Rec.709-working decode (indexed by sRGB u8). */
export const LUT_SRGB_TO_WORKING: Float32Array = (() => {
  const t = new Float32Array(256);
  for (let i = 0; i < 256; i++) t[i] = srgbChannelToWorking(i);
  return t;
})();

/**
 * 256-entry LUT of the sRGB→linear decode. Indexed by an sRGB u8 pixel value.
 * Frozen at module load: sRGB→linear→sRGB round-trips to the exact same u8
 * (verified in linear.test.ts), so this LUT can be used as a drop-in decode.
 */
export const LUT_SRGB_TO_LINEAR: Float32Array = (() => {
  const t = new Float32Array(256);
  for (let i = 0; i < 256; i++) t[i] = srgbChannelToLinear(i);
  return t;
})();

// ---------------------------------------------------------------------------
// Buffer conversions.
// ---------------------------------------------------------------------------

/**
 * Decode an sRGB `ImageData` to a linear-light float buffer, layout RGBA
 * interleaved in [0,1]. Alpha is NOT gamma-transformed — it's coverage.
 *
 * The returned Float32Array is length `img.width * img.height * 4`; use with
 * `encodeLinearToImage` (or a size-matched linear composite helper). This is
 * the entry point for a linear render pass: decode source A / source B ONCE,
 * work in linear, encode once at output.
 */
export function decodeImageToLinear(img: ImageData): Float32Array {
  const src = img.data;
  const n = src.length;
  const out = new Float32Array(n);
  const lut = LUT_SRGB_TO_LINEAR;
  for (let i = 0; i < n; i += 4) {
    out[i]     = lut[src[i]];
    out[i + 1] = lut[src[i + 1]];
    out[i + 2] = lut[src[i + 2]];
    out[i + 3] = src[i + 3] / 255; // coverage stays linear
  }
  return out;
}

/**
 * Encode a linear-light float buffer back to an sRGB `ImageData`. Inverse of
 * `decodeImageToLinear`; performs the sRGB gamma encode on RGB and clamps
 * alpha to [0,1] * 255.
 */
export function encodeLinearToImage(linear: Float32Array, width: number, height: number): ImageData {
  const n = linear.length;
  if (n !== width * height * 4) {
    throw new Error(`encodeLinearToImage: buffer length ${n} !== ${width * height * 4} (${width}x${height} RGBA)`);
  }
  const out = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i += 4) {
    out[i]     = linearChannelToSrgb(linear[i]);
    out[i + 1] = linearChannelToSrgb(linear[i + 1]);
    out[i + 2] = linearChannelToSrgb(linear[i + 2]);
    const a = linear[i + 3];
    out[i + 3] = a <= 0 ? 0 : a >= 1 ? 255 : Math.round(a * 255);
  }
  return new ImageData(out, width, height);
}

// ---------------------------------------------------------------------------
// Source-over composite in linear space.
// ---------------------------------------------------------------------------

/**
 * Composite one sRGB `overlay` ImageData onto one sRGB `base` ImageData with
 * a scalar opacity, RUNNING THE BLEND IN LINEAR LIGHT. Both inputs must be
 * the same dimensions (this is the terminal "burn a filter's output onto the
 * scene" op — for a transformed blit, decode+encode + `linearOverlayFloat`
 * separately).
 *
 * Math: RGB in linear space, straight source-over on premultiplied coverage:
 *   outA = sa + db * (1 − sa)                     (coverage stays linear)
 *   outC = (sc * sa + dc * db * (1 − sa)) / outA  (linear light)
 * Then encode outC back to sRGB. This differs from `blitDirect`'s gamma-space
 * blend anywhere sa is between 0 and 1 — that's the whole point of T-D1 / S2.
 *
 * ⚠️ NOT a drop-in replacement for `blitDirect` today. A caller must be a
 * migration site that FCP proves runs in linear (a filter that stacks with
 * another filter in the linear working space, per the levels.ts / brightness
 * decode). Gated on `isLinearCompositeEnabled()` at the call site so the
 * flag-off gate stays byte-identical.
 */
export function linearOverlay(base: ImageData, overlay: ImageData, opacity: number): ImageData {
  if (base.width !== overlay.width || base.height !== overlay.height) {
    throw new Error(`linearOverlay: dim mismatch ${base.width}x${base.height} vs ${overlay.width}x${overlay.height}`);
  }
  if (opacity <= 0) return base;
  const w = base.width, h = base.height;
  const bd = base.data;
  const od = overlay.data;
  const n = bd.length;
  const out = new Uint8ClampedArray(n);
  const lut = LUT_SRGB_TO_LINEAR;
  for (let i = 0; i < n; i += 4) {
    const sa = (od[i + 3] / 255) * opacity;
    const db = bd[i + 3] / 255;
    if (sa <= 0) {
      out[i]     = bd[i];
      out[i + 1] = bd[i + 1];
      out[i + 2] = bd[i + 2];
      out[i + 3] = bd[i + 3];
      continue;
    }
    const outA = sa + db * (1 - sa);
    if (outA <= 0) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
      continue;
    }
    const bR = db > 0 ? lut[bd[i]]     : 0;
    const bG = db > 0 ? lut[bd[i + 1]] : 0;
    const bB = db > 0 ? lut[bd[i + 2]] : 0;
    const sR = lut[od[i]];
    const sG = lut[od[i + 1]];
    const sB = lut[od[i + 2]];
    // Linear-light source-over on premultiplied coverage.
    const oR = (sR * sa + bR * db * (1 - sa)) / outA;
    const oG = (sG * sa + bG * db * (1 - sa)) / outA;
    const oB = (sB * sa + bB * db * (1 - sa)) / outA;
    out[i]     = linearChannelToSrgb(oR);
    out[i + 1] = linearChannelToSrgb(oG);
    out[i + 2] = linearChannelToSrgb(oB);
    out[i + 3] = Math.round(outA * 255);
  }
  return new ImageData(out, w, h);
}

/**
 * Same source-over composite as `linearOverlay`, but operating directly on a
 * pair of Float32 linear buffers (RGBA, [0,1]). No sRGB↔linear conversion —
 * both inputs are already linear.
 *
 * Intended for the multi-op case: decode ONCE, do N linear composites/filters
 * back-to-back on the float buffer, encode ONCE. The follow-on T-D2 filters
 * will stack this way (Brightness → Mono, Bloom's blur→add→clip, Colorize's
 * remap→multiply). Mutates `base` in place and returns it.
 */
export function linearOverlayFloat(base: Float32Array, overlay: Float32Array, opacity: number): Float32Array {
  if (base.length !== overlay.length) {
    throw new Error(`linearOverlayFloat: length mismatch ${base.length} vs ${overlay.length}`);
  }
  if (opacity <= 0) return base;
  const n = base.length;
  for (let i = 0; i < n; i += 4) {
    const sa = overlay[i + 3] * opacity;
    const db = base[i + 3];
    if (sa <= 0) continue;
    const outA = sa + db * (1 - sa);
    if (outA <= 0) { base[i] = 0; base[i + 1] = 0; base[i + 2] = 0; base[i + 3] = 0; continue; }
    base[i]     = (overlay[i]     * sa + base[i]     * db * (1 - sa)) / outA;
    base[i + 1] = (overlay[i + 1] * sa + base[i + 1] * db * (1 - sa)) / outA;
    base[i + 2] = (overlay[i + 2] * sa + base[i + 2] * db * (1 - sa)) / outA;
    base[i + 3] = outA;
  }
  return base;
}
