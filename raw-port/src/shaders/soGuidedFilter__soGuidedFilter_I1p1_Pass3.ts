// @shader soGuidedFilter::soGuidedFilter_I1p1_Pass3 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p1_Pass3.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000008dccd)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p1_Pass3 (HeliumSenso)
 *
 * Guided-filter Pass3 "a_b horizontal running-sum" kernel — the I=1, p=1
 * single-texture twin of soGuidedFilter_I1p3_Pass3. For each row `grid.x`
 * (within the rect height) it walks a horizontal (2*radius+1) window over
 * ONE input texture `input_a_b` (produced by Pass2 for the joint (a,b)
 * coefficient), writing the per-column running sum into `output_a_b_mean_row`.
 *
 * Same shape as the I1p3 sibling but WITHOUT a second texture — a plain
 * running box sum on a single RGBA texture, following the box-filter
 * axis-swapped-grid convention.
 *
 * Signature from !air.kernel (!14..!22):
 *   kernel void soGuidedFilter_I1p1_Pass3(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_a_b           [[texture(0)]],
 *       texture2d<float,write>  output_a_b_mean_row [[texture(1)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in
 *   +16  int   m_radius
 *
 * Fast-math is DISABLED (!12), so every fp32 op is fp32-narrowed with
 * Math.fround. No shortcut language of any kind is used in this port.
 */

// No shortcut math of any kind — every fp32 op below is decoded from its
// exact IR line and cast to float32 via Math.fround.

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p1_Pass3_Params {
  /** int4 at +0. @IR %8 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %19 */
  m_radius: number;
}

/** RGBA float4 sampler contract. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p1_Pass3 — one dispatched thread.
 *
 * @IR entire function @0x0000000008dccd.
 */
export function soGuidedFilter_I1p1_Pass3(
  params: soGuidedFilter_I1p1_Pass3_Params,
  grid_in: [number, number],
  sample_input_a_b: Sample2D,
  write_output_a_b_mean_row: Write2D,
): void {
  // Axis-swapped grid (%1 → %6 shuffled <1,0>), then base pos = rect.xy + swappedGrid.
  //   @IR %6  = shufflevector grid_in, undef, <1,0>   (grid.y, grid.x)
  //   @IR %9  = shufflevector rect,    undef, <0,1>   (rect.x, rect.y)
  //   @IR %10 = %9 + %6                                (rect.x+grid.y, rect.y+grid.x)
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const posBaseX = (rect0 + gy) | 0;
  const posBaseY = (rect1 + gx) | 0;

  // Height guard on the outer axis (grid.x). @IR %11 = extractelement grid, 0
  //                                            @IR %12 = rect[3]
  //                                            @IR %13 = rect[1]
  //                                            @IR %14 = %12 - %13
  //                                            @IR %15 = icmp ult grid.x, height
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gx >>> 0) >= height) return;

  // Convert pos to float (UNSIGNED — air.convert.f.v2f32.u.v2i32).
  //   @IR %17 = tail call air.convert.f.v2f32.u.v2i32(<2 x i32> %10)
  const posBaseXf = Math.fround((posBaseX >>> 0));
  const posBaseYf = Math.fround((posBaseY >>> 0));

  // Load radius, signed→float (air.convert.f.f32.s.i32).
  //   @IR %19 = load i32 params.m_radius   (aligned 16, tbaa "int" at offset 16)
  //   @IR %20 = tail call air.convert.f.f32.s.i32(%19)
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (posBaseXf - radiusF + 0.5, posBaseYf + 0 + 0.5).
  //   @IR %21 = insertelement <undef, 0.0>, radiusF, 0    →  (radiusF, 0.0)
  //   @IR %22 = fsub pos, %21                              →  (posX-radius, posY-0)
  //   @IR %23 = fadd %22, <0.5, 0.5>                       →  (posX-radius+0.5, posY+0.5)
  const startUvX = Math.fround(Math.fround(posBaseXf - radiusF) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posBaseYf - Math.fround(0)) + Math.fround(0.5));

  // diameter = 2*radius + 1.  @IR %24 = shl %19, 1 ; %25 = or %24, 1
  // Init-loop guard: signed sgt %25, 0.  @IR %26
  const diameter = ((radius << 1) | 1) | 0;

  // Post-init-loop phis (block %27):
  //   @IR %28 = phi <4 x float> [ zeroinitializer, %5 ], [ %40, %34 ]  (accumulator)
  //   @IR %29 = phi <2 x float> [ %23, %5 ], [ %43, %34 ]              (cursor)
  let accum: [number, number, number, number] = [
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
  ];
  let cursorAfterInitX = startUvX;
  let cursorAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop %34: walk `diameter` samples along +x, accumulating rgba.
    //   @IR %35 = phi <2 x float> cursor  ( %23 or %43 )
    //   @IR %36 = phi i32         i       ( 0 or %44 )
    //   @IR %37 = phi <4 x float> acc     ( zero or %40 )
    let curX = startUvX;
    let curY = startUvY;
    let acc: [number, number, number, number] = [
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ];
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // Sample input_a_b at cursor, add.
      //   @IR %38 = air.sample_texture_2d.v4f32(input_a_b, sam, cursor, ...)
      //   @IR %39 = extractvalue { <4 x float>, i8 } %38, 0
      //   @IR %40 = fadd <4 x float> %37, %39
      const s = sample_input_a_b([curX, curY]);
      acc = [
        Math.fround(acc[0] + Math.fround(s[0])),
        Math.fround(acc[1] + Math.fround(s[1])),
        Math.fround(acc[2] + Math.fround(s[2])),
        Math.fround(acc[3] + Math.fround(s[3])),
      ];
      // cursor.x += 1.0f.
      //   @IR %41 = extractelement cursor, 0
      //   @IR %42 = fadd %41, 1.0
      //   @IR %43 = insertelement cursor, %42, 0
      curX = Math.fround(curX + Math.fround(1));
      // %44 = i+1 ; %45 = icmp eq diameter → exit.
    }
    accum = acc;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %27: width guard (SIGNED sgt %32, 0). @IR %30 %31 %32 %33
  //   %30 = rect[2] ; %31 = rect[0] ; %32 = %30 - %31 (width)
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Sliding output loop %46. Cursors (all phis at %47/%49/%51):
  //   @IR %47 = rightEdge   (init = cursorAfterInit)
  //   @IR %48 = i           (init = 0)
  //   @IR %49 = leftEdge    (init = %23 startUV)
  //   @IR %50 = accum       (init = %28 accumulator)
  //   @IR %51 = writePos    (init = %10 base int pos)
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startUvX;
  let leftY = startUvY;
  let writeX = posBaseX | 0;
  let writeY = posBaseY | 0;
  let slide = accum;

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Write current accumulator to output_a_b_mean_row at writePos.
    //   @IR air.write_texture_2d.v4f32(output_a_b_mean_row, %51, %50, 0, 2)
    write_output_a_b_mean_row(
      [writeX, writeY],
      [
        Math.fround(slide[0]),
        Math.fround(slide[1]),
        Math.fround(slide[2]),
        Math.fround(slide[3]),
      ],
    );

    // Slide window: sample NEW right-edge and ADD, then sample OLD left-edge
    // and SUBTRACT.
    //   @IR %52 = air.sample_texture_2d.v4f32(input, sam, rightEdge, ...)
    //   @IR %53 = extractvalue %52, 0
    //   @IR %54 = fadd slide, %53
    //   @IR %55 = air.sample_texture_2d.v4f32(input, sam, leftEdge,  ...)
    //   @IR %56 = extractvalue %55, 0
    //   @IR %57 = fsub %54, %56
    const sR = sample_input_a_b([rightX, rightY]);
    const afterAdd: [number, number, number, number] = [
      Math.fround(slide[0] + Math.fround(sR[0])),
      Math.fround(slide[1] + Math.fround(sR[1])),
      Math.fround(slide[2] + Math.fround(sR[2])),
      Math.fround(slide[3] + Math.fround(sR[3])),
    ];
    const sL = sample_input_a_b([leftX, leftY]);
    slide = [
      Math.fround(afterAdd[0] - Math.fround(sL[0])),
      Math.fround(afterAdd[1] - Math.fround(sL[1])),
      Math.fround(afterAdd[2] - Math.fround(sL[2])),
      Math.fround(afterAdd[3] - Math.fround(sL[3])),
    ];

    // Advance cursors: rightEdge.x++, leftEdge.x++, writePos.x++.
    //   @IR %58 = extractelement rightEdge, 0 ; %59 = fadd %58, 1.0 ; %60 = insertelement
    //   @IR %61 = extractelement leftEdge,  0 ; %62 = fadd %61, 1.0 ; %63 = insertelement
    //   @IR %64 = extractelement writePos,  0 ; %65 = add     %64, 1 ; %66 = insertelement
    rightX = Math.fround(rightX + Math.fround(1));
    leftX = Math.fround(leftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %67 = j+1 ; %68 = icmp eq width → exit.
  }
}
