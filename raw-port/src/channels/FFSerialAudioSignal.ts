// FFSerialAudioSignal.ts — FCP Flexo FFSerialAudioSignal. A "serial" container
// audio signal: chains a std::vector of child FFAudioSignal* end-to-end. The
// container's own `period` (@+0x08) is the SUM of the children's periods (each
// child's period is at child->8, loaded as a `unsigned long long` via the
// classic u64→double idiom, summed as double, cast back to u64).
// `processSamples` walks the child vector and dispatches each child's
// vtable-slot +0x20 (renderChunk/processSamples) to fill segments of the caller
// output buffer, in order, until either the buffer is full or the vector is
// exhausted.
//
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly (dumped via raw-port/tools/disasm.sh + x86_64 slice scavenge):
//   raw-port/re/disasm/Flexo.FFSerialAudioSignal.C2.s                   (@0x1258580, D-ctor C2 = base ctor)
//   raw-port/re/disasm/Flexo.FFSerialAudioSignal.FFSerialAudioSignal.s  (@0x1258620, complete-object ctor C1)
//   raw-port/re/disasm/Flexo.FFSerialAudioSignal.copySignal.s           (@0x12586c0, copySignal() const)
//   raw-port/re/disasm/Flexo.FFSerialAudioSignal.processSamples.s       (@0x1258880, processSamples(float*,u64,u64) const)
//   raw-port/re/disasm/Flexo.FFSerialAudioSignal.D1.s                   (@0x12591d0, base destructor D1)
//   raw-port/re/disasm/Flexo.FFSerialAudioSignal.~FFSerialAudioSignal.s (@0x1259240, deleting destructor D0)
//
// SYMBOLS (nm on Flexo, /tmp/Flexo_nm_full.txt):
//   T __ZN19FFSerialAudioSignalC1ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership @0x1258620
//   T __ZN19FFSerialAudioSignalC2ERKNSt3__16vectorIP13FFAudioSignalNS0_9allocatorIS3_EEEE27FFAudioSignalInputOwnership @0x1258580
//   t __ZN19FFSerialAudioSignalD0Ev                                                        @0x1259240
//   t __ZN19FFSerialAudioSignalD1Ev                                                        @0x12591d0
//   T __ZNK19FFSerialAudioSignal10copySignalEv                                             @0x12586c0
//   T __ZNK19FFSerialAudioSignal14processSamplesEPfyy                                      @0x1258880
//   S __ZTV19FFSerialAudioSignal                                                            @0x1921928
//   S __ZTI19FFSerialAudioSignal                                                            @0x1921a08
//   S __ZTS19FFSerialAudioSignal                                                            @0x1583540
//
// STRUCT LAYOUT (recovered from C1/C2/copySignal/processSamples/~D1/~D0 field accesses):
//   +0x00  vtable*     vtbl               // installed at @0x1258599 (C2) / @0x1258639 (C1) /
//                                          //   @0x1258701 (base early during copySignal) /
//                                          //   @0x125877b (derived, after copySignals()) /
//                                          //   @0x12591da (D1) / @0x125924a (D0). vtbl = 0x1921938
//                                          //   (i.e. __ZTV19FFSerialAudioSignal + 0x10, skipping
//                                          //   typeinfo/offset-to-top).
//   +0x08  uint64      period             // container-total cycle length. Written at
//                                          //   @0x12586ab (C1) / @0x125860b (C2) / @0x12587fc
//                                          //   (copySignal). Sum of child->period values.
//   +0x10  ...                             // (fields at +0x10 are inherited from
//                                          //   FFContainerAudioSignal — not decoded in these six
//                                          //   methods; the vector triple lives at +0x20/+0x28/+0x30)
//   +0x20  FFAudioSignal**  vec_begin     // read at @0x1258895 (processSamples) / @0x1259254 (D0) /
//                                          //   @0x12591e4 (D1). std::vector<FFAudioSignal*>.__begin_
//   +0x28  FFAudioSignal**  vec_end       // read at @0x1258899 / @0x1259258 / @0x12591e8. .__end_
//   +0x30  FFAudioSignal**  vec_cap_end   // written zero at @0x1258709 (copySignal). .__end_cap_
//
// PARENT (frontier — NOT yet ported):
//   FFContainerAudioSignal — base class. Called from:
//     * @0x125858d (C2) __ZN22FFContainerAudioSignalC2ERK...FFAudioSignalInputOwnership
//     * @0x125862d (C1) same symbol (C1 delegates to base C2 too — flat inheritance)
//     * @0x12586e8 (copySignal) __ZNK22FFContainerAudioSignal11copySignalsEv
//   Its C2 is what installs +0x20/+0x28/+0x30 as the input vector (or its copy).
//   The D1/D0 destructors here run only per-derived cleanup (release the vector's
//   FFAudioSignal* elements via virtual dtor slot +0x8 and delete the array
//   allocation) before falling through — see below.
//
// VTABLE (partial — from indirect calls in this class's methods):
//   +0x20  void ()(FFAudioSignal*, float* dst, uint64 phase, uint64 nSamples)
//          — renderChunk / processSamples primitive. Invoked at @0x12588ed
//          (processSamples): `callq *0x20(%rax)` where %rax = child->vtbl.
//   +0x08  void ()(FFAudioSignal*)  — element virtual destructor slot. Invoked at
//          @0x1259294 (D0) / @0x1259224 (D1) / @0x1258839 (copySignal cleanup path):
//          `callq *0x8(%rax)`.
//
// CONSTANT PROVENANCE (RIP-relative reads — recovered via
//   effective-addr = next_insn + displacement):
//   @0x125864c movsd  0x31448c(%rip),%xmm1  -> 0x156cae0  u64 0x4530000043300000
//   @0x1258654 movapd 0x314494(%rip),%xmm2  -> 0x156caf0  128-bit bias pair
//                                                          {double 0x4330000000000000,
//                                                           double 0x4530000000000000}
//   @0x1258694 subsd  0x31442c(%rip),%xmm0  -> 0x156cac8  double 0x43e0000000000000
//                                                         (= 9.223372036854776e+18 = 2^63)
//   @0x12585ac / @0x12585b4 / @0x12585f4 in C2 — SAME three constants at the
//   same absolute addresses (different displacements because next_insn differs).
//   @0x1258782 / @0x125878a / @0x12587d4 in copySignal — SAME three constants.
//   @0x1258632 leaq 0x6c92ff(%rip),%rax    -> 0x1921938   vtable-for-FFSerialAudioSignal + 0x10
//   @0x1258592 leaq 0x6c939f(%rip),%rax    -> 0x1921938   (same, from C2)
//   @0x12586fa leaq 0x6c91ff(%rip),%rax    -> 0x1921900   vtable-for-FFContainerAudioSignal + 0x10
//                                                          (installed early during copySignal so
//                                                          the object is safely destructible if
//                                                          FFContainerAudioSignal::copySignals()
//                                                          throws — the derived vtable is put in
//                                                          at @0x125877b once the vector is
//                                                          fully-initialized.)
//   @0x12587e9 leaq 0x6c9148(%rip),%rax    -> 0x1921938   (final vtable when input was empty)
//   @0x12591da leaq 0x6c871f(%rip),%rax    -> 0x1921900   base vtable (D1 sets while unwinding)
//   @0x125924a leaq 0x6c86af(%rip),%rax    -> 0x1921900   base vtable (D0 sets while unwinding)
//
// NUMERIC CONTRACT — the u64→double conversion (compiled from `unsigned long long`
// double-conversion emitted by LLVM/Clang without SSE4.1):
//   Sequence (per element):
//     movq  (%rax), %rdx                    ; rdx = child pointer
//     movsd 0x8(%rdx), %xmm3                ; xmm3 = child->period as 8 raw bytes
//     unpcklps %xmm1, %xmm3                 ; xmm3.lo = (lo32,0x43300000), xmm3.hi = (hi32,0x45300000)
//     subpd    %xmm2, %xmm3                 ; subtract {2^52, 2^84} bias (unpacks u64 into 2 doubles)
//     movapd %xmm3, %xmm4
//     unpckhpd %xmm3, %xmm4                 ; extract high double lane
//     addsd  %xmm3, %xmm4                   ; xmm4 = low_double + high_double  (= (double)u64_value)
//     addsd  %xmm4, %xmm0                   ; accumulate into sum
//   And final double→u64 cast (LLVM's uint64_t cast idiom for the case where the
//   value MAY exceed 2^63 — cvttsd2si is a signed conversion and would saturate):
//     cvttsd2si %xmm0, %rcx                 ; rcx = (int64)sum  (>= 0 if sum < 2^63, else INT64_MIN)
//     movq  %rcx, %rdx
//     sarq  $0x3f, %rdx                     ; rdx = 0 if sum < 2^63, else -1 (all-ones)
//     subsd 0x3f-const, %xmm0               ; xmm0 -= 2^63
//     cvttsd2si %xmm0, %rax                 ; rax = (int64)(sum - 2^63)
//     andq  %rdx, %rax                      ; rax = (sum>=2^63) ? (int64)(sum-2^63) : 0
//     orq   %rcx, %rax                      ; rax = final u64 (see decode note below)
//   Decode: when sum < 2^63, rcx = truthful truncation, rax = 0, result = rcx.
//           when sum >= 2^63, rcx = INT64_MIN (0x8000_0000_0000_0000), rdx = -1,
//                              rax = (int64)(sum - 2^63) (nonneg, ≤ 2^63-1),
//                              rax|rcx = 0x8000_… | rax_low63 = full u64.
//
// In TypeScript we accumulate as `number` (double); the JS `BigInt(Math.trunc(sum))`
// cast reproduces the same u64 value provided sum stays representable in double.
// This is a direct TS mapping of the native SSE u64→double sequence.

