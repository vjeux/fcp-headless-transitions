// @shader vectorscope_bg_pass_vertex_shader (Flexo) — .ll header offset @0x00000000004bf0
//
// Metal VERTEX shader from Flexo's scope-rendering library. Emits one
// vertex per sample of the source image, mapped from RGB into the
// vectorscope's chroma-plane coordinates and transformed by the MVP.
// This is the "background pass" — the fragment color output (Cs) is
// a fixed dim gray constant rather than the per-sample chroma color;
// a separate "fg pass" shader drives the colored trace.
//
// Source LLVM IR: raw-port/re/shaders/vectorscope_bg_pass_vertex_shader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/
//                   default.metallib
// (via `bash raw-port/tools/shader_disasm.sh
//        vectorscope_bg_pass_vertex_shader Flexo`)
//
// AIR signature (from the .ll):
//   define <{ <4xfloat>, <4xfloat>, <2xfloat>, float }>
//     @vectorscope_bg_pass_vertex_shader(
//       i32                       %0,  // idx = air.vertex_id
//       <2 x float>*              %1,  // st (constant, per-vertex sample uv)
//       vectorscope_state_t*      %2,  // state (constant, 176B)
//       texture2d                 %3   // te (half4)
//     )
//
// Output struct fields (per air.vertex metadata !16):
//   0: position P    <4xfloat>  — MVP-transformed clip position
//   1: Cs (color)    <4xfloat>  — bg-pass constant <0.086, 0.086, 0.086, 1>
//   2: st (texcoord) <2xfloat>  — passed through from rasterizer (poison)
//   3: pointsize     float      — from state.pointsize
//
// air.struct_type_info spelled out in metadata !25 for the state struct:
//   struct vectorscope_state_t {
//     float4x4 mvp;          //  @0..64
//     float3x3 rgb2ycc;      //  @64..112  (three <3xfloat> rows, each in
//                            //             a 16B slot; C++ metal::matrix<f,3,3>)
//     float3x3 ycc2rgb;      //  @112..160
//     float    pointsize;    //  @160
//     float    brightness;   //  @164  (unused by this shader)
//     bool     monochrome;   //  @168  (unused by this shader)
//   };  // 176 bytes total (align 16)
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`,
// `air.compile.denorms_disable`, `air.compile.fast_math_enable` — Metal
// fast-math. This port uses plain JS Number arithmetic (already IEEE-754
// fp64) narrowed with Math.fround at every stored intermediate for f32.
//
// Constants decoded from the .ll:
//   0x3FB61615E0000000 -> 0.08627449721097946 (bit-exact f32; ≈ 22/255)
//     — the RGBA background color: {this, this, this, 1.0}
//   0x3FB99999A0000000 -> 0.10000000149011612 (bit-exact f32)
//     — the luma threshold used by the rasterizer helper's:
//         * fast_fmax(yccY, 0.1) luma clamp on lane 0 of ycc
//         * `if (|Cb| + |Cr| < 0.1) ycc.lane0 = 0.5` chroma-mux
//
// The rasterizer helper (`_Z22vectorscope_rasterizerP...`) turns a
// half4 pixel color into (position, color, ..., ...) — of its four
// output fields the .ll only writes fields 0 (P) and 1 (Cs). Fields
// 2 (st) and 3 (pointsize) are left poison. The outer shader reads
// field 2 (poison) into the returned st, overrides field 1 with the
// bg-pass color constant, and fills field 3 with state.pointsize.
//
// IR line map for @vectorscope_bg_pass_vertex_shader:
//   %5  zext idx (i32 -> i64)                        -> idx64
//   %6  gep <2xf32>* %1, idx64                       -> &st[idx]
//   %7  load <2xf32> from %6                         -> uv
//   %8  air.sample_texture_2d.v4f16(tex,
//         @__air_sampler_state, uv, i1 true,
//         zero offset, i1 false, 0.0, 0.0, i32 0)    -> {half4Pixel, status}
//   %9  extractvalue %8, 0                           -> pixelHalf4
//   %10 tail call fastcc vectorscope_rasterizer(state, pixelHalf4)
//                                                    -> rasterOut
//   %11 extractvalue %10, 0                          -> P (position)
//   %12 extractvalue %10, 2                          -> st  (poison — the
//                                                       rasterizer never
//                                                       writes field 2)
//   %13 gep state, field 3 = pointsize @160
//   %14 load pointsize
//   %15..%18 insertvalue chain builds the output struct:
//     field 0 = P
//     field 1 = <0x3FB61615E0000000, ..., 1.0>  (bg color)
//     field 2 = st (poison-passthrough)
//     field 3 = pointsize
//   ret struct %18
//
// IR line map for @vectorscope_rasterizer (internal fastcc):
//   %3..%11 fpext <4xhalf> -> pack into <3xfloat> pixelRGB
//                                (lane 3 of the half4 alpha is discarded)
//   %12..%13 load rgb2ycc row 0
//   %14 air.dot.v3f32(pixelRGB, row0)                -> yccY
//   %15..%16 load rgb2ycc row 1
//   %17 air.dot.v3f32(pixelRGB, row1)                -> yccCb
//   %18 <3xf32>{?, yccCb, ?}
//   %19..%20 load rgb2ycc row 2
//   %21 air.dot.v3f32(pixelRGB, row2)                -> yccCr
//   %22 <3xf32>{?, yccCb, yccCr}
//   %23 air.fast_fmax.f32(yccY, 0.1)                 -> yccY_clamp
//   %24 <3xf32>{yccY_clamp, yccCb, yccCr}            -> yccClamped
//   %25 <4xf32>{yccCb, ?, 0.0, 1.0}                  (position input build)
//   %26 <4xf32>{yccCb, yccCr, 0.0, 1.0}              -> posIn (Cb=x, Cr=y)
//   %27 air.fast_fabs.f32(yccCb)                     -> |Cb|
//   %28 air.fast_fabs.f32(yccCr)                     -> |Cr|
//   %29 |Cb| + |Cr|
//   %30 fcmp fast olt (|Cb|+|Cr|), 0.1               -> lowChroma?
//   %31 <3xf32>{0.5, yccCb, yccCr}                   -> yccMuxed_lo
//   %32 select lowChroma, yccMuxed_lo, yccClamped    -> yccMuxed
//   %33..%48 mvp * posIn:
//     %35 = dot(posIn, mvp[0]), %39 = dot(posIn, mvp[1]),
//     %43 = dot(posIn, mvp[2]), %47 = dot(posIn, mvp[3])
//     -> P = {mvp0·p, mvp1·p, mvp2·p, mvp3·p}
//   %49..%57 ycc2rgb * yccMuxed:
//     %51 = dot(yccMuxed, ycc2rgb[0]),
//     %54 = dot(yccMuxed, ycc2rgb[1]),
//     %57 = dot(yccMuxed, ycc2rgb[2])
//     -> Cs = {r, g, b, 1.0}
//   %61 insertvalue rasterOut poison, P, 0
//   %62 insertvalue %61, Cs, 1     (fields 2 and 3 left poison)
//   ret %62
//
// Note the outer shader OVERWRITES field 1 with the constant bg color, so
// the rasterizer's Cs contribution is discarded here. We still transcribe
// the rasterizer faithfully — it matches the .ll and is what a bit-exact
// f32 oracle would emit. (LLVM keeps the whole Cs computation because
// the rasterizer signature returns the struct; a JS engine will DCE
// the unused portion once the outer shader inlines and drops it.)

/**
 * One RGBA half-precision texel produced by
 * `air.sample_texture_2d.v4f16` at the vertex's `st[idx]` uv.
 *
 * Modeled as a length-4 tuple of numbers. Callers are responsible for
 * converting from half to whatever precision they want; the fpext
 * happens inside the rasterizer helper.
 */
export type ShaderHalfTexel = [number, number, number, number];

/**
 * Caller-supplied texture sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f16(tex, sampler, uv, ...)` intrinsic. The
 * shader uses the built-in @__air_sampler_state sampler.
 */
