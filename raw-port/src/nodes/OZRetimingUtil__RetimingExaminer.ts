// OZRetimingUtil__RetimingExaminer — Ozone's retiming-examiner registry node.
//
// NESTED CLASS: `OZRetimingUtil::RetimingExaminer`, filed as `Outer__Inner` with a DOUBLE
// underscore per PORTING_SPEC ("Nested-class file naming").
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/__ZN14OZRetimingUtil16RetimingExaminerC2Ev.s   (ported here)
//            raw-port/re/disasm/__ZN14OZRetimingUtil16RetimingExaminerD2Ev.s   (read ONLY to pin
//              the meaning of +0x08 / +0x10 — its own ledger entry, NOT ported here)
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14OZRetimingUtil16RetimingExaminerC2Ev
//       — OZRetimingUtil::RetimingExaminer::RetimingExaminer() [C2, base object] @Ozone 0x460610
//
// NOT ported here (separate ledger entries, distinct addresses — no ICF folding):
//   C1 @0x460650, D2 @0x460690, D1 @0x4606d0, D0 @0x460710.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   none. The body has no `callq`, no `jmp` to a stub, and no indirect dispatch: three loads,
//   four stores, one branch.
//
// -----------------------------------------------------------------------------
// WHAT THIS CTOR IS
// -----------------------------------------------------------------------------
// `RetimingExaminer` derives from `OZRetimingUtil::StaticListNode<RetimingExaminer>`, an INTRUSIVE
// doubly-linked list whose head is a single global. Constructing an examiner PUSHES IT ON THE
// FRONT of that global list — i.e. the ctor's whole purpose is self-registration, and its
// observable output is as much the global as the object.
//
// STRUCT LAYOUT (the base subobject at offset 0; all three slots are written here)
//   +0x00  vptr   — `leaq 0x407539(%rip), %rax` @0x460638 / `movq %rax, (%rdi)` @0x46063f. The rip
//                   after that 7-byte leaq is 0x46063f, and 0x46063f + 0x407539 = @Ozone 0x867b78;
//                   `nm` puts __ZTVN14OZRetimingUtil16RetimingExaminerE at 0x867b68, so this is
//                   the standard vtable + 0x10. Written LAST, after the list splice.
//   +0x08  next   — `movq %rax, 0x8(%rdi)` @0x460617, the old head. Confirmed as NEXT by the dtor
//                   @0x4606af, which writes it into `prev->next` when unlinking
//                   (`movq %rax, 0x8(%rcx)` with rcx = this->prev).
//   +0x10  prev   — `movq $0x0, 0x10(%rdi)` @0x46061b (a fresh head has no predecessor), and the
//                   old head's `prev` is pointed back at this object @0x46062c. Confirmed as PREV
//                   by the dtor @0x4606b8 (`movq %rcx, 0x10(%rax)` with rax = this->next) and by
//                   @0x4606be, where a node whose prev is NULL is the one that updates sHead.
//
// GLOBAL
//   sHead @Ozone 0x932c78 — `OZRetimingUtil::StaticListNode<RetimingExaminer>::sHead`. It has no
//   entry in the symbol table (stripped BSS), so the address is decoded from the instruction
//   bytes: the load @0x460610 is `48 8b 05 61 26 4d 00` = `movq 0x4d2661(%rip), %rax` with rip
//   0x460617 -> 0x932c78, and the store @0x460631 is `48 89 3d 40 26 4d 00` with rip 0x460638 ->
//   the same 0x932c78. otool's annotation agrees, and the dtor writes the same slot @0x4606be.
//
// -----------------------------------------------------------------------------
// FULL DISASM — C2 @0x460610 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x460610  movq  sHead(%rip), %rax          ; rax = the current list head (may be NULL)
//   0x460617  movq  %rax, 0x8(%rdi)            ; this->next = oldHead
//   0x46061b  movq  $0x0, 0x10(%rdi)           ; this->prev = NULL
//   0x460623  testq %rax, %rax                 ; flags on oldHead & oldHead
//   0x460626  je    0x460631                   ; NULL -> skip the back-link
//   0x460628  pushq %rbp                       ; (the frame is built only on this path)
//   0x460629  movq  %rsp, %rbp
//   0x46062c  movq  %rdi, 0x10(%rax)           ; oldHead->prev = this
//   0x460630  popq  %rbp
//   0x460631  movq  %rdi, sHead(%rip)          ; sHead = this
//   0x460638  leaq  0x407539(%rip), %rax       ; rax = 0x867b78 = vtable + 0x10
//   0x46063f  movq  %rax, (%rdi)               ; this->vptr = that
//   0x460642  retq
//   0x460643  nopw  %cs:(%rax,%rax)            ; padding — not executed
//
// DECODE NOTES
//  - The ORDER matters and is preserved: next/prev are written, then the back-link, then the head
//    moves, and only then the vptr. Anything that reads the list from another thread during the
//    ctor would see it in exactly that sequence; the port does the stores in the same order rather
//    than "constructing then linking".
//  - `testq %rax,%rax ; je` is the plain NULL test on the OLD head — the first examiner ever
//    constructed takes the branch and writes no back-link.
//  - The prologue/epilogue pair inside the branch is real codegen (the frame is only needed on
//    that path); it has no TS counterpart.

