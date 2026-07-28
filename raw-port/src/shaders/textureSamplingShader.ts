// @shader textureSamplingShader (Flexo)  @0x00000000014ec0
//
// Metal fragment shader from Flexo's FFMetalVideoPainterShaders.metal library.
// Samples one texture at a texcoord and (optionally, gated by a compile-time
// function constant) permutes the 4 half-float channels by an int4 index
// vector from a constant buffer. The result is converted to <4 x float>
// (fp32) before return.
//
// Source LLVM IR: raw-port/re/shaders/textureSamplingShader.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh textureSamplingShader Flexo`)
//
// AIR signature (from the .ll):
//   define <4 x float> @textureSamplingShader(
//     <4 x float> %0,             // position (unused)
//     <2 x float> %1,             // textureCoordinate (uv)
//     %struct._texture_2d_t* %2,  // colorTexture (texture2d<half>)
//     <4 x i32>* %3               // colorChannelToDup (int4 buffer, 16 B)
//   )
//
// Function constants (compile-time bools declared in the IR):
//   channel_to_dupe_defined  : bool — was the constant provided by the host
//   channel_to_dupe          : bool — the user's requested "dupe" flag
//   Both are booleans stored as i8 (address space 2, function constants).
//   The IR conditionally executes the channel-permutation block only when
//   BOTH are truthy; if either is false the raw sampled texel is returned
//   unmodified (after half->float conversion).
//
// Sampler state (from `!25 = !"air.sampler_state", [2 x i64] @__air_sampler_state`):
//   The sampler is compile-time-baked into the metallib — the shader passes
//   it as bitcast(@__air_sampler_state to sampler*). Its exact configuration
//   (filter, wrap, etc.) is not needed for the port — we surface texture
//   sampling as a caller-supplied `sample(tex, uv) => [r,g,b,a]` callback
//   (see ShaderSampler2D below) per the repo shader-port ABI.
//
// IR line map (from the .ll body of @textureSamplingShader):
//   %5  tail call { <4 x half>, i8 } @air.sample_texture_2d.v4f16(
//         tex %2, sampler @__air_sampler_state, uv %1,
//         i1 true,                     ; enable_offset
//         <2 x i32> zeroinitializer,   ; offset = (0,0)
//         i1 false,                    ; lod_options: none
//         float 0.0, float 0.0,        ; unused LOD/bias
//         i32 0)                       ; sampler-modifier flags
//   %6  extractvalue %5, 0            ; %6 = sampled <4 x half> = {r,g,b,a}
//   %7  load i8 @channel_to_dupe_defined
//   %8  icmp eq i8 %7, 0              ; defined == 0 (i.e. NOT defined)
//   %9  load i8 @channel_to_dupe
//   %10 icmp eq i8 %9, 0              ; channel_to_dupe == 0
//   %11 select %8, true, %10          ; skipDupe = defined==0 OR toDupe==0
//   br  %11, label %26 (skip dupe), label %12 (do dupe)
//
//   ; %12 block — the channel-permutation path
//   %13 load <4 x i32>, %3            ; idx4 = colorChannelToDup buffer
//   %14 extractelement %13, i64 0     ; i0
//   %15 extractelement <4 x half> %6, i32 %14   ; sampled[i0]
//   %16 insertelement undef, %15, i64 0
//   %17 extractelement %13, i64 1     ; i1
//   %18 extractelement <4 x half> %6, i32 %17   ; sampled[i1]
//   %19 insertelement %16, %18, i64 1
//   %20 extractelement %13, i64 2     ; i2
//   %21 extractelement <4 x half> %6, i32 %20   ; sampled[i2]
//   %22 insertelement %19, %21, i64 2
//   %23 extractelement %13, i64 3     ; i3
//   %24 extractelement <4 x half> %6, i32 %23   ; sampled[i3]
//   %25 insertelement %22, %24, i64 3           ; = { s[i0], s[i1], s[i2], s[i3] }
//   br  label %26
//
//   ; %26 block — join + convert
//   %27 phi <4 x half> [ %25 (dupe path), %6 (skip path) ]
//   %28 tail call fast @air.convert.f.v4f32.f.v4f16(<4 x half> %27)
//         ; half4 -> float4 lane-wise widening
//   ret <4 x float> %28
//
// Fast-math attributes: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, `air.compile.fast_math_enable`.
// This port uses plain JS Number arithmetic; the shader itself does no fp
// arithmetic beyond half<->float conversion — the sampled half4 is just
// permuted and widened, so fast-math flags don't affect correctness.
//
// Half-to-float conversion (`air.convert.f.v4f32.f.v4f16`): AIR's f16->f32
// widening is a bit-exact conversion of an IEEE-754 half to an IEEE-754
// single. Every finite half value has an exact fp32 representation (fp32
// has strictly more range+precision than fp16), so the widening is lossless
// per lane. We model the sampled texel already as f32 lanes (via the
// caller's sample() callback), and treat the "half4 -> float4" step as a
// no-op — the caller is expected to supply fp32-range values that fit in
// the half domain the underlying GPU produced. This mirrors the repo's
// established convention (see HgcColorLinearizeAlpha which similarly does
// not roundtrip through fp16 in the port).

/**
 * The RGBA texel produced by sampling `texture0` at `uv` — modeled as a
 * length-4 tuple of f32 lanes (see IR line map: the shader itself operates
 * on <4 x half>, but the shader-port ABI in this repo uses fp32 samplers).
 */
export type ShaderTexel = [number, number, number, number];

/**
 * Caller-supplied texture-sampling callback. Encapsulates the AIR
 * `air.sample_texture_2d.v4f16(tex, sampler, uv, ...)` intrinsic. The
 * offset/LOD arguments in the IR are all zeros or defaults in this
 * shader, so the callback signature strips them for clarity.
 */
