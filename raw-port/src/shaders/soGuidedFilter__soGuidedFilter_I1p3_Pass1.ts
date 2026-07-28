// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass1 (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass1.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x0000000009289d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass1 (HeliumSenso)
 *
 * Guided-filter Pass1 for the (I=1-channel, p=3-channel) variant — the "I1p3" case.
 * For each row (grid.x) within the rect height, this kernel walks a horizontal
 * 2*radius+1 sliding window over two textures (input_p as RGB, input_I as gray)
 * and produces TWO 4-channel packed output rows:
 *
 *   output_p_I_mean_row       .rgb = running sum of p.rgb  .a = running sum of I.r
 *   output_Ip_I_sq_mean_row   .rgb = running sum of I*p.rgb .a = running sum of I*I
 *
 * That double-packed output is the difference from the I1p1 sibling — because p is
 * RGB we need 3 lanes for p-related sums, then repurpose the 4th lane of each
 * texture for the corresponding I-related quantity (I in the first output, I² in
 * the second). Everything else (sliding-window trick, height guard using unsigned
 * compare, width guard using signed compare) is byte-identical to the I1p1 shape.
 *
 * Signature from !air.kernel (!14..!24):
 *   kernel void soGuidedFilter_I1p3_Pass1(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_p                       [[texture(0)]],
 *       texture2d<float,sample> input_I                       [[texture(1)]],
 *       texture2d<float,write>  output_p_I_mean_row           [[texture(2)]],
 *       texture2d<float,write>  output_Ip_I_sq_mean_row       [[texture(3)]]);
 *
 * params struct (from !18 — 32 bytes, 16-byte aligned):
 *   +0   int4  m_rect_in            — (x0, y0, x1, y1)
 *   +16  float m_scaleDownsample    — uv scale factor (multiplies pixel coords)
 *   +20  int   m_radius             — half-window radius
 * NOTE: the LLVM struct type name is `soGuidedFilter::soGuidedFilter_I1p1_Pass1_params`,
 *       which is the I1p1 name — same 32-byte layout — but the !air.arg_type_name is
 *       `soGuidedFilter::soGuidedFilter_I1p3_Pass1_params`. metalfe deduplicated the
 *       type name in the IR while keeping the metadata's air.arg_type_name accurate.
 *       We use the I1p3-specific interface name below.
 *
 * Denorms / fast-math (from !11..!13):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_disable   — strict IEEE-754, so fp32-narrow every op via Math.fround.
 *
 * Axis convention (from IR %8 shufflevector <1,0>): grid.x indexes ROWS (image
 * height dimension), grid.y indexes COLUMNS (width dimension). Outer height guard
 * tests grid.x against `rect.w - rect.y` (image height); inner width guard tests
 * the loop count against `rect.z - rect.x` (image width). Height guard = `icmp ult`
 * (UNSIGNED); width guard = `icmp sgt` (SIGNED). Preserved literally.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p3_Pass1_Params {
  /** int4 at +0: (x0, y0, x1, y1). @IR %10 */
  m_rect_in: [number, number, number, number];
  /** float at +16: uv scale multiplier. @IR %30/%43 (offset 16, align 16) */
  m_scaleDownsample: number;
  /** int at +20: half-window radius. @IR %21 (offset 20 i32, align 4) */
  m_radius: number;
}

/**
 * Sampler function contract — one 2D sample returning an RGBA float4.
 * Called at every window step for both textures.
 * (`air.sample_texture_2d.v4f32` with LOD 0.0 — see IR call sites %52 %54 %80 %82 %94 %96.)
 */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Write function contract — one 2D write of an RGBA float4 at an int2 pixel.
 * (`air.write_texture_2d.v4f32` — the loop writes TWO textures at the same pos each step.)
 */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass1 — one dispatched thread.
 *
 * @param params   the constant-buffer params
 * @param grid_in  the [[thread_position_in_grid]] uint2 = (grid.x, grid.y)
 * @param sample_input_p  sampler-bound reader for the p-texture (RGB in .rgb)
 * @param sample_input_I  sampler-bound reader for the I-texture (gray in .r)
 * @param write_output_p_I_mean_row      writer for packed <sum_p.r, sum_p.g, sum_p.b, sum_I>
 * @param write_output_Ip_I_sq_mean_row  writer for packed <sum_Ip.r, sum_Ip.g, sum_Ip.b, sum_II>
 *
 * @IR entire function @0x0000000009289d.
 */
