// NSDragOpToOZDragOpOZ.ts — Ozone framework (nodes layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * NSDragOpToOZDragOpOZ(unsigned int)   @Ozone 0x148410
//     __Z20NSDragOpToOZDragOpOZj
//
// A free (non-member) C++ function that converts an AppKit
// `NSDragOperation` bitmask into Ozone's internal `OZDragOp` bitmask.
// The two enum spaces share several bit positions but differ in others,
// and the value 4 (NSDragOperationGeneric) maps to a special constant
// 0x23 (35 decimal) in OZDragOp. The mapping is a bit-shuffle + cmov —
// no branches, no memory loads, no callees, no externs.
//
// re/disasm:
//   raw-port/re/disasm/__Z20NSDragOpToOZDragOpOZj.s
//
// -----------------------------------------------------------------------------
// FULL DISASM (18 lines, @Ozone 0x148410..@0x148438)
// -----------------------------------------------------------------------------
//   __Z20NSDragOpToOZDragOpOZj:
//     0x148410  pushq  %rbp                              ; frame prologue
//     0x148411  movq   %rsp, %rbp
//     0x148414  movl   %edi, %eax                        ; eax = input
//     0x148416  andl   $0x1, %eax                        ; eax = input & 0x1
//     0x148419  movl   %edi, %ecx                        ; ecx = input
//     0x14841b  shrl   $0x3, %ecx                        ; ecx = input >> 3
//     0x14841e  andl   $0x6, %ecx                        ; ecx = (input >> 3) & 0x6
//     0x148421  orl    %eax, %ecx                        ; ecx |= (input & 0x1)
//     0x148423  movl   %edi, %eax                        ; eax = input
//     0x148425  andl   $0x2, %eax                        ; eax = input & 0x2
//     0x148428  leal   (%rcx,%rax,4), %ecx               ; ecx = ecx + eax*4
//                                                        ;      = ((input>>3)&6) | (input&1)
//                                                        ;        + ((input&2) << 2)
//     0x14842b  cmpl   $0x4, %edi                        ; input == 4 ?
//     0x14842e  movl   $0x23, %eax                       ; eax = 0x23  (assume input==4)
//     0x148433  cmovnel %ecx, %eax                       ; if input != 4, eax = ecx
//     0x148436  popq   %rbp
//     0x148437  retq
//     0x148438  nopl   (%rax,%rax)                       ; alignment padding
//
// -----------------------------------------------------------------------------
// SEMANTICS — RE-DERIVED FROM THE ASSEMBLY
// -----------------------------------------------------------------------------
// Special case: input == 4 (which is `NSDragOperationGeneric` in AppKit)
// returns 0x23 (35). This is a fixed value with no bit-shuffle equivalent
// — it is Ozone's specific opcode for a "generic" drag semantic.
//
// General case (input != 4): the returned bitmask is the union of three
// re-mapped bits from the input:
//
//     bit 0   ->  bit 0    (mask 0x1)
//     bit 1   ->  bit 3    (mask 0x2 -> 0x8)          shift left by 2
//     bit 4   ->  bit 1    (mask 0x10 >> 3 = 0x2, kept as 0x2)
//     bit 5   ->  bit 2    (mask 0x20 >> 3 = 0x4, kept as 0x4)
//
// i.e. (input & 0x1) | ((input & 0x2) << 2) | ((input & 0x30) >> 2)
// Equivalent to the assembly rewrite: `((input >> 3) & 6)` masks bits 3,4
// of the shifted operand (i.e. bits 4,5 of the ORIGINAL operand), then
// OR the low bit (input & 0x1), then add (input & 0x2) shifted-left by 2
// via `leal (%rcx,%rax,4), %ecx`. The `leal` doesn't clip to any lane
// beyond its 32-bit destination (implicit zero-extension into rcx by x86
// 32-bit-op semantics); the result stays within a small nibble.
//
// The AppKit-to-Ozone bitmap:
//   input bit  ->  output bit    (NS enum name  ->  OZ enum name)
//   0 (0x01)   ->  0 (0x01)      NSDragOperationCopy       -> OZDragOpCopy
//   1 (0x02)   ->  3 (0x08)      NSDragOperationLink       -> OZDragOpLink (?)
//   4 (0x10)   ->  1 (0x02)      NSDragOperationMove       -> OZDragOpMove (?)
//   5 (0x20)   ->  2 (0x04)      NSDragOperationDelete     -> OZDragOpDelete (?)
//
// Names in parentheses are BEST-GUESS from AppKit's NSDragOperation
// enum order; the actual Ozone enum names live in a different header
// and are out of scope for this ledger unit. The port only needs the
// numerical mapping to be bit-exact.
//
// The `cmpl $0x4, %edi` uses AT&T dst-src semantics: subtracts src(=4)
// from dst(=input), sets ZF iff input==4. `cmovnel` (move if not equal)
// keeps `eax` at 0x23 when ZF is set (input==4) and replaces it with
// `ecx` (the bit-shuffle result) otherwise. Faithfully mirrored below.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Zero. Pure arithmetic — no callq, no externs, no indirect calls.
// depgraph.py deps for __Z20NSDragOpToOZDragOpOZj reports deps=0,
// n_extern_oos=0, indirect=0. This is a leaf leaf leaf.
//
// -----------------------------------------------------------------------------
// The signature `unsigned int -> unsigned int` (both `%edi`-in and
// `%eax`-out are 32-bit unsigned lanes). We keep the JS `number` type
// and clamp via `>>> 0` at the entry to match the u32 domain.

