/**
 * PCTimer.ts — ProCore's PCTimer class. A small stopwatch built on
 * std::chrono::steady_clock.
 *
 * Transcribed from ProCore.framework:
 *   PCTimer::start()  @0x15760  __ZN7PCTimer5startEv
 *   (see raw-port/re/disasm/ProCore.__ZN7PCTimer5startEv.s)
 *
 * ── STRUCT LAYOUT (recovered from PCTimer::start @0x15760) ─────────────
 * The ctor stores three distinct pieces at three widths at offsets 0/8/10,
 * so the class has at least those three fields packed:
 *
 *   +0x00  startTick   : u64    — result of `std::chrono::steady_clock::now()`
 *                                 (a chrono::time_point<steady_clock, nanoseconds>
 *                                  fits in a single 64-bit register on macOS x86_64;
 *                                  the returned rep is stored directly as a u64).
 *   +0x08  accumulator : u64    — zeroed on start(). Other PCTimer methods
 *                                 (pause/reset/elapsed) — not yet ported —
 *                                 will read/update this to accumulate paused
 *                                 duration between start()/stop() cycles.
 *   +0x10  running     : u8/bool — set to 1 on start(). Guards elapsed()
 *                                 against reading an uninitialised startTick.
 *   size ≥ 0x18 (fields observed at offsets 0/8/10; upper bound is a frontier).
 *
 * Only PCTimer::start() is transcribed in this pass; every other PCTimer
 * method is FRONTIER and will be added when its symbol is claimed. The
 * layout above is what start() proves — reviewer additions may widen it.
 */

/**
 * `std::__1::chrono::steady_clock::now()` — libc++ extern.
 *
 * Called from PCTimer::start() @0x15769 via
 *   callq 0xde666  ## symbol stub for: __ZNSt3__16chrono12steady_clock3nowEv
 *
 * TRUE out-of-scope extern (libc++.dylib). Returns a chrono::time_point
 * whose underlying rep on macOS x86_64 is a 64-bit tick count (Mach absolute
 * time converted to nanoseconds, per libc++'s macOS impl). We cannot compute
 * this ourselves without a live libc++ implementation of the steady clock;
 * we honor the extern-boundary convention (see PCColorSpaceHandle_operator_lt
 * and createExtendedColorSpace) — throw citing @0xADDR so any live code path
 * that hits the boundary fails loud instead of fabricating a tick value.
 */
function chrono_steady_clock_now_stub(): bigint {
  // @ProCore imported-stub 0xde666  (__ZNSt3__16chrono12steady_clock3nowEv)
  throw new Error(
    "std::chrono::steady_clock::now() @ProCore stub 0xde666 — " +
      "libc++.dylib extern (TRUE out-of-scope). Called from " +
      "PCTimer::start() @ProCore 0x15769. Not modelled: JS has no libc++ " +
      "steady clock and the returned 64-bit tick rep is defined by that " +
      "runtime. Any live caller must be re-routed to a host-provided clock.",
  );
}

export class PCTimer {
  /**
   * +0x00 — steady_clock tick stamp captured at the last start().
   * Stored raw as a u64 (bigint) to match the machine store
   * `movq %rax, (%rbx)` at @ProCore 0x1576e.
   */
  public startTick: bigint = 0n;

  /**
   * +0x08 — accumulated paused/elapsed ticks. Zeroed by start().
   * The store `movq $0x0, 0x8(%rbx)` at @ProCore 0x15771 provides the
   * offset (0x8) and the width (u64) directly; the field is packed as
   * bigint to preserve full 64-bit precision.
   */
  public accumulator: bigint = 0n;

  /**
   * +0x10 — running flag. `movb $0x1, 0x10(%rbx)` @ProCore 0x15779.
   * Written as a single byte — modelled as a boolean.
   */
  public running: boolean = false;

  /**
   * `PCTimer::start()`  @ProCore 0x15760  `__ZN7PCTimer5startEv`
   *
   * Full disassembly (raw-port/re/disasm/ProCore.__ZN7PCTimer5startEv.s):
   *
   *   0x15760  pushq %rbp
   *   0x15761  movq  %rsp, %rbp
   *   0x15764  pushq %rbx
   *   0x15765  pushq %rax                        ; 16-byte-align rsp
   *   0x15766  movq  %rdi, %rbx                  ; rbx = this
   *   0x15769  callq 0xde666                     ; symbol stub for
   *                                              ;   std::chrono::steady_clock::now()
   *   0x1576e  movq  %rax, (%rbx)                ; this->startTick = now()
   *   0x15771  movq  $0x0, 0x8(%rbx)             ; this->accumulator = 0
   *   0x15779  movb  $0x1, 0x10(%rbx)            ; this->running = 1
   *   0x1577d  addq  $0x8, %rsp
   *   0x15781  popq  %rbx
   *   0x15782  popq  %rbp
   *   0x15783  retq
   *
   * Semantics: (re)start the stopwatch. Snapshot the monotonic clock,
   * clear any accumulated paused ticks, and mark the timer running.
   * This is a re-entrant "start" — not a "resume": the accumulator is
   * always zeroed, discarding any previously-measured interval.
   *
   * The `pushq %rax` at 0x15765 is a stack-alignment scratch, not a
   * live value — it's popped later by `addq $0x8, %rsp` at 0x1577d.
   * No JS analogue.
   */
  public start(): void {
    // @0x15769  callq std::chrono::steady_clock::now()
    const now = chrono_steady_clock_now_stub();
    // @0x1576e  movq %rax, (%rbx)     -> this->startTick = now
    this.startTick = now;
    // @0x15771  movq $0x0, 0x8(%rbx)  -> this->accumulator = 0
    this.accumulator = 0n;
    // @0x15779  movb $0x1, 0x10(%rbx) -> this->running = 1
    this.running = true;
  }
}
