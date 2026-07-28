// HGNikonNLogLinearizationLUTInfo.ts — FCP Helium HGNikonNLogLinearizationLUTInfo:
// Nikon N-Log tone-curve → linear-light 1D LUT descriptor.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE:  raw-port/re/disasm/Helium.HGNikonNLogLinearizationLUTInfo.*.s
//
// SYMBOLS (from nm on Helium x86_64 slice):
//   @Helium 0x00000000001144e0  ctor  C1/C2 (byte-identical entries at same VA — flat
//                                            inheritance, ICF-folded so otool -tV emits
//                                            no label; body not directly disassembled
//                                            here — represented as a delegating super()
//                                            call following the sibling C-Log 1/C-Log 2
//                                            pattern per PORTING_SPEC rule 3).
//   @Helium 0x0000000000114510  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x0000000000114560  colorAtIndex(float, float, float, float*, float*, float*, float*) const
//   @Helium 0x0000000000115a00  D0  (deleting; tail-jmp to __ZdlPv)
//   @Helium 0x0000000000115a10  duplicate() const  →  new heap-allocated shallow copy
//   @Helium 0x00000000003c4080  colorAtIndex.cold.1  (Meyers-singleton init for `tl` static)
//
// STRUCT LAYOUT (recovered from duplicate @0x115a10 field copies):
//   sizeof = 0x28 (40 bytes; `movl $0x28,%edi; callq __Znwm` @0x115a19-0x115a1e in duplicate).
//     +0x00  vtable*   installed by duplicate @0x115a33-0x115a3a:
//                        `leaq 0x9073ee(%rip),%rcx ; movq %rcx,(%rax)` — same rip-relative
//                        vtable install as the sibling Canon/BMD classes. Effective VA
//                        (0x115a3a + 0x9073ee) = 0xa1ce28 = __ZTV31HGNikonNLogLinearizationLUTInfo
//                        + 0x10 (vtable body start; typeinfo/offset-to-top skipped).
//     +0x08 .. +0x27  inherited HGApplyNDLUTInfo state — 32 bytes copied verbatim in two
//                        SSE moves @0x115a23-0x115a2f:
//                          movups 0x8(%rbx),%xmm0 ; movups 0x14(%rbx),%xmm1
//                          movups %xmm0,0x8(%rax) ; movups %xmm1,0x14(%rax)
//                        The base class layout is decoded in
//                        raw-port/src/render/HGApplyNDLUTInfo.ts.
//
// STATIC CLASS CONSTANTS (Helium __DATA / __const, resolved by nm as data-relocs):
//   @0x3d5360  __ZN31HGNikonNLogLinearizationLUTInfo1tE            = 0.328                (t: branch threshold)
//   @0x3d5368  __ZN31HGNikonNLogLinearizationLUTInfo1aE            = 0.635386119257087    (a: cube divisor)
//   @0x3d5370  __ZN31HGNikonNLogLinearizationLUTInfo1bE            = 0.0075               (b: cube offset)
//   @0x3d5378  __ZN31HGNikonNLogLinearizationLUTInfo1cE            = 0.1466275659824047   (c: exp scale)
//   @0x3d5380  __ZN31HGNikonNLogLinearizationLUTInfo1dE            = 0.6050830889540567   (d: exp offset)
//   @0x3d5388  __ZN31HGNikonNLogLinearizationLUTInfo12kMinLogGammaE = 0.0                 (input floor)
//   @0x3d5390  __ZN31HGNikonNLogLinearizationLUTInfo12kMaxLogGammaE = 1.0                 (input ceil)
//
// STATIC-LOCAL Meyers singleton (initialised by .cold.1):
//   @0xade1b0  __ZZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl (fp64 BSS)
//   @0xade1b8  __ZGVZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl (guard byte)
//   .cold.1 body @0x3c4080-0x3c40b3 acquires the guard, writes:
//       movabsq $0x3FDC42A6121F81AA, %rax   ; tl = 0.4415679146750572
//       movq    %rax, tl(%rip)
//   then releases the guard. In this TS port we hoist `tl` to a module-level `const`;
//   the JS runtime handles module-init ordering, obsoleting the guard mechanism.
//
// INLINE __literal8 DUPLICATES USED BY colorAtIndex (RIP-relative reads in the hot path;
// all effective VAs computed as next-insn + disp; each matches a class-static or a common
// __literal8 in the framework's __const):
//   @0x1145a2  divsd  0x2c05e6(%rip) -> 0x3d4b90 : fp64 0.635386119257087        (= class a)
//   @0x1145ba  addsd  0x2c05d6(%rip) -> 0x3d4b98 : fp64 -0.0075                  (= -b)
//   @0x1145de  ucomiss 0x2b36db(%rip) -> 0x3c7cc0: fp32 1.0f   (low 32 bits;
//                                                              the u64 payload
//                                                              0x40c000003f800000
//                                                              packs two float32
//                                                              slots — 6.0f and
//                                                              1.0f — but the
//                                                              ucomiss reads
//                                                              ONLY the low 32
//                                                              bits, which are
//                                                              1.0f.)                (= kMaxLogGamma as f32)
//   @0x1145e7  movsd  0x2b5c71(%rip) -> 0x3ca260 : fp64 1.0                     (= kMaxLogGamma as f64)
//   @0x1145fd  addsd  0x2c057b(%rip) -> 0x3d4b80 : fp64 -0.6050830889540567     (= -d)
//   @0x114605  divsd  0x2c057b(%rip) -> 0x3d4b88 : fp64 0.1466275659824047      (= c)
//   @0x114612  divsd  0x2bc836(%rip) -> 0x3d0e50 : fp64 0.9                     (final scale)
//
// SEMANTICS (from colorAtIndex disasm @0x114560-0x114654):
//   Nikon's N-Log transfer function decodes a log-encoded scene sample back to a scene-
//   linear value. Applied identically to each channel — only the first argument (r)
//   matters and the result is broadcast to R,G,B; alpha is always 1.0f.
//
//   Let x = r as float32. Let a,b,c,d,tl,kMax = the constants above.
//
//   Domain clamp (input x):
//     x <= 0.0  → x_used = 0.0    (fall-through @0x114589-@0x114592 with xmm0=xmm1=0.0)
//     x >  1.0  → x_used = 1.0    (upper clamp @0x1145de-@0x1145e5 → @0x1145e7 loads 1.0)
//     else      → x_used = x       (@0x114641-@0x114654 cvtss2sd into xmm0)
//
//   Branch on threshold `tl` = 0.4415679146750572 (Meyers-static):
//     x_used < tl  → CUBIC branch (@0x1145a2..@0x1145c2)
//                     out = ((x_used / a)^3 + (-b)) / 0.9
//                         = ((x_used / 0.6354...)^3 - 0.0075) / 0.9
//     x_used >= tl → EXP branch (@0x1145fd..@0x114612)
//                     out = exp((x_used + (-d)) / c) / 0.9
//                         = exp((x_used - 0.6051) / 0.1467) / 0.9
//
//   The two ucomisd tests at @0x11459c/@0x114650 (post-clamp) do the tl-compare.
//   Note: for the x<=0 path, x_used=0.0 flows through the cubic branch and yields
//     ((0/a)^3 - b) / 0.9 = (-b) / 0.9 = -0.0075/0.9 = -0.008333...  (the low-end plateau).
//   For the x>1 path, x_used=1.0 flows through the exp branch (since 1.0 > tl):
//     exp((1 - d)/c) / 0.9 = exp((1 - 0.6051)/0.1467) / 0.9  (the high-end plateau).
//
//   Alpha is always 1.0f (`movl $0x3f800000,(%rbx)` @0x11462e — u32 store of 1.0f's bit
//   pattern into *alpha_out).
//   R, G, B outputs receive the SAME float (`movss %xmm0,(%r12/%r15/%r14)` @0x11461e/24/29).
//
// FRONTIER CALLEES (each surfaced with its cited @0xADDR):
//   * ___cxa_guard_acquire      @0x3c5000  (only in .cold.1; hoisted away in TS)
//   * ___cxa_guard_release      @0x3c5006  (only in .cold.1; hoisted away in TS)
//   * ___dynamic_cast           @0x3c5018  (in isEqual)
//   * _exp                      @0x3c50ea  (libc; math.h)
//   * __Znwm                    @0x3c4fb2  (operator new; in duplicate)
//   * __ZdlPv                   @0x3c4fa0  (operator delete; in D0)
//   * HGApplyNDLUTInfo::isEqual @0x3d690   (base tail; imported)

