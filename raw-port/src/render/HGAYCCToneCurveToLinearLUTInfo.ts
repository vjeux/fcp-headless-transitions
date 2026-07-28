// HGAYCCToneCurveToLinearLUTInfo.ts — FCP Helium HGAYCCToneCurveToLinearLUTInfo:
// AYCC (Sony S-Log wide-gamut YCC) tone-curve → linear-light 1D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGAYCCToneCurveToLinearLUTInfo.all.s
//         (captured mangled symbols __ZN30HGAYCCToneCurveToLinearLUTInfo* starting at
//          file-offset 0x1150c0 in the x86_64 slice).
//
// STRUCT LAYOUT (recovered from ctor @0x1150c0 and duplicate @0x115cb0):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115cb9-0x115cbe;
//   released via `__ZdlPv` in D0 @0x115ca5.
//     +0x00  vtable  (installed by ctor at @0x1150d5-0x1150dc:
//                     `leaq 0x907f7c(%rip),%rax ; movq %rax,(%rbx)` — the sole class-specific
//                     write; all other 32 bytes of state live in the HGApplyNDLUTInfo base
//                     sub-object installed by the C2 base ctor @0x1150d0.)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x1150cb before calling the base C2 — meaning this
//                     descriptor represents a 1-dimensional LUT, not an N-D one).
//
// EXPORTED SYMBOLS (six member functions):
//   @Helium 0x00000000001150c0  ctor  (unsigned long, float, float, LUTStorageFormat)
//   @Helium 0x00000000001150f0  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000115140  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115c90  D1  (~HGAYCCToneCurveToLinearLUTInfo — in-place, no-op)
//   @Helium 0x0000000000115ca0  D0  (deleting, tail-calls operator delete)
//   @Helium 0x0000000000115cb0  duplicate() const  →  a new heap-allocated copy
//
// SEMANTICS (from colorAtIndex disasm @0x115140-0x1151d4):
//   The AYCC → linear transfer function is a three-segment piecewise curve applied identically
//   to every channel of the incoming grayscale sample (only the first argument matters — R=G=B
//   is written on all three output pointers, and the alpha is set to 1.0f):
//
//     f(x) = x >= 0                                                  ┐  branch @0x11515a (ucomiss 0)
//              ? { x <= 1.0                                          │  branch @0x11517e
//                    ? // linear segment
//                      ((x + (-1.0)) * 0.225 / 0.08) + 1.0           │  @0x115187..@0x1151a7
//                    : // upper-log segment (out-of-range highlight)
//                      pow(x, 1.9559999704360962f)                   │  @0x1151a9..@0x1151b1
//                }
//              : // lower-log segment (negative values allowed)
//                pow(x / -0.08f, 2.2f) * -0.225f                     │  @0x11515f..@0x115174
//
//   The three RIP-relative float constants and the two integer masks were recovered from the
//   Helium x86_64 __TEXT segment at file offset 0x4000+VA:
//     @0x3d49e0 = +0.225                (upper-linear slope)
//     @0x3d49e4 = +0.08                 (upper-linear divisor / lower normalizer)
//     @0x3d49e8 = -0.08                 (lower-log normalizer — divss @0x11515f)
//     @0x3d49ec = +2.2                  (lower-log pow exponent — movss @0x115167)
//     @0x3d49f0 = -0.225                (lower-log post-pow scale — mulss @0x115174)
//     @0x3c7cc0 = +1.0                  (linear segment breakpoint and additive)
//     @0x3ca110 = -1.0                  (linear segment origin shift)
//     @0x3d0fbc = +1.9559999704360962   (upper-log pow exponent — movss @0x1151a9)
//
//   The three output pointers %r12 (=r), %r15 (=g), %r14 (=b) are all written with the same
//   value from %xmm0; the alpha pointer %rbx is written the raw i32 0x3f800000 (== 1.0f).
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x1150d0.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x11512a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x115114.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x115cbe / @0x115ca5).
//   • _powf — libm scalar pow — called @0x11516f and @0x1151b1.
//
// The vtable slot at @0x907f7c(%rip) (from @0x1150d5) is the class's own vtable — its member
// pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus the base's virtual slots) are
// installed by the linker; they are treated here as the class's method table (TS methods on
// the class replace this).

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. All accessor state that
 * a descriptor subclass observes lives in this base; the derived class merely swaps the
 * vtable pointer. This is the same opaque-handle pattern used by HGDitherLUTInfo.ts and
 * HGColorGammaLUTInfo.ts — the shared future task is a single canonical HGApplyNDLUTInfo
 * port.
 *
 * @Helium 0x1150d0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *   (base C2 ctor called by our ctor with args (this, unsigned long, 1, float, float,
 *    LUTStorageFormat) — the second `unsigned long` is our wrapper's fixed 1 (@0x1150cb).)
 */
export interface HGApplyNDLUTInfo_base {
  readonly __brand_HGApplyNDLUTInfo: unique symbol;
}

/**
 * HGApplyNDLUTInfo::LUTStorageFormat — a small enum (only known here as an `int32` passed to
 * the base ctor via %r8d → %ecx). The bit-width and value set are recovered from the base
 * ctor signature but NOT decoded here; we pass the value through as an opaque number.
 */
export type LUTStorageFormat = number;

/**
 * HGLUTCache::LUTInfo — opaque base-class handle. Only observed via `__dynamic_cast` in
 * `isEqual` @0x115114; see the throwing stub below.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x1150fe inside isEqual).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Static class members (referenced by external callers via mangled symbols) ─────────────
// __ZN30HGAYCCToneCurveToLinearLUTInfo6s_kMinE   (loaded @0x0000f575a in HGColorTransform2::…)
// __ZN30HGAYCCToneCurveToLinearLUTInfo6s_kMaxE   (loaded @0x0000f576a)
// __ZN30HGAYCCToneCurveToLinearLUTInfo14s_1DLUTnumBinsE   (loaded @0x0000f57a3)
//
// These three static globals live in Helium's __DATA segment and are set by the framework
// initializer; they carry the AYCC LUT's precomputed axis bounds and bin count. They are
// NOT initialized by this class's ctor — they are class-level constants read externally.
// The values themselves are not part of any decoded call site inside this class, so the
// port only forward-declares them as `unknown`; downstream code that needs them will fail
// obviously (`throw` on access) until a proper decode gives us the .data-segment values.
export const HGAYCCToneCurveToLinearLUTInfo_s_kMin: number | null = null;   // @__DATA __ZN30HGAYCCToneCurveToLinearLUTInfo6s_kMinE
export const HGAYCCToneCurveToLinearLUTInfo_s_kMax: number | null = null;   // @__DATA __ZN30HGAYCCToneCurveToLinearLUTInfo6s_kMaxE
export const HGAYCCToneCurveToLinearLUTInfo_s_1DLUTnumBins: number | null = null;   // @__DATA __ZN30HGAYCCToneCurveToLinearLUTInfo14s_1DLUTnumBinsE

// ── Recovered float constants ────────────────────────────────────────────────────────────
// Values read via `python3 struct.unpack('<f', file_bytes[0x4000+VA:0x4000+VA+4])` on the
// Helium x86_64 slice. Every constant has its RIP-target VA + effective float value.
const K_UPPER_LINEAR_SLOPE  = Math.fround( 0.22499999403953552);   // @Helium __TEXT 0x3d49e0
const K_UPPER_LINEAR_DIV    = Math.fround( 0.07999999821186066);   // @Helium __TEXT 0x3d49e4
const K_LOWER_LOG_DIV       = Math.fround(-0.07999999821186066);   // @Helium __TEXT 0x3d49e8
const K_LOWER_LOG_EXPONENT  = Math.fround( 2.200000047683716  );   // @Helium __TEXT 0x3d49ec
const K_LOWER_LOG_SCALE     = Math.fround(-0.22499999403953552);   // @Helium __TEXT 0x3d49f0
const K_ONE                 = Math.fround( 1.0                );   // @Helium __TEXT 0x3c7cc0
const K_NEG_ONE             = Math.fround(-1.0                );   // @Helium __TEXT 0x3ca110
const K_UPPER_LOG_EXPONENT  = Math.fround( 1.9559999704360962 );   // @Helium __TEXT 0x3d0fbc

// Bit-pattern for 1.0f — the alpha write @0x1151c6 (`movl $0x3f800000, (%rbx)`). Recorded
// here as the equivalent float value (1.0) since TS has no `float*` addressable memory.
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
 * LUTStorageFormat)` — the base-class C2 constructor.
 *   @Helium 0x1150d0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper ctor forces `unsigned long #2 = 1` via `movl $0x1, %edx` @0x1150cb before
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
      "@Helium 0x1150d0 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x11512a from
 * our own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x11512a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x11512a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x115114 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x115114  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * The port cannot faithfully re-implement Itanium RTTI without the full class hierarchy in
 * hand. The isEqual method below therefore raises through this stub for any non-null `other`,
 * mirroring the sibling HGDitherLUTInfo.ts / HGColorGammaLUTInfo.ts decision.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x115114 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet. Do NOT weaken this by returning src as-is: " +
      "that would silently equate two different LUTInfo subclasses.",
  );
}

/**
 * `powf(x, y)` — libm scalar single-precision power. Called at @0x11516f and @0x1151b1
 * inside `colorAtIndex`.
 *   @Helium 0x11516f  callq 0x3c54f2   ## symbol stub for: _powf
 *   @Helium 0x1151b1  callq 0x3c54f2   ## symbol stub for: _powf
 *
 * Faithful to libm's fp32 semantics: the result is `float`, i.e. Math.fround-narrowed after
 * a plain JS Math.pow.
 */
function powf(x: number, y: number): number {
  return Math.fround(Math.pow(x, y));
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGAYCCToneCurveToLinearLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x907f7c(%rip) — stored in TS as a class-level tag. */
  readonly __vtable = "HGAYCCToneCurveToLinearLUTInfo::vtable @Helium 0x907f7c";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x00000000001150c0  (__ZN30HGAYCCToneCurveToLinearLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGAYCCToneCurveToLinearLUTInfo.all.s @0x1150c0-0x1150e5):
   *   0x1150c6  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x1150c8  movq %rdi, %rbx         → save `this` in rbx (rdi is base-ctor's `this`)
   *   0x1150cb  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x1150d0  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x1150d5  leaq 0x907f7c(%rip), %rax → load class vtable pointer
   *   0x1150dc  movq %rax, (%rbx)       → this->vtable = HGAYCCToneCurveToLinearLUTInfo::vtable
   *   0x1150e5  retq
   */
  constructor(
    dim0: bigint,
    minF: number,
    maxF: number,
    storage: LUTStorageFormat,
  ) {
    // Allocate the opaque base sub-object with the exact ABI signature the disasm calls.
    // The wrapper's C++ code created this at offset +0x08 in the same allocation as `this`;
    // in TS we model it as a distinct field.
    const base = { __brand_HGApplyNDLUTInfo: Symbol("HGApplyNDLUTInfo") } as unknown as HGApplyNDLUTInfo_base;
    // @0x1150d0  base(this, dim0, 1, minF, maxF, storage) — but since the base's layout
    // hasn't been decoded, calling this raises. Preserve the demand signal here.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x00000000001150f0  (__ZNK30HGAYCCToneCurveToLinearLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGAYCCToneCurveToLinearLUTInfo.all.s @0x1150f0-0x115137):
   *   0x1150f6  testq %rsi, %rsi       → null-check `other`
   *   0x1150f9  je 0x11512f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x1150fb  movq %rdi, %rbx        → save `this`
   *   0x1150fe  movq 0x8ed1db(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x115105  leaq __ZTI30HGAYCCToneCurveToLinearLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x11510c  movq %rsi, %rdi        → src = other
   *   0x11510f  movq %rax, %rsi        → srcTypeInfo
   *   0x115112  xorl %ecx, %ecx        → hint = 0
   *   0x115114  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x115119  testq %rax, %rax       → check result
   *   0x11511c  je 0x11512f            → if null (cast failed): return false
   *   0x11511e  movq %rbx, %rdi        → this  (for the tail call)
   *   0x115121  movq %rax, %rsi        → the successfully-cast `other`
   *   0x11512a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGAYCCToneCurveToLinearLUTInfo instances are equal iff they have the same
   * dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class itself
   * contributes NO additional state to the comparison (there are no derived fields).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x1150f6-0x1150f9  null-check
    if (other === null) return false;
    // 0x115114  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HGAYCCToneCurveToLinearLUTInfo TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                          // srcTypeInfo (from %rip+0x8ed1db)
      "HGAYCCToneCurveToLinearLUTInfo",               // dstTypeInfo (from %rip literal at @0x115105)
    );
    // 0x115119-0x11511c  if cast failed → false
    if (cast === null) return false;
    // 0x11512a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000115140  (__ZNK30HGAYCCToneCurveToLinearLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (raw-port/re/disasm/Helium.HGAYCCToneCurveToLinearLUTInfo.all.s @0x115140-0x1151d4):
   *   0x11514b-0x115154  save %r8=A, %rcx=B, %rdx=G, %rsi=R  (output pointers)
   *   0x115157  xorps %xmm1, %xmm1       → xmm1 = 0.0f
   *   0x11515a  ucomiss %xmm0, %xmm1     → compare 0 vs x (unordered-set on NaN)
   *   0x11515d  jbe 0x11517e             → if !(0 > x)  → jump to non-negative branch
   *                                        (jbe = jump if CF=1 or ZF=1; here "0 <= x" or NaN)
   *   ── x < 0 branch ──
   *   0x11515f  divss  @0x3d49e8, %xmm0  → xmm0 = x / -0.08
   *   0x115167  movss  @0x3d49ec, %xmm1  → xmm1 = 2.2 (exponent)
   *   0x11516f  callq  _powf             → xmm0 = powf(x/-0.08, 2.2)
   *   0x115174  mulss  @0x3d49f0, %xmm0  → xmm0 *= -0.225
   *   0x11517c  jmp    0x1151b6          → go to store
   *   ── x >= 0 branch ──
   *   0x11517e  ucomiss @0x3c7cc0, %xmm0 → compare x vs 1.0
   *   0x115185  jbe 0x1151a9             → if x <= 1.0 → jump to linear-segment branch
   *   0x115187  addss  @0x3ca110, %xmm0  → xmm0 = x + (-1.0)
   *   0x11518f  mulss  @0x3d49e0, %xmm0  → xmm0 *= 0.225
   *   0x115197  divss  @0x3d49e4, %xmm0  → xmm0 /= 0.08
   *   0x11519f  addss  @0x3c7cc0, %xmm0  → xmm0 += 1.0
   *   0x1151a7  jmp    0x1151b6          → go to store
   *   ── 0 <= x <= 1 branch (linear segment via the upper log path) ──
   *   0x1151a9  movss  @0x3d0fbc, %xmm1  → xmm1 = 1.9559999704360962 (exponent)
   *   0x1151b1  callq  _powf             → xmm0 = powf(x, 1.956)
   *   ── store all three channels + alpha ──
   *   0x1151b6  movss %xmm0, (%r12)      → *R = f(x)
   *   0x1151bc  movss %xmm0, (%r15)      → *G = f(x)
   *   0x1151c1  movss %xmm0, (%r14)      → *B = f(x)
   *   0x1151c6  movl $0x3f800000, (%rbx) → *A = 1.0f
   *   0x1151d4  retq
   *
   * NOTE: the "x <= 1.0" branch is the ORIGINAL "linear (curve extension via
   * (x-1)*0.225/0.08 + 1)" branch, and the "x > 1.0" branch is the pow-1.956 branch. This
   * matches the sibling `HGLinearToAYCCToneCurveLUTInfo::colorAtIndex` @0x115260 which uses
   * the SAME code shape and the same 8 constants (just at different %rip offsets that resolve
   * to the same __TEXT addresses).
   *
   * Only the first color-channel argument (`r`) is used; the other two (`g`, `b`) are
   * ignored by the disasm — the function evaluates a single scalar tone curve and broadcasts
   * the result to all three RGB output pointers, then writes alpha = 1.0.
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

    // 0x11515a-0x11515d  compare 0 vs x ; jbe → "0 <= x (or unordered)" → non-negative branch.
    // Faithful: `ucomiss %xmm0, %xmm1` with xmm1=0 sets CF=(0 < x), ZF=(0 == x), PF=(unordered).
    // `jbe` = CF=1 | ZF=1 → jumps when 0 >= x  (i.e. x <= 0 or NaN). So the fall-through
    // "x < 0" branch is taken only when strictly 0 > x (non-NaN, negative).
    if (x < 0) {
      // ── x < 0 branch @0x11515f..@0x11517c ──
      // 0x11515f  divss   -0.08
      // 0x115167  movss   +2.2
      // 0x11516f  callq   powf
      // 0x115174  mulss   -0.225
      const div = Math.fround(x / K_LOWER_LOG_DIV);           // @0x11515f
      const p   = powf(div, K_LOWER_LOG_EXPONENT);            // @0x11516f (exponent = @0x115167)
      y = Math.fround(p * K_LOWER_LOG_SCALE);                 // @0x115174
    } else {
      // 0x11517e-0x115185  ucomiss @0x3c7cc0 ; jbe → "x >= 1.0 (or NaN)" → upper-log branch.
      // Same reasoning: xmm1 is the memory operand (1.0), xmm0 is x. ucomiss xmm0,mem sets
      // CF=(x < mem), ZF=(x == mem). jbe = jump if x <= 1.0 → linear branch. So the
      // fall-through here is x > 1.0.
      if (x > K_ONE) {
        // ── 0 <= x, x > 1.0  → linear-segment branch @0x115187..@0x1151a7 ──
        // (This is the segment where the disasm does `x + (-1)` then linear map.)
        // 0x115187  addss  -1.0
        // 0x11518f  mulss   0.225
        // 0x115197  divss   0.08
        // 0x11519f  addss   1.0
        const s = Math.fround(x + K_NEG_ONE);                 // @0x115187
        const m = Math.fround(s * K_UPPER_LINEAR_SLOPE);      // @0x11518f
        const d = Math.fround(m / K_UPPER_LINEAR_DIV);        // @0x115197
        y = Math.fround(d + K_ONE);                           // @0x11519f
      } else {
        // ── 0 <= x <= 1.0  → pow branch @0x1151a9..@0x1151b1 ──
        // 0x1151a9  movss   1.9559999704360962
        // 0x1151b1  callq   powf
        y = powf(x, K_UPPER_LOG_EXPONENT);                    // @0x1151b1
      }
    }

    // 0x1151b6-0x1151c6  store the same scalar to R/G/B and 1.0 to alpha.
    rOut.value = y;           // @0x1151b6  movss %xmm0, (%r12)
    gOut.value = y;           // @0x1151bc  movss %xmm0, (%r15)
    bOut.value = y;           // @0x1151c1  movss %xmm0, (%r14)
    aOut.value = ALPHA_ONE;   // @0x1151c6  movl $0x3f800000, (%rbx)   (bit-pattern of 1.0f)
  }

  /**
   * ~HGAYCCToneCurveToLinearLUTInfo()  — the D1 (in-place) destructor.
   * @Helium 0x0000000000115c90  (__ZN30HGAYCCToneCurveToLinearLUTInfoD1Ev)
   *
   * DECODE (@0x115c90-0x115c95): `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq`  — a no-op
   * body. There is no derived-class field owning ref-counted state, so ~HGAYCCTone… only
   * needs to unwind the stack frame; the compiler-generated D1 for the base sub-object is
   * inlined-away here (the base's destructor is also trivial-or-inlined).
   *
   * In TS with GC there is nothing to do; this method is kept for signature parity with the
   * C++ ABI shape.
   */
  destruct_D1(): void {
    // no-op @0x115c90
  }

  /**
   * ~HGAYCCToneCurveToLinearLUTInfo()  — the D0 (deleting) destructor.
   * @Helium 0x0000000000115ca0  (__ZN30HGAYCCToneCurveToLinearLUTInfoD0Ev)
   *
   * DECODE (@0x115ca0-0x115ca5): `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv`
   *  → tail-calls `operator delete(this)`. Effectively "release memory".
   *
   * In TS with GC there is nothing to do; the method is kept as an ABI-shape placeholder.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x115ca5  → in TS this is a no-op under GC.
  }

  /**
   * duplicate() const  →  HGAYCCToneCurveToLinearLUTInfo*
   * @Helium 0x0000000000115cb0  (__ZNK30HGAYCCToneCurveToLinearLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HGAYCCToneCurveToLinearLUTInfo.all.s @0x115cb0-0x115ce3):
   *   0x115cb6  movq %rdi, %rbx           → save `this`
   *   0x115cb9  movl $0x28, %edi          → allocation size = 0x28 (40 bytes = sizeof)
   *   0x115cbe  callq __Znwm              → new(0x28)  → rax = new-obj
   *   0x115cc3  movups 0x8(%rbx), %xmm0   → load 16B from this+0x08 (bytes 0x08..0x17)
   *   0x115cc7  movups 0x14(%rbx), %xmm1  → load 16B from this+0x14 (bytes 0x14..0x23)
   *                                         NB: these two loads overlap by 4 bytes to cover
   *                                             the full 32-byte base sub-object (0x08..0x27)
   *                                             with 2× unaligned 16B ops.
   *   0x115ccb  movups %xmm0, 0x8(%rax)   → store 16B at new-obj+0x08
   *   0x115ccf  movups %xmm1, 0x14(%rax)  → store 16B at new-obj+0x14
   *   0x115cd3  leaq 0x90737e(%rip), %rcx → load class vtable pointer (same as ctor's)
   *   0x115cda  movq %rcx, (%rax)         → new-obj->vtable = HGAYCCTone…::vtable
   *   0x115ce3  retq                      → return the new object in %rax
   *
   * Semantics: creates a heap-allocated shallow-byte-copy of `this` — exact base sub-object
   * bytes are duplicated verbatim, then the derived-class vtable pointer is written on top
   * (matching how the ctor built the original).
   *
   * In TS we don't have byte-addressable memory. The faithful semantics is: return a new
   * HGAYCCToneCurveToLinearLUTInfo whose `base` field references the same underlying
   * HGApplyNDLUTInfo state (or a decoded copy thereof, once the base is transcribed). Since
   * the base isn't decoded, we mirror the byte-copy by cloning the opaque handle.
   */
  duplicate(): HGAYCCToneCurveToLinearLUTInfo {
    // We can't invoke this class's own constructor here (it would call the base ctor stub
    // and raise). Faithful port: allocate a new instance without going through the ctor,
    // then copy the base handle bytes across (mirroring the two overlapping movups).
    const copy = Object.create(HGAYCCToneCurveToLinearLUTInfo.prototype) as HGAYCCToneCurveToLinearLUTInfo;
    // @0x115cc3-0x115ccf: byte-copy of the base sub-object 0x08..0x27 (32B) — modeled as
    // a shared reference to the same opaque handle.
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x115cd3-0x115cda: vtable write — implicit in TS via `Object.create(...prototype)`.
    return copy;
  }
}

/**
 * Vtable-slot layout (recovered from ctor's `leaq 0x907f7c(%rip)` @0x1150d5 pointing at the
 * class's vtable in Helium __DATA_CONST). This class overrides at least:
 *   • ~D0/~D1  →  destruct_D0 / destruct_D1
 *   • isEqual   →  isEqual
 *   • duplicate →  duplicate
 *   • colorAtIndex → colorAtIndex
 * Other virtual slots (from HGApplyNDLUTInfo / HGLUTCache::LUTInfo) are inherited unchanged.
 *
 * The precise slot ordering isn't extracted here (it lives in the vtable RTTI and would
 * require another decode pass); see @__ZTV30HGAYCCToneCurveToLinearLUTInfo for the target.
 */
export const HGAYCCToneCurveToLinearLUTInfo_vtable_addr = "@Helium 0x907f7c" as const;
