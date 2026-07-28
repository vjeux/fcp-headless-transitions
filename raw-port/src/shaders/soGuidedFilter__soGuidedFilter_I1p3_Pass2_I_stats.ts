// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass2_I_stats.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x00000000098f7d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass2_I_stats (HeliumSenso)
 *
 * Guided-filter Pass2 (I-stats variant) — VERTICAL running-sum kernel with
 * an EXTRA precomputed `input_I_stats` texture supplying the per-pixel
 * `I_mean` and `var_I` of the guide image. This is a sibling of
 * `soGuidedFilter_I1p3_Pass2` (raw-port/src/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass2.ts,
 * @IR 0x0000000009670d) — the structural sliding-window loop is identical,
 * but the coefficient math is REDIRECTED to consume the precomputed guide
 * statistics texture instead of deriving I_mean / I_sq_mean from the
 * accumulator's .w channel.
 *
 * Per output pixel:
 *
 *     N        = m_numPixelsInRect                      ; window area
 *     p_mean   = accum_p_only  / N                       ; vec4 (rgba)
 *     Ip_mean  = accum_Ip_only / N                       ; vec4 (rgba)
 *     I_stats  = sample(input_I_stats, grid_in + 0.5)    ; vec4 rgba
 *       I_stats.x = I_mean                               (broadcast across 4 lanes)
 *       I_stats.y = var_I                                (scalar)
 *     I_mean_v4 = broadcast(I_stats.x, 4)                 @IR %75
 *     cov_Ip   = Ip_mean − p_mean * I_mean                @IR %77 (vec4 fmuladd)
 *     denom    = var_I + epsilon                          @IR %78
 *     a        = cov_Ip / broadcast(denom)                @IR %81
 *     b        = p_mean − a * I_mean                      @IR %83 (vec4 fmuladd)
 *     output_a = a                                        (vec4 direct write)
 *     output_b = b                                        (vec4 direct write)
 *
 * Note the 4-lane-uniform application: unlike Pass2 (which does `.rgb`
 * math with a scalar I_mean because it packs I_mean into the .w of one
 * accumulator), this variant treats all 4 channels of the accumulators
 * uniformly — Ip and p are pure rgba, and the guide statistics are read
 * from the external `input_I_stats` texture at (grid_in + 0.5).
 *
 * Structural layout mirrors Pass2 exactly:
 *   1. Bounds check on posX < (rect.z − rect.x)   @IR %13..%17
 *   2. Init loop %45: prime the vertical accumulator over `2*radius + 1`
 *      samples at the FIRST output row @IR %45..%60
 *   3. Height guard on (rect.w − rect.y) > 0     @IR %33..%36
 *   4. Output loop %61: for each of `height` output rows,
 *       a. sample `input_I_stats` at (grid_in + 0.5)  @IR %68..%72
 *       b. compute p_mean, Ip_mean = accum / N        @IR %73 %74
 *       c. compute cov, denom, a, b                    @IR %75..%83
 *       d. write output_a, output_b                    @IR after %83
 *       e. sample right-edge (add), left-edge (sub)   @IR %84..%95
 *       f. advance rightY, leftY (fp32 +1), writeY (i32 +1)  @IR %96..%104
 *
 * Signature from !air.kernel (!14..!25):
 *   kernel void soGuidedFilter_I1p3_Pass2_I_stats(
 *       constant params  *params                    [[buffer(0)]],
 *       uint2             grid_in                   [[thread_position_in_grid]],
 *       sampler           sam                       [[sampler(0)]],
 *       texture2d<float,sample> input_p_mean_row     [[texture(0)]],
 *       texture2d<float,sample> input_Ip_mean_row    [[texture(1)]],
 *       texture2d<float,sample> input_I_stats        [[texture(2)]],
 *       texture2d<float,write>  output_a             [[texture(3)]],
 *       texture2d<float,write>  output_b             [[texture(4)]]);
 *
 * params struct (32 bytes, 16-byte aligned; same layout as Pass2 @!18):
 *   +0   int4  m_rect_in           — (x0,y0,x1,y1)
 *   +16  int   m_radius            — half-window radius
 *   +20  int   m_numPixelsInRect   — window area N (2*radius+1)²
 *   +24  float m_epsilon           — guided-filter regularization ε
 *
 * Fast-math is DISABLED (!12 air.compile.fast_math_disable) — every fp32
 * arithmetic op is Math.fround-narrowed. This is a direct TS mapping of
 * every IR SSA value; every `%N` in the IR maps to one line here.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p3_Pass2_I_stats_Params {
  /** int4 at +0. @IR %10 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %21 */
  m_radius: number;
  /** int at +20, align 4. @IR %39 */
  m_numPixelsInRect: number;
  /** float at +24, align 8. @IR %44 */
  m_epsilon: number;
}

