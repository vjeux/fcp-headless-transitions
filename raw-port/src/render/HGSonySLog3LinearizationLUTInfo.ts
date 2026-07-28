// raw-port/src/render/HGSonySLog3LinearizationLUTInfo.ts
//
// FCP `HGSonySLog3LinearizationLUTInfo` — Helium subclass of HGApplyNDLUTInfo modelling
// the Sony S-Log3 -> linear-light 1-D LUT descriptor.  Sits next to the ARRI/Canon/BMD/
// DJI/Apple/Panasonic log-linearization LUT descriptors (same pattern; see the sibling
// files HGArriLogCLinearizationLUTInfo.ts, HGCanonLog2LinearizationLUTInfo.ts, etc).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGSonySLog3LinearizationLUTInfo.*.s
//         (mangled symbols __ZN31HGSonySLog3LinearizationLUTInfo*).
//
// SYMBOLS (all VAs are x86_64 slice virtual addresses; file offset = VA):
//   @Helium 0x114160  ctor (C2)  (unsigned long numBins, float rangeScale,
//                                 float rangeOffset,
//                                 HGApplyNDLUTInfo::LUTStorageFormat storage)
//   @Helium 0x114190  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x1141e0  colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   @Helium 0x115930  ~HGSonySLog3LinearizationLUTInfo() (D1)  — trivial `pushq;movq;popq;ret`
//   @Helium 0x115940  ~HGSonySLog3LinearizationLUTInfo() (D0)  — tail-jumps to __ZdlPv
//   @Helium 0x115950  duplicate() const
//   @Helium 0x3c3f40  colorAtIndex .cold.1  (initialises static local ::tl)
//   @Helium 0x3c3f80  colorAtIndex .cold.2  (initialises static local ::tlmd)
//   @Helium 0x3c3fc0  colorAtIndex .cold.3  (initialises static local ::aa)
//
// LAYOUT (recovered from the C2 asm + duplicate asm — total 0x28 bytes):
//   0x00 : void*                             vtable          (installed at end of C2)
//   0x08 .. 0x23 : inherited HGApplyNDLUTInfo base sub-object (28 bytes)
//                                                        numBins(u64), numDims(u64),
//                                                        rangeScale(f32), rangeOffset(f32),
//                                                        storage(u32).
//                                                        The base ctor is called with the
//                                                        subclass's (numBins, numDims=1 —
//                                                        hardcoded via `movl $0x1, %edx`
//                                                        @0x11416b, rangeScale, rangeOffset,
//                                                        storage) — so this LUT is 1-D.
//   sizeof(HGSonySLog3LinearizationLUTInfo) = 0x28 bytes (matches the `__Znwm` allocation
//   size in duplicate() @0x115959 = 0x28).
//
// VTABLE: installed pointer written at ctor @0x114175..0x11417c:
//   leaq 0x908c0c(%rip), %rax   ## rip+disp @0x114175, len 7, next=0x11417c
//                               ## => vtable installed ptr = 0x11417c + 0x908c0c = 0xa1cd88
//   movq %rax, (%rbx)           ## store as this->vtable
//   The vtable RTTI descriptor lives immediately before at 0xa1cd88-0x10 = 0xa1cd78 and
//   chains to __ZTI16HGApplyNDLUTInfo (verified via isEqual's typeinfo cross-cast).
//
// STATIC LOCALS in colorAtIndex (initialised by the .cold.N helpers, guarded by
// `__cxa_guard_acquire/release`):
//   ::tl    (double)  = 171.2102946928606     (u64 0x406566babbef8b7a) — S-Log3 knee
//                                              threshold in 10-bit CV units (per spec
//                                              this is 171.2102946928623/1023 * 1023).
//   ::aa    (double)  = 0.008805296722730577  (u64 0x3f820882eba5480a) — ln(10)/261.5
//                                              (the S-Log3 log-slope exponent).
//   ::tlmd  (double)  = tl + (-95.0) = 76.2102946928606 — cached "tl - 95" denominator
//                                              for the linear-region divide.
//                                              (-95.0 comes from RIP-const @0x3d4b50.)
//
// COLOR-AT-INDEX MATH (verified against Sony S-Log3 EOTF spec):
//   Given input scalar `x` (float, in normalised code-value units where x=1 -> CV=1023):
//     let v = clamp(x, 0, 1) * 1023
//     if v < tl:      L = ((v - 95) / (tl - 95)) * 0.01125           / 0.9
//     else:           L = (exp((v - 420) * ln(10)/261.5) * 0.19 - 0.01) / 0.9
//   All three RGB outputs receive L; the alpha output is written 1.0f exactly.
//
// DECODE constants (all resolved via `resolve.py Helium const 0x...`):
//   0x3d4b30 : double  1023.0             — code-value scale
//   0x3d4b38 : double -420.0              — S-Log3 log-region shift
//   0x3d4b40 : double  0.19               — S-Log3 log-region gain
//   0x3d4b48 : double -0.01               — S-Log3 log-region offset
//   0x3d4b50 : double -95.0               — tl -> tlmd offset (linear-region denom)
//   0x3d4b58 : double  0.01125            — linear-region scale
//   0x3c7cc0 : float  1.0f (low 4 of a u64x2) — ucomiss clamp against x=1.0
//   0x3ca260 : double  1.0                — used to load 1.0 for x>1 clamp path
//   0x3d0e50 : double  0.9                — final /0.9 divisor
//
// isEqual behaviour (@0x114190): performs `dynamic_cast<HGSonySLog3LinearizationLUTInfo*>`
// on the LUTInfo* argument; if the cast succeeds, tail-jumps to
// `HGApplyNDLUTInfo::isEqual(this, cast_result)` (the base's structural comparator).
// If either the argument is null or the cast returns null, returns false (xor eax,eax).
//
// duplicate() (@0x115950): allocates 0x28 bytes via `__Znwm`, memcpy's the inherited
// base sub-object (bytes 0x08..0x23) from `this` to the new object using two `movups`,
// then writes the installed vtable pointer (0xa1cd88, via leaq rip+0x9074_0e @0x115973,
// len 7, next=0x11597a -> 0x11597a + 0x9074_0e = 0xa1cd88 — matches ctor).  Returns the
// new HGSonySLog3LinearizationLUTInfo*.

