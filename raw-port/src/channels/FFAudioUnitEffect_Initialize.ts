// raw-port/src/channels/FFAudioUnitEffect_Initialize.ts
//
// FCP `FFAudioUnitEffect_Initialize` — a Flexo "static-init helper" whose
// only exported member is a D1 destructor. The class is used as a
// file-local static-storage object so that its *constructor* (not exported;
// runs from a __mod_init_func) primes the FFAudioUnitInfoCacheBase
// observer registration for audio-unit effects at process start, and its
// *destructor* (this file) performs one final "touch" of the observer via
// a nested NSAutoreleasePool so any registrations still holding
// autoreleased objects at teardown are drained.
//
// The runtime observation is: the D1 body allocates an NSAutoreleasePool,
// calls `[FFAudioUnitInfoCacheBase observer]` for side effects (return
// value discarded), then releases the pool. The `observer` class method's
// return value being ignored is intentional — the call itself does the
// necessary side-effectful work (touching the class's observer machinery,
// forcing a flush) and everything it retains is drained inside the pool.
//
// Framework: Flexo
//
// Provenance (1 symbol):
//   ~FFAudioUnitEffect_Initialize() [D1]  @0x52c810
//
// EXTERNAL FUNCTIONS REFERENCED (boundary throw-stubs — each cites its addr):
//   * `+[NSAutoreleasePool alloc/init]` via `objc_alloc_init` runtime helper
//       @Flexo stub 0x1497908 — called @0x52c81d with %rdi=OBJC_CLASS_$_NSAutoreleasePool.
//       (Newer ObjC runtime coalesces `[[Cls alloc] init]` into a single
//        `_objc_alloc_init` call for size + speed; that is what the compiler
//        emitted here.)
//   * `-[FFAudioUnitInfoCacheBase observer]` — instance/class message.
//       @Flexo dispatched at 0x52c833 via `callq *0x13c0e87(%rip)` (an
//       objc_msgSend selector pointer for "observer"). The receiver at
//       0x52c825 is `leaq _OBJC_CLASS_$_FFAudioUnitInfoCacheBase(%rip),%rdi`
//       (so the "observer" is being sent to the CLASS itself — a +class
//       message). The 2nd-arg selector was preloaded @0x52c82c from
//       0x16a4225(%rip) (the objc_selref for the string "observer").
//   * `objc_release(id)`
//       @Flexo indirect via 0x13c0ec6(%rip) from 0x52c83c.
//   * __clang_call_terminate — libcxx-emitted terminate wrapper called by
//       the personality routine's landing pad when the direct callee throws.
//       Not user-visible; only invoked on unwind of an ObjC exception out of
//       one of the msgSend/release calls.
//
// STRUCT LAYOUT — this class holds NO instance state (the destructor never
//   touches %rdi/`this`; it works only on ObjC classes). Like
//   FFCinematicManagerDestructor, this exists solely so the C++ compiler
//   can attach an `__cxa_atexit` D1 to a static-storage instance.

// -- Boundary throw-stubs for undecoded externs ------------------------------------------

/**
 * ObjC runtime helper `objc_alloc_init(Class)` — equivalent to
 * `[[cls alloc] init]` in one call.
 * @Flexo stub 0x1497908 (imported as `_objc_alloc_init`). Called by this
 * class's D1 @0x52c81d with `%rdi = _OBJC_CLASS_$_NSAutoreleasePool`.
 */
function objc_alloc_init(_cls: unknown): unknown {
  throw new Error(
    "objc_alloc_init(Class) @Flexo stub 0x1497908 not yet transcribed (D1 call-site 0x52c81d)",
  );
}

/**
 * ObjC message `+[FFAudioUnitInfoCacheBase observer]` — send the "observer"
 * class-method selector to the FFAudioUnitInfoCacheBase class object.
 * @Flexo dispatched via `callq *0x13c0e87(%rip)` @0x52c833; receiver
 * @0x52c825 (`leaq _OBJC_CLASS_$_FFAudioUnitInfoCacheBase(%rip),%rdi`);
 * selector loaded @0x52c82c from 0x16a4225(%rip) (objc_selref "observer").
 * Return value is discarded by the caller.
 */
function objc_send_FFAudioUnitInfoCacheBase_observer(): unknown {
  throw new Error(
    "objc_msgSend +[FFAudioUnitInfoCacheBase observer] @Flexo 0x52c833 not yet transcribed",
  );
}

/**
 * `objc_release(id obj)` — decrement the retain count.
 * @Flexo indirect via 0x13c0ec6(%rip) at call-site 0x52c83c.
 */
function objc_release(_obj: unknown): void {
  throw new Error(
    "objc_release(id) @Flexo (import via 0x13c0ec6(%rip) at 0x52c83c) not yet transcribed",
  );
}

// =============================================================================================
//  Destructor
// =============================================================================================

/**
 * ~FFAudioUnitEffect_Initialize() [D1] — complete-object destructor.
 * @Flexo __ZN28FFAudioUnitEffect_InitializeD1Ev @0x52c810.
 *
 * Body (verbatim):
 *   0x52c810  push %rbp
 *   0x52c811  mov  %rsp,%rbp
 *   0x52c814  push %rbx
 *   0x52c815  push %rax                        ; align/scratch (16B frame)
 *   0x52c816  mov  0x13c0b83(%rip),%rdi        ; %rdi = _OBJC_CLASS_$_NSAutoreleasePool
 *   0x52c81d  callq 0x1497908                  ; _objc_alloc_init(NSAutoreleasePool)
 *   0x52c822  mov  %rax,%rbx                   ; save pool
 *   0x52c825  lea  _OBJC_CLASS_$_FFAudioUnitInfoCacheBase(%rip),%rdi
 *                                              ; receiver = FFAudioUnitInfoCacheBase class
 *   0x52c82c  mov  0x16a4225(%rip),%rsi        ; selector = "observer"
 *   0x52c833  callq *0x13c0e87(%rip)           ; [FFAudioUnitInfoCacheBase observer]
 *   0x52c839  mov  %rbx,%rdi                   ; restore pool -> %rdi
 *   0x52c83c  callq *0x13c0ec6(%rip)           ; objc_release(pool)
 *   0x52c842  add  $0x8,%rsp
 *   0x52c846  pop  %rbx
 *   0x52c847  pop  %rbp
 *   0x52c848  ret
 *   0x52c849  mov  %rax,%rdi                   ; landing pad (uncaught ObjC excn)
 *   0x52c84c  callq ___clang_call_terminate
 *   0x52c851  nop
 *
 * Semantic: create an autorelease pool, touch the FFAudioUnitInfoCacheBase
 * observer machinery (retain/release side effects only; return value
 * discarded), then release the pool to drain it.
 */
export function FFAudioUnitEffect_Initialize_D1(_self: unknown): void {
  // 0x52c81d  pool = _objc_alloc_init(NSAutoreleasePool)
  const pool = objc_alloc_init(/* _OBJC_CLASS_$_NSAutoreleasePool */ null);
  // 0x52c833  (void)[FFAudioUnitInfoCacheBase observer]
  objc_send_FFAudioUnitInfoCacheBase_observer();
  // 0x52c83c  objc_release(pool)
  objc_release(pool);
}
