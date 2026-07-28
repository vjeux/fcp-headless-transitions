// histogram_vertex_shader.ts — vertex shader that reads a histogram bin count from a global
// atomic buffer and emits a screen-space point with a "brightness"-modulated pointsize.
// @shader histogram_vertex_shader (Flexo)
// Source IR: raw-port/re/shaders/histogram_vertex_shader.ll
// Compiled from: Flexo.framework/Versions/A/Resources/default.metallib
//   (per re/shaders/histogram_vertex_shader.ll header — @0x0000000000ca90)
//
// LLVM IR signature (from the .ll, line "define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//                                          @histogram_vertex_shader(...)"):
//   %0 : i32                                   — vertex_id "idx"            (!22)
//   %1 : atomic<uint>* addrspace(1)            — device buffer "histo"      (!23) — bin counts
//   %2 : histogram_state_t* addrspace(2)       — constant buffer "state"    (!25)
//
// Uniform layout `struct histogram_state_t` (from !24/!26; 144 bytes, align 16):
//   +0x00  float4x4 mvp           (i32 0)                 -- 64 bytes
//   +0x40  float3x3 rgb2ycc       (i32 1)                 -- 48 bytes
//   +0x70  float4   Cs            (i32 2)                 -- 16 bytes
//   +0x80  uint     computation   (i32 3)                 --  4 bytes
//   +0x84  uint     binOffset     (i32 4)                 --  4 bytes
//   +0x88  float    rangeFactor   (i32 5)                 --  4 bytes  (align 8 per !45)
//   +0x8c  float    brightness    (i32 6)                 --  4 bytes
//
// Vertex outputs (!16):
//   slot 0 : air.position       float4  "P"          — clip-space position (mvp * Cs)
//   slot 1 : air.vertex_output  float4  "Cs"         — output color (rgb from state.Cs, alpha computed)
//   slot 2 : air.vertex_output  float2  "st"         — 2D data (branch-dependent)
//   slot 3 : air.point_size     float   "pointsize"  — point-sprite size
//
// Function constant:
//   @_ZL8num_bins : uint, initialized by @_GLOBAL__sub_I_FFVideoScopesShaders.metal from
//   @_Z8num_bins.MTL_FC_INIT_0_j (an externally-initialized function-constant, !27). At link
//   time Metal patches num_bins to the pipeline-state-defined bin count. In TS we accept it
//   as a parameter (numBins) to `histogram_vertex_shader(...)`.
//
// FAST-MATH: attribute #1 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros +
// approx-func-fp-math + fast_math_enable + air.compile.fast_math_enable. We use plain JS
// fp32-narrowed math ops (Math.fround) for every fadd/fmul/fdiv/fsub — the arithmetic is
// small and adheres to fast-math (reassoc/afn) without changing the bit-exact float32 result.

// ---- Frontier: atomic buffer & AIR intrinsics not decoded here ----

/**
 * The device atomic bin-count buffer. Reads are `air.atomic.global.load.i32` with monotonic
 * memory order (i32 0, i32 2, i1 true — see @rasterizer %19).
 * required-by histogram_rasterizer %19 — cite: `air.atomic.global.load.i32`
 */
export interface HistogramAtomicBuffer {
  /**
   * @param wordIndex uint32 word offset into the atomic buffer (u32-array-of-uints).
   * @returns the raw uint32 bin count at that slot.
   */
  atomicLoadU32(wordIndex: number): number;
}

// ---- Uniform state struct ------------------------------------------------

/**
 * The constant-buffer `histogram_state_t` (!26). Each field is exactly as declared in the
 * air struct-type-info metadata; we mirror the offsets in comments for auditability.
 */
