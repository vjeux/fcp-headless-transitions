// HgcBT2100_HLG_OETF.ts — FCP Helium framework class.
//
// The BT.2100 HLG (Hybrid Log-Gamma) opto-electrical transfer function render node —
// converts linear-light HDR values (0..~12) to display-referred HLG-encoded values (0..1)
// per the piecewise BT.2100 OETF:
//     E'  =  0.5 * sqrt(12 * E)                          for  0 <= E <= 1/12
//           a * ln(12 * E - b) + c                       for  1/12 < E <= 1
//   where a = 0.17883277, b = 0.28466892, c = 0.55991073.
// The class is a `HGRenderer`-plugin node (extends `HGNode`). Its shader (see
// `HgcBT2100_HLG_OETF_GetProgram`) is written with programmable parameters so the caller
// can install different threshold/scale constants via `SetParameter`.
//
// Transcribed from the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// See raw-port/re/disasm/Helium.HgcBT2100_HLG_OETF.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x3b0140  T HgcBT2100_HLG_OETF::GetProgram(HGRenderer*)
//   0x3b0170  T HgcBT2100_HLG_OETF::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x3b0390  T HgcBT2100_HLG_OETF::shaderDescription() const
//   0x3b03e0  T HgcBT2100_HLG_OETF::BindTexture(HGHandler*, int)
//   0x3b0450  T HgcBT2100_HLG_OETF::Bind(HGHandler*)
//   0x3b04b0  T HgcBT2100_HLG_OETF::RenderTile_AVX(HGTile*)
//   0x3b0930  T HgcBT2100_HLG_OETF::RenderTile(HGTile*)
//   0x3b0e90  T HgcBT2100_HLG_OETF::GetDOD(HGRenderer*, int, HGRect)
//   0x3b0eb0  T HgcBT2100_HLG_OETF::GetROI(HGRenderer*, int, HGRect)
//   0x3b0ed0  T HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()                 (C2)
//   0x3b1110  T HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()                 (C1)
//   0x3b1120  T HgcBT2100_HLG_OETF::~HgcBT2100_HLG_OETF()                (D2)
//   0x3b1170  T HgcBT2100_HLG_OETF::~HgcBT2100_HLG_OETF()                (D1)
//   0x3b11c0  T HgcBT2100_HLG_OETF::~HgcBT2100_HLG_OETF()                (D0)
//   0x3b1210  T HgcBT2100_HLG_OETF::SetParameter(int, float, float, float, float)
//   0x3b1290  T HgcBT2100_HLG_OETF::GetParameter(int, float*)
//   0x3b12e0  T HgcBT2100_HLG_OETF::GetOutput(HGRenderer*)
//   0xa548b8  s vtable for HgcBT2100_HLG_OETF
//
// VTABLE INSTALLED PTR (from ctor C2 @0x3b0edf leaq 0x6a39e2(%rip); RIP-after = 0x3b0ee6;
//   target = 0x3b0ee6 + 0x6a39e2 = 0xa548c8 == vtable_base(0xa548b8) + 0x10).
// D2/D1/D0 all reset the vptr to the same 0xa548c8 (@0x3b1120/0x3b1170/0x3b11c0).
//
// FIELD LAYOUT (extends HGNode; HGNode subobject +0x00..+0x197 opaque here):
//   +0x00  vptr  (installed pointer 0xa548c8)
//   +0x10  int flags (bit-mask) — RMW at ctor @0x3b10df..0x3b10ec:
//             flags &= 0xFFFFF9FF (clear bits 9..10);  flags |= 0x400 (set bit 10).
//             Net effect: flags = (flags & ~0x600) | 0x400.
//   +0x198 void* scratch — 32-byte-aligned pointer into a heap block of size 0x2e7 (743)
//             bytes allocated by `operator new[]` at ctor @0x3b0eee.
//             The alignment idiom @0x3b0ef3..0x3b0f00 is the standard clang:
//               p = raw + 8 + ((-raw - 8) & 31)
//             and `*(p - 8) = raw` so that D2/D1/D0 can free it via
//               raw = *(p - 8); delete(raw)   (@0x3b1120..0x3b115b / 0x3b1170..0x3b11a3 /
//                                              0x3b11c0..0x3b11e8).
//
// SCRATCH LAYOUT (@p offsets, bytes; each row is one 16-byte float4 slot):
//   p[0x000..0x040)  params[0..1]  — 2 x float4 written by SetParameter, zero at ctor
//                                    (@0x3b0f08..0x3b0f24: six xorps→movaps zeroing p[0..0x60))
//   p[0x040..0x060)  reserved zeroed (last 32 bytes of the "params/user" zone)
//   p[0x060..0x080)  CONST_FLT_MIN2      = 4x FLT_MIN                     (data @0x3cb0d0)
//   p[0x080..0x0A0)  CONST_RSQRTNR_SCALE = 4x 1.0002442598342896          (data @0x85fed0)
//                    (Newton-Raphson refinement scale after RSQRT; ~1+2^-12; used in
//                     rsqrt correction of Newton "y' = y*(a - x*y*y)" scaled)
//   p[0x0A0..0x0C0)  CONST_HALF_3_3_0    = (0.5, 3.0, 3.0, 0.0)           (data @0x894dc0)
//   p[0x0C0..0x0E0)  CONST_3_HALF_HALF_0 = (3.0, 0.5, 0.5, 0.0)           (data @0x894dd0)
//   p[0x0E0..0x100)  CONST_NEG_FLT_MIN2  = (-FLT_MIN, -FLT_MIN, -FLT_MIN, 0)  (data @0x892090)
//   p[0x100..0x120)  CONST_ONE3_0        = (1.0, 1.0, 1.0, 0.0)           (data @0x3ca9c0)
//   p[0x120..0x140)  CONST_INF3_0        = (inf, inf, inf, 0.0)           (data @0x88f440)
//   p[0x140..0x160)  CONST_127_3_0       = (127.0, 127.0, 127.0, 0.0)     (data @0x88ded0)
//   p[0x160..0x180)  CONST_SQRT2_3_0     = (1.4142135381698608, ..., 0.0) (data @0x88dee0)
//   p[0x180..0x1A0)  CONST_HALF3_0       = (0.5, 0.5, 0.5, 0.0)           (data @0x85da90)
//   p[0x1A0..0x1C0)  LOG2_COEF_A         = 0.2960891127586365   x3 + 0     (data @0x88dfa0)
//   p[0x1C0..0x1E0)  LOG2_COEF_B         = -0.35917338728904724 x3 + 0     (data @0x88dfb0)
//   p[0x1E0..0x200)  LOG2_COEF_C         =  0.17290928959846497 x3 + 0    (data @0x88dfc0)
//   p[0x200..0x220)  LOG2_COEF_D         = -0.27149274945259094 x3 + 0    (data @0x88dfd0)
//   p[0x220..0x240)  LOG2_COEF_E         =  0.4805939197540283  x3 + 0    (data @0x88dfe0)
//   p[0x240..0x260)  LOG2_COEF_F         = -0.7213672399520874  x3 + 0    (data @0x88dff0)
//   p[0x260..0x280)  LOG2_COEF_G         =  1.4426966905593872  x3 + 0    (data @0x88e000;
//                                          ≈ log2(e) = 1/ln2, the leading Taylor coefficient)
//   p[0x280..0x2A0)  CONST_NAN3_0        = (nan, nan, nan, 0.0)           (data @0x88c7f0)
//   p[0x2A0..0x2C0)  CONST_FIRST_SLICE   = raw 4×32-bit                    (data @0x85fa40)
//                    (bytewise mask blob used to select last-lane alpha; @0x3b10c1..0x3b10d0)
//
// The scratch buffer is thus a single-instance "constant pool" for the SSE/AVX software
// rasterizer (RenderTile / RenderTile_AVX). params[0] and params[1] live in the first 64
// bytes and are user-programmable via SetParameter; everything else is set in the ctor.
// See `LOG2_COEF_A..G` — a degree-7-in-mantissa polynomial fit to log2(1+f) that
// RenderTile uses to compute log2 of the mantissa fraction, combined with the integer
// exponent extracted by `psrld $0x17` (23-bit shift for FP32 exponent bias). This is the
// standard "log2 via exponent + polynomial-of-fraction" trick.
//
// PROGRAM SHAPE (Metal shader, transcribed verbatim in GetProgram):
//   r0             = texture0.sample(sampler0, texCoord0.xy);
//   r1.xyz         = max(r0.xyz, 0.0)                     // SDR-arm base (clamp to 0)
//   r2.xyz         = max(r0.xyz, params[0].xxx) - params[1].zzz  // HDR-arm base
//   r1.x/y/z       = sqrt(r1.x/y/z)                        // per-channel sqrt
//   r1.xyz         = r1.xyz * params[1].xxx                // SDR result = a * sqrt(E)
//   r2.xyz         = log2(r2.xyz)
//   r2.xyz         = r2.xyz * params[1].yyy + params[1].www // HDR result = c*log2(E-b) + d
//   r0.xyz         = float3(params[0].xxx < r0.xyz)        // selector (0 or 1)
//   out.color0.xyz = select(r1.xyz, r2.xyz, -r0.xyz < 0)   // pick HDR arm where above thr
//   out.color0.w   = r0.w                                  // alpha untouched
// So `params[0].x` = threshold; `params[1] = (a, c, b, d)` are the four HLG constants
// (with `a`=SDR slope, `c`=HDR log slope, `b`=HDR log offset, `d`=HDR intercept).
//
// FRONTIER CALLEES (throw-stubbed at first use):
//   HGNode::HGNode()                                     @Helium (stub cite 0x3b0eda)
//   HGNode::~HGNode()                                    @Helium (stub cite 0x3b11f0)
//   HGNode::ClearBits()                                  @Helium (stub cite 0x3b1278)
//   HGObject::operator delete(void*)                     @Helium (stub cite 0x3b11fe)
//   operator new[](size_t)                               @Helium (stub cite 0x3b0eee)
//   operator delete(void*)                               @Helium (stub cite 0x3b11a3)
//   HGTile::Renderer() const                             @Helium (stub cite 0x3b0944)
//   HGRenderer::GetTarget(unsigned int)                  @Helium (stub cite 0x3b014c / 0x3b094e)
//   HGHandler::TexCoord(int,int,int,double const*)       @Helium (stub cite 0x3b041b)
//   HGProgramDescriptor::SetVisibleShaderWithSource(...) @Helium (stub cite 0x3b0192)
//   HGProgramDescriptor::SetFragmentFunctionName(...)    @Helium (stub cite 0x3b01a1)
//   HGProgramDescriptor::SetReturnBinding(HGBinding)     @Helium (stub cite 0x3b01e8)
//   HGProgramDescriptor::SetArgumentBindings(...)        @Helium (stub cite 0x3b02e6)
//   std::vector<HGBinding>::__emplace_back_slow_path     @Helium (stub cite 0x3b023d / 0x3b02c7)

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer address for HgcBT2100_HLG_OETF.
 * From ctor C2 @Helium 0x3b0edf (leaq 0x6a39e2(%rip)); RIP-after = 0x3b0ee6;
 *   target = 0x3b0ee6 + 0x6a39e2 = 0xa548c8   (== vtable_sym 0xa548b8 + 0x10).
 * Also reset by D2 @0x3b1120 (0x3b1127 + 0x6a37a1 = 0xa548c8),
 *              D1 @0x3b1170 (0x3b1177 + 0x6a3751 = 0xa548c8),
 *              D0 @0x3b11c0 (0x3b11d0 + 0x6a36f8 = 0xa548c8).
 */
