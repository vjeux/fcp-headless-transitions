// PCIllegalArgumentException.ts — FCP ProCore `PCIllegalArgumentException`:
// a concrete C++ exception subclass of PCException, thrown by ProCore for
// "an argument passed to an API is illegal" conditions. Transcribed 1:1
// from the disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Sibling of PCException_WriteError / PCException_ScopeUndefined / etc.
// (see raw-port/src/infra/PCException_*.ts). Structurally the class
// exports the same four Itanium-ABI symbols: C1 default-ctor, D1
// (complete-object dtor — thin trampoline into PCException::~PCException),
// D0 (deleting dtor — PCException::~PCException then operator delete),
// and a `className() const` override that returns a PCString containing
// "PCIllegalArgumentException".
//
// EXPORTED SYMBOLS (4 member functions of the class):
//   @ProCore 0x0000000000018036  PCIllegalArgumentException::PCIllegalArgumentException()  (C1 default ctor)
//   @ProCore 0x000000000002bf64  PCIllegalArgumentException::~PCIllegalArgumentException() (D1, in-place dtor — thin thunk)
//   @ProCore 0x000000000002bf70  PCIllegalArgumentException::~PCIllegalArgumentException() (D0, deleting dtor — jmp __ZdlPv)
//   @ProCore 0x000000000002c038  PCIllegalArgumentException::className() const
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   ProCore.PCIllegalArgumentException.PCIllegalArgumentException.s (C1 @0x18036..0x18054)
//   ProCore.PCIllegalArgumentException.~PCIllegalArgumentException.s (D0 @0x2bf70..0x2bf87)
//   ProCore.PCIllegalArgumentException.className.s                  (className @0x2c038..0x2c056)
//   D1 body @0x2bf64..0x2bf6d recovered directly from otool -tV
//     (`push rbp ; mov rsp,rbp ; pop rbp ; jmp __ZN11PCExceptionD2Ev`).
//
// SYMBOL TABLE EVIDENCE (nm -arch x86_64 on ProCore):
//   0x0000000000018036 T __ZN26PCIllegalArgumentExceptionC1Ev
//   0x000000000002bf64 t __ZN26PCIllegalArgumentExceptionD1Ev
//   0x000000000002bf70 t __ZN26PCIllegalArgumentExceptionD0Ev
//   0x000000000002c038 t __ZNK26PCIllegalArgumentException9classNameEv
//   0x0000000000149280 s __ZTV26PCIllegalArgumentException         (vtable base)
//   0x0000000000149280+0x10 = 0x149290                             (vfn-slot base
//                                                                    installed by C1)
//   0x0000000000002f88 t __ZN11PCExceptionC2Ev                     (base ctor — frontier)
//   0x000000000002c064 t __ZN11PCExceptionD2Ev                     (base dtor — frontier)
//   0x00000000000de6c0                                             (`__ZdlPv` operator-delete stub)
//
// ── STRUCT LAYOUT (this subclass adds NO new fields beyond the base) ──
//
//   The C1 body writes exactly one field of its own:
//
//     @0x18036  pushq %rbp
//     @0x18037  movq  %rsp, %rbp
//     @0x1803a  pushq %rbx
//     @0x1803b  pushq %rax                          ; align stack (scratch)
//     @0x1803c  movq  %rdi, %rbx                    ; save `this` in %rbx
//     @0x1803f  callq __ZN11PCExceptionC2Ev         ; PCException::PCException(this)
//     @0x18044  leaq  0x131245(%rip), %rax          ; RIP=0x1804b, target=0x149290
//                                                     = vtable_for_PCIllegalArgumentException + 0x10
//                                                     (the Itanium-ABI vfn-slot-base pointer,
//                                                      past +0=offset-to-top, +0x8=RTTI slot)
//     @0x1804b  movq  %rax, (%rbx)                  ; *this = 0x149290 (vptr overwrite)
//     @0x1804e..@0x18054  epilogue
//
//   i.e. C1 = chain to PCException default ctor, then OVERWRITE the vptr
//   with our own vtable-slot-base. No other fields are touched — this
//   subclass carries only the inherited PCException state (an optional
//   CFArrayRef, two PCStrings, a u32, and a std::string — see the
//   ProChannel-side PCException.ts for the base struct layout).
//
//   Layout summary:
//     +0x00  const void* __vptr    ; installed by C1 as 0x149290 (vfn-slot base
//                                    of vtable_for_PCIllegalArgumentException)
//     +0x08..+0x40  PCException base subobject fields (frontier — decoded in
//                                    the ProChannel-side PCException.ts; the
//                                    ProCore-side base implementation is not
//                                    yet transcribed).
//
//   sizeof: NOT directly provable from these four bodies alone (no
//   `movl $N, %edi ; callq operator new` inside any of them — allocation
//   is done at the throw site, not inside the ctor).
//
// ── D1 (in-place / complete-object dtor)  @0x2bf64..0x2bf6d ──────────
//   @0x2bf64  pushq %rbp
//   @0x2bf65  movq  %rsp, %rbp
//   @0x2bf68  popq  %rbp
//   @0x2bf69  jmp   __ZN11PCExceptionD2Ev          ; tail-call PCException::~PCException()
//
//   A pure trampoline: install/tear-down frame, then tail-jump into the
//   base PCException destructor. The subclass has no fields of its own
//   to clean up.
//
// ── D0 (deleting dtor)                    @0x2bf70..0x2bf87 ──────────
//   @0x2bf70  pushq %rbp
//   @0x2bf71  movq  %rsp, %rbp
//   @0x2bf74  pushq %rbx
//   @0x2bf75  pushq %rax                          ; align stack (scratch)
//   @0x2bf76  movq  %rdi, %rbx                    ; save `this` in %rbx
//   @0x2bf79  callq __ZN11PCExceptionD2Ev         ; PCException::~PCException(this)
//   @0x2bf7e  movq  %rbx, %rdi                    ; %rdi = this
//   @0x2bf81  addq  $0x8, %rsp
//   @0x2bf85  popq  %rbx
//   @0x2bf86  popq  %rbp
//   @0x2bf87  jmp   0xde6c0                       ; symbol stub for: __ZdlPv
//                                                   (operator delete(void*))
//
//   Runs the base dtor, then tail-jumps into operator delete to free the
//   heap-allocated exception object. The GC'd JS runtime has no explicit
//   free — we still transcribe the call for provenance.
//
// ── className() const                    @0x2c038..0x2c056 ──────────
//   @0x2c038  pushq %rbp
//   @0x2c039  movq  %rsp, %rbp
//   @0x2c03c  pushq %rbx
//   @0x2c03d  pushq %rax                          ; align stack (scratch)
//   @0x2c03e  movq  %rdi, %rbx                    ; save `this` in %rbx
//                                                   (this = returned PCString&)
//   @0x2c041  leaq  0x121070(%rip), %rsi          ; RIP=0x2c048, target=0x14d0b8
//                                                   = CFString literal:
//                                                     @"PCIllegalArgumentException"
//                                                     (len=0x1a=26, C-str at
//                                                      __TEXT,__cstring 0x131720)
//   @0x2c048  callq __ZN8PCStringC1EPK10__CFString ; PCString::PCString(this = %rdi,
//                                                                       s   = CFString*)
//   @0x2c04d  movq  %rbx, %rax                    ; return-value = out PCString&
//   @0x2c050  addq  $0x8, %rsp
//   @0x2c054  popq  %rbx
//   @0x2c055  popq  %rbp
//   @0x2c056  retq
//
//   Itanium-ABI hidden-out-pointer return: %rdi points at the caller's
//   PCString return slot; we construct a PCString in-place from the
//   __CFString literal "PCIllegalArgumentException" and return that slot's
//   address. The literal payload was verified by reading the __cfstring
//   entry at 0x14d0b8 (isa=___CFConstantStringClassReference, flags=0x7c8,
//   c-str ptr = 0x131720 → "PCIllegalArgumentException", length=0x1a=26)
//   in __DATA_CONST,__cfstring and the matching C-string at
//   __TEXT,__cstring 0x131720.
//
// UNDECODED CALLEES (each surfaced as a THROWing stub citing @0xADDR):
//   PCException::PCException() @ProCore 0x2f88 (called from C1 @0x1803f)
//   PCException::~PCException() (D2) @ProCore 0x2c064 (called from D1 @0x2bf69
//                                                       as a tail jmp, and from
//                                                       D0 @0x2bf79)
//   operator delete(void*)  @ProCore 0xde6c0 stub (tail-jumped from D0 @0x2bf87)
//
//   NOTE: the ProChannel-side PCException class is already transcribed in
//   raw-port/src/infra/PCException.ts, but that binary/framework is a
//   DIFFERENT copy of the same source: its symbol addresses are different
//   from ProCore's, and its C2 body (copy-ctor) is not the ProCore C2
//   default-ctor we chain into here. Rather than pretend they are the same
//   symbol, this file keeps the ProCore-side PCException edges as citation
//   throwing stubs — a decode-truthful frontier signal.

