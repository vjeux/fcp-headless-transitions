// FFCMIOPlaybackTimestampQueue — Flexo class: a concrete queue of CMIO playback
// timestamps that derives from FFLocklessQueueBase. It carries no additional
// decoded fields of its own — the two decoded methods are its two destructor
// symbols (Itanium ABI D1 / D0), whose bodies do:
//
//   1. reinstall the FFCMIOPlaybackTimestampQueue-typed vtable at (this+0x00)
//      (needed by the C++ dtor contract so that any virtual calls made during
//      base-class teardown resolve against the most-derived type still being
//      destroyed — here that most-derived type is FFCMIOPlaybackTimestampQueue),
//   2. call FFLocklessQueueBase::clear() on this,
//   3. drain the queue anchor at (this+0x20) via FFLocklessQueueBase::popAtomic()
//      until it returns nullptr; for each popped element, if the byte at
//      element+0x10 is 1 free it via FFLocklessQueueBase::freeElement(this, elem),
//      otherwise call its vtable slot +0x8 destructor,
//   4. run the FFLocklessQueueBase base-object destructor (D2),
//   5. only in D0 (the deleting dtor variant) additionally call operator delete
//      on `this` (`__ZdlPv`).
//
// The class exposes NO other methods in Flexo's symbol table — no ctor, no push,
// no pop overrides — so the only observable surface here IS the destructor pair.
// The push/pop/free/clear plumbing lives on FFLocklessQueueBase, which is not
// itself ported yet; we import a stub interface for it and defer to that.
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFCMIOPlaybackTimestampQueue.~FFCMIOPlaybackTimestampQueue.s
//     ├── __ZN28FFCMIOPlaybackTimestampQueueD1Ev  @0x0000000000d2fd90  (complete-object dtor / base dtor D2 alias)
//     └── __ZN28FFCMIOPlaybackTimestampQueueD0Ev  @0x0000000000d2fe10  (deleting dtor variant)
//
// DECODE — struct layout (recovered from the dtor accesses):
//   +0x00  void*  vptr        // C++ vtable pointer. Rewritten at the top of both
//                             // dtors via  leaq 0xbe2b04(%rip), %rax ; movq %rax, (%rdi)
//                             // (D1 @0xd2fd9d/@0xd2fda4) and  leaq 0xbe2a84(%rip), %rax
//                             // ; movq %rax, (%rdi)  (D0 @0xd2fe1d/@0xd2fe24). Different
//                             // RIP-relative displacements land on the SAME vtable object
//                             // (D0 is 0x80 further into the file than D1 and its constant
//                             // is exactly 0x80 smaller — 0xbe2b04 - 0xbe2a84 = 0x80 =
//                             // 0xd2fe1d - 0xd2fd9d). This is the standard "reinstall the
//                             // vtable of the class currently being destroyed" step of
//                             // the Itanium C++ ABI.
//   +0x08  …  the remainder of the FFLocklessQueueBase base subobject. Field
//                             // offsets 0x08..0x1f are set by FFLocklessQueueBase's ctor
//                             // and are not touched by *this* class's dtor.
//   +0x20  std::atomic<FFLocklessQueueBase::ElementBase*>  queueHead
//                             // The pop-anchor. Passed by-reference (as `this+0x20`) to
//                             // FFLocklessQueueBase::popAtomic — see the  leaq 0x20(%rbx), %r14
//                             // in both dtors (@0xd2fdac / @0xd2fe2c) and the subsequent
//                             // popAtomic call (@0xd2fdb3 / @0xd2fe33).
// The dtors touch NO other offsets, so FFCMIOPlaybackTimestampQueue adds no
// data-members of its own beyond the FFLocklessQueueBase subobject; it is a
// pure specialization by identity + vtable.
//
// ElementBase (drained inside the loop) layout — recovered from the loop body:
//   +0x00  void*  vptr       // read as  movq (%r15), %rax  @0xd2fdc0 / @0xd2fe40, then
//                            // called via  callq *0x8(%rax)  @0xd2fdc6 / @0xd2fe46
//                            // — i.e. vtable slot +0x8 is the element's own destroy hook.
//   +0x10  uint8_t ownedByPool // read as  cmpb $0x1, 0x10(%r15) @0xd2fdd9 / @0xd2fe59.
//                            // ==1 -> freeElement path (pool-owned, returns to pool);
//                            // !=1 -> destroy via vtable slot +0x8 (caller-owned lifetime).
// (This ElementBase layout is *observed here* but is a property of
// FFLocklessQueueBase, not of this class; a full FFLocklessQueueBase port must
// preserve it.)
//
// Framework: Final Cut Pro / Flexo.framework  (/Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo)

