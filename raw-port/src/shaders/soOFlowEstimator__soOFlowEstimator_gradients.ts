// @shader soOFlowEstimator::soOFlowEstimator_gradients (HeliumSenso) @0x000000000aff5d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_gradients.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000aff5d -- soOFlowEstimator::
// soOFlowEstimator_gradients:` — that is the shader's entry offset
// in the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable` means
// standard IEEE-754 fp32 semantics — direct TS mapping via Math.fround
// on every fadd/fsub/fmul.
//
// STRUCT-TYPE-NAME REUSE TRAP (see SHADERS.md): the AIR IR names the
// params struct
// `soOFlowEstimator::soOFlowEstimator_medianFilterFlow_params`
// due to Apple's layout-compatible AIR-struct dedup, but the
// authoritative `!17`/`!18` field metadata says
// `soOFlowEstimator_gradients_params` with fields:
//   offset 0: int m_dimX  -- destination X extent (exclusive).
//   offset 4: int m_dimY  -- destination Y extent (exclusive).
//
// Compute kernel signature (from !14..!22):
//   params : constant address-space struct (see above).
//   coord  : uint2 — air.thread_position_in_grid (destination pixel).
//   sam    : sampler (index 0).
//   input  : texture2d<float, sample> index 0 — source scalar image
//            (only the .r channel is consumed; the sample returns
//            <4 x float> and the IR takes lane 0 at %26, %34, %44, %52).
//   grad   : texture2d<float, write>  index 1 — destination
//            two-channel gradient image; the shader packs
//            (gx, gy, gx, gy) into rgba (the g-repeated pack matches
//            the estimateTVDual2 shader's read of `.xy` from `grad`).
//
// AIR intrinsics used:
//   air.max.s.v2i32(v, <0,0>)                 -- signed lower clamp.
//   air.min.s.v2i32(v, upper)                 -- signed upper clamp.
//   air.convert.f.v2f32.s.v2i32(v)            -- SIGNED int->float 2-lane.
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//   air.write_texture_2d.v4f32(tex, coord, rgba, 0, 2) — write result.
//
// Silent-correctness notes (SHADERS.md):
//   - `air.convert.f.v2f32.s.v2i32` is SIGNED — negative coord values
//     from `coord + <-1, 0>` at the top-left corner become the correct
//     small negative fp32 before being clamped away by air.max.s /
//     air.min.s (which run BEFORE the convert). So the sign path is
//     safe and we still `Math.fround` at the end.
//   - Both axes use `icmp slt` for the in-bounds guard (uniform signed).
//   - Both edges use a symmetric max-then-min clamp against
//     `<dimX-1, dimY-1>` — Neumann reflection at the image border, so
//     that a pixel at column 0 sees itself for the left tap (gx=0 by
//     construction) and likewise on the right/top/bottom.
//
// Line-by-line map of the .ll body:
//
//   block %5 (entry):
//     %6, %7  = load m_dimX (params field 0).
//     %8, %9  = load m_dimY (params field 1).
//     %10, %11 = extractelement coord, 0 ; icmp slt coord.x, m_dimX.
//     %12, %13 = extractelement coord, 1 ; icmp slt coord.y, m_dimY.
//     %14 = select %11, %13, false           -- both in-bounds (short-circuit AND).
//     br i1 %14, label %15, label %59        -- OOB: ret.
//
//   block %15 (both bounds pass):
//     %16, %17 = build <dimX, dimY> vector.
//     %18 = <dimX, dimY> - <1, 1>            -- upper clamp bound.
//
//     -- east tap (coord + <1, 0>) --
//     %19 = coord + <1, 0>
//     %20 = air.max.s.v2i32(%19, <0,0>)
//     %21 = air.min.s.v2i32(%20, %18)
//     %22 = air.convert.f.v2f32.s.v2i32(%21)
//     %23 = %22 + <0.5, 0.5>                 -- pixel-centre UV
//     %24 = air.sample_texture_2d(input, sam, %23, ...)
//     %25 = extractvalue %24, 0
//     %26 = extractelement %25, 0            -- east.r
//
//     -- west tap (coord + <-1, 0>) --
//     %27 = coord + <-1, 0>
//     %28 = air.max.s.v2i32(%27, <0,0>)
//     %29 = air.min.s.v2i32(%28, %18)
//     %30 = air.convert.f.v2f32.s.v2i32(%29)
//     %31 = %30 + <0.5, 0.5>
//     %32 = air.sample_texture_2d(input, sam, %31, ...)
//     %33 = extractvalue %32, 0
//     %34 = extractelement %33, 0            -- west.r
//
//     %35 = fsub float %26, %34              -- east.r - west.r  (Δx * 2)
//     %36 = fmul float %35, 0.5              -- (east.r - west.r) / 2  = gx
//
//     -- south tap (coord + <0, 1>) --
//     %37 = coord + <0, 1>
//     %38 = air.max.s.v2i32(%37, <0,0>)
//     %39 = air.min.s.v2i32(%38, %18)
//     %40 = air.convert.f.v2f32.s.v2i32(%39)
//     %41 = %40 + <0.5, 0.5>
//     %42 = air.sample_texture_2d(input, sam, %41, ...)
//     %43 = extractvalue %42, 0
//     %44 = extractelement %43, 0            -- south.r
//
//     -- north tap (coord + <0, -1>) --
//     %45 = coord + <0, -1>
//     %46 = air.max.s.v2i32(%45, <0,0>)
//     %47 = air.min.s.v2i32(%46, %18)
//     %48 = air.convert.f.v2f32.s.v2i32(%47)
//     %49 = %48 + <0.5, 0.5>
//     %50 = air.sample_texture_2d(input, sam, %49, ...)
//     %51 = extractvalue %50, 0
//     %52 = extractelement %51, 0            -- north.r
//
//     %53 = fsub float %44, %52              -- south.r - north.r  (Δy * 2)
//     %54 = fmul float %53, 0.5              -- (south.r - north.r) / 2 = gy
//
//     %55..%58 = build <gx, gy, gx, gy> (four channels; broadcast pair).
//     air.write_texture_2d.v4f32(grad, coord, %58, 0, 2)
//     br label %59
//
//   block %59: ret void.

