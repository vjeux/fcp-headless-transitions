// @shader soGuidedFilter::soGuidedFilter_PassthroughTest (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_PassthroughTest.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009f2cd)
/**
 * @shader soGuidedFilter::soGuidedFilter_PassthroughTest (HeliumSenso)
 *
 * Debug/reference kernel that computes a horizontal box-MEAN of the guide
 * texture and writes it to `output`. For each row (grid.y) it walks a
 * horizontal (2*radius+1) window over `input`, dividing the running sum
 * by the window's diameter and writing the RGBA mean per column.
 *
 * Same shape as `soGuidedFilter_I1p1_Pass3` except:
 *   1. The grid identity shuffle is `<0,1>` (NO axis swap — the outer
 *      axis is grid.y).
 *   2. The output is a MEAN (sum / diameter), not a raw sum — the sliding
 *      accumulator is divided by `2*radius+1` at every write.
 *
 * Signature from !air.kernel (!14..!22):
 *   kernel void soGuidedFilter_PassthroughTest(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input       [[texture(0)]],
 *       texture2d<float,write>  output      [[texture(1)]]);
 *
 * params struct (from !18 — note the STRUCT-TYPE-NAME REUSE trap: the
 * type is IR-named `soGuidedFilter_I1p1_Pass3_params` but !18 declares
 * only m_rect_in + m_radius, and the AIR-side arg name is
 * `soGuidedFilter_PassthroughTest_params`. Trust !18):
 *   +0   int4  m_rect_in
 *   +16  int   m_radius
 *
 * Fast-math is DISABLED (!12), so every fp32 op is fp32-narrowed with
 * Math.fround. No shortcut language of any kind.
 */

