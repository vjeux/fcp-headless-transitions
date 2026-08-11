// raw-port/src/channels/OZFxGenerator.ts
//
// FCP `OZFxGenerator` — Ozone generator element.
//
// Transcribed from the x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (unadjusted VAs, exactly as `otool -tV -arch x86_64` prints them).
//
// ONE symbol is ported in this file:
//   @0x3502e0  __ZThn16_N13OZFxGenerator12getSceneNodeEv
//              non-virtual thunk to OZFxGenerator::getSceneNode()   [this-adjustment -0x10]
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZThn16_N13OZFxGenerator12getSceneNodeEv Ozone`):
//   raw-port/re/disasm/__ZThn16_N13OZFxGenerator12getSceneNodeEv.s   (7 lines)
//
// NOT ported here (each its own ledger unit): the primary
// `OZFxGenerator::getSceneNode()` @0x350260, and the sibling thunk
// `__ZThn19376_...` @0x3502f0 (this-adjustment -0x4bb0 = -19376). Both are quoted below only as
// decode evidence for what this thunk does. Every other member of the class is likewise a
// separate unit; add them to THIS file when claimed (one class = one file; G6 add-only).
//
// ── The one layout fact this unit establishes ───────────────────────────────────────────────
// A non-virtual thunk exists because the virtual is dispatched through a SECONDARY base
// subobject, and its job is to convert that subobject pointer back into the complete-object
// pointer. The adjustment here is -0x10, so the base subobject whose vtable holds this slot sits
// at +0x10 inside OZFxGenerator. The -0x4bb0 sibling says a second base subobject sits at
// +0x4bb0 (19376 bytes in — this is a large composite object). No field is read, so nothing else
// about the layout is observable from this unit.

/**
 * `OZFxGenerator` — Ozone generator element. Only the -0x10 `getSceneNode` thunk is ported here.
 */
export class OZFxGenerator {
  /**
   * non-virtual thunk to `OZFxGenerator::getSceneNode()` — @Ozone 0x3502e0
   *   `__ZThn16_N13OZFxGenerator12getSceneNodeEv`
   *
   * FULL transcription — the body is 3 executed instructions and nothing else:
   *
   *   0x3502e0  pushq %rbp                ; frame setup (no TS counterpart)
   *   0x3502e1  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
   *   0x3502e4  leaq  -0x10(%rdi), %rax   ; %rax = this - 16          <-- the whole body
   *   0x3502e8  popq  %rbp                ; frame teardown (no TS counterpart)
   *   0x3502e9  retq                      ; returns the pointer in %rax
   *   0x3502ea  nopw  (%rax,%rax)         ; alignment padding, never executed
   *
   * `leaq` computes an address; it does NOT load. Nothing in this body dereferences `this`, and
   * there is no callq and no jmp — in particular this thunk does not tail-call its target the way
   * a thunk usually does.
   *
   * WHY THERE IS NO TAIL-CALL, AND WHY THE RESULT IS STILL THE WHOLE FUNCTION. The target,
   * `OZFxGenerator::getSceneNode()` @Ozone 0x350260, is itself three instructions and returns its
   * receiver unchanged (`movq %rdi,%rax` @0x350264 — quoted here as decode evidence; it is its own
   * ledger unit). A thunk is `this -= 16; return target(this)`, so with a target that returns
   * `this`, the composition collapses to `return this - 16`, and the compiler emitted exactly
   * that. The sibling thunk @0x3502f0 is the same shape with `leaq -0x4bb0(%rdi)`.
   *
   * MODELLING. The subtraction is a C++ ABI pointer adjustment: it converts a pointer to the base
   * subobject at +0x10 into a pointer to the complete OZFxGenerator, and both name the SAME
   * object. TypeScript has one identity per object and no interior pointers, so the adjusted and
   * unadjusted receivers are the same value here and the method returns `this` — the same
   * modelling the codebase already uses for a vptr install (documented, no TS counterpart). The
   * numeric adjustment is not lost: it is recorded above as the layout fact it encodes, and the
   * oracle below measures it as raw pointer arithmetic.
   *
   * ORACLE (executed, not read): the symbol is `t` (local), so it is not dlsym-able; it was called
   * BY ADDRESS in a Rosetta x86_64 process at `_dyld_get_image_vmaddr_slide(Ozone) + 0x3502e0`
   * (vmaddr from the x86_64 symbol table, never a bare `nm`, which reports the arm64 slice), with
   * receivers 0x1000, 0x0, 0x10, 0xdeadbeef00 and 0xffffffffffffffff. Live FCP returned exactly
   * `this - 16` in all five, including the two's-complement wraparound at 0x0 (-> 0xffff…f0)
   * and the 0x10 case (-> 0x0). The primary @0x350260, called the same way, returned each receiver
   * unchanged — which is the evidence for the collapse described above.
   *
   * @returns the complete-object receiver — `this`.
   */
  getSceneNode_thunk16(): OZFxGenerator {
    // @0x3502e4  leaq -0x10(%rdi),%rax — ABI this-adjustment from the +0x10 base subobject to the
    // complete object. Same object in TS, so the adjustment has no counterpart; see the doc above.
    return this;
  }
}
