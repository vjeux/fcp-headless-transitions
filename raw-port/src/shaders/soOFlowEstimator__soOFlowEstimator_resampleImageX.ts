// @shader soOFlowEstimator::soOFlowEstimator_resampleImageX (HeliumSenso) @0x000000000a39bd
// Source IR: raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_resampleImageX.ll
// (extracted from HeliumSenso.framework/Versions/A/Resources/default.metallib)
/**
 * @shader soOFlowEstimator::soOFlowEstimator_resampleImageX (HeliumSenso)
 *
 * Horizontal separable resampler: for each output pixel (coord.x, coord.y),
 * fetches the per-column tap table produced by
 * `soOFlowEstimator_genBlurWeights` (see companion shader) and integrates
 *   output(coord.x, coord.y) = Σ  weights[tapBase + (i - first)]
 *                                  · sample(input, (i+0.5, coord.y+0.5))
 *   for i in [first, last)
 * where `first = (i32)weights[tapBase-2]`, `last = (i32)weights[tapBase-1]`
 * and `tapBase = dimX * coord.x + 2` — i.e. the marker layout produced
 * verbatim by the tap-table generator. Sampling is a linear-sampler
 * pixel-centre-snapped fetch (uv = (i + 0.5, coord.y + 0.5) in unnormalized
 * pixel coords, i.e. LINEAR at integer input columns → nearest-neighbour
 * along X, bilinear along Y).
 *
 * If `first >= last` (empty tap range) the accumulator stays zero and
 * output(coord) = <0,0,0,0>.
 *
 * Signature from !air.kernel (!14..!23):
 *   kernel void soOFlowEstimator_resampleImageX(
 *       constant params       *params   [[buffer(0)]],
 *       uint2                  coord    [[thread_position_in_grid]],
 *       sampler                sam      [[sampler(0)]],
 *       texture2d<float,sample> input   [[texture(0)]],
 *       texture2d<float,write>  output  [[texture(1)]],
 *       device float          *weights  [[buffer(1), read_write]]);
 *
 * params struct (4 bytes, 4-byte aligned) — from !17/!18:
 *   +0   int   m_weightArrayDimsX   — per-column stride into `weights`.
 *
 * Denorms / fast-math (from !11..!13):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_disable   — strict IEEE-754; fp32-narrow via
 *   Math.fround.
 */

/** params struct (4 bytes, 4-byte aligned). @IR !17/!18 */
export interface soOFlowEstimator_resampleImageX_Params {
  /** int at +0: per-column stride into `weights`. @IR %16 (load i32 at offset 0) */
  m_weightArrayDimsX: number;
}

/**
 * Sample function contract — one 2D linear-sampled fetch returning RGBA
 * float4. The IR call `air.sample_texture_2d.v4f32` uses an unnormalized
 * pixel-space uv (see the `+ 0.5` bias at %40) with LOD 0.0.
 * @IR %41 — the sampler-bound reader is `sam`+`input`.
 */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Write function contract — one 2D write of an RGBA float4 at an int2 pixel.
 * (`air.write_texture_2d.v4f32` with mip=0, dim=2 — IR %48-pre.)
 */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * fp32-narrowed fmuladd — mirrors `llvm.fmuladd.v4f32` at IR %45. We split
 * a*b + c per-lane and narrow at each boundary (fast-math is DISABLED per
 * !12, so an unsplit hardware FMA is not guaranteed; splitting matches the
 * plain multiply-then-add IEEE path under `air.compile.fast_math_disable`).
 */
function fmuladd4(
  a: [number, number, number, number],
  b: [number, number, number, number],
  c: [number, number, number, number],
): [number, number, number, number] {
  return [
    Math.fround(Math.fround(a[0] * b[0]) + c[0]),
    Math.fround(Math.fround(a[1] * b[1]) + c[1]),
    Math.fround(Math.fround(a[2] * b[2]) + c[2]),
    Math.fround(Math.fround(a[3] * b[3]) + c[3]),
  ];
}

