// @shader vectorscope_vertex_shader (Flexo)  @0x000000000063e0
//
// Metal VERTEX shader from Flexo's default.metallib. This is the vertex
// stage of FFVideoScopes' vectorscope: for each output vertex it samples
// the source video texture at a per-vertex tex-coord, transforms the
// sampled RGB through an RGB->YCC 3x3 matrix, does a small "boost near
// origin" adjustment in the chroma plane, transforms the chroma back
// through a YCC->RGB matrix to color the point, projects the (Cb, Cr, 0, 1)
// through the 4x4 MVP matrix to get clip position, and derives the vertex
// alpha from a smoothstep-like brightness curve.
//
// Source LLVM IR: raw-port/re/shaders/vectorscope_vertex_shader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh vectorscope_vertex_shader Flexo`)
//
// AIR signature (from the .ll):
//   define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//     @vectorscope_vertex_shader(
//       i32 %0,                             // idx (vertex id)
//       <2 x float>* %1,                    // st (per-vertex tex-coords)
//       %struct.vectorscope_state_t* %2,    // state (uniforms)
//       %struct._texture_2d_t* %3           // te (video texture)
//     )
//
// state_t layout (from `!25` in the .ll):
//   struct vectorscope_state_t {           // total size 176, align 16
//     float4x4 mvp;         // @0   size 64  — clip-space MVP matrix
//     float3x3 rgb2ycc;     // @64  size 48
//     float3x3 ycc2rgb;     // @112 size 48
//     float    pointsize;   // @160 size 4
//     float    brightness;  // @164 size 4
//     bool     monochrome;  // @168 size 1 (i8 in AIR)
//     i8[7]    _pad;        // @169 size 7 (trailing padding to 176)
//   };
//
// Return-type is a packed struct (`!16` outputs):
//   field 0 = air.position        <4 x float>  ("P")           — clip pos
//   field 1 = air.vertex_output   <4 x float>  ("Cs")          — color
//   field 2 = air.vertex_output   <2 x float>  ("st")          — tex coord
//   field 3 = air.point_size      float        ("pointsize")   — sprite size
//
// The .ll contains an internal helper `_Z22vectorscope_rasterizer...`
// (mangled: `vectorscope_rasterizer(constant vectorscope_state_t*, half4)`)
// returning a `%struct._rasterizer_data_t = { <4 x float>, <4 x float>,
// <2 x float>, float }`. This port models it as a helper function
// `vectorscope_rasterizer(state, texelHalf4) -> { P, Cs, st, pointsize }`
// mirroring the field layout of `_rasterizer_data_t` exactly.
//
// AIR intrinsics used:
//   air.sample_texture_2d.v4f16(tex, sampler, uv, ...) -> half4
//   air.fast_clamp.f32(x, lo, hi)                      -> float
//   air.fast_fabs.f32(x)                               -> float
//   air.fast_fmax.f32(x, y)                            -> float
//   air.dot.v3f32(a, b), air.dot.v4f32(a, b)           -> float
//   (fpext half->float is a bit-exact widening; no info loss.)
//
// Fast-math attributes (attribute #0/#2): `unsafe-fp-math`, `no-nans-fp-math`,
// `no-infs-fp-math`, `no-signed-zeros-fp-math`, `approx-func-fp-math`,
// `air.compile.fast_math_enable`. This port uses plain JS Number arithmetic
// with per-intermediate Math.fround for f32 fidelity.
//
// Double-literal constants (LLVM spells fp32 constants as their double bit
// pattern; both are fp32-narrowed at the callsite by the intrinsic's .f32
// signature):
//   0x3FD072B020000000 = 0.25699999928474426 (fp32 == 0.257f)  — smoothstep peak
//   0x3FA0F27BC0000000 = 0.03310000151395798 (fp32 == 0.0331f) — smoothstep bias
//   0x3FB99999A0000000 = 0.10000000149011612 (fp32 == 0.1f)    — chroma dead-zone

