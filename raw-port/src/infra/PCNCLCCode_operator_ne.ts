// PCNCLCCode_operator_ne.ts — ProCore.framework free operator.
//
// One symbol transcribed here:
//   @ProCore 0xc229e  operator!=(PCNCLCCode const&, PCNCLCCode const&)
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZneRK10PCNCLCCodeS1_.s
//
//   0xc229e  pushq  %rbp                       ; prologue
//   0xc229f  movq   %rsp, %rbp
//   0xc22a2  movl   (%rdi), %ecx               ; ecx = a.primaries    (offset +0x00)
//   0xc22a4  movb   $0x1, %al                  ; al = 1 (assume unequal)
//   0xc22a6  cmpl   (%rsi), %ecx               ; ecx - b.primaries
//   0xc22a8  jne    0xc22bb                    ; primaries differ  -> return 1
//   0xc22aa  movl   0x4(%rdi), %ecx            ; ecx = a.transfer     (offset +0x04)
//   0xc22ad  cmpl   0x4(%rsi), %ecx            ; ecx - b.transfer
//   0xc22b0  jne    0xc22bb                    ; transfer differ   -> return 1
//   0xc22b2  movl   0x8(%rdi), %eax            ; eax = a.matrix       (offset +0x08)
//   0xc22b5  cmpl   0x8(%rsi), %eax            ; eax - b.matrix
//   0xc22b8  setne  %al                        ; al = (a.matrix != b.matrix)
//   0xc22bb  popq   %rbp
//   0xc22bc  retq
//
// Field offsets 0x00 / 0x04 / 0x08 match PCNCLCCode's already-decoded layout
// (see raw-port/src/infra/PCIsUsableNCLCCode.ts — primaries, transfer, matrix
// each stored as a u32).  This is the natural short-circuit disequality:
//   return (a.primaries != b.primaries)
//       || (a.transfer  != b.transfer)
//       || (a.matrix    != b.matrix);
//
// The `movb $1, %al` + `jne`-with-al-still-1 pattern implements early-out for
// the first two fields (bail with `true` on the first mismatch); the third
// field's result is materialised via `setne %al` so that when all three fields
// are equal the return value is 0 (false).

import type { PCNCLCCode } from './PCIsUsableNCLCCode.ts';

/**
 * `operator!=` for PCNCLCCode — bit-for-bit port of the 15-instruction body.
 *
 * @ProCore 0xc229e  operator!=(PCNCLCCode const&, PCNCLCCode const&)
 *
 * @returns  true iff any of the three fields differs (short-circuit on the
 *           first two, materialised via `setne` on the third).
 */
export function PCNCLCCode_operator_ne(a: PCNCLCCode, b: PCNCLCCode): boolean {
  // 0xc22a2  movl (%rdi), %ecx   ;  0xc22a6  cmpl (%rsi), %ecx ; jne 0xc22bb  -> return 1
  if ((a.primaries | 0) !== (b.primaries | 0)) return true;
  // 0xc22aa  movl 0x4(%rdi), %ecx ; 0xc22ad  cmpl 0x4(%rsi), %ecx ; jne 0xc22bb -> return 1
  if ((a.transfer | 0) !== (b.transfer | 0)) return true;
  // 0xc22b2  movl 0x8(%rdi), %eax ; 0xc22b5  cmpl 0x8(%rsi), %eax ; setne %al
  return (a.matrix | 0) !== (b.matrix | 0);
}
