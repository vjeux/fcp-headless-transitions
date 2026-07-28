// HGLinearToERsRGBToneCurveLUTInfo.ts — FCP Helium HGLinearToERsRGBToneCurveLUTInfo:
// linear-light → Extended-Range sRGB (ERsRGB) tone-curve 1D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGLinearToERsRGBToneCurveLUTInfo.all.s
//         (captured mangled symbols __ZN32HGLinearToERsRGBToneCurveLUTInfo* starting at
//          the class's C1 at 0x115430 in the x86_64 slice).
//
// STRUCT LAYOUT (recovered from ctor @0x115430 and duplicate @0x115dd0):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115dd9-0x115dde;
//   released via `__ZdlPv` in D0 @0x115dc5.
//     +0x00  vtable  (installed by ctor at @0x115445-0x11544c:
//                     `leaq 0x907cfc(%rip),%rax ; movq %rax,(%rbx)` — the sole class-specific
//                     write; all other 32 bytes of state live in the HGApplyNDLUTInfo base
//                     sub-object installed by the C2 base ctor @0x115440.)
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x11543b before calling the base C2 — meaning this
//                     descriptor represents a 1-dimensional LUT, not an N-D one).
//
// EXPORTED SYMBOLS (six member functions):
//   @Helium 0x0000000000115430  ctor  (unsigned long, float, float, LUTStorageFormat)
//   @Helium 0x0000000000115460  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x00000000001154b0  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115db0  D1  (~HGLinearToERsRGBToneCurveLUTInfo — in-place, no-op)
//   @Helium 0x0000000000115dc0  D0  (deleting, tail-calls operator delete)
//   @Helium 0x0000000000115dd0  duplicate() const  →  a new heap-allocated copy
//
// SEMANTICS (from colorAtIndex disasm @0x1154b0-0x11555b):
//   The linear-light → ERsRGB (Extended-Range sRGB) transfer function. Applied identically to
//   every RGB channel of the incoming grayscale sample (only the first argument matters —
//   R=G=B is written on all three output pointers, and the alpha is set to 1.0f).
//
//   Let  s = |x|  (absolute value, taken via `andps abs_mask, x` @0x1154ce/@0x1154d5).
//   Let  sign(x) = "negative-ness" flag from `cmpltss xmm3(=x), 0` @0x11552c.
//
//   Piecewise:
//     if s >= 0.0031308:                                                # @0x1154e0 ucomiss+jbe
//         v = pow(1.137120 * s, 0.416670) + (-0.055)                    # @0x1154f3..@0x115517
//     else:  # small-magnitude linear segment
//         v = 12.920000 * s                                              # @0x1154e5..@0x1154ed
//
//   Then, if x was negative (its sign was set), NEGATE v:
//     v_out = (x < 0)  ?  v XOR 0x80000000  :  v                        # @0x115526..@0x115534
//
//   That's the standard ERsRGB odd-symmetric extension of sRGB into negative inputs.
//
//   Identity note: pow(1.137120 * s, 0.416670) - 0.055
//                = pow(1.137120, 0.416670) * pow(s, 0.416670) - 0.055
//                ≈ 1.055 * pow(s, 1/2.4) - 0.055     (standard sRGB tone curve)
//   The disassembly factors the 1.055 pre-multiplier INTO the pow argument (1.137120 =
//   1.055^(1/0.416670)).  Faithfulness note: we transcribe the ASM's exact ordering
//   (constant × s inside the pow, then subtract 0.055 outside) — NOT the algebraic identity.
//
//   The three output pointers %r12 (=r), %r15 (=g), %r14 (=b) are all written with the same
//   value from %xmm1 (== `v_out`); the alpha pointer %rbx is written the raw i32 0x3f800000
//   (== 1.0f).
//
// RIP-RELATIVE CONSTANTS (recovered by `struct.unpack('<f', file[0x4000+VA:0x4000+VA+4])`
// on the Helium x86_64 slice — all seven addresses and their decoded values):
//   @0x3c7c30  = ff ff ff 7f × 4    — 16-byte absmask (0x7fffffff × 4)          @0x1154ce
//   @0x3ca2b0  = 0.0031308000907301903          — linear/log breakpoint         @0x1154d8
//   @0x3ca26c  = 12.920000076293945             — linear-segment slope          @0x1154e5
//   @0x3d4a04  = 1.137120008468628              — log-segment pow prefactor     @0x1154f3
//   @0x3d4a08  = 0.4166699945926666             — log-segment pow exponent      @0x1154ff
//   @0x3ca2b8  = -0.054999999701976776          — log-segment additive offset   @0x115517
//   @0x3ca0d0  = 00 00 00 80 × 4                — 16-byte signmask (bit 31 × 4) @0x11551f
//
//   The alpha write @0x115549 uses the raw i32 constant 0x3f800000 (== float 1.0f). This is
//   encoded directly in the instruction stream, not as a RIP-relative load.
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x115440.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x11549a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x115484.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x115dde / @0x115dc5).
//   • _powf — libm scalar pow — called @0x11550b.
//
// The vtable slot at @0x907cfc(%rip) (from @0x115445) is the class's own vtable — its member
// pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus the base's virtual slots) are
// installed by the linker; they are treated here as the class's method table (TS methods on
// the class replace this).
//
// This class is a very close sibling of HGAYCCToneCurveToLinearLUTInfo (see
// raw-port/src/render/HGAYCCToneCurveToLinearLUTInfo.ts) — identical ctor shape, identical
// isEqual RTTI pattern, identical D1/D0/duplicate skeletons; only the piecewise curve in
// colorAtIndex differs.