/** RGBA float4 sampler contract. Matches `air.sample_texture_2d.v4f32`. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. Matches `air.write_texture_2d.v4f32`. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass2_I_stats — one dispatched thread.
 *
 * @IR entire function @0x00000000098f7d.
 */
export function soGuidedFilter_I1p3_Pass2_I_stats(
  params: soGuidedFilter_I1p3_Pass2_I_stats_Params,
  grid_in: [number, number],
  sample_input_p_mean_row: Sample2D,
  sample_input_Ip_mean_row: Sample2D,
  sample_input_I_stats: Sample2D,
  write_output_a: Write2D,
  write_output_b: Write2D,
): void {
  // Load rect + compute base write pos = rect.xy + grid_in. NO axis swap.
  //   @IR %10 = load <4xi32> ; %11 = shuffle %10, undef, <0,1> ; %12 = %11 + grid_in
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;   // @IR %12 lane0 = %13
  const posY = (rect1 + gy) | 0;   // @IR %12 lane1

  // Width guard: %13 = %12.x ; %16 = rect.z − rect.x ; %17 = ult %13, %16.
  //   @IR %14 %15 %16 %17
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // %19 = air.convert.f.v2f32.u.v2i32(%12) — UNSIGNED int→float.
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // %21 = load radius (i32) ; %22 = signed→float.
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf + 0.5, posYf − radiusF + 0.5) — top of initial window.
  //   @IR %23 = insertelement <0, undef>, radiusF, 1   →  (0.0, radiusF)
  //   @IR %24 = fsub posF, %23                          →  (posXf, posYf − radiusF)
  //   @IR %25 = fadd %24, <0.5, 0.5>                    →  (posXf + 0.5, posYf − radiusF + 0.5)
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1  →  2*radius + 1 (always odd).
  //   @IR %26 %27 %28 (signed > 0 check)
  const diameter = ((radius << 1) | 1) | 0;

  // Phi values entering block %29 (post init-loop):
  //   %30 = accum_Ip_only   (zero if diameter<=0 else result of init loop)
  //   %31 = accum_p_only    (zero if diameter<=0 else result of init loop)
  //   %32 = cursor          (%25 if diameter<=0 else final %58)
  let accum_p: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let accum_Ip: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %45: walk (2*radius + 1) samples down y = startUvY..startUvY + diameter − 1
    //   accumulating both textures at UV = current cursor.
    let curX = startUvX;      // @IR %46 lane0 (never changes in this loop)
    let curY = startUvY;      // @IR %46 lane1 (increments by 1.0f per iteration)
    let acc_p: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %47
    let acc_Ip: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %48
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input_p_mean_row at current cursor. @IR %50 %51
      const sp = sample_input_p_mean_row([curX, curY]);
      // acc_p += sp (4-lane fadd). @IR %52
      acc_p = [
        Math.fround(acc_p[0] + Math.fround(sp[0])),
        Math.fround(acc_p[1] + Math.fround(sp[1])),
        Math.fround(acc_p[2] + Math.fround(sp[2])),
        Math.fround(acc_p[3] + Math.fround(sp[3])),
      ];
      // Sample input_Ip_mean_row at same cursor. @IR %53 %54
      const sIp = sample_input_Ip_mean_row([curX, curY]);
      // acc_Ip += sIp (4-lane fadd). @IR %55
      acc_Ip = [
        Math.fround(acc_Ip[0] + Math.fround(sIp[0])),
        Math.fround(acc_Ip[1] + Math.fround(sIp[1])),
        Math.fround(acc_Ip[2] + Math.fround(sIp[2])),
        Math.fround(acc_Ip[3] + Math.fround(sIp[3])),
      ];
      // cursor.y += 1.0f. @IR %56 %57 %58
      curY = Math.fround(curY + Math.fround(1));
      // %59 = i + 1 ; %60 = eq diameter → exit.
    }
    accum_p = acc_p;
    accum_Ip = acc_Ip;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %29: height guard.
  //   @IR %33 = rect.w ; %34 = rect.y ; %35 = sub ; %36 = sgt %35, 0 (SIGNED)
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %37: load N and epsilon (constant across the output loop).
  //   @IR %39 = load i32 numPixels ; %40 = signed→float ; %41 %42 = splat to <4>
  const numPixelsF = Math.fround(params.m_numPixelsInRect | 0);
  //   @IR %44 = load float epsilon (align 8)
  const epsilon = Math.fround(params.m_epsilon);

  // Block %61 sliding output loop. Cursors:
  //   rightEdgeCursor (%62) init = cursorAfterInit (the y-advanced cursor from init loop; @IR %32)
  //   leftEdgeCursor  (%63) init = startUV (the ORIGINAL top-of-window UV, @IR %25)
  //   writePos        (%64) init = (posX, posY) = @IR %12
  // Accumulators (%65 = accum_p_only, %66 = accum_Ip_only) start from the init-loop phi values.
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide_p = accum_p;
  let slide_Ip = accum_Ip;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Sample input_I_stats at (writePos + 0.5) — precomputed guide stats.
    //   @IR %68 = air.convert.f.v2f32.u.v2i32(%64)
    //   @IR %69 = %68 + <0.5, 0.5>
    //   @IR %70 = air.sample_texture_2d(input_I_stats, sam, %69)
    //   @IR %71 = extractvalue %70, 0
    //   @IR %72 = extractelement %71, 1     ; I_stats.y  → var_I (scalar)
    //   @IR %75 = shufflevector %71, undef, zeroinitializer  ; splat(I_stats.x) → I_mean (vec4)
    const wxf = Math.fround(writeX >>> 0);
    const wyf = Math.fround(writeY >>> 0);
    const statsUvX = Math.fround(wxf + Math.fround(0.5));
    const statsUvY = Math.fround(wyf + Math.fround(0.5));
    const stats = sample_input_I_stats([statsUvX, statsUvY]);
    const stats_x = Math.fround(stats[0]);   // I_mean (per @IR %75 broadcast)
    const stats_y = Math.fround(stats[1]);   // var_I  (per @IR %72)

    // p_mean, Ip_mean = accumulators / N (splat).
    //   @IR %73 = fdiv slide_p  / splat(N)
    //   @IR %74 = fdiv slide_Ip / splat(N)
    const p_mean: [number, number, number, number] = [
      Math.fround(slide_p[0] / numPixelsF),
      Math.fround(slide_p[1] / numPixelsF),
      Math.fround(slide_p[2] / numPixelsF),
      Math.fround(slide_p[3] / numPixelsF),
    ];
    const Ip_mean: [number, number, number, number] = [
      Math.fround(slide_Ip[0] / numPixelsF),
      Math.fround(slide_Ip[1] / numPixelsF),
      Math.fround(slide_Ip[2] / numPixelsF),
      Math.fround(slide_Ip[3] / numPixelsF),
    ];

    // cov_Ip[c] = Ip_mean[c] − p_mean[c] * I_mean   (vec4 fmuladd).
    //   @IR %76 = fneg %75                         (−I_mean broadcast)
    //   @IR %77 = fmuladd(%76, %73, %74)            = Ip_mean − I_mean * p_mean
    const negI = Math.fround(-stats_x);
    const cov_r = Math.fround(Math.fround(negI * p_mean[0]) + Ip_mean[0]);
    const cov_g = Math.fround(Math.fround(negI * p_mean[1]) + Ip_mean[1]);
    const cov_b = Math.fround(Math.fround(negI * p_mean[2]) + Ip_mean[2]);
    const cov_a = Math.fround(Math.fround(negI * p_mean[3]) + Ip_mean[3]);

    // denom = epsilon + var_I  (scalar).
    //   @IR %78 = fadd %44, %72
    const denom = Math.fround(epsilon + stats_y);

    // a = cov_Ip / splat(denom).
    //   @IR %79 = insertelement <undef>, %78, 0 ; %80 = shuffle splat
    //   @IR %81 = fdiv cov_Ip, denom_splat
    const a_r = Math.fround(cov_r / denom);
    const a_g = Math.fround(cov_g / denom);
    const a_b = Math.fround(cov_b / denom);
    const a_a = Math.fround(cov_a / denom);

    // b = p_mean − a * I_mean   (vec4 fmuladd).
    //   @IR %82 = fneg %81
    //   @IR %83 = fmuladd(%82, %75, %73)          = p_mean − a * I_mean
    const b_r = Math.fround(Math.fround(Math.fround(-a_r) * stats_x) + p_mean[0]);
    const b_g = Math.fround(Math.fround(Math.fround(-a_g) * stats_x) + p_mean[1]);
    const b_b = Math.fround(Math.fround(Math.fround(-a_b) * stats_x) + p_mean[2]);
    const b_a = Math.fround(Math.fround(Math.fround(-a_a) * stats_x) + p_mean[3]);

    // Direct vec4 writes — NO lane3-zeroing (unlike Pass2 which .rgb-only).
    //   @IR write_texture_2d output_a %64 %81
    //   @IR write_texture_2d output_b %64 %83
    write_output_a([writeX, writeY], [a_r, a_g, a_b, a_a]);
    write_output_b([writeX, writeY], [b_r, b_g, b_b, b_a]);

    // Slide window: add new BOTTOM sample at rightEdge (%62), then subtract
    // old TOP sample at leftEdge (%63), for both textures.
    //   @IR %84..%85 sample p at rightEdge      %86 = fadd
    //   @IR %87..%88 sample Ip at rightEdge     %89 = fadd
    //   @IR %90..%91 sample p at leftEdge       %92 = fsub
    //   @IR %93..%94 sample Ip at leftEdge      %95 = fsub
    const spR = sample_input_p_mean_row([rightX, rightY]);
    const p_afterAdd: [number, number, number, number] = [
      Math.fround(slide_p[0] + Math.fround(spR[0])),
      Math.fround(slide_p[1] + Math.fround(spR[1])),
      Math.fround(slide_p[2] + Math.fround(spR[2])),
      Math.fround(slide_p[3] + Math.fround(spR[3])),
    ];
    const sIpR = sample_input_Ip_mean_row([rightX, rightY]);
    const Ip_afterAdd: [number, number, number, number] = [
      Math.fround(slide_Ip[0] + Math.fround(sIpR[0])),
      Math.fround(slide_Ip[1] + Math.fround(sIpR[1])),
      Math.fround(slide_Ip[2] + Math.fround(sIpR[2])),
      Math.fround(slide_Ip[3] + Math.fround(sIpR[3])),
    ];
    const spL = sample_input_p_mean_row([leftX, leftY]);
    slide_p = [
      Math.fround(p_afterAdd[0] - Math.fround(spL[0])),
      Math.fround(p_afterAdd[1] - Math.fround(spL[1])),
      Math.fround(p_afterAdd[2] - Math.fround(spL[2])),
      Math.fround(p_afterAdd[3] - Math.fround(spL[3])),
    ];
    const sIpL = sample_input_Ip_mean_row([leftX, leftY]);
    slide_Ip = [
      Math.fround(Ip_afterAdd[0] - Math.fround(sIpL[0])),
      Math.fround(Ip_afterAdd[1] - Math.fround(sIpL[1])),
      Math.fround(Ip_afterAdd[2] - Math.fround(sIpL[2])),
      Math.fround(Ip_afterAdd[3] - Math.fround(sIpL[3])),
    ];

    // Advance cursors: rightEdge.y++, leftEdge.y++, writePos.y++.
    //   @IR %96 %97 %98 rightEdge.y (fp32 +1.0f)
    //   @IR %99 %100 %101 leftEdge.y
    //   @IR %102 %103 %104 writePos.y (int32 +1)
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %105 = j + 1 ; %106 = eq %35 (height) → exit.
  }
}
