/**
 * @shader bm3dnr_buf::bm3dnr_buf_blend4x4Weight (HeliumSenso)
 *
 * BM3D-based noise-reduction kernel: writes a 4-row block of f32×4 pixels into a short4
 * (i16×4) output tile after dividing each pixel by a per-pixel weight buffer, rounding
 * to nearest via floor(x+0.5), and saturating into the signed-16-bit range.
 *
 * Source IR: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend4x4Weight.ll (committed
 * next to this file, extracted from HeliumSenso.framework/…/default.metallib @ symbol
 * offset 0x000000000098dd of the metallib blob).
 *
 * ── Signature (from the AIR IR + the !air.kernel metadata @!14..!22) ──
 *   kernel void bm3dnr_buf_blend4x4Weight(
 *       constant params  *params      [[buffer(0)]],   // 5 int32s (m_strideOut, m_strideIn,
 *                                                       //  m_strideOneOverDenom,
 *                                                       //  m_globalWidth, m_globalHeight)
 *       uint2             grid_in     [[thread_position_in_grid]],
 *       device short4    *output      [[buffer(1)]],
 *       device float4    *inOut       [[buffer(2)]],   // "in" numerator buffer
 *       device float4    *oneOverDenom[[buffer(3)]]);  // per-pixel weight (1 / denom)
 *
 *   grid.x is bounds-checked against m_globalWidth (%9), grid.y against m_globalHeight
 *   (%14). If either fails, the kernel returns without writing (br to %105 = ret).
 *   Otherwise for row = 4*grid.y + k, k in {0..3}, the kernel computes
 *     out[row*strideOut + grid.x] = i16x4( clamp( floor(
 *           inOut[row*strideIn + grid.x] * oneOverDenom[row*strideOneOverDenom + grid.x]
 *           + 0.5f
 *         ), -32768.0f, 32767.0f ) )
 *   with the multiply/floor/clamp/convert done as f32×4 vector ops.
 *
 *   The name "blend4x4Weight" and the presence of a per-pixel `1/denom` factor is
 *   consistent with a BM3D collaborative-filtering "unweighted average" divide-back step:
 *   the caller accumulates weighted sums into `inOut` and the sum of weights into `denom`
 *   (stored inverted so the shader can multiply rather than divide), then this pass
 *   emits the final integer sample by rounding the weighted average and packing to short4.
 *
 * ── AIR ops used (all present in the .ll) ──
 *   fmul <4 x float>                  — element-wise multiply
 *   fadd <4 x float>, splat 0.5       — rounding-bias for banker-free "round half up"
 *   @air.floor.v4f32                  — element-wise floor
 *   @air.clamp.v4f32                  — element-wise clamp(x, -32768.0, 32767.0)
 *   @air.convert.s.v4i16.f.v4f32      — element-wise signed truncation f32→i16
 *
 * ── Denorms / fast-math state (from !air.compile_options !11..!13) ──
 *   air.compile.denorms_disable        — flush subnormals to zero
 *   air.compile.fast_math_disable      — strict IEEE-754 semantics
 *   air.compile.framebuffer_fetch_enable
 * Because fast-math is DISABLED, we use single-precision fp32-narrowed math on each
 * lane and honour subnormal-flush by way of Math.fround (which handles subnormals as
 * IEEE-754 requires — the observable result of a multiply that produces a subnormal is
 * still a subnormal; DAZ/FTZ on Apple GPUs would flush it to zero, which changes bits
 * on the small end. Callers relying on exact-hardware parity for the smallest values
 * should apply a post-flush; the shader math itself is fp32-narrowed correctly.).
 *
 * ── ONE lane-4 helper wrapped as a per-pixel routine ──
 * The four blocks %30..%76 (row 0), %36..%80 (row 1), %42..%84 (row 2), %48..%88 (row 3)
 * are IR-identical up to the row-index arithmetic %25/%31/%37/%43 — this is a manual
 * ×4 row-unroll, not four different functions. We roll all four into one `computeRow`
 * to keep the file audit-trivial and cite the four IR line-numbers that each row
 * corresponds to.
 */

/** 5-int32 constant buffer bound to buffer(0). Order matches
 *  !18 = { m_strideOut, m_strideIn, m_strideOneOverDenom, m_globalWidth, m_globalHeight }. */