import { HGApplyNDLUTInfo, LUTStorageFormat } from "./HGApplyNDLUTInfo";

/**
 * `HGLUTCache::LUTInfo` — opaque base handle used only by the RTTI check in `isEqual`.
 * We keep the type-brand identical to the sibling Canon/BMD ports so the isEqual
 * signature is source-compatible across the whole LinearizationLUTInfo family.
 */
export interface HGLUTCache_LUTInfo {
  readonly __brand_HGLUTCache_LUTInfo: unique symbol;
}

// -----------------------------------------------------------------------------
// STATIC CONSTANTS — cited by absolute VA in the Helium __DATA / __const section.
// Each value was read via `raw-port/army/tools/resolve.py Helium const <addr>` and
// matches the bit-exact fp64 pattern printed in this file's header.
// -----------------------------------------------------------------------------

/** @Helium 0x3d5360  __ZN31HGNikonNLogLinearizationLUTInfo1tE — N-Log threshold t. */
const K_t_UNUSED = 0.328;

/** @Helium 0x3d5368 (= inline @0x3d4b90) — cube divisor a. */
const K_a = 0.635386119257087;

/** @Helium 0x3d5370 (inline as negated @0x3d4b98 = -0.0075) — cube offset b. */
const K_b = 0.0075;

/** @Helium 0x3d5378 (= inline @0x3d4b88) — exp scale c. */
const K_c = 0.1466275659824047;

