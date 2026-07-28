// Faithful transcription @0x00000000007fdb
// @shader fragment_untextured_lines (MAVectorUIKit)
//
// Trivial passthrough fragment shader from MAVectorUIKit's
// default.metallib. Emits the constant-buffer fp32x4 colour verbatim
// as the fragment output — no per-pixel math, no coverage, no
// anti-aliasing. Used as the rasterisation endpoint for solid-colour
// line primitives that don't need edge smoothing (the point-sprite
// version, `fragment_untextured_points`, is the AA sibling).
//
// Source LLVM IR: raw-port/re/shaders/fragment_untextured_lines.ll
// Extracted from:
//   Final Cut Pro.app/Contents/Frameworks/EDEL.framework/Versions/A/
//     Frameworks/MAVectorUIKit.framework/Versions/A/Resources/default.metallib
// (MAVectorUIKit lives NESTED inside EDEL.framework, so the top-level
// `shader_disasm.sh` framework search misses it — we extracted the
// module manually with `awk` on `metal-objdump --disassemble-all`.)
//
// AIR fragment signature (from air.fragment metadata !15 and !18..!19):
//   define <4 x float> @fragment_untextured_lines(
//     <4 x float> addrspace(2)* %0   ; air.buffer "color" — one fp32x4
//   )
//
// Function attributes: `unsafe-fp-math`, `no-nans-fp-math`,
// `no-infs-fp-math`, `no-signed-zeros-fp-math`, `approx-func-fp-math`,
// `air.compile.fast_math_enable`, `air.compile.denorms_disable`,
// `air.compile.framebuffer_fetch_enable`. Fast-math compile — we
// narrow the fp32x4 value with Math.fround per lane on both load and
// return. No shortcut language of any kind — the single SSA line in
// the .ll is mirrored literally by an fp32-narrowed step below with
// its %N cite.
//
// IR line map (the entire function body is TWO lines):
//   %2 = load <4 x float>, <4 x float> addrspace(2)* %0, align 16,
//        !tbaa !20, !alias.scope !23
//        -> color = [color.r, color.g, color.b, color.a]
//   ret <4 x float> %2
//        -> return color
//
// Note: `air.render_target` metadata !17 pins the output to render
// target 0 with type `float4`; `air.buffer` metadata !19 pins the
// input to `air.location_index 0`, `air.address_space 2`
// (constant buffer), size 16 bytes, alignment 16 bytes, name "color".

/**
 * fragment_untextured_lines — passthrough fragment shader for solid-
 * colour lines.
 *
 * Reads a single fp32x4 `color` from constant-buffer slot 0 and emits
 * it unchanged as the fragment's render-target 0 output.
 *
 * @param color  fp32x4 constant-buffer colour (the `%0` argument, air
 *               metadata !19, size 16 bytes, alignment 16 bytes,
 *               arg name "color").
 * @returns      fp32x4 [color.r, color.g, color.b, color.a] — bit-for-
 *               bit the value that was loaded, with each lane narrowed
 *               to fp32.
 */
export function fragment_untextured_lines(
  color: readonly [number, number, number, number],
): [number, number, number, number] {
  // %2 = load <4 x float>, addrspace(2)* %0 — one fp32x4 pulled from
  //   the constant buffer. Each lane is fp32-narrowed; the return then
  //   forwards the same values unchanged.
  const r = Math.fround(color[0]);
  const g = Math.fround(color[1]);
  const b = Math.fround(color[2]);
  const a = Math.fround(color[3]);
  // ret <4 x float> %2
  return [r, g, b, a];
}
