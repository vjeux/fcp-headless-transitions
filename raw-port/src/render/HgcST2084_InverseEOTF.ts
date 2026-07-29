// -----------------------------------------------------------------------------
// HgcST2084_InverseEOTF — the Helium GPU-compiled ST.2084 Inverse EOTF
// (PQ / Perceptual Quantizer encode) shader node.
//
// SMPTE ST.2084 Perceptual Quantizer INVERSE, transcribed FAITHFULLY from the
// FCP Helium framework. Sibling of HgcST2084_EOTF; identical scratch layout
// and dispatch skeleton, differing only in the fragment shader math and
// L#1 constant (ONE3_0 = (1,1,1,0) here vs ONE3_POS_INF in EOTF).
//
// Uses the SAME ctor/scratch idiom as HgcBT2100_HLG_OETF and HgcST2084_EOTF.
// Only the shader source, L#1 constant, and function names differ.
//
// PROVENANCE: every function cites @Helium 0x<addr>; every constant cites the
// data-section address it was read from.
//
// SCRATCH LAYOUT: identical byte-for-byte to HgcST2084_EOTF EXCEPT slot L#1
//   p[0x68..0x88)  CONST_ONE3_0 = (1, 1, 1, 0)   (data @0x3ca9c0)
// (See HgcST2084_EOTF.ts for the full 28-constant table.)
//
// FRONTIER CALLEES (throw-stubbed at first use):
//   HGNode::HGNode()                                     @Helium (stub cite 0x3a518a)
//   HGNode::~HGNode()                                    @Helium (stub cite 0x3a54d1)
//   HGNode::ClearBits()                                  @Helium (stub cite 0x3a55e8)
//   HGObject::operator delete(void*)                     @Helium (stub cite 0x3a556e)
//   operator new[](size_t)                               @Helium (stub cite 0x3a519e)
//   operator new(size_t) (SSO body)                      @Helium (stub cite 0x3a3fae)
//   operator delete(void*)                               @Helium (stub cite 0x3a54c3)
//   HGRenderer::GetTarget(unsigned int)                  @Helium (stub cite 0x3a3d5c)
//   HGHandler::TexCoord(int,int,int,double const*)       @Helium (stub cite 0x3a3feb)
//   HGProgramDescriptor::SetVisibleShaderWithSource(...) @Helium (stub cite 0x3a3da2)
//   HGProgramDescriptor::SetFragmentFunctionName(...)    @Helium (stub cite 0x3a3db1)
//   HGProgramDescriptor::SetReturnBinding(HGBinding)     @Helium (stub cite 0x3a3df8)
//   HGProgramDescriptor::SetArgumentBindings(...)        @Helium (stub cite 0x3a3ef6)
//   std::vector<HGBinding>::__emplace_back_slow_path     @Helium (stub cite 0x3a3e4d / 0x3a3ed7)
// -----------------------------------------------------------------------------

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer for HgcST2084_InverseEOTF.
 * From C2 @Helium 0x3a518f (leaq 0x6ae472(%rip)); RIP-after = 0x3a5196;
 *   target = 0x3a5196 + 0x6ae472 = 0xa53608.
 * D2 @0x3a5490 (0x3a5497 + 0x6ae171 = 0xa53608),
 * D1 @0x3a54e0 (0x3a54e7 + 0x6ae121 = 0xa53608),
 * D0 @0x3a5539 (0x3a5540 + 0x6ae0c8 = 0xa53608).
 */
export const HgcST2084_InverseEOTF_VTABLE_INSTALLED_PTR = 0xa53608 as const;

/** Vtable symbol address (base). @Helium 0xa535f8. */
export const HgcST2084_InverseEOTF_VTABLE_SYM = 0xa535f8 as const;

/** Ctor allocation @0x3a5199 movl $0x3e7,%edi -> operator new[](999 bytes). */
export const HgcST2084_InverseEOTF_SCRATCH_ALLOC_BYTES = 0x3e7 as const;

// ---------------------------------------------------------------------------
// Ctor constants (28 float4s). Identical to HgcST2084_EOTF except L#1.
// ---------------------------------------------------------------------------

/** (0, 0, 0, -inf). Data @Helium 0x892950; loaded @0x3a51cf. p[0x58]&p[0x48]. */
export const HgcST2084_InverseEOTF_CONST_ZERO3_NEG_INF: readonly [number, number, number, number] =
  [0.0, 0.0, 0.0, Number.NEGATIVE_INFINITY] as const;
/** (1, 1, 1, 0). Data @Helium 0x3ca9c0; loaded @0x3a51e0. p[0x78]&p[0x68].
 *  DIFFERS from HgcST2084_EOTF which loaded (1,1,1,+inf) at @0x88ec10. */
export const HgcST2084_InverseEOTF_CONST_ONE3_0: readonly [number, number, number, number] =
  [1.0, 1.0, 1.0, 0.0] as const;
/** (-FLT_MIN×3, 0). Data @Helium 0x892090; loaded @0x3a51f1. p[0x98]&p[0x88]. */
export const HgcST2084_InverseEOTF_CONST_NEG_FLT_MIN3_0: readonly [number, number, number, number] =
  [-1.1754942106924411e-38, -1.1754942106924411e-38, -1.1754942106924411e-38, 0.0] as const;
