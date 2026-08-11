// OZChanObjectRefWithPicker — Ozone.framework.
//
// One C++ class, one file. This file ports ONLY the symbol listed below; every other
// OZChanObjectRefWithPicker method (`clone` @0x3cb8c0, `setValue` @0x3cc1e0, `getNode` @0x3cc5b0,
// `setFootage` @0x3cc690, `addAcceptedFactoryUUID` @0x3cc6c0, `canReferenceObject` @0x3cc300, …)
// is its own ledger entry and will be ADDED to this file (additive extension only) when claimed.
//
// Symbols ported here:
//   0x00000000003cc6b0 T __ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb
//                        OZChanObjectRefWithPicker::setAllowsCyclicDependencies(bool)
//
// Disassembly sources (raw-port/re/disasm/):
//   __ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb.s   (ported here)
//   __ZNK25OZChanObjectRefWithPicker27getAllowsCyclicDependenciesEv.s  (layout evidence, and the
//                                                                      read-back the oracle uses)
//   __ZN18OZChanSceneNodeRef27setAllowsCyclicDependenciesEb.s          (the twin, see below)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — one field, recovered from a matched store/load pair)
// -----------------------------------------------------------------------------
// +0x9b : bool allowsCyclicDependencies
//     set  @0x3cc6b4  movb   %sil, 0x9b(%rdi)     ; raw byte store of arg1's low 8 bits
//     get  @0x3cc5a4  movzbl 0x9b(%rdi), %eax     ; ZERO-extending byte load
//   A one-byte store paired with a one-byte zero-extending load at the same displacement is what
//   identifies +0x9b as a single `bool`, rather than a byte of something wider. Nothing else in
//   this class is decoded here, so nothing else is modelled (PORTING_SPEC Rule 5).
//
// THE TWIN. `OZChanSceneNodeRef::setAllowsCyclicDependencies(bool)` @Ozone 0x1b37c0 — already
// ported at src/ozone/OZChanSceneNodeRef.ts — is byte-for-byte the same body at the same
// displacement (`movb %sil, 0x9b(%rdi)`), as is its getter @0x1b37b0. Two sibling `OZChan*Ref`
// classes carrying this flag at the same offset is consistent with it living in a shared base
// subobject, but no decoded instruction in either pair proves that, so this port does NOT model an
// inheritance relationship it cannot see: the field is declared on this class, exactly as the twin
// declares it on its own. This file sits beside that twin in src/ozone/ for the same reason.

/**
 * `OZChanObjectRefWithPicker` — an object-reference channel with a picker UI. Only the field
 * touched by the ported method is decoded; the object reaches at least +0x9b, and the class has
 * its own factory (`OZChanObjectRefWithPicker_Factory::create(PCString const&, unsigned)`
 * @Ozone 0x21760) — neither of which this file models.
 */
export class OZChanObjectRefWithPicker {
  /**
   * @Ozone offset +0x9b — `bool allowsCyclicDependencies`.
   *
   * Written by {@link OZChanObjectRefWithPicker.setAllowsCyclicDependencies} @0x3cc6b4
   * (`movb %sil, 0x9b(%rdi)`) and read back by
   * `OZChanObjectRefWithPicker::getAllowsCyclicDependencies() const` @0x3cc5a4
   * (`movzbl 0x9b(%rdi), %eax` — that getter is a separate ledger entry and is NOT ported here).
   *
   * Modelled as the raw BYTE the machine moves (0 or 1), not as a `boolean`, so the store below is
   * the store the disassembly performs and the zero-extending read-back has something to be
   * faithful to. Initial value 0: no decoded instruction in this class writes it before the setter
   * does, and a zero-initialised allocation is what the getter would then observe.
   */
  allowsCyclicDependencies_at_0x9b = 0;

