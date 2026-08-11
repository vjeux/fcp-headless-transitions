// HGPool.ts — Helium framework, namespace `HGPool` (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice, unadjusted VAs).
//
// `HGPool` is a NAMESPACE, not a class — its members mangle as `__ZN6HGPool...`
// with nested types (`HGPool::BasePool`, `HGPool::Entry`, `HGPool::ServicingPolicy`,
// `HGPool::AllocationPolicy<D>`, ...). This file holds the namespace-scope free
// functions; nested classes get their own files as they are claimed.
//
// This file ports ONLY the symbol listed below. Every other HGPool member is a
// separate ledger entry, added to THIS file additively when claimed — never a
// rewrite or drop of a landed one.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGPool::unregisterPool(HGPool::BasePool*)   @Helium 0x8c9d0
//     __ZN6HGPool14unregisterPoolEPNS_8BasePoolE
//   * HGPool::registerPool(HGPool::BasePool*)     @Helium 0x8c850
//     __ZN6HGPool12registerPoolEPNS_8BasePoolE
//     — with its std::call_once initializer, the proxy
//       __ZNSt3__117__call_once_proxy...registerPool...$_0  @Helium 0x8d860,
//       which is the ONLY installer of `(anonymous namespace)::_registry`.
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN6HGPool14unregisterPoolEPNS_8BasePoolE.s  (46 lines)
//   raw-port/re/disasm/Helium.__ZN6HGPool12registerPoolEPNS_8BasePoolE.s   (102 lines)
//   raw-port/re/disasm/Helium.__ZNSt3__117__call_once_proxy...$_0...s       (33 lines)
//
// WHY registerPool IS IN THIS FILE. Review of the unregisterPool PR found that
// the port was correct and UNREACHABLE: `_registry` @0xadcf48 is a BSS pointer
// (NULL at load) whose only installer is registerPool's call_once @0x8c893, so
// with registerPool unported every call to unregisterPool hit the NULL branch.
// Both are namespace-scope members of HGPool, so they belong in this one file
// (PORTING_SPEC Rule 6), and porting the installer is what makes the erase
// path reachable.
//
// -----------------------------------------------------------------------------
// FULL DISASM — HGPool::unregisterPool(HGPool::BasePool*)  @0x8c9d0..@0x8ca51
// -----------------------------------------------------------------------------
//   0x8c9d0  pushq %rbp ; movq %rsp,%rbp
//   0x8c9d4  pushq %r15 ; pushq %r14 ; pushq %r13 ; pushq %r12 ; pushq %rbx
//   0x8c9dd  pushq %rax                    ; 8-byte pad (16-align)
//   0x8c9de  movq  %rdi, %r12              ; r12 = arg1 = pool (the BasePool* to remove)
//   0x8c9e1  movq  _registry(%rip), %rbx   ; rbx = _registry  (LOAD of the pointer VALUE)
//   0x8c9e8  addq  $0x18, %rbx             ; rbx = &_registry->mutex   (+0x18)
//   0x8c9ec  movq  %rbx, %rdi
//   0x8c9ef  callq std::__1::mutex::lock() ; stub 0x3c4f16 — LOCK the registry
//   0x8c9f4  movq  _registry(%rip), %r13   ; r13 = _registry (reload; rbx now holds &mutex)
//   0x8c9fb  movq  (%r13), %r14            ; r14 = it  = vec.__begin_  (+0x00)
//   0x8c9ff  movq  0x8(%r13), %r15         ; r15 = end = vec.__end_    (+0x08)
//   0x8ca03  cmpq  %r15, %r14              ; flags on (it - end): empty vector?
//   0x8ca06  je    0x8ca20                 ;   begin == end -> skip the scan
//   0x8ca08  nopl  (%rax,%rax)             ; loop-head alignment padding (not code)
//   .scan (0x8ca10):
//   0x8ca10  cmpq  %r12, (%r14)            ; flags on (*it - pool): *it == pool ?
//   0x8ca13  je    0x8ca20                 ;   FOUND -> go erase
//   0x8ca15  addq  $0x8, %r14              ; ++it   (8 bytes = one BasePool*)
//   0x8ca19  cmpq  %r15, %r14              ; it == end ?
//   0x8ca1c  jne   0x8ca10                 ;   keep scanning
//   0x8ca1e  jmp   0x8ca40                 ; NOT FOUND -> straight to unlock
//   .maybe_erase (0x8ca20):
//   0x8ca20  cmpq  %r15, %r14              ; it == end ? (only true for the empty-vector
//   0x8ca23  je    0x8ca40                 ;   entry above) -> nothing to erase
//   0x8ca25  leaq  0x8(%r14), %rsi         ; rsi = it + 1
//   0x8ca29  subq  %rsi, %r15              ; r15 = end - (it+1)  = BYTES after the hole
//   0x8ca2c  je    0x8ca39                 ;   0 bytes (erasing the LAST element) -> no move
//   0x8ca2e  movq  %r14, %rdi              ; dst = it
//   0x8ca31  movq  %r15, %rdx              ; n   = end - (it+1)
//   0x8ca34  callq _memmove                ; stub 0x3c543e — memmove(it, it+1, n):
//                                          ;   shift the tail down over the hole
//   .shrink (0x8ca39):
//   0x8ca39  addq  %r15, %r14              ; r14 = it + n  ==  end - 8
//   0x8ca3c  movq  %r14, 0x8(%r13)         ; vec.__end_ = end - 8  (size -= 1)
//   .unlock (0x8ca40):
//   0x8ca40  movq  %rbx, %rdi              ; rdi = &_registry->mutex
//   0x8ca43  addq $0x8,%rsp ; popq %rbx/%r12/%r13/%r14/%r15/%rbp
//   0x8ca51  jmp   std::__1::mutex::unlock() ; stub 0x3c4f1c — TAIL-JMP (unlock, then return)
//   0x8ca56  nopw  %cs:(%rax,%rax)         ; alignment padding (not code)
//
// Net effect: under `_registry->mutex`, erase the FIRST element of
// `_registry->pools` equal to `pool`; if no element matches (or the vector is
// empty) leave the vector untouched. Then unlock. Exactly
// `std::vector::erase(std::find(begin, end, pool))` guarded by the mutex —
// including the detail that only the FIRST match is removed and that a
// duplicate registration would survive.
//
// -----------------------------------------------------------------------------
// `(anonymous namespace)::_registry`  —  __ZN12_GLOBAL__N_19_registryE
// -----------------------------------------------------------------------------
// nm -arch x86_64 Helium:
//   0000000000adcf48 b __ZN12_GLOBAL__N_19_registryE
// Section class `b` = BSS, i.e. ZERO-INITIALIZED at load: `_registry` starts as
// a NULL pointer. It is a POINTER to a heap Registry, not the Registry itself —
// both accessors load it with `movq _registry(%rip), %reg` (a load of the stored
// qword) and then offset from the loaded value; a by-value struct would have
// been addressed with `leaq`.
//
// STRUCT LAYOUT of *_registry (recovered from unregisterPool + corroborated
// field-for-field by registerPool @0x8c850, which touches all four slots):
//
//   +0x00  BasePool**   pools.__begin_     ; unregisterPool @0x8c9fb `movq (%r13),%r14`
//                                          ; registerPool   @0x8c8d2 `movq (%r14),%rsi`
//                                          ;                @0x8c970 `movq %r13,(%r14)`
//   +0x08  BasePool**   pools.__end_       ; unregisterPool @0x8c9ff / stored @0x8ca3c
//                                          ; registerPool   @0x8c8b2 / stored @0x8c990
//   +0x10  BasePool**   pools.__end_cap_   ; NOT touched by unregisterPool;
//                                          ; registerPool   @0x8c8b6 `movq 0x10(%r14),%rax`
//                                          ;   (capacity check) and stored @0x8c97b
//   +0x18  std::__1::mutex  mutex          ; both functions `addq $0x18` then lock/unlock
//
// The element type is NOT inferred — registerPool's cold path names it outright:
//   @0x8c9ab callq __ZNSt3__16vectorIPN6HGPool8BasePoolENS_9allocatorIS3_EEE20__throw_length_error...
//            = std::vector<HGPool::BasePool*, std::allocator<HGPool::BasePool*>>
// so +0x00..+0x10 is a libc++ `std::vector<HGPool::BasePool*>` (the canonical
// three-pointer {begin, end, end_cap} layout), and the 8-byte stride at
// @0x8ca15 (`addq $0x8,%r14`) is sizeof(BasePool*).
//
// -----------------------------------------------------------------------------
// OUT-OF-SCOPE EXTERNS (modelled at the boundary, PORTING_SPEC Rule 3)
// -----------------------------------------------------------------------------
//   * std::__1::mutex::lock()    __ZNSt3__15mutex4lockEv    @0x8c9ef (stub 0x3c4f16)
//   * std::__1::mutex::unlock()  __ZNSt3__15mutex6unlockEv  @0x8ca51 (stub 0x3c4f1c)
//     libc++ runtime. JS is single-threaded, so lock/unlock have NO observable
//     value effect; per the established convention in this port (see
//     FFMemoryPressureTracker, FFPlayerLockable, FlushManager, SessionManager)
//     they are kept as bridge no-ops that record the critical section for
//     provenance. They are NOT in-scope FCP callees.
//   * _memmove                   @0x8ca34 (stub 0x3c543e)
//     libc. It moves the raw tail bytes of the vector's buffer down over the
//     erased slot; in the JS model the element array is the buffer, so the
//     move is the array splice itself (documented at the call site).
//
// FRONTIER CALLEES: none in-scope. Dependencies: 0 in-scope, 0 indirect,
// 3 out-of-scope externs (mutex::lock, mutex::unlock, memmove).
// -----------------------------------------------------------------------------

