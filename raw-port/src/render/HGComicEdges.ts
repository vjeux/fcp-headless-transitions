// raw-port/src/render/HGComicEdges.ts
//
// FCP `HGComicEdges` — Helium render-graph node that implements the "Comic
// Edges" image effect (edge detection with an extended Difference-of-Gaussian
// threshold, plus a small skin-tone-aware luma switch).  The class is a thin
// HGNode subclass owning four float parameters at offsets 0x198/0x19c/0x1a0/
// 0x1a4 and a matching Metal / GLSL fragment shader.  On the GPU path,
// GetProgram hands the raw shader source to the driver; on the CPU path,
// RenderTile evaluates the same math per-pixel with SSE (native code left as
// a throwing stub — see below).
//
// FRAMEWORK: Helium.framework (Final Cut Pro), x86_64 slice.
// DECODE: raw-port/re/disasm/Helium.HGComicEdges.*.s
//
// -----------------------------------------------------------------------------
// SYMBOLS TRANSCRIBED (Helium x86_64 slice; VAs from `nm -n` / `otool -tV`)
// -----------------------------------------------------------------------------
//   @0x6220  __ZN12HGComicEdgesC2Ev   HGComicEdges::HGComicEdges() [C2]
//   @0x6250  __ZN12HGComicEdgesC1Ev   HGComicEdges::HGComicEdges() [C1]
//   @0x6280  __ZN12HGComicEdgesD2Ev   HGComicEdges::~HGComicEdges() [D2]
//   @0x6290  __ZN12HGComicEdgesD1Ev   HGComicEdges::~HGComicEdges() [D1]
//   @0x62a0  __ZN12HGComicEdgesD0Ev   HGComicEdges::~HGComicEdges() [D0]
//   @0x62c0  __ZN12HGComicEdges12SetParameterEiffff
//                                     HGComicEdges::SetParameter(int, float, float, float, float)
//   @0x6360  __ZNK12HGComicEdges18IntermediateFormatE8HGFormat
//                                     HGComicEdges::IntermediateFormat(HGFormat) const  [ICF-folded — see stub]
//   @0x6370  __ZN12HGComicEdges6GetDODEP10HGRendereri6HGRect
//                                     HGComicEdges::GetDOD(HGRenderer*, int, HGRect)
//   @0x6390  __ZN12HGComicEdges6GetROIEP10HGRendereri6HGRect
//                                     HGComicEdges::GetROI(HGRenderer*, int, HGRect)
//   @0x6450  __ZN12HGComicEdges10RenderTileEP6HGTile
//                                     HGComicEdges::RenderTile(HGTile*)     [CPU shader — throwing stub, 471-line SIMD]
//   @0x6c60  __ZN12HGComicEdges9GetOutputEP10HGRenderer
//                                     HGComicEdges::GetOutput(HGRenderer*)
//   @0x6ca0  __ZN12HGComicEdges10GetProgramEP10HGRenderer
//                                     HGComicEdges::GetProgram(HGRenderer*)
//   @0x6d00  __ZN12HGComicEdges11BindTextureEP9HGHandleri
//                                     HGComicEdges::BindTexture(HGHandler*, int)
//   @0x6d50  __ZNK12HGComicEdges21InitProgramDescriptorEP19HGProgramDescriptor
//                                     HGComicEdges::InitProgramDescriptor(HGProgramDescriptor*) const  [empty body]
//
// -----------------------------------------------------------------------------
// VTABLE @Helium 0xa030c8 (RTTI header; installed pointer = vtable+0x10 = 0xa030d8;
// verified by `resolve.py Helium vtable HGComicEdges`).
// Slots this class overrides (all others inherit HGNode's):
//   *0x00 = 0x6290  ~HGComicEdges() [D1]
//   *0x08 = 0x62a0  ~HGComicEdges() [D0]
//   *0x60 = 0x62c0  SetParameter(int, float, float, float, float)
//   *0xb0 = 0x6450  RenderTile(HGTile*)
//   *0xb8 = 0x6ca0  GetProgram(HGRenderer*)
//   *0xd0 = 0x6d00  BindTexture(HGHandler*, int)
// (Retain/Release/debugDescription/GetParameter/... all inherit from
//  HGObject/HGNode; verified in the vtable dump.)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from C2 ctor @0x6250 + SetParameter @0x62c0 +
// GetOutput @0x6c60 + BindTexture @0x6d00). HGNode-base is 0x198 bytes wide.
// -----------------------------------------------------------------------------
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts).  C2 tail-calls
//                    HGNode::HGNode() (@0x6259) BEFORE any own-field writes,
//                    then does `orb $0x6, 0x11(%rbx)` @0x6272 — which OR-s
//                    bits (0x6 << 8) = 0x600 into `renderPageStrategy` at
//                    offset 0x10..0x13 (HGNode's u32 initialized to 0x200 by
//                    its ctor @Helium 0x11bc3b).  Effective final value 0x600.
//   ---- HGComicEdges-specific fields (start at 0x198) ----
//     0x198 : f32   param0        (SetParameter idx=0 stores here; GetOutput
//                                  passes this as xmm0=arg2 to base
//                                  HGNode::SetParameter(0, ...))
//     0x19c : f32   param3        (SetParameter idx=3 stores here; GetOutput
//                                  passes as xmm1=arg3)
//     0x1a0 : f32   param1        (SetParameter idx=1 stores here; GetOutput
//                                  passes as xmm2=arg4)
//     0x1a4 : f32   param2        (SetParameter idx=2 stores here; GetOutput
//                                  passes as xmm3=arg5)
//
//   Semantic mapping (from the embedded Metal/GLSL shader source in
//   GetProgram's literal pool):
//     shader hg_Params[0].x = sigma             ← field @0x198  = SetParameter idx 0
//     shader hg_Params[0].y = prethreshold      ← field @0x19c  = SetParameter idx 3
//     shader hg_Params[0].z = threshold         ← field @0x1a0  = SetParameter idx 1
//     shader hg_Params[0].w = thresholdCoeffAdj ← field @0x1a4  = SetParameter idx 2
//   The scrambled idx→offset table is verified from the jump table @0x6350:
//     idx 0 → +0x198,  idx 1 → +0x1a0,  idx 2 → +0x1a4,  idx 3 → +0x19c.
//
//   The ctor @0x6268 does a single `xorps xmm0; movups xmm0, 0x198(%rbx)`
//   which zeroes exactly 16 bytes @0x198..0x1a7 — i.e. the 4 float params in
//   one write.  Sizeof(HGComicEdges) = 0x1a8 bytes.
//
// -----------------------------------------------------------------------------
// GetProgram RESOURCES: two embedded shader-source strings, transcribed
// verbatim from the framework's literal pool.  The Metal source (MD5
// 2a7fc464:8323abc9:a452038b:3e4bfd59) is returned when the renderer's
// active target > 0x60b0f; otherwise the GLSL source (MD5 6b6ff578:2a238d62:
// fa69622e:3bf77bdd) is returned iff the renderer supports capability 0x2e
// (queried via HGRenderer::vt[0x80]).  Both compute the same math:
//   1. Sample the gradient texture (Texture1) at texCoord1, extract .yz as
//      the local gradient direction, and .a as the alpha to preserve.
//   2. Sample the source RGB (Texture0) at texCoord0, compute ITU-R BT.709
//      luma weights .2126/.7152/.0722, plus a per-channel U/V pair for a
//      chroma-angle test.
//   3. If |chromaAngle - 2.3| < 0.3 (skintone), OR srcY > 0.8, OR srcY < 0.4,
//      switch to a red-only luma weighting.
//   4. Extended Difference-of-Gaussian: sum coefficients
//         coeff.x = exp(-i^3 * 0.5)              (fixed kernel)
//         coeff.y = exp(-i^3 * sigma22)          (sigma-scaled kernel)
//      where sigma22 = 1/(2*sigma^2), sigmax2 = 2*sigma, for i = 1..sigmax2.
//   5. total = (acc.x - acc.y * (0.99 + thresholdCoeffAdj)) * 300 * prethreshold.
//   6. Output = step(0.8, total) in the red channel, gradient.yz preserved
//      in green/blue, alpha unchanged; clamp to [0,1].
// -----------------------------------------------------------------------------

