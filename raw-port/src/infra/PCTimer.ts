// PCTimer — ProCore framework simple wall-clock timer.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore  (x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * PCTimer::start()                                    @ProCore 0x15760
//   * PCTimer::getSeconds() const                         @ProCore 0x1580a
//
// re/disasm:
//   raw-port/re/disasm/ProCore.__ZN7PCTimer5startEv.s     (14 lines)
//   raw-port/re/disasm/ProCore.__ZNK7PCTimer10getSecondsEv.s  (21 lines)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered from this method's stores)
// -----------------------------------------------------------------------------
// PCTimer {
//   uint64_t startTick;   // +0x00 — the raw 64-bit
//                         //   `std::chrono::steady_clock::time_point::rep`
//                         //   returned by steady_clock::now(). On macOS this
//                         //   is a nanosecond count relative to an
//                         //   implementation-defined monotonic epoch. The
//                         //   whole time_point is a single `long long`
//                         //   (`rep` = `int64_t` for steady_clock), which is
//                         //   why the disasm stores it with a single `movq
//                         //   %rax, (%rbx)`.
//   uint64_t elapsedTicks;// +0x08 — cumulative "already-accumulated" duration
//                         //   in the same ticks as startTick. `start()`
//                         //   clears it to 0 (`movq $0x0, 0x8(%rbx)`); the
//                         //   as-yet-unported `stop()` / `getElapsed()`
//                         //   methods presumably add `now() - startTick`
//                         //   into it. Field kept `uint64_t` (bigint below)
//                         //   because monotonic tick deltas easily exceed
//                         //   2^53 nanoseconds (~104 days).
//   uint8_t  running;     // +0x10 — 1-byte "is the timer currently running?"
//                         //   flag (`movb $0x1, 0x10(%rbx)` sets it true).
//                         //   `stop()` (separate ledger entry) will presumably
//                         //   flip it back to 0.
// }
//
// (No other offsets are touched by `start()` — this is the entire layout
// we can honestly recover from its disasm.)
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   __stub __ZNSt3__16chrono12steady_clock3nowEv  @ProCore 0xde666
//       — `std::chrono::steady_clock::now()` from libc++. Returns a
//         `time_point<steady_clock>` which is one `int64_t` — the raw tick
//         count. This is an out-of-scope libc++ extern (the port has no
//         monotonic-clock oracle wired up); we model it as a throwing
//         boundary stub citing its stub address, faithful to the "true
//         out-of-scope extern" rule.
//
// depgraph.py deps for __ZN7PCTimer5startEv reports 0 in-scope callees,
// confirming the one call above is the only frontier.

/**
 * `std::chrono::steady_clock::now()` — libc++ extern.
 *
 * @ProCore __stubs 0xde666 (call site @0x15769). Returns the current
 * monotonic tick count as a single `int64_t` (steady_clock's `rep` on
 * macOS libc++ is `long long`, and `duration` is one field, and
 * `time_point` is one field, so the whole time_point marshals in `%rax`).
 * The port has no monotonic clock binding, so the wrapper throws citing
 * its stub address.
 */
function std__chrono__steady_clock__now(): bigint {
  throw new Error(
    "std::chrono::steady_clock::now @ProCore __stubs 0xde666 not yet transcribed " +
      "(libc++ monotonic-clock extern, out of scope)",
  );
}

/**
 * Object layout for PCTimer.
 *
 * Recovered from re/disasm/ProCore.__ZN7PCTimer5startEv.s. All three fields
 * below are written by `start()`; other PCTimer methods will add fields as
 * their disasms reveal them.
 */
export interface PCTimerFields {
  /** +0x00 — `steady_clock::time_point` (u64 tick count). */
  startTick_at_0x00: bigint;
  /** +0x08 — cumulative elapsed ticks (u64), cleared by `start()`. */
  elapsedTicks_at_0x08: bigint;
  /** +0x10 — 1-byte "running" flag (0 or 1). */
  running_at_0x10: number;
  /**
   * +0x11 — 1-byte flag first observed in `getSeconds()`
   * (`cmpb $0x0, 0x11(%rdi)`). `getSeconds()` only samples `now()` when this
   * byte is 0 AND `running` (+0x10) is 1, so it reads as a "paused / frozen"
   * (a.k.a. "snapshot taken") flag: while it is nonzero the timer reports its
   * already-accumulated `elapsedTicks` verbatim instead of extending it with a
   * fresh `now()` reading. The whole PCTimer object is one contiguous struct so
   * this optional field defaults to 0 (unpaused) when a caller only ran
   * `start()`.
   */
  paused_at_0x11?: number;
  /**
   * +0x14 — u32 field cleared to 0 by `reset()` (`movl $0x0, 0x14(%rdi)`
   * @0x15724). Its role is not yet observable (no reader ported), so it is
   * modeled as an optional u32 that defaults to 0. Distinct 4-byte slot from
   * the running/paused bytes at +0x10/+0x11 (the `movw` there clears only 2
   * bytes; +0x12/+0x13 remain unmapped padding).
   */
  field_at_0x14?: number;
  /**
   * +0x18 — u64 field cleared to 0 by `reset()` (`movq %rax, 0x18(%rdi)` with
   * %rax=0 @0x1572b). Likely a second cumulative-tick / bookkeeping slot; no
   * reader is ported yet, so it is modeled as an optional u64 (bigint)
   * defaulting to 0.
   */
  field_at_0x18?: bigint;
}

