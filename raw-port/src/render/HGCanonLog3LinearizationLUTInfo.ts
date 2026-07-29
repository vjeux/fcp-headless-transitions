// HGCanonLog3LinearizationLUTInfo.ts — FCP Helium HGCanonLog3LinearizationLUTInfo:
// Canon Log 3 (C-Log3) tone-curve → linear-light 1D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGCanonLog3LinearizationLUTInfo.*.s
//         (captured mangled symbols __ZN31HGCanonLog3LinearizationLUTInfo* starting at
//          x86_64 slice VA 0x113de0; static class constants at __DATA VA 0x3d51b0-0x3d51f0.)
//
// STRUCT LAYOUT (recovered from ctor @0x113de0 and duplicate @0x115890):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115899-0x11589e;
//   released via `__ZdlPv` in D0 @0x115885.
//     +0x00  vtable  (installed by ctor @0x113df5-0x113dfc:
//                     `leaq 0x908eec(%rip),%rax ; movq %rax,(%rbx)` — the sole class-specific
//                     write; all other 32 bytes of state live in the HGApplyNDLUTInfo base
//                     sub-object installed by the C2 base ctor @0x113df0.)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x113deb — meaning this descriptor represents a
//                     1-dimensional LUT.)
//
// EXPORTED SYMBOLS (six member functions — from the class brief):
//   @Helium 0x0000000000113de0  ctor  (unsigned long, float, float, LUTStorageFormat)
//   @Helium 0x0000000000113e10  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000113e60  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115870  D1  (~HGCanonLog3LinearizationLUTInfo — trivial no-op)
//   @Helium 0x0000000000115880  D0  (deleting, tail-calls operator delete)
//   @Helium 0x0000000000115890  duplicate() const  →  a new heap-allocated copy
//
// COLD-PATH THUNKS (Itanium-ABI static-local guarded initialization — .cold.N):
//   @Helium 0x00000000003c3e00  colorAtIndex.cold.1  → initialises static-local `t1` = 0.04076162008408123
//   @Helium 0x00000000003c3e40  colorAtIndex.cold.2  → initialises static-local `t2` = 0.10535710191591878
//   @Helium 0x00000000003c3e80  colorAtIndex.cold.3  → initialises static-local `aa` = 5.368593652031848
//   The compiler emitted `t1/t2/aa` as function-scope statics rather than reading them from
//   the class __DATA globals — but the raw bit-patterns match Canon's published curve.
//   Guard-variable symbols:
//     __ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndex...E2t1  @0xade118
//     __ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndex...E2t2  @0xade128
//     __ZGVZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndex...E2aa  @0xade138
//   Value symbols (fp64 doubles):
//     __ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndex...E2t1    @0xade110
//     __ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndex...E2t2    @0xade120
//     __ZZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndex...E2aa    @0xade130
//   Immediate values written by cold thunks:
//     cold.1 @0x3c3e14  movabsq $0x3fa4deb50262debf → t1 = 0.04076162008408123
//     cold.2 @0x3c3e54  movabsq $0x3fbaf8aedb215573 → t2 = 0.10535710191591878
//     cold.3 @0x3c3e94  movabsq $0x401579709d43f5c0 → aa = 5.368593652031848
//
// STATIC CLASS CONSTANTS (Helium __DATA at file-offset 0x4000 + VA):
//   __ZN31HGCanonLog3LinearizationLUTInfo1aE             @0x3d51b0 =  0.42889912
//   __ZN31HGCanonLog3LinearizationLUTInfo2bnE            @0x3d51b8 =  0.07623209
//   __ZN31HGCanonLog3LinearizationLUTInfo2bpE            @0x3d51c0 =  0.069886632
//   __ZN31HGCanonLog3LinearizationLUTInfo1cE             @0x3d51c8 = 14.98325
//   __ZN31HGCanonLog3LinearizationLUTInfo1mE             @0x3d51d0 =  2.3069815
//   __ZN31HGCanonLog3LinearizationLUTInfo1bE             @0x3d51d8 =  0.073059361
//   __ZN31HGCanonLog3LinearizationLUTInfo1tE             @0x3d51e0 =  0.014
//   __ZN31HGCanonLog3LinearizationLUTInfo12kMinLogGammaE @0x3d51e8 = -0.0730593607305936
//   __ZN31HGCanonLog3LinearizationLUTInfo12kMaxLogGammaE @0x3d51f0 =  1.0947488584474885
//
//   These are Canon's published Canon Log 3 constants: a=0.42889912, bn/bp are the two
//   "b" break-point offsets for the negative and positive log tails, c=14.98325 is the
//   log-scale, m=2.3069815 is the middle-linear slope reciprocal, b=0.073059361 is the
//   linear-region offset, t=0.014 is the parameter-space break, and kMin/kMax bracket
//   the encoded log-value range.
//
// SEMANTICS (from colorAtIndex disasm @0x113e60-0x113f78):
//   Canon Log 3 → linear is a 3-piece PIECEWISE curve applied identically to every channel
//   of the incoming sample (only the first argument matters — R=G=B is written on all three
//   output pointers, and alpha is set to 1.0f). The 3 pieces are:
//     • x < t1  (lower log tail):   y = -( exp((bn - x) * aa) - 1 ) / c
//     • t1<= x <= t2  (middle):     y = (x - b) / m
//     • x > t2  (upper log tail):   y =  ( exp((x - bp) * aa) - 1 ) / c
//   BEFORE the piecewise dispatch, x is CLAMPED into [kMinLogGamma, kMaxLogGamma]:
//     • x < kMin → x_clamped = kMin  (via jump-to-common tail with xmm0 still = kMin)
//     • x > kMax → x_clamped = kMax
//     • kMin <= x <= kMax → x_clamped = x
//   The three static-local break-points `t1, t2, aa` are Canon Log 3's published curve
//   parameters, emitted as guarded statics by the compiler — the bit-patterns match Canon's
//   spec exactly. See the cold-path thunks above for their init sequence.
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x113df0.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x113e4a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x113e34.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x11589e / @0x115885).
//   • _exp — libm scalar double-precision natural exponential — called @0x113ef6 and @0x113f2b.
//   • __cxa_guard_acquire / __cxa_guard_release — Itanium guarded-init helpers called from
//     the .cold.N thunks; captured as compile-time initialisation in JS (values known).
//
// The vtable slot at @0x908eec(%rip) (from @0x113df5) is the class's own vtable — its
// member pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus the base's virtual slots)
// are installed by the linker; they are treated here as the class's method table.
//
// SIBLING PATTERN: this file mirrors HGCanonLog2LinearizationLUTInfo.ts exactly — same
// vtable-only derived state, same 6-symbol ABI, same isEqual/duplicate/dtor pattern. The
// two differ only in the colorAtIndex math (2-piece log for C-Log2, 3-piece for C-Log3)
// and their static constant values.

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. All accessor state that
 * a descriptor subclass observes lives in this base; the derived class merely swaps the
 * vtable pointer. This is the same opaque-handle pattern used by HGDitherLUTInfo.ts,
 * HGColorGammaLUTInfo.ts, and HGCanonLog2LinearizationLUTInfo.ts — the shared future task
 * is a single canonical HGApplyNDLUTInfo port.
 *
 * @Helium 0x113df0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *   (base C2 ctor called by our ctor with args (this, unsigned long, 1, float, float,
 *    LUTStorageFormat) — the second `unsigned long` is our wrapper's fixed 1 (@0x113deb).)
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
 * `isEqual` @0x113e34; see the throwing stub below.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x113e1e inside isEqual).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Static class members (referenced by external callers via mangled symbols) ─────────────
