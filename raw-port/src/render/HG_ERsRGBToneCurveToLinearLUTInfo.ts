// HG_ERsRGBToneCurveToLinearLUTInfo.ts — FCP Helium HG_ERsRGBToneCurveToLinearLUTInfo:
// extended-sRGB (sign-preserving) tone-curve → linear-light 1D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HG_ERsRGBToneCurveToLinearLUTInfo.*.s
//         (mangled symbols __ZN33HG_ERsRGBToneCurveToLinearLUTInfo* starting at
//          file offset 0x4000+0x115300 in the x86_64 slice).
//
// SIBLING TEMPLATE: raw-port/src/render/HGAYCCToneCurveToLinearLUTInfo.ts — this class uses
// the exact same wrapper pattern (HGApplyNDLUTInfo base + vtable-only derived class + no-op
// D1 + tail-jmp D0 + duplicate via new+overlapping-movups+vtable-rewrite). Only colorAtIndex
// differs; every other method matches structurally.
//
// STRUCT LAYOUT (recovered from ctor @0x115300 and duplicate @0x115d70):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x115d7e;
//   released via `__ZdlPv` in D0 @0x115d65.
//     +0x00  vtable  (installed by ctor @0x115315-0x11531c:
//                     `leaq 0x907ddc(%rip),%rax ; movq %rax,(%rbx)` — the sole class-specific
//                     write; all other 32 bytes of state live in the HGApplyNDLUTInfo base
//                     sub-object installed by the C2 base ctor @0x115310. duplicate re-installs
//                     the vtable @0x115d93-0x115d9a via `leaq 0x90735e(%rip),%rcx`.)
//     +0x08..+0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(unsigned long, unsigned long=1, float, float, LUTStorageFormat)`.
//                     The wrapper ctor forces the second `unsigned long` to 1 via
//                     `movl $0x1, %edx` @0x11530b before calling the base C2 — meaning this
//                     descriptor represents a 1-dimensional LUT, not an N-D one).
//
// EXPORTED SYMBOLS (six member functions):
//   @Helium 0x0000000000115300  ctor  (unsigned long, float, float, LUTStorageFormat)  (C2)
//   @Helium 0x0000000000115330  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000115380  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115d50  D1  (~HG_ERsRGBToneCurveToLinearLUTInfo — in-place, no-op)
//   @Helium 0x0000000000115d60  D0  (deleting, tail-calls operator delete)
//   @Helium 0x0000000000115d70  duplicate() const  →  a new heap-allocated copy
//
// SEMANTICS (from colorAtIndex disasm @0x115380-0x11541f):
//   Applies the extended sRGB inverse EOTF (encoded→linear, sign-preserving) to the first
//   channel and broadcasts the scalar result to R/G/B, writing 1.0f to alpha:
//
//     absX = |x|
//     f(x) = sign(x) * (
//              absX < 0.040449999                                    ┐  branch @0x1153b3 (ucomiss 0.04045)
//                ? // linear segment
//                  0.07733999937772751 * absX                        │  @0x1153b5..@0x1153bd
//                : // power segment
//                  pow(0.9478700160980225 * absX
//                      + 0.05212999880313873, 2.4)                   │  @0x1153c3..@0x1153ec
//            )
//
//   These are the canonical inverse sRGB EOTF constants (IEC 61966-2-1) with the standard
//   pre-inversions folded into the multiplications (1/12.92 = 0.07734, 1/1.055 = 0.94787,
//   0.055/1.055 = 0.05213). The "extended" ("E-Rs" in the class name) is the sign-preservation:
//   negative inputs pass through the SAME magnitude curve and then get their sign restored via
//   a `blendvps` on the (x0 < 0) mask.
//
//   The RIP-relative float constants were recovered from the Helium x86_64 __TEXT segment at
//   file offset 0x4000+VA (bytes read + decoded as little-endian f32):
//     @0x3c7c30 = packed 4×u32 0x7fffffff  (abs-mask;  movaps @0x11539e, andps @0x1153a5)
//     @0x3ca268 = +0.040449999272823334    (segment breakpoint;    movss @0x1153a8)
//     @0x3d4a00 = +0.07733999937772751     (linear segment slope;  movss @0x1153b5)
//     @0x3d49f8 = +0.9478700160980225      (power segment slope;   movss @0x1153c3)
//     @0x3d49fc = +0.05212999880313873     (power segment offset;  addss @0x1153cf)
//     @0x3ca278 = +2.4000000953674316      (power segment exponent; movss @0x1153d7)
//     @0x3ca0d0 = packed 4×f32 -0.0        (sign-negate mask;      movaps @0x1153ef)
//
//   The three output pointers %r12 (=R), %r15 (=G), %r14 (=B) are all written with the same
//   value from %xmm1; the alpha pointer %rbx is written the raw i32 0x3f800000 (== 1.0f).
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • HGApplyNDLUTInfo::HGApplyNDLUTInfo(unsigned long, unsigned long, float, float,
//     LUTStorageFormat) — base ctor called @0x115310.
//   • HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const — tail-called @0x11536a.
//   • __dynamic_cast — libc++abi RTTI helper called @0x115354.
//   • __Znwm / __ZdlPv — operator new / operator delete (called @0x115d7e / @0x115d65).
//   • _powf — libm scalar pow — called @0x1153e3.
//
// The vtable slot at @0x907ddc(%rip) (from @0x115315) is the class's own vtable — its member
// pointers (D0, D1, isEqual, colorAtIndex, duplicate, plus the base's virtual slots) are
// installed by the linker; they are treated here as the class's method table (TS methods on
// the class replace this).

import type {
  HGApplyNDLUTInfo_base,
  LUTStorageFormat,
  HGLUTCache_LUTInfo,
} from "./HGAYCCToneCurveToLinearLUTInfo";

// ── Frontier stubs (kept local so this file's demand signal is self-contained) ────────────

/**
 * `HGApplyNDLUTInfo::HGApplyNDLUTInfo(u64, u64, f32, f32, LUTStorageFormat)` — base C2 ctor.
 * @Helium 0x115310  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
 *
 * The wrapper forces `u64 #2 = 1` via `movl $0x1, %edx` @0x11530b before this call, so this
 * 1-D LUT descriptor's base is initialised with dimCount=1. The base layout is not yet
 * decoded — subclasses observe it only through the shared vtable.
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
      "@Helium 0x115310 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const` — tail-called at @0x11536a from our
 * own isEqual once the __dynamic_cast succeeds.
 *   @Helium 0x11536a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
 */
function HGApplyNDLUTInfo_base_isEqual_stub(
  _self: HGApplyNDLUTInfo_base,
  _other: HGApplyNDLUTInfo_base,
): boolean {
  throw new Error(
    "raise: HGApplyNDLUTInfo::isEqual @Helium 0x11536a is not yet decoded — the shared " +
      "HGApplyNDLUTInfo layout hasn't been transcribed; this class delegates the actual " +
      "field comparison to the base after RTTI validation.",
  );
}

/**
 * `__dynamic_cast` — libc++abi RTTI helper called at @0x115354 from our isEqual.
 * Itanium-ABI signature: `void* __dynamic_cast(const void* src, const std::type_info* srcType,
 * const std::type_info* dstType, ptrdiff_t hint)`. Returns adjusted derived-pointer on
 * success, nullptr on failure.
 *
 * @Helium 0x115354  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * See the sibling HGAYCCToneCurveToLinearLUTInfo.ts for rationale on raising rather than
 * returning src as-is.
 */
function dynamicCast_stub(
  _src: HGLUTCache_LUTInfo,
  _srcTypeInfoName: string,
  _dstTypeInfoName: string,
): HGApplyNDLUTInfo_base | null {
  throw new Error(
    "___dynamic_cast @Helium 0x115354 is not yet ported — the HGLUTCache::LUTInfo class " +
      "hierarchy has no JS-side RTTI shim yet.",
  );
}

/**
 * `powf(x, y)` — libm scalar single-precision power. Called at @0x1153e3 inside
 * `colorAtIndex`.
 *   @Helium 0x1153e3  callq 0x3c54f2   ## symbol stub for: _powf
 *
 * Faithful to libm's fp32 semantics: the result is `float`, i.e. Math.fround-narrowed after
 * a plain JS Math.pow.
 */
function powf(x: number, y: number): number {
  return Math.fround(Math.pow(x, y));
}

// ── f32 constants (values read directly from the Helium __TEXT segment) ──────────────────

/** @Helium 0x3ca268 — segment breakpoint (0.04045 of IEC 61966-2-1). */
const K_BREAK = Math.fround(0.040449999272823334);
/** @Helium 0x3d4a00 — 1/12.92 rounded to f32; linear segment slope. */
const K_LIN_SLOPE = Math.fround(0.07733999937772751);
/** @Helium 0x3d49f8 — 1/1.055 rounded to f32; power segment slope. */
const K_POW_SLOPE = Math.fround(0.9478700160980225);
/** @Helium 0x3d49fc — 0.055/1.055 rounded to f32; power segment offset. */
const K_POW_OFFSET = Math.fround(0.05212999880313873);
/** @Helium 0x3ca278 — power segment exponent (matches IEC 2.4 to fp32 rounding). */
const K_POW_EXPONENT = Math.fround(2.4000000953674316);
/** Bit-pattern for +1.0f written to the alpha out-pointer @0x115419. */
const ALPHA_ONE = Math.fround(1.0);

// ── The class ────────────────────────────────────────────────────────────────────────────

export class HG_ERsRGBToneCurveToLinearLUTInfo {
  /** +0x00 — vtable pointer @Helium 0x907ddc(%rip) — stored in TS as a class-level tag. */
  readonly __vtable = "HG_ERsRGBToneCurveToLinearLUTInfo::vtable @Helium 0x907ddc";

  /** +0x08..+0x27 — inherited HGApplyNDLUTInfo state (opaque; owned by the base sub-object). */
  readonly base: HGApplyNDLUTInfo_base;

  /**
   * ctor(unsigned long, float, float, HGApplyNDLUTInfo::LUTStorageFormat)
   * @Helium 0x0000000000115300  (__ZN33HG_ERsRGBToneCurveToLinearLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HG_ERsRGBToneCurveToLinearLUTInfo.HG_ERsRGBToneCurveToLinearLUTInfoC2.s):
   *   0x115306  movl %edx, %ecx         → LUTStorageFormat (arg4, edx) moved to ecx (arg5 to base)
   *   0x115308  movq %rdi, %rbx         → save `this`
   *   0x11530b  movl $0x1, %edx         → force base-ctor's dim1 = 1  (1-D LUT)
   *   0x115310  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo(this, dim0=arg1(rsi), dim1=1, minF=arg2(xmm0),
   *                                   maxF=arg3(xmm1), storage=arg4(ecx))
   *   0x115315  leaq 0x907ddc(%rip), %rax → load class vtable pointer (VA 0xa1d0f8)
   *   0x11531c  movq %rax, (%rbx)       → this->vtable = HG_ERsRGBToneCurveToLinearLUTInfo::vtable
   *   0x115325  retq
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
    // @0x115310  base(this, dim0, 1, minF, maxF, storage) — raises via the stub.
    HGApplyNDLUTInfo_base_ctor_stub(base, dim0, 1n, Math.fround(minF), Math.fround(maxF), storage);
    this.base = base;
  }

  /**
   * isEqual(HGLUTCache::LUTInfo*) const  →  bool
   * @Helium 0x0000000000115330  (__ZNK33HG_ERsRGBToneCurveToLinearLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HG_ERsRGBToneCurveToLinearLUTInfo.isEqual.s @0x115330-0x115377):
   *   0x115336  testq %rsi, %rsi       → null-check `other`
   *   0x115339  je 0x11536f            → if null: xorl eax,eax ; ret 0  (false)
   *   0x11533b  movq %rdi, %rbx        → save `this`
   *   0x11533e  movq 0x8ecf9b(%rip), %rax → load `&HGLUTCache::LUTInfo::typeinfo` (srcType)
   *   0x115345  leaq __ZTI33HG_ERsRGBToneCurveToLinearLUTInfo(%rip), %rdx  → dstType (this class)
   *   0x11534c  movq %rsi, %rdi        → src = other
   *   0x11534f  movq %rax, %rsi        → srcTypeInfo
   *   0x115352  xorl %ecx, %ecx        → hint = 0
   *   0x115354  callq 0x3c5018         → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x115359  testq %rax, %rax       → check result
   *   0x11535c  je 0x11536f            → if null (cast failed): return false
   *   0x11535e  movq %rbx, %rdi        → this  (for the tail call)
   *   0x115361  movq %rax, %rsi        → the successfully-cast `other`
   *   0x11536a  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HG_ERsRGBToneCurveToLinearLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches.
   */
  isEqual(other: HGLUTCache_LUTInfo | null): boolean {
    // 0x115336-0x115339  null-check
    if (other === null) return false;
    // 0x115354  callq ___dynamic_cast(other, HGLUTCache::LUTInfo TI, HG_ERsRGBToneCurveToLinearLUTInfo TI, 0)
    const cast = dynamicCast_stub(
      other,
      "HGLUTCache::LUTInfo",                          // srcTypeInfo (from %rip+0x8ecf9b)
      "HG_ERsRGBToneCurveToLinearLUTInfo",            // dstTypeInfo (from %rip literal @0x115345)
    );
    // 0x115359-0x11535c  if cast failed → false
    if (cast === null) return false;
    // 0x11536a  jmp HGApplyNDLUTInfo::isEqual(this, cast)  (tail call)
    return HGApplyNDLUTInfo_base_isEqual_stub(this.base, cast);
  }

  /**
   * colorAtIndex(float, float, float, float*, float*, float*, float*) const
   * @Helium 0x0000000000115380  (__ZNK33HG_ERsRGBToneCurveToLinearLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (raw-port/re/disasm/Helium.HG_ERsRGBToneCurveToLinearLUTInfo.colorAtIndex.s
   *   @0x115380-0x11542b):
   *
   *   0x11538f-0x11539b  save R=r12, G=r15, B=r14, A=rbx  (output pointers);  xmm3 = x0 = xmm0
   *   0x11539e  movaps 0x2b288b(rip), %xmm2       → xmm2 = abs-mask (4×0x7fffffff) @0x3c7c30
   *   0x1153a5  andps  %xmm0, %xmm2                → xmm2 = |x0|
   *   0x1153a8  movss  0x2b4eb8(rip), %xmm0        → xmm0 = 0.040449999f            @0x3ca268
   *   0x1153b0  ucomiss %xmm2, %xmm0               → CF=(K_BREAK < |x0|), ZF=(K_BREAK == |x0|)
   *   0x1153b3  jbe    0x1153c3                    → jump when K_BREAK <= |x0|  (→ power branch)
   *   ── linear branch (|x0| < K_BREAK) @0x1153b5..@0x1153c1 ──
   *     0x1153b5  movss  0x2bf643(rip), %xmm1     → xmm1 = 0.07733999937772751f   @0x3d4a00
   *     0x1153bd  mulss  %xmm2, %xmm1              → xmm1 = K_LIN_SLOPE * |x0|
   *     0x1153c1  jmp    0x1153ef
   *   ── power branch (|x0| >= K_BREAK) @0x1153c3..@0x1153ec ──
   *     0x1153c3  movss  0x2bf62d(rip), %xmm0     → xmm0 = 0.9478700160980225f   @0x3d49f8
   *     0x1153cb  mulss  %xmm2, %xmm0              → xmm0 = K_POW_SLOPE * |x0|
   *     0x1153cf  addss  0x2bf625(rip), %xmm0     → xmm0 += 0.05212999880313873f @0x3d49fc
   *     0x1153d7  movss  0x2b4e99(rip), %xmm1     → xmm1 = 2.4000000953674316f   @0x3ca278
   *     0x1153df  movaps %xmm3, -0x30(%rbp)       → spill xmm3 across call
   *     0x1153e3  callq  _powf                     → xmm0 = powf(K_POW_SLOPE*|x0|+K_POW_OFFSET, 2.4)
   *     0x1153e8  movaps -0x30(%rbp), %xmm3       → reload xmm3
   *     0x1153ec  movaps %xmm0, %xmm1              → xmm1 = powf-result
   *   ── merge — restore the input's sign onto the magnitude (blendvps) ──
   *     0x1153ef  movaps 0x2b4cda(rip), %xmm2     → xmm2 = negate-mask (4×-0.0f) @0x3ca0d0
   *     0x1153f6  xorps  %xmm1, %xmm2              → xmm2 = -xmm1
   *     0x1153f9  xorps  %xmm0, %xmm0              → xmm0 = 0
   *     0x1153fc  cmpltss %xmm0, %xmm3             → xmm3 = (x0 < 0) ? all-1 : 0
   *     0x115401  movaps %xmm3, %xmm0              → xmm0 = mask (blendvps consumes XMM0)
   *     0x115404  blendvps %xmm0, %xmm2, %xmm1     → if x0<0: xmm1 = xmm2 (=-mag); else keep xmm1
   *   ── store R=G=B=xmm1, A=1.0f ──
   *     0x115409  movss %xmm1, (%r12)              → *R = f(x0)
   *     0x11540f  movss %xmm1, (%r15)              → *G = f(x0)
   *     0x115414  movss %xmm1, (%r14)              → *B = f(x0)
   *     0x115419  movl  $0x3f800000, (%rbx)        → *A = 1.0f (bit-pattern)
   *     0x11542b  retq
   *
   * Only the first color-channel argument (`r`) is used; the other two (`g`, `b`) are
   * ignored by the disasm — the function evaluates a single scalar tone curve and broadcasts
   * the result to all three RGB output pointers, then writes alpha = 1.0.
   *
   * @param r      xmm0 — the input scalar (only value that matters).
   * @param _g     xmm1 — ignored (2nd float arg; overwritten before any read).
   * @param _b     xmm2 — ignored (3rd float arg; overwritten before any read).
   * @param rOut   %rsi=%r12 — output R pointer wrapper.
   * @param gOut   %rdx=%r15 — output G pointer wrapper.
   * @param bOut   %rcx=%r14 — output B pointer wrapper.
   * @param aOut   %r8=%rbx  — output alpha pointer wrapper.
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
    // Narrow to fp32 so ucomiss / cmpltss semantics match.
    const x0 = Math.fround(r);                        // @0x11539b
    const absX = Math.fround(Math.abs(x0));           // @0x11539e-0x1153a5

    let mag: number;
    // 0x1153b0-0x1153b3  ucomiss K_BREAK, |x0| ; jbe → jump when K_BREAK <= |x0| (power branch).
    // ucomiss %xmm2,%xmm0 sets CF=(xmm0 < xmm2), ZF=(xmm0 == xmm2). jbe = CF|ZF, so it jumps
    // when K_BREAK <= |x0|. The fall-through is therefore K_BREAK > |x0|.
    if (K_BREAK > absX) {
      // ── linear segment @0x1153b5..@0x1153bd ──
      mag = Math.fround(K_LIN_SLOPE * absX);          // @0x1153bd
    } else {
      // ── power segment @0x1153c3..@0x1153ec ──
      // The branch guard ensures |x0| >= 0.04045, so the base is strictly > K_POW_OFFSET > 0
      // and _powf is well-defined (no libm errno-domain concerns).
      const base = Math.fround(
        Math.fround(K_POW_SLOPE * absX) + K_POW_OFFSET,   // @0x1153cb + @0x1153cf
      );
      mag = powf(base, K_POW_EXPONENT);              // @0x1153e3 (exponent from @0x1153d7)
    }

    // Merge — sign restoration @0x1153ef-0x115404. blendvps(xmm1, xmm2, mask=xmm3-sign) with
    // mask = (x0 < 0 ? all-1 : 0): if x0<0 → result = -mag; else → result = mag.
    const result = x0 < 0 ? Math.fround(-mag) : mag;

    // 0x115409-0x115419  store R=G=B=result, A=1.0f
    rOut.value = result;                              // @0x115409  movss %xmm1, (%r12)
    gOut.value = result;                              // @0x11540f  movss %xmm1, (%r15)
    bOut.value = result;                              // @0x115414  movss %xmm1, (%r14)
    aOut.value = ALPHA_ONE;                           // @0x115419  movl $0x3f800000, (%rbx)
  }

  /**
   * ~HG_ERsRGBToneCurveToLinearLUTInfo()  — the D1 (in-place) destructor.
   * @Helium 0x0000000000115d50  (__ZN33HG_ERsRGBToneCurveToLinearLUTInfoD1Ev)
   *
   * Trivial frame: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq` — no-op body. There is no
   * derived-class field owning ref-counted state, so ~HG_ERsRGB… only unwinds the stack.
   */
  destruct_D1(): void {
    // no-op @0x115d50
  }

  /**
   * ~HG_ERsRGBToneCurveToLinearLUTInfo()  — the D0 (deleting) destructor.
   * @Helium 0x0000000000115d60  (__ZN33HG_ERsRGBToneCurveToLinearLUTInfoD0Ev)
   *
   * `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv` — tail-calls `operator delete(this)`.
   * In TS with GC there is nothing to do.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x115d65  → in TS this is a no-op under GC.
  }

  /**
   * duplicate() const  →  HG_ERsRGBToneCurveToLinearLUTInfo*
   * @Helium 0x0000000000115d70  (__ZNK33HG_ERsRGBToneCurveToLinearLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HG_ERsRGBToneCurveToLinearLUTInfo.duplicate.s):
   *   0x115d76  movq %rdi, %rbx           → save `this`
   *   0x115d79  movl $0x28, %edi          → allocation size = 0x28 (40 bytes = sizeof)
   *   0x115d7e  callq __Znwm              → new(0x28)  → rax = new-obj
   *   0x115d83  movups 0x8(%rbx), %xmm0   → load 16B from this+0x08 (bytes 0x08..0x17)
   *   0x115d87  movups 0x14(%rbx), %xmm1  → load 16B from this+0x14 (bytes 0x14..0x23)
   *                                         NB: these two loads overlap by 4 bytes to cover
   *                                             the full 32-byte base sub-object (0x08..0x27)
   *                                             with 2× unaligned 16B ops.
   *   0x115d8b  movups %xmm0, 0x8(%rax)   → store 16B at new-obj+0x08
   *   0x115d8f  movups %xmm1, 0x14(%rax)  → store 16B at new-obj+0x14
   *   0x115d93  leaq 0x90735e(%rip), %rcx → load class vtable pointer (same VA 0xa1d0f8)
   *   0x115d9a  movq %rcx, (%rax)         → new-obj->vtable = HG_ERsRGB…::vtable
   *   0x115da3  retq                      → return the new object in %rax
   *
   * Semantics: heap-allocated shallow-byte-copy of `this`. The TS port mirrors this by
   * allocating a new instance via `Object.create` (bypassing the base-ctor stub) and copying
   * the opaque `base` handle across.
   */
  duplicate(): HG_ERsRGBToneCurveToLinearLUTInfo {
    // We can't invoke this class's own constructor here (it would call the base ctor stub
    // and raise). Faithful port: allocate a new instance without going through the ctor,
    // then copy the base handle bytes across (mirroring the two overlapping movups).
    const copy = Object.create(HG_ERsRGBToneCurveToLinearLUTInfo.prototype) as HG_ERsRGBToneCurveToLinearLUTInfo;
    // @0x115d83-0x115d8f: byte-copy of the base sub-object 0x08..0x27 (32B).
    (copy as unknown as { base: HGApplyNDLUTInfo_base }).base = this.base;
    // @0x115d93-0x115d9a: vtable write — implicit in TS via `Object.create(...prototype)`.
    return copy;
  }
}

/**
 * Vtable-slot layout (recovered from ctor's `leaq 0x907ddc(%rip)` @0x115315 pointing at the
 * class's vtable in Helium __DATA_CONST). This class overrides at least:
 *   • ~D0/~D1  →  destruct_D0 / destruct_D1
 *   • isEqual   →  isEqual
 *   • duplicate →  duplicate
 *   • colorAtIndex → colorAtIndex
 * Other virtual slots (from HGApplyNDLUTInfo / HGLUTCache::LUTInfo) are inherited unchanged.
 */
export const HG_ERsRGBToneCurveToLinearLUTInfo_vtable_addr = "@Helium 0x907ddc" as const;
