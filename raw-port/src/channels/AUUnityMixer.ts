// AUUnityMixer — Flexo AudioUnit-derived mixer.  Three methods are in scope
// for this port:
//   0x00000000012516d0  AUUnityMixer::Render(unsigned int&, AudioTimeStamp const&, unsigned int)
//   0x0000000001251790  AUUnityMixer::~AUUnityMixer()   (D1, complete-object)
//   0x00000000012517a0  AUUnityMixer::~AUUnityMixer()   (D0, deleting)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.AUUnityMixer.Render.s      (@0x12516d0)
//   raw-port/re/disasm/Flexo.AUUnityMixer.dtor_D1.s     (@0x1251790)
//   raw-port/re/disasm/Flexo.AUUnityMixer.dtor_D0.s     (@0x12517a0)
// Framework: Final Cut Pro / Flexo.framework.
//
// ── DECODED DATA (Render's InputBusHandler singleton) ──────────────────────
// Render's body is a 15-instruction thunk that hands three of its own
// arguments off to `AUMultiInputBase::RenderInputs`, wrapping them with a
// stack-owned `InputBusHandler*` slot that points to a static handler
// singleton in `__DATA_CONST,__const`:
//
//   RIP-relative LEA @0x12516e9 (`leaq 0x6cfa70(%rip), %rax`) targets
//   Flexo 0x1921160.  Reading 16 bytes there (via the fat-off + otool -l
//   section table, x86_64 arch @ fat offset 0x4000):
//     bytes: 10 17 25 01 00 00 10 00   80 17 25 01 00 00 10 00
//   Each 8-byte word is a chained-fixup encoding whose LOW 32 bits carry the
//   in-image function-pointer target (upper bits are dyld tag/inertia):
//     slot0  →  Flexo 0x1251710
//     slot1  →  Flexo 0x1251780
//   These are the two virtual-slot function pointers of `AUUnityMixer`'s
//   `InputBusHandler` implementation.  They sit BETWEEN the class's
//   `HandleActiveBus` (@0x12515e0, per the disasm of its symbol) and its
//   destructor (@0x1251790), which is consistent with them being the two
//   ABI-required trampolines that the InputBusHandler vtable dispatches
//   through — the exact function bodies aren't required for the port.  We
//   expose the singleton as an opaque handle with the two slot addresses
//   pinned in comments.
//
// ── FRONTIER CALLEES ───────────────────────────────────────────────────────
//   `AUMultiInputBase::RenderInputs(InputBusHandler*, unsigned int&,
//                                   AudioTimeStamp const&, unsigned int)`
//     — mangled `__ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj`
//     — call @0x12516f8.  Separate class' raw-port unit.
//   `AUMultiInputBase::~AUMultiInputBase()` — mangled `__ZN16AUMultiInputBaseD2Ev`
//     — tail-jmp @0x1251795 (D1) and call @0x12517a9 (D0).  Separate unit.
//   `operator delete(void*)` — Flexo stub 0x1497404 (`__ZdlPv`)
//     — tail-jmp @0x12517b7 (D0 only).
//
// The two destructors are the standard Itanium C++ ABI pair:
//   D1 — a two-instruction prologue-then-tail-jmp into the base's D2 dtor.
//        AUUnityMixer adds NO new fields on top of AUMultiInputBase; if it
//        did, D1 would zero/destruct them before the tail-jmp.
//   D0 — full body: call the base's D2, then tail-jmp into `operator delete`
//        with `%rdi = this`.  The two `pushq`/`addq $0x8,%rsp` and `pushq
//        %rbx / popq %rbx` around the call spill only for stack alignment
//        (D2 doesn't return anything of interest).

/**
 * Arguments to `Render` — mirror of `AUUnityMixer::Render(unsigned int&,
 * AudioTimeStamp const&, unsigned int)`.  The `unsigned int&` is a
 * caller-owned reference we model as a `{ value: number }` box; the
 * `AudioTimeStamp const&` and `unsigned int` are pass-through.  The types
 * `AudioTimeStamp` and `InputBusHandler` are opaque.
 */
