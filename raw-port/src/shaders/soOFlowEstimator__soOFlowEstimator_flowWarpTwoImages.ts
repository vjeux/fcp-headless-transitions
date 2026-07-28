// @shader soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages (HeliumSenso) @0x000000000abd2d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_flowWarpTwoImages.ll, extracted
// via raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. Header
// line reads `0x000000000abd2d -- soOFlowEstimator::
// soOFlowEstimator_flowWarpTwoImages:`. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable`
// -> standard IEEE-754 fp32 (direct TS mapping via Math.fround).
// All `llvm.fmuladd.v2f32` calls (six of them at %35, %57, %60, %63,
// %69, %90, %93, %96) are fp32-fused (single rounding), modelled as
// `Math.fround(a*b + c)` per raw-port/army/SHADERS.md.
//
// STRUCT-TYPE-NAME REUSE TRAP (SHADERS.md): the AIR IR names the
// params struct `soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params`
// (One, not Two) due to Apple's layout-compatible AIR-struct dedup,
// but the authoritative `!17`/`!18` field metadata says
// `soOFlowEstimator_flowWarpTwoImages_params` with fields:
//   offset 0: float m_dt
//   offset 4: int   m_dimX
//   offset 8: int   m_dimY
//
// SIGNED-VS-UNSIGNED int->float traps (SHADERS.md):
//   * air.convert.f.f32.u.i32   / .v2f32.u.v2i32  -- coord lanes.
//   * air.convert.f.f32.s.i32                       -- dim params.
//
// Compute kernel signature (from !14..!25):
//   params : constant struct at !18 (12 bytes, see above).
//   coord_ : uint2 — thread_position_in_grid.
//   sam    : sampler index 0.
//   I1_             : texture2d<float, sample> index 0 (%3).
//   I2_             : texture2d<float, sample> index 1 (%4).
//   I1_flowWarped_  : texture2d<float, write>  index 2 (%5).
//   I2_flowWarped_  : texture2d<float, write>  index 3 (%6).
//   flowIn_         : texture2d<float, sample> index 4 (%7).
//
// Body-level shape: this is exactly the sibling
// `soOFlowEstimator_flowWarpOneImage` kernel applied twice — once
// with `warp = coord - m_dt * flow` sampled from I1 and written to
// I1_flowWarped, and once with `warp = coord + (1 - m_dt) * flow`
// sampled from I2 and written to I2_flowWarped. The bilinear
// four-tap lookup, clamp, and floor/fract logic are identical to
// the OneImage sibling (see the landed
// soOFlowEstimator__soOFlowEstimator_flowWarpOneImage.ts for the
// full line-by-line map of that half).
//
// Line-by-line map of the IR body (mirrors OneImage twice):
//
//   entry %8:
//     %9  = air.convert.f.v2f32.u.v2i32(coord).
//     %11 = load m_dimX ; %12 = signed cast -> dimXf.
//     %15 = load m_dimY ; %16 = signed cast -> dimYf.
//     %17 = <dimXf, dimYf>.
//     %18 = coord.x ; %19 = unsigned cast.
//     %20 = fcmp ult (coord.x_f, dimXf).
//     br i1 %20, label %21, label %99  -- OOB -> ret.
//   %21:
//     %22 = coord.y ; %23 = unsigned cast.
//     %24 = fcmp ult (coord.y_f, dimYf).
//     br i1 %24, label %25, label %99  -- OOB -> ret.
//
//   %25 (both bounds pass):
//     %26 = coord_f + <0.5, 0.5>.
//     %27 = sample(flowIn, sam, %26) ; %29 = flow.xy.
//     %31 = load m_dt ; %33 = splat(m_dt).
//     %34 = <-0, -0> - splat(m_dt) = splat(-m_dt).
//     %35 = fmuladd(-m_dt, flow, coord_f) = coord_f - m_dt*flow.
//                                          -- I1-half warped pos.
//     %36 = <dimXf, dimYf> - <1, 1>          -- upper clamp bound.
//     %37 = clamp(%35, 0, %36).
//     %38 = floor(%37) ; %39 = %37 - %38    -- fract.
//     %40 = %38 + <0.5, 0.5>                 -- TL sample uv.
//     %41..%43 = %40 + <1,0>, <0,1>, <1,1>   -- TR, BL, BR.
//     %44..%53 = four samples of I1 at TL/TR/BL/BR (uses %3).
//     %54..%63 = bilinear: top = TL + fract.x*(TR-TL);
//                          bot = BL + fract.x*(BR-BL);
//                          final = top + fract.y*(bot-top).
//     %64 = <final[0], undef, undef, undef>.
//     %65 = shufflevector <undef, undef, undef, 1.0>, %64, <4,4,4,3>
//         -- = <final[0], final[0], final[0], 1.0>  (R=G=B replicate,
//                                                    alpha 1).
//     air.write_texture_2d.v4f32(I1_flowWarped, coord, %65, 0, 2).
//
//     %66 = 1 - m_dt ; %68 = splat(1 - m_dt).
//     %69 = fmuladd(1-m_dt, flow, coord_f) = coord_f + (1-m_dt)*flow.
//                                           -- I2-half warped pos.
//     %70..%86 = same clamp/floor/fract/four-sample pattern on I2
//                (uses %4).
//     %87..%96 = same bilinear interp.
//     %97 = <final[0], undef, undef, undef>.
//     %98 = shufflevector <undef, undef, undef, 1.0>, %97, <4,4,4,3>
//         -- = <final[0], final[0], final[0], 1.0>.
//     air.write_texture_2d.v4f32(I2_flowWarped, coord, %98, 0, 2).
//     br label %99.
//
//   %99: ret void.
//
// The bilinear warp helper below factors out the identical block used
// twice, parameterised by (image texture, sign of m_dt: -m_dt for
// I1, +(1-m_dt) for I2).

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages` — mirrors
 * the AIR struct at !18 (12-byte packed record, four-byte fields;
 * struct type name in the IR is the layout-compatible sibling
 * `flowWarpOneImage_params`, resolved from !17/!18 metadata).
 */
export interface SoOFlowEstimatorFlowWarpTwoImagesParams {
  m_dt: number;   // offset 0 : float
  m_dimX: number; // offset 4 : int
  m_dimY: number; // offset 8 : int
}

/** Callback for AIR `air.sample_texture_2d.v4f32`. */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/** Callback for AIR `air.write_texture_2d.v4f32`. */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/**
 * Bilinearly-warps a single source image by the flow field scaled
 * with `dtSigned` (i.e. the caller passes `-m_dt` for the I1 half
 * and `1 - m_dt` for the I2 half — matching the .34/.68 splats in
 * the IR). Returns just the .r/lane-0 of the bilinear result — the
 * output is RGB-replicated with alpha 1.0 at the write site.
 *
 * Mirrors IR blocks %25 (for I1) and the post-%65 continuation
 * (for I2).
 */
function bilinearWarpLane0<T>(
  image: T,
  coordFx: number,
  coordFy: number,
  flowX: number,
  flowY: number,
  dtSigned: number,
  clampMaxX: number,
  clampMaxY: number,
  sample: SampleFloatTex2D<T>,
): number {
  // %35 / %69 : fmuladd(dtSigned, flow, coord_f) = coord_f + dtSigned*flow.
  const warpedX = Math.fround(dtSigned * flowX + coordFx);
  const warpedY = Math.fround(dtSigned * flowY + coordFy);

  // %37 / %70 : clamp to [0, <dimX-1, dimY-1>].
  const clampedX = Math.fround(Math.min(Math.max(warpedX, Math.fround(0.0)), clampMaxX));
  const clampedY = Math.fround(Math.min(Math.max(warpedY, Math.fround(0.0)), clampMaxY));

  // %38 / %71 : floor. %39 / %72 : fract = clamped - floor.
  const floorX = Math.fround(Math.floor(clampedX));
  const floorY = Math.fround(Math.floor(clampedY));
  const fractX = Math.fround(clampedX - floorX);
  const fractY = Math.fround(clampedY - floorY);

  // %40 / %73 : base uv = floor + <0.5, 0.5>. Four samples at
  //   base, base+<1,0>, base+<0,1>, base+<1,1>.
  const baseU = Math.fround(floorX + Math.fround(0.5));
  const baseV = Math.fround(floorY + Math.fround(0.5));
  const trU = Math.fround(baseU + Math.fround(1.0));
  const trV = baseV;
  const blU = baseU;
  const blV = Math.fround(baseV + Math.fround(1.0));
  const brU = Math.fround(baseU + Math.fround(1.0));
  const brV = Math.fround(baseV + Math.fround(1.0));

  const tl = sample(image, baseU, baseV);
  const tr = sample(image, trU, trV);
  const bl = sample(image, blU, blV);
  const br = sample(image, brU, brV);
  const tlR = Math.fround(tl[0]);
  const trR = Math.fround(tr[0]);
  const blR = Math.fround(bl[0]);
  const brR = Math.fround(br[0]);

  // %57 / %90 : top row lerp along X. Only lane 0 (.r) drives the
  //   final write.
  const topLerp = Math.fround(fractX * Math.fround(trR - tlR) + tlR);
  // %60 / %93 : bottom row lerp along X.
  const botLerp = Math.fround(fractX * Math.fround(brR - blR) + blR);
  // %63 / %96 : vertical lerp using fract.y.
  return Math.fround(fractY * Math.fround(botLerp - topLerp) + topLerp);
}

/**
 * Compute kernel
 * `soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages` —
 * bilinearly warps two source images (`I1_` and `I2_`) by a shared
 * flow field, writing the bilinear-.r into RGB with alpha 1.0. The
 * two halves use different flow scales:
 *   I1_flowWarped = warp(I1_, coord - m_dt        * flow)
 *   I2_flowWarped = warp(I2_, coord + (1 - m_dt)  * flow)
 * matching the -m_dt splat at %34 and the (1 - m_dt) splat at %68.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_flowWarpTwoImages (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_flowWarpTwoImages<
  TI1,
  TI2,
  TOut1,
  TOut2,
  TFlow,
>(
  params: SoOFlowEstimatorFlowWarpTwoImagesParams,
  coord: [number, number],
  I1: TI1,
  I2: TI2,
  I1_flowWarped: TOut1,
  I2_flowWarped: TOut2,
  flowIn: TFlow,
  sampleI1: SampleFloatTex2D<TI1>,
  sampleI2: SampleFloatTex2D<TI2>,
  sampleFlow: SampleFloatTex2D<TFlow>,
  writeI1out: WriteFloatTex2D<TOut1>,
  writeI2out: WriteFloatTex2D<TOut2>,
): void {
  // %9 : unsigned int->float cast of coord.
  const coordU32X = coord[0] >>> 0;
  const coordU32Y = coord[1] >>> 0;
  const coordFx = Math.fround(coordU32X);
  const coordFy = Math.fround(coordU32Y);

  // %11, %12, %15, %16 : dim params -- SIGNED cast.
  const dimXi = params.m_dimX | 0;
  const dimYi = params.m_dimY | 0;
  const dimXf = Math.fround(dimXi);
  const dimYf = Math.fround(dimYi);

  // %20 : fcmp ult (coord.x_f, dimXf) -- UNORDERED less-than.
  //   `ult` is true iff (a < b) OR (either is NaN). We RETURN when
  //   `ult` is false, i.e. when `a >= b` AND both are ordered.
  //   In JS, `a >= b` is true iff a >= b AND both are ordered
  //   (NaN comparisons yield false), so `if (a >= b) return`
  //   preserves the IR semantics exactly.
  if (coordFx >= dimXf) {
    return;
  }
  // %24 : fcmp ult (coord.y_f, dimYf).
  if (coordFy >= dimYf) {
    return;
  }

  // %26 = coord_f + <0.5, 0.5> ; %27 = sample(flowIn, sam, %26)
  //   ; %29 = flow.xy.
  const flowUvU = Math.fround(coordFx + Math.fround(0.5));
  const flowUvV = Math.fround(coordFy + Math.fround(0.5));
  const flowSample = sampleFlow(flowIn, flowUvU, flowUvV);
  const flowX = Math.fround(flowSample[0]);
  const flowY = Math.fround(flowSample[1]);

  // %31 = load m_dt.
  const dt = Math.fround(params.m_dt);
  // %34 = -m_dt (from `<-0, -0> - splat(dt)`).
  const negDt = Math.fround(Math.fround(-0.0) - dt);
  // %66 = 1 - m_dt.
  const oneMinusDt = Math.fround(Math.fround(1.0) - dt);

  // %36 : upper clamp bound = <dimXf - 1, dimYf - 1>.
  const clampMaxX = Math.fround(dimXf + Math.fround(-1.0));
  const clampMaxY = Math.fround(dimYf + Math.fround(-1.0));

  // I1-half : bilinear warp with dt = -m_dt (blocks %35..%65).
  const finalI1 = bilinearWarpLane0(
    I1, coordFx, coordFy, flowX, flowY, negDt, clampMaxX, clampMaxY, sampleI1,
  );

  // %65 = <finalI1, finalI1, finalI1, 1.0> ; write to I1_flowWarped.
  writeI1out(I1_flowWarped, coord[0] | 0, coord[1] | 0, [
    finalI1, finalI1, finalI1, Math.fround(1.0),
  ]);

  // I2-half : bilinear warp with dt = (1 - m_dt) (blocks %69..%98).
  const finalI2 = bilinearWarpLane0(
    I2, coordFx, coordFy, flowX, flowY, oneMinusDt, clampMaxX, clampMaxY, sampleI2,
  );

  // %98 = <finalI2, finalI2, finalI2, 1.0> ; write to I2_flowWarped.
  writeI2out(I2_flowWarped, coord[0] | 0, coord[1] | 0, [
    finalI2, finalI2, finalI2, Math.fround(1.0),
  ]);
}
