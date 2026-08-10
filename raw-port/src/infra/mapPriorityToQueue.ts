// mapPriorityToQueue — free function in Flexo.framework.
//
// Faithful line-for-line transcription of:
//   __Z18mapPriorityToQueue16FFSVPriorityEnum   @Flexo 0xe413d0..0xe413e7
//   raw-port/re/disasm/Flexo.__Z18mapPriorityToQueue16FFSVPriorityEnum.s
//
// SIGNATURE (Itanium mangling `16FFSVPriorityEnum` = enum FFSVPriorityEnum, an int):
//   int mapPriorityToQueue(FFSVPriorityEnum priority);
// The enum arrives in %edi as a 32-bit signed int; the result is returned in %eax.
//
// Maps a scheduler priority enum onto one of three dispatch-queue indices, branchless:
//
//   Disasm (13 lines):
//     0xe413d0  pushq  %rbp
//     0xe413d1  movq   %rsp, %rbp
//     0xe413d4  xorl   %ecx, %ecx          ## ecx = 0
//     0xe413d6  cmpl   $0x3, %edi          ## flags on (priority - 3)
//     0xe413d9  setne  %cl                 ## cl = (priority != 3) ? 1 : 0
//     0xe413dc  incl   %ecx                ## ecx = (priority != 3) ? 2 : 1
//     0xe413de  xorl   %eax, %eax          ## eax = 0  (default result)
//     0xe413e0  cmpl   $0x4, %edi          ## flags on (priority - 4)
//     0xe413e3  cmovll %ecx, %eax          ## if (priority < 4 signed) eax = ecx
//     0xe413e6  popq   %rbp
//     0xe413e7  retq
//
// Decoded (AT&T `cmp src,dst` computes dst-src; `cmovll` = signed-less move):
//   result = (priority < 4) ? ((priority == 3) ? 1 : 2) : 0;
// i.e.
//   priority >= 4        -> queue 0
//   priority == 3        -> queue 1
//   priority <  4 && != 3 -> queue 2   (covers 0,1,2 and any negative value)

/**
 * mapPriorityToQueue(FFSVPriorityEnum priority): int
 * @0xe413d0 Flexo
 *
 * Branchless mapping transcribed from the setne/incl/cmovll sequence above.
 * `priority` is the raw enum integer (as delivered in %edi).
 */
export function mapPriorityToQueue(priority: number): number {
  // Match the machine's 32-bit signed comparisons exactly.
  const p = priority | 0;
  // @0xe413d4/d6/d9/dc  ecx = (p != 3) ? 2 : 1
  const ecx = (p !== 3 ? 1 : 0) + 1;
  // @0xe413de/e0/e3     eax = (p < 4) ? ecx : 0   (signed less-than via cmovll)
  return p < 4 ? ecx : 0;
}

