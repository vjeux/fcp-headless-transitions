// HGSynchronizable — Helium's recursive mutex primitive (Lock/Unlock/TryLock).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/Helium.__ZN16HGSynchronizable4LockEv.s
//
// This unit ports ONLY `HGSynchronizable::Lock()` at @0x194a40. The
// class's other methods (Unlock, TryLock, ctor/dtor, ...) are separate
// ledger entries and are OUT OF SCOPE for this file — they will be
// added when their own ledger entries are claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from Lock body)
// -----------------------------------------------------------------------------
// Lock reads/writes three fields:
//   +0x08  pthread_mutex_t  — the embedded POSIX mutex; Lock passes
//                             `this + 0x8` as the pthread_mutex_lock argument
//                             @0x194a58. Assumed contiguous 64-byte macOS
//                             mutex, matching PCMutex's layout (see
//                             raw-port/src/infra/PCMutex.ts) which also has
//                             `pthread_mutex_t` at +0x08 after a vptr word.
//   +0x48  ownerTid : u64   — the pthread_self() token of the current owner,
//                             OR 0 when unlocked. Lock reads it @0x194a4a
//                             (into %r14) to compare against the calling
//                             thread's id @0x194a53, and writes the fresh
//                             owner @0x194a6e after acquiring the mutex.
//   +0x50  recurseCount:u64 — recursion depth. Lock resets to 0 on the
//                             OUTERMOST acquire @0x194a61 (movq $0, 0x50)
//                             and increments (`incq`) on every recursive
//                             re-acquire @0x194a77.
//
// The class has a vptr at +0x00 by C++ convention (this is a polymorphic
// synchronization primitive — see HGSynchronizer.ts, which stores an
// HGSynchronizable* and invokes ->Unlock() virtually). Lock does not
// touch it. Total size ≥ 0x58; exact size will be pinned by the ctor
// port.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (both TRUE OUT-OF-SCOPE externs — libSystem / pthread)
// -----------------------------------------------------------------------------
//   * _pthread_self          @Helium stub 0x3c559a
//                            — Darwin libSystem thread-id primitive.
//                            Called @0x194a4e AND @0x194a69. TRUE
//                            out-of-scope extern (libSystem.B.dylib).
//                            Modelled the same way as
//                            raw-port/src/infra/PCSharedMutex.ts:
//                            an injectable stub that raises until wired.
//   * _pthread_mutex_lock    @Helium stub 0x3c556a
//                            — POSIX mutex acquire. Called @0x194a5c
//                            with `this + 0x8` (the embedded mutex).
//                            TRUE out-of-scope extern
//                            (libSystem.B.dylib).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN16HGSynchronizable4LockEv
//       — HGSynchronizable::Lock() @Helium 0x194a40
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN16HGSynchronizable4LockEv.s)
// -----------------------------------------------------------------------------
//   0x194a40  pushq  %rbp                               ; frame prologue
//   0x194a41  movq   %rsp, %rbp
//   0x194a44  pushq  %r14
//   0x194a46  pushq  %rbx
//   0x194a47  movq   %rdi, %rbx                         ; rbx = this
//   0x194a4a  movq   0x48(%rdi), %r14                   ; r14 = this->ownerTid
//   0x194a4e  callq  _pthread_self                      ; rax = current tid
//   0x194a53  cmpq   %rax, %r14                         ; ownerTid - currentTid
//                                                       ;   (AT&T dst-src:
//                                                       ;    dst=r14, src=rax
//                                                       ;    → tests r14==rax,
//                                                       ;    i.e. same owner?)
//   0x194a56  je     0x194a77                           ; if recursive → recurse
//   0x194a58  leaq   0x8(%rbx), %rdi                    ; rdi = &this->mutex
//   0x194a5c  callq  _pthread_mutex_lock                ; block until acquired
//   0x194a61  movq   $0x0, 0x50(%rbx)                   ; this->recurseCount = 0
//   0x194a69  callq  _pthread_self                      ; rax = current tid
//   0x194a6e  movq   %rax, 0x48(%rbx)                   ; this->ownerTid = tid
//   0x194a72  popq   %rbx                               ; epilogue
//   0x194a73  popq   %r14
//   0x194a75  popq   %rbp
//   0x194a76  retq
//   0x194a77  incq   0x50(%rbx)                         ; ++this->recurseCount
//   0x194a7b  popq   %rbx                               ; epilogue (recursive path)
//   0x194a7c  popq   %r14
//   0x194a7e  popq   %rbp
//   0x194a7f  retq

// =========================================================================
// Frontier stubs — undecoded external callees (both libSystem/pthread)
// =========================================================================

/** `_pthread_self` @Helium stub 0x3c559a — Darwin libSystem thread-id
 *  primitive. Called from Lock @0x194a4e (initial owner check) and
 *  @0x194a69 (owner-tid write after acquiring the mutex). TS has no
 *  direct thread notion; the port matches PCSharedMutex's discipline —
 *  a caller-supplied override is the only faithful proxy. */
function pthread_self_stub(): bigint {
  throw new Error(
    "_pthread_self @Helium 0x3c559a (stub) — provide a thread-id source via HGSynchronizable.setPthreadSelf(fn)",
  );
}

let _pthread_self_impl: () => bigint = pthread_self_stub;

/** `_pthread_mutex_lock` @Helium stub 0x3c556a — POSIX mutex acquire.
 *  Called from Lock @0x194a5c with `&this->mutex`. In a single-threaded
 *  JS realm the "acquire an uncontended mutex" operation is observably
 *  a no-op except for the memory barrier (which JS cannot model). We
 *  preserve the call site as an injectable stub so external drivers can
 *  observe/wrap the acquire event faithfully. Default behaviour:
 *  no-op (matches the fast-path semantics under a single-threaded
 *  runtime); this mirrors PCSharedMutex.ts's std_mutex_lock_stub
 *  handling of an analogous libc++ stub. */