export type ShaderSampler2DHalf = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderHalfTexel;

/**
 * The vectorscope state struct as laid out in the .ll metadata !25.
 *
 * Matrices are stored row-major here — the .ll accesses each row via
 * `[i32 0, i32 <field>, i32 0, i64 <row>]` and dots the loaded <Nxf32>
 * against the vertex's vector. So `mvp[r]` is the r-th ROW of the MVP.
 */
export interface VectorscopeState {
  /** float4x4 MVP; four rows of <4xf32>. Offset @0..64. */
  readonly mvp: readonly [
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
    readonly [number, number, number, number],
  ];
  /** float3x3 rgb->ycc; three rows of <3xf32>. Offset @64..112. */
  readonly rgb2ycc: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
  ];
  /** float3x3 ycc->rgb; three rows of <3xf32>. Offset @112..160. */
  readonly ycc2rgb: readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
  ];
  /** GL_POINT_SIZE analog. Offset @160. */
  readonly pointsize: number;
  /** Unused by this shader. Offset @164. */
  readonly brightness: number;
  /** Unused by this shader. Offset @168 (i8). */
  readonly monochrome: boolean;
}

/**
 * The rasterizer_data_t struct returned by the internal fastcc helper.
 * Only fields P and Cs are populated by the rasterizer; st and pointsize
 * are left poison (LLVM `undef`). We model poison as NaN so a downstream
 * consumer that trusts it will see IEEE-NaN propagation.
 */