/** (FLT_MIN×3, 0). Data @Helium 0x858f70; loaded @0x3a5208. p[0xb8]&p[0xa8]. */
export const HgcST2084_InverseEOTF_CONST_FLT_MIN3_0: readonly [number, number, number, number] =
  [1.1754943508222875e-38, 1.1754943508222875e-38, 1.1754943508222875e-38, 0.0] as const;
/** (+inf×3, 0). Data @Helium 0x88f440; loaded @0x3a521f. p[0xd8]&p[0xc8]. */
export const HgcST2084_InverseEOTF_CONST_INF3_0: readonly [number, number, number, number] =
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, 0.0] as const;
/** (127×3, 0). Data @Helium 0x88ded0; loaded @0x3a5236. p[0xf8]&p[0xe8]. */
export const HgcST2084_InverseEOTF_CONST_127_3_0: readonly [number, number, number, number] =
  [127.0, 127.0, 127.0, 0.0] as const;
/** (sqrt2×3, 0). Data @Helium 0x88dee0; loaded @0x3a524d. p[0x118]&p[0x108]. */
export const HgcST2084_InverseEOTF_CONST_SQRT2_3_0: readonly [number, number, number, number] =
  [1.4142135381698608, 1.4142135381698608, 1.4142135381698608, 0.0] as const;
/** (0.5×3, 0). Data @Helium 0x85da90; loaded @0x3a5264. p[0x138]&p[0x128]. */
export const HgcST2084_InverseEOTF_CONST_HALF3_0: readonly [number, number, number, number] =
  [0.5, 0.5, 0.5, 0.0] as const;

// log2(1+f) polynomial coefficients (identical to HgcST2084_EOTF).
/** log2 coeff A. Data @Helium 0x88dfa0; loaded @0x3a527b. p[0x178]&p[0x168]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_A = 0.2960891127586365 as const;
/** log2 coeff B. Data @Helium 0x88dfb0; loaded @0x3a5292. p[0x198]&p[0x188]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_B = -0.35917338728904724 as const;
/** log2 coeff C. Data @Helium 0x88dfc0; loaded @0x3a52a9. p[0x1b8]&p[0x1a8]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_C = 0.17290928959846497 as const;
/** log2 coeff D. Data @Helium 0x88dfd0; loaded @0x3a52c0. p[0x1d8]&p[0x1c8]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_D = -0.27149274945259094 as const;
/** log2 coeff E. Data @Helium 0x88dfe0; loaded @0x3a52d7. p[0x1f8]&p[0x1e8]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_E = 0.4805939197540283 as const;
/** log2 coeff F. Data @Helium 0x88dff0; loaded @0x3a52ee. p[0x218]&p[0x208]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_F = -0.7213672399520874 as const;
/** log2 leading coeff G (≈ log2(e)). Data @Helium 0x88e000; loaded @0x3a5305. p[0x238]&p[0x228]. */
export const HgcST2084_InverseEOTF_LOG2_COEF_G = 1.4426966905593872 as const;

/** (-127×3, 0). Data @Helium 0x88df30; loaded @0x3a531c. p[0x258]&p[0x248]. */
export const HgcST2084_InverseEOTF_CONST_NEG_127_3_0: readonly [number, number, number, number] =
  [-127.0, -127.0, -127.0, 0.0] as const;

// exp2 polynomial coefficients (identical to HgcST2084_EOTF).
/** exp2 coeff A. Data @Helium 0x88e010; loaded @0x3a5333. p[0x278]&p[0x268]. */
export const HgcST2084_InverseEOTF_EXP2_COEF_A = 0.0017952255439013243 as const;
/** exp2 coeff B. Data @Helium 0x88e020; loaded @0x3a534a. p[0x298]&p[0x288]. */
export const HgcST2084_InverseEOTF_EXP2_COEF_B = 0.009189177304506302 as const;
/** exp2 coeff C. Data @Helium 0x88e030; loaded @0x3a5361. p[0x2b8]&p[0x2a8]. */
export const HgcST2084_InverseEOTF_EXP2_COEF_C = 0.055661238729953766 as const;
/** exp2 coeff D. Data @Helium 0x88e040; loaded @0x3a5378. p[0x2d8]&p[0x2c8]. */
export const HgcST2084_InverseEOTF_EXP2_COEF_D = 0.2402067929506302 as const;
/** exp2 coeff E (≈ ln 2). Data @Helium 0x88e050; loaded @0x3a538f. p[0x2f8]&p[0x2e8]. */
export const HgcST2084_InverseEOTF_EXP2_COEF_E = 0.6931475400924683 as const;

/** (127×3, 0) INT bit-pattern. Data @Helium 0x88df70; loaded @0x3a53a6. p[0x318]&p[0x308]. */
export const HgcST2084_InverseEOTF_CONST_INT_127_3_0_BITS: readonly [number, number, number, number] =
  [0x7f, 0x7f, 0x7f, 0] as const;
