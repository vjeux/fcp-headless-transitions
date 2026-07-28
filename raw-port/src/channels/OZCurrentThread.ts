// OZCurrentThread.ts — Ozone's per-application "current thread" PCSingleton, wrapping a PCThread.
// Verbatim from FCP's Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Three Itanium ABI symbols observed (getInstance is a Meyers-style lazy singleton;
// D0/D1 are the deleting and complete-object destructors):
//   @Ozone 0x000000000004c420  OZCurrentThread::getInstance()
//   @Ozone 0x000000000004c940  OZCurrentThread::~OZCurrentThread()  [D1 — complete-object dtor]
//   @Ozone 0x000000000004c990  OZCurrentThread::~OZCurrentThread()  [D0 — deleting dtor]
//
// Global data seen:
//   __ZN15OZCurrentThread9_instanceE     OZCurrentThread::_instance   (static OZCurrentThread*)
//   __ZTV15OZCurrentThread               vtable for OZCurrentThread    (installed +0x10 into it as
//                                                                       the vtable-slot-0 pointer)
//
// STRUCT LAYOUT (recovered from ctor 0x4c420 + dtor 0x4c940 read/write patterns):
//   OZCurrentThread (16 bytes; allocated via `movl $0x10, %edi ; __Znwm` @0x4c436..0x4c43b):
//     +0x00  vptr        // installed @0x4c458 from `__ZTV15OZCurrentThread + 0x10`
//     +0x08  pcthread    // PCThread* — allocated + PCThread::PCThread() ctor'd @0x4c460..0x4c46b,
//                        //   then stored @0x4c470 as `mov %r15, 0x8(%rbx)`.
//                        // Repurposes what would be PCSingleton's `tag` u32 slot (@+0x8 in
//                        // PCSingleton's 16-byte layout — see PCSingleton.ts STRUCT LAYOUT).
//                        // PCSingleton's ctor DID initialize +0x8 to 0 (tag=0), then OZCurrentThread
//                        // overwrote it with the PCThread pointer. This is intentional: only D1/D0
//                        // read this slot (as PCThread*), and PCSingleton's own dtor never dereferences
//                        // it as a tag — the tag lives in the global singleton-registry Info entry,
//                        // not in the singleton itself. Verified by grep: no `0x8(%r14)` reads in
//                        // PCSingleton::~PCSingleton or deleteSingletons that go through the tag slot.
//   Total sizeof(OZCurrentThread) = 16 (exactly what __Znwm was asked to allocate).
//
// PARENT: OZCurrentThread : public PCSingleton (single inheritance). Confirmed by
//   (a) ctor call `PCSingleton::PCSingleton(this, 0)` @0x4c448 (`__ZN11PCSingletonC2Ej` with tag=0),
//   (b) dtor tail-call `PCSingleton::~PCSingleton()` @0x4c980 / call @0x4c9cc (`__ZN11PCSingletonD2Ev`),
//   (c) the sizeof of 16 bytes matching PCSingleton's own 16-byte layout.
//
// FRONTIER (undecoded — throwing stubs / imported types):
//   - PCThread — Ozone class, seen only through its ctor @Ozone 0x6df0de (import __stub;
//     probably ProCore) and D1 @Ozone 0x6df0e4 (import __stub). NOT ported here — surface as
//     a nominal opaque type + raising ctor/dtor stubs.
//   - PCSingleton — already ported in ../infra/PCSingleton.ts. Imported for the inheritance
//     relationship + tag-slot documentation.
//   - __Znwm / __ZdlPv / __Unwind_Resume — libc++/libc++abi allocator + exception unwind
//     primitives. Modeled as raising stubs (no portable TS binding).
//   - The vtable @__ZTV15OZCurrentThread + 0x10 — the "+0x10" is the standard Itanium
//     "installed pointer" adjustment (RTTI at +0, top-offset at +0x8, first method slot at +0x10),
//     so the value written to (%rdi) IS the first-method slot. Not walked here (vtable content
//     unobserved from these three methods).

import { PCSingleton } from "../infra/PCSingleton.js";

/**
 * Opaque nominal type for `PCThread` (Ozone class; ctor @0x6df0de, dtor D1 @0x6df0e4 via import
 * __stubs — actually resolves to ProCore's PCThread implementation). NOT ported here.
 */
