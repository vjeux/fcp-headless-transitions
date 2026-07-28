// @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual1 (HeliumSenso) @0x000000000b872d
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/
// soOFlowEstimator__soOFlowEstimator_estimateTVDual1.ll, extracted via
// raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. Header
// line reads `0x000000000b872d -- soOFlowEstimator::
// soOFlowEstimator_estimateTVDual1:` — the shader's entry offset in
// the metallib. Compile options in the .ll:
// `air.compile.denorms_disable`, `air.compile.fast_math_disable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_disable` means
// standard IEEE-754 fp32 semantics — direct TS mapping via Math.fround.
// The two `llvm.fmuladd.v2f32` intrinsics at %60 and %136 are
// fp32-fused (one rounding at the end); modelled as
// `Math.fround(a*b + c)`. `air.dot.v2f32` is transcribed as
// `Math.fround(a0*b0 + a1*b1)` (per raw-port/army/SHADERS.md — sum of
// products, single fp32 rounding at the sum).
//
// Compute kernel signature (from !14..!28):
//   params           : constant struct at !18 — 24 bytes:
//                       offset  0: float m_dt
//                       offset  4: float m_theta
//                       offset  8: float m_lambdaTheta
//                       offset 12: float m_scaleFlowOut
//                       offset 16: int   m_dimX
//                       offset 20: int   m_dimY
//   coord_           : uint2 — thread_position_in_grid.
//   sampler_nearest  : sampler index 0.
//   I1_flowWarped_       : texture2d<float, sample> index 0 (%3).
//   I2_flowWarped_       : texture2d<float, sample> index 1 (%4).
//   I1_flowWarpedGrad_   : texture2d<float, sample> index 2 (%5).
//   I2_flowWarpedGrad_   : texture2d<float, sample> index 3 (%6).
//   flow_k0_             : texture2d<float, sample> index 4 (%7).
//   flow_k_              : texture2d<float, sample> index 5 (%8).
//   flow_kp1_            : texture2d<float, write>  index 6 (%9).
//   P_                   : texture2d<float, sample> index 7 (%10).
//
// AIR intrinsics used:
//   air.convert.f.v2f32.s.v2i32      -- SIGNED int->float on the sample
//                                        coordinate (per SHADERS.md the
//                                        .s. variant preserves sign).
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//   air.dot.v2f32(<2 x f>, <2 x f>)  -- dot of two 2-lane vectors.
//   air.clamp.s.v2i32(v, lo, hi)     -- clamp integer coord into
//                                        [0, dim-1] before sampling
//                                        the divergence stencil.
//   llvm.fmuladd.v2f32(a, b, c)      -- fp32-fused multiply-add.
//   air.write_texture_2d.v4f32(tex, coord, rgba, 0, 2) -- write.
//
// This shader is one iteration of the TV-L1 optical-flow chambolle-pock
// dual update ("estimateTVDual1"): a shrinkage of the data term (using
// the mixed I1/I2 warped-gradient and residual rho) followed by the
// dual/primal add-in of the divergence of the P field. The P texture
// packs a 2x2 tensor per pixel as one <4 x f> (lanes .xy = P_row_flow_x,
// lanes .zw = P_row_flow_y); the divergence uses forward differences
// (P_center - P_upstream) with Neumann boundary handling (0 outside).
//
// Line-by-line map:
//
//   entry %11:
//     %13 = load m_dimX
//     %16 = load m_dimY
//     %17 = <m_dimX, m_dimY>
//     %18 = coord.x
//     %19 = icmp slt coord.x, m_dimX
//     br i1 %19, label %20, label %144  -- OOB X: ret.
//
//   %20:
//     %21 = coord.y
//     %22 = icmp slt coord.y, m_dimY
//     br i1 %22, label %23, label %144  -- OOB Y: ret.
//
//   %23 (in bounds — data term):
//     %24 = air.convert.f.v2f32.s.v2i32(coord)          -- signed cast.
//     %25 = %24 + <0.5, 0.5>                            -- half-pixel bias.
//     %27 = sample(flow_k0, sam, %25)                    (%7 index 4)
//     %29 = sample(flow_k,  sam, %25)                    (%8 index 5)
//     %30 = flow_k.xy
//     %31 = flow_k - flow_k0                             (as <4 x f>)
//     %32 = (flow_k - flow_k0).xy                        -- delta.
//     %34 = sample(I1_flowWarped, sam, %25)              (%3)
//     %35 = extractelement %34, 0                        -- I1_r.
//     %37 = sample(I2_flowWarped, sam, %25)              (%4)
//     %38 = extractelement %37, 0                        -- I2_r.
//     %40 = sample(I1_flowWarpedGrad, sam, %25)          (%5)
//     %41 = I1grad.xy
//     %43 = sample(I2_flowWarpedGrad, sam, %25)          (%6)
//     %44 = I2grad.xy
//     %46 = load m_dt                                    -- alpha weight.
//     %47 = 1 - m_dt
//     %48 = dot(I1grad.xy, delta.xy)
//     %49 = m_dt * %48
//     %50 = dot(I2grad.xy, delta.xy)
//     %51 = (1 - m_dt) * %50
//     %52 = I2 - I1
//     %53 = %52 + %49
//     %54 = %53 + %51                                    -- rho.
//     %55/%56 = splat(m_dt)          -- 2-lane.
//     %57/%58 = splat(1 - m_dt)      -- 2-lane.
//     %59 = I2grad.xy * (1 - m_dt)
//     %60 = fmuladd(splat_dt, I1grad.xy, %59)            -- wgrad =
//                                                          dt*I1 + (1-dt)*I2.
//     %61 = dot(wgrad, wgrad)                            -- |wgrad|^2.
//     %63 = load m_lambdaTheta
//     %64 = |wgrad|^2 * lambdaTheta                      -- +thresh.
//     %66 = splat(lambdaTheta)
//     %67 = wgrad * lambdaTheta                          -- 2-lane.
//     %68 = -%64                                         -- -thresh.
//     %69 = fcmp ugt rho, -thresh                        -- rho > -thresh
//                                                          (UNORDERED —
//                                                          preserved as
//                                                          `!(rho <= -thresh)`
//                                                          in JS to reflect
//                                                          NaN behaviour).
//     br i1 %69, label %72, label %70
//
//   %70 (rho <= -thresh):
//     %71 = flow_k.xy + wgrad*lambdaTheta                -- add.
//     br label %86
//
//   %72:
//     %73 = fcmp ogt rho, -thresh                        -- rho > -thresh (o)
//     %74 = fcmp olt rho, +thresh                        -- rho < +thresh
//     %75 = %73 AND %74
//     br i1 %75, label %76, label %84
//
//   %76 (|rho| < thresh — soft-thresh):
//     %77/%78 = splat(rho).
//     %79 = wgrad * rho.
//     %80/%81 = splat(|wgrad|^2).
//     %82 = %79 / |wgrad|^2                              -- wgrad*rho/|w|^2.
//     %83 = flow_k.xy - %82.
//     br label %86
//
//   %84 (rho >= +thresh):
//     %85 = flow_k.xy - wgrad*lambdaTheta.
//     br label %86
//
//   %86 (phi %87 — shrinkage result):
//     %87 = phi [%71 from %70, %83 from %76, %85 from %84].
//     %88 = coord + <0, -1>                               -- up neighbour.
//     %89 = <m_dimX-1, m_dimY-1>                          -- clamp hi.
//     %90 = air.clamp.s.v2i32(up, 0, dim-1).
//     %91 = coord + <-1, 0>                               -- left neighbour.
//     %92 = air.clamp.s.v2i32(left, 0, dim-1).
//     %93 = sample(P, sam, %25)                           -- P_center.
//     %95 = convert.s.v2i32.v2f32(%90)
//     %96 = %95 + <0.5, 0.5>
//     %97 = sample(P, sam, %96)                           -- P_up.
//     %99 = convert.s.v2i32.v2f32(%92)
//     %100 = %99 + <0.5, 0.5>
//     %101 = sample(P, sam, %100)                         -- P_left.
//     %103 = icmp eq coord.x, 0
//     br i1 %103, label %104, label %106
//
//   %104 (coord.x == 0 — left edge):
//     %105 = P_center.xy                                  -- forward diff
//                                                            from 0 (Neumann).
//     br label %115
//
//   %106:
//     %107 = m_dimX - 1
//     %108 = icmp eq coord.x, dimX-1
//     br i1 %108, label %109, label %112
//
//   %109 (right edge):
//     %110 = P_left.xy
//     %111 = -P_left.xy                                   -- backward diff
//                                                            to 0 (Neumann).
//     br label %115
//
//   %112 (interior x):
//     %113 = P_center - P_left                            -- backward diff.
//     %114 = %113.xy
//     br label %115
//
//   %115 (phi %116 — x-partial of P.xy):
//     %117 = icmp eq coord.y, 0
//     br i1 %117, label %118, label %120
//
//   %118 (coord.y == 0 — top edge):
//     %119 = P_center.zw                                  -- .zw is Py.
//     br label %129
//
//   %120:
//     %121 = m_dimY - 1
//     %122 = icmp eq coord.y, dimY-1
//     br i1 %122, label %123, label %126
//
//   %123 (bottom edge):
//     %124 = P_up.zw
//     %125 = -P_up.zw
//     br label %129
//
//   %126 (interior y):
//     %127 = P_center - P_up
//     %128 = %127.zw
//     br label %129
//
//   %129 (phi %130 — y-partial of P.zw):
//     %131 = %116 + %130                                  -- divergence.
//     %133 = load m_theta
//     %135 = splat(m_theta)
//     %136 = fmuladd(splat_theta, div, shrink)            -- theta*div + shrink.
//     %137 = %136 lifted to <4 x f> with lanes 2/3 undef.
//     %138 = shufflevector <lanes 0,1 from %137, lanes 2/3 = 0>
//                                                          -- (x, y, 0, 0).
//     %140 = load m_scaleFlowOut
//     %142 = splat(m_scaleFlowOut, <4>).
//     %143 = scale * %138                                 -- final RGBA.
//     air.write_texture_2d.v4f32(flow_kp1, coord, %143, 0, 2)
//     br label %144
//
//   %144: ret void.

