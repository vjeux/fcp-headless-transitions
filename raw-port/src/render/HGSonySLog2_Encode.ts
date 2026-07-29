// raw-port/src/render/HGSonySLog2_Encode.ts
//
// FCP `HGSonySLog2::Encode` — nested Helium HGNode subclass. Wraps an owned
// `HGColorMatrix` (source-colorimetry → S-Gamut 3×3 conversion framed in a
// 4×4 affine matrix, keyed by camera-white-balance color-temperature) chained
// into an owned `HgcLogVideo_encode` compositor configured for the Sony
// S-Log2 forward OETF (scene-linear → S-Log2 code value). Matches the shape
// of HGACEScct::Encode and HGSonySLog3::Encode (an HGNode facade that owns
// and configures a HgcLogVideo_encode via SetParameter slot 0x60); like
// HGSonySLog3::Encode it additionally chains a HGColorMatrix in front for
// the source→S-Gamut gamut transform.
//
// FRAMEWORK: Helium.framework
// FAT slice offset: 0x4000; thin binary /tmp/Helium.x86_64 has VA == file
// offset (segment __TEXT vmaddr = 0). Constants read via
// `raw-port/army/tools/resolve.py Helium const 0x…` and verified against
// the raw bytes of /tmp/Helium.x86_64.
//
// DISASSEMBLY (extracted from /tmp/Helium_tV.txt):
//   raw-port/re/disasm/Helium.HGSonySLog2.Encode.s
//
// SYMBOLS:
//   @Helium 0x104740  HGSonySLog2::Encode::Encode(HGSonySLog2::SceneColorimetry, unsigned int)  [C2]  __ZN11HGSonySLog26EncodeC2ENS_16SceneColorimetryEj
//   @Helium 0x104810  HGSonySLog2::Encode::Encode(HGSonySLog2::SceneColorimetry, unsigned int)  [C1 — tail-jmp to C2]  __ZN11HGSonySLog26EncodeC1ENS_16SceneColorimetryEj
//   @Helium 0x104820  HGSonySLog2::Encode::~Encode()  [D2]  __ZN11HGSonySLog26EncodeD2Ev
//   @Helium 0x104870  HGSonySLog2::Encode::~Encode()  [D1]  __ZN11HGSonySLog26EncodeD1Ev
//   @Helium 0x1048c0  HGSonySLog2::Encode::~Encode()  [D0 — deleting]  __ZN11HGSonySLog26EncodeD0Ev
//   @Helium 0x104920  HGSonySLog2::Encode::GetOutput(HGRenderer*)  __ZN11HGSonySLog26Encode9GetOutputEP10HGRenderer
//
// COLD-STATIC INITIALIZERS: NONE. Unlike HGACEScct::Encode there are no
// `.cold.*` initializers for this class — every coefficient is a compile-
// time constant baked into either an inline immediate (see 0x1047c5) or a
// RIP-relative __const load in GetOutput. Verified:
//   `grep "HGSonySLog2::Encode" /tmp/Helium_demangled.txt | grep cold`
//   returns no matches.
//
// VTABLE:
//   Ctor @0x104759: `leaq 0x9156e0(%rip), %rax` (rip@0x104760) → 0xa19e40 =
//     "vtable for HGSonySLog2::Encode + 0x10" (Itanium ABI installed ptr;
//     `nm | grep __ZTVN11HGSonySLog26EncodeE` → 0xa19e30, +0x10 = 0xa19e40).
//   Reinstalled at D2 @0x104830→0xa19e40 (leaq 0x915610@0x104829, rip@0x104830),
//                  D1 @0x104880→0xa19e40 (leaq 0x9155c0@0x104879, rip@0x104880),
//                  D0 @0x1048d0→0xa19e40 (leaq 0x915570@0x1048c9, rip@0x1048d0).
//
// STRUCT LAYOUT (recovered from C2 @0x104740 + GetOutput @0x104920):
//   HGSonySLog2::Encode extends HGNode (base ctor called @0x104754, so HGNode
//   occupies offsets 0x00..0x197 per raw-port/src/render/HGNode.ts). This
//   subclass adds:
//     0x198 : HGColorMatrix*          colorMatrix   (alloc size 0x1f0; @0x104763/0x104773)
//     0x1a0 : HgcLogVideo_encode*     logEncode     (alloc size 0x1a0; @0x10477f/0x10478f)
//     0x1a8 : const float[16]*        matrixPtr     (points into sourceToSGamut{Daylight,Tungsten}[sc])
//     0x1b0 : float                   coef_1b0_f32  (inline immediate 0x3cf5c520 = 0.03000122f;
//                                                    loaded to xmm1 in seg-1 SetParameter)
//   Total sizeof = 0x1b4 (or rounded to 0x1b8 with padding). No further
//   fields touched by any ported entry point.
//
// CONSTRUCTOR ARG WIRING (SysV AMD64: rdi=this, esi/edx = 1st/2nd int args):
//   %esi  -> %r15d : SceneColorimetry     (indexes into 2-entry tables as `r15d << 6`)
//   %edx  -> %r14d : unsigned int         (camera white-point in kelvin;
//                                          `cmpl $0x1388, %r14d ; cmovbq` selects
//                                          Tungsten table when kelvin < 5000, else Daylight)
//
// CTOR MATRIX-TABLE SELECT (@0x104794..0x1047be):
//   0x104794  movl   %r15d, %eax                     ; eax = SceneColorimetry
//   0x104797  shlq   $0x6, %rax                      ; rax = SceneColorimetry * 64  (sizeof(float[16]))
//   0x10479b  cmpl   $0x1388, %r14d                  ; kelvin < 5000 ?  (0x1388 = 5000)
//   0x1047a2  leaq   sourceToSGamutTungsten(%rip), %rcx   ; @Helium 0x3d1c20
//   0x1047a9  leaq   sourceToSGamutDaylight(%rip), %rdx   ; @Helium 0x3d1ba0
//   0x1047b0  cmovbq %rcx, %rdx                      ; if kelvin < 5000: rdx = Tungsten
//   0x1047b4  movq   %r12, 0x1a0(%rbx)               ; this.logEncode = r12  (out-of-order with matrixPtr,
//                                                    ; but observable order is the same)
//   0x1047bb  addq   %rax, %rdx                      ; rdx += row-offset
//   0x1047be  movq   %rdx, 0x1a8(%rbx)               ; this.matrixPtr = &table[sc]
//   0x1047c5  movl   $0x3cf5c520, 0x1b0(%rbx)        ; this.coef_1b0_f32 = 0.03000122f  (inline imm)
//
// STATIC TABLES (Helium __const; both are 2 × 4x4 affine float matrices,
// row-major, last row = (0,0,0,1); sizeof each = 0x80):
//
//   sourceToSGamutDaylight (__ZN11HGSonySLog26Encode22sourceToSGamutDaylightE @0x3d1ba0):
//     entry[0] (sc=0):
//       0.4988070   0.4036523   0.09754108   0.0
//       0.04004142  0.8172577   0.14270128   0.0
//      -0.002637855 0.1694643   0.8331731    0.0
//       0.0         0.0         0.0          1.0
//     entry[1] (sc=1):
//       0.7762185   0.1543669   0.06941375   0.0
//      -0.03789167  0.8879889   0.14990319   0.0
//      -0.04060984  0.10973722  0.9308725    0.0
//       0.0         0.0         0.0          1.0
//
//   sourceToSGamutTungsten (__ZN11HGSonySLog26Encode22sourceToSGamutTungstenE @0x3d1c20):
//     entry[0] (sc=0):
//       0.4380531   0.4684540   0.09349291   0.0
//       0.03414181  0.8013747   0.16448346   0.0
//      -0.001380789 0.1548572   0.8465241    0.0
//       0.0         0.0         0.0          1.0
//     entry[1] (sc=1):
//       0.6673398   0.2638897   0.06876976   0.0
//      -0.04610491  0.8712706   0.17483435   0.0
//      -0.03694543  0.09110671  0.9458388    0.0
//       0.0         0.0         0.0          1.0
//
//   Symbol sizes (verified via nm neighbours):
//     Daylight  0x3d1ba0 → next sym 0x3d1c20 (Tungsten)   →  size 0x80 (2 entries)
//     Tungsten  0x3d1c20 → next sym 0x3d1ca0 (Encode::ap) →  size 0x80 (2 entries)
//
// STATIC F32 GetOutput CONSTANTS (Helium __const):
//   @0x3d1050 raw 0x3f352fed → coef_seg0_xmm0 = 0.7077625393867493f
//   @0x3d1054 raw 0x3d19f1ae → coef_seg0_xmm1 = 0.03758399933576584f
//   @0x3d1058 raw 0x3e0561aa → coef_seg0_xmm2 = 0.1302553713321685791f
//   @0x3d105c raw 0x3f258751 → coef_seg0_xmm3 = 0.6465960144996643f
//   @0x3d1060 raw 0x40627be9 → coef_seg1_xmm0 = 3.5388128757476807f
//   (verified: instruction @0x104984 + 8 + 0x2cc6c4 = 0x3d1050, etc.)
//
// GETOUTPUT (@0x104920..0x1049dc) — rendering-graph wiring:
//   1) input       = HGRenderer::GetInput(this, 0)                            @0x104939
//   2) colorMatrix.vtable[0x78](0, input)                                     @0x104949
//   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, /*bool*/true)   @0x10495f
//   4) logEncode.vtable[0x78](0, colorMatrix)                                 @0x104977
//   5) logEncode.vtable[0x60](0, 0.7077625f, 0.037583999f, 0.13025537f,       @0x1049a6
//                                0.64659601f)                                (seg-0 = log region)
//   6) logEncode.vtable[0x60](1, 3.5388129f, this.coef_1b0_f32, 0.0f, 0.0f)   @0x1049ce
//   7) return this.logEncode                                                  @0x1049d1
//
// SEMANTICS — WHY these coefficients wire S-Log2:
//   The Sony S-Log2 forward OETF (linear scene → S-Log2 code value) is
//   piecewise with a small linear toe segment and a log body. The two
//   SetParameter calls (esi=0 log segment, esi=1 linear/toe segment) hand
//   the byte-exact float coefficients the binary loads to the underlying
//   generic segmented log/linear encoder inside HgcLogVideo_encode.
//   We deliberately do NOT re-derive the S-Log2 spec relationships here —
//   the point is to ship the bytes the binary ships; the shader semantics
//   are decoded (or will be) inside HgcLogVideo_encode, not here.
//   (See raw-port/src/render/HGSonySLog2LinearizationLUTInfo.ts for the
//    fully-decoded inverse OETF and the spec breakpoints.)
//
// UNDECODED CALLEES (throw-stubs per PORTING_SPEC.md rule 3):
//   HGObject::operator new(unsigned long)       @Helium __ZN8HGObjectnwEm  — @0x104768, @0x104784
//   HGObject::operator delete(void*)            @Helium __ZN8HGObjectdlEPv — D0 tail @0x104908
//   HGColorMatrix::HGColorMatrix()              @Helium __ZN13HGColorMatrixC1Ev — @0x104773
//   HGColorMatrix::LoadMatrix(vec4 const*,bool) @Helium __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb — @0x10495f
//   HgcLogVideo_encode::HgcLogVideo_encode()    @Helium __ZN18HgcLogVideo_encodeC1Ev — @0x10478f
//   HgcLogVideo_encode vtable *0x18 (Release)   — dtor calls @0x104842, @0x104892, @0x1048e2, @0x104854, @0x1048a4, @0x1048f4
//   HgcLogVideo_encode vtable *0x60 (SetParameter-like) — twice in GetOutput (@0x1049a6, @0x1049ce)
//   HgcLogVideo_encode vtable *0x78 (SetInput-like)     — @0x104977 in GetOutput
//   HGColorMatrix       vtable *0x78 (SetInput-like)    — @0x104949 in GetOutput
//   HGRenderer::GetInput(HGNode*, int)          @Helium __ZN10HGRenderer8GetInputEP6HGNodei — @0x104939
//   (HGNode ctor/dtor ARE ported and imported from ./HGNode.js.)

