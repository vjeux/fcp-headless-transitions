// FFLockerWithCallbacks — transcribed from Flexo.framework x86_64 slice.
//
// A RAII scope-guard that acquires an FFLock in its constructor and releases it
// in its destructor, invoking pre-acquire and post-release callbacks around the
// blocking segment. Supports recursive locking: if the current thread already
// owns the FFLock, the wait-callback and the actual acquire are skipped and a
// recursion count is bumped on the underlying lock instead.
//
// Object layout (from ctor stores @0x12b997d/0x12b9980/0x12b9984):
//   this[0x00] : FFLock*                 (lock)
//   this[0x08] : Callbacks*              (cb)
//   this[0x10] : bool                    (locked flag written 0/1)
//
// FFLock layout (from `movq 0x8(%rsi), %r14` @0x12b9988 and callers):
//   lock[0x00] : vtable* — slot +0x10 = acquire(), slot +0x20 = release()
//   lock[0x08] : pthread_t owner
//   lock[0x10] : uint32_t recursionCount
//
// Callbacks layout (indirected via cb[…] pointers to sub-objects with vtables):
//   cb[0x20] : *WaitCallback   → vtable[0x30] = onWillWait()
//   cb[0x50] : *AcquiredCallback → vtable[0x30] = onAcquired()
//   cb[0x80] : *ReleasedCallback → vtable[0x30] = onReleased()  (see dtor @0x12b9b78)
//
// This class is inherently a threading primitive. Direct TS mapping is not
// possible without introducing an FFLock model + pthread_self analogue; the
// bodies below therefore throw at each decoded @0xADDR entry-point until the
// FFLock/Callbacks classes are ported. Every branch has been decoded and
// annotated so that a subsequent pass has zero-guesswork transcription.

/** Opaque FFLock front-object. Real layout / vtable decoded in comments. */
export interface FFLock {
  __opaque: "FFLock";
}

/** Callback bundle passed by reference; each field is a pointer to a small
 *  virtual class with a single method at vtable+0x30. */
export interface FFLockerWithCallbacksCallbacks {
  __opaque: "FFLockerWithCallbacks::Callbacks";
}

export class FFLockerWithCallbacks {
  // Mirror of the three-slot struct — kept as public fields so downstream code
  // that later ports FFLock can populate them without further plumbing.
  lock: FFLock;
  cb: FFLockerWithCallbacksCallbacks;
  locked: boolean;

  /**
   * FFLockerWithCallbacks(FFLock&, Callbacks&) @0x12b9970 (C2 body) / @0x12b9a40 (C1 thunk)
   *
   * The C1 constructor @0x12b9a40 is a trivial `jmp __ZN…C2…` thunk (verified
   * @0x12b9a45), so both entry points share the following decoded flow:
   *
   *   @0x12b997a  this->lock   = rsi     (arg1)
   *   @0x12b997d  this->cb     = rdx     (arg2)   [via store to +0x08]
   *   @0x12b9984  this->locked = false
   *   @0x12b9988  r14 = lock->owner       (lock[0x08])
   *   @0x12b998c  rax = pthread_self()   (stub @0x1497b12)
   *   @0x12b9994  branch: r14 == rax ?  →  RE-ENTRY-A path (0x12b99d6)
   *
   *   NOT-OWNED path (fallthrough @0x12b9996):
   *     @0x12b9996  wcb = cb->[0x20]; if (wcb) wcb->vtable[0x30](wcb)  // onWillWait
   *     @0x12b99a9  reload lock, r15 = pthread_self()
   *     @0x12b99b8  branch: lock->owner == r15 ? → jump to @0x12b9a03 (already ours)
   *     @0x12b99ba  lock->vtable[0x10](lock)                            // acquire (blocks)
   *     @0x12b99c3  lock->recursionCount = 0
   *     @0x12b99cb  lock->owner = pthread_self()
   *     @0x12b99d4  jump 0x12b9a07
   *
   *   RE-ENTRY-A path (@0x12b99d6):
   *     @0x12b99d6  reload lock, r15 = pthread_self()
   *     @0x12b99e5  branch: lock->owner == r15 ? → jump to @0x12b9a28
   *     @0x12b99e7  lock->vtable[0x10](lock)                            // acquire (blocks)
   *     @0x12b99f0  lock->recursionCount = 0
   *     @0x12b99f8  lock->owner = pthread_self()
   *     @0x12b9a01  jump 0x12b9a2c
   *
   *   @0x12b9a03  RE-ENTRY (owner matched second check):
   *                 lock->recursionCount++
   *
   *   @0x12b9a07  this->locked = true
   *               acb = cb->[0x50]; if (acb) tailcall acb->vtable[0x30](acb) // onAcquired
   *               else return
   *
   *   @0x12b9a28  lock->recursionCount++
   *   @0x12b9a2c  this->locked = true; return
   *
   * The pthread + vtable calls have no direct TS analogue. Throws to mark the
   * entry as decoded-but-unportable until FFLock/Callbacks are ported.
   */
  constructor(lock: FFLock, cb: FFLockerWithCallbacksCallbacks) {
    this.lock = lock;
    this.cb = cb;
    this.locked = false;
    // Requires FFLock vtable (acquire @vtable+0x10) + pthread_self; see @0x12b9970.
    throw new Error("FFLockerWithCallbacks constructor unresolved @0x12b9970");
  }