/**
 * A row-major 4x4 matrix stored as four <4 x float> rows.
 * (LLVM `[4 x <4 x float>]` — the row-vector convention used by
 * `air.dot.v4f32(v, row_i)`.)
 */
export type Mat4 = readonly [
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
  readonly [number, number, number, number],
];

/**
 * A row-major 3x3 matrix stored as three <3 x float> rows.
 * (LLVM `[3 x <3 x float>]` — same convention as Mat4.)
 */
export type Mat3 = readonly [
  readonly [number, number, number],
  readonly [number, number, number],
  readonly [number, number, number],
];

/** The vectorscope shader's uniform state (see `!25` in the .ll). */
export interface VectorscopeStateT {
  /** float4x4 mvp @ +0  — clip-space MVP matrix. */
  readonly mvp: Mat4;
  /** float3x3 rgb2ycc @ +64 — RGB -> luma/chroma-chroma matrix. */
  readonly rgb2ycc: Mat3;
  /** float3x3 ycc2rgb @ +112 — luma/chroma -> RGB matrix. */
  readonly ycc2rgb: Mat3;
  /** float pointsize @ +160 — sprite pixel size. */
  readonly pointsize: number;
  /** float brightness @ +164 — 0..1 mapping to the point's alpha. */
  readonly brightness: number;
  /** bool monochrome @ +168 — when true, Cs.rgb is forced to white. */
  readonly monochrome: boolean;
}

/** RGBA texel as a length-4 tuple of f32 lanes. */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture-sampling callback modeling
 * `air.sample_texture_2d.v4f16(tex, sampler, uv, ...)` — the shader
 * receives a <4 x half>; the port takes fp32 lanes from the callback
 * (fp16 -> fp32 widening is lossless per lane, so this is faithful).
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * Output tuple mirroring the AIR return type
 *   <{ <4 x float>, <4 x float>, <2 x float>, float }>.
 * Field names come from `!16`/`!17..!20` metadata.
 */
export interface VectorscopeVertexOut {
  /** air.position "P" — clip-space position (float4). */
  readonly P: [number, number, number, number];
  /** air.vertex_output "Cs" — vertex color (float4). */
  readonly Cs: [number, number, number, number];
  /** air.vertex_output "st" — tex-coord passed to fragment stage (float2). */
  readonly st: [number, number];
  /** air.point_size "pointsize" — point-sprite size in pixels. */
  readonly pointsize: number;
}

