// Faithful transcription @0x000000000ad2dd
// @shader soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow (HeliumSenso)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_flowWarpTwoImagesWithResampleFlow.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The header
// line reads `0x000000000ad2dd -- soOFlowEstimator::
// soOFlowEstimator_flowWarpTwoImagesWithResampleFlow:` — the shader's entry
// offset in the metallib.
//
// Compile options in the .ll:
//   air.compile.denorms_disable, air.compile.fast_math_disable,
//   air.compile.framebuffer_fetch_enable
// `fast_math_disable` -> standard IEEE-754 fp32 (mapped via Math.fround here).
// `llvm.fmuladd.v2f32` intrinsics (%58, %61, %64, %73, %95, %98, %101,
// %107, %128, %131, %134) are fp32-fused (single rounding); modelled as
// `Math.fround(a*b + c)` per raw-port/army/SHADERS.md.
//
// Kernel signature (from !14..!26):
//   params : constant struct at !18 — 20 bytes:
//              offset  0: float m_dt
//              offset  4: int   m_prevDimX
//              offset  8: int   m_prevDimY
//              offset 12: int   m_dimX
//              offset 16: int   m_dimY
//   coord_ : uint2 — air.thread_position_in_grid.
//   sam    : sampler index 0.
//   I1_             : texture2d<float, sample> index 0 (%3) — source frame 1.
//   I2_             : texture2d<float, sample> index 1 (%4) — source frame 2.
//   I1_flowWarped_  : texture2d<float, write>  index 2 (%5) — warped I1 out.
//   I2_flowWarped_  : texture2d<float, write>  index 3 (%6) — warped I2 out.
//   flowIn_         : texture2d<float, sample> index 4 (%7) — flow field at prev-dim res.
//   flowOut_        : texture2d<float, write>  index 5 (%8) — resampled flow out at dim res.
//
// SIGNED-VS-UNSIGNED int->float traps (see SHADERS.md):
//   * `air.convert.f.v2f32.u.v2i32` (%10) is UNSIGNED — coord as fp32.
//   * `air.convert.f.f32.u.i32` (%28, %32) is UNSIGNED — coord lanes for
//     the two `fcmp ult` bounds checks.
//   * `air.convert.f.f32.s.i32` (%13, %17, %21, %25) is SIGNED — the four
//     int dim/prevDim params as fp32.
//
// AIR intrinsics used:
//   air.convert.f.v2f32.u.v2i32                    -- UNSIGNED v2 int->float.
//   air.convert.f.f32.u.i32                        -- UNSIGNED int->float.
//   air.convert.f.f32.s.i32                        -- SIGNED int->float.
//   air.sample_texture_2d.v4f32                    -- 2D texture sample.
//   air.clamp.v2f32(v, lo, hi)                     -- 2-lane clamp.
//   air.floor.v2f32                                -- 2-lane floor.
//   llvm.fmuladd.v2f32                             -- fp32-fused MADD.
//   air.write_texture_2d.v4f32                     -- write output.
//
// Kernel algorithm (from the IR body):
//
//   entry %9:
//     %10 = air.convert.f.v2f32.u.v2i32(coord)         -- coord.uv as fp32 (UNSIGNED).
//     %11..%18 = <dimX_f, dimY_f>                      -- SIGNED cast of m_dimX/m_dimY.
//     %19..%26 = <prevDimX_f, prevDimY_f>              -- SIGNED cast of m_prevDimX/m_prevDimY.
//     %27..%28 = coord.x as UNSIGNED float.
//     %29 = fcmp ult(coord.x_uf, dimX_f)               -- OOB -> ret.
//     br i1 %29, label %30, label %137.
//   %30..%33 = coord.y bounds check (mirror).
//     br i1 %33, label %34, label %137.
//
//   %34 (both bounds pass):
//     -- STAGE 1: resample flowIn (at prevDim res) into flowOut (at dim res).
//     %35 = <prevDim_f> / <dim_f>                      -- vec2 scale factor.
//     %36 = coord_f * scale                            -- flow-sample coord in prev-dim space.
//     %37 = <prevDim_f, prevDim_f> + <-1, -1>          -- upper clamp = prevDim - 1.
//     %38 = air.clamp(%36, <0,0>, %37).
//     %39 = air.floor(%38).
//     %40 = %38 - %39                                   -- fract in prev-dim space.
//     %41 = %39 + <0.5, 0.5>                            -- TL uv.
//     %42 = %41 + <1, 0>                                -- TR.
//     %43 = %41 + <0, 1>                                -- BL.
//     %44 = %41 + <1, 1>                                -- BR.
//     %45..%54 = sample(flowIn) 4 taps.
//     %55 = splat(fract.x). %57 = (TR-TL).xy. %58 = fmuladd -> top-row lerp.
//     %60 = (BR-BL).xy. %61 = fmuladd -> bot-row lerp.
//     %62 = splat(fract.y).%63 = bot-top. %64 = fmuladd -> bilinear flow (v2).
//     %65 = flow / scale                                -- scale flow BACK to dim-res coord space.
//     %66..%67 = <flow.x, flow.y, 0.0, 0.0>.
//     write_texture_2d(flowOut, coord, <flow.xy, 0, 0>).
//
//     -- STAGE 2: warp I1 backward by m_dt * flow.
//     %68..%69 = load m_dt.
//     %72 = <-0.0, -0.0> - splat(m_dt).
//     %73 = fmuladd(-dt, flow, coord_f)                 -- I1 sample pos.
//     %74 = <dimX-1, dimY-1>.
//     %75 = clamp; %76 = floor; %77 = fract; %78..%81 = 4-tap uvs.
//     %82..%91 = sample(I1) 4 taps.
//     %92..%101 = bilinear lerp.
//     %102..%103 = <lerp[0], lerp[0], lerp[0], 1.0>.
//     write_texture_2d(I1_flowWarped, coord, %103).
//
//     -- STAGE 3: warp I2 forward by (1 - m_dt) * flow.
//     %104 = 1.0 - m_dt. %105..%106 = splat.
//     %107 = fmuladd((1-dt), flow, coord_f)             -- I2 sample pos.
//     %108 = clamp; %109 = floor; %110 = fract; %111..%114 = 4-tap uvs.
//     %115..%124 = sample(I2) 4 taps.
//     %125..%134 = bilinear lerp.
//     %135..%136 = <lerp[0], lerp[0], lerp[0], 1.0>.
//     write_texture_2d(I2_flowWarped, coord, %136).
//     br label %137.
//
//   %137: ret void.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow` — mirrors
 * the AIR struct at !18 (20-byte packed record, five four-byte fields).
 */
