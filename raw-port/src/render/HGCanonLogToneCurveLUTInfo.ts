// raw-port/src/render/HGCanonLogToneCurveLUTInfo.ts
//
// FCP `HGCanonLogToneCurveLUTInfo` — Helium concrete subclass of the
// already-landed base `HGApplyNDLUTInfo`. Models the Canon Log 1 "tone
// curve" transform: Canon-Log-1 → linear (Canon inverse-OETF) followed
// by a Rec.709-style OETF (1.099·y^0.45 − 0.099 in the highlight band,
// 4.5·y in the toe band), then a display-referred pow(x, 1.956) EOTF
// clamped to [kMinLogGamma, kMaxLogGamma]. All output channels are set
// to the same result (grayscale/luminance-only transform); alpha=1.0f.
//
// This class has NO subclass-specific per-instance fields — it merely
// swaps the vtable pointer over an unchanged HGApplyNDLUTInfo base
// sub-object. sizeof = 0x28 (40 bytes; base = 0x24 + 4 bytes tail
// padding; from `__Znwm(0x28)` in duplicate @Helium 0x115779).
//
// FRAMEWORK: Helium.framework
// DECODE: raw-port/re/disasm/Helium.HGCanonLogToneCurveLUTInfo.*.s
//
// SYMBOLS (Helium x86_64 slice; VAs are unadjusted VM addrs):
//   @Helium 0x1138e0  HGCanonLogToneCurveLUTInfo::kMinLogGamma()   [static-init getter]
//   @Helium 0x113910  HGCanonLogToneCurveLUTInfo::kMaxLogGamma()   [static-init getter]
//   @Helium 0x113960  ctor (unsigned long, float, float, LUTStorageFormat)
//                     — C1 and C2 ICF-folded to the SAME body at 0x113960.
//   @Helium 0x113990  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x1139e0  colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   @Helium 0x115750  ~HGCanonLogToneCurveLUTInfo() (D1) — trivial empty
//   @Helium 0x115760  ~HGCanonLogToneCurveLUTInfo() (D0) — tail-jmp __ZdlPv
//   @Helium 0x115770  duplicate() const
//   @Helium 0x3c3ca0  kMinLogGamma()   (.cold.1) — static-init body
//   @Helium 0x3c3ce0  kMaxLogGamma()   (.cold.1) — static-init of kMaxSceneLinear
//   @Helium 0x3c3d20  kMaxLogGamma()   (.cold.2) — derive kMaxLogGamma from kMaxSceneLinear
//   @Helium 0x3c3d80  colorAtIndex()   (.cold.1) — static-init of function-local `aa`
//
// VTABLE @Helium 0xa1cbe8 (installed ptr = 0xa1cbf8; from ctor @0x113975..0x11397c;
// duplicate @0x115793..0x11579a lands at the same 0xa1cbf8 target):
//   *0x00 = 0x115750  ~HGCanonLogToneCurveLUTInfo (D1)
//   *0x08 = 0x115760  ~HGCanonLogToneCurveLUTInfo (D0)
//   *0x10 = 0x115770  duplicate() const                        [NEW virtual]
//   *0x18 = 0x113990  isEqual(HGLUTCache::LUTInfo*) const      [override]
//   *0x20 = 0x1139e0  colorAtIndex(...) const                  [override]
//
// STRUCT LAYOUT (recovered from ctor and duplicate):
//   0x00 : void*      vtable    (installed = 0xa1cbf8)
//   0x08 .. 0x23 : inherited HGApplyNDLUTInfo base (numBins, numDims=1,
//                  rangeScale, rangeOffset, storage) — set by base C2 ctor.
//   sizeof = 0x28 (40 bytes; from duplicate's __Znwm(0x28) @0x11577e).
//   NO subclass-specific instance fields.
//
// STATIC-LOCAL CONSTANTS (Helium __bss; Itanium-ABI guarded, initialized
// once at first call to the corresponding getter/method):
//
//   HGCanonLogToneCurveLUTInfo::kMinLogGamma()::kMinLogGamma
//     @Helium __bss (guard @__ZGV...)
//     value = 0x3fa371775c883ccd = 0.03797505383055864
//     initialized by @0x3c3cb4 movabsq to that bit pattern.
//
//   HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxSceneLinear
//     @Helium __bss
//     value = 0x3ff33a573b3eed8a = 1.2017433466233762
//     initialized by @0x3c3cf4 movabsq (cold.1).
//
//   HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxLogGamma
//     @Helium __bss
//     value = log10(kMaxSceneLinear * 10.1596 + 1.0) * 0.529136 + 0.0730597
//           ≈ 0.6661563676598818  (computed at first call by cold.2)
//     Formula @0x3c3d3c..0x3c3d61:
//       xmm0 = kMaxSceneLinear
//       xmm0 *= 10.1596   (@0x3d4c88)
//       xmm0 += 1.0       (@0x3ca260)
//       xmm0 = log10(xmm0)
//       xmm0 *= 0.529136  (@0x3d4c90)
//       xmm0 += 0.0730597 (@0x3d4a80)
//       store as kMaxLogGamma
//     These are Canon Log 1's published encode parameters:
//       V = 0.529136 * log10(10.1596 * x + 1) + 0.0730597
//     So kMaxLogGamma is the Canon-Log-1-encoded value of kMaxSceneLinear.
//
//   HGCanonLogToneCurveLUTInfo::colorAtIndex(...)::aa
//     @Helium __bss
//     value = 0x40116808484c167b = 4.351594094890625
//     initialized by @0x3c3d94 movabsq (colorAtIndex.cold.1).
//     This is ln(10) / 0.529136 — the natural-log conversion of the
//     log10-scaled Canon Log 1 divisor 0.529136. Used in the inverse
//     Canon-Log-1 to convert V → linear via exp() rather than pow(10,).
//     (Confirmed by decoding: ln(10)/0.529136 ≈ 4.35159409489…)
//
// STATIC PER-CLASS DATA (Helium __TEXT __const; read at named RIP-rel VAs):
//   @0x3d49d0  c[0..1]     = 10.1596, -10.1596   (Canon Log 1 `c` gain, ±sign)
//   @0x3d4a80  kSplit1     = 0.0730597           (Canon Log 1 log-encoded 0-point)
//   @0x3d4a88  -kSplit1    = -0.0730597
//   @0x3d4a90  -c1_off     = -0.099              (Rec.709 OETF offset)
//   @0x3d4a98  kMaxLogGamma_const = 1.0947488584474885
//                                                  (Rec.709/Canon-Log-1 max encoded)
//   @0x3d4aa0  neg_b_break = -0.018               (negated Rec.709 OETF breakpoint)
//   @0x3d4aa8  kMinLogGamma_const = -0.0730593607305936
//                                                  (Canon Log 2 min-log-gamma, used
//                                                   here as the lower clamp for the
//                                                   pre-EOTF Rec.709 output)
//   @0x3d4ab0  invGamma    = 1.956                (final display-referred pow exponent)
//   @0x3d0d40  b_break     = 0.018                (Rec.709 OETF breakpoint)
//   @0x3d0d48  linSlope    = 4.5                  (Rec.709 OETF linear slope)
//   @0x3d0d50  gExp        = 0.45                 (Rec.709 OETF gamma exponent)
//   @0x3d0d58  c1_gain     = 1.099                (Rec.709 OETF gain)
//   @0x3d4c88  cGain10     = 10.1596              (used by kMaxLogGamma cold.2)
//   @0x3d4c90  vGain       = 0.529136             (Canon Log 1 `V` scale;
//                                                  used by kMaxLogGamma cold.2)
//   @0x3ca260  one         = 1.0
//   @0x3ca300  neg_one     = -1.0
//   @0x3caae0  signMask    = 0x8000000000000000   (double sign-flip xorpd mask)
//   (Byte-for-byte values verified by seek+read of the Helium x86_64 slice
//    at file_off = 0x4000 + VA; see decode inline comments below.)
//
// UNDECODED CALLEES / EXTERNAL SYMBOLS (all faithfully modeled below):
//   * libm  _exp   — @0x113a3e ; modeled by Math.exp.
//   * libm  _pow   — @0x113a94, @0x113add, @0x113af8 ; modeled by Math.pow.
//   * libm  _log10 — used only inside kMaxLogGamma()::.cold.2 @0x3c3d4c ;
//                    modeled by Math.log10.
//   * libcxxabi ___dynamic_cast — @0x1139b4 ; modeled by TS `instanceof`.
//   * libcxxabi __cxa_guard_acquire / __cxa_guard_release —
//                    used in every .cold.* to lazily initialise the
//                    function-local statics. Replaced here by eager
//                    module-level constants (the bit patterns are pure
//                    compile-time literals; no dynamic dependency).
//   * operator new (__Znwm) — @0x11577e ; modeled by JS `new`.
//   * operator delete (__ZdlPv) — D0 tail-jump @0x115765 ; modeled by
//                    JS GC (no-op).
//
// The `HGApplyNDLUTInfo::isEqual` base method call at @0x1139ca (via tail
// `jmp`) uses the already-landed base implementation; imported below.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo";

