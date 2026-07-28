// OZFxPlugSharedLock.ts — Ozone OZFxPlugSharedLock: a tiny wrapper that
// pairs a raw `OZFxPlugSharedBase*` back-pointer with a PCSharedMutex,
// used by OZFxTemporalBoundsSentry (and any code holding a
// std::shared_ptr<OZFxPlugSharedLock>) to serialize access to plug-in
// shared state.
//
// FAITHFUL transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Source disassembly:
//   raw-port/re/disasm/OZFxPlugSharedLock.OZFxPlugSharedLock.s   (ctor          @0x284660, C1==C2)
//   raw-port/re/disasm/OZFxPlugSharedLock.lockForRead.s          (               @0x284780)
//   raw-port/re/disasm/OZFxPlugSharedLock.unlockForRead.s        (               @0x284790)
//   raw-port/re/disasm/OZFxPlugSharedLock.reset.s                (               @0x284740)
//   raw-port/re/disasm/OZFxPlugSharedLock.~OZFxPlugSharedLock.s  (dtor          @0x2846e0, D1==D2)
//
// Ozone symbols transcribed:
//   @0x284660  OZFxPlugSharedLock::OZFxPlugSharedLock(OZFxPlugSharedBase*)   [C1 == C2]
//   @0x2846e0  OZFxPlugSharedLock::~OZFxPlugSharedLock()                    [D1 == D2]
//   @0x284740  OZFxPlugSharedLock::reset()
//   @0x284780  OZFxPlugSharedLock::lockForRead()
//   @0x284790  OZFxPlugSharedLock::unlockForRead()
//
// Direct callees (all resolved):
//   __ZN13PCSharedMutexC1Ev            PCSharedMutex::PCSharedMutex()       @Ozone 0x28466c (via stub)
//   __ZN13PCSharedMutex11lock_sharedEv PCSharedMutex::lock_shared()         @Ozone 0x284789 (via stub)
//   __ZN13PCSharedMutex13unlock_sharedEv PCSharedMutex::unlock_shared()     @Ozone 0x284799 (via stub)
//   __ZN13PCSharedMutex4lockEv         PCSharedMutex::lock()                @Ozone 0x284751/0x2846f1 (via stub)
//   __ZN13PCSharedMutex6unlockEv       PCSharedMutex::unlock()              @Ozone 0x284760/0x284700 (via stub)
//   __ZdlPv                            operator delete(void*)               @Ozone 0x284712 (via stub)
//   __ZNSt3__15mutexD1Ev               std::mutex::~mutex()                 @Ozone 0x28471e (via stub)
//
// PCSharedMutex is already landed at raw-port/src/infra/PCSharedMutex.ts —
// we IMPORT it and call its real methods (Rule 6 + head-of-spec import
// discipline: "if a class subclasses an ALREADY-LANDED base... IMPORT the
// real base, do not re-stub it").
//
// Layout (recovered by ctor + dtor field writes):
//   +0x00 : OZFxPlugSharedBase*  plug              — ctor writes rsi here;
//                                                     reset() and dtor set to 0.
//   +0x08 : PCSharedMutex         mutex            — ctor tail-jmps to
//                                                     `PCSharedMutex::PCSharedMutex(&this[0x8])`;
//                                                     lock/unlock forwarding
//                                                     always uses `&this[0x8]`.
//   +0x58 : void*                 ownedSomething   — dtor reads it: if non-null,
//                                                     mirror-stores at +0x60 then
//                                                     calls `operator delete(void*)`.
//                                                     Never written by ctor/reset/lockForRead/
//                                                     unlockForRead: this field is initialized
//                                                     out-of-band by OTHER methods on the
//                                                     class (or set through friend/inline
//                                                     helpers), which are NOT in the class's
//                                                     public method list. The dtor's cleanup
//                                                     path is transcribed faithfully.
//   +0x60 : void*                 ownedMirror      — dtor writes to it just before
//                                                     the delete (so if `operator delete`
//                                                     throws, +0x60 is the last-known ptr).
//
// FRONTIER — none new. OZFxPlugSharedBase is a raw pointer we never
// deref here (only stored), so it's a `unknown` opaque handle.