import { HGNode } from "./HGNode.js";
import {
  HGRect,
  HGRectNull,
  HGRectMake4i,
  HGRectGrow,
} from "./HGRect.js";

// ---------------------------------------------------------------------------
// FRONTIER — imports that still need to be transcribed.
// Each is a stub with @0xADDR citations per PORTING_SPEC.md rule 3.
// ---------------------------------------------------------------------------

/**
 * `HGRenderer` — the render-graph traversal driver. HGComicEdges references
 * one method:
 *   GetTarget(unsigned int) -> u32       @Helium __ZN10HGRenderer9GetTargetEj
 * plus the generic virtual-slot query at *0x80 (a capability probe called
 * from GetProgram @0x6cd6).  Not yet transcribed.
 */
export interface HGRendererStub {
  /** @Helium __ZN10HGRenderer9GetTargetEj — called from GetProgram @0x6cb1. */
  GetTarget(kind: number): number;
  /**
   * Called from GetProgram @0x6cd6 via `callq *0x80(%rax)` on the renderer's
   * own vtable — the arg is `$0x2e` (46). Slot *0x80 on HGRenderer is not yet
   * decoded (the render vtable itself is a frontier).
   */
  vt_0x80(cap: number): number;
}

/**
 * `HGTile` — the per-tile render unit passed to RenderTile @0x6450. Its
 * exact field layout is read densely by the SIMD render kernel there and is
 * a frontier decode.
 */
export interface HGTileStub {
  readonly __brand: "HGTile";
}

/**
 * `HGHandler` — the GPU driver surface used by BindTexture. HGComicEdges
 * references three vtable slots on it (verified in disasm below):
 *   *0x30  — @Helium 0x6d45 called with (1, 1)
 *   *0x38  — @Helium 0x6d32 called with (0)
 *   *0x48  — @Helium 0x6d27 called with (textureIndex, 0)
 * plus one C symbol:
 *   HGHandler::TexCoord(int, int, int, double const*)
 *     @Helium __ZN9HGHandler8TexCoordEiiiPKd
 * All are frontiers.
 */
export interface HGHandlerStub {
  /** @Helium 0x6d45 — 3rd vcall (slot +0x30). */
  vt_0x30(a: number, b: number): number;
  /** @Helium 0x6d32 — 2nd vcall (slot +0x38). */
  vt_0x38(a: number): number;
  /** @Helium 0x6d27 — 1st vcall (slot +0x48). */
  vt_0x48(idx: number, b: number): number;
  /** @Helium __ZN9HGHandler8TexCoordEiiiPKd — called from BindTexture @0x6d18. */
  TexCoord(a: number, b: number, c: number, coords: Float64Array | null): void;
}

/**
 * `HGProgramDescriptor` — argument to InitProgramDescriptor @0x6d50.
 * The body of this method is empty (`pushq %rbp; movq %rsp,%rbp; popq %rbp; retq`
 * — 4 real instructions @0x6d50..0x6d55). Frontier layout.
 */
export interface HGProgramDescriptorStub {
  readonly __brand: "HGProgramDescriptor";
}

/**
 * `HGFormat` — argument to IntermediateFormat @0x6360. Symbol resolves via
 * ICF (identical-code-folding) to a body with no distinct label extracted;
 * we cannot faithfully port it. Kept as a frontier stub citing @Helium 0x6360.
 */
export interface HGFormatStub {
  readonly __brand: "HGFormat";
}

// ---------------------------------------------------------------------------
// HGRect::Grow(HGRect) — method-form helper called from GetROI.
// ---------------------------------------------------------------------------

/**
 * `HGRect::Grow(HGRect)` — Helium @0x1072e0 (mangled `__ZN6HGRect4GrowES_`).
 * A member-form of the ported free function `HGRectGrow` (see HGRect.ts).
 * Called from GetROI @0x63e1 and @0x642c.  The body does corner-wise
 * saturating int32 addition of the 4 corners of `self` with the 4 corners
 * of `arg` — identical arithmetic to the already-decoded free function
 * `HGRectGrow` in HGRect.ts @Helium 0x107960.
 *
 *   0x1072e7..0x10731c   x0-add with signed-overflow saturation
 *   0x10731c..0x10734c   y0-add with signed-overflow saturation
 *   0x10734c..0x10737c   x1-add with signed-overflow saturation
 *   0x10737c..0x1073b0   y1-add with signed-overflow saturation
 *
 * Both symbols implement the same saturating-add helper. Delegate to the
 * ported HGRectGrow which implements this exact math.
 */
