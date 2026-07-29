// -----------------------------------------------------------------------------
// HgcST2084_EOTF — the Helium GPU-compiled ST.2084 EOTF (PQ / Perceptual
// Quantizer decode) shader node.
//
// SMPTE ST.2084 Perceptual Quantizer, transcribed FAITHFULLY from the FCP
// Helium framework. Contains:
//   - Fragment (Metal) shader source + visible-shader source strings.
//   - Ctor scratch-pad layout with 28 float4 constants + 2 param slots.
//   - Ctor/dtor/vtable bookkeeping.
//   - GetProgram / InitProgramDescriptor / shaderDescription.
//   - Bind / BindTexture / SetParameter / GetParameter / GetOutput / GetDOD /
//     GetROI (faithful vtable / handler dispatch — externs stubbed with @0xADDR).
//   - RenderTile / RenderTile_AVX — the SSE/AVX software rasterizers — throw
//     "not yet transcribed" with call-site provenance (large SSE bodies, will
//     be transcribed jointly with the other Hgc* shader math).
//
// Uses the SAME ctor/scratch idiom as HgcBT2100_HLG_OETF (see that file for the
// full alignment-idiom breakdown). Layout differs: 999-byte alloc, 28 float4
// slots (0x60..0x3c0), differing polynomial coefficients & masks.
//
// PROVENANCE: every function cites @Helium 0x<addr> and every constant cites
// the data-section address it was read from.
//
// SCRATCH LAYOUT (@p offsets, bytes; each row is one 16-byte float4 slot):
//   p[0x000..0x040)  params[0..1]         — 2 x float4 (user, zeroed by ctor)
//   p[0x040..0x060)  reserved zeroed      (last 32 bytes of the user zone)
//   p[0x060..0x080)  CONST_ZERO3_NEG_INF  = (0, 0, 0, -inf)   (data @0x892950)
//   p[0x080..0x0A0)  CONST_ONE3_POS_INF   = (1, 1, 1, +inf)   (data @0x88ec10)
//   p[0x0A0..0x0C0)  CONST_NEG_FLT_MIN3_0 = (-FLT_MIN, ...×3, 0)  (data @0x892090)
//   p[0x0C0..0x0E0)  CONST_FLT_MIN3_0     = ( FLT_MIN, ...×3, 0)  (data @0x858f70)
//   p[0x0E0..0x100)  CONST_INF3_0         = (inf, inf, inf, 0)   (data @0x88f440)
//   p[0x100..0x120)  CONST_127_3_0        = (127, 127, 127, 0)   (data @0x88ded0)
//   p[0x120..0x140)  CONST_SQRT2_3_0      = (sqrt2, sqrt2, sqrt2, 0)  (data @0x88dee0)
//   p[0x140..0x160)  CONST_HALF3_0        = (0.5, 0.5, 0.5, 0)   (data @0x85da90)
//   p[0x160..0x180)  LOG2_COEF_A          = 0.2960891127586365  x3+0 (data @0x88dfa0)
//   p[0x180..0x1A0)  LOG2_COEF_B          = -0.35917338728904724 x3+0 (data @0x88dfb0)
//   p[0x1A0..0x1C0)  LOG2_COEF_C          = 0.17290928959846497  x3+0 (data @0x88dfc0)
//   p[0x1C0..0x1E0)  LOG2_COEF_D          = -0.27149274945259094 x3+0 (data @0x88dfd0)
//   p[0x1E0..0x200)  LOG2_COEF_E          = 0.4805939197540283   x3+0 (data @0x88dfe0)
//   p[0x200..0x220)  LOG2_COEF_F          = -0.7213672399520874  x3+0 (data @0x88dff0)
//   p[0x220..0x240)  LOG2_COEF_G          = 1.4426966905593872   x3+0 (data @0x88e000; ≈log2(e))
//   p[0x240..0x260)  CONST_NEG_127_3_0    = (-127, -127, -127, 0)  (data @0x88df30)
//   p[0x260..0x280)  EXP2_COEF_A          = 0.0017952255439013243 x3+0 (data @0x88e010)
//   p[0x280..0x2A0)  EXP2_COEF_B          = 0.009189177304506302  x3+0 (data @0x88e020)
//   p[0x2A0..0x2C0)  EXP2_COEF_C          = 0.055661238729953766  x3+0 (data @0x88e030)
//   p[0x2C0..0x2E0)  EXP2_COEF_D          = 0.2402067929506302    x3+0 (data @0x88e040)
//   p[0x2E0..0x300)  EXP2_COEF_E          = 0.6931475400924683    x3+0 (data @0x88e050; ≈ln2)
//   p[0x300..0x320)  CONST_INT_127_3_0    = (127, 127, 127, 0)  int-form (data @0x88df70)
//   p[0x320..0x340)  CONST_RSQRTNR_SCALE  = (1.00024..., ...×4)  (data @0x85fed0)
//   p[0x340..0x360)  CONST_FLT_MAX3_0     = (FLT_MAX, ...×3, 0)  (data @0x88e1d0)
//   p[0x360..0x380)  CONST_NEG_FLT_MAX3_0 = (-FLT_MAX, ...×3, 0)  (data @0x88ec20)
//   p[0x380..0x3A0)  CONST_TWO3_0         = (2, 2, 2, 0)  (data @0x88df90)
//   p[0x3A0..0x3C0)  CONST_NAN3_0         = (nan, nan, nan, 0)  (data @0x88c7f0)
//   p[0x3C0..0x3E0)  CONST_MASK_0003_NAN  = (0, 0, 0, nan)  (data @0x85fc40)
//
// FRONTIER CALLEES (throw-stubbed at first use):
//   HGNode::HGNode()                                     @Helium (stub cite 0x3a387a)
//   HGNode::~HGNode()                                    @Helium (stub cite 0x3a3bc1)
//   HGNode::ClearBits()                                  @Helium (stub cite 0x3a3cd8)
//   HGObject::operator delete(void*)                     @Helium (stub cite 0x3a3c5e)
//   operator new[](size_t)                               @Helium (stub cite 0x3a388e)
//   operator delete(void*)                               @Helium (stub cite 0x3a3bb3)
//   HGTile::Renderer() const                             @Helium (stub cite 0x3a2fa0)
//   HGRenderer::GetTarget(unsigned int)                  @Helium (stub cite 0x3a241c)
//   HGHandler::TexCoord(int,int,int,double const*)       @Helium (stub cite 0x3a26cb)
//   HGProgramDescriptor::SetVisibleShaderWithSource(...) @Helium (stub cite 0x3a2462)
//   HGProgramDescriptor::SetFragmentFunctionName(...)    @Helium (stub cite 0x3a2471)
//   HGProgramDescriptor::SetReturnBinding(HGBinding)     @Helium (stub cite 0x3a24b8)
//   HGProgramDescriptor::SetArgumentBindings(...)        @Helium (stub cite 0x3a25b6)
//   std::vector<HGBinding>::__emplace_back_slow_path     @Helium (stub cite 0x3a250d / 0x3a2597)
// -----------------------------------------------------------------------------

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer for HgcST2084_EOTF.
 * From C2 @Helium 0x3a387f (leaq 0x6afb2a(%rip)); RIP-after = 0x3a3886;
 *   target = 0x3a3886 + 0x6afb2a = 0xa533b0   (== vtable_sym + 0x10).
 * D2 @0x3a3b80 (0x3a3b87 + 0x6af829 = 0xa533b0),
 * D1 @0x3a3bd0 (0x3a3bd7 + 0x6af7d9 = 0xa533b0),
 * D0 @0x3a3c29 (0x3a3c30 + 0x6af780 = 0xa533b0).
 */
