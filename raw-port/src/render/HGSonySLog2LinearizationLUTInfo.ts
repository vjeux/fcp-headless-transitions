// HGSonySLog2LinearizationLUTInfo.ts — FCP Helium HGSonySLog2LinearizationLUTInfo:
// Sony S-Log2 tone-curve → linear-light 1-D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: llvm-objdump / otool -tV -arch x86_64
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//   Method symbols enumerated below (mangled __ZN31HGSonySLog2LinearizationLUTInfo…).
//
// STRUCT LAYOUT (recovered from ctor @0x113fe0 and duplicate @0x1158f0):
//   sizeof = 0x28 (40 bytes). Allocated via __Znwm(0x28) in duplicate @0x1158f9-0x1158fe;
//   released via __ZdlPv in D0 @0x1158e5.
//     +0x00  vtable  (installed by ctor @0x113ff5-0x113ffc:
//                     `leaq 0x908d3c(%rip),%rax ; movq %rax,(%rbx)` → target 0xa1cd38.
//                     Written identically by duplicate @0x115913-0x11591a via
//                     `leaq 0x90741e(%rip),%rcx ; movq %rcx,(%rax)` → same effective 0xa1cd38.)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x113feb — meaning this descriptor represents a
//                     1-dimensional LUT.)
//
// EXPORTED SYMBOLS (from otool /tmp/Helium_symmap.tsv):
//   @Helium 0x0000000000113fe0  __ZN31HGSonySLog2LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE
//   @Helium 0x0000000000113fe0  __ZN31HGSonySLog2LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE
//                                (C1 == C2 for this trivial ctor — same code entry.)
//   @Helium 0x0000000000114010  __ZNK31HGSonySLog2LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
//   @Helium 0x0000000000114060  __ZNK31HGSonySLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_
//   @Helium 0x00000000001158d0  __ZN31HGSonySLog2LinearizationLUTInfoD1Ev
//   @Helium 0x00000000001158e0  __ZN31HGSonySLog2LinearizationLUTInfoD0Ev
//   @Helium 0x00000000001158f0  __ZNK31HGSonySLog2LinearizationLUTInfo9duplicateEv
//   @Helium 0x00000000003c3ec0  __ZNK31HGSonySLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.1
//                                (function-local static `d` guarded-init cold slow path)
//   @Helium 0x00000000003c3f00  __ZNK31HGSonySLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_.cold.2
//                                (function-local static `aa` guarded-init cold slow path)
//
// CLASS-SCOPE FUNCTION-LOCAL STATICS (Itanium ABI: __ZZNK…E<name>, initialised on first call):
//   @Helium 0x003c3ed4  d  = 0x3f9eb8a3fbf49ae0  →   0.03000122285188922
//                        (Sony's S-Log2 encoded-domain linear/log seam. 90 code-value / 256
//                         maps here on the standard 10-bit Sony scale.)
//   @Helium 0x003c3f14  aa = 0x4015492995272697  →   5.321447687639782
//                        (natural-exp scale factor: aa · ln e = ln(10) / 0.432699… — i.e.
//                         `aa = ln(10) / 0.432699` where 0.432699 is the standard S-Log2
//                         published logarithmic denominator. This lets the CPU use `_exp`
//                         (fp64 natural exp) to compute `10^((y - offset)/0.432699)`.)
//
//   Both statics live in __ZZNK31HGSonySLog2LinearizationLUTInfo12colorAtIndex…E<name> and
//   are guarded by __ZGVZNK…E<name> guard variables. The cold-1 helper stores `d` via
//   `movabsq $0x3f9eb8a3fbf49ae0, %rax` and the cold-2 helper stores `aa` via
//   `movabsq $0x4015492995272697, %rax`.
//
// __literal8 CONSTANT-POOL VALUES (Helium __DATA-ish, at file-offset 0x4000 + VA):
//   @Helium 0x3d4a98 =  1.0947488584474885                      (kMaxLogGamma — shared with
//                                                                 HGCanonLog2LinearizationLUTInfo)
//   @Helium 0x3d4aa8 = -0.0730593607305936                      (kMinLogGamma — shared)
//   @Helium 0x3d4b10 = -0.646596                                 (S-Log2 log-region offset:
//                                                                 y − 0.646596)
//   @Helium 0x3d4b18 = -0.037584                                 (S-Log2 post-exp offset)
//   @Helium 0x3d4b20 =  1.4129032258064516                       (= 1/0.7078 — post-exp gain
//                                                                 unifying with 219/775 IRE)
//   @Helium 0x3d4b28 =  0.28258064516129033                      (= 219/775 — linear-region
//                                                                 slope for `y < d`)
//
//   Values read via `struct.unpack('<d', file_bytes[0x4000+VA:0x4000+VA+8])` on the Helium
//   x86_64 slice (offset 0x4000 in the fat binary; __TEXT vmaddr=0 so VA==slice-offset).
//
// SEMANTICS (from colorAtIndex disasm @0x114060-0x114157):
//   The S-Log2 → linear transfer function is applied identically to every channel of the
//   incoming grayscale sample (only the first argument matters — R=G=B is written on all
//   three output pointers, and alpha is set to 1.0f).
//
//   Let x = (double)r (`cvtss2sd` @0x114078). Let d and aa be the class-scope statics; let
//   kMin, kMax, off1, off2, gain, linSlope be the __literal8 constants.
//
//     // step 1 — clamp x to [kMinLogGamma, kMaxLogGamma]  (@0x11407f-0x11409b)
//     if x < kMin:  x_c = kMin
//     elif x <= kMax:  x_c = x
//     else:  x_c = kMax
//
//     // step 2 — piecewise about the encoded-domain seam `d` (@0x1140b9-0x1140d3, 0x11410c-0x114131)
//     if x_c < d:
//         y = (x_c - d) * linSlope                              // linear (dark) branch
//     else:
//         y = ( exp( (x_c + off1) * aa ) + off2 ) * gain        // log (bright) branch
//
//     store y as fp32 to R, G, B; store 1.0f to A
//
//   The log branch is exactly Sony's published S-Log2 decode:
//       linear = ( 10^((y_enc − 0.646596)/0.432699) − 0.037584 ) / 0.7078
//   rewritten with natural exp because the constant `aa = ln(10)/0.432699`.
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x113ff0.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x11404a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x114034.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x1158fe / @0x1158e5).
//   • _exp — libm scalar double-precision natural exponential — called @0x11411c.
//   • __cxa_guard_acquire / __cxa_guard_release — used only by the cold-1/cold-2 initializers
//     for the function-local statics `d` and `aa`. We inline the resolved constant values.

