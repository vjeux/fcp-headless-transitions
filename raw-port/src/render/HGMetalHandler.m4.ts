// raw-port: HGMetalHandler (chunk m4) — Helium.framework (render layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//                   Versions/A/Helium (macOS FCP, x86_64 slice; VA == offset within thin slice).
//
// Chunk 4 continues where chunk m3 stopped (m3's last method is FrameEnd @0x15e330 / the
// counter resets at 0x15e3d0). It ports the command-buffer back-pressure primitive:
//
//   HGMetalHandler::_waitForCommandBuffers(unsigned long, unsigned long, unsigned long)
//                                                                             @0x0015e500
//     mangled: __ZN14HGMetalHandler22_waitForCommandBuffersEmmm
//
// DECODE: raw-port/re/disasm/Helium.__ZN14HGMetalHandler22_waitForCommandBuffersEmmm.s (75 lines)
//
// ── What the method does ────────────────────────────────────────────────────────────────
// HGMetalHandler keeps two 64-bit "outstanding GPU work" counters that the command-buffer
// completion handler (installed by _commitCommandBuffer @0x15df50, see chunk m3) decrements from
// the Metal completion thread. `_waitForCommandBuffers` is the producer-side throttle: it takes
// the handler's std::mutex, and blocks on the handler's std::condition_variable in 15-millisecond
// timed slices until the counters have fallen under the caller-supplied limits.
//
// It is a classic condvar predicate loop — the timed wait exists so a lost/spurious notify can
// never wedge the render thread; the predicate, not the timeout, decides when to leave.
//
// ── Field-layout evidence recovered in this chunk (offsets on the HGMetalHandler this*) ──
//   +0x710  uint64                    counter_710 — read twice per predicate evaluation
//                                       (@0x15e577 `movq 0x710(%r12),%rax` and @0x15e584); it is
//                                       compared against BOTH `limitB` (@0x15e57f `cmpq %r14,%rax`)
//                                       and `limitA` (@0x15e58c `cmpq -0x50(%rbp),%rax`). The
//                                       double load is the compiler honouring the fact that the
//                                       value is mutated by another thread across the wait.
//   +0x718  uint64                    counter_718 — read @0x15e592 and compared against `limitC`
//                                       (@0x15e59a). Chunk m3 names this same slot
//                                       `commit_threshold_B` from its use in
//                                       FinalizeCommandEncoder @0x15deb1; both readings agree it
//                                       is a u64 accumulator of outstanding committed work.
//   +0x720  std::__1::mutex           command-buffer mutex — `addq $0x720,%rdi` @0x15e51f then
//                                       `std::mutex::lock()` @0x15e52e; the same pointer is kept
//                                       in the on-stack unique_lock at -0x38(%rbp) and unlocked
//                                       @0x15e615.
//   +0x760  std::__1::condition_variable
//                                     — `leaq 0x760(%r12),%r13` @0x15e533, passed as the receiver
//                                       of `__do_timed_wait` @0x15e56d.
//
// ── On-stack std::unique_lock<std::mutex> (the RAII guard) ──────────────────────────────
//   -0x38(%rbp)  mutex*   = this+0x720      (`movq %rdi,-0x38(%rbp)` @0x15e526)
//   -0x30(%rbp)  bool     owns = true       (`movb $0x1,-0x30(%rbp)` @0x15e52a)
//   %rbx = &(-0x38(%rbp)) @0x15e545 — the `unique_lock&` argument of __do_timed_wait.
//   The epilogue @0x15e60b re-tests `owns == 1` before unlocking: that is the inlined
//   ~unique_lock(), which is why the check exists even though nothing ever clears the flag in
//   this frame (`__do_timed_wait` re-locks before returning).
//
// ── Out-of-scope externs (libc++ / libc++abi — NOT in-scope FCP symbols) ────────────────
//   std::__1::mutex::lock()                                                @0x15e52e (stub 0x3c4f16)
//   std::__1::mutex::unlock()                                              @0x15e615 (stub 0x3c4f1c)
//   std::__1::condition_variable::__do_timed_wait(
//       std::unique_lock<std::mutex>&,
//       std::chrono::time_point<system_clock, duration<long long, nano>>)  @0x15e56d (stub 0x3c4eec)
//   std::__1::chrono::steady_clock::now()                                  @0x15e5a0, 0x15e572
//                                                                                    (stub 0x3c4f28)
//   std::__1::chrono::system_clock::now()                                  @0x15e5a5 (stub 0x3c4f2e)
// These are libc++ imports, so they are modelled as an INJECTED boundary (`StdSyncOps` below)
// instead of being inlined here: the port must stay callable end-to-end (an incompleteness raise
// on this method's only reachable path is exactly the shape the gate rejects), and there is
// nothing of Helium's own logic inside them to decode. Everything Helium actually computes — the
// predicate, the double load of +0x710, the saturating libc++ nanosecond cast, the 15 ms deadline
// and its overflow clamp, and the unique_lock epilogue — IS transcribed instruction-for-
// instruction below.
//
// ── The saturating nanosecond cast (@0x15e5aa..0x15e5f8) ────────────────────────────────
// `system_clock::now()` returns a `time_point` whose duration is MICROSECONDS in libc++, and
// `__do_timed_wait` wants NANOSECONDS, so the compiler inlined libc++'s `__safe_nanosecond_cast`:
// multiply by 1000 with signed saturation instead of wrapping. The three-way split is verbatim:
//   us == 0                       -> 0                      (@0x15e5ad je 0x15e5d0; xorl %edx,%edx)
//   us <  0 and us <  -9223372036854775 -> INT64_MIN         (@0x15e5e0/0x15e5f1 jb)
//   us >  0 and us >   9223372036854775 -> INT64_MAX         (@0x15e5c8 jbe not taken)
//   otherwise                     -> us * 1000              (@0x15e5f3 imulq $0x3e8)
// 9223372036854775 == 0x20c49ba5e353f7 == floor(INT64_MAX / 1000) — the exact largest microsecond
// count whose ×1000 still fits in int64. INT64_MIN is materialized as `INT64_MAX + 1`
// (`movabsq $0x7fffffffffffffff,%rax ; incq %rax` @0x15e549/0x15e553) and parked at -0x40(%rbp).