import { HGNode } from './HGNode.js';

// ---------------------------------------------------------------------------
// Enum shapes for the two ctor args. Values are the raw integers the C++
// enum / uint encodes; we don't have the enum name-set in the binary (only
// the enum type is visible via demangling) so we treat SceneColorimetry as
// `number` and document the observed values (0 vs 1) that the ctor's dispatch
// tests for. The second arg is a plain `unsigned int` — observed to be a
// kelvin white-point compared to 5000 for Tungsten/Daylight selection.
// ---------------------------------------------------------------------------

/**
 * HGSonySLog2::SceneColorimetry — first ctor arg (esi → r15d). Observed
 * indexes into the 2-entry-per-table matrix arrays as `r15d << 6`.
 * Values 0 and 1 select the two rows of each table (see the module header
 * for the transcribed matrices). Full enum name-set not decoded — the class
 * body only reads the integer.
 */
export type SceneColorimetry = 0 | 1 | number;

/**
 * `HGSonySLog2::Encode::sourceToSGamutDaylight` — Helium `__const` @0x3d1ba0,
 * 0x80 bytes (2 × 4x4 float matrices). Selected when the kelvin arg is
 * `>= 5000` (Daylight balance). Mangled:
 * __ZN11HGSonySLog26Encode22sourceToSGamutDaylightE.
 *
 * Values transcribed verbatim from the u32 payloads in Helium.x86_64:
 *   entry[0] u32 (row0..row3):
 *     0x3eff63a9 0x3eceab6f 0x3dc7c3a2 0x00000000
 *     0x3d240267 0x3f5137ce 0x3e122030 0x00000000
 *     0xbb2cdffb 0x3e2d8819 0x3f554ada 0x00000000
 *     0x00000000 0x00000000 0x00000000 0x3f800000
 *   entry[1] u32 (row0..row3):
 *     0x3f46b651 0x3e1e1250 0x3d8e28d7 0x00000000
 *     0xbd1b344a 0x3f635338 0x3e198033 0x00000000
 *     0xbd26566c 0x3de0bdaa 0x3f6e4db1 0x00000000
 *     0x00000000 0x00000000 0x00000000 0x3f800000
 */
