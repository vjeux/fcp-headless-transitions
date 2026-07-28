// Faithful port of FCP Flexo framework class `Correlation`.
// Framework: Flexo (x86_64). Symbols enumerated from Ozone/Flexo binary at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// Class layout (recovered from ctor @0x12218a0 (C2) / @0x12218d0 (C1)
// and dtor D0Ev @0x12219c0):
//   +0x00  vtable ptr (Correlation VT installed at ctor +0x12218a4..ab; VT at 0x191d640)
//   +0x08  float*  arrA         // freed by dtor if non-null (delete[])
//   +0x10  float*  arrB         // freed by dtor if non-null (delete[])
//   +0x18  float*  arrC         // reserved (zero-initialized; dtor does NOT free — subclass owns)
//   +0x20  float*  arrD         // reserved (zero-initialized; subclass owns)
//   +0x28  float*  crossCorr    // freed by dtor if non-null (delete[])
//   +0x30  int32   peakIndex    // Correlation::getCrossCorrelationPeakIndex() reads this
//   +0x38  float   peakValue    // Correlation::getCrossCorrelationPeakValue() reads this
//   +0x40  void*   statistics   // freed via `free()` (allocated via calloc(N*5, 8))
// Note: Correlation zeros +0x08..+0x30 (three movups) and +0x38, +0x40 (movl / movq) — see ctor.
//       The dtor at D0Ev deletes only 0x8, 0x10, 0x28 (delete[]) and frees 0x40 (free) —
//       0x18, 0x20 are owned by DERIVED classes (e.g. CrossCorrelation and dftPhaseCorrelation
//       both delete their own +0x18/+0x20 in their D2Ev before chaining to the base dtor).

/**
 * Correlation
 *   Abstract base for cross-correlation helpers. Holds work buffers and the
 *   peak-index/value output slots. Ported class-by-class per PORTING_SPEC.
 *
 *   Fully-transcribed methods:  Correlation() ctor @0x12218a0 (C2) / @0x12218d0 (C1),
 *                               ~Correlation() @0x12219c0,
 *                               getStatistics() @0x12246a0,
 *                               getCrossCorrFunction() @0x1222a40,
 *                               getCrossCorrelationPeakIndex() @0x1222a50,
 *                               getCrossCorrelationPeakValue() @0x1222a60.
 *   Deferred to throw-stubs (dense SIMD/vDSP, will land as a follow-up):
 *                               calculateCorrelationCoefficient(...)    @0x12226b0 (206 lines)
 *                               calculatePhaseCorrelationCoefficient(...) @0x1221a20 (503 lines)
 *
 *   Per Rule 3 (throw on undecoded), the two heavy methods throw with their @0xADDR so
 *   frontier.py can see the gap and any caller wiring surfaces the missing decode loudly.
 */
export class Correlation {
  // Fields exactly matching the C++ layout above.
  arrA: Float32Array | null = null;      // +0x08
  arrB: Float32Array | null = null;      // +0x10
  arrC: Float32Array | null = null;      // +0x18 (derived-class owned)
  arrD: Float32Array | null = null;      // +0x20 (derived-class owned)
  crossCorr: Float32Array | null = null; // +0x28
  peakIndex: number = 0;                 // +0x30 (int32)
  peakValue: number = 0;                 // +0x38 (float)
  statistics: Float64Array | null = null; // +0x40 — 5*N entries of 8 bytes (calloc(N*5, 8))

  /**
   * Correlation::Correlation() @0x12218a0 (C2Ev). C1Ev @0x12218d0 is an inline duplicate
   * of the same body (not a thunk — verified byte-for-byte in the disasm listing).
   *
   * @0x12218a4..0x12218ab  — install vtable ptr (VT @0x191d640).
   * @0x12218ae..0x12218b5  — `0x40(this) = 0`  (statistics = null).
   * @0x12218b6..0x12218c1  — xorps xmm0; movups xmm0 to 0x08, 0x18, 0x28 (16-byte zeros × 3 → arrA,arrB,arrC,arrD,crossCorr).
   * @0x12218c5              — `0x38(this) = 0`  (peakValue = 0.0f; peakIndex at +0x30 zeroed via the movups block).
   */
  constructor() {
    // All fields already zero from their initializers above — matches the ctor semantics.
    // (In C++, the movups xmm0 to +0x8/+0x18/+0x28 zero the 6 pointer slots +0x8..+0x30.
    //  Since +0x30 is peakIndex (int32) and +0x38 is peakValue (float) this also zeros peakIndex.)
  }

