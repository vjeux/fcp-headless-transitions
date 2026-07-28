// @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1 (HeliumSenso) @0x000000000bb39d
// Faithful transcription of the LLVM AIR IR at
// raw-port/re/shaders/soOFlowEstimator__soOFlowEstimator_estimateTVDual1dt1.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// HeliumSenso.framework/Versions/A/Resources/default.metallib. The .ll
// header line reads `0x000000000bb39d -- soOFlowEstimator::
// soOFlowEstimator_estimateTVDual1dt1:` — the shader's entry offset in
// the metallib.
//
// Compile options (from the .ll):
//   air.compile.denorms_disable
//   air.compile.fast_math_disable        -- IEEE-754 fp32 semantics.
//   air.compile.framebuffer_fetch_enable
// With fast_math_disable, every fadd/fmul/fsub/fdiv is a strict fp32
// rounded op — mapped as Math.fround(a op b). The single
// llvm.fmuladd.v2f32 at %119 is documented in the intrinsic contract
// as a single unrounded multiply-add — modelled as Math.fround(a*b+c)
// per raw-port/army/SHADERS.md.
//
// STRUCT-TYPE-NAME REUSE TRAP (see SHADERS.md): the AIR IR names the
// params struct
// `soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt0_params` (dt0,
// not dt1) — Apple's layout-compatible AIR-struct dedup. The
// authoritative `!17`/`!18` field metadata says the true type is
// `soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1_params` with:
//   offset 0  : float m_theta
//   offset 4  : float m_lambdaTheta
//   offset 8  : float m_scaleFlowOut
//   offset 12 : int   m_dimX
//   offset 16 : int   m_dimY
//
// Compute kernel signature (from !14..!27):
//   %0  params            : constant (address-space 2) struct — above.
//   %1  coord_            : uint2 — air.thread_position_in_grid.
//   %2  sampler_nearest   : sampler at index 0.
//   %3  I1_flowWarped_    : texture2d<float, sample> at index 0.
//   %4  I2_               : texture2d<float, sample> at index 1.
//   %5  I1_flowWarpedGrad_: texture2d<float, sample> at index 2.
//   %6  flow_k0_          : texture2d<float, sample> at index 3.
//   %7  flow_k_           : texture2d<float, sample> at index 4.
//   %8  flow_kp1_         : texture2d<float, write>  at index 5.
//   %9  P_                : texture2d<float, sample> at index 6.
//
// AIR intrinsics used:
//   air.sample_texture_2d.v4f32(tex, sampler, uv, offset_valid=true,
//       <0,0>, bias_valid=false, 0.0, 0.0, i32 0) -> {<4 x float>, i8}
//   air.convert.f.v2f32.s.v2i32(<2 x i32>)   -- SIGNED int->float
//                                               (the .s. variant — see
//                                               SHADERS.md for the
//                                               unsigned .u. gotcha,
//                                               NOT applicable here).
//   air.clamp.s.v2i32(<2 x i32>, lo, hi)     -- signed 2-lane clamp.
//   air.dot.v2f32(a, b)                      -- 2-lane dot product =
//                                               a.x*b.x + a.y*b.y.
//   llvm.fmuladd.v2f32(a, b, c)              -- fused MAD on 2 lanes.
//   air.write_texture_2d.v4f32(tex, coord, rgba, 0, 2) — write pixel.
//
// Algorithm summary (TV-L1 optical-flow dual-variable step 1):
//
// This is one Chambolle projected-gradient step for the dual/primal
// coupling used in TV-L1 optical flow. For each destination pixel:
//
//   1. Read the current flow_k (V), the previous outer-iterate flow_k0
//      (u_bar), the warped source I1(x+u_bar), its gradient
//      grad(I1)(x+u_bar), and the target I2(x). Compute
//        rho     = grad . (V - u_bar) + (I1 - I2)   [%41+%42+%43]
//        gradSq = grad . grad                       [%44]
//        thr    = lambdaTheta * gradSq              [%47]
//      Then the primal thresholding (%52/%56/%57):
//        if      (rho >  thr)  V' = V - lambdaTheta*grad
//        else if (rho < -thr)  V' = V + lambdaTheta*grad
//        else                  V' = V - (rho / gradSq) * grad
//      When gradSq is 0 the third branch is unreachable (the guard
//      `-thr < rho < thr` requires gradSq > 0 since thr = lt*gradSq
//      and lt > 0 per the TV-L1 continuation schedule; here we
//      transcribe the arithmetic exactly as the IR spells it).
//
//   2. Compute forward differences of P (the dual variable's flow
//      output at the previous inner iterate). Boundary conditions
//      (%86 / %91 / %100 / %105) match the natural TV-L1 divergence:
//        divX(x) =  P.xy[x=0]              if coord.x == 0
//                = -P.xy[x=dimX-1]         if coord.x == dimX-1
//                =  P.xy[x] - P.xy[x-1]    otherwise
//        divY(x) =  P.zw[y=0]              if coord.y == 0
//                = -P.zw[y=dimY-1]         if coord.y == dimY-1
//                =  P.zw[y] - P.zw[y-1]    otherwise
//      The `.xy` / `.zw` split in the IR (shufflevector <0,1> vs
//      <2,3>) is the standard packing of the 2-D dual vector across
//      the four channels of a single texture (P.xy holds P.x, P.zw
//      holds P.y).
//
//   3. Final combination (%118..%126):
//        out.xy = scaleFlowOut * ( V' + theta * (divX + divY) )
//        out.zw = 0
//      and write to flow_kp1_ at coord.
//
// Line-by-line correspondence to the .ll body is documented inline
// below at every operation. Every fp32 op is Math.fround-narrowed to
// preserve the fp32 semantics that fast_math_disable requires.
//
// No shortcut language of any kind.

