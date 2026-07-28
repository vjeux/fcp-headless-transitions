// FFAudioRecorderBufferWriteTaskQueue.ts — Flexo lockless work-queue for
// audio-recorder buffer-write tasks. In the Flexo audio pipeline this is a
// concrete instantiation of the generic `FFLocklessQueue<T>` template
// (T = FFAudioRecorderBufferWriteTask*), sitting atop the type-erased
// `FFLocklessQueueBase`. The Flexo binary emits four symbols for the
// concrete class:
//
//   FFAudioRecorderBufferWriteTaskQueue::FFAudioRecorderBufferWriteTaskQueue() [C2]  @0xd30ce0
//   FFAudioRecorderBufferWriteTaskQueue::FFAudioRecorderBufferWriteTaskQueue() [C1]  @0xd30dd0
//   FFAudioRecorderBufferWriteTaskQueue::~FFAudioRecorderBufferWriteTaskQueue() [D1] @0xd34600
//   FFAudioRecorderBufferWriteTaskQueue::~FFAudioRecorderBufferWriteTaskQueue() [D0] @0xd34680
//
// Transcribed from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.FFAudioRecorderBufferWriteTaskQueue.*.s for
// the verbatim x86_64 disassembly.
//
// STRUCT LAYOUT (recovered from ctor + dtor disasm; only observed offsets):
//   +0x00  vtbl : *const void       // set by C2/C1 to _FF_ARBWTQ_installed_vptr
//   +0x08  ... FFLocklessQueueBase fields (opaque — set up by
//         FFLocklessQueueBase's own ctor).
//   +0x18  ... free-element proc + userdata (installed by
//         FFLocklessQueueBase::setFreeElementProc(proc, userdata)).
//   +0x20  atomic<ElementBase*> — the head-of-queue slot that popAtomic
//         drains. Observed via `leaq 0x20(%rbx), %r14` in D1/D0 @0xd3461c/
//         0xd3469c, passed by reference to popAtomic.
//   (No AUDIO-recorder-side fields are directly touched by these four
//    methods — all state carried is in the FFLocklessQueueBase.)
//
// VTABLE POINTERS (constants recovered from the leaq RIP-relative loads):
//   C2 @0xd30cf1 install: 0x1912a08  (= 0xd30cf8 + 0xbe1d10) — "live" vtable
//                                    for FFAudioRecorderBufferWriteTaskQueue
//                                    (concrete class, subclass slot in +0x10
//                                    typeinfo header past the base of vtbl
//                                    object at 0x19129f8).
//   C1 @0xd30de1 install: 0x1912a08  (= 0xd30de8 + 0xbe1c20) — same address.
//   D1 @0xd3460d install: 0x1912b28  (= 0xd34614 + 0xbde514) — "sub-vtable"
//                                    written during teardown per the Itanium
//                                    C++ ABI so that virtual dispatch during
//                                    the destructor body sees the sub-object's
//                                    class, not the still-being-destroyed
//                                    derived class.
//   D0 @0xd3468d install: 0x1912b28  (= 0xd34694 + 0xbde494) — same address.
//
// FRONTIER (undecoded — throwing stubs, cited): FFLocklessQueueBase (ctor
// with sort-option enum, setFreeElementProc, clear, popAtomic, freeElement,
// ~FFLocklessQueueBase D2). The "free-element" callback local function
// `FFAudioRecorderBufferWriteTaskQueue_FreeElement` @0xd30d30 is small enough
// to transcribe in-line here (it is a private, module-local static function
// that Apple did not expose as a public symbol; but it IS this class's own
// code — see below).

// ── Frontier types ───────────────────────────────────────────────────

/** Opaque handle for FFAudioRecorderBufferWriteTask*. These are the
 *  task-payload objects the queue holds; their layout lives in a separate
 *  frontier port. */
export type FFAudioRecorderBufferWriteTaskPtr = {
  readonly __brand: "FFAudioRecorderBufferWriteTask";
};

