// Faithful transcription @0x00000000010056
// @shader StippledLineFragmentFunc (MDPKit)
//
// Stippled-line fragment shader from MDPKit's default.metallib (source
// file `MDPKit/Shaders/MDPLine.metal`, line 76). Tests the current
// fragment's `stipplePos / stippleScale` (as a truncated int32) against
// bit `stipplePos_int & 31` of the 32-bit `stipplePattern` mask; if the
// bit is zero the fragment is discarded. Otherwise the interpolated
// per-vertex `color` (float4) is returned unchanged.
//
// Source LLVM IR: raw-port/re/shaders/StippledLineFragmentFunc.ll
// Extracted from: MDPKit.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh StippledLineFragmentFunc MDPKit`)
//
// AIR fragment signature (from air.fragment metadata !29 and !32..!36):
//   define <{ <4 x float> }> @StippledLineFragmentFunc(
//     <4 x float> %0,                            ; air.position (unused)
//     <4 x float> %1,                            ; air.fragment_input color
//     float       %2,                            ; air.fragment_input stipplePos
//     MDPAliasedLineUniforms addrspace(2)* %3    ; air.buffer uniforms (80 B)
//   )
//
// MDPAliasedLineUniforms layout (from !37 — 80 bytes, align 16, packed):
//   offset  0 (64 B) float4x4 mvp             (index 0)  [unused here]
//   offset 64 (4 B)  uint     stipplePattern  (index 1)  <- our bit mask
//   offset 68 (4 B)  float    stippleScale    (index 2)  <- the divisor
//   (offset 72..79 is the 8-byte tail padding `[8 x i8]` to reach 80 B.)
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`.
// No shortcut language of any kind — every SSA value in the .ll body has a
// matching step below with its %N reference.
//
// IR line map (from the .ll body):
//   %5  = GEP uniforms.stipplePattern (index 1)               -> &stipplePattern
//   %6  = load i32, addrspace(2)*                              -> stipplePattern
//   %7  = GEP uniforms.stippleScale (index 2)                 -> &stippleScale
//   %8  = load float, addrspace(2)*                            -> stippleScale
//   %9  = fdiv fast float %2, %8                               -> stippleT = pos/scale
//   %10 = call i32 @air.convert.s.i32.f.f32(float %9)          -> stippleI = int32_t(stippleT)
//         (Metal's `int(float)` is a `s.i32.f.f32` — a signed truncation
//          toward zero. See notes on out-of-range floats below.)
//   %11 = and i32 %10, 31                                       -> stippleBit = stippleI & 31
//   %12 = shl nuw i32 1, %11                                    -> mask = 1u << stippleBit
//         (nuw = "no unsigned wrap" — the shift amount %11 is 0..31 so
//          the 1u<<n never overflows a 32-bit unsigned lane.)
//   %13 = and i32 %12, %6                                       -> keptBit = mask & pattern
//   %14 = icmp eq i32 %13, 0                                    -> discard? = (keptBit == 0)
//   br i1 %14, label %15, label %16
//   %15: tail call void @air.discard_fragment()                 -> discard
//        br label %16
//   %16: %17 = insertvalue <{ <4xf> }> undef, %1, 0            -> {color}
//        ret <{ <4xf> }> %17
//
// Notes:
//   • The `and %10, 31` guarantees the shift amount is in [0..31] even
//     when `stippleI` is negative — this is a 32-bit two's-complement
//     mask, so `-1 & 31 = 31`, `-32 & 31 = 0`, etc. We reproduce this by
//     coercing to Int32 with `| 0` then masking with `& 31`.
//   • `air.convert.s.i32.f.f32` = `int(float)` — round toward zero.
//     JS's `Math.trunc` matches this for finite values. Values ≥ 2^31 or
//     ≤ -2^31 are undefined in fast-math (no-nans, no-infs); we clamp to
//     Int32 range via `| 0` after truncating, which is the standard JS
//     idiom for reproducing a Metal `int(float)` cast for in-range
//     inputs and is idempotent for our stipple use-case.
//   • `air.discard_fragment` — kills the current fragment invocation.
//     There is no meaningful return value once discarded; Metal still
//     retains the SSA path to the `ret` for control-flow correctness.
//     We model this by having the discard path throw a sentinel
//     `FragmentDiscarded` marker: callers of a fragment shader typically
//     drive this via the pixel-shader runtime which recognises the
//     sentinel and skips the write. Alternatively, callers that only
//     want the color can catch/ignore the sentinel — see below.
//   • The `air.arg_unused` marker on `%0` (position) is preserved for
//     API fidelity; the body never touches it.

/**
 * Standard `MDPAliasedLineUniforms` shape as seen from JS. Field
 * offsets match the `air.struct_type_info` in !37; only `stipplePattern`
 * (offset 64) and `stippleScale` (offset 68) are read here.
 */
export interface MDPAliasedLineUniforms {
  /** column-major 4x4 matrix — unused by this fragment shader. */
  readonly mvp: readonly [
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
  ];
  /** uint32 bit mask (offset 64). */
  readonly stipplePattern: number;
  /** fp32 divisor (offset 68). */
  readonly stippleScale: number;
}

/**
 * Sentinel error raised by `StippledLineFragmentFunc` when the current
 * fragment falls on a "hole" of the stipple pattern (i.e. the AIR
 * `air.discard_fragment()` call at line %15 of the .ll). Callers should
 * treat this as "skip the framebuffer write for this pixel".
 */
export class FragmentDiscarded extends Error {
  constructor(readonly source: string = "StippledLineFragmentFunc") {
    super(`fragment discarded by ${source}`);
    this.name = "FragmentDiscarded";
  }
}

/**
 * StippledLineFragmentFunc — bit-test the stipple pattern; discard if
 * the bit is zero, otherwise return the interpolated color unchanged.
 *
 * @param position    air.position vec4 — unused (`air.arg_unused`).
 * @param color       interpolated per-vertex fragment color.
 * @param stipplePos  interpolated per-vertex stipple parameter (fp32).
 * @param uniforms    MDPAliasedLineUniforms — only `stipplePattern` and
 *                    `stippleScale` are read.
 * @returns           fp32 vec4 `color` when the stipple bit is set.
 * @throws FragmentDiscarded when the stipple bit is zero (mirrors the
 *   AIR `air.discard_fragment()` at %15).
 */
export function StippledLineFragmentFunc(
  position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  stipplePos: number,
  uniforms: MDPAliasedLineUniforms,
): [number, number, number, number] {
  // %0 (position) is declared `air.arg_unused`.
  void position;

  // %5..%6: load uniforms.stipplePattern (field index 1, offset 64).
  //   The AIR i32 lane is a 32-bit unsigned mask; we coerce to Int32
  //   with `| 0` because JS Numbers are fp64 and we need bit-level
  //   two's-complement semantics for the later `& 31`, `<<`, and `&` ops.
  const stipplePattern = uniforms.stipplePattern | 0;

  // %7..%8: load uniforms.stippleScale (field index 2, offset 68).
  const stippleScale = Math.fround(uniforms.stippleScale);

  // %9 = fdiv fast float %2, %8  — stippleT = stipplePos / stippleScale.
  const stippleT = Math.fround(Math.fround(stipplePos) / stippleScale);

  // %10 = air.convert.s.i32.f.f32(%9)  — int(float), round-toward-zero.
  //   For our stipple use-case (stipplePos is line-length-derived and
  //   generally in [0, ~1e5]), the result fits comfortably in Int32.
  //   `Math.trunc + | 0` is the standard JS idiom (`| 0` clamps to
  //   Int32 for finite in-range values).
  const stippleI = Math.trunc(stippleT) | 0;

  // %11 = and i32 %10, 31  — bit index in [0..31] (handles negative %10
  //   via two's-complement mask, matching the AIR `and` semantics).
  const stippleBit = stippleI & 31;

  // %12 = shl nuw i32 1, %11  — mask = 1u << bit.  We shift a plain
  //   Number by an integer 0..31; JS's `<<` operator treats the LHS as
  //   Int32 and the RHS as u5 (modulo 32), matching Metal's `nuw` shift
  //   for these in-range shift amounts. Coerce with `| 0` for bit width.
  const mask = (1 << stippleBit) | 0;

  // %13 = and i32 %12, %6  — kept = mask & pattern.
  const kept = (mask & stipplePattern) | 0;

  // %14 = icmp eq i32 %13, 0  — discard when the bit is not set.
  if (kept === 0) {
    // %15: tail call void @air.discard_fragment()
    //   Kills the current fragment. See FragmentDiscarded notes above.
    throw new FragmentDiscarded("StippledLineFragmentFunc");
  }

  // %16: %17 = insertvalue { <4xf> } undef, %1, 0
  //   ret <{ <4 x float> }> %17
  //   The color is passed through with fp32 narrowing on each lane.
  return [
    Math.fround(color[0]),
    Math.fround(color[1]),
    Math.fround(color[2]),
    Math.fround(color[3]),
  ];
}
