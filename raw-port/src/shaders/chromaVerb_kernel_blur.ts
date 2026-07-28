// Faithful transcription @0x0000000000048f
// @shader chromaVerb_kernel_blur (MAPlugInGUISwift/default) @0x0000000000048f
// Source IR: raw-port/re/shaders/chromaVerb_kernel_blur.ll
// (extracted from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/EDEL.framework/Versions/A/
//     Frameworks/MAPlugInGUISwift.framework/Versions/A/Resources/default.metallib
// via raw-port/tools/shader_disasm.sh — first-line offset in that .ll is
// `0x0000000000048f -- chromaVerb_kernel_blur:`)
//
// This IR has NO debug metadata (no !DICompileUnit / DILocation), so all source-line
// citations refer to the SSA %-numbers of the .ll instead of the .metal source.
//
// Metal COMPUTE KERNEL — a directional 1-D box blur that reads `inTexture`, integrates
// texels along a straight line whose direction is a per-invocation vector derived from
// the three-float `parameters` buffer, and writes the accumulated (unnormalised-here)
// result to `outTexture` at the invocation's grid position.
//
// Signature from !air.kernel (!15..!22):
//   kernel void
//   chromaVerb_kernel_blur(
//       texture2d<float, sample> inTexture  [[texture(0)]],   // %0
//       texture2d<float, write>  outTexture [[texture(1)]],   // %1
//       constant float*          parameters [[buffer(0)]],    // %2  (min 12 bytes read)
//       uint2                    gid        [[thread_position_in_grid]]  // %3
//   );
//
// The parameters buffer is a raw `constant float*` — the shader reads three trailing
// floats via i-th float-pointer GEP. Semantics decoded from the IR arithmetic:
//   parameters[0] = N           — the kernel LENGTH in taps (fp32, cast to i32 via
//                                 air.convert.s.i32.f.f32(N * 0.5) = trunc(N/2))
//                                 The IR uses this trunc(N/2) as the loop's central
//                                 index; the loop then walks from -trunc(N/2) up to
//                                 +trunc(N/2) inclusive, giving 2·trunc(N/2)+1 samples.
//   parameters[1] = tapWeight   — scalar multiplier applied to every sampled texel.
//                                 The IR precomputes `k = tapWeight / N` and multiplies
//                                 each sampled RGBA by that constant before accumulating.
//   parameters[2] = dirX        — X component of the per-step displacement.
//                                 The Y component is `1 - dirX` (`fsub fast 1.0, dirX`).
//                                 This matches Motion/FCP's chromaVerb "line blur" style
//                                 where the caller passes a 2-vector packed as (dirX,
//                                 1-dirX) so the fragment can reconstruct dirY without
//                                 a second parameter slot. NOTE: `1 - dirX` is NOT the
//                                 same as `dirY` for arbitrary directions; the caller is
//                                 responsible for arranging dirY = 1 - dirX (or accepting
//                                 whatever this simple parametrisation produces).
//
// !22 declares one air.sampler_state literal (encoded value 34901797601050624) that the
// IR reuses at every sample_texture_2d call — a runtime-baked sampler descriptor. Its
// mode is not decoded from the .ll (would need the metallib sampler-state parser); we
// mirror the IR by making the sampler an opaque closure passed by the caller so the
// binding is authored elsewhere.
//
// Sample coord (both blocks agree):
//   sampleUV = (gid.x - i * dirX, gid.y - i * (1 - dirX))
// with `i` the loop's signed counter. Sampling happens in the loop body only if the
// early-out (trunc(N/2) >= 0) succeeded; otherwise the output is a straight
// `float4(0,0,0,0)`.
//
// IR body (with early-out and one loop):
//   %5  = load parameters[0]                             — N (fp)
//   %7  = load parameters[1]                             — tapWeight (fp)
//   %8  = fdiv fast %7, %5                               — k = tapWeight / N
//   %10 = splat4(k)
//   %12 = load parameters[2]                             — dirX
//   %13 = fsub fast 1.0, dirX                            — dirY  (= 1 - dirX)
//   %14 = fmul fast N, 0.5                               — N/2  (fp)
//   %15 = air.convert.s.i32.f.f32(%14)                    — halfN = trunc(N/2)  (i32)
//   %16 = icmp slt halfN, 0                              — early-out guard
//   br  → block 23 (write zero) OR block 17 (setup)
//
//   17: %18 = 0 - halfN                                  — startI = -halfN  (i32)
//       %19 = gid.x (u32)   %20 = f32(gid.x)
//       %21 = gid.y (u32)   %22 = f32(gid.y)
//       br 25
//
//   25: %26 = phi accum <4 x float> [zero, 17], [%38, 25]
//       %27 = phi i32     [startI, 17], [%39, 25]
//       %28 = f32(%27)                                    — i as fp
//       %29 = %28 * dirX
//       %30 = f32(gid.x) - %29                            — sample.x
//       %32 = %28 * dirY
//       %33 = f32(gid.y) - %32                            — sample.y
//       %35 = air.sample_texture_2d(inTexture, __air_sampler_state, (sx,sy))
//       %36 = extractvalue %35, 0                         — <4 x float> texel
//       %37 = fmul fast texel, splat(k)
//       %38 = fadd fast %37, accum                        — new accum
//       %39 = %27 + 1
//       %40 = icmp eq %27, halfN                          — exit AFTER using i == halfN
//       br  → 23 (write) OR 25 (loop)
//
//   23: %24 = phi <4 x float> [zero, 4], [%38, 25]        — value to write
//       air.write_texture_2d(outTexture, gid, %24, mip=0, colour=2)
//       ret
//
// Notes on fp semantics:
//   - "fmul fast" / "fadd fast" / "fdiv fast" everywhere + air.compile.fast_math_enable +
//     no-nans/no-infs/no-signed-zeros. Metal fp32 semantics — coerce every fp op through
//     Math.fround.
//   - `air.convert.s.i32.f.f32` = signed truncation toward zero (matches C `(int32_t)f`).
//     JS `Math.trunc(x) | 0` reproduces this deterministically for finite inputs.
//   - `air.convert.f.f32.u.i32` = u32 → f32 exact-if-representable conversion. In this
//     shader gid components are u32 grid coordinates that easily fit in f32; we mirror
//     with `Math.fround(gidX >>> 0)`.
//   - The unnormalised-looking multiply-by-k = tapWeight/N in the loop is EXACTLY what
//     the IR does — the caller controls whether the accumulator ends up mathematically
//     normalised via the tapWeight it passes.

