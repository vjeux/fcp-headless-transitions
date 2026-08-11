// OZStyle_Factory.ts — Ozone framework.
// OZStyle_Factory::revision() — one method of Ozone's OZStyle factory.
//
// NOT THE SAME CLASS AS `raw-port/src/channels/OZStyleFactory.ts`, which sits beside it in this
// directory. The Itanium mangling settles it: this class is `15OZStyle_Factory` (fifteen
// characters, with the underscore) and that one is `14OZStyleFactory` (fourteen, without). Ozone
// carries both — 17 symbols under the underscored name and 2 under the other — and they do not
// share a single address: `OZStyleFactory` exists only as a pair of `ud2` destructor traps at
// @Ozone 0x6dadb0/0x6dadc0, while this class has a full factory surface at @Ozone 0x195f0..0x196f0.
// Do not merge the two files; `check_duplicate_classes.py` correctly does not flag them, because
// its `_norm` collapses RUNS of underscores rather than deleting them.
//
// Binary source (x86_64 slice of the FAT Ozone framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// THE CLASS'S SYMBOLS, from the cached inventory (`grep __ZN15OZStyle_Factory
// raw-port/army/inventory/Ozone.syms.txt`), all LOCAL (`t`):
//   0x195f0  __ZN15OZStyle_FactoryD1Ev                       ~OZStyle_Factory [complete-object]
//   0x19620  __ZN15OZStyle_FactoryD0Ev                       ~OZStyle_Factory [deleting]
//   0x19650  __ZN15OZStyle_Factory6createERK8PCStringj       create(PCString const&, unsigned)
//   0x19660  __ZN15OZStyle_Factory10createCopyEP13OZFactoryBasej
//   0x19670  __ZN15OZStyle_Factory14createInstanceEP13OZFactoryBase
//   0x196f0  __ZN15OZStyle_Factory8revisionEv                <- THIS UNIT
// Only `revision` is transcribed here; the others are unclaimed and are deliberately ABSENT
// rather than stubbed. This file will grow method by method, ADD-only.
//
// Source disasm: raw-port/re/disasm/Ozone.__ZN15OZStyle_Factory8revisionEv.s, re-derived with
// `raw-port/tools/disasm.sh --sym … Ozone` after deleting any cached copy, so the body below is
// read from the binary and not from a peer's leftover scratch in the pool slot.

/**
 * `OZStyle_Factory` — the Ozone factory for OZStyle objects.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this`. The unit
 * that establishes the layout will be the constructor, which is not in this file.
 *
 * @Ozone 0x196f0
 */
export class OZStyle_Factory {
  /**
   * `OZStyle_Factory::revision()` -> unsigned
   * @Ozone __ZN15OZStyle_Factory8revisionEv @0x196f0..0x196f7
   *
   * FULL DISASM — the whole function, five instructions:
   *   0x196f0  pushq %rbp                 ; frame
   *   0x196f1  movq  %rsp, %rbp
   *   0x196f4  xorl  %eax, %eax           ; return 0
   *   0x196f6  popq  %rbp
   *   0x196f7  retq
   *   0x196f8  nopl  (%rax,%rax)          ; alignment padding, not part of the body
   *
   * The factory reports revision 0. `this` is never dereferenced — %rdi is dead on entry — so the
   * value belongs to the class rather than to an instance. Identical, instruction for
   * instruction, to the landed `OZChannelDecibel_Factory::revision` @ProChannel 0x1027c.
   *
   * ORACLED against the live symbol (a local `t` symbol is still callable by address): Ozone
   * loaded under `arch -x86_64` through the recursive `@rpath` preloader, the eight prologue
   * bytes at slide+0x196f0 checked against `554889e531c05dc3` before the address is trusted,
   * eight calls all returning 0, and a `this` arena poisoned with 0xCD byte-identical afterwards
   * — so "reads nothing, returns 0" is measured rather than read off the listing.
   */
  revision(): number {
    return 0; // @0x196f4 xorl %eax, %eax
  }
}
