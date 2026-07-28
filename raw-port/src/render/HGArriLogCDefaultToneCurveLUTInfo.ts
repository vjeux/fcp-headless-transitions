// raw-port/src/render/HGArriLogCDefaultToneCurveLUTInfo.ts
//
// FCP `HGArriLogCDefaultToneCurveLUTInfo` — Helium concrete subclass of the
// already-landed base `HGApplyNDLUTInfo`. Models the ARRI-LogC DEFAULT tone
// curve (linearize + display-referred re-shape) as a 1-D LUT descriptor.
//
// This class differs from the other ArriLogC family members: instead of
// selecting an EI-specific parameter set (like HGArriLogCLinearizationLUTInfo
// which has 11 EI bands from 100..1600), the "default tone curve" carries
// FIXED per-instance polynomial coefficients (a fixed 6-band piecewise
// cubic) plus a single bool that switches the POST-processing between two
// modes. It ignores its two float ctor args entirely (only the bool and
// storage-format matter — verified from the ctor disasm below).
//
// FRAMEWORK: Helium.framework
// DECODE: raw-port/re/disasm/Helium.HGArriLogCDefaultToneCurveLUTInfo.*.s
//
// SYMBOLS (Helium x86_64 slice; all VAs are unadjusted VM addresses):
//   @Helium 0x113120  C2 ctor  (unsigned long, float, float, bool,
//                                HGApplyNDLUTInfo::LUTStorageFormat)
//   @Helium 0x113190  C1 ctor  — byte-identical to C2 apart from RIP disp
//   @Helium 0x113200  isEqual(HGLUTCache::LUTInfo*) const
//   @Helium 0x113270  colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   @Helium 0x1155f0  ~HGArriLogCDefaultToneCurveLUTInfo() (D1) — trivial
//   @Helium 0x115600  ~HGArriLogCDefaultToneCurveLUTInfo() (D0) — jmp __ZdlPv
//   @Helium 0x115610  duplicate() const
//   @Helium 0x3c3be0  colorAtIndex (.cold.1) — static-init of ::c const
//
// VTABLE @Helium 0xa1caf8 (installed ptr = 0xa1cb08; from ctor @0x1131a6..0x1131ad;
// C1 ctor uses a different displacement but lands at the same 0xa1cb08 target):
//   *0x00 = 0x1155f0  ~HGArriLogCDefaultToneCurveLUTInfo (D1)
//   *0x08 = 0x115600  ~HGArriLogCDefaultToneCurveLUTInfo (D0)
//   *0x10 = 0x115610  duplicate() const           [NEW virtual for this family]
//   *0x18 = 0x113200  isEqual(HGLUTCache::LUTInfo*) const  [override]
//   *0x20 = 0x113270  colorAtIndex(...) const              [override]
//
// STRUCT LAYOUT (recovered from ctor writes + duplicate size arg __Znwm(0x80)):
//   0x00 : void*      vtable                     (installed = 0xa1cb08)
//   0x08 .. 0x23 : inherited HGApplyNDLUTInfo base (numBins, numDims,
//                       rangeScale, rangeOffset, storage) — set by base C2 ctor
//   0x28 : f64   polyC2[0]  = 0.35229492187500033    ; @Helium 0x3d4980[0]
//   0x30 : f64   polyC2[1]  = 6.111934156378599     ; @Helium 0x3d4980[1]
//   0x38 : f64   polyC2[2]  = -0.4299179176679849   ; @Helium 0x3d49a0[0]
//   0x40 : f64   polyC2[3]  = 0.2937499999999507    ; @Helium 0x3d49a0[1]
//   0x48 : f64   polyC2[4]  = -4.041632653061225    ; @Helium 0x3d49c0[0]
//   0x50 : f64   polyC2[5]  = 3.171920776367186     ; @Helium 0x3d49c0[1] — ALSO polyC3[0]
//   0x58 : f64   polyC3[1]  = -15.989432505207521   ; @Helium 0x3d4990[0]
//   0x60 : f64   polyC3[2]  = 0.42560692576321685   ; @Helium 0x3d4990[1]
//   0x68 : f64   polyC3[3]  = -34.2187499999995     ; @Helium 0x3d49b0[0]
//   0x70 : f64   polyC3[4]  = 4.642565597667638     ; @Helium 0x3d49b0[1]
//   0x78 : u8    postMode   (the bool ctor arg — see math below)
//   0x79..0x7f : UNINITIALIZED  (7 bytes of tail padding to satisfy new(0x80))
//   sizeof = 0x80 bytes (from duplicate() __Znwm(0x80)).
//
// NOTE: polyC3[0] and polyC2[5] alias to the same slot (0x50). This is safe
// because the algorithm's band-selection (see colorAtIndex below) guarantees:
//   - band == 0 uses polyC3[0] at 0x50 (and polyC2[0] at 0x28)
//   - band == 5 uses polyC2[5] at 0x50 (and polyC3[5] at 0x78..0x7f, which
//     never fires because the initial clamp at the top of colorAtIndex
//     rejects x >= 1.0 (kMaxLinear = xi[5] = 1.0) before band-select runs;
//     the band-5 case is unreachable given the clamps).
// (Both native x86 loads read at 0x28+8*band and 0x50+8*band; the shared
// 0x50 slot is safe because it is used with a different Horner role in each
// of those two bands.)
//
// STATIC TABLES (Helium __TEXT __const; per-class, addressed by RIP-relative
// leaq in colorAtIndex):
//   HGArriLogCDefaultToneCurveLUTInfo::xi   @0x3d4cd0  6 × f64 = piecewise breakpoints
//                                            [0.0, 0.256, 0.391, 0.57, 0.65, 1.0]
//   HGArriLogCDefaultToneCurveLUTInfo::a0   @0x3d4d00  6 × f64 = Horner constant term
//                                            [0.0, 0.17, 0.4, 0.737, 0.868, 1.0]
//   HGArriLogCDefaultToneCurveLUTInfo::a1   @0x3d4d30  6 × f64 = Horner linear term
//                                            [0.366, 1.17, 1.946, 1.833, 1.223, 0.1]
//   HGArriLogCDefaultToneCurveLUTInfo::gamma        @0x3d4d60  f64 = 2.4
//   HGArriLogCDefaultToneCurveLUTInfo::g            @0x3d4d68  f64 = 2.725
//   HGArriLogCDefaultToneCurveLUTInfo::a            @0x3d4d70  f64 = 0.097
//   HGArriLogCDefaultToneCurveLUTInfo::k            @0x3d4d78  f64 = 0.05623188405797101
//   HGArriLogCDefaultToneCurveLUTInfo::kMinLinear   @0x3d4d80  f64 = 0.0
//   HGArriLogCDefaultToneCurveLUTInfo::kMaxLinear   @0x3d4d88  f64 = 1.0
//   HGArriLogCDefaultToneCurveLUTInfo::kMinLogGamma @0x3d4d90  f64 = 0.0
//   HGArriLogCDefaultToneCurveLUTInfo::kMaxLogGamma @0x3d4d98  f64 = 1.0
// (All read directly from the Helium x86_64 slice at file offset
//  16384 + (VA - 0x3c7b80) + 3963776; values verified byte-for-byte.)
//
// STATIC-INIT CONSTANT (Helium __bss; Itanium ABI guarded):
//   colorAtIndex::c @0x0ade090  = double bit-pattern 0x3f732e5bf55474d3
//                               = 0.004682883464991866
//   Guard variable @0x0ade098; static-init body @Helium 0x3c3be0 (.cold.1).
//   Value is chosen so that at x = k (the split point) both branches agree:
//     high branch:  ((k + a) / (1 + a))^g
//     low  branch:  (k / k) * c = c
//   For continuity, c = ((0.05623... + 0.097) / (1 + 0.097))^2.725
//                     = 0.004682883464991866  (matches bit pattern).
//
// UNDECODED CALLEES / EXTERNAL SYMBOLS:
//   * `pow` (libm) — invoked at 0x11338e, 0x1133ca, 0x1133e1. Modelled by
//     JS `Math.pow` (which follows the same libm semantics on all common
//     platforms). No throwing stub needed.
//   * `___dynamic_cast` (libcxxabi) — invoked from isEqual. Modelled by
//     TS's `instanceof` for the same runtime effect at the type check.
//   * `HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*)` (base) — imported
//     from the already-landed base class.
//   * `__ZdlPv` (operator delete) — D0's tail-jump. In TS this becomes a
//     no-op (JS GC).
//   * `__cxa_guard_acquire`/`__cxa_guard_release` (Itanium ABI, static-init
//     guard) — replaced by a lazy-init cached `#c` field.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo";

