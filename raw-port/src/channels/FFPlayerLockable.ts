// FFPlayerLockable — a thin lockable wrapper around a std::__1::timed_mutex
// that additionally records the *NSThread that currently owns the lock* at
// (this+0x78). Locking calls into libc++ timed_mutex::lock / try_lock /
// unlock and, on successful acquire, stores the current NSThread pointer;
// unlock zeros the slot before releasing the mutex. FAITHFUL PORT from
// Flexo.framework. Every method cites @0xADDR.
//
// Sibling family: FFPlayerLockingUtilities (helpers), FFPlayerScopedReadLock
// (RAII-scoped user of these hooks), FFPlayerLockDeferredWork,
// FFLockerWithCallbacks. See their .ts files in the same directory for the
// larger locking machinery.
//
// Provenance framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Method map (all @0xADDR refer to the x86_64 slice):
//   @0x000000000057c860  _beforeAttemptedLockHook()      (ICF-folded — empty)
//   @0x000000000057c860  _afterSuccessfulUnlockHook()    (ICF-folded — empty)
//   @0x0000000000da7b20  lock()                          (7-line body)
//   @0x0000000000da7b50  _afterSuccessfulLockHook()      (5-line body — NSThread capture)
//   @0x0000000000da7b80  try_lock()                      (branch on libc++ try_lock result)
//   @0x0000000000da7bc0  unlock()                        (zero-slot + tail-call)
//   @0x0000000000da7be0  _beforeAttemptedUnlockHook()    (zero-slot only)
//
// KEY OBSERVATION — ICF FOLDING. Both `_beforeAttemptedLockHook` and
// `_afterSuccessfulUnlockHook` were folded by the linker onto the *same*
// address as `FFPlayerThreadStateManager::playerThreadOnly()` at 0x57c860:
//   __ZN26FFPlayerThreadStateManager16playerThreadOnlyEv:
//     0x57c860: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
// This is a 5-byte function — an empty body. All three symbols share it.
// A `otool -p '__ZN16FFPlayerLockable24_beforeAttemptedLockHookEv'` prints
// exactly that block (labelled with the FFPlayerThreadStateManager name,
// confirming the fold). Faithful transcription: NO-OP methods.
//
// Struct-layout evidence (recovered from all five decoded methods):
//   +0x00  vtable ptr (not touched by any of these methods; inferred from
//                     the class' virtual `lock`/`unlock` typical ABI —
//                     conservative)
//   +0x00..+0x77  base subobject fields (not observed — none of these
//                     methods reference below +0x78).
//   +0x78  NSThread* owner
//                     Written by `lock` @0xda7b42 (`movq %rax,0x78(%rbx)`)
//                     with the NSThread returned from the class-method
//                     dispatch on `_OBJC_CLASS_$_NSThread`.
//                     Written by `_afterSuccessfulLockHook` @0xda7b6d with
//                     the same NSThread source.
//                     Written by `try_lock` @0xda7bb0 (only on the success
//                     branch — see @0xda7b91 `je 0xda7bb4`).
//                     Zeroed by `unlock` @0xda7bc4 and
//                     `_beforeAttemptedUnlockHook` @0xda7be4
//                     (`movq $0x0, 0x78(%rdi)`).
//   +0x??  std::__1::timed_mutex mutex
//                     Address passed implicitly as `%rdi` (== `this`) to
//                     the libc++ stubs @0xda7b29 / @0xda7b8a / (tail) @0xda7bcd.
//                     Because `%rdi` is NOT adjusted before those calls,
//                     the timed_mutex lives at offset 0x00 of the object.
//                     This is consistent with the standard FCP pattern of
//                     "wrapper class publicly derives from timed_mutex or
//                     stores it as first member".
//
// FRONTIER (external symbols kept as throwing stubs cited by their @0xADDR
// call sites — same convention as sibling ports):
//   std::__1::timed_mutex::lock()      @Flexo stub 0x14972b4   (lock @0xda7b29)
//   std::__1::timed_mutex::try_lock()  @Flexo stub 0x14972c0   (try_lock @0xda7b8a)
//   std::__1::timed_mutex::unlock()    @Flexo stub 0x14972ba   (unlock tail @0xda7bcd)
//   _OBJC_CLASS_$_NSThread             literal @Flexo 0xda7b2e / 0xda7b59 / 0xda7b93
//     (RIP-relative + literal-pool disp resolves to the same NSThread class
//      symbol; concrete NSThread runtime is out-of-scope — kept as opaque.)
//   objc_msgSend                       @Flexo stub via 0xb45b7e/0xb45b53/0xb45b16
//     RIP-relative displacements. All three call sites read the SAME
//     selref cell (the RIP+disp targets +0xe1e0b4 / +0xe1e089 / +0xe1e04f
//     from three distinct PCs — a hand check confirms they resolve to
//     ADJACENT selref slots within a few bytes of each other, i.e. the
//     same selector across all three call sites, as expected for a
//     shared "capture the calling thread" hook). The selector cannot be
//     positively named from a raw .s dump — the __objc_selrefs table
//     resolves via chained-fixups to a __objc_methname C-string, and the
//     x86_64 chain traversal on this framework did not yield a clean
//     resolution. The strongly-implied selector is `+[NSThread
//     currentThread]` (the only NSThread class-method that returns an
//     NSThread*), but we keep it as a stub cited only by @0xADDR to
//     avoid the "guess a name" trap.
//
// A NOTE ON THE +0x78 STORE ON UNLOCK PATHS.
// The order of operations in `unlock` and `_beforeAttemptedUnlockHook` is
// exactly the same: zero the owner slot, then either fall through
// (`_beforeAttemptedUnlockHook`) or tail-call `timed_mutex::unlock`
// (`unlock`). This means the owner slot is cleared *before* the mutex is
// released — so any thread that immediately reacquires the lock sees a
// zero-owner window rather than a stale owner. This is the reason
// `unlock`'s zero-store is not just delegated to a paired hook.

