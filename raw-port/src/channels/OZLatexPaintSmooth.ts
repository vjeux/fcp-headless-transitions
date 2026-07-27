// OZLatexPaintSmooth.ts — Ozone "Latex Paint (Smooth)" paint-material layer
// predicate. In FCP's Ozone renderer, paint-material layer classes advertise
// two boolean predicates that are queried by the higher-level material logic:
//
//   - `usesTexture(OZMaterialPaintLayer*)`     — does this paint layer sample
//     a bound texture during shading?
//   - `usesSurfaceType(OZMaterialPaintLayer*)` — does its shading depend on
//     the surface-type (matte/gloss/…) parameter?
//
// Both methods on OZLatexPaintSmooth are the trivial "no" answer: the Latex
// Paint Smooth variant is a flat, texture-independent, surface-type-independent
// paint layer. Apple emitted them as `xor eax,eax; ret` — literally two
// instructions returning 0 (the zero-extended 1-bit `bool` C++ return).
//
// Transcribed from FCP Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Disassembly reproduced verbatim below from
//   raw-port/re/disasm/OZLatexPaintSmooth.usesTexture.s
//   raw-port/re/disasm/OZLatexPaintSmooth.usesSurfaceType.s
//
//   __ZN18OZLatexPaintSmooth11usesTextureEP20OZMaterialPaintLayer:
//   0x622120  push  %rbp
//   0x622121  mov   %rsp, %rbp
//   0x622124  xor   %eax, %eax        ; return 0 (false)
//   0x622126  pop   %rbp
//   0x622127  retq
//
//   __ZN18OZLatexPaintSmooth15usesSurfaceTypeEP20OZMaterialPaintLayer:
//   0x622130  push  %rbp
//   0x622131  mov   %rsp, %rbp
//   0x622134  xor   %eax, %eax        ; return 0 (false)
//   0x622136  pop   %rbp
//   0x622137  retq
//
// Both methods completely ignore their `OZMaterialPaintLayer*` argument
// (rsi is never read after the prologue) — so we model it as an opaque
// unused parameter. The class instance (`this`, in rdi) is also unread,
// hence these are effectively `static constexpr bool` predicates keyed on
// the concrete class identity, exactly matching how FCP's dispatch resolves
// them via the vtable to reach these constant-returning slots.
//
// OZMaterialPaintLayer is a frontier class in this port; it is referenced
// only by opaque pointer here, so we forward-declare it as an unspecified
// nominal type. When that class is transcribed, it can be imported and
// substituted in-place with no behavioural change.

/**
 * Opaque forward declaration of the Ozone `OZMaterialPaintLayer` C++ class.
 * Only appears here as a never-dereferenced pointer parameter, mirroring the
 * disassembly (rsi is loaded on entry but never read). Full transcription
 * lives in a separate file when its owning class lands (frontier).
 */
export type OZMaterialPaintLayer = { readonly __brand: "OZMaterialPaintLayer" };

/**
 * OZLatexPaintSmooth — a paint-material layer type in Ozone whose "smooth
 * latex paint" shading model is both texture-independent and
 * surface-type-independent. The class carries no data reachable from these
 * two predicates (this-pointer is unused in the disassembled bodies), so we
 * model it as an empty class matching the ABI surface actually exercised.
 */
export class OZLatexPaintSmooth {
  /**
   * @see FCP Ozone `OZLatexPaintSmooth::usesTexture(OZMaterialPaintLayer*)`
   *      @0x0000000000622120
   *
   * Disassembly (verbatim, 3 semantic instructions after prologue):
   *   0x622124  xor  %eax, %eax        ; eax = 0
   *   0x622126  pop  %rbp
   *   0x622127  retq                   ; return (bool)0
   *
   * The `_layer` pointer arg is never read (rsi untouched). Returns the
   * literal boolean value 0 — this paint layer does not use a texture.
   */
  usesTexture(_layer: OZMaterialPaintLayer | null): boolean {
    // @0x622124 xor %eax, %eax  — the entire function body.
    return false;
  }

  /**
   * @see FCP Ozone `OZLatexPaintSmooth::usesSurfaceType(OZMaterialPaintLayer*)`
   *      @0x0000000000622130
   *
   * Disassembly (verbatim, 3 semantic instructions after prologue):
   *   0x622134  xor  %eax, %eax        ; eax = 0
   *   0x622136  pop  %rbp
   *   0x622137  retq                   ; return (bool)0
   *
   * The `_layer` pointer arg is never read (rsi untouched). Returns the
   * literal boolean value 0 — this paint layer does not depend on
   * surface-type.
   */
  usesSurfaceType(_layer: OZMaterialPaintLayer | null): boolean {
    // @0x622134 xor %eax, %eax  — the entire function body.
    return false;
  }
}