export const HgcST2084_EOTF_VTABLE_INSTALLED_PTR = 0xa533b0 as const;

/** Vtable symbol address (base, before RTTI/offset-to-top). @Helium 0xa533a0. */
export const HgcST2084_EOTF_VTABLE_SYM = 0xa533a0 as const;

/**
 * `HgcST2084_EOTF::HgcST2084_EOTF()` ctor size: `operator new[](0x3e7)` bytes.
 * @Helium 0x3a3889 (movl $0x3e7, %edi; callq __Znam).
 */
export const HgcST2084_EOTF_SCRATCH_ALLOC_BYTES = 0x3e7 as const;

// ---------------------------------------------------------------------------
// Ctor constants read from Helium __const via RIP-relative movaps at
// 0x3a38bf..0x3a3b27. Each is one aligned 16-byte float4; ctor writes each
// TWICE to adjacent 16-byte cells at (p+off) and (p+off+0x10).
// ---------------------------------------------------------------------------

/** (0, 0, 0, -inf). Data @Helium 0x892950; loaded @0x3a38bf. p[0x58]&p[0x48]. */
export const HgcST2084_EOTF_CONST_ZERO3_NEG_INF: readonly [number, number, number, number] =
  [0.0, 0.0, 0.0, Number.NEGATIVE_INFINITY] as const;
/** (1, 1, 1, +inf). Data @Helium 0x88ec10; loaded @0x3a38d0. p[0x78]&p[0x68]. */
export const HgcST2084_EOTF_CONST_ONE3_POS_INF: readonly [number, number, number, number] =
  [1.0, 1.0, 1.0, Number.POSITIVE_INFINITY] as const;
/** (-FLT_MIN, -FLT_MIN, -FLT_MIN, 0). Data @Helium 0x892090; loaded @0x3a38e1. p[0x98]&p[0x88]. */
export const HgcST2084_EOTF_CONST_NEG_FLT_MIN3_0: readonly [number, number, number, number] =
  [-1.1754942106924411e-38, -1.1754942106924411e-38, -1.1754942106924411e-38, 0.0] as const;
/** (FLT_MIN, FLT_MIN, FLT_MIN, 0). Data @Helium 0x858f70; loaded @0x3a38f8. p[0xb8]&p[0xa8]. */
export const HgcST2084_EOTF_CONST_FLT_MIN3_0: readonly [number, number, number, number] =
  [1.1754943508222875e-38, 1.1754943508222875e-38, 1.1754943508222875e-38, 0.0] as const;
/** (+inf, +inf, +inf, 0). Data @Helium 0x88f440; loaded @0x3a390f. p[0xd8]&p[0xc8]. */
export const HgcST2084_EOTF_CONST_INF3_0: readonly [number, number, number, number] =
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0.0] as const;
/** (127, 127, 127, 0). Data @Helium 0x88ded0; loaded @0x3a3926. p[0xf8]&p[0xe8].
 *  FP32 exponent bias. */
export const HgcST2084_EOTF_CONST_127_3_0: readonly [number, number, number, number] =
  [127.0, 127.0, 127.0, 0.0] as const;
/** (sqrt(2), sqrt(2), sqrt(2), 0). Data @Helium 0x88dee0; loaded @0x3a393d. p[0x118]&p[0x108]. */
export const HgcST2084_EOTF_CONST_SQRT2_3_0: readonly [number, number, number, number] =
  [1.4142135381698608, 1.4142135381698608, 1.4142135381698608, 0.0] as const;
/** (0.5, 0.5, 0.5, 0). Data @Helium 0x85da90; loaded @0x3a3954. p[0x138]&p[0x128]. */
export const HgcST2084_EOTF_CONST_HALF3_0: readonly [number, number, number, number] =
  [0.5, 0.5, 0.5, 0.0] as const;

// log2(1+f) polynomial coefficients (identical set as in HgcBT2100_HLG_OETF).
/** log2 poly coeff A. Data @Helium 0x88dfa0; loaded @0x3a396b. p[0x178]&p[0x168]. */
export const HgcST2084_EOTF_LOG2_COEF_A = 0.2960891127586365 as const;
/** log2 poly coeff B. Data @Helium 0x88dfb0; loaded @0x3a3982. p[0x198]&p[0x188]. */
export const HgcST2084_EOTF_LOG2_COEF_B = -0.35917338728904724 as const;
/** log2 poly coeff C. Data @Helium 0x88dfc0; loaded @0x3a3999. p[0x1b8]&p[0x1a8]. */
export const HgcST2084_EOTF_LOG2_COEF_C = 0.17290928959846497 as const;
/** log2 poly coeff D. Data @Helium 0x88dfd0; loaded @0x3a39b0. p[0x1d8]&p[0x1c8]. */
export const HgcST2084_EOTF_LOG2_COEF_D = -0.27149274945259094 as const;
/** log2 poly coeff E. Data @Helium 0x88dfe0; loaded @0x3a39c7. p[0x1f8]&p[0x1e8]. */
export const HgcST2084_EOTF_LOG2_COEF_E = 0.4805939197540283 as const;
/** log2 poly coeff F. Data @Helium 0x88dff0; loaded @0x3a39de. p[0x218]&p[0x208]. */
export const HgcST2084_EOTF_LOG2_COEF_F = -0.7213672399520874 as const;
/** log2 poly leading coeff G (≈ log2(e) = 1/ln2). Data @Helium 0x88e000; loaded @0x3a39f5.
 *  p[0x238]&p[0x228]. */
export const HgcST2084_EOTF_LOG2_COEF_G = 1.4426966905593872 as const;

/** (-127, -127, -127, 0). Data @Helium 0x88df30; loaded @0x3a3a0c. p[0x258]&p[0x248].
 *  Negated FP32 exponent bias (used to re-encode the exponent after the log→pow path). */
export const HgcST2084_EOTF_CONST_NEG_127_3_0: readonly [number, number, number, number] =
  [-127.0, -127.0, -127.0, 0.0] as const;

// exp2 polynomial coefficients (5-term Horner fit to 2^f-1 on [0,1]).
/** exp2 poly coeff A. Data @Helium 0x88e010; loaded @0x3a3a23. p[0x278]&p[0x268]. */
export const HgcST2084_EOTF_EXP2_COEF_A = 0.0017952255439013243 as const;
/** exp2 poly coeff B. Data @Helium 0x88e020; loaded @0x3a3a3a. p[0x298]&p[0x288]. */
export const HgcST2084_EOTF_EXP2_COEF_B = 0.009189177304506302 as const;
/** exp2 poly coeff C. Data @Helium 0x88e030; loaded @0x3a3a51. p[0x2b8]&p[0x2a8]. */
export const HgcST2084_EOTF_EXP2_COEF_C = 0.055661238729953766 as const;
/** exp2 poly coeff D. Data @Helium 0x88e040; loaded @0x3a3a68. p[0x2d8]&p[0x2c8]. */
export const HgcST2084_EOTF_EXP2_COEF_D = 0.2402067929506302 as const;
/** exp2 poly coeff E (≈ ln 2). Data @Helium 0x88e050; loaded @0x3a3a7f. p[0x2f8]&p[0x2e8]. */
export const HgcST2084_EOTF_EXP2_COEF_E = 0.6931475400924683 as const;