import { HGApplyNDLUTInfo, LUTStorageFormat } from "./HGApplyNDLUTInfo";

// Static-local doubles cached at first use inside colorAtIndex.  We compute them at
// module load (equivalent to the __cxa_guard_acquire path returning success once).
//
// tl @0x3c3f54 (movabsq $0x406566babbef8b7a, %rax; movq %rax, ::tl)
const SLOG3_TL: number = 171.2102946928606;
// aa @0x3c3fd4 (movabsq $0x3f820882eba5480a, %rax; movq %rax, ::aa)
const SLOG3_AA: number = 0.008805296722730577;
// tlmd @0x3c3f94..0x3c3fa4 (movsd ::tl,xmm0; addsd RIP+0x10bac(-95.0),xmm0; movsd xmm0,::tlmd)
const SLOG3_TLMD: number = SLOG3_TL + -95.0;

// RIP-relative colorAtIndex arithmetic constants (all doubles from __TEXT __const):
const CV_SCALE_1023: number = 1023.0;     // @0x3d4b30
const LOG_SHIFT_M420: number = -420.0;    // @0x3d4b38
const LOG_GAIN_0P19: number = 0.19;       // @0x3d4b40
const LOG_OFFSET_M0P01: number = -0.01;   // @0x3d4b48
const LIN_SCALE_0P01125: number = 0.01125; // @0x3d4b58
const CLAMP_ONE_F: number = 1.0;          // low-4 of @0x3c7cc0 (float 1.0f)
const CLAMP_ONE_D: number = 1.0;          // @0x3ca260 (double 1.0)
const FINAL_DIV_0P9: number = 0.9;        // @0x3d0e50

/**
 * FCP `HGSonySLog3LinearizationLUTInfo` — 1-D LUT descriptor for Sony S-Log3 → linear.
 *
 * @Helium ctor @0x114160
 * @Helium isEqual @0x114190
 * @Helium colorAtIndex @0x1141e0
 * @Helium duplicate @0x115950
 * @Helium D1 @0x115930 / D0 @0x115940 (trivial — object has no non-POD members;
 *   only the base sub-object exists and it is trivially destructible)
 */