// Import shared base handles from the sibling HGCanonLog2LinearizationLUTInfo transcription
// (rule 6: no cross-file reaching into internals — but shared FRONTIER OPAQUES are declared
// via type aliases here; the ledger will unify these into a canonical HGApplyNDLUTInfo port
// once decoded). Keeping local type aliases avoids importing implementation details.

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. All accessor state that
 * a descriptor subclass observes lives in this base; the derived class merely swaps the
 * vtable pointer. Shared with HGCanonLog2LinearizationLUTInfo,
 * HGArriLogC4LinearizationLUTInfo, HGDitherLUTInfo, and every other 1-D log LUT descriptor.
 *
 * @Helium 0x113ff0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *   (base C2 ctor called by our ctor with args (this, unsigned long, 1, float, float,
 *    LUTStorageFormat) — the second `unsigned long` is our wrapper's fixed 1 (@0x113feb).)
 */
export interface HGApplyNDLUTInfo_base {
  readonly __brand_HGApplyNDLUTInfo: unique symbol;
}

/**
 * HGApplyNDLUTInfo::LUTStorageFormat — a small enum (only known here as an `int32` passed
 * to the base ctor via %r8d → %ecx). Bit-width and value set recovered from the base ctor
 * signature but NOT decoded here; the value is passed through as an opaque number.
 */
export type LUTStorageFormat = number;

/**
 * HGLUTCache::LUTInfo — opaque base-class handle. Only observed via `__dynamic_cast` in
 * `isEqual` @0x114034.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x11401e inside isEqual).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Static class members (exported for external consumers that reference the mangled names).
// The class itself has NO C++ static data members exported outside; the two constants `d`
// and `aa` are FUNCTION-LOCAL statics initialised from the cold-1/cold-2 blocks. Their
// values are recovered directly from the `movabsq` immediates in the cold paths.

/** @Helium 0x003c3ed4 movabsq $0x3f9eb8a3fbf49ae0 — S-Log2 encoded-domain seam. */
export const HGSonySLog2LinearizationLUTInfo_d  = 0.03000122285188922;
/** @Helium 0x003c3f14 movabsq $0x4015492995272697 — natural-exp scale = ln(10)/0.432699. */
export const HGSonySLog2LinearizationLUTInfo_aa = 5.321447687639782;

// ── Recovered fp64 __literal8 constants (RIP-relative loads in colorAtIndex). ────────────

// @Helium __literal8 0x3d4a98  →  1.0947488584474885   (kMaxLogGamma; shared w/ CanonLog2)
const K_kMaxLogGamma = 1.0947488584474885;
// @Helium __literal8 0x3d4aa8  → -0.0730593607305936   (kMinLogGamma; shared w/ CanonLog2)
const K_kMinLogGamma = -0.0730593607305936;
// @Helium __literal8 0x3d4b10  → -0.646596             (log-branch offset: (y_c - 0.646596))
const K_logOffset    = -0.646596;
// @Helium __literal8 0x3d4b18  → -0.037584             (post-exp subtractive offset)
const K_postExpOffset = -0.037584;
// @Helium __literal8 0x3d4b20  →  1.4129032258064516   (post-exp multiplicative gain)
const K_postExpGain  = 1.4129032258064516;
// @Helium __literal8 0x3d4b28  →  0.28258064516129033  (linear-branch slope, = 219/775)
const K_linSlope     = 0.28258064516129033;

// Recovered function-local statics (see cold paths @0x3c3ed4, @0x3c3f14).
const K_d  = HGSonySLog2LinearizationLUTInfo_d;
const K_aa = HGSonySLog2LinearizationLUTInfo_aa;

// Bit-pattern for 1.0f — the alpha write @0x114145 (`movl $0x3f800000, (%rbx)`).
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
 * LUTStorageFormat)` — the base-class C2 constructor.
 *   @Helium 0x113ff0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper ctor forces `unsigned long #2 = 1` via `movl $0x1, %edx` @0x113feb before
 * this call (so this 1-D LUT descriptor's base is initialised with dimCount=1). The base
 * layout is not yet decoded — subclasses observe it only through the shared vtable.
 */
function HGApplyNDLUTInfo_base_ctor_stub(
  _self: HGApplyNDLUTInfo_base,
  _dim0: bigint,
  _dim1_forced_to_1: bigint,
  _min: number,
  _max: number,
  _storage: LUTStorageFormat,
): void {
  throw new Error(
    "raise: HGApplyNDLUTInfo::HGApplyNDLUTInfo(m,m,f,f,LUTStorageFormat) base ctor " +
      "@Helium 0x113ff0 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x11404a from
 * our own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x11404a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x11404a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x114034 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x114034  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * Faithful port cannot re-implement Itanium RTTI without the full class hierarchy in hand.
 * isEqual therefore raises through this stub for any non-null `other`, mirroring the
 * sibling HGCanonLog2LinearizationLUTInfo / HGAYCCToneCurveToLinearLUTInfo decision.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x114034 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet. Do NOT weaken this by returning src as-is: " +
      "that would silently equate two different LUTInfo subclasses.",
  );
}

/**
 * `exp(x)` — libm scalar double-precision natural exponential. Called at @0x11411c inside
 * `colorAtIndex`.
 *   @Helium 0x11411c  callq 0x3c50ea   ## symbol stub for: _exp
 *
 * Faithful to libm's fp64 semantics: JS `Math.exp` is IEEE-754 double natural exponential.
 */
function exp_libm(x: number): number {
  return Math.exp(x);
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGSonySLog2LinearizationLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x908d3c(%rip) (ctor) / 0x90741e(%rip) (duplicate) — same
   *  effective target 0xa1cd38. Stored in TS as a class-level tag. */
  readonly __vtable = "HGSonySLog2LinearizationLUTInfo::vtable @Helium 0xa1cd38 " +
    "(ctor:0x908d3c(%rip)@0x113ff5, duplicate:0x90741e(%rip)@0x115913)";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x0000000000113fe0  (__ZN31HGSonySLog2LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw disasm from /tmp/Helium_tV.txt @0x113fe0):
   *   0x113fe6  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x113fe8  movq %rdi, %rbx         → save `this` in rbx
   *   0x113feb  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x113ff0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x113ff5  leaq 0x908d3c(%rip), %rax → load class vtable pointer (effective 0xa1cd38)
   *   0x113ffc  movq %rax, (%rbx)       → this->vtable = HGSonySLog2LinearizationLUTInfo::vtable
   *   0x114005  retq
   */
  constructor(
    dim0: bigint,
    minF: number,
    maxF: number,
    storage: LUTStorageFormat,
  ) {
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    // @0x113ff0  base(this, dim0, 1, minF, maxF, storage) — base's layout not yet decoded,
    // so this raises. Preserve the demand signal here.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x0000000000114010  (__ZNK31HGSonySLog2LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (@0x114010-0x114057):
   *   0x114016  testq %rsi, %rsi       → null-check `other`
   *   0x114019  je 0x11404f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x11401b  movq %rdi, %rbx        → save `this`
   *   0x11401e  movq 0x8ee2bb(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x114025  leaq __ZTI31HGSonySLog2LinearizationLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x11402c  movq %rsi, %rdi        → src = other
   *   0x11402f  movq %rax, %rsi        → srcTypeInfo
   *   0x114032  xorl %ecx, %ecx        → hint = 0
   *   0x114034  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x114039  testq %rax, %rax       → check result
   *   0x11403c  je 0x11404f            → if null (cast failed): return false
   *   0x11403e  movq %rbx, %rdi        → this  (for the tail call)
   *   0x114041  movq %rax, %rsi        → the successfully-cast `other`
   *   0x11404a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGSonySLog2LinearizationLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class itself
   * contributes NO additional state to the comparison (there are no derived fields).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x114016-0x114019  null-check
    if (other === null) return false;
    // 0x114034  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HGSonySLog2…TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                          // srcTypeInfo (from %rip+0x8ee2bb @0x11401e)
      "HGSonySLog2LinearizationLUTInfo",              // dstTypeInfo (from %rip literal @0x114025)
    );
    // 0x114039-0x11403c  if cast failed → false
    if (cast === null) return false;
    // 0x11404a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000114060  (__ZNK31HGSonySLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (@0x114060-0x114157) — see the file-level SEMANTICS block for the pseudocode.
   *
   * Register roles at entry:
   *   xmm0 = r  (fp32)     xmm1 = g (unused)   xmm2 = b (unused)
   *   %rsi = R*, %rdx = G*, %rcx = B*, %r8 = A*
   *
   * Prologue @0x114060-0x11407c saves callee-saved regs and the output pointers into
   *   %r12 = R*, %r15 = G*, %r14 = B*, %rbx = A*.
   * Then `cvtss2sd %xmm0, %xmm1` widens r to fp64 in xmm1.
   *
   * ── STEP 1: clamp x to [kMinLogGamma, kMaxLogGamma] ──
   *   0x11407f  movsd @0x3d4aa8, %xmm0        ; xmm0 = kMinLogGamma (-0.0730593607305936)
   *   0x114087  ucomisd %xmm1, %xmm0          ; compare xmm0(kMin) vs xmm1(x); CF=(kMin<x)
   *   0x11408b  ja 0x1140a3                    ; ja: kMin>x, i.e. x<kMin → jump WITH xmm0=kMin
   *   0x11408d  ucomisd @0x3d4a98, %xmm1      ; compare xmm1(x) vs kMax; CF=(x<kMax)
   *   0x114095  movapd %xmm1, %xmm0            ; xmm0 = x
   *   0x114099  jbe 0x1140a3                   ; jbe: x<=kMax → jump WITH xmm0=x
   *   0x11409b  movsd @0x3d4a98, %xmm0        ; else x>kMax → xmm0 = kMax
   *   0x1140a3  (fall-through)                 ; xmm0 == clamp(x, kMin, kMax)
   *
   * ── STEP 2: initialise function-local statics `d` and `aa` (first-call only) ──
   *   0x1140a3  movzbl guard-var-d, %eax
   *   0x1140aa  testb %al,%al ; je 0x1140d5  → if guard-d==0 goto cold.1 (init d, then return)
   *   0x1140ae  movzbl guard-var-aa, %eax
   *   0x1140b5  testb %al,%al ; je 0x1140ef  → if guard-aa==0 goto cold.2 (init aa, then return)
   *
   *   In steady state both guards are non-zero; both statics are already at their initialised
   *   values (d = 0.03000122285188922, aa = 5.321447687639782). We inline them here as
   *   compile-time constants; the guard-init dispatch is a first-call latency and never
   *   changes the resulting values.
   *
   * ── STEP 3: piecewise about `d` ──
   *   0x1140b9  movsd d(%rip), %xmm1          ; xmm1 = d
   *   0x1140c1  ucomisd %xmm1, %xmm0           ; compare xmm0(x_c) vs xmm1(d); CF=(x_c<d)
   *   0x1140c5  jae 0x11410c                   ; jae: x_c>=d → jump to LOG branch
   *   0x1140c7  subsd %xmm1, %xmm0             ; LINEAR: xmm0 = x_c - d
   *   0x1140cb  mulsd @0x3d4b28, %xmm0        ; xmm0 *= linSlope = 0.28258064516129033
   *   0x1140d3  jmp 0x114131                   ; skip exp — direct cvtsd2ss
   *
   *   0x11410c  addsd @0x3d4b10, %xmm0        ; LOG: xmm0 += logOffset = -0.646596
   *   0x114114  mulsd aa(%rip), %xmm0          ; xmm0 *= aa
   *   0x11411c  callq _exp                     ; xmm0 = exp(...)
   *   0x114121  addsd @0x3d4b18, %xmm0        ; xmm0 += postExpOffset = -0.037584
   *   0x114129  mulsd @0x3d4b20, %xmm0        ; xmm0 *= postExpGain  = 1.4129032258064516
   *
   * ── EPILOGUE ──
   *   0x114131  cvtsd2ss %xmm0, %xmm0   → narrow fp64 → fp32
   *   0x114135  *R = xmm0
   *   0x11413b  *G = xmm0
   *   0x114140  *B = xmm0
   *   0x114145  *A = 0x3f800000  (i.e. 1.0f)
   *
   * NOTE: only the first color-channel argument (`r`) is used; the other two floats are
   * ignored — the function evaluates a single scalar S-Log2 decode and broadcasts the
   * result to all three RGB output pointers, then writes alpha = 1.0f.
   *
   * @param r      xmm0 — the input scalar (only value that matters).
   * @param _g     xmm1 — ignored (2nd float arg).
   * @param _b     xmm2 — ignored (3rd float arg).
   * @param rOut   %rsi=%r12 — output R pointer wrapper: written with y.
   * @param gOut   %rdx=%r15 — output G pointer wrapper: written with y.
   * @param bOut   %rcx=%r14 — output B pointer wrapper: written with y.
   * @param aOut   %r8=%rbx  — output alpha pointer wrapper: written with 1.0f.
   */
  colorAtIndex(
    r: number,
    _g: number,
    _b: number,
    rOut: { value: number },
    gOut: { value: number },
    bOut: { value: number },
    aOut: { value: number },
  ): void {
    // @0x114078  cvtss2sd — the input `r` came in as a fp32 arg. Preceding Math.fround
    // captures the fp32→fp64 step (cvtss2sd on a genuine fp32 is exact).
    const x = Math.fround(r);

    // ── step 1: clamp x to [kMinLogGamma, kMaxLogGamma] ──
    // @0x11407f-0x11409b  branchless-looking, but really 3 clamp branches (see decode above).
    let xc: number;
    if (x < K_kMinLogGamma) {
      // @0x11408b  ja fires when kMin > x → x < kMin.  xmm0 was already loaded with kMin.
      xc = K_kMinLogGamma;
    } else if (x <= K_kMaxLogGamma) {
      // @0x114099  jbe fires when x <= kMax.  xmm0 was set to x @0x114095.
      xc = x;
    } else {
      // @0x11409b  fall-through: x > kMax.  xmm0 loaded with kMax.
      xc = K_kMaxLogGamma;
    }

    // ── step 2: function-local statics — already at initialised values (see cold-1/cold-2
    //   in the header block; the guard-check is a first-call latency, not a semantic branch).

    // ── step 3: piecewise about the encoded-domain seam `d` ──
    let y64: number;
    if (xc < K_d) {
      // @0x1140c5  jae NOT taken → x_c < d → LINEAR branch @0x1140c7-0x1140d3
      // @0x1140c7  xmm0 = x_c - d
      // @0x1140cb  xmm0 *= linSlope
      y64 = (xc - K_d) * K_linSlope;
      // @0x1140d3  jmp epilogue (no exp)
    } else {
      // @0x1140c5  jae taken → x_c >= d → LOG branch @0x11410c-0x114129
      // @0x11410c  xmm0 += logOffset  → xc + (-0.646596)
      // @0x114114  xmm0 *= aa
      // @0x11411c  xmm0 = exp(xmm0)
      // @0x114121  xmm0 += postExpOffset  → exp(...) + (-0.037584)
      // @0x114129  xmm0 *= postExpGain
      const s = (xc + K_logOffset) * K_aa;
      const e = exp_libm(s);
      y64 = (e + K_postExpOffset) * K_postExpGain;
    }

    // @0x114131  cvtsd2ss narrows fp64 → fp32
    const y = Math.fround(y64);

    // @0x114135-0x114145  broadcast to R/G/B and write 1.0f to alpha.
    rOut.value = y;           // @0x114135  movss %xmm0, (%r12)
    gOut.value = y;           // @0x11413b  movss %xmm0, (%r15)
    bOut.value = y;           // @0x114140  movss %xmm0, (%r14)
    aOut.value = ALPHA_ONE;   // @0x114145  movl $0x3f800000, (%rbx)  (bit-pattern of 1.0f)
  }

  /**
   * ~HGSonySLog2LinearizationLUTInfo()  — the D1 (in-place) destructor.
   * @Helium 0x00000000001158d0  (__ZN31HGSonySLog2LinearizationLUTInfoD1Ev)
   *
   * DECODE @0x1158d0-0x1158d5: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq`
   *   — a trivial no-op destructor. There is no derived-class field owning ref-counted
   *   state, so ~HGSonySLog2… only unwinds the stack frame; the compiler-generated D1 for
   *   the base sub-object is inlined-away.
   *
   * In TS with GC there is nothing to do; kept for ABI-shape parity.
   */
  destruct_D1(): void {
    // no-op @0x1158d0
  }

  /**
   * ~HGSonySLog2LinearizationLUTInfo()  — the D0 (deleting) destructor.
   * @Helium 0x00000000001158e0  (__ZN31HGSonySLog2LinearizationLUTInfoD0Ev)
   *
   * DECODE @0x1158e0-0x1158e5: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv`
   *   → tail-calls `operator delete(this)`. In TS with GC there is nothing to do.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x1158e5  → in TS this is a no-op under GC.
  }

  /**
   * duplicate() const  →  HGSonySLog2LinearizationLUTInfo*
   * @Helium 0x00000000001158f0  (__ZNK31HGSonySLog2LinearizationLUTInfo9duplicateEv)
   *
   * DECODE @0x1158f0-0x115923:
   *   0x1158f6  movq %rdi, %rbx           → save `this`
   *   0x1158f9  movl $0x28, %edi          → allocation size = 0x28 (40 bytes = sizeof)
   *   0x1158fe  callq __Znwm              → new(0x28)  → rax = new-obj
   *   0x115903  movups 0x8(%rbx), %xmm0   → load 16B from this+0x08 (bytes 0x08..0x17)
   *   0x115907  movups 0x14(%rbx), %xmm1  → load 16B from this+0x14 (bytes 0x14..0x23)
   *                                         (Overlapping 16B unaligned loads cover the full
   *                                          32-byte base sub-object 0x08..0x27 with
   *                                          16B+16B where the two ranges overlap by 4 bytes.)
   *   0x11590b  movups %xmm0, 0x8(%rax)   → store 16B at new-obj+0x08
   *   0x11590f  movups %xmm1, 0x14(%rax)  → store 16B at new-obj+0x14
   *   0x115913  leaq 0x90741e(%rip), %rcx → load class vtable pointer (effective 0xa1cd38 —
   *                                         same target as ctor's vtable write)
   *   0x11591a  movq %rcx, (%rax)         → new-obj->vtable = HGSonySLog2…::vtable
   *   0x115923  retq
   *
   * Semantics: creates a heap-allocated shallow-byte-copy of `this` — exact base sub-object
   * bytes are duplicated verbatim, then the derived-class vtable pointer is written on top.
   *
   * In TS we don't have byte-addressable memory; the faithful semantics is to allocate a
   * new instance without going through the ctor (avoiding the base-ctor stub raise), then
   * copy the base-handle reference across (mirroring the two overlapping movups).
   */
  duplicate(): HGSonySLog2LinearizationLUTInfo {
    // We can't invoke this class's own constructor here (it would call the base ctor stub
    // and raise). Faithful port: allocate a new instance via Object.create and copy the
    // opaque base handle across (models the byte-copy of bytes 0x08..0x27).
    const copy = Object.create(HGSonySLog2LinearizationLUTInfo.prototype) as HGSonySLog2LinearizationLUTInfo;
    // @0x115903-0x11590f: byte-copy of the base sub-object 0x08..0x27 (32B) — modeled as a
    // shared reference to the same opaque handle.
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x115913-0x11591a: vtable write — implicit in TS via Object.create(...prototype).
    return copy;
  }
}

/**
 * Vtable-slot layout: this class overrides at least:
 *   • ~D0/~D1  →  destruct_D0 / destruct_D1
 *   • isEqual   →  isEqual
 *   • duplicate →  duplicate
 *   • colorAtIndex → colorAtIndex
 * Other virtual slots (from HGApplyNDLUTInfo / HGLUTCache::LUTInfo) are inherited unchanged.
 *
 * The precise slot ordering isn't extracted here (it lives in the vtable RTTI). See
 * __ZTV31HGSonySLog2LinearizationLUTInfo for the target (effective 0xa1cd38).
 */
export const HGSonySLog2LinearizationLUTInfo_vtable_addr = "@Helium 0xa1cd38" as const;
