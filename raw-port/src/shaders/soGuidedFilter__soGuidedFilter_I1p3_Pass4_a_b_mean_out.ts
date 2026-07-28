// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass4_a_b_mean_out (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass4_a_b_mean_out.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009cc0d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass4_a_b_mean_out (HeliumSenso)
 *
 * Guided-filter Pass4 (a-and-b-mean-out variant) — VERTICAL running-sum kernel
 * that consumes Pass3's two horizontal-sum textures (`input_a_mean_row`,
 * `input_b_mean_row`), completes the box-mean of a and b over a
 * (2*radius + 1) vertical window, and writes the two full 2D box-means as
 * separate output textures. This is a sibling of `soGuidedFilter_I1p3_Pass4`
 * (raw-port/src/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass4.ts,
 * @IR 0x0000000009b79d) — the sliding-window structure is identical, but
 * this variant does NOT sample the guide image `I`, does NOT form the linear
 * combination `a·I + b`, and does NOT clamp/force-alpha; instead it simply
 * emits `a_mean = accum_a / N` and `b_mean = accum_b / N` to two write
 * textures.
 *
 * Per output pixel:
 *
 *     N            = m_numPixelsInRect                  ; window area
 *     a_mean       = accum_a / N                        ; vec4 (@IR %65)
 *     b_mean       = accum_b / N                        ; vec4 (@IR %66)
 *     output_a_mean = a_mean                            ; vec4 direct write
 *     output_b_mean = b_mean                            ; vec4 direct write
 *
 * Structural layout mirrors Pass2 exactly:
 *   1. Bounds check on posX < (rect.z − rect.x)   @IR %12..%16
 *   2. Init loop %42: prime the vertical accumulator over `2*radius + 1`
 *      samples at the FIRST output row @IR %42..%57
 *   3. Height guard on (rect.w − rect.y) > 0     @IR %32..%35
 *   4. Output loop %58: for each of `height` output rows,
 *       a. divide-and-write a_mean, b_mean        @IR %65 %66 + two writes
 *       b. sample right-edge (add), left-edge (sub)  @IR %67..%78
 *       c. advance rightY, leftY (fp32 +1), writeY (i32 +1)  @IR %79..%87
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass4_a_b_mean_out(
 *       constant params  *params                    [[buffer(0)]],
 *       uint2             grid_in                   [[thread_position_in_grid]],
 *       sampler           sam                       [[sampler(0)]],
 *       texture2d<float,sample> input_a_mean_row    [[texture(0)]],
 *       texture2d<float,sample> input_b_mean_row    [[texture(1)]],
 *       texture2d<float,write>  output_a_mean       [[texture(2)]],
 *       texture2d<float,write>  output_b_mean       [[texture(3)]]);
 *
 * params struct (32 bytes, 16-byte aligned; from !18):
 *   +0   int4  m_rect_in           — (x0,y0,x1,y1)
 *   +16  int   m_radius            — half-window radius
 *   +20  int   m_numPixelsInRect   — window area N (2*radius+1)²
 *   (+24: 8-byte tail padding — [8 x i8], unused by the kernel)
 *
 * Fast-math is DISABLED (!12 air.compile.fast_math_disable) — every fp32
 * arithmetic op is Math.fround-narrowed. This is a direct TS mapping of
 * every IR SSA value; every `%N` in the IR maps to one line here.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p3_Pass4_a_b_mean_out_Params {
  /** int4 at +0. @IR %9 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %20 */
  m_radius: number;
  /** int at +20, align 4. @IR %38 */
  m_numPixelsInRect: number;
}

/** RGBA float4 sampler contract. Matches `air.sample_texture_2d.v4f32`. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. Matches `air.write_texture_2d.v4f32`. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass4_a_b_mean_out — one dispatched thread.
 *
 * @IR entire function @0x0000000009cc0d.
 */