  /**
   * Correlation::~Correlation() @0x12219c0 (D0Ev — the "deleting" dtor: dtor + `operator delete`).
   * D1Ev/D2Ev share the same body minus the trailing `__ZdlPv` (heap delete of `this`).
   *
   * @0x12219c9..0x12219d0  — reinstall base vtable ptr (`(this) = vt`).
   * @0x12219d3..0x12219dc  — if (arrA != null) delete[] arrA;   (+0x08)
   * @0x12219e1..0x12219ea  — if (arrB != null) delete[] arrB;   (+0x10)
   * @0x12219ef..0x12219f8  — if (crossCorr != null) delete[] crossCorr; (+0x28)
   * @0x12219fd..0x1221a06  — if (statistics != null) free(statistics);   (+0x40)
   * @0x1221a0e..0x1221a14  — operator delete(this)  (only in D0Ev).
   *
   * In TypeScript we model this as an explicit `dispose()` method — JS GC handles the actual
   * heap reclamation; setting the fields to null preserves the observable-null contract that
   * the C++ code establishes for downstream code (in particular, calling calculate*Coefficient
   * again after dispose would call _free on 0x40 first via re-entry).
   */
  dispose(): void {
    // @0x12219d3..fc: null-out (would be delete[] / free in C++). Ordered to match the disasm.
    this.arrA = null;
    this.arrB = null;
    this.crossCorr = null;
    this.statistics = null;
    // arrC (+0x18) and arrD (+0x20) are owned by the derived class dtor; we do NOT touch them
    // here — mirroring the C++ base dtor.
  }

  /**
   * Correlation::getStatistics() @0x12246a0.
   * Body: prologue + `retq`. Returns... nothing on the C++ ABI level (no `movq 0x40(%rdi),%rax`
   * — literally no load of any field). The signature in the demangled symbol is `()` (no return
   * type shown); given the empty body, the C++ header must declare it as `void` (or as a
   * function whose return value is discarded). We port as `void` to preserve the fact that
   * this function reads NOTHING and returns NOTHING — a stub in the Apple build.
   */
  getStatistics(): void {
    // @0x12246a0..0x12246a5 : pushq %rbp / movq %rsp,%rbp / popq %rbp / retq — no-op.
  }

  /**
   * Correlation::getCrossCorrFunction() @0x1222a40.
   * @0x1222a44 : movq 0x28(%rdi), %rax   →   return crossCorr;
   */
  getCrossCorrFunction(): Float32Array | null {
    return this.crossCorr;
  }

  /**
   * Correlation::getCrossCorrelationPeakIndex() @0x1222a50.
   * @0x1222a54 : movl 0x30(%rdi), %eax   →   return peakIndex;   (int32)
   */
  getCrossCorrelationPeakIndex(): number {
    return this.peakIndex | 0; // preserve int32 truncation
  }

  /**
   * Correlation::getCrossCorrelationPeakValue() @0x1222a60.
   * @0x1222a64 : movss 0x38(%rdi), %xmm0  →   return peakValue;   (float32)
   */
  getCrossCorrelationPeakValue(): number {
    return Math.fround(this.peakValue);
  }

  /**
   * Correlation::calculateCorrelationCoefficient(float const* x, float const* y, int N, int M)
   *   @0x12226b0  (206 disasm lines).
   *
   * Behaviour recovered from the head of the body (see raw-port/re/disasm/
   * Flexo.Correlation.calculateCorrelationCoefficient.s):
   *   @0x12226d1..d8   :  if (this->statistics) free(this->statistics)
   *   @0x12226df..f0   :  this->statistics = calloc(5*M, 8)             // 5 doubles per bin
   *   @0x12226f4..2a2a :  dense SSE2 O(N*M) two-pass mean/variance/covariance loop
   *                       computing Pearson correlation coefficients into `statistics[5*k + i]`.
   * The 5-wide record per output bin, the divpd/mulpd/sqrtpd sequence, and the divide-by-N
   * normalization are all present but not yet byte-for-byte transcribed. Landing this method
   * requires a careful pass through the SIMD blocks (a few dozen `movsd/mulsd/addsd`
   * groupings with careful index arithmetic on r8/r9/r10/r11/r14/r15).
   */
  calculateCorrelationCoefficient(
    _x: Float32Array, _y: Float32Array, _N: number, _M: number,
  ): void {
    throw new Error(
      "Correlation::calculateCorrelationCoefficient @0x12226b0 not yet transcribed",
    );
  }

  /**
   * Correlation::calculatePhaseCorrelationCoefficient(float const* x, float const* y, int N, int M)
   *   @0x1221a20  (503 disasm lines — the largest method in the class).
   *
   * Head of body (raw-port/re/disasm/Flexo.Correlation.calculatePhaseCorrelationCoefficient.s):
   *   @0x1221a48..1a4f :  if (this->statistics) free(this->statistics)
   *   @0x1221a56..1a70 :  this->statistics = calloc(M, 8)
   *   @0x1221a74..2260 :  massive SSE2 loop that (a) computes a DFT-domain phase correlation
   *                       between windows of x and y (b) accumulates 1 double per output bin
   *                       into `statistics[k]`. Includes several `___sincos_stret` callsites
   *                       (like dftPhaseCorrelation) and a `_sqrt`/`_fabs` chain.
   * Very dense; deferred to follow-up per Rule 3.
   */
  calculatePhaseCorrelationCoefficient(
    _x: Float32Array, _y: Float32Array, _N: number, _M: number,
  ): void {
    throw new Error(
      "Correlation::calculatePhaseCorrelationCoefficient @0x1221a20 not yet transcribed",
    );
  }
}