// -----------------------------------------------------------------------------
// Frontier callees (not yet ported — modeled below; each is called from the
// FFCMIOPlaybackTimestampQueue dtor pair @0xd2fd90 (D1) / @0xd2fe10 (D0)).
// Every stub cites the exact @0xADDR of the call site plus the exact mangled
// Flexo symbol it stands in for, per PORTING_SPEC decode-before-implement.
// -----------------------------------------------------------------------------

/**
 * FFLocklessQueueBase::ElementBase — the queue element base. Opaque here: its
 * layout is only partially observed (vptr @+0x00, ownedByPool byte @+0x10) and
 * the rest belongs to FFLocklessQueueBase, which has not been ported. We model
 * it as an object with the two fields we DO see in this class's disasm, plus an
 * opaque tail.
 */
export interface FFLocklessQueueBase_ElementBase {
  /** +0x00 vptr — its own C++ vtable. Slot +0x8 is the element's destroy hook.
   *  Observed at @0xd2fdc0 / @0xd2fe40  (movq (%r15), %rax) and
   *              @0xd2fdc6 / @0xd2fe46  (callq *0x8(%rax)). */
  readonly vptr: {
    /** vtable slot +0x8 — the element-specific destroy hook.
     *  Called with %rdi = element (i.e. `this`) — a virtual dtor-like call. */
    slot_0x8_destroy(this_: FFLocklessQueueBase_ElementBase): void;
  };
  /** +0x10 uint8_t ownedByPool — 1 => free via FFLocklessQueueBase::freeElement,
   *  0/other => destroy via vptr slot +0x8. Observed at cmpb $0x1, 0x10(%r15)
   *  @0xd2fdd9 / @0xd2fe59. */
  readonly ownedByPool: number;
}

/**
 * FFLocklessQueueBase — base class providing the pop/push/free/clear plumbing.
 * NOT PORTED YET. We reference it via a minimal opaque interface with only the
 * three method surfaces this file's disassembly actually calls:
 *   - clear()                                         @callq @0xd2fda7 / @0xd2fe27
 *   - popAtomic(&queueHead) -> ElementBase* | null    @callq @0xd2fdb3 / @0xd2fe33
 *                                                     @callq @0xd2fdcc / @0xd2fe4c
 *   - freeElement(elem)                               @callq @0xd2fde6 / @0xd2fe66
 *   - ~FFLocklessQueueBase (D2 base-object dtor)      @jmp   @0xd2fdfa
 *                                                     @callq @0xd2fe70
 * The full class port belongs in a future FFLocklessQueueBase.ts file; here we
 * just declare the surface we call into.
 */
export interface FFLocklessQueueBase {
  /** the queueHead anchor — layout position +0x20 in the derived object. Its
   *  address (not value) is passed by-reference to popAtomic. */
  queueHead: FFLocklessQueueBase_ElementBase | null;
  /** __ZN19FFLocklessQueueBase5clearEv */
  clear(): void;
  /** __ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE */
  popAtomic(headRef: { get(): FFLocklessQueueBase_ElementBase | null; set(v: FFLocklessQueueBase_ElementBase | null): void }): FFLocklessQueueBase_ElementBase | null;
  /** __ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE */
  freeElement(elem: FFLocklessQueueBase_ElementBase): void;
  /** __ZN19FFLocklessQueueBaseD2Ev — base-object destructor. */
  __dtor_D2(): void;
}

/**
 * Throwing stubs modeling the un-ported FFLocklessQueueBase methods this class
 * calls. Kept as free functions rather than a class stub so that the moment
 * FFLocklessQueueBase.ts lands and provides real implementations, callers can
 * swap them out one-for-one (the arguments/return match the C++ signatures).
 *
 * Each stub deliberately throws — a THROWing stub citing its @0xADDR is the
 * correct decode-before-implement placeholder per PORTING_SPEC, and doubles as
 * the demand signal for FFLocklessQueueBase's future port.
 */
function FFLocklessQueueBase_clear(_this: FFLocklessQueueBase): void {
  // callq __ZN19FFLocklessQueueBase5clearEv  @0xd2fda7 (D1) / @0xd2fe27 (D0)
  throw new Error(
    "FFLocklessQueueBase::clear() not yet ported (Flexo __ZN19FFLocklessQueueBase5clearEv; called from FFCMIOPlaybackTimestampQueue dtor @0xd2fda7 / @0xd2fe27)"
  );
}

