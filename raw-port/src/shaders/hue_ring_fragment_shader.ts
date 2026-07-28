// @shader hue_ring_fragment_shader (Flexo)  @0x00000000010890
//
// Metal fragment shader from Flexo's default.metallib. This is a pure
// PASSTHROUGH shader: it returns its second argument (the interpolated
// fragment color `Cs`) unchanged. The AIR body is a single `ret` and the
// signature uses the LLVM `returned` attribute on `%1` to hint that the
// return value equals the second argument.
//
// Source LLVM IR: raw-port/re/shaders/hue_ring_fragment_shader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh hue_ring_fragment_shader Flexo`)
//
// AIR signature (from the .ll):
//   define <4 x float> @hue_ring_fragment_shader(
//     <4 x float> %0,           // P  — air.position, marked air.arg_unused
//     <4 x float> returned %1,  // Cs — interpolated fragment color
//     <2 x float> %2            // st — texture coord, marked air.arg_unused
//   )
//
// Fragment-input metadata from the .ll (!19, !20, !21):
//   %0 -> air.position "P"                  (unused; air.arg_unused)
//   %1 -> air.fragment_input "generated(2CsDv4_f)" "Cs" — the vertex-stage
//         interpolated color
//   %2 -> air.fragment_input "generated(2stDv2_f)"  "st" (unused; air.arg_unused)
//
// The role of this shader inside FCP: it is the fragment stage of the
// "hue ring" primitive (see `hue_ring_vertex_shader` in the same metallib
// which computes a per-vertex RGBA gradient around a hue wheel). All the
// per-pixel work is done at vertex time; the fragment stage just carries
// the interpolated color through — hence the single `ret <4 x float> %1`.
//
// IR line map (from the .ll body of @hue_ring_fragment_shader):
//   (no numbered lines — the function body is a single `ret`)
//   ret <4 x float> %1        ; return Cs unchanged
//
// Fast-math attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`.
// The shader performs NO arithmetic, so fast-math flags do not affect
// correctness. This port uses plain JS Number ops (fp32-narrowed with
// Math.fround on the returned lanes to preserve f32 fidelity, matching
// the AIR `<4 x float>` return type).

/**
 * The RGBA fragment color as a length-4 tuple of f32 lanes.
 * (AIR `<4 x float>` on the render-target return.)
 */
export type ShaderTexel = [number, number, number, number];

/**
 * `@hue_ring_fragment_shader` — Flexo Metal fragment shader.
 *
 * Passthrough: returns the interpolated vertex color `Cs` unchanged.
 * Faithful transcription of the .ll body (a single `ret <4 x float> %1`).
 *
 * @param _P    fragment position (AIR `<4 x float> %0`) — unused per
 *               `air.arg_unused` metadata
 * @param Cs    interpolated fragment color (AIR `<4 x float> %1`,
 *               with LLVM `returned` attribute)
 * @param _st   fragment tex-coord (AIR `<2 x float> %2`) — unused per
 *               `air.arg_unused` metadata
 * @returns     `Cs` unchanged (lane-wise fp32-narrowed via Math.fround)
 */
export function hue_ring_fragment_shader(
  _P: readonly [number, number, number, number],
  Cs: readonly [number, number, number, number],
  _st: readonly [number, number],
): ShaderTexel {
  // ret <4 x float> %1  —  return Cs unchanged.
  // Lane-wise Math.fround preserves the AIR `<4 x float>` fp32 fidelity of
  // the return type (the caller may pass fp64 numbers whose fp32-narrowed
  // value is what the GPU would carry through the fragment stage).
  return [
    Math.fround(Cs[0]),
    Math.fround(Cs[1]),
    Math.fround(Cs[2]),
    Math.fround(Cs[3]),
  ];
}