/** (127, 127, 127, 0) as INT bit-pattern (four 32-bit `0x7f`s). Data @Helium 0x88df70;
 *  loaded @0x3a3a96. p[0x318]&p[0x308]. Used as an integer 4x32 vector for `paddd`-style
 *  exponent-shift-in during exp2 re-encoding. */
export const HgcST2084_EOTF_CONST_INT_127_3_0_BITS: readonly [number, number, number, number] =
  [0x7f, 0x7f, 0x7f, 0] as const;

/** (1.0002442598342896)×4 — Newton-Raphson rsqrt refinement scale (=1+2^-12 approx).
 *  Data @Helium 0x85fed0; loaded @0x3a3aad. p[0x338]&p[0x328]. */
export const HgcST2084_EOTF_CONST_RSQRTNR_SCALE = 1.0002442598342896 as const;

/** (FLT_MAX, FLT_MAX, FLT_MAX, 0). Data @Helium 0x88e1d0; loaded @0x3a3ac4. p[0x358]&p[0x348]. */
export const HgcST2084_EOTF_CONST_FLT_MAX3_0: readonly [number, number, number, number] =
  [3.4028234663852886e38, 3.4028234663852886e38, 3.4028234663852886e38, 0.0] as const;

/** (-FLT_MAX, -FLT_MAX, -FLT_MAX, 0). Data @Helium 0x88ec20; loaded @0x3a3adb. p[0x378]&p[0x368]. */
export const HgcST2084_EOTF_CONST_NEG_FLT_MAX3_0: readonly [number, number, number, number] =
  [-3.4028234663852886e38, -3.4028234663852886e38, -3.4028234663852886e38, 0.0] as const;

/** (2, 2, 2, 0). Data @Helium 0x88df90; loaded @0x3a3af2. p[0x398]&p[0x388]. */
export const HgcST2084_EOTF_CONST_TWO3_0: readonly [number, number, number, number] =
  [2.0, 2.0, 2.0, 0.0] as const;

/** (NaN, NaN, NaN, 0). Data @Helium 0x88c7f0; loaded @0x3a3b09. p[0x3b8]&p[0x3a8]. */
export const HgcST2084_EOTF_CONST_NAN3_0: readonly [number, number, number, number] =
  [Number.NaN, Number.NaN, Number.NaN, 0.0] as const;

/** (0, 0, 0, NaN) — an alpha-preservation blend mask. Data @Helium 0x85fc40; loaded @0x3a3b20.
 *  p[0x3d8]&p[0x3c8]. */
export const HgcST2084_EOTF_CONST_MASK_0003_NAN: readonly [number, number, number, number] =
  [0.0, 0.0, 0.0, Number.NaN] as const;

// ---------------------------------------------------------------------------
// Metal shader source strings — transcribed verbatim.
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::GetProgram` fragment shader source — the full function body.
 * @Helium 0x3a2428 (leaq disp32(%rip)); RIP-after 0x3a242f + 0x637b34 = 0x9daf63.
 * Returned when `HGRenderer::GetTarget(0x60000) == 0x60b10` else null.
 *
 * The shader is the SMPTE ST.2084 EOTF (PQ decode) applied per RGB channel:
 *   E' = clamp(E,0,1);
 *   E'' = pow(E', m2^-1)    // hg_Params[0].y = 1/m2
 *   num = max(E'' - c1, 0)  // hg_Params[1].x = c1
 *   den = c2 - c3*E''       // hg_Params[1].z = -c3;  hg_Params[1].y = c2
 *   Y = pow(num/den, m1^-1) // hg_Params[0].x = 1/m1
 *   out = Y * scale         // hg_Params[1].w = scale (typically 10000 nits normalization)
 * The four constants (c1,c2,c3) and (m1,m2) are the standard PQ EOTF
 * inverse-quantizer parameters (ITU-R BT.2100 Table 4).
 */
export const HgcST2084_EOTF_FRAGMENT_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=00000003ce\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r0.xyz = clamp(r0.xyz, 0.00000f, 1.00000f);\n" +
  "    r0.xyz = pow(r0.xyz, hg_Params[0].yyy);\n" +
  "    r1.xyz = r0.xyz - hg_Params[1].xxx;\n" +
  "    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].yyy;\n" +
  "    r1.xyz = fmax(r1.xyz, c0.xxx);\n" +
  "    r0.xyz = r1.xyz/r0.xyz;\n" +
  "    r0.xyz = pow(r0.xyz, hg_Params[0].xxx);\n" +
  "    output.color0.xyz = r0.xyz*hg_Params[1].www;\n" +
  "    output.color0.w = r0.w;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=dfda7509:99458374:6e062eb7:63abe617\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:0002:0002:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * `HgcST2084_EOTF::InitProgramDescriptor` visible-shader source (LEN=00000002a6).
 * @Helium 0x3a2458 (leaq disp32(%rip)); RIP-after 0x3a245f + 0x637f13 = 0x9dad72.
 */
export const HgcST2084_EOTF_VISIBLE_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=00000002a6\n" +
  "[[ visible ]] FragmentOut HgcST2084_EOTF_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0)\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = color0;\n" +
  "    r0.xyz = clamp(r0.xyz, 0.00000f, 1.00000f);\n" +
  "    r0.xyz = pow(r0.xyz, hg_Params[0].yyy);\n" +
  "    r1.xyz = r0.xyz - hg_Params[1].xxx;\n" +
  "    r0.xyz = r0.xyz*hg_Params[1].zzz + hg_Params[1].yyy;\n" +
  "    r1.xyz = fmax(r1.xyz, c0.xxx);\n" +
  "    r0.xyz = r1.xyz/r0.xyz;\n" +
  "    r0.xyz = pow(r0.xyz, hg_Params[0].xxx);\n" +
  "    output.color0.xyz = r0.xyz*hg_Params[1].www;\n" +
  "    output.color0.w = r0.w;\n" +
  "    return output;\n" +
  "}\n";

/** Visible fragment-function symbol string (26 chars). @Helium 0x3a2451. */
export const HgcST2084_EOTF_VISIBLE_FRAGMENT_FUNC_SYM = "HgcST2084_EOTF_hgc_visible" as const;

/** Fragment function name (14 chars). @Helium 0x3a2467. */
export const HgcST2084_EOTF_FRAGMENT_FUNC_NAME = "HgcST2084_EOTF" as const;

/**
 * `shaderDescription()` returns C++ string "HgcST2084_EOTF [hgc1]" (21 chars).
 * Short-SSO: tag byte 0x2a = (size<<1) = (21<<1)=42=0x2a  (@0x3a2667 movb $0x2a).
 * Body assembled by movabsq of last 8 bytes at offset+0xe and 16-byte movups of
 * first 16 chars at offset+1 (@0x3a266a, 0x3a2678).
 */
export const HgcST2084_EOTF_SHADER_DESCRIPTION = "HgcST2084_EOTF [hgc1]" as const;

// ---------------------------------------------------------------------------
// InitProgramDescriptor binding metadata addresses.
// ---------------------------------------------------------------------------

/** Return-binding tail blob (@0x3a24a3 movaps disp32(%rip)); RIP-after 0x3a24aa + 0x28be6 = 0x3cb090. */
export const HgcST2084_EOTF_INIT_PD_RETURN_BINDING_TAIL_ADDR = 0x3cb090 as const;
/** Arg-binding[0] tail blob (@0x3a24fa); RIP-after 0x3a2501 + 0x4ea2cf = 0x88c7d0. */
export const HgcST2084_EOTF_INIT_PD_ARG0_BINDING_TAIL_ADDR = 0x88c7d0 as const;
/** Arg-binding[1] tail blob (@0x3a2545); RIP-after 0x3a254c + 0x28b44 = 0x3cb090. */
export const HgcST2084_EOTF_INIT_PD_ARG1_BINDING_TAIL_ADDR = 0x3cb090 as const;

// ---------------------------------------------------------------------------
// Runtime state
// ---------------------------------------------------------------------------

/**
 * HgcST2084_EOTF instance state.
 * HGNode base (+0x00..+0x197) is opaque here — see raw-port/src/render/HGNode.ts
 * once it's ported.
 */
export interface HgcST2084_EOTFState {
  /** HGNode base placeholder (+0x00..+0x197). */
  _hgNode: unknown;
  /** +0x10 int flags — RMW at ctor: flags = (flags & ~0x600) | 0x400  (@0x3a3b3e..0x3a3b4b). */
  _nodeFlags10: number;
  /**
   * +0x198 pointer — 32-byte-aligned scratch buffer set by ctor (@0x3a3b37).
   * Modeled as a Float32Array in TS; alignment is a no-op for us.
   */
  scratch: Float32Array | null;
  /** Raw buffer that owns `scratch`. GC releases it when nulled by dtor. */
  _scratchRaw: ArrayBuffer | null;
}

/** HGBinding shape used by InitProgramDescriptor. */
interface HGBinding {
  kind: number;
  name: string;
  tail: number; // address of the 16-byte tail blob in Helium __const
}

// ---------------------------------------------------------------------------
// Ctor / dtor
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::HgcST2084_EOTF()` C1 thunk @Helium 0x3a3b70.
 *   pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp __ZN14HgcST2084_EOTFC2Ev.
 */