/**
 * `HGCanonLogToneCurveLUTInfo` — Canon Log 1 tone-curve descriptor.
 *
 * Applies the Canon Log 1 inverse-OETF (log-encoded → linear scene
 * radiance) followed by a Rec.709 OETF and a display-referred pow
 * transfer. Grayscale/luminance-only: the first input channel drives
 * all three output channels; alpha is set to 1.0f.
 *
 * This class has no per-instance state beyond the inherited
 * {@link HGApplyNDLUTInfo} base fields. All constants (encode parameters,
 * breakpoints, and clamps) are compiled-in class statics.
 */
export class HGCanonLogToneCurveLUTInfo extends HGApplyNDLUTInfo {
  // ────────────── class-visible static-local values ──────────────
  //
  // Native FCP exposes these as function-local `static const double`
  // values inside kMinLogGamma() / kMaxLogGamma() getters. We hoist
  // them to class-level readonly properties; the bit patterns come
  // directly from the .cold.1 / .cold.2 initializers.

  /**
   * `HGCanonLogToneCurveLUTInfo::kMinLogGamma()::kMinLogGamma`
   * — Helium @0x3c3cb4 movabsq $0x3fa371775c883ccd → static bss.
   * Value = 0.03797505383055864.
   *
   * Canon Log 1's minimum log-encoded gamma value corresponding to the
   * lowest supported scene-linear point. Used as an external accessor
   * (`kMinLogGamma()` at @Helium 0x1138e0 returns this).
   */
  static readonly kMinLogGamma = 0.03797505383055864;