export const HgcBT2100_HLG_OETF_VTABLE_INSTALLED_PTR = 0xa548c8 as const;

/** Vtable symbol address (base, before RTTI/offset-to-top). @Helium 0xa548b8. */
export const HgcBT2100_HLG_OETF_VTABLE_SYM = 0xa548b8 as const;

/**
 * `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()` ctor size: `operator new[](0x2e7)` bytes.
 * @Helium 0x3b0ee9 (movl $0x2e7, %edi; callq __Znam).
 */
export const HgcBT2100_HLG_OETF_SCRATCH_ALLOC_BYTES = 0x2e7 as const;

// ---------------------------------------------------------------------------
// Ctor constants read from Helium __const via RIP-relative movaps at 0x3b0f29..0x3b10c8.
// Each constant is one aligned 16-byte float4 vector; the ctor writes each vector TWICE
// (into adjacent 16-byte cells at p+off and p+off+0x10) so the scratch has each constant
// duplicated across two consecutive cells (per-lane broadcast for the SSE inner loop).
// Provenance addresses are (RIP-after + disp) in the thin Helium binary.
// ---------------------------------------------------------------------------

/** 4 × FLT_MIN (1.17549435e-38). Data @Helium 0x3cb0d0; loaded @0x3b0f29. Written to p[0x60] & p[0x70]. */
export const HgcBT2100_HLG_OETF_CONST_FLT_MIN2 = 1.1754943508222875e-38 as const;
/** 4 × 1.0002442598342896 — Newton-Raphson rsqrt refinement scale (=1+2^-12 approx).
 *  Data @Helium 0x85fed0; loaded @0x3b0f3a. Written to p[0x80] & p[0x90]. */
export const HgcBT2100_HLG_OETF_CONST_RSQRTNR_SCALE = 1.0002442598342896 as const;
/** (0.5, 3.0, 3.0, 0.0). Data @Helium 0x894dc0; loaded @0x3b0f51. Written to p[0xA0] & p[0xB0]. */
export const HgcBT2100_HLG_OETF_CONST_HALF_3_3_0: readonly [number, number, number, number] =
  [0.5, 3.0, 3.0, 0.0] as const;
/** (3.0, 0.5, 0.5, 0.0). Data @Helium 0x894dd0; loaded @0x3b0f68. Written to p[0xC0] & p[0xD0]. */
export const HgcBT2100_HLG_OETF_CONST_3_HALF_HALF_0: readonly [number, number, number, number] =
  [3.0, 0.5, 0.5, 0.0] as const;
/** (-FLT_MIN, -FLT_MIN, -FLT_MIN, 0). Data @Helium 0x892090; loaded @0x3b0f7f.
 *  Written to p[0xE0] & p[0xF0]. */
export const HgcBT2100_HLG_OETF_CONST_NEG_FLT_MIN3_0: readonly [number, number, number, number] =
  [-1.1754942106924411e-38, -1.1754942106924411e-38, -1.1754942106924411e-38, 0.0] as const;
/** (1.0, 1.0, 1.0, 0.0). Data @Helium 0x3ca9c0; loaded @0x3b0f96. Written to p[0x100] & p[0x110]. */
export const HgcBT2100_HLG_OETF_CONST_ONE3_0: readonly [number, number, number, number] =
  [1.0, 1.0, 1.0, 0.0] as const;
/** (+inf, +inf, +inf, 0). Data @Helium 0x88f440; loaded @0x3b0fad. Written to p[0x120] & p[0x130]. */
export const HgcBT2100_HLG_OETF_CONST_INF3_0: readonly [number, number, number, number] =
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0.0] as const;
/** (127.0, 127.0, 127.0, 0). Data @Helium 0x88ded0; loaded @0x3b0fc4. Written to p[0x140] & p[0x150].
 *  (FP32 exponent bias — subtracted after `psrld $0x17` to recover the signed exponent.) */
export const HgcBT2100_HLG_OETF_CONST_127_3_0: readonly [number, number, number, number] =
  [127.0, 127.0, 127.0, 0.0] as const;
/** (sqrt(2), sqrt(2), sqrt(2), 0). Data @Helium 0x88dee0; loaded @0x3b0fdb.
 *  Written to p[0x160] & p[0x170]. (Boundary for shifting mantissa into [1/√2, √2).) */
export const HgcBT2100_HLG_OETF_CONST_SQRT2_3_0: readonly [number, number, number, number] =
  [1.4142135381698608, 1.4142135381698608, 1.4142135381698608, 0.0] as const;
/** (0.5, 0.5, 0.5, 0). Data @Helium 0x85da90; loaded @0x3b0ff2. Written to p[0x180] & p[0x190]. */
export const HgcBT2100_HLG_OETF_CONST_HALF3_0: readonly [number, number, number, number] =
  [0.5, 0.5, 0.5, 0.0] as const;
/** log2(1+f)-poly coefficient A. Data @Helium 0x88dfa0; loaded @0x3b1009. p[0x1A0]/p[0x1B0]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_A = 0.2960891127586365 as const;
/** log2 poly coeff B. Data @Helium 0x88dfb0; loaded @0x3b1020. p[0x1C0]/p[0x1D0]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_B = -0.35917338728904724 as const;
/** log2 poly coeff C. Data @Helium 0x88dfc0; loaded @0x3b1037. p[0x1E0]/p[0x1F0]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_C = 0.17290928959846497 as const;
/** log2 poly coeff D. Data @Helium 0x88dfd0; loaded @0x3b104e. p[0x200]/p[0x210]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_D = -0.27149274945259094 as const;
/** log2 poly coeff E. Data @Helium 0x88dfe0; loaded @0x3b1065. p[0x220]/p[0x230]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_E = 0.4805939197540283 as const;
/** log2 poly coeff F. Data @Helium 0x88dff0; loaded @0x3b107c. p[0x240]/p[0x250]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_F = -0.7213672399520874 as const;
/** log2 poly leading coeff G (≈ 1/ln(2) = log2(e)). Data @Helium 0x88e000; loaded @0x3b1093.
 *  p[0x260]/p[0x270]. */