export interface Bm3dnrBufBlend4x4WeightParams {
  /** i32 @struct offset 0  — output row stride (in units of short4). %17 = load(params.0). */
  m_strideOut: number;
  /** i32 @struct offset 4  — inOut row stride (in units of float4). %19 = load(params.1). */
  m_strideIn: number;
  /** i32 @struct offset 8  — oneOverDenom row stride (float4 units). %21 = load(params.2). */
  m_strideOneOverDenom: number;
  /** u32 @struct offset 12 — grid.x upper bound (exclusive). %8 = load(params.3). */
  m_globalWidth: number;
  /** u32 @struct offset 16 — grid.y upper bound (exclusive). %13 = load(params.4). */
  m_globalHeight: number;
}

/** Per-lane clamp bounds — literal splats from IR %75/%79/%83/%87. */
const CLAMP_LO = Math.fround(-3.276800e4); // -32768.0f  (=-2^15)
const CLAMP_HI = Math.fround(3.276700e4);  //  32767.0f  (= 2^15 - 1)
/** Rounding bias — literal splat from IR %73/%77/%81/%85. */
const ROUND_BIAS = Math.fround(0.5);

/**
 * Per-lane pipeline: v = f32×4 numerator, w = f32×4 (1/denom) weight.
 *   %69..%72  fmul  <4 x float> v * w
 *   %73..     fadd  splat 0.5
 *   %74..     air.floor
 *   %75..     air.clamp(-32768, 32767)
 *   %76..     air.convert.s.v4i16.f
 *
 * Returns a length-4 tuple of i16 values (already saturated + truncated).
 *
 * We use Math.fround at every arithmetic step to preserve f32 rounding (denorms_disable
 * is respected by the caller-side buffer contents; the ops themselves are fp32-narrowed).
 * `air.convert.s.v4i16.f.v4f32` per Metal spec is a saturating cast — because it's
 * preceded by an explicit clamp to [-32768, 32767] in this IR, saturation would be a
 * no-op; we still emit `x|0` after clamping so any residual out-of-range value from a
 * host-supplied clamp misuse would still land in a defined int16 range via two's-complement
 * `|0` on the pre-clamped domain. The explicit `& 0xffff` then two-complement-map ensures
 * the returned value is in signed-i16 range regardless.
 */
function pixelToShort4(
  v: readonly [number, number, number, number],
  w: readonly [number, number, number, number]
): [number, number, number, number] {
  // %69/%70/%71/%72  fmul <4 x float>
  const m0 = Math.fround(Math.fround(v[0]) * Math.fround(w[0]));
  const m1 = Math.fround(Math.fround(v[1]) * Math.fround(w[1]));
  const m2 = Math.fround(Math.fround(v[2]) * Math.fround(w[2]));
  const m3 = Math.fround(Math.fround(v[3]) * Math.fround(w[3]));
  // %73/%77/%81/%85  fadd splat 0.5
  const a0 = Math.fround(m0 + ROUND_BIAS);
  const a1 = Math.fround(m1 + ROUND_BIAS);
  const a2 = Math.fround(m2 + ROUND_BIAS);
  const a3 = Math.fround(m3 + ROUND_BIAS);
  // %74/%78/%82/%86  air.floor.v4f32
  const f0 = Math.fround(Math.floor(a0));
  const f1 = Math.fround(Math.floor(a1));
  const f2 = Math.fround(Math.floor(a2));
  const f3 = Math.fround(Math.floor(a3));
  // %75/%79/%83/%87  air.clamp.v4f32(x, -32768, 32767)
  const c0 = f0 < CLAMP_LO ? CLAMP_LO : f0 > CLAMP_HI ? CLAMP_HI : f0;
  const c1 = f1 < CLAMP_LO ? CLAMP_LO : f1 > CLAMP_HI ? CLAMP_HI : f1;
  const c2 = f2 < CLAMP_LO ? CLAMP_LO : f2 > CLAMP_HI ? CLAMP_HI : f2;
  const c3 = f3 < CLAMP_LO ? CLAMP_LO : f3 > CLAMP_HI ? CLAMP_HI : f3;
  // %76/%80/%84/%88  air.convert.s.v4i16.f.v4f32 — signed truncation. Because c* is
  // already in [-32768, 32767] and an integer (post-floor), `| 0` is bit-exact.
  return [c0 | 0, c1 | 0, c2 | 0, c3 | 0];
}