/**
 * Params buffer for
 * `soOFlowEstimator::soOFlowEstimator_estimateTVDual1` — mirrors the
 * AIR struct at !18 (24-byte packed record, four-byte fields).
 */
export interface SoOFlowEstimatorEstimateTVDual1Params {
  m_dt: number;           // offset  0 : float — mix weight for I1 vs I2.
  m_theta: number;        // offset  4 : float — TV-L1 dual step.
  m_lambdaTheta: number;  // offset  8 : float — data-term threshold.
  m_scaleFlowOut: number; // offset 12 : float — global output scale.
  m_dimX: number;         // offset 16 : int   — X extent (exclusive).
  m_dimY: number;         // offset 20 : int   — Y extent (exclusive).
}

/** Callback for AIR `air.sample_texture_2d.v4f32`. */
export type SampleFloatTex2D<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/** Callback for AIR `air.write_texture_2d.v4f32`. */
export type WriteFloatTex2D<T> = (texture: T, x: number, y: number, rgba: [number, number, number, number]) => void;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_estimateTVDual1`.
 *
 * One iteration of the TV-L1 primal update in the Chambolle-Pock
 * optical-flow solver: shrinks the data term against threshold
 * `m_lambdaTheta * |wgrad|^2` using the mixed warped gradient
 * `wgrad = m_dt * gradI1 + (1 - m_dt) * gradI2` and the residual
 * `rho = (I2 - I1) + wgrad . (flow_k - flow_k0)`; then adds
 * `m_theta * div(P)` and scales the result by `m_scaleFlowOut`. The
 * P texture packs one <4 x f> per pixel with lanes `.xy` holding the
 * dual variable for the flow-x row and lanes `.zw` the flow-y row —
 * divergence is `∂x(P.xy) + ∂y(P.zw)` with Neumann boundary handling
 * (forward difference from zero at the left/top edge, backward
 * difference to zero at the right/bottom edge, centred backward
 * difference in the interior — matching what the IR spells out at
 * blocks %104..%128).
 *
 * @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual1 (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_estimateTVDual1<
  TI1,
  TI2,
  TI1g,
  TI2g,
  TFk0,
  TFk,
  TFkp1,
  TP,
>(
  params: SoOFlowEstimatorEstimateTVDual1Params,
  coord: [number, number],
  I1_flowWarped: TI1,
  I2_flowWarped: TI2,
  I1_flowWarpedGrad: TI1g,
  I2_flowWarpedGrad: TI2g,
  flow_k0: TFk0,
  flow_k: TFk,
  flow_kp1: TFkp1,
  P: TP,
  sampleI1: SampleFloatTex2D<TI1>,
  sampleI2: SampleFloatTex2D<TI2>,
  sampleI1g: SampleFloatTex2D<TI1g>,
  sampleI2g: SampleFloatTex2D<TI2g>,
  sampleFk0: SampleFloatTex2D<TFk0>,
  sampleFk: SampleFloatTex2D<TFk>,
  sampleP: SampleFloatTex2D<TP>,
  writeFkp1: WriteFloatTex2D<TFkp1>,
): void {
  // %13, %16, %17 : dim x/y (as an int2).
  const dimX = params.m_dimX | 0;
  const dimY = params.m_dimY | 0;

  // %18, %19 : X bound (signed slt).
  const coordX = coord[0] | 0;
  if (!(coordX < dimX)) {
    return;
  }

  // %21, %22 : Y bound (signed slt).
  const coordY = coord[1] | 0;
  if (!(coordY < dimY)) {
    return;
  }

  // %24 = signed int->float, %25 += <0.5, 0.5>.
  const uv0U = Math.fround(Math.fround(coordX) + Math.fround(0.5));
  const uv0V = Math.fround(Math.fround(coordY) + Math.fround(0.5));

  // %26/%27 = sample(flow_k0, ...). Only .xy is used further via the
  //   fsub at %31 producing the delta.
  const fk0Sample = sampleFk0(flow_k0, uv0U, uv0V);
  const fk0X = Math.fround(fk0Sample[0]);
  const fk0Y = Math.fround(fk0Sample[1]);

  // %28/%29 = sample(flow_k, ...). %30 = flow_k.xy.
  const fkSample = sampleFk(flow_k, uv0U, uv0V);
  const fkX = Math.fround(fkSample[0]);
  const fkY = Math.fround(fkSample[1]);

  // %31 = flow_k - flow_k0 (as <4 x f>), %32 = .xy = delta.
  const deltaX = Math.fround(fkX - fk0X);
  const deltaY = Math.fround(fkY - fk0Y);

  // %33/%34 = sample(I1_flowWarped, ...) ; %35 = .r.
  const I1r = Math.fround(sampleI1(I1_flowWarped, uv0U, uv0V)[0]);
  // %36/%37 = sample(I2_flowWarped, ...) ; %38 = .r.
  const I2r = Math.fround(sampleI2(I2_flowWarped, uv0U, uv0V)[0]);

  // %39/%40 = sample(I1_flowWarpedGrad, ...) ; %41 = .xy.
  const g1Sample = sampleI1g(I1_flowWarpedGrad, uv0U, uv0V);
  const g1x = Math.fround(g1Sample[0]);
  const g1y = Math.fround(g1Sample[1]);
  // %42/%43 = sample(I2_flowWarpedGrad, ...) ; %44 = .xy.
  const g2Sample = sampleI2g(I2_flowWarpedGrad, uv0U, uv0V);
  const g2x = Math.fround(g2Sample[0]);
  const g2y = Math.fround(g2Sample[1]);

  // %46 = load m_dt ; %47 = 1 - m_dt.
  const dt = Math.fround(params.m_dt);
  const oneMinusDt = Math.fround(Math.fround(1.0) - dt);

  // %48 = dot(I1grad, delta) ; %49 = dt * dot1.
  const dot1 = Math.fround(Math.fround(g1x * deltaX) + Math.fround(g1y * deltaY));
  const term1 = Math.fround(dt * dot1);
  // %50 = dot(I2grad, delta) ; %51 = (1-dt) * dot2.
  const dot2 = Math.fround(Math.fround(g2x * deltaX) + Math.fround(g2y * deltaY));
  const term2 = Math.fround(oneMinusDt * dot2);

  // %52 = I2 - I1 ; %53 = %52 + term1 ; %54 = %53 + term2 = rho.
  const iDiff = Math.fround(I2r - I1r);
  const rho = Math.fround(Math.fround(iDiff + term1) + term2);

  // %59 = I2grad * (1-dt) ; %60 = fmuladd(splat_dt, I1grad, %59)
  //   -- fp32-fused multiply-add.
  const wgradX = Math.fround(dt * g1x + Math.fround(oneMinusDt * g2x));
  const wgradY = Math.fround(dt * g1y + Math.fround(oneMinusDt * g2y));

  // %61 = dot(wgrad, wgrad) = |wgrad|^2.
  const wgradSq = Math.fround(Math.fround(wgradX * wgradX) + Math.fround(wgradY * wgradY));

  // %63 = load m_lambdaTheta.
  const lambdaTheta = Math.fround(params.m_lambdaTheta);
  // %64 = |wgrad|^2 * lambdaTheta = +thresh.
  const thresh = Math.fround(wgradSq * lambdaTheta);
  // %67 = wgrad * lambdaTheta.
  const wgradTX = Math.fround(wgradX * lambdaTheta);
  const wgradTY = Math.fround(wgradY * lambdaTheta);
  // %68 = -thresh.
  const negThresh = Math.fround(-thresh);

  // %69 = fcmp ugt rho, -thresh -- UNORDERED greater-than. Preserved
  //   as `!(rho <= -thresh)` in JS: any NaN input takes the true path
  //   (matching the IEEE unordered semantics of `ugt`).
  //   Branch %72 (true) -> possibly %76 or %84 ; else %70.
  let shrinkX: number;
  let shrinkY: number;
  if (!(rho <= negThresh)) {
    // %72 : test %73 (ogt rho, -thresh) AND %74 (olt rho, +thresh).
    //   Both are ordered comparisons; NaN makes both false so the
    //   composite is false and control drops to %84 (rho-above-thresh
    //   branch). This is the standard TV-L1 shrinkage cascade.
    const rhoGtNeg = rho > negThresh;
    const rhoLtPos = rho < thresh;
    if (rhoGtNeg && rhoLtPos) {
      // %76 : soft-thresh -- flow_k.xy - (wgrad * rho) / |wgrad|^2.
      //   The IR uses fdiv <2 x f>, splat(|wgrad|^2). At |wgrad|^2 == 0
      //   this produces IEEE +/-inf or NaN, preserved literally.
      const numerX = Math.fround(wgradX * rho);
      const numerY = Math.fround(wgradY * rho);
      const divX = Math.fround(numerX / wgradSq);
      const divY = Math.fround(numerY / wgradSq);
      shrinkX = Math.fround(fkX - divX);
      shrinkY = Math.fround(fkY - divY);
    } else {
      // %84 : rho above +thresh (or NaN) -- flow_k.xy - wgrad*lambdaTheta.
      shrinkX = Math.fround(fkX - wgradTX);
      shrinkY = Math.fround(fkY - wgradTY);
    }
  } else {
    // %70 : rho <= -thresh -- flow_k.xy + wgrad*lambdaTheta.
    shrinkX = Math.fround(fkX + wgradTX);
    shrinkY = Math.fround(fkY + wgradTY);
  }

  // %88 = coord + <0, -1> -- up neighbour ; clamped to [0, dim-1].
  const upX = coordX;
  const upY = (coordY - 1) | 0;
  const clampMaxX = (dimX - 1) | 0;
  const clampMaxY = (dimY - 1) | 0;
  const upClampX = Math.min(Math.max(upX, 0), clampMaxX) | 0;
  const upClampY = Math.min(Math.max(upY, 0), clampMaxY) | 0;

  // %91 = coord + <-1, 0> -- left neighbour ; clamped.
  const leftX = (coordX - 1) | 0;
  const leftY = coordY;
  const leftClampX = Math.min(Math.max(leftX, 0), clampMaxX) | 0;
  const leftClampY = Math.min(Math.max(leftY, 0), clampMaxY) | 0;

  // %93 = sample(P, sam, %25) -- P at coord (centre).
  const pCenter = sampleP(P, uv0U, uv0V);
  const pcX = Math.fround(pCenter[0]);
  const pcY = Math.fround(pCenter[1]);
  const pcZ = Math.fround(pCenter[2]);
  const pcW = Math.fround(pCenter[3]);

  // %95/%96/%97 = sample(P, ..., up_clamped + 0.5).
  const uvUpU = Math.fround(Math.fround(upClampX) + Math.fround(0.5));
  const uvUpV = Math.fround(Math.fround(upClampY) + Math.fround(0.5));
  const pUp = sampleP(P, uvUpU, uvUpV);
  const puZ = Math.fround(pUp[2]);
  const puW = Math.fround(pUp[3]);

  // %99/%100/%101 = sample(P, ..., left_clamped + 0.5).
  const uvLeftU = Math.fround(Math.fround(leftClampX) + Math.fround(0.5));
  const uvLeftV = Math.fround(Math.fround(leftClampY) + Math.fround(0.5));
  const pLeft = sampleP(P, uvLeftU, uvLeftV);
  const plX = Math.fround(pLeft[0]);
  const plY = Math.fround(pLeft[1]);

  // %103 : coord.x == 0 branch.
  let divXlaneU: number; // x-partial contribution, lane 0
  let divXlaneV: number; // x-partial contribution, lane 1
  if (coordX === 0) {
    // %104 : left edge -- forward diff from zero -> P_center.xy.
    divXlaneU = pcX;
    divXlaneV = pcY;
  } else if (coordX === clampMaxX) {
    // %109 : right edge -- backward diff to zero -> -P_left.xy.
    divXlaneU = Math.fround(-plX);
    divXlaneV = Math.fround(-plY);
  } else {
    // %112 : interior -- P_center.xy - P_left.xy.
    divXlaneU = Math.fround(pcX - plX);
    divXlaneV = Math.fround(pcY - plY);
  }

  // %117 : coord.y == 0 branch (uses .zw of P).
  let divYlaneU: number;
  let divYlaneV: number;
  if (coordY === 0) {
    // %118 : top edge -- P_center.zw.
    divYlaneU = pcZ;
    divYlaneV = pcW;
  } else if (coordY === clampMaxY) {
    // %123 : bottom edge -- -P_up.zw.
    divYlaneU = Math.fround(-puZ);
    divYlaneV = Math.fround(-puW);
  } else {
    // %126 : interior -- P_center.zw - P_up.zw.
    divYlaneU = Math.fround(pcZ - puZ);
    divYlaneV = Math.fround(pcW - puW);
  }

  // %131 = %116 + %130 -- divergence lanes.
  const divU = Math.fround(divXlaneU + divYlaneU);
  const divV = Math.fround(divXlaneV + divYlaneV);

  // %133 = load m_theta.
  const theta = Math.fround(params.m_theta);
  // %136 = fmuladd(splat_theta, div, shrink) -- fp32-fused.
  const combinedU = Math.fround(theta * divU + shrinkX);
  const combinedV = Math.fround(theta * divV + shrinkY);

  // %138 = <combined.u, combined.v, 0, 0>.
  // %140 = load m_scaleFlowOut ; %142 = splat scale to <4>.
  // %143 = scale * %138.
  const scale = Math.fround(params.m_scaleFlowOut);
  const outR = Math.fround(scale * combinedU);
  const outG = Math.fround(scale * combinedV);
  // Lanes 2/3 come from a <undef, undef, 0.0, 0.0> literal, then are
  //   multiplied by `scale`. IEEE: scale * 0.0 = +/-0.0 (0.0 unless
  //   scale is negative-zero/-inf/NaN; the IR uses the literal +0.0 so
  //   the sign is +0.0 for a finite scale). Preserved as +0.0 here.
  const outB = Math.fround(scale * Math.fround(0.0));
  const outA = Math.fround(scale * Math.fround(0.0));

  // air.write_texture_2d.v4f32(flow_kp1, coord, <outR, outG, outB, outA>, 0, 2).
  writeFkp1(flow_kp1, coordX, coordY, [outR, outG, outB, outA]);
}