export function soGuidedFilter_I1p3_Pass4_a_b_mean_out(
  params: soGuidedFilter_I1p3_Pass4_a_b_mean_out_Params,
  grid_in: [number, number],
  sample_input_a_mean_row: Sample2D,
  sample_input_b_mean_row: Sample2D,
  write_output_a_mean: Write2D,
  write_output_b_mean: Write2D,
): void {
  // Load rect + compute base write pos = rect.xy + grid_in (Pass2-family, no swap).
  //   @IR %9 = load <4xi32> ; %10 = shuffle %9, undef, <0,1> ; %11 = %10 + grid_in
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;   // @IR %11 lane0 = %12
  const posY = (rect1 + gy) | 0;   // @IR %11 lane1

  // Width guard: %12 = %11.x ; %15 = rect.z − rect.x ; %16 = ult %12, %15.
  //   @IR %13 %14 %15 %16
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // %18 = air.convert.f.v2f32.u.v2i32(%11) — UNSIGNED int→float.
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // %20 = load radius (i32) ; %21 = signed→float.
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf + 0.5, posYf − radiusF + 0.5) — top of initial window.
  //   @IR %22 = insertelement <0, undef>, radiusF, 1   →  (0.0, radiusF)
  //   @IR %23 = fsub posF, %22                          →  (posXf, posYf − radiusF)
  //   @IR %24 = fadd %23, <0.5, 0.5>                    →  (posXf + 0.5, posYf − radiusF + 0.5)
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1  →  2*radius + 1 (always odd).
  //   @IR %25 %26 %27 (signed > 0 check)
  const diameter = ((radius << 1) | 1) | 0;

  // Phi values entering block %28 (post init-loop):
  //   %29 = accum_b   (zero if diameter<=0 else result of init loop)
  //   %30 = accum_a   (zero if diameter<=0 else result of init loop)
  //   %31 = cursor    (%24 if diameter<=0 else final %55)
  let accum_a: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let accum_b: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %42: walk (2*radius + 1) samples down y = startUvY..startUvY + diameter − 1
    //   accumulating both textures at UV = current cursor.
    let curX = startUvX;      // @IR %43 lane0 (never changes in this loop)
    let curY = startUvY;      // @IR %43 lane1 (increments by 1.0f per iteration)
    let acc_a: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %44
    let acc_b: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %45
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input_a_mean_row at current cursor. @IR %47 %48
      const sa = sample_input_a_mean_row([curX, curY]);
      // acc_a += sa (4-lane fadd). @IR %49
      acc_a = [
        Math.fround(acc_a[0] + Math.fround(sa[0])),
        Math.fround(acc_a[1] + Math.fround(sa[1])),
        Math.fround(acc_a[2] + Math.fround(sa[2])),
        Math.fround(acc_a[3] + Math.fround(sa[3])),
      ];
      // Sample input_b_mean_row at same cursor. @IR %50 %51
      const sb = sample_input_b_mean_row([curX, curY]);
      // acc_b += sb (4-lane fadd). @IR %52
      acc_b = [
        Math.fround(acc_b[0] + Math.fround(sb[0])),
        Math.fround(acc_b[1] + Math.fround(sb[1])),
        Math.fround(acc_b[2] + Math.fround(sb[2])),
        Math.fround(acc_b[3] + Math.fround(sb[3])),
      ];
      // cursor.y += 1.0f. @IR %53 %54 %55
      curY = Math.fround(curY + Math.fround(1));
      // %56 = i + 1 ; %57 = eq diameter → exit.
    }
    accum_a = acc_a;
    accum_b = acc_b;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %28: height guard.
  //   @IR %32 = rect.w ; %33 = rect.y ; %34 = sub ; %35 = sgt %34, 0 (SIGNED)
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %36: load N (constant across the output loop).
  //   @IR %38 = load i32 numPixels ; %39 = signed→float ; %40 %41 = splat to <4>
  const numPixelsF = Math.fround(params.m_numPixelsInRect | 0);

  // Block %58 sliding output loop. Cursors:
  //   rightEdgeCursor (%59) init = cursorAfterInit (the y-advanced cursor from init loop; @IR %31)
  //   leftEdgeCursor  (%60) init = startUV (the ORIGINAL top-of-window UV, @IR %24)
  //   writePos        (%61) init = (posX, posY) = @IR %11
  // Accumulators (%63 = accum_a, %64 = accum_b) start from the init-loop phi values.
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide_a = accum_a;
  let slide_b = accum_b;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Divide-and-write: a_mean = accum_a / N (splat), b_mean = accum_b / N.
    //   @IR %65 = fdiv %63, %41   ; write output_a_mean
    //   @IR %66 = fdiv %64, %41   ; write output_b_mean
    const a_mean_r = Math.fround(slide_a[0] / numPixelsF);
    const a_mean_g = Math.fround(slide_a[1] / numPixelsF);
    const a_mean_b = Math.fround(slide_a[2] / numPixelsF);
    const a_mean_a = Math.fround(slide_a[3] / numPixelsF);
    write_output_a_mean([writeX, writeY], [a_mean_r, a_mean_g, a_mean_b, a_mean_a]);
    const b_mean_r = Math.fround(slide_b[0] / numPixelsF);
    const b_mean_g = Math.fround(slide_b[1] / numPixelsF);
    const b_mean_b = Math.fround(slide_b[2] / numPixelsF);
    const b_mean_a = Math.fround(slide_b[3] / numPixelsF);
    write_output_b_mean([writeX, writeY], [b_mean_r, b_mean_g, b_mean_b, b_mean_a]);

    // Slide window: add new BOTTOM sample at rightEdge (%59), then subtract
    // old TOP sample at leftEdge (%60), for both textures.
    //   @IR %67..%68 sample a at rightEdge      %69 = fadd
    //   @IR %70..%71 sample b at rightEdge      %72 = fadd
    //   @IR %73..%74 sample a at leftEdge       %75 = fsub
    //   @IR %76..%77 sample b at leftEdge       %78 = fsub
    const saR = sample_input_a_mean_row([rightX, rightY]);
    const a_afterAdd: [number, number, number, number] = [
      Math.fround(slide_a[0] + Math.fround(saR[0])),
      Math.fround(slide_a[1] + Math.fround(saR[1])),
      Math.fround(slide_a[2] + Math.fround(saR[2])),
      Math.fround(slide_a[3] + Math.fround(saR[3])),
    ];
    const sbR = sample_input_b_mean_row([rightX, rightY]);
    const b_afterAdd: [number, number, number, number] = [
      Math.fround(slide_b[0] + Math.fround(sbR[0])),
      Math.fround(slide_b[1] + Math.fround(sbR[1])),
      Math.fround(slide_b[2] + Math.fround(sbR[2])),
      Math.fround(slide_b[3] + Math.fround(sbR[3])),
    ];
    const saL = sample_input_a_mean_row([leftX, leftY]);
    slide_a = [
      Math.fround(a_afterAdd[0] - Math.fround(saL[0])),
      Math.fround(a_afterAdd[1] - Math.fround(saL[1])),
      Math.fround(a_afterAdd[2] - Math.fround(saL[2])),
      Math.fround(a_afterAdd[3] - Math.fround(saL[3])),
    ];
    const sbL = sample_input_b_mean_row([leftX, leftY]);
    slide_b = [
      Math.fround(b_afterAdd[0] - Math.fround(sbL[0])),
      Math.fround(b_afterAdd[1] - Math.fround(sbL[1])),
      Math.fround(b_afterAdd[2] - Math.fround(sbL[2])),
      Math.fround(b_afterAdd[3] - Math.fround(sbL[3])),
    ];

    // Advance cursors: rightEdge.y++, leftEdge.y++, writePos.y++.
    //   @IR %79 %80 %81 rightEdge.y (fp32 +1.0f)
    //   @IR %82 %83 %84 leftEdge.y
    //   @IR %85 %86 %87 writePos.y (int32 +1)
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %88 = j + 1 ; %89 = eq %34 (height) → exit.
  }
}