function HGRect_Grow_method(self: HGRect, arg: HGRect): HGRect {
  return HGRectGrow(self, arg);
}

/**
 * `HGNode::SetParameter(int, float, float, float, float)` — Helium @0x11cab0
 * (mangled `__ZN6HGNode12SetParameterEiffff`).  Base-class virtual invoked
 * from HGComicEdges::GetOutput @0x6c8b to publish the 4-float parameter tuple
 * to HGNode's parameter array (@offset 0x30) with dirty-bit tracking.
 * Not yet ported to HGNode.ts (see the vtable citation there at *0x60 =
 * 0x11cab0).  Frontier stub throwing @Helium 0x11cab0 until decoded.
 */
function HGNode_SetParameter_frontier(
  _self: HGNode,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): number {
  throw new Error(
    "HGNode::SetParameter @Helium 0x11cab0 not yet ported — " +
      "invoked from HGComicEdges::GetOutput @Helium 0x6c8b.",
  );
}

// ---------------------------------------------------------------------------
// EMBEDDED SHADER SOURCES (verbatim from GetProgram's literal pool @Helium)
// ---------------------------------------------------------------------------

/**
 * Metal fragment shader — returned by GetProgram when the target is > 0x60b0f.
 * Literal-pool string @Helium (RIP-relative from @0x6cbd + 7 = @0x6cc4 base,
 * disp 0x8ae556 → data addr 0x8b521a).
 * MD5 comment inside the source: `2a7fc464:8323abc9:a452038b:3e4bfd59`.
 */
export const HGCOMICEDGES_METAL_SHADER: string =
  "//Metal1.0     \n//LEN=0000000cbb\nfragment FragmentOut fragmentFunc(VertexInOut" +
  "            frag        [[ stage_in ]],\n                                  const constant" +
  " float4* hg_Params   [[ buffer(0) ]],\n                                  texture2d< float >" +
  "      hg_Texture0 [[ texture(0) ]],\n                                  sampler" +
  "                hg_Sampler0 [[ sampler(0) ]],\n                                  texture2d<" +
  " float >      hg_Texture1 [[ texture(1) ]],\n                                  sampler" +
  "                hg_Sampler1 [[ sampler(1) ]])\n{\n    const float sigma {static_cast<float>" +
  "(hg_Params[0].x)};\n    const float prethreshold {hg_Params[0].y};\n    const float" +
  " thesholdCoeffAdj {hg_Params[0].w};\n    \n    const float sigma22 {1.0f / (2.0f * sigma *" +
  " sigma)};\n    const float sigmax2 {2.0f * sigma};\n    \n    const float alpha" +
  " {hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).a};\n    \n    const float2 gradient" +
  " = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).yz;\n    const float2 dirPerpen" +
  " {gradient.y * 2.0f - 1.0f, -(gradient.x * 2.0f - 1.0f)};\n    \n    float3 lumaWeights" +
  " {0.2126f, 0.7152f, 0.0722f};\n    constexpr float3 uWeights {-0.1146f, -0.3854f, 0.5000f};" +
  "\n    constexpr float3 vWeights {0.5000f, -0.4542f, -0.0458f};\n    \n    const float3" +
  " srcRGB = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).rgb;\n    \n    const float" +
  " srcY {dot(srcRGB, lumaWeights)};\n    const float srcU {dot(srcRGB, uWeights)};\n    const" +
  " float srcV {dot(srcRGB, vWeights)};\n    \n    const float chromaAngle {atan2(srcV," +
  " srcU)};\n    \n    // if skintone found, then detect edges only on red channel to reduce" +
  " wrinkles and shadows, otherwise use ITU Rec.709 luma for sky, trees, etc.\n    float luma =" +
  " {srcY};\n    \n    if (abs(chromaAngle - 2.3f) < 0.3f || srcY > 0.8f || srcY < 0.4f)\n" +
  "    {\n        luma = {srcRGB.r};\n        lumaWeights = {1.0f, 0.0f, 0.0f};\n    }\n" +
  "    \n    // edge detection using extended difference of gaussian thresholding\n    float2" +
  " acc {luma, luma};\n    float2 norma {0.5f, 0.5f};\n    \n    for (float i {1.0f}; i <=" +
  " sigmax2; i++)\n    {\n        const float2 coeff {exp(-i * i * i * 0.5f), exp(-i * i * i" +
  " * sigma22)};\n        \n        const float2 uNeg = frag._texCoord0.xy -" +
  " static_cast<float2>(i * dirPerpen);\n        const float2 uPos = frag._texCoord0.xy +" +
  " static_cast<float2>(i * dirPerpen);\n        \n        const float3 pixel1 =" +
  " hg_Texture0.sample(hg_Sampler0, uNeg).rgb;\n        const float3 pixel2 =" +
  " hg_Texture0.sample(hg_Sampler0, uPos).rgb;\n        \n        norma += coeff;\n        acc" +
  "   += static_cast<float2>(coeff * dot((pixel1+pixel2), lumaWeights));\n    }\n    \n    acc" +
  " = acc * 0.5f / static_cast<float2>(norma);\n    \n    const float total" +
  " {static_cast<float>((acc.x  - acc.y * (0.99f + thesholdCoeffAdj)) * 300.0f *" +
  " prethreshold)};\n    \n    FragmentOut out {float4(step(0.8f, total)," +
  " static_cast<float2>(gradient), alpha)};\n    \n    // Ensure the result is clamped [0..1];" +
  " this is the default behavior of the original\n    // comic effect - this was implicit due" +
  " to non-float, 8-bit, intermediate buffers.\n    out.color0 = clamp(out.color0, 0.0f," +
  " 1.0f);\n    \n    return out;\n}\n//MD5=2a7fc464:8323abc9:a452038b:3e4bfd59\n//SIG=00000000" +
  ":00000000:00000000:00000000:0021:0001:0000:0000:0000:0000:0006:0000:0002:02:0:1:0\n";

/**
 * GLSL (fragment 1.0) shader — returned by GetProgram when the target is
 * ≤ 0x60b0f AND the renderer supports capability 0x2e.  Literal-pool
 * string @Helium (RIP-relative from @0x6ce9 base, disp 0x8af1ed).
 * MD5 comment inside the source: `6b6ff578:2a238d62:fa69622e:3bf77bdd`.
 */