export const HgcBT2100_HLG_OETF_LOG2_COEF_G = 1.4426966905593872 as const;
/** (NaN, NaN, NaN, 0). Data @Helium 0x88c7f0; loaded @0x3b10aa. p[0x280]/p[0x290]. */
export const HgcBT2100_HLG_OETF_CONST_NAN3_0: readonly [number, number, number, number] =
  [Number.NaN, Number.NaN, Number.NaN, 0.0] as const;
/** Raw 4x32-bit blob used as an alpha-preservation mask in RenderTile.
 *  Data @Helium 0x85fa40; loaded @0x3b10c1. p[0x2A0]/p[0x2B0].
 *  Bit-pattern (LE): (0x717fffff, 0x00b00000, 0x47483110, 0x6a80000b). */
export const HgcBT2100_HLG_OETF_CONST_MASK_A: readonly [number, number, number, number] =
  [3.950456768944783e30, 1.0327702805428013e-38, 51254.1953125, 1.718152340286798e25] as const;

// ---------------------------------------------------------------------------
// Metal shader source strings — transcribed verbatim from the RIP-relative literal-pool
// loads. Retained as embedded string constants so any future Metal-frontend port has the
// exact text FCP hands to its shader compiler.
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::GetProgram` shader source — the full fragment function.
 * @Helium 0x3b0158 (leaq disp32(%rip)); the RIP-relative literal pool entry contains this
 * 424-byte payload. Returned when `HGRenderer::GetTarget(0x60000)` equals `0x60b10`
 * (a specific Metal 1.0 target); otherwise `GetProgram` returns `nullptr` (@0x3b0151..0x3b015f).
 */
export const HgcBT2100_HLG_OETF_FRAGMENT_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=0000000424\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r1.xyz = fmax(r0.xyz, c0.xxx);\n" +
  "    r2.xyz = fmax(r0.xyz, hg_Params[0].xxx);\n" +
  "    r2.xyz = r2.xyz - hg_Params[1].zzz;\n" +
  "    r1.x = sqrt(r1.x);\n" +
  "    r1.z = sqrt(r1.z);\n" +
  "    r1.y = sqrt(r1.y);\n" +
  "    r1.xyz = r1.xyz*hg_Params[1].xxx;\n" +
  "    r2.xyz = log2(r2.xyz);\n" +
  "    r2.xyz = r2.xyz*hg_Params[1].yyy + hg_Params[1].www;\n" +
  "    r0.xyz = float3(hg_Params[0].xxx < r0.xyz);\n" +
  "    output.color0.xyz = select(r1.xyz, r2.xyz, -r0.xyz < 0.00000f);\n" +
  "    output.color0.w = r0.w;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=5c824207:76fd8e2e:0a00acd2:9472bca2\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:0002:0003:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * `HgcBT2100_HLG_OETF::InitProgramDescriptor` visible-shader source (LEN=0000000300).
 * @Helium 0x3b0188 (2nd leaq before `SetVisibleShaderWithSource`).
 */
export const HgcBT2100_HLG_OETF_VISIBLE_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=0000000300\n" +
  "[[ visible ]] FragmentOut HgcBT2100_HLG_OETF_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0)\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = color0;\n" +
  "    r1.xyz = fmax(r0.xyz, c0.xxx);\n" +
  "    r2.xyz = fmax(r0.xyz, hg_Params[0].xxx);\n" +
  "    r2.xyz = r2.xyz - hg_Params[1].zzz;\n" +
  "    r1.x = sqrt(r1.x);\n" +
  "    r1.z = sqrt(r1.z);\n" +
  "    r1.y = sqrt(r1.y);\n" +
  "    r1.xyz = r1.xyz*hg_Params[1].xxx;\n" +
  "    r2.xyz = log2(r2.xyz);\n" +
  "    r2.xyz = r2.xyz*hg_Params[1].yyy + hg_Params[1].www;\n" +
  "    r0.xyz = float3(hg_Params[0].xxx < r0.xyz);\n" +
  "    output.color0.xyz = select(r1.xyz, r2.xyz, -r0.xyz < 0.00000f);\n" +
  "    output.color0.w = r0.w;\n" +
  "    return output;\n" +
  "}\n";

/** Visible fragment-function name string (11 chars). Used by `SetFragmentFunctionName`.
 *  @Helium 0x3b0197 (leaq → "HgcBT2100_HLG_OETF"). */
export const HgcBT2100_HLG_OETF_FRAGMENT_FUNC_NAME = "HgcBT2100_HLG_OETF" as const;

/** Visible fragment-function symbol string. @Helium 0x3b0181 (1st leaq before SetVisibleShaderWithSource). */
export const HgcBT2100_HLG_OETF_VISIBLE_FRAGMENT_FUNC_SYM = "HgcBT2100_HLG_OETF_hgc_visible" as const;

/**
 * shaderDescription() returns std::string "HgcBT2100_HLG_OETF [hgc1]" (25 bytes, long-SSO
 * with tag 0x21 and length 0x19).
 * Two 16-byte movups load "HgcBT2100_HLG_OETF [hgc1]" & "_HLG_OETF [hgc1]" then splice.
 * @Helium 0x3b03b6, 0x3b03c1, 0x3b03cb.
 */
export const HgcBT2100_HLG_OETF_SHADER_DESCRIPTION = "HgcBT2100_HLG_OETF [hgc1]" as const;

// ---------------------------------------------------------------------------
// Runtime state
// ---------------------------------------------------------------------------

/**
 * The HgcBT2100_HLG_OETF instance state.
 * HGNode base (+0x00..+0x197) is opaque here — see raw-port/src/render/HGNode.ts if/when it
 * gets ported.
 */
export interface HgcBT2100_HLG_OETFState {
  /** HGNode base placeholder (+0x00..+0x197). */
  _hgNode: unknown;
  /** +0x10 int flags — RMW at ctor: flags = (flags & ~0x600) | 0x400  (@0x3b10df..0x3b10ec). */
  _nodeFlags10: number;
  /**
   * +0x198 pointer — the 32-byte-aligned scratch buffer set by ctor (@0x3b10d8).
   * Modeled as a Float32Array in TS; the alignment dance is a no-op for us.
   * Layout: see SCRATCH LAYOUT header comment.
   */
  scratch: Float32Array | null;
  /** Raw buffer that owns `scratch` — retained so we can drop it in D0/D1/D2.
   *  Corresponds to the raw pointer stashed at (aligned - 8) in the real function
   *  (@0x3b0f04 `movq %rax, (%rcx,%rax)`). */
  _scratchRaw: ArrayBuffer | null;
}

// ---------------------------------------------------------------------------
// Ctor / dtor
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()` @Helium 0x3b1110 (C1 — thunk to C2).
 * The C1 thunk is a bare tail-call to C2:
 *   0x3b1110  pushq %rbp; movq %rsp, %rbp; popq %rbp; jmp __ZN18HgcBT2100_HLG_OETFC2Ev
 */
export function HgcBT2100_HLG_OETF_ctor_C1(): HgcBT2100_HLG_OETFState {
  return HgcBT2100_HLG_OETF_ctor_C2();
}

/**
 * `HgcBT2100_HLG_OETF::HgcBT2100_HLG_OETF()` @Helium 0x3b0ed0 (C2 — full body).
 *
 * Verbatim disasm (compressed):
 *   0x3b0eda  callq HGNode::HGNode()                    [base subobject ctor]
 *   0x3b0edf  leaq 0x6a39e2(%rip),%rax  ## = 0xa548c8  (vtable+0x10, INSTALLED_PTR)
 *   0x3b0ee6  movq %rax,(%rbx)                          [install vptr]
 *   0x3b0ee9  movl $0x2e7,%edi
 *   0x3b0eee  callq __Znam                              [operator new[] 743 bytes]
 *   0x3b0ef3..0x3b0f00
 *     leaq  8(%rax),%rcx ; negl %ecx ; andl $0x1f,%ecx
 *     leaq  (%rcx,%rax),%rdx ; addq $8,%rdx             [rdx = aligned pointer p]
 *     movq  %rax,(%rcx,%rax)                             [store raw at *(p-8)]
 *   0x3b0f08..0x3b0f24
 *     xorps %xmm0,%xmm0
 *     movaps %xmm0, (%rcx,%rax)+0x08     [p+0x00..0x0F zeroed]
 *     movaps %xmm0, (%rcx,%rax)+0x18     [p+0x10..0x1F zeroed]
 *     movaps %xmm0, (%rcx,%rax)+0x28     [p+0x20..0x2F zeroed]
 *     movaps %xmm0, (%rcx,%rax)+0x38     [p+0x30..0x3F zeroed]
 *     movaps %xmm0, (%rcx,%rax)+0x48     [p+0x40..0x4F zeroed]
 *     movaps %xmm0, (%rcx,%rax)+0x58     [p+0x50..0x5F zeroed]
 *   [subsequent movaps loads: CONST_FLT_MIN2..CONST_MASK_A into p+0x60..p+0x2C0
 *    — see SCRATCH LAYOUT header for exact mapping.]
 *   0x3b10d8  movq %rdx,0x198(%rbx)                     [store aligned p at this+0x198]
 *   0x3b10df..0x3b10ec
 *     movl $0xfffff9ff,%eax
 *     andl 0x10(%rbx),%eax
 *     orl  $0x400,%eax
 *     movl %eax,0x10(%rbx)                              [flags = (flags & ~0x600) | 0x400]
 *
 * Exceptional path @0x3b10f4..0x3b1102 (unwind on new failure): __HGNodeD2 + Unwind_Resume.
 */
