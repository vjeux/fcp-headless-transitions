// @shader soOFlowEstimator::soOFlowEstimator_resampleImageY (HeliumSenso) @0x000000000a4d2d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_resampleImageY.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000a4d2d -- soOFlowEstimator::
// soOFlowEstimator_resampleImageY:` — that is the shader's entry
// offset in the metallib. Compile options: `denorms_disable`,
// `fast_math_disable`, `framebuffer_fetch_enable`. fast-math OFF, so
// every fp32 op is bit-exact IEEE-754 (Math.fround on each
// intermediate); the single `llvm.fmuladd.v4f32` intrinsic (%45) is
// modelled as unrounded `Math.fround(a*b + c)` per SHADERS.md.
//
// STRUCT-TYPE-NAME REUSE TRAP (see SHADERS.md): the AIR IR names the
// params struct
// `soOFlowEstimator::soOFlowEstimator_resampleImageX_params`
// (X, not Y) due to Apple's layout-compatible AIR-struct dedup, but
// the authoritative `!17`/`!18` field metadata says
// `soOFlowEstimator_resampleImageY_params` with one field:
//   offset 0: int m_weightArrayDimsX  -- per-row stride (in fp32 slots)
//                                        of the weights buffer's
//                                        variable-length row records.
//
// Signature (from !14..!23):
//   params  : constant address-space struct (see above).
//   coord_  : uint2 -- air.thread_position_in_grid (dest pixel).
//   sam     : sampler (index 0).
//   input   : texture2d<float, sample> index 0 -- source image.
//   output  : texture2d<float, write>  index 1 -- destination image.
//   weights : device float* (buffer index 1, read_write) -- per-row
//             variable-length weight records. Each row (indexed by
//             the DESTINATION y-coord) is a block of
//             `m_weightArrayDimsX` fp32 slots; the first two slots
//             encode `startY` and `endY` as fp32 (round-toward-zero
//             fptosi is applied on load — see silent-correctness note
//             below), and the remaining `m_weightArrayDimsX - 2` slots
//             are the per-source-row weight coefficients starting at
//             `srcY = startY`.
//
// AIR intrinsics used:
//   air.get_width_texture_2d(tex, lod)         -- dest width  (i32).
//   air.get_height_texture_2d(tex, lod)        -- dest height (i32).
//   air.convert.s.i32.f.f32(f)                 -- SIGNED fp32->i32 (fptosi
//                                                 = round toward zero).
//   air.convert.f.v2f32.s.v2i32(v)             -- SIGNED int->float 2-lane.
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//   llvm.fmuladd.v4f32(a, b, c)                -- fused fp32 mul-add per lane.
//   air.write_texture_2d.v4f32(tex, coord, rgba, 0, 2) -- write result.
//
// Silent-correctness notes (SHADERS.md):
//   - Bounds guards at %9 (`icmp ult` coord.x < output.width) and %13
//     (`icmp ult` coord.y < output.height) are BOTH UNSIGNED — preserved.
//   - Loop-exit compare at %27 (`icmp slt` startY, endY) and iteration
//     compare at %47 (`icmp eq` y+1, endY) are BOTH SIGNED — preserved
//     (the loop is degenerate if startY >= endY: %29 phi picks the
//     zero constant from %14 and writes rgba = <0,0,0,0>).
//   - The `air.convert.s.i32.f.f32` on the fp32-encoded startY/endY
//     is fptosi (round-toward-zero) — emulated with `Math.trunc(x)|0`
//     per SHADERS.md.
//   - The 4-lane fmuladd broadcasts a SCALAR weight across all four
//     rgba lanes (via `shufflevector <4 x i32> zeroinitializer` at %44),
//     so the accumulator is a genuine per-channel weighted sum with
//     the SAME per-source-row weight applied to all four channels.
//
// Line-by-line map of the .ll body:
//
//   block %6 (entry):
//     %7  = extractelement coord_, 0
//     %8  = air.get_width_texture_2d(output, 0)
//     %9  = icmp ult coord.x, output.width       -- UNSIGNED.
//     br i1 %9, label %10, label %48             -- OOB: ret.
//
//   block %10:
//     %11 = extractelement coord_, 1
//     %12 = air.get_height_texture_2d(output, 0)
//     %13 = icmp ult coord.y, output.height      -- UNSIGNED.
//     br i1 %13, label %14, label %48            -- OOB: ret.
//
//   block %14 (both bounds pass):
//     %16 = load params.m_weightArrayDimsX
//     %17 = m_weightArrayDimsX * coord.y         -- signed i32 mul.
//     %18 = sext i32 %17 to i64
//     %19 = weights + %18                        -- row base pointer.
//     %20 = %19 + 2                              -- weights slot 2 base.
//     %21 = %20 - 2 = %19 + 0                    -- weights[+0] : fp32.
//     %22 = load float @%21                      -- startY as fp32.
//     %23 = fptosi %22                           -- startY as i32.
//     %24 = %20 - 1 = %19 + 1                    -- weights[+1] : fp32.
//     %25 = load float @%24                      -- endY as fp32.
//     %26 = fptosi %25                           -- endY as i32.
//     %27 = icmp slt %23, %26                    -- start < end?
//     br i1 %27, label %30, label %28            -- degenerate -> zero write.
//
//   block %28 (join / write):
//     %29 = phi <4 x float>
//              [ zeroinitializer, %14 ]   -- degenerate path: rgba = 0.
//              [ %45,             %30 ]   -- loop path: final acc.
//     air.write_texture_2d.v4f32(output, coord_, %29, 0, 2)
//     br label %48
//
//   block %30 (loop body — iterates y = startY .. endY-1):
//     %31 = phi <2 x i32> [ %34, %30 ], [ coord_, %14 ]     -- (coord.x, y).
//     %32 = phi i32       [ %46, %30 ], [ %23,    %14 ]     -- y (i32).
//     %33 = phi <4 x float>[ %45, %30 ], [ zero,   %14 ]    -- accumulator.
//     %34 = insertelement %31, y, 1                          -- (coord.x, y).
//     %35 = y - startY                                       -- weight index.
//     %36 = sext %35 to i64
//     %37 = %20 + %36                                        -- &weights[base+2+idx].
//     %38 = load float @%37                                  -- w[idx].
//     %39 = air.convert.f.v2f32.s.v2i32(<coord.x, y>)        -- fp32 UV.
//     %40 = %39 + <0.5, 0.5>                                 -- pixel-centre UV.
//     %41 = air.sample_texture_2d(input, sam, %40, ...)
//     %42 = extractvalue %41, 0                              -- rgba.
//     %43 = insertelement undef, w, 0
//     %44 = shufflevector %43, zero <4 x i32>                -- <w,w,w,w>.
//     %45 = llvm.fmuladd.v4f32(rgba, <w,w,w,w>, acc)         -- acc += w * rgba.
//     %46 = y + 1
//     %47 = icmp eq %46, endY                                -- loop exit test.
//     br i1 %47, label %28, label %30                        -- fall-through.
//
//   block %48: ret void.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_resampleImageY` — mirrors the
 * AIR struct at !18 (4-byte record with one four-byte field). The
 * AIR struct-type name in the IR is the layout-compatible sibling
 * `soOFlowEstimator_resampleImageX_params`; the field metadata in
 * !18 is authoritative (per raw-port/army/SHADERS.md).
 */
