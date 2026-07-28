// @shader soOFlowEstimator::soOFlowEstimator_flowWarpOneImage (HeliumSenso) @0x000000000a929d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_flowWarpOneImage.ll, extracted
// via raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. Header
// line reads `0x000000000a929d -- soOFlowEstimator::
// soOFlowEstimator_flowWarpOneImage:` — the shader's entry offset.
// Compile options in the .ll: `air.compile.denorms_disable`,
// `air.compile.fast_math_disable`, `air.compile.framebuffer_fetch_enable`.
// `fast_math_disable` -> standard IEEE-754 fp32 (direct TS mapping via
// Math.fround). The `llvm.fmuladd.v2f32` intrinsics at %33, %55, %58,
// %61 are fp32-fused (single rounding); modelled as
// `Math.fround(a*b + c)` per raw-port/army/SHADERS.md.
//
// SIGNED-VS-UNSIGNED int->float traps (see SHADERS.md):
//   * `air.convert.f.f32.u.i32` (%17, %21) is UNSIGNED — used on the
//     coord lanes; coerced with `>>> 0` before Math.fround here.
//   * `air.convert.f.v2f32.u.v2i32` (%7) is UNSIGNED — used on the
//     coord 2-vector.
//   * `air.convert.f.f32.s.i32` (%10, %14) is SIGNED — used on the
//     dimX/dimY int params.
//
// Compute kernel signature (from !14..!23):
//   params : constant struct at !18 — 12 bytes:
//              offset 0: float m_dt
//              offset 4: int   m_dimX
//              offset 8: int   m_dimY
//   coord_ : uint2 — air.thread_position_in_grid.
//   sam    : sampler index 0.
//   I1_             : texture2d<float, sample> index 0 (%3) — source.
//   I1_flowWarped_  : texture2d<float, write>  index 1 (%4) — destination.
//   flowIn_         : texture2d<float, sample> index 2 (%5) — flow field.
//
// AIR intrinsics used:
//   air.convert.f.f32.u.i32, air.convert.f.v2f32.u.v2i32
//                                                -- UNSIGNED int->float.
//   air.convert.f.f32.s.i32                      -- SIGNED int->float.
//   air.sample_texture_2d.v4f32                  -- 2D texture sample.
//   air.clamp.v2f32(v, lo, hi)                   -- 2-lane clamp.
//   air.floor.v2f32                              -- 2-lane floor.
//   llvm.fmuladd.v2f32                           -- fp32-fused MADD.
//   air.write_texture_2d.v4f32                   -- write output.
//
// Kernel algorithm (from the IR body):
//
//   entry %6:
//     %7  = air.convert.f.v2f32.u.v2i32(coord)          -- coord.uv as fp32.
//     %9  = load m_dimX (int)
//     %10 = air.convert.f.f32.s.i32(m_dimX)             -- SIGNED cast.
//     %11 = <dimX_f, undef>
//     %13 = load m_dimY (int)
//     %14 = air.convert.f.f32.s.i32(m_dimY)             -- SIGNED cast.
//     %15 = <dimX_f, dimY_f>
//     %16 = extractelement coord, 0
//     %17 = air.convert.f.f32.u.i32(coord.x)            -- UNSIGNED cast.
//     %18 = fcmp ult %17 (coord.x_f), %10 (dimX_f)      -- UNORDERED
//                                                          less-than.
//     br i1 %18, label %19, label %64                   -- OOB -> ret.
//
//   %19:
//     %20 = extractelement coord, 1
//     %21 = air.convert.f.f32.u.i32(coord.y)            -- UNSIGNED cast.
//     %22 = fcmp ult %21 (coord.y_f), %14 (dimY_f)
//     br i1 %22, label %23, label %64                   -- OOB -> ret.
//
//   %23 (both bounds pass):
//     %24 = coord_f + <0.5, 0.5>                        -- half-pixel bias.
//     %25 = sample(flowIn, sam, %24)                    (%5 index 2)
//     %27 = flow.xy = %26.xy.
//     %29 = load m_dt (float).
//     %31 = splat(m_dt)                                 -- 2-lane.
//     %32 = <-0.0, -0.0> - splat(m_dt)                  -- -m_dt splat.
//     %33 = fmuladd(-m_dt, flow, coord_f)               -- warped =
//                                                          coord_f - m_dt*flow.
//     %34 = <dimX_f, dimY_f> + <-1, -1>                 -- upper clamp bound.
//     %35 = air.clamp.v2f32(warped, <0, 0>, <dimX-1, dimY-1>)
//                                                       -- clamp warped pos.
//     %36 = air.floor.v2f32(%35)                        -- integer part.
//     %37 = %35 - %36                                    -- fractional part.
//     %38 = %36 + <0.5, 0.5>                            -- TL sample UV.
//     %39 = %38 + <1, 0>                                 -- TR sample UV.
//     %40 = %38 + <0, 1>                                 -- BL sample UV.
//     %41 = %38 + <1, 1>                                 -- BR sample UV.
//     %42 = sample(I1, sam, %38)                        -- TL.
//     %43 = extractvalue %42, 0.                         %44 = TL.xy.
//     %45 = sample(I1, sam, %39)                        -- TR.
//     %46 = extractvalue %45, 0.
//     %47 = sample(I1, sam, %40)                        -- BL.
//     %48 = extractvalue %47, 0.                         %49 = BL.xy.
//     %50 = sample(I1, sam, %41)                        -- BR.
//     %51 = extractvalue %50, 0.
//     %52 = splat(fract.x)                              -- 2-lane.
//     %53 = TR.rgba - TL.rgba (as <4 x f>).
//     %54 = (TR - TL).xy.
//     %55 = fmuladd(fract.x, %54, %44) -- top row lerp along X.
//     %56 = BR.rgba - BL.rgba.
//     %57 = (BR - BL).xy.
//     %58 = fmuladd(fract.x, %57, %49) -- bottom row lerp along X.
//     %59 = splat(fract.y) as <1, 1>.
//     %60 = %58 - %55.
//     %61 = fmuladd(fract.y, %60, %55) -- final vertical lerp
//                                        (2-lane result; only lane 0
//                                         is used further).
//     %62 = <%61[0], undef, undef, undef>.
//     %63 = shufflevector <undef, undef, undef, 1.0> (%A),
//                         %62 (%B), <4, 4, 4, 3>
//         -- LLVM shufflevector lane indices 0..3 pick from %A,
//            lanes 4..7 pick from %B (index minus 4). <4,4,4,3>
//            means <%B[0], %B[0], %B[0], %A[3]> =
//            <%61[0], %61[0], %61[0], 1.0>. Only the lane 0 of the
//            bilinear result is used; it is broadcast to RGB and
//            alpha is set to 1.0 (opaque single-channel warp).
//     air.write_texture_2d.v4f32(I1_flowWarped, coord, %63, 0, 2).
//     br label %64.
//
//   %64: ret void.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_flowWarpOneImage` — mirrors
 * the AIR struct at !18 (12-byte packed record, four-byte fields).
 */
