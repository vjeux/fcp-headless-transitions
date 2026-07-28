// Faithful transcription @0x00000000000346 — @shader Hgc2CombineFields (TextFramework)
//
// Metallib offset from raw-port/re/shaders/Hgc2CombineFields.ll header line
//   `0x00000000000346 -- Hgc2CombineFields:` — the shader's entry offset in
//   TextFramework.framework/Versions/A/Resources/MotionHgcMetalShaders_derived.metallib.
//
// Provenance: LLVM AIR IR in raw-port/re/shaders/Hgc2CombineFields.ll,
// extracted from that metallib via `metal-objdump --disassemble-all`
// (the shader_disasm.sh helper's per-lib `||continue` misfires when the
// tool exits nonzero after a successful dump for a single-metallib framework,
// so the extraction was performed via the same awk selector inline).
// Compile options in the .ll: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`, `air.compile.framebuffer_fetch_enable`;
// function attribute set #0 also carries `unsafe-fp-math=true`,
// `approx-func-fp-math=true`, `no-signed-zeros-fp-math=true`
// (unlike Hgc2ErodeOutside, `no-infs-fp-math` and `no-nans-fp-math` are
// both FALSE here, so inf/NaN propagation must be preserved — which the
// port does implicitly by using ordinary JS arithmetic).
//
// Fragment metadata (from !air.fragment, !15..!25 in the .ll):
//   arg %0 = "position"  (air.position, no_perspective) — .y is the
//                        scanline selector.
//   arg %1 = "texcoord0" (float4, perspective)          — .xy is the
//                        pre-snap UV into texture0 (field 0).
//   arg %2 = "texcoord1" (float4, perspective)          — .xy is the
//                        pre-snap UV into texture1 (field 1).
//   arg %3 = "texture0"  (texture2d<float, sample>, index 0).
//   arg %4 = "texture1"  (texture2d<float, sample>, index 1).
//   arg %5 = "sampler0"  (index 0).
//   arg %6 = "sampler1"  (index 1).
//   return = air.render_target 0/0, float4.
//
// Line-by-line map from the .ll body:
//   %8  = fmul %1, <1.0, 0.5, 1.0, 1.0>
//   %9  = fadd %8, <-0.25, -0.125, -0.0, -0.0>
//   %10 = air.fast_floor.v4f32(%9)
//   %11 = fadd %10, <0.5, 0.5, poison, poison>
//         -> Lanes 0/1 (u0/v0) are transformed as:
//              u0' = floor(u0 * 1.0 + (-0.25)) + 0.5 = floor(u0 - 0.25) + 0.5
//              v0' = floor(v0 * 0.5 + (-0.125)) + 0.5
//                  = floor((v0 - 0.25) * 0.5) + 0.5
//         Lanes 2/3 are poisoned after the +0.5 and only lanes 0/1 are
//         used later (the .xy shufflevector below), so they can be ignored.
//   %12/%13/%14/%15 = identical transform applied to %2 (texcoord1).
//         -> u1' = floor(u1 - 0.25) + 0.5
//         -> v1' = floor((v1 - 0.25) * 0.5) + 0.5
//   %16 = shufflevector %11, poison, <0,1>              -> [u0', v0']
//   %17 = air.sample_texture_2d.v4f32(texture0, sampler0, [u0',v0'], ...)
//   %18 = extractvalue %17, 0                           -> rgba0
//   %19 = shufflevector %15, poison, <0,1>              -> [u1', v1']
//   %20 = air.sample_texture_2d.v4f32(texture1, sampler1, [u1',v1'], ...)
//   %21 = extractvalue %20, 0                           -> rgba1
//   %22 = extractelement %0, i64 1                      -> position.y
//   %23 = fmul %22, 0.5
//   %24 = air.fast_fract.f32(%23)                       -> fract(y * 0.5) ∈ [0,1)
//   %25 = fadd %24, -0.5                                -> fract(y*0.5) - 0.5 ∈ [-0.5, 0.5)
//   %26 = fcmp olt %25, 0.0                             -> true iff fract(y*0.5) < 0.5,
//                                                          i.e. y modulo 2 lies in [0,1)
//                                                          (this is the "field 0" scanline).
//   %27/%28 = splat %26 to a <4 x i1> lane mask.
//   %29 = select splat(mask), rgba0, rgba1              -> per-lane; but the mask is
//                                                          scalar-splat so it's really
//                                                          "pick the whole vector".
//   ret %29
//
// The three inert double-encoded fp constants (0.5, 0.25 as 0.125, and
// -0.25 as -0.125 for lane 1 of the fmul-then-fadd) all decode exactly
// under fp32; no `Math.fround` on the literals is needed to get bit-exact
// fp32 (they are already representable exactly).
//
// air.fast_floor on <4 x float>: with `fast_math_enable` this is the
// standard floor-to-negative-infinity; for finite inputs `Math.floor`
// matches bit-exactly under fp32.
// air.fast_fract on f32: returns `x - floor(x)` (Metal spec). For finite
// inputs this equals `x - Math.floor(x)` in fp64 rounded to fp32; here
// only the sign is tested so any fp32-accurate `fract` suffices.
// air.sample_texture_2d: the trailing offset/bias/min_lod args are inert
// at both call sites (offset=<0,0>, bias flag disabled, bias=0.0,
// min_lod=0.0, sampler_bias=0), matching the callback contract below.
//
// Semantics: this is a de-interlace / field-combine fragment used by the
// Motion `Hgc2CombineFields` render node. Two textures each carry ONE
// field of an interlaced source; the fragment picks the field belonging
// to the current scanline (via `position.y`) after snapping the UVs to
// the appropriate half-height / full-height pixel grid. On even scanlines
// (fract(y * 0.5) < 0.5, i.e. y in [2k, 2k+1)) it returns tex0; on odd
// scanlines it returns tex1.