export const HGSonySLog2_Encode_sourceToSGamutDaylight: ReadonlyArray<ReadonlyArray<number>> = [
  // @Helium 0x3d1ba0 — SceneColorimetry == 0
  [
    Math.fround(0.4988070130348206),  Math.fround(0.40365228056907654),  Math.fround(0.09754108637571335), Math.fround(0.0),
    Math.fround(0.04004141688346863), Math.fround(0.8172577023506165),   Math.fround(0.14270128309726715), Math.fround(0.0),
    Math.fround(-0.0026378552429378033), Math.fround(0.16946426033973694), Math.fround(0.8331731557846069),  Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                  Math.fround(0.0),                 Math.fround(1.0),
  ],
  // @Helium 0x3d1be0 — SceneColorimetry == 1
  [
    Math.fround(0.7762185335159302),  Math.fround(0.15436691045761108),  Math.fround(0.06941375136375427), Math.fround(0.0),
    Math.fround(-0.03789166733622551), Math.fround(0.8879889249801636),   Math.fround(0.14990319311618805), Math.fround(0.0),
    Math.fround(-0.040609847754240036), Math.fround(0.10973722487688065), Math.fround(0.9308725595474243),  Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                  Math.fround(0.0),                 Math.fround(1.0),
  ],
];

/**
 * `HGSonySLog2::Encode::sourceToSGamutTungsten` — Helium `__const` @0x3d1c20,
 * 0x80 bytes (2 × 4x4 float matrices). Selected when the kelvin arg is
 * `< 5000` (Tungsten balance). Mangled:
 * __ZN11HGSonySLog26Encode22sourceToSGamutTungstenE.
 *
 * Values transcribed verbatim from the u32 payloads in Helium.x86_64:
 *   entry[0] u32 (row0..row3):
 *     0x3ee0487e 0x3eefd937 0x3dbf792e 0x00000000
 *     0x3d0bd852 0x3f4d26eb 0x3e286e40 0x00000000
 *     0xbab4fb78 0x3e1e92e5 0x3f58b5c5 0x00000000
 *     0x00000000 0x00000000 0x00000000 0x3f800000
 *   entry[1] u32 (row0..row3):
 *     0x3f2ad6cc 0x3e871c9d 0x3d8cd72f 0x00000000
 *     0xbd3cd881 0x3f5f0b9f 0x3e3307a5 0x00000000
 *     0xbd175408 0x3dba962c 0x3f72227b 0x00000000
 *     0x00000000 0x00000000 0x00000000 0x3f800000
 */
