// HGLinearToAYCCToneCurveLUTInfo.ts — FCP Helium HGLinearToAYCCToneCurveLUTInfo:
// Linear-light → AYCC (Sony S-Log wide-gamut YCC) tone-curve 1D LUT descriptor.
// The INVERSE of HGAYCCToneCurveToLinearLUTInfo (same 8 constants at the same __literal8
// VAs; branch shape mirrors AYCC-decode with pow-exponents swapped for their reciprocals
// 1/2.2 = 0.4545… and 1/1.9560… = 0.5112…).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGLinearToAYCCToneCurveLUTInfo.*.s
//         (captured mangled symbols __ZN30HGLinearToAYCCToneCurveLUTInfo* starting at
//          x86_64 slice VA 0x1151e0.)
//
// STRUCT LAYOUT (recovered from ctor @0x1151e0 and duplicate @0x115d10):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115d19-0x115d1e;
//   released via `__ZdlPv` in D0 @0x115d05.
//     +0x00  vtable  (installed by ctor @0x1151f5-0x1151fc:
//                     `leaq 0x907eac(%rip),%rax ; movq %rax,(%rbx)` — the sole class-specific
//                     write; all other 32 bytes of state live in the HGApplyNDLUTInfo base
//                     sub-object installed by the C2 base ctor @0x1151f0.)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x1151eb — meaning this descriptor represents a
//                     1-dimensional LUT.)
//
// EXPORTED SYMBOLS (six member functions):
//   @Helium 0x00000000001151e0  ctor  (unsigned long, float, float, LUTStorageFormat)
//   @Helium 0x0000000000115210  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000115260  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115cf0  D1  (~HGLinearToAYCCToneCurveLUTInfo — in-place, trivial)
//   @Helium 0x0000000000115d00  D0  (deleting, tail-calls operator delete)
//   @Helium 0x0000000000115d10  duplicate() const  →  a new heap-allocated copy
//
// SEMANTICS (from colorAtIndex disasm @0x115260-0x1152f4):
//   The linear → AYCC transfer function is a three-segment piecewise curve applied
//   identically to every channel of the incoming grayscale sample (only the first argument
//   matters — R=G=B is written on all three output pointers, and alpha is set to 1.0f):
//
//     f(x) = x >= 0                                                    ┐  @0x11527a ucomiss 0
//              ? { x <= 1.0                                            │  @0x11529e ucomiss 1
//                    ? // pow-segment (inverse of AYCC-decode upper-log via 1/1.956)
//                      pow(x, 0.5112474560737610)                      │  @0x1152c9..@0x1152d1
//                    : // upper-linear extension (inverse linear)
//                      ((x + (-1.0)) * 0.08 / 0.225) + 1.0             │  @0x1152a7..@0x1152bf
//                }
//              : // inverse lower-log (inverse of AYCC-decode negative branch)
//                pow(x / -0.225, 0.4545454382896423) * -0.08           │  @0x11527f..@0x115294
//
//   The RIP-relative float constants (recovered via Python on the Helium x86_64 slice at
//   file-offset 0x4000+VA) — MOST of them are the very same __literal8 slots the AYCC-
//   decode file references, sharing the __TEXT literal pool:
//     @0x3d49e0 = +0.22499999403953552  (upper-linear slope divisor)
//     @0x3d49e4 = +0.07999999821186066  (upper-linear multiplier)
//     @0x3d49e8 = -0.07999999821186066  (lower-log post-pow scale)
//     @0x3d49f0 = -0.22499999403953552  (lower-log input divisor)
//     @0x3d49f4 = +0.45454543828964233  (lower-log pow exponent — 1/2.2 fp32)
//     @0x3c7cc0 = +1.0                  (linear-segment breakpoint and additive)
//     @0x3ca110 = -1.0                  (linear-segment origin shift)
//     @0x3d0fb8 = +0.51124745607376099  (upper pow exponent — 1/1.956 fp32)
//
//   The three output pointers %r12 (=r), %r15 (=g), %r14 (=b) are all written with the same
//   value from %xmm0; the alpha pointer %rbx is written the raw i32 0x3f800000 (== 1.0f).
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x1151f0.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x11524a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x115234.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x115d1e / @0x115d05).
//   • _powf — libm scalar pow — called @0x11528f and @0x1152d1.
//
// The vtable slot at @0x907eac(%rip) (from @0x1151f5) is the class's own vtable — its
// member pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus the base's virtual slots)
// are installed by the linker; they are treated here as the class's method table.

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. All accessor state that
 * a descriptor subclass observes lives in this base; the derived class merely swaps the
 * vtable pointer. Same opaque-handle pattern as HGAYCCToneCurveToLinearLUTInfo.ts /
 * HGCanonLog2LinearizationLUTInfo.ts / HGDitherLUTInfo.ts / HGColorGammaLUTInfo.ts.
 *
 * @Helium 0x1151f0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *   (base C2 ctor called with args (this, unsigned long, 1, float, float, LUTStorageFormat)
 *    — second `unsigned long` is our wrapper's fixed 1 (@0x1151eb).)
 */
export interface HGApplyNDLUTInfo_base {
  readonly __brand_HGApplyNDLUTInfo: unique symbol;
}

/**
 * HGApplyNDLUTInfo::LUTStorageFormat — a small enum (only known here as an `int32` passed
 * to the base ctor via %r8d → %ecx). Bit-width recovered from base ctor signature; NOT
 * decoded here — passed through as an opaque number.
 */
export type LUTStorageFormat = number;

/**
 * HGLUTCache::LUTInfo — opaque base-class handle. Only observed via `__dynamic_cast` in
 * `isEqual` @0x115234; see the throwing stub below.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x11521e inside isEqual).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Static class members (referenced by external callers via mangled symbols) ─────────────
// __ZN30HGLinearToAYCCToneCurveLUTInfo6s_kMinE          (loaded @0x000f5618)
// __ZN30HGLinearToAYCCToneCurveLUTInfo6s_kMaxE          (loaded @0x000f5628)
// __ZN30HGLinearToAYCCToneCurveLUTInfo14s_1DLUTnumBinsE (loaded @0x000f5661)
//
// These live in Helium's __DATA and are set by the framework initializer; they carry the
// AYCC LUT's precomputed axis bounds and bin count. Not initialized by this class's ctor —
// class-level constants read externally. Not part of any decoded call site inside this
// class, so the port forward-declares them as `null` (downstream code that needs them will
// fail obviously until a proper decode gives us the .data-segment values).
export const HGLinearToAYCCToneCurveLUTInfo_s_kMin: number | null = null;          // @__DATA __ZN30HGLinearToAYCCToneCurveLUTInfo6s_kMinE
export const HGLinearToAYCCToneCurveLUTInfo_s_kMax: number | null = null;          // @__DATA __ZN30HGLinearToAYCCToneCurveLUTInfo6s_kMaxE
export const HGLinearToAYCCToneCurveLUTInfo_s_1DLUTnumBins: number | null = null;  // @__DATA __ZN30HGLinearToAYCCToneCurveLUTInfo14s_1DLUTnumBinsE

// ── Recovered float constants (fp32 __literal4 pool loads) ───────────────────────────────
const K_UPPER_LINEAR_SLOPE  = Math.fround( 0.22499999403953552);   // @Helium __TEXT 0x3d49e0
const K_UPPER_LINEAR_MULT   = Math.fround( 0.07999999821186066);   // @Helium __TEXT 0x3d49e4
const K_LOWER_LOG_SCALE     = Math.fround(-0.07999999821186066);   // @Helium __TEXT 0x3d49e8
const K_LOWER_LOG_DIV       = Math.fround(-0.22499999403953552);   // @Helium __TEXT 0x3d49f0
const K_LOWER_LOG_EXPONENT  = Math.fround( 0.45454543828964233);   // @Helium __TEXT 0x3d49f4  (1/2.2 in fp32)
const K_ONE                 = Math.fround( 1.0                );   // @Helium __TEXT 0x3c7cc0
const K_NEG_ONE             = Math.fround(-1.0                );   // @Helium __TEXT 0x3ca110
const K_UPPER_LOG_EXPONENT  = Math.fround( 0.51124745607376099);   // @Helium __TEXT 0x3d0fb8  (1/1.9559999… in fp32)

// Bit-pattern for 1.0f — the alpha write @0x1152e6 (`movl $0x3f800000, (%rbx)`).
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
 * LUTStorageFormat)` — the base-class C2 constructor.
 *   @Helium 0x1151f0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
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
      "@Helium 0x1151f0 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x11524a from
 * our own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x11524a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x11524a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x115234 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x115234  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * The port cannot faithfully re-implement Itanium RTTI without the full class hierarchy in
 * hand. The isEqual method below therefore raises through this stub for any non-null `other`,
 * mirroring the sibling HGAYCCToneCurveToLinearLUTInfo.ts /
 * HGCanonLog2LinearizationLUTInfo.ts decisions.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x115234 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet. Do NOT weaken this by returning src as-is: " +
      "that would silently equate two different LUTInfo subclasses.",
  );
}

/**
 * `powf(x, y)` — libm scalar single-precision power. Called at @0x11528f and @0x1152d1
 * inside `colorAtIndex`.
 *   @Helium 0x11528f  callq 0x3c54f2   ## symbol stub for: _powf
 *   @Helium 0x1152d1  callq 0x3c54f2   ## symbol stub for: _powf
 *
 * Faithful to libm's fp32 semantics: the result is `float`, i.e. Math.fround-narrowed
 * after a plain JS Math.pow.
 */
function powf(x: number, y: number): number {
  return Math.fround(Math.pow(x, y));
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGLinearToAYCCToneCurveLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x907eac(%rip) — stored in TS as a class-level tag. */
  readonly __vtable = "HGLinearToAYCCToneCurveLUTInfo::vtable @Helium 0x907eac";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x00000000001151e0  (__ZN30HGLinearToAYCCToneCurveLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToAYCCToneCurveLUTInfo.HGLinearToAYCCToneCurveLUTInfo.s):
   *   0x1151e6  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x1151e8  movq %rdi, %rbx         → save `this` in rbx
   *   0x1151eb  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x1151f0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x1151f5  leaq 0x907eac(%rip), %rax → load class vtable pointer
   *   0x1151fc  movq %rax, (%rbx)       → this->vtable = HGLinearToAYCCToneCurveLUTInfo::vtable
   *   0x115205  retq
   */
  constructor(
    dim0: bigint,
    minF: number,
    maxF: number,
    storage: LUTStorageFormat,
  ) {
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    // @0x1151f0  base(this, dim0, 1, minF, maxF, storage) — base's layout not yet decoded,
    // so this raises. Preserve the demand signal here.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x0000000000115210  (__ZNK30HGLinearToAYCCToneCurveLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToAYCCToneCurveLUTInfo.isEqual.s):
   *   0x115216  testq %rsi, %rsi       → null-check `other`
   *   0x115219  je 0x11524f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x11521b  movq %rdi, %rbx        → save `this`
   *   0x11521e  movq 0x8ed0bb(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x115225  leaq __ZTI30HGLinearToAYCCToneCurveLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x11522c  movq %rsi, %rdi        → src = other
   *   0x11522f  movq %rax, %rsi        → srcTypeInfo
   *   0x115232  xorl %ecx, %ecx        → hint = 0
   *   0x115234  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x115239  testq %rax, %rax       → check result
   *   0x11523c  je 0x11524f            → if null (cast failed): return false
   *   0x11523e  movq %rbx, %rdi        → this  (for the tail call)
   *   0x115241  movq %rax, %rsi        → the successfully-cast `other`
   *   0x11524a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGLinearToAYCCToneCurveLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class itself
   * contributes NO additional state to the comparison (there are no derived fields).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x115216-0x115219  null-check
    if (other === null) return false;
    // 0x115234  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HGLinearToAYCCToneCurveLUTInfo TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                          // srcTypeInfo (from %rip+0x8ed0bb)
      "HGLinearToAYCCToneCurveLUTInfo",               // dstTypeInfo (from %rip literal at @0x115225)
    );
    // 0x115239-0x11523c  if cast failed → false
    if (cast === null) return false;
    // 0x11524a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000115260  (__ZNK30HGLinearToAYCCToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToAYCCToneCurveLUTInfo.colorAtIndex.s):
   *   0x11526b-0x115274  save %r8=A, %rcx=B, %rdx=G, %rsi=R  (output pointers)
   *   0x115277  xorps %xmm1, %xmm1     → xmm1 = 0.0f
   *   0x11527a  ucomiss %xmm0, %xmm1   → compare xmm1(=0) vs xmm0(=x); sets CF=(0<x), ZF=(0==x)
   *   0x11527d  jbe 0x11529e           → jbe fires when 0<=x (or NaN) → skip to non-negative branch
   *   ── x < 0 branch @0x11527f..@0x11529c ──
   *   0x11527f  divss  @0x3d49f0, %xmm0  → xmm0 = x / -0.225
   *   0x115287  movss  @0x3d49f4, %xmm1  → xmm1 = 0.4545 (1/2.2 fp32)
   *   0x11528f  callq  _powf             → xmm0 = powf(x/-0.225, 0.4545)
   *   0x115294  mulss  @0x3d49e8, %xmm0  → xmm0 *= -0.08
   *   0x11529c  jmp    0x1152d6          → go to store
   *   ── x >= 0 branch ──
   *   0x11529e  ucomiss @0x3c7cc0, %xmm0 → compare xmm0(=x) vs 1.0; sets CF=(x<1), ZF=(x==1)
   *   0x1152a5  jbe 0x1152c9             → jbe fires when x<=1 (or NaN) → skip to pow-segment
   *   0x1152a7  addss  @0x3ca110, %xmm0  → xmm0 = x + (-1.0)
   *   0x1152af  mulss  @0x3d49e4, %xmm0  → xmm0 *= 0.08
   *   0x1152b7  divss  @0x3d49e0, %xmm0  → xmm0 /= 0.225
   *   0x1152bf  addss  @0x3c7cc0, %xmm0  → xmm0 += 1.0
   *   0x1152c7  jmp    0x1152d6          → go to store
   *   ── 0 <= x <= 1 branch (pow segment) ──
   *   0x1152c9  movss  @0x3d0fb8, %xmm1  → xmm1 = 0.5112 (1/1.9559999… fp32)
   *   0x1152d1  callq  _powf             → xmm0 = powf(x, 0.5112)
   *   ── store all three channels + alpha ──
   *   0x1152d6  movss %xmm0, (%r12)      → *R = f(x)
   *   0x1152dc  movss %xmm0, (%r15)      → *G = f(x)
   *   0x1152e1  movss %xmm0, (%r14)      → *B = f(x)
   *   0x1152e6  movl $0x3f800000, (%rbx) → *A = 1.0f
   *   0x1152f4  retq
   *
   * NOTE: `ucomiss %xmm0, %xmm1` at @0x11527a swaps AT&T src/dst compared to the ucomisd
   * traps in the fp64 sibling. With xmm1=0 and xmm0=x, it sets CF=(0 < x), ZF=(0 == x), so
   * `jbe` (CF=1|ZF=1) fires on "0 <= x (or unordered)". The fall-through is strictly x < 0
   * (non-NaN, negative).
   *
   * `ucomiss mem, %xmm0` at @0x11529e sets CF=(x < mem), so `jbe` (CF=1|ZF=1) fires on
   * "x <= 1.0". Fall-through here is x > 1.0.
   *
   * Only the first color-channel argument (`r`) is used; the other two (`g`, `b`) are
   * ignored by the disasm — the function evaluates a single scalar tone curve and
   * broadcasts the result to all three RGB output pointers, then writes alpha = 1.0.
   *
   * @param r      xmm0 — the input scalar (only value that matters).
   * @param _g     xmm1 — ignored (2nd float arg).
   * @param _b     xmm2 — ignored (3rd float arg).
   * @param rOut   %rsi=%r12 — output R pointer wrapper: written with f(r).
   * @param gOut   %rdx=%r15 — output G pointer wrapper: written with f(r).
   * @param bOut   %rcx=%r14 — output B pointer wrapper: written with f(r).
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
    // Narrow the input to fp32 so the comparisons match ucomiss semantics.
    const x = Math.fround(r);

    let y: number;

    if (x < 0) {
      // ── x < 0 branch @0x11527f..@0x11529c ──
      // 0x11527f  divss   -0.225
      // 0x115287  movss   0.4545
      // 0x11528f  callq   powf
      // 0x115294  mulss   -0.08
      const div = Math.fround(x / K_LOWER_LOG_DIV);           // @0x11527f
      const p   = powf(div, K_LOWER_LOG_EXPONENT);            // @0x11528f (exponent = @0x115287)
      y = Math.fround(p * K_LOWER_LOG_SCALE);                 // @0x115294
    } else {
      if (x > K_ONE) {
        // ── x > 1.0  → linear-extension branch @0x1152a7..@0x1152bf ──
        // 0x1152a7  addss  -1.0
        // 0x1152af  mulss   0.08
        // 0x1152b7  divss   0.225
        // 0x1152bf  addss   1.0
        const s = Math.fround(x + K_NEG_ONE);                 // @0x1152a7
        const m = Math.fround(s * K_UPPER_LINEAR_MULT);       // @0x1152af
        const d = Math.fround(m / K_UPPER_LINEAR_SLOPE);      // @0x1152b7
        y = Math.fround(d + K_ONE);                           // @0x1152bf
      } else {
        // ── 0 <= x <= 1.0  → pow branch @0x1152c9..@0x1152d1 ──
        // 0x1152c9  movss   0.5112
        // 0x1152d1  callq   powf
        y = powf(x, K_UPPER_LOG_EXPONENT);                    // @0x1152d1
      }
    }

    // 0x1152d6-0x1152e6  store the same scalar to R/G/B and 1.0 to alpha.
    rOut.value = y;           // @0x1152d6  movss %xmm0, (%r12)
    gOut.value = y;           // @0x1152dc  movss %xmm0, (%r15)
    bOut.value = y;           // @0x1152e1  movss %xmm0, (%r14)
    aOut.value = ALPHA_ONE;   // @0x1152e6  movl $0x3f800000, (%rbx)   (bit-pattern of 1.0f)
  }

  /**
   * ~HGLinearToAYCCToneCurveLUTInfo()  — the D1 (in-place) destructor.
   * @Helium 0x0000000000115cf0  (__ZN30HGLinearToAYCCToneCurveLUTInfoD1Ev)
   *
   * Per the class brief this is a trivial destructor (in-place, no-op). There is no
   * derived-class field owning ref-counted state, so ~HGLinearToAYCC… only needs to
   * unwind the stack frame; the compiler-generated D1 for the base sub-object is
   * inlined-away.
   *
   * In TS with GC there is nothing to do; this method is kept for signature parity with
   * the C++ ABI shape.
   */
  destruct_D1(): void {
    // no-op @0x115cf0
  }

  /**
   * ~HGLinearToAYCCToneCurveLUTInfo()  — the D0 (deleting) destructor.
   * @Helium 0x0000000000115d00  (__ZN30HGLinearToAYCCToneCurveLUTInfoD0Ev)
   *
   * DECODE (@0x115d00-0x115d05): `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv`
   *  → tail-calls `operator delete(this)`. Effectively "release memory".
   *
   * In TS with GC there is nothing to do; the method is kept as an ABI-shape placeholder.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x115d05  → in TS this is a no-op under GC.
  }

  /**
   * duplicate() const  →  HGLinearToAYCCToneCurveLUTInfo*
   * @Helium 0x0000000000115d10  (__ZNK30HGLinearToAYCCToneCurveLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToAYCCToneCurveLUTInfo.duplicate.s):
   *   Same byte-shape as every other LUTInfo sibling (HGAYCCToneCurveToLinearLUTInfo etc.):
   *     movl $0x28,%edi ; callq __Znwm ; two overlapping movups from this+0x08 and +0x14
   *     to new+0x08 and +0x14 (covering the full 32-byte base sub-object 0x08..0x27) ;
   *     leaq class-vtable(%rip),%rcx ; movq %rcx,(%rax) ; ret.
   *
   * In TS we don't have byte-addressable memory. The faithful semantics is: return a new
   * HGLinearToAYCCToneCurveLUTInfo whose `base` field references the same underlying
   * HGApplyNDLUTInfo state (or a decoded copy thereof, once the base is transcribed).
   */
  duplicate(): HGLinearToAYCCToneCurveLUTInfo {
    // Can't invoke this class's own constructor here (base ctor stub raises). Faithful
    // port: allocate via Object.create + copy the base handle across (mirroring the two
    // overlapping movups).
    const copy = Object.create(HGLinearToAYCCToneCurveLUTInfo.prototype) as HGLinearToAYCCToneCurveLUTInfo;
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    return copy;
  }
}

/**
 * Vtable-slot layout (recovered from ctor's `leaq 0x907eac(%rip)` @0x1151f5 pointing at the
 * class's vtable in Helium __DATA_CONST). This class overrides at least:
 *   • ~D0/~D1  →  destruct_D0 / destruct_D1
 *   • isEqual   →  isEqual
 *   • duplicate →  duplicate
 *   • colorAtIndex → colorAtIndex
 * Other virtual slots (from HGApplyNDLUTInfo / HGLUTCache::LUTInfo) are inherited unchanged.
 */
export const HGLinearToAYCCToneCurveLUTInfo_vtable_addr = "@Helium 0x907eac" as const;