/** Opaque handle for FFLocklessQueueBase::ElementBase*. The base container's
 *  linked-list node type — carries `vtbl` at +0x00 (with a virtual dtor at
 *  vtable slot +0x8), a "should-free" byte at +0x10 (1 = free me, else
 *  don't), and a payload pointer at +0x18 (loaded by the FreeElement
 *  helper to reach the task pointer). Full layout is a frontier port. */
export type FFLocklessQueueElementBasePtr = {
  vtbl: number;
  should_free: number; // uint8 at +0x10
  payload: FFAudioRecorderBufferWriteTaskPtr | null; // +0x18
};

/** Opaque handle for std::atomic<ElementBase*>. Only used by reference in
 *  the disasm — passed as the argument to popAtomic. Its internal layout
 *  is a C++ std::atomic that FFLocklessQueueBase reads/CASes. */
export type AtomicElementBaseRef = {
  __brand: "atomic<ElementBase*>";
};

/** Enum value 0 of FFLocklessQueueSortOption — matches `xorl %esi,%esi`
 *  used by both ctors, i.e. the default "no sort" option. The rest of
 *  the enum is not decoded here (only the "0" case is exercised). */
const FFLocklessQueueSortOption_Default = 0;

// ── Frontier callees ─────────────────────────────────────────────────

/** FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption)
 *  @Flexo 0x??? — not yet transcribed. Called from both C2 @0xd30cec
 *  and C1 @0xd30ddc with `sortOption = 0` (the Default enum value). */
function FFLocklessQueueBase_ctor(
  _self: FFAudioRecorderBufferWriteTaskQueue,
  _sortOption: number,
): void {
  throw new Error(
    "FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption) @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue ctor @0xd30cec (C2)/@0xd30ddc (C1)",
  );
}

/** FFLocklessQueueBase::setFreeElementProc(void (*)(void*, ElementBase*), void*)
 *  @Flexo 0x??? — not yet transcribed. Called from both ctors after the
 *  vtable install: registers the class's own `FreeElement` callback as
 *  the queue's element-free procedure, with userdata = nullptr (edx
 *  cleared to 0). */
function FFLocklessQueueBase_setFreeElementProc(
  _self: FFAudioRecorderBufferWriteTaskQueue,
  _proc: (userdata: unknown, element: FFLocklessQueueElementBasePtr) => void,
  _userdata: unknown,
): void {
  throw new Error(
    "FFLocklessQueueBase::setFreeElementProc @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue ctor @0xd30d07 (C2)/@0xd30df7 (C1)",
  );
}

/** FFLocklessQueueBase::clear() @Flexo 0x??? — not yet transcribed.
 *  Called from both dtors @0xd34617 (D1) / @0xd34697 (D0) as the first
 *  step of teardown, before the popAtomic drain loop. */
function FFLocklessQueueBase_clear(
  _self: FFAudioRecorderBufferWriteTaskQueue,
): void {
  throw new Error(
    "FFLocklessQueueBase::clear @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue dtor @0xd34617 (D1)/@0xd34697 (D0)",
  );
}

/** FFLocklessQueueBase::popAtomic(std::atomic<ElementBase*>&) @Flexo 0x??? —
 *  not yet transcribed. Returns the popped ElementBase* (or nullptr when
 *  the queue is drained). Called in the D1/D0 drain loops. */
function FFLocklessQueueBase_popAtomic(
  _self: FFAudioRecorderBufferWriteTaskQueue,
  _head: AtomicElementBaseRef,
): FFLocklessQueueElementBasePtr | null {
  throw new Error(
    "FFLocklessQueueBase::popAtomic @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue dtor loop @0xd34623/@0xd3463c (D1) & @0xd346a3/@0xd346bc (D0)",
  );
}

/** FFLocklessQueueBase::freeElement(ElementBase*) @Flexo 0x??? — not yet
 *  transcribed. Called on popped elements whose `should_free` byte
 *  ((elem)+0x10) is 1. */
