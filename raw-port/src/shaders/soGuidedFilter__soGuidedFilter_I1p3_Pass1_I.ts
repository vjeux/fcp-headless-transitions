// @shader soGuidedFilter::soGuidedFilter_I1p3_Pass1_I (HeliumSenso)
// Source IR: raw-port/re/shaders/soGuidedFilter__soGuidedFilter_I1p3_Pass1_I.ll
// (extracted from HeliumSenso.framework/.../default.metallib @0x00000000093e4d)
/**
 * @shader soGuidedFilter::soGuidedFilter_I1p3_Pass1_I (HeliumSenso)
 *
 * Guided-filter Pass1 "I and I·I horizontal running-sum" kernel — the I-side
 * twin of soGuidedFilter_I1p3_Pass1_p_Ip (raw-port/src/shaders/
 * soGuidedFilter__soGuidedFilter_I1p3_Pass1_p_Ip.ts, @IR 0x0000000009523d).
 *
 * For each row `grid.x` (within the rect height) it walks a horizontal
 * (2*radius + 1) window over ONE guide texture `input_I` and produces two
 * scalar running sums packed into one RGBA float4 output texture
 * `output_I_I_sq_mean_row`:
 *   • lane 0 (.r) — running sum of  I.r         across the window
 *   • lane 1 (.g) — running sum of  I.r * I.r   across the window
 *   • lane 2 (.b) — 0.0f  (literal zero-inserter)
 *   • lane 3 (.a) — 0.0f  (literal zero-inserter)
 *
 * Structural mirror of Pass1_p_Ip: axis-swapped grid (%1 → %6 shuffled <1,0>),
 * same startCursor = (posBaseX - radius, posBaseY), same
 * `uv = scale * cursor + 0.5` via `llvm.fmuladd.v2f32`, same init loop that
 * accumulates over (2*radius + 1) samples along +x, same slide loop that
 * writes then adds the new right-edge + subtracts the old left-edge.
 * The math simplification vs. the sibling: instead of accumulating a
 * per-lane p-vector and an fmuladd'd Ip-vector, both accumulators are
 * SCALARS (I_sum and I_sq_sum), derived from lane 0 (.r) of the single
 * sampled RGBA.
 *
 * Signature from !air.kernel (!14..!22):
 *   kernel void soGuidedFilter_I1p3_Pass1_I(
 *       constant params  *params            [[buffer(0)]],
 *       uint2             grid_in           [[thread_position_in_grid]],
 *       sampler           sam               [[sampler(0)]],
 *       texture2d<float,sample> input_I               [[texture(0)]],
 *       texture2d<float,write>  output_I_I_sq_mean_row [[texture(1)]]);
 *
 * params struct (32 bytes, 16-byte aligned; from !18):
 *   +0   int4  m_rect_in           — (x0, y0, x1, y1)
 *   +16  float m_scaleDownsample   — uv scale multiplier (see @IR %28/%41)
 *   +20  int   m_radius            — half-window radius
 *   (+24: 8-byte tail padding — [8 x i8], unused by the kernel)
 *
 * Fast-math is DISABLED (!12 air.compile.fast_math_disable) — every fp32
 * op is fp32-narrowed via Math.fround. No shortcut math of any kind.
 */

/** params struct (32 bytes, 16-byte aligned). @IR !18 */
export interface soGuidedFilter_I1p3_Pass1_I_Params {
  /** int4 at +0: (x0, y0, x1, y1). @IR %8 */
  m_rect_in: [number, number, number, number];
  /** float at +16: uv scale multiplier. @IR %28 / %41 (offset 16 float, align 16) */
  m_scaleDownsample: number;
  /** int at +20: half-window radius. @IR %19 (offset 20 i32, align 4) */
  m_radius: number;
}

