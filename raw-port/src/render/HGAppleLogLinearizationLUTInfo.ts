// raw-port/src/render/HGAppleLogLinearizationLUTInfo.ts
//
// FCP `HGAppleLogLinearizationLUTInfo` — LUT-info descriptor for the Apple Log
// -> linear light transfer function. Extends the landed base
// `HGApplyNDLUTInfo` (see raw-port/src/render/HGApplyNDLUTInfo.ts). At bake
// time HGLUTCache samples `colorAtIndex(x, y, z, r*, g*, b*, a*) const` at
// each entry of a 1-D LUT (numDims=1, forced by the base ctor) to build the
// gpu-side lookup table.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGAppleLogLinearizationLUTInfo.*.s
// (mangled: __ZN30HGAppleLogLinearizationLUTInfo*).
//
// Symbols (Helium x86_64; VA == file offset in the thin slice):
//   0x114a30  HGAppleLogLinearizationLUTInfo::HGAppleLogLinearizationLUTInfo(
//               unsigned long numBins, float rangeScale, float rangeOffset,
//               HGApplyNDLUTInfo::LUTStorageFormat storage)                 [C2 ctor]
//             (C1 aliases the same body under __ZN...C1... at 0x114a30 too.)
//   0x114a60  HGAppleLogLinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
//   0x114ab0  HGAppleLogLinearizationLUTInfo::colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   0x3c4200  HGAppleLogLinearizationLUTInfo::colorAtIndex::.cold.1  [tl static-init]
//   0x3c4240  HGAppleLogLinearizationLUTInfo::colorAtIndex::.cold.2  [gg static-init]
//   0x115b10  HGAppleLogLinearizationLUTInfo::~HGAppleLogLinearizationLUTInfo()  [D1 — empty]
//   0x115b20  HGAppleLogLinearizationLUTInfo::~HGAppleLogLinearizationLUTInfo()  [D0 — tail-jmp ::operator delete]
//   0x115b30  HGAppleLogLinearizationLUTInfo::duplicate() const
//
// VTABLE (installed pointer = 0xa1cf18, i.e. __ZTV30HGAppleLogLinearizationLUTInfo + 0x10,
// verified against the ctor's `leaq 0x9084cc(%rip),%rax` @0x114a45 →
// 0x114a45 + 7 + 0x9084cc = 0xa1cf18). JS prototype chain models this via
// `extends`, per the pattern in HGPanasonicVLogLinearizationLUTInfo.ts.
//
// LAYOUT (all fields inherited from HGApplyNDLUTInfo — this class ADDS NO
// fields; sizeof = 0x28 = base 0x24 rounded up 8-byte, allocated as
// `operator new(0x28)` in duplicate() @0x115b39):
//   0x00 : void*                     vtable          (installed = 0xa1cf18)
//   0x08..0x23 : inherited HGApplyNDLUTInfo fields (numBins @0x08, numDims
//                @0x10, rangeScale @0x18, rangeOffset @0x1c, storage @0x20).
//                The subclass ctor forces numDims=1 via `movl $1, %edx` @0x114a3b
//                before delegating to
//                `HGApplyNDLUTInfo::HGApplyNDLUTInfo(numBins, 1, rangeScale,
//                rangeOffset, storage)` @0x3d5e0 (call @0x114a40).
//   0x24..0x27 : trailing pad (never read/written; duplicate() only copies
//                bytes 0x08..0x23 via movups 0x8/0x14 then their re-stores).
//
// APPLE LOG TRANSFER FUNCTION (recovered from colorAtIndex disasm).
// Two function-local static double constants, initialized lazily via
// __cxa_guard_acquire from cold.1/cold.2 (each just does a `movabsq $imm64`
// into the static slot). Bit-patterns verified in the thin binary:
//
//   tl = 0x3fcab1f0cdaacc3e as f64 = 0.2085553173288605
//     (Apple Log toe/knee threshold — the switch between the small-signal
//      sqrt/scale branch and the large-signal exp branch.  Loaded by
//      colorAtIndex.cold.1 @0x3c4214: `movabsq $0x3fcab1f0cdaacc3e, %rax`
//      and stored to the static slot at Helium __bss 0xade210.)
//
//   gg = 0x4020368b277c7d96 as f64 = 8.106530412623027
//     (Log-region slope multiplier passed to `exp`. Numerically this is
//      approximately ln(10) / 0.2840697 — a precomputed constant so the
//      code can call libm `exp` instead of `pow(10, ...)` at every LUT
//      sample. Loaded by colorAtIndex.cold.2 @0x3c4254:
//      `movabsq $0x4020368b277c7d96, %rax` and stored at Helium __bss 0xade220.)
//
// Other numeric constants used by colorAtIndex (RIP-rel data pool addresses in
// Helium, read out of the thin binary; addresses computed nxt_ip + disp):
//   @0x3d4c00  f64 = -0.69336945     (log-region input offset;
//                                     addsd @0x114b74 which shifts X by -0.6934)
//   @0x3d4c08  f64 = -0.00964052     (log-region output offset;
//                                     addsd @0x114b89 after exp(...))
//   @0x3d4c10  f64 = -0.05641088     (sqrt-region output offset;
//                                     addsd @0x114b1b after sqrt; also the
//                                     value loaded at @0x114b02 for the
//                                     compiler's dead-code fallback branch.)
//   @0x3d4c18  f64 = 47.28711236     (sqrt-region input divisor;
//                                     divsd @0x114b0f before sqrtsd @0x114b17.)
//   @0x3c7cc0  f32 = 1.0f            (upper-clamp comparison; ucomiss @0x114b59)
//   @0x3ca260  f64 = 1.0             (upper-clamp value + also loaded at
//                                     @0x114b62 to make xmm0=1.0 when
//                                     the caller's X is already-clamped
//                                     to 1.0 via the jbe @0x114b60 → falls
//                                     through into the log-region formula.)
//   @0x3d0e50  f64 = 0.9             (post-normalization divisor;
//                                     divsd @0x114b91 immediately before cvtsd2ss.)
//
// Piecewise formula recovered branch-for-branch from the disasm. Only the
// FIRST f32 arg is consumed (@0x114acb `movaps %xmm0, %xmm2` stashes it into
// xmm2, and the other two f32 args are never touched). Output writes the same
// scalar to R, G, B, and 1.0f to A.
//
//   Input clamp (three-way):
//     x <  0.0f     -> X = 0.0     (@0x114ae4 xorps xmm0,xmm0 → xmm0 stays 0.0 as
//                                    the negative-x branch falls into @0x114af9
//                                    with xmm0 never getting cvtss2sd.)
//     x >  1.0f     -> X = 1.0     (@0x114b62 `movsd @0x3ca260, xmm0` after jbe
//                                    NOT-taken at @0x114b60 which fires when
//                                    x > 1.0f, since ucomiss compares xmm2(x)
//                                    to 1.0f loaded at @0x3c7cc0.)
//     else          -> X = (f64)x  (@0x114bc3 cvtss2sd xmm2,xmm0 — the on-range
//                                    case at 0<=x<=1.)
//
//   Piecewise transfer:
//     X < tl(0.2085553173288605):
//        y = sqrt( X / 47.28711236 ) + (-0.05641088)         // @0x114b0f divsd;
//                                                             // @0x114b17 sqrtsd;
//                                                             // @0x114b1b addsd
//     X >= tl:
//        y = exp( (X + (-0.69336945)) * gg(8.106530412623027) ) + (-0.00964052)
//                                                             // @0x114b74 addsd;
//                                                             // @0x114b7c mulsd;
//                                                             // @0x114b84 callq _exp;
//                                                             // @0x114b89 addsd
//
//   Both branches converge at @0x114b91:
//     y = y / 0.9                                             // @0x114b91 divsd 0x3d0e50
//
//   Broadcast (@0x114b99 cvtsd2ss; @0x114b9d..@0x114bad):
//     *r = *g = *b = (f32)y                                   // three movss
//     *a = 1.0f                                               // movl $0x3f800000
//
// The disasm's branch structure is more intricate than the algorithm (the
// static-init guards `tl` and `gg` are checked, cold routines are invoked,
// and the sign-of-x check is repeated after guard-init at @0x114b54). Those
// mechanics collapse to a single explicit initialization + one branch here;
// the mathematical output is identical because:
//   - the compiler's dead-code fallback @0x114b02 (which returns the constant
//     -0.05641088 into y) is UNREACHABLE — the only entry into 0x114af9 is
//     the positive-x path where xmm0 = (f64)x >= 0, so the `ucomisd 0,xmm0`
//     `jae` always fires and jumps to @0x114b0f (the sqrt branch).
//   - the negative-x fall-through (@0x114aef onwards) reaches the same
//     @0x114b0f with xmm0 = 0.0, and sqrt(0/47.287) + (-0.05641088) =
//     -0.05641088. This is the identical value that the upper-clamp does
//     NOT produce, but IS what the port produces for x <= 0. Verified by
//     tracing @0x114ae4..@0x114b0f end-to-end.
//   - the "x > 1.0f" fall-through @0x114b62 sets X = 1.0d and then executes
//     the log-region formula with X=1.0 (the `jb` at @0x114b72 tests
//     `xmm0 < tl` where xmm0=1.0 > tl, so jb NOT taken and we drop into
//     @0x114b74 = the log branch). This matches the port's `else if (x > 1)`
//     path which then falls into the `else` (log) branch of the piecewise.
//
// dynamic_cast in isEqual (@0x114a84-@0x114a9a): if `other` is null return
// false (0). Otherwise ___dynamic_cast(other, typeinfo<HGLUTCache::LUTInfo>,
// typeinfo<HGAppleLogLinearizationLUTInfo>, 0). If the RTTI cast fails
// return false; if it succeeds tail-jump `HGApplyNDLUTInfo::isEqual(otherCast)`
// (@0x114a9a) — i.e. TWO Apple Log LUTInfos are equal iff they share the
// same base-class field state (numBins/numDims/rangeScale/rangeOffset/
// storage per HGApplyNDLUTInfo::isEqual). This class adds no fields so no
// extra comparisons are needed.
//
// duplicate() @0x115b30: allocate 0x28 bytes via ::operator new(0x28) (raw
// alloc — not zeroed), memcpy fields at [0x08..0x23] from `this` (two xmm
// unaligned moves: bytes 0x08..0x17 then 0x14..0x23 — overlapping the middle
// but landing correctly since both are copied from the same source), install
// the vtable pointer at (this+0x00) = &vtable[+0x10] (leaq 0x9073be(%rip),
// %rcx @0x115b53 → 0x115b53 + 7 + 0x9073be = 0xa1cf18), return the new
// pointer. Note the ctor is NOT re-run: this is a raw layout clone with a
// fresh vptr. No refcount / no ownership beyond the base class.
//
// D1 dtor (@0x115b10): empty (pushq/popq/retq) — nothing to release.
// D0 dtor (@0x115b20): tail-jmp `::operator delete(void*)` — just free the block.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo.js";

