/**
 * @shader bm3dnr_buf::bm3dnr_buf_blend4x4Column (HeliumSenso)
 *
 * BM3D-based noise-reduction "column" accumulator: reads an 8-vector (8× float4)
 * window of 3D-transformed patch data and splats it back into a 1D scalar buffer
 * as 25 individual float writes, weighted per-source-row by a static 4×4 weight
 * matrix, with pairwise adds bridging the seam between consecutive f32×4 loads
 * (a manual inclusive-scan over the horizontal seams of a 4×4-block-of-blocks).
 *
 * Source IR: raw-port/re/shaders/bm3dnr_buf::bm3dnr_buf_blend4x4Column.ll (committed
 * next to this file, extracted from HeliumSenso.framework/…/default.metallib @ symbol
 * offset 0x000000000000678d of the metallib blob).
 *
 * ── Signature (from the AIR IR + the !air.kernel metadata @!14..!21) ──
 *   kernel void bm3dnr_buf_blend4x4Column(
 *       constant params  *params      [[buffer(0)]],   // 6 int32s
 *       uint2             grid_in     [[thread_position_in_grid]],
 *       device float     *inOut       [[buffer(1)]],   // scalar accumulator strip
 *       device float4    *input       [[buffer(2)]]);  // 8-vector windowed source
 *
 *   The 6-int params (from !18):
 *     +0   int    m_strideInOut      — inOut row stride (in scalar floats)
 *     +4   int    m_strideIn         — input row stride (in float4)
 *     +8   int    m_stepInc          — inOut y-block stride multiplier (×8)
 *     +12  int    m_offsetX          — x offset added to grid.x (for tiling)
 *     +16  u32    m_globalWidth      — grid.x upper bound
 *     +20  u32    m_globalHeight     — grid.y upper bound
 *
 * ── STATIC WEIGHT TABLE @_ZN10bm3dnr_bufL9weight4x4E ──
 *   An internal-linkage `constant [4 x <4 x float>]`. The four rows spell a
 *   symmetric separable weight kernel (a 4×4 tent/quintic-ish window). The IR
 *   stores each element as a fp64 hex literal that AIR narrows to fp32 at the
 *   load — we decode the double, then Math.fround so the observable value is
 *   the fp32-narrowed bit-exact float:
 *
 *     row 0: { 0x3F5F212D80000000, 0x3F9FBE76C0000000, 0x3F9FBE76C0000000, 0x3F5F212D80000000 }
 *              → fp32-narrowed { 0.0019000000320374966, 0.031, 0.031, 0.0019000000320374966 }
 *     row 1: { 0x3F9FBE76C0000000, 0x3FDFF62B60000000, 0x3FDFF62B60000000, 0x3F9FBE76C0000000 }
 *              → fp32-narrowed { 0.031, 0.49939998984336853, 0.49939998984336853, 0.031 }
 *     row 2: identical to row 1
 *     row 3: identical to row 0
 *
 *   (Precise fp32 bit patterns via Math.fround are what we bind below; the
 *   `0x3F5F212D80000000` double bit pattern narrows to the fp32
 *   `0.0019000000320374966` — call it "the 0.0019 sample of a symmetric kernel".)
 *
 *   Selection index: `%29 = and i32 %10, 3` — the row selected each dispatch is
 *   `grid.y mod 4`. That is, the four rows of the constant table are a 4-row
 *   cyclic dispatch pattern indexed by the low two bits of `grid.y`.
 *
 * ── Denorms / fast-math state (from !air.compile_options !11..!13) ──
 *   air.compile.denorms_disable       — flush subnormals to zero
 *   air.compile.fast_math_disable     — strict IEEE-754 semantics
 *   air.compile.framebuffer_fetch_enable
 *   Fast-math is DISABLED, so we do fp32-narrowed math via Math.fround on every
 *   arithmetic op. Denorm-flush affects the smallest values only; Math.fround
 *   is IEEE-754-compliant (subnormal-preserving) — a downstream host that needs
 *   bit-exact GPU denorm-flush can add a post-flush wrapper.
 *
 * ── Semantic shape ──
 *   The kernel dispatches one thread per (gid.x, gid.y). It early-outs if either
 *   grid coord exceeds m_globalWidth / m_globalHeight. Otherwise:
 *     • row = grid.y % 4                             // weight-row selector
 *     • w   = weight4x4[row]                          // float4 weight
 *     • load 8 consecutive float4s at
 *          input[strideIn*grid.y + 8*(m_offsetX+grid.x) + j]  for j in 0..7
 *     • multiply each by `w` component-wise → v0..v7  (each a float4)
 *     • bridge the SEAMS between consecutive vN by adding `vN.lane3 + v(N+1).lane0`
 *       into a scalar 'seam sum' for N in 0..6 (7 seam sums total)
 *     • also lift `v0.lane0` (unchanged), and use v0.lane3-with-seam0 as v0.lane3
 *     • write 25 scalar floats out to
 *          inOut[8*(m_offsetX+grid.x)*m_stepInc + m_strideInOut*grid.y + k]
 *          for k in 0..24
 *   The 25 writes pattern (indices at offsets 0..24 from `base = strideInOut*gid.y +
 *   8*m_stepInc*(m_offsetX+grid.x)`):
 *
 *     offset  source                        IR line
 *     ------  ----------------------------  --------
 *       0     v0.lane0 + inOut[base] (RMW)  %96 %97 %33 store
 *       1     v0.lane1                      %98 %100
 *       2     v0.lane2                      %101 %103
 *       3     v0.lane3 + seam0              %104 %106  (v0.3 + v1.0)
 *       4     v1.lane1                      %107 %109
 *       5     v1.lane2                      %110 %112
 *       6     seam1                         %114        (v1.3 + v2.0)
 *       7     v2.lane1                      %115 %117
 *       8     v2.lane2                      %118 %120
 *       9     seam2                         %122        (v2.3 + v3.0)
 *      10     v3.lane1                      %123 %125
 *      11     v3.lane2                      %126 %128
 *      12     seam3                         %130        (v3.3 + v4.0)
 *      13     v4.lane1                      %131 %133
 *      14     v4.lane2                      %134 %136
 *      15     seam4                         %138        (v4.3 + v5.0)
 *      16     v5.lane1                      %139 %141
 *      17     v5.lane2                      %142 %144
 *      18     seam5                         %146        (v5.3 + v6.0)
 *      19     v6.lane1                      %147 %149
 *      20     v6.lane2                      %150 %152
 *      21     seam6                         %154        (v6.3 + v7.0)
 *      22     v7.lane1                      %155 %157
 *      23     v7.lane2                      %158 %160
 *      24     v7.lane3                      %161 %163
 *
 *   Note offset 0's write source is `v0.lane0 + previous inOut[base]` — this is
 *   an RMW because the kernel does not zero the destination first. The rest are
 *   plain stores (accumulator is only touched at offset 0). Concretely:
 *     store(base+0) = v0.lane0 + (inOut[base])                   (%97 = %96.0 = v0.0 + prev)
 *     store(base+1..24) = as listed above.
 *
 *   The 26-element visual pattern (indexed 0..24) with 7 seams therefore lays out
 *   as [v0.0..3 | v1.1..3 | v2.1..3 | ... | v7.1..3] BUT with each `.3`+`.0` at
 *   the seam substituted by their sum. This is a horizontal inclusive-scan-style
 *   splat where the lane-3-of-block-N and lane-0-of-block-(N+1) are collapsed
 *   into one output slot — a direct TS mapping of the AIR extractelement /
 *   fadd float / insertelement chain at %74..%95.
 */

