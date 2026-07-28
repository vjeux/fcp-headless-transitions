// @shader soOFlowEstimator::soOFlowEstimator_fillWithColor (HeliumSenso) @0x000000000a058d
// Source IR: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_fillWithColor.ll
// (extracted from HeliumSenso.framework/Versions/A/Resources/default.metallib)
/**
 * @shader soOFlowEstimator::soOFlowEstimator_fillWithColor (HeliumSenso)
 *
 * Trivial "fill a write-only 2D texture with a constant RGBA colour" kernel.
 * Direct TS mapping of the IR: per-dispatched-thread bounds check against the
 * texture's (width, height); if inside, write params.m_color at that pixel.
 * No math, no sampling — just a bounds-guarded texture write.
 *
 * Signature from !air.kernel (!14..!20):
 *   kernel void soOFlowEstimator_fillWithColor(
 *       constant params  *params   [[buffer(0)]],
 *       uint2             coord    [[thread_position_in_grid]],
 *       texture2d<float,write> output [[texture(0)]]);
 *
 * params struct (16 bytes, 16-byte aligned) — from !17/!18:
 *   +0   float4  m_color            — fill colour (RGBA)
 *
 * Denorms / fast-math (from !11..!13):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_disable   — but there are NO fp arithmetic ops in the
 *   body (only a load and a texture write), so no Math.fround is needed.
 *
 * Control flow (from IR blocks %3, %7, %11, %14):
 *   %4  = coord.x                                              (extractelement lane 0)
 *   %5  = air.get_width_texture_2d(output, 0)                  (i32)
 *   %6  = icmp ult i32 coord.x, width                          (unsigned <)
 *   br %6, label %7, label %14                                 (out-of-bounds → skip)
 *   %8  = coord.y                                              (extractelement lane 1)
 *   %9  = air.get_height_texture_2d(output, 0)                 (i32)
 *   %10 = icmp ult i32 coord.y, height                         (unsigned <)
 *   br %10, label %11, label %14                               (out-of-bounds → skip)
 *   %12 = &params->m_color                                     (getelementptr, field 0)
 *   %13 = load <4 x float> %12, align 16                       (params.m_color)
 *         air.write_texture_2d.v4f32(output, coord, %13, 0, 2) (mip=0, dim=2)
 *   ret
 */

/** params struct (16 bytes, 16-byte aligned). @IR !17/!18 */
export interface soOFlowEstimator_fillWithColor_Params {
  /** float4 at +0: fill colour (RGBA). @IR %13 (load <4 x float> at struct field 0) */
  m_color: [number, number, number, number];
}

/**
 * Write function contract — one 2D write of an RGBA float4 at a uint2 pixel.
 * (`air.write_texture_2d.v4f32` with mip=0, dim=2 — IR call after both bounds
 * checks succeed.)
 */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soOFlowEstimator_fillWithColor — one dispatched thread.
 *
 * @param params        the constant-buffer params
 * @param coord         the [[thread_position_in_grid]] uint2 = (coord.x, coord.y)
 * @param textureWidth  output.get_width(0) — @IR %5
 * @param textureHeight output.get_height(0) — @IR %9
 * @param write_output  writer for the output texture
 *
 * @IR entire function @0x000000000a058d.
 */
export function soOFlowEstimator_fillWithColor(
  params: soOFlowEstimator_fillWithColor_Params,
  coord: [number, number],
  textureWidth: number,
  textureHeight: number,
  write_output: Write2D,
): void {
  // Coerce grid coords to i32-of-unsigned (uint2 in IR); `icmp ult` is UNSIGNED,
  // so use >>> 0 before comparison to mirror `ult` semantics literally.
  // @IR %4 = extractelement <2 x i32> coord, 0
  const cx = coord[0] >>> 0;
  // @IR %5 = air.get_width_texture_2d(output, 0)
  const w = textureWidth >>> 0;
  // @IR %6 = icmp ult i32 %4, %5   ;  br i1 %6, label %7, label %14
  if (cx < w) {
    // @IR %8 = extractelement <2 x i32> coord, 1
    const cy = coord[1] >>> 0;
    // @IR %9 = air.get_height_texture_2d(output, 0)
    const h = textureHeight >>> 0;
    // @IR %10 = icmp ult i32 %8, %9  ;  br i1 %10, label %11, label %14
    if (cy < h) {
      // @IR %12 = getelementptr params, i64 0, i32 0
      // @IR %13 = load <4 x float>, align 16   (params.m_color)
      const color = params.m_color;
      // @IR tail call void @air.write_texture_2d.v4f32(output, coord, %13, 0, 2)
      write_output(
        [coord[0] | 0, coord[1] | 0],
        [color[0], color[1], color[2], color[3]],
      );
    }
  }
  // @IR label %14: ret void
}
