// soOFlowEstimator__soOFlowEstimator_fillWithColor_uint.ts — direct TS
// mapping of the Metal compute kernel
// `soOFlowEstimator::soOFlowEstimator_fillWithColor_uint` from
// HeliumSenso.framework/Versions/A/Resources/default.metallib.
//
// @shader soOFlowEstimator::soOFlowEstimator_fillWithColor_uint (HeliumSenso) @0x000000000a14bd
// IR provenance: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_fillWithColor_uint.ll
// (header: `0x000000000a14bd -- soOFlowEstimator::soOFlowEstimator_fillWithColor_uint`)
//
// Constant-fill kernel for a uint4 texture. For each thread at grid
// position (gx, gy), if the coordinate is in-bounds vs the output
// texture's width and height (unsigned comparisons — icmp ult), writes
// the uint4 `params.m_color` to output[gx, gy]. Out-of-bounds threads
// early-out without writing.
//
// -----------------------------------------------------------------------------
// Signature (%N naming from the .ll):
//   void @soOFlowEstimator::soOFlowEstimator_fillWithColor_uint(
//     %params*                  %0,    // params.m_color <4 x i32>
//     <2 x i32>                 %1,    // thread_position_in_grid (gx, gy)
//     texture2d<uint, write>    %2     // output
//   )
//
// Denorms / fast-math state (from !air.compile_options !11..!13):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable
//   air.compile.framebuffer_fetch_enable
// This kernel performs NO arithmetic — only two bounds checks and a
// single texture write.
//
// Params struct layout (from !18): a single <4 x i32> `m_color` at
// offset 0 (16-byte-aligned).
//
// Line-by-line body (%3 entry .. %14 ret):
//   %4  = extractelement <2 x i32> %1, i64 0                -> gx
//   %5  = air.get_width_texture_2d (output, 0)               -> W
//   %6  = icmp ult gx, W                                     ; note: UNSIGNED
//   br  %6, %7, %14                                          ; else ret
//   %8  = extractelement <2 x i32> %1, i64 1                -> gy
//   %9  = air.get_height_texture_2d(output, 0)               -> H
//   %10 = icmp ult gy, H                                     ; UNSIGNED
//   br  %10, %11, %14                                        ; else ret
//   %12 = gep params.m_color
//   %13 = load <4 x i32> m_color
//   air.write_texture_2d.u.v4i32(output, coord, m_color, 0, 2)
//   br  label %14 ; ret void

/**
 * Uniform buffer matching
 * `%struct.soOFlowEstimator::soOFlowEstimator_fillWithColor_params_uint`
 * (!18): a single `<4 x i32> m_color`.
 */
export interface SoOFlowEstimatorFillWithColorUintParams {
  /** field 0 — `<4 x i32> m_color` (four u32-valued lanes). */
  readonly color: readonly [number, number, number, number];
}

/**
 * AIR `air.write_texture_2d.u.v4i32` callback — stores a uint4 at integer
 * pixel (x, y) of the destination texture at mip level 0.
 */
export type WriteU32Fn<T> = (texture: T, x: number, y: number, rgba: readonly [number, number, number, number]) => void;

/** AIR `air.get_width_texture_2d(tex, i32 0)` callback. */
export type TexWidthFn<T> = (texture: T) => number;

/** AIR `air.get_height_texture_2d(tex, i32 0)` callback. */
export type TexHeightFn<T> = (texture: T) => number;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_fillWithColor_uint`.
 * Constant-fills a uint4 texture at the thread's grid position with
 * `params.color`. Out-of-bounds threads (unsigned-compare vs the output
 * texture's width/height at mip 0) early-out.
 */
export function soOFlowEstimator__soOFlowEstimator_fillWithColor_uint<TOut>(
  params: SoOFlowEstimatorFillWithColorUintParams,   // %0
  gridPos: readonly [number, number],                 // %1
  output: TOut,                                       // %2
  write: WriteU32Fn<TOut>,
  getWidth: TexWidthFn<TOut>,
  getHeight: TexHeightFn<TOut>,
): void {
  const gx = gridPos[0] | 0;              // %4
  // %5 = get_width(output, 0) ; %6 = icmp ult gx, W (UNSIGNED)
  const W = getWidth(output) | 0;
  if (!((gx >>> 0) < (W >>> 0))) return;

  const gy = gridPos[1] | 0;              // %8
  // %9 = get_height(output, 0) ; %10 = icmp ult gy, H (UNSIGNED)
  const H = getHeight(output) | 0;
  if (!((gy >>> 0) < (H >>> 0))) return;

  // %12/%13 = load params.m_color ; air.write_texture_2d.u.v4i32(output, coord, m_color, 0, 2)
  write(output, gx, gy, params.color);
  // br label %14 ; ret void
}