export function HgcST2084_EOTF_ctor_C1(): HgcST2084_EOTFState {
  return HgcST2084_EOTF_ctor_C2();
}

/**
 * `HgcST2084_EOTF::HgcST2084_EOTF()` C2 (full body) @Helium 0x3a3870.
 *
 * Compressed verbatim:
 *   0x3a387a  callq HGNode::HGNode()                       [base subobject ctor]
 *   0x3a387f  leaq  0x6afb2a(%rip),%rax  ## = 0xa533b0    [vptr install]
 *   0x3a3886  movq  %rax,(%rbx)
 *   0x3a3889  movl  $0x3e7,%edi
 *   0x3a388e  callq __Znam                                 [operator new[](999 bytes)]
 *   0x3a3893..0x3a38a4  align to 32 bytes; store raw at *(p-8).
 *   0x3a38a8..0x3a38ba  zero p[0x08..0x40)                 (params + reserved zone)
 *   0x3a38bf..0x3a3b2f  28 x load-splat-store to p[0x48..0x3b8]
 *                       (each constant written to two adjacent 16-byte cells).
 *   0x3a3b37  movq  %rdx,0x198(%rbx)                       [store aligned p at this+0x198]
 *   0x3a3b3e..0x3a3b4b  flags = (flags & ~0x600) | 0x400   [RMW on this+0x10]
 *
 * Exception path @0x3a3b53..0x3a3b61: on new[] throw, call HGNode::~HGNode() +
 * __Unwind_Resume.
 */
