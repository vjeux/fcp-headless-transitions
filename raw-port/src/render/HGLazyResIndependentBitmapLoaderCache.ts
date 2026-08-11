// raw-port: HGLazyResIndependentBitmapLoaderCache (Ozone.framework)
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * HGLazyResIndependentBitmapLoaderCache::Instance()  @Ozone 0xda2b0
//     __ZN37HGLazyResIndependentBitmapLoaderCache8InstanceEv
//     re/disasm: raw-port/re/disasm/__ZN37HGLazyResIndependentBitmapLoaderCache8InstanceEv.s
//
// A PER-THREAD lazily-created singleton accessor: the cache lives in a
// `PCThreadSpecific<HGLazyResIndependentBitmapLoaderCache>` (a pthread TLS key),
// and `Instance()` returns the calling thread's object, allocating it on first
// use.
//
// -----------------------------------------------------------------------------
// STORAGE MODEL — why the TLS key becomes module state
// -----------------------------------------------------------------------------
// Native storage is the function-local static
// `Instance()::perThreadInstance` (a `pthread_key_t`) plus its Itanium-ABI
// guard byte `__ZGVZN37…E17perThreadInstance`, and the per-thread payload is
// reached through `_pthread_getspecific` / `_pthread_setspecific`.
//
// This port runs single-threaded, so — exactly as the landed
// `OZMEChannelTimeConverter` / `OZChannelTimeConverter` ports do for their own
// `PCThreadSpecific<...>` storage — the thread-specific slot is modelled as ONE
// module-scope holder and the key-creation dance is a documented no-op (there
// is no key to create, and the guard byte's only job is to make that creation
// happen exactly once). The observable behaviour of `Instance()` is preserved
// bit-for-bit for the one logical thread: first call allocates and installs,
// every later call returns the same object.
//
// The destructor callback handed to `_pthread_key_create` @0xda32b —
// `PCThreadSpecific<HGLazyResIndependentBitmapLoaderCache>::destroy(...)`
// @Ozone 0xe2c10 — is only ever invoked by the pthread runtime at THREAD EXIT.
// A single-threaded port has no thread exit, so that edge is unreachable here;
// the symbol is cited rather than called (it is its own ledger unit and is not
// transcribed by this one).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — recovered from the allocation site
// -----------------------------------------------------------------------------
//   0xda2d9  movl   $0x18, %edi          ; sizeof(cache) = 0x18 = 24 bytes
//   0xda2de  callq  __Znwm               ; operator new(24)
//   0xda2e6  addq   $0x8, %rax           ; rax = p + 8
//   0xda2ea  xorps  %xmm0, %xmm0
//   0xda2ed  movups %xmm0, 0x8(%rbx)     ; zero the 16 bytes at +0x08..+0x17
//   0xda2f1  movq   %rax, (%rbx)         ; +0x00 = p + 8   (points AT +0x08)
//
//   HGLazyResIndependentBitmapLoaderCache {
//     +0x00  __begin_node  = &this->+0x08   (self-referential on an empty container)
//     +0x08  __pair1_      = 0              (the tree ROOT pointer)
//     +0x10  __pair3_      = 0              (the element COUNT)
//   }
//
// That "+0x00 holds the address of +0x08, and +0x08/+0x10 are zeroed" shape is
// libc++'s EMPTY `std::__tree` (`__begin_node_ == __end_node()`), the identical
// idiom the landed `OZSceneList` ctor uses at +0x50/+0x58/+0x60 (@0x816e4 /
// @0x816eb / @0x816ef). So the cache object IS a `std::set`/`std::map` head and
// nothing else — there is no vptr and no other field, because `operator new`
// asked for exactly 24 bytes and all 24 are accounted for.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — all TRUE OUT-OF-SCOPE runtime externs
// -----------------------------------------------------------------------------
//   _pthread_getspecific   symbol stub @0x6e00a4  (called @0xda2c8)
//   _pthread_setspecific   symbol stub @0x6e00b6  (called @0xda2fe)
//   _pthread_key_create    symbol stub @0x6e00aa  (called @0xda32b)
//   __Znwm (operator new)  symbol stub @0x6dfca2  (called @0xda2de)
//   ___cxa_guard_acquire   symbol stub @0x6dfcf6  (called @0xda314)
//   ___cxa_guard_release   symbol stub @0x6dfcfc  (called @0xda337)
//   ___cxa_guard_abort     symbol stub @0x6dfcf0  (called @0xda348, unwind path)
//   __Unwind_Resume        symbol stub @0x6dd07a  (called @0xda350, unwind path)
// libpthread / libc++abi / libc++ — none of them is in the five-framework port
// scope, and each is modelled by the equivalent JS-runtime behaviour described
// above rather than by inventing a value.
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6.