export interface SoOFlowEstimatorFlowWarpOneImageParams {
  m_dt: number;   // offset 0 : float — flow-scale factor.
  m_dimX: number; // offset 4 : int   — X extent (exclusive).
  m_dimY: number; // offset 8 : int   — Y extent (exclusive).
}

/** Callback for AIR `air.sample_texture_2d.v4f32`. */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/** Callback for AIR `air.write_texture_2d.v4f32`. */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/**
 * Compute kernel
 * `soOFlowEstimator::soOFlowEstimator_flowWarpOneImage` — bilinearly
 * warps `I1_` by the flow field `flowIn_` scaled by `m_dt`. The
 * output is a grayscale replicate of the bilinear-sampled I1 red
 * channel with alpha = 1.0 at every pixel inside
 * `[0, m_dimX) x [0, m_dimY)`.
 *
 * The bounds check uses `fcmp ult` (unordered less-than) on the
 * coord-as-float against the dim-as-float; the coord cast is
 * UNSIGNED and the dim cast is SIGNED per the .u./.s. `air.convert`
 * variants in the IR — preserved literally.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_flowWarpOneImage (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_flowWarpOneImage<TI1, TOut, TFlow>(
  params: SoOFlowEstimatorFlowWarpOneImageParams,
  coord: [number, number],
  I1: TI1,
  I1_flowWarped: TOut,
  flowIn: TFlow,
  sampleI1: SampleFloatTex2D<TI1>,
  sampleFlow: SampleFloatTex2D<TFlow>,
  writeOutput: WriteFloatTex2D<TOut>,
): void {
  // %7 = air.convert.f.v2f32.u.v2i32(coord) -- UNSIGNED cast.
  //   Coerce with `>>> 0` to preserve unsigned semantics before
  //   Math.fround narrows to fp32 (see SHADERS.md).
  const coordU32X = coord[0] >>> 0;
  const coordU32Y = coord[1] >>> 0;
  const coordFx = Math.fround(coordU32X);
  const coordFy = Math.fround(coordU32Y);

  // %9, %10 = load m_dimX (int) + SIGNED cast to float.
  const dimXi = params.m_dimX | 0;
  const dimYi = params.m_dimY | 0;
  const dimXf = Math.fround(dimXi);
  const dimYf = Math.fround(dimYi);

  // %17 = air.convert.f.f32.u.i32(coord.x) ; %18 = fcmp ult (coord.x_f, dimX_f).
  //   UNORDERED less-than: any NaN input takes the FALSE path (branch
  //   to %64 = ret). In JS `<` returns false when either operand is
  //   NaN, so `coordFxU < dimXf` -> false on NaN, matching. But
  //   `fcmp ult` yields true for NaN — preserved with a
  //   `!(a >= b)` idiom.
  const coordFxU = Math.fround(coordU32X);
  if (!(coordFxU >= dimXf)) {
    // continue in-bounds check
  } else {
    // br i1 %18 false -> label %64 : ret void.
    return;
  }
  const coordFyU = Math.fround(coordU32Y);
  if (!(coordFyU >= dimYf)) {
    // continue
  } else {
    return;
  }

  // %24 = coord_f + <0.5, 0.5>.
  const flowUvU = Math.fround(coordFx + Math.fround(0.5));
  const flowUvV = Math.fround(coordFy + Math.fround(0.5));

  // %25 = sample(flowIn, sam, %24) ; %27 = flow.xy.
  const flowSample = sampleFlow(flowIn, flowUvU, flowUvV);
  const flowX = Math.fround(flowSample[0]);
  const flowY = Math.fround(flowSample[1]);

  // %29 = load m_dt.
  const dt = Math.fround(params.m_dt);
  // %32 = -m_dt splat. %33 = fmuladd(-dt, flow, coord_f) = coord_f - dt*flow.
  //   IR uses `<-0.0, -0.0> - splat(dt)` -- fp32 subtract, then fmuladd.
  const negDt = Math.fround(Math.fround(-0.0) - dt);
  const warpedX = Math.fround(negDt * flowX + coordFx);
  const warpedY = Math.fround(negDt * flowY + coordFy);

  // %34 = <dimX_f - 1, dimY_f - 1>.
  const clampMaxX = Math.fround(dimXf + Math.fround(-1.0));
  const clampMaxY = Math.fround(dimYf + Math.fround(-1.0));

  // %35 = air.clamp.v2f32(warped, <0, 0>, <clampMax>).
  const clampedX = Math.fround(Math.min(Math.max(warpedX, Math.fround(0.0)), clampMaxX));
  const clampedY = Math.fround(Math.min(Math.max(warpedY, Math.fround(0.0)), clampMaxY));

  // %36 = air.floor.v2f32.
  const floorX = Math.fround(Math.floor(clampedX));
  const floorY = Math.fround(Math.floor(clampedY));

  // %37 = clamped - floor -- fractional part.
  const fractX = Math.fround(clampedX - floorX);
  const fractY = Math.fround(clampedY - floorY);

  // %38 = floor + <0.5, 0.5>.
  const baseU = Math.fround(floorX + Math.fround(0.5));
  const baseV = Math.fround(floorY + Math.fround(0.5));

  // %39, %40, %41 = base + <1,0>, <0,1>, <1,1>.
  const trU = Math.fround(baseU + Math.fround(1.0));
  const trV = baseV;
  const blU = baseU;
  const blV = Math.fround(baseV + Math.fround(1.0));
  const brU = Math.fround(baseU + Math.fround(1.0));
  const brV = Math.fround(baseV + Math.fround(1.0));

  // %42/%43 = sample(I1, sam, TL). Only .xy used (via %44 = TL.xy).
  const tl = sampleI1(I1, baseU, baseV);
  const tlX = Math.fround(tl[0]);
  const tlY = Math.fround(tl[1]);
  // %45/%46 = sample(I1, sam, TR).
  const tr = sampleI1(I1, trU, trV);
  const trX = Math.fround(tr[0]);
  const trY = Math.fround(tr[1]);
  // %47/%48 = sample(I1, sam, BL).
  const bl = sampleI1(I1, blU, blV);
  const blXv = Math.fround(bl[0]);
  const blYv = Math.fround(bl[1]);
  // %50/%51 = sample(I1, sam, BR).
  const br = sampleI1(I1, brU, brV);
  const brX = Math.fround(br[0]);
  const brY = Math.fround(br[1]);

  // %52 = splat(fract.x). %54 = (TR - TL).xy. %55 = fmuladd(fract.x, (TR-TL).xy, TL.xy).
  //   Top row lerp along X: top = TL + fract.x * (TR - TL).
  const topLerpX = Math.fround(fractX * Math.fround(trX - tlX) + tlX);
  const topLerpY = Math.fround(fractX * Math.fround(trY - tlY) + tlY);

  // %57 = (BR - BL).xy. %58 = fmuladd(fract.x, (BR-BL).xy, BL.xy).
  //   Bottom row lerp along X: bot = BL + fract.x * (BR - BL).
  const botLerpX = Math.fround(fractX * Math.fround(brX - blXv) + blXv);
  const botLerpY = Math.fround(fractX * Math.fround(brY - blYv) + blYv);

  // %59 = splat(fract.y). %60 = bot - top. %61 = fmuladd(fract.y, (bot - top), top).
  //   Vertical lerp: final = top + fract.y * (bot - top). Only lane 0 used further.
  const finalLane0 = Math.fround(fractY * Math.fround(botLerpX - topLerpX) + topLerpX);

  // %63 = <finalLane0, finalLane0, finalLane0, 1.0>.
  writeOutput(I1_flowWarped, coord[0] | 0, coord[1] | 0, [
    finalLane0,
    finalLane0,
    finalLane0,
    Math.fround(1.0),
  ]);

  // Reference the unused TR/BR .y computations to keep the transcription
  // faithful to the IR (%46/%51 loads both lanes even though only .x is
  // consumed by the bilinear result at %61[0]); the JS compiler and
  // typechecker discard them since they never reach the write. Kept as
  // dead-store variables above (`topLerpY`, `botLerpY`) mirroring the
  // 2-lane vector semantics of the IR.
  void topLerpY;
  void botLerpY;
}