export function HgcST2084_EOTF_ctor_C2(): HgcST2084_EOTFState {
  HGNode_HGNode__stub(); // @0x3a387a

  // operator new[](0x3e7) @0x3a388e — 999 bytes raw.
  const raw = new ArrayBuffer(HgcST2084_EOTF_SCRATCH_ALLOC_BYTES);
  // Alignment idiom (@0x3a3893..0x3a38a4): p = raw + 8 + ((-raw - 8) & 31); store raw at *(p-8).
  // In TS the ArrayBuffer origin is 4-byte-aligned by construction and we model the aligned
  // pointer as the base of a Float32Array — the alignment slack is a no-op.

  // Scratch reaches p[0x3d8+16) = 0x3e8 bytes; alloc is 0x3e7 with 8-byte header slack (raw
  // pointer stored at *(p-8)). We size the Float32Array to cover 0x3e0 bytes = 0xf8 floats.
  const scratch = new Float32Array(0x3e0 >>> 2); // 248 floats = 0x3e0 bytes

  // p[0..0x40) is zeroed by ctor (@0x3a38a8..0x3a38ba); Float32Array default-init is 0.

  const setF4 = (byteOff: number, v: readonly [number, number, number, number]): void => {
    const i = byteOff >>> 2;
    scratch[i + 0] = Math.fround(v[0]);
    scratch[i + 1] = Math.fround(v[1]);
    scratch[i + 2] = Math.fround(v[2]);
    scratch[i + 3] = Math.fround(v[3]);
  };
  const setF4Splat = (byteOff: number, x: number): void => {
    const xf = Math.fround(x);
    setF4(byteOff, [xf, xf, xf, xf]);
  };
  const setF4Ints = (
    byteOff: number, v: readonly [number, number, number, number],
  ): void => {
    // Reinterpret 32-bit int lanes as float bit-pattern (bit-cast).
    const buf = new ArrayBuffer(16);
    const u = new Uint32Array(buf);
    u[0] = v[0]; u[1] = v[1]; u[2] = v[2]; u[3] = v[3];
    const f = new Float32Array(buf);
    const i = byteOff >>> 2;
    scratch[i + 0] = f[0]; scratch[i + 1] = f[1];
    scratch[i + 2] = f[2]; scratch[i + 3] = f[3];
  };

  // Constants — written to two adjacent 16-byte cells. Order/offsets from the store list.
  // 0x48/0x58 — ZERO3_NEG_INF @0x3a38bf..0x3a38cb.
  setF4(0x48, HgcST2084_EOTF_CONST_ZERO3_NEG_INF);
  setF4(0x58, HgcST2084_EOTF_CONST_ZERO3_NEG_INF);
  // 0x68/0x78 — ONE3_POS_INF @0x3a38d0..0x3a38dc.
  setF4(0x68, HgcST2084_EOTF_CONST_ONE3_POS_INF);
  setF4(0x78, HgcST2084_EOTF_CONST_ONE3_POS_INF);
  // 0x88/0x98 — NEG_FLT_MIN3_0 @0x3a38e1..0x3a38f0.
  setF4(0x88, HgcST2084_EOTF_CONST_NEG_FLT_MIN3_0);
  setF4(0x98, HgcST2084_EOTF_CONST_NEG_FLT_MIN3_0);
  // 0xa8/0xb8 — FLT_MIN3_0 @0x3a38f8..0x3a3907.
  setF4(0xa8, HgcST2084_EOTF_CONST_FLT_MIN3_0);
  setF4(0xb8, HgcST2084_EOTF_CONST_FLT_MIN3_0);
  // 0xc8/0xd8 — INF3_0 @0x3a390f..0x3a391e.
  setF4(0xc8, HgcST2084_EOTF_CONST_INF3_0);
  setF4(0xd8, HgcST2084_EOTF_CONST_INF3_0);
  // 0xe8/0xf8 — 127_3_0 @0x3a3926..0x3a3935.
  setF4(0xe8, HgcST2084_EOTF_CONST_127_3_0);
  setF4(0xf8, HgcST2084_EOTF_CONST_127_3_0);
  // 0x108/0x118 — SQRT2_3_0 @0x3a393d..0x3a394c.
  setF4(0x108, HgcST2084_EOTF_CONST_SQRT2_3_0);
  setF4(0x118, HgcST2084_EOTF_CONST_SQRT2_3_0);
  // 0x128/0x138 — HALF3_0 @0x3a3954..0x3a3963.
  setF4(0x128, HgcST2084_EOTF_CONST_HALF3_0);
  setF4(0x138, HgcST2084_EOTF_CONST_HALF3_0);
  // 0x148/0x158 — LOG2_COEF_A @0x3a396b..0x3a397a.
  setF4Splat(0x148, HgcST2084_EOTF_LOG2_COEF_A);
  setF4Splat(0x158, HgcST2084_EOTF_LOG2_COEF_A);
  // 0x168/0x178 — LOG2_COEF_B @0x3a3982..0x3a3991.
  setF4Splat(0x168, HgcST2084_EOTF_LOG2_COEF_B);
  setF4Splat(0x178, HgcST2084_EOTF_LOG2_COEF_B);
  // 0x188/0x198 — LOG2_COEF_C @0x3a3999..0x3a39a8.
  setF4Splat(0x188, HgcST2084_EOTF_LOG2_COEF_C);
  setF4Splat(0x198, HgcST2084_EOTF_LOG2_COEF_C);
  // 0x1a8/0x1b8 — LOG2_COEF_D @0x3a39b0..0x3a39bf.
  setF4Splat(0x1a8, HgcST2084_EOTF_LOG2_COEF_D);
  setF4Splat(0x1b8, HgcST2084_EOTF_LOG2_COEF_D);
  // 0x1c8/0x1d8 — LOG2_COEF_E @0x3a39c7..0x3a39d6.
  setF4Splat(0x1c8, HgcST2084_EOTF_LOG2_COEF_E);
  setF4Splat(0x1d8, HgcST2084_EOTF_LOG2_COEF_E);
  // 0x1e8/0x1f8 — LOG2_COEF_F @0x3a39de..0x3a39ed.
  setF4Splat(0x1e8, HgcST2084_EOTF_LOG2_COEF_F);
  setF4Splat(0x1f8, HgcST2084_EOTF_LOG2_COEF_F);
  // 0x208/0x218 — LOG2_COEF_G @0x3a39f5..0x3a3a04.
  setF4Splat(0x208, HgcST2084_EOTF_LOG2_COEF_G);
  setF4Splat(0x218, HgcST2084_EOTF_LOG2_COEF_G);
  // 0x228/0x238 — NEG_127_3_0 @0x3a3a0c..0x3a3a1b.
  setF4(0x228, HgcST2084_EOTF_CONST_NEG_127_3_0);
  setF4(0x238, HgcST2084_EOTF_CONST_NEG_127_3_0);
  // 0x248/0x258 — EXP2_COEF_A @0x3a3a23..0x3a3a32.
  setF4Splat(0x248, HgcST2084_EOTF_EXP2_COEF_A);
  setF4Splat(0x258, HgcST2084_EOTF_EXP2_COEF_A);
  // 0x268/0x278 — EXP2_COEF_B @0x3a3a3a..0x3a3a49.
  setF4Splat(0x268, HgcST2084_EOTF_EXP2_COEF_B);
  setF4Splat(0x278, HgcST2084_EOTF_EXP2_COEF_B);
  // 0x288/0x298 — EXP2_COEF_C @0x3a3a51..0x3a3a60.
  setF4Splat(0x288, HgcST2084_EOTF_EXP2_COEF_C);
  setF4Splat(0x298, HgcST2084_EOTF_EXP2_COEF_C);
  // 0x2a8/0x2b8 — EXP2_COEF_D @0x3a3a68..0x3a3a77.
  setF4Splat(0x2a8, HgcST2084_EOTF_EXP2_COEF_D);
  setF4Splat(0x2b8, HgcST2084_EOTF_EXP2_COEF_D);
  // 0x2c8/0x2d8 — EXP2_COEF_E @0x3a3a7f..0x3a3a8e.
  setF4Splat(0x2c8, HgcST2084_EOTF_EXP2_COEF_E);
  setF4Splat(0x2d8, HgcST2084_EOTF_EXP2_COEF_E);
  // 0x2e8/0x2f8 — INT_127_3_0_BITS @0x3a3a96..0x3a3aa5.
  setF4Ints(0x2e8, HgcST2084_EOTF_CONST_INT_127_3_0_BITS);
  setF4Ints(0x2f8, HgcST2084_EOTF_CONST_INT_127_3_0_BITS);
  // 0x308/0x318 — RSQRTNR_SCALE @0x3a3aad..0x3a3abc.
  setF4Splat(0x308, HgcST2084_EOTF_CONST_RSQRTNR_SCALE);
  setF4Splat(0x318, HgcST2084_EOTF_CONST_RSQRTNR_SCALE);
  // 0x328/0x338 — FLT_MAX3_0 @0x3a3ac4..0x3a3ad3.
  setF4(0x328, HgcST2084_EOTF_CONST_FLT_MAX3_0);
  setF4(0x338, HgcST2084_EOTF_CONST_FLT_MAX3_0);
  // 0x348/0x358 — NEG_FLT_MAX3_0 @0x3a3adb..0x3a3aea.
  setF4(0x348, HgcST2084_EOTF_CONST_NEG_FLT_MAX3_0);
  setF4(0x358, HgcST2084_EOTF_CONST_NEG_FLT_MAX3_0);
  // 0x368/0x378 — TWO3_0 @0x3a3af2..0x3a3b01.
  setF4(0x368, HgcST2084_EOTF_CONST_TWO3_0);
  setF4(0x378, HgcST2084_EOTF_CONST_TWO3_0);
  // 0x388/0x398 — NAN3_0 @0x3a3b09..0x3a3b18.
  setF4(0x388, HgcST2084_EOTF_CONST_NAN3_0);
  setF4(0x398, HgcST2084_EOTF_CONST_NAN3_0);
  // 0x3a8/0x3b8 — MASK_0003_NAN @0x3a3b20..0x3a3b2f.
  setF4(0x3a8, HgcST2084_EOTF_CONST_MASK_0003_NAN);
  setF4(0x3b8, HgcST2084_EOTF_CONST_MASK_0003_NAN);

  // flags RMW @0x3a3b3e..0x3a3b4b: flags = (flags & ~0x600) | 0x400.
  const nodeFlags10 = (0 & ~0x600) | 0x400;

  return { _hgNode: null, _nodeFlags10: nodeFlags10, scratch, _scratchRaw: raw };
}