  /**
   * `HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxSceneLinear`
   * — Helium @0x3c3cf4 movabsq $0x3ff33a573b3eed8a → static bss.
   * Value = 1.2017433466233762.
   *
   * The maximum linear scene value that Canon Log 1 was calibrated to
   * encode (a scene radiance above 1.0, since Canon Log 1 supports
   * super-white highlights). This is the input to the log-encode
   * formula that produces kMaxLogGamma below.
   */
  static readonly kMaxSceneLinear = 1.2017433466233762;

  /**
   * `HGCanonLogToneCurveLUTInfo::kMaxLogGamma()::kMaxLogGamma`
   * — Helium @0x3c3d61 (cold.2 body): computed once from
   *   log10(kMaxSceneLinear * 10.1596 + 1.0) * 0.529136 + 0.0730597
   *
   * i.e. the Canon Log 1 encoded value of kMaxSceneLinear.
   * Numerically ≈ 0.6661563676598818 (verified by re-running the
   * cold.2 formula in TS using {@link Math.log10}).
   *
   * Native uses `_log10` (libm). We reproduce with `Math.log10`, which
   * on all common platforms follows the same libm semantics for finite
   * positive inputs (as required here — the input is guaranteed
   * strictly positive by kMaxSceneLinear × 10.1596 + 1 > 1).
   */
  static readonly kMaxLogGamma =
    Math.log10(1.2017433466233762 * 10.1596 + 1.0) * 0.529136 + 0.0730597;

  /**
   * `HGCanonLogToneCurveLUTInfo::colorAtIndex(...)::aa`
   * — Helium @0x3c3d94 movabsq $0x40116808484c167b → static bss.
   * Value = 4.351594094890625 = ln(10) / 0.529136.
   *
   * This is the natural-exp conversion of Canon Log 1's log10-scaled
   * `1 / V-gain` factor (i.e. the pre-`exp()` multiplier that turns
   * V into a natural-log argument suitable for `_exp`). Verified
   * by the RE identity `ln(10) / 0.529136 == 4.351594094890625`.
   */
  static readonly kColorAtIndex_aa = 4.351594094890625;

  // ────────────── class-level static tables (from __TEXT __const) ──────────────

  /**
   * Canon Log 1 `c` gain and its negation @Helium 0x3d49d0.
   * Two-element table indexed by r13 in colorAtIndex, where
   *   r13 = (x < kSplit1) ? 1 : 0
   * so the sign of the divisor tracks whether V is below or above
   * Canon Log 1's log-encoded zero-crossing at kSplit1 = 0.0730597.
   * (This makes the inverse formula symmetric around V = kSplit1.)
   */
  static readonly kCanonLog1_c = [10.1596, -10.1596] as const;

  /** Canon Log 1 log-encoded zero-crossing @Helium 0x3d4a80 = 0.0730597.
   *  V = kSplit1 corresponds to linear x = 0.
   *  (Distinct from kMinLogGamma_negClamp below by ≈ 3.4e-7 — Apple
   *  publishes both constants separately; we retain both.) */
  static readonly kSplit1 = 0.0730597;

  /** Rec.709 OETF `-c1` offset @Helium 0x3d4a90 = -0.099. */
  static readonly kRec709_negOffset = -0.099;

