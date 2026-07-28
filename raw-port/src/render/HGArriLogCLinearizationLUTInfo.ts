// raw-port/src/render/HGArriLogCLinearizationLUTInfo.ts
//
// FCP `HGArriLogCLinearizationLUTInfo` — Helium subclass of HGApplyNDLUTInfo
// modelling the ARRI ALEXA LogC (v3) → linear-light 1-D LUT descriptor per
// exposure index (EI). Selects one of 11 pre-tabulated EI parameter sets
// (100..1600) by the raw EI passed to the ctor, and exposes a scalar
// `colorAtIndex()` that inverts the piecewise LogC transfer function.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGArriLogCLinearizationLUTInfo.*.s
//         (captured mangled symbols __ZN30HGArriLogCLinearizationLUTInfo*).
//
// SYMBOLS (all VAs are x86_64 slice virtual addresses; file offset = VA):
//   @Helium 0x113460  ctor (C2)  (unsigned long, float, float, unsigned int ei,
//                                  HGApplyNDLUTInfo::LUTStorageFormat)
//   @Helium 0x113610  ctor (C1)  → tail-jumps to C2 @0x113460
//   @Helium 0x113620  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x113690  colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   @Helium 0x1156a0  duplicate() const
//   @Helium 0x115680  ~HGArriLogCLinearizationLUTInfo() (D1)
//   @Helium 0x115690  ~HGArriLogCLinearizationLUTInfo() (D0 — deleting; tail
//                                                       calls __ZdlPv)
//   @Helium 0x3d4dd0  static  linearizationParameters[11] table (see below)
//
// VTABLE @Helium 0xa1cb48 (installed ptr = 0xa1cb58; from ctor @0x113483..0x11348a):
//   *0x00 = 0x115680  ~HGArriLogCLinearizationLUTInfo (D1)
//   *0x08 = 0x115690  ~HGArriLogCLinearizationLUTInfo (D0)
//   *0x10 = 0x1156a0  duplicate() const                   [NEW virtual for this family]
//   *0x18 = 0x113620  isEqual(HGLUTCache::LUTInfo*) const  [override]
//   *0x20 = 0x113690  colorAtIndex(...) const              [override]
//   (typeinfo @0xa1cb48+0x40 = &typeinfo_HGApplyNDLUTInfo — base class chain confirmed.)
//
// LAYOUT (recovered field-by-field from ctor + duplicate asm — total 0x38 bytes):
//   0x00 : void*             vtable          (installed = 0xa1cb58)
//   0x08 .. 0x23 : inherited HGApplyNDLUTInfo base sub-object (28 bytes)
//                         numBins(u64), numDims(u64), rangeScale(f32),
//                         rangeOffset(f32), storage(u32).
//                         Base ctor is called with (this, numBins,
//                         numDims_forced=1, 0.0f, 0.0f-ish, storage) —
//                         the 2nd unsigned long is hardcoded to 1 via
//                         `movl $0x1, %edx` @0x113479 (this is a 1-D LUT).
//                         The base ctor also sees xmm0/xmm1 = the caller's
//                         f1/f2 as-passed (they aren't touched before the call).
//   0x24 : u32               bandIdx         (0..10, EI band index)
//   0x28 : f64               cutNormalizedY  (LogC threshold in normalized-Y)
//   0x30 : f64               logMultiplier   (= ln(10)/c, precomputed for exp path)
//   sizeof = 0x38.
//
// STATIC linearizationParameters TABLE (@Helium __DATA 0x3d4dd0, 11 × 0x38 bytes):
//   Recovered by reading 11 rows × 7 slots from the Helium x86_64 slice.
//   Slot layout per entry (verified across all 11 rows):
//     +0x00 : u64 ei_asa       (EI value in ASA units: 100..1600)
//     +0x08 : f64 param_a      (LogC "cut" — see ctor math below)
//     +0x10 : f64 param_b
//     +0x18 : f64 param_c      (LogC log-slope; ln(10)/c → stored at this+0x30)
//     +0x20 : f64 param_d
//     +0x28 : f64 param_e      (LogC linear-region slope)
//     +0x30 : f64 param_f      (LogC linear-region offset)
//
//   Values (byte-identical to the Helium __DATA image):
//
//   idx  ei    a         b          c         d          e          f
//    0  100   0.005561   0.080216   0.269036  0.381991   5.842037   0.092778
//    1  160   0.006208   0.076621   0.266007  0.382478   5.776265   0.092782
//    2  200   0.006871   0.072941   0.262978  0.382966   5.710494   0.092786
//    3  250   0.007622   0.068768   0.259627  0.383508   5.637732   0.092791
//    4  320   0.008318   0.064901   0.256598  0.383999   5.571960   0.092795
//    5  400   0.009031   0.060939   0.253569  0.384493   5.506188   0.092800
//    6  500   0.009840   0.056443   0.250219  0.385040   5.433426   0.092805
//    7  640   0.010591   0.052272   0.247190  0.385537   5.367655   0.092809
//    8  800   0.011361   0.047996   0.244161  0.386036   5.301883   0.092814
//    9 1000   0.012235   0.043137   0.240810  0.386590   5.229121   0.092819
//   10 1280   0.013047   0.038625   0.237781  0.387093   5.163350   0.092824
//   (Row for EI 1600 lives at the max-band; the ctor's final band is 10 when EI >= 1440.)
//
// BAND-SELECTION LADDER (ctor @0x113494..0x113577, u32 EI in %r14d):
//   ei  <  180  → bandIdx = 0   ,  linearizationParameters[0]
//   ei  <  225  → bandIdx = 1   ,  linearizationParameters[1]
//   ei  <  285  → bandIdx = 2   ,  linearizationParameters[2]
//   ei  <  360  → bandIdx = 3   ,  linearizationParameters[3]
//   ei  <  450  → bandIdx = 4   ,  linearizationParameters[4]
//   ei  <  570  → bandIdx = 5   ,  linearizationParameters[5]
//   ei  <  720  → bandIdx = 6   ,  linearizationParameters[6]
//   ei  <  900  → bandIdx = 7   ,  linearizationParameters[7]
//   ei  < 1140  → bandIdx = 8   ,  linearizationParameters[8]
//   ei  < 1440  → bandIdx = 9   ,  linearizationParameters[9]
//   ei >= 1440  → bandIdx = 10  ,  linearizationParameters[10]      (SetB adjust:
//                                                                    if ei < 1440 → bandIdx=9,
//                                                                    else bandIdx=10 — the
//                                                                    setb/subl-eax combo
//                                                                    @0x11355b..0x113577).
//   Thresholds are midpoints between adjacent EI values; the ladder maps caller-supplied
//   ASA/EI to its nearest supported band without interpolation.
//
// CTOR TAIL MATH (@0x113585..0x113604) — computes the derived cache fields:
//   Let p = linearizationParameters[bandIdx]. Then:
//     this.cutNormalizedY = 0.5 * ( p.e*p.a + p.f + p.c*log10( (50/9)*p.a + p.b ) + p.d )
//     this.logMultiplier  = ln(10) / p.c
//   Constants: 50/9 = 5.5555555555555555 @Helium 0x3d0e58;  0.5 @Helium 0x3cc1c0;
//              ln(10) = 2.302585092994046 @Helium 0x3d4a50 (verified byte-identical).
//   (The trace is: xmm1=p.a; xmm0=p.c; xmm0=(50/9)*p.a + p.b; xmm0=log10(xmm0);
//    xmm0=xmm0*p.c + p.d; xmm2=p.a*p.e + p.f + xmm0; cutNormalizedY = xmm2*0.5;
//    logMultiplier = ln(10)/p.c.)
//
// COLORAT INDEX (@0x113690..0x113746) — inverse ARRI LogC transfer:
//   Let x_in = the FIRST channel argument (f32). The disasm reads xmm0 only; the other
//   two f32s (%xmm1_in and %xmm2_in per caller convention) are ignored, and the code
//   writes the SAME scalar output to R, G, and B pointers, and constant 1.0f to A.
//
//   Clamp x_in (f32) to [0.0, 1.0]:
//     if x_in < 0    → xd = 0.0
//     else if x_in > 1.0f → xd = 1.0            (Helium 0x3ca260 = fp64 1.0)
//     else               → xd = (double)x_in     (cvtss2sd)
//
//   Let p = linearizationParameters[this.bandIdx]. Then compare xd against
//   this.cutNormalizedY:
//     if xd > this.cutNormalizedY:
//         y = ( exp( (xd - p.d) * this.logMultiplier ) - p.b ) / (50/9)
//     else:
//         y = ( xd - p.f ) / p.e
//     y /= 0.9                                   (Helium 0x3d0e50 = fp64 0.9)
//     *outR = *outG = *outB = (float)y           (single-precision truncation)
//     *outA = 1.0f
//
// COLORAT INDEX CONSTANTS (verified by reading /tmp/Helium.x86_64):
//   0x3c7cc0  f32 1.0f            (upper-clamp comparand — ucomiss @0x1136b8)
//   0x3ca260  f64 1.0             (fp64 1.0 loaded if x_in > 1.0f — @0x1136c1)
//   0x3d0e58  f64 5.5555555555555555   (50/9; two RIP-relative loads:
//                                        - divsd @0x113700 in colorAtIndex
//                                        - mulsd @0x11359d in ctor)
//   0x3d0e50  f64 0.9             (divisor @0x113716 in colorAtIndex)
//   0x3cc1c0  f64 0.5             (mulsd @0x1135dc in ctor)
//   0x3d4a50  f64 2.302585092994046 = ln(10)  (movsd @0x1135e9 in ctor)
//
// ISEQUAL (@0x113620..0x113684):
//   if (other == null) → return 0
//   auto d = __dynamic_cast(other, LUTInfo_ti, HGArriLogCLinearizationLUTInfo_ti, 0);
//   if (d == null) → return 0
//   if (! HGApplyNDLUTInfo::isEqual(this, d)) → return 0
//   return this->bandIdx == d->bandIdx
//   (i.e. equality is base-class equality plus a u32 bandIdx match. The disasm reads
//    0x24(%rbx) and 0x24(%r15) via `movl` + `cmpl` + `sete` @0x113667..0x11366e.)
//
// DUPLICATE (@0x1156a0..0x1156e1):
//   auto* d = (HGArriLogCLinearizationLUTInfo*) operator new(0x38);
//   *((base8..0x23))(d)  = *((base8..0x23))(this);     // movups 0x8, movups 0x14
//   *((void**)d)         = &vtable_installed_ptr;      // leaq 0x90748e(%rip) → 0xa1cb58
//   *((0x24..0x33))(d)   = *((0x24..0x33))(this);      // movups 0x24 = m24 + cutY + hi(logMult)
//   *((u32*)(d+0x34))    = *((u32*)(this+0x34));       // movl  0x34 = lo(logMult)
//   return d
//
// DESTRUCTORS (@0x115680 D1, @0x115690 D0):
//   Both are: push rbp; mov rsp,rbp; pop rbp; (D0) jmp __ZdlPv / (D1) retq.
//   No field cleanup — the class holds only POD fields. D0 tail-calls operator delete.