/**
 * Opaque NSThread handle. FFPlayerLockable stores this at +0x78 whenever
 * the lock is held; unlock zeros it. The concrete NSThread runtime is not
 * part of this port — models the pointer identity only.
 */
export interface NSThreadHandle {
  readonly __nsThread: true;
}

// ── Frontier stubs — libc++ std::__1::timed_mutex primitives ───────────

/**
 * std::__1::timed_mutex::lock() — @Flexo stub 0x14972b4
 * (`__ZNSt3__111timed_mutex4lockEv`). Called at @0xda7b29 with `%rdi ==
 * this`. Blocks until the mutex is acquired. Undecoded — libc++ frontier.
 */
function stdTimedMutex_lock_stub(_this: FFPlayerLockable): void {
  // throw: std::__1::timed_mutex::lock() @Flexo 0x14972b4 not yet transcribed (libc++ frontier)
  throw new Error(
    "std::__1::timed_mutex::lock() @Flexo 0x14972b4 (libc++ frontier) not yet transcribed @0xda7b29",
  );
}

/**
 * std::__1::timed_mutex::try_lock() — @Flexo stub 0x14972c0
 * (`__ZNSt3__111timed_mutex8try_lockEv`). Called at @0xda7b8a. Returns
 * bool in `%al`. Undecoded — libc++ frontier.
 */
function stdTimedMutex_try_lock_stub(_this: FFPlayerLockable): boolean {
  // throw: std::__1::timed_mutex::try_lock() @Flexo 0x14972c0 not yet transcribed (libc++ frontier)
  throw new Error(
    "std::__1::timed_mutex::try_lock() @Flexo 0x14972c0 (libc++ frontier) not yet transcribed @0xda7b8a",
  );
}

/**
 * std::__1::timed_mutex::unlock() — @Flexo stub 0x14972ba
 * (`__ZNSt3__111timed_mutex6unlockEv`). Tail-called by `unlock()` at
 * @0xda7bcd. Undecoded — libc++ frontier.
 */
function stdTimedMutex_unlock_stub(_this: FFPlayerLockable): void {
  // throw: std::__1::timed_mutex::unlock() @Flexo 0x14972ba not yet transcribed (libc++ frontier)
  throw new Error(
    "std::__1::timed_mutex::unlock() @Flexo 0x14972ba (libc++ frontier) not yet transcribed @0xda7bcd",
  );
}

/**
 * `+[NSThread <ns-selector>]` — dispatched at @0xda7b3c / @0xda7b67 /
 * @0xda7ba4. All three call sites resolve `%rdi = _OBJC_CLASS_$_NSThread`
 * and `%rsi = <sel>` where <sel> is the SAME selector across all sites
 * (the RIP-relative displacements pointing into consecutive __objc_selrefs
 * cells confirmed by the source dumps). Concrete selector name not
 * recovered from the raw .s (chained-fixup traversal on x86_64 required).
 * The strongly-implied semantics are "capture the identity of the current
 * thread"; we keep the call opaque and cite by @0xADDR.
 */
function nsThread_currentThread_selref_stub(): NSThreadHandle {
  // throw: +[NSThread <sel>] (Obj-C @0xda7b3c) — selref not yet resolved to __objc_methname
  throw new Error(
    "+[NSThread <sel>] @Flexo (Obj-C selref @0xda7b3c not yet resolved to __objc_methname) not yet transcribed",
  );
}