/** (1.0002442598342896)×4 — rsqrt NR scale. Data @Helium 0x85fed0; @0x3a53bd. p[0x338]&p[0x328]. */
export const HgcST2084_InverseEOTF_CONST_RSQRTNR_SCALE = 1.0002442598342896 as const;
/** (FLT_MAX×3, 0). Data @Helium 0x88e1d0; loaded @0x3a53d4. p[0x358]&p[0x348]. */
export const HgcST2084_InverseEOTF_CONST_FLT_MAX3_0: readonly [number, number, number, number] =
  [3.4028234663852886e38, 3.4028234663852886e38, 3.4028234663852886e38, 0.0] as const;
/** (-FLT_MAX×3, 0). Data @Helium 0x88ec20; loaded @0x3a53eb. p[0x378]&p[0x368]. */
export const HgcST2084_InverseEOTF_CONST_NEG_FLT_MAX3_0: readonly [number, number, number, number] =
  [-3.4028234663852886e38, -3.4028234663852886e38, -3.4028234663852886e38, 0.0] as const;
/** (2×3, 0). Data @Helium 0x88df90; loaded @0x3a5402. p[0x398]&p[0x388]. */
export const HgcST2084_InverseEOTF_CONST_TWO3_0: readonly [number, number, number, number] =
  [2.0, 2.0, 2.0, 0.0] as const;
/** (NaN×3, 0). Data @Helium 0x88c7f0; loaded @0x3a5419. p[0x3b8]&p[0x3a8]. */
export const HgcST2084_InverseEOTF_CONST_NAN3_0: readonly [number, number, number, number] =
  [Number.NaN, Number.NaN, Number.NaN, 0.0] as const;
/** (0, 0, 0, NaN). Data @Helium 0x85fc40; loaded @0x3a5430. p[0x3d8]&p[0x3c8]. */
export const HgcST2084_InverseEOTF_CONST_MASK_0003_NAN: readonly [number, number, number, number] =
  [0.0, 0.0, 0.0, Number.NaN] as const;

