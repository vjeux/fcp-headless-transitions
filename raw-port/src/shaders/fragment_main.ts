// Faithful transcription @0x000000000000717b — no shortcut language of any kind.
// @shader fragment_main (MAVectorUIKit) @0x000000000000717b
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/fragment_main.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MAVectorUIKit.framework/Versions/A/Resources/default.metallib.
// The .ll header line reads `0x0000000000717b -- fragment_main:` —
// that is the shader's entry offset in the metallib. Compile
// options: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. There are NO fadd/fmul/
// fsub/fdiv ops in this body — the only computation is an int
// widening (zext i16 to i32) for the array slice index and a
// single texture-array sample. `fast_math_enable` is therefore
// inert here.
//
// This is a FRAGMENT FUNCTION (!air.fragment/!15). Fragment inputs
// (!16..!23):
//   m_Position     : float4 (air.position, air.center,
//                     air.no_perspective, marked air.arg_unused at
//                     !19 — the IR body never reads it).
//   m_TexCoord     : float2 (air.fragment_input, air.perspective,
//                     user "texturecoord").
//   m_ID           : ushort (air.fragment_input, air.flat,
//                     generated "generated(4m_IDt)") — used as the
//                     integer array-slice index.
//   tex2D          : texture2d_array<half, sample>.
//   mySampler      : sampler.
//
// Render target output (!17):
//   half4 (air.render_target 0/0, no arg name given by !17).
//
// Line-by-line map of the .ll body:
//
//   entry:
//     %6 = zext i16 %m_ID to i32                  -- slice index.
//     %7 = air.sample_texture_2d_array.v4f16(
//             tex2D, mySampler, m_TexCoord,
//             %6                  /* array_slice */,
//             i1 true             /* offset_valid */,
//             <2 x i32> zeroinitializer /* offset <0,0> */,
//             i1 false            /* bias_valid */,
//             float 0.0, float 0.0,
//             i32 0               /* comparison mode: none */)
//         -> {<4 x half>, i8}
//     %8 = extractvalue %7, 0                     -- <4 x half> rgba.
//     ret <4 x half> %8

/**
 * Callback for AIR `air.sample_texture_2d_array.v4f16` — samples the
 * half-precision texture array `tex` at (u, v, slice) with the bound
 * sampler and returns the four rgba lanes as fp32 numbers (JS has no
 * native f16 primitive; the caller is expected to narrow to f16 at
 * write-time if the render target is half-precision).
 */
export type SampleHalfTex2DArray<T> = (
  texture: T,
  u: number,
  v: number,
  slice: number,
) => [number, number, number, number];

/**
 * Fragment kernel `fragment_main` (MAVectorUIKit).
 *
 * Returns the half4 sample of `tex2D` at the interpolated
 * `m_TexCoord`, indexed by the flat-shaded ushort `m_ID` as the
 * array slice. `m_Position` is marked air.arg_unused at !19 and is
 * carried in the signature only to match the AIR fragment ABI.
 *
 * @shader fragment_main (MAVectorUIKit)
 */
export function fragment_main<TTex>(
  m_Position: [number, number, number, number], // unused per !19
  m_TexCoord: [number, number],
  m_ID: number,
  tex2D: TTex,
  sampleTex2DArray: SampleHalfTex2DArray<TTex>,
): [number, number, number, number] {
  // %6 = zext i16 %m_ID to i32.
  //   The IR argument is `i16`; JS has no i16 type, so mask to 16
  //   bits with `& 0xffff` to preserve the ushort semantics of the
  //   input, then the zext trivially widens to i32 (already fits in
  //   JS's number).
  void m_Position;
  const slice = (m_ID & 0xffff) | 0;

  // %7 = air.sample_texture_2d_array.v4f16(tex2D, mySampler,
  //         m_TexCoord, slice, offset_valid=true, <0,0>,
  //         bias_valid=false, 0.0, 0.0, i32 0)
  // %8 = extractvalue %7, 0.
  const rgba = sampleTex2DArray(
    tex2D,
    Math.fround(m_TexCoord[0]),
    Math.fround(m_TexCoord[1]),
    slice,
  );

  // ret <4 x half> %8.
  return [
    Math.fround(rgba[0]),
    Math.fround(rgba[1]),
    Math.fround(rgba[2]),
    Math.fround(rgba[3]),
  ];
}