function FFLocklessQueueBase_popAtomic(
  _this: FFLocklessQueueBase,
  _headRef: { get(): FFLocklessQueueBase_ElementBase | null; set(v: FFLocklessQueueBase_ElementBase | null): void }
): FFLocklessQueueBase_ElementBase | null {
  // callq __ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE
  //   @0xd2fdb3 (D1 first pop) / @0xd2fdcc (D1 loop pop)
  //   @0xd2fe33 (D0 first pop) / @0xd2fe4c (D0 loop pop)
  throw new Error(
    "FFLocklessQueueBase::popAtomic() not yet ported (Flexo __ZN19FFLocklessQueueBase9popAtomicERNSt3__16atomicIPNS_11ElementBaseEEE; called from FFCMIOPlaybackTimestampQueue dtor @0xd2fdb3 / @0xd2fdcc / @0xd2fe33 / @0xd2fe4c)"
  );
}

function FFLocklessQueueBase_freeElement(
  _this: FFLocklessQueueBase,
  _elem: FFLocklessQueueBase_ElementBase
): void {
  // callq __ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE
  //   @0xd2fde6 (D1) / @0xd2fe66 (D0)
  throw new Error(
    "FFLocklessQueueBase::freeElement() not yet ported (Flexo __ZN19FFLocklessQueueBase11freeElementEPNS_11ElementBaseE; called from FFCMIOPlaybackTimestampQueue dtor @0xd2fde6 / @0xd2fe66)"
  );
}

function FFLocklessQueueBase_dtor_D2(_this: FFLocklessQueueBase): void {
  // D1: jmp  __ZN19FFLocklessQueueBaseD2Ev  @0xd2fdfa  (tail-jump, no return)
  // D0: callq __ZN19FFLocklessQueueBaseD2Ev @0xd2fe70  (then falls through to __ZdlPv)
  throw new Error(
    "FFLocklessQueueBase::~FFLocklessQueueBase() (D2 base-object dtor) not yet ported (Flexo __ZN19FFLocklessQueueBaseD2Ev; called from FFCMIOPlaybackTimestampQueue dtor @0xd2fdfa / @0xd2fe70)"
  );
}

/**
 * C++ `operator delete(void*)` — the platform allocator's freeing counterpart.
 * D0 tail-jumps to it via  jmp 0x1497404 (`symbol stub for: __ZdlPv`) @0xd2fe82.
 * Not ported (it's a libc++ / system runtime hook, out of scope for the FCP
 * class transcription). A throwing stub keeps the call site honest.
 */
function operator_delete(_p: FFCMIOPlaybackTimestampQueue): void {
  // jmpq 0x1497404 (symbol stub for __ZdlPv)  @0xd2fe82
  throw new Error(
    "operator delete (__ZdlPv) not modeled in the TS port; JS/TS objects are GC'd. Cited call site: FFCMIOPlaybackTimestampQueue::~FFCMIOPlaybackTimestampQueue() D0 @0xd2fe82"
  );
}

// -----------------------------------------------------------------------------
// The class itself.
// -----------------------------------------------------------------------------

/**
 * The vtable of FFCMIOPlaybackTimestampQueue. In the on-disk Flexo image it is
 * the C++ vtable object at Flexo image offset (0xd2fd9d + 7) + 0xbe2b04 =
 * 0x191290C (relative to __TEXT segment; the exact section is __DATA_CONST /
 * __const per usual Itanium ABI layout).  We do NOT dispatch through it in the
 * TS port — we call typed methods on the concrete object instead — but we
 * declare the identity so the dtor's vptr-reinstall step has a truthful target
 * (that step, in C++, exists specifically to route any virtual call made
 * *during base-class teardown* to the most-derived type still being destroyed;
 * in TS the equivalent is that `this.constructor === FFCMIOPlaybackTimestampQueue`
 * remains true throughout the dtor body — no explicit action needed).
 */
const FFCMIOPlaybackTimestampQueue_vtable = Object.freeze({
  /** Image-relative address of the vtable object, recovered as
   *  0xd2fda4 (RIP after the leaq's disp32) + 0xbe2b04 = 0x191E8A8.
   *  The D0 variant loads the same vtable via a differently-based RIP-relative
   *  displacement — 0xd2fe24 + 0xbe2a84 = 0x191E8A8 — same object. */
  __imageOffset: 0x191e8a8,
});

/**
 * FFCMIOPlaybackTimestampQueue — Flexo lockless queue specialized for CMIO
 * playback timestamps. Concrete class deriving from FFLocklessQueueBase. Only
 * its two destructor symbols are exported by Flexo; there is no ctor, push, or
 * pop of its own — those all live on the base.
 *
 * We model inheritance by *composition* against the un-ported base interface
 * (rather than `extends FFLocklessQueueBase`) because the base has not itself
 * been ported yet; once it lands the composition can be flattened into a real
 * subclass without changing this file's decoded semantics.
 */
