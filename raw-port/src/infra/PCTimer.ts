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
//   raw-port/re/disasm/ProCore.__ZN7PCTimer5startEv.s              (14 lines)
//   raw-port/re/disasm/ProCore.__ZNK7PCTimer10getSecondsEv.s       (21 lines)
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
//   uint8_t  paused;      // +0x11 — 1-byte "is the timer paused?" flag,
//                         //   observed by `getSeconds()` @0x1581e via
//                         //   `cmpb $0x0, 0x11(%rdi)`. Only when BOTH
//                         //   running==1 AND paused==0 does getSeconds()
//                         //   accumulate the current in-flight interval;
//                         //   otherwise the cached elapsedTicks is used
//                         //   as-is. `start()` does NOT touch this byte
//                         //   (its post-condition assumes zero-init from
//                         //   the ctor); the paired `pause()` / `resume()`
//                         //   flavours will land in their own ledger units.
// }
//
// (No other offsets are touched by `start()` — that method's disasm only
// reveals the first three fields. `getSeconds()` reveals the +0x11 paused
// flag; any additional offsets are still un-modelled until a peer method
// touches them.)
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
//         out-of-scope extern" rule. Called by BOTH `start()` @0x15769 and
//         `getSeconds()` @0x15824 (the same stub address at 0xde666).
//
// depgraph.py deps for __ZN7PCTimer5startEv AND __ZNK7PCTimer10getSecondsEv
// both report 0 in-scope callees, confirming steady_clock::now is the only
// frontier for either method.

/**
 * `std::chrono::steady_clock::now()` — libc++ extern.
 *
 * @ProCore __stubs 0xde666 (call sites @0x15769 in `start()` and @0x15824
 * in `getSeconds()`). Returns the current monotonic tick count as a
 * single `int64_t` (steady_clock's `rep` on macOS libc++ is `long long`,
 * and `duration` is one field, and `time_point` is one field, so the
 * whole time_point marshals in `%rax`).
 *
 * BOUNDARY-STUB POLICY: this is a TRUE out-of-scope libc++ extern. We
 * model it as a live monotonic tick source using the runtime's own
 * high-resolution clock (JavaScript: `performance.now()` in ms →
 * bigint nanoseconds; when unavailable falls back to `Date.now()`).
 * The units match the machine (nanoseconds since some epoch), the
 * monotonicity property is preserved, and callers that only take
 * DIFFERENCES between two `now()` calls (both PCTimer::start and
 * PCTimer::getSeconds do) get numerically-faithful behaviour without
 * ever needing to know FCP's specific epoch. If a future parity
 * harness needs exact-tick reproducibility it can swap this out via
 * dependency-injection; for now the surrogate satisfies the "extern
 * that returns a monotonic tick" contract at ProCore stub 0xde666.
 */
