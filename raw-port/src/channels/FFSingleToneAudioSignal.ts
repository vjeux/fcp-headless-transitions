// Faithful transcription — one class per file, no shortcut language.
// @class FFSingleToneAudioSignal (Flexo)
//
// Provenance: x86_64 disasm at
// raw-port/re/disasm/Flexo.FFSingleToneAudioSignal.*.s (extracted via
// raw-port/tools/disasm.sh from
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo).
//
// Base class is `FFAudioSignal` (see raw-port/src/channels/FFAudioSignal.ts).
// Its layout is @+0x00 vtable, @+0x08 period(u64), @+0x10 phase(u64),
// @+0x18 repeat(u8). This subclass extends the layout with three doubles
// at @+0x20/+0x28/+0x30 — inspection of the ctor stores identifies them
// as `frequencyHz`, `amplitude`, `sampleRateHz` respectively (see the
// method-level comments for the derivation). Total sizeof = 0x38 bytes,
// confirmed by `copySignal`'s `__Znwm(56)` allocation @0x1258f2e.
//
// Ctor variants at @0x1258ec0 (C2, unified/base ctor) and @0x1258ef0 (C1,
// complete ctor). The provided brief lists both addresses; the C2 body
// is expected to be a copy of C1 up to base construction (the disasm
// found for C1 stores base fields inline instead of calling the base
// ctor, matching a devirtualised trivial base). We use the C1 disasm
// @0x1258ef0 (14 lines) as the authoritative body and cite it in the
// TS constructor doc-comment.
//
// Vtable installed pointer @0x1258f00 = 0x1258f07 + 0x6c8ad9 = 0x19217e0.
// The vtable slot for `isIndefiniteSignal` is invoked virtually from the
// base's `render` loop; slot layout is fixed by FFAudioSignal but this
// subclass overrides `isIndefiniteSignal` (returns 1) and `copySignal`
// (deep-clone). The base's virtual "renderChunk"-family slot is
// overridden by processSamples (the const-qualified signature
// `processSamples(float*, unsigned long long, unsigned long long) const`
// gives it a `this` in %rdi and dependent samples in %rsi/%rdx/%rcx).
//
// -- Object layout (58 bytes) --
//   +0x00 : void* vtable                (@0x1258f00-f07)
//   +0x08 : uint64 period               (base class; = numSamples ctor arg1)
//   +0x10 : uint64 phase                (base class; = 0 in ctor)
//   +0x18 : uint8  repeat               (base class; = 0 in ctor)
//   +0x20 : Float64 frequencyHz         (subclass; ctor arg2)
//   +0x28 : Float64 amplitude           (subclass; ctor arg3)
//   +0x30 : Float64 sampleRateHz        (subclass; ctor arg4)
//
// Sanity check on which double is which:
//   processSamples reads +0x20 as the numerator of the multiply-then-
//   divide chain: `xmm1 = *(double*)+0x20 * 2π / *(double*)+0x30`
//   (see @0x1258f96..@0x1258fa3). This yields the angular per-sample
//   step `ω = 2π * f / fs` — so +0x20 is frequency, +0x30 is sample
//   rate, and the remaining +0x28 (used in the post-sin multiply @
//   @0x125919b/@0x12590fa) is amplitude.

import { FFAudioSignal } from "./FFAudioSignal";

/**
 * `FFSingleToneAudioSignal` — a pure sine-tone audio signal generator.
 * Outputs
 *   buffer[i] = amplitude · sin(2π · frequency · (startIdx + i) / sampleRate)
 * as fp32 samples.
 *
 * Extends the Flexo audio-signal generator base with three double
 * parameters (frequency, amplitude, sample rate) at object offsets
 * +0x20/+0x28/+0x30.
 */
export class FFSingleToneAudioSignal extends FFAudioSignal {
  /** @+0x20 : oscillator frequency in Hz. */
  frequencyHz: number;
  /** @+0x28 : output amplitude (linear, applied post-sin). */
  amplitude: number;
  /** @+0x30 : reference sample rate in Hz for phase advance. */
  sampleRateHz: number;

