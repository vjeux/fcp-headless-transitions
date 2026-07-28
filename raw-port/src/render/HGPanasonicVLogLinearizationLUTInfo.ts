// raw-port/src/render/HGPanasonicVLogLinearizationLUTInfo.ts
//
// FCP `HGPanasonicVLogLinearizationLUTInfo` — LUT-info descriptor for the
// Panasonic V-Log -> linear light transfer function. Extends the landed base
// `HGApplyNDLUTInfo` (see raw-port/src/render/HGApplyNDLUTInfo.ts). At bake
// time HGLUTCache samples `colorAtIndex(x, y, z, r*, g*, b*, a*) const` at
// each entry of a 1-D LUT (numDims=1 forced by the base ctor) to build the
// gpu-side lookup table.
//
// Symbols (Helium x86_64; file offset 0x4000; VAs are unadjusted VM addresses
// from otool -tV):
//   0x114350  HGPanasonicVLogLinearizationLUTInfo::HGPanasonicVLogLinearizationLUTInfo(
//               unsigned long numBins, float rangeScale, float rangeOffset,
//               HGApplyNDLUTInfo::LUTStorageFormat storage)                  [C2 ctor]
//             (C1 has the identical body; shares the same __ZN...C1... alias.)
//   0x114380  HGPanasonicVLogLinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
//   0x1143d0  HGPanasonicVLogLinearizationLUTInfo::colorAtIndex(f32,f32,f32, f32*,f32*,f32*,f32*) const
//   0x3c4000  HGPanasonicVLogLinearizationLUTInfo::colorAtIndex::.cold.1  [tl static-init]
//   0x3c4040  HGPanasonicVLogLinearizationLUTInfo::colorAtIndex::.cold.2  [cc static-init]
//   0x115990  HGPanasonicVLogLinearizationLUTInfo::~HGPanasonicVLogLinearizationLUTInfo()  [D1 — empty]
//   0x1159a0  HGPanasonicVLogLinearizationLUTInfo::~HGPanasonicVLogLinearizationLUTInfo()  [D0 — tail-jmp ::operator delete]
//   0x1159b0  HGPanasonicVLogLinearizationLUTInfo::duplicate() const
//
// LAYOUT (all fields inherited from HGApplyNDLUTInfo — this class ADDS NO
// fields; sizeof = 0x28, allocated as `operator new(0x28)` in duplicate()):
//   0x00 : void*                     vtable          (installed = 0x907dd8; RIP-rel
//                                                     leaq 0x908a6c(%rip),%rax @0x114365
//                                                     -> 0x114365 + 7 + 0x908a6c
//                                                     = 0xa1cde0; wait — decoded
//                                                     via `resolve.py Helium vtable
//                                                     HGPanasonicVLogLinearizationLUTInfo`
//                                                     if that tool is exposed. Not
//                                                     enumerated here; JS prototype
//                                                     chain models it.)
//   0x08..0x24 : inherited HGApplyNDLUTInfo fields (numBins @0x08, numDims @0x10,
//                rangeScale @0x18, rangeOffset @0x1c, storage @0x20). The ctor
//                shim passes numDims=1 (movl $1,%edx @0x11435b) before delegating
//                to `HGApplyNDLUTInfo::HGApplyNDLUTInfo(numBins, 1, rangeScale,
//                rangeOffset, storage)` @0x3d5e0.
//
// PANASONIC V-LOG TRANSFER FUNCTION (recovered from colorAtIndex disasm)
// Two thread-local static double constants (initialized lazily via
// __cxa_guard_acquire; init blocks are cold.1 and cold.2):
//
//   tl = 0x3fc72b00be1a1a7d as f64 = 0.18099984438250152
//     (V-Log cut1 threshold; canonical spec value 0.181; the small residual
//      is quantization from the reference implementation. Loaded by ctor .cold.1
//      @0x3c4000: `movabsq $0x3fc72b00be1a1a7d, %rax`.)
//
//   cc = 0x402311635b128422 as f64 = 9.533961149225494
//     (Base-conversion coefficient. Numerically cc = ln(10) / 0.241514 where
//      0.241514 is the canonical V-Log "b" parameter — the code uses `exp` with
//      this coefficient so that `exp(t*cc) = 10^(t/0.241514)` (i.e., converts
//      the natural-log-based `exp` into a base-10 power without a runtime log10
//      call). Loaded by ctor .cold.2 @0x3c4040:
//      `movabsq $0x402311635b128422, %rax`.)
//
// Other numeric constants (RIP-rel data pool addresses in Helium; verified via
// resolve.py Helium const <ADDR>):
//   @0x3d4b70  f64 = -0.125          (small-signal offset numerator; ucomiss/addsd @0x114419)
//   @0x3d4b78  f64 = 5.6             (small-signal denominator; divsd @0x114421)
//   @0x3c7cc0  f32 (low 32) = 1.0f   (upper clamp comparison; ucomiss @0x11445f)
//   @0x3ca260  f64 = 1.0             (clamp value for x > 1.0; movsd @0x114468)
//   @0x3d4b60  f64 = -0.598206       (V-Log large-signal offset "c";
//                                     addsd @0x11447a; canonical c = 0.598206)
//   @0x3d4b68  f64 = -0.00873        (V-Log large-signal offset "d";
//                                     addsd @0x11448f; canonical d = 0.00873)
//   @0x3d0e50  f64 = 0.9             (V-Log linear normalization; divsd @0x114497)
//
// Piecewise formula recovered branch-for-branch from the disasm (input `x` is
// the V-Log-encoded value, output is linear-light; y and z parameters are
// IGNORED — see @0x1143eb `movaps %xmm0, %xmm2` which stashes only x):
//
//   let X:f64
//   if      (x <  0.0)      X = 0.0    // clamp lower  — falls through @0x11440f
//   else if (x >  1.0)      X = 1.0    // clamp upper  — @0x114468 movsd 1.0d
//   else                    X = (f64)x // convert       — @0x1144c9 cvtss2sd
//
//   let linear:f64
//   if (X < tl(0.181))
//     linear = (X + (-0.125)) / 5.6          // small-signal linear branch — @0x114419
//   else
//     linear = exp((X + (-0.598206)) * cc) + (-0.00873)   // large-signal branch — @0x11447a
//
//   linear = linear / 0.9                    // normalize — @0x114497 (both branches converge)
//
//   *r = *g = *b = (f32)linear               // @0x1144a3-0x1144ae broadcast
//   *a = 1.0f                                // @0x1144b3 movl $0x3f800000
//
// The disassembly's branch structure is more intricate than the algorithm
// (there are pre-checks against the tl/cc guard variables to lazily initialize
// on first call, then a redundant re-check of the sign-of-x branch after
// static-init returns). The port collapses those to a single explicit
// initialization + a single conditional — the mathematical output is
// identical branch-for-branch because the sign-of-x check @0x11445a repeats
// the same @0x11440a comparison after the guard call.
//
// dynamic_cast in isEqual (@0x11438e-@0x1143c1): if `other` is null return
// false (0). Otherwise ___dynamic_cast(other, typeinfo<HGLUTCache::LUTInfo>,
// typeinfo<HGPanasonicVLogLinearizationLUTInfo>, 0). If the RTTI cast fails
// return false; if it succeeds tail-jump `HGApplyNDLUTInfo::isEqual(otherCast)`
// (@0x1143ba) — i.e. TWO Panasonic V-Log LUTInfos are equal iff they share
// the same base-class field state (numBins/numDims/rangeScale/rangeOffset/
// storage per HGApplyNDLUTInfo::isEqual). This class adds no fields so no
// extra comparisons are needed.
//
// duplicate() @0x1159b0: allocate 0x28 bytes via ::operator new(0x28) (raw
// alloc — not zeroed), memcpy fields at [0x08..0x27] from `this` (two xmm
// unaligned moves: bytes 0x08..0x17 then 0x14..0x23 which overlap the middle
// but land correctly since both are copied from `this`), install the vtable
// pointer at (this+0x00) = &vtable[+0x10] (leaq 0x9073fe(%rip),%rcx @0x1159d3),
// return the new pointer. Note the ctor is NOT re-run: this is a raw layout
// clone with a fresh vptr. No refcount / no ownership beyond the base class.
//
// D1 dtor (@0x115990): empty (pushq/popq/retq) — nothing to release.
// D0 dtor (@0x1159a0): tail-jmp `::operator delete(void*)` — just free the block.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo.js";