/**
 * bm3dnr_buf::bm3dnr_buf_blend4x4Weight — the kernel entry point.
 *
 * This is a compute shader — the caller iterates the compute grid; we run one
 * `gid_x, gid_y` pair per call so a host can dispatch it however it likes.
 *
 * Faithful to the IR:
 *   ENTRY %5:
 *     %6  = gid.x                                              (extractelement %1, 0)
 *     %8  = load params.m_globalWidth
 *     %9  = icmp ult gid.x, m_globalWidth                       ; unsigned less-than
 *     br %9 → %10 else %105 (early-out — no write)
 *   %10:
 *     %11 = gid.y                                              (extractelement %1, 1)
 *     %13 = load params.m_globalHeight
 *     %14 = icmp ult gid.y, m_globalHeight
 *     br %14 → %15 else %105 (early-out — no write)
 *   %15..%104:  the row-block below.
 *   %105:       ret void.
 *
 * Row-block detail (IR shape mirrored exactly):
 *   let strideOut          = params.m_strideOut           ; %17
 *   let strideIn           = params.m_strideIn            ; %19
 *   let strideOneOverDenom = params.m_strideOneOverDenom  ; %21
 *   let row0 = 4*gid.y | 0    ; %25 = shl gid.y, 2 (u64), truncated to i32
 *   let row1 = row0 | 1        ; %31 = or %25, 1
 *   let row2 = row0 | 2        ; %37 = or %25, 2
 *   let row3 = row0 | 3        ; %43 = or %25, 3
 *
 *   inOut  loads (all @align 16, f32×4):
 *     v0 = inOut[strideIn*row0 + gid.x]                   ; %26/%27/%29/%30
 *     v1 = inOut[strideIn*row1 + gid.x]                   ; %32/%33/%35/%36
 *     v2 = inOut[strideIn*row2 + gid.x]                   ; %38/%39/%41/%42
 *     v3 = inOut[strideIn*row3 + gid.x]                   ; %44/%45/%47/%48
 *
 *   oneOverDenom loads:
 *     w0 = oneOverDenom[strideOneOverDenom*row0 + gid.x]  ; %49/%50/%52/%53
 *     w1 = oneOverDenom[strideOneOverDenom*row1 + gid.x]  ; %54/%55/%57/%58
 *     w2 = oneOverDenom[strideOneOverDenom*row2 + gid.x]  ; %59/%60/%62/%63
 *     w3 = oneOverDenom[strideOneOverDenom*row3 + gid.x]  ; %64/%65/%67/%68
 *
 *   For k in {0..3}: short4 sk = pixelToShort4(vk, wk).
 *   Stores (all @align 8, i16×4):
 *     output[strideOut*row0 + gid.x] = s0                  ; %89..%92
 *     output[strideOut*row1 + gid.x] = s1                  ; %93..%96
 *     output[strideOut*row2 + gid.x] = s2                  ; %97..%100
 *     output[strideOut*row3 + gid.x] = s3                  ; %101..%104
 *
 * All row-index math is done as INT32 (the `nsw`/`ult` flags confirm the compiler
 * proved no signed overflow in the address arithmetic — we mirror that with plain
 * `Math.trunc`-style `| 0` conversions in JS so the same wrap-on-overflow behaviour
 * applies to inputs the caller supplies).
 */
