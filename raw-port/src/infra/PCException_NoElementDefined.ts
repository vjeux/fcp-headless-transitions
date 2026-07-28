// PCException_NoElementDefined.ts — ProCore's PCException_NoElementDefined,
// a concrete C++ exception subclass of PCException used to signal that a
// referenced XML/scene element was not defined. Transcribed from the
// disassembly of /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore.
//
// DECODE. All three methods below are transcribed one-for-one from the ASM
// (see raw-port/re/disasm/ProCore.PCException_NoElementDefined.*.s). Every
// method cites its @0xADDR in ProCore; every callee is resolved by name
// from /tmp/ProCore_symmap.tsv; every hex offset is a byte offset read
// directly out of the assembly.
//
// Unlike PCNullPointerException (which had separate C1/C2, D0/D1 aliases
// and overrode className()), the compiler collapsed this class down to
// the minimum three symbols:
//     PCException_NoElementDefined::PCException_NoElementDefined()     [C1] @0x2da18
//     PCException_NoElementDefined::~PCException_NoElementDefined()    [D1] @0x2da38
//     PCException_NoElementDefined::~PCException_NoElementDefined()    [D0] @0x2e6ac
// No C2 alias exists (`nm` confirms — only C1); the base ctor
// PCException::PCException() is called directly from C1. No className()
// override is emitted — this class inherits className() from the base.
// The class's identity is carried entirely by its vtable pointer and
// typeinfo `__ZTI28PCException_NoElementDefined` (referenced from typeid
// contexts at 0xdd665).
//
// STRUCT LAYOUT (recovered from ctor @0x2da18).
//   PCException_NoElementDefined derives from PCException with no new
//   fields:
//     +0x00  vtbl : *const void   // installed by C1 at @0x2da2d — the
//                                 // pointer written is 0x149d70 (the
//                                 // address of the *0x00 slot within
//                                 // this class's vtable).
//     +0x08... PCException's own fields (undecoded here — porting deferred).
//
// The C1 body is a NO-ARG ctor: r14 is never touched, so unlike
// PCNullPointerException there is no `addCallStackSymbols` branch —
// this exception NEVER captures call stack symbols eagerly. That's a
// real semantic difference decoded from the asm, not a simplification.

// ── Frontier: undecoded base class ────────────────────────────────────
// These are stubs for symbols this class calls into but that have not
// yet been transcribed. Each stub throws citing its @0xADDR so
// `frontier.py` can enumerate the gaps.

/** PCException::PCException() @ProCore 0x??? — not yet transcribed.
 *  Called from PCException_NoElementDefined::PCException_NoElementDefined()
 *  @0x2da21 to initialize the base class. Deferred to the PCException
 *  port. */
function pcException_base_ctor_stub(_self: PCException_NoElementDefined): void {
  throw new Error(
    "PCException::PCException() @ProCore 0x??? not yet transcribed — reached from PCException_NoElementDefined::PCException_NoElementDefined @0x2da21",
  );
}

/** PCException::~PCException() @ProCore 0x??? — not yet transcribed.
 *  Called from PCException_NoElementDefined::~PCException_NoElementDefined()
 *  D1 @0x2da3d (as a jmp trampoline) and from the D0 @0x2e6b5. Deferred. */