/**
 * `HGLazyResIndependentBitmapLoaderCache` — the 24-byte per-thread cache object.
 *
 * The three slots are the libc++ `std::__tree` head recovered from the
 * allocation site (see the file header); the element type is not decoded by
 * this unit (no ported method inserts or looks up), so the root pointer stays
 * opaque instead of being given an invented node shape.
 */
export class HGLazyResIndependentBitmapLoaderCache {
  /**
   * `+0x00  __begin_node_` — initialised to `this + 0x08` @Ozone 0xda2e6 /
   * @0xda2f1 (`addq $0x8, %rax` then `movq %rax, (%rbx)`), i.e. libc++'s
   * empty-tree invariant `__begin_node_ == __end_node()`. Modelled by pointing
   * at this same object's end-node slot pair, so `begin == end` holds by
   * identity for a freshly allocated cache.
   */
  beginNodeAt0: HGLazyResIndependentBitmapLoaderCache | null = this;

  /**
   * `+0x08  __pair1_` — the tree ROOT pointer, zeroed by the 16-byte
   * `movups %xmm0, 0x8(%rbx)` @Ozone 0xda2ed. Opaque: no ported method walks
   * the nodes.
   */
  rootAt8: unknown = null;

  /**
   * `+0x10  __pair3_` — the element COUNT, zeroed by that same 16-byte store
   * @Ozone 0xda2ed.
   */
  sizeAt10 = 0;
}

/**
 * The `Instance()::perThreadInstance` TLS SLOT.
 *
 * Native: a `pthread_key_t` function-local static whose per-thread value is
 * read with `_pthread_getspecific` @0xda2c8 and written with
 * `_pthread_setspecific` @0xda2fe. Here: the single logical thread's value,
 * `null` until the first `Instance()` call installs one — which is exactly the
 * `testq %rax,%rax ; je` condition at @0xda2cd/@0xda2d0.
 */
let perThreadInstance: HGLazyResIndependentBitmapLoaderCache | null = null;

/**
 * The Itanium-ABI GUARD BYTE for `perThreadInstance`
 * (`__ZGVZN37…E17perThreadInstance`, read with `movzbl` @Ozone 0xda2b6).
 *
 * Non-zero means "the pthread key has already been created". Kept as a real
 * observable so the one-time key-creation path below is transcribed rather
 * than optimised away, even though creating the key is a no-op in this model.
 */
let perThreadInstanceGuard = 0;

/**
 * Test/reset hook — NOT an FCP function. Restores both module-scope statics to
 * their pre-first-call state so a test can exercise the cold path more than
 * once; the binary has no equivalent because process statics are only zeroed
 * at load time.
 */
export function __resetHGLazyResIndependentBitmapLoaderCacheTLS(): void {
  perThreadInstance = null;
  perThreadInstanceGuard = 0;
}