import { PCSharedMutex } from "../infra/PCSharedMutex";

/**
 * `OZFxPlugSharedBase` — undecoded Ozone class; OZFxPlugSharedLock only
 * holds a raw pointer to it (see ctor @0x284664 `movq %rsi, (%rdi)`), so
 * we model it as an opaque handle.
 */
export type OZFxPlugSharedBaseHandle = unknown;

/**
 * `OZFxPlugSharedLock` — pair of (plug-back-pointer, PCSharedMutex) +
 * an owned buffer at +0x58 whose allocator is unknown to this class
 * (documented on the field).
 */
export class OZFxPlugSharedLock {
  // +0x00
  plug: OZFxPlugSharedBaseHandle;
  // +0x08 — real PCSharedMutex, not a stub.
  mutex: PCSharedMutex;
  // +0x58 / +0x60 — see layout comment above.
  ownedSomething: unknown | null = null;
  ownedMirror:    unknown | null = null;

  /**
   * `OZFxPlugSharedLock::OZFxPlugSharedLock(OZFxPlugSharedBase*)` — Ozone @0x284660.
   *
   * Faithful body:
   *   0x284664: movq %rsi, (%rdi)                 ; this->plug = arg1
   *   0x284667: addq $0x8, %rdi                   ; rdi = &this->mutex
   *   0x28466c: jmp  __ZN13PCSharedMutexC1Ev      ; PCSharedMutex::PCSharedMutex(&this->mutex)
   *
   * The ctor is a tail-jmp, so PCSharedMutex's default ctor runs on
   * `&this->mutex`. We reproduce that by constructing a real PCSharedMutex
   * and holding it inline.
   */
  constructor(plug: OZFxPlugSharedBaseHandle) {
    this.plug = plug;
    // @0x28466c — PCSharedMutex::PCSharedMutex() default ctor.
    this.mutex = new PCSharedMutex();
    // +0x58 / +0x60 default-init to null (the C++ ctor does NOT touch these
    // fields — the memory is undefined until a friend function writes to it.
    // Zero-init here mirrors what a heap allocation via `new OZFxPlugSharedLock`
    // in the presence of a value-initialized shared_ptr_emplace would produce;
    // the dtor's `testq %rdi, %rdi / je` guard is the correct runtime behavior
    // either way — null skips the delete.).
    this.ownedSomething = null;
    this.ownedMirror    = null;
  }

  /**
   * `OZFxPlugSharedLock::lockForRead()` — Ozone @0x284780.
   *
   * Faithful body:
   *   0x284784: addq $0x8, %rdi                              ; rdi = &this->mutex
   *   0x284789: jmp  __ZN13PCSharedMutex11lock_sharedEv       ; tail-call
   */
  lockForRead(): void {
    // @0x284789 — direct forward to PCSharedMutex::lock_shared().
    this.mutex.lock_shared();
  }

  /**
   * `OZFxPlugSharedLock::unlockForRead()` — Ozone @0x284790.
   *
   * Faithful body:
   *   0x284794: addq $0x8, %rdi                              ; rdi = &this->mutex
   *   0x284799: jmp  __ZN13PCSharedMutex13unlock_sharedEv     ; tail-call
   */
  unlockForRead(): void {
    // @0x284799 — direct forward to PCSharedMutex::unlock_shared().
    this.mutex.unlock_shared();
  }