/**
 * `HGPool::BasePool` — opaque base class of every Helium pool
 * (HGMetalHeapPool, HGMetalBufferPool, HGMetalTexturePool,
 * HGCVPixelBufferPool, ...). `unregisterPool` only ever compares the POINTER
 * (`cmpq %r12, (%r14)` @0x8ca10 — an 8-byte identity compare) and never
 * dereferences it, so no field of BasePool is decoded by this unit and none
 * may be invented. Branded so it cannot be confused with another opaque
 * handle at the type level; identity is object identity, mirroring the
 * machine's pointer compare.
 */
export interface HGPool_BasePool {
  readonly __hgPoolBasePool: unique symbol;
}

/**
 * The heap object `(anonymous namespace)::_registry` points at.
 *
 * `pools` models the libc++ `std::vector<HGPool::BasePool*>` occupying
 * +0x00..+0x18 as a JS array (the layer convention for libc++ containers —
 * see FFAudioGraph's `__tree`-as-Map). A JS array carries its own
 * begin/end/capacity, so the three raw pointer slots collapse into it:
 *   __begin_ (+0x00) -> index 0
 *   __end_   (+0x08) -> `pools.length`  (the slot unregisterPool writes @0x8ca3c)
 *   __end_cap_ (+0x10) -> the array's capacity, which unregisterPool never
 *                         reads or writes (an erase cannot reallocate).
 */