// @Helium __DATA:
//   __ZN31HGCanonLog3LinearizationLUTInfo1aE             @0x3d51b0 =  0.42889912
//   __ZN31HGCanonLog3LinearizationLUTInfo2bnE            @0x3d51b8 =  0.07623209
//   __ZN31HGCanonLog3LinearizationLUTInfo2bpE            @0x3d51c0 =  0.069886632
//   __ZN31HGCanonLog3LinearizationLUTInfo1cE             @0x3d51c8 = 14.98325
//   __ZN31HGCanonLog3LinearizationLUTInfo1mE             @0x3d51d0 =  2.3069815
//   __ZN31HGCanonLog3LinearizationLUTInfo1bE             @0x3d51d8 =  0.073059361
//   __ZN31HGCanonLog3LinearizationLUTInfo1tE             @0x3d51e0 =  0.014
//   __ZN31HGCanonLog3LinearizationLUTInfo12kMinLogGammaE @0x3d51e8 = -0.0730593607305936
//   __ZN31HGCanonLog3LinearizationLUTInfo12kMaxLogGammaE @0x3d51f0 =  1.0947488584474885
//
// Values read via `python3 struct.unpack('<d', file_bytes[VA:VA+8])` on the Helium x86_64
// slice (FAT-slice VA==offset). These are Canon's published C-Log3 curve constants.
export const HGCanonLog3LinearizationLUTInfo_a            =   0.42889912;                 // @Helium __DATA 0x3d51b0
export const HGCanonLog3LinearizationLUTInfo_bn           =   0.07623209;                 // @Helium __DATA 0x3d51b8
export const HGCanonLog3LinearizationLUTInfo_bp           =   0.069886632;                // @Helium __DATA 0x3d51c0
export const HGCanonLog3LinearizationLUTInfo_c            =  14.98325;                    // @Helium __DATA 0x3d51c8
export const HGCanonLog3LinearizationLUTInfo_m            =   2.3069815;                  // @Helium __DATA 0x3d51d0
export const HGCanonLog3LinearizationLUTInfo_b            =   0.073059361;                // @Helium __DATA 0x3d51d8
export const HGCanonLog3LinearizationLUTInfo_t            =   0.014;                      // @Helium __DATA 0x3d51e0
export const HGCanonLog3LinearizationLUTInfo_kMinLogGamma = -0.0730593607305936;          // @Helium __DATA 0x3d51e8
export const HGCanonLog3LinearizationLUTInfo_kMaxLogGamma =  1.0947488584474885;          // @Helium __DATA 0x3d51f0

