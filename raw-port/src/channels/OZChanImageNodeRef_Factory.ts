// OZChanImageNodeRef_Factory.ts — raw transcription of the Ozone class
// `OZChanImageNodeRef_Factory`.
//
// ONE symbol is transcribed in this file — `version()`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add one without its own disassembly and
// address citations. The siblings, for orientation only (from
// `grep OZChanImageNodeRef_Factory raw-port/army/inventory/Ozone.syms.txt`):
//   0x1bc80  ~OZChanImageNodeRef_Factory()               [D1]
//   0x1bcb0  ~OZChanImageNodeRef_Factory()               [D0]
//   0x1bce0  create(PCString const&, unsigned)
//   0x1bd40  createCopy(OZFactoryBase*, unsigned)
//   0x1bda0  createInstance(OZFactoryBase*)
//   0x1bdb0  description()
//   0x1bdd0  unlocalizedDescription()
//   0x1bdf0  manufacturer()
//   0x1be20  revision()
//   0x1be30  getCategoryName()
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x1be10  OZChanImageNodeRef_Factory::version()
//               __ZN26OZChanImageNodeRef_Factory7versionEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN26OZChanImageNodeRef_Factory7versionEv Ozone`):
//   raw-port/re/disasm/__ZN26OZChanImageNodeRef_Factory7versionEv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x1be10  pushq  %rbp                 ; frame setup (no TS counterpart)
//   0x1be11  movq   %rsp, %rbp           ; frame setup (no TS counterpart)
//   0x1be14  movl   $0x1, %eax           ; return 1 — the entire computation
//   0x1be19  popq   %rbp                 ; frame teardown (no TS counterpart)
//   0x1be1a  retq                        ; return %eax
//   0x1be1b  nopl   (%rax,%rax)          ; alignment padding, not executed
//
// One immediate move: this factory declares format version 1. There is no load, no call, no branch,
// and `%rdi` is never touched, so `this` is not read.
//
// NOT AN EMPTY BODY, and the distinction is worth stating because a reviewer meeting a
// constant-returning function has to decide whether it is a stub: an empty C++ body would leave
// %eax undefined, and this one deliberately sets it. Its immediate neighbour proves the pair are
// deliberate rather than accidental — `revision()` @0x1be20 is the same six-instruction shape with
// `xorl %eax,%eax` in place of `movl $0x1,%eax`, i.e. version 1, revision 0. That neighbour is a
// separate ledger unit and is NOT ported here; it is cited because it is also this port's
// sensitivity control (see ORACLE below).
//
// DEPENDENCIES: none. `depgraph.py deps __ZN26OZChanImageNodeRef_Factory7versionEv` lists nothing —
// zero in-scope callees, zero externs, zero indirect or virtual dispatch.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live Ozone function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZChanImageNodeRef_Factory_version_oracle.py, under
// `arch -x86_64 /usr/bin/python3` because this port is transcribed from the x86_64 slice.
//
// The symbol is a LOCAL (`nm` type `t`), so dlsym cannot reach it. It is called at
// `_dyld_get_image_vmaddr_slide(Ozone) + 0x1be10`, with the vmaddr taken from the cached x86_64
// inventory rather than from a bare `nm` — which reports the ARM64 slice even from a Rosetta
// process and would land inside the mapped image on some other function. The harness verifies the
// nine prologue bytes at that address before believing any number.
//
// Measured run:
//   SELF-CHECK PASS   slide 0x122261000; inventory vmaddr == 0x1be10;
//                     version  bytes 55 48 89 e5 b8 01 00 00 00
//                     revision bytes 55 48 89 e5 31 c0
//   version()   128/128 calls returned 1 — 64 with a NULL receiver and 64 with a pointer to a
//               0xEE-poisoned 0x40-byte arena, which is the measurement behind modelling this as a
//               `static`: the answer does not depend on a receiver because the body never reads one
//   read-only   the poisoned arena is byte-identical after the call, so nothing is written
//
// SENSITIVITY CONTROL, because a constant-returning function cannot otherwise be told apart from a
// harness that never reads %eax — a dead control means the instrument is blind, not that the port
// is right. The control is the neighbour `revision()` @0x1be20, called through the SAME CFUNCTYPE:
// it returns 0 while this one returns 1. Two different constants read correctly through one
// mechanism is what establishes that the 1 came from the machine.

/**
 * `OZChanImageNodeRef_Factory` — Ozone's factory for OZChanImageNodeRef channels.
 *
 * No instance state is modelled: the one transcribed method never reads `this` (see the file
 * header). The 0x88-byte instance layout belongs to the ctor, which is a separate ledger unit.
 *
 * @Ozone 0x1be10
 */
export class OZChanImageNodeRef_Factory {
  /**
   * `OZChanImageNodeRef_Factory::version()` — @Ozone 0x1be10
   *   (__ZN26OZChanImageNodeRef_Factory7versionEv).
   *
   * Faithful transcription of the six-instruction body quoted in the file header: the constant 1.
   *
   * Declared `static`, following the landed convention of the sibling factories (see
   * `OZChanObjectRef_Factory.getIconIDInternal` @ProChannel 0x13054, which makes the same call for
   * the same reason). Two things justify it here rather than one: the body does not touch `%rdi`,
   * and the oracle calls the live symbol with a NULL receiver and with a poisoned arena and gets 1
   * from both. A static also keeps the export out of G5's `<Class>_<method>` join rule — this class
   * name contains an underscore, so an `export function OZChanImageNodeRef_Factory_version` would
   * yield the method token `Factory_version`, which no Itanium symbol's last component can equal.
   *
   * @returns the 32-bit value in %eax.
   */
  static version(): number {
    // @0x1be10..@0x1be11 — prologue.
    // @0x1be14  movl $0x1, %eax — the 32-bit immediate; the C++ return type is a 32-bit version
    //   number and the value is positive, so the signed/unsigned reading is the same 1 either way.
    // @0x1be19..@0x1be1a — epilogue + retq.
    return 1;
  }
}