export interface SoOFlowEstimatorFlowWarpTwoImagesWithResampleFlowParams {
  m_dt: number;        // offset  0 : float — forward-warp fraction for I2; (1-m_dt) for I2, m_dt for I1 backward.
  m_prevDimX: number;  // offset  4 : int   — flowIn X extent.
  m_prevDimY: number;  // offset  8 : int   — flowIn Y extent.
  m_dimX: number;      // offset 12 : int   — output X extent (exclusive).
  m_dimY: number;      // offset 16 : int   — output Y extent (exclusive).
}

/** Callback for AIR `air.sample_texture_2d.v4f32`. */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/** Callback for AIR `air.write_texture_2d.v4f32`. */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/**
 * Compute kernel
 * `soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow`
 * — resamples a flow field from prev-dim into current-dim, and uses the
 * resampled flow to bilinearly warp two frames (I1 backward by m_dt*flow,
 * I2 forward by (1-m_dt)*flow) into their respective warped outputs.
 *
 * Bounds check uses `fcmp ult` (unordered less-than) on the coord-as-float
 * against the dim-as-float; the coord cast is UNSIGNED and the dim cast is
 * SIGNED per the .u./.s. `air.convert` variants in the IR — preserved literally.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_flowWarpTwoImagesWithResampleFlow (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_flowWarpTwoImagesWithResampleFlow<
  TI1, TI2, TI1Out, TI2Out, TFlowIn, TFlowOut,
>(
  params: SoOFlowEstimatorFlowWarpTwoImagesWithResampleFlowParams,
  coord: [number, number],
  I1: TI1,
  I2: TI2,
  I1_flowWarped: TI1Out,
  I2_flowWarped: TI2Out,
  flowIn: TFlowIn,
  flowOut: TFlowOut,
  sampleI1: SampleFloatTex2D<TI1>,
  sampleI2: SampleFloatTex2D<TI2>,
  sampleFlow: SampleFloatTex2D<TFlowIn>,
  writeI1: WriteFloatTex2D<TI1Out>,
  writeI2: WriteFloatTex2D<TI2Out>,
  writeFlow: WriteFloatTex2D<TFlowOut>,
): void {
  // %10 = air.convert.f.v2f32.u.v2i32(coord) -- UNSIGNED v2 int->float.
  //   Coerce with `>>> 0` to preserve unsigned semantics before Math.fround
  //   narrows to fp32 (see SHADERS.md silent-correctness trap).
  const coordU32X = coord[0] >>> 0;
  const coordU32Y = coord[1] >>> 0;
  const coordFx = Math.fround(coordU32X);
  const coordFy = Math.fround(coordU32Y);

  // %11..%18 = <dimX_f, dimY_f>. %19..%26 = <prevDimX_f, prevDimY_f>.
  //   SIGNED casts (air.convert.f.f32.s.i32) — dims are signed int params.
  const dimXi = params.m_dimX | 0;
  const dimYi = params.m_dimY | 0;
  const prevDimXi = params.m_prevDimX | 0;
  const prevDimYi = params.m_prevDimY | 0;
  const dimXf = Math.fround(dimXi);
  const dimYf = Math.fround(dimYi);
  const prevDimXf = Math.fround(prevDimXi);
  const prevDimYf = Math.fround(prevDimYi);

  // %27..%29 = fcmp ult(coord.x_uf, dimX_f) ; UNORDERED less-than.
  //   `fcmp ult` yields TRUE for NaN inputs; JS `<` yields FALSE for NaN.
  //   Preserve via `!(a >= b)` idiom — matches sibling flowWarpOneImage.
  const coordFxU = Math.fround(coordU32X);
  if (coordFxU >= dimXf) {
    // br i1 %29 false -> label %137 : ret void.
    return;
  }
  // %30..%33 = coord.y bounds check (mirror).
  const coordFyU = Math.fround(coordU32Y);
  if (coordFyU >= dimYf) {
    return;
  }

  // ---------------------------------------------------------------------------
  // STAGE 1: resample the flow field.
  // ---------------------------------------------------------------------------

  // %35 = <prevDim_f, prevDim_f> / <dim_f, dim_f> -- vec2 scale ratio.
  const scaleX = Math.fround(prevDimXf / dimXf);
  const scaleY = Math.fround(prevDimYf / dimYf);

  // %36 = coord_f * scale -- position in prev-dim space to sample flow.
  const flowSampleX = Math.fround(coordFx * scaleX);
  const flowSampleY = Math.fround(coordFy * scaleY);

  // %37 = <prevDim_f - 1, prevDim_f - 1>.
  const flowClampMaxX = Math.fround(prevDimXf + Math.fround(-1.0));
  const flowClampMaxY = Math.fround(prevDimYf + Math.fround(-1.0));

  // %38 = air.clamp(%36, <0,0>, %37).
  const flowClampedX = Math.fround(
    Math.min(Math.max(flowSampleX, Math.fround(0.0)), flowClampMaxX),
  );
  const flowClampedY = Math.fround(
    Math.min(Math.max(flowSampleY, Math.fround(0.0)), flowClampMaxY),
  );

  // %39 = air.floor. %40 = clamped - floor -- fract.
  const flowFloorX = Math.fround(Math.floor(flowClampedX));
  const flowFloorY = Math.fround(Math.floor(flowClampedY));
  const flowFractX = Math.fround(flowClampedX - flowFloorX);
  const flowFractY = Math.fround(flowClampedY - flowFloorY);

  // %41 = floor + <0.5, 0.5>. %42..%44 = TL/TR/BL/BR uvs.
  const flowTLu = Math.fround(flowFloorX + Math.fround(0.5));
  const flowTLv = Math.fround(flowFloorY + Math.fround(0.5));
  const flowTRu = Math.fround(flowTLu + Math.fround(1.0));
  const flowTRv = flowTLv;
  const flowBLu = flowTLu;
  const flowBLv = Math.fround(flowTLv + Math.fround(1.0));
  const flowBRu = Math.fround(flowTLu + Math.fround(1.0));
  const flowBRv = Math.fround(flowTLv + Math.fround(1.0));

  // %45..%54 = sample(flowIn) 4 taps.
  //   Only .xy used (shufflevector <2 x i32> <0, 1>).
  const flowTL = sampleFlow(flowIn, flowTLu, flowTLv);
  const flowTLx = Math.fround(flowTL[0]);
  const flowTLy = Math.fround(flowTL[1]);
  const flowTR = sampleFlow(flowIn, flowTRu, flowTRv);
  const flowTRx = Math.fround(flowTR[0]);
  const flowTRy = Math.fround(flowTR[1]);
  const flowBLs = sampleFlow(flowIn, flowBLu, flowBLv);
  const flowBLx = Math.fround(flowBLs[0]);
  const flowBLy = Math.fround(flowBLs[1]);
  const flowBRs = sampleFlow(flowIn, flowBRu, flowBRv);
  const flowBRx = Math.fround(flowBRs[0]);
  const flowBRy = Math.fround(flowBRs[1]);

  // %55 = splat(fract.x). %57 = (TR-TL).xy. %58 = fmuladd(fract.x, (TR-TL).xy, TL.xy)
  //   -- top row X-lerp.
  const flowTopX = Math.fround(flowFractX * Math.fround(flowTRx - flowTLx) + flowTLx);
  const flowTopY = Math.fround(flowFractX * Math.fround(flowTRy - flowTLy) + flowTLy);
  // %60 = (BR-BL).xy. %61 = fmuladd(fract.x, ..., BL.xy) -- bot row X-lerp.
  const flowBotX = Math.fround(flowFractX * Math.fround(flowBRx - flowBLx) + flowBLx);
  const flowBotY = Math.fround(flowFractX * Math.fround(flowBRy - flowBLy) + flowBLy);
  // %62 = splat(fract.y). %63 = bot - top. %64 = fmuladd(fract.y, bot-top, top).
  //   Final bilinear v2 result — the resampled flow vector.
  const flowBilX = Math.fround(flowFractY * Math.fround(flowBotX - flowTopX) + flowTopX);
  const flowBilY = Math.fround(flowFractY * Math.fround(flowBotY - flowTopY) + flowTopY);

  // %65 = flow / scale -- rescale flow BACK to dim-res coord space
  //   (flow at prev-dim scale is prev-dim-pixels; divide by scale = prevDim/dim to
  //   convert to dim-pixels).
  const flowResampledX = Math.fround(flowBilX / scaleX);
  const flowResampledY = Math.fround(flowBilY / scaleY);

  // %66..%67 = <flow.x, flow.y, 0.0, 0.0> via shufflevector.
  // write_texture_2d(flowOut, coord, %67).
  writeFlow(flowOut, coord[0] | 0, coord[1] | 0, [
    flowResampledX,
    flowResampledY,
    Math.fround(0.0),
    Math.fround(0.0),
  ]);

  // ---------------------------------------------------------------------------
  // STAGE 2: warp I1 backward by m_dt * flow.
  // ---------------------------------------------------------------------------

  // %68..%69 = load m_dt (float, offset 0).
  const dt = Math.fround(params.m_dt);
  // %72 = <-0.0, -0.0> - splat(m_dt) -- fp32 subtract producing -dt splat.
  const negDt = Math.fround(Math.fround(-0.0) - dt);
  // %73 = fmuladd(-dt, flow, coord_f) -- I1 sample position (backward warp).
  const i1PosX = Math.fround(negDt * flowResampledX + coordFx);
  const i1PosY = Math.fround(negDt * flowResampledY + coordFy);

  // %74 = <dimX_f - 1, dimY_f - 1>.
  const imgClampMaxX = Math.fround(dimXf + Math.fround(-1.0));
  const imgClampMaxY = Math.fround(dimYf + Math.fround(-1.0));

  // %75 = air.clamp(%73, <0,0>, %74).
  const i1ClampX = Math.fround(
    Math.min(Math.max(i1PosX, Math.fround(0.0)), imgClampMaxX),
  );
  const i1ClampY = Math.fround(
    Math.min(Math.max(i1PosY, Math.fround(0.0)), imgClampMaxY),
  );

  // %76 = floor. %77 = fract.
  const i1FloorX = Math.fround(Math.floor(i1ClampX));
  const i1FloorY = Math.fround(Math.floor(i1ClampY));
  const i1FractX = Math.fround(i1ClampX - i1FloorX);
  const i1FractY = Math.fround(i1ClampY - i1FloorY);

  // %78 = floor + <0.5, 0.5>. %79..%81 = TR/BL/BR uvs.
  const i1TLu = Math.fround(i1FloorX + Math.fround(0.5));
  const i1TLv = Math.fround(i1FloorY + Math.fround(0.5));
  const i1TRu = Math.fround(i1TLu + Math.fround(1.0));
  const i1TRv = i1TLv;
  const i1BLu = i1TLu;
  const i1BLv = Math.fround(i1TLv + Math.fround(1.0));
  const i1BRu = Math.fround(i1TLu + Math.fround(1.0));
  const i1BRv = Math.fround(i1TLv + Math.fround(1.0));

  // %82..%91 = sample(I1) 4 taps. Only .xy of each used further via <2xi32><0,1> shuffle.
  const i1TL = sampleI1(I1, i1TLu, i1TLv);
  const i1TLx = Math.fround(i1TL[0]);
  const i1TLy = Math.fround(i1TL[1]);
  const i1TR = sampleI1(I1, i1TRu, i1TRv);
  const i1TRx = Math.fround(i1TR[0]);
  const i1TRy = Math.fround(i1TR[1]);
  const i1BL = sampleI1(I1, i1BLu, i1BLv);
  const i1BLx = Math.fround(i1BL[0]);
  const i1BLy = Math.fround(i1BL[1]);
  const i1BR = sampleI1(I1, i1BRu, i1BRv);
  const i1BRx = Math.fround(i1BR[0]);
  const i1BRy = Math.fround(i1BR[1]);

  // %92..%101 = 2-lane bilinear (top-row, bot-row, then Y-lerp).
  const i1TopX = Math.fround(i1FractX * Math.fround(i1TRx - i1TLx) + i1TLx);
  const i1TopY = Math.fround(i1FractX * Math.fround(i1TRy - i1TLy) + i1TLy);
  const i1BotX = Math.fround(i1FractX * Math.fround(i1BRx - i1BLx) + i1BLx);
  const i1BotY = Math.fround(i1FractX * Math.fround(i1BRy - i1BLy) + i1BLy);
  const i1FinalLane0 = Math.fround(i1FractY * Math.fround(i1BotX - i1TopX) + i1TopX);
  // Lane 1 exists in the IR v2 fmuladd but only lane 0 reaches the write.
  const i1FinalLane1 = Math.fround(i1FractY * Math.fround(i1BotY - i1TopY) + i1TopY);
  void i1FinalLane1;

  // %102..%103 = <lane0, lane0, lane0, 1.0> via shufflevector.
  writeI1(I1_flowWarped, coord[0] | 0, coord[1] | 0, [
    i1FinalLane0,
    i1FinalLane0,
    i1FinalLane0,
    Math.fround(1.0),
  ]);

  // ---------------------------------------------------------------------------
  // STAGE 3: warp I2 forward by (1 - m_dt) * flow.
  // ---------------------------------------------------------------------------

  // %104 = 1.0 - m_dt. %105..%106 = splat.
  const oneMinusDt = Math.fround(Math.fround(1.0) - dt);
  // %107 = fmuladd((1-dt), flow, coord_f) -- I2 sample position (forward warp).
  const i2PosX = Math.fround(oneMinusDt * flowResampledX + coordFx);
  const i2PosY = Math.fround(oneMinusDt * flowResampledY + coordFy);

  // %108 = clamp against the same <dimX-1, dimY-1> upper bound (%74).
  const i2ClampX = Math.fround(
    Math.min(Math.max(i2PosX, Math.fround(0.0)), imgClampMaxX),
  );
  const i2ClampY = Math.fround(
    Math.min(Math.max(i2PosY, Math.fround(0.0)), imgClampMaxY),
  );

  // %109 = floor. %110 = fract.
  const i2FloorX = Math.fround(Math.floor(i2ClampX));
  const i2FloorY = Math.fround(Math.floor(i2ClampY));
  const i2FractX = Math.fround(i2ClampX - i2FloorX);
  const i2FractY = Math.fround(i2ClampY - i2FloorY);

  // %111..%114 = 4-tap uvs.
  const i2TLu = Math.fround(i2FloorX + Math.fround(0.5));
  const i2TLv = Math.fround(i2FloorY + Math.fround(0.5));
  const i2TRu = Math.fround(i2TLu + Math.fround(1.0));
  const i2TRv = i2TLv;
  const i2BLu = i2TLu;
  const i2BLv = Math.fround(i2TLv + Math.fround(1.0));
  const i2BRu = Math.fround(i2TLu + Math.fround(1.0));
  const i2BRv = Math.fround(i2TLv + Math.fround(1.0));

  // %115..%124 = sample(I2) 4 taps.
  const i2TL = sampleI2(I2, i2TLu, i2TLv);
  const i2TLx = Math.fround(i2TL[0]);
  const i2TLy = Math.fround(i2TL[1]);
  const i2TR = sampleI2(I2, i2TRu, i2TRv);
  const i2TRx = Math.fround(i2TR[0]);
  const i2TRy = Math.fround(i2TR[1]);
  const i2BL = sampleI2(I2, i2BLu, i2BLv);
  const i2BLx = Math.fround(i2BL[0]);
  const i2BLy = Math.fround(i2BL[1]);
  const i2BR = sampleI2(I2, i2BRu, i2BRv);
  const i2BRx = Math.fround(i2BR[0]);
  const i2BRy = Math.fround(i2BR[1]);

  // %125..%134 = 2-lane bilinear.
  const i2TopX = Math.fround(i2FractX * Math.fround(i2TRx - i2TLx) + i2TLx);
  const i2TopY = Math.fround(i2FractX * Math.fround(i2TRy - i2TLy) + i2TLy);
  const i2BotX = Math.fround(i2FractX * Math.fround(i2BRx - i2BLx) + i2BLx);
  const i2BotY = Math.fround(i2FractX * Math.fround(i2BRy - i2BLy) + i2BLy);
  const i2FinalLane0 = Math.fround(i2FractY * Math.fround(i2BotX - i2TopX) + i2TopX);
  const i2FinalLane1 = Math.fround(i2FractY * Math.fround(i2BotY - i2TopY) + i2TopY);
  void i2FinalLane1;

  // %135..%136 = <lane0, lane0, lane0, 1.0>.
  writeI2(I2_flowWarped, coord[0] | 0, coord[1] | 0, [
    i2FinalLane0,
    i2FinalLane0,
    i2FinalLane0,
    Math.fround(1.0),
  ]);
  // br label %137 : ret void.
}