export function soGuidedFilter_I1p3_Pass1(
  params: soGuidedFilter_I1p3_Pass1_Params,
  grid_in: [number, number],
  sample_input_p: Sample2D,
  sample_input_I: Sample2D,
  write_output_p_I_mean_row: Write2D,
  write_output_Ip_I_sq_mean_row: Write2D,
): void {
  // Truncate integer inputs to i32 semantics.
  const gx = grid_in[0] | 0;                        // @IR %13 = extractelement grid_in, 0
  const gy = grid_in[1] | 0;                        // (grid_in.y, used via shuffle %8)
  const rect0 = params.m_rect_in[0] | 0;            // @IR %10 lane 0 (x0)
  const rect1 = params.m_rect_in[1] | 0;            // @IR %15 = extractelement %10, 1 (y0)
  const rect2 = params.m_rect_in[2] | 0;            // @IR %37 = extractelement %10, 2 (x1)
  const rect3 = params.m_rect_in[3] | 0;            // @IR %14 = extractelement %10, 3 (y1)

  // %8 = shufflevector grid_in, undef, <1,0>  →  (grid.y, grid.x)
  // %11 = shufflevector rect,    undef, <0,1> →  (rect.x, rect.y)
  // %12 = %11 + %8 = (rect.x + grid.y, rect.y + grid.x)  — write base pos.
  // @IR %8 %11 %12
  const posBaseX = (rect0 + gy) | 0;
  const posBaseY = (rect1 + gx) | 0;

  // Outer height guard: %16 = rect.w - rect.y ; %17 = icmp ult grid.x, %16.
  // UNSIGNED compare — mirror bit-for-bit via `>>> 0`.
  // @IR %14 %15 %16 %17
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gx >>> 0) >= height) return;                 // @IR br i1 %17 → %120 exit

  // Convert base pos to float. @IR %19 = air.convert.f.v2f32.u.v2i32(%12)
  // UNSIGNED int→float per air.convert.f.v2f32.u.v2i32 semantics.
  const posBaseXf = Math.fround((posBaseX >>> 0));  // @IR %19 lane 0
  const posBaseYf = Math.fround((posBaseY >>> 0));  // @IR %19 lane 1

  // Load radius (signed i32) at offset 20, convert to float (signed).
  // @IR %21 = load i32 ; %22 = air.convert.f.f32.s.i32(%21)
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startPos = posBaseF - (radiusF, 0.0f).  @IR %23 = insertelement <undef,0>, radiusF, 0
  //                                          %24 = fsub posBaseF, %23
  const startPosX = Math.fround(posBaseXf - radiusF);   // @IR %24 lane 0
  const startPosY = Math.fround(posBaseYf - Math.fround(0));  // @IR %24 lane 1

  // diameter = (radius*2) | 1 → 2*radius + 1.  @IR %25 = shl radius,1 ; %26 = or %25,1
  const diameter = ((radius << 1) | 1) | 0;

  // %27 = icmp sgt diameter, 0 — SIGNED. If false, block %33 phis take zero.
  //
  // Block %33 (after init loop) phis:
  //   %34 = pIAccum   (p.rgb + I in .a) : zeroinitializer or %66 (init-loop-final)
  //   %35 = IpIIAccum (Ip.rgb + I² in .a): zeroinitializer or %58 (init-loop-final)
  //   %36 = cursor    : %24 (startPos) or %69 (init-loop-final cursor)
  let pIAccum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ]; // @IR %34 phi
  let IpIIAccum: [number, number, number, number] = [
    Math.fround(0), Math.fround(0), Math.fround(0), Math.fround(0),
  ]; // @IR %35 phi
  let cursorAfterInit: [number, number] = [startPosX, startPosY]; // @IR %36 phi

  if (diameter > 0) {
    // Block %28: load scale (align 16 offset 16), splat to <2 x float>.
    // @IR %30 = load float ; %31 = insertelement undef, scale, 0 ; %32 = splat <0,0>
    const scale = Math.fround(params.m_scaleDownsample);

    // Loop %46: for i in [0, diameter):
    //   uv = fmuladd(splat(scale), cursor, <0.5,0.5>)      @IR %51
    //   sp = sample_p(uv) ; sI = sample_I(uv)              @IR %52..%56
    //   %57 = shufflevector sp, sI, <0,1,2,4>  = (sp.r, sp.g, sp.b, sI.r)
    //   IpIIAccum += (sp.r, sp.g, sp.b, sI.r)              @IR %58 fadd
    //   Note this update writes IpIIAccum position but the LANE meaning is p+I —
    //   ie the code confusingly names the SLOT %58 = "Ip_I_sq" but actually stores
    //   (sum_p.rgb, sum_I.r) into it. The COMMIT of that role happens at the phi
    //   swap: on the NEXT iteration, %48 phi (which will be the "p+I" accumulator)
    //   picks up %58, and %49 phi picks up %66. So the LOOP variables %48/%49 are
    //   NAMED after their INITIAL role but SWAP at each iter. The final read at
    //   %33 uses %58 → %35 (IpIIAccum) and %66 → %34 (pIAccum). Preserved literally.
    //   pIAccum.a += fmuladd(sI.r, sI.r, pIAccum.a) at %60 (scalar, lane 3 only)
    //   pIAccum.rgb += fmuladd(sp.rgb, splat(sI.r), pIAccum.rgb) at %64 (v3)
    //   %65 shuffle rebuilds v4 from v3 with lane 3 undef → %66 insert lane 3 = %60
    //   cursor.x += 1.0f                                    @IR %67 %68 %69
    //   i++ ; exit when i+1 == diameter                     @IR %70 %71
    //
    // To keep the code faithful without shuffling the phi swap, we track the
    // TWO named accumulators the same way as at loop-exit: `pIAccum_iter`
    // maps to phi %49→%66 and `IpIIAccum_iter` maps to phi %48→%58.
    // Loop-entry values (block %28 → %46):
    //   %47 cursor  = %24  (startPos)
    //   %48 accum_A = zero (becomes %58 = "sp.rgb + sI.r" for the sliding phase; this is the p+I accumulator)
    //   %49 accum_B = zero (becomes %66 = "sp*sI + prev" i.e. the Ip+I² accumulator)
    // But %33 wires: %34 (pIAccum) ← %66 (accum_B) ; %35 (IpIIAccum) ← %58 (accum_A).
    // → So loop-var A = IpIIAccum in the final naming, loop-var B = pIAccum. We
    //   preserve that literal wiring below.
    let cursorX = startPosX;               // @IR %47 lane 0
    let cursorY = startPosY;               // @IR %47 lane 1
    let accumA0 = Math.fround(0);          // @IR %48 lane 0 (loop-var A → final %35 IpIIAccum)
    let accumA1 = Math.fround(0);          // @IR %48 lane 1
    let accumA2 = Math.fround(0);          // @IR %48 lane 2
    let accumA3 = Math.fround(0);          // @IR %48 lane 3
    let accumB0 = Math.fround(0);          // @IR %49 lane 0 (loop-var B → final %34 pIAccum)
    let accumB1 = Math.fround(0);          // @IR %49 lane 1
    let accumB2 = Math.fround(0);          // @IR %49 lane 2
    let accumB3 = Math.fround(0);          // @IR %49 lane 3
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // uv = scale*cursor + 0.5, per lane. @IR %51 fmuladd v2
      const uvX = Math.fround(Math.fround(scale * cursorX) + Math.fround(0.5));
      const uvY = Math.fround(Math.fround(scale * cursorY) + Math.fround(0.5));
      const sp = sample_input_p([uvX, uvY]);        // @IR %52 %53
      const sI = sample_input_I([uvX, uvY]);        // @IR %54 %55
      const spR = Math.fround(sp[0]);
      const spG = Math.fround(sp[1]);
      const spB = Math.fround(sp[2]);
      const sIR = Math.fround(sI[0]);
      // %57 = shufflevector sp, sI, <0,1,2,4> = (sp.r, sp.g, sp.b, sI.r)
      // %58 = fadd <4 x float> accumA, %57  → this is the "p.rgb + I" accumulator
      accumA0 = Math.fround(accumA0 + spR);
      accumA1 = Math.fround(accumA1 + spG);
      accumA2 = Math.fround(accumA2 + spB);
      accumA3 = Math.fround(accumA3 + sIR);
      // %59 = extractelement accumB, 3     (lane-3 = I² accumulator)
      // %60 = llvm.fmuladd.f32(sI.r, sI.r, accumB.a)
      const newB3 = Math.fround(Math.fround(sIR * sIR) + accumB3);
      // %61 = shufflevector sp,     undef, <0,1,2>       (sp.rgb)
      // %62 = shufflevector sI,     undef, <0,0,0>       (splat(sI.r) as v3)
      // %63 = shufflevector accumB, undef, <0,1,2>       (accumB.rgb)
      // %64 = llvm.fmuladd.v3f32(sp.rgb, splat(sI.r), accumB.rgb)
      const newB0 = Math.fround(Math.fround(spR * sIR) + accumB0);
      const newB1 = Math.fround(Math.fround(spG * sIR) + accumB1);
      const newB2 = Math.fround(Math.fround(spB * sIR) + accumB2);
      // %65 = shufflevector %64, undef, <0,1,2,undef>
      // %66 = insertelement %65, %60, 3   → full v4 (Ip.rgb, I²)
      accumB0 = newB0;
      accumB1 = newB1;
      accumB2 = newB2;
      accumB3 = newB3;
      // cursor.x += 1.0f (cursor.y unchanged).  @IR %67 %68 %69
      cursorX = Math.fround(cursorX + Math.fround(1));
    }
    // Publish loop results per the phi wiring at block %33.
    // %35 IpIIAccum ← %58 (accumA)   ← DOUBLE-CHECK: %35 in block %33 uses %58,
    //   BUT the output write map is %35 → output %5 (p_I_mean_row) and %34 → %6
    //   (Ip_I_sq_mean_row). And %58 = (sum_p.rgb, sum_I.r), which IS p_I_mean.
    //   And %66 = (sum_Ip.rgb, sum_II), which IS Ip_I_sq_mean. So the OUTPUT
    //   NAMES ARE:
    //     pIAccum   (= %35 = accumA = (sum_p.rgb, sum_I))     → output_p_I_mean_row
    //     IpIIAccum (= %34 = accumB = (sum_Ip.rgb, sum_II))   → output_Ip_I_sq_mean_row
    //   (I inverted my in-loop variable naming above. Below we alias them
    //   correctly so the sliding-loop names match the OUTPUT they feed.)
    pIAccum = [accumA0, accumA1, accumA2, accumA3];
    IpIIAccum = [accumB0, accumB1, accumB2, accumB3];
    cursorAfterInit = [cursorX, cursorY];
  }

  // Block %33: %39 = rect.z - rect.x (width) ; %40 = icmp sgt width, 0 (SIGNED).
  //            If false → return.
  // @IR %37 %38 %39 %40
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Block %41: reload scale (IR emits a second load), splat. @IR %43 %44 %45
  const scale = Math.fround(params.m_scaleDownsample);

  // Block %72 sliding-window loop init — six phis:
  //   %73 rightEdge cursor = cursorAfterInit (%36), then %111 — the "add" edge
  //   %74 leftEdge  cursor = startPos       (%24), then %114 — the "subtract" edge
  //   %75 writePos          = posBase       (%12), then %117
  //   %76 pIAccum   (p+I)    from %35, then %100
  //   %77 IpIIAccum (Ip+I²)  from %34, then %108
  //
  // Loop body:
  //   write(writePos, pIAccum)                                        @IR %77 write output_5
  //   write(writePos, IpIIAccum)                                      @IR write output_6
  //   uvR = fmuladd(splat(scale), rightEdge, 0.5)                    @IR %79
  //   spR = sample_p(uvR) ; sIR = sample_I(uvR)                      @IR %80..%84
  //   pIAccum       += (spR.r, spR.g, spR.b, sIR.r)                  @IR %85 shuffle %86 fadd
  //   IpIIAccum.a   += sIR.r * sIR.r                                  @IR %88 fmuladd scalar
  //   IpIIAccum.rgb += spR.rgb * splat(sIR.r)                        @IR %89..%92 fmuladd v3
  //   uvL = fmuladd(splat(scale), leftEdge, 0.5)                     @IR %93
  //   spL = sample_p(uvL) ; sIL = sample_I(uvL)                      @IR %94..%98
  //   pIAccum       -= (spL.r, spL.g, spL.b, sIL.r)                  @IR %99 shuffle %100 fsub
  //   IpIIAccum.a   += (-sIL.r) * sIL.r                              @IR %101 fneg %102 fmuladd
  //   IpIIAccum.rgb += (-spL.rgb) * splat(sIL.r)                     @IR %103..%106
  //   %107 shuffle rebuilds v4 from v3 lane 0..2, undef in lane 3
  //   %108 insertelement lane 3 = %102
  //   rightEdge.x += 1.0f ; leftEdge.x += 1.0f ; writePos.x += 1
  //   j++ ; exit when j+1 == width                                    @IR %118 %119
  let rightX = cursorAfterInit[0];          // @IR %73 init (=%36)
  let rightY = cursorAfterInit[1];
  let leftX = startPosX;                    // @IR %74 init (=%24)
  let leftY = startPosY;
  let writeX = posBaseX | 0;                // @IR %75 init (=%12)
  let writeY = posBaseY | 0;
  let pI0 = pIAccum[0];                     // @IR %76 lane 0
  let pI1 = pIAccum[1];                     // @IR %76 lane 1
  let pI2 = pIAccum[2];                     // @IR %76 lane 2
  let pI3 = pIAccum[3];                     // @IR %76 lane 3
  let IpII0 = IpIIAccum[0];                 // @IR %77 lane 0
  let IpII1 = IpIIAccum[1];                 // @IR %77 lane 1
  let IpII2 = IpIIAccum[2];                 // @IR %77 lane 2
  let IpII3 = IpIIAccum[3];                 // @IR %77 lane 3

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Write CURRENT accumulators (before this step's slide).
    // @IR air.write_texture_2d output_5 (p_I_mean_row) with %76
    // @IR air.write_texture_2d output_6 (Ip_I_sq_mean_row) with %77
    write_output_p_I_mean_row(
      [writeX, writeY],
      [Math.fround(pI0), Math.fround(pI1), Math.fround(pI2), Math.fround(pI3)],
    );
    write_output_Ip_I_sq_mean_row(
      [writeX, writeY],
      [Math.fround(IpII0), Math.fround(IpII1), Math.fround(IpII2), Math.fround(IpII3)],
    );

    // Sample the NEW right-edge column (ADD).  @IR %79..%84
    const uvRx = Math.fround(Math.fround(scale * rightX) + Math.fround(0.5));
    const uvRy = Math.fround(Math.fround(scale * rightY) + Math.fround(0.5));
    const spRV = sample_input_p([uvRx, uvRy]);  // @IR %80 %81
    const sIRV = sample_input_I([uvRx, uvRy]);  // @IR %82 %83
    const spR_r = Math.fround(spRV[0]);
    const spR_g = Math.fround(spRV[1]);
    const spR_b = Math.fround(spRV[2]);
    const sIR_r = Math.fround(sIRV[0]);

    // pIAccum += (spR.r, spR.g, spR.b, sIR.r).  @IR %85 shuffle <0,1,2,4> ; %86 fadd v4
    const pI0_afterRight = Math.fround(pI0 + spR_r);
    const pI1_afterRight = Math.fround(pI1 + spR_g);
    const pI2_afterRight = Math.fround(pI2 + spR_b);
    const pI3_afterRight = Math.fround(pI3 + sIR_r);
    // IpII.a += fmuladd(sIR.r, sIR.r, IpII.a).  @IR %88 fmuladd f32
    const IpII3_afterRight = Math.fround(Math.fround(sIR_r * sIR_r) + IpII3);
    // IpII.rgb += fmuladd(spR.rgb, splat(sIR.r), IpII.rgb).  @IR %92 fmuladd v3
    const IpII0_afterRight = Math.fround(Math.fround(spR_r * sIR_r) + IpII0);
    const IpII1_afterRight = Math.fround(Math.fround(spR_g * sIR_r) + IpII1);
    const IpII2_afterRight = Math.fround(Math.fround(spR_b * sIR_r) + IpII2);

    // Sample the OLD left-edge column (SUBTRACT).  @IR %93..%98
    const uvLx = Math.fround(Math.fround(scale * leftX) + Math.fround(0.5));
    const uvLy = Math.fround(Math.fround(scale * leftY) + Math.fround(0.5));
    const spLV = sample_input_p([uvLx, uvLy]);  // @IR %94 %95
    const sILV = sample_input_I([uvLx, uvLy]);  // @IR %96 %97
    const spL_r = Math.fround(spLV[0]);
    const spL_g = Math.fround(spLV[1]);
    const spL_b = Math.fround(spLV[2]);
    const sIL_r = Math.fround(sILV[0]);

    // pIAccum = pI_afterRight - (spL.r, spL.g, spL.b, sIL.r).  @IR %99 shuffle ; %100 fsub v4
    pI0 = Math.fround(pI0_afterRight - spL_r);
    pI1 = Math.fround(pI1_afterRight - spL_g);
    pI2 = Math.fround(pI2_afterRight - spL_b);
    pI3 = Math.fround(pI3_afterRight - sIL_r);

    // IpII.a = fmuladd(-sIL.r, sIL.r, IpII.a_afterRight).  @IR %101 fneg ; %102 fmuladd f32
    const neg_sIL_r = Math.fround(-sIL_r);
    IpII3 = Math.fround(Math.fround(neg_sIL_r * sIL_r) + IpII3_afterRight);
    // IpII.rgb = fmuladd(-spL.rgb, splat(sIL.r), IpII.rgb_afterRight).
    //   @IR %103 shuffle spL <0,1,2>
    //   @IR %104 shuffle sIL <0,0,0>  (splat)
    //   @IR %105 fsub <-0,-0,-0>, spL.rgb  (fneg v3)
    //   @IR %106 fmuladd.v3f32(-spL.rgb, splat(sIL.r), IpII.rgb_afterRight)
    //   @IR %107 shuffle to v4 (lane 3 undef) ; %108 insertelement lane 3 = %102
    IpII0 = Math.fround(Math.fround(Math.fround(-spL_r) * sIL_r) + IpII0_afterRight);
    IpII1 = Math.fround(Math.fround(Math.fround(-spL_g) * sIL_r) + IpII1_afterRight);
    IpII2 = Math.fround(Math.fround(Math.fround(-spL_b) * sIL_r) + IpII2_afterRight);

    // Advance rightEdge.x++, leftEdge.x++, writePos.x++.
    // @IR %109..%111 rightEdge ; %112..%114 leftEdge ; %115..%117 writePos.
    rightX = Math.fround(rightX + Math.fround(1));
    leftX = Math.fround(leftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %118 = j+1 ; %119 = eq j+1, width → exit at block %120 (ret).
  }
}