export function HgcBT2100_HLG_OETF_ctor_C2(): HgcBT2100_HLG_OETFState {
  // HGNode::HGNode() base subobject ctor — @0x3b0eda callq.
  HGNode_HGNode__stub();
  // Vtable install (@0x3b0edf..0x3b0ee6) — modeled by state having a well-known class type.
  // (No explicit vptr slot in TS state.)

  // operator new[](0x2e7) @0x3b0eee — allocate raw buffer.
  const rawSize = HgcBT2100_HLG_OETF_SCRATCH_ALLOC_BYTES; // 0x2e7 = 743
  const raw = new ArrayBuffer(rawSize);
  // Alignment idiom (@0x3b0ef3..0x3b0f00): p = raw + 8 + ((-raw - 8) & 31).
  // In TS the buffer's byte offset within its own ArrayBuffer is 0 and Float32Array is
  // 4-byte aligned; the 32-byte-aligned "p" is effectively at byte offset 0 of a fresh
  // Float32Array view for our purposes. The raw pointer that D2 frees is `raw` itself.

  // Scratch is a Float32Array of (0x2c0 / 4) = 176 floats — the ctor writes 22 float4
  // slots (0x160 bytes for the initial constants) plus the 2 param cells and reserved
  // zone (0x60 bytes), for 0x2c0 addressable bytes. The remaining 743-0x2c0 = 39 bytes
  // are the alignment slack (raw+0..7 stores `raw` at p-8).
  const scratch = new Float32Array(176);
  // p[0..0x60) zero-initialized: Float32Array default-initializes to 0 (@0x3b0f08..0x3b0f24).

  // Constants — each is written to TWO consecutive 16-byte slots (movaps twice per const).
  // The 2nd (higher-address) write happens first in the disasm, then the 1st. We write in
  // ascending address order; the net effect is identical.
  const setF4 = (byteOff: number, v: readonly [number, number, number, number]): void => {
    const i = byteOff >>> 2; // Float32Array index (4 bytes per element)
    scratch[i + 0] = Math.fround(v[0]);
    scratch[i + 1] = Math.fround(v[1]);
    scratch[i + 2] = Math.fround(v[2]);
    scratch[i + 3] = Math.fround(v[3]);
  };
  const setF4Splat = (byteOff: number, x: number): void => {
    const xf = Math.fround(x);
    setF4(byteOff, [xf, xf, xf, xf]);
  };

  // 0x60/0x70 — FLT_MIN×4 (loaded once, stored twice) @0x3b0f29..0x3b0f35.
  setF4Splat(0x60, HgcBT2100_HLG_OETF_CONST_FLT_MIN2);
  setF4Splat(0x70, HgcBT2100_HLG_OETF_CONST_FLT_MIN2);
  // 0x80/0x90 — RSQRTNR_SCALE @0x3b0f3a..0x3b0f49.
  setF4Splat(0x80, HgcBT2100_HLG_OETF_CONST_RSQRTNR_SCALE);
  setF4Splat(0x90, HgcBT2100_HLG_OETF_CONST_RSQRTNR_SCALE);
  // 0xA0/0xB0 — (0.5,3,3,0) @0x3b0f51..0x3b0f60.
  setF4(0xa0, HgcBT2100_HLG_OETF_CONST_HALF_3_3_0);
  setF4(0xb0, HgcBT2100_HLG_OETF_CONST_HALF_3_3_0);
  // 0xC0/0xD0 — (3,0.5,0.5,0) @0x3b0f68..0x3b0f77.
  setF4(0xc0, HgcBT2100_HLG_OETF_CONST_3_HALF_HALF_0);
  setF4(0xd0, HgcBT2100_HLG_OETF_CONST_3_HALF_HALF_0);
  // 0xE0/0xF0 — (-FLT_MIN×3, 0) @0x3b0f7f..0x3b0f8e.
  setF4(0xe0, HgcBT2100_HLG_OETF_CONST_NEG_FLT_MIN3_0);
  setF4(0xf0, HgcBT2100_HLG_OETF_CONST_NEG_FLT_MIN3_0);
  // 0x100/0x110 — (1,1,1,0) @0x3b0f96..0x3b0fa5.
  setF4(0x100, HgcBT2100_HLG_OETF_CONST_ONE3_0);
  setF4(0x110, HgcBT2100_HLG_OETF_CONST_ONE3_0);
  // 0x120/0x130 — (inf×3, 0) @0x3b0fad..0x3b0fbc.
  setF4(0x120, HgcBT2100_HLG_OETF_CONST_INF3_0);
  setF4(0x130, HgcBT2100_HLG_OETF_CONST_INF3_0);
  // 0x140/0x150 — (127×3, 0) @0x3b0fc4..0x3b0fd3.
  setF4(0x140, HgcBT2100_HLG_OETF_CONST_127_3_0);
  setF4(0x150, HgcBT2100_HLG_OETF_CONST_127_3_0);
  // 0x160/0x170 — (sqrt(2)×3, 0) @0x3b0fdb..0x3b0fea.
  setF4(0x160, HgcBT2100_HLG_OETF_CONST_SQRT2_3_0);
  setF4(0x170, HgcBT2100_HLG_OETF_CONST_SQRT2_3_0);
  // 0x180/0x190 — (0.5×3, 0) @0x3b0ff2..0x3b1001.
  setF4(0x180, HgcBT2100_HLG_OETF_CONST_HALF3_0);
  setF4(0x190, HgcBT2100_HLG_OETF_CONST_HALF3_0);
  // 0x1A0/0x1B0 — LOG2_COEF_A @0x3b1009..0x3b1018.
  setF4Splat(0x1a0, HgcBT2100_HLG_OETF_LOG2_COEF_A);
  setF4Splat(0x1b0, HgcBT2100_HLG_OETF_LOG2_COEF_A);
  // 0x1C0/0x1D0 — LOG2_COEF_B @0x3b1020..0x3b102f.
  setF4Splat(0x1c0, HgcBT2100_HLG_OETF_LOG2_COEF_B);
  setF4Splat(0x1d0, HgcBT2100_HLG_OETF_LOG2_COEF_B);
  // 0x1E0/0x1F0 — LOG2_COEF_C @0x3b1037..0x3b1046.
  setF4Splat(0x1e0, HgcBT2100_HLG_OETF_LOG2_COEF_C);
  setF4Splat(0x1f0, HgcBT2100_HLG_OETF_LOG2_COEF_C);
  // 0x200/0x210 — LOG2_COEF_D @0x3b104e..0x3b105d.
  setF4Splat(0x200, HgcBT2100_HLG_OETF_LOG2_COEF_D);
  setF4Splat(0x210, HgcBT2100_HLG_OETF_LOG2_COEF_D);
  // 0x220/0x230 — LOG2_COEF_E @0x3b1065..0x3b1074.
  setF4Splat(0x220, HgcBT2100_HLG_OETF_LOG2_COEF_E);
  setF4Splat(0x230, HgcBT2100_HLG_OETF_LOG2_COEF_E);
  // 0x240/0x250 — LOG2_COEF_F @0x3b107c..0x3b108b.
  setF4Splat(0x240, HgcBT2100_HLG_OETF_LOG2_COEF_F);
  setF4Splat(0x250, HgcBT2100_HLG_OETF_LOG2_COEF_F);
  // 0x260/0x270 — LOG2_COEF_G @0x3b1093..0x3b10a2.
  setF4Splat(0x260, HgcBT2100_HLG_OETF_LOG2_COEF_G);
  setF4Splat(0x270, HgcBT2100_HLG_OETF_LOG2_COEF_G);
  // 0x280/0x290 — (NaN×3, 0) @0x3b10aa..0x3b10b9.
  setF4(0x280, HgcBT2100_HLG_OETF_CONST_NAN3_0);
  setF4(0x290, HgcBT2100_HLG_OETF_CONST_NAN3_0);
  // 0x2A0/0x2B0 — MASK_A @0x3b10c1..0x3b10d0.
  setF4(0x2a0, HgcBT2100_HLG_OETF_CONST_MASK_A);
  setF4(0x2b0, HgcBT2100_HLG_OETF_CONST_MASK_A);

  // flags RMW @0x3b10df..0x3b10ec  ->  flags = (flags & ~0x600) | 0x400.
  const initialFlags = 0; // HGNode base has already zero-initialized flags via HGNode_ctor.
  const nodeFlags10 = (initialFlags & ~0x600) | 0x400;

  return {
    _hgNode: null,
    _nodeFlags10: nodeFlags10,
    scratch: scratch,
    _scratchRaw: raw,
  };
}