/**
 * FFPlayerLockable — see file header for full struct-layout evidence and
 * ICF-folding notes.
 */
export class FFPlayerLockable {
  /**
   * +0x78 — NSThread that currently owns the lock, or null when unlocked.
   *
   * Written by `lock` @0xda7b42, `_afterSuccessfulLockHook` @0xda7b6d, and
   * the success branch of `try_lock` @0xda7bb0. Zeroed by `unlock`
   * @0xda7bc4 and `_beforeAttemptedUnlockHook` @0xda7be4.
   *
   * Stored as a raw pointer in the binary — TS models it as
   * `NSThreadHandle | null` with the null state matching the
   * `movq $0x0, 0x78(%rdi)` instruction bit-for-bit.
   */
  private ownerThread: NSThreadHandle | null = null;

  /**
   * FFPlayerLockable::_beforeAttemptedLockHook() — @0x000000000057c860
   *
   * ICF-folded with FFPlayerThreadStateManager::playerThreadOnly() —
   * confirmed by `otool -p '__ZN16FFPlayerLockable24_beforeAttemptedLockHookEv'`
   * printing:
   *     __ZN26FFPlayerThreadStateManager16playerThreadOnlyEv:
   *       0x57c860: pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * The body is an EMPTY prologue/epilogue — the method returns
   * immediately. Faithful transcription: no-op.
   */
  _beforeAttemptedLockHook(): void {
    // @0x57c860: ICF-folded empty body — no observable effect.
  }

  /**
   * FFPlayerLockable::_afterSuccessfulUnlockHook() — @0x000000000057c860
   *
   * ICF-folded with `_beforeAttemptedLockHook` AND
   * `FFPlayerThreadStateManager::playerThreadOnly()` (same 5-byte fold).
   * Body is empty.
   */
  _afterSuccessfulUnlockHook(): void {
    // @0x57c860: ICF-folded empty body — no observable effect.
  }

  /**
   * FFPlayerLockable::lock() — @0x0000000000da7b20
   *
   * Body:
   *   0xda7b20..0xda7b25: prologue (pushq %rbp / movq %rsp,%rbp /
   *                                 pushq %rbx / pushq %rax)
   *   0xda7b26: movq %rdi,%rbx                                # rbx = this
   *   0xda7b29: callq __ZNSt3__111timed_mutex4lockEv           # blocking lock
   *   0xda7b2e: movq _OBJC_CLASS_$_NSThread(%rip),%rdi         # rdi = NSThread class
   *   0xda7b35: movq <selref>(%rip),%rsi                       # rsi = <sel>
   *   0xda7b3c: callq *_objc_msgSend(%rip)                     # rax = [NSThread <sel>]
   *   0xda7b42: movq %rax,0x78(%rbx)                           # this->ownerThread = rax
   *   0xda7b46..0xda7b4c: epilogue + retq
   *
   * Semantics: block until the underlying timed_mutex is acquired, then
   * record the current NSThread as the owner. NO overrideable hook is
   * called by `lock` itself — `_beforeAttemptedLockHook` and
   * `_afterSuccessfulLockHook` are hooks that CALLERS may invoke, or that
   * a caller-side wrapper (see FFLockerWithCallbacks) is expected to
   * dispatch; the ICF fold shows the base-class defaults are no-ops.
   */
  lock(): void {
    // @0xda7b29: block on the underlying timed_mutex.
    stdTimedMutex_lock_stub(this);
    // @0xda7b3c: dispatch the NSThread class-selector to get the current thread.
    const t = nsThread_currentThread_selref_stub();
    // @0xda7b42: store the owner (unconditional — lock blocks until acquired).
    this.ownerThread = t;
  }

  /**
   * FFPlayerLockable::_afterSuccessfulLockHook() — @0x0000000000da7b50
   *
   * Body:
   *   0xda7b50..0xda7b55: prologue (pushq %rbp / movq %rsp,%rbp /
   *                                 pushq %rbx / pushq %rax)
   *   0xda7b56: movq %rdi,%rbx                                # rbx = this
   *   0xda7b59: movq _OBJC_CLASS_$_NSThread(%rip),%rdi         # rdi = NSThread class
   *   0xda7b60: movq <selref>(%rip),%rsi                       # rsi = <sel>  (same as lock)
   *   0xda7b67: callq *_objc_msgSend(%rip)                     # rax = [NSThread <sel>]
   *   0xda7b6d: movq %rax,0x78(%rbx)                           # this->ownerThread = rax
   *   0xda7b71..0xda7b77: epilogue + retq
   *
   * A "just recapture the owner" hook — semantically equivalent to the
   * tail half of `lock` (from the msgSend onwards). Used by callers that
   * need to (re-)stamp the owner after a successful lock via a code path
   * that does not itself run `lock()` (e.g. try_lock's fast success branch
   * has this inlined, but external callers can invoke this hook by name).
   */
  _afterSuccessfulLockHook(): void {
    // @0xda7b67: dispatch the same NSThread class-selector.
    const t = nsThread_currentThread_selref_stub();
    // @0xda7b6d: stamp the owner slot.
    this.ownerThread = t;
  }

