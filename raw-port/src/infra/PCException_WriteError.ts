// PCException_WriteError.ts — ProCore's PCException_WriteError, a concrete
// C++ exception subclass of PCException used to signal a stream/write
// error. Transcribed from the disassembly of /Applications/Final Cut
// Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
//
// DECODE. All three methods below are transcribed one-for-one from the
// ASM (see /tmp/ProCore_tV.txt for the source disassembly extract for
// each symbol). Every method cites its @0xADDR in ProCore; every callee
// is resolved by name from /tmp/ProCore_symmap.tsv; every hex offset is
// a byte offset read directly out of the assembly. There are the usual
// Itanium-C++-ABI aliases per ctor/dtor (C1/C2, D0/D1) — here C1 IS the
// base variant (no separate C2 emitted; nm shows only C1/D0/D1 for this
// class), D1 is a jmp trampoline to PCException::~PCException(), and D0
// is the DELETING destructor (dtor + operator delete).
//
// STRUCT LAYOUT (recovered from ctor @0x6a72 and vtable @0x148b08).
//   PCException_WriteError derives from PCException with no new fields
//   of its own — it merely installs its vtable pointer and delegates to
//   the inherited base for what()/className()/callStackSymbols()/
//   report():
//     +0x00  vtbl : *const void  // installed ptr = 0x148b18
//                                // (vtable base 0x148b08 + 0x10 typeinfo
//                                //  header; installed ptr points at
//                                //  slot *0x00 of the 6-slot vtable).
//     +0x08... PCException's own fields (undecoded here — porting deferred).
//
// VTABLE (resolved via `resolve.py ProCore vtable PCException_WriteError`,
//         installed ptr = 0x148b18):
//     *0x00 -> 0x6a92  PCException_WriteError::~PCException_WriteError() [D1]
//     *0x08 -> 0x6dc0  PCException_WriteError::~PCException_WriteError() [D0]
//     *0x10 -> 0x2bf8c PCException::what() const                         [inherited]
//     *0x18 -> 0x2f26  PCException::className() const                    [inherited]
//     *0x20 -> 0x2c058 PCException::callStackSymbols() const             [inherited]
//     *0x28 -> 0x2db8  PCException::report() const                       [inherited]
//
// Notably — unlike PCNullPointerException — this class does NOT override
// className(). Slot *0x18 points at the base PCException::className()
// @0x2f26 directly. So the runtime-reported class-name for a thrown
// PCException_WriteError is whatever PCException::className() returns
// (undecoded here). This is the observed reality of the vtable; we do
// not invent an override that isn't there.

// ── Frontier: undecoded base class ─────────────────────────────────────
// Stubs for symbols this class calls into but that have not yet been
// transcribed. Each stub throws citing its @0xADDR so `frontier.py`
// can enumerate the gaps.

/** PCException::PCException() @ProCore 0x??? — not yet transcribed.
 *  Called from PCException_WriteError::PCException_WriteError() C1
 *  @0x6a7b to initialize the base class. Deferred. */
function pcException_base_ctor_stub(_self: PCException_WriteError): void {
  throw new Error(
    "PCException::PCException() @ProCore 0x??? not yet transcribed",
  );
}

/** PCException::~PCException() @ProCore 0x??? — not yet transcribed.
 *  Called from PCException_WriteError::~PCException_WriteError() D1
 *  @0x6a97 (as a jmp trampoline) and from PCException_WriteError::
 *  ~PCException_WriteError() D0 @0x6dc9. Deferred. */
function pcException_base_dtor_stub(_self: PCException_WriteError): void {
  throw new Error(
    "PCException::~PCException() @ProCore 0x??? not yet transcribed",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv) — jumped to as a tail
 *  call from the deleting destructor D0 @0x6dd7. Modeled as a no-op in
 *  a GC'd runtime, but expressed here so the control flow matches the
 *  disasm exactly. Not a decode of the C++ runtime symbol. */
function operator_delete_stub(_this: PCException_WriteError): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0x6dd7 (`jmp 0xde6c0  ## symbol stub for: __ZdlPv`).
}