  /**
   * ~FFLockerWithCallbacks() @0x12b9b30 (D1 body — D2 shares the same layout,
   * both dispatch through the same code region per otool -tV output).
   *
   *   @0x12b9b37  if (!this->locked) → skip to epilogue @0x12b9b8a  (no-op)
   *   @0x12b9b40  lock = this->lock; count = lock->recursionCount
   *   @0x12b9b46  if (count != 0) { lock->recursionCount = count − 1; goto @0x12b9b62 }
   *   @0x12b9b51  else { lock->owner = 0; lock->vtable[0x20](lock)          // release
   *                       reload lock from rbx }
   *   @0x12b9b62  this->locked = false
   *   @0x12b9b66  r14 = lock->owner
   *               if (r14 == pthread_self()) return                          // still-owned re-entry
   *   @0x12b9b74  rcb = this->cb->[0x80]; if (rcb) rcb->vtable[0x30](rcb)    // onReleased
   *   @0x12b9b8a  return
   *
   * Exception path @0x12b9b8f dispatches to ___clang_call_terminate — the
   * frame catches the callback's throw and terminates the process.
   *
   * Not portable without a real FFLock; throwing keeps the decode citation
   * live at the destructor entry.
   */
  destroy(): void {
    // Requires FFLock vtable (release @vtable+0x20); see @0x12b9b30.
    throw new Error("FFLockerWithCallbacks destructor unresolved @0x12b9b30");
  }

  /**
   * forceUnlock() @0x12b9ac0
   *
   * Identical to the destructor's release path minus the exception frame:
   *   @0x12b9ac7  if (!this->locked) → return (0x12b9b1e)
   *   @0x12b9ad0  lock = this->lock; count = lock->recursionCount
   *   @0x12b9ad6  if (count != 0) { lock->recursionCount = count − 1; goto @0x12b9af2 }
   *   @0x12b9ae1  else { lock->owner = 0; lock->vtable[0x20](lock); reload }
   *   @0x12b9af2  this->locked = false
   *   @0x12b9af6  r14 = lock->owner
   *               if (r14 == pthread_self()) return
   *   @0x12b9b04  rcb = cb->[0x80]; if (rcb) tailcall rcb->vtable[0x30](rcb)
   *               else return
   *
   * Same portability blocker as the destructor.
   */
  forceUnlock(): void {
    // Requires FFLock vtable (release @vtable+0x20); see @0x12b9ac0.
    throw new Error("FFLockerWithCallbacks.forceUnlock unresolved @0x12b9ac0");
  }
}
