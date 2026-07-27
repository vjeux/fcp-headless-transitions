// FFWithEnableUndoRegistration.ts — RAII scope guard that ENABLES NSUndoManager registration
// for the lifetime of the object (ctor pushes an "enable" onto an internal stack via
// FFWithEnableUndoRegistrationPush(mgr, 1); dtor pops it via FFWithEnableUndoRegistrationPop(mgr, 1)
// AND objc_release()s the retained manager). Faithfully transcribed from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly saved at raw-port/re/disasm/Flexo.FFWithEnableUndoRegistration.*.s
//
// This is the enable-side sibling of FFWithDisableUndoRegistration. The two classes are
// byte-identical except for the second argument passed to the Push/Pop primitives:
//   FFWithDisableUndoRegistration  -> Push/Pop(mgr, 0)   (movl $0x0 == xorl %esi,%esi)
//   FFWithEnableUndoRegistration   -> Push/Pop(mgr, 1)   (movl $0x1, %esi)
// The `0`/`1` flag is the enable/disable selector consumed inside
// FFWithEnableUndoRegistrationPush/Pop (undecoded — Rule 3 forbids inventing its exact semantics).
//
// Class has NO vtable, ONE instance field, and three methods (matching the two-symbol Itanium ABI
// duplicate-dtor convention D1 / D2 which are byte-identical here modulo RIP offsets):
//   @Flexo 0x0000000000486080  FFWithEnableUndoRegistration::FFWithEnableUndoRegistration(NSUndoManager*)   (C1==C2)
//   @Flexo 0x00000000004860b0  FFWithEnableUndoRegistration::~FFWithEnableUndoRegistration()                (D2 base)
//   @Flexo 0x00000000004860e0  FFWithEnableUndoRegistration::~FFWithEnableUndoRegistration()                (D1 complete)
// The C1/C2 mangled symbols point to the SAME address (only C1 has a body in otool -tV; C2 has
// no distinct emitted body — the linker aliases C1 <- C2). D1 and D2 are two distinct but
// structurally identical bodies at 0x4860e0 and 0x4860b0 respectively.
//
// STRUCT LAYOUT (recovered from the ctor stores and dtor loads at (%rbx) / (%rdi)):
//   +0x00  undoManager   NSUndoManager* (id, retained; owning strong ref)
// Total sizeof = 8 bytes.  (Only one qword slot is written by the ctor and read by the dtors.)
//
// COUNTER LOGIC — precise semantics recovered from the asm:
//   Ctor:  this->undoManager = objc_retain(undoManager);
//          FFWithEnableUndoRegistrationPush(this->undoManager, 1);   // tail-called: `jmp` at 0x4860a3
//   Dtor:  objc_release(this->undoManager);                          // note: release BEFORE Pop
//          FFWithEnableUndoRegistrationPop(this->undoManager, 1);    // (this->undoManager is re-read
//                                                                    //  from (%rbx) at 0x4860c2/0x4860f2
//                                                                    //  AFTER release — the pointer is
//                                                                    //  still valid as a key because the
//                                                                    //  push has its own retain)
// The enable/disable counter itself lives inside FFWithEnableUndoRegistrationPush/Pop (a
// Flexo-internal per-NSUndoManager stack/refcount keyed on the manager); this class is JUST the
// RAII scope wrapper that brackets one push/pop pair for the lifetime of `this`. The `esi = 1`
// (movl $0x1, %esi) at 0x486098 / 0x4860c5 / 0x4860f5 is the second argument to Push/Pop —
// verbatim per the disasm. We do NOT invent a semantic name for that flag (its meaning is defined
// inside FFWithEnableUndoRegistrationPush, which is not yet decoded — Rule 3 forbids guessing).
//
// Exception path: both dtors have an unwind landing pad at +0x26/+0x56 that calls
// ___clang_call_terminate — i.e. if FFWithEnableUndoRegistrationPop throws, the process aborts
// (noexcept dtor convention). We surface that with a plain dispose() that lets any throw
// propagate; the JS host has no ___clang_call_terminate equivalent to emulate faithfully.

// ── Opaque forward types (Objective-C runtime classes / Flexo internals on the frontier) ─────
// NSUndoManager is an Objective-C class; from TypeScript we can only model it as an opaque
// pointer-typed handle. objc_retain / objc_release are the ARC runtime primitives that would
// balance the reference count in the real binary. Since the JS host has no Objective-C runtime,
// they are throwing stubs (Rule 3): any code path that actually reaches this class must supply
// concrete implementations.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NSUndoManager {}

// ── ObjC runtime callees (frontier). Cited call sites in Flexo. ────────────────
// callq *0x146767e(%rip)  @0x48608c  — dispatched via the lazy stub table (literal pool symbol
// address: _objc_retain). The `*` indicates an indirect call through a GOT/lazy-bind slot.
export function objc_retain(_obj: NSUndoManager): NSUndoManager {
  // @Flexo _objc_retain (called via indirect stub @0x48608c). not yet transcribed.
  throw new Error("objc_retain (callsite @0x48608c) not yet transcribed");
}
// callq *0x1467646(%rip)  @0x4860bc  (D2)  — _objc_release via indirect stub.
// callq *0x1467616(%rip)  @0x4860ec  (D1)  — _objc_release via indirect stub.
export function objc_release(_obj: NSUndoManager): void {
  // @Flexo _objc_release (call sites @0x4860bc and @0x4860ec). not yet transcribed.
  throw new Error("objc_release (callsites @0x4860bc / @0x4860ec) not yet transcribed");
}

