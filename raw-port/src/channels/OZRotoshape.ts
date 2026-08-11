// raw-port/src/channels/OZRotoshape.ts
//
// FCP `OZRotoshape` — Ozone.framework. This file ports ONE ledger unit, the +216 non-virtual
// thunk entry of `prepareForDragOperation`; the rest of the class accretes here as future units
// claim it (one C++ class = one file). Filed under `channels/` beside the landed
// `channels/OZRotoshapeStyle.ts`. Checked before creating the file:
//   git ls-tree origin/main -r --name-only | grep -i OZRotoshape   -> only OZRotoshapeStyle.ts,
// so this is not the "same class forked into a second layer directory" shape.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZThn216_N11OZRotoshape23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj
//       -- non-virtual thunk to
//          OZRotoshape::prepareForDragOperation(OZPasteList*, OZChannelBase*, unsigned int,
//          unsigned int)                                   @Ozone 0x41b850   (`nm` class T)
//
// FULL DISASM (raw-port/re/disasm/
// __ZThn216_N11OZRotoshape23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj.s):
//
//   0x41b850  pushq %rbp
//   0x41b851  movq  %rsp, %rbp
//   0x41b854  movb  $0x1, %al          ; return true
//   0x41b856  popq  %rbp
//   0x41b857  retq
//
// THIS "THUNK" DOES NOT ADJUST ANYTHING, AND THAT IS THE POINT WORTH RECORDING. An Itanium
// non-virtual thunk normally subtracts the base-subobject offset from `this` and jumps to the real
// method (`addq $-0xd8, %rdi ; jmp …`). This one does not: it is a complete, standalone body. The
// reason is visible in the three symbols side by side — I derived all three rather than assuming
// the family:
//
//   0x41b830  __ZN11OZRotoshape23prepareForDragOperation…      pushq %rbp / movq %rsp,%rbp /
//   0x41b840  __ZThn200_N11OZRotoshape23prepareForDragOperation…   movb $0x1,%al / popq %rbp / retq
//   0x41b850  __ZThn216_N11OZRotoshape23prepareForDragOperation…
//
// All three are byte-for-byte identical. The method ignores `this` entirely (it never moves %rdi)
// and returns a constant, so there is nothing for a thunk to adjust and the compiler emitted the
// body three times instead of an adjust-and-jump. Consequently this port has NO call to the base
// symbol: writing one would be inventing a dispatch the machine does not perform.
//
// THE OTHER TWO ADDRESSES ARE SEPARATE LEDGER UNITS AND ARE NOT PORTED HERE. Only the +216 thunk
// was claimed. They are named above so the next worker sees immediately that they are the same
// five instructions rather than re-deriving them, and so a reviewer can tell that the omission is
// scope, not an oversight.
//
// RETURN TYPE. `movb $0x1,%al` writes one byte, which is what a `bool` return compiles to (an int
// would be `movl $0x1,%eax`), so this is `true` — "yes, prepared". The four parameters
// (OZPasteList*, OZChannelBase*, unsigned, unsigned) are declared to keep the signature faithful
// and are unread by the machine, which is stated rather than silently dropped.
//
// DIFFERENTIAL vs the live binary — raw-port/re/oracle/
// OZRotoshape_prepareForDragOperation_thunk216_{oracle.py,driver.mts}. A constant-returning
// function is exactly where a differential can be vacuous, so the harness carries a SENSITIVITY
// control that returns the OTHER answer on the same instrument: `OZImageGenerator::filteredEdges`
// @Ozone 0x30c120, a nullary-after-`this` bool that returns FALSE, called through the same
// CFUNCTYPE immediately before each measured call. The 6 prologue bytes at slide+0x41b850 are
// checked before any number is reported, which matters here because the two sibling addresses 16
// and 32 bytes away hold the identical body and landing on one of them would look perfect.
// RESULT: 64/64 true from the live symbol, 64/64 true from this port, 0 divergences; the control
// read false 64/64 in the same loop.

/**
 * `OZRotoshape` — an Ozone rotoshape node. The instance layout is deliberately NOT modelled: the
 * one method decoded here never dereferences `this`, and inventing fields from a method that does
 * not touch them is what PORTING_SPEC Rule 5 forbids.
 */
export class OZRotoshape {
  /**
   * non-virtual thunk to
   * `OZRotoshape::prepareForDragOperation(OZPasteList*, OZChannelBase*, unsigned int, unsigned int)`
   * @Ozone 0x41b850
   * (__ZThn216_N11OZRotoshape23prepareForDragOperationEP11OZPasteListP13OZChannelBasejj).
   *
   * Disasm mirror (5 asm lines):
   *   pushq %rbp / movq %rsp,%rbp                               @0x41b850..0x41b853
   *   movb  $0x1, %al                                           @0x41b854   (return TRUE)
   *   popq  %rbp / retq                                         @0x41b856..0x41b857
   *
   * The +216 entry point for callers holding the base subobject at `this + 216`. It performs NO
   * pointer adjustment and NO call to @0x41b830 — see the file header: all three symbols in this
   * family are byte-identical because the body ignores `this`.
   *
   * Named for the thunk it transcribes rather than for the underlying method, because the
   * underlying method @0x41b830 is a DIFFERENT ledger unit that is not ported in this change; a
   * bare `prepareForDragOperation` here would claim an address this file does not carry.
   *
   * @param _pasteList  OZPasteList*    (%rsi) — never read by this body.
   * @param _channel    OZChannelBase*  (%rdx) — never read by this body.
   * @param _a          unsigned int    (%ecx) — never read by this body.
   * @param _b          unsigned int    (%r8d) — never read by this body.
   */
  prepareForDragOperation_thunk216(
    _pasteList: unknown,
    _channel: unknown,
    _a: number,
    _b: number,
  ): boolean {
    // @0x41b854 — movb $0x1, %al.
    return true;
  }
}
