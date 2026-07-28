// @shader cdFragmentFunc (Lithium/LiSolidShaders) @0x00000000021519
// Source IR: raw-port/re/shaders/cdFragmentFunc.ll
// (extracted from Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib via
// raw-port/tools/shader_disasm.sh). The .ll header line reads
// `0x00000000021519 -- cdFragmentFunc:` — the shader's entry offset in the metallib.
//
// A trivial "clear-depth" fragment shader — the name "cd" reads as clear-depth per the
// output metadata `!17 = air.depth,air.any,float,z`. Both `position` (fragment_input 0)
// and `uv` (fragment_input 1) are declared with `air.arg_unused`; the fragment reads a
// single fp32 depth value from a constant-address-space buffer (`float addrspace(2)*`
// at buffer index 2) and returns it as the output depth. It writes the same constant
// depth at every fragment — the canonical "clear the depth buffer to a scalar" primitive.
//
// The IR body is 3 SSA values:
//   %4 = load float, float addrspace(2)* %2, align 4, !tbaa, !alias.scope
//   %5 = insertvalue <{ float }> undef, float %4, 0
//   ret <{ float }> %5
//
// Signature from !air.fragment (!15..!21):
//   fragment struct { float z [[depth(any)]]; }
//   cdFragmentFunc(
//       float4 position [[position, center, no_perspective, arg_unused]],
//       float2 uv       [[fragment_input(1), center, perspective, arg_unused]],
//       constant float* depth [[buffer(2), read, addrspace(2)]]);
//
// Denorms / fast-math (from !12..!14):
//   air.compile.denorms_disable
//   air.compile.fast_math_enable   — no arithmetic ops, so Math.fround is only used
//   defensively on the loaded value (a caller-supplied fp32 buffer entry, narrowed to
//   guarantee the return type is a true fp32 value even if the caller hands us a JS
//   number that isn't already fp32-representable).

/**
 * cdFragmentFunc — clear-depth fragment.
 *
 * Reads a single fp32 depth constant from `depth[0]` and returns it as the fragment's
 * output depth. Called per pixel; writes the same constant everywhere.
 *
 * @param depth caller-supplied constant-address-space buffer (index 2). Only `depth[0]`
 *              is read (the buffer is declared `dereferenceable(4)`).
 * @returns the fp32 depth value to write for every fragment.
 *
 * @IR entire function @0x00000000021519.
 */
export function cdFragmentFunc(depth: ArrayLike<number>): number {
  // %4 = load float, float addrspace(2)* %2, align 4
  // %5 = insertvalue <{ float }>, %4, 0 ; ret %5
  return Math.fround(depth[0]);
}