function std__chrono__steady_clock__now(): bigint {
  // performance.now() returns fractional milliseconds since a
  // process-monotonic origin — multiply by 1e6 to get nanoseconds, the
  // unit the disasm-visible constant `divsd .., 1e9` implies for the
  // returned `int64_t` tick count.
  const perf: { now(): number } | undefined =
    typeof globalThis !== "undefined" &&
    typeof (globalThis as { performance?: { now(): number } }).performance !== "undefined"
      ? (globalThis as { performance?: { now(): number } }).performance
      : undefined;
  const ms: number = perf ? perf.now() : Date.now();
  return BigInt(Math.floor(ms * 1_000_000));
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
  /** +0x11 — 1-byte "paused" flag (0 or 1). Only when running==1 AND
   *  paused==0 does `getSeconds()` add the in-flight `now()-startTick`
   *  interval to the cached elapsedTicks. Observed via
   *  `cmpb $0x0, 0x11(%rdi)` @0x1581e. Not touched by `start()`. */
  paused_at_0x11: number;
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
 * `PCTimer::getSeconds() const`   @ProCore 0x1580a
 * (mangled: __ZNK7PCTimer10getSecondsEv)
 *
 * Faithful line-for-line transcription of the 21-line disassembly:
 *   0x1580a  pushq  %rbp                              ; frame prologue
 *   0x1580b  movq   %rsp, %rbp
 *   0x1580e  pushq  %r14                              ; save callee-saved
 *   0x15810  pushq  %rbx
 *   0x15811  movq   0x8(%rdi), %r14                   ; r14 = this->elapsedTicks
 *   0x15815  cmpb   $0x1, 0x10(%rdi)                  ; running == 1 ?
 *   0x15819  jne    0x15832                           ; no  → skip in-flight add
 *   0x1581b  movq   %rdi, %rbx                        ; rbx = this
 *   0x1581e  cmpb   $0x0, 0x11(%rdi)                  ; paused == 0 ?
 *   0x15822  jne    0x15832                           ; no  → skip in-flight add
 *   0x15824  callq  _steady_clock::now                ; rax = now()
 *   0x15829  addq   %r14, %rax                        ; rax = now + elapsedTicks
 *   0x1582c  subq   (%rbx), %rax                      ; rax -= this->startTick
 *                                                     ; => r14 <- elapsedTicks
 *                                                     ;         + (now - startTick)
 *   0x1582f  movq   %rax, %r14                        ; commit accumulated ticks
 *   ; --- L0x15832: convert accumulated ticks to seconds ---
 *   0x15832  cvtsi2sd %r14, %xmm0                     ; xmm0 = (double)ticks
 *                                                     ; (signed int64 -> f64)
 *   0x15837  divsd   0x10dd19(%rip), %xmm0            ; xmm0 /= 1e9
 *                                                     ; (@const 0x123558 f64=1e9)
 *   0x1583f  popq    %rbx                             ; epilogue
 *   0x15840  popq    %r14
 *   0x15842  popq    %rbp
 *   0x15843  retq                                     ; return xmm0
 *
 * SEMANTICS: return the total elapsed time in seconds. When the timer is
 * running-and-not-paused, that is the cached `elapsedTicks` PLUS the
 * current in-flight interval `now() - startTick`; otherwise just the
 * cached `elapsedTicks`. Divide by 1e9 to convert nanoseconds → seconds.
 *
 * Signed-vs-unsigned note: the machine uses `cvtsi2sd` (SIGNED int64 →
 * f64), so tick values above 2^63 would appear as negative doubles.
 * Steady-clock deltas are always non-negative in practice, but we
 * faithfully mirror the signed conversion — a caller passing pathological
 * values will observe the same numerical behaviour as FCP does.
 *
 * The AT&T compare-branches decode as (dst - src):
 *   `cmpb $0x1, 0x10(%rdi)` — subtracts src(=1) from dst(=running_byte);
 *     `jne` taken when running_byte != 1, i.e. NOT running.
 *   `cmpb $0x0, 0x11(%rdi)` — subtracts src(=0) from dst(=paused_byte);
 *     `jne` taken when paused_byte != 0, i.e. paused.
 * Fall-through (both `jne` not taken) = running==1 AND paused==0.
 *
 * Zero in-scope callees; one out-of-scope libc++ extern
 * (steady_clock::now, same stub as in `start()`).
 */
export function PCTimer_getSeconds(self: PCTimerFields): number {
  // @0x15811  movq 0x8(%rdi), %r14
  //   Load the cached elapsedTicks into the "running total" register.
  let acc: bigint = self.elapsedTicks_at_0x08;

  // @0x15815  cmpb $0x1, 0x10(%rdi) ; jne L0x15832
  //   Bypass the in-flight interval unless the running flag is exactly 1.
  // @0x1581e  cmpb $0x0, 0x11(%rdi) ; jne L0x15832
  //   Also bypass when the paused flag is non-zero. Both bytes must be
  //   in "active accumulation" state to hit the callq path.
  if (self.running_at_0x10 === 1 && self.paused_at_0x11 === 0) {
    // @0x15824  callq _steady_clock::now
    //   Only frontier — libc++ extern. When wired to a real clock, this
    //   returns a bigint tick count (same units as startTick).
    const now: bigint = std__chrono__steady_clock__now();

    // @0x15829  addq %r14, %rax   ; rax = now + elapsedTicks
    // @0x1582c  subq (%rbx), %rax ; rax -= this->startTick
    // @0x1582f  movq %rax, %r14   ; commit into acc
    //   In the machine, ADD-then-SUB happens on `rax`; the net update
    //   to acc is `acc = now + acc - startTick`, i.e. add the in-flight
    //   interval (now - startTick) to the cached elapsedTicks. We mirror
    //   the exact instruction order to preserve modular-arithmetic
    //   wrap-around behaviour if it were ever to trigger.
    acc = now + acc - self.startTick_at_0x00;
  }

  // @0x15832  cvtsi2sd %r14, %xmm0
  //   Signed int64 → f64. Mirror with BigInt→Number via Number(BigInt),
  //   but honour the SIGNED interpretation the machine does — if the
  //   raw bigint sits above 2^63 (which never happens with a well-formed
  //   steady_clock tick), reinterpret as signed.
  const acc_i64_signed: bigint =
    acc >= 1n << 63n ? acc - (1n << 64n) : acc < -(1n << 63n) ? acc + (1n << 64n) : acc;
  const acc_f64: number = Number(acc_i64_signed);

  // @0x15837  divsd 0x10dd19(%rip), %xmm0
  //   Divide by 1e9 (@const ProCore 0x123558, f64=1000000000.0). The
  //   machine performs an f64 divsd; JavaScript number division is f64
  //   IEEE-754, so this is bit-exact for finite operands.
  //   Constant provenance: raw-port/army/tools/resolve.py ProCore ripconst
  //   0x15837 0x10dd19 8 -> target VA 0x123558 f64=1000000000.0.
  const NS_PER_SEC: number = 1000000000.0; // @const ProCore 0x123558 (f64)
  const secondsResult: number = acc_f64 / NS_PER_SEC;

  // @0x1583f..0x15843  epilogue + return xmm0.
  return secondsResult;
}