import {
  HGApplyNDLUTInfo,
  type LUTStorageFormat,
} from './HGApplyNDLUTInfo';

// ── Frontier stubs (undecoded external callees — see PORTING_SPEC rule 3) ────────────

/**
 * `___dynamic_cast(src, srcType, dstType, hint)` — libc++abi RTTI helper.
 *   @Helium 0x11364b  callq 0x3c5018   ## symbol stub for: ___dynamic_cast
 *
 * Itanium-ABI signature: `void* __dynamic_cast(const void*, const std::type_info*,
 * const std::type_info*, ptrdiff_t)`. Returns adjusted pointer on success, nullptr on
 * failure. Our TS port cannot re-derive the C++ RTTI adjust chain — the isEqual method
 * below therefore uses `instanceof` on the derived class, as done in the base class port
 * (HGApplyNDLUTInfo.isEqual). We keep this stub as documentation for the exact call site.
 */
function __dynamic_cast_stub(): never {
  throw new Error(
    "___dynamic_cast @Helium 0x11364b is not transcribed. HGArriLogCLinearizationLUTInfo." +
    "isEqual uses `instanceof HGArriLogCLinearizationLUTInfo` in lieu of the Itanium " +
    "RTTI adjust — see PORTING_SPEC rule 3. This stub exists for provenance only."
  );
}