/**
 * FFAudioSignal — parent-class marker interface for children stored in the
 * container's std::vector<FFAudioSignal*>. We do NOT import the ported
 * FFAudioSignal class directly here because the native binary treats each
 * element strictly through its vtable (offset +0x08 = period; vtable slot
 * +0x20 = renderChunk). Any concrete subclass port that has been landed on
 * `FFAudioSignal` in raw-port/src/channels/FFAudioSignal.ts satisfies this
 * shape. Kept as an interface to avoid circular import churn — see
 * raw-port/src/channels/FFAudioSignal.ts for the concrete base.
 */
export interface FFSerialAudioSignalChild {
  /**
   * Struct field @+0x08 — u64 period. Read at @0x1258663 (C1), @0x12585c3 (C2),
   * @0x12587a3 (copySignal). Native code loads it via `movsd 0x8(%rdx),%xmm3`
   * as 8 raw bytes and reinterprets them as a `unsigned long long` in the
   * u64→double conversion idiom.
   */
  period: bigint;

  /**
   * Vtable slot +0x20 — renderChunk primitive. Invoked at @0x12588ed
   * `callq *0x20(%rax)`. Writes `nSamples` floats into `dst[0..nSamples)`,
   * starting at phase `phaseWithinCycle` inside this signal's cycle.
   *
   * ABI (recovered):
   *   %rdi = child (this)         — @0x12588c0 movq (%r15),%rdi
   *   %rsi = float* dst           — @0x12588d9/dd rsi = arg1 + written_frames*4
   *   %rdx = phase (u64)          — @0x12588e1/e4 rdx = arg2 - already_consumed
   *   %rcx = nSamples (u64)       — @0x12588ea movq %r13,%rcx
   *   *(vtbl+0x20)                — @0x12588ed callq *0x20(%rax)
   */
  processSamples(dst: Float32Array, dstOffsetFloats: number, phase: bigint, nSamples: bigint): void;
}

