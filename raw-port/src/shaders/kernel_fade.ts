// Faithful transcription @0x00000000000b0b — EDEL.framework/Versions/A/Frameworks/MAVectorUIKit.framework/Versions/A/Resources/default.metallib
// @shader kernel_fade (MAVectorUIKit)
//
// Compute kernel that reduces the alpha channel of a texel by a constant `parameters` amount
// and writes the result to the output texture (RGB channels are copied verbatim). Used by
// the MAVectorUIKit fade-out compositing pass (see kernel_fadeHold / kernel_fadeHoldInfinite
// siblings which build a plateau-then-fade curve on top of this primitive).
//
// Source LLVM IR: raw-port/re/shaders/kernel_fade.ll (extracted manually from EDEL's
// nested MAVectorUIKit metallib — raw-port/tools/shader_disasm.sh cannot walk into
// nested .framework paths because it does `find $FWROOT/$FWHINT.framework` which does not
// match nested Frameworks/ subdirs).
//
// AIR signature (from air.kernel !15 and !17..!21):
//   define void @kernel_fade(
//     texture2d<float, read>  inTexture   ; !18 air.texture location 0
//     texture2d<float, write> outTexture  ; !19 air.texture location 1
//     constant float*         parameters  ; !20 air.buffer  location 0, address_space 2 (4 bytes)
//     uint2                   gid         ; !21 air.thread_position_in_grid
//   )
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable (air.compile.fast_math_enable). We use
// Math.fround to preserve fp32 lane values.
//
// The IR is trivial (7 instructions in the body):
//   %5  = air.read_texture_2d.v4f32(inTexture, gid, lod=0, sampler=1)  -> { <4 x float>, i8 }
//   %6  = extractvalue %5, 0                                          -> texel.rgba
//   %7  = load parameters                                             -> fadeAmount (float)
//   %8  = extractelement %6, 3                                        -> texel.a
//   %9  = fsub fast %8, %7                                            -> texel.a - fadeAmount
//   %10 = insertelement %6, %9, 3                                     -> texel with new alpha
//   air.write_texture_2d.v4f32(outTexture, gid, %10, mip=0, access=2)
//
// The IR performs NO clamping on the resulting alpha — negative values are written verbatim
// to the destination texture (the hardware format-conversion clamp on write is the only gate).
// We mirror that literally: no clamp on the subtraction.
//
// SAMPLER/MIP CONSTANTS: air.read_texture_2d takes (texture, coord, lod=0, sampler=1); air.write
// takes (texture, coord, value, mip=0, access=2 = read-write). Those are the fixed AIR call
// constants and have no runtime effect on the returned math — documented here for provenance.

/**
 * Minimal texture-2d interface: RGBA float sampling by integer (x, y) coord.
 *
 * `read(x, y)` returns the texel as a 4-tuple [r, g, b, a]. The AIR IR
 * `air.read_texture_2d.v4f32` returns `{ <4 x float>, i8 }` — the trailing i8 is a
 * "resident" flag that this kernel discards (extractvalue index 0). Out-of-bounds
 * behavior is defined by the caller's texture backing.
 */
export interface Texture2DFloat4Read {
  read(x: number, y: number): [number, number, number, number];
}

/**
 * Minimal writable texture-2d interface: RGBA float write by integer (x, y) coord.
 */
export interface Texture2DFloat4Write {
  write(x: number, y: number, texel: [number, number, number, number]): void;
}

/**
 * @shader kernel_fade (MAVectorUIKit) — faithful port of the AIR IR.
 *
 * @param inTexture  %0 read-only source texture (air.texture location 0).
 * @param outTexture %1 write-only destination texture (air.texture location 1).
 * @param parameters %2 float constant buffer — parameters[0] = fadeAmount (subtracted from alpha).
 * @param gid        %3 air.thread_position_in_grid (uint2). `gid.x` / `gid.y` index the texel.
 */
export function kernel_fade(
  inTexture: Texture2DFloat4Read,
  outTexture: Texture2DFloat4Write,
  parameters: Float32Array | readonly number[],
  gid: [number, number],
): void {
  // %5 = air.read_texture_2d.v4f32(inTexture, gid, lod=0, sampler=1)
  // %6 = extractvalue { <4 x float>, i8 } %5, 0   -> texel.rgba
  const texel = inTexture.read(gid[0] | 0, gid[1] | 0);

  // %7 = load float, float addrspace(2)* %parameters, align 4    -> fadeAmount
  const fadeAmount = Math.fround(parameters[0]);

  // %8 = extractelement <4 x float> %6, i64 3    -> texel.a
  const oldA = Math.fround(texel[3]);

  // %9 = fsub fast float %8, %7                  -> texel.a - fadeAmount  (no clamp; IR does not clamp)
  const newA = Math.fround(oldA - fadeAmount);

  // %10 = insertelement <4 x float> %6, float %9, i64 3   -> texel with new alpha
  // air.write_texture_2d.v4f32(outTexture, gid, %10, mip=0, access=2)
  outTexture.write(gid[0] | 0, gid[1] | 0, [
    Math.fround(texel[0]),
    Math.fround(texel[1]),
    Math.fround(texel[2]),
    newA,
  ]);
}