export interface HGPool_Registry {
  /** +0x00..+0x10 : std::vector<HGPool::BasePool*> — the registered pools. */
  pools: HGPool_BasePool[];
  /**
   * +0x10 `__end_cap_`, expressed in ELEMENTS rather than as a raw pointer.
   *
   * `unregisterPool` never reads or writes this slot (an erase cannot
   * reallocate), which is why the first version of this file folded it into
   * the JS array. `registerPool` DOES: it compares `__end_` against it
   * @0x8c8ba to decide fast-path vs growth, derives the new capacity from it
   * @0x8c8ff..@0x8c91d, and stores the new one @0x8c97b. It is a real field
   * with an observable growth policy, so it is modelled explicitly rather
   * than implied by `pools.length`.
   *
   * A libc++ vector holds POINTERS here; the byte spans the machine computes
   * (`__end_cap_ - __begin_`) are element counts multiplied by 8, and every
   * such conversion is written out at the site that performs it.
   */
  capacity: number;
}

/**
 * `(anonymous namespace)::_registry` — @Helium 0xadcf48, section `b` (BSS),
 * so it is a NULL pointer until something installs a Registry.
 *
 * The installer is `HGPool::registerPool`'s `std::call_once` @Helium 0x8c893
 * (onceFlag @0xadcf40, proxy
 * `__ZNSt3__117__call_once_proxy...registerPool...$_0` @0x8d860), ported
 * below in this same file — it is the other namespace-scope member of
 * HGPool. `unregisterPool` deliberately does NO call_once of its own: its
 * very first act @0x8c9e1 is an unguarded load of this pointer.
 *
 * Exported as a one-slot box because it is a REAL symbol in the binary, not a
 * helper invented for this port: the box models the 8-byte BSS cell itself, so
 * `.value` is the pointer the two `movq _registry(%rip)` loads read (@0x8c9e1
 * and @0x8c9f4 here; @0x8c898 and @0x8c8ab in registerPool). Whoever ports
 * registerPool writes its call_once result into `.value`, exactly as
 * registerPool's initializer writes the cell — neither function has to reach
 * into the other's internals.
 */
export const _GLOBAL__N_1_registry: { value: HGPool_Registry | null } = {
  value: null,
};

/**
 * `std::__1::mutex::lock()` — libc++ out-of-scope extern, called @Helium
 * 0x8c9ef via stub 0x3c4f16 on `&_registry->mutex` (+0x18).
 *
 * JS is single-threaded: there is no other thread that could hold this lock,
 * so acquiring it is a value-preserving no-op. Kept as a named bridge so the
 * critical section stays visible at the call site and carries its address.
 */
function std_mutex_lock(_mutex: HGPool_Registry): void {
  // @0x8c9ef callq __ZNSt3__15mutex4lockEv (stub 0x3c4f16) — no-op bridge.
}

/**
 * `std::__1::mutex::unlock()` — libc++ out-of-scope extern, TAIL-JMP'd
 * @Helium 0x8ca51 via stub 0x3c4f1c on the same `&_registry->mutex` (+0x18)
 * that was locked @0x8c9ef. No-op bridge, as above.
 */
function std_mutex_unlock(_mutex: HGPool_Registry): void {
  // @0x8ca51 jmp __ZNSt3__15mutex6unlockEv (stub 0x3c4f1c) — no-op bridge.
}

/**
 * `HGPool::registerPool(HGPool::BasePool*)::onceFlag` — @Helium 0xadcf40,
 * the `std::once_flag` guarding the registry's one-time construction.
 *
 * Address derived from the instruction itself rather than from a symbol
 * lookup: @0x8c864 is `48 8b 05 <disp32>` with disp32 = 0xa506d5, and
 * 0x8c86b + 0xa506d5 = 0xadcf40 (the `leaq` @0x8c881 computes the same
 * address, and `_registry` sits 8 bytes above it at 0xadcf48). BSS, so it
 * starts as 0.
 *
 * libc++ spells the states 0 = "never run" and ~0UL = "done", which is why
 * the machine's inline fast path @0x8c86b compares against -1.
 */
const registerPool_onceFlag: { value: bigint } = { value: 0n };

/** ~0UL, the value libc++ leaves in a once_flag that has run (@0x8c86b). */
const ONCE_FLAG_DONE = 0xffffffffffffffffn;

/**
 * `(anonymous namespace)::poolsObserverThreadFunction()` — @Helium 0x8d8e0
 * (__ZN12_GLOBAL__N_127poolsObserverThreadFunctionEv).
 *
 * The initializer @0x8d8a1 takes this function's ADDRESS and hands it to
 * `std::thread`; it never calls it. The port carries the reference for
 * provenance and, deliberately, does not run it — see
 * `std_thread_start_detached` for the boundary decision.
 */
const POOLS_OBSERVER_THREAD_FUNCTION =
  '__ZN12_GLOBAL__N_127poolsObserverThreadFunctionEv @Helium 0x8d8e0';

/**
 * `operator new(unsigned long)` — __Znwm, libc++ runtime out-of-scope extern.
 * Called @Helium 0x8d86b (stub 0x3c4fb2) for the 0x58-byte registry, and
 * @Helium 0x8c936 (same stub) for the vector's element storage.
 *
 * Raw storage has no counterpart in the JS model — a JS object IS its
 * storage, and the array IS the vector's buffer — so this is a named bridge
 * that keeps the allocation visible at the call site with its size and
 * address. Every field the machine then writes into that storage is written
 * explicitly by the caller below.
 */
