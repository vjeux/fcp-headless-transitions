// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass3 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass3.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009a46d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass3 (HeliumSenso)
 *
 * Guided-filter Pass3 "a/b horizontal running-sum" kernel — the horizontal
 * twin of the (a, b) coefficient row-sum step. For each row `grid.x` (within
 * the rect height), walks a horizontal (2*radius+1) window over TWO input
 * textures (`input_a`, `input_b`, both produced by Pass2) and writes their
 * per-column running sums into `output_a_mean_row` and `output_b_mean_row`.
 *
 * Same shape as Pass1 (horizontal box sums with the axis-swapped grid),
 * but WITHOUT any weighted "Ip" cross-term — this is a plain running box
 * sum on both textures independently. It's Pass1 minus the I·p multiplication.
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass3(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_a           [[texture(0)]],
 *       texture2d<float,sample> input_b           [[texture(1)]],
 *       texture2d<float,write>  output_a_mean_row [[texture(2)]],
 *       texture2d<float,write>  output_b_mean_row [[texture(3)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in
 *   +16  int   m_radius
 *
 * Fast-math is DISABLED (!12), so every fp32 op is Math.fround-narrowed.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p3_Pass3_Params {
  /** int4 at +0. @IR %10 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %21 */
  m_radius: number;
}

/** RGBA float4 sampler contract. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass3 — one dispatched thread.
 *
 * @IR entire function @0x0000000009a46d.
 */
export function soGuidedFilter_I1p3_Pass3(
  params: soGuidedFilter_I1p3_Pass3_Params,
  grid_in: [number, number],
  sample_input_a: Sample2D,
  sample_input_b: Sample2D,
  write_output_a_mean_row: Write2D,
  write_output_b_mean_row: Write2D,
): void {
  // Axis-swapped grid (%1 → %8 shuffled <1,0>), then base pos = rect.xy + swappedGrid.
  //   @IR %8 = shuffle grid_in, undef, <1,0>   (grid.y, grid.x)
  //   @IR %11 = shuffle rect, undef, <0,1>     (rect.x, rect.y)
  //   @IR %12 = %11 + %8                       (rect.x+grid.y, rect.y+grid.x)
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const posBaseX = (rect0 + gy) | 0;
  const posBaseY = (rect1 + gx) | 0;

  // Height guard on the outer axis (grid.x). @IR %13 %14 %15 %16 %17 (ult)
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gx >>> 0) >= height) return;

  // Convert pos to float (UNSIGNED). @IR %19
  const posBaseXf = Math.fround((posBaseX >>> 0));
  const posBaseYf = Math.fround((posBaseY >>> 0));

  // Load radius, signed→float. @IR %21 %22
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posBaseXf - radiusF + 0.5, posBaseYf + 0.5).
  //   @IR %23 = insertelement <undef, 0>, radiusF, 0  →  (radiusF, 0.0)
  //   @IR %24 = fsub pos, %23                          →  (posX-radius, posY)
  //   @IR %25 = fadd %24, <0.5, 0.5>                   →  (posX-radius+0.5, posY+0.5)
  const startUvX = Math.fround(Math.fround(posBaseXf - radiusF) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posBaseYf - Math.fround(0)) + Math.fround(0.5));

  // diameter = 2*radius + 1. @IR %26 %27 %28
  const diameter = ((radius << 1) | 1) | 0;

  // Post-init-loop phis (block %29):
  //   %30 = accum_b   (zero or init-loop result)
  //   %31 = accum_a   (zero or init-loop result)
  //   %32 = cursor    (%25 or final %50)
  let accum_a: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let accum_b: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %37: walk diameter samples across x-axis, accumulate both textures.
    let curX = startUvX;        // @IR %38 lane0
    let curY = startUvY;        // @IR %38 lane1 (never changes here)
    let acc_a: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %39
    let acc_b: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %40
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input_a at cursor, add. @IR %42 %43 %44
      const sa = sample_input_a([curX, curY]);
      acc_a = [
        Math.fround(acc_a[0] + Math.fround(sa[0])),
        Math.fround(acc_a[1] + Math.fround(sa[1])),
        Math.fround(acc_a[2] + Math.fround(sa[2])),
        Math.fround(acc_a[3] + Math.fround(sa[3])),
      ];
      // Sample input_b at cursor, add. @IR %45 %46 %47
      const sb = sample_input_b([curX, curY]);
      acc_b = [
        Math.fround(acc_b[0] + Math.fround(sb[0])),
        Math.fround(acc_b[1] + Math.fround(sb[1])),
        Math.fround(acc_b[2] + Math.fround(sb[2])),
        Math.fround(acc_b[3] + Math.fround(sb[3])),
      ];
      // cursor.x += 1.0f. @IR %48 %49 %50
      curX = Math.fround(curX + Math.fround(1));
      // %51 = i+1 ; %52 = eq diameter → exit.
    }
    accum_a = acc_a;
    accum_b = acc_b;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %29: width guard (SIGNED sgt). @IR %33 %34 %35 %36
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Sliding output loop %53. Cursors:
  //   %54 rightEdge — init = cursorAfterInit (%32 after init loop)
  //   %55 leftEdge  — init = startUV (%25)
  //   %56 writePos  — init = (posBaseX, posBaseY) = %12
  //   %58 = accum_a phi (%31)
  //   %59 = accum_b phi (%30)
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posBaseX | 0;
  let writeY = posBaseY | 0;
  let slide_a = accum_a;
  let slide_b = accum_b;

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Write CURRENT accumulators to a_mean_row and b_mean_row.
    //   @IR air.write_texture_2d.v4f32 output_a_mean_row  writePos  %58
    //   @IR air.write_texture_2d.v4f32 output_b_mean_row  writePos  %59
    write_output_a_mean_row([writeX, writeY], [
      Math.fround(slide_a[0]), Math.fround(slide_a[1]),
      Math.fround(slide_a[2]), Math.fround(slide_a[3]),
    ]);
    write_output_b_mean_row([writeX, writeY], [
      Math.fround(slide_b[0]), Math.fround(slide_b[1]),
      Math.fround(slide_b[2]), Math.fround(slide_b[3]),
    ]);

    // Slide window: sample NEW right-edge and ADD, then sample OLD left-edge
    // and SUBTRACT, for both textures independently.
    //   @IR %60 %61 %62 sample_a at rightEdge → fadd
    //   @IR %63 %64 %65 sample_b at rightEdge → fadd
    //   @IR %66 %67 %68 sample_a at leftEdge  → fsub
    //   @IR %69 %70 %71 sample_b at leftEdge  → fsub
    const saR = sample_input_a([rightX, rightY]);
    const a_afterAdd: [number, number, number, number] = [
      Math.fround(slide_a[0] + Math.fround(saR[0])),
      Math.fround(slide_a[1] + Math.fround(saR[1])),
      Math.fround(slide_a[2] + Math.fround(saR[2])),
      Math.fround(slide_a[3] + Math.fround(saR[3])),
    ];
    const sbR = sample_input_b([rightX, rightY]);
    const b_afterAdd: [number, number, number, number] = [
      Math.fround(slide_b[0] + Math.fround(sbR[0])),
      Math.fround(slide_b[1] + Math.fround(sbR[1])),
      Math.fround(slide_b[2] + Math.fround(sbR[2])),
      Math.fround(slide_b[3] + Math.fround(sbR[3])),
    ];
    const saL = sample_input_a([leftX, leftY]);
    slide_a = [
      Math.fround(a_afterAdd[0] - Math.fround(saL[0])),
      Math.fround(a_afterAdd[1] - Math.fround(saL[1])),
      Math.fround(a_afterAdd[2] - Math.fround(saL[2])),
      Math.fround(a_afterAdd[3] - Math.fround(saL[3])),
    ];
    const sbL = sample_input_b([leftX, leftY]);
    slide_b = [
      Math.fround(b_afterAdd[0] - Math.fround(sbL[0])),
      Math.fround(b_afterAdd[1] - Math.fround(sbL[1])),
      Math.fround(b_afterAdd[2] - Math.fround(sbL[2])),
      Math.fround(b_afterAdd[3] - Math.fround(sbL[3])),
    ];

    // Advance cursors: rightEdge.x++, leftEdge.x++, writePos.x++.
    //   @IR %72 %73 %74 rightEdge.x
    //   @IR %75 %76 %77 leftEdge.x
    //   @IR %78 %79 %80 writePos.x
    rightX = Math.fround(rightX + Math.fround(1));
    leftX = Math.fround(leftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %81 = j+1 ; %82 = eq width → exit.
  }
}
