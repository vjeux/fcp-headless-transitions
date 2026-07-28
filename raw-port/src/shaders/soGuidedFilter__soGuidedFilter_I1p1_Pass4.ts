// @shader soGuidedFilter::soGuidedFilter_I1p1_Pass4 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p1_Pass4.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000008ef1d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p1_Pass4 (HeliumSenso)
 *
 * Guided-filter Pass4 "vertical running-mean over `a_b`, apply q = a*I + b,
 * write clamped q" kernel — the I=1, p=1 single-channel-guide twin of
 * soGuidedFilter_I1p3_Pass4. For each COLUMN `grid.x` (within the rect
 * width) it walks a vertical (2*radius+1) window over the per-row
 * (a,b) means produced by Pass3 (`input_a_b_mean_row`), forms the
 * per-pixel `(sum_a / N) * I + (sum_b / N)` — expressed here as the
 * running fmuladd(a, I, b) / N because the sums stay pre-divided-by-N
 * until this pass — clamps to [0,1] and writes an RGBA where alpha=1.
 *
 * Signature from !air.kernel (!14..!23):
 *   kernel void soGuidedFilter_I1p1_Pass4(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_a_b_mean_row [[texture(0)]],
 *       texture2d<float,sample> input_I           [[texture(1)]],
 *       texture2d<float,write>  output_q          [[texture(2)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in
 *   +16  int   m_radius
 *   +20  int   m_numPixelsInRect
 *
 * Fast-math is DISABLED (!12), so every fp32 op is fp32-narrowed with
 * Math.fround. No shortcut language of any kind.
 *
 * AXIS NOTE: unlike Pass3, Pass4 does NOT axis-swap the grid — the
 *   shufflevector at %9 is `<i32 0, i32 1>` (identity xy). The OUTER
 *   axis is grid.x with an UNSIGNED (`icmp ult`) width guard @IR %15;
 *   the INNER axis is height with a SIGNED (`icmp sgt`) guard @IR %33.
 *   Both are preserved literally.
 * TEXTURE NOTE: input_a_b_mean_row is sampled on the sliding window at
 *   INT-based UVs (int cursor cast via air.convert.f.v2f32.u.v2i32 —
 *   UNSIGNED), while input_I is sampled at the running `_23` UV in the
 *   same style Pass3 used, plus +0.5 bias.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_I1p1_Pass4_Params {
  /** int4 at +0. @IR %8 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %19 */
  m_radius: number;
  /** int at +20, align 4. @IR %36 */
  m_numPixelsInRect: number;
}

/** RGBA float4 sampler contract. */
export type Sample2D = (
  uv: [number, number],
) => [number, number, number, number];
/** RGBA float4 writer contract. */
export type Write2D = (
  pos: [number, number],
  rgba: [number, number, number, number],
) => void;

/**
 * soGuidedFilter_I1p1_Pass4 — one dispatched thread.
 *
 * @IR entire function @0x0000000008ef1d.
 */
export function soGuidedFilter_I1p1_Pass4(
  params: soGuidedFilter_I1p1_Pass4_Params,
  grid_in: [number, number],
  sample_input_a_b_mean_row: Sample2D,
  sample_input_I: Sample2D,
  write_output_q: Write2D,
): void {
  // Base int pos = rect.xy + grid (identity shuffle @IR %9 is <0,1>).
  //   @IR %8  = load rect (int4)
  //   @IR %9  = shufflevector rect, undef, <0,1>       (rect.x, rect.y)
  //   @IR %10 = add %9, grid_in                          (px, py)
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // Width guard on OUTER axis grid.x — UNSIGNED (icmp ult).
  //   @IR %11 = extractelement %10, 0
  //   @IR %12 = rect[2] ; %13 = rect[0]
  //   @IR %14 = sub nsw %12, %13         (width)
  //   @IR %15 = icmp ult %11, %14        (UNSIGNED)
  const width = ((rect2 - rect0) | 0) >>> 0;
  if ((posX >>> 0) >= width) return;

  // Convert int pos to float pos — air.convert.f.v2f32.u.v2i32 (UNSIGNED).
  //   @IR %17 = tail call air.convert.f.v2f32.u.v2i32(<2 x i32> %10)
  const posFx = Math.fround((posX >>> 0));
  const posFy = Math.fround((posY >>> 0));

  // radius (signed) -> f32.  @IR %19/%20
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (pos.x + 0.0 + 0.5, pos.y - radius + 0.5)
  //   @IR %21 = insertelement <0.0, undef>, radiusF, 1   →  (0.0, radiusF)
  //   @IR %22 = fsub posF, %21                             →  (pos.x-0, pos.y-radius)
  //   @IR %23 = fadd %22, <0.5, 0.5>                       →  (pos.x+0.5, pos.y-radius+0.5)
  const startUvX = Math.fround(Math.fround(posFx - Math.fround(0)) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posFy - radiusF) + Math.fround(0.5));

  // diameter = 2*radius + 1.  @IR %24 = shl %19, 1 ; %25 = or %24, 1
  const diameter = ((radius << 1) | 1) | 0;

  // Init-loop guard: signed sgt %25, 0 @IR %26.
  //   NB Pass4 shares the OUTER-ult / INNER-sgt asymmetry with Pass3 and
  //   with the whole guided-filter/bm3dnr family; preserved literally.

  // Post-init-loop phis @IR %27:
  //   %28 = accumulator (zeroinitializer or from init loop)
  //   %29 = uv-cursor    ( %23 startUV, or %47 after init )
  let accum: [number, number, number, number] = [
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
  ];
  let uvAfterInitX = startUvX;
  let uvAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop @IR %38: `diameter` samples of input_a_b_mean_row along +y,
    // accumulating rgba. Cursor Y += 1.0 per iteration.
    //   %39 = phi cursor  ( %23 or %47 )
    //   %40 = phi acc     ( zero or %44 )
    //   %41 = phi i       ( 0 or %48 )
    //   %42 = air.sample_texture_2d.v4f32(input_a_b_mean_row, sam, cursor, ...)
    //   %43 = extractvalue %42, 0
    //   %44 = fadd acc, %43
    //   %45 = extractelement cursor, 1   (Y lane)
    //   %46 = fadd %45, 1.0
    //   %47 = insertelement cursor, %46, 1
    //   %48 = i + 1 ; %49 = icmp eq %25 → exit.
    let curX = startUvX;
    let curY = startUvY;
    let acc: [number, number, number, number] = [
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ];
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      const s = sample_input_a_b_mean_row([curX, curY]);
      acc = [
        Math.fround(acc[0] + Math.fround(s[0])),
        Math.fround(acc[1] + Math.fround(s[1])),
        Math.fround(acc[2] + Math.fround(s[2])),
        Math.fround(acc[3] + Math.fround(s[3])),
      ];
      curY = Math.fround(curY + Math.fround(1));
    }
    accum = acc;
    uvAfterInitX = curX;
    uvAfterInitY = curY;
  }

  // Height guard on INNER axis — SIGNED (icmp sgt).
  //   @IR %30 = rect[3] ; %31 = rect[1] ; %32 = sub %30, %31 (height, signed)
  //   @IR %33 = icmp sgt %32, 0
  const height = (rect3 - rect1) | 0;
  if (height <= 0) return;

  // numPixelsInRect (signed) -> f32.  @IR %35/%36/%37
  const nPix = params.m_numPixelsInRect | 0;
  const nPixF = Math.fround(nPix | 0);

  // Sliding output loop @IR %50. Phis (all initialized at first iteration):
  //   %51 = uv-right      = %29    (post-init cursor, one past the initial window's top)
  //   %52 = uv-left       = %23    (start UV, i.e. window's top)
  //   %53 = write-int-pos = %10    (int pos)
  //   %54 = acc           = %28    (running window sum)
  //   %55 = row-index i (0..height)
  let uvRightX = uvAfterInitX;
  let uvRightY = uvAfterInitY;
  let uvLeftX = startUvX;
  let uvLeftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide = accum;

  for (let j = 0; j < height; j = (j + 1) | 0) {
    // Sample input_I at (int writePos)+0.5 in float space — but the IR
    // computes this every iteration from %53 (the int cursor):
    //   %56 = tail call air.convert.f.v2f32.u.v2i32(<2 x i32> %53)   UNSIGNED
    //   %57 = fadd %56, <0.5, 0.5>
    //   %58 = air.sample_texture_2d.v4f32(input_I, sam, %57, ...)
    //   %59 = extractvalue %58, 0
    const iuvX = Math.fround(
      Math.fround((writeX >>> 0)) + Math.fround(0.5),
    );
    const iuvY = Math.fround(
      Math.fround((writeY >>> 0)) + Math.fround(0.5),
    );
    const Isamp = sample_input_I([iuvX, iuvY]);

    // Compute q per component using ONLY the R and G lanes of the sliding
    // accumulator: R lane holds `a`, G lane holds `b` (see !21 arg name
    // "input_a_b_mean_row"). The IR literally does this only on lane 0 of
    // I (i.e. the guide's grayscale), then broadcasts:
    //   %60 = extractelement %59 (I), 0
    //   %61 = extractelement %54 (acc), 0   → a
    //   %62 = extractelement %54 (acc), 1   → b
    //   %63 = tail call llvm.fmuladd.f32(%61 /*a*/, %60 /*I*/, %62 /*b*/)
    //   %64 = fdiv %63, %37 /* nPixF */
    const a = Math.fround(slide[0]);
    const b = Math.fround(slide[1]);
    const I0 = Math.fround(Isamp[0]);
    const q_raw = Math.fround(Math.fround(a * I0) + b);
    const q = Math.fround(q_raw / nPixF);

    // Broadcast q into (r,g,b), set alpha=1.
    //   %65 = insertelement <undef, undef, undef, 1.0>, q, 0
    //   %66 = insertelement %65,                        q, 1
    //   %67 = insertelement %66,                        q, 2
    //   %68 = air.clamp.v4f32(%67, <0,0,0,0>, <1,1,1,1>)
    const qClamped = Math.fround(Math.max(0, Math.min(1, q)));
    // alpha=1 pre-clamp is already in [0,1] so clamp leaves it at 1.
    const outR = qClamped;
    const outG = qClamped;
    const outB = qClamped;
    const outA = Math.fround(1);

    // Write output_q at int writePos.
    //   air.write_texture_2d.v4f32(output_q, %53, %68, 0, 2)
    write_output_q([writeX, writeY], [outR, outG, outB, outA]);

    // Slide window: sample new BOTTOM (rightEdge in uv space) and ADD.
    //   %69 = air.sample_texture_2d.v4f32(input_a_b_mean_row, sam, %51 /*right*/, ...)
    //   %70 = extractvalue %69, 0
    //   %71 = fadd %54, %70
    const sBot = sample_input_a_b_mean_row([uvRightX, uvRightY]);
    const afterAdd: [number, number, number, number] = [
      Math.fround(slide[0] + Math.fround(sBot[0])),
      Math.fround(slide[1] + Math.fround(sBot[1])),
      Math.fround(slide[2] + Math.fround(sBot[2])),
      Math.fround(slide[3] + Math.fround(sBot[3])),
    ];

    // Sample OLD TOP (leftEdge) and SUBTRACT.
    //   %72 = air.sample_texture_2d.v4f32(input_a_b_mean_row, sam, %52 /*left*/, ...)
    //   %73 = extractvalue %72, 0
    //   %74 = fsub %71, %73
    const sTop = sample_input_a_b_mean_row([uvLeftX, uvLeftY]);
    slide = [
      Math.fround(afterAdd[0] - Math.fround(sTop[0])),
      Math.fround(afterAdd[1] - Math.fround(sTop[1])),
      Math.fround(afterAdd[2] - Math.fround(sTop[2])),
      Math.fround(afterAdd[3] - Math.fround(sTop[3])),
    ];

    // Advance cursors: rightEdge.Y++, leftEdge.Y++, writePos.Y++.
    //   %75 = extractelement %51, 1 ; %76 = fadd %75, 1.0 ; %77 = insertelement %51, %76, 1
    //   %78 = extractelement %52, 1 ; %79 = fadd %78, 1.0 ; %80 = insertelement %52, %79, 1
    //   %81 = extractelement %53, 1 ; %82 = add     %81, 1 ; %83 = insertelement %53, %82, 1
    uvRightY = Math.fround(uvRightY + Math.fround(1));
    uvLeftY = Math.fround(uvLeftY + Math.fround(1));
    writeY = (writeY + 1) | 0;
    // %84 = j+1 ; %85 = icmp eq height → exit.
  }
}