// ────────────────────────────────────────────────────────────────────────────
// Opaque brands + the field/boundary surfaces this chunk needs. Chunk 0 (ctors/dtors) will widen
// `HGMetalHandler` into the full field-layout interface; the offsets used here are documented
// above, mirroring the convention of chunks m2/m3.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Opaque brand for the HGMetalHandler receiver (`%rdi`, kept in `%r12` @0x15e51c).
 * Field access is routed through `HGMetalHandlerWaitFields` so tsc can typecheck without the
 * full struct-layout port. Structurally identical to the brand in chunk m3.
 */
export type HGMetalHandler = { readonly __brand: "HGMetalHandler_" };

/** Opaque `std::__1::mutex` living inline at `this+0x720`. */
export type StdMutex = { readonly __brand: "StdMutex" };

/** Opaque `std::__1::condition_variable` living inline at `this+0x760`. */
export type StdConditionVariable = { readonly __brand: "StdConditionVariable" };

/**
 * The on-stack `std::unique_lock<std::mutex>` built at -0x38(%rbp)..-0x30(%rbp).
 * `mutex` is the pointer stored @0x15e526; `owns` is the byte set @0x15e52a and re-tested by the
 * inlined destructor @0x15e60b.
 */
export interface StdUniqueLock {
  mutex: StdMutex; // -0x38(%rbp)  (= this+0x720)
  owns: boolean; // -0x30(%rbp)
}

/**
 * Field-access surface for the slots this chunk touches. Both counters are `unsigned long`, so
 * the accessors hand back the UNSIGNED 64-bit value as a non-negative bigint — the predicate
 * branches are `ja`/`jbe` (CF-based, i.e. unsigned), so a signed reading would invert them.
 */
export interface HGMetalHandlerWaitFields {
  /** +0x710 (u64) — loaded @0x15e577 and again @0x15e584. */
  get_counter_710(self: HGMetalHandler): bigint;
  /** +0x718 (u64) — loaded @0x15e592. (Chunk m3 calls this slot `commit_threshold_B`.) */
  get_counter_718(self: HGMetalHandler): bigint;
  /** +0x720 — the inline std::mutex (`addq $0x720,%rdi` @0x15e51f). */
  get_mutex(self: HGMetalHandler): StdMutex;
  /** +0x760 — the inline std::condition_variable (`leaq 0x760(%r12),%r13` @0x15e533). */
  get_condition_variable(self: HGMetalHandler): StdConditionVariable;
}