/**
 * ARRI-LogC default tone-curve descriptor.
 *
 * This 1-D LUT type reshapes a normalized linear input value into the
 * ARRI-LogC default tone-curve output. The math is a piecewise cubic
 * polynomial across 5 (effectively) bands, followed by a switchable
 * gamma/linear-splice post-processing stage. See {@link colorAtIndex}
 * for the algorithm.
 *
 * @remarks Per-instance state:
 *   - 10 f64 polynomial coefficients (fixed values, memcpy'd in from
 *     Helium __TEXT __const at ctor time — the ctor does NOT accept
 *     these as arguments).
 *   - one u8 `postMode` bool (the ctor's fourth argument), which
 *     selects between the two post-processing branches.
 *   - inherited base fields (numBins, numDims, rangeScale, rangeOffset,
 *     storage) — see {@link HGApplyNDLUTInfo}.
 */
export class HGArriLogCDefaultToneCurveLUTInfo extends HGApplyNDLUTInfo {
  // ─────────── per-instance polynomial coefficient slots ───────────
  // Match the exact native layout: 10 f64 slots at bytes 0x28..0x77 of the
  // native object. In TS we expose them as two arrays (`polyC2[0..5]` and
  // `polyC3[1..4]`) plus the shared 0x50 slot documented as `polyC2_5_C3_0`.
  // (The 0x78..0x7f tail — one bool byte + 7 uninitialized bytes — is
  // handled by `postMode` alone; the algorithm proves band-5's polyC3
  // slot is never read.)

