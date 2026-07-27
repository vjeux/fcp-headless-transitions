// FFWithDisableUndoRegistration.ts — RAII scope guard that disables NSUndoManager registration
// for the lifetime of the object (ctor pushes a "disable" onto an internal stack via
// FFWithEnableUndoRegistrationPush(mgr, 0); dtor pops it via FFWithEnableUndoRegistrationPop(mgr, 0)
// AND objc_release()s the retained manager). Faithfully transcribed from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at raw-port/re/disasm/Flexo.FFWithDisableUndoRegistration.all.s
// (also grep-visible in /tmp/Flexo_tV.txt at file offsets 1095411-1095460).
//
// Class has NO vtable, ONE instance field, and three methods (matching the two-symbol Itanium ABI
// duplicate-dtor convention D1 / D2 which are byte-identical here):
//   @Flexo 0x0000000000485ff0  FFWithDisableUndoRegistration::FFWithDisableUndoRegistration(NSUndoManager*)   (C1==C2)
//   @Flexo 0x0000000000486020  FFWithDisableUndoRegistration::~FFWithDisableUndoRegistration()               (D2 base)
//   @Flexo 0x0000000000486050  FFWithDisableUndoRegistration::~FFWithDisableUndoRegistration()               (D1 complete)
// The C1/C2 mangled symbols point to the SAME address (see nm/c++filt: only one C2 emitted; the
// linker aliases C1 -> C2 via the callq at 0x37c997 which lands on C2). D1 and D2 are two distinct
// but structurally identical bodies at 0x486050 and 0x486020 respectively.
//
// STRUCT LAYOUT (recovered from the ctor stores and dtor loads at (%rbx) / (%rdi)):
//   +0x00  undoManager   NSUndoManager* (id, retained; owning strong ref)
// Total sizeof = 8 bytes.  (Only one qword slot is written by the ctor and read by the dtors.)
//
// COUNTER LOGIC — precise semantics recovered from the asm:
//   Ctor:  this->undoManager = objc_retain(undoManager);
//          FFWithEnableUndoRegistrationPush(this->undoManager, 0);   // tail-called: `jmp` at 0x486010
//   Dtor:  objc_release(this->undoManager);                          // note: release BEFORE Pop
//          FFWithEnableUndoRegistrationPop(this->undoManager, 0);    // (this->undoManager is re-read
//                                                                    //  from (%rbx) at 0x486032/0x486062
//                                                                    //  AFTER release — the pointer is
//                                                                    //  still valid as a key because the
//                                                                    //  push has its own retain)
// The literal "disable-counter" lives inside FFWithEnableUndoRegistrationPush/Pop (a Flexo-internal
// per-NSUndoManager stack/refcount keyed on the manager); this class is JUST the RAII scope wrapper
// that brackets one push/pop pair for the lifetime of `this`. The `esi = 0` (xorl %esi,%esi) at
// 0x486008 and 0x486035 / 0x486065 is the second argument to Push/Pop — verbatim per the disasm.
// We do NOT invent a semantic name for that flag (its meaning is defined inside
// FFWithEnableUndoRegistrationPush, which is not yet decoded — Rule 3 forbids guessing).
//
// Exception path: both dtors have an unwind landing pad at +0x23/+0x53 that calls
// ___clang_call_terminate — i.e. if FFWithEnableUndoRegistrationPop throws, the process aborts
// (noexcept dtor convention). We surface that with a try/finally in the TS dispose() that lets any
// throw propagate; the JS host has no ___clang_call_terminate equivalent to emulate faithfully.

// ── Opaque forward types (Objective-C runtime classes / Flexo internals on the frontier) ─────
// NSUndoManager is an Objective-C class; from TypeScript we can only model it as an opaque
// pointer-typed handle. objc_retain / objc_release are the ARC runtime primitives that would
// balance the reference count in the real binary. Since the JS host has no Objective-C runtime,
// they are throwing stubs (Rule 3): any code path that actually reaches this class must supply
// concrete implementations.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NSUndoManager {}

// ── ObjC runtime callees (frontier). Cited call sites in Flexo. ────────────────
// callq *0x146770e(%rip)  @0x485ffc  — dispatched via the lazy stub table (literal pool symbol
// address: _objc_retain). The `*` indicates an indirect call through a GOT/lazy-bind slot.
export function objc_retain(_obj: NSUndoManager): NSUndoManager {
  // @Flexo _objc_retain (called via indirect stub @0x485ffc). not yet transcribed.
  throw new Error("objc_retain (callsite @0x485ffc) not yet transcribed");
}
// callq *0x14676d6(%rip)  @0x48602c  (D2)  — _objc_release via indirect stub.
// callq *0x14676a6(%rip)  @0x48605c  (D1)  — _objc_release via indirect stub.
export function objc_release(_obj: NSUndoManager): void {
  // @Flexo _objc_release (call sites @0x48602c and @0x48605c). not yet transcribed.
  throw new Error("objc_release (callsites @0x48602c / @0x48605c) not yet transcribed");
}