export type AudioTimeStamp = { readonly __audioTimeStamp: unique symbol };

/**
 * Opaque handle for the InputBusHandler singleton — used only by
 * `AUMultiInputBase::RenderInputs`.  Layout is not decoded here; the two
 * function-pointer slots that inhabit it @0x1921160 are pinned in the
 * file-level comment above.
 */
export type InputBusHandler = { readonly __inputBusHandler: unique symbol };

/**
 * Marker for the `AUUnityMixer::BusHandler` static singleton that lives in
 * `__DATA_CONST,__const` at Flexo 0x1921160.  In C++ this is a global
 * variable; in the TS port it's exposed as a nominal-typed constant that
 * downstream callers can pass to `AUMultiInputBase::RenderInputs` without
 * needing to know its shape.
 */
export const AUUnityMixer_BusHandler_singleton: InputBusHandler = {
  // The value here is a placeholder — the runtime cannot manufacture the
  // real Flexo pointer.  A future port of the InputBusHandler class will
  // replace this with the actual singleton instance.
} as unknown as InputBusHandler;

// ── Frontier stubs ────────────────────────────────────────────────────────

/**
 * `AUMultiInputBase::RenderInputs(InputBusHandler*, unsigned int&,
 * AudioTimeStamp const&, unsigned int)` — mangled
 * `__ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj`
 * — call @Flexo 0x12516f8.  Not yet transcribed.
 */
function AUMultiInputBase_RenderInputs(
  _self: AUUnityMixer,
  _handler: InputBusHandler,
  _framesOut: { value: number },
  _ts: AudioTimeStamp,
  _numFrames: number,
): void {
  throw new Error(
    "AUUnityMixer::Render: AUMultiInputBase::RenderInputs @Flexo 0x12516f8 " +
      "(mangled __ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj) " +
      "not yet transcribed"
  );
}

/**
 * `AUMultiInputBase::~AUMultiInputBase()` (D2, base-object).  Called by
 *   • D1 @Flexo 0x1251795 (tail-jmp).
 *   • D0 @Flexo 0x12517a9 (direct call).
 * Not yet transcribed.
 */
function AUMultiInputBase_dtor_D2(_self: AUUnityMixer): void {
  throw new Error(
    "AUUnityMixer::~AUUnityMixer: AUMultiInputBase::~AUMultiInputBase (D2) @Flexo 0x1251795/0x12517a9 " +
      "(mangled __ZN16AUMultiInputBaseD2Ev) not yet transcribed"
  );
}

/**
 * `operator delete(void*)` — Flexo stub 0x1497404, tail-jmp @0x12517b7
 * from the D0 dtor only.  JS has GC; kept as a documented shim.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "AUUnityMixer::~AUUnityMixer (D0): operator delete @Flexo stub 0x1497404 " +
      "invoked from @0x12517b7 — not applicable in the TS port"
  );
}

// ── Class ─────────────────────────────────────────────────────────────────

/**
 * `AUUnityMixer` — a trivial AudioUnit derived from `AUMultiInputBase` that
 * adds NO new fields (both D1 and D0 immediately delegate to the base's D2
 * without any per-subclass cleanup).  The class body decoded here is
 * exactly the vtable-installed Render override plus the two dtors.  Any
 * field access lives in AUMultiInputBase's own port.
 */