  /** polyC2[band] for band 0..5, stored at 0x28 + band*8 in native.
   *  band 5's value ALIASES to polyC3[0] (see class layout doc). */
  polyC2: [number, number, number, number, number, number];
  /** polyC3[band] for band 0..4, stored at 0x50 + band*8 in native.
   *  band 0's value ALIASES to polyC2[5] (see class layout doc); band 5's
   *  slot (0x78..0x7f) is uninitialized in native but never read (band 5
   *  is unreachable given the top-of-fn clamps). */
  polyC3_0to4: [number, number, number, number, number];

  /** postMode @0x78 (u8, the bool ctor arg). Selects colorAtIndex's
   *  post-processing branch: true → gamma-splice via pow(g); false →
   *  sign-preserving pow(gamma). */
  postMode: boolean;

  // ─────────── per-class static tables (Helium __TEXT __const) ───────────
  // These are the exported symbols
  // HGArriLogCDefaultToneCurveLUTInfo::{xi,a0,a1,gamma,g,a,k,kMin*,kMax*}.
  // Values read directly from the Helium x86_64 slice by seek+read of
  // the file bytes at each labelled VA; see class layout comment above.

  /** breakpoints xi[0..5] @Helium 0x3d4cd0. Values [0.0, 0.256, 0.391, 0.57, 0.65, 1.0]. */
  static readonly xi = [
    0.0, // xi[0] @0x3d4cd0
    0.256, // xi[1] @0x3d4cd8
    0.391, // xi[2] @0x3d4ce0
    0.57, // xi[3] @0x3d4ce8
    0.65, // xi[4] @0x3d4cf0
    1.0, // xi[5] @0x3d4cf8  (== kMaxLinear)
  ] as const;

  /** Horner constant term a0[0..5] @Helium 0x3d4d00. */
  static readonly a0 = [
    0.0, // a0[0] @0x3d4d00
    0.17, // a0[1] @0x3d4d08
    0.4, // a0[2] @0x3d4d10
    0.737, // a0[3] @0x3d4d18
    0.868, // a0[4] @0x3d4d20
    1.0, // a0[5] @0x3d4d28
  ] as const;

  /** Horner linear term a1[0..5] @Helium 0x3d4d30. */
  static readonly a1 = [
    0.366, // a1[0] @0x3d4d30
    1.17, // a1[1] @0x3d4d38
    1.946, // a1[2] @0x3d4d40
    1.833, // a1[3] @0x3d4d48
    1.223, // a1[4] @0x3d4d50
    0.1, // a1[5] @0x3d4d58
  ] as const;

  /** gamma @Helium 0x3d4d60. Sign-preserving pow exponent for postMode=false. */
  static readonly gamma = 2.4;
  /** g @Helium 0x3d4d68. Pow exponent for postMode=true "high" branch. */
  static readonly g = 2.725;
  /** a @Helium 0x3d4d70. Additive offset for postMode=true "high" branch. */
  static readonly a = 0.097;
  /** k @Helium 0x3d4d78. Split point between the two postMode=true branches. */
  static readonly k = 0.05623188405797101;
  /** kMinLinear @Helium 0x3d4d80. Lower clamp bound for input x. */
  static readonly kMinLinear = 0.0;
  /** kMaxLinear @Helium 0x3d4d88. Upper clamp bound for input x. */
  static readonly kMaxLinear = 1.0;
  /** kMinLogGamma @Helium 0x3d4d90. */
  static readonly kMinLogGamma = 0.0;
  /** kMaxLogGamma @Helium 0x3d4d98. */
  static readonly kMaxLogGamma = 1.0;

  /**
   * Static-init'd continuity constant `c` @Helium 0x0ade090
   * (bit pattern 0x3f732e5bf55474d3 = 0.004682883464991866).
   *
   * Set exactly once by the .cold.1 helper at @Helium 0x3c3be0 (guarded by
   * Itanium ABI `__cxa_guard_acquire`/`__cxa_guard_release`). The value is
   * the continuity value ((k + a) / (1 + a))^g at x = k — i.e. the shared
   * value of the postMode=true "high" and "low" branches at the split point.
   *
   * In TS we cache the constant literally (the guard-protected first-call
   * path in native is a lazy-init mechanism; we can materialise the value
   * eagerly at module load because it is a pure compile-time constant).
   */
  static readonly kColorAtIndexC = 0.004682883464991866;

