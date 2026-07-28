// @shader soGuidedFilter::soGuidedFilter_I1p1_Pass4_a_b_mean_out (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p1_Pass4_a_b_mean_out.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x00000000902ed)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p1_Pass4_a_b_mean_out (HeliumSenso)
 *
 * Guided-filter Pass4 (a-and-b-mean-out variant) — VERTICAL running-sum kernel
 * that consumes Pass3's single joint (a,b) horizontal-sum texture
 * `input_a_b_mean_row`, completes the box-mean over a (2*radius + 1) vertical
 * window, and writes the joint 2D box-mean into `output_a_b_mean`.
 *
 * This is the I=1, p=1 sibling of soGuidedFilter_I1p3_Pass4_a_b_mean_out
 * (raw-port/src/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass4_a_b_mean_out.ts,
 * @IR 0x0000000009cc0d). The IR structure is identical, but this variant
 * has ONE input texture and ONE output texture (not two) since it operates
 * on a joint (a,b) coefficient rather than on separate a and b textures.
 *
 * Per output pixel:
 *
 *     N        = m_numPixelsInRect                     ; window area
 *     a_b_mean = accum / N                             ; vec4
 *     output_a_b_mean = a_b_mean                       ; direct write
 *
 * Structural layout mirrors the sibling exactly:
 *   1. Bounds check on posX < (rect.z − rect.x)   @IR %10..%14
 *   2. Init loop %39: prime the vertical accumulator over `2*radius + 1`
 *      samples at the FIRST output row                @IR %39..%50
 *   3. Height guard on (rect.w − rect.y) > 0          @IR %29..%32
 *   4. Output loop %51: for each of `height` output rows,
 *       a. divide-and-write mean                      @IR %57 + one write
 *       b. sample right-edge (add), left-edge (sub)   @IR %58..%63
 *       c. advance rightY, leftY (fp32 +1), writeY (i32 +1)  @IR %64..%72
 *
 * Signature from !air.kernel (!14..!22):
 *   kernel void soGuidedFilter_I1p1_Pass4_a_b_mean_out(
 *       constant params  *params                    [[buffer(0)]],
 *       uint2             grid_in                   [[thread_position_in_grid]],
 *       sampler           sam                       [[sampler(0)]],
 *       texture2d<float,sample> input_a_b_mean_row  [[texture(0)]],
 *       texture2d<float,write>  output_a_b_mean     [[texture(1)]]);
 *
 * params struct (32 bytes, 16-byte aligned; from !18):
 *   +0   int4  m_rect_in           — (x0,y0,x1,y1)
 *   +16  int   m_radius            — half-window radius
 *   +20  int   m_numPixelsInRect   — window area N (= 2*radius+1)²
 *   (+24: 8-byte tail padding — [8 x i8], unused by the kernel)
 *
 * Fast-math is DISABLED (!12 air.compile.fast_math_disable) — every fp32
 * arithmetic op is fp32-narrowed via Math.fround. No shortcut math of any
 * kind. Every `%N` SSA value in the IR maps to a documented line here.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p1_Pass4_a_b_mean_out_Params {
  /** int4 at +0. @IR %7 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %18 */
  m_radius: number;
  /** int at +20, align 4. @IR %35 */
  m_numPixelsInRect: number;
}

/** RGBA float4 sampler contract. Matches `air.sample_texture_2d.v4f32`. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. Matches `air.write_texture_2d.v4f32`. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p1_Pass4_a_b_mean_out — one dispatched thread.
 *
 * @IR entire function @0x00000000902ed.
 */