/**
 * `HgcBT2100_HLG_OETF::~HgcBT2100_HLG_OETF()` @Helium 0x3b0ed0 body:
 *   D2 @0x3b1120: reset vptr to 0xa548c8; if scratch != null && *(scratch-8) != null:
 *                   delete *(scratch-8);   [i.e. free the raw allocation]
 *                 tail-jmp HGNode::~HGNode().
 *   D1 @0x3b1170: same as D2 (body identical modulo vptr disp).
 *   D0 @0x3b11c0: same as D2, then also tail-jmp HGObject::operator delete(this)
 *                 (deleting dtor).
 * In TS we model raw ownership via `_scratchRaw`. Clearing the fields is the "delete"
 * effect; garbage collection releases the ArrayBuffer.
 */
export function HgcBT2100_HLG_OETF_dtor_D2(state: HgcBT2100_HLG_OETFState): void {
  // Vtable reset (@0x3b1120..0x3b1127) — no explicit vptr in TS state.
  if (state._scratchRaw !== null) {
    // Free the raw allocation (@0x3b1153 callq __ZdlPv).
    state._scratchRaw = null;
    state.scratch = null;
  }
  // Tail-jmp HGNode::~HGNode() (@0x3b1161).
  HGNode_dtor_D2__stub();
}

/** D1 has the same body as D2 (@0x3b1170..0x3b11b1). */
export function HgcBT2100_HLG_OETF_dtor_D1(state: HgcBT2100_HLG_OETFState): void {
  // (Body byte-identical to D2 modulo vtable-reset displacement.)
  HgcBT2100_HLG_OETF_dtor_D2(state);
}

/**
 * D0 (deleting dtor) @0x3b11c0..0x3b11fe: D2 body + tail-jmp `HGObject::operator delete(this)`.
 */
export function HgcBT2100_HLG_OETF_dtor_D0(state: HgcBT2100_HLG_OETFState): void {
  HgcBT2100_HLG_OETF_dtor_D2(state);
  // Tail-jmp HGObject::operator delete(this) (@0x3b11fe).
  HGObject_operator_delete__stub();
}

// ---------------------------------------------------------------------------
// GetProgram / shaderDescription
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::GetProgram(HGRenderer* r)` @Helium 0x3b0140.
 *
 * Verbatim disasm:
 *   0x3b0144  movq %rsi,%rdi                 [renderer -> rdi]
 *   0x3b0147  movl $0x60000,%esi             [kind = 0x60000]
 *   0x3b014c  callq HGRenderer::GetTarget    [uint kind -> uint target]
 *   0x3b0151  xorl %ecx,%ecx                 [ret = nullptr]
 *   0x3b0153  cmpl $0x60b10,%eax             [if target == 0x60b10]
 *   0x3b0158  leaq disp32(%rip),%rax         [-> shader-source string ptr]
 *   0x3b015f  cmoveq %rax,%rcx               [ret = shader_src if eq]
 *   0x3b0163  movq %rcx,%rax; retq
 *
 * Returns the shader source string when the renderer's target-for-kind(0x60000) equals
 * 0x60b10; otherwise returns null.
 */
export function HgcBT2100_HLG_OETF_GetProgram(renderer: unknown): string | null {
  const target = HGRenderer_GetTarget__stub(renderer, 0x60000);
  return target === 0x60b10 ? HgcBT2100_HLG_OETF_FRAGMENT_SHADER_SRC : null;
}

/**
 * `HgcBT2100_HLG_OETF::shaderDescription() const` @Helium 0x3b0390.
 *
 * Verbatim disasm:
 *   0x3b0399  movl  $0x20,%edi
 *   0x3b039e  callq __Znwm                   [operator new(0x20) — long-SSO string body]
 *   0x3b03a3  movq  %rax,0x10(%rbx)          [outStr->long_ptr = new_buf]
 *   0x3b03a7  movq  $0x21,(%rbx)             [outStr->tag = 0x21 (long-SSO capacity)]
 *   0x3b03ae  movq  $0x19,0x8(%rbx)          [outStr->size = 25]
 *   0x3b03b6  movups (lit),%xmm0             [load "_HLG_OETF [hgc1]"]
 *   0x3b03bd  movups %xmm0,0x9(%rax)         [write tail bytes at offset 9]
 *   0x3b03c1  movups (lit),%xmm0             [load "HgcBT2100_HLG_OETF [hgc1]"]
 *   0x3b03c8  movups %xmm0,(%rax)            [write first 16 bytes]
 *   0x3b03cb  movb   $0,0x19(%rax)           [null-terminator @ offset 25]
 *   0x3b03cf  movq   %rbx,%rax; retq
 *
 * Returns the exact 25-character C++ string "HgcBT2100_HLG_OETF [hgc1]".
 */
export function HgcBT2100_HLG_OETF_shaderDescription(): string {
  // operator new(0x20) allocation is a C++ implementation detail; we return the string.
  return HgcBT2100_HLG_OETF_SHADER_DESCRIPTION;
}

// ---------------------------------------------------------------------------
// InitProgramDescriptor
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::InitProgramDescriptor(HGProgramDescriptor* pd) const` @Helium 0x3b0170.
 *
 * Populates a Metal program descriptor with:
 *   (1) The visible-shader source and its symbol name — via
 *       `HGProgramDescriptor::SetVisibleShaderWithSource("HgcBT2100_HLG_OETF_hgc_visible",
 *                                                        VISIBLE_SHADER_SRC)`  (@0x3b0192).
 *   (2) The fragment function name — via
 *       `HGProgramDescriptor::SetFragmentFunctionName("HgcBT2100_HLG_OETF")`   (@0x3b01a1).
 *   (3) A return binding of kind 4 with the SSO string "FragmentOut" (11 chars, tag 0x16).
 *       @0x3b01a6..0x3b01e8. The 16-byte movaps at 0x3b01d3 loads additional binding
 *       metadata from the __const literal pool (@disp32 = 0x1aeb6 → 0x3b01db+0x1aeb6 =
 *       0x3cbc91, an opaque HGBinding tail blob).
 *   (4) An argument-binding vector emplacing two HGBinding entries:
 *         [0] kind = 0x2, SSO string "float4" (6 chars, tag 0x0c), tail-blob from
 *             literal pool @0x3b022a+0x4dc59f = 0x88c7d0.
 *         [1] kind = 0xa, SSO string "float4" (6 chars, tag 0x0c), tail-blob from
 *             literal pool @0x3b027c+0x1ae14 = 0x3cbc90.
 *       Two `__emplace_back_slow_path` calls @0x3b023d and @0x3b02c7 grow the vector.
 *   (5) `HGProgramDescriptor::SetArgumentBindings(&argVec)` @0x3b02e6.
 *
 * The kind values (4/2/0xa) correspond to HGBinding-kind enum values that are opaque
 * outside this file — see re/HGBinding_LAYOUT.md when it lands.
 */
