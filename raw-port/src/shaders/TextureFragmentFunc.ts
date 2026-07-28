// Faithful transcription @0x00000000000244e6 (metallib entry offset)
// @shader TextureFragmentFunc (MDPKit)
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/TextureFragmentFunc.ll, extracted via
// raw-port/tools/shader_disasm.sh from MDPKit.framework/Versions/A/Resources/
// default.metallib. The .ll header line reads
// `0x000000000244e6 -- TextureFragmentFunc:` — the shader's entry offset in the metallib.
// Compile options: `air.compile.denorms_disable`, `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. Function attributes carry
// `unsafe-fp-math=true`, `no-infs-fp-math=true`, `no-nans-fp-math=true`,
// `no-signed-zeros-fp-math=true`, `approx-func-fp-math=true`. Per SHADERS.md the
// fast-math flags do NOT license algebraic re-association here — the single `fmul` is a
// direct TS mapping and every fp32 lane is fp32-narrowed via `Math.fround`.
//
// This is a FRAGMENT shader (from `!air.fragment` metadata) with a colour output
// (`!31 = air.render_target, 0, 0 ; air.arg_type_name "float4" ; air.arg_name "color"`).
// It renders a plain textured line/quad with a vertex-interpolated tint — one texture
// sample multiplied by the vertex colour, no premultiply/gamma/coverage math (that path
// lives in the sibling `AAStippledLineFragmentFunc`).
//
// Fragment signature (from !33..!37):
//   position  : float4                          air.position        (`air.arg_unused`).
//   color     : float4                          air.fragment_input  — vertex tint.
//   texCoord  : float2                          air.fragment_input  — texture UV.
//   tex       : texture2d<float, sample>        index 3.
//   texSampler: sampler                         index 4.
//   output    : float4                          air.render_target.
//
// AIR intrinsic used (only one):
//   air.sample_texture_2d.v4f32(tex, texSampler, texCoord, offset_valid=true, <0,0>,
//                                bias_valid=false, 0.0, 0.0, i32 0)
//                                                 -> { <4 x float> rgba, i8 stat }.
// The extra i8 status lane is destructured off and discarded by `extractvalue ..., 0`.
// The offset/bias/lod args are opaque to the callback (the caller is expected to bind
// whatever FCP would have bound).
//
// FULL IR BODY (five instructions total):
//   %6 = tail call { <4 x float>, i8 } @air.sample_texture_2d.v4f32(
//          %3 tex, %4 sampler, %2 texCoord, i1 true, <2 x i32> zero, i1 false,
//          float 0.0, float 0.0, i32 0)
//   %7 = extractvalue { <4 x float>, i8 } %6, 0                                 ; sample.rgba
//   %8 = fmul fast <4 x float> %7, %1                                           ; * vertColor
//   %9 = insertvalue <{ <4 x float> }> undef, <4 x float> %8, 0                 ; wrap struct
//   ret <{ <4 x float> }> %9
//
// The `fmul` is componentwise on `<4 x float>` — a per-lane fp32 multiply. Under
// fp32-narrowing that is `Math.fround(sampled.r * color[0])` for each lane. No memory
// side effects (`readonly` attribute), no branches.
//
// FRONTIER: `air.sample_texture_2d.v4f32` is a host GPU-runtime bridge — the
// transcription takes it as a callback.

/** Mutating accumulator for a `<4 x float>` value — avoids tuple returns per SHADERS.md. */
export interface RgbaOut {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Callback for `air.sample_texture_2d.v4f32(tex, texSampler, uv, offset_valid=1,
 * <0,0>, bias_valid=0, 0.0, 0.0, i32 0)`. The offset/bias/lod args are opaque to the
 * caller; the callback should honour whatever FCP's runtime bound. Writes into `out`.
 */
export type SampleColor2D<T> = (
  texture: T,
  u: number,
  v: number,
  out: RgbaOut,
) => void;

/**
 * Fragment shader `TextureFragmentFunc`.
 *
 * Samples a `texture2d<float, sample>` at `texCoord` with a bound sampler, multiplies
 * componentwise by the vertex-interpolated `color`, and writes the result to the
 * render target. No premultiply, no gamma, no coverage math — that path lives in the
 * sibling `AAStippledLineFragmentFunc` in the same MDPKit translation unit.
 *
 * The `position` argument is bound but tagged `air.arg_unused`; the shader body reads
 * only `%1..%4`. Every fp32 lane in the componentwise multiply is fp32-narrowed via
 * `Math.fround`.
 *
 * Writes the result into `out` (mutating accumulator, per SHADERS.md).
 *
 * @shader TextureFragmentFunc (MDPKit)
 */
export function TextureFragmentFunc<TTex>(
  _position: [number, number, number, number],
  color: [number, number, number, number],
  texCoord: [number, number],
  tex: TTex,
  sampleColor: SampleColor2D<TTex>,
  out: RgbaOut,
): void {
  // %6 / %7 — sample the texture. The extra i8 status lane emitted by the intrinsic is
  // dropped by `extractvalue ..., 0`; the callback only writes the rgba into `sampled`.
  const sampled: RgbaOut = { r: 0, g: 0, b: 0, a: 0 };
  sampleColor(tex, texCoord[0], texCoord[1], sampled);

  // %8 — componentwise fp32 multiply: `sampled * color`.
  out.r = Math.fround(sampled.r * color[0]);
  out.g = Math.fround(sampled.g * color[1]);
  out.b = Math.fround(sampled.b * color[2]);
  out.a = Math.fround(sampled.a * color[3]);
  // %9 / ret — wrap into `<{ <4 x float> }>` and return. In TS the mutating `out`
  // accumulator IS the return path; no wrapper struct needed.
}
