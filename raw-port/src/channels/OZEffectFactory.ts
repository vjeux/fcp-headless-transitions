// OZEffectFactory — abstract intermediate base for OZ "effect" factories in Ozone.framework.
//
// This class sits between OZFactory (ProChannel.framework) and concrete Ozone effect factories
// such as OZPrimatteRT_Factory (@0x18530/0x18560/0x18590/…). It contributes NO virtual
// overrides on top of OZFactory (unlike its sibling OZBehaviorFactory which overrides
// canApplyToChannel at slot 0xC8); it only re-emits the trap D1/D0 destructor thunks that
// Apple/clang ships for an unreachable abstract-class dtor entry. See raw-port/src/channels/
// OZBehaviorFactory.ts for the same shape one framework over.
//
// TYPEINFO (Ozone __DATA_CONST, x86_64 slice):
//   __ZTS15OZEffectFactory @0x705C9C  ->  "15OZEffectFactory"
//   __ZTI15OZEffectFactory @0x827208
//     +0x00  vptr           -> libc++/__ZTVN10__cxxabiv120__si_class_type_infoE + 0x10 (single-inheritance)
//     +0x08  __type_name    -> "15OZEffectFactory" (__ZTS above)
//     +0x10  __base_type    -> ProChannel/__ZTI9OZFactory  (single non-virtual base)
//   => Single, non-virtual inheritance from ProChannel::OZFactory (same as OZBehaviorFactory).
//
// VTABLE (Ozone __DATA_CONST @__ZTV15OZEffectFactory=0x82AE40; installed-ptr @0x82AE50):
//   Slot layout (x86_64 slice, `resolve.py Ozone vtable OZEffectFactory`):
//     *0x00  ~OZEffectFactory()  D1  -> 0x6DAD90   (ud2 — abstract-class trap)
//     *0x08  ~OZEffectFactory()  D0  -> 0x6DADA0   (ud2 — abstract-class trap)
//     *0x10 .. *0x48             -> 0xE48   (pure-virtual marker — inherited from OZFactory, unbound)
//     *0x50                      -> 0xE3E   (pure-virtual marker)
//     *0x58                      -> 0xE3D   (pure-virtual marker)
//     *0x60                      -> 0xE3C   (pure-virtual marker)
//     *0x68                      -> 0xE3B   (pure-virtual marker)
//     *0x70 .. *0xB8             -> 0xE48   (pure-virtual marker)
//     *0xC0                      -> 0x0     (pure-virtual placeholder — inherited create()/copy()/…)
//     *0xC8                      -> 0xEA1   (pure-virtual marker; canApplyToChannel is NOT overridden here,
//                                            in contrast to OZBehaviorFactory which installs 0xED10 at this slot)
//   Concrete subclasses (e.g. OZPrimatteRT_Factory) install real function pointers at 0xD0+:
//     *0xD0  ~OZPrimatteRT_Factory D1  -> 0x18530
//     *0xD8  ~OZPrimatteRT_Factory D0  -> 0x18560
//     *0xE0  OZPrimatteRT_Factory::create(PCString const&, unsigned int) -> 0x18590
//     *0xE8  OZPrimatteRT_Factory::createCopy(OZFactoryBase*, unsigned int) -> 0x18600
//     *0xF0  OZPrimatteRT_Factory::createInstance(OZFactoryBase*) -> 0x18670
//     *0xF8  OZPrimatteRT_Factory::description() -> 0x18680
//
// STRUCT LAYOUT:
//   OZEffectFactory introduces NO new fields — its size equals that of OZFactory. Consistent
//   with (a) no ctor symbol in Ozone (only concrete-subclass ctors exist), and (b) the vtable
//   adding no override slots and no additional data-accessor methods. Concrete subclasses
//   hold any singleton pointers themselves.
//
// FRONTIER (undecoded, intentionally left as opaque types):
//   - OZFactory (ProChannel base) — not yet transcribed. Kept as an opaque structural type
//     so this file compiles standalone; a full port will replace `OZFactoryBase` below with
//     the real class.
//   - OZPrimatteRT_Factory (concrete subclass) — not yet transcribed. Referenced in the
//     vtable comment above for context only; not depended on here.

/**
 * Structural placeholder for ProChannel::OZFactory (Ozone typeinfo @0x827208 declares
 * OZEffectFactory : public OZFactory via single-inheritance __si_class_type_info). The
 * concrete class lives in ProChannel.framework and has not been transcribed yet; consumers
 * of OZEffectFactory only need the identity.
 *
 * Mirrors the identical placeholder in ./OZBehaviorFactory.ts. Deliberately not a shared
 * import: at this stage each abstract-base file re-declares the sentinel so a future concrete
 * OZFactory port can slot in without touching the sibling factories.
 */
export interface OZFactoryBase {
  readonly __ozFactoryBase: unique symbol;
}

/**
 * OZEffectFactory — abstract factory base @Ozone.framework.
 *
 * Marked `abstract` because the C++ class is abstract: both its D1 (0x6DAD90) and D0
 * (0x6DADA0) destructor entries are single `ud2` instructions (bytes 0F 0B), which is the
 * canonical Apple/clang shape for "compiler-emitted trap for an unreachable dtor thunk on
 * an abstract class". No constructor symbol exists in the Ozone binary either — only
 * derived-class ctors are emitted (e.g. OZPrimatteRT_Factory D1/D2), which invoke
 * OZFactory's ctor directly. There is likewise no override of any inherited virtual: every
 * inherited slot in this class's vtable still points at ProChannel's pure-virtual markers
 * (small addrs 0xE3B..0xE48/0xEA1).
 */
export abstract class OZEffectFactory {
  /**
   * OZEffectFactory::~OZEffectFactory() — D1 (complete-object dtor) @Ozone 0x6DAD90.
   *
   * Disassembly (5 lines, x86_64 slice — see raw-port/re/disasm/OZEffectFactory.~OZEffectFactory.s):
   *   6dad90  pushq  %rbp
   *   6dad91  movq   %rsp, %rbp
   *   6dad94  ud2
   *   6dad96  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` @Ozone 0x6DAD90 — abstract-class trap. Called only if the runtime somehow
   * reaches this base-class dtor entry directly (it shouldn't; all live instances are of a
   * concrete subclass whose own D1 handles teardown and then chains to OZFactory's D1, never
   * to this thunk). Ported as a raising stub that cites the address, per anti-shortcut
   * rules (an undecoded / unreachable trap must be a loud gap, not a silent no-op).
   *
   * Vtable slot: *0x00.
   */
  protected _dtorD1(): never {
    throw new Error(
      "OZEffectFactory::~OZEffectFactory() D1 @Ozone 0x6dad90 is `ud2` — abstract-class trap, must never be reached",
    );
  }

  /**
   * OZEffectFactory::~OZEffectFactory() — D0 (deleting dtor) @Ozone 0x6DADA0.
   *
   * Disassembly (5 lines, x86_64 slice):
   *   6dada0  pushq  %rbp
   *   6dada1  movq   %rsp, %rbp
   *   6dada4  ud2
   *   6dada6  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` — abstract-class trap (mirror of D1). Same rationale as _dtorD1.
   *
   * Vtable slot: *0x08.
   */
  protected _dtorD0(): never {
    throw new Error(
      "OZEffectFactory::~OZEffectFactory() D0 @Ozone 0x6dada0 is `ud2` — abstract-class trap, must never be reached",
    );
  }
}