/**
 * Callback signature for AIR `air.sample_texture_2d.v4f32` — the caller
 * supplies a function that, given the opaque texture handle plus a 2D UV,
 * returns the sampled RGBA as four f32-valued numbers. The trailing
 * offset/bias/min_lod parameters of the intrinsic are inert at every call
 * site in this shader (offset=<0,0>, bias flag disabled, bias=0.0,
 * min_lod=0.0, sampler_bias=0) and are not modeled.
 */
export type Sample2DFn<T> = (texture: T, u: number, v: number) => [number, number, number, number];

/**
 * Fragment shader `Hgc2CombineFields` — reconstructs an interlaced frame
 * by picking one of two field textures per scanline.
 *
 *   u0' = floor(texcoord0.x - 0.25) + 0.5
 *   v0' = floor((texcoord0.y - 0.25) * 0.5) + 0.5
 *   u1' = floor(texcoord1.x - 0.25) + 0.5
 *   v1' = floor((texcoord1.y - 0.25) * 0.5) + 0.5
 *   pick_field0 = (fract(position.y * 0.5) < 0.5)
 *   out = pick_field0
 *       ? texture0.sample(sampler0, u0', v0')
 *       : texture1.sample(sampler1, u1', v1')
 *
 * @shader Hgc2CombineFields (TextFramework)
 * @param position  Fragment position (`air.position`). Only lane 1 (`.y`) is
 *                  read (matches `extractelement %0, i64 1` in the .ll).
 * @param texcoord0 The .xy is the pre-snap UV into texture0.
 * @param texcoord1 The .xy is the pre-snap UV into texture1.
 * @param texture0  Opaque texture handle for texture0 (field 0).
 * @param texture1  Opaque texture handle for texture1 (field 1).
 * @param sample    Bound `air.sample_texture_2d.v4f32`; used once per
 *                  texture (each supplies its own sampler externally).
 * @returns         RGBA float4 chosen per-scanline as fp32 numbers.
 */
export function Hgc2CombineFields<T>(
  position: [number, number, number, number],
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  texture0: T,
  texture1: T,
  sample: Sample2DFn<T>,
): [number, number, number, number] {
  // %8/%9/%10/%11 — snap texcoord0. Only lanes 0 and 1 survive to the
  // subsequent shufflevector <0,1>, so lanes 2/3 (poison after +0.5) are
  // not computed here.
  //
  // Lane 0: u0' = floor(u0 * 1.0 + (-0.25)) + 0.5 = floor(u0 - 0.25) + 0.5.
  // Lane 1: v0' = floor(v0 * 0.5 + (-0.125)) + 0.5.
  //
  // The `Math.fround` calls preserve the fp32 rounding that Metal applies
  // between each fmul/fadd/floor step (the .ll fmul/fadd are all fp32 vec
  // ops; the constants 0.5, -0.25, -0.125 are all exact in fp32).
  const u0 = Math.fround(Math.floor(Math.fround(Math.fround(texcoord0[0]) - Math.fround(0.25))) + Math.fround(0.5));
  const v0 = Math.fround(
    Math.floor(Math.fround(Math.fround(Math.fround(texcoord0[1]) * Math.fround(0.5)) - Math.fround(0.125))) +
      Math.fround(0.5),
  );

  // %12/%13/%14/%15 — same transform on texcoord1.
  const u1 = Math.fround(Math.floor(Math.fround(Math.fround(texcoord1[0]) - Math.fround(0.25))) + Math.fround(0.5));
  const v1 = Math.fround(
    Math.floor(Math.fround(Math.fround(Math.fround(texcoord1[1]) * Math.fround(0.5)) - Math.fround(0.125))) +
      Math.fround(0.5),
  );

  // %16..%18 — sample texture0 at [u0', v0'].
  const rgba0 = sample(texture0, u0, v0);
  // %19..%21 — sample texture1 at [u1', v1'].
  const rgba1 = sample(texture1, u1, v1);

  // %22 = extractelement position, 1 -> position.y.
  const y = Math.fround(position[1]);
  // %23 = y * 0.5.
  const hy = Math.fround(y * Math.fround(0.5));
  // %24 = air.fast_fract(hy).
  //   Metal `fract(x)` = x - floor(x) (spec). For finite `hy` this
  //   matches the closed-form; `Math.fround` around the subtraction
  //   keeps the intermediate in fp32.
  const frac = Math.fround(hy - Math.floor(hy));
  // %25 = frac + (-0.5).
  const shifted = Math.fround(frac - Math.fround(0.5));
  // %26 = shifted < 0.0. The vector select uses a splat of this bit, so
  // the whole float4 is chosen wholesale.
  const pickField0 = shifted < Math.fround(0.0);

  // %27..%29 = select-splat(pickField0, rgba0, rgba1) — wholesale pick.
  return pickField0 ? rgba0 : rgba1;
}