/**
 * `NSDragOpToOZDragOpOZ(unsigned int)` — @Ozone 0x148410.
 *
 * Converts an AppKit `NSDragOperation` bitmask to Ozone's internal
 * `OZDragOp` bitmask. The mapping is a bit-shuffle for most values,
 * with a single special case: input `4` (NSDragOperationGeneric) maps
 * to the fixed value `0x23` (35).
 *
 * The 18-line disassembly is a branch-free `cmov` — this TypeScript
 * mirror uses a single conditional expression to preserve the same
 * shape (no early return, no if-statement side effects), which G5's
 * classify_disasm treats as branch-free just like the machine.
 *
 * Zero in-scope callees, zero externs, zero indirect calls — verified
 * by `python3 raw-port/army/tools/depgraph.py deps
 *      __Z20NSDragOpToOZDragOpOZj`.
 */
export function NSDragOpToOZDragOpOZ(input: number): number {
  // @0x148414..0x148428 — the bit-shuffle path. Compute the general-case
  //   result as a 32-bit unsigned; masking with `>>> 0` matches the
  //   x86 32-bit-op semantics (implicit zero-extension into the full
  //   64-bit lane).
  const inU32 = input >>> 0; // @0x148414 movl %edi,%eax (u32 domain)
  // @0x148416 andl $0x1,%eax   ; eax = input & 1
  const bit0 = inU32 & 0x1;
  // @0x148419 movl %edi,%ecx   ; @0x1481b shrl $3,%ecx   ; @0x14841e andl $6,%ecx
  //   ecx = (input >> 3) & 6
  const shiftedMask = (inU32 >>> 3) & 0x6;
  // @0x148421 orl %eax,%ecx    ; ecx |= (input & 1)
  const ecx_partial = shiftedMask | bit0;
  // @0x148423 movl %edi,%eax   ; @0x148425 andl $0x2,%eax
  //   eax = input & 2
  const bit1 = inU32 & 0x2;
  // @0x148428 leal (%rcx,%rax,4),%ecx  ; ecx = ecx_partial + (bit1 * 4)
  //   Equivalently: ecx |= (bit1 << 2) — since bit1 is in {0,2} and the
  //   shift-by-2 result is in {0,8} which is DISJOINT from ecx_partial
  //   bits (ecx_partial covers bits 0,1,2), the ADD and OR are
  //   bit-identical here. We use ADD to faithfully mirror `leal`.
  const shuffled = (ecx_partial + bit1 * 4) >>> 0;
  // @0x14842b cmpl $0x4,%edi   ; @0x14842e movl $0x23,%eax
  // @0x148433 cmovnel %ecx,%eax
  //   result = (input == 4) ? 0x23 : shuffled
  const result = inU32 === 4 ? 0x23 : shuffled;
  // @0x148436 popq %rbp / @0x148437 retq
  return result;
}