/**
 * HGApplyNDLUTInfo — opaque handle to the (undecoded) base class. All accessor state that
 * a descriptor subclass observes lives in this base; the derived class merely swaps the
 * vtable pointer. This is the same opaque-handle pattern used by HGDitherLUTInfo.ts,
 * HGColorGammaLUTInfo.ts and HGAYCCToneCurveToLinearLUTInfo.ts — the shared future task is
 * a single canonical HGApplyNDLUTInfo port.
 *
 * @Helium 0x115440  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *   (base C2 ctor called by our ctor with args (this, unsigned long, 1, float, float,
 *    LUTStorageFormat) — the second `unsigned long` is our wrapper's fixed 1 (@0x11543b).)
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
 * `isEqual` @0x115484; see the throwing stub below.
 *
 * @Helium __ZTIN10HGLUTCache7LUTInfoE  (literal-pool ref @0x11546e inside isEqual).
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// ── Static class members (referenced by external callers via mangled symbols) ─────────────
// __ZN32HGLinearToERsRGBToneCurveLUTInfo6s_kMinE          (loaded @Helium 0xf59e0)
// __ZN32HGLinearToERsRGBToneCurveLUTInfo6s_kMaxE          (loaded @Helium 0xf59f0)
// __ZN32HGLinearToERsRGBToneCurveLUTInfo14s_1DLUTnumBinsE (loaded @Helium 0xf5a29)
//
// These three static globals live in Helium's __DATA segment and are set by the framework
// initializer; they carry the LUT's precomputed axis bounds and bin count. They are NOT
// initialized by this class's ctor — they are class-level constants read externally.
// The values themselves are not part of any decoded call site inside this class, so the
// port only forward-declares them as `null`; downstream code that needs them will fail
// obviously until a proper decode gives us the .data-segment values.
export const HGLinearToERsRGBToneCurveLUTInfo_s_kMin: number | null = null;         // @__DATA
export const HGLinearToERsRGBToneCurveLUTInfo_s_kMax: number | null = null;         // @__DATA
export const HGLinearToERsRGBToneCurveLUTInfo_s_1DLUTnumBins: number | null = null; // @__DATA

// ── Recovered float constants ────────────────────────────────────────────────────────────
// Values read via `python3 struct.unpack('<f', file_bytes[0x4000+VA:0x4000+VA+4])` on the
// Helium x86_64 slice. Every constant has its RIP-target VA + effective float value.
const K_BREAKPOINT     = Math.fround( 0.0031308000907301903);   // @Helium __TEXT 0x3ca2b0
const K_LINEAR_SLOPE   = Math.fround(12.920000076293945     );   // @Helium __TEXT 0x3ca26c
const K_POW_PREFACTOR  = Math.fround( 1.137120008468628     );   // @Helium __TEXT 0x3d4a04
const K_POW_EXPONENT   = Math.fround( 0.4166699945926666    );   // @Helium __TEXT 0x3d4a08
const K_POW_OFFSET     = Math.fround(-0.054999999701976776  );   // @Helium __TEXT 0x3ca2b8

// Bit-pattern for 1.0f — the alpha write @0x115549 (`movl $0x3f800000, (%rbx)`). Recorded
// here as the equivalent float value (1.0) since TS has no `float*` addressable memory.
const ALPHA_ONE = Math.fround(1.0);   // == reinterpret_cast<float>(0x3f800000)

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
 * LUTStorageFormat)` — the base-class C2 constructor.
 *   @Helium 0x115440  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper ctor forces `unsigned long #2 = 1` via `movl $0x1, %edx` @0x11543b before
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
      "@Helium 0x115440 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x11549a from
 * our own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x11549a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x11549a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x115484 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x115484  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
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
    "___dynamic_cast @Helium 0x115484 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet. Do NOT weaken this by returning src as-is: " +
      "that would silently equate two different LUTInfo subclasses.",
  );
}

/**
 * `powf(x, y)` — libm scalar single-precision power. Called at @0x11550b inside colorAtIndex.
 *   @Helium 0x11550b  callq 0x3c54f2   ## symbol stub for: _powf
 *
 * Faithful to libm's fp32 semantics: the result is `float`, i.e. Math.fround-narrowed after
 * a plain JS Math.pow.
 */
