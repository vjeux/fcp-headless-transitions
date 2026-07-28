// Faithful transcription @0x0000000000c0e9
// @shader paintersVertexFunc (Lithium)
//
// Trivial 2D vertex-passthrough vertex shader from Lithium's
// LiSolidShaders.metallib. Takes a 2D `position` and 2D `texCoord`
// vertex-input pair, and returns a 4D air.position (x, y, 0, 1) plus
// the passed-through texcoord. This is the classic "screen-space quad"
// vertex shader used for fullscreen post-effects — the position is
// already in clip space (no matrix multiply).
//
// Source LLVM IR: raw-port/re/shaders/paintersVertexFunc.ll
// Extracted from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib
// (via `bash raw-port/tools/shader_disasm.sh paintersVertexFunc Lithium`)
//
// AIR vertex signature (from air.vertex metadata !15 and !16..!21):
//   define <{ <4 x float>, <2 x float> }> @paintersVertexFunc(
//     <2 x float> %0,   ; air.vertex_input position (location 0)
//     <2 x float> %1    ; air.vertex_input texCoord (location 1)
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`.
// No shortcut language of any kind — every SSA value has an fp32-narrowed
// step below with its %N cite.
//
// IR line map:
//   %3 = shufflevector <2 x float> %0, poison, <0, 1, undef, undef>
//        -> [posX, posY, ·, ·]        (widen to <4xf>, lanes 2/3 poison)
//   %4 = shufflevector <4 x float> %3,
//                     <poison, poison, 0.0, 1.0>,
//                     <0, 1, 6, 7>
//        -> [posX, posY, 0.0, 1.0]    (fill lane 2 with 0, lane 3 with 1)
//        (Index 6 selects lane 2 of the second operand (= 0.0);
//         index 7 selects lane 3 of the second operand (= 1.0).)
//   %5 = insertvalue struct undef, <4xf> %4, 0    -> { position, · }
//   %6 = insertvalue struct %5, <2xf> %1, 1        -> { position, uv }
//   ret <{ <4 x float>, <2 x float> }> %6

/**
 * Return value of `paintersVertexFunc`. Field names come from
 * `air.vertex_output` metadata (!17 air.position; !18 uv).
 */
export interface PaintersVertexOutput {
  /** air.position — [posX, posY, 0.0, 1.0]. */
  position: [number, number, number, number];
  /** air.vertex_output uv — passed through from the texCoord input. */
  uv: [number, number];
}

/**
 * paintersVertexFunc — 2D → clip-space passthrough vertex shader.
 *
 * @param position  <2 x float> vertex_input at location 0 (screen-space X, Y).
 * @param texCoord  <2 x float> vertex_input at location 1 (uv).
 * @returns         `{ position: [x, y, 0, 1], uv: [texCoord.x, texCoord.y] }`.
 */
export function paintersVertexFunc(
  position: readonly [number, number],
  texCoord: readonly [number, number],
): PaintersVertexOutput {
  // %3/%4: build [posX, posY, 0.0, 1.0].
  const posX = Math.fround(position[0]);
  const posY = Math.fround(position[1]);
  // %5/%6: pack the struct return.
  return {
    position: [posX, posY, Math.fround(0.0), Math.fround(1.0)],
    uv: [Math.fround(texCoord[0]), Math.fround(texCoord[1])],
  };
}
