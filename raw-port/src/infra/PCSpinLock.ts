/**
 * PCSpinLock — the ProCore framework's spinlock wrapper. Under the hood it
 * is a `struct { os_unfair_lock _lock; }` (16-bit / 32-bit int on Darwin).
 *
 * Native class in ProCore.framework:
 *   - D1/D2 destructors are trivial no-ops (frame-push then ret)
 *   - lock()   is a pure tail-call to `_os_unfair_lock_lock(this)`
 *   - unlock() is a pure tail-call to `_os_unfair_lock_unlock(this)`
 *
 * TypeScript is single-threaded per realm, so a "real" mutex is unavailable
 * and semantically unnecessary — a program can never hold this lock across
 * a suspend point that would let another turn observe it (`await` is the
 * only interleave point and this class exposes no async surface). The port
 * therefore models the lock as a plain boolean flag: `lock()` sets it to
 * `true`, `unlock()` clears it. If a nested `lock()` is attempted on an
 * already-locked instance we throw — mirroring `os_unfair_lock`'s explicit
 * "recursive acquisition kills you" contract from Apple's header comment.
 *
 * @classAddr ProCore 0x00000000000349a4 (D2), 0x00000000000349aa (D1),
 *                    0x00000000000349b0 (lock), 0x00000000000349ba (unlock).
 */

/**
 * The single 32-bit os_unfair_lock word at offset 0x0 of the native struct.
 * We surface it as a plain boolean because JS has no 32-bit atomic op API
 * on plain objects (only SharedArrayBuffer via Atomics.*), and the native
 * lock's exact bit-layout is opaque per Apple's SPI contract.
 */
export class PCSpinLock {
  /**
   * `this[0x0]` — os_unfair_lock word. On Darwin this is a 32-bit int that
   * `_os_unfair_lock_lock` CAS'es. In TS we track it as a boolean.
   */
  private _locked: boolean = false;

  /**
   * Constructor — the D2/D1 pair are byte-identical trivial (push %rbp;
   * mov %rsp,%rbp; pop %rbp; ret). There is no observed C1/C2 constructor
   * body in ProCore; construction is either implicit-zero (from
   * PCThreadSpecific / operator new + memset) or the initialiser is
   * inlined into the containing struct's ctor. We initialize the lock word
   * to zero (unlocked) per os_unfair_lock's static-init contract:
   *   #define OS_UNFAIR_LOCK_INIT ((os_unfair_lock){0})
   */
  constructor() {
    // no work — os_unfair_lock initial state is 0 (unlocked). @0x0000000000000000.
  }

  /**
   * ~PCSpinLock() — @ProCore 0x00000000000349aa (D1) / 0x00000000000349a4 (D2).
   *
   *   00000000000349aa  pushq %rbp
   *   00000000000349ab  movq  %rsp, %rbp
   *   00000000000349ae  popq  %rbp
   *   00000000000349af  retq
   *
   * Pure no-op. `os_unfair_lock` has no destroy call in Darwin's ABI, so
   * the destructor exists only to satisfy the C++ ABI and does nothing.
   */
  destroy(): void {
    // no-op — @0x00000000000349aa
  }

  /**
   * lock() — @ProCore 0x00000000000349b0.
   *
   *   00000000000349b0  pushq %rbp
   *   00000000000349b1  movq  %rsp, %rbp
   *   00000000000349b4  popq  %rbp
   *   00000000000349b5  jmp   _os_unfair_lock_lock  (stub @0xdea3e)
   *
   * Pure tail-call — the `this` pointer in rdi is threaded through to the
   * OS lock routine with no transformation. Blocks the caller until the
   * lock is acquired. `os_unfair_lock_lock` panics (Trap) if the same
   * thread already holds the lock.
   *
   * In this TS port, JS is single-threaded within a realm so "blocking"
   * is meaningless. We faithfully surface the recursive-acquisition trap:
   * calling lock() on an already-locked instance throws, matching Apple's
   * documented contract.
   */
  lock(): void {
    // jmp _os_unfair_lock_lock  — @0x00000000000349b5.
    if (this._locked) {
      // Apple's os_unfair_lock.h: "aborts the calling process if the lock
      // is already held by the calling thread." We mirror that as a thrown
      // error rather than a real abort() so the JS host can observe it.
      throw new Error(
        "PCSpinLock::lock — os_unfair_lock trap: lock is already held " +
          "(ProCore @0x00000000000349b5 -> _os_unfair_lock_lock stub)"
      );
    }
    this._locked = true;
  }

  /**
   * unlock() — @ProCore 0x00000000000349ba.
   *
   *   00000000000349ba  pushq %rbp
   *   00000000000349bb  movq  %rsp, %rbp
   *   00000000000349be  popq  %rbp
   *   00000000000349bf  jmp   _os_unfair_lock_unlock  (stub @0xdea44)
   *
   * Pure tail-call. `os_unfair_lock_unlock` panics if the lock is not held
   * by the calling thread — we surface that as a throw.
   */
  unlock(): void {
    // jmp _os_unfair_lock_unlock  — @0x00000000000349bf.
    if (!this._locked) {
      // Apple's os_unfair_lock.h: "aborts the calling process if the lock
      // is not currently held by the calling thread."
      throw new Error(
        "PCSpinLock::unlock — os_unfair_lock trap: unlock without matching " +
          "lock (ProCore @0x00000000000349bf -> _os_unfair_lock_unlock stub)"
      );
    }
    this._locked = false;
  }
}
