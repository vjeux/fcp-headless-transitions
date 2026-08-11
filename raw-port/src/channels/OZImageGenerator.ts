// raw-port/src/channels/OZImageGenerator.ts
//
// FCP `OZImageGenerator` — Ozone.framework. This file ports ONE ledger unit,
// `filteredEdges()`; the rest of the class accretes here as future units claim it (one C++
// class = one file). Filed under `channels/` to sit beside the rest of this virtual's family
// — the landed `channels/OZGradientSource.ts` ports the same override at @0x2fd2f0, and
// `channels/OZLiGenerator.ts`, `channels/OZFxGenerator.ts` and
// `channels/OZSoftGradientGenerator.ts` are its siblings. Checked before creating the file:
//   git ls-tree origin/main -r --name-only | grep -i OZImageGenerator   -> no hits,
// so this is not the "same class forked into a second layer directory" shape.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//         (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * __ZN16OZImageGenerator13filteredEdgesEv
//       -- OZImageGenerator::filteredEdges()   @Ozone 0x30c120   (`nm` class T)
//
// FULL DISASM (raw-port/re/disasm/__ZN16OZImageGenerator13filteredEdgesEv.s, 5 instructions):
//
//   0x30c120  pushq %rbp
//   0x30c121  movq  %rsp, %rbp
//   0x30c124  xorl  %eax, %eax          ; return 0
//   0x30c126  popq  %rbp
//   0x30c127  retq
//
// THE RETURN TYPE IS BOOL, AND THAT IS RECOVERED FROM THE FAMILY RATHER THAN ASSUMED. `xorl
// %eax,%eax` alone does not say whether the zero is a `false`, an integer 0 or a null pointer —
// it zeroes all of %rax either way. The other overrides of this same virtual settle it, and
// they are one `disasm.sh` each:
//
//   OZFxPlugSharedBase::filteredEdges  @Ozone 0x29bd60   movzbl 0xd2(%rdi), %eax   <- a BYTE field
//   OZGradientSource::filteredEdges    @Ozone 0x2fd2f0   movb   $0x1, %al          <- a BYTE 1
//   OZResIndependentRender::filteredEdges @Ozone 0xda660 xorl   %eax, %eax
//
// A `movzbl` of a one-byte member and a `movb $1,%al` are what a `bool` return compiles to; an
// int or a pointer would be `movl`/`movq`. The landed `channels/OZGradientSource.ts` already
// ports its member of this family as `filteredEdges(): boolean`, so this file follows it.
//
// So this override answers FALSE: OZImageGenerator does not filter edges. It is a constant, not
// a lookup — the body has no load, no call, no branch, and never touches `this` (%rdi is not
// even moved).
//
// DIFFERENTIAL vs the live binary — raw-port/re/oracle/
// OZImageGenerator_filteredEdges_{oracle.py,driver.mts}. A constant-returning function is exactly
// where a differential can be VACUOUS (a harness that never reads %eax agrees with any constant),
// so the harness carries a SENSITIVITY control that is far better than a synthetic one: it calls
// `OZGradientSource::filteredEdges` @0x2fd2f0 — the same virtual, the same signature, the same
// CFUNCTYPE, a different constant — immediately before each measured call. It returns true and
// this one returns false, on the same instrument, in the same process. The 5 prologue bytes at
// slide+0x30c120 are verified before any number is reported.
// RESULT: 64/64 calls, live false, port false, 0 divergences; sensitivity control 64/64 true.

/**
 * `OZImageGenerator` — an Ozone image-generator node. Only the method below is decoded; the
 * instance layout is deliberately NOT modelled, because `filteredEdges()` does not read it (the
 * body never dereferences `this`), and inventing fields from a method that does not touch them
 * is exactly what PORTING_SPEC Rule 5 forbids.
 */
export class OZImageGenerator {
  /**
   * `OZImageGenerator::filteredEdges()` @Ozone 0x30c120
   * (__ZN16OZImageGenerator13filteredEdgesEv).
   *
   * Disasm mirror (5 asm lines):
   *   pushq %rbp / movq %rsp,%rbp                               @0x30c120..0x30c123
   *   xorl  %eax, %eax                                          @0x30c124   (return FALSE)
   *   popq  %rbp / retq                                         @0x30c126..0x30c127
   *
   * Returns boolean `false` — the per-class override that says this generator does NOT have
   * edge coverage, against `OZGradientSource`'s `true` at @0x2fd2f0. See the file header for
   * how the bool return type is grounded in the family rather than assumed from `xorl`.
   */
  filteredEdges(): boolean {
    // @0x30c124 — xorl %eax, %eax.
    return false;
  }
}