/** 6-int32 constant buffer bound to buffer(0). Order matches !18. */
export interface Bm3dnrBufBlend4x4ColumnParams {
  /** i32 @struct offset 0  — inOut row stride, in scalar floats. %16 = load(params.0). */
  m_strideInOut: number;
  /** i32 @struct offset 4  — input row stride, in float4 vectors. %18 = load(params.1). */
  m_strideIn: number;
  /** i32 @struct offset 8  — inOut column-block stride multiplier. %20 = load(params.2).
   *  Applied as `strideInOut-offset = 8 * m_stepInc * (m_offsetX + grid.x)` — the ×8 comes
   *  from `%27 = shl nsw i64 %26, 3` in the IR (8 = one 8-float4 vector-window worth of
   *  scalar floats per input column). */
  m_stepInc: number;
  /** i32 @struct offset 12 — X offset applied to grid.x. %22 = load(params.3). */
  m_offsetX: number;
  /** u32 @struct offset 16 — grid.x upper bound (exclusive). %7 = load(params.4). */
  m_globalWidth: number;
  /** u32 @struct offset 20 — grid.y upper bound (exclusive). %12 = load(params.5). */
  m_globalHeight: number;
}

// ── STATIC weight table (fp32-narrowed decode of the fp64 hex literals in IR) ──
// Row 0 and row 3 are identical (mirror pattern), row 1 and row 2 identical.
// See the "STATIC WEIGHT TABLE" section in the file banner for the source hex
// double literals; Math.fround wraps each to bind the exact fp32 value AIR sees.
const WEIGHT_A = Math.fround(0.0019000000320374966); // 0x3F5F212D80000000 → fp32
const WEIGHT_B = Math.fround(0.031);                 // 0x3F9FBE76C0000000 → fp32
const WEIGHT_C = Math.fround(0.49939998984336853);   // 0x3FDFF62B60000000 → fp32
const WEIGHT_4x4: readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number]
] = [
  [WEIGHT_A, WEIGHT_B, WEIGHT_B, WEIGHT_A], // row 0 — @IR const-array element 0
  [WEIGHT_B, WEIGHT_C, WEIGHT_C, WEIGHT_B], // row 1 — @IR const-array element 1
  [WEIGHT_B, WEIGHT_C, WEIGHT_C, WEIGHT_B], // row 2 — @IR const-array element 2
  [WEIGHT_A, WEIGHT_B, WEIGHT_B, WEIGHT_A], // row 3 — @IR const-array element 3
];