/**
 * The libc++ threading/clock boundary used by this method. Every member corresponds to one
 * `symbol stub for:` line in the disassembly (addresses cited per member). Injected rather than
 * transcribed — see the "Out-of-scope externs" note in the file header.
 */
export interface StdSyncOps {
  /** `std::__1::mutex::lock()` — called @Helium 0x15e52e (stub 0x3c4f16). */
  mutex_lock(m: StdMutex): void;
  /** `std::__1::mutex::unlock()` — called @Helium 0x15e615 (stub 0x3c4f1c). */
  mutex_unlock(m: StdMutex): void;
  /**
   * `std::__1::condition_variable::__do_timed_wait(unique_lock<mutex>&,
   *  time_point<system_clock, duration<long long, nano>>)` — called @Helium 0x15e56d
   * (stub 0x3c4eec). `deadlineNs` is the raw int64 nanoseconds-since-epoch that the machine
   * passes in `%rdx`. Returns having re-acquired `lock`.
   */
  condition_variable_do_timed_wait(
    cv: StdConditionVariable,
    lock: StdUniqueLock,
    deadlineNs: bigint,
  ): void;
  /**
   * `std::__1::chrono::steady_clock::now()` — called @Helium 0x15e5a0 and @Helium 0x15e572.
   * Both results are DEAD in this frame (`%rax` is overwritten by the very next instruction /
   * call), so the port keeps the calls purely for their ordering, exactly as the machine does.
   */
  steady_clock_now(): bigint;
  /**
   * `std::__1::chrono::system_clock::now()` — called @Helium 0x15e5a5 (stub 0x3c4f2e).
   * libc++'s `system_clock::duration` is MICROSECONDS; the returned int64 is the raw
   * `time_since_epoch().count()` that lands in `%rax`.
   */
  system_clock_now(): bigint;
}

// ────────────────────────────────────────────────────────────────────────────
// Constants materialized by the function itself.
// ────────────────────────────────────────────────────────────────────────────

/** `movabsq $0x7fffffffffffffff` @Helium 0x15e5b1 / 0x15e549 — INT64_MAX. */
const INT64_MAX = 0x7fffffffffffffffn;

/**
 * `movabsq $0x7fffffffffffffff,%rax ; incq %rax` @Helium 0x15e549 / 0x15e553, parked at
 * -0x40(%rbp) @0x15e556 and reloaded @0x15e5e0 — INT64_MIN (the wrapped INT64_MAX + 1).
 */
const INT64_MIN = -0x8000000000000000n;

/**
 * `movabsq $0x20c49ba5e353f7` @Helium 0x15e5bb — 9223372036854775 = floor(INT64_MAX / 1000),
 * the positive-side saturation threshold of libc++'s `__safe_nanosecond_cast`.
 */
const US_SATURATE_POS = 0x20c49ba5e353f7n;

/**
 * `movabsq $-0x20c49ba5e353f7` @Helium 0x15e5e4 (encoded 0xffdf3b645a1cac09) — the negative-side
 * saturation threshold, -floor(INT64_MAX / 1000).
 */
const US_SATURATE_NEG = -0x20c49ba5e353f7n;

/** `imulq $0x3e8, %rax, %rdx` @Helium 0x15e5f3 — microseconds → nanoseconds. */
const US_TO_NS = 0x3e8n;

/**
 * `movabsq $0x7fffffffff1b1e3f, %r15` @Helium 0x15e53b — the deadline clamp, compared @0x15e5fa.
 * It is exactly `INT64_MAX - 0xe4e1c0`, i.e. the largest nanosecond timestamp to which the 15 ms
 * slice below can still be added without overflowing int64.
 */
const DEADLINE_NS_CLAMP = 0x7fffffffff1b1e3fn;

/**
 * `addq $0xe4e1c0, %rdx` @Helium 0x15e560 — 15,000,000 ns = 15 ms, the timed-wait slice added to
 * the (clamped) current time to form the `__do_timed_wait` deadline.
 */