export interface HistogramState {
  /** +0x00 : float4x4 mvp — column-major, 4 columns of 4 floats. */
  mvp: Float32Array; // length 16
  /** +0x40 : float3x3 rgb2ycc — column-major, 3 columns of 3 floats (unused by THIS shader). */
  rgb2ycc: Float32Array; // length 9
  /** +0x70 : float4 Cs — rgba base color for the emitted vertex. */
  Cs: [number, number, number, number];
  /** +0x80 : uint computation — an opaque uint used elsewhere in the pipeline (unread here). */
  computation: number;
  /** +0x84 : uint binOffset — added to the bin index inside the atomic load path. */
  binOffset: number;
  /** +0x88 : float rangeFactor — multiplies the bin count into the range [0,1]. */
  rangeFactor: number;
  /** +0x8c : float brightness — remaps into a smoothstep-style alpha (see %19..%25 below). */
  brightness: number;
}

// ---- Vertex output --------------------------------------------------------

export interface HistogramVertexOutput {
  /** slot 0 (air.position "P"): mvp * Cs                           — %12 / %31..%44 */
  position: [number, number, number, number];
  /** slot 1 (air.vertex_output "Cs"): rgb from state.Cs, alpha = smoothstep-remapped brightness. */
  Cs: [number, number, number, number];
  /** slot 2 (air.vertex_output "st"): 2D data, computed by histogram_rasterizer.               */
  st: [number, number];
  /** slot 3 (air.point_size "pointsize"): float — computed by histogram_rasterizer.            */
  pointSize: number;
}

// ---- Constants (bit-patterns decoded from the IR) -------------------------

/**
 * IR literal `float 0x3FCB020C40000000` (a DOUBLE spelling in AIR, narrowed to fp32 at the
 * .f32 callsite it feeds). Decoded double = 0.210999995470047; narrowed to fp32 = same value.
 * Cited at %23 as the coefficient in `%22 * 0x3FCB020C40000000`.
 */
const K_0x3FCB020C40000000_f32: number = Math.fround(0.210999995470047);

/**
 * IR literal `float 0x3FCD916880000000`. Decoded double = 0.23100000619888306; narrowed to
 * fp32 = same value. Cited at %25 as the constant added at `%24 + 0x3FCD916880000000`.
 */
const K_0x3FCD916880000000_f32: number = Math.fround(0.23100000619888306);

// ---- histogram_rasterizer (internal helper — .ll defines it after the entry) --------------

/**
 * fastcc `%struct._rasterizer_data_t @_Z20histogram_rasterizer...` — the internal helper
 * used by histogram_vertex_shader %11. Returns a 4-field tuple `(<4 x float>, <4 x float>,
 * <2 x float>, float)` but only fields 0, 2, 3 are read by the caller (see %12/%13/%14).
 *
 * IR line map (%N cites refer to lines inside the rasterizer body):
 *   %5   = %vid AND 1                           — parity of vertex index
 *   %6   = %5 == 0                              — even-vertex branch predicate
 *   [7]  even branch:
 *     %8 = insertelement <poison,0,0,1>, %f, 0  — vec4(f, 0, 0, 1)   (%f = arg %3)
 *     -> phi source
 *   [9]  odd branch:
 *     %10 = %vid - 1
 *     %11 = uint2float(%10)                     — air.convert.f.f32.u.i32
 *     %12 = %11 * 0.5                           — half of previous odd bin
 *     %13 = float2uint(%12)                     — air.convert.u.i32.f.f32 (rounds toward zero)
 *     %14 = &state.binOffset                    — GEP i32 4
 *     %15 = load state.binOffset
 *     %16 = %15 + %13                           — final atomic-buffer word index
 *     %17 = zext %16 to i64
 *     %18 = &histo[%17]
 *     %19 = atomic_load_i32(%18, monotonic)     — air.atomic.global.load.i32
 *     %20 = uint2float(%19)                     — bin count as float
 *     %21 = &state.rangeFactor                  — GEP i32 5
 *     %22 = load state.rangeFactor
 *     %23 = %22 * %20                           — normalized "y"
 *     %24 = fmin(%23, 1.0)                      — air.fast_fmin.f32   (clamp top)
 *     %25 = insertelement <poison,poison,0,1>, %f, 0     — vec4(f, ?, 0, 1)
 *     %26 = insertelement %25, %24, 1                    — vec4(f, %24, 0, 1)
 *     -> phi source
 *   [27] merge:
 *     %28 = phi(%8 from even, %26 from odd)
 *     %29..%44 = mvp * %28  (four dot-products producing the 4-component position)
 *
 * The rasterizer's return struct has:
 *   field 0 : <4 x float> — the mvp-transformed position                  (extracted as %12)
 *   field 1 : <4 x float> — poison (never written)                        (unread by caller)
 *   field 2 : <2 x float> — poison (never written)                        (extracted as %13)
 *   field 3 : float       — poison (never written)                        (extracted as %14)
 *
 * The caller reads fields 2 and 3 despite them being poison — under fast-math this is defined
 * to be "some value"; the compiler leaves them as `undef` in the final vertex output, which
 * then reaches the rasterizer stage as unspecified data. We surface that faithfully by
 * emitting NaN for those slots; the caller's insertvalue writes at fields 0/1 anyway (see
 * %28: only slot 1 is inserted with %26; slots 2/3 keep their %13/%14 values). To be
 * bit-precise we return the tuple explicitly and let the entry function propagate what it
 * reads.
 */