/**
 * soOFlowEstimator_resampleImageX — one dispatched thread.
 *
 * @param params        the constant-buffer params (buffer(0))
 * @param coord         the [[thread_position_in_grid]] uint2 (output pixel)
 * @param outputWidth   output.get_width(0)  — @IR %8
 * @param outputHeight  output.get_height(0) — @IR %12
 * @param sample_input  sampler-bound reader for the input texture
 * @param write_output  writer for the output texture
 * @param weights       the read-write float buffer produced by
 *                      `soOFlowEstimator_genBlurWeights` (buffer(1))
 *
 * @IR entire function @0x000000000a39bd.
 */
export function soOFlowEstimator_resampleImageX(
  params: soOFlowEstimator_resampleImageX_Params,
  coord: [number, number],
  outputWidth: number,
  outputHeight: number,
  sample_input: Sample2D,
  write_output: Write2D,
  weights: Float32Array,
): void {
  // @IR %7 = extractelement coord, 0 ; %8 = get_width ; %9 = icmp ult %7, %8
  const cx = coord[0] >>> 0;
  const w = outputWidth >>> 0;
  if (!(cx < w)) {
    // @IR br false → %48 : ret
    return;
  }

  // @IR %11 = extractelement coord, 1 ; %12 = get_height ; %13 = icmp ult %11, %12
  const cy = coord[1] >>> 0;
  const h = outputHeight >>> 0;
  if (!(cy < h)) {
    // @IR br false → %48 : ret
    return;
  }

  // @IR %16 = load m_weightArrayDimsX
  const dimX = params.m_weightArrayDimsX | 0;
  // @IR %17 = mul dimX, coord.x ; %19 = &weights[%17]
  // @IR %20 = %19 + 2 (tapBase — first tap slot)
  const rowBase = (dimX * (cx | 0)) | 0;
  const tapBase = (rowBase + 2) | 0;

  // @IR %21 = tapBase-2 ; %22 = load float ; %23 = i32(%22)
  const first = Math.trunc(Math.fround(weights[(tapBase - 2) | 0])) | 0;
  // @IR %24 = tapBase-1 ; %25 = load float ; %26 = i32(%25)
  const last = Math.trunc(Math.fround(weights[(tapBase - 1) | 0])) | 0;

  // @IR %27 = icmp slt first, last ; br %27, %30, %28
  let acc: [number, number, number, number] = [0.0, 0.0, 0.0, 0.0];
  if (first < last) {
    // @IR loop %30..%47: for i in [first, last)
    let i = first | 0; // @IR %32 phi first
    for (;;) {
      // @IR %34 = insertelement coord, i, lane 0  ← sample_coord = (i, coord.y)
      const sampleXi = i | 0;
      const sampleYi = coord[1] | 0;
      // @IR %35 = i - first ; %36 sext ; %37 = &weights[tapBase + %35]
      // @IR %38 = load float — the current tap
      const wTap = Math.fround(weights[(tapBase + (i - first)) | 0]);
      // @IR %39 = v2f32.s.v2i32(<sampleXi, sampleYi>) ; %40 = %39 + <0.5, 0.5>
      const uvx = Math.fround(Math.fround(sampleXi | 0) + 0.5);
      const uvy = Math.fround(Math.fround(sampleYi | 0) + 0.5);
      // @IR %41 = sample_texture_2d(input, sam, <uvx, uvy>, offset=0, lod=0)
      const c = sample_input([uvx, uvy]);
      const c0 = Math.fround(c[0]);
      const c1 = Math.fround(c[1]);
      const c2 = Math.fround(c[2]);
      const c3 = Math.fround(c[3]);
      // @IR %43 = insertelement undef, %38, lane 0 ; %44 = shuffle broadcast lane 0
      // → wVec = <wTap, wTap, wTap, wTap>
      // @IR %45 = fmuladd(%42, %44, %33)
      acc = fmuladd4(
        [c0, c1, c2, c3],
        [wTap, wTap, wTap, wTap],
        acc,
      );
      // @IR %46 = i + 1 ; %47 = %46 == last ; br %47, %28, %30
      i = (i + 1) | 0;
      if (i === last) break;
    }
  }
  // @IR %28 phi %29 = zeroinitializer (from %14) or %45 (from %30)
  // @IR write_texture_2d(output, coord, %29, 0, 2)
  write_output([coord[0] | 0, coord[1] | 0], acc);
  // @IR label %48 : ret
}
