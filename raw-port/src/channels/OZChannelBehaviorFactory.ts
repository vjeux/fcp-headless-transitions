// OZChannelBehaviorFactory — abstract intermediate base for OZ "channel-behavior" factories in
// Ozone.framework. Sits between OZBehaviorFactory (already ported, ./OZBehaviorFactory.ts) and
// concrete channel-behavior factories such as OZRetimingBehavior_Factory (@Ozone 0x12410/…) and
// the other OZChannelBehavior_Factory family. It contributes exactly one virtual override on top
// of its base — canApplyToChannel — narrowing the base's unconditional "true" to a flag-gated
// predicate, and provides no data members of its own.
//
// TYPEINFO (Ozone __DATA_CONST @0x829820, __si_class_type_info; dyld_info fixups):
//   +0x00  vptr        -> libc++/__ZTVN10__cxxabiv120__si_class_type_infoE + 0x10   @0x829820
//   +0x08  __type_name -> "24OZChannelBehaviorFactory"  (__ZTS24OZChannelBehaviorFactory) @0x829828
//   +0x10  __base_type -> Ozone/__ZTI17OZBehaviorFactory                              @0x829830
//  => Single, non-virtual inheritance from OZBehaviorFactory (which itself derives from
//     ProChannel::OZFactory — see ./OZBehaviorFactory.ts for the layer above).
//
// VTABLE (Ozone __DATA_CONST @0x829838, installed-ptr @0x829848; dyld_info fixups):
//   The slots inherit unchanged from OZBehaviorFactory's vtable except:
//     *0x00  ~OZChannelBehaviorFactory()  D1  -> 0x6dad70   (ud2 — unreachable, class is abstract)
//     *0x08  ~OZChannelBehaviorFactory()  D0  -> 0x6dad80   (ud2 — unreachable, class is abstract)
//     *0xc8  canApplyToChannel(OZChannelBase*)             -> 0x122c0   (this class's override)
//   The intermediate slots at 0x10..0xc0 are populated by inherited OZFactory thunks; the tool
//   dump beyond *0xd0 belongs to the NEXT vtable (OZRetimingBehavior_Factory @0x829908ish) and is
//   not part of THIS class.
//
// STRUCT LAYOUT:
//   OZChannelBehaviorFactory introduces NO new fields — its object size equals that of
//   OZBehaviorFactory. Evidence:
//     - No constructor symbol emitted in the Ozone binary (only the 3 methods
//       0x122c0/0x6dad70/0x6dad80 exist for the class).
//     - Both D0 (0x6dad80) and D1 (0x6dad70) are single `ud2` bytes, the canonical Apple/clang
//       shape for "compiler-emitted trap for an unreachable dtor thunk on an abstract class".
//     - No accessor methods reference any offset above what OZBehaviorFactory already covers.
//   Concrete subclasses (OZRetimingBehavior_Factory & the OZChannelBehavior_Factory family) hold
//   the singleton pointers (see e.g. Ozone S 0x931xxx entries per resolver dumps).
//
// FRONTIER (undecoded, intentionally left as opaque calls):
//   - OZChannelBase::testFlag(unsigned long long) @ProChannel — the only callee of the single
//     non-trap method here. Not yet transcribed in ./OZChannelBase.ts (only <flags> attr storage
//     is present; the flag-query predicate is missing). Routed through a THROWING stub that
//     cites its stub address so frontier.py catches the gap.
//   - OZBehaviorFactory (already ported at ./OZBehaviorFactory.ts) — imported and extended.

import { OZBehaviorFactory } from "./OZBehaviorFactory.js";
import { OZChannelBase } from "./OZChannelBase.js";

/**
 * OZChannelBase::testFlag(unsigned long long) — undecoded frontier stub.
 *
 * @ProChannel (imported via Ozone stub @0x6df57c ->
 *   __ZNK13OZChannelBase8testFlagEy). Bitmask predicate: given a 64-bit flag mask, returns
 * whether ANY (or ALL — semantics not yet decoded) of those bits are set on the channel's
 * `flags` word. Called from `OZChannelBehaviorFactory::canApplyToChannel` with mask 0x100.
 *
 * Per raw-port/army/PORTING_SPEC.md rule 3, an undecoded callee must throw citing its
 * address — a plausible guess (e.g. `(this.flags & BigInt(mask)) !== 0n`) would silently
 * corrupt canApplyToChannel's answer if ProChannel's semantics differ.
 */
function OZChannelBase_testFlag(_channel: OZChannelBase, _flagMask: bigint): boolean {
  throw new Error(
    "OZChannelBase::testFlag(unsigned long long) @ProChannel (Ozone stub 0x6df57c -> __ZNK13OZChannelBase8testFlagEy) not yet transcribed",
  );
}