export const HGCOMICEDGES_GLSL_SHADER: string =
  "//GLfs1.0      \n//LEN=0000000ae7\n#ifndef GL_ES\n#define lowp\n#define mediump\n" +
  "#define highp\n#define precision\n#define defaultp mediump\n#endif\n\nprecision highp" +
  " float;\nprecision highp int;\n\nuniform defaultp sampler2DRect hg_Texture0; //BFFILTER\n" +
  "uniform defaultp sampler2DRect hg_Texture1; //GAUSSFILTER\n\nuniform highp vec4" +
  " hg_ProgramLocal0;    // {.x == sigma, .y == prethreshold, .z == threshold, .w == threshold" +
  " coeff adj}\n\nvoid main()\n{\n    float sigma = hg_ProgramLocal0.x;\n    float" +
  " prethreshold = hg_ProgramLocal0.y;\n    float threshold = hg_ProgramLocal0.z;\n    float" +
  " thresholdCoeffAdj = hg_ProgramLocal0.w;\n\n    float sigma22 = 1.0/ (2.0 * sigma  * sigma)" +
  " ;\n    float sigmax2 = 2.0 * sigma ;\n\n    float alpha = texture2DRect(hg_Texture1," +
  " gl_TexCoord[1].xy).a;\n    vec2 gradient = texture2DRect(hg_Texture1, gl_TexCoord[1].xy).yz;" +
  "\n    vec2 dirPerpen = vec2(gradient.y*2.0-1.0,  -(gradient.x*2.0-1.0));\n\n    vec3" +
  " lumaWeights = vec3( 0.2126,  0.7152, 0.0722);\n    vec3 uWeights    = vec3(-0.1146," +
  " -0.3854, 0.5000);\n    vec3 vWeights    = vec3( 0.5000, -0.4542,-0.0458);\n    vec3 srcRGB" +
  " = texture2DRect( hg_Texture0, gl_TexCoord[0].xy ).rgb;\n    float srcY = dot(srcRGB," +
  " lumaWeights);\n    float srcU = dot(srcRGB, uWeights);\n    float srcV = dot(srcRGB," +
  " vWeights);\n    float chromaAngle = atan(srcV, srcU);\n    \n    // if skintone found," +
  " then detect edges only on red channel to reduce wrinkles and shadows, otherwise use ITU" +
  " Rec.709 luma for sky, trees, etc.\n    float luma = srcY;\n    \n    if ( abs(chromaAngle" +
  " - 2.3) < 0.3 || srcY > 0.8 || srcY < 0.4 ) \n    {\n        luma = srcRGB.r;\n" +
  "        lumaWeights = vec3(1.0,0.0,0.0);\n    }\n\n    // edge detection using extended" +
  " difference of gaussian thresholding\n    vec2 acc = vec2(luma, luma);\n    vec2 norma =" +
  " vec2(0.5, 0.5);\n\n    for( float i = 1.0; i <= sigmax2; i ++ ) \n    {\n        vec2" +
  " coeff = vec2( exp( -i*i*i*0.5 ), exp( -i*i*i* sigma22 )); //primera  fija, segunda" +
  " variable\n        \n        vec2 uNeg = gl_TexCoord[0].xy - i * dirPerpen;\n        vec2" +
  " uPos = gl_TexCoord[0].xy + i * dirPerpen;\n        \n        vec3 pixel1 =" +
  " texture2DRect( hg_Texture0, uNeg ).rgb;\n        vec3 pixel2 = texture2DRect( hg_Texture0," +
  " uPos ).rgb;\n        norma += coeff;\n        acc   += coeff * dot((pixel1+pixel2)," +
  " lumaWeights) ;\n    }\n\n    acc  = acc*0.5/norma;\n\n    float total =   (acc.x  -" +
  " acc.y * (0.99 + thresholdCoeffAdj))* 300.0*prethreshold; //substract second pow3  from" +
  " first pow3 and 'cranck' the result\n\n    // Ensure the result is clamped [0..1]; this is" +
  " the default behavior of the original\n    // comic effect - this was implicit due to" +
  " non-float, 8-bit, intermediate buffers.\n    gl_FragColor = clamp(vec4( (step (0.8, total )" +
  " ),gradient, alpha), 0.0, 1.0);   // remove residual gray tones     ADD GRADIENT INSIDE THE" +
  " EDGES TEXTURE\n}\n//MD5=6b6ff578:2a238d62:fa69622e:3bf77bdd\n//SIG=00000000:00000000:00000" +
  "000:00000000:0042:0001:0000:0000:0000:0000:0000:0000:0002:02:0:1:0\n";

// ---------------------------------------------------------------------------
// HGComicEdges
// ---------------------------------------------------------------------------

/**
 * `HGComicEdges` — Helium node implementing the "Comic Edges" effect.
 * Extends `HGNode`.
 *
 * @Helium ctors @0x6220 (C2) / 0x6250 (C1);
 *         dtors  @0x6280 (D2) / 0x6290 (D1) / 0x62a0 (D0);
 *         methods @0x62c0 SetParameter, @0x6370 GetDOD, @0x6390 GetROI,
 *                 @0x6450 RenderTile, @0x6c60 GetOutput, @0x6ca0 GetProgram,
 *                 @0x6d00 BindTexture, @0x6d50 InitProgramDescriptor.
 */
export class HGComicEdges extends HGNode {
  /** Field @0x198 — SetParameter idx 0. Maps to shader hg_Params[0].x (sigma). */
  param0_at_0x198: number;
  /** Field @0x19c — SetParameter idx 3. Maps to shader hg_Params[0].y (prethreshold). */
  param3_at_0x19c: number;
  /** Field @0x1a0 — SetParameter idx 1. Maps to shader hg_Params[0].z (threshold). */
  param1_at_0x1a0: number;
  /** Field @0x1a4 — SetParameter idx 2. Maps to shader hg_Params[0].w (thresholdCoeffAdj). */
  param2_at_0x1a4: number;