export interface VectorscopeRasterizerOut {
  /** field 0 — P, clip-space position (MVP * <Cb, Cr, 0, 1>). */
  readonly P: [number, number, number, number];
  /** field 1 — Cs, per-sample color (ycc2rgb * yccMuxed, alpha 1). */
  readonly Cs: [number, number, number, number];
  /** field 2 — st, left poison by the rasterizer (NaN, NaN). */
  readonly st: [number, number];
  /** field 3 — pointsize, left poison by the rasterizer (NaN). */
  readonly pointsize: number;
}

/**
 * The vertex output struct emitted by
 * `@vectorscope_bg_pass_vertex_shader`. Mirrors the .ll's
 * `<{ <4xfloat>, <4xfloat>, <2xfloat>, float }>` layout.
 */
export interface VectorscopeVertexOut {
  /** field 0 — P (position), from rasterizer. */
  readonly P: [number, number, number, number];
  /** field 1 — Cs (color), the bg-pass constant. */
  readonly Cs: [number, number, number, number];
  /** field 2 — st (texcoord), passed through from rasterizer (poison). */
  readonly st: [number, number];
  /** field 3 — pointsize, from state.pointsize. */
  readonly pointsize: number;
}

/**
 * Luma threshold used by the rasterizer's fmax-clamp and chroma-mux.
 * Decoded from the .ll double literal 0x3FB99999A0000000 —
 * 0.10000000149011612 (bit-exact f32).
 */
const VS_LUMA_THRESHOLD: number = Math.fround(0.10000000149011612);

/**
 * Background-pass dim-gray color, decoded from the .ll double literal
 * 0x3FB61615E0000000 — 0.08627449721097946 (bit-exact f32; ≈ 22/255).
 */
const VS_BG_COLOR_CHANNEL: number = Math.fround(0.08627449721097946);

/**
 * Internal `_Z22vectorscope_rasterizer...` fastcc helper. Exported for
 * testability. See file header for the IR-line-to-code map.
 */