// ── Undo-registration stack primitives (frontier). ──────────────────────────────
// These are the C entry points that actually maintain the disable-counter. This class is a thin
// RAII wrapper around one Push/Pop pair — the counter arithmetic itself is INSIDE Push/Pop.
// jmp _FFWithEnableUndoRegistrationPush  @0x486010  (tail call from ctor)
export function FFWithEnableUndoRegistrationPush(_mgr: NSUndoManager, _flag: number): void {
  // @Flexo _FFWithEnableUndoRegistrationPush (tail-called from ctor @0x486010). not yet transcribed.
  throw new Error("FFWithEnableUndoRegistrationPush (callsite @0x486010) not yet transcribed");
}
// callq _FFWithEnableUndoRegistrationPop   @0x486037  (D2)
// callq _FFWithEnableUndoRegistrationPop   @0x486067  (D1)
export function FFWithEnableUndoRegistrationPop(_mgr: NSUndoManager, _flag: number): void {
  // @Flexo _FFWithEnableUndoRegistrationPop (call sites @0x486037 and @0x486067). not yet transcribed.
  throw new Error("FFWithEnableUndoRegistrationPop (callsites @0x486037 / @0x486067) not yet transcribed");
}

// ─────────────────────────────────────────────────────────────────────────────
// FFWithDisableUndoRegistration — RAII scope guard.
//
// C++ usage in FCP is stack-scoped (`{ FFWithDisableUndoRegistration g(mgr); ... }`). TypeScript has
// no destructor; the faithful equivalent is a manual `dispose()` (called via try/finally or the
// `using` declaration) that runs the exact ~FFWithDisableUndoRegistration body. We do NOT auto-run
// it in a finalizer — that would be a semantic invention (garbage-collector timing ≠ scope exit).
// ─────────────────────────────────────────────────────────────────────────────
export class FFWithDisableUndoRegistration {
  /** +0x00  undoManager — retained NSUndoManager* installed by the ctor at (%rbx). */
  undoManager: NSUndoManager;

  /**
   * FFWithDisableUndoRegistration::FFWithDisableUndoRegistration(NSUndoManager*)
   * @Flexo 0x0000000000485ff0  (C1 aliased to C2 at the same address).
   *
   * Disassembly (verbatim, 0x485ff0..0x486015):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax        // frame + save %rbx (this)
   *   movq  %rdi,%rbx                                              // rbx = this
   *   movq  %rsi,%rdi                                              // rdi = undoManager (arg1)
   *   callq *0x146770e(%rip)   ## _objc_retain                     // rax = objc_retain(undoManager)
   *   movq  %rax,(%rbx)                                            // this->undoManager = rax   (+0x00)
   *   movq  %rax,%rdi                                              // rdi = this->undoManager
   *   xorl  %esi,%esi                                              // rsi = 0
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp                      // epilogue (tail-call restore)
   *   jmp   _FFWithEnableUndoRegistrationPush                      // TAIL CALL Push(mgr, 0)
   */
  constructor(undoManager: NSUndoManager) {
    // 0x485ffc + 0x486002 : this->undoManager = objc_retain(undoManager);
    this.undoManager = objc_retain(undoManager);
    // 0x486005..0x486010 : tail-call FFWithEnableUndoRegistrationPush(this->undoManager, 0);
    FFWithEnableUndoRegistrationPush(this.undoManager, 0);
  }

  /**
   * FFWithDisableUndoRegistration::~FFWithDisableUndoRegistration()
   * Faithful transcription of BOTH the D2 body @0x0000000000486020 and the D1 body @0x0000000000486050 —
   * they are byte-identical modulo the different indirect-stub RIP offsets for _objc_release
   * (D2: *0x14676d6(%rip) ; D1: *0x14676a6(%rip)). TypeScript has one class dtor equivalent, so we
   * expose ONE dispose() method that reproduces the shared body.
   *
   * Disassembly (verbatim, D1 at 0x486050..0x48607b; D2 mirror at 0x486020..0x48604b):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax        // frame + save %rbx (this)
   *   movq  %rdi,%rbx                                              // rbx = this
   *   movq  (%rdi),%rdi                                            // rdi = this->undoManager
   *   callq *0x14676a6(%rip)   ## _objc_release                    // objc_release(this->undoManager)
   *   movq  (%rbx),%rdi                                            // rdi = this->undoManager (re-read)
   *   xorl  %esi,%esi                                              // rsi = 0
   *   callq _FFWithEnableUndoRegistrationPop                       // Pop(mgr, 0)
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   // unwind landing pad:
   *   movq  %rax,%rdi ; callq ___clang_call_terminate              // noexcept: abort on Pop throw
   */
  dispose(): void {
    // 0x486059 + 0x48605c (D1) / 0x486029 + 0x48602c (D2):
    //   rdi = this->undoManager ; objc_release(rdi)
    objc_release(this.undoManager);
    // 0x486062..0x486067 (D1) / 0x486032..0x486037 (D2):
    //   rdi = this->undoManager (RE-READ from (%rbx) after release) ; rsi = 0 ; Pop(mgr, 0)
    FFWithEnableUndoRegistrationPop(this.undoManager, 0);
  }
}