export const HGSonySLog2_Encode_sourceToSGamutTungsten: ReadonlyArray<ReadonlyArray<number>> = [
  // @Helium 0x3d1c20 — SceneColorimetry == 0
  [
    Math.fround(0.43805307149887085), Math.fround(0.4684540033340454),   Math.fround(0.09349292516708374), Math.fround(0.0),
    Math.fround(0.034141816943883896), Math.fround(0.8013747334480286),  Math.fround(0.16448345780372620), Math.fround(0.0),
    Math.fround(-0.0013807883486151695), Math.fround(0.15485718846321106), Math.fround(0.8465240597724915),  Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                  Math.fround(0.0),                 Math.fround(1.0),
  ],
  // @Helium 0x3d1c60 — SceneColorimetry == 1
  [
    Math.fround(0.6673398017883301),  Math.fround(0.2638896703720093),   Math.fround(0.06876976042985916), Math.fround(0.0),
    Math.fround(-0.04610491544008255), Math.fround(0.8712706565856934),   Math.fround(0.17483434081077576), Math.fround(0.0),
    Math.fround(-0.036945436894893646), Math.fround(0.09110671281814575), Math.fround(0.9458388090133667),  Math.fround(0.0),
    Math.fround(0.0),                 Math.fround(0.0),                  Math.fround(0.0),                 Math.fround(1.0),
  ],
];

// ---------------------------------------------------------------------------
// Field-0x1b0 inline immediate. C2 emits:
//   0x1047c5  movl $0x3cf5c520, 0x1b0(%rbx)
// Bit-pattern 0x3cf5c520 decodes to 0.03000122308731079f (IEEE 754 f32).
// Passed as xmm1 in the segment-1 SetParameter call.
// ---------------------------------------------------------------------------
/** @Helium 0x1047c5 inline immediate 0x3cf5c520 (float32). */
const HGSonySLog2_Encode_field_1b0_init_f32: number = Math.fround(0.03000122308731079);

// ---------------------------------------------------------------------------
// RIP-relative constants read at GetOutput @0x104920.
// All are 4-byte float32 __const payloads. Effective addresses computed as
// (instr_addr + 8 + disp) since these are 8-byte `movss disp(%rip), %xmmN`
// encodings.
// ---------------------------------------------------------------------------

/** @Helium 0x3d1050 raw 0x3f352fed → xmm0 arg in the seg-0 SetParameter call.
 *  Read @0x104984 via `movss 0x2cc6c4(%rip), %xmm0`. */
const HGSonySLog2_Encode_getOutput_seg0_xmm0_f32: number = Math.fround(0.7077625393867493);

/** @Helium 0x3d1054 raw 0x3d19f1ae → xmm1 arg in the seg-0 SetParameter call.
 *  Read @0x10498c via `movss 0x2cc6c0(%rip), %xmm1`. */
const HGSonySLog2_Encode_getOutput_seg0_xmm1_f32: number = Math.fround(0.03758399933576584);

/** @Helium 0x3d1058 raw 0x3e0561aa → xmm2 arg in the seg-0 SetParameter call.
 *  Read @0x104994 via `movss 0x2cc6bc(%rip), %xmm2`. */
const HGSonySLog2_Encode_getOutput_seg0_xmm2_f32: number = Math.fround(0.1302553713321685791);

/** @Helium 0x3d105c raw 0x3f258751 → xmm3 arg in the seg-0 SetParameter call.
 *  Read @0x10499c via `movss 0x2cc6b8(%rip), %xmm3`. */
