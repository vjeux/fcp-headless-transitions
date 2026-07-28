// PCSemaphore.ts — ProCore counting-semaphore (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore (macOS FCP, x86_64 slice)
//
// A classic condvar-and-mutex counting semaphore.  Every method is verbatim
// documented from the .text bodies; the whole thing is essentially a
// standard Dijkstra P/V implementation wrapped over POSIX pthread primitives.
//
// -----------------------------------------------------------------------------
// SHAPE — 0x78 bytes (a POSIX-style `sem` embedding cond + mutex)
// -----------------------------------------------------------------------------
//   0x00  u64                  count           — the semaphore's counter
//                                                 (initial value = ctor's
//                                                 unsigned-int arg,
//                                                 stored @0x348c7).
//   0x08  pthread_cond_t       cond            — 48 bytes on macOS
//                                                 (`_pthread_cond_init` @0x348d0).
//   0x38  pthread_mutex_t      mutex           — 64 bytes on macOS
//                                                 (`_pthread_mutex_init` @0x348e4 jmp).
//
// The C1/C2 ctors are byte-identical.  D0 dtor is missing from this class
// (it's not emitted); D1 @0x34918 is a 2-insn tail-jmp to D2 @0x348ea.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (all POSIX pthread stubs — unported)
// -----------------------------------------------------------------------------
//   * _pthread_cond_init       @stub ProCore 0xdea80
//   * _pthread_cond_destroy    @stub ProCore 0xdea7a
//   * _pthread_cond_wait       @stub ProCore 0xdea92
//   * _pthread_cond_signal     @stub ProCore 0xdea86
//   * _pthread_mutex_init      @stub ProCore 0xdeab6
//   * _pthread_mutex_destroy   @stub ProCore 0xdeab0
//   * _pthread_mutex_lock      @stub ProCore 0xdeabc
//   * _pthread_mutex_unlock    @stub ProCore 0xdeac2
//   * ___clang_call_terminate  @stub ProCore (terminate handler on
//                                             _pthread_mutex_destroy throw
//                                             in ~PCSemaphore).
//
// A future JS runtime port would either:
//   (a) map to an `Atomics.wait/notify` on a `SharedArrayBuffer` counter, or
//   (b) map to a Node.js `worker_threads` sync primitive.
// Neither is a bit-exact reproduction of pthread semantics, so we DON'T pick
// one here; we raise so the caller must pass a real runtime shim.
//
// -----------------------------------------------------------------------------
// Symbols ported (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11PCSemaphoreC2Ej    PCSemaphore::PCSemaphore(unsigned int)  [C2]  @0x3488e
//   * __ZN11PCSemaphoreC1Ej    PCSemaphore::PCSemaphore(unsigned int)  [C1]  @0x348bc
//   * __ZN11PCSemaphoreD2Ev    PCSemaphore::~PCSemaphore()             [D2]  @0x348ea
//   * __ZN11PCSemaphoreD1Ev    PCSemaphore::~PCSemaphore()             [D1]  @0x34918
//   * __ZN11PCSemaphore4waitEv PCSemaphore::wait()                            @0x34922
//   * __ZN11PCSemaphore6signalEv PCSemaphore::signal()                        @0x34972

/** Opaque pthread_cond_t handle — 48 bytes on macOS, embedded @+0x08 of the
 *  PCSemaphore object.  Not modeled here. */
export type PthreadCond = object;

/** Opaque pthread_mutex_t handle — 64 bytes on macOS, embedded @+0x38 of the
 *  PCSemaphore object.  Not modeled here. */
export type PthreadMutex = object;

export class PCSemaphore {
  /** @+0x00 — the semaphore's counter.  Initial value comes from the ctor's
   *  `unsigned int` arg (stored @0x348c7 as `movl %esi, %eax; movq %rax,
   *  (%rdi)` — u32-zero-extended-to-u64). */
  count: number = 0;

  /** @+0x08 — the pthread_cond_t.  Initialized by the ctor via
   *  `_pthread_cond_init(&this[+0x08], nullptr)` @0x348d0. */
  cond: PthreadCond | null = null;