// ---------------------------------------------------------------------------
// Metal shader source strings.
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_InverseEOTF::GetProgram` fragment shader source (LEN=0000037f).
 * @Helium 0x3a3d68 (leaq disp32(%rip)); RIP-after 0x3a3d6f + 0x6368aa = 0x9da619.
 *
 * SMPTE ST.2084 PQ ENCODE per RGB channel:
 *   E = max(E, 0)
 *   E' = pow(E, m1)               // hg_Params[0].x = m1 ≈ 0.1593017578125
 *   num = c1 + c2 * E'            // hg_Params[1].x = c1;  hg_Params[1].y = c2
 *   den = 1 + c3 * E'             // hg_Params[1].z = c3
 *   V = pow(num/den, m2)          // hg_Params[0].y = m2 ≈ 78.84375
 *   out.xyz = V; out.w = alpha
 */
export const HgcST2084_InverseEOTF_FRAGMENT_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=000000037f\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r0.xyz = fmax(r0.xyz, c0.xxx);\n" +
  "    r1.xyz = pow(r0.xyz, hg_Params[0].xxx);\n" +
  "    r0.xyz = r1.xyz*hg_Params[1].zzz + c0.yyy;\n" +
  "    r1.xyz = r1.xyz*hg_Params[1].yyy + hg_Params[1].xxx;\n" +
  "    r0.xyz = r1.xyz/r0.xyz;\n" +
  "    output.color0.xyz = pow(r0.xyz, hg_Params[0].yyy);\n" +
  "    output.color0.w = r0.w;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=81f92e6d:ccf1bbeb:6804da4c:060ade07\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:0002:0002:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * `HgcST2084_InverseEOTF::InitProgramDescriptor` visible-shader (LEN=0000025e).
 * @Helium 0x3a3d98 (leaq disp32(%rip)); RIP-after 0x3a3d9f + 0x636c4f = 0x9da9ee.
 */
export const HgcST2084_InverseEOTF_VISIBLE_SHADER_SRC =
  "//Metal1.0     \n" +
  "//LEN=000000025e\n" +
  "[[ visible ]] FragmentOut HgcST2084_InverseEOTF_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0)\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 1.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = color0;\n" +
  "    r0.xyz = fmax(r0.xyz, c0.xxx);\n" +
  "    r1.xyz = pow(r0.xyz, hg_Params[0].xxx);\n" +
  "    r0.xyz = r1.xyz*hg_Params[1].zzz + c0.yyy;\n" +
  "    r1.xyz = r1.xyz*hg_Params[1].yyy + hg_Params[1].xxx;\n" +
  "    r0.xyz = r1.xyz/r0.xyz;\n" +
  "    output.color0.xyz = pow(r0.xyz, hg_Params[0].yyy);\n" +
  "    output.color0.w = r0.w;\n" +
  "    return output;\n" +
  "}\n";

/** Visible fragment-function symbol string. @Helium 0x3a3d91. */
export const HgcST2084_InverseEOTF_VISIBLE_FRAGMENT_FUNC_SYM =
  "HgcST2084_InverseEOTF_hgc_visible" as const;
/** Fragment function name. @Helium 0x3a3da7. */
export const HgcST2084_InverseEOTF_FRAGMENT_FUNC_NAME = "HgcST2084_InverseEOTF" as const;

/**
 * `shaderDescription()` returns std::string "HgcST2084_InverseEOTF [hgc1]" (28 chars).
 * @Helium 0x3a3fa0. Uses LONG-SSO (28 > 22-byte inline capacity):
 *   0x3a3fa9  movl  $0x20,%edi
 *   0x3a3fae  callq __Znwm             [operator new(0x20)]
 *   0x3a3fb3  movq  %rax,0x10(%rbx)    [outStr->long_ptr]
 *   0x3a3fb7  movq  $0x21,(%rbx)       [long-SSO capacity tag]
 *   0x3a3fbe  movq  $0x1c,0x8(%rbx)    [size = 28]
 *   0x3a3fc6..0x3a3fdb  movups two lits + null-terminator
 */
export const HgcST2084_InverseEOTF_SHADER_DESCRIPTION = "HgcST2084_InverseEOTF [hgc1]" as const;

// ---------------------------------------------------------------------------
// InitProgramDescriptor binding metadata addresses.
// ---------------------------------------------------------------------------

/** Return-binding tail (@0x3a3de3; RIP-after 0x3a3dea + 0x272a6 = 0x3cb090). */
export const HgcST2084_InverseEOTF_INIT_PD_RETURN_BINDING_TAIL_ADDR = 0x3cb090 as const;
/** Arg[0]-binding tail (@0x3a3e3a; RIP-after 0x3a3e41 + 0x4e898f = 0x88c7d0). */
export const HgcST2084_InverseEOTF_INIT_PD_ARG0_BINDING_TAIL_ADDR = 0x88c7d0 as const;
/** Arg[1]-binding tail (@0x3a3e85; RIP-after 0x3a3e8c + 0x27204 = 0x3cb090). */
export const HgcST2084_InverseEOTF_INIT_PD_ARG1_BINDING_TAIL_ADDR = 0x3cb090 as const;

// ---------------------------------------------------------------------------
// Runtime state
// ---------------------------------------------------------------------------

export interface HgcST2084_InverseEOTFState {
  /** HGNode base placeholder (+0x00..+0x197). */
  _hgNode: unknown;
  /** +0x10 int flags — RMW at ctor: flags = (flags & ~0x600) | 0x400. */
  _nodeFlags10: number;
  /** +0x198 scratch pointer (32-byte-aligned) — 248 floats. */
  scratch: Float32Array | null;
  /** Raw buffer owning `scratch`. */
  _scratchRaw: ArrayBuffer | null;
}

interface HGBinding {
  kind: number;
  name: string;
  tail: number;
}

// ---------------------------------------------------------------------------
// Ctor / dtor
// ---------------------------------------------------------------------------

/** C1 thunk @Helium 0x3a5480. Tail-jmp to C2. */
export function HgcST2084_InverseEOTF_ctor_C1(): HgcST2084_InverseEOTFState {
  return HgcST2084_InverseEOTF_ctor_C2();
}

/**
 * `HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()` C2 @Helium 0x3a5180.
 * Identical body-shape to HgcST2084_EOTF C2; only L#1's 16-byte source differs
 * (loads 0x3ca9c0 = (1,1,1,0) instead of 0x88ec10 = (1,1,1,+inf)).
 */
export function HgcST2084_InverseEOTF_ctor_C2(): HgcST2084_InverseEOTFState {
  HGNode_HGNode__stub(); // @0x3a518a
  const raw = new ArrayBuffer(HgcST2084_InverseEOTF_SCRATCH_ALLOC_BYTES);
  const scratch = new Float32Array(0x3e0 >>> 2);

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
    const buf = new ArrayBuffer(16);
    const u = new Uint32Array(buf); u[0] = v[0]; u[1] = v[1]; u[2] = v[2]; u[3] = v[3];
    const f = new Float32Array(buf);
    const i = byteOff >>> 2;
    scratch[i + 0] = f[0]; scratch[i + 1] = f[1];
    scratch[i + 2] = f[2]; scratch[i + 3] = f[3];
  };

  // 0x48/0x58 — ZERO3_NEG_INF @0x3a51cf..0x3a51db.
  setF4(0x48, HgcST2084_InverseEOTF_CONST_ZERO3_NEG_INF);
  setF4(0x58, HgcST2084_InverseEOTF_CONST_ZERO3_NEG_INF);
  // 0x68/0x78 — ONE3_0 @0x3a51e0..0x3a51ec.  (DIFFERS from EOTF!)
  setF4(0x68, HgcST2084_InverseEOTF_CONST_ONE3_0);
  setF4(0x78, HgcST2084_InverseEOTF_CONST_ONE3_0);
  // 0x88/0x98 — NEG_FLT_MIN3_0 @0x3a51f1..0x3a5200.
  setF4(0x88, HgcST2084_InverseEOTF_CONST_NEG_FLT_MIN3_0);
  setF4(0x98, HgcST2084_InverseEOTF_CONST_NEG_FLT_MIN3_0);
  // 0xa8/0xb8 — FLT_MIN3_0 @0x3a5208.
  setF4(0xa8, HgcST2084_InverseEOTF_CONST_FLT_MIN3_0);
  setF4(0xb8, HgcST2084_InverseEOTF_CONST_FLT_MIN3_0);
  // 0xc8/0xd8 — INF3_0 @0x3a521f.
  setF4(0xc8, HgcST2084_InverseEOTF_CONST_INF3_0);
  setF4(0xd8, HgcST2084_InverseEOTF_CONST_INF3_0);
  // 0xe8/0xf8 — 127_3_0 @0x3a5236.
  setF4(0xe8, HgcST2084_InverseEOTF_CONST_127_3_0);
  setF4(0xf8, HgcST2084_InverseEOTF_CONST_127_3_0);
  // 0x108/0x118 — SQRT2_3_0 @0x3a524d.
  setF4(0x108, HgcST2084_InverseEOTF_CONST_SQRT2_3_0);
  setF4(0x118, HgcST2084_InverseEOTF_CONST_SQRT2_3_0);
  // 0x128/0x138 — HALF3_0 @0x3a5264.
  setF4(0x128, HgcST2084_InverseEOTF_CONST_HALF3_0);
  setF4(0x138, HgcST2084_InverseEOTF_CONST_HALF3_0);
  // 0x148/0x158 — LOG2_COEF_A @0x3a527b.
  setF4Splat(0x148, HgcST2084_InverseEOTF_LOG2_COEF_A);
  setF4Splat(0x158, HgcST2084_InverseEOTF_LOG2_COEF_A);
  // 0x168/0x178 — LOG2_COEF_B @0x3a5292.
  setF4Splat(0x168, HgcST2084_InverseEOTF_LOG2_COEF_B);
  setF4Splat(0x178, HgcST2084_InverseEOTF_LOG2_COEF_B);
  // 0x188/0x198 — LOG2_COEF_C @0x3a52a9.
  setF4Splat(0x188, HgcST2084_InverseEOTF_LOG2_COEF_C);
  setF4Splat(0x198, HgcST2084_InverseEOTF_LOG2_COEF_C);
  // 0x1a8/0x1b8 — LOG2_COEF_D @0x3a52c0.
  setF4Splat(0x1a8, HgcST2084_InverseEOTF_LOG2_COEF_D);
  setF4Splat(0x1b8, HgcST2084_InverseEOTF_LOG2_COEF_D);
  // 0x1c8/0x1d8 — LOG2_COEF_E @0x3a52d7.
  setF4Splat(0x1c8, HgcST2084_InverseEOTF_LOG2_COEF_E);
  setF4Splat(0x1d8, HgcST2084_InverseEOTF_LOG2_COEF_E);
  // 0x1e8/0x1f8 — LOG2_COEF_F @0x3a52ee.
  setF4Splat(0x1e8, HgcST2084_InverseEOTF_LOG2_COEF_F);
  setF4Splat(0x1f8, HgcST2084_InverseEOTF_LOG2_COEF_F);
  // 0x208/0x218 — LOG2_COEF_G @0x3a5305.
  setF4Splat(0x208, HgcST2084_InverseEOTF_LOG2_COEF_G);
  setF4Splat(0x218, HgcST2084_InverseEOTF_LOG2_COEF_G);
  // 0x228/0x238 — NEG_127_3_0 @0x3a531c.
  setF4(0x228, HgcST2084_InverseEOTF_CONST_NEG_127_3_0);
  setF4(0x238, HgcST2084_InverseEOTF_CONST_NEG_127_3_0);
  // 0x248/0x258 — EXP2_COEF_A @0x3a5333.
  setF4Splat(0x248, HgcST2084_InverseEOTF_EXP2_COEF_A);
  setF4Splat(0x258, HgcST2084_InverseEOTF_EXP2_COEF_A);
  // 0x268/0x278 — EXP2_COEF_B @0x3a534a.
  setF4Splat(0x268, HgcST2084_InverseEOTF_EXP2_COEF_B);
  setF4Splat(0x278, HgcST2084_InverseEOTF_EXP2_COEF_B);
  // 0x288/0x298 — EXP2_COEF_C @0x3a5361.
  setF4Splat(0x288, HgcST2084_InverseEOTF_EXP2_COEF_C);
  setF4Splat(0x298, HgcST2084_InverseEOTF_EXP2_COEF_C);
  // 0x2a8/0x2b8 — EXP2_COEF_D @0x3a5378.
  setF4Splat(0x2a8, HgcST2084_InverseEOTF_EXP2_COEF_D);
  setF4Splat(0x2b8, HgcST2084_InverseEOTF_EXP2_COEF_D);
  // 0x2c8/0x2d8 — EXP2_COEF_E @0x3a538f.
  setF4Splat(0x2c8, HgcST2084_InverseEOTF_EXP2_COEF_E);
  setF4Splat(0x2d8, HgcST2084_InverseEOTF_EXP2_COEF_E);
  // 0x2e8/0x2f8 — INT_127_3_0_BITS @0x3a53a6.
  setF4Ints(0x2e8, HgcST2084_InverseEOTF_CONST_INT_127_3_0_BITS);
  setF4Ints(0x2f8, HgcST2084_InverseEOTF_CONST_INT_127_3_0_BITS);
  // 0x308/0x318 — RSQRTNR_SCALE @0x3a53bd.
  setF4Splat(0x308, HgcST2084_InverseEOTF_CONST_RSQRTNR_SCALE);
  setF4Splat(0x318, HgcST2084_InverseEOTF_CONST_RSQRTNR_SCALE);
  // 0x328/0x338 — FLT_MAX3_0 @0x3a53d4.
  setF4(0x328, HgcST2084_InverseEOTF_CONST_FLT_MAX3_0);
  setF4(0x338, HgcST2084_InverseEOTF_CONST_FLT_MAX3_0);
  // 0x348/0x358 — NEG_FLT_MAX3_0 @0x3a53eb.
  setF4(0x348, HgcST2084_InverseEOTF_CONST_NEG_FLT_MAX3_0);
  setF4(0x358, HgcST2084_InverseEOTF_CONST_NEG_FLT_MAX3_0);
  // 0x368/0x378 — TWO3_0 @0x3a5402.
  setF4(0x368, HgcST2084_InverseEOTF_CONST_TWO3_0);
  setF4(0x378, HgcST2084_InverseEOTF_CONST_TWO3_0);
  // 0x388/0x398 — NAN3_0 @0x3a5419.
  setF4(0x388, HgcST2084_InverseEOTF_CONST_NAN3_0);
  setF4(0x398, HgcST2084_InverseEOTF_CONST_NAN3_0);
  // 0x3a8/0x3b8 — MASK_0003_NAN @0x3a5430.
  setF4(0x3a8, HgcST2084_InverseEOTF_CONST_MASK_0003_NAN);
  setF4(0x3b8, HgcST2084_InverseEOTF_CONST_MASK_0003_NAN);

  const nodeFlags10 = (0 & ~0x600) | 0x400;
  return { _hgNode: null, _nodeFlags10: nodeFlags10, scratch, _scratchRaw: raw };
}

/**
 * D2 @Helium 0x3a5490. Resets vptr; frees raw buffer; tail-jmp HGNode::~HGNode().
 */
export function HgcST2084_InverseEOTF_dtor_D2(state: HgcST2084_InverseEOTFState): void {
  if (state._scratchRaw !== null) {
    state._scratchRaw = null;
    state.scratch = null;
  }
  HGNode_dtor_D2__stub(); // @0x3a54d1
}

/** D1 has the same body as D2. @Helium 0x3a54e0. */
export function HgcST2084_InverseEOTF_dtor_D1(state: HgcST2084_InverseEOTFState): void {
  HgcST2084_InverseEOTF_dtor_D2(state);
}

/** D0 (deleting dtor) @Helium 0x3a5530. D2 body + tail-jmp HGObject::operator delete. */
export function HgcST2084_InverseEOTF_dtor_D0(state: HgcST2084_InverseEOTFState): void {
  HgcST2084_InverseEOTF_dtor_D2(state);
  HGObject_operator_delete__stub(); // @0x3a556e
}

// ---------------------------------------------------------------------------
// GetProgram / shaderDescription
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_InverseEOTF::GetProgram(HGRenderer*)` @Helium 0x3a3d50.
 * Same shape as HgcST2084_EOTF::GetProgram: target==0x60b10 → shader src; else null.
 */