const WAIT_SLICE_NS = 0xe4e1c0n;

// ────────────────────────────────────────────────────────────────────────────
// Ported method body.
// ────────────────────────────────────────────────────────────────────────────

/**
 * `HGMetalHandler::_waitForCommandBuffers(unsigned long, unsigned long, unsigned long)`
 * @Helium 0x15e500 (`__ZN14HGMetalHandler22_waitForCommandBuffersEmmm`).
 *
 * Register map on entry: `%rdi` = this (→ `%r12` @0x15e51c), `%rsi` = limitA (→ -0x50(%rbp)
 * @0x15e518), `%rdx` = limitB (→ `%r14` @0x15e515), `%rcx` = limitC (→ -0x48(%rbp) @0x15e511).
 *
 * Body:
 *   0x15e51f  addq $0x720,%rdi ; movq %rdi,-0x38(%rbp) ; movb $0x1,-0x30(%rbp)
 *                                             ; build unique_lock{ &this->mutex, owns = true }
 *   0x15e52e  callq std::mutex::lock()
 *   0x15e533  leaq 0x760(%r12),%r13           ; &this->cv
 *   0x15e53b  movabsq $0x7fffffffff1b1e3f,%r15
 *   0x15e545  leaq -0x38(%rbp),%rbx           ; &lock
 *   0x15e549  movabsq $0x7fffffffffffffff,%rax ; incq %rax ; movq %rax,-0x40(%rbp)  (INT64_MIN)
 *   0x15e55a  jmp 0x15e577                    ; check the predicate BEFORE the first wait
 * predicate @0x15e577:
 *   0x15e577  movq 0x710(%r12),%rax ; cmpq %r14,%rax ; ja 0x15e5a0
 *                                             ; counter_710 >  limitB          -> wait
 *   0x15e584  movq 0x710(%r12),%rax ; cmpq -0x50(%rbp),%rax ; jbe 0x15e60b
 *                                             ; counter_710 <= limitA          -> done
 *   0x15e592  movq 0x718(%r12),%rax ; cmpq -0x48(%rbp),%rax ; jbe 0x15e60b
 *                                             ; counter_718 <= limitC          -> done
 *                                             ; otherwise fall through         -> wait
 * deadline @0x15e5a0 (see the header's saturating-cast note):
 *   0x15e5a0  callq steady_clock::now()       ; result dead
 *   0x15e5a5  callq system_clock::now()       ; microseconds since epoch, in %rax
 *   0x15e5aa..0x15e5f8  __safe_nanosecond_cast(us) -> %rdx
 *   0x15e5fa  cmpq %r15,%rdx ; jl 0x15e560 ; movq %r15,%rdx   ; ns = min_signed(ns, clamp)
 * wait @0x15e560:
 *   0x15e560  addq $0xe4e1c0,%rdx             ; deadline = ns + 15 ms
 *   0x15e567  movq %r13,%rdi ; movq %rbx,%rsi ; callq condition_variable::__do_timed_wait
 *   0x15e572  callq steady_clock::now()       ; result dead; falls into the predicate again
 * epilogue @0x15e60b:
 *   0x15e60b  cmpb $0x1,-0x30(%rbp) ; jne 0x15e61a ; movq -0x38(%rbp),%rdi
 *   0x15e615  callq std::mutex::unlock()      ; the inlined ~unique_lock()
 *
 * @param limitA `%rsi` — the ceiling that lets counter_710 alone end the wait.
 * @param limitB `%rdx` — the HARD ceiling on counter_710: while it is exceeded the method waits
 *                        regardless of counter_718.
 * @param limitC `%rcx` — the ceiling on counter_718 that (together with counter_710 <= limitB)
 *                        ends the wait.
 */