function pcException_base_dtor_stub(_self: PCException_NoElementDefined): void {
  throw new Error(
    "PCException::~PCException() @ProCore 0x??? not yet transcribed — reached from PCException_NoElementDefined::~PCException_NoElementDefined @0x2da3d/@0x2e6b5",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv) — jumped to as a tail
 *  call from the deleting destructor D0 @0x2e6c3. Modeled as a no-op in
 *  a GC'd runtime, but expressed here so the control flow matches the
 *  disasm exactly. Not a decode of the C++ runtime symbol. */
function operator_delete_stub(_this: PCException_NoElementDefined): void {
  // GC'd runtime — no explicit free. Faithful to the tail-call jmp at
  // 0x2e6c3 (`jmp 0xde6c0  ## symbol stub for: __ZdlPv`).
}

// ── The installed vtable pointer written into `(this)` by C1 ──────────
// From the ctor at 0x2da26 `leaq 0x11c343(%rip), %rax` (RIP=0x2da2d) →
// target = 0x2da2d + 0x11c343 = 0x149d70. This is the "installed vptr",
// i.e. the address of slot *0x00 within the vtable for this class
// (whose vtable base sits at 0x149d70 - 0x10 = 0x149d60 in __DATA,
// followed by the "offset-to-top" (0) and "typeinfo pointer"
// __ZTI28PCException_NoElementDefined). Modeled as a numeric constant
// preserving provenance — the exact bytes are ProCore-internal; the
// identity is what matters.
const _pc_no_element_defined_installed_vptr = 0x149d70; // @0x2da26 lea + RIP 0x2da2d + 0x11c343

// ── The class ─────────────────────────────────────────────────────────

/** PCException_NoElementDefined — thrown to signal a reference to an
 *  XML/scene element that has no defining declaration in scope. Concrete
 *  subclass of PCException; inherits all of what()/className()/
 *  callStackSymbols()/report() unmodified. */
export class PCException_NoElementDefined {
  /** +0x00 vtbl. The "installed vtable pointer" written by the ctor.
   *  See `_pc_no_element_defined_installed_vptr` above (@ProCore 0x149d70). */
  vtbl: number = 0;

  /** PCException_NoElementDefined::PCException_NoElementDefined() —
   *  the C1 ctor @ProCore 0x2da18. Faithful transcription of:
   *
   *    0x2da18  pushq  %rbp
   *    0x2da19  movq   %rsp, %rbp
   *    0x2da1c  pushq  %rbx
   *    0x2da1d  pushq  %rax                     ; align stack
   *    0x2da1e  movq   %rdi, %rbx               ; rbx = this
   *    0x2da21  callq  __ZN11PCExceptionC2Ev    ; PCException::PCException()
   *    0x2da26  leaq   0x11c343(%rip), %rax     ; rax = 0x149d70 (installed vptr)
   *    0x2da2d  movq   %rax, (%rbx)             ; (this)+0x00 = vptr
   *    0x2da30  addq   $0x8, %rsp
   *    0x2da34  popq   %rbx
   *    0x2da35  popq   %rbp
   *    0x2da36  retq
   *
   *  No boolean argument (r14 untouched — this differs from
   *  PCNullPointerException(bool), which conditionally captured stack
   *  symbols). No exception cleanup landing pad either — the compiler
   *  emitted the minimal shape: base ctor, install vptr, return.
   */
  constructor() {
    // 0x2da21 — PCException::PCException() (base ctor, undecoded stub).
    pcException_base_ctor_stub(this);
    // 0x2da26/0x2da2d — install the vtable pointer at (this)+0x00.
    this.vtbl = _pc_no_element_defined_installed_vptr;
    // 0x2da36 — return.
  }

  /** PCException_NoElementDefined::~PCException_NoElementDefined() — the
   *  D1 (non-deleting / complete-object in-place) destructor @ProCore
   *  0x2da38. Pure trampoline:
   *
   *    0x2da38  pushq %rbp
   *    0x2da39  movq  %rsp, %rbp
   *    0x2da3c  popq  %rbp
   *    0x2da3d  jmp   __ZN11PCExceptionD2Ev   ; PCException::~PCException()
   *
   *  It simply tail-calls the base destructor; no subclass fields to
   *  finalize (there are none beyond the vptr, which is not "owned"). */
  destroy_D1(): void {
    // 0x2da3d — jmp PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
  }

  /** PCException_NoElementDefined::~PCException_NoElementDefined() —
   *  the D0 (deleting) destructor @ProCore 0x2e6ac. Runs the base dtor,
   *  then tail-jumps to `operator delete(void*)`:
   *
   *    0x2e6ac  pushq %rbp
   *    0x2e6ad  movq  %rsp, %rbp
   *    0x2e6b0  pushq %rbx
   *    0x2e6b1  pushq %rax                        ; align stack
   *    0x2e6b2  movq  %rdi, %rbx                  ; rbx = this
   *    0x2e6b5  callq __ZN11PCExceptionD2Ev       ; PCException::~PCException()
   *    0x2e6ba  movq  %rbx, %rdi                  ; rdi = this (for op delete)
   *    0x2e6bd  addq  $0x8, %rsp
   *    0x2e6c1  popq  %rbx
   *    0x2e6c2  popq  %rbp
   *    0x2e6c3  jmp   0xde6c0                     ; symbol stub for: __ZdlPv
   *                                               ;   -> operator delete(void*)
   *
   *  Standard Itanium C++ ABI D0 shape: run in-place destructor (which
   *  for this class means directly base D2 — see D1 collapse note in
   *  PCNullPointerException.ts for the same idiom), then
   *  `operator delete(this)`.
   */
  destroy_D0(): void {
    // 0x2e6b5 — call PCException::~PCException() (undecoded stub).
    pcException_base_dtor_stub(this);
    // 0x2e6c3 — tail jmp to operator delete(this) (GC'd runtime no-op).
    operator_delete_stub(this);
  }
}