export function HgcST2084_InverseEOTF_GetProgram(renderer: unknown): string | null {
  const target = HGRenderer_GetTarget__stub(renderer, 0x60000);
  return target === 0x60b10 ? HgcST2084_InverseEOTF_FRAGMENT_SHADER_SRC : null;
}

/** `shaderDescription()` @Helium 0x3a3fa0. Returns "HgcST2084_InverseEOTF [hgc1]". */
export function HgcST2084_InverseEOTF_shaderDescription(): string {
  return HgcST2084_InverseEOTF_SHADER_DESCRIPTION;
}

// ---------------------------------------------------------------------------
// InitProgramDescriptor
// ---------------------------------------------------------------------------

/**
 * `HgcST2084_InverseEOTF::InitProgramDescriptor(HGProgramDescriptor* pd) const`
 * @Helium 0x3a3d80. Same shape as HgcST2084_EOTF::InitProgramDescriptor:
 * SetVisibleShaderWithSource + SetFragmentFunctionName + SetReturnBinding
 * (kind=4, name="FragmentOut", tail=@0x3cb090) + argVec.emplace_back x2
 * (kind=2 and kind=0xa, name="float4") + SetArgumentBindings.
 */
export function HgcST2084_InverseEOTF_InitProgramDescriptor(pd: unknown): void {
  HGProgramDescriptor_SetVisibleShaderWithSource__stub(
    pd,
    HgcST2084_InverseEOTF_VISIBLE_FRAGMENT_FUNC_SYM,
    HgcST2084_InverseEOTF_VISIBLE_SHADER_SRC,
  );
  HGProgramDescriptor_SetFragmentFunctionName__stub(pd, HgcST2084_InverseEOTF_FRAGMENT_FUNC_NAME);
  HGProgramDescriptor_SetReturnBinding__stub(pd, {
    kind: 4, name: "FragmentOut",
    tail: HgcST2084_InverseEOTF_INIT_PD_RETURN_BINDING_TAIL_ADDR,
  });
  const argVec: HGBinding[] = [];
  HGBindingVector_emplace_back__stub(argVec, {
    kind: 0x2, name: "float4", tail: HgcST2084_InverseEOTF_INIT_PD_ARG0_BINDING_TAIL_ADDR,
  });
  HGBindingVector_emplace_back__stub(argVec, {
    kind: 0xa, name: "float4", tail: HgcST2084_InverseEOTF_INIT_PD_ARG1_BINDING_TAIL_ADDR,
  });
  HGProgramDescriptor_SetArgumentBindings__stub(pd, argVec);
}