function std_operator_new(_bytes: bigint): void {
  // @0x8d86b / @0x8c936 callq __Znwm (stub 0x3c4fb2) — no-op bridge.
}

/**
 * `operator delete(void*)` — __ZdlPv, libc++ runtime out-of-scope extern,
 * called @Helium 0x8c987 (stub 0x3c4fa0) on the vector's OLD buffer after a
 * growth reallocation, and only when that buffer was non-null (@0x8c97f).
 *
 * A deallocation primitive: modelled as a no-op, not a throw, for the reason
 * the CFRelease family carries — JS GC owns the surrogate, and a throw here
 * would sit on the ordinary growth path and delete the rest of the function.
 */
function std_operator_delete(_oldBuffer: HGPool_BasePool[] | null): void {
  // @0x8c987 callq __ZdlPv (stub 0x3c4fa0) — no-op bridge.
}

/**
 * `std::thread(void (&)())` + `detach()` + `~thread()` — @Helium 0x8d8af,
 * 0x8d8b7 and 0x8d8c0 (stubs 0x3c4f46 / 0x3c4f4c). libc++ runtime,
 * out-of-scope.
 *
 * BOUNDARY DECISION, stated loudly because it is a real behavioural gap and
 * not a transcription detail: the initializer starts a DETACHED background
 * thread running `poolsObserverThreadFunction` @0x8d8e0. The JS surrogate has
 * no threads, so this bridge records the target and starts nothing. The
 * alternative — throwing — would put an incompleteness on the ONLY path that
 * installs `_registry`, i.e. it would make both registerPool and
 * unregisterPool unreachable, which is the defect this file was rejected for
 * in the first place. Nothing in `registerPool` or `unregisterPool` observes
 * the observer thread: it is not stored in the registry (the 0x58 bytes are
 * fully accounted for as vector + mutex), and the `std::thread` object is a
 * stack temporary destroyed @0x8d8c0 before the initializer returns.
 */
function std_thread_start_detached(_entry: string): void {
  // @0x8d8af thread ctor ; @0x8d8b7 detach ; @0x8d8c0 ~thread — no-op bridge.
}

/**
 * The `std::call_once` initializer for `_registry` — the body of
 * `HGPool::registerPool(HGPool::BasePool*)::$_0`, reached through
 * `__ZNSt3__117__call_once_proxy...` @Helium 0x8d860 (33 lines).
 *
 * Transcription of the proxy body, which is the lambda inlined into it:
 *
 *   0x8d866  movl  $0x58,%edi
 *   0x8d86b  callq __Znwm                 ; operator new(0x58) — the registry
 *   0x8d870  xorps %xmm0,%xmm0
 *   0x8d873  movups %xmm0,(%rax)          ; +0x00 __begin_ = +0x08 __end_ = 0
 *   0x8d876  movq  $0x0,0x10(%rax)        ; +0x10 __end_cap_ = 0
 *   0x8d87e  movq  $0x32aaaba7,0x18(%rax) ; +0x18 the mutex's first qword
 *   0x8d886  movups %xmm0,0x20(%rax)      ; +0x20..
 *   0x8d88a  movups %xmm0,0x30(%rax)      ; +0x30..
 *   0x8d88e  movups %xmm0,0x40(%rax)      ; +0x40..
 *   0x8d892  movq  $0x0,0x50(%rax)        ; ..+0x58 — the rest of the mutex, zero
 *   0x8d89a  movq  %rax,_registry(%rip)   ; install it
 *   0x8d8a1  leaq  poolsObserverThreadFunction(%rip),%rsi
 *   0x8d8af  callq std::thread::thread(void (&)())
 *   0x8d8b7  callq std::thread::detach()
 *   0x8d8c0  callq std::thread::~thread()
 *
 * SIZE AND LAYOUT AGREE: 0x58 = 0x18 (the three vector pointers) + 0x40
 * (a macOS `pthread_mutex_t`), which is exactly the layout recovered from
 * unregisterPool. The constant 0x32aaaba7 is not a magic number of this
 * function's own: it is `_PTHREAD_MUTEX_SIG_init`, the signature word
 * `PTHREAD_MUTEX_INITIALIZER` puts at the front of a default-initialised
 * mutex — which is what a freshly constructed `std::mutex` is. The port
 * models the mutex by the no-op lock/unlock bridges above, so the
 * initialised-mutex bytes carry no JS state; the zeroed vector slots become
 * an empty array with capacity 0.
 */
function registerPool_onceInit(): void {
  // @0x8d866/@0x8d86b operator new(0x58) — the registry's storage.
  std_operator_new(0x58n);
  // @0x8d873/@0x8d876 the three vector pointers are zeroed: empty, no capacity.
  const registry: HGPool_Registry = { pools: [], capacity: 0 };
  // @0x8d87e..@0x8d892 the mutex is default-initialised (see the doc comment).
  // @0x8d89a movq %rax,_registry(%rip) — install into the BSS cell.
  _GLOBAL__N_1_registry.value = registry;
  // @0x8d8a1..@0x8d8c0 start the detached pools-observer thread.
  std_thread_start_detached(POOLS_OBSERVER_THREAD_FUNCTION);
}