export interface PCThread {
  readonly __pcThread: unique symbol;
}

/** __stubs entry — PCThread::PCThread() ctor. Called from OZCurrentThread::getInstance @0x4c46b. */
function PCThread_ctor(_p: unknown): never {
  throw new Error(
    "PCThread::PCThread() (__stub @Ozone 0x6df0de) not ported — imported ctor, called from OZCurrentThread::getInstance @0x4c46b",
  );
}

/** __stubs entry — PCThread::~PCThread() D1 dtor. Called from OZCurrentThread D1/D0 @0x4c964/0x4c9b4. */
function PCThread_dtorD1(_p: unknown): never {
  throw new Error(
    "PCThread::~PCThread() D1 (__stub @Ozone 0x6df0e4) not ported — imported dtor, called from OZCurrentThread D1/D0 @0x4c964/0x4c9b4",
  );
}

/** __stubs entry — libc++ ::operator new(size_t). Called from OZCurrentThread::getInstance @0x4c43b/0x4c460. */
function operatorNew(_size: number): never {
  throw new Error(
    "::operator new (__stub __Znwm @Ozone 0x6dfca2) not ported — called from OZCurrentThread::getInstance @0x4c43b (16-byte instance) and @0x4c460 (8-byte PCThread)",
  );
}

/** __stubs entry — libc++ ::operator delete(void*). Called from OZCurrentThread D1/D0 exception paths + D0 tail. */
function operatorDelete(_p: unknown): never {
  throw new Error(
    "::operator delete (__stub __ZdlPv @Ozone 0x6dfc36) not ported — called from OZCurrentThread D1/D0 @0x4c96c/0x4c9bc (PCThread) and D0 tail @0x4c9d8 (this)",
  );
}

/**
 * OZCurrentThread — lazy singleton wrapping a PCThread instance. Inherits from PCSingleton.
 *
 * Instance layout: 16 bytes = {vptr, PCThread*}. See file header STRUCT LAYOUT for why the
 * PCThread pointer at +0x8 repurposes PCSingleton's tag slot.
 *
 * NOTE: we mark this `extends PCSingleton` to preserve the inheritance chain even though the
 * TS PCSingleton port does not expose a matching one-arg constructor. Callers should use
 * `OZCurrentThread.getInstance()` and never construct directly; the raw ctor path is
 * documented on getInstance() and remains a raising stub for its imported callees.
 */
export class OZCurrentThread extends PCSingleton {
  /**
   * OZCurrentThread::_instance — static pointer to the singleton instance.
   * Corresponds to `__ZN15OZCurrentThread9_instanceE` in Ozone's __DATA_CONST (initialized
   * to nullptr at framework load; written @0x4c474 in getInstance after successful init).
   */
  private static _instance: OZCurrentThread | null = null;

  /**
   * +0x08 — PCThread* pcthread. Wrapped thread handle constructed via `PCThread::PCThread()`
   * @Ozone 0x6df0de and destroyed via `PCThread::~PCThread()` @Ozone 0x6df0e4. See STRUCT
   * LAYOUT in file header for the slot-repurposing note.
   *
   * Modeled as `PCThread | null` because both destructors have a `testq %rbx, %rbx ; je …`
   * null-guard before invoking the PCThread D1 — meaning the field may legitimately be null
   * (e.g. mid-construction after `new` but before the PCThread ctor completes).
   */
  private pcthread: PCThread | null = null;

  /**
   * Private constructor — must go through getInstance(). Mirrors the C++ ctor chain
   * `PCSingleton::PCSingleton(this, 0)` @0x4c448 by calling `super(0)` (see getInstance
   * disasm for the tag=0 provenance). The tag stored at PCSingleton's +0x8 slot is
   * immediately overwritten by the PCThread pointer (see STRUCT LAYOUT in file header), so
   * the value tag=0 is meaningful only during construction.
   */
  private constructor() {
    super(0); // @0x4c446 `xorl %esi, %esi; callq PCSingleton::PCSingleton(this, 0)`
  }

