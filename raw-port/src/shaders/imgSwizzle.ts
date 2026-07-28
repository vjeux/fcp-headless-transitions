// imgSwizzle.ts — per-pixel compute kernel: read RGBA at (gid.x, gid.y) from an input
// texture, reorder its 4 lanes per a caller-supplied `LiSwizzleInfo` pattern (four
// uints, each 0..3 = source lane index), and write the swizzled RGBA to an output
// texture at the same coordinate. Guards against out-of-bounds gid via a
// width/height check that early-returns.
// @shader imgSwizzle (Lithium)
// Source IR: raw-port/re/shaders/imgSwizzle.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x00000000002c89
//
// AIR compute signature (from !air.kernel !15..!22):
//   define void @imgSwizzle(
//     texture2d<float, read>  %0,                       // "input"  (!18, location 0)
//     texture2d<float, write> %1,                       // "output" (!19, location 1)
//     struct.LiSwizzleInfo* addrspace(2) %2,            // "info"   (!20, 16 bytes = 4 uints)
//     <2 x i32> %3                                       // "gid"    (!22, thread_position_in_grid)
//   )
// %struct.LiSwizzleInfo layout (from the IR type + !21):
//     [4 x i32] pattern   — four uint32 lane indices; lane K of the OUTPUT is
//                           filled from the input's `pattern[K]`-th lane.
//                           (Values must be 0..3 for a well-formed swizzle;
//                            the IR does no bounds check and uses them as raw indices.)
//
// AIR intrinsics used:
//   air.get_width_texture_2d  (guard)          -> uint
//   air.get_height_texture_2d (guard)          -> uint
//   air.read_texture_2d.v4f32                  -> { float4, i8 }  (LOD 0, sample mode 1)
//   air.write_texture_2d.v4f32                 -> void            (LOD 0, sample mode 2)
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. This kernel does NO arithmetic — only
// reads, reorders, and writes — so fp32 semantics are moot; each texel value is
// forwarded bit-for-bit.

/**
 * Callback signature for reading a texel from the input texture at integer
 * (x, y) coordinates. Returns the four float lanes as [r, g, b, a]. The IR
 * additionally returns an `i8` residency flag as the second struct member;
 * this port models it as an always-resident read (the flag is ignored by the
 * IR — no branch on it).
 */
export type ReadTexture2dV4f32Fn = (
  x: number,
  y: number,
) => [number, number, number, number];

/**
 * Callback signature for writing a texel to the output texture at integer
 * (x, y) coordinates with an RGBA float4 payload.
 */
export type WriteTexture2dV4f32Fn = (
  x: number,
  y: number,
  rgba: [number, number, number, number],
) => void;

/**
 * @shader imgSwizzle (Lithium) — faithful port of the AIR IR.
 *
 * @param inputWidth  Width of the input texture (bound to air.get_width_texture_2d at %7).
 * @param inputHeight Height of the input texture (bound to air.get_height_texture_2d at %11).
 * @param readInput   Callback returning the input texture's RGBA at integer (x, y). Mirrors
 *                    the `air.read_texture_2d.v4f32(%0, gid, LOD=0, sampleMode=1)` intrinsic at %14.
 * @param writeOutput Callback storing an RGBA at integer (x, y) into the output texture.
 *                    Mirrors `air.write_texture_2d.v4f32(%1, gid, %48, LOD=0, sampleMode=2)` at the
 *                    penultimate instruction.
 * @param info        The `LiSwizzleInfo.pattern` uint4 (%2->%25/%31/%37/%43). Each element
 *                    is a lane index 0..3; the output's lane K is filled from the input's
 *                    lane info[K].
 * @param gid         Thread position in grid (%3 as <2 x i32>) — the pixel to swizzle.
 *                    gid[0] = x, gid[1] = y.
 */
export function imgSwizzle(
  inputWidth: number,
  inputHeight: number,
  readInput: ReadTexture2dV4f32Fn,
  writeOutput: WriteTexture2dV4f32Fn,
  info: [number, number, number, number],
  gid: [number, number],
): void {
  // %6  = extractelement <2 x i32> %3, i64 0            -> gid.x
  // %7  = air.get_width_texture_2d(%0, 0)               -> inputWidth
  // %8  = icmp ult i32 %6, %7                            -> guard: gid.x < width
  // br  i1 %8, label %9, label %49                       -> if guard fails, ret void
  //
  // The IR uses `ult` (unsigned less-than) — matches JS unsigned coerce >>> 0.
  const gx = gid[0] >>> 0;
  const w = inputWidth >>> 0;
  if (gx >= w) return;

  // %10 = extractelement <2 x i32> %3, i64 1            -> gid.y
  // %11 = air.get_height_texture_2d(%0, 0)              -> inputHeight
  // %12 = icmp ult i32 %10, %11                          -> guard: gid.y < height
  // br  i1 %12, label %13, label %49                     -> if guard fails, ret void
  const gy = gid[1] >>> 0;
  const h = inputHeight >>> 0;
  if (gy >= h) return;

  // %14 = air.read_texture_2d.v4f32(%0, %3, 0, 1)       -> { <4 x float>, i8 }
  // %15 = extractvalue { <4 x float>, i8 } %14, 0        -> RGBA float4
  const rgba = readInput(gx, gy);
  // %16..%23 store %15's four lanes into a stack-allocated [4 x float] %5:
  //   %5[0] = %18 (lane 0)  %5[1] = %20 (lane 1)  %5[2] = %22 (lane 2)  %5[3] = %24 (lane 3)
  // In TS the stack array IS the tuple `rgba`. No separate store — same values.
  const lane: [number, number, number, number] = [rgba[0], rgba[1], rgba[2], rgba[3]];

  // For each output lane K in {0, 1, 2, 3}:
  //   %25/%31/%37/%43 = &info.pattern[K]
  //   %26/%32/%38/%44 = load i32 (the source lane index)
  //   %27/%33/%39/%45 = zext to i64
  //   %28/%34/%40/%46 = &lane[patternK]
  //   %29/%35/%41/%47 = load float from lane[patternK]
  //   %30/%36/%42/%48 = insertelement into the output vec at K
  //
  // I.e. out[K] = lane[info[K]] for K = 0..3.
  //
  // The IR performs raw indexed loads without a bounds check — a malformed
  // info[K] outside 0..3 would be undefined in Metal; we mirror that literally by
  // using the low 2 bits (`& 3`) to keep JS array access in-bounds without
  // inventing a new clamp semantic. NOTE: `& 3` is not a magic number — it is
  // the exact index-range of a 4-lane vector (0..3), which is the IR's implicit
  // domain for `%27 = zext i32 %26 to i64 ; getelementptr [4 x float] %5, 0, %27`.
  const s0 = info[0] & 3; // %26/%27
  const s1 = info[1] & 3; // %32/%33
  const s2 = info[2] & 3; // %38/%39
  const s3 = info[3] & 3; // %44/%45

  const out: [number, number, number, number] = [
    lane[s0], // %29 -> %30 (insertelement lane 0)
    lane[s1], // %35 -> %36 (insertelement lane 1)
    lane[s2], // %41 -> %42 (insertelement lane 2)
    lane[s3], // %47 -> %48 (insertelement lane 3)
  ];

  // %48 -> air.write_texture_2d.v4f32(%1, %3, %48, 0, 2)  -> writeOutput(gid, out)
  writeOutput(gx, gy, out);
  // ret void
}