  /**
   * `HGComicEdges::HGComicEdges()` — Helium @0x6250 (C1). The C2 body @0x6220
   * is (from disasm) an ICF-folded copy of the same 17-instruction body; both
   * signatures share this behavior.  Full transcription:
   *
   *   0x6259: callq __ZN6HGNodeC2Ev            ; HGNode::HGNode(this) — base init
   *   0x625e: leaq  0x9fce73(%rip), %rax       ; = 0xa030d8 (HGComicEdges vtable installed ptr)
   *   0x6265: movq  %rax, (%rbx)               ; *this = HGComicEdges vtable
   *   0x6268: xorps %xmm0, %xmm0
   *   0x626b: movups %xmm0, 0x198(%rbx)        ; zero 16 bytes @0x198..0x1a7 (all 4 params)
   *   0x6272: orb   $0x6, 0x11(%rbx)           ; renderPageStrategy |= (0x6 << 8) = 0x600
   *   0x6276: (epilogue)
   */
  constructor() {
    // @0x6259: HGNode::HGNode() initializes fields 0x000..0x197 including
    // renderPageStrategy (@0x10) = 0x200.
    super();
    // @0x6265: vtable install — this is implicit in TS class semantics.
    // @0x6268..0x626b: 16-byte xorps-zero of fields @0x198..0x1a7.
    this.param0_at_0x198 = 0;
    this.param3_at_0x19c = 0;
    this.param1_at_0x1a0 = 0;
    this.param2_at_0x1a4 = 0;
    // @0x6272: renderPageStrategy |= (0x6 << 8) — bit-OR into the upper byte
    // of the u32 at offset 0x10..0x13. Effective post-condition:
    //   renderPageStrategy = 0x200 | 0x600 = 0x600.
    this.renderPageStrategy = this.renderPageStrategy | (0x6 << 8);
  }

  /**
   * `HGComicEdges::SetParameter(int idx, float a, float b, float c, float d)` —
   * Helium @0x62c0.  Returns 1 if the stored value changed, 0 if unchanged,
   * -1 (0xffffffff) for out-of-range idx.  Only `a` is stored; b/c/d are
   * ignored (the base HGNode::SetParameter signature is 5-arg, but this
   * override reads only xmm0).
   *
   * Full asm (jump-table dispatch verified at table @0x6350, entries are
   * signed int32 offsets from the table base 0x6350):
   *   0x62c4: cmpl  $0x3, %esi
   *   0x62c7: ja    0x6347            ; idx > 3 → return -1
   *   0x62cb: leaq  0x7e(%rip), %rcx  ; %rcx = 0x6350 (jump-table base)
   *   0x62d2: movslq (%rcx,%rax,4), %rax
   *   0x62d6: addq  %rcx, %rax
   *   0x62d9: jmpq  *%rax
   *
   *   Table @0x6350 (idx → dispatch target):
   *     idx 0 → 0x62db (case 0 body @+0x198)
   *     idx 1 → 0x62f5 (case 1 body @+0x1a0)
   *     idx 2 → 0x630f (case 2 body @+0x1a4)
   *     idx 3 → 0x6329 (case 3 body @+0x19c)
   *
   *   Each case body has identical shape (offset varies):
   *     ucomiss OFFSET(%rdi), %xmm0
   *     jne <STORE>
   *     jnp <RET_ZERO>          ; if a == field, return 0 without storing
   *     STORE: movss %xmm0, OFFSET(%rdi)
   *            movl  $0x1, %eax
   *            ret
   *     RET_ZERO: xorl %eax, %eax; ret   (@0x6343)
   */
  SetParameter(
    idx: number,
    a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    // @0x62c4..0x62c7: idx > 3 → return -1 (as unsigned compare `ja`).
    // Signed idx < 0 is also unsigned > 3, so returns -1.
    if ((idx >>> 0) > 3) return -1;

    // Jump-table dispatch @0x62d2..0x62d9.
    // Each case: ucomiss OFFSET(%rdi), %xmm0 with the following behaviour:
    //   ucomiss sets ZF=1,PF=0 iff xmm0 == field (both non-NaN).
    //   jne then falls through if ZF=1, taking the jnp branch iff PF=0.
    //   PF=0 iff both operands non-NaN and equal.
    //   So the "== & non-NaN" fast return path corresponds to strict-equal
    //   in JavaScript for finite floats (NaN != NaN in both models).
    switch (idx) {
      case 0: {
        // @0x62db..0x62f4 — offset +0x198.
        if (this.param0_at_0x198 === a) return 0;
        this.param0_at_0x198 = Math.fround(a);
        return 1;
      }
      case 1: {
        // @0x62f5..0x630e — offset +0x1a0.
        if (this.param1_at_0x1a0 === a) return 0;
        this.param1_at_0x1a0 = Math.fround(a);
        return 1;
      }
      case 2: {
        // @0x630f..0x6328 — offset +0x1a4.
        if (this.param2_at_0x1a4 === a) return 0;
        this.param2_at_0x1a4 = Math.fround(a);
        return 1;
      }
      case 3: {
        // @0x6329..0x6342 — offset +0x19c.
        if (this.param3_at_0x19c === a) return 0;
        this.param3_at_0x19c = Math.fround(a);
        return 1;
      }
      default:
        // Unreachable (already gated above), matches @0x6347 return -1.
        return -1;
    }
  }

  /**
   * `HGComicEdges::IntermediateFormat(HGFormat) const` — Helium @0x6360.
   * The symbol resolves via identical-code-folding to a body otool -tV
   * cannot extract as a distinct label (0-line disasm).  Per
   * PORTING_SPEC.md rule 3, this method throws citing @Helium 0x6360 —
   * a plausible guess would be a defect.
   */
  IntermediateFormat(_fmt: HGFormatStub): HGFormatStub {
    throw new Error(
      "HGComicEdges::IntermediateFormat @Helium 0x6360 not yet transcribed — " +
        "ICF-folded body (otool -tV emits no label for __ZNK12HGComicEdges18IntermediateFormatE8HGFormat).",
    );
  }