export function HgcBT2100_HLG_OETF_InitProgramDescriptor(pd: unknown): void {
  // (1) SetVisibleShaderWithSource — @0x3b0192.
  HGProgramDescriptor_SetVisibleShaderWithSource__stub(
    pd,
    HgcBT2100_HLG_OETF_VISIBLE_FRAGMENT_FUNC_SYM,
    HgcBT2100_HLG_OETF_VISIBLE_SHADER_SRC,
  );

  // (2) SetFragmentFunctionName — @0x3b01a1.
  HGProgramDescriptor_SetFragmentFunctionName__stub(pd, HgcBT2100_HLG_OETF_FRAGMENT_FUNC_NAME);

  // (3) SetReturnBinding — @0x3b01e8.
  // Construct HGBinding on stack: kind=4, name="FragmentOut", tail=__const[0x3cbc91..].
  HGProgramDescriptor_SetReturnBinding__stub(pd, {
    kind: 4,
    name: "FragmentOut",
    tail: HgcBT2100_HLG_OETF_INIT_PD_RETURN_BINDING_TAIL_ADDR, // opaque 16-byte blob
  });

  // (4) argVec.emplace_back(...) x2 — @0x3b023d and @0x3b02c7.
  const argVec: HGBinding[] = [];
  HGBindingVector_emplace_back__stub(argVec, {
    kind: 0x2,
    name: "float4",
    tail: HgcBT2100_HLG_OETF_INIT_PD_ARG0_BINDING_TAIL_ADDR,
  });
  HGBindingVector_emplace_back__stub(argVec, {
    kind: 0xa,
    name: "float4",
    tail: HgcBT2100_HLG_OETF_INIT_PD_ARG1_BINDING_TAIL_ADDR,
  });

  // (5) SetArgumentBindings — @0x3b02e6.
  HGProgramDescriptor_SetArgumentBindings__stub(pd, argVec);
}

/** Return-binding tail blob address (@const 0x3cbc91). Referenced by movaps @0x3b01d3. */
export const HgcBT2100_HLG_OETF_INIT_PD_RETURN_BINDING_TAIL_ADDR = 0x3cbc91 as const;
/** Arg-binding[0] tail blob address (@const 0x88c7d0). Referenced by movaps @0x3b022a. */
export const HgcBT2100_HLG_OETF_INIT_PD_ARG0_BINDING_TAIL_ADDR = 0x88c7d0 as const;
/** Arg-binding[1] tail blob address (@const 0x3cbc90). Referenced by movaps @0x3b0275. */
export const HgcBT2100_HLG_OETF_INIT_PD_ARG1_BINDING_TAIL_ADDR = 0x3cbc90 as const;

/** HGBinding shape used by InitProgramDescriptor. Full layout is opaque; the ctor takes
 *  a kind (int32), an SSO C++ string (name), and an opaque tail blob loaded via movaps. */
interface HGBinding {
  kind: number;
  name: string;
  tail: number; // address of the 16-byte tail blob in Helium __const
}

// ---------------------------------------------------------------------------
// Bind / BindTexture
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::Bind(HGHandler* h)` @Helium 0x3b0450.
 *
 * Verbatim disasm:
 *   0x3b045d  movq 0x198(%rdi),%rdx          [rdx = scratch]
 *   0x3b0464  movq (%rsi),%rax               [vtable of HGHandler]
 *   0x3b0467  movq %rsi,%rdi                 [self = h]
 *   0x3b046a  xorl %esi,%esi                 [arg1 = 0]
 *   0x3b046c  movl $0x1,%ecx                 [arg3 = 1]
 *   0x3b0471  callq *0x90(%rax)              [h->vtable[0x90](self, 0, scratch, 1)]
 *
 *   0x3b0477  movq 0x198(%r14),%rdx          [rdx = scratch]
 *   0x3b047e  addq $0x20,%rdx                [rdx = scratch + 0x20 (i.e. &params[1])]
 *   0x3b0482  movq (%rbx),%rax               [vtable of h]
 *   0x3b0485  movq %rbx,%rdi                 [self = h]
 *   0x3b0488  movl $0x1,%esi                 [arg1 = 1]
 *   0x3b048d  movl $0x1,%ecx                 [arg3 = 1]
 *   0x3b0492  callq *0x90(%rax)              [h->vtable[0x90](h, 1, &params[1], 1)]
 *
 *   0x3b0498  movq (%r14),%rax               [vtable of self (this)]
 *   0x3b049b  movq %r14,%rdi                 [arg0 = this]
 *   0x3b049e  movq %rbx,%rsi                 [arg1 = h]
 *   0x3b04a1  callq *0xc0(%rax)              [this->vtable[0xc0](this, h) — a hook slot]
 *
 *   0x3b04a7  xorl %eax,%eax; retq          [return 0]
 *
 * The pattern is: publish params[0] and params[1] to the handler at slot indices 0 and 1
 * (via vtable slot 0x90 = "SetConstantBuffer" or similar), then dispatch through this's
 * own vtable slot 0xc0 (the class-specific finalize hook).
 */
export function HgcBT2100_HLG_OETF_Bind(state: HgcBT2100_HLG_OETFState, h: unknown): number {
  if (state.scratch === null) {
    throw new Error("HgcBT2100_HLG_OETF::Bind @0x3b0450 called before ctor initialized scratch");
  }
  // 1st vtable call — h->slot0x90(h, 0, scratch, 1).
  HGHandler_vtable0x90__stub(h, 0, state.scratch.subarray(0x00 >>> 2, 0x20 >>> 2), 1);
  // 2nd vtable call — h->slot0x90(h, 1, scratch+0x20, 1).
  HGHandler_vtable0x90__stub(h, 1, state.scratch.subarray(0x20 >>> 2, 0x40 >>> 2), 1);
  // 3rd vtable call — this->slot0xc0(this, h).
  HgcBT2100_HLG_OETF_vtable0xc0__stub(state, h);
  return 0;
}

/**
 * `HgcBT2100_HLG_OETF::BindTexture(HGHandler* h, int idx)` @Helium 0x3b03e0.
 *
 * Verbatim disasm:
 *   0x3b03e7  movl $0xffffffff,%ebx           [ret = -1]
 *   0x3b03ec  testl %edx,%edx                 [if idx != 0]
 *   0x3b03ee  jne 0x3b0445                    [-> return -1]
 *   0x3b03f0  movq %rsi,%r14                  [r14 = h]
 *   0x3b03f3  movq (%rsi),%rax                [vtable of h]
 *   0x3b03f6  xorl %ebx,%ebx                  [ret = 0]
 *   0x3b03f8  movq %rsi,%rdi
 *   0x3b03fb  xorl %esi,%esi
 *   0x3b03fd  xorl %edx,%edx
 *   0x3b03ff  callq *0x48(%rax)               [h->vtable[0x48](h, 0, 0)]
 *
 *   0x3b0402  movq (%r14),%rax
 *   0x3b0405  movq %r14,%rdi
 *   0x3b0408  xorl %esi,%esi
 *   0x3b040a  xorl %edx,%edx
 *   0x3b040c  callq *0x30(%rax)               [h->vtable[0x30](h, 0, 0)]
 *
 *   0x3b040f  movq %r14,%rdi
 *   0x3b0412  xorl %esi,%esi
 *   0x3b0414  xorl %edx,%edx
 *   0x3b0416  xorl %ecx,%ecx
 *   0x3b0418  xorl %r8d,%r8d
 *   0x3b041b  callq HGHandler::TexCoord(0,0,0,nullptr)
 *
 *   0x3b0420  movq 0x90(%r14),%rdi            [handler->0x90 field → obj-with-vtable]
 *   0x3b0427  movq (%rdi),%rax                [that vtable]
 *   0x3b042a  movl $0x2e,%esi                 [arg1 = 0x2e]
 *   0x3b042f  callq *0x80(%rax)               [obj->vtable[0x80](obj, 0x2e)]
 *   0x3b0435  testl %eax,%eax                 [if result != 0 -> return -1]
 *   0x3b0437  jne 0x3b0445
 *
 *   0x3b0439  movq (%r14),%rax
 *   0x3b043c  movq %r14,%rdi
 *   0x3b043f  callq *0xa8(%rax)               [h->vtable[0xa8](h)]
 *
 *   0x3b0445  movl %ebx,%eax; retq
 *
 * Returns 0 on success, -1 if idx != 0 or the mid-stream check fails.
 */
export function HgcBT2100_HLG_OETF_BindTexture(
  _state: HgcBT2100_HLG_OETFState,
  h: unknown,
  idx: number,
): number {
  if (idx !== 0) {
    return -1;
  }
  HGHandler_vtable0x48__stub(h, 0, 0);
  HGHandler_vtable0x30__stub(h, 0, 0);
  HGHandler_TexCoord__stub(h, 0, 0, 0, null);
  const sub = HGHandler_field0x90__stub(h);
  const rc = HGHandlerSub_vtable0x80__stub(sub, 0x2e);
  if (rc !== 0) {
    return -1;
  }
  HGHandler_vtable0xa8__stub(h);
  return 0;
}

// ---------------------------------------------------------------------------
// GetDOD / GetROI
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::GetDOD(HGRenderer*, int inputIdx, HGRect r)` @Helium 0x3b0e90.
 *
 * Verbatim disasm:
 *   0x3b0e93  testl %edx,%edx                 [if inputIdx != 0]
 *   0x3b0e95  je 0x3b0eaa                     [-> return r as-is]
 *   0x3b0e9b  leaq _HGRectNull(%rip),%rcx
 *   0x3b0ea2  movq (%rcx),%rax
 *   0x3b0ea5  movq 0x8(%rcx),%r8              [return HGRectNull]
 *   0x3b0eaa  ...                             [rax=r.lo, r8=r.hi]
 *
 * So: `input 0` → pass-through the caller's HGRect; anything else → HGRectNull.
 * (Directly mirrors HgcMultiplyAlpha::GetDOD @Flexo 0x14691b0.)
 */