export class FFCMIOPlaybackTimestampQueue {
  /** +0x00 vptr — see the class-header comment for the reinstall protocol. */
  readonly vptr = FFCMIOPlaybackTimestampQueue_vtable;

  /** +0x08..+0x1f — the FFLocklessQueueBase subobject. Modeled here as a
   *  reference to the un-ported base interface. Every method on the base that
   *  this class's dtor calls (clear / popAtomic / freeElement / ~D2) is routed
   *  through the free-function stubs above, which name the exact @addr they
   *  will replace once FFLocklessQueueBase.ts lands. */
  readonly base: FFLocklessQueueBase;

  /** +0x20 queueHead — the atomic pop-anchor. Held here as a bare slot; the
   *  atomic-ness is a property of FFLocklessQueueBase's operations, not of this
   *  field's declaration site. Passed by-reference (address-of) to popAtomic. */
  queueHead: FFLocklessQueueBase_ElementBase | null = null;

  constructor(base: FFLocklessQueueBase) {
    // No ctor is present in Flexo's exported symbols for this class, so the
    // TS-side constructor merely wires the base subobject reference — no
    // decoded body to transcribe. The Flexo image constructs instances via
    // FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption) plus
    // the compiler-synthesized derived-class ctor whose body is a plain
    // vtable-install (no user code).
    this.base = base;
  }

  /**
   * ~FFCMIOPlaybackTimestampQueue — Itanium ABI D1 (complete-object destructor).
   * Faithful transcription of __ZN28FFCMIOPlaybackTimestampQueueD1Ev @0xd2fd90.
   *
   * Body, byte-for-byte:
   *   @0xd2fd9d/@0xd2fda4  leaq 0xbe2b04(%rip),%rax ; movq %rax,(%rdi)
   *                        — reinstall this-class vtable at (this+0x00).
   *   @0xd2fda7            callq FFLocklessQueueBase::clear()
   *   @0xd2fdac            leaq 0x20(%rbx),%r14
   *                        — %r14 = &this->queueHead (used both as the
   *                        popAtomic byref arg and, indirectly, as loop state
   *                        via successive popAtomic calls).
   *   @0xd2fdb0/@0xd2fdb3  movq %r14,%rdi ; callq FFLocklessQueueBase::popAtomic
   *   @0xd2fdb8            movq %rax,%r15                — %r15 = popped element.
   *   @0xd2fdbb            jmp 0xd2fdd4                  — into the null-test.
   *   @0xd2fdc0            movq (%r15),%rax              — load element->vptr.
   *   @0xd2fdc3/@0xd2fdc6  movq %r15,%rdi ; callq *0x8(%rax)
   *                        — indirect virtual call: element vtable slot +0x8.
   *   @0xd2fdc9/@0xd2fdcc  movq %r14,%rdi ; callq FFLocklessQueueBase::popAtomic
   *   @0xd2fdd1            movq %rax,%r15                — next popped element.
   *   @0xd2fdd4            testq %r15,%r15 ; je 0xd2fded — null => exit loop.
   *   @0xd2fdd9            cmpb $0x1,0x10(%r15)
   *   @0xd2fdde            jne 0xd2fdc0                  — !=1 => vtable-destroy branch.
   *   @0xd2fde0/@0xd2fde3  movq %rbx,%rdi ; movq %r15,%rsi
   *   @0xd2fde6            callq FFLocklessQueueBase::freeElement(this, elem)
   *   @0xd2fdeb            jmp 0xd2fdc0                  — back to next-pop.
   *   @0xd2fded            movq %rbx,%rdi
   *   @0xd2fdfa            jmp __ZN19FFLocklessQueueBaseD2Ev  — tail-jump.
   *
   * The tail `jmp` (not `call`) means D1 is functionally D1 == D2-plus-drain:
   * its own body runs, then control transfers to the base D2 as if this call
   * frame had never existed. In TS we sequence it as a normal call at the end.
   *
   * Landing pad @0xd2fdff / @0xd2fe07 — both go into ___clang_call_terminate
   * (noexcept dtor contract; any escaping exception aborts). Not modeled in TS
   * (JS exceptions unwind normally; the C++ semantic here is "must not throw",
   * which is the same as our default).
   */
  __dtor_D1(): void {
    // Step 1: reinstall vptr — no-op in TS (see class-header note); the
    // equivalent invariant is that `this.vptr === FFCMIOPlaybackTimestampQueue_vtable`
    // throughout the body, which is intrinsic here since we don't mutate it.
    // (The Flexo asm still writes it because C++ base-class ctor/dtor chains
    // mutate `*this[0]` — a concern that has no counterpart in TS's fixed
    // dynamic dispatch model.)

    // Step 2: FFLocklessQueueBase::clear() on `this`.  @0xd2fda7
    FFLocklessQueueBase_clear(this.base);

    // Step 3: drain the queue at &this->queueHead.  Loop shape mirrors the asm:
    //   pop; if null -> exit; if elem.ownedByPool==1 -> freeElement, else
    //   invoke elem.vptr slot +0x8; repeat.
    const headRef = {
      get: (): FFLocklessQueueBase_ElementBase | null => this.queueHead,
      set: (v: FFLocklessQueueBase_ElementBase | null): void => {
        this.queueHead = v;
      },
    };
    // @0xd2fdb3 — first pop before entering the loop body via jmp @0xd2fdbb.
    let elem: FFLocklessQueueBase_ElementBase | null = FFLocklessQueueBase_popAtomic(this.base, headRef);
    // @0xd2fdd4 — top-of-loop null-test.
    while (elem !== null) {
      // @0xd2fdd9 — cmpb $0x1, 0x10(%r15).  ==1 => freeElement branch.
      if (elem.ownedByPool === 1) {
        // @0xd2fde6 — FFLocklessQueueBase::freeElement(this, elem).
        FFLocklessQueueBase_freeElement(this.base, elem);
      } else {
        // @0xd2fdc0/@0xd2fdc6 — virtual dispatch through element vtable +0x8.
        elem.vptr.slot_0x8_destroy(elem);
      }
      // @0xd2fdcc — next pop.
      elem = FFLocklessQueueBase_popAtomic(this.base, headRef);
    }

    // Step 4: tail-jump to FFLocklessQueueBase::~FFLocklessQueueBase (D2).
    // @0xd2fdfa jmp __ZN19FFLocklessQueueBaseD2Ev
    FFLocklessQueueBase_dtor_D2(this.base);
  }