import { PCString } from "./PCString";

// ─────────────────────────────────────────────────────────────────────────────
// Undecoded frontier stubs (ProCore-side PCException — not yet transcribed).
// Each stub surfaces the decode gap with its exact @ProCore address.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PCException::PCException() @ProCore 0x2f88 [__ZN11PCExceptionC2Ev].
 * Called from PCIllegalArgumentException::PCIllegalArgumentException()
 * C1 @0x1803f to run base-class construction (install the PCException
 * vptr and initialize its own fields — CFArrayRef, two PCStrings,
 * a u32, and a std::string per the ProChannel-side sibling port).
 *
 * The ProCore-side default ctor body is not yet transcribed in this port
 * (see raw-port/src/infra/PCException.ts for the ProChannel-side C2
 * copy-ctor decode, which is a distinct symbol on a distinct binary).
 */
function pcException_ctor_ProCore_stub(_self: PCIllegalArgumentException): void {
  throw new Error(
    "PCException::PCException() @ProCore 0x2f88 not yet transcribed " +
      "(called from PCIllegalArgumentException::PCIllegalArgumentException() C1 @ProCore 0x1803f)"
  );
}

/**
 * PCException::~PCException() (D2) @ProCore 0x2c064 [__ZN11PCExceptionD2Ev].
 * Tail-called from PCIllegalArgumentException D1 @0x2bf69 (as a jmp trampoline)
 * and directly called from PCIllegalArgumentException D0 @0x2bf79 (before
 * the tail-jmp into operator delete).
 *
 * The ProCore-side dtor body is not yet transcribed in this port.
 */