export class HGSonySLog3LinearizationLUTInfo extends HGApplyNDLUTInfo {
  /**
   * HGSonySLog3LinearizationLUTInfo::HGSonySLog3LinearizationLUTInfo(
   *     unsigned long numBins, float rangeScale, float rangeOffset,
   *     HGApplyNDLUTInfo::LUTStorageFormat storage)
   * @Helium 0x114160
   *   (__ZN31HGSonySLog3LinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGSonySLog3LinearizationLUTInfo.C2.s):
   *   0x114166  movl %edx, %ecx              ## storage → ecx (base ctor arg #5)
   *   0x114168  movq %rdi, %rbx              ## save this
   *   0x11416b  movl $0x1, %edx              ## HARDCODE: numDims = 1 (this is a 1-D LUT)
   *   0x114170  callq HGApplyNDLUTInfo::HGApplyNDLUTInfo(this, numBins, 1, rangeScale,
   *                                                     rangeOffset, storage)
   *   0x114175  leaq 0x908c0c(%rip), %rax    ## rax = 0x11417c + 0x908c0c = 0xa1cd88
   *   0x11417c  movq %rax, (%rbx)            ## this->vtable = 0xa1cd88
   *   0x114183  ret
   *
   * Net effect: chains through to HGApplyNDLUTInfo::HGApplyNDLUTInfo(numBins, 1,
   *   rangeScale, rangeOffset, storage) — forcing numDims to 1 — then installs the
   *   SonySLog3-specific vtable.  No subclass-owned state.
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // Base ctor call — numDims hardcoded to 1 per movl $0x1,%edx @0x11416b.
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // Vtable install (0x114175..0x11417c) is a no-op in TS — method dispatch handles it.
  }

  /**
   * HGSonySLog3LinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
   * @Helium 0x114190
   *   (__ZNK31HGSonySLog3LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE)
   *
   * DECODE (raw-port/re/disasm/Helium.HGSonySLog3LinearizationLUTInfo.isEqual.s):
   *   0x114196  testq %rsi, %rsi ; je 0x1141cf   ## other == null -> return false
   *   0x11419e  movq  __ZTIN10HGLUTCache7LUTInfoE(rip), %rax   ## &typeinfo_HGLUTCache_LUTInfo
   *   0x1141a5  leaq  __ZTI31HGSonySLog3LinearizationLUTInfo(rip), %rdx
   *   0x1141b2  xorl  %ecx, %ecx                ## hint = 0
   *   0x1141b4  callq ___dynamic_cast(other, src=LUTInfo_TI, dst=SLog3_TI, hint=0)
   *   0x1141bc  testq %rax, %rax ; je 0x1141cf  ## cast failed -> return false
   *   0x1141ca  jmp   HGApplyNDLUTInfo::isEqual(this, cast_result) ## tail-call base
   *   0x1141cf  xorl %eax, %eax ; ret           ## return false
   *
   * Net effect: return false if other is null or not a HGSonySLog3LinearizationLUTInfo;
   *   otherwise delegate structural equality to HGApplyNDLUTInfo::isEqual.  The base's
   *   isEqual compares numBins, numDims, |rangeScale-other.rangeScale| < 1e-4,
   *   |rangeOffset-other.rangeOffset| < 1e-4, and storage.
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    if (other === null) return false;                 // 0x114196 testq/je
    if (!(other instanceof HGSonySLog3LinearizationLUTInfo)) return false; // dynamic_cast fail
    return super.isEqual(other);                       // 0x1141ca tail-jmp to base isEqual
  }

  /**
   * HGSonySLog3LinearizationLUTInfo::duplicate() const
   * @Helium 0x115950  (__ZNK31HGSonySLog3LinearizationLUTInfo9duplicateEv)
   *
   * DECODE (raw-port/re/disasm/Helium.HGSonySLog3LinearizationLUTInfo.duplicate.s):
   *   0x115959  movl  $0x28, %edi              ## alloc size = 40 bytes = sizeof(SLog3LUT)
   *   0x11595e  callq __Znwm                    ## new
   *   0x115963  movups 0x8(%rbx), %xmm0         ## load base bytes 0x08..0x17
   *   0x115967  movups 0x14(%rbx), %xmm1        ## load base bytes 0x14..0x23 (overlap
   *                                             ##  covers 0x08..0x23 = full base body)
   *   0x11596b  movups %xmm0, 0x8(%rax)         ## store to new object bytes 0x08..0x17
   *   0x11596f  movups %xmm1, 0x14(%rax)        ## store to new object bytes 0x14..0x23
   *   0x115973  leaq  0x90740e(%rip), %rcx      ## rcx = 0x11597a + 0x90740e = 0xa1cd88
   *   0x11597a  movq  %rcx, (%rax)              ## new->vtable = 0xa1cd88 (SLog3 vtable)
   *   0x11597d  ret                             ## return the new object
   *
   * Net effect: shallow byte-copy the HGApplyNDLUTInfo base sub-object (numBins,
   *   numDims, rangeScale, rangeOffset, storage) into a freshly allocated
   *   HGSonySLog3LinearizationLUTInfo, install the vtable, and return.  There are no
   *   subclass-owned fields to copy.
   */
  duplicate(): HGSonySLog3LinearizationLUTInfo {
    // Read the base fields off `this` and pass them to the ctor — TS equivalent of the
    // two-movups byte-copy at 0x115963..0x11596f.
    return new HGSonySLog3LinearizationLUTInfo(
      this.getNumBins(),
      this.getRangeScale(),
      this.getRangeOffset(),
      this.getLUTStorageFormat(),
    );
  }