/**
 * Panasonic V-Log -> linear-light 1-D LUT descriptor.
 *
 * Faithful transcription of the FCP class of the same name (Helium framework).
 * The class inherits the full HGApplyNDLUTInfo layout and adds no new fields;
 * its only responsibility is to supply the transfer-function sample at each
 * LUT index via `colorAtIndex`.
 */
export class HGPanasonicVLogLinearizationLUTInfo extends HGApplyNDLUTInfo {
  /**
   * Lazily-initialized static V-Log cut1 threshold, doubles-precision, exactly
   * the bit-pattern the compiler emits @Helium 0x3c4000 (.cold.1). The tiny
   * residual against the canonical 0.181 is preserved verbatim — approximating
   * it to 0.181 would break bit-for-bit parity on inputs near the join.
   *   f64 bit-pattern: 0x3fc72b00be1a1a7d
   */
  static readonly TL: number = 0.18099984438250152;                // @0x3c4000

  /**
   * Lazily-initialized static coefficient: ln(10) / 0.241514, precomputed so
   * the transfer function can call `exp` instead of `pow(10, ...)`.
   *   f64 bit-pattern: 0x402311635b128422
   */
  static readonly CC: number = 9.533961149225494;                  // @0x3c4040

  /** V-Log small-signal offset (numerator in the linear-region formula). @0x3d4b70 */
  static readonly SMALL_OFFSET: number = -0.125;                   // f64 -0.125
  /** V-Log small-signal denominator. @0x3d4b78 */
  static readonly SMALL_SLOPE: number = 5.6;                       // f64 5.6
  /** V-Log large-signal offset "c" (spec value 0.598206), applied as +(-c). @0x3d4b60 */
  static readonly LARGE_OFFSET: number = -0.598206;                // f64 -0.598206
  /** V-Log large-signal offset "d" (spec value 0.00873), applied as +(-d). @0x3d4b68 */
  static readonly LARGE_D: number = -0.00873;                      // f64 -0.00873
  /** Post-normalization divisor. @0x3d0e50 */
  static readonly NORM: number = 0.9;                              // f64 0.9

