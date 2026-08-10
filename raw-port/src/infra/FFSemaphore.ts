// FFSemaphore.ts — the FCP Flexo framework's thin wrapper around a
// libdispatch dispatch_semaphore_t. Faithfully transcribed from the FCP
// Flexo binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (x86_64 slice; unadjusted VAs — the same addresses raw-port/re/disasm uses).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from FFSemaphore::timedWait's reads)
// -----------------------------------------------------------------------------
//   +0x08  dispatch_semaphore_t  sem   ; the underlying libdispatch semaphore
//                                        (read @0x12efa3e `movq 0x8(%rdi),%rbx`)
//
// timedWait is the only FFSemaphore symbol nm surfaces in this slice; the
// ctor/dtor that store the semaphore into +0x8 are elsewhere (or inlined at
// construction sites) and not ported here — so +0x8 is modelled as an opaque
// dispatch_semaphore_t handle, injected at the extern boundary.
//
// -----------------------------------------------------------------------------
// EXTERN BOUNDARY (OUT OF PORT SCOPE — libdispatch, Apple's OS runtime)
// -----------------------------------------------------------------------------
// timedWait tail-calls two libdispatch functions that are NOT part of the
// five-framework port (ProCore/ProChannel/Helium/Ozone/Flexo). Per
// PORTING_SPEC Rule 3, an undecoded / out-of-scope callee is surfaced as a
// LOUD boundary stub that throws (citing the call-site @0xADDR), never a
// silent guess:
//   * _dispatch_time            @0x12efa51  callq (symbol stub 0x1497704)
//   * _dispatch_semaphore_wait  @0x12efa5c  callq (symbol stub 0x14976b0)
// These are modelled through the injectable `DispatchSemaphoreExtern`
// interface so a host that DOES have libdispatch (a native bridge) can plug
// the real behaviour in, while a pure-JS realm gets the loud throw.
//
// The ARITHMETIC that timedWait performs BEFORE the extern calls (clamp the
// seconds argument at 0, convert seconds→nanoseconds, truncate to int64) is
// fully decoded and transcribed below — it is real work, not a stub.

/**
 * The libdispatch extern boundary used by FFSemaphore::timedWait. libdispatch
 * (`dispatch_time`, `dispatch_semaphore_wait`) lives in the OS runtime, OUTSIDE
 * the five in-scope FCP frameworks, so it is modelled as an injectable boundary
 * rather than ported. A native host may supply a real implementation; the
 * default (`ThrowingDispatchSemaphoreExtern`) throws loudly.
 */
export interface DispatchSemaphoreExtern {
  /**
   * `dispatch_time(dispatch_time_t when, int64_t delta)` — libdispatch.
   * timedWait passes `when = 0` (`DISPATCH_TIME_NOW`, `xorl %edi,%edi`
   * @0x12efa4f) and `delta = nanoseconds`. Returns an opaque
   * `dispatch_time_t` (uint64) deadline.
   * @extern _dispatch_time (symbol stub @0x1497704), called @0x12efa51.
   */
  dispatchTime(when: bigint, deltaNanos: bigint): bigint;

  /**
   * `dispatch_semaphore_wait(dispatch_semaphore_t sem, dispatch_time_t timeout)`
   * — libdispatch. Blocks the calling thread until the semaphore is signalled
   * or `timeout` elapses. Returns 0 on success (signalled in time), non-zero
   * on timeout.
   * @extern _dispatch_semaphore_wait (symbol stub @0x14976b0), called @0x12efa5c.
   */
  dispatchSemaphoreWait(sem: unknown, timeout: bigint): bigint;
}

/**
 * Default extern boundary: a pure-JS realm has no libdispatch and cannot
 * block a thread, so every entry throws loudly with its call-site address
 * (PORTING_SPEC Rule 3 — a loud gap, never a silent approximation).
 */
export class ThrowingDispatchSemaphoreExtern implements DispatchSemaphoreExtern {
  dispatchTime(_when: bigint, _deltaNanos: bigint): bigint {
    throw new Error(
      '_dispatch_time @0x12efa51 (libdispatch extern, out of port scope) not available in this realm',
    );
  }
  dispatchSemaphoreWait(_sem: unknown, _timeout: bigint): bigint {
    throw new Error(
      '_dispatch_semaphore_wait @0x12efa5c (libdispatch extern, out of port scope) not available in this realm',
    );
  }
}

/**
 * `1000000000.0` — nanoseconds per second. The `mulsd` multiplier read from
 * Flexo `__TEXT,__const` @0x156f290 (raw bytes 0x41cdcd6500000000 →
 * IEEE-754 double 1e9). timedWait converts its `seconds` argument to the
 * nanosecond `delta` that `dispatch_time` expects.
 * @Flexo 0x156f290 (referenced by `mulsd 0x27f846(%rip),%xmm1` @0x12efa42).
 */
const NANOS_PER_SECOND = 1000000000.0;

/**
 * FFSemaphore — a thin wrapper over a libdispatch counting semaphore.
 * @Flexo (Flexo.framework)
 */
export class FFSemaphore {
  /**
   * `this+0x8` — the underlying `dispatch_semaphore_t` (read @0x12efa3e
   * `movq 0x8(%rdi),%rbx`). Opaque handle; created by the (not-yet-ported)
   * ctor. Modelled as `unknown` and passed straight through to the
   * libdispatch extern boundary.
   */
  sem: unknown = null;

  /**
   * The injected libdispatch boundary. Defaults to the loud-throwing stub;
   * a native host can supply a real implementation.
   */
  private readonly dispatch: DispatchSemaphoreExtern;

