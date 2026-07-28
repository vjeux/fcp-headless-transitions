// raw-port/src/render/HGArriLogC4LinearizationLUTInfo.ts
//
// FCP `HGArriLogC4LinearizationLUTInfo` — Helium subclass of HGApplyNDLUTInfo
// implementing the ARRI ALEXA LogC4 → linear-light 1-D LUT descriptor.
//
// Unlike the older `HGArriLogCLinearizationLUTInfo` (ARRI LogC v3), LogC4
// is a SINGLE fixed transfer function (no per-EI parameter table). The class
// is much simpler: the ctor just forwards to the base with `numDims=1` and
// sets the derived-class vtable; `colorAtIndex` implements the closed-form
// LogC4 inverse (log→linear) formula with a linear-region branch that (as
// emitted) is only reached for NaN input — the compiler routed all normal
// x∈[0,1] through the exp2 branch.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGArriLogC4LinearizationLUTInfo.*.s
//         (captured mangled symbols __ZN31HGArriLogC4LinearizationLUTInfo*).
//
// SYMBOLS (all VAs are x86_64 slice virtual addresses; fat-slice file offset = VA + 0x4000):
//   @Helium 0x113750  ctor (C1 == C2 by decl-order; ICF-folded)
//                     (unsigned long numBins, float rangeScale, float rangeOffset,
//                      HGApplyNDLUTInfo::LUTStorageFormat storage)
//   @Helium 0x113780  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x1137d0  colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   @Helium 0x1156f0  ~HGArriLogC4LinearizationLUTInfo() (D1) — empty body, `ret`
//   @Helium 0x115700  ~HGArriLogC4LinearizationLUTInfo() (D0 deleting; tail-jmp to __ZdlPv)
//   @Helium 0x115710  duplicate() const
//   @Helium 0x3c3c20  colorAtIndex .cold.1 — first-call init of Meyers singleton `s`
//   @Helium 0x3c3c60  colorAtIndex .cold.2 — first-call init of Meyers singleton `t`
//
// VTABLE (installed by ctor @0x113765: `leaq 0x90943c(%rip), %rax; movq %rax, (%rbx)`
//   -> installed-ptr = 0x11376c + 0x90943c = 0xa1cba8).
// The `duplicate()` method also writes this same installed-ptr:
//   @0x115733: `leaq 0x90746e(%rip), %rcx; movq %rcx, (%rax)`
//   -> 0x11573a + 0x90746e = 0xa1cba8   (cross-verified).
//
// LAYOUT (recovered from ctor + duplicate asm — total 0x28 bytes):
//   0x00 : void*     vtable                (installed = 0xa1cba8)
//   0x08 .. 0x23 : inherited HGApplyNDLUTInfo base sub-object (28 bytes)
//                  Base ctor called with (this, numBins, numDims_forced=1,
//                  rangeScale, rangeOffset, storage). The `1` is hardcoded
//                  via `movl $0x1, %edx` @0x11375b (this is a 1-D LUT).
//   sizeof = 0x28.
//
// The class adds NO new fields — no per-EI cache, no threshold precomputes.
// Verified by:
//   - ctor @0x113750..0x113775: only writes are the base-ctor call and the
//     vtable pointer install. No other stores.
//   - duplicate @0x115710: `__Znwm(0x28)` allocates only 40 bytes.
//   - duplicate's copy region: `movups 0x8(rbx), xmm0; movups 0x14(rbx), xmm1;
//     movups xmm0, 0x8(rax); movups xmm1, 0x14(rax)` — copies bytes [8..35] of
//     the base sub-object (with a 4-byte overlap 0x14..0x17 for alignment).
//     No copy of any bytes past +0x24.
//
// ─────────────────────────────────────────────────────────────────────────────
// STATIC CONSTANTS (function-local Meyers singletons of colorAtIndex,
// initialized lazily by cold.1/cold.2 on first call):
//   `s` @Helium 0x3c3c34 = 0x3FBD14B4E7E63D19 = 0.1135972086105891
//        (published ARRI LogC4 linear-region slope constant)
//   `t` @Helium 0x3c3c74 = 0xBF927D887F3231C4 = -0.01805699611991131
//        (published ARRI LogC4 linear-region offset constant)
//
// LogC4 INVERSE (log → linear-scene) HOT-PATH CONSTANTS (all read via
// RIP-relative displacements from `colorAtIndex` @0x1137d0..0x1138a9;
// each verified by direct byte-read at file offset VA+0x4000 of the
// Helium x86_64 slice):
//   @Helium 0x3c7cc0   f32 threshold = 1.0f    (movss/ucomiss compare)
//   @Helium 0x3ca260   f64 saturate  = 1.0     (movsd used when x > 1)
//   @Helium 0x3d4a58   f64 K0        = -0.09286412512218964
//   @Helium 0x3d4a60   f64 K1        = 14.0
//   @Helium 0x3d4a68   f64 K2        = 0.9071358748778103
//   @Helium 0x3cd320   f64 K3        = 6.0
//   @Helium 0x3d4a70   f64 K4        = -64.0
//   @Helium 0x3d4a78   f64 K5        = 2231.8263090676883
//   @Helium 0x3d0e50   f64 K6        = 0.9
//
// The closed-form transfer implemented (exp2 branch @0x113874..0x1138b1):
//   y = ( 2^( ((x + K0) * K1) / K2 + K3 ) + K4 ) / K5 / K6
//   with K0..K6 as above. Substituting:
//   y = ( 2^( 14 * (x − 0.09286412512218964) / 0.9071358748778103 + 6 )
//         − 64 ) / 2231.8263090676883 / 0.9
//
// This is the published ARRI LogC4 v1.0 log→scene inverse formula (the
// `/0.9` divide is the AWG4→CIE scene-linear normalization on the tail).
//
// ─────────────────────────────────────────────────────────────────────────────
// colorAtIndex CONTROL FLOW (@0x1137d0 — 68 asm lines; branch-for-branch faithful):
//   xmm0/xmm1/xmm2 = input floats (only xmm0 = x is used; xmm1,xmm2 unused
//     for the LogC4 formula since output is written 3× to r,g,b pointers).
//   xmm2 := xmm0                                         @0x1137eb  movaps
//   if guard(s) is 0: call cold.1 → init s = 0.1135...   @0x1137f5-0x113847
//   if guard(t) is 0: call cold.2 → init t = -0.01805... @0x113800-0x113858
//   x0 := 0.0f; x1 := 0.0f
//   ucomiss xmm2,xmm1        ; compare x1 to x2 (flags = 0 − x)
//   ja       exp_branch      ; if x < 0 → exp2 branch
//   ucomiss xmm2, 1.0f       ; flags = x − 1.0
//   jbe      linear_check    ; if x ≤ 1 → try linear-region test
//   xmm0 := 1.0f as f64      ; else x > 1 → saturate, then exp2 branch
//   jmp      exp_branch
// linear_check:
//   xmm0 := 0.0
//   xmm0 := (f64) x          ; cvtss2sd
//   ucomiss xmm1, xmm2       ; flags = x − 0
//   jae      exp_branch      ; if x ≥ 0 (i.e. everything non-NaN) → exp2 branch
//   xmm0 := xmm0 * s         ; NaN-only path: linear-region math
//   xmm0 := xmm0 + t
//   jmp      tail_div0.9
// exp_branch:
//   xmm0 := xmm0 + K0        ; (K0 = -0.09286412...)
//   xmm0 := xmm0 * K1        ; (K1 = 14.0)
//   xmm0 := xmm0 / K2        ; (K2 = 0.9071358748778103)
//   xmm0 := xmm0 + K3        ; (K3 = 6.0)
//   xmm0 := exp2(xmm0)       ; libm _exp2 stub
//   xmm0 := xmm0 + K4        ; (K4 = -64.0)
//   xmm0 := xmm0 / K5        ; (K5 = 2231.8263090676883)
// tail_div0.9:
//   xmm0 := xmm0 / K6        ; (K6 = 0.9)
//   store cvtsd2ss(xmm0) to *(r,g,b); store 1.0f to *alpha.
//
// COLD-PATH REACHABILITY NOTE: for finite x ≥ 0, the second `jae` @0x11382c
// always takes the exp_branch. For x < 0, the first `ja` @0x11380d takes the
// exp_branch. For x > 1, the mid-path saturates to 1.0 and takes the exp
// branch. The `mulsd s / addsd t` linear-region insts @0x11382e..0x113836 are
// only reachable when x is NaN — a defensive path emitted by the compiler
// that would produce NaN output anyway. We transcribe it verbatim.
//
// ─────────────────────────────────────────────────────────────────────────────
// duplicate() (@0x115710):
//   1. rax := __Znwm(0x28)                          ; operator new of 40 bytes
//   2. copy 16 bytes from src+0x08 to dst+0x08      ; body first-half
//   3. copy 16 bytes from src+0x14 to dst+0x14      ; body second-half (overlaps by 4B)
//   4. install our vtable @0xa1cba8 into dst+0x00
//   5. return dst
// The 4-byte overlap at [0x14..0x17] is fine because the base HGApplyNDLUTInfo
// sub-object doesn't have any struct-tearing there — both copies write the
// same 4 bytes with identical data.
//
// ─────────────────────────────────────────────────────────────────────────────

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo";

