/**
 * FLOAT WORKING-SPACE FILTER PIPELINE (architectural, 2026-07-23)
 * ═══════════════════════════════════════════════════════════════════════════════
 * WHY THIS EXISTS — the over-1.0 clamp family.
 *
 * FCP runs a layer's whole filter chain in a FLOAT working space (Rec.709 gamma≈1.961,
 * ExtendedLinearSRGB-style — values may exceed 1.0 and go below 0), and only quantises to
 * 8-bit sRGB at the very END of the chain. The engine historically ran EACH filter in
 * 8-bit code space, clamping to [0,255] BETWEEN every filter. That inter-filter clamp is
 * the single root cause behind the whole "over-1.0 HGColorMatrix clamp" DIVERGED family
 * (Brightness / HSV / Contrast / ChannelMixer_clip): when Brightness pushes a channel past
 * 1.0, the 8-bit store clamps it to 255, so a following op (or the final gamut map) can no
 * longer recover the headroom the way FCP's float buffer does.
 *
 * THE FIX. A `FloatImage` is an UNCLAMPED Float32 RGBA buffer in the gamma-1.961 working
 * space (rgb may be <0 or >1; alpha in [0,1] coverage). A filter that is a pure pointwise /
 * tone op implements `applyWorking(fimg, ctx) -> FloatImage`, operating in this space WITHOUT
 * clamping. The compositor detects a contiguous RUN of working-space-capable filters, decodes
 * sRGB→working ONCE, chains them on a shared unclamped float buffer, and encodes working→sRGB
 * ONCE at the end of the run (that terminal encode is the ONLY clamp, matching FCP's single
 * end-of-chain quantise). Filters without `applyWorking` break the run: the buffer is encoded
 * to 8-bit, the legacy `apply(ImageData)` runs, and a fresh run may start after.
 *
 * IMPORTANT — the working space here is the DECODED Rec.709 gamma-1.961 space (see
 * compositor/linear.ts WORKING_GAMMA), the SAME space fct/parity proved the colour transfers
 * live in. `decodeToWorking` uses an UNCLAMPED power law so a value can round-trip exactly and
 * a filter can push it out of [0,1] and back. This is display-referred working gamma, NOT the
 * scene-linear sRGB EOTF (that space regressed the GUI gate — see linear.ts).
 *
 * GATE SAFETY. The whole pipeline is behind `isWorkingSpacePipelineEnabled()` (env
 * FCT_WORKING_SPACE_PIPELINE). Default OFF so the shipped 8-bit-per-filter behaviour is byte
 * unchanged until each migrated filter is GUI-gate-verified. Filters opt in incrementally by
 * adding `applyWorking`; a filter with no `applyWorking` is unaffected either way.
 */
import { WORKING_GAMMA } from './linear.js';
import type { FilterContext } from './filters/registry.js';

// ⚠️ GAMMA CONVENTION. The DECODED colour working space (fct/parity, VERIFIED for
// Tint/Colorize/Levels/Contrast/HSV in-gamut) decodes sRGB→working with the exponent
// iv = 0.51117 (= 1/1.9563): ws = (code/255)^0.51117 (this BRIGHTENS: 0.5^0.51≈0.70), and
// encodes working→sRGB with gm = 1/iv ≈ 1.9563. This is the SAME "gamma 1.961" working space
// (linear.ts WORKING_GAMMA nominal), but linear.ts's srgbChannelToWorking used the exponent the
// OTHER way (^1.961 for decode) — a display-vs-scene sign that is fine for its round-trip but is
// the INVERSE of the exponent the colour transfers operate in. This pipeline MUST match the
// colour-transfer convention (iv for decode) so a filter's working-space math (contrast about 0.5,
// HSV luma mix, etc.) sees the value it was decoded against. Verified: gray 128 @ Contrast 0.5 →
// 94.3 with iv=0.51117 (oracle 94.35); ^1.961 gives 155 (wrong).
const WS_IV = 0.51117;          // sRGB→working decode exponent (fct/parity, = 1/1.9563)
const WS_GM = 1 / WS_IV;        // working→sRGB encode exponent ≈ 1.9563
void WORKING_GAMMA;             // nominal 1.961; the operational exponent is WS_IV (see note)

let _wsPipelineEnabled = true;
export function isWorkingSpacePipelineEnabled(): boolean { return _wsPipelineEnabled; }
export function setWorkingSpacePipelineEnabled(on: boolean): void { _wsPipelineEnabled = on; }

/**
 * An UNCLAMPED float RGBA image in the Rec.709 working space (decode exponent iv=0.51117).
 * `data` is length w*h*4, interleaved. rgb channels are working-space values that MAY be
 * <0 or >1 (that OOB headroom is the entire point); alpha is coverage in [0,1].
 */
export interface FloatImage {
  data: Float32Array;
  width: number;
  height: number;
}

/** sRGB code (0..255, may be fractional) → working-space value. UNCLAMPED for round-trip. */
export function srgbToWorkingUnclamped(v: number): number {
  const s = v / 255;
  return s <= 0 ? 0 : Math.pow(s, WS_IV);
}

/** working-space value → sRGB code (0..255), UNCLAMPED (may exceed 255 or go <0). The
 *  terminal encode to Uint8ClampedArray does the final [0,255] clamp (FCP's end quantise). */
export function workingToSrgbUnclamped(x: number): number {
  return x <= 0 ? 0 : Math.pow(x, WS_GM) * 255;
}

const WS_DECODE_LUT: Float32Array = (() => {
  const t = new Float32Array(256);
  for (let i = 0; i < 256; i++) t[i] = srgbToWorkingUnclamped(i);
  return t;
})();

/** Decode an sRGB ImageData to an UNCLAMPED working-space FloatImage. */
export function decodeToWorking(img: ImageData): FloatImage {
  const src = img.data;
  const n = src.length;
  const data = new Float32Array(n);
  for (let i = 0; i < n; i += 4) {
    data[i]     = WS_DECODE_LUT[src[i]];
    data[i + 1] = WS_DECODE_LUT[src[i + 1]];
    data[i + 2] = WS_DECODE_LUT[src[i + 2]];
    data[i + 3] = src[i + 3] / 255;
  }
  return { data, width: img.width, height: img.height };
}

/** Encode an UNCLAMPED working-space FloatImage back to sRGB ImageData (terminal clamp). */
export function encodeFromWorking(fimg: FloatImage): ImageData {
  const { data, width, height } = fimg;
  const n = data.length;
  const out = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i += 4) {
    out[i]     = Math.round(workingToSrgbUnclamped(data[i]));
    out[i + 1] = Math.round(workingToSrgbUnclamped(data[i + 1]));
    out[i + 2] = Math.round(workingToSrgbUnclamped(data[i + 2]));
    const a = data[i + 3];
    out[i + 3] = a <= 0 ? 0 : a >= 1 ? 255 : Math.round(a * 255);
  }
  return new ImageData(out, width, height);
}

/** A filter's optional float working-space entry point. Operates on an UNCLAMPED FloatImage
 *  and returns one (may be the same buffer mutated, or a new one). No inter-filter clamp. */
export type ApplyWorking = (fimg: FloatImage, ctx: FilterContext) => FloatImage;
