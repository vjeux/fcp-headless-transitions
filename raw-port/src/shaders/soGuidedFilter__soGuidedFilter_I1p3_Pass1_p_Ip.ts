// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass1_p_Ip.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009523d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass1_p_Ip (HeliumSenso)
 *
 * Guided-filter Pass1 "p and Ip horizontal running-sum" kernel. For each
 * row `grid.x` within the rect height, this kernel walks a horizontal
 * 2*radius+1 window over two textures (input_p, input_I) and produces:
 *   • output_p_mean_row  — running sum of p       across the window
 *   • output_Ip_mean_row — running sum of I.r * p across the window
 *
 * The sliding-window trick reads only ONE new right-edge sample and drops
 * ONE old left-edge sample per output column — an O(width * (2r+1) + width)
 * horizontal accumulator that Pass2 completes vertically. It's the same
 * shape as classic guided-filter box-filter passes: accumulate then slide.
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass1_p_Ip(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_p     [[texture(0)]],
 *       texture2d<float,sample> input_I     [[texture(1)]],
 *       texture2d<float,write>  output_p_mean_row  [[texture(2)]],
 *       texture2d<float,write>  output_Ip_mean_row [[texture(3)]]);
 *
 * params struct (from !18):
 *   +0   int4  m_rect_in            — (x0, y0, x1, y1)
 *   +16  float m_scaleDownsample    — uv scale factor (multiplies pixel coords before sampling)
 *   +20  int   m_radius             — half-window radius
 *
 * Denorms / fast-math (from !11..!13):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_disable   — strict IEEE-754, so we fp32-narrow every op via Math.fround.
 *
 * NB on axes:
 *   %1 is uint2 grid_in. The IR shufflevector at %8 swaps the two lanes:
 *     %8 = shuffle grid_in, undef, <1,0>  →  (grid.y, grid.x)
 *   The write coord is `rect.xy + (grid.y, grid.x)`, so grid.x indexes ROWS
 *   (image height dimension) and grid.y indexes COLUMNS (width dimension).
 *   That is: this dispatch's fast axis is columns (grid.y), slow axis is rows
 *   (grid.x); the outer bounds check `grid.x < (rect.w - rect.y)` guards the
 *   row count. This transcription mirrors that literally.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p3_Pass1_p_Ip_Params {
  /** int4 at +0: (x0, y0, x1, y1). @IR %10 */
  m_rect_in: [number, number, number, number];
  /** float at +16: uv scale multiplier. @IR %30/%43 (offset 16 float, align 16) */
  m_scaleDownsample: number;
  /** int at +20: half-window radius. @IR %21 (offset 20 i32, align 4) */
  m_radius: number;
}

/**
 * Sampler function contract — one 2D sample returning an RGBA float4.
 * Called by the kernel at every window step for both textures.
 * (`air.sample_texture_2d.v4f32` with LOD 0.0 — see IR call sites %52 %54 %72 %74 %80 %82.)
 */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Write function contract — one 2D write of an RGBA float4 at an int2 pixel.
 * (`air.write_texture_2d.v4f32` with mip=0, dim=2 — IR call sites at the top of
 * loop block %64 after each iteration bumps the write cursor.)
 */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass1_p_Ip — one dispatched thread.
 *
 * @param params   the constant-buffer params
 * @param grid_in  the [[thread_position_in_grid]] uint2 = (grid.x, grid.y)
 * @param sample_input_p  sampler-bound reader for the p-texture
 * @param sample_input_I  sampler-bound reader for the I-texture
 * @param write_output_p_mean_row   writer for output_p_mean_row
 * @param write_output_Ip_mean_row  writer for output_Ip_mean_row
 *
 * @IR entire function @0x0000000009523d.
 */