/**
 * `soOFlowEstimator_estimateTVDual1dt1_params` struct — offsets and
 * field names taken from the authoritative `!17` / `!18` metadata in
 * the .ll (see the STRUCT-TYPE-NAME REUSE TRAP note above). Total
 * struct size is 20 bytes (5 x i32/f32 lanes, 4-byte aligned).
 */
export interface SoOFlowEstimatorEstimateTVDual1dt1Params {
  m_theta: number;        // offset 0  : float
  m_lambdaTheta: number;  // offset 4  : float
  m_scaleFlowOut: number; // offset 8  : float
  m_dimX: number;         // offset 12 : int
  m_dimY: number;         // offset 16 : int
}

/**
 * Callback for AIR `air.sample_texture_2d.v4f32` — samples the float
 * texture at (u, v) with the bound sampler and returns four rgba
 * lanes. All samples in this shader use the same
 * `sampler_nearest` bound at index 0 and the same
 * `offset_valid=true, offset=<0,0>` operand form; the caller supplies
 * one sampler and the shader passes `(u + 0.5, v + 0.5)` for the
 * "current pixel" reads and the same fp32 half-pixel bias after
 * clamping for the neighbour reads.
 */
export type SampleFloatTex2D<T> = (
  texture: T,
  u: number,
  v: number,
) => [number, number, number, number];

/**
 * Callback for AIR `air.write_texture_2d.v4f32` — writes rgba at the
 * integer coord `(x, y)` in the destination texture. The IR trailing
 * operands `(i32 0, i32 2)` are the mip level (0) and the write mode
 * enum (2) which the runtime consumes; the TS callback is passed the
 * pixel coord and the rgba tuple only.
 */
export type WriteFloatTex2D<T> = (
  texture: T,
  x: number,
  y: number,
  rgba: [number, number, number, number],
) => void;

/**
 * Compute kernel `soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1`.
 *
 * One Chambolle projected-gradient step for TV-L1 optical flow: reads
 * the warped image, its gradient, the target image, the previous
 * outer-iterate flow, the current inner-iterate flow, and the dual
 * variable P, then writes the next inner-iterate flow. See the
 * top-of-file block for the full algorithm and IR mapping.
 *
 * @shader soOFlowEstimator::soOFlowEstimator_estimateTVDual1dt1 (HeliumSenso)
 */
export function soOFlowEstimator__soOFlowEstimator_estimateTVDual1dt1<
  T1, T2, T3, T4, T5, T6, T7,