function pthread_mutex_lock_default(_mutexPtr: HGSynchronizable): void {
  // No-op faithful to single-thread semantics; see the discussion in
  // raw-port/src/infra/PCSharedMutex.ts around std_mutex_lock_stub.
}

let _pthread_mutex_lock_impl: (m: HGSynchronizable) => void =
  pthread_mutex_lock_default;

// =========================================================================
// The class
// =========================================================================

/**
 * `HGSynchronizable` — Helium's recursive mutex base. Instances embed
 * a POSIX pthread_mutex_t at +0x08, an owner-tid word at +0x48, and a
 * recursion-count word at +0x50 (see file header for the derivation).
 *
 * Only `Lock()` is ported by this unit. The class is polymorphic (a
 * vptr sits at +0x00 by C++ convention — HGSynchronizer.ts invokes
 * ->Unlock() virtually), so future units may add virtual-slot bindings.
 */
export class HGSynchronizable {
  /** @+0x00 vptr — C++ virtual table pointer. Not touched by Lock; kept
   *  as `null` until a ctor port pins the concrete vtable address. */
  vptr: unknown = null;

  /** @+0x08 pthread_mutex_t — the embedded POSIX mutex. Modelled as an
   *  opaque handle (the pthread_mutex_lock stub receives `this`, since
   *  the offset is a compile-time constant and JS has no pointer
   *  arithmetic). Its internal 64-byte state is not observable to
   *  Lock — the call to _pthread_mutex_lock is the entire interaction. */
  // (No TS field needed — the stub takes `this` as the mutex handle.)

  /** @+0x48 ownerTid — pthread_self() token of the current owner, or 0
   *  when unlocked. Read @0x194a4a, written @0x194a6e. */
  ownerTid: bigint = 0n;

  /** @+0x50 recurseCount — recursion depth. Reset to 0 on the outermost
   *  acquire @0x194a61; incremented (`incq`) on recursive re-acquire
   *  @0x194a77. */
  recurseCount: bigint = 0n;

  /**
   * Install a caller-supplied `pthread_self()` implementation. Real
   * clients pass a stable per-thread/per-fiber token; the algorithm
   * (owner-vs-current comparison at @0x194a53) is invariant under any
   * bijection of "thread identity".
   */
  static setPthreadSelf(fn: () => bigint): void {
    _pthread_self_impl = fn;
  }

  /**
   * Install a caller-supplied `pthread_mutex_lock()` implementation.
   * Default is a no-op (see pthread_mutex_lock_default). External
   * drivers wanting to observe or serialise the acquire event can
   * override.
   */
  static setPthreadMutexLock(fn: (m: HGSynchronizable) => void): void {
    _pthread_mutex_lock_impl = fn;
  }

  /**
   * `HGSynchronizable::Lock()` @Helium 0x194a40
   * (__ZN16HGSynchronizable4LockEv).
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Textbook recursive-mutex acquire:
   *
   *   1. Read `this->ownerTid` (@0x194a4a).
   *   2. Compare to `pthread_self()` (@0x194a4e/0x194a53).
   *   3. If they match → this is a recursive re-acquire by the current
   *      owner: increment `recurseCount` (@0x194a77) and return.
   *   4. Otherwise → this is a fresh acquire: block on
   *      `pthread_mutex_lock(&this->mutex)` (@0x194a5c), then reset
   *      `recurseCount = 0` (@0x194a61) and store the current tid into
   *      `ownerTid` (@0x194a6e).
   *
   * The AT&T `cmpq %rax, %r14` @0x194a53 computes `r14 - rax`
   * = `ownerTid - currentTid`; the following `je` fires iff they are
   * equal (i.e. the calling thread is already the owner). This is the
   * standard recursive-mutex fast path.
   */
  Lock(): void {
    // ------------------------------------------------------------
    // @0x194a40..0x194a47 — prologue; rbx = this.
    // (No TS-visible effect.)
    // @0x194a4a — r14 = this->ownerTid.
    // ------------------------------------------------------------
    const owner: bigint = this.ownerTid;
    // ------------------------------------------------------------
    // @0x194a4e — rax = _pthread_self().
    // @0x194a53..0x194a56 — cmpq %rax,%r14; je recursive
    //   AT&T dst-src: dst=r14=owner, src=rax=self → tests owner == self.
    // ------------------------------------------------------------
    const self: bigint = _pthread_self_impl();
    if (owner === self) {
      // ------------------------------------------------------------
      // @0x194a77 — incq 0x50(%rbx); this->recurseCount++.
      // @0x194a7b..0x194a7f — epilogue, return.
      // ------------------------------------------------------------
      this.recurseCount = this.recurseCount + 1n;
      return;
    }
    // ------------------------------------------------------------
    // @0x194a58 — rdi = &this->mutex  (this + 0x8).
    // @0x194a5c — callq _pthread_mutex_lock (blocking acquire).
    // ------------------------------------------------------------
    _pthread_mutex_lock_impl(this);
    // ------------------------------------------------------------
    // @0x194a61 — movq $0, 0x50(%rbx); this->recurseCount = 0.
    // ------------------------------------------------------------
    this.recurseCount = 0n;
    // ------------------------------------------------------------
    // @0x194a69 — rax = _pthread_self().
    // @0x194a6e — movq %rax, 0x48(%rbx); this->ownerTid = tid.
    // @0x194a72..0x194a76 — epilogue, return.
    // ------------------------------------------------------------
    this.ownerTid = _pthread_self_impl();
  }
}