  /**
   * `HGComicEdges::GetDOD(HGRenderer* r, int inputIdx, HGRect callerRect)` —
   * Helium @0x6370.  Returns the caller-supplied HGRect (passed in
   * %rcx:%r8 as two 8-byte halves) IFF inputIdx == 0; otherwise returns
   * `_HGRectNull` (loaded @0x637b via RIP-relative leaq).
   *
   * Full asm:
   *   0x6370: movq  %rcx, %rax             ; return-hi = callerRect.lo (default)
   *   0x6373: testl %edx, %edx             ; edx = inputIdx
   *   0x6375: je    0x638a                 ; if idx == 0, jump to return-with-caller-rect
   *   0x637b: leaq  _HGRectNull(%rip),%rcx ; else load HGRectNull address
   *   0x6382: movq  (%rcx), %rax           ; rax = HGRectNull.lo (x,y)
   *   0x6385: movq  0x8(%rcx), %r8         ; r8 = HGRectNull.hi (right,bottom)
   *   0x638a: movq  %r8, %rdx              ; return-lo = r8
   *   0x638d: retq
   *
   * NOTE: the SysV ABI here uses (rax, rdx) as the two-half return of a
   * 16-byte HGRect struct.  Both halves are passed straight through from the
   * input (callerRect.lo=%rcx, callerRect.hi=%r8) in the idx==0 path — this
   * is the identity return for the DOD of input 0.
   */
  GetDOD(
    _renderer: HGRendererStub,
    inputIdx: number,
    callerRect: HGRect,
  ): HGRect {
    // @0x6373..0x6375: idx == 0 → return callerRect unchanged.
    if (inputIdx === 0) {
      return callerRect;
    }
    // @0x637b..0x6385: else return _HGRectNull (same C symbol as HGRectNull
    // exported from HGRect.ts).
    return HGRectNull;
  }

  /**
   * `HGComicEdges::GetROI(HGRenderer* r, int inputIdx, HGRect callerRect)` —
   * Helium @0x6390.  Computes the ROI needed on the input given the
   * effect's parameters:
   *
   *   inputIdx == 0 (source texture): expand callerRect by ⌈2·sigma⌉ pixels
   *     in every direction, then further grow by 1 pixel gutter (-1,-1,+1,+1)
   *     for the DoG convolution kernel.
   *   inputIdx == 1 (gradient texture): just a 1-pixel gutter around callerRect.
   *   inputIdx >= 2: return `_HGRectNull`.
   *
   * Full asm:
   *   0x6399: cmpl  $0x1, %edx             ; inputIdx
   *   0x639c: je    0x6404                 ; idx==1 → gradient-tex path
   *   0x639e: testl %edx, %edx
   *   0x63a0: jne   0x6433                 ; idx!=0 (and !=1) → return HGRectNull
   *
   *   // idx==0 body @0x63a6..0x6402:
   *   0x63a6: movss 0x198(%rdi), %xmm0     ; xmm0 = sigma (param0)
   *   0x63ae: addss %xmm0, %xmm0           ; xmm0 = 2·sigma
   *   0x63b2: roundss $0xa, %xmm0, %xmm0   ; xmm0 = ceil(2·sigma)  (imm 0xa = ROUND_TOWARD_+INF | INEXACT-SUPPRESS)
   *   0x63b8: cvttss2si %xmm0, %eax        ; eax = (int32)ceil(2·sigma)
   *   0x63bc: movq  %rax, %rdx
   *   0x63bf: shlq  $0x20, %rdx
   *   0x63c3: orq   %rax, %rdx             ; rdx = (eax<<32)|eax  = (x1,y1)=(eax,eax)
   *   0x63c6: negl  %eax                   ; eax = -ceil(2·sigma)
   *   0x63c8: movq  %rax, %rsi
   *   0x63cb: shlq  $0x20, %rsi
   *   0x63cf: orq   %rax, %rsi             ; rsi = (x0,y0)=(-eax,-eax)
   *   0x63d2: movq  %rcx, -0x20(%rbp)      ; stack HGRect = callerRect.lo
   *   0x63d6: movq  %r8,  -0x18(%rbp)      ; stack HGRect = callerRect.hi
   *   0x63da: leaq  -0x20(%rbp), %rbx      ; %rbx = &stackRect (= callerRect)
   *   0x63de: movq  %rbx, %rdi
   *   0x63e1: callq HGRect::Grow(HGRect)   ; stackRect += (-eax,-eax,+eax,+eax) saturating
   *   0x63e6..0x63fa: HGRectMake4i(-1,-1, 1, 1)
   *   0x63ff: movq  %rbx, %rdi             ; &stackRect
   *   0x6402: jmp   0x6429                 ; join
   *
   *   // idx==1 body @0x6404..0x6431:
   *   0x6404..0x640c: stackRect = callerRect
   *   0x640c..0x6420: HGRectMake4i(-1,-1, 1, 1)
   *   0x6425: leaq  -0x20(%rbp), %rdi      ; &stackRect
   *   0x6429: movq  %rax, %rsi             ; %rsi = HGRectMake4i result
   *   0x642c: callq HGRect::Grow(HGRect)   ; stackRect += (-1,-1,+1,+1) saturating
   *   0x6431: jmp   0x6441
   *
   *   // idx>=2 body @0x6433..0x643d:
   *   0x6433: leaq  _HGRectNull(%rip),%rax
   *   0x643a: movups (%rax), %xmm0
   *   0x643d: movaps %xmm0, -0x20(%rbp)    ; stackRect = HGRectNull
   *
   *   // Return @0x6441..0x644f:
   *   0x6441: movq  -0x20(%rbp), %rax      ; return.lo
   *   0x6445: movq  -0x18(%rbp), %rdx      ; return.hi
   */
  GetROI(
    _renderer: HGRendererStub,
    inputIdx: number,
    callerRect: HGRect,
  ): HGRect {
    if (inputIdx === 1) {
      // Gradient-texture ROI: callerRect ∪ (-1,-1,+1,+1)
      const gutter = HGRectMake4i(-1, -1, 1, 1);
      return HGRect_Grow_method(callerRect, gutter);
    }
    if (inputIdx !== 0) {
      // idx >= 2 or negative — return HGRectNull.
      return HGRectNull;
    }
    // idx == 0: source-texture ROI.
    // @0x63a6..0x63b8: sigmaCeil = (int32) ⌈2 · sigma⌉  via SSE `roundss $0xa`
    // (ROUND_TOWARD_+INF, INEXACT-SUPPRESS) followed by `cvttss2si` (truncate).
    // `Math.ceil` on the fround-ed product is bit-identical to the sequence
    // because `roundss imm=0xa` = +INF rounding and the truncation is a no-op
    // once the value is already integer-valued.
    const twoSigma = Math.fround(
      Math.fround(this.param0_at_0x198) + Math.fround(this.param0_at_0x198),
    ); // xmm0 += xmm0 (single-precision)
    // cvttss2si of an integer-valued float — Math.ceil suffices since roundss
    // moved us to the ceiling; use `| 0` to nail the int32 truncation.
    const sigmaCeil = Math.ceil(twoSigma) | 0;
    // @0x63bc..0x63cf: build the two 64-bit rect halves.
    //   rect_hi = (sigmaCeil, sigmaCeil) at positions (right, bottom)
    //   rect_lo = (-sigmaCeil, -sigmaCeil) at positions (x, y)
    // i.e. the grow-delta is the rect { -k, -k, +k, +k } which HGRect::Grow
    // adds corner-wise with saturating int32.
    const sigmaGrow: HGRect = HGRectMake4i(
      -sigmaCeil,
      -sigmaCeil,
      sigmaCeil,
      sigmaCeil,
    );
    // @0x63e1: HGRect::Grow(&stackRect(=callerRect), sigmaGrow)
    const afterSigma = HGRect_Grow_method(callerRect, sigmaGrow);
    // @0x63e6..0x63fa: HGRectMake4i(-1,-1,+1,+1) — the 1-pixel DoG gutter.
    const kernelGutter = HGRectMake4i(-1, -1, 1, 1);
    // @0x642c: HGRect::Grow(&stackRect(=afterSigma), kernelGutter)
    return HGRect_Grow_method(afterSigma, kernelGutter);
  }