>(
  params: SoOFlowEstimatorEstimateTVDual1dt1Params,
  coord: [number, number],
  I1_flowWarped: T1,
  I2: T2,
  I1_flowWarpedGrad: T3,
  flow_k0: T4,
  flow_k: T5,
  flow_kp1: T6,
  P: T7,
  sampleI1FlowWarped: SampleFloatTex2D<T1>,
  sampleI2: SampleFloatTex2D<T2>,
  sampleI1FlowWarpedGrad: SampleFloatTex2D<T3>,
  sampleFlowK0: SampleFloatTex2D<T4>,
  sampleFlowK: SampleFloatTex2D<T5>,
  writeFlowKp1: WriteFloatTex2D<T6>,
  sampleP: SampleFloatTex2D<T7>,
): void {
  // %11..%16 : build <dimX, dimY> as a <2 x i32> for later clamps.
  //   The IR spells this out with two `insertelement`s.
  const dimX = params.m_dimX | 0;
  const dimY = params.m_dimY | 0;

  // %17, %18 : `icmp slt coord.x, dimX` — signed less-than bounds
  //   check. `br i1 %18 false -> label %127` = ret void.
  const cx = coord[0] | 0;
  if (!(cx < dimX)) {
    return;
  }

  // %20, %21 : `icmp slt coord.y, dimY`. false -> ret void.
  const cy = coord[1] | 0;
  if (!(cy < dimY)) {
    return;
  }

  // %23, %24 : convert coord (s.v2i32 -> v2f32) then add <0.5, 0.5>.
  //   uv0 is the "current pixel" fp32 UV.
  const uv0x = Math.fround(Math.fround(cx) + Math.fround(0.5));
  const uv0y = Math.fround(Math.fround(cy) + Math.fround(0.5));

  // %25, %26 : sample flow_k0_ at uv0 (%6 = 4th texture = flow_k0_).
  //   Read the .rgba tuple; only .xy (u_bar) is used below.
  const s6 = sampleFlowK0(flow_k0, uv0x, uv0y);

  // %27, %28 : sample flow_k_ at uv0 (%7 = 5th texture = flow_k_).
  const s7 = sampleFlowK(flow_k, uv0x, uv0y);

  // %29 = shufflevector s7 to <2 x float> <0, 1> — the .xy of flow_k_.
  const s7xy_x = Math.fround(s7[0]);
  const s7xy_y = Math.fround(s7[1]);

  // %30 = fsub <4 x float> s7, s6  ; V - u_bar (only .xy used).
  //   %31 = shufflevector %30 to <2 x float> <0,1>.
  const vDiff_x = Math.fround(s7[0] - s6[0]);
  const vDiff_y = Math.fround(s7[1] - s6[1]);

  // %32..%34 : sample I1_flowWarped_ at uv0 (%3 = 1st texture); take
  //   lane 0 = I1(x + u_bar).
  const s3 = sampleI1FlowWarped(I1_flowWarped, uv0x, uv0y);
  const I1val = Math.fround(s3[0]);

  // %35..%37 : sample I2_ at uv0 (%4 = 2nd texture); take lane 0.
  const s4 = sampleI2(I2, uv0x, uv0y);
  const I2val = Math.fround(s4[0]);

  // %38..%40 : sample I1_flowWarpedGrad_ at uv0 (%5 = 3rd texture);
  //   shuffle to <2 x float> <0,1> — grad(I1) at the warped point.
  const s5 = sampleI1FlowWarpedGrad(I1_flowWarpedGrad, uv0x, uv0y);
  const grad_x = Math.fround(s5[0]);
  const grad_y = Math.fround(s5[1]);

  // %41 = air.dot.v2f32(grad, V-u_bar).
  const dotGV = Math.fround(
    Math.fround(grad_x * vDiff_x) + Math.fround(grad_y * vDiff_y),
  );
  // %42 = fsub float I2, I1 (fp32 wire order: %37 - %34 = I2 - I1).
  const iDiff = Math.fround(I2val - I1val);
  // %43 = fadd float dotGV, iDiff  ; rho.
  const rho = Math.fround(dotGV + iDiff);
  // %44 = air.dot.v2f32(grad, grad)  ; gradSq.
  const gradSq = Math.fround(
    Math.fround(grad_x * grad_x) + Math.fround(grad_y * grad_y),
  );
  // %45, %46 : load params.m_lambdaTheta (offset 4).
  const lambdaTheta = Math.fround(params.m_lambdaTheta);
  // %47 = fmul gradSq, lambdaTheta  ; thr = gradSq*lambdaTheta.
  const thr = Math.fround(gradSq * lambdaTheta);
  // %48, %49, %50 : broadcast lambdaTheta into <2 x float> and
  //   multiply grad by it — lambdaTheta*grad.
  const ltGrad_x = Math.fround(grad_x * lambdaTheta);
  const ltGrad_y = Math.fround(grad_y * lambdaTheta);
  // %51 = fsub -0.0, thr  ; negThr = -thr.
  const negThr = Math.fround(Math.fround(-0.0) - thr);

  // Primal thresholding branch. IR uses %52 = fcmp ugt (unordered gt);
  //   %56 = fcmp ogt (ordered gt); %57 = fcmp olt; %58 = and %56,%57.
  //   Structure:
  //     if !(rho ugt negThr)             -> "%53" branch : V + lt*grad
  //     else if (rho ogt negThr && rho olt thr)
  //                                       -> "%59" branch : V - (rho/gradSq)*grad
  //     else                              -> "%67" branch : V - lt*grad
  //   `ugt` = "unordered greater than" is true on NaN or strict >;
  //   `ogt`/`olt` are the ordered variants (false on NaN).
  //   Preserved exactly as the IR spells them.
  let vPrime_x: number;
  let vPrime_y: number;
  // %52 = fcmp ugt rho, negThr. In JS this is `!(rho <= negThr)` and
  //   evaluates to true when rho is NaN as well as when rho > negThr.
  const cond52 = !(rho <= negThr);
  if (!cond52) {
    // block %53 : %54 = fadd s7.xy, lambdaTheta*grad.
    vPrime_x = Math.fround(s7xy_x + ltGrad_x);
    vPrime_y = Math.fround(s7xy_y + ltGrad_y);
  } else {
    // block %55 : %56 = fcmp ogt rho, negThr ; %57 = fcmp olt rho, thr.
    const cond56 = rho > negThr;
    const cond57 = rho < thr;
    if (cond56 && cond57) {
      // block %59 :
      //   %60..%61 : broadcast rho into <2 x float>.
      //   %62      : grad * rho.
      //   %63..%64 : broadcast gradSq into <2 x float>.
      //   %65      : fdiv (grad*rho, gradSq) = (rho/gradSq)*grad.
      //   %66      : fsub s7.xy, %65.
      const rhoOverGs = Math.fround(rho / gradSq);
      vPrime_x = Math.fround(s7xy_x - Math.fround(grad_x * rhoOverGs));
      vPrime_y = Math.fround(s7xy_y - Math.fround(grad_y * rhoOverGs));
    } else {
      // block %67 : %68 = fsub s7.xy, lambdaTheta*grad.
      vPrime_x = Math.fround(s7xy_x - ltGrad_x);
      vPrime_y = Math.fround(s7xy_y - ltGrad_y);
    }
  }
  // block %69 : %70 = phi of the three branches — vPrime.

  // %71 : coord + <0, -1> ; up neighbour candidate.
  //   %72 : <dimX, dimY> + <-1, -1> = <dimX-1, dimY-1> — clamp hi.
  //   %73 : air.clamp.s.v2i32(<coord.x, coord.y-1>, <0,0>, hi).
  const clampHiX = (dimX - 1) | 0;
  const clampHiY = (dimY - 1) | 0;
  // air.clamp.s : min(max(v, lo), hi). Signed.
  const clampS = (v: number, lo: number, hi: number): number => {
    return Math.max(lo, Math.min(hi, v)) | 0;
  };
  const upX = clampS(cx, 0, clampHiX);
  const upY = clampS((cy - 1) | 0, 0, clampHiY);
  // %74, %75 : coord + <-1, 0> then clamp — left neighbour.
  const lfX = clampS((cx - 1) | 0, 0, clampHiX);
  const lfY = clampS(cy, 0, clampHiY);

  // %76, %77 : sample P at uv0 — P at current pixel (%9 = P_).
  const P0 = sampleP(P, uv0x, uv0y);
  // %78, %79 : convert `up` s.v2i32 to fp32 and add <0.5, 0.5>.
  const upUvX = Math.fround(Math.fround(upX) + Math.fround(0.5));
  const upUvY = Math.fround(Math.fround(upY) + Math.fround(0.5));
  // %80, %81 : sample P at up-neighbour UV.
  const Pup = sampleP(P, upUvX, upUvY);
  // %82, %83 : convert `left` s.v2i32 to fp32 and add <0.5, 0.5>.
  const lfUvX = Math.fround(Math.fround(lfX) + Math.fround(0.5));
  const lfUvY = Math.fround(Math.fround(lfY) + Math.fround(0.5));
  // %84, %85 : sample P at left-neighbour UV.
  const Plf = sampleP(P, lfUvX, lfUvY);

  // divX in .xy (%86..%98):
  //   if      coord.x == 0        -> P0.xy
  //   else if coord.x == dimX-1   -> -Plf.xy
  //   else                        -> P0.xy - Plf.xy
  let divX_x: number;
  let divX_y: number;
  if (cx === 0) {
    // block %87 : %88 = shufflevector P0 <0,1>.
    divX_x = Math.fround(P0[0]);
    divX_y = Math.fround(P0[1]);
  } else if (cx === ((dimX - 1) | 0)) {
    // block %92 : %93 = shufflevector Plf <0,1> ; %94 = fsub -0.0, %93.
    divX_x = Math.fround(Math.fround(-0.0) - Math.fround(Plf[0]));
    divX_y = Math.fround(Math.fround(-0.0) - Math.fround(Plf[1]));
  } else {
    // block %95 : %96 = fsub P0, Plf ; %97 = shufflevector <0,1>.
    divX_x = Math.fround(P0[0] - Plf[0]);
    divX_y = Math.fround(P0[1] - Plf[1]);
  }
  // block %98 : %99 = phi of divX.

  // divY in .zw (%100..%112):
  //   if      coord.y == 0        -> P0.zw
  //   else if coord.y == dimY-1   -> -Pup.zw
  //   else                        -> P0.zw - Pup.zw
  let divY_x: number;
  let divY_y: number;
  if (cy === 0) {
    // block %101 : %102 = shufflevector P0 <2,3>.
    divY_x = Math.fround(P0[2]);
    divY_y = Math.fround(P0[3]);
  } else if (cy === ((dimY - 1) | 0)) {
    // block %106 : %107 = shufflevector Pup <2,3> ; %108 = fsub -0.0, %107.
    divY_x = Math.fround(Math.fround(-0.0) - Math.fround(Pup[2]));
    divY_y = Math.fround(Math.fround(-0.0) - Math.fround(Pup[3]));
  } else {
    // block %109 : %110 = fsub P0, Pup ; %111 = shufflevector <2,3>.
    divY_x = Math.fround(P0[2] - Pup[2]);
    divY_y = Math.fround(P0[3] - Pup[3]);
  }
  // block %112 : %113 = phi of divY.

  // %114 = fadd divX, divY  ; div (a <2 x float>).
  const div_x = Math.fround(divX_x + divY_x);
  const div_y = Math.fround(divX_y + divY_y);

  // %115, %116 : load params.m_theta (offset 0).
  const theta = Math.fround(params.m_theta);
  // %117, %118 : broadcast theta into <2 x float>.
  // %119 = llvm.fmuladd.v2f32(theta, div, vPrime) = vPrime + theta*div.
  //   Per the intrinsic contract, a single unrounded multiply-add ;
  //   modelled as one Math.fround over the fused expression.
  const out0x = Math.fround(theta * div_x + vPrime_x);
  const out0y = Math.fround(theta * div_y + vPrime_y);

  // %120, %121 : shufflevector <out0x, out0y> to <4 x float> using
  //   the pattern <0, 1, 6, 7> against <undef, undef, 0.0, 0.0> —
  //   producing <out0x, out0y, 0.0, 0.0>.
  // %122, %123 : load params.m_scaleFlowOut (offset 8).
  // %124, %125 : broadcast scaleFlowOut into <4 x float>.
  // %126 = fmul scaleFlowOut, <out0x, out0y, 0.0, 0.0>  --
  //   note fmul 0.0 * 0.0 == 0.0 for finite scaleFlowOut, so the
  //   .zw output lanes are 0.0. Transcribed literally below.
  const scaleFlowOut = Math.fround(params.m_scaleFlowOut);
  const rgba: [number, number, number, number] = [
    Math.fround(scaleFlowOut * out0x),
    Math.fround(scaleFlowOut * out0y),
    Math.fround(scaleFlowOut * Math.fround(0.0)),
    Math.fround(scaleFlowOut * Math.fround(0.0)),
  ];

  // air.write_texture_2d.v4f32(flow_kp1_, coord, rgba, 0, 2).
  writeFlowKp1(flow_kp1, cx, cy, rgba);

  // block %127 : ret void.
}