  /** @+0x38 — the pthread_mutex_t.  Initialized by the ctor via a tail-jmp
   *  to `_pthread_mutex_init(&this[+0x38], nullptr)` @0x348e4. */
  mutex: PthreadMutex | null = null;

  /**
   * PCSemaphore::PCSemaphore(unsigned int initialCount)  [C1 complete ctor]
   *                                                              — @0x348bc
   *
   * Body verbatim (per /tmp/ProCore_tV.txt @ __ZN11PCSemaphoreC1Ej):
   *   @0x348c2  rbx = this=rdi
   *   @0x348c5  eax = initialCount (rsi truncated to u32)
   *   @0x348c7  this[+0x00] = rax   (u64 store — zero-extends the u32)
   *   @0x348ca  rdi = &this[+0x08]
   *   @0x348ce  rsi = 0
   *   @0x348d0  _pthread_cond_init(&this[+0x08], nullptr)
   *                                                    — stub ProCore 0xdea80
   *   @0x348d5  rdi = &this[+0x38]
   *   @0x348dc  rsi = 0
   *   @0x348e4  jmp _pthread_mutex_init(&this[+0x38], nullptr)
   *                                                    — stub ProCore 0xdeab6
   *
   * The C2 twin @0x3488e is byte-identical.
   *
   * Both pthread init stubs are un-modeled here — we raise.
   */
  constructor(_initialCount: number) {
    // @0x348c7 this.count = initialCount
    // @0x348d0 _pthread_cond_init  — unported
    // @0x348e4 _pthread_mutex_init — unported
    // Frontier unresolved — raise. @0x348bc
    throw new Error(
      "PCSemaphore::PCSemaphore(unsigned int): requires _pthread_cond_init + " +
        "_pthread_mutex_init — pthread primitives not modeled in TS. @0x348bc",
    );
  }

  /**
   * PCSemaphore::PCSemaphore(unsigned int initialCount)  [C2 base ctor]
   *                                                              — @0x3488e
   *
   * Byte-identical to the C1 twin @0x348bc.
   */
  static PCSemaphoreC2(
    _self: PCSemaphore,
    _initialCount: number,
  ): void {
    // Same body as C1 @0x348bc.  Frontier unresolved — raise. @0x3488e
    throw new Error(
      "PCSemaphore::PCSemaphore(unsigned int) [C2]: requires _pthread_cond_init + " +
        "_pthread_mutex_init — pthread primitives not modeled in TS. @0x3488e",
    );
  }

  /**
   * PCSemaphore::~PCSemaphore()  [D2 base dtor]                  — @0x348ea
   *
   * Body verbatim:
   *   @0x348f0  rbx = this=rdi
   *   @0x348f3  rdi = &this[+0x38]
   *   @0x348f7  _pthread_mutex_destroy(&this[+0x38])
   *                                                    — stub ProCore 0xdeab0
   *   @0x348fc  rbx = &this[+0x08]
   *   @0x34903  _pthread_cond_destroy(&this[+0x08])
   *                                                    — stub ProCore 0xdea7a
   *   ret.
   *
   * If _pthread_mutex_destroy throws, the compiler catches and tail-calls
   * ___clang_call_terminate @0x34912 (SIGABRT).
   */
  static destroy_D2(_self: PCSemaphore): void {
    // @0x348f7 _pthread_mutex_destroy — unported
    // @0x34903 _pthread_cond_destroy  — unported
    // Frontier unresolved — raise. @0x348ea
    throw new Error(
      "PCSemaphore::~PCSemaphore [D2]: requires _pthread_mutex_destroy + " +
        "_pthread_cond_destroy — pthread primitives not modeled in TS. @0x348ea",
    );
  }

