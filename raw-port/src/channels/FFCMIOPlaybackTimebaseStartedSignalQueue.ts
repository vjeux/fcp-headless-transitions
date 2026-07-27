// FFCMIOPlaybackTimebaseStartedSignalQueue — Flexo lockless SPSC signal queue used
// by the CoreMediaIO playback pipeline to hand "timebase started" signals from the
// CMIO thread to Flexo's playback timeline.
//
// NOT a fresh class — the mangled symbol
// `__ZN40FFCMIOPlaybackTimebaseStartedSignalQueueD1Ev` demangles as
// `FFCMIOPlaybackTimebaseStartedSignalQueue::~FFCMIOPlaybackTimebaseStartedSignalQueue()`
// but the vtable at Flexo 0x19126c0 reveals the actual C++ type is
//   FFLocklessQueue<CMIOPlaybackTimebaseStartedSignal>
// and FFCMIOPlaybackTimebaseStartedSignalQueue is a typedef alias for that
// template instantiation. The class inherits (single-inheritance, primary base at
// offset 0) from FFLocklessQueueBase (typeinfo pin at vtable slot *0x48 =
// Flexo 0x1925858), and holds a std::atomic<ElementBase*> head at +0x20 (accessed
// via `leaq 0x20(%rbx), %r14` in both destructors — that lea produces the address
// passed to FFLocklessQueueBase::popAtomic which is typed as
// `std::__1::atomic<FFLocklessQueueBase::ElementBase*>&`).
//
// Faithful transcription of exactly two exported symbols — the Itanium C++ ABI
// destructor pair D1 (complete-object) at Flexo 0xd2fa80 and D0 (deleting) at
// Flexo 0xd2fb00. Both bodies are identical drain-then-chain loops; D0 differs
// from D1 only by a trailing `operator delete` (tail-called via the `symbol stub
// for: __ZdlPv` @0x1497404 that the D0 epilogue jumps to @0xd2fb72).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFCMIOPlaybackTimebaseStartedSignalQueue.~FFCMIOPlaybackTimebaseStartedSignalQueue.s
// Framework: Final Cut Pro / Flexo.framework
//
// DECODE — struct layout (recovered from the dtor accesses only):
//   +0x00  void*    vptr        // C++ vtable pointer. Rewritten by both dtors at
//                                // the top of the body via `movq %rax, (%rdi)` —
//                                // D1 @0xd2fa94 and D0 @0xd2fb14 — where %rax is
//                                // the RIP-relative load `leaq 0xbe2c9c(%rip),%rax`
//                                // (D1 @0xd2fa8d, target
//                                //  = 0xd2fa94 + 0xbe2c9c = 0x1912730) resp.
//                                // `leaq 0xbe2c1c(%rip),%rax` (D0 @0xd2fb0d,
//                                //  target = 0xd2fb14 + 0xbe2c1c = 0x1912730).
//                                // 0x1912730 is the primary-vtable body at
//                                // installed-ptr 0x19126d0 + 0x60 (the standard
//                                // Itanium-ABI "in-destruction" vptr).
//   [+0x00..+0x20]  FFLocklessQueueBase sub-object at offset 0 (confirmed by the
//                                // `callq __ZN19FFLocklessQueueBaseD2Ev` at D1
//                                // @0xd2faea receiving `%rbx` = this unchanged).
//   +0x20  std::atomic<ElementBase*> head  // materialised by both dtors via
//                                // `leaq 0x20(%rbx), %r14` — D1 @0xd2fa9c
//                                // and D0 @0xd2fb1c — passed as `%rdi` to
//                                // FFLocklessQueueBase::popAtomic whose mangled
//                                // name pins its type as `std::atomic<
//                                // FFLocklessQueueBase::ElementBase*>&`.
//
// Frontier callees (all become throwing stubs):
//   FFLocklessQueueBase::clear()                                @Flexo call D1 0xd2fa97 / D0 0xd2fb17
//   FFLocklessQueueBase::popAtomic(atomic<ElementBase*>&)       @Flexo calls D1 0xd2faa3 & 0xd2fabc / D0 0xd2fb23 & 0xd2fb3c
//   FFLocklessQueueBase::freeElement(ElementBase*)              @Flexo call D1 0xd2fad6 / D0 0xd2fb56
//   FFLocklessQueueBase::~FFLocklessQueueBase() [D2]            @Flexo tail-jmp D1 0xd2faea / callq D0 0xd2fb60
//   ElementBase virtual @ vtable slot *0x08                     @Flexo indirect D1 0xd2fab6 / D0 0xd2fb36
//   `_ZdlPv` (operator delete(void*)) via symbol stub 0x1497404 @Flexo tail-jmp D0 0xd2fb72
//   `__clang_call_terminate` — noexcept landing pads D1 0xd2faef & 0xd2fafa,
//                                                    D0 0xd2fb7a & 0xd2fb82 (no TS mirror needed).
//
// Vtable identity (raw-port/army/tools/resolve.py vtable FFCMIOPlaybackTimebaseStartedSignalQueue):
//   vtable @Flexo 0x19126c0, installed-ptr 0x19126d0. Own slots:
//     *0x00 -> 0xd2fa80  D1 dtor (this file)
//     *0x08 -> 0xd2fb00  D0 dtor (this file)
//     *0x10 -> 0x378eb0  FFLocklessQueueBase::compare(...) const (base override — not on this slice)
//     *0x18 -> 0x12b9f50 FFLocklessQueueBase::performMigration(...) (base override — not on this slice)
//     *0x28 -> 0x157e6e0 typeinfo name
//     *0x30 -> 0x1912708 typeinfo for FFLocklessQueue<CMIOPlaybackTimebaseStartedSignal>
//     *0x48 -> 0x1925858 typeinfo for FFLocklessQueueBase (base pin)