function powf(x: number, y: number): number {
  return Math.fround(Math.pow(x, y));
}

/**
 * Bitwise sign-flip of an IEEE-754 fp32 value — equivalent to `xorps %xmm1, signmask` at
 * @0x115526 in the disasm, where `signmask` = 0x80000000 broadcast across the four 32-bit
 * lanes (@Helium __TEXT 0x3ca0d0). For a scalar float this is exactly `-v`, because IEEE
 * negation is defined as flipping the sign bit — and TS's `-v` on Math.fround-narrowed
 * values produces the same bit pattern for finite / NaN / infinity alike (the same lane-wise
 * behavior the SSE instruction has). We use `Math.fround(-v)` to keep the fp32 discipline.
 */
function fp32_sign_flip(v: number): number {
  return Math.fround(-v);
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HGLinearToERsRGBToneCurveLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x907cfc(%rip) — stored in TS as a class-level tag. */
  readonly __vtable = "HGLinearToERsRGBToneCurveLUTInfo::vtable @Helium 0x907cfc";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x0000000000115430
   *   (__ZN32HGLinearToERsRGBToneCurveLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToERsRGBToneCurveLUTInfo.all.s @0x115430-0x115455):
   *   0x115436  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x115438  movq %rdi, %rbx         → save `this` in rbx (rdi is base-ctor's `this`)
   *   0x11543b  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x115440  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x115445  leaq 0x907cfc(%rip), %rax → load class vtable pointer
   *   0x11544c  movq %rax, (%rbx)       → this->vtable = HGLinearToERsRGBToneCurveLUTInfo::vtable
   *   0x11544f-0x115455  epilogue
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
    // @0x115440  base(this, dim0, 1, minF, maxF, storage) — but since the base's layout
    // hasn't been decoded, calling this raises. Preserve the demand signal here.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, minF, maxF, storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x0000000000115460
   *   (__ZNK32HGLinearToERsRGBToneCurveLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToERsRGBToneCurveLUTInfo.all.s @0x115460-0x1154a7):
   *   0x115466  testq %rsi, %rsi       → null-check `other`
   *   0x115469  je 0x11549f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x11546b  movq %rdi, %rbx        → save `this`
   *   0x11546e  movq 0x8ece6b(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x115475  leaq __ZTI32HGLinearToERsRGBToneCurveLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x11547c  movq %rsi, %rdi        → src = other
   *   0x11547f  movq %rax, %rsi        → srcTypeInfo
   *   0x115482  xorl %ecx, %ecx        → hint = 0
   *   0x115484  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x115489  testq %rax, %rax       → check result
   *   0x11548c  je 0x11549f            → if null (cast failed): return false
   *   0x11548e  movq %rbx, %rdi        → this  (for the tail call)
   *   0x115491  movq %rax, %rsi        → the successfully-cast `other`
   *   0x11549a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGLinearToERsRGBToneCurveLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class itself
   * contributes NO additional state to the comparison (there are no derived fields).
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x115466-0x115469  null-check
    if (other === null) return false;
    // 0x115484  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HGLinearToERsRGBToneCurveLUTInfo TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                            // srcTypeInfo (from %rip+0x8ece6b @0x11546e)
      "HGLinearToERsRGBToneCurveLUTInfo",               // dstTypeInfo (from %rip literal at @0x115475)
    );
    // 0x115489-0x11548c  if cast failed → false
    if (cast === null) return false;
    // 0x11549a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x00000000001154b0
   *   (__ZNK32HGLinearToERsRGBToneCurveLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * ABI: %rsi=R*, %rdx=G*, %rcx=B*, %r8=A*  (four output pointers);
   *      %xmm0=x, %xmm1=?, %xmm2=?  (three float inputs; only %xmm0 is read).
   *
   * DECODE (raw-port/re/disasm/Helium.HGLinearToERsRGBToneCurveLUTInfo.all.s @0x1154b0-0x11555b):
   *   0x1154bf-0x1154cb  save r8=A, rcx=B, rdx=G, rsi=R, xmm0→xmm3 (keep original x for sign-check)
   *   0x1154ce  movaps 0x2b275b(%rip), %xmm2  → xmm2 = absmask (0x7fffffff × 4) @0x3c7c30
   *   0x1154d5  andps  %xmm0, %xmm2          → xmm2 = |x|
   *   0x1154d8  movss  0x2b4dd0(%rip), %xmm0 → xmm0 = 0.0031308      @0x3ca2b0
   *   0x1154e0  ucomiss %xmm2, %xmm0         → set flags for (xmm0 vs xmm2)
   *   0x1154e3  jbe    0x1154f3              → if xmm0 <= xmm2 (i.e. |x| >= 0.0031308): log branch
   *
   *   ; --- LINEAR SEGMENT: |x| < 0.0031308 ---
   *   0x1154e5  movss  0x2b4d7f(%rip), %xmm1 → xmm1 = 12.9200        @0x3ca26c
   *   0x1154ed  mulss  %xmm2, %xmm1          → xmm1 = 12.9200 * |x|
   *   0x1154f1  jmp    0x11551f              → skip to sign-application
   *
   *   ; --- LOG SEGMENT: |x| >= 0.0031308 ---
   *   0x1154f3  movss  0x2bf509(%rip), %xmm0 → xmm0 = 1.137120       @0x3d4a04
   *   0x1154fb  mulss  %xmm2, %xmm0          → xmm0 = 1.137120 * |x|
   *   0x1154ff  movss  0x2bf501(%rip), %xmm1 → xmm1 = 0.416670       @0x3d4a08
   *   0x115507  movaps %xmm3, -0x30(%rbp)    → spill x across the powf call
   *   0x11550b  callq  _powf                 → xmm0 = pow(1.137120*|x|, 0.416670)
   *   0x115510  movaps -0x30(%rbp), %xmm3    → reload x
   *   0x115514  movaps %xmm0, %xmm1          → xmm1 = pow(...)
   *   0x115517  addss  0x2b4d99(%rip), %xmm1 → xmm1 = pow(...) + (-0.055)   @0x3ca2b8
   *
   *   ; --- SIGN APPLICATION (converge here from both branches; xmm1 = v; xmm3 = original x) ---
   *   0x11551f  movaps 0x2b4baa(%rip), %xmm2 → xmm2 = signmask (0x80000000 × 4) @0x3ca0d0
   *   0x115526  xorps  %xmm1, %xmm2          → xmm2 = v with sign bit toggled (i.e. -v)
   *   0x115529  xorps  %xmm0, %xmm0          → xmm0 = 0.0
   *   0x11552c  cmpltss %xmm0, %xmm3         → xmm3.lane0 = (x < 0) ? all-1s : 0
   *   0x115531  movaps %xmm3, %xmm0          → xmm0 = mask
   *   0x115534  blendvps %xmm0, %xmm2, %xmm1 → xmm1 = (mask.MSB) ? xmm2 : xmm1
   *                                            i.e. if x<0 use (-v), else use v
   *
   *   ; --- Write outputs ---
   *   0x115539  movss %xmm1, (%r12)          → *R = v_out
   *   0x11553f  movss %xmm1, (%r15)          → *G = v_out
   *   0x115544  movss %xmm1, (%r14)          → *B = v_out
   *   0x115549  movl $0x3f800000, (%rbx)     → *A = 1.0f
   *   0x11554f-0x11555b  epilogue
   *
   * Semantics summary (as a scalar function of x):
   *   s  = |x|
   *   if s >= K_BREAKPOINT:                    v = powf(K_POW_PREFACTOR * s, K_POW_EXPONENT) + K_POW_OFFSET
   *   else:                                    v = K_LINEAR_SLOPE * s
   *   v_out = (x < 0) ? -v : v
   *   *R = *G = *B = v_out
   *   *A = 1.0f
   *
   * The second and third input floats (arg-slot xmm1/xmm2 in the C++ signature) are NOT
   * consumed by this method — the same behaviour as HGAYCCToneCurveToLinearLUTInfo.
   *
   * The four output-pointer arguments are documented `float*` — we model them as one-element
   * `{value: number}` boxes so the caller can observe the writes; this mirrors the sibling
   * port's approach and avoids fabricating a `Float32Array` layout that isn't in the ABI.
   */
  colorAtIndex(
    x: number,
    _unusedY: number,
    _unusedZ: number,
    R: { value: number },
    G: { value: number },
    B: { value: number },
    A: { value: number },
  ): void {
    // @0x1154cb  keep original x (xmm3) for the sign-check
    const xOrig = Math.fround(x);
    // @0x1154ce/@0x1154d5  s = |x|  (via andps abs-mask — bit-exactly the fp32 abs value)
    const s = Math.fround(Math.abs(xOrig));

    let v: number;
    // @0x1154e0/@0x1154e3  ucomiss K_BREAKPOINT, s ; jbe .Llog
    //   ucomiss sets CF=1 iff K_BREAKPOINT < s   (unordered result maps as GE_below);
    //   jbe branches iff CF=1 or ZF=1, i.e. iff K_BREAKPOINT <= s.
    //   → the LOG branch is taken when  s >= K_BREAKPOINT.
    if (s >= K_BREAKPOINT) {
      // --- LOG SEGMENT ---
      // @0x1154f3/@0x1154fb  1.137120 * s
      const arg = Math.fround(K_POW_PREFACTOR * s);
      // @0x11550b  powf(arg, 0.416670)
      const p = powf(arg, K_POW_EXPONENT);
      // @0x115517  p + (-0.055)
      v = Math.fround(p + K_POW_OFFSET);
    } else {
      // --- LINEAR SEGMENT ---
      // @0x1154ed  12.9200 * s
      v = Math.fround(K_LINEAR_SLOPE * s);
    }

    // @0x11551f-0x115534  sign-application via xorps signmask + cmpltss + blendvps.
    //   xmm2 = -v  (signmask XOR v)
    //   mask = (x < 0)  ? all-1s : 0
    //   v_out = mask ? xmm2 : v
    // → v_out = (x < 0) ? -v : v
    // Note: cmpltss is a signalling compare that treats NaN as unordered → mask=0 (falls
    // through to the positive branch). Math.fround(x) < 0 also returns false for NaN, so
    // this matches. The signmask XOR flips the sign bit even for NaNs / zeros / infinities
    // — TS's `Math.fround(-v)` does the same for all finite values and infinities; for NaN
    // the bit-pattern may differ but the semantic (still-NaN) matches.
    const vOut = xOrig < 0 ? fp32_sign_flip(v) : v;

    // @0x115539-0x115544  *R = *G = *B = v_out
    R.value = vOut;
    G.value = vOut;
    B.value = vOut;
    // @0x115549  *A = 1.0f  (raw i32 0x3f800000)
    A.value = ALPHA_ONE;
  }

  /**
   * ~HGLinearToERsRGBToneCurveLUTInfo()  (D1 base — in-place, no-op)
   * @Helium 0x0000000000115db0
   *
   * DECODE @0x115db0-0x115db5:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   * No cleanup: the class holds no owned resources of its own (all state is in the base
   * sub-object, which is destroyed by the base D2 elsewhere).
   */
  // No-op — modeled as an empty method (called from D0 below).
  destroyBase(): void {
    // @0x115db0-0x115db5: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq   (no work)
  }

  /**
   * ~HGLinearToERsRGBToneCurveLUTInfo()  (D0 deleting)
   * @Helium 0x0000000000115dc0
   *
   * DECODE @0x115dc0-0x115dc5:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv
   * Immediately tail-jumps to `::operator delete(void*)` without any in-object work.
   */
  destroyAndDelete(): void {
    // @0x115dc5  jmp __ZdlPv (this)  — the deallocation is the only observable effect.
    // We do not model `operator delete` in TS (the GC releases the object); recording the
    // frontier here as a comment keeps the provenance explicit.
    // (No-op in TS — same as sibling HGAYCCToneCurveToLinearLUTInfo.destroyAndDelete.)
  }

  /**
   * duplicate() const  →  new HGLinearToERsRGBToneCurveLUTInfo copy
   * @Helium 0x0000000000115dd0
   *   (__ZNK32HGLinearToERsRGBToneCurveLUTInfo9duplicateEv)
   *
   * DECODE @0x115dd0-0x115e03:
   *   0x115dd6  movq %rdi, %rbx                   → save `this` in rbx
   *   0x115dd9  movl $0x28, %edi                  → operator new size = 0x28 (40 bytes)
   *   0x115dde  callq __Znwm                      → rax = new HGLinearToERsRGBToneCurveLUTInfo
   *   0x115de3  movups 0x8(%rbx), %xmm0           → load  this->[+0x08..+0x17]  (16 bytes)
   *   0x115de7  movups 0x14(%rbx), %xmm1          → load  this->[+0x14..+0x23]  (16 bytes;
   *                                                  overlapping window — the two 16-byte
   *                                                  loads together cover [+0x08..+0x27] but
   *                                                  the second load repeats [+0x14..+0x17].
   *                                                  This is the standard clang emission for
   *                                                  copying a 32-byte struct with SSE using
   *                                                  two overlapping quadword-aligned reads:
   *                                                  the SECOND store's 4 bytes of overlap
   *                                                  overwrite the first store's tail with
   *                                                  the exact same value, so the effect is a
   *                                                  bit-exact 32-byte copy.)
   *   0x115deb  movups %xmm0, 0x8(%rax)           → store  new->[+0x08..+0x17]
   *   0x115def  movups %xmm1, 0x14(%rax)          → store  new->[+0x14..+0x23]  (with overlap)
   *   0x115df3  leaq 0x90734e(%rip), %rcx         → rcx = class vtable pointer
   *   0x115dfa  movq %rcx, (%rax)                 → new->vtable = HGLinearToERsRGBToneCurveLUTInfo::vtable
   *   0x115dfd-0x115e03  epilogue (rax = new pointer)
   *
   * Semantics: allocate a bit-identical 40-byte copy — vtable set to our class's, and the
   * inherited HGApplyNDLUTInfo state (bytes +0x08..+0x27) copied verbatim.
   */
  duplicate(): HGLinearToERsRGBToneCurveLUTInfo {
    // TS can't preserve the exact byte-copy semantics of the base sub-object since its
    // layout is opaque, but we mirror the structural intent: a fresh instance whose `base`
    // field aliases `this.base`. If/when the base is decoded, this becomes a real byte-wise
    // clone; for now the caller sees the same-typed peer with the same base identity,
    // consistent with the sibling AYCC port.
    const copy = Object.create(
      HGLinearToERsRGBToneCurveLUTInfo.prototype,
    ) as HGLinearToERsRGBToneCurveLUTInfo;
    // @0x115de3-0x115def  copy base sub-object bytes (opaque handle in TS)
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x115dfa  vtable is implicit through the prototype chain in TS.
    return copy;
  }
}
