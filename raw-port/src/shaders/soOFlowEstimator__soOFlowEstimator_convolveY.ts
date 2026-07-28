// @shader soOFlowEstimator::soOFlowEstimator_convolveY (HeliumSenso) @0x000000000b254d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_convolveY.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000b254d -- soOFlowEstimator::
// soOFlowEstimator_convolveY:` — that is the shader's entry offset in
// the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable` means
// standard IEEE-754 fp32 semantics — direct TS mapping via Math.fround
// on every fadd/fmul; the single `llvm.fmuladd.v2f32` at %46 is
// documented as fp32-fused (the intrinsic contract is a single
// unrounded multiply-add) — modelled here as `Math.fround(a*b + c)`
// per raw-port/army/SHADERS.md.
//
// STRUCT-TYPE-NAME REUSE TRAP (see SHADERS.md): the AIR IR names the
// params struct `soOFlowEstimator::soOFlowEstimator_convolveX_params`
// (X, not Y) due to Apple's layout-compatible AIR-struct dedup, but
// the authoritative `!17`/`!18` field metadata says
// `soOFlowEstimator_convolveY_params` with fields:
//   offset 0: int m_numWeights   -- one-sided weight count N; the
//                                    kernel is symmetric of full width
//                                    (2*N - 1) covering [-(N-1), N-1].
//                                    The weights buffer stores just
//                                    w[0..N-1] and the loop reads
//                                    w[|k|] to fold the two halves.
//   offset 4: int m_dimX         -- destination X extent (exclusive).
//   offset 8: int m_dimY         -- destination Y extent (exclusive).
//
// Compute kernel signature (from !14..!23):
//   params  : constant address-space struct (see above).
//   coord   : uint2 — air.thread_position_in_grid (destination pixel).
//   sam     : sampler (index 0).
//   input   : texture2d<float, sample> index 0 — source image.
//   output  : texture2d<float, write>  index 1 — destination image.
//   weights : device float* (buffer index 1, read_write) — N floats,
//             one-sided symmetric convolution weights.
//
// AIR intrinsics used:
//   air.abs.s.i32(i32)                        -> |k|.
//   air.max.s.v2i32 / air.min.s.v2i32         -- signed 2-lane clamps.
//   air.convert.f.v2f32.s.v2i32               -- SIGNED int->float
//                                                (integer sample coord
//                                                 to fp32; the .s.
//                                                 variant preserves
//                                                 sign; UV never wraps
//                                                 because it has been
//                                                 clamped to [0, dim-1]
//                                                 immediately upstream).
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//   llvm.fmuladd.v2f32(a, b, c)               -- fused multiply-add on
//                                                the .xy lanes of the
//                                                accumulator.
//   air.write_texture_2d.v4f32(tex, coord, rgba, 0, 2) — writes result.
//
// Line-by-line map of the .ll body:
//
//   block %6 (entry):
//     %7  = extractelement coord, 0                -- coord.x
//     %9  = load params.m_dimX
//     %10 = icmp slt coord.x, m_dimX               -- X in-bounds?
//     br i1 %10, label %11, label %52              -- OOB: ret.
//
//   block %11:
//     %12 = extractelement coord, 1                -- coord.y
//     %14 = load params.m_dimY
//     %15 = icmp slt coord.y, m_dimY               -- Y in-bounds?
//     br i1 %15, label %16, label %52              -- OOB: ret.
//
//   block %16 (both bounds pass):
//     %17 = coord + <-1, -1>                       -- (dimX-1, dimY-1)
//                                                     upper clamp bound
//                                                     is `coord - 1`?
//                                                     No — the LOOP
//                                                     min-clamps against
//                                                     %17. But %17 is
//                                                     coord.xy - <1,1>,
//                                                     NOT dim-1 — the
//                                                     shader relies on
//                                                     the caller having
//                                                     already set the
//                                                     dim-1 clamp into
//                                                     %17 via how it
//                                                     handles the last
//                                                     sample. Preserved
//                                                     literally: min
//                                                     clamp target is
//                                                     coord.xy - 1.
//                                                     (This clamps the
//                                                     rolling sample
//                                                     coordinate at
//                                                     min(., coord - 1),
//                                                     preventing the
//                                                     positive-k half
//                                                     from stepping
//                                                     past the current
//                                                     pixel; see the
//                                                     paired loop.)
//     %19 = load params.m_numWeights               -- N
//     %20 = 1 - N                                  -- kMin (= -(N-1))
//     %21 = icmp slt (1 - N), N                    -- N > 0.5, i.e.
//                                                     N >= 1. Loop
//                                                     skipped if N < 1.
//     br i1 %21, label %22, label %26
//
//   block %22 (loop preheader, N >= 1):
//     %23 = N - 1                                  -- kMax
//     %24 = <0, N-1>                               -- 2-lane vec.
//     %25 = coord - <0, N-1>                       -- initial sample
//                                                     coord: (coord.x,
//                                                     coord.y - (N-1)).
//     br label %28
//
//   block %28 (loop body, iterates k = kMin .. kMax inclusive):
//     %29 = phi <2 x i32> [%49 next, %25 initial]  -- rolling sample xy
//     %30 = phi <4 x float> [%48 acc, 0 initial]   -- rolling acc <a,b,c,d>
//     %31 = phi i32 [%50 next, %20 initial]        -- rolling k
//     %32 = air.abs.s.i32 k                        -- |k|
//     %34 = &weights[|k|]                          -- gep
//     %35 = load weights[|k|]                      -- weight scalar.
//     %36 = air.max.s.v2i32 %29, <0, 0>            -- max-clamp .xy to 0.
//     %37 = air.min.s.v2i32 %36, %17               -- min-clamp .xy to
//                                                     coord.xy - 1.
//     %38 = air.convert.f.v2f32.s.v2i32 %37        -- SIGNED int->float.
//     %39 = %38 + <0.5, 0.5>                       -- half-pixel bias.
//     %40 = air.sample_texture_2d.v4f32(input, sam, %39 uv, ...)
//     %41 = extractvalue %40, 0                    -- <4 x float> rgba.
//     %42 = shufflevector rgba, undef, <0, 1>      -- take rg.
//     %43 = insertelement undef, w, 0
//     %44 = shufflevector %43, undef, <0, 0>       -- splat w to <w, w>.
//     %45 = shufflevector %30, undef, <0, 1>       -- acc.xy.
//     %46 = llvm.fmuladd.v2f32 <r,g>, <w,w>, acc.xy
//                                                  -- new = r*w+acc.x,
//                                                     g*w+acc.y.
//     %47 = shufflevector %46, undef, <0, 1, u, u> -- lift to <4 x f>
//                                                     with lanes 2/3 undef.
//     %48 = shufflevector %47, %30, <0, 1, 6, 7>   -- lanes 0/1 from new,
//                                                     lanes 2/3 from prev
//                                                     acc (preserved). So
//                                                     only .xy accumulate.
//     %49 = %29 + <0, 1>                           -- advance sample.y by 1.
//     %50 = k + 1
//     %51 = icmp eq (k+1), N                       -- past kMax?
//     br i1 %51, label %26, label %28
//
//   block %26 (loop exit):
//     %27 = phi <4 x float> [ 0 (skip path), %48 (loop path) ]
//     air.write_texture_2d.v4f32(output, coord, %27, 0, 2)
//     br label %52
//
//   block %52: ret void.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_convolveY` — mirrors the AIR
 * struct at !18 (12-byte packed record, four-byte fields). The AIR
 * struct-type name in the IR is the layout-compatible sibling
 * `soOFlowEstimator_convolveX_params`; the field metadata in !18 is
 * authoritative (per raw-port/army/SHADERS.md).
 */
