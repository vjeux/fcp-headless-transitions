// @shader soOFlowEstimator::soOFlowEstimator_normalizeToLuma (HeliumSenso) @0x000000000a609d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_normalizeToLuma.ll, extracted
// via raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. Header
// line reads `0x000000000a609d -- soOFlowEstimator::
// soOFlowEstimator_normalizeToLuma:` — the shader's entry offset in
// the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable` means
// standard IEEE-754 fp32 semantics — direct TS mapping via
// Math.fround on every fadd/fmul/fdiv.
//
// UNSIGNED-VS-SIGNED int-float traps (see SHADERS.md):
//   * air.convert.f.f32.u.i32 (%18)      -- UNSIGNED cast of
//                                            (m_LUT_length - 1).
//   * air.convert.f.v2f32.s.v2i32 (%40)  -- SIGNED cast of clamped
//                                            sample coord.
//   * air.convert.s.v4i32.f.v4f32 (%53)  -- SIGNED float->int (floor).
//   * air.convert.s.i32.f.f32 (%55)      -- SIGNED float->int of
//                                            (m_LUT_length - 1) after
//                                            its unsigned->float cast
//                                            at %18. For a positive
//                                            LUT_length the unsigned
//                                            and signed casts agree
//                                            bit-for-bit; preserved
//                                            literally.
//   * air.convert.f.v4f32.s.v4i32 (%94)  -- SIGNED int->float of the
//                                            floor indices.
//
// Compute kernel signature (from !14..!23):
//   params : constant struct at !18 — 48 bytes, 12 fields:
//     offset  0: uint  m_LUT_length
//     offset  4: float m_remapOffset
//     offset  8: float m_remapScale
//     offset 12: int   m_isAlphaFirstChannel
//     offset 16: float m_RGBtoLuma_r
//     offset 20: float m_RGBtoLuma_g
//     offset 24: float m_RGBtoLuma_b
//     offset 28: int   m_originX
//     offset 32: int   m_originY
//     offset 36: int   m_width
//     offset 40: int   m_height
//     offset 44: int   m_inputPaddingXY
//   coord  : uint2 — thread_position_in_grid.
//   sam    : sampler index 0.
//   input  : texture2d<float, sample> index 0 (%3).
//   output : texture2d<float, write>  index 1 (%4).
//   LUT    : float* (buffer index 1, read_write) — length
//                >= 3 * m_LUT_length. Stored as three back-to-back
//                bands of `m_LUT_length` fp32 samples: LUT[0..N)
//                is the R band, LUT[N..2N) the G band, LUT[2N..3N)
//                the B band (see the &LUT[N] and &LUT[2N] geps at
//                %60/%63).
//
// AIR intrinsics used:
//   air.get_width_texture_2d, air.get_height_texture_2d
//                                              -- bounds source.
//   air.clamp.s.v2i32 / air.clamp.v4f32        -- integer/float clamp.
//   air.min.s.v4i32                            -- min over 4-lane i32.
//   air.convert.f.f32.u.i32, .v2f32.s.v2i32,
//     .v4f32.s.v4i32                          -- int->float casts.
//   air.convert.s.i32.f.f32, .s.v4i32.f.v4f32  -- float->int casts
//                                                 (signed).
//   air.sample_texture_2d.v4f32                 -- 2D texture sample.
//   air.mix.v4f32(a, b, t)                     -- LUT linear interp.
//   air.dot.v3f32                              -- rgb-to-luma dot.
//   air.write_texture_2d.v4f32                  -- write output.
//
// Kernel algorithm summary:
//
//   1. Bounds check the destination coord against the OUTPUT
//      texture's width/height (per %8/%12 -- these are dynamic
//      queries of `output`, NOT of `input` or of `m_width`/`m_height`).
//   2. Compute a sample coord in INPUT space by:
//        sampleCoord = origin + coord - <padding, padding>
//      clamped to [origin, origin + size].
//   3. Sample the input at (sampleCoord + <0.5, 0.5>).
//   4. Multiply the sample by (m_LUT_length - 1) and clamp to
//      [0, m_LUT_length - 1] -- gives a per-channel LUT index in
//      fp32 (with fractional part).
//   5. If m_isAlphaFirstChannel != 0, rotate the channels
//      <r, g, b, a> -> <g, b, a, r> so that RGB moves to lanes 0..2.
//   6. Look up the 3 RGB channels in the LUT with linear
//      interpolation between `floor(idx)` and
//      `min(floor(idx)+1, m_LUT_length-1)`.
//   7. Convert to luma with dot(<m_RGBtoLuma_r, .g, .b>, LUT_rgb),
//      remap with `(luma - m_remapOffset) * m_remapScale`, and
//      write as <luma, luma, luma, 1.0>.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_normalizeToLuma` — mirrors the
 * AIR struct at !18 (48-byte packed record, four-byte fields).
 */