function pcException_dtor_ProCore_stub(_self: PCIllegalArgumentException): void {
  throw new Error(
    "PCException::~PCException() (D2) @ProCore 0x2c064 not yet transcribed " +
      "(called from PCIllegalArgumentException D1 @ProCore 0x2bf69 and D0 @ProCore 0x2bf79)"
  );
}

/**
 * `operator delete(void*)` (libc++abi `__ZdlPv`) — jumped to as a tail
 * call from D0 @0x2bf87 (`jmp 0xde6c0 ## symbol stub for: __ZdlPv`).
 * The GC'd JS runtime has no explicit free; we transcribe the edge as
 * a no-op that preserves the exact control-flow shape of the disasm.
 * Not a decode of the C++ runtime symbol itself.
 */
function operator_delete_stub(_this: PCIllegalArgumentException): void {
  // no-op under a garbage-collected runtime.
  // Faithful to the tail-jmp at @0x2bf87 (`jmp 0xde6c0 ## __ZdlPv`).
}

// ─────────────────────────────────────────────────────────────────────────────
// The vtable-slot-base pointer that C1 installs into `(this)+0x00`.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Symbolic value of the vptr that
 * `PCIllegalArgumentException::PCIllegalArgumentException()` (C1 @0x18036)
 * writes into `*this`. Recovered from the asm at @0x18044..@0x1804b:
 *
 *     leaq 0x131245(%rip), %rax    ; RIP=0x1804b, target = 0x149290
 *     movq %rax, (%rbx)            ; *this = 0x149290
 *
 * i.e. the address of the first virtual-function-slot in the vtable
 * `__ZTV26PCIllegalArgumentException` at 0x149280, past the Itanium-ABI
 * +0=offset-to-top and +0x8=RTTI-pointer slots (so vptr = 0x149280 + 0x10).
 *
 * Used as a distinctive TS marker so that a fresh instance's `__vptr`
 * field is bit-identifiable in tests.
 */
export const PCIllegalArgumentException_vtable_slot_base = 0x149290;

