// Faithful transcription @0x000000000054bf (metallib entry offset)
// @shader noise (MAPlugInGUISwift)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/noise.ll, extracted from
// EDEL.framework/Versions/A/Frameworks/MAPlugInGUISwift.framework/Versions/A/Resources/
// default.metallib. The .ll header line reads `0x000000000054bf -- noise:`. Compile
// options: `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. The `@noise` function attribute set carries
// `readnone`, `unsafe-fp-math=true`, `no-infs-fp-math=true`, `no-nans-fp-math=true`,
// `no-signed-zeros-fp-math=true`, `approx-func-fp-math=true`. Per SHADERS.md the
// fast-math flags do NOT license algebraic re-association here — every op is a direct
// TS mapping and every fp32 scalar op is fp32-narrowed via `Math.fround`.
//
// This is a "stitchable" (i.e. Metal Function-Stitching) helper — it is declared
// `!air.visible` (NOT `!air.fragment` / `!air.compute`), so it is NEVER a top-level
// pipeline entry. FCP composes it into a Motion effect's fragment pipeline at runtime
// via `MTLFunctionStitching`. The module's `@llvm.compiler.used` array pins eight
// `_stitching_traits_impl` shims (load_argument / copy_from_buffer / store_return_value
// / destroy for both `<2 x float>` and `<4 x half>`) — those are Metal-runtime linkage
// helpers, not shader math. Only the `@noise` body is transcribed here.
//
// Function signature (from `!15..!20`):
//   position     : float2  air.visible_input   — 2-D UV position.
//   currentColor : half4   air.visible_input   — the accumulator half4 the stitched
//                                                 pipeline is currently carrying (RGBA
//                                                 as 4 IEEE-754 halfs).
//   output       : half4   air.visible_output.
//
// The IR body is the classic GLSL one-line hash noise, half-precision:
//
//   %3  = air.dot.v2f32(%0, <1.9898, 78.233>)             ; float
//   %4  = air.fast_sin.f32(%3)                            ; float
//   %5  = fmul fast float %4, 43758.5453                  ; float
//   %6  = air.fast_fract.f32(%5)                          ; float in [0,1)
//   %7  = fptrunc float %6 to half                        ; half
//   %8  = <poison, poison, poison, 1.0h>  insert %7 @ 0   ; splat.r
//   %9  = insert %7 @ 1                                    ; splat.g
//   %10 = insert %7 @ 2                                    ; splat.b (splat.a stays 1.0h)
//   %11 = shufflevector %1, undef, <3,3,3,3>               ; currentColor.aaaa
//   %12 = fmul fast <4xhalf> %10, %11                      ; (n*a, n*a, n*a, 1.0*a)
//   ret %12
//
// So `noise(position, currentColor)`  = (h, h, h, currentColor.a)   where
//   h = half(fract(sin(dot(position, (1.9898, 78.233))) * 43758.5453)) * currentColor.a
// and the fourth lane is `1.0h * currentColor.a` = `currentColor.a` (bit-identical:
// half 0xH3C00 is exactly 1.0 and multiplying half by 1.0 is a no-op in fp16).
//
// LITERAL CONSTANTS (all recovered verbatim from the .ll double-literal encoding, then
// fp32-narrowed since the callee is `air.dot.v2f32`; the double IR literal is only the
// LLVM constant-pool notation — the value is delivered to the intrinsic as fp32):
//   0x3FFFD63880000000 -> double 1.989799976348877 -> fp32 0x3FFEB1C4 (= 1.9898f)
//   0x40538EE980000000 -> double 78.23300170898438 -> fp32 0x429C774C (= 78.233f)
//   0x40E55DD180000000 -> double 43758.546875      -> fp32 0x472AEE8C (= 43758.5453f)
//   0xH3C00           -> half   1.0 (bit-exact)
// All three fp32 constants are `Math.fround`-narrowed at their site of use so the IR
// bit pattern is preserved.
//
// FRONTIER: `air.dot.v2f32`, `air.fast_sin.f32`, `air.fast_fract.f32` are host GPU
// intrinsics; the transcription implements them directly using `Math.fround` +
// `Math.sin` + `x - Math.floor(x)`. fast-math permits the JS Math.sin fp64 result to
// be fp32-narrowed at the callsite; that narrowing is done explicitly via
// `Math.fround(Math.sin(x))`.

