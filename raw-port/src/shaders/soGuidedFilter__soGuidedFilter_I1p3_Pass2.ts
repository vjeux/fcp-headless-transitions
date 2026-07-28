// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass2 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass2.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009670d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass2 (HeliumSenso)
 *
 * Guided-filter Pass2 — VERTICAL running-sum kernel that consumes the two
 * horizontal-sum textures from Pass1
 * (`output_p_mean_row`, `output_Ip_mean_row`, here bound as
 *  `input_p_I_mean_row`, `input_Ip_I_sq_mean_row`), forms the per-window
 * means, and directly emits the guided-filter coefficients:
 *
 *     N        = m_numPixelsInRect                  ; window area
 *     p_I_mean = accum_p_I / N                       ; float4  (p.rgb + I in .w)
 *     Ip_Isq   = accum_Ip_Isq / N                    ; float4  (Ip.rgb + I² in .w)
 *     I_mean   = p_I_mean.w
 *     I_sq_mean= Ip_Isq.w
 *     p_mean   = p_I_mean.rgb
 *     Ip_mean  = Ip_Isq.rgb
 *     var_I    = I_sq_mean - I_mean * I_mean         ; fp32 (fmuladd)
 *     cov_Ip   = Ip_mean   - p_mean * I_mean         ; vec3 (fmuladd)
 *     a        = cov_Ip / (var_I + epsilon)          ; vec3
 *     b        = p_mean  - a * I_mean                 ; vec3
 *     output_a = (a.r, a.g, a.b, 0)
 *     output_b = (b.r, b.g, b.b, 0)
 *
 * This is the classical guided-filter closed-form for the linear coefficient
 * pair (a, b) that minimizes E = Σ ((a·I + b) − p)² + ε·a² per output pixel.
 *
 * Structural layout mirrors Pass1: an init loop primes the vertical accumulator
 * for the FIRST output row (`%44`), then a sliding output loop (`%60`) writes
 * a/b, samples the incoming NEW bottom-row inputs (adds), then samples the
 * OUTGOING top-row inputs (subs), then advances all three cursors by +1 on
 * the y axis (this is a VERTICAL sliding window — Pass1 was horizontal).
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass2(
 *       constant params  *params                    [[buffer(0)]],
 *       uint2             grid_in                   [[thread_position_in_grid]],
 *       sampler           sam                       [[sampler(0)]],
 *       texture2d<float,sample> input_p_I_mean_row   [[texture(0)]],
 *       texture2d<float,sample> input_Ip_I_sq_mean_row [[texture(1)]],
 *       texture2d<float,write>  output_a             [[texture(2)]],
 *       texture2d<float,write>  output_b             [[texture(3)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in           — (x0,y0,x1,y1)
 *   +16  int   m_radius            — half-window radius
 *   +20  int   m_numPixelsInRect   — window area N (2*radius+1)²
 *   +24  float m_epsilon           — guided-filter regularization ε
 *
 * Fast-math is DISABLED (!12 air.compile.fast_math_disable), so every fp32
 * arithmetic op is Math.fround-narrowed.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p3_Pass2_Params {
  /** int4 at +0. @IR %9 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %20 */
  m_radius: number;
  /** int at +20, align 4. @IR %38 */
  m_numPixelsInRect: number;
  /** float at +24, align 8. @IR %43 */
  m_epsilon: number;
}

/** RGBA float4 sampler contract. Matches `air.sample_texture_2d.v4f32`. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. Matches `air.write_texture_2d.v4f32`. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass2 — one dispatched thread.
 *
 * @IR entire function @0x0000000009670d.
 */
export function soGuidedFilter_I1p3_Pass2(
  params: soGuidedFilter_I1p3_Pass2_Params,
  grid_in: [number, number],
  sample_input_p_I_mean_row: Sample2D,
  sample_input_Ip_I_sq_mean_row: Sample2D,
  write_output_a: Write2D,
  write_output_b: Write2D,
): void {
  // Load rect + compute base write pos = rect.xy + grid_in. NO axis swap here
  // (Pass1 swapped, Pass2 does not).
  //   @IR %9 = load <4xi32> ; %10 = shuffle %9, undef, <0,1> ; %11 = %10 + grid_in
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;   // @IR %11 lane0
  const posY = (rect1 + gy) | 0;   // @IR %11 lane1

  // Width guard: %12 = %11.x ; %15 = rect.z - rect.x ; %16 = ult %12, %15.
  //   @IR %13 %14 %15 %16
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // %18 = air.convert.f.v2f32.u.v2i32(%11) — UNSIGNED int→float.
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // %20 = load radius (i32) ; %21 = signed→float.
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf + 0.5, posYf - radiusF + 0.5) — the top of the initial window.
  //   @IR %22 = insertelement <0, undef>, radiusF, 1  →  (0.0, radiusF)
  //   @IR %23 = fsub posF, %22                          →  (posXf, posYf-radiusF)
  //   @IR %24 = fadd %23, <0.5, 0.5>                    →  (posXf+0.5, posYf-radiusF+0.5)
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1  →  2*radius + 1 (always odd).
  //   @IR %25 %26 %27 (signed>0 check)
  const diameter = ((radius << 1) | 1) | 0;

  // Phi values entering block %28 (post init-loop):
  //   %29 = accum_Ip_Isq   (zero if diameter<=0 else result of init loop)
  //   %30 = accum_p_I      (zero if diameter<=0 else result of init loop)
  //   %31 = cursor         (%24 if diameter<=0 else final %57)
  let accum_p_I: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let accum_Ip_Isq: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %44: walk (radius*2+1) samples down y=startUvY..startUvY+diameter-1
    //   accumulating both textures at UV = current cursor.
    let curX = startUvX;      // @IR %45 lane0 (never changes in this loop)
    let curY = startUvY;      // @IR %45 lane1 (increments by 1.0f per iteration)
    let acc_p: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %46
    let acc_Ip: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %47
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input_p_I_mean_row at current cursor. @IR %49 %50
      const sp = sample_input_p_I_mean_row([curX, curY]);
      // acc_p += sp (4-lane fadd). @IR %51
      acc_p = [
        Math.fround(acc_p[0] + Math.fround(sp[0])),
        Math.fround(acc_p[1] + Math.fround(sp[1])),
        Math.fround(acc_p[2] + Math.fround(sp[2])),
        Math.fround(acc_p[3] + Math.fround(sp[3])),
      ];
      // Sample input_Ip_I_sq_mean_row at same cursor. @IR %52 %53
      const sIp = sample_input_Ip_I_sq_mean_row([curX, curY]);
      // acc_Ip += sIp (4-lane fadd). @IR %54
      acc_Ip = [
        Math.fround(acc_Ip[0] + Math.fround(sIp[0])),
        Math.fround(acc_Ip[1] + Math.fround(sIp[1])),
        Math.fround(acc_Ip[2] + Math.fround(sIp[2])),
        Math.fround(acc_Ip[3] + Math.fround(sIp[3])),
      ];
      // cursor.y += 1.0f. @IR %55 %56 %57
      curY = Math.fround(curY + Math.fround(1));
      // %58 = i+1 ; %59 = eq diameter → exit.
    }
    accum_p_I = acc_p;
    accum_Ip_Isq = acc_Ip;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %28: height guard.
  //   @IR %32 = rect.w ; %33 = rect.y ; %34 = sub ; %35 = sgt %34, 0 (SIGNED)
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %36: load N and epsilon (used inside the output loop, but constant across it).
  //   @IR %38 = load i32 numPixels ; %39 = signed→float ; %40 %41 = splat to <4>
  const numPixelsF = Math.fround(params.m_numPixelsInRect | 0);
  //   @IR %43 = load float epsilon (align 8)
  const epsilon = Math.fround(params.m_epsilon);

  // Block %60 sliding output loop. Cursors:
  //   rightEdgeCursor (%61) init = cursorAfterInit (the y-advanced cursor from init loop)
  //   leftEdgeCursor  (%62) init = startUV (the ORIGINAL top-of-window UV, %24)
  //   writePos        (%63) init = (posX, posY) = %11
  // Accumulators (%64 = accum_p_I, %65 = accum_Ip_Isq) start from the init-loop phi values.
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide_p = accum_p_I;
  let slide_Ip = accum_Ip_Isq;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Guided-filter closed form on CURRENT accumulators.
    //   @IR %67 = fdiv accum_p_I    / splat(N)   →  p_I_mean = (p_r_mean, p_g_mean, p_b_mean, I_mean)
    //   @IR %68 = fdiv accum_Ip_Isq / splat(N)   →  Ip_Isq   = (Ip_r_mean, Ip_g_mean, Ip_b_mean, I_sq_mean)
    const p_I_mean: [number, number, number, number] = [
      Math.fround(slide_p[0] / numPixelsF),
      Math.fround(slide_p[1] / numPixelsF),
      Math.fround(slide_p[2] / numPixelsF),
      Math.fround(slide_p[3] / numPixelsF),
    ];
    const Ip_Isq_mean: [number, number, number, number] = [
      Math.fround(slide_Ip[0] / numPixelsF),
      Math.fround(slide_Ip[1] / numPixelsF),
      Math.fround(slide_Ip[2] / numPixelsF),
      Math.fround(slide_Ip[3] / numPixelsF),
    ];

    // var_I = I_sq_mean - I_mean*I_mean.
    //   @IR %69 = extractelement %68, 3 (I_sq_mean)
    //   @IR %70 = extractelement %67, 3 (I_mean)
    //   @IR %71 = fneg %70               (-I_mean)
    //   @IR %72 = fmuladd(-I_mean, I_mean, I_sq_mean)
    const I_sq_mean = p_I_mean === p_I_mean ? Ip_Isq_mean[3] : Ip_Isq_mean[3]; // (force fp32 load)
    const I_mean = p_I_mean[3];
    const negI = Math.fround(-I_mean);
    const var_I = Math.fround(Math.fround(negI * I_mean) + I_sq_mean);

    // cov_Ip[c] = Ip_mean[c] - p_mean[c] * I_mean  (per rgb channel, 3-vec fmuladd).
    //   @IR %73 = shuffle %68, undef, <0,1,2>    (Ip_mean.rgb)
    //   @IR %74 = shuffle %67, undef, <0,1,2>    (p_mean.rgb)
    //   @IR %75 = shuffle %67, undef, <3,3,3>    (splat I_mean)
    //   @IR %76 = fneg %74                        (-p_mean)
    //   @IR %77 = fmuladd(-p_mean, I_mean_splat, Ip_mean)
    const p_r = p_I_mean[0], p_g = p_I_mean[1], p_b = p_I_mean[2];
    const Ip_r = Ip_Isq_mean[0], Ip_g = Ip_Isq_mean[1], Ip_b = Ip_Isq_mean[2];
    const negPr = Math.fround(-p_r);
    const negPg = Math.fround(-p_g);
    const negPb = Math.fround(-p_b);
    const cov_r = Math.fround(Math.fround(negPr * I_mean) + Ip_r);
    const cov_g = Math.fround(Math.fround(negPg * I_mean) + Ip_g);
    const cov_b = Math.fround(Math.fround(negPb * I_mean) + Ip_b);

    // denom = epsilon + var_I.
    //   @IR %78 = fadd %43, %72
    const denom = Math.fround(epsilon + var_I);

    // a = cov_Ip / splat(denom).
    //   @IR %79 = insertelement <undef>, %78, 0 ; %80 = shuffle splat
    //   @IR %81 = fdiv cov_Ip, denom_splat
    const a_r = Math.fround(cov_r / denom);
    const a_g = Math.fround(cov_g / denom);
    const a_b = Math.fround(cov_b / denom);

    // output_a = (a.r, a.g, a.b, 0).
    //   @IR %82 = shuffle a to 4-vec ; %83 = insertelement lane3 = 0
    write_output_a([writeX, writeY], [a_r, a_g, a_b, Math.fround(0)]);

    // b = p_mean - a * I_mean.
    //   @IR %84 = fneg a (3-vec)
    //   @IR %85 = fmuladd(-a, I_mean_splat, p_mean)
    const b_r = Math.fround(Math.fround(Math.fround(-a_r) * I_mean) + p_r);
    const b_g = Math.fround(Math.fround(Math.fround(-a_g) * I_mean) + p_g);
    const b_b = Math.fround(Math.fround(Math.fround(-a_b) * I_mean) + p_b);
    //   @IR %86 = shuffle b to 4-vec ; %87 = insertelement lane3 = 0
    write_output_b([writeX, writeY], [b_r, b_g, b_b, Math.fround(0)]);

    // Slide window: add new BOTTOM sample at rightEdge (%61), then subtract
    // old TOP sample at leftEdge (%62), for both textures.
    //   @IR %88..%89 sample p_I at rightEdge      %90 = fadd
    //   @IR %91..%92 sample Ip_Isq at rightEdge   %93 = fadd
    //   @IR %94..%95 sample p_I at leftEdge       %96 = fsub
    //   @IR %97..%98 sample Ip_Isq at leftEdge    %99 = fsub
    const spR = sample_input_p_I_mean_row([rightX, rightY]);
    const p_afterAdd: [number, number, number, number] = [
      Math.fround(slide_p[0] + Math.fround(spR[0])),
      Math.fround(slide_p[1] + Math.fround(spR[1])),
      Math.fround(slide_p[2] + Math.fround(spR[2])),
      Math.fround(slide_p[3] + Math.fround(spR[3])),
    ];
    const sIpR = sample_input_Ip_I_sq_mean_row([rightX, rightY]);
    const Ip_afterAdd: [number, number, number, number] = [
      Math.fround(slide_Ip[0] + Math.fround(sIpR[0])),
      Math.fround(slide_Ip[1] + Math.fround(sIpR[1])),
      Math.fround(slide_Ip[2] + Math.fround(sIpR[2])),
      Math.fround(slide_Ip[3] + Math.fround(sIpR[3])),
    ];
    const spL = sample_input_p_I_mean_row([leftX, leftY]);
    slide_p = [
      Math.fround(p_afterAdd[0] - Math.fround(spL[0])),
      Math.fround(p_afterAdd[1] - Math.fround(spL[1])),
      Math.fround(p_afterAdd[2] - Math.fround(spL[2])),
      Math.fround(p_afterAdd[3] - Math.fround(spL[3])),
    ];
    const sIpL = sample_input_Ip_I_sq_mean_row([leftX, leftY]);
    slide_Ip = [
      Math.fround(Ip_afterAdd[0] - Math.fround(sIpL[0])),
      Math.fround(Ip_afterAdd[1] - Math.fround(sIpL[1])),
      Math.fround(Ip_afterAdd[2] - Math.fround(sIpL[2])),
      Math.fround(Ip_afterAdd[3] - Math.fround(sIpL[3])),
    ];

    // Advance cursors: rightEdge.y++, leftEdge.y++, writePos.y++.
    //   @IR %100 %101 %102 rightEdge.y (fp32 +1.0f)
    //   @IR %103 %104 %105 leftEdge.y
    //   @IR %106 %107 %108 writePos.y (int32 +1)
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %109 = j+1 ; %110 = eq %34 (height) → exit.
  }
}
