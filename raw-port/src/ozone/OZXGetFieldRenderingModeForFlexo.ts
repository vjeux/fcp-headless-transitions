// OZXGetFieldRenderingModeForFlexo.ts — Ozone framework.
// OZXGetFieldRenderingModeForFlexo(unsigned int) — a free function (no namespace, no class: the
// mangling `__Z32OZXGetFieldRenderingModeForFlexoj` has no nested-name prefix) that maps Flexo's
// field-rendering selector onto Ozone's own field-rendering mode.
//
// Binary source (x86_64 slice of the FAT Ozone framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Source disasm: raw-port/re/disasm/Ozone.__Z32OZXGetFieldRenderingModeForFlexoj.s, re-derived
// with `raw-port/tools/disasm.sh --sym … Ozone` after deleting any cached copy.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@Ozone 0x608c20  __Z32OZXGetFieldRenderingModeForFlexoj)
// -----------------------------------------------------------------------------
//   0x608c20  pushq %rbp ; movq %rsp,%rbp     ; frame
//   0x608c24  xorl  %eax, %eax                ; eax = 0
//   0x608c26  cmpl  $0x1, %edi                ; input == 1 ?
//   0x608c29  sete  %al                       ; al = (input == 1)
//   0x608c2c  leal  (%rax,%rax,2), %ecx       ; ecx = 3 * al      -> 3 when input == 1, else 0
//   0x608c2f  cmpl  $0x2, %edi                ; input == 2 ?
//   0x608c32  movl  $0x4, %eax                ; eax = 4           (computed unconditionally)
//   0x608c37  cmovnel %ecx, %eax              ; if (input != 2) eax = ecx
//   0x608c3a  popq %rbp ; retq
//   0x608c3c  nopl  (%rax)                    ; alignment padding
//
// BRANCHLESS, and worth reading carefully because the two comparisons are evaluated in the
// opposite order to the way the result reads: the `== 1` test is folded into a 0/1 byte, tripled
// by the `leal` (the classic multiply-by-three address-arithmetic trick, NOT a memory access),
// and the `== 2` test then overrides it with 4 through a `cmovne`. There is no default branch and
// no range check — every other input, including 0 and 0xffffffff, falls out of the `leal` as 0.
//
// So the whole function is the mapping   1 -> 3,  2 -> 4,  everything else -> 0.
//
// THE ENUMERATORS ARE NOT DECODED HERE. The names on both sides (a Flexo selector in, an Ozone
// "field rendering mode" out) are the only evidence this function carries about what 1, 2, 3 and
// 4 MEAN, and it reads none of them from anywhere else. Naming them would be invention; the unit
// that consumes the result is where they can be grounded.

/**
 * `OZXGetFieldRenderingModeForFlexo(unsigned int)` -> unsigned int
 * @Ozone __Z32OZXGetFieldRenderingModeForFlexoj @0x608c20..0x608c3b
 *
 * ORACLED against the live exported symbol (`nm` type `T`), Ozone loaded under `arch -x86_64`
 * through the recursive `@rpath` preloader, with the fifteen prologue bytes at slide+0x608c20
 * checked against `554889e531c083ff010f94c08d0c40` before the address is trusted: 222 cases —
 * 0..15, both int32 extremes, 0xffffffff, 0xfffffffe, 65536, 12345678 and 200 random u32s —
 * **222/222 agree**, and the live map over the interesting neighbourhood is
 * `{0: 0, 1: 3, 2: 4, 3: 0, 4: 0, 5: 0}`.
 *
 * @param mode the Flexo-side selector (SysV %edi, u32).
 */
export function OZXGetFieldRenderingModeForFlexo(mode: number): number {
  // @0x608c24/@0x608c26/@0x608c29 — xorl %eax,%eax ; cmpl $1,%edi ; sete %al.
  const isOne = (mode >>> 0) === 1 ? 1 : 0;
  // @0x608c2c — leal (%rax,%rax,2), %ecx : ecx = al * 3.
  const tripled = isOne * 3;
  // @0x608c2f/@0x608c32/@0x608c37 — cmpl $2,%edi ; movl $4,%eax ; cmovnel %ecx,%eax.
  // The 4 is computed unconditionally and kept only when the input is exactly 2.
  return (mode >>> 0) === 2 ? 4 : tripled;
}
