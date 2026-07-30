// PCTimer — ProCore framework simple wall-clock timer.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore  (x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * PCTimer::start()                                    @ProCore 0x15760
//
// re/disasm:
//   raw-port/re/disasm/ProCore.__ZN7PCTimer5startEv.s     (14 lines)
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