// ---------------------------------------------------------------------------
// Bind / BindTexture — identical dispatch shape to HgcST2084_EOTF.
// ---------------------------------------------------------------------------

/** `Bind(HGHandler*)` @Helium 0x3a4060. See HgcST2084_EOTF::Bind for full disasm.
 *  Two h->vtable[0x90] calls (with scratch[0..0x20) then scratch[0x20..0x40)) then
 *  this->vtable[0xc0] hook. */
export function HgcST2084_InverseEOTF_Bind(state: HgcST2084_InverseEOTFState, h: unknown): number {
  if (state.scratch === null) {
    throw new Error("HgcST2084_InverseEOTF::Bind @0x3a4060 called before ctor initialized scratch");
  }
  HGHandler_vtable0x90__stub(h, 0, state.scratch.subarray(0x00 >>> 2, 0x20 >>> 2), 1);
  HGHandler_vtable0x90__stub(h, 1, state.scratch.subarray(0x20 >>> 2, 0x40 >>> 2), 1);
  HgcST2084_InverseEOTF_vtable0xc0__stub(state, h);
  return 0;
}

/** `BindTexture(HGHandler*, int idx)` @Helium 0x3a3ff0. Same shape as EOTF's. */
export function HgcST2084_InverseEOTF_BindTexture(
  _state: HgcST2084_InverseEOTFState, h: unknown, idx: number,
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

/** `GetDOD` @Helium 0x3a58f0. `inputIdx==0 -> r; else HGRectNull.` */
export function HgcST2084_InverseEOTF_GetDOD(
  _renderer: unknown, inputIdx: number, r: HGRect,
): HGRect {
  return inputIdx === 0 ? r : HGRectNull;
}

/** `GetROI` @Helium 0x3a5910. Same body as GetDOD. */
export function HgcST2084_InverseEOTF_GetROI(
  _renderer: unknown, inputIdx: number, r: HGRect,
): HGRect {
  return inputIdx === 0 ? r : HGRectNull;
}

/** `GetOutput` @Helium 0x3a5e00. Returns this. */
export function HgcST2084_InverseEOTF_GetOutput(
  state: HgcST2084_InverseEOTFState, _renderer: unknown,
): HgcST2084_InverseEOTFState {
  return state;
}

// ---------------------------------------------------------------------------
// SetParameter / GetParameter — same shape as HgcST2084_EOTF.
// ---------------------------------------------------------------------------

/**
 * `SetParameter(int id, float a,b,c,d)` @Helium 0x3a5580.
 * -1 if id>1; 0 if unchanged; 1 if written (and HGNode::ClearBits called).
 */
export function HgcST2084_InverseEOTF_SetParameter(
  state: HgcST2084_InverseEOTFState,
  id: number, a: number, b: number, c: number, d: number,
): number {
  const idU = id >>> 0;
  if (idU > 1) {
    return -1;
  }
  if (state.scratch === null) {
    throw new Error("HgcST2084_InverseEOTF::SetParameter @0x3a5580 called before ctor");
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

/** `GetParameter(int id, float* out)` @Helium 0x3a5600. Copies 4 floats or returns -1. */
export function HgcST2084_InverseEOTF_GetParameter(
  state: HgcST2084_InverseEOTFState, id: number, out: Float32Array,
): number {
  const idU = id >>> 0;
  if (idU > 1) {
    return -1;
  }
  if (state.scratch === null) {
    throw new Error("HgcST2084_InverseEOTF::GetParameter @0x3a5600 called before ctor");
  }
  const base = (idU * 0x20) >>> 2;
  const s = state.scratch;
  out[0] = s[base + 0]; out[1] = s[base + 1];
  out[2] = s[base + 2]; out[3] = s[base + 3];
  return 0;
}

// ---------------------------------------------------------------------------
// RenderTile (SSE) + RenderTile_AVX — LARGE, NOT YET TRANSCRIBED.
// ---------------------------------------------------------------------------

/**
 * `RenderTile(HGTile*)` @Helium 0x3a4a90. SSE software rasterizer for the ST.2084
 * PQ ENCODE (inverse EOTF). Uses the ctor's scratch (log2/exp2 polynomials, rsqrt
 * NR) to implement pow(x,k) as exp2(k*log2(x)). Dispatches to RenderTile_AVX
 * when the render target ≥ 0x4700000; otherwise runs two SSE inner loops gated by
 * target ≤ 0x44fffff.
 *
 * FRONTIER — deferred: bit-exact SSE port needs the parity harness.
 */
export function HgcST2084_InverseEOTF_RenderTile(
  _state: HgcST2084_InverseEOTFState, _tile: unknown,
): number {
  throw new Error(
    "HgcST2084_InverseEOTF::RenderTile @Helium 0x3a4a90 not yet transcribed — SSE software rasterizer (ST.2084 PQ encode)",
  );
}

/** `RenderTile_AVX(HGTile*)` @Helium 0x3a40c0. AVX2 8-lane variant. FRONTIER. */
export function HgcST2084_InverseEOTF_RenderTile_AVX(
  _state: HgcST2084_InverseEOTFState, _tile: unknown,
): number {
  throw new Error(
    "HgcST2084_InverseEOTF::RenderTile_AVX @Helium 0x3a40c0 not yet transcribed — AVX2 variant of RenderTile",
  );
}

// ---------------------------------------------------------------------------
// Frontier callee stubs — throw with @0xADDR provenance on the SAME line.
// ---------------------------------------------------------------------------

function HGNode_HGNode__stub(): void {
  throw new Error("HGNode::HGNode() @Helium (call-site 0x3a518a) not yet transcribed");
}
function HGNode_dtor_D2__stub(): void {
  throw new Error("HGNode::~HGNode() @Helium (call-site 0x3a54d1) not yet transcribed");
}
function HGNode_ClearBits__stub(_state: HgcST2084_InverseEOTFState): void {
  throw new Error("HGNode::ClearBits() @Helium (call-site 0x3a55e8) not yet transcribed");
}
function HGObject_operator_delete__stub(): void {
  throw new Error("HGObject::operator delete(void*) @Helium (call-site 0x3a556e) not yet transcribed");
}
function HGRenderer_GetTarget__stub(_r: unknown, _kind: number): number {
  throw new Error("HGRenderer::GetTarget @Helium (call-site 0x3a3d5c) not yet transcribed");
}
function HGHandler_vtable0x30__stub(_h: unknown, _a: number, _b: number): void {
  throw new Error("HGHandler::<vtable+0x30> @Helium (call-site 0x3a401c) not yet transcribed");
}
function HGHandler_vtable0x48__stub(_h: unknown, _a: number, _b: number): void {
  throw new Error("HGHandler::<vtable+0x48> @Helium (call-site 0x3a400f) not yet transcribed");
}
function HGHandler_TexCoord__stub(
  _h: unknown, _a: number, _b: number, _c: number, _p: Float64Array | null,
): void {
  throw new Error("HGHandler::TexCoord @Helium (call-site 0x3a3feb) not yet transcribed");
}
function HGHandler_field0x90__stub(_h: unknown): unknown {
  throw new Error("HGHandler::<field+0x90> load @Helium (call-site 0x3a4030) not yet transcribed");
}
function HGHandlerSub_vtable0x80__stub(_sub: unknown, _arg: number): number {
  throw new Error("HGHandlerSub::<vtable+0x80> @Helium (call-site 0x3a403f) not yet transcribed");
}
function HGHandler_vtable0x90__stub(
  _h: unknown, _slot: number, _buf: Float32Array, _count: number,
): void {
  throw new Error("HGHandler::<vtable+0x90> @Helium (call-site 0x3a4081) not yet transcribed");
}
function HGHandler_vtable0xa8__stub(_h: unknown): void {
  throw new Error("HGHandler::<vtable+0xa8> @Helium (call-site 0x3a404f) not yet transcribed");
}
function HgcST2084_InverseEOTF_vtable0xc0__stub(
  _state: HgcST2084_InverseEOTFState, _h: unknown,
): void {
  throw new Error("HgcST2084_InverseEOTF::<vtable+0xc0> @Helium (call-site 0x3a40b1) not yet transcribed");
}
function HGProgramDescriptor_SetVisibleShaderWithSource__stub(
  _pd: unknown, _sym: string, _src: string,
): void {
  throw new Error("HGProgramDescriptor::SetVisibleShaderWithSource @Helium (call-site 0x3a3da2) not yet transcribed");
}
function HGProgramDescriptor_SetFragmentFunctionName__stub(_pd: unknown, _name: string): void {
  throw new Error("HGProgramDescriptor::SetFragmentFunctionName @Helium (call-site 0x3a3db1) not yet transcribed");
}
function HGProgramDescriptor_SetReturnBinding__stub(_pd: unknown, _b: HGBinding): void {
  throw new Error("HGProgramDescriptor::SetReturnBinding @Helium (call-site 0x3a3df8) not yet transcribed");
}
function HGProgramDescriptor_SetArgumentBindings__stub(_pd: unknown, _v: HGBinding[]): void {
  throw new Error("HGProgramDescriptor::SetArgumentBindings @Helium (call-site 0x3a3ef6) not yet transcribed");
}
function HGBindingVector_emplace_back__stub(v: HGBinding[], b: HGBinding): void {
  v.push(b);
}