// ---------------------------------------------------------------------------
// Internal helper: `_Z22vectorscope_rasterizer(constant state_t*, half4)`
// Returns a %struct._rasterizer_data_t = { <4 x float> P, <4 x float> Cs,
// <2 x float> st, float ... } — the port matches AIR fields 0..2 (field 3
// is set in the *outer* shader after this helper returns).
//
// IR line map (helper body, %3..%62):
//   %3-%11:  extract half lanes 0,1,2 and fpext to float -> rgb (float3)
//   %12-%13: load state.rgb2ycc row0 (<3 x float>)   -> row_r
//   %14:     air.dot.v3f32(rgb, row_r) -> Y (luma)
//   %15-%16: load rgb2ycc row1 (row_g) ; %17 dot -> U (Cb-like)
//   %18:     insertelement U into lane 1 of a <3 x float>
//   %19-%20: load rgb2ycc row2 (row_b) ; %21 dot -> V (Cr-like)
//   %22:     insertelement V into lane 2 -> ycc = (undef, U, V)
//   %23:     air.fast_fmax(Y, 0.1) -> Y' (clamp Y to a floor of 0.1)
//   %24:     insertelement Y' into lane 0 of ycc -> ycc = (Y', U, V)
//   %25/%26: build vec4 = (U, V, 0.0, 1.0) — the "coordinate-in-chroma-plane"
//            vector fed to the MVP.
//   %27-%29: abs(U) + abs(V); %30 fcmp olt vs 0.1 (chroma dead-zone)
//   %31:     ycc-substitute lane 0 with 0.5 (a middle-gray luma when we're
//            close to the achromatic center) -> ycc_dead
//   %32:     select if in dead-zone -> ycc_dead else ycc'
//   %33-%48: load mvp rows 0..3, dot vec4 with each row -> P = mvp * vec4
//   %49-%60: load ycc2rgb rows 0..2, dot ycc' with each -> rgb_out (float3);
//            append a=1.0 -> Cs.rgb = rgb_out, Cs.a = 1.0
//   %61-%62: pack into _rasterizer_data_t = { P, Cs, st_from_outer?, ... }
//            Note: the helper's return only has fields 0 and 1 assigned in
//            the .ll (`insertvalue` at %61/%62); field 2 (st) is set by the
//            OUTER shader with a `%16 = extractvalue %10, 2` — reading a
//            POISON field. This is a benign LLVM under-specification (Metal
//            treats the poison as "don't care" — the outer shader stores it
//            into the vertex output st slot, which is then used only as a
//            fragment interpolant). We surface `st` as a passthrough of the
//            outer shader's own %7 (the per-vertex st that was sampled to
//            produce the half4 texel). Faithful to what the shader does
//            semantically: st_out == st_in.
// ---------------------------------------------------------------------------
interface RasterizerData {
  readonly P: [number, number, number, number];
  readonly Cs: [number, number, number, number];
  /** st is a POISON field in the helper's IR; carried through from the
   *  outer shader's per-vertex st (see helper doc comment above). */
  readonly stFromOuter: [number, number];
}