/**
 * Opaque queue element. In C++ this is `FFLocklessQueueBase::ElementBase` — a
 * base class with a virtual at vtable slot +0x08 that both dtors invoke via
 * `callq *0x8(%rax)` where `%rax = *element` (the element's own vptr).
 */
export type FFLocklessQueueBase_ElementBase = {
  /** vtable pointer — read via `movq (%r15),%rax` @D1 0xd2fab0 / D0 0xd2fb30. */
  _vptr: unknown;
  /**
   * Byte at +0x10 gating the drain branch. Read via `cmpb $0x1,0x10(%r15)`
   * @D1 0xd2fac9 / D0 0xd2fb49. Semantic name lives on the base class, not
   * decoded on this slice.
   */
  _flagAt0x10: number;
};

/**
 * `FFLocklessQueueBase::clear()` — frontier callee. Called once at the top of
 * both dtors (D1 @0xd2fa97 / D0 @0xd2fb17) after installing the in-destruction
 * vptr and before beginning the drain loop.
 */
function FFLocklessQueueBase_clear(_this: FFLocklessQueueBase): void {
  throw new Error(
    "FFCMIOPlaybackTimebaseStartedSignalQueue: FFLocklessQueueBase::clear() " +
      "not yet transcribed @Flexo call site D1 0xd2fa97 / D0 0xd2fb17"
  );
}

/**
 * `FFLocklessQueueBase::popAtomic(std::atomic<ElementBase*>&)` — frontier
 * callee. Called with `&this->head` (offset +0x20) and returns either the
 * popped element or nullptr when the queue is empty. Its return value drives
 * the drain loop guard `testq %r15,%r15; je …exit`. D1 calls @0xd2faa3 &
 * @0xd2fabc; D0 mirrors @0xd2fb23 & @0xd2fb3c.
 */