// ── Function-scope static locals (compiler-emitted guarded init; see cold.1/2/3 above) ────
// These break-point / scaling constants are emitted as static locals inside `colorAtIndex`
// via the Itanium guarded-init ABI (__cxa_guard_acquire / __cxa_guard_release). We treat
// them as compile-time initialised in TS (the guarded-init exists only to defer computation
// until first call; the values themselves are hard-coded bit-patterns).
//
// t1 — lower log-region break-point in encoded space (below this, use the -exp/-c tail).
//   @Helium __DATA 0xade110  (static-local `t1`)
//   Initialised @0x3c3e14  movabsq $0x3fa4deb50262debf, %rax
const K_t1 = 0.04076162008408123;   // == reinterpret_cast<double>(0x3fa4deb50262debf)

// t2 — upper log-region break-point in encoded space (above this, use the +exp/+c tail).
//   @Helium __DATA 0xade120  (static-local `t2`)
//   Initialised @0x3c3e54  movabsq $0x3fbaf8aedb215573, %rax
const K_t2 = 0.10535710191591878;   // == reinterpret_cast<double>(0x3fbaf8aedb215573)

// aa — log-region argument scale for the exp() calls; equals c * ln(10) in Canon's log10
//   form, since the disasm uses natural exp with a pre-scaled coefficient.
//   @Helium __DATA 0xade130  (static-local `aa`)
//   Initialised @0x3c3e94  movabsq $0x401579709d43f5c0, %rax
const K_aa = 5.368593652031848;     // == reinterpret_cast<double>(0x401579709d43f5c0)