/**
 * `std::__1::__call_once(unsigned long volatile&, void*, void (*)(void*))` —
 * libc++ out-of-scope extern, called @Helium 0x8c893 (stub 0x3c4e26) with the
 * once_flag @0xadcf40, a stack tuple holding the lambda, and the proxy
 * @0x8d860.
 *
 * The real implementation serialises racing threads on a mutex + condition
 * variable and leaves the flag at ~0UL when the initializer returns. JS is
 * single-threaded, so the surrogate is the state machine without the
 * serialisation: run the initializer if the flag is not already ~0UL, then
 * set it. That is the same reduction the mutex bridges make, and it preserves
 * the property the caller depends on — the initializer runs exactly once.
 */
function std_call_once(flag: { value: bigint }, init: () => void): void {
  // @0x8c893 callq __ZNSt3__111__call_onceERVmPvPFvS2_E (stub 0x3c4e26).
  if (flag.value !== ONCE_FLAG_DONE) {
    init();
    flag.value = ONCE_FLAG_DONE;
  }
}

/**
 * `std::vector<HGPool::BasePool*>::__throw_length_error()` — @Helium 0x8c9ab,
 * a REAL trap in the disassembly (the call is followed by `ud2` @0x8c9b7).
 * Reached only when the new size would overflow the 61-bit element count
 * checked @0x8c8e7.
 */
function vector_throw_length_error(): never {
  // @0x8c9ab callq ...__throw_length_error... ; @0x8c9b7 ud2 — the machine traps.
  throw new Error(
    'std::vector<HGPool::BasePool*>::__throw_length_error @Helium 0x8c9ab — ' +
      'the requested size overflows the 61-bit element count checked @0x8c8e7.',
  );
}

/**
 * `std::__throw_bad_array_new_length()` — @Helium 0x8c9b2, likewise a REAL
 * trap followed by `ud2` @0x8c9b7. Reached when the computed capacity exceeds
 * `max_size()` @0x8c921.
 */
function throw_bad_array_new_length(): never {
  // @0x8c9b2 callq __ZSt28__throw_bad_array_new_length... ; @0x8c9b7 ud2.
  throw new Error(
    'std::__throw_bad_array_new_length @Helium 0x8c9b2 — the computed capacity ' +
      'exceeds vector::max_size, checked @0x8c921.',
  );
}