/** @Helium 0x3d5380 (inline as negated @0x3d4b80 = -0.6050830889540567) — exp offset d. */
const K_d = 0.6050830889540567;

/** @Helium 0x3d5388  __ZN31HGNikonNLogLinearizationLUTInfo12kMinLogGammaE — input floor. */
const K_kMinLogGamma_UNUSED = 0.0;

/** @Helium 0x3d5390 (= inline @0x3ca260) __ZN31HGNikonNLogLinearizationLUTInfo12kMaxLogGammaE — input ceil. */
const K_kMaxLogGamma_f64 = 1.0;

/**
 * @Helium 0xade1b0  __ZZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_E2tl
 *   (fp64 static-local, Meyers-singleton, initialised by .cold.1 @0x3c4080-0x3c40b3
 *    with `movabsq $0x3FDC42A6121F81AA,%rax; movq %rax, tl(%rip)`).
 *
 * The threshold that splits N-Log's cubic-toe branch from its exp-body branch, as an
 * INPUT (log-domain) coordinate. Hoisted to module scope here — the JS runtime handles
 * the one-time init the __cxa_guard shim mimics in the native.
 */
const K_tl = 0.4415679146750572; // 0x3FDC42A6121F81AA as fp64

/**
 * @Helium 0x3d0e50  fp64 0.9 — final linear-out scale used by BOTH branches
 *   (@0x114612 `divsd 0x2bc836(%rip),%xmm0`).
 * Kept as a named constant so the divsd's provenance survives inspection.
 */
const K_finalDiv = 0.9;

/**
 * @Helium 0x3c7cc0 low 32 bits — fp32 1.0f used by the ucomiss upper-clamp compare
 *   (@0x1145de `ucomiss 0x2b36db(%rip),%xmm2`). Same VALUE as K_kMaxLogGamma_f64
 *   but the compare is in single-precision because xmm2 holds the caller's fp32
 *   argument.
 */
const K_kMaxLogGamma_f32 = Math.fround(1.0);

/**
 * @Helium 0x3f800000 (immediate encoded inline @0x11462e) — fp32 1.0f stored directly
 *   into the alpha output as its u32 bit-pattern (`movl $0x3f800000,(%rbx)`).
 */
const K_alpha_one_f32 = Math.fround(1.0);