// ── Recovered fp64 constants (inlined literal-pool copies of the class statics) ──────────
// The `colorAtIndex` disasm loads its own __literal8 copies via RIP-relative offsets.
// Every constant has its RIP-target VA + effective double value.
const K_kMinLogGamma = -0.0730593607305936;    // @Helium __literal8 0x3d4aa8  (== static kMinLogGamma; note the truncation vs 0x3d51e8 is bit-identical)
const K_kMaxLogGamma =  1.0947488584474885;    // @Helium __literal8 0x3d4a98  (== static kMaxLogGamma)
const K_bn           =  0.07623209;            // @Helium __literal8 0x3d4b00  (== static bn)
const K_neg_c        = -14.98325;              // @Helium __literal8 0x3d4b08  (== -static c)
const K_neg_bp       = -0.069886632;           // @Helium __literal8 0x3d4af0  (== -static bp)
const K_c            = 14.98325;               // @Helium __literal8 0x3d4af8  (== +static c)
const K_neg_b        = -0.073059361;           // @Helium __literal8 0x3d4ae0  (== -static b)
const K_m            =  2.3069815;             // @Helium __literal8 0x3d4ae8  (== static m)
const K_neg_one      = -1.0;                   // @Helium __literal8 0x3ca300

// Bit-pattern for 1.0f — the alpha write @0x113f66 (`movl $0x3f800000, (%rbx)`).
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
 * LUTStorageFormat)` — the base-class C2 constructor.
 *   @Helium 0x113df0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper ctor forces `unsigned long #2 = 1` via `movl $0x1, %edx` @0x113deb before
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
      "@Helium 0x113df0 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x113e4a from
 * our own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x113e4a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x113e4a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x113e34 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x113e34  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * The port cannot faithfully re-implement Itanium RTTI without the full class hierarchy in
 * hand. The isEqual method below therefore raises through this stub for any non-null `other`,
 * mirroring the sibling HGCanonLog2LinearizationLUTInfo.ts decision.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x113e34 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet. Do NOT weaken this by returning src as-is: " +
      "that would silently equate two different LUTInfo subclasses.",
  );
}

/**
 * `exp(x)` — libm scalar double-precision natural exponential. Called at @0x113ef6 and
 * @0x113f2b inside `colorAtIndex`.
 *   @Helium 0x113ef6  callq 0x3c50ea   ## symbol stub for: _exp   (lower-tail branch)
 *   @Helium 0x113f2b  callq 0x3c50ea   ## symbol stub for: _exp   (upper-tail branch)
 *
 * Faithful to libm's fp64 semantics: JS `Math.exp` is IEEE-754 double natural exponential.
 */
