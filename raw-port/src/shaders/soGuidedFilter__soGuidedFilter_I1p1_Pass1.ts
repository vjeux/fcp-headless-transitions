// @shader soGuidedFilter::soGuidedFilter_I1p1_Pass1 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p1_Pass1.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000008b44d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p1_Pass1 (HeliumSenso)
 *
 * Guided-filter Pass1 for the (I=1-channel, p=1-channel) variant — the "I1p1" case.
 * For each row (grid.x) within the rect height, this kernel walks a horizontal
 * 2*radius+1 sliding window over two textures (input_p, input_I) and produces a
 * SINGLE 4-channel packed output row:
 *   .r  =  running sum of p    across the window       (sum_p)
 *   .g  =  running sum of I    across the window       (sum_I)
 *   .b  =  running sum of I*p  across the window       (sum_Ip)
 *   .a  =  running sum of I*I  across the window       (sum_II)
 *
 * That packing is the difference from the I1p3 sibling — the I1p3 variant emits
 * two separate 4-lane textures for a 3-channel p; here, both p and I are single-
 * channel so their means and cross/self products all fit into one float4 per
 * column. Everything else (sliding-window trick, height guard, unsigned/signed
 * width guard asymmetry) is byte-identical to the I1p3 shape.
 *
 * Signature from !air.kernel (!14..!23):
 *   kernel void soGuidedFilter_I1p1_Pass1(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_p                          [[texture(0)]],
 *       texture2d<float,sample> input_I                          [[texture(1)]],
 *       texture2d<float,write>  output_p_I_Ip_I_sq_mean_row      [[texture(2)]]);
 *
 * params struct (from !18 — 32 bytes, 16-byte aligned):
 *   +0   int4  m_rect_in            — (x0, y0, x1, y1)
 *   +16  float m_scaleDownsample    — uv scale factor (multiplies pixel coords)
 *   +20  int   m_radius             — half-window radius
 *
 * Denorms / fast-math (from !11..!13):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_disable   — strict IEEE-754, so fp32-narrow every op via Math.fround.
 *
 * Axis convention (from IR %7 shufflevector <1,0>): grid.x indexes ROWS (image
 * height dimension), grid.y indexes COLUMNS (width dimension). The outer height
 * guard tests grid.x (ROW index) against `rect.w - rect.y` (image height); the
 * inner width guard tests the loop count against `rect.z - rect.x` (image width).
 *
 * The height guard uses `icmp ult` (UNSIGNED) — negative rect heights are treated
 * as huge and always pass. The width guard uses `icmp sgt` (SIGNED) — negative
 * widths early-return. Preserved literally, per shaders-porting rules.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p1_Pass1_Params {
  /** int4 at +0: (x0, y0, x1, y1). @IR %9 */
  m_rect_in: [number, number, number, number];
  /** float at +16: uv scale multiplier. @IR %29/%41 (offset 16, align 16) */
  m_scaleDownsample: number;
  /** int at +20: half-window radius. @IR %20 (offset 20 i32, align 4) */
  m_radius: number;
}

/**
 * Sampler function contract — one 2D sample returning an RGBA float4.
 * Called at every window step for both textures.
 * (`air.sample_texture_2d.v4f32` with LOD 0.0 — see IR call sites %49 %52 %79 %82 %94 %97.)
 */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Write function contract — one 2D write of an RGBA float4 at an int2 pixel.
 * (`air.write_texture_2d.v4f32` at the top of loop %72 body.)
 */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p1_Pass1 — one dispatched thread.
 *
 * @param params   the constant-buffer params
 * @param grid_in  the [[thread_position_in_grid]] uint2 = (grid.x, grid.y)
 * @param sample_input_p  sampler-bound reader for the p-texture (single-channel; .r used)
 * @param sample_input_I  sampler-bound reader for the I-texture (single-channel; .r used)
 * @param write_output_p_I_Ip_I_sq_mean_row  writer for the packed <p,I,Ip,II> row
 *
 * @IR entire function @0x0000000008b44d.
 */