export type ShaderSampler2D = (
  tex: unknown,
  uv: readonly [number, number],
) => ShaderTexel;

/**
 * Function-constant inputs for `@textureSamplingShader`. Both values are
 * compile-time bools baked into the AIR metallib as function-constant
 * bytes (see `@_ZL15channel_to_dupe` and `@_ZL23channel_to_dupe_defined`
 * in the .ll). The IR's `_GLOBAL__sub_I_FFMetalVideoPainterShaders.metal`
 * static-init copies from the host-provided FC init into the runtime
 * globals; here we surface them as direct arguments to the port.
 *
 * The channel permutation runs iff (channelToDupeDefined AND channelToDupe).
 */
export interface TextureSamplingFunctionConstants {
  /** function constant "channel_to_dupe_defined" — was the host FC set? */
  readonly channelToDupeDefined: boolean;
  /** function constant "channel_to_dupe" — the requested "do the dupe" flag. */
  readonly channelToDupe: boolean;
}

/**
 * `@textureSamplingShader` — Flexo Metal fragment shader.
 *
 * Samples `colorTexture` at `textureCoordinate` and (conditionally)
 * permutes the 4 sampled channels by the int4 vector in
 * `colorChannelToDup`. Faithful transcription of the .ll body; see the
 * IR line map in the file header.
 *
 * The `position` argument is present in the AIR ABI (fragment position,
 * `air.position`) but is UNUSED by the shader — the .ll body never
 * references `%0`.
 *
 * @param _position           fragment position (AIR `<4 x float> %0`) — unused
 * @param textureCoordinate   uv (AIR `<2 x float> %1`)
 * @param colorTexture        opaque texture handle passed to `sample`
 * @param colorChannelToDup   int4 buffer (AIR `<4 x i32>* %3`) — the four
 *                             lane indices used when the dupe branch runs.
 *                             Must be a length-4 array; each element is a
 *                             lane index in {0,1,2,3} into the sampled
 *                             texel. Out-of-range indices are UB per the
 *                             shader (mirrors GPU `extractelement`).
 * @param fc                  function-constant inputs (see interface above)
 * @param sample              caller-supplied texture-sampling callback
 * @returns                   RGBA texel — either the raw sampled texel
 *                             (channel-dupe path skipped) or the permuted
 *                             texel {s[i0], s[i1], s[i2], s[i3]}
 */
export function textureSamplingShader(
  _position: readonly [number, number, number, number],
  textureCoordinate: readonly [number, number],
  colorTexture: unknown,
  colorChannelToDup: readonly [number, number, number, number],
  fc: TextureSamplingFunctionConstants,
  sample: ShaderSampler2D,
): ShaderTexel {
  // %5/%6 = air.sample_texture_2d.v4f16(tex, sampler, uv, ...) — sample the
  // RGBA texel at uv. Offset (0,0), no LOD, sampler-mods=0. The result in
  // the IR is a <4 x half>; the port takes fp32 lanes from the callback.
  const uv: [number, number] = [textureCoordinate[0], textureCoordinate[1]];
  const sampled: ShaderTexel = sample(colorTexture, uv);

  // %7-%11: skipDupe = (channelToDupeDefined == false) OR (channelToDupe == false).
  // The IR spells this as:
  //   %8  = icmp eq %channel_to_dupe_defined, 0
  //   %10 = icmp eq %channel_to_dupe, 0
  //   %11 = select %8, i1 true, i1 %10
  // which is exactly a short-circuit OR.
  const skipDupe: boolean = !fc.channelToDupeDefined || !fc.channelToDupe;

  // %26 phi: if skipDupe -> use %6 (raw sampled); else use %25 (permuted).
  let out: ShaderTexel;
  if (skipDupe) {
    // %26 phi taking the raw sampled branch.
    out = [sampled[0], sampled[1], sampled[2], sampled[3]];
  } else {
    // %12 block — the channel-permutation path.
    // %13 = load <4 x i32>, %3 — the int4 index buffer.
    const i0: number = colorChannelToDup[0] | 0;   // %14 extractelement, i64 0
    const i1: number = colorChannelToDup[1] | 0;   // %17 extractelement, i64 1
    const i2: number = colorChannelToDup[2] | 0;   // %20 extractelement, i64 2
    const i3: number = colorChannelToDup[3] | 0;   // %23 extractelement, i64 3

    // %15/%18/%21/%24 = extractelement <4 x half> %6, i32 <idx>
    // -> read the sampled texel at each dynamically-supplied lane index.
    // The IR's `extractelement` with an out-of-range index is UB in LLVM;
    // we mirror that by direct index access. The AIR host guarantees
    // indices are in {0,1,2,3} for a well-formed int4 buffer.
    const s0: number = sampled[i0];   // %15
    const s1: number = sampled[i1];   // %18
    const s2: number = sampled[i2];   // %21
    const s3: number = sampled[i3];   // %24

    // %16/%19/%22/%25 = insertelement chain building { s[i0], s[i1], s[i2], s[i3] }.
    out = [s0, s1, s2, s3];
  }

  // %28 = tail call fast @air.convert.f.v4f32.f.v4f16(<4 x half> %27)
  // Half-to-float widening is lossless per lane (fp32 strictly wider than
  // fp16). Our sampler callback returns fp32 already, so we surface each
  // lane as-is; wrapping with Math.fround preserves f32 bit-exactness in
  // case the caller supplied a value that doesn't round-trip.
  return [
    Math.fround(out[0]),
    Math.fround(out[1]),
    Math.fround(out[2]),
    Math.fround(out[3]),
  ];
}