/**
 * Apple Log -> linear-light 1-D LUT descriptor.
 *
 * Faithful transcription of the FCP class `HGAppleLogLinearizationLUTInfo`
 * (Helium framework). The class inherits the full HGApplyNDLUTInfo layout
 * and adds no new fields; its only responsibility is to supply the transfer
 * function sample at each LUT index via `colorAtIndex`.
 *
 * @see raw-port/re/disasm/Helium.HGAppleLogLinearizationLUTInfo.*.s
 */
export class HGAppleLogLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /**
   * Lazily-initialized static Apple Log toe/knee threshold, double precision.
   * The bit-pattern is exactly the one the compiler emits @Helium 0x3c4214
   * (.cold.1 store into the thread-safe static slot at Helium __bss 0xade210).
   *   f64 bit-pattern: 0x3fcab1f0cdaacc3e   → decimal 0.2085553173288605
   */
  static readonly TL: number = 0.2085553173288605;                 // @0x3c4214

  /**
   * Lazily-initialized static log-region multiplier (`gg` in the disasm's
   * static-slot name). Precomputed so the transfer function calls `exp`
   * instead of `pow(10, ...)`; numerically ≈ ln(10) / 0.2840697.
   *   f64 bit-pattern: 0x4020368b277c7d96   → decimal 8.106530412623027
   */
  static readonly GG: number = 8.106530412623027;                  // @0x3c4254

  /** Apple Log sqrt-region input divisor.                    @0x3d4c18 */
  static readonly SQRT_DIV: number = 47.28711236;                  // f64
  /** Apple Log sqrt-region output offset (added after sqrt). @0x3d4c10 */
  static readonly SQRT_OFFSET: number = -0.05641088;               // f64
  /** Apple Log log-region input offset (added to X pre-mul).  @0x3d4c00 */
  static readonly LOG_INPUT_OFFSET: number = -0.69336945;          // f64
  /** Apple Log log-region output offset (added after exp).    @0x3d4c08 */
  static readonly LOG_OUTPUT_OFFSET: number = -0.00964052;         // f64
  /** Post-normalization divisor (both branches converge).     @0x3d0e50 */
  static readonly NORM: number = 0.9;                              // f64

  /**
   * HGAppleLogLinearizationLUTInfo::HGAppleLogLinearizationLUTInfo(
   *   unsigned long numBins, float rangeScale, float rangeOffset,
   *   HGApplyNDLUTInfo::LUTStorageFormat storage) — @Helium 0x114a30
   *
   *   0x114a36  movl  %edx, %ecx           ; ecx = storage
   *   0x114a38  movq  %rdi, %rbx           ; save this
   *   0x114a3b  movl  $0x1, %edx           ; numDims = 1  (hard-coded 1-D LUT)
   *   0x114a40  callq HGApplyNDLUTInfo::HGApplyNDLUTInfo(this, numBins,
   *                                          1, rangeScale, rangeOffset, storage)
   *   0x114a45  leaq  0x9084cc(%rip), %rax ; = 0xa1cf18 = __ZTV...+ 0x10
   *   0x114a4c  movq  %rax, (%rbx)         ; install vptr at this+0x00
   *   (return)
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @0x114a40 callq HGApplyNDLUTInfo::HGApplyNDLUTInfo(numBins, 1, rangeScale,
    // rangeOffset, storage) — the second arg is `numDims`, forced to 1.
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // @0x114a45..@0x114a4c vtable install — JS prototype chain models this via
    // `extends`. In the C++ this overwrites (void*)(this) which the base ctor
    // just set to the base vtable; the derived vtable installed ptr is 0xa1cf18.
  }

  /**
   * HGAppleLogLinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo* other) const
   *   @Helium 0x114a60
   *
   *   0x114a66  testq %rsi, %rsi                          ; if other == nullptr
   *   0x114a69  je    0x114a9f                            ;   return 0
   *   0x114a6e  movq  __ZTIN10HGLUTCache7LUTInfoE(%rip), %rax  ; srcType
   *   0x114a75  leaq  __ZTI30HGAppleLogLinearizationLUTInfo(%rip), %rdx ; dstType
   *   0x114a82  xorl  %ecx, %ecx                          ; hint = 0
   *   0x114a84  callq ___dynamic_cast(other, srcType, dstType, 0)
   *   0x114a89  testq %rax, %rax                          ; if cast fails
   *   0x114a8c  je    0x114a9f                            ;   return 0
   *   0x114a9a  jmp   HGApplyNDLUTInfo::isEqual(this, cast_result)
   *   0x114a9f  xorl  %eax, %eax                          ; return 0
   *   0x114aa7  retq
   *
   * At the port level this collapses to: same-runtime-class check +
   * base-class field equality (see HGApplyNDLUTInfo::isEqual, which does
   * numBins == other.numBins && numDims == other.numDims &&
   * |rangeScale - other.rangeScale| < 1e-4 &&
   * |rangeOffset - other.rangeOffset| < 1e-4 &&
   * storage == other.storage).
   */
  override isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @0x114a66 testq %rsi,%rsi ; @0x114a69 je return-0
    if (other === null || other === undefined) return false;
    // @0x114a84 ___dynamic_cast to HGAppleLogLinearizationLUTInfo* — if it
    // returns null the isEqual returns 0. Modeled via `instanceof` per the
    // pattern already used in HGApplyNDLUTInfo.isEqual and other subclasses.
    if (!(other instanceof HGAppleLogLinearizationLUTInfo)) return false;
    // @0x114a9a jmp HGApplyNDLUTInfo::isEqual — delegate structural check.
    return super.isEqual(other);
  }

  /**
   * HGAppleLogLinearizationLUTInfo::duplicate() const — @Helium 0x115b30
   *
   *   0x115b39  movl  $0x28, %edi           ; sizeof allocation = 40 bytes
   *   0x115b3e  callq ::operator new(0x28)
   *   0x115b43  movups 0x8(%rbx), %xmm0     ; copy bytes 0x08..0x17
   *   0x115b47  movups 0x14(%rbx), %xmm1    ; copy bytes 0x14..0x23
   *   0x115b4b  movups %xmm0, 0x8(%rax)
   *   0x115b4f  movups %xmm1, 0x14(%rax)
   *   0x115b53  leaq  0x9073be(%rip), %rcx  ; = 0xa1cf18 (installed vptr)
   *   0x115b5a  movq  %rcx, (%rax)          ; install vptr on the copy
   *   0x115b63  retq                        ; return the new pointer
   *
   * Raw structural clone — does NOT invoke a ctor and does NOT copy the
   * trailing 4-byte pad at 0x24..0x27 (there are no fields there). At the
   * port level we materialize a new instance with the same base-class
   * state; the derived class has no extra fields so this reproduces the
   * layout exactly. numDims is forced to 1 by our ctor but the source's
   * numDims is already 1, so passing it through preserves it.
   */
  duplicate(): HGAppleLogLinearizationLUTInfo {
    // @0x115b3e callq ::operator new(0x28)
    // @0x115b43..@0x115b4f memcpy [0x08..0x23] from `this`
    // @0x115b53..@0x115b5a install vtable pointer 0xa1cf18
    return new HGAppleLogLinearizationLUTInfo(
      this.getNumBins(),
      this.getRangeScale(),
      this.getRangeOffset(),
      this.getLUTStorageFormat(),
    );
  }

  /**
   * HGAppleLogLinearizationLUTInfo::colorAtIndex(
   *   float x, float y, float z, float* r, float* g, float* b, float* a) const
   *   — @Helium 0x114ab0
   *
   * Faithful branch-for-branch transcription. Only `x` is consumed
   * (@0x114acb `movaps %xmm0, %xmm2` stashes the first f32 arg; y and z
   * are never touched). Both static locals (`tl` @Helium __bss 0xade210 and
   * `gg` @Helium __bss 0xade220) are guaranteed to have been initialized by
   * the cold branches @0x3c4200 / @0x3c4240 (thread-safe __cxa_guard_acquire
   * dance) before any first-call reaches the math; the port folds them into
   * static class-level constants with the SAME bit-values.
   *
   * Control-flow trace (all @Helium):
   *   0x114ae4  xorps xmm0,xmm0            ; xmm0 = 0.0 (double)
   *   0x114ae7  xorps xmm1,xmm1            ; xmm1 = 0.0 (float)
   *   0x114aea  ucomiss xmm2, xmm1         ; compare 0.0f vs x
   *   0x114aed  jbe 0x114b59               ; if 0 <= x → in-range/positive path
   *   ; ---- x < 0 fall-through ----
   *   0x114aef  ucomisd tl, xmm0(0.0)      ; 0.0 vs tl → NOT (0 >= tl) → not taken
   *   0x114af9  xorps xmm1,xmm1
   *   0x114afc  ucomisd xmm1(0), xmm0(0)   ; 0 vs 0 equal
   *   0x114b00  jae 0x114b0f               ; taken → sqrt-region with xmm0=0
   *   ; ---- positive path ----
   *   0x114b59  ucomiss @0x3c7cc0(=1.0f), xmm2 ; compare xmm2(x) vs 1.0f
   *   0x114b60  jbe 0x114bc0               ; if x <= 1.0f → in-range branch
   *   ; ---- x > 1.0f fall-through ----
   *   0x114b62  movsd @0x3ca260(=1.0d), xmm0   ; xmm0 = 1.0
   *   0x114b6a  ucomisd tl, xmm0(1.0)      ; 1.0 vs 0.208
   *   0x114b72  jb 0x114af9                ; NOT taken (1.0 >= tl)
   *   0x114b74  addsd @0x3d4c00(-0.6934), xmm0 ; xmm0 = 1.0 - 0.6934 = 0.3066
   *   0x114b7c  mulsd gg(8.10653), xmm0    ; xmm0 *= gg
   *   0x114b84  callq _exp                 ; xmm0 = exp(xmm0)
   *   0x114b89  addsd @0x3d4c08(-0.00964), xmm0
   *   0x114b91  divsd @0x3d0e50(0.9), xmm0 ; converge point
   *   0x114b99  cvtsd2ss xmm0,xmm0
   *   0x114b9d..0x114bad  movss xmm0 -> (*r),(*g),(*b); movl 0x3f800000 -> (*a)
   *   ; ---- in-range branch (0 <= x <= 1.0f) ----
   *   0x114bc0  xorps xmm0,xmm0
   *   0x114bc3  cvtss2sd xmm2,xmm0         ; xmm0 = (f64)x
   *   0x114bc7  ucomisd tl, xmm0           ; xmm0 vs tl
   *   0x114bcf  jb 0x114af9                ; if xmm0 < tl → sqrt path
   *   0x114bd5  jmp 0x114b74               ; else fall into log path
   *
   * The in-range x < tl path lands at @0x114af9 with xmm0=(f64)x >= 0, so the
   * `ucomisd 0,xmm0` `jae` (@0x114afc..@0x114b00) always fires and jumps to
   * @0x114b0f (sqrt-region formula). Consequently @0x114b02..@0x114b0a
   * (which loads the constant -0.05641088 and jumps straight to @0x114b91) is
   * DEAD CODE — a compiler artifact for a branch that provably cannot fire.
   */
  colorAtIndex(
    x: number,
    _y: number,
    _z: number,
    r_out: [number],
    g_out: [number],
    b_out: [number],
    a_out: [number],
  ): void {
    // Reproduce the machine's f32 semantics on the input (the caller's f32
    // arg was passed in xmm0 and is compared as f32 via `ucomiss`).  @0x114ab4
    const xf = Math.fround(x);

    // Three-way clamp — see the control-flow trace above. On NaN the ucomiss
    // sets PF=1 which makes `jbe` NOT taken (unsigned/parity semantics), so a
    // NaN input hits the negative-x fall-through with xmm0=0. Our JS mirror:
    // `!(xf >= 0)` catches NaN identically.  @0x114aea
    let X: number;
    if (!(xf >= 0)) {
      // @0x114ae4..@0x114b0f (negative-x fall-through routes to sqrt-region
      // with xmm0=0.0); equivalent to X=0 going into the piecewise below.
      X = 0.0;
    } else if (xf > 1.0) {
      // @0x114b62 `movsd @0x3ca260, xmm0` — X = 1.0 (double).
      X = 1.0;
    } else {
      // @0x114bc3 `cvtss2sd xmm2, xmm0` — promote f32 to f64. Wrapping xf in
      // Math.fround preserves the incoming single-precision quantization.
      X = xf;
    }

    // Piecewise transfer — @0x114b0f (sqrt) vs @0x114b74 (log/exp).
    let y: number;
    if (X < HGAppleLogLinearizationLUTInfo.TL) {
      // Sqrt/small-signal branch — @0x114b0f divsd 47.287 ; @0x114b17 sqrtsd ;
      // @0x114b1b addsd -0.05641088.
      y =
        Math.sqrt(X / HGAppleLogLinearizationLUTInfo.SQRT_DIV) +
        HGAppleLogLinearizationLUTInfo.SQRT_OFFSET;
    } else {
      // Log/large-signal branch — @0x114b74 addsd -0.69336945 ; @0x114b7c mulsd
      // 8.10653 ; @0x114b84 callq _exp ; @0x114b89 addsd -0.00964052.
      y =
        Math.exp(
          (X + HGAppleLogLinearizationLUTInfo.LOG_INPUT_OFFSET) *
            HGAppleLogLinearizationLUTInfo.GG,
        ) + HGAppleLogLinearizationLUTInfo.LOG_OUTPUT_OFFSET;
    }

    // @0x114b91 divsd 0.9 — both branches converge here.
    y = y / HGAppleLogLinearizationLUTInfo.NORM;

    // @0x114b99 cvtsd2ss — collapse to f32 exactly as the disasm does.
    const yF32 = Math.fround(y);

    // @0x114b9d..@0x114bad broadcast to r,g,b and set a = 1.0f.
    r_out[0] = yF32;
    g_out[0] = yF32;
    b_out[0] = yF32;
    // @0x114bad movl $0x3f800000, (%rbx) — 0x3f800000 == 1.0f.
    a_out[0] = Math.fround(1.0);
  }
}