function FFLocklessQueueBase_popAtomic(
  _head: { value: FFLocklessQueueBase_ElementBase | null }
): FFLocklessQueueBase_ElementBase | null {
  throw new Error(
    "FFCMIOPlaybackTimebaseStartedSignalQueue: FFLocklessQueueBase::popAtomic" +
      "(std::atomic<ElementBase*>&) not yet transcribed @Flexo call sites " +
      "D1 0xd2faa3 & 0xd2fabc / D0 0xd2fb23 & 0xd2fb3c"
  );
}

/**
 * `FFLocklessQueueBase::freeElement(ElementBase*)` — frontier callee. Called
 * for every popped element whose `_flagAt0x10 == 1`. D1 @0xd2fad6 /
 * D0 @0xd2fb56.
 */
function FFLocklessQueueBase_freeElement(
  _this: FFLocklessQueueBase,
  _elt: FFLocklessQueueBase_ElementBase
): void {
  throw new Error(
    "FFCMIOPlaybackTimebaseStartedSignalQueue: FFLocklessQueueBase::freeElement" +
      "(ElementBase*) not yet transcribed @Flexo call site D1 0xd2fad6 / D0 0xd2fb56"
  );
}

/**
 * Virtual at ElementBase's vtable slot +0x08, invoked via
 * `callq *0x8(%rax)` where `%rax = *element`. Fires unconditionally on every
 * iteration of the drain loop. D1 @0xd2fab6 / D0 @0xd2fb36.
 */
function FFLocklessQueueBase_ElementBase_vtable_slot_0x08(
  _elt: FFLocklessQueueBase_ElementBase
): void {
  throw new Error(
    "FFCMIOPlaybackTimebaseStartedSignalQueue: virtual ElementBase::vtable[*0x08]" +
      " not yet transcribed @Flexo indirect-call site D1 0xd2fab6 / D0 0xd2fb36"
  );
}

/**
 * `FFLocklessQueueBase::~FFLocklessQueueBase()` [D2 base-object dtor] —
 * frontier callee. D1 tail-`jmp` @0xd2faea (D1 has no cleanup after the base);
 * D0 `callq` @0xd2fb60 (D0 still has to `operator delete` afterwards so the
 * base call is not tail-called).
 */
function FFLocklessQueueBase_D2_dtor(_this: FFLocklessQueueBase): void {
  throw new Error(
    "FFCMIOPlaybackTimebaseStartedSignalQueue: FFLocklessQueueBase::" +
      "~FFLocklessQueueBase() [D2] not yet transcribed " +
      "@Flexo tail-call D1 0xd2faea / callq D0 0xd2fb60"
  );
}

/**
 * `operator delete(void*)` — the C++ global deallocation function reached
 * through the symbol stub `__ZdlPv` @Flexo 0x1497404 that D0 tail-jmps to at
 * @0xd2fb72. Standard C++ runtime; no per-class body.
 */
function cxx_operator_delete(_this: FFLocklessQueueBase): void {
  throw new Error(
    "FFCMIOPlaybackTimebaseStartedSignalQueue: operator delete(void*) not " +
      "modelled in the raw-port runtime @Flexo tail-jmp D0 0xd2fb72 (stub 0x1497404)"
  );
}

/**
 * In-destruction vptr citation. Both dtors overwrite the object's vptr at +0x00
 * with the sub-vtable body of FFLocklessQueue<CMIOPlaybackTimebaseStartedSignal>
 * at Flexo 0x1912730 (installed-ptr 0x19126d0 + 0x60).
 */
const IN_DESTRUCTION_VPTR_CITATION =
  "Flexo 0x1912730 (FFLocklessQueue<CMIOPlaybackTimebaseStartedSignal> " +
  "sub-vtable body @ vtable(0x19126c0) + 0x60)";

/**
 * `FFLocklessQueueBase` — the primary base. Structural type carrying only the
 * fields on this class's decoded surface (vptr and atomic head).
 */
export type FFLocklessQueueBase = {
  _vptr: unknown;
  _head_atOffset_0x20: { value: FFLocklessQueueBase_ElementBase | null };
};

