// Faithful transcription @0x0000000000002768 — Ozone VelocityView trackball fragment (identity)
// @shader VelocityView_trackball_fs (Ozone)
// @0x0000000000002768 — Ozone.framework/Versions/A/Resources/default.metallib
//
// Purpose: the fragment stage of the VelocityView trackball helper drawn by
// Motion/FCP behaviors that visualize per-vertex velocity on a trackball gizmo.
// The IR body is a single instruction — return the interpolated per-vertex
// `color` unchanged. The two other fragment inputs (`position`, `worldNormal`)
// both carry the `air.arg_unused` flag in !19 and !21, i.e. the compiler
// proved they are ignored, so we ignore them here too. All shading (per-vertex
// velocity tint / rim / lighting) is baked into `color` by the paired
// VelocityView_trackball_vs vertex shader.
//
// Source LLVM IR: raw-port/re/shaders/VelocityView_trackball_fs.ll (extracted
// via `bash raw-port/tools/shader_disasm.sh VelocityView_trackball_fs Ozone`).
//
// AIR signature (from !air.fragment !15 and !19..!21):
//   define <4 x float> @VelocityView_trackball_fs(
//     <4 x float> position     ; !19 air.position, air.center, air.no_perspective, air.arg_unused
//     <4 x float> color        ; !20 air.fragment_input "color", air.center, air.perspective, `returned`
//     <3 x float> worldNormal  ; !21 air.fragment_input "worldNormal", air.center, air.perspective, air.arg_unused
//   ) -> <4 x float> at air.render_target 0 (!17, "float4")
//
// The LLVM `returned` attribute on the second parameter is an attribute-level
// declaration that this function's return value is bit-identical to its second
// parameter — the AIR compiler observed the identity and encoded it so the
// runtime can potentially skip the call. Faithful fp32 transcription: pass-through.
//
// The IR body reads, in full:
//   define <4 x float> @VelocityView_trackball_fs(<4 x float> %0,
//                                                 <4 x float> returned %1,
//                                                 <3 x float> %2) ... {
//     ret <4 x float> %1
//   }

/**
 * VelocityView_trackball_fs — identity fragment. Returns `color` unchanged.
 *
 * @param _position    air.position (unused; !19 `air.arg_unused`)
 * @param color        air.fragment_input "color" — the RGBA to emit at RT0
 * @param _worldNormal air.fragment_input "worldNormal" (unused; !21 `air.arg_unused`)
 */
export function VelocityView_trackball_fs(
  _position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  _worldNormal: readonly [number, number, number],
): [number, number, number, number] {
  // Sole IR instruction @0x2768: `ret <4 x float> %1` — return `color` as-is.
  return [color[0], color[1], color[2], color[3]];
}