  /**
   * `HGArriLogCDefaultToneCurveLUTInfo::HGArriLogCDefaultToneCurveLUTInfo`
   * — Helium C1 @0x113190  (C2 @0x113120 is byte-identical apart from RIP
   * displacement; both install the same vtable ptr 0xa1cb08).
   *
   * Signature (from mangled `EmffbN16HGApplyNDLUTInfo16LUTStorageFormatE`):
   *   (unsigned long numBins, float f1_ignored, float f2_ignored,
   *    bool postMode, LUTStorageFormat storage)
   *
   * Full C1 disassembly (@0x113190..@0x1131f4):
   *
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   pushq  %r14
   *   pushq  %rbx
   *   movl   %edx, %ebx        ; ebx = postMode (bool as u8 in edx, per ABI)
   *   movq   %rdi, %r14        ; r14 = this
   *   movl   $0x1, %edx        ; force numDims arg to 1 for the base ctor
   *   callq  __ZN16HGApplyNDLUTInfoC2EmmffNS_16LUTStorageFormatE
   *       ; ↑ base ctor. Args after the assignment:
   *       ;    rdi = this       (unchanged)
   *       ;    rsi = numBins    (unchanged from caller)
   *       ;    rdx = 1          (numDims forced)
   *       ;    xmm0/xmm1 = f1_ignored / f2_ignored (unchanged from caller;
   *       ;                 the base ctor stores them as rangeScale/rangeOffset)
   *       ;    ecx = storage    (unchanged)
   *   leaq   0x90995b(%rip), %rax   ; rax = 0xa1cb08 (this class's vtable + 0x10)
   *   movq   %rax, (%r14)            ; this->vptr = 0xa1cb08
   *   movb   %bl, 0x78(%r14)         ; this->postMode = bl
   *   movaps 0x2c17c5(%rip), %xmm0   ; xmm0 = 16 bytes @0x3d4980
   *   movups %xmm0, 0x28(%r14)       ; this[0x28..0x37] = { 0.35229... , 6.11193... }
   *   movaps 0x2c17c9(%rip), %xmm0   ; xmm0 = 16 bytes @0x3d4990
   *   movups %xmm0, 0x58(%r14)       ; this[0x58..0x67] = { -15.9894..., 0.42560... }
   *   movaps 0x2c17cd(%rip), %xmm0   ; xmm0 = 16 bytes @0x3d49a0
   *   movups %xmm0, 0x38(%r14)       ; this[0x38..0x47] = { -0.4299..., 0.29375... }
   *   movaps 0x2c17d1(%rip), %xmm0   ; xmm0 = 16 bytes @0x3d49b0
   *   movups %xmm0, 0x68(%r14)       ; this[0x68..0x77] = { -34.2187..., 4.6425... }
   *   movaps 0x2c17d5(%rip), %xmm0   ; xmm0 = 16 bytes @0x3d49c0
   *   movups %xmm0, 0x48(%r14)       ; this[0x48..0x57] = { -4.0416..., 3.17192... }
   *   popq   %rbx
   *   popq   %r14
   *   popq   %rbp
   *   retq
   *
   * (The RIP-relative constants at 0x3d4980..0x3d49c0 are 5×16 bytes of
   * pre-tabulated polynomial coefficients — see the LAYOUT comment above.)
   *
   * NOTE: `f1_ignored` and `f2_ignored` are passed straight through to the
   * base ctor as rangeScale/rangeOffset. Neither the subclass ctor nor its
   * methods ever consume them; whatever the caller passes ends up stored
   * in the base subobject unmodified. We faithfully mirror that behaviour.
   */
  constructor(
    numBins: number,
    f1: number,
    f2: number,
    postMode: boolean,
    storage: LUTStorageFormat,
  ) {
    // @Helium 0x11319c: `movl $0x1, %edx` — force base numDims to 1.
    // Then the base ctor is called with this/numBins/1/f1/f2/storage.
    super(numBins, 1, f1, f2, storage);

    // @Helium 0x1131a6..0x1131ad: vtable install (target 0xa1cb08).
    this.vtable = 0xa1cb08;

    // @Helium 0x1131b0: postMode = bl (the bool ctor arg).
    this.postMode = !!postMode;

    // @Helium 0x1131b4..0x1131eb: five 16-byte movaps loads from
    // __TEXT __const, each written to a distinct instance slot.
    // Values read byte-for-byte from the Helium x86_64 slice.
    this.polyC2 = [
      0.35229492187500033, // @0x3d4980[0] → this[0x28] (band 0's C2)
      6.111934156378599, // @0x3d4980[1] → this[0x30] (band 1's C2)
      -0.4299179176679849, // @0x3d49a0[0] → this[0x38] (band 2's C2)
      0.2937499999999507, // @0x3d49a0[1] → this[0x40] (band 3's C2)
      -4.041632653061225, // @0x3d49c0[0] → this[0x48] (band 4's C2)
      3.171920776367186, // @0x3d49c0[1] → this[0x50] (band 5's C2; ALIASES polyC3[0])
    ];
    this.polyC3_0to4 = [
      3.171920776367186, // this[0x50] (band 0's C3; ALIASES polyC2[5])
      -15.989432505207521, // @0x3d4990[0] → this[0x58] (band 1's C3)
      0.42560692576321685, // @0x3d4990[1] → this[0x60] (band 2's C3)
      -34.2187499999995, // @0x3d49b0[0] → this[0x68] (band 3's C3)
      4.642565597667638, // @0x3d49b0[1] → this[0x70] (band 4's C3)
      // band 5's C3 (native this[0x78..0x7f]) is intentionally omitted:
      // the top-of-colorAtIndex clamp guarantees band 5 is never reached
      // (the byte at 0x78 in native is postMode; 0x79..0x7f are uninit).
    ];
  }

