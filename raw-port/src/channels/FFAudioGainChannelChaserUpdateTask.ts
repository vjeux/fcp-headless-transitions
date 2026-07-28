// FFAudioGainChannelChaserUpdateTask — Flexo.framework wrapper task. This is
// the "update-task" façade that ships as a tiny 5-method class over an owned
// (or referenced) `FFAudioGainChannelChaser*` at offset +0x10:
//
//   - performTask():              (*this+0x10).performUpdateTask()   (tail-jmp)
//   - getTaskReference():         return *(this+0x10)                (raw ptr)
//   - taskIdentifier() const:     return &"FFAudioGainChannelChaserUpdateTask"
//                                   (a plain C string in __TEXT/__cstring)
//   - ~...UpdateTask() [D1]:      trivial (no members owned by this class)
//   - ~...UpdateTask() [D0]:      tail-jmp operator delete(this)
//
// Framework: Final Cut Pro / Flexo.framework.
//
// Exported symbols (nm evidence from FCP-shipped Flexo x86_64 slice; note the
// mangler uses length prefix "34" because the class name is 34 chars, not
// 33 — brief.py's "5 methods" count reads the count from claim.py, not from
// nm, so the mangling has to be manually computed):
//
//   0000000000e63c60 t __ZN34FFAudioGainChannelChaserUpdateTaskD1Ev
//   0000000000e63c70 t __ZN34FFAudioGainChannelChaserUpdateTaskD0Ev
//   0000000000e63c80 t __ZN34FFAudioGainChannelChaserUpdateTask11performTaskEv
//   0000000000e63c90 t __ZN34FFAudioGainChannelChaserUpdateTask16getTaskReferenceEv
//   0000000000e63ca0 t __ZNK34FFAudioGainChannelChaserUpdateTask14taskIdentifierEv
//   0000000001918008 s __ZTV34FFAudioGainChannelChaserUpdateTask
//   0000000001918050 s __ZTI34FFAudioGainChannelChaserUpdateTask
//
// This is one of Flexo's "Update Task" pattern classes. The class exposes 3
// virtual overrides (performTask/getTaskReference/taskIdentifier) plus the
// D0/D1 pair, all wired up in the vtable at 0x1918008. It has ONE observed
// data member: an `FFAudioGainChannelChaser*` at +0x10. The D1 dtor is a
// no-op (pushq %rbp; popq %rbp; retq — the compiler emits a frame even for
// nothing, presumably so unwind tables cover it), which means this class
// does NOT own the chaser (no delete/release of +0x10 in D1). It's a
// non-owning reference.
//
// Layout inferred:
//   +0x00 vptr (installed by the ctor family — not exported into our slice)
//   +0x08 (unused / base-class scratch — task base class most likely)
//   +0x10 FFAudioGainChannelChaser* (non-owning) — read by performTask and
//                                                  getTaskReference
//
// Source disassembly committed under
//   raw-port/re/disasm/Flexo.FFAudioGainChannelChaserUpdateTask.<method>.s
//
// Full disasm (all five methods — they're all tiny):
//
// (D1 — complete-object dtor)
//   __ZN34FFAudioGainChannelChaserUpdateTaskD1Ev:
//     0xe63c60 pushq %rbp
//     0xe63c61 movq  %rsp, %rbp
//     0xe63c64 popq  %rbp
//     0xe63c65 retq
//     0xe63c66 nopw  %cs:(%rax,%rax)                    ; alignment padding
//
// (D0 — deleting dtor)
//   __ZN34FFAudioGainChannelChaserUpdateTaskD0Ev:
//     0xe63c70 pushq %rbp
//     0xe63c71 movq  %rsp, %rbp
//     0xe63c74 popq  %rbp
//     0xe63c75 jmp   0x1497404 (operator delete(void*) == __ZdlPv)
//     0xe63c7a nopw  (%rax,%rax)                        ; alignment padding
//
// (performTask — virtual override)
//   __ZN34FFAudioGainChannelChaserUpdateTask11performTaskEv:
//     0xe63c80 pushq %rbp
//     0xe63c81 movq  %rsp, %rbp
//     0xe63c84 movq  0x10(%rdi), %rdi                   ; rdi = this->chaser
//     0xe63c88 popq  %rbp
//     0xe63c89 jmp   0xe62e00 (FFAudioGainChannelChaser::performUpdateTask())
//     0xe63c8e nop
//
// (getTaskReference — virtual override; returns void*)
//   __ZN34FFAudioGainChannelChaserUpdateTask16getTaskReferenceEv:
//     0xe63c90 pushq %rbp
//     0xe63c91 movq  %rsp, %rbp
//     0xe63c94 movq  0x10(%rdi), %rax                   ; rax = this->chaser
//     0xe63c98 popq  %rbp
//     0xe63c99 retq                                     ; return chaser (raw ptr)
//     0xe63c9a nopw  (%rax,%rax)                        ; padding
//
// (taskIdentifier — virtual override; returns char const*)
//   __ZNK34FFAudioGainChannelChaserUpdateTask14taskIdentifierEv:
//     0xe63ca0 pushq %rbp
//     0xe63ca1 movq  %rsp, %rbp
//     0xe63ca4 leaq  0x801e32(%rip), %rax               ; @0x1665add
//                                                        = "FFAudioGainChannelChaserUpdateTask"
//                                                          (35B including NUL)
//     0xe63cab popq  %rbp
//     0xe63cac retq
//     0xe63cad nopl  (%rax)                             ; padding
//
// RIP-relative constants (raw bytes from /tmp/Flexo.x86_64):
//   @0x1665add (35B, leaq @0xe63ca4) = "FFAudioGainChannelChaserUpdateTask\0"
//                                       (the class-name string; ASCII).
//
// Callees:
//   0x00e62e00  -> FFAudioGainChannelChaser::performUpdateTask()  (Flexo internal — no stub)
//   0x01497404  -> operator delete(void*)                          (__ZdlPv — libc++abi stub)