function vectorscope_rasterizer(
  state: VectorscopeStateT,
  texelHalf4: ShaderTexel,
  stOuter: readonly [number, number],
): RasterizerData {
  // %3-%11: extract RGB from the half4 texel, fpext to float. fp16->fp32
  // is lossless; the port uses the fp32 lanes from the caller's sampler
  // as-is (Math.fround preserves f32 fidelity if fp64 slips in).
  const r = Math.fround(texelHalf4[0]);   // %3-%5
  const g = Math.fround(texelHalf4[1]);   // %6-%8
  const b = Math.fround(texelHalf4[2]);   // %9-%11

  // %12-%14, %15-%17, %19-%21: three <3 x float> dot products of rgb with
  // rgb2ycc rows 0/1/2 -> Y, U, V.
  const [rr0, rr1, rr2] = state.rgb2ycc; // rows
  const Y = Math.fround(
    Math.fround(r * rr0[0]) + Math.fround(g * rr0[1]) + Math.fround(b * rr0[2]),
  ); // %14
  const U = Math.fround(
    Math.fround(r * rr1[0]) + Math.fround(g * rr1[1]) + Math.fround(b * rr1[2]),
  ); // %17
  const V = Math.fround(
    Math.fround(r * rr2[0]) + Math.fround(g * rr2[1]) + Math.fround(b * rr2[2]),
  ); // %21

  // %23: air.fast_fmax(Y, 0.1) — clamp luma floor to 0.1 (fp32 const
  // 0x3FB99999A0000000 = 0.1f).
  const YClamped = Math.fround(Math.max(Y, Math.fround(0.10000000149011612)));

  // %24: ycc = (YClamped, U, V)  -- stored, then possibly overwritten below
  // by the dead-zone branch.
  let yccX = YClamped;
  const yccY = U;   // (lane 1)
  const yccZ = V;   // (lane 2)

  // %25-%26: vec4 = (U, V, 0.0, 1.0) — chroma-plane coordinate for the MVP.
  const chroma4: [number, number, number, number] = [
    U, V, Math.fround(0.0), Math.fround(1.0),
  ];

  // %27-%30: fcmp olt (fast_fabs(U) + fast_fabs(V)) < 0.1 — is the sample
  // near the achromatic center of the chroma plane?
  const chromaMagnitude = Math.fround(
    Math.fround(Math.abs(V)) + Math.fround(Math.abs(U)),
  );
  const inDeadZone: boolean = chromaMagnitude < Math.fround(0.10000000149011612);

  // %31/%32: if in dead-zone, replace ycc.x with 0.5 (mid-gray luma) so
  // the achromatic-cluster points aren't buried by the ycc2rgb transform.
  if (inDeadZone) {
    yccX = Math.fround(0.5);
  }

  const ycc: [number, number, number] = [yccX, yccY, yccZ];

  // %33-%48: P = mvp * chroma4 (row-vector dot with each row).
  const [mr0, mr1, mr2, mr3] = state.mvp;
  const Px = Math.fround(
    Math.fround(chroma4[0] * mr0[0]) +
      Math.fround(chroma4[1] * mr0[1]) +
      Math.fround(chroma4[2] * mr0[2]) +
      Math.fround(chroma4[3] * mr0[3]),
  ); // %35
  const Py = Math.fround(
    Math.fround(chroma4[0] * mr1[0]) +
      Math.fround(chroma4[1] * mr1[1]) +
      Math.fround(chroma4[2] * mr1[2]) +
      Math.fround(chroma4[3] * mr1[3]),
  ); // %39
  const Pz = Math.fround(
    Math.fround(chroma4[0] * mr2[0]) +
      Math.fround(chroma4[1] * mr2[1]) +
      Math.fround(chroma4[2] * mr2[2]) +
      Math.fround(chroma4[3] * mr2[3]),
  ); // %43
  const Pw = Math.fround(
    Math.fround(chroma4[0] * mr3[0]) +
      Math.fround(chroma4[1] * mr3[1]) +
      Math.fround(chroma4[2] * mr3[2]) +
      Math.fround(chroma4[3] * mr3[3]),
  ); // %47

  // %49-%60: Cs.rgb = ycc2rgb * ycc  (row-vector dot with each row).
  const [yr0, yr1, yr2] = state.ycc2rgb;
  const Cr = Math.fround(
    Math.fround(ycc[0] * yr0[0]) +
      Math.fround(ycc[1] * yr0[1]) +
      Math.fround(ycc[2] * yr0[2]),
  ); // %51
  const Cg = Math.fround(
    Math.fround(ycc[0] * yr1[0]) +
      Math.fround(ycc[1] * yr1[1]) +
      Math.fround(ycc[2] * yr1[2]),
  ); // %54
  const Cb = Math.fround(
    Math.fround(ycc[0] * yr2[0]) +
      Math.fround(ycc[1] * yr2[1]) +
      Math.fround(ycc[2] * yr2[2]),
  ); // %57

  // %58-%60: build (Cr, Cg, Cb, 1.0) — Cs with alpha=1.0.
  // (The outer shader overwrites lane 3 with a smoothstep of `brightness`.)
  return {
    P: [Px, Py, Pz, Pw],
    Cs: [Cr, Cg, Cb, Math.fround(1.0)],
    stFromOuter: [stOuter[0], stOuter[1]],
  };
}

/**
 * `@vectorscope_vertex_shader` — Flexo Metal vertex shader.
 *
 * Faithful transcription of the .ll body; see file header + IR line map on
 * the helper. Semantics summary:
 *   1. Read per-vertex st[idx] (float2).
 *   2. Sample video texture at st -> half4 texel.
 *   3. Rasterize: transform RGB -> YCC, apply a chroma-dead-zone luma
 *      substitution near achromatic center, project chroma coord through
 *      state.mvp to get clip pos P, transform ycc back through state.ycc2rgb
 *      to get Cs.rgb.
 *   4. If state.monochrome is true, force Cs.rgb to (1,1,1); otherwise keep
 *      the rasterizer's Cs.rgb.
 *   5. Compute Cs.a from a smoothstep-like curve on state.brightness:
 *        x = clamp(brightness, 0, 1)
 *        Cs.a = x*x * 0.257 * (3 - 2*x) + 0.0331
 *   6. Return { P, Cs, st, pointsize } with st passed through and pointsize
 *      = state.pointsize.
 */