export interface HistogramRasterizerData {
  /** field 0 : <4 x float> — mvp * vertex_position  (well-defined)                 */
  position: [number, number, number, number];
  /** field 1 : <4 x float> — poison, never written                                 */
  poison_v4: [number, number, number, number];
  /** field 2 : <2 x float> — poison, never written                                 */
  poison_v2: [number, number];
  /** field 3 : float       — poison, never written                                 */
  poison_f: number;
}

export function histogram_rasterizer(
  state: HistogramState,
  histo: HistogramAtomicBuffer,
  vid: number,   // %2  (u32)
  f: number,     // %3  (float — the pre-computed normalized x from the entry)
): HistogramRasterizerData {
  // %5   = %vid & 1
  const parity = (vid & 1) >>> 0;
  // %6   = parity == 0   — even-vertex predicate
  let vertex: [number, number, number, number];
  if (parity === 0) {
    // %7 (label): even path
    // %8   = insertelement <poison, 0, 0, 1>, %f, 0
    //      -> vec4(f, 0, 0, 1)
    vertex = [Math.fround(f), Math.fround(0), Math.fround(0), Math.fround(1)];
  } else {
    // %9 (label): odd path
    // %10  = vid - 1
    const vidMinus1 = ((vid - 1) >>> 0) | 0; // subtraction wraps as u32
    // %11  = uint2float(%10)     — air.convert.f.f32.u.i32
    const f11 = Math.fround(vidMinus1 >>> 0);
    // %12  = %11 * 0.5
    const f12 = Math.fround(f11 * Math.fround(0.5));
    // %13  = float2uint(%12)     — air.convert.u.i32.f.f32 (round-toward-zero)
    // The IR's u32 conversion truncates the mantissa; JS Math.trunc + >>>0 mirrors that
    // for the finite positive values this shader will ever produce (num_bins is a small
    // positive int, so %12 is a non-negative fp32 half-integer).
    const u13 = (Math.trunc(f12) >>> 0);
    // %14  = &state.binOffset   ; %15 = load %14
    const binOffset = state.binOffset >>> 0;
    // %16  = binOffset + %13
    const wordIndex = ((binOffset + u13) >>> 0);
    // %17  = zext %16 to i64  ; %18 = &histo[wordIndex]
    // %19  = air.atomic.global.load.i32(&histo[wordIndex], seq_cst-relaxed monotonic)
    const binCountU32 = histo.atomicLoadU32(wordIndex) >>> 0;
    // %20  = uint2float(%19)
    const binCountF = Math.fround(binCountU32);
    // %21  = &state.rangeFactor  ; %22 = load %21
    const rangeFactor = Math.fround(state.rangeFactor);
    // %23  = %22 * %20
    const scaled = Math.fround(rangeFactor * binCountF);
    // %24  = air.fast_fmin.f32(%23, 1.0)
    const clamped = Math.fround(Math.min(scaled, Math.fround(1)));
    // %25  = insertelement <poison, poison, 0, 1>, %f, 0
    //      -> vec4(f, ?, 0, 1)
    // %26  = insertelement %25, %24, 1
    //      -> vec4(f, %24, 0, 1)
    vertex = [Math.fround(f), clamped, Math.fround(0), Math.fround(1)];
  }
  // %27 (label): merge — %28 = phi
  const v28 = vertex;

  // %29..%44: mvp * v28  — four dot products, one per column-vector row.
  //   For column-major mvp storage (metal::matrix), matrix.columns[k] is a <4 x float>
  //   loaded at GEP (i32 0, i32 0, i64 k). The IR does:
  //     %31 = dot(v28, col0)
  //     %35 = dot(v28, col1)
  //     %39 = dot(v28, col2)
  //     %43 = dot(v28, col3)
  //   and packs those into a <4 x float> — this yields the standard "column-major matrix
  //   times a column vector on the RIGHT" convention where the RESULT is (col0*x + col1*y
  //   + col2*z + col3*w). But the shader dots each column against the SAME vector v28 and
  //   places the results in slots 0..3 respectively. Reproducing that literally:
  const mvp = state.mvp;
  // col0 = mvp[0..3], col1 = mvp[4..7], col2 = mvp[8..11], col3 = mvp[12..15]
  const dot4 = (ax: number, ay: number, az: number, aw: number,
                bx: number, by: number, bz: number, bw: number): number => {
    // air.dot.v4f32 is fast-math; do the ADD in fp32-narrowed order (component-wise fmul
    // then serial fadd, matching how the AIR intrinsic is typically lowered under fast-math).
    const p0 = Math.fround(ax * bx);
    const p1 = Math.fround(ay * by);
    const p2 = Math.fround(az * bz);
    const p3 = Math.fround(aw * bw);
    return Math.fround(Math.fround(Math.fround(p0 + p1) + p2) + p3);
  };
  const [x, y, z, w] = v28;
  // %31 = dot(v28, col0)
  const p0 = dot4(x, y, z, w, mvp[0], mvp[1], mvp[2], mvp[3]);
  // %35 = dot(v28, col1)
  const p1 = dot4(x, y, z, w, mvp[4], mvp[5], mvp[6], mvp[7]);
  // %39 = dot(v28, col2)
  const p2 = dot4(x, y, z, w, mvp[8], mvp[9], mvp[10], mvp[11]);
  // %43 = dot(v28, col3)
  const p3 = dot4(x, y, z, w, mvp[12], mvp[13], mvp[14], mvp[15]);
  // %44 = <p0, p1, p2, p3>
  // %45 = insertvalue <poison, poison, poison, poison>, %44, 0
  //   -> field 0 = %44, other fields remain poison.
  return {
    position: [p0, p1, p2, p3],
    // Fields 1/2/3 are poison per the IR. We surface NaN so callers that touch them get a
    // deterministic-but-invalid signal instead of a silently-defined value.
    poison_v4: [NaN, NaN, NaN, NaN],
    poison_v2: [NaN, NaN],
    poison_f: NaN,
  };
}