export function soGuidedFilter_I1p1_Pass4_a_b_mean_out(
  params: soGuidedFilter_I1p1_Pass4_a_b_mean_out_Params,
  grid_in: [number, number],
  sample_input_a_b_mean_row: Sample2D,
  write_output_a_b_mean: Write2D,
): void {
  // Load rect + compute base write pos = rect.xy + grid_in (Pass4-family, no axis swap).
  //   @IR %7 = load <4xi32> ; %8 = shufflevector %7, undef, <0,1> ; %9 = %8 + grid_in
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;   // @IR %9 lane0 = %10
  const posY = (rect1 + gy) | 0;   // @IR %9 lane1

  // Width guard: %10 = %9.x ; %11 = rect.z ; %12 = rect.x ; %13 = %11 − %12 ; %14 = ult %10, %13.
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // %16 = air.convert.f.v2f32.u.v2i32(%9) — UNSIGNED int→float.
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // %18 = load radius (i32) ; %19 = air.convert.f.f32.s.i32(%18) SIGNED→float.
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf + 0.5, posYf − radiusF + 0.5) — top of initial window.
  //   @IR %20 = insertelement <0.0, undef>, radiusF, 1   →  (0.0, radiusF)
  //   @IR %21 = fsub posF, %20                            →  (posXf, posYf − radiusF)
  //   @IR %22 = fadd %21, <0.5, 0.5>                      →  (posXf + 0.5, posYf − radiusF + 0.5)
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1  →  2*radius + 1 (always odd).
  //   @IR %23 = shl radius, 1 ; %24 = or %23, 1 ; %25 = sgt %24, 0 (SIGNED)
  const diameter = ((radius << 1) | 1) | 0;

  // Phi values entering block %26 (post init-loop):
  //   %27 = accum   (zero if diameter<=0 else result of init loop, @IR %45)
  //   %28 = cursor  (%22 if diameter<=0 else final %48)
  let accum: [number, number, number, number] = [
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %39: walk (2*radius + 1) samples DOWN the y axis from
    // (startUvX, startUvY..startUvY + diameter − 1) accumulating rgba.
    let curX = startUvX;      // @IR %40 lane0 (never changes in this loop)
    let curY = startUvY;      // @IR %40 lane1 (increments by 1.0f per iteration)
    let acc: [number, number, number, number] = [
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ]; // @IR %42
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input_a_b_mean_row at current cursor.
      //   @IR %43 = air.sample_texture_2d.v4f32(input_a_b_mean_row, sam, cursor, ...)
      //   @IR %44 = extractvalue %43, 0
      const s = sample_input_a_b_mean_row([curX, curY]);
      // acc += s (4-lane fadd). @IR %45 = fadd <4xf> %42, %44
      acc = [
        Math.fround(acc[0] + Math.fround(s[0])),
        Math.fround(acc[1] + Math.fround(s[1])),
        Math.fround(acc[2] + Math.fround(s[2])),
        Math.fround(acc[3] + Math.fround(s[3])),
      ];
      // cursor.y += 1.0f.
      //   @IR %46 = extractelement cursor, 1
      //   @IR %47 = fadd %46, 1.0
      //   @IR %48 = insertelement cursor, %47, 1
      curY = Math.fround(curY + Math.fround(1));
      // %49 = i+1 ; %50 = icmp eq diameter → exit.
    }
    accum = acc;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %26: height guard.
  //   @IR %29 = rect[3] ; %30 = rect[1] ; %31 = sub ; %32 = sgt %31, 0 (SIGNED)
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %33: load N (constant across the output loop).
  //   @IR %35 = load i32 numPixels ; %36 = signed→float
  //   @IR %37 = insertelement <undef>, %36, 0 ; %38 = shuffle splat to <4>
  const numPixelsF = Math.fround(params.m_numPixelsInRect | 0);

  // Block %51 sliding output loop. Cursors:
  //   rightEdgeCursor (%52) init = cursorAfterInit (%28)
  //   leftEdgeCursor  (%54) init = startUV (%22)
  //   writePos        (%56) init = (posX, posY) = @IR %9
  //   accum           (%55) init = %27
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide = accum;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Divide-and-write: a_b_mean = accum / N (splat).
    //   @IR %57 = fdiv <4xf> slide, splatN
    //   @IR       tail call air.write_texture_2d.v4f32(output_a_b_mean, writePos, %57, 0, 2)
    const mean_r = Math.fround(slide[0] / numPixelsF);
    const mean_g = Math.fround(slide[1] / numPixelsF);
    const mean_b = Math.fround(slide[2] / numPixelsF);
    const mean_a = Math.fround(slide[3] / numPixelsF);
    write_output_a_b_mean([writeX, writeY], [mean_r, mean_g, mean_b, mean_a]);

    // Slide window: add new BOTTOM sample at rightEdge, then subtract old
    // TOP sample at leftEdge.
    //   @IR %58 = air.sample_texture_2d.v4f32(input, sam, rightEdge, ...)
    //   @IR %59 = extractvalue %58, 0
    //   @IR %60 = fadd slide, %59
    //   @IR %61 = air.sample_texture_2d.v4f32(input, sam, leftEdge,  ...)
    //   @IR %62 = extractvalue %61, 0
    //   @IR %63 = fsub %60, %62
    const sR = sample_input_a_b_mean_row([rightX, rightY]);
    const afterAdd: [number, number, number, number] = [
      Math.fround(slide[0] + Math.fround(sR[0])),
      Math.fround(slide[1] + Math.fround(sR[1])),
      Math.fround(slide[2] + Math.fround(sR[2])),
      Math.fround(slide[3] + Math.fround(sR[3])),
    ];
    const sL = sample_input_a_b_mean_row([leftX, leftY]);
    slide = [
      Math.fround(afterAdd[0] - Math.fround(sL[0])),
      Math.fround(afterAdd[1] - Math.fround(sL[1])),
      Math.fround(afterAdd[2] - Math.fround(sL[2])),
      Math.fround(afterAdd[3] - Math.fround(sL[3])),
    ];

    // Advance cursors: rightEdge.y++, leftEdge.y++, writePos.y++.
    //   @IR %64 = extractelement rightEdge, 1 ; %65 = fadd %64, 1.0 ; %66 = insertelement
    //   @IR %67 = extractelement leftEdge,  1 ; %68 = fadd %67, 1.0 ; %69 = insertelement
    //   @IR %70 = extractelement writePos,  1 ; %71 = add  %70, 1   ; %72 = insertelement
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %73 = j + 1 ; %74 = icmp eq height → exit.
  }
}
