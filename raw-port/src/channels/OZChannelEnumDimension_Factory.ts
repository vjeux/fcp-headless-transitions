// OZChannelEnumDimension_Factory.ts — Ozone's factory for enum-dimension channels.
//
// This file currently transcribes one method; every other factory member is a
// separate ledger unit and is deliberately absent.
//
// Binary source (x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Source disassembly:
//   raw-port/re/disasm/__ZN30OZChannelEnumDimension_Factory8revisionEv.s
//
// Ported symbol:
//   @0x22f00 __ZN30OZChannelEnumDimension_Factory8revisionEv
//              OZChannelEnumDimension_Factory::revision()
//
// Complete body:
//   0x22f00  pushq %rbp
//   0x22f01  movq  %rsp, %rbp
//   0x22f04  xorl  %eax, %eax
//   0x22f06  popq  %rbp
//   0x22f07  retq
//   0x22f08  nopl  (%rax,%rax)  ; alignment padding
//
// The body has zero callees, branches, and memory accesses. The deliberate
// `xorl %eax,%eax` distinguishes revision 0 from an empty method that leaves
// the return register undefined.

/**
 * `OZChannelEnumDimension_Factory` — partial factory port containing only the
 * claimed revision accessor. No fields are modeled because this method never
 * reads its receiver.
 */
export class OZChannelEnumDimension_Factory {
  /**
   * OZChannelEnumDimension_Factory::revision()
   * @Ozone __ZN30OZChannelEnumDimension_Factory8revisionEv
   * @0x22f00..0x22f07
   *
   * The factory-base virtual returns an unsigned revision number. The x86_64
   * body explicitly zeroes `%eax` at @0x22f04, then returns without touching
   * `this` or any global state.
   */
  revision(): number {
    return 0; // @Ozone 0x22f04 xorl %eax, %eax
  }
}
