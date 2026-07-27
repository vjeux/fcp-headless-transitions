// OZMaterialFactory — abstract intermediate base for OZ "material" factories in Ozone.framework.
//
// This class sits between OZFactory (ProChannel.framework) and concrete Ozone material factories
// (e.g. OZChanObjectManipRef_Factory, which is the immediately-derived class whose vtable slots
// 0xd0+ show up right after this class's own two dtor slots in the fixup stream). It provides
// no data members and no additional virtual methods of its own — its only reason to exist is
// to be a semantic tag ("material factory") within the OZFactory class hierarchy.
//
// TYPEINFO (Ozone __DATA_CONST @0x82B900, __si_class_type_info; dyld_info fixups):
//   +0x00  vptr           -> libc++/__ZTVN10__cxxabiv120__si_class_type_infoE + 0x10
//   +0x08  __type_name    -> "17OZMaterialFactory"  (__ZTS17OZMaterialFactory @0x70629c)
//   +0x10  __base_type    -> ProChannel/__ZTI9OZFactory
// => Single, non-virtual inheritance from ProChannel::OZFactory. Identical shape to
//    OZBehaviorFactory (see ./OZBehaviorFactory.ts) — an abstract intermediate tag class.
//
// VTABLE (Ozone __DATA_CONST @0x82B918, installed-ptr @0x82B928; dyld_info fixups):
//   The slots at offsets 0x00…0xc8 are the OZFactory vtable inherited unchanged. This class
//   introduces NO new overrides beyond the two dtor entries the compiler must emit:
//     *0x00  ~OZMaterialFactory()  D1  -> 0x6DADD0   (ud2 — abstract-class trap)
//     *0x08  ~OZMaterialFactory()  D0  -> 0x6DADE0   (ud2 — abstract-class trap)
//   The following fixup entries (slots 0xd0+) belong to the *next* class laid out by the linker
//   right after OZMaterialFactory — OZChanObjectManipRef_Factory — whose vtable begins at
//   0x82B9F0 (0xd0/8 = 26 slots later in the same __DATA_CONST region). resolve.py's
//   vtable.py walker prints those fall-through slots because it scans linearly until the next
//   installed-ptr fixup; they are NOT part of OZMaterialFactory.
//
// STRUCT LAYOUT:
//   OZMaterialFactory introduces NO new fields — its size equals that of OZFactory. There is
//   NO ctor symbol for OZMaterialFactory in the Ozone binary (nm shows only D0/D1) — concrete
//   derived classes (OZChanObjectManipRef_Factory, etc.) invoke OZFactory's ctor directly.
//
// FRONTIER (undecoded, intentionally opaque):
//   - OZFactory (ProChannel base) — not yet transcribed. Structural placeholder `OZFactoryBase`
//     mirrors what OZBehaviorFactory.ts does for the same superclass.

/**
 * Structural placeholder for ProChannel::OZFactory. The Ozone typeinfo at 0x82B900 declares
 * OZMaterialFactory : public OZFactory via __si_class_type_info with base = ProChannel/__ZTI9OZFactory.
 * The concrete class lives in ProChannel.framework and has not been transcribed yet; consumers
 * only need the identity for the inheritance chain.
 *
 * Kept structurally compatible with the same placeholder in ./OZBehaviorFactory.ts.
 */
export interface OZFactoryBase {
  readonly __ozFactoryBase: unique symbol;
}

/**
 * OZMaterialFactory — abstract factory base @Ozone.
 *
 * Marked `abstract` because the C++ class is abstract: both its D0 (0x6DADE0) and D1
 * (0x6DADD0) destructor entries are single `ud2` instructions (bytes 0F 0B), which is the
 * canonical Apple/clang shape for "compiler-emitted trap for an unreachable dtor thunk on
 * an abstract class". No constructor symbol exists in the Ozone binary either — only the
 * derived class ctors are emitted (e.g. OZChanObjectManipRef_Factory D1/D2 @0x1a690/0x1a6c0),
 * which invoke OZFactory's ctor directly.
 *
 * The class contributes zero new virtual methods on top of OZFactory — vtable slots 0x10…0xc8
 * are inherited byte-for-byte from the parent, only the D0/D1 pair at 0x00/0x08 is redirected
 * to this class's own trap thunks. This matches the OZBehaviorFactory shape exactly, minus
 * OZBehaviorFactory's canApplyToChannel override at slot 0xc8.
 */
export abstract class OZMaterialFactory {
  /**
   * OZMaterialFactory::~OZMaterialFactory() — D1 (complete-object dtor) @Ozone 0x6DADD0.
   *
   * Full disassembly (5 lines):
   *   6dadd0  pushq  %rbp
   *   6dadd1  movq   %rsp, %rbp
   *   6dadd4  ud2
   *   6dadd6  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` — abstract-class trap. Called only if the runtime somehow reaches a base-class
   * dtor entry directly (it shouldn't; all instances are of a concrete subclass and the
   * subclass's D1 chains up via the OZFactory dtor, not this trap). Ported as a raising stub
   * that cites the address, per anti-shortcut rules (an undecoded / unreachable trap must be
   * a loud gap, not a silent no-op).
   *
   * Vtable slot: *0x00 of OZMaterialFactory's vtable @0x82B918 (installed-ptr @0x82B928).
   */
  protected _dtorD1(): never {
    throw new Error(
      "OZMaterialFactory::~OZMaterialFactory() D1 @Ozone 0x6dadd0 is `ud2` — abstract-class trap, must never be reached",
    );
  }

  /**
   * OZMaterialFactory::~OZMaterialFactory() — D0 (deleting dtor) @Ozone 0x6DADE0.
   *
   * Full disassembly (5 lines):
   *   6dade0  pushq  %rbp
   *   6dade1  movq   %rsp, %rbp
   *   6dade4  ud2
   *   6dade6  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` — abstract-class trap (mirror of D1). Same rationale as _dtorD1.
   *
   * Vtable slot: *0x08 of OZMaterialFactory's vtable @0x82B918.
   */
  protected _dtorD0(): never {
    throw new Error(
      "OZMaterialFactory::~OZMaterialFactory() D0 @Ozone 0x6dade0 is `ud2` — abstract-class trap, must never be reached",
    );
  }
}
