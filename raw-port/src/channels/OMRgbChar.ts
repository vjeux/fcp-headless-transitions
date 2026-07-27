// OMRgbChar — Flexo tiny POD struct for an 8-bit-per-channel RGB triplet.
//
// The class has NO virtual methods (both dtors are trivial — no vptr install, no
// member cleanup, no field access) and NO ownership semantics (D1 is a pure
// `retq`, so C++ recognises this as a trivial-destructor POD; D0 is the ABI
// deleting-dtor wrapper that only tail-jmps `operator delete`). Its layout is
// therefore known only from ITS USAGE ELSEWHERE — most tellingly, the sibling
// `std::vector<OMRgbChar>` template instantiations found in the same Flexo
// symbol table:
//   __ZNSt3__16vectorI9OMRgbCharNS_9allocatorIS1_EEED1B9nqe210106Ev
//   __ZNSt3__128__exception_guard_exceptionsINS_6vectorI9OMRgbCharNS_...
// which show OMRgbChar is used as vector-element storage (an image/palette row)
// — matching the standard image-processing "rgb char" tuple layout. But the
// EXACT byte layout (3 bytes packed vs 4 bytes with padding vs an aggregate of
// three named u8 fields, byte order, and whether the struct has an aligned
// tail padding byte) is NOT decodable from the two dtor symbols on this slice.
//
// Faithful transcription of exactly two exported symbols — the Itanium C++ ABI
// destructor pair D1 (complete-object) at Flexo 0x111d570 and D0 (deleting) at
// Flexo 0x111d580. Neither body accesses `this` at all beyond passing it into
// `operator delete` (D0 only).
//
// Source disassembly (extracted directly from /tmp/Flexo_tV.txt via awk on
// __ZN9OMRgbCharD1Ev: and __ZN9OMRgbCharD0Ev:):
//
//   __ZN9OMRgbCharD1Ev:
//     000000000111d570   pushq   %rbp
//     000000000111d571   movq    %rsp, %rbp
//     000000000111d574   popq    %rbp
//     000000000111d575   retq
//     000000000111d576   nopw    %cs:(%rax,%rax)
//
//   __ZN9OMRgbCharD0Ev:
//     000000000111d580   pushq   %rbp
//     000000000111d581   movq    %rsp, %rbp
//     000000000111d584   popq    %rbp
//     000000000111d585   jmp     0x1497404  ## symbol stub for: __ZdlPv
//     000000000111d58a   nopw    (%rax,%rax)
//
// Framework: Final Cut Pro / Flexo.framework.
//
// DECODE — struct layout: NOT decodable from this slice. Neither dtor emits a
// load or a store, so no field offsets can be pinned. See the class body for
// the placeholder mirror.
//
// Frontier callees (all become throwing stubs):
//   `_ZdlPv` (operator delete(void*)) via symbol stub                @Flexo tail-jmp D0 @0x111d585 -> stub @0x1497404

/**
 * `operator delete(void*)` — the C++ global deallocation function reached
 * through the symbol stub `__ZdlPv` at Flexo 0x1497404. D0's only real
 * instruction is a tail-jmp to this stub at @0x111d585. Standard C++ runtime;
 * no per-class body.
 */
function cxx_operator_delete(_this: OMRgbChar): void {
  throw new Error(
    "OMRgbChar: operator delete(void*) not modelled in the raw-port runtime " +
      "@Flexo tail-jmp D0 0x111d585 (stub 0x1497404)"
  );
}

/**
 * The class instance. Non-polymorphic (no vptr install in either dtor) and
 * trivially-destructible (D1 is a bare prologue/epilogue with `retq`, no
 * member access). Its layout is not on this slice's decoded surface — we
 * decline to fabricate `r`, `g`, `b` fields (or any packing/ordering) from
 * the name alone. Any consumer that instantiates OMRgbChar must know its
 * layout from the class(es) that USE it, which are not this class's exported
 * methods.
 */
export class OMRgbChar {
  /**
   * `OMRgbChar::~OMRgbChar()` — the Itanium C++ ABI D1 (complete-object)
   * destructor. Mangled symbol `__ZN9OMRgbCharD1Ev` at @Flexo 0x111d570.
   *
   * The body is exactly a frame prologue + epilogue with no member access —
   * this is the standard codegen for a class with a trivial (implicit)
   * destructor. Address-by-address:
   *   @0x111d570  pushq %rbp            ─┐
   *   @0x111d571  movq  %rsp, %rbp       │ empty stack frame
   *   @0x111d574  popq  %rbp            ─┘
   *   @0x111d575  retq                    return; nothing done.
   *   @0x111d576  nopw  %cs:(%rax,%rax)   alignment padding to 16B for the
   *                                       next symbol (D0 at 0x111d580).
   * No fields are read or written; no base sub-object dtor is called; no
   * vptr is installed. The TS mirror is therefore also a no-op.
   */
  destroy_D1_completeObjectDtor(): void {
    // @0x111d570..0x111d575 — bare `retq`; no work performed.
    // (Intentionally empty. Fabricating any field cleanup here would violate
    // decode-before-implement.)
  }

  /**
   * `OMRgbChar::~OMRgbChar()` — the Itanium C++ ABI D0 (deleting) destructor.
   * Mangled symbol `__ZN9OMRgbCharD0Ev` at @Flexo 0x111d580.
   *
   * Address-by-address:
   *   @0x111d580  pushq %rbp            ─┐
   *   @0x111d581  movq  %rsp, %rbp       │ empty stack frame (same as D1)
   *   @0x111d584  popq  %rbp            ─┘
   *   @0x111d585  jmp   0x1497404        tail-jmp to `symbol stub for: __ZdlPv`
   *                                      = `operator delete(void*)` — %rdi
   *                                      still holds `this` at this point.
   *   @0x111d58a  nopw  (%rax,%rax)     alignment padding to 16B.
   *
   * Notably absent: no call to D1 before the delete. That's normal — because
   * D1 is a no-op, the compiler inlined "call D1; then operator delete" into
   * "just tail-jmp operator delete".
   */
  destroy_D0_deletingDtor(): void {
    // @0x111d580..0x111d584 — empty frame prologue/epilogue (mirrors D1's
    // no-op body — the D1 base-object dtor step is elided by the compiler
    // because D1 has no observable effect).

    // @0x111d585 — tail-jmp `__ZdlPv` (operator delete(void*)) via stub
    // 0x1497404.
    cxx_operator_delete(this);
  }
}