/**
 * The `FFAudioSignalInputOwnership` enum is passed by value (as second-arg
 * cdx-slot for the ctor). It flows through into FFContainerAudioSignal C2 at
 * @0x125858d / @0x125862d, and is NOT read by any code in this six-method
 * subset (the derived ctor here only calls the base ctor and then sums periods).
 * The enum is opaque to this class; we keep it as an untyped number to
 * preserve the ABI without inventing semantics.
 */
export type FFAudioSignalInputOwnership = number;

/**
 * FFSerialAudioSignal — derived class. Total period = sum of child periods.
 */
export class FFSerialAudioSignal {
  /** Struct @+0x08 — u64 total period. Written by ctors and copySignal. */
  period: bigint = 0n;

  /**
   * Struct @+0x20/+0x28/+0x30 — std::vector<FFAudioSignal*> triple. In the
   * native binary this lives inside the FFContainerAudioSignal base; we
   * model it as an owned array on the derived class for portability. The
   * exact ownership (per-input `FFAudioSignalInputOwnership`) is decided by
   * the base ctor which is not decoded yet.
   */
  inputs: FFSerialAudioSignalChild[] = [];

  /**
   * @Flexo 0x0000000001258580 FFSerialAudioSignal::FFSerialAudioSignal(
   *   std::vector<FFAudioSignal*> const& inputs, FFAudioSignalInputOwnership own)  [C2 base ctor]
   * @Flexo 0x0000000001258620 FFSerialAudioSignal::FFSerialAudioSignal(...)         [C1 complete ctor]
   *
   * Both ctors are BYTE-IDENTICAL in body (C1 duplicated from C2 by the ABI
   * requirement — they only differ in that C1 is the entry that external
   * callers hit; both invoke the base's C2 at @0x125858d / @0x125862d).
   *
   * Body (C2 @0x1258580; C1 @0x1258620 identical modulo offsets):
   *   1. Call FFContainerAudioSignal::FFContainerAudioSignal(vec, own).
   *      @0x125858d / @0x125862d — this installs the +0x20/28/30 vector fields
   *      (either taking ownership of the same buffer or copying, per `own`).
   *   2. Store the FFSerialAudioSignal vtable at *this = 0x1921938.
   *      @0x1258599 / @0x1258639.
   *   3. Read the raw pointer-range of the caller's argument vector:
   *      rax = (%r14) = vec.__begin_
   *      rcx = 8(%r14) = vec.__end_
   *      (NOTE: the ctor iterates the CALLER's argument vector, not our own
   *       +0x20/28. That's semantically fine — the base ctor either copied the
   *       pointers or moved them, but at this point each child pointer's
   *       address of its `period` field is stable regardless of which
   *       container it lives in.)
   *      @0x125859c/9f (C2), @0x125863c/3f (C1).
   *   4. If rax == rcx (empty), skip the loop; store period = 0.
   *      @0x12585a3/a6 → @0x1258609 (C2); @0x1258643/46 → @0x12586a9 (C1).
   *   5. Otherwise, sum-loop @0x12585c0..e6 / @0x1258660..86:
   *        xmm0 = 0.0                                @0xxxxxxx xorpd
   *        xmm1 = *(0x156cae0) = u64→double magic-hi/lo constant pair
   *        xmm2 = *(0x156caf0) = 128-bit bias-pair {2^52, 2^84}
   *        for each ptr in [vec.__begin_, vec.__end_):
   *          xmm3  = *(ptr + 8)                       (u64 period, raw)
   *          xmm3 := (u64→double)(period)             (via unpcklps+subpd+addsd)
   *          xmm0 += xmm3
   *        rcx  = (int64)xmm0
   *        rdx  = rcx >> 63                          (arith)
   *        xmm0 -= 2^63
   *        rax  = (int64)xmm0
   *        rax  = (rax & rdx) | rcx                  (u64 cast trick)
   *      @0x125858..607 (C2); @0x12585ff..a7 (C1).
   *   6. Store final u64 to this->period at +0x08.
   *      @0x125860b (C2); @0x12586ab (C1).
   *
   * Note: the loop iterates the argument vector directly (r14 = %rsi = &vec).
   * The ctor completes strong-exception-safe: if the base ctor throws, the
   * derived ctor never runs. If the sum arithmetic itself never throws (only
   * ALU on POD values), there is no cleanup path in this method.
   */
  constructor(inputs: readonly FFSerialAudioSignalChild[], _ownership: FFAudioSignalInputOwnership) {
    // @0x125858d / @0x125862d — call FFContainerAudioSignal base ctor
    //   (not yet ported; we simulate its observable effect on this
    //   subclass: install the child-vector fields at +0x20/28/30). See
    //   base-frontier stub call below.
    this.callFFContainerAudioSignalCtor(inputs, _ownership); // @0x125858d / @0x125862d

    // @0x1258592/99 (C2), @0x1258632/39 (C1) — install derived vtable @0x1921938.
    // In TS this is implied by `new FFSerialAudioSignal(...)`.

    // @0x125859c/9f (C2), @0x125863c/3f (C1) — read the CALLER's vector range.
    const vec = inputs; // (r14) points at the caller's vector

    // @0x12585a3/a6 (C2), @0x1258643/46 (C1) — cmpq %rcx,%rax; je empty-branch.
    if (vec.length === 0) {
      // @0x1258609 (C2), @0x12586a9 (C1) — xorl %eax,%eax  →  period = 0.
      this.period = 0n;                                     // @0x125860b / @0x12586ab  movq %rax, 0x8(%rbx)
      return;
    }

    // @0x12585a8 / @0x1258648 — xorpd %xmm0,%xmm0 : sum = 0.0.
    let sum = 0.0;

    // @0x12585c0..e6 / @0x1258660..86 — inner sum loop.
    for (let i = 0; i < vec.length; i++) {
      // @0x12585c0 / @0x1258660 — rdx = vec[i]   (a FFAudioSignal*).
      // @0x12585c3 / @0x1258663 — movsd 0x8(%rdx),%xmm3  : load 8 raw bytes @+0x08 as double bits.
      // @0x12585c8..db / @0x1258668..7b — u64→double via unpcklps+subpd+unpckhpd+addsd.
      //   In TS, `Number(child.period)` produces the same numeric double for any
      //   BigInt value ≤ 2^53, and for values > 2^53 introduces the same rounding
      //   the native double does (a u64 → double conversion is exact only for
      //   values with ≤53 significand bits; the native SSE sequence above ALSO
      //   loses precision beyond 53 bits — its 2-lane split + add reconstitutes
      //   the exact u64 value only up to a double's precision. So `Number` is
      //   the bit-exact model of this SSE idiom for representable inputs, and
      //   both saturate identically past that boundary.)
      const childPeriod = Number(vec[i].period);            // @0x12585c3..db / @0x1258663..7b
      // @0x12585db / @0x125867b — addsd %xmm4,%xmm0 : sum += (double)child->period.
      sum = sum + childPeriod;                              // @0x12585db / @0x125867b
      // @0x12585df / @0x125867f — addq $0x8,%rax  and jne loop back.
    }

    // @0x12585e8..607 / @0x1258688..a7 — double→u64 saturation-safe cast.
    // The native sequence maps to the following in TS (identical branch cutover):
    //   result_u64 = (sum < 2^63) ? BigInt of (int64)trunc(sum)
    //                            : 0x8000_0000_0000_0000n
    //                                | BigInt of (int64)trunc(sum - 2^63);
    // In JS numbers, "sum < 2^63" is the same predicate as native (both are IEEE754 doubles).
    const twoPow63 = 9223372036854775808;                    // *(0x156cac8) = 2^63; used at @0x12585f4/@0x1258694
    let u64: bigint;
    if (sum < twoPow63) {
      // Native: cvttsd2si→rcx = trunc(sum) as signed; rdx = rcx>>63 = 0; rax = 0; result = rcx.
      // Both signed truncation and unsigned truncation coincide when 0 <= sum < 2^63.
      u64 = BigInt(Math.trunc(sum));                         // @0x12585e8..607 / @0x1258688..a7
    } else {
      // Native: cvttsd2si→rcx = INT64_MIN = 0x8000_0000_0000_0000; rdx = -1 (all-ones);
      //         xmm0 -= 2^63; rax = trunc(xmm0) (nonneg, < 2^63); result = rcx | (rax & rdx) = rcx | rax.
      const low63 = BigInt(Math.trunc(sum - twoPow63));      // @0x12585f4..fc / @0x1258694..9c
      u64 = 0x8000000000000000n | (low63 & 0x7FFFFFFFFFFFFFFFn);
    }
    // @0x125860b / @0x12586ab — movq %rax, 0x8(%rbx) : this->period = u64.
    this.period = u64;
  }

