// @shader soGuidedFilter::soGuidedFilter_I1p1_Pass2 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p1_Pass2.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000008c92d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p1_Pass2 (HeliumSenso)
 *
 * Guided-filter Pass2 for the I1p1 dispatch — VERTICAL running-sum kernel
 * that consumes a 4-lane row-sum texture holding
 *   (p_row_sum, I_row_sum, p·I_row_sum, I²_row_sum)
 * per pixel, forms the per-window MEANs, computes the guided-filter
 * regression coefficients
 *
 *     N          = m_numPixelsInRect                   ; window area
 *     mean4      = accum4 / N                          ; (p̄, Ī, p·Ī, I²̄)
 *     var_I      = I²̄ - Ī*Ī                            ; via fmuladd(-Ī,Ī,I²̄)
 *     cov_pI     = p·Ī - p̄*Ī                            ; via fmuladd(-p̄,Ī,p·Ī)
 *     a          = cov_pI / (var_I + epsilon)
 *     b          = p̄ - a*Ī                              ; via fmuladd(-a,Ī,p̄)
 *     output_a_b = (a, b, 0, 0)                        ; float4 write
 *
 * Same init-loop-then-slide structure as sibling Pass1/Pass2 kernels, but
 * this variant tracks all four lanes of the row-sum texture (both p- and
 * I-side statistics) and emits the FINAL regression pair (a, b).
 *
 * Signature from !air.kernel (!14..!22):
 *   kernel void soGuidedFilter_I1p1_Pass2(
 *       constant soGuidedFilter_I1p1_Pass2_params *params  [[buffer(0)]],
 *       uint2                    grid_in                    [[thread_position_in_grid]],
 *       sampler                  sam                        [[sampler(0)]],
 *       texture2d<float,sample>  input_p_I_Ip_I_sq_mean_row [[texture(0)]],
 *       texture2d<float,write>   output_a_b                 [[texture(1)]]);
 *
 * params struct (from !18):
 *   +0   int4   m_rect_in           — (x0,y0,x1,y1) sub-rect
 *   +16  int    m_radius            — half-window radius (vertical here)
 *   +20  int    m_numPixelsInRect   — window area N
 *   +24  float  m_epsilon           — regularisation added to var_I
 *
 * Fast-math is DISABLED (!12 = "air.compile.fast_math_disable"), so every
 * fp32 op is Math.fround-narrowed to preserve single-precision semantics.
 *
 * Silent-correctness contract per SHADERS.md:
 *   - `air.convert.f.v2f32.u.v2i32` @IR %16 is UNSIGNED int→float — grid
 *     coords are coerced through `>>> 0` before Math.fround.
 *   - Width guard @IR %14 is `icmp ult` (unsigned); height guard @IR %32
 *     is `icmp sgt` (signed) — preserved verbatim below.
 *   - Constants `0.5` in the +0.5 UV bias and `1.0` in the axis walk are
 *     both narrowed to fp32 exact bit patterns.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p1_Pass2_Params {
  /** int4 at +0 (x0,y0,x1,y1). @IR %7 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %18 */
  m_radius: number;
  /** int at +20, align 4. @IR %35 */
  m_numPixelsInRect: number;
  /** float at +24, align 8. @IR %40 */
  m_epsilon: number;
}

/** RGBA float4 sampler contract. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p1_Pass2 — one dispatched thread.
 *
 * @IR entire function @0x0000000008c92d.
 */