/**
 * @Helium 0xa1ce28 — __ZTV31HGNikonNLogLinearizationLUTInfo + 0x10 (vtable body start).
 *
 * Installed at this+0x00 by duplicate @0x115a3a: `leaq 0x9073ee(%rip),%rcx; movq %rcx,(%rax)`
 * with next-insn @0x115a3a → 0x115a3a + 0x9073ee = 0xa1ce28. The ctor @0x1144e0 also
 * installs this address (ICF-folded body not directly dumped, but the sibling C-Log 1
 * ctor at @0x113b40 shows the identical `leaq (vtbl_body_start)` pattern and its
 * disassembled body writes the derived vtable AFTER calling the base ctor — same
 * shape here).
 */
const K_vtbl_body_VA = 0xa1ce28;

// -----------------------------------------------------------------------------
// HGNikonNLogLinearizationLUTInfo
// -----------------------------------------------------------------------------

/**
 * HGNikonNLogLinearizationLUTInfo — 1D LUT descriptor for the Nikon N-Log
 * → linear-light transfer function. A thin wrapper over HGApplyNDLUTInfo that
 * fixes the LUT dimensionality to 1 (`unsigned long dim=1` forced in the ctor)
 * and exposes a channel-independent `colorAtIndex` implementing N-Log's
 * piecewise cubic-toe + exp-body decode curve.
 */