export function vectorscopeRasterizer(
  state: VectorscopeState,
  pixelHalf4: ShaderHalfTexel,
): VectorscopeRasterizerOut {
  // %3..%11 = fpext half -> float, packed into <3xfloat> pixelRGB.
  //   The alpha lane (half %1[3]) is loaded but never used, matching the
  //   .ll which never reads it after the shufflevector to <3xfloat>.
  //   JS Numbers are already fp64; Math.fround narrows the promoted value
  //   to f32. Half-precision inputs from the caller are provided as JS
  //   numbers (already fp32-widened) — we re-fround defensively.
  const pR: number = Math.fround(pixelHalf4[0]);
  const pG: number = Math.fround(pixelHalf4[1]);
  const pB: number = Math.fround(pixelHalf4[2]);
  // pixelHalf4[3] (alpha) is loaded but unused by the .ll.

  // %12..%14 = dot(pixelRGB, rgb2ycc[0]) -> yccY
  const r0 = state.rgb2ycc[0];
  const yccY: number = Math.fround(
    Math.fround(Math.fround(pR * Math.fround(r0[0])) + Math.fround(pG * Math.fround(r0[1])))
      + Math.fround(pB * Math.fround(r0[2])),
  );
  // %15..%17 = dot(pixelRGB, rgb2ycc[1]) -> yccCb
  const r1 = state.rgb2ycc[1];
  const yccCb: number = Math.fround(
    Math.fround(Math.fround(pR * Math.fround(r1[0])) + Math.fround(pG * Math.fround(r1[1])))
      + Math.fround(pB * Math.fround(r1[2])),
  );
  // %19..%21 = dot(pixelRGB, rgb2ycc[2]) -> yccCr
  const r2 = state.rgb2ycc[2];
  const yccCr: number = Math.fround(
    Math.fround(Math.fround(pR * Math.fround(r2[0])) + Math.fround(pG * Math.fround(r2[1])))
      + Math.fround(pB * Math.fround(r2[2])),
  );

  // %23 = air.fast_fmax.f32(yccY, 0.1). Under fast-math (no-nans) fmax
  //       collapses to Math.max on ordered inputs.
  const yccY_clamp: number = Math.fround(Math.max(yccY, VS_LUMA_THRESHOLD));
  // %22 (pre-%24) = <3xf32>{?, yccCb, yccCr}. Then
  // %24 = insertelement %22, yccY_clamp, i64 0 -> yccClamped.
  const yccClamped: [number, number, number] = [yccY_clamp, yccCb, yccCr];

  // %25..%26 = <4xf32>{yccCb, yccCr, 0.0, 1.0} -> posIn (Cb=x, Cr=y).
  const posIn: [number, number, number, number] = [yccCb, yccCr, Math.fround(0.0), Math.fround(1.0)];

  // %27..%29 = |yccCb| + |yccCr|
  const absCb: number = Math.fround(Math.abs(yccCb));
  const absCr: number = Math.fround(Math.abs(yccCr));
  const chromaMag: number = Math.fround(absCr + absCb);
  // %30 = fcmp fast olt chromaMag, 0.1
  //   Ordered < in JS: `x < y` is false for NaN, matching AIR `olt`.
  const lowChroma: boolean = chromaMag < VS_LUMA_THRESHOLD;

  // %31 = <3xf32>{0.5, yccCb, yccCr}                  (insert 0.5 at lane 0
  //                                                    of yccClamped)
  // %32 = select lowChroma, %31, yccClamped
  const yccMuxed: [number, number, number] = lowChroma
    ? [Math.fround(0.5), yccCb, yccCr]
    : yccClamped;

  // %33..%48 = mvp * posIn (row-major dot with each row).
  const m0 = state.mvp[0];
  const m1 = state.mvp[1];
  const m2 = state.mvp[2];
  const m3 = state.mvp[3];
  const P0: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(posIn[0] * Math.fround(m0[0])) + Math.fround(posIn[1] * Math.fround(m0[1])))
        + Math.fround(posIn[2] * Math.fround(m0[2])),
    ) + Math.fround(posIn[3] * Math.fround(m0[3])),
  );
  const P1: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(posIn[0] * Math.fround(m1[0])) + Math.fround(posIn[1] * Math.fround(m1[1])))
        + Math.fround(posIn[2] * Math.fround(m1[2])),
    ) + Math.fround(posIn[3] * Math.fround(m1[3])),
  );
  const P2: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(posIn[0] * Math.fround(m2[0])) + Math.fround(posIn[1] * Math.fround(m2[1])))
        + Math.fround(posIn[2] * Math.fround(m2[2])),
    ) + Math.fround(posIn[3] * Math.fround(m2[3])),
  );
  const P3: number = Math.fround(
    Math.fround(
      Math.fround(Math.fround(posIn[0] * Math.fround(m3[0])) + Math.fround(posIn[1] * Math.fround(m3[1])))
        + Math.fround(posIn[2] * Math.fround(m3[2])),
    ) + Math.fround(posIn[3] * Math.fround(m3[3])),
  );

  // %49..%57 = ycc2rgb * yccMuxed
  const y0 = state.ycc2rgb[0];
  const y1 = state.ycc2rgb[1];
  const y2 = state.ycc2rgb[2];
  const Cr_: number = Math.fround(
    Math.fround(Math.fround(yccMuxed[0] * Math.fround(y0[0])) + Math.fround(yccMuxed[1] * Math.fround(y0[1])))
      + Math.fround(yccMuxed[2] * Math.fround(y0[2])),
  );
  const Cg_: number = Math.fround(
    Math.fround(Math.fround(yccMuxed[0] * Math.fround(y1[0])) + Math.fround(yccMuxed[1] * Math.fround(y1[1])))
      + Math.fround(yccMuxed[2] * Math.fround(y1[2])),
  );
  const Cb_: number = Math.fround(
    Math.fround(Math.fround(yccMuxed[0] * Math.fround(y2[0])) + Math.fround(yccMuxed[1] * Math.fround(y2[1])))
      + Math.fround(yccMuxed[2] * Math.fround(y2[2])),
  );

  // %58..%60 = <4xf32>{Cr_, Cg_, Cb_, 1.0} -> Cs
  // %61..%62 = insertvalue rasterOut { P, Cs, poison, poison }
  //   Poison fields are modeled as NaN so a downstream reader sees IEEE
  //   NaN propagation instead of an unrelated JS value.
  return {
    P: [P0, P1, P2, P3],
    Cs: [Cr_, Cg_, Cb_, Math.fround(1.0)],
    st: [Number.NaN, Number.NaN],
    pointsize: Number.NaN,
  };
}

