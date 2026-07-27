// OZSceneNodeFactory.ts — Ozone's abstract base class for every scene-node factory.
// Faithful transcription from x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// PURE-ABSTRACT FACTORY
// -----------------------------------------------------------------------------
// OZSceneNodeFactory is a POLYMORPHIC PURE-ABSTRACT BASE.  All non-destructor
// virtual slots in its own vtable are C++ ABI `__cxa_pure_virtual` stubs — they
// exist only so the ABI has a valid dispatch target if a caller invokes them
// through the abstract type; a real concrete subclass MUST override each one.
// Concrete factories include OZRotoshape_Factory, OZScribble_Factory, various
// generator/effect factories, etc.  They ALL override slots 0x10..0xb8 with
// their own `create`, `createCopy`, `createInstance`, `description`,
// `manufacturer`, `version`, `revision`, `getCategoryName`, `getBundleID`,
// `createNode`, `createNodeCopy`, `createNodeInstance`, etc.
//
// Vtable @0x827690; installed ptr 0x8276a0
// (resolved via `python3 raw-port/army/tools/resolve.py Ozone vtable OZSceneNodeFactory`):
//
//   *0x00 -> 0x6dad30  ~OZSceneNodeFactory (D1, in-place)     — traps (ud2)
//   *0x08 -> 0x6dad40  ~OZSceneNodeFactory (D0, deleting)     — traps (ud2)
//   *0x10 -> __cxa_pure_virtual   (create)
//   *0x18 -> __cxa_pure_virtual   (createCopy)
//   *0x20 -> __cxa_pure_virtual   (createInstance)
//   *0x28 -> __cxa_pure_virtual   (description)
//   *0x30 -> __cxa_pure_virtual   (unlocalizedDescription)
//   *0x38 -> __cxa_pure_virtual   (manufacturer)
//   *0x40 -> __cxa_pure_virtual   (version)
//   *0x48 -> __cxa_pure_virtual   (revision)
//   *0x50 -> __cxa_pure_virtual   (some sub-ABI slot — 0xe3e chained-fixup import)
//   *0x58 -> __cxa_pure_virtual   (0xe3d)
//   *0x60 -> __cxa_pure_virtual   (0xe3c)
//   *0x68 -> __cxa_pure_virtual   (0xe3b)
//   *0x70 -> __cxa_pure_virtual   (getCategoryName)
//   *0x78 -> __cxa_pure_virtual   (getEnglishCategoryName)
//   *0x80 -> __cxa_pure_virtual   (getBundleID)
//   *0x88 -> __cxa_pure_virtual   (getIconNameInternal)
//   *0x90 -> __cxa_pure_virtual   (getIconNameBWInternal)
//   *0x98 -> __cxa_pure_virtual   (getIconIDInternal)
//   *0xa0 -> __cxa_pure_virtual   (getLibraryIconNameInternal)
//   *0xa8 -> __cxa_pure_virtual   (createNode)
//   *0xb0 -> __cxa_pure_virtual   (createNodeCopy)
//   *0xb8 -> __cxa_pure_virtual   (createNodeInstance)
//   *0xc8 -> __cxa_pure_virtual   (0xe49 — trailing ABI slot)
//
// The vtable layout (mirrored exactly in OZRotoshape_Factory @0x827760) is the
// SHARED ABI that OZFactories::lookupFactory / OZApplication::createSceneNode /
// scene-node parsing paths call through when they hold a `OZSceneNodeFactory*`.
//
// -----------------------------------------------------------------------------
// D1 destructor — OZSceneNodeFactory::~OZSceneNodeFactory()  @0x6dad30
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Ozone_tV.txt line 1769449):
//     pushq %rbp
//     movq  %rsp, %rbp
//     ud2                       ; illegal-instruction trap  (aborts the process)
//     nopw  %cs:(%rax,%rax)
//
// The in-place destructor of the ABSTRACT base is unreachable in a well-formed
// program: an OZSceneNodeFactory can only exist as the base subobject of a
// concrete subclass, whose own D1 destructor tears down its members and then
// jumps to the base D1 — but here the base D1 body itself is `ud2`, meaning
// concrete subclasses are expected to bypass this and terminate the destructor
// chain themselves (or the compiler emitted this stub knowing every subclass
// must override).  Any actual call reaches `ud2` and traps.
//
// -----------------------------------------------------------------------------
// D0 destructor — OZSceneNodeFactory::~OZSceneNodeFactory()  @0x6dad40
// -----------------------------------------------------------------------------
// Disassembly (from /tmp/Ozone_tV.txt line 1769454):
//     pushq %rbp
//     movq  %rsp, %rbp
//     ud2                       ; illegal-instruction trap
//     nopw  %cs:(%rax,%rax)
//
// The deleting destructor form.  Same body — `ud2`.  Deleting an object
// through an `OZSceneNodeFactory*` is undefined; you must use a concrete
// subclass's D0 (installed at vtable slot 0x08 of that subclass — e.g.
// OZRotoshape_Factory::~OZRotoshape_Factory @0x8f10).
//
// -----------------------------------------------------------------------------
// TypeScript port
// -----------------------------------------------------------------------------
// TypeScript has no `abstract class` vtable emission semantics identical to
// C++'s Itanium ABI, but we preserve the intent: an `abstract` class whose
// virtual methods are declared abstract (compile-time pure-virtual), and
// whose destructor is modeled as a `dispose()` method that throws — matching
// the runtime behaviour of the compiled `ud2` (crash on invocation).