export function soGuidedFilter_I1p1_Pass2(
  params: soGuidedFilter_I1p1_Pass2_Params,
  grid_in: [number, number],
  sample_input_p_I_Ip_I_sq_mean_row: Sample2D,
  write_output_a_b: Write2D,
): void {
  // Base pos = rect.xy + grid_in (int32).
  //   @IR %7  load rect
  //   @IR %8  shuffle rect.xy
  //   @IR %9  add rect.xy + grid
  //   @IR %10 extract lane 0 (posX)
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // Width guard (UNSIGNED `icmp ult`): if posX >= (rect2 - rect0) → return.
  //   @IR %11 %12 %13 %14
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // Convert (posX, posY) to <2 x float> using UNSIGNED conversion.
  //   @IR %16 (air.convert.f.v2f32.u.v2i32)
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // Load radius (int32, align 16), signed→float.
  //   @IR %17 gep +16 ; %18 load ; %19 air.convert.f.f32.s.i32
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf - 0, posYf - radiusF) + (0.5, 0.5)
  //   The vertical Pass slides down the y-axis; the x-lane subtraction is
  //   zero (the insertelement at %20 puts radius only in lane1 of the
  //   subtrahend, leaving lane0 = 0.0).
  //   @IR %20 = insertelement <0.0, undef>, radiusF, lane 1
  //   @IR %21 = fsub posf - <0, radiusF>
  //   @IR %22 = fadd %21, <0.5, 0.5>
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1  =  2*radius + 1.
  //   @IR %23 shl radius, 1 ; %24 or 1
  const diameter = ((radius << 1) | 1) | 0;

  // Init-loop guard: `icmp sgt diameter, 0`.
  //   @IR %25 sgt %24, 0
  //   Block flow: if TRUE → %41 (init loop) ; else → %26 (post-init).

  // Post-init phis at block %26:
  //   %27 = 4-lane accumulator (zeros if diameter<=0, else %47 from init)
  //   %28 = cursor after init loop (startUV if diameter<=0, else %50)
  let accum4_0 = Math.fround(0);   // @IR %27 lane0 (p_row_sum)
  let accum4_1 = Math.fround(0);   // @IR %27 lane1 (I_row_sum)
  let accum4_2 = Math.fround(0);   // @IR %27 lane2 (p·I_row_sum)
  let accum4_3 = Math.fround(0);   // @IR %27 lane3 (I²_row_sum)
  let cursorAfterInitX = startUvX; // @IR %28 lane0
  let cursorAfterInitY = startUvY; // @IR %28 lane1

  if (diameter > 0) {
    // Init loop %41: walk `diameter` samples down y-axis; accumulate all
    // FOUR lanes of sampled float4 into a 4-lane accumulator.
    //   %42 = phi cursor (init = startUV, next = %50)
    //   %43 = phi acc4   (init = zeros,   next = %47)
    //   %44 = phi i      (init = 0,       next = %51)
    //   %45 = air.sample_texture_2d.v4f32(cursor)
    //   %46 = extractvalue %45, 0
    //   %47 = fadd acc4, %46
    //   %48 = extractelement cursor, 1  ; cursor.y
    //   %49 = fadd %48, 1.0f
    //   %50 = insertelement cursor, %49, 1
    //   %51 = i + 1 ; %52 = eq diameter → exit
    let curX = startUvX;
    let curY = startUvY;
    let a0 = Math.fround(0);
    let a1 = Math.fround(0);
    let a2 = Math.fround(0);
    let a3 = Math.fround(0);
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      const s = sample_input_p_I_Ip_I_sq_mean_row([curX, curY]);
      a0 = Math.fround(a0 + Math.fround(s[0]));
      a1 = Math.fround(a1 + Math.fround(s[1]));
      a2 = Math.fround(a2 + Math.fround(s[2]));
      a3 = Math.fround(a3 + Math.fround(s[3]));
      curY = Math.fround(curY + Math.fround(1));
    }
    accum4_0 = a0;
    accum4_1 = a1;
    accum4_2 = a2;
    accum4_3 = a3;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %26: height guard (SIGNED `sgt` — not the same as the x-axis
  // unsigned guard; preserved verbatim per SHADERS.md silent-correctness note).
  //   @IR %29 extract rect,3 ; %30 extract rect,1 ; %31 sub ; %32 sgt %31, 0
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %33: load N as splat<4>, load epsilon (scalar).
  //   @IR %34 gep +20 ; %35 load i32 ; %36 sitofp ; %37 insertelement %38 shuffle-splat
  //   @IR %39 gep +24 ; %40 load float
  const numPixelsF = Math.fround(params.m_numPixelsInRect | 0);
  const epsilon = Math.fround(params.m_epsilon);

  // Sliding output loop %53. Loop-carried state:
  //   %54 = current window cursor "right edge" (init = cursorAfterInit)
  //   %55 = current window cursor "left edge"  (init = startUV — one full
  //          window height ABOVE the right edge; the diameter of the
  //          init-loop walk is exactly the window's vertical extent)
  //   %56 = int2 write position                (init = (posX, posY))
  //   %57 = 4-lane accumulator                 (init = accum4 from init loop)
  //   %58 = j                                  (init = 0)
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide0 = accum4_0;
  let slide1 = accum4_1;
  let slide2 = accum4_2;
  let slide3 = accum4_3;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Emit regression coefficients (a, b) for the current window.
    //   @IR %59 = fdiv slide4, splat(N)                → (p̄, Ī, p·Ī, I²̄)
    //   @IR %60 = extractelement %59, 3                → I²̄
    //   @IR %61 = extractelement %59, 1                → Ī
    //   @IR %62 = fneg %61                              → -Ī
    //   @IR %63 = fmuladd(-Ī, Ī, I²̄)                    → var_I
    //   @IR %64 = extractelement %59, 2                → p·Ī
    //   @IR %65 = extractelement %59, 0                → p̄
    //   @IR %66 = fneg %65                              → -p̄
    //   @IR %67 = fmuladd(-p̄, Ī, p·Ī)                    → cov_pI
    //   @IR %68 = fadd epsilon, var_I                   → var_I_reg
    //   @IR %69 = fdiv cov_pI, var_I_reg                → a
    //   @IR %70 = insertelement <undef,undef,0,0>, a, 0
    //   @IR %71 = fneg %69                              → -a
    //   @IR %72 = fmuladd(-a, Ī, p̄)                     → b
    //   @IR %73 = insertelement %70, b, 1
    //   @IR         air.write_texture_2d.v4f32(output, writePos, %73)
    const p_mean = Math.fround(slide0 / numPixelsF);
    const I_mean = Math.fround(slide1 / numPixelsF);
    const pI_mean = Math.fround(slide2 / numPixelsF);
    const I_sq_mean = Math.fround(slide3 / numPixelsF);
    const negI = Math.fround(-I_mean);
    const var_I = Math.fround(Math.fround(negI * I_mean) + I_sq_mean);
    const negP = Math.fround(-p_mean);
    const cov_pI = Math.fround(Math.fround(negP * I_mean) + pI_mean);
    const var_I_reg = Math.fround(epsilon + var_I);
    const a = Math.fround(cov_pI / var_I_reg);
    const negA = Math.fround(-a);
    const b = Math.fround(Math.fround(negA * I_mean) + p_mean);
    write_output_a_b([writeX, writeY], [a, b, Math.fround(0), Math.fround(0)]);

    // Slide window vertically: add BOTTOM (rightEdge), subtract TOP (leftEdge).
    //   @IR %74 = sample rightEdge ; %75 = extract .0
    //   @IR %76 = fadd slide, right4
    //   @IR %77 = sample leftEdge  ; %78 = extract .0
    //   @IR %79 = fsub (slide+right), left4
    const sR = sample_input_p_I_Ip_I_sq_mean_row([rightX, rightY]);
    const add0 = Math.fround(slide0 + Math.fround(sR[0]));
    const add1 = Math.fround(slide1 + Math.fround(sR[1]));
    const add2 = Math.fround(slide2 + Math.fround(sR[2]));
    const add3 = Math.fround(slide3 + Math.fround(sR[3]));
    const sL = sample_input_p_I_Ip_I_sq_mean_row([leftX, leftY]);
    slide0 = Math.fround(add0 - Math.fround(sL[0]));
    slide1 = Math.fround(add1 - Math.fround(sL[1]));
    slide2 = Math.fround(add2 - Math.fround(sL[2]));
    slide3 = Math.fround(add3 - Math.fround(sL[3]));

    // Advance cursors: rightEdge.y++, leftEdge.y++, writePos.y++.
    //   @IR %80 %81 %82 rightEdge.y (fp32 +1)
    //   @IR %83 %84 %85 leftEdge.y  (fp32 +1)
    //   @IR %86 %87 %88 writePos.y  (int32 +1)
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %89 = j+1 ; %90 = eq height → exit.
  }
}