/** Mutating accumulator for a `<4 x half>` value. Lanes are IEEE-754 half-precision. */
export interface Half4Out {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Half-precision quantisation helper. IEEE-754 half is fp16 (5-bit exponent, 10-bit
 * mantissa, subnormals). ES2024's `Float16Array` (when present) gives bit-exact fp16
 * rounding; a software fallback provides the same round-to-nearest-even semantics for
 * pre-ES2024 runtimes. This preserves the `fptrunc float -> half` semantics of `%7`.
 */
type Float16ArrayCtor = new (n: number) => { [i: number]: number; length: number };
const _f16Global = (globalThis as unknown as { Float16Array?: Float16ArrayCtor });
const _f16Scratch: { [i: number]: number; length: number } | null =
  typeof _f16Global.Float16Array === "function" ? new _f16Global.Float16Array(1) : null;

/** Round `x` to half-precision. Matches the IR's `fptrunc float to half`. */
function toHalf(x: number): number {
  if (_f16Scratch) {
    _f16Scratch[0] = x;
    return _f16Scratch[0];
  }
  // Software fp16 round (round-to-nearest-even, no subnormal flush — denorms_disable
  // in the AIR compile options only disables denorm INPUTS to fp32 ops; the fp16
  // representation itself carries subnormals per IEEE-754. We emit them so the bit
  // pattern matches the metallib.)
  const f32 = Math.fround(x);
  const buf = new ArrayBuffer(4);
  new Float32Array(buf)[0] = f32;
  const u32 = new Uint32Array(buf)[0];
  const sign = (u32 >>> 16) & 0x8000;
  let mant = u32 & 0x007fffff;
  let exp = (u32 >>> 23) & 0xff;
  if (exp === 0xff) {
    // Inf/NaN — fast-math tags "no-infs/no-nans" so this branch is dead in FCP; still
    // deliver a canonical encoding for safety.
    return _u16ToHalf(sign | 0x7c00 | (mant ? 0x200 : 0));
  }
  const e = exp - 127 + 15;
  if (e >= 31) return _u16ToHalf(sign | 0x7c00); // overflow to +/-inf
  if (e <= 0) {
    // subnormal or zero
    if (e < -10) return _u16ToHalf(sign);
    mant = mant | 0x00800000;
    const shift = 14 - e;
    const roundBit = 1 << (shift - 1);
    let m = mant >>> shift;
    if ((mant & (roundBit - 1)) !== 0 || (m & 1) !== 0) {
      if ((mant & roundBit) !== 0) m += 1;
    }
    return _u16ToHalf(sign | m);
  }
  // normal
  let m = mant >>> 13;
  const round = mant & 0x1fff;
  if (round > 0x1000 || (round === 0x1000 && (m & 1) !== 0)) {
    m += 1;
    if (m === 0x400) {
      m = 0;
      // carry into exponent
      return _u16ToHalf(sign | ((e + 1) << 10));
    }
  }
  return _u16ToHalf(sign | (e << 10) | m);
}

function _u16ToHalf(u16: number): number {
  const buf = new ArrayBuffer(2);
  new Uint16Array(buf)[0] = u16 & 0xffff;
  // Decode as an fp16 by promoting through the reverse math. Bit pattern:
  const sign = (u16 & 0x8000) ? -1 : 1;
  const exp = (u16 >>> 10) & 0x1f;
  const mant = u16 & 0x3ff;
  if (exp === 0) {
    if (mant === 0) return sign * 0;
    return sign * mant * Math.pow(2, -24);
  }
  if (exp === 0x1f) {
    return mant ? NaN : sign * Infinity;
  }
  return sign * (1 + mant / 1024) * Math.pow(2, exp - 15);
}

/**
 * Stitchable half4 shader `noise(position, currentColor)`.
 *
 * The classic one-line GLSL "sin/dot/fract" hash, half-precision output, multiplied
 * componentwise by `currentColor.aaaa`. Used by Motion/EDEL plugin fragment pipelines
 * to seed per-pixel randomness during stitched-pipeline execution.
 *
 *   n_f32 = fract(sin(dot(position, (1.9898f, 78.233f))) * 43758.5453f)
 *   n_h   = half(n_f32)                                       ; fptrunc
 *   out   = (n_h, n_h, n_h, 1.0h) * currentColor.aaaa
 *         = (n_h * a,  n_h * a,  n_h * a,  a)                  ; since 1.0h * a == a
 *
 * All fp32 ops are fp32-narrowed via `Math.fround`; the final `fptrunc float to half`
 * (`%7`) is delivered by `toHalf`. The `(n,n,n,1.0h) * a.wwww` multiply is performed
 * lane-by-lane in fp16.
 *
 * Writes the result into `out` (mutating accumulator, per SHADERS.md).
 *
 * @shader noise (MAPlugInGUISwift)
 */
export function noise(
  position: [number, number],
  currentColor: [number, number, number, number],
  out: Half4Out,
): void {
  // %3 — air.dot.v2f32(position, <1.9898f, 78.233f>). Two `Math.fround`-narrowed
  // multiplies summed under fp32.
  const kX = Math.fround(1.9898); // 0x3FFEB1C4 — from the 0x3FFFD63880000000 double pool.
  const kY = Math.fround(78.233); // 0x429C774C — from the 0x40538EE980000000 double pool.
  const dot = Math.fround(
    Math.fround(Math.fround(position[0]) * kX) +
      Math.fround(Math.fround(position[1]) * kY),
  );

  // %4 — air.fast_sin.f32(dot). fast-math sin at fp32 precision.
  const s = Math.fround(Math.sin(dot));

  // %5 — s * 43758.5453f (fp32-narrowed).
  const k43758 = Math.fround(43758.5453); // 0x472AEE8C — from 0x40E55DD180000000.
  const scaled = Math.fround(s * k43758);

  // %6 — air.fast_fract.f32(scaled) = scaled - floor(scaled). fast_fract is defined as
  // `x - floor(x)` and returns a value in `[0.0, 1.0)`.
  const n = Math.fround(scaled - Math.floor(scaled));

  // %7 — fptrunc float to half. Bit-exact fp16 round.
  const nH = toHalf(n);
  // The fourth lane of the (r,g,b,1.0h) vector is exactly 1.0h (0xH3C00), which in fp16
  // is the multiplicative identity.
  const oneH = 1.0; // 0xH3C00

  // %11 — currentColor.aaaa splat.
  const aH = toHalf(currentColor[3]);

  // %12 — componentwise fp16 multiply. Lanes 0..2 = nH * a; lane 3 = 1.0h * a = a.
  out.r = toHalf(nH * aH);
  out.g = toHalf(nH * aH);
  out.b = toHalf(nH * aH);
  out.a = toHalf(oneH * aH);
}