  /**
   * Base class ctor frontier — FFContainerAudioSignal::FFContainerAudioSignal(vec, own).
   * @0x125858d (from C2) / @0x125862d (from C1). Not yet ported. In the native
   * code this installs the child-vector at +0x20/+0x28/+0x30 (either by moving
   * pointers, or by copying — the `FFAudioSignalInputOwnership` argument
   * decides). For portability we model the observable minimum: assign
   * `this.inputs` to a shallow copy of the caller's vector. This is
   * BEHAVIORALLY CORRECT for the observable subset used by processSamples()
   * and the destructors in this file (they only iterate the vector); it is
   * NOT a decode of the ownership semantics.
   *
   * When FFContainerAudioSignal is ported, this method should be REPLACED
   * with a direct call to the ported ctor. Marked as a bounded stub with an
   * @0xADDR reference so downstream porters see the demand signal.
   */
  private callFFContainerAudioSignalCtor(inputs: readonly FFSerialAudioSignalChild[], _own: FFAudioSignalInputOwnership): void { // @0x125858d / @0x125862d
    // The vector-triple install is the ONLY observable effect this file relies
    // upon; ownership decoding is deferred to FFContainerAudioSignal's port.
    this.inputs = inputs.slice();
  }

  /**
   * @Flexo 0x00000000012586c0 FFSerialAudioSignal::copySignal() const
   *   __ZNK19FFSerialAudioSignal10copySignalEv
   *
   * Allocates a new FFSerialAudioSignal (sizeof=0x38), clones the child vector
   * via FFContainerAudioSignal::copySignals(), stores the base vtable
   * (0x1921900) temporarily, then either (a) if the copied vector is non-empty:
   * allocates a new pointer-array, memcpy's the pointers, checks each pointer
   * is non-null (calls their virtual dtor slot +0x8 for those that ARE
   * cleanup-required in the exception path), then installs the derived vtable
   * (0x1921938), sums the periods (same u64→double idiom as the ctor), and
   * writes the sum to +0x08; or (b) if the copied vector is empty: installs
   * derived vtable (0x1921938) via the empty-branch and writes period = 0.
   * Finally frees the temporary source-array allocation via operator delete.
   *
   * Body (@0x12586c0..81a):
   *   1. @0x12586d4  edi = 0x38  ; callq operator new (0x1497452)
   *      -> rax = new instance (size 0x38).
   *   2. @0x12586e1..e8  copySignals() into a stack std::vector at [rbp-0x48].
   *   3. @0x12586ed..09  zero-init clone at rbx: field10=0, field18=0, vector[0x20..30]=0,
   *      vtable (base) = 0x1921900.
   *   4. @0x1258711..15  load srcPtr, srcEnd of the stack vector.
   *      r15 = srcEnd - srcBegin (size in bytes).
   *   5. @0x125871f  if size == 0, jump to the empty branch @0x12587e9.
   *   6. @0x1258725/29  test the pointer for MSB-set (js) → __throw_length_error
   *      (@0x125883e). This is the vector's max-size overflow test — irrelevant to
   *      portability as JS arrays have no such constraint.
   *   7. @0x125872f..37  operator new (r15 bytes) -> new pointer-array; store into
   *      clone->+0x20 (begin).
   *   8. @0x125873a..44  clone->+0x30 (cap_end) = begin + r15.
   *   9. @0x1258748..52  memcpy(begin, srcBegin, r15).
   *   10. @0x1258757     clone->+0x28 (end) = begin + r15.
   *   11. @0x125875b..72 scan the copied pointer-array; if ANY entry is null,
   *       branch to the null-cleanup path @0x125881b (which then calls each
   *       non-null entry's virtual dtor slot +0x8 @0x1258839). This is the
   *       exception-safe rollback path for a partially-constructed vector; when
   *       there are NO nulls (the fast path), no rollback happens.
   *
   *       (Read carefully: the loop advances rax by 8 as long as the current
   *       slot is non-null; when it exits the loop cleanly (rax==r15), the
   *       code falls THROUGH to the derived-vtable install @0x1258774. When
   *       a null is seen mid-scan (jumps to @0x125881b), the code walks
   *       the remainder and calls dtor-slot-8 on every remaining non-null,
   *       then rejoins the derived-vtable install path.
   *       So the null-scan is BOTH a guard AND a call-through for what looks
   *       like sub-object destruction on partially-null vectors — the exact
   *       semantics of a partially-null container are opaque to us but the
   *       branch structure is faithfully mirrored below.)
   *
   *   12. @0x1258774..7b  install derived vtable (0x1921938).
   *   13. @0x125877e..c8  same period-sum loop as the ctor (three constants
   *       0x156cae0/0x156caf0 for u64→double, then double→u64 with 0x156cac8 = 2^63).
   *   14. @0x12587f5..fc  store sum to clone->+0x08.
   *   15. @0x12587e9..f3  empty-branch: install derived vtable, period=0.
   *   16. @0x12587ff..09  if srcBegin != null, call operator delete (0x1497404)
   *       to release the stack vector's owning allocation. (Its .__begin_ was
   *       stored to -0x30(%rbp) at @0x1258725; here rdi = that pointer, freed.)
   *   17. @0x1258809     rax = clone; return.
   *
   * The `catch` handlers @0x1258845 and @0x1258858 are unwind-only paths (delete
   * clone; resume). We don't model exceptions in TS — the equivalent is that
   * an exception thrown by any inner call bubbles up while `clone` is unreferenced
   * (GC reclaims it).
   */
  copySignal(): FFSerialAudioSignal {                       // @0x00000000012586c0
    // @0x12586d4/d9  edi=0x38; call __Znwm. In TS we allocate via `Object.create` +
    //   defer field init below; the sizeof=0x38 (7×u64) matches struct layout:
    //   +0x00 vtbl (u64) +0x08 period (u64) +0x10..0x18 base fields (2 u64) +
    //   +0x20..0x30 vector triple (3 u64). See STRUCT LAYOUT block above.
    const clone = Object.create(FFSerialAudioSignal.prototype) as FFSerialAudioSignal; // @0x12586d9

    // @0x12586e1..e8  callq __ZNK22FFContainerAudioSignal11copySignalsEv
    //   FRONTIER — see stub below.
    const clonedChildren = this.callFFContainerAudioSignalCopySignals(); // @0x12586e8

    // @0x12586ed..f6  zero-init the +0x10/+0x18 base-class fields (movupd of xmm0 = 0.0,
    //   then movb $0 at 0x18). We don't model these fields; the derived clone will
    //   receive its child-vector below.
    // @0x12586fa/01  install BASE vtable temporarily (0x1921900) — irrelevant in TS
    //   (prototype linkage is fixed at Object.create above).
    // @0x1258704..09  clone->+0x20..+0x30 = {0,0,0}. In TS we set inputs below.

    // @0x1258711/15  srcBegin = clonedChildren.__begin_; srcEnd = clonedChildren.__end_.
    //   In TS the returned array carries its own length.
    const src = clonedChildren;
    // @0x1258719..1f  r15 = srcEnd - srcBegin (size in bytes = 8 × count).
    //   size==0 branch @0x12587e9.

    if (src.length === 0) {
      // @0x12587e9..f3  empty-branch: install derived vtable + period = 0.
      clone.inputs = [];                                    // @0x12587e9/f3
      clone.period = 0n;                                    // @0x12587f5..fc
    } else {
      // @0x1258729  js __throw_length_error — vector max-size overflow; N/A in TS.

      // @0x125872f..37  operator new (r15 bytes) — new pointer-array.
      // @0x125873a..44  clone->+0x20 = new_ptr; +0x30 = new_ptr + r15.
      // @0x1258748..52  memcpy — shallow copy of the FFAudioSignal* pointers.
      // @0x1258757     clone->+0x28 = new_ptr + r15.
      clone.inputs = src.slice();                            // @0x1258748..57

      // @0x125875b..72  null-scan loop.
      //   for (rax = 0; rax != r15; rax += 8) if ((r12,rax) == 0) goto @0x125881b
      //   Fast path: no nulls -> fall through to derived-vtable install.
      //   Slow path @0x125881b..3c: walk remaining entries, and for each non-null
      //     entry call *(vtbl+0x8) — the element's virtual dtor slot.
      // In TS we mirror the branch: if any null present, invoke the same dtor
      //   slot on the non-null tail — with the caveat that we cannot resolve
      //   the dtor without vtable-8; children satisfying FFSerialAudioSignalChild
      //   don't expose a dtor here. Faithful behavior is to leave those to GC
      //   AND note that the presence of nulls is itself a signal from the base's
      //   copy path — which we defer to the base porter.
      let hasNull = false;
      for (let i = 0; i < clone.inputs.length; i++) {       // @0x1258760..72
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if ((clone.inputs as unknown as (FFSerialAudioSignalChild | null)[])[i] === null) {
          hasNull = true;
          break;
        }
      }
      if (hasNull) {
        // @0x125881b..3c  walk tail; call *(vtbl+0x8) on each non-null (i.e. the
        //   element's virtual destructor). We don't model per-element destructors
        //   in TS (GC replaces them); the branch is documented and the code
        //   proceeds identically to the fast path @0x1258774 afterwards.
        // (No frontier throw here: this branch is a cleanup that already ran in
        //  the native binary; in TS the same array is retained and GC'd.)
      }

      // @0x1258774..7b  install DERIVED vtable (0x1921938). Implied by
      //   Object.create(FFSerialAudioSignal.prototype) above.

      // @0x125877e..c8  period-sum loop (same as ctor).
      let sum = 0.0;                                         // @0x125877e xorpd
      for (let i = 0; i < src.length; i++) {                 // @0x1258796..c6
        // @0x12587a0..bb  same u64→double via SSE idiom; Number(bigint) is the
        //   bit-exact model of this SSE sequence for representable inputs (see
        //   NUMERIC CONTRACT block at file head).
        sum = sum + Number(src[i].period);                   // @0x12587a3..bb
      }
      // @0x12587c8..e7  double→u64 saturating cast (identical to ctor).
      const twoPow63 = 9223372036854775808;                  // *(0x156cac8)  @0x12587d4
      let u64: bigint;
      if (sum < twoPow63) {
        u64 = BigInt(Math.trunc(sum));                       // @0x12587c8..cd
      } else {
        const low63 = BigInt(Math.trunc(sum - twoPow63));    // @0x12587d4..dc
        u64 = 0x8000000000000000n | (low63 & 0x7FFFFFFFFFFFFFFFn);
      }
      // @0x12587f5..fc  clone->+0x08 = u64.
      clone.period = u64;
    }

    // @0x12587ff..09  if srcBegin != null, call operator delete on the stack
    //   vector's underlying allocation. In TS this is GC; no-op.

    // @0x1258809  return clone.
    return clone;
  }

