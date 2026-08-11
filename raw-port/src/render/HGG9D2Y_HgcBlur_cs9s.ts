// HGG9D2Y_HgcBlur_cs9s.ts — Helium framework.
// HGG9D2Y<HgcBlur_cs9s> — one instantiation of the HGG9D2Y template, the Helium
// "generic 9-tap 2-dimensional Y-separable" node family: an HGNode-derived shader
// node parameterised on the compute-shader kernel type it dispatches, here
// `HgcBlur_cs9s` (the 9-sample separable blur kernel). It is a sibling in shape of
// the landed HGSGX / HGSGY / HGDenoisePDEIteration nodes in this directory.
//
// Binary source (x86_64 slice of the FAT Helium framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// THE SYMBOLS OF THIS INSTANTIATION, from the cached inventory
// (`grep HGG9D2YI12HgcBlur_cs9sE raw-port/army/inventory/Helium.syms.txt`) — all of them
// LOCAL (`t`) symbols, since a template instantiation is emitted per translation unit:
//   0x1f6a20  __ZN7HGG9D2YI12HgcBlur_cs9sEC2EN6HGBlur9TapMethodE   ctor(HGBlur::TapMethod)
//   0x1f6af0  __ZN7HGG9D2YI12HgcBlur_cs9sED1Ev                     ~HGG9D2Y [complete-object]
//   0x1f6b00  __ZN7HGG9D2YI12HgcBlur_cs9sED0Ev                     ~HGG9D2Y [deleting]
//   0x1f6b20  __ZNK7HGG9D2YI12HgcBlur_cs9sE7label_AEv              label_A() const
//   0x1f6b30  __ZN7HGG9D2YI12HgcBlur_cs9sE10RenderTileEP6HGTile    RenderTile(HGTile*)
//   0x1f6cd0  __ZN7HGG9D2YI12HgcBlur_cs9sE13GetFilterModeEi12HGFilterMode   <- THIS UNIT
// Only GetFilterMode is transcribed here. The other five are not yet claimed and are
// deliberately ABSENT rather than stubbed: this file will grow method by method, ADD-only.
//
// Source disasm: raw-port/re/disasm/Helium.__ZN7HGG9D2YI12HgcBlur_cs9sE13GetFilterModeEi12HGFilterMode.s
// re-derived with `raw-port/tools/disasm.sh --sym … Helium` after deleting any cached copy, so
// the body below is read from the binary and not from a peer's leftover scratch.

import type { HGFilterMode } from "./HGSGX.js";

/**
 * HGG9D2Y<HgcBlur_cs9s> — the node class. Its fields are not decoded here: this unit is a
 * method that reads no state, so nothing about the layout is grounded yet and inventing an
 * interface for it would be ungrounded. The ctor at @Helium 0x1f6a20 is the unit that will
 * establish the layout.
 */
export class HGG9D2Y_HgcBlur_cs9s {
  /**
   * HGG9D2Y<HgcBlur_cs9s>::GetFilterMode(int, HGFilterMode) -> HGFilterMode
   * @Helium __ZN7HGG9D2YI12HgcBlur_cs9sE13GetFilterModeEi12HGFilterMode @0x1f6cd0..0x1f6cd7
   *
   * FULL DISASM — the whole function, five instructions:
   *   0x1f6cd0  pushq %rbp                  ; frame
   *   0x1f6cd1  movq  %rsp, %rbp
   *   0x1f6cd4  xorl  %eax, %eax            ; return 0
   *   0x1f6cd6  popq  %rbp
   *   0x1f6cd7  retq
   *   0x1f6cd8  nopl  (%rax,%rax)           ; alignment padding, not part of the body
   *
   * It reads neither argument and never dereferences `this`: %rdi, %esi and %edx are dead on
   * entry, and the only instruction with an effect is the `xorl` that zeroes the return
   * register. So the node reports filter mode 0 — the first enumerator of HGFilterMode —
   * whatever level or requested mode it is asked about. That is the same body, instruction for
   * instruction, as the landed HGSGX::GetFilterMode @0x1c2360 in this directory.
   *
   * ORACLED against the live symbol, since a local symbol is still callable by address:
   * raw-port/re/oracle/HGG9D2Y_HgcBlur_cs9s_GetFilterMode_oracle.py loads Helium under
   * `arch -x86_64`, checks the eight prologue bytes at slide+0x1f6cd0 against `554889e531c05dc3`
   * before trusting the address at all, then sweeps 56 (int, HGFilterMode) pairs including both
   * int32 extremes: 56/56 agree, and a `this` arena poisoned with 0xCD is byte-identical
   * afterwards, which is the evidence that "reads no state" is a property of the machine code
   * rather than of the reading.
   *
   * @param _level the int the caller passes (dead — no instruction reads %esi)
   * @param _requested the HGFilterMode the caller passes (dead — no instruction reads %edx)
   */
  GetFilterMode(_level: number, _requested: HGFilterMode): HGFilterMode {
    return 0; // @0x1f6cd4 xorl %eax, %eax
  }
}