/**
 * Sampler closure — abstracts the AIR `air.sample_texture_2d.v4f32` call with the
 * shader's baked sampler descriptor (encoded value at !22 =
 * `air_sampler_state[0] = 34901797601050624`). The IR always calls
 *   air.sample_texture_2d.v4f32(inTexture, __air_sampler_state, uv,
 *                               offset_valid=true, offset=zero, has_lod=false,
 *                               lod=0.0, bias=0.0, sample_index=0)
 * i.e. a plain LOD-0 sample at the given uv with a fixed sampler and zero offset. The
 * returned `<4 x float>, i8` pair's i8 (a residency flag) is ignored — the IR only
 * reads `extractvalue %35, 0`.
 *
 * @param uv  <2 x float> sample coordinate. This shader's coords come from the raw
 *            (gid - i·dir) formula and are therefore in TEXEL SPACE, not normalised UV
 *            — the baked sampler at !22 must accordingly be in
 *            `coord::pixel` mode. We surface no normalisation here; the caller's
 *            sampler is expected to honour that.
 */
export type SampleFn = (uv: [number, number]) => [number, number, number, number];

/**
 * Writer closure — abstracts the AIR `air.write_texture_2d.v4f32` call. The IR always
 * calls
 *   air.write_texture_2d.v4f32(outTexture, gid, value, mip=0, colour=2)
 * with `gid` the invocation's grid coordinate and `mip = 0`, so the closure receives
 * the (x, y) integer grid position and the RGBA value.
 */
export type WriteFn = (
  x: number,
  y: number,
  rgba: [number, number, number, number],
) => void;