/**
 * `HGPool::registerPool(HGPool::BasePool*)` — @Helium 0x8c850
 * (__ZN6HGPool12registerPoolEPNS_8BasePoolE).
 *
 * Namespace-scope free function: %rdi is the BasePool*, moved to %r13
 * @0x8c861 and only ever STORED — never dereferenced, exactly as
 * unregisterPool only ever compares it.
 *
 * Ensure the registry exists (std::call_once @0x8c893), then, under
 * `_registry->mutex`, `push_back` the pool onto
 * `std::vector<HGPool::BasePool*>` — the fast path when there is spare
 * capacity @0x8c8bf, otherwise libc++'s `__push_back_slow_path`, inlined here
 * in full @0x8c8ce..@0x8c98c. Unlock @0x8c997 and return. Unlike
 * unregisterPool the unlock is a plain call, not a tail jump.
 *
 * FULL DISASM — @0x8c850..@0x8c9aa (the cold traps at @0x8c9ab/@0x8c9b2 and
 * the landing pad at @0x8c9b9 are quoted with their handlers below):
 *
 *   0x8c864  movq  onceFlag(%rip),%rax     ; the inline once fast path
 *   0x8c86b  cmpq  $-0x1,%rax
 *   0x8c86f  je    0x8c898                 ;   already initialised -> skip
 *   0x8c871..0x8c88f                       ; build the call_once arg pack:
 *                                          ;   -0x29(%rbp) is the empty lambda
 *                                          ;   object, -0x60 a pointer to it,
 *                                          ;   -0x58 the tuple handed to the proxy
 *   0x8c893  callq __call_once(flag, &tuple, proxy @0x8d860)
 *   0x8c898  movq  _registry(%rip),%r12
 *   0x8c89f  addq  $0x18,%r12              ; &_registry->mutex
 *   0x8c8a6  callq std::mutex::lock()
 *   0x8c8ab  movq  _registry(%rip),%r14    ; reload the base pointer
 *   0x8c8b2  movq  0x8(%r14),%r15          ; end = __end_
 *   0x8c8b6  movq  0x10(%r14),%rax         ; cap = __end_cap_
 *   0x8c8ba  cmpq  %rax,%r15               ; flags on (end - cap)
 *   0x8c8bd  jae   0x8c8ce                 ;   end >= cap -> grow
 *   0x8c8bf  movq  %r13,(%r15)             ; *end = pool
 *   0x8c8c2  addq  $0x8,%r15               ; ++end
 *   0x8c8c6  movq  %r15,%rbx
 *   0x8c8c9  jmp   0x8c990                 ; -> store __end_ and unlock
 *   ; ---- growth (libc++ __push_back_slow_path, inlined) ----
 *   0x8c8ce  movq  %r12,-0x38(%rbp)        ; spill &mutex
 *   0x8c8d2  movq  (%r14),%rsi             ; begin
 *   0x8c8d5  subq  %rsi,%r15               ; r15 = end - begin      (BYTES)
 *   0x8c8db  sarq  $0x3,%r12               ; size = bytes >> 3      (ELEMENTS)
 *   0x8c8df  leaq  0x1(%r12),%rcx          ; newSize = size + 1
 *   0x8c8e7  shrq  $0x3d,%rdx ; jne 0x8c9ab; newSize >> 61 != 0 -> length_error
 *   0x8c8f1  movabsq $0x1fffffffffffffff,%rdx ; max_size (elements)
 *   0x8c8ff  subq  %rsi,%rax               ; capBytes = cap - begin
 *   0x8c905  sarq  $0x2,%rbx               ; newCap = capBytes >> 2 == 2 * cap
 *   0x8c909  cmpq  %rcx,%rbx
 *   0x8c90c  cmovbeq %rcx,%rbx             ; if (2*cap <= newSize) newCap = newSize
 *   0x8c910  movabsq $0x7ffffffffffffff8,%rcx
 *   0x8c91a  cmpq  %rcx,%rax
 *   0x8c91d  cmovaeq %rdx,%rbx             ; if (capBytes >= that) newCap = max_size
 *   0x8c921  cmpq  %rdx,%rbx
 *   0x8c924  ja    0x8c9b2                 ; newCap > max_size -> bad_array_new_length
 *   0x8c92e  leaq  (,%rbx,8),%rdi          ; newCap * 8 bytes
 *   0x8c936  callq __Znwm                  ; operator new
 *   0x8c93b  leaq  (%rax,%r15),%r13        ; slot for the new element
 *   0x8c93f  leaq  (%rax,%rbx,8),%rcx      ; new __end_cap_
 *   0x8c94b  movq  %rcx,(%rax,%r15)        ; *(newBegin + oldBytes) = pool
 *   0x8c94f  leaq  (%rax,%r15),%rbx ; addq $0x8,%rbx  ; new __end_
 *   0x8c957  shlq  $0x3,%r12 ; subq %r12,%r13         ; r13 = newBegin
 *   0x8c96b  callq _memcpy(newBegin, oldBegin, oldBytes)
 *   0x8c970  movq  %r13,(%r14)             ; __begin_   = newBegin
 *   0x8c973  movq  %rbx,0x8(%r14)          ; __end_     = newEnd
 *   0x8c97b  movq  %rax,0x10(%r14)         ; __end_cap_ = newEndCap
 *   0x8c97f  testq %r12,%r12 ; je 0x8c98c
 *   0x8c987  callq __ZdlPv                 ; operator delete(oldBegin), if any
 *   0x8c98c  movq  -0x38(%rbp),%r12        ; reload &mutex
 *   ; ---- join ----
 *   0x8c990  movq  %rbx,0x8(%r14)          ; __end_ = newEnd (both paths)
 *   0x8c997  callq std::mutex::unlock()
 *   0x8c9aa  retq
 *
 * The landing pad @0x8c9b9 (`mutex::unlock` then `_Unwind_Resume`) is the
 * exception path of the C++ frame: if `operator new` or `memcpy` threw, the
 * mutex is released and the exception continues. It has no TS counterpart —
 * the JS bridges cannot throw — and it stores nothing, so nothing is lost by
 * not modelling it.
 *
 * WHAT THE JS MODEL SUBSUMES, and why it is not a paraphrase: the vector's
 * three raw pointers are `pools` (the buffer AND its begin/end) plus
 * `capacity` (+0x10). So `operator new` + `memcpy` + `operator delete` move
 * elements between two raw buffers that, in the model, are the SAME array —
 * the copy is the identity, and only the capacity store is observable. Both
 * calls are still made through named bridges at their own addresses so the
 * allocation and the free stay visible. The element store @0x8c8bf (fast) and
 * @0x8c94b (grown) is one assignment at index `size`, which is also what
 * moves `__end_` @0x8c990.
 *
 * ORACLE — raw-port/re/oracle/HGPool_registry_oracle.py (+ _driver.mts;
 *   arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGPool_registry_oracle.py)
 * Both symbols are exported and neither dereferences its argument, so the live
 * functions are driven with opaque pointers and the registry's three vector
 * slots are read out of the process after every call. 12 steps — six pushes, a
 * DUPLICATE push, and four erases — 0 divergences, with the prologue bytes at
 * both entry points checked first. The live capacity sequence is
 * 1, 2, 4, 4, 8, 8, 8, which is what the growth math below computes, and the
 * erases agree element for element including the first-match-only rule.
 * Three controls, each changing ONE decision: capacity = size+1 instead of the
 * `cmovbe` max(2*cap, size+1) kills 9 of 12; reallocating on every push kills
 * 9; erasing all matches instead of the first kills 5 (that is what the
 * duplicate push is in the sequence for).
 * The call_once initializer @0x8d860 is deliberately NOT executed live: its
 * observer thread issues a VIRTUAL call on every registered pool @0x8d983,
 * which faults on opaque test pointers, so the harness presets the once_flag
 * and installs a registry byte-identical to the one the initializer builds.
 * That path is verified by reading, and the harness says so rather than
 * implying otherwise.
 *
 * @param pool  the BasePool to register (stored by pointer identity).
 */