/**
 * The class instance. Polymorphic (own vptr at +0x00), inherits primary-base
 * FFLocklessQueueBase at offset 0.
 */
export class FFCMIOPlaybackTimebaseStartedSignalQueue implements FFLocklessQueueBase {
  /** +0x00 vptr — written by both dtors to IN_DESTRUCTION_VPTR_CITATION. */
  _vptr: unknown = null;

  /**
   * +0x20 std::atomic<FFLocklessQueueBase::ElementBase*> head. Boxed so that
   * its address can be passed to popAtomic — mirroring `leaq 0x20(%rbx),%r14`.
   */
  _head_atOffset_0x20: { value: FFLocklessQueueBase_ElementBase | null } = { value: null };

  /**
   * `FFCMIOPlaybackTimebaseStartedSignalQueue::~FFCMIOPlaybackTimebaseStartedSignalQueue()`
   * — the Itanium C++ ABI D1 (complete-object) destructor.
   * Mangled `__ZN40FFCMIOPlaybackTimebaseStartedSignalQueueD1Ev` @Flexo 0xd2fa80.
   *
   * Control flow (each block cites its @0xADDR):
   *   @0xd2fa80..0xd2fa8a  prologue: `pushq %rbp; movq %rsp,%rbp; pushq %r15/%r14/%rbx/%rax; movq %rdi,%rbx`.
   *   @0xd2fa8d..0xd2fa94  install in-destruction vptr = Flexo 0x1912730 into +0x00.
   *   @0xd2fa97            callq FFLocklessQueueBase::clear().
   *   @0xd2fa9c..0xd2faa8  `&this->head` into %r14; first popAtomic; %r15 := rax.
   *   @0xd2faab            jmp 0xd2fac4 (loop-entry guard).
   *   @0xd2fab0..0xd2fac1  LOOP BODY: `movq (%r15),%rax` (load elt->vptr);
   *                        `movq %r15,%rdi; callq *0x8(%rax)` (elt->vtable[*0x08]);
   *                        `movq %r14,%rdi; callq popAtomic; movq %rax,%r15`.
   *   @0xd2fac4..0xd2fac7  LOOP GUARD: `testq %r15,%r15; je 0xd2fadd` (exit).
   *   @0xd2fac9..0xd2face  `cmpb $0x1,0x10(%r15); jne 0xd2fab0` (skip freeElement branch;
   *                        loop back to body top with same elt).
   *   @0xd2fad0..0xd2fadb  FALL-THROUGH (flag == 1): `callq freeElement(this, elt)`;
   *                        `jmp 0xd2fab0` — re-enter loop body with same elt.
   *   @0xd2fadd..0xd2faea  EXIT: `movq %rbx,%rdi`; epilogue; tail-`jmp`
   *                        FFLocklessQueueBase::~FFLocklessQueueBase() [D2].
   *
   * Note on the flag==1 branch: the asm re-enters the loop body top (0xd2fab0)
   * after freeElement, which re-loads `elt->vptr` and re-invokes vtable[*0x08]
   * on the just-freed pointer. Whether the base's freeElement leaves the vptr
   * callable (e.g. onto a lock-free freelist without touching header bytes) is
   * a base-class invariant we do not attempt to verify from this slice — we
   * transcribe the CFG exactly.
   */
  destroy_D1_completeObjectDtor(): void {
    // @0xd2fa8d..0xd2fa94 — install in-destruction vptr.
    this._vptr = IN_DESTRUCTION_VPTR_CITATION;

    // @0xd2fa97 — clear().
    FFLocklessQueueBase_clear(this);

    // @0xd2fa9c..0xd2faa8 — %r14 := &this->head; %r15 := popAtomic(&head).
    const head = this._head_atOffset_0x20;
    let elt: FFLocklessQueueBase_ElementBase | null =
      FFLocklessQueueBase_popAtomic(head);

    // Drain CFG:
    //   loop_top:  (0xd2fab0) invoke elt->vtable[*0x08]; pop next; %r15 := next.
    //   guard:     (0xd2fac4) if next == null goto exit.
    //   flagcheck: (0xd2fac9) if next._flagAt0x10 != 1 goto loop_top with next.
    //   freecase:  (0xd2fad0) freeElement(this,next); goto loop_top with next.
    //
    // We enter the CFG at the guard (0xd2fab -> 0xd2fac4). Model as a
    // classic while-loop that at every iteration:
    //   (a) tests the guard,
    //   (b) if flag == 1 calls freeElement,
    //   (c) invokes elt->vtable[*0x08],
    //   (d) pops the next elt for the following iteration.
    while (elt !== null) {
      // @0xd2fac9..0xd2fadb — flag==1 freeElement branch. jne skips it.
      if (elt._flagAt0x10 === 1) {
        FFLocklessQueueBase_freeElement(this, elt);
      }
      // @0xd2fab0..0xd2fab6 — elt->vtable[*0x08]().
      FFLocklessQueueBase_ElementBase_vtable_slot_0x08(elt);
      // @0xd2fab9..0xd2fac1 — elt := popAtomic(&head).
      elt = FFLocklessQueueBase_popAtomic(head);
      // @0xd2fac4..0xd2fac7 — loop guard folded into the while-condition.
    }

    // @0xd2fadd..0xd2faea — tail-jmp base D2 dtor.
    FFLocklessQueueBase_D2_dtor(this);
  }