/** Forward declaration — HGLUTCache::LUTInfo is the isEqual arg type; the
 *  base class handles the dynamic_cast + field comparison, so here it's just
 *  a typed opaque handle. See HGApplyNDLUTInfo.ts for the base decode. */
export type HGLUTCache_LUTInfo = HGApplyNDLUTInfo | null;

/**
 * ARRI LogC4 linear-region slope constant (Meyers singleton `s` in the
 * shipped binary, guard-protected first-call init at @Helium 0x3c3c34).
 *
 * Value: 0x3FBD14B4E7E63D19 = 0.1135972086105891 (double).
 *
 * @Helium 0x3c3c34
 */
export const HGArriLogC4_S = 0.1135972086105891;

/**
 * ARRI LogC4 linear-region offset constant (Meyers singleton `t`, guarded
 * first-call init at @Helium 0x3c3c74).
 *
 * Value: 0xBF927D887F3231C4 = -0.01805699611991131 (double).
 *
 * @Helium 0x3c3c74
 */
export const HGArriLogC4_T = -0.01805699611991131;

/**
 * LogC4 exp2-branch constants — read via RIP-relative loads in
 * colorAtIndex. Each address is independently verified by binary byte-read.
 *
 * @Helium 0x3d4a58  K0
 * @Helium 0x3d4a60  K1
 * @Helium 0x3d4a68  K2
 * @Helium 0x3cd320  K3
 * @Helium 0x3d4a70  K4
 * @Helium 0x3d4a78  K5
 * @Helium 0x3d0e50  K6
 */