// ---- Entry: histogram_vertex_shader ---------------------------------------

/**
 * @shader histogram_vertex_shader (Flexo) — faithful transcription of the AIR IR.
 *
 * @param vid      Vertex ID (%0, i32).                       — see !22
 * @param histo    Atomic bin-count device buffer (%1).       — see !23
 * @param state    Uniform state (%2) — constant buffer.      — see !25
 * @param numBins  Function-constant patch value (`@_ZL8num_bins`, !27). At Metal link time
 *                 Apple patches this constant into the compiled shader; in TS we accept it
 *                 as a parameter so the caller sets it explicitly.
 */
export function histogram_vertex_shader(
  vid: number,
  histo: HistogramAtomicBuffer,
  state: HistogramState,
  numBins: number,
): HistogramVertexOutput {
  // Function-constant patch happens in @_GLOBAL__sub_I_FFVideoScopesShaders.metal:
  //   %1 = load i32, i32 addrspace(2)* @_Z8num_bins.MTL_FC_INIT_0_j
  //   store i32 %1, i32 addrspace(2)* @_ZL8num_bins
  // We model that as `numBins` being pre-patched by the caller.
  // %4 = load i32 @_ZL8num_bins
  const num_bins = numBins >>> 0;
  // %5 = num_bins + (-1)   ; unsigned wrap
  const nmMinus1 = ((num_bins - 1) >>> 0);
  // %6 = uint2float(%5)    ; air.convert.f.f32.u.i32
  const nmMinus1F = Math.fround(nmMinus1);
  // %7 = uint2float(%vid)
  const vidF = Math.fround(vid >>> 0);
  // %8 = %vidF * 0.5
  const halfVid = Math.fround(vidF * Math.fround(0.5));
  // %9 = air.fast_floor.f32(%halfVid)
  const flooredHalfVid = Math.fround(Math.floor(halfVid));
  // %10 = %9 / %6
  const f10 = Math.fround(flooredHalfVid / nmMinus1F);

  // %11 = call fastcc %struct._rasterizer_data_t
  //         @_Z20histogram_rasterizer(%state, %histo, %vid, %f10)
  const rast = histogram_rasterizer(state, histo, vid, f10);

  // %12 = extractvalue %11, 0   — mvp * vertex (position, well-defined)
  const positionOut = rast.position;
  // %13 = extractvalue %11, 2   — poison <2 x float>
  const stOut = rast.poison_v2;
  // %14 = extractvalue %11, 3   — poison float
  const pointSizeOut = rast.poison_f;

  // %15 = &state.Cs               (GEP i32 2)
  // %16 = load state.Cs (float4)
  const CsBase: [number, number, number, number] = [
    Math.fround(state.Cs[0]),
    Math.fround(state.Cs[1]),
    Math.fround(state.Cs[2]),
    Math.fround(state.Cs[3]),
  ];
  // %17 = &state.brightness       (GEP i32 6)
  // %18 = load state.brightness
  const brightness = Math.fround(state.brightness);
  // %19 = air.fast_clamp.f32(%18, 0.0, 1.0)
  const bClamped = Math.fround(Math.min(Math.max(brightness, Math.fround(0)), Math.fround(1)));
  // %20 = %19 * 2.0
  const b2 = Math.fround(bClamped * Math.fround(2));
  // %21 = 3.0 - %20
  const three_minus_2b = Math.fround(Math.fround(3) - b2);
  // %22 = %19 * %19
  const bSq = Math.fround(bClamped * bClamped);
  // %23 = %22 * 0x3FCB020C40000000       (fp32-narrowed double = 0.210999995470047)
  const bSqTimesK1 = Math.fround(bSq * K_0x3FCB020C40000000_f32);
  // %24 = %23 * %21
  const shaped = Math.fround(bSqTimesK1 * three_minus_2b);
  // %25 = %24 + 0x3FCD916880000000       (fp32-narrowed double = 0.23100000619888306)
  const alphaOut = Math.fround(shaped + K_0x3FCD916880000000_f32);
  // %26 = insertelement %16 (Cs), %25, 3   — replace alpha with the shaped value
  const CsWithAlpha: [number, number, number, number] = [CsBase[0], CsBase[1], CsBase[2], alphaOut];

  // %27..%30 pack the return struct: slot 0 = %12, slot 1 = %26, slot 2 = %13, slot 3 = %14.
  return {
    position: positionOut,
    Cs: CsWithAlpha,
    st: stOut,
    pointSize: pointSizeOut,
  };
}