  /**
   * `HGComicEdges::RenderTile(HGTile*)` — Helium @0x6450.  A 471-instruction
   * SSE-heavy CPU implementation of the same math as the Metal/GLSL
   * shaders above (the DoG-thresholded edge kernel that iterates i=1..2·sigma,
   * accumulates two `exp(-i^3·c)` coefficients, and steps against 0.8).  The
   * kernel needs decoded HGTile field layout (source-bitmap ptr, dest-bitmap
   * ptr, tile rect, stride) and HGRenderer::vt[0x138] dispatch, plus a large
   * bank of RIP-relative float constants at 0x3c17d7 etc. — all frontier
   * decodes.  Per PORTING_SPEC.md rule 3, this method throws citing @Helium
   * 0x6450.  The math is fully documented in HGCOMICEDGES_METAL_SHADER
   * (above) — the CPU code evaluates the same expression per pixel with
   * SSE lanes.
   */
  RenderTile(_tile: HGTileStub): void {
    throw new Error(
      "HGComicEdges::RenderTile @Helium 0x6450 not yet transcribed — " +
        "471-line SSE per-tile kernel; depends on HGTile field layout, " +
        "HGRenderer::vt[0x138] dispatch, and the RIP-relative float " +
        "constant bank starting @Helium 0x3c17d7 (frontier decodes).",
    );
  }

  /**
   * `HGComicEdges::GetOutput(HGRenderer*)` — Helium @0x6c60.  Loads the four
   * stored parameters (in field-offset order: 0x198, 0x19c, 0x1a0, 0x1a4)
   * into xmm0..xmm3 and delegates to `HGNode::SetParameter(0, ...)`
   * @Helium 0x11cab0 on `this`, then returns `this`.  This is the "publish
   * the current params to the base slot" behavior.
   *
   * Full asm:
   *   0x6c66: movq  %rdi, %rbx
   *   0x6c69: movss 0x198(%rdi), %xmm0     ; xmm0 = param0_at_0x198
   *   0x6c71: movss 0x19c(%rdi), %xmm1     ; xmm1 = param3_at_0x19c
   *   0x6c79: movss 0x1a0(%rdi), %xmm2     ; xmm2 = param1_at_0x1a0
   *   0x6c81: movss 0x1a4(%rdi), %xmm3     ; xmm3 = param2_at_0x1a4
   *   0x6c89: xorl  %esi, %esi             ; idx = 0
   *   0x6c8b: callq __ZN6HGNode12SetParameterEiffff   ; HGNode::SetParameter(this, 0, xmm0..xmm3)
   *   0x6c90: movq  %rbx, %rax             ; return this
   *
   * Note the field-order-to-argument-order mapping: because SetParameter's
   * jump table stored idx 0/1/2/3 into fields at offsets 0x198/0x1a0/0x1a4/
   * 0x19c respectively, GetOutput reads them in offset order — which means
   * the arg-order to base SetParameter is (idx 0, idx 3, idx 1, idx 2).
   */
  GetOutput(_renderer: HGRendererStub): HGComicEdges {
    // @0x6c69..0x6c81: load four params in field-offset order.
    const a = Math.fround(this.param0_at_0x198);
    const b = Math.fround(this.param3_at_0x19c);
    const c = Math.fround(this.param1_at_0x1a0);
    const d = Math.fround(this.param2_at_0x1a4);
    // @0x6c8b: call HGNode::SetParameter(this, 0, a, b, c, d) — the base
    // implementation stores into the HGNode parameter array (see
    // HGNode.ts @Helium 0x11cab0).  HGNode::SetParameter is a frontier
    // decode (not yet ported as a method on HGNode.ts).  Delegate through
    // the frontier stub which throws citing @Helium 0x11cab0.
    HGNode_SetParameter_frontier(this, 0, a, b, c, d);
    // @0x6c90: return this.
    return this;
  }

