// debug_vertex_shader.ts — waveform-debug vertex shader: transforms a 2D per-vertex
// position by an MVP matrix (with a -1.0 XY bias for NDC placement) and passes a
// sampled RGB from a helper texture as the vertex color.
//
// @shader debug_vertex_shader (Flexo)
// Source IR: raw-port/re/shaders/debug_vertex_shader.ll
// Compiled from: Flexo.framework/Versions/A/Resources/default.metallib @0x0000000000e560
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <4 x float>, <2 x float>, float }>
//     @debug_vertex_shader(
//         i32                          %0 = vertex_id "idx"                    (!22)
//       , <2 x float> addrspace(2)*    %1 = per-vertex position buffer "st"    (!23)
//       , waveform_state_t addrspace(2)* %2 = per-frame uniform state "state"  (!24)
//       , texture2d<half>              %3 = helper texture "te"                (!26)
//     )
// Vertex outputs (!16):
//   slot 0 : air.position       float4 "P"          — clip-space position
//   slot 1 : air.vertex_output  float4 "Cs"         — vertex color (from texture sample)
//   slot 2 : air.vertex_output  float2 "st"         — never written (undef)
//   slot 3 : air.point_size     float               — never written (undef)
//
// waveform_state_t struct layout (from !25 struct_type_info):
//   +0x000  float4x4  mvp          (16 floats, column-major)
//   +0x040  float3x3  rgb2ycc      (padded — %"struct.metal::matrix.0" layout)
//   +0x070  float3x3  ycc2rgb      (padded)
//   +0x0a0  float     brightness
//   +0x0a4  bool      monochrome
//   +0x0a5  [11 x i8] padding
//   +0x0b0  float4    Cs
//   +0x0c0  uint      computation
//   +0x0c4  [12 x i8] padding
//   total size: 208 bytes (matches !24 air.arg_type_size = 208)
//
// This shader only reads state->mvp[0..3] (%12, %16, %20, %24 GEPs into i32 0, i32 0, i32 0, i64 K).
// It does NOT touch rgb2ycc, ycc2rgb, brightness, monochrome, Cs, or computation.
//
// The sampler is a compiler-baked global `__air_sampler_state` (see the .ll — `[2 x i64]
// [i64 34901797601020489, i64 0]`); it is NOT passed as a shader argument, so no sampler param
// appears in our TS signature. We model the texture sample as a callback (matches the
// SHADERS.md convention) and let the caller worry about which sampler state to use.
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros +
// approx-func-fp-math + fast_math_enable (fp32-narrowed). All ops here are `air.dot.v4f32`
// (bit-exact under fast-math) or scalar float lane operations — plain JS float ops with
// Math.fround work correctly.

/**
 * Return value mirrors the IR output-struct order:
 *   { position: float4, color: float4, st: undefined, pointSize: undefined }
 * `st` and `pointSize` are never inserted into the output struct (see %40/%41 — only slots
 * 0 and 1 are set), so they stay `undef` in Metal and `undefined` in TS.
 */
export interface DebugVertexOutput {
  /** slot 0 — air.position "P" (clip-space; XY has a -1.0 bias applied AFTER the MVP transform). */
  position: [number, number, number, number];
  /** slot 1 — vertex color "Cs" (RGB from sampled texture, half→float; alpha hard-coded to 1.0). */
  color: [number, number, number, number];
  /** slot 2 — "st" texcoord passthrough. NEVER WRITTEN by this shader (%40/%41 skip slot 2). */
  st: undefined;
  /** slot 3 — "pointsize". NEVER WRITTEN by this shader (%40/%41 skip slot 3). */
  pointSize: undefined;
}

/**
 * Sample callback shape (matches the SHADERS.md convention). Returns half4 → we widen
 * to float4 lane-by-lane via fpext in the IR (%32/%34/%36 in the .ll).
 * The half-precision sample IS lossy — the caller's sample() may either return a full-precision
 * result (and let the fpext become a bit-exact round-trip since half fits in float) or return
 * pre-narrowed halves as floats. Either way, we do NOT re-narrow: the IR promotes half→float
 * without any further quantization.
 */
export type SampleTexture2DHalf = (
  tex: unknown,
  uv: readonly [number, number],
) => [number, number, number, number];

/**
 * @shader debug_vertex_shader (Flexo) — faithful port of the AIR IR.
 *
 * @param idx        Vertex index (%0, i32 vertex_id).
 * @param st_buffer  Per-vertex "st" buffer (%1). Layout: pairs of float32 [s, t] per vertex.
 * @param state      The waveform_state_t uniform block (%2). This TS port only reads state.mvp.
 * @param te_texture Helper texture handle (%3) — opaque to us; passed to `sample`.
 * @param sample     Texture sampling callback (see @air.sample_texture_2d.v4f16 in the IR).
 */