export function soGuidedFilter_I1p1_Pass1(
  params: soGuidedFilter_I1p1_Pass1_Params,
  grid_in: [number, number],
  sample_input_p: Sample2D,
  sample_input_I: Sample2D,
  write_output_p_I_Ip_I_sq_mean_row: Write2D,
): void {
  // Truncate integer inputs to i32 semantics.
  const gx = grid_in[0] | 0;                        // @IR %12 = extractelement grid_in, 0
  const gy = grid_in[1] | 0;                        // (grid_in.y, used via shuffle %7)
  const rect0 = params.m_rect_in[0] | 0;            // @IR %9 lane 0 (x0)
  const rect1 = params.m_rect_in[1] | 0;            // @IR %14 = extractelement %9, 1  (y0)
  const rect2 = params.m_rect_in[2] | 0;            // @IR %35 = extractelement %9, 2  (x1)
  const rect3 = params.m_rect_in[3] | 0;            // @IR %13 = extractelement %9, 3  (y1)

  // %7 = shufflevector grid_in, undef, <1,0>  →  (grid.y, grid.x)
  // %10 = shufflevector rect,    undef, <0,1> →  (rect.x, rect.y)
  // %11 = %10 + %7 = (rect.x + grid.y, rect.y + grid.x)  — the write base pos.
  // @IR %7 %10 %11
  const posBaseX = (rect0 + gy) | 0;
  const posBaseY = (rect1 + gx) | 0;

  // Outer height guard: %15 = rect.w - rect.y ; %16 = icmp ult grid.x, %15.
  // UNSIGNED compare — mirror bit-for-bit via `>>> 0`.
  // @IR %13 %14 %15 %16
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gx >>> 0) >= height) return;                 // @IR br i1 %16 → %120 exit

  // Convert base pos to float. @IR %18 = air.convert.f.v2f32.u.v2i32(%11)
  // UNSIGNED int→float per air.convert.f.v2f32.u.v2i32 semantics — mask via `>>> 0`.
  const posBaseXf = Math.fround((posBaseX >>> 0));  // @IR %18 lane 0
  const posBaseYf = Math.fround((posBaseY >>> 0));  // @IR %18 lane 1

  // Load radius (signed i32) at offset 20, convert to float (signed).
  // @IR %20 = load i32 ; %21 = air.convert.f.f32.s.i32(%20)
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startPos = posBaseF - (radiusF, 0.0f).  @IR %22 = insertelement <undef,0>, radiusF, 0
  //                                          %23 = fsub posBaseF, %22
  // → (posBaseXf - radiusF, posBaseYf - 0.0f).
  // These are the "left-edge" coordinates going into both loops.
  const startPosX = Math.fround(posBaseXf - radiusF);   // @IR %23 lane 0
  const startPosY = Math.fround(posBaseYf - Math.fround(0));  // @IR %23 lane 1

  // diameter = (radius*2) | 1 → 2*radius + 1.  @IR %24 = shl radius,1 ; %25 = or %24,1
  const diameter = ((radius << 1) | 1) | 0;

  // %26 = icmp sgt diameter, 0 — SIGNED. If false, block %32 phis take zero.
  // @IR %26 br i1
  //
  // Block %32 (after init loop) phis:
  //   %33 accum  = zeroinitializer or %66 (loop-final accum)
  //   %34 cursor = %23 (startPos) or %69 (loop-final cursor)
  let accum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ]; // @IR %33 phi
  let cursorAfterInit: [number, number] = [startPosX, startPosY]; // @IR %34 phi

  if (diameter > 0) {
    // Block %27: load scale (align 16 offset 16), splat to <2 x float>.
    // @IR %29 = load float ; %30 = insertelement undef, scale, 0 ; %31 = splat <0,0>
    const scale = Math.fround(params.m_scaleDownsample);

    // Loop %44: for i in [0, diameter):
    //   uv = fmuladd(splat(scale), cursor, <0.5,0.5>)  @IR %48
    //   sp = sample_p(uv) ; sI = sample_I(uv)  @IR %49..%54
    //   accum.r += sp.r                              @IR %56
    //   accum.g += sI.r                              @IR %59
    //   accum.b += fmuladd(sI.r, sp.r, accum.b)      @IR %62
    //   accum.a += fmuladd(sI.r, sI.r, accum.a)      @IR %65
    //   cursor.x += 1.0f                             @IR %67 %68 %69
    //   i++ ; exit when i+1 == diameter              @IR %70 %71
    let cursorX = startPosX;               // @IR %45 lane 0
    let cursorY = startPosY;               // @IR %45 lane 1
    let a0 = Math.fround(0);               // @IR %46 lane 0 accum
    let a1 = Math.fround(0);               // @IR %46 lane 1 accum
    let a2 = Math.fround(0);               // @IR %46 lane 2 accum
    let a3 = Math.fround(0);               // @IR %46 lane 3 accum
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // uv = scale*cursor + 0.5, per lane.
      const uvX = Math.fround(Math.fround(scale * cursorX) + Math.fround(0.5));
      const uvY = Math.fround(Math.fround(scale * cursorY) + Math.fround(0.5));
      const sp = sample_input_p([uvX, uvY]);        // @IR %49 %50 %51
      const sI = sample_input_I([uvX, uvY]);        // @IR %52 %53 %54
      const spR = Math.fround(sp[0]);
      const sIR = Math.fround(sI[0]);
      // accum.r += p
      a0 = Math.fround(a0 + spR);
      // accum.g += I
      a1 = Math.fround(a1 + sIR);
      // accum.b += I*p  (via fmuladd(I, p, accum.b))  @IR %62 llvm.fmuladd.f32
      a2 = Math.fround(Math.fround(sIR * spR) + a2);
      // accum.a += I*I  (via fmuladd(I, I, accum.a))  @IR %65
      a3 = Math.fround(Math.fround(sIR * sIR) + a3);
      // cursor.x += 1.0f (cursor.y unchanged). @IR %67 %68 %69
      cursorX = Math.fround(cursorX + Math.fround(1));
    }
    accum = [a0, a1, a2, a3];
    cursorAfterInit = [cursorX, cursorY];
  }

  // Block %32: %35 = rect.z - rect.x (width) ; %38 = icmp sgt width, 0 (SIGNED).
  //            If false → return. Note SIGNED vs the UNSIGNED height guard above.
  // @IR %35 %36 %37 %38
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Block %39: reload scale (IR emits a second load), splat. @IR %41 %42 %43
  const scale = Math.fround(params.m_scaleDownsample);

  // Block %72 sliding-window loop init — five phis:
  //   %73 rightEdge cursor = cursorAfterInit (%34), then %111  — the "add" edge
  //   %74 leftEdge  cursor = startPos       (%23), then %114   — the "subtract" edge
  //   %75 writePos          = posBase       (%11), then %117
  //   %76 accum             = accum         (%33), then %108
  //
  // Loop body:
  //   write(writePos, accum)                                    @IR %77
  //   uvR = fmuladd(splat(scale), rightEdge, 0.5)              @IR %78
  //   spR = sample_p(uvR).r ; sIR = sample_I(uvR).r            @IR %79..%84
  //   accum.r += spR                                            @IR %86
  //   accum.g += sIR                                            @IR %88
  //   accum.b += fmuladd(sIR, spR, accum.b)                    @IR %90
  //   accum.a += fmuladd(sIR, sIR, accum.a)                    @IR %92
  //   uvL = fmuladd(splat(scale), leftEdge,  0.5)              @IR %93
  //   spL = sample_p(uvL).r ; sIL = sample_I(uvL).r            @IR %94..%99
  //   accum.r = (accum.r+spR) - spL                            @IR %100
  //   accum.g = (accum.g+sIR) - sIL                            @IR %102
  //   accum.b = fmuladd(-sIL, spL, accum.b_afterRight)         @IR %104 %105
  //   accum.a = fmuladd(-sIL, sIL, accum.a_afterRight)         @IR %107
  //   rightEdge.x += 1.0f ; leftEdge.x += 1.0f ; writePos.x += 1
  //   j++ ; exit when j+1 == width                             @IR %118 %119
  let rightX = cursorAfterInit[0];          // @IR %73 init (=%34)
  let rightY = cursorAfterInit[1];
  let leftX = startPosX;                    // @IR %74 init (=%23)
  let leftY = startPosY;
  let writeX = posBaseX | 0;                // @IR %75 init (=%11)
  let writeY = posBaseY | 0;
  let sA0 = accum[0];                       // @IR %76 lane 0
  let sA1 = accum[1];                       // @IR %76 lane 1
  let sA2 = accum[2];                       // @IR %76 lane 2
  let sA3 = accum[3];                       // @IR %76 lane 3

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Write CURRENT accumulator (before this step's slide). @IR %77 air.write_texture_2d
    write_output_p_I_Ip_I_sq_mean_row(
      [writeX, writeY],
      [Math.fround(sA0), Math.fround(sA1), Math.fround(sA2), Math.fround(sA3)],
    );

    // Sample the NEW right-edge column (ADD).  @IR %78..%84
    const uvRx = Math.fround(Math.fround(scale * rightX) + Math.fround(0.5));
    const uvRy = Math.fround(Math.fround(scale * rightY) + Math.fround(0.5));
    const spRV = sample_input_p([uvRx, uvRy]);  // @IR %79 %80 %81
    const sIRV = sample_input_I([uvRx, uvRy]);  // @IR %82 %83 %84
    const spR = Math.fround(spRV[0]);
    const sIR = Math.fround(sIRV[0]);
    // Intermediate "after-right" accumulator lanes (before the left-subtract).
    // @IR %86 fadd (r), %88 fadd (g), %90 fmuladd (b), %92 fmuladd (a)
    const r_afterRight = Math.fround(sA0 + spR);
    const g_afterRight = Math.fround(sA1 + sIR);
    const b_afterRight = Math.fround(Math.fround(sIR * spR) + sA2);
    const a_afterRight = Math.fround(Math.fround(sIR * sIR) + sA3);

    // Sample the OLD left-edge column (SUBTRACT).  @IR %93..%99
    const uvLx = Math.fround(Math.fround(scale * leftX) + Math.fround(0.5));
    const uvLy = Math.fround(Math.fround(scale * leftY) + Math.fround(0.5));
    const spLV = sample_input_p([uvLx, uvLy]);  // @IR %94 %95 %96
    const sILV = sample_input_I([uvLx, uvLy]);  // @IR %97 %98 %99
    const spL = Math.fround(spLV[0]);
    const sIL = Math.fround(sILV[0]);

    // accum.r = r_afterRight - spL           @IR %100 fsub
    sA0 = Math.fround(r_afterRight - spL);
    // accum.g = g_afterRight - sIL           @IR %102 fsub
    sA1 = Math.fround(g_afterRight - sIL);
    // accum.b = fmuladd(-sIL, spL, b_afterRight)  @IR %104 fneg ; %105 fmuladd
    const neg_sIL = Math.fround(-sIL);
    sA2 = Math.fround(Math.fround(neg_sIL * spL) + b_afterRight);
    // accum.a = fmuladd(-sIL, sIL, a_afterRight)  @IR %107 fmuladd(neg_sIL, sIL, a_afterRight)
    sA3 = Math.fround(Math.fround(neg_sIL * sIL) + a_afterRight);

    // Advance rightEdge.x++, leftEdge.x++, writePos.x++.
    // @IR %109..%111 rightEdge ; %112..%114 leftEdge ; %115..%117 writePos.
    rightX = Math.fround(rightX + Math.fround(1));
    leftX = Math.fround(leftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %118 = j+1 ; %119 = eq j+1, width → exit at block %120 (ret).
  }
}