  /** Rec.709 OETF post-EOTF upper clamp @Helium 0x3d4a98 = 1.0947488584474885.
   *  Distinct from {@link kMaxLogGamma} (which is 0.666…) — this is the
   *  MAX of Rec.709-OETF(kMaxSceneLinear), not the Canon Log 1 encoded value.
   *  (It is called "kMaxLogGamma_const" internally because it appears
   *   near the other log-domain limits in __TEXT __const, but it plays
   *   a distinct role: post-Rec.709-OETF clamp before pow(1.956).) */
  static readonly kRec709_maxClamp = 1.0947488584474885;

  /** Rec.709 OETF `b` breakpoint (negated) @Helium 0x3d4aa0 = -0.018. */
  static readonly kRec709_negB = -0.018;

  /** Lower clamp for the pre-EOTF Rec.709 output value @Helium 0x3d4aa8
   *  = -0.0730593607305936. NOTE: differs from -kSplit1 by ≈ 3.4e-7. */
  static readonly kMinLogGamma_negClamp = -0.0730593607305936;

  /** Final display-referred pow exponent @Helium 0x3d4ab0 = 1.956. */
  static readonly kFinalGamma = 1.956;

  /** Rec.709 OETF `b` breakpoint @Helium 0x3d0d40 = 0.018. */
  static readonly kRec709_b = 0.018;

  /** Rec.709 OETF linear-region slope @Helium 0x3d0d48 = 4.5. */
  static readonly kRec709_linSlope = 4.5;

  /** Rec.709 OETF gamma exponent @Helium 0x3d0d50 = 0.45. */
  static readonly kRec709_gExp = 0.45;

  /** Rec.709 OETF gain @Helium 0x3d0d58 = 1.099. */
  static readonly kRec709_gain = 1.099;