// -----------------------------------------------------------------------------
// External stubs. Each throw carries an @0xADDR on the same line (P4).
// -----------------------------------------------------------------------------

// FFAudioGainChannelChaser::performUpdateTask() — internal Flexo call target
// of the performTask tail-jmp. Un-ported. Stub — no body yet @0x00e62e00.
function FFAudioGainChannelChaser_performUpdateTask(_chaser: FFAudioGainChannelChaser): void {
  throw new Error(
    "FFAudioGainChannelChaser::performUpdateTask() has no body yet @0x00e62e00 (internal Flexo call)",
  );
}

// libc++abi operator delete(void*) — target of the D0 tail-jmp. Un-ported.
// Stub — no body yet @0x01497404 (__ZdlPv).
function operator_delete_void(_p: FFAudioGainChannelChaserUpdateTask): void {
  throw new Error("operator delete(void*) has no body yet @0x01497404 (__ZdlPv)");
}

// -----------------------------------------------------------------------------
// Static rodata — verbatim byte-level.
// -----------------------------------------------------------------------------

//
// @const 0x1665add — 35-byte C string "FFAudioGainChannelChaserUpdateTask\0".
// This is the value returned by taskIdentifier(). In C++ it's a pointer to a
// bytes-in-__TEXT/__cstring buffer; in TS we surface the JS-string form.
//
const TASK_IDENTIFIER_STRING = "FFAudioGainChannelChaserUpdateTask";

// -----------------------------------------------------------------------------
// Forward declarations for un-ported classes.
// -----------------------------------------------------------------------------

// Nominal handle for FFAudioGainChannelChaser* (the +0x10 member).
export interface FFAudioGainChannelChaser {
  readonly __brand: "FFAudioGainChannelChaser";
}

// -----------------------------------------------------------------------------
// FFAudioGainChannelChaserUpdateTask
// -----------------------------------------------------------------------------

//
// A Flexo "update task" façade over an FFAudioGainChannelChaser*. Non-owning:
// D1 does no cleanup of the +0x10 member (see class-level comment). We model
// just the byte-visible +0x10 field.
//
export class FFAudioGainChannelChaserUpdateTask {
  // +0x00 vptr — installed by the ctor family (not exported in this slice).
  // Modeled as a nominal string so it's byte-visible without misleading
  // TS-level typing.
  public vptr: string = "FFAudioGainChannelChaserUpdateTask::__vtable+0x10";

  // +0x10 — non-owning FFAudioGainChannelChaser*. Nullable to match how the
  // asm treats it (a raw pointer; no null-check on read paths).
  public chaser: FFAudioGainChannelChaser | null = null;

  //
  // performTask — virtual override. Tail-jmps to
  // FFAudioGainChannelChaser::performUpdateTask() with `this->chaser` as
  // the callee's `this`. No return value.
  //
  // @from FFAudioGainChannelChaserUpdateTask::performTask() @0xe63c80
  //
  performTask(): void {
    // @0xe63c84 — rdi = this->chaser
    const chaser = this.chaser;
    // @0xe63c89 — jmp FFAudioGainChannelChaser::performUpdateTask()
    //   The asm dereferences (rdi + 0x10) unconditionally; if chaser is
    //   null the callee receives null and will (per the callee's own
    //   contract) presumably crash. We preserve that behavior by passing
    //   the raw value through — the throwing stub itself will complain
    //   about being un-ported before any null-vs-non-null distinction
    //   matters.
    FFAudioGainChannelChaser_performUpdateTask(chaser as FFAudioGainChannelChaser);
  }

  //
  // getTaskReference — virtual override. Returns this->chaser (raw ptr).
  //
  // @from FFAudioGainChannelChaserUpdateTask::getTaskReference() @0xe63c90
  //
  getTaskReference(): FFAudioGainChannelChaser | null {
    // @0xe63c94 — rax = this->chaser
    return this.chaser;
    // @0xe63c99 — retq
  }

  //
  // taskIdentifier — virtual override (const). Returns a pointer to the
  // C string "FFAudioGainChannelChaserUpdateTask" at @0x1665add. In the TS
  // shim we surface the JS-string form; consumers that need the raw pointer
  // must look it up separately.
  //
  // @from FFAudioGainChannelChaserUpdateTask::taskIdentifier() const @0xe63ca0
  //
  taskIdentifier(): string {
    // @0xe63ca4 — leaq @0x1665add, %rax
    return TASK_IDENTIFIER_STRING;
    // @0xe63cac — retq
  }

  //
  // Complete-object destructor. TRULY EMPTY (asm is prologue+epilogue only,
  // no member cleanup). This confirms the class holds no owning resources —
  // the +0x10 chaser is a non-owning reference.
  //
  // @from FFAudioGainChannelChaserUpdateTask::~...UpdateTask() @0xe63c60 (D1)
  //
  destroy(): void {
    // @0xe63c60-0xe63c65 — pushq/popq %rbp; retq. Nothing to do.
  }

  //
  // Deleting dtor. As D1 is a no-op, D0 skips chaining it and goes straight
  // to `operator delete(this)`.
  //
  // @from FFAudioGainChannelChaserUpdateTask::~...UpdateTask() @0xe63c70 (D0)
  //
  destroyAndDelete(): void {
    // @0xe63c75 — jmp operator delete(this)
    operator_delete_void(this);
  }
}