const HGSonySLog2_Encode_getOutput_seg0_xmm3_f32: number = Math.fround(0.6465960144996643);

/** @Helium 0x3d1060 raw 0x40627be9 → xmm0 arg in the seg-1 SetParameter call.
 *  Read @0x1049bb via `movss 0x2cc69d(%rip), %xmm0`. */
const HGSonySLog2_Encode_getOutput_seg1_xmm0_f32: number = Math.fround(3.5388128757476807);

// ---------------------------------------------------------------------------
// Stubs for undecoded callees. Each raises loudly with its call-site @0xADDR
// so frontier.py can see the gap (rule 3: loud gap, never a silent guess).
// ---------------------------------------------------------------------------

/**
 * Placeholder for HGRenderer used by GetOutput's signature. Not yet
 * transcribed — see raw-port/army/ledger for the HGRenderer class.
 * `GetInput` is invoked @Helium 0x104939 with (this, 0).
 */
export interface HGRendererStub {
  /** @Helium 0x104939 — vcalled. Signature `GetInput(HGNode*, int) -> HGNode*`. */
  GetInput(node: HGNode, idx: number): HGNode;
}

/**
 * Placeholder for the HGColorMatrix owned at `this.field_198`. Not yet
 * transcribed — see raw-port/army/ledger. Two vtable slots vcalled from
 * this class:
 *   *0x78 (SetInput-like) — @0x104949 in GetOutput
 *   *0x18 (Release)       — @0x104842/0x104892/0x1048e2 in dtors
 * Plus one direct call: `HGColorMatrix::LoadMatrix(vec4 const*, bool)`
 * @0x10495f.
 */
export interface HGColorMatrix {
  /** vtable *0x18 @Helium — invoked from ~HGSonySLog2::Encode
   *  (D2 @0x104842, D1 @0x104892, D0 @0x1048e2). */
  Release(): void;
  /** vtable *0x78 @Helium — invoked from GetOutput @0x104949 with
   *  (esi=0, rdx=input). */
  SetInput(idx: number, input: HGNode): void;
  /**
   * `HGColorMatrix::LoadMatrix(float vector[4] const*, bool)` — Helium
   * __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb, invoked @0x10495f with
   * (this, this.matrixPtr, true) — the bool edx-arg is $0x1
   * (verified @0x10495a `movl $0x1, %edx`). Not a vtable slot; direct
   * call. The `float vector[4] const*` first arg is a pointer to the
   * 4x4 float matrix (four vec4 rows) stored in this class's __const
   * tables. The `bool` argument is 1 (edx = $0x1). Signature preserved.
   */
  LoadMatrix(matrix: ReadonlyArray<number>, flag: boolean): void;
}

/**
 * Placeholder for HgcLogVideo_encode. Not yet transcribed — see
 * raw-port/army/ledger. Same shape as the one wrapped by HGACEScct::Encode
 * and HGSonySLog3::Encode.
 */
export interface HgcLogVideo_encode {
  /** vtable *0x18 @Helium — invoked from ~HGSonySLog2::Encode
   *  (D2 @0x104854, D1 @0x1048a4, D0 @0x1048f4). */
  Release(): void;
  /** vtable *0x60 @Helium — invoked twice from GetOutput (@0x1049a6, @0x1049ce).
   *  Argument order (esi, xmm0, xmm1, xmm2, xmm3). */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): void;
  /** vtable *0x78 @Helium — invoked once from GetOutput @0x104977 with
   *  (esi=0, rdx=colorMatrix). */
  SetInput(idx: number, input: HGNode): void;
}

/**
 * `newHGColorMatrix()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x104763..0x104773.
 *
 *   0x104763  movl  $0x1f0, %edi                     ; alloc size = 0x1F0 = 496 bytes
 *   0x104768  callq __ZN8HGObjectnwEm                ; HGObject::operator new(unsigned long)
 *   0x104773  callq __ZN13HGColorMatrixC1Ev          ; placement-ctor
 *
 * Both callees are undecoded → throw (rule 3: loud gap, not silent guess).
 */
function newHGColorMatrix(): HGColorMatrix {
  throw new Error(
    "HGSonySLog2::Encode: HGColorMatrix ctor + HGObject::operator new @Helium 0x104768/0x104773 not yet transcribed"
  );
}

/**
 * `newHgcLogVideo_encode()` — placeholder for the compositor allocation +
 * ctor sequence at @Helium 0x10477f..0x10478f.
 *
 *   0x10477f  movl  $0x1a0, %edi                     ; alloc size = 0x1A0 = 416 bytes
 *   0x104784  callq __ZN8HGObjectnwEm                ; HGObject::operator new
 *   0x10478f  callq __ZN18HgcLogVideo_encodeC1Ev     ; placement-ctor
 */
function newHgcLogVideo_encode(): HgcLogVideo_encode {
  throw new Error(
    "HGSonySLog2::Encode: HgcLogVideo_encode ctor + HGObject::operator new @Helium 0x104784/0x10478f not yet transcribed"
  );
}