/**
 * chromaVerb_kernel_blur — one compute-kernel invocation for one output pixel.
 *
 * @param parameters  constant float* buffer. Only the first three floats are read
 *                    (`parameters[0..2]` = N, tapWeight, dirX).
 * @param gid         [[thread_position_in_grid]] — (u32,u32) output pixel coord.
 * @param sampleIn    closure that samples `inTexture` with the baked sampler at !22.
 * @param writeOut    closure that writes `outTexture` at `gid` (mip 0).
 *
 * @IR entire function @0x0000000000048f.
 */
export function chromaVerb_kernel_blur(
  parameters: ReadonlyArray<number>,
  gid: [number, number],
  sampleIn: SampleFn,
  writeOut: WriteFn,
): void {
  // @IR %5 = load parameters[0]  — N (fp)
  const N = Math.fround(parameters[0]);
  // @IR %7 = load parameters[1]  — tapWeight (fp)
  const tapWeight = Math.fround(parameters[1]);
  // @IR %8 = fdiv fast tapWeight, N
  const k = Math.fround(tapWeight / N);
  // @IR %12 = load parameters[2]  — dirX
  const dirX = Math.fround(parameters[2]);
  // @IR %13 = fsub fast 1.0, dirX  — dirY = 1 - dirX
  const dirY = Math.fround(1.0 - dirX);
  // @IR %14 = fmul fast N, 0.5    — N/2 (fp)
  //     %15 = air.convert.s.i32.f.f32(%14)  — halfN = trunc(N/2)
  const halfN = Math.trunc(Math.fround(N * 0.5)) | 0;
  // @IR %16 = icmp slt halfN, 0   — early-out guard
  if (halfN < 0) {
    // @IR block 23 with %24 = zeroinitializer
    writeOut(gid[0] | 0, gid[1] | 0, [0.0, 0.0, 0.0, 0.0]);
    return;
  }
  // @IR block 17: setup
  //     %18 = 0 - halfN   — startI = -halfN
  //     %19/%21 = extractelement gid, 0/1
  //     %20/%22 = air.convert.f.f32.u.i32(gid.x / gid.y)
  const startI = -halfN | 0;
  const gidXf = Math.fround((gid[0] >>> 0) as number);
  const gidYf = Math.fround((gid[1] >>> 0) as number);
  // @IR block 25: the loop. Runs for i = startI, startI+1, ..., halfN INCLUSIVE
  //     (the exit test uses the pre-increment %27 == halfN, so the halfN iteration is
  //     still fully accumulated before exit — see the ordering of %38 before %40 above.)
  let accumR = 0.0;
  let accumG = 0.0;
  let accumB = 0.0;
  let accumA = 0.0;
  for (let i = startI; ; i = (i + 1) | 0) {
    // @IR %28 = air.convert.f.f32.s.i32(%27)  — i as f32 (signed)
    const iF = Math.fround(i);
    // @IR %29 = fmul fast iF, dirX
    //     %30 = fsub fast gidXf, %29
    const sx = Math.fround(gidXf - Math.fround(iF * dirX));
    // @IR %32 = fmul fast iF, dirY
    //     %33 = fsub fast gidYf, %32
    const sy = Math.fround(gidYf - Math.fround(iF * dirY));
    // @IR %35 = air.sample_texture_2d.v4f32(inTexture, sampler, (sx,sy), ...)
    //     %36 = extractvalue %35, 0
    const texel = sampleIn([sx, sy]);
    // @IR %37 = fmul fast texel, splat(k)
    //     %38 = fadd fast %37, accum
    accumR = Math.fround(Math.fround(texel[0] * k) + accumR);
    accumG = Math.fround(Math.fround(texel[1] * k) + accumG);
    accumB = Math.fround(Math.fround(texel[2] * k) + accumB);
    accumA = Math.fround(Math.fround(texel[3] * k) + accumA);
    // @IR %40 = icmp eq %27, %15   — exit AFTER using i == halfN
    if (i === halfN) break;
  }
  // @IR block 23: air.write_texture_2d(outTexture, gid, %24=%38, mip=0, ...)
  writeOut(gid[0] | 0, gid[1] | 0, [accumR, accumG, accumB, accumA]);
}
