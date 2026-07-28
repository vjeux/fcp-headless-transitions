// HGCanonLog2LinearizationLUTInfo.ts — FCP Helium HGCanonLog2LinearizationLUTInfo:
// Canon Log 2 (C-Log2) tone-curve → linear-light 1D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGCanonLog2LinearizationLUTInfo.*.s
//         (captured mangled symbols __ZN31HGCanonLog2LinearizationLUTInfo* starting at
//          x86_64 slice VA 0x113ca0; static class constants at __DATA VA 0x3d5160-0x3d5180.)
//
// STRUCT LAYOUT (recovered from ctor @0x113ca0 and duplicate @0x115830):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115839-0x11583e;
//   released via `__ZdlPv` in D0 @0x115825.
//     +0x00  vtable  (installed by ctor @0x113cb5-0x113cbc:
//                     `leaq 0x908fdc(%rip),%rax ; movq %rax,(%rbx)` — the sole class-specific
//                     write; all other 32 bytes of state live in the HGApplyNDLUTInfo base
//                     sub-object installed by the C2 base ctor @0x113cb0.)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x113cab — meaning this descriptor represents a
//                     1-dimensional LUT.)
//
// EXPORTED SYMBOLS (six member functions — from the class brief):
//   @Helium 0x0000000000113ca0  ctor  (unsigned long, float, float, LUTStorageFormat)
//   @Helium 0x0000000000113cd0  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000113d20  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115810  D1  (~HGCanonLog2LinearizationLUTInfo — in-place, trivial)
//   @Helium 0x0000000000115820  D0  (deleting, tail-calls operator delete)
//   @Helium 0x0000000000115830  duplicate() const  →  a new heap-allocated copy
//
// STATIC CLASS CONSTANTS (Helium __DATA at file-offset 0x4000 + VA):
//   __ZN31HGCanonLog2LinearizationLUTInfo1aE            @0x3d5160  =    0.122411586
//   __ZN31HGCanonLog2LinearizationLUTInfo1bE            @0x3d5168  =    0.035388128
//   __ZN31HGCanonLog2LinearizationLUTInfo1cE            @0x3d5170  =   87.09937546
//   __ZN31HGCanonLog2LinearizationLUTInfo12kMinLogGammaE @0x3d5178 =   -0.073059360730593603
//   __ZN31HGCanonLog2LinearizationLUTInfo12kMaxLogGammaE @0x3d5180 =    1.0947488584474885
//
//   These are the standard Canon Log 2 constants (a, b, c, min-log-gamma, max-log-gamma).
//   The `colorAtIndex` disasm inlines every one of them as its own __literal8 duplicate at
//   VAs 0x3d4a98-0x3d4ad8, verified byte-identical to the static globals above.
//
// SEMANTICS (from colorAtIndex disasm @0x113d20-0x113dd8):
//   The Canon Log 2 → linear transfer function is a piecewise-symmetric curve applied
//   identically to every channel of the incoming grayscale sample (only the first argument
//   matters — R=G=B is written on all three output pointers, and alpha is set to 1.0f).
//
//   Let x = (double)r (`cvtss2sd` @0x113d38). Let a, b, c, kMin, kMax be the class statics.
//
//     if x < kMin:                                       ┐ @0x113d47 ucomisd xmm2(=kMin), xmm1(=x)
//         num = b - kMin        (constant clamp)         │ @0x113d4d..@0x113d55
//         den = -c              (constant clamp)         │ @0x113d59
//     elif x > kMax:                                     │ @0x113d63..@0x113d6f  ja
//         num = kMax + (-b) = kMax - b   (const clamp)   │ @0x113d83..@0x113d8b (xmm0=kMax→+(-b), xmm1=c)
//         den = c               (constant clamp)         │
//     elif x < b:                                        │ @0x113d71..@0x113d81  jb
//         num = b - x                                    │ @0x113d4d..@0x113d55 (re-entry with xmm0=b, xmm2=x)
//         den = -c                                       │ @0x113d59
//     else:  # b <= x <= kMax                            │ fall-through @0x113d83
//         num = x + (-b) = x - b                         │ @0x113d83
//         den = c                                        │ @0x113d8b
//
//     y = ( exp( num / a ) + (-1) ) / den                  @0x113d93..@0x113dad
//     store y to R, G, B; store 1.0f to A                  @0x113db6..@0x113dc6
//
//   This is exactly Canon's published Canon Log 2 decode formula
//   (`x_linear = (10^((V - kMin)/c) - 1) / a` in log10 form, here written with natural exp
//   because `a` has been pre-multiplied by ln(10) into `c`'s scaling — the constants above
//   ARE Canon's published values). The disasm never uses base-10 log/pow — it uses `_exp`
//   (natural exponential) with the constants Canon publishes for the ln-form.
//
//   Three ranges of x get clamped-constant numerators (out-of-gamut inputs saturate to a
//   fixed exp argument), and the middle range is split at x=b into the two symmetric
//   log-signed halves (den = ±c reflects the sign of the encoded log around b).
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x113cb0.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x113d0a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x113cf4.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x11583e / @0x115825).
//   • _exp — libm scalar double-precision natural exponential — called @0x113da0.
//
// The vtable slot at @0x908fdc(%rip) (from @0x113cb5) is the class's own vtable — its
// member pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus the base's virtual slots)
// are installed by the linker; they are treated here as the class's method table.

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. All accessor state that
 * a descriptor subclass observes lives in this base; the derived class merely swaps the
 * vtable pointer. This is the same opaque-handle pattern used by HGDitherLUTInfo.ts,
 * HGColorGammaLUTInfo.ts, and HGAYCCToneCurveToLinearLUTInfo.ts — the shared future task
 * is a single canonical HGApplyNDLUTInfo port.
 *
 * @Helium 0x113cb0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *   (base C2 ctor called by our ctor with args (this, unsigned long, 1, float, float,
 *    LUTStorageFormat) — the second `unsigned long` is our wrapper's fixed 1 (@0x113cab).)
 */
export interface HGApplyNDLUTInfo_base {
  readonly __brand_HGApplyNDLUTInfo: unique symbol;
}

/**
 * HGApplyNDLUTInfo::LUTStorageFormat — a small enum (only known here as an `int32` passed
 * to the base ctor via %r8d → %ecx). The bit-width and value set are recovered from the
 * base ctor signature but NOT decoded here; we pass the value through as an opaque number.
 */
export type LUTStorageFormat = number;

/**
 * HGLUTCache::LUTInfo — opaque base-class handle. Only observed via `__dynamic_cast` in
 * `isEqual` @0x113cf4; see the throwing stub below.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x113cde inside isEqual).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Static class members (referenced by external callers via mangled symbols) ─────────────
// @Helium __DATA:
//   __ZN31HGCanonLog2LinearizationLUTInfo1aE            @0x3d5160  =    0.122411586
//   __ZN31HGCanonLog2LinearizationLUTInfo1bE            @0x3d5168  =    0.035388128
//   __ZN31HGCanonLog2LinearizationLUTInfo1cE            @0x3d5170  =   87.09937546
//   __ZN31HGCanonLog2LinearizationLUTInfo12kMinLogGammaE @0x3d5178 =   -0.073059360730593603
//   __ZN31HGCanonLog2LinearizationLUTInfo12kMaxLogGammaE @0x3d5180 =    1.0947488584474885
//
// Values read via `python3 struct.unpack('<d', file_bytes[0x4000+VA:0x4000+VA+8])` on the
// Helium x86_64 slice. These are Canon's published C-Log2 curve constants.
export const HGCanonLog2LinearizationLUTInfo_a           =   0.122411586;                // @Helium __DATA 0x3d5160
export const HGCanonLog2LinearizationLUTInfo_b           =   0.035388127999999998;       // @Helium __DATA 0x3d5168
export const HGCanonLog2LinearizationLUTInfo_c           =  87.099375460000005;          // @Helium __DATA 0x3d5170
export const HGCanonLog2LinearizationLUTInfo_kMinLogGamma = -0.073059360730593603;       // @Helium __DATA 0x3d5178
export const HGCanonLog2LinearizationLUTInfo_kMaxLogGamma =  1.0947488584474885;         // @Helium __DATA 0x3d5180

// ── Recovered fp64 constants (inlined literal-pool duplicates of the statics above) ──────
// The `colorAtIndex` disasm loads its own __literal8 copies via RIP-relative offsets.
// Every constant has its RIP-target VA + effective double value.
const K_kMinLogGamma = -0.073059360730593603;   // @Helium __literal8 0x3d4aa8  (== static kMinLogGamma)
const K_b            =  0.035388127999999998;   // @Helium __literal8 0x3d4ab8  (== static b)
const K_neg_c        = -87.099375460000005;     // @Helium __literal8 0x3d4ad0  (== -static c)
const K_kMaxLogGamma =  1.0947488584474885;     // @Helium __literal8 0x3d4a98  (== static kMaxLogGamma)
const K_neg_b        = -0.035388127999999998;   // @Helium __literal8 0x3d4ac0  (== -static b)
const K_c            = 87.099375460000005;      // @Helium __literal8 0x3d4ac8  (== static c)
const K_a            =  0.122411586;            // @Helium __literal8 0x3d4ad8  (== static a)
const K_neg_one      = -1.0;                    // @Helium __literal8 0x3ca300

// Bit-pattern for 1.0f — the alpha write @0x113dc6 (`movl $0x3f800000, (%rbx)`).
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
 * LUTStorageFormat)` — the base-class C2 constructor.
 *   @Helium 0x113cb0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper ctor forces `unsigned long #2 = 1` via `movl $0x1, %edx` @0x113cab before
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
      "@Helium 0x113cb0 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x113d0a from
 * our own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x113d0a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x113d0a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x113cf4 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x113cf4  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * The port cannot faithfully re-implement Itanium RTTI without the full class hierarchy in
 * hand. The isEqual method below therefore raises through this stub for any non-null `other`,
 * mirroring the sibling HGAYCCToneCurveToLinearLUTInfo.ts decision.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x113cf4 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet. Do NOT weaken this by returning src as-is: " +
      "that would silently equate two different LUTInfo subclasses.",
  );
}

/**
 * `exp(x)` — libm scalar double-precision natural exponential. Called at @0x113da0 inside
 * `colorAtIndex`.
 *   @Helium 0x113da0  callq 0x3c50ea   ## symbol stub for: _exp
 *
 * Faithful to libm's fp64 semantics: JS `Math.exp` is IEEE-754 double natural exponential.
 */
function exp_libm(x: number): number {
  return Math.exp(x);
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGCanonLog2LinearizationLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x908fdc(%rip) — stored in TS as a class-level tag. */
  readonly __vtable = "HGCanonLog2LinearizationLUTInfo::vtable @Helium 0x908fdc";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x0000000000113ca0  (__ZN31HGCanonLog2LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog2LinearizationLUTInfo.HGCanonLog2LinearizationLUTInfo.s):
   *   0x113ca6  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x113ca8  movq %rdi, %rbx         → save `this` in rbx
   *   0x113cab  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x113cb0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x113cb5  leaq 0x908fdc(%rip), %rax → load class vtable pointer
   *   0x113cbc  movq %rax, (%rbx)       → this->vtable = HGCanonLog2LinearizationLUTInfo::vtable
   *   0x113cc5  retq
   */
  constructor(
    dim0: bigint,
    minF: number,
    maxF: number,
    storage: LUTStorageFormat,
  ) {
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    // @0x113cb0  base(this, dim0, 1, minF, maxF, storage) — base's layout not yet decoded,
    // so this raises. Preserve the demand signal here.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x0000000000113cd0  (__ZNK31HGCanonLog2LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog2LinearizationLUTInfo.isEqual.s):
   *   0x113cd6  testq %rsi, %rsi       → null-check `other`
   *   0x113cd9  je 0x113d0f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x113cdb  movq %rdi, %rbx        → save `this`
   *   0x113cde  movq 0x8ee5fb(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x113ce5  leaq __ZTI31HGCanonLog2LinearizationLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x113cec  movq %rsi, %rdi        → src = other
   *   0x113cef  movq %rax, %rsi        → srcTypeInfo
   *   0x113cf2  xorl %ecx, %ecx        → hint = 0
   *   0x113cf4  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x113cf9  testq %rax, %rax       → check result
   *   0x113cfc  je 0x113d0f            → if null (cast failed): return false
   *   0x113cfe  movq %rbx, %rdi        → this  (for the tail call)
   *   0x113d01  movq %rax, %rsi        → the successfully-cast `other`
   *   0x113d0a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGCanonLog2LinearizationLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class itself
   * contributes NO additional state to the comparison (there are no derived fields).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x113cd6-0x113cd9  null-check
    if (other === null) return false;
    // 0x113cf4  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HGCanonLog2LinearizationLUTInfo TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                          // srcTypeInfo (from %rip+0x8ee5fb)
      "HGCanonLog2LinearizationLUTInfo",              // dstTypeInfo (from %rip literal at @0x113ce5)
    );
    // 0x113cf9-0x113cfc  if cast failed → false
    if (cast === null) return false;
    // 0x113d0a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000113d20  (__ZNK31HGCanonLog2LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog2LinearizationLUTInfo.colorAtIndex.s):
   *   0x113d2f-0x113d3c  save %r8=A, %rcx=B, %rdx=G, %rsi=R  (output pointers)
   *   0x113d38  cvtss2sd %xmm0, %xmm1   → xmm1 = (double)r  (widen fp32 arg to fp64)
   *   0x113d3f  movsd @0x3d4aa8, %xmm2  → xmm2 = kMinLogGamma
   *   0x113d47  ucomisd %xmm1, %xmm2    → compare xmm2 vs xmm1 (AT&T src,dst; flags set as xmm2 vs xmm1)
   *   0x113d4b  jbe 0x113d63            → if kMinLogGamma <= x → jump to else-branch
   *   ── x < kMinLogGamma branch ──
   *   0x113d4d  movsd @0x3d4ab8, %xmm0  → xmm0 = b
   *   0x113d55  subsd %xmm2, %xmm0      → xmm0 = b - kMinLogGamma  (constant clamp num)
   *   0x113d59  movsd @0x3d4ad0, %xmm1  → xmm1 = -c                (constant clamp den)
   *   0x113d61  jmp 0x113d93            → go to shared exp-tail
   *   ── x >= kMinLogGamma branch ──
   *   0x113d63  movsd @0x3d4a98, %xmm0  → xmm0 = kMaxLogGamma       (for compare)
   *   0x113d6b  ucomisd %xmm0, %xmm1    → compare xmm0(=kMax) vs xmm1(=x)
   *   0x113d6f  ja 0x113d83             → if x > kMaxLogGamma → jump to upper-clamp branch
   *   0x113d71  ucomisd @0x3d4ab8, %xmm1 → compare @0x3d4ab8(=b) vs xmm1(=x)
   *   0x113d79  movapd %xmm1, %xmm0     → xmm0 = x
   *   0x113d7d  movapd %xmm1, %xmm2     → xmm2 = x
   *   0x113d81  jb 0x113d4d             → if x < b (unsigned-below) → re-enter x<kMin path
   *                                         with xmm0=x, xmm2=x → xmm0 = b - x, xmm1 = -c
   *   ── x >= b (fall-through) / x > kMax (jump target) ──
   *   0x113d83  addsd @0x3d4ac0, %xmm0  → xmm0 += -b
   *                                        (when fell through: xmm0=x → xmm0 = x - b)
   *                                        (when jumped from ja: xmm0=kMax → xmm0 = kMax - b)
   *   0x113d8b  movsd @0x3d4ac8, %xmm1  → xmm1 = +c
   *   ── shared exp-tail @0x113d93 ──
   *   0x113d93  movsd %xmm1, -0x28(%rbp) → save xmm1 (den) on stack
   *   0x113d98  divsd @0x3d4ad8, %xmm0  → xmm0 /= a  (i.e. xmm0 = num / a)
   *   0x113da0  callq _exp              → xmm0 = exp(num/a)
   *   0x113da5  addsd @0x3ca300, %xmm0  → xmm0 += -1  (i.e. exp(num/a) - 1)
   *   0x113dad  divsd -0x28(%rbp), %xmm0 → xmm0 /= saved-den
   *   0x113db2  cvtsd2ss %xmm0, %xmm0   → narrow fp64 → fp32
   *   0x113db6  movss %xmm0, (%r12)     → *R = y
   *   0x113dbc  movss %xmm0, (%r15)     → *G = y
   *   0x113dc1  movss %xmm0, (%r14)     → *B = y
   *   0x113dc6  movl $0x3f800000, (%rbx) → *A = 1.0f
   *   0x113dd8  retq
   *
   * NOTE: `ucomisd %xmm1, %xmm2` sets CF=(xmm2 < xmm1), ZF=(xmm2 == xmm1). `jbe` fires on
   * CF=1|ZF=1, i.e. jump when xmm2 <= xmm1, i.e. when kMinLogGamma <= x. So the fall-through
   * is exactly "x < kMinLogGamma" (strictly less; NaN takes the fall-through as well).
   *
   * `ucomisd %xmm0, %xmm1` at @0x113d6b: sets CF=(xmm1 < xmm0), so `ja` (CF=0 & ZF=0) fires
   * on "xmm1 > xmm0", i.e. x > kMaxLogGamma.
   *
   * `ucomisd mem, %xmm1` at @0x113d71: sets CF=(xmm1 < mem), so `jb` (CF=1) fires on
   * "xmm1 < mem", i.e. x < b.
   *
   * Only the first color-channel argument (`r`) is used; the other two (`g`, `b`) are
   * ignored by the disasm — the function evaluates a single scalar Canon Log 2 decode and
   * broadcasts the result to all three RGB output pointers, then writes alpha = 1.0f.
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
    // @0x113d38  widen fp32 → fp64. In JS all numbers are already fp64; the input `r` came
    // in as a fp32 (arg-register xmm0), so a preceding Math.fround captures the ss→sd step
    // (cvtss2sd on a genuine fp32 is exact).
    const x = Math.fround(r);   // fp32 arg exactly representable in fp64

    let num: number;
    let den: number;

    // @0x113d47 ucomisd + @0x113d4b jbe — jbe fires when kMin <= x (or unordered). So
    // fall-through is strictly x < kMin (non-NaN, below-min).
    if (x < K_kMinLogGamma) {
      // ── x < kMinLogGamma → lower clamp @0x113d4d..@0x113d61 ──
      num = K_b - K_kMinLogGamma;         // @0x113d4d..@0x113d55  xmm0 = b - kMin (constant)
      den = K_neg_c;                      // @0x113d59              xmm1 = -c
    } else {
      // @0x113d63 xmm0 = kMax
      // @0x113d6b ucomisd xmm0,xmm1 ; @0x113d6f ja → x > kMax
      if (x > K_kMaxLogGamma) {
        // ── x > kMaxLogGamma → upper clamp @0x113d83..@0x113d8b ──
        // The `ja` jump enters @0x113d83 with xmm0 still holding kMax from @0x113d63.
        num = K_kMaxLogGamma + K_neg_b;   // @0x113d83  addsd -b  → kMax + (-b) = kMax - b (constant)
        den = K_c;                        // @0x113d8b  xmm1 = +c
      } else {
        // kMin <= x <= kMax
        // @0x113d71 ucomisd b,xmm1 ; @0x113d79 xmm0=x ; @0x113d7d xmm2=x ; @0x113d81 jb → x < b
        if (x < K_b) {
          // ── kMin <= x < b → re-enters the x<kMin path @0x113d4d with xmm0=x, xmm2=x ──
          // @0x113d4d  xmm0 = b   (loaded from @0x3d4ab8)
          // @0x113d55  xmm0 -= xmm2  → xmm0 = b - x
          // @0x113d59  xmm1 = -c
          num = K_b - x;                  // @0x113d4d..@0x113d55  b - x
          den = K_neg_c;                  // @0x113d59              -c
        } else {
          // ── b <= x <= kMax → fall through into @0x113d83 with xmm0=x ──
          // @0x113d83  xmm0 += -b  → xmm0 = x - b
          // @0x113d8b  xmm1 = +c
          num = x + K_neg_b;              // @0x113d83  x + (-b) = x - b
          den = K_c;                      // @0x113d8b  +c
        }
      }
    }

    // ── shared exp-tail @0x113d93..@0x113dad ──
    // @0x113d98  xmm0 = num / a
    const q = num / K_a;                                     // @0x113d98  divsd a
    // @0x113da0  xmm0 = exp(xmm0)
    const e = exp_libm(q);                                   // @0x113da0  callq _exp
    // @0x113da5  xmm0 += -1
    const em1 = e + K_neg_one;                               // @0x113da5  addsd -1
    // @0x113dad  xmm0 /= den
    const y64 = em1 / den;                                   // @0x113dad  divsd saved-den
    // @0x113db2  cvtsd2ss narrows fp64 → fp32
    const y = Math.fround(y64);

    // @0x113db6-0x113dc6  store the same scalar to R/G/B and 1.0 to alpha.
    rOut.value = y;           // @0x113db6  movss %xmm0, (%r12)
    gOut.value = y;           // @0x113dbc  movss %xmm0, (%r15)
    bOut.value = y;           // @0x113dc1  movss %xmm0, (%r14)
    aOut.value = ALPHA_ONE;   // @0x113dc6  movl $0x3f800000, (%rbx)   (bit-pattern of 1.0f)
  }

  /**
   * ~HGCanonLog2LinearizationLUTInfo()  — the D1 (in-place) destructor.
   * @Helium 0x0000000000115810  (__ZN31HGCanonLog2LinearizationLUTInfoD1Ev)
   *
   * Per the class brief this is a trivial destructor (in-place, no-op). There is no
   * derived-class field owning ref-counted state, so ~HGCanonLog2… only needs to unwind
   * the stack frame; the compiler-generated D1 for the base sub-object is inlined-away.
   *
   * In TS with GC there is nothing to do; this method is kept for signature parity with the
   * C++ ABI shape.
   */
  destruct_D1(): void {
    // no-op @0x115810
  }

  /**
   * ~HGCanonLog2LinearizationLUTInfo()  — the D0 (deleting) destructor.
   * @Helium 0x0000000000115820  (__ZN31HGCanonLog2LinearizationLUTInfoD0Ev)
   *
   * DECODE (@0x115820-0x115825): `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv`
   *  → tail-calls `operator delete(this)`. Effectively "release memory".
   *
   * In TS with GC there is nothing to do; the method is kept as an ABI-shape placeholder.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x115825  → in TS this is a no-op under GC.
  }

  /**
   * duplicate() const  →  HGCanonLog2LinearizationLUTInfo*
   * @Helium 0x0000000000115830  (__ZNK31HGCanonLog2LinearizationLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog2LinearizationLUTInfo.duplicate.s):
   *   0x115836  movq %rdi, %rbx           → save `this`
   *   0x115839  movl $0x28, %edi          → allocation size = 0x28 (40 bytes = sizeof)
   *   0x11583e  callq __Znwm              → new(0x28)  → rax = new-obj
   *   0x115843  movups 0x8(%rbx), %xmm0   → load 16B from this+0x08 (bytes 0x08..0x17)
   *   0x115847  movups 0x14(%rbx), %xmm1  → load 16B from this+0x14 (bytes 0x14..0x23)
   *                                         NB: these two loads overlap by 4 bytes to cover
   *                                             the full 32-byte base sub-object (0x08..0x27)
   *                                             with 2× unaligned 16B ops.
   *   0x11584b  movups %xmm0, 0x8(%rax)   → store 16B at new-obj+0x08
   *   0x11584f  movups %xmm1, 0x14(%rax)  → store 16B at new-obj+0x14
   *   0x115853  leaq 0x90743e(%rip), %rcx → load class vtable pointer (same as ctor's target)
   *   0x11585a  movq %rcx, (%rax)         → new-obj->vtable = HGCanonLog2…::vtable
   *   0x115863  retq
   *
   * Semantics: creates a heap-allocated shallow-byte-copy of `this` — exact base sub-object
   * bytes are duplicated verbatim, then the derived-class vtable pointer is written on top.
   *
   * In TS we don't have byte-addressable memory. The faithful semantics is: return a new
   * HGCanonLog2LinearizationLUTInfo whose `base` field references the same underlying
   * HGApplyNDLUTInfo state (or a decoded copy thereof, once the base is transcribed).
   */
  duplicate(): HGCanonLog2LinearizationLUTInfo {
    // We can't invoke this class's own constructor here (it would call the base ctor stub
    // and raise). Faithful port: allocate a new instance without going through the ctor,
    // then copy the base handle bytes across (mirroring the two overlapping movups).
    const copy = Object.create(HGCanonLog2LinearizationLUTInfo.prototype) as HGCanonLog2LinearizationLUTInfo;
    // @0x115843-0x11584f: byte-copy of the base sub-object 0x08..0x27 (32B) — modeled as
    // a shared reference to the same opaque handle.
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x115853-0x11585a: vtable write — implicit in TS via `Object.create(...prototype)`.
    return copy;
  }
}

/**
 * Vtable-slot layout (recovered from ctor's `leaq 0x908fdc(%rip)` @0x113cb5 pointing at the
 * class's vtable in Helium __DATA_CONST). This class overrides at least:
 *   • ~D0/~D1  →  destruct_D0 / destruct_D1
 *   • isEqual   →  isEqual
 *   • duplicate →  duplicate
 *   • colorAtIndex → colorAtIndex
 * Other virtual slots (from HGApplyNDLUTInfo / HGLUTCache::LUTInfo) are inherited unchanged.
 *
 * The precise slot ordering isn't extracted here (it lives in the vtable RTTI and would
 * require another decode pass); see @__ZTV31HGCanonLog2LinearizationLUTInfo for the target.
 */
export const HGCanonLog2LinearizationLUTInfo_vtable_addr = "@Helium 0x908fdc" as const;