export function vectorscope_vertex_shader(
  idx: number,
  st: readonly (readonly [number, number])[],
  state: VectorscopeStateT,
  te: unknown,
  sample: ShaderSampler2D,
): VectorscopeVertexOut {
  // %5 = zext i32 %0 to i64. u32 semantics.
  const i = idx >>> 0;

  // %6/%7 = load st[idx] (float2).
  const stVertex: readonly [number, number] = st[i];

  // %8/%9 = air.sample_texture_2d.v4f16(tex, sampler, uv=st) -> half4.
  const texelHalf4: ShaderTexel = sample(te, stVertex);

  // %10 = tail call vectorscope_rasterizer(state, texelHalf4).
  //   returns { P (=field 0), Cs.rgb+1 (=field 1), st-slot-poison (=field 2) }
  const rast = vectorscope_rasterizer(state, texelHalf4, stVertex);

  // %11 = extractvalue rast, 1  -> Cs.rgba (with a=1.0 from helper).
  const csFromRast: [number, number, number, number] = [
    rast.Cs[0], rast.Cs[1], rast.Cs[2], rast.Cs[3],
  ];

  // %12/%13/%14 = load state.monochrome (i8), icmp eq 0. i.e. "not monochrome".
  const monoIsZero: boolean = state.monochrome === false;

  // %15 = select monoIsZero ? %11 : <1.0, 1.0, 1.0, poison>
  // (i.e. NOT monochrome -> use helper's Cs; monochrome -> force to white).
  const cs015: [number, number, number, number] = monoIsZero
    ? csFromRast
    : [Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), /*lane3 poison*/ csFromRast[3]];

  // %16 = extractvalue rast, 2  -> st (see helper doc: poison in IR; port
  // passes the outer shader's per-vertex st through, which matches how the
  // fragment stage would consume the interpolant).
  const stOut: [number, number] = [rast.stFromOuter[0], rast.stFromOuter[1]];

  // %17 = extractvalue rast, 0  -> P (clip-space).
  const P: [number, number, number, number] = [
    rast.P[0], rast.P[1], rast.P[2], rast.P[3],
  ];

  // %18/%19 = load state.brightness (float). %20 = fast_clamp(x, 0, 1).
  const bClamped = Math.fround(
    Math.min(Math.max(state.brightness, Math.fround(0.0)), Math.fround(1.0)),
  );

  // %21-%26: smoothstep-like curve on `bClamped`:
  //   %21 = bClamped * 2                                  (2x)
  //   %22 = 3 - %21                                       (3 - 2x)
  //   %23 = bClamped * bClamped                           (x*x)
  //   %24 = %23 * 0.257f  (fp32 @ 0x3FD072B020000000)
  //   %25 = %24 * %22                                     (x*x * 0.257 * (3-2x))
  //   %26 = %25 + 0.0331f (fp32 @ 0x3FA0F27BC0000000)     (+ bias)
  const two_x     = Math.fround(bClamped * Math.fround(2.0));                // %21
  const three_2x  = Math.fround(Math.fround(3.0) - two_x);                    // %22
  const xx        = Math.fround(bClamped * bClamped);                         // %23
  const xx_257    = Math.fround(xx * Math.fround(0.25699999928474426));       // %24
  const xx_257_32 = Math.fround(xx_257 * three_2x);                           // %25
  const alpha     = Math.fround(xx_257_32 + Math.fround(0.03310000151395798)); // %26

  // %27 = insertelement %15 (Cs.rgb possibly forced to white), alpha, i64 3.
  const Cs: [number, number, number, number] = [
    cs015[0], cs015[1], cs015[2], alpha,
  ];

  // %28/%29 = load state.pointsize (float @ +160).
  const pointsize = Math.fround(state.pointsize);

  // %30-%33: pack into <{ P, Cs, st, pointsize }> and return.
  return { P, Cs, st: stOut, pointsize };
}