  /**
   * Base copy frontier — FFContainerAudioSignal::copySignals() const @0x12586e8.
   * Not yet ported. In the native code this walks the base's child-vector and
   * produces a std::vector<FFAudioSignal*> of clones (per each child's own
   * `copySignal()` — vtable-driven). Faithful minimum: each child element is
   * assumed to expose its own clone via its already-ported class. For the
   * observable subset used by this file we clone the pointers only (a shallow
   * copy sufficient to sum periods and iterate for processSamples). The full
   * decode is deferred to FFContainerAudioSignal.
   */
  private callFFContainerAudioSignalCopySignals(): FFSerialAudioSignalChild[] { // @0x12586e8
    return this.inputs.slice();
  }

  /**
   * @Flexo 0x0000000001258880  FFSerialAudioSignal::processSamples(
   *     float* dst, unsigned long long dstOffset, unsigned long long dstLenFrames) const
   *   __ZNK19FFSerialAudioSignal14processSamplesEPfyy
   *
   * Renders `dstLenFrames` samples into `dst[0..dstLenFrames)` by walking the
   * child vector in order, calling each child's `processSamples`
   * (vtable-slot +0x20) to cover contiguous segments of the output buffer.
   *
   * ABI (recovered from prolog + epilog):
   *   %rdi = this           (@0x125888a savq %rdi,%rbx)
   *   %rsi = dst (float*)   (@0x1258891 savq %rsi,-0x40(%rbp))
   *   %rdx = arg2 = dstOffset  (@0x125889f movq %rdx,%r12)
   *   %rcx = arg3 = dstLenFrames  (@0x12588ae movq %rcx,-0x30(%rbp))
   *
   * The two `unsigned long long` args (dstOffset / dstLenFrames) form a
   * cursor: `dstOffset` is the ABSOLUTE cycle-phase at which the caller wants
   * rendering to begin; `dstLenFrames` is the count. As we consume each
   * child, we advance `dstOffset` past that child's end.
   *
   * Body (@0x1258880..0x125891e):
   *   1. @0x1258895/99  r15 = this->+0x20 (vec_begin); cmpq this->+0x28 (vec_end).
   *      If empty: skip everything, ret.
   *   2. @0x125889f     r12 = dstOffset; r14 = 0 (written_frames); rax = 0
   *      (cumulative child-period offset).
   *   3. LOOP @0x12588c0..0x125890e — per-child:
   *        @0x12588c0     rdi = *r15  = child pointer.
   *        @0x12588c3     rbx = child->+0x08 = child->period.
   *        @0x12588c7     rbx += rax  → rbx = END absolute position of this child.
   *        @0x12588ca/cd  r13 = rbx - r12  = (child_end - current_offset).
   *        @0x12588d0     if r13 <= 0 (jbe) skip this child (r12 already past
   *                       this child's end).
   *        @0x12588d2/d5  r13 = min(r13, rcx = dstLenFrames - written_frames).
   *        @0x12588d9/dd  rsi = dst_arg1 + written_frames*4 (byte offset,
   *                       float-array-index = written_frames).
   *        @0x12588e1/e4  rdx = r12 - rax = child-local phase (offset within
   *                       the current child's cycle).
   *        @0x12588e7     rax = child->vtbl.
   *        @0x12588ea     rcx = r13 = nSamples-this-call.
   *        @0x12588ed     callq *(vtbl+0x20)   — child->processSamples(
   *                                                dst+written*4, phase, r13).
   *        @0x12588f0/f4  reload this (%rsi) + dstLenFrames (%rcx) from stack.
   *        @0x12588f8     r12 += r13  (advance the absolute cursor).
   *        @0x12588fb     r14 += r13  (advance the written_frames counter).
   *      @0x12588fe/01   if r14 >= dstLenFrames (jae): done, exit loop.
   *      @0x1258903      r15 += 8   (next child pointer).
   *      @0x1258907      rax = rbx  (accumulate child_end into per-child base).
   *      @0x125890a/0e   loop back if r15 != this->+0x28.
   *
   * Semantic: caller wants samples [dstOffset .. dstOffset+dstLenFrames)
   * (absolute), each child covers [prevEnd .. prevEnd+child->period).
   * Contiguous concatenation.
   */
  processSamples(dst: Float32Array, dstOffset: bigint, dstLenFrames: bigint): void { // @0x0000000001258880
    // @0x1258895/99  read vector range. In TS this is `this.inputs.length`.
    if (this.inputs.length === 0) return;                    // @0x125889d je 0x1258910

    // @0x125889f/a5/a8  r12 = dstOffset (u64), r14 = 0 (written), rax = 0 (child_base).
    let cursor = dstOffset;                                  // @0x125889f  (r12)
    let writtenFrames = 0n;                                  // @0x12588a5  (r14 = 0)
    let childBase = 0n;                                      // @0x12588a8  (rax = 0)

    // Outer loop @0x12588c0..0e — per child.
    for (let i = 0; i < this.inputs.length; i++) {           // @0x125890a..0e cmpq %r15,%r28
      const child = this.inputs[i];                          // @0x12588c0  rdi = (%r15)

      // @0x12588c3  rbx = child->period (u64).
      const childPeriod = child.period;                      // @0x12588c3
      // @0x12588c7  rbx += rax  → rbx = childEnd (absolute).
      const childEnd = childBase + childPeriod;              // @0x12588c7

      // @0x12588ca/cd  r13 = childEnd - cursor.
      //   Native uses `subq %r12,%r13` — signed 64-bit subtraction on u64 values;
      //   the follow-on `jbe` checks r13 <= 0 as UNSIGNED (jbe = below-or-equal),
      //   which combined with the fact that `cursor` is always >= childBase
      //   (see cursor-advance below), makes this equivalent to `if (childEnd <= cursor)`.
      // @0x12588d0  jbe skip-this-child  (goes to the cursor / written-check tail
      //   @0x12588fe).
      if (childEnd > cursor) {
        // @0x12588d2/d5  r13 = min(r13, remainingCount).
        //   `cmovaeq %rcx,%r13` — if (r13 >= rcx) r13 = rcx.
        const remaining = dstLenFrames - writtenFrames;
        let nSamples = childEnd - cursor;
        if (nSamples >= remaining) nSamples = remaining;    // @0x12588d5  cmovaeq

        // @0x12588d9/dd  rsi = dst + written * 4  (float* index = written).
        const dstIndex = Number(writtenFrames);              // safe: writtenFrames <= dstLenFrames
        // @0x12588e1/e4  rdx = cursor - childBase  (child-local phase).
        const phaseInChild = cursor - childBase;             // @0x12588e1

        // @0x12588e7  rax = child->vtbl.
        // @0x12588ea  rcx = nSamples.
        // @0x12588ed  callq *(vtbl+0x20) — child->processSamples(dstSubarray, phase, nSamples).
        //   In the native ABI: dst is a raw float*, and rsi = dst + written*4.
        //   In TS we pass the same underlying Float32Array with a starting index.
        child.processSamples(dst, dstIndex, phaseInChild, nSamples); // @0x12588ed  callq *0x20(%rax)

        // @0x12588f0/f4  reload rsi=this, rcx=dstLenFrames.
        // @0x12588f8     cursor += nSamples.
        cursor = cursor + nSamples;                           // @0x12588f8  addq %r13,%r12
        // @0x12588fb     writtenFrames += nSamples.
        writtenFrames = writtenFrames + nSamples;             // @0x12588fb  addq %r13,%r14
      }

      // @0x12588fe/01  if writtenFrames >= dstLenFrames: done.
      if (writtenFrames >= dstLenFrames) return;              // @0x12588fe/01  jae 0x1258910
      // @0x1258903  r15 += 8 (next child).
      // @0x1258907  rax = rbx (childBase = childEnd — accumulates for the NEXT iter).
      childBase = childEnd;                                   // @0x1258907  movq %rbx,%rax
    }
    // @0x1258910  epilogue.
  }