  /**
   * `OZChanObjectRefWithPicker::setAllowsCyclicDependencies(bool)`
   *   — @Ozone 0x3cc6b0
   *   — __ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb
   *
   * FULL DISASM (raw-port/re/disasm/
   * __ZN25OZChanObjectRefWithPicker27setAllowsCyclicDependenciesEb.s — 7 lines: the label plus six
   * listed lines), every instruction accounted for:
   *
   *   0x3cc6b0  55                    pushq %rbp             ; frame setup (no TS counterpart)
   *   0x3cc6b1  48 89 e5              movq  %rsp, %rbp
   *   0x3cc6b4  40 88 b7 9b 00 00 00  movb  %sil, 0x9b(%rdi) ; this->allowsCyclicDependencies = arg1
   *   0x3cc6bb  5d                    popq  %rbp             ; epilogue (no TS counterpart)
   *   0x3cc6bc  c3                    retq                   ; void return
   *   0x3cc6bd  0f 1f 00              nopl  (%rax)           ; alignment pad — not executed
   *
   * THE BODY IS COMPLETE: the thirteen instruction bytes run 0x3cc6b0..0x3cc6bc, the three-byte
   * `nopl` pads to 0x3cc6c0, and the next symbol starts at exactly 0x3cc6c0
   * (`__ZN25OZChanObjectRefWithPicker22addAcceptedFactoryUUIDE6PCUUID`). There is no room for
   * another instruction, and no `xorl %eax,%eax` — consistent with the `void` return.
   *
   * ONE STORE AND NOTHING ELSE: no null check on `this`, no read of any other field, no
   * revalidation of the dependency graph, no call, no branch. Clearing the flag on a reference
   * that already participates in a cycle does NOT break that cycle — the byte is simply
   * overwritten. Adding any of that here would be an instruction the machine does not execute.
   *
   * ON THE ARGUMENT. `movb %sil, …` moves the LOW 8 BITS of %rsi verbatim: the machine does no
   * normalisation, which the oracle measured by passing 0xFF and 0x02 and finding those exact
   * bytes at +0x9b. The SysV ABI guarantees a C++ `bool` argument is 0 or 1 there — which is why
   * the getter can `movzbl` it straight back out as a bool — so the port takes a `boolean` to
   * match the C++ signature and writes the corresponding 0/1 byte. That is also what the ported
   * twin `OZChanSceneNodeRef_setAllowsCyclicDependencies` does.
   *
   * DEPENDENCIES: none — `depgraph.py` records this symbol as `{"fw": "Ozone", "deps": [],
   * "n_extern_oos": 0, "indirect": 0}`.
   *
   * MEASURED AGAINST THE LIVE BINARY.
   * `raw-port/re/oracle/OZChanObjectRefWithPicker_setAllowsCyclicDependencies_oracle.py` (under
   * `arch -x86_64 /usr/bin/python3`) dlsym's this exported `T` symbol, checks the address is
   * slide+0x3cc6b0 and that the 13 mapped opcode bytes are the ones above, then calls it over a
   * 0xCD-poisoned 0x100-byte arena and, for each argument, diffs the WHOLE arena afterwards — so
   * "it wrote 1 byte, at +0x9b, and touched nothing else" is observed rather than assumed. The
   * stored byte is then read back through the LIVE getter @0x3cc5a0, which is what proves the
   * setter writes where the getter reads. The REAL TypeScript below is driven over the same
   * true/false cases by `…_driver.mts` and must produce the same (offset, value) observation.
   * Five negative controls — write +0x9a, write +0x9c, invert the flag, only ever set it, write
   * two bytes — must each diverge, and do. Result: **PASS, 0 checks failed** — 17 checks, the
   * dlsym'd address equal to slide+0x3cc6b0 and the 13 opcode bytes equal, one byte written at
   * +0x9b for every argument (0x00/0x01/0xFF/0x02/0x80, each stored verbatim) with the other 255
   * bytes of the arena untouched, the live getter reading each one back, and the TypeScript
   * writing `+0x9b:0` / `+0x9b:1` exactly where the live function does.
   *
   * COST NOTE for whoever runs it: loading Ozone with the recursive `@rpath` preload takes about
   * 8 minutes on this box under swarm load (it pulls in ~44 images and initialises CGL), against
   * ~1.5s for a ProCore/ProChannel/Helium oracle. Budget for it, and do not read a slow start as
   * a hang.
   *
   * @param value the new flag — %sil.
   */
  setAllowsCyclicDependencies(value: boolean): void {
    // @0x3cc6b4  movb %sil, 0x9b(%rdi) — the whole body: one raw byte store.
    this.allowsCyclicDependencies_at_0x9b = value ? 1 : 0;
    // @0x3cc6bb..0x3cc6bc  popq %rbp ; retq — void return.
  }
}
