// @shader LiHeBackgroundGeneratorMetalShader2 (Lithium) @0x00000000000206
// Source IR: raw-port/re/shaders/LiHeBackgroundGeneratorMetalShader2.ll
// (extracted from Lithium.framework/Versions/A/Resources/LithiumHgcMetalShaders_derived.metallib)
/**
 * @shader LiHeBackgroundGeneratorMetalShader2 (Lithium)
 *
 * Trivial fragment shader that renders a uniform background colour. The
 * whole body is one load-and-return of the caller-provided `backgroundColor`
 * uniform (float4) — direct TS mapping.
 *
 * Signature from !air.fragment (!15..!19):
 *   fragment float4 LiHeBackgroundGeneratorMetalShader2(
 *       constant float4 *backgroundColor [[buffer(0)]]);
 *   → render_target(0) : float4  (!17)
 *
 * params struct (16 bytes, 16-byte aligned):
 *   +0   float4  backgroundColor
 *
 * Denorms / fast-math (from !12..!14):
 *   air.compile.denorms_disable
 *   air.compile.fast_math_enable   — with `unsafe-fp-math=true`,
 *   `approx-func-fp-math=true`, etc. There are no arithmetic ops here at
 *   all (only a 16-byte aligned load and a return), so no fp32 narrowing
 *   is required — the returned value is exactly the loaded uniform.
 */

/** params — one float4 uniform. @IR !19 (buffer_size=16, align=16, read) */
export interface LiHeBackgroundGeneratorMetalShader2_Params {
  /** float4 at +0: background colour (RGBA). @IR %2 (load <4 x float>, align 16) */
  backgroundColor: [number, number, number, number];
}

/**
 * LiHeBackgroundGeneratorMetalShader2 — one fragment.
 *
 * @param params  the constant-buffer params (buffer(0))
 * @returns       the fragment RGBA float4 to write to render_target 0
 *
 * @IR entire function @0x00000000000206.
 */
export function LiHeBackgroundGeneratorMetalShader2(
  params: LiHeBackgroundGeneratorMetalShader2_Params,
): [number, number, number, number] {
  // @IR %2 = load <4 x float>, <4 x float> addrspace(2)* %0, align 16
  //     ret <4 x float> %2
  const c = params.backgroundColor;
  return [c[0], c[1], c[2], c[3]];
}
