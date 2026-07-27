// OZBehaviorFactory — abstract intermediate base for OZ "behavior" factories in Ozone.framework.
//
// This class sits between OZFactory (ProChannel.framework) and concrete Ozone behavior factories
// such as OZBehavior_Factory (@0xe660/…), OZSimulationBehavior_Factory (@0xee50/…),
// OZRigBehavior_Factory, etc. It contributes exactly one virtual override on top of OZFactory —
// canApplyToChannel — and provides no data members of its own.
//
// TYPEINFO (Ozone __DATA_CONST @0x862D30, __si_class_type_info; dyld_info fixups):
//   +0x00  vptr           -> libc++/__ZTVN10__cxxabiv120__si_class_type_infoE + 0x10
//   +0x08  __type_name    -> "17OZBehaviorFactory"  (__ZTS17OZBehaviorFactory)
//   +0x10  __base_type    -> ProChannel/__ZTI9OZFactory
// => Single, non-virtual inheritance from ProChannel::OZFactory.
//
// VTABLE (Ozone __DATA_CONST @0x8289D8, installed-ptr @0x8289E8; dyld_info fixups):
//   The 25 slots at offsets 0x00…0xc0 inherit unchanged from OZFactory's vtable and are not
//   redefined here (see raw-port/re/VERTEX_VTABLES.md/FRAMEWORK_MAP.md conventions). The only
//   slot introduced/overridden at this level is:
//     *0x00  ~OZBehaviorFactory()  D1  -> 0x6dad50   (ud2 — unreachable, class is abstract)
//     *0x08  ~OZBehaviorFactory()  D0  -> 0x6dad60   (ud2 — unreachable, class is abstract)
//     *0xc8  canApplyToChannel(OZChannelBase*) -> 0xed10   (returns true)
//   Slots 0xd0+ are populated by concrete subclasses (e.g. OZSimulationBehavior_Factory adds
//   create@0xf0, createCopy@0xf8, createInstance@0x100, description@0x108, etc.).
//
// STRUCT LAYOUT:
//   OZBehaviorFactory introduces NO new fields — its size equals that of OZFactory. This is
//   consistent with (a) no ctor/dtor bodies emitted by the compiler beyond the trapping D0/D1
//   thunks Apple ships for classes it never instantiates directly, and (b) the vtable adding
//   only a single method override with no additional data-member accessors elsewhere in the
//   binary. Concrete subclasses (OZBehavior_Factory & friends) hold the singleton pointers
//   (see e.g. OZBehavior_Factory::_instance / _instanceOnce at Ozone S 0x934e60 / 0x934e68).
//
// FRONTIER (undecoded, intentionally left as opaque types):
//   - OZFactory (ProChannel base) — not yet transcribed. Kept as an opaque structural type
//     so this file compiles standalone; a full port will replace `OZFactoryBase` below with
//     the real class.
//   - OZChannelBase — already ported in ./OZChannelBase.ts and imported for the exact signature.

import { OZChannelBase } from "./OZChannelBase.js";

/**
 * Structural placeholder for ProChannel::OZFactory (Ozone typeinfo @0x862D30 declares
 * OZBehaviorFactory : public OZFactory). The concrete class lives in ProChannel.framework
 * and has not been transcribed yet; consumers of OZBehaviorFactory only need the identity.
 */
export interface OZFactoryBase {
  readonly __ozFactoryBase: unique symbol;
}

/**
 * OZBehaviorFactory — abstract factory base @Ozone.
 *
 * Marked `abstract` because the C++ class is abstract: both its D0 (0x6dad60) and D1
 * (0x6dad50) destructor entries are single `ud2` instructions (bytes 0F 0B), which is the
 * canonical Apple/clang shape for "compiler-emitted trap for an unreachable dtor thunk on
 * an abstract class". No constructor symbol exists in the Ozone binary either — only the
 * derived class ctors are emitted (e.g. OZBehavior_Factory D1/D2, OZSimulationBehavior_Factory
 * D1/D2, …), which invoke OZFactory's ctor directly.
 */
export abstract class OZBehaviorFactory {
  /**
   * OZBehaviorFactory::canApplyToChannel(OZChannelBase*) — @Ozone 0xED10.
   *
   * Disassembly (7 lines total):
   *   ed10  pushq  %rbp
   *   ed11  movq   %rsp, %rbp
   *   ed14  movb   $0x1, %al
   *   ed16  popq   %rbp
   *   ed17  retq
   *   ed18  nopl   (%rax,%rax)
   *
   * Body: `return true;`. No reads of `this`, no reads of the argument. This is the base
   * predicate used by the behavior-application UI/logic to filter which channels a given
   * behavior factory may target; the default is "yes, applicable to any channel" and
   * subclasses override to narrow the set.
   *
   * Vtable slot: *0xC8 of OZBehaviorFactory (and inherited by all concrete subclasses that
   * don't override slot 0xC8 themselves).
   */
  canApplyToChannel(_channel: OZChannelBase): boolean {
    return true;
  }

  /**
   * OZBehaviorFactory::~OZBehaviorFactory() — D1 (complete-object dtor) @Ozone 0x6DAD50.
   *
   * Disassembly (5 lines):
   *   6dad50  pushq  %rbp
   *   6dad51  movq   %rsp, %rbp
   *   6dad54  ud2
   *   6dad56  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` @Ozone 0x6dad50 — abstract-class trap. Called only if the runtime somehow
   * reaches a base-class dtor entry directly (it shouldn't; all instances are of a concrete
   * subclass). Ported as a raising stub that cites the address, per anti-shortcut rules
   * (an undecoded / unreachable trap must be a loud gap, not a silent no-op).
   *
   * Vtable slot: *0x00.
   */
  protected _dtorD1(): never {
    throw new Error("OZBehaviorFactory::~OZBehaviorFactory() D1 @Ozone 0x6dad50 is `ud2` — abstract-class trap, must never be reached");
  }

  /**
   * OZBehaviorFactory::~OZBehaviorFactory() — D0 (deleting dtor) @Ozone 0x6DAD60.
   *
   * Disassembly (5 lines):
   *   6dad60  pushq  %rbp
   *   6dad61  movq   %rsp, %rbp
   *   6dad64  ud2
   *   6dad66  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` — abstract-class trap (mirror of D1). Same rationale as _dtorD1.
   *
   * Vtable slot: *0x08.
   */
  protected _dtorD0(): never {
    throw new Error("OZBehaviorFactory::~OZBehaviorFactory() D0 @Ozone 0x6dad60 is `ud2` — abstract-class trap, must never be reached");
  }
}
