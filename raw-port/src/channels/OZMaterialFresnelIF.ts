// OZMaterialFresnelIF — FCP Ozone framework "Fresnel material" interface.
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Symbols ported (nm -arch x86_64 | c++filt):
//   @0x34ca50  OZMaterialFresnelIF::getSequenceColorChannelIF()
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/OZMaterialFresnelIF.getSequenceColorChannelIF.s   @0x34ca50
//
// -----------------------------------------------------------------------------
// CLASS SHAPE
// -----------------------------------------------------------------------------
// OZMaterialFresnelIF is a pure-interface / mixin class in the OZMaterial* family
// (see OZMaterialGenericSubstanceIF.ts for the parallel port). Only one of its
// virtual overrides is emitted as a distinct exported symbol; every other slot
// is either inherited from a base interface or ICF-folded into a sibling class.
//
//   nm -arch x86_64 -U .../Ozone | c++filt | grep OZMaterialFresnelIF
//   → OZMaterialFresnelIF::getSequenceColorChannelIF()      @0x34ca50
//
// The one exported method is a default-nil hook — same pattern used by
// OZMaterialGenericSubstanceIF::getSequenceColorChannelIF()/getSequenceOpacityChannelIF()
// (returns nullptr; concrete subclasses override to return a real OZChannelIF).
//
// -----------------------------------------------------------------------------
// PER-METHOD DECODE
// -----------------------------------------------------------------------------
//
// getSequenceColorChannelIF()                                     @0x34ca50
//   __ZN19OZMaterialFresnelIF25getSequenceColorChannelIFEv:
//     0x34ca50  pushq  %rbp
//     0x34ca51  movq   %rsp, %rbp
//     0x34ca54  xorl   %eax, %eax        ; rax = 0 (nullptr)
//     0x34ca56  popq   %rbp
//     0x34ca57  retq
//     0x34ca58  nopl   (%rax,%rax)       ; alignment padding
//
//   → In TS: return null.

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

/**
 * OZMaterialFresnelIF — pure-interface / mixin for Fresnel-shaded materials
 * in Ozone. Only one method is emitted as its own symbol in the Ozone binary;
 * that method is a default-nil hook that concrete subclasses override.
 *
 * @provenance Ozone @0x34ca50
 */
export class OZMaterialFresnelIF {
  /**
   * getSequenceColorChannelIF() — @Ozone 0x34ca50.
   *
   *   pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
   *
   * Default-nil hook. Concrete Fresnel materials override to return a real
   * OZChannelIF; the base returns nullptr.
   *
   * @provenance Ozone @0x34ca50 (xorl %eax,%eax @0x34ca54)
   */
  getSequenceColorChannelIF(): null {
    return null; // @0x34ca54 `xorl %eax,%eax`
  }
}