  /**
   * `HGCanonLogToneCurveLUTInfo::HGCanonLogToneCurveLUTInfo(
   *    unsigned long numBins, float rangeScale, float rangeOffset,
   *    LUTStorageFormat storage)`
   * — Helium @0x113960 (C1 and C2 are ICF-folded to the same body).
   *
   * Full disassembly (@0x113960..0x113985):
   *
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   pushq  %rbx
   *   pushq  %rax
   *   movl   %edx, %ecx                 ; ecx = storage (from edx arg)
   *   movq   %rdi, %rbx                 ; rbx = this
   *   movl   $0x1, %edx                 ; edx = numDims = 1 (forced)
   *   callq  __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *       ; base ctor args after remap:
   *       ;   rdi = this
   *       ;   rsi = numBins  (unchanged)
   *       ;   rdx = 1        (forced numDims)
   *       ;   xmm0 = rangeScale  (unchanged)
   *       ;   xmm1 = rangeOffset (unchanged)
   *       ;   ecx = storage  (moved from edx)
   *   leaq   0x90927c(%rip), %rax      ; rax = 0xa1cbf8 (this class's vtable+0x10)
   *   movq   %rax, (%rbx)              ; this->vptr = 0xa1cbf8
   *   addq   $0x8, %rsp
   *   popq   %rbx
   *   popq   %rbp
   *   retq
   *
   * The class hard-codes numDims = 1 (this is a 1-D LUT). All other
   * base fields (numBins, rangeScale, rangeOffset, storage) are passed
   * through to the base ctor unchanged.
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @Helium 0x11396b: `movl $0x1, %edx` — hard-code numDims = 1.
    // @Helium 0x113970: base C2 ctor.
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // @Helium 0x113975..0x11397c: vtable install (target = 0xa1cbf8).
    this.vtable = 0xa1cbf8;
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::kMinLogGamma()` — Helium @0x1138e0.
   *
   * Static getter for the function-local `kMinLogGamma` double, guarded
   * by Itanium-ABI `__cxa_guard`. Body @0x1138e0..0x113906:
   *   guard-load ; testb ; je → cold.1 (movabsq $0x3fa371775c883ccd)
   *   movsd kMinLogGamma(%rip), %xmm0 ; retq
   *
   * @returns 0.03797505383055864.
   */
  static kMinLogGammaFn(): number {
    return HGCanonLogToneCurveLUTInfo.kMinLogGamma;
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::kMaxLogGamma()` — Helium @0x113910.
   *
   * Static getter for the function-local `kMaxLogGamma` double, computed
   * once at first call. Body @0x113910..0x113952:
   *   ensure kMaxSceneLinear initialized (cold.1 movabsq
   *     $0x3ff33a573b3eed8a → kMaxSceneLinear)
   *   ensure kMaxLogGamma initialized (cold.2 body):
   *     xmm0 = kMaxSceneLinear ; xmm0 *= 10.1596 ; xmm0 += 1.0 ;
   *     xmm0 = log10(xmm0) ; xmm0 *= 0.529136 ; xmm0 += 0.0730597 ;
   *     store kMaxLogGamma
   *   movsd kMaxLogGamma(%rip), %xmm0 ; retq
   *
   * @returns log10(1.2017433466233762 * 10.1596 + 1.0) * 0.529136 + 0.0730597
   *          ≈ 0.6661563676598818.
   */
  static kMaxLogGammaFn(): number {
    return HGCanonLogToneCurveLUTInfo.kMaxLogGamma;
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::isEqual(HGLUTCache::LUTInfo*) const`
   * — Helium @0x113990.
   *
   * Full disassembly (@0x113990..0x1139d7):
   *
   *   pushq  %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   testq  %rsi, %rsi                 ; other == null ?
   *   je     0x1139cf                    ; → return false
   *   movq   %rdi, %rbx
   *   movq   __ZTIN10HGLUTCache7LUTInfoE(%rip), %rax   ; from-typeinfo
   *   leaq   __ZTI26HGCanonLogToneCurveLUTInfo(%rip), %rdx   ; to-typeinfo
   *   movq   %rsi, %rdi
   *   movq   %rax, %rsi
   *   xorl   %ecx, %ecx
   *   callq  ___dynamic_cast              ; cast other → CanonLogToneCurve*
   *   testq  %rax, %rax
   *   je     0x1139cf                    ; cast failed → return false
   *   movq   %rbx, %rdi
   *   movq   %rax, %rsi
   *   addq   $0x8, %rsp ; popq %rbx ; popq %rbp
   *   jmp    HGApplyNDLUTInfo::isEqual    ; tail-call base
   *   0x1139cf: xorl %eax, %eax           ; false path
   *   addq $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
   *
   * TS: instanceof check for the dynamic_cast, then delegate to base.
   * There are NO subclass fields beyond the vtable, so no extra
   * per-field comparison is needed (unlike siblings that carry
   * postMode / EI bands).
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @0x113996: testq %rsi,%rsi ; je → false
    if (other == null) return false;
    // @0x11399e..0x1139b9: dynamic_cast<HGCanonLogToneCurveLUTInfo*>(other)
    // @0x1139bc: testq %rax,%rax ; je → false
    if (!(other instanceof HGCanonLogToneCurveLUTInfo)) return false;
    // @0x1139ca: tail-jmp HGApplyNDLUTInfo::isEqual(this, other).
    return super.isEqual(other);
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::colorAtIndex(f32,f32,f32, f32*, f32*, f32*, f32*) const`
   * — Helium @0x1139e0.
   *
   * Grayscale-only transform: only the first input float `x` (xmm0) is
   * consumed; the other two floats are IGNORED. Writes the SAME result
   * to *r, *g, *b, then writes 1.0f (bit pattern 0x3f800000) to *a.
   *
   * ALGORITHM (mirroring the disasm branch-for-branch):
   *
   *   INPUT: x (float32)
   *
   *   [Static-init guard @0x1139fa..0x113a03]:
   *     Ensure `aa` = ln(10)/0.529136 = 4.351594094890625 is initialised
   *     (Itanium-ABI guard; via .cold.1). In TS this is an eager class
   *     const, so the guard is a no-op.
   *
   *   [Canon Log 1 inverse @0x113a09..0x113a52]:
   *     xd = (double)x
   *     C  = 0.0730597         (kSplit1)
   *     sign = (xd < C) ? 1 : 0
   *     |δ| = (xd >= C) ? (xd - C) : (C - xd)      (i.e. |xd - C|)
   *     u  = |δ| * aa                              (natural-log argument)
   *     e  = exp(u) - 1.0
   *     y1 = e / (sign == 0 ?  10.1596 : -10.1596)  (signed inverse)
   *     — this is exp((V-kSplit1)*ln10/0.529136)/10.1596 - 1/10.1596,
   *       i.e. Canon Log 1's V → linear inverse. y1 has the sign of xd - C.
   *
   *   [Rec.709 OETF (linear → gamma-encoded) @0x113a58..0x113aa1]:
   *     if y1 >= 0.018:                                   (highlight band)
   *       g = 1.099 * pow(y1, 0.45) - 0.099
   *     else if y1 > -0.018:                              (linear band)
   *       g = 4.5 * y1
   *       if g < -0.0730593607305936:                     (lower clamp)
   *         goto negClamp
   *     else:  # y1 <= -0.018                              (deep shadow)
   *       goto negClamp
   *
   *   [Upper clamp against kRec709_maxClamp @0x113aa9..0x113ab5]:
   *     if g > 1.0947488584474885: g = 1.0947488584474885  (kRec709_maxClamp)
   *     (Fall-through preserves g exactly.)
   *
   *   [Sign-preserving final pow(1.956) @0x113ab7..0x113afd]:
   *     if g >= 0:
   *       out_d = pow(g, 1.956)
   *     else:
   *       out_d = -pow(-g, 1.956)         (xorpd sign-flip both times)
   *
   *   [negClamp entry (via @0x113ac9)]:
   *     xmm3 was pre-loaded with kMinLogGamma_negClamp = -0.0730593607305936
   *     (either at @0x113a6a in the y1 <= -0.018 path, OR the value of
   *     y2 = 4.5*y1 in the linear-band-underflow path — the code reuses
   *     `xmm3` in a way that makes the exact "clamp value" depend on
   *     which entry was taken; we preserve both entry semantics).
   *     out_d = -pow(-xmm3, 1.956)          (sign-flip, pow, sign-flip)
   *
   *   [Write outputs @0x113afd..0x113b11]:
   *     out_f = (float)out_d
   *     *r = *g = *b = out_f
   *     *a = 1.0f    (0x3f800000)
   *
   * SEMANTIC SUMMARY:
   *   Canon-Log-1 → linear-scene → Rec.709-OETF → clamp → pow(1.956) EOTF.
   *   Only the first channel matters; result is broadcast to r/g/b.
   *
   * @param x   Canon-Log-1-encoded luminance (float32).
   * @param _y  IGNORED (not touched by the disasm).
   * @param _z  IGNORED.
   * @param rOut / gOut / bOut / aOut  single-element out arrays; native
   *   uses raw float* pointers, TS uses one-element arrays.
   */
  colorAtIndex(
    x: number,
    _y: number,
    _z: number,
    rOut: [number],
    gOut: [number],
    bOut: [number],
    aOut: [number],
  ): void {
    // Constants (aliased to class-level statics for readability).
    const C = HGCanonLogToneCurveLUTInfo.kSplit1;                 // 0.0730597
    const aa = HGCanonLogToneCurveLUTInfo.kColorAtIndex_aa;       // ln10/0.529136
    const cGain = HGCanonLogToneCurveLUTInfo.kCanonLog1_c;        // [+10.1596, -10.1596]
    const b = HGCanonLogToneCurveLUTInfo.kRec709_b;               // 0.018
    const negB = HGCanonLogToneCurveLUTInfo.kRec709_negB;         // -0.018
    const linSlope = HGCanonLogToneCurveLUTInfo.kRec709_linSlope; // 4.5
    const gExp = HGCanonLogToneCurveLUTInfo.kRec709_gExp;         // 0.45
    const gain = HGCanonLogToneCurveLUTInfo.kRec709_gain;         // 1.099
    const negOff = HGCanonLogToneCurveLUTInfo.kRec709_negOffset;  // -0.099
    const maxClamp = HGCanonLogToneCurveLUTInfo.kRec709_maxClamp; // 1.0947...
    const negMinClamp = HGCanonLogToneCurveLUTInfo.kMinLogGamma_negClamp; // -0.07306
    const finalGamma = HGCanonLogToneCurveLUTInfo.kFinalGamma;    // 1.956

    // @0x113a09: cvtss2sd — promote input float to double.
    // (TS numbers are already double; a float→double widen is exact.)
    const xd = Math.fround(x); // clamp to f32-precision first (mirrors cvtss2sd source)

    // @0x113a0d..0x113a2f: compute |xd - kSplit1| and sign flag.
    //   ucomisd 0.0730597, xd  ; setb al = (xd < 0.0730597)
    //   jb → subsd path (below); no-jump → addsd path (above).
    const belowSplit = xd < C;
    let u: number;
    if (belowSplit) {
      // @0x113a2f: subsd xmm1, xmm0 → xmm0 = C - xd (= |xd - C| since xd < C)
      u = C - xd;
    } else {
      // @0x113a21..0x113a29: xmm1 = xd + (-C); xmm0 = xmm1
      u = xd - C;
    }
    // @0x113a33: r13 = belowSplit ? 1 : 0
    const signIdx = belowSplit ? 1 : 0;

    // @0x113a36..0x113a43: y1 = (exp(u * aa) - 1.0) / cGain[signIdx]
    const eMinusOne = Math.exp(u * aa) - 1.0;
    const y1 = eMinusOne / cGain[signIdx];

    // @0x113a58..0x113aa1: Rec.709 OETF with control-flow-preserving state.
    //
    // Three exits from this block:
    //   (A) fall-through with an OETF-computed `g` → upper clamp then
    //       positive-branch pow.
    //   (B) `y2` in the linear-band lower-half → negClamp using y2.
    //   (C) direct negClamp using kMinLogGamma_negClamp.

    let goNegClamp = false;
    /** xmm3 value at 0x113ac9 entry (see disasm — either y2 or negMinClamp). */
    let xmm3AtNegClamp = 0.0;
    /** g value if we did not go to negClamp (i.e. the OETF output). */
    let g = 0.0;

    // @0x113a58: ucomisd 0.018, y1 ; @0x113a60 jae → highlight branch
    if (y1 >= b) {
      // @0x113a8c..0x113aa1: g = 1.099 * pow(y1, 0.45) + (-0.099)
      g = gain * Math.pow(y1, gExp) + negOff;
      // fall through to upper clamp
    } else {
      // @0x113a62..0x113a72: else-branch head.
      //   xmm3 = kMinLogGamma_negClamp   (unconditionally loaded @0x113a6a)
      //   if y1 <= -0.018 → 0x113ac9 (negClamp with that xmm3)
      xmm3AtNegClamp = negMinClamp; // @0x113a6a preload

      if (y1 <= negB) {
        // @0x113a72: jbe 0x113ac9
        goNegClamp = true;
      } else {
        // @0x113a74..0x113a88: linear band.
        //   xmm0 = y1 * 4.5
        //   xmm1 = -0.0730593607305936
        //   ucomisd xmm0, xmm1  (compare xmm1 vs xmm0)
        //   jbe 0x113ab7 → if -0.07306 <= y2 → 0x113ab7 (with xmm0=y2)
        //   jmp 0x113ac9 → else → negClamp with xmm3 = kMinLogGamma_negClamp
        //     (xmm3 was set at 0x113a6a and NOT overwritten in this path)
        const y2 = y1 * linSlope;
        if (negMinClamp <= y2) {
          // Enter the 0x113ab7 block: g = y2 (unclamped, upper-clamp
          // step is skipped because the entry point is different).
          g = y2;
          // — control-flow branch to the "zero-guarded pow" at 0x113ab7
          //   below; the upper clamp at 0x113aa9..0x113ab5 is bypassed.
          // We handle this by setting a flag so we do NOT re-apply the
          // upper clamp for this path.
          goNegClamp = false;
          // Jump directly to the sign-preserving pow (0x113ab7):
          this._writeSignPreservingPow(g, finalGamma, rOut, gOut, bOut, aOut);
          return;
        } else {
          // @0x113a8a: jmp 0x113ac9 → negClamp with xmm3 unchanged
          // (still = negMinClamp).
          xmm3AtNegClamp = negMinClamp;
          goNegClamp = true;
        }
      }
    }

    // negClamp entry from y1<=-0.018 (goNegClamp true, xmm3=negMinClamp)
    // or from linear-band underflow (goNegClamp true, xmm3=negMinClamp).
    if (goNegClamp) {
      // @0x113ac9..0x113afd: sign-flip via xorpd, pow, sign-flip.
      //   xmm3 = -xmm3         (via xorpd 0x8000000000000000 mask)
      //   pow(xmm3, 1.956)     (native _pow)
      //   xmm0 = -xmm0         (sign-flip result)
      // Net effect: out = -pow(-xmm3AtNegClamp, 1.956).
      // For xmm3 = -0.07306: out = -pow(0.07306, 1.956) ≈ negative
      // clamp value. Precisely: -Math.pow(-negMinClamp, 1.956).
      const out = -Math.pow(-xmm3AtNegClamp, finalGamma);
      this._writeFloat(out, rOut, gOut, bOut, aOut);
      return;
    }

    // Fall-through path: g holds an OETF-computed highlight value.
    // @0x113aa9..0x113ab5: upper clamp against kRec709_maxClamp.
    //   xmm2 = maxClamp
    //   ucomisd xmm2, g  (compare g vs maxClamp)
    //   ja 0x113aec → if g > maxClamp → skip 0x113ab7 zero-check and
    //                  directly compute pow(maxClamp, 1.956) via xmm2.
    // NOTE: the "0x113aec via ja" path uses xmm2 as the pow operand,
    // which was set to `maxClamp`. So when g > maxClamp we clamp to
    // maxClamp AND enter the positive-pow-only branch (no sign check).
    if (g > maxClamp) {
      // @0x113aec: xmm0 = xmm2 = maxClamp ; pow(maxClamp, 1.956).
      const out = Math.pow(maxClamp, finalGamma);
      this._writeFloat(out, rOut, gOut, bOut, aOut);
      return;
    }

    // @0x113ab7..0x113afd: sign-preserving pow(g, 1.956).
    this._writeSignPreservingPow(g, finalGamma, rOut, gOut, bOut, aOut);
  }

  /**
   * Helper for the 0x113ab7-entry sign-preserving pow block:
   *   xorpd xmm1,xmm1 (=0) ; ucomisd 0, xmm0 ; jae → positive-pow.
   *   Else xorpd sign_mask, xmm3 (=-xmm0) ; pow(-xmm0, 1.956) ;
   *        xorpd sign_mask, xmm0 (negate result).
   */
  private _writeSignPreservingPow(
    xmm0: number,
    exp: number,
    rOut: [number],
    gOut: [number],
    bOut: [number],
    aOut: [number],
  ): void {
    // @0x113abb: compare xmm0 vs 0.
    let out: number;
    if (xmm0 >= 0.0) {
      // @0x113aec: pow(xmm2=xmm0, 1.956)  (xmm2 was set to xmm0 @0x113abf)
      out = Math.pow(xmm0, exp);
    } else {
      // @0x113ac9..0x113ae2: -pow(-xmm0, 1.956) (xorpd sign flips).
      out = -Math.pow(-xmm0, exp);
    }
    this._writeFloat(out, rOut, gOut, bOut, aOut);
  }

  /**
   * Helper for the final write block @0x113afd..0x113b11:
   *   cvtsd2ss xmm0, xmm0
   *   movss xmm0, (*r), (*g), (*b)
   *   movl $0x3f800000, (*a)         ; = 1.0f
   */
  private _writeFloat(
    d: number,
    rOut: [number],
    gOut: [number],
    bOut: [number],
    aOut: [number],
  ): void {
    // @0x113afd: cvtsd2ss — cast to float32 (single-precision).
    const f = Math.fround(d);
    // @0x113b01..0x113b0c: broadcast to r/g/b.
    rOut[0] = f;
    gOut[0] = f;
    bOut[0] = f;
    // @0x113b11: alpha = 1.0f (bit pattern 0x3f800000).
    aOut[0] = Math.fround(1.0);
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::duplicate() const` — Helium @0x115770.
   *
   * Full disassembly (@0x115770..0x1157a3):
   *
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi, %rbx
   *   movl  $0x28, %edi                ; sizeof = 40 bytes
   *   callq __Znwm                     ; operator new(0x28)
   *   movups 0x8(%rbx), %xmm0          ; read 16 bytes from this[0x08..0x17]
   *   movups 0x14(%rbx), %xmm1         ; read 16 bytes from this[0x14..0x23]
   *   movups %xmm0, 0x8(%rax)          ; new[0x08..0x17]
   *   movups %xmm1, 0x14(%rax)         ; new[0x14..0x23]   (overlaps by 4 bytes)
   *   leaq   0x90745e(%rip), %rcx      ; = 0xa1cbf8 (this class's vtable+0x10)
   *   movq   %rcx, (%rax)              ; new->vptr = 0xa1cbf8
   *   addq $0x8, %rsp ; popq %rbx ; popq %rbp
   *   retq
   *
   * Copies bytes 0x08..0x23 of the base sub-object (numBins, numDims,
   * rangeScale, rangeOffset, storage — five fields) using two overlapping
   * 16-byte SSE loads (16+16-4 = 28 bytes total). No subclass-specific
   * fields exist to copy. The vtable pointer is (re-)installed to
   * 0xa1cbf8, this class's own vtable.
   *
   * Sizeof = 0x28 (40 bytes); byte 0x24..0x27 is padding (4 bytes) and
   * is not observably initialized by native; TS has no counterpart.
   */
  duplicate(): HGCanonLogToneCurveLUTInfo {
    // @0x11577e: __Znwm(0x28) → new instance.
    // @0x115783..0x11578f: overlapping 16-byte copy of base fields.
    // @0x115793..0x11579a: vtable install (target = 0xa1cbf8).
    const clone = new HGCanonLogToneCurveLUTInfo(
      this.numBins,
      this.rangeScale,
      this.rangeOffset,
      this.storage,
    );
    // Preserve any base numDims value directly (native duplicate copies
    // the raw byte; our ctor forces 1, which matches the invariant that
    // this class ALWAYS constructs with numDims=1. If native somehow
    // held a different value, that would be an invariant violation we
    // faithfully re-establish here.)
    clone.numDims = this.numDims;
    return clone;
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::~HGCanonLogToneCurveLUTInfo` D1 — Helium
   * @0x115750. Trivial empty destructor:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   * No field destruction needed (no subclass state; base is trivial POD).
   */
  __dtor_D1(): void {
    // @0x115750..0x115755 — empty.
  }

  /**
   * `HGCanonLogToneCurveLUTInfo::~HGCanonLogToneCurveLUTInfo` D0 — Helium
   * @0x115760. Deleting destructor; tail-jumps to __ZdlPv:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv
   * TS: JS GC replaces operator delete; body is a no-op.
   */
  __dtor_D0(): void {
    // @0x115760..0x115765 — tail-jump to operator delete.
  }
}