  /**
   * `FFSingleToneAudioSignal::FFSingleToneAudioSignal(unsigned long long numSamples, double frequencyHz, double amplitude, double sampleRateHz)`
   *
   * @0x1258ef0 — trivial POD-fill ctor. `_C1` complete-object variant.
   *
   * Line-by-line:
   *   @0x1258ef4  movb $0x0, 0x18(%rdi)              -- repeat  = 0.
   *   @0x1258ef8  movq $0x0, 0x10(%rdi)              -- phase   = 0.
   *   @0x1258f00  leaq 0x6c8ad9(%rip), %rax          -- vtable ptr.
   *   @0x1258f07  movq %rax, (%rdi)                  -- store vtable @+0x00.
   *   @0x1258f0a  movsd %xmm0, 0x20(%rdi)            -- +0x20  = arg2 (frequencyHz).
   *   @0x1258f0f  movsd %xmm1, 0x28(%rdi)            -- +0x28  = arg3 (amplitude).
   *   @0x1258f14  movsd %xmm2, 0x30(%rdi)            -- +0x30  = arg4 (sampleRateHz).
   *   @0x1258f19  movq %rsi, 0x8(%rdi)               -- +0x08  = arg1 (numSamples -> period).
   *
   * Note the ctor writes the base fields INLINE — it does not call
   * FFAudioSignal's ctor. The base's field defaults happen to match
   * this initialisation exactly (period=numSamples, phase=0, repeat=0)
   * so the effect is equivalent to a base-then-derived construction
   * of `FFAudioSignal(period=numSamples, phase=0, repeat=false)`.
   */
  constructor(
    numSamples: bigint,
    frequencyHz: number,
    amplitude: number,
    sampleRateHz: number,
  ) {
    super();
    // @0x1258f19 : period = numSamples.
    this.period = numSamples;
    // @0x1258ef8 : phase = 0. (Redundant — super() also zeroes it, but the
    //             asm writes it explicitly so we mirror.)
    this.phase = 0n;
    // @0x1258ef4 : repeat = 0.
    this.repeat = 0;
    // @0x1258f0a : +0x20 = frequencyHz.
    this.frequencyHz = frequencyHz;
    // @0x1258f0f : +0x28 = amplitude.
    this.amplitude = amplitude;
    // @0x1258f14 : +0x30 = sampleRateHz.
    this.sampleRateHz = sampleRateHz;
  }

  /**
   * `FFSingleToneAudioSignal::isIndefiniteSignal() const`
   *
   * @0x1259480 — constant `true` (movb $0x1, %al then ret).
   *   @0x1259484  movb $0x1, %al
   *   @0x1259486  popq %rbp / ret
   *
   * Overrides the base's `isIndefiniteSignal()` which returns 0. The
   * "single-tone" signal has no natural end — it repeats indefinitely
   * regardless of the ctor's `numSamples` argument (the period is used
   * only by the base-class phase-tracking logic, not for termination).
   */
  isIndefiniteSignal(): boolean {
    // @0x1259484 : movb $0x1, %al.
    return true;
  }

  /**
   * `FFSingleToneAudioSignal::copySignal() const`
   *
   * @0x1258f20 — heap-allocates a fresh FFSingleToneAudioSignal(0x38 B),
   * installs the same vtable, and byte-copies the field records from
   * `this`.
   *
   * Line-by-line:
   *   @0x1258f29  movl $0x38, %edi
   *   @0x1258f2e  callq __Znwm                         -- new(56).
   *   @0x1258f33  movq 0x8(%rbx), %rcx                 -- load this->period.
   *   @0x1258f37  movsd 0x30(%rbx), %xmm0              -- load this->sampleRateHz.
   *   @0x1258f3c  movb  $0x0, 0x18(%rax)               -- clone->repeat = 0.
   *   @0x1258f40  movq  $0x0, 0x10(%rax)               -- clone->phase  = 0.
   *   @0x1258f48  leaq 0x6c8a91(%rip), %rdx            -- vtable ptr.
   *   @0x1258f4f  movq %rdx, (%rax)                    -- clone->vtable = vptr.
   *   @0x1258f52  movups 0x20(%rbx), %xmm1             -- load 16 B @ this+0x20 =
   *                                                       {frequencyHz, amplitude}.
   *   @0x1258f56  movups %xmm1, 0x20(%rax)             -- store into clone+0x20.
   *   @0x1258f5a  movsd  %xmm0, 0x30(%rax)             -- clone->sampleRateHz.
   *   @0x1258f5f  movq   %rcx, 0x8(%rax)               -- clone->period.
   *
   * Key observation: the clone RESETS `repeat` and `phase` to 0 rather
   * than copying them from `this`. This matches "a copy is a fresh
   * signal starting from phase 0" semantics.
   *
   * The 0x6c8a91 vtable offset from RIP=0x1258f4f yields
   * 0x1258f4f + 0x6c8a91 + 7 = 0x19217e7 — same vtable as the ctor
   * (@0x19217e0) offset by 7 which is inside the same table row (the
   * runtime `movq (%rax)` at future call sites will re-fetch the
   * installed pointer, so the +7 offset is a code-gen quirk of the
   * `leaq` fusion; it does NOT change which vtable is loaded).
   */
  copySignal(): FFSingleToneAudioSignal {
    // Faithful transcription of the C++ body: allocate a fresh
    // FFSingleToneAudioSignal, install the same vtable, copy the three
    // doubles + period, and zero repeat/phase.
    const clone = new FFSingleToneAudioSignal(
      // period comes from `this` — see @0x1258f33.
      this.period,
      // frequency & amplitude are the two consecutive doubles copied
      // by the 16-byte `movups` @0x1258f52..@0x1258f56.
      this.frequencyHz,
      this.amplitude,
      // sampleRate comes from `this` — see @0x1258f37/@0x1258f5a.
      this.sampleRateHz,
    );
    // The C++ body explicitly resets repeat=0 and phase=0 on the clone
    // regardless of `this` (@0x1258f3c / @0x1258f40). The constructor
    // above already does this; we assert it to preserve intent.
    clone.repeat = 0;
    clone.phase = 0n;
    return clone;
  }

