// HGCanonLogLinearizationLUTInfo.ts — FCP Helium HGCanonLogLinearizationLUTInfo:
// Canon Log (C-Log 1) tone-curve → linear-light 1-D LUT descriptor. Sibling of the
// HGCanonLog2 / HGCanonLog3 / HGSonySLog2 / HGSonySLog3 log-linearization info classes
// (they share the guarded-static-local-init pattern and the same 5-slot HGApplyNDLUTInfo
// base sub-object shape).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// DECODE:    raw-port/re/disasm/Helium.HGCanonLogLinearizationLUTInfo.*.s
//            plus manual extraction of the .cold.1 tail (guard-variable initialiser).
//
// STRUCT LAYOUT (recovered from ctor @0x113b40 and duplicate @0x1157d0):
//   sizeof = 0x28 (40 bytes). Allocated via `__Znwm(0x28)` in duplicate @0x1157de;
//   released via `__ZdlPv` in D0 @0x1157c5 (tail-jmp to operator delete).
//     +0x00           vtable ptr  — installed by ctor @0x113b55-0x113b5c
//                     (`leaq 0x9090ec(%rip),%rax ; movq %rax,(%rbx)`, target vtable
//                     @Helium 0xa1cc48; the same vtable is re-installed by duplicate at
//                     @0x1157f3-0x1157fa via `leaq 0x90744e(%rip),%rcx ; movq %rcx,(%rax)`).
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state (32 bytes; ctor arguments
//                     `(numBins:u64, numDims:u64=1, rangeScale:f32, rangeOffset:f32,
//                     storage:LUTStorageFormat)`. The wrapper ctor forces the second
//                     `unsigned long` to 1 via `movl $0x1, %edx` @0x113b4b — meaning this
//                     descriptor represents a 1-dimensional LUT.)
//   The derived class contributes NO additional state — every non-vtable byte of the
//   40-byte object lives in the HGApplyNDLUTInfo base sub-object.
//
// EXPORTED SYMBOLS (7 member functions):
//   @Helium 0x0000000000113b40  HGCanonLogLinearizationLUTInfo(u64, f32, f32, LUTStorageFormat)  [C2/C1]
//   @Helium 0x0000000000113b70  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000113bc0  colorAtIndex(f32, f32, f32, f32*, f32*, f32*, f32*) const
//   @Helium 0x00000000001157b0  ~HGCanonLogLinearizationLUTInfo()   [D1 — in-place / trivial]
//   @Helium 0x00000000001157c0  ~HGCanonLogLinearizationLUTInfo()   [D0 — tail-jmp to operator delete]
//   @Helium 0x00000000001157d0  duplicate() const  →  new heap-allocated shallow copy
//   @Helium 0x00000000003c3dc0  colorAtIndex.cold.1 (guard-variable initialiser for `aa`)
//
// RUNTIME STATIC LOCAL (Meyers singleton inside colorAtIndex):
//   @Helium __DATA:
//     __ZZNK30HGCanonLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa @0xade100 (BSS)
//   Guard byte:
//     __ZGVZNK30HGCanonLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2aa @0xade108 (BSS)
//   Initialised exactly once by `.cold.1` @0x3c3dc0-0x3c3ded (guarded by
//   __cxa_guard_acquire/release):
//       movabsq $0x40116808484c167b, %rax    ; aa (as u64 bit-pattern)
//       movq    %rax, aa(%rip)               ; aa = 4.351594094890625  (fp64)
//   The hot path checks the guard byte with `movzbl guard(%rip),%eax; testb %al,%al; je cold`
//   (@0x113c02-0x113c0b) — on cold path the initialiser runs (via `.cold.1`), then the same
//   computation is re-entered @0x113c8b (fall-through back to @0x113c0d). In TS the JS
//   runtime handles module-level `const` init, so we don't need the guard shim; we
//   hard-code the initialiser's exact fp64 value below as `K_aa`.
//
// SEMANTICS (from colorAtIndex disasm @0x113bc0-0x113c80):
//   The Canon Log (1) → linear-light transfer function is a piecewise curve applied
//   identically to every input channel — only the first argument (r) matters, and the
//   result is broadcast to R, G, B; alpha is set to 1.0f.
//
//   Let x = (double)r (`cvtss2sd` @0x113bd7). Let:
//       kMinLogGamma  = -0.0730593607305936    (@Helium __literal8 0x3d4aa8)
//       kMaxLogGamma  =  1.0947488584474885    (@Helium __literal8 0x3d4a98)
//       tBranch       =  0.0730597             (@Helium __literal8 0x3d4a80,
//                                                the exp-branch split threshold)
//       nBranch       = -0.0730597             (@Helium __literal8 0x3d4a88,
//                                                the addsd fall-through constant)
//       aa            =  4.351594094890625     (guarded static @0xade100;
//                                                Canon's ln(10)/log10-scale conversion factor)
//       K_neg_one     = -1.0                   (@Helium __literal8 0x3ca300)
//       divTable[0]   = 10.1596                (@Helium __literal8 0x3d49d0)
//       divTable[1]   = -10.1596               (@Helium __literal8 0x3d49d8)
//
//   Step 1 — clamp the input x to the log-gamma domain (`xmm1` in the disasm holds the
//   clamped value):
//     if x < kMinLogGamma:  xmm1 = kMinLogGamma            @0x113bde..@0x113bea (jbe fall)
//     elif x > kMaxLogGamma: xmm1 = kMaxLogGamma           @0x113bec..@0x113bf8 (jbe fall)
//     else: xmm1 = x                                       @0x113bf4 movapd (in-range)
//
//   NOTE: `jbe 0x113c02` at @0x113bea skips both clamp writes if kMinLogGamma <= x, and
//   inside the else the `movapd %xmm0,%xmm1` at @0x113bf4 is only reached when the upper
//   compare's `ucomisd 0x2c0ea4(%rip),%xmm0` was NOT above (i.e. x <= kMaxLogGamma), then
//   `jbe 0x113c02` at @0x113bf8 skips the upper-clamp write. So xmm1 ends up:
//       xmm1 = clamp(x, kMinLogGamma, kMaxLogGamma).
//
//   Step 2 — pick the exp-branch based on whether the CLAMPED value is below +tBranch:
//     ucomisd xmm0(=tBranch), xmm1(=clamped_x)             @0x113c18
//     al = (xmm1 < tBranch)  via setb                      @0x113c1c
//     if xmm1 < tBranch:  # "lower half" (log-signed negative)
//         xmm0 = xmm1 + nBranch  = xmm1 - tBranch          @0x113c21..@0x113c29
//         (i.e. xmm0 = clamped_x - tBranch, a NON-POSITIVE value ≤ 0)
//     else:              # "upper half" (log-signed positive)
//         xmm0 = tBranch - xmm1  = xmm0 - xmm1              @0x113c2f subsd
//         (i.e. xmm0 = tBranch - clamped_x, a NON-POSITIVE value ≤ 0)
//     r13 = al  (0 for upper, 1 for lower)                 @0x113c33 movb %al,%r13b
//
//   Step 3 — multiply by aa, then exp; then subtract 1; then divide by ±10.1596:
//     xmm0 *= aa                                            @0x113c36 mulsd aa
//     xmm0 = exp(xmm0)                                      @0x113c3e callq _exp
//     xmm0 += -1                                            @0x113c43 addsd -1.0
//     xmm0 /= divTable[r13]                                 @0x113c4b..@0x113c52 divsd (%rax,%r13,8)
//       (r13=0 → /  10.1596   (upper branch),
//        r13=1 → / -10.1596   (lower branch))
//     y = (fp32)xmm0                                        @0x113c58 cvtsd2ss
//
//   Step 4 — broadcast y to R/G/B and write 1.0f to A:
//     *R = y                                                @0x113c5c
//     *G = y                                                @0x113c62
//     *B = y                                                @0x113c67
//     *A = reinterpret<f32>(0x3f800000) = 1.0f              @0x113c6c
//
//   This is exactly Canon's published Canon Log 1 decode formula, in symmetric-log form
//   with a positive branch threshold ±0.0730597 and gain ±10.1596. Note the sign of the
//   division constant is what flips the "sign of the log": both branches feed a NON-
//   POSITIVE argument into exp() and rely on the sign of divTable to place the linear-light
//   output on the correct side of the pivot.
//
// FRONTIER — NONE. All calls are decoded:
//   * base ctor  →  HGApplyNDLUTInfo::HGApplyNDLUTInfo (imported directly; already landed).
//   * base isEqual → HGApplyNDLUTInfo.isEqual (imported directly).
//   * _exp        →  Math.exp (IEEE-754 fp64 natural exp; libm-equivalent).
//   * __dynamic_cast → modeled as `instanceof HGApplyNDLUTInfo` (JS-side RTTI shim; the
//     tail-call to the base's isEqual then does the field comparison).
//   * operator new / delete → JS `Object.create` / GC.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo";

// ── Recovered fp64 constants (inlined literal-pool duplicates + guarded static) ──────────
// Every value was read directly from the Helium binary at the annotated __literal8 offset
// (via `python3 raw-port/army/tools/resolve.py Helium const 0xVA`).

/** kMinLogGamma — @Helium __literal8 0x3d4aa8 (bit pattern 0xbfb2b404ad012b40). */
const K_kMinLogGamma = -0.0730593607305936;
/** kMaxLogGamma — @Helium __literal8 0x3d4a98 (bit pattern 0x3ff184176105d841).
 *  (Note: the same fp64 value as HGCanonLog2's kMaxLogGamma at @0x3d5180.) */
const K_kMaxLogGamma = 1.0947488584474885;
/** Positive branch threshold — @Helium __literal8 0x3d4a80 (bit pattern 0x3fb2b40a5e27d384). */
const K_tBranch = 0.0730597;
/** Negative branch offset — @Helium __literal8 0x3d4a88 (bit pattern 0xbfb2b40a5e27d384). */
const K_nBranch = -0.0730597;
/** Post-exp -1.0 — @Helium __literal8 0x3ca300 (bit pattern 0xbff0000000000000). */
const K_neg_one = -1.0;
/** Divisor table [10.1596, -10.1596] — @Helium __literal8 0x3d49d0 / 0x3d49d8
 *  (bit patterns 0x402451b71758e219 / 0xc02451b71758e219). Indexed by `al = (x<tBranch)`. */
const K_divTable: readonly [number, number] = [10.1596, -10.1596];
/** Meyers-singleton static `aa` — @Helium 0xade100 (BSS), initialised by cold.1 @0x3c3dc0
 *  from movabsq $0x40116808484c167b to fp64 4.351594094890625. */
const K_aa = 4.351594094890625;
/** Alpha output — bit-pattern 0x3f800000 written directly via `movl $0x3f800000,(%rbx)`
 *  @0x113c6c — reinterpret as f32 → 1.0f. */
const K_ALPHA_ONE = Math.fround(1.0);

/** `HGLUTCache::LUTInfo` — opaque base handle used only by the RTTI check in `isEqual`.
 *  Real hierarchy is a distant ancestor of HGApplyNDLUTInfo; not decoded here (nor
 *  in HGApplyNDLUTInfo). The check is modeled as `instanceof HGApplyNDLUTInfo`. */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

/**
 * `HGCanonLogLinearizationLUTInfo` — Helium C-Log 1 → linear 1-D LUT descriptor.
 *
 * Vtable @Helium 0xa1cc48 (ctor's `leaq 0x9090ec(%rip),%rax` @0x113b55 targets this
 * address; duplicate's `leaq 0x90744e(%rip),%rcx` @0x1157f3 targets the same address).
 * Vtable slots (recovered indirectly — same layout as HGCanonLog2's vtable):
 *   *0x00 = ~D1
 *   *0x08 = ~D0
 *   *0x18 = isEqual         (this class's isEqual @0x113b70)
 *   *0x20 = colorAtIndex    (this class's colorAtIndex @0x113bc0)
 *   *0x28 = duplicate       (this class's duplicate @0x1157d0)
 *
 * All state lives in the inherited `HGApplyNDLUTInfo` base sub-object at [+0x08 .. +0x27].
 * The derived class contributes ONLY the vtable pointer.
 */
export class HGCanonLogLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /** vtable pointer @0x00 — installed = 0xa1cc48 (HGCanonLogLinearizationLUTInfo vtable).
   *  Overrides the base's `vtable` field (which HGApplyNDLUTInfo sets to 0xa06558). */
  declare vtable: number;

  /**
   * ctor(u64 numBins, f32 rangeScale, f32 rangeOffset, LUTStorageFormat storage)
   * @Helium 0x0000000000113b40  (__ZN30HGCanonLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLogLinearizationLUTInfo.HGCanonLogLinearizationLUTInfo.s):
   *   0x113b46  movl %edx, %ecx           → LUTStorageFormat (arg4, edx) copied to ecx (base arg5)
   *   0x113b48  movq %rdi, %rbx           → save `this` in rbx
   *   0x113b4b  movl $0x1, %edx           → force base's numDims (arg2) = 1  (1-D LUT)
   *   0x113b50  callq __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *                → HGApplyNDLUTInfo::HGApplyNDLUTInfo(this,
   *                                                     numBins  = arg1(rsi),
   *                                                     numDims  = 1,
   *                                                     rangeScale  = arg2(xmm0),
   *                                                     rangeOffset = arg3(xmm1),
   *                                                     storage  = arg4(ecx))
   *   0x113b55  leaq 0x9090ec(%rip), %rax → rax = 0xa1cc48  (this class's vtable)
   *   0x113b5c  movq %rax, (%rbx)         → this->vtable = 0xa1cc48
   *                                          (overrides the base ctor's earlier write of
   *                                           the HGApplyNDLUTInfo vtable @0xa06558).
   *   0x113b65  retq
   *
   * Base's numDims-clamp path (see HGApplyNDLUTInfo ctor: numDims != 3 → 1) is a no-op here
   * because we already pass 1 — the base assigns numDims=1 unconditionally in that path.
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @0x113b50: base ctor with dim1 forced to 1.
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // @0x113b55..0x113b5c: overwrite the base's vtable pointer with THIS class's vtable.
    this.vtable = 0xa1cc48;
  }

  /**
   * `isEqual(HGLUTCache::LUTInfo* other) const  →  bool`
   * @Helium 0x0000000000113b70  (__ZNK30HGCanonLogLinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLogLinearizationLUTInfo.isEqual.s):
   *   0x113b76  testq %rsi, %rsi          → null-check `other`
   *   0x113b79  je 0x113baf               → if null: xorl eax,eax ; ret 0  (false)
   *   0x113b7b  movq %rdi, %rbx           → save `this`
   *   0x113b7e  movq 0x8ee75b(%rip), %rax → &__ZTIN10HGLUTCache7LUTInfoE  (srcType)
   *   0x113b85  leaq __ZTI30HGCanonLogLinearizationLUTInfo(%rip), %rdx → dstType
   *   0x113b8c  movq %rsi, %rdi           → src = other
   *   0x113b8f  movq %rax, %rsi           → srcTypeInfo
   *   0x113b92  xorl %ecx, %ecx           → hint = 0
   *   0x113b94  callq 0x3c5018            → ___dynamic_cast(other, srcTI, dstTI, 0)
   *   0x113b99  testq %rax, %rax          → check RTTI cast result
   *   0x113b9c  je 0x113baf               → if null (cast failed): return false
   *   0x113b9e  movq %rbx, %rdi           → this
   *   0x113ba1  movq %rax, %rsi           → the successfully-cast `other`
   *   0x113baa  jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                → tail-call HGApplyNDLUTInfo::isEqual(this, cast_other)
   *
   * Semantics: two HGCanonLogLinearizationLUTInfo instances are equal iff they have the
   * same dynamic type AND their inherited HGApplyNDLUTInfo state matches. The class
   * contributes NO additional state to the comparison.
   *
   * RTTI mapping (per PORTING_SPEC rule 3): the C++ `dynamic_cast<HGCanonLogLinearizationLUTInfo*>`
   * is modeled by the JS-side `instanceof` check on the DERIVED class (not the base) —
   * the base's `isEqual` uses `instanceof HGApplyNDLUTInfo`, which is a strict superset,
   * so an instance of a sibling subclass would slip through the base check but is caught
   * here by the tighter `instanceof HGCanonLogLinearizationLUTInfo`.
   */
  isEqual(other: HGLUTCache_LUTInfo | HGApplyNDLUTInfo | null): boolean {
    // @0x113b76-0x113b79: null-check
    if (other == null) return false;
    // @0x113b94: dynamic_cast<HGCanonLogLinearizationLUTInfo*>(other). In JS this is
    // an instanceof against THIS class — sibling subclasses fail here.
    if (!(other instanceof HGCanonLogLinearizationLUTInfo)) return false;
    // @0x113baa: tail-call HGApplyNDLUTInfo::isEqual(this, cast_other).
    return super.isEqual(other);
  }

  /**
   * `colorAtIndex(f32 r, f32 g, f32 b, f32* rOut, f32* gOut, f32* bOut, f32* aOut) const`
   * @Helium 0x0000000000113bc0  (__ZNK30HGCanonLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLogLinearizationLUTInfo.colorAtIndex.s):
   *
   *   ── Prologue / register save (rbx=aOut, r14=bOut, r15=gOut, r12=rOut) ──
   *   0x113bce  movq %r8, %rbx            → save aOut
   *   0x113bd1  movq %rcx, %r14           → save bOut
   *   0x113bd4  movq %rdx, %r15           → save gOut
   *   0x113bdb  movq %rsi, %r12           → save rOut
   *
   *   ── Widen r (fp32 → fp64) ──
   *   0x113bd7  cvtss2sd %xmm0, %xmm0     → xmm0 = (double)r
   *
   *   ── Step 1 — clamp x to [kMinLogGamma, kMaxLogGamma] into xmm1 ──
   *   0x113bde  movsd @0x3d4aa8, %xmm1    → xmm1 = kMinLogGamma  (-0.0730593607305936)
   *   0x113be6  ucomisd %xmm0, %xmm1      → flags: xmm1 vs xmm0
   *   0x113bea  ja 0x113c02               → if xmm1 > xmm0 (i.e. x < kMinLogGamma):
   *                                             leave xmm1 = kMinLogGamma → jump to guard-check
   *                                         else fall through
   *   0x113bec  ucomisd @0x3d4a98, %xmm0  → cmp x with kMaxLogGamma
   *   0x113bf4  movapd %xmm0, %xmm1       → xmm1 = x           (candidate: in-range clamp)
   *   0x113bf8  jbe 0x113c02              → if x <= kMaxLogGamma → guard-check with xmm1=x
   *                                         else fall through (x > kMaxLogGamma)
   *   0x113bfa  movsd @0x3d4a98, %xmm1    → xmm1 = kMaxLogGamma  (upper clamp)
   *   ; @0x113c02: xmm1 now holds the clamped value.
   *
   *   NOTE on the `ucomisd`/branch semantics:
   *     @0x113be6 `ucomisd %xmm0, %xmm1` sets CF = (xmm1 < xmm0), ZF = (xmm1 == xmm0).
   *     `ja` fires on CF=0 ∧ ZF=0, i.e. xmm1 > xmm0 (in AT&T-flag sense with unordered
   *     giving CF=ZF=PF=1, `ja` does NOT fire). So the branch condition "xmm1 > xmm0"
   *     ≡ "kMinLogGamma > x" ≡ "x < kMinLogGamma".
   *     @0x113bec `ucomisd @mem, %xmm0` sets CF = (xmm0 < mem), ZF = (xmm0 == mem);
   *     `jbe` (CF=1 ∨ ZF=1) fires on "xmm0 <= mem" ≡ "x <= kMaxLogGamma".
   *
   *   ── Guard check for the Meyers-singleton `aa` (@0xade108 → BSS byte) ──
   *   0x113c02  movzbl guard(%rip), %eax  → eax = *guard  (0 = uninit, 1 = init)
   *   0x113c09  testb %al, %al
   *   0x113c0b  je 0x113c81               → if guard==0 → cold path @0x113c81 (init aa,
   *                                                       then jmp back to @0x113c0d)
   *
   *   ── Step 2 — pick exp-branch based on `xmm1 vs tBranch` (positive threshold 0.0730597) ──
   *   0x113c0d  movsd @0x3d4a80, %xmm0    → xmm0 = tBranch  (+0.0730597)
   *   0x113c15  xorl %r13d, %r13d         → r13 = 0
   *   0x113c18  ucomisd %xmm0, %xmm1      → flags: xmm1 vs xmm0  (i.e. clamped_x vs tBranch)
   *   0x113c1c  setb %al                  → al = 1 iff CF=1 iff xmm1 < xmm0 iff clamped_x < tBranch
   *   0x113c1f  jb 0x113c2f               → if clamped_x < tBranch → jump to lower-branch path
   *
   *   ── Upper branch (clamped_x >= tBranch): xmm0 = xmm1 + nBranch = clamped_x - tBranch ──
   *   0x113c21  addsd @0x3d4a88, %xmm1    → xmm1 += nBranch  = xmm1 - tBranch  (≤ 0 in this range)
   *                                           NB: `addsd -tBranch` since nBranch = -tBranch.
   *   0x113c29  movapd %xmm1, %xmm0       → xmm0 = xmm1  = clamped_x - tBranch
   *   0x113c2d  jmp 0x113c33              → skip subsd
   *
   *   ── Lower branch (clamped_x < tBranch): xmm0 = tBranch - clamped_x = xmm0 - xmm1 ──
   *   0x113c2f  subsd %xmm1, %xmm0        → xmm0 = tBranch - clamped_x       (> 0 in this range)
   *
   *   ── Common tail (@0x113c33) ──
   *   0x113c33  movb %al, %r13b           → r13 = 1 if lower branch, 0 if upper
   *
   *   NOTE on branch sign: both branches produce a POSITIVE argument in xmm0 (upper gives
   *   |clamped_x - tBranch|; lower gives tBranch - clamped_x). The sign that's needed to
   *   flip the log's polarity comes from the divisor at @0x113c4b (divTable[0]=+10.1596 for
   *   upper, divTable[1]=-10.1596 for lower).
   *
   *   Actually correcting the trace: at @0x113c21 `addsd -tBranch` to xmm1 makes xmm1 =
   *   clamped_x - tBranch. In the upper branch clamped_x ∈ [tBranch, kMaxLogGamma], so
   *   xmm0 = clamped_x - tBranch ∈ [0, kMaxLogGamma - tBranch] ≥ 0. In the lower branch
   *   clamped_x ∈ [kMinLogGamma, tBranch), so xmm0 = tBranch - clamped_x ∈ (0, tBranch -
   *   kMinLogGamma] > 0. Both paths therefore feed a NON-NEGATIVE value into aa*x → exp.
   *
   *   ── Step 3 — aa*x, exp, +(-1), /divTable[r13], narrow to fp32 ──
   *   0x113c36  mulsd aa(%rip), %xmm0     → xmm0 *= aa            (aa = 4.351594094890625)
   *   0x113c3e  callq _exp                → xmm0 = exp(xmm0)      (libm scalar fp64 exp)
   *   0x113c43  addsd @0x3ca300, %xmm0    → xmm0 += -1            (exp() - 1)
   *   0x113c4b  leaq @0x3d49d0, %rax      → rax = &divTable       ([+10.1596, -10.1596])
   *   0x113c52  divsd (%rax,%r13,8), %xmm0 → xmm0 /= divTable[r13]
   *                                            r13=0 (upper): / +10.1596
   *                                            r13=1 (lower): / -10.1596
   *   0x113c58  cvtsd2ss %xmm0, %xmm0     → narrow fp64 → fp32
   *
   *   ── Step 4 — write y to R/G/B, 1.0f to A ──
   *   0x113c5c  movss %xmm0, (%r12)       → *rOut = y
   *   0x113c62  movss %xmm0, (%r15)       → *gOut = y
   *   0x113c67  movss %xmm0, (%r14)       → *bOut = y
   *   0x113c6c  movl $0x3f800000, (%rbx)  → *aOut = 1.0f  (bit-pattern write)
   *   0x113c80  retq
   *
   *   ── Cold path (guarded init of `aa`) ──
   *   0x113c81  movsd %xmm1, -0x30(%rbp)  → spill xmm1 (clamped_x) across the call
   *   0x113c86  callq colorAtIndex.cold.1 → runs __cxa_guard_acquire; if won, writes
   *                                           aa = fp64(0x40116808484c167b) = 4.35159...
   *                                           and calls __cxa_guard_release.
   *   0x113c8b  movsd -0x30(%rbp), %xmm1  → reload xmm1
   *   0x113c90  jmp 0x113c0d              → re-enter hot path (skip guard re-check)
   *
   *   Only the first color-channel argument (`r`) is used; g and b are ignored.
   *   The alpha output is a constant 1.0f irrespective of input.
   *
   * @param r     xmm0 — the input scalar (only value that matters).
   * @param _g    xmm1 — ignored (2nd float arg; the disasm's xmm1 register gets overwritten
   *                    immediately by @0x113bde).
   * @param _b    xmm2 — ignored (3rd float arg).
   * @param rOut  %rsi — output R pointer wrapper.
   * @param gOut  %rdx — output G pointer wrapper.
   * @param bOut  %rcx — output B pointer wrapper.
   * @param aOut  %r8  — output alpha pointer wrapper.
   */
  colorAtIndex(
    r: number,
    _g: number,
    _b: number,
    rOut: [number],
    gOut: [number],
    bOut: [number],
    aOut: [number],
  ): void {
    // @0x113bd7: cvtss2sd — widen fp32 arg to fp64. JS numbers are already fp64; a
    // preceding Math.fround captures the fp32 register precision of the argument.
    const x = Math.fround(r);

    // Step 1 — clamp x to [kMinLogGamma, kMaxLogGamma]. Follows the exact three-case
    // structure of @0x113bde..@0x113bfa. NaN handling: `ucomisd`+`ja/jbe` treat NaN as
    // unordered → the first `ja` at @0x113bea does NOT fire (falls through), and the
    // second `jbe` at @0x113bf8 does NOT fire either (falls through to upper clamp).
    // So NaN → xmm1 = kMaxLogGamma. In TS `x < kMinLogGamma` and `x <= kMaxLogGamma` are
    // both false for NaN, so the else-branch (`clamped = K_kMaxLogGamma`) fires — same.
    let clamped: number;
    if (x < K_kMinLogGamma) {
      // @0x113bde..@0x113bea: xmm1 = kMinLogGamma  (below-min clamp)
      clamped = K_kMinLogGamma;
    } else if (x <= K_kMaxLogGamma) {
      // @0x113bec..@0x113bf8: xmm1 = x            (in-range)
      clamped = x;
    } else {
      // @0x113bfa: xmm1 = kMaxLogGamma            (above-max clamp; also the NaN path)
      clamped = K_kMaxLogGamma;
    }

    // Step 2 — pick exp branch based on `clamped < tBranch`.
    //   @0x113c18 ucomisd tBranch, clamped ; @0x113c1c setb %al (al = clamped < tBranch).
    //   @0x113c1f jb → the lower-branch (jump target @0x113c2f, subsd).
    // Unordered/NaN: `setb` gives 1 on CF=1 (unordered sets CF=1 too), and `jb` fires
    // on CF=1. In TS `clamped < K_tBranch` returns false for NaN; but `clamped` cannot
    // be NaN here — every path through Step 1 sets `clamped` to a finite constant or
    // to `x` when `x <= K_kMaxLogGamma` (which is false for NaN). So NaN doesn't reach.
    let arg: number;   // xmm0 after the branch
    let denIdx: 0 | 1; // r13b: 0 = upper (>=), 1 = lower (<)
    if (clamped < K_tBranch) {
      // @0x113c2f: xmm0 = tBranch - clamped
      arg = K_tBranch - clamped;
      denIdx = 1;   // @0x113c33: r13b = al = 1
    } else {
      // @0x113c21..@0x113c29: xmm1 += nBranch (== -tBranch) → xmm0 = xmm1
      // i.e. xmm0 = clamped + (-tBranch) = clamped - tBranch
      arg = clamped + K_nBranch;
      denIdx = 0;   // @0x113c33: r13b = al = 0
    }

    // Step 3 — aa*arg, exp, -1, /divTable[denIdx].
    // @0x113c36: xmm0 *= K_aa
    const t = arg * K_aa;
    // @0x113c3e: xmm0 = exp(xmm0)
    const e = Math.exp(t);
    // @0x113c43: xmm0 += -1
    const em1 = e + K_neg_one;
    // @0x113c4b..@0x113c52: xmm0 /= divTable[denIdx]
    const y64 = em1 / K_divTable[denIdx];
    // @0x113c58: cvtsd2ss  — narrow fp64 → fp32.
    const y = Math.fround(y64);

    // Step 4 — broadcast to R/G/B and write 1.0f to alpha.
    // @0x113c5c/62/67: *R = *G = *B = y
    rOut[0] = y;
    gOut[0] = y;
    bOut[0] = y;
    // @0x113c6c: `movl $0x3f800000, (%rbx)` — bit-pattern for 1.0f.
    aOut[0] = K_ALPHA_ONE;
  }

  /**
   * `~HGCanonLogLinearizationLUTInfo()` — D1 (in-place) destructor.
   * @Helium 0x00000000001157b0  (__ZN30HGCanonLogLinearizationLUTInfoD1Ev)
   *
   * Per the class brief this is trivial (in-place, no-op). No derived-class state to
   * release. In TS with GC there's nothing to do; the method exists for ABI-shape parity.
   */
  destruct_D1(): void {
    // no-op @0x1157b0
  }

  /**
   * `~HGCanonLogLinearizationLUTInfo()` — D0 (deleting) destructor.
   * @Helium 0x00000000001157c0  (__ZN30HGCanonLogLinearizationLUTInfoD0Ev)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLogLinearizationLUTInfo.~HGCanonLogLinearizationLUTInfo.s):
   *   0x1157c0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   0x1157c5  jmp __ZdlPv                → tail-call `operator delete(this)`
   *
   * In TS with GC there's nothing to do.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x1157c5 — under GC this is a no-op.
  }

  /**
   * `duplicate() const  →  HGCanonLogLinearizationLUTInfo*`
   * @Helium 0x00000000001157d0  (__ZNK30HGCanonLogLinearizationLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HGCanonLogLinearizationLUTInfo.duplicate.s):
   *   0x1157d6  movq %rdi, %rbx           → save `this`
   *   0x1157d9  movl $0x28, %edi          → alloc size = 0x28 (40B = sizeof)
   *   0x1157de  callq __Znwm              → rax = operator new(0x28)
   *   0x1157e3  movups 0x8(%rbx), %xmm0   → load 16B from this+0x08 (bytes 0x08..0x17)
   *   0x1157e7  movups 0x14(%rbx), %xmm1  → load 16B from this+0x14 (bytes 0x14..0x23)
   *                                           (two 16B loads with 4B overlap cover the
   *                                            full 32B base sub-object 0x08..0x27)
   *   0x1157eb  movups %xmm0, 0x8(%rax)   → store 16B at new+0x08
   *   0x1157ef  movups %xmm1, 0x14(%rax)  → store 16B at new+0x14
   *   0x1157f3  leaq 0x90744e(%rip), %rcx → rcx = 0xa1cc48  (this class's vtable)
   *   0x1157fa  movq %rcx, (%rax)         → new->vtable = 0xa1cc48
   *   0x115803  retq
   *
   * Semantics: heap-allocate a new instance and byte-copy the 32-byte base sub-object,
   * then stamp the derived vtable. In TS: allocate via Object.create (bypassing our own
   * ctor, which would call `super(...)` and re-initialise the base), then copy every base
   * field verbatim, then set the vtable.
   */
  duplicate(): HGCanonLogLinearizationLUTInfo {
    // @0x1157de: operator new(0x28). In TS: Object.create → new object with our prototype
    // (no constructor logic runs).
    const copy = Object.create(HGCanonLogLinearizationLUTInfo.prototype) as HGCanonLogLinearizationLUTInfo;
    // @0x1157e3..@0x1157ef: byte-copy the 32B base sub-object at [+0x08 .. +0x27]. That
    // maps to the HGApplyNDLUTInfo fields numBins, numDims, rangeScale, rangeOffset,
    // storage — copied verbatim below.
    copy.numBins = this.numBins;
    copy.numDims = this.numDims;
    copy.rangeScale = this.rangeScale;
    copy.rangeOffset = this.rangeOffset;
    copy.storage = this.storage;
    // @0x1157f3..@0x1157fa: derived vtable pointer.
    copy.vtable = 0xa1cc48;
    return copy;
  }
}

/**
 * Vtable address for HGCanonLogLinearizationLUTInfo, recovered from the ctor's `leaq
 * 0x9090ec(%rip)` @0x113b55 (target 0xa1cc48) and confirmed by duplicate's `leaq
 * 0x90744e(%rip)` @0x1157f3 (same target). Documented for cross-file provenance.
 */
export const HGCanonLogLinearizationLUTInfo_vtable_addr = "@Helium 0xa1cc48" as const;
