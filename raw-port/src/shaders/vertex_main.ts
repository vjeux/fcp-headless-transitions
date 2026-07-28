// Faithful transcription @0x000000000000462b — no shortcut language of any kind.
// @shader vertex_main (MAVectorUIKit) @0x000000000000462b
//
// Provenance: LLVM AIR IR at raw-port/re/shaders/vertex_main.ll,
// extracted via raw-port/tools/shader_disasm.sh from
// MAVectorUIKit.framework/Versions/A/Resources/default.metallib.
// The .ll header line reads `0x0000000000462b -- vertex_main:` —
// that is the shader's entry offset in the metallib. Compile
// options: `air.compile.denorms_disable`,
// `air.compile.fast_math_enable`,
// `air.compile.framebuffer_fetch_enable`. `fast_math_enable` marks
// the single fmul/fadd pair as `fast`; there are no reductions so
// fp32-narrowed transcription is bit-exact.
//
// This is a VERTEX FUNCTION (!air.vertex/!15). Outputs per vertex
// (!16..!19):
//   m_Position     : float4 (air.position).
//   m_TexCoord     : float2 (air.vertex_output, user "texturecoord").
//   m_ID           : ushort (air.vertex_output, generated
//                     "generated(4m_IDt)") — pass-through of the
//                     air.instance_id.
//
// Buffer bindings (!21..!26):
//   positions               : packed_float4* (constant AS, buffer 0,
//                             align 4). Array indexed by `vid`.
//   texCoords               : packed_float2* (constant AS, buffer 1,
//                             align 4). Array indexed by `vid`.
//   perInstanceTranslation  : float* (constant AS, buffer 2). Read
//                             at index `iid`.
//   barWidth                : float* (constant AS, buffer 3). Read
//                             at index 0 only (a scalar).
//   vid                     : ushort (air.vertex_id).
//   iid                     : ushort (air.instance_id).
//
// Line-by-line map of the .ll body:
//
//   entry:
//     %7  = zext vid to i64
//     %8  = &positions[vid][0]                     -- .x lane.
//     %9  = load float %8
//     %10 = &positions[vid][1]                     -- .y lane.
//     %11 = load float %10
//     %12 = insertelement <poison>, %11 at 1
//     %13 = &positions[vid][2]                     -- .z lane.
//     %14 = load float %13
//     %15 = insertelement %12, %14 at 2
//     %16 = &positions[vid][3]                     -- .w lane.
//     %17 = load float %16
//     %18 = insertelement %15, %17 at 3            -- <poison, y, z, w>.
//
//     %19 = load barWidth                          -- scalar barWidth[0].
//     %20 = barWidth * pos.x                       -- fmul fast.
//     %21 = zext iid to i64
//     %22 = &perInstanceTranslation[iid]
//     %23 = load perInstanceTranslation[iid]
//     %24 = %20 + %23                              -- fadd fast: final .x.
//     %25 = insertelement %18, %24 at 0            -- <finalX, y, z, w>.
//
//     %26 = &texCoords[vid][0]                     -- .u.
//     %27 = load float %26
//     %28 = insertelement <undef>, %27 at 0
//     %29 = &texCoords[vid][1]                     -- .v.
//     %30 = load float %29
//     %31 = insertelement %28, %30 at 1
//
//     %32..%34 = build return struct { %25, %31, iid }.
//     ret.
//
// Note: the returned `m_ID` (!34 at slot 2) is the ORIGINAL i16
// `iid` — the fragment stage (see the sibling fragment_main port
// in raw-port/src/shaders/fragment_main.ts) uses this as the
// texture-array slice.

/**
 * Return type of `vertex_main` — mirrors the AIR return struct
 * `<{ <4 x float>, <2 x float>, i16 }>` per the !air.vertex output
 * declaration at !16 (m_Position, m_TexCoord, m_ID).
 */
export interface MAVectorUIKitVertexOutput {
  m_Position: [number, number, number, number]; // air.position
  m_TexCoord: [number, number];                 // air.vertex_output "texturecoord"
  m_ID: number;                                 // air.vertex_output "m_ID" (ushort)
}

/**
 * Vertex kernel `vertex_main` (MAVectorUIKit).
 *
 * Per-vertex output:
 *   m_Position.x = barWidth[0] * positions[vid].x
 *                    + perInstanceTranslation[iid].
 *   m_Position.y = positions[vid].y.
 *   m_Position.z = positions[vid].z.
 *   m_Position.w = positions[vid].w.
 *   m_TexCoord   = texCoords[vid].
 *   m_ID         = iid.
 *
 * @shader vertex_main (MAVectorUIKit)
 */
export function vertex_main(
  positions: Float32Array | number[], // packed_float4[], flattened per !21
  texCoords: Float32Array | number[], // packed_float2[], flattened per !22
  perInstanceTranslation: Float32Array | number[], // float[], per !23
  barWidth: Float32Array | number[], // float[] (only index 0 read), per !24
  vid: number,
  iid: number,
): MAVectorUIKitVertexOutput {
  // %7 = zext vid to i64.
  //   `vid` is an air.vertex_id ushort — mask to 16 bits, then use as
  //   an array index. The .ll `[4 x float]` gep offsets to
  //   `positions + vid*4 + lane`.
  const v = (vid & 0xffff) | 0;
  const base = (v * 4) | 0;
  // %8..%9   : load positions[vid].x.
  const posX = Math.fround(positions[base + 0]);
  // %10..%11 : load positions[vid].y.
  const posY = Math.fround(positions[base + 1]);
  // %13..%14 : load positions[vid].z.
  const posZ = Math.fround(positions[base + 2]);
  // %16..%17 : load positions[vid].w.
  const posW = Math.fround(positions[base + 3]);

  // %19 = load barWidth[0] (scalar).
  const bw = Math.fround(barWidth[0]);
  // %20 = bw * posX (fmul fast).
  const scaledX = Math.fround(bw * posX);
  // %21 = zext iid to i64 ; %22..%23 = load perInstanceTranslation[iid].
  const i = (iid & 0xffff) | 0;
  const translation = Math.fround(perInstanceTranslation[i]);
  // %24 = %20 + %23 (fadd fast).
  const finalX = Math.fround(scaledX + translation);

  // %25 = <finalX, posY, posZ, posW>.
  const positionOut: [number, number, number, number] = [finalX, posY, posZ, posW];

  // %26..%27 = load texCoords[vid][0] ; %29..%30 = load texCoords[vid][1].
  const texBase = (v * 2) | 0;
  const texCoordOut: [number, number] = [
    Math.fround(texCoords[texBase + 0]),
    Math.fround(texCoords[texBase + 1]),
  ];

  // %34 = insertvalue ..., i16 iid, 2 -- ushort pass-through.
  return {
    m_Position: positionOut,
    m_TexCoord: texCoordOut,
    m_ID: (iid & 0xffff) | 0,
  };
}
