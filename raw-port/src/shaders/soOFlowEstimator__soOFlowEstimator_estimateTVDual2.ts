// @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual2 (HeliumSenso) @0x000000000bc97d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_estimateTVDual2.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000bc97d -- soOFlowEstimator::
// soOFlowEstimator_estimateTVDual2:` — that is the shader's entry
// offset in the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable` means
// standard IEEE-754 fp32 semantics — direct TS mapping via Math.fround
// on every fadd/fsub/fmul/fdiv; the two `llvm.fmuladd.v2f32` /
// `llvm.fmuladd.v4f32` intrinsics (%51, %59, %65) are documented as
// fp32-fused (the intrinsic contract is a single unrounded
// multiply-add) — modelled here as `Math.fround(a * b + c)` per
// raw-port/army/SHADERS.md.
//
// STRUCT-TYPE-NAME REUSE TRAP (see SHADERS.md): the AIR IR names the
// params struct `soOFlowEstimator::soOFlowEstimator_flowWarpOneImage_params`
// due to Apple's layout-compatible AIR-struct dedup, but the
// authoritative `!17`/`!18` field metadata says
// `soOFlowEstimator_estimateTVDual2_params` with fields:
//   offset 0: float m_tauDivTheta   -- CLG-TV solver scalar τ/θ.
//   offset 4: int   m_dimX          -- destination X extent (exclusive).
//   offset 8: int   m_dimY          -- destination Y extent (exclusive).
//
// Compute kernel signature (from !14..!23):
//   params  : constant address-space struct (see above).
//   coord   : uint2 — air.thread_position_in_grid (destination pixel).
//   sampler_nearest : sampler (index 0).
//   flowIn_  : texture2d<float, sample>  index 0 — the u vector field
//                                                  from the current TV
//                                                  outer iterate.
//   P_k_     : texture2d<float, sample>  index 1 — the dual variable
//                                                  from the previous
//                                                  inner iterate.
//   P_kp1_   : texture2d<float, write>   index 2 — the dual variable
//                                                  for the next inner
//                                                  iterate (this pass).
//
// AIR intrinsics used:
//   air.clamp.s.v2i32(v, lo, hi)              -- signed 2-lane int clamp.
//   air.convert.f.v2f32.s.v2i32(v)            -- SIGNED int->float 2-lane.
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//   air.sqrt.v2f32(v)                         -- component-wise fp32 sqrt.
//   llvm.fmuladd.v2f32(a, b, c)               -- fused fp32 multiply-add
//                                                on the two lanes.
//   llvm.fmuladd.v4f32(a, b, c)               -- fused fp32 multiply-add
//                                                on the four lanes.
//   air.write_texture_2d.v4f32(tex, coord, rgba, 0, 2) — write result.
//
// Silent-correctness notes (SHADERS.md):
//   - The int->float convert is `.s.` (signed) — a positive coord stays
//     positive, no unsigned-widen trap.
//   - Bounds guards use `icmp slt` for both axes (uniform signed) — no
//     ult/sgt asymmetry to preserve here.
//
// Line-by-line map of the .ll body:
//
//   block %6 (entry):
//     %7   = getelementptr params, i32 1                  -- &m_dimX
//     %8   = load i32 m_dimX
//     %9   = insertelement <2 x i32> undef, m_dimX, 0     -- .x = m_dimX
//     %10  = getelementptr params, i32 2                  -- &m_dimY
//     %11  = load i32 m_dimY
//     %12  = insertelement <2 x i32> %9, m_dimY, 1        -- .y = m_dimY
//     %13  = extractelement coord, 0                      -- coord.x
//     %14  = icmp slt coord.x, m_dimX                     -- X in-bounds?
//     br i1 %14, label %15, label %67                     -- OOB: ret.
//
//   block %15:
//     %16  = extractelement coord, 1                      -- coord.y
//     %17  = icmp slt coord.y, m_dimY                     -- Y in-bounds?
//     br i1 %17, label %18, label %67                     -- OOB: ret.
//
//   block %18 (both bounds pass):
//     %19  = coord + <0, 1>                               -- south neighbour
//     %20  = <dimX, dimY> - <1, 1>                        -- clamp upper
//     %21  = air.clamp.s.v2i32(%19, <0,0>, %20)           -- clamped south
//     %22  = coord + <1, 0>                               -- east neighbour
//     %23  = air.clamp.s.v2i32(%22, <0,0>, %20)           -- clamped east
//     %24  = air.convert.f.v2f32.s.v2i32(coord)           -- coord as fp32
//     %25  = %24 + <0.5, 0.5>                             -- pixel-centre UV
//     %26  = air.sample_texture_2d(flowIn_, sampler, %25) -- centre sample
//     %27  = extractvalue %26, 0                          -- rgba of centre
//     %28  = air.convert.f.v2f32.s.v2i32(%23)             -- east as fp32
//     %29  = %28 + <0.5, 0.5>                             -- east UV
//     %30  = air.sample_texture_2d(flowIn_, sampler, %29) -- east sample
//     %31  = air.convert.f.v2f32.s.v2i32(%21)             -- south as fp32
//     %32  = %31 + <0.5, 0.5>                             -- south UV
//     %33  = air.sample_texture_2d(flowIn_, sampler, %32) -- south sample
//     %34  = extractvalue %33, 0                          -- rgba of south
//     %35  = %34 - %27                                    -- south - centre (v4f32)
//     %36  = shufflevector %35, <2 x i32> <0, 1>          -- .xy lanes  (dy)
//     %37  = icmp eq coord.x, 0                           -- left edge?
//     %38  = extractvalue %30, 0                          -- rgba of east
//     %39  = %38 - %27                                    -- east - centre (v4f32)
//     %40  = shufflevector %39, <2 x i32> <0, 1>          -- .xy lanes  (dx)
//     %41  = m_dimX - 1                                   -- right edge idx
//     %42  = icmp eq coord.x, %41                         -- right edge?
//     %43  = or i1 %37, %42                               -- horizontal edge?
//     %44  = select %43, <0, 0>, %40                      -- zero dx at edge
//     %45  = icmp eq coord.y, 0                           -- top edge?
//     %46  = m_dimY - 1                                   -- bottom edge idx
//     %47  = icmp eq coord.y, %46                         -- bottom edge?
//     %48  = or i1 %45, %47                               -- vertical edge?
//     %49  = select %48, <0, 0>, %36                      -- zero dy at edge
//     %50  = %49 * %49                                    -- dy^2 (per-lane)
//     %51  = llvm.fmuladd.v2f32(%44, %44, %50)            -- dx^2 + dy^2
//     %52  = air.sqrt.v2f32(%51)                          -- |grad| per-lane
//     %53  = air.sample_texture_2d(P_k_, sampler, %25)    -- P_k centre sample
//     %54  = extractvalue %53, 0                          -- P_k rgba
//     %55  = getelementptr params, i32 0                  -- &m_tauDivTheta
//     %56  = load float m_tauDivTheta
//     %57  = insertelement <2 x float> undef, m_tauDivTheta, 0
//     %58  = shufflevector %57, <2 x i32> zeroinitializer -- broadcast to <2 x f32>
//     %59  = llvm.fmuladd.v2f32(%58, %52, <1.0, 1.0>)     -- 1 + τθ * |grad|
//     %60  = <1.0, 1.0> / %59                             -- reciprocal (1/(1+τθ|g|))
//     %61  = shufflevector %60, <4 x i32> <0,1,0,1>       -- broadcast to <4 x f32>
//     %62  = insertelement <4 x float> undef, m_tauDivTheta, 0
//     %63  = shufflevector %62, <4 x i32> zeroinitializer -- broadcast τθ to <4 x f32>
//     %64  = shufflevector %44, %49, <4 x i32> <0,1,2,3>  -- (dx.x, dx.y, dy.x, dy.y)
//     %65  = llvm.fmuladd.v4f32(%63, %64, %54)            -- P_k + τθ * grad4
//     %66  = %65 * %61                                    -- divide by denom
//     air.write_texture_2d.v4f32(P_kp1_, coord, %66, 0, 2)
//     br label %67
//
//   block %67: ret void.
//
// SHUFFLE-AND-FMULADD DERIVATION (the %64 pair -> writeout maths):
//   The IR builds a <4 x float> vector `grad4 = (dx.x, dx.y, dy.x, dy.y)`
//   at %64 by shufflevector from the two 2-vectors %44 (dx, horizontal
//   difference) and %49 (dy, vertical difference). It then applies
//   `fmuladd(<τθ,τθ,τθ,τθ>, grad4, P_k_rgba)` producing per-lane
//   `P_k[i] + τθ * grad4[i]`. Finally it scales lanes 0/1 by the
//   reciprocal from %60.x and lanes 2/3 by %60.y (the two lanes are
//   independent — the reciprocal came from a 2-vector fmuladd of
//   `τθ * |grad|` where |grad| itself is a 2-vector, one per axis).
//
//   So the four output channels are:
//     R = (P_k.r + τθ * dx.x) / (1 + τθ * |grad|.x)
//     G = (P_k.g + τθ * dx.y) / (1 + τθ * |grad|.x)
//     B = (P_k.b + τθ * dy.x) / (1 + τθ * |grad|.y)
//     A = (P_k.a + τθ * dy.y) / (1 + τθ * |grad|.y)
//   where |grad|.x = sqrt(dx.x^2 + dy.x^2) and
//         |grad|.y = sqrt(dx.y^2 + dy.y^2).
//   This is the classic Chambolle-projected dual update for
//   two coupled scalar TV problems packed into 4 channels.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_estimateTVDual2` — mirrors the
 * AIR struct at !18 (12-byte packed record, four-byte fields). The
 * AIR struct-type name in the IR is the layout-compatible sibling
 * `soOFlowEstimator_flowWarpOneImage_params`; the field metadata in
 * !18 is authoritative (per raw-port/army/SHADERS.md).
 */
