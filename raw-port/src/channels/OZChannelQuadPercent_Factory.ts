// OZChannelQuadPercent_Factory.ts — ProChannel framework.
// OZChannelQuadPercent_Factory::getIconIDInternal() — one method of the factory singleton for
// OZChannelQuadPercent.
//
// Binary source (x86_64 slice of the FAT ProChannel framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
//
// WHY A NEW FILE. The channel class itself is `raw-port/src/channels/OZChannelQuadPercent.ts`,
// which references this factory only as a throwing `getInstance` helper — the FACTORY is a
// separate C++ class (`__ZN28OZChannelQuadPercent_Factory…`) and the landed convention gives it
// its own file, as `OZChannelPositionPercent3D_Factory.ts` and the rest of the OZChannel*_Factory
// family do. The two file names are distinct keys for `check_duplicate_classes.py`.
//
// THE CLASS'S SYMBOLS, from the cached inventory
// (`grep QuadPercent_Factory raw-port/army/inventory/ProChannel.syms.txt`), all LOCAL (`t`):
//   0xa6db2  __ZN28OZChannelQuadPercent_Factory11getInstanceEv         getInstance()
//   0xa7592  __ZN28OZChannelQuadPercent_FactoryC2Ev                    ctor
//   0xa761a / 0xa763e   D1 / D0                                        dtors
//   0xa766a  …6createERK8PCStringj                                     create(PCString const&, unsigned)
//   0xa76c2  …10createCopyEP13OZFactoryBasej                           createCopy(...)
//   0xa77fe  …17getIconIDInternalEv                                    <- THIS UNIT
// Only getIconIDInternal is transcribed here; the others are unclaimed and deliberately ABSENT
// rather than stubbed. This file will grow method by method, ADD-only.
//
// Source disasm: raw-port/re/disasm/ProChannel.__ZN28OZChannelQuadPercent_Factory17getIconIDInternalEv.s,
// re-derived with `raw-port/tools/disasm.sh --sym … ProChannel` after deleting any cached copy.

/**
 * `getIconIDInternal()` returns `-1`: the body loads the immediate `$0xffffffff` into %eax, and
 * the return type is a signed 32-bit id, so the value IS -1 rather than 4294967295.
 * @ProChannel 0xa7802
 */
const OZ_CHANNEL_QUAD_PERCENT_FACTORY_ICON_ID_INTERNAL = -1;

/**
 * `OZChannelQuadPercent_Factory` — the ProChannel factory singleton for OZChannelQuadPercent.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this`. The
 * layout will be grounded by the constructor @ProChannel 0xa7592, which is not in this file.
 *
 * @ProChannel 0xa77fe
 */
export class OZChannelQuadPercent_Factory {
  /**
   * `OZChannelQuadPercent_Factory::getIconIDInternal()` -> int
   * @ProChannel __ZN28OZChannelQuadPercent_Factory17getIconIDInternalEv @0xa77fe..0xa7808
   *
   * FULL DISASM — the whole function, five instructions:
   *   0xa77fe  pushq %rbp                      ; frame
   *   0xa77ff  movq  %rsp, %rbp
   *   0xa7802  movl  $0xffffffff, %eax         ; return -1
   *   0xa7807  popq  %rbp
   *   0xa7808  retq
   *   0xa7809  nop                             ; alignment padding
   *
   * "No icon": the factory answers -1 whatever it is asked, and never dereferences `this`
   * (%rdi is dead on entry). The landed `OZChannelPositionPercent3D_Factory` documents the same
   * immediate at @ProChannel 0xa6aa4 with the same reading — `$0xffffffff` sign-extended to a
   * signed id is -1, not 4294967295.
   *
   * ORACLED against the live symbol (a local `t` symbol is still callable by address): ProChannel
   * loaded under `arch -x86_64`, the eleven prologue bytes at slide+0xa77fe checked against
   * `554889e5b8ffffffff5dc3` before the address is trusted, eight calls returning exactly {-1},
   * and a `this` arena poisoned with 0xCD byte-identical afterwards.
   */
  getIconIDInternal(): number {
    return OZ_CHANNEL_QUAD_PERCENT_FACTORY_ICON_ID_INTERNAL; // @0xa7802 movl $0xffffffff, %eax
  }
}