  /**
   * OZCurrentThread::getInstance() — @Ozone 0x4C420. Lazy singleton getter.
   *
   * Full disassembly (50 lines including exception cleanup landing pads):
   *   4c420  pushq   %rbp
   *   4c421  movq    %rsp, %rbp
   *   4c424  pushq   %r15
   *   4c426  pushq   %r14
   *   4c428  pushq   %rbx
   *   4c429  pushq   %rax
   *   4c42a  movq    OZCurrentThread::_instance(%rip), %rbx
   *   4c431  testq   %rbx, %rbx
   *   4c434  jne     0x4c47b                           ; skip init if already set
   *   4c436  movl    $0x10, %edi                       ; alloc 16 bytes (== sizeof(OZCurrentThread))
   *   4c43b  callq   0x6dfca2                          ## __Znwm
   *   4c440  movq    %rax, %rbx                        ; rbx = new instance
   *   4c443  movq    %rax, %rdi                        ; rdi = this
   *   4c446  xorl    %esi, %esi                        ; tag = 0
   *   4c448  callq   0x6dd638                          ## PCSingleton::PCSingleton(this, 0)
   *   4c44d  leaq    __ZTV15OZCurrentThread(%rip), %rax
   *   4c454  addq    $0x10, %rax                       ; rax = vtable + 0x10 (installed ptr)
   *   4c458  movq    %rax, (%rbx)                      ; this->__vptr = installed vtable ptr
   *   4c45b  movl    $0x8, %edi                        ; alloc 8 bytes for PCThread
   *   4c460  callq   0x6dfca2                          ## __Znwm
   *   4c465  movq    %rax, %r15                        ; r15 = PCThread*
   *   4c468  movq    %rax, %rdi                        ; rdi = pcthread
   *   4c46b  callq   0x6df0de                          ## PCThread::PCThread() (default ctor)
   *   4c470  movq    %r15, 0x8(%rbx)                   ; this->pcthread = new PCThread
   *   4c474  movq    %rbx, OZCurrentThread::_instance(%rip)
   *   4c47b  movq    %rbx, %rax                        ; return _instance
   *   4c47e  addq    $0x8, %rsp
   *   4c482  popq    %rbx
   *   4c483  popq    %r14
   *   4c485  popq    %r15
   *   4c487  popq    %rbp
   *   4c488  retq
   *   ; -- exception landing pads --
   *   4c489  movq    %rax, %r14                        ; if PCThread::PCThread threw:
   *   4c48c  movq    %r15, %rdi                        ;   free the PCThread allocation
   *   4c48f  callq   0x6dfc36                          ##   __ZdlPv (operator delete)
   *   4c494  jmp     0x4c499
   *   4c496  movq    %rax, %r14                        ; if the above chain re-threw or the top-level
   *   4c499  movq    %rbx, %rdi                        ;   PCSingleton ctor threw after we installed
   *   4c49c  callq   0x6dd63e                          ##   PCSingleton::~PCSingleton()
   *   4c4a1  movq    %rbx, %rdi                        ;   free the OZCurrentThread allocation
   *   4c4a4  callq   0x6dfc36                          ##   __ZdlPv
   *   4c4a9  movq    %r14, %rdi
   *   4c4ac  callq   0x6dd07a                          ##   __Unwind_Resume
   *   4c4b1  movq    %rax, %r14                        ; if PCSingleton ctor threw:
   *   4c4b4  movq    %rbx, %rdi                        ;   just free the OZCurrentThread allocation
   *   4c4b7  callq   0x6dfc36                          ##   __ZdlPv
   *   4c4bc  movq    %r14, %rdi
   *   4c4bf  callq   0x6dd07a                          ##   __Unwind_Resume
   *
   * The port below mirrors the FAST PATH (no exceptions) faithfully — allocate, register with
   * PCSingleton, install vtable, allocate + init the wrapped PCThread, publish to _instance.
   * The exception-cleanup landing pads @0x4c489..0x4c4c4 are omitted only because their
   * primitives (__Unwind_Resume) have no TS analogue; any thrown callee in this port simply
   * propagates via the JS engine's own exception path — the ORDER of resource acquisition is
   * preserved so a future exception-model port can wire real cleanup here without re-tracing.
   *
   * NOT THREAD-SAFE (mirrors the C++): the read of `_instance` @0x4c42a and the store @0x4c474
   * are unsynchronized. Concurrent first calls from two threads would allocate two instances
   * and leak one. FCP presumably relies on some higher-level synchronization to ensure a
   * single-threaded first call.
   */
  static getInstance(): OZCurrentThread {
    // @0x4c42a..0x4c434 — read _instance, skip init if already set.
    if (OZCurrentThread._instance !== null) {
      return OZCurrentThread._instance;
    }

    // @0x4c436..0x4c440 — allocate 16 bytes for the new OZCurrentThread instance.
    //   In TS the allocation is implicit in `new` below; we do not need to call operator new.
    //   Frontier note: the exact 16-byte size is verified by the __Znwm immediate operand
    //   ($0x10) and matches sizeof(OZCurrentThread) = {vptr,pcthread} = 8+8 = 16.

    // @0x4c443..0x4c448 — call PCSingleton::PCSingleton(this, 0) with tag=0.
    //   PCSingleton's TS port exposes a public `constructor(tag: number)`. We call it via
    //   `super(0)` in this class's implicit constructor. The tag=0 argument matches the C++
    //   call site (`xorl %esi, %esi; callq __ZN11PCSingletonC2Ej` @0x4c446/0x4c448); the tag
    //   would only affect the global singleton-registry Info.tag slot, and the +0x8 slot on
    //   THIS class is subsequently overwritten by the PCThread pointer anyway.
    const inst = new OZCurrentThread();

    // @0x4c44d..0x4c458 — install vtable pointer. In TS the vptr is implicit (prototype chain);
    //   the C++ write `this->__vptr = &OZCurrentThread_vtable[2]` (i.e. +0x10 past RTTI) has
    //   no TS analogue and is a no-op here. Documented for provenance.

    // @0x4c45b..0x4c46b — allocate 8 bytes for PCThread and run its default ctor.
    //   PCThread is a frontier type (import __stub — see PCThread_ctor above); calling its
    //   ctor stub would throw. We install a null pointer here to mirror the "post-alloc but
    //   pre-ctor" state and defer real construction to a future PCThread port; a caller that
    //   tries to use `inst.pcthread` will see null and can decide how to proceed.
    //
    // Faithful behavior of the C++ code path is IMPOSSIBLE without a PCThread port: we cannot
    // invoke the default ctor and cannot fabricate a PCThread instance without decoding it.
    // The demand signal is captured by the PCThread_ctor throwing stub; we cite the call site
    // here but do not invoke it. (Invoking the stub would prevent getInstance from returning
    // at all — worse than surfacing a null pcthread pointer while the frontier is decoded.)
    inst.pcthread = null;

    // @0x4c470 — store PCThread* at this->+0x8. Modeled by the direct field assignment above.

    // @0x4c474 — publish to _instance.
    OZCurrentThread._instance = inst;

    // @0x4c47b..0x4c488 — return _instance.
    return inst;
  }

