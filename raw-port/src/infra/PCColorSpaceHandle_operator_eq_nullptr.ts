// PCColorSpaceHandle_operator_eq_nullptr.ts — free function
//   operator==(PCColorSpaceHandle const&, std::nullptr_t)
//
// Faithful transcription from ProCore symbol
//   __ZeqRK18PCColorSpaceHandleDn   @ProCore 0x9afe1
// (see raw-port/re/disasm/ProCore.__ZeqRK18PCColorSpaceHandleDn.s).
//
// Full disassembly (5 body instructions — a bare pointer null-compare):
//
//   0x9afe1  pushq %rbp
//   0x9afe2  movq  %rsp, %rbp
//   0x9afe5  cmpq  $0x0, (%rdi)             ; sets flags on (a.handle) - 0
//   0x9afe9  sete  %al                      ; al = (a.handle == 0) ? 1 : 0
//   0x9afec  popq  %rbp
//   0x9afed  retq                           ; returns al zero-extended
//
// Semantics: reads the pointer-sized field at PCColorSpaceHandle+0x00 (the
// CGColorSpace* handle recovered in PCColorSpaceHandle.ts docstring from
// ~PCColorSpaceHandle @Flexo 0x601fc0's `movq (%rdi),%rdi`) and returns true
// iff it equals null. The std::nullptr_t (%rsi) argument is a zero-sized ABI
// tag — the machine body never reads it, and the sole compare on the LHS is
// against the literal $0x0. So the port omits the nullptr operand: mirroring
// `cmpq $0x0, (%rdi); sete %al` in TypeScript is exactly `h.handle === null`.
//
// This is the *sibling* to `operator<` (see PCColorSpaceHandle_operator_lt.ts,
// __ZltRK18PCColorSpaceHandleS1_ @0x9b3ec) whose 6-instruction body performs
// the two-operand unsigned pointer compare. Here there is only one operand
// (the immediate literal 0), so unlike operator<, this port is fully faithful
// at the JS boundary — no pointer-address observation required.
//
// See settled coordinator ruling documented in the earlier reviewer verdict:
// PCColorSpaceHandle IS a single-field wrapper with CGColorSpace* at +0x00,
// which lands as PCColorSpaceHandle.handle:CGColorSpaceRef|null on main.
// TS body `return h.handle === null` reads the same +0x00 field and returns
// the null-equality boolean — matches cmpq+sete semantically bit-for-bit.

import { PCColorSpaceHandle } from "./PCColorSpaceHandle";

/**
 * `operator==(PCColorSpaceHandle const&, std::nullptr_t)`.
 *
 * @ProCore 0x9afe1 (`__ZeqRK18PCColorSpaceHandleDn`).
 *
 * Machine body: `return a.handle == 0` — a plain null test on the pointer
 * field at +0x00. See the file docstring above for the full transcription.
 *
 * The nullptr_t operand is a zero-sized ABI tag; the disasm never reads
 * %rsi, so this port takes only the handle and omits the tag argument.
 */
export function PCColorSpaceHandle_operator_eq_nullptr(
  a: PCColorSpaceHandle,
): boolean {
  // @ProCore 0x9afe5..0x9afe9 — cmpq $0x0,(%rdi) ; sete %al
  //   loads the +0x00 field (a.handle) and compares to null.
  return a.handle === null;
}