// ── The installed vtable pointer written into `(this)` by C1 ───────────
// From the ctor at 0x6a80 `leaq 0x142091(%rip), %rax` (RIP=0x6a87) →
// target = 0x6a87 + 0x142091 = 0x148b18. This is the "installed vptr",
// i.e. the address of slot *0x00 within the 6-slot vtable (vtable base
// 0x148b08, +0x10 typeinfo header).
const _pc_exception_write_error_installed_vptr = 0x148b18;

// ── The class ─────────────────────────────────────────────────────────

/** PCException_WriteError — thrown to signal a serializer/stream write
 *  error. Concrete subclass of PCException. Provides NO overrides of
 *  its own (all four virtual accessors are inherited via the vtable);
 *  its only distinguishing feature is the vtable pointer it installs
 *  in the object header, which distinguishes it from other PCException
 *  subclasses at RTTI time. */
export class PCException_WriteError {
  /** +0x00 vtbl. The "installed vtable pointer" written by the ctor.
   *  See `_pc_exception_write_error_installed_vptr` above
   *  (@ProCore 0x148b18). */
  vtbl: number = 0;

  /** PCException_WriteError::PCException_WriteError() — the C1
   *  (complete-object) ctor @ProCore 0x6a72. Faithful transcription of:
   *
   *    0x6a72  pushq  %rbp
   *    0x6a73  movq   %rsp, %rbp
   *    0x6a76  pushq  %rbx
   *    0x6a77  pushq  %rax
   *    0x6a78  movq   %rdi, %rbx           ; rbx = this
   *    0x6a7b  callq  __ZN11PCExceptionC2Ev ; PCException::PCException()
   *    0x6a80  leaq   0x142091(%rip), %rax  ; rax = 0x148b18 (installed vptr)
   *    0x6a87  movq   %rax, (%rbx)          ; (this)+0x00 = vptr
   *    0x6a8a  addq   $0x8,%rsp / popq %rbx / popq %rbp
   *    0x6a90  retq
   *
   *  Note: unlike PCNullPointerException, this ctor takes NO argument
   *  (there is no `bool addCallStackSymbols` parameter) and never calls
   *  PCException::addCallStackSymbols(). It is the minimal "install
   *  vtable" ctor. This is a direct read of the register usage: only
   *  %rdi (this) is consumed; no %esi/%rsi arg is touched. */
  constructor() {
    // 0x6a7b — PCException::PCException()  (base ctor, undecoded stub).
    pcException_base_ctor_stub(this);
    // 0x6a80/0x6a87 — install the vtable pointer at (this)+0x00.
    this.vtbl = _pc_exception_write_error_installed_vptr;
    // 0x6a90 — return.
  }

  /** PCException_WriteError::~PCException_WriteError() — the D1
   *  (non-deleting) destructor @ProCore 0x6a92. Pure trampoline:
   *
   *    0x6a92  pushq %rbp / movq %rsp,%rbp / popq %rbp
   *    0x6a97  jmp   __ZN11PCExceptionD2Ev   ; PCException::~PCException()
   *
   *  It simply tail-calls the base destructor; no subclass fields to
   *  finalize (there are none). */
  destroy_D1(): void {
    // 0x6a97 — jmp PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
  }

  /** PCException_WriteError::~PCException_WriteError() — the D0
   *  (deleting) destructor @ProCore 0x6dc0. Runs the base dtor, then
   *  tail-jumps to `operator delete(void*)`:
   *
   *    0x6dc0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
   *    0x6dc6  movq  %rdi, %rbx                    ; rbx = this
   *    0x6dc9  callq __ZN11PCExceptionD2Ev         ; ~PCException()
   *    0x6dce  movq  %rbx, %rdi
   *    0x6dd1  addq  $0x8, %rsp / popq %rbx / popq %rbp
   *    0x6dd7  jmp   __ZdlPv                       ; operator delete(void*)
   */
  destroy_D0(): void {
    // 0x6dc9 — call PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
    // 0x6dd7 — tail jmp to operator delete(this) (GC'd runtime no-op).
    operator_delete_stub(this);
  }
}