/**
 * Pure-abstract base class for all Ozone scene-node factories.
 *
 * Concrete subclasses (e.g. OZRotoshape_Factory) must override every virtual
 * method.  Directly instantiating or destroying an OZSceneNodeFactory is
 * undefined behaviour in the native binary (`ud2` traps the process).
 *
 * @see OZFactoryBase — the closely-related pure-abstract "asset" factory ABI.
 * @see OZBehaviorFactory — a parallel pure-abstract factory ABI (vtable @0x8289d8).
 *
 * Vtable  @0x827690  (Ozone.framework)
 * ~D1     @0x6dad30  ud2
 * ~D0     @0x6dad40  ud2
 */
export abstract class OZSceneNodeFactory {
  /**
   * D1/D0 destructor stub.  Matches the compiled `ud2` — the native binary
   * traps if either destructor form is actually invoked on an abstract
   * instance.  Concrete subclasses override.
   *
   * @asm ~OZSceneNodeFactory D1 @0x6dad30 : `pushq %rbp ; movq %rsp,%rbp ; ud2`
   * @asm ~OZSceneNodeFactory D0 @0x6dad40 : `pushq %rbp ; movq %rsp,%rbp ; ud2`
   */
  dispose(): void {
    throw new Error(
      "OZSceneNodeFactory::~OZSceneNodeFactory is `ud2` (abstract-base " +
        "destructor is unreachable — concrete subclass must override).",
    );
  }

  // ---------------------------------------------------------------------
  // Pure-virtual factory ABI  (vtable slots 0x10..0xc8 = __cxa_pure_virtual)
  // ---------------------------------------------------------------------
  // Each slot below mirrors a concrete subclass's override (naming taken from
  // OZRotoshape_Factory's demangled vtable dump).  Concrete ports must
  // implement these; the abstract base only declares them.

  /** @vtable *0x10  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::create @0x8f80 */
  abstract create(name: unknown /* PCString const& */, flags: number): unknown;
  /** @vtable *0x18  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::createCopy @0x90e0 */
  abstract createCopy(other: unknown /* OZFactoryBase* */, flags: number): unknown;
  /** @vtable *0x20  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::createInstance @0x9190 */
  abstract createInstance(other: unknown /* OZFactoryBase* */): unknown;
  /** @vtable *0x28  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::description @0x91a0 */
  abstract description(): unknown /* PCString */;
  /** @vtable *0x30  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::unlocalizedDescription @0x91d0 */
  abstract unlocalizedDescription(): unknown /* PCString */;
  /** @vtable *0x38  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::manufacturer @0x91f0 */
  abstract manufacturer(): unknown /* PCString */;
  /** @vtable *0x40  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::version @0x9210 */
  abstract version(): number;
  /** @vtable *0x48  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::revision @0x9220 */
  abstract revision(): number;

  // Slots *0x50..*0x68 (chained-fixup targets 0xe3b..0xe3e) are also
  // __cxa_pure_virtual on the abstract base; OZRotoshape_Factory ALSO leaves
  // them pure-virtual (it doesn't override them either).  Their concrete
  // meanings are not yet decoded — leaving as an unnamed abstract slot bag.
  /** @vtable *0x50  __cxa_pure_virtual (undecoded ABI slot) */
  abstract abstractSlot50(): unknown;
  /** @vtable *0x58  __cxa_pure_virtual (undecoded ABI slot) */
  abstract abstractSlot58(): unknown;
  /** @vtable *0x60  __cxa_pure_virtual (undecoded ABI slot) */
  abstract abstractSlot60(): unknown;
  /** @vtable *0x68  __cxa_pure_virtual (undecoded ABI slot) */
  abstract abstractSlot68(): unknown;

  /** @vtable *0x70  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getCategoryName @0x9230 */
  abstract getCategoryName(): unknown /* PCString */;
  /** @vtable *0x78  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getEnglishCategoryName @0x9250 */
  abstract getEnglishCategoryName(): unknown /* PCString */;
  /** @vtable *0x80  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getBundleID @0x9270 */
  abstract getBundleID(): unknown /* PCString */;
  /** @vtable *0x88  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getIconNameInternal @0x9280 */
  abstract getIconNameInternal(): unknown /* PCString */;
  /** @vtable *0x90  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getIconNameBWInternal @0x92a0 */
  abstract getIconNameBWInternal(): unknown /* PCString */;
  /** @vtable *0x98  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getIconIDInternal @0x92c0 */
  abstract getIconIDInternal(): number;
  /** @vtable *0xa0  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::getLibraryIconNameInternal @0x92d0 */
  abstract getLibraryIconNameInternal(): unknown /* PCString */;
  /** @vtable *0xa8  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::createNode @0x92f0 */
  abstract createNode(name: unknown /* PCString const& */, flags: number): unknown /* OZSceneNode* */;
  /** @vtable *0xb0  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::createNodeCopy @0x9300 */
  abstract createNodeCopy(source: unknown /* OZSceneNode* */, flags: number): unknown /* OZSceneNode* */;
  /** @vtable *0xb8  __cxa_pure_virtual — see e.g. OZRotoshape_Factory::createNodeInstance @0x9370 */
  abstract createNodeInstance(source: unknown /* OZSceneNode* */): unknown /* OZSceneNode* */;

  // Slot *0xc0 in OZSceneNodeFactory's own vtable is 0 (unused on the
  // abstract base); OZRotoshape_Factory fills it with an OZFontManager
  // singleton pointer, which is a subclass-specific decoration, not a
  // pure-virtual slot.  Nothing to declare on the abstract base.

  /** @vtable *0xc8  __cxa_pure_virtual (trailing ABI slot 0xe49) */
  abstract abstractSlotC8(): unknown;
}