  // Access helpers matching the colorAtIndex band-indexing.
  // c2(band) reads inst[0x28 + band*8]; c3(band) reads inst[0x50 + band*8].
  private c2(band: number): number {
    // band 0..5 → polyC2[0..5]
    return this.polyC2[band];
  }
  private c3(band: number): number {
    // band 0..4 → polyC3_0to4[band]. Band 5 is unreachable; if it ever
    // is asked for we throw (Rule 3: never approximate; the native
    // instance has uninitialized bytes there).
    if (band === 5) {
      // @Helium 0x113315: band-5 native read at (rdi+0x78) is 1 byte of
      // postMode + 7 uninitialized bytes. The top clamp @0x11327c-@0x113287
      // proves band 5 is unreachable when 0 < x < kMaxLinear=1.0.
      throw new Error(
        "HGArriLogCDefaultToneCurveLUTInfo::colorAtIndex @0x113315 " +
          "band=5 requested — native this[0x78..0x7f] is postMode+garbage; " +
          "this branch is proven unreachable by the top clamp (x < 1.0).",
      );
    }
    return this.polyC3_0to4[band];
  }

  /**
   * `HGArriLogCDefaultToneCurveLUTInfo::isEqual(HGLUTCache::LUTInfo*) const`
   * — Helium @0x113200.
   *
   * Full disassembly (@0x113200..@0x113265):
   *
   *   pushq %rbp ; movq %rsp,%rbp
   *   pushq %r15 ; pushq %r14 ; pushq %rbx ; pushq %rax
   *   testq %rsi, %rsi
   *   je    0x113255                 ; other == null → return false
   *   movq  %rdi, %rbx                ; rbx = this
   *   movq  __ZTIN10HGLUTCache7LUTInfoE(%rip), %rax   ; from-typeinfo
   *   leaq  __ZTI33HGArriLogCDefaultToneCurveLUTInfo(%rip), %rdx ; to-typeinfo
   *   xorl  %r14d, %r14d              ; result = false
   *   movq  %rsi, %rdi
   *   movq  %rax, %rsi
   *   xorl  %ecx, %ecx                ; hint = 0
   *   callq ___dynamic_cast           ; dynamic_cast<Default*>(other)
   *   testq %rax, %rax
   *   je    0x113258                  ; cast failed → return false
   *   movq  %rax, %r15                ; r15 = casted-other
   *   movq  %rbx, %rdi ; movq %rax, %rsi
   *   callq HGApplyNDLUTInfo::isEqual  ; base isEqual(this, other)
   *   testb %al, %al
   *   je    0x113255                   ; base said false → return false
   *   movzbl 0x78(%rbx), %eax          ; this->postMode
   *   cmpb   0x78(%r15), %al            ; == other->postMode ?
   *   sete   %r14b                     ;   set result byte
   *   jmp    0x113258
   * ...
   *   movl   %r14d, %eax
   *   retq
   *
   * TS model: instanceof for the dynamic_cast, then chained boolean.
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @0x11320a: testq rsi,rsi ; je → false
    if (other == null) return false;
    // @0x113212..0x113230: dynamic_cast<HGArriLogCDefaultToneCurveLUTInfo*>(other)
    // — if the cast fails, return false (@0x113233: testq rax,rax ; je → false).
    if (!(other instanceof HGArriLogCDefaultToneCurveLUTInfo)) {
      return false;
    }
    // @0x11323e: base class isEqual(this, other) — if false, return false.
    if (!super.isEqual(other)) return false;
    // @0x113247..0x11324f: compare the postMode bytes.
    return this.postMode === other.postMode;
  }

  /**
   * `HGArriLogCDefaultToneCurveLUTInfo::colorAtIndex(float, float, float,
   *   float*, float*, float*, float*) const` — Helium @0x113270.
   *
   * Applies the ARRI-LogC default tone curve to the FIRST float argument
   * (the other two floats are IGNORED — the disassembly never touches
   * xmm1/xmm2 or their promoted 64-bit versions before the final write,
   * confirming a monochrome/luminance-only transform whose result is
   * broadcast to r/g/b outputs; alpha is set to 1.0f).
   *
   * ALGORITHM (mirroring the disasm branch-for-branch):
   *
   *   INPUT: x (float32, in xmm0), 3 output pointers r,g,b + 1 for alpha
   *
   *   1. Clamp gate (@0x113270..0x113287):
   *      if (x <= 0.0f) → skip to write with xmm1=0.0f
   *      if (x >= 1.0f) → skip to write with xmm1=0.0f
   *      (`ucomiss` unordered NaN both go to jae → write-zero, so NaN
   *      also short-circuits to zero.)
   *
   *   2. Band selection on x_d = (double)x (@0x113290..0x1132f1):
   *      compare xd against xi[1..4] to find first band whose xi is > xd:
   *         if (xi[1] > xd) band = 0
   *         else if (xi[2] > xd) band = 1
   *         else if (xi[3] > xd) band = 2
   *         else if (xi[4] > xd) band = 3
   *         else if (xi[5]==1.0f > x_float) band = 4   ; single-precision cmp
   *         else                          band = 5   ; unreachable — see clamp
   *      (The final compare @0x1132e4 uses `movss/ucomiss` — single-
   *       precision — reading xi[5] as f32 = 1.0f; combined with the
   *       @0x113287 top clamp that already rejected x >= 1.0f, band 5 is
   *       unreachable.)
   *
   *   3. Horner cubic on d = xd - xi[band] (@0x113305..0x113347):
   *      y = ((this.c3[band] * d + this.c2[band]) * d + a1[band]) * d + a0[band]
   *      (Two per-instance coefficients + two per-class ones — see comments.)
   *
   *   4. Post-processing dispatched on postMode (@0x113347: cmpb $1,0x78):
   *
   *      if (postMode == true) {                        // @0x11334d..0x11339f
   *        static_init(c);                              // Itanium guard — first call only
   *        if (y > k)   y2 = pow((y + a) / (1 + a), g); // "high" branch
   *        else         y2 = (y / k) * c;               // "low"  branch
   *      } else {                                        // @0x1133a4..0x1133e6
   *        if (y >= 0.0)  y2 = pow(y, gamma);
   *        else           y2 = -pow(-y, gamma);         // sign-preserving
   *      }
   *
   *   5. Cast y2 → float32 (@0x11343c: cvtsd2ss xmm0,xmm1) and write:
   *      *r = *g = *b = xmm1_float
   *      *a = 1.0f    (bit-pattern 0x3f800000 — @0x113458)
   *
   * INTERESTING DETAIL — postMode=true low branch (@0x113429..0x113438):
   *   The native code sequences `divsd 0x2c15ff(%rip), %xmm0` (divide by
   *   k = 0.05623...) then `mulsd colorAtIndex::c(%rip), %xmm0`. This is
   *   `(y/k) * c` where c is the static-init'd continuity constant.
   *
   * INTERESTING DETAIL — postMode=true high branch (@0x11336a..0x11339f):
   *   The native code sequences `addsd`, `divsd`, `movsd`, then callq pow.
   *   The two constants at 0x3d4a38 (a=0.097) and 0x3d4a40 (1.097 = 1+a)
   *   are LITERAL doubles pre-baked into __TEXT __const; we materialise
   *   them from the class-level constants a and (1+a) at call time. The
   *   pow exponent is g=2.725 read from @0x3d4a48.
   *
   * INTERESTING DETAIL — postMode=false sign-preserving (@0x1133a4..0x1133e6):
   *   The xorpd @0x1133ba loads 16 bytes {0x80000000_00000000, ...} —
   *   the double-precision sign-flip mask. Applying `xorpd` flips xmm0's
   *   sign bit; equivalent to `-x`. Then pow(-x, gamma), then flip back.
   *   (Not `Math.abs` + sign-copy: the native uses IEEE-754 sign-bit XOR,
   *   which behaves identically for all finite values and preserves NaN
   *   payload bits. `Math.pow(-x, gamma)` in TS achieves the same result
   *   for the values that reach this branch — non-negative doubles where
   *   pow is well-defined; the sign-flip is mathematically an involution.)
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
    // @0x113270..0x113287: top clamp. xmm1 starts at 0.0 and holds the
    // "output-if-clamped" value; it stays 0 until the algorithm writes
    // a result on the not-clamped path.
    let xmm1Out = Math.fround(0.0);

    // @0x113273: `ucomiss %xmm0, %xmm1` with xmm1=0; jae if 0 >= x. This
    // catches x <= 0 AND NaN (unordered compare returns unordered → jae).
    // @0x11327c: `movss const=1.0` then ucomiss; jae if x >= 1.0.
    const xf = Math.fround(x);
    if (!(xf > 0.0) || !(xf < 1.0)) {
      // clamp path — go straight to writes with xmm1=0.
      rOut[0] = xmm1Out;
      gOut[0] = xmm1Out;
      bOut[0] = xmm1Out;
      aOut[0] = Math.fround(1.0); // @0x113458: movl $0x3f800000
      return;
    }

    // @0x113290: cvtss2sd — promote xf to double for the band select and
    // polynomial evaluation.
    const xd = xf; // TypeScript numbers are already double; float32→double is exact.

    // @0x113294..0x1132f1: band selection ladder.
    // Note the FINAL compare is single-precision (movss/ucomiss @0x1132e4)
    // whereas breakpoints 1..4 are double-precision (ucomisd). Mirror.
    let band: 0 | 1 | 2 | 3 | 4 | 5;
    if (HGArriLogCDefaultToneCurveLUTInfo.xi[1] > xd) band = 0;
    else if (HGArriLogCDefaultToneCurveLUTInfo.xi[2] > xd) band = 1;
    else if (HGArriLogCDefaultToneCurveLUTInfo.xi[3] > xd) band = 2;
    else if (HGArriLogCDefaultToneCurveLUTInfo.xi[4] > xd) band = 3;
    else if (
      Math.fround(HGArriLogCDefaultToneCurveLUTInfo.xi[5]) > xf // single-precision cmp
    )
      band = 4;
    else band = 5; // unreachable — see the clamp

    // @0x113305..0x113347: Horner cubic in d = xd - xi[band].
    const d = xd - HGArriLogCDefaultToneCurveLUTInfo.xi[band];
    const C2 = this.c2(band);
    const C3 = this.c3(band);
    const A1 = HGArriLogCDefaultToneCurveLUTInfo.a1[band];
    const A0 = HGArriLogCDefaultToneCurveLUTInfo.a0[band];
    let y = ((C3 * d + C2) * d + A1) * d + A0;

    // @0x113347: cmpb $1, 0x78(%rdi) — dispatch on postMode.
    if (this.postMode) {
      // @0x11334d..0x11339f: postMode == true branch.
      // First-call static-init of ::c is handled eagerly by the class-level
      // constant `kColorAtIndexC` (see doc for the value).
      const k = HGArriLogCDefaultToneCurveLUTInfo.k;
      const a = HGArriLogCDefaultToneCurveLUTInfo.a;
      const g = HGArriLogCDefaultToneCurveLUTInfo.g;
      const c = HGArriLogCDefaultToneCurveLUTInfo.kColorAtIndexC;
      // @0x11335c: ucomisd 0x2c16cc(%rip) == k ; jbe → low branch
      if (y > k) {
        // @0x11336a..0x11338e: high branch.
        // xmm0 = (y + a) / (1 + a) ; xmm1 = g ; callq pow
        y = Math.pow((y + a) / (1.0 + a), g);
      } else {
        // @0x113429..0x113438: low branch.
        // xmm0 = (y / k) * c
        y = (y / k) * c;
      }
    } else {
      // @0x1133a4..0x1133e6: postMode == false branch (sign-preserving pow).
      const gamma = HGArriLogCDefaultToneCurveLUTInfo.gamma;
      // @0x1133b0..0x1133b8: `xorpd %xmm1,%xmm1 ; ucomisd %xmm1,%xmm0 ; jae`
      // — if y >= 0 → the "positive" branch; else the "negative" branch.
      if (y >= 0.0) {
        // @0x1133d9..0x1133e6: pow(y, gamma)
        y = Math.pow(y, gamma);
      } else {
        // @0x1133ba..0x1133d7: y = -pow(-y, gamma) (sign-flip via xorpd mask).
        y = -Math.pow(-y, gamma);
      }
    }

    // @0x11343c: cvtsd2ss xmm0,xmm1 — result cast to float32.
    xmm1Out = Math.fround(y);
    // @0x11344c..0x11345f: broadcast to r/g/b; alpha = 1.0f (0x3f800000).
    rOut[0] = xmm1Out;
    gOut[0] = xmm1Out;
    bOut[0] = xmm1Out;
    aOut[0] = Math.fround(1.0);
  }

  /**
   * `HGArriLogCDefaultToneCurveLUTInfo::duplicate() const` — Helium @0x115610.
   *
   * Full disassembly (@0x115610..@0x115672):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *   movq  %rdi, %rbx
   *   movl  $0x80, %edi                ; sizeof = 128 bytes
   *   callq __Znwm                     ; operator new(0x80)
   *   ; Copy inherited base fields (excluding vtable at 0x00):
   *   movups 0x8(%rbx), %xmm0          ; read 16 bytes from this[0x08..0x17]
   *   movups 0x14(%rbx), %xmm1         ; read 16 bytes from this[0x14..0x23]
   *   movups %xmm0, 0x8(%rax)          ; new[0x08..0x17]
   *   movups %xmm1, 0x14(%rax)         ; new[0x14..0x23]   (overlaps by 4 bytes)
   *   ; Install THIS class's vtable on the new object:
   *   leaq   0x9074ce(%rip), %rcx      ; = 0xa1cb08
   *   movq   %rcx, (%rax)              ; new->vptr = 0xa1cb08
   *   ; Copy polynomial slabs (4 × 16 bytes) + bool (1 byte):
   *   movups 0x28(%rbx), %xmm0 ; movups 0x38(%rbx), %xmm1
   *   movups 0x48(%rbx), %xmm2 ; movups 0x58(%rbx), %xmm3
   *   movups %xmm0, 0x28(%rax) ; movups %xmm1, 0x38(%rax)
   *   movups %xmm2, 0x48(%rax) ; movups %xmm3, 0x58(%rax)
   *   movups 0x68(%rbx), %xmm0 ; movups %xmm0, 0x68(%rax)
   *   movzbl 0x78(%rbx), %ecx ; movb %cl, 0x78(%rax)
   *   ; sizeof = 0x80 (bytes 0x79..0x7f UN-COPIED — see class layout note).
   *   addq $0x8, %rsp ; popq %rbx ; popq %rbp
   *   retq
   *
   * NOTE the two overlapping movups at 0x8 and 0x14 in the base copy: the
   * compiler uses two 16-byte loads that overlap by 4 bytes to cover
   * exactly the 28 bytes 0x08..0x23 (five fields) in a straight-line
   * sequence — 16 + 16 - 4 = 28. The bytes 0x24..0x27 (padding between
   * `storage` and the subclass fields at 0x28) are NOT copied because
   * they don't exist as observable state.
   *
   * TS model: allocate a fresh instance and clone every field. The
   * uninitialized 0x79..0x7f bytes in native have no TS counterpart.
   *
   * @returns a new HGArriLogCDefaultToneCurveLUTInfo with all observable
   *   fields copied from this.
   */
  duplicate(): HGArriLogCDefaultToneCurveLUTInfo {
    // @0x115619..0x115623: __Znwm(0x80) + copy base fields 0x08..0x23.
    // @0x115633..0x11563d: vtable install (target 0xa1cb08).
    // @0x115641..0x115669: copy 10 polynomial doubles + 1 bool byte.
    const clone = new HGArriLogCDefaultToneCurveLUTInfo(
      this.numBins,
      this.rangeScale,
      this.rangeOffset,
      this.postMode,
      this.storage,
    );
    // The ctor's memcpy from __TEXT __const already re-populated polyC2/
    // polyC3_0to4 with the SAME immutable constants that this instance
    // holds (both the source and clone read from the exact same 5 × 16-byte
    // constant blocks in __TEXT __const at 0x3d4980..0x3d49d0). So no
    // further copy is needed for those slots to match.
    //
    // Base-class fields (numBins, rangeScale, rangeOffset, storage) went
    // through the base ctor. numDims — the base ctor forced it to 1 for
    // this subclass (see ctor doc); native duplicate() copies the parent
    // numDims byte-for-byte (via the two 16-byte overlapping movups) so
    // whatever the source has must survive. But since our ctor already
    // forces numDims to 1, and this class ONLY ever has numDims = 1 (the
    // ctor hard-codes it), the two are equal by construction.
    return clone;
  }

  /**
   * `HGArriLogCDefaultToneCurveLUTInfo::~HGArriLogCDefaultToneCurveLUTInfo`
   * D1 @Helium 0x1155f0 — trivial empty destructor.
   *
   * Full disassembly (@0x1155f0..):
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * The class has no fields whose destruction requires custom logic (10
   * doubles + 1 bool byte + inherited base sub-object of trivial POD
   * fields). The base's D2 @Helium HGApplyNDLUTInfo::~D2 (already ported)
   * is a `ud2` trap, but subclass D1 does NOT call it directly — the
   * subclass D1 is the whole destruction body. JS GC replaces it entirely.
   */
  __dtor_D1_Default(): void {
    // @0x1155f0..0x1155f4 — trivial empty.
  }

  /**
   * `HGArriLogCDefaultToneCurveLUTInfo::~HGArriLogCDefaultToneCurveLUTInfo`
   * D0 @Helium 0x115600 — deleting destructor. Body:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv
   * Tail-jump to `operator delete(void*)` — no field destruction needed.
   *
   * TS model: no-op. JS GC reclaims storage.
   */
  __dtor_D0_Default(): void {
    // @0x115600..0x115605 — tail-jump to __ZdlPv (operator delete).
  }
}