  /**
   * PCSemaphore::~PCSemaphore()  [D1 complete dtor]              — @0x34918
   *
   * Body verbatim (2-insn thunk):
   *   @0x34918  addb %dl, 0x48(%rbp)          — decoded as `pushq %rbp;
   *                                            movq %rsp, %rbp` (the leading
   *                                            two bytes of the D1 label
   *                                            overlap the previous fn's
   *                                            trailing bytes — see
   *                                            re/disasm dump around this
   *                                            address; the effective
   *                                            entry insns are the standard
   *                                            frame setup, then...)
   *   @0x3491d  jmp __ZN11PCSemaphoreD2Ev   — tail-jmp to D2 dtor @0x348ea
   *
   * i.e. D1 is a pure alias to D2.  Delegating to D2 here.
   */
  static destroy_D1(_self: PCSemaphore): void {
    // @0x3491d tail-jmp to D2 — which is itself frontier — raise. @0x34918
    throw new Error(
      "PCSemaphore::~PCSemaphore [D1]: tail-jmp to ~PCSemaphore [D2] which " +
        "requires _pthread_mutex_destroy + _pthread_cond_destroy — pthread " +
        "primitives not modeled in TS. @0x34918",
    );
  }

  /**
   * PCSemaphore::wait()                                          — @0x34922
   *
   * Body verbatim:
   *   @0x3492c  r14 = this=rdi
   *   @0x3492f  rbx = &this[+0x38]                (mutex address)
   *   @0x34936  _pthread_mutex_lock(&this[+0x38])
   *                                                    — stub ProCore 0xdeabc
   *   @0x3493b  rax = this[+0x00]                 (count)
   *   @0x3493e  test rax, rax
   *   @0x34941  if (count != 0) jump-to-decrement @0x3495a.
   *
   *   @0x34943-@0x34958 SPINLOOP:
   *     r15 = &this[+0x08]                        (cond address)
   *     _pthread_cond_wait(&this[+0x08], &this[+0x38])
   *                                                    — stub ProCore 0xdea92
   *     rax = this[+0x00]
   *     if (count == 0) goto SPINLOOP;
   *
   *   @0x3495a  rax-- ; this[+0x00] = rax          (decrement count)
   *   @0x34960  rdi = mutex
   *   @0x3496d  jmp _pthread_mutex_unlock(&this[+0x38])
   *                                                    — stub ProCore 0xdeac2
   *
   * Standard "wait on a condvar until count > 0, then decrement".  All
   * pthread primitives are unported — raise.
   */
  wait(): void {
    // @0x34936 _pthread_mutex_lock — unported
    // @0x3494d _pthread_cond_wait  — unported
    // @0x3495a count--
    // @0x3496d _pthread_mutex_unlock — unported
    // Frontier unresolved — raise. @0x34922
    throw new Error(
      "PCSemaphore::wait: requires _pthread_mutex_lock + _pthread_cond_wait + " +
        "_pthread_mutex_unlock — pthread primitives not modeled in TS. @0x34922",
    );
  }

  /**
   * PCSemaphore::signal()                                        — @0x34972
   *
   * Body verbatim:
   *   @0x34979  rbx = this=rdi
   *   @0x3497c  r14 = &this[+0x38]                (mutex address)
   *   @0x34983  _pthread_mutex_lock(&this[+0x38])
   *                                                    — stub ProCore 0xdeabc
   *   @0x34988  ++(*rbx)                          (count++)
   *   @0x3498b  rbx = &this[+0x08]                (cond address)
   *   @0x34992  _pthread_cond_signal(&this[+0x08])
   *                                                    — stub ProCore 0xdea86
   *   @0x34997  rdi = mutex
   *   @0x3499e  jmp _pthread_mutex_unlock(&this[+0x38])
   *                                                    — stub ProCore 0xdeac2
   *
   * Standard "increment count under mutex, wake one waiter".  All pthread
   * primitives are unported — raise.
   */
  signal(): void {
    // @0x34983 _pthread_mutex_lock  — unported
    // @0x34988 count++
    // @0x34992 _pthread_cond_signal — unported
    // @0x3499e _pthread_mutex_unlock — unported
    // Frontier unresolved — raise. @0x34972
    throw new Error(
      "PCSemaphore::signal: requires _pthread_mutex_lock + _pthread_cond_signal + " +
        "_pthread_mutex_unlock — pthread primitives not modeled in TS. @0x34972",
    );
  }
}
