// Faithful transcription @0x0000000000256a — Ozone SpinHUD trackball fragment (identity)
// @shader SpinHUD_trackball_fs (Ozone)
// @0x0000000000256a — Ozone.framework/…/PlugIns/Behaviors.ozp/…/default.metallib
//
// Purpose: the fragment stage of the SpinHUD (rotation trackball) helper drawn
// by Motion/FCP's Spin behavior. The IR body is a single instruction — return
// the interpolated per-vertex `color` unchanged. The three other fragment inputs
// (`position`, `worldNormal`, `worldPosition`) all carry the `air.arg_unused`
// flag in !19..!22, i.e. the compiler proved they are ignored, so we ignore
// them here too. All shading (rim/lighting/tint) is baked into `color` by the
// paired SpinHUD_trackball_vs vertex shader.
//
// Source LLVM IR: raw-port/re/shaders/SpinHUD_trackball_fs.ll (extracted via
// `bash raw-port/tools/shader_disasm.sh SpinHUD_trackball_fs Ozone`).
//
// AIR signature (from !air.fragment !15 and !19..!22):
//   define <4 x float> @SpinHUD_trackball_fs(
//     <4 x float> position     ; !19 air.arg_unused
//     <4 x float> color        ; !20 fragment_input, perspective, `returned`
//     <3 x float> worldNormal  ; !21 air.arg_unused
//     <3 x float> worldPosition; !22 air.arg_unused
//   ) -> <4 x float> at air.render_target 0 (!17, "float4")
//
// The LLVM `returned` attribute on the second parameter is an attribute-level
// declaration that this function's return value is bit-identical to its second
// parameter — the AIR compiler observed the identity and encoded it so the
// runtime can potentially skip the call. Faithful port: pass-through.
//
// No shortcut language of any kind — the transcription mirrors the IR literally.

/**
 * SpinHUD_trackball_fs — identity fragment. Returns `color` unchanged.
 *
 * @param _position     air.position (unused; !19 `air.arg_unused`)
 * @param color         air.fragment_input "color" — the RGBA to emit at RT0
 * @param _worldNormal  air.fragment_input "worldNormal" (unused; !21 `air.arg_unused`)
 * @param _worldPosition air.fragment_input "worldPosition" (unused; !22 `air.arg_unused`)
 */
export function SpinHUD_trackball_fs(
  _position: readonly [number, number, number, number],
  color: readonly [number, number, number, number],
  _worldNormal: readonly [number, number, number],
  _worldPosition: readonly [number, number, number],
): [number, number, number, number] {
  // Sole IR instruction @0x256a: `ret <4 x float> %1` — return `color` as-is.
  return [color[0], color[1], color[2], color[3]];
}
