// PCRecursiveMutex.ts — ProCore-style recursive mutex used across Flexo,
// modelled here as a thin subclass of PCMutex. The Flexo symbol table
// exposes exactly the destructor pair for this class; no ctor and no
// virtual functions are emitted here, so the entire recovered contract
// is "destroying an instance is exactly destroying its PCMutex base
// sub-object, then freeing the outer allocation (D0 only)".
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// DECODE. Both methods below are transcribed one-for-one from the ASM.
// Every method cites its @0xADDR in Flexo; every callee is resolved by
// symbol name; every offset is read directly from the assembly.
//
// STRUCT LAYOUT (recovered from the two dtors — the sole methods on this
// symbol table entry):
//   +0x00  ... PCMutex-owned         // whatever PCMutex stores; NEITHER
//                                    //   dtor touches any offset within
//                                    //   this object beyond passing
//                                    //   `this` (rdi) verbatim to
//                                    //   PCMutex::~PCMutex.
//   PCRecursiveMutex adds NO fields of its own that are visible in these
//   two dtors: no vtbl-slot install at +0x00 (unlike, e.g.,
//   FFNSObjectStorage3), no accessor stores, no field reads. Its
//   __ZTV16PCRecursiveMutex exists at Flexo 0x1926840, but neither dtor
//   writes it into `(this)` — so either the vptr install lives in the
//   (undecoded) ctor, or the class has no virtual method that overrides
//   PCMutex's. We do NOT invent a vptr field here.

// ── Frontier: undecoded companion types ─────────────────────────────────
// PCMutex is the base class; its destructor is called via a Flexo __stub
// (`_ZN7PCMutexD2Ev` @Flexo 0x1496cf6). Neither PCMutex itself nor its
// dtor is transcribed here — porting deferred to whoever ports PCMutex.

/** PCMutex::~PCMutex(this) @Flexo stub 0x1496cf6 (`_ZN7PCMutexD2Ev`) —
 *  the base sub-object destructor. Called via `jmp` (D1 @0x12ffd55) or
 *  `callq` (D0 @0x12ffd99). Undecoded here. */
function PCMutex_base_dtor_stub(_self: PCRecursiveMutex): void {
  throw new Error(
    "PCMutex::~PCMutex() @Flexo 0x1496cf6 (stub) not yet transcribed",
  );
}

/** C++ `operator delete(void*)` @Flexo stub 0x1497404 (`_ZdlPv`). Called
 *  as the tail-jmp of the deleting dtor D0 @0x12ffda7 to free the outer
 *  allocation. Undecoded here. */
function operator_delete_stub(_self: PCRecursiveMutex): void {
  throw new Error(
    "operator delete(void*) @Flexo 0x1497404 (stub) not yet transcribed",
  );
}

/**
 * `PCRecursiveMutex` — a thin PCMutex subclass. The recovered contract
 * from Flexo covers only its destructor pair; ctor + any accessors are
 * frontier.
 */
export class PCRecursiveMutex {
  /**
   * `PCRecursiveMutex::~PCRecursiveMutex()` @Flexo 0x12ffd50 (D1,
   * non-deleting / base-object dtor).
   *
   * Disasm (all @Flexo):
   *   0x12ffd50  push rbp
   *   0x12ffd51  mov  rbp, rsp
   *   0x12ffd54  pop  rbp
   *   0x12ffd55  jmp  0x1496cf6            ; tail-jmp PCMutex::~PCMutex(this)
   *   0x12ffd5a  nopw [rax+rax]            ; padding
   *
   * i.e. D1 is a plain trampoline: it establishes/restores rbp for the
   * ABI and then tail-jmps straight into PCMutex's D2 destructor with
   * the same `this` (rdi) it received. No fields of this class are
   * touched — the entire body is the base-class dtor call.
   */
  dispose(): void {
    // @0x12ffd55: tail-jmp to PCMutex::~PCMutex(this).
    PCMutex_base_dtor_stub(this);
  }

  /**
   * `PCRecursiveMutex::~PCRecursiveMutex()` @Flexo 0x12ffd90 (D0,
   * deleting dtor). Runs the base destructor, then tail-jmps to
   * `operator delete(this)`.
   *
   * Disasm (all @Flexo):
   *   0x12ffd90  push rbp / mov rbp,rsp / push rbx / push rax
   *   0x12ffd96  mov  rbx, rdi                  ; rbx = this
   *   0x12ffd99  callq 0x1496cf6                ; PCMutex::~PCMutex(this)
   *   0x12ffd9e  mov  rdi, rbx
   *   0x12ffda1  add  rsp, 0x8 / pop rbx / pop rbp
   *   0x12ffda7  jmp  0x1497404                 ; tail-jmp operator delete(this)
   *   0x12ffdac  addb al, [rax]                 ; padding
   *   0x12ffdae  addb al, [rax]                 ; padding
   *
   * There is no cleanup landing pad emitted here (no `__clang_call_terminate`
   * epilogue), which is consistent with PCMutex::~PCMutex being marked
   * `noexcept`.
   */
  dispose_and_delete(): void {
    // @0x12ffd99: run the base sub-object dtor.
    PCMutex_base_dtor_stub(this);

    // @0x12ffda7: tail-jmp to operator delete(this).
    operator_delete_stub(this);
  }
}