export function HGPool_registerPool(pool: HGPool_BasePool): void {
  // @0x8c864..@0x8c86f — the inline once fast path: -1 means "already run".
  if (registerPool_onceFlag.value !== ONCE_FLAG_DONE) {
    // @0x8c871..@0x8c893 — build the arg pack and call __call_once with the
    // proxy @0x8d860, whose body is registerPool_onceInit above.
    std_call_once(registerPool_onceFlag, registerPool_onceInit);
  }

  // @0x8c898 movq _registry(%rip),%r12 — after the call_once this is non-null
  // on every path: the initializer installs it @0x8d89a and nothing clears it.
  const registry = _GLOBAL__N_1_registry.value;
  if (registry === null) {
    // Unreachable: reaching here would mean __call_once returned without the
    // initializer having stored the registry, which @0x8d89a always does.
    throw new Error(
      'HGPool::registerPool @Helium 0x8c850: (anonymous namespace)::_registry ' +
        '@Helium 0xadcf48 is NULL after the call_once @0x8c893 — the machine ' +
        'would lock address 0x18 and fault @0x8c8a6.',
    );
  }

  // @0x8c89f addq $0x18,%r12 ; @0x8c8a6 callq std::mutex::lock().
  std_mutex_lock(registry);

  // @0x8c8ab movq _registry(%rip),%r14 — reload the base pointer.
  const pools = registry.pools;
  // @0x8c8b2 movq 0x8(%r14),%r15  : end = __end_   (as an element count).
  const size = pools.length;
  // @0x8c8b6 movq 0x10(%r14),%rax : cap = __end_cap_.
  const capacity = registry.capacity;

  // @0x8c8ba cmpq %rax,%r15 ; @0x8c8bd jae 0x8c8ce — unsigned: grow when
  // end >= cap, take the fast path only when there is spare storage.
  if (size >= capacity) {
    // ---- growth path @0x8c8ce ----
    // @0x8c8d5/@0x8c8db — size in elements; the machine works in bytes and
    // shifts by 3, so every count below is written in the unit the
    // instruction uses.
    const newSize = size + 1;                                 // @0x8c8df
    // @0x8c8e7 shrq $0x3d ; jne — the 61-bit element-count overflow check.
    // BigInt because the quantity the machine tests is a full 64-bit word.
    if (BigInt(newSize) >> 61n) {
      vector_throw_length_error();
    }
    const maxSize = 0x1fffffffffffffffn;                      // @0x8c8f1
    const capBytes = BigInt(capacity) * 8n;                   // @0x8c8ff
    // @0x8c905 sarq $0x2 — capBytes >> 2 is (capBytes / 8) * 2, i.e. DOUBLE
    // the current capacity in elements.
    let newCap = capBytes >> 2n;
    // @0x8c909/@0x8c90c cmpq+cmovbe — flags on (newCap - newSize); cmovbe
    // takes CF|ZF, i.e. newCap <= newSize.
    if (newCap <= BigInt(newSize)) {
      newCap = BigInt(newSize);
    }
    // @0x8c91a/@0x8c91d cmpq+cmovae — flags on (capBytes - 0x7ffffffffffffff8);
    // cmovae takes !CF, i.e. capBytes >= that bound -> clamp to max_size.
    if (capBytes >= 0x7ffffffffffffff8n) {
      newCap = maxSize;
    }
    // @0x8c921/@0x8c924 cmpq+ja — strictly greater, unsigned.
    if (newCap > maxSize) {
      throw_bad_array_new_length();
    }
    // @0x8c92e leaq (,%rbx,8) ; @0x8c936 callq __Znwm — the new storage.
    std_operator_new(newCap * 8n);
    // @0x8c94b movq %rcx,(%rax,%r15) — the new element goes at the old size
    // offset in the NEW buffer; @0x8c96b memcpy copies the old elements below
    // it. In the model the array IS the buffer, so the copy is the identity
    // and this assignment is the store (it also advances length, which is the
    // __end_ update @0x8c973/@0x8c990).
    pools[size] = pool;
    // @0x8c97b movq %rax,0x10(%r14) — the new __end_cap_. Narrowed from the
    // BigInt the guards above used; every comparison was made before this
    // point, in exact 64-bit arithmetic.
    registry.capacity = Number(newCap);
    // @0x8c97f testq %r12,%r12 ; @0x8c987 callq __ZdlPv — free the OLD buffer,
    // only when there was one (a first insertion has __begin_ == null).
    std_operator_delete(size === 0 && capacity === 0 ? null : pools);
  } else {
    // ---- fast path @0x8c8bf ----
    // @0x8c8bf movq %r13,(%r15) : *end = pool.
    // @0x8c8c2 addq $0x8,%r15   : ++end  (the assignment does both).
    pools[size] = pool;
  }

  // @0x8c990 movq %rbx,0x8(%r14) — __end_ = end + 1, the join point of both
  // paths; the assignment above already moved `pools.length`.
  // @0x8c997 callq std::mutex::unlock() — a plain call here, not a tail jump.
  std_mutex_unlock(registry);
}