/** RGBA float4 sampler contract. Matches `air.sample_texture_2d.v4f32`. */
export type Sample2D = (uv: [number, number]) => [number, number, number, number];
/** RGBA float4 writer contract. Matches `air.write_texture_2d.v4f32`. */
export type Write2D = (pos: [number, number], rgba: [number, number, number, number]) => void;

/**
 * soGuidedFilter_I1p3_Pass1_I — one dispatched thread.
 *
 * @IR entire function @0x00000000093e4d.
 */
export function soGuidedFilter_I1p3_Pass1_I(
  params: soGuidedFilter_I1p3_Pass1_I_Params,
  grid_in: [number, number],
  sample_input_I: Sample2D,
  write_output_I_I_sq_mean_row: Write2D,
): void {
  // Truncate integer inputs to i32 semantics.
  const gx = grid_in[0] | 0;                        // @IR %11 = extractelement grid_in, 0
  const gy = grid_in[1] | 0;                        // (grid_in.y)
  const rect0 = params.m_rect_in[0] | 0;            // @IR %36 = extractelement rect, 0
  const rect1 = params.m_rect_in[1] | 0;            // @IR %13 = extractelement rect, 1
  const rect2 = params.m_rect_in[2] | 0;            // @IR %35 = extractelement rect, 2
  const rect3 = params.m_rect_in[3] | 0;            // @IR %12 = extractelement rect, 3

  // Compose the shuffled base pos: %9 = rect.xy, %6 = (grid.y, grid.x),
  // %10 = %9 + %6.  posBase = (rect.x + grid.y, rect.y + grid.x).
  //   @IR %6 %9 %10
  const posBaseX = (rect0 + gy) | 0;
  const posBaseY = (rect1 + gx) | 0;

  // Outer height guard: %14 = rect.w − rect.y ; %15 = icmp ult grid.x, %14 (UNSIGNED).
  //   @IR %12 %13 %14 %15
  const height = ((rect3 - rect1) | 0) >>> 0;
  if ((gx >>> 0) >= height) return;

  // Convert base pos to float (UNSIGNED — air.convert.f.v2f32.u.v2i32).
  //   @IR %17 = tail call air.convert.f.v2f32.u.v2i32(%10)
  const posBaseXf = Math.fround((posBaseX >>> 0));
  const posBaseYf = Math.fround((posBaseY >>> 0));

  // Load radius (signed i32) at offset 20, convert signed→float.
  //   @IR %19 = load i32 params.m_radius  (align 4, tbaa "int" at 20)
  //   @IR %20 = air.convert.f.f32.s.i32(%19)
  const radius = params.m_radius | 0;
  const radiusF = Math.fround(radius | 0);

  // startCursor = posBaseF − (radiusF, 0.0f).
  //   @IR %21 = insertelement <undef, 0.0>, radiusF, 0  →  (radiusF, 0.0)
  //   @IR %22 = fsub posF, %21                          →  (posXf − radiusF, posYf − 0)
  const startCursorX = Math.fround(posBaseXf - radiusF);
  const startCursorY = Math.fround(posBaseYf - Math.fround(0));

  // diameter = (radius << 1) | 1  →  2*radius + 1 (always odd).
  //   @IR %23 = shl radius, 1 ; %24 = or %23, 1
  //   @IR %25 = icmp sgt %24, 0 (SIGNED)
  const diameter = ((radius << 1) | 1) | 0;

  // Phi values entering block %31 (post init-loop):
  //   %32 = I_sq_sum   (zero if diameter<=0 else result of init loop; @IR %54)
  //   %33 = I_sum      (zero if diameter<=0 else @IR %53)
  //   %34 = cursor     (%22 startCursor if diameter<=0 else final %57)
  let I_sum = Math.fround(0);
  let I_sq_sum = Math.fround(0);
  let cursorAfterInitX = startCursorX;
  let cursorAfterInitY = startCursorY;

  if (diameter > 0) {
    // Block %26: load scale, splat to <2 x float>.
    //   @IR %28 = load float m_scaleDownsample (align 16, offset 16)
    //   @IR %29 %30 splat scale → <scale, scale>
    const scale = Math.fround(params.m_scaleDownsample);
    // Init loop %44: for i in [0, diameter),
    //   uv = fmuladd(splat(scale), cursor, <0.5, 0.5>)
    //   sample_input_I(uv) → rgba ; take .r ;
    //   I_sum   += .r
    //   I_sq_sum = fmuladd(.r, .r, I_sq_sum)
    //   cursor.x += 1.0f
    let curX = startCursorX;   // @IR %45 lane0
    let curY = startCursorY;   // @IR %45 lane1 (never changes here)
    let acc_I = Math.fround(0);    // @IR %46
    let acc_Isq = Math.fround(0);  // @IR %47
    for (let i = 0; i < diameter; i = (i + 1) | 0) {
      // uv = scale * cursor + 0.5 (per lane fmuladd).
      //   @IR %49 = llvm.fmuladd.v2f32(<scale,scale>, cursor, <0.5,0.5>)
      const uvX = Math.fround(Math.fround(scale * curX) + Math.fround(0.5));
      const uvY = Math.fround(Math.fround(scale * curY) + Math.fround(0.5));
      // Sample input_I at uv.
      //   @IR %50 = air.sample_texture_2d.v4f32(input_I, sam, uv, ...)
      //   @IR %51 = extractvalue %50, 0
      //   @IR %52 = extractelement %51, 0 (I.r)
      const s = sample_input_I([uvX, uvY]);
      const Ir = Math.fround(s[0]);
      // I_sum += Ir ;   I_sq_sum = fmuladd(Ir, Ir, I_sq_sum)
      //   @IR %53 = fadd float I_sum, %52
      //   @IR %54 = llvm.fmuladd.f32(%52, %52, I_sq_sum)
      acc_I = Math.fround(acc_I + Ir);
      acc_Isq = Math.fround(Math.fround(Ir * Ir) + acc_Isq);
      // cursor.x += 1.0f.
      //   @IR %55 = extractelement cursor, 0 ; %56 = fadd %55, 1.0 ; %57 = insertelement
      curX = Math.fround(curX + Math.fround(1));
      // %58 = i+1 ; %59 = icmp eq diameter → exit.
    }
    I_sum = acc_I;
    I_sq_sum = acc_Isq;
    cursorAfterInitX = curX;
    cursorAfterInitY = curY;
  }

  // Block %31: width guard %37 = rect.z − rect.x ; %38 = sgt %37, 0 (SIGNED).
  //   @IR %35 %36 %37 %38
  const width = (rect2 - rect0) | 0;
  if (width <= 0) return;

  // Block %39: reload scale (the IR does this a second time), splat to <2 x float>.
  //   @IR %41 = load float m_scaleDownsample (align 16)
  //   @IR %42 %43 splat
  const scale = Math.fround(params.m_scaleDownsample);

  // Block %60 sliding output loop. Phis:
  //   %61 rightEdgeCursor  init = cursorAfterInit  (@IR %34)
  //   %62 leftEdgeCursor   init = startCursor      (@IR %22)
  //   %63 writePos         init = (posBaseX, posBaseY) = %10
  //   %64 = I_sum   (init @IR %33)
  //   %65 = I_sq_sum(init @IR %32)
  let rightX = cursorAfterInitX;
  let rightY = cursorAfterInitY;
  let leftX = startCursorX;
  let leftY = startCursorY;
  let writeX = posBaseX | 0;
  let writeY = posBaseY | 0;
  let slide_I = I_sum;
  let slide_Isq = I_sq_sum;

  for (let j = 0; j < width; j = (j + 1) | 0) {
    // Write CURRENT accumulators (before this step advances the window):
    //   @IR %67 = insertelement <undef, undef, 0.0, 0.0>, I_sum,    0
    //   @IR %68 = insertelement %67,                       I_sq_sum, 1
    //   @IR air.write_texture_2d.v4f32(output_I_I_sq_mean_row, writePos, %68, 0, 2)
    // Lanes 2 and 3 are LITERAL zero from the base vector; lanes 0 and 1 are
    // the two scalar accumulators. The IR base vector's lanes 0 and 1 are
    // `undef` at the IR level, but they are IMMEDIATELY overwritten by the
    // two insertelement ops before the write — the write sees fully defined
    // values. We emit 0.0f for the unused lanes.
    write_output_I_I_sq_mean_row(
      [writeX, writeY],
      [Math.fround(slide_I), Math.fround(slide_Isq), Math.fround(0), Math.fround(0)],
    );

    // Sample the NEW right-edge column (adds one). uv = scale*rightEdge + 0.5.
    //   @IR %69 = llvm.fmuladd.v2f32(<scale,scale>, rightEdge, <0.5,0.5>)
    //   @IR %70 = air.sample_texture_2d.v4f32(input_I, sam, uv, ...)
    //   @IR %71 = extractvalue %70, 0
    //   @IR %72 = extractelement %71, 0 (I.r at rightEdge)
    const uvRx = Math.fround(Math.fround(scale * rightX) + Math.fround(0.5));
    const uvRy = Math.fround(Math.fround(scale * rightY) + Math.fround(0.5));
    const sR = sample_input_I([uvRx, uvRy]);
    const IrR = Math.fround(sR[0]);
    // I_sum   += IrR ;   I_sq_sum  = fmuladd(IrR, IrR, I_sq_sum)
    //   @IR %73 = fadd I_sum, %72
    //   @IR %74 = llvm.fmuladd.f32(%72, %72, I_sq_sum)
    const I_afterAdd = Math.fround(slide_I + IrR);
    const Isq_afterAdd = Math.fround(Math.fround(IrR * IrR) + slide_Isq);

    // Sample the OLD left-edge column (subtracts one). uv = scale*leftEdge + 0.5.
    //   @IR %75 = llvm.fmuladd.v2f32(<scale,scale>, leftEdge, <0.5,0.5>)
    //   @IR %76 = air.sample_texture_2d.v4f32(input_I, sam, uv, ...)
    //   @IR %77 = extractvalue %76, 0
    //   @IR %78 = extractelement %77, 0 (I.r at leftEdge)
    const uvLx = Math.fround(Math.fround(scale * leftX) + Math.fround(0.5));
    const uvLy = Math.fround(Math.fround(scale * leftY) + Math.fround(0.5));
    const sL = sample_input_I([uvLx, uvLy]);
    const IrL = Math.fround(sL[0]);
    // I_sum   = I_afterAdd − IrL.
    //   @IR %79 = fsub I_afterAdd, %78
    slide_I = Math.fround(I_afterAdd - IrL);
    // I_sq_sum = fmuladd(-IrL, IrL, Isq_afterAdd).
    //   @IR %80 = fsub -0.0, %78    (fneg)
    //   @IR %81 = llvm.fmuladd.f32(%80, %78, Isq_afterAdd)
    const negIrL = Math.fround(-IrL);
    slide_Isq = Math.fround(Math.fround(negIrL * IrL) + Isq_afterAdd);

    // Advance cursors: rightEdge.x++, leftEdge.x++, writePos.x++.
    //   @IR %82 %83 %84 rightEdge.x (fp32 +1.0f)
    //   @IR %85 %86 %87 leftEdge.x  (fp32 +1.0f)
    //   @IR %88 %89 %90 writePos.x  (i32 +1)
    rightX = Math.fround(rightX + Math.fround(1));
    leftX = Math.fround(leftX + Math.fround(1));
    writeX = (writeX + 1) | 0;
    // %91 = j+1 ; %92 = icmp eq width → exit.
  }
}
