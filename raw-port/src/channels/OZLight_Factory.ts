// OZLight_Factory.ts — raw transcription of Ozone `OZLight_Factory`.
//
// The scene-node factory for `OZLight`. ONE symbol is transcribed in this file
// — `createInstance(OZFactoryBase*)`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add them without their
// own disassembly and address citations: `createNode(PCString const&, unsigned
// int)`, `createNodeInstance(OZSceneNode*)`,
// `createNodeCopy(OZSceneNode*, unsigned int)`,
// `createCopy(OZFactoryBase*, unsigned int)`, `description()`,
// `unlocalizedDescription()`, `manufacturer()`, `getBundleID()`,
// `getCategoryName()`, `getEnglishCategoryName()`, `getIconIDInternal()`,
// `getIconNameInternal()`, `getIconNameBWInternal()`.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0xe300  OZLight_Factory::createInstance(OZFactoryBase*)
//              __ZN15OZLight_Factory14createInstanceEP13OZFactoryBase
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN15OZLight_Factory14createInstanceEP13OZFactoryBase Ozone`):
//   raw-port/re/disasm/__ZN15OZLight_Factory14createInstanceEP13OZFactoryBase.s (7 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// NONE is observable from this body: it reads no field of `this` (there is no
// `(%rdi)` memory operand anywhere) and no field of its argument. This file
// therefore models NO instance state — the factory's real layout must come from
// the ctor / `getInstance` units when those are ported.
//
// ---------------------------------------------------------------------------
// THE NULL RETURN IS THE FUNCTION, NOT A GAP
// ---------------------------------------------------------------------------
// `xorl %eax,%eax ; retq` is the WHOLE body: this override returns nullptr
// unconditionally. That is the shipped behaviour of the whole
// `*_Factory::createInstance(OZFactoryBase*)` family in Ozone, not an
// undecoded stub — `OZElement_Factory::createInstance` @0x85f0 and
// `OZChannelImageWithTransform_Factory::createInstance` @0x27000 (ported in its
// own file) are byte-for-byte the same five instructions, as are the
// `OZSceneNode_Factory` / `OZTransformNode_Factory` / `OZLayer_Factory` /
// `OZFootage_Factory` / `OZRotoshape_Factory` / `OZRotoMask_Factory` /
// `OZAudioTrackBase_Factory` bodies. (Cited as corroboration; each is its own
// ledger unit.) A light INSTANCE comes from this factory's other entry points —
// `createNode(PCString const&, unsigned int)` and
// `createNodeInstance(OZSceneNode*)` — which are their own ledger units and are
// deliberately absent here rather than stubbed.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `OZFactoryBase` — the factory-base pointer this override accepts and ignores.
 *
 * Structural placeholder, matching the landed `OZBehaviorFactory` /
 * `OZMaterialFactory` / `OZEffectFactory` ports: the concrete class lives in
 * ProChannel and has not been transcribed, and this body never dereferences the
 * pointer (it arrives in `%rsi` and is never read), so only its identity is
 * needed.
 *
 * @Ozone 0xe300
 */
export interface OZFactoryBase {
  readonly __ozFactoryBase: unique symbol;
}

/**
 * `OZLight_Factory` — the scene-node factory for `OZLight`.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor its argument (see the file header).
 *
 * @Ozone 0xe300
 */
export class OZLight_Factory {
  /**
   * `OZLight_Factory::createInstance(OZFactoryBase*)` — @Ozone 0xe300
   *   __ZN15OZLight_Factory14createInstanceEP13OZFactoryBase
   *
   * Full transcription — every instruction, in order:
   *
   *   0xe300  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0xe301  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0xe304  xorl  %eax,%eax             ; return value = 0 (nullptr)
   *   0xe306  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0xe307  retq
   *   0xe308  nopl  (%rax,%rax)           ; alignment padding, not executed
   *
   * Decode notes:
   *   * `xorl %eax,%eax` is the canonical "return 0" idiom; writing the 32-bit
   *     `%eax` zeroes all of `%rax`, so the returned POINTER is nullptr, not a
   *     truncated value.
   *   * the `OZFactoryBase*` argument in `%rsi` is never read — no conditional,
   *     no dereference, no call — so the result cannot depend on it. The
   *     parameter is kept (underscored) because it is part of the ABI signature
   *     this unit ports.
   *   * this is NOT a throw-stub standing in for undecoded work: the binary
   *     itself returns null here (see the file header's sibling evidence).
   *     Modelling it as a throw would be a WRONG port — callers of this
   *     override are meant to receive nullptr.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing).
   *
   * @param _factory the `OZFactoryBase*` in %rsi — unread by this body.
   * @returns `null` — always.
   */
  createInstance(_factory: OZFactoryBase | null): OZLight_Factory | null {
    // @0xe304  xorl %eax,%eax — return nullptr, unconditionally.
    return null;
  }
}