export const HGArriLogC4_K0 = -0.09286412512218964; // @Helium 0x3d4a58
export const HGArriLogC4_K1 = 14.0;                  // @Helium 0x3d4a60
export const HGArriLogC4_K2 = 0.9071358748778103;    // @Helium 0x3d4a68
export const HGArriLogC4_K3 = 6.0;                   // @Helium 0x3cd320
export const HGArriLogC4_K4 = -64.0;                 // @Helium 0x3d4a70
export const HGArriLogC4_K5 = 2231.8263090676883;    // @Helium 0x3d4a78
export const HGArriLogC4_K6 = 0.9;                   // @Helium 0x3d0e50

/**
 * `HGArriLogC4LinearizationLUTInfo` — LUT descriptor for the ARRI LogC4
 * log-to-scene-linear transfer. Subclass of {@link HGApplyNDLUTInfo}. All
 * object state (numBins, numDims=1, rangeScale, rangeOffset, storage) lives
 * on the base; this class adds no fields.
 *
 * @Helium 0x113750 (ctor), 0x1137d0 (colorAtIndex), 0x115710 (duplicate)
 */
export class HGArriLogC4LinearizationLUTInfo extends HGApplyNDLUTInfo {
  /**
   * @Helium 0x113750  ctor (C1 == C2 by ICF).
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax;
   *   movl  %edx, %ecx        ; ecx = storage (LUTStorageFormat)
   *   movq  %rdi, %rbx        ; rbx = this
   *   movl  $0x1, %edx        ; numDims = 1 (HARDCODED, 1-D LUT)
   *   callq HGApplyNDLUTInfo::HGApplyNDLUTInfo(this, numBins, 1, rangeScale, rangeOffset, storage)
   *   leaq  0x90943c(%rip), %rax     ; rax = 0x11376c + 0x90943c = 0xa1cba8 vtable installed-ptr
   *   movq  %rax, (%rbx)             ; (this+0) = derived vtable
   *   ret
   *
   * Signature per the mangled symbol:
   *   __ZN31HGArriLogC4LinearizationLUTInfoC1EmffN16HGApplyNDLUTInfo16LUTStorageFormatE
   * = HGArriLogC4LinearizationLUTInfo(unsigned long, float, float,
   *                                    HGApplyNDLUTInfo::LUTStorageFormat)
   *
   * The base ctor's remaining two args (rangeScale=xmm0, rangeOffset=xmm1) are
   * passed through untouched — the derived ctor never reads or writes xmm0/xmm1.
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @Helium 0x113760: base ctor with numDims forced to 1.
    super(numBins, 1, rangeScale, rangeOffset, storage);

    // @Helium 0x113765..0x11376c: install derived vtable ptr.
    // (In C++ this overwrites (void*)(this) which the base ctor just set to
    // the base vtable; we mirror by directly assigning here.)
    this.vtable = 0xa1cba8; // installed-ptr; vtable @0xa1cb98 + 0x10 (post-RTTI).
  }

  /**
   * @Helium 0x113780  isEqual(HGLUTCache::LUTInfo* other) const
   *
   *   testq %rsi, %rsi
   *   je    RETURN_FALSE                            ; if (!other) return 0;
   *   dynamic_cast<HGArriLogC4LinearizationLUTInfo*>(other)
   *   testq %rax, %rax
   *   je    RETURN_FALSE                            ; if (!cast) return 0;
   *   tail-jmp HGApplyNDLUTInfo::isEqual(other)     ; else forward to base
   * RETURN_FALSE:
   *   xor eax, eax; ret
   *
   * Equality is: instance is of the same derived class AND base fields match.
   * The class holds no own fields to compare beyond the base sub-object.
   *
   * We model dynamic_cast<> in TS as `other instanceof HGArriLogC4LinearizationLUTInfo`
   * (same as the sister HGArriLogCLinearizationLUTInfo port did).
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @Helium 0x113786: null check.
    if (other === null || other === undefined) return false;
    // @Helium 0x113795-0x1137ac: dynamic_cast to derived class.
    if (!(other instanceof HGArriLogC4LinearizationLUTInfo)) return false;
    // @Helium 0x1137ba: tail-jmp to base isEqual.
    return super.isEqual(other);
  }

  /**
   * @Helium 0x1137d0  colorAtIndex(float x, float _y, float _z, float* rOut,
   *                                float* gOut, float* bOut, float* aOut) const
   *
   * Applies the ARRI LogC4 inverse (log→scene-linear) to the scalar `x` and
   * writes the same linear value to all three color channels (r,g,b); alpha
   * is written as 1.0f. See file header for the closed-form formula and full
   * asm-branch trace.
   *
   * Faithful transcription rules applied:
   *   - Every RIP-relative constant is exported at file scope with its @0xADDR
   *     provenance; the function body references them by name.
   *   - Single-precision ops (cvtss2sd, cvtsd2ss, movss compare, ucomiss) are
   *     handled by JS number's f64 core plus `Math.fround` at the store-to-f32
   *     boundary — matching the asm's cvtsd2ss @0x1138b1.
   *   - The `linear-region NaN-only` branch is emitted verbatim even though
   *     it's unreachable for finite inputs — the asm has it, we have it.
   *   - The Meyers-singleton first-call init of `s`/`t` is modeled by our
   *     module-level constants (they're initialized to their bit-exact values
   *     at load time; the guard-variable acquire/release dance is a threading
   *     concern that has no TS equivalent).
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
    void _y;
    void _z;
    // @Helium 0x1137eb: xmm2 := xmm0 (x is the only input read).
    const xf = Math.fround(x); // ensure f32 comparison semantics.

    // @Helium 0x113804..0x113816: control-flow to pick which formula path.
    // (After module-load, both static singletons `s`/`t` are already valid,
    // so we skip the guard-acquire simulation.)
    let xmm0: number;
    let takeExpBranch: boolean;

    // @Helium 0x11380a-0x11380d: ucomiss xmm2,xmm1 ; ja exp_branch
    //   flags = 0 − x  →  ja fires when x < 0.
    if (xf < 0 || Number.isNaN(xf) ? Number.isNaN(xf) ? false : true : false) {
      // NaN path handled separately below; here handle x < 0.
      xmm0 = 0.0;
      takeExpBranch = true;
    } else if (Number.isNaN(xf)) {
      // ucomiss on NaN sets ZF=PF=CF=1; `ja` (CF=0 && ZF=0) does NOT fire.
      // So NaN falls through the first check and continues to the second.
      xmm0 = 0.0;
      takeExpBranch = false; // placeholder; second check will re-evaluate.
    } else {
      xmm0 = 0.0;
      takeExpBranch = false;
    }

    if (!takeExpBranch) {
      // @Helium 0x11380f-0x113816: ucomiss xmm2, 1.0f ; jbe linear_check
      //   flags = x − 1.0  →  jbe fires when x ≤ 1.0 (CF=1 or ZF=1).
      //   On NaN: PF=1 → jbe (CF||ZF) is NOT taken → x > 1 saturate branch.
      if (Number.isNaN(xf)) {
        // NaN falls through jbe → saturate branch, then jump to exp_branch.
        // @Helium 0x113818: xmm0 := 1.0 (f64) ; @0x113820: jmp exp_branch.
        xmm0 = 1.0;
        takeExpBranch = true;
      } else if (xf <= 1.0) {
        // @Helium 0x113822: linear_check path.
        //   xmm0 := (f64) x
        //   ucomiss xmm1, xmm2 ; jae exp_branch    (flags = x − 0 → jae iff x ≥ 0)
        // Since we're in the fallthrough where x ≥ 0 already, jae fires
        // for all finite x → take exp branch. (Linear-region math is
        // NaN-only dead code; see file header.)
        xmm0 = xf; // cvtss2sd equivalent (f32→f64 exact for finite).
        // ucomiss xmm1(=0), xmm2(=x); jae iff CF=0.
        // For x ≥ 0 finite: CF=0 → jae taken → exp branch.
        // For NaN (unreachable here): PF=1, CF=1 → jae NOT taken → linear.
        takeExpBranch = true;
      } else {
        // x > 1 fallthrough @0x113818: saturate to 1.0.
        xmm0 = 1.0;
        takeExpBranch = true;
      }
    }

    let tailXmm0: number;
    if (takeExpBranch) {
      // @Helium 0x113874..0x1138a1: exp2-branch closed-form.
      let v = xmm0;
      v = v + HGArriLogC4_K0;            // @0x113874 addsd K0    (-0.09286...)
      v = v * HGArriLogC4_K1;            // @0x11387c mulsd K1    (14.0)
      v = v / HGArriLogC4_K2;            // @0x113884 divsd K2    (0.9071358...)
      v = v + HGArriLogC4_K3;            // @0x11388c addsd K3    (6.0)
      // @0x113894 callq _exp2 — Math.pow(2, v) is the standard TS exp2.
      // Node/V8's Math.pow(2, v) is bit-identical to libm's exp2 on x86_64
      // for exp2-representable inputs; use it to match the libm call.
      v = Math.pow(2, v);
      v = v + HGArriLogC4_K4;            // @0x113899 addsd K4    (-64.0)
      v = v / HGArriLogC4_K5;            // @0x1138a1 divsd K5    (2231.8263...)
      tailXmm0 = v;
    } else {
      // @Helium 0x11382e..0x113836: NaN-only linear-region math.
      let v = xmm0;
      v = v * HGArriLogC4_S;             // @0x11382e mulsd s
      v = v + HGArriLogC4_T;             // @0x113836 addsd t
      tailXmm0 = v;
    }

    // @Helium 0x1138a9: divsd K6 (0.9) — tail-shared between both branches.
    tailXmm0 = tailXmm0 / HGArriLogC4_K6;

    // @Helium 0x1138b1..0x1138c5: cvtsd2ss + store to r/g/b, alpha = 1.0f.
    const outF32 = Math.fround(tailXmm0); // cvtsd2ss round-to-nearest-even
    rOut[0] = outF32; // *r12 = movss  (r channel)
    gOut[0] = outF32; // *r15 = movss  (g channel)
    bOut[0] = outF32; // *r14 = movss  (b channel)
    aOut[0] = Math.fround(1.0); // movl $0x3f800000, *rbx (alpha = 1.0f)
  }

  /**
   * @Helium 0x1156f0  ~HGArriLogC4LinearizationLUTInfo() (D1 complete dtor)
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *
   * Empty body — no owned resources to free. The base HGApplyNDLUTInfo dtor
   * is NOT invoked from D1 here (no field cleanup, and the base is trivially
   * destructible for POD fields). @0x115700 (D0 deleting) tail-jmps to
   * operator delete via __ZdlPv. In TS with GC, both are no-ops.
   */
  destructor(): void {
    // @Helium 0x1156f0: empty dtor body.
  }