  /**
   * HGPanasonicVLogLinearizationLUTInfo::HGPanasonicVLogLinearizationLUTInfo(...)
   *   @0x114350
   *
   * Delegates to the HGApplyNDLUTInfo base ctor with numDims forced to 1
   * (@0x11435b `movl $1, %edx`). Then installs this class's vtable pointer at
   * offset 0x00 (@0x114365 `leaq 0x908a6c(%rip),%rax` -> @0x11436c
   * `movq %rax, (%rbx)`). No further field writes.
   */
  constructor(
    numBins: number,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
  ) {
    // @0x114360 callq HGApplyNDLUTInfo::HGApplyNDLUTInfo(numBins, 1, rangeScale, rangeOffset, storage)
    super(numBins, 1, rangeScale, rangeOffset, storage);
    // @0x114365 vtable install — JS prototype chain models this via `extends`.
  }

  /**
   * HGPanasonicVLogLinearizationLUTInfo::isEqual(HGLUTCache::LUTInfo* other) const
   *   @0x114380
   *
   * Returns false if `other` is null (@0x114386 testq %rsi,%rsi; je return 0)
   * or if a dynamic_cast<HGPanasonicVLogLinearizationLUTInfo*>(other) fails
   * (@0x114395-@0x1143a4). Otherwise tail-calls into the base
   * `HGApplyNDLUTInfo::isEqual` with the successfully-cast pointer.
   *
   * At the port level this collapses to: same-runtime-class check +
   * base-class field equality (numBins, numDims, |rangeScale-other.rangeScale|<eps,
   * |rangeOffset-other.rangeOffset|<eps, storage).
   */
  override isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @0x114386 testq %rsi,%rsi ; @0x114389 je return-0
    if (other === null || other === undefined) return false;
    // @0x114395-@0x1143a4 ___dynamic_cast to HGPanasonicVLogLinearizationLUTInfo* —
    // if it fails, return 0.
    if (!(other instanceof HGPanasonicVLogLinearizationLUTInfo)) return false;
    // @0x1143ba jmp HGApplyNDLUTInfo::isEqual — delegate to base structural check.
    return super.isEqual(other);
  }

  /**
   * HGPanasonicVLogLinearizationLUTInfo::duplicate() const   @0x1159b0
   *
   * Raw structural clone: ::operator new(0x28), memcpy fields [0x08..0x27]
   * from `this`, install the vptr, return. Does NOT invoke a ctor.
   * In the port model we materialize a new instance with the same base-class
   * state — HGApplyNDLUTInfo exposes numBins/numDims/rangeScale/rangeOffset/
   * storage as public/accessor-visible fields (see HGApplyNDLUTInfo.ts's
   * getters @0x3d620..@0x3d660). numDims is forced to 1 by our ctor but the
   * source `this` already has numDims=1, so passing it through preserves it.
   */
  duplicate(): HGPanasonicVLogLinearizationLUTInfo {
    // @0x1159be callq ::operator new(0x28)
    // @0x1159c3-@0x1159cf memcpy [0x08..0x27] from `this`
    // @0x1159d3 install vtable pointer
    return new HGPanasonicVLogLinearizationLUTInfo(
      this.getNumBins(),
      this.getRangeScale(),
      this.getRangeOffset(),
      this.getLUTStorageFormat(),
    );
  }

  /**
   * HGPanasonicVLogLinearizationLUTInfo::colorAtIndex(
   *   float x, float y, float z, float* r, float* g, float* b, float* a) const
   *   @0x1143d0
   *
   * Faithful branch-for-branch transcription of the disasm. Only `x` is
   * consumed (@0x1143eb `movaps %xmm0, %xmm2` copies the first f32 arg into
   * xmm2; y and z are never read again). The transfer function is Panasonic
   * V-Log inverse:
   *
   *   Input clamps:
   *     x < 0   -> X = 0.0                 (jbe @0x11440d NOT-taken path
   *                                          leads here after guard-init)
   *     x > 1   -> X = 1.0                 (movsd 1.0d @0x114468)
   *     else    -> X = (f64)x              (cvtss2sd @0x1144c9)
   *
   *   Piecewise:
   *     X < TL(0.181):
   *        linear = (X + SMALL_OFFSET) / SMALL_SLOPE
   *               = (X - 0.125) / 5.6                    // @0x114419 addsd; @0x114421 divsd
   *     X >= TL:
   *        linear = exp((X + LARGE_OFFSET) * CC) + LARGE_D
   *               = 10^((X - 0.598206) / 0.241514) - 0.00873   // @0x11447a..0x114497
   *   Both branches converge at @0x114497:
   *     linear = linear / NORM(0.9)                       // @0x114497 divsd
   *
   *   Broadcast (@0x1144a3-@0x1144b3):
   *     *r = *g = *b = (f32)linear
   *     *a = 1.0f
   *
   * Returns void.
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
    // The disasm relies on tl/cc being lazily static-initialized at first
    // call; that's a Cold-branch guard-variable dance the port folds into
    // the module-level constants above (identical bit-values).

    // Determine X:f64 after clamping (asm: two nested ucomiss on x vs 0.0f then
    // vs 1.0f — @0x11440a and @0x11445f).
    let X: number;
    if (x < 0) {                                                   // @0x11440a jbe fires when x>=0; fall-through is x<0
      X = 0;                                                       // xmm0 was xored to 0.0d @0x114404, used as input
    } else if (x > 1) {                                            // @0x114466 jbe fires when x<=1; fall-through is x>1
      X = 1;                                                       // @0x114468 movsd 1.0d
    } else {                                                       // @0x1144c6 fall-through: 0<=x<=1
      X = Math.fround(x);                                          // @0x1144c9 cvtss2sd — promote f32 -> f64
      // Note: cvtss2sd is exact; wrapping x in Math.fround preserves the
      // upstream single-precision quantization that the caller's arg passing
      // already implies (this method's signature is float).
    }

    // Piecewise transfer function.
    let linear: number;
    if (X < HGPanasonicVLogLinearizationLUTInfo.TL) {
      // Small-signal linear branch — @0x114419 addsd -0.125 ; @0x114421 divsd 5.6
      linear =
        (X + HGPanasonicVLogLinearizationLUTInfo.SMALL_OFFSET) /
        HGPanasonicVLogLinearizationLUTInfo.SMALL_SLOPE;
    } else {
      // Large-signal exp branch — @0x11447a addsd -0.598206 ; @0x114482 mulsd cc ;
      //                            @0x11448a callq exp ; @0x11448f addsd -0.00873
      linear =
        Math.exp(
          (X + HGPanasonicVLogLinearizationLUTInfo.LARGE_OFFSET) *
            HGPanasonicVLogLinearizationLUTInfo.CC,
        ) + HGPanasonicVLogLinearizationLUTInfo.LARGE_D;
    }

    // @0x114497 divsd — both branches converge here for the 0.9 normalization.
    linear = linear / HGPanasonicVLogLinearizationLUTInfo.NORM;

    // @0x11449f cvtsd2ss — collapse to f32 exactly as the disasm does.
    const linearF32 = Math.fround(linear);

    // @0x1144a3-@0x1144ae broadcast to r,g,b.
    r_out[0] = linearF32;
    g_out[0] = linearF32;
    b_out[0] = linearF32;
    // @0x1144b3 movl $0x3f800000, (%rbx) — alpha = 1.0f.
    a_out[0] = Math.fround(1.0);
  }
}