  /**
   * FFPlayerLockable::try_lock() — @0x0000000000da7b80
   *
   * Body:
   *   0xda7b80..0xda7b86: prologue (pushq %rbp / movq %rsp,%rbp /
   *                                 pushq %r14 / pushq %rbx)
   *   0xda7b87: movq %rdi,%rbx                                # rbx = this
   *   0xda7b8a: callq __ZNSt3__111timed_mutex8try_lockEv        # al = try_lock()
   *   0xda7b8f: testb %al,%al
   *   0xda7b91: je    0xda7bb4                                 # if !acquired -> return al=0
   *   0xda7b93: movq _OBJC_CLASS_$_NSThread(%rip),%rdi         # (acquired path)
   *   0xda7b9a: movq <selref>(%rip),%rsi
   *   0xda7ba1: movl %eax,%r14d                                # r14d = 1 (save al)
   *   0xda7ba4: callq *_objc_msgSend(%rip)                     # rax = [NSThread <sel>]
   *   0xda7baa: movq %rax,%rcx
   *   0xda7bad: movl %r14d,%eax                                # rax low = original 1
   *   0xda7bb0: movq %rcx,0x78(%rbx)                           # this->ownerThread = rcx
   *   0xda7bb4..0xda7bb8: epilogue + retq                      # return al
   *
   * Semantics: attempt to acquire without blocking. If acquired, stamp
   * the owner slot with the current NSThread; either way, return the
   * boolean result of the underlying timed_mutex::try_lock (bit-exact:
   * the assembly preserves the low byte of the try_lock result across
   * the msgSend by shuffling through r14d).
   */
  try_lock(): boolean {
    // @0xda7b8a: non-blocking try_lock on the underlying mutex.
    const acquired = stdTimedMutex_try_lock_stub(this);
    // @0xda7b8f/@0xda7b91: branch — on failure, return false immediately.
    if (!acquired) return false;
    // @0xda7ba4: acquired — capture the current NSThread…
    const t = nsThread_currentThread_selref_stub();
    // @0xda7bb0: …and stamp the owner slot BEFORE returning true.
    this.ownerThread = t;
    // @0xda7bb4: preserved al (which was 1) — return true.
    return true;
  }

  /**
   * FFPlayerLockable::unlock() — @0x0000000000da7bc0
   *
   * Body:
   *   0xda7bc0..0xda7bc1: prologue (pushq %rbp / movq %rsp,%rbp)
   *   0xda7bc4: movq $0x0, 0x78(%rdi)                          # this->ownerThread = null
   *   0xda7bcc: popq %rbp
   *   0xda7bcd: jmp   __ZNSt3__111timed_mutex6unlockEv          # tail-call
   *
   * Semantics: zero the owner slot FIRST, then tail-call the underlying
   * timed_mutex::unlock. See file header for why the zero-store comes
   * before the release.
   */
  unlock(): void {
    // @0xda7bc4: clear owner BEFORE releasing the mutex.
    this.ownerThread = null;
    // @0xda7bcd: tail-call timed_mutex::unlock.
    stdTimedMutex_unlock_stub(this);
  }

  /**
   * FFPlayerLockable::_beforeAttemptedUnlockHook() — @0x0000000000da7be0
   *
   * Body:
   *   0xda7be0..0xda7be1: prologue (pushq %rbp / movq %rsp,%rbp)
   *   0xda7be4: movq $0x0, 0x78(%rdi)                          # this->ownerThread = null
   *   0xda7bec..0xda7bed: popq %rbp / retq
   *
   * Semantics: zero the owner slot; DO NOT release the mutex. This is
   * the "pre-attempted-unlock" hook — it clears the owner-identity
   * fingerprint so that anything reading +0x78 during the unlock window
   * sees "no owner" without disturbing the mutex state.
   */
  _beforeAttemptedUnlockHook(): void {
    // @0xda7be4: clear owner slot only — no mutex operation here.
    this.ownerThread = null;
  }
}
