// OZChanShapeMaskRefWithPicker_Factory.ts — Ozone framework.
// OZChanShapeMaskRefWithPicker_Factory::getBundleID() — one method of the factory singleton for
// the shape-mask channel reference with a picker.
//
// Binary source (x86_64 slice of the FAT Ozone framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// THE CLASS'S SYMBOLS, from the cached inventory
// (`grep OZChanShapeMaskRefWithPicker_Factory raw-port/army/inventory/Ozone.syms.txt`), all
// LOCAL (`t`):
//   0x21fa0 / 0x21fd0   D1 / D0                                   destructors
//   0x22000  …6createERK8PCStringj                                create(PCString const&, unsigned)
//   0x22060  …10createCopyEP13OZFactoryBasej                      createCopy(...)
//   0x220c0  …14createInstanceEP13OZFactoryBase                   createInstance(...)
//   0x220d0  …11descriptionEv                                     description()
//   0x220f0  …22unlocalizedDescriptionEv                          unlocalizedDescription()
//   0x22110  …12manufacturerEv                                    manufacturer()
//   0x22130  …7versionEv                                          version()
//   0x22140  …8revisionEv                                         revision()
//   0x22150  …15getCategoryNameEv                                 getCategoryName()
//   0x22170  …22getEnglishCategoryNameEv                          getEnglishCategoryName()
//   0x22190  __ZN36OZChanShapeMaskRefWithPicker_Factory11getBundleIDEv   <- THIS UNIT
//   0x221a0  …19getIconNameInternalEv                             getIconNameInternal()
//   0x221c0  …21getIconNameBWInternalEv                           getIconNameBWInternal()
//   0x221e0  …17getIconIDInternalEv                               getIconIDInternal()
//   0x221f0  …26getLibraryIconNameInternalEv                      getLibraryIconNameInternal()
//   0x22210  …13createChannelERK8PCStringj                        createChannel(...)
//   0x22270  …17createChannelCopyEP13OZChannelBasej                createChannelCopy(...)
//   0x222d0  …21createChannelInstanceEP13OZChannelBase             createChannelInstance(...)
//   0x222e0 / 0x22300   __ZThn128_ D1 / D0 adjustor thunks
// Only `getBundleID` is transcribed here; the others are unclaimed and deliberately ABSENT rather
// than stubbed. This file will grow method by method, ADD-only. The class's `getInstance()` is not
// in the inventory as its own symbol — only its `__call_once_proxy` @0x21ee0 is — so it is inlined
// into its callers, and nothing here assumes otherwise.
//
// Source disasm: raw-port/re/disasm/__ZN36OZChanShapeMaskRefWithPicker_Factory11getBundleIDEv.s,
// re-derived with `raw-port/tools/disasm.sh --sym … Ozone` after deleting any cached copy, so the
// body below is read from the binary and not from a peer's leftover scratch in the pool slot.

/**
 * The `const char*` literal `getBundleID()` @0x22194 returns: the EMPTY string stored in Ozone's
 * `__TEXT,__cstring` at VA **0x7e6f88** — a zero byte, read back through the live pointer.
 *
 * The address is the `leaq`'s RIP-relative arithmetic, and the base is the NEXT instruction, not
 * the `leaq` itself: `0x2219b + 0x7c4ded = 0x7e6f88`. Measuring it from 0x22194 instead — the
 * seven-byte instruction's own address — would name a different literal seven bytes earlier, which
 * is the one decode mistake this line can make.
 *
 * The same VA is what the landed `OZLightingFolder_Factory::getBundleID` @Ozone 0x4b2820 resolves
 * to from a completely different displacement (0x33475d), which is a second, independent arrival at
 * this address.
 *
 * @Ozone 0x7e6f88
 */
const OZ_CHAN_SHAPE_MASK_REF_WITH_PICKER_FACTORY_BUNDLE_ID = ''; // @Ozone 0x7e6f88

/**
 * `OZChanShapeMaskRefWithPicker_Factory` — the Ozone factory singleton for the shape-mask channel
 * reference with a picker.
 *
 * No instance state is modelled: the one transcribed method never dereferences `this` (%rdi is dead
 * on entry, and there is no `(%rdi)` operand in the body at all). The layout will be grounded by
 * the constructor, which is not in this file.
 *
 * @Ozone 0x22190
 */
export class OZChanShapeMaskRefWithPicker_Factory {
  /**
   * `OZChanShapeMaskRefWithPicker_Factory::getBundleID()` -> char const*
   * @Ozone __ZN36OZChanShapeMaskRefWithPicker_Factory11getBundleIDEv @0x22190..0x2219c
   *
   * FULL DISASM — the whole function, five instructions:
   *   0x22190  pushq %rbp                      ; frame
   *   0x22191  movq  %rsp, %rbp
   *   0x22194  leaq  0x7c4ded(%rip), %rax      ; %rax = 0x2219b + 0x7c4ded = 0x7e6f88
   *                                            ; = const char *"" in __TEXT,__cstring
   *   0x2219b  popq  %rbp
   *   0x2219c  retq                            ; returns %rax
   *   0x2219d  nopl  (%rax)                    ; alignment padding, not executed
   *
   * The factory reports an EMPTY bundle id. Three things this port is careful about:
   *   * the returned value is a VALID POINTER TO an empty string, never NULL — modelling it as
   *     `null` would be a different value, and it is measured to be slide+0x7e6f88 on every call;
   *   * the RIP base is the next instruction (see the constant's doc comment above);
   *   * `this` is never read, so the answer cannot depend on instance state — which is what makes
   *     it safe to call on a factory that was never constructed.
   *
   * ORACLED against the live symbol (a local `t` symbol is still callable by address):
   * `raw-port/re/oracle/OZChanShapeMaskRefWithPicker_Factory_getBundleID_oracle.py`. Ozone loaded
   * OUTSIDE the app bundle under `arch -x86_64` through the shared `ozone_loader` `@rpath` chain,
   * the symbol's address taken from `nm -n -arch x86_64` rather than a bare `nm` that would answer
   * from the arm64 slice, and then six receivers — NULL, 1, 0xdeadbeef, the slide itself,
   * 0x7fffffffffff and 0x4141414141414141 — all returning the IDENTICAL pointer, `slide + 0x7e6f88`,
   * whose bytes read back as `b''`. Not one call returned NULL.
   *
   * Both controls are EXECUTED, not asserted: `getIconIDInternal` @0x221e0 driven through the same
   * wire returns 0xffffffff and is KILLED, which is what shows the pointer comparison discriminates
   * at all; and the bytes at the literal + 8 are `b'Woods_EnvMapIcon'`, which is what makes `b''`
   * at +0 a measurement rather than a property of the neighbourhood. That second control is worth
   * its own line: the literal is followed by seven MORE zero bytes of alignment padding, so the
   * obvious probe — read at +1 — also returns `b''` and would have "passed" while discriminating
   * nothing. It was tried first and it did exactly that.
   *
   * @returns `''` — always.
   */
  getBundleID(): string {
    // @0x22194 — leaq 0x7c4ded(%rip), %rax : the empty literal at VA 0x7e6f88.
    return OZ_CHAN_SHAPE_MASK_REF_WITH_PICKER_FACTORY_BUNDLE_ID;
  }
}