/**
 * `HgcST2084_EOTF::~HgcST2084_EOTF()` D2 @Helium 0x3a3b80:
 *   reset vptr to 0xa533b0; if scratch != null && *(scratch-8) != null: free raw;
 *   tail-jmp HGNode::~HGNode().
 */
export function HgcST2084_EOTF_dtor_D2(state: HgcST2084_EOTFState): void {
  // Vtable reset (@0x3a3b80..0x3a3b87) — no explicit vptr slot in TS state.
  if (state._scratchRaw !== null) {
    // Free raw allocation (@0x3a3bb3 callq __ZdlPv).
    state._scratchRaw = null;
    state.scratch = null;
  }
  HGNode_dtor_D2__stub(); // @0x3a3bc1 tail-jmp
}

/** D1 has the same body as D2. @Helium 0x3a3bd0. */
export function HgcST2084_EOTF_dtor_D1(state: HgcST2084_EOTFState): void {
  HgcST2084_EOTF_dtor_D2(state);
}

/**
 * D0 (deleting dtor) @Helium 0x3a3c20. Body = D2 body + tail-jmp
 * `HGObject::operator delete(this)` (@0x3a3c5e).
 */
export function HgcST2084_EOTF_dtor_D0(state: HgcST2084_EOTFState): void {
  HgcST2084_EOTF_dtor_D2(state);
  HGObject_operator_delete__stub(); // @0x3a3c5e
}

// ---------------------------------------------------------------------------
// GetProgram / shaderDescription
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::GetProgram(HGRenderer* r)` @Helium 0x3a2410.
 *
 * Verbatim:
 *   0x3a2414  movq  %rsi,%rdi
 *   0x3a2417  movl  $0x60000,%esi
 *   0x3a241c  callq HGRenderer::GetTarget      [uint kind -> uint target]
 *   0x3a2421  xorl  %ecx,%ecx
 *   0x3a2423  cmpl  $0x60b10,%eax
 *   0x3a2428  leaq  disp32(%rip),%rax          [-> shader-source string]
 *   0x3a242f  cmoveq %rax,%rcx
 *   0x3a2433  movq  %rcx,%rax; retq
 *
 * Returns FRAGMENT_SHADER_SRC when the renderer's target-for-kind(0x60000)
 * equals 0x60b10; otherwise null.
 */
export function HgcST2084_EOTF_GetProgram(renderer: unknown): string | null {
  const target = HGRenderer_GetTarget__stub(renderer, 0x60000);
  return target === 0x60b10 ? HgcST2084_EOTF_FRAGMENT_SHADER_SRC : null;
}

/**
 * `HgcST2084_EOTF::shaderDescription() const` @Helium 0x3a2660.
 *
 * Verbatim:
 *   0x3a2667  movb    $0x2a,(%rdi)              [SSO tag = 21<<1 = 0x2a — SHORT string, size=21]
 *   0x3a266a  movabsq $0x5d316367685b2046,%rcx  [bytes "F [hgc1]"]
 *   0x3a2674  movq    %rcx,0xe(%rdi)            [tail-bytes at offset 14]
 *   0x3a2678  movups  0x637cdd(%rip),%xmm0      [first 16 chars "HgcST2084_EOTF ["]
 *   0x3a267f  movups  %xmm0,0x1(%rdi)           [store at offset 1]
 *   0x3a2683  movb    $0x0,0x16(%rdi)           [null-terminator at offset 22]
 *
 * Returns "HgcST2084_EOTF [hgc1]".
 */
export function HgcST2084_EOTF_shaderDescription(): string {
  return HgcST2084_EOTF_SHADER_DESCRIPTION;
}

// ---------------------------------------------------------------------------
// InitProgramDescriptor
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::InitProgramDescriptor(HGProgramDescriptor* pd) const`
 * @Helium 0x3a2440.
 *
 * Populates the Metal program descriptor with:
 *   (1) SetVisibleShaderWithSource("HgcST2084_EOTF_hgc_visible", VISIBLE_SHADER_SRC)
 *       @0x3a2462.
 *   (2) SetFragmentFunctionName("HgcST2084_EOTF") @0x3a2471.
 *   (3) SetReturnBinding(HGBinding{kind=4, name="FragmentOut", tail=@0x3cb090})
 *       @0x3a24b8. The name is assembled by a movabsq + movl overlap-write
 *       pattern (@0x3a2487..0x3a24a3).
 *   (4) argVec.emplace_back(HGBinding{kind=2, name="float4", tail=@0x88c7d0}) @0x3a250d.
 *   (5) argVec.emplace_back(HGBinding{kind=10, name="float4", tail=@0x3cb090}) @0x3a2597
 *       (or inline-append @0x3a2556 if capacity available).
 *   (6) SetArgumentBindings(&argVec) @0x3a25b6.
 *
 * The kind values (4/2/10 = 0xa) correspond to HGBinding-kind enum values that
 * are opaque outside this file.
 */
export function HgcST2084_EOTF_InitProgramDescriptor(pd: unknown): void {
  // (1)
  HGProgramDescriptor_SetVisibleShaderWithSource__stub(
    pd,
    HgcST2084_EOTF_VISIBLE_FRAGMENT_FUNC_SYM,
    HgcST2084_EOTF_VISIBLE_SHADER_SRC,
  );
  // (2)
  HGProgramDescriptor_SetFragmentFunctionName__stub(pd, HgcST2084_EOTF_FRAGMENT_FUNC_NAME);
  // (3)
  HGProgramDescriptor_SetReturnBinding__stub(pd, {
    kind: 4,
    name: "FragmentOut",
    tail: HgcST2084_EOTF_INIT_PD_RETURN_BINDING_TAIL_ADDR,
  });
  // (4)+(5)+(6)
  const argVec: HGBinding[] = [];
  HGBindingVector_emplace_back__stub(argVec, {
    kind: 0x2, name: "float4", tail: HgcST2084_EOTF_INIT_PD_ARG0_BINDING_TAIL_ADDR,
  });
  HGBindingVector_emplace_back__stub(argVec, {
    kind: 0xa, name: "float4", tail: HgcST2084_EOTF_INIT_PD_ARG1_BINDING_TAIL_ADDR,
  });
  HGProgramDescriptor_SetArgumentBindings__stub(pd, argVec);
}

