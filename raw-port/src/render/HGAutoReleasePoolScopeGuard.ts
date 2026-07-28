/**
 * HGAutoReleasePoolScopeGuard — RAII wrapper around an NSAutoreleasePool.
 *
 * Transcribed from Helium.framework (macOS x86_64).
 *
 * Native layout: sizeof(HGAutoReleasePoolScopeGuard) == 8 (a single id pointer at offset 0x0
 * holding the pool object). The C1 constructor allocates the pool via [NSAutoreleasePool new]
 * and stores it in this->pool. The D1 destructor sends -drain to that pool and clears the
 * slot; a C++ exception unwinding through the ctor's objc_opt_new would land at
 * ___clang_call_terminate in the epilogue (no user-visible catch handler — the framework
 * elects to std::terminate() rather than propagate).
 *
 * In this raw-port we cannot invoke a real NSAutoreleasePool from TypeScript (there is no
 * Objective-C runtime). The port models the same lifecycle contract: the constructor mints
 * a pool token via a host-installed factory, destroy() drains and clears it. A
 * Symbol.dispose variant is offered to mirror C++ block scope.
 *
 * @classAddr Helium 0x000000000008f9d0 (C2), 0x000000000008f9f0 (C1),
 *            0x000000000008fa10 (D2), 0x000000000008fa40 (D1).
 */

/**
 * Opaque token standing in for the native NSAutoreleasePool* produced by
 * [NSAutoreleasePool new]. In the native binary this is the retained id returned by
 * _objc_opt_new — see Helium @0x3c54b0 (symbol stub for _objc_opt_new).
 */
export interface NSAutoreleasePoolLike {
  /**
   * Mirrors the -drain message sent by ~HGAutoReleasePoolScopeGuard.
   * Selector ref: Helium D1 @0x8fa4c, D2 @0x8fa1c.
   */
  drain(): void;
}

/**
 * Factory hook so a host runtime can install a real Objective-C bridge if it has one.
 * By default we return a throwing pool: the guard is only useful when the host provides a
 * real NSAutoreleasePool bridge — otherwise, calling drain() must fail loudly rather than
 * silently no-op (that would mis-model native memory semantics @0x8fa10/0x8fa40).
 */
export type NSAutoreleasePoolFactory = () => NSAutoreleasePoolLike;

let g_poolFactory: NSAutoreleasePoolFactory = () => {
  // Modeled after _objc_opt_new(_OBJC_CLASS_$_NSAutoreleasePool) @0x8f9e0 (C2) / @0x8fa00 (C1).
  throw new Error(
    "HGAutoReleasePoolScopeGuard: no NSAutoreleasePool bridge installed — " +
      "native ctor allocates via _objc_opt_new at Helium @0x000000000008f9e0 (C2) / " +
      "@0x000000000008fa00 (C1) — call setNSAutoreleasePoolFactory() first"
  );
};

/**
 * Install a host-provided NSAutoreleasePool bridge. The bridge must return a fresh
 * pool per call, mirroring [NSAutoreleasePool new] semantics.
 */
export function setNSAutoreleasePoolFactory(f: NSAutoreleasePoolFactory): void {
  g_poolFactory = f;
}

/**
 * RAII scope guard around an autorelease pool. Modeled after the C++ class of the same name
 * in Helium.framework.
 *
 * Layout note: the native struct has exactly one pointer field at offset 0x0 (the pool).
 * We keep the same single-slot invariant here (pool: NSAutoreleasePoolLike | null),
 * cleared to null on destruction — matching movq $0x0, (%rbx) @0x8fa59 (D1) / @0x8fa29 (D2).
 */
export class HGAutoReleasePoolScopeGuard {
  /**
   * Single pointer slot at struct offset 0x0. Holds the id from [NSAutoreleasePool new]
   * until the destructor drains it and writes 0.
   */
  private pool: NSAutoreleasePoolLike | null;

  /**
   * Constructor — the C1/C2 pair are byte-identical (both push %rbp/%rbx, load
   * _OBJC_CLASS_$_NSAutoreleasePool, callq _objc_opt_new, store into (%rbx)).
   *
   *   C2 @0x8f9d0:
   *     000000000008f9d6  movq  %rdi, %rbx                       ; this
   *     000000000008f9d9  movq  0x9cbce8(%rip), %rdi             ; _OBJC_CLASS_$_NSAutoreleasePool
   *     000000000008f9e0  callq 0x3c54b0                         ; _objc_opt_new
   *     000000000008f9e5  movq  %rax, (%rbx)                     ; this->pool = pool
   *
   *   C1 @0x8f9f0 — identical body, same encoding, only rip-relative offset differs
   *     (0x9cbcc8 vs 0x9cbce8) because the two thunks live at different addresses.
   *
   * @ctorAddr Helium C1 @0x000000000008f9f0, C2 @0x000000000008f9d0
   */
  constructor() {
    // this->pool = [NSAutoreleasePool new];   — @0x8f9e0 (C2) / @0x8fa00 (C1)
    this.pool = g_poolFactory();
  }

  /**
   * Destructor — the D1/D2 pair are byte-identical (both load this->pool, send -drain,
   * zero the slot). Exception path: on a throw from -drain, control transfers to
   * ___clang_call_terminate @0x8fa6a (D1), which unconditionally aborts — there is NO
   * user-recoverable exception path here.
   *
   *   D2 @0x8fa10:
   *     000000000008fa19  movq  (%rdi), %rdi                     ; id pool = this->pool
   *     000000000008fa1c  movq  0x9cb365(%rip), %rsi             ; @selector(drain)
   *     000000000008fa23  callq *0x97278f(%rip)                  ; objc_msgSend(pool, drain)
   *     000000000008fa29  movq  $0x0, (%rbx)                     ; this->pool = nil
   *
   *   D1 @0x8fa40 — identical body, only rip-relative offsets differ.
   *
   * @dtorAddr Helium D1 @0x000000000008fa40, D2 @0x000000000008fa10
   */
  destroy(): void {
    const p = this.pool;
    if (p !== null) {
      // objc_msgSend(pool, @selector(drain)) — @0x8fa23 (D2) / @0x8fa53 (D1).
      // If drain throws, the native binary invokes ___clang_call_terminate @0x8fa6a — i.e.
      // std::terminate(). We mirror that by letting the exception propagate (the caller's
      // process will crash — same observable outcome as native).
      p.drain();
    }
    // movq $0x0, (%rbx)  — @0x8fa29 (D2) / @0x8fa59 (D1)
    this.pool = null;
  }

  /**
   * TC39 explicit-resource-management sugar. `using guard = new HGAutoReleasePoolScopeGuard()`
   * will call destroy() at end of scope — the direct TS mapping of the C++ RAII destructor
   * @0x8fa40 (D1) / @0x8fa10 (D2), invoked at end of the containing scope.
   */
  [Symbol.dispose](): void {
    this.destroy();
  }
}