/**
 * `HGSonySLog2::Encode` — Helium HGNode subclass wrapping an owned
 * `HGColorMatrix` (source colorimetry → S-Gamut) chained into an owned
 * `HgcLogVideo_encode` configured for the S-Log2 forward OETF.
 *
 * @Helium ctors  @0x104740 (C2) / @0x104810 (C1 — tail-jmp to C2);
 *         dtors  @0x104820 (D2) / @0x104870 (D1) / @0x1048c0 (D0);
 *         GetOutput @0x104920.
 */
export class HGSonySLog2Encode extends HGNode {
  /**
   * Owned `HGColorMatrix` (source-→-S-Gamut gamut transform).
   * Field @0x198. Assigned once in ctor @0x104778: `movq %r12, 0x198(%rbx)`.
   */
  colorMatrix: HGColorMatrix | null;

  /**
   * Owned `HgcLogVideo_encode` (segmented log/linear OETF compositor).
   * Field @0x1a0. Assigned once in ctor @0x1047b4: `movq %r12, 0x1a0(%rbx)`.
   */
  logEncode: HgcLogVideo_encode | null;

  /**
   * Pointer to the 16-float row-major matrix in the selected __const table
   * (`sourceToSGamutTungsten` if kelvin<5000, else `sourceToSGamutDaylight`;
   * indexed by SceneColorimetry). Field @0x1a8. Written in ctor @0x1047be.
   */
  matrixPtr: ReadonlyArray<number>;

  /**
   * f32 coefficient at field 0x1b0. Written in ctor @0x1047c5 from the
   * inline immediate 0x3cf5c520 (= 0.03000122308731079f). Loaded to xmm1
   * in the segment-1 SetParameter call in GetOutput.
   */
  coef_1b0_f32: number;

  /**
   * `HGSonySLog2::Encode::Encode(SceneColorimetry, unsigned int)` —
   * Helium @0x104740 (C2 base-object ctor). C1 @0x104810 is a tail-jmp to C2.
   *
   * Verbatim asm (prologue/epilogue elided; the C++ unwind path at
   * 0x1047d8..0x104803 only fires if allocation/ctor throws — TS
   * exceptions unwind naturally):
   *   0x10474b  movl  %edx, %r14d          ; r14d = kelvin (unsigned int)
   *   0x10474e  movl  %esi, %r15d          ; r15d = SceneColorimetry
   *   0x104751  movq  %rdi, %rbx           ; rbx  = this
   *   0x104754  callq __ZN6HGNodeC2Ev      ; HGNode base ctor
   *   0x104759  leaq  0x9156e0(%rip), %rax ; = 0xa19e40 (own installed vtable ptr)
   *   0x104760  movq  %rax, (%rbx)         ; *this = vtable
   *   0x104763  movl  $0x1f0, %edi         ; alloc 0x1f0 bytes
   *   0x104768  callq __ZN8HGObjectnwEm
   *   0x10476d  movq  %rax, %r12           ; r12 = colorMatrix
   *   0x104770  movq  %rax, %rdi
   *   0x104773  callq __ZN13HGColorMatrixC1Ev
   *   0x104778  movq  %r12, 0x198(%rbx)    ; this.colorMatrix = r12
   *   0x10477f  movl  $0x1a0, %edi         ; alloc 0x1a0 bytes
   *   0x104784  callq __ZN8HGObjectnwEm
   *   0x104789  movq  %rax, %r12           ; r12 = logEncode
   *   0x10478c  movq  %rax, %rdi
   *   0x10478f  callq __ZN18HgcLogVideo_encodeC1Ev
   *   0x104794  movl  %r15d, %eax
   *   0x104797  shlq  $0x6, %rax           ; rax = SceneColorimetry * 64
   *   0x10479b  cmpl  $0x1388, %r14d       ; kelvin < 5000 ?
   *   0x1047a2  leaq  sourceToSGamutTungsten(%rip), %rcx
   *   0x1047a9  leaq  sourceToSGamutDaylight(%rip), %rdx
   *   0x1047b0  cmovbq %rcx, %rdx          ; if kelvin<5000: rdx = Tungsten
   *   0x1047b4  movq  %r12, 0x1a0(%rbx)    ; this.logEncode = r12
   *   0x1047bb  addq  %rax, %rdx           ; rdx += row-offset
   *   0x1047be  movq  %rdx, 0x1a8(%rbx)    ; this.matrixPtr = &table[sc]
   *   0x1047c5  movl  $0x3cf5c520, 0x1b0(%rbx)   ; this.coef_1b0_f32 = 0.03000122f
   *   0x1047d7  retq
   */
  constructor(sceneColorimetry: SceneColorimetry, kelvin: number) {
    // @Helium 0x104754: HGNode base ctor
    super();
    // @Helium 0x104760: install this class's vtable (installed ptr = 0xa19e40).
    this.vtable = 0xa19e40;
    // @Helium 0x104768..0x104773: alloc 0x1f0 bytes + HGColorMatrix ctor.
    // Throws until HGColorMatrix is transcribed (see stub above).
    const newColorMatrix = newHGColorMatrix();
    // @Helium 0x104778: store colorMatrix
    this.colorMatrix = newColorMatrix;
    // @Helium 0x104784..0x10478f: alloc 0x1a0 bytes + HgcLogVideo_encode ctor.
    const newLogEncode = newHgcLogVideo_encode();
    // @Helium 0x1047b4: store logEncode
    this.logEncode = newLogEncode;
    // @Helium 0x1047a2..0x1047b0: table = (kelvin < 5000) ? Tungsten : Daylight.
    // The `cmpl $0x1388 ; cmovbq %rcx, %rdx` pattern is unsigned-below (cmovb),
    // i.e. `kelvin < 5000u`. Any kelvin at or above 5000 (K) selects Daylight.
    // We use `>>> 0` to force the unsigned semantic (edx is a 32-bit unsigned).
    const table =
      (kelvin >>> 0) < 0x1388
        ? HGSonySLog2_Encode_sourceToSGamutTungsten
        : HGSonySLog2_Encode_sourceToSGamutDaylight;
    // @Helium 0x1047be: matrixPtr = &table[sceneColorimetry]
    this.matrixPtr = table[sceneColorimetry as number];
    // @Helium 0x1047c5: this.coef_1b0_f32 = 0.03000122f (inline immediate)
    this.coef_1b0_f32 = HGSonySLog2_Encode_field_1b0_init_f32;
  }