  /**
   * @Flexo 0x00000000012591d0  FFSerialAudioSignal::~FFSerialAudioSignal()  [D1 = base dtor]
   *
   * Body @0x12591d0..3a:
   *   1. @0x12591da/e1  install BASE vtable (0x1921900) — the standard C++ ABI
   *      "unwind to base as sub-objects destruct" pattern.
   *   2. @0x12591e4/e8  load vec_begin (r14 = %rdi+0x20), vec_end (rax = %rdi+0x28).
   *   3. @0x12591ec/ef  if begin == end: skip element loop (@0x1259236 pop+ret).
   *   4. Otherwise, at @0x1259219 (loop entry via the jne):
   *        for (r14 = begin; r14 != end; r14 += 8):
   *          rdi = *r14
   *          if (rdi == 0) continue                     @0x125921c/1f
   *          rax = rdi->vtbl                            @0x1259221
   *          callq *(vtbl+0x8)                          @0x1259224  — element's virtual dtor
   *          rax = this->+0x28 (reload end — may have changed)  @0x1259227
   *      @0x125922b  jmp loop-top (r14 += 8)
   *   5. @0x125922d..34  post-loop: r14 = this->+0x20 (begin); if non-null branch
   *      to @0x12591f6 which stores begin as end (this->+0x28 = begin) and calls
   *      operator delete(begin) — freeing the pointer-array allocation.
   *   6. @0x1259236..3a  pop, ret.
   *
   * Note: the D1 destructor RUNS the per-element virtual dtors (deleting each
   * child) AND frees the pointer-array. In TS we don't model per-element
   * destruction (GC handles it) — we simply drop the reference. The base-vtable
   * install is meaningless in TS.
   */
  destroy(): void {                                          // @0x00000000012591d0  ~FFSerialAudioSignal (D1)
    // @0x12591da/e1  install base vtable — no-op in TS.
    // @0x12591e4/e8  read vector.
    // @0x12591ec  compare begin == end.
    // Loop @0x1259219..2b — call each child's dtor slot +0x8. In TS: no-op.
    // @0x12591f6/fd  operator delete on the pointer-array — GC handles it.
    this.inputs = [];                                        // observable effect: release refs
  }

  /**
   * @Flexo 0x0000000001259240  FFSerialAudioSignal::~FFSerialAudioSignal()  [D0 = deleting dtor]
   *
   * Body @0x1259240..a6 — identical to D1 above (per-element virtual-dtor loop +
   * pointer-array delete) EXCEPT the epilogue at @0x1259272..79 is a tail-jump
   * to `operator delete(this)` (@0x1497404) — freeing the FFSerialAudioSignal
   * heap slot itself. D0 = D1 + `delete this`. In TS: GC handles both.
   */
  destroyDeleting(): void {                                  // @0x0000000001259240  ~FFSerialAudioSignal (D0)
    // Same as D1 (per-element cleanup) — then the D0-specific `jmp __ZdlPv` at
    // @0x1259279 frees `this`. Modeled by GC in TS.
    this.inputs = [];
  }
}