/**
 * The literal CFString address referenced by `className()` @0x2c041:
 *
 *     leaq 0x121070(%rip), %rsi    ; RIP=0x2c048, target = 0x14d0b8
 *
 * A __CFConstantString entry in __DATA_CONST,__cfstring:
 *   isa    = ___CFConstantStringClassReference
 *   flags  = 0x07c8 (8-bit C-string, immutable)
 *   c-str  = 0x131720 → "PCIllegalArgumentException"
 *   length = 0x1a = 26 chars
 *
 * We surface the literal payload as a plain JS string; `className()`
 * builds a PCString from it (mirroring PCString(const __CFString*)).
 */
export const PCIllegalArgumentException_className_literal =
  "PCIllegalArgumentException";

// ─────────────────────────────────────────────────────────────────────────────
// PCIllegalArgumentException — concrete polymorphic subclass of PCException.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PCIllegalArgumentException — thrown by ProCore APIs when an argument is
 * illegal. Concrete: has a valid C1 default ctor, a D1/D0 dtor pair, and a
 * `className()` override returning the PCString "PCIllegalArgumentException".
 *
 * We model the class as its own TS class rather than extending an existing
 * TS `PCException` because the ProCore-side PCException default ctor and
 * D2 dtor are undecoded frontier — the sibling ProChannel-side PCException
 * is a different binary's copy of the same source and its addresses do not
 * apply here. The base subobject's state is intentionally opaque in this
 * port; only the C1 vptr-install, the D1/D0 tail-calls, and the className
 * literal are decoded from the four ProCore exports.
 */
export class PCIllegalArgumentException {
  /**
   * The vptr slot installed by C1 @0x1804b (`movq %rax, (%rbx)`).
   * Mirrors offset +0x00 of the C++ layout.
   */
  __vptr: number = PCIllegalArgumentException_vtable_slot_base;

  /**
   * PCIllegalArgumentException::PCIllegalArgumentException()  C1 — @ProCore 0x18036
   * [__ZN26PCIllegalArgumentExceptionC1Ev]
   *
   * Full disassembly (14-line otool dump; see
   *   raw-port/re/disasm/ProCore.PCIllegalArgumentException.PCIllegalArgumentException.s):
   *
   *   @0x18036  pushq %rbp
   *   @0x18037  movq  %rsp, %rbp
   *   @0x1803a  pushq %rbx
   *   @0x1803b  pushq %rax
   *   @0x1803c  movq  %rdi, %rbx                    ; save `this` in %rbx
   *   @0x1803f  callq __ZN11PCExceptionC2Ev         ; PCException::PCException(this)
   *   @0x18044  leaq  0x131245(%rip), %rax          ; = 0x149290 (vfn-slot base
   *                                                                of our vtable)
   *   @0x1804b  movq  %rax, (%rbx)                  ; *this = 0x149290
   *   @0x1804e  addq  $0x8, %rsp
   *   @0x18052  popq  %rbx
   *   @0x18053  popq  %rbp
   *   @0x18054  retq
   *
   * NB: unlike sibling exception subclasses whose C1 body chains to a
   * PCException(PCString const&) copy-ctor with a class-name literal,
   * THIS subclass chains to the plain PCException::PCException() default
   * ctor. The class-name literal only surfaces at className() call time.
   *
   * Since the base default ctor is not yet transcribed, invoking this
   * ctor surfaces the frontier via pcException_ctor_ProCore_stub. That
   * matches the porting spec's contract that undecoded callees are hard,
   * cited failures rather than silent no-ops.
   */
  constructor() {
    // @0x1803f — PCException::PCException(this) (base default ctor)
    pcException_ctor_ProCore_stub(this);
    // @0x18044..@0x1804b — install our vtable-slot-base pointer at *this
    this.__vptr = PCIllegalArgumentException_vtable_slot_base;
  }

  /**
   * PCIllegalArgumentException::~PCIllegalArgumentException()  D1 — @ProCore 0x2bf64
   * [__ZN26PCIllegalArgumentExceptionD1Ev]
   *
   * Full disassembly (raw bytes `55 48 89 e5 5d e9 <rel32>` per otool -tV):
   *
   *   @0x2bf64  pushq %rbp
   *   @0x2bf65  movq  %rsp, %rbp
   *   @0x2bf68  popq  %rbp
   *   @0x2bf69  jmp   __ZN11PCExceptionD2Ev         ; tail-call PCException::~PCException()
   *
   * A pure trampoline: prologue, restore frame, tail-jump into the base
   * PCException destructor. The subclass owns no fields of its own to
   * clean up — the vtable pointer is left as-is (the ABI does not
   * require the dtor to overwrite it) and the inherited PCException
   * fields are cleaned up by the base D2.
   */
  destroy_D1(): void {
    // @0x2bf69 — jmp __ZN11PCExceptionD2Ev  (tail call)
    pcException_dtor_ProCore_stub(this);
  }