/**
 * `PCTimer::start()`   @ProCore 0x15760
 *
 * Faithful line-for-line transcription of the 14-line disassembly:
 *   0x15760  pushq %rbp                                ; frame prologue
 *   0x15761  movq  %rsp, %rbp
 *   0x15764  pushq %rbx                                ; save callee-saved
 *   0x15765  pushq %rax                                ; stack align (16-byte)
 *   0x15766  movq  %rdi, %rbx                          ; rbx = this
 *   0x15769  callq _steady_clock::now                  ; rax = now()
 *   0x1576e  movq  %rax, (%rbx)                        ; this->+0x00 = now
 *   0x15771  movq  $0x0, 0x8(%rbx)                     ; this->+0x08 = 0
 *   0x15779  movb  $0x1, 0x10(%rbx)                    ; this->+0x10 = 1
 *   0x1577d  addq  $0x8, %rsp                          ; epilogue
 *   0x15781  popq  %rbx
 *   0x15782  popq  %rbp
 *   0x15783  retq
 *
 * SEMANTICS: mark the timer as running by (a) stamping `now()` into the
 * start-tick slot, (b) clearing the accumulated-elapsed slot, and (c)
 * flipping the running-flag byte to 1. No return value.
 *
 * Zero in-scope callees; one out-of-scope libc++ extern
 * (steady_clock::now).
 */
export function PCTimer_start(self: PCTimerFields): void {
  // @0x15769  callq _steady_clock::now
  // First (and only) callable frontier — libc++ extern. The wrapper throws
  // citing its stub address. When a real monotonic-clock binding is wired
  // in, replace this call and the three stores below become live.
  const now = std__chrono__steady_clock__now();

  // @0x1576e  movq %rax, (%rbx)
  //   Store the raw 64-bit tick count into +0x00.
  self.startTick_at_0x00 = now;

  // @0x15771  movq $0x0, 0x8(%rbx)
  //   Clear the cumulative-elapsed slot. Bigint literal because the field
  //   type is u64.
  self.elapsedTicks_at_0x08 = 0n;

  // @0x15779  movb $0x1, 0x10(%rbx)
  //   Set the "running" flag byte to 1.
  self.running_at_0x10 = 1;
}

/**
 * Nanoseconds-per-second divisor read from the `divsd` operand of
 * `getSeconds()`.
 *
 * @ProCore __TEXT __const 0x123558 (`divsd 0x10dd19(%rip), %xmm0`
 * @0x15837, RIP=0x1583f). The 8 bytes there are the IEEE-754 double
 * `1000000000.0`, i.e. the timer's raw ticks are `steady_clock`
 * nanoseconds and `getSeconds()` scales them to seconds.
 */
const NANOSECONDS_PER_SECOND_at_0x123558 = 1_000_000_000.0;

/**
 * `PCTimer::getSeconds() const`   @ProCore 0x1580a
 *
 * Faithful line-for-line transcription of the 21-line disassembly:
 *   0x1580a  pushq %rbp                                ; frame prologue
 *   0x1580b  movq  %rsp, %rbp
 *   0x1580e  pushq %r14
 *   0x15810  pushq %rbx
 *   0x15811  movq  0x8(%rdi), %r14                     ; r14 = elapsedTicks (+0x08)
 *   0x15815  cmpb  $0x1, 0x10(%rdi)                    ; running (+0x10) == 1 ?
 *   0x15819  jne   0x15832                             ;   no  -> skip live sample
 *   0x1581b  movq  %rdi, %rbx                          ; rbx = this
 *   0x1581e  cmpb  $0x0, 0x11(%rdi)                    ; paused (+0x11) == 0 ?
 *   0x15822  jne   0x15832                             ;   no  -> skip live sample
 *   0x15824  callq _steady_clock::now                  ; rax = now()  (@__stubs 0xde666)
 *   0x15829  addq  %r14, %rax                          ; rax = now + elapsedTicks
 *   0x1582c  subq  (%rbx), %rax                        ; rax -= startTick (+0x00)
 *   0x1582f  movq  %rax, %r14                          ; r14 = now + elapsedTicks - startTick
 *   0x15832  cvtsi2sd %r14, %xmm0                      ; xmm0 = (double) (int64) r14
 *   0x15837  divsd 0x10dd19(%rip), %xmm0               ; xmm0 /= 1e9  (const @0x123558)
 *   0x1583f  popq  %rbx
 *   0x15840  popq  %r14
 *   0x15842  popq  %rbp
 *   0x15843  retq                                      ; return xmm0
 *
 * SEMANTICS: return the timer's elapsed duration in seconds.
 *   * If the timer is running (+0x10 == 1) AND not paused/frozen
 *     (+0x11 == 0), the live duration is `now() + elapsedTicks - startTick`
 *     (the accumulated ticks plus the currently-open interval).
 *   * Otherwise it reports the already-accumulated `elapsedTicks` verbatim.
 *   * The chosen tick count is converted with a SIGNED int64->double
 *     (`cvtsi2sd`) and divided by 1e9 nanoseconds/second.
 *
 * Zero in-scope callees; one out-of-scope libc++ extern
 * (steady_clock::now), reached only on the running-and-unpaused path.
 */
