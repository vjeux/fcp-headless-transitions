// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass2_I (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass2_I.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x00000000097c2d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass2_I (HeliumSenso)
 *
 * Guided-filter Pass2 "I-only" variant — VERTICAL running-sum kernel that
 * consumes a 2-lane row-sum texture holding (I, I²) per pixel, forms the
 * per-window means, and emits I-statistics.
 *
 *     N        = m_numPixelsInRect                   ; window area
 *     mean2    = accum / N                            ; vec2 = (I_mean, I_sq_mean)
 *     var_I    = I_sq_mean - I_mean * I_mean          ; fp32 fmuladd
 *     output_I_stats = (I_mean, var_I, 0, 0)          ; float4 write
 *
 * Only two input lanes are tracked (float2 accumulator) — this is the
 * "I-only" companion to the full float4 Pass2 (which handles both p and I).
 * Uses the same init-loop-then-slide structure as Pass1 and Pass2, but the
 * sliding step only samples ONE input texture per side (no p-side texture
 * exists in this dispatch — there is no p to update).
 *
 * Signature from !air.kernel (!14..!22):
 *   kernel void soGuidedFilter_I1p3_Pass2_I(
 *       constant params  *params                      [[buffer(0)]],
 *       uint2             grid_in                     [[thread_position_in_grid]],
 *       sampler           sam                         [[sampler(0)]],
 *       texture2d<float,sample> input_I_I_sq_mean_row  [[texture(0)]],
 *       texture2d<float,write>  output_I_stats         [[texture(1)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in           — (x0,y0,x1,y1)
 *   +16  int   m_radius            — half-window radius
 *   +20  int   m_numPixelsInRect   — window area N
 *
 * Note: the underlying struct type in the IR is named
 * `soGuidedFilter_I1p1_Pass4_params` (Apple's compiler reuses layout-compatible
 * struct types across kernels). The `!18` field metadata is the authoritative
 * source for names/offsets, and it names these fields as above.
 *
 * Fast-math is DISABLED (!12), so every fp32 op is Math.fround-narrowed.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p3_Pass2_I_Params {
  /** int4 at +0. @IR %7 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %18 */
  m_radius: number;
  /** int at +20, align 4. @IR %35 */
  m_numPixelsInRect: number;
}

/** RGBA float4 sampler contract. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass2_I — one dispatched thread.
 *
 * @IR entire function @0x00000000097c2d.
 */
export function soGuidedFilter_I1p3_Pass2_I(
  params: soGuidedFilter_I1p3_Pass2_I_Params,
  grid_in: [number, number],
  sample_input_I_I_sq_mean_row: Sample2D,
  write_output_I_stats: Write2D,
): void {
  // Base write pos = rect.xy + grid_in (no axis swap here — Pass2-family layout).
  //   @IR %7 %8 %9
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // Width guard (unsigned): @IR %10 %11 %12 %13 %14
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // Convert pos to float (unsigned): @IR %16
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // Load radius (i32, align 16), signed→float. @IR %18 %19
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf + 0.5, posYf - radiusF + 0.5). @IR %20 %21 %22
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1  =  2*radius + 1. @IR %23 %24 %25
  const diameter = ((radius << 1) | 1) | 0;

  // Post-init-loop phis (block %26):
  //   %27 = 2-lane accumulator     (zeros if diameter<=0, else result of init loop)
  //   %28 = cursor after init loop (startUV if diameter<=0, else final %49)
  let accum2X = Math.fround(0);      // @IR %27 lane0 (I sum)
  let accum2Y = Math.fround(0);      // @IR %27 lane1 (I² sum)
  let cursorAfterInitX = startUvX;   // @IR %28
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %39: walk diameter samples down y-axis, accumulate LANES 0,1
    // of sampled float4 into a 2-lane accumulator (only first two lanes used).
    let curX = startUvX;             // @IR %40 lane0
    let curY = startUvY;             // @IR %40 lane1
    let acc2X = Math.fround(0);      // @IR %41 lane0
    let acc2Y = Math.fround(0);      // @IR %41 lane1
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input at cursor. @IR %43 %44
      const s = sample_input_I_I_sq_mean_row([curX, curY]);
      // Take lanes 0..1, add to accumulator. @IR %45 %46
      acc2X = Math.fround(acc2X + Math.fround(s[0]));
      acc2Y = Math.fround(acc2Y + Math.fround(s[1]));
      // cursor.y += 1.0f. @IR %47 %48 %49
      curY = Math.fround(curY + Math.fround(1));
      // %50 = i+1 ; %51 = eq diameter → exit.
    }
    accum2X = acc2X;
    accum2Y = acc2Y;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %26: height guard (SIGNED sgt).
  //   @IR %29 %30 %31 %32
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %33: load N, splat to <2 x float>. @IR %35 %36 %37 %38
  const numPixelsF = Math.fround(params.m_numPixelsInRect | 0);

  // Sliding output loop %52. Cursors:
  //   %53 rightEdge — init = cursorAfterInit
  //   %54 leftEdge  — init = startUV (the top-of-window UV)
  //   %55 writePos  — init = (posX, posY)
  //   %56 accum2    — init = accum2 from init loop.
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slideX = accum2X;
  let slideY = accum2Y;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Emit I stats for the current window.
    //   @IR %58 = fdiv slide, splat(N)     → (I_mean, I_sq_mean)
    //   @IR %59 = extractelement %58, 1     → I_sq_mean
    //   @IR %60 = extractelement %58, 0     → I_mean
    //   @IR %61 = fneg %60                  → -I_mean
    //   @IR %62 = fmuladd(-I_mean, I_mean, I_sq_mean)  → var_I
    //   @IR %63 %64 → build float4 (I_mean, var_I, 0, 0)
    const I_mean = Math.fround(slideX / numPixelsF);
    const I_sq_mean = Math.fround(slideY / numPixelsF);
    const negI = Math.fround(-I_mean);
    const var_I = Math.fround(Math.fround(negI * I_mean) + I_sq_mean);
    write_output_I_stats([writeX, writeY], [
      I_mean, var_I, Math.fround(0), Math.fround(0),
    ]);

    // Slide window: add new BOTTOM (rightEdge) sample, subtract old TOP (leftEdge).
    //   @IR %65 %66 %67 sample at rightEdge, take lanes 0..1
    //   @IR %68 = fadd slide, right2
    //   @IR %69 %70 %71 sample at leftEdge, take lanes 0..1
    //   @IR %72 = fsub (slide+right), left2
    const sR = sample_input_I_I_sq_mean_row([rightX, rightY]);
    const afterAddX = Math.fround(slideX + Math.fround(sR[0]));
    const afterAddY = Math.fround(slideY + Math.fround(sR[1]));
    const sL = sample_input_I_I_sq_mean_row([leftX, leftY]);
    slideX = Math.fround(afterAddX - Math.fround(sL[0]));
    slideY = Math.fround(afterAddY - Math.fround(sL[1]));

    // Advance cursors: rightEdge.y++, leftEdge.y++, writePos.y++.
    //   @IR %73 %74 %75 rightEdge.y (fp32 +1)
    //   @IR %76 %77 %78 leftEdge.y
    //   @IR %79 %80 %81 writePos.y (int32 +1)
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %82 = j+1 ; %83 = eq height → exit.
  }
}