  /**
   * `FFCMIOPlaybackTimebaseStartedSignalQueue::~FFCMIOPlaybackTimebaseStartedSignalQueue()`
   * — the Itanium C++ ABI D0 (deleting) destructor.
   * Mangled `__ZN40FFCMIOPlaybackTimebaseStartedSignalQueueD0Ev` @Flexo 0xd2fb00.
   *
   * Body is identical to D1 through the base D2 call, then adds a tail-jmp
   * to `operator delete(void*)` via the symbol stub `__ZdlPv` @Flexo 0x1497404.
   *
   * Address-by-address (verified against the D0 disasm at
   * raw-port/re/disasm/Flexo.FFCMIOPlaybackTimebaseStartedSignalQueue.~FFCMIOPlaybackTimebaseStartedSignalQueue.s):
   *   @0xd2fb00..0xd2fb0a  prologue (same shape as D1).
   *   @0xd2fb0d..0xd2fb14  install in-destruction vptr = Flexo 0x1912730.
   *   @0xd2fb17            callq FFLocklessQueueBase::clear().
   *   @0xd2fb1c..0xd2fb28  `&head` into %r14; first popAtomic; %r15 := rax.
   *   @0xd2fb2b            jmp 0xd2fb44 (guard).
   *   @0xd2fb30..0xd2fb41  LOOP BODY (identical to D1's, shifted addresses).
   *   @0xd2fb44..0xd2fb4e  LOOP GUARD.
   *   @0xd2fb50..0xd2fb5b  FREE-ELEMENT BRANCH.
   *   @0xd2fb5d..0xd2fb60  EXIT: `callq` (NOT tail-jmp) base D2 dtor.
   *   @0xd2fb65..0xd2fb72  `movq %rbx,%rdi`; epilogue; tail-`jmp` symbol stub
   *                        `__ZdlPv` @0x1497404 = operator delete(void*).
   */
  destroy_D0_deletingDtor(): void {
    // Delta from D1: D1 tail-`jmp`s the base D2 (nothing after it). D0 `callq`s
    // the same D2 and THEN tail-`jmp`s to operator delete. Semantically D0's
    // drain-plus-D2 body is identical to D1's, so we reuse D1's method and
    // then perform the extra `operator delete`.
    this.destroy_D1_completeObjectDtor();

    // @0xd2fb72 — tail-jmp `__ZdlPv` (operator delete(void*)) via stub 0x1497404.
    cxx_operator_delete(this);
  }
}