  constructor(dispatch: DispatchSemaphoreExtern = new ThrowingDispatchSemaphoreExtern()) {
    this.dispatch = dispatch;
  }

  /**
   * `FFSemaphore::timedWait(double seconds)` -> bool
   *   — @Flexo 0x12efa30
   *   — __ZN11FFSemaphore9timedWaitEd
   *
   * Faithful line-for-line transcription of the 22-line disassembly:
   *   0x12efa30  pushq  %rbp
   *   0x12efa31  movq   %rsp, %rbp
   *   0x12efa34  pushq  %rbx
   *   0x12efa35  pushq  %rax                          ; align stack
   *   0x12efa36  xorpd  %xmm1, %xmm1                  ; xmm1 = 0.0
   *   0x12efa3a  maxsd  %xmm0, %xmm1                  ; xmm1 = max(0.0, seconds)
   *                                                   ;   (maxsd dst=xmm1,src=xmm0:
   *                                                   ;    result = max(xmm1,xmm0) = max(0,arg))
   *   0x12efa3e  movq   0x8(%rdi), %rbx               ; rbx = this->sem (+0x8)
   *   0x12efa42  mulsd  0x27f846(%rip), %xmm1         ; xmm1 *= 1e9  (const @0x156f290)
   *                                                   ;   seconds -> nanoseconds
   *   0x12efa4a  cvttsd2si %xmm1, %rsi                ; rsi = (int64)xmm1  (truncate toward 0)
   *   0x12efa4f  xorl   %edi, %edi                    ; edi = 0  (DISPATCH_TIME_NOW)
   *   0x12efa51  callq  _dispatch_time                ; rax = dispatch_time(0, rsi)
   *   0x12efa56  movq   %rbx, %rdi                    ; rdi = this->sem
   *   0x12efa59  movq   %rax, %rsi                    ; rsi = deadline
   *   0x12efa5c  callq  _dispatch_semaphore_wait      ; rax = wait(sem, deadline)
   *   0x12efa61  testq  %rax, %rax                    ; rax == 0 ?
   *   0x12efa64  sete   %al                           ; al = (rax == 0)  -> return value
   *   0x12efa67  addq   $0x8, %rsp
   *   0x12efa6b  popq   %rbx
   *   0x12efa6c  popq   %rbp
   *   0x12efa6d  retq
   *
   * SEMANTICS: waits up to `seconds` (clamped at >= 0) for the semaphore to be
   * signalled; returns TRUE iff it was signalled within the timeout
   * (`dispatch_semaphore_wait` returned 0), FALSE on timeout.
   *
   * NUMERICS (PORTING_SPEC Rule 4):
   *   - `maxsd` result is a double; `xorpd` gives an exact 0.0, so the clamp is
   *     `Math.max(0, seconds)`. (maxsd's NaN behaviour returns the src operand
   *     xmm0 on unordered — for a NaN `seconds` this yields NaN, which
   *     cvttsd2si then converts to the x86 "integer indefinite" 0x8000...0;
   *     we don't special-case NaN because a NaN timeout is not a real caller
   *     input and modelling the x86 indefinite would be an invented value.)
   *   - the `* 1e9` is a double multiply BEFORE truncation — kept in double.
   *   - `cvttsd2si ...,%rsi` truncates toward zero into a SIGNED 64-bit int,
   *     so the nanosecond delta is a bigint via Math.trunc (delta can exceed
   *     2^53 for large timeouts, so int64 -> bigint per Rule 4).
   *
   * DEPENDENCIES: zero in-scope callees. Two OUT-OF-SCOPE libdispatch externs
   * (_dispatch_time @0x12efa51, _dispatch_semaphore_wait @0x12efa5c) routed
   * through the injectable boundary (loud throw by default).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Flexo.__ZN11FFSemaphore9timedWaitEd.s (22 lines)
   */
  timedWait(seconds: number): boolean {
    // @0x12efa36 xorpd %xmm1,%xmm1 ; @0x12efa3a maxsd %xmm0,%xmm1
    //   xmm1 = max(0.0, seconds)
    const clampedSeconds = Math.max(0.0, seconds);

    // @0x12efa3e movq 0x8(%rdi),%rbx  ; rbx = this->sem
    const sem = this.sem;

    // @0x12efa42 mulsd 0x27f846(%rip),%xmm1  ; xmm1 *= 1e9 (seconds -> nanoseconds)
    const nanosDouble = clampedSeconds * NANOS_PER_SECOND;

    // @0x12efa4a cvttsd2si %xmm1,%rsi  ; rsi = (int64)truncate(xmm1)
    const deltaNanos = BigInt(Math.trunc(nanosDouble));

    // @0x12efa4f xorl %edi,%edi ; @0x12efa51 callq _dispatch_time
    //   rax = dispatch_time(DISPATCH_TIME_NOW=0, deltaNanos)
    const deadline = this.dispatch.dispatchTime(0n, deltaNanos);

    // @0x12efa56 movq %rbx,%rdi ; @0x12efa59 movq %rax,%rsi ; @0x12efa5c callq _dispatch_semaphore_wait
    //   rax = dispatch_semaphore_wait(sem, deadline)
    const result = this.dispatch.dispatchSemaphoreWait(sem, deadline);

    // @0x12efa61 testq %rax,%rax ; @0x12efa64 sete %al
    //   return (result == 0)  — true iff signalled within the timeout.
    return result === 0n;
  }
}