// ── Static class member: linearizationParameters ────────────────────────────────────

/** One row of the ARRI LogC per-EI parameter table (see file header). */
export interface HGArriLogCLinearizationParams {
  /** EI value in ASA units, 100..1600 (u64 in the binary, stored @+0x00). */
  readonly ei: number;
  /** LogC "cut" threshold (fp64 @+0x08). Also appears in the ctor as `p.a`. */
  readonly cutBlack: number;
  /** Fp64 @+0x10 — the `b` argument of `log10((50/9)*a + b)` in the ctor. */
  readonly b: number;
  /** Fp64 @+0x18 — the log-slope `c` (ln(10)/c is precomputed as `logMultiplier`). */
  readonly c: number;
  /** Fp64 @+0x20 — the log-region offset `d`. */
  readonly d: number;
  /** Fp64 @+0x28 — the linear-region slope `e`. */
  readonly e: number;
  /** Fp64 @+0x30 — the linear-region offset `f`. */
  readonly f: number;
}

/**
 * `HGArriLogCLinearizationLUTInfo::linearizationParameters[]`
 *   @Helium __DATA 0x3d4dd0, 11 × 0x38-byte rows.
 *
 * Byte-verified from the Helium x86_64 slice. Referenced by the ctor and by colorAtIndex
 * via `leaq __ZN30HGArriLogCLinearizationLUTInfo23linearizationParametersE(%rip), %r13`.
 */