function FFLocklessQueueBase_freeElement(
  _self: FFAudioRecorderBufferWriteTaskQueue,
  _element: FFLocklessQueueElementBasePtr,
): void {
  throw new Error(
    "FFLocklessQueueBase::freeElement @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue dtor @0xd34656 (D1)/@0xd346d6 (D0)",
  );
}

/** FFLocklessQueueBase::~FFLocklessQueueBase() [D2] @Flexo 0x??? — not
 *  yet transcribed. Called after the drain loop from D1 @0xd3466a (as a
 *  tail-jmp) and D0 @0xd346e0 (as a callq before operator delete). */
function FFLocklessQueueBase_dtor(
  _self: FFAudioRecorderBufferWriteTaskQueue,
): void {
  throw new Error(
    "FFLocklessQueueBase::~FFLocklessQueueBase [D2] @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue dtor @0xd3466a (D1)/@0xd346e0 (D0)",
  );
}

/** ElementBase virtual destructor invocation — the vtable slot at +0x8
 *  of the popped element's vptr. This is the C++ call `(*vptr[1])(elem)`.
 *  Implementations live on the concrete task subclass; opaque to us. */
function element_virtual_dtor(_elem: FFLocklessQueueElementBasePtr): void {
  throw new Error(
    "ElementBase virtual destructor (vtbl slot +0x8) @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue dtor drain @0xd34636 (D1)/@0xd346b6 (D0)",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv symbol stub @0x1497404) —
 *  tail-called from D0 @0xd346f2. Modeled as a no-op in a GC'd TS
 *  runtime, but preserved for control-flow fidelity. */
function operator_delete_stub(_this: FFAudioRecorderBufferWriteTaskQueue): void {
  // GC'd runtime — no explicit free.
}

// ── Vtable pointer constants ─────────────────────────────────────────
//
// See top-of-file for the arithmetic. Kept as numeric constants that
// preserve provenance; never dereferenced in TS.
const _FF_ARBWTQ_installed_vptr_live = 0x1912a08; // @0xd30cf1 (C2) / @0xd30de1 (C1)
const _FF_ARBWTQ_installed_vptr_base = 0x1912b28; // @0xd3460d (D1) / @0xd3468d (D0)

// ── The private, module-local FreeElement callback ───────────────────
//
// @Flexo 0xd30d30 (symbol
// `__ZL47FFAudioRecorderBufferWriteTaskQueue_FreeElementPvPN19FFLocklessQueueBase11ElementBaseE`
// — the `ZL` marks it a private/static function). Full disasm:
//
//   0xd30d30  pushq %rbp
//   0xd30d31  movq  %rsp, %rbp
//   0xd30d34  movq  0x18(%rsi), %rdi        ; rdi = elem->payload (Task*)
//   0xd30d38  testq %rdi, %rdi              ; if payload == null:
//   0xd30d3b  je    0xd30d44                ;   fall through -> return
//   0xd30d3d  movq  (%rdi), %rax            ; rax = payload->vtbl
//   0xd30d40  popq  %rbp
//   0xd30d41  jmpq  *0x8(%rax)              ; tail-call payload->vtbl[+0x8]
//                                           ; (the task's virtual dtor)
//   0xd30d44  popq  %rbp
//   0xd30d45  retq
//
// I.e. `if (elem->payload) call payload->virtual_dtor(payload); return;`
// The `void*` first-arg (rdi, the userdata `null` we registered) is
// ignored — the whole thing operates on the ElementBase* second-arg only.
function FFAudioRecorderBufferWriteTaskQueue_FreeElement(
  _userdata: unknown,
  elem: FFLocklessQueueElementBasePtr,
): void {
  // @0xd30d34 — read payload = *(elem + 0x18).
  const payload = elem.payload;
  // @0xd30d38..0xd30d3b — testq / je → early return if null.
  if (payload === null || payload === undefined) {
    // @0xd30d44/0xd30d45 — retq.
    return;
  }
  // @0xd30d3d..0xd30d41 — vtable slot +0x8 = virtual destructor:
  //   rax = payload->vtbl; jmp *(rax + 0x8)
  taskVirtualDtor(payload);
}

/** Payload task's virtual destructor (vtable slot +0x8). Not decoded. */
function taskVirtualDtor(_payload: FFAudioRecorderBufferWriteTaskPtr): void {
  throw new Error(
    "FFAudioRecorderBufferWriteTask virtual destructor (vtbl slot +0x8) @ (frontier) not yet transcribed — reached from FFAudioRecorderBufferWriteTaskQueue_FreeElement @0xd30d41",
  );
}

// ── The class ─────────────────────────────────────────────────────────

/** FFAudioRecorderBufferWriteTaskQueue — Flexo lockless work-queue holding
 *  FFAudioRecorderBufferWriteTask* payloads. Backed by FFLocklessQueueBase;
 *  the four emitted methods just set up / tear down the base container
 *  and register/invoke the payload-free callback. */
export class FFAudioRecorderBufferWriteTaskQueue {
  /** +0x00 vtbl. Set by the ctor to _FF_ARBWTQ_installed_vptr_live and
   *  overwritten during teardown to _FF_ARBWTQ_installed_vptr_base
   *  (Itanium C++ ABI sub-object vtable-swap). */
  vtbl: number = 0;

  /** +0x20 atomic<ElementBase*> head-slot. Passed by reference to
   *  popAtomic in the drain loop. Modeled as an opaque brand. */
  private readonly headSlot: AtomicElementBaseRef = {
    __brand: "atomic<ElementBase*>",
  };

  /**
   * @see FCP Flexo `FFAudioRecorderBufferWriteTaskQueue::
   *      FFAudioRecorderBufferWriteTaskQueue()` [C2] @0xd30ce0
   *      and [C1] @0xd30dd0.
   *
   * The two ctor emissions are byte-for-byte the same shape (both are
   * complete constructors — the compiler did NOT alias C1 → C2 as a
   * trampoline; it emitted two independent identical copies, presumably
   * because both are reachable from cross-TU users). We model them as
   * one TypeScript constructor: it is impossible to observe the two
   * apart at the language level, and their semantics are identical.
   *
   * Disassembly (verbatim; C2 shown, C1 differs only in the RIP-relative
   * disp of the leaq — the target address 0x1912a08 is the SAME):
   *
   *   0xd30ce0  push %rbp
   *   0xd30ce1  mov  %rsp, %rbp
   *   0xd30ce4  push %r14
   *   0xd30ce6  push %rbx
   *   0xd30ce7  mov  %rdi, %rbx                       ; rbx = this
   *   0xd30cea  xor  %esi, %esi                       ; sortOption = 0
   *   0xd30cec  callq FFLocklessQueueBase::FFLocklessQueueBase(sortOption=0)
   *   0xd30cf1  leaq  0xbe1d10(%rip), %rax            ; rax = 0x1912a08 (vptr)
   *   0xd30cf8  movq  %rax, (%rbx)                    ; (this)+0x00 = vptr
   *   0xd30cfb  leaq  <FreeElement>(%rip), %rsi       ; rsi = &FreeElement
   *   0xd30d02  movq  %rbx, %rdi                      ; rdi = this
   *   0xd30d05  xor   %edx, %edx                      ; userdata = 0
   *   0xd30d07  callq FFLocklessQueueBase::setFreeElementProc(FreeElement, null)
   *   0xd30d0c  pop %rbx / pop %r14 / pop %rbp / retq
   *
   *   ; Landing pad (unreachable in the success path):
   *   ; 0xd30d11..0xd30d1f — Itanium unwind: if base ctor threw, run
   *   ; FFLocklessQueue<...>::~D2 on `this` and re-raise. TS exceptions
   *   ; propagate naturally, so this cleanup is implicit.
   */
  constructor() {
    // @0xd30cec — base ctor with sortOption=Default(0).
    FFLocklessQueueBase_ctor(this, FFLocklessQueueSortOption_Default);
    // @0xd30cf1/@0xd30cf8 — install live vtable pointer.
    this.vtbl = _FF_ARBWTQ_installed_vptr_live;
    // @0xd30cfb/@0xd30d07 — register the FreeElement callback with
    // userdata = null.
    FFLocklessQueueBase_setFreeElementProc(
      this,
      FFAudioRecorderBufferWriteTaskQueue_FreeElement,
      null,
    );
    // @0xd30d10 — retq (void).
  }

  /**
   * @see FCP Flexo `FFAudioRecorderBufferWriteTaskQueue::
   *      ~FFAudioRecorderBufferWriteTaskQueue()` [D1] @0xd34600.
   *
   * The complete-object destructor: reset vtable to the base
   * FFLocklessQueueBase's sub-object vtable, clear the container-level
   * state, drain the queue (destroying and, for should-free elements,
   * freeing each), and finally tail-call the base destructor.
   *
   * Disassembly (verbatim, the drain loop reproduced faithfully):
   *
   *   0xd34600  push %rbp / mov %rsp,%rbp
   *   0xd34604  push %r15 / push %r14 / push %rbx / push %rax (align)
   *   0xd3460a  mov  %rdi, %rbx                          ; rbx = this
   *   0xd3460d  leaq 0xbde514(%rip), %rax                ; rax = 0x1912b28 (base vptr)
   *   0xd34614  movq %rax, (%rdi)                        ; (this)+0x00 = base vptr
   *   0xd34617  callq FFLocklessQueueBase::clear()
   *   0xd3461c  leaq 0x20(%rbx), %r14                    ; r14 = &(this)+0x20 = headSlot
   *   0xd34620  mov  %r14, %rdi
   *   0xd34623  callq FFLocklessQueueBase::popAtomic(headSlot)
   *   0xd34628  mov  %rax, %r15                          ; r15 = elem
   *   0xd3462b  jmp  0xd34644                            ; -> loop condition
   *   ; loop body:
   *   0xd34630  mov  (%r15), %rax                        ; rax = elem->vtbl
   *   0xd34633  mov  %r15, %rdi                          ; rdi = elem
   *   0xd34636  callq *0x8(%rax)                         ; elem->virtual_dtor()
   *   0xd34639  mov  %r14, %rdi
   *   0xd3463c  callq FFLocklessQueueBase::popAtomic(headSlot)
   *   0xd34641  mov  %rax, %r15
   *   ; loop condition:
   *   0xd34644  testq %r15, %r15
   *   0xd34647  je   0xd3465d                            ; exit if elem==null
   *   0xd34649  cmpb $0x1, 0x10(%r15)                    ; elem->should_free == 1 ?
   *   0xd3464e  jne  0xd34630                            ; no  -> back to body (no free)
   *   0xd34650  mov  %rbx, %rdi
   *   0xd34653  mov  %r15, %rsi
   *   0xd34656  callq FFLocklessQueueBase::freeElement(elem)
   *   0xd3465b  jmp  0xd34630                            ; back to body
   *   ; exit:
   *   0xd3465d  mov  %rbx, %rdi
   *   0xd34660  add  $0x8, %rsp / pop %rbx / pop %r14 / pop %r15 / pop %rbp
   *   0xd3466a  jmp  FFLocklessQueueBase::~FFLocklessQueueBase()   ; tail-call
   *
   * Note the loop structure — one popAtomic BEFORE the condition (via
   * the initial jmp to the condition), then the body always calls the
   * virtual dtor first, then decides whether to also freeElement based
   * on the byte at offset +0x10. This exact shape (dtor always, free
   * sometimes) is preserved below.
   */
  destroy_D1(): void {
    // @0xd3460d/@0xd34614 — install base sub-object vtable pointer.
    this.vtbl = _FF_ARBWTQ_installed_vptr_base;
    // @0xd34617 — clear() base state.
    FFLocklessQueueBase_clear(this);
    // @0xd3461c — r14 = &this.headSlot (i.e. `this + 0x20`).
    // @0xd34620/@0xd34623 — first popAtomic before the condition check.
    let elem: FFLocklessQueueElementBasePtr | null =
      FFLocklessQueueBase_popAtomic(this, this.headSlot);
    // @0xd3462b jmp -> loop condition at @0xd34644.
    while (elem !== null) {
      // @0xd34649/@0xd3464e — cmpb $0x1, 0x10(%r15) / jne body:
      //   virtual dtor is called on EVERY popped elem regardless;
      //   freeElement is called ONLY when should_free == 1.
      // Reordered by the disasm to (body:dtor -> cond:freeIf1 -> pop again):
      // @0xd34630..0xd34636 — virtual dtor via vtable slot +0x8.
      element_virtual_dtor(elem);
      // @0xd34649/@0xd3464e — if should_free==1, freeElement.
      if ((elem.should_free | 0) === 1) {
        // @0xd34656 — freeElement(elem).
        FFLocklessQueueBase_freeElement(this, elem);
      }
      // @0xd3463c — next popAtomic.
      elem = FFLocklessQueueBase_popAtomic(this, this.headSlot);
    }
    // @0xd3466a — tail-call FFLocklessQueueBase::~FFLocklessQueueBase.
    FFLocklessQueueBase_dtor(this);
  }

  /**
   * @see FCP Flexo `FFAudioRecorderBufferWriteTaskQueue::
   *      ~FFAudioRecorderBufferWriteTaskQueue()` [D0] @0xd34680.
   *
   * The deleting destructor. Same drain-loop body as D1 (Apple did NOT
   * collapse D0 → call D1 — they're inlined identically here), then
   * tail-jump to `operator delete(this)`. The base vtable pointer
   * installed at the top uses the same target 0x1912b28 as D1, just
   * reached via a different RIP-relative disp (0xbde494 vs 0xbde514).
   *
   * Disassembly summary (mirrors D1 line-for-line for the loop):
   *
   *   0xd34680  push %rbp / mov %rsp,%rbp
   *   0xd34684  push %r15 / push %r14 / push %rbx / push %rax (align)
   *   0xd3468a  mov  %rdi, %rbx
   *   0xd3468d  leaq 0xbde494(%rip), %rax                ; rax = 0x1912b28
   *   0xd34694  movq %rax, (%rdi)                        ; (this)+0x00 = base vptr
   *   0xd34697  callq FFLocklessQueueBase::clear()
   *   0xd3469c..0xd346db  [same drain loop as D1]
   *   0xd346dd  mov  %rbx, %rdi
   *   0xd346e0  callq FFLocklessQueueBase::~FFLocklessQueueBase()   ; NOT jmp
   *   0xd346e5  mov  %rbx, %rdi
   *   0xd346e8  add  $0x8,%rsp / pop %rbx / pop %r14 / pop %r15 / pop %rbp
   *   0xd346f2  jmp  __ZdlPv                             ; operator delete(void*)
   */
  destroy_D0(): void {
    // @0xd3468d/@0xd34694 — install base sub-object vtable pointer.
    this.vtbl = _FF_ARBWTQ_installed_vptr_base;
    // @0xd34697 — clear().
    FFLocklessQueueBase_clear(this);
    // @0xd346a3 — first popAtomic before the condition check.
    let elem: FFLocklessQueueElementBasePtr | null =
      FFLocklessQueueBase_popAtomic(this, this.headSlot);
    while (elem !== null) {
      // @0xd346b6 — virtual dtor via vtable slot +0x8.
      element_virtual_dtor(elem);
      // @0xd346c9/@0xd346ce — cmpb $0x1, 0x10(%r15) / jne (skip free).
      if ((elem.should_free | 0) === 1) {
        // @0xd346d6 — freeElement.
        FFLocklessQueueBase_freeElement(this, elem);
      }
      // @0xd346bc — next popAtomic.
      elem = FFLocklessQueueBase_popAtomic(this, this.headSlot);
    }
    // @0xd346e0 — callq (NOT jmp) FFLocklessQueueBase::~FFLocklessQueueBase.
    FFLocklessQueueBase_dtor(this);
    // @0xd346f2 — jmp __ZdlPv (operator delete).
    operator_delete_stub(this);
  }
}