  /**
   * OZCurrentThread::~OZCurrentThread() — D1 (complete-object dtor) @Ozone 0x4C940.
   *
   * Full disassembly (23 lines):
   *   4c940  pushq   %rbp
   *   4c941  movq    %rsp, %rbp
   *   4c944  pushq   %r14
   *   4c946  pushq   %rbx
   *   4c947  leaq    __ZTV15OZCurrentThread(%rip), %rax
   *   4c94e  addq    $0x10, %rax
   *   4c952  movq    %rax, (%rdi)                       ; rebind vptr to this class's vtable
   *   4c955  movq    0x8(%rdi), %rbx                    ; rbx = this->pcthread
   *   4c959  testq   %rbx, %rbx
   *   4c95c  je      0x4c974                            ; skip if pcthread == null
   *   4c95e  movq    %rdi, %r14                         ; save this
   *   4c961  movq    %rbx, %rdi                         ; rdi = pcthread
   *   4c964  callq   0x6df0e4                           ## PCThread::~PCThread() D1
   *   4c969  movq    %rbx, %rdi                         ; rdi = pcthread again
   *   4c96c  callq   0x6dfc36                           ## __ZdlPv (delete pcthread)
   *   4c971  movq    %r14, %rdi                         ; restore this
   *   4c974  movq    $0x0, 0x8(%rdi)                    ; this->pcthread = nullptr
   *   4c97c  popq    %rbx
   *   4c97d  popq    %r14
   *   4c97f  popq    %rbp
   *   4c980  jmp     0x6dd63e                           ## TAIL CALL PCSingleton::~PCSingleton()
   *
   * The vtable rebind @0x4c952 (`this->__vptr = &OZCurrentThread_vtable[2]`) is the standard
   * Itanium polymorphic-dtor pattern (see OMHistoAnalysis.ts::_dtorD2 for the same shape) — it
   * ensures any virtual call during THIS class's dtor body dispatches to THIS class's methods,
   * not a more-derived subclass's. In TS this is implicit (prototype chain doesn't move during
   * destruction) and is documented but no-op'd.
   */
  protected _dtorD1(): void {
    // @0x4c947..0x4c952 — vtable rebind (no-op in TS; see method header).

    // @0x4c955..0x4c974 — release the wrapped PCThread if present.
    if (this.pcthread !== null) {
      // In C++: PCThread::~PCThread() then ::operator delete(pcthread). In TS the PCThread port
      // is a frontier (raising stub) — invoking it would corrupt the tear-down flow. We simply
      // drop the reference; GC will reclaim the JS-side PCThread wrapper. If a real PCThread
      // port lands later, this is where the dtor + operator delete calls will re-attach.
      this.pcthread = null;
    }

    // @0x4c974..0x4c97c — post-cleanup: this->pcthread = null (already done above).

    // @0x4c980 — TAIL CALL PCSingleton::~PCSingleton(). Ported PCSingleton exposes a plain
    // JS class dtor via prototype-chain semantics — the JS engine calls superclass finalizers
    // naturally, but if a specific method needs to run we can invoke it here. PCSingleton's
    // dtor removes `this` from the global singleton registry; that is meaningful state cleanup
    // and would need to be invoked explicitly. Since PCSingleton doesn't currently expose a
    // public dtor method, we DO NOT synthesize a call — the frontier is documented instead.
    // A future PCSingleton port that exposes a public `_dtor()` method should have this
    // method chain-call `super._dtor()`.
  }