/**
 * Params buffer for `soOFlowEstimator::soOFlowEstimator_gradients` —
 * mirrors the AIR struct at !18 (8-byte packed record, two four-byte
 * fields). The AIR struct-type name in the IR is the layout-compatible
 * sibling `soOFlowEstimator_medianFilterFlow_params`; the field
 * metadata in !18 is authoritative (per raw-port/army/SHADERS.md).
 */
export interface SoOFlowEstimatorGradientsParams {
  m_dimX: number; // offset 0 : int (X extent, exclusive)
  m_dimY: number; // offset 4 : int (Y extent, exclusive)
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the float
 * texture at (u, v) with the bound sampler and returns the four rgba
 * lanes. Only the .r lane is consumed by the body.
 */
export type SampleFloatTex2D<T> = (
  texture: T,
  u: number,
  v: number,
) => [number, number, number, number];

/**
 * Callback for AIR `air.write_texture_2d.v4f32` — writes the four rgba
 * lanes at integer pixel coord (x, y) in the destination.
 */
export type WriteFloatTex2D<T> = (
  texture: T,
  x: number,
  y: number,
  rgba: [number, number, number, number],
) => void;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_gradients`.
 *
 * Central-difference spatial gradient of a scalar image (channel .r
 * only). For each in-bounds destination pixel (`coord.x`, `coord.y`)
 * inside `[0, m_dimX) x [0, m_dimY)` it reads the four immediate
 * cross-neighbours (east/west/south/north), clamped to the border
 * (Neumann reflection), and writes
 *   gx = (east.r - west.r) / 2
 *   gy = (south.r - north.r) / 2
 * broadcast as `(gx, gy, gx, gy)` to the destination rgba.
 *
 * Denorms are disabled and fast-math is disabled per the compile-
 * options metadata — every fp32 op is bit-exact IEEE-754 (Math.fround
 * on each intermediate).
 *
 * @shader soOFlowEstimator::soOFlowEstimator_gradients (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_gradients<TIn, TOut>(
  params: SoOFlowEstimatorGradientsParams,
  coord: [number, number],
  input: TIn,
  grad: TOut,
  sampleInput: SampleFloatTex2D<TIn>,
  writeGrad: WriteFloatTex2D<TOut>,
): void {
  // %7, %9 : load m_dimX, m_dimY.
  const dimX = params.m_dimX | 0;
  const dimY = params.m_dimY | 0;

  // %10, %11 : coord.x < m_dimX (signed slt).
  // %12, %13 : coord.y < m_dimY (signed slt).
  // %14      : select %11, %13, false  -- both in-bounds (short-circuit AND).
  const coordX = coord[0] | 0;
  const coordY = coord[1] | 0;
  const inX = coordX < dimX;
  const inY = coordY < dimY;
  const inBounds = inX ? inY : false;
  if (!inBounds) {
    // br i1 %14 false -> label %59 : ret void.
    return;
  }

  // %18 = <dimX, dimY> - <1, 1>  -- upper clamp bound (last valid index).
  const maxX = (dimX - 1) | 0;
  const maxY = (dimY - 1) | 0;

  // %19..%26 : east tap (coord + <1, 0>).
  const eastRawX = (coordX + 1) | 0;
  const eastRawY = (coordY + 0) | 0;
  const eastClampedX = Math.min(Math.max(eastRawX, 0), maxX) | 0;
  const eastClampedY = Math.min(Math.max(eastRawY, 0), maxY) | 0;
  const eastU = Math.fround(Math.fround(eastClampedX) + Math.fround(0.5));
  const eastV = Math.fround(Math.fround(eastClampedY) + Math.fround(0.5));
  const eastRGBA = sampleInput(input, eastU, eastV);
  const eastR = Math.fround(eastRGBA[0]);

  // %27..%34 : west tap (coord + <-1, 0>).
  const westRawX = (coordX - 1) | 0;
  const westRawY = (coordY + 0) | 0;
  const westClampedX = Math.min(Math.max(westRawX, 0), maxX) | 0;
  const westClampedY = Math.min(Math.max(westRawY, 0), maxY) | 0;
  const westU = Math.fround(Math.fround(westClampedX) + Math.fround(0.5));
  const westV = Math.fround(Math.fround(westClampedY) + Math.fround(0.5));
  const westRGBA = sampleInput(input, westU, westV);
  const westR = Math.fround(westRGBA[0]);

  // %35 = fsub eastR, westR  ; %36 = fmul (%35, 0.5)  -- gx.
  const gx = Math.fround(Math.fround(eastR - westR) * Math.fround(0.5));

  // %37..%44 : south tap (coord + <0, 1>).
  const southRawX = (coordX + 0) | 0;
  const southRawY = (coordY + 1) | 0;
  const southClampedX = Math.min(Math.max(southRawX, 0), maxX) | 0;
  const southClampedY = Math.min(Math.max(southRawY, 0), maxY) | 0;
  const southU = Math.fround(Math.fround(southClampedX) + Math.fround(0.5));
  const southV = Math.fround(Math.fround(southClampedY) + Math.fround(0.5));
  const southRGBA = sampleInput(input, southU, southV);
  const southR = Math.fround(southRGBA[0]);

  // %45..%52 : north tap (coord + <0, -1>).
  const northRawX = (coordX + 0) | 0;
  const northRawY = (coordY - 1) | 0;
  const northClampedX = Math.min(Math.max(northRawX, 0), maxX) | 0;
  const northClampedY = Math.min(Math.max(northRawY, 0), maxY) | 0;
  const northU = Math.fround(Math.fround(northClampedX) + Math.fround(0.5));
  const northV = Math.fround(Math.fround(northClampedY) + Math.fround(0.5));
  const northRGBA = sampleInput(input, northU, northV);
  const northR = Math.fround(northRGBA[0]);

  // %53 = fsub southR, northR ; %54 = fmul (%53, 0.5) -- gy.
  const gy = Math.fround(Math.fround(southR - northR) * Math.fround(0.5));

  // %55..%58 : (gx, gy, gx, gy).
  // air.write_texture_2d.v4f32(grad, coord, %58, 0, 2).
  writeGrad(grad, coordX, coordY, [gx, gy, gx, gy]);
  // br label %59 (ret void).
}