/**
 * OZChannelBehaviorFactory — abstract factory base @Ozone.
 *
 * Marked `abstract` because the C++ class is abstract: both its D0 (0x6dad80) and D1
 * (0x6dad70) destructor entries are single `ud2` instructions (bytes 0F 0B), the canonical
 * Apple/clang shape for "compiler-emitted trap for an unreachable dtor thunk on an abstract
 * class". No constructor symbol exists in the Ozone binary either — only the derived class
 * ctors are emitted (e.g. OZRetimingBehavior_Factory D1/D2, OZChannelBehavior_Factory D1/D2),
 * each of which chains directly through OZBehaviorFactory into OZFactory's ctor.
 *
 * getInstance / create are NOT declared on this class — they belong to the concrete
 * derived _Factory singletons (visible in the vtable at *0xf0/*0xf8/*0x100 of e.g.
 * OZRetimingBehavior_Factory), NOT to this abstract intermediate.
 */
export abstract class OZChannelBehaviorFactory extends OZBehaviorFactory {
  /**
   * OZChannelBehaviorFactory::canApplyToChannel(OZChannelBase*) — @Ozone 0x122C0.
   *
   * Disassembly (10 lines total):
   *   122c0  pushq  %rbp
   *   122c1  movq   %rsp, %rbp
   *   122c4  movq   %rsi, %rdi                    ; arg1 (channel*) -> new this
   *   122c7  movl   $0x100, %esi                  ; imm mask 0x100
   *   122cc  callq  0x6df57c                      ; symbol stub for:
   *                                               ;   OZChannelBase::testFlag(unsigned long long)
   *   122d1  xorb   $0x1, %al                     ; flip low bit of the bool return
   *   122d3  popq   %rbp
   *   122d4  retq
   *   122d5  nopw   %cs:(%rax,%rax)
   *
   * Body: `return !channel->testFlag(0x100);`. The receiver of `testFlag` is the ARGUMENT
   * (the channel), not `this` — the emitted code moves rsi->rdi before the call. The 0x100
   * bit is the "opts-out of channel-behavior application" flag; a channel with that flag set
   * is REJECTED (this factory cannot apply its behaviors to it). Note this narrows the base
   * predicate: OZBehaviorFactory::canApplyToChannel (@0xed10) returns unconditional `true`;
   * this class returns `!testFlag(0x100)`.
   *
   * Vtable slot: *0xC8 of OZChannelBehaviorFactory (inherited by all concrete subclasses that
   * don't override slot 0xC8 themselves — e.g. OZRetimingBehavior_Factory does not appear to
   * override it based on the vtable layout at 0x829838).
   *
   * Note the ARGUMENT is unused as a `this` — the doc comment on the parameter reflects that
   * this method's receiver (`this`) is ignored, and the arg drives the whole call.
   */
  override canApplyToChannel(channel: OZChannelBase): boolean {
    // 0x122c4: movq %rsi,%rdi  — the channel argument becomes the receiver of testFlag.
    // 0x122c7: movl $0x100,%esi — mask literal 0x100 (bit 8 of the 64-bit flags word).
    // 0x122cc: callq testFlag  — imported stub -> OZChannelBase::testFlag(unsigned long long).
    // 0x122d1: xorb $0x1,%al   — logical NOT on the returned bool.
    const flagged = OZChannelBase_testFlag(channel, 0x100n);
    return !flagged;
  }

  /**
   * OZChannelBehaviorFactory::~OZChannelBehaviorFactory() — D1 (complete-object dtor) @Ozone 0x6DAD70.
   *
   * Disassembly (5 lines):
   *   6dad70  pushq  %rbp
   *   6dad71  movq   %rsp, %rbp
   *   6dad74  ud2
   *   6dad76  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` @Ozone 0x6dad70 — abstract-class trap. Called only if the runtime somehow
   * reaches a base-class dtor entry directly (it shouldn't; all instances are of a concrete
   * subclass). Ported as a raising stub that cites the address, per anti-shortcut rules
   * (an undecoded / unreachable trap must be a loud gap, not a silent no-op).
   *
   * Vtable slot: *0x00.
   */
  protected override _dtorD1(): never {
    throw new Error(
      "OZChannelBehaviorFactory::~OZChannelBehaviorFactory() D1 @Ozone 0x6dad70 is `ud2` — abstract-class trap, must never be reached",
    );
  }

  /**
   * OZChannelBehaviorFactory::~OZChannelBehaviorFactory() — D0 (deleting dtor) @Ozone 0x6DAD80.
   *
   * Disassembly (5 lines):
   *   6dad80  pushq  %rbp
   *   6dad81  movq   %rsp, %rbp
   *   6dad84  ud2
   *   6dad86  nopw   %cs:(%rax,%rax)
   *
   * Body: `ud2` — abstract-class trap (mirror of D1). Same rationale as _dtorD1.
   *
   * Vtable slot: *0x08.
   */
  protected override _dtorD0(): never {
    throw new Error(
      "OZChannelBehaviorFactory::~OZChannelBehaviorFactory() D0 @Ozone 0x6dad80 is `ud2` — abstract-class trap, must never be reached",
    );
  }
}
