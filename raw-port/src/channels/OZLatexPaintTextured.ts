// OZLatexPaintTextured.ts — FCP Ozone OZLatexPaintTextured: a paint-layer material
// classifier subclass whose three "does this layer use X?" queries are all constant true.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZLatexPaintTextured.*.s (captured via disasm.sh).
//
// SYMBOLS:
//   __ZN20OZLatexPaintTextured11usesTextureEP20OZMaterialPaintLayer       @0x00622140
//   __ZN20OZLatexPaintTextured15usesSurfaceTypeEP20OZMaterialPaintLayer   @0x00622150
//   __ZN20OZLatexPaintTextured16usesTextureDepthEP20OZMaterialPaintLayer  @0x00622160
//
// The class name implies OZLatexPaintTextured inherits from a common
// OZLatexPaint-family base (or the OZMaterialPaint virtual interface).  These
// three methods are its overrides of virtual predicates that return "yes, I use
// a texture / a surface type / a texture depth" — hence a hard-coded true.
// The `OZMaterialPaintLayer*` argument is ignored (no reads of rdi/rsi in any of
// the three disasms — the arg is dead).
//
// OZMaterialPaintLayer is a peer class we do NOT touch here (Rule 6).

/** Opaque tag for OZMaterialPaintLayer* — not decoded in this port. */
export interface OZMaterialPaintLayer {
  readonly _opaque: never;
}

export class OZLatexPaintTextured {
  /**
   * OZLatexPaintTextured::usesTexture(OZMaterialPaintLayer*)  @0x00622140
   *
   * ASM (@0x00622140..@0x00622147):
   *   pushq %rbp
   *   movq  %rsp,%rbp
   *   movb  $0x1,%al         ; return true
   *   popq  %rbp
   *   retq
   *
   * The %rsi argument (the OZMaterialPaintLayer pointer) is never referenced —
   * this override unconditionally reports "I use a texture".
   */
  usesTexture(_layer: OZMaterialPaintLayer): boolean {
    // @0x00622144: `movb $0x1, %al` — the entire body.
    return true;
  }

  /**
   * OZLatexPaintTextured::usesSurfaceType(OZMaterialPaintLayer*)  @0x00622150
   *
   * ASM (@0x00622150..@0x00622157):
   *   pushq %rbp
   *   movq  %rsp,%rbp
   *   movb  $0x1,%al         ; return true
   *   popq  %rbp
   *   retq
   */
  usesSurfaceType(_layer: OZMaterialPaintLayer): boolean {
    // @0x00622154: `movb $0x1, %al` — the entire body.
    return true;
  }

  /**
   * OZLatexPaintTextured::usesTextureDepth(OZMaterialPaintLayer*)  @0x00622160
   *
   * ASM (@0x00622160..@0x00622167):
   *   pushq %rbp
   *   movq  %rsp,%rbp
   *   movb  $0x1,%al         ; return true
   *   popq  %rbp
   *   retq
   */
  usesTextureDepth(_layer: OZMaterialPaintLayer): boolean {
    // @0x00622164: `movb $0x1, %al` — the entire body.
    return true;
  }
}