export function soGuidedFilter_I1p3_Pass1_p_Ip(
  params: soGuidedFilter_I1p3_Pass1_p_Ip_Params,
  grid_in: [number, number],
  sample_input_p: Sample2D,
  sample_input_I: Sample2D,
  write_output_p_mean_row: Write2D,
  write_output_Ip_mean_row: Write2D,
): void {
  // Truncate integer inputs to i32 semantics.
  const gx = grid_in[0] | 0;                        // @IR %13 = extractelement grid_in, 0
  const gy = grid_in[1] | 0;                        // @IR (grid_in.y)
  const rect0 = params.m_rect_in[0] | 0;            // @IR %38 = extractelement rect, 0
  const rect1 = params.m_rect_in[1] | 0;            // @IR %15 = extractelement rect, 1
  const rect2 = params.m_rect_in[2] | 0;            // @IR %37 = extractelement rect, 2
  const rect3 = params.m_rect_in[3] | 0;            // @IR %14 = extractelement rect, 3

  // Compose the shuffled base pos: %11 = rect.xy, %8 = (grid.y, grid.x),
  // %12 = %11 + %8. In our lane naming: posBase = (rect.x + grid.y, rect.y + grid.x).
  // @IR %11 @IR %8 @IR %12
  const posBaseX = (rect0 + gy) | 0;
  const posBaseY = (rect1 + gx) | 0;

  // Outer height guard: %16 = rect.w - rect.y ; %17 = icmp ult grid.x, %16.
  // Note the UNSIGNED compare: negative rect heights are treated as huge and
  // therefore always pass — we mirror bit-for-bit via `>>> 0`.
  // @IR %14 %15 %16 %17
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gx >>> 0) >= height) return;                 // @IR br i1 %17 → %99 exit

  // Convert base pos to float. @IR %19 = air.convert.f.v2f32.u.v2i32(%12)
  // The AIR intrinsic is UNSIGNED int→float. Mirror by masking to u32 first.
  const posBaseXf = Math.fround((posBaseX >>> 0));  // @IR %19 lane0
  const posBaseYf = Math.fround((posBaseY >>> 0));  // @IR %19 lane1

  // Load radius (signed i32). @IR %21 = load i32 at offset 20.
  const radius = params.m_radius | 0;

  // Convert radius to float (signed). @IR %22 = air.convert.f.f32.s.i32(%21)
  const radiusF = Math.fround(radius | 0);

  // startPos = posBaseF - (radiusF, 0.0f). @IR %23 = insertelement <undef, 0>, radiusF, 0
  //                                            %24 = fsub posF, %23
  // → (posBaseXf - radiusF, posBaseYf - 0.0f).
  // We keep two mutable running-window cursors (a "left edge" and a "right edge").
  // Initially both start at startPos; the left-only phase does not exist here —
  // the first loop (%46) walks the initial window and accumulates from startPos
  // upward, and the second loop (%64) slides the window by advancing rightEdge
  // and dropping leftEdge.
  let curLeftX = Math.fround(posBaseXf - radiusF);  // @IR %24 lane0
  let curLeftY = Math.fround(posBaseYf - Math.fround(0));  // @IR %24 lane1 (fsub y-0 = y)

  // diameter = (radius*2) | 1  → 2*radius + 1 (always odd since low bit is set).
  // @IR %25 = shl radius, 1 ; %26 = or %25, 1
  const diameter = ((radius << 1) | 1) | 0;

  // %27 = icmp sgt diameter, 0 — signed. If false, skip the initial-window loop
  // with zero-accumulators (block %33 phi's take zeroinitializer).
  // @IR %27 br i1
  let pAccum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ]; // @IR %35 phi (zero when %27 false, else result of %46 loop)
  let ipAccum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ]; // @IR %34 phi
  let cursorAfterInit: [number, number] = [curLeftX, curLeftY]; // @IR %36 phi (=%24 when skipped, else final %61)

  if (diameter > 0) {
    // Load scale, splat to <2 x float>. @IR %30 (align 16, offset 16) ; %31 %32 (splat)
    const scale = Math.fround(params.m_scaleDownsample);
    // Loop %46: for i in [0, diameter), sample p and I at (scale*cursor+0.5),
    //   pAccum += sample_p ; ipAccum += splat(sample_I.r) * sample_p ;
    //   cursor.x += 1.0f. Exit when i+1 == diameter (@IR %62 %63).
    let iterCursorX = curLeftX; // @IR %47 lane0
    let iterCursorY = curLeftY; // @IR %47 lane1
    let iterP: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %48
    let iterIp: [number, number, number, number] = [
      Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
    ]; // @IR %49
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // uv = scale * cursor + 0.5 (per lane). @IR %51 fmuladd(<scale,scale>, cursor, <0.5,0.5>)
      const uvX = Math.fround(Math.fround(scale * iterCursorX) + Math.fround(0.5));
      const uvY = Math.fround(Math.fround(scale * iterCursorY) + Math.fround(0.5));
      // sample_p / sample_I both use the same uv. @IR %52 %54
      const sp = sample_input_p([uvX, uvY]);           // @IR %53 = extractvalue
      const sI = sample_input_I([uvX, uvY]);           // @IR %55 = extractvalue
      // pAccum += sample_p (elementwise fp32 add). @IR %56 = fadd <4>
      iterP = [
        Math.fround(iterP[0] + Math.fround(sp[0])),
        Math.fround(iterP[1] + Math.fround(sp[1])),
        Math.fround(iterP[2] + Math.fround(sp[2])),
        Math.fround(iterP[3] + Math.fround(sp[3])),
      ];
      // ipAccum = fmuladd( splat(sample_I.r), sample_p, ipAccum ) → per lane.
      // @IR %57 = shufflevector sample_I, undef, <0,0,0,0>   (splat lane 0 / .r)
      // @IR %58 = llvm.fmuladd.v4f32(%57, sample_p, ipAccum)
      const Isplat = Math.fround(sI[0]);
      iterIp = [
        Math.fround(Math.fround(Isplat * Math.fround(sp[0])) + iterIp[0]),
        Math.fround(Math.fround(Isplat * Math.fround(sp[1])) + iterIp[1]),
        Math.fround(Math.fround(Isplat * Math.fround(sp[2])) + iterIp[2]),
        Math.fround(Math.fround(Isplat * Math.fround(sp[3])) + iterIp[3]),
      ];
      // cursor.x += 1.0f  (cursor.y unchanged). @IR %59 %60 %61
      iterCursorX = Math.fround(iterCursorX + Math.fround(1));
      // %62 = i+1 ; %63 = eq %62 diameter → exit
    }
    // Publish loop results as the phi values entering block %33.
    pAccum = iterP;
    ipAccum = iterIp;
    cursorAfterInit = [iterCursorX, iterCursorY];
  }

  // Block %33: %39 = rect.z - rect.x (width) ; %40 = icmp sgt %39, 0 (SIGNED).
  //            If width <= 0 → return.
  // @IR %37 %38 %39 %40
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Block %41: reload scale (the IR does this a second time), splat. @IR %43 %44 %45
  const scale = Math.fround(params.m_scaleDownsample);

  // Block %64 loop init — three cursor phis, two accum phis, one write-pos phi.
  //   %65 rightEdge — starts at cursorAfterInit (post-init window right edge).
  //   %66 leftEdge  — starts at the ORIGINAL startPos (posBase - (radiusF, 0)),
  //                   i.e. `%24` = curLeft* saved before the init loop.
  //   %67 writePos  — starts at posBase = (rect.x + gy, rect.y + gx).
  //   %68 pAccum, %69 ipAccum — phi'd from block %33 (either the init-loop
  //   results or zeros when the init loop was skipped).
  let rightX = cursorAfterInit[0];          // @IR %65 init (=%36)
  let rightY = cursorAfterInit[1];
  // Reset leftEdge to the ORIGINAL startPos (%24), NOT the mutated cursorAfterInit.
  // The init-loop's `iterCursorX` moved to the far right edge already; the
  // slide loop's left edge is the OTHER end of the same window.
  let leftX = Math.fround(posBaseXf - radiusF);    // @IR %66 init (=%24)
  let leftY = Math.fround(posBaseYf - Math.fround(0));
  let writeX = posBaseX | 0;                 // @IR %67 init (=%12)
  let writeY = posBaseY | 0;
  let slidingP = pAccum;                     // @IR %68
  let slidingIp = ipAccum;                   // @IR %69

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Write CURRENT accumulators (before this step advances the window).
    // @IR air.write_texture_2d.v4f32 output_p_mean_row  at writePos with %68
    // @IR air.write_texture_2d.v4f32 output_Ip_mean_row at writePos with %69
    write_output_p_mean_row([writeX, writeY], [
      Math.fround(slidingP[0]), Math.fround(slidingP[1]),
      Math.fround(slidingP[2]), Math.fround(slidingP[3]),
    ]);
    write_output_Ip_mean_row([writeX, writeY], [
      Math.fround(slidingIp[0]), Math.fround(slidingIp[1]),
      Math.fround(slidingIp[2]), Math.fround(slidingIp[3]),
    ]);

    // Sample the NEW right-edge column (adds one). @IR %71 %72 %73 %74 %75
    const uvRx = Math.fround(Math.fround(scale * rightX) + Math.fround(0.5));
    const uvRy = Math.fround(Math.fround(scale * rightY) + Math.fround(0.5));
    const spR = sample_input_p([uvRx, uvRy]);     // @IR %73
    const sIR = sample_input_I([uvRx, uvRy]);     // @IR %75

    // pAccum += sample_p_right. @IR %76 = fadd
    const p_afterRight: [number, number, number, number] = [
      Math.fround(slidingP[0] + Math.fround(spR[0])),
      Math.fround(slidingP[1] + Math.fround(spR[1])),
      Math.fround(slidingP[2] + Math.fround(spR[2])),
      Math.fround(slidingP[3] + Math.fround(spR[3])),
    ];
    // ipAccum += splat(sample_I_right.r) * sample_p_right. @IR %77 %78
    const IsR = Math.fround(sIR[0]);
    const ip_afterRight: [number, number, number, number] = [
      Math.fround(Math.fround(IsR * Math.fround(spR[0])) + slidingIp[0]),
      Math.fround(Math.fround(IsR * Math.fround(spR[1])) + slidingIp[1]),
      Math.fround(Math.fround(IsR * Math.fround(spR[2])) + slidingIp[2]),
      Math.fround(Math.fround(IsR * Math.fround(spR[3])) + slidingIp[3]),
    ];

    // Sample the OLD left-edge column (subtracts one). @IR %79 %80 %81 %82 %83
    const uvLx = Math.fround(Math.fround(scale * leftX) + Math.fround(0.5));
    const uvLy = Math.fround(Math.fround(scale * leftY) + Math.fround(0.5));
    const spL = sample_input_p([uvLx, uvLy]);     // @IR %81
    const sIL = sample_input_I([uvLx, uvLy]);     // @IR %83

    // pAccum -= sample_p_left. @IR %84 = fsub p_afterRight, sample_p_left
    slidingP = [
      Math.fround(p_afterRight[0] - Math.fround(spL[0])),
      Math.fround(p_afterRight[1] - Math.fround(spL[1])),
      Math.fround(p_afterRight[2] - Math.fround(spL[2])),
      Math.fround(p_afterRight[3] - Math.fround(spL[3])),
    ];
    // ipAccum += (-splat(sample_I_left.r)) * sample_p_left ; ipAccum was ip_afterRight.
    // @IR %85 splat ; %86 fsub <-0,-0,-0,-0>, %85 (fneg) ;
    //     %87 = fmuladd(-splat, sample_p_left, %78)
    const IsLneg = Math.fround(-Math.fround(sIL[0]));
    slidingIp = [
      Math.fround(Math.fround(IsLneg * Math.fround(spL[0])) + ip_afterRight[0]),
      Math.fround(Math.fround(IsLneg * Math.fround(spL[1])) + ip_afterRight[1]),
      Math.fround(Math.fround(IsLneg * Math.fround(spL[2])) + ip_afterRight[2]),
      Math.fround(Math.fround(IsLneg * Math.fround(spL[3])) + ip_afterRight[3]),
    ];

    // Advance cursors: rightEdge.x += 1.0f, leftEdge.x += 1.0f, writePos.x += 1.
    // @IR %88 %89 %90 rightEdge.x++, %91 %92 %93 leftEdge.x++, %94 %95 %96 writePos.x++.
    rightX = Math.fround(rightX + Math.fround(1));
    leftX = Math.fround(leftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %97 = j+1 ; %98 = eq j+1, width → exit at block %99 (ret).
  }
}
