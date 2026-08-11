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
//   0xa77fe  …17getIconIDInternalEv                                    <- an EARLIER unit
//   0xa7788  __ZN28OZChannelQuadPercent_Factory8revisionEv             revision()  <- THIS UNIT
// Only getIconIDInternal and revision are transcribed here; the others are unclaimed and
// deliberately ABSENT rather than stubbed. This file will grow method by method, ADD-only.
//
// Source disasm: raw-port/re/disasm/ProChannel.__ZN28OZChannelQuadPercent_Factory17getIconIDInternalEv.s
// and raw-port/re/disasm/ProChannel.__ZN28OZChannelQuadPercent_Factory8revisionEv.s,
// re-derived with `raw-port/tools/disasm.sh --sym … ProChannel` after deleting any cached copy, so
// each body below is read from the binary and not from a peer's leftover scratch in the pool slot.

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

  /**
   * `OZChannelQuadPercent_Factory::revision()` -> unsigned
   * @ProChannel __ZN28OZChannelQuadPercent_Factory8revisionEv @0xa7788..0xa778f
   *
   * FULL DISASM — the whole function, five instructions, and the symbol is exactly eight bytes
   * wide (the next symbol in the cached inventory, `getCategoryName`, starts at 0xa7790):
   *   0xa7788  pushq %rbp                 ; frame
   *   0xa7789  movq  %rsp, %rbp
   *   0xa778c  xorl  %eax, %eax           ; return 0
   *   0xa778e  popq  %rbp
   *   0xa778f  retq
   *
   * The factory reports revision 0. `this` is never dereferenced — %rdi is dead on entry — so the
   * value belongs to the class rather than to an instance, which is why it can be read off a
   * factory that was never constructed. `xorl` on a 32-bit register zeroes the whole 64-bit %rax,
   * so there is no garbage in the upper half for a `unsigned`-returning caller to see; the probe
   * below reads %rax as a u64 to check exactly that.
   *
   * This is the same five instructions as the landed `OZStyle_Factory::revision` @Ozone 0x196f0
   * and `OZChannelDecibel_Factory::revision` @ProChannel 0x1027c, and it sits directly beside this
   * class's own `version()` @0xa777c, which instead loads `$0x1` — so 0 here is this method's own
   * value and not a family default.
   *
   * ORACLED against the live symbol (a local `t` symbol is still callable by address):
   * `raw-port/re/oracle/OZChannelQuadPercent_Factory_revision_probe.py`, ProChannel loaded under
   * `arch -x86_64` through the recursive `@rpath` preloader, the eight prologue bytes at
   * slide+0xa7788 checked against `554889e531c05dc3` before the address is trusted, four receivers
   * (NULL, an unmapped 1, 0xdeadbeef, and a live arena) all returning 0, the full %rax 0x0, and a
   * 0x200-byte `this` arena poisoned with 0xCD byte-identical afterwards. Three live mutation
   * controls on neighbouring methods of the same class are all KILLED — `getIconIDInternal`
   * @0xa77fe (-1), `version` @0xa777c (1), and `getIconNameInternal` @0xa77ce, which writes 8
   * bytes into its own poisoned arena and so proves the arena comparison can detect a store.
   */
  revision(): number {
    return 0; // @0xa778c xorl %eax, %eax
  }
}