  /**
   * HGSonySLog3LinearizationLUTInfo::colorAtIndex(float x, float y, float z,
   *                                               float* rOut, float* gOut, float* bOut,
   *                                               float* aOut) const
   * @Helium 0x1141e0
   *   (__ZNK31HGSonySLog3LinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_)
   *
   * The base HGApplyNDLUTInfo hosts this as a 1-D LUT (numDims=1) so only the first
   * scalar input `x` is consumed; y/z are ignored.  Applies the Sony S-Log3 electro-
   * optical transfer function (EOTF) — the standard piecewise definition from
   * Sony's "S-Log3 Technical Notes" document.
   *
   * DECODE (raw-port/re/disasm/Helium.HGSonySLog3LinearizationLUTInfo.colorAtIndex.s):
   *   0x1141fb  movaps %xmm0, %xmm2            ## xmm2 = x (the sole input)
   *   0x1141fe..0x11421d guard-variable checks for the three static locals ::tl,
   *                                            ::tlmd, ::aa (call .cold.N helpers as
   *                                            needed to initialise them).
   *
   *   -- clamp-branch on x --
   *   0x11421f  xorps  xmm0, xmm0              ## xmm0 = 0 (base for the linear branch)
   *   0x114222  xorps  xmm1, xmm1              ## xmm1 = 0 (comparison RHS)
   *   0x114225  ucomiss xmm2, xmm1             ## flags = compare(x, 0)
   *   0x114228  jbe    0x1142b3                ## x <= 0  -> goto UPPER-CLAMP path
   *                                            ##            (which then compares x<=1)
   *   0x11422e  mulsd  [0x3d4b30], xmm0        ## xmm0 = 0 * 1023 = 0.  (This branch is
   *                                            ## reached ONLY through the fall-through
   *                                            ## of 0x1142ad's `ja` — which comes back
   *                                            ## from cold.3.  When 0x1142aa's ucomiss
   *                                            ## finds x>0, `ja 0x11422e` fires but xmm0
   *                                            ## has just been xorps-zeroed at 0x1142a4.
   *                                            ## The result is that this specific entry
   *                                            ## point is only taken via that back-edge.
   *                                            ## The MAIN forward path enters the exp
   *                                            ## branch via 0x1142b3.)
   *   0x114236  ucomisd [::tl], xmm0           ## compare xmm0 vs tl
   *   0x11423e  jae    0x1142da                ## xmm0 >= tl -> exp branch
   *   0x114244  addsd  [0x3d4b50=-95.0], xmm0  ## xmm0 = v - 95
   *   0x11424c  divsd  [::tlmd], xmm0          ## xmm0 = (v - 95) / (tl - 95)
   *   0x114254  mulsd  [0x3d4b58=0.01125], xmm0## xmm0 *= 0.01125
   *   0x11425c  jmp    0x1142ff                ## merge -> /0.9
   *
   *   -- UPPER-CLAMP path (from 0x114228's jbe when x <= 0, and from cold.N re-entry) --
   *   0x1142a4  xorps  xmm0, xmm0              ## reset xmm0 = 0
   *   0x1142a7  xorps  xmm1, xmm1              ## xmm1 = 0
   *   0x1142aa  ucomiss xmm2, xmm1             ## re-compare x, 0
   *   0x1142ad  ja     0x11422e                ## x > 0 -> back-edge to (v=0) branch
   *                                            ## (bounces here through cold.N init only;
   *                                            ##  the forward "x > 0" case never lands
   *                                            ##  here on a fresh call — see MAIN path.)
   *   0x1142b3  ucomiss [0x3c7cc0=1.0f], xmm2  ## compare x, 1.0f
   *   0x1142ba  jbe    0x11432e                ## x <= 1.0f -> MAIN path (widen to double)
   *
   *   -- MAIN path for 0 < x <= 1: widen x to double, compute v = x*1023, branch --
   *   0x11432e  xorps  xmm0, xmm0
   *   0x114331  cvtss2ss xmm2 -> xmm0 (as double)## xmm0 = double(x)
   *   0x114335  mulsd  [0x3d4b30=1023.0], xmm0 ## v = x * 1023
   *   0x11433d  ucomisd [::tl], xmm0
   *   0x114345  jb     0x114244                ## v < tl -> linear branch
   *   0x11434b  jmp    0x1142da                ## v >= tl -> exp branch
   *
   *   -- x > 1.0f: clamp v to 1023 and always take the exp branch --
   *   0x1142bc  movsd  [0x3ca260=1.0], xmm0
   *   0x1142c4  mulsd  [0x3d4b30=1023.0], xmm0 ## v = 1023
   *   0x1142cc  ucomisd [::tl], xmm0
   *   0x1142d4  jb     0x114244                ## dead in practice: 1023 > 171.21
   *
   *   -- exp branch (v >= tl) --
   *   0x1142da  addsd  [0x3d4b38=-420.0], xmm0 ## xmm0 = v - 420
   *   0x1142e2  mulsd  [::aa], xmm0            ## xmm0 = (v - 420) * ln(10)/261.5
   *   0x1142ea  callq  _exp                    ## xmm0 = exp(...)
   *   0x1142ef  mulsd  [0x3d4b40=0.19], xmm0   ## xmm0 *= 0.19
   *   0x1142f7  addsd  [0x3d4b48=-0.01], xmm0  ## xmm0 -= 0.01
   *
   *   -- merge --
   *   0x1142ff  divsd  [0x3d0e50=0.9], xmm0    ## xmm0 /= 0.9  (final scaling)
   *   0x114307  cvtsd2ss xmm0 -> xmm0          ## narrow to float
   *   0x11430b  movss  xmm0, (r12)             ## *rOut = L
   *   0x114311  movss  xmm0, (r15)             ## *gOut = L
   *   0x114316  movss  xmm0, (r14)             ## *bOut = L
   *   0x11431b  movl   $0x3f800000, (rbx)      ## *aOut = 1.0f
   *   0x11432d  ret
   *
   * NET FORMULA:
   *   v = clamp(x, 0, 1) * 1023
   *   if v < tl:  L = ((v - 95) / (tl - 95)) * 0.01125 / 0.9
   *   else:       L = (exp((v - 420) * ln(10)/261.5) * 0.19 - 0.01) / 0.9
   *   R = G = B = L,  A = 1.0f
   *
   * @param x            first-dimension index (0..1 normalised)
   * @param _y           unused (1-D LUT — numDims hardcoded to 1)
   * @param _z           unused (1-D LUT — numDims hardcoded to 1)
   * @param outR/G/B/A   each is a single-element boxed ref; mutated in place with L,L,L,1
   */
  colorAtIndex(
    x: number, _y: number, _z: number,
    outR: [number], outG: [number], outB: [number], outA: [number],
  ): void {
    // The disasm's clamp ladder collapses to: v = clamp(x, 0, 1) * 1023 (all in double).
    // - x <= 0 : goes to UPPER-CLAMP, then compares x<=1.0f (true), enters MAIN path with
    //            v = double(x)*1023 = 0*1023 = 0 -> falls into the linear branch.
    // - 0 < x <= 1.0f : MAIN path directly (via 0x11432e), v = x*1023, branch by v vs tl.
    // - x >  1.0f : UPPER-CLAMP -> 0x1142bc loads 1.0 -> v = 1023, always exp branch.
    let v: number;
    if (x <= 0) {
      // Path 0x114228 -> 0x1142b3 -> 0x11432e; cvtss2sd(0) = 0.
      v = 0 * CV_SCALE_1023;
    } else if (x <= CLAMP_ONE_F) {
      // Path 0x11432e: v = double(x) * 1023.  Math.fround snaps x to the *ss input width.
      v = Math.fround(x) * CV_SCALE_1023;
    } else {
      // Path 0x1142bc: v = 1.0 * 1023 = 1023.
      v = CLAMP_ONE_D * CV_SCALE_1023;
    }

    let L: number;
    if (v < SLOG3_TL) {
      // Linear branch @0x114244..0x11425c.
      L = ((v + -95.0) / SLOG3_TLMD) * LIN_SCALE_0P01125;
    } else {
      // Exp branch @0x1142da..0x1142f7.
      L = Math.exp((v + LOG_SHIFT_M420) * SLOG3_AA) * LOG_GAIN_0P19 + LOG_OFFSET_M0P01;
    }

    // Merge @0x1142ff: /0.9 and narrow to float via cvtsd2ss @0x114307.
    const Lf = Math.fround(L / FINAL_DIV_0P9);
    outR[0] = Lf;              // *rOut  @0x11430b
    outG[0] = Lf;              // *gOut  @0x114311
    outB[0] = Lf;              // *bOut  @0x114316
    outA[0] = Math.fround(1.0); // *aOut = 0x3f800000 = 1.0f  @0x11431b
  }
}