/** params struct. @IR !18 */
export interface soGuidedFilter_PassthroughTest_Params {
  /** int4 at +0. @IR %7 */
  m_rect_in: [number, number, number, number];
  /** int at +16, align 16. @IR %18 */
  m_radius: number;
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
 * soGuidedFilter_PassthroughTest — one dispatched thread.
 *
 * @IR entire function @0x0000000009f2cd.
 */
export function soGuidedFilter_PassthroughTest(
  params: soGuidedFilter_PassthroughTest_Params,
  grid_in: [number, number],
  sample_input: Sample2D,
  write_output: Write2D,
): void {
  // Base int pos = rect.xy + grid (identity shuffle @IR %8 is <0,1>).
  //   @IR %7 = load rect (int4)
  //   @IR %8 = shufflevector rect, undef, <0,1>       (rect.x, rect.y)
  //   @IR %9 = add %8, grid_in                          (px, py)
  const gx = grid_in[0] | 0;
  const gy = grid_in[1] | 0;
  const rect0 = params.m_rect_in[0] | 0;
  const rect1 = params.m_rect_in[1] | 0;
  const rect2 = params.m_rect_in[2] | 0;
  const rect3 = params.m_rect_in[3] | 0;
  const posX = (rect0 + gx) | 0;
  const posY = (rect1 + gy) | 0;

  // Height guard on OUTER axis grid.y — UNSIGNED (icmp ult).
  //   @IR %10 = extractelement grid_in, 1
  //   @IR %11 = rect[3] ; %12 = rect[1]
  //   @IR %13 = sub nsw %11, %12                       (height)
  //   @IR %14 = icmp ult %10, %13                      (UNSIGNED)
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gy >>> 0) >= height) return;

  // Convert int pos to float — air.convert.f.v2f32.u.v2i32 (UNSIGNED).
  //   @IR %16 = tail call air.convert.f.v2f32.u.v2i32(<2 x i32> %9)
  const posFx = Math.fround((posX >>> 0));
  const posFy = Math.fround((posY >>> 0));

  // radius (signed) -> f32.  @IR %18/%19
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startUV = (pos.x - radius + 0.5, pos.y + 0.5)
  //   @IR %20 = insertelement <undef, 0.0>, radiusF, 0    →  (radiusF, 0.0)
  //   @IR %21 = fsub posF, %20                              →  (pos.x-radius, pos.y)
  //   @IR %22 = fadd %21, <0.5, 0.5>                        →  (pos.x-radius+0.5, pos.y+0.5)
  const startUvX = Math.fround(Math.fround(posFx - radiusF) + Math.fround(0.5));
  const startUvY = Math.fround(Math.fround(posFy - Math.fround(0)) + Math.fround(0.5));

  // diameter = 2*radius + 1.  @IR %23 = shl %18, 1 ; %24 = or %23, 1
  const diameter = ((radius << 1) | 1) | 0;

  // Init-loop guard: signed sgt %24, 0 @IR %25.
  //   NB the OUTER-ult / INNER-sgt asymmetry is preserved literally, as
  //   it is throughout the guided-filter family.

  // Post-init-loop phis @IR %26:
  //   %27 = accumulator (zeroinitializer or from init loop)
  //   %28 = uv-cursor    ( %22 startUV, or %46 after init )
  let accum: [number, number, number, number] = [
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
    Math.fround(0),
  ];
  let uvAfterInitX = startUvX;
  let uvAfterInitY = startUvY;

  if (diameter > 0) {
    // Init loop @IR %37: `diameter` samples of input along +x, cursor.X++.
    //   %38 = phi cursor  ( %22 or %46 )
    //   %39 = phi i       ( 0 or %47 )
    //   %40 = phi acc     ( zero or %43 )
    //   %41 = air.sample_texture_2d.v4f32(input, sam, cursor, ...)
    //   %42 = extractvalue %41, 0
    //   %43 = fadd acc, %42
    //   %44 = extractelement cursor, 0   (X lane)
    //   %45 = fadd %44, 1.0
    //   %46 = insertelement cursor, %45, 0
    //   %47 = i + 1 ; %48 = icmp eq %24 → exit.
    let curX = startUvX;
    let curY = startUvY;
    let acc: [number, number, number, number] = [
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ];
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      const s = sample_input([curX, curY]);
      acc = [
        Math.fround(acc[0] + Math.fround(s[0])),
        Math.fround(acc[1] + Math.fround(s[1])),
        Math.fround(acc[2] + Math.fround(s[2])),
        Math.fround(acc[3] + Math.fround(s[3])),
      ];
      curX = Math.fround(curX + Math.fround(1));
    }
    accum = acc;
    uvAfterInitX = curX;
    uvAfterInitY = curY;
  }

  // Width guard on INNER axis — SIGNED (icmp sgt).
  //   @IR %29 = rect[2] ; %30 = rect[0]
  //   @IR %31 = sub %29, %30              (width, signed)
  //   @IR %32 = icmp sgt %31, 0
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Diameter-as-float, broadcast to a v4 divisor: %34 = fmuladd(radiusF, 2, 1)
  //   = 2*radius + 1. Then %35/%36 shuffle it into <d,d,d,d>.
  const diameterF = Math.fround(Math.fround(radiusF * Math.fround(2)) + Math.fround(1));

  // Sliding output loop @IR %49. Phis (all initialized at first iteration):
  //   %50 = uv-right      = %28    (post-init cursor)
  //   %51 = j             = 0
  //   %52 = write-int-pos = %9     (int pos)
  //   %53 = uv-left       = %22    (start UV)
  //   %54 = acc           = %27    (running window sum)
  let uvRightX = uvAfterInitX;
  let uvRightY = uvAfterInitY;
  let uvLeftX = startUvX;
  let uvLeftY = startUvY;
  let writeX = posX | 0;
  let writeY = posY | 0;
  let slide = accum;

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Divide accumulator by diameter -> per-component MEAN.
    //   %55 = fdiv <4 x float> %54, %36 (broadcast diameterF)
    const meanR = Math.fround(slide[0] / diameterF);
    const meanG = Math.fround(slide[1] / diameterF);
    const meanB = Math.fround(slide[2] / diameterF);
    const meanA = Math.fround(slide[3] / diameterF);

    // Write mean to output at int pos.
    //   air.write_texture_2d.v4f32(output, %52, %55, 0, 2)
    write_output([writeX, writeY], [meanR, meanG, meanB, meanA]);

    // Slide window: sample NEW right-edge and ADD.
    //   %56 = air.sample_texture_2d.v4f32(input, sam, %50, ...)
    //   %57 = extractvalue %56, 0
    //   %58 = fadd %54, %57
    const sR = sample_input([uvRightX, uvRightY]);
    const afterAdd: [number, number, number, number] = [
      Math.fround(slide[0] + Math.fround(sR[0])),
      Math.fround(slide[1] + Math.fround(sR[1])),
      Math.fround(slide[2] + Math.fround(sR[2])),
      Math.fround(slide[3] + Math.fround(sR[3])),
    ];

    // Sample OLD left-edge and SUBTRACT.
    //   %59 = air.sample_texture_2d.v4f32(input, sam, %53, ...)
    //   %60 = extractvalue %59, 0
    //   %61 = fsub %58, %60
    const sL = sample_input([uvLeftX, uvLeftY]);
    slide = [
      Math.fround(afterAdd[0] - Math.fround(sL[0])),
      Math.fround(afterAdd[1] - Math.fround(sL[1])),
      Math.fround(afterAdd[2] - Math.fround(sL[2])),
      Math.fround(afterAdd[3] - Math.fround(sL[3])),
    ];

    // Advance cursors: rightEdge.X++, leftEdge.X++, writePos.X++.
    //   %62 = extractelement %50, 0 ; %63 = fadd %62, 1.0 ; %64 = insertelement %50, %63, 0
    //   %65 = extractelement %53, 0 ; %66 = fadd %65, 1.0 ; %67 = insertelement %53, %66, 0
    //   %68 = extractelement %52, 0 ; %69 = add     %68, 1 ; %70 = insertelement %52, %69, 0
    uvRightX = Math.fround(uvRightX + Math.fround(1));
    uvLeftX = Math.fround(uvLeftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %71 = j+1 ; %72 = icmp eq width → exit.
  }
}