export const HGArriLogCLinearizationLUTInfo_linearizationParameters: readonly HGArriLogCLinearizationParams[] = Object.freeze([
  // idx 0 — EI 100
  Object.freeze({ ei: 100,  cutBlack: 0.005561, b: 0.080216, c: 0.269036, d: 0.381991, e: 5.842037, f: 0.092778 }),
  // idx 1 — EI 160
  Object.freeze({ ei: 160,  cutBlack: 0.006208, b: 0.076621, c: 0.266007, d: 0.382478, e: 5.776265, f: 0.092782 }),
  // idx 2 — EI 200
  Object.freeze({ ei: 200,  cutBlack: 0.006871, b: 0.072941, c: 0.262978, d: 0.382966, e: 5.710494, f: 0.092786 }),
  // idx 3 — EI 250
  Object.freeze({ ei: 250,  cutBlack: 0.007622, b: 0.068768, c: 0.259627, d: 0.383508, e: 5.637732, f: 0.092791 }),
  // idx 4 — EI 320
  Object.freeze({ ei: 320,  cutBlack: 0.008318, b: 0.064901, c: 0.256598, d: 0.383999, e: 5.571960, f: 0.092795 }),
  // idx 5 — EI 400
  Object.freeze({ ei: 400,  cutBlack: 0.009031, b: 0.060939, c: 0.253569, d: 0.384493, e: 5.506188, f: 0.092800 }),
  // idx 6 — EI 500
  Object.freeze({ ei: 500,  cutBlack: 0.009840, b: 0.056443, c: 0.250219, d: 0.385040, e: 5.433426, f: 0.092805 }),
  // idx 7 — EI 640
  Object.freeze({ ei: 640,  cutBlack: 0.010591, b: 0.052272, c: 0.247190, d: 0.385537, e: 5.367655, f: 0.092809 }),
  // idx 8 — EI 800
  Object.freeze({ ei: 800,  cutBlack: 0.011361, b: 0.047996, c: 0.244161, d: 0.386036, e: 5.301883, f: 0.092814 }),
  // idx 9 — EI 1000
  Object.freeze({ ei: 1000, cutBlack: 0.012235, b: 0.043137, c: 0.240810, d: 0.386590, e: 5.229121, f: 0.092819 }),
  // idx 10 — EI 1280
  Object.freeze({ ei: 1280, cutBlack: 0.013047, b: 0.038625, c: 0.237781, d: 0.387093, e: 5.163350, f: 0.092824 }),
]);

// ── Recovered fp64 constants (see file header for full RIP-target trace) ────────────
/** `50/9` — @Helium 0x3d0e58. Used in both ctor (mulsd @0x11359d) and colorAtIndex
 *  (divsd @0x113700). NOT the per-EI `a` value; a base ARRI LogC scaling constant. */
const K_FIFTY_OVER_NINE = 5.5555555555555555;
/** `0.9` — @Helium 0x3d0e50. Trailing normalization divisor @0x113716. */
const K_POINT_NINE      = 0.9;
/** `0.5` — @Helium 0x3cc1c0. Halving factor for `cutNormalizedY` @0x1135dc. */
const K_HALF            = 0.5;
/** `ln(10)` — @Helium 0x3d4a50. Precomputes `logMultiplier = ln(10)/c` @0x1135e9. */
const K_LN10            = 2.302585092994046;
/** `1.0` (fp64) — @Helium 0x3ca260. Loaded when x_in > 1.0f (upper clamp) @0x1136c1. */
const K_ONE_D           = 1.0;
/** `1.0f` (single) — @Helium 0x3c7cc0. Upper-clamp comparand @0x1136b8. */
const K_ONE_F           = Math.fround(1.0);

// ── EI band-selection thresholds (recovered from the ctor `cmp` cascade) ────────────
//
// Each `cmpl imm32, %r14d; jb` pins the upper end of the previous band. Values below
// are the exact `imm32` in the disasm (see @0x113494..0x113559 for the cascade). The
// final "0x5a0" (=1440) is used by the setb/subl-eax band-10 collapse @0x11355d.
const K_BAND_THRESHOLDS: readonly [number, number, number, number, number, number, number, number, number, number] = [
  0x0b4, // @0x113494 — 180
  0x0e1, // @0x1134ac — 225
  0x11d, // @0x1134c6 — 285
  0x168, // @0x1134e0 — 360
  0x1c2, // @0x1134fa — 450
  0x23a, // @0x113510 — 570
  0x2d0, // @0x113526 — 720
  0x384, // @0x11353c — 900
  0x474, // @0x113552 — 1140
  0x5a0, // @0x11355d — 1440
];