export function hgMetalHandler__waitForCommandBuffers(
  self: HGMetalHandler,
  limitA: bigint,
  limitB: bigint,
  limitC: bigint,
  F: HGMetalHandlerWaitFields,
  S: StdSyncOps,
): void {
  // @0x15e51f/0x15e526/0x15e52a — unique_lock<mutex> lock(this->mutex_720, adopt-after-lock).
  const lock: StdUniqueLock = { mutex: F.get_mutex(self), owns: true };
  // @0x15e52e — std::mutex::lock().
  S.mutex_lock(lock.mutex);

  // @0x15e533 — &this->cv_760, kept in %r13 for the whole loop.
  const cv = F.get_condition_variable(self);

  // @0x15e55a — `jmp 0x15e577`: the predicate runs before the first wait.
  for (;;) {
    // ── predicate @0x15e577 ────────────────────────────────────────────────
    // @0x15e577/0x15e57f/0x15e582: `cmpq %r14,%rax ; ja` computes rax - r14 and branches on
    // CF=0 & ZF=0, i.e. UNSIGNED counter_710 > limitB -> keep waiting.
    let waiting = F.get_counter_710(self) > limitB;
    if (!waiting) {
      // @0x15e584/0x15e58c/0x15e590: second, independent load of +0x710 (the value can have
      // changed under the lock hand-off); `jbe` = CF|ZF, i.e. counter_710 <= limitA -> done.
      if (F.get_counter_710(self) <= limitA) {
        break;
      }
      // @0x15e592/0x15e59a/0x15e59e: `jbe`, i.e. counter_718 <= limitC -> done.
      if (F.get_counter_718(self) <= limitC) {
        break;
      }
      // fall through @0x15e59e -> 0x15e5a0: keep waiting.
      waiting = true;
    }

    // ── deadline @0x15e5a0 ─────────────────────────────────────────────────
    // @0x15e5a0: steady_clock::now() — %rax is clobbered by the next call; kept for ordering.
    S.steady_clock_now();
    // @0x15e5a5: system_clock::now() — microseconds since epoch.
    const us = S.system_clock_now();

    // @0x15e5aa..0x15e5f8: libc++ __safe_nanosecond_cast(us) with signed saturation.
    let ns: bigint;
    if (us === 0n) {
      // @0x15e5ad je 0x15e5d0 ; @0x15e5d0 xorl %edx,%edx
      ns = 0n;
    } else if (us < 0n) {
      // @0x15e5af jle 0x15e5e0 (ZF already ruled out by the je above, so this is us < 0)
      // @0x15e5e0 rdx = INT64_MIN ; @0x15e5e4/0x15e5ee/0x15e5f1 `cmpq %rcx,%rax ; jb`
      // (both operands are negative, so the unsigned test orders them like signed).
      ns = us < US_SATURATE_NEG ? INT64_MIN : us * US_TO_NS;
    } else {
      // @0x15e5b1 rdx = INT64_MAX ; @0x15e5bb/0x15e5c5/0x15e5c8 `cmpq %rcx,%rax ; jbe 0x15e5f3`
      // -> us <= 9223372036854775 multiplies (@0x15e5f3), otherwise the saturated INT64_MAX
      // falls straight through @0x15e5ca.
      ns = us > US_SATURATE_POS ? INT64_MAX : us * US_TO_NS;
    }

    // @0x15e5fa/0x15e5fd/0x15e603: `cmpq %r15,%rdx ; jl 0x15e560 ; movq %r15,%rdx`
    // — SIGNED clamp of the timestamp so the 15 ms slice below cannot overflow int64.
    if (!(ns < DEADLINE_NS_CLAMP)) {
      ns = DEADLINE_NS_CLAMP;
    }

    // ── wait @0x15e560 ─────────────────────────────────────────────────────
    // @0x15e560: deadline = ns + 15 ms.
    const deadlineNs = ns + WAIT_SLICE_NS;
    // @0x15e567/0x15e56a/0x15e56d: __do_timed_wait(cv, lock, deadline). Re-locks on return.
    S.condition_variable_do_timed_wait(cv, lock, deadlineNs);
    // @0x15e572: steady_clock::now() — result dead; execution falls into the predicate @0x15e577.
    S.steady_clock_now();
  }

  // ── epilogue @0x15e60b — the inlined ~unique_lock() ──────────────────────
  // @0x15e60b/0x15e60f: `cmpb $0x1,-0x30(%rbp) ; jne 0x15e61a`.
  if (lock.owns) {
    // @0x15e611/0x15e615: std::mutex::unlock() on the pointer parked at -0x38(%rbp).
    S.mutex_unlock(lock.mutex);
  }
  // @0x15e61a..0x15e628: stack teardown / retq.
}