/**
 * bm3dnr_buf::bm3dnr_buf_blend4x4Column — the kernel entry point.
 *
 * Faithful transcription of the IR at raw-port/re/shaders/
 * bm3dnr_buf::bm3dnr_buf_blend4x4Column.ll. Each numbered comment points at the
 * corresponding IR `%N` line.
 */
export function bm3dnr_buf_blend4x4Column(
  params: Bm3dnrBufBlend4x4ColumnParams,
  grid_in: readonly [number, number],
  inOut: Float32Array,   // buffer(1) float — scalar accumulator, indexed per-float
  input: Float32Array    // buffer(2) float4 — 4 f32 per element, indexed by float4-count
): void {
  // %5  gid.x = extractelement <2 x i32> %1, 0
  const gidX = grid_in[0] | 0;
  // %7  load params.m_globalWidth
  // %8  icmp ult gid.x, m_globalWidth — unsigned less-than
  if ((gidX >>> 0) >= (params.m_globalWidth >>> 0)) {
    // br %8 false → %164 ret void
    return;
  }
  // %10 gid.y = extractelement <2 x i32> %1, 1
  const gidY = grid_in[1] | 0;
  // %12 load params.m_globalHeight
  // %13 icmp ult gid.y, m_globalHeight
  if ((gidY >>> 0) >= (params.m_globalHeight >>> 0)) {
    // br %13 false → %164 ret void
    return;
  }

  // %16 load params.m_strideInOut
  const strideInOut = params.m_strideInOut | 0;
  // %18 load params.m_strideIn
  const strideIn = params.m_strideIn | 0;
  // %20 load params.m_stepInc
  const stepInc = params.m_stepInc | 0;
  // %22 load params.m_offsetX
  const offsetX = params.m_offsetX | 0;
  // %23 add i32 m_offsetX, gid.x  (nsw)
  const xIndex = (offsetX + gidX) | 0;

  // %27 shl nsw i64 (i64)m_stepInc, 3   — the ×8 factor for the inOut column base.
  //     ((int64)m_stepInc) << 3 = m_stepInc * 8.
  // %28 mul i64 (m_stepInc<<3), zext(xIndex)     — inOut column base offset (scalar floats)
  const inOutColBase = ((stepInc << 3) | 0) * (xIndex >>> 0);
  // %30 sext i32 strideInOut, i64
  // %31 mul nsw i64 strideInOut, zext(gid.y)
  const inOutRowBase = (strideInOut | 0) * (gidY >>> 0);
  // %32 add i64 inOutColBase, inOutRowBase — base offset in scalar-float space
  const baseOut = inOutColBase + inOutRowBase;

  // %29 and i32 gid.y, 3  — select weight-table row
  const wRow = gidY & 3;
  // %38 load <4 x float> from constant weight table at wRow
  const w = WEIGHT_4x4[wRow];
  const w0 = Math.fround(w[0]);
  const w1 = Math.fround(w[1]);
  const w2 = Math.fround(w[2]);
  const w3 = Math.fround(w[3]);

  // %39 sext i32 strideIn, i64
  // %40 mul nsw i64 strideIn, zext(gid.y)
  const inRowBase = (strideIn | 0) * (gidY >>> 0);
  // %41 shl nuw nsw i64 zext(xIndex), 3  — 8× xIndex, the float4-index base for `input`
  const inColBase = (xIndex >>> 0) * 8;
  // %42 add i64 inColBase, inRowBase — base index in float4 units into `input`
  const inBaseF4 = inColBase + inRowBase;

  // Load 8 consecutive float4s from `input` starting at inBaseF4 and multiply each
  // component-wise by the weight `w`. IR lines: %44/%45 (v0), %48/%49 (v1), %52/%53 (v2),
  // %56/%57 (v3), %60/%61 (v4), %64/%65 (v5), %68/%69 (v6), %72/%73 (v7).
  const loadF4Times = (j: number): [number, number, number, number] => {
    const base = (inBaseF4 + j) * 4;
    return [
      Math.fround(w0 * Math.fround(input[base + 0])),
      Math.fround(w1 * Math.fround(input[base + 1])),
      Math.fround(w2 * Math.fround(input[base + 2])),
      Math.fround(w3 * Math.fround(input[base + 3])),
    ];
  };
  const v0 = loadF4Times(0); // %45  fmul <4xf> w, input[inBaseF4+0]
  const v1 = loadF4Times(1); // %49  fmul <4xf> w, input[inBaseF4+1]
  const v2 = loadF4Times(2); // %53
  const v3 = loadF4Times(3); // %57
  const v4 = loadF4Times(4); // %61
  const v5 = loadF4Times(5); // %65
  const v6 = loadF4Times(6); // %69
  const v7 = loadF4Times(7); // %73

  // ── Seam adds: the "bridge" between consecutive float4 blocks ──
  // These are scalar fadds combining the .3 lane of vN with the .0 lane of v(N+1):
  //   %74/%75/%76  seam0_pre = v0.3 + v1.0
  //   %78/%79/%80  seam1     = v1.3 + v2.0
  //   %81/%82/%83  seam2     = v2.3 + v3.0
  //   %84/%85/%86  seam3     = v3.3 + v4.0
  //   %87/%88/%89  seam4     = v4.3 + v5.0
  //   %90/%91/%92  seam5     = v5.3 + v6.0
  //   %93/%94/%95  seam6     = v6.3 + v7.0
  const seam0Pre = Math.fround(v0[3] + v1[0]);
  const seam1 = Math.fround(v1[3] + v2[0]);
  const seam2 = Math.fround(v2[3] + v3[0]);
  const seam3 = Math.fround(v3[3] + v4[0]);
  const seam4 = Math.fround(v4[3] + v5[0]);
  const seam5 = Math.fround(v5[3] + v6[0]);
  const seam6 = Math.fround(v6[3] + v7[0]);

  // %77 insertelement <4xf> v0, seam0Pre, i64 3   — replaces v0's lane 3 with seam0Pre
  //   The resulting vector is what gets combined with the OLD accumulator via the RMW
  //   at offset 0. Concretely: %96 = fadd <4xf> {inOut[base+0..3]}, {v0.0, v0.1, v0.2, seam0Pre}
  //
  //   NOTE: the IR only loads inOut[base+0] as a SCALAR at %34 and inserts it into
  //   <float undef, 0, 0, 0>.lane0 at %35 — so the vector fadd at %96 combines
  //   { prev, 0, 0, 0 } + { v0.0, v0.1, v0.2, seam0Pre } = { prev+v0.0, v0.1, v0.2, seam0Pre }.
  //   Lanes 1..3 of the sum are just the raw v0.1, v0.2, seam0Pre (adding 0). This means
  //   the RMW ONLY applies to slot 0; slots 1..3 are plain writes.
  const prevBase0 = Math.fround(inOut[baseOut + 0]); // %34 load float from inOut[baseOut+0]
  const out0 = Math.fround(prevBase0 + v0[0]);       // %97 = %96.lane0 = prev + v0.0
  const out1 = v0[1];                                // %98 = v0.1
  const out2 = v0[2];                                // %101 = v0.2
  const out3 = seam0Pre;                             // %104 = seam0Pre

  // Slots 4..24 are plain stores. Each maps 1:1 to an IR extract or seam sum.
  const out4 = v1[1];  // %107
  const out5 = v1[2];  // %110
  const out6 = seam1;  // %114
  const out7 = v2[1];  // %115
  const out8 = v2[2];  // %118
  const out9 = seam2;  // %122
  const out10 = v3[1]; // %123
  const out11 = v3[2]; // %126
  const out12 = seam3; // %130
  const out13 = v4[1]; // %131
  const out14 = v4[2]; // %134
  const out15 = seam4; // %138
  const out16 = v5[1]; // %139
  const out17 = v5[2]; // %142
  const out18 = seam5; // %146
  const out19 = v6[1]; // %147
  const out20 = v6[2]; // %150
  const out21 = seam6; // %154
  const out22 = v7[1]; // %155
  const out23 = v7[2]; // %158
  const out24 = v7[3]; // %161

  // ── 25 scalar stores ──   IR lines: %33/%100/%103/%106/%109/%112/%114/%117/%120/%122/
  //                          %125/%128/%130/%133/%136/%138/%141/%144/%146/%149/%152/
  //                          %154/%157/%160/%163
  inOut[baseOut + 0] = out0;   // store (%97)  — the RMW slot
  inOut[baseOut + 1] = out1;   // %98
  inOut[baseOut + 2] = out2;   // %101
  inOut[baseOut + 3] = out3;   // %104
  inOut[baseOut + 4] = out4;   // %107
  inOut[baseOut + 5] = out5;   // %110
  inOut[baseOut + 6] = out6;   // seam1 (%80 →%114)
  inOut[baseOut + 7] = out7;   // %115
  inOut[baseOut + 8] = out8;   // %118
  inOut[baseOut + 9] = out9;   // seam2 (%83 →%122)
  inOut[baseOut + 10] = out10; // %123
  inOut[baseOut + 11] = out11; // %126
  inOut[baseOut + 12] = out12; // seam3 (%86 →%130)
  inOut[baseOut + 13] = out13; // %131
  inOut[baseOut + 14] = out14; // %134
  inOut[baseOut + 15] = out15; // seam4 (%89 →%138)
  inOut[baseOut + 16] = out16; // %139
  inOut[baseOut + 17] = out17; // %142
  inOut[baseOut + 18] = out18; // seam5 (%92 →%146)
  inOut[baseOut + 19] = out19; // %147
  inOut[baseOut + 20] = out20; // %150
  inOut[baseOut + 21] = out21; // seam6 (%95 →%154)
  inOut[baseOut + 22] = out22; // %155
  inOut[baseOut + 23] = out23; // %158
  inOut[baseOut + 24] = out24; // %161

  // %164 ret void
}