  /**
   * PCIllegalArgumentException::~PCIllegalArgumentException()  D0 — @ProCore 0x2bf70
   * [__ZN26PCIllegalArgumentExceptionD0Ev]
   *
   * Full disassembly (12-line otool dump; see
   *   raw-port/re/disasm/ProCore.PCIllegalArgumentException.~PCIllegalArgumentException.s):
   *
   *   @0x2bf70  pushq %rbp
   *   @0x2bf71  movq  %rsp, %rbp
   *   @0x2bf74  pushq %rbx
   *   @0x2bf75  pushq %rax
   *   @0x2bf76  movq  %rdi, %rbx                    ; save `this` in %rbx
   *   @0x2bf79  callq __ZN11PCExceptionD2Ev         ; PCException::~PCException(this)
   *   @0x2bf7e  movq  %rbx, %rdi                    ; %rdi = this  (arg to delete)
   *   @0x2bf81  addq  $0x8, %rsp
   *   @0x2bf85  popq  %rbx
   *   @0x2bf86  popq  %rbp
   *   @0x2bf87  jmp   0xde6c0                       ; symbol stub for: __ZdlPv
   *                                                   (`operator delete(void*)`)
   *
   * Deleting destructor: run the base dtor, then tail-jump into
   * operator delete(this) to free the heap allocation. Under GC we
   * model the tail-jmp as a no-op edge for provenance.
   */
  destroy_D0(): void {
    // @0x2bf79 — call PCException::~PCException(this)
    pcException_dtor_ProCore_stub(this);
    // @0x2bf87 — jmp 0xde6c0 (__ZdlPv operator delete)
    operator_delete_stub(this);
  }

  /**
   * PCIllegalArgumentException::className() const — @ProCore 0x2c038
   * [__ZNK26PCIllegalArgumentException9classNameEv]
   *
   * Full disassembly (14-line otool dump; see
   *   raw-port/re/disasm/ProCore.PCIllegalArgumentException.className.s):
   *
   *   @0x2c038  pushq %rbp
   *   @0x2c039  movq  %rsp, %rbp
   *   @0x2c03c  pushq %rbx
   *   @0x2c03d  pushq %rax
   *   @0x2c03e  movq  %rdi, %rbx                    ; save out-PCString slot in %rbx
   *   @0x2c041  leaq  0x121070(%rip), %rsi          ; = 0x14d0b8 (CFString literal
   *                                                                @"PCIllegalArgumentException")
   *   @0x2c048  callq __ZN8PCStringC1EPK10__CFString ; PCString::PCString(this=%rdi, s=%rsi)
   *   @0x2c04d  movq  %rbx, %rax                    ; return-value = out-PCString slot
   *   @0x2c050  addq  $0x8, %rsp
   *   @0x2c054  popq  %rbx
   *   @0x2c055  popq  %rbp
   *   @0x2c056  retq
   *
   * Itanium-ABI hidden-out-pointer return: the caller allocates a
   * PCString slot and passes its address in %rdi; this function
   * constructs a PCString in-place from a __CFString literal and
   * returns the same address. We model that idiomatically in TS by
   * returning a fresh PCString whose payload is the decoded string
   * literal "PCIllegalArgumentException" (26 chars, 8-bit __cstring
   * at ProCore __TEXT,__cstring 0x131720; __cfstring entry at
   * __DATA_CONST,__cfstring 0x14d0b8).
   *
   * NB: the `this` parameter of the C++ method (the exception instance)
   * is passed in %rsi in the actual ABI — but @0x2c03e shows only %rdi
   * (out-slot) being saved; the `this` argument is never read here, i.e.
   * className() ignores its receiver and returns a constant literal. We
   * mirror that by ignoring `this` in the TS method body.
   */
  className(): PCString {
    // @0x2c041..@0x2c048 — construct PCString from __CFString literal
    //   @"PCIllegalArgumentException" @ProCore 0x14d0b8 (c-str at 0x131720).
    return new PCString(PCIllegalArgumentException_className_literal);
  }
}