  /**
   * ~FFCMIOPlaybackTimestampQueue — Itanium ABI D0 (deleting destructor).
   * Faithful transcription of __ZN28FFCMIOPlaybackTimestampQueueD0Ev @0xd2fe10.
   *
   * Structurally identical to D1 (same clear + drain-loop body, matching the
   * asm one-for-one at @0xd2fe1d/@0xd2fe24 (vptr install), @0xd2fe27 (clear),
   * @0xd2fe33/@0xd2fe4c (pop), @0xd2fe40/@0xd2fe46 (element vtable +0x8),
   * @0xd2fe59 (ownedByPool test), @0xd2fe66 (freeElement)), differing only in
   * the tail: instead of tail-JUMPING to the base D2, D0 CALLS the base D2 at
   * @0xd2fe70 and then tail-jumps to `operator delete(this)` (__ZdlPv) at
   * @0xd2fe82.
   *
   * In TS the "operator delete" step has no observable counterpart (garbage
   * collection handles freeing), but we call the stubbed `operator_delete`
   * anyway — its throw semantics document that the C++ ABI expected the
   * object's storage to be returned to the allocator at this exact point. Any
   * caller that actually relies on this method to free memory is buggy against
   * the TS port and the throw makes that explicit rather than silent.
   */
  __dtor_D0(): void {
    // Steps 1-3: exact same body as D1.
    FFLocklessQueueBase_clear(this.base);
    const headRef = {
      get: (): FFLocklessQueueBase_ElementBase | null => this.queueHead,
      set: (v: FFLocklessQueueBase_ElementBase | null): void => {
        this.queueHead = v;
      },
    };
    let elem: FFLocklessQueueBase_ElementBase | null = FFLocklessQueueBase_popAtomic(this.base, headRef);
    while (elem !== null) {
      if (elem.ownedByPool === 1) {
        FFLocklessQueueBase_freeElement(this.base, elem);
      } else {
        elem.vptr.slot_0x8_destroy(elem);
      }
      elem = FFLocklessQueueBase_popAtomic(this.base, headRef);
    }

    // Step 4a: CALL (not jmp) FFLocklessQueueBase::~FFLocklessQueueBase (D2).
    // @0xd2fe70 callq __ZN19FFLocklessQueueBaseD2Ev
    FFLocklessQueueBase_dtor_D2(this.base);

    // Step 4b: tail-jmp to operator delete(this).
    // @0xd2fe82 jmp 0x1497404 (symbol stub for __ZdlPv)
    operator_delete(this);
  }
}