export interface SoOFlowEstimatorEstimateTVDual2Params {
  m_tauDivTheta: number; // offset 0 : float — τ/θ scalar
  m_dimX: number;        // offset 4 : int   — X extent, exclusive
  m_dimY: number;        // offset 8 : int   — Y extent, exclusive
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the float
 * texture at (u, v) with the bound sampler and returns the four rgba
 * lanes. `sampler_nearest` in the IR: nearest-neighbour + clamp-to-
 * edge in pixel-space at the pixel-centre UV `coord + 0.5`.
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
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_estimateTVDual2`.
 *
 * Chambolle-projected dual update for the TV (total-variation)
 * regularizer, packed for two independent scalar TV problems (four
 * channels total: two per axis of the flow field). For each in-
 * bounds destination pixel (`coord.x`, `coord.y`) it:
 *
 *   1. Reads `flowIn_` at the pixel centre (`coord + 0.5`),
 *      the east neighbour (`coord + <1,0>` clamped to bounds),
 *      and the south neighbour (`coord + <0,1>` clamped to bounds).
 *   2. Forms the forward differences `dx = east - centre`,
 *      `dy = south - centre` (as <2 x float> pairs from the .xy lanes
 *      of the sampled rgba). At the horizontal/vertical image edges
 *      the corresponding difference is forced to zero — Neumann
 *      boundary condition on the gradient.
 *   3. Reads `P_k_` at the pixel centre (the previous dual iterate).
 *   4. Computes the per-lane gradient magnitude
 *      `|grad| = sqrt(dx*dx + dy*dy)` (as a <2 x float>: one per
 *      packed scalar TV problem), the denominator
 *      `denom = 1 + τθ * |grad|`, and writes
 *      `P_kp1 = (P_k + τθ * grad4) / denom_broadcast4`.
 *
 * Denorms are disabled and fast-math is disabled per the compile-
 * options metadata — every fp32 op is bit-exact IEEE-754 (Math.fround
 * on each intermediate). The three `fmuladd` intrinsics are modelled
 * as unrounded `Math.fround(a*b + c)` (a single fp32 rounding step).
 *
 * @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual2 (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_estimateTVDual2<
  TFlowIn,
  TPk,
  TPkp1,
>(
  params: SoOFlowEstimatorEstimateTVDual2Params,
  coord: [number, number],
  flowIn_: TFlowIn,
  P_k_: TPk,
  P_kp1_: TPkp1,
  sampleFlowIn: SampleFloatTex2D<TFlowIn>,
  samplePk: SampleFloatTex2D<TPk>,
  writePkp1: WriteFloatTex2D<TPkp1>,
): void {
  // %8, %11 : load m_dimX, m_dimY.
  const dimX = params.m_dimX | 0;
  const dimY = params.m_dimY | 0;

  // %13, %14 : coord.x vs m_dimX bounds check (signed slt).
  const coordX = coord[0] | 0;
  if (!(coordX < dimX)) {
    // br i1 %14 false -> label %67 : ret void.
    return;
  }

  // %16, %17 : coord.y vs m_dimY bounds check (signed slt).
  const coordY = coord[1] | 0;
  if (!(coordY < dimY)) {
    // br i1 %17 false -> label %67 : ret void.
    return;
  }

  // %19 = coord + <0, 1>  -- south neighbour.
  // %20 = <dimX, dimY> - <1, 1> -- clamp upper bound (last valid index).
  // %21 = air.clamp.s.v2i32(%19, <0,0>, %20) -- clamped south coord.
  const southRawX = coordX + 0;
  const southRawY = coordY + 1;
  const maxX = (dimX - 1) | 0;
  const maxY = (dimY - 1) | 0;
  const southX = Math.min(Math.max(southRawX, 0), maxX) | 0;
  const southY = Math.min(Math.max(southRawY, 0), maxY) | 0;

  // %22 = coord + <1, 0>  -- east neighbour.
  // %23 = air.clamp.s.v2i32(%22, <0,0>, %20) -- clamped east coord.
  const eastRawX = coordX + 1;
  const eastRawY = coordY + 0;
  const eastX = Math.min(Math.max(eastRawX, 0), maxX) | 0;
  const eastY = Math.min(Math.max(eastRawY, 0), maxY) | 0;

  // %24 = air.convert.f.v2f32.s.v2i32(coord) -- SIGNED int->float.
  //   `.s.` variant: sign preserved (coord is a valid in-bounds non-
  //   negative integer here so it round-trips exactly).
  // %25 = %24 + <0.5, 0.5> -- pixel-centre UV.
  const centreU = Math.fround(Math.fround(coordX) + Math.fround(0.5));
  const centreV = Math.fround(Math.fround(coordY) + Math.fround(0.5));

  // %26 = air.sample_texture_2d(flowIn_, sampler, %25, ...)
  // %27 = extractvalue %26, 0 -- rgba of centre.
  const centreRGBA = sampleFlowIn(flowIn_, centreU, centreV);
  const centreR = Math.fround(centreRGBA[0]);
  const centreG = Math.fround(centreRGBA[1]);
  const centreB = Math.fround(centreRGBA[2]);
  const centreA = Math.fround(centreRGBA[3]);

  // %28 = air.convert.f.v2f32.s.v2i32(%23) -- east coord as fp32.
  // %29 = %28 + <0.5, 0.5>                 -- east UV.
  // %30 = air.sample_texture_2d(flowIn_, sampler, %29, ...)
  const eastU = Math.fround(Math.fround(eastX) + Math.fround(0.5));
  const eastV = Math.fround(Math.fround(eastY) + Math.fround(0.5));
  const eastRGBA = sampleFlowIn(flowIn_, eastU, eastV);
  const eastR = Math.fround(eastRGBA[0]);
  const eastG = Math.fround(eastRGBA[1]);

  // %31 = air.convert.f.v2f32.s.v2i32(%21) -- south coord as fp32.
  // %32 = %31 + <0.5, 0.5>                 -- south UV.
  // %33 = air.sample_texture_2d(flowIn_, sampler, %32, ...)
  // %34 = extractvalue %33, 0              -- rgba of south.
  const southU = Math.fround(Math.fround(southX) + Math.fround(0.5));
  const southV = Math.fround(Math.fround(southY) + Math.fround(0.5));
  const southRGBA = sampleFlowIn(flowIn_, southU, southV);
  const southR = Math.fround(southRGBA[0]);
  const southG = Math.fround(southRGBA[1]);

  // %35 = %34 - %27         -- south - centre (v4f32).
  // %36 = shufflevector .xy -- south-minus-centre .xy lanes (dy pair).
  const dyRaw0 = Math.fround(southR - centreR);
  const dyRaw1 = Math.fround(southG - centreG);

  // %38 = extractvalue %30, 0 (east rgba).
  // %39 = %38 - %27         -- east - centre (v4f32).
  // %40 = shufflevector .xy -- east-minus-centre .xy lanes (dx pair).
  const dxRaw0 = Math.fround(eastR - centreR);
  const dxRaw1 = Math.fround(eastG - centreG);

  // %37 = icmp eq coord.x, 0                 -- left edge?
  // %41 = m_dimX - 1
  // %42 = icmp eq coord.x, m_dimX - 1        -- right edge?
  // %43 = or %37, %42                        -- horizontal edge?
  // %44 = select %43, <0, 0>, %40            -- zero dx at horizontal edges.
  const horizEdge = coordX === 0 || coordX === (dimX - 1);
  const dx0 = horizEdge ? Math.fround(0) : dxRaw0;
  const dx1 = horizEdge ? Math.fround(0) : dxRaw1;

  // %45 = icmp eq coord.y, 0                 -- top edge?
  // %46 = m_dimY - 1
  // %47 = icmp eq coord.y, m_dimY - 1        -- bottom edge?
  // %48 = or %45, %47                        -- vertical edge?
  // %49 = select %48, <0, 0>, %36            -- zero dy at vertical edges.
  const vertEdge = coordY === 0 || coordY === (dimY - 1);
  const dy0 = vertEdge ? Math.fround(0) : dyRaw0;
  const dy1 = vertEdge ? Math.fround(0) : dyRaw1;

  // %50 = %49 * %49                          -- dy^2 (per-lane).
  const dy0Sq = Math.fround(dy0 * dy0);
  const dy1Sq = Math.fround(dy1 * dy1);

  // %51 = llvm.fmuladd.v2f32(%44, %44, %50)  -- dx^2 + dy^2 (fused fp32).
  const magSq0 = Math.fround(dx0 * dx0 + dy0Sq);
  const magSq1 = Math.fround(dx1 * dx1 + dy1Sq);

  // %52 = air.sqrt.v2f32(%51)                -- per-lane fp32 sqrt.
  const mag0 = Math.fround(Math.sqrt(magSq0));
  const mag1 = Math.fround(Math.sqrt(magSq1));

  // %53 = air.sample_texture_2d(P_k_, sampler, %25, ...)  -- P_k centre.
  // %54 = extractvalue %53, 0                             -- P_k rgba.
  const pkRGBA = samplePk(P_k_, centreU, centreV);
  const pkR = Math.fround(pkRGBA[0]);
  const pkG = Math.fround(pkRGBA[1]);
  const pkB = Math.fround(pkRGBA[2]);
  const pkA = Math.fround(pkRGBA[3]);

  // %55, %56 = load params.m_tauDivTheta.
  // %57, %58 = broadcast m_tauDivTheta to <2 x float>.
  const tau = Math.fround(params.m_tauDivTheta);

  // %59 = llvm.fmuladd.v2f32(%58, %52, <1.0, 1.0>)
  //         -- 1 + τθ * |grad| (fused fp32, per-lane).
  const denom0 = Math.fround(tau * mag0 + Math.fround(1.0));
  const denom1 = Math.fround(tau * mag1 + Math.fround(1.0));

  // %60 = <1.0, 1.0> / %59                    -- reciprocal per-lane.
  const inv0 = Math.fround(Math.fround(1.0) / denom0);
  const inv1 = Math.fround(Math.fround(1.0) / denom1);

  // %61 = shufflevector %60, <4 x i32> <0,1,0,1>
  //         -- broadcast reciprocal to <4 x f32>: (inv0, inv1, inv0, inv1).
  //   Note: lanes 0/1 come from inv0/inv1 respectively (NOT inv0 twice),
  //   because %60 is <2 x float> and the shuffle picks indices <0,1,0,1>.

  // %62, %63 = broadcast m_tauDivTheta to <4 x float>.
  // %64 = shufflevector %44, %49, <4 x i32> <0,1,2,3>
  //         -- (dx0, dx1, dy0, dy1). Note: the two source vectors are
  //         each <2 x float>, so lanes 0,1 come from %44 and lanes 2,3
  //         come from %49.
  // %65 = llvm.fmuladd.v4f32(%63, %64, %54)
  //         -- P_k + τθ * grad4 (fused fp32, per-lane).
  const num0 = Math.fround(tau * dx0 + pkR);
  const num1 = Math.fround(tau * dx1 + pkG);
  const num2 = Math.fround(tau * dy0 + pkB);
  const num3 = Math.fround(tau * dy1 + pkA);

  // %66 = %65 * %61                           -- per-lane fp32 multiply.
  //   Lane 0 -> inv0, Lane 1 -> inv1, Lane 2 -> inv0, Lane 3 -> inv1.
  const outR = Math.fround(num0 * inv0);
  const outG = Math.fround(num1 * inv1);
  const outB = Math.fround(num2 * inv0);
  const outA = Math.fround(num3 * inv1);

  // air.write_texture_2d.v4f32(P_kp1_, coord, %66, 0, 2).
  writePkp1(P_kp1_, coordX, coordY, [outR, outG, outB, outA]);
  // br label %67 (ret void).
}