export function HgcBT2100_HLG_OETF_GetDOD(
  _renderer: unknown,
  inputIdx: number,
  r: HGRect,
): HGRect {
  return inputIdx === 0 ? r : HGRectNull;
}

/**
 * `HgcBT2100_HLG_OETF::GetROI(HGRenderer*, int inputIdx, HGRect r)` @Helium 0x3b0eb0.
 * Verbatim identical body to GetDOD (@0x3b0eb0..0x3b0ecd). Same semantic.
 */
export function HgcBT2100_HLG_OETF_GetROI(
  _renderer: unknown,
  inputIdx: number,
  r: HGRect,
): HGRect {
  return inputIdx === 0 ? r : HGRectNull;
}

// ---------------------------------------------------------------------------
// SetParameter / GetParameter / GetOutput
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::SetParameter(int id, float a, float b, float c, float d)` @Helium 0x3b1210.
 *
 * Verbatim disasm:
 *   0x3b1210  movl $0xffffffff,%eax           [ret = -1]
 *   0x3b1215  cmpl $0x1,%esi
 *   0x3b1218  ja 0x3b1283                     [if (unsigned)id > 1 -> return -1]
 *   0x3b121a  movq 0x198(%rdi),%rcx           [rcx = scratch]
 *   0x3b1221  movl %esi,%edx
 *   0x3b1223  shlq $0x5,%rdx                  [byte offset = id * 0x20]
 *   0x3b1227  leaq (%rcx,%rdx),%rax           [ptr = &scratch[id*8]]
 *   0x3b122b  movss (%rcx,%rdx),%xmm4
 *   0x3b1230  ucomiss %xmm0,%xmm4             [compare ptr[0] vs a — ordered]
 *   ...same pattern for ptr[1] vs b, ptr[2] vs c, ptr[3] vs d.
 *   0x3b1259  jnp 0x3b1284                    [if ALL four equal & unordered? -> take no-op path]
 *   0x3b125b..0x3b1275: pack (a,b,c,d) via insertps into xmm0 and store to ptr[0..3]
 *                        AND ptr[4..7] (both param cells, since ctor duplicated all consts).
 *                        Wait — 0x3b1275 stores to (%rax) and 0x3b1271 stores to 0x10(%rax).
 *                        So it writes the same 16-byte float4 to BOTH ptr[0..3] AND ptr[4..7].
 *                        (This duplicated write matches the ctor's paired-store pattern:
 *                         each user param is also mirrored at param_slot + 0x10 for the
 *                         SSE inner loop that reads {params[0], params[0], params[1], params[1]}
 *                         from consecutive 16-byte slots.)
 *   0x3b1278  callq HGNode::ClearBits()       [invalidate cached state]
 *   0x3b127d  movl $0x1,%eax                  [ret = 1 (changed)]
 *   0x3b1283  retq
 *
 *   0x3b1284  xorl %eax,%eax; retq           [return 0 (no change — all four already equal)]
 *
 * Returns:
 *   -1 : id out of range (0 or 1 required)
 *    0 : (a,b,c,d) equals the existing params[id]  — nothing written
 *    1 : written, cache invalidated
 */
export function HgcBT2100_HLG_OETF_SetParameter(
  state: HgcBT2100_HLG_OETFState,
  id: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  // id is compared as UNSIGNED (`cmpl $0x1, %esi; ja`) so negatives fall through as > 1.
  const idU = id >>> 0;
  if (idU > 1) {
    return -1;
  }
  if (state.scratch === null) {
    throw new Error("HgcBT2100_HLG_OETF::SetParameter @0x3b1210 called before ctor");
  }
  const off = idU * 0x20;
  const base = off >>> 2; // Float32Array index of ptr[0]
  const s = state.scratch;
  const af = Math.fround(a), bf = Math.fround(b), cf = Math.fround(c), df = Math.fround(d);
  // Ordered-equality test (@0x3b1230..0x3b1259: ucomiss + jne/jp). Signaling-NaN semantics
  // mean any NaN input causes PF=1 (fall through to write). JS !== is Object.is-adjacent for
  // finite floats; use bit-cast-compatible test via typed-array reload for NaN parity.
  const eq0 = Math.fround(s[base + 0]) === af && !Number.isNaN(af);
  const eq1 = Math.fround(s[base + 1]) === bf && !Number.isNaN(bf);
  const eq2 = Math.fround(s[base + 2]) === cf && !Number.isNaN(cf);
  const eq3 = Math.fround(s[base + 3]) === df && !Number.isNaN(df);
  if (eq0 && eq1 && eq2 && eq3) {
    return 0;
  }
  // insertps builds (a,b,c,d); movups stores to ptr[0..3] AND ptr[4..7] (@0x3b1271..0x3b1275).
  s[base + 0] = af;
  s[base + 1] = bf;
  s[base + 2] = cf;
  s[base + 3] = df;
  s[base + 4] = af;
  s[base + 5] = bf;
  s[base + 6] = cf;
  s[base + 7] = df;
  HGNode_ClearBits__stub(state);
  return 1;
}

/**
 * `HgcBT2100_HLG_OETF::GetParameter(int id, float* out)` @Helium 0x3b1290.
 *
 * Verbatim disasm:
 *   0x3b1290  movl $0xffffffff,%eax
 *   0x3b1295  cmpl $0x1,%esi
 *   0x3b1298  ja 0x3b12d8                     [id>1 -> return -1]
 *   0x3b129e  movq 0x198(%rdi),%rax
 *   0x3b12a5  movl %esi,%ecx; shlq $5,%rcx    [byte offset = id*0x20]
 *   0x3b12ab..0x3b12d5: 4 x movss (%rax,%rcx,off) -> movss %xmm0, (out+off)
 *   0x3b12d5  xorl %eax,%eax                  [ret = 0]
 *   0x3b12d7  retq
 *
 * Copies the 4 floats of `params[id]` to `out[0..3]`. Returns 0 on success, -1 if id > 1.
 */
export function HgcBT2100_HLG_OETF_GetParameter(
  state: HgcBT2100_HLG_OETFState,
  id: number,
  out: Float32Array,
): number {
  const idU = id >>> 0;
  if (idU > 1) {
    return -1;
  }
  if (state.scratch === null) {
    throw new Error("HgcBT2100_HLG_OETF::GetParameter @0x3b1290 called before ctor");
  }
  const base = (idU * 0x20) >>> 2;
  const s = state.scratch;
  out[0] = s[base + 0];
  out[1] = s[base + 1];
  out[2] = s[base + 2];
  out[3] = s[base + 3];
  return 0;
}

/**
 * `HgcBT2100_HLG_OETF::GetOutput(HGRenderer*)` @Helium 0x3b12e0.
 *
 * Verbatim disasm:
 *   0x3b12e4  movq %rdi,%rax                  [return this]
 *   0x3b12e7  popq %rbp
 *   0x3b12e8  retq
 *
 * Returns `this` (an identity "output" self-reference — used by downstream nodes that
 * chain `GetOutput()` calls to walk to the source HGNode).
 */
export function HgcBT2100_HLG_OETF_GetOutput(
  state: HgcBT2100_HLG_OETFState,
  _renderer: unknown,
): HgcBT2100_HLG_OETFState {
  return state;
}

// ---------------------------------------------------------------------------
// RenderTile (dispatcher + SSE body) — LARGE, NOT YET TRANSCRIBED
// ---------------------------------------------------------------------------

/**
 * `HgcBT2100_HLG_OETF::RenderTile(HGTile* tile)` @Helium 0x3b0930.
 *
 * Dispatcher (@0x3b0930..0x3b096f):
 *   1. `target = HGRenderer::GetTarget(HGTile::Renderer(tile), 0)`  @0x3b0944 / 0x3b094e.
 *   2. If `target >= 0x4700000` → tail-call `RenderTile_AVX(tile)`  @0x3b0953..0x3b0960.
 *   3. Else two SSE inner loops (@0x3b09c0..0x3b0be5 and @0x3b0c30..0x3b0e77) depending on
 *      whether `target <= 0x44fffff` (@0x3b098f `cmpl $0x44fffff,%eax; jbe 0x3b0c00`).
 *
 * Inner loops iterate `dst[i]` = HLG_OETF(src[i]) per RGBA pixel using rsqrt-based sqrt
 * refinement and a log2(1+f) polynomial. Both loops read the scratch constants written
 * by the ctor at p[0x60..0x2c0].
 *
 * FRONTIER — 302-line SSE body with two variants; not yet transcribed. The math IS the
 * BT.2100 HLG OETF (documented in the header). Transcribing it correctly requires:
 *   - modeling the SSE inner loop exactly (six xmm regs + memory ops per pixel);
 *   - preserving the rsqrt→Newton-Raphson correction with RSQRTNR_SCALE;
 *   - preserving the exponent-extraction (`psrld $0x17`, subtract 127) + polynomial-of-
 *     fraction log2 path;
 *   - the alpha-preservation blend at the end (`blendps $0x8` merges src.w into out.w).
 *
 * That work is intentionally deferred to keep this leaf's decode-before-implement
 * discipline honest — a bit-exact SSE port is a multi-hour transcription and must be
 * checked against the live FCP symbol via the parity harness.
 */
export function HgcBT2100_HLG_OETF_RenderTile(
  _state: HgcBT2100_HLG_OETFState,
  _tile: unknown,
): number {
  throw new Error(
    "HgcBT2100_HLG_OETF::RenderTile @Helium 0x3b0930 not yet transcribed — 302-line SSE " +
      "software rasterizer (BT.2100 HLG OETF) with two target-gated inner loops @0x3b09c0 " +
      "and @0x3b0c30 plus AVX tail-call @0x3b0960; requires bit-exact rsqrt+Newton and " +
      "polynomial-log2 transcription checked against the live symbol.",
  );
}

/**
 * `HgcBT2100_HLG_OETF::RenderTile_AVX(HGTile* tile)` @Helium 0x3b04b0.
 *
 * 227-line AVX2 (256-bit / 8-lane) variant of RenderTile — same output math, wider lanes.
 * Selected by the RenderTile dispatcher when `target >= 0x4700000` (@0x3b0953..0x3b0960).
 *
 * FRONTIER — not yet transcribed. Same math as RenderTile SSE; will be ported together
 * with the SSE body to keep them bit-exact.
 */
export function HgcBT2100_HLG_OETF_RenderTile_AVX(
  _state: HgcBT2100_HLG_OETFState,
  _tile: unknown,
): number {
  throw new Error(
    "HgcBT2100_HLG_OETF::RenderTile_AVX @Helium 0x3b04b0 not yet transcribed — 227-line " +
      "AVX2 variant of RenderTile (BT.2100 HLG OETF, 8-lane); ports jointly with the SSE " +
      "body.",
  );
}

// ---------------------------------------------------------------------------
// Frontier callee stubs — all throw with @0xADDR provenance on the SAME line as the throw.
// ---------------------------------------------------------------------------

/** HGNode::HGNode() base ctor. Called by C2 @0x3b0eda. */
function HGNode_HGNode__stub(): void {
  throw new Error("HGNode::HGNode() @Helium (call-site 0x3b0eda) not yet transcribed");
}
/** HGNode::~HGNode() base dtor. Called by D2/D1/D0 (@0x3b1161 / 0x3b11b1 / 0x3b11f0). */
function HGNode_dtor_D2__stub(): void {
  throw new Error("HGNode::~HGNode() @Helium (call-site 0x3b11f0) not yet transcribed");
}
/** HGNode::ClearBits() — invalidates cached compilation. Called by SetParameter @0x3b1278. */
function HGNode_ClearBits__stub(_state: HgcBT2100_HLG_OETFState): void {
  throw new Error("HGNode::ClearBits() @Helium (call-site 0x3b1278) not yet transcribed");
}
/** HGObject::operator delete(this). Called by D0 @0x3b11fe. */
function HGObject_operator_delete__stub(): void {
  throw new Error("HGObject::operator delete(void*) @Helium (call-site 0x3b11fe) not yet transcribed");
}
/** HGRenderer::GetTarget(uint kind). Called by GetProgram @0x3b014c. */
function HGRenderer_GetTarget__stub(_r: unknown, _kind: number): number {
  throw new Error("HGRenderer::GetTarget @Helium (call-site 0x3b014c) not yet transcribed");
}
/** HGHandler vtable slot 0x30 — Called by BindTexture @0x3b040c. */
function HGHandler_vtable0x30__stub(_h: unknown, _a: number, _b: number): void {
  throw new Error("HGHandler::<vtable+0x30> @Helium (call-site 0x3b040c) not yet transcribed");
}
/** HGHandler vtable slot 0x48 — Called by BindTexture @0x3b03ff. */
function HGHandler_vtable0x48__stub(_h: unknown, _a: number, _b: number): void {
  throw new Error("HGHandler::<vtable+0x48> @Helium (call-site 0x3b03ff) not yet transcribed");
}
/** HGHandler::TexCoord(int,int,int,double const*). Called by BindTexture @0x3b041b. */
function HGHandler_TexCoord__stub(
  _h: unknown, _a: number, _b: number, _c: number, _p: Float64Array | null,
): void {
  throw new Error("HGHandler::TexCoord @Helium (call-site 0x3b041b) not yet transcribed");
}
/** HGHandler+0x90 field load. @0x3b0420 movq 0x90(%r14),%rdi. */
function HGHandler_field0x90__stub(_h: unknown): unknown {
  throw new Error("HGHandler::<field+0x90> load @Helium (call-site 0x3b0420) not yet transcribed");
}
/** Vtable+0x80 on the sub-object returned by handler+0x90. Called @0x3b042f. */
function HGHandlerSub_vtable0x80__stub(_sub: unknown, _arg: number): number {
  throw new Error("HGHandlerSub::<vtable+0x80> @Helium (call-site 0x3b042f) not yet transcribed");
}
/** HGHandler vtable slot 0x90 (SetConstantBuffer-like). Called by Bind @0x3b0471 & @0x3b0492. */
function HGHandler_vtable0x90__stub(
  _h: unknown, _slot: number, _buf: Float32Array, _count: number,
): void {
  throw new Error("HGHandler::<vtable+0x90> @Helium (call-site 0x3b0471) not yet transcribed");
}
/** HGHandler vtable slot 0xa8. Called by BindTexture @0x3b043f. */
function HGHandler_vtable0xa8__stub(_h: unknown): void {
  throw new Error("HGHandler::<vtable+0xa8> @Helium (call-site 0x3b043f) not yet transcribed");
}
/** this->vtable[0xc0] hook — Called by Bind @0x3b04a1. */
function HgcBT2100_HLG_OETF_vtable0xc0__stub(
  _state: HgcBT2100_HLG_OETFState, _h: unknown,
): void {
  throw new Error("HgcBT2100_HLG_OETF::<vtable+0xc0> @Helium (call-site 0x3b04a1) not yet transcribed");
}
/** HGProgramDescriptor::SetVisibleShaderWithSource. Called by InitProgramDescriptor @0x3b0192. */
function HGProgramDescriptor_SetVisibleShaderWithSource__stub(
  _pd: unknown, _sym: string, _src: string,
): void {
  throw new Error(
    "HGProgramDescriptor::SetVisibleShaderWithSource @Helium (call-site 0x3b0192) not yet transcribed",
  );
}
/** HGProgramDescriptor::SetFragmentFunctionName. Called by InitProgramDescriptor @0x3b01a1. */
function HGProgramDescriptor_SetFragmentFunctionName__stub(_pd: unknown, _name: string): void {
  throw new Error(
    "HGProgramDescriptor::SetFragmentFunctionName @Helium (call-site 0x3b01a1) not yet transcribed",
  );
}
/** HGProgramDescriptor::SetReturnBinding(HGBinding). Called by InitProgramDescriptor @0x3b01e8. */
function HGProgramDescriptor_SetReturnBinding__stub(_pd: unknown, _binding: HGBinding): void {
  throw new Error(
    "HGProgramDescriptor::SetReturnBinding @Helium (call-site 0x3b01e8) not yet transcribed",
  );
}
/** HGProgramDescriptor::SetArgumentBindings(vector<HGBinding>const&). Called @0x3b02e6. */
function HGProgramDescriptor_SetArgumentBindings__stub(_pd: unknown, _v: HGBinding[]): void {
  throw new Error(
    "HGProgramDescriptor::SetArgumentBindings @Helium (call-site 0x3b02e6) not yet transcribed",
  );
}
/** std::vector<HGBinding>::__emplace_back_slow_path. Called by InitProgramDescriptor
 *  @0x3b023d and @0x3b02c7. We use a normal push_back since C++ vector-growth strategy
 *  isn't observable through the semantic port. */
function HGBindingVector_emplace_back__stub(v: HGBinding[], b: HGBinding): void {
  v.push(b);
}