// ---------------------------------------------------------------------------
// Bind / BindTexture
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::Bind(HGHandler* h)` @Helium 0x3a2700.
 *
 * Verbatim:
 *   0x3a270d  movq  0x198(%rdi),%rdx           [rdx = scratch]
 *   0x3a2714  movq  (%rsi),%rax                [vtable of h]
 *   0x3a2717  movq  %rsi,%rdi                  [self = h]
 *   0x3a271a  xorl  %esi,%esi                  [arg1 = 0]
 *   0x3a271c  movl  $0x1,%ecx                  [arg3 = 1]
 *   0x3a2721  callq *0x90(%rax)                [h->vtable[0x90](h, 0, scratch, 1)]
 *
 *   0x3a2727  movq  0x198(%r14),%rdx
 *   0x3a272e  addq  $0x20,%rdx                 [rdx = scratch + 0x20 (&params[1])]
 *   0x3a2732  movq  (%rbx),%rax
 *   0x3a2735..0x3a2742  h->vtable[0x90](h, 1, &params[1], 1)
 *
 *   0x3a2748..0x3a2751  this->vtable[0xc0](this, h)
 *   0x3a2757  xorl %eax,%eax; retq             [return 0]
 */
export function HgcST2084_EOTF_Bind(state: HgcST2084_EOTFState, h: unknown): number {
  if (state.scratch === null) {
    throw new Error("HgcST2084_EOTF::Bind @0x3a2700 called before ctor initialized scratch");
  }
  HGHandler_vtable0x90__stub(h, 0, state.scratch.subarray(0x00 >>> 2, 0x20 >>> 2), 1);
  HGHandler_vtable0x90__stub(h, 1, state.scratch.subarray(0x20 >>> 2, 0x40 >>> 2), 1);
  HgcST2084_EOTF_vtable0xc0__stub(state, h);
  return 0;
}

/**
 * `HgcST2084_EOTF::BindTexture(HGHandler* h, int idx)` @Helium 0x3a2690.
 *
 * Verbatim:
 *   0x3a2697  movl  $0xffffffff,%ebx             [ret = -1]
 *   0x3a269c  testl %edx,%edx; jne end           [if idx!=0 -> return -1]
 *   0x3a26a3  movq  (%rsi),%rax
 *   0x3a26a6  xorl  %ebx,%ebx                    [ret = 0]
 *   0x3a26a8..0x3a26af  h->vtable[0x48](h, 0, 0)
 *   0x3a26b2..0x3a26bc  h->vtable[0x30](h, 0, 0)
 *   0x3a26bf..0x3a26cb  HGHandler::TexCoord(h, 0, 0, 0, nullptr)
 *   0x3a26d0..0x3a26df  sub = h->field+0x90; sub->vtable[0x80](sub, 0x2e)
 *   0x3a26e5  testl %eax,%eax; jne end            [if rc!=0 -> return -1]
 *   0x3a26e9..0x3a26ef  h->vtable[0xa8](h)
 *   0x3a26f5  movl %ebx,%eax; retq
 */
export function HgcST2084_EOTF_BindTexture(
  _state: HgcST2084_EOTFState, h: unknown, idx: number,
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
// GetDOD / GetROI / GetOutput
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::GetDOD(HGRenderer*, int inputIdx, HGRect r)` @Helium 0x3a3830.
 *
 * Verbatim:
 *   0x3a3833  testl %edx,%edx; je pass          [if inputIdx == 0 -> return r]
 *   0x3a383b  leaq  _HGRectNull(%rip),%rcx      [else -> HGRectNull]
 *   0x3a3842  movq  (%rcx),%rax
 *   0x3a3845  movq  0x8(%rcx),%r8
 *   0x3a384a  movq  %r8,%rdx; retq
 */
export function HgcST2084_EOTF_GetDOD(
  _renderer: unknown, inputIdx: number, r: HGRect,
): HGRect {
  return inputIdx === 0 ? r : HGRectNull;
}

/** `HgcST2084_EOTF::GetROI` @Helium 0x3a3850 — verbatim identical body to GetDOD. */
export function HgcST2084_EOTF_GetROI(
  _renderer: unknown, inputIdx: number, r: HGRect,
): HGRect {
  return inputIdx === 0 ? r : HGRectNull;
}

/**
 * `HgcST2084_EOTF::GetOutput(HGRenderer*)` @Helium 0x3a3d40.
 *   0x3a3d44  movq %rdi,%rax; popq %rbp; retq
 * Returns `this` (identity output-self-reference).
 */
export function HgcST2084_EOTF_GetOutput(
  state: HgcST2084_EOTFState, _renderer: unknown,
): HgcST2084_EOTFState {
  return state;
}

// ---------------------------------------------------------------------------
// SetParameter / GetParameter
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::SetParameter(int id, float a, float b, float c, float d)`
 * @Helium 0x3a3c70.
 *
 * Verbatim:
 *   0x3a3c70  movl $0xffffffff,%eax
 *   0x3a3c75  cmpl $0x1,%esi; ja end             [if (unsigned)id > 1 -> return -1]
 *   0x3a3c7a  movq 0x198(%rdi),%rcx              [scratch]
 *   0x3a3c81..0x3a3c87  ptr = &scratch[id*0x20]
 *   0x3a3c8b..0x3a3cb9  ucomiss each lane vs a/b/c/d ordered-equal;
 *                       if all four equal (jnp taken) -> return 0
 *   0x3a3cbf..0x3a3ccb  insertps builds (a,b,c,d)
 *   0x3a3cd1  movups %xmm0, 0x10(%rax)           [write to (ptr+0x10)[0..3]]
 *   0x3a3cd5  movups %xmm0, (%rax)               [write to ptr[0..3]]
 *   0x3a3cd8  callq  HGNode::ClearBits()
 *   0x3a3cdd  movl   $0x1,%eax                   [ret = 1 (changed)]
 *
 * Returns -1 (id out of range), 0 (unchanged), or 1 (written + cache-invalidated).
 */
export function HgcST2084_EOTF_SetParameter(
  state: HgcST2084_EOTFState,
  id: number, a: number, b: number, c: number, d: number,
): number {
  const idU = id >>> 0;
  if (idU > 1) {
    return -1;
  }
  if (state.scratch === null) {
    throw new Error("HgcST2084_EOTF::SetParameter @0x3a3c70 called before ctor");
  }
  const base = (idU * 0x20) >>> 2;
  const s = state.scratch;
  const af = Math.fround(a), bf = Math.fround(b), cf = Math.fround(c), df = Math.fround(d);
  const eq0 = Math.fround(s[base + 0]) === af && !Number.isNaN(af);
  const eq1 = Math.fround(s[base + 1]) === bf && !Number.isNaN(bf);
  const eq2 = Math.fround(s[base + 2]) === cf && !Number.isNaN(cf);
  const eq3 = Math.fround(s[base + 3]) === df && !Number.isNaN(df);
  if (eq0 && eq1 && eq2 && eq3) {
    return 0;
  }
  s[base + 0] = af; s[base + 1] = bf; s[base + 2] = cf; s[base + 3] = df;
  s[base + 4] = af; s[base + 5] = bf; s[base + 6] = cf; s[base + 7] = df;
  HGNode_ClearBits__stub(state);
  return 1;
}

/**
 * `HgcST2084_EOTF::GetParameter(int id, float* out)` @Helium 0x3a3cf0.
 *
 * Verbatim:
 *   0x3a3cf0  movl $0xffffffff,%eax
 *   0x3a3cf5  cmpl $0x1,%esi; ja end              [if (unsigned)id > 1 -> return -1]
 *   0x3a3cfe  movq 0x198(%rdi),%rax               [scratch]
 *   0x3a3d05..0x3a3d07  offset = id * 0x20
 *   0x3a3d0b..0x3a3d35  copy 4 floats scratch[base..+3] -> out[0..3]
 *   0x3a3d35  xorl %eax,%eax                       [ret = 0]
 *
 * Returns 0 on success, -1 if id > 1.
 */
export function HgcST2084_EOTF_GetParameter(
  state: HgcST2084_EOTFState, id: number, out: Float32Array,
): number {
  const idU = id >>> 0;
  if (idU > 1) {
    return -1;
  }
  if (state.scratch === null) {
    throw new Error("HgcST2084_EOTF::GetParameter @0x3a3cf0 called before ctor");
  }
  const base = (idU * 0x20) >>> 2;
  const s = state.scratch;
  out[0] = s[base + 0]; out[1] = s[base + 1];
  out[2] = s[base + 2]; out[3] = s[base + 3];
  return 0;
}

// ---------------------------------------------------------------------------
// RenderTile (dispatcher + SSE body) — LARGE, NOT YET TRANSCRIBED
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_EOTF::RenderTile(HGTile* tile)` @Helium 0x3a2fa0.
 *
 * 487-line SSE software rasterizer for the ST.2084 EOTF (PQ decode). Uses the
 * scratch constants written by the ctor at p[0x60..0x3c0]: rsqrt Newton-Raphson
 * (RSQRTNR_SCALE), exponent extraction via `psrld $0x17`, and the log2+exp2
 * polynomial pair (LOG2_COEF_A..G, EXP2_COEF_A..E) to implement pow(x, k) as
 * exp2(k * log2(x)). Dispatch: on `HGRenderer::GetTarget(HGTile::Renderer(tile), 0)
 * >= 0x4700000` tail-call RenderTile_AVX; else two SSE inner loops gated by
 * `target <= 0x44fffff`.
 *
 * FRONTIER — not yet transcribed. Requires bit-exact SSE port with the parity
 * harness — deferred to keep the decode-before-implement discipline honest.
 */