export function PCTimer_getSeconds(self: PCTimerFields): number {
  // @0x15811  movq 0x8(%rdi), %r14
  //   r14 = elapsedTicks (+0x08). Default result unless the live branch runs.
  let r14: bigint = self.elapsedTicks_at_0x08;

  // @0x15815  cmpb $0x1, 0x10(%rdi) ; @0x15819 jne 0x15832
  //   Take the live-sample branch only when running == 1.
  // @0x1581e  cmpb $0x0, 0x11(%rdi) ; @0x15822 jne 0x15832
  //   ...and only when paused == 0. `paused_at_0x11` is optional (a bare
  //   start()'d timer never wrote +0x11); an absent field reads as 0.
  if (self.running_at_0x10 === 1 && (self.paused_at_0x11 ?? 0) === 0) {
    // @0x15824  callq _steady_clock::now  -> rax = now()
    const now = std__chrono__steady_clock__now();
    // @0x15829  addq %r14, %rax            -> now + elapsedTicks
    // @0x1582c  subq (%rbx), %rax          -> ... - startTick (+0x00)
    // @0x1582f  movq %rax, %r14
    r14 = now + r14 - self.startTick_at_0x00;
  }

  // @0x15832  cvtsi2sd %r14, %xmm0
  //   SIGNED int64 -> double conversion. `Number(BigInt.asIntN(64, r14))`
  //   reproduces the machine's signed interpretation of the 64-bit tick
  //   count before the division.
  const ticksAsDouble = Number(BigInt.asIntN(64, r14));

  // @0x15837  divsd 0x10dd19(%rip), %xmm0  -> xmm0 /= 1e9
  // @0x15843  retq                          -> return xmm0
  return ticksAsDouble / NANOSECONDS_PER_SECOND_at_0x123558;
}

/**
 * `PCTimer::reset()`   @ProCore 0x15714
 *
 * Faithful line-for-line transcription of the 11-line disassembly
 * (raw-port/re/disasm/ProCore.__ZN7PCTimer5resetEv.s):
 *   0x15714  pushq %rbp                                ; frame prologue
 *   0x15715  movq  %rsp, %rbp
 *   0x15718  movw  $0x0, 0x10(%rdi)                    ; u16 @+0x10 = 0
 *                                                      ;   clears running(+0x10)
 *                                                      ;   AND paused(+0x11) together
 *   0x1571e  xorl  %eax, %eax                          ; rax = 0
 *   0x15720  movq  %rax, 0x8(%rdi)                     ; u64 @+0x08 = 0 (elapsedTicks)
 *   0x15724  movl  $0x0, 0x14(%rdi)                    ; u32 @+0x14 = 0
 *   0x1572b  movq  %rax, 0x18(%rdi)                    ; u64 @+0x18 = 0
 *   0x1572f  popq  %rbp
 *   0x15730  retq
 *
 * SEMANTICS: reset the timer to a fresh, stopped, non-accumulating state:
 * clear the running + paused flag bytes (the single 16-bit store at +0x10
 * covers both), clear the accumulated-elapsed tick slot (+0x08), and clear
 * the two auxiliary slots (+0x14 u32, +0x18 u64). Note it deliberately does
 * NOT touch `startTick` (+0x00) — a `reset()`-then-`getSeconds()` reads
 * `elapsedTicks`=0 on the not-running path, so the stale startTick is never
 * observed. No return value, no callees, no externs.
 */
export function PCTimer_reset(self: PCTimerFields): void {
  // @0x15718  movw $0x0, 0x10(%rdi)
  //   16-bit clear covers BOTH the running byte (+0x10) and the paused byte
  //   (+0x11) in one store.
  self.running_at_0x10 = 0;
  self.paused_at_0x11 = 0;

  // @0x15720  movq %rax, 0x8(%rdi)  (rax = 0 from the xorl @0x1571e)
  //   Clear the cumulative-elapsed slot (u64).
  self.elapsedTicks_at_0x08 = 0n;

  // @0x15724  movl $0x0, 0x14(%rdi)
  //   Clear the u32 auxiliary slot.
  self.field_at_0x14 = 0;

  // @0x1572b  movq %rax, 0x18(%rdi)
  //   Clear the u64 auxiliary slot.
  self.field_at_0x18 = 0n;
}
