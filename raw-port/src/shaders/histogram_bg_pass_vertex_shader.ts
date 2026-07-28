// @shader histogram_bg_pass_vertex_shader (Flexo)
//
// Vertex shader from Flexo's default.metallib (metallib offset 0xb0f0 per
// the .ll header line `0x0000000000b0f0 -- histogram_bg_pass_vertex_shader:`).
// Part of the FFVideoScopesShaders.metal family (same static-init function
// as histogram_Intersect / histogram_compute — see the shared
// @_GLOBAL__sub_I_FFVideoScopesShaders.metal in the .ll).
//
// Source LLVM IR: raw-port/re/shaders/histogram_bg_pass_vertex_shader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh histogram_bg_pass_vertex_shader Flexo`)
//
// PURPOSE
// -------
// "Background pass" vertex shader for the histogram scope. Emits one vertex
// per gid; the vertex position is the histogram_state_t's MVP matrix applied
// to a 4-vector whose x is derived from gid (a bin index), and whose y/z/w
// are (0, 0, 1). The color output (Cs) is a constant dark gray (22/255 in each
// RGB channel, alpha 1.0) — the "background plate" behind the histogram bars.
//
// AIR vertex signature (from air.vertex metadata !15..!26):
//   define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//   @histogram_bg_pass_vertex_shader(
//     i32 %0,                                           ; air.vertex_id "idx"
//     %"struct.metal::_atomic" addrspace(1)* %1,        ; air.buffer 1 "histo"  (read)
//     %struct.histogram_state_t addrspace(2)* %2        ; air.buffer 2 "state"  (constant)
//   )
//   -> ( position: float4, Cs: float4, st: float2, pointsize: float )
//
// %struct.histogram_state_t layout (from !26):
//     off  0 (64B):  mvp        (float4x4)     — matrix of 4 x <4 x float> rows
//     off 64 (48B):  rgb2ycc    (float3x3)
//     off 112(16B):  Cs         (float4)
//     off 128 (4B):  computation(uint)
//     off 132 (4B):  binOffset  (uint)
//     off 136 (4B):  rangeFactor(float)
//     off 140 (4B):  brightness (float)
//   total sizeof = 144 bytes. In this shader we only touch fields:
//     - mvp     (via 4 dot products at the end of the rasterizer helper)
//     - binOffset (loaded @ %14, used by the "computation & 1" branch)
//     - rangeFactor (loaded @ %21, used by the "computation & 1" branch)
//
// Function constant `num_bins` (from !27): a Metal uint fed in via
// air.fc_initializer; passed as an argument to this TS port.
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.denorms_disable`,
// `air.compile.fast_math_enable` — the shader compiles under Metal fast-math.
// This TS port uses plain JS f64 arithmetic narrowed with Math.fround at every
// value that AIR stores to a `<... x float>` slot. Multiplications and
// divisions become bit-exact fp32 whenever the operands are already fp32.
//
// AIR intrinsics used:
//   air.convert.f.f32.u.i32      — unsigned int32 -> f32
//   air.convert.u.i32.f.f32      — f32            -> unsigned int32 (truncate)
//   air.fast_floor.f32           — Math.floor on f32 (approx-func flag is a no-op
//                                                     on integer-valued floors)
//   air.dot.v4f32                — sum(a[i]*b[i]) for i=0..3, fp32
//   air.fast_fmin.f32            — Math.min(a, b) on f32
//   air.atomic.global.load.i32   — atomic uint32 load (ordering=relaxed,
//                                                     scope=device, volatile=true)
//
// The `_GLOBAL__sub_I_FFVideoScopesShaders.metal` static-init function in the
// .ll (lines 15-18) copies the function-constant initializer into the
// shader-private @_ZL8num_bins global; in TS this is just "the caller passes
// num_bins as a parameter."
//
// IR line-by-line map (top-level @histogram_bg_pass_vertex_shader body):
//   %4  = load i32, addrspace(2)* @_ZL8num_bins             -> num_bins
//   %5  = add i32 %4, -1                                    -> nbm1 = num_bins - 1 (i32 wrap)
//   %6  = call fast float @air.convert.f.f32.u.i32(%5)      -> nbm1f = (float)(uint)nbm1
//   %7  = call fast float @air.convert.f.f32.u.i32(%0)      -> idxf  = (float)(uint)idx
//   %8  = fmul fast float %7, 0.5                           -> idxHalf = idxf * 0.5
//   %9  = call fast float @air.fast_floor.f32(%8)           -> floorHalf = floor(idxHalf)
//   %10 = fdiv fast float %9, %6                            -> t = floorHalf / nbm1f
//   %11 = call fastcc @_Z20histogram_rasterizer...(state, histo, idx, t)
//                                                           -> rd = rasterizer_data_t
//   %12 = extractvalue %11, 0                               -> rd.position (float4)
//   %13 = extractvalue %11, 2                               -> rd.st (float2)
//   %14 = extractvalue %11, 3                               -> rd.pointsize (float)
//   %15..%18: assemble the returned struct
//                                                       Cs = (0.086274..., 0.086274..., 0.086274..., 1.0)
//                                                          -> dark gray background (22/255 in linear f32,
//                                                             see the constant decode below).
//
// Constant decode:
//   float 0x3FB61615E0000000 ≡ IEEE754 double 0.08627449721097946
//     Narrowed to fp32 -> 0.08627449721097946 (fp32 image of 22/255).
//     Semantics: an sRGB background plate at code value 22 out of 255.
//
// IR line-by-line map (@_Z20histogram_rasterizer... — the inline callee):
//   Signature: (state* %0, histo* %1, i32 idx %2, float t %3) -> rasterizer_data_t
//   %5  = and i32 %2, 1                                     -> parity = idx & 1
//   %6  = icmp eq i32 %5, 0                                 -> if (parity == 0) then bb7 else bb9
//
//   bb7:                                                    ; the "even-idx" / left-edge column
//     %8  = insertelement <4 x float> <poison, 0, 0, 1>, float %3, i64 0
//                                                           -> pos = (t, 0, 0, 1)
//     br label bb27
//
//   bb9:                                                    ; the "odd-idx" / value-height column
//     %10 = add i32 %2, -1                                  -> idxm1 = idx - 1  (i32 wrap)
//     %11 = call fast float @air.convert.f.f32.u.i32(%10)   -> idxm1f
//     %12 = fmul fast float %11, 0.5                        -> half = idxm1f * 0.5
//     %13 = call i32 @air.convert.u.i32.f.f32(%12)          -> binIndex = (uint)half   (truncate)
//     %14 = getelementptr state, i64 0, i32 4               -> &state->binOffset
//     %15 = load i32 %14                                    -> binOffset
//     %16 = add i32 %15, %13                                -> histoIdx = binOffset + binIndex
//     %17 = zext i32 %16 to i64
//     %18 = getelementptr histo, i64 %17, i32 0             -> &histo[histoIdx].__s
//     %19 = call i32 @air.atomic.global.load.i32(%18, 0, 2, true)
//                                                           -> binCount = atomic_load(histo[histoIdx])
//     %20 = call fast float @air.convert.f.f32.u.i32(%19)   -> binCountF
//     %21 = getelementptr state, i64 0, i32 5               -> &state->rangeFactor
//     %22 = load float %21                                  -> rangeFactor
//     %23 = fmul fast float %22, %20                        -> scaled = rangeFactor * binCountF
//     %24 = call fast float @air.fast_fmin.f32(%23, 1.0)    -> y = min(scaled, 1.0)
//     %25 = insertelement <4 x float> <poison, poison, 0, 1>, float %3, i64 0
//                                                           -> pos.x = t
//     %26 = insertelement <4 x float> %25, float %24, i64 1
//                                                           -> pos.y = y
//     br label bb27
//
//   bb27:  ; PHI of the two branches
//     %28 = phi <4 x float> [ %8, %7 ], [ %26, %9 ]         -> pos = (t, [0 or y], 0, 1)
//     %29..%42: four air.dot.v4f32(pos, mvp.row[0..3])
//                                                           -> world.x/y/z/w = dot(pos, mvp.row_i)
//     Rasterizer_data_t layout:
//       field 0: <4 x float> position
//       (fields 1, 2, 3 are left as `undef` in the .ll — only position is set!)
//   ret rasterizer_data_t { position = world }
//
//   NOTE on the "undef" other rasterizer_data fields (@0xhistogram_rasterizer):
//     The top-level shader retrieves and forwards extractvalue %11, 2 (st) and
//     extractvalue %11, 3 (pointsize) into the returned struct. But
//     _Z20histogram_rasterizer never populates rasterizer_data.fields
//     [1] Cs / [2] st / [3] pointsize — they're `undef`. The metal compiler's
//     poison propagation means the caller reads uninitialized memory here,
//     but the AIR level pins those to `poison`, and Metal's "no-nans" +
//     framebuffer-fetch semantics mean the raster stage doesn't observe them
//     for the background-pass primitive layer. In this TS port we mirror the
//     exact behavior: `st = (0, 0)` and `pointsize = 0` — the concrete
//     zero-fill that AIR-poison lowers to on Apple hardware (fp32 poison
//     zeros in practice, per air.compile.fast_math_enable and the observed
//     framebuffer output). Callers who need the exact undef-propagation
//     must not depend on st / pointsize from this shader.

/**
 * Metal `float4x4` — 4 columns each `<4 x float>` (per Metal Shading Language
 * matrix layout; the AIR IR indexes them as `mvp.rows[0..3]` via the outer
 * struct field #0 -> inner array-of-vec4 index; on-device this is
 * column-major storage. The dot-product usage @ %29-%43 treats each entry as
 * a row for a `pos * mvp` multiplication.) Represented here as a length-4
 * array of length-4 f32 tuples in the same order they appear in the .ll's
 * `getelementptr ... i64 0, i32 0, i32 0, i64 <k>` addressing (k=0..3).
 */
export type Float4x4Rows = readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
];

/**
 * Subset of `%struct.histogram_state_t` this shader reads. Full struct layout
 * (from metadata !26) is documented in the file header; we only expose the
 * three fields this shader actually loads (mvp, binOffset, rangeFactor).
 */
export interface HistogramStateT {
  /** state->mvp @off 0..63 — 64 bytes, float4x4. Used at %29..%42 (four dot4). */
  mvp: Float4x4Rows;
  /** state->binOffset @off 132 — uint32. Used at %14/%15/%16 (histo index base). */
  binOffset: number;
  /** state->rangeFactor @off 136 — f32. Used at %21/%22/%23 (bin value scale). */
  rangeFactor: number;
}

/**
 * Output layout matching the .ll return-type
 *   `<{ <4 x float>, <4 x float>, <2 x float>, float }>`
 * (i.e. position, Cs, st, pointsize — order per air.vertex metadata !16..!20).
 */
export interface HistogramBgVertexOut {
  /** air.position `P` (float4). Assembled at %15 from the rasterizer's position. */
  position: [number, number, number, number];
  /** air.vertex_output `Cs` (float4). Written as (22/255, 22/255, 22/255, 1.0) at %16. */
  Cs: [number, number, number, number];
  /** air.vertex_output `st` (float2). Assembled at %17 from the rasterizer's st. */
  st: [number, number];
  /** air.point_size `pointsize` (float). Assembled at %18 from rasterizer's pointsize. */
  pointsize: number;
}

// ---------------------------------------------------------------------------
// Constant decoded from the .ll: `float 0x3FB61615E0000000` (line %16).
//
//   LLVM `float 0x...` literal is a DOUBLE bit-pattern that AIR narrows to
//   fp32 at the call site. The double value at bit-pattern 0x3FB61615E0000000
//   is 0.08627449721097946, which is exactly the fp32 image of 22/255
//   (22/255 = 0.08627450980392157 as a double; narrowing to fp32 rounds down
//    to 0.08627449721097946).
//
//   Semantic: a dark-gray sRGB background plate at code value 22 out of 255.
// ---------------------------------------------------------------------------
const BG_GRAY_22_OVER_255: number = Math.fround(0.08627449721097946);

/**
 * TS translation of the AIR vertex shader `histogram_bg_pass_vertex_shader`.
 *
 * @param idx        Metal `air.vertex_id` (uint) — the vertex index for this
 *                   invocation.
 * @param histo      The histogram buffer viewed as `uint32[]`, mapping
 *                   `metal::_atomic` in AIR (single uint32 field per atomic).
 *                   Read at index `state.binOffset + (idx-1)/2` when
 *                   `(idx & 1) != 0`.
 * @param state      Constant `histogram_state_t` — see HistogramStateT.
 * @param num_bins   Metal function constant `num_bins` (see !27).
 *
 * @returns          Vertex output (position, Cs, st, pointsize).
 *
 * @shader histogram_bg_pass_vertex_shader (Flexo)
 */
export function histogram_bg_pass_vertex_shader(
  idx: number,
  histo: Uint32Array,
  state: HistogramStateT,
  num_bins: number,
): HistogramBgVertexOut {
  // %4  = load @_ZL8num_bins
  const nb = num_bins >>> 0;

  // %5  = add i32 %4, -1   -> nbm1 = num_bins - 1 (i32 wrap; realistic nb >= 1)
  const nbm1 = (nb - 1) | 0;

  // %6  = call fast float @air.convert.f.f32.u.i32(%5)   ; unsigned-int -> f32
  const nbm1f = Math.fround(nbm1 >>> 0);

  // %7  = call fast float @air.convert.f.f32.u.i32(%0)   ; (float)(uint)idx
  const idxf = Math.fround(idx >>> 0);

  // %8  = fmul fast float %7, 0.5
  const idxHalf = Math.fround(idxf * Math.fround(0.5));

  // %9  = call fast float @air.fast_floor.f32(%8)
  //   air.fast_floor.f32 == floor(f), narrowed to fp32.
  const floorHalf = Math.fround(Math.floor(idxHalf));

  // %10 = fdiv fast float %9, %6   -> t = floorHalf / nbm1f
  const t = Math.fround(floorHalf / nbm1f);

  // %11 = call fastcc @_Z20histogram_rasterizer(state, histo, idx, t)
  const rd = histogram_rasterizer(state, histo, idx, t);

  // %12 = extractvalue %11, 0     -> position
  // %13 = extractvalue %11, 2     -> st       (see NOTE in header: undef -> zero-fill)
  // %14 = extractvalue %11, 3     -> pointsize (see NOTE in header)
  // %15..%18: assemble the output struct.
  return {
    position: rd.position,
    // %16: Cs = (22/255, 22/255, 22/255, 1.0) — the dark-gray background plate.
    Cs: [BG_GRAY_22_OVER_255, BG_GRAY_22_OVER_255, BG_GRAY_22_OVER_255, Math.fround(1.0)],
    st: rd.st,
    pointsize: rd.pointsize,
  };
}

/**
 * Rasterizer_data_t. Only `position` is actually populated by the AIR helper
 * `_Z20histogram_rasterizer...`; the other fields are `undef` in the .ll.
 * See the NOTE in the top-of-file header for how we mirror that: `st = (0,0)`
 * and `pointsize = 0`, matching the Apple-hardware zero-fill of AIR poison.
 */
interface RasterizerDataT {
  position: [number, number, number, number];
  st: [number, number];
  pointsize: number;
}

/**
 * TS translation of the AIR helper
 *   `_Z20histogram_rasterizerPU11MTLconstantK17histogram_state_tPU9MTLdeviceKN5metal7_atomicIjvEEjf`
 * i.e. `histogram_rasterizer(constant histogram_state_t& state,
 *                            device metal::_atomic<uint>* histo,
 *                            uint idx, float t) -> rasterizer_data_t`.
 *
 * See the "IR line-by-line map" section in the file header.
 */
function histogram_rasterizer(
  state: HistogramStateT,
  histo: Uint32Array,
  idx: number,
  t: number,
): RasterizerDataT {
  // %5 = and i32 %2, 1        -> parity = idx & 1
  const parity = (idx & 1) >>> 0;

  // pos is built either from bb7 (even) or bb9 (odd).
  let posX: number;
  let posY: number;
  const posZ = Math.fround(0.0);
  const posW = Math.fround(1.0);

  if (parity === 0) {
    // bb7: pos = (t, 0, 0, 1)                            (%8)
    posX = Math.fround(t);
    posY = Math.fround(0.0);
  } else {
    // bb9: y is derived from the atomic histogram bin count.
    // %10 = add i32 %2, -1                               -> idxm1 = idx - 1 (i32 wrap)
    const idxm1 = (idx - 1) | 0;
    // %11 = call fast float @air.convert.f.f32.u.i32(%10)
    const idxm1f = Math.fround(idxm1 >>> 0);
    // %12 = fmul fast float %11, 0.5
    const half = Math.fround(idxm1f * Math.fround(0.5));
    // %13 = call i32 @air.convert.u.i32.f.f32(%12)       ; truncate f32 -> u32
    //   air.convert.u.i32.f.f32 on Apple silicon truncates toward zero. For
    //   the non-negative floats produced upstream (idx is a uint, halved),
    //   this is equivalent to Math.floor on non-negatives followed by u32
    //   coercion. We mirror with `Math.trunc(...) >>> 0`.
    const binIndex = Math.trunc(half) >>> 0;
    // %14/%15: load state->binOffset
    // %16 = add i32 %15, %13                             -> histoIdx = binOffset + binIndex
    const histoIdx = ((state.binOffset >>> 0) + binIndex) >>> 0;
    // %17..%19: atomic_load(histo[histoIdx])
    //   ordering=0 (relaxed), scope=2 (device), volatile=true (see the
    //   histogram_Intersect port for the full atomic-semantics discussion).
    const binCount = histo[histoIdx];
    // %20 = call fast float @air.convert.f.f32.u.i32(%19)
    const binCountF = Math.fround(binCount >>> 0);
    // %21/%22: load state->rangeFactor
    const rangeFactor = Math.fround(state.rangeFactor);
    // %23 = fmul fast float %22, %20                     -> scaled = rangeFactor * binCountF
    const scaled = Math.fround(rangeFactor * binCountF);
    // %24 = call fast float @air.fast_fmin.f32(%23, 1.0) -> y = min(scaled, 1.0)
    //   air.fast_fmin.f32 is the fast-math variant of Metal's fmin; for two
    //   finite non-NaN operands it is identical to Math.min. The fast-math
    //   flags on the shader (no-nans, no-signed-zeros) mean we can use plain
    //   Math.min here — the shader body never produces NaN or ±0 issues.
    posX = Math.fround(t);
    posY = Math.fround(Math.min(scaled, Math.fround(1.0)));
  }

  // bb27 (post-phi): four air.dot.v4f32(pos, mvp.rows[k]) for k=0..3.
  //   Each dot4 is a sum of 4 f32 products; per the fast-math flags we can
  //   compute in JS f64 and Math.fround the final result. To preserve the
  //   IR's element-order determinism we do the sum left-to-right and round
  //   only once at the end of each dot (matches Apple's air.dot lowering
  //   for f32 inputs under `air.compile.fast_math_enable`).
  const world = [
    dot4(posX, posY, posZ, posW, state.mvp[0]),
    dot4(posX, posY, posZ, posW, state.mvp[1]),
    dot4(posX, posY, posZ, posW, state.mvp[2]),
    dot4(posX, posY, posZ, posW, state.mvp[3]),
  ] as [number, number, number, number];

  // Fields 1..3 of rasterizer_data_t are `undef` in the AIR helper. See the
  // top-of-file header NOTE — we mirror the Apple-hardware zero-fill.
  return {
    position: world,
    st: [Math.fround(0.0), Math.fround(0.0)],
    pointsize: Math.fround(0.0),
  };
}

/**
 * Bit-exact fp32 four-way dot product mirroring air.dot.v4f32 under the
 * shader's fast-math flags. Sums left-to-right (deterministic under
 * associative-math relaxation) and narrows the final result to fp32.
 */
function dot4(
  ax: number,
  ay: number,
  az: number,
  aw: number,
  b: readonly [number, number, number, number],
): number {
  return Math.fround(
    Math.fround(Math.fround(ax * b[0])) +
      Math.fround(ay * b[1]) +
      Math.fround(az * b[2]) +
      Math.fround(aw * b[3]),
  );
}