function exp_libm(x: number): number {
  return Math.exp(x);
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGCanonLog3LinearizationLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x908eec(%rip) — stored in TS as a class-level tag. */
  readonly __vtable = "HGCanonLog3LinearizationLUTInfo::vtable @Helium 0x908eec";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x0000000000113de0  (__ZN31HGCanonLog3LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog3LinearizationLUTInfo.HGCanonLog3LinearizationLUTInfo.s):
   *   0x113de6  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x113de8  movq %rdi, %rbx         → save `this` in rbx
   *   0x113deb  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x113df0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x113df5  leaq 0x908eec(%rip), %rax → load class vtable pointer
   *                                        (target 0xa1cce8 = __ZTV31HGCanonLog3…+0x10)
   *   0x113dfc  movq %rax, (%rbx)       → this->vtable = HGCanonLog3LinearizationLUTInfo::vtable
   *   0x113e05  retq
   */
  constructor(
    dim0: bigint,
    minF: number,
    maxF: number,
    storage: LUTStorageFormat,
  ) {
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    // @0x113df0  base(this, dim0, 1, minF, maxF, storage) — base's layout not yet decoded,
    // so this raises. Preserve the demand signal here.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x0000000000113e10  (__ZNK31HGCanonLog3LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog3LinearizationLUTInfo.isEqual.s):
   *   0x113e16  testq %rsi, %rsi       → null-check `other`
   *   0x113e19  je 0x113e4f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x113e1b  movq %rdi, %rbx        → save `this`
   *   0x113e1e  movq 0x8ee4bb(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x113e25  leaq __ZTI31HGCanonLog3LinearizationLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x113e2c  movq %rsi, %rdi        → src = other
   *   0x113e2f  movq %rax, %rsi        → srcTypeInfo
   *   0x113e32  xorl %ecx, %ecx        → hint = 0
   *   0x113e34  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x113e39  testq %rax, %rax       → check result
   *   0x113e3c  je 0x113e4f            → if null (cast failed): return false
   *   0x113e3e  movq %rbx, %rdi        → this  (for the tail call)
   *   0x113e41  movq %rax, %rsi        → the successfully-cast `other`
   *   0x113e4a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGCanonLog3LinearizationLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class itself
   * contributes NO additional state to the comparison (there are no derived fields).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x113e16-0x113e19  null-check
    if (other === null) return false;
    // 0x113e34  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HGCanonLog3LinearizationLUTInfo TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                          // srcTypeInfo (from %rip+0x8ee4bb)
      "HGCanonLog3LinearizationLUTInfo",              // dstTypeInfo (from %rip literal at @0x113e25)
    );
    // 0x113e39-0x113e3c  if cast failed → false
    if (cast === null) return false;
    // 0x113e4a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000113e60  (__ZNK31HGCanonLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog3LinearizationLUTInfo.colorAtIndex.s):
   *   Static-local guards (@0x113e7b-0x113ea2): check t1/t2/aa initialised — cold-path
   *   thunks .cold.1/.cold.2/.cold.3 run once each on first call to initialise the three
   *   constants. Guard-variable and value symbols documented in the file header.
   *
   *   ── Clamp x into [kMin, kMax] ──
   *   0x113ea8  cvtss2sd %xmm0, %xmm1   → xmm1 = (double)r  (widen fp32 arg to fp64)
   *   0x113eac  movsd @0x3d4aa8, %xmm0  → xmm0 = kMinLogGamma
   *   0x113eb4  ucomisd %xmm1, %xmm0    → compare xmm0(=kMin) vs xmm1(=x)
   *   0x113eb8  ja 0x113ed0             → if kMin > x (x < kMin) → jump with xmm0=kMin (lower clamp)
   *   0x113eba  ucomisd @0x3d4a98, %xmm1 → compare @0x3d4a98(=kMax) vs xmm1(=x); flags: xmm1 vs kMax
   *   0x113ec2  movapd %xmm1, %xmm0     → xmm0 = x
   *   0x113ec6  jbe 0x113ed0            → if x <= kMax → jump with xmm0=x (no clamp)
   *   0x113ec8  movsd @0x3d4a98, %xmm0  → xmm0 = kMax  (x > kMax; upper clamp)
   *
   *   ── Piecewise dispatch on x_clamped in xmm0 ──
   *   0x113ed0  movsd t1(=0.04076...), %xmm1   → xmm1 = t1
   *   0x113ed8  ucomisd %xmm0, %xmm1           → flags: xmm1(=t1) vs xmm0(=x_clamped)
   *   0x113edc  jbe 0x113f0d                   → if t1 <= x_clamped → jump to middle/upper
   *
   *   ── Branch 1: x_clamped < t1  (lower log tail) @0x113ede..0x113f0b ──
   *   0x113ede  movsd @0x3d4b00, %xmm1      → xmm1 = bn (=0.07623209)
   *   0x113ee6  subsd %xmm0, %xmm1          → xmm1 = bn - x_clamped
   *   0x113eea  mulsd aa(=5.368...), %xmm1  → xmm1 = (bn - x_clamped) * aa
   *   0x113ef2  movapd %xmm1, %xmm0         → xmm0 = arg
   *   0x113ef6  callq _exp                  → xmm0 = exp(arg)
   *   0x113efb  addsd @0x3ca300, %xmm0      → xmm0 += -1  → exp(arg) - 1
   *   0x113f03  divsd @0x3d4b08, %xmm0      → xmm0 /= -c  → (exp(arg) - 1) / -c
   *   0x113f0b  jmp 0x113f52
   *
   *   ── Middle / upper dispatch @0x113f0d..0x113f19 ──
   *   0x113f0d  movsd t2(=0.10535...), %xmm1 → xmm1 = t2
   *   0x113f15  ucomisd %xmm0, %xmm1         → flags: xmm1(=t2) vs xmm0(=x_clamped)
   *   0x113f19  jae 0x113f42                 → if t2 >= x_clamped (x_clamped <= t2) → middle
   *
   *   ── Branch 3: x_clamped > t2  (upper log tail) @0x113f1b..0x113f40 ──
   *   0x113f1b  addsd @0x3d4af0, %xmm0     → xmm0 += -bp  → x_clamped - bp
   *   0x113f23  mulsd aa, %xmm0            → xmm0 *= aa  → (x_clamped - bp) * aa
   *   0x113f2b  callq _exp                 → xmm0 = exp(arg)
   *   0x113f30  addsd @0x3ca300, %xmm0     → xmm0 += -1  → exp(arg) - 1
   *   0x113f38  divsd @0x3d4af8, %xmm0     → xmm0 /= c  → (exp(arg) - 1) / c
   *   0x113f40  jmp 0x113f52
   *
   *   ── Branch middle: t1 <= x_clamped <= t2  (linear region) @0x113f42..0x113f50 ──
   *   0x113f42  addsd @0x3d4ae0, %xmm0     → xmm0 += -b  → x_clamped - b
   *   0x113f4a  divsd @0x3d4ae8, %xmm0     → xmm0 /= m  → (x_clamped - b) / m
   *
   *   ── Store to R/G/B and 1.0 to alpha ──
   *   0x113f52  cvtsd2ss %xmm0, %xmm0      → narrow fp64 → fp32
   *   0x113f56  movss %xmm0, (%r12)        → *R = y
   *   0x113f5c  movss %xmm0, (%r15)        → *G = y
   *   0x113f61  movss %xmm0, (%r14)        → *B = y
   *   0x113f66  movl $0x3f800000, (%rbx)   → *A = 1.0f
   *   0x113f78  retq
   *
   * FLAG NOTES:
   *   • `ucomisd %xmm1, %xmm0` at 0x113eb4: sets CF=(xmm0 < xmm1), so `ja` (CF=0 & ZF=0)
   *     fires on "xmm0 > xmm1", i.e. kMin > x, i.e. x < kMin (strictly).
   *   • `ucomisd mem, %xmm1` at 0x113eba: sets CF=(xmm1 < mem), so `jbe` (CF=1 | ZF=1)
   *     fires on "xmm1 <= mem", i.e. x <= kMax.
   *   • `ucomisd %xmm0, %xmm1` at 0x113ed8: sets CF=(xmm1 < xmm0), so `jbe` fires on
   *     "xmm1 <= xmm0", i.e. t1 <= x_clamped.
   *   • `ucomisd %xmm0, %xmm1` at 0x113f15: sets CF=(xmm1 < xmm0), so `jae` (CF=0) fires
   *     on "xmm1 >= xmm0", i.e. t2 >= x_clamped.
   *   • NaN inputs: `ucomisd` sets ZF=CF=PF=1 (unordered), so NaN flows through:
   *       - @0x113eb8 ja: NaN → CF=1, so ja NOT taken (fall through)
   *       - @0x113ec6 jbe: NaN → CF=1|ZF=1, so jbe TAKEN with xmm0 = NaN (from movapd xmm1→xmm0)
   *       - @0x113edc jbe: NaN → jbe TAKEN, enters middle/upper dispatch with xmm0 = NaN
   *       - @0x113f19 jae: NaN → CF=1 (unordered), so jae NOT taken → upper-tail branch
   *     Net: NaN follows the "upper log tail" branch and produces exp((NaN - bp) * aa) − 1) / c,
   *     which propagates NaN. This is intentional binary behaviour.
   *
   * Only the first color-channel argument (`r`) is used; the other two (`g`, `b`) are
   * ignored by the disasm — the function evaluates a single scalar Canon Log 3 decode and
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
    // @0x113ea8  widen fp32 → fp64 (input `r` came in as fp32 arg-register xmm0).
    const x = Math.fround(r);   // fp32 arg exactly representable in fp64

    // ── Clamp x into [kMin, kMax] ── @0x113eac-0x113ec8 ──
    // Use !== NaN-ordered comparisons to mirror ucomisd's unordered-taken-as-not-taken
    // behaviour for ja and its fall-through into jbe on NaN.
    let xClamped: number;
    if (K_kMinLogGamma > x) {
      // @0x113eb8 ja taken: xmm0 = kMin still (from @0x113eac). Note: NaN takes fall-through.
      xClamped = K_kMinLogGamma;
    } else {
      // @0x113ec2 xmm0 = x
      // @0x113ec6 jbe: taken if x <= kMax OR unordered (NaN). If not taken (x > kMax) → clamp.
      if (x <= K_kMaxLogGamma) {
        xClamped = x;   // includes NaN via unordered→jbe-taken (x may still be NaN here)
      } else {
        xClamped = K_kMaxLogGamma;   // @0x113ec8  xmm0 = kMax
      }
    }
    // Recover NaN propagation: when x is NaN, all the ucomisd branches above take the
    // "unordered" path, and xClamped ends up == x == NaN (the middle jbe path).
    // Rewriting the JS above with `x <= K_kMaxLogGamma` — for x=NaN this is `false`, so
    // we'd wrongly clamp NaN to kMax. Fix: guard NaN → keep as-is.
    if (Number.isNaN(x)) xClamped = x;

    // ── Piecewise dispatch on xClamped ── @0x113ed0-0x113f4a ──
    let y64: number;
    if (K_t1 > xClamped) {
      // @0x113edc jbe NOT taken → x_clamped < t1 → lower log tail.
      // @0x113ede-0x113f03  y = (exp((bn - x_clamped) * aa) - 1) / -c
      const arg = (K_bn - xClamped) * K_aa;    // @0x113ede subsd + @0x113eea mulsd
      const e = exp_libm(arg);                  // @0x113ef6 callq _exp
      const em1 = e + K_neg_one;                // @0x113efb addsd -1
      y64 = em1 / K_neg_c;                      // @0x113f03 divsd -c
    } else {
      // @0x113edc jbe taken: t1 <= x_clamped. Middle/upper dispatch.
      if (K_t2 >= xClamped) {
        // @0x113f19 jae taken: t2 >= x_clamped → middle linear region.
        // @0x113f42-0x113f4a  y = (x_clamped - b) / m
        const num = xClamped + K_neg_b;         // @0x113f42 addsd -b  (x_clamped - b)
        y64 = num / K_m;                        // @0x113f4a divsd m
      } else {
        // @0x113f19 jae NOT taken: x_clamped > t2 → upper log tail.
        // @0x113f1b-0x113f38  y = (exp((x_clamped - bp) * aa) - 1) / c
        const arg = (xClamped + K_neg_bp) * K_aa;  // @0x113f1b addsd -bp + @0x113f23 mulsd aa
        const e = exp_libm(arg);                    // @0x113f2b callq _exp
        const em1 = e + K_neg_one;                  // @0x113f30 addsd -1
        y64 = em1 / K_c;                            // @0x113f38 divsd c
      }
    }

    // @0x113f52  cvtsd2ss narrows fp64 → fp32
    const y = Math.fround(y64);

    // @0x113f56-0x113f66  store the same scalar to R/G/B and 1.0 to alpha.
    rOut.value = y;           // @0x113f56  movss %xmm0, (%r12)
    gOut.value = y;           // @0x113f5c  movss %xmm0, (%r15)
    bOut.value = y;           // @0x113f61  movss %xmm0, (%r14)
    aOut.value = ALPHA_ONE;   // @0x113f66  movl $0x3f800000, (%rbx)   (bit-pattern of 1.0f)
  }

  /**
   * ~HGCanonLog3LinearizationLUTInfo()  — the D1 (in-place) destructor.
   * @Helium 0x0000000000115870  (__ZN31HGCanonLog3LinearizationLUTInfoD1Ev)
   *
   * Per the class brief this is a trivial destructor (in-place, no-op). There is no
   * derived-class field owning ref-counted state, so ~HGCanonLog3… only needs to unwind
   * the stack frame; the compiler-generated D1 for the base sub-object is inlined-away.
   *
   * In TS with GC there is nothing to do; this method is kept for signature parity with the
   * C++ ABI shape.
   */
  destruct_D1(): void {
    // no-op @0x115870
  }

  /**
   * ~HGCanonLog3LinearizationLUTInfo()  — the D0 (deleting) destructor.
   * @Helium 0x0000000000115880  (__ZN31HGCanonLog3LinearizationLUTInfoD0Ev)
   *
   * DECODE (@0x115880-0x115885): `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv`
   *  → tail-calls `operator delete(this)`. Effectively "release memory".
   *
   * In TS with GC there is nothing to do; the method is kept as an ABI-shape placeholder.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x115885  → in TS this is a no-op under GC.
  }

  /**
   * duplicate() const  →  HGCanonLog3LinearizationLUTInfo*
   * @Helium 0x0000000000115890  (__ZNK31HGCanonLog3LinearizationLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLog3LinearizationLUTInfo.duplicate.s):
   *   0x115896  movq %rdi, %rbx           → save `this`
   *   0x115899  movl $0x28, %edi          → allocation size = 0x28 (40 bytes = sizeof)
   *   0x11589e  callq __Znwm              → new(0x28)  → rax = new-obj
   *   0x1158a3  movups 0x8(%rbx), %xmm0   → load 16B from this+0x08 (bytes 0x08..0x17)
   *   0x1158a7  movups 0x14(%rbx), %xmm1  → load 16B from this+0x14 (bytes 0x14..0x23)
   *                                         NB: these two loads overlap by 4 bytes to cover
   *                                             the full 32-byte base sub-object (0x08..0x27)
   *                                             with 2× unaligned 16B ops.
   *   0x1158ab  movups %xmm0, 0x8(%rax)   → store 16B at new-obj+0x08
   *   0x1158af  movups %xmm1, 0x14(%rax)  → store 16B at new-obj+0x14
   *   0x1158b3  leaq 0x90742e(%rip), %rcx → load class vtable pointer (same as ctor's target)
   *   0x1158ba  movq %rcx, (%rax)         → new-obj->vtable = HGCanonLog3…::vtable
   *   0x1158c3  retq
   *
   * Semantics: creates a heap-allocated shallow-byte-copy of `this` — exact base sub-object
   * bytes are duplicated verbatim, then the derived-class vtable pointer is written on top.
   *
   * In TS we don't have byte-addressable memory. The faithful semantics is: return a new
   * HGCanonLog3LinearizationLUTInfo whose `base` field references the same underlying
   * HGApplyNDLUTInfo state (or a decoded copy thereof, once the base is transcribed).
   */
  duplicate(): HGCanonLog3LinearizationLUTInfo {
    // We can't invoke this class's own constructor here (it would call the base ctor stub
    // and raise). Faithful port: allocate a new instance without going through the ctor,
    // then copy the base handle bytes across (mirroring the two overlapping movups).
    const copy = Object.create(HGCanonLog3LinearizationLUTInfo.prototype) as HGCanonLog3LinearizationLUTInfo;
    // @0x1158a3-0x1158af: byte-copy of the base sub-object 0x08..0x27 (32B) — modeled as
    // a shared reference to the same opaque handle.
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x1158b3-0x1158ba: vtable write — implicit in TS via `Object.create(...prototype)`.
    return copy;
  }
}

/**
 * Vtable-slot layout (recovered from ctor's `leaq 0x908eec(%rip)` @0x113df5 pointing at the
 * class's vtable in Helium __DATA_CONST at 0xa1cce8). This class overrides at least:
 *   • ~D0/~D1  →  destruct_D0 / destruct_D1
 *   • isEqual   →  isEqual
 *   • duplicate →  duplicate
 *   • colorAtIndex → colorAtIndex
 * Other virtual slots (from HGApplyNDLUTInfo / HGLUTCache::LUTInfo) are inherited unchanged.
 *
 * The precise slot ordering isn't extracted here (it lives in the vtable RTTI and would
 * require another decode pass); see @__ZTV31HGCanonLog3LinearizationLUTInfo for the target.
 */
export const HGCanonLog3LinearizationLUTInfo_vtable_addr = "@Helium 0x908eec" as const;