  /**
   * `HGSonySLog2::Encode::~Encode()` — Helium @0x104820 (D2) / @0x104870 (D1)
   * / @0x1048c0 (D0). All three share the same body up through the base-dtor
   * call; D0 additionally tail-calls `HGObject::operator delete`. Bodies:
   *
   * D2 @0x104820..0x104860:
   *   0x104829  leaq  0x915610(%rip), %rax   ; = 0xa19e40 (own installed vtable)
   *   0x104830  movq  %rax, (%rdi)           ; reinstall vtable
   *   0x104833  movq  0x198(%rdi), %rdi      ; rdi = colorMatrix
   *   0x10483a  testq %rdi, %rdi
   *   0x10483d  je    0x104845
   *   0x10483f  movq  (%rdi), %rax           ; rax = colorMatrix.vtable
   *   0x104842  callq *0x18(%rax)            ; colorMatrix.Release()
   *   0x104845  movq  0x1a0(%rbx), %rdi      ; rdi = logEncode
   *   0x10484c  testq %rdi, %rdi
   *   0x10484f  je    0x104857
   *   0x104851  movq  (%rdi), %rax           ; rax = logEncode.vtable
   *   0x104854  callq *0x18(%rax)            ; logEncode.Release()
   *   0x104857  movq  %rbx, %rdi             ; rdi = this
   *   0x104860  jmp   __ZN6HGNodeD2Ev        ; tail-call HGNode base dtor
   *
   * D1 @0x104870 is byte-identical (different leaq displacement to the same
   * 0xa19e40 target). D0 @0x1048c0 replaces the tail-jmp to HGNode::~HGNode()
   * with a non-tail call (@0x1048fa) followed by
   * `jmp __ZN8HGObjectdlEPv` (@0x104908). The operator-delete step is
   * modelled by the JS caller dropping the reference (see HGACEScct_Encode.ts
   * / HGSonySLog3_Encode.ts for the identical pattern).
   */
  destruct(): void {
    // @Helium 0x104830: vtable reinstall.
    this.vtable = 0xa19e40;
    // @Helium 0x104833..0x104842: release colorMatrix if present.
    if (this.colorMatrix != null) {
      this.colorMatrix.Release();
      this.colorMatrix = null;
    }
    // @Helium 0x104845..0x104854: release logEncode if present.
    if (this.logEncode != null) {
      this.logEncode.Release();
      this.logEncode = null;
    }
    // @Helium 0x104860: tail-jmp HGNode::~HGNode()
    super.destruct();
  }