export interface SoOFlowEstimatorConvolveYParams {
  m_numWeights: number; // offset 0 : int (one-sided count N)
  m_dimX: number;       // offset 4 : int (X extent, exclusive)
  m_dimY: number;       // offset 8 : int (Y extent, exclusive)
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the
 * float texture at (u, v) with the bound sampler and returns the
 * four rgba lanes. Only the .r and .g lanes are consumed by the
 * body (see the .xy shufflevector at %42).
 */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Callback for AIR `air.write_texture_2d.v4f32` — writes the four
 * rgba lanes at integer pixel coord (x, y) in the destination.
 */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_convolveY`.
 *
 * Performs a symmetric 1-D convolution along the Y axis at every
 * destination pixel (`coord.x`, `coord.y`) that lies inside
 * `[0, m_dimX) x [0, m_dimY)`. The weights buffer stores the
 * one-sided half `w[0..N-1]`; the full kernel spans
 * `k = -(N-1) .. N-1` and reads `w[|k|]` per tap (folding the two
 * symmetric halves into the same weight lookup).
 *
 * The accumulator is a <4 x float> vector but only the .r and .g
 * lanes accumulate (see the `<0, 1, 6, 7>` shufflevector at %48).
 * The .b and .a lanes are held at zero for the full loop and are
 * written out as zero.
 *
 * The sample coordinate is clamped to
 * `[<0, 0>, coord - <1, 1>]` before the fp32 half-pixel bias —
 * the min-clamp target is `coord - <1, 1>` as written in the IR
 * at `%17`, preserved literally.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_convolveY (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_convolveY<TIn, TOut>(
  params: SoOFlowEstimatorConvolveYParams,
  coord: [number, number],
  input: TIn,
  output: TOut,
  weights: Float32Array | number[],
  sampleInput: SampleFloatTex2D<TIn>,
  writeOutput: WriteFloatTex2D<TOut>,
): void {
  // %7, %9, %10 : coord.x vs m_dimX bounds check.
  //   The IR compare is `icmp slt` (signed less-than) — preserve.
  const coordX = coord[0] | 0;
  const dimX = params.m_dimX | 0;
  if (!(coordX < dimX)) {
    // br i1 %10 false -> label %52 : ret void.
    return;
  }

  // %12, %14, %15 : coord.y vs m_dimY bounds check (also signed slt).
  const coordY = coord[1] | 0;
  const dimY = params.m_dimY | 0;
  if (!(coordY < dimY)) {
    // br i1 %15 false -> label %52 : ret void.
    return;
  }

  // %17 = coord - <1, 1> -- upper (min-clamp) bound for the rolling
  //   sample coordinate. Preserved literally as written in the IR.
  const clampMaxX = (coordX - 1) | 0;
  const clampMaxY = (coordY - 1) | 0;

  // %19 = load params.m_numWeights ; %20 = 1 - N ; %21 = slt (1-N), N.
  //   The loop runs only when N >= 1 (i.e. 1 - N < N).
  const N = params.m_numWeights | 0;
  const kMin = (1 - N) | 0;
  const runLoop = kMin < N;

  // Accumulator lanes 0/1 accumulate; lanes 2/3 are held at zero for
  // the entire loop (see the <0,1,6,7> shuffle at %48 and the zero
  // init at %30).
  let accR = Math.fround(0);
  let accG = Math.fround(0);

  if (runLoop) {
    // %23 = N - 1 = kMax. %25 = coord - <0, N-1> = initial sample xy.
    let sampX = coordX | 0;
    let sampY = (coordY - (N - 1)) | 0;
    let k = kMin | 0;

    // Loop body (block %28). Iterates while (k+1) != N, i.e. while
    // k <= N - 2 initially and one final iteration at k = N - 1
    // triggers the `br i1 %51 true -> label %26` exit.
    while (true) {
      // %32 = air.abs.s.i32 k -- |k|.
      const absK = Math.abs(k) | 0;

      // %35 = load weights[|k|].
      const w = Math.fround(weights[absK]);

      // %36 = max(<sampX, sampY>, <0, 0>) -- signed max.
      // %37 = min(%36, <clampMaxX, clampMaxY>) -- signed min.
      const clampedX = Math.max(sampX, 0) | 0;
      const clampedY = Math.max(sampY, 0) | 0;
      const finalX = Math.min(clampedX, clampMaxX) | 0;
      const finalY = Math.min(clampedY, clampMaxY) | 0;

      // %38 = air.convert.f.v2f32.s.v2i32 -- SIGNED int->float.
      //   Math.fround narrows to fp32; sign preserved by the JS
      //   number's native signedness (`| 0` above kept the i32
      //   sign intact for negative -0-then-clamped cases, though
      //   the clamp guarantees >= 0 at this point).
      const uFloat = Math.fround(finalX);
      const vFloat = Math.fround(finalY);

      // %39 = %38 + <0.5, 0.5> -- half-pixel-centre bias.
      const uBias = Math.fround(uFloat + Math.fround(0.5));
      const vBias = Math.fround(vFloat + Math.fround(0.5));

      // %40 = air.sample_texture_2d.v4f32(input, sam, uv, ...)
      // %41 = extractvalue %40, 0 -- <4 x float> rgba.
      const rgba = sampleInput(input, uBias, vBias);

      // %42 = shufflevector rgba, undef, <0, 1> -- take rg.
      const r = Math.fround(rgba[0]);
      const g = Math.fround(rgba[1]);

      // %43/%44 = splat w to <w, w>.
      // %45 = acc.xy from %30.
      // %46 = llvm.fmuladd.v2f32(<r,g>, <w,w>, acc.xy)
      //   The `llvm.fmuladd` intrinsic contract is one rounding at
      //   the end; modelled as `Math.fround(a*b + c)` in fp32.
      accR = Math.fround(r * w + accR);
      accG = Math.fround(g * w + accG);

      // %48 = shufflevector %47, %30, <0,1,6,7> -- keep lanes 2/3
      //   from prev acc. Since prev init was <0,0,0,0> and neither
      //   lane 2 nor lane 3 is ever written, they stay zero.

      // %49 = <sampX, sampY> + <0, 1> -- only Y advances.
      sampY = (sampY + 1) | 0;
      // sampX unchanged.

      // %50 = k + 1 ; %51 = icmp eq (k+1), N.
      k = (k + 1) | 0;
      if (k === N) {
        // br i1 %51 true -> label %26 (exit).
        break;
      }
      // br i1 %51 false -> label %28 (continue).
    }
  }

  // Block %26 : phi %27 = 0 (skip) or accumulator (loop). Written as
  //   <accR, accG, 0, 0>.
  writeOutput(output, coordX, coordY, [accR, accG, Math.fround(0), Math.fround(0)]);

  // br label %52 : ret void.
}