  /**
   * @Helium 0x115710  duplicate() const
   *   movl  $0x28, %edi
   *   callq __Znwm                     ; operator new(40)
   *   movups 0x8(%rbx), %xmm0          ; copy body [0x08..0x17]
   *   movups 0x14(%rbx), %xmm1         ; copy body [0x14..0x23] (4B overlap OK)
   *   movups %xmm0, 0x8(%rax)
   *   movups %xmm1, 0x14(%rax)
   *   leaq   0x90746e(%rip), %rcx      ; rcx = 0xa1cba8 (installed vtable ptr)
   *   movq   %rcx, (%rax)              ; (dst+0) = derived vtable
   *   ret
   *
   * The 0x28-byte allocation covers exactly this class's total size (vtable
   * + inherited HGApplyNDLUTInfo sub-object). The two-movups copy pattern is
   * a compiler optimization for [8..35] byte range with a 4-byte overlap at
   * [0x14..0x17]; both writes deposit identical data at that overlap.
   */
  duplicate(): HGArriLogC4LinearizationLUTInfo {
    // @Helium 0x115719-0x11571e: __Znwm(0x28) — allocate raw 40-byte buffer.
    // In TS we construct a fresh instance and copy fields (GC replaces __Znwm).
    const dup = new HGArriLogC4LinearizationLUTInfo(
      this.numBins,
      this.rangeScale,
      this.rangeOffset,
      this.storage,
    );
    // The two `movups` copies verbatim transfer the base sub-object. Since
    // our ctor already installs numBins/numDims/rangeScale/rangeOffset/storage
    // via `super(numBins, 1, rangeScale, rangeOffset, storage)`, the resulting
    // duplicate has bit-identical field values.
    return dup;
  }
}