/**
 * `HGPool::unregisterPool(HGPool::BasePool*)` — @Helium 0x8c9d0
 * (__ZN6HGPool14unregisterPoolEPNS_8BasePoolE).
 *
 * Namespace-scope free function (no `this`): %rdi is the BasePool* argument,
 * moved to %r12 @0x8c9de and thereafter only ever COMPARED, never
 * dereferenced.
 *
 * Under `_registry->mutex`, remove the first entry of the registry's
 * `std::vector<BasePool*>` that is pointer-equal to `pool`; if there is no
 * such entry (or the vector is empty), change nothing. Unlock and return.
 * The full 46-line disassembly is quoted in the file header.
 *
 * FIRST-MATCH ONLY, deliberately: the scan @0x8ca10..@0x8ca1c breaks out on
 * the first equal element (`je 0x8ca20` @0x8ca13), and the erase removes
 * exactly one slot (`vec.__end_ = end - 8` @0x8ca39/@0x8ca3c). If the same
 * pool were registered twice, one copy would survive. We mirror that rather
 * than "cleaning it up" into a remove-all.
 *
 * NO BOUNDS/NULL DEFENSES ADDED: the machine's first act @0x8c9e1 is an
 * unguarded load of `_registry` followed by `addq $0x18` and a `mutex::lock`
 * on the result. With `_registry` still NULL (its BSS value — see above) that
 * locks address 0x18 and FAULTS. The TS port raises at exactly that point
 * instead of silently treating an uninitialized registry as empty — an
 * invented empty-registry fallback would be a behaviour the binary does not
 * have. In FCP the load is safe because `registerPool`'s call_once @0x8c893
 * has necessarily already run for any pool that can be unregistered, and in
 * this port `HGPool_registerPool` above does the same thing: it installs the
 * registry through the same once_flag, so the erase path is reachable.
 *
 * ORACLE: the erase path is covered by the same live differential as
 * registerPool — see its doc comment above; four erase steps (a duplicate, a
 * middle, the last, an absent pool and the first), 0 divergences.
 *
 * The raise below models THE MACHINE'S FAULT at @0x8c9ef, not a gap in this
 * port. It said "not yet transcribed" while registerPool was unported, which
 * was true then and is not true now; the wording changed with the fact.
 */
export function HGPool_unregisterPool(pool: HGPool_BasePool): void {
  // @0x8c9de movq %rdi,%r12 : r12 = pool (compared only, never dereferenced).
  // @0x8c9e1 movq _registry(%rip),%rbx : load the registry POINTER.
  const registry = _GLOBAL__N_1_registry.value;
  if (registry === null) {
    // @0x8c9e8 addq $0x18,%rbx ; @0x8c9ef callq mutex::lock on (NULL + 0x18).
    // The binary faults here; nothing downstream of this load is reachable.
    throw new Error(
      "HGPool::unregisterPool @Helium 0x8c9d0: (anonymous namespace)::_registry " +
        "@Helium 0xadcf48 is NULL (its BSS zero value) — the machine adds 0x18 " +
        "@0x8c9e8 and locks address 0x18 @0x8c9ef, which faults. Reaching this " +
        "means no pool was ever registered: HGPool::registerPool @Helium " +
        "0x8c850 installs the registry through its call_once @0x8c893, and in " +
        "FCP that has necessarily run before anything can be unregistered.",
    );
  }

  // @0x8c9e8 addq $0x18,%rbx : rbx = &registry->mutex.
  // @0x8c9ef callq std::mutex::lock() : enter the critical section.
  std_mutex_lock(registry);

  // @0x8c9f4 movq _registry(%rip),%r13 : reload the base pointer.
  // @0x8c9fb movq (%r13),%r14   : it  = pools.__begin_ (+0x00).
  // @0x8c9ff movq 0x8(%r13),%r15: end = pools.__end_   (+0x08).
  const pools = registry.pools;
  const end = pools.length;
  // `it` is the byte pointer %r14 expressed as an element index; the machine's
  // 8-byte stride @0x8ca15 is one array slot.
  let it = 0;
  // `found` distinguishes the two ways control reaches .maybe_erase (0x8ca20):
  // via `je` @0x8ca06 with an EMPTY vector (it == end -> erase skipped @0x8ca23)
  // or via `je` @0x8ca13 with a MATCH (it < end -> erase runs).
  let found = false;

  // @0x8ca03 cmpq %r15,%r14 ; @0x8ca06 je 0x8ca20 : empty vector skips the scan.
  if (it !== end) {
    // .scan @0x8ca10
    for (;;) {
      // @0x8ca10 cmpq %r12,(%r14) ; @0x8ca13 je 0x8ca20 : 8-byte pointer
      // identity compare against the argument.
      if (pools[it] === pool) {
        found = true;
        break;
      }
      // @0x8ca15 addq $0x8,%r14 : ++it.
      it++;
      // @0x8ca19 cmpq %r15,%r14 ; @0x8ca1c jne 0x8ca10 : keep scanning until end.
      if (it === end) {
        // @0x8ca1e jmp 0x8ca40 : not found — fall straight through to unlock.
        break;
      }
    }
  }

  // .maybe_erase @0x8ca20 — reached only from the two `je`s above.
  // @0x8ca20 cmpq %r15,%r14 ; @0x8ca23 je 0x8ca40 : `it == end` (the empty-vector
  // entry) erases nothing. A match always has it < end, so `found` is the
  // faithful predicate for "the erase block runs".
  if (found) {
    // @0x8ca25 leaq 0x8(%r14),%rsi : rsi = it + 1.
    // @0x8ca29 subq %rsi,%r15      : r15 = end - (it+1) = BYTES of tail to move.
    // @0x8ca2c je 0x8ca39          : zero when erasing the LAST element — the
    //                                memmove is skipped, only __end_ moves.
    // @0x8ca34 callq _memmove(it, it+1, r15) : shift the tail down over the hole.
    // @0x8ca39 addq %r15,%r14 ; @0x8ca3c movq %r14,0x8(%r13) :
    //                                pools.__end_ = end - 8 (size -= 1).
    // In the JS model the element array IS the vector buffer, so the tail move
    // and the __end_ store are the single splice below (which is a no-op move
    // plus a length decrement when it == end-1, exactly like the skipped
    // memmove path).
    pools.splice(it, 1);
  }

  // .unlock @0x8ca40: movq %rbx,%rdi ; @0x8ca51 jmp std::mutex::unlock()
  // (tail-jump — unlock IS the return).
  std_mutex_unlock(registry);
}