export function HgcST2084_EOTF_RenderTile(
  _state: HgcST2084_EOTFState, _tile: unknown,
): number {
  throw new Error(
    "HgcST2084_EOTF::RenderTile @Helium 0x3a2fa0 not yet transcribed — 487-line SSE software rasterizer (ST.2084 PQ EOTF)",
  );
}

/**
 * `HgcST2084_EOTF::RenderTile_AVX(HGTile* tile)` @Helium 0x3a2760.
 *
 * 404-line AVX2 (256-bit / 8-lane) variant of RenderTile. Same math as
 * RenderTile SSE; will port jointly with the SSE body.
 */
export function HgcST2084_EOTF_RenderTile_AVX(
  _state: HgcST2084_EOTFState, _tile: unknown,
): number {
  throw new Error(
    "HgcST2084_EOTF::RenderTile_AVX @Helium 0x3a2760 not yet transcribed — 404-line AVX2 variant of RenderTile (ST.2084 PQ EOTF)",
  );
}

// ---------------------------------------------------------------------------
// Frontier callee stubs — throw with @0xADDR provenance on the SAME line.
// ---------------------------------------------------------------------------

function HGNode_HGNode__stub(): void {
  throw new Error("HGNode::HGNode() @Helium (call-site 0x3a387a) not yet transcribed");
}
function HGNode_dtor_D2__stub(): void {
  throw new Error("HGNode::~HGNode() @Helium (call-site 0x3a3bc1) not yet transcribed");
}
function HGNode_ClearBits__stub(_state: HgcST2084_EOTFState): void {
  throw new Error("HGNode::ClearBits() @Helium (call-site 0x3a3cd8) not yet transcribed");
}
function HGObject_operator_delete__stub(): void {
  throw new Error("HGObject::operator delete(void*) @Helium (call-site 0x3a3c5e) not yet transcribed");
}
function HGRenderer_GetTarget__stub(_r: unknown, _kind: number): number {
  throw new Error("HGRenderer::GetTarget @Helium (call-site 0x3a241c) not yet transcribed");
}
function HGHandler_vtable0x30__stub(_h: unknown, _a: number, _b: number): void {
  throw new Error("HGHandler::<vtable+0x30> @Helium (call-site 0x3a26bc) not yet transcribed");
}
function HGHandler_vtable0x48__stub(_h: unknown, _a: number, _b: number): void {
  throw new Error("HGHandler::<vtable+0x48> @Helium (call-site 0x3a26af) not yet transcribed");
}
function HGHandler_TexCoord__stub(
  _h: unknown, _a: number, _b: number, _c: number, _p: Float64Array | null,
): void {
  throw new Error("HGHandler::TexCoord @Helium (call-site 0x3a26cb) not yet transcribed");
}
function HGHandler_field0x90__stub(_h: unknown): unknown {
  throw new Error("HGHandler::<field+0x90> load @Helium (call-site 0x3a26d0) not yet transcribed");
}
function HGHandlerSub_vtable0x80__stub(_sub: unknown, _arg: number): number {
  throw new Error("HGHandlerSub::<vtable+0x80> @Helium (call-site 0x3a26df) not yet transcribed");
}
function HGHandler_vtable0x90__stub(
  _h: unknown, _slot: number, _buf: Float32Array, _count: number,
): void {
  throw new Error("HGHandler::<vtable+0x90> @Helium (call-site 0x3a2721) not yet transcribed");
}
function HGHandler_vtable0xa8__stub(_h: unknown): void {
  throw new Error("HGHandler::<vtable+0xa8> @Helium (call-site 0x3a26ef) not yet transcribed");
}
function HgcST2084_EOTF_vtable0xc0__stub(
  _state: HgcST2084_EOTFState, _h: unknown,
): void {
  throw new Error("HgcST2084_EOTF::<vtable+0xc0> @Helium (call-site 0x3a2751) not yet transcribed");
}
function HGProgramDescriptor_SetVisibleShaderWithSource__stub(
  _pd: unknown, _sym: string, _src: string,
): void {
  throw new Error(
    "HGProgramDescriptor::SetVisibleShaderWithSource @Helium (call-site 0x3a2462) not yet transcribed",
  );
}
function HGProgramDescriptor_SetFragmentFunctionName__stub(_pd: unknown, _name: string): void {
  throw new Error(
    "HGProgramDescriptor::SetFragmentFunctionName @Helium (call-site 0x3a2471) not yet transcribed",
  );
}
function HGProgramDescriptor_SetReturnBinding__stub(_pd: unknown, _b: HGBinding): void {
  throw new Error(
    "HGProgramDescriptor::SetReturnBinding @Helium (call-site 0x3a24b8) not yet transcribed",
  );
}
function HGProgramDescriptor_SetArgumentBindings__stub(_pd: unknown, _v: HGBinding[]): void {
  throw new Error(
    "HGProgramDescriptor::SetArgumentBindings @Helium (call-site 0x3a25b6) not yet transcribed",
  );
}
/** std::vector<HGBinding>::__emplace_back_slow_path — modeled as push_back
 *  (C++ vector-growth strategy isn't observable through the semantic port). */
function HGBindingVector_emplace_back__stub(v: HGBinding[], b: HGBinding): void {
  v.push(b);
}