  /**
   * `HGSonySLog2::Encode::GetOutput(HGRenderer*)` — Helium @0x104920.
   *
   * Wires the two owned compositor children into the render graph:
   *   1) input        = renderer.GetInput(this, 0)
   *   2) colorMatrix.SetInput(0, input)                                [vtable *0x78]
   *   3) HGColorMatrix::LoadMatrix(colorMatrix, this.matrixPtr, true)
   *   4) logEncode.SetInput(0, colorMatrix)                            [vtable *0x78]
   *   5) logEncode.SetParameter(0, 0.7077625f, 0.037583999f,
   *                                0.13025537f, 0.64659601f)           [vtable *0x60]
   *   6) logEncode.SetParameter(1, 3.5388129f, this.coef_1b0_f32,
   *                                0.0f, 0.0f)                         [vtable *0x60]
   *   7) return this.logEncode
   *
   * Verbatim asm (@0x104920..0x1049dc, prologue/epilogue elided):
   *   0x10492a  movq  0x198(%rdi), %r14           ; r14 = this.colorMatrix
   *   0x104931  movq  %rsi, %rdi                  ; rdi = renderer
   *   0x104934  movq  %rbx, %rsi                  ; rsi = this
   *   0x104937  xorl  %edx, %edx                  ; edx = 0
   *   0x104939  callq __ZN10HGRenderer8GetInputEP6HGNodei  ; input = renderer.GetInput(this, 0)
   *   0x10493e  movq  (%r14), %rcx                ; rcx = colorMatrix.vtable
   *   0x104941  movq  %r14, %rdi                  ; rdi = colorMatrix
   *   0x104944  xorl  %esi, %esi                  ; esi = 0
   *   0x104946  movq  %rax, %rdx                  ; rdx = input
   *   0x104949  callq *0x78(%rcx)                 ; colorMatrix.SetInput(0, input)
   *   0x10494c  movq  0x198(%rbx), %rdi           ; rdi = this.colorMatrix
   *   0x104953  movq  0x1a8(%rbx), %rsi           ; rsi = this.matrixPtr
   *   0x10495a  movl  $0x1, %edx                  ; edx = 1  (bool arg)
   *   0x10495f  callq __ZN13HGColorMatrix10LoadMatrixEPKDv4_fb ; LoadMatrix(matrixPtr, true)
   *   0x104964  movq  0x198(%rbx), %rdx           ; rdx = this.colorMatrix (arg-to-SetInput)
   *   0x10496b  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x104972  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x104975  xorl  %esi, %esi                  ; esi = 0
   *   0x104977  callq *0x78(%rax)                 ; logEncode.SetInput(0, colorMatrix)
   *   0x10497a  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x104981  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x104984  movss 0x2cc6c4(%rip), %xmm0       ; xmm0 = 0.7077625f (@0x3d1050)
   *   0x10498c  movss 0x2cc6c0(%rip), %xmm1       ; xmm1 = 0.037583999f (@0x3d1054)
   *   0x104994  movss 0x2cc6bc(%rip), %xmm2       ; xmm2 = 0.13025537f (@0x3d1058)
   *   0x10499c  movss 0x2cc6b8(%rip), %xmm3       ; xmm3 = 0.64659601f (@0x3d105c)
   *   0x1049a4  xorl  %esi, %esi                  ; esi = 0
   *   0x1049a6  callq *0x60(%rax)                 ; logEncode.SetParameter(0, ...seg0 quad)
   *   0x1049a9  movq  0x1a0(%rbx), %rdi           ; rdi = this.logEncode
   *   0x1049b0  movss 0x1b0(%rbx), %xmm1          ; xmm1 = this.coef_1b0_f32
   *   0x1049b8  movq  (%rdi), %rax                ; rax = logEncode.vtable
   *   0x1049bb  movss 0x2cc69d(%rip), %xmm0       ; xmm0 = 3.5388129f (@0x3d1060)
   *   0x1049c3  xorps %xmm2, %xmm2                ; xmm2 = 0.0f
   *   0x1049c6  xorps %xmm3, %xmm3                ; xmm3 = 0.0f
   *   0x1049c9  movl  $0x1, %esi                  ; esi = 1
   *   0x1049ce  callq *0x60(%rax)                 ; logEncode.SetParameter(1, ...seg1 quad)
   *   0x1049d1  movq  0x1a0(%rbx), %rax           ; rax = this.logEncode  (return value)
   *   0x1049dc  retq
   */
  GetOutput(renderer: HGRendererStub): HGNode {
    // @Helium 0x10492a: r14 = this.colorMatrix. Invariant: non-null after ctor.
    const cm = this.colorMatrix;
    const le = this.logEncode;
    if (cm == null || le == null) {
      throw new Error(
        "HGSonySLog2::Encode::GetOutput @Helium 0x10492a — colorMatrix or logEncode null (should be unreachable after ctor)"
      );
    }
    // @Helium 0x104939: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @Helium 0x104949: colorMatrix.SetInput(0, input)  [vtable *0x78]
    cm.SetInput(0, input);
    // @Helium 0x10495f: HGColorMatrix::LoadMatrix(this.matrixPtr, /*bool*/ true)
    cm.LoadMatrix(this.matrixPtr, true);
    // @Helium 0x104977: logEncode.SetInput(0, colorMatrix)  [vtable *0x78]
    le.SetInput(0, cm as unknown as HGNode);
    // @Helium 0x1049a6: logEncode.SetParameter(0, seg0_xmm0..xmm3)  [vtable *0x60]
    le.SetParameter(
      0,
      HGSonySLog2_Encode_getOutput_seg0_xmm0_f32,
      HGSonySLog2_Encode_getOutput_seg0_xmm1_f32,
      HGSonySLog2_Encode_getOutput_seg0_xmm2_f32,
      HGSonySLog2_Encode_getOutput_seg0_xmm3_f32,
    );
    // @Helium 0x1049ce: logEncode.SetParameter(1, 3.5388129f, coef_1b0_f32, 0.0f, 0.0f)  [vtable *0x60]
    le.SetParameter(
      1,
      HGSonySLog2_Encode_getOutput_seg1_xmm0_f32,
      this.coef_1b0_f32,
      Math.fround(0.0),
      Math.fround(0.0),
    );
    // @Helium 0x1049d1..0x1049dc: return this.logEncode (cast to HGNode via C++ inheritance).
    return le as unknown as HGNode;
  }
}