/**
 * `@vectorscope_bg_pass_vertex_shader` — Flexo Metal vertex shader.
 *
 * See file header for the full IR-line-to-code map.
 *
 * @param idx     air.vertex_id (i32)
 * @param stBuf   constant buffer of per-vertex float2 uvs (index by idx)
 * @param state   vectorscope_state_t (mvp/rgb2ycc/ycc2rgb/pointsize/...)
 * @param te      opaque texture2d<half, sample> passed to `sample`
 * @param sample  caller-supplied half-precision sample callback
 * @returns       the vertex output struct
 */
export function vectorscope_bg_pass_vertex_shader(
  idx: number,
  stBuf: ReadonlyArray<readonly [number, number]>,
  state: VectorscopeState,
  te: unknown,
  sample: ShaderSampler2DHalf,
): VectorscopeVertexOut {
  // %5 = zext idx (i32 -> i64). JS ints are already 53-bit; treat as-is.
  const idx64: number = idx >>> 0;
  // %6/%7 = load st[idx] as <2xf32>
  const uvRaw = stBuf[idx64];
  const uv: [number, number] = [Math.fround(uvRaw[0]), Math.fround(uvRaw[1])];

  // %8/%9 = air.sample_texture_2d.v4f16(te, @__air_sampler_state, uv, ...)
  const pixelHalf4: ShaderHalfTexel = sample(te, uv);

  // %10 = fastcc call vectorscope_rasterizer(state, pixelHalf4)
  const rasterOut: VectorscopeRasterizerOut = vectorscopeRasterizer(state, pixelHalf4);

  // %11 = extractvalue %10, 0 -> P
  const P: [number, number, number, number] = [
    rasterOut.P[0],
    rasterOut.P[1],
    rasterOut.P[2],
    rasterOut.P[3],
  ];
  // %12 = extractvalue %10, 2 -> st (poison from rasterizer)
  const stOut: [number, number] = [rasterOut.st[0], rasterOut.st[1]];

  // %13/%14 = load state.pointsize (@160)
  const pointsize: number = Math.fround(state.pointsize);

  // %15..%18 = build the output struct.
  //   field 1 (Cs) is overridden with the bg-pass constant color
  //   <VS_BG_COLOR_CHANNEL, VS_BG_COLOR_CHANNEL, VS_BG_COLOR_CHANNEL, 1.0>.
  const Cs: [number, number, number, number] = [
    VS_BG_COLOR_CHANNEL,
    VS_BG_COLOR_CHANNEL,
    VS_BG_COLOR_CHANNEL,
    Math.fround(1.0),
  ];

  // ret struct
  return { P, Cs, st: stOut, pointsize };
}