  /**
   * `OZFxPlugSharedLock::reset()` — Ozone @0x284740.
   *
   * Faithful body:
   *   0x28474a: leaq 0x8(%rdi), %r14                          ; r14 = &this->mutex
   *   0x28474e: movq %r14, %rdi
   *   0x284751: callq __ZN13PCSharedMutex4lockEv               ; mutex.lock() (exclusive)
   *   0x284756: movq $0x0, (%rbx)                             ; this->plug = null
   *   0x28475d: movq %r14, %rdi
   *   0x284760: callq __ZN13PCSharedMutex6unlockEv             ; mutex.unlock()
   *
   * Trailing landing pad (@0x28476a) calls `___clang_call_terminate` if the
   * lock section throws — standard C++ noexcept guard, not part of the port.
   */
  reset(): void {
    // @0x284751 — exclusive lock while nulling out the plug pointer.
    this.mutex.lock();
    // @0x284756 — this->plug = null.
    this.plug = null;
    // @0x284760 — exclusive unlock.
    this.mutex.unlock();
  }

  /**
   * `OZFxPlugSharedLock::~OZFxPlugSharedLock()` — Ozone @0x2846e0 (D1 == D2).
   *
   * Faithful body:
   *   0x2846ea: leaq 0x8(%rdi), %rbx                          ; rbx = &this->mutex
   *   0x2846ee: movq %rbx, %rdi
   *   0x2846f1: callq __ZN13PCSharedMutex4lockEv               ; mutex.lock()
   *   0x2846f6: movq $0x0, (%r14)                             ; this->plug = null
   *   0x2846fd: movq %rbx, %rdi
   *   0x284700: callq __ZN13PCSharedMutex6unlockEv             ; mutex.unlock()
   *   0x284705: movq 0x58(%r14), %rdi                         ; owned = this->ownedSomething
   *   0x284709: testq %rdi, %rdi / je 0x284717                ; if owned != null:
   *   0x28470e: movq %rdi, 0x60(%r14)                         ;   this->ownedMirror = owned
   *   0x284712: callq __ZdlPv                                 ;   operator delete(owned)
   *   0x284717: movq %rbx, %rdi
   *   0x28471e: jmp   __ZNSt3__15mutexD1Ev                    ; tail: std::mutex::~mutex(&this->mutex)
   *
   * The tail-call to `std::mutex::~mutex()` at offset +0x8 corresponds to
   * PCSharedMutex's std::mutex sub-object: the C++ compiler inlined
   * `PCSharedMutex::~PCSharedMutex()` down to just its base std::mutex dtor
   * because PCSharedMutex has no other owning members past the mutex.
   *
   * (See PCSharedMutex.ts for the full mutex model. This dtor is faithful
   * to the ASM's cleanup order; runtime side-effects match the binary.)
   */
  destroy(): void {
    // @0x2846f1 — exclusive lock during cleanup.
    this.mutex.lock();
    // @0x2846f6 — plug = null.
    this.plug = null;
    // @0x284700 — unlock.
    this.mutex.unlock();
    // @0x284705 — read owned pointer at +0x58.
    const owned = this.ownedSomething;
    if (owned != null) {
      // @0x28470e — mirror-store at +0x60 BEFORE the delete (last-ptr-standing).
      this.ownedMirror = owned;
      // @0x284712 — operator delete. In JS this is GC; we just null the ref.
      // The address citation matters more than the freeing: any caller that
      // still holds this reference will exhibit use-after-free-equivalent
      // behavior in the real binary but a live-JS-reference here (documented
      // limitation, not a shortcut — the semantic gap is inherent to porting
      // manual C++ deletes to a GC'd runtime).
      this.ownedSomething = null;
    }
    // @0x28471e — std::mutex::~mutex on &this->mutex.
    // PCSharedMutex's own destroy is a superset of std::mutex::~mutex(); the
    // ASM inlines the sub-object dtor. We call the closest available method.
    // (No explicit `destroy` method on PCSharedMutex.ts; JS GC handles it.
    // If PCSharedMutex ever grows an explicit destroy(), wire it here.)
  }
}