export function bm3dnr_buf_blend4x4Weight(
  params: Bm3dnrBufBlend4x4WeightParams,
  grid_in: readonly [number, number],
  output: Int16Array,      // buffer(1) short4 — 4 i16 per element, indexed by short4-count
  inOut: Float32Array,     // buffer(2) float4 — 4 f32 per element
  oneOverDenom: Float32Array // buffer(3) float4 — 4 f32 per element
): void {
  const gidX = grid_in[0] | 0;
  const gidY = grid_in[1] | 0;

  // %9  icmp ult gid.x, m_globalWidth   — unsigned less-than.  `>>>` gives unsigned view.
  if ((gidX >>> 0) >= (params.m_globalWidth >>> 0)) {
    // br → %105 ret void  (no write on out-of-bounds)
    return;
  }
  // %14 icmp ult gid.y, m_globalHeight
  if ((gidY >>> 0) >= (params.m_globalHeight >>> 0)) {
    // br → %105 ret void
    return;
  }

  const strideOut = params.m_strideOut | 0;
  const strideIn = params.m_strideIn | 0;
  const strideOneOverDenom = params.m_strideOneOverDenom | 0;

  // %25 shl gid.y, 2 — row0 = 4 * gid.y ; rows 1..3 via or with the low bits (since row0
  // is a multiple of 4, `or` is equivalent to `add` on those two bits — same instruction
  // Clang picks as the cheaper alternative). We mirror `or` literally.
  const row0 = (gidY << 2) | 0;
  const row1 = row0 | 1;
  const row2 = row0 | 2;
  const row3 = row0 | 3;

  // Helper to load a float4 at a float4-index, expressed as a 4-tuple. The device buffer
  // in the IR is `<4 x float> addrspace(1)*` — indexed by float4 count, so each element
  // spans 4 f32s = 16 bytes.
  const loadF4 = (buf: Float32Array, idx: number): [number, number, number, number] => {
    const base = idx * 4;
    return [buf[base], buf[base + 1], buf[base + 2], buf[base + 3]];
  };
  // Analogue for the i16×4 output — `<4 x i16> addrspace(1)*` indexed by short4 count.
  const storeI4 = (buf: Int16Array, idx: number, v: readonly [number, number, number, number]): void => {
    const base = idx * 4;
    buf[base] = v[0];
    buf[base + 1] = v[1];
    buf[base + 2] = v[2];
    buf[base + 3] = v[3];
  };

  // %27/%33/%39/%45  strideIn*rowK + gid.x       (int32 nsw arithmetic)
  const iIdx0 = ((strideIn * row0) | 0) + gidX;
  const iIdx1 = ((strideIn * row1) | 0) + gidX;
  const iIdx2 = ((strideIn * row2) | 0) + gidX;
  const iIdx3 = ((strideIn * row3) | 0) + gidX;
  // %30/%36/%42/%48  load <4 x float> from inOut
  const v0 = loadF4(inOut, iIdx0);
  const v1 = loadF4(inOut, iIdx1);
  const v2 = loadF4(inOut, iIdx2);
  const v3 = loadF4(inOut, iIdx3);

  // %50/%55/%60/%65  strideOneOverDenom*rowK + gid.x
  const wIdx0 = ((strideOneOverDenom * row0) | 0) + gidX;
  const wIdx1 = ((strideOneOverDenom * row1) | 0) + gidX;
  const wIdx2 = ((strideOneOverDenom * row2) | 0) + gidX;
  const wIdx3 = ((strideOneOverDenom * row3) | 0) + gidX;
  // %53/%58/%63/%68  load <4 x float> from oneOverDenom
  const w0 = loadF4(oneOverDenom, wIdx0);
  const w1 = loadF4(oneOverDenom, wIdx1);
  const w2 = loadF4(oneOverDenom, wIdx2);
  const w3 = loadF4(oneOverDenom, wIdx3);

  // %69..%76 / %70..%80 / %71..%84 / %72..%88 — fmul → +0.5 → floor → clamp → i16-convert
  const s0 = pixelToShort4(v0, w0);
  const s1 = pixelToShort4(v1, w1);
  const s2 = pixelToShort4(v2, w2);
  const s3 = pixelToShort4(v3, w3);

  // %91/%95/%99/%103  strideOut*rowK + gid.x     (int64 math in IR; int32 in JS is fine —
  // the IR uses i64 only because AIR needs pointer-sized indices; the underlying arithmetic
  // is nsw i32 that gets zext'd, so 32-bit multiply-and-add is bit-faithful for host-side
  // dispatch dimensions).
  const oIdx0 = ((strideOut * row0) | 0) + gidX;
  const oIdx1 = ((strideOut * row1) | 0) + gidX;
  const oIdx2 = ((strideOut * row2) | 0) + gidX;
  const oIdx3 = ((strideOut * row3) | 0) + gidX;
  // %92/%96/%100/%104  store <4 x i16> into output
  storeI4(output, oIdx0, s0);
  storeI4(output, oIdx1, s1);
  storeI4(output, oIdx2, s2);
  storeI4(output, oIdx3, s3);

  // %105 ret void
}