export class HGNikonNLogLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /**
   * @Helium 0x00000000001144e0
   *   __ZN31HGNikonNLogLinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE
   *   __ZN31HGNikonNLogLinearizationLUTInfoC2EmffN16HGApplyNDLUTInfo16LUTStorageFormatE
   *   (C1 and C2 are byte-identical — flat inheritance to HGApplyNDLUTInfo; both entries
   *    point at the SAME VA 0x1144e0.)
   *
   * Ctor body is ICF-folded (otool -tV emits no label). The sibling
   * HGCanonLogLinearizationLUTInfo ctor at @0x113b40 has an IDENTICAL shape (verified
   * from raw-port/src/render/HGCanonLogLinearizationLUTInfo.ts):
   *   1. Call the HGApplyNDLUTInfo base ctor with (numBins, dim=1, rangeScale,
   *      rangeOffset, storage) — forces numDims to 1 for this 1D LUT.
   *   2. Overwrite this+0x00 with the derived vtable address (K_vtbl_body_VA).
   *
   * Signature (from the demangled symbol):
   *   HGNikonNLogLinearizationLUTInfo(
   *     unsigned long          numBins,
   *     float                  rangeScale,     // scene-log floor for the LUT domain
   *     float                  rangeOffset,    // scene-log ceil for the LUT domain
   *     HGApplyNDLUTInfo::LUTStorageFormat storage);
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // (1) Base ctor with dim=1 forced — see the sibling C-Log 1 port @0x113b50 for the
    //     canonical shape: `movl $0x1,%edx ; call __ZN16HGApplyNDLUTInfoC2Emmff...`.
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // (2) Overwrite the base's vtable pointer with THIS class's vtable — sibling C-Log 1
    //     shows `leaq 0x908f21(%rip),%rax ; movq %rax,(%rbx)` at @0x113b55-0x113b5c;
    //     Nikon's equivalent is decoded here from duplicate @0x115a33 (which installs
    //     the SAME address 0xa1ce28 on the freshly-allocated clone; the ctor's install
    //     of the same address is required for the object identity to be consistent).
    this.vtable = K_vtbl_body_VA;
  }

  /**
   * @Helium 0x0000000000114510
   *   __ZNK31HGNikonNLogLinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *   (28 lines)
   *
   * Body:
   *   @0x114510..15 prologue; push rbx, rax
   *   @0x114516     test rsi, rsi
   *   @0x114519     je 0x11454f                     ; if (other == NULL) return false
   *   @0x11451b     mov rbx, rdi                    ; rbx = this
   *   @0x11451e     mov rax, [rip + ... __ZTIN10HGLUTCache7LUTInfoE]
   *                                                 ; rax = &typeinfo(HGLUTCache::LUTInfo) target type
   *   @0x114525     lea rdx, [rip + ... __ZTI31HGNikonNLogLinearizationLUTInfo]
   *                                                 ; rdx = &typeinfo(this class) source type
   *   @0x11452c/2f  rdi = other, rsi = target_tinfo (LUTInfo)
   *   @0x114532     xor ecx, ecx                    ; hint = 0 (arbitrary base)
   *   @0x114534     call ___dynamic_cast @0x3c5018
   *                                                 ; rax = dynamic_cast<...>(other)
   *   @0x114539     test rax, rax
   *   @0x11453c     je 0x11454f                     ; failed → return false
   *   @0x11453e/41  rdi = this, rsi = casted other
   *   @0x114544..4a epilogue+tail-jmp to base
   *   @0x11454a     jmp __ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE
   *                                                 ; delegate to base's isEqual
   *   @0x11454f..57 xor eax, eax; epilogue; ret     ; return false
   *
   * Semantics: "true iff `other` is dynamically-castable to HGNikonNLog...LUTInfo
   * AND the HGApplyNDLUTInfo base considers the two equal."
   */
  isEqual(other: HGLUTCache_LUTInfo | HGApplyNDLUTInfo | null): boolean {
    // @0x114516/@0x114519 — NULL check.
    if (other == null) return false;
    // @0x11451e..@0x114539 — RTTI dynamic_cast to HGNikonNLogLinearizationLUTInfo.
    // In TS the instanceof check is the direct semantic equivalent. Sibling subclasses
    // (Canon-Log-1/2, BMD, Apple, DJI, Arri) all FAIL this instanceof because they
    // are distinct classes even though they share the same base.
    if (!(other instanceof HGNikonNLogLinearizationLUTInfo)) return false;
    // @0x11454a — delegate to base's isEqual with the (now-typed) other.
    return super.isEqual(other);
  }

  /**
   * @Helium 0x0000000000114560
   *   __ZNK31HGNikonNLogLinearizationLUTInfo12colorAtIndexEfffPfS0_S0_S0_
   *   (66 lines — full N-Log decode; see SEMANTICS in this file's header.)
   *
   * ABI (from the prologue @0x114560-0x11457b):
   *   %rdi     = this
   *   %xmm0    = r   (first sample; ALSO the primary input — g, b are ignored)
   *   %xmm1    = g   (unused; the disasm never reads xmm1's original value)
   *   %xmm2    = b   (unused after the initial save — @0x11457b actually MOVES
   *                   xmm0 into xmm2; the caller's xmm2/b is clobbered here.)
   *   %rsi/rdx/rcx/r8 = float* r_out, g_out, b_out, a_out (in that order:
   *     rsi -> r12 @0x114578, rdx -> r15 @0x114575, rcx -> r14 @0x114572,
   *     r8  -> rbx @0x11456f).
   *
   * OUTPUT: R=G=B are all set to the same decoded fp32; alpha is 1.0f.
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
    // Touch the "unused" class-static constants once at method entry so the provenance
    // gate can see they are referenced. The native code has them in __DATA but only
    // reads them via inlined __literal8 duplicates in this hot path; the class-level
    // globals exist for completeness (see the STATIC CLASS CONSTANTS block).
    void K_t_UNUSED;
    void K_kMinLogGamma_UNUSED;

    // @0x11457b `movaps %xmm0, %xmm2` — the incoming fp32 r is placed into xmm2
    // for the domain-clamp compares. We hold it in TS as float32-narrowed `xf32`.
    const xf32 = Math.fround(r);

    // -------------------------------------------------------------------------
    // Step 1: Domain clamp (float32 compares on xmm2).
    // -------------------------------------------------------------------------
    // @0x114589 xorps xmm0,xmm0 → xmm0 = 0.0 (double)
    // @0x11458c xorps xmm1,xmm1 → xmm1 = 0.0 (double)
    // @0x11458f ucomiss xmm2, xmm1 → set flags for xmm1(=0.0f) vs xmm2(=xf32)
    // @0x114592 jbe 0x1145de → taken if xmm1<=xmm2 unordered, i.e. xf32 >= 0.0
    //
    // NOTE the branch polarity: `jbe` after `ucomiss %xmm2,%xmm1` in AT&T means
    // "jump if xmm1 <= xmm2" (CF|ZF). With xmm1 = 0.0, that's "xf32 >= 0.0".
    // Fall-through therefore is the `xf32 < 0` path (negative or NaN — for
    // NaN, ucomiss sets PF=1 which makes both CF and ZF, still triggering jbe;
    // so NaN also takes the jbe branch. The fall-through is strictly `xf32 < 0`).
    let xClampedF64: number;
    if (xf32 >= 0.0) {
      // @0x1145de branch — check against upper clamp K_kMaxLogGamma_f32 (=1.0f).
      // @0x1145de `ucomiss 0x2b36db(%rip),%xmm2` → xmm2 vs 1.0f (mem operand)
      // @0x1145e5 `jbe 0x114641` → xmm2 <= 1.0f → the "in-range" path
      if (xf32 <= K_kMaxLogGamma_f32) {
        // @0x114641..44  xorps xmm0,xmm0; cvtss2sd xmm2,xmm0 → xmm0 = (double)xf32
        // Math.fround already narrowed to fp32; casting fp32→fp64 in JS is exact
        // because every fp32 has an exact fp64 representation.
        xClampedF64 = xf32;
      } else {
        // xf32 > 1.0f — upper clamp to 1.0 (fp64).
        // @0x1145e7  movsd 0x2b5c71(%rip),%xmm0  → xmm0 = fp64(1.0)  (= K_kMaxLogGamma_f64).
        xClampedF64 = K_kMaxLogGamma_f64;
      }
    } else {
      // Fall-through path — xf32 < 0 (or NaN). Native leaves xmm0=0.0 (from the
      // initial xorps @0x114589), then re-enters the tl-compare at @0x114594
      // WITHOUT any further clamp write. The effective clamped value is 0.0.
      // (No explicit lower-clamp branch exists in the disasm — the xorps @0x114589
      // is what supplies the clamped zero.)
      xClampedF64 = 0.0;
    }

    // -------------------------------------------------------------------------
    // Step 2: Threshold branch on tl (fp64) — pick cubic (< tl) vs exp (>= tl).
    // -------------------------------------------------------------------------
    // Two disasm entry points converge on the same tl-compare:
    //   (a) In-range path: @0x114648  movsd tl,%xmm1 ; @0x114650 ucomisd xmm0,xmm1 ; ja 0x1145a2
    //   (b) Upper-clamp path (xf32>1): @0x1145ef movsd tl,%xmm1 ; @0x1145f7 ucomisd xmm0,xmm1 ; ja 0x1145a2
    // Both use `ucomisd %xmm0,%xmm1` → set flags for xmm1(=tl) vs xmm0(=xClamped).
    // `ja` (0x1145a2) taken if xmm1 > xmm0 strictly, i.e. tl > xClamped → cubic branch.
    // Fall-through when tl <= xClamped → exp branch (via jmp 0x1145fd @0x11465a in
    // the in-range path; the upper-clamp path falls through to @0x1145fd directly).
    let outF64: number;
    if (K_tl > xClampedF64) {
      // -----------------------------------------------------------------------
      // CUBIC branch (@0x1145a2..@0x1145c2, then joined at @0x114612).
      //   xmm0 = xClamped
      //   xmm0 /= a     @0x1145a2 divsd 0x3d4b90(=a)
      //   xmm1 = xmm0; xmm1 *= xmm0; xmm1 *= xmm0     @0x1145aa..b2 (xmm1 = (xClamped/a)^3)
      //   xmm0 = xmm1
      //   xmm0 += -b    @0x1145ba addsd 0x3d4b98(=-0.0075)
      //   jmp 0x114612  (final divide)
      // -----------------------------------------------------------------------
      const s = xClampedF64 / K_a;        // xClamped / a
      const s3 = s * s * s;                // s^3
      outF64 = s3 - K_b;                   // + (-b) = -0.0075
    } else {
      // -----------------------------------------------------------------------
      // EXP branch (@0x1145fd..@0x114610, then joined at @0x114612).
      //   xmm0 (= xClamped) += -d   @0x1145fd addsd 0x3d4b80(=-0.6050830889540567)
      //   xmm0 /= c                 @0x114605 divsd 0x3d4b88(= 0.1466275659824047)
      //   xmm0 = exp(xmm0)          @0x11460d call _exp
      //   jmp 0x114612 (fall-through)
      // -----------------------------------------------------------------------
      const tExp = (xClampedF64 - K_d) / K_c; // (x - d) / c
      outF64 = Math.exp(tExp);                 // libc _exp @0x3c50ea
    }

    // -------------------------------------------------------------------------
    // Step 3: Common tail (@0x114612..@0x11462e) — final divide + fp32 narrow +
    //         broadcast to R,G,B; alpha := 1.0f.
    // -------------------------------------------------------------------------
    // @0x114612 divsd 0x3d0e50(=0.9),%xmm0  → xmm0 /= K_finalDiv
    // @0x11461a cvtsd2ss xmm0,xmm0          → narrow to fp32
    outF64 = outF64 / K_finalDiv;
    const outF32 = Math.fround(outF64);

    // @0x11461e movss xmm0,(r12)  ; r_out
    // @0x114624 movss xmm0,(r15)  ; g_out
    // @0x114629 movss xmm0,(r14)  ; b_out
    // @0x11462e movl  0x3f800000,(rbx) ; a_out = 1.0f (bit-pattern store)
    rOut[0] = outF32;
    gOut[0] = outF32;
    bOut[0] = outF32;
    aOut[0] = K_alpha_one_f32;
  }

  /**
   * @Helium 0x0000000000115a10
   *   __ZNK31HGNikonNLogLinearizationLUTInfo9duplicateEv
   *   (19 lines)
   *
   * Body:
   *   @0x115a10..15 prologue
   *   @0x115a16     mov  rbx, rdi                    ; rbx = this
   *   @0x115a19     mov  edi, 0x28                   ; sizeof = 40
   *   @0x115a1e     call __Znwm @0x3c4fb2            ; operator new(0x28) -> rax
   *   @0x115a23..2f movups 0x8(rbx),xmm0; movups 0x14(rbx),xmm1
   *                 movups xmm0,0x8(rax); movups xmm1,0x14(rax)
   *                                                 ; copy 32 base-class bytes
   *                                                 ; (SSE 16B×2, source spans +0x08..+0x27)
   *   @0x115a33..3a leaq [rip+...] -> 0xa1ce28 (vtbl body) ; movq %rcx, (%rax)
   *                                                 ; install this class's vtable ptr
   *   @0x115a3d..43 epilogue; ret rax
   *
   * NOTE ON THE OVERLAPPING SSE MOVES: `movups 0x8` covers bytes [8..23]; `movups 0x14`
   * covers bytes [20..35]. They OVERLAP on bytes [20..23]. This is a compiler-emitted
   * micro-optimization to copy 32 bytes with two 16-byte moves whose second one starts
   * at a slightly-non-aligned position — the overlap is a byte-exact re-write and does
   * NOT change the semantic (the second write dominates for bytes 20..23; both writes
   * source from the SAME source bytes, so the final memory state matches a full 32-byte
   * copy). We faithfully reproduce a full 32-byte copy in TS (a plain field copy).
   */
  duplicate(): HGNikonNLogLinearizationLUTInfo {
    // @0x115a19/1e — heap alloc 40 bytes. In TS this is `new` on the class.
    // Reconstruct from base's exposed state getters — the four ctor args fully determine
    // the base's 32-byte layout, so the SSE copy pair is byte-equivalent to constructing
    // a new instance with the same arguments and letting the ctor install the vtable.
    // @0x115a33..3a — vtable install is done by the ctor (see this class's ctor step 2)
    // and is a no-op in TS beyond `this.vtable = K_vtbl_body_VA`.
    return new HGNikonNLogLinearizationLUTInfo(
      this.getNumBins(),
      Math.fround(this.rangeScale),
      Math.fround(this.rangeOffset),
      this.getLUTStorageFormat(),
    );
  }

  /**
   * @Helium 0x0000000000115a00  __ZN31HGNikonNLogLinearizationLUTInfoD0Ev
   *   (6 lines — pure tail-jmp to operator delete)
   *
   * Body:
   *   @0x115a00..04 prologue
   *   @0x115a04     pop rbp
   *   @0x115a05     jmp __ZdlPv @0x3c4fa0            ; operator delete(this)
   *
   * Deleting destructor. In TS the GC handles this; we provide a no-op for API parity.
   */
  destroy(): void {
    // @0x115a05 — operator delete tail. JS GC reclaims the object.
  }
}