export interface SoOFlowEstimatorResampleImageYParams {
  m_weightArrayDimsX: number; // offset 0 : int (per-row stride in fp32 slots)
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the float
 * texture at (u, v) with the bound sampler and returns the four rgba
 * lanes.
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
 * Callback for AIR `air.get_width/height_texture_2d(tex, lod=0)`.
 */
export type GetTexDim<T> = (texture: T) => number;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_resampleImageY`.
 *
 * Vertical (Y-axis) 1-D convolution / resample of a four-channel
 * image at every in-bounds destination pixel `coord_`. For each
 * destination row `coord.y` the weights buffer stores a variable-
 * length record at offset `m_weightArrayDimsX * coord.y`:
 *
 *   weights[base + 0]                : fp32-encoded startY (fptosi'd
 *                                      to i32 on load — the start
 *                                      row in the source image).
 *   weights[base + 1]                : fp32-encoded endY  (fptosi'd
 *                                      to i32 — one-past-last row).
 *   weights[base + 2 + (y - startY)] : per-source-row weight (fp32)
 *                                      for source row `y`.
 *
 * At each destination pixel the kernel accumulates
 *   acc = sum over y in [startY, endY)
 *           weights[y - startY] * input[coord.x, y]  (per-channel)
 * and writes `acc` to output. When `startY >= endY` the accumulator
 * stays at zero and the shader writes `<0, 0, 0, 0>`.
 *
 * The scalar weight is broadcast across all four rgba lanes, so this
 * is a per-channel weighted sum, not a projection.
 *
 * Denorms disabled + fast-math disabled per !air.compile_options —
 * every fp32 op is bit-exact IEEE-754.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_resampleImageY (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_resampleImageY<TIn, TOut>(
  params: SoOFlowEstimatorResampleImageYParams,
  coord_: [number, number],
  input: TIn,
  output: TOut,
  weights: Float32Array | number[],
  sampleInput: SampleFloatTex2D<TIn>,
  writeOutput: WriteFloatTex2D<TOut>,
  getOutputWidth: GetTexDim<TOut>,
  getOutputHeight: GetTexDim<TOut>,
): void {
  // %7, %9  : coord.x < output.width (UNSIGNED slt).
  const coordX = coord_[0] >>> 0;
  const dstW = getOutputWidth(output) >>> 0;
  if (!(coordX < dstW)) {
    // br i1 %9 false -> label %48 : ret void.
    return;
  }

  // %11, %13 : coord.y < output.height (UNSIGNED slt).
  const coordY = coord_[1] >>> 0;
  const dstH = getOutputHeight(output) >>> 0;
  if (!(coordY < dstH)) {
    // br i1 %13 false -> label %48 : ret void.
    return;
  }

  // %16, %17 : row base index into weights = m_weightArrayDimsX * coord.y.
  //   %17 is a signed i32 multiply — preserve `nsw` behaviour by
  //   coercing coordY back to signed here (the ult guard above already
  //   pinned it into [0, dstH) so it fits in i32 with room).
  const dims = params.m_weightArrayDimsX | 0;
  const coordYi = coordY | 0;
  const rowBase = Math.imul(dims, coordYi) | 0;

  // %21 = &weights[rowBase + 0]  ; %22 = load fp32 ; %23 = fptosi -> i32.
  const startY = Math.trunc(Math.fround(weights[rowBase + 0])) | 0;
  // %24 = &weights[rowBase + 1] ; %25 = load fp32 ; %26 = fptosi -> i32.
  const endY = Math.trunc(Math.fround(weights[rowBase + 1])) | 0;

  // %27 : icmp slt startY, endY -- if false, degenerate path: write zeros.
  if (!(startY < endY)) {
    // block %28 with %29 = phi <zero, ...>:
    //   air.write_texture_2d.v4f32(output, coord_, <0,0,0,0>, 0, 2).
    writeOutput(output, coordX | 0, coordY | 0, [
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ]);
    return;
  }

  // Loop preheader: acc = <0,0,0,0>; y = startY.
  let accR = Math.fround(0);
  let accG = Math.fround(0);
  let accB = Math.fround(0);
  let accA = Math.fround(0);
  let y = startY | 0;

  // The loop iterates while (y + 1) != endY (falls through when equal,
  // one final store into the accumulator happens on that iteration).
  // Modelled as a while(true) with the exit test after the body,
  // matching the IR's `br i1 %47, label %28, label %30`.
  while (true) {
    // %35 = y - startY  ; %37 = &weights[rowBase + 2 + (y - startY)].
    const idx = (y - startY) | 0;
    // %38 = load float @%37.
    const w = Math.fround(weights[rowBase + 2 + idx]);

    // %39 = air.convert.f.v2f32.s.v2i32(<coord.x, y>) -- SIGNED int->float.
    // %40 = %39 + <0.5, 0.5>                          -- pixel-centre UV.
    const u = Math.fround(Math.fround(coordX | 0) + Math.fround(0.5));
    const v = Math.fround(Math.fround(y) + Math.fround(0.5));

    // %41 = air.sample_texture_2d(input, sam, %40, ...)
    // %42 = extractvalue %41, 0                       -- rgba.
    const rgba = sampleInput(input, u, v);
    const r = Math.fround(rgba[0]);
    const g = Math.fround(rgba[1]);
    const b = Math.fround(rgba[2]);
    const a = Math.fround(rgba[3]);

    // %43, %44 : broadcast w across <4 x float>.
    // %45 = llvm.fmuladd.v4f32(rgba, <w,w,w,w>, acc)
    //         -- per-lane fp32 fused multiply-add (single rounding).
    accR = Math.fround(r * w + accR);
    accG = Math.fround(g * w + accG);
    accB = Math.fround(b * w + accB);
    accA = Math.fround(a * w + accA);

    // %46 = y + 1  ; %47 = icmp eq y+1, endY.
    y = (y + 1) | 0;
    if (y === endY) {
      // br i1 %47 true -> label %28 (write and ret).
      break;
    }
    // br i1 %47 false -> label %30 (continue loop).
  }

  // block %28 (loop-exit path): %29 = phi picks %45 (final acc).
  //   air.write_texture_2d.v4f32(output, coord_, acc, 0, 2).
  writeOutput(output, coordX | 0, coordY | 0, [accR, accG, accB, accA]);
  // br label %48 (ret void).
}