  /**
   * `HGComicEdges::GetProgram(HGRenderer* r)` — Helium @0x6ca0.  Returns
   * either the Metal shader source (when the renderer's active target is
   * greater than 0x60b0f) or the GLSL shader source (when the renderer's
   * capability query @slot *0x80(cap=0x2e) returns non-zero), or `null`.
   *
   * Full asm:
   *   0x6ca6: movq  %rsi, %rbx               ; %rbx = renderer
   *   0x6ca9: movq  %rsi, %rdi
   *   0x6cac: movl  $0x60000, %esi           ; kind = 0x60000
   *   0x6cb1: callq __ZN10HGRenderer9GetTargetEj  ; target = renderer->GetTarget(0x60000)
   *   0x6cb6: cmpl  $0x60b0f, %eax
   *   0x6cbb: jbe   0x6ccb                   ; if target <= 0x60b0f, fall through to GLSL path
   *
   *   // Metal path @0x6cbd..0x6cca:
   *   0x6cbd: leaq  0x8ae556(%rip), %rax     ; = HGCOMICEDGES_METAL_SHADER string
   *   0x6cc4..0x6cca: (epilogue: return %rax)
   *
   *   // GLSL path @0x6ccb..0x6cf3:
   *   0x6ccb: movq  (%rbx), %rax             ; rax = renderer->vtbl
   *   0x6cce: movq  %rbx, %rdi
   *   0x6cd1: movl  $0x2e, %esi              ; cap = 0x2e = 46
   *   0x6cd6: callq *0x80(%rax)              ; cap-query via vt[0x80]
   *   0x6cdc: movl  %eax, %ecx
   *   0x6cde: xorl  %eax, %eax               ; rax = null (default)
   *   0x6ce0: testl %ecx, %ecx
   *   0x6ce2: leaq  0x8af1ed(%rip), %rcx     ; = HGCOMICEDGES_GLSL_SHADER string
   *   0x6ce9: cmovneq %rcx, %rax             ; if cap != 0, rax = GLSL source
   *   0x6ced..0x6cf3: (epilogue: return %rax)
   */
  GetProgram(renderer: HGRendererStub): string | null {
    // @0x6cac..0x6cb1: kind = 0x60000
    const target = renderer.GetTarget(0x60000);
    // @0x6cb6..0x6cbb: target > 0x60b0f → Metal path (`jbe` unsigned ≤).
    if ((target >>> 0) > 0x60b0f) {
      // @0x6cbd: return the Metal shader source string.
      return HGCOMICEDGES_METAL_SHADER;
    }
    // @0x6cd1..0x6cd6: capability query via renderer vt[0x80], arg=0x2e.
    const cap = renderer.vt_0x80(0x2e);
    // @0x6ce0..0x6ce9: cmovne — return GLSL source iff cap != 0, else null.
    if (cap !== 0) {
      return HGCOMICEDGES_GLSL_SHADER;
    }
    return null;
  }

  /**
   * `HGComicEdges::BindTexture(HGHandler* h, int textureIndex)` — Helium
   * @0x6d00.  Uploads a zero tex-coord to the handler and cycles three
   * vtable slots on the handler.  Always returns 0 (eax xor'd @0x6d48).
   *
   * Full asm:
   *   0x6d07: movl  %edx, %ebx              ; %ebx = textureIndex
   *   0x6d09: movq  %rsi, %r14              ; %r14 = handler
   *   0x6d0c: movq  %rsi, %rdi              ; arg0 to TexCoord
   *   0x6d0f: movl  %edx, %esi              ; arg1 = textureIndex
   *   0x6d11: xorl  %edx, %edx              ; arg2 = 0
   *   0x6d13: xorl  %ecx, %ecx              ; arg3 = 0
   *   0x6d15: xorl  %r8d, %r8d              ; arg4 = nullptr
   *   0x6d18: callq HGHandler::TexCoord(handler, textureIndex, 0, 0, nullptr)
   *   0x6d1d: movq  (%r14), %rax            ; rax = handler->vtbl
   *   0x6d20: movq  %r14, %rdi              ; this = handler
   *   0x6d23: movl  %ebx, %esi              ; arg1 = textureIndex
   *   0x6d25: xorl  %edx, %edx              ; arg2 = 0
   *   0x6d27: callq *0x48(%rax)             ; handler->vt[0x48](textureIndex, 0)
   *   0x6d2a: movq  (%r14), %rax
   *   0x6d2d: movq  %r14, %rdi
   *   0x6d30: xorl  %esi, %esi              ; arg1 = 0
   *   0x6d32: callq *0x38(%rax)             ; handler->vt[0x38](0)
   *   0x6d35: movq  (%r14), %rax
   *   0x6d38: movq  %r14, %rdi
   *   0x6d3b: movl  $0x1, %esi              ; arg1 = 1
   *   0x6d40: movl  $0x1, %edx              ; arg2 = 1
   *   0x6d45: callq *0x30(%rax)             ; handler->vt[0x30](1, 1)
   *   0x6d48: xorl  %eax, %eax               ; return 0
   */
  BindTexture(handler: HGHandlerStub, textureIndex: number): number {
    // @0x6d18: HGHandler::TexCoord(handler, textureIndex, 0, 0, nullptr).
    handler.TexCoord(textureIndex, 0, 0, null);
    // @0x6d27: handler->vt[0x48](textureIndex, 0).
    handler.vt_0x48(textureIndex, 0);
    // @0x6d32: handler->vt[0x38](0).
    handler.vt_0x38(0);
    // @0x6d45: handler->vt[0x30](1, 1).
    handler.vt_0x30(1, 1);
    // @0x6d48: return 0.
    return 0;
  }

  /**
   * `HGComicEdges::InitProgramDescriptor(HGProgramDescriptor*) const` —
   * Helium @0x6d50.  The body is trivial (4 instructions: `pushq %rbp;
   * movq %rsp,%rbp; popq %rbp; retq`) — an empty function.  Semantically:
   * "no per-instance program descriptor initialization is needed"; the
   * shader source alone is enough.
   *
   * Full asm:
   *   0x6d50: pushq %rbp
   *   0x6d51: movq  %rsp, %rbp
   *   0x6d54: popq  %rbp
   *   0x6d55: retq
   */
  InitProgramDescriptor(_desc: HGProgramDescriptorStub): void {
    // @0x6d50..0x6d55: empty body. No fields written, no calls, no return
    // value. Faithful port: return void.
  }
}

// ---------------------------------------------------------------------------
// Dtor notes (D2/D1/D0 @0x6280/0x6290/0x62a0):
//   All three are stubs: HGComicEdges has no owned heap resources (params
//   are inline float fields at 0x198..0x1a7), so D2 and D1 tail-jmp
//   HGNode::~HGNode, and D0 (the deleting dtor) additionally calls
//   HGObject::operator delete.  These are HGObject/HGNode-base concerns
//   and are handled by the JS garbage collector — no explicit dtor needed
//   in TypeScript.  Cited here for provenance:
//     @0x6280  D2 — bare tail-jmp HGNode::~HGNode
//     @0x6290  D1 — bare tail-jmp HGNode::~HGNode
//     @0x62a0  D0 — tail-jmp HGNode::~HGNode; operator delete(this)
// ---------------------------------------------------------------------------

// Vtable installed pointer for the class, cited for provenance.
// @Helium 0xa030d8 — see vtable dump above.
export const _HGCOMICEDGES_VTABLE_ADDR = 0xa030d8;