  /**
   * `FFSingleToneAudioSignal::processSamples(float* buffer, unsigned long long startIdx, unsigned long long count) const`
   *
   * @0x1258f70 — fills `buffer[0..count-1]` with the sine-tone signal
   * offset by `startIdx` samples from the start of the tone.
   *
   * Formula (verified against the scalar tail loop @0x1259160):
   *
   *   phaseStep = 2π · frequencyHz / sampleRateHz
   *   for i in 0..count-1:
   *     buffer[i] = (float)( amplitude · sin( phaseStep · (startIdx + i) ) )
   *
   * Line-by-line (SIMD block + scalar tail):
   *
   *   Entry guard:
   *     @0x1258f70  testq %rcx, %rcx / je 0x12591c2   -- if count==0 return.
   *
   *   Setup:
   *     @0x1258f96  movsd 0x20(%rdi), %xmm1            -- xmm1 = frequencyHz.
   *     @0x1258f9b  mulsd [rip+0x3195b5], %xmm1        -- xmm1 *= 2π  (const @0x1572558
   *                                                       = 6.283185307179586,
   *                                                       resolved via
   *                                                       resolve.py Flexo const
   *                                                       0x1572558).
   *     @0x1258fa3  divsd 0x30(%rdi), %xmm1            -- xmm1 /= sampleRateHz.
   *     @0x1258fa8  movsd 0x28(%rdi), %xmm0            -- xmm0 = amplitude.
   *     @0x1258fad  cmpq $0x4, %rcx / jae 0x1258fcc    -- if count < 4 -> scalar tail.
   *
   *   SIMD block (4-at-a-time, only entered when count >= 4):
   *     @0x1258fcc  movq %rbx, %r12 / andq $-0x4, %r12  -- r12 = count & ~3.
   *     @0x1258fd3  movddup xmm0                        -- xmm0 = <amp, amp>.
   *     @0x1258fdf  pshufd $0x44, xmm0                  -- broadcast r14 = startIdx
   *                                                        to <r14, r14> (u64 pair).
   *     @0x1258ff1  movddup xmm1                        -- xmm1 = <phaseStep, phaseStep>.
   *
   *     Loop @0x1259010 processes 4 output samples per iteration:
   *       -- Two i64-lane counters @xmm0/@xmm1 initialised at @0x1258ffa
   *          (loaded from the .data constant pool at
   *          [rip+0x32a50e]=<0,1> and [rip+0x32a516]=<2,3>). Each iter
   *          adds <4,4> (from [rip+0x32a3f7]) so lanes advance by 4.
   *       -- Add the broadcast startIdx to both lanes (paddq).
   *       -- Convert each 64-bit lane to double via the well-known
   *          magic-constant technique
   *          (pblendw $0xcc / por [rip+0x3164b2] / psrlq 32 /
   *           por [rip+0x3164b1] / subpd [rip+0x3164b5]) plus final
   *          addpd. This synthesises exact fp64 values for each of
   *          the four sample indices (i.e. (double)(startIdx + 4k + j)).
   *       -- Multiply by the <phaseStep, phaseStep> pair (mulpd).
   *       -- Call `_sin` four times (once per lane), interleaving the
   *          double results back into two <sin(a), sin(b)> pairs via
   *          movhlps/movlhps/unpcklpd/unpckhpd.
   *       -- Multiply both pairs by <amp, amp> (mulpd).
   *       -- cvtpd2ps each pair to two floats, unpcklpd them into a
   *          single <f0, f1, f2, f3> xmm and store at
   *          `(%r15, %r13*4)` (i.e. buffer[i..i+3]).
   *       -- Advance the loop counter and lane counters by 4.
   *
   *   Scalar tail (entered directly when count<4, or after the SIMD
   *   loop when count is not a multiple of 4):
   *     @0x1259160  leaq (%r14,%r12), %rax             -- rax = startIdx + i.
   *     @0x1259164..@0x1259181                          -- convert u64 -> f64 via
   *                                                        the same magic-constant
   *                                                        trick, one lane.
   *     @0x1259185  mulsd  %xmm2, %xmm0                -- * phaseStep.
   *     @0x1259189  callq _sin                         -- sin(phase).
   *     @0x125919b  mulsd  %xmm1, %xmm0                -- * amplitude.
   *     @0x125919f  cvtsd2ss %xmm0, %xmm0              -- double -> float.
   *     @0x12591a3  movss %xmm0, (%r15,%r12,4)         -- buffer[i] = result.
   *     @0x12591a9  incq %r12 / cmp / jne 0x1259160    -- next sample.
   *
   * We reproduce a single canonical formula for every sample —
   * matching the SCALAR tail exactly — rather than replaying the SIMD
   * path separately. The scalar-tail formula IS the mathematical
   * specification the SIMD block is a lane-parallel evaluator of. On
   * fp64 the two paths compute the same value up to sin() rounding of
   * a lane-parallel argument; because we don't own the fp64 sin used
   * by libSystem, matching bit-exactness across the SIMD and scalar
   * variants isn't reproducible off-platform anyway. What the port
   * MUST preserve is the mathematical formula and the fp32 output
   * cast — both of which come straight from the scalar tail.
   *
   * @param buffer  Float32Array target — indexed as `buffer[i]`.
   * @param startIdx Global sample index of `buffer[0]`.
   * @param count   Number of samples to write.
   */
  processSamples(
    buffer: Float32Array,
    startIdx: bigint,
    count: bigint,
  ): void {
    // @0x1258f70..@0x1258f73 : if (count == 0) return.
    if (count === 0n) return;

    // @0x1258f96..@0x1258fa3 : phaseStep = 2π · frequencyHz / sampleRateHz.
    //   2π is loaded as an fp64 constant from [rip+0x3195b5] which
    //   resolves to 0x1572558 = 0x401921fb54442d18 = 6.283185307179586.
    const TWO_PI = 6.283185307179586;
    const phaseStep = (TWO_PI * this.frequencyHz) / this.sampleRateHz;
    // @0x1258fa8 : amplitude in xmm0 for the post-sin multiply.
    const amp = this.amplitude;

    // Scalar loop mirroring the tail @0x1259160..@0x12591af.
    //
    // The C++ `for i in 0..count-1` uses u64 for i; JS bigint mirrors
    // that exactly. `startIdx + i` is exact under bigint. The u64 ->
    // f64 conversion path in the asm uses the magic-constant trick,
    // which yields the SAME numeric double as `Number(BigInt)` for
    // values up to 2^53 — beyond that the asm's f64 result is only an
    // approximation, but that regime is not reachable for a realistic
    // audio-sample index. If it ever were, the correct bit-exact
    // replay would require replaying the exact SSE conversion; we
    // note that here rather than silently degrading.
    //
    // Every value read here is fp64 in the asm (movsd/mulsd/divsd/
    // addsd/cvtsd2ss). The only fp32 cast is the final store, which
    // we perform via Math.fround before writing to the Float32Array.
    for (let i = 0n; i < count; i++) {
      // @0x1259160 : startIdx + i (u64).
      const sampleIdx = startIdx + i;
      // u64 -> f64 (see note above).
      const sampleIdxF = Number(sampleIdx);
      // @0x1259185 : phase = sampleIdxF * phaseStep (fp64).
      const phase = sampleIdxF * phaseStep;
      // @0x1259189 : sin(phase).
      const s = Math.sin(phase);
      // @0x125919b : * amplitude (fp64).
      const y = s * amp;
      // @0x125919f/@0x12591a3 : cvtsd2ss + store as f32.
      buffer[Number(i)] = Math.fround(y);
    }
  }

  /**
   * `FFSingleToneAudioSignal::~FFSingleToneAudioSignal()` (D0 deleting dtor)
   *
   * @0x1259470 — trivial deleting dtor: `pushq %rbp / movq %rsp, %rbp /
   * popq %rbp / jmp _ZdlPv` (tail-calls `operator delete(void*)`).
   *
   *   @0x1259474  popq %rbp
   *   @0x1259475  jmp __ZdlPv                            -- tail delete(this).
   *
   * The class carries no owned resources (all fields are PODs), so the
   * dtor body is empty apart from the base `operator delete` call. In
   * TypeScript there is nothing to release — the garbage collector
   * handles the underlying object once no references remain.
   */
  destroy_deleting_D0(): void {
    // @0x1259475 : jmp __ZdlPv — nothing to do in TS.
  }
}