/**
 * `OZRetimingUtil::RetimingExaminer` — Ozone retiming examiner, a node of the intrusive static
 * list described in the file header. This file holds the symbol listed under "Symbols ported
 * here"; every other method is a separate ledger entry and will be ADDED here (additive
 * extension only). Only the three slots the ported body writes are modelled.
 */
export class OZRetimingUtil__RetimingExaminer {
  /**
   * `OZRetimingUtil::StaticListNode<OZRetimingUtil::RetimingExaminer>::sHead` @Ozone 0x932c78 —
   * the head of the global intrusive list, read @0x460610 and written @0x460631. A static because
   * the machine's is one process-wide slot in BSS, initially NULL (BSS is zero-filled).
   */
  static sHead: OZRetimingUtil__RetimingExaminer | null = null; // @Ozone 0x932c78

  /** @Ozone RetimingExaminer@0x08 — the next node (the head this one displaced). Written
   *  @0x460617; read by the dtor @0x4606a2. */
  next: OZRetimingUtil__RetimingExaminer | null = null; // @Ozone RetimingExaminer@0x08

  /** @Ozone RetimingExaminer@0x10 — the previous node. Set to NULL @0x46061b because this object
   *  becomes the head; the displaced head's own `prev` is pointed here @0x46062c. */
  prev: OZRetimingUtil__RetimingExaminer | null = null; // @Ozone RetimingExaminer@0x10

  /**
   * `OZRetimingUtil::RetimingExaminer::RetimingExaminer()` [C2, base object] @Ozone 0x460610
   *   (__ZN14OZRetimingUtil16RetimingExaminerC2Ev)
   *
   * Full transcription of the 12-instruction body (see the FULL DISASM block in the file header).
   * Pushes this object onto the FRONT of the global `sHead` list, then stamps the vptr. No
   * callees, no allocation, no branch other than the NULL test on the old head.
   *
   * DIFFERENTIAL against the live binary (exported: `0000000000460610 T` in the Ozone symbol
   * table, so dlsym reaches it once Ozone's `@rpath` chain is preloaded depth-first; run under
   * `arch -x86_64 /usr/bin/python3` because every address cited here is an x86_64 offset and the
   * arm64 slice is a different function, per OPS_LOG):
   * raw-port/re/oracle/OZRetimingUtil__RetimingExaminer_C2_oracle.py drives the REAL ctor over
   * the sequence this port claims — it saves the live `sHead`, forces it NULL, constructs two
   * 0xEE-poisoned objects in turn, and reads back BOTH the objects and the global after each
   * step, restoring `sHead` when it is done (so the loaded framework is left as it was found).
   * Every field assertion below is measured, including the ones about untouched bytes. See the
   * commit message for the recorded run.
   */
  constructor() {
    // ------------------------------------------------------------
    // @0x460610 — movq sHead(%rip), %rax : read the current head BEFORE any store.
    // @0x460617 — movq %rax, 0x8(%rdi)   : this->next = oldHead.
    // @0x46061b — movq $0x0, 0x10(%rdi)  : this->prev = NULL.
    // ------------------------------------------------------------
    const oldHead = OZRetimingUtil__RetimingExaminer.sHead;
    this.next = oldHead;
    this.prev = null;

    // ------------------------------------------------------------
    // @0x460623/@0x460626 — testq %rax,%rax ; je 0x460631 : skip the back-link when the list was
    //   empty (the very first examiner constructed).
    // @0x46062c — movq %rdi, 0x10(%rax) : oldHead->prev = this.
    // ------------------------------------------------------------
    if (oldHead !== null) {
      oldHead.prev = this;
    }

    // ------------------------------------------------------------
    // @0x460631 — movq %rdi, sHead(%rip) : the global head becomes this object.
    // @0x460638/@0x46063f — leaq/movq : this->vptr = __ZTVN...RetimingExaminerE + 0x10 (@0x867b78).
    //   In TS the object's class IS its vtable, so `new` is that store; it happens LAST in the
    //   machine and the ordering is preserved by doing the list work above it.
    // @0x460642 — retq.
    // ------------------------------------------------------------
    OZRetimingUtil__RetimingExaminer.sHead = this;
  }
}
