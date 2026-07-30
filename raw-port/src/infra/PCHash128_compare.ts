// PCHash128_compare.ts — free function `compare(PCHash128 const&, PCHash128 const&)`.
//
// Faithful transcription from ProCore.framework symbol
//   __Z7compareRK9PCHash128S1_   @ProCore 0x1d22e
// (see raw-port/re/disasm/ProCore.__Z7compareRK9PCHash128S1_.s).
//
// The 27-instruction body implements a lexicographic 4×uint32 comparator over
// the PCHash128 struct layout {h0,h1,h2,h3} at offsets +0x00,+0x04,+0x08,+0x0c
// (documented in raw-port/src/infra/PCHash128.ts). It returns:
//     -1  if a <  b
//      0  if a == b
//     +1  if a >  b
// where '<' / '>' compare the four 32-bit words as UNSIGNED (all branches use
// `jae`/`jb`/`ja`/`jbe`/`seta` — CF/ZF pair, i.e. unsigned ordering — never
// `jl`/`jg`/`jle`/`jge`). Ordering is BIG-ENDIAN across the word array: word[0]
// (offset +0x00 = h0) is the most-significant, word[3] (offset +0xc = h3) the
// least. This is the convention the disassembly implements — it reads word[0]
// first and only descends to later words on equality (@0x1d248, @0x1d252,
// @0x1d25c). Note this is NOT the little-endian byte order used inside
// transform()/getString() — this is a struct-field-order comparator, unaware of
// byte-level endianness.
//
// Disassembly line-by-line (AT&T; `cmp src,dst` computes dst-src):
//
//   0x1d22e  pushq %rbp / movq %rsp,%rbp                ; frame
//   0x1d232  movl (%rsi), %eax                          ; eax = b.h0
//   0x1d234  cmpl %eax, (%rdi)                          ; a.h0 - b.h0
//   0x1d236  jae  0x1d23f                               ; if a.h0 >= b.h0 -> L1
//   0x1d238  movl $0xffffffff, %eax                     ; else eax = -1
//   0x1d23d  jmp  0x1d246                               ; return -1
//   0x1d23f  L1: movl $0x1, %eax                        ; eax = +1
//   0x1d244  jbe  0x1d248                               ; if a.h0 <= b.h0 -> L2
//                                                       ; (combined w/ jae above:
//                                                       ;  jae + jbe true == equal,
//                                                       ;  so this branch fires on
//                                                       ;  equality; the fall-through
//                                                       ;  is a.h0 > b.h0 -> return +1)
//   0x1d246  popq %rbp / retq                           ; return eax (+1)
//
//   0x1d248  L2: movl 0x4(%rsi), %ecx                   ; ecx = b.h1
//   0x1d24b  cmpl %ecx, 0x4(%rdi)                       ; a.h1 - b.h1
//   0x1d24e  jb   0x1d238                               ; if a.h1 <  b.h1 -> return -1
//   0x1d250  ja   0x1d246                               ; if a.h1 >  b.h1 -> return +1
//                                                       ; else fall through: equal so far
//   0x1d252  movl 0x8(%rsi), %ecx                       ; ecx = b.h2
//   0x1d255  cmpl %ecx, 0x8(%rdi)                       ; a.h2 - b.h2
//   0x1d258  jb   0x1d238                               ; if a.h2 <  b.h2 -> return -1
//   0x1d25a  ja   0x1d246                               ; if a.h2 >  b.h2 -> return +1
//   0x1d25c  movl 0xc(%rsi), %ecx                       ; ecx = b.h3
//   0x1d25f  movl $0xffffffff, %eax                     ; default eax = -1
//   0x1d264  cmpl %ecx, 0xc(%rdi)                       ; a.h3 - b.h3
//   0x1d267  jb   0x1d246                               ; if a.h3 <  b.h3 -> return -1 (eax was set)
//   0x1d269  seta %al                                   ; else set al = (a.h3 > b.h3) ? 1 : 0
//   0x1d26c  movzbl %al, %eax                           ; zero-extend
//   0x1d26f  jmp  0x1d246                               ; return eax (0 or +1)
//
// A subtle detail: at @0x1d25f the default `eax=-1` is loaded BEFORE the
// h3 comparison. If `jb` fires (a.h3 < b.h3), that -1 is returned directly at
// L3 (@0x1d246). Otherwise `seta` OVERWRITES al with 0 or 1 (0 = equal,
// 1 = a.h3 > b.h3), so the higher bits of eax from the -1 preload are then
// masked to zero by `movzbl %al,%eax`. Net semantics: -1 / 0 / +1.

import { PCHash128 } from "./PCHash128";

/**
 * ProCore free function `compare(PCHash128 const&, PCHash128 const&)`.
 *
 * @ProCore 0x1d22e (`__Z7compareRK9PCHash128S1_`).
 *
 * Lexicographic unsigned 32-bit compare over the four struct fields
 * (h0,h1,h2,h3) in struct-field order (h0 most-significant). Returns
 * -1, 0, or +1 exactly as the C++ symbol does.
 */
export function compare(a: PCHash128, b: PCHash128): number {
  // Read all four fields as uint32 to match the machine's unsigned
  // compare semantics. PCHash128 stores these already as u32 (see
  // raw-port/src/infra/PCHash128.ts — every ctor writes with `movl`
  // and asserts `>>> 0`). `>>> 0` here guards against any consumer
  // that stashed a signed value in the field.

  // @0x1d232..@0x1d247 — word 0 (h0).
  const a0 = a.a >>> 0;
  const b0 = b.a >>> 0;
  if (a0 < b0) return -1; // @0x1d238 jmp 0x1d246 with eax=-1
  if (a0 > b0) return +1; // fall-through of jbe at @0x1d244 with eax=+1

  // @0x1d248..@0x1d250 — word 1 (h1). Equal-so-far falls through.
  const a1 = a.b >>> 0;
  const b1 = b.b >>> 0;
  if (a1 < b1) return -1; // @0x1d24e jb 0x1d238
  if (a1 > b1) return +1; // @0x1d250 ja 0x1d246

  // @0x1d252..@0x1d25a — word 2 (h2).
  const a2 = a.c >>> 0;
  const b2 = b.c >>> 0;
  if (a2 < b2) return -1; // @0x1d258 jb 0x1d238
  if (a2 > b2) return +1; // @0x1d25a ja 0x1d246

  // @0x1d25c..@0x1d26f — word 3 (h3). The disasm preloads eax=-1
  // (@0x1d25f) so a `jb` on the h3 compare returns -1 directly; the
  // fall-through uses `seta` to yield 0 (equal) or 1 (a.h3 > b.h3).
  const a3 = a.d >>> 0;
  const b3 = b.d >>> 0;
  if (a3 < b3) return -1; // @0x1d267 jb 0x1d246 (eax==-1 from @0x1d25f)
  if (a3 > b3) return +1; // @0x1d269 seta %al -> 1
  return 0; // @0x1d269 seta %al -> 0 (equal case)
}