// ── Undo-registration stack primitives (frontier). ──────────────────────────────
// These are the C entry points that actually maintain the enable/disable counter. This class is a
// thin RAII wrapper around one Push/Pop pair — the counter arithmetic itself is INSIDE Push/Pop.
// jmp _FFWithEnableUndoRegistrationPush  @0x4860a3  (tail call from ctor)
export function FFWithEnableUndoRegistrationPush(_mgr: NSUndoManager, _flag: number): void {
  // @Flexo _FFWithEnableUndoRegistrationPush (tail-called from ctor @0x4860a3). not yet transcribed.
  throw new Error("FFWithEnableUndoRegistrationPush (callsite @0x4860a3) not yet transcribed");
}
// callq _FFWithEnableUndoRegistrationPop   @0x4860ca  (D2)
// callq _FFWithEnableUndoRegistrationPop   @0x4860fa  (D1)
export function FFWithEnableUndoRegistrationPop(_mgr: NSUndoManager, _flag: number): void {
  // @Flexo _FFWithEnableUndoRegistrationPop (call sites @0x4860ca and @0x4860fa). not yet transcribed.
  throw new Error("FFWithEnableUndoRegistrationPop (callsites @0x4860ca / @0x4860fa) not yet transcribed");
}

// ─────────────────────────────────────────────────────────────────────────────
// FFWithEnableUndoRegistration — RAII scope guard.
//
// C++ usage in FCP is stack-scoped (`{ FFWithEnableUndoRegistration g(mgr); ... }`). TypeScript has
// no destructor; the faithful equivalent is a manual `dispose()` (called via try/finally or the
// `using` declaration) that runs the exact ~FFWithEnableUndoRegistration body. We do NOT auto-run
// it in a finalizer — that would be a semantic invention (garbage-collector timing ≠ scope exit).
// ─────────────────────────────────────────────────────────────────────────────
export class FFWithEnableUndoRegistration {
  /** +0x00  undoManager — retained NSUndoManager* installed by the ctor at (%rbx). */
  undoManager: NSUndoManager;

  /**
   * FFWithEnableUndoRegistration::FFWithEnableUndoRegistration(NSUndoManager*)
   * @Flexo 0x0000000000486080  (C1 aliased to C2 at the same address).
   *
   * Disassembly (verbatim, 0x486080..0x4860a3):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax        // frame + save %rbx (this)
   *   movq  %rdi,%rbx                                              // rbx = this
   *   movq  %rsi,%rdi                                              // rdi = undoManager (arg1)
   *   callq *0x146767e(%rip)   ## _objc_retain                     // rax = objc_retain(undoManager)
   *   movq  %rax,(%rbx)                                            // this->undoManager = rax   (+0x00)
   *   movq  %rax,%rdi                                              // rdi = this->undoManager
   *   movl  $0x1,%esi                                              // rsi = 1   (enable flag)
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp                      // epilogue (tail-call restore)
   *   jmp   _FFWithEnableUndoRegistrationPush                      // TAIL CALL Push(mgr, 1)
   */
  constructor(undoManager: NSUndoManager) {
    // 0x48608c + 0x486092 : this->undoManager = objc_retain(undoManager);
    this.undoManager = objc_retain(undoManager);
    // 0x486095..0x4860a3 : tail-call FFWithEnableUndoRegistrationPush(this->undoManager, 1);
    FFWithEnableUndoRegistrationPush(this.undoManager, 1);
  }

  /**
   * FFWithEnableUndoRegistration::~FFWithEnableUndoRegistration()
   * Faithful transcription of BOTH the D2 body @0x00000000004860b0 and the D1 body @0x00000000004860e0 —
   * they are byte-identical modulo the different indirect-stub RIP offsets for _objc_release
   * (D2: *0x1467646(%rip) ; D1: *0x1467616(%rip)). TypeScript has one class dtor equivalent, so we
   * expose ONE dispose() method that reproduces the shared body.
   *
   * Disassembly (verbatim, D1 at 0x4860e0..0x48610e; D2 mirror at 0x4860b0..0x4860de):
   *   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax        // frame + save %rbx (this)
   *   movq  %rdi,%rbx                                              // rbx = this
   *   movq  (%rdi),%rdi                                            // rdi = this->undoManager
   *   callq *0x1467616(%rip)   ## _objc_release                    // objc_release(this->undoManager)
   *   movq  (%rbx),%rdi                                            // rdi = this->undoManager (re-read)
   *   movl  $0x1,%esi                                              // rsi = 1   (enable flag)
   *   callq _FFWithEnableUndoRegistrationPop                       // Pop(mgr, 1)
   *   addq  $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   *   // unwind landing pad:
   *   movq  %rax,%rdi ; callq ___clang_call_terminate              // noexcept: abort on Pop throw
   */
  dispose(): void {
    // 0x4860e9 + 0x4860ec (D1) / 0x4860b9 + 0x4860bc (D2):
    //   rdi = this->undoManager ; objc_release(rdi)
    objc_release(this.undoManager);
    // 0x4860f2..0x4860fa (D1) / 0x4860c2..0x4860ca (D2):
    //   rdi = this->undoManager (RE-READ from (%rbx) after release) ; rsi = 1 ; Pop(mgr, 1)
    FFWithEnableUndoRegistrationPop(this.undoManager, 1);
  }
}
