// OZChannelBlendMode_Factory.ts — raw transcription of the Ozone class
// `OZChannelBlendMode_Factory`.
//
// ONE symbol is transcribed in this file — `revision()`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add one without its own disassembly and
// address citations. The siblings, for orientation only (from
// `grep 26OZChannelBlendMode_Factory raw-port/army/inventory/Ozone.syms.txt`):
//   0x1cd00  __call_once_proxy<…getInstance()::'lambda'()>(void*)
//   0x1cdc0  ~OZChannelBlendMode_Factory()               [D1]      0x1cdf0  [D0]
//   0x1ce20  create(PCString const&, unsigned)
//   0x1ce80  createCopy(OZFactoryBase*, unsigned)
//   0x1cee0  createInstance(OZFactoryBase*)
//   0x1cef0  description()                               0x1cf10  unlocalizedDescription()
//   0x1cf30  manufacturer()
//   0x1cf50  version()                                   0x1cf60  revision()   <-- ported here
//   0x1cf70  getCategoryName()                           0x1cf90  getEnglishCategoryName()
//   0x1cfb0  getBundleID()
//   0x1cfc0  getIconNameInternal()                       0x1cfe0  getIconNameBWInternal()
//   0x1d000  getIconIDInternal()                         0x1d010  getLibraryIconNameInternal()
//   0x1d030  createChannel(PCString const&, unsigned)
//   0x1d090  createChannelCopy(OZChannelBase*, unsigned)
//   0x1d0f0  createChannelInstance(OZChannelBase*)
//   0x1d100  __ZThn128_ D1 thunk                         0x1d120  __ZThn128_ D0 thunk
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x1cf60  OZChannelBlendMode_Factory::revision()
//               __ZN26OZChannelBlendMode_Factory8revisionEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN26OZChannelBlendMode_Factory8revisionEv Ozone`):
//   raw-port/re/disasm/__ZN26OZChannelBlendMode_Factory8revisionEv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x1cf60  pushq  %rbp                 ; frame setup (no TS counterpart)
//   0x1cf61  movq   %rsp, %rbp           ; frame setup (no TS counterpart)
//   0x1cf64  xorl   %eax, %eax           ; return 0 — the entire computation
//   0x1cf66  popq   %rbp                 ; frame teardown (no TS counterpart)
//   0x1cf67  retq                        ; return %eax
//   0x1cf68  nopl   (%rax,%rax)          ; alignment padding, not executed
//
// One zeroing idiom: this factory declares revision 0. There is no load, no call, no branch, and
// `%rdi` is never touched, so `this` is not read.
//
// NOT AN EMPTY BODY, and the distinction matters because a reviewer meeting a constant-returning
// function has to decide whether it is a stub. `xorl %eax,%eax` is the compiler's two-byte spelling
// of `movl $0x0,%eax` — the value is deliberately SET, where an empty C++ body would leave %eax
// undefined. The immediate neighbour settles it: `version()` @0x1cf50 is the same six-instruction
// shape with `movl $0x1,%eax`, so the pair reads "format version 1, revision 0". That neighbour is
// a separate ledger unit and is NOT ported here; it is cited because it is also this port's
// sensitivity control (see ORACLE below). The same version/revision pairing is landed on
// OZChanImageNodeRef_Factory (@0x1be10 / @0x1be20) and FFOZAudioUnitEffectRootChannel_Factory.
//
// DEPENDENCIES: none. `depgraph.py deps __ZN26OZChannelBlendMode_Factory8revisionEv` lists nothing —
// zero in-scope callees, zero externs, zero indirect or virtual dispatch.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live Ozone function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZChannelBlendMode_Factory_revision_oracle.py, under
// `arch -x86_64 /usr/bin/python3` because this port is transcribed from the x86_64 slice and an
// arm64 vmaddr would land on some other function and fail silently toward VERIFIED.
//
// The symbol is a LOCAL (`nm` type `t`), so dlsym cannot reach it; it is called at
// `_dyld_get_image_vmaddr_slide(Ozone) + 0x1cf60`, with the six body bytes checked against the
// transcription BEFORE the call so a wrong address cannot masquerade as a right answer.
//
// The measurement and its controls (all of them fired):
//   * live `revision()` returns 0, from a `this` poisoned with 0xCD, and the arena is byte-identical
//     afterwards;
//   * called again with `this` pointing at UNMAPPED memory (0xdead0000) it still returns 0 — so
//     "does not read its receiver" is enforced by the hardware rather than by inspection;
//   * SENSITIVITY CONTROL: the neighbour `version()` @0x1cf50, called through the IDENTICAL
//     CFUNCTYPE in the same process, returns 1. A harness that cannot see a return value would
//     report the same number for both, so "0" being reported for revision means the harness is
//     reading the real %eax. (This is the sibling-override control this project's ops log
//     prescribes for constant-returning bodies, which is strictly better than "call something
//     non-zero".)
//   * NEGATIVE CONTROL: the same byte checks one byte off the entry point must fail, and do.
// Result: VERIFIED, 0 divergences.

/**
 * `OZChannelBlendMode_Factory` — the Ozone factory for blend-mode channels. Only its `revision()`
 * accessor is ported in this file; every other member is a separate ledger entry.
 *
 * The class carries no modelled state: the ported method reads no memory, and adding fields now
 * would be invention. They belong to whichever unit first decodes one.
 */
export class OZChannelBlendMode_Factory {
  /**
   * `OZChannelBlendMode_Factory::revision()` — @Ozone 0x1cf60
   * (__ZN26OZChannelBlendMode_Factory8revisionEv).
   *
   * Six instructions, transcribed in full:
   *
   *   0x1cf60  pushq %rbp        ; frame setup
   *   0x1cf61  movq  %rsp, %rbp
   *   0x1cf64  xorl  %eax, %eax  ; return 0 — the entire computation
   *   0x1cf66  popq  %rbp
   *   0x1cf67  retq
   *
   * The C++ return type is the unsigned the factory-base `revision()` virtual declares, and the
   * value fits a 32-bit register (`xorl` zeroes the full 64-bit %rax, but only %eax is defined by
   * the ABI as the return), so a plain `number` is exact here — no `>>> 0` is needed for 0, and
   * adding one would be modelling a truncation the instruction does not perform.
   */
  revision(): number {
    // @0x1cf60..0x1cf61 — prologue (no TS-visible effect).
    // @0x1cf64  xorl %eax, %eax
    // @0x1cf66..0x1cf67 — epilogue + retq.
    return 0; // @Ozone 0x1cf64
  }
}