export function debug_vertex_shader(
  idx: number,
  st_buffer: Float32Array,
  state: { mvp: Float32Array },
  te_texture: unknown,
  sample: SampleTexture2DHalf,
): DebugVertexOutput {
  // %5 = zext i32 %0 to i64 — index widened to i64 for GEP.
  const i = idx >>> 0;

  // %6 = &st_buffer[%5] ; %7 = load <2 x float>  — read this vertex's (s, t).
  const s = st_buffer[i * 2 + 0]; // %7.x
  const t = st_buffer[i * 2 + 1]; // %7.y

  // %8 = air.sample_texture_2d.v4f16(te, __air_sampler_state, <s, t>, …) ; %9 = extractvalue %8, 0
  // The sampler is the compiler-baked global, not a shader arg — we hide that behind the callback.
  const sampled = sample(te_texture, [s, t]); // %9 (half4 promoted to number[4])

  // %10 = shufflevector %7, poison, <0,1,undef,undef>  — widen the (s,t) to <s, t, ?, ?>.
  // %11 = shufflevector %10, <_,_,0.0,1.0>, <0,1,6,7>  — replace lanes 2,3 with (0.0, 1.0).
  // Net: build the homogeneous input vector <s, t, 0.0, 1.0> for the MVP transform.
  const vx = s;
  const vy = t;
  const vz = 0.0;
  const vw = 1.0;

  // %12 = &state.mvp.columns[0] ; %13 = load <4 x float>  — load MVP column 0.
  const c0x = state.mvp[0]; const c0y = state.mvp[1]; const c0z = state.mvp[2]; const c0w = state.mvp[3];
  // %16 / %17 — column 1.
  const c1x = state.mvp[4]; const c1y = state.mvp[5]; const c1z = state.mvp[6]; const c1w = state.mvp[7];
  // %20 / %21 — column 2.
  const c2x = state.mvp[8]; const c2y = state.mvp[9]; const c2z = state.mvp[10]; const c2w = state.mvp[11];
  // %24 / %25 — column 3.
  const c3x = state.mvp[12]; const c3y = state.mvp[13]; const c3z = state.mvp[14]; const c3w = state.mvp[15];

  // %14 = air.dot.v4f32(<s,t,0,1>, col0)  — component 0 of the transformed position.
  // %18 = air.dot.v4f32(<s,t,0,1>, col1)  — component 1.
  // %22 = air.dot.v4f32(<s,t,0,1>, col2)  — component 2.
  // %26 = air.dot.v4f32(<s,t,0,1>, col3)  — component 3.
  //
  // Same column-major-times-row-vector convention as blit_tex_vertex_shader (see that file for
  // the discussion — this is a caller contract, not a shader decision).
  const p0 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c0x) + Math.fround(vy * c0y)) + Math.fround(vz * c0z)) + Math.fround(vw * c0w)); // %14
  const p1 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c1x) + Math.fround(vy * c1y)) + Math.fround(vz * c1z)) + Math.fround(vw * c1w)); // %18
  const p2 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c2x) + Math.fround(vy * c2y)) + Math.fround(vz * c2z)) + Math.fround(vw * c2w)); // %22
  const p3 = Math.fround(Math.fround(Math.fround(Math.fround(vx * c3x) + Math.fround(vy * c3y)) + Math.fround(vz * c3z)) + Math.fround(vw * c3w)); // %26

  // %15/%19 build a <2 x float>{p0, p1}.
  // %28 = fadd fast <2 x float> {p0,p1}, <-1.0, -1.0>  — NDC bias on XY only.
  // The Z (p2) and W (p3) components pass through unchanged @ %23/%27.
  const posX = Math.fround(p0 + -1.0); // %28.x
  const posY = Math.fround(p1 + -1.0); // %28.y

  // %29 = shufflevector %28, poison, <0,1,undef,undef>  — widen bias'd XY to <x-1, y-1, ?, ?>.
  // %30 = shufflevector %29, %27, <0,1,6,7>  — take X,Y from bias'd, Z,W from raw MVP output.
  // Net: final position = <p0-1, p1-1, p2, p3>.
  const position: [number, number, number, number] = [posX, posY, p2, p3];

  // %31 = extractelement %9, 0 ; %32 = fpext half %31 to float  — sampled.r as float.
  // %33 = extractelement %9, 1 ; %34 = fpext half %33 to float  — sampled.g as float.
  // %35 = extractelement %9, 2 ; %36 = fpext half %35 to float  — sampled.b as float.
  // %37 = insertelement <_,_,_,1.0>, %32, 0
  // %38 = insertelement %37,          %34, 1
  // %39 = insertelement %38,          %36, 2
  // Net: color = <r, g, b, 1.0> — the alpha channel is hard-coded to 1.0 (see %37's initializer).
  const r = sampled[0]; // %32
  const g = sampled[1]; // %34
  const b = sampled[2]; // %36
  const color: [number, number, number, number] = [r, g, b, 1.0];

  // %40 = insertvalue undef, %30 (position), 0
  // %41 = insertvalue %40,   %39 (color),    1
  // Slots 2 (st) and 3 (pointsize) are never written — they stay undef.
  return {
    position,
    color,
    st: undefined,
    pointSize: undefined,
  };
}