/**
 * `HGArriLogCLinearizationLUTInfo` — ARRI ALEXA LogC v3 → linear-light 1-D LUT
 * descriptor. Subclass of {@link HGApplyNDLUTInfo}. All object state (numBins,
 * numDims=1, rangeScale, rangeOffset, storage) lives in the base sub-object;
 * this class adds three fields (bandIdx, cutNormalizedY, logMultiplier) that
 * cache the per-EI curve parameters.
 *
 * @Helium vtable @0xa1cb48 (installed ptr = 0xa1cb58; see file header).
 */
export class HGArriLogCLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /** @Helium +0x24 (u32) — index into linearizationParameters, 0..10. */
  bandIdx: number;
  /** @Helium +0x28 (f64) — precomputed 0.5*(a*e + f + c*log10((50/9)*a + b) + d). */
  cutNormalizedY: number;
  /** @Helium +0x30 (f64) — precomputed ln(10)/c (multiplier for the exp() branch). */
  logMultiplier: number;

  /**
   * `HGArriLogCLinearizationLUTInfo::HGArriLogCLinearizationLUTInfo(
   *      unsigned long numBins, float rangeScale, float rangeOffset,
   *      unsigned int ei, HGApplyNDLUTInfo::LUTStorageFormat storage)`
   *   @Helium C2 @0x113460, C1 @0x113610 (C1 tail-jumps to C2 — verified).
   *
   * Executed in three phases:
   *   1. @0x11347e  call base HGApplyNDLUTInfo::HGApplyNDLUTInfo(this, numBins,
   *        numDims_forced=1, rangeScale, rangeOffset, storage) — the `1` is
   *        hard-coded via `movl $0x1, %edx` @0x113479 (this LUT is 1-D).
   *   2. @0x113483..0x113577  install vtable ptr, initialize `bandIdx = 0`,
   *        then walk the EI-threshold cascade to pick 0..10 (see the ladder
   *        in the file header). The ladder is verbatim-transcribed via the
   *        K_BAND_THRESHOLDS array above.
   *   3. @0x113585..0x113604  compute the two derived fields from the chosen
   *        `linearizationParameters[bandIdx]` row (formulas in file header).
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    ei: number,
    storage: LUTStorageFormat,
  ) {
    // Phase 1 — @Helium 0x113479..0x11347e: base ctor with numDims forced to 1.
    // Note: base ctor takes u64,u64,f32,f32,u32; we pass numDims=1 exactly as
    // the disasm does. The base ctor's numDims clamp will preserve `1`.
    super(numBins, 1, rangeScale, rangeOffset, storage);

    // Phase 2 — @Helium 0x113483..0x11348a: install our vtable pointer.
    // (In the C++ this overwrites (void*)(this) which the base ctor just set;
    // we mirror by directly assigning the derived vtable address here.)
    this.vtable = 0xa1cb58; // installed ptr; vtable @0xa1cb48 + 0x10 (post-RTTI).

    // Phase 2 — @Helium 0x11348d: bandIdx = 0 (initial store).
    // The cascade below refines this to 0..10 based on `ei`.
    let bandIdx: number;
    const eiU32 = ei >>> 0; // @Helium 0x11346d movl %edx,%r14d — u32 semantics.

    // @Helium 0x113494..0x11349b: `cmpl $0xb4, r14d; jae 0x1134a5` — first cascade rung.
    if (eiU32 < K_BAND_THRESHOLDS[0]) {
      // @Helium 0x11349d..0x1134a0: `xorl %r15d,%r15d; jmp 0x11357a` (bandIdx=0).
      bandIdx = 0;
    } else {
      // @Helium 0x1134a5: `movl $0x1, 0x24(%rbx)` — commit bandIdx = 1.
      bandIdx = 1;
      // @Helium 0x1134ac..0x1134b3: `cmpl $0xe1, r14d; jb 0x11357a`.
      if (eiU32 >= K_BAND_THRESHOLDS[1]) {
        // @Helium 0x1134b9..0x1134c6: `movl $0x2, 0x24; movl $0x2, r15d`.
        bandIdx = 2;
        if (eiU32 >= K_BAND_THRESHOLDS[2]) {
          // @Helium 0x1134d3..0x1134e0
          bandIdx = 3;
          if (eiU32 >= K_BAND_THRESHOLDS[3]) {
            // @Helium 0x1134ed..0x1134fa
            bandIdx = 4;
            if (eiU32 >= K_BAND_THRESHOLDS[4]) {
              // @Helium 0x113503..0x113510
              bandIdx = 5;
              if (eiU32 >= K_BAND_THRESHOLDS[5]) {
                // @Helium 0x113519..0x113526
                bandIdx = 6;
                if (eiU32 >= K_BAND_THRESHOLDS[6]) {
                  // @Helium 0x11352f..0x11353c
                  bandIdx = 7;
                  if (eiU32 >= K_BAND_THRESHOLDS[7]) {
                    // @Helium 0x113545..0x113552
                    bandIdx = 8;
                    if (eiU32 >= K_BAND_THRESHOLDS[8]) {
                      // @Helium 0x11355b..0x113577: the final band-10 collapse.
                      //   xorl %eax,%eax
                      //   cmpl $0x5a0,%r14d
                      //   setb %al                    ; eax = (ei < 1440) ? 1 : 0
                      //   movl $0xa,%ecx
                      //   subl %eax,%ecx              ; ecx = 10 - (ei<1440?1:0) = 9 or 10
                      //   movl %ecx,0x24(%rbx)
                      //   movl $0xa,%r15d
                      //   subq %rax,%r15              ; r15 = 10 - (ei<1440?1:0)
                      const belowFinal = eiU32 < K_BAND_THRESHOLDS[9] ? 1 : 0;
                      bandIdx = 10 - belowFinal;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    this.bandIdx = bandIdx | 0;

    // Phase 3 — @Helium 0x11357a..0x113604: compute derived fp64 fields.
    // `r14 = bandIdx * 0x38; r15 = &linearizationParameters; p = *(r14+r15)`.
    const p = HGArriLogCLinearizationLUTInfo_linearizationParameters[bandIdx];

    // @Helium 0x113585: xmm1 = p.cutBlack  (loaded from +0x08(entry) into xmm1)
    //         0x113591: xmm0 = p.c         (loaded from +0x18(entry) into xmm0)
    //         0x11359d: xmm0 = 50/9        (movsd of K_FIFTY_OVER_NINE)
    //         0x1135a5: xmm0 *= p.cutBlack (i.e. xmm0 = (50/9) * p.a)
    //         0x1135a9: xmm0 += p.b        (i.e. xmm0 = (50/9)*p.a + p.b)
    //         0x1135b0: xmm0 = log10(xmm0) (callq _log10 — libm double log10)
    //         0x1135b5: xmm1 = p.c (reload from stack)
    //         0x1135ba: xmm0 *= p.c
    //         0x1135be: xmm0 += p.d
    //         0x1135c5: xmm2 = p.cutBlack (reload from stack)
    //         0x1135ca: xmm2 *= p.e
    //         0x1135d1: xmm2 += p.f
    //         0x1135d8: xmm2 += xmm0
    //         0x1135dc: xmm2 *= 0.5
    //         0x1135e4: this->cutNormalizedY = xmm2
    const inner   = K_FIFTY_OVER_NINE * p.cutBlack + p.b;
    const logPart = Math.log10(inner) * p.c + p.d;
    const linPart = p.cutBlack * p.e + p.f;
    this.cutNormalizedY = K_HALF * (linPart + logPart);

    // @Helium 0x1135e9: xmm0 = ln(10) (K_LN10)
    //         0x1135f1: xmm0 /= p.c
    //         0x1135f5: this->logMultiplier = xmm0
    this.logMultiplier = K_LN10 / p.c;
  }

  /**
   * `HGArriLogCLinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo* other) const`
   *   @Helium 0x113620.
   *
   *   0x11362a: testq %rsi, %rsi ; if other == null → return 0                          @0x113674
   *   0x113632: leaq  __ZTIN10HGLUTCache7LUTInfoE(%rip)                                 (srcType)
   *   0x113639: leaq  __ZTI30HGArriLogCLinearizationLUTInfo(%rip)                       (dstType)
   *   0x113640: xorl  %r14d,%r14d                                                       (result=0)
   *   0x11364b: callq ___dynamic_cast                                                   (returns rax)
   *   0x113650: testq %rax,%rax ; if rax == null → return 0                             @0x113677
   *   0x113655: mov   rax → r15
   *   0x11365e: callq HGApplyNDLUTInfo::isEqual(this, r15)
   *   0x113663: testb %al,%al ; if !base_isEqual → return 0                             @0x113665→@0x113674
   *   0x113667: movl  0x24(%rbx), %eax
   *   0x11366a: cmpl  0x24(%r15), %eax
   *   0x11366e: sete  %r14b                                                             (result = (this.bandIdx == other.bandIdx))
   *   0x113672: jmp   @0x113677 (return r14)
   *
   * The TS port swaps `___dynamic_cast` for `instanceof` (see stub note above), which
   * is the identical decision the base class port took (HGApplyNDLUTInfo.isEqual line
   * `if (!(other instanceof HGApplyNDLUTInfo)) return false;`).
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @Helium 0x11362a
    if (other == null) return false;
    // @Helium 0x11364b: dynamic_cast<HGArriLogCLinearizationLUTInfo*>(other) — TS uses instanceof.
    if (!(other instanceof HGArriLogCLinearizationLUTInfo)) return false;
    // @Helium 0x11365e: base class equality.
    if (!super.isEqual(other)) return false;
    // @Helium 0x113667..0x11366e: bandIdx match.
    return this.bandIdx === other.bandIdx;
  }

  /**
   * `HGArriLogCLinearizationLUTInfo::colorAtIndex(f32 r, f32, f32, f32*, f32*, f32*, f32*) const`
   *   @Helium 0x113690.
   *
   * Only the first f32 argument is read (%xmm0). The other two f32 args (%xmm1_in and
   * %xmm2_in per SysV ABI) are ignored. Output is written to R, G, and B as the same
   * scalar y, and A is set to 1.0f (via `movl $0x3f800000, (%rbx)` @0x113732).
   *
   * Control flow:
   *   0x1136ad: xorps %xmm0,%xmm0; xorps %xmm2,%xmm2
   *   0x1136b3: ucomiss %xmm1,%xmm2 ; compare 0.0f vs x_in
   *   0x1136b6: ja 0x1136d2         ; if 0.0 > x_in (i.e. x_in < 0)  → xmm0 stays 0.0 (double)
   *   0x1136b8: ucomiss K_ONE_F,%xmm1
   *   0x1136bf: jbe 0x1136cb        ; if K_ONE_F <= x_in is FALSE (i.e. x_in > 1.0f) → fall through and load 1.0
   *   0x1136c1: movsd K_ONE_D,%xmm0 ; xmm0 = 1.0 (double)
   *   0x1136c9: jmp 0x1136d2
   *   0x1136cb: xorps %xmm0,%xmm0
   *   0x1136ce: cvtss2sd %xmm1,%xmm0 ; xmm0 = (double) x_in
   *   ; --- 0x1136d2 merges: xmm0 is the clamped fp64 x, in [0.0, 1.0]. ---
   *   0x1136d2: movl 0x24(%rdi),%eax ; eax = this.bandIdx
   *   0x1136d5: imulq $0x38,%rax     ; rax = bandIdx * 56
   *   0x1136d9: leaq linearizationParameters,%r13
   *   0x1136e0: addq %rax,%r13       ; r13 = &params[bandIdx]
   *   0x1136e3: ucomisd 0x28(%rdi),%xmm0 ; compare this.cutNormalizedY vs xmm0
   *   0x1136e8: jbe 0x11370a         ; if cutNormalizedY >= xmm0 → linear branch
   *   ; --- exp branch (xmm0 > cutNormalizedY) ---
   *   0x1136ea: subsd 0x20(r13),xmm0 ; xmm0 -= p.d
   *   0x1136f0: mulsd 0x30(%rdi),xmm0 ; xmm0 *= this.logMultiplier
   *   0x1136f5: callq _exp           ; xmm0 = exp(xmm0)
   *   0x1136fa: subsd 0x10(r13),xmm0 ; xmm0 -= p.b
   *   0x113700: divsd K_FIFTY_OVER_NINE,xmm0
   *   0x113708: jmp 0x113716
   *   ; --- linear branch ---
   *   0x11370a: subsd 0x30(r13),xmm0 ; xmm0 -= p.f
   *   0x113710: divsd 0x28(r13),xmm0 ; xmm0 /= p.e
   *   ; --- merge ---
   *   0x113716: divsd K_POINT_NINE,xmm0
   *   0x11371e: cvtsd2ss %xmm0,%xmm0 ; xmm0 = (float) xmm0
   *   0x113722: movss %xmm0,(%r12)   ; *outR = xmm0
   *   0x113728: movss %xmm0,(%r15)   ; *outG = xmm0
   *   0x11372d: movss %xmm0,(%r14)   ; *outB = xmm0
   *   0x113732: movl $0x3f800000,(%rbx) ; *outA = 1.0f
   */
  colorAtIndex(
    r: number,
    _g: number,
    _b: number,
    outR: [number],
    outG: [number],
    outB: [number],
    outA: [number],
  ): void {
    // @Helium 0x1136aa..0x1136d2 — clamp x_in to [0.0, 1.0], as fp64.
    // Note: comparisons use ucomiss (single-precision) on the incoming float.
    const xf = Math.fround(r);
    let x: number;
    // @Helium 0x1136b3..0x1136b6: `ucomiss xmm1,xmm2` with xmm2=0.0 tests 0.0>xf.
    // On NaN, ucomiss sets PF=1 which makes `ja` fall through (mirrors here: NaN → 0.0).
    if (!(xf > 0.0)) {
      // @Helium 0x1136ad→0x1136b6→0x1136d2 (xmm0 already 0 from xorps at 0x1136ad).
      x = 0.0;
    } else if (xf > K_ONE_F) {
      // @Helium 0x1136c1..0x1136c9: xmm0 = 1.0 (fp64).
      x = K_ONE_D;
    } else {
      // @Helium 0x1136cb..0x1136ce: xmm0 = (double) xf via cvtss2sd.
      x = xf;
    }

    // @Helium 0x1136d2..0x1136e0: p = linearizationParameters[bandIdx].
    const p = HGArriLogCLinearizationLUTInfo_linearizationParameters[this.bandIdx];

    // @Helium 0x1136e3..0x1136e8: exp branch vs linear branch.
    let y: number;
    if (x > this.cutNormalizedY) {
      // @Helium 0x1136ea..0x113708 — exp branch.
      const arg = (x - p.d) * this.logMultiplier; // @0x1136ea + @0x1136f0
      y = (Math.exp(arg) - p.b) / K_FIFTY_OVER_NINE; // @0x1136f5 + @0x1136fa + @0x113700
    } else {
      // @Helium 0x11370a..0x113710 — linear branch.
      y = (x - p.f) / p.e;
    }

    // @Helium 0x113716..0x11371e — trailing /0.9 and single-precision truncation.
    y = y / K_POINT_NINE;
    const ys = Math.fround(y);

    // @Helium 0x113722..0x113732 — write outputs.
    outR[0] = ys;
    outG[0] = ys;
    outB[0] = ys;
    outA[0] = Math.fround(1.0); // 0x3f800000 == 1.0f
  }

  /**
   * `HGArriLogCLinearizationLUTInfo::duplicate() const` — Helium @0x1156a0.
   *
   *   0x1156a9: movl  $0x38, %edi           ; sizeof = 0x38
   *   0x1156ae: callq __Znwm                ; d = operator new(0x38)
   *   0x1156b3: movups 0x8(%rbx),%xmm0      ; copy bytes 0x08..0x17 (base first half)
   *   0x1156b7: movups 0x14(%rbx),%xmm1     ; copy bytes 0x14..0x23 (base second half + rangeOffset/storage)
   *   0x1156bb: movups %xmm0,0x8(%rax)
   *   0x1156bf: movups %xmm1,0x14(%rax)
   *   0x1156c3: leaq  0x90748e(%rip),%rcx   ; install ptr = 0xa1cb58
   *   0x1156ca: movq  %rcx,(%rax)
   *   0x1156cd: movups 0x24(%rbx),%xmm0     ; copy bandIdx + cutNormalizedY + hi(logMult)
   *   0x1156d1: movups %xmm0,0x24(%rax)
   *   0x1156d5: movl  0x34(%rbx),%ecx       ; copy lo(logMult) tail 4 bytes
   *   0x1156d8: movl  %ecx,0x34(%rax)
   *   0x1156e1: retq
   *
   * The disasm copies raw byte spans across the base sub-object and then across our
   * three derived fields. In the TS port we duplicate via a bypass-ctor allocation
   * (Object.create) followed by per-field assignment — the two forms are
   * field-equivalent (all fields are POD; the base's `numDims` is already 1 and
   * stays 1 under the clamp). Object.create is the faithful mirror of the raw
   * `__Znwm(0x38) + movups*` in the disasm — no derived-value recomputation.
   */
  duplicate(): HGArriLogCLinearizationLUTInfo {
    // @Helium 0x1156ae: operator new (JS handles allocation via Object.create).
    const d = Object.create(HGArriLogCLinearizationLUTInfo.prototype) as HGArriLogCLinearizationLUTInfo;
    // @Helium 0x1156b3..0x1156bf: copy base sub-object (0x08..0x23).
    (d as HGApplyNDLUTInfo).numBins     = this.numBins;
    (d as HGApplyNDLUTInfo).numDims     = this.numDims;
    (d as HGApplyNDLUTInfo).rangeScale  = this.rangeScale;
    (d as HGApplyNDLUTInfo).rangeOffset = this.rangeOffset;
    (d as HGApplyNDLUTInfo).storage     = this.storage;
    // @Helium 0x1156c3..0x1156ca: install our vtable ptr.
    d.vtable = 0xa1cb58;
    // @Helium 0x1156cd..0x1156d8: copy derived fields (bandIdx, cutY, logMult).
    d.bandIdx        = this.bandIdx;
    d.cutNormalizedY = this.cutNormalizedY;
    d.logMultiplier  = this.logMultiplier;
    return d;
  }
}