/**
 * `HGLazyResIndependentBitmapLoaderCache::Instance()` — @Ozone 0x000da2b0
 * (mangled `__ZN37HGLazyResIndependentBitmapLoaderCache8InstanceEv`).
 *
 * Full transcription — every instruction of the primary paths, in order
 * (raw-port/re/disasm/__ZN37HGLazyResIndependentBitmapLoaderCache8InstanceEv.s):
 *
 *   0xda2b0  pushq  %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *                                        ; frame setup (no TS counterpart)
 *   0xda2b6  movzbl guard(%rip), %eax    ; the Itanium guard BYTE
 *   0xda2bd  testb  %al, %al
 *   0xda2bf  je     0xda30d              ;   guard == 0 -> create the key
 *   0xda2c1  movq   perThreadInstance(%rip), %rdi   ; the pthread_key_t
 *   0xda2c8  callq  _pthread_getspecific ; rax = this thread's cache or null
 *   0xda2cd  testq  %rax, %rax
 *   0xda2d0  je     0xda2d9              ;   null -> allocate
 *   0xda2d2  (epilogue) retq             ; return the existing object
 *   -- allocate --
 *   0xda2d9  movl   $0x18, %edi
 *   0xda2de  callq  __Znwm               ; p = operator new(24)
 *   0xda2e3  movq   %rax, %rbx
 *   0xda2e6  addq   $0x8, %rax           ; rax = p + 8
 *   0xda2ea  xorps  %xmm0, %xmm0
 *   0xda2ed  movups %xmm0, 0x8(%rbx)     ; p[+0x08..+0x17] = 0
 *   0xda2f1  movq   %rax, (%rbx)         ; p[+0x00] = p + 8
 *   0xda2f4  movq   perThreadInstance(%rip), %rdi
 *   0xda2fb  movq   %rbx, %rsi
 *   0xda2fe  callq  _pthread_setspecific ; install it for this thread
 *   0xda303  movq   %rbx, %rax           ; return p
 *   0xda306  (epilogue) retq
 *   -- one-time key creation --
 *   0xda30d  leaq   guard(%rip), %rdi
 *   0xda314  callq  ___cxa_guard_acquire
 *   0xda319  testl  %eax, %eax
 *   0xda31b  je     0xda2c1              ;   another thread won the race ->
 *                                        ;   the key already exists, go read it
 *   0xda31d  leaq   perThreadInstance(%rip), %rdi
 *   0xda324  leaq   PCThreadSpecific<HGLazyResIndependentBitmapLoaderCache>::destroy(%rip), %rsi
 *   0xda32b  callq  _pthread_key_create  ; key + TLS destructor callback
 *   0xda330  leaq   guard(%rip), %rdi
 *   0xda337  callq  ___cxa_guard_release ; guard byte := 1
 *   0xda33c  jmp    0xda2c1              ; fall into the normal read path
 *   -- unwind path (not reachable without C++ exceptions) --
 *   0xda33e..0xda350  ___cxa_guard_abort + __Unwind_Resume
 *
 * NOTE the control flow: the guard path does NOT return the object itself — it
 * jumps back to @0xda2c1 and re-reads the (still empty) TLS slot, so the very
 * first call runs guard-acquire -> key-create -> guard-release -> getspecific
 * (null) -> allocate -> setspecific. That ordering is preserved below.
 *
 * The `je 0xda2c1` at @0xda31b is the lost-the-race arm: `__cxa_guard_acquire`
 * returns 0 when another thread already completed initialisation, in which case
 * the key must NOT be created twice. Single-threaded, the acquire always
 * succeeds, but the branch is transcribed because it is real control flow.
 *
 * @returns the calling thread's cache, allocating it on first use.
 */
export function HGLazyResIndependentBitmapLoaderCache_Instance(): HGLazyResIndependentBitmapLoaderCache {
  // @0xda2b6/@0xda2bd/@0xda2bf — movzbl guard ; testb ; je (guard == 0).
  if (perThreadInstanceGuard === 0) {
    // @0xda30d/@0xda314 — ___cxa_guard_acquire(&guard). Single-threaded: it
    // always wins, so the @0xda31b "lost the race" arm (jump straight to the
    // read path) cannot be taken here.
    // @0xda31d/@0xda324/@0xda32b — _pthread_key_create(&perThreadInstance,
    //   &PCThreadSpecific<HGLazyResIndependentBitmapLoaderCache>::destroy).
    //   No key exists in this runtime; the destructor callback @Ozone 0xe2c10
    //   would only run at thread exit and is therefore unreachable here.
    // @0xda330/@0xda337 — ___cxa_guard_release(&guard): guard byte := 1.
    perThreadInstanceGuard = 1;
    // @0xda33c — jmp 0xda2c1: fall through into the read path below (the
    // object is NOT created by this arm).
  }

  // @0xda2c1/@0xda2c8 — rdi = the key ; rax = _pthread_getspecific(key).
  const existing = perThreadInstance;
  // @0xda2cd/@0xda2d0 — testq %rax,%rax ; je -> allocate.
  if (existing !== null) {
    // @0xda2d2..@0xda2d8 — epilogue, return the existing object.
    return existing;
  }

  // @0xda2d9/@0xda2de — p = operator new(0x18).
  const p = new HGLazyResIndependentBitmapLoaderCache();
  // @0xda2ea/@0xda2ed — movups %xmm0, 0x8(%rbx): zero +0x08..+0x17.
  p.rootAt8 = null;
  p.sizeAt10 = 0;
  // @0xda2e6/@0xda2f1 — movq (p+8), (p+0): __begin_node_ = __end_node().
  p.beginNodeAt0 = p;
  // @0xda2f4/@0xda2fb/@0xda2fe — _pthread_setspecific(key, p).
  perThreadInstance = p;
  // @0xda303..@0xda30c — movq %rbx,%rax ; epilogue ; retq.
  return p;
}