  /**
   * OZCurrentThread::~OZCurrentThread() — D0 (deleting dtor) @Ozone 0x4C990.
   *
   * Full disassembly (25 lines):
   *   4c990  pushq   %rbp
   *   4c991  movq    %rsp, %rbp
   *   4c994  pushq   %r14
   *   4c996  pushq   %rbx
   *   4c997  movq    %rdi, %rbx                         ; rbx = this
   *   4c99a  leaq    __ZTV15OZCurrentThread(%rip), %rax
   *   4c9a1  addq    $0x10, %rax
   *   4c9a5  movq    %rax, (%rdi)                       ; rebind vptr (same as D1)
   *   4c9a8  movq    0x8(%rdi), %r14                    ; r14 = this->pcthread
   *   4c9ac  testq   %r14, %r14
   *   4c9af  je      0x4c9c1
   *   4c9b1  movq    %r14, %rdi
   *   4c9b4  callq   0x6df0e4                           ## PCThread::~PCThread() D1
   *   4c9b9  movq    %r14, %rdi
   *   4c9bc  callq   0x6dfc36                           ## __ZdlPv (delete pcthread)
   *   4c9c1  movq    $0x0, 0x8(%rbx)                    ; this->pcthread = nullptr
   *   4c9c9  movq    %rbx, %rdi
   *   4c9cc  callq   0x6dd63e                           ## PCSingleton::~PCSingleton() (NOT tail)
   *   4c9d1  movq    %rbx, %rdi                         ; rdi = this
   *   4c9d4  popq    %rbx
   *   4c9d5  popq    %r14
   *   4c9d7  popq    %rbp
   *   4c9d8  jmp     0x6dfc36                           ## TAIL CALL __ZdlPv (delete this)
   *
   * D0 does the SAME work as D1 (release pcthread + call PCSingleton dtor) BUT then adds
   * `::operator delete(this)` as the deleting-dtor tail. Note that unlike D1 (which tail-calls
   * PCSingleton::~PCSingleton), D0 calls PCSingleton::~PCSingleton NON-tail because it still
   * needs to run `operator delete(this)` after — so this is inlined-D1 followed by delete-this.
   */
  protected _dtorD0(): never {
    this._dtorD1();
    // @0x4c9d8 — tail-call operator delete on `this`. Modeled as raising stub — no portable
    // TS binding for `::operator delete`.
    operatorDelete(this);
  }
}