export interface SoOFlowEstimatorNormalizeToLumaParams {
  m_LUT_length: number;          // offset  0 : uint
  m_remapOffset: number;         // offset  4 : float
  m_remapScale: number;          // offset  8 : float
  m_isAlphaFirstChannel: number; // offset 12 : int
  m_RGBtoLuma_r: number;         // offset 16 : float
  m_RGBtoLuma_g: number;         // offset 20 : float
  m_RGBtoLuma_b: number;         // offset 24 : float
  m_originX: number;             // offset 28 : int
  m_originY: number;             // offset 32 : int
  m_width: number;               // offset 36 : int
  m_height: number;              // offset 40 : int
  m_inputPaddingXY: number;      // offset 44 : int
}

/** Callback for AIR `air.sample_texture_2d.v4f32`. */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/** Callback for AIR `air.write_texture_2d.v4f32`. */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/** Callback for AIR `air.get_width_texture_2d` (lod 0). */
export type GetTexWidth<T> = (texture: T) => number;
/** Callback for AIR `air.get_height_texture_2d` (lod 0). */
export type GetTexHeight<T> = (texture: T) => number;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_normalizeToLuma`.
 * Reads a rectangular ROI from `input`, applies a per-channel LUT to
 * the RGB triple, mixes to luma with `m_RGBtoLuma_{r,g,b}`, remaps
 * with `(luma - m_remapOffset) * m_remapScale`, and writes
 * `<luma, luma, luma, 1.0>` at each pixel of `output` inside the
 * output texture's dimensions.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_normalizeToLuma (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_normalizeToLuma<TIn, TOut>(
  params: SoOFlowEstimatorNormalizeToLumaParams,
  coord: [number, number],
  input: TIn,
  output: TOut,
  LUT: Float32Array | number[],
  sampleInput: SampleFloatTex2D<TIn>,
  writeOutput: WriteFloatTex2D<TOut>,
  getOutputWidth: GetTexWidth<TOut>,
  getOutputHeight: GetTexHeight<TOut>,
): void {
  // %7, %8 : coord.x vs air.get_width_texture_2d(output).
  //   `icmp ult` -- UNSIGNED compare; matched with `>>> 0` coercion.
  const coordUx = coord[0] >>> 0;
  const outW = getOutputWidth(output) >>> 0;
  if (!(coordUx < outW)) {
    // br i1 %9 false -> label %117 : ret void.
    return;
  }
  // %11, %12 : coord.y vs air.get_height_texture_2d(output).
  const coordUy = coord[1] >>> 0;
  const outH = getOutputHeight(output) >>> 0;
  if (!(coordUy < outH)) {
    return;
  }

  // %16 = load params.m_LUT_length ; %17 = N - 1 (i32 wrap).
  //   %18 = air.convert.f.f32.u.i32 -- UNSIGNED cast.
  const lutLength = params.m_LUT_length | 0;
  const lutN1i = (lutLength - 1) | 0;
  const lutN1f = Math.fround((lutN1i >>> 0));

  // %20 = m_originX ; %23 = m_originY ; %24 = <originX, originY>.
  const originX = params.m_originX | 0;
  const originY = params.m_originY | 0;
  // %26 = m_inputPaddingXY ; %27 = <padding, undef> ; %36 = splat
  //   -padding to both lanes via `<0, undef> - splat(padding)`.
  const padding = params.m_inputPaddingXY | 0;
  // %29 = m_width ; %32 = m_height ; %33 = <width, height>.
  const width = params.m_width | 0;
  const height = params.m_height | 0;

  // %34 = <originX, originY> + <coord.x, coord.y> = origin + coord.
  //   %37 = %34 + <-padding, -padding> = origin + coord - padding
  //   (integer wrap semantics preserved by `| 0`).
  const sampX = (originX + (coord[0] | 0) - padding) | 0;
  const sampY = (originY + (coord[1] | 0) - padding) | 0;
  // %38 = <width, height> + <originX, originY> = origin + size.
  const clampHiX = (width + originX) | 0;
  const clampHiY = (height + originY) | 0;
  // %39 = clamp(sampCoord, origin, origin+size) -- signed.
  const clampX = Math.max(originX, Math.min(sampX, clampHiX)) | 0;
  const clampY = Math.max(originY, Math.min(sampY, clampHiY)) | 0;

  // %40 = signed int->float ; %41 = %40 + <0.5, 0.5>.
  const uvU = Math.fround(Math.fround(clampX) + Math.fround(0.5));
  const uvV = Math.fround(Math.fround(clampY) + Math.fround(0.5));

  // %42 = sample(input, sam, uv) ; %43 = rgba (<4 x f>).
  const rgba = sampleInput(input, uvU, uvV);
  const rR = Math.fround(rgba[0]);
  const rG = Math.fround(rgba[1]);
  const rB = Math.fround(rgba[2]);
  const rA = Math.fround(rgba[3]);

  // %46 = splat(N-1) * rgba -- fp32 4-lane multiply.
  const mR = Math.fround(lutN1f * rR);
  const mG = Math.fround(lutN1f * rG);
  const mB = Math.fround(lutN1f * rB);
  const mA = Math.fround(lutN1f * rA);
  // %47 = clamp(%46, 0, splat(N-1)) -- fp32 4-lane clamp.
  const cR = Math.max(Math.fround(0.0), Math.min(mR, lutN1f));
  const cG = Math.max(Math.fround(0.0), Math.min(mG, lutN1f));
  const cB = Math.max(Math.fround(0.0), Math.min(mB, lutN1f));
  const cA = Math.max(Math.fround(0.0), Math.min(mA, lutN1f));

  // %49 = load m_isAlphaFirstChannel ; %50 = icmp eq %49, 0.
  //   %51 = shufflevector %47, undef, <1, 2, 3, 0>
  //     -- rotate <r, g, b, a> -> <g, b, a, r>.
  //   %52 = select (isAlphaFirstChannel == 0) ? %47 : %51.
  //     When the alpha channel is stored FIRST in the input, the raw
  //     rgba tuple is actually <a, r, g, b>; rotating by <1,2,3,0>
  //     moves it to <r, g, b, a> for the RGB LUT lookup below.
  let cRB0: number, cRB1: number, cRB2: number, cRB3: number;
  if ((params.m_isAlphaFirstChannel | 0) === 0) {
    cRB0 = cR; cRB1 = cG; cRB2 = cB; cRB3 = cA;
  } else {
    cRB0 = cG; cRB1 = cB; cRB2 = cA; cRB3 = cR;
  }

  // %53 = air.convert.s.v4i32.f.v4f32(%52) -- signed float->int (floor
  //   toward zero, but %47 is already clamped to [0, N-1] so trunc
  //   == floor here).
  const floor0 = cRB0 | 0;
  const floor1 = cRB1 | 0;
  const floor2 = cRB2 | 0;
  const floor3 = cRB3 | 0;
  // %54 = %53 + <1, 1, 1, 1>.
  const ceil0 = (floor0 + 1) | 0;
  const ceil1 = (floor1 + 1) | 0;
  const ceil2 = (floor2 + 1) | 0;
  const ceil3 = (floor3 + 1) | 0;

  // %55 = air.convert.s.i32.f.f32(%18 = (N-1) as unsigned float)
  //   -- for a non-negative N-1 the unsigned and signed casts agree
  //   bit-for-bit ; %57 = splat to <4 x i32>.
  const lutN1SignedI = lutN1f | 0;
  // %58 = min(%54 ceil, splat(N-1)) -- signed 4-lane min.
  const clip0 = Math.min(ceil0, lutN1SignedI) | 0;
  const clip1 = Math.min(ceil1, lutN1SignedI) | 0;
  const clip2 = Math.min(ceil2, lutN1SignedI) | 0;
  // clip3 is never consumed downstream (lane 3 of %58 comes from the
  //   alpha channel, but the LUT lookup only uses lanes 0..2).

  // %59, %60, %62, %63 : &LUT[N] and &LUT[2N] -- the three per-channel
  //   sub-arrays of the LUT.
  const lutOffR = 0;                 // R band starts at LUT[0].
  const lutOffG = lutLength | 0;      // G band starts at LUT[N].
  const lutOffB = (lutLength << 1) | 0; // B band starts at LUT[2N].

  // %64/%67 : load LUT_R[floor0] ; %69/%72 : LUT_G[floor1] ;
  //   %74/%77 : LUT_B[floor2].
  //   All floor indices are in [0, N-1] by construction.
  const l0R = Math.fround(LUT[lutOffR + floor0]);
  const l0G = Math.fround(LUT[lutOffG + floor1]);
  const l0B = Math.fround(LUT[lutOffB + floor2]);

  // %79/%82 : LUT_R[clip0] ; %84/%87 : LUT_G[clip1] ;
  //   %89/%92 : LUT_B[clip2].
  const l1R = Math.fround(LUT[lutOffR + clip0]);
  const l1G = Math.fround(LUT[lutOffG + clip1]);
  const l1B = Math.fround(LUT[lutOffB + clip2]);

  // %94 = air.convert.f.v4f32.s.v4i32(%53) -- signed int->float of
  //   the floor indices. %95 = %52 - %94 -- fractional part per lane.
  const frac0 = Math.fround(cRB0 - Math.fround(floor0));
  const frac1 = Math.fround(cRB1 - Math.fround(floor1));
  const frac2 = Math.fround(cRB2 - Math.fround(floor2));

  // %96 = air.mix.v4f32(<l0>, <l1>, frac)  -- per-channel LUT lerp.
  //   air.mix(a, b, t) = a + (b - a) * t (per Metal spec).
  const mixR = Math.fround(l0R + Math.fround(Math.fround(l1R - l0R) * frac0));
  const mixG = Math.fround(l0G + Math.fround(Math.fround(l1G - l0G) * frac1));
  const mixB = Math.fround(l0B + Math.fround(Math.fround(l1B - l0B) * frac2));

  // %98 = m_RGBtoLuma_r ; %101 = _g ; %104 = _b ;
  //   %106 = %96.xyz ; %107 = dot(weights, rgb).
  const wR = Math.fround(params.m_RGBtoLuma_r);
  const wG = Math.fround(params.m_RGBtoLuma_g);
  const wB = Math.fround(params.m_RGBtoLuma_b);
  const luma = Math.fround(
    Math.fround(Math.fround(wR * mixR) + Math.fround(wG * mixG)) +
      Math.fround(wB * mixB),
  );

  // %109 = m_remapOffset ; %110 = luma - remapOffset ;
  //   %112 = m_remapScale ; %113 = (luma - offset) * scale.
  const remapOffset = Math.fround(params.m_remapOffset);
  const remapScale = Math.fround(params.m_remapScale);
  const remapped = Math.fround(Math.fround(luma - remapOffset) * remapScale);

  // %114..%116 = <remapped, remapped, remapped, 1.0>.
  writeOutput(output, coord[0] | 0, coord[1] | 0, [
    remapped,
    remapped,
    remapped,
    Math.fround(1.0),
  ]);
}