export class AUUnityMixer {
  /**
   * `void AUUnityMixer::Render(unsigned int& framesOut, AudioTimeStamp
   * const& ts, unsigned int numFrames)` @Flexo 0x12516d0.
   *
   * Body:
   *   0x12516d0-0x12516d1  prologue (pushq %rbp; movq %rsp,%rbp)
   *   0x12516d4            subq $0x10,%rsp                     // 16 B stack
   *   0x12516d8            movl %ecx,%r8d                      // numFrames -> r8d
   *   0x12516db            movq %rdx,%rcx                      // ts       -> rcx
   *   0x12516de            movq %rsi,%rdx                      // framesOut-> rdx
   *   0x12516e1            movq $0x0,-0x8(%rbp)                // zero -0x8(%rbp)
   *   0x12516e9            leaq 0x6cfa70(%rip),%rax            // rax = &BusHandler_singleton
   *   0x12516f0            movq %rax,-0x10(%rbp)               // store &singleton at -0x10
   *   0x12516f4            leaq -0x10(%rbp),%rsi               // rsi = &stack slot
   *   0x12516f8            callq AUMultiInputBase::RenderInputs
   *   0x12516fd-0x1251702  epilogue.
   *
   * The `-0x8(%rbp) = 0` fill at 0x12516e1 is compiler-inserted padding —
   * `RenderInputs` sees only `%rsi = &-0x10(%rbp)` (a pointer TO the
   * pointer-to-singleton).  That is the C++ pass-by-reference marshalling
   * of `InputBusHandler* &` (or a `unique_ptr<InputBusHandler>*` — the
   * mangling here specifies `PNS_15InputBusHandler`, i.e. a plain pointer,
   * so the stack slot IS the pointer-to-pointer).
   *
   * We express this in TS by passing the singleton directly — the double-
   * indirection is a C++ ABI detail that has no TS equivalent.
   */
  Render(
    framesOut: { value: number },
    ts: AudioTimeStamp,
    numFrames: number,
  ): void {
    // @0x12516e9-@0x12516f0 — materialise the BusHandler singleton.  The
    // stack slot dance at 0x12516f4 (`leaq -0x10(%rbp), %rsi`) is C++'s way
    // of turning the singleton's address into a pointer-to-pointer as
    // required by RenderInputs' signature; in TS we drop the extra
    // indirection.
    const handler: InputBusHandler = AUUnityMixer_BusHandler_singleton;
    // @0x12516f8 — AUMultiInputBase::RenderInputs(this, &handler, framesOut, ts, numFrames).
    AUMultiInputBase_RenderInputs(this, handler, framesOut, ts, numFrames);
  }

  /**
   * `AUUnityMixer::~AUUnityMixer()` (D1, complete-object) @Flexo 0x1251790.
   *
   * Body (5 instructions total; no per-subclass cleanup):
   *   0x1251790  pushq %rbp
   *   0x1251791  movq  %rsp, %rbp
   *   0x1251794  popq  %rbp
   *   0x1251795  jmp   AUMultiInputBase::~AUMultiInputBase (D2)   // tail
   *   0x125179a  nopw  (%rax,%rax)                                // padding
   */
  destroy(): void {
    // @0x1251795 — direct tail-jmp to the base D2.
    AUMultiInputBase_dtor_D2(this);
  }

  /**
   * `AUUnityMixer::~AUUnityMixer()` (D0, deleting-dtor) @Flexo 0x12517a0.
   *
   * Body:
   *   0x12517a0  pushq %rbp
   *   0x12517a1  movq  %rsp, %rbp
   *   0x12517a4  pushq %rbx                             // %rbx callee-saved
   *   0x12517a5  pushq %rax                             // stack-align 16
   *   0x12517a6  movq  %rdi, %rbx                       // %rbx = this
   *   0x12517a9  callq AUMultiInputBase::~AUMultiInputBase (D2)
   *   0x12517ae  movq  %rbx, %rdi                       // %rdi = this
   *   0x12517b1  addq  $0x8, %rsp                       // undo the align pad
   *   0x12517b5  popq  %rbx
   *   0x12517b6  popq  %rbp
   *   0x12517b7  jmp   __ZdlPv (operator delete)         // tail
   *
   * TS has no `operator delete`; we call the base D2 and then invoke the
   * documented `operator_delete` stub for provenance.  (The stub throws,
   * but the D0 dtor should only be dispatched via the C++ vtable which
   * doesn't exist in the port — direct JS callers should use `destroy`.)
   */
  destroyAndDelete(): void {
    // @0x12517a9 — base D2.
    AUMultiInputBase_dtor_D2(this);
    // @0x12517b7 — tail-jmp into operator delete.  Kept as a documented
    // shim; the JS runtime reclaims the storage on its own.
    operator_delete(this);
  }
}
