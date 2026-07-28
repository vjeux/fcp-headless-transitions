// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass4 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass4.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009b79d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass4 (HeliumSenso)
 *
 * Guided-filter Pass4 — FINAL composite. Consumes the per-column running sums
 * of a and b from Pass3 (`input_a_mean_row`, `input_b_mean_row`) plus the
 * original guide image `input_I`, walks a VERTICAL (2*radius+1) sliding
 * window to complete the box-mean of (a, b), and writes the filter output:
 *
 *     N       = m_numPixelsInRect
 *     I_r     = input_I(pos + 0.5).r        ; splat over 4 lanes
 *     q       = (a_sum * I_r + b_sum) / N   ; 4-lane fmuladd then fdiv
 *     q.a     = 1.0f                         ; force alpha
 *     output_q = clamp(q, 0.0f, 1.0f)
 *
 * i.e. per output pixel we form the classical guided-filter reconstruction
 *   q = mean(a) * I + mean(b) = (Σa · I + Σb) / N
 * with the guide-image intensity taken from the input_I texture at the
 * WRITE position (in pixel coords + 0.5 for texel centers), NOT at a
 * separate cursor — I is a per-pixel value, not a running sum.
 *
 * Same vertical sliding-window structure as Pass2, but with an extra
 * per-output sample of input_I and the a·I+b linear combination, and the
 * clamp+alpha-force at write time.
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass4(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_a_mean_row  [[texture(0)]],
 *       texture2d<float,sample> input_b_mean_row  [[texture(1)]],
 *       texture2d<float,sample> input_I           [[texture(2)]],
 *       texture2d<float,write>  output_q          [[texture(3)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in
 *   +16  int   m_radius
 *   +20  int   m_numPixelsInRect
 *
 * Fast-math is DISABLED (!12), so every fp32 op is Math.fround-narrowed.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p3_Pass4_Params {
  /** int4 at +0. @IR %9 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %20 */
  m_radius: number;
  /** int at +20, align 4. @IR %38 */
  m_numPixelsInRect: number;
}

/** RGBA float4 sampler contract. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/** Clamp a float to [lo, hi]. Matches `air.clamp` (native FMIN/FMAX, no NaN
 *  propagation guarantee — NaN inputs would flow through fmax then fmin the
 *  same way GPU air.clamp does, but for this pipeline every fp32 lane is
 *  finite by construction). */
function clamp1(x: number, lo: number, hi: number): number {
  return Math.fround(Math.min(hi, Math.max(lo, Math.fround(x))));
}

/**
 * soGuidedFilter_I1p3_Pass4 — one dispatched thread.
 *
 * @IR entire function @0x0000000009b79d.
 */
export function soGuidedFilter_I1p3_Pass4(
  params: soGuidedFilter_I1p3_Pass4_Params,
  grid_in: [number, number],
  sample_input_a_mean_row: Sample2D,
  sample_input_b_mean_row: Sample2D,
  sample_input_I: Sample2D,
  write_output_q: Write2D,
): void {
  // Base write pos = rect.xy + grid_in (Pass2-family, no swap).
  //   @IR %9 %10 %11
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // Width guard (unsigned). @IR %12 %13 %14 %15 %16
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // Convert pos to float (unsigned). @IR %18
  const posXf = Math.fround((posX >>> 0));
  const posYf = Math.fround((posY >>> 0));

  // Load radius (i32, align 16), signed→float. @IR %20 %21
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posXf + 0.5, posYf - radiusF + 0.5). @IR %22 %23 %24
  const startUvX = Math.fround(Math.fround(posXf - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posYf - radiusF) + Math.fround(0.5));

  // diameter = (radius << 1) | 1. @IR %25 %26 %27
  const diameter = ((radius << 1) | 1) | 0;

  // Post-init-loop phis (block %28):
  //   %29 = b_sum (zero or init-loop result)
  //   %30 = a_sum (zero or init-loop result)
  //   %31 = cursor (%24 or final %55)
  let a_sum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let b_sum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %42: walk diameter samples down y-axis, accumulate a_sum,b_sum.
    let curX = startUvX;
    let curY = startUvY;
    let acc_a: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %44
    let acc_b: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %45
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample a, add. @IR %47 %48 %49
      const sa = sample_input_a_mean_row([curX, curY]);
      acc_a = [
        Math.fround(acc_a[0] + Math.fround(sa[0])),
        Math.fround(acc_a[1] + Math.fround(sa[1])),
        Math.fround(acc_a[2] + Math.fround(sa[2])),
        Math.fround(acc_a[3] + Math.fround(sa[3])),
      ];
      // Sample b, add. @IR %50 %51 %52
      const sb = sample_input_b_mean_row([curX, curY]);
      acc_b = [
        Math.fround(acc_b[0] + Math.fround(sb[0])),
        Math.fround(acc_b[1] + Math.fround(sb[1])),
        Math.fround(acc_b[2] + Math.fround(sb[2])),
        Math.fround(acc_b[3] + Math.fround(sb[3])),
      ];
      // cursor.y += 1.0f. @IR %53 %54 %55
      curY = Math.fround(curY + Math.fround(1));
      // %56 = i+1 ; %57 = eq diameter → exit.
    }
    a_sum = acc_a;
    b_sum = acc_b;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %28: height guard (SIGNED). @IR %32 %33 %34 %35
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // Block %36: load N, splat to a 4-vec with lane 3 undef (the IR uses
  // <0,0,0,undef>). The 3-lane result of fdiv is later overwritten with
  // 1.0 in lane 3 (%72) — so the "undef lane" never leaves this kernel.
  //   @IR %38 %39 %40 %41
  const N = Math.fround(params.m_numPixelsInRect | 0);
  // splat used as divisor; lane 3 is a don't-care since the alpha lane
  // is forced to 1.0f immediately after the divide.
  // (kept for provenance; used inline below.)

  // Sliding output loop %58.
  //   %59 rightEdge — init = cursorAfterInit
  //   %60 leftEdge  — init = startUV
  //   %61 writePos  — init = (posX, posY) = %11
  //   %62 a_sum, %63 b_sum — from block %36 phi (i.e. from block %28's phis).
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide_a = a_sum;
  let slide_b = b_sum;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Compute q for the CURRENT window.
    //   @IR %65 = convert.f writePos to float (UNSIGNED)
    //   @IR %66 = writePosF + <0.5, 0.5>            uv for input_I sampling
    const uv_I_X = Math.fround(Math.fround((writeX >>> 0)) + Math.fround(0.5));
    const uv_I_Y = Math.fround(Math.fround((writeY >>> 0)) + Math.fround(0.5));
    // @IR %67 %68 sample input_I at (writePosF + 0.5)
    const sI = sample_input_I([uv_I_X, uv_I_Y]);
    // @IR %69 = shufflevector sI, undef, <0,0,0,0> — splat I.r across 4 lanes
    const I_splat = Math.fround(sI[0]);
    // @IR %70 = fmuladd(a_sum, I_splat, b_sum) — a*I + b (per lane)
    const q_r = Math.fround(Math.fround(Math.fround(slide_a[0]) * I_splat) + Math.fround(slide_b[0]));
    const q_g = Math.fround(Math.fround(Math.fround(slide_a[1]) * I_splat) + Math.fround(slide_b[1]));
    const q_b = Math.fround(Math.fround(Math.fround(slide_a[2]) * I_splat) + Math.fround(slide_b[2]));
    // lane 3 is computed but overwritten with 1.0 next; keep the divide for
    // provenance correctness but it does not affect the output.
    // @IR %71 = fdiv %70, splat(N)
    const q_r_norm = Math.fround(q_r / N);
    const q_g_norm = Math.fround(q_g / N);
    const q_b_norm = Math.fround(q_b / N);
    // @IR %72 = insertelement %71, 1.0f, 3  →  alpha lane forced to 1.0
    // @IR %73 = air.clamp(%72, <0,0,0,0>, <1,1,1,1>)
    const out_r = clamp1(q_r_norm, Math.fround(0), Math.fround(1));
    const out_g = clamp1(q_g_norm, Math.fround(0), Math.fround(1));
    const out_b = clamp1(q_b_norm, Math.fround(0), Math.fround(1));
    const out_a = clamp1(Math.fround(1), Math.fround(0), Math.fround(1)); // trivially 1.0
    write_output_q([writeX, writeY], [out_r, out_g, out_b, out_a]);

    // Slide the a/b accumulators: add new bottom (rightEdge), subtract old top (leftEdge).
    //   @IR %74 %75 sample_a at rightEdge  %76 fadd
    //   @IR %77 %78 sample_b at rightEdge  %79 fadd
    //   @IR %80 %81 sample_a at leftEdge   %82 fsub
    //   @IR %83 %84 sample_b at leftEdge   %85 fsub
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

    // Advance cursors on the y axis.
    //   @IR %86 %87 %88 rightEdge.y (fp32 +1)
    //   @IR %89 %90 %91 leftEdge.y
    //   @IR %92 %93 %94 writePos.y (int32 +1)
    rightY = Math.fround(rightY + Math.fround(1));
    leftY = Math.fround(leftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %95 = j+1 ; %96 = eq height → exit.
  }
}
